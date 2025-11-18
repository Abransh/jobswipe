/**
 * @fileoverview Job Application Queue Definition
 * @description BullMQ queue configuration for job application automation
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { Queue, QueueOptions, DefaultJobOptions } from 'bullmq';
import { bullmqConnection } from '../config/redis.config';

/**
 * Queue name constants
 */
export const JOB_APPLICATION_QUEUE_NAME = 'job-applications';
export const JOB_APPLICATION_DLQ_NAME = 'job-applications-dlq'; // Dead Letter Queue

/**
 * Job data interface for type safety
 */
export interface JobApplicationData {
  applicationId: string;
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
  executionMode: 'server' | 'desktop';
  options?: {
    headless?: boolean;
    timeout?: number;
    maxRetries?: number;
    priority?: number;
    [key: string]: any;
  };
}

/**
 * Default job options for all jobs in this queue
 */
export const defaultJobOptions: DefaultJobOptions = {
  // Retry configuration with exponential backoff
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000, // Start with 5 seconds, doubles each retry
  },

  // Timeout configuration
  timeout: 900000, // 15 minutes max per job

  // Job retention configuration
  removeOnComplete: {
    count: 1000, // Keep last 1000 completed jobs
    age: 86400,  // Keep for 24 hours (in seconds)
  },
  removeOnFail: {
    count: 5000, // Keep last 5000 failed jobs for debugging
  },

  // Job ID will be set per job (from database ID)
  // This ensures idempotency
};

/**
 * Queue options configuration
 */
export const queueOptions: QueueOptions = {
  connection: bullmqConnection,
  defaultJobOptions,

  // Streams configuration
  streams: {
    events: {
      maxLen: 10000, // Keep last 10000 events
    },
  },
};

/**
 * Create and configure the job application queue
 * @param dlq - Dead Letter Queue for failed jobs (optional)
 * @returns Configured BullMQ Queue instance
 */
export function createJobApplicationQueue(
  dlq?: Queue<DeadLetterJobData>
): Queue<JobApplicationData> {
  const queue = new Queue<JobApplicationData>(
    JOB_APPLICATION_QUEUE_NAME,
    queueOptions
  );

  // Queue event listeners for monitoring
  queue.on('error', (error) => {
    console.error('❌ Queue error:', error);
  });

  queue.on('waiting', (jobId) => {
    console.log(`⏳ Job ${jobId} is waiting`);
  });

  queue.on('active', (job) => {
    console.log(`🔄 Job ${job.id} is now active`);
  });

  queue.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
  });

  // Enhanced failed handler with Dead Letter Queue support
  queue.on('failed', async (job, error) => {
    if (!job) {
      console.error('❌ Job failed but job object is null:', error.message);
      return;
    }

    console.error(`❌ Job ${job.id} failed (attempt ${job.attemptsMade}/${job.opts.attempts}):`, error.message);

    // Check if job has exhausted all retry attempts
    const maxAttempts = job.opts.attempts || 3;
    const hasExhaustedRetries = job.attemptsMade >= maxAttempts;

    if (hasExhaustedRetries && dlq) {
      // Move to Dead Letter Queue
      try {
        console.warn(`💀 Job ${job.id} exhausted all ${maxAttempts} attempts - moving to DLQ`);

        // Determine failure reason
        let failureReason: DeadLetterJobData['failureMetadata']['failureReason'] = 'max_attempts';
        if (error.message.includes('timeout')) {
          failureReason = 'timeout';
        } else if (error.message.includes('validation')) {
          failureReason = 'validation_error';
        } else if (error.message.includes('system')) {
          failureReason = 'system_error';
        }

        // Create DLQ job data with failure metadata
        const dlqJobData: DeadLetterJobData = {
          ...job.data,
          failureMetadata: {
            originalJobId: job.id || 'unknown',
            failedAt: new Date().toISOString(),
            attemptsMade: job.attemptsMade,
            lastError: error.message,
            lastErrorStack: error.stack,
            failureReason,
            originalQueueName: JOB_APPLICATION_QUEUE_NAME,
          },
        };

        // Add to Dead Letter Queue with original job ID
        await dlq.add(
          `dlq-${job.id}`,
          dlqJobData,
          {
            jobId: `dlq-${job.id}`, // Ensure unique ID in DLQ
            removeOnComplete: false, // Keep for manual review
            removeOnFail: false,
          }
        );

        console.log(`✅ Job ${job.id} successfully moved to Dead Letter Queue`);

        // TODO: Send alert notification to monitoring system
        // TODO: Update database application status to 'DEAD_LETTER'
      } catch (dlqError) {
        console.error(`❌ Failed to move job ${job.id} to DLQ:`, dlqError);
        // Job will remain in failed state for manual intervention
      }
    }
  });

  queue.on('stalled', (jobId) => {
    console.warn(`⚠️ Job ${jobId} stalled`);
  });

  queue.on('progress', (job, progress) => {
    console.log(`📊 Job ${job.id} progress: ${progress}%`);
  });

  console.log(`✅ Job Application Queue '${JOB_APPLICATION_QUEUE_NAME}' created`);

  return queue;
}

/**
 * Priority levels mapping
 * Higher number = higher priority in BullMQ
 */
export const PRIORITY_LEVELS = {
  IMMEDIATE: 1,  // Highest priority
  URGENT: 2,
  HIGH: 3,
  NORMAL: 5,     // Default
  LOW: 10,       // Lowest priority
} as const;

/**
 * Calculate priority based on execution mode and user tier
 * @param executionMode - 'server' or 'desktop'
 * @param userTier - User's subscription tier
 * @param isUrgent - Whether job is marked urgent
 * @returns Priority number (lower = higher priority)
 */
export function calculateJobPriority(
  executionMode: 'server' | 'desktop',
  userTier: 'free' | 'basic' | 'pro' | 'enterprise' = 'free',
  isUrgent: boolean = false
): number {
  if (isUrgent) return PRIORITY_LEVELS.IMMEDIATE;

  // Premium users get higher priority
  if (userTier === 'enterprise') return PRIORITY_LEVELS.URGENT;
  if (userTier === 'pro') return PRIORITY_LEVELS.HIGH;

  // Server execution gets priority over desktop (uses resources)
  if (executionMode === 'server') return PRIORITY_LEVELS.NORMAL;

  // Desktop execution is lower priority (waiting for user)
  return PRIORITY_LEVELS.LOW;
}

/**
 * Dead Letter Queue Job Data
 * Includes original job data plus failure metadata
 */
export interface DeadLetterJobData extends JobApplicationData {
  failureMetadata: {
    originalJobId: string;
    failedAt: string;
    attemptsMade: number;
    lastError: string;
    lastErrorStack?: string;
    failureReason: 'max_attempts' | 'timeout' | 'system_error' | 'validation_error';
    originalQueueName: string;
  };
}

/**
 * Dead Letter Queue options
 * Jobs in DLQ are kept indefinitely for manual review
 */
export const dlqOptions: QueueOptions = {
  connection: bullmqConnection,
  defaultJobOptions: {
    removeOnComplete: false, // Keep all completed DLQ jobs for audit
    removeOnFail: false,     // Keep all failed DLQ jobs
    attempts: 1,             // Don't retry DLQ jobs
  },
  streams: {
    events: {
      maxLen: 50000, // Keep more events for DLQ
    },
  },
};

/**
 * Create and configure the Dead Letter Queue
 * @returns Configured BullMQ Queue instance for DLQ
 */
export function createDeadLetterQueue(): Queue<DeadLetterJobData> {
  const dlq = new Queue<DeadLetterJobData>(
    JOB_APPLICATION_DLQ_NAME,
    dlqOptions
  );

  // DLQ event listeners
  dlq.on('error', (error) => {
    console.error('❌ DLQ error:', error);
  });

  dlq.on('added', (job) => {
    console.log(`💀 Job ${job.id} added to Dead Letter Queue`);
  });

  console.log(`✅ Dead Letter Queue '${JOB_APPLICATION_DLQ_NAME}' created`);

  return dlq;
}
