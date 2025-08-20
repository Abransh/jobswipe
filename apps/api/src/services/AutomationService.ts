/**
 * @fileoverview Automation Service
 * @description Backend service for managing job application automation queue and processing
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { randomUUID } from 'crypto';
import { EventEmitter } from 'events';

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
    ['greenhouse', ['greenhouse.io', 'job-boards.greenhouse.io', 'boards.greenhouse.io', 'grnh.se']]
    // Add more companies as they're implemented
  ]);

  constructor(private fastify: any) {
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

  private async processApplication(application: QueuedApplication): Promise<void> {
    const { applicationId } = application;
    
    try {
      this.processing.add(applicationId);
      application.status = 'processing';
      application.startedAt = new Date();
      
      this.fastify.log.info(`Processing application: ${applicationId}`);
      this.emit('application-processing', application);

      // In a real implementation, this would call the Desktop app's automation service
      // For now, simulate the processing
      const result = await this.simulateAutomation(application);
      
      application.status = result.success ? 'completed' : 'failed';
      application.completedAt = new Date();
      application.result = result;

      // Update statistics
      this.updateStats(result.success, result.executionTime);

      // Move to history
      this.queue.delete(applicationId);
      this.history.set(applicationId, application);

      await this.updateApplicationInDatabase(application);

      this.fastify.log.info(`Application completed: ${applicationId} (${result.success ? 'success' : 'failed'})`);
      this.emit('application-completed', application);

    } catch (error) {
      this.fastify.log.error(`Application processing failed: ${applicationId}`, error);
      
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

  private async simulateAutomation(application: QueuedApplication): Promise<AutomationResult> {
    // This is a simulation - in the real implementation, this would communicate
    // with the desktop app's SimplifiedAutomationService
    
    await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate processing time
    
    const success = Math.random() > 0.2; // 80% success rate for simulation
    
    return {
      applicationId: application.applicationId,
      success,
      confirmationNumber: success ? `CONF-${Date.now()}` : undefined,
      error: success ? undefined : 'Simulated error for testing',
      executionTime: 5000,
      companyAutomation: this.detectCompanyAutomation(application.jobData.applyUrl) || 'unknown',
      status: success ? 'success' : 'failed',
      steps: [
        {
          stepName: 'initialize',
          action: 'Initialize browser and AI agent',
          success: true,
          timestamp: new Date().toISOString(),
          durationMs: 2000
        },
        {
          stepName: 'fill_form',
          action: 'Fill application form',
          success,
          timestamp: new Date().toISOString(),
          durationMs: 3000,
          errorMessage: success ? undefined : 'Form validation failed'
        }
      ],
      screenshots: success ? ['/path/to/screenshot1.png'] : [],
      captchaEvents: []
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
}