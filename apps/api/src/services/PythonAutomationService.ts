/**
 * @fileoverview Python Automation Service for API Server
 * @description Executes Python automation scripts for job applications
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Direct Python script execution with comprehensive error handling
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import * as path from 'path';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export interface JobApplicationData {
  jobId: string;
  userId: string;
  jobData: {
    title: string;
    company: string;
    url: string;
    description: string;
    requirements?: string;
    salary?: {
      min?: number;
      max?: number;
      currency?: string;
    };
    location: string;
    remote: boolean;
    type: string;
    level: string;
  };
  userProfile: {
    resumeUrl?: string;
    coverLetter?: string;
    preferences: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      currentTitle?: string;
      yearsExperience?: number;
      skills?: string[];
      currentLocation?: string;
      linkedinUrl?: string;
      workAuthorization?: string;
      applicationId: string;
    };
  };
  priority: number;
  metadata: {
    source: 'web' | 'mobile' | 'desktop';
    deviceId?: string;
    timestamp: string;
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

// =============================================================================
// PYTHON AUTOMATION SERVICE
// =============================================================================

export class PythonAutomationService extends EventEmitter {
  private config: AutomationConfig;
  private activeProcesses = new Map<string, ChildProcess>();
  private supportedCompanies: Map<string, string[]> = new Map();
  private isInitialized = false;

  constructor() {
    super();

    // Configuration
    this.config = {
      pythonPath: process.env.PYTHON_PATH || 'python3',
      companiesPath: path.join(__dirname, '../companies'),
      headless: process.env.AUTOMATION_HEADLESS !== 'false',
      timeout: parseInt(process.env.AUTOMATION_TIMEOUT || '300000'), // 5 minutes
      maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS || '3'),
      screenshotEnabled: process.env.SCREENSHOT_ENABLED !== 'false',
      screenshotPath: path.join(__dirname, '../../data/screenshots')
    };

    this.loadSupportedCompanies();
  }

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  /**
   * Initialize the Python automation service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🚀 Initializing Python Automation Service...');

      // Create required directories
      await this.createDirectories();

      // Validate Python environment
      await this.validatePythonEnvironment();

      // Load supported companies
      await this.loadSupportedCompanies();

      this.isInitialized = true;
      console.log('✅ Python Automation Service initialized');
      console.log(`📋 Supported companies: ${Array.from(this.supportedCompanies.keys()).join(', ')}`);
      
    } catch (error) {
      console.error('❌ Failed to initialize Python Automation Service:', error);
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
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    const applicationId = randomUUID();

    console.log(`🚀 Processing job application: ${data.jobData.title} at ${data.jobData.company}`);

    // Check concurrency limits
    if (this.activeProcesses.size >= this.config.maxConcurrentJobs) {
      throw new Error(`Maximum concurrent jobs (${this.config.maxConcurrentJobs}) reached`);
    }

    try {
      // Detect company automation to use
      const companyAutomation = this.detectCompanyAutomation(data.jobData.url);
      
      if (!companyAutomation) {
        throw new Error(`No automation found for URL: ${data.jobData.url}`);
      }

      console.log(`🎯 Using ${companyAutomation} automation`);

      // Execute the automation
      const result = await this.executeAutomation(companyAutomation, data, applicationId);

      console.log(`✅ Job application completed successfully: ${data.jobData.title}`);
      this.emit('application-completed', result);

      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error(`❌ Job application failed: ${data.jobData.title}`, error);

      const errorResult: AutomationResult = {
        success: false,
        jobId: data.jobId,
        userId: data.userId,
        applicationId,
        executionTime,
        companyAutomation: 'unknown',
        status: 'failed',
        error: errorMessage,
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

    for (const [company, patterns] of Array.from(this.supportedCompanies.entries())) {
      if (patterns.some(pattern => urlLower.includes(pattern))) {
        return company;
      }
    }

    return null;
  }

  /**
   * Execute the company-specific automation script
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
          job_id: data.jobId,
          title: data.jobData.title,
          company: data.jobData.company,
          apply_url: data.jobData.url,
          location: data.jobData.location,
          description: data.jobData.description
        },
        user_profile: {
          first_name: data.userProfile.preferences.firstName,
          last_name: data.userProfile.preferences.lastName,
          email: data.userProfile.preferences.email,
          phone: data.userProfile.preferences.phone,
          resume_url: data.userProfile.resumeUrl,
          current_title: data.userProfile.preferences.currentTitle,
          years_experience: data.userProfile.preferences.yearsExperience,
          skills: data.userProfile.preferences.skills || [],
          current_location: data.userProfile.preferences.currentLocation,
          linkedin_url: data.userProfile.preferences.linkedinUrl,
          work_authorization: data.userProfile.preferences.workAuthorization,
          cover_letter: data.userProfile.coverLetter
        },
        automation_config: {
          headless: this.config.headless,
          timeout: this.config.timeout,
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
        jobId: data.jobId,
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
  // HEALTH & STATUS
  // =============================================================================

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
   * Get supported companies and their URL patterns
   */
  getSupportedCompanies(): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    for (const [company, patterns] of Array.from(this.supportedCompanies.entries())) {
      result[company] = [...patterns];
    }
    return result;
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
    console.log('🧹 Cleaning up Python Automation Service...');
    
    await this.stopAllJobs();
    
    console.log('✅ Cleanup completed');
  }
}

export default PythonAutomationService;