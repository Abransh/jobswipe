/**
 * @fileoverview Simplified Automation Routes for JobSwipe API
 * @description Essential automation endpoints with proper error handling
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// =============================================================================
// SCHEMAS & VALIDATION
// =============================================================================

const TriggerAutomationSchema = z.object({
  applicationId: z.string().uuid(),
  userId: z.string().uuid(),
  jobId: z.string().uuid(),
  jobData: z.object({
    id: z.string(),
    title: z.string(),
    company: z.string(),
    applyUrl: z.string().url(),
    location: z.string().optional(),
    description: z.string().optional(),
  }),
  userProfile: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    resume: z.object({
      url: z.string().url(),
      content: z.string().optional(),
    }).optional(),
  }),
  executionMode: z.enum(['server', 'desktop']).default('server'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'IMMEDIATE']).default('NORMAL'),
});

const AutomationStatusSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED']),
  progress: z.number().min(0).max(100).optional(),
  message: z.string().optional(),
  executionMode: z.enum(['server', 'desktop']).optional(),
});

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * Trigger job application automation
 */
async function triggerAutomation(
  request: FastifyRequest<{
    Body: {
      applicationId: string;
      userId: string;
      jobId: string;
      jobData: {
        id: string;
        title: string;
        company: string;
        applyUrl: string;
        location?: string;
        description?: string;
      };
      userProfile: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        resume: {
          url: string;
          content?: string;
        };
      };
    }
  }>,
  reply: FastifyReply
) {
  try {
    const { applicationId, userId, jobId, jobData, userProfile, executionMode, priority } = request.body;

    request.log.info('🤖 Automation trigger received:', {
      applicationId,
      userId,
      jobId,
      jobTitle: jobData.title,
      company: jobData.company,
      executionMode
    });

    // Check if automation service is available
    if (!request.server.automationService) {
      request.log.error('❌ Automation service not available');
      return reply.code(503).send({
        success: false,
        error: 'Automation service not available',
        details: { serviceStatus: 'unavailable' }
      });
    }

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
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        phone: userProfile.phone,
        resume: userProfile.resume
      },
      options: {
        execution_mode: executionMode,
        priority: priority.toLowerCase(),
        application_id: applicationId
      }
    };

    // Execute automation
    const result = await request.server.automationService.executeJobApplication(
      automationData.jobData,
      automationData.userProfile,
      automationData.options
    );

    request.log.info('✅ Automation executed successfully:', {
      applicationId,
      status: result.status,
      executionMode: result.executionMode
    });

    return reply.send({
      success: true,
      data: {
        applicationId,
        status: result.status,
        executionMode: result.executionMode,
        message: result.message,
        progress: result.progress || 0
      }
    });

  } catch (error) {
    request.log.error('❌ Automation execution failed:', error);

    return reply.code(500).send({
      success: false,
      error: 'Automation execution failed',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}

/**
 * Get automation status
 */
async function getAutomationStatus(
  request: FastifyRequest<{ Params: { applicationId: string } }>,
  reply: FastifyReply
) {
  try {
    const { applicationId } = request.params;

    // Check if application queue service is available
    if (!request.server.applicationQueue) {
      return reply.code(503).send({
        success: false,
        error: 'Queue service not available'
      });
    }

    // Get application status from queue
    const job = await request.server.applicationQueue.getJob(applicationId);

    if (!job) {
      return reply.code(404).send({
        success: false,
        error: 'Application not found',
        details: { applicationId }
      });
    }

    const status = {
      applicationId,
      status: job.finishedOn ? 'COMPLETED' : job.failedReason ? 'FAILED' : job.processedOn ? 'RUNNING' : 'PENDING',
      progress: job.progress || 0,
      executionMode: job.data?.options?.execution_mode || 'server',
      message: job.failedReason || 'Processing...',
      createdAt: new Date(job.timestamp),
      updatedAt: new Date(job.processedOn || job.timestamp)
    };

    return reply.send({
      success: true,
      data: status
    });

  } catch (error) {
    request.log.error('❌ Failed to get automation status:', error);

    return reply.code(500).send({
      success: false,
      error: 'Failed to get automation status',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}

/**
 * Cancel automation
 */
async function cancelAutomation(
  request: FastifyRequest<{ Params: { applicationId: string } }>,
  reply: FastifyReply
) {
  try {
    const { applicationId } = request.params;

    // Check if application queue service is available
    if (!request.server.applicationQueue) {
      return reply.code(503).send({
        success: false,
        error: 'Queue service not available'
      });
    }

    // Cancel job in queue
    const job = await request.server.applicationQueue.getJob(applicationId);

    if (!job) {
      return reply.code(404).send({
        success: false,
        error: 'Application not found',
        details: { applicationId }
      });
    }

    // Cancel the job
    await job.remove();

    request.log.info('🚫 Automation cancelled:', { applicationId });

    return reply.send({
      success: true,
      data: {
        applicationId,
        status: 'CANCELLED',
        message: 'Automation cancelled successfully'
      }
    });

  } catch (error) {
    request.log.error('❌ Failed to cancel automation:', error);

    return reply.code(500).send({
      success: false,
      error: 'Failed to cancel automation',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}

// =============================================================================
// ROUTES REGISTRATION
// =============================================================================

export async function automationRoutes(fastify: FastifyInstance) {
  // Trigger automation
  fastify.post('/automation/trigger', {
    schema: {
      description: 'Trigger job application automation',
      tags: ['Automation'],
      body: {
        type: 'object',
        required: ['applicationId', 'userId', 'jobId', 'jobData', 'userProfile'],
        properties: {
          applicationId: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          jobId: { type: 'string', format: 'uuid' },
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
              resume: {
                type: 'object',
                required: ['url'],
                properties: {
                  url: { type: 'string', format: 'uri' },
                  content: { type: 'string' }
                }
              }
            }
          },
          executionMode: { type: 'string' },
          priority: { type: 'integer', minimum: 1, maximum: 10 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                applicationId: { type: 'string' },
                status: { type: 'string' },
                executionMode: { type: 'string' },
                message: { type: 'string' },
                progress: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, triggerAutomation);

  // Get automation status
  fastify.get('/automation/status/:applicationId', {
    schema: {
      description: 'Get automation status',
      tags: ['Automation'],
      params: {
        type: 'object',
        properties: {
          applicationId: { type: 'string', format: 'uuid' }
        },
        required: ['applicationId']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              required: ['applicationId', 'status'],
              properties: {
                applicationId: { type: 'string', format: 'uuid' },
                status: { type: 'string', enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'] },
                progress: { type: 'number', minimum: 0, maximum: 100 },
                message: { type: 'string' },
                executionMode: { type: 'string', enum: ['server', 'desktop'] }
              }
            }
          }
        }
      }
    }
  }, getAutomationStatus);

  // Cancel automation
  fastify.delete('/automation/:applicationId', {
    schema: {
      description: 'Cancel automation',
      tags: ['Automation'],
      params: {
        type: 'object',
        properties: {
          applicationId: { type: 'string', format: 'uuid' }
        },
        required: ['applicationId']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                applicationId: { type: 'string' },
                status: { type: 'string' },
                message: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, cancelAutomation);

  fastify.log.info('✅ Automation routes registered');
}

export default automationRoutes;
