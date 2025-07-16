/**
 * @fileoverview Configuration utilities for JobSwipe
 * @description Environment configuration and application settings
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { z } from 'zod';

// Define Environment type locally for now
export type Environment = 'development' | 'staging' | 'production' | 'test';

// =============================================================================
// ENVIRONMENT CONFIGURATION
// =============================================================================

/**
 * Database configuration schema
 */
const DatabaseConfigSchema = z.object({
  host: z.string().min(1),
  port: z.number().min(1).max(65535),
  name: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  ssl: z.boolean().default(false),
  maxConnections: z.number().min(1).default(20),
  connectionTimeout: z.number().min(1000).default(30000),
  idleTimeout: z.number().min(1000).default(30000),
});

/**
 * Redis configuration schema
 */
const RedisConfigSchema = z.object({
  host: z.string().min(1),
  port: z.number().min(1).max(65535),
  password: z.string().optional(),
  db: z.number().min(0).default(0),
  maxRetriesPerRequest: z.number().min(0).default(3),
  retryDelayOnFailover: z.number().min(100).default(100),
  connectTimeout: z.number().min(1000).default(10000),
  lazyConnect: z.boolean().default(true),
});

/**
 * JWT configuration schema
 */
const JwtConfigSchema = z.object({
  privateKey: z.string().min(1),
  publicKey: z.string().min(1),
  algorithm: z.literal('RS256'),
  issuer: z.string().min(1),
  audience: z.string().min(1),
  accessTokenExpiry: z.number().min(60).default(900), // 15 minutes
  refreshTokenExpiry: z.number().min(3600).default(2592000), // 30 days
  desktopTokenExpiry: z.number().min(86400).default(7776000), // 90 days
});

/**
 * CORS configuration schema
 */
const CorsConfigSchema = z.object({
  origin: z.union([z.string(), z.array(z.string()), z.boolean()]),
  methods: z.array(z.string()).default(['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']),
  allowedHeaders: z.array(z.string()).default(['Content-Type', 'Authorization']),
  credentials: z.boolean().default(true),
  maxAge: z.number().min(0).default(86400), // 24 hours
});

/**
 * Rate limiting configuration schema
 */
const RateLimitConfigSchema = z.object({
  windowMs: z.number().min(1000).default(900000), // 15 minutes
  maxRequests: z.number().min(1).default(100),
  skipSuccessfulRequests: z.boolean().default(false),
  skipFailedRequests: z.boolean().default(false),
  keyGenerator: z.function().optional(),
});

/**
 * Email configuration schema
 */
const EmailConfigSchema = z.object({
  provider: z.enum(['smtp', 'ses', 'sendgrid']),
  host: z.string().min(1).optional(),
  port: z.number().min(1).max(65535).optional(),
  secure: z.boolean().default(true),
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  from: z.string().email(),
  replyTo: z.string().email().optional(),
  apiKey: z.string().optional(),
  region: z.string().optional(),
});

/**
 * File storage configuration schema
 */
const StorageConfigSchema = z.object({
  provider: z.enum(['local', 's3', 'gcs']),
  bucket: z.string().min(1).optional(),
  region: z.string().optional(),
  accessKeyId: z.string().optional(),
  secretAccessKey: z.string().optional(),
  localPath: z.string().optional(),
  maxFileSize: z.number().min(1).default(10485760), // 10MB
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'application/pdf']),
});

/**
 * Application configuration schema
 */
const AppConfigSchema = z.object({
  name: z.string().min(1).default('JobSwipe'),
  version: z.string().min(1).default('1.0.0'),
  environment: z.enum(['development', 'staging', 'production', 'test']),
  port: z.number().min(1).max(65535).default(3000),
  host: z.string().min(1).default('localhost'),
  baseUrl: z.string().url(),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  enableMetrics: z.boolean().default(false),
  enableSwagger: z.boolean().default(false),
  trustProxy: z.boolean().default(false),
});

/**
 * Main configuration schema
 */
const ConfigSchema = z.object({
  app: AppConfigSchema,
  database: DatabaseConfigSchema,
  redis: RedisConfigSchema,
  jwt: JwtConfigSchema,
  cors: CorsConfigSchema,
  rateLimit: RateLimitConfigSchema,
  email: EmailConfigSchema,
  storage: StorageConfigSchema,
});

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export type RedisConfig = z.infer<typeof RedisConfigSchema>;
export type JwtConfig = z.infer<typeof JwtConfigSchema>;
export type CorsConfig = z.infer<typeof CorsConfigSchema>;
export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;
export type EmailConfig = z.infer<typeof EmailConfigSchema>;
export type StorageConfig = z.infer<typeof StorageConfigSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
export type Config = z.infer<typeof ConfigSchema>;

// =============================================================================
// CONFIGURATION LOADER
// =============================================================================

/**
 * Load configuration from environment variables
 */
export function loadConfig(): Config {
  const config = {
    app: {
      name: process.env.APP_NAME || 'JobSwipe',
      version: process.env.APP_VERSION || '1.0.0',
      environment: (process.env.NODE_ENV || 'development') as Environment,
      port: parseInt(process.env.PORT || '3000', 10),
      host: process.env.HOST || 'localhost',
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      logLevel: (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
      enableMetrics: process.env.ENABLE_METRICS === 'true',
      enableSwagger: process.env.ENABLE_SWAGGER === 'true',
      trustProxy: process.env.TRUST_PROXY === 'true',
    },
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      name: process.env.DB_NAME || 'jobswipe',
      username: process.env.DB_USER || 'jobswipe',
      password: process.env.DB_PASSWORD || 'password',
      ssl: process.env.DB_SSL === 'true',
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000', 10),
      idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
      retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100', 10),
      connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000', 10),
      lazyConnect: process.env.REDIS_LAZY_CONNECT !== 'false',
    },
    jwt: {
      privateKey: process.env.JWT_PRIVATE_KEY || '',
      publicKey: process.env.JWT_PUBLIC_KEY || '',
      algorithm: 'RS256' as const,
      issuer: process.env.JWT_ISSUER || 'jobswipe.com',
      audience: process.env.JWT_AUDIENCE || 'jobswipe-api',
      accessTokenExpiry: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRY || '900', 10),
      refreshTokenExpiry: parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRY || '2592000', 10),
      desktopTokenExpiry: parseInt(process.env.JWT_DESKTOP_TOKEN_EXPIRY || '7776000', 10),
    },
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: (process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,OPTIONS').split(','),
      allowedHeaders: (process.env.CORS_ALLOWED_HEADERS || 'Content-Type,Authorization').split(','),
      credentials: process.env.CORS_CREDENTIALS !== 'false',
      maxAge: parseInt(process.env.CORS_MAX_AGE || '86400', 10),
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
      skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESSFUL === 'true',
      skipFailedRequests: process.env.RATE_LIMIT_SKIP_FAILED === 'true',
    },
    email: {
      provider: (process.env.EMAIL_PROVIDER || 'smtp') as 'smtp' | 'ses' | 'sendgrid',
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : undefined,
      secure: process.env.EMAIL_SECURE !== 'false',
      username: process.env.EMAIL_USERNAME,
      password: process.env.EMAIL_PASSWORD,
      from: process.env.EMAIL_FROM || 'noreply@jobswipe.com',
      replyTo: process.env.EMAIL_REPLY_TO,
      apiKey: process.env.EMAIL_API_KEY,
      region: process.env.EMAIL_REGION,
    },
    storage: {
      provider: (process.env.STORAGE_PROVIDER || 'local') as 'local' | 's3' | 'gcs',
      bucket: process.env.STORAGE_BUCKET,
      region: process.env.STORAGE_REGION,
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
      localPath: process.env.STORAGE_LOCAL_PATH || './uploads',
      maxFileSize: parseInt(process.env.STORAGE_MAX_FILE_SIZE || '10485760', 10),
      allowedTypes: (process.env.STORAGE_ALLOWED_TYPES || 'image/jpeg,image/png,application/pdf').split(','),
    },
  };

  // Validate configuration
  return ConfigSchema.parse(config);
}

// =============================================================================
// CONFIGURATION UTILITIES
// =============================================================================

/**
 * Check if we're in development environment
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if we're in production environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if we're in test environment
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Get required environment variable
 */
export function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

/**
 * Get optional environment variable with default
 */
export function getOptionalEnvVar(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

/**
 * Get boolean environment variable
 */
export function getBooleanEnvVar(name: string, defaultValue: boolean = false): boolean {
  const value = process.env[name];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Get number environment variable
 */
export function getNumberEnvVar(name: string, defaultValue: number): number {
  const value = process.env[name];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }
  return parsed;
}

/**
 * Validate configuration object
 */
export function validateConfig(config: unknown): Config {
  try {
    return ConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('\n');
      throw new Error(`Configuration validation failed:\n${issues}`);
    }
    throw error;
  }
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

/**
 * Default configuration instance
 */
let defaultConfig: Config | null = null;

/**
 * Get default configuration (singleton)
 */
export function getConfig(): Config {
  if (!defaultConfig) {
    defaultConfig = loadConfig();
  }
  return defaultConfig;
}

/**
 * Reset default configuration (useful for testing)
 */
export function resetConfig(): void {
  defaultConfig = null;
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  ConfigSchema,
  DatabaseConfigSchema,
  RedisConfigSchema,
  JwtConfigSchema,
  CorsConfigSchema,
  RateLimitConfigSchema,
  EmailConfigSchema,
  StorageConfigSchema,
  AppConfigSchema,
};