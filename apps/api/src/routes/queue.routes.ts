/**
 * @fileoverview Queue Management API Routes for JobSwipe
 * @description Enterprise-grade job application queue endpoints with authentication
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { QueueStatus } from '@jobswipe/database';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

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

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const JobApplicationRequestSchema = z.object({
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
  status: z.nativeEnum(QueueStatus).optional(),
});

const ApplicationActionRequestSchema = z.object({
  action: z.enum(['cancel', 'retry', 'prioritize']),
  reason: z.string().max(500).optional(),
});

// =============================================================================
// TYPES
// =============================================================================

interface JobApplicationRequest {
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
    createdAt: Date;
    updatedAt: Date;
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
// QUEUE UTILITIES
// =============================================================================

/**
 * Get the position of an application in the queue
 */
async function getQueuePosition(snapshotId: string): Promise<number> {
  try {
    // Mock implementation - in real scenario, this would query the database
    // to find the position based on priority and creation time
    return Math.floor(Math.random() * 50) + 1; // Random position 1-50 for development
  } catch (error) {
    console.warn('Failed to get queue position:', error);
    return 0;
  }
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
 * POST /api/v1/queue/apply
 * Queue a job application when user applies to a job
 */
async function applyHandler(request: AuthenticatedRequest, reply: FastifyReply) {
  // Generate correlation ID for request tracing
  const correlationId = randomUUID();
  const startTime = Date.now();
  
  // Enhanced structured logging context
  const logContext = {
    correlationId,
    requestId: (request as any).id || randomUUID(),
    endpoint: '/api/v1/queue/apply',
    userAgent: request.headers['user-agent'],
    ip: request.ip
  };

  try {
    request.server.log.info({
      ...logContext,
      event: 'request_started',
      message: 'Job application request started'
    });

    const data = JobApplicationRequestSchema.parse(request.body);
    const user = getAuthenticatedUser(request);
    
    // Add user context to logging
    const enhancedLogContext = {
      ...logContext,
      userId: user.id,
      userEmail: user.email,
      jobId: data.jobId,
      source: data.metadata.source
    };
    
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
      request.server.log.warn({
        ...enhancedLogContext,
        event: 'duplicate_application',
        message: 'User already applied to this job',
        existingSwipeId: existingSwipe.id
      });
      
      return reply.code(409).send({
        success: false,
        error: 'Already applied to this job',
        errorCode: 'DUPLICATE_APPLICATION',
        correlationId
      });
    }
    
    // Get job posting with company data
    const jobPosting = await request.server.db.jobPosting.findUnique({
      where: { id: data.jobId },
      include: { company: true },
    });
    
    if (!jobPosting) {
      request.server.log.warn({
        ...enhancedLogContext,
        event: 'job_not_found',
        message: 'Job posting not found in database'
      });
      
      return reply.code(404).send({
        success: false,
        error: 'Job not found',
        errorCode: 'JOB_NOT_FOUND',
        correlationId
      });
    }
    
    if (!jobPosting.isActive) {
      request.server.log.warn({
        ...enhancedLogContext,
        event: 'job_inactive',
        message: 'Job posting is no longer active',
        jobTitle: jobPosting.title,
        company: jobPosting.company.name
      });
      
      return reply.code(410).send({
        success: false,
        error: 'Job is no longer active',
        errorCode: 'JOB_INACTIVE',
        correlationId
      });
    }

    request.server.log.info({
      ...enhancedLogContext,
      event: 'job_validated',
      message: 'Job posting found and validated',
      jobTitle: jobPosting.title,
      company: jobPosting.company.name,
      jobLocation: jobPosting.location
    });
    
    // Get user's profile data
    const userProfile = await request.server.db.userProfile.findUnique({
      where: { userId: user.id },
    });
    
    // Check server automation eligibility
    const serverEligibility = await request.server.automationLimits.checkServerEligibility(user.id);
    
    request.server.log.info({
      ...enhancedLogContext,
      event: 'server_eligibility_checked',
      message: 'Server automation eligibility checked',
      eligible: serverEligibility.allowed,
      reason: serverEligibility.reason,
      remainingApplications: serverEligibility.remainingServerApplications
    });
    
    // If eligible for server automation, execute immediately
    if (serverEligibility.allowed && request.server.serverAutomationService) {
      try {
        request.server.log.info({
          ...enhancedLogContext,
          event: 'server_automation_started',
          message: 'Starting immediate server automation'
        });
        
        // Detect company automation type based on URL patterns
        const companyAutomation = detectCompanyAutomation(jobPosting.applyUrl || jobPosting.sourceUrl || '');
        
        // Prepare server automation request
        const serverRequest = {
          userId: user.id,
          jobId: data.jobId,
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
            id: data.jobId,
            title: jobPosting.title,
            company: jobPosting.company.name,
            applyUrl: jobPosting.applyUrl || jobPosting.sourceUrl || '',
            location: jobPosting.location,
            description: jobPosting.description,
            requirements: Array.isArray(jobPosting.requirements) ? jobPosting.requirements : []
          },
          options: {
            headless: true,
            timeout: 300000 // 5 minutes
          }
        };
        
        // Execute server automation
        const automationResult = await request.server.serverAutomationService.executeAutomation(serverRequest, correlationId);
        
        // Record server application usage
        await request.server.automationLimits.recordServerApplication(user.id);
        
        request.server.log.info({
          ...enhancedLogContext,
          event: 'server_automation_completed',
          message: 'Server automation completed successfully',
          success: automationResult.success,
          processingTime: Date.now() - startTime
        });
        
        // Return immediate server automation result
        return reply.send({
          success: true,
          message: 'Job application processed immediately via server automation',
          data: {
            applicationId: serverRequest.applicationId,
            jobId: data.jobId,
            userId: user.id,
            status: automationResult.success ? QueueStatus.COMPLETED : QueueStatus.FAILED,
            executionMode: 'server',
            result: automationResult,
            processingTime: Date.now() - startTime
          }
        });
        
      } catch (serverError) {
        request.server.log.error({
          ...enhancedLogContext,
          event: 'server_automation_failed',
          message: 'Server automation failed, falling back to desktop queue',
          error: serverError instanceof Error ? serverError.message : 'Unknown error'
        });
        
        // Fall through to desktop queue logic below
      }
    }
    
    // Log desktop queue routing
    request.server.log.info({
      ...enhancedLogContext,
      event: 'desktop_queue_routing',
      message: 'Routing application to desktop queue',
      reason: serverEligibility.allowed ? 'server_automation_failed' : serverEligibility.reason
    });
    
    // Start database transaction
    request.server.log.info({
      ...enhancedLogContext,
      event: 'database_transaction_started',
      message: 'Starting database transaction for job application'
    });
    
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
          status: QueueStatus.PENDING,
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
      
      // Create job snapshot within transaction (optional - skip if not available)
      let snapshot = null;
      try {
        if (tx.jobSnapshot) {
          snapshot = await tx.jobSnapshot.create({
        data: {
          applicationQueueId: queueEntry.id,
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
        }
      } catch (snapshotError) {
        // Log but don't fail if snapshot creation fails
        request.server.log.warn({
          ...enhancedLogContext,
          event: 'job_snapshot_creation_failed',
          message: 'Failed to create job snapshot, continuing without it',
          error: snapshotError instanceof Error ? snapshotError.message : 'Unknown error'
        });
      }

      // Queue job application using BullMQ
      if (request.server.queueService) {
        // Transform data to match BullMQ JobData format
        const queueJobData = {
          jobId: data.jobId,
          userId: user.id,
          jobData: {
            title: jobPosting.title,
            company: jobPosting.company.name,
            url: jobPosting.applyUrl || jobPosting.sourceUrl || '',
            description: jobPosting.description,
            requirements: jobPosting.requirements || '',
            salary: jobPosting.salaryMin && jobPosting.salaryMax ? {
              min: jobPosting.salaryMin,
              max: jobPosting.salaryMax,
              currency: jobPosting.currency || 'USD'
            } : undefined,
            location: jobPosting.location || `${jobPosting.city}, ${jobPosting.state}`,
            remote: jobPosting.remote,
            type: jobPosting.type.toString(),
            level: jobPosting.level.toString(),
          },
          userProfile: {
            resumeUrl: userProfile?.resumeUrl,
            coverLetter: data.coverLetter,
            preferences: {
              firstName: userProfile?.firstName || user.email.split('@')[0],
              lastName: userProfile?.lastName || 'User',
              email: user.email,
              phone: userProfile?.phone || '',
              currentTitle: userProfile?.currentTitle,
              yearsExperience: userProfile?.yearsExperience,
              skills: userProfile?.skills || [],
              currentLocation: userProfile?.currentLocation || jobPosting.location,
              linkedinUrl: userProfile?.linkedinUrl,
              workAuthorization: userProfile?.workAuthorization,
              applicationId: queueEntry.id,
            }
          },
          priority: data.priority,
          metadata: {
            source: data.metadata.source,
            deviceId: data.metadata.deviceId,
            timestamp: new Date().toISOString(),
          }
        };
        
        // Add job to BullMQ queue
        try {
          const isPriority = data.priority >= 8;
          const queueJobId = await request.server.queueService.addJobApplication(queueJobData, isPriority);
          
          request.server.log.info({
            ...enhancedLogContext,
            event: 'bullmq_job_queued',
            message: 'Application queued in BullMQ for processing',
            queueJobId,
            queueName: isPriority ? 'priority' : 'applications',
            executionMode: 'worker'
          });

          // Emit WebSocket event for real-time updates
          if (request.server.websocket) {
            // Queue position update
            const queuePosition = await getQueuePosition(snapshot.id);
            const estimatedTime = calculateEstimatedTime(queuePosition, isPriority);

            request.server.websocket.emitToUser(user.id, 'job-queued', {
              applicationId: queueEntry.id,
              queueJobId,
              status: 'queued',
              jobTitle: queueJobData.jobData.title,
              company: queueJobData.jobData.company,
              queuedAt: new Date().toISOString(),
              isPriority,
              queuePosition,
              estimatedTime,
              message: 'Job application has been queued for automation'
            });

            // Application status update
            (request.server.websocket as any).emitApplicationStatusUpdate({
              userId: user.id,
              applicationId: queueEntry.id,
              jobId: data.jobId,
              jobTitle: queueJobData.jobData.title,
              company: queueJobData.jobData.company,
              status: 'queued',
              queuePosition,
              estimatedTime,
              timestamp: new Date().toISOString()
            });
          }
          
          // Update the database entry with queue job ID
          await tx.applicationQueue.update({
            where: { id: queueEntry.id },
            data: {
              status: 'QUEUED',
              automationConfig: {
                ...queueEntry.automationConfig,
                queueJobId,
                queuedAt: new Date().toISOString(),
                isPriority
              }
            }
          });
        } catch (queueError) {
          request.server.log.error({
            ...enhancedLogContext,
            event: 'bullmq_queue_failed',
            message: 'Failed to queue job in BullMQ - job saved for manual processing',
            error: queueError instanceof Error ? queueError.message : String(queueError),
            errorStack: queueError instanceof Error ? queueError.stack : undefined,
            queueServiceAvailable: !!request.server.queueService,
            websocketAvailable: !!request.server.websocket
          });
          
          // Emit WebSocket event about queue failure
          if (request.server.websocket) {
            request.server.websocket.emitToUser(user.id, 'queue-failed', {
              applicationId: queueEntry.id,
              status: 'pending',
              jobTitle: jobPosting.title,
              company: jobPosting.company.name,
              failedAt: new Date().toISOString(),
              error: 'Failed to queue job - will be processed manually',
              message: 'Job application saved but queuing failed'
            });
          }
          
          // Don't fail the entire request, just log the error
          // The job is still saved in the database for manual processing
        }
      } else {
        request.server.log.warn({
          ...enhancedLogContext,
          event: 'queue_service_unavailable',
          message: 'Queue service not available - job saved for manual processing'
        });
      }
      
      return {
        applicationId: queueEntry.id,
        snapshotId: snapshot.id,
        status: queueEntry.status,
        priority: queueEntry.priority,
      };
    });

    // WEBSOCKET PUSH: Immediately push job to desktop app (replaces polling!)
    if (request.server.websocket) {
      try {
        // Get the full job data with snapshot for desktop
        const fullApplication = await request.server.db.applicationQueue.findUnique({
          where: { id: result.applicationId },
          include: {
            jobSnapshot: {
              select: {
                title: true,
                companyName: true,
                location: true,
                companyLogo: true,
                salaryMin: true,
                salaryMax: true,
                currency: true,
                remote: true,
                type: true,
                applyUrl: true,
              },
            },
          },
        });

        if (fullApplication) {
          // Push job to desktop stream
          request.server.websocket.emitJobToDesktop(user.id, {
            id: fullApplication.id,
            jobId: fullApplication.jobPostingId,
            userId: fullApplication.userId,
            status: fullApplication.status.toLowerCase(),
            priority: fullApplication.priority.toLowerCase(),
            useCustomResume: fullApplication.useCustomResume,
            resumeId: fullApplication.resumeId || undefined,
            coverLetter: fullApplication.coverLetter || undefined,
            customFields: fullApplication.customFields || {},
            automationConfig: fullApplication.automationConfig || {},
            job: {
              title: fullApplication.jobSnapshot?.title || 'Unknown Job',
              company: fullApplication.jobSnapshot?.companyName || 'Unknown Company',
              location: fullApplication.jobSnapshot?.location || '',
              logo: fullApplication.jobSnapshot?.companyLogo || undefined,
              salary: {
                min: fullApplication.jobSnapshot?.salaryMin || undefined,
                max: fullApplication.jobSnapshot?.salaryMax || undefined,
                currency: fullApplication.jobSnapshot?.currency || undefined,
              },
              remote: fullApplication.jobSnapshot?.remote ?? false,
              type: fullApplication.jobSnapshot?.type || '',
              url: fullApplication.jobSnapshot?.applyUrl || '',
            },
            createdAt: fullApplication.createdAt.toISOString(),
            updatedAt: fullApplication.updatedAt.toISOString(),
          });

          request.server.log.info({
            ...enhancedLogContext,
            event: 'job_pushed_to_desktop',
            message: 'Job pushed to desktop app via WebSocket',
            applicationId: result.applicationId
          });
        }
      } catch (wsError) {
        // Don't fail the request if WebSocket push fails
        request.server.log.warn({
          ...enhancedLogContext,
          event: 'websocket_push_failed',
          message: 'Failed to push job to desktop via WebSocket',
          error: wsError instanceof Error ? wsError.message : String(wsError)
        });
      }
    }

    const processingTime = Date.now() - startTime;

    request.server.log.info({
      ...enhancedLogContext,
      event: 'request_completed_success',
      message: 'Job application request completed successfully',
      processingTimeMs: processingTime,
      applicationId: result.applicationId,
      queuePosition: await getQueuePosition(result.snapshotId)
    });

    return reply.code(201).send({
      success: true,
      data: {
        ...result,
        executionMode: 'desktop',
        serverAutomation: {
          eligible: serverEligibility.allowed,
          reason: serverEligibility.reason,
          remainingServerApplications: serverEligibility.remainingServerApplications,
          upgradeRequired: serverEligibility.upgradeRequired,
          suggestedAction: serverEligibility.suggestedAction
        }
      },
      message: serverEligibility.allowed 
        ? 'Server automation not available - job queued for desktop processing'
        : `Server automation limit reached - ${serverEligibility.reason}. Download desktop app for unlimited applications.`,
      correlationId,
      processingTime: processingTime
    });
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    if (error instanceof z.ZodError) {
      request.server.log.warn({
        ...logContext,
        event: 'request_validation_failed',
        message: 'Job application request validation failed',
        processingTimeMs: processingTime,
        validationErrors: error.errors
      });
      
      return reply.code(400).send({
        success: false,
        error: 'Validation failed',
        details: error.errors,
        errorCode: 'VALIDATION_ERROR',
        correlationId
      });
    }
    
    request.server.log.error({
      ...logContext,
      event: 'request_failed_error',
      message: 'Job application request failed with error',
      processingTimeMs: processingTime,
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined
    });
    
    return reply.code(500).send({
      success: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
      correlationId
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
        application: {
          include: {
            resume: true,
          },
        },
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
    
    const formattedApplications = applications.map(app => {
      // Build metadata from database fields
      const metadata: any = {};

      // Add resume data if available
      if (app.application?.resume) {
        metadata.resume = {
          fileName: app.application.resume.name || 'Resume.pdf',
          summary: app.application.resume.metadata?.summary || null,
          url: app.application.resume.pdfUrl || app.application.resume.htmlUrl || null,
        };
      }

      // Add responses data from customFields or responseData
      if (app.customFields || app.responseData) {
        const responses: Record<string, any> = {};

        // Merge customFields into responses
        if (app.customFields && typeof app.customFields === 'object') {
          Object.assign(responses, app.customFields);
        }

        // Merge responseData into responses
        if (app.responseData && typeof app.responseData === 'object') {
          Object.assign(responses, app.responseData);
        }

        // Add cover letter as a response if present
        if (app.coverLetter) {
          responses['Cover Letter'] = app.coverLetter;
        }

        if (Object.keys(responses).length > 0) {
          metadata.responses = responses;
        }
      }

      return {
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
          url: app.jobSnapshot?.applyUrl || app.jobPosting.applyUrl || app.jobSnapshot?.sourceUrl || app.jobPosting.sourceUrl,
          salary: {
            min: app.jobSnapshot?.salaryMin || app.jobPosting.salaryMin,
            max: app.jobSnapshot?.salaryMax || app.jobPosting.salaryMax,
            currency: app.jobSnapshot?.currency || app.jobPosting.currency,
          },
          remote: app.jobSnapshot?.remote ?? app.jobPosting.remote,
          type: app.jobSnapshot?.type || app.jobPosting.type,
        },
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
      };
    });
    
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
        application: {
          include: {
            resume: true,
          },
        },
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
    
    // Get automation status if available
    let automationStatus = null;
    if (request.server.automationService) {
      try {
        // Extract automation application ID from config
        const automationApplicationId = application.automationConfig?.automationApplicationId;
        if (automationApplicationId) {
          automationStatus = await request.server.automationService.getApplicationStatus(automationApplicationId);
        }
      } catch (error) {
        request.server.log.warn('Failed to get automation status:', error);
      }
    }

    // Build metadata from database fields
    const metadata: any = {};

    // Add resume data if available
    if (application.application?.resume) {
      metadata.resume = {
        fileName: application.application.resume.name || 'Resume.pdf',
        summary: application.application.resume.metadata?.summary || null,
        url: application.application.resume.pdfUrl || application.application.resume.htmlUrl || null,
      };
    }

    // Add responses data from customFields or responseData
    if (application.customFields || application.responseData) {
      const responses: Record<string, any> = {};

      // Merge customFields into responses
      if (application.customFields && typeof application.customFields === 'object') {
        Object.assign(responses, application.customFields);
      }

      // Merge responseData into responses
      if (application.responseData && typeof application.responseData === 'object') {
        Object.assign(responses, application.responseData);
      }

      // Add cover letter as a response if present
      if (application.coverLetter) {
        responses['Cover Letter'] = application.coverLetter;
      }

      if (Object.keys(responses).length > 0) {
        metadata.responses = responses;
      }
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
      automationStatus,
      job: {
        title: application.jobSnapshot?.title || application.jobPosting.title,
        company: application.jobSnapshot?.companyName || application.jobPosting.company.name,
        description: application.jobSnapshot?.description || application.jobPosting.description,
        requirements: application.jobSnapshot?.requirements || application.jobPosting.requirements,
        location: application.jobSnapshot?.location || application.jobPosting.location,
        url: application.jobSnapshot?.applyUrl || application.jobPosting.applyUrl || application.jobSnapshot?.sourceUrl || application.jobPosting.sourceUrl,
        applyUrl: application.jobSnapshot?.applyUrl || application.jobPosting.applyUrl,
        sourceUrl: application.jobSnapshot?.sourceUrl || application.jobPosting.sourceUrl,
      },
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
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
        updateData = { status: QueueStatus.CANCELLED };
        if (request.server.automationService) {
          try {
            // Extract automation application ID from config
            const automationApplicationId = application.automationConfig?.automationApplicationId;
            if (automationApplicationId) {
              const cancelResult = await request.server.automationService.cancelApplication(automationApplicationId, user.id);
              if (!cancelResult.cancelled) {
                return reply.code(400).send({
                  success: false,
                  error: 'Cannot cancel application - it may already be processing',
                  errorCode: 'CANCEL_FAILED',
                });
              }
            }
          } catch (error) {
            request.server.log.warn('Failed to cancel automation:', error);
          }
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
          status: QueueStatus.PENDING,
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
 * GET /api/v1/queue/applications/:id/position
 * Get queue position for application
 */
async function queuePositionHandler(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const user = getAuthenticatedUser(request);

    // Verify the application belongs to the user
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

    // Calculate queue position based on priority and creation time
    const position = await request.server.db.applicationQueue.count({
      where: {
        status: { in: ['PENDING', 'QUEUED'] },
        OR: [
          { priority: { in: ['IMMEDIATE', 'URGENT'] } },
          {
            priority: application.priority,
            createdAt: { lt: application.createdAt },
          },
        ],
      },
    });

    const estimatedTime = calculateEstimatedTime(position + 1, ['IMMEDIATE', 'URGENT'].includes(application.priority));

    return reply.send({
      success: true,
      data: {
        position: position + 1,
        estimatedTime,
        isPriority: ['IMMEDIATE', 'URGENT'].includes(application.priority),
        status: application.status.toLowerCase(),
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    request.server.log.error('Queue position error:', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });
  }
}

/**
 * POST /api/v1/queue/applications/:id/queue-position
 * Update queue position from desktop app
 */
async function queuePositionUpdateHandler(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const data = request.body as any;
    const user = getAuthenticatedUser(request);

    // Verify the application belongs to the user
    const application = await request.server.db.applicationQueue.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        jobSnapshot: { select: { title: true, companyName: true } },
      },
    });

    if (!application) {
      return reply.code(404).send({
        success: false,
        error: 'Application not found',
        errorCode: 'APPLICATION_NOT_FOUND',
      });
    }

    // Emit WebSocket event for queue position update
    if (request.server.websocket) {
      (request.server.websocket as any).emitQueuePositionUpdate({
        userId: user.id,
        totalInQueue: data.position, // Using position as total for now
        userPosition: data.position,
        estimatedWaitTime: data.estimatedTime,
        processingCount: 1
      });
    }

    return reply.send({
      success: true,
      message: 'Queue position update received and broadcasted',
      data: {
        applicationId: id,
        position: data.position,
        estimatedTime: data.estimatedTime,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    request.server.log.error('Queue position update error:', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });
  }
}

/**
 * POST /api/v1/queue/applications/:id/progress
 * Update application progress from desktop automation
 */
async function progressUpdateHandler(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const data = request.body as any;
    const user = getAuthenticatedUser(request);

    // Verify the application belongs to the user
    const application = await request.server.db.applicationQueue.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        jobSnapshot: { select: { title: true, companyName: true } },
      },
    });

    if (!application) {
      return reply.code(404).send({
        success: false,
        error: 'Application not found',
        errorCode: 'APPLICATION_NOT_FOUND',
      });
    }

    // Update application status in database
    await request.server.db.applicationQueue.update({
      where: { id },
      data: {
        status: data.status.toUpperCase(),
        lastProgressUpdate: new Date(),
        automationConfig: {
          ...application.automationConfig,
          lastProgress: {
            step: data.progress.step,
            percentage: data.progress.percentage,
            message: data.progress.message,
            timestamp: data.progress.timestamp,
            executionId: data.executionId,
          },
        },
      },
    });

    // Emit WebSocket events for real-time updates
    if (request.server.websocket) {
      // Automation progress update
      (request.server.websocket as any).emitAutomationProgress(user.id, {
        applicationId: id,
        jobId: application.jobPostingId,
        jobTitle: application.jobSnapshot?.title || 'Unknown Job',
        company: application.jobSnapshot?.companyName || 'Unknown Company',
        progress: {
          step: data.progress.step,
          percentage: data.progress.percentage,
          message: data.progress.message,
          timestamp: data.progress.timestamp,
        },
        status: data.status,
        executionId: data.executionId,
      });

      // Application status update
      (request.server.websocket as any).emitApplicationStatusUpdate(user.id, {
        applicationId: id,
        jobId: application.jobPostingId,
        jobTitle: application.jobSnapshot?.title || 'Unknown Job',
        company: application.jobSnapshot?.companyName || 'Unknown Company',
        status: data.status,
        progress: {
          step: data.progress.step,
          percentage: data.progress.percentage,
          message: data.progress.message,
          timestamp: data.progress.timestamp,
        },
        timestamp: new Date().toISOString(),
      });

      // Send notification for significant progress milestones
      if (data.progress.percentage === 100 || data.status === 'completed') {
        (request.server.websocket as any).emitNotification(user.id, {
          id: randomUUID(),
          type: 'success',
          title: 'Application Completed',
          message: `Successfully applied to ${application.jobSnapshot?.title} at ${application.jobSnapshot?.companyName}`,
          applicationId: id,
          jobId: application.jobPostingId,
          timestamp: new Date().toISOString(),
          duration: 8000,
          actions: [
            {
              label: 'View Details',
              action: `navigate:/applications/${id}`,
              variant: 'primary'
            }
          ]
        });
      } else if (data.status === 'failed') {
        (request.server.websocket as any).emitNotification(user.id, {
          id: randomUUID(),
          type: 'error',
          title: 'Application Failed',
          message: `Failed to apply to ${application.jobSnapshot?.title}: ${data.progress.message}`,
          applicationId: id,
          jobId: application.jobPostingId,
          timestamp: new Date().toISOString(),
          duration: 10000,
          actions: [
            {
              label: 'Retry',
              action: `retry:${id}`,
              variant: 'primary'
            },
            {
              label: 'View Details',
              action: `navigate:/applications/${id}`,
              variant: 'secondary'
            }
          ]
        });
      }
    }

    return reply.send({
      success: true,
      message: 'Progress update received and broadcasted',
      data: {
        applicationId: id,
        status: data.status,
        progress: data.progress.percentage,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    request.server.log.error('Progress update error:', error);
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
    
    // Get automation service stats if available
    let automationServiceStats = null;
    if (request.server.automationService) {
      try {
        automationServiceStats = await request.server.automationService.getQueueStats();
      } catch (error) {
        request.server.log.warn('Failed to get automation service stats:', error);
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
      automation: automationServiceStats,
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
  fastify.post('/apply', {
    schema: {
      // summary: 'Queue job application when user applies to a job',
      // description: 'Creates a job application queue entry when user applies to a job',
      // tags: ['Queue'],
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
  }, applyHandler);

  // Backward compatibility alias - TODO: Remove after client migration
  fastify.post('/swipe-right', {
    schema: {
      // summary: '[DEPRECATED] Use /apply instead',
      // description: 'Legacy endpoint - use /apply instead',
      // tags: ['Queue', 'Deprecated'],
      // deprecated: true,
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
      }
    }
  }, applyHandler);
  
  // Get user applications
  fastify.get('/applications', {
    schema: {
      // summary: 'Get user job applications from queue',
      // description: 'Retrieves paginated list of user job applications',
      // tags: ['Queue'],
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
      // summary: 'Get specific job application details',
      // description: 'Retrieves detailed information about a specific job application',
      // tags: ['Queue'],
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
      // summary: 'Perform action on job application',
      // description: 'Cancel, retry, or prioritize a job application',
      // tags: ['Queue'],
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
      // summary: 'Get queue statistics for user',
      // description: 'Retrieves queue statistics and recent application activity',
      // tags: ['Queue'],
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

  // Progress updates from desktop app
  fastify.post('/applications/:id/progress', {
    schema: {
      // summary: 'Update application progress from desktop automation',
      // description: 'Receives progress updates from desktop app and broadcasts via WebSocket',
      // tags: ['Queue'],
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
          applicationId: { type: 'string', format: 'uuid' },
          progress: {
            type: 'object',
            properties: {
              step: { type: 'string' },
              percentage: { type: 'number', minimum: 0, maximum: 100 },
              message: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
            },
            required: ['step', 'percentage', 'message', 'timestamp'],
          },
          status: {
            type: 'string',
            enum: ['starting', 'processing', 'completed', 'failed', 'cancelled']
          },
          executionId: { type: 'string' },
        },
        required: ['applicationId', 'progress', 'status'],
      },
    },
  }, progressUpdateHandler);

  // Queue position endpoint
  fastify.get('/applications/:id/position', {
    schema: {
      // summary: 'Get queue position for application',
      // description: 'Returns the current position and estimated time for an application in the queue',
      // tags: ['Queue'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
    },
  }, queuePositionHandler);

  // Queue position updates from desktop app
  fastify.post('/applications/:id/queue-position', {
    schema: {
      // summary: 'Update queue position from desktop app',
      // description: 'Receives queue position updates from desktop app and broadcasts via WebSocket',
      // tags: ['Queue'],
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
          position: { type: 'number', minimum: 0 },
          estimatedTime: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
        },
        required: ['position', 'estimatedTime', 'timestamp'],
      },
    },
  }, queuePositionUpdateHandler);
}

export default registerQueueRoutes;