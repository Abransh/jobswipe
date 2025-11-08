/**
 * @fileoverview Simplified Automation Service
 * @description Clean, simple automation service that replaces the complex legacy system
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Streamlined automation with Python script execution
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import Store from 'electron-store';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export interface JobApplicationData {
  jobId: string;
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
  options?: {
    headless?: boolean;
    timeout?: number;
    maxRetries?: number;
  };
}

export interface AutomationResult {
  success: boolean;
  jobId: string;
  userId: string;
  applicationId?: string;
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
  performanceMetrics: {
    totalDurationMs: number;
    stepsCompleted: number;
    successRate: number;
  };
}

export interface AutomationConfig {
  pythonPath: string;
  companiesPath: string;
  headless: boolean;
  timeout: number;
  maxConcurrentJobs: number;
  screenshotEnabled: boolean;
  screenshotPath: string;
}

export interface ProcessingStats {
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  averageExecutionTime: number;
  activeProcesses: number;
  companiesSupported: string[];
}

// =============================================================================
// SIMPLIFIED AUTOMATION SERVICE
// =============================================================================

export class SimplifiedAutomationService extends EventEmitter {
  private config: AutomationConfig;
  private store: Store;
  private activeProcesses = new Map<string, ChildProcess>();
  private stats: ProcessingStats;
  private supportedCompanies: Map<string, string[]> = new Map();

  constructor() {
    super();

    // Simple, clean configuration (updated to use unified automation engine)
    this.config = {
      pythonPath: process.env.PYTHON_PATH || 'python3',
      // Updated to point to unified automation engine scripts directory
      companiesPath: path.join(__dirname, '../../../packages/automation-engine/scripts'),
      headless: process.env.AUTOMATION_HEADLESS !== 'false',
      timeout: parseInt(process.env.AUTOMATION_TIMEOUT || '300000'), // 5 minutes
      maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS || '3'),
      screenshotEnabled: process.env.SCREENSHOT_ENABLED !== 'false',
      screenshotPath: path.join(__dirname, '../../data/screenshots')
    };

    this.store = new Store({
      name: 'simplified-automation',
      defaults: {
        stats: {
          totalJobs: 0,
          successfulJobs: 0,
          failedJobs: 0,
          averageExecutionTime: 0,
          activeProcesses: 0,
          companiesSupported: []
        }
      }
    }) as any;

    this.stats = this.store.get('stats') as ProcessingStats;
    this.loadSupportedCompanies();
  }

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  /**
   * Initialize the simplified automation service
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Simplified Automation Service...');

      // Create required directories
      await this.createDirectories();

      // Validate Python environment
      await this.validatePythonEnvironment();

      // Load supported companies
      await this.loadSupportedCompanies();

      // Setup cleanup
      process.on('exit', () => this.cleanup());
      process.on('SIGINT', () => this.cleanup());
      process.on('SIGTERM', () => this.cleanup());

      console.log('✅ Simplified Automation Service initialized');
      console.log(`📋 Supported companies: ${Array.from(this.supportedCompanies.keys()).join(', ')}`);
      
      this.emit('initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Simplified Automation Service:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create required directories
   */
  private async createDirectories(): Promise<void> {
    const directories = [
      this.config.screenshotPath,
      path.join(__dirname, '../../data/logs'),
      path.join(__dirname, '../../data/temp')
    ];

    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        console.warn(`Failed to create directory ${dir}:`, error);
      }
    }
  }

  /**
   * Validate Python environment
   */
  private async validatePythonEnvironment(): Promise<void> {
    return new Promise((resolve, reject) => {
      const python = spawn(this.config.pythonPath, ['-c', 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")']);

      let output = '';
      python.stdout?.on('data', (data) => {
        output += data.toString();
      });

      python.on('close', (code) => {
        if (code === 0) {
          const version = parseFloat(output.trim());
          if (version >= 3.11) {
            console.log(`✅ Python ${version} validated`);
            resolve();
          } else {
            reject(new Error(`Python 3.11+ required. Found: ${version}`));
          }
        } else {
          reject(new Error(`Python validation failed with code: ${code}`));
        }
      });

      python.on('error', (error) => {
        reject(new Error(`Python not found: ${error.message}`));
      });
    });
  }

  /**
   * Load supported companies and their URL patterns
   */
  private async loadSupportedCompanies(): Promise<void> {
    try {
      // Define supported companies and their patterns
      this.supportedCompanies.set('greenhouse', [
        'greenhouse.io',
        'job-boards.greenhouse.io',
        'boards.greenhouse.io',
        'grnh.se'
      ]);

      this.supportedCompanies.set('linkedin', [
        'linkedin.com/jobs',
        'linkedin.com/jobs/view',
        'linkedin.com/jobs/collections',
        'linkedin.com/jobs/search'
      ]);

      // Add more companies as they're implemented
      // this.supportedCompanies.set('indeed', ['indeed.com']);

      // Update stats
      this.stats.companiesSupported = Array.from(this.supportedCompanies.keys());
      this.saveStats();

      console.log(`📋 Loaded ${this.supportedCompanies.size} company automations`);
    } catch (error) {
      console.error('Failed to load supported companies:', error);
    }
  }

  // =============================================================================
  // MAIN AUTOMATION INTERFACE
  // =============================================================================

  /**
   * Process a job application using AI-powered automation
   */
  async processJobApplication(data: JobApplicationData): Promise<AutomationResult> {
    const startTime = Date.now();
    const applicationId = randomUUID();

    console.log(`🚀 Processing job application: ${data.jobData.title} at ${data.jobData.company}`);

    // Check concurrency limits
    if (this.activeProcesses.size >= this.config.maxConcurrentJobs) {
      throw new Error(`Maximum concurrent jobs (${this.config.maxConcurrentJobs}) reached`);
    }

    try {
      // Detect company automation to use
      const companyAutomation = this.detectCompanyAutomation(data.jobData.applyUrl);
      
      if (!companyAutomation) {
        throw new Error(`No automation found for URL: ${data.jobData.applyUrl}`);
      }

      console.log(`🎯 Using ${companyAutomation} automation`);

      // Execute the automation with database integration
      const result = await this.executeAutomationWithDatabase(companyAutomation, data, applicationId);

      // Update statistics
      this.updateStats(true, Date.now() - startTime);

      console.log(`✅ Job application completed successfully: ${data.jobData.id}`);
      this.emit('application-completed', result);

      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ Job application failed: ${data.jobData.id}`, error);

      this.updateStats(false, executionTime);

      const errorResult: AutomationResult = {
        success: false,
        jobId: data.jobData.id,
        userId: data.userId,
        applicationId,
        executionTime,
        companyAutomation: 'unknown',
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        steps: [],
        screenshots: [],
        captchaEvents: [],
        performanceMetrics: {
          totalDurationMs: executionTime,
          stepsCompleted: 0,
          successRate: 0
        }
      };

      this.emit('application-failed', errorResult);
      return errorResult;
    }
  }

  /**
   * Detect which company automation to use based on URL
   */
  private detectCompanyAutomation(url: string): string | null {
    const urlLower = url.toLowerCase();

    for (const [company, patterns] of this.supportedCompanies.entries()) {
      if (patterns.some(pattern => urlLower.includes(pattern))) {
        return company;
      }
    }

    return null;
  }

  /**
   * Execute automation with database integration
   */
  private async executeAutomationWithDatabase(
    companyAutomation: string,
    data: JobApplicationData,
    applicationId: string
  ): Promise<AutomationResult> {
    return new Promise((resolve, reject) => {
      // Create environment variables for Python script (unified engine format)
      const env = {
        ...process.env,

        // Execution identifiers
        USER_ID: data.userId,
        JOB_ID: data.jobData.id,
        APPLICATION_ID: applicationId,

        // User profile data
        USER_FIRST_NAME: data.userProfile.firstName,
        USER_LAST_NAME: data.userProfile.lastName,
        USER_EMAIL: data.userProfile.email,
        USER_PHONE: data.userProfile.phone,
        USER_RESUME_URL: data.userProfile.resumeUrl || '',
        USER_RESUME_LOCAL_PATH: data.userProfile.resumeLocalPath || '',
        USER_CURRENT_TITLE: data.userProfile.currentTitle || '',
        USER_YEARS_EXPERIENCE: (data.userProfile.yearsExperience || 0).toString(),
        USER_SKILLS: JSON.stringify(data.userProfile.skills || []),
        USER_CURRENT_LOCATION: data.userProfile.currentLocation || '',
        USER_LINKEDIN_URL: data.userProfile.linkedinUrl || '',
        USER_WORK_AUTHORIZATION: data.userProfile.workAuthorization || '',
        USER_COVER_LETTER: data.userProfile.coverLetter || '',

        // Job data
        JOB_TITLE: data.jobData.title,
        JOB_COMPANY: data.jobData.company,
        JOB_APPLY_URL: data.jobData.applyUrl,
        JOB_LOCATION: data.jobData.location || '',
        JOB_DESCRIPTION: data.jobData.description || '',

        // Browser profile path (optional, for pre-filled data)
        BROWSER_PROFILE_PATH: this.getBrowserProfilePath() || '',

        // AI API keys
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,

        // Automation configuration
        AUTOMATION_HEADLESS: (data.options?.headless !== false).toString(),
        AUTOMATION_TIMEOUT: (data.options?.timeout || this.config.timeout).toString(),
        SCREENSHOT_ENABLED: this.config.screenshotEnabled.toString(),
        SCREENSHOT_PATH: this.config.screenshotPath,

        // Legacy compatibility
        EXECUTION_MODE: 'desktop',
        DATA_SOURCE: 'database',
        DATABASE_URL: process.env.DATABASE_URL
      };

      // Use unified automation engine wrapper script (desktop mode)
      const scriptPath = path.join(this.config.companiesPath, 'run_desktop_automation.py');

      const pythonProcess = spawn(this.config.pythonPath, [scriptPath], {
        env,
        cwd: this.config.companiesPath // Run from scripts directory
      });

      this.activeProcesses.set(applicationId, pythonProcess);

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        console.log(`📝 [${applicationId}] ${output.trim()}`);
        this.emit('process-output', { applicationId, type: 'stdout', data: output });
      });

      pythonProcess.stderr?.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        console.error(`⚠️ [${applicationId}] ${output.trim()}`);
        this.emit('process-output', { applicationId, type: 'stderr', data: output });
      });

      pythonProcess.on('close', (code) => {
        this.activeProcesses.delete(applicationId);

        if (code === 0) {
          try {
            const result = this.parseAutomationResult(stdout, companyAutomation, data);
            resolve(result);
          } catch (parseError) {
            reject(new Error(`Failed to parse automation result: ${parseError}`));
          }
        } else {
          reject(new Error(`Automation script failed with code ${code}: ${stderr}`));
        }
      });

      pythonProcess.on('error', (error) => {
        this.activeProcesses.delete(applicationId);
        reject(new Error(`Failed to start automation script: ${error.message}`));
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
    });
  }

  /**
   * Execute the company-specific automation script (legacy file mode)
   */
  private async executeAutomation(
    companyAutomation: string,
    data: JobApplicationData,
    applicationId: string
  ): Promise<AutomationResult> {
    return new Promise((resolve, reject) => {
      // Prepare the data to pass to Python script
      const automationData = {
        job_data: {
          job_id: data.jobData.id,
          title: data.jobData.title,
          company: data.jobData.company,
          apply_url: data.jobData.applyUrl,
          location: data.jobData.location,
          description: data.jobData.description
        },
        user_profile: {
          first_name: data.userProfile.firstName,
          last_name: data.userProfile.lastName,
          email: data.userProfile.email,
          phone: data.userProfile.phone,
          resume_url: data.userProfile.resumeUrl,
          resume_local_path: data.userProfile.resumeLocalPath,
          current_title: data.userProfile.currentTitle,
          years_experience: data.userProfile.yearsExperience,
          skills: data.userProfile.skills || [],
          current_location: data.userProfile.currentLocation,
          linkedin_url: data.userProfile.linkedinUrl,
          work_authorization: data.userProfile.workAuthorization,
          cover_letter: data.userProfile.coverLetter,
          custom_fields: data.userProfile.customFields || {}
        },
        automation_config: {
          headless: data.options?.headless ?? this.config.headless,
          timeout: data.options?.timeout ?? this.config.timeout,
          screenshot_enabled: this.config.screenshotEnabled,
          screenshot_path: this.config.screenshotPath
        }
      };

      // Create temporary JSON file with data
      const tempDataPath = path.join(__dirname, '../../data/temp', `${applicationId}.json`);
      
      fs.writeFile(tempDataPath, JSON.stringify(automationData, null, 2))
        .then(() => {
          // Execute Python automation script
          const scriptPath = path.join(this.config.companiesPath, companyAutomation, 'run_automation.py');
          
          const pythonProcess = spawn(this.config.pythonPath, [scriptPath], {
            env: {
              ...process.env,
              JOBSWIPE_DATA_FILE: tempDataPath,
              ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
              OPENAI_API_KEY: process.env.OPENAI_API_KEY,
              GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
            },
            cwd: path.join(this.config.companiesPath, companyAutomation)
          });

          this.activeProcesses.set(applicationId, pythonProcess);

          let stdout = '';
          let stderr = '';

          pythonProcess.stdout?.on('data', (data) => {
            const output = data.toString();
            stdout += output;
            console.log(`📝 [${applicationId}] ${output.trim()}`);
            this.emit('process-output', { applicationId, type: 'stdout', data: output });
          });

          pythonProcess.stderr?.on('data', (data) => {
            const output = data.toString();
            stderr += output;
            console.error(`⚠️ [${applicationId}] ${output.trim()}`);
            this.emit('process-output', { applicationId, type: 'stderr', data: output });
          });

          pythonProcess.on('close', (code) => {
            this.activeProcesses.delete(applicationId);

            // Clean up temporary data file
            fs.unlink(tempDataPath).catch(console.warn);

            if (code === 0) {
              try {
                // Parse JSON result from stdout
                const result = this.parseAutomationResult(stdout, companyAutomation, data);
                resolve(result);
              } catch (parseError) {
                reject(new Error(`Failed to parse automation result: ${parseError}`));
              }
            } else {
              reject(new Error(`Automation script failed with code ${code}: ${stderr}`));
            }
          });

          pythonProcess.on('error', (error) => {
            this.activeProcesses.delete(applicationId);
            // Clean up temporary data file
            fs.unlink(tempDataPath).catch(console.warn);
            reject(new Error(`Failed to start automation script: ${error.message}`));
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
        })
        .catch(reject);
    });
  }

  /**
   * Parse automation result from Python script output
   */
  private parseAutomationResult(stdout: string, companyAutomation: string, data: JobApplicationData): AutomationResult {
    try {
      // Look for JSON result in stdout
      const lines = stdout.trim().split('\n');
      const jsonLine = lines.find(line => line.trim().startsWith('{') && line.trim().endsWith('}'));

      if (!jsonLine) {
        throw new Error('No JSON result found in output');
      }

      const pythonResult = JSON.parse(jsonLine);

      // Convert Python result to our AutomationResult format
      return {
        success: pythonResult.success || false,
        jobId: data.jobData.id,
        userId: data.userId,
        applicationId: pythonResult.application_id || randomUUID(),
        confirmationNumber: pythonResult.confirmation_number,
        executionTime: pythonResult.execution_time_ms || 0,
        companyAutomation,
        status: pythonResult.success ? 'success' : 'failed',
        error: pythonResult.error_message,
        steps: this.parseSteps(pythonResult.steps || []),
        screenshots: pythonResult.screenshots || [],
        captchaEvents: this.parseCaptchaEvents(pythonResult.captcha_events || []),
        performanceMetrics: {
          totalDurationMs: pythonResult.execution_time_ms || 0,
          stepsCompleted: pythonResult.steps_completed || 0,
          successRate: this.calculateSuccessRate(pythonResult.steps || [])
        }
      };

    } catch (error) {
      throw new Error(`Failed to parse automation result: ${error}`);
    }
  }

  private parseSteps(pythonSteps: any[]): AutomationResult['steps'] {
    return pythonSteps.map(step => ({
      stepName: step.step_name || 'unknown',
      action: step.action || '',
      success: step.success || false,
      timestamp: step.timestamp || new Date().toISOString(),
      durationMs: step.duration_ms,
      errorMessage: step.error_message
    }));
  }

  private parseCaptchaEvents(pythonEvents: any[]): AutomationResult['captchaEvents'] {
    return pythonEvents.map(event => ({
      captchaType: event.captcha_type || 'unknown',
      detectedAt: event.detected_at || new Date().toISOString(),
      resolved: event.resolved || false,
      resolutionMethod: event.resolution_method
    }));
  }

  private calculateSuccessRate(steps: any[]): number {
    if (!steps.length) return 0;
    const successfulSteps = steps.filter(step => step.success).length;
    return (successfulSteps / steps.length) * 100;
  }

  // =============================================================================
  // STATISTICS & MANAGEMENT
  // =============================================================================

  /**
   * Update processing statistics
   */
  private updateStats(success: boolean, executionTime: number): void {
    this.stats.totalJobs++;
    this.stats.activeProcesses = this.activeProcesses.size;

    if (success) {
      this.stats.successfulJobs++;
    } else {
      this.stats.failedJobs++;
    }

    // Update rolling average execution time
    const totalTime = this.stats.averageExecutionTime * (this.stats.totalJobs - 1) + executionTime;
    this.stats.averageExecutionTime = Math.round(totalTime / this.stats.totalJobs);

    this.saveStats();
  }

  /**
   * Save statistics to store
   */
  private saveStats(): void {
    this.store.set('stats', this.stats);
  }

  /**
   * Get current statistics
   */
  getStats(): ProcessingStats {
    return { ...this.stats };
  }

  /**
   * Get health status
   */
  getHealthStatus(): { status: string; activeProcesses: number; supportedCompanies: string[] } {
    return {
      status: this.activeProcesses.size < this.config.maxConcurrentJobs ? 'healthy' : 'busy',
      activeProcesses: this.activeProcesses.size,
      supportedCompanies: Array.from(this.supportedCompanies.keys())
    };
  }

  /**
   * Stop a specific job
   */
  async stopJob(applicationId: string): Promise<boolean> {
    const process = this.activeProcesses.get(applicationId);
    if (process) {
      process.kill('SIGTERM');
      this.activeProcesses.delete(applicationId);
      console.log(`🛑 Stopped job: ${applicationId}`);
      return true;
    }
    return false;
  }

  /**
   * Stop all active jobs
   */
  async stopAllJobs(): Promise<void> {
    const activeJobs = Array.from(this.activeProcesses.keys());
    console.log(`🛑 Stopping ${activeJobs.length} active jobs...`);

    for (const applicationId of activeJobs) {
      await this.stopJob(applicationId);
    }

    console.log('✅ All jobs stopped');
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up Simplified Automation Service...');
    
    await this.stopAllJobs();
    this.saveStats();
    
    console.log('✅ Cleanup completed');
    this.emit('cleanup-completed');
  }

  /**
   * Get supported companies and their URL patterns
   */
  getSupportedCompanies(): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    for (const [company, patterns] of this.supportedCompanies.entries()) {
      result[company] = [...patterns];
    }
    return result;
  }

  /**
   * Get browser profile path for pre-filled data
   * Attempts to detect Chrome/Chromium profile on the system
   */
  private getBrowserProfilePath(): string | undefined {
    try {
      const homeDir = process.env.HOME || process.env.USERPROFILE;
      if (!homeDir) return undefined;

      const possiblePaths = [
        path.join(homeDir, '.config', 'google-chrome', 'Default'),
        path.join(homeDir, '.config', 'chromium', 'Default'),
        path.join(homeDir, 'Library', 'Application Support', 'Google', 'Chrome', 'Default'), // macOS
        path.join(homeDir, 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Default') // Windows
      ];

      // Synchronous check (only during initialization, so acceptable)
      for (const profilePath of possiblePaths) {
        try {
          const fs = require('fs');
          if (fs.existsSync(profilePath)) {
            console.log(`✅ Found browser profile: ${profilePath}`);
            return profilePath;
          }
        } catch {
          // Continue to next path
        }
      }

      console.log('ℹ️ No browser profile found (will use clean browser)');
      return undefined;
    } catch (error) {
      console.warn('Failed to detect browser profile:', error);
      return undefined;
    }
  }
}