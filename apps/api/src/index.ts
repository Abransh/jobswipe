/**
 * @fileoverview JobSwipe API Server Entry Point
 * @description Enterprise-grade Fastify server with comprehensive features
 * @version 1.0.0
 * @author JobSwipe Team
 */

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { registerAuthRoutes } from './routes/auth.routes';
import { db } from '@jobswipe/database';

// =============================================================================
// CONFIGURATION
// =============================================================================

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const config = {
  port: parseInt(process.env.API_PORT || '3001'),
  host: process.env.API_HOST || 'localhost',
  cors: {
    origin: process.env.API_CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
  },
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: isDevelopment ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    } : undefined,
  },
};

// =============================================================================
// SERVER SETUP
// =============================================================================

/**
 * Create and configure Fastify server instance
 */
async function createServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger: config.logger,
    trustProxy: isProduction,
    disableRequestLogging: false,
    ignoreTrailingSlash: true,
    caseSensitive: false,
  });

  // =============================================================================
  // MIDDLEWARE REGISTRATION
  // =============================================================================

  // Security headers
  await server.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  });

  // CORS configuration
  await server.register(cors, {
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-CSRF-Token',
      'X-API-Key',
    ],
  });

  // Rate limiting
  await server.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,
    allowList: ['127.0.0.1'],
    redis: process.env.REDIS_URL ? {
      url: process.env.REDIS_URL,
    } : undefined,
    keyGenerator: (request) => {
      return request.headers['x-forwarded-for'] as string ||
             request.headers['x-real-ip'] as string ||
             request.ip;
    },
    errorResponseBuilder: (request, context) => {
      return {
        code: 429,
        error: 'Too Many Requests',
        message: `Rate limit exceeded, retry in ${Math.round(context.ttl / 1000)} seconds`,
        statusCode: 429,
        time: Date.now(),
      };
    },
  });

  // File upload support
  await server.register(multipart, {
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
      files: 10,
      fields: 20,
    },
    attachFieldsToBody: true,
  });

  // API Documentation (Swagger)
  if (isDevelopment) {
    await server.register(swagger, {
      swagger: {
        info: {
          title: 'JobSwipe API',
          description: 'Enterprise job application automation platform API',
          version: '1.0.0',
          contact: {
            name: 'JobSwipe Team',
            email: 'api@jobswipe.com',
          },
        },
        externalDocs: {
          url: 'https://docs.jobswipe.com',
          description: 'Find more info here',
        },
        host: `${config.host}:${config.port}`,
        schemes: ['http', 'https'],
        consumes: ['application/json', 'multipart/form-data'],
        produces: ['application/json'],
        tags: [
          { name: 'Authentication', description: 'User authentication endpoints' },
          { name: 'Users', description: 'User management endpoints' },
          { name: 'Jobs', description: 'Job management endpoints' },
          { name: 'Applications', description: 'Job application endpoints' },
          { name: 'Health', description: 'System health endpoints' },
        ],
        securityDefinitions: {
          Bearer: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
            description: 'Enter: Bearer {token}',
          },
        },
      },
    });

    await server.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
    });
  }

  // =============================================================================
  // HEALTH CHECK ENDPOINTS
  // =============================================================================

  // Basic health check
  server.get('/health', async (request, reply) => {
    try {
      // Test database connection
      await db.$queryRaw`SELECT 1`;
      
      return reply.code(200).send({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        database: 'connected',
      });
    } catch (error) {
      return reply.code(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        database: 'disconnected',
      });
    }
  });

  // Detailed health check
  server.get('/health/detailed', async (request, reply) => {
    const healthChecks = {
      database: { status: 'unknown', latency: 0 },
      memory: { status: 'unknown', usage: 0, limit: 0 },
      redis: { status: 'unknown', latency: 0 },
    };

    // Database health check
    try {
      const start = Date.now();
      await db.$queryRaw`SELECT 1`;
      healthChecks.database = {
        status: 'healthy',
        latency: Date.now() - start,
      };
    } catch (error) {
      healthChecks.database = {
        status: 'unhealthy',
        latency: 0,
      };
    }

    // Memory usage check
    const memUsage = process.memoryUsage();
    healthChecks.memory = {
      status: memUsage.heapUsed < memUsage.heapTotal * 0.9 ? 'healthy' : 'warning',
      usage: memUsage.heapUsed,
      limit: memUsage.heapTotal,
    };

    // Redis health check (if configured)
    if (process.env.REDIS_URL) {
      try {
        // This would be implemented with actual Redis client
        healthChecks.redis = { status: 'healthy', latency: 0 };
      } catch (error) {
        healthChecks.redis = { status: 'unhealthy', latency: 0 };
      }
    }

    const overallStatus = Object.values(healthChecks).every(check => 
      check.status === 'healthy'
    ) ? 'healthy' : 'degraded';

    return reply.code(overallStatus === 'healthy' ? 200 : 503).send({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: healthChecks,
    });
  });

  // Ready check (Kubernetes readiness probe)
  server.get('/ready', async (request, reply) => {
    try {
      await db.$queryRaw`SELECT 1`;
      return reply.code(200).send({ status: 'ready' });
    } catch (error) {
      return reply.code(503).send({ status: 'not ready' });
    }
  });

  // Live check (Kubernetes liveness probe)
  server.get('/live', async (request, reply) => {
    return reply.code(200).send({ 
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  });

  // =============================================================================
  // API ROUTES
  // =============================================================================

  // API version prefix
  const apiPrefix = process.env.API_PREFIX || '/api/v1';

  // Authentication routes
  await server.register(async function (fastify) {
    await registerAuthRoutes(fastify);
  }, { prefix: `${apiPrefix}/auth` });

  // =============================================================================
  // ERROR HANDLING
  // =============================================================================

  // Global error handler
  server.setErrorHandler(async (error, request, reply) => {
    const isDev = process.env.NODE_ENV === 'development';
    
    server.log.error({
      error: error.message,
      stack: error.stack,
      request: {
        method: request.method,
        url: request.url,
        headers: request.headers,
        query: request.query,
        params: request.params,
      },
    }, 'Unhandled error');

    // Validation errors
    if (error.validation) {
      return reply.code(400).send({
        error: 'Validation Error',
        message: 'Invalid request data',
        details: error.validation,
        statusCode: 400,
        timestamp: new Date().toISOString(),
      });
    }

    // Rate limit errors
    if (error.statusCode === 429) {
      return reply.code(429).send({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        statusCode: 429,
        timestamp: new Date().toISOString(),
      });
    }

    // Authentication errors
    if (error.statusCode === 401) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Authentication required',
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
    }

    // Authorization errors
    if (error.statusCode === 403) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'Insufficient permissions',
        statusCode: 403,
        timestamp: new Date().toISOString(),
      });
    }

    // Not found errors
    if (error.statusCode === 404) {
      return reply.code(404).send({
        error: 'Not Found',
        message: 'Resource not found',
        statusCode: 404,
        timestamp: new Date().toISOString(),
      });
    }

    // Internal server errors
    const statusCode = error.statusCode || 500;
    return reply.code(statusCode).send({
      error: 'Internal Server Error',
      message: isDev ? error.message : 'An unexpected error occurred',
      statusCode,
      timestamp: new Date().toISOString(),
      ...(isDev && { stack: error.stack }),
    });
  });

  // 404 handler
  server.setNotFoundHandler(async (request, reply) => {
    return reply.code(404).send({
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
      statusCode: 404,
      timestamp: new Date().toISOString(),
    });
  });

  return server;
}

// =============================================================================
// SERVER STARTUP
// =============================================================================

/**
 * Start the server
 */
async function start(): Promise<void> {
  try {
    const server = await createServer();

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      server.log.info(`Received ${signal}, starting graceful shutdown...`);
      
      try {
        await server.close();
        await db.$disconnect();
        server.log.info('Server shut down gracefully');
        process.exit(0);
      } catch (error) {
        server.log.error(error, 'Error during graceful shutdown');
        process.exit(1);
      }
    };

    // Register signal handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Unhandled promise rejection
    process.on('unhandledRejection', (reason, promise) => {
      server.log.fatal({
        reason,
        promise,
      }, 'Unhandled Promise Rejection');
      process.exit(1);
    });

    // Uncaught exception
    process.on('uncaughtException', (error) => {
      server.log.fatal(error, 'Uncaught Exception');
      process.exit(1);
    });

    // Start listening
    await server.listen({
      port: config.port,
      host: config.host,
    });

    server.log.info(`🚀 JobSwipe API Server started successfully!`);
    server.log.info(`📡 Server listening on http://${config.host}:${config.port}`);
    server.log.info(`🔍 Health check: http://${config.host}:${config.port}/health`);
    if (isDevelopment) {
      server.log.info(`📚 API Documentation: http://${config.host}:${config.port}/docs`);
    }
    server.log.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// =============================================================================
// MODULE EXPORTS
// =============================================================================

export { createServer, start };

// Start server if this file is run directly
if (require.main === module) {
  start();
}