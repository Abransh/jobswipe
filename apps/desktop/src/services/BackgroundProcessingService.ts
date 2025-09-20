/**
 * @fileoverview Background Processing Service for JobSwipe Desktop App
 * @description Orchestrates queue polling, job claiming, and automation execution
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { EventEmitter } from 'events';
import QueuePollingService, { PendingApplication } from './QueuePollingService';
import PythonExecutionManager, { AutomationRequest, AutomationResult, ExecutionProgress } from './PythonExecutionManager';
import { TokenStorageService } from './TokenStorageService';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export interface ProcessingStats {
  totalProcessed: number;
  successfulApplications: number;
  failedApplications: number;
  averageProcessingTime: number;
  currentlyProcessing: number;
  queuePosition: number;
  isActive: boolean;
  lastProcessedAt?: Date;
}

export interface ProcessingConfig {
  maxConcurrentExecutions: number;
  retryFailedApplications: boolean;
  maxRetries: number;
  retryDelayMs: number;
  autoStart: boolean;
  processingTimeoutMs: number;
}

export interface ApplicationExecutionData {
  applicationId: string;
  executionId: string;
  startedAt: Date;
  progress: number;
  currentStep: string;
  status: 'starting' | 'processing' | 'completed' | 'failed' | 'cancelled';
}

// =============================================================================
// BACKGROUND PROCESSING SERVICE
// =============================================================================

export class BackgroundProcessingService extends EventEmitter {
  private queuePollingService: QueuePollingService;
  private pythonExecutionManager: PythonExecutionManager;
  private tokenStorage: TokenStorageService;

  private isRunning: boolean = false;
  private activeExecutions: Map<string, ApplicationExecutionData> = new Map();
  private processingQueue: PendingApplication[] = [];
  private retryQueue: Map<string, { application: PendingApplication; retryCount: number }> = new Map();

  private config: ProcessingConfig = {
    maxConcurrentExecutions: 3, // Process up to 3 applications simultaneously
    retryFailedApplications: true,
    maxRetries: 3,
    retryDelayMs: 30000, // 30 seconds between retries
    autoStart: true,
    processingTimeoutMs: 10 * 60 * 1000, // 10 minutes per application
  };

  private stats: ProcessingStats = {
    totalProcessed: 0,
    successfulApplications: 0,
    failedApplications: 0,
    averageProcessingTime: 0,
    currentlyProcessing: 0,
    queuePosition: 0,
    isActive: false,
  };

  private processingTimes: number[] = [];

  constructor(apiBaseUrl?: string) {
    super();

    // Initialize services
    this.queuePollingService = new QueuePollingService(apiBaseUrl);
    this.pythonExecutionManager = new PythonExecutionManager();
    this.tokenStorage = new TokenStorageService();

    // Set up event listeners
    this.setupEventListeners();

    console.log('BackgroundProcessingService initialized');
  }

  // =============================================================================
  // SERVICE CONTROL
  // =============================================================================

  /**
   * Start background processing
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Background processing already running');
      return;
    }

    console.log('Starting background processing service...');
    this.isRunning = true;
    this.stats.isActive = true;

    // Start queue polling
    await this.queuePollingService.startPolling();

    // Start processing any queued applications
    this.processQueuedApplications();

    this.emit('service-started');
    console.log('Background processing service started');
  }

  /**
   * Stop background processing
   */
  async stop(): Promise<void> {
    console.log('Stopping background processing service...');
    this.isRunning = false;
    this.stats.isActive = false;

    // Stop queue polling
    this.queuePollingService.stopPolling();

    // Cancel all active executions
    const activeExecutionIds = Array.from(this.activeExecutions.keys());
    for (const executionId of activeExecutionIds) {
      await this.pythonExecutionManager.cancelExecution(executionId);
    }

    // Clear queues
    this.processingQueue = [];
    this.activeExecutions.clear();

    this.emit('service-stopped');
    console.log('Background processing service stopped');
  }

  /**
   * Update processing configuration
   */
  updateConfig(newConfig: Partial<ProcessingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Processing configuration updated:', this.config);

    // Apply polling configuration changes
    if (newConfig.autoStart !== undefined) {
      this.queuePollingService.updateConfig({
        enabled: newConfig.autoStart,
      });
    }

    this.emit('config-updated', this.config);
  }

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  /**
   * Set up event listeners for services
   */
  private setupEventListeners(): void {
    // Queue polling events
    this.queuePollingService.on('application-found', (application: PendingApplication) => {
      this.handleApplicationFound(application);
    });

    this.queuePollingService.on('polling-success', (data) => {
      this.emit('polling-success', data);
    });

    this.queuePollingService.on('polling-failed', (error) => {
      this.emit('polling-failed', error);
    });

    this.queuePollingService.on('auth-error', (error) => {
      this.emit('auth-error', error);
    });

    // Python execution events
    this.pythonExecutionManager.on('execution-progress', (progress: ExecutionProgress) => {
      this.handleExecutionProgress(progress);
    });

    this.pythonExecutionManager.on('execution-completed', (result: AutomationResult) => {
      this.handleExecutionCompleted(result);
    });

    this.pythonExecutionManager.on('execution-failed', (result: AutomationResult) => {
      this.handleExecutionFailed(result);
    });

    this.pythonExecutionManager.on('execution-cancelled', (result: AutomationResult) => {
      this.handleExecutionCancelled(result);
    });
  }

  /**
   * Handle new application found in queue
   */
  private async handleApplicationFound(application: PendingApplication): Promise<void> {
    console.log(`New application found: ${application.id} - ${application.job.title} at ${application.job.company}`);

    // Check if we're already processing this application
    if (this.activeExecutions.has(application.id)) {
      console.log(`Application ${application.id} is already being processed`);
      return;
    }

    // Check if application is already in processing queue
    if (this.processingQueue.some(app => app.id === application.id)) {
      console.log(`Application ${application.id} is already in processing queue`);
      return;
    }

    // Add to processing queue
    this.processingQueue.push(application);

    // Emit event
    this.emit('application-queued', {
      applicationId: application.id,
      jobTitle: application.job.title,
      company: application.job.company,
      queuePosition: this.processingQueue.length,
      timestamp: new Date(),
    });

    // Start processing if we have capacity
    this.processQueuedApplications();
  }

  /**
   * Handle execution progress updates
   */
  private handleExecutionProgress(progress: ExecutionProgress): void {
    const execution = this.activeExecutions.get(progress.executionId);
    if (execution) {
      execution.progress = progress.progress;
      execution.currentStep = progress.currentStep;
      this.activeExecutions.set(progress.executionId, execution);

      // Report progress to server
      this.queuePollingService.reportProgress(
        execution.applicationId,
        progress.progress,
        execution.status,
        progress.message
      );

      // Emit progress to the API server for WebSocket broadcasting
      this.sendProgressUpdateToServer(execution, progress);

      this.emit('execution-progress', {
        applicationId: execution.applicationId,
        executionId: progress.executionId,
        progress: progress.progress,
        currentStep: progress.currentStep,
        message: progress.message,
        timestamp: progress.timestamp,
      });
    }
  }

  /**
   * Handle successful execution completion
   */
  private async handleExecutionCompleted(result: AutomationResult): Promise<void> {
    const execution = this.activeExecutions.get(result.executionId);
    if (!execution) return;

    console.log(`Execution completed successfully: ${result.executionId}`);

    // Update execution data
    execution.status = 'completed';
    execution.progress = 100;

    // Update statistics
    this.stats.totalProcessed++;
    this.stats.successfulApplications++;
    this.stats.currentlyProcessing = Math.max(0, this.stats.currentlyProcessing - 1);
    this.stats.lastProcessedAt = new Date();

    // Track processing time
    const processingTime = Date.now() - execution.startedAt.getTime();
    this.processingTimes.push(processingTime);
    this.updateAverageProcessingTime();

    // Report completion to server
    await this.queuePollingService.completeApplication(
      execution.applicationId,
      true,
      result.applicationData,
      undefined
    );

    // Clean up
    this.activeExecutions.delete(result.executionId);

    // Emit event
    this.emit('application-completed', {
      applicationId: execution.applicationId,
      executionId: result.executionId,
      success: true,
      result: result,
      processingTimeMs: processingTime,
      timestamp: new Date(),
    });

    // Continue processing queue
    this.processQueuedApplications();
  }

  /**
   * Handle failed execution
   */
  private async handleExecutionFailed(result: AutomationResult): Promise<void> {
    const execution = this.activeExecutions.get(result.executionId);
    if (!execution) return;

    console.log(`Execution failed: ${result.executionId}, error: ${result.error}`);

    // Update execution data
    execution.status = 'failed';

    // Update statistics
    this.stats.totalProcessed++;
    this.stats.failedApplications++;
    this.stats.currentlyProcessing = Math.max(0, this.stats.currentlyProcessing - 1);
    this.stats.lastProcessedAt = new Date();

    // Check if we should retry
    const shouldRetry = this.config.retryFailedApplications &&
                       !this.retryQueue.has(execution.applicationId);

    if (shouldRetry) {
      // Find the original application to retry
      const application = this.processingQueue.find(app => app.id === execution.applicationId);
      if (application) {
        console.log(`Queueing application for retry: ${execution.applicationId}`);
        this.retryQueue.set(execution.applicationId, {
          application,
          retryCount: 1,
        });

        // Schedule retry
        setTimeout(() => {
          this.retryFailedApplication(execution.applicationId);
        }, this.config.retryDelayMs);
      }
    } else {
      // Report failure to server
      await this.queuePollingService.completeApplication(
        execution.applicationId,
        false,
        undefined,
        result.error
      );
    }

    // Clean up
    this.activeExecutions.delete(result.executionId);

    // Emit event
    this.emit('application-failed', {
      applicationId: execution.applicationId,
      executionId: result.executionId,
      error: result.error,
      errorType: result.errorType,
      willRetry: shouldRetry,
      timestamp: new Date(),
    });

    // Continue processing queue
    this.processQueuedApplications();
  }

  /**
   * Handle cancelled execution
   */
  private handleExecutionCancelled(result: AutomationResult): void {
    const execution = this.activeExecutions.get(result.executionId);
    if (!execution) return;

    console.log(`Execution cancelled: ${result.executionId}`);

    // Update statistics
    this.stats.currentlyProcessing = Math.max(0, this.stats.currentlyProcessing - 1);

    // Clean up
    this.activeExecutions.delete(result.executionId);

    // Emit event
    this.emit('application-cancelled', {
      applicationId: execution.applicationId,
      executionId: result.executionId,
      timestamp: new Date(),
    });
  }

  // =============================================================================
  // PROCESSING LOGIC
  // =============================================================================

  /**
   * Process queued applications
   */
  private async processQueuedApplications(): Promise<void> {
    if (!this.isRunning) return;

    // Check if we have capacity for more executions
    const currentExecutions = this.activeExecutions.size;
    if (currentExecutions >= this.config.maxConcurrentExecutions) {
      console.log(`Maximum concurrent executions reached: ${currentExecutions}/${this.config.maxConcurrentExecutions}`);
      return;
    }

    // Get next application from queue
    const application = this.processingQueue.shift();
    if (!application) {
      return; // No applications to process
    }

    try {
      // Claim the application from the server
      const claimed = await this.queuePollingService.claimApplication(application.id);
      if (!claimed) {
        console.log(`Failed to claim application: ${application.id}, skipping...`);
        return;
      }

      // Start processing the application
      await this.startApplicationProcessing(application);

    } catch (error) {
      console.error(`Error processing application ${application.id}:`, error);
      this.emit('processing-error', {
        applicationId: application.id,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });
    }

    // Continue processing if we still have capacity
    if (this.processingQueue.length > 0 && this.activeExecutions.size < this.config.maxConcurrentExecutions) {
      setImmediate(() => this.processQueuedApplications());
    }
  }

  /**
   * Start processing a specific application
   */
  private async startApplicationProcessing(application: PendingApplication): Promise<void> {
    const executionId = `exec_${application.id}_${Date.now()}`;

    console.log(`Starting processing for application: ${application.id}`);
    console.log(`Job: ${application.job.title} at ${application.job.company}`);

    // Create execution tracking data
    const executionData: ApplicationExecutionData = {
      applicationId: application.id,
      executionId,
      startedAt: new Date(),
      progress: 0,
      currentStep: 'Initializing',
      status: 'starting',
    };

    this.activeExecutions.set(executionId, executionData);
    this.stats.currentlyProcessing++;

    // Get user profile data (this would come from the application or user service)
    const userProfile = await this.getUserProfile(application.userId);

    // Detect company automation type
    const companyAutomation = this.detectCompanyAutomation(application.job);

    // Create automation request
    const automationRequest: AutomationRequest = {
      executionId,
      applicationId: application.id,
      userId: application.userId,
      jobData: {
        id: application.jobId,
        title: application.job.title,
        company: application.job.company,
        applyUrl: application.job.applyUrl || '', // This would come from job data
        location: application.job.location,
        description: '', // This would come from job data
        requirements: [], // This would come from job data
        salary: application.job.salary,
      },
      userProfile,
      companyAutomation,
      options: {
        headless: true, // Desktop always runs headless initially
        timeout: this.config.processingTimeoutMs,
        debugMode: false,
        screenshotPath: undefined,
      },
    };

    // Emit processing started event
    this.emit('processing-started', {
      applicationId: application.id,
      executionId,
      jobTitle: application.job.title,
      company: application.job.company,
      companyAutomation,
      timestamp: new Date(),
    });

    // Update execution status
    executionData.status = 'processing';
    this.activeExecutions.set(executionId, executionData);

    // Start the automation
    try {
      await this.pythonExecutionManager.executeAutomation(automationRequest);
    } catch (error) {
      console.error(`Failed to start automation for ${application.id}:`, error);
      await this.handleExecutionFailed({
        executionId,
        success: false,
        status: 'failed',
        message: 'Failed to start automation',
        error: error instanceof Error ? error.message : String(error),
        errorType: 'startup_error',
        executionTimeMs: 0,
        screenshots: [],
        logs: [],
      });
    }
  }

  /**
   * Retry a failed application
   */
  private async retryFailedApplication(applicationId: string): Promise<void> {
    const retryData = this.retryQueue.get(applicationId);
    if (!retryData) return;

    if (retryData.retryCount >= this.config.maxRetries) {
      console.log(`Maximum retries reached for application: ${applicationId}`);
      this.retryQueue.delete(applicationId);

      // Report final failure to server
      await this.queuePollingService.completeApplication(
        applicationId,
        false,
        undefined,
        `Failed after ${this.config.maxRetries} retry attempts`
      );

      return;
    }

    console.log(`Retrying application: ${applicationId}, attempt ${retryData.retryCount + 1}`);

    // Increment retry count
    retryData.retryCount++;
    this.retryQueue.set(applicationId, retryData);

    // Add back to processing queue
    this.processingQueue.unshift(retryData.application);

    // Start processing
    this.processQueuedApplications();
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get user profile data
   */
  private async getUserProfile(userId: string): Promise<any> {
    // This would integrate with your user service or local storage
    // For now, return basic profile
    return {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-0123',
      resumeUrl: '',
      currentTitle: 'Software Engineer',
      yearsExperience: 5,
      skills: ['JavaScript', 'Python', 'React'],
      currentLocation: 'San Francisco, CA',
      linkedinUrl: '',
      workAuthorization: 'US Citizen',
      coverLetter: '',
      customFields: {},
    };
  }

  /**
   * Detect company automation type from job data
   */
  private detectCompanyAutomation(job: any): string {
    const company = job.company.toLowerCase();
    const applyUrl = job.applyUrl?.toLowerCase() || '';

    if (applyUrl.includes('greenhouse.io') || company.includes('greenhouse')) {
      return 'greenhouse';
    }
    if (applyUrl.includes('linkedin.com') || company.includes('linkedin')) {
      return 'linkedin';
    }
    if (applyUrl.includes('workday') || company.includes('workday')) {
      return 'workday';
    }
    if (applyUrl.includes('lever.co') || company.includes('lever')) {
      return 'lever';
    }

    return 'generic';
  }

  /**
   * Update average processing time
   */
  private updateAverageProcessingTime(): void {
    if (this.processingTimes.length === 0) return;

    // Keep only last 50 processing times for rolling average
    if (this.processingTimes.length > 50) {
      this.processingTimes = this.processingTimes.slice(-50);
    }

    const sum = this.processingTimes.reduce((acc, time) => acc + time, 0);
    this.stats.averageProcessingTime = Math.round(sum / this.processingTimes.length);
  }

  /**
   * Send progress update to server for WebSocket broadcasting
   */
  private async sendProgressUpdateToServer(execution: ApplicationExecutionData, progress: ExecutionProgress): Promise<void> {
    try {
      const token = await this.tokenStorage.getToken();
      if (!token) {
        console.warn('No authentication token available for progress updates');
        return;
      }

      const progressUpdate = {
        applicationId: execution.applicationId,
        progress: {
          step: progress.currentStep,
          percentage: progress.progress,
          message: progress.message,
          timestamp: progress.timestamp.toISOString(),
        },
        status: execution.status,
        executionId: progress.executionId,
      };

      // Send progress update to server
      const response = await fetch(`${this.queuePollingService.getApiBaseUrl()}/api/v1/queue/applications/${execution.applicationId}/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressUpdate),
      });

      if (!response.ok) {
        throw new Error(`Failed to send progress update: ${response.status} ${response.statusText}`);
      }

      console.log(`Progress update sent for application ${execution.applicationId}: ${progress.progress}%`);
    } catch (error) {
      console.warn('Failed to send progress update to server:', error);
      // Don't throw error - progress updates are not critical
    }
  }

  /**
   * Get current processing statistics
   */
  getStats(): ProcessingStats {
    return {
      ...this.stats,
      queuePosition: this.processingQueue.length,
    };
  }

  /**
   * Get processing configuration
   */
  getConfig(): ProcessingConfig {
    return { ...this.config };
  }

  /**
   * Get list of active executions
   */
  getActiveExecutions(): ApplicationExecutionData[] {
    return Array.from(this.activeExecutions.values());
  }

  /**
   * Check if service is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    console.log('Cleaning up BackgroundProcessingService...');

    this.stop();
    this.queuePollingService.cleanup();
    this.pythonExecutionManager.cleanup();

    this.removeAllListeners();
  }
}

export default BackgroundProcessingService;