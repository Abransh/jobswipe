/**
 * @fileoverview Automation API Routes
 * @description Simplified automation endpoints for the new Python-based system
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

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
   * Execute automation for a job application (unified endpoint)
   */
  fastify.post('/automation/execute', {
    schema: {
      description: 'Execute job application automation',
      tags: ['automation'],
      body: ExecuteAutomationRequestSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            applicationId: z.string(),
            jobId: z.string(),
            userId: z.string(),
            queuePosition: z.number().optional(),
            estimatedTime: z.number().optional()
          })
        }),
        400: z.object({
          success: z.boolean(),
          error: z.string()
        })
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
          });
        }

        // Create application queue entry
        const applicationId = await fastify.automationService.queueApplication({
          userId,
          jobData,
          userProfile,
          options: options || {}
        });

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
        });

      } catch (error) {
        fastify.log.error('Automation execution failed:', error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        });
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
      body: ExecuteAutomationRequestSchema,
      response: {
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
              })),
              proxyUsed: z.string().optional(),
              serverInfo: z.object({
                serverId: z.string(),
                executionMode: z.string()
              })
            })
          })
        }),
        400: z.object({
          success: z.boolean(),
          error: z.string()
        }),
        403: z.object({
          success: z.boolean(),
          error: z.string(),
          upgradeRequired: z.boolean(),
          suggestedAction: z.string().optional()
        })
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
          });
        }

        // Check if user can use server automation
        const eligibility = await fastify.automationLimits.checkServerEligibility(userId);
        if (!eligibility.allowed) {
          return reply.code(403).send({
            success: false,
            error: eligibility.reason || 'Server automation not available',
            upgradeRequired: eligibility.upgradeRequired,
            suggestedAction: eligibility.suggestedAction
          });
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
        });

      } catch (error) {
        fastify.log.error('Server automation execution failed:', error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
          upgradeRequired: false
        });
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
      response: {
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
          })
        })
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
        });

      } catch (error) {
        fastify.log.error('Failed to get automation limits:', error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        });
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
      response: {
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
          })
        })
      }
    },
    preHandler: [fastify.auth, fastify.requireRole('admin')],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const stats = fastify.proxyRotator.getUsageStats();
        
        reply.send({
          success: true,
          data: stats
        });

      } catch (error) {
        fastify.log.error('Failed to get proxy stats:', error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        });
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
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            applicationId: z.string(),
            status: z.enum(['queued', 'processing', 'completed', 'failed']),
            progress: z.number(),
            result: AutomationResultSchema.optional(),
            queuePosition: z.number().optional(),
            estimatedTime: z.number().optional()
          })
        })
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
          });
        }

        reply.send({
          success: true,
          data: applicationStatus
        });

      } catch (error) {
        fastify.log.error('Failed to get automation status:', error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        });
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
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            pending: z.number(),
            processing: z.number(),
            completed: z.number(),
            failed: z.number(),
            averageProcessingTime: z.number(),
            supportedCompanies: z.array(z.string())
          })
        })
      }
    },
    preHandler: fastify.auth,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const queueStats = await fastify.automationService.getQueueStats();
        
        reply.send({
          success: true,
          data: queueStats
        });

      } catch (error) {
        fastify.log.error('Failed to get queue status:', error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        });
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
        status: z.enum(['all', 'completed', 'failed']).optional().default('all')
      }),
      response: {
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
            })),
            total: z.number(),
            hasMore: z.boolean()
          })
        })
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
        });

      } catch (error) {
        fastify.log.error('Failed to get automation history:', error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        });
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
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            cancelled: z.boolean(),
            refunded: z.boolean().optional()
          })
        })
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
        });

      } catch (error) {
        fastify.log.error('Failed to cancel automation:', error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        });
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
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            companies: z.record(z.array(z.string())),
            totalSupported: z.number()
          })
        })
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
        });

      } catch (error) {
        fastify.log.error('Failed to get supported companies:', error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        });
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
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            status: z.enum(['healthy', 'degraded', 'unhealthy']),
            activeProcesses: z.number(),
            queueHealth: z.object({
              pending: z.number(),
              processing: z.number(),
              failed: z.number()
            }),
            systemInfo: z.object({
              uptime: z.number(),
              memoryUsage: z.number(),
              supportedCompanies: z.array(z.string())
            }),
            issues: z.array(z.string()).optional()
          })
        })
      }
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const healthStatus = await fastify.automationService.getHealthStatus();
        
        reply.send({
          success: true,
          data: healthStatus
        });

      } catch (error) {
        fastify.log.error('Failed to get automation health:', error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        });
      }
    }
  });
}