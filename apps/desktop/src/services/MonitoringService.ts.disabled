/**
 * @fileoverview Desktop Monitoring Service
 * @description Comprehensive monitoring, metrics collection, and error tracking
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { EventEmitter } from 'events';
import Store from 'electron-store';
import os from 'os';
import { performance } from 'perf_hooks';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface SystemMetrics {
  timestamp: number;
  cpu: {
    usage: number;
    loadAverage: number[];
    cores: number;
  };
  memory: {
    totalMB: number;
    usedMB: number;
    freeMB: number;
    usagePercent: number;
    processHeapUsed: number;
    processHeapTotal: number;
  };
  system: {
    platform: string;
    arch: string;
    uptime: number;
    processUptime: number;
  };
}

export interface ApplicationMetrics {
  timestamp: number;
  queue: {
    totalJobs: number;
    processingJobs: number;
    completedJobs: number;
    failedJobs: number;
    queuedJobs: number;
    averageProcessingTime: number;
    successRate: number;
  };
  automation: {
    runningCount: number;
    totalExecuted: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
  };
  api: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    lastError?: string;
    lastErrorTime?: number;
  };
  websocket: {
    connected: boolean;
    reconnectionAttempts: number;
    lastConnectionTime?: number;
    lastDisconnectionTime?: number;
    messagesReceived: number;
    messagesSent: number;
  };
}

export interface ErrorEvent {
  id: string;
  timestamp: number;
  level: 'error' | 'warning' | 'info';
  category: 'system' | 'queue' | 'automation' | 'api' | 'websocket' | 'general';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  resolved?: boolean;
  resolvedAt?: number;
}

export interface PerformanceMetric {
  name: string;
  timestamp: number;
  duration: number;
  category: string;
  metadata?: Record<string, any>;
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  timestamp: number;
  message?: string;
  metadata?: Record<string, any>;
}

export interface MonitoringConfig {
  metricsCollectionInterval: number;
  systemMetricsEnabled: boolean;
  applicationMetricsEnabled: boolean;
  errorTrackingEnabled: boolean;
  performanceTrackingEnabled: boolean;
  healthChecksEnabled: boolean;
  maxStoredMetrics: number;
  maxStoredErrors: number;
  maxStoredPerformanceMetrics: number;
  alertThresholds: {
    cpuUsagePercent: number;
    memoryUsagePercent: number;
    errorRatePercent: number;
    responseTimeMs: number;
    queueBacklogSize: number;
  };
}

// =============================================================================
// MONITORING SERVICE
// =============================================================================

export class MonitoringService extends EventEmitter {
  private store: Store;
  private config: MonitoringConfig;
  private metricsInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  
  // Metrics storage
  private systemMetricsHistory: SystemMetrics[] = [];
  private applicationMetricsHistory: ApplicationMetrics[] = [];
  private errorHistory: ErrorEvent[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private lastHealthChecks: Map<string, HealthCheck> = new Map();
  
  // Real-time counters
  private counters = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalErrors: 0,
    totalJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    automationExecutions: 0,
    websocketMessages: 0,
  };

  constructor() {
    super();
    
    this.store = new Store({
      name: 'monitoring-service',
      defaults: {
        config: {
          metricsCollectionInterval: 30000, // 30 seconds
          systemMetricsEnabled: true,
          applicationMetricsEnabled: true,
          errorTrackingEnabled: true,
          performanceTrackingEnabled: true,
          healthChecksEnabled: true,
          maxStoredMetrics: 1000,
          maxStoredErrors: 500,
          maxStoredPerformanceMetrics: 1000,
          alertThresholds: {
            cpuUsagePercent: 80,
            memoryUsagePercent: 85,
            errorRatePercent: 10,
            responseTimeMs: 5000,
            queueBacklogSize: 100,
          },
        },
        metrics: {
          system: [],
          application: [],
          errors: [],
          performance: [],
        },
        counters: {},
      },
    });

    this.config = this.store.get('config') as MonitoringConfig;
    this.loadStoredData();
  }

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  /**
   * Initialize monitoring service
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔍 Initializing monitoring service...');
      
      // Start metrics collection
      if (this.config.systemMetricsEnabled || this.config.applicationMetricsEnabled) {
        this.startMetricsCollection();
      }
      
      // Start health checks
      if (this.config.healthChecksEnabled) {
        this.startHealthChecks();
      }
      
      // Setup process event listeners
      this.setupProcessListeners();
      
      console.log('✅ Monitoring service initialized');
      this.emit('initialized');
      
      // Initial health check
      await this.performHealthChecks();
      
    } catch (error) {
      console.error('❌ Failed to initialize monitoring service:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Load stored monitoring data
   */
  private loadStoredData(): void {
    const storedData = this.store.get('metrics') as any;
    const storedCounters = this.store.get('counters') as any;
    
    this.systemMetricsHistory = storedData?.system || [];
    this.applicationMetricsHistory = storedData?.application || [];
    this.errorHistory = storedData?.errors || [];
    this.performanceMetrics = storedData?.performance || [];
    this.counters = { ...this.counters, ...(storedCounters || {}) };
  }

  /**
   * Setup process event listeners for error tracking
   */
  private setupProcessListeners(): void {
    // Uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.trackError('system', 'error', 'Uncaught Exception', error.message, error.stack);
    });

    // Unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.trackError('system', 'error', 'Unhandled Promise Rejection', String(reason));
    });

    // Process warnings
    process.on('warning', (warning) => {
      this.trackError('system', 'warning', 'Process Warning', warning.message, warning.stack);
    });
  }

  // =============================================================================
  // METRICS COLLECTION
  // =============================================================================

  /**
   * Start automatic metrics collection
   */
  private startMetricsCollection(): void {
    if (this.metricsInterval) return;

    this.metricsInterval = setInterval(async () => {
      try {
        if (this.config.systemMetricsEnabled) {
          await this.collectSystemMetrics();
        }
        
        if (this.config.applicationMetricsEnabled) {
          await this.collectApplicationMetrics();
        }
        
        // Check for alerts
        this.checkAlerts();
        
        // Persist metrics
        this.persistMetrics();
        
      } catch (error) {
        console.error('Error collecting metrics:', error);
        this.trackError('system', 'error', 'Metrics Collection Error', String(error));
      }
    }, this.config.metricsCollectionInterval);

    console.log(`📊 Started metrics collection (interval: ${this.config.metricsCollectionInterval}ms)`);
  }

  /**
   * Collect system metrics
   */
  private async collectSystemMetrics(): Promise<void> {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = await this.getCpuUsage();
    
    const systemMetrics: SystemMetrics = {
      timestamp: Date.now(),
      cpu: {
        usage: cpuUsage,
        loadAverage: os.loadavg(),
        cores: os.cpus().length,
      },
      memory: {
        totalMB: Math.round(os.totalmem() / 1024 / 1024),
        usedMB: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024),
        freeMB: Math.round(os.freemem() / 1024 / 1024),
        usagePercent: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100),
        processHeapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        processHeapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        uptime: os.uptime(),
        processUptime: process.uptime(),
      },
    };

    this.systemMetricsHistory.push(systemMetrics);
    this.trimMetricsHistory();
    
    this.emit('system-metrics', systemMetrics);
  }

  /**
   * Collect application-specific metrics
   */
  private async collectApplicationMetrics(): Promise<void> {
    // This would be called by the QueueService and other services
    // to provide their specific metrics
    const appMetrics: ApplicationMetrics = {
      timestamp: Date.now(),
      queue: {
        totalJobs: this.counters.totalJobs,
        processingJobs: 0, // Would be provided by QueueService
        completedJobs: this.counters.completedJobs,
        failedJobs: this.counters.failedJobs,
        queuedJobs: 0, // Would be provided by QueueService
        averageProcessingTime: 0, // Calculated from performance metrics
        successRate: this.calculateSuccessRate('job'),
      },
      automation: {
        runningCount: 0, // Would be provided by BrowserAutomationService
        totalExecuted: this.counters.automationExecutions,
        successfulExecutions: 0, // Calculated from performance metrics
        failedExecutions: 0, // Calculated from error history
        averageExecutionTime: this.calculateAverageExecutionTime('automation'),
      },
      api: {
        totalRequests: this.counters.totalRequests,
        successfulRequests: this.counters.successfulRequests,
        failedRequests: this.counters.failedRequests,
        averageResponseTime: this.calculateAverageExecutionTime('api'),
        lastError: this.getLastError('api')?.message,
        lastErrorTime: this.getLastError('api')?.timestamp,
      },
      websocket: {
        connected: false, // Would be provided by QueueService
        reconnectionAttempts: 0, // Would be provided by QueueService
        messagesReceived: this.counters.websocketMessages,
        messagesSent: 0, // Would need to be tracked
      },
    };

    this.applicationMetricsHistory.push(appMetrics);
    this.trimMetricsHistory();
    
    this.emit('application-metrics', appMetrics);
  }

  // =============================================================================
  // ERROR TRACKING
  // =============================================================================

  /**
   * Track an error event
   */
  trackError(
    category: ErrorEvent['category'],
    level: ErrorEvent['level'],
    message: string,
    details?: string,
    stack?: string,
    context?: Record<string, any>
  ): void {
    if (!this.config.errorTrackingEnabled) return;

    const errorEvent: ErrorEvent = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      category,
      message,
      stack: stack || details,
      context,
    };

    this.errorHistory.push(errorEvent);
    this.counters.totalErrors++;
    
    // Trim error history
    if (this.errorHistory.length > this.config.maxStoredErrors) {
      this.errorHistory = this.errorHistory.slice(-this.config.maxStoredErrors);
    }

    console.error(`🚨 [${category.toUpperCase()}] ${level.toUpperCase()}: ${message}`);
    this.emit('error-tracked', errorEvent);
    
    // Check if this triggers an alert
    this.checkErrorRateAlert();
  }

  /**
   * Mark an error as resolved
   */
  resolveError(errorId: string): boolean {
    const error = this.errorHistory.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      error.resolvedAt = Date.now();
      this.emit('error-resolved', error);
      return true;
    }
    return false;
  }

  // =============================================================================
  // PERFORMANCE TRACKING
  // =============================================================================

  /**
   * Start performance tracking for an operation
   */
  startPerformanceTracking(name: string, category: string = 'general'): string {
    if (!this.config.performanceTrackingEnabled) return '';
    
    const trackingId = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = performance.now();
    
    // Store start time temporarily
    (this as any)[`_perf_${trackingId}`] = { name, category, startTime };
    
    return trackingId;
  }

  /**
   * End performance tracking
   */
  endPerformanceTracking(trackingId: string, metadata?: Record<string, any>): void {
    if (!this.config.performanceTrackingEnabled || !trackingId) return;
    
    const trackingData = (this as any)[`_perf_${trackingId}`];
    if (!trackingData) return;
    
    const endTime = performance.now();
    const duration = endTime - trackingData.startTime;
    
    const metric: PerformanceMetric = {
      name: trackingData.name,
      timestamp: Date.now(),
      duration,
      category: trackingData.category,
      metadata,
    };
    
    this.performanceMetrics.push(metric);
    
    // Trim performance metrics
    if (this.performanceMetrics.length > this.config.maxStoredPerformanceMetrics) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.config.maxStoredPerformanceMetrics);
    }
    
    // Clean up temporary data
    delete (this as any)[`_perf_${trackingId}`];
    
    this.emit('performance-metric', metric);
  }

  // =============================================================================
  // HEALTH CHECKS
  // =============================================================================

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    if (this.healthCheckInterval) return;

    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.metricsCollectionInterval * 2); // Less frequent than metrics

    console.log('🏥 Started health checks');
  }

  /**
   * Perform all health checks
   */
  private async performHealthChecks(): Promise<void> {
    const checks = [
      this.checkSystemHealth(),
      this.checkMemoryHealth(),
      this.checkErrorRateHealth(),
      this.checkQueueHealth(),
    ];

    const results = await Promise.allSettled(checks);
    
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.trackError('system', 'error', 'Health Check Failed', result.reason);
      }
    });
  }

  /**
   * Check system health
   */
  private async checkSystemHealth(): Promise<void> {
    const metrics = this.getLatestSystemMetrics();
    if (!metrics) return;

    const health: HealthCheck = {
      name: 'system',
      timestamp: Date.now(),
      status: 'healthy',
      metadata: metrics,
    };

    if (metrics.cpu.usage > this.config.alertThresholds.cpuUsagePercent) {
      health.status = 'critical';
      health.message = `High CPU usage: ${metrics.cpu.usage.toFixed(1)}%`;
    } else if (metrics.cpu.usage > this.config.alertThresholds.cpuUsagePercent * 0.8) {
      health.status = 'warning';
      health.message = `Elevated CPU usage: ${metrics.cpu.usage.toFixed(1)}%`;
    }

    this.lastHealthChecks.set('system', health);
    this.emit('health-check', health);
  }

  /**
   * Check memory health
   */
  private async checkMemoryHealth(): Promise<void> {
    const metrics = this.getLatestSystemMetrics();
    if (!metrics) return;

    const health: HealthCheck = {
      name: 'memory',
      timestamp: Date.now(),
      status: 'healthy',
      metadata: { memoryUsage: metrics.memory },
    };

    if (metrics.memory.usagePercent > this.config.alertThresholds.memoryUsagePercent) {
      health.status = 'critical';
      health.message = `High memory usage: ${metrics.memory.usagePercent}%`;
    } else if (metrics.memory.usagePercent > this.config.alertThresholds.memoryUsagePercent * 0.8) {
      health.status = 'warning';
      health.message = `Elevated memory usage: ${metrics.memory.usagePercent}%`;
    }

    this.lastHealthChecks.set('memory', health);
    this.emit('health-check', health);
  }

  /**
   * Check error rate health
   */
  private async checkErrorRateHealth(): Promise<void> {
    const recentErrors = this.getRecentErrors(60 * 1000); // Last minute
    const errorRate = recentErrors.length;

    const health: HealthCheck = {
      name: 'error-rate',
      timestamp: Date.now(),
      status: 'healthy',
      metadata: { recentErrors: errorRate },
    };

    if (errorRate > 10) {
      health.status = 'critical';
      health.message = `High error rate: ${errorRate} errors/minute`;
    } else if (errorRate > 5) {
      health.status = 'warning';
      health.message = `Elevated error rate: ${errorRate} errors/minute`;
    }

    this.lastHealthChecks.set('error-rate', health);
    this.emit('health-check', health);
  }

  /**
   * Check queue health
   */
  private async checkQueueHealth(): Promise<void> {
    // This would be called by QueueService to provide queue status
    const health: HealthCheck = {
      name: 'queue',
      timestamp: Date.now(),
      status: 'healthy',
      message: 'Queue service operational',
    };

    this.lastHealthChecks.set('queue', health);
    this.emit('health-check', health);
  }

  // =============================================================================
  // ALERTS
  // =============================================================================

  /**
   * Check all alert conditions
   */
  private checkAlerts(): void {
    this.checkCpuAlert();
    this.checkMemoryAlert();
    this.checkErrorRateAlert();
  }

  /**
   * Check CPU usage alert
   */
  private checkCpuAlert(): void {
    const metrics = this.getLatestSystemMetrics();
    if (metrics && metrics.cpu.usage > this.config.alertThresholds.cpuUsagePercent) {
      this.emit('alert', {
        type: 'cpu',
        level: 'critical',
        message: `High CPU usage detected: ${metrics.cpu.usage.toFixed(1)}%`,
        value: metrics.cpu.usage,
        threshold: this.config.alertThresholds.cpuUsagePercent,
      });
    }
  }

  /**
   * Check memory usage alert
   */
  private checkMemoryAlert(): void {
    const metrics = this.getLatestSystemMetrics();
    if (metrics && metrics.memory.usagePercent > this.config.alertThresholds.memoryUsagePercent) {
      this.emit('alert', {
        type: 'memory',
        level: 'critical',
        message: `High memory usage detected: ${metrics.memory.usagePercent}%`,
        value: metrics.memory.usagePercent,
        threshold: this.config.alertThresholds.memoryUsagePercent,
      });
    }
  }

  /**
   * Check error rate alert
   */
  private checkErrorRateAlert(): void {
    const recentErrors = this.getRecentErrors(5 * 60 * 1000); // Last 5 minutes
    if (recentErrors.length > 20) { // More than 20 errors in 5 minutes
      this.emit('alert', {
        type: 'error-rate',
        level: 'critical',
        message: `High error rate detected: ${recentErrors.length} errors in 5 minutes`,
        value: recentErrors.length,
        threshold: 20,
      });
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get CPU usage percentage
   */
  private async getCpuUsage(): Promise<number> {
    const startUsage = process.cpuUsage();
    const startTime = process.hrtime.bigint();
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const endUsage = process.cpuUsage(startUsage);
    const endTime = process.hrtime.bigint();
    
    const totalTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    const cpuTime = (endUsage.user + endUsage.system) / 1000; // Convert to milliseconds
    
    return Math.min(100, (cpuTime / totalTime) * 100);
  }

  /**
   * Calculate success rate for a category
   */
  private calculateSuccessRate(category: 'job' | 'automation' | 'api'): number {
    let successful = 0;
    let total = 0;

    switch (category) {
      case 'job':
        successful = this.counters.completedJobs;
        total = this.counters.totalJobs;
        break;
      case 'api':
        successful = this.counters.successfulRequests;
        total = this.counters.totalRequests;
        break;
    }

    return total > 0 ? Math.round((successful / total) * 100) : 100;
  }

  /**
   * Calculate average execution time for a category
   */
  private calculateAverageExecutionTime(category: string): number {
    const categoryMetrics = this.performanceMetrics.filter(m => m.category === category);
    if (categoryMetrics.length === 0) return 0;
    
    const totalTime = categoryMetrics.reduce((sum, m) => sum + m.duration, 0);
    return Math.round(totalTime / categoryMetrics.length);
  }

  /**
   * Get last error for a category
   */
  private getLastError(category: ErrorEvent['category']): ErrorEvent | undefined {
    const categoryErrors = this.errorHistory.filter(e => e.category === category);
    return categoryErrors[categoryErrors.length - 1];
  }

  /**
   * Get recent errors within a time window
   */
  private getRecentErrors(windowMs: number): ErrorEvent[] {
    const cutoff = Date.now() - windowMs;
    return this.errorHistory.filter(e => e.timestamp > cutoff);
  }

  /**
   * Get latest system metrics
   */
  private getLatestSystemMetrics(): SystemMetrics | undefined {
    return this.systemMetricsHistory[this.systemMetricsHistory.length - 1];
  }

  /**
   * Trim metrics history to max size
   */
  private trimMetricsHistory(): void {
    if (this.systemMetricsHistory.length > this.config.maxStoredMetrics) {
      this.systemMetricsHistory = this.systemMetricsHistory.slice(-this.config.maxStoredMetrics);
    }
    
    if (this.applicationMetricsHistory.length > this.config.maxStoredMetrics) {
      this.applicationMetricsHistory = this.applicationMetricsHistory.slice(-this.config.maxStoredMetrics);
    }
  }

  /**
   * Persist metrics to storage
   */
  private persistMetrics(): void {
    this.store.set('metrics', {
      system: this.systemMetricsHistory,
      application: this.applicationMetricsHistory,
      errors: this.errorHistory,
      performance: this.performanceMetrics,
    });
    
    this.store.set('counters', this.counters);
  }

  // =============================================================================
  // PUBLIC API
  // =============================================================================

  /**
   * Increment a counter
   */
  incrementCounter(name: keyof typeof this.counters): void {
    this.counters[name]++;
  }

  /**
   * Get current metrics summary
   */
  getMetricsSummary() {
    return {
      system: this.getLatestSystemMetrics(),
      application: this.applicationMetricsHistory[this.applicationMetricsHistory.length - 1],
      errors: {
        total: this.errorHistory.length,
        recent: this.getRecentErrors(60 * 60 * 1000).length, // Last hour
        unresolved: this.errorHistory.filter(e => !e.resolved).length,
      },
      performance: {
        totalTracked: this.performanceMetrics.length,
        categories: [...new Set(this.performanceMetrics.map(m => m.category))],
      },
      healthChecks: Object.fromEntries(this.lastHealthChecks),
    };
  }

  /**
   * Get error history
   */
  getErrorHistory(limit?: number): ErrorEvent[] {
    const errors = [...this.errorHistory].reverse(); // Most recent first
    return limit ? errors.slice(0, limit) : errors;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(category?: string, limit?: number): PerformanceMetric[] {
    let metrics = [...this.performanceMetrics].reverse(); // Most recent first
    
    if (category) {
      metrics = metrics.filter(m => m.category === category);
    }
    
    return limit ? metrics.slice(0, limit) : metrics;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.store.set('config', this.config);
    
    // Restart intervals if needed
    if (newConfig.metricsCollectionInterval) {
      this.stopMetricsCollection();
      this.startMetricsCollection();
    }
    
    this.emit('config-updated', this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  /**
   * Stop metrics collection
   */
  stopMetricsCollection(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
      console.log('📊 Stopped metrics collection');
    }
  }

  /**
   * Stop health checks
   */
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('🏥 Stopped health checks');
    }
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🧹 Shutting down monitoring service...');
    
    this.stopMetricsCollection();
    this.stopHealthChecks();
    
    // Final metrics persist
    this.persistMetrics();
    
    this.emit('shutdown');
    console.log('✅ Monitoring service shutdown complete');
  }
}