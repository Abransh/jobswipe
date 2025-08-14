/**
 * @fileoverview Queue Management Plugin for Fastify
 * @description Enterprise-grade job application queue system using Redis + BullMQ
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Production-level queue processing with comprehensive error handling
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { Redis } from 'ioredis';
import type { WebSocketService } from './websocket.plugin';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

interface QueueConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
    maxRetriesPerRequest?: number;
    retryDelayOnFailover?: number;
    lazyConnect?: boolean;
    ssl?: boolean;
  };
  queues: {
    applications: {
      name: string;
      defaultJobOptions: {
        removeOnComplete: number;
        removeOnFail: number;
        attempts: number;
        backoff: {
          type: string;
          delay: number;
        };
      };
    };
    priority: {
      name: string;
      defaultJobOptions: {
        removeOnComplete: number;
        removeOnFail: number;
        attempts: number;
        backoff: {
          type: string;
          delay: number;
        };
      };
    };
  };
  workers: {
    concurrency: number;
    maxStalledCount: number;
    stalledInterval: number;
    removeOnComplete: number;
    removeOnFail: number;
  };
}

interface JobData {
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

interface ApplicationStatus {
  id: string;
  jobId: string;
  userId: string;
  status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
  message?: string;
  result?: {
    success: boolean;
    applicationId?: string;
    confirmationId?: string;
    screenshots?: string[];
    error?: string;
    logs?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
}

// =============================================================================
// QUEUE SERVICE CLASS
// =============================================================================

class QueueService {
  private redisConnection: Redis;
  private applicationQueue: Queue;
  private priorityQueue: Queue;
  private queueEvents: QueueEvents;
  private worker?: Worker;
  private isInitialized = false;
  private config: QueueConfig;
  private websocketService?: WebSocketService;

  constructor(config: QueueConfig) {
    this.config = config;
    this.redisConnection = new Redis({
      ...config.redis,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      lazyConnect: true,
    });

    // Initialize queues
    this.applicationQueue = new Queue(config.queues.applications.name, {
      connection: this.redisConnection,
      defaultJobOptions: config.queues.applications.defaultJobOptions,
    });

    this.priorityQueue = new Queue(config.queues.priority.name, {
      connection: this.redisConnection,
      defaultJobOptions: config.queues.priority.defaultJobOptions,
    });

    // Queue events for monitoring
    this.queueEvents = new QueueEvents(config.queues.applications.name, {
      connection: this.redisConnection,
    });
  }

  /**
   * Set WebSocket service for real-time updates
   */
  setWebSocketService(websocketService: WebSocketService): void {
    this.websocketService = websocketService;
    this.setupQueueEventListeners();
  }

  /**
   * Setup queue event listeners for WebSocket notifications
   */
  private setupQueueEventListeners(): void {
    if (!this.websocketService) return;

    // Listen for job events and emit WebSocket updates
    this.queueEvents.on('active', ({ jobId, prev }: { jobId: string; prev: string }) => {
      this.emitJobUpdate(jobId, 'job-claimed', { previousStatus: prev });
    });

    this.queueEvents.on('progress', ({ jobId, data }: { jobId: string; data: any }) => {
      this.emitJobUpdate(jobId, 'processing-progress', { progress: data });
    });

    this.queueEvents.on('completed', ({ jobId, returnvalue }: { jobId: string; returnvalue: any }) => {
      this.emitJobUpdate(jobId, 'processing-completed', { 
        success: true,
        result: returnvalue 
      });
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }: { jobId: string; failedReason: string }) => {
      this.emitJobUpdate(jobId, 'processing-failed', {
        success: false,
        errorMessage: failedReason
      });
    });

    this.queueEvents.on('stalled', ({ jobId }: { jobId: string }) => {
      this.emitJobUpdate(jobId, 'processing-progress', {
        message: 'Job processing stalled, retrying...'
      });
    });

    console.log('✅ Queue event listeners setup for WebSocket notifications');
  }

  /**
   * Emit job update via WebSocket
   */
  private async emitJobUpdate(jobId: string, eventType: string, data: any): Promise<void> {
    if (!this.websocketService) return;

    try {
      // Get job data to find applicationId and userId
      let job = await this.applicationQueue.getJob(jobId);
      if (!job) {
        job = await this.priorityQueue.getJob(jobId);
      }

      if (job && job.data) {
        const { userId, jobId: applicationJobId } = job.data;
        
        // Emit to the specific user
        this.websocketService.emitToUser(userId, eventType, {
          applicationId: applicationJobId,
          jobId,
          ...data
        });

        // Emit to application subscribers
        this.websocketService.emitToApplication(applicationJobId, eventType, {
          jobId,
          ...data
        });

        console.log(`🔔 Emitted ${eventType} for job ${jobId} to user ${userId}`);
      }
    } catch (error) {
      console.error('Failed to emit job update:', error);
    }
  }

  /**
   * Initialize queue service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Test Redis connection
      await this.redisConnection.ping();
      
      // Wait for queues to be ready
      await Promise.all([
        this.applicationQueue.waitUntilReady(),
        this.priorityQueue.waitUntilReady(),
      ]);

      this.isInitialized = true;
      console.log('✅ Queue service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize queue service:', error);
      throw error;
    }
  }

  /**
   * Add job application to queue
   */
  async addJobApplication(data: JobData, isPriority = false): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Queue service not initialized');
    }

    const queue = isPriority ? this.priorityQueue : this.applicationQueue;
    const jobOptions = {
      priority: data.priority,
      delay: 0, // Process immediately
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
    };

    try {
      const job = await queue.add('process-job-application', data, jobOptions);
      console.log(`Job application queued: ${job.id} for user ${data.userId}`);
      return job.id!;
    } catch (error) {
      console.error('Failed to add job application to queue:', error);
      throw error;
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<ApplicationStatus | null> {
    try {
      // Check both queues for the job
      let job = await this.applicationQueue.getJob(jobId);
      if (!job) {
        job = await this.priorityQueue.getJob(jobId);
      }

      if (!job) {
        return null;
      }

      const state = await job.getState();
      const progress = job.progress;
      const result = job.returnvalue;
      const failedReason = job.failedReason;

      return {
        id: job.id!,
        jobId: job.data.jobId,
        userId: job.data.userId,
        status: this.mapJobState(state),
        progress: typeof progress === 'number' ? progress : undefined,
        message: failedReason || undefined,
        result: result || undefined,
        createdAt: new Date(job.timestamp),
        updatedAt: new Date(job.processedOn || job.timestamp),
        processedAt: job.processedOn ? new Date(job.processedOn) : undefined,
        completedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
      };
    } catch (error) {
      console.error('Failed to get job status:', error);
      return null;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    try {
      const [appStats, priorityStats] = await Promise.all([
        this.applicationQueue.getJobCounts(),
        this.priorityQueue.getJobCounts(),
      ]);

      return {
        applications: appStats,
        priority: priorityStats,
        total: {
          waiting: appStats.waiting + priorityStats.waiting,
          active: appStats.active + priorityStats.active,
          completed: appStats.completed + priorityStats.completed,
          failed: appStats.failed + priorityStats.failed,
          delayed: appStats.delayed + priorityStats.delayed,
        },
      };
    } catch (error) {
      console.error('Failed to get queue statistics:', error);
      throw error;
    }
  }

  /**
   * Get user's job applications
   */
  async getUserApplications(userId: string, limit = 50): Promise<ApplicationStatus[]> {
    try {
      // Get jobs from both queues for the user
      const [appJobs, priorityJobs] = await Promise.all([
        this.applicationQueue.getJobs(['waiting', 'active', 'completed', 'failed'], 0, limit),
        this.priorityQueue.getJobs(['waiting', 'active', 'completed', 'failed'], 0, limit),
      ]);

      const allJobs = [...appJobs, ...priorityJobs].filter(job => job.data.userId === userId);

      const applications: ApplicationStatus[] = [];
      for (const job of allJobs) {
        const status = await this.getJobStatus(job.id!);
        if (status) {
          applications.push(status);
        }
      }

      // Sort by creation date (newest first)
      return applications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Failed to get user applications:', error);
      return [];
    }
  }

  /**
   * Cancel job application
   */
  async cancelJobApplication(jobId: string): Promise<boolean> {
    try {
      // Try to find and cancel the job in both queues
      let job = await this.applicationQueue.getJob(jobId);
      if (!job) {
        job = await this.priorityQueue.getJob(jobId);
      }

      if (!job) {
        return false;
      }

      await job.remove();
      console.log(`Job application cancelled: ${jobId}`);
      return true;
    } catch (error) {
      console.error('Failed to cancel job application:', error);
      return false;
    }
  }

  /**
   * Get health status
   */
  async getHealthStatus() {
    try {
      const ping = await this.redisConnection.ping();
      const stats = await this.getQueueStats();

      return {
        status: 'healthy',
        details: {
          redis: ping === 'PONG' ? 'connected' : 'disconnected',
          initialized: this.isInitialized,
          queues: {
            applications: this.config.queues.applications.name,
            priority: this.config.queues.priority.name,
          },
          stats,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          initialized: this.isInitialized,
        },
      };
    }
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down queue service...');

    try {
      // Close worker if it exists
      if (this.worker) {
        await this.worker.close();
      }

      // Close queue events
      await this.queueEvents.close();

      // Close queues
      await Promise.all([
        this.applicationQueue.close(),
        this.priorityQueue.close(),
      ]);

      // Close Redis connection
      await this.redisConnection.disconnect();

      this.isInitialized = false;
      console.log('Queue service shut down successfully');
    } catch (error) {
      console.error('Error shutting down queue service:', error);
    }
  }

  /**
   * Map BullMQ job state to application status
   */
  private mapJobState(state: string): ApplicationStatus['status'] {
    switch (state) {
      case 'waiting':
      case 'delayed':
        return 'queued';
      case 'active':
        return 'processing';
      case 'completed':
        return 'completed';
      case 'failed':
        return 'failed';
      default:
        return 'pending';
    }
  }

  // Getters for queue instances (for external worker setup)
  getApplicationQueue(): Queue {
    return this.applicationQueue;
  }

  getPriorityQueue(): Queue {
    return this.priorityQueue;
  }

  getQueueEvents(): QueueEvents {
    return this.queueEvents;
  }
}

// =============================================================================
// QUEUE PLUGIN
// =============================================================================

const queuePlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const config: QueueConfig = {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '1'), // Use DB 1 for queues
      maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
      retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100'),
      lazyConnect: process.env.REDIS_LAZY_CONNECT !== 'false',
      ssl: process.env.REDIS_SSL === 'true',
    },
    queues: {
      applications: {
        name: process.env.QUEUE_APPLICATIONS_NAME || 'job-applications',
        defaultJobOptions: {
          removeOnComplete: parseInt(process.env.QUEUE_REMOVE_ON_COMPLETE || '100'),
          removeOnFail: parseInt(process.env.QUEUE_REMOVE_ON_FAIL || '50'),
          attempts: parseInt(process.env.QUEUE_MAX_ATTEMPTS || '3'),
          backoff: {
            type: 'exponential',
            delay: parseInt(process.env.QUEUE_BACKOFF_DELAY || '5000'),
          },
        },
      },
      priority: {
        name: process.env.QUEUE_PRIORITY_NAME || 'job-applications-priority',
        defaultJobOptions: {
          removeOnComplete: parseInt(process.env.QUEUE_REMOVE_ON_COMPLETE || '100'),
          removeOnFail: parseInt(process.env.QUEUE_REMOVE_ON_FAIL || '50'),
          attempts: parseInt(process.env.QUEUE_MAX_ATTEMPTS || '3'),
          backoff: {
            type: 'exponential',
            delay: parseInt(process.env.QUEUE_BACKOFF_DELAY || '2000'), // Faster for priority
          },
        },
      },
    },
    workers: {
      concurrency: parseInt(process.env.QUEUE_WORKER_CONCURRENCY || '3'),
      maxStalledCount: parseInt(process.env.QUEUE_MAX_STALLED_COUNT || '1'),
      stalledInterval: parseInt(process.env.QUEUE_STALLED_INTERVAL || '30000'),
      removeOnComplete: parseInt(process.env.QUEUE_REMOVE_ON_COMPLETE || '100'),
      removeOnFail: parseInt(process.env.QUEUE_REMOVE_ON_FAIL || '50'),
    },
  };

  fastify.log.info('Initializing Queue Management Service...');

  // Create queue service
  const queueService = new QueueService(config);

  try {
    // Initialize the service
    await queueService.initialize();

    // Register with service registry if available
    if (fastify.serviceRegistry) {
      fastify.serviceRegistry.register(
        'queue',
        queueService,
        () => queueService.getHealthStatus()
      );
    }

    fastify.log.info('✅ Queue Management Service initialized successfully');
  } catch (error) {
    fastify.log.error('❌ Failed to initialize Queue Management Service:', error);
    throw error;
  }

  // =============================================================================
  // REGISTER WITH FASTIFY
  // =============================================================================

  // Decorate Fastify instance
  fastify.decorate('queueService', queueService);

  // Connect WebSocket service if available (after websocket plugin loads)
  fastify.addHook('onReady', async () => {
    if (fastify.websocket) {
      queueService.setWebSocketService(fastify.websocket);
      fastify.log.info('✅ Queue service connected to WebSocket service');
    } else {
      fastify.log.warn('⚠️ WebSocket service not available - real-time updates disabled');
    }
  });

  // Add queue health check endpoint
  fastify.get('/health/queue', {
    schema: {
      summary: 'Get queue service health status',
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            queue: { type: 'object' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const health = await queueService.getHealthStatus();
      const statusCode = health.status === 'healthy' ? 200 : 503;

      return reply.code(statusCode).send({
        status: health.status,
        timestamp: new Date().toISOString(),
        queue: health.details,
      });
    } catch (error) {
      return reply.code(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Queue health check failed',
      });
    }
  });

  // Add queue statistics endpoint
  fastify.get('/queue/stats', {
    schema: {
      summary: 'Get queue statistics',
      tags: ['Queue'],
      response: {
        200: {
          type: 'object',
          properties: {
            timestamp: { type: 'string' },
            stats: { type: 'object' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const stats = await queueService.getQueueStats();

      return reply.send({
        timestamp: new Date().toISOString(),
        stats,
      });
    } catch (error) {
      return reply.code(500).send({
        error: error instanceof Error ? error.message : 'Failed to get queue stats',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    fastify.log.info('Shutting down queue service...');
    await queueService.shutdown();
  });

  fastify.log.info('🚀 Queue service registered successfully with Fastify');
};

// =============================================================================
// TYPE DECLARATIONS
// =============================================================================

declare module 'fastify' {
  interface FastifyInstance {
    queueService: QueueService;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default fastifyPlugin(queuePlugin, {
  name: 'queue',
  fastify: '4.x',
  dependencies: ['services'], // Depends on services plugin for Redis
});

export type { QueueConfig, JobData, ApplicationStatus };
export { QueueService };