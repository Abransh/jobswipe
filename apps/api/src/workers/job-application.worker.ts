/**
 * @fileoverview Job Application Worker
 * @description BullMQ worker that processes job application automation tasks
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { Job, Worker, WorkerOptions } from 'bullmq';
import { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import { bullmqConnection } from '../config/redis.config';
import { JOB_APPLICATION_QUEUE_NAME, JobApplicationData } from '../queues/job-application.queue';
import type { WebSocketMessage } from '../services/WebSocketService';

/**
 * Error classification for retry logic
 */
function classifyError(error: any): string {
  const errorMessage = error?.message?.toLowerCase() || '';

  if (errorMessage.includes('timeout')) return 'TIMEOUT';
  if (errorMessage.includes('proxy')) return 'PROXY_ERROR';
  if (errorMessage.includes('captcha')) return 'CAPTCHA_DETECTED';
  if (errorMessage.includes('rate limit')) return 'RATE_LIMITED';
  if (errorMessage.includes('network')) return 'NETWORK_ERROR';
  if (errorMessage.includes('authentication')) return 'AUTH_ERROR';
  if (errorMessage.includes('not found') || errorMessage.includes('404')) return 'NOT_FOUND';

  return 'UNKNOWN_ERROR';
}

/**
 * Create job processor function
 * @param fastify - Fastify instance with all services attached
 * @returns Async processor function for BullMQ worker
 */
export function createJobProcessor(fastify: FastifyInstance) {
  return async (job: Job<JobApplicationData>) => {
    const { applicationId, userId, jobData, userProfile, executionMode, options } = job.data;

    const correlationId = `job-${applicationId}-attempt-${job.attemptsMade + 1}`;
    const startTime = Date.now();

    fastify.log.info(
      {
        correlationId,
        applicationId,
        userId,
        jobId: jobData.id,
        jobTitle: jobData.title,
        company: jobData.company,
        executionMode,
        attempt: job.attemptsMade + 1,
        maxAttempts: job.opts.attempts,
      },
      '🚀 Starting job processing'
    );

    try {
      // STEP 1: Update database status to PROCESSING
      await fastify.db.applicationQueue.update({
        where: { id: applicationId },
        data: {
          status: 'PROCESSING',
          startedAt: new Date(),
          attempts: job.attemptsMade + 1,
          updatedAt: new Date(),
        },
      });

      fastify.log.info({ correlationId, applicationId }, '📝 Database status updated to PROCESSING');

      // STEP 2: Route to correct execution service based on mode
      let result;

      if (executionMode === 'server') {
        // SERVER EXECUTION PATH
        fastify.log.info({ correlationId, applicationId }, '🖥️ Executing on server');

        // Check if ServerAutomationService is available
        if (!fastify.serverAutomationService) {
          throw new Error('ServerAutomationService not available');
        }

        // Execute automation via Python bridge
        result = await fastify.serverAutomationService.executeAutomation({
          userId,
          jobId: jobData.id,
          applicationId,
          companyAutomation: fastify.automationService.detectCompanyAutomation(jobData.applyUrl),
          userProfile,
          jobData,
          options: options || {},
        });

        fastify.log.info(
          { correlationId, applicationId, success: result.success },
          '✅ Server automation completed'
        );

        // Record server execution usage
        await fastify.automationLimits.recordServerApplication(userId);

      } else if (executionMode === 'desktop') {
        // DESKTOP EXECUTION PATH
        fastify.log.info(
          { correlationId, applicationId },
          '🖥️ Desktop mode - job queued for desktop claim'
        );

        // Update status to queued for desktop
        await fastify.db.applicationQueue.update({
          where: { id: applicationId },
          data: {
            status: 'QUEUED_FOR_DESKTOP',
            updatedAt: new Date(),
          },
        });

        // Emit event for WebSocket notification to desktop
        fastify.automationService.emit('application-queued-desktop', {
          applicationId,
          userId,
          jobData,
        });

        // Notify desktop via WebSocket
        if (fastify.websocket) {
          const message: WebSocketMessage = {
            type: 'desktop-job-available',
            event: 'job-queued-for-desktop',
            data: {
              applicationId,
              jobTitle: jobData.title,
              company: jobData.company,
              jobId: jobData.id,
            },
            messageId: randomUUID(),
            timestamp: new Date(),
            userId,
          };
          await fastify.websocket.sendToUser(userId, message);
        }

        // Return early - desktop will handle processing
        return {
          success: true,
          status: 'queued_for_desktop',
          message: 'Job queued for desktop execution - waiting for desktop to claim',
        };
      } else {
        throw new Error(`Unknown execution mode: ${executionMode}`);
      }

      // STEP 3: Update database with SUCCESS results
      await fastify.db.applicationQueue.update({
        where: { id: applicationId },
        data: {
          status: 'COMPLETED',
          success: true,
          completedAt: new Date(),
          responseData: result,
          errorMessage: null,
          errorType: null,
          updatedAt: new Date(),
        },
      });

      const duration = Date.now() - startTime;

      fastify.log.info(
        {
          correlationId,
          applicationId,
          duration,
          success: true,
        },
        '✅ Job completed successfully'
      );

      // STEP 4: Emit success event for WebSocket
      fastify.automationService.emit('application-completed', {
        applicationId,
        userId,
        jobId: jobData.id,
        jobTitle: jobData.title,
        company: jobData.company,
        executionMode,
        result,
        timestamp: new Date(),
      });

      // Notify user via WebSocket
      if (fastify.websocket) {
        await fastify.websocket.sendApplicationStatusUpdate({
          applicationId,
          jobId: jobData.id,
          userId,
          status: 'completed',
          executionMode,
          result,
          timestamp: new Date(),
        });
      }

      return result;

    } catch (error) {
      // ERROR HANDLING
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorType = classifyError(error);
      const duration = Date.now() - startTime;

      fastify.log.error(
        {
          correlationId,
          applicationId,
          error: errorMessage,
          errorType,
          attempt: job.attemptsMade + 1,
          maxAttempts: job.opts.attempts,
          duration,
        },
        '❌ Job processing failed'
      );

      // Update database with error details
      await fastify.db.applicationQueue.update({
        where: { id: applicationId },
        data: {
          errorMessage,
          errorType,
          attempts: job.attemptsMade + 1,
          updatedAt: new Date(),
        },
      });

      // Check if this is the final attempt
      const isFinalAttempt = job.attemptsMade + 1 >= (job.opts.attempts || 3);

      if (isFinalAttempt) {
        // FINAL FAILURE - Mark as permanently failed
        await fastify.db.applicationQueue.update({
          where: { id: applicationId },
          data: {
            status: 'FAILED',
            success: false,
            failedAt: new Date(),
            completedAt: new Date(),
            updatedAt: new Date(),
          },
        });

        fastify.log.error(
          { correlationId, applicationId, errorType },
          '💀 Job permanently failed after all retry attempts'
        );

        // Emit failure event
        fastify.automationService.emit('application-failed', {
          applicationId,
          userId,
          jobId: jobData.id,
          jobTitle: jobData.title,
          company: jobData.company,
          error: errorMessage,
          errorType,
          executionMode,
          timestamp: new Date(),
        });

        // Notify user via WebSocket
        if (fastify.websocket) {
          await fastify.websocket.sendApplicationStatusUpdate({
            applicationId,
            jobId: jobData.id,
            userId,
            status: 'failed',
            executionMode,
            error: errorMessage,
            timestamp: new Date(),
          });
        }
      } else {
        // Will retry - update status
        const nextRetryDelay = Math.pow(2, job.attemptsMade) * 5000; // Exponential backoff
        const nextRetryAt = new Date(Date.now() + nextRetryDelay);

        await fastify.db.applicationQueue.update({
          where: { id: applicationId },
          data: {
            status: 'RETRYING',
            nextRetryAt,
            updatedAt: new Date(),
          },
        });

        fastify.log.warn(
          {
            correlationId,
            applicationId,
            nextRetryIn: `${nextRetryDelay / 1000}s`,
            attempt: job.attemptsMade + 1,
          },
          '🔄 Job will retry'
        );
      }

      // Re-throw error to let BullMQ handle retry logic
      throw error;
    }
  };
}

/**
 * Create and configure the BullMQ Worker
 * @param fastify - Fastify instance
 * @returns Configured Worker instance
 */
export function createJobApplicationWorker(fastify: FastifyInstance): Worker<JobApplicationData> {
  const workerOptions: WorkerOptions = {
    connection: bullmqConnection,
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5', 10),

    // Rate limiting to prevent overwhelming downstream services
    limiter: {
      max: parseInt(process.env.QUEUE_RATE_LIMIT_MAX || '10', 10), // Max jobs
      duration: parseInt(process.env.QUEUE_RATE_LIMIT_DURATION || '1000', 10), // Per milliseconds
    },

    // Lock settings to prevent job stealing
    lockDuration: 900000, // 15 minutes (matches job timeout)
    lockRenewTime: 450000, // Renew lock every 7.5 minutes

    // Auto-run on creation
    autorun: true,
  };

  const worker = new Worker<JobApplicationData>(
    JOB_APPLICATION_QUEUE_NAME,
    createJobProcessor(fastify),
    workerOptions
  );

  // Worker event listeners
  worker.on('ready', () => {
    fastify.log.info(
      {
        queue: JOB_APPLICATION_QUEUE_NAME,
        concurrency: workerOptions.concurrency,
      },
      '✅ Job Application Worker ready'
    );
  });

  worker.on('active', (job) => {
    fastify.log.debug(
      { jobId: job.id, applicationId: job.data.applicationId },
      '🔄 Worker picked up job'
    );
  });

  worker.on('completed', (job, result) => {
    fastify.log.info(
      {
        jobId: job.id,
        applicationId: job.data.applicationId,
        duration: job.finishedOn ? job.finishedOn - job.processedOn! : 0,
      },
      '✅ Worker completed job'
    );
  });

  worker.on('failed', (job, error) => {
    fastify.log.error(
      {
        jobId: job?.id,
        applicationId: job?.data?.applicationId,
        error: error.message,
        attempt: job?.attemptsMade,
      },
      '❌ Worker job failed'
    );
  });

  worker.on('error', (error) => {
    fastify.log.error({ error }, '❌ Worker error');
  });

  worker.on('stalled', (jobId) => {
    fastify.log.warn({ jobId }, '⚠️ Job stalled (worker may have crashed)');
  });

  return worker;
}