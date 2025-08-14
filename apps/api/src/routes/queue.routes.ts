/**
 * @fileoverview Queue Management API Routes for JobSwipe
 * @description Enterprise-grade job application queue endpoints with authentication
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const SwipeRightRequestSchema = z.object({
  jobId: z.string().uuid('Invalid job ID format'),
  resumeId: z.string().uuid('Invalid resume ID format').optional(),
  coverLetter: z.string().max(2000, 'Cover letter too long').optional(),
  priority: z.number().int().min(1).max(10).default(5),
  customFields: z.record(z.string()).optional(),
  metadata: z.object({
    source: z.enum(['web', 'mobile', 'desktop']),
    deviceId: z.string().optional(),
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
  }),
});

const GetApplicationsRequestSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
  status: z.enum(['pending', 'queued', 'processing', 'completed', 'failed', 'cancelled']).optional(),
});

const ApplicationActionRequestSchema = z.object({
  action: z.enum(['cancel', 'retry', 'prioritize']),
  reason: z.string().max(500).optional(),
});

// =============================================================================
// TYPES
// =============================================================================

interface SwipeRightRequest {
  jobId: string;
  resumeId?: string;
  coverLetter?: string;
  priority?: number;
  customFields?: Record<string, string>;
  metadata: {
    source: 'web' | 'mobile' | 'desktop';
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
  };
}

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    status: string;
  };
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

/**
 * Create job snapshot from job posting
 */
async function createJobSnapshot(fastify: FastifyInstance, jobPosting: any, applicationQueueId: string) {
  try {
    const snapshot = await fastify.db.jobSnapshot.create({
      data: {
        applicationQueueId,
        originalJobId: jobPosting.id,
        
        // Job data snapshot
        title: jobPosting.title,
        description: jobPosting.description,
        requirements: jobPosting.requirements,
        benefits: jobPosting.benefits,
        
        // Classification
        type: jobPosting.type.toString(),
        level: jobPosting.level.toString(),
        department: jobPosting.department,
        category: jobPosting.category.toString(),
        
        // Work arrangement
        remote: jobPosting.remote,
        remoteType: jobPosting.remoteType.toString(),
        location: jobPosting.location,
        timeZone: jobPosting.timeZone,
        
        // Location details
        city: jobPosting.city,
        state: jobPosting.state,
        country: jobPosting.country,
        coordinates: jobPosting.coordinates,
        
        // Compensation
        salaryMin: jobPosting.salaryMin,
        salaryMax: jobPosting.salaryMax,
        currency: jobPosting.currency,
        salaryType: jobPosting.salaryType?.toString(),
        equity: jobPosting.equity,
        bonus: jobPosting.bonus,
        
        // Requirements
        experienceYears: jobPosting.experienceYears,
        skills: jobPosting.skills,
        education: jobPosting.education,
        languages: jobPosting.languages,
        
        // Company data snapshot
        companyName: jobPosting.company.name,
        companyLogo: jobPosting.company.logo,
        companyWebsite: jobPosting.company.website,
        companyIndustry: jobPosting.company.industry,
        companySize: jobPosting.company.size?.toString(),
        companyDescription: jobPosting.company.description,
        
        // External integration
        externalId: jobPosting.externalId,
        source: jobPosting.source.toString(),
        sourceUrl: jobPosting.sourceUrl,
        applyUrl: jobPosting.applyUrl,
        
        // Metadata
        qualityScore: jobPosting.qualityScore,
        isVerified: jobPosting.isVerified,
        
        // Original status
        originalStatus: jobPosting.status.toString(),
        isActive: jobPosting.isActive,
        isFeatured: jobPosting.isFeatured,
        isUrgent: jobPosting.isUrgent,
        
        // Original dates
        originalPostedAt: jobPosting.postedAt,
        originalExpiresAt: jobPosting.expiresAt,
        
        // Analytics snapshot
        viewCount: jobPosting.viewCount,
        applicationCount: jobPosting.applicationCount,
        rightSwipeCount: jobPosting.rightSwipeCount,
        leftSwipeCount: jobPosting.leftSwipeCount,
      },
    });
    
    return snapshot;
  } catch (error) {
    fastify.log.error('Failed to create job snapshot:', error);
    throw new Error('Failed to create job snapshot');
  }
}

// =============================================================================
// AUTHENTICATION MIDDLEWARE
// =============================================================================

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
      
      request.user = {
        id: verification.payload.sub || verification.payload.userId,
        email: verification.payload.email,
        role: verification.payload.role || 'user',
        status: verification.payload.status || 'active',
      };
    } else {
      // Fallback basic token validation
      if (!token || token.length < 20) {
        return reply.code(401).send({
          success: false,
          error: 'Invalid token format',
          errorCode: 'INVALID_TOKEN',
        });
      }
      
      // Mock user for basic mode
      request.user = {
        id: 'basic-user-id',
        email: 'user@example.com',
        role: 'user',
        status: 'active',
      };
    }
  } catch (error) {
    request.server.log.error('Authentication error:', error);
    return reply.code(401).send({
      success: false,
      error: 'Authentication failed',
      errorCode: 'AUTH_ERROR',
    });
  }
}

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * POST /api/v1/queue/swipe-right
 * Queue a job application when user swipes right
 */
async function swipeRightHandler(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    const data = SwipeRightRequestSchema.parse(request.body);
    const user = getAuthenticatedUser(request);
    
    // Check if user has already swiped right on this job
    const existingSwipe = await request.server.db.userJobSwipe.findUnique({
      where: {
        userId_jobPostingId: {
          userId: user.id,
          jobPostingId: data.jobId,
        },
      },
    });
    
    if (existingSwipe && existingSwipe.direction === 'RIGHT') {
      return reply.code(409).send({
        success: false,
        error: 'Already applied to this job',
        errorCode: 'DUPLICATE_APPLICATION',
      });
    }
    
    // Get job posting with company data
    const jobPosting = await request.server.db.jobPosting.findUnique({
      where: { id: data.jobId },
      include: { company: true },
    });
    
    if (!jobPosting) {
      return reply.code(404).send({
        success: false,
        error: 'Job not found',
        errorCode: 'JOB_NOT_FOUND',
      });
    }
    
    if (!jobPosting.isActive) {
      return reply.code(410).send({
        success: false,
        error: 'Job is no longer active',
        errorCode: 'JOB_INACTIVE',
      });
    }
    
    // Get user's profile data
    const userProfile = await request.server.db.userProfile.findUnique({
      where: { userId: user.id },
    });
    
    // Start database transaction
    const result = await request.server.db.$transaction(async (tx) => {
      // Create or update swipe record
      await tx.userJobSwipe.upsert({
        where: {
          userId_jobPostingId: {
            userId: user.id,
            jobPostingId: data.jobId,
          },
        },
        update: {
          direction: 'RIGHT',
          deviceType: data.metadata.source,
          updatedAt: new Date(),
        },
        create: {
          userId: user.id,
          jobPostingId: data.jobId,
          direction: 'RIGHT',
          deviceType: data.metadata.source,
          sessionId: data.metadata.deviceId,
          ipAddress: data.metadata.ipAddress,
          userAgent: data.metadata.userAgent,
        },
      });
      
      // Create application queue entry
      const queueEntry = await tx.applicationQueue.create({
        data: {
          userId: user.id,
          jobPostingId: data.jobId,
          status: 'PENDING',
          priority: data.priority === 10 ? 'IMMEDIATE' : 
                   data.priority >= 8 ? 'URGENT' :
                   data.priority >= 6 ? 'HIGH' : 'NORMAL',
          useCustomResume: !!data.resumeId,
          resumeId: data.resumeId,
          coverLetter: data.coverLetter,
          customFields: data.customFields || {},
          automationConfig: {
            source: data.metadata.source,
            deviceId: data.metadata.deviceId,
            timestamp: new Date().toISOString(),
          },
        },
      });
      
      // Create job snapshot
      const snapshot = await createJobSnapshot(request.server, jobPosting, queueEntry.id);
      
      // Add to queue service
      if (request.server.queueService) {
        const jobData = {
          jobId: data.jobId,
          userId: user.id,
          jobData: {
            title: jobPosting.title,
            company: jobPosting.company.name,
            url: jobPosting.applyUrl || jobPosting.sourceUrl || '',
            description: jobPosting.description,
            requirements: jobPosting.requirements,
            salary: {
              min: jobPosting.salaryMin,
              max: jobPosting.salaryMax,
              currency: jobPosting.currency,
            },
            location: jobPosting.location || `${jobPosting.city}, ${jobPosting.state}`,
            remote: jobPosting.remote,
            type: jobPosting.type,
            level: jobPosting.level,
          },
          userProfile: {
            resumeUrl: userProfile?.resumeUrl,
            coverLetter: data.coverLetter,
            preferences: userProfile?.preferences || {},
          },
          priority: data.priority || 5,
          metadata: {
            source: data.metadata.source,
            deviceId: data.metadata.deviceId,
            timestamp: new Date().toISOString(),
          },
        };
        
        const isPriority = data.priority >= 8;
        await request.server.queueService.addJobApplication(jobData, isPriority);
      }
      
      return {
        applicationId: queueEntry.id,
        snapshotId: snapshot.id,
        status: queueEntry.status,
        priority: queueEntry.priority,
      };
    });
    
    return reply.code(201).send({
      success: true,
      data: result,
      message: 'Job application queued successfully',
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        success: false,
        error: 'Validation failed',
        details: error.errors,
        errorCode: 'VALIDATION_ERROR',
      });
    }
    
    request.server.log.error('Swipe right error:', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });
  }
}

/**
 * GET /api/v1/queue/applications
 * Get user's job applications from queue
 */
async function getApplicationsHandler(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    const query = GetApplicationsRequestSchema.parse(request.query);
    const user = getAuthenticatedUser(request);
    
    const applications = await request.server.db.applicationQueue.findMany({
      where: {
        userId: user.id,
        ...(query.status && { status: query.status.toUpperCase() }),
      },
      include: {
        jobPosting: {
          include: { company: true },
        },
        jobSnapshot: true,
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit,
      skip: query.offset,
    });
    
    const total = await request.server.db.applicationQueue.count({
      where: {
        userId: user.id,
        ...(query.status && { status: query.status.toUpperCase() }),
      },
    });
    
    const formattedApplications = applications.map(app => ({
      id: app.id,
      jobId: app.jobPostingId,
      status: app.status.toLowerCase(),
      priority: app.priority.toLowerCase(),
      attempts: app.attempts,
      maxAttempts: app.maxAttempts,
      scheduledAt: app.scheduledAt,
      startedAt: app.startedAt,
      completedAt: app.completedAt,
      success: app.success,
      errorMessage: app.errorMessage,
      job: {
        title: app.jobSnapshot?.title || app.jobPosting.title,
        company: app.jobSnapshot?.companyName || app.jobPosting.company.name,
        location: app.jobSnapshot?.location || app.jobPosting.location,
        logo: app.jobSnapshot?.companyLogo || app.jobPosting.company.logo,
        salary: {
          min: app.jobSnapshot?.salaryMin || app.jobPosting.salaryMin,
          max: app.jobSnapshot?.salaryMax || app.jobPosting.salaryMax,
          currency: app.jobSnapshot?.currency || app.jobPosting.currency,
        },
        remote: app.jobSnapshot?.remote ?? app.jobPosting.remote,
        type: app.jobSnapshot?.type || app.jobPosting.type,
      },
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    }));
    
    return reply.send({
      success: true,
      data: {
        applications: formattedApplications,
        pagination: {
          total,
          limit: query.limit,
          offset: query.offset,
          hasMore: query.offset + query.limit < total,
        },
      },
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        success: false,
        error: 'Validation failed',
        details: error.errors,
        errorCode: 'VALIDATION_ERROR',
      });
    }
    
    request.server.log.error('Get applications error:', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });
  }
}

/**
 * GET /api/v1/queue/applications/:id
 * Get specific application details
 */
async function getApplicationHandler(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const user = getAuthenticatedUser(request);
    
    const application = await request.server.db.applicationQueue.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        jobPosting: {
          include: { company: true },
        },
        jobSnapshot: true,
        automationLogs: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });
    
    if (!application) {
      return reply.code(404).send({
        success: false,
        error: 'Application not found',
        errorCode: 'APPLICATION_NOT_FOUND',
      });
    }
    
    // Get queue status if available
    let queueStatus = null;
    if (request.server.queueService) {
      queueStatus = await request.server.queueService.getJobStatus(id);
    }
    
    const formattedApplication = {
      id: application.id,
      jobId: application.jobPostingId,
      status: application.status.toLowerCase(),
      priority: application.priority.toLowerCase(),
      attempts: application.attempts,
      maxAttempts: application.maxAttempts,
      scheduledAt: application.scheduledAt,
      startedAt: application.startedAt,
      completedAt: application.completedAt,
      success: application.success,
      errorMessage: application.errorMessage,
      errorType: application.errorType,
      responseData: application.responseData,
      queueStatus,
      job: {
        title: application.jobSnapshot?.title || application.jobPosting.title,
        company: application.jobSnapshot?.companyName || application.jobPosting.company.name,
        description: application.jobSnapshot?.description || application.jobPosting.description,
        requirements: application.jobSnapshot?.requirements || application.jobPosting.requirements,
        location: application.jobSnapshot?.location || application.jobPosting.location,
        applyUrl: application.jobSnapshot?.applyUrl || application.jobPosting.applyUrl,
        sourceUrl: application.jobSnapshot?.sourceUrl || application.jobPosting.sourceUrl,
      },
      logs: application.automationLogs.map(log => ({
        id: log.id,
        level: log.level.toLowerCase(),
        message: log.message,
        step: log.step,
        action: log.action,
        executionTime: log.executionTime,
        createdAt: log.createdAt,
      })),
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
    
    return reply.send({
      success: true,
      data: formattedApplication,
    });
    
  } catch (error) {
    request.server.log.error('Get application error:', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });
  }
}

/**
 * POST /api/v1/queue/applications/:id/action
 * Perform action on application (cancel, retry, prioritize)
 */
async function applicationActionHandler(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const data = ApplicationActionRequestSchema.parse(request.body);
    const user = getAuthenticatedUser(request);
    
    const application = await request.server.db.applicationQueue.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });
    
    if (!application) {
      return reply.code(404).send({
        success: false,
        error: 'Application not found',
        errorCode: 'APPLICATION_NOT_FOUND',
      });
    }
    
    let updateData: any = {};
    let queueAction: Promise<any> | null = null;
    
    switch (data.action) {
      case 'cancel':
        updateData = { status: 'CANCELLED' };
        if (request.server.queueService) {
          queueAction = request.server.queueService.cancelJobApplication(id);
        }
        break;
        
      case 'retry':
        if (application.attempts >= application.maxAttempts) {
          return reply.code(400).send({
            success: false,
            error: 'Maximum retry attempts reached',
            errorCode: 'MAX_ATTEMPTS_REACHED',
          });
        }
        updateData = {
          status: 'PENDING',
          nextRetryAt: new Date(Date.now() + 30000), // Retry in 30 seconds
          errorMessage: null,
          errorType: null,
        };
        break;
        
      case 'prioritize':
        updateData = { priority: 'HIGH' };
        break;
        
      default:
        return reply.code(400).send({
          success: false,
          error: 'Invalid action',
          errorCode: 'INVALID_ACTION',
        });
    }
    
    // Update database
    const updatedApplication = await request.server.db.applicationQueue.update({
      where: { id },
      data: updateData,
    });
    
    // Execute queue action if needed
    if (queueAction) {
      await queueAction;
    }
    
    return reply.send({
      success: true,
      data: {
        id: updatedApplication.id,
        status: updatedApplication.status.toLowerCase(),
        priority: updatedApplication.priority.toLowerCase(),
        message: `Application ${data.action} successful`,
      },
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        success: false,
        error: 'Validation failed',
        details: error.errors,
        errorCode: 'VALIDATION_ERROR',
      });
    }
    
    request.server.log.error('Application action error:', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });
  }
}

/**
 * GET /api/v1/queue/stats
 * Get queue statistics for user
 */
async function getQueueStatsHandler(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    const user = getAuthenticatedUser(request);
    
    // Get database stats
    const [totalApplications, statusCounts, recentApplications] = await Promise.all([
      request.server.db.applicationQueue.count({
        where: { userId: user.id },
      }),
      request.server.db.applicationQueue.groupBy({
        by: ['status'],
        where: { userId: user.id },
        _count: { status: true },
      }),
      request.server.db.applicationQueue.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          jobSnapshot: { select: { title: true, companyName: true } },
        },
      }),
    ]);
    
    // Format status counts
    const statusStats = statusCounts.reduce((acc, item) => {
      acc[item.status.toLowerCase()] = item._count.status;
      return acc;
    }, {} as Record<string, number>);
    
    // Get queue service stats if available
    let queueServiceStats = null;
    if (request.server.queueService) {
      try {
        queueServiceStats = await request.server.queueService.getQueueStats();
      } catch (error) {
        request.server.log.warn('Failed to get queue service stats:', error);
      }
    }
    
    const stats = {
      user: {
        totalApplications,
        statusBreakdown: {
          pending: statusStats.pending || 0,
          queued: statusStats.queued || 0,
          processing: statusStats.processing || 0,
          completed: statusStats.completed || 0,
          failed: statusStats.failed || 0,
          cancelled: statusStats.cancelled || 0,
        },
        recentApplications: recentApplications.map(app => ({
          id: app.id,
          title: app.jobSnapshot?.title || 'Unknown Job',
          company: app.jobSnapshot?.companyName || 'Unknown Company',
          status: app.status.toLowerCase(),
          createdAt: app.createdAt,
        })),
      },
      queue: queueServiceStats,
    };
    
    return reply.send({
      success: true,
      data: stats,
    });
    
  } catch (error) {
    request.server.log.error('Get queue stats error:', error);
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

export async function registerQueueRoutes(fastify: FastifyInstance) {
  // Add authentication hook for all queue routes
  fastify.addHook('preHandler', authenticateUser);
  
  // Queue job application
  fastify.post('/swipe-right', {
    schema: {
      summary: 'Queue job application when user swipes right',
      description: 'Creates a job application queue entry when user swipes right on a job',
      tags: ['Queue'],
      body: {
        type: 'object',
        properties: {
          jobId: { type: 'string', format: 'uuid' },
          resumeId: { type: 'string', format: 'uuid' },
          coverLetter: { type: 'string', maxLength: 2000 },
          priority: { type: 'integer', minimum: 1, maximum: 10, default: 5 },
          customFields: { type: 'object', additionalProperties: { type: 'string' } },
          metadata: {
            type: 'object',
            properties: {
              source: { type: 'string', enum: ['web', 'mobile', 'desktop'] },
              deviceId: { type: 'string' },
              userAgent: { type: 'string' },
              ipAddress: { type: 'string' }
            },
            required: ['source']
          }
        },
        required: ['jobId', 'metadata']
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' },
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
      },
    },
  }, swipeRightHandler);
  
  // Get user applications
  fastify.get('/applications', {
    schema: {
      summary: 'Get user job applications from queue',
      description: 'Retrieves paginated list of user job applications',
      tags: ['Queue'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          offset: { type: 'integer', minimum: 0, default: 0 },
          status: { 
            type: 'string', 
            enum: ['pending', 'queued', 'processing', 'completed', 'failed', 'cancelled'] 
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
      },
    },
  }, getApplicationsHandler);
  
  // Get specific application
  fastify.get('/applications/:id', {
    schema: {
      summary: 'Get specific job application details',
      description: 'Retrieves detailed information about a specific job application',
      tags: ['Queue'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
    },
  }, getApplicationHandler);
  
  // Application actions
  fastify.post('/applications/:id/action', {
    schema: {
      summary: 'Perform action on job application',
      description: 'Cancel, retry, or prioritize a job application',
      tags: ['Queue'],
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
          action: { 
            type: 'string', 
            enum: ['cancel', 'retry', 'prioritize'] 
          },
          reason: { 
            type: 'string', 
            maxLength: 500 
          }
        },
        required: ['action']
      },
    },
  }, applicationActionHandler);
  
  // Queue statistics
  fastify.get('/stats', {
    schema: {
      summary: 'Get queue statistics for user',
      description: 'Retrieves queue statistics and recent application activity',
      tags: ['Queue'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
      },
    },
  }, getQueueStatsHandler);
}

export default registerQueueRoutes;