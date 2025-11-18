/**
 * @fileoverview Queue Plugin - BullMQ Integration for Fastify
 * @description Production-grade distributed queue system with Redis + PostgreSQL dual persistence
 * @version 2.0.0 (REWRITTEN)
 * @author JobSwipe Team
 *
 * ARCHITECTURE:
 * - Redis (BullMQ): Queue state, job processing, real-time operations
 * - PostgreSQL: Permanent record, audit trail, source of truth
 * - Dual-persistence: Database FIRST, then queue to BullMQ
 */

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { Queue, QueueEvents } from 'bullmq';
import { bullmqConnection } from '../config/redis.config';
import {
  createJobApplicationQueue,
  createDeadLetterQueue,
  JOB_APPLICATION_QUEUE_NAME,
  JOB_APPLICATION_DLQ_NAME,
  JobApplicationData,
  DeadLetterJobData
} from '../queues/job-application.queue';
import { createJobApplicationWorker } from '../workers/job-application.worker';

// =============================================================================
// TYPE DECLARATIONS
// =============================================================================

declare module 'fastify' {
  interface FastifyInstance {
    jobQueue: Queue<JobApplicationData>;
    deadLetterQueue: Queue<DeadLetterJobData>; // Dead Letter Queue
    jobWorker: ReturnType<typeof createJobApplicationWorker>;
    queueEvents: QueueEvents;
    dlqEvents: QueueEvents; // DLQ events
  }
}

// =============================================================================
// QUEUE PLUGIN
// =============================================================================

async function queuePlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.log.info('🔧 Initializing BullMQ Queue Plugin...');

  try {
    // =========================================================================
    // STEP 1: Create Dead Letter Queue (DLQ) first
    // =========================================================================
    fastify.log.info('🔧 Creating Dead Letter Queue...');
    const dlq = createDeadLetterQueue();
    fastify.log.info(`✅ Dead Letter Queue '${JOB_APPLICATION_DLQ_NAME}' created`);

    // =========================================================================
    // STEP 2: Create Main Queue with DLQ integration
    // =========================================================================
    fastify.log.info('🔧 Creating Job Application Queue...');
    const queue = createJobApplicationQueue(dlq);
    fastify.log.info(`✅ Queue '${JOB_APPLICATION_QUEUE_NAME}' created with DLQ integration`);

    // =========================================================================
    // STEP 3: Create Queue Events for monitoring
    // =========================================================================
    const queueEvents = new QueueEvents(JOB_APPLICATION_QUEUE_NAME, {
      connection: bullmqConnection,
    });

    const dlqEvents = new QueueEvents(JOB_APPLICATION_DLQ_NAME, {
      connection: bullmqConnection,
    });

    queueEvents.on('waiting', ({ jobId }) => {
      fastify.log.debug({ jobId }, '⏳ Job waiting in queue');
    });

    queueEvents.on('active', ({ jobId, prev }) => {
      fastify.log.info({ jobId, prevStatus: prev }, '🔄 Job became active');
    });

    queueEvents.on('completed', ({ jobId, returnvalue }) => {
      fastify.log.info(
        { jobId, success: returnvalue?.success },
        '✅ Job completed'
      );
    });

    queueEvents.on('failed', ({ jobId, failedReason }) => {
      fastify.log.error(
        { jobId, error: failedReason },
        '❌ Job failed'
      );
    });

    queueEvents.on('stalled', ({ jobId }) => {
      fastify.log.warn({ jobId }, '⚠️ Job stalled');
    });

    queueEvents.on('progress', ({ jobId, data }) => {
      fastify.log.debug({ jobId, progress: data }, '📊 Job progress update');
    });

    fastify.log.info('✅ Queue events listener created');

    // DLQ event listeners
    dlqEvents.on('added', ({ jobId }) => {
      fastify.log.warn({ jobId }, '💀 Job added to Dead Letter Queue');
    });

    dlqEvents.on('failed', ({ jobId, failedReason }) => {
      fastify.log.error(
        { jobId, error: failedReason },
        '❌ DLQ job failed (critical - requires manual intervention)'
      );
    });

    fastify.log.info('✅ DLQ events listener created');

    // =========================================================================
    // STEP 4: Create Worker (only if not in web-only mode)
    // =========================================================================
    const isWorkerEnabled = process.env.QUEUE_WORKER_ENABLED !== 'false';
    let worker = null;

    if (isWorkerEnabled) {
      worker = createJobApplicationWorker(fastify);
      fastify.log.info('✅ BullMQ worker created and started');
    } else {
      fastify.log.warn('⚠️ Queue worker disabled (QUEUE_WORKER_ENABLED=false)');
    }

    // =========================================================================
    // STEP 5: Decorate Fastify instance
    // =========================================================================
    fastify.decorate('jobQueue', queue);
    fastify.decorate('deadLetterQueue', dlq);
    fastify.decorate('queueEvents', queueEvents);
    fastify.decorate('dlqEvents', dlqEvents);
    if (worker) {
      fastify.decorate('jobWorker', worker);
    }

    fastify.log.info('✅ Queue and DLQ decorators added to Fastify instance');

    // =========================================================================
    // STEP 6: Health check endpoint
    // =========================================================================
    fastify.get('/health/queue', async (request, reply) => {
      try {
        const [jobCounts, isPaused, isReady] = await Promise.all([
          queue.getJobCounts(),
          queue.isPaused(),
          queue.isReady(),
        ]);

        const health = {
          status: isReady ? 'healthy' : 'unhealthy',
          queue: {
            name: JOB_APPLICATION_QUEUE_NAME,
            ready: isReady,
            paused: isPaused,
            counts: jobCounts,
          },
          worker: worker
            ? {
                enabled: true,
                concurrency: worker['opts'].concurrency,
                running: worker.isRunning(),
              }
            : {
                enabled: false,
              },
          timestamp: new Date().toISOString(),
        };

        return reply.code(isReady ? 200 : 503).send(health);
      } catch (error) {
        fastify.log.error({ error }, '❌ Queue health check failed');
        return reply.code(503).send({
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
      }
    });

    // =========================================================================
    // STEP 6: Queue stats endpoint
    // =========================================================================
    fastify.get('/queue/stats', async (request, reply) => {
      try {
        const [jobCounts, waiting, active, completed, failed] = await Promise.all([
          queue.getJobCounts(),
          queue.getWaiting(0, 10),
          queue.getActive(0, 10),
          queue.getCompleted(0, 10),
          queue.getFailed(0, 10),
        ]);

        return reply.send({
          counts: jobCounts,
          recentJobs: {
            waiting: waiting.map((j) => ({
              id: j.id,
              data: j.data,
              timestamp: j.timestamp,
            })),
            active: active.map((j) => ({
              id: j.id,
              data: j.data,
              timestamp: j.timestamp,
              processedOn: j.processedOn,
            })),
            completed: completed.map((j) => ({
              id: j.id,
              data: j.data,
              timestamp: j.timestamp,
              finishedOn: j.finishedOn,
            })),
            failed: failed.map((j) => ({
              id: j.id,
              data: j.data,
              timestamp: j.timestamp,
              failedReason: j.failedReason,
            })),
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        fastify.log.error({ error }, '❌ Failed to get queue stats');
        return reply.code(500).send({
          error: error instanceof Error ? error.message : 'Failed to get queue stats',
        });
      }
    });

    // =========================================================================
    // STEP 7: Graceful shutdown
    // =========================================================================
    fastify.addHook('onClose', async () => {
      fastify.log.info('🔌 Shutting down queue system...');

      try {
        // Close worker first (stop processing new jobs)
        if (worker) {
          await worker.close();
          fastify.log.info('✅ Worker closed');
        }

        // Close queue events
        await queueEvents.close();
        fastify.log.info('✅ Queue events closed');

        // Close queue
        await queue.close();
        fastify.log.info('✅ Queue closed');

        fastify.log.info('✅ Queue system shutdown complete');
      } catch (error) {
        fastify.log.error({ error }, '❌ Error during queue shutdown');
      }
    });

    fastify.log.info('🚀 BullMQ Queue Plugin initialized successfully');
  } catch (error) {
    fastify.log.error({ error }, '❌ Failed to initialize Queue Plugin');
    throw error;
  }
}

// =============================================================================
// EXPORT
// =============================================================================

export default fp(queuePlugin, {
  name: 'queue',
  dependencies: ['services'], // Load after services plugin (for db, etc.)
});
