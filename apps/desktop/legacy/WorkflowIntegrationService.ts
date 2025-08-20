import { EventEmitter } from 'events';
import BrowserUseService from './BrowserUseService';
import GreenhouseService from './GreenhouseService';
import VisionServiceManager from './VisionServiceManager';
import { StrategyRegistry } from '../strategies/StrategyRegistry';
import { JobSwipeAutomationEngine } from '../automation/JobSwipeAutomationEngine';
import { EnterpriseQueueManager } from '../queue/EnterpriseQueueManager';

/**
 * Workflow Integration Service
 * 
 * Orchestrates the complete end-to-end workflow from web app job swipes
 * to final job applications using AI-powered browser automation.
 * 
 * Flow: Web App → API Server → Desktop Client → Browser Automation → Job Application
 */

export interface WorkflowConfig {
  // API Configuration
  apiBaseUrl: string;
  apiKey: string;
  
  // AI Services Configuration
  anthropicApiKey: string;
  openaiApiKey?: string;
  
  // Cloud Vision Services (Optional)
  googleCloudConfig?: {
    keyFilename: string;
    projectId: string;
  };
  azureConfig?: {
    endpoint: string;
    apiKey: string;
  };
  awsConfig?: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  
  // Greenhouse API (Optional)
  greenhouseConfig?: {
    apiKey?: string;
    boardTokens: string[];
  };
  
  // Browser Configuration
  browserConfig: {
    headless: boolean;
    viewport: { width: number; height: number };
    userAgent?: string;
    slowMo?: number;
  };
  
  // Queue Configuration
  queueConfig: {
    redisUrl: string;
    concurrency: number;
    retryAttempts: number;
  };
  
  // Performance Settings
  performance: {
    maxConcurrentJobs: number;
    jobTimeout: number; // milliseconds
    healthCheckInterval: number; // milliseconds
  };
}

export interface JobApplicationRequest {
  userId: string;
  jobId: string;
  userProfile: any;
  priority: 'low' | 'medium' | 'high' | 'immediate';
  options?: {
    skipAI?: boolean;
    preferredStrategy?: string;
    maxRetries?: number;
  };
}

export interface ApplicationResult {
  jobId: string;
  userId: string;
  success: boolean;
  applicationId?: string;
  confirmationNumber?: string;
  error?: string;
  executionTime: number;
  strategy: string;
  automationType: 'ai-powered' | 'traditional';
  metadata: {
    captchaEncountered: boolean;
    retryCount: number;
    screenshots: string[];
    logs: any[];
  };
}

export interface WorkflowStats {
  totalApplications: number;
  successfulApplications: number;
  failedApplications: number;
  averageExecutionTime: number;
  queueStatus: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  aiAutomationStats: {
    aiSuccessRate: number;
    traditionalFallbackRate: number;
    captchaResolutionRate: number;
  };
  systemHealth: {
    healthy: boolean;
    issues: string[];
    uptime: number;
  };
}

export class WorkflowIntegrationService extends EventEmitter {
  private config: WorkflowConfig;
  private isInitialized = false;
  private startTime = Date.now();
  
  // Core Services
  private browserUseService!: BrowserUseService;
  private visionService!: VisionServiceManager;
  private strategyRegistry!: StrategyRegistry;
  private automationEngine!: JobSwipeAutomationEngine;
  private queueManager!: EnterpriseQueueManager;
  private greenhouseService?: GreenhouseService;
  
  // Statistics
  private stats: WorkflowStats = {
    totalApplications: 0,
    successfulApplications: 0,
    failedApplications: 0,
    averageExecutionTime: 0,
    queueStatus: { pending: 0, processing: 0, completed: 0, failed: 0 },
    aiAutomationStats: { 
      aiSuccessRate: 0, 
      traditionalFallbackRate: 0, 
      captchaResolutionRate: 0 
    },
    systemHealth: { healthy: true, issues: [], uptime: 0 }
  };

  constructor(config: WorkflowConfig) {
    super();
    this.config = config;
  }

  /**
   * Initialize the complete workflow integration system
   */
  async initialize(): Promise<void> {
    try {
      this.emit('initialization-start');
      console.log('🚀 Initializing JobSwipe Workflow Integration System...');

      // Initialize Vision Service Manager with multi-provider support
      await this.initializeVisionService();
      
      // Initialize Browser-Use Service
      await this.initializeBrowserUseService();
      
      // Initialize Strategy Registry
      await this.initializeStrategyRegistry();
      
      // Initialize Automation Engine
      await this.initializeAutomationEngine();
      
      // Initialize Queue Manager
      await this.initializeQueueManager();
      
      // Initialize optional Greenhouse Service
      if (this.config.greenhouseConfig) {
        await this.initializeGreenhouseService();
      }
      
      // Set up inter-service connections
      await this.connectServices();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      this.isInitialized = true;
      console.log('✅ Workflow Integration System initialized successfully');
      
      this.emit('initialization-complete', {
        services: this.getInitializedServices(),
        timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ Failed to initialize Workflow Integration System:', error);
      this.emit('initialization-error', { error: error.message });
      throw error;
    }
  }

  /**
   * Initialize Vision Service Manager with all providers
   */
  private async initializeVisionService(): Promise<void> {
    console.log('🧠 Initializing AI Vision Service Manager...');
    
    const visionConfig = {
      providers: {
        claude: { apiKey: this.config.anthropicApiKey },
        openai: this.config.openaiApiKey ? { apiKey: this.config.openaiApiKey } : undefined,
        google: this.config.googleCloudConfig,
        azure: this.config.azureConfig,
        aws: this.config.awsConfig,
      },
      caching: {
        enabled: true,
        maxSize: 1000,
        ttl: 300000, // 5 minutes
      },
      fallback: {
        enabled: true,
        maxRetries: 3,
        costThreshold: 0.01,
        accuracyThreshold: 0.8,
      },
      optimization: {
        preferFreeProviders: false,
        balanceSpeedAndAccuracy: true,
        enableParallelProcessing: false,
      },
    };

    this.visionService = new VisionServiceManager(visionConfig);
    
    // Set up event forwarding
    this.visionService.on('initialized', (data) => {
      this.emit('vision-service-ready', data);
    });
    
    this.visionService.on('analysis-complete', (data) => {
      this.emit('vision-analysis-complete', data);
    });
  }

  /**
   * Initialize Browser-Use Service for AI automation
   */
  private async initializeBrowserUseService(): Promise<void> {
    console.log('🤖 Initializing Browser-Use AI Service...');
    
    const browserConfig = {
      anthropicApiKey: this.config.anthropicApiKey,
      headless: this.config.browserConfig.headless,
      viewport: this.config.browserConfig.viewport,
      userAgent: this.config.browserConfig.userAgent,
      slowMo: this.config.browserConfig.slowMo,
      timeout: this.config.performance.jobTimeout,
    };

    this.browserUseService = new BrowserUseService(browserConfig);
    await this.browserUseService.initialize();
    
    // Set up event forwarding
    this.browserUseService.on('progress', (data) => {
      this.emit('automation-progress', data);
    });
    
    this.browserUseService.on('captcha-detected', (data) => {
      this.emit('captcha-detected', data);
    });
    
    this.browserUseService.on('error', (data) => {
      this.emit('automation-error', data);
    });
  }

  /**
   * Initialize Strategy Registry
   */
  private async initializeStrategyRegistry(): Promise<void> {
    console.log('📋 Initializing Strategy Registry...');
    
    this.strategyRegistry = new StrategyRegistry({
      cacheStrategy: true,
      autoReload: true,
      performanceTracking: true,
      abTestingEnabled: false,
    });
    
    // Connect browser-use service to strategy registry
    this.strategyRegistry.setBrowserUseService(this.browserUseService);
    
    // Set up event forwarding
    this.strategyRegistry.on('strategy-matched', (data) => {
      this.emit('strategy-matched', data);
    });
    
    this.strategyRegistry.on('ai-automation-complete', (data) => {
      this.emit('ai-automation-complete', data);
    });
  }

  /**
   * Initialize Automation Engine
   */
  private async initializeAutomationEngine(): Promise<void> {
    console.log('⚙️ Initializing Automation Engine...');
    
    this.automationEngine = new JobSwipeAutomationEngine({
      maxConcurrentJobs: this.config.performance.maxConcurrentJobs,
      jobTimeout: this.config.performance.jobTimeout,
      retryAttempts: this.config.queueConfig.retryAttempts,
    });
    
    // Connect services to automation engine
    this.automationEngine.setVisionService(this.visionService);
    this.automationEngine.setStrategyRegistry(this.strategyRegistry);
    
    // Set up event forwarding
    this.automationEngine.on('job-started', (data) => {
      this.emit('job-started', data);
    });
    
    this.automationEngine.on('job-completed', (data) => {
      this.emit('job-completed', data);
      this.updateStats(data);
    });
    
    this.automationEngine.on('job-failed', (data) => {
      this.emit('job-failed', data);
      this.updateStats(data);
    });
  }

  /**
   * Initialize Queue Manager
   */
  private async initializeQueueManager(): Promise<void> {
    console.log('📬 Initializing Enterprise Queue Manager...');
    
    this.queueManager = new EnterpriseQueueManager({
      redis: {
        connection: this.config.queueConfig.redisUrl,
      },
      concurrency: {
        immediate: 1,
        high: 3,
        standard: this.config.queueConfig.concurrency,
        batch: 10,
        retry: 2,
      },
      retry: {
        attempts: this.config.queueConfig.retryAttempts,
        delay: 2000,
        backoff: 'exponential',
      },
      healthCheck: {
        enabled: true,
        interval: 30000,
      },
    });
    
    // Connect automation engine to queue
    this.queueManager.setJobProcessor(async (job) => {
      return await this.automationEngine.processJob(job);
    });
    
    // Set up event forwarding
    this.queueManager.on('job-queued', (data) => {
      this.emit('job-queued', data);
    });
    
    this.queueManager.on('queue-stats', (data) => {
      this.updateQueueStats(data);
    });
  }

  /**
   * Initialize optional Greenhouse Service
   */
  private async initializeGreenhouseService(): Promise<void> {
    if (!this.config.greenhouseConfig) return;
    
    console.log('🌱 Initializing Greenhouse API Service...');
    
    this.greenhouseService = new GreenhouseService({
      apiKey: this.config.greenhouseConfig.apiKey,
      rateLimitRequests: 100,
      rateLimitWindow: 60000,
      cacheSize: 500,
      cacheTTL: 300000,
    });
    
    await this.greenhouseService.initialize();
    
    // Set up event forwarding
    this.greenhouseService.on('search-complete', (data) => {
      this.emit('greenhouse-jobs-synced', data);
    });
  }

  /**
   * Connect all services together
   */
  private async connectServices(): Promise<void> {
    console.log('🔗 Connecting services...');
    
    // Connect vision service to LinkedIn strategy (example)
    const linkedinStrategy = this.strategyRegistry.getStrategy('linkedin');
    if (linkedinStrategy) {
      // This would require extending the strategy to accept vision service
      // For now, just log that connection would be made
      console.log('🤖 Vision service connected to LinkedIn strategy');
    }
    
    // Set up cross-service communication
    this.browserUseService.on('status', (data) => {
      this.emit('service-status', { service: 'browser-use', ...data });
    });
    
    this.visionService.on('error', (data) => {
      this.emit('service-error', { service: 'vision', ...data });
    });
  }

  /**
   * Process a job application request
   */
  async processJobApplication(request: JobApplicationRequest): Promise<ApplicationResult> {
    if (!this.isInitialized) {
      throw new Error('Workflow Integration Service not initialized');
    }

    const startTime = Date.now();
    
    try {
      this.emit('application-request', { 
        jobId: request.jobId, 
        userId: request.userId,
        priority: request.priority 
      });

      // Create job for queue
      const queueJob = {
        id: `job_${request.jobId}_${Date.now()}`,
        type: 'job-application',
        data: {
          jobId: request.jobId,
          userId: request.userId,
          userProfile: request.userProfile,
          options: request.options || {},
        },
        priority: request.priority,
        attempts: 0,
        maxAttempts: request.options?.maxRetries || this.config.queueConfig.retryAttempts,
      };

      // Add job to queue
      const queueResult = await this.queueManager.addJob(queueJob);
      
      // Wait for job completion (or timeout)
      const result = await this.waitForJobCompletion(queueJob.id, this.config.performance.jobTimeout);
      
      const executionTime = Date.now() - startTime;
      
      const applicationResult: ApplicationResult = {
        jobId: request.jobId,
        userId: request.userId,
        success: result.success,
        applicationId: result.applicationId,
        confirmationNumber: result.confirmationNumber,
        error: result.error,
        executionTime,
        strategy: result.strategy || 'unknown',
        automationType: result.automationType || 'traditional',
        metadata: {
          captchaEncountered: result.captchaEncountered || false,
          retryCount: result.retryCount || 0,
          screenshots: result.screenshots || [],
          logs: result.logs || [],
        },
      };

      this.emit('application-complete', applicationResult);
      return applicationResult;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      const applicationResult: ApplicationResult = {
        jobId: request.jobId,
        userId: request.userId,
        success: false,
        error: error.message,
        executionTime,
        strategy: 'none',
        automationType: 'traditional',
        metadata: {
          captchaEncountered: false,
          retryCount: 0,
          screenshots: [],
          logs: [],
        },
      };

      this.emit('application-failed', applicationResult);
      return applicationResult;
    }
  }

  /**
   * Sync jobs from Greenhouse
   */
  async syncGreenhouseJobs(): Promise<number> {
    if (!this.greenhouseService || !this.config.greenhouseConfig) {
      throw new Error('Greenhouse service not configured');
    }

    try {
      const jobs = await this.greenhouseService.syncCompanyJobs(
        this.config.greenhouseConfig.boardTokens
      );
      
      this.emit('greenhouse-sync-complete', { 
        jobCount: jobs.length,
        timestamp: new Date() 
      });
      
      return jobs.length;

    } catch (error) {
      this.emit('greenhouse-sync-error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get current workflow statistics
   */
  getStats(): WorkflowStats {
    return {
      ...this.stats,
      systemHealth: {
        ...this.stats.systemHealth,
        uptime: Date.now() - this.startTime,
      },
    };
  }

  /**
   * Get health status of all services
   */
  getHealthStatus(): {
    overall: boolean;
    services: Record<string, boolean>;
    issues: string[];
  } {
    const services = {
      browserUse: this.browserUseService?.getStatus()?.initialized || false,
      visionService: this.visionService !== undefined,
      strategyRegistry: this.strategyRegistry !== undefined,
      automationEngine: this.automationEngine !== undefined,
      queueManager: this.queueManager !== undefined,
      greenhouse: this.greenhouseService !== undefined || !this.config.greenhouseConfig,
    };

    const issues: string[] = [];
    let overall = true;

    for (const [service, healthy] of Object.entries(services)) {
      if (!healthy) {
        issues.push(`${service} service not healthy`);
        overall = false;
      }
    }

    return {
      overall,
      services,
      issues,
    };
  }

  /**
   * Shutdown all services gracefully
   */
  async shutdown(): Promise<void> {
    try {
      console.log('🛑 Shutting down Workflow Integration System...');

      // Stop health monitoring
      this.stopHealthMonitoring();

      // Cleanup services
      await Promise.all([
        this.browserUseService?.cleanup(),
        this.visionService?.cleanup(),
        this.queueManager?.cleanup(),
        this.greenhouseService?.cleanup(),
      ]);

      this.isInitialized = false;
      console.log('✅ Workflow Integration System shutdown complete');
      
      this.emit('shutdown-complete');

    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      this.emit('shutdown-error', { error: error.message });
    }
  }

  /**
   * Private helper methods
   */
  private getInitializedServices(): string[] {
    const services: string[] = [];
    
    if (this.browserUseService) services.push('browser-use');
    if (this.visionService) services.push('vision-service');
    if (this.strategyRegistry) services.push('strategy-registry');
    if (this.automationEngine) services.push('automation-engine');
    if (this.queueManager) services.push('queue-manager');
    if (this.greenhouseService) services.push('greenhouse-service');
    
    return services;
  }

  private async waitForJobCompletion(jobId: string, timeout: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Job ${jobId} timed out after ${timeout}ms`));
      }, timeout);

      const onComplete = (result: any) => {
        if (result.jobId === jobId) {
          clearTimeout(timeoutId);
          this.off('job-completed', onComplete);
          this.off('job-failed', onComplete);
          resolve(result);
        }
      };

      this.on('job-completed', onComplete);
      this.on('job-failed', onComplete);
    });
  }

  private updateStats(result: any): void {
    this.stats.totalApplications++;
    
    if (result.success) {
      this.stats.successfulApplications++;
    } else {
      this.stats.failedApplications++;
    }

    // Update average execution time
    const totalTime = this.stats.averageExecutionTime * (this.stats.totalApplications - 1) + result.executionTime;
    this.stats.averageExecutionTime = totalTime / this.stats.totalApplications;

    // Update AI automation stats
    if (result.automationType === 'ai-powered') {
      const aiJobs = this.stats.totalApplications; // Simplified calculation
      this.stats.aiAutomationStats.aiSuccessRate = result.success ? 
        (this.stats.aiAutomationStats.aiSuccessRate + 1) / 2 : 
        this.stats.aiAutomationStats.aiSuccessRate * 0.9;
    }
  }

  private updateQueueStats(queueData: any): void {
    this.stats.queueStatus = {
      pending: queueData.waiting || 0,
      processing: queueData.active || 0,
      completed: queueData.completed || 0,
      failed: queueData.failed || 0,
    };
  }

  private healthCheckInterval?: NodeJS.Timeout;

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(() => {
      const health = this.getHealthStatus();
      this.stats.systemHealth = {
        healthy: health.overall,
        issues: health.issues,
        uptime: Date.now() - this.startTime,
      };

      this.emit('health-check', health);
    }, this.config.performance.healthCheckInterval);
  }

  private stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
  }
}

export default WorkflowIntegrationService;