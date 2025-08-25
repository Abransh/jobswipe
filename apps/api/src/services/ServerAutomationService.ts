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

  constructor(
    private fastify: any,
    private proxyRotator: ProxyRotator
  ) {
    super();

    this.serverId = `server_${randomUUID().substring(0, 8)}`;
    
    this.config = {
      pythonPath: process.env.PYTHON_PATH || 'python3',
      companiesPath: path.join(__dirname, '../../desktop/companies'),
      timeout: parseInt(process.env.SERVER_AUTOMATION_TIMEOUT || '120000'), // 2 minutes
      screenshotEnabled: process.env.SCREENSHOT_ENABLED !== 'false',
      screenshotPath: process.env.SCREENSHOT_PATH || '/tmp/jobswipe/screenshots',
      maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS || '5')
    };

    this.fastify.log.info(`ServerAutomationService initialized (${this.serverId})`);
    this.setupCleanup();
  }

  // =============================================================================
  // AUTOMATION EXECUTION
  // =============================================================================

  /**
   * Execute automation for a job application
   */
  async executeAutomation(request: ServerAutomationRequest): Promise<ServerAutomationResult> {
    const startTime = Date.now();
    const { applicationId, companyAutomation } = request;

    this.fastify.log.info(`Starting server automation: ${applicationId} (${companyAutomation})`);

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
      
      // Execute the automation
      const result = await this.runPythonAutomation(request, proxy);
      
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

      this.fastify.log.info(`Server automation completed: ${applicationId} (${result.success ? 'SUCCESS' : 'FAILURE'})`);
      this.emit('automation-completed', result);

      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.fastify.log.error(`Server automation failed: ${applicationId} - ${errorMessage}`);

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

      this.emit('automation-failed', failureResult);
      return failureResult;
    }
  }

  /**
   * Execute Python automation script
   */
  private async runPythonAutomation(
    request: ServerAutomationRequest, 
    proxy: ProxyConfig | null
  ): Promise<ServerAutomationResult> {
    const { applicationId, companyAutomation } = request;

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
          this.fastify.log.debug(`[${applicationId}] STDOUT: ${output.trim()}`);
          this.emit('process-output', { applicationId, type: 'stdout', data: output });
        });

        // Collect stderr
        pythonProcess.stderr?.on('data', (data) => {
          const output = data.toString();
          stderr += output;
          this.fastify.log.debug(`[${applicationId}] STDERR: ${output.trim()}`);
          this.emit('process-output', { applicationId, type: 'stderr', data: output });
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