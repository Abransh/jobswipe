/**
 * @fileoverview Enterprise Browser Automation Service
 * @description AI-powered job application automation using browser-use library
 * @version 2.0.0
 * @author JobSwipe Team
 * @security Enterprise-grade automation with comprehensive error handling
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import Store from 'electron-store';
import { QueueJob, ProcessingResult } from './QueueService';
import { PythonBridge, PythonBridgeConfig } from './PythonBridge';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface BrowserAutomationConfig {
  pythonPath: string;
  browserUsePath: string;
  headless: boolean;
  timeout: number;
  screenshotPath: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  anthropicApiKey?: string;
  openaiApiKey?: string;
  maxRetries: number;
  maxConcurrentJobs: number;
  captchaTimeout: number;
  processingMode: 'headless' | 'headful' | 'adaptive';
  proxyConfig?: {
    enabled: boolean;
    rotationInterval: number;
    providers: string[];
  };
  rateLimit: {
    requestsPerMinute: number;
    burstLimit: number;
  };
}

export interface AutomationStep {
  stepId: string;
  step: string;
  action: string;
  timestamp: number;
  success: boolean;
  screenshot?: string;
  error?: string;
  executionTime?: number;
  retryCount?: number;
  metadata?: Record<string, any>;
}

export interface CaptchaEvent {
  jobId: string;
  captchaType: 'text' | 'image' | 'recaptcha' | 'hcaptcha' | 'cloudflare' | 'unknown';
  timestamp: number;
  url: string;
  screenshot?: string;
  solved: boolean;
  solutionMethod: 'ai' | 'manual' | 'service' | 'failed';
  solutionTime?: number;
}

export interface ProcessorStats {
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  captchaEncountered: number;
  captchaSolved: number;
  averageProcessingTime: number;
  activeProcesses: number;
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
  private jobQueue = new Map<string, QueueJob>();
  private processingStats: ProcessorStats;
  private captchaEvents: CaptchaEvent[] = [];
  private pythonBridge: PythonBridge;
  private rateLimit = {
    requestCount: 0,
    lastReset: Date.now(),
    burstCount: 0
  };

  constructor() {
    super();
    
    this.store = new Store({
      name: 'browser-automation-v2',
      defaults: {
        config: {
          pythonPath: 'python3',
          browserUsePath: path.join(__dirname, '../../../../browser-use'),
          headless: true,
          timeout: 300000, // 5 minutes
          screenshotPath: path.join(__dirname, '../../../data/screenshots'),
          logLevel: 'info',
          maxRetries: 3,
          maxConcurrentJobs: 3,
          captchaTimeout: 120000, // 2 minutes for captcha solving
          processingMode: 'adaptive',
          rateLimit: {
            requestsPerMinute: 30,
            burstLimit: 5
          }
        },
        logs: {},
        stats: {
          totalJobs: 0,
          successfulJobs: 0,
          failedJobs: 0,
          captchaEncountered: 0,
          captchaSolved: 0,
          averageProcessingTime: 0,
          activeProcesses: 0
        }
      },
    }) as any;

    this.config = this.store.get('config') as BrowserAutomationConfig;
    this.processingStats = this.store.get('stats') as ProcessorStats;
    
    // Initialize Python bridge with optimized configuration
    const bridgeConfig: Partial<PythonBridgeConfig> = {
      pythonPath: this.config.pythonPath,
      browserUsePath: this.config.browserUsePath,
      maxProcesses: this.config.maxConcurrentJobs,
      processTimeout: this.config.timeout,
      logLevel: this.config.logLevel,
      enableProcessPool: true
    };
    
    this.pythonBridge = new PythonBridge(bridgeConfig);
    this.setupPythonBridgeListeners();
    
    // Setup rate limiting reset
    this.setupRateLimitReset();
  }

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  /**
   * Initialize browser automation service with Python bridge
   */
  async initialize(): Promise<void> {
    try {
      // Initialize Python bridge first
      await this.pythonBridge.initialize();
      
      // Setup directories
      await this.setupDirectories();
      
      console.log('✅ Browser automation service initialized with Python bridge');
      this.emit('initialized');
    } catch (error) {
      console.error('❌ Failed to initialize browser automation service:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Setup Python bridge event listeners
   */
  private setupPythonBridgeListeners(): void {
    this.pythonBridge.on('task-started', (data) => {
      console.log(`🚀 Python task started: ${data.task.id}`);
      this.emit('python-task-started', data);
    });

    this.pythonBridge.on('task-completed', (data) => {
      console.log(`✅ Python task completed: ${data.task.id}`);
      this.emit('python-task-completed', data);
    });

    this.pythonBridge.on('task-failed', (data) => {
      console.error(`❌ Python task failed: ${data.task.id}`, data.error);
      this.emit('python-task-failed', data);
    });

    this.pythonBridge.on('process-output', (data) => {
      this.emit('automation-output', {
        jobId: data.taskId,
        type: data.type,
        data: data.data,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Setup rate limiting reset timer
   */
  private setupRateLimitReset(): void {
    setInterval(() => {
      this.rateLimit.requestCount = 0;
      this.rateLimit.burstCount = 0;
      this.rateLimit.lastReset = Date.now();
    }, 60000); // Reset every minute
  }

  /**
   * Check if rate limit allows new request
   */
  private checkRateLimit(): boolean {
    const { requestsPerMinute, burstLimit } = this.config.rateLimit;
    
    // Check per-minute limit
    if (this.rateLimit.requestCount >= requestsPerMinute) {
      console.warn('⚠️ Rate limit exceeded: requests per minute');
      return false;
    }
    
    // Check burst limit
    if (this.rateLimit.burstCount >= burstLimit) {
      console.warn('⚠️ Rate limit exceeded: burst limit');
      return false;
    }
    
    return true;
  }

  /**
   * Increment rate limit counters
   */
  private incrementRateLimit(): void {
    this.rateLimit.requestCount++;
    this.rateLimit.burstCount++;
    
    // Reset burst counter after 10 seconds
    setTimeout(() => {
      this.rateLimit.burstCount = Math.max(0, this.rateLimit.burstCount - 1);
    }, 10000);
  }

  /**
   * Validate Python installation and browser-use dependencies
   */
  private async validatePython(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check Python version (requires 3.11+)
      const python = spawn(this.config.pythonPath, ['-c', 'import sys; print(sys.version_info >= (3, 11))']);
      
      let output = '';
      python.stdout?.on('data', (data) => {
        output += data.toString();
      });
      
      python.on('close', (code) => {
        if (code === 0 && output.trim() === 'True') {
          console.log('✅ Python 3.11+ detected');
          resolve();
        } else {
          reject(new Error(`Python 3.11+ required. Current version check failed. Output: ${output}`));
        }
      });
      
      python.on('error', (error) => {
        reject(new Error(`Failed to execute Python: ${error.message}`));
      });
    });
  }

  /**
   * Validate browser-use installation and dependencies
   */
  private async validateBrowserUse(): Promise<void> {
    try {
      const browserUsePath = this.config.browserUsePath;
      
      // Check if browser-use directory exists
      await fs.access(browserUsePath);
      
      // Check for main browser_use module
      const mainModule = path.join(browserUsePath, 'browser_use', '__init__.py');
      await fs.access(mainModule);
      
      // Check for required dependencies
      const dependencies = ['playwright', 'anthropic', 'openai', 'pydantic'];
      for (const dep of dependencies) {
        await this.checkPythonPackage(dep);
      }
      
      // Verify Playwright browser installation
      await this.validatePlaywrightBrowsers();
      
      console.log(`✅ browser-use validated at: ${browserUsePath}`);
    } catch (error) {
      throw new Error(`browser-use validation failed: ${error}`);
    }
  }

  /**
   * Check if Python package is installed
   */
  private async checkPythonPackage(packageName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const python = spawn(this.config.pythonPath, ['-c', `import ${packageName}; print('${packageName} OK')`], {
        cwd: this.config.browserUsePath
      });
      
      python.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Python package '${packageName}' not found`));
        }
      });
      
      python.on('error', (error) => {
        reject(new Error(`Failed to check package ${packageName}: ${error.message}`));
      });
    });
  }

  /**
   * Validate Playwright browsers are installed
   */
  private async validatePlaywrightBrowsers(): Promise<void> {
    return new Promise((resolve, reject) => {
      const python = spawn(this.config.pythonPath, ['-c', 'from playwright.sync_api import sync_playwright; p = sync_playwright().start(); p.chromium.launch(); print("Browsers OK")'], {
        cwd: this.config.browserUsePath
      });
      
      python.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error('Playwright browsers not installed. Run: playwright install chromium'));
        }
      });
      
      python.on('error', (error) => {
        reject(new Error(`Failed to validate Playwright: ${error.message}`));
      });
    });
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
   * Process a job application using modern browser automation
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

    console.log(`🚀 Starting modern browser automation for job: ${job.id} (${job.jobData.title} at ${job.jobData.company})`);

    // Check rate limits
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait before processing more jobs.');
    }
    
    this.incrementRateLimit();
    this.jobQueue.set(job.id, job);
    this.updateStats('totalJobs', 1);

    try {
      // Emit processing started
      this.emit('processing-started', { jobId: job.id, timestamp: startTime });

      // Step 1: Prepare browser-use agent
      const step1 = await this.executeStep('prepare', 'Preparing AI automation agent', async () => {
        return await this.createBrowserUseAgent(job);
      });
      automationLog.steps.push(step1);

      if (!step1.success) {
        throw new Error(`Failed to prepare automation agent: ${step1.error}`);
      }

      // Step 2: Execute intelligent job application
      const step2 = await this.executeStep('automation', 'Executing AI-powered job application', async () => {
        return await this.executeIntelligentAutomation(job, automationLog);
      });
      automationLog.steps.push(step2);

      if (!step2.success) {
        throw new Error(`AI automation failed: ${step2.error}`);
      }

      // Step 3: Validate and extract results
      const step3 = await this.executeStep('validation', 'Validating application success', async () => {
        return await this.validateApplicationSuccess(job, automationLog);
      });
      automationLog.steps.push(step3);

      // Create final result
      const finalResult: ProcessingResult = {
        success: step2.success && step3.success,
        applicationId: `jobswipe_${job.id}_${Date.now()}`,
        confirmationId: step3.success ? step3.result?.confirmationId : undefined,
        screenshots: await this.getScreenshotPaths(job.id),
        logs: automationLog.steps.map(s => `${s.step}: ${s.action} (${s.success ? 'success' : 'failed'})`),
      };

      automationLog.finalResult = finalResult;
      automationLog.endTime = Date.now();
      automationLog.totalExecutionTime = automationLog.endTime - automationLog.startTime;

      // Update statistics
      if (finalResult.success) {
        this.updateStats('successfulJobs', 1);
      } else {
        this.updateStats('failedJobs', 1);
      }
      
      this.updateStats('averageProcessingTime', automationLog.totalExecutionTime);
      
      // Save comprehensive log
      await this.saveAutomationLog(automationLog);

      console.log(`✅ AI job application completed: ${job.id} (${finalResult.success ? 'SUCCESS' : 'FAILED'})`);
      this.emit('processing-completed', { jobId: job.id, result: finalResult });

      return finalResult;

    } catch (error) {
      console.error(`❌ AI job application failed: ${job.id}`, error);
      
      this.updateStats('failedJobs', 1);

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
    } finally {
      this.jobQueue.delete(job.id);
    }
  }

  /**
   * Execute an automation step with comprehensive error handling and retry logic
   */
  private async executeStep<T>(
    stepName: string,
    description: string,
    action: () => Promise<T>,
    retryCount = 0
  ): Promise<AutomationStep & { result?: T }> {
    const stepId = randomUUID();
    const startTime = Date.now();
    
    console.log(`📝 Executing step: ${stepName} (${description})`);
    
    try {
      const result = await action();
      const endTime = Date.now();
      
      const step: AutomationStep & { result?: T } = {
        stepId,
        step: stepName,
        action: description,
        timestamp: startTime,
        success: true,
        executionTime: endTime - startTime,
        retryCount,
        result,
        metadata: {
          completed: true,
          duration: endTime - startTime
        }
      };

      console.log(`✅ Step completed: ${stepName} (${endTime - startTime}ms)`);
      this.emit('step-completed', step);
      return step;
    } catch (error) {
      const endTime = Date.now();
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Determine if retry is appropriate
      const shouldRetry = retryCount < this.config.maxRetries && 
                         this.isRetryableError(error);
      
      if (shouldRetry) {
        console.warn(`⚠️ Step failed, retrying: ${stepName} (attempt ${retryCount + 1}/${this.config.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return this.executeStep(stepName, description, action, retryCount + 1);
      }
      
      const step: AutomationStep = {
        stepId,
        step: stepName,
        action: description,
        timestamp: startTime,
        success: false,
        error: errorMessage,
        executionTime: endTime - startTime,
        retryCount,
        metadata: {
          failed: true,
          finalAttempt: true,
          errorType: this.classifyError(error)
        }
      };

      console.error(`❌ Step failed: ${stepName} - ${errorMessage}`);
      this.emit('step-failed', step);
      return step;
    }
  }

  /**
   * Determine if error is retryable
   */
  private isRetryableError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    // Network errors are retryable
    if (errorMessage.includes('network') || errorMessage.includes('timeout') || 
        errorMessage.includes('connection') || errorMessage.includes('econnreset')) {
      return true;
    }
    
    // Browser launch errors are retryable
    if (errorMessage.includes('browser') && errorMessage.includes('launch')) {
      return true;
    }
    
    // Page navigation errors are retryable
    if (errorMessage.includes('navigation') || errorMessage.includes('page')) {
      return true;
    }
    
    return false;
  }

  /**
   * Classify error type for analytics
   */
  private classifyError(error: any): string {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    if (errorMessage.includes('captcha')) return 'CAPTCHA';
    if (errorMessage.includes('network') || errorMessage.includes('timeout')) return 'NETWORK';
    if (errorMessage.includes('form') || errorMessage.includes('field')) return 'FORM_ERROR';
    if (errorMessage.includes('rate') || errorMessage.includes('limit')) return 'RATE_LIMIT';
    if (errorMessage.includes('blocked') || errorMessage.includes('banned')) return 'BLOCKED';
    if (errorMessage.includes('login') || errorMessage.includes('auth')) return 'AUTH_ERROR';
    
    return 'UNKNOWN';
  }

  /**
   * Update processing statistics
   */
  private updateStats(metric: keyof ProcessorStats, value: number): void {
    if (metric === 'averageProcessingTime') {
      // Calculate rolling average
      const currentAvg = this.processingStats.averageProcessingTime;
      const totalJobs = this.processingStats.totalJobs;
      this.processingStats.averageProcessingTime = 
        (currentAvg * (totalJobs - 1) + value) / totalJobs;
    } else {
      (this.processingStats[metric] as number) += value;
    }
    
    // Persist stats
    this.store.set('stats', this.processingStats);
  }

  // =============================================================================
  // BROWSER-USE INTEGRATION
  // =============================================================================

  /**
   * Create modern browser-use AI agent for job application
   */
  private async createBrowserUseAgent(job: QueueJob): Promise<string> {
    const agentScript = `
import asyncio
import json
import sys
import os
import time
from datetime import datetime
from pathlib import Path

sys.path.append('${this.config.browserUsePath}')

from browser_use import Agent, ActionResult
from browser_use.llm import ChatAnthropic, ChatOpenAI
from browser_use.controller import Controller
from browser_use.browser import BrowserConfig, BrowserSession

# JobSwipe-specific custom functions
controller = Controller()

@controller.action(
    "Handle captcha detection and solving",
    domains=["*"]
)
async def handle_captcha(browser_session: BrowserSession):
    """Detect and handle various types of captchas"""
    page = await browser_session.get_current_page()
    
    # Common captcha selectors
    captcha_selectors = [
        'iframe[src*="recaptcha"]',
        'iframe[src*="hcaptcha"]', 
        'div[class*="captcha"]',
        'img[src*="captcha"]',
        '[data-sitekey]',
        '.g-recaptcha',
        '.h-captcha'
    ]
    
    for selector in captcha_selectors:
        element = page.locator(selector)
        if await element.count() > 0:
            # Take screenshot for manual intervention
            screenshot_path = f"screenshots/captcha_{int(time.time())}.png"
            await page.screenshot(path=screenshot_path)
            
            return ActionResult(
                extracted_content=f"CAPTCHA_DETECTED:{selector}",
                include_in_memory=True,
                screenshot=screenshot_path
            )
    
    return ActionResult(extracted_content="NO_CAPTCHA_DETECTED")

@controller.action(
    "Upload resume file to job application",
    domains=["*"]
)
async def upload_resume(file_path: str, browser_session: BrowserSession):
    """Upload resume to job application form"""
    page = await browser_session.get_current_page()
    
    # Common file upload selectors
    upload_selectors = [
        'input[type="file"]',
        'input[name*="resume"]',
        'input[name*="cv"]',
        'input[accept*=".pdf"]',
        '[data-testid*="upload"]'
    ]
    
    for selector in upload_selectors:
        elements = page.locator(selector)
        count = await elements.count()
        
        if count > 0:
            try:
                await elements.first.set_input_files(file_path)
                return ActionResult(
                    extracted_content=f"RESUME_UPLOADED:{file_path}",
                    include_in_memory=True
                )
            except Exception as e:
                continue
    
    return ActionResult(
        extracted_content="UPLOAD_FAILED:No upload element found",
        include_in_memory=True
    )

@controller.action(
    "Extract application confirmation details",
    domains=["*"]
)
async def extract_confirmation(browser_session: BrowserSession):
    """Extract confirmation ID and success indicators"""
    page = await browser_session.get_current_page()
    
    # Look for success indicators
    success_patterns = [
        'thank you',
        'application submitted',
        'successfully applied',
        'confirmation',
        'application received'
    ]
    
    page_text = await page.inner_text('body')
    page_text_lower = page_text.lower()
    
    for pattern in success_patterns:
        if pattern in page_text_lower:
            # Try to extract confirmation ID
            import re
            conf_patterns = [
                r'confirmation.*?([A-Z0-9]{6,})',
                r'reference.*?([A-Z0-9]{6,})',
                r'application.*?id.*?([A-Z0-9]{6,})'
            ]
            
            confirmation_id = None
            for conf_pattern in conf_patterns:
                match = re.search(conf_pattern, page_text, re.IGNORECASE)
                if match:
                    confirmation_id = match.group(1)
                    break
            
            return ActionResult(
                extracted_content=f"SUCCESS:{confirmation_id or 'CONFIRMED'}",
                include_in_memory=True
            )
    
    return ActionResult(
        extracted_content="PENDING:No clear confirmation found",
        include_in_memory=True
    )

async def apply_to_job():
    """Modern AI-powered job application using browser-use"""
    
    # Job and user data
    job_data = ${JSON.stringify(job.jobData, null, 2)}
    user_profile = ${JSON.stringify(job.userProfile, null, 2)}
    
    # Configuration
    headless = ${this.config.headless}
    processing_mode = "${this.config.processingMode}"
    
    try:
        # Initialize LLM based on available API keys
        llm = None
        if "${this.config.anthropicApiKey || process.env.ANTHROPIC_API_KEY || ''}":
            llm = ChatAnthropic(
                api_key="${this.config.anthropicApiKey || process.env.ANTHROPIC_API_KEY}",
                model="claude-3-sonnet-20240229",
                temperature=0.1
            )
        elif "${this.config.openaiApiKey || process.env.OPENAI_API_KEY || ''}":
            llm = ChatOpenAI(
                api_key="${this.config.openaiApiKey || process.env.OPENAI_API_KEY}",
                model="gpt-4-turbo-preview",
                temperature=0.1
            )
        else:
            raise Exception("No valid API key found for LLM")
        
        # Browser configuration
        browser_config = BrowserConfig(
            headless=headless if processing_mode != 'headful' else False,
            disable_security=True,  # For easier automation
            window_width=1920,
            window_height=1080
        )
        
        browser_session = BrowserSession(browser_config=browser_config)
        await browser_session.start()
        
        # Create specialized JobSwipe AI agent
        task_description = f"""
        You are a professional job application assistant for JobSwipe. 
        
        TASK: Apply to the {job_data['title']} position at {job_data['company']}
        
        JOB DETAILS:
        - Position: {job_data['title']}
        - Company: {job_data['company']} 
        - Location: {job_data['location']}
        - Application URL: {job_data['url']}
        
        USER PROFILE:
        - Name: {user_profile.get('name', 'Not provided')}
        - Email: {user_profile.get('email', 'Not provided')}
        - Phone: {user_profile.get('phone', 'Not provided')}
        - Resume URL: {user_profile.get('resumeUrl', 'Not provided')}
        - Cover Letter: {user_profile.get('coverLetter', 'Not provided')}
        
        INSTRUCTIONS:
        1. Navigate to the job application URL
        2. Look for "Apply" buttons or application forms
        3. If login is required, handle appropriately (but don't create new accounts)
        4. Fill all required application fields using the user profile data
        5. Use the upload_resume function if file upload is needed
        6. Use handle_captcha function if any captchas are detected
        7. Submit the application
        8. Use extract_confirmation to verify success
        9. Take screenshots at key steps for verification
        
        IMPORTANT GUIDELINES:
        - Be respectful of the website's terms of service
        - Handle errors gracefully and provide clear feedback
        - If captcha is detected, the system will switch to headful mode automatically
        - Don't proceed if login credentials are required but not provided
        - Prioritize accuracy over speed
        
        EXPECTED OUTPUT:
        Complete the job application and report success/failure with details.
        """
        
        agent = Agent(
            task=task_description,
            llm=llm,
            controller=controller,
            browser_session=browser_session
        )
        
        # Execute the AI-powered job application
        result = await agent.run()
        
        # Process and structure the result
        success = True
        confirmation_id = None
        error_message = None
        
        # Extract key information from agent memory/context
        if hasattr(agent, 'memory') and agent.memory:
            memory_content = str(agent.memory)
            if 'SUCCESS:' in memory_content:
                confirmation_id = memory_content.split('SUCCESS:')[1].split()[0]
            elif 'CAPTCHA_DETECTED:' in memory_content:
                error_message = "Captcha detected - manual intervention required"
                success = False
            elif 'UPLOAD_FAILED:' in memory_content:
                error_message = "Failed to upload resume"
                success = False
        
        return {
            "success": success,
            "confirmation_id": confirmation_id,
            "error_message": error_message,
            "result_data": str(result),
            "timestamp": datetime.now().isoformat(),
            "screenshots": [],  # Will be populated by the system
            "agent_memory": str(getattr(agent, 'memory', ''))
        }
        
    except Exception as e:
        return {
            "success": False,
            "error_message": str(e),
            "timestamp": datetime.now().isoformat(),
            "agent_memory": ""
        }
    
    finally:
        try:
            await browser_session.stop()
        except:
            pass

# Execute the automation
if __name__ == "__main__":
    result = asyncio.run(apply_to_job())
    print(json.dumps(result, indent=2))
`;

    // Ensure temp directory exists
    const tempDir = path.join(__dirname, '../../../data/temp');
    await fs.mkdir(tempDir, { recursive: true });
    
    // Save enhanced script
    const scriptPath = path.join(tempDir, `jobswipe_agent_${job.id}.py`);
    await fs.writeFile(scriptPath, agentScript);
    
    console.log(`✅ Modern browser-use agent script created: ${scriptPath}`);
    return scriptPath;
  }

  /**
   * Execute intelligent automation with captcha handling and adaptive mode switching
   */
  private async executeIntelligentAutomation(job: QueueJob, log: AutomationLog): Promise<any> {
    const scriptPath = path.join(__dirname, '../../../data/temp', `jobswipe_agent_${job.id}.py`);
    
    return new Promise((resolve, reject) => {
      // Enhanced environment setup
      const env = {
        ...process.env,
        PYTHONPATH: this.config.browserUsePath,
        ANTHROPIC_API_KEY: this.config.anthropicApiKey || process.env.ANTHROPIC_API_KEY,
        OPENAI_API_KEY: this.config.openaiApiKey || process.env.OPENAI_API_KEY,
        JOBSWIPE_LOG_LEVEL: this.config.logLevel.toUpperCase(),
        JOBSWIPE_SCREENSHOTS_DIR: this.config.screenshotPath,
        JOBSWIPE_PROCESSING_MODE: this.config.processingMode
      };

      console.log(`🚀 Launching AI agent for job ${job.id}`);
      
      // Execute modern Python agent
      const pythonProcess = spawn(
        this.config.pythonPath,
        [scriptPath],
        {
          env,
          cwd: this.config.browserUsePath,
          stdio: ['pipe', 'pipe', 'pipe'],
        }
      );

      this.runningProcesses.set(job.id, pythonProcess);
      this.updateStats('activeProcesses', 1);

      let outputData = '';
      let errorData = '';
      let captchaDetected = false;

      // Enhanced output monitoring
      pythonProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        outputData += output;
        
        // Real-time captcha detection
        if (output.includes('CAPTCHA_DETECTED')) {
          captchaDetected = true;
          this.handleCaptchaDetection(job.id, output);
        }
        
        // Progress tracking
        if (output.includes('SUCCESS:') || output.includes('CONFIRMED')) {
          console.log(`✅ [${job.id}] Application success detected`);
        }
        
        console.log(`💬 [${job.id}]`, output.trim());
        this.emit('automation-output', { 
          jobId: job.id, 
          type: 'stdout', 
          data: output,
          timestamp: Date.now()
        });
      });

      pythonProcess.stderr?.on('data', (data) => {
        const error = data.toString();
        errorData += error;
        
        // Enhanced error categorization
        if (error.includes('TimeoutError')) {
          console.warn(`⏰ [${job.id}] Timeout detected`);
        } else if (error.includes('NetworkError')) {
          console.warn(`🌐 [${job.id}] Network issue detected`);
        }
        
        console.error(`⚠️ [${job.id}] stderr:`, error.trim());
        this.emit('automation-output', { 
          jobId: job.id, 
          type: 'stderr', 
          data: error,
          timestamp: Date.now()
        });
      });

      pythonProcess.on('close', (code) => {
        this.runningProcesses.delete(job.id);
        this.updateStats('activeProcesses', -1);
        
        console.log(`🏁 [${job.id}] Process completed with code: ${code}`);
        
        if (code === 0) {
          try {
            // Enhanced result parsing
            const lines = outputData.trim().split('\n');
            const jsonLine = lines.find(line => line.startsWith('{') && line.endsWith('}'));
            
            if (jsonLine) {
              const result = JSON.parse(jsonLine);
              
              // Enhance result with metadata
              result.captchaEncountered = captchaDetected;
              result.processingTime = Date.now() - log.startTime;
              result.jobId = job.id;
              
              if (captchaDetected) {
                this.updateStats('captchaEncountered', 1);
                if (result.success) {
                  this.updateStats('captchaSolved', 1);
                }
              }
              
              resolve(result);
            } else {
              reject(new Error(`No valid JSON result found in output: ${outputData}`));
            }
          } catch (parseError) {
            reject(new Error(`Failed to parse automation result: ${parseError}. Raw output: ${outputData}`));
          }
        } else {
          const errorMsg = `AI agent process failed with code ${code}. Error: ${errorData}`;
          reject(new Error(errorMsg));
        }
      });

      pythonProcess.on('error', (error) => {
        this.runningProcesses.delete(job.id);
        this.updateStats('activeProcesses', -1);
        reject(new Error(`Failed to start AI agent process: ${error.message}`));
      });

      // Enhanced timeout with grace period for captcha solving
      const timeout = captchaDetected ? 
        this.config.timeout + this.config.captchaTimeout : 
        this.config.timeout;
        
      setTimeout(() => {
        if (this.runningProcesses.has(job.id)) {
          console.warn(`⏰ [${job.id}] Killing process due to timeout (${timeout}ms)`);
          pythonProcess.kill('SIGTERM');
          
          // Force kill after grace period
          setTimeout(() => {
            if (this.runningProcesses.has(job.id)) {
              pythonProcess.kill('SIGKILL');
              this.runningProcesses.delete(job.id);
            }
          }, 5000);
          
          reject(new Error(`AI automation timed out after ${timeout}ms`));
        }
      }, timeout);
    });
  }

  /**
   * Handle captcha detection and mode switching
   */
  private handleCaptchaDetection(jobId: string, output: string): void {
    console.log(`🤖 [${jobId}] CAPTCHA detected - initiating intelligent handling`);
    
    const captchaEvent: CaptchaEvent = {
      jobId,
      captchaType: this.extractCaptchaType(output),
      timestamp: Date.now(),
      url: 'unknown', // Would be extracted from agent context
      solved: false,
      solutionMethod: 'ai' // Will be updated when resolved
    };
    
    this.captchaEvents.push(captchaEvent);
    
    // Emit captcha event for UI handling
    this.emit('captcha-detected', {
      jobId,
      captchaType: captchaEvent.captchaType,
      timestamp: captchaEvent.timestamp
    });
    
    // If in adaptive mode, switch to headful for manual intervention
    if (this.config.processingMode === 'adaptive') {
      console.log(`👁️ [${jobId}] Switching to headful mode for captcha solving`);
      this.emit('mode-switch', { jobId, from: 'headless', to: 'headful', reason: 'captcha' });
    }
  }

  /**
   * Extract captcha type from output
   */
  private extractCaptchaType(output: string): CaptchaEvent['captchaType'] {
    if (output.includes('recaptcha')) return 'recaptcha';
    if (output.includes('hcaptcha')) return 'hcaptcha';
    if (output.includes('cloudflare')) return 'cloudflare';
    if (output.includes('img[src*="captcha"]')) return 'image';
    if (output.includes('text')) return 'text';
    return 'unknown';
  }

  /**
   * Validate application success with multiple verification methods
   */
  private async validateApplicationSuccess(job: QueueJob, log: AutomationLog): Promise<any> {
    console.log(`🔍 Validating application success for job ${job.id}`);
    
    try {
      // Check for screenshots indicating success
      const screenshots = await this.getScreenshotPaths(job.id);
      
      // Analyze automation log for success indicators
      const successIndicators = this.analyzeLogForSuccess(log);
      
      // Check for confirmation ID in recent steps
      const confirmationId = this.extractConfirmationId(log);
      
      // Validate against expected outcomes
      const validationResult = {
        success: successIndicators.length > 0,
        confirmationId,
        validationChecks: {
          screenshotsFound: screenshots.length > 0,
          successIndicatorsFound: successIndicators.length > 0,
          confirmationIdExtracted: !!confirmationId,
          noErrorsDetected: !this.hasErrorsInLog(log)
        },
        indicators: successIndicators,
        screenshots,
        confidence: this.calculateSuccessConfidence(successIndicators, confirmationId, screenshots)
      };
      
      console.log(`📋 Validation result for ${job.id}:`, validationResult);
      
      return validationResult;
      
    } catch (error) {
      console.error(`❌ Validation failed for job ${job.id}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Validation error',
        validationChecks: {
          screenshotsFound: false,
          successIndicatorsFound: false,
          confirmationIdExtracted: false,
          noErrorsDetected: false
        },
        confidence: 0
      };
    }
  }

  /**
   * Analyze automation log for success indicators
   */
  private analyzeLogForSuccess(log: AutomationLog): string[] {
    const indicators: string[] = [];
    
    const successPatterns = [
      'application submitted',
      'thank you',
      'confirmation',
      'SUCCESS:',
      'CONFIRMED',
      'application received',
      'successfully applied'
    ];
    
    // Check steps for success patterns
    log.steps.forEach(step => {
      if (step.success && step.metadata) {
        const stepContent = JSON.stringify(step.metadata).toLowerCase();
        successPatterns.forEach(pattern => {
          if (stepContent.includes(pattern.toLowerCase())) {
            indicators.push(`Step ${step.step}: ${pattern}`);
          }
        });
      }
    });
    
    return indicators;
  }

  /**
   * Extract confirmation ID from log
   */
  private extractConfirmationId(log: AutomationLog): string | null {
    // Look through steps for confirmation ID patterns
    for (const step of log.steps) {
      if (step.success && step.metadata) {
        const content = JSON.stringify(step.metadata);
        
        // Common confirmation ID patterns
        const patterns = [
          /SUCCESS:([A-Z0-9]{6,})/i,
          /confirmation.*?([A-Z0-9]{6,})/i,
          /reference.*?([A-Z0-9]{6,})/i,
          /application.*?id.*?([A-Z0-9]{6,})/i
        ];
        
        for (const pattern of patterns) {
          const match = content.match(pattern);
          if (match) {
            return match[1];
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Check if log contains error indicators
   */
  private hasErrorsInLog(log: AutomationLog): boolean {
    return log.steps.some(step => !step.success && step.error);
  }

  /**
   * Calculate confidence score for application success
   */
  private calculateSuccessConfidence(
    indicators: string[], 
    confirmationId: string | null, 
    screenshots: string[]
  ): number {
    let confidence = 0;
    
    // Base confidence from success indicators
    confidence += Math.min(indicators.length * 30, 60);
    
    // Confirmation ID adds high confidence
    if (confirmationId) {
      confidence += 30;
    }
    
    // Screenshots provide additional validation
    if (screenshots.length > 0) {
      confidence += 10;
    }
    
    return Math.min(confidence, 100);
  }

  // =============================================================================
  // UTILITIES
  // =============================================================================

  /**
   * Get screenshot paths for a job with pattern matching
   */
  private async getScreenshotPaths(jobId: string): Promise<string[]> {
    const screenshotDir = this.config.screenshotPath;
    if (!screenshotDir) return [];

    try {
      // Ensure screenshot directory exists
      await fs.mkdir(screenshotDir, { recursive: true });
      
      // Scan for screenshot files matching job ID patterns
      const files = await fs.readdir(screenshotDir);
      const jobScreenshots = files.filter(file => 
        file.includes(jobId) && 
        (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
      );
      
      // Return full paths
      const fullPaths = jobScreenshots.map(file => path.join(screenshotDir, file));
      
      console.log(`📷 Found ${fullPaths.length} screenshots for job ${jobId}`);
      return fullPaths;
    } catch (error) {
      console.warn(`⚠️ Failed to get screenshot paths for job ${jobId}:`, error);
      return [];
    }
  }

  /**
   * Clean up old screenshots and temporary files
   */
  private async cleanupOldFiles(): Promise<void> {
    try {
      const tempDir = path.join(__dirname, '../../../data/temp');
      const screenshotDir = this.config.screenshotPath;
      
      // Clean files older than 7 days
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      // Clean temp files
      if (await this.directoryExists(tempDir)) {
        const tempFiles = await fs.readdir(tempDir);
        for (const file of tempFiles) {
          const filePath = path.join(tempDir, file);
          const stats = await fs.stat(filePath);
          if (stats.mtime.getTime() < oneWeekAgo) {
            await fs.unlink(filePath);
            console.log(`🗑️ Cleaned up old temp file: ${file}`);
          }
        }
      }
      
      // Clean old screenshots
      if (await this.directoryExists(screenshotDir)) {
        const screenshotFiles = await fs.readdir(screenshotDir);
        for (const file of screenshotFiles) {
          const filePath = path.join(screenshotDir, file);
          const stats = await fs.stat(filePath);
          if (stats.mtime.getTime() < oneWeekAgo) {
            await fs.unlink(filePath);
            console.log(`🗑️ Cleaned up old screenshot: ${file}`);
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to cleanup old files:', error);
    }
  }

  /**
   * Check if directory exists
   */
  private async directoryExists(dirPath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
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
   * Stop automation for a specific job with graceful shutdown
   */
  async stopAutomation(jobId: string): Promise<boolean> {
    const process = this.runningProcesses.get(jobId);
    if (process) {
      console.log(`🛑 Stopping automation for job: ${jobId}`);
      
      // Graceful shutdown with SIGTERM
      process.kill('SIGTERM');
      
      // Force kill after 10 seconds if needed
      setTimeout(() => {
        if (this.runningProcesses.has(jobId)) {
          console.warn(`⚠️ Force killing process for job: ${jobId}`);
          process.kill('SIGKILL');
          this.runningProcesses.delete(jobId);
        }
      }, 10000);
      
      this.runningProcesses.delete(jobId);
      this.jobQueue.delete(jobId);
      this.updateStats('activeProcesses', -1);
      
      // Emit stopped event
      this.emit('automation-stopped', { jobId, timestamp: Date.now() });
      
      console.log(`✅ Stopped automation for job: ${jobId}`);
      return true;
    }
    
    console.warn(`⚠️ No running process found for job: ${jobId}`);
    return false;
  }

  /**
   * Stop all running automations with comprehensive cleanup
   */
  async stopAllAutomations(): Promise<void> {
    const activeCount = this.runningProcesses.size;
    console.log(`🛑 Stopping ${activeCount} running automations...`);
    
    if (activeCount === 0) {
      console.log('✅ No active automations to stop');
      return;
    }
    
    const stopPromises: Promise<void>[] = [];
    
    for (const [jobId, process] of this.runningProcesses) {
      const stopPromise = new Promise<void>((resolve) => {
        try {
          // Graceful shutdown
          process.kill('SIGTERM');
          
          // Set timeout for force kill
          const forceKillTimeout = setTimeout(() => {
            try {
              process.kill('SIGKILL');
              console.warn(`⚠️ Force killed process for job: ${jobId}`);
            } catch (error) {
              console.error(`❌ Failed to force kill job ${jobId}:`, error);
            }
            resolve();
          }, 5000);
          
          // Clean exit handler
          process.once('exit', () => {
            clearTimeout(forceKillTimeout);
            console.log(`✅ Stopped automation for job: ${jobId}`);
            resolve();
          });
          
        } catch (error) {
          console.error(`❌ Failed to stop automation for job ${jobId}:`, error);
          resolve();
        }
      });
      
      stopPromises.push(stopPromise);
    }
    
    // Wait for all processes to stop
    await Promise.all(stopPromises);
    
    // Clear all tracking maps
    this.runningProcesses.clear();
    this.jobQueue.clear();
    this.processingStats.activeProcesses = 0;
    this.store.set('stats', this.processingStats);
    
    console.log(`✅ All ${activeCount} automations stopped successfully`);
    this.emit('all-automations-stopped', { count: activeCount, timestamp: Date.now() });
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
   * Get automation logs with filtering and pagination
   */
  getAutomationLogs(options?: {
    jobId?: string;
    userId?: string;
    limit?: number;
    offset?: number;
    dateFrom?: Date;
    dateTo?: Date;
  }): Record<string, AutomationLog> {
    const allLogs = this.store.get('logs') as Record<string, AutomationLog>;
    
    if (!options) {
      return allLogs;
    }
    
    let filteredLogs = Object.entries(allLogs)
      .filter(([logId, log]) => {
        // Filter by job ID
        if (options.jobId && log.jobId !== options.jobId) {
          return false;
        }
        
        // Filter by user ID
        if (options.userId && log.userId !== options.userId) {
          return false;
        }
        
        // Filter by date range
        if (options.dateFrom && log.startTime < options.dateFrom.getTime()) {
          return false;
        }
        
        if (options.dateTo && log.startTime > options.dateTo.getTime()) {
          return false;
        }
        
        return true;
      })
      .sort(([, a], [, b]) => b.startTime - a.startTime); // Sort by most recent
    
    // Apply pagination
    if (options.offset) {
      filteredLogs = filteredLogs.slice(options.offset);
    }
    
    if (options.limit) {
      filteredLogs = filteredLogs.slice(0, options.limit);
    }
    
    return Object.fromEntries(filteredLogs);
  }

  /**
   * Get processing statistics
   */
  getProcessingStats(): ProcessorStats & {
    captchaStats: {
      totalEncountered: number;
      totalSolved: number;
      solutionRate: number;
      recentEvents: CaptchaEvent[];
    };
    rateLimit: {
      currentRequests: number;
      currentBurst: number;
      nextReset: number;
    };
  } {
    const captchaStats = {
      totalEncountered: this.processingStats.captchaEncountered,
      totalSolved: this.processingStats.captchaSolved,
      solutionRate: this.processingStats.captchaEncountered > 0 
        ? (this.processingStats.captchaSolved / this.processingStats.captchaEncountered) * 100 
        : 0,
      recentEvents: this.captchaEvents.slice(-10) // Last 10 captcha events
    };
    
    const rateLimitStats = {
      currentRequests: this.rateLimit.requestCount,
      currentBurst: this.rateLimit.burstCount,
      nextReset: this.rateLimit.lastReset + 60000 // Next minute reset
    };
    
    return {
      ...this.processingStats,
      captchaStats,
      rateLimit: rateLimitStats
    };
  }

  /**
   * Get current captcha events
   */
  getCaptchaEvents(limit = 50): CaptchaEvent[] {
    return this.captchaEvents.slice(-limit);
  }

  /**
   * Get running automations count
   */
  getRunningAutomationsCount(): number {
    return this.runningProcesses.size;
  }

  /**
   * Comprehensive cleanup on exit
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up browser automation service...');
    
    try {
      // Stop all running automations
      await this.stopAllAutomations();
      
      // Shutdown Python bridge
      await this.pythonBridge.shutdown();
      
      // Clean up old files
      await this.cleanupOldFiles();
      
      // Save final statistics
      this.store.set('stats', this.processingStats);
      
      // Clear captcha events from memory (keep in logs)
      this.captchaEvents = [];
      
      console.log('✅ Browser automation service cleanup completed');
      this.emit('cleanup-completed', {
        timestamp: Date.now(),
        finalStats: this.processingStats
      });
      
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      this.emit('cleanup-error', error);
    }
  }

  /**
   * Get Python bridge statistics
   */
  getPythonBridgeStats() {
    return this.pythonBridge.getStats();
  }

  /**
   * Health check for the automation service
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    details: Record<string, any>;
  }> {
    const checks = {
      pythonAvailable: false,
      browserUseAvailable: false,
      directoriesAccessible: false,
      rateLimitOk: false,
      noStuckProcesses: false
    };
    
    try {
      // Check Python
      await this.validatePython();
      checks.pythonAvailable = true;
    } catch (error) {
      console.warn('Python health check failed:', error);
    }
    
    try {
      // Check browser-use
      await this.validateBrowserUse();
      checks.browserUseAvailable = true;
    } catch (error) {
      console.warn('Browser-use health check failed:', error);
    }
    
    try {
      // Check directories
      await this.setupDirectories();
      checks.directoriesAccessible = true;
    } catch (error) {
      console.warn('Directories health check failed:', error);
    }
    
    // Check rate limiting
    checks.rateLimitOk = this.checkRateLimit();
    
    // Check for stuck processes
    checks.noStuckProcesses = this.runningProcesses.size < this.config.maxConcurrentJobs;
    
    const healthyChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyChecks === totalChecks) {
      status = 'healthy';
    } else if (healthyChecks >= totalChecks * 0.7) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }
    
    return {
      status,
      checks,
      details: {
        activeProcesses: this.runningProcesses.size,
        maxConcurrentJobs: this.config.maxConcurrentJobs,
        queuedJobs: this.jobQueue.size,
        rateLimitStatus: this.rateLimit,
        stats: this.processingStats
      }
    };
  }
}