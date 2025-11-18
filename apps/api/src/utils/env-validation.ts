/**
 * @fileoverview Environment Variables Validation Utility
 * @description Validates and provides type-safe access to environment variables
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { z } from 'zod';

// =============================================================================
// ENVIRONMENT VALIDATION SCHEMAS
// =============================================================================

const NodeEnvSchema = z.enum(['development', 'production', 'test']).default('development');

const DatabaseConfigSchema = z.object({
  url: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),
  poolSize: z.coerce.number().min(1).max(100).default(10),
  connectionTimeout: z.coerce.number().min(1000).default(30000),
  idleTimeout: z.coerce.number().min(1000).default(10000),
});

const RedisConfigSchema = z.object({
  url: z.string().url('REDIS_URL must be a valid Redis connection string'),
  host: z.string().min(1).default('localhost'),
  port: z.coerce.number().min(1).max(65535).default(6379),
  password: z.string().optional(),
  db: z.coerce.number().min(0).max(15).default(0),
  maxConnections: z.coerce.number().min(1).max(100).default(10),
  connectionTimeout: z.coerce.number().min(1000).default(5000),
});

const JWTConfigSchema = z.object({
  secret: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  accessTokenExpiresIn: z.coerce.number().min(300).default(3600),
  refreshTokenExpiresIn: z.coerce.number().min(3600).default(604800),
  issuer: z.string().default('jobswipe-api'),
  audience: z.string().default('jobswipe-users'),
});

const ServerConfigSchema = z.object({
  port: z.coerce.number().min(1).max(65535).default(3001),
  host: z.string().default('0.0.0.0'),
  corsOrigin: z.string().transform(val => val.split(',')).default(() => ['http://localhost:3000']),
  corsCredentials: z.coerce.boolean().default(true),
});

const AutomationConfigSchema = z.object({
  enabled: z.coerce.boolean().default(true),
  maxServerApplicationsPerUser: z.coerce.number().min(1).max(50).default(15),
  maxDailyApplicationsPerUser: z.coerce.number().min(1).max(200).default(50),
  pythonExecutable: z.string().default('python3'),
  pythonVenvPath: z.string().optional(),
  automationTimeout: z.coerce.number().min(30000).default(300000),
  greenhouseEnabled: z.coerce.boolean().default(true),
  linkedinEnabled: z.coerce.boolean().default(true),
  indeedEnabled: z.coerce.boolean().default(true),
});

const ProxyConfigSchema = z.object({
  enabled: z.coerce.boolean().default(true),
  provider: z.enum(['brightdata', 'oxylabs', 'custom']).default('brightdata'),
  list: z.string().transform(val => {
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }).default('[]'),
  brightdata: z.object({
    username: z.string().optional(),
    password: z.string().optional(),
    endpoint: z.string().default('brd.superproxy.io'),
    port: z.coerce.number().default(22225),
  }),
  oxylabs: z.object({
    username: z.string().optional(),
    password: z.string().optional(),
    endpoint: z.string().default('pr.oxylabs.io'),
    port: z.coerce.number().default(7777),
  }),
});

const QueueConfigSchema = z.object({
  enabled: z.coerce.boolean().default(true),
  defaultJobOptions: z.string().transform(val => {
    try {
      return JSON.parse(val);
    } catch {
      return {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
      };
    }
  }),
  concurrency: z.coerce.number().min(1).max(50).default(5),
  maxStalledCount: z.coerce.number().min(1).default(1),
  stalledInterval: z.coerce.number().min(1000).default(30000),
});

const WebSocketConfigSchema = z.object({
  enabled: z.coerce.boolean().default(true),
  corsOrigin: z.string().transform(val => val.split(',')).default(() => ['http://localhost:3000']),
  path: z.string().default('/socket.io'),
  transports: z.string().transform(val => {
    try {
      return JSON.parse(val);
    } catch {
      return ['polling', 'websocket'];
    }
  }).default('["polling","websocket"]'),
});

const SecurityConfigSchema = z.object({
  enabled: z.coerce.boolean().default(true),
  csrfEnabled: z.coerce.boolean().default(true),
  csrfSecret: z.string().min(32).optional(),
  securityHeadersEnabled: z.coerce.boolean().default(true),
  cspEnabled: z.coerce.boolean().default(true),
  hstsEnabled: z.coerce.boolean().default(true),
  attackDetectionEnabled: z.coerce.boolean().default(true),
  xssProtectionEnabled: z.coerce.boolean().default(true),
  sqlInjectionDetectionEnabled: z.coerce.boolean().default(true),
});

const MonitoringConfigSchema = z.object({
  enabled: z.coerce.boolean().default(true),
  metricsEnabled: z.coerce.boolean().default(true),
  auditLoggingEnabled: z.coerce.boolean().default(true),
  errorTrackingEnabled: z.coerce.boolean().default(false),
  sentryDsn: z.string().optional(),
});

const RateLimitConfigSchema = z.object({
  enabled: z.coerce.boolean().default(true),
  windowMs: z.coerce.number().min(1000).default(900000),
  maxRequests: z.coerce.number().min(1).default(100),
  skipSuccessfulRequests: z.coerce.boolean().default(false),
});

// =============================================================================
// MAIN ENVIRONMENT CONFIG SCHEMA
// =============================================================================

const EnvironmentConfigSchema = z.object({
  nodeEnv: NodeEnvSchema,
  database: DatabaseConfigSchema,
  redis: RedisConfigSchema,
  jwt: JWTConfigSchema,
  server: ServerConfigSchema,
  automation: AutomationConfigSchema,
  proxy: ProxyConfigSchema,
  queue: QueueConfigSchema,
  websocket: WebSocketConfigSchema,
  security: SecurityConfigSchema,
  monitoring: MonitoringConfigSchema,
  rateLimit: RateLimitConfigSchema,
  logLevel: z.enum(['error', 'warn', 'info', 'debug', 'trace']).default('info'),
  developmentMode: z.coerce.boolean().default(true),
  swaggerEnabled: z.coerce.boolean().default(true),
});

// =============================================================================
// ENVIRONMENT VALIDATION FUNCTION
// =============================================================================

export function validateEnvironment() {
  try {
    const rawConfig = {
      nodeEnv: process.env.NODE_ENV,
      database: {
        url: process.env.DATABASE_URL,
        poolSize: process.env.DATABASE_POOL_SIZE,
        connectionTimeout: process.env.DATABASE_CONNECTION_TIMEOUT,
        idleTimeout: process.env.DATABASE_IDLE_TIMEOUT,
      },
      redis: {
        url: process.env.REDIS_URL,
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DB,
        maxConnections: process.env.REDIS_MAX_CONNECTIONS,
        connectionTimeout: process.env.REDIS_CONNECTION_TIMEOUT,
      },
      jwt: {
        secret: process.env.JWT_SECRET,
        accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
        refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
      },
      server: {
        port: process.env.API_PORT,
        host: process.env.API_HOST,
        corsOrigin: process.env.API_CORS_ORIGIN,
        corsCredentials: process.env.API_CORS_CREDENTIALS,
      },
      automation: {
        enabled: process.env.SERVER_AUTOMATION_ENABLED,
        maxServerApplicationsPerUser: process.env.MAX_SERVER_APPLICATIONS_PER_USER,
        maxDailyApplicationsPerUser: process.env.MAX_DAILY_APPLICATIONS_PER_USER,
        pythonExecutable: process.env.PYTHON_EXECUTABLE,
        pythonVenvPath: process.env.PYTHON_VENV_PATH,
        automationTimeout: process.env.AUTOMATION_TIMEOUT,
        greenhouseEnabled: process.env.GREENHOUSE_ENABLED,
        linkedinEnabled: process.env.LINKEDIN_ENABLED,
        indeedEnabled: process.env.INDEED_ENABLED,
      },
      proxy: {
        enabled: process.env.PROXY_ROTATION_ENABLED,
        provider: process.env.PROXY_PROVIDER,
        list: process.env.PROXY_LIST,
        brightdata: {
          username: process.env.BRIGHTDATA_USERNAME,
          password: process.env.BRIGHTDATA_PASSWORD,
          endpoint: process.env.BRIGHTDATA_ENDPOINT,
          port: process.env.BRIGHTDATA_PORT,
        },
        oxylabs: {
          username: process.env.OXYLABS_USERNAME,
          password: process.env.OXYLABS_PASSWORD,
          endpoint: process.env.OXYLABS_ENDPOINT,
          port: process.env.OXYLABS_PORT,
        },
      },
      queue: {
        enabled: process.env.QUEUE_ENABLED,
        defaultJobOptions: process.env.QUEUE_DEFAULT_JOB_OPTIONS,
        concurrency: process.env.QUEUE_CONCURRENCY,
        maxStalledCount: process.env.QUEUE_MAX_STALLED_COUNT,
        stalledInterval: process.env.QUEUE_STALLED_INTERVAL,
      },
      websocket: {
        enabled: process.env.WEBSOCKET_ENABLED,
        corsOrigin: process.env.WEBSOCKET_CORS_ORIGIN,
        path: process.env.WEBSOCKET_PATH,
        transports: process.env.WEBSOCKET_TRANSPORTS,
      },
      security: {
        enabled: process.env.SECURITY_ENABLED,
        csrfEnabled: process.env.CSRF_ENABLED,
        csrfSecret: process.env.CSRF_SECRET,
        securityHeadersEnabled: process.env.SECURITY_HEADERS_ENABLED,
        cspEnabled: process.env.CSP_ENABLED,
        hstsEnabled: process.env.HSTS_ENABLED,
        attackDetectionEnabled: process.env.ATTACK_DETECTION_ENABLED,
        xssProtectionEnabled: process.env.XSS_PROTECTION_ENABLED,
        sqlInjectionDetectionEnabled: process.env.SQL_INJECTION_DETECTION_ENABLED,
      },
      monitoring: {
        enabled: process.env.MONITORING_ENABLED,
        metricsEnabled: process.env.METRICS_ENABLED,
        auditLoggingEnabled: process.env.AUDIT_LOGGING_ENABLED,
        errorTrackingEnabled: process.env.ERROR_TRACKING_ENABLED,
        sentryDsn: process.env.SENTRY_DSN,
      },
      rateLimit: {
        enabled: process.env.RATE_LIMIT_ENABLED,
        windowMs: process.env.RATE_LIMIT_WINDOW,
        maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS,
        skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS,
      },
      logLevel: process.env.LOG_LEVEL,
      developmentMode: process.env.DEVELOPMENT_MODE,
      swaggerEnabled: process.env.SWAGGER_ENABLED,
    };

    const validatedConfig = EnvironmentConfigSchema.parse(rawConfig);

    console.log('✅ Environment validation successful');
    return validatedConfig;

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.issues.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });

      throw new Error('Environment validation failed. Please check your environment variables.');
    }

    throw error;
  }
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type EnvironmentConfig = z.infer<typeof EnvironmentConfigSchema>;
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export type RedisConfig = z.infer<typeof RedisConfigSchema>;
export type JWTConfig = z.infer<typeof JWTConfigSchema>;
export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export type AutomationConfig = z.infer<typeof AutomationConfigSchema>;
export type ProxyConfig = z.infer<typeof ProxyConfigSchema>;
export type QueueConfig = z.infer<typeof QueueConfigSchema>;
export type WebSocketConfig = z.infer<typeof WebSocketConfigSchema>;
export type SecurityConfig = z.infer<typeof SecurityConfigSchema>;
export type MonitoringConfig = z.infer<typeof MonitoringConfigSchema>;
export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let environmentConfig: EnvironmentConfig | null = null;

export function getEnvironmentConfig(): EnvironmentConfig {
  if (!environmentConfig) {
    environmentConfig = validateEnvironment();
  }
  return environmentConfig;
}