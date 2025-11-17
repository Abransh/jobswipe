 /**
 * @fileoverview Automation API Routes
 * @description Simplified automation endpoints for the new Python-based system
 * @version 1.0.1
 * @author JobSwipe Team
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { QueueStatus } from '@jobswipe/database';

// -----------------------------------------------------------------------------
// Type Augmentation for Fastify decorations used in handlers
// Note: Main service types are declared in services.plugin.ts
// Only declare types that are NOT in services.plugin.ts
// -----------------------------------------------------------------------------

declare module 'fastify' {
  interface FastifyInstance {
    // These are already declared in their respective plugins:
    // - automationService (services.plugin.ts)
    // - serverAutomationService (services.plugin.ts)
    // - proxyRotator (services.plugin.ts)
    // - automationLimits (services.plugin.ts)
    // - websocket (websocket.plugin.ts)

    // Additional decorations only used in routes
    auth?: any;
    requireRole?: (role: string) => any;
    generateId: () => string;
  }
  interface FastifyRequest {
    // user is already declared in auth.middleware.ts as AuthenticatedUser
  }
}

// -----------------------------------------------------------------------------
// SCHEMAS & VALIDATION (Zod)
// -----------------------------------------------------------------------------

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
  phone: z.string(), // Required field per JobApplicationData interface
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
  options: z
    .object({
      headless: z.boolean().optional(),
      timeout: z.number().optional(),
      maxRetries: z.number().optional()
    })
    .optional()
});

const TriggerAutomationSchema = z.object({
  applicationId: z.string(),
  userId: z.string(),
  jobId: z.string().optional(),
  jobData: JobDataSchema,
  userProfile: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(), // Required field per JobApplicationData interface
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
  steps: z.array(
    z.object({
      stepName: z.string(),
      action: z.string().optional(),
      success: z.boolean(),
      timestamp: z.string(),
      durationMs: z.number().optional(),
      errorMessage: z.string().optional()
    })
  ),
  screenshots: z.array(z.string()).optional().default([]),
  captchaEvents: z
    .array(
      z.object({
        captchaType: z.string(),
        detectedAt: z.string(),
        resolved: z.boolean(),
        resolutionMethod: z.string().optional()
      })
    )
    .optional()
    .default([])
});

// -----------------------------------------------------------------------------
// ROUTE REGISTRATION
// -----------------------------------------------------------------------------

export async function automationRoutes(fastify: FastifyInstance) {
  // ---------------------------------------------------------------------------
  // POST /automation/trigger
  // ---------------------------------------------------------------------------
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
              applyUrl: { type: 'string', format: 'uri' },
              location: { type: 'string' },
              description: { type: 'string' }
            }
          },
          userProfile: {
            type: 'object',
            required: ['firstName', 'lastName', 'email'],
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string', format: 'email' },
              phone: { type: 'string' },
              resumeUrl: { type: 'string' },
              currentTitle: { type: 'string' },
              yearsExperience: { type: 'number' },
              skills: { type: 'array', items: { type: 'string' } },
              location: { type: 'string' },
              workAuthorization: { type: 'string' },
              linkedinUrl: { type: 'string' }
            }
          },
          executionMode: { type: 'string', enum: ['server', 'desktop'] },
          priority: { type: 'number' }
        }
      }
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const parse = TriggerAutomationSchema.safeParse(request.body);
        if (!parse.success) {
          return reply.code(400).send({
            success: false,
            error: 'Validation failed',
            details: parse.error.flatten()
          });
        }

        const { applicationId, userId, jobId, jobData, userProfile, executionMode, priority } = parse.data;

        fastify.log.info('🤖 Automation trigger received:', {
          applicationId,
          userId,
          jobId,
          jobTitle: jobData.title,
          company: jobData.company,
          executionMode
        });

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
            priority: priority ?? 5,
            application_id: applicationId
          }
        } as any;

        if (!fastify.automationService) {
          fastify.log.error('❌ AutomationService not available');
          return reply.code(503).send({
            success: false,
            error: 'Automation service not available',
            details: { serviceStatus: 'unavailable' }
          });
        }

        if (executionMode === 'server' && !fastify.serverAutomationService) {
          fastify.log.warn('⚠️ ServerAutomationService not available, queuing for desktop');
          automationData.options.execution_mode = 'desktop';
        }

        // queueApplication returns the applicationId as a string
        const queuedApplicationId = await fastify.automationService.queueApplication(automationData);

        fastify.log.info('✅ Automation queued successfully:', {
          automationId: queuedApplicationId,
          status: 'QUEUED',
          executionMode: automationData.options.execution_mode
        });

        if (fastify.websocket) {
          fastify.websocket.emitToUser(userId, 'automation-queued', {
            applicationId: queuedApplicationId,
            automationId: queuedApplicationId,
            status: 'queued',
            executionMode: automationData.options.execution_mode,
            jobTitle: jobData.title,
            company: jobData.company,
            timestamp: new Date().toISOString()
          });
        }

        return reply.send({
          success: true,
          automationId: queuedApplicationId,
          status: 'QUEUED',
          executionMode: automationData.options.execution_mode,
          message: `Automation queued for ${automationData.options.execution_mode} execution`
        });
      } catch (error: any) {
        fastify.log.error('❌ Automation trigger failed:', error);
        let errorCode = 'AUTOMATION_ERROR';
        let statusCode = 500;

        if (error instanceof z.ZodError) {
          errorCode = 'VALIDATION_ERROR';
          statusCode = 400;
        } else if (error?.message?.includes('not available')) {
          errorCode = 'SERVICE_UNAVAILABLE';
          statusCode = 503;
        }

        return reply.code(statusCode).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to trigger automation',
          details: {
            errorCode,
            applicationId: (request.body as any)?.applicationId,
            timestamp: new Date().toISOString()
          }
        });
      }
    }
  });

  // ---------------------------------------------------------------------------
  // POST /automation/execute
  // ---------------------------------------------------------------------------
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
      }
    },
    preHandler: fastify.auth,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const parse = ExecuteAutomationRequestSchema.safeParse(request.body);
        if (!parse.success) {
          return reply.code(400).send({ success: false, error: 'Validation failed' });
        }

        const { userId, jobData, userProfile, options } = parse.data;

        if (request.user?.id !== userId) {
          return reply.code(403).send({ success: false, error: 'Access denied' });
        }

        // TypeScript assertion: Zod schema validation ensures these types are correct
        const applicationId = await fastify.automationService.queueApplication({
          userId,
          jobData: jobData as { id: string; title: string; company: string; applyUrl: string; location?: string; description?: string; requirements?: string[] },
          userProfile: userProfile as { firstName: string; lastName: string; email: string; phone: string; resumeUrl?: string; resumeLocalPath?: string; currentTitle?: string; yearsExperience?: number; skills?: string[]; currentLocation?: string; linkedinUrl?: string; workAuthorization?: string; coverLetter?: string; customFields?: Record<string, any> },
          options: options || {}
        });

        const queueStats = await fastify.automationService.getQueueStats();

        return reply.send({
          success: true,
          data: {
            applicationId,
            jobId: jobData.id,
            userId,
            queuePosition: (queueStats?.pending ?? 0) + 1,
            estimatedTime: (queueStats?.averageProcessingTime ?? 0) * ((queueStats?.pending ?? 0) + 1)
          }
        });
      } catch (error: any) {
        fastify.log.error('Automation execution failed:', error);
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        });
      }
    }
  });

  // ---------------------------------------------------------------------------
  // POST /automation/server-execute
  // ---------------------------------------------------------------------------
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
      }
    },
    preHandler: fastify.auth,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const parse = ExecuteAutomationRequestSchema.safeParse(request.body);
        if (!parse.success) {
          return reply.code(400).send({ success: false, error: 'Validation failed' });
        }

        const { userId, jobData, userProfile, options } = parse.data;

        if (request.user?.id !== userId) {
          return reply.code(403).send({ success: false, error: 'Access denied', upgradeRequired: false });
        }

        const eligibility = await fastify.automationLimits.checkServerEligibility(userId);
        if (!eligibility.allowed) {
          return reply.code(403).send({
            success: false,
            error: eligibility.reason || 'Server automation not available',
            upgradeRequired: eligibility.upgradeRequired,
            suggestedAction: eligibility.suggestedAction
          });
        }

        const applicationId = fastify.generateId();
        // TypeScript assertion: Zod schema validation ensures these types are correct
        const serverRequest = {
          userId,
          jobId: jobData.id!,
          applicationId,
          companyAutomation: fastify.automationService.detectCompanyAutomation(jobData.applyUrl!),
          userProfile: userProfile as { firstName: string; lastName: string; email: string; phone: string; resumeUrl?: string; currentTitle?: string; yearsExperience?: number; skills?: string[]; currentLocation?: string; linkedinUrl?: string; workAuthorization?: string; coverLetter?: string; customFields?: Record<string, any> },
          jobData: jobData as { id: string; title: string; company: string; applyUrl: string; location?: string; description?: string; requirements?: string[] },
          options: options || {}
        };

        const result = await fastify.serverAutomationService!.executeAutomation(serverRequest);
        await fastify.automationLimits.recordServerApplication(userId);

        return reply.send({
          success: true,
          data: { applicationId, jobId: jobData.id, userId, result }
        });
      } catch (error: any) {
        fastify.log.error('Server automation execution failed:', error);
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
          upgradeRequired: false
        });
      }
    }
  });

  // ---------------------------------------------------------------------------
  // GET /automation/limits
  // ---------------------------------------------------------------------------
  fastify.get('/automation/limits', {
    schema: {
      description: 'Get user automation limits and server eligibility',
      tags: ['automation']
    },
    preHandler: fastify.auth,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user!.id;
        const eligibility = await fastify.automationLimits.checkServerEligibility(userId);
        const userStats = fastify.automationLimits.getUserStats(userId);

        return reply.send({
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
        });
      } catch (error: any) {
        fastify.log.error('Failed to get automation limits:', error);
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        });
      }
    }
  });

  // ---------------------------------------------------------------------------
  // GET /automation/proxy-stats
  // ---------------------------------------------------------------------------
  fastify.get('/automation/proxy-stats', {
    schema: {
      description: 'Get proxy rotation statistics',
      tags: ['automation', 'admin']
    },
    preHandler: fastify.auth && fastify.requireRole ? [fastify.auth, fastify.requireRole('admin')] : [],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const stats = fastify.proxyRotator?.getUsageStats() ?? {};
        return reply.send({ success: true, data: stats });
      } catch (error: any) {
        fastify.log.error('Failed to get proxy stats:', error);
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        });
      }
    }
  });

  // ---------------------------------------------------------------------------
  // GET /automation/status/:applicationId
  // ---------------------------------------------------------------------------
  fastify.get('/automation/status/:applicationId', {
    schema: {
      description: 'Get status of job application automation',
      tags: ['automation']
    },
    preHandler: fastify.auth,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { applicationId } = request.params as { applicationId: string };
        const applicationStatus = await fastify.automationService.getApplicationStatus(applicationId);

        if (applicationStatus.userId !== request.user!.id) {
          return reply.code(403).send({ success: false, error: 'Access denied' });
        }

        return reply.send({ success: true, data: applicationStatus });
      } catch (error: any) {
        fastify.log.error('Failed to get automation status:', error);
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        });
      }
    }
  });

  // ---------------------------------------------------------------------------
  // GET /automation/queue
  // ---------------------------------------------------------------------------
  fastify.get('/automation/queue', {
    schema: {
      description: 'Get automation queue statistics',
      tags: ['automation']
    },
    preHandler: fastify.auth,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const queueStats = await fastify.automationService.getQueueStats();
        return reply.send({ success: true, data: queueStats });
      } catch (error: any) {
        fastify.log.error('Failed to get queue status:', error);
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        });
      }
    }
  });

  // ---------------------------------------------------------------------------
  // GET /automation/history
  // ---------------------------------------------------------------------------
  fastify.get('/automation/history', {
    schema: {
      description: 'Get user automation history',
      tags: ['automation']
    },
    preHandler: fastify.auth,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { limit = 50, offset = 0, status = 'all' } = request.query as {
          limit?: number;
          offset?: number;
          status?:
            | 'all'
            | 'PENDING'
            | 'QUEUED'
            | 'PROCESSING'
            | 'COMPLETED'
            | 'FAILED'
            | 'CANCELLED'
            | 'RETRYING'
            | 'PAUSED'
            | 'REQUIRES_CAPTCHA';
        };

        const history = await fastify.automationService.getUserAutomationHistory(request.user!.id, {
          limit,
          offset,
          status
        });

        return reply.send({ success: true, data: history });
      } catch (error: any) {
        fastify.log.error('Failed to get automation history:', error);
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        });
      }
    }
  });

  // ---------------------------------------------------------------------------
  // DELETE /automation/:applicationId
  // ---------------------------------------------------------------------------
  fastify.delete('/automation/:applicationId', {
    schema: {
      description: 'Cancel a queued or running automation',
      tags: ['automation']
    },
    preHandler: fastify.auth,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { applicationId } = request.params as { applicationId: string };
        const result = await fastify.automationService.cancelApplication(applicationId, request.user!.id);
        return reply.send({ success: true, data: result });
      } catch (error: any) {
        fastify.log.error('Failed to cancel automation:', error);
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        });
      }
    }
  });

  // ---------------------------------------------------------------------------
  // GET /automation/companies
  // ---------------------------------------------------------------------------
  fastify.get('/automation/companies', {
    schema: {
      description: 'Get list of supported companies for automation',
      tags: ['automation']
    },
    handler: async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const supportedCompanies = await fastify.automationService.getSupportedCompanies();
        return reply.send({
          success: true,
          data: {
            companies: supportedCompanies,
            totalSupported: Object.keys(supportedCompanies || {}).length
          }
        });
      } catch (error: any) {
        fastify.log.error('Failed to get supported companies:', error);
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        });
      }
    }
  });

  // ---------------------------------------------------------------------------
  // GET /automation/health
  // ---------------------------------------------------------------------------
  fastify.get('/automation/health', {
    schema: {
      description: 'Get automation system health status',
      tags: ['automation', 'health']
    },
    handler: async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const healthStatus = await fastify.automationService.getHealthStatus();
        // Optionally validate with Zod to enforce shape
        const parsed = z
          .object({
            status: z.enum(['healthy', 'degraded', 'unhealthy']),
            activeProcesses: z.number(),
            queueHealth: z.object({ pending: z.number(), processing: z.number(), failed: z.number() }),
            systemInfo: z.object({
              uptime: z.number(),
              memoryUsage: z.number(),
              supportedCompanies: z.array(z.string())
            }),
            issues: z.array(z.string()).optional()
          })
          .safeParse(healthStatus);

        return reply.send({ success: true, data: parsed.success ? parsed.data : healthStatus });
      } catch (error: any) {
        fastify.log.error('Failed to get automation health:', error);
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        });
      }
    }
  });
}
