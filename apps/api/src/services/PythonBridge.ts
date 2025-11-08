/**
 * @fileoverview Python-TypeScript Communication Bridge
 * @description Standardized interface for passing data to Python automation scripts
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { spawn, ChildProcess } from 'child_process';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { EventEmitter } from 'events';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export interface PythonExecutionRequest {
  applicationId: string;
  correlationId: string;
  userId: string;
  jobData: {
    id: string;
    title: string;
    company: string;
    applyUrl: string;
    location?: string;
    description?: string;
    requirements?: string[];
  };
  userProfile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    resumeUrl?: string;
    resumeLocalPath?: string;
    currentTitle?: string;
    yearsExperience?: number;
    skills?: string[];
    currentLocation?: string;
    linkedinUrl?: string;
    workAuthorization?: string;
    coverLetter?: string;
    customFields?: Record<string, any>;
  };
  automationConfig: {
    headless?: boolean;
    timeout?: number;
    maxRetries?: number;
    screenshotEnabled?: boolean;
    screenshotPath?: string;
  };
  proxyConfig?: {
    host: string;
    port: number;
    username?: string;
    password?: string;
    type: string;
  };
}

export interface PythonExecutionResult {
  success: boolean;
  applicationId: string;
  correlationId: string;
  executionTimeMs: number;
  confirmationNumber?: string;
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
  metadata: {
    pythonVersion?: string;
    aiModel?: string;
    browserVersion?: string;
    proxyUsed?: string;
    serverInfo?: Record<string, any>;
  };
}

export interface PythonBridgeConfig {
  pythonPath: string;
  companiesPath: string;
  timeout: number;
  screenshotEnabled: boolean;
  screenshotPath: string;
  maxRetries: number;
}

// =============================================================================
// PYTHON BRIDGE SERVICE
// =============================================================================

export class PythonBridge extends EventEmitter {
  private config: PythonBridgeConfig;
  private activeProcesses = new Map<string, ChildProcess>();

  constructor(private fastify: any, config?: Partial<PythonBridgeConfig>) {
    super();

    this.config = {
      pythonPath: config?.pythonPath || process.env.PYTHON_PATH || path.join(__dirname, '../../../desktop/venv/bin/python'),
      // Updated to point to unified automation engine
      companiesPath: config?.companiesPath || process.env.PYTHON_COMPANIES_PATH || path.join(__dirname, '../../../../packages/automation-engine/scripts'),
      timeout: config?.timeout || parseInt(process.env.PYTHON_TIMEOUT || '120000'), // 2 minutes
      screenshotEnabled: config?.screenshotEnabled ?? (process.env.SCREENSHOT_ENABLED !== 'false'),
      screenshotPath: config?.screenshotPath || process.env.SCREENSHOT_PATH || '/tmp/jobswipe/screenshots',
      maxRetries: config?.maxRetries || parseInt(process.env.PYTHON_MAX_RETRIES || '3')
    };

    this.fastify.log.info({
      event: 'python_bridge_initialized',
      message: 'Python Bridge initialized',
      config: {
        pythonPath: this.config.pythonPath,
        companiesPath: this.config.companiesPath,
        timeout: this.config.timeout,
        screenshotEnabled: this.config.screenshotEnabled
      }
    });
  }

  // =============================================================================
  // EXECUTION METHODS
  // =============================================================================

  /**
   * Execute Python automation script with standardized data passing
   */
  async executePythonAutomation(
    companyAutomation: string, 
    request: PythonExecutionRequest
  ): Promise<PythonExecutionResult> {
    const logContext = {
      correlationId: request.correlationId,
      applicationId: request.applicationId,
      userId: request.userId,
      companyAutomation,
      jobTitle: request.jobData.title,
      company: request.jobData.company
    };

    this.fastify.log.info({
      ...logContext,
      event: 'python_execution_started',
      message: `Starting Python automation for ${companyAutomation}`,
      scriptPath: this.getScriptPath(companyAutomation)
    });

    try {
      // Validate script exists
      const scriptPath = await this.validateScript(companyAutomation);
      
      // Prepare environment variables
      const env = this.createExecutionEnvironment(request);
      
      // Create temporary data file for complex data structures
      const dataFilePath = await this.createDataFile(request);
      
      // Execute Python script
      const result = await this.runPythonScript(scriptPath, env, dataFilePath, logContext);
      
      // Cleanup temporary file
      await this.cleanupDataFile(dataFilePath);
      
      this.fastify.log.info({
        ...logContext,
        event: 'python_execution_completed',
        message: 'Python automation completed successfully',
        success: result.success,
        executionTimeMs: result.executionTimeMs,
        stepsCompleted: result.steps.length
      });

      return result;

    } catch (error) {
      this.fastify.log.error({
        ...logContext,
        event: 'python_execution_failed',
        message: 'Python automation failed',
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined
      });

      // Return failure result
      return {
        success: false,
        applicationId: request.applicationId,
        correlationId: request.correlationId,
        executionTimeMs: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        steps: [],
        screenshots: [],
        captchaEvents: [],
        metadata: {
          serverInfo: { errorType: 'execution_failed' }
        }
      };
    }
  }

  /**
   * Validate that the automation script exists and Python environment is available
   */
  private async validateScript(companyAutomation: string): Promise<string> {
    const scriptPath = this.getScriptPath(companyAutomation);
    
    // Validate Python executable
    try {
      await fs.access(this.config.pythonPath);
      this.fastify.log.debug({
        event: 'python_executable_validated',
        message: 'Python executable found',
        pythonPath: this.config.pythonPath
      });
    } catch (error) {
      throw new Error(`Python executable not found: ${this.config.pythonPath}. Make sure virtual environment is set up.`);
    }
    
    // Validate script exists
    try {
      await fs.access(scriptPath);
      this.fastify.log.debug({
        event: 'python_script_validated',
        message: 'Python script found and validated',
        scriptPath,
        companyAutomation
      });
      return scriptPath;
    } catch (error) {
      throw new Error(`Automation script not found: ${scriptPath}`);
    }
  }

  /**
   * Get the path to the automation script
   * Now uses unified wrapper script that auto-detects company type
   */
  private getScriptPath(companyAutomation: string): string {
    // Use unified automation engine wrapper script (server mode)
    const unifiedScriptPath = path.join(__dirname, '../../../../packages/automation-engine/scripts/run_server_automation.py');

    this.fastify.log.debug({
      event: 'unified_engine_script_path',
      message: 'Using unified automation engine',
      scriptPath: unifiedScriptPath,
      companyType: companyAutomation
    });

    return unifiedScriptPath;
  }

  /**
   * Create execution environment with all necessary variables
   */
  private createExecutionEnvironment(request: PythonExecutionRequest): NodeJS.ProcessEnv {
    return {
      ...process.env,
      
      // Request identifiers
      CORRELATION_ID: request.correlationId,
      APPLICATION_ID: request.applicationId,
      USER_ID: request.userId,
      JOB_ID: request.jobData.id,
      
      // Execution mode
      EXECUTION_MODE: 'server',
      DATA_SOURCE: 'bridge',
      
      // API keys
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
      
      // Automation configuration
      AUTOMATION_HEADLESS: (request.automationConfig.headless !== false).toString(),
      AUTOMATION_TIMEOUT: (request.automationConfig.timeout || this.config.timeout).toString(),
      AUTOMATION_MAX_RETRIES: (request.automationConfig.maxRetries || this.config.maxRetries).toString(),
      SCREENSHOT_ENABLED: this.config.screenshotEnabled.toString(),
      SCREENSHOT_PATH: request.automationConfig.screenshotPath || this.config.screenshotPath,

      // Proxy configuration (unified engine expects JSON format)
      PROXY_CONFIG: request.proxyConfig ? JSON.stringify({
        enabled: true,
        host: request.proxyConfig.host,
        port: request.proxyConfig.port,
        username: request.proxyConfig.username,
        password: request.proxyConfig.password,
        type: request.proxyConfig.type
      }) : undefined,
      
      // Basic user data (for simple access)
      USER_FIRST_NAME: request.userProfile.firstName,
      USER_LAST_NAME: request.userProfile.lastName,
      USER_EMAIL: request.userProfile.email,
      USER_PHONE: request.userProfile.phone,
      USER_CURRENT_TITLE: request.userProfile.currentTitle || '',
      USER_YEARS_EXPERIENCE: request.userProfile.yearsExperience?.toString() || '0',
      USER_CURRENT_LOCATION: request.userProfile.currentLocation || '',
      USER_WORK_AUTHORIZATION: request.userProfile.workAuthorization || '',
      USER_LINKEDIN_URL: request.userProfile.linkedinUrl || '',
      
      // Job data
      JOB_TITLE: request.jobData.title,
      JOB_COMPANY: request.jobData.company,
      JOB_APPLY_URL: request.jobData.applyUrl,
      JOB_LOCATION: request.jobData.location || '',
      JOB_DESCRIPTION: request.jobData.description || '',
      
      // Resume handling
      USER_RESUME_URL: request.userProfile.resumeUrl || '',
      USER_RESUME_LOCAL_PATH: request.userProfile.resumeLocalPath || '',
      
      // Cover letter and custom fields
      USER_COVER_LETTER: request.userProfile.coverLetter || '',
      USER_SKILLS: JSON.stringify(request.userProfile.skills || []),
      USER_CUSTOM_FIELDS: JSON.stringify(request.userProfile.customFields || {})
    };
  }

  /**
   * Ensure requirements field is always an array for Python validation
   */
  private ensureRequirementsArray(requirements: any): string[] {
    if (!requirements) {
      return ['General requirements'];
    }
    
    if (Array.isArray(requirements)) {
      return requirements.filter(req => req && typeof req === 'string');
    }
    
    if (typeof requirements === 'string') {
      // Split by common delimiters or return as single item array
      const trimmed = requirements.trim();
      if (trimmed.includes('\n')) {
        return trimmed.split('\n').map(req => req.trim()).filter(req => req);
      } else if (trimmed.includes(',')) {
        return trimmed.split(',').map(req => req.trim()).filter(req => req);
      } else {
        return [trimmed];
      }
    }
    
    // Fallback for unexpected types
    return ['General requirements'];
  }

  /**
   * Create temporary data file for complex data structures
   */
  private async createDataFile(request: PythonExecutionRequest): Promise<string> {
    const dataFileName = `job_data_${request.applicationId}_${Date.now()}.json`;
    const dataFilePath = path.join('/tmp', dataFileName);
    
    // Transform data to match Python script expectations
    const dataPayload = {
      user_profile: {
        first_name: request.userProfile.firstName || 'Unknown',
        last_name: request.userProfile.lastName || 'User',
        email: request.userProfile.email,
        phone: request.userProfile.phone || '000-000-0000',
        resume_url: request.userProfile.resumeUrl,
        resume_local_path: request.userProfile.resumeLocalPath,
        current_title: request.userProfile.currentTitle || 'Professional',
        years_experience: request.userProfile.yearsExperience || 2,
        skills: request.userProfile.skills || ['General Skills'],
        linkedin_url: request.userProfile.linkedinUrl,
        current_location: request.userProfile.currentLocation || 'Remote',
        work_authorization: request.userProfile.workAuthorization || 'citizen',
        cover_letter: request.userProfile.coverLetter,
        custom_fields: request.userProfile.customFields || {}
      },
      job_data: {
        job_id: request.jobData.id,
        title: request.jobData.title,
        company: request.jobData.company,
        apply_url: request.jobData.applyUrl,
        location: request.jobData.location,
        description: request.jobData.description,
        requirements: this.ensureRequirementsArray(request.jobData.requirements)
      },
      automation_config: request.automationConfig,
      proxy_config: request.proxyConfig,
      metadata: {
        correlationId: request.correlationId,
        applicationId: request.applicationId,
        userId: request.userId,
        timestamp: new Date().toISOString()
      }
    };
    
    await fs.writeFile(dataFilePath, JSON.stringify(dataPayload, null, 2), 'utf8');
    
    this.fastify.log.debug({
      correlationId: request.correlationId,
      event: 'data_file_created',
      message: 'Temporary data file created for Python script',
      dataFilePath,
      dataSize: JSON.stringify(dataPayload).length
    });
    
    return dataFilePath;
  }

  /**
   * Execute the Python script and parse results
   */
  private async runPythonScript(
    scriptPath: string, 
    env: NodeJS.ProcessEnv, 
    dataFilePath: string,
    logContext: Record<string, any>
  ): Promise<PythonExecutionResult> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      // Add data file path to environment
      const scriptEnv = {
        ...env,
        JOB_DATA_FILE: dataFilePath
      };
      
      // Debug log the execution environment
      this.fastify.log.info({
        ...logContext,
        event: 'python_execution_debug',
        message: 'Python execution environment',
        pythonPath: this.config.pythonPath,
        scriptPath,
        workingDirectory: path.dirname(scriptPath),
        dataSource: env.DATA_SOURCE,
        dataFilePath: scriptEnv.JOB_DATA_FILE
      });
      
      // Spawn Python process
      const pythonProcess = spawn(this.config.pythonPath, [scriptPath], {
        env: scriptEnv,
        cwd: path.dirname(scriptPath),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.activeProcesses.set(logContext.applicationId, pythonProcess);

      let stdout = '';
      let stderr = '';

      // Collect stdout
      pythonProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        
        this.fastify.log.debug({
          ...logContext,
          event: 'python_stdout',
          message: 'Python script output',
          output: output.trim()
        });
      });

      // Collect stderr
      pythonProcess.stderr?.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        
        this.fastify.log.debug({
          ...logContext,
          event: 'python_stderr',
          message: 'Python script error output',
          output: output.trim()
        });
      });

      // Handle process completion
      pythonProcess.on('close', (code) => {
        this.activeProcesses.delete(logContext.applicationId);
        const executionTime = Date.now() - startTime;

        // Try to parse result regardless of exit code, as some Python scripts
        // return non-zero exit codes but still produce valid JSON output
        try {
          const result = this.parseExecutionResult(stdout, logContext, executionTime);
          if (code !== 0) {
            // Mark as failed but still return the parsed result for debugging
            result.success = false;
            result.error = result.error || `Python process exited with code ${code}: ${stderr}`;
            
            this.fastify.log.warn({
              ...logContext,
              event: 'python_non_zero_exit',
              message: 'Python script returned non-zero exit code but produced valid output',
              exitCode: code,
              stderr: stderr.trim(),
              parsedSuccess: result.success
            });
          }
          resolve(result);
        } catch (parseError) {
          // If parsing fails and exit code is non-zero, this is a complete failure
          const errorMessage = code === 0 
            ? `Failed to parse Python output: ${parseError}`
            : `Python process failed with code ${code}. Stderr: ${stderr}. Parse error: ${parseError}`;
          
          this.fastify.log.error({
            ...logContext,
            event: 'python_complete_failure',
            message: 'Python execution failed completely',
            exitCode: code,
            parseError: parseError.message,
            stderr: stderr.trim(),
            stdout: stdout.slice(0, 500) // Log first 500 chars for debugging
          });
          
          reject(new Error(errorMessage));
        }
      });

      // Handle process errors
      pythonProcess.on('error', (error) => {
        this.activeProcesses.delete(logContext.applicationId);
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });

      // Set timeout
      setTimeout(() => {
        if (this.activeProcesses.has(logContext.applicationId)) {
          pythonProcess.kill('SIGTERM');
          setTimeout(() => {
            if (this.activeProcesses.has(logContext.applicationId)) {
              pythonProcess.kill('SIGKILL');
            }
          }, 5000);
          reject(new Error(`Python execution timed out after ${this.config.timeout}ms`));
        }
      }, this.config.timeout);
    });
  }

  /**
   * Parse Python execution result from stdout
   */
  private parseExecutionResult(
    stdout: string, 
    logContext: Record<string, any>, 
    executionTime: number
  ): PythonExecutionResult {
    try {
      // Look for JSON result in stdout
      const lines = stdout.trim().split('\n');
      const jsonLine = lines.find(line => {
        const trimmed = line.trim();
        return trimmed.startsWith('{') && trimmed.includes('"success"');
      });

      if (!jsonLine) {
        throw new Error('No valid JSON result found in Python output');
      }

      const pythonResult = JSON.parse(jsonLine);

      // Convert Python result to standardized TypeScript format
      return {
        success: pythonResult.success || false,
        applicationId: logContext.applicationId,
        correlationId: logContext.correlationId,
        executionTimeMs: pythonResult.execution_time_ms || executionTime,
        confirmationNumber: pythonResult.confirmation_number,
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
        metadata: {
          pythonVersion: pythonResult.python_version,
          aiModel: pythonResult.ai_model_used,
          browserVersion: pythonResult.browser_version,
          proxyUsed: pythonResult.proxy_used,
          serverInfo: pythonResult.server_info || {}
        }
      };

    } catch (error) {
      throw new Error(`Failed to parse Python result: ${error}`);
    }
  }

  /**
   * Cleanup temporary data file
   */
  private async cleanupDataFile(dataFilePath: string): Promise<void> {
    try {
      await fs.unlink(dataFilePath);
      this.fastify.log.debug({
        event: 'data_file_cleaned',
        message: 'Temporary data file cleaned up',
        dataFilePath
      });
    } catch (error) {
      this.fastify.log.warn({
        event: 'data_file_cleanup_failed',
        message: 'Failed to cleanup temporary data file',
        dataFilePath,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Stop specific Python process
   */
  public async stopExecution(applicationId: string): Promise<boolean> {
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
    
    this.fastify.log.info({
      event: 'python_execution_stopped',
      message: 'Python execution stopped',
      applicationId
    });
    
    return true;
  }

  /**
   * Get current status
   */
  public getStatus(): {
    activeProcesses: number;
    config: PythonBridgeConfig;
  } {
    return {
      activeProcesses: this.activeProcesses.size,
      config: { ...this.config }
    };
  }

  /**
   * Cleanup all active processes
   */
  public async cleanup(): Promise<void> {
    const activeIds = Array.from(this.activeProcesses.keys());
    this.fastify.log.info({
      event: 'python_bridge_cleanup',
      message: `Cleaning up ${activeIds.length} active Python processes`
    });

    const stopPromises = activeIds.map(id => this.stopExecution(id));
    await Promise.allSettled(stopPromises);

    this.emit('cleanup-completed');
  }
}