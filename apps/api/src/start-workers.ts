/**
 * @fileoverview Worker Startup Script
 * @description Starts BullMQ workers alongside the main server
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { initializeWorkers, getWorkerManager } from './workers';

// =============================================================================
// WORKER STARTUP
// =============================================================================

/**
 * Start workers with proper error handling
 */
export async function startWorkers(db?: any, websocketService?: any): Promise<void> {
  try {
    console.log('🏭 Starting JobSwipe workers...');
    
    const workerManager = await initializeWorkers(db, websocketService);
    
    console.log('✅ All workers started successfully');
    
    // Setup graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('🛑 SIGTERM received, shutting down workers...');
      await workerManager.shutdown();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      console.log('🛑 SIGINT received, shutting down workers...');
      await workerManager.shutdown();
      process.exit(0);
    });
    
    // Health check endpoint for workers (if needed)
    return;
    
  } catch (error) {
    console.error('❌ Failed to start workers:', error);
    process.exit(1);
  }
}

/**
 * Add worker routes to existing Fastify server
 */
export function registerWorkerRoutes(fastify: any) {
  // Worker health check
  fastify.get('/health/workers', async (request: any, reply: any) => {
    try {
      const workerManager = getWorkerManager();
      const health = await workerManager.getHealthStatus();
      
      const statusCode = health.status === 'healthy' ? 200 : 503;
      
      return reply.code(statusCode).send({
        status: health.status,
        timestamp: new Date().toISOString(),
        workers: health,
      });
    } catch (error) {
      return reply.code(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Worker health check failed',
      });
    }
  });
  
  // Worker statistics
  fastify.get('/workers/stats', async (request: any, reply: any) => {
    try {
      const workerManager = getWorkerManager();
      const stats = await workerManager.getStats();
      
      return reply.send({
        timestamp: new Date().toISOString(),
        stats,
      });
    } catch (error) {
      return reply.code(500).send({
        error: error instanceof Error ? error.message : 'Failed to get worker stats',
        timestamp: new Date().toISOString(),
      });
    }
  });
}