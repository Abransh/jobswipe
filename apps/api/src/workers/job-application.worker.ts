/**
 * @fileoverview BullMQ Job Application Worker
 * @description Processes queued job applications using desktop automation
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Production-level job processing with comprehensive error handling
 */

import { Worker, Job, QueueEvents } from 'bullmq';
import { Redis } from 'ioredis';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

interface JobApplicationData {
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
    preferences: Record<string, any>;
  };
  priority: number;
  metadata: {
    source: 'web' | 'mobile' | 'desktop';
    deviceId?: string;
    timestamp: string;
  };
}

interface DesktopClient {
  id: string;
  websocket: WebSocket;
  status: 'idle' | 'busy' | 'error';
  lastSeen: Date;
  capabilities: {
    browserAutomation: boolean;
    captchaHandling: boolean;
    maxConcurrency: number;
  };
  currentJobs: Set<string>;
}

interface JobProcessingResult {
  success: boolean;
  applicationId?: string;
  confirmationId?: string;
  screenshots?: string[];
  errorMessage?: string;
  errorType?: 'NETWORK' | 'CAPTCHA' | 'FORM_ERROR' | 'SITE_CHANGE' | 'UNKNOWN';
  processingTime: number;
  logs: Array<{
    timestamp: Date;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
    step?: string;
    data?: any;
  }>;
}

interface WorkerConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  queues: {
    applications: string;
    priority: string;
  };
  desktop: {
    websocketPort: number;
    heartbeatInterval: number;
    jobTimeout: number;
    maxRetries: number;
  };
  processing: {
    concurrency: number;
    stalledInterval: number;
    maxStalledCount: number;
  };
}

// =============================================================================
// JOB APPLICATION WORKER CLASS
// =============================================================================

export class JobApplicationWorker {
  private redisConnection: Redis;
  private applicationWorker: Worker;
  private priorityWorker: Worker;
  private queueEvents: QueueEvents;
  private desktopClients: Map<string, DesktopClient> = new Map();
  private processingJobs: Map<string, { jobId: string; clientId: string; startTime: Date }> = new Map();
  private config: WorkerConfig;
  private websocketServer?: WebSocket.Server;
  private db?: any; // Prisma client
  private websocketService?: any; // WebSocket service for real-time updates
  private isRunning = false;

  constructor(config: WorkerConfig, db?: any, websocketService?: any) {
    this.config = config;
    this.db = db;
    this.websocketService = websocketService;

    // Redis connection for workers
    this.redisConnection = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db || 1, // Use queue DB
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    // Queue events for monitoring
    this.queueEvents = new QueueEvents(config.queues.applications, {
      connection: this.redisConnection,
    });

    // Create workers
    this.applicationWorker = new Worker(
      config.queues.applications,
      this.processJob.bind(this),
      {
        connection: this.redisConnection,
        concurrency: config.processing.concurrency,
        stalledInterval: config.processing.stalledInterval,
        maxStalledCount: config.processing.maxStalledCount,
        removeOnComplete: { count: 100 }, // BullMQ v5 API: KeepJobs object
        removeOnFail: { count: 50 }, // BullMQ v5 API: KeepJobs object
      }
    );

    this.priorityWorker = new Worker(
      config.queues.priority,
      this.processJob.bind(this),
      {
        connection: this.redisConnection,
        concurrency: Math.min(config.processing.concurrency, 2), // Limit priority concurrency
        stalledInterval: config.processing.stalledInterval,
        maxStalledCount: config.processing.maxStalledCount,
        removeOnComplete: { count: 100 }, // BullMQ v5 API: KeepJobs object
        removeOnFail: { count: 50 }, // BullMQ v5 API: KeepJobs object
      }
    );

    this.setupEventListeners();
  }

  /**
   * Setup worker event listeners
   */
  private setupEventListeners(): void {
    // Application worker events
    this.applicationWorker.on('completed', (job, result) => {
      console.log(`✅ Job ${job.id} completed successfully`);
      this.processingJobs.delete(job.id!);
      this.updateApplicationInDatabase(job.id!, 'completed', result);
    });

    this.applicationWorker.on('failed', (job, err) => {
      console.error(`❌ Job ${job?.id} failed:`, err);
      if (job) {
        this.processingJobs.delete(job.id!);
        this.updateApplicationInDatabase(job.id!, 'failed', { errorMessage: err.message });
      }
    });

    this.applicationWorker.on('progress', (job, progress) => {
      // BullMQ progress can be number or object - convert to number for emitJobProgress
      const progressValue = typeof progress === 'number' ? progress : 0;
      console.log(`📈 Job ${job.id} progress: ${progressValue}%`);
      this.emitJobProgress(job.id!, progressValue);
    });

    this.applicationWorker.on('stalled', (jobId) => {
      console.warn(`⚠️ Job ${jobId} stalled, will retry`);
      this.processingJobs.delete(jobId);
    });

    // Priority worker events (similar setup)
    this.priorityWorker.on('completed', (job, result) => {
      console.log(`✅ Priority job ${job.id} completed successfully`);
      this.processingJobs.delete(job.id!);
      this.updateApplicationInDatabase(job.id!, 'completed', result);
    });

    this.priorityWorker.on('failed', (job, err) => {
      console.error(`❌ Priority job ${job?.id} failed:`, err);
      if (job) {
        this.processingJobs.delete(job.id!);
        this.updateApplicationInDatabase(job.id!, 'failed', { errorMessage: err.message });
      }
    });

    // Queue events
    this.queueEvents.on('active', ({ jobId }) => {
      console.log(`🚀 Job ${jobId} started processing`);
    });

    this.queueEvents.on('waiting', ({ jobId }) => {
      console.log(`⏳ Job ${jobId} waiting in queue`);
    });
  }

  /**
   * Initialize the worker with Python automation service
   */
  async initialize(): Promise<void> {
    try {
      // Test Redis connection
      await this.redisConnection.ping();
      console.log('✅ Redis connection established for worker');

      // Initialize Python automation service
      await this.initializePythonAutomationService();

      this.isRunning = true;
      console.log('✅ Job Application Worker initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Job Application Worker:', error);
      throw error;
    }
  }

  /**
   * Initialize Python automation service
   */
  private async initializePythonAutomationService(): Promise<void> {
    try {
      const { PythonAutomationService } = await import('../services/PythonAutomationService');
      const automationService = new PythonAutomationService();
      await automationService.initialize();
      
      // Make it globally available for workers
      (globalThis as any).__pythonAutomationService = automationService;
      
      console.log('✅ Python Automation Service initialized for worker');
    } catch (error) {
      console.error('❌ Failed to initialize Python Automation Service:', error);
      throw error;
    }
  }

  /**
   * Setup WebSocket server for desktop app communication
   */
  private async setupDesktopWebSocketServer(): Promise<void> {
    this.websocketServer = new WebSocket.Server({
      port: this.config.desktop.websocketPort,
      clientTracking: true,
    });

    this.websocketServer.on('connection', (ws: WebSocket, request) => {
      const clientId = uuidv4();
      console.log(`🖥️ Desktop client connected: ${clientId}`);

      // Initialize client
      const client: DesktopClient = {
        id: clientId,
        websocket: ws,
        status: 'idle',
        lastSeen: new Date(),
        capabilities: {
          browserAutomation: true,
          captchaHandling: true,
          maxConcurrency: 1,
        },
        currentJobs: new Set(),
      };

      this.desktopClients.set(clientId, client);

      // Setup client event handlers
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleDesktopMessage(clientId, message);
        } catch (error) {
          console.error(`Error parsing message from ${clientId}:`, error);
        }
      });

      ws.on('close', () => {
        console.log(`🖥️ Desktop client disconnected: ${clientId}`);
        this.desktopClients.delete(clientId);
        
        // Mark any jobs from this client as failed
        for (const [jobId, jobInfo] of this.processingJobs.entries()) {
          if (jobInfo.clientId === clientId) {
            this.processingJobs.delete(jobId);
            // The BullMQ worker will handle the timeout and retry
          }
        }
      });

      ws.on('error', (error) => {
        console.error(`Desktop client ${clientId} error:`, error);
        client.status = 'error';
      });

      // Send handshake
      ws.send(JSON.stringify({
        type: 'handshake',
        clientId,
        timestamp: new Date().toISOString(),
      }));
    });

    console.log(`🚀 Desktop WebSocket server listening on port ${this.config.desktop.websocketPort}`);
  }

  /**
   * Handle messages from desktop clients
   */
  private handleDesktopMessage(clientId: string, message: any): void {
    const client = this.desktopClients.get(clientId);
    if (!client) return;

    client.lastSeen = new Date();

    switch (message.type) {
      case 'heartbeat':
        // Update client status
        break;

      case 'capabilities':
        client.capabilities = { ...client.capabilities, ...message.capabilities };
        console.log(`🖥️ Client ${clientId} capabilities updated:`, client.capabilities);
        break;

      case 'job_result':
        this.handleJobResult(clientId, message);
        break;

      case 'job_progress':
        this.handleJobProgress(clientId, message);
        break;

      case 'job_error':
        this.handleJobError(clientId, message);
        break;

      case 'status_update':
        client.status = message.status;
        break;

      default:
        console.warn(`Unknown message type from ${clientId}:`, message.type);
    }
  }

  /**
   * Handle job result from desktop client
   */
  private handleJobResult(clientId: string, message: any): void {
    const { jobId, result } = message;
    const client = this.desktopClients.get(clientId);
    
    if (!client) return;

    client.currentJobs.delete(jobId);
    client.status = 'idle';

    // Log the result
    console.log(`📊 Job ${jobId} result from ${clientId}:`, result);

    // The result will be handled by the BullMQ job completion
    // We just need to store it temporarily or let the job resolve
  }

  /**
   * Handle job progress from desktop client
   */
  private handleJobProgress(clientId: string, message: any): void {
    const { jobId, progress, step } = message;
    
    console.log(`📈 Job ${jobId} progress from ${clientId}: ${progress}% (${step})`);
    
    // Emit progress update
    this.emitJobProgress(jobId, progress, { step, clientId });
  }

  /**
   * Handle job error from desktop client
   */
  private handleJobError(clientId: string, message: any): void {
    const { jobId, error } = message;
    const client = this.desktopClients.get(clientId);
    
    if (!client) return;

    client.currentJobs.delete(jobId);
    client.status = 'idle';

    console.error(`❌ Job ${jobId} error from ${clientId}:`, error);

    // The error will be handled by the BullMQ job failure
  }

  /**
   * Process a job from the queue
   */
  private async processJob(job: Job<JobApplicationData>): Promise<JobProcessingResult> {
    const startTime = new Date();
    const jobData = job.data;

    console.log(`🚀 Processing job ${job.id} for user ${jobData.userId}`);

    try {
      // Update job progress
      await job.updateProgress(10);

      // Check if we have Python automation service
      const automationService = (globalThis as any).__pythonAutomationService;
      if (!automationService) {
        throw new Error('Python automation service not available');
      }

      await job.updateProgress(25);

      // Process the job using Python automation
      console.log(`🎯 Processing job with Python automation: ${jobData.jobData.title} at ${jobData.jobData.company}`);
      
      const automationResult = await automationService.processJobApplication(jobData);

      await job.updateProgress(75);

      // Calculate processing time
      const processingTime = Date.now() - startTime.getTime();

      await job.updateProgress(100);

      // Log success
      if (this.db) {
        await this.logJobExecution(job.id!, 'SUCCESS', automationResult, processingTime);
      }

      return {
        success: automationResult.success,
        applicationId: automationResult.applicationId,
        confirmationId: automationResult.confirmationNumber,
        screenshots: automationResult.screenshots,
        errorMessage: automationResult.error,
        processingTime: automationResult.executionTime,
        logs: automationResult.steps.map(step => ({
          timestamp: new Date(step.timestamp),
          level: step.success ? 'INFO' : 'ERROR' as 'INFO' | 'WARN' | 'ERROR',
          message: step.action,
          step: step.stepName,
          data: step,
        })),
      };

    } catch (error) {
      const processingTime = Date.now() - startTime.getTime();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      console.error(`❌ Job ${job.id} failed:`, error);

      // Log failure
      if (this.db) {
        await this.logJobExecution(job.id!, 'FAILED', { error: errorMessage }, processingTime);
      }

      // Clean up processing job
      this.processingJobs.delete(job.id!);

      // Determine error type for retry logic
      let errorType: JobProcessingResult['errorType'] = 'UNKNOWN';
      if (errorMessage.includes('CAPTCHA') || errorMessage.includes('captcha')) {
        errorType = 'CAPTCHA';
      } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        errorType = 'NETWORK';
      } else if (errorMessage.includes('form') || errorMessage.includes('field')) {
        errorType = 'FORM_ERROR';
      } else if (errorMessage.includes('site') || errorMessage.includes('change')) {
        errorType = 'SITE_CHANGE';
      }

      return {
        success: false,
        errorMessage,
        errorType,
        processingTime,
        logs: [{
          timestamp: new Date(),
          level: 'ERROR',
          message: errorMessage,
          step: 'processing_error',
          data: { error },
        }],
      };
    }
  }

  /**
   * Find an available desktop client for job processing
   */
  private findAvailableDesktopClient(): DesktopClient | null {
    for (const client of this.desktopClients.values()) {
      if (
        client.status === 'idle' &&
        client.currentJobs.size < client.capabilities.maxConcurrency &&
        client.capabilities.browserAutomation
      ) {
        return client;
      }
    }
    return null;
  }

  /**
   * Wait for job completion from desktop client
   */
  private async waitForJobCompletion(jobId: string, timeout: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Job ${jobId} timed out after ${timeout}ms`));
      }, timeout);

      // Listen for job completion (this would be implemented with proper event handling)
      const checkCompletion = setInterval(() => {
        const jobInfo = this.processingJobs.get(jobId);
        if (!jobInfo) {
          clearTimeout(timeoutId);
          clearInterval(checkCompletion);
          resolve({ success: true, message: 'Job completed' });
        }
      }, 1000);
    });
  }

  /**
   * Start monitoring desktop clients
   */
  private startDesktopMonitoring(): void {
    setInterval(() => {
      const now = new Date();
      const heartbeatInterval = this.config.desktop.heartbeatInterval;

      for (const [clientId, client] of this.desktopClients.entries()) {
        const timeSinceLastSeen = now.getTime() - client.lastSeen.getTime();
        
        if (timeSinceLastSeen > heartbeatInterval * 2) {
          console.warn(`⚠️ Desktop client ${clientId} missed heartbeat, marking as disconnected`);
          
          // Clean up jobs from this client
          for (const jobId of client.currentJobs) {
            this.processingJobs.delete(jobId);
          }
          
          client.websocket.terminate();
          this.desktopClients.delete(clientId);
        }
      }
    }, this.config.desktop.heartbeatInterval);
  }

  /**
   * Update application in database
   */
  private async updateApplicationInDatabase(jobId: string, status: string, result: any): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.applicationQueue.update({
        where: { id: jobId },
        data: {
          status: status.toUpperCase(),
          success: result.success,
          completedAt: new Date(),
          responseData: result,
          errorMessage: result.errorMessage || null,
          errorType: result.errorType || null,
        },
      });
    } catch (error) {
      console.error(`Failed to update application ${jobId} in database:`, error);
    }
  }

  /**
   * Log job execution
   */
  private async logJobExecution(jobId: string, level: string, data: any, processingTime: number): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.automationLog.create({
        data: {
          queueId: jobId,
          level: level,
          message: `Job ${level.toLowerCase()}: ${data.success ? 'successful' : 'failed'}`,
          details: data,
          executionTime: processingTime,
          step: 'job_completion',
        },
      });
    } catch (error) {
      console.error(`Failed to log job execution for ${jobId}:`, error);
    }
  }

  /**
   * Emit job progress via WebSocket
   */
  private emitJobProgress(jobId: string, progress: number, data?: any): void {
    if (this.websocketService) {
      // Find the job data to get user info
      const jobInfo = this.processingJobs.get(jobId);
      if (jobInfo) {
        this.websocketService.emitToApplication(jobId, 'processing-progress', {
          progress,
          ...data,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  /**
   * Get worker statistics
   */
  async getStats() {
    // BullMQ v5 Worker doesn't have getMetrics() - provide basic worker info
    const appWorkerStats = {
      name: this.applicationWorker.name,
      concurrency: this.config.processing.concurrency,
      isRunning: this.applicationWorker.isRunning(),
    };

    const priorityWorkerStats = {
      name: this.priorityWorker.name,
      concurrency: Math.min(this.config.processing.concurrency, 2),
      isRunning: this.priorityWorker.isRunning(),
    };

    return {
      workers: {
        application: appWorkerStats,
        priority: priorityWorkerStats,
      },
      desktopClients: {
        total: this.desktopClients.size,
        idle: Array.from(this.desktopClients.values()).filter(c => c.status === 'idle').length,
        busy: Array.from(this.desktopClients.values()).filter(c => c.status === 'busy').length,
        error: Array.from(this.desktopClients.values()).filter(c => c.status === 'error').length,
      },
      processing: {
        activeJobs: this.processingJobs.size,
        jobs: Array.from(this.processingJobs.entries()).map(([jobId, info]) => ({
          jobId,
          clientId: info.clientId,
          startTime: info.startTime,
          duration: Date.now() - info.startTime.getTime(),
        })),
      },
      isRunning: this.isRunning,
    };
  }

  /**
   * Shutdown the worker
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down Job Application Worker...');
    
    this.isRunning = false;

    try {
      // Shutdown Python automation service
      const automationService = (globalThis as any).__pythonAutomationService;
      if (automationService) {
        await automationService.cleanup();
      }

      // Close workers
      await Promise.all([
        this.applicationWorker.close(),
        this.priorityWorker.close(),
      ]);

      // Close queue events
      await this.queueEvents.close();

      // Close Redis connection
      await this.redisConnection.disconnect();

      console.log('✅ Job Application Worker shut down successfully');
    } catch (error) {
      console.error('❌ Error shutting down Job Application Worker:', error);
    }
  }
}

// =============================================================================
// WORKER FACTORY FUNCTION
// =============================================================================

export function createJobApplicationWorker(
  config: WorkerConfig,
  db?: any,
  websocketService?: any
): JobApplicationWorker {
  return new JobApplicationWorker(config, db, websocketService);
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { WorkerConfig, JobApplicationData, JobProcessingResult, DesktopClient };