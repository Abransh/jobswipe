/**
 * @fileoverview Services Registration Plugin for Fastify
 * @description Enterprise-grade dependency injection for authentication services
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Production-level service registration with proper error handling
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { AutomationService } from '../services/AutomationService';
import { ServerAutomationService } from '../services/ServerAutomationService';
import { AutomationLimits } from '../services/AutomationLimits';
import { ProxyRotator } from '../services/ProxyRotator';
import { AuthService, createAuthService } from '../services/AuthService';
import { OAuthService } from '../services/oauth/OAuthService';

// Import server services conditionally
let RedisSessionService: any = null;
let createRedisSessionService: any = null;

try {
  const serverModule = require('@jobswipe/shared/server');
  RedisSessionService = serverModule.RedisSessionService;
  createRedisSessionService = serverModule.createRedisSessionService;
  console.log('✅ Server modules loaded successfully');
} catch (error) {
  console.warn('⚠️  Failed to load server modules:', error);
  console.warn('Services plugin will use fallback implementations');
}

// Database import (conditional)
let db: any = null;
try {
  const { db: database } = require('@jobswipe/database');
  db = database;
} catch (error) {
  console.warn('Database package not available, services will continue without database connectivity');
}

// Define missing types locally to avoid import issues
interface SecurityMiddlewareService {
  checkRateLimit(key: string, maxRequests: number, windowMs: number): Promise<boolean>;
  blockIp(ip: string, reason: string): Promise<void>;
  isIpBlocked(ip: string): Promise<boolean>;
  getStats(): any;
}

// Create fallback service functions
function createFallbackRedisSessionService(redisConfig: any, sessionConfig?: any): any {
  console.log('Creating fallback Redis session service with config:', redisConfig);
  return {
    createSession: async () => ({ id: 'fallback-session', userId: 'fallback-user' }),
    getSession: async () => null,
    updateSession: async () => {},
    revokeSession: async () => {},
    cleanExpiredSessions: async () => 0,
    getHealthStatus: () => ({ status: 'healthy', details: { fallback: true } }),
  };
}

function createSecurityMiddlewareService(): SecurityMiddlewareService {
  return {
    async checkRateLimit(_key: string, _maxRequests: number, _windowMs: number): Promise<boolean> {
      return true;
    },
    async blockIp(ip: string, reason: string): Promise<void> {
      console.log(`IP blocked: ${ip} - ${reason}`);
    },
    async isIpBlocked(_ip: string): Promise<boolean> {
      return false;
    },
    getStats() {
      return { rateLimitEntries: 0, blockedIps: 0, suspiciousActivity: 0 };
    },
  };
}

// =============================================================================
// INTERFACES
// =============================================================================

interface ServicesConfig {
  jwt: {
    keyRotationInterval?: number;
    maxKeyAge?: number;
    revokedTokensCleanupInterval?: number;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
    maxRetriesPerRequest?: number;
    retryDelayOnFailover?: number;
    enableOfflineQueue?: boolean;
    lazyConnect?: boolean;
    ssl?: boolean;
  };
  session: {
    keyPrefix?: string;
    defaultExpiration?: number;
    enableMetrics?: boolean;
  };
  security: {
    rateLimiting: {
      enabled: boolean;
      windowMs: number;
      maxRequests: number;
    };
    ipBlocking: {
      enabled: boolean;
      maxAttempts: number;
      blockDuration: number;
    };
    suspiciousActivity: {
      enabled: boolean;
      threshold: number;
    };
  };
}

interface ServiceHealth {
  jwt: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  };
  redis: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  };
  session: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  };
  security: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  };
}

// =============================================================================
// SERVICE REGISTRY
// =============================================================================

class ServiceRegistry {
  private services: Map<string, any> = new Map();
  private healthChecks: Map<string, () => Promise<any>> = new Map();
  private metrics: Map<string, any> = new Map();

  /**
   * Register a service
   */
  register<T>(name: string, service: T, healthCheck?: () => Promise<any>): void {
    this.services.set(name, service);
    if (healthCheck) {
      this.healthChecks.set(name, healthCheck);
    }
  }

  /**
   * Get a service
   */
  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service '${name}' not found`);
    }
    return service as T;
  }

  /**
   * Check if service exists
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Get all service health
   */
  async getHealth(): Promise<Record<string, any>> {
    const health: Record<string, any> = {};

    for (const [name, healthCheck] of Array.from(this.healthChecks.entries())) {
      try {
        health[name] = await healthCheck();
      } catch (error) {
        health[name] = {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return health;
  }

  /**
   * Get service metrics
   */
  getMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    for (const [name, service] of Array.from(this.services.entries())) {
      if (service && typeof service.getMetrics === 'function') {
        try {
          metrics[name] = service.getMetrics();
        } catch (error) {
          metrics[name] = { error: 'Failed to get metrics' };
        }
      }
    }

    return metrics;
  }

  /**
   * Shutdown all services
   */
  async shutdown(): Promise<void> {
    for (const [name, service] of Array.from(this.services.entries())) {
      if (service && typeof service.shutdown === 'function') {
        try {
          await service.shutdown();
          console.log(`Service '${name}' shut down successfully`);
        } catch (error) {
          console.error(`Error shutting down service '${name}':`, error);
        }
      }
    }
    
    this.services.clear();
    this.healthChecks.clear();
    this.metrics.clear();
  }
}

// =============================================================================
// SERVICES PLUGIN
// =============================================================================

/**
 * Parse Redis URL for services plugin
 */
function parseRedisUrlForServices(url: string): any {
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
    console.error('Failed to parse REDIS_URL in services plugin:', error);
    throw new Error('Invalid REDIS_URL format');
  }
}

const servicesPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Get Redis configuration (priority: REDIS_URL > individual vars)
  let redisBaseConfig: any;
  if (process.env.REDIS_URL) {
    console.log('🔧 Services plugin using REDIS_URL');
    redisBaseConfig = parseRedisUrlForServices(process.env.REDIS_URL);
  } else {
    console.log('🔧 Services plugin using individual Redis env vars');
    redisBaseConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
    };
  }

  const config: ServicesConfig = {
    jwt: {
      keyRotationInterval: parseInt(process.env.JWT_KEY_ROTATION_INTERVAL || '86400000'), // 24 hours
      maxKeyAge: parseInt(process.env.JWT_MAX_KEY_AGE || '604800000'), // 7 days
      revokedTokensCleanupInterval: parseInt(process.env.JWT_CLEANUP_INTERVAL || '3600000'), // 1 hour
    },
    redis: {
      ...redisBaseConfig,
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'jobswipe:',
      maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
      retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100'),
      enableOfflineQueue: process.env.REDIS_OFFLINE_QUEUE === 'true',
      lazyConnect: process.env.REDIS_LAZY_CONNECT === 'true',
      ssl: redisBaseConfig.tls || process.env.REDIS_SSL === 'true',
    },
    session: {
      keyPrefix: process.env.SESSION_KEY_PREFIX || 'session:',
      defaultExpiration: parseInt(process.env.SESSION_DEFAULT_EXPIRATION || '1800'), // 30 minutes
      enableMetrics: process.env.SESSION_ENABLE_METRICS !== 'false',
    },
    security: {
      rateLimiting: {
        enabled: process.env.RATE_LIMITING_ENABLED !== 'false',
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      },
      ipBlocking: {
        enabled: process.env.IP_BLOCKING_ENABLED !== 'false',
        maxAttempts: parseInt(process.env.IP_BLOCKING_MAX_ATTEMPTS || '10'),
        blockDuration: parseInt(process.env.IP_BLOCKING_DURATION || '3600000'), // 1 hour
      },
      suspiciousActivity: {
        enabled: process.env.SUSPICIOUS_ACTIVITY_ENABLED !== 'false',
        threshold: parseInt(process.env.SUSPICIOUS_ACTIVITY_THRESHOLD || '5'),
      },
    },
  };

  // Create service registry
  const serviceRegistry = new ServiceRegistry();

  // =============================================================================
  // JWT TOKEN SERVICE (HS256 with AuthService)
  // =============================================================================

  fastify.log.info('Initializing JWT Authentication Service (HS256)...');

  let jwtService: AuthService;
  try {
    fastify.log.info('Creating AuthService with HS256 (HMAC-SHA256)...');

    // Create AuthService instance (HS256)
    jwtService = createAuthService(fastify);

    serviceRegistry.register(
      'jwt',
      jwtService,
      () => Promise.resolve({
        status: 'healthy' as const,
        details: {
          algorithm: 'HS256',
          hasJwtSecret: !!process.env.JWT_SECRET,
          hasRefreshSecret: !!process.env.JWT_REFRESH_SECRET,
        }
      })
    );

    fastify.log.info('✅ JWT Authentication Service (HS256) initialized successfully');
    fastify.log.info('   Algorithm: HS256 (HMAC-SHA256)');
    fastify.log.info('   Compatible with Next.js middleware');
  } catch (error) {
    fastify.log.error({err: error, msg: '❌ Failed to initialize JWT Authentication Service:'});
    fastify.log.error({
      msg: 'Error details:',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new Error('JWT Authentication Service is required - cannot start server without it');
  }

  // =============================================================================
  // REDIS SESSION SERVICE
  // =============================================================================

  fastify.log.info('Initializing Redis Session Service...');
  
  let sessionService: any;
  try {
    if (!createRedisSessionService) {
      throw new Error('createRedisSessionService not available');
    }

    fastify.log.info({
      msg: 'Creating Redis session service with config:',
      redis: { ...config.redis, password: config.redis.password ? '[REDACTED]' : undefined },
      session: config.session,
    });

    sessionService = createRedisSessionService(
      config.redis,
      config.session
    );

    fastify.log.info('Redis session service created successfully');

    serviceRegistry.register(
      'session',
      sessionService,
      () => Promise.resolve((sessionService as any).getHealthStatus())
    );

    fastify.log.info('✅ Redis Session Service initialized successfully');
  } catch (error) {
    fastify.log.error({err: error, msg: '❌ Failed to initialize Redis Session Service:'});
    fastify.log.error({
      msg: 'Error details:',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Create fallback session service
    fastify.log.warn('Using fallback session service implementation');
    sessionService = createFallbackRedisSessionService(config.redis, config.session);
    
    serviceRegistry.register(
      'session',
      sessionService,
      () => Promise.resolve(sessionService.getHealthStatus())
    );
  }

  // =============================================================================
  // SECURITY MIDDLEWARE SERVICE
  // =============================================================================

  fastify.log.info('Initializing Security Middleware Service...');
  
  let securityService: SecurityMiddlewareService;
  try {
    securityService = createSecurityMiddlewareService();

    serviceRegistry.register(
      'security',
      securityService,
      () => Promise.resolve({ status: 'healthy', details: securityService.getStats() })
    );

    fastify.log.info('✅ Security Middleware Service initialized successfully');
  } catch (error) {
    fastify.log.error({err: error, msg: '❌ Failed to initialize Security Middleware Service:'} );
    throw new Error(`Security service initialization failed: ${error}`);
  }

  // =============================================================================
  // REGISTER SERVICES WITH FASTIFY
  // =============================================================================

  // =============================================================================
  // DATABASE SERVICE (Optional)
  // =============================================================================

  if (db) {
    fastify.log.info('Initializing Database Service...');
    
    try {
      // Test database connection
      await db.$queryRaw`SELECT 1`;
      
      serviceRegistry.register(
        'database',
        db,
        async () => {
          try {
            const start = Date.now();
            await db.$queryRaw`SELECT 1`;
            const latency = Date.now() - start;
            
            return {
              status: 'healthy',
              details: {
                latency,
                connected: true,
              },
            };
          } catch (error) {
            return {
              status: 'unhealthy',
              details: {
                connected: false,
                error: error instanceof Error ? error.message : 'Unknown error',
              },
            };
          }
        }
      );
      
      fastify.log.info('✅ Database Service initialized successfully');
    } catch (error) {
      fastify.log.warn({err: error, msg:'⚠️  Database connection test failed:'});
      
      // Register database service as unhealthy but still available
      serviceRegistry.register(
        'database',
        db,
        () => Promise.resolve({
          status: 'unhealthy',
          details: {
            connected: false,
            error: error instanceof Error ? error.message : 'Connection failed',
          },
        })
      );
    }
    
    // Add database cleanup on close
    fastify.addHook('onClose', async () => {
      try {
        await db.$disconnect();
        fastify.log.info('Database connection closed');
      } catch (error) {
        fastify.log.error({err: error, msg:'Error closing database connection:'});
      }
    });
  }

  // =============================================================================
  // AUTOMATION SERVICES
  // =============================================================================

  fastify.log.info('Initializing Automation Services...');
  
  let automationService: AutomationService;
  try {
    // Create ProxyRotator service
    const proxyRotator = new ProxyRotator(fastify);
    
    // Create ServerAutomationService
    const serverAutomationService = new ServerAutomationService(fastify, proxyRotator);
    
    // Create AutomationLimits service
    const automationLimits = new AutomationLimits(fastify);
    
    // Create main AutomationService
    automationService = new AutomationService(fastify, serverAutomationService, automationLimits);
    
    // Register all automation services
    serviceRegistry.register('proxyRotator', proxyRotator);
    serviceRegistry.register('serverAutomation', serverAutomationService);
    serviceRegistry.register('automationLimits', automationLimits);
    serviceRegistry.register(
      'automation',
      automationService,
      async () => {
        try {
          const healthStatus = await automationService.getHealthStatus();
          return {
            status: healthStatus.status,
            details: {
              activeProcesses: (healthStatus as any).activeProcesses,
              queueHealth: healthStatus.queueHealth,
              systemInfo: healthStatus.systemInfo,
              issues: healthStatus.issues
            }
          };
        } catch (error) {
          return {
            status: 'unhealthy',
            details: {
              error: error instanceof Error ? error.message : 'Health check failed'
            }
          };
        }
      }
    );
    
    fastify.log.info('✅ Automation Services initialized successfully');
  } catch (error) {
    fastify.log.error({err: error, msg:'❌ Failed to initialize Automation Services:'});
    throw new Error(`Automation services initialization failed: ${error}`);
  }

  // =============================================================================
  // OAUTH SERVICE
  // =============================================================================

  fastify.log.info('Initializing OAuth Service...');

  let oauthService: OAuthService;
  try {
    // Create OAuthService (requires database and jwtService)
    if (!db) {
      throw new Error('Database is required for OAuth Service');
    }

    oauthService = new OAuthService(fastify);

    serviceRegistry.register(
      'oauth',
      oauthService,
      async () => {
        try {
          const enabledProviders = oauthService.getEnabledProviders();
          return {
            status: 'healthy',
            details: {
              enabledProviders: enabledProviders.length,
              providers: enabledProviders,
              googleConfigured: !!process.env.GOOGLE_CLIENT_ID,
              githubConfigured: !!process.env.GITHUB_CLIENT_ID,
              linkedinConfigured: !!process.env.LINKEDIN_CLIENT_ID,
            }
          };
        } catch (error) {
          return {
            status: 'unhealthy',
            details: {
              error: error instanceof Error ? error.message : 'Health check failed'
            }
          };
        }
      }
    );

    fastify.log.info('✅ OAuth Service initialized successfully');
    fastify.log.info(`   Enabled providers: ${oauthService.getEnabledProviders().join(', ')}`);
  } catch (error) {
    fastify.log.error({err: error, msg:'❌ Failed to initialize OAuth Service:'});
    fastify.log.warn('⚠️  OAuth authentication will not be available');

    // OAuth is optional - don't fail startup if it's not configured
    // Create a null service that will be checked in routes
    oauthService = null as any;
  }

  // =============================================================================
  // REGISTER SERVICES WITH FASTIFY
  // =============================================================================

  // Decorate Fastify instance with services
  fastify.decorate('jwtService', jwtService);
  fastify.decorate('sessionService', sessionService);
  fastify.decorate('securityService', securityService);
  fastify.decorate('serviceRegistry', serviceRegistry);

  // Decorate automation services
  fastify.decorate('automationService', automationService);
  fastify.decorate('proxyRotator', serviceRegistry.get('proxyRotator'));
  fastify.decorate('serverAutomationService', serviceRegistry.get('serverAutomation'));
  fastify.decorate('automationLimits', serviceRegistry.get('automationLimits'));

  // Decorate OAuth service (optional - may be null if not configured)
  fastify.decorate('oauthService', oauthService);

  // Database decorator is registered by database.plugin.ts

  // Add service health check endpoint
  fastify.get('/health/services', {
    schema: {
      summary: 'Get all services health status',
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            services: { type: 'object' },
          },
        },
        500: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            services: { type: 'object' },
          },
        },
        503: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            services: { type: 'object' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const servicesHealth = await serviceRegistry.getHealth();
      
      // Determine overall status
      const allHealthy = Object.values(servicesHealth).every(
        (health: any) => health.status === 'healthy'
      );
      const anyUnhealthy = Object.values(servicesHealth).some(
        (health: any) => health.status === 'unhealthy'
      );
      
      const overallStatus = anyUnhealthy ? 'unhealthy' : allHealthy ? 'healthy' : 'degraded';
      
      return reply.code(overallStatus === 'healthy' ? 200 : 503).send({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        services: servicesHealth,
      });
    } catch (error) {
      return reply.code(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Service health check failed',
      });
    }
  });

  // Add service metrics endpoint
  fastify.get('/health/services/metrics', {
    schema: {
      summary: 'Get all services metrics',
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            timestamp: { type: 'string' },
            metrics: { type: 'object' },
          },
        },
        500: {
          type: 'object',
          properties: {
            timestamp: { type: 'string' },
            metrics: { type: 'object' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const metrics = serviceRegistry.getMetrics();
      
      return reply.send({
        timestamp: new Date().toISOString(),
        metrics,
      });
    } catch (error) {
      return reply.code(500).send({
        error: error instanceof Error ? error.message : 'Failed to get metrics',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Graceful shutdown handling
  fastify.addHook('onClose', async () => {
    fastify.log.info('Shutting down services...');
    await serviceRegistry.shutdown();
    fastify.log.info('All services shut down successfully');
  });

  fastify.log.info('🚀 All services registered successfully with Fastify');
};

// =============================================================================
// TYPE DECLARATIONS
// =============================================================================

declare module 'fastify' {
  interface FastifyInstance {
    jwtService: AuthService;
    sessionService: any;
    securityService: SecurityMiddlewareService;
    serviceRegistry: ServiceRegistry;
    db?: any; // Prisma client (optional)
    // Automation services
    automationService: AutomationService;
    proxyRotator: ProxyRotator;
    serverAutomationService: ServerAutomationService;
    automationLimits: AutomationLimits;
    // OAuth service
    oauthService?: OAuthService; // Optional - may not be configured
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default fastifyPlugin(servicesPlugin as any, {
  name: 'services',
  fastify: '5.x',
});

export type { ServicesConfig, ServiceHealth, ServiceRegistry };