/**
 * @fileoverview Queue Recovery Service
 * @description Handles server restarts, Redis failures, and stale job recovery
 * @version 1.0.0
 * @author JobSwipe Team
 *
 * CRITICAL RESPONSIBILITIES:
 * ✅ Restore jobs from PostgreSQL to BullMQ on startup
 * ✅ Reset stale jobs (stuck in PROCESSING for too long)
 * ✅ Clean up orphaned BullMQ jobs
 * ✅ Handle Redis failures gracefully
 */

import { FastifyInstance } from 'fastify';

export class QueueRecoveryService {
  constructor(private fastify: FastifyInstance) {}

  /**
   * Restore pending jobs from PostgreSQL to BullMQ on startup
   * Handles server crashes, Redis failures, etc.
   */
  async restoreQueueFromDatabase(): Promise<void> {
    this.fastify.log.info('🔄 Starting queue recovery from database...');

    try {
      // =================================================================
      // STEP 1: Reset stale jobs first
      // =================================================================
      await this.resetStaleJobs();

      // =================================================================
      // STEP 2: Find jobs that should be in queue but might not be
      // =================================================================
      const pendingJobs = await this.fastify.db.applicationQueue.findMany({
        where: {
          status: { in: ['QUEUED', 'PENDING'] },
          executionMode: 'server', // Only re-queue server jobs
        },
        orderBy: [{ priority: 'desc' }, { scheduledAt: 'asc' }],
      });

      this.fastify.log.info(
        { jobCount: pendingJobs.length },
        `Found \${pendingJobs.length} pending server jobs to restore`
      );

      // =================================================================
      // STEP 3: Re-add each job to BullMQ queue
      // =================================================================
      let restoredCount = 0;
      let skippedCount = 0;
      let failedCount = 0;

      for (const job of pendingJobs) {
        try {
          // Check if already in BullMQ
          const existingJob = await this.fastify.jobQueue?.getJob(job.id);
          if (existingJob) {
            this.fastify.log.debug({ jobId: job.id }, 'Job already in queue, skipping');
            skippedCount++;
            continue;
          }

          // Re-add to queue
          await this.fastify.jobQueue?.add(
            'job-application',
            {
              applicationId: job.id,
              userId: job.userId,
              jobData: job.jobData,
              userProfile: job.userProfile,
              executionMode: job.executionMode?.toLowerCase(),
              options: job.automationConfig || {},
            },
            {
              jobId: job.id,
              priority: this.mapPriorityToNumber(job.priority),
              attempts: job.maxAttempts,
            }
          );

          this.fastify.log.info({ jobId: job.id }, '✅ Job restored to queue');
          restoredCount++;
        } catch (error) {
          this.fastify.log.error({ jobId: job.id, error }, '❌ Failed to restore job');
          failedCount++;
        }
      }

      this.fastify.log.info(
        { restoredCount, skippedCount, failedCount },
        `✅ Queue recovery complete. Restored: \${restoredCount}, Skipped: \${skippedCount}, Failed: \${failedCount}`
      );
    } catch (error) {
      this.fastify.log.error({ error }, '❌ Queue recovery failed');
      throw error;
    }
  }

  /**
   * Find and reset stale processing jobs
   * Jobs stuck in PROCESSING for > 30 minutes
   */
  async resetStaleJobs(): Promise<void> {
    this.fastify.log.info('🔍 Checking for stale jobs...');

    try {
      const staleThreshold = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes

      // Find stale server jobs
      const staleServerJobs = await this.fastify.db.applicationQueue.findMany({
        where: {
          status: 'PROCESSING',
          claimedBy: 'SERVER',
          startedAt: { lt: staleThreshold },
        },
      });

      // Find stale desktop jobs (different threshold - 1 hour)
      const staleDesktopThreshold = new Date(Date.now() - 60 * 60 * 1000);
      const staleDesktopJobs = await this.fastify.db.applicationQueue.findMany({
        where: {
          status: 'PROCESSING',
          claimedBy: 'DESKTOP',
          startedAt: { lt: staleDesktopThreshold },
        },
      });

      const staleJobs = [...staleServerJobs, ...staleDesktopJobs];

      if (staleJobs.length === 0) {
        this.fastify.log.info('✅ No stale jobs found');
        return;
      }

      this.fastify.log.warn(
        { count: staleJobs.length },
        `Found \${staleJobs.length} stale jobs to reset`
      );

      // Reset stale jobs
      for (const job of staleJobs) {
        await this.fastify.db.applicationQueue.update({
          where: { id: job.id },
          data: {
            status: job.claimedBy === 'SERVER' ? 'QUEUED' : 'QUEUED_FOR_DESKTOP',
            claimedBy: null,
            claimedAt: null,
            errorMessage: 'Job reset due to timeout (stale processing)',
            errorType: 'TIMEOUT',
            updatedAt: new Date(),
          },
        });

        this.fastify.log.warn(
          {
            jobId: job.id,
            claimedBy: job.claimedBy,
            startedAt: job.startedAt,
          },
          '⚠️ Reset stale job'
        );
      }

      this.fastify.log.info(
        { count: staleJobs.length },
        `✅ Reset \${staleJobs.length} stale jobs`
      );
    } catch (error) {
      this.fastify.log.error({ error }, '❌ Failed to reset stale jobs');
      throw error;
    }
  }

  /**
   * Clean up orphaned BullMQ jobs
   * Jobs that exist in BullMQ but not in database
   */
  async cleanupOrphanedBullMQJobs(): Promise<void> {
    this.fastify.log.info('🧹 Cleaning up orphaned BullMQ jobs...');

    try {
      if (!this.fastify.jobQueue) {
        this.fastify.log.warn('⚠️ BullMQ queue not available, skipping cleanup');
        return;
      }

      // Get all jobs from BullMQ
      const [waiting, active, delayed] = await Promise.all([
        this.fastify.jobQueue.getWaiting(0, 1000),
        this.fastify.jobQueue.getActive(0, 1000),
        this.fastify.jobQueue.getDelayed(0, 1000),
      ]);

      const allBullMQJobs = [...waiting, ...active, ...delayed];

      this.fastify.log.info(
        { count: allBullMQJobs.length },
        `Found \${allBullMQJobs.length} jobs in BullMQ`
      );

      let orphanedCount = 0;

      for (const bullMQJob of allBullMQJobs) {
        const applicationId = bullMQJob.data.applicationId;

        // Check if exists in database
        const dbRecord = await this.fastify.db.applicationQueue.findUnique({
          where: { id: applicationId },
        });

        if (!dbRecord) {
          // Orphaned job - exists in BullMQ but not in database
          this.fastify.log.warn(
            { applicationId, bullMQJobId: bullMQJob.id },
            '⚠️ Found orphaned BullMQ job, removing'
          );

          await bullMQJob.remove();
          orphanedCount++;
        }
      }

      this.fastify.log.info(
        { orphanedCount },
        `✅ Cleaned up \${orphanedCount} orphaned BullMQ jobs`
      );
    } catch (error) {
      this.fastify.log.error({ error }, '❌ Failed to clean up orphaned jobs');
      // Don't throw - this is a cleanup operation, not critical
    }
  }

  /**
   * Start periodic stale job checker (runs every 10 minutes)
   */
  startPeriodicStaleJobChecker(): NodeJS.Timeout {
    const interval = setInterval(
      async () => {
        try {
          await this.resetStaleJobs();
        } catch (error) {
          this.fastify.log.error({ error }, 'Periodic stale job check failed');
        }
      },
      10 * 60 * 1000
    ); // Every 10 minutes

    this.fastify.log.info('✅ Periodic stale job checker started (10 minute interval)');

    return interval;
  }

  /**
   * Map priority enum to number for BullMQ
   */
  private mapPriorityToNumber(priority: any): number {
    const priorityMap: Record<string, number> = {
      IMMEDIATE: 1,
      URGENT: 2,
      HIGH: 3,
      NORMAL: 5,
      LOW: 10,
    };

    return priorityMap[priority] || 5;
  }
}
