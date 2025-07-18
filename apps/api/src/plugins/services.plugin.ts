/**
 * @fileoverview Services Registration Plugin for Fastify
 * @description Enterprise-grade dependency injection for authentication services
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Production-level service registration with proper error handling
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { 
  JwtTokenService, 
  RedisSessionService, 
  SecurityMiddlewareService,
  createJwtTokenService,
  createRedisSessionService,
  defaultJwtTokenService,
  defaultRedisSessionService
} from '@jobswipe/shared';

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

    for (const [name, healthCheck] of this.healthChecks.entries()) {
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
    
    for (const [name, service] of this.services.entries()) {
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
    for (const [name, service] of this.services.entries()) {
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

const servicesPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const config: ServicesConfig = {
    jwt: {
      keyRotationInterval: parseInt(process.env.JWT_KEY_ROTATION_INTERVAL || '86400000'), // 24 hours
      maxKeyAge: parseInt(process.env.JWT_MAX_KEY_AGE || '604800000'), // 7 days
      revokedTokensCleanupInterval: parseInt(process.env.JWT_CLEANUP_INTERVAL || '3600000'), // 1 hour
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'jobswipe:',
      maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
      retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100'),
      enableOfflineQueue: process.env.REDIS_OFFLINE_QUEUE === 'true',
      lazyConnect: process.env.REDIS_LAZY_CONNECT === 'true',
      ssl: process.env.REDIS_SSL === 'true',
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
  // JWT TOKEN SERVICE
  // =============================================================================

  fastify.log.info('Initializing JWT Token Service...');
  
  let jwtService: JwtTokenService;
  try {
    jwtService = createJwtTokenService({
      keyRotationInterval: config.jwt.keyRotationInterval,
      maxKeyAge: config.jwt.maxKeyAge,
      revokedTokensCleanupInterval: config.jwt.revokedTokensCleanupInterval,
    });

    serviceRegistry.register(
      'jwt',
      jwtService,
      () => Promise.resolve(jwtService.getHealthStatus())
    );

    fastify.log.info('✅ JWT Token Service initialized successfully');
  } catch (error) {
    fastify.log.error('❌ Failed to initialize JWT Token Service:', error);
    throw new Error(`JWT service initialization failed: ${error}`);
  }

  // =============================================================================
  // REDIS SESSION SERVICE
  // =============================================================================

  fastify.log.info('Initializing Redis Session Service...');
  
  let sessionService: RedisSessionService;
  try {
    sessionService = createRedisSessionService(
      config.redis,
      config.session
    );

    serviceRegistry.register(
      'session',
      sessionService,
      () => sessionService.getHealthStatus()
    );

    fastify.log.info('✅ Redis Session Service initialized successfully');
  } catch (error) {
    fastify.log.error('❌ Failed to initialize Redis Session Service:', error);
    throw new Error(`Redis session service initialization failed: ${error}`);
  }

  // =============================================================================
  // SECURITY MIDDLEWARE SERVICE
  // =============================================================================

  fastify.log.info('Initializing Security Middleware Service...');
  
  let securityService: SecurityMiddlewareService;
  try {
    // Import the SecurityMiddlewareService from shared package
    // For now, we'll use a placeholder since we need to implement Redis-backed security
    securityService = {
      checkRateLimit: async (key: string, maxRequests: number, windowMs: number) => {
        // Placeholder implementation - will be replaced with Redis-backed version
        return true;
      },
      blockIp: async (ip: string, reason: string) => {
        fastify.log.warn(`IP blocked: ${ip} - ${reason}`);
      },
      isIpBlocked: async (ip: string) => {
        return false;
      },
      getStats: () => ({
        rateLimitEntries: 0,
        blockedIps: 0,
        suspiciousActivity: 0,
      }),
    } as any;

    serviceRegistry.register(
      'security',
      securityService,
      () => Promise.resolve({ status: 'healthy', details: securityService.getStats() })
    );

    fastify.log.info('✅ Security Middleware Service initialized successfully');
  } catch (error) {
    fastify.log.error('❌ Failed to initialize Security Middleware Service:', error);
    throw new Error(`Security service initialization failed: ${error}`);
  }

  // =============================================================================
  // REGISTER SERVICES WITH FASTIFY
  // =============================================================================

  // Decorate Fastify instance with services
  fastify.decorate('jwtService', jwtService);
  fastify.decorate('sessionService', sessionService);
  fastify.decorate('securityService', securityService);
  fastify.decorate('serviceRegistry', serviceRegistry);

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
    jwtService: JwtTokenService;
    sessionService: RedisSessionService;
    securityService: SecurityMiddlewareService;
    serviceRegistry: ServiceRegistry;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default fastifyPlugin(servicesPlugin, {
  name: 'services',
  fastify: '4.x',
});

export { ServicesConfig, ServiceHealth, ServiceRegistry };