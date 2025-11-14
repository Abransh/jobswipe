/**
 * @fileoverview Desktop Application API Routes for JobSwipe
 * @description API endpoints for desktop app queue processing and job claiming
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { QueueStatus } from '@jobswipe/database';
import { AuthenticatedUser } from '@jobswipe/shared';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const ClaimApplicationSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  timestamp: z.string().datetime('Invalid timestamp format'),
});

const ProgressUpdateSchema = z.object({
  progress: z.number().min(0).max(100, 'Progress must be between 0 and 100'),
  status: z.string().min(1, 'Status is required'),
  message: z.string().optional(),
  timestamp: z.string().datetime('Invalid timestamp format'),
});

const CompleteApplicationSchema = z.object({
  success: z.boolean(),
  result: z.any().optional(),
  error: z.string().optional(),
  completedAt: z.string().datetime('Invalid timestamp format'),
  deviceId: z.string().min(1, 'Device ID is required'),
});

// =============================================================================
// TYPES
// =============================================================================

/**
 * Authenticated request type using the shared AuthenticatedUser interface
 * This matches the user type defined in auth.middleware.ts
 */
interface AuthenticatedRequest extends FastifyRequest {
  user?: AuthenticatedUser;
}

interface ClaimApplicationRequest {
  deviceId: string;
  timestamp: string;
}

interface ProgressUpdateRequest {
  progress: number;
  status: string;
  message?: string;
  timestamp: string;
}

interface CompleteApplicationRequest {
  success: boolean;
  result?: any;
  error?: string;
  completedAt: string;
  deviceId: string;
}

// =============================================================================
// AUTHENTICATION MIDDLEWARE
// =============================================================================

/**
 * Authenticate user via JWT token
 */
async function authenticateUser(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        success: false,
        error: 'Missing or invalid authorization header',
        errorCode: 'UNAUTHORIZED',
      });
    }

    const token = authHeader.substring(7);

    // Use JWT service if available
    if (request.server.jwtService) {
      const verification = await request.server.jwtService.verifyToken(token);
      if (!verification.valid || !verification.payload) {
        return reply.code(401).send({
          success: false,
          error: 'Invalid or expired token',
          errorCode: 'INVALID_TOKEN',
        });
      }

      // Create AuthenticatedUser from JwtPayload
      request.user = {
        id: verification.payload.sub,
        email: verification.payload.email,
        name: verification.payload.name,
        role: verification.payload.role,
        status: 'active', // Status not in JWT payload, default to active
        profile: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } else {
      // Fallback to basic JWT verification
      const jwt = require('jsonwebtoken');
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

      try {
        const decoded = jwt.verify(token, jwtSecret) as any;
        request.user = {
          id: decoded.sub || decoded.userId,
          email: decoded.email,
          role: decoded.role || 'user',
          status: decoded.status || 'active',
        };
      } catch (jwtError) {
        return reply.code(401).send({
          success: false,
          error: 'Invalid or expired token',
          errorCode: 'INVALID_TOKEN',
        });
      }
    }
  } catch (error) {
    request.server.log.error('Authentication error:', error);
    return reply.code(500).send({
      success: false,
      error: 'Authentication service error',
      errorCode: 'AUTH_ERROR',
    });
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Extract user from authenticated request
 */
function getAuthenticatedUser(request: AuthenticatedRequest) {
  if (!request.user?.id) {
    throw new Error('User not authenticated');
  }
  return request.user;
}

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * POST /desktop/applications/:id/claim
 * Claim an application for processing by the desktop client
 */
async function claimApplicationHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: ClaimApplicationRequest }>,
  reply: FastifyReply
) {
  try {
    const { id: applicationId } = request.params;
    const user = getAuthenticatedUser(request as AuthenticatedRequest);

    // Validate request body
    const validationResult = ClaimApplicationSchema.safeParse(request.body);
    if (!validationResult.success) {
      return reply.code(400).send({
        success: false,
        error: 'Invalid request data',
        errorCode: 'VALIDATION_ERROR',
        details: validationResult.error.errors,
      });
    }

    const { deviceId } = validationResult.data;

    request.server.log.info(`Desktop claiming application: ${applicationId} for user: ${user.id} on device: ${deviceId}`);

    // Check if application exists and belongs to user
    const application = await request.server.db.applicationQueue.findFirst({
      where: {
        id: applicationId,
        userId: user.id,
      },
    });

    if (!application) {
      return reply.code(404).send({
        success: false,
        error: 'Application not found or access denied',
        errorCode: 'NOT_FOUND',
      });
    }

    // Check if application is already claimed
    if (application.claimedBy && application.claimedAt) {
      const claimAge = Date.now() - new Date(application.claimedAt).getTime();
      const claimTimeoutMs = 10 * 60 * 1000; // 10 minutes

      // If claimed less than 10 minutes ago, reject
      if (claimAge < claimTimeoutMs) {
        return reply.code(409).send({
          success: false,
          error: 'Application already claimed by another process',
          errorCode: 'ALREADY_CLAIMED',
          data: {
            claimedBy: application.claimedBy,
            claimedAt: application.claimedAt,
            claimAgeMs: claimAge,
          },
        });
      }
    }

    // Check if application is in a claimable state
    if (![QueueStatus.PENDING, QueueStatus.QUEUED].includes(application.status)) {
      return reply.code(400).send({
        success: false,
        error: `Application cannot be claimed in current status: ${application.status}`,
        errorCode: 'INVALID_STATUS',
        data: {
          currentStatus: application.status,
          allowedStatuses: [QueueStatus.PENDING, QueueStatus.QUEUED],
        },
      });
    }

    // Claim the application with atomic update
    const updatedApplication = await request.server.db.applicationQueue.update({
      where: {
        id: applicationId,
      },
      data: {
        claimedBy: 'DESKTOP',
        claimedAt: new Date(),
        desktopSessionId: deviceId,
        status: QueueStatus.PROCESSING,
        startedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    request.server.log.info(`Successfully claimed application: ${applicationId}`);

    return reply.code(200).send({
      success: true,
      message: 'Application claimed successfully',
      data: {
        applicationId: updatedApplication.id,
        status: updatedApplication.status,
        claimedAt: updatedApplication.claimedAt,
        desktopSessionId: updatedApplication.desktopSessionId,
      },
    });

  } catch (error) {
    request.server.log.error('Claim application error:', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });
  }
}

/**
 * PATCH /desktop/applications/:id/progress
 * Update progress for an application being processed
 */
async function updateProgressHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: ProgressUpdateRequest }>,
  reply: FastifyReply
) {
  try {
    const { id: applicationId } = request.params;
    const user = getAuthenticatedUser(request as AuthenticatedRequest);

    // Validate request body
    const validationResult = ProgressUpdateSchema.safeParse(request.body);
    if (!validationResult.success) {
      return reply.code(400).send({
        success: false,
        error: 'Invalid request data',
        errorCode: 'VALIDATION_ERROR',
        details: validationResult.error.errors,
      });
    }

    const { progress, status, message } = validationResult.data;

    request.server.log.info(`Updating progress for application: ${applicationId} to ${progress}%`);

    // Check if application exists and is claimed by this user
    const application = await request.server.db.applicationQueue.findFirst({
      where: {
        id: applicationId,
        userId: user.id,
      },
    });

    if (!application) {
      return reply.code(404).send({
        success: false,
        error: 'Application not found or access denied',
        errorCode: 'NOT_FOUND',
      });
    }

    // Verify application is claimed by desktop
    if (application.claimedBy !== 'DESKTOP') {
      return reply.code(403).send({
        success: false,
        error: 'Application not claimed by desktop client',
        errorCode: 'NOT_CLAIMED',
      });
    }

    // Update application progress
    // Store progress in automationConfig JSON field
    const currentConfig = (application.automationConfig as any) || {};
    const updatedConfig = {
      ...currentConfig,
      progress,
      status,
      lastProgressUpdate: new Date().toISOString(),
      progressMessage: message,
    };

    await request.server.db.applicationQueue.update({
      where: {
        id: applicationId,
      },
      data: {
        automationConfig: updatedConfig,
        updatedAt: new Date(),
      },
    });

    // Log progress to automation logs
    await request.server.db.automationLog.create({
      data: {
        queueId: applicationId,
        level: 'INFO',
        message: message || `Progress: ${progress}%`,
        details: {
          progress,
          status,
        },
        step: 'progress_update',
      },
    });

    request.server.log.info(`Progress updated for application: ${applicationId}`);

    return reply.code(200).send({
      success: true,
      message: 'Progress updated successfully',
      data: {
        applicationId,
        progress,
        status,
      },
    });

  } catch (error) {
    request.server.log.error('Update progress error:', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });
  }
}

/**
 * POST /desktop/applications/:id/complete
 * Mark an application as completed (success or failure)
 */
async function completeApplicationHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: CompleteApplicationRequest }>,
  reply: FastifyReply
) {
  try {
    const { id: applicationId } = request.params;
    const user = getAuthenticatedUser(request as AuthenticatedRequest);

    // Validate request body
    const validationResult = CompleteApplicationSchema.safeParse(request.body);
    if (!validationResult.success) {
      return reply.code(400).send({
        success: false,
        error: 'Invalid request data',
        errorCode: 'VALIDATION_ERROR',
        details: validationResult.error.errors,
      });
    }

    const { success, result, error: errorMessage, deviceId } = validationResult.data;

    request.server.log.info(`Completing application: ${applicationId}, success: ${success}`);

    // Check if application exists and is claimed by this user/device
    const application = await request.server.db.applicationQueue.findFirst({
      where: {
        id: applicationId,
        userId: user.id,
      },
    });

    if (!application) {
      return reply.code(404).send({
        success: false,
        error: 'Application not found or access denied',
        errorCode: 'NOT_FOUND',
      });
    }

    // Verify application is claimed by this desktop device
    if (application.claimedBy !== 'DESKTOP' || application.desktopSessionId !== deviceId) {
      return reply.code(403).send({
        success: false,
        error: 'Application not claimed by this desktop client',
        errorCode: 'NOT_CLAIMED',
        data: {
          claimedBy: application.claimedBy,
          expectedDevice: deviceId,
          actualDevice: application.desktopSessionId,
        },
      });
    }

    // Update application status
    const updatedApplication = await request.server.db.applicationQueue.update({
      where: {
        id: applicationId,
      },
      data: {
        status: success ? QueueStatus.COMPLETED : QueueStatus.FAILED,
        success,
        completedAt: success ? new Date() : undefined,
        failedAt: success ? undefined : new Date(),
        errorMessage: errorMessage || undefined,
        errorType: success ? undefined : 'AUTOMATION_ERROR',
        responseData: result || undefined,
        updatedAt: new Date(),
      },
    });

    // Log completion to automation logs
    await request.server.db.automationLog.create({
      data: {
        queueId: applicationId,
        level: success ? 'INFO' : 'ERROR',
        message: success
          ? 'Application completed successfully'
          : `Application failed: ${errorMessage || 'Unknown error'}`,
        details: {
          success,
          result,
          errorMessage,
        },
        step: 'completion',
        errorType: success ? undefined : 'AUTOMATION_ERROR',
      },
    });

    request.server.log.info(`Application ${applicationId} completed with status: ${updatedApplication.status}`);

    return reply.code(200).send({
      success: true,
      message: success ? 'Application completed successfully' : 'Application marked as failed',
      data: {
        applicationId: updatedApplication.id,
        status: updatedApplication.status,
        success: updatedApplication.success,
        completedAt: updatedApplication.completedAt,
        failedAt: updatedApplication.failedAt,
      },
    });

  } catch (error) {
    request.server.log.error('Complete application error:', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });
  }
}

// =============================================================================
// ROUTE REGISTRATION
// =============================================================================

/**
 * Register desktop application routes
 */
export async function registerDesktopRoutes(fastify: FastifyInstance) {
  // Add authentication hook for all desktop routes
  fastify.addHook('preHandler', authenticateUser);

  // POST /desktop/applications/:id/claim
  fastify.post('/applications/:id/claim', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          deviceId: { type: 'string', minLength: 1 },
          timestamp: { type: 'string', format: 'date-time' },
        },
        required: ['deviceId', 'timestamp'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            errorCode: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            errorCode: { type: 'string' },
          },
        },
        409: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            errorCode: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },
  }, claimApplicationHandler);

  // PATCH /desktop/applications/:id/progress
  fastify.patch('/applications/:id/progress', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          progress: { type: 'number', minimum: 0, maximum: 100 },
          status: { type: 'string', minLength: 1 },
          message: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
        },
        required: ['progress', 'status', 'timestamp'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            errorCode: { type: 'string' },
          },
        },
        403: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            errorCode: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            errorCode: { type: 'string' },
          },
        },
      },
    },
  }, updateProgressHandler);

  // POST /desktop/applications/:id/complete
  fastify.post('/applications/:id/complete', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          result: { type: 'object' },
          error: { type: 'string' },
          completedAt: { type: 'string', format: 'date-time' },
          deviceId: { type: 'string', minLength: 1 },
        },
        required: ['success', 'completedAt', 'deviceId'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            errorCode: { type: 'string' },
          },
        },
        403: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            errorCode: { type: 'string' },
            data: { type: 'object' },
          },
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            errorCode: { type: 'string' },
          },
        },
      },
    },
  }, completeApplicationHandler);

  fastify.log.info('Desktop application routes registered');
}

export default registerDesktopRoutes;
