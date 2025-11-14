/**
 * @fileoverview Automation Plugin
 * @description Fastify plugin to register automation services and routes
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { automationRoutes } from '../routes/automation.routes';

// Type declaration removed - already declared in services.plugin.ts

async function automationPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // Use the automation service already created and decorated by services.plugin.ts
  const automationService = fastify.automationService;

  // Verify service is available
  if (!automationService) {
    throw new Error('AutomationService not available. Ensure services plugin is loaded first.');
  }
  
  // Setup event listeners for logging
  automationService.on('application-queued', (application) => {
    fastify.log.info(`Application queued: ${application.applicationId} for user ${application.userId}`);
  });
  
  automationService.on('application-processing', (application) => {
    fastify.log.info(`Application processing started: ${application.applicationId}`);
  });
  
  automationService.on('application-completed', (application) => {
    fastify.log.info(`Application completed: ${application.applicationId} - ${application.result?.success ? 'SUCCESS' : 'FAILED'}`);
  });
  
  automationService.on('application-failed', (application) => {
    fastify.log.error(`Application failed: ${application.applicationId} - ${application.result?.error}`);
  });
  
  automationService.on('application-cancelled', (application) => {
    fastify.log.info(`Application cancelled: ${application.applicationId}`);
  });
  
  // Register routes
  await fastify.register(automationRoutes, { prefix: '/api/v1' });
  
  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    fastify.log.info('Shutting down automation service...');
    // Add any cleanup logic here
  });
}

export default fp(automationPlugin as any, {
  name: 'automation',
  dependencies: ['services'] // Ensure services plugin is loaded first
});