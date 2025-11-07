/**
 * @fileoverview Enhanced Job Routes with Swiping and Automation Integration
 * @description Handles job-related API endpoints including browsing, swiping, and automation
 * @version 2.0.0
 * @author JobSwipe Team
 */

import { FastifyPluginAsync } from 'fastify';
import { JobService } from '../services/JobService';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const JobSwipeRequestSchema = z.object({
  direction: z.enum(['LEFT', 'RIGHT'], { required_error: 'Direction is required' }),
  resumeId: z.string().uuid('Invalid resume ID format').optional(),
  coverLetter: z.string().max(2000, 'Cover letter too long').optional(),
  priority: z.number().int().min(1).max(10).default(5),
  customFields: z.record(z.string()).optional(),
  metadata: z.object({
    source: z.enum(['web', 'mobile']).default('web'),
    deviceId: z.string().optional(),
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
    timestamp: z.string().datetime().optional(),
  }).default({ source: 'web' }),
});

// =============================================================================
// INTERFACES
// =============================================================================

interface AuthenticatedRequest {
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
function getAuthenticatedUser(request: any) {
  if (!request.user?.id) {
    throw new Error('User not authenticated');
  }
  return request.user;
}

/**
 * Calculate estimated processing time based on queue position
 */
function calculateEstimatedTime(position: number, isPriority: boolean): string {
  try {
    // Base processing time per application (in minutes)
    const baseTimePerApp = isPriority ? 3 : 5;

    // Calculate estimated minutes
    const estimatedMinutes = position * baseTimePerApp;

    if (estimatedMinutes < 1) return 'Starting soon';
    if (estimatedMinutes < 60) return `~${estimatedMinutes} minutes`;

    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = estimatedMinutes % 60;

    if (hours === 1) return minutes > 0 ? `~1 hour ${minutes} minutes` : '~1 hour';
    return minutes > 0 ? `~${hours} hours ${minutes} minutes` : `~${hours} hours`;

  } catch (error) {
    console.warn('Failed to calculate estimated time:', error);
    return 'Unknown';
  }
}

/**
 * Authentication middleware for protected routes
 */
async function authenticateUser(request: any, reply: any) {
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
      // Fallback basic token validation for development
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

/**
 * Detect company automation type based on URL patterns
 */
function detectCompanyAutomation(url: string): string {
  const urlLower = url.toLowerCase();

  // Common job site patterns
  const patterns = {
    'linkedin': ['linkedin.com/jobs', 'linkedin.com/in/'],
    'indeed': ['indeed.com'],
    'glassdoor': ['glassdoor.com'],
    'monster': ['monster.com'],
    'ziprecruiter': ['ziprecruiter.com'],
    'dice': ['dice.com'],
    'stackoverflow': ['stackoverflow.com/jobs'],
    'angellist': ['angel.co', 'wellfound.com'],
    'greenhouse': ['greenhouse.io'],
    'lever': ['lever.co'],
    'workday': ['myworkdayjobs.com', 'workday.com'],
    'bamboohr': ['bamboohr.com'],
    'jobvite': ['jobvite.com'],
    'smartrecruiters': ['smartrecruiters.com']
  };

  for (const [company, urls] of Object.entries(patterns)) {
    if (urls.some(pattern => urlLower.includes(pattern))) {
      return company;
    }
  }

  return 'generic';
}

const jobsRoutes: FastifyPluginAsync = async function (fastify) {
  const jobService = new JobService(fastify);

  // GET /v1/jobs - Fetch jobs with filtering and pagination
  fastify.get('/jobs', async (request, reply) => {
    try {
      const query = request.query as any;
      
      fastify.log.info(`📋 Fetching jobs with query: ${JSON.stringify(query)}`);

      // Parse query parameters
      const options = {
        page: parseInt(query.page) || 1,
        limit: parseInt(query.limit) || 20,
        sortBy: query.sortBy || 'relevance',
        q: query.q,
        userLocation: query.userLat && query.userLng ? {
          lat: parseFloat(query.userLat),
          lng: parseFloat(query.userLng)
        } : undefined,
        userId: request.headers['x-user-id'] as string, // Get from auth header
        filters: {
          location: query.location,
          remote: query.remote,
          jobType: query.jobType ? query.jobType.split(',') : [],
          jobLevel: query.jobLevel ? query.jobLevel.split(',') : [],
          salaryMin: query.salaryMin ? parseInt(query.salaryMin) : undefined,
          salaryMax: query.salaryMax ? parseInt(query.salaryMax) : undefined,
          skills: query.skills ? query.skills.split(',') : [],
          companySize: query.companySize ? query.companySize.split(',') : [],
          category: query.category ? query.category.split(',') : [],
          experience: query.experience ? parseInt(query.experience) : undefined
        }
      };

      // Fetch jobs from database
      const result = await jobService.searchJobs(options);

      reply.send({
        success: true,
        data: result
      });

    } catch (error) {
      fastify.log.error('❌ Error fetching jobs:', error);
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch jobs',
      });
    }
  });

  // GET /v1/jobs/proximity - Get location-based job suggestions
  fastify.get('/jobs/proximity', async (request, reply) => {
    try {
      const query = request.query as any;
      
      fastify.log.info(`🌍 Fetching proximity jobs for location: ${query.location}`);

      const params = {
        location: query.location || '',
        jobType: query.jobType ? query.jobType.split(',') : [],
        level: query.level ? query.level.split(',') : [],
        remote: query.remote || 'any',
        limit: parseInt(query.limit) || 20
      };

      const result = await jobService.getProximityJobs(params);

      reply.send({
        success: true,
        data: result
      });

    } catch (error) {
      fastify.log.error('❌ Error fetching proximity jobs:', error);
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch proximity jobs',
      });
    }
  });

  // POST /v1/jobs - Job sync and management
  fastify.post('/jobs', async (request, reply) => {
    try {
      const { action, params } = request.body as any;
      
      fastify.log.info(`📋 Job management action: ${action}`);
      
      if (action === 'sync') {
        const {
          location = 'Italy',
          keywords = 'software engineer',
          sources = ['external'],
          limit = 100,
        } = params || {};

        fastify.log.info('📥 Manual job sync requested:', { location, keywords, sources, limit });

        // TODO: Implement actual job scraping and syncing logic
        // For now, return success response
        reply.send({
          success: true,
          data: {
            fetched: 10,
            stored: 8,
            updated: 2,
            skipped: 0,
            cleanedUp: 5,
            message: 'Job sync functionality will be implemented with scraping services'
          },
        });
        
      } else if (action === 'stats') {
        // Get real database statistics
        const stats = await jobService.getJobStats();
        
        reply.send({
          success: true,
          data: stats,
        });
        
      } else {
        reply.status(400).send({
          success: false,
          error: 'Invalid action',
        });
      }
    } catch (error) {
      fastify.log.error('❌ Error in job management:', error);
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  });

  // POST /v1/jobs/advanced-search - Advanced job search with faceted filtering
  fastify.post('/jobs/advanced-search', async (request, reply) => {
    try {
      const searchParams = request.body as any;
      const userId = request.headers['x-user-id'] as string;
      
      fastify.log.info('🔍 Advanced job search requested:', searchParams);

      // Enhanced search parameters
      const searchOptions = {
        query: searchParams.query,
        skills: searchParams.skills,
        location: searchParams.location,
        salaryMin: searchParams.salaryMin ? parseInt(searchParams.salaryMin) : undefined,
        salaryMax: searchParams.salaryMax ? parseInt(searchParams.salaryMax) : undefined,
        experienceMin: searchParams.experienceMin ? parseInt(searchParams.experienceMin) : undefined,
        experienceMax: searchParams.experienceMax ? parseInt(searchParams.experienceMax) : undefined,
        remote: searchParams.remote || 'any',
        companySize: searchParams.companySize,
        posted: searchParams.posted || 'any',
        page: parseInt(searchParams.page) || 1,
        limit: parseInt(searchParams.limit) || 20,
        userId
      };

      // Use existing search method with enhanced filtering
      const result = await jobService.searchJobs({
        q: searchOptions.query,
        page: searchOptions.page,
        limit: searchOptions.limit,
        sortBy: 'relevance',
        userId: searchOptions.userId,
        filters: {
          skills: searchOptions.skills,
          location: searchOptions.location,
          salaryMin: searchOptions.salaryMin,
          salaryMax: searchOptions.salaryMax,
          experience: searchOptions.experienceMin,
          remote: searchOptions.remote === 'only' ? 'remote_only' : 
                  searchOptions.remote === 'excluded' ? 'onsite' : 'any',
          jobType: [],
          jobLevel: [],
          companySize: searchOptions.companySize,
          category: []
        }
      });

      reply.send({
        success: true,
        data: {
          ...result,
          searchParams: searchOptions,
          enhancedSearch: true
        }
      });

    } catch (error) {
      fastify.log.error('❌ Error in advanced search:', error);
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Advanced search failed',
      });
    }
  });

  // GET /v1/jobs/:id - Get single job details
  fastify.get('/jobs/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = request.headers['x-user-id'] as string;

      fastify.log.info(`📋 Fetching job details for: ${id}`);

      // Get job from database
      const job = await jobService.getJobById(id);

      if (!job) {
        reply.status(404).send({
          success: false,
          error: 'Job not found',
        });
        return;
      }

      // Record job view
      if (userId) {
        await jobService.recordJobView(id, userId);
      }

      reply.send({
        success: true,
        data: job
      });

    } catch (error) {
      fastify.log.error('❌ Error fetching job details:', error);
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch job details',
      });
    }
  });

  // =============================================================================
  // JOB SWIPING ENDPOINTS
  // =============================================================================

  // POST /v1/jobs/:id/swipe - Handle job swiping with automation integration
  fastify.post('/jobs/:id/swipe', {
    preHandler: authenticateUser,
    schema: {
      summary: 'Swipe on a job (left/right) with automation integration',
      description: 'Handle job swiping with automatic triggering of application automation for right swipes',
      tags: ['Jobs', 'Swiping'],
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
          direction: { type: 'string', enum: ['LEFT', 'RIGHT'] },
        
          coverLetter: { type: 'string', maxLength: 2000 },
          priority: { type: 'integer', minimum: 1, maximum: 10, default: 5 },
          customFields: { type: 'object', additionalProperties: { type: 'string' } },
          metadata: {
            type: 'object',
            properties: {
              source: { type: 'string', enum: ['web', 'mobile'], default: 'web' },
              deviceId: { type: 'string' },
              userAgent: { type: 'string' },
              ipAddress: { type: 'string' },
            
            },
          },
        },
        required: ['direction'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
            correlationId: { type: 'string' },
          },
        },
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
            correlationId: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const correlationId = randomUUID();
    const startTime = Date.now();

    const logContext = {
      correlationId,
      requestId: (request as any).id || randomUUID(),
      endpoint: '/v1/jobs/:id/swipe',
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    };

    try {
      fastify.log.info({
        ...logContext,
        event: 'job_swipe_started',
        message: 'Job swipe request started'
      });

      // Extract job ID from params
      console.log('DEBUG: request.params =', request.params);
      console.log('DEBUG: request.url =', request.url);
      const { id: jobId } = request.params as { id: string };
      console.log('DEBUG: extracted jobId =', jobId);

      if (!jobId) {
        return reply.code(400).send({
          success: false,
          error: 'Job ID is required',
          errorCode: 'MISSING_JOB_ID',
          correlationId,
        });
      }

      const data = JobSwipeRequestSchema.parse(request.body);
      const user = getAuthenticatedUser(request);

      const enhancedLogContext = {
        ...logContext,
        userId: user.id,
        userEmail: user.email,
        jobId: jobId,
        swipeDirection: data.direction,
        source: data.metadata.source,
      };

      // Verify job exists and is active
      const jobPosting = await fastify.db.jobPosting.findUnique({
        where: { id: jobId },
        include: { company: true },
      });

      if (!jobPosting) {
        fastify.log.warn({
          ...enhancedLogContext,
          event: 'job_not_found',
          message: 'Job posting not found for swipe'
        });

        return reply.code(404).send({
          success: false,
          error: 'Job not found',
          errorCode: 'JOB_NOT_FOUND',
          correlationId,
        });
      }

      if (!jobPosting.isActive) {
        fastify.log.warn({
          ...enhancedLogContext,
          event: 'job_inactive',
          message: 'Attempted to swipe on inactive job',
          jobTitle: jobPosting.title,
          company: jobPosting.company.name,
        });

        return reply.code(410).send({
          success: false,
          error: 'Job is no longer active',
          errorCode: 'JOB_INACTIVE',
          correlationId,
        });
      }

      // Check if user has already swiped on this job
      const existingSwipe = await fastify.db.userJobSwipe.findUnique({
        where: {
          userId_jobPostingId: {
            userId: user.id,
            jobPostingId: jobId,
          },
        },
      });

      // Handle LEFT swipe (just record the swipe, no automation)
      if (data.direction === 'LEFT') {
        await fastify.db.userJobSwipe.upsert({
          where: {
            userId_jobPostingId: {
              userId: user.id,
              jobPostingId: jobId,
            },
          },
          update: {
            direction: 'LEFT',
            deviceType: data.metadata.source,
            updatedAt: new Date(),
          },
          create: {
            userId: user.id,
            jobPostingId: jobId,
            direction: 'LEFT',
            deviceType: data.metadata.source,
            sessionId: data.metadata.deviceId,
            ipAddress: data.metadata.ipAddress,
            userAgent: data.metadata.userAgent,
          },
        });

        fastify.log.info({
          ...enhancedLogContext,
          event: 'left_swipe_recorded',
          message: 'Left swipe recorded successfully',
          processingTime: Date.now() - startTime,
        });

        return reply.send({
          success: true,
          message: 'Left swipe recorded',
          data: {
            jobId: jobId,
            direction: 'LEFT',
            action: 'recorded',
            processingTime: Date.now() - startTime,
          },
          correlationId,
        });
      }

      // Handle RIGHT swipe (trigger automation via existing /v1/queue/apply)
      if (data.direction === 'RIGHT') {
        // SECURITY FIX: Use transaction to prevent race condition between check and create
        // Wrap duplicate check and swipe creation in atomic transaction
        try {
          await fastify.db.$transaction(async (tx) => {
            // Check if user already applied (swiped right) - INSIDE transaction for atomicity
            const existingRightSwipe = await tx.userJobSwipe.findUnique({
              where: {
                userId_jobPostingId: {
                  userId: user.id,
                  jobPostingId: jobId,
                },
              },
            });

            if (existingRightSwipe && existingRightSwipe.direction === 'RIGHT') {
              fastify.log.warn({
                ...enhancedLogContext,
                event: 'duplicate_right_swipe',
                message: 'User already swiped right on this job',
                existingSwipeId: existingRightSwipe.id,
              });

              // Throw error to rollback transaction and signal duplicate
              throw new Error('DUPLICATE_APPLICATION');
            }

            // Record the right swipe atomically (check and create are now atomic)
            await tx.userJobSwipe.upsert({
              where: {
                userId_jobPostingId: {
                  userId: user.id,
                  jobPostingId: jobId,
                },
              },
              update: {
                direction: 'RIGHT',
                deviceType: data.metadata.source,
                updatedAt: new Date(),
              },
              create: {
                userId: user.id,
                jobPostingId: jobId,
                direction: 'RIGHT',
                deviceType: data.metadata.source,
                sessionId: data.metadata.deviceId,
                ipAddress: data.metadata.ipAddress,
                userAgent: data.metadata.userAgent,
              },
            });
          });
        } catch (transactionError) {
          // Handle duplicate application error
          if (transactionError instanceof Error && transactionError.message === 'DUPLICATE_APPLICATION') {
            return reply.code(409).send({
              success: false,
              error: 'Already applied to this job',
              errorCode: 'DUPLICATE_APPLICATION',
              correlationId,
            });
          }
          // Re-throw other errors
          throw transactionError;
        }

        // Transform swipe data to match existing /v1/queue/apply schema
        const queueApplyData = {
          jobId: jobId,
          resumeId: data.resumeId,
          coverLetter: data.coverLetter,
          priority: data.priority || 5,
          customFields: data.customFields || {},
          metadata: {
            source: data.metadata.source,
            deviceId: data.metadata.deviceId,
            userAgent: request.headers['user-agent'] || data.metadata.userAgent,
            ipAddress: request.ip || data.metadata.ipAddress,
          },
        };

        fastify.log.info({
          ...enhancedLogContext,
          event: 'right_swipe_triggering_automation',
          message: 'Right swipe triggering automation via queue/apply',
        });

        // Call the existing queue/apply logic
        try {
          // Create a simulated request for the queue apply handler
          const queueRequest = {
            ...request,
            body: queueApplyData,
            user: user,
          };

          // Import the apply handler logic (we'll create a shared service for this)
          // For now, we'll implement a simplified version that calls the queue endpoint internally

          // Check server automation eligibility
          const serverEligibility = await fastify.automationLimits?.checkServerEligibility(user.id) || {
            allowed: false,
            reason: 'Server automation service not available',
            remainingServerApplications: 0,
            upgradeRequired: true,
            suggestedAction: 'Download desktop app for unlimited applications',
          };

          // If eligible for server automation, execute immediately
          if (serverEligibility.allowed && fastify.serverAutomationService) {
            fastify.log.info({
              ...enhancedLogContext,
              event: 'server_automation_triggered',
              message: 'Starting immediate server automation for right swipe',
            });

            // Get user's profile data for automation
            const userProfile = await fastify.db.userProfile.findUnique({
              where: { userId: user.id },
            });

            // Detect company automation type based on URL patterns
            const companyAutomation = detectCompanyAutomation(jobPosting.externalUrl || jobPosting.applyUrl || '');

            // Prepare server automation request
            const serverRequest = {
              userId: user.id,
              jobId: jobId,
              applicationId: randomUUID(),
              companyAutomation,
              userProfile: {
                firstName: userProfile?.firstName || '',
                lastName: userProfile?.lastName || '',
                email: user.email,
                phone: userProfile?.phone || '',
                resumeUrl: userProfile?.website || '',
                currentTitle: userProfile?.currentTitle || '',
                yearsExperience: userProfile?.yearsOfExperience || 0,
                skills: userProfile?.skills || [],
                currentLocation: userProfile?.location || '',
                linkedinUrl: userProfile?.linkedin || '',
                workAuthorization: userProfile?.workAuthorization || '',
                coverLetter: data.coverLetter,
                customFields: data.customFields || {}
              },
              jobData: {
                id: jobId,
                title: jobPosting.title,
                company: jobPosting.company.name,
                applyUrl: jobPosting.externalUrl || jobPosting.applyUrl || '',
                location: jobPosting.location,
                description: jobPosting.description,
                requirements: Array.isArray(jobPosting.requirements) ? jobPosting.requirements : []
              },
              options: {
                headless: false, // User requested headful mode by default
                timeout: 300000, // 5 minutes
                maxRetries: 2
              }
            };

            try {
              // Execute server automation
              const automationResult = await fastify.serverAutomationService.executeAutomation(serverRequest, correlationId);

              // Record server application usage
              await fastify.automationLimits?.recordServerApplication(user.id);

              fastify.log.info({
                ...enhancedLogContext,
                event: 'server_automation_completed',
                message: 'Server automation completed from swipe',
                success: automationResult.success,
                processingTime: Date.now() - startTime
              });

              // Return immediate server automation result
              return reply.send({
                success: true,
                message: 'Right swipe processed - server automation completed',
                data: {
                  jobId: jobId,
                  direction: 'RIGHT',
                  action: 'automated_immediately',
                  executionMode: 'server',
                  automation: {
                    success: automationResult.success,
                    applicationId: automationResult.applicationId,
                    confirmationNumber: automationResult.confirmationNumber,
                    status: automationResult.status,
                    executionTime: automationResult.executionTime
                  },
                  serverAutomation: {
                    eligible: true,
                    remainingServerApplications: serverEligibility.remainingServerApplications - 1,
                  },
                  processingTime: Date.now() - startTime,
                },
                correlationId,
              });

            } catch (automationError) {
              // Log automation error but continue with fallback to queue
              fastify.log.error({
                ...enhancedLogContext,
                event: 'server_automation_failed',
                message: 'Server automation failed, falling back to queue',
                error: automationError instanceof Error ? automationError.message : 'Unknown error'
              });

              // Fall back to desktop queue processing
              fastify.log.info({
                ...enhancedLogContext,
                event: 'fallback_to_queue',
                message: 'Falling back to desktop queue due to automation failure'
              });
            }
          }

          // Queue for desktop processing (fallback or not eligible for server automation)
          const queueEntry = await fastify.db.applicationQueue.create({
              data: {
                userId: user.id,
                jobPostingId: jobId,
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
                  triggeredBySwipe: true,
                },
              },
            });

            // Emit WebSocket event for real-time updates
            if (fastify.websocket) {
              // Get queue position for more informative updates
              const queuePosition = Math.floor(Math.random() * 25) + 1; // Mock position for now
              const estimatedTime = calculateEstimatedTime(queuePosition, data.priority >= 8);

              // Job queued notification
              fastify.websocket.emitToUser(user.id, 'job-queued-from-swipe', {
                applicationId: queueEntry.id,
                jobId: jobId,
                jobTitle: jobPosting.title,
                company: jobPosting.company.name,
                status: 'queued',
                queuedAt: new Date().toISOString(),
                queuePosition,
                estimatedTime,
                isPriority: data.priority >= 8,
                message: 'Job application queued for desktop processing',
              });

              // Application status update
              (fastify.websocket as any).emitApplicationStatusUpdate({
                userId: user.id,
                applicationId: queueEntry.id,
                jobId: jobId,
                jobTitle: jobPosting.title,
                company: jobPosting.company.name,
                status: 'queued',
                queuePosition,
                estimatedTime,
                timestamp: new Date().toISOString()
              });

              // User notification
              (fastify.websocket as any).emitNotification(user.id, {
                id: randomUUID(),
                type: 'info',
                title: 'Application Queued',
                message: `${jobPosting.title} at ${jobPosting.company.name} has been queued for processing`,
                applicationId: queueEntry.id,
                jobId: jobId,
                timestamp: new Date().toISOString(),
                duration: 5000,
                actions: [
                  {
                    label: 'View Progress',
                    action: `navigate:/applications/${queueEntry.id}`,
                    variant: 'primary'
                  }
                ]
              });
            }

            return reply.code(201).send({
              success: true,
              message: 'Right swipe queued for desktop processing',
              data: {
                jobId: jobId,
                direction: 'RIGHT',
                action: 'queued_for_desktop',
                executionMode: 'desktop',
                applicationId: queueEntry.id,
                serverAutomation: {
                  eligible: serverEligibility.allowed,
                  reason: serverEligibility.reason,
                  remainingServerApplications: serverEligibility.remainingServerApplications,
                  upgradeRequired: serverEligibility.upgradeRequired,
                  suggestedAction: serverEligibility.suggestedAction,
                },
                processingTime: Date.now() - startTime,
              },
              correlationId,
            });

        } catch (automationError) {
          fastify.log.error({
            ...enhancedLogContext,
            event: 'right_swipe_automation_failed',
            message: 'Failed to process right swipe automation',
            error: automationError instanceof Error ? automationError.message : String(automationError),
          });

          return reply.code(500).send({
            success: false,
            error: 'Failed to process job application',
            errorCode: 'AUTOMATION_FAILED',
            correlationId,
          });
        }
      }

    } catch (error) {
      const processingTime = Date.now() - startTime;

      if (error instanceof z.ZodError) {
        fastify.log.warn({
          ...logContext,
          event: 'swipe_validation_failed',
          message: 'Job swipe validation failed',
          processingTimeMs: processingTime,
          validationErrors: error.errors,
        });

        return reply.code(400).send({
          success: false,
          error: 'Validation failed',
          details: error.errors,
          errorCode: 'VALIDATION_ERROR',
          correlationId,
        });
      }

      fastify.log.error({
        ...logContext,
        event: 'swipe_request_failed',
        message: 'Job swipe request failed with error',
        processingTimeMs: processingTime,
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      });

      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        errorCode: 'INTERNAL_ERROR',
        correlationId,
      });
    }
  });

  // GET /v1/jobs/recommendations - Get personalized job recommendations for swiping
  fastify.get('/jobs/recommendations', {
    preHandler: authenticateUser,
    schema: {
      summary: 'Get personalized job recommendations for swiping',
      description: 'Retrieves a feed of job recommendations filtered by user preferences and excluding already swiped jobs',
      tags: ['Jobs', 'Swiping'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 },
          location: { type: 'string' },
          remote: { type: 'boolean' },
          salaryMin: { type: 'number' },
          salaryMax: { type: 'number' },
          jobType: { type: 'string', enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'] },
          experienceLevel: { type: 'string', enum: ['ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL', 'EXECUTIVE'] },
          skills: { type: 'string', description: 'Comma-separated list of skills' },
          companySize: { type: 'string', enum: ['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'] },
        },
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
  }, async (request, reply) => {
    try {
      const query = request.query as any;
      const user = getAuthenticatedUser(request);

      fastify.log.info('📱 Job recommendations requested', {
        userId: user.id,
        filters: query,
      });

      // Parse query parameters
      const filters = {
        limit: Math.min(parseInt(query.limit) || 20, 50),
        offset: parseInt(query.offset) || 0,
        location: query.location,
        remote: query.remote,
        salaryMin: query.salaryMin ? parseInt(query.salaryMin) : undefined,
        salaryMax: query.salaryMax ? parseInt(query.salaryMax) : undefined,
        jobType: query.jobType,
        experienceLevel: query.experienceLevel,
        skills: query.skills ? query.skills.split(',').map((s: string) => s.trim()) : [],
        companySize: query.companySize,
      };

      // Get user's existing swipes to exclude already swiped jobs
      const userSwipes = await fastify.db.userJobSwipe.findMany({
        where: { userId: user.id },
        select: { jobPostingId: true },
      });

      const swipedJobIds = userSwipes.map(swipe => swipe.jobPostingId);

      // Build filter conditions for job search
      const whereConditions: any = {
        isActive: true,
        id: { notIn: swipedJobIds }, // Exclude already swiped jobs
      };

      // Apply location filters
      if (filters.location) {
        whereConditions.OR = [
          { location: { contains: filters.location, mode: 'insensitive' } },
          { city: { contains: filters.location, mode: 'insensitive' } },
          { state: { contains: filters.location, mode: 'insensitive' } },
        ];
      }

      // Apply other filters
      if (filters.remote !== undefined) {
        whereConditions.remote = filters.remote;
      }

      if (filters.salaryMin) {
        whereConditions.salaryMin = { gte: filters.salaryMin };
      }

      if (filters.salaryMax) {
        whereConditions.salaryMax = { lte: filters.salaryMax };
      }

      if (filters.jobType) {
        whereConditions.type = filters.jobType;
      }

      if (filters.experienceLevel) {
        whereConditions.level = filters.experienceLevel;
      }

      if (filters.skills && filters.skills.length > 0) {
        whereConditions.skills = {
          hasSome: filters.skills,
        };
      }

      if (filters.companySize) {
        whereConditions.company = {
          size: filters.companySize,
        };
      }

      // Get job recommendations with enhanced ordering for better matching
      const [jobs, totalCount] = await Promise.all([
        fastify.db.jobPosting.findMany({
          where: whereConditions,
          include: {
            company: true,
          },
          orderBy: [
            { isFeatured: 'desc' }, // Featured jobs first
            { isUrgent: 'desc' }, // Urgent jobs next
            { qualityScore: 'desc' }, // High quality jobs
            { postedAt: 'desc' }, // Most recent jobs
          ],
          take: filters.limit,
          skip: filters.offset,
        }),
        fastify.db.jobPosting.count({
          where: whereConditions,
        }),
      ]);

      // Format jobs for response with additional metadata
      const formattedJobs = jobs.map(job => ({
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits,
        company: {
          id: job.company.id,
          name: job.company.name,
          logo: job.company.logo,
          website: job.company.website,
          industry: job.company.industry,
          size: job.company.size,
          description: job.company.description,
        },
        location: job.location,
        city: job.city,
        state: job.state,
        country: job.country,
        remote: job.remote,
        remoteType: job.remoteType,
        salary: {
          min: job.salaryMin,
          max: job.salaryMax,
          currency: job.currency,
          type: job.salaryType,
        },
        equity: job.equity,
        bonus: job.bonus,
        type: job.type,
        level: job.level,
        department: job.department,
        category: job.category,
        experienceYears: job.experienceYears,
        skills: job.skills,
        education: job.education,
        languages: job.languages,
        postedAt: job.postedAt,
        expiresAt: job.expiresAt,
        applyUrl: job.applyUrl,
        sourceUrl: job.sourceUrl,
        isVerified: job.isVerified,
        isFeatured: job.isFeatured,
        isUrgent: job.isUrgent,
        qualityScore: job.qualityScore,
        // Additional metadata for swiping interface
        swipeMetadata: {
          hasBeenSwiped: false,
          swipeDirection: null,
          matchScore: job.qualityScore || 0,
          recommendationReason: job.isFeatured ? 'Featured Job' :
                                job.isUrgent ? 'Urgent Hiring' :
                                job.qualityScore > 80 ? 'High Quality Match' : 'Recommended',
        },
      }));

      fastify.log.info('📱 Job recommendations retrieved successfully', {
        userId: user.id,
        totalJobs: totalCount,
        returnedJobs: formattedJobs.length,
        excludedSwipes: swipedJobIds.length,
        appliedFilters: Object.keys(filters).filter(key => filters[key] !== undefined && filters[key] !== ''),
      });

      return reply.send({
        success: true,
        data: {
          jobs: formattedJobs,
          pagination: {
            total: totalCount,
            limit: filters.limit,
            offset: filters.offset,
            hasMore: filters.offset + filters.limit < totalCount,
          },
          filters: filters,
          statistics: {
            totalAvailable: totalCount,
            excludedBySwipes: swipedJobIds.length,
            filtersApplied: Object.keys(filters).filter(key =>
              filters[key] !== undefined &&
              filters[key] !== '' &&
              filters[key] !== null &&
              (Array.isArray(filters[key]) ? filters[key].length > 0 : true)
            ).length,
          },
        },
      });

    } catch (error) {
      fastify.log.error('❌ Error fetching job recommendations:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch job recommendations',
        errorCode: 'RECOMMENDATIONS_FAILED',
      });
    }
  });
};

export default jobsRoutes;