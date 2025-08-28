/**
 * Simple Automation Routes for Testing
 * Minimal implementation to test automation trigger functionality
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export async function automationRoutes(fastify: FastifyInstance) {
  
  /**
   * Trigger automation from Next.js swipe-right action
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
              id: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string', format: 'email' },
              phone: { type: 'string' }
            }
          },
          executionMode: { type: 'string', enum: ['server', 'desktop'] },
          priority: { type: 'number' }
        }
      }
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { applicationId, userId, jobId, jobData, userProfile, executionMode, priority } = request.body as any;
        
        fastify.log.info('🤖 Automation trigger received:', {
          applicationId,
          userId,
          jobId,
          jobTitle: jobData.title,
          company: jobData.company,
          executionMode
        });

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
          });
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
        });

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
          });
        }

        reply.send({
          success: true,
          automationId: result.id,
          status: result.status,
          executionMode: automationData.options.execution_mode,
          message: `Automation queued for ${executionMode} execution`
        });

      } catch (error) {
        fastify.log.error('❌ Automation trigger failed:', error);
        
        // Determine error type for better client handling
        let errorCode = 'AUTOMATION_ERROR';
        let statusCode = 500;
        
        if (error.message?.includes('not available')) {
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
        });
      }
    }
  });

  /**
   * Get automation health
   */
  fastify.get('/automation/health', {
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      reply.send({
        success: true,
        status: 'healthy',
        servicesAvailable: {
          automationService: !!fastify.automationService,
          serverAutomationService: !!fastify.serverAutomationService,
          websocket: !!fastify.websocket
        }
      });
    }
  });
}