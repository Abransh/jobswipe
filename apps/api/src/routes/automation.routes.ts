/**
 * @fileoverview Automation API Routes
 * @description Simplified automation endpoints for the new Python-based system
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { QueueStatus } from '@jobswipe/database';

// =============================================================================
// SCHEMAS & VALIDATION
// =============================================================================

const JobDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  applyUrl: z.string().url(),
  location: z.string().optional(),
  description: z.string().optional(),
  requirements: z.array(z.string()).optional()
});

const UserProfileSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  resumeUrl: z.string().optional(),
  resumeLocalPath: z.string().optional(),
  currentTitle: z.string().optional(),
  yearsExperience: z.number().optional(),
  skills: z.array(z.string()).optional(),
  currentLocation: z.string().optional(),
  linkedinUrl: z.string().optional(),
  workAuthorization: z.string().optional(),
  coverLetter: z.string().optional(),
  customFields: z.record(z.any()).optional()
});

const ExecuteAutomationRequestSchema = z.object({
  userId: z.string(),
  jobData: JobDataSchema,
  userProfile: UserProfileSchema,
  options: z.object({
    headless: z.boolean().optional(),
    timeout: z.number().optional(),
    maxRetries: z.number().optional()
  }).optional()
});

const TriggerAutomationSchema = z.object({
  applicationId: z.string(),
  userId: z.string(),
  jobId: z.string(),
  jobData: JobDataSchema,
  userProfile: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    resumeUrl: z.string().optional(),
    currentTitle: z.string().optional(),
    yearsExperience: z.number().optional(),
    skills: z.array(z.string()).optional(),
    location: z.string().optional(),
    workAuthorization: z.string().optional(),
    linkedinUrl: z.string().optional()
  }),
  executionMode: z.enum(['server', 'desktop']),
  priority: z.number().optional().default(5)
});

const AutomationResultSchema = z.object({
  applicationId: z.string(),
  success: z.boolean(),
  confirmationNumber: z.string().optional(),
  error: z.string().optional(),
  executionTime: z.number(),
  companyAutomation: z.string(),
  status: z.string(),
  steps: z.array(z.object({
    stepName: z.string(),
    action: z.string(),
    success: z.boolean(),
    timestamp: z.string(),
    durationMs: z.number().optional(),
    errorMessage: z.string().optional()
  })),
  screenshots: z.array(z.string()),
  captchaEvents: z.array(z.object({
    captchaType: z.string(),
    detectedAt: z.string(),
    resolved: z.boolean(),
    resolutionMethod: z.string().optional()
  }))
});

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

export async function automationRoutes(fastify: FastifyInstance) {
  
  /**
   * Trigger automation from Next.js swipe-right action
   * This endpoint is called by the Next.js API route after saving job application to database
   */
  fastify.post('/automation/trigger', {
    schema: {
      description: 'Trigger job application automation from web interface',
      tags: ['automation'],
      body: {
        type: 'object',
        required: ['applicationId', 'userId', 'jobData', 'userProfile', 'executionMode'],
        properties: {
          applicationId: { type: 'string' },
          userId: { type: 'string' },
          jobId: { type: 'string' },
          jobData: {
            type: 'object',
            required: ['id', 'title', 'company', 'applyUrl'],
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              company: { type: 'string' },
              applyUrl: { type: 'string', format: 'uri' }
            }
          },
          userProfile: {
            type: 'object',
            required: ['firstName', 'lastName', 'email'],
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string', format: 'email' }
            }
          },
          executionMode: { type: 'string', enum: ['server', 'desktop'] }
        }
      }
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { applicationId, userId, jobId, jobData, userProfile, executionMode, priority } = 
          request.body as z.infer<typeof TriggerAutomationSchema>;
        
        fastify.log.info('🤖 Automation trigger received:', {
          applicationId,
          userId,
          jobId,
          jobTitle: jobData.title,
          company: jobData.company,
          executionMode
        */};

        // Transform data for AutomationService
        const automationData = {
          userId,
          jobData: {
            job_id: jobData.id,
            title: jobData.title,
            company: jobData.company,
            apply_url: jobData.applyUrl,
            location: jobData.location,
            description: jobData.description
          },
          userProfile: {
            first_name: userProfile.firstName,
            last_name: userProfile.lastName,
            email: userProfile.email,
            phone: userProfile.phone || '',
            resume_url: userProfile.resumeUrl,
            current_title: userProfile.currentTitle,
            years_experience: userProfile.yearsExperience,
            skills: userProfile.skills || [],
            current_location: userProfile.location,
            work_authorization: userProfile.workAuthorization,
            linkedin_url: userProfile.linkedinUrl
          },
          options: {
            execution_mode: executionMode,
            priority: priority || 5,
            application_id: applicationId
          }
        };

        // Check if AutomationService is available
        if (!fastify.automationService) {
          fastify.log.error('❌ AutomationService not available');
          return reply.code(503).send({
            success: false,
            error: 'Automation service not available',
            details: { serviceStatus: 'unavailable' }
          */};
        }

        // Check if ServerAutomationService is available for server execution
        if (executionMode === 'server' && !fastify.serverAutomationService) {
          fastify.log.warn('⚠️ ServerAutomationService not available, queuing for desktop');
          automationData.options.execution_mode = 'desktop';
        }

        // Queue the automation
        const result = await fastify.automationService.queueApplication(automationData);
        
        fastify.log.info('✅ Automation queued successfully:', {
          automationId: result.id,
          status: result.status,
          executionMode: automationData.options.execution_mode
        */};

        // Emit WebSocket event for real-time updates
        if (fastify.websocket) {
          fastify.websocket.emit('automation-queued', {
            userId,
            applicationId,
            automationId: result.id,
            status: 'queued',
            executionMode: automationData.options.execution_mode,
            jobTitle: jobData.title,
            company: jobData.company,
            timestamp: new Date().toISOString()
          */};
        }

        reply.send({
          success: true,
          automationId: result.id,
          status: result.status,
          executionMode: automationData.options.execution_mode,
          message: `Automation queued for ${executionMode} execution`
        */};

      } catch (error) {
        fastify.log.error('❌ Automation trigger failed:', error);
        
        // Determine error type for better client handling
        let errorCode = 'AUTOMATION_ERROR';
        let statusCode = 500;
        
        if (error instanceof z.ZodError) {
          errorCode = 'VALIDATION_ERROR';
          statusCode = 400;
        } else if (error.message?.includes('not available')) {
          errorCode = 'SERVICE_UNAVAILABLE';
          statusCode = 503;
        }
        
        reply.code(statusCode).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to trigger automation',
          details: {
            errorCode,
            applicationId: (request.body as any)?.applicationId,
            timestamp: new Date().toISOString()
          }
        */};
      }
    }
  });

  /**
   * Execute automation for a job application (unified endpoint)
   */
  fastify.post('/automation/execute', {
    schema: {
      description: 'Execute job application automation',
      tags: ['automation'],
      body: {
        type: 'object',
        required: ['userId', 'jobData', 'userProfile'],
        properties: {
          userId: { type: 'string' },
          jobData: {
            type: 'object',
            required: ['id', 'title', 'company', 'applyUrl'],
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              company: { type: 'string' },
              applyUrl: { type: 'string' }
            }
          },
          userProfile: {
            type: 'object',
            required: ['firstName', 'lastName', 'email'],
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string', format: 'email' }
            }
          }
        }
      },
      // response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            applicationId: z.string(),
            jobId: z.string(),
            userId: z.string(),
            queuePosition: z.number().optional(),
            estimatedTime: z.number().optional()
          */}
        */},
        400: z.object({
          success: z.boolean(),
          error: z.string()
        */}
      }
    },
    preHandler: fastify.auth,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { userId, jobData, userProfile, options } = request.body as z.infer<typeof ExecuteAutomationRequestSchema>;
        
        // Validate user owns this request
        if (request.user.id !== userId) {
          return reply.code(403).send({
            success: false,
            error: 'Access denied'
          */};
        }

        // Create application queue entry
        const applicationId = await fastify.automationService.queueApplication({
          userId,
          jobData,
          userProfile,
          options: options || {}
        */};

        // Get queue position estimate
        const queueStats = await fastify.automationService.getQueueStats();
        
        reply.send({
          success: true,
          data: {
            applicationId,
            jobId: jobData.id,
            userId,
            queuePosition: queueStats.pending + 1,
            estimatedTime: queueStats.averageProcessingTime * (queueStats.pending + 1)
          }
        */};

      } catch (error) {
        fastify.log.error('Automation execution failed:', error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        */};
      }
    }
  });

  /**
   * Execute automation directly on server (for demo users)
   */
  fastify.post('/automation/server-execute', {
    schema: {
      description: 'Execute job application automation directly on server',
      tags: ['automation'],
      body: {
        type: 'object',
        required: ['userId', 'jobData', 'userProfile'],
        properties: {
          userId: { type: 'string' },
          jobData: {
            type: 'object',
            required: ['id', 'title', 'company', 'applyUrl'],
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              company: { type: 'string' },
              applyUrl: { type: 'string' }
            }
          },
          userProfile: {
            type: 'object',
            required: ['firstName', 'lastName', 'email'],
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string', format: 'email' }
            }
          }
        }
      },
      // response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            applicationId: z.string(),
            jobId: z.string(),
            userId: z.string(),
            result: z.object({
              success: z.boolean(),
              confirmationNumber: z.string().optional(),
              executionTime: z.number(),
              status: z.string(),
              steps: z.array(z.object({
                stepName: z.string(),
                success: z.boolean(),
                timestamp: z.string()
              */}),
              proxyUsed: z.string().optional(),
              serverInfo: z.object({
                serverId: z.string(),
                executionMode: z.string()
              */}
            */}
          */}
        */},
        400: z.object({
          success: z.boolean(),
          error: z.string()
        */},
        403: z.object({
          success: z.boolean(),
          error: z.string(),
          upgradeRequired: z.boolean(),
          suggestedAction: z.string().optional()
        */}
      }
    },
    preHandler: fastify.auth,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { userId, jobData, userProfile, options } = request.body as z.infer<typeof ExecuteAutomationRequestSchema>;
        
        // Validate user owns this request
        if (request.user.id !== userId) {
          return reply.code(403).send({
            success: false,
            error: 'Access denied',
            upgradeRequired: false
          */};
        }

        // Check if user can use server automation
        const eligibility = await fastify.automationLimits.checkServerEligibility(userId);
        if (!eligibility.allowed) {
          return reply.code(403).send({
            success: false,
            error: eligibility.reason || 'Server automation not available',
            upgradeRequired: eligibility.upgradeRequired,
            suggestedAction: eligibility.suggestedAction
          */};
        }

        // Execute server automation directly
        const applicationId = fastify.generateId();
        
        const serverRequest = {
          userId,
          jobId: jobData.id,
          applicationId,
          companyAutomation: fastify.automationService.detectCompanyAutomation(jobData.applyUrl),
          userProfile,
          jobData,
          options: options || {}
        };

        const result = await fastify.serverAutomationService.executeAutomation(serverRequest);
        
        // Record usage
        await fastify.automationLimits.recordServerApplication(userId);

        reply.send({
          success: true,
          data: {
            applicationId,
            jobId: jobData.id,
            userId,
            result
          }
        */};

      } catch (error) {
        fastify.log.error('Server automation execution failed:', error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
          upgradeRequired: false
        */};
      }
    }
  });

  /**
   * Get user automation limits and eligibility
   */
  fastify.get('/automation/limits', {
    schema: {
      description: 'Get user automation limits and server eligibility',
      tags: ['automation'],
      // response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            canUseServerAutomation: z.boolean(),
            remainingServerApplications: z.number(),
            serverApplicationsUsed: z.number(),
            serverApplicationsLimit: z.number(),
            plan: z.string(),
            upgradeRequired: z.boolean(),
            suggestedAction: z.string().optional()
          */}
        */}
      }
    },
    preHandler: fastify.auth,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user.id;
        
        const eligibility = await fastify.automationLimits.checkServerEligibility(userId);
        const userStats = fastify.automationLimits.getUserStats(userId);

        reply.send({
          success: true,
          data: {
            canUseServerAutomation: eligibility.allowed,
            remainingServerApplications: eligibility.remainingServerApplications,
            serverApplicationsUsed: userStats?.serverApplicationsUsed || 0,
            serverApplicationsLimit: userStats?.serverApplicationsLimit || 0,
            plan: userStats?.plan || 'free',
            upgradeRequired: eligibility.upgradeRequired,
            suggestedAction: eligibility.suggestedAction
          }
        */};

      } catch (error) {
        fastify.log.error('Failed to get automation limits:', error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        */};
      }
    }
  });

  /**
   * Get proxy status and statistics
   */
  fastify.get('/automation/proxy-stats', {
    schema: {
      description: 'Get proxy rotation statistics',
      tags: ['automation', 'admin'],
      // response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            totalProxies: z.number(),
            activeProxies: z.number(),
            averageSuccessRate: z.number(),
            totalRequests: z.number(),
            failedRequests: z.number(),
            averageResponseTime: z.number(),
            costToday: z.number()
          */}
        */}
      }
    },
    preHandler: fastify.auth && fastify.requireRole ? [fastify.auth, fastify.requireRole('admin')] : [],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const stats = fastify.proxyRotator.getUsageStats();
        
        reply.send({
          success: true,
          data: stats
        */};

      } catch (error) {
        fastify.log.error('Failed to get proxy stats:', error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        */};
      }
    }
  });

  /**
   * Get automation status
   */
  fastify.get('/automation/status/:applicationId', {
    schema: {
      description: 'Get status of job application automation',
      tags: ['automation'],
      params: z.object({
        applicationId: z.string()
      }),
      // response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            applicationId: z.string(),
            status: z.nativeEnum(QueueStatus),
            progress: z.number(),
            result: AutomationResultSchema.optional(),
            queuePosition: z.number().optional(),
            estimatedTime: z.number().optional()
          */}
        */}
      }
    },
    preHandler: fastify.auth,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { applicationId } = request.params as { applicationId: string };
        
        // Get application status
        const applicationStatus = await fastify.automationService.getApplicationStatus(applicationId);
        
        // Verify user ownership
        if (applicationStatus.userId !== request.user.id) {
          return reply.code(403).send({
            success: false,
            error: 'Access denied'
          */};
        }

        reply.send({
          success: true,
          data: applicationStatus
        */};

      } catch (error) {
        fastify.log.error('Failed to get automation status:', error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        */};
      }
    }
  });

  /**
   * Get automation queue status
   */
  fastify.get('/automation/queue', {
    schema: {
      description: 'Get automation queue statistics',
      tags: ['automation'],
      // response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            pending: z.number(),
            processing: z.number(),
            completed: z.number(),
            failed: z.number(),
            averageProcessingTime: z.number(),
            supportedCompanies: z.array(z.string())
          */}
        */}
      }
    },
    preHandler: fastify.auth,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const queueStats = await fastify.automationService.getQueueStats();
        
        reply.send({
          success: true,
          data: queueStats
        */};

      } catch (error) {
        fastify.log.error('Failed to get queue status:', error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        */};
      }
    }
  });

  /**
   * Get user's automation history
   */
  fastify.get('/automation/history', {
    schema: {
      description: 'Get user automation history',
      tags: ['automation'],
      querystring: z.object({
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
        status: z.enum(['all', 'PENDING', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'RETRYING', 'PAUSED', 'REQUIRES_CAPTCHA']).optional().default('all')
      }),
      // response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            applications: z.array(z.object({
              applicationId: z.string(),
              jobId: z.string(),
              jobTitle: z.string(),
              company: z.string(),
              status: z.string(),
              appliedAt: z.string(),
              confirmationNumber: z.string().optional(),
              error: z.string().optional()
            */}),
            total: z.number(),
            hasMore: z.boolean()
          */}
        */}
      }
    },
    preHandler: fastify.auth,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { limit, offset, status } = request.query as {
          limit: number;
          offset: number;
          status: 'all' | 'completed' | 'failed';
        };
        
        const history = await fastify.automationService.getUserAutomationHistory(
          request.user.id,
          { limit, offset, status }
        );
        
        reply.send({
          success: true,
          data: history
        */};

      } catch (error) {
        fastify.log.error('Failed to get automation history:', error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        */};
      }
    }
  });

  /**
   * Cancel automation
   */
  fastify.delete('/automation/:applicationId', {
    schema: {
      description: 'Cancel a queued or running automation',
      tags: ['automation'],
      params: z.object({
        applicationId: z.string()
      }),
      // response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            cancelled: z.boolean(),
            refunded: z.boolean().optional()
          */}
        */}
      }
    },
    preHandler: fastify.auth,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { applicationId } = request.params as { applicationId: string };
        
        const result = await fastify.automationService.cancelApplication(
          applicationId,
          request.user.id
        );
        
        reply.send({
          success: true,
          data: result
        */};

      } catch (error) {
        fastify.log.error('Failed to cancel automation:', error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        */};
      }
    }
  });

  /**
   * Get supported companies and their URL patterns
   */
  fastify.get('/automation/companies', {
    schema: {
      description: 'Get list of supported companies for automation',
      tags: ['automation'],
      // response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            companies: z.record(z.array(z.string())),
            totalSupported: z.number()
          */}
        */}
      }
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const supportedCompanies = await fastify.automationService.getSupportedCompanies();
        
        reply.send({
          success: true,
          data: {
            companies: supportedCompanies,
            totalSupported: Object.keys(supportedCompanies).length
          }
        */};

      } catch (error) {
        fastify.log.error('Failed to get supported companies:', error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        */};
      }
    }
  });

  /**
   * Health check for automation system
   */
  fastify.get('/automation/health', {
    schema: {
      description: 'Get automation system health status',
      tags: ['automation', 'health'],
      // response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            status: z.enum(['healthy', 'degraded', 'unhealthy']),
            activeProcesses: z.number(),
            queueHealth: z.object({
              pending: z.number(),
              processing: z.number(),
              failed: z.number()
            */},
            systemInfo: z.object({
              uptime: z.number(),
              memoryUsage: z.number(),
              supportedCompanies: z.array(z.string())
            */},
            issues: z.array(z.string()).optional()
          */}
        */}
      }
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const healthStatus = await fastify.automationService.getHealthStatus();
        
        reply.send({
          success: true,
          data: healthStatus
        */};

      } catch (error) {
        fastify.log.error('Failed to get automation health:', error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        */};
      }
    }
  });
}