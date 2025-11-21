/**
 * @fileoverview WebSocket Plugin for Real-time Communication
 * @description Socket.IO integration with authentication and room management
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import fp from 'fastify-plugin';

// =============================================================================
// TYPES
// =============================================================================

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  sessionId?: string;
}

interface WebSocketService {
  io: SocketIOServer;
  emitToUser: (userId: string, event: string, data: any) => void;
  emitToApplication: (applicationId: string, event: string, data: any) => void;
  broadcastQueueUpdate: (event: string, data: any) => void;
  getUserSocketCount: (userId: string) => number;
  emitJobToDesktop: (userId: string, job: any) => void; // NEW: Push jobs to desktop stream
}

declare module 'fastify' {
  interface FastifyInstance {
    websocket: WebSocketService;
  }
}

// =============================================================================
// PLUGIN OPTIONS
// =============================================================================

interface WebSocketPluginOptions {
  redis?: {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
  };
  cors?: {
    origin: string | string[];
    credentials: boolean;
  };
}

// =============================================================================
// WEBSOCKET PLUGIN
// =============================================================================

/**
 * Parse Redis URL for WebSocket plugin
 */
function parseRedisUrlForWebSocket(url: string): any {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : 6379,
      password: parsed.password || undefined,
      db: parsed.pathname && parsed.pathname.length > 1 ? parseInt(parsed.pathname.substring(1), 10) : 0,
      tls: parsed.protocol === 'rediss:' ? {} : undefined,
    };
  } catch (error) {
    console.error('Failed to parse REDIS_URL in websocket plugin:', error);
    throw new Error('Invalid REDIS_URL format');
  }
}

const websocketPlugin = async (
  fastify: any,
  options: WebSocketPluginOptions = {}
): Promise<void> => {
  const log = fastify.log;

  try {
    // Redis configuration for Socket.IO adapter
    // Priority: REDIS_URL > individual env vars > defaults
    let redisConfig: any;
    if (process.env.REDIS_URL) {
      log.info('🔧 WebSocket plugin using REDIS_URL');
      redisConfig = parseRedisUrlForWebSocket(process.env.REDIS_URL);
    } else {
      log.info('🔧 WebSocket plugin using individual Redis env vars');
      redisConfig = {
        host: options.redis?.host || process.env.REDIS_HOST || 'localhost',
        port: options.redis?.port || parseInt(process.env.REDIS_PORT || '6379'),
        password: options.redis?.password || process.env.REDIS_PASSWORD,
        db: options.redis?.db || parseInt(process.env.REDIS_DB || '0'),
      };
    }

    // Create Redis clients for Socket.IO adapter
    const pubClient = new Redis(redisConfig);
    const subClient = pubClient.duplicate();

    // Wait for Redis connections
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        pubClient.once('ready', resolve);
        pubClient.once('error', reject);
      }),
      new Promise<void>((resolve, reject) => {
        subClient.once('ready', resolve);
        subClient.once('error', reject);
      }),
    ]);

    log.info('✅ Redis clients connected for WebSocket adapter');

    // Create Socket.IO server
    const io = new SocketIOServer(fastify.server, {
      cors: {
        origin: options.cors?.origin || process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
        credentials: options.cors?.credentials ?? true,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Authorization'],
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Setup Redis adapter for horizontal scaling
    io.adapter(createAdapter(pubClient, subClient));

    // =============================================================================
    // AUTHENTICATION MIDDLEWARE
    // =============================================================================

    io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token using the existing JWT service
        if (fastify.jwtService) {
          const tokenResult = await fastify.jwtService.verifyToken(token);
          
          if (!tokenResult.valid || !tokenResult.payload) {
            return next(new Error('Invalid or expired token'));
          }

          // Set user information on socket
          socket.userId = tokenResult.payload.sub || tokenResult.payload.userId;
          socket.userEmail = tokenResult.payload.email;
          socket.userRole = tokenResult.payload.role || 'user';
          socket.sessionId = tokenResult.payload.sessionId;

          log.info(`WebSocket authenticated: ${socket.userId} (${socket.userEmail})`);
        } else {
          // Fallback for basic development mode
          if (token.startsWith('basic_')) {
            socket.userId = 'basic-user-id';
            socket.userEmail = 'user@example.com';
            socket.userRole = 'user';
          } else {
            return next(new Error('Authentication service not available'));
          }
        }

        next();
      } catch (error) {
        log.error('WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    // =============================================================================
    // CONNECTION HANDLING
    // =============================================================================

    io.on('connection', (socket: AuthenticatedSocket) => {
      const userId = socket.userId!;
      const userEmail = socket.userEmail!;
      
      log.info(`WebSocket connected: ${userId} (${userEmail}) - Socket: ${socket.id}`);

      // Join user-specific room
      socket.join(`user:${userId}`);

      // Track connection
      socket.emit('connection-confirmed', {
        socketId: socket.id,
        userId,
        timestamp: new Date().toISOString(),
      });

      // =============================================================================
      // APPLICATION SUBSCRIPTION HANDLERS
      // =============================================================================

      socket.on('subscribe-application', (applicationId: string) => {
        if (!applicationId) {
          socket.emit('error', { message: 'Application ID required' });
          return;
        }

        socket.join(`application:${applicationId}`);
        log.debug(`User ${userId} subscribed to application ${applicationId}`);
        
        socket.emit('subscription-confirmed', {
          applicationId,
          type: 'application',
          timestamp: new Date().toISOString(),
        });
      });

      socket.on('unsubscribe-application', (applicationId: string) => {
        if (!applicationId) {
          socket.emit('error', { message: 'Application ID required' });
          return;
        }

        socket.leave(`application:${applicationId}`);
        log.debug(`User ${userId} unsubscribed from application ${applicationId}`);
      });

      // =============================================================================
      // QUEUE STATUS HANDLERS
      // =============================================================================

      socket.on('subscribe-queue-status', () => {
        socket.join(`queue:user:${userId}`);
        log.debug(`User ${userId} subscribed to queue status updates`);
      });

      socket.on('unsubscribe-queue-status', () => {
        socket.leave(`queue:user:${userId}`);
        log.debug(`User ${userId} unsubscribed from queue status updates`);
      });

      // =============================================================================
      // DESKTOP QUEUE STREAM HANDLERS (REPLACES POLLING)
      // =============================================================================

      /**
       * Desktop app subscribes to queue stream for pending jobs
       * This replaces the old polling mechanism
       */
      socket.on('subscribe-queue-stream', async () => {
        try {
          socket.join(`queue-stream:user:${userId}`);
          log.info(`🖥️  Desktop app ${socket.id} subscribed to queue stream for user ${userId}`);

          // Immediately send all pending jobs to desktop (no waiting!)
          if (fastify.db) {
            const pendingApplications = await fastify.db.applicationQueue.findMany({
              where: {
                userId,
                status: { in: ['PENDING', 'QUEUED'] },
                claimedBy: null, // Only unclaimed jobs
              },
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
              orderBy: [
                { priority: 'desc' },
                { createdAt: 'asc' },
              ],
              take: 50,
            });

            if (pendingApplications.length > 0) {
              log.info(`📨 Sending ${pendingApplications.length} pending jobs to desktop app ${socket.id}`);

              // Emit each job individually for processing
              for (const application of pendingApplications) {
                socket.emit('queue-job-available', {
                  id: application.id,
                  jobId: application.jobPostingId,
                  userId: application.userId,
                  status: application.status.toLowerCase(),
                  priority: application.priority.toLowerCase(),
                  useCustomResume: application.useCustomResume,
                  resumeId: application.resumeId || undefined,
                  coverLetter: application.coverLetter || undefined,
                  customFields: application.customFields || {},
                  automationConfig: application.automationConfig || {},
                  job: {
                    title: application.jobSnapshot?.title || 'Unknown Job',
                    company: application.jobSnapshot?.companyName || 'Unknown Company',
                    location: application.jobSnapshot?.location || '',
                    logo: application.jobSnapshot?.companyLogo || undefined,
                    salary: {
                      min: application.jobSnapshot?.salaryMin || undefined,
                      max: application.jobSnapshot?.salaryMax || undefined,
                      currency: application.jobSnapshot?.currency || undefined,
                    },
                    remote: application.jobSnapshot?.remote ?? false,
                    type: application.jobSnapshot?.type || '',
                    url: application.jobSnapshot?.applyUrl || '',
                  },
                  createdAt: application.createdAt.toISOString(),
                  updatedAt: application.updatedAt.toISOString(),
                });
              }

              // Send summary
              socket.emit('queue-stream-initialized', {
                totalPending: pendingApplications.length,
                timestamp: new Date().toISOString(),
                message: 'Queue stream initialized successfully',
              });
            } else {
              // No pending jobs
              socket.emit('queue-stream-initialized', {
                totalPending: 0,
                timestamp: new Date().toISOString(),
                message: 'No pending jobs - queue is empty',
              });
            }
          } else {
            log.warn('Database not available for queue stream');
            socket.emit('error', { message: 'Database service not available' });
          }
        } catch (error) {
          log.error(`Error in subscribe-queue-stream for user ${userId}:`, error);
          socket.emit('error', {
            message: 'Failed to subscribe to queue stream',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      });

      /**
       * Desktop app unsubscribes from queue stream
       */
      socket.on('unsubscribe-queue-stream', () => {
        socket.leave(`queue-stream:user:${userId}`);
        log.info(`🖥️  Desktop app ${socket.id} unsubscribed from queue stream for user ${userId}`);
      });

      /**
       * Desktop app acknowledges receiving a job
       * This helps track which jobs have been claimed
       */
      socket.on('queue-job-claimed', async (data: { applicationId: string }) => {
        try {
          const { applicationId } = data;

          if (!applicationId) {
            socket.emit('error', { message: 'Application ID required' });
            return;
          }

          // Update database to mark job as claimed by desktop
          // ATOMIC UPDATE: Use updateMany with conditional WHERE to prevent race conditions
          if (fastify.db) {
            const claimTime = new Date();

            // Only claim jobs that are in WAITING_FOR_DESKTOP status and not yet claimed
            const result = await fastify.db.applicationQueue.updateMany({
              where: {
                id: applicationId,
                status: 'WAITING_FOR_DESKTOP', // Only claim jobs waiting for desktop
                OR: [
                  { claimedBy: null },           // Not yet claimed
                  { claimedBy: { equals: null } } // Explicitly null
                ]
              },
              data: {
                claimedBy: 'DESKTOP',
                claimedAt: claimTime,
                status: 'PROCESSING',
              },
            });

            // Check if the claim was successful (count > 0 means we claimed it)
            if (result.count === 0) {
              // Job was already claimed by another desktop client or wrong status
              log.warn(`⚠️ Job ${applicationId} already claimed or invalid status (socket: ${socket.id})`);

              socket.emit('queue-job-already-claimed', {
                applicationId,
                message: 'Job was already claimed by another desktop client',
                timestamp: new Date().toISOString(),
              });
              return;
            }

            log.info(`✅ Job ${applicationId} atomically claimed by desktop app ${socket.id}`);

            socket.emit('queue-job-claim-confirmed', {
              applicationId,
              claimedAt: claimTime.toISOString(),
            });
          }
        } catch (error) {
          log.error(`Error claiming job:`, error);
          socket.emit('error', {
            message: 'Failed to claim job',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      });

      // =============================================================================
      // HEARTBEAT
      // =============================================================================

      socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date().toISOString() });
      });

      // =============================================================================
      // DISCONNECTION HANDLING
      // =============================================================================

      socket.on('disconnect', (reason) => {
        log.info(`WebSocket disconnected: ${userId} (${userEmail}) - Reason: ${reason}`);
      });

      socket.on('error', (error) => {
        log.error(`WebSocket error for user ${userId}:`, error);
      });
    });

    // =============================================================================
    // SERVICE METHODS
    // =============================================================================

    const websocketService: WebSocketService = {
      io,

      // Emit to all sockets of a specific user
      emitToUser: (userId: string, event: string, data: any) => {
        io.to(`user:${userId}`).emit(event, data);
        log.debug(`Emitted '${event}' to user ${userId}`, data);
      },

      // Emit to all subscribers of a specific application
      emitToApplication: (applicationId: string, event: string, data: any) => {
        io.to(`application:${applicationId}`).emit(event, {
          ...data,
          applicationId,
          timestamp: new Date().toISOString(),
        });
        log.debug(`Emitted '${event}' to application ${applicationId}`, data);
      },

      // Broadcast queue update to all connected users
      broadcastQueueUpdate: (event: string, data: any) => {
        io.emit(event, {
          ...data,
          timestamp: new Date().toISOString(),
        });
        log.debug(`Broadcasted '${event}'`, data);
      },

      // Get number of active sockets for a user
      getUserSocketCount: (userId: string) => {
        const room = io.sockets.adapter.rooms.get(`user:${userId}`);
        return room ? room.size : 0;
      },

      // NEW: Emit new job to desktop queue stream (replaces polling)
      emitJobToDesktop: (userId: string, job: any) => {
        io.to(`queue-stream:user:${userId}`).emit('queue-job-available', {
          ...job,
          timestamp: new Date().toISOString(),
        });
        log.info(`📨 Pushed new job to desktop stream for user ${userId}: ${job.id}`);
      },
    };

    // Register the service
    fastify.decorate('websocket', websocketService);

    // =============================================================================
    // AUTOMATION EVENT LISTENERS
    // =============================================================================

    // Set up automation event listeners after services are initialized
    const setupAutomationListeners = () => {
      if (fastify.automationService) {
        log.info('Setting up automation event listeners for WebSocket...');
        
        // Application queued event
        fastify.automationService.on('application-queued', (application: any) => {
          const { userId, applicationId } = application;
          websocketService.emitToUser(userId, 'automation-queued', {
            applicationId,
            status: 'queued',
            jobTitle: application.jobData.title,
            company: application.jobData.company,
            queuedAt: application.queuedAt,
            message: 'Job application has been queued for automation'
          });
        });

        // Application processing event
        fastify.automationService.on('application-processing', (application: any) => {
          const { userId, applicationId } = application;
          websocketService.emitToUser(userId, 'automation-processing', {
            applicationId,
            status: 'processing',
            jobTitle: application.jobData.title,
            company: application.jobData.company,
            startedAt: application.startedAt,
            message: 'Job application automation is now processing'
          });
        });

        // Application completed event
        fastify.automationService.on('application-completed', (application: any) => {
          const { userId, applicationId, result } = application;
          websocketService.emitToUser(userId, 'automation-completed', {
            applicationId,
            status: 'completed',
            success: result?.success || false,
            jobTitle: application.jobData.title,
            company: application.jobData.company,
            completedAt: application.completedAt,
            confirmationNumber: result?.confirmationNumber,
            executionTime: result?.executionTime,
            message: result?.success 
              ? 'Job application completed successfully!' 
              : 'Job application automation failed'
          });
        });

        // Application failed event
        fastify.automationService.on('application-failed', (application: any) => {
          const { userId, applicationId, result } = application;
          websocketService.emitToUser(userId, 'automation-failed', {
            applicationId,
            status: 'failed',
            jobTitle: application.jobData.title,
            company: application.jobData.company,
            failedAt: application.completedAt,
            error: result?.error,
            executionTime: result?.executionTime,
            retryAvailable: application.retryCount < 3,
            message: 'Job application automation failed'
          });
        });

        // Application cancelled event
        fastify.automationService.on('application-cancelled', (application: any) => {
          const { userId, applicationId } = application;
          websocketService.emitToUser(userId, 'automation-cancelled', {
            applicationId,
            status: 'cancelled',
            jobTitle: application.jobData.title,
            company: application.jobData.company,
            cancelledAt: new Date().toISOString(),
            message: 'Job application automation was cancelled'
          });
        });

        // Application queued for desktop event
        fastify.automationService.on('application-queued-desktop', (application: any) => {
          const { userId, applicationId } = application;
          websocketService.emitToUser(userId, 'automation-queued-desktop', {
            applicationId,
            status: 'queued-desktop',
            jobTitle: application.jobData.title,
            company: application.jobData.company,
            message: 'Application queued for desktop app - please ensure your desktop app is running'
          });
        });

        log.info('✅ Automation event listeners setup complete');
      } else {
        log.warn('⚠️  AutomationService not available, skipping event listeners setup');
      }
    };

    // Setup listeners after a short delay to ensure services are registered
    setTimeout(setupAutomationListeners, 1000);

    log.info('✅ WebSocket plugin registered successfully');

    // =============================================================================
    // CLEANUP ON CLOSE
    // =============================================================================

    fastify.addHook('onClose', async () => {
      log.info('Closing WebSocket connections...');
      
      // Close Socket.IO server
      await new Promise<void>((resolve) => {
        io.close(() => {
          log.info('Socket.IO server closed');
          resolve();
        });
      });

      // Close Redis clients
      await Promise.all([
        pubClient.quit(),
        subClient.quit(),
      ]);

      log.info('WebSocket cleanup completed');
    });

  } catch (error) {
    log.error('Failed to initialize WebSocket plugin:', error);
    throw error;
  }
}

// =============================================================================
// EXPORT PLUGIN
// =============================================================================

export default fp(websocketPlugin, {
  fastify: '5.x',
  name: 'websocket',
  dependencies: ['services'], // Ensure services plugin loads before WebSocket
});

// =============================================================================
// TYPES EXPORT
// =============================================================================

export type { WebSocketService, AuthenticatedSocket };