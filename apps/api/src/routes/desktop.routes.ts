/**
 * @fileoverview Desktop Application API Routes (REWRITTEN v2.0)
 * @description Production-grade API endpoints for desktop app queue processing with atomic claiming
 * @version 2.0.0 - ATOMIC OPERATIONS & RACE CONDITION PREVENTION
 * @author JobSwipe Team
 *
 * CRITICAL FEATURES:
 * ✅ Atomic job claiming (prevents double-processing)
 * ✅ Stale claim detection and recovery
 * ✅ Progress reporting
 * ✅ Desktop session management
 */

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const ClaimApplicationSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  desktopVersion: z.string().optional(),
});

const ProgressUpdateSchema = z.object({
  progress: z.number().min(0).max(100),
  currentStep: z.string(),
  message: z.string().optional(),
});

const CompleteApplicationSchema = z.object({
  success: z.boolean(),
  result: z.any().optional(),
  error: z.string().optional(),
});

// =============================================================================
// DESKTOP ROUTES
// =============================================================================

export default async function desktopRoutes(fastify: FastifyInstance) {
  // ===========================================================================
  // GET /desktop/applications/pending
  // Get jobs waiting for desktop processing
  // ===========================================================================
  fastify.get(
    '/desktop/applications/pending',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const userId = request.user!.id;

      const pendingJobs = await fastify.db.applicationQueue.findMany({
        where: {
          userId,
          executionMode: 'desktop',
          status: { in: ['QUEUED_FOR_DESKTOP', 'QUEUED'] },
          OR: [
            { claimedBy: null },
            {
              // Include stale claims (>10 minutes old)
              claimedBy: 'DESKTOP',
              claimedAt: { lt: new Date(Date.now() - 10 * 60 * 1000) },
            },
          ],
        },
        orderBy: [{ priority: 'desc' }, { scheduledAt: 'asc' }],
        include: {
          jobPosting: {
            include: {
              company: true,
            },
          },
        },
      });

      return reply.send({
        success: true,
        jobs: pendingJobs,
        count: pendingJobs.length,
      });
    }
  );

  // ===========================================================================
  // POST /desktop/applications/:id/claim
  // Atomically claim a job for desktop processing
  // ===========================================================================
  fastify.post<{
    Params: { id: string };
    Body: z.infer<typeof ClaimApplicationSchema>;
  }>(
    '/desktop/applications/:id/claim',
    {
      schema: {
        params: z.object({ id: z.string() }),
        body: ClaimApplicationSchema,
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { id: applicationId } = request.params;
      const { deviceId, desktopVersion } = request.body;
      const userId = request.user!.id;

      // ==================================================================
      // ATOMIC CLAIM with optimistic locking
      // Uses Prisma updateMany with conditions to prevent race conditions
      // ==================================================================
      const claimResult = await fastify.db.applicationQueue.updateMany({
        where: {
          id: applicationId,
          userId: userId, // Security: Can only claim own jobs
          status: { in: ['QUEUED_FOR_DESKTOP', 'QUEUED'] },
          executionMode: 'desktop',
          OR: [
            { claimedBy: null }, // Not claimed yet
            {
              // Or claim is stale (desktop crashed >10 min ago)
              claimedBy: 'DESKTOP',
              claimedAt: { lt: new Date(Date.now() - 10 * 60 * 1000) },
            },
          ],
        },
        data: {
          status: 'PROCESSING',
          claimedBy: 'DESKTOP',
          claimedAt: new Date(),
          desktopSessionId: deviceId,
          startedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      if (claimResult.count === 0) {
        return reply.code(409).send({
          success: false,
          error: 'Job already claimed or not available',
          errorCode: 'JOB_UNAVAILABLE',
        });
      }

      fastify.log.info(
        { applicationId, userId, deviceId },
        '✅ Desktop application claimed successfully'
      );

      // Fetch full job details to return
      const application = await fastify.db.applicationQueue.findUnique({
        where: { id: applicationId },
        include: {
          jobPosting: {
            include: { company: true },
          },
        },
      });

      // Remove from BullMQ queue (desktop will handle it)
      try {
        const job = await fastify.jobQueue?.getJob(applicationId);
        if (job) {
          await job.remove();
          fastify.log.info({ applicationId }, 'Removed job from BullMQ queue (desktop claimed)');
        }
      } catch (error) {
        fastify.log.warn(
          { applicationId, error },
          'Failed to remove job from BullMQ (non-critical)'
        );
      }

      return reply.send({
        success: true,
        application,
      });
    }
  );

  // ===========================================================================
  // PATCH /desktop/applications/:id/progress
  // Report progress during desktop processing
  // ===========================================================================
  fastify.patch<{
    Params: { id: string };
    Body: z.infer<typeof ProgressUpdateSchema>;
  }>(
    '/desktop/applications/:id/progress',
    {
      schema: {
        params: z.object({ id: z.string() }),
        body: ProgressUpdateSchema,
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { id: applicationId } = request.params;
      const { progress, currentStep, message } = request.body;
      const userId = request.user!.id;

      // Verify ownership and desktop claim
      const application = await fastify.db.applicationQueue.findFirst({
        where: {
          id: applicationId,
          userId,
          claimedBy: 'DESKTOP',
        },
      });

      if (!application) {
        return reply.code(403).send({
          success: false,
          error: 'Not authorized or job not claimed by desktop',
          errorCode: 'FORBIDDEN',
        });
      }

      // Update claim timestamp (heartbeat)
      await fastify.db.applicationQueue.update({
        where: { id: applicationId },
        data: {
          claimedAt: new Date(), // Refresh claim timestamp
          updatedAt: new Date(),
        },
      });

      // Emit progress via WebSocket
      if (fastify.websocket) {
        fastify.websocket.emitToApplication(applicationId, 'application-progress', {
          type: 'automation-progress',
          event: 'application-progress',
          applicationId,
          progress,
          currentStep,
          message,
          messageId: randomUUID(),
          timestamp: new Date(),
        });
      }

      return reply.send({ success: true });
    }
  );

  // ===========================================================================
  // POST /desktop/applications/:id/complete
  // Mark job as complete (success or failure)
  // ===========================================================================
  fastify.post<{
    Params: { id: string };
    Body: z.infer<typeof CompleteApplicationSchema>;
  }>(
    '/desktop/applications/:id/complete',
    {
      schema: {
        params: z.object({ id: z.string() }),
        body: CompleteApplicationSchema,
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { id: applicationId } = request.params;
      const { success, result, error } = request.body;
      const userId = request.user!.id;

      // Atomic update - only complete if still claimed by this desktop
      const updated = await fastify.db.applicationQueue.updateMany({
        where: {
          id: applicationId,
          userId,
          claimedBy: 'DESKTOP',
          status: 'PROCESSING',
        },
        data: {
          status: success ? 'COMPLETED' : 'FAILED',
          success: success,
          completedAt: new Date(),
          responseData: result,
          errorMessage: error,
          errorType: error ? 'DESKTOP_AUTOMATION_ERROR' : null,
          updatedAt: new Date(),
        },
      });

      if (updated.count === 0) {
        return reply.code(409).send({
          success: false,
          error: 'Job not found or already completed',
          errorCode: 'JOB_NOT_FOUND',
        });
      }

      fastify.log.info(
        { applicationId, userId, success },
        `✅ Desktop application completed: \${success ? 'SUCCESS' : 'FAILED'}`
      );

      // Remove from BullMQ queue if still there
      try {
        const job = await fastify.jobQueue?.getJob(applicationId);
        if (job) {
          await job.remove();
        }
      } catch (err) {
        fastify.log.warn({ applicationId, error: err }, 'Failed to remove job from BullMQ');
      }

      // Emit completion event
      fastify.automationService.emit(
        success ? 'application-completed' : 'application-failed',
        { applicationId, userId, result, error }
      );

      // Notify via WebSocket
      if (fastify.websocket) {
        fastify.websocket.emitToApplication(applicationId, 'application-status-update', {
          applicationId,
          jobId: '',
          userId,
          status: success ? 'completed' : 'failed',
          executionMode: 'desktop',
          result,
          error,
          timestamp: new Date(),
        });
      }

      return reply.send({ success: true });
    }
  );

  // ===========================================================================
  // POST /desktop/applications/:id/heartbeat
  // Keep desktop claim alive (prevent stale claim detection)
  // ===========================================================================
  fastify.post<{
    Params: { id: string };
  }>(
    '/desktop/applications/:id/heartbeat',
    {
      schema: {
        params: z.object({ id: z.string() }),
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { id: applicationId } = request.params;
      const userId = request.user!.id;

      const updated = await fastify.db.applicationQueue.updateMany({
        where: {
          id: applicationId,
          userId,
          claimedBy: 'DESKTOP',
          status: 'PROCESSING',
        },
        data: {
          claimedAt: new Date(), // Refresh claim timestamp
        },
      });

      if (updated.count === 0) {
        return reply.code(404).send({
          success: false,
          error: 'Job not found or not claimed',
        });
      }

      return reply.send({ success: true });
    }
  );

  // ===========================================================================
  // DELETE /desktop/applications/:id/claim
  // Release a claimed job (desktop app closing, error, etc.)
  // ===========================================================================
  fastify.delete<{
    Params: { id: string };
  }>(
    '/desktop/applications/:id/claim',
    {
      schema: {
        params: z.object({ id: z.string() }),
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { id: applicationId } = request.params;
      const userId = request.user!.id;

      const released = await fastify.db.applicationQueue.updateMany({
        where: {
          id: applicationId,
          userId,
          claimedBy: 'DESKTOP',
        },
        data: {
          status: 'QUEUED_FOR_DESKTOP',
          claimedBy: null,
          claimedAt: null,
          desktopSessionId: null,
          updatedAt: new Date(),
        },
      });

      if (released.count === 0) {
        return reply.code(404).send({
          success: false,
          error: 'Job not found or not claimed by you',
        });
      }

      fastify.log.info({ applicationId, userId }, '✅ Desktop claim released');

      return reply.send({ success: true });
    }
  );

  fastify.log.info('✅ Desktop routes registered');
}
