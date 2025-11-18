/**
 * @fileoverview Job Application Queue Definition
 * @description BullMQ queue configuration for job application automation
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { Queue, QueueOptions, DefaultJobOptions } from 'bullmq';
import { bullmqConnection } from '../config/redis.config';

/**
 * Queue name constant
 */
export const JOB_APPLICATION_QUEUE_NAME = 'job-applications';

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
 * @returns Configured BullMQ Queue instance
 */
export function createJobApplicationQueue(): Queue<JobApplicationData> {
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

  queue.on('failed', (job, error) => {
    console.error(`❌ Job ${job?.id} failed:`, error.message);
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
