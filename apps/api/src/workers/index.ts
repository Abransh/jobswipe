/**
 * @fileoverview Worker Manager for JobSwipe Queue Processing
 * @description Manages BullMQ workers for job application processing
 * @version 1.0.0
 * 
 * @author JobSwipe Team
 */

import { createJobApplicationWorker, JobApplicationWorker, WorkerConfig } from './job-application.worker';

// =============================================================================
// WORKER MANAGER CLASS
// =============================================================================

export class WorkerManager {
  private workers: Map<string, JobApplicationWorker> = new Map();
  private isRunning = false;

  /**
   * Initialize and start all workers
   */
  async initialize(db?: any, websocketService?: any): Promise<void> {
    console.log('🏭 Initializing worker manager...');

    const config: WorkerConfig = {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '1'), // Use queue DB
      },
      queues: {
        applications: process.env.QUEUE_APPLICATIONS_NAME || 'job-applications',
        priority: process.env.QUEUE_PRIORITY_NAME || 'job-applications-priority',
      },
      desktop: {
        websocketPort: parseInt(process.env.DESKTOP_WS_PORT || '8080'),
        heartbeatInterval: parseInt(process.env.DESKTOP_HEARTBEAT_INTERVAL || '30000'), // 30 seconds
        jobTimeout: parseInt(process.env.DESKTOP_JOB_TIMEOUT || '300000'), // 5 minutes
        maxRetries: parseInt(process.env.DESKTOP_MAX_RETRIES || '3'),
      },
      processing: {
        concurrency: parseInt(process.env.WORKER_CONCURRENCY || '3'),
        stalledInterval: parseInt(process.env.WORKER_STALLED_INTERVAL || '30000'),
        maxStalledCount: parseInt(process.env.WORKER_MAX_STALLED_COUNT || '1'),
      },
    };

    try {
      // Create and initialize job application worker
      const jobWorker = createJobApplicationWorker(config, db, websocketService);
      await jobWorker.initialize();
      
      this.workers.set('job-applications', jobWorker);
      this.isRunning = true;

      console.log('✅ Worker manager initialized successfully');
      console.log(`🖥️ Desktop WebSocket server: ws://localhost:${config.desktop.websocketPort}`);
      console.log(`⚙️ Worker concurrency: ${config.processing.concurrency}`);
      console.log(`📡 Processing queues: ${config.queues.applications}, ${config.queues.priority}`);
    } catch (error) {
      console.error('❌ Failed to initialize worker manager:', error);
      throw error;
    }
  }

  /**
   * Get worker statistics
   */
  async getStats() {
    const stats: Record<string, any> = {
      isRunning: this.isRunning,
      workerCount: this.workers.size,
      workers: {},
    };

    for (const [name, worker] of this.workers.entries()) {
      try {
        stats.workers[name] = await worker.getStats();
      } catch (error) {
        stats.workers[name] = { error: 'Failed to get stats' };
      }
    }

    return stats;
  }

  /**
   * Get worker by name
   */
  getWorker(name: string): JobApplicationWorker | undefined {
    return this.workers.get(name);
  }

  /**
   * Check if workers are healthy
   */
  async getHealthStatus() {
    const health = {
      status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
      workers: {} as Record<string, any>,
      summary: {
        total: this.workers.size,
        healthy: 0,
        degraded: 0,
        unhealthy: 0,
      },
    };

    for (const [name, worker] of this.workers.entries()) {
      try {
        const stats = await worker.getStats();
        const workerHealth = {
          status: stats.isRunning ? 'healthy' : 'unhealthy',
          desktopClients: stats.desktopClients,
          activeJobs: stats.processing.activeJobs,
          lastCheck: new Date().toISOString(),
        };

        health.workers[name] = workerHealth;
        
        if (workerHealth.status === 'healthy') {
          health.summary.healthy++;
        } else {
          health.summary.unhealthy++;
        }
      } catch (error) {
        health.workers[name] = {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
          lastCheck: new Date().toISOString(),
        };
        health.summary.unhealthy++;
      }
    }

    // Determine overall health
    if (health.summary.unhealthy > 0) {
      health.status = health.summary.healthy > 0 ? 'degraded' : 'unhealthy';
    }

    return health;
  }

  /**
   * Shutdown all workers
   */
  async shutdown(): Promise<void> {
    console.log('🏭 Shutting down worker manager...');
    
    this.isRunning = false;

    const shutdownPromises = Array.from(this.workers.values()).map(worker => 
      worker.shutdown()
    );

    try {
      await Promise.all(shutdownPromises);
      this.workers.clear();
      console.log('✅ All workers shut down successfully');
    } catch (error) {
      console.error('❌ Error shutting down workers:', error);
    }
  }
}

// =============================================================================
// SINGLETON WORKER MANAGER
// =============================================================================

let workerManager: WorkerManager | null = null;

/**
 * Get or create the singleton worker manager
 */
export function getWorkerManager(): WorkerManager {
  if (!workerManager) {
    workerManager = new WorkerManager();
  }
  return workerManager;
}

/**
 * Initialize workers (should be called once during server startup)
 */
export async function initializeWorkers(db?: any, websocketService?: any): Promise<WorkerManager> {
  const manager = getWorkerManager();
  await manager.initialize(db, websocketService);
  return manager;
}

// =============================================================================
// EXPORTS
// =============================================================================

export { JobApplicationWorker, createJobApplicationWorker };
export type { WorkerConfig };