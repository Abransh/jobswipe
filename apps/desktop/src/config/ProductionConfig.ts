/**
 * @fileoverview Production Configuration Management
 * @description Centralized configuration for production deployment
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Environment-based configuration with validation
 */

import { config } from 'dotenv';
import { existsSync } from 'fs';
import path from 'path';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
const envPath = path.join(__dirname, '../../', envFile);

if (existsSync(envPath)) {
  config({ path: envPath });
} else {
  console.warn(`⚠️ Environment file not found: ${envPath}`);
  config(); // Load from system environment
}

// =============================================================================
// CONFIGURATION INTERFACES
// =============================================================================

export interface AIServiceConfig {
  anthropic: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  gemini?: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  openai?: {
    apiKey: string;
    model: string;
  };
  vision: {
    providers: VisionProviderConfig[];
    fallbackStrategy: 'waterfall' | 'parallel';
    timeoutMs: number;
  };
}

export interface VisionProviderConfig {
  name: string;
  enabled: boolean;
  priority: number;
  config: Record<string, any>;
}

export interface DatabaseConfig {
  url: string;
  pool: {
    min: number;
    max: number;
  };
  migrations: {
    directory: string;
    autoRun: boolean;
  };
}

export interface QueueConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  performance: {
    concurrency: number;
    maxRetryAttempts: number;
    retryDelay: number;
    stalledInterval: number;
    maxStalledCount: number;
  };
  batching: {
    enabled: boolean;
    batchSize: number;
    batchDelay: number;
    maxBatchWaitTime: number;
  };
}

export interface BrowserConfig {
  headless: boolean;
  timeout: number;
  viewport: {
    width: number;
    height: number;
  };
  userAgent: string;
  screenshotEnabled: boolean;
  screenshotDir: string;
}

export interface SecurityConfig {
  csrf: {
    enabled: boolean;
    secret: string;
  };
  rateLimiting: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
  };
  encryption: {
    algorithm: string;
    keyLength: number;
  };
}

export interface MonitoringConfig {
  enabled: boolean;
  metricsInterval: number;
  healthCheck: {
    interval: number;
    timeout: number;
  };
  alerting: {
    thresholds: {
      queueSize: number;
      errorRate: number;
      responseTime: number;
      memoryUsage: number;
      cpuUsage: number;
    };
    webhookUrl?: string;
    emailConfig?: {
      enabled: boolean;
      smtp: {
        host: string;
        port: number;
        user: string;
        password: string;
      };
      from: string;
    };
  };
}

export interface ProductionConfig {
  environment: 'development' | 'production' | 'test';
  debug: boolean;
  demoMode: boolean;
  ai: AIServiceConfig;
  database: DatabaseConfig;
  queue: QueueConfig;
  browser: BrowserConfig;
  security: SecurityConfig;
  monitoring: MonitoringConfig;
  storage: {
    resumePath: string;
    screenshotPath: string;
    logPath: string;
    s3?: {
      bucket: string;
      region: string;
    };
  };
  integrations: {
    webApp?: {
      apiUrl: string;
      apiKey: string;
    };
    webhook?: {
      url: string;
      secret: string;
    };
  };
}

// =============================================================================
// CONFIGURATION FACTORY
// =============================================================================

class ProductionConfigFactory {
  private static instance: ProductionConfig;

  static getConfig(): ProductionConfig {
    if (!this.instance) {
      this.instance = this.createConfig();
      this.validateConfig(this.instance);
    }
    return this.instance;
  }

  private static createConfig(): ProductionConfig {
    const isProduction = process.env.NODE_ENV === 'production';
    const isDemoMode = process.env.DEMO_MODE === 'true';

    return {
      environment: (process.env.NODE_ENV as any) || 'development',
      debug: process.env.DEBUG_MODE === 'true',
      demoMode: isDemoMode,

      ai: {
        anthropic: {
          apiKey: process.env.ANTHROPIC_API_KEY || '',
          model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
          maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4000'),
          temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.1')
        },
        gemini: process.env.GEMINI_API_KEY ? {
          apiKey: process.env.GEMINI_API_KEY,
          model: process.env.GEMINI_MODEL || 'gemini-1.5-pro-vision-latest',
          maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '4000'),
          temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.1')
        } : undefined,
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
  }

  private static createVisionProviders(): VisionProviderConfig[] {
    const providers: VisionProviderConfig[] = [];

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
  }

  private static validateConfig(config: ProductionConfig): void {
    const errors: string[] = [];

    // Validate AI configuration - require at least one provider
    const hasAnthropic = !!config.ai.anthropic.apiKey;
    const hasGemini = !!config.ai.gemini?.apiKey;
    const hasOpenAI = !!config.ai.openai?.apiKey;
    
    if (!hasAnthropic && !hasGemini && !hasOpenAI) {
      errors.push('At least one AI provider API key is required (ANTHROPIC_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY)');
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
      errors.forEach(error => console.error(`   - ${error}`));
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }

    // Show available AI providers
    const availableProviders = [];
    if (config.ai.anthropic.apiKey) availableProviders.push('Anthropic Claude');
    if (config.ai.gemini?.apiKey) availableProviders.push('Google Gemini');
    if (config.ai.openai?.apiKey) availableProviders.push('OpenAI GPT-4');
    
    console.log(`🤖 Available AI providers: ${availableProviders.join(', ')}`);
    console.log('✅ Configuration validation passed');
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const productionConfig = ProductionConfigFactory.getConfig();

export function reloadConfig(): ProductionConfig {
  (ProductionConfigFactory as any).instance = null;
  return ProductionConfigFactory.getConfig();
}

export function getConfigSummary(): Record<string, any> {
  const config = productionConfig;
  
  return {
    environment: config.environment,
    demoMode: config.demoMode,
    aiProviders: {
      anthropic: !!config.ai.anthropic.apiKey,
      gemini: !!config.ai.gemini?.apiKey,
      openai: !!config.ai.openai?.apiKey,
      visionProviders: config.ai.vision.providers.filter(p => p.enabled).length
    },
    database: config.database.url.startsWith('sqlite') ? 'SQLite' : 'PostgreSQL',
    redis: `${config.queue.redis.host}:${config.queue.redis.port}`,
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

export default productionConfig;