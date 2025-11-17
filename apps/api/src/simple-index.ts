// /**
//  * @fileoverview JobSwipe API Server - Simplified Working Version
//  * @description Minimal Fastify server with basic functionality
//  * @version 1.0.0
//  * @author JobSwipe Team
//  */

// import Fastify, { FastifyInstance } from 'fastify';
// import cors from '@fastify/cors';
// import helmet from '@fastify/helmet';
// import rateLimit from '@fastify/rate-limit';

// // =============================================================================
// // CONFIGURATION
// // =============================================================================

// const isDevelopment = process.env.NODE_ENV === 'development';
// const isProduction = process.env.NODE_ENV === 'production';

// const config = {
//   port: parseInt(process.env.API_PORT || '3001'),
//   host: process.env.API_HOST || 'localhost',
//   cors: {
//     origin: process.env.API_CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
//     credentials: true,
//   },
//   rateLimit: {
//     max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
//     timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
//   },
//   logger: {
//     level: process.env.LOG_LEVEL || 'info',
//     transport: isDevelopment ? {
//       target: 'pino-pretty',
//       options: {
//         colorize: true,
//         translateTime: 'HH:MM:ss Z',
//         ignore: 'pid,hostname',
//       },
//     } : undefined,
//   },
// };

// // =============================================================================
// // SERVER SETUP
// // =============================================================================

// /**
//  * Create and configure Fastify server instance
//  */
// async function createServer(): Promise<FastifyInstance> {
//   const server = Fastify({
//     logger: config.logger,
//     trustProxy: isProduction,
//     disableRequestLogging: false,
//     ignoreTrailingSlash: true,
//     caseSensitive: false,
//   });

//   // Security headers
//   await server.register(helmet as any, {
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         styleSrc: ["'self'", "'unsafe-inline'"],
//         scriptSrc: ["'self'"],
//         imgSrc: ["'self'", "data:", "https:"],
//         connectSrc: ["'self'"],
//         fontSrc: ["'self'"],
//         objectSrc: ["'none'"],
//         mediaSrc: ["'self'"],
//         frameSrc: ["'none'"],
//       },
//     },
//     crossOriginEmbedderPolicy: false,
//   });

//   // CORS configuration
//   await server.register(cors as any, {
//     origin: config.cors.origin,
//     credentials: config.cors.credentials,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//     allowedHeaders: [
//       'Origin',
//       'X-Requested-With',
//       'Content-Type',
//       'Accept',
//       'Authorization',
//       'X-CSRF-Token',
//       'X-API-Key',
//     ],
//   });

//   // Rate limiting
//   await server.register(rateLimit as any, {
//     max: config.rateLimit.max,
//     timeWindow: config.rateLimit.timeWindow,
//     allowList: ['127.0.0.1'],
//     keyGenerator: (request) => {
//       return request.headers['x-forwarded-for'] as string ||
//              request.headers['x-real-ip'] as string ||
//              request.ip;
//     },
//     errorResponseBuilder: (request, context) => {
//       return {
//         code: 429,
//         error: 'Too Many Requests',
//         message: `Rate limit exceeded, retry in ${Math.round(context.ttl / 1000)} seconds`,
//         statusCode: 429,
//         time: Date.now(),
//       };
//     },
//   });

//   // =============================================================================
//   // HEALTH CHECK ENDPOINTS
//   // =============================================================================

//   // Basic health check
//   server.get('/health', async (request, reply) => {
//     return reply.code(200).send({
//       status: 'healthy',
//       timestamp: new Date().toISOString(),
//       version: process.env.npm_package_version || '1.0.0',
//       environment: process.env.NODE_ENV || 'development',
//       uptime: process.uptime(),
//     });
//   });

//   // Ready check (Kubernetes readiness probe)
//   server.get('/ready', async (request, reply) => {
//     return reply.code(200).send({ status: 'ready' });
//   });

//   // Live check (Kubernetes liveness probe)
//   server.get('/live', async (request, reply) => {
//     return reply.code(200).send({ 
//       status: 'alive',
//       timestamp: new Date().toISOString(),
//     });
//   });

//   // =============================================================================
//   // BASIC API ROUTES
//   // =============================================================================

//   // API version prefix
//   const apiPrefix = process.env.API_PREFIX || '/api/v1';

//   // Basic info endpoint
//   server.get(`${apiPrefix}/info`, async (request, reply) => {
//     return reply.send({
//       name: 'JobSwipe API',
//       version: '1.0.0',
//       environment: process.env.NODE_ENV || 'development',
//       timestamp: new Date().toISOString(),
//     });
//   });

//   // Basic auth endpoints (placeholder)
//   server.post(`${apiPrefix}/auth/login`, {
//     schema: {
//       body: {
//         type: 'object',
//         required: ['email', 'password'],
//         properties: {
//           email: { type: 'string', format: 'email' },
//           password: { type: 'string' },
//           source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
//         },
//       },
//     },
//   }, async (request, reply) => {
//     // TODO: Implement actual authentication
//     const { email, password } = request.body as any;
    
//     if (!email || !password) {
//       return reply.code(400).send({
//         success: false,
//         error: 'Email and password are required',
//       });
//     }

//     // Placeholder response
//     return reply.send({
//       success: true,
//       message: 'Login endpoint working - authentication not yet implemented',
//       user: {
//         email,
//         id: 'test-user-id',
//       },
//     });
//   });

//   server.post(`${apiPrefix}/auth/register`, {
//     schema: {
//       body: {
//         type: 'object',
//         required: ['email', 'password'],
//         properties: {
//           email: { type: 'string', format: 'email' },
//           password: { type: 'string', minLength: 8 },
//           name: { type: 'string' },
//           source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
//         },
//       },
//     },
//   }, async (request, reply) => {
//     // TODO: Implement actual registration
//     const { email, password, name } = request.body as any;
    
//     if (!email || !password) {
//       return reply.code(400).send({
//         success: false,
//         error: 'Email and password are required',
//       });
//     }

//     // Placeholder response
//     return reply.code(201).send({
//       success: true,
//       message: 'Registration endpoint working - user creation not yet implemented',
//       user: {
//         email,
//         name,
//         id: 'test-user-id',
//       },
//     });
//   });

//   // =============================================================================
//   // ERROR HANDLING
//   // =============================================================================

//   // Global error handler
//   server.setErrorHandler(async (error, request, reply) => {
//     const isDev = process.env.NODE_ENV === 'development';
    
//     server.log.error({
//       error: error.message,
//       stack: error.stack,
//       request: {
//         method: request.method,
//         url: request.url,
//         headers: request.headers,
//         query: request.query,
//         params: request.params,
//       },
//     }, 'Unhandled error');

//     // Validation errors
//     if (error.validation) {
//       return reply.code(400).send({
//         error: 'Validation Error',
//         message: 'Invalid request data',
//         details: error.validation,
//         statusCode: 400,
//         timestamp: new Date().toISOString(),
//       });
//     }

//     // Rate limit errors
//     if (error.statusCode === 429) {
//       return reply.code(429).send({
//         error: 'Too Many Requests',
//         message: 'Rate limit exceeded',
//         statusCode: 429,
//         timestamp: new Date().toISOString(),
//       });
//     }

//     // Internal server errors
//     const statusCode = error.statusCode || 500;
//     return reply.code(statusCode).send({
//       error: 'Internal Server Error',
//       message: isDev ? error.message : 'An unexpected error occurred',
//       statusCode,
//       timestamp: new Date().toISOString(),
//       ...(isDev && { stack: error.stack }),
//     });
//   });

//   // 404 handler
//   server.setNotFoundHandler(async (request, reply) => {
//     return reply.code(404).send({
//       error: 'Not Found',
//       message: `Route ${request.method} ${request.url} not found`,
//       statusCode: 404,
//       timestamp: new Date().toISOString(),
//     });
//   });

//   return server;
// }

// // =============================================================================
// // SERVER STARTUP
// // =============================================================================

// /**
//  * Start the server
//  */
// async function start(): Promise<void> {
//   try {
//     const server = await createServer();

//     // Graceful shutdown handling
//     const gracefulShutdown = async (signal: string) => {
//       server.log.info(`Received ${signal}, starting graceful shutdown...`);
      
//       try {
//         await server.close();
//         server.log.info('Server shut down gracefully');
//         process.exit(0);
//       } catch (error) {
//         server.log.error(error, 'Error during graceful shutdown');
//         process.exit(1);
//       }
//     };

//     // Register signal handlers
//     process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
//     process.on('SIGINT', () => gracefulShutdown('SIGINT'));

//     // Unhandled promise rejection
//     process.on('unhandledRejection', (reason, promise) => {
//       server.log.fatal({
//         reason,
//         promise,
//       }, 'Unhandled Promise Rejection');
//       process.exit(1);
//     });

//     // Uncaught exception
//     process.on('uncaughtException', (error) => {
//       server.log.fatal(error, 'Uncaught Exception');
//       process.exit(1);
//     });

//     // Start listening
//     await server.listen({
//       port: config.port,
//       host: config.host,
//     });

//     server.log.info(`🚀 JobSwipe API Server started successfully!`);
//     server.log.info(`📡 Server listening on http://${config.host}:${config.port}`);
//     server.log.info(`🔍 Health check: http://${config.host}:${config.port}/health`);
//     server.log.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

//   } catch (error) {
//     console.error('❌ Failed to start server:', error);
//     process.exit(1);
//   }
// }

// // =============================================================================
// // MODULE EXPORTS
// // =============================================================================

// export { createServer, start };

// // Start server if this file is run directly
// if (require.main === module) {
//   start();
// }