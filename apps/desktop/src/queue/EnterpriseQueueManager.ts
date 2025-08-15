/**
 * @fileoverview Enterprise Queue Manager
 * @description Scalable BullMQ configuration with advanced features for millions of users
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Enterprise-grade queue management with comprehensive monitoring
 */

import { EventEmitter } from 'events';
import { Queue, Worker, Job, QueueOptions, WorkerOptions } from 'bullmq';
import IORedis, { Cluster } from 'ioredis';
import Store from 'electron-store';
import { randomUUID } from 'crypto';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export interface EnterpriseQueueConfig {
  redis: {
    cluster: boolean;
    nodes?: { host: string; port: number }[];
    host?: string;
    port?: number;
    password?: string;
    keyPrefix: string;
    maxRetriesPerRequest: number;
    retryDelayOnFailover: number;
    connectionPoolSize: number;
  };
  performance: {
    concurrency: number;
    stalledInterval: number;
    maxStalledCount: number;
    removeOnComplete: number;
    removeOnFail: number;
    defaultJobOptions: JobOptions;
  };
  monitoring: {
    enabled: boolean;
    metricsInterval: number;
    alertThresholds: AlertThresholds;
  };
  batching: {
    enabled: boolean;
    batchSize: number;
    batchDelay: number;
    maxBatchWaitTime: number;
  };
  priorities: {
    levels: Record<string, number>;
    autoScaling: boolean;
    dynamicPriority: boolean;
  };
  failover: {
    enabled: boolean;
    maxFailures: number;
    backoffStrategies: BackoffStrategy[];
  };
}

export interface JobOptions {
  attempts: number;
  backoff: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  removeOnComplete: boolean;
  removeOnFail: boolean;
  delay?: number;
  priority?: number;
}

export interface AlertThresholds {
  queueSize: number;
  processingTime: number;
  failureRate: number;
  stalledJobs: number;
  memoryUsage: number;
}

export interface BackoffStrategy {
  type: 'fixed' | 'exponential' | 'linear';
  delay: number;
  multiplier?: number;
  maxDelay?: number;
}

export interface QueueMetrics {
  totalJobs: number;
  activeJobs: number;
  waitingJobs: number;
  completedJobs: number;
  failedJobs: number;
  delayedJobs: number;
  stalledJobs: number;
  throughputPerSecond: number;
  averageProcessingTime: number;
  memoryUsage: number;
  errorRate: number;
}

export interface JobData {
  id: string;
  userId: string;
  jobId: string;
  type: 'standard' | 'priority' | 'batch';
  payload: any;
  metadata: {
    createdAt: Date;
    scheduledAt?: Date;
    priority: number;
    attempts: number;
    parentJobId?: string;
  };
}

export interface ProcessingResult {
  success: boolean;
  data?: any;
  error?: string;
  duration: number;
  retryable: boolean;
}

// =============================================================================
// ENTERPRISE QUEUE MANAGER
// =============================================================================

export class EnterpriseQueueManager extends EventEmitter {
  private config: EnterpriseQueueConfig;
  private store: Store;
  private redisConnection: IORedis | Cluster;
  
  // Queue Management
  private queues = new Map<string, Queue>();
  private workers = new Map<string, Worker>();
  private queueNames = ['immediate', 'high', 'standard', 'batch', 'retry'];
  
  // Metrics & Monitoring
  private metrics = new Map<string, QueueMetrics>();
  private metricsInterval?: NodeJS.Timeout;
  private alertsEnabled = true;
  
  // Batching
  private batchBuffer = new Map<string, JobData[]>();
  private batchTimers = new Map<string, NodeJS.Timeout>();
  
  // Load Balancing
  private workerInstances = new Map<string, number>();
  private loadBalancer = new Map<string, number>();

  constructor(config: Partial<EnterpriseQueueConfig> = {}) {
    super();

    this.config = {
      redis: {
        cluster: false,
        host: 'localhost',
        port: 6379,
        keyPrefix: 'jobswipe:queue:',
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        connectionPoolSize: 10,
        ...config.redis
      },
      performance: {
        concurrency: 50,
        stalledInterval: 30000,
        maxStalledCount: 2,
        removeOnComplete: 1000,
        removeOnFail: 500,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000
          },
          removeOnComplete: true,
          removeOnFail: true
        },
        ...config.performance
      },
      monitoring: {
        enabled: true,
        metricsInterval: 60000, // 1 minute
        alertThresholds: {
          queueSize: 10000,
          processingTime: 300000, // 5 minutes
          failureRate: 0.05, // 5%
          stalledJobs: 100,
          memoryUsage: 0.85 // 85%
        },
        ...config.monitoring
      },
      batching: {
        enabled: true,
        batchSize: 50,
        batchDelay: 5000, // 5 seconds
        maxBatchWaitTime: 30000, // 30 seconds
        ...config.batching
      },
      priorities: {
        levels: {
          critical: 100,
          high: 75,
          normal: 50,
          low: 25,
          batch: 10
        },
        autoScaling: true,
        dynamicPriority: true,
        ...config.priorities
      },
      failover: {
        enabled: true,
        maxFailures: 5,
        backoffStrategies: [
          { type: 'exponential', delay: 1000, multiplier: 2, maxDelay: 30000 }
        ],
        ...config.failover
      }
    };

    this.store = new Store({
      name: 'enterprise-queue-manager',
      defaults: {
        metrics: {},
        failureHistory: {},
        configuration: {}
      }
    }) as any;

    this.initializeRedisConnection();
  }

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  /**
   * Initialize the enterprise queue system
   */
  async initialize(): Promise<void> {
    console.log('🏗️ Initializing Enterprise Queue Manager...');

    try {
      // Initialize Redis connection
      await this.setupRedisConnection();

      // Create queues with enterprise configuration
      await this.createQueues();

      // Initialize workers with load balancing
      await this.createWorkers();

      // Setup monitoring and metrics
      if (this.config.monitoring.enabled) {
        await this.setupMonitoring();
      }

      // Setup batching if enabled
      if (this.config.batching.enabled) {
        await this.setupBatching();
      }

      // Setup graceful shutdown
      this.setupGracefulShutdown();

      console.log('✅ Enterprise Queue Manager initialized successfully');
      this.emit('initialized', {
        queues: this.queues.size,
        workers: this.workers.size,
        config: this.config
      });

    } catch (error) {
      console.error('❌ Failed to initialize Enterprise Queue Manager:', error);
      this.emit('initialization-failed', error);
      throw error;
    }
  }

  /**
   * Initialize Redis connection with clustering support
   */
  private initializeRedisConnection(): void {
    const redisConfig = this.config.redis;

    if (redisConfig.cluster && redisConfig.nodes) {
      console.log('🔗 Connecting to Redis Cluster...');
      this.redisConnection = new IORedis.Cluster(redisConfig.nodes, {
        redisOptions: {
          password: redisConfig.password,
          keyPrefix: redisConfig.keyPrefix,
          maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
          retryDelayOnFailover: redisConfig.retryDelayOnFailover
        }
      });
    } else {
      console.log('🔗 Connecting to single Redis instance...');
      this.redisConnection = new IORedis({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password,
        keyPrefix: redisConfig.keyPrefix,
        maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
        retryDelayOnFailover: redisConfig.retryDelayOnFailover
      });
    }

    this.redisConnection.on('connect', () => {
      console.log('✅ Redis connected successfully');
      this.emit('redis-connected');
    });

    this.redisConnection.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
      this.emit('redis-error', error);
    });
  }

  private async setupRedisConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Redis connection timeout'));
      }, 10000);

      this.redisConnection.once('connect', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.redisConnection.once('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  // =============================================================================
  // QUEUE MANAGEMENT
  // =============================================================================

  /**
   * Create enterprise-configured queues
   */
  private async createQueues(): Promise<void> {
    console.log('📋 Creating enterprise queues...');

    const queueOptions: QueueOptions = {
      connection: this.redisConnection as any,
      defaultJobOptions: {
        attempts: this.config.performance.defaultJobOptions.attempts,
        backoff: this.config.performance.defaultJobOptions.backoff,
        removeOnComplete: this.config.performance.removeOnComplete,
        removeOnFail: this.config.performance.removeOnFail
      }
    };

    for (const queueName of this.queueNames) {
      try {
        const queue = new Queue(queueName, queueOptions);
        
        // Setup queue event listeners
        this.setupQueueEventListeners(queue, queueName);
        
        this.queues.set(queueName, queue);
        console.log(`✅ Queue '${queueName}' created successfully`);

      } catch (error) {
        console.error(`❌ Failed to create queue '${queueName}':`, error);
        throw error;
      }
    }
  }

  /**
   * Create workers with load balancing and auto-scaling
   */
  private async createWorkers(): Promise<void> {
    console.log('👷 Creating enterprise workers...');

    for (const queueName of this.queueNames) {
      try {
        const concurrency = this.calculateOptimalConcurrency(queueName);
        
        const workerOptions: WorkerOptions = {
          connection: this.redisConnection as any,
          concurrency,
          stalledInterval: this.config.performance.stalledInterval,
          maxStalledCount: this.config.performance.maxStalledCount
        };

        const worker = new Worker(queueName, this.createJobProcessor(queueName), workerOptions);
        
        // Setup worker event listeners
        this.setupWorkerEventListeners(worker, queueName);
        
        this.workers.set(queueName, worker);
        this.workerInstances.set(queueName, concurrency);
        
        console.log(`✅ Worker for '${queueName}' created with ${concurrency} concurrency`);

      } catch (error) {
        console.error(`❌ Failed to create worker for '${queueName}':`, error);
        throw error;
      }
    }
  }

  /**
   * Calculate optimal concurrency based on queue type and system resources
   */
  private calculateOptimalConcurrency(queueName: string): number {
    const baseConcurrency = this.config.performance.concurrency;
    
    switch (queueName) {
      case 'immediate':
        return Math.floor(baseConcurrency * 0.4); // 40% for immediate jobs
      case 'high':
        return Math.floor(baseConcurrency * 0.3); // 30% for high priority
      case 'standard':
        return Math.floor(baseConcurrency * 0.2); // 20% for standard
      case 'batch':
        return Math.floor(baseConcurrency * 0.05); // 5% for batch jobs
      case 'retry':
        return Math.floor(baseConcurrency * 0.05); // 5% for retries
      default:
        return Math.floor(baseConcurrency * 0.1); // 10% default
    }
  }

  /**
   * Create job processor with enterprise features
   */
  private createJobProcessor(queueName: string) {
    return async (job: Job<JobData>): Promise<ProcessingResult> => {
      const startTime = Date.now();
      const jobData = job.data;

      console.log(`🚀 [${queueName}] Processing job: ${jobData.id}`);

      try {
        // Update load balancer metrics
        this.updateLoadBalancer(queueName);

        // Process job based on type
        let result: ProcessingResult;
        
        switch (jobData.type) {
          case 'batch':
            result = await this.processBatchJob(job);
            break;
          case 'priority':
            result = await this.processPriorityJob(job);
            break;
          default:
            result = await this.processStandardJob(job);
            break;
        }

        const duration = Date.now() - startTime;
        result.duration = duration;

        // Update metrics
        this.updateJobMetrics(queueName, result, duration);

        console.log(`✅ [${queueName}] Job completed: ${jobData.id} (${duration}ms)`);
        
        this.emit('job-completed', {
          queue: queueName,
          jobId: jobData.id,
          duration,
          result
        });

        return result;

      } catch (error) {
        const duration = Date.now() - startTime;
        const errorResult: ProcessingResult = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          duration,
          retryable: this.isRetryableError(error)
        };

        console.error(`❌ [${queueName}] Job failed: ${jobData.id} - ${errorResult.error}`);
        
        this.emit('job-failed', {
          queue: queueName,
          jobId: jobData.id,
          error: errorResult.error,
          duration
        });

        throw error; // BullMQ will handle retries based on job configuration
      }
    };
  }

  // =============================================================================
  // JOB PROCESSING
  // =============================================================================

  /**
   * Add job to appropriate queue with intelligent routing
   */
  async addJob(
    jobData: JobData, 
    options: Partial<JobOptions> = {}
  ): Promise<Job<JobData>> {
    // Determine optimal queue based on priority and load
    const queueName = this.determineOptimalQueue(jobData);
    const queue = this.queues.get(queueName);
    
    if (!queue) {
      throw new Error(`Queue '${queueName}' not found`);
    }

    // Apply batching if enabled and applicable
    if (this.config.batching.enabled && this.isBatchableJob(jobData)) {
      return this.addToBatch(jobData, options);
    }

    // Merge with default options
    const finalOptions = {
      ...this.config.performance.defaultJobOptions,
      ...options,
      priority: jobData.metadata.priority
    };

    const job = await queue.add(jobData.id, jobData, finalOptions);
    
    console.log(`📥 Job added to ${queueName}: ${jobData.id}`);
    this.emit('job-added', { queue: queueName, jobId: jobData.id, priority: jobData.metadata.priority });

    return job;
  }

  /**
   * Determine optimal queue based on job characteristics and system load
   */
  private determineOptimalQueue(jobData: JobData): string {
    const priority = jobData.metadata.priority;
    
    // Check load balancing
    const loadBalanced = this.getLoadBalancedQueue(priority);
    if (loadBalanced) {
      return loadBalanced;
    }

    // Default priority-based routing
    if (priority >= this.config.priorities.levels.critical) {
      return 'immediate';
    } else if (priority >= this.config.priorities.levels.high) {
      return 'high';
    } else if (priority >= this.config.priorities.levels.normal) {
      return 'standard';
    } else if (jobData.type === 'batch') {
      return 'batch';
    } else {
      return 'standard';
    }
  }

  /**
   * Get load-balanced queue selection
   */
  private getLoadBalancedQueue(priority: number): string | null {
    if (!this.config.priorities.autoScaling) {
      return null;
    }

    // Find queue with lowest current load for this priority tier
    const eligibleQueues = this.getEligibleQueues(priority);
    let minLoad = Infinity;
    let selectedQueue = null;

    for (const queueName of eligibleQueues) {
      const load = this.loadBalancer.get(queueName) || 0;
      if (load < minLoad) {
        minLoad = load;
        selectedQueue = queueName;
      }
    }

    return selectedQueue;
  }

  private getEligibleQueues(priority: number): string[] {
    if (priority >= this.config.priorities.levels.critical) {
      return ['immediate'];
    } else if (priority >= this.config.priorities.levels.high) {
      return ['immediate', 'high'];
    } else {
      return ['high', 'standard'];
    }
  }

  // =============================================================================
  // BATCHING SYSTEM
  // =============================================================================

  private async addToBatch(jobData: JobData, options: Partial<JobOptions>): Promise<Job<JobData>> {
    const batchKey = this.getBatchKey(jobData);
    
    if (!this.batchBuffer.has(batchKey)) {
      this.batchBuffer.set(batchKey, []);
    }

    const batch = this.batchBuffer.get(batchKey)!;
    batch.push(jobData);

    // Setup batch timer if first job
    if (batch.length === 1) {
      this.setupBatchTimer(batchKey);
    }

    // Process batch if full
    if (batch.length >= this.config.batching.batchSize) {
      return this.processBatch(batchKey, options);
    }

    // Create placeholder job for tracking
    const queue = this.queues.get('batch')!;
    return await queue.add(`batch_placeholder_${jobData.id}`, jobData, {
      ...options,
      delay: this.config.batching.batchDelay
    });
  }

  private getBatchKey(jobData: JobData): string {
    // Group by user or job type for batching efficiency
    return `${jobData.userId}_${jobData.type}`;
  }

  private setupBatchTimer(batchKey: string): void {
    const timer = setTimeout(() => {
      this.processBatch(batchKey);
      this.batchTimers.delete(batchKey);
    }, this.config.batching.maxBatchWaitTime);

    this.batchTimers.set(batchKey, timer);
  }

  private async processBatch(batchKey: string, options: Partial<JobOptions> = {}): Promise<Job<JobData>> {
    const batch = this.batchBuffer.get(batchKey);
    if (!batch || batch.length === 0) {
      throw new Error(`No batch found for key: ${batchKey}`);
    }

    // Clear timer
    const timer = this.batchTimers.get(batchKey);
    if (timer) {
      clearTimeout(timer);
      this.batchTimers.delete(batchKey);
    }

    // Create batch job
    const batchJob: JobData = {
      id: `batch_${randomUUID()}`,
      userId: batch[0].userId,
      jobId: 'batch',
      type: 'batch',
      payload: {
        jobs: batch,
        batchSize: batch.length
      },
      metadata: {
        createdAt: new Date(),
        priority: Math.min(...batch.map(job => job.metadata.priority)),
        attempts: 3
      }
    };

    // Clear batch buffer
    this.batchBuffer.delete(batchKey);

    // Add to batch queue
    const queue = this.queues.get('batch')!;
    const job = await queue.add(batchJob.id, batchJob, options);

    console.log(`📦 Batch processed: ${batchKey} (${batch.length} jobs)`);
    
    return job;
  }

  private isBatchableJob(jobData: JobData): boolean {
    // Only certain types of jobs are batchable
    return jobData.type === 'standard' && jobData.metadata.priority < this.config.priorities.levels.high;
  }

  // =============================================================================
  // MONITORING & METRICS
  // =============================================================================

  private async setupMonitoring(): Promise<void> {
    console.log('📊 Setting up enterprise monitoring...');

    this.metricsInterval = setInterval(async () => {
      await this.collectMetrics();
      await this.checkAlerts();
    }, this.config.monitoring.metricsInterval);

    // Setup graceful metrics collection
    process.on('SIGTERM', () => this.saveMetrics());
    process.on('SIGINT', () => this.saveMetrics());
  }

  private async collectMetrics(): Promise<void> {
    for (const [queueName, queue] of this.queues.entries()) {
      try {
        const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed', 'stalled');
        
        const metrics: QueueMetrics = {
          totalJobs: Object.values(counts).reduce((sum, count) => sum + count, 0),
          activeJobs: counts.active,
          waitingJobs: counts.waiting,
          completedJobs: counts.completed,
          failedJobs: counts.failed,
          delayedJobs: counts.delayed,
          stalledJobs: counts.stalled || 0,
          throughputPerSecond: this.calculateThroughput(queueName),
          averageProcessingTime: this.calculateAverageProcessingTime(queueName),
          memoryUsage: process.memoryUsage().heapUsed,
          errorRate: this.calculateErrorRate(queueName, counts)
        };

        this.metrics.set(queueName, metrics);
        
      } catch (error) {
        console.error(`❌ Failed to collect metrics for ${queueName}:`, error);
      }
    }

    this.emit('metrics-updated', Object.fromEntries(this.metrics.entries()));
  }

  private async checkAlerts(): Promise<void> {
    if (!this.alertsEnabled) return;

    const thresholds = this.config.monitoring.alertThresholds;
    
    for (const [queueName, metrics] of this.metrics.entries()) {
      // Check queue size alert
      if (metrics.waitingJobs > thresholds.queueSize) {
        this.triggerAlert('QUEUE_SIZE', queueName, {
          current: metrics.waitingJobs,
          threshold: thresholds.queueSize
        });
      }

      // Check processing time alert
      if (metrics.averageProcessingTime > thresholds.processingTime) {
        this.triggerAlert('PROCESSING_TIME', queueName, {
          current: metrics.averageProcessingTime,
          threshold: thresholds.processingTime
        });
      }

      // Check failure rate alert
      if (metrics.errorRate > thresholds.failureRate) {
        this.triggerAlert('FAILURE_RATE', queueName, {
          current: metrics.errorRate,
          threshold: thresholds.failureRate
        });
      }

      // Check stalled jobs alert
      if (metrics.stalledJobs > thresholds.stalledJobs) {
        this.triggerAlert('STALLED_JOBS', queueName, {
          current: metrics.stalledJobs,
          threshold: thresholds.stalledJobs
        });
      }
    }
  }

  private triggerAlert(type: string, queueName: string, data: any): void {
    const alert = {
      id: randomUUID(),
      type,
      queue: queueName,
      severity: this.calculateAlertSeverity(type, data),
      data,
      timestamp: new Date()
    };

    console.warn(`🚨 ALERT [${alert.severity}]: ${type} in queue '${queueName}'`, data);
    this.emit('alert-triggered', alert);
  }

  private calculateAlertSeverity(type: string, data: any): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const ratio = data.current / data.threshold;
    
    if (ratio > 3) return 'CRITICAL';
    if (ratio > 2) return 'HIGH';
    if (ratio > 1.5) return 'MEDIUM';
    return 'LOW';
  }

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  private setupQueueEventListeners(queue: Queue, queueName: string): void {
    queue.on('waiting', (job) => {
      console.log(`⏳ [${queueName}] Job waiting: ${job.id}`);
    });

    queue.on('active', (job) => {
      console.log(`🔄 [${queueName}] Job active: ${job.id}`);
    });

    queue.on('completed', (job, result) => {
      console.log(`✅ [${queueName}] Job completed: ${job.id}`);
    });

    queue.on('failed', (job, error) => {
      console.error(`❌ [${queueName}] Job failed: ${job?.id} - ${error.message}`);
    });

    queue.on('stalled', (job) => {
      console.warn(`⚠️ [${queueName}] Job stalled: ${job.id}`);
    });
  }

  private setupWorkerEventListeners(worker: Worker, queueName: string): void {
    worker.on('ready', () => {
      console.log(`👷 [${queueName}] Worker ready`);
    });

    worker.on('error', (error) => {
      console.error(`❌ [${queueName}] Worker error:`, error);
    });

    worker.on('stalled', (jobId) => {
      console.warn(`⚠️ [${queueName}] Worker stalled on job: ${jobId}`);
    });
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private async processStandardJob(job: Job<JobData>): Promise<ProcessingResult> {
    // Placeholder for standard job processing
    // This would integrate with the BrowserAutomationService
    await this.simulateProcessing(1000, 3000);
    
    return {
      success: true,
      duration: 0, // Will be set by processor
      retryable: false
    };
  }

  private async processPriorityJob(job: Job<JobData>): Promise<ProcessingResult> {
    // Placeholder for priority job processing
    await this.simulateProcessing(500, 1500);
    
    return {
      success: true,
      duration: 0,
      retryable: false
    };
  }

  private async processBatchJob(job: Job<JobData>): Promise<ProcessingResult> {
    const batchData = job.data.payload;
    const jobs = batchData.jobs as JobData[];
    
    console.log(`📦 Processing batch of ${jobs.length} jobs`);
    
    // Process all jobs in batch
    const results = [];
    for (const jobData of jobs) {
      try {
        await this.simulateProcessing(200, 800);
        results.push({ success: true, jobId: jobData.id });
      } catch (error) {
        results.push({ success: false, jobId: jobData.id, error });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    
    return {
      success: successCount > jobs.length * 0.8, // 80% success rate required
      data: { results, successCount, totalJobs: jobs.length },
      duration: 0,
      retryable: successCount === 0
    };
  }

  private async simulateProcessing(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private isRetryableError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    // Network errors are retryable
    if (errorMessage.includes('network') || errorMessage.includes('timeout') || 
        errorMessage.includes('econnreset') || errorMessage.includes('enotfound')) {
      return true;
    }
    
    // Rate limit errors are retryable
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return true;
    }
    
    return false;
  }

  private updateLoadBalancer(queueName: string): void {
    const currentLoad = this.loadBalancer.get(queueName) || 0;
    this.loadBalancer.set(queueName, currentLoad + 1);
    
    // Decay load over time
    setTimeout(() => {
      const load = this.loadBalancer.get(queueName) || 0;
      this.loadBalancer.set(queueName, Math.max(0, load - 1));
    }, 60000); // 1 minute decay
  }

  private updateJobMetrics(queueName: string, result: ProcessingResult, duration: number): void {
    // Implementation would update detailed job metrics
  }

  private calculateThroughput(queueName: string): number {
    // Implementation would calculate jobs per second
    return 0;
  }

  private calculateAverageProcessingTime(queueName: string): number {
    // Implementation would calculate average processing time
    return 0;
  }

  private calculateErrorRate(queueName: string, counts: any): number {
    const total = counts.completed + counts.failed;
    return total > 0 ? counts.failed / total : 0;
  }

  private setupGracefulShutdown(): void {
    process.on('SIGTERM', () => this.gracefulShutdown());
    process.on('SIGINT', () => this.gracefulShutdown());
  }

  private async gracefulShutdown(): Promise<void> {
    console.log('🛑 Graceful shutdown initiated...');
    
    try {
      // Stop accepting new jobs
      for (const worker of this.workers.values()) {
        await worker.close();
      }
      
      // Wait for active jobs to complete
      await Promise.all(Array.from(this.queues.values()).map(queue => queue.close()));
      
      // Close Redis connection
      await this.redisConnection.quit();
      
      // Save final metrics
      await this.saveMetrics();
      
      console.log('✅ Graceful shutdown completed');
      
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }

  private async saveMetrics(): Promise<void> {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    
    this.store.set('metrics', Object.fromEntries(this.metrics.entries()));
  }

  // =============================================================================
  // PUBLIC API
  // =============================================================================

  /**
   * Get current queue metrics
   */
  getMetrics(): Record<string, QueueMetrics> {
    return Object.fromEntries(this.metrics.entries());
  }

  /**
   * Get queue health status
   */
  async getHealthStatus(): Promise<Record<string, any>> {
    const health: Record<string, any> = {};
    
    for (const [queueName, queue] of this.queues.entries()) {
      try {
        const counts = await queue.getJobCounts('waiting', 'active', 'failed', 'stalled');
        const worker = this.workers.get(queueName);
        
        health[queueName] = {
          status: 'healthy',
          jobs: counts,
          worker: {
            running: worker ? !worker.closing : false,
            concurrency: this.workerInstances.get(queueName) || 0
          }
        };
      } catch (error) {
        health[queueName] = {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    
    return health;
  }

  /**
   * Pause/Resume queues
   */
  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.pause();
      console.log(`⏸️ Queue '${queueName}' paused`);
    }
  }

  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.resume();
      console.log(`▶️ Queue '${queueName}' resumed`);
    }
  }

  /**
   * Clean up old jobs
   */
  async cleanupOldJobs(olderThanMs: number = 24 * 60 * 60 * 1000): Promise<void> {
    console.log('🧹 Cleaning up old jobs...');
    
    for (const [queueName, queue] of this.queues.entries()) {
      try {
        await queue.clean(olderThanMs, 1000, 'completed');
        await queue.clean(olderThanMs, 500, 'failed');
        console.log(`✅ Cleaned up old jobs in '${queueName}'`);
      } catch (error) {
        console.error(`❌ Failed to clean queue '${queueName}':`, error);
      }
    }
  }
}