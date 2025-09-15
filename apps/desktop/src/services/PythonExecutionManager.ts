/**
 * @fileoverview Python Script Execution Manager for JobSwipe Desktop App
 * @description Manages local Python automation script execution without proxy rotation
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { join, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { writeFile, readFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { app } from 'electron';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  currentTitle?: string;
  yearsExperience: number;
  skills: string[];
  currentLocation: string;
  linkedinUrl?: string;
  workAuthorization?: string;
  coverLetter?: string;
  customFields?: Record<string, string>;
}

export interface JobData {
  id: string;
  title: string;
  company: string;
  applyUrl: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
}

export interface AutomationRequest {
  executionId: string;
  applicationId: string;
  userId: string;
  jobData: JobData;
  userProfile: UserProfile;
  companyAutomation: string; // 'greenhouse', 'linkedin', 'workday', etc.
  options: {
    headless: boolean;
    timeout: number;
    screenshotPath?: string;
    debugMode?: boolean;
  };
}

export interface AutomationResult {
  executionId: string;
  success: boolean;
  status: 'completed' | 'failed' | 'timeout' | 'cancelled';
  message: string;
  error?: string;
  errorType?: string;
  executionTimeMs: number;
  screenshots: string[];
  logs: string[];
  applicationData?: {
    submittedAt?: string;
    confirmationNumber?: string;
    applicationUrl?: string;
  };
}

export interface ExecutionProgress {
  executionId: string;
  progress: number; // 0-100
  currentStep: string;
  message: string;
  timestamp: Date;
}

// =============================================================================
// PYTHON EXECUTION MANAGER
// =============================================================================

export class PythonExecutionManager extends EventEmitter {
  private pythonExecutable: string;
  private scriptsPath: string;
  private activeExecutions: Map<string, ChildProcess> = new Map();
  private executionResults: Map<string, AutomationResult> = new Map();
  private userDataPath: string;
  private screenshotsPath: string;
  private logsPath: string;

  constructor() {
    super();

    // Initialize paths
    this.userDataPath = app.getPath('userData');
    this.screenshotsPath = join(this.userDataPath, 'screenshots');
    this.logsPath = join(this.userDataPath, 'logs');
    this.scriptsPath = this.findScriptsPath();
    this.pythonExecutable = this.findPythonExecutable();

    // Ensure directories exist
    this.ensureDirectories();

    console.log('PythonExecutionManager initialized:', {
      pythonExecutable: this.pythonExecutable,
      scriptsPath: this.scriptsPath,
      userDataPath: this.userDataPath,
      screenshotsPath: this.screenshotsPath,
      logsPath: this.logsPath,
    });
  }

  // =============================================================================
  // EXECUTION MANAGEMENT
  // =============================================================================

  /**
   * Execute automation script for a job application
   */
  async executeAutomation(request: AutomationRequest): Promise<AutomationResult> {
    const startTime = Date.now();

    console.log(`Starting automation execution: ${request.executionId}`);
    console.log(`Company automation type: ${request.companyAutomation}`);
    console.log(`Job: ${request.jobData.title} at ${request.jobData.company}`);

    try {
      // Validate request
      this.validateRequest(request);

      // Prepare execution environment
      const environmentData = await this.prepareExecutionEnvironment(request);

      // Determine which Python script to execute
      const scriptPath = this.getScriptPath(request.companyAutomation);

      // Execute Python script
      const result = await this.executePythonScript(scriptPath, environmentData, request);

      // Calculate execution time
      const executionTimeMs = Date.now() - startTime;
      result.executionTimeMs = executionTimeMs;

      // Store result for later retrieval
      this.executionResults.set(request.executionId, result);

      console.log(`Automation execution completed: ${request.executionId}`, {
        success: result.success,
        status: result.status,
        executionTimeMs,
      });

      this.emit('execution-completed', result);
      return result;

    } catch (error) {
      const executionTimeMs = Date.now() - startTime;
      const errorResult: AutomationResult = {
        executionId: request.executionId,
        success: false,
        status: 'failed',
        message: 'Execution failed',
        error: error instanceof Error ? error.message : String(error),
        errorType: 'execution_error',
        executionTimeMs,
        screenshots: [],
        logs: [],
      };

      this.executionResults.set(request.executionId, errorResult);

      console.error(`Automation execution failed: ${request.executionId}`, error);
      this.emit('execution-failed', errorResult);
      return errorResult;
    }
  }

  /**
   * Cancel a running automation execution
   */
  async cancelExecution(executionId: string): Promise<boolean> {
    console.log(`Cancelling execution: ${executionId}`);

    const process = this.activeExecutions.get(executionId);
    if (!process) {
      console.warn(`No active execution found for ID: ${executionId}`);
      return false;
    }

    try {
      // Terminate the Python process
      process.kill('SIGTERM');

      // Wait a bit, then force kill if still running
      setTimeout(() => {
        if (!process.killed) {
          console.log(`Force killing execution: ${executionId}`);
          process.kill('SIGKILL');
        }
      }, 5000);

      // Clean up
      this.activeExecutions.delete(executionId);

      // Create cancelled result
      const cancelledResult: AutomationResult = {
        executionId,
        success: false,
        status: 'cancelled',
        message: 'Execution was cancelled by user',
        executionTimeMs: 0,
        screenshots: [],
        logs: [],
      };

      this.executionResults.set(executionId, cancelledResult);

      console.log(`Execution cancelled: ${executionId}`);
      this.emit('execution-cancelled', cancelledResult);
      return true;

    } catch (error) {
      console.error(`Error cancelling execution ${executionId}:`, error);
      return false;
    }
  }

  /**
   * Get result of a completed execution
   */
  getExecutionResult(executionId: string): AutomationResult | null {
    return this.executionResults.get(executionId) || null;
  }

  /**
   * Get list of active executions
   */
  getActiveExecutions(): string[] {
    return Array.from(this.activeExecutions.keys());
  }

  // =============================================================================
  // PYTHON SCRIPT EXECUTION
  // =============================================================================

  /**
   * Execute a Python automation script
   */
  private async executePythonScript(
    scriptPath: string,
    environmentData: any,
    request: AutomationRequest
  ): Promise<AutomationResult> {
    return new Promise((resolve, reject) => {
      const executionId = request.executionId;

      // Prepare Python environment variables
      const pythonEnv = {
        ...process.env,
        AUTOMATION_MODE: 'desktop',
        USER_DATA_DIR: this.userDataPath,
        SCREENSHOTS_DIR: this.screenshotsPath,
        LOGS_DIR: this.logsPath,
        HEADLESS: request.options.headless.toString(),
        TIMEOUT: request.options.timeout.toString(),
        DEBUG_MODE: (request.options.debugMode || false).toString(),
        EXECUTION_ID: executionId,
        // No proxy configuration for desktop execution
      };

      console.log(`Executing Python script: ${scriptPath}`);

      // Spawn Python process
      const pythonProcess = spawn(this.pythonExecutable, [scriptPath], {
        env: pythonEnv,
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: this.scriptsPath,
      });

      // Track the process
      this.activeExecutions.set(executionId, pythonProcess);

      // Send automation data to Python script via stdin
      pythonProcess.stdin.write(JSON.stringify(environmentData));
      pythonProcess.stdin.end();

      let outputData = '';
      let errorData = '';
      const logs: string[] = [];
      const screenshots: string[] = [];

      // Handle stdout data
      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString();
        outputData += output;

        // Parse progress updates and other structured output
        const lines = output.split('\n').filter(line => line.trim());
        for (const line of lines) {
          try {
            // Check for JSON progress updates
            if (line.startsWith('PROGRESS:')) {
              const progressData = JSON.parse(line.substring(9));
              this.emit('execution-progress', {
                executionId,
                progress: progressData.progress,
                currentStep: progressData.step,
                message: progressData.message,
                timestamp: new Date(),
              } as ExecutionProgress);
            } else if (line.startsWith('SCREENSHOT:')) {
              screenshots.push(line.substring(11));
            } else {
              logs.push(line);
            }
          } catch (error) {
            // If not JSON, treat as regular log
            logs.push(line);
          }
        }
      });

      // Handle stderr data
      pythonProcess.stderr.on('data', (data) => {
        const error = data.toString();
        errorData += error;
        logs.push(`ERROR: ${error}`);
      });

      // Handle process completion
      pythonProcess.on('close', (code) => {
        this.activeExecutions.delete(executionId);

        console.log(`Python process closed with code: ${code}`);

        if (code === 0) {
          // Parse successful result
          try {
            const result = JSON.parse(outputData);
            const automationResult: AutomationResult = {
              executionId,
              success: result.success || false,
              status: result.success ? 'completed' : 'failed',
              message: result.message || 'Automation completed',
              error: result.error,
              errorType: result.errorType,
              executionTimeMs: 0, // Will be set by caller
              screenshots,
              logs,
              applicationData: result.applicationData,
            };
            resolve(automationResult);
          } catch (parseError) {
            console.error('Failed to parse Python script output:', parseError);
            resolve({
              executionId,
              success: false,
              status: 'failed',
              message: 'Failed to parse automation result',
              error: `Parse error: ${parseError}`,
              errorType: 'parse_error',
              executionTimeMs: 0,
              screenshots,
              logs,
            });
          }
        } else {
          // Process failed
          resolve({
            executionId,
            success: false,
            status: 'failed',
            message: 'Python script execution failed',
            error: errorData || `Process exited with code ${code}`,
            errorType: 'script_error',
            executionTimeMs: 0,
            screenshots,
            logs,
          });
        }
      });

      // Handle process errors
      pythonProcess.on('error', (error) => {
        this.activeExecutions.delete(executionId);
        console.error('Python process error:', error);
        reject(error);
      });

      // Set timeout
      const timeout = setTimeout(() => {
        if (this.activeExecutions.has(executionId)) {
          console.log(`Execution timeout reached for: ${executionId}`);
          pythonProcess.kill('SIGTERM');

          setTimeout(() => {
            if (!pythonProcess.killed) {
              pythonProcess.kill('SIGKILL');
            }
          }, 5000);

          resolve({
            executionId,
            success: false,
            status: 'timeout',
            message: 'Execution timed out',
            error: `Execution exceeded ${request.options.timeout}ms timeout`,
            errorType: 'timeout',
            executionTimeMs: 0,
            screenshots,
            logs,
          });
        }
      }, request.options.timeout);

      // Clear timeout when process completes
      pythonProcess.on('close', () => {
        clearTimeout(timeout);
      });
    });
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Validate automation request
   */
  private validateRequest(request: AutomationRequest): void {
    if (!request.executionId) {
      throw new Error('Execution ID is required');
    }
    if (!request.jobData?.id) {
      throw new Error('Job data is required');
    }
    if (!request.userProfile?.email) {
      throw new Error('User profile is required');
    }
    if (!request.companyAutomation) {
      throw new Error('Company automation type is required');
    }
  }

  /**
   * Prepare execution environment data for Python script
   */
  private async prepareExecutionEnvironment(request: AutomationRequest): Promise<any> {
    const environmentData = {
      userProfile: {
        firstName: request.userProfile.firstName || '',
        lastName: request.userProfile.lastName || '',
        email: request.userProfile.email,
        phone: request.userProfile.phone || '',
        resumeUrl: request.userProfile.resumeUrl || '',
        currentTitle: request.userProfile.currentTitle || '',
        yearsExperience: request.userProfile.yearsExperience || 0,
        skills: request.userProfile.skills || [],
        currentLocation: request.userProfile.currentLocation || '',
        linkedinUrl: request.userProfile.linkedinUrl || '',
        workAuthorization: request.userProfile.workAuthorization || '',
        coverLetter: request.userProfile.coverLetter || '',
        customFields: request.userProfile.customFields || {},
      },
      jobData: {
        id: request.jobData.id,
        title: request.jobData.title,
        company: request.jobData.company,
        applyUrl: request.jobData.applyUrl,
        location: request.jobData.location,
        description: request.jobData.description,
        requirements: request.jobData.requirements || [],
        salary: request.jobData.salary,
      },
      config: {
        headless: request.options.headless,
        timeout: request.options.timeout,
        screenshotPath: request.options.screenshotPath || this.screenshotsPath,
        debugMode: request.options.debugMode || false,
        executionId: request.executionId,
        automationType: request.companyAutomation,
      },
    };

    // Save environment data to file for debugging
    if (request.options.debugMode) {
      const debugFilePath = join(this.logsPath, `execution_${request.executionId}.json`);
      await writeFile(debugFilePath, JSON.stringify(environmentData, null, 2));
      console.log(`Debug data saved to: ${debugFilePath}`);
    }

    return environmentData;
  }

  /**
   * Get the appropriate Python script path for company automation
   */
  private getScriptPath(companyAutomation: string): string {
    const scriptMappings: Record<string, string> = {
      greenhouse: 'greenhouse/greenhouse_automation.py',
      linkedin: 'linkedin/linkedin_automation.py',
      workday: 'workday/workday_automation.py',
      lever: 'lever/lever_automation.py',
      generic: 'base/generic_automation.py',
    };

    const scriptFile = scriptMappings[companyAutomation] || scriptMappings.generic;
    const scriptPath = join(this.scriptsPath, scriptFile);

    if (!existsSync(scriptPath)) {
      console.warn(`Script not found: ${scriptPath}, using generic automation`);
      return join(this.scriptsPath, scriptMappings.generic);
    }

    return scriptPath;
  }

  /**
   * Find Python executable
   */
  private findPythonExecutable(): string {
    const possiblePaths = [
      'python3',
      'python',
      '/usr/bin/python3',
      '/usr/local/bin/python3',
      '/opt/homebrew/bin/python3',
      'C:\\Python39\\python.exe',
      'C:\\Python38\\python.exe',
      'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Programs\\Python\\Python39\\python.exe',
    ];

    for (const pythonPath of possiblePaths) {
      try {
        const { execSync } = require('child_process');
        execSync(`${pythonPath} --version`, { stdio: 'ignore' });
        console.log(`Found Python executable: ${pythonPath}`);
        return pythonPath;
      } catch (error) {
        // Continue searching
      }
    }

    console.warn('Python executable not found, using default: python3');
    return 'python3';
  }

  /**
   * Find Python scripts path
   */
  private findScriptsPath(): string {
    // In development, scripts are in the project
    const devPath = resolve(__dirname, '../../companies');
    if (existsSync(devPath)) {
      return devPath;
    }

    // In production, scripts might be packaged differently
    const prodPath = join(process.resourcesPath, 'companies');
    if (existsSync(prodPath)) {
      return prodPath;
    }

    // Fallback to user data directory
    const fallbackPath = join(this.userDataPath, 'companies');
    console.warn(`Scripts not found in standard locations, using: ${fallbackPath}`);
    return fallbackPath;
  }

  /**
   * Ensure required directories exist
   */
  private ensureDirectories(): void {
    const directories = [this.screenshotsPath, this.logsPath];

    for (const dir of directories) {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    console.log('Cleaning up PythonExecutionManager...');

    // Cancel all active executions
    for (const executionId of this.activeExecutions.keys()) {
      this.cancelExecution(executionId);
    }

    // Clear results
    this.executionResults.clear();

    // Remove all listeners
    this.removeAllListeners();
  }
}

export default PythonExecutionManager;