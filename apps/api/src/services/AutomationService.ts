/**
 * @fileoverview Automation Service
 * @description Backend service for managing job application automation queue and processing
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { randomUUID } from 'crypto';
import { EventEmitter } from 'events';
import { ServerAutomationService } from './ServerAutomationService';
import { AutomationLimits } from './AutomationLimits';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export interface JobApplicationData {
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
  options: {
    headless?: boolean;
    timeout?: number;
    maxRetries?: number;
  };
}

export interface QueuedApplication {
  applicationId: string;
  userId: string;
  jobData: JobApplicationData['jobData'];
  userProfile: JobApplicationData['userProfile'];
  options: JobApplicationData['options'];
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  queuedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: AutomationResult;
  retryCount: number;
  priority: number;
}

export interface AutomationResult {
  applicationId: string;
  success: boolean;
  confirmationNumber?: string;
  error?: string;
  executionTime: number;
  companyAutomation: string;
  status: string;
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
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  averageProcessingTime: number;
  supportedCompanies: string[];
}

export interface ApplicationStatus {
  applicationId: string;
  userId: string;
  status: QueuedApplication['status'];
  progress: number;
  result?: AutomationResult;
  queuePosition?: number;
  estimatedTime?: number;
}

// =============================================================================
// AUTOMATION SERVICE
// =============================================================================

export class AutomationService extends EventEmitter {
  private queue: Map<string, QueuedApplication> = new Map();
  private processing: Set<string> = new Set();
  private history: Map<string, QueuedApplication> = new Map();
  private stats = {
    totalProcessed: 0,
    successful: 0,
    failed: 0,
    averageProcessingTime: 0
  };
  
  // Supported companies and their URL patterns
  private supportedCompanies = new Map([
    ['greenhouse', ['greenhouse.io', 'job-boards.greenhouse.io', 'boards.greenhouse.io', 'grnh.se']],
    ['linkedin', ['linkedin.com/jobs', 'linkedin.com/jobs/view', 'linkedin.com/jobs/collections', 'linkedin.com/jobs/search']]
  ]);

  constructor(
    private fastify: any,
    private serverAutomationService: ServerAutomationService,
    private automationLimits: AutomationLimits
  ) {
    super();
    
    // Start queue processing
    this.startQueueProcessor();
  }

  // =============================================================================
  // QUEUE MANAGEMENT
  // =============================================================================

  /**
   * Queue a new job application for automation
   */
  async queueApplication(data: JobApplicationData): Promise<string> {
    const applicationId = randomUUID();
    
    const queuedApplication: QueuedApplication = {
      applicationId,
      userId: data.userId,
      jobData: data.jobData,
      userProfile: data.userProfile,
      options: data.options,
      status: 'queued',
      queuedAt: new Date(),
      retryCount: 0,
      priority: this.calculatePriority(data)
    };

    this.queue.set(applicationId, queuedApplication);
    
    this.fastify.log.info(`Application queued: ${applicationId} for job ${data.jobData.id}`);
    this.emit('application-queued', queuedApplication);

    // Store in database for persistence
    await this.saveApplicationToDatabase(queuedApplication);

    return applicationId;
  }

  /**
   * Get application status
   */
  async getApplicationStatus(applicationId: string): Promise<ApplicationStatus> {
    const application = this.queue.get(applicationId) || this.history.get(applicationId);
    
    if (!application) {
      throw new Error(`Application not found: ${applicationId}`);
    }

    const queuePosition = this.getQueuePosition(applicationId);
    const estimatedTime = queuePosition > 0 ? 
      this.stats.averageProcessingTime * queuePosition : undefined;

    return {
      applicationId,
      userId: application.userId,
      status: application.status,
      progress: this.calculateProgress(application),
      result: application.result,
      queuePosition,
      estimatedTime
    };
  }

  /**
   * Cancel an application
   */
  async cancelApplication(applicationId: string, userId: string): Promise<{ cancelled: boolean; refunded?: boolean }> {
    const application = this.queue.get(applicationId);
    
    if (!application) {
      throw new Error(`Application not found: ${applicationId}`);
    }

    if (application.userId !== userId) {
      throw new Error('Access denied');
    }

    if (application.status === 'processing') {
      // Can't cancel processing applications easily
      return { cancelled: false };
    }

    if (application.status === 'queued') {
      application.status = 'cancelled';
      this.queue.delete(applicationId);
      this.history.set(applicationId, application);
      
      await this.updateApplicationInDatabase(application);
      
      this.emit('application-cancelled', application);
      return { cancelled: true, refunded: true };
    }

    return { cancelled: false };
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<QueueStats> {
    const applications = Array.from(this.queue.values());
    
    return {
      pending: applications.filter(app => app.status === 'queued').length,
      processing: applications.filter(app => app.status === 'processing').length,
      completed: this.stats.successful,
      failed: this.stats.failed,
      averageProcessingTime: this.stats.averageProcessingTime,
      supportedCompanies: Array.from(this.supportedCompanies.keys())
    };
  }

  /**
   * Get user automation history
   */
  async getUserAutomationHistory(
    userId: string,
    options: { limit: number; offset: number; status: 'all' | 'completed' | 'failed' }
  ): Promise<{
    applications: Array<{
      applicationId: string;
      jobId: string;
      jobTitle: string;
      company: string;
      status: string;
      appliedAt: string;
      confirmationNumber?: string;
      error?: string;
    }>;
    total: number;
    hasMore: boolean;
  }> {
    // Get applications from database (this is simplified)
    const allApplications = Array.from(this.history.values())
      .concat(Array.from(this.queue.values()))
      .filter(app => app.userId === userId)
      .filter(app => {
        if (options.status === 'completed') return app.status === 'completed';
        if (options.status === 'failed') return app.status === 'failed';
        return true;
      })
      .sort((a, b) => (b.queuedAt.getTime() - a.queuedAt.getTime()));

    const applications = allApplications
      .slice(options.offset, options.offset + options.limit)
      .map(app => ({
        applicationId: app.applicationId,
        jobId: app.jobData.id,
        jobTitle: app.jobData.title,
        company: app.jobData.company,
        status: app.status,
        appliedAt: app.queuedAt.toISOString(),
        confirmationNumber: app.result?.confirmationNumber,
        error: app.result?.error
      }));

    return {
      applications,
      total: allApplications.length,
      hasMore: options.offset + options.limit < allApplications.length
    };
  }

  /**
   * Get supported companies
   */
  async getSupportedCompanies(): Promise<Record<string, string[]>> {
    const result: Record<string, string[]> = {};
    for (const [company, patterns] of this.supportedCompanies.entries()) {
      result[company] = [...patterns];
    }
    return result;
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    activeProcesses: number;
    queueHealth: {
      pending: number;
      processing: number;
      failed: number;
    };
    systemInfo: {
      uptime: number;
      memoryUsage: number;
      supportedCompanies: string[];
    };
    issues?: string[];
  }> {
    const queueStats = await this.getQueueStats();
    const issues: string[] = [];
    
    // Check for issues
    if (queueStats.pending > 100) {
      issues.push('Queue backlog is high');
    }
    
    if (queueStats.processing === 0 && queueStats.pending > 0) {
      issues.push('No active processors while queue has pending items');
    }

    const failureRate = this.stats.totalProcessed > 0 ? 
      this.stats.failed / this.stats.totalProcessed : 0;
    
    if (failureRate > 0.1) {
      issues.push('High failure rate detected');
    }

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (issues.length > 0) {
      status = issues.length > 2 ? 'unhealthy' : 'degraded';
    }

    return {
      status,
      activeProcesses: this.processing.size,
      queueHealth: {
        pending: queueStats.pending,
        processing: queueStats.processing,
        failed: queueStats.failed
      },
      systemInfo: {
        uptime: process.uptime() * 1000,
        memoryUsage: process.memoryUsage().heapUsed,
        supportedCompanies: Array.from(this.supportedCompanies.keys())
      },
      issues: issues.length > 0 ? issues : undefined
    };
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private startQueueProcessor(): void {
    setInterval(async () => {
      await this.processQueue();
    }, 5000); // Process queue every 5 seconds
  }

  private async processQueue(): Promise<void> {
    const pendingApplications = Array.from(this.queue.values())
      .filter(app => app.status === 'queued')
      .sort((a, b) => b.priority - a.priority); // Higher priority first

    const maxConcurrent = 3; // Maximum concurrent automations
    const slotsAvailable = maxConcurrent - this.processing.size;

    for (let i = 0; i < Math.min(slotsAvailable, pendingApplications.length); i++) {
      const application = pendingApplications[i];
      this.processApplication(application);
    }
  }

  private async processApplication(application: QueuedApplication, correlationId?: string): Promise<void> {
    const { applicationId, userId } = application;
    const logContext = {
      correlationId: correlationId || `queue_${applicationId}`,
      applicationId,
      userId,
      jobId: application.jobData.id,
      jobTitle: application.jobData.title,
      company: application.jobData.company
    };
    
    try {
      this.processing.add(applicationId);
      application.status = 'processing';
      application.startedAt = new Date();
      
      this.fastify.log.info({
        ...logContext,
        event: 'application_processing_started',
        message: 'Starting application processing',
        queuedAt: application.queuedAt,
        priority: application.priority
      });
      
      this.emit('application-processing', { ...application, correlationId: logContext.correlationId });

      // Determine execution mode based on user limits
      const executionMode = await this.determineExecutionMode(userId);
      
      let result: AutomationResult;
      
      if (executionMode === 'server') {
        // Execute on server
        this.fastify.log.info({
          ...logContext,
          event: 'automation_mode_server',
          message: 'Executing automation on server'
        });
        
        result = await this.executeOnServer(application, logContext.correlationId);
        
        // Record server usage
        await this.automationLimits.recordServerApplication(userId);
        
      } else {
        // Queue for desktop app
        application.status = 'queued';
        this.fastify.log.info({
          ...logContext,
          event: 'automation_mode_desktop',
          message: 'Application queued for desktop execution (server limit exceeded)'
        });
        
        this.emit('application-queued-desktop', { ...application, correlationId: logContext.correlationId });
        return; // Don't complete processing yet
      }
      
      application.status = result.success ? 'completed' : 'failed';
      application.completedAt = new Date();
      application.result = result;

      // Update statistics
      this.updateStats(result.success, result.executionTime);

      // Move to history
      this.queue.delete(applicationId);
      this.history.set(applicationId, application);

      await this.updateApplicationInDatabase(application);

      this.fastify.log.info({
        ...logContext,
        event: 'application_processing_completed',
        message: 'Application processing completed',
        success: result.success,
        executionTimeMs: result.executionTime,
        confirmationNumber: result.confirmationNumber,
        processingDurationMs: Date.now() - (application.startedAt?.getTime() || 0)
      });
      
      this.emit('application-completed', { ...application, correlationId: logContext.correlationId });

    } catch (error) {
      this.fastify.log.error({
        ...logContext,
        event: 'application_processing_failed',
        message: 'Application processing failed with error',
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        processingDurationMs: Date.now() - (application.startedAt?.getTime() || 0)
      });
      
      application.status = 'failed';
      application.completedAt = new Date();
      application.result = {
        applicationId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: 0,
        companyAutomation: 'unknown',
        status: 'failed',
        steps: [],
        screenshots: [],
        captchaEvents: []
      };

      this.queue.delete(applicationId);
      this.history.set(applicationId, application);

      await this.updateApplicationInDatabase(application);
      this.emit('application-failed', application);

    } finally {
      this.processing.delete(applicationId);
    }
  }

  /**
   * Determine execution mode for user
   */
  private async determineExecutionMode(userId: string): Promise<'server' | 'desktop'> {
    const eligibility = await this.automationLimits.checkServerEligibility(userId);
    return eligibility.allowed ? 'server' : 'desktop';
  }

  /**
   * Execute automation on server
   */
  private async executeOnServer(application: QueuedApplication, correlationId?: string): Promise<AutomationResult> {
    const companyAutomation = this.detectCompanyAutomation(application.jobData.applyUrl);
    
    if (!companyAutomation) {
      throw new Error(`No automation found for URL: ${application.jobData.applyUrl}`);
    }

    // Prepare request for server automation service
    const request = {
      userId: application.userId,
      jobId: application.jobData.id,
      applicationId: application.applicationId,
      companyAutomation,
      userProfile: {
        firstName: application.userProfile.firstName,
        lastName: application.userProfile.lastName,
        email: application.userProfile.email,
        phone: application.userProfile.phone,
        resumeUrl: application.userProfile.resumeUrl,
        currentTitle: application.userProfile.currentTitle,
        yearsExperience: application.userProfile.yearsExperience,
        skills: application.userProfile.skills,
        currentLocation: application.userProfile.currentLocation,
        linkedinUrl: application.userProfile.linkedinUrl,
        workAuthorization: application.userProfile.workAuthorization,
        coverLetter: application.userProfile.coverLetter,
        customFields: application.userProfile.customFields
      },
      jobData: application.jobData,
      options: application.options
    };

    // Execute server automation
    const serverResult = await this.serverAutomationService.executeAutomation(request, correlationId);

    // Convert server result to AutomationResult format
    return {
      applicationId: serverResult.applicationId,
      success: serverResult.success,
      confirmationNumber: serverResult.confirmationNumber,
      error: serverResult.error,
      executionTime: serverResult.executionTime,
      companyAutomation: serverResult.companyAutomation,
      status: serverResult.status,
      steps: serverResult.steps,
      screenshots: serverResult.screenshots,
      captchaEvents: serverResult.captchaEvents
    };
  }

  private detectCompanyAutomation(url: string): string | null {
    const urlLower = url.toLowerCase();
    
    for (const [company, patterns] of this.supportedCompanies.entries()) {
      if (patterns.some(pattern => urlLower.includes(pattern))) {
        return company;
      }
    }
    
    return null;
  }

  private calculatePriority(data: JobApplicationData): number {
    // Higher priority for certain conditions
    let priority = 50; // Base priority
    
    // Premium users get higher priority
    if (data.userProfile.customFields?.isPremium) {
      priority += 30;
    }
    
    // Urgent applications
    if (data.options.maxRetries && data.options.maxRetries > 3) {
      priority += 20;
    }
    
    return priority;
  }

  private getQueuePosition(applicationId: string): number {
    const applications = Array.from(this.queue.values())
      .filter(app => app.status === 'queued')
      .sort((a, b) => b.priority - a.priority);
    
    return applications.findIndex(app => app.applicationId === applicationId) + 1;
  }

  private calculateProgress(application: QueuedApplication): number {
    switch (application.status) {
      case 'queued': return 10;
      case 'processing': return 50;
      case 'completed': return 100;
      case 'failed': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  }

  private updateStats(success: boolean, executionTime: number): void {
    this.stats.totalProcessed++;
    
    if (success) {
      this.stats.successful++;
    } else {
      this.stats.failed++;
    }

    // Update rolling average
    const totalTime = this.stats.averageProcessingTime * (this.stats.totalProcessed - 1) + executionTime;
    this.stats.averageProcessingTime = Math.round(totalTime / this.stats.totalProcessed);
  }

  private async saveApplicationToDatabase(application: QueuedApplication): Promise<void> {
    // In a real implementation, save to database
    // For now, just log
    this.fastify.log.info(`Saving application to database: ${application.applicationId}`);
  }

  private async updateApplicationInDatabase(application: QueuedApplication): Promise<void> {
    // In a real implementation, update database record
    // For now, just log
    this.fastify.log.info(`Updating application in database: ${application.applicationId} (${application.status})`);
  }

  /**
   * Execute job application immediately (for API routes)
   */
  async executeJobApplication(
    jobData: any,
    userProfile: any,
    options: any
  ): Promise<{ status: string; executionMode: string; message: string; progress?: number }> {
    try {
      // Create job application data structure
      const applicationData: JobApplicationData = {
        userId: options.application_id || 'api-user',
        jobData: {
          id: jobData.job_id || jobData.id,
          title: jobData.title,
          company: jobData.company,
          applyUrl: jobData.apply_url || jobData.applyUrl,
          location: jobData.location,
          description: jobData.description
        },
        userProfile: {
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: userProfile.email,
          phone: userProfile.phone || '',
          resumeUrl: userProfile.resume?.url
        },
        options: {
          headless: options.execution_mode === 'server',
          timeout: 30000,
          maxRetries: 2
        }
      };

      // Queue the application for processing
      const applicationId = await this.queueApplication(applicationData);

      return {
        status: 'QUEUED',
        executionMode: options.execution_mode || 'server',
        message: 'Application queued for processing',
        progress: 10
      };
    } catch (error) {
      this.fastify.log.error('Failed to execute job application:', error);
      throw error;
    }
  }
}