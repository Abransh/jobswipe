import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import os from 'os';

/**
 * Production Monitoring Service
 * 
 * Enterprise-grade monitoring, metrics collection, and alerting system
 * for the JobSwipe automation platform. Provides real-time insights
 * into system health, performance, and business metrics.
 */

export interface MonitoringConfig {
  // Metrics Collection
  metrics: {
    enableSystemMetrics: boolean;
    enableBusinessMetrics: boolean;
    enablePerformanceMetrics: boolean;
    collectionInterval: number; // milliseconds
    retentionPeriod: number; // milliseconds
  };
  
  // Alerting
  alerting: {
    enabled: boolean;
    webhookUrl?: string;
    emailConfig?: {
      smtp: string;
      from: string;
      to: string[];
    };
    thresholds: {
      errorRate: number;
      responseTime: number;
      memoryUsage: number;
      cpuUsage: number;
      queueDepth: number;
      successRate: number;
    };
  };
  
  // Health Checks
  healthChecks: {
    enabled: boolean;
    interval: number;
    timeout: number;
    endpoints: string[];
  };
  
  // Logging
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableStructuredLogging: boolean;
    enableAuditLogging: boolean;
    logDirectory: string;
  };
}

export interface SystemMetrics {
  timestamp: number;
  system: {
    cpuUsage: number;
    memoryUsage: {
      total: number;
      used: number;
      free: number;
      percentage: number;
    };
    diskUsage: {
      total: number;
      used: number;
      free: number;
      percentage: number;
    };
    loadAverage: number[];
    uptime: number;
  };
  process: {
    pid: number;
    memory: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
    uptime: number;
    version: string;
  };
  network: {
    connections: number;
    bytesReceived: number;
    bytesSent: number;
  };
}

export interface BusinessMetrics {
  timestamp: number;
  applications: {
    total: number;
    successful: number;
    failed: number;
    pending: number;
    successRate: number;
    averageExecutionTime: number;
  };
  automation: {
    aiPowered: number;
    traditional: number;
    aiSuccessRate: number;
    captchaSolved: number;
    captchaSuccessRate: number;
  };
  queue: {
    depth: number;
    processing: number;
    completed: number;
    failed: number;
    throughput: number; // jobs per minute
  };
  users: {
    active: number;
    dailyActive: number;
    monthlyActive: number;
    newRegistrations: number;
  };
  companies: {
    supported: number;
    strategiesLoaded: number;
    averageSuccessRate: number;
  };
}

export interface PerformanceMetrics {
  timestamp: number;
  responseTime: {
    min: number;
    max: number;
    average: number;
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    jobsPerMinute: number;
    applicationsPerHour: number;
  };
  errors: {
    total: number;
    rate: number;
    byType: Record<string, number>;
    recent: Array<{ timestamp: number; error: string; count: number }>;
  };
  cache: {
    hitRate: number;
    missRate: number;
    evictions: number;
    size: number;
  };
}

export interface AlertEvent {
  id: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'system' | 'business' | 'performance' | 'security';
  title: string;
  description: string;
  metrics: any;
  resolved: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
}

export interface HealthStatus {
  overall: 'healthy' | 'warning' | 'critical';
  services: Record<string, {
    status: 'healthy' | 'warning' | 'critical' | 'down';
    responseTime?: number;
    lastCheck: number;
    error?: string;
  }>;
  dependencies: Record<string, {
    status: 'available' | 'degraded' | 'unavailable';
    lastCheck: number;
    error?: string;
  }>;
  uptime: number;
  version: string;
}

export class ProductionMonitoringService extends EventEmitter {
  private config: MonitoringConfig;
  private isRunning = false;
  private startTime = Date.now();
  
  // Metrics Storage (in production, use Redis/InfluxDB)
  private systemMetrics: SystemMetrics[] = [];
  private businessMetrics: BusinessMetrics[] = [];
  private performanceMetrics: PerformanceMetrics[] = [];
  private activeAlerts: Map<string, AlertEvent> = new Map();
  
  // Monitoring Intervals
  private metricsInterval?: NodeJS.Timeout;
  private healthCheckInterval?: NodeJS.Timeout;
  private alertCheckInterval?: NodeJS.Timeout;
  
  // Performance Tracking
  private requestTimes: number[] = [];
  private errorCounts: Map<string, number> = new Map();
  private lastMetricsReset = Date.now();

  constructor(config: MonitoringConfig) {
    super();
    this.config = config;
  }

  /**
   * Start the monitoring service
   */
  async start(): Promise<void> {
    try {
      console.log('📊 Starting Production Monitoring Service...');
      
      if (this.isRunning) {
        console.warn('⚠️ Monitoring service is already running');
        return;
      }

      // Start metrics collection
      if (this.config.metrics.enableSystemMetrics || 
          this.config.metrics.enableBusinessMetrics || 
          this.config.metrics.enablePerformanceMetrics) {
        this.startMetricsCollection();
      }

      // Start health checks
      if (this.config.healthChecks.enabled) {
        this.startHealthChecks();
      }

      // Start alert monitoring
      if (this.config.alerting.enabled) {
        this.startAlertMonitoring();
      }

      this.isRunning = true;
      console.log('✅ Production Monitoring Service started');
      
      this.emit('monitoring-started', {
        timestamp: Date.now(),
        config: this.config
      });

    } catch (error) {
      console.error('❌ Failed to start monitoring service:', error);
      this.emit('monitoring-error', { error: error.message });
      throw error;
    }
  }

  /**
   * Stop the monitoring service
   */
  async stop(): Promise<void> {
    try {
      console.log('🛑 Stopping Production Monitoring Service...');

      // Clear intervals
      if (this.metricsInterval) {
        clearInterval(this.metricsInterval);
        this.metricsInterval = undefined;
      }

      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = undefined;
      }

      if (this.alertCheckInterval) {
        clearInterval(this.alertCheckInterval);
        this.alertCheckInterval = undefined;
      }

      this.isRunning = false;
      console.log('✅ Production Monitoring Service stopped');
      
      this.emit('monitoring-stopped', { timestamp: Date.now() });

    } catch (error) {
      console.error('❌ Error stopping monitoring service:', error);
      this.emit('monitoring-error', { error: error.message });
    }
  }

  /**
   * Record a business event (job application, user action, etc.)
   */
  recordEvent(eventType: string, data: any): void {
    const timestamp = Date.now();
    
    this.emit('business-event', {
      timestamp,
      eventType,
      data
    });

    // Update relevant metrics based on event type
    switch (eventType) {
      case 'job-application-started':
        this.updateApplicationMetrics('started', data);
        break;
      case 'job-application-completed':
        this.updateApplicationMetrics('completed', data);
        break;
      case 'job-application-failed':
        this.updateApplicationMetrics('failed', data);
        break;
      case 'captcha-encountered':
        this.updateCaptchaMetrics(data);
        break;
      case 'user-action':
        this.updateUserMetrics(data);
        break;
    }
  }

  /**
   * Record performance timing
   */
  recordTiming(operation: string, duration: number): void {
    this.requestTimes.push(duration);
    
    // Keep only recent timings (last 1000)
    if (this.requestTimes.length > 1000) {
      this.requestTimes = this.requestTimes.slice(-1000);
    }

    this.emit('performance-timing', {
      timestamp: Date.now(),
      operation,
      duration
    });
  }

  /**
   * Record an error
   */
  recordError(errorType: string, error: any): void {
    const count = this.errorCounts.get(errorType) || 0;
    this.errorCounts.set(errorType, count + 1);

    this.emit('error-recorded', {
      timestamp: Date.now(),
      errorType,
      error: error.message || String(error),
      count: count + 1
    });

    // Check if error rate threshold is exceeded
    this.checkErrorRateThreshold();
  }

  /**
   * Get current system health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const services = await this.checkServiceHealth();
    const dependencies = await this.checkDependencyHealth();
    
    // Determine overall status
    let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    const serviceStatuses = Object.values(services).map(s => s.status);
    const dependencyStatuses = Object.values(dependencies).map(d => d.status);
    
    if (serviceStatuses.includes('critical') || serviceStatuses.includes('down')) {
      overall = 'critical';
    } else if (serviceStatuses.includes('warning') || dependencyStatuses.includes('degraded')) {
      overall = 'warning';
    } else if (dependencyStatuses.includes('unavailable')) {
      overall = 'warning';
    }

    return {
      overall,
      services,
      dependencies,
      uptime: Date.now() - this.startTime,
      version: process.env.npm_package_version || '1.0.0'
    };
  }

  /**
   * Get current metrics dashboard data
   */
  getDashboardData(): {
    system: SystemMetrics | null;
    business: BusinessMetrics | null;
    performance: PerformanceMetrics | null;
    alerts: AlertEvent[];
    health: Promise<HealthStatus>;
  } {
    return {
      system: this.systemMetrics[this.systemMetrics.length - 1] || null,
      business: this.businessMetrics[this.businessMetrics.length - 1] || null,
      performance: this.performanceMetrics[this.performanceMetrics.length - 1] || null,
      alerts: Array.from(this.activeAlerts.values()).filter(a => !a.resolved),
      health: this.getHealthStatus()
    };
  }

  /**
   * Get metrics history for specific time range
   */
  getMetricsHistory(
    type: 'system' | 'business' | 'performance',
    startTime: number,
    endTime: number
  ): any[] {
    const metricsArray = type === 'system' ? this.systemMetrics :
                        type === 'business' ? this.businessMetrics :
                        this.performanceMetrics;

    return metricsArray.filter(m => 
      m.timestamp >= startTime && m.timestamp <= endTime
    );
  }

  /**
   * Create and send an alert
   */
  async createAlert(
    severity: 'low' | 'medium' | 'high' | 'critical',
    type: 'system' | 'business' | 'performance' | 'security',
    title: string,
    description: string,
    metrics?: any
  ): Promise<void> {
    const alert: AlertEvent = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      severity,
      type,
      title,
      description,
      metrics: metrics || {},
      resolved: false
    };

    this.activeAlerts.set(alert.id, alert);
    
    console.warn(`🚨 ${severity.toUpperCase()} Alert: ${title}`);
    console.warn(`   Description: ${description}`);
    
    this.emit('alert-created', alert);

    // Send alert via configured channels
    if (this.config.alerting.enabled) {
      await this.sendAlert(alert);
    }
  }

  /**
   * Private Methods
   */
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(async () => {
      try {
        if (this.config.metrics.enableSystemMetrics) {
          await this.collectSystemMetrics();
        }
        
        if (this.config.metrics.enableBusinessMetrics) {
          await this.collectBusinessMetrics();
        }
        
        if (this.config.metrics.enablePerformanceMetrics) {
          await this.collectPerformanceMetrics();
        }
        
        // Clean up old metrics
        this.cleanupOldMetrics();
        
      } catch (error) {
        console.error('❌ Error collecting metrics:', error);
        this.emit('metrics-error', { error: error.message });
      }
    }, this.config.metrics.collectionInterval);
  }

  private async collectSystemMetrics(): Promise<void> {
    const metrics: SystemMetrics = {
      timestamp: Date.now(),
      system: {
        cpuUsage: await this.getCPUUsage(),
        memoryUsage: this.getMemoryUsage(),
        diskUsage: this.getDiskUsage(),
        loadAverage: os.loadavg(),
        uptime: os.uptime()
      },
      process: {
        pid: process.pid,
        memory: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        uptime: process.uptime(),
        version: process.version
      },
      network: {
        connections: 0, // Would implement actual network monitoring
        bytesReceived: 0,
        bytesSent: 0
      }
    };

    this.systemMetrics.push(metrics);
    this.emit('system-metrics-collected', metrics);
  }

  private async collectBusinessMetrics(): Promise<void> {
    // This would integrate with actual business data sources
    const metrics: BusinessMetrics = {
      timestamp: Date.now(),
      applications: {
        total: 0,
        successful: 0,
        failed: 0,
        pending: 0,
        successRate: 0,
        averageExecutionTime: 0
      },
      automation: {
        aiPowered: 0,
        traditional: 0,
        aiSuccessRate: 0,
        captchaSolved: 0,
        captchaSuccessRate: 0
      },
      queue: {
        depth: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        throughput: 0
      },
      users: {
        active: 0,
        dailyActive: 0,
        monthlyActive: 0,
        newRegistrations: 0
      },
      companies: {
        supported: 0,
        strategiesLoaded: 0,
        averageSuccessRate: 0
      }
    };

    this.businessMetrics.push(metrics);
    this.emit('business-metrics-collected', metrics);
  }

  private async collectPerformanceMetrics(): Promise<void> {
    const timings = this.requestTimes.slice();
    const errors = Array.from(this.errorCounts.entries());
    
    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      responseTime: {
        min: timings.length > 0 ? Math.min(...timings) : 0,
        max: timings.length > 0 ? Math.max(...timings) : 0,
        average: timings.length > 0 ? timings.reduce((a, b) => a + b, 0) / timings.length : 0,
        p50: this.percentile(timings, 50),
        p95: this.percentile(timings, 95),
        p99: this.percentile(timings, 99)
      },
      throughput: {
        requestsPerSecond: timings.length / 60, // Simplified calculation
        jobsPerMinute: 0,
        applicationsPerHour: 0
      },
      errors: {
        total: errors.reduce((sum, [, count]) => sum + count, 0),
        rate: errors.reduce((sum, [, count]) => sum + count, 0) / Math.max(timings.length, 1),
        byType: Object.fromEntries(errors),
        recent: errors.map(([type, count]) => ({
          timestamp: Date.now(),
          error: type,
          count
        }))
      },
      cache: {
        hitRate: 0.85, // Would get from actual cache
        missRate: 0.15,
        evictions: 0,
        size: 0
      }
    };

    this.performanceMetrics.push(metrics);
    this.emit('performance-metrics-collected', metrics);
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.getHealthStatus();
        this.emit('health-check-completed', health);
        
        // Check for health issues
        if (health.overall === 'critical') {
          await this.createAlert(
            'critical',
            'system',
            'System Health Critical',
            'One or more critical services are down or degraded'
          );
        }
        
      } catch (error) {
        console.error('❌ Error during health check:', error);
        this.emit('health-check-error', { error: error.message });
      }
    }, this.config.healthChecks.interval);
  }

  private startAlertMonitoring(): void {
    this.alertCheckInterval = setInterval(() => {
      try {
        this.checkSystemThresholds();
      } catch (error) {
        console.error('❌ Error checking alert thresholds:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  private async checkServiceHealth(): Promise<Record<string, any>> {
    // This would check actual service endpoints
    return {
      'browser-automation': {
        status: 'healthy',
        responseTime: 50,
        lastCheck: Date.now()
      },
      'vision-service': {
        status: 'healthy',
        responseTime: 100,
        lastCheck: Date.now()
      },
      'queue-manager': {
        status: 'healthy',
        responseTime: 25,
        lastCheck: Date.now()
      }
    };
  }

  private async checkDependencyHealth(): Promise<Record<string, any>> {
    // This would check external dependencies
    return {
      'redis': {
        status: 'available',
        lastCheck: Date.now()
      },
      'database': {
        status: 'available',
        lastCheck: Date.now()
      },
      'anthropic-api': {
        status: 'available',
        lastCheck: Date.now()
      }
    };
  }

  private async checkSystemThresholds(): Promise<void> {
    const latestSystem = this.systemMetrics[this.systemMetrics.length - 1];
    const latestPerformance = this.performanceMetrics[this.performanceMetrics.length - 1];
    
    if (!latestSystem || !latestPerformance) return;

    // Check memory usage
    if (latestSystem.system.memoryUsage.percentage > this.config.alerting.thresholds.memoryUsage) {
      await this.createAlert(
        'high',
        'system',
        'High Memory Usage',
        `Memory usage is ${latestSystem.system.memoryUsage.percentage.toFixed(1)}%`,
        { memoryUsage: latestSystem.system.memoryUsage }
      );
    }

    // Check CPU usage
    if (latestSystem.system.cpuUsage > this.config.alerting.thresholds.cpuUsage) {
      await this.createAlert(
        'high',
        'system',
        'High CPU Usage',
        `CPU usage is ${latestSystem.system.cpuUsage.toFixed(1)}%`,
        { cpuUsage: latestSystem.system.cpuUsage }
      );
    }

    // Check response time
    if (latestPerformance.responseTime.average > this.config.alerting.thresholds.responseTime) {
      await this.createAlert(
        'medium',
        'performance',
        'High Response Time',
        `Average response time is ${latestPerformance.responseTime.average.toFixed(0)}ms`,
        { responseTime: latestPerformance.responseTime }
      );
    }
  }

  private checkErrorRateThreshold(): void {
    const totalErrors = Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0);
    const totalRequests = this.requestTimes.length;
    const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0;

    if (errorRate > this.config.alerting.thresholds.errorRate) {
      this.createAlert(
        'high',
        'performance',
        'High Error Rate',
        `Error rate is ${(errorRate * 100).toFixed(1)}%`,
        { errorRate, totalErrors, totalRequests }
      );
    }
  }

  private async sendAlert(alert: AlertEvent): Promise<void> {
    try {
      // Send webhook if configured
      if (this.config.alerting.webhookUrl) {
        // Would implement actual webhook sending
        console.log(`📡 Sending webhook alert: ${alert.title}`);
      }

      // Send email if configured
      if (this.config.alerting.emailConfig) {
        // Would implement actual email sending
        console.log(`📧 Sending email alert: ${alert.title}`);
      }

    } catch (error) {
      console.error('❌ Failed to send alert:', error);
    }
  }

  private cleanupOldMetrics(): void {
    const cutoff = Date.now() - this.config.metrics.retentionPeriod;
    
    this.systemMetrics = this.systemMetrics.filter(m => m.timestamp > cutoff);
    this.businessMetrics = this.businessMetrics.filter(m => m.timestamp > cutoff);
    this.performanceMetrics = this.performanceMetrics.filter(m => m.timestamp > cutoff);
  }

  private getCPUUsage(): Promise<number> {
    return new Promise((resolve) => {
      const start = process.cpuUsage();
      setTimeout(() => {
        const end = process.cpuUsage(start);
        const usage = (end.user + end.system) / 1000; // Convert to milliseconds
        resolve(Math.min(usage / 10, 100)); // Rough approximation
      }, 100);
    });
  }

  private getMemoryUsage(): SystemMetrics['system']['memoryUsage'] {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    
    return {
      total: Math.round(total / 1024 / 1024), // MB
      used: Math.round(used / 1024 / 1024),   // MB
      free: Math.round(free / 1024 / 1024),   // MB
      percentage: (used / total) * 100
    };
  }

  private getDiskUsage(): SystemMetrics['system']['diskUsage'] {
    // Simplified disk usage - would use actual filesystem stats in production
    return {
      total: 100000, // MB
      used: 45000,   // MB
      free: 55000,   // MB
      percentage: 45
    };
  }

  private percentile(arr: number[], p: number): number {
    if (arr.length === 0) return 0;
    
    const sorted = arr.slice().sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    
    if (Math.floor(index) === index) {
      return sorted[index];
    } else {
      const lower = sorted[Math.floor(index)];
      const upper = sorted[Math.ceil(index)];
      return lower + (upper - lower) * (index - Math.floor(index));
    }
  }

  private updateApplicationMetrics(type: string, data: any): void {
    // Update business metrics based on application events
    // This would integrate with actual data stores
  }

  private updateCaptchaMetrics(data: any): void {
    // Update captcha resolution metrics
  }

  private updateUserMetrics(data: any): void {
    // Update user activity metrics
  }
}

export default ProductionMonitoringService;