/**
 * @fileoverview Base Strategy Abstract Class
 * @description Abstract base class for all company-specific automation strategies
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Enterprise-grade strategy execution foundation
 */

import { EventEmitter } from 'events';
import { Page } from 'playwright';
import { randomUUID } from 'crypto';
import {
  CompanyAutomationStrategy,
  StrategyContext,
  StrategyExecutionResult,
  WorkflowStep,
  WorkflowAction,
  UserProfile,
  SessionData,
  PerformanceMetric
} from '../types/StrategyTypes';

// =============================================================================
// BASE STRATEGY ABSTRACT CLASS
// =============================================================================

export abstract class BaseStrategy extends EventEmitter {
  protected readonly strategy: CompanyAutomationStrategy;
  protected context: StrategyContext | null = null;
  protected startTime: Date | null = null;
  protected currentStep: number = 0;
  protected screenshots: string[] = [];
  protected logs: string[] = [];

  constructor(strategy: CompanyAutomationStrategy) {
    super();
    this.strategy = strategy;
  }

  // =============================================================================
  // ABSTRACT METHODS (MUST BE IMPLEMENTED BY SUBCLASSES)
  // =============================================================================

  /**
   * Execute the main automation workflow
   */
  protected abstract executeMainWorkflow(context: StrategyContext): Promise<StrategyExecutionResult>;

  /**
   * Handle company-specific form field mapping
   */
  protected abstract mapFormFields(userProfile: UserProfile): Promise<Record<string, string>>;

  /**
   * Handle company-specific captcha resolution
   */
  protected abstract handleCompanyCaptcha(context: StrategyContext): Promise<boolean>;

  /**
   * Extract confirmation details after successful application
   */
  protected abstract extractConfirmation(context: StrategyContext): Promise<{
    confirmed: boolean;
    confirmationId?: string;
    applicationId?: string;
  }>;

  // =============================================================================
  // PUBLIC EXECUTION INTERFACE
  // =============================================================================

  /**
   * Execute the automation strategy
   */
  async execute(context: StrategyContext): Promise<StrategyExecutionResult> {
    this.context = context;
    this.startTime = new Date();
    this.currentStep = 0;
    this.screenshots = [];
    this.logs = [];

    this.log(`🚀 Starting ${this.strategy.name} automation for ${context.job.jobData.title}`);
    this.emit('execution-started', {
      strategyId: this.strategy.id,
      jobId: context.job.id,
      timestamp: this.startTime
    });

    try {
      // Pre-execution validation
      await this.validateContext(context);

      // Execute pre-application steps
      await this.executePreApplicationSteps(context);

      // Execute main workflow
      const result = await this.executeMainWorkflow(context);

      // Execute post-application steps
      await this.executePostApplicationSteps(context, result);

      // Update metrics
      await this.updateStrategyMetrics(result);

      this.log(`✅ ${this.strategy.name} automation completed successfully`);
      this.emit('execution-completed', {
        strategyId: this.strategy.id,
        jobId: context.job.id,
        result,
        timestamp: new Date()
      });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`❌ ${this.strategy.name} automation failed: ${errorMessage}`);

      // Execute error recovery if defined
      const recoveryResult = await this.executeErrorRecovery(context, error);

      const failureResult: StrategyExecutionResult = {
        success: false,
        error: errorMessage,
        executionTime: Date.now() - this.startTime!.getTime(),
        stepsCompleted: this.currentStep,
        totalSteps: this.getTotalSteps(),
        captchaEncountered: false,
        screenshots: this.screenshots,
        logs: this.logs,
        metrics: {
          timeToFirstInteraction: 0,
          formFillTime: 0,
          uploadTime: 0,
          submissionTime: 0
        }
      };

      this.emit('execution-failed', {
        strategyId: this.strategy.id,
        jobId: context.job.id,
        error: errorMessage,
        recoveryResult,
        timestamp: new Date()
      });

      return recoveryResult || failureResult;
    }
  }

  // =============================================================================
  // PROTECTED WORKFLOW EXECUTION METHODS
  // =============================================================================

  /**
   * Execute pre-application workflow steps
   */
  protected async executePreApplicationSteps(context: StrategyContext): Promise<void> {
    this.log('📋 Executing pre-application steps');
    
    for (const step of this.strategy.workflow.preApplication) {
      await this.executeStep(step, context);
    }
  }

  /**
   * Execute post-application workflow steps
   */
  protected async executePostApplicationSteps(
    context: StrategyContext, 
    result: StrategyExecutionResult
  ): Promise<void> {
    this.log('🔍 Executing post-application verification');
    
    for (const step of this.strategy.workflow.postApplication) {
      await this.executeStep(step, context);
    }

    // Extract confirmation if successful
    if (result.success) {
      const confirmation = await this.extractConfirmation(context);
      if (confirmation.confirmed) {
        result.confirmationId = confirmation.confirmationId;
        result.applicationId = confirmation.applicationId;
      }
    }
  }

  /**
   * Execute error recovery workflow
   */
  protected async executeErrorRecovery(
    context: StrategyContext | null, 
    error: any
  ): Promise<StrategyExecutionResult | null> {
    if (!context || !this.strategy.workflow.errorRecovery.length) {
      return null;
    }

    this.log('🔄 Attempting error recovery');

    try {
      for (const step of this.strategy.workflow.errorRecovery) {
        await this.executeStep(step, context);
      }

      // If recovery succeeded, try main workflow again (with limited retries)
      return await this.executeMainWorkflow(context);
      
    } catch (recoveryError) {
      this.log(`❌ Error recovery failed: ${recoveryError}`);
      return null;
    }
  }

  // =============================================================================
  // STEP EXECUTION ENGINE
  // =============================================================================

  /**
   * Execute a single workflow step
   */
  protected async executeStep(step: WorkflowStep, context: StrategyContext): Promise<any> {
    this.currentStep++;
    this.log(`📝 Step ${this.currentStep}: ${step.name}`);
    
    const stepStartTime = Date.now();
    this.emit('step-started', {
      strategyId: this.strategy.id,
      jobId: context.job.id,
      step,
      timestamp: new Date()
    });

    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts <= step.retryCount) {
      try {
        const result = await this.executeStepAction(step, context);
        
        // Validate success criteria
        if (await this.validateStepSuccess(step, context)) {
          const executionTime = Date.now() - stepStartTime;
          
          this.emit('step-completed', {
            strategyId: this.strategy.id,
            jobId: context.job.id,
            step,
            result,
            executionTime,
            attempts: attempts + 1,
            timestamp: new Date()
          });

          return result;
        } else if (attempts < step.retryCount) {
          this.log(`⚠️ Step validation failed, retrying (${attempts + 1}/${step.retryCount})`);
          await this.delay(1000 * (attempts + 1)); // Exponential backoff
        }

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempts < step.retryCount) {
          this.log(`⚠️ Step failed, retrying (${attempts + 1}/${step.retryCount}): ${lastError.message}`);
          await this.delay(1000 * (attempts + 1));
        }
      }

      attempts++;
    }

    // Try fallback actions if available
    if (step.fallbackActions) {
      this.log('🔄 Attempting fallback actions');
      for (const fallbackAction of step.fallbackActions) {
        try {
          return await this.executeStepAction({ ...step, action: fallbackAction }, context);
        } catch (fallbackError) {
          this.log(`⚠️ Fallback action failed: ${fallbackError}`);
        }
      }
    }

    // If step is required, throw error
    if (step.required) {
      throw new Error(`Required step '${step.name}' failed after ${step.retryCount + 1} attempts: ${lastError?.message}`);
    }

    this.log(`⚠️ Optional step '${step.name}' failed, continuing workflow`);
    return null;
  }

  /**
   * Execute specific step action based on type
   */
  protected async executeStepAction(step: WorkflowStep, context: StrategyContext): Promise<any> {
    const { page } = context;

    switch (step.action) {
      case WorkflowAction.NAVIGATE:
        return await this.executeNavigate(step, context);
      
      case WorkflowAction.CLICK:
        return await this.executeClick(step, context);
      
      case WorkflowAction.TYPE:
        return await this.executeType(step, context);
      
      case WorkflowAction.UPLOAD:
        return await this.executeUpload(step, context);
      
      case WorkflowAction.SELECT:
        return await this.executeSelect(step, context);
      
      case WorkflowAction.WAIT:
        return await this.executeWait(step, context);
      
      case WorkflowAction.VALIDATE:
        return await this.executeValidate(step, context);
      
      case WorkflowAction.EXTRACT:
        return await this.executeExtract(step, context);
      
      case WorkflowAction.SCREENSHOT:
        return await this.executeScreenshot(step, context);
      
      case WorkflowAction.CUSTOM:
        return await this.executeCustomAction(step, context);
      
      default:
        throw new Error(`Unknown action type: ${step.action}`);
    }
  }

  // =============================================================================
  // ACTION IMPLEMENTATIONS
  // =============================================================================

  protected async executeNavigate(step: WorkflowStep, context: StrategyContext): Promise<void> {
    const { page } = context;
    const url = step.metadata?.url || context.job.jobData.url;
    
    this.log(`🌐 Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle' });
    await this.delay(2000); // Allow page to settle
  }

  protected async executeClick(step: WorkflowStep, context: StrategyContext): Promise<void> {
    const { page } = context;
    const element = await this.findElement(step.selectors, page);
    
    this.log(`👆 Clicking element: ${step.selectors[0]}`);
    await this.humanizeClick(element, page);
  }

  protected async executeType(step: WorkflowStep, context: StrategyContext): Promise<void> {
    const { page } = context;
    const element = await this.findElement(step.selectors, page);
    const text = step.metadata?.text || '';
    
    this.log(`⌨️ Typing text: ${text.substring(0, 50)}...`);
    await this.humanizeType(element, text, page);
  }

  protected async executeUpload(step: WorkflowStep, context: StrategyContext): Promise<void> {
    const { page } = context;
    const filePath = step.metadata?.filePath || context.userProfile.professional.resumeUrl;
    const element = await this.findElement(step.selectors, page);
    
    this.log(`📄 Uploading file: ${filePath}`);
    await element.setInputFiles(filePath);
  }

  protected async executeSelect(step: WorkflowStep, context: StrategyContext): Promise<void> {
    const { page } = context;
    const element = await this.findElement(step.selectors, page);
    const value = step.metadata?.value || '';
    
    this.log(`📋 Selecting option: ${value}`);
    await element.selectOption(value);
  }

  protected async executeWait(step: WorkflowStep, context: StrategyContext): Promise<void> {
    const { page } = context;
    const duration = step.metadata?.duration || 1000;
    
    if (step.selectors.length > 0) {
      this.log(`⏳ Waiting for element: ${step.selectors[0]}`);
      await page.waitForSelector(step.selectors[0], { timeout: step.timeout });
    } else {
      this.log(`⏳ Waiting for ${duration}ms`);
      await this.delay(duration);
    }
  }

  protected async executeValidate(step: WorkflowStep, context: StrategyContext): Promise<boolean> {
    const { page } = context;
    
    for (const criterion of step.successCriteria) {
      try {
        await page.waitForSelector(criterion, { timeout: 5000 });
      } catch {
        return false;
      }
    }
    
    return true;
  }

  protected async executeExtract(step: WorkflowStep, context: StrategyContext): Promise<string> {
    const { page } = context;
    const element = await this.findElement(step.selectors, page);
    
    const text = await element.textContent();
    this.log(`📤 Extracted text: ${text?.substring(0, 100)}...`);
    
    return text || '';
  }

  protected async executeScreenshot(step: WorkflowStep, context: StrategyContext): Promise<string> {
    const { page } = context;
    const filename = `screenshot_${context.job.id}_${Date.now()}.png`;
    const path = `/tmp/jobswipe-screenshots/${filename}`;
    
    await page.screenshot({ path, fullPage: true });
    this.screenshots.push(path);
    
    this.log(`📸 Screenshot saved: ${filename}`);
    return path;
  }

  protected async executeCustomAction(step: WorkflowStep, context: StrategyContext): Promise<any> {
    // Override in subclasses for company-specific custom actions
    throw new Error(`Custom action '${step.name}' not implemented in ${this.constructor.name}`);
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Find element using multiple selector strategies
   */
  protected async findElement(selectors: string[], page: Page): Promise<any> {
    for (const selector of selectors) {
      try {
        const element = page.locator(selector);
        await element.waitFor({ timeout: 5000 });
        return element;
      } catch {
        continue;
      }
    }
    
    throw new Error(`Could not find element with selectors: ${selectors.join(', ')}`);
  }

  /**
   * Humanized click with natural mouse movement
   */
  protected async humanizeClick(element: any, page: Page): Promise<void> {
    const box = await element.boundingBox();
    if (box) {
      // Add random offset within element bounds
      const x = box.x + box.width * (0.3 + Math.random() * 0.4);
      const y = box.y + box.height * (0.3 + Math.random() * 0.4);
      
      // Move mouse naturally and click
      await page.mouse.move(x, y);
      await this.delay(100 + Math.random() * 200);
      await page.mouse.click(x, y);
    } else {
      await element.click();
    }
  }

  /**
   * Humanized typing with variable speed
   */
  protected async humanizeType(element: any, text: string, page: Page): Promise<void> {
    await element.click(); // Focus element
    await element.clear(); // Clear existing text
    
    // Type with human-like speed variations
    for (const char of text) {
      await page.keyboard.type(char);
      await this.delay(50 + Math.random() * 100);
    }
  }

  /**
   * Validate step success criteria
   */
  protected async validateStepSuccess(step: WorkflowStep, context: StrategyContext): Promise<boolean> {
    if (!step.successCriteria.length) {
      return true;
    }

    const { page } = context;
    
    for (const criterion of step.successCriteria) {
      try {
        await page.waitForSelector(criterion, { timeout: 2000 });
      } catch {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Context validation
   */
  protected async validateContext(context: StrategyContext): Promise<void> {
    if (!context.job || !context.page || !context.userProfile) {
      throw new Error('Invalid strategy context: missing required properties');
    }

    if (!context.userProfile.professional.resumeUrl) {
      throw new Error('Resume URL is required for job applications');
    }

    // Validate page is accessible
    try {
      await context.page.goto(context.job.jobData.url, { timeout: 30000 });
    } catch (error) {
      throw new Error(`Cannot access job URL: ${context.job.jobData.url}`);
    }
  }

  /**
   * Update strategy performance metrics
   */
  protected async updateStrategyMetrics(result: StrategyExecutionResult): Promise<void> {
    const metric: PerformanceMetric = {
      timestamp: new Date(),
      success: result.success,
      executionTime: result.executionTime,
      errorType: result.error,
      captchaEncountered: result.captchaEncountered
    };

    this.strategy.metrics.recentPerformance.push(metric);
    
    // Keep only last 100 metrics
    if (this.strategy.metrics.recentPerformance.length > 100) {
      this.strategy.metrics.recentPerformance = this.strategy.metrics.recentPerformance.slice(-100);
    }

    // Update aggregated metrics
    this.strategy.metrics.totalApplications++;
    if (result.success) {
      const successCount = this.strategy.metrics.recentPerformance.filter(m => m.success).length;
      this.strategy.metrics.successRate = (successCount / this.strategy.metrics.recentPerformance.length) * 100;
    }
    
    const avgTime = this.strategy.metrics.recentPerformance.reduce((sum, m) => sum + m.executionTime, 0) / 
                   this.strategy.metrics.recentPerformance.length;
    this.strategy.metrics.averageExecutionTime = avgTime;
    
    this.strategy.metrics.lastUpdated = new Date();
  }

  /**
   * Get total workflow steps
   */
  protected getTotalSteps(): number {
    return this.strategy.workflow.preApplication.length +
           this.strategy.workflow.application.length +
           this.strategy.workflow.postApplication.length;
  }

  /**
   * Utility delay function
   */
  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log message with timestamp
   */
  protected log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${this.strategy.name}] ${message}`;
    this.logs.push(logMessage);
    console.log(logMessage);
  }

  // =============================================================================
  // GETTERS
  // =============================================================================

  get strategyInfo(): CompanyAutomationStrategy {
    return this.strategy;
  }

  get currentExecutionLogs(): string[] {
    return [...this.logs];
  }

  get currentExecutionScreenshots(): string[] {
    return [...this.screenshots];
  }
}