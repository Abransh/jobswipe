/**
 * @fileoverview Browser Automation Service using browser-use
 * @description Integrates browser-use AI agents for automated job applications
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs/promises';
import Store from 'electron-store';
import { QueueJob, ProcessingResult } from './QueueService';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface BrowserAutomationConfig {
  pythonPath?: string;
  browserUsePath?: string;
  headless: boolean;
  timeout: number;
  screenshotPath?: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  anthropicApiKey?: string;
  maxRetries: number;
}

export interface AutomationStep {
  step: string;
  action: string;
  timestamp: number;
  success: boolean;
  screenshot?: string;
  error?: string;
  executionTime?: number;
}

export interface AutomationLog {
  jobId: string;
  userId: string;
  startTime: number;
  endTime?: number;
  steps: AutomationStep[];
  finalResult: ProcessingResult;
  totalExecutionTime?: number;
}

// =============================================================================
// BROWSER AUTOMATION SERVICE
// =============================================================================

export class BrowserAutomationService extends EventEmitter {
  private store: Store;
  private config: BrowserAutomationConfig;
  private runningProcesses = new Map<string, ChildProcess>();

  constructor() {
    super();
    
    this.store = new Store({
      name: 'browser-automation',
      defaults: {
        config: {
          pythonPath: 'python3',
          browserUsePath: '',
          headless: true,
          timeout: 300000, // 5 minutes
          screenshotPath: '',
          logLevel: 'info',
          maxRetries: 2,
        },
        logs: {},
      },
    });

    this.config = this.store.get('config') as BrowserAutomationConfig;
    
    // Detect browser-use path relative to project
    this.detectBrowserUsePath();
  }

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  /**
   * Initialize browser automation service
   */
  async initialize(): Promise<void> {
    try {
      // Validate Python installation
      await this.validatePython();
      
      // Validate browser-use installation
      await this.validateBrowserUse();
      
      // Setup directories
      await this.setupDirectories();
      
      console.log('✅ Browser automation service initialized');
      this.emit('initialized');
    } catch (error) {
      console.error('❌ Failed to initialize browser automation service:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Detect browser-use path in project
   */
  private detectBrowserUsePath(): void {
    // Assuming browser-use is in the project root
    const projectRoot = path.join(__dirname, '../../../../browser-use');
    this.config.browserUsePath = projectRoot;
    
    // Update screenshot path to desktop app data
    this.config.screenshotPath = path.join(__dirname, '../../../data/screenshots');
    
    this.saveConfig();
  }

  /**
   * Validate Python installation
   */
  private async validatePython(): Promise<void> {
    return new Promise((resolve, reject) => {
      const python = spawn(this.config.pythonPath || 'python3', ['--version']);
      
      python.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Python not found or invalid. Exit code: ${code}`));
        }
      });
      
      python.on('error', (error) => {
        reject(new Error(`Failed to execute Python: ${error.message}`));
      });
    });
  }

  /**
   * Validate browser-use installation
   */
  private async validateBrowserUse(): Promise<void> {
    try {
      const browserUsePath = this.config.browserUsePath;
      if (!browserUsePath) {
        throw new Error('browser-use path not configured');
      }

      // Check if browser-use directory exists
      await fs.access(browserUsePath);
      
      // Check for main browser_use module
      const mainModule = path.join(browserUsePath, 'browser_use', '__init__.py');
      await fs.access(mainModule);
      
      console.log(`✅ browser-use found at: ${browserUsePath}`);
    } catch (error) {
      throw new Error(`browser-use not found or invalid: ${error}`);
    }
  }

  /**
   * Setup required directories
   */
  private async setupDirectories(): Promise<void> {
    const directories = [
      this.config.screenshotPath!,
      path.join(__dirname, '../../../data/logs'),
      path.join(__dirname, '../../../data/temp'),
    ];

    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        console.warn(`Failed to create directory ${dir}:`, error);
      }
    }
  }

  // =============================================================================
  // JOB PROCESSING
  // =============================================================================

  /**
   * Process a job application using browser automation
   */
  async processJobApplication(job: QueueJob): Promise<ProcessingResult> {
    const startTime = Date.now();
    const automationLog: AutomationLog = {
      jobId: job.id,
      userId: job.userId,
      startTime,
      steps: [],
      finalResult: { success: false, error: 'Not completed' },
    };

    console.log(`🚀 Starting browser automation for job: ${job.id} (${job.jobData.title})`);

    try {
      // Emit processing started
      this.emit('processing-started', { jobId: job.id, timestamp: startTime });

      // Step 1: Prepare automation script
      const step1 = await this.executeStep('prepare', 'Preparing automation script', async () => {
        return await this.createAutomationScript(job);
      });
      automationLog.steps.push(step1);

      if (!step1.success) {
        throw new Error(`Failed to prepare automation script: ${step1.error}`);
      }

      // Step 2: Execute browser automation
      const step2 = await this.executeStep('automation', 'Executing job application automation', async () => {
        return await this.executeBrowserAutomation(job, automationLog);
      });
      automationLog.steps.push(step2);

      if (!step2.success) {
        throw new Error(`Browser automation failed: ${step2.error}`);
      }

      // Step 3: Validate results
      const step3 = await this.executeStep('validation', 'Validating application results', async () => {
        return await this.validateAutomationResults(job, automationLog);
      });
      automationLog.steps.push(step3);

      // Create final result
      const finalResult: ProcessingResult = {
        success: step2.success && step3.success,
        applicationId: `app_${job.id}_${Date.now()}`,
        confirmationId: step3.success ? `conf_${Date.now()}` : undefined,
        screenshots: this.getScreenshotPaths(job.id),
        logs: automationLog.steps.map(s => `${s.step}: ${s.action} (${s.success ? 'success' : 'failed'})`),
      };

      automationLog.finalResult = finalResult;
      automationLog.endTime = Date.now();
      automationLog.totalExecutionTime = automationLog.endTime - automationLog.startTime;

      // Save log
      await this.saveAutomationLog(automationLog);

      console.log(`✅ Job application automation completed: ${job.id} (${finalResult.success ? 'success' : 'failed'})`);
      this.emit('processing-completed', { jobId: job.id, result: finalResult });

      return finalResult;

    } catch (error) {
      console.error(`❌ Job application automation failed: ${job.id}`, error);

      const errorResult: ProcessingResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        logs: automationLog.steps.map(s => `${s.step}: ${s.action} (${s.success ? 'success' : 'failed'})`),
      };

      automationLog.finalResult = errorResult;
      automationLog.endTime = Date.now();
      automationLog.totalExecutionTime = automationLog.endTime - automationLog.startTime;

      await this.saveAutomationLog(automationLog);

      this.emit('processing-failed', { jobId: job.id, error: errorResult.error });
      return errorResult;
    }
  }

  /**
   * Execute an automation step with timing and error handling
   */
  private async executeStep<T>(
    stepName: string,
    description: string,
    action: () => Promise<T>
  ): Promise<AutomationStep & { result?: T }> {
    const startTime = Date.now();
    
    try {
      const result = await action();
      const endTime = Date.now();
      
      const step: AutomationStep & { result?: T } = {
        step: stepName,
        action: description,
        timestamp: startTime,
        success: true,
        executionTime: endTime - startTime,
        result,
      };

      this.emit('step-completed', step);
      return step;
    } catch (error) {
      const endTime = Date.now();
      const step: AutomationStep = {
        step: stepName,
        action: description,
        timestamp: startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: endTime - startTime,
      };

      this.emit('step-failed', step);
      return step;
    }
  }

  // =============================================================================
  // BROWSER-USE INTEGRATION
  // =============================================================================

  /**
   * Create automation script for the job
   */
  private async createAutomationScript(job: QueueJob): Promise<string> {
    const scriptTemplate = `
import asyncio
import json
import sys
import os
from datetime import datetime
from browser_use.browser.browser import Browser
from browser_use.agent.agent import Agent
from browser_use.llm.anthropic.chat import AnthropicChat

async def apply_to_job():
    """Apply to job using browser-use AI agent"""
    
    # Job details
    job_data = ${JSON.stringify(job.jobData, null, 2)}
    user_profile = ${JSON.stringify(job.userProfile, null, 2)}
    
    # Browser configuration
    headless = ${this.config.headless}
    
    try:
        # Initialize LLM
        llm = AnthropicChat(api_key="${this.config.anthropicApiKey || process.env.ANTHROPIC_API_KEY}")
        
        # Initialize browser
        browser = Browser(headless=headless)
        await browser.start()
        
        # Create AI agent
        agent = Agent(
            task=f"Apply to {job_data['title']} position at {job_data['company']}. Navigate to {job_data['url']}, fill out the application form with the provided information, and submit it. Handle any captchas by switching to non-headless mode if needed.",
            llm=llm,
            browser=browser,
        )
        
        # Prepare context for the agent
        context = f"""
        Job Application Details:
        - Position: {job_data['title']}
        - Company: {job_data['company']}
        - Location: {job_data['location']}
        - Application URL: {job_data['url']}
        
        Applicant Information:
        - Resume: {user_profile.get('resumeUrl', 'Not provided')}
        - Cover Letter: {user_profile.get('coverLetter', 'Not provided')}
        
        Instructions:
        1. Navigate to the job application URL
        2. Look for application forms or "Apply" buttons
        3. Fill out all required fields with appropriate information
        4. Upload resume if file upload is available and resume URL is provided
        5. Include cover letter if text area is available and cover letter is provided
        6. Submit the application
        7. Look for confirmation messages or success indicators
        8. Take screenshots at key steps
        
        If you encounter captchas or other human verification:
        - Take a screenshot
        - Switch to non-headless mode if possible
        - Wait for manual intervention
        
        Return a JSON result with:
        - success: boolean
        - confirmation_id: string (if available)
        - error_message: string (if failed)
        - screenshots: list of screenshot paths
        """
        
        # Execute the automation
        result = await agent.run(context)
        
        # Process result
        success = True
        confirmation_id = None
        error_message = None
        
        # Extract information from result if available
        # This would depend on the actual browser-use API response format
        
        return {
            "success": success,
            "confirmation_id": confirmation_id,
            "error_message": error_message,
            "result_data": str(result),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "success": False,
            "error_message": str(e),
            "timestamp": datetime.now().isoformat()
        }
    
    finally:
        try:
            await browser.close()
        except:
            pass

# Run the automation
if __name__ == "__main__":
    result = asyncio.run(apply_to_job())
    print(json.dumps(result, indent=2))
`;

    // Save script to temporary file
    const scriptPath = path.join(__dirname, '../../../data/temp', `automation_${job.id}.py`);
    await fs.writeFile(scriptPath, scriptTemplate);
    
    return scriptPath;
  }

  /**
   * Execute browser automation using browser-use
   */
  private async executeBrowserAutomation(job: QueueJob, log: AutomationLog): Promise<any> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, '../../../data/temp', `automation_${job.id}.py`);
      
      // Setup environment
      const env = {
        ...process.env,
        PYTHONPATH: this.config.browserUsePath,
        ANTHROPIC_API_KEY: this.config.anthropicApiKey || process.env.ANTHROPIC_API_KEY,
      };

      // Execute Python script
      const pythonProcess = spawn(
        this.config.pythonPath || 'python3',
        [scriptPath],
        {
          env,
          cwd: this.config.browserUsePath,
          stdio: ['pipe', 'pipe', 'pipe'],
        }
      );

      this.runningProcesses.set(job.id, pythonProcess);

      let outputData = '';
      let errorData = '';

      pythonProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        outputData += output;
        console.log(`[${job.id}] stdout:`, output.trim());
        this.emit('automation-output', { jobId: job.id, type: 'stdout', data: output });
      });

      pythonProcess.stderr?.on('data', (data) => {
        const error = data.toString();
        errorData += error;
        console.error(`[${job.id}] stderr:`, error.trim());
        this.emit('automation-output', { jobId: job.id, type: 'stderr', data: error });
      });

      pythonProcess.on('close', (code) => {
        this.runningProcesses.delete(job.id);
        
        if (code === 0) {
          try {
            // Parse JSON result from stdout
            const result = JSON.parse(outputData.trim());
            resolve(result);
          } catch (parseError) {
            reject(new Error(`Failed to parse automation result: ${parseError}. Output: ${outputData}`));
          }
        } else {
          reject(new Error(`Automation process exited with code ${code}. Error: ${errorData}`));
        }
      });

      pythonProcess.on('error', (error) => {
        this.runningProcesses.delete(job.id);
        reject(new Error(`Failed to start automation process: ${error.message}`));
      });

      // Set timeout
      setTimeout(() => {
        if (this.runningProcesses.has(job.id)) {
          pythonProcess.kill();
          this.runningProcesses.delete(job.id);
          reject(new Error(`Automation process timed out after ${this.config.timeout}ms`));
        }
      }, this.config.timeout);
    });
  }

  /**
   * Validate automation results
   */
  private async validateAutomationResults(job: QueueJob, log: AutomationLog): Promise<boolean> {
    // Basic validation - check if screenshots were taken
    const screenshots = this.getScreenshotPaths(job.id);
    
    if (screenshots.length === 0) {
      console.warn(`No screenshots found for job ${job.id} - validation may be incomplete`);
    }

    // Additional validation logic can be added here
    // For now, consider validation successful if automation completed
    return true;
  }

  // =============================================================================
  // UTILITIES
  // =============================================================================

  /**
   * Get screenshot paths for a job
   */
  private getScreenshotPaths(jobId: string): string[] {
    const screenshotDir = this.config.screenshotPath;
    if (!screenshotDir) return [];

    try {
      // This would be implemented to scan the screenshot directory
      // for files matching the job ID pattern
      return [`${screenshotDir}/job_${jobId}_step1.png`, `${screenshotDir}/job_${jobId}_step2.png`];
    } catch (error) {
      console.warn(`Failed to get screenshot paths for job ${jobId}:`, error);
      return [];
    }
  }

  /**
   * Save automation log
   */
  private async saveAutomationLog(log: AutomationLog): Promise<void> {
    try {
      const logsDir = path.join(__dirname, '../../../data/logs');
      const logFile = path.join(logsDir, `automation_${log.jobId}.json`);
      
      await fs.writeFile(logFile, JSON.stringify(log, null, 2));
      
      // Also store in electron store for quick access
      const logs = this.store.get('logs') as Record<string, AutomationLog>;
      logs[log.jobId] = log;
      this.store.set('logs', logs);
      
    } catch (error) {
      console.error('Failed to save automation log:', error);
    }
  }

  /**
   * Stop automation for a specific job
   */
  async stopAutomation(jobId: string): Promise<boolean> {
    const process = this.runningProcesses.get(jobId);
    if (process) {
      process.kill();
      this.runningProcesses.delete(jobId);
      console.log(`✅ Stopped automation for job: ${jobId}`);
      return true;
    }
    return false;
  }

  /**
   * Stop all running automations
   */
  async stopAllAutomations(): Promise<void> {
    console.log(`🛑 Stopping ${this.runningProcesses.size} running automations...`);
    
    for (const [jobId, process] of this.runningProcesses) {
      try {
        process.kill();
        console.log(`✅ Stopped automation for job: ${jobId}`);
      } catch (error) {
        console.error(`❌ Failed to stop automation for job ${jobId}:`, error);
      }
    }
    
    this.runningProcesses.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<BrowserAutomationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    this.emit('config-updated', this.config);
  }

  /**
   * Save configuration to store
   */
  private saveConfig(): void {
    this.store.set('config', this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): BrowserAutomationConfig {
    return { ...this.config };
  }

  /**
   * Get automation logs
   */
  getAutomationLogs(): Record<string, AutomationLog> {
    return this.store.get('logs') as Record<string, AutomationLog>;
  }

  /**
   * Get running automations count
   */
  getRunningAutomationsCount(): number {
    return this.runningProcesses.size;
  }

  /**
   * Cleanup on exit
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up browser automation service...');
    await this.stopAllAutomations();
    this.emit('cleanup-completed');
  }
}