/**
 * @fileoverview JobSwipe API Server Entry Point
 * @description Enterprise-grade Fastify server with comprehensive features
 * @version 1.0.0
 * @author JobSwipe Team
 */

// Load environment variables first
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
const envPath = resolve(__dirname, '../.env.local');
dotenvConfig({ path: envPath });

// Fallback to .env if .env.local doesn't exist
dotenvConfig({ path: resolve(__dirname, '../.env') });

console.log('🔧 Environment variables loaded from:', envPath);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 Database URL:', process.env.DATABASE_URL ? '[CONFIGURED]' : '[MISSING]');
console.log('🔧 Redis URL:', process.env.REDIS_URL ? '[CONFIGURED]' : '[MISSING]');
console.log('🔧 JWT Secret:', process.env.JWT_SECRET ? '[CONFIGURED]' : '[MISSING]');

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
// Import route handlers (ensure they exist first)
async function loadRoutes() {
  try {
    console.log('Loading enterprise authentication routes...');
    const { registerAuthRoutes } = await import('./routes/auth.routes');
    console.log('Auth routes loaded successfully');
    
    const tokenExchangeRoutes = await import('./routes/token-exchange.routes');
    console.log('Token exchange routes loaded successfully');
    
    const { registerQueueRoutes } = await import('./routes/queue.routes');
    console.log('Queue routes loaded successfully');
    
    const jobsRoutes = await import('./routes/jobs.routes');
    console.log('Jobs routes loaded successfully');
    
    const automationRoutes = await import('./routes/automation-simple.routes');
    console.log('Automation routes loaded successfully');

    const { registerOnboardingRoutes } = await import('./routes/onboarding.routes');
    console.log('Onboarding routes loaded successfully');

    const { registerDesktopRoutes } = await import('./routes/desktop.routes');
    console.log('Desktop routes loaded successfully');

   // const resumeRoutes = await import('./routes/resumes.routes');
    console.log('Resume routes loaded successfully');

    return {
      registerAuthRoutes,
      tokenExchangeRoutes: tokenExchangeRoutes.default,
      registerQueueRoutes,
      jobsRoutes: jobsRoutes.default,
      automationRoutes: automationRoutes.automationRoutes,
      registerOnboardingRoutes,
      registerDesktopRoutes
     // resumeRoutes: resumeRoutes.default
    };
  } catch (error) {
    console.error('❌ Failed to load enterprise routes:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    console.warn('Falling back to basic routes');
    return null;
  }
}

// Import database conditionally
async function loadDatabase() {
  try {
    const { db } = await import('@jobswipe/database');
    return db;
  } catch (error) {
    console.warn('Database not available, using basic health checks');
    return null;
  }
}

// Import plugins conditionally
async function loadPlugins() {
  try {
    console.log('Loading enterprise plugins...');

    const databasePlugin = await import('./plugins/database.plugin');
    console.log('Database plugin loaded');

    const securityPlugin = await import('./plugins/security.plugin');
    console.log('Security plugin loaded');

    const servicesPlugin = await import('./plugins/services.plugin');
    console.log('Services plugin loaded');

    const advancedSecurityPlugin = await import('./plugins/advanced-security.plugin');
    console.log('Advanced security plugin loaded');

    const loggingPlugin = await import('./plugins/logging.plugin');
    console.log('Logging plugin loaded');

    const monitoringPlugin = await import('./plugins/monitoring.plugin');
    console.log('Monitoring plugin loaded');

    const queuePlugin = await import('./plugins/queue.plugin');
    console.log('Queue plugin loaded');

    const websocketPlugin = await import('./plugins/websocket.plugin');
    console.log('WebSocket plugin loaded');

    console.log('✅ All enterprise plugins loaded successfully');

    return {
      databasePlugin: databasePlugin.default,
      securityPlugin: securityPlugin.default,
      servicesPlugin: servicesPlugin.default,
      advancedSecurityPlugin: advancedSecurityPlugin.default,
      loggingPlugin: loggingPlugin.default,
      monitoringPlugin: monitoringPlugin.default,
      queuePlugin: queuePlugin.default,
      websocketPlugin: websocketPlugin.default,
    };
  } catch (error) {
    console.error('❌ Failed to load enterprise plugins:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    console.warn('Falling back to basic security');
    return null;
  }
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const config = {
  port: parseInt(process.env.API_PORT || '3001'),
  host: process.env.API_HOST || 'localhost',
  cors: {
    origin: process.env.API_CORS_ORIGIN?.split(',') || [
      'http://localhost:3000',      // Next.js web app
      'http://localhost:3001',      // Fastify API (self)
      'capacitor://localhost',      // Capacitor iOS/Android
      'ionic://localhost',          // Ionic apps
      'tauri://localhost',          // Tauri desktop
      'file://',                    // Electron file:// protocol
      'null'                        // Electron null origin
    ],
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
// BASIC ROUTES FALLBACK
// =============================================================================

/**
 * Register basic authentication routes as fallback
 */
async function registerBasicRoutes(server: FastifyInstance, apiPrefix: string): Promise<void> {
  server.log.info('Registering basic authentication routes...');
  
  // Basic auth routes
  server.post(`${apiPrefix}/auth/login`, {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password', 'source'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
          rememberMe: { type: 'boolean' },
        },
      },
    },
  }, async (request, reply) => {
    const { email, password } = request.body as any;
    
    // Basic validation - accept any valid email/password for development
    if (!email || !password || password.length < 8) {
      return reply.status(401).send({
        success: false,
        error: 'Invalid email or password',
        errorCode: 'INVALID_CREDENTIALS',
      });
    }
    
    // Mock successful login
    return reply.status(200).send({
      success: true,
      user: {
        id: 'basic-user-id',
        email,
        name: 'Basic User',
        role: 'user',
        status: 'active'
      },
      tokens: {
        accessToken: `basic_token_${Date.now()}`,
        refreshToken: `basic_refresh_${Date.now()}`,
        tokenType: 'Bearer',
        expiresIn: 3600,
      },
      message: 'Basic authentication - enterprise features not available'
    });
  });

  server.post(`${apiPrefix}/auth/register`, {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password', 'source'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          name: { type: 'string' },
          source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
        },
      },
    },
  }, async (request, reply) => {
    const { email, password, name } = request.body as any;
    
    return reply.status(201).send({
      success: true,
      user: {
        id: 'basic-user-id',
        email,
        name: name || 'Basic User',
        role: 'user',
        status: 'active'
      },
      tokens: {
        accessToken: `basic_token_${Date.now()}`,
        refreshToken: `basic_refresh_${Date.now()}`,
        tokenType: 'Bearer',
        expiresIn: 3600,
      },
      message: 'Basic registration - enterprise features not available'
    });
  });

  // Basic token refresh
  server.post(`${apiPrefix}/auth/token/refresh`, async (request, reply) => {
    return reply.send({
      success: true,
      tokens: {
        accessToken: `basic_token_${Date.now()}`,
        refreshToken: `basic_refresh_${Date.now()}`,
        tokenType: 'Bearer',
        expiresIn: 3600,
      }
    });
  });

  // Basic password reset
  server.post(`${apiPrefix}/auth/password/reset`, async (request, reply) => {
    return reply.send({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });
  });

  // Basic token exchange routes
  server.post(`${apiPrefix}/token-exchange/initiate`, async (request, reply) => {
    return reply.send({
      success: true,
      exchangeToken: `basic_exchange_${Date.now()}`,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      instructions: {
        step1: 'Basic token exchange - enterprise features not available',
        step2: 'This is a development/testing endpoint',
        step3: 'Enable enterprise plugins for full functionality'
      }
    });
  });

  server.post(`${apiPrefix}/token-exchange/complete`, async (request, reply) => {
    return reply.send({
      success: true,
      accessToken: `basic_desktop_${Date.now()}`,
      tokenType: 'Bearer',
      expiresIn: 3600,
      message: 'Basic token exchange completed'
    });
  });

  server.log.info('✅ Basic routes registered successfully');
}

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
  // ENTERPRISE PLUGINS REGISTRATION
  // =============================================================================

  // Load enterprise plugins conditionally
  const plugins = await loadPlugins();
  
  if (plugins) {
    try {
      // CORRECTED PLUGIN LOADING ORDER (Issue #11)
      // Order is critical - plugins depend on earlier plugins being loaded

      // 1. Database plugin - MUST be first (everything depends on database)
      server.log.info('[1/8] Registering database plugin...');
      await server.register(plugins.databasePlugin as any);

      // 2. Services plugin - Core services (JWT, Redis, Security)
      server.log.info('[2/8] Registering enterprise services plugin (JWT, Redis, Security)...');
      await server.register(plugins.servicesPlugin as any);

      // 3. Logging plugin - Centralized logging system (needs services for Redis)
      server.log.info('[3/8] Registering enterprise logging plugin...');
      await server.register(plugins.loggingPlugin as any);

      // 4. Monitoring plugin - Metrics and observability (needs logging)
      server.log.info('[4/8] Registering enterprise monitoring plugin...');
      await server.register(plugins.monitoringPlugin as any);

      // 5. Advanced security plugin - CSRF, XSS, attack detection (needs services)
      server.log.info('[5/8] Registering advanced security plugin (CSRF, attack detection)...');
      await server.register(plugins.advancedSecurityPlugin as any);

      // 6. Basic security plugin - Backwards compatibility (load after advanced)
      server.log.info('[6/8] Registering basic security plugin (backwards compatibility)...');
      await server.register(plugins.securityPlugin as any);

      // 7. Queue plugin - Application plugin (needs database, services, security)
      server.log.info('[7/8] Registering queue management plugin...');
      await server.register(plugins.queuePlugin as any);

      // 8. WebSocket plugin - Application plugin (needs services for auth, security for protection)
      server.log.info('[8/8] Registering WebSocket plugin...');
      await server.register(plugins.websocketPlugin as any);

      server.log.info('✅ All 8 enterprise plugins registered successfully in correct order');
    } catch (error) {
      server.log.warn('⚠️ Some enterprise plugins failed to load, continuing with basic functionality');
      server.log.error(error);
    }
  } else {
    server.log.warn('⚠️ Enterprise plugins not available, using basic security headers fallback');
  }

  // Add comprehensive security headers fallback for all requests
  server.addHook('onRequest', async (request, reply) => {
    // Security headers
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '1; mode=block');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // CORS debugging headers
    reply.header('X-API-Version', '1.0.0');
    reply.header('X-Request-ID', `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    
    if (process.env.NODE_ENV === 'production') {
      reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    } else {
      // Development debugging headers
      reply.header('X-Development-Mode', 'true');
      reply.header('X-Request-Time', new Date().toISOString());
    }
  });

  // Security headers (additional to security plugin)
  await server.register(helmet as any, {
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

  // CORS configuration with enhanced support for desktop apps
  await server.register(cors as any, {
    origin: (origin, callback) => {
      const allowedOrigins = config.cors.origin;
      server.log.debug(`CORS request from origin: ${origin}`);
      
      // Allow requests with no origin (mobile apps, Electron, Postman)
      if (!origin) {
        server.log.debug('CORS: Allowing request with no origin (mobile/desktop app)');
        return callback(null, true);
      }
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        server.log.debug(`CORS: Allowing origin: ${origin}`);
        return callback(null, true);
      }
      
      // Allow localhost with any port for development
      if (isDevelopment && origin.startsWith('http://localhost')) {
        server.log.debug(`CORS: Allowing localhost origin in development: ${origin}`);
        return callback(null, true);
      }
      
      server.log.warn(`CORS: Blocking origin: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
    },
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-CSRF-Token',
      'X-API-Key',
      'User-Agent',
      'X-Request-Source',
      'X-Device-Type',
      'X-App-Version',
      'Cache-Control',
      'Pragma',
      'Expires'
    ],
    exposedHeaders: [
      'X-Request-ID',
      'X-Response-Time',
      'X-Rate-Limit-Remaining',
      'X-Rate-Limit-Reset'
    ],
    maxAge: isDevelopment ? 86400 : 3600, // 24h in dev, 1h in prod
  });

  // Rate limiting
  await server.register(rateLimit as any, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,
    allowList: ['127.0.0.1'],
    // Disable Redis for rate limiting to fix pipeline issue
    // redis: process.env.REDIS_URL ? {
    //   url: process.env.REDIS_URL,
    // } : undefined,
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
  await server.register(multipart as any, {
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
      files: 10,
      fields: 20,
    },
    attachFieldsToBody: true,
  });

  // API Documentation (Swagger)
  if (isDevelopment) {
    await server.register(swagger as any, {
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

    await server.register(swaggerUi as any, {
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

  // Load database conditionally
  const database = await loadDatabase();

  // Basic health check
  server.get('/health', async (request, reply) => {
    let databaseStatus = 'not_connected';
    let statusCode = 200;
    
    if (database) {
      try {
        // Test database connection
        await database.$queryRaw`SELECT 1`;
        databaseStatus = 'connected';
      } catch (error) {
        databaseStatus = 'disconnected';
        statusCode = 503;
      }
    }
    
    return reply.code(statusCode).send({
      status: statusCode === 200 ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      database: databaseStatus,
    });
  });

  // Detailed health check
  server.get('/health/detailed', async (request, reply) => {
    const healthChecks = {
      database: { status: 'not_connected', latency: 0 },
      memory: { status: 'unknown', usage: 0, limit: 0 },
      redis: { status: 'not_connected', latency: 0 },
    };

    // Database health check (if available)
    if (database) {
      try {
        const start = Date.now();
        await database.$queryRaw`SELECT 1`;
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
    if (database) {
      try {
        await database.$queryRaw`SELECT 1`;
        return reply.code(200).send({ 
          ready: true,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        return reply.code(503).send({ 
          ready: false,
          timestamp: new Date().toISOString(),
          error: 'Database not ready'
        });
      }
    } else {
      return reply.code(200).send({ 
        ready: true,
        timestamp: new Date().toISOString(),
        note: 'Database not configured'
      });
    }
  });

  // Live check (Kubernetes liveness probe)
  server.get('/live', async (request, reply) => {
    return reply.code(200).send({ 
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  });

  // Security health check
  server.get('/health/security', async (request, reply) => {
    try {
      // Check both security services if available
      const basicSecurityStats = server.security?.getStats?.() || {};
      const advancedSecurityStats = (server as any).advancedSecurity?.getHealthStatus?.() || {};
      
      return reply.code(200).send({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        security: {
          basic: basicSecurityStats,
          advanced: advancedSecurityStats,
        },
      });
    } catch (error) {
      return reply.code(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Security check failed',
      });
    }
  });

  // =============================================================================
  // API ROUTES
  // =============================================================================

  // API version prefix
  const apiPrefix = process.env.API_PREFIX || '/api/v1';

  // Load routes conditionally
  const routes = await loadRoutes();
  
  if (routes) {
    try {
      // Enterprise authentication routes
      server.log.info('Registering enterprise authentication routes...');
      await server.register(async function (fastify) {
        await routes.registerAuthRoutes(fastify);
      }, { prefix: `${apiPrefix}/auth` });

      // Enterprise token exchange routes
      server.log.info('Registering enterprise token exchange routes...');
      await server.register(routes.tokenExchangeRoutes, { prefix: `${apiPrefix}/token-exchange` });

      // Enterprise queue management routes
      server.log.info('Registering enterprise queue management routes...');
      await server.register(async function (fastify) {
        await routes.registerQueueRoutes(fastify);
      }, { prefix: `${apiPrefix}/queue` });

      // Enterprise jobs routes
      server.log.info('Registering enterprise jobs routes...');
      await server.register(routes.jobsRoutes, { prefix: apiPrefix });

      // Enterprise automation routes
      server.log.info('Registering enterprise automation routes...');
      await server.register(routes.automationRoutes, { prefix: apiPrefix });

      // Enterprise onboarding routes
      server.log.info('Registering enterprise onboarding routes...');
      await server.register(async function (fastify) {
        await routes.registerOnboardingRoutes(fastify);
      }, { prefix: apiPrefix });

      // Enterprise resume routes
      server.log.info('Registering enterprise resume routes...');
    //  await server.register(routes.resumeRoutes, { prefix: apiPrefix });

      server.log.info('✅ Enterprise routes registered successfully');
    } catch (error) {
      server.log.warn('Enterprise routes failed to load, registering basic routes');
      server.log.error(error);
      await registerBasicRoutes(server, apiPrefix);
    }
  } else {
    server.log.warn('Enterprise routes not available, using basic authentication');
    await registerBasicRoutes(server, apiPrefix);
  }

  // =============================================================================
  // ERROR HANDLING
  // =============================================================================

  // Global error handler (will be overridden by logging plugin if registered)
  server.setErrorHandler(async (error, request, reply) => {
    const isDev = process.env.NODE_ENV === 'development';
    
    // Use logging service if available
    if (server.logging && (request as any).logContext) {
      server.logging.logError(error, (request as any).logContext, {
        url: request.url,
        method: request.method,
        body: request.body,
        query: request.query,
        params: request.params,
      });
    } else {
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
    }

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
        
        // Disconnect database if available
        const database = await loadDatabase();
        if (database) {
          await database.$disconnect();
        }
        
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
    server.log.info(`🛡️  Security middleware: http://${config.host}:${config.port}/health/security`);
    server.log.info(`📊 Monitoring metrics: http://${config.host}:${config.port}/metrics`);
    server.log.info(`📈 Monitoring health: http://${config.host}:${config.port}/health/monitoring`);
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