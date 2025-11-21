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

  // Job retention configuration
  removeOnComplete: {
    count: 1000, // Keep last 1000 completed jobs
    age: 86400,  // Keep for 24 hours (in seconds)
  },
  removeOnFail: {
    count: 5000, // Keep last 5000 failed jobs for debugging
  },

  // NOTE: Job timeout is configured on the Worker, not in DefaultJobOptions
  // See: job-application.worker.ts for timeout configuration

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

  // NOTE: Event listeners have been moved to QueueEvents in queue.plugin.ts
  // BullMQ v5 deprecated queue.on() in favor of QueueEvents
  // All monitoring and DLQ logic is now handled by the queue.plugin.ts using QueueEvents

  // Error events still supported on Queue instance for queue-level errors
  queue.on('error', (error) => {
    console.error('❌ Queue error:', error);
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

  // NOTE: DLQ event listeners moved to QueueEvents in queue.plugin.ts
  // BullMQ v5 deprecated queue.on() in favor of QueueEvents

  // Error events still supported on Queue instance for queue-level errors
  dlq.on('error', (error) => {
    console.error('❌ DLQ error:', error);
  });

  console.log(`✅ Dead Letter Queue '${JOB_APPLICATION_DLQ_NAME}' created`);

  return dlq;
}
