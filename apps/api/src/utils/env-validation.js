"use strict";
/**
 * @fileoverview Environment Variables Validation Utility
 * @description Validates and provides type-safe access to environment variables
 * @version 1.0.0
 * @author JobSwipe Team
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnvironment = validateEnvironment;
exports.getEnvironmentConfig = getEnvironmentConfig;
var zod_1 = require("zod");
// =============================================================================
// ENVIRONMENT VALIDATION SCHEMAS
// =============================================================================
var NodeEnvSchema = zod_1.z.enum(['development', 'production', 'test']).default('development');
var DatabaseConfigSchema = zod_1.z.object({
    url: zod_1.z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),
    poolSize: zod_1.z.coerce.number().min(1).max(100).default(10),
    connectionTimeout: zod_1.z.coerce.number().min(1000).default(30000),
    idleTimeout: zod_1.z.coerce.number().min(1000).default(10000),
});
var RedisConfigSchema = zod_1.z.object({
    url: zod_1.z.string().url('REDIS_URL must be a valid Redis connection string'),
    host: zod_1.z.string().min(1).default('localhost'),
    port: zod_1.z.coerce.number().min(1).max(65535).default(6379),
    password: zod_1.z.string().optional(),
    db: zod_1.z.coerce.number().min(0).max(15).default(0),
    maxConnections: zod_1.z.coerce.number().min(1).max(100).default(10),
    connectionTimeout: zod_1.z.coerce.number().min(1000).default(5000),
});
var JWTConfigSchema = zod_1.z.object({
    secret: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    accessTokenExpiresIn: zod_1.z.coerce.number().min(300).default(3600),
    refreshTokenExpiresIn: zod_1.z.coerce.number().min(3600).default(604800),
    issuer: zod_1.z.string().default('jobswipe-api'),
    audience: zod_1.z.string().default('jobswipe-users'),
});
var ServerConfigSchema = zod_1.z.object({
    port: zod_1.z.coerce.number().min(1).max(65535).default(3001),
    host: zod_1.z.string().default('0.0.0.0'),
    corsOrigin: zod_1.z.string().transform(function (val) { return val.split(','); }).default('http://localhost:3000'),
    corsCredentials: zod_1.z.coerce.boolean().default(true),
});
var AutomationConfigSchema = zod_1.z.object({
    enabled: zod_1.z.coerce.boolean().default(true),
    maxServerApplicationsPerUser: zod_1.z.coerce.number().min(1).max(50).default(15),
    maxDailyApplicationsPerUser: zod_1.z.coerce.number().min(1).max(200).default(50),
    pythonExecutable: zod_1.z.string().default('python3'),
    pythonVenvPath: zod_1.z.string().optional(),
    automationTimeout: zod_1.z.coerce.number().min(30000).default(300000),
    greenhouseEnabled: zod_1.z.coerce.boolean().default(true),
    linkedinEnabled: zod_1.z.coerce.boolean().default(true),
    indeedEnabled: zod_1.z.coerce.boolean().default(true),
});
var ProxyConfigSchema = zod_1.z.object({
    enabled: zod_1.z.coerce.boolean().default(true),
    provider: zod_1.z.enum(['brightdata', 'oxylabs', 'custom']).default('brightdata'),
    list: zod_1.z.string().transform(function (val) {
        try {
            return JSON.parse(val);
        }
        catch (_a) {
            return [];
        }
    }).default('[]'),
    brightdata: zod_1.z.object({
        username: zod_1.z.string().optional(),
        password: zod_1.z.string().optional(),
        endpoint: zod_1.z.string().default('brd.superproxy.io'),
        port: zod_1.z.coerce.number().default(22225),
    }),
    oxylabs: zod_1.z.object({
        username: zod_1.z.string().optional(),
        password: zod_1.z.string().optional(),
        endpoint: zod_1.z.string().default('pr.oxylabs.io'),
        port: zod_1.z.coerce.number().default(7777),
    }),
});
var QueueConfigSchema = zod_1.z.object({
    enabled: zod_1.z.coerce.boolean().default(true),
    defaultJobOptions: zod_1.z.string().transform(function (val) {
        try {
            return JSON.parse(val);
        }
        catch (_a) {
            return {
                removeOnComplete: 100,
                removeOnFail: 50,
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 }
            };
        }
    }),
    concurrency: zod_1.z.coerce.number().min(1).max(50).default(5),
    maxStalledCount: zod_1.z.coerce.number().min(1).default(1),
    stalledInterval: zod_1.z.coerce.number().min(1000).default(30000),
});
var WebSocketConfigSchema = zod_1.z.object({
    enabled: zod_1.z.coerce.boolean().default(true),
    corsOrigin: zod_1.z.string().transform(function (val) { return val.split(','); }).default('http://localhost:3000'),
    path: zod_1.z.string().default('/socket.io'),
    transports: zod_1.z.string().transform(function (val) {
        try {
            return JSON.parse(val);
        }
        catch (_a) {
            return ['polling', 'websocket'];
        }
    }).default('["polling","websocket"]'),
});
var SecurityConfigSchema = zod_1.z.object({
    enabled: zod_1.z.coerce.boolean().default(true),
    csrfEnabled: zod_1.z.coerce.boolean().default(true),
    csrfSecret: zod_1.z.string().min(32).optional(),
    securityHeadersEnabled: zod_1.z.coerce.boolean().default(true),
    cspEnabled: zod_1.z.coerce.boolean().default(true),
    hstsEnabled: zod_1.z.coerce.boolean().default(true),
    attackDetectionEnabled: zod_1.z.coerce.boolean().default(true),
    xssProtectionEnabled: zod_1.z.coerce.boolean().default(true),
    sqlInjectionDetectionEnabled: zod_1.z.coerce.boolean().default(true),
});
var MonitoringConfigSchema = zod_1.z.object({
    enabled: zod_1.z.coerce.boolean().default(true),
    metricsEnabled: zod_1.z.coerce.boolean().default(true),
    auditLoggingEnabled: zod_1.z.coerce.boolean().default(true),
    errorTrackingEnabled: zod_1.z.coerce.boolean().default(false),
    sentryDsn: zod_1.z.string().optional(),
});
var RateLimitConfigSchema = zod_1.z.object({
    enabled: zod_1.z.coerce.boolean().default(true),
    windowMs: zod_1.z.coerce.number().min(1000).default(900000),
    maxRequests: zod_1.z.coerce.number().min(1).default(100),
    skipSuccessfulRequests: zod_1.z.coerce.boolean().default(false),
});
// =============================================================================
// MAIN ENVIRONMENT CONFIG SCHEMA
// =============================================================================
var EnvironmentConfigSchema = zod_1.z.object({
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
    logLevel: zod_1.z.enum(['error', 'warn', 'info', 'debug', 'trace']).default('info'),
    developmentMode: zod_1.z.coerce.boolean().default(true),
    swaggerEnabled: zod_1.z.coerce.boolean().default(true),
});
// =============================================================================
// ENVIRONMENT VALIDATION FUNCTION
// =============================================================================
function validateEnvironment() {
    try {
        var rawConfig = {
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
        var validatedConfig = EnvironmentConfigSchema.parse(rawConfig);
        console.log('✅ Environment validation successful');
        return validatedConfig;
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            console.error('❌ Environment validation failed:');
            error.errors.forEach(function (err) {
                console.error("  - ".concat(err.path.join('.'), ": ").concat(err.message));
            });
            throw new Error('Environment validation failed. Please check your environment variables.');
        }
        throw error;
    }
}
// =============================================================================
// SINGLETON INSTANCE
// =============================================================================
var environmentConfig = null;
function getEnvironmentConfig() {
    if (!environmentConfig) {
        environmentConfig = validateEnvironment();
    }
    return environmentConfig;
}
