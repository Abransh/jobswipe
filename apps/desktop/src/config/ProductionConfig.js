"use strict";
/**
 * @fileoverview Production Configuration Management
 * @description Centralized configuration for production deployment
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Environment-based configuration with validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.productionConfig = void 0;
exports.reloadConfig = reloadConfig;
exports.getConfigSummary = getConfigSummary;
var dotenv_1 = require("dotenv");
var fs_1 = require("fs");
var path_1 = require("path");
// Load environment variables
var envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
var envPath = path_1.default.join(__dirname, '../../', envFile);
if ((0, fs_1.existsSync)(envPath)) {
    (0, dotenv_1.config)({ path: envPath });
}
else {
    console.warn("\u26A0\uFE0F Environment file not found: ".concat(envPath));
    (0, dotenv_1.config)(); // Load from system environment
}
// =============================================================================
// CONFIGURATION FACTORY
// =============================================================================
var ProductionConfigFactory = /** @class */ (function () {
    function ProductionConfigFactory() {
    }
    ProductionConfigFactory.getConfig = function () {
        if (!this.instance) {
            this.instance = this.createConfig();
            this.validateConfig(this.instance);
        }
        return this.instance;
    };
    ProductionConfigFactory.createConfig = function () {
        var isProduction = process.env.NODE_ENV === 'production';
        var isDemoMode = process.env.DEMO_MODE === 'true';
        return {
            environment: process.env.NODE_ENV || 'development',
            debug: process.env.DEBUG_MODE === 'true',
            demoMode: isDemoMode,
            ai: {
                anthropic: {
                    apiKey: process.env.ANTHROPIC_API_KEY || '',
                    model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
                    maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4000'),
                    temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.1')
                },
                openai: process.env.OPENAI_API_KEY ? {
                    apiKey: process.env.OPENAI_API_KEY,
                    model: process.env.OPENAI_MODEL || 'gpt-4-vision-preview'
                } : undefined,
                vision: {
                    providers: this.createVisionProviders(),
                    fallbackStrategy: 'waterfall',
                    timeoutMs: parseInt(process.env.VISION_TIMEOUT || '30000')
                }
            },
            database: {
                url: process.env.DATABASE_URL || 'sqlite:./dev.db',
                pool: {
                    min: parseInt(process.env.DB_POOL_MIN || '2'),
                    max: parseInt(process.env.DB_POOL_MAX || '10')
                },
                migrations: {
                    directory: './migrations',
                    autoRun: !isProduction
                }
            },
            queue: {
                redis: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379'),
                    password: process.env.REDIS_PASSWORD,
                    db: parseInt(process.env.REDIS_DB || '0')
                },
                performance: {
                    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || (isDemoMode ? '2' : '10')),
                    maxRetryAttempts: parseInt(process.env.QUEUE_MAX_RETRY_ATTEMPTS || '3'),
                    retryDelay: parseInt(process.env.QUEUE_RETRY_DELAY || '5000'),
                    stalledInterval: parseInt(process.env.QUEUE_STALLED_INTERVAL || '30000'),
                    maxStalledCount: parseInt(process.env.QUEUE_MAX_STALLED_COUNT || '2')
                },
                batching: {
                    enabled: process.env.QUEUE_BATCHING_ENABLED !== 'false',
                    batchSize: parseInt(process.env.QUEUE_BATCH_SIZE || (isDemoMode ? '5' : '25')),
                    batchDelay: parseInt(process.env.QUEUE_BATCH_DELAY || '3000'),
                    maxBatchWaitTime: parseInt(process.env.QUEUE_MAX_BATCH_WAIT || '30000')
                }
            },
            browser: {
                headless: process.env.DEFAULT_BROWSER_HEADLESS !== 'false',
                timeout: parseInt(process.env.BROWSER_TIMEOUT || '300000'),
                viewport: {
                    width: parseInt(process.env.BROWSER_VIEWPORT_WIDTH || '1920'),
                    height: parseInt(process.env.BROWSER_VIEWPORT_HEIGHT || '1080')
                },
                userAgent: process.env.BROWSER_USER_AGENT ||
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                screenshotEnabled: process.env.AUTOMATION_SCREENSHOT_ENABLED !== 'false',
                screenshotDir: process.env.AUTOMATION_SCREENSHOT_DIR || '/tmp/jobswipe-screenshots'
            },
            security: {
                csrf: {
                    enabled: process.env.ENABLE_CSRF_PROTECTION === 'true',
                    secret: process.env.CSRF_SECRET || 'default-csrf-secret'
                },
                rateLimiting: {
                    enabled: process.env.ENABLE_RATE_LIMITING === 'true',
                    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
                    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
                },
                encryption: {
                    algorithm: 'aes-256-gcm',
                    keyLength: 32
                }
            },
            monitoring: {
                enabled: process.env.ENABLE_PERFORMANCE_MONITORING === 'true',
                metricsInterval: parseInt(process.env.METRICS_COLLECTION_INTERVAL || '60000'),
                healthCheck: {
                    interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
                    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '10000')
                },
                alerting: {
                    thresholds: {
                        queueSize: parseInt(process.env.ALERT_QUEUE_SIZE_THRESHOLD || '1000'),
                        errorRate: parseFloat(process.env.ALERT_ERROR_RATE_THRESHOLD || '0.1'),
                        responseTime: parseInt(process.env.ALERT_RESPONSE_TIME_THRESHOLD || '10000'),
                        memoryUsage: parseFloat(process.env.ALERT_MEMORY_THRESHOLD || '0.85'),
                        cpuUsage: parseFloat(process.env.ALERT_CPU_THRESHOLD || '0.8')
                    },
                    webhookUrl: process.env.WEBHOOK_URL,
                    emailConfig: process.env.SMTP_HOST ? {
                        enabled: true,
                        smtp: {
                            host: process.env.SMTP_HOST,
                            port: parseInt(process.env.SMTP_PORT || '587'),
                            user: process.env.SMTP_USER || '',
                            password: process.env.SMTP_PASSWORD || ''
                        },
                        from: process.env.EMAIL_FROM || 'noreply@jobswipe.com'
                    } : undefined
                }
            },
            storage: {
                resumePath: process.env.RESUME_STORAGE_PATH || './storage/resumes',
                screenshotPath: process.env.SCREENSHOT_STORAGE_PATH || './storage/screenshots',
                logPath: process.env.LOG_STORAGE_PATH || './storage/logs',
                s3: process.env.AWS_S3_BUCKET ? {
                    bucket: process.env.AWS_S3_BUCKET,
                    region: process.env.AWS_S3_REGION || 'us-east-1'
                } : undefined
            },
            integrations: {
                webApp: process.env.WEB_APP_API_URL ? {
                    apiUrl: process.env.WEB_APP_API_URL,
                    apiKey: process.env.WEB_APP_API_KEY || ''
                } : undefined,
                webhook: process.env.WEBHOOK_URL ? {
                    url: process.env.WEBHOOK_URL,
                    secret: process.env.WEBHOOK_SECRET || ''
                } : undefined
            }
        };
    };
    ProductionConfigFactory.createVisionProviders = function () {
        var providers = [];
        // Claude Vision (Primary)
        if (process.env.ANTHROPIC_API_KEY) {
            providers.push({
                name: 'claudeVision',
                enabled: true,
                priority: 1,
                config: {
                    apiKey: process.env.ANTHROPIC_API_KEY,
                    model: 'claude-3-sonnet-20240229'
                }
            });
        }
        // Google Cloud Vision
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            providers.push({
                name: 'googleVision',
                enabled: true,
                priority: 2,
                config: {
                    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
                    projectId: process.env.GOOGLE_PROJECT_ID
                }
            });
        }
        // Azure Document AI
        if (process.env.AZURE_DOCUMENT_AI_KEY) {
            providers.push({
                name: 'azureDocumentAI',
                enabled: true,
                priority: 3,
                config: {
                    apiKey: process.env.AZURE_DOCUMENT_AI_KEY,
                    endpoint: process.env.AZURE_DOCUMENT_AI_ENDPOINT
                }
            });
        }
        // AWS Textract
        if (process.env.AWS_ACCESS_KEY_ID) {
            providers.push({
                name: 'awsTextract',
                enabled: true,
                priority: 4,
                config: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                    region: process.env.AWS_REGION || 'us-east-1'
                }
            });
        }
        // Tesseract OCR (Always available)
        providers.push({
            name: 'tesseractOCR',
            enabled: true,
            priority: 5,
            config: {}
        });
        // GPT-4V (Fallback)
        if (process.env.OPENAI_API_KEY) {
            providers.push({
                name: 'gpt4Vision',
                enabled: true,
                priority: 6,
                config: {
                    apiKey: process.env.OPENAI_API_KEY,
                    model: 'gpt-4-vision-preview'
                }
            });
        }
        return providers;
    };
    ProductionConfigFactory.validateConfig = function (config) {
        var errors = [];
        // Validate required AI configuration
        if (!config.ai.anthropic.apiKey) {
            errors.push('ANTHROPIC_API_KEY is required for AI automation');
        }
        // Validate database configuration in production
        if (config.environment === 'production' && config.database.url.includes('sqlite')) {
            errors.push('SQLite database not recommended for production. Use PostgreSQL.');
        }
        // Validate security configuration in production
        if (config.environment === 'production') {
            if (!config.security.csrf.enabled) {
                errors.push('CSRF protection should be enabled in production');
            }
            if (config.security.csrf.secret === 'default-csrf-secret') {
                errors.push('CSRF secret should be customized in production');
            }
        }
        // Validate monitoring configuration
        if (config.environment === 'production' && !config.monitoring.enabled) {
            console.warn('⚠️ Performance monitoring is disabled in production');
        }
        if (errors.length > 0) {
            console.error('❌ Configuration validation failed:');
            errors.forEach(function (error) { return console.error("   - ".concat(error)); });
            throw new Error("Configuration validation failed: ".concat(errors.join(', ')));
        }
        console.log('✅ Configuration validation passed');
    };
    return ProductionConfigFactory;
}());
// =============================================================================
// EXPORTS
// =============================================================================
exports.productionConfig = ProductionConfigFactory.getConfig();
function reloadConfig() {
    ProductionConfigFactory.instance = null;
    return ProductionConfigFactory.getConfig();
}
function getConfigSummary() {
    var _a;
    var config = exports.productionConfig;
    return {
        environment: config.environment,
        demoMode: config.demoMode,
        aiProviders: {
            anthropic: !!config.ai.anthropic.apiKey,
            openai: !!((_a = config.ai.openai) === null || _a === void 0 ? void 0 : _a.apiKey),
            visionProviders: config.ai.vision.providers.filter(function (p) { return p.enabled; }).length
        },
        database: config.database.url.startsWith('sqlite') ? 'SQLite' : 'PostgreSQL',
        redis: "".concat(config.queue.redis.host, ":").concat(config.queue.redis.port),
        browser: {
            headless: config.browser.headless,
            screenshots: config.browser.screenshotEnabled
        },
        security: {
            csrf: config.security.csrf.enabled,
            rateLimiting: config.security.rateLimiting.enabled
        },
        monitoring: config.monitoring.enabled,
        integrations: {
            webApp: !!config.integrations.webApp,
            webhook: !!config.integrations.webhook,
            email: !!config.monitoring.alerting.emailConfig
        }
    };
}
exports.default = exports.productionConfig;
