/**
 * @fileoverview Server Automation Service
 * @description Server-side job application automation using Python scripts
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { ProxyRotator, ProxyConfig } from './ProxyRotator';
import { PythonBridge, PythonExecutionRequest, PythonExecutionResult } from './PythonBridge';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export interface ServerAutomationRequest {
  userId: string;
  jobId: string;
  applicationId: string;
  companyAutomation: string;
  userProfile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    resumeUrl?: string;
    currentTitle?: string;
    yearsExperience?: number;
    skills?: string[];
    currentLocation?: string;
    linkedinUrl?: string;
    workAuthorization?: string;
    coverLetter?: string;
    customFields?: Record<string, any>;
  };
  jobData: {
    id: string;
    title: string;
    company: string;
    applyUrl: string;
    location?: string;
    description?: string;
    requirements?: string[];
  };
  options?: {
    headless?: boolean;
    timeout?: number;
    maxRetries?: number;
  };
}

export interface ServerAutomationResult {
  success: boolean;
  applicationId: string;
  confirmationNumber?: string;
  executionTime: number;
  companyAutomation: string;
  status: string;
  error?: string;
  steps: Array<{
    stepName: string;
    action: string;
    success: boolean;
    timestamp: string;
    durationMs?: number;
    errorMessage?: string;
  }>;
  screenshots: string[];
  captchaEvents: Array<{
    captchaType: string;
    detectedAt: string;
    resolved: boolean;
    resolutionMethod?: string;
  }>;
  proxyUsed?: string;
  serverInfo: {
    serverId: string;
    executionMode: string;
    pythonVersion?: string;
    processingTime: number;
  };
}

export interface ExecutionConfig {
  pythonPath: string;
  companiesPath: string;
  timeout: number;
  screenshotEnabled: boolean;
  screenshotPath: string;
  maxConcurrentJobs: number;
}

// =============================================================================
// SERVER AUTOMATION SERVICE
// =============================================================================

export class ServerAutomationService extends EventEmitter {
  private activeProcesses = new Map<string, ChildProcess>();
  private config: ExecutionConfig;
  private serverId: string;
  private pythonBridge: PythonBridge;

  constructor(
    private fastify: any,
    private proxyRotator: ProxyRotator
  ) {
    super();

    this.serverId = `server_${randomUUID().substring(0, 8)}`;
    
    this.config = {
      pythonPath: process.env.PYTHON_PATH || path.join(__dirname, '../../../../venv/bin/python'),
      companiesPath: process.env.PYTHON_COMPANIES_PATH || path.join(__dirname, '../../../desktop/companies'),
      timeout: parseInt(process.env.SERVER_AUTOMATION_TIMEOUT || '120000'), // 2 minutes
      screenshotEnabled: process.env.SCREENSHOT_ENABLED !== 'false',
      screenshotPath: process.env.SCREENSHOT_PATH || '/tmp/jobswipe/screenshots',
      maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS || '5')
    };

    // Initialize Python Bridge
    this.pythonBridge = new PythonBridge(this.fastify, {
      pythonPath: this.config.pythonPath,
      companiesPath: this.config.companiesPath,
      timeout: this.config.timeout,
      screenshotEnabled: this.config.screenshotEnabled,
      screenshotPath: this.config.screenshotPath,
      maxRetries: 3
    });

    this.fastify.log.info(`ServerAutomationService initialized (${this.serverId})`);
    this.fastify.log.info(`Companies path: ${this.config.companiesPath}`);
    
    this.setupCleanup();
    this.validateCompaniesPath();
  }

  // =============================================================================
  // VALIDATION & SETUP
  // =============================================================================

  /**
   * Validate that companies path exists and log available automations
   */
  private async validateCompaniesPath(): Promise<void> {
    try {
      await fs.access(this.config.companiesPath);
      this.fastify.log.info(`✅ Companies directory found: ${this.config.companiesPath}`);
      
      const companies = await fs.readdir(this.config.companiesPath, { withFileTypes: true });
      const availableCompanies = companies
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
        .map(dirent => dirent.name);
      
      this.fastify.log.info(`📁 Available company automations: ${availableCompanies.join(', ')}`);
      
      for (const company of availableCompanies) {
        const scriptPath = path.join(this.config.companiesPath, company, 'run_automation.py');
        try {
          await fs.access(scriptPath);
          this.fastify.log.info(`✅ ${company} automation script found`);
        } catch {
          this.fastify.log.warn(`⚠️ ${company} automation script missing: ${scriptPath}`);
        }
      }
    } catch (error) {
      this.fastify.log.error(`❌ Companies directory not found: ${this.config.companiesPath}`);
      this.fastify.log.error(`Path resolution error: ${error instanceof Error ? error.message : error}`);
    }
  }

  // =============================================================================
  // AUTOMATION EXECUTION
  // =============================================================================

  /**
   * Execute automation for a job application
   */
  async executeAutomation(request: ServerAutomationRequest, correlationId?: string): Promise<ServerAutomationResult> {
    const startTime = Date.now();
    const { applicationId, companyAutomation } = request;
    const logContext = {
      correlationId: correlationId || `auto_${applicationId}`,
      applicationId,
      companyAutomation,
      userId: request.userId,
      jobId: request.jobId,
      serverId: this.serverId
    };

    this.fastify.log.info({
      ...logContext,
      event: 'server_automation_started',
      message: `Starting server automation for ${companyAutomation}`,
      jobTitle: request.jobData.title,
      company: request.jobData.company
    });

    // Check concurrency limits
    if (this.activeProcesses.size >= this.config.maxConcurrentJobs) {
      throw new Error(`Maximum concurrent jobs (${this.config.maxConcurrentJobs}) reached`);
    }

    // Validate company automation exists
    if (!this.isCompanySupported(companyAutomation)) {
      throw new Error(`Unsupported company automation: ${companyAutomation}`);
    }

    try {
      // Get proxy for this automation
      const proxy = await this.proxyRotator.getNextProxy();
      
      // Execute the automation using Python Bridge
      const result = await this.executeWithPythonBridge(request, proxy, logContext.correlationId);
      
      // Report proxy success
      if (proxy && result.success) {
        await this.proxyRotator.reportProxyHealth(proxy.id, true, result.executionTime);
      } else if (proxy && !result.success) {
        await this.proxyRotator.reportProxyHealth(proxy.id, false, undefined, result.error);
      }

      // Add server metadata
      result.serverInfo = {
        serverId: this.serverId,
        executionMode: 'server',
        processingTime: Date.now() - startTime
      };

      if (proxy) {
        result.proxyUsed = `${proxy.host}:${proxy.port}`;
      }

      this.fastify.log.info({
        ...logContext,
        event: 'server_automation_completed',
        message: 'Server automation completed',
        success: result.success,
        executionTimeMs: result.executionTime,
        confirmationNumber: result.confirmationNumber,
        stepsCompleted: result.steps.length,
        screenshotsTaken: result.screenshots.length,
        captchaEvents: result.captchaEvents.length
      });
      
      // Emit automation events for WebSocket integration
      this.emit('automation-completed', { 
        ...result, 
        correlationId: logContext.correlationId,
        userId: request.userId,
        applicationId: request.applicationId,
        jobData: request.jobData,
        completedAt: new Date().toISOString()
      });

      // Emit to WebSocket service if available
      if (this.fastify.websocket) {
        this.fastify.websocket.emitToUser(request.userId, 'automation-completed', {
          applicationId: request.applicationId,
          status: 'completed',
          success: result.success,
          jobTitle: request.jobData.title,
          company: request.jobData.company,
          completedAt: new Date().toISOString(),
          confirmationNumber: result.confirmationNumber,
          executionTime: result.executionTime,
          message: result.success 
            ? 'Job application completed successfully!' 
            : 'Job application automation failed'
        });
      }

      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.fastify.log.error({
        ...logContext,
        event: 'server_automation_failed',
        message: 'Server automation failed with error',
        error: errorMessage,
        executionTimeMs: executionTime,
        errorStack: error instanceof Error ? error.stack : undefined
      });

      const failureResult: ServerAutomationResult = {
        success: false,
        applicationId,
        executionTime,
        companyAutomation,
        status: 'failed',
        error: errorMessage,
        steps: [],
        screenshots: [],
        captchaEvents: [],
        serverInfo: {
          serverId: this.serverId,
          executionMode: 'server',
          processingTime: executionTime
        }
      };

      // Emit automation events for WebSocket integration
      this.emit('automation-failed', {
        ...failureResult,
        userId: request.userId,
        applicationId: request.applicationId,
        jobData: request.jobData,
        failedAt: new Date().toISOString(),
        correlationId: logContext.correlationId
      });

      // Emit to WebSocket service if available
      if (this.fastify.websocket) {
        this.fastify.websocket.emitToUser(request.userId, 'automation-failed', {
          applicationId: request.applicationId,
          status: 'failed',
          jobTitle: request.jobData.title,
          company: request.jobData.company,
          failedAt: new Date().toISOString(),
          error: errorMessage,
          executionTime,
          retryAvailable: true,
          message: 'Job application automation failed'
        });
      }

      return failureResult;
    }
  }

  /**
   * Execute automation using Python Bridge
   */
  private async executeWithPythonBridge(
    request: ServerAutomationRequest, 
    proxy: ProxyConfig | null,
    correlationId: string
  ): Promise<ServerAutomationResult> {
    // Transform ServerAutomationRequest to PythonExecutionRequest
    const pythonRequest: PythonExecutionRequest = {
      applicationId: request.applicationId,
      correlationId,
      userId: request.userId,
      jobData: request.jobData,
      userProfile: request.userProfile,
      automationConfig: {
        headless: request.options?.headless !== false,
        timeout: request.options?.timeout || this.config.timeout,
        maxRetries: request.options?.maxRetries || 3,
        screenshotEnabled: this.config.screenshotEnabled,
        screenshotPath: this.config.screenshotPath
      },
      proxyConfig: proxy ? {
        host: proxy.host,
        port: proxy.port,
        username: proxy.username,
        password: proxy.password,
        type: proxy.proxyType
      } : undefined
    };

    // Execute using Python Bridge
    const pythonResult = await this.pythonBridge.executePythonAutomation(
      request.companyAutomation, 
      pythonRequest
    );

    // Convert PythonExecutionResult to ServerAutomationResult
    return {
      success: pythonResult.success,
      applicationId: pythonResult.applicationId,
      confirmationNumber: pythonResult.confirmationNumber,
      executionTime: pythonResult.executionTimeMs,
      companyAutomation: request.companyAutomation,
      status: pythonResult.success ? 'success' : 'failed',
      error: pythonResult.error,
      steps: pythonResult.steps,
      screenshots: pythonResult.screenshots,
      captchaEvents: pythonResult.captchaEvents,
      proxyUsed: proxy ? `${proxy.host}:${proxy.port}` : undefined,
      serverInfo: {
        serverId: this.serverId,
        executionMode: 'server',
        pythonVersion: pythonResult.metadata.pythonVersion,
        processingTime: pythonResult.executionTimeMs
      }
    };
  }

  /**
   * Execute Python automation script (LEGACY - Kept for compatibility)
   */
  private async runPythonAutomation(
    request: ServerAutomationRequest, 
    proxy: ProxyConfig | null
  ): Promise<ServerAutomationResult> {
    const { applicationId, companyAutomation } = request;
    
    // Create log context for legacy method
    const logContext = {
      correlationId: `legacy_${applicationId}`,
      applicationId,
      companyAutomation,
      userId: request.userId,
      jobId: request.jobId,
      serverId: this.serverId
    };

    return new Promise(async (resolve, reject) => {
      try {
        // Create environment variables for Python script
        const env = await this.createExecutionEnvironment(request, proxy);

        // Path to the company automation script
        const scriptPath = path.join(this.config.companiesPath, companyAutomation, 'run_automation.py');

        // Verify script exists
        try {
          await fs.access(scriptPath);
        } catch {
          throw new Error(`Automation script not found: ${scriptPath}`);
        }

        // Spawn Python process
        const pythonProcess = spawn(this.config.pythonPath, [scriptPath], {
          env,
          cwd: path.join(this.config.companiesPath, companyAutomation),
          stdio: ['pipe', 'pipe', 'pipe']
        });

        this.activeProcesses.set(applicationId, pythonProcess);

        let stdout = '';
        let stderr = '';
        const startTime = Date.now();

        // Collect stdout
        pythonProcess.stdout?.on('data', (data) => {
          const output = data.toString();
          stdout += output;
          this.fastify.log.debug({
            ...logContext,
            event: 'python_process_stdout',
            message: 'Python process output',
            output: output.trim()
          });
          this.emit('process-output', { 
            applicationId, 
            type: 'stdout', 
            data: output, 
            correlationId: logContext.correlationId 
          });
        });

        // Collect stderr
        pythonProcess.stderr?.on('data', (data) => {
          const output = data.toString();
          stderr += output;
          this.fastify.log.debug({
            ...logContext,
            event: 'python_process_stderr',
            message: 'Python process error output',
            output: output.trim()
          });
          this.emit('process-output', { 
            applicationId, 
            type: 'stderr', 
            data: output, 
            correlationId: logContext.correlationId 
          });
        });

        // Handle process completion
        pythonProcess.on('close', (code) => {
          this.activeProcesses.delete(applicationId);
          const executionTime = Date.now() - startTime;

          if (code === 0) {
            try {
              const result = this.parseAutomationResult(stdout, request, executionTime);
              resolve(result);
            } catch (parseError) {
              reject(new Error(`Failed to parse automation result: ${parseError}`));
            }
          } else {
            reject(new Error(`Python process failed with code ${code}: ${stderr}`));
          }
        });

        // Handle process errors
        pythonProcess.on('error', (error) => {
          this.activeProcesses.delete(applicationId);
          reject(new Error(`Failed to start Python process: ${error.message}`));
        });

        // Set timeout
        setTimeout(() => {
          if (this.activeProcesses.has(applicationId)) {
            pythonProcess.kill('SIGTERM');
            setTimeout(() => {
              if (this.activeProcesses.has(applicationId)) {
                pythonProcess.kill('SIGKILL');
              }
            }, 5000);
            reject(new Error(`Automation timed out after ${this.config.timeout}ms`));
          }
        }, this.config.timeout);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Create execution environment for Python script
   */
  private async createExecutionEnvironment(
    request: ServerAutomationRequest, 
    proxy: ProxyConfig | null
  ): Promise<NodeJS.ProcessEnv> {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      
      // Execution mode
      EXECUTION_MODE: 'server',
      DATA_SOURCE: 'database',
      
      // Database connection
      DATABASE_URL: process.env.DATABASE_URL,
      
      // User and job identifiers
      USER_ID: request.userId,
      JOB_ID: request.jobId,
      APPLICATION_ID: request.applicationId,
      
      // AI API keys
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
      
      // Automation configuration
      AUTOMATION_HEADLESS: (request.options?.headless !== false).toString(),
      AUTOMATION_TIMEOUT: (request.options?.timeout || this.config.timeout).toString(),
      SCREENSHOT_ENABLED: this.config.screenshotEnabled.toString(),
      SCREENSHOT_PATH: this.config.screenshotPath,
      
      // Server identification
      SERVER_ID: this.serverId,
      
      // Proxy configuration
      PROXY_CONFIG: proxy ? JSON.stringify({
        host: proxy.host,
        port: proxy.port,
        username: proxy.username,
        password: proxy.password,
        type: proxy.proxyType
      }) : undefined
    };

    // Ensure screenshot directory exists
    if (this.config.screenshotEnabled) {
      await fs.mkdir(this.config.screenshotPath, { recursive: true });
    }

    return env;
  }

  /**
   * Parse automation result from Python output
   */
  private parseAutomationResult(
    stdout: string, 
    request: ServerAutomationRequest, 
    executionTime: number
  ): ServerAutomationResult {
    try {
      // Look for JSON result in stdout
      const lines = stdout.trim().split('\n');
      const jsonLine = lines.find(line => {
        const trimmed = line.trim();
        return trimmed.startsWith('{') && trimmed.endsWith('}');
      });

      if (!jsonLine) {
        throw new Error('No JSON result found in Python output');
      }

      const pythonResult = JSON.parse(jsonLine);

      // Convert Python result to TypeScript format
      return {
        success: pythonResult.success || false,
        applicationId: request.applicationId,
        confirmationNumber: pythonResult.confirmation_number,
        executionTime: pythonResult.execution_time_ms || executionTime,
        companyAutomation: request.companyAutomation,
        status: pythonResult.success ? 'success' : 'failed',
        error: pythonResult.error_message,
        steps: (pythonResult.steps || []).map((step: any) => ({
          stepName: step.step_name || 'unknown',
          action: step.action || '',
          success: step.success || false,
          timestamp: step.timestamp || new Date().toISOString(),
          durationMs: step.duration_ms,
          errorMessage: step.error_message
        })),
        screenshots: pythonResult.screenshots || [],
        captchaEvents: (pythonResult.captcha_events || []).map((event: any) => ({
          captchaType: event.captcha_type || 'unknown',
          detectedAt: event.detected_at || new Date().toISOString(),
          resolved: event.resolved || false,
          resolutionMethod: event.resolution_method
        })),
        serverInfo: {
          serverId: this.serverId,
          executionMode: 'server',
          pythonVersion: pythonResult.python_version,
          processingTime: executionTime
        }
      };

    } catch (error) {
      throw new Error(`Failed to parse Python result: ${error}`);
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Check if company automation is supported
   */
  private isCompanySupported(companyAutomation: string): boolean {
    const supportedCompanies = ['greenhouse', 'linkedin'];
    return supportedCompanies.includes(companyAutomation);
  }

  /**
   * Get supported companies
   */
  public getSupportedCompanies(): string[] {
    return ['greenhouse', 'linkedin'];
  }

  /**
   * Detect company automation type from job URL
   */
  public detectCompanyType(applyUrl: string): string {
    const url = applyUrl.toLowerCase();
    
    if (url.includes('greenhouse.io') || url.includes('grnh.se')) {
      return 'greenhouse';
    }
    
    if (url.includes('linkedin.com')) {
      return 'linkedin';
    }
    
    // Add more company detection logic as needed
    // For now, default to greenhouse as it's the most complete automation
    return 'greenhouse';
  }

  /**
   * Get current status
   */
  public getStatus(): {
    serverId: string;
    activeJobs: number;
    maxConcurrentJobs: number;
    status: 'healthy' | 'busy' | 'overloaded';
  } {
    const activeJobs = this.activeProcesses.size;
    let status: 'healthy' | 'busy' | 'overloaded' = 'healthy';
    
    if (activeJobs >= this.config.maxConcurrentJobs) {
      status = 'overloaded';
    } else if (activeJobs > this.config.maxConcurrentJobs * 0.8) {
      status = 'busy';
    }

    return {
      serverId: this.serverId,
      activeJobs,
      maxConcurrentJobs: this.config.maxConcurrentJobs,
      status
    };
  }

  /**
   * Stop specific automation
   */
  public async stopAutomation(applicationId: string): Promise<boolean> {
    const process = this.activeProcesses.get(applicationId);
    if (!process) {
      return false;
    }

    process.kill('SIGTERM');
    setTimeout(() => {
      if (this.activeProcesses.has(applicationId)) {
        process.kill('SIGKILL');
      }
    }, 5000);

    this.activeProcesses.delete(applicationId);
    this.fastify.log.info(`Stopped automation: ${applicationId}`);
    return true;
  }

  /**
   * Stop all active automations
   */
  public async stopAllAutomations(): Promise<void> {
    const activeIds = Array.from(this.activeProcesses.keys());
    this.fastify.log.info(`Stopping ${activeIds.length} active automations`);

    const stopPromises = activeIds.map(id => this.stopAutomation(id));
    await Promise.allSettled(stopPromises);

    this.fastify.log.info('All automations stopped');
  }

  // =============================================================================
  // CLEANUP
  // =============================================================================

  /**
   * Setup cleanup handlers
   */
  private setupCleanup(): void {
    const cleanup = async () => {
      this.fastify.log.info('ServerAutomationService cleanup starting...');
      await this.stopAllAutomations();
      this.fastify.log.info('ServerAutomationService cleanup completed');
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);
  }

  /**
   * Manual cleanup
   */
  public async cleanup(): Promise<void> {
    await this.stopAllAutomations();
    this.emit('cleanup-completed');
  }
}