/**
 * @fileoverview Comprehensive Monitoring & Observability Plugin for Production Fastify API
 * @description Enterprise-grade metrics collection, tracing, and observability
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Production monitoring with data aggregation and alerting
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { generateSecureToken } from '@jobswipe/shared';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

interface MetricsConfig {
  enabled: boolean;
  collection: {
    interval: number;
    retention: number;
    batchSize: number;
  };
  endpoints: {
    metrics: string;
    health: string;
    traces: string;
  };
  alerting: {
    enabled: boolean;
    thresholds: AlertThresholds;
    webhookUrl?: string;
  };
  system: {
    trackCPU: boolean;
    trackMemory: boolean;
    trackDisk: boolean;
    trackNetwork: boolean;
  };
  business: {
    trackUsers: boolean;
    trackRequests: boolean;
    trackErrors: boolean;
    trackSecurity: boolean;
  };
}

interface AlertThresholds {
  errorRate: number;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  activeConnections: number;
}

interface RequestMetrics {
  id: string;
  timestamp: Date;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userAgent: string;
  ipAddress: string;
  userId?: string;
  sessionId?: string;
  errorType?: string;
  size: {
    request: number;
    response: number;
  };
}

interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    usage: number;
    total: number;
    free: number;
    heap: NodeJS.MemoryUsage;
  };
  process: {
    uptime: number;
    pid: number;
    version: string;
  };
  network: {
    connections: number;
    bandwidth: {
      in: number;
      out: number;
    };
  };
}

interface BusinessMetrics {
  timestamp: Date;
  users: {
    active: number;
    registered: number;
    authenticated: number;
  };
  requests: {
    total: number;
    successful: number;
    failed: number;
    rate: number;
  };
  security: {
    attacks: number;
    blockedIPs: number;
    failedLogins: number;
  };
  jobs: {
    total: number;
    applied: number;
    successful: number;
    failed: number;
  };
}

interface TraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  tags: Record<string, any>;
  logs: Array<{
    timestamp: Date;
    level: string;
    message: string;
    fields?: Record<string, any>;
  }>;
  status: 'pending' | 'success' | 'error';
}

interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: Date;
  metric: string;
  value: number;
  threshold: number;
  resolved: boolean;
  resolvedAt?: Date;
}

enum AlertType {
  PERFORMANCE = 'performance',
  ERROR = 'error',
  SECURITY = 'security',
  SYSTEM = 'system',
  BUSINESS = 'business',
}

enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// =============================================================================
// MONITORING SERVICE
// =============================================================================

class MonitoringService {
  private requestMetrics: RequestMetrics[] = [];
  private systemMetrics: SystemMetrics[] = [];
  private businessMetrics: BusinessMetrics[] = [];
  private traces: Map<string, TraceSpan[]> = new Map();
  private alerts: Alert[] = [];
  private activeTraces: Map<string, TraceSpan> = new Map();
  private metricsInterval?: NodeJS.Timeout;
  private lastSystemMetrics?: SystemMetrics;

  constructor(private config: MetricsConfig) {
    if (this.config.enabled) {
      this.startMetricsCollection();
    }
  }

  /**
   * Start metrics collection interval
   */
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.collectSystemMetrics();
      this.collectBusinessMetrics();
      this.checkAlerts();
      this.cleanupOldMetrics();
    }, this.config.collection.interval);
  }

  /**
   * Record request metrics
   */
  recordRequest(request: FastifyRequest, reply: FastifyReply, startTime: Date): void {
    if (!this.config.enabled) return;

    const endTime = new Date();
    const responseTime = endTime.getTime() - startTime.getTime();

    const metrics: RequestMetrics = {
      id: generateSecureToken(16),
      timestamp: endTime,
      method: request.method,
      url: this.sanitizeUrl(request.url),
      statusCode: reply.statusCode,
      responseTime,
      userAgent: request.headers['user-agent'] || 'unknown',
      ipAddress: this.extractIP(request),
      userId: (request as any).user?.id,
      sessionId: (request as any).sessionId,
      errorType: reply.statusCode >= 400 ? this.getErrorType(reply.statusCode) : undefined,
      size: {
        request: this.getRequestSize(request),
        response: this.getResponseSize(reply),
      },
    };

    this.requestMetrics.push(metrics);

    // Check for immediate alerts
    this.checkRequestAlert(metrics);
  }

  /**
   * Start a trace span
   */
  startTrace(operationName: string, parentSpanId?: string): TraceSpan {
    const traceId = parentSpanId ? 
      this.findTraceIdBySpan(parentSpanId) || generateSecureToken(16) :
      generateSecureToken(16);
    
    const span: TraceSpan = {
      traceId,
      spanId: generateSecureToken(8),
      parentSpanId,
      operationName,
      startTime: new Date(),
      tags: {},
      logs: [],
      status: 'pending',
    };

    this.activeTraces.set(span.spanId, span);
    
    if (!this.traces.has(traceId)) {
      this.traces.set(traceId, []);
    }
    this.traces.get(traceId)!.push(span);

    return span;
  }

  /**
   * Finish a trace span
   */
  finishTrace(spanId: string, tags?: Record<string, any>, error?: Error): void {
    const span = this.activeTraces.get(spanId);
    if (!span) return;

    span.endTime = new Date();
    span.duration = span.endTime.getTime() - span.startTime.getTime();
    span.status = error ? 'error' : 'success';
    
    if (tags) {
      span.tags = { ...span.tags, ...tags };
    }

    if (error) {
      span.logs.push({
        timestamp: new Date(),
        level: 'error',
        message: error.message,
        fields: {
          stack: error.stack,
          name: error.name,
        },
      });
    }

    this.activeTraces.delete(spanId);
  }

  /**
   * Add log to trace span
   */
  addTraceLog(spanId: string, level: string, message: string, fields?: Record<string, any>): void {
    const span = this.activeTraces.get(spanId);
    if (!span) return;

    span.logs.push({
      timestamp: new Date(),
      level,
      message,
      fields,
    });
  }

  /**
   * Collect system metrics
   */
  private collectSystemMetrics(): void {
    if (!this.config.system.trackCPU && !this.config.system.trackMemory) return;

    const metrics: SystemMetrics = {
      timestamp: new Date(),
      cpu: {
        usage: this.getCPUUsage(),
        loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0],
      },
      memory: {
        usage: this.getMemoryUsagePercent(),
        total: require('os').totalmem(),
        free: require('os').freemem(),
        heap: process.memoryUsage(),
      },
      process: {
        uptime: process.uptime(),
        pid: process.pid,
        version: process.version,
      },
      network: {
        connections: this.getActiveConnections(),
        bandwidth: {
          in: 0, // Placeholder - would need system integration
          out: 0,
        },
      },
    };

    this.systemMetrics.push(metrics);
    this.lastSystemMetrics = metrics;
  }

  /**
   * Collect business metrics
   */
  private collectBusinessMetrics(): void {
    if (!this.config.business.trackUsers && !this.config.business.trackRequests) return;

    const now = new Date();
    const oneHour = 60 * 60 * 1000;
    const recentRequests = this.requestMetrics.filter(
      m => now.getTime() - m.timestamp.getTime() < oneHour
    );

    const metrics: BusinessMetrics = {
      timestamp: now,
      users: {
        active: this.countActiveUsers(oneHour),
        registered: 0, // Would need database integration
        authenticated: this.countAuthenticatedUsers(oneHour),
      },
      requests: {
        total: recentRequests.length,
        successful: recentRequests.filter(r => r.statusCode < 400).length,
        failed: recentRequests.filter(r => r.statusCode >= 400).length,
        rate: recentRequests.length / 60, // per minute
      },
      security: {
        attacks: this.countSecurityEvents(oneHour),
        blockedIPs: 0, // Would need security service integration
        failedLogins: this.countFailedLogins(oneHour),
      },
      jobs: {
        total: 0, // Would need database integration
        applied: 0,
        successful: 0,
        failed: 0,
      },
    };

    this.businessMetrics.push(metrics);
  }

  /**
   * Check for alerts
   */
  private checkAlerts(): void {
    if (!this.config.alerting.enabled || !this.lastSystemMetrics) return;

    const thresholds = this.config.alerting.thresholds;

    // Check error rate
    const recentRequests = this.getRecentRequests(5 * 60 * 1000); // 5 minutes
    if (recentRequests.length > 0) {
      const errorRate = recentRequests.filter(r => r.statusCode >= 400).length / recentRequests.length;
      if (errorRate > thresholds.errorRate) {
        this.createAlert(AlertType.ERROR, AlertSeverity.HIGH, 'High Error Rate', 
          `Error rate is ${(errorRate * 100).toFixed(2)}%`, 'error_rate', errorRate, thresholds.errorRate);
      }
    }

    // Check response time
    if (recentRequests.length > 0) {
      const avgResponseTime = recentRequests.reduce((sum, r) => sum + r.responseTime, 0) / recentRequests.length;
      if (avgResponseTime > thresholds.responseTime) {
        this.createAlert(AlertType.PERFORMANCE, AlertSeverity.MEDIUM, 'Slow Response Time',
          `Average response time is ${avgResponseTime.toFixed(2)}ms`, 'response_time', avgResponseTime, thresholds.responseTime);
      }
    }

    // Check memory usage
    if (this.lastSystemMetrics.memory.usage > thresholds.memoryUsage) {
      this.createAlert(AlertType.SYSTEM, AlertSeverity.HIGH, 'High Memory Usage',
        `Memory usage is ${this.lastSystemMetrics.memory.usage.toFixed(2)}%`, 'memory_usage', 
        this.lastSystemMetrics.memory.usage, thresholds.memoryUsage);
    }

    // Check CPU usage
    if (this.lastSystemMetrics.cpu.usage > thresholds.cpuUsage) {
      this.createAlert(AlertType.SYSTEM, AlertSeverity.HIGH, 'High CPU Usage',
        `CPU usage is ${this.lastSystemMetrics.cpu.usage.toFixed(2)}%`, 'cpu_usage',
        this.lastSystemMetrics.cpu.usage, thresholds.cpuUsage);
    }
  }

  /**
   * Create an alert
   */
  private createAlert(type: AlertType, severity: AlertSeverity, title: string, 
                     description: string, metric: string, value: number, threshold: number): void {
    const alert: Alert = {
      id: generateSecureToken(16),
      type,
      severity,
      title,
      description,
      timestamp: new Date(),
      metric,
      value,
      threshold,
      resolved: false,
    };

    this.alerts.push(alert);

    // Send webhook notification if configured
    if (this.config.alerting.webhookUrl) {
      this.sendAlertWebhook(alert);
    }

    console.error(`🚨 ALERT [${severity.toUpperCase()}]: ${title} - ${description}`);
  }

  /**
   * Get current metrics summary
   */
  getMetricsSummary(): {
    requests: any;
    system: any;
    business: any;
    alerts: any;
  } {
    const recentRequests = this.getRecentRequests(60 * 60 * 1000); // 1 hour
    const activeAlerts = this.alerts.filter(a => !a.resolved);

    return {
      requests: {
        total: recentRequests.length,
        successful: recentRequests.filter(r => r.statusCode < 400).length,
        failed: recentRequests.filter(r => r.statusCode >= 400).length,
        averageResponseTime: recentRequests.length > 0 ? 
          recentRequests.reduce((sum, r) => sum + r.responseTime, 0) / recentRequests.length : 0,
        requestRate: recentRequests.length / 60, // per minute
      },
      system: this.lastSystemMetrics ? {
        cpu: this.lastSystemMetrics.cpu.usage,
        memory: this.lastSystemMetrics.memory.usage,
        uptime: this.lastSystemMetrics.process.uptime,
        connections: this.lastSystemMetrics.network.connections,
      } : null,
      business: this.businessMetrics.length > 0 ? this.businessMetrics[this.businessMetrics.length - 1] : null,
      alerts: {
        total: activeAlerts.length,
        critical: activeAlerts.filter(a => a.severity === AlertSeverity.CRITICAL).length,
        high: activeAlerts.filter(a => a.severity === AlertSeverity.HIGH).length,
        recent: activeAlerts.slice(-10),
      },
    };
  }

  /**
   * Get detailed metrics for specific time range
   */
  getDetailedMetrics(timeRange: number = 60 * 60 * 1000): {
    requests: RequestMetrics[];
    system: SystemMetrics[];
    business: BusinessMetrics[];
    traces: Array<{ traceId: string; spans: TraceSpan[] }>;
  } {
    const cutoff = new Date(Date.now() - timeRange);

    return {
      requests: this.requestMetrics.filter(m => m.timestamp > cutoff),
      system: this.systemMetrics.filter(m => m.timestamp > cutoff),
      business: this.businessMetrics.filter(m => m.timestamp > cutoff),
      traces: Array.from(this.traces.entries())
        .filter(([_, spans]) => spans.some(s => s.startTime > cutoff))
        .map(([traceId, spans]) => ({ traceId, spans })),
    };
  }

  /**
   * Utility methods
   */
  private sanitizeUrl(url: string): string {
    return url.split('?')[0]; // Remove query parameters for privacy
  }

  private extractIP(request: FastifyRequest): string {
    const xForwardedFor = request.headers['x-forwarded-for'] as string;
    const xRealIP = request.headers['x-real-ip'] as string;
    return (xForwardedFor?.split(',')[0]?.trim()) || xRealIP || request.ip || 'unknown';
  }

  private getRequestSize(request: FastifyRequest): number {
    return parseInt(request.headers['content-length'] as string) || 0;
  }

  private getResponseSize(reply: FastifyReply): number {
    return parseInt(reply.getHeader('content-length') as string) || 0;
  }

  private getErrorType(statusCode: number): string {
    if (statusCode >= 400 && statusCode < 500) return 'client_error';
    if (statusCode >= 500) return 'server_error';
    return 'unknown';
  }

  private getCPUUsage(): number {
    // Simplified CPU usage calculation
    const usage = process.cpuUsage();
    return (usage.user + usage.system) / 1000000 * 100; // Convert to percentage
  }

  private getMemoryUsagePercent(): number {
    const total = require('os').totalmem();
    const free = require('os').freemem();
    return ((total - free) / total) * 100;
  }

  private getActiveConnections(): number {
    // Placeholder - would need proper implementation
    return this.requestMetrics.filter(
      m => Date.now() - m.timestamp.getTime() < 5000
    ).length;
  }

  private getRecentRequests(timeRange: number): RequestMetrics[] {
    const cutoff = new Date(Date.now() - timeRange);
    return this.requestMetrics.filter(m => m.timestamp > cutoff);
  }

  private countActiveUsers(timeRange: number): number {
    const cutoff = new Date(Date.now() - timeRange);
    const recentRequests = this.requestMetrics.filter(m => m.timestamp > cutoff && m.userId);
    return new Set(recentRequests.map(r => r.userId)).size;
  }

  private countAuthenticatedUsers(timeRange: number): number {
    return this.countActiveUsers(timeRange); // Same as active for now
  }

  private countSecurityEvents(timeRange: number): number {
    const cutoff = new Date(Date.now() - timeRange);
    return this.requestMetrics.filter(
      m => m.timestamp > cutoff && (m.statusCode === 401 || m.statusCode === 403)
    ).length;
  }

  private countFailedLogins(timeRange: number): number {
    const cutoff = new Date(Date.now() - timeRange);
    return this.requestMetrics.filter(
      m => m.timestamp > cutoff && m.url.includes('/auth/login') && m.statusCode === 401
    ).length;
  }

  private findTraceIdBySpan(spanId: string): string | undefined {
    for (const [traceId, spans] of this.traces.entries()) {
      if (spans.some(s => s.spanId === spanId)) {
        return traceId;
      }
    }
    return undefined;
  }

  private checkRequestAlert(metrics: RequestMetrics): void {
    // Check for immediate response time alert
    if (metrics.responseTime > this.config.alerting.thresholds.responseTime * 2) {
      this.createAlert(AlertType.PERFORMANCE, AlertSeverity.HIGH, 'Slow Request',
        `Request ${metrics.url} took ${metrics.responseTime}ms`, 'single_request_time',
        metrics.responseTime, this.config.alerting.thresholds.responseTime);
    }
  }

  private sendAlertWebhook(alert: Alert): void {
    // Placeholder for webhook implementation
    console.log(`Sending webhook for alert: ${alert.title}`);
  }

  private cleanupOldMetrics(): void {
    const retention = this.config.collection.retention;
    const cutoff = new Date(Date.now() - retention);

    this.requestMetrics = this.requestMetrics.filter(m => m.timestamp > cutoff);
    this.systemMetrics = this.systemMetrics.filter(m => m.timestamp > cutoff);
    this.businessMetrics = this.businessMetrics.filter(m => m.timestamp > cutoff);
    
    // Clean up old traces
    for (const [traceId, spans] of this.traces.entries()) {
      const filteredSpans = spans.filter(s => s.startTime > cutoff);
      if (filteredSpans.length === 0) {
        this.traces.delete(traceId);
      } else {
        this.traces.set(traceId, filteredSpans);
      }
    }
  }

  /**
   * Shutdown monitoring service
   */
  shutdown(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
  }
}

// =============================================================================
// FASTIFY PLUGIN
// =============================================================================

async function monitoringPlugin(fastify: FastifyInstance) {
  const config: MetricsConfig = {
    enabled: process.env.MONITORING_ENABLED !== 'false',
    collection: {
      interval: parseInt(process.env.MONITORING_INTERVAL || '60000'), // 1 minute
      retention: parseInt(process.env.MONITORING_RETENTION || '86400000'), // 24 hours
      batchSize: parseInt(process.env.MONITORING_BATCH_SIZE || '1000'),
    },
    endpoints: {
      metrics: process.env.MONITORING_METRICS_ENDPOINT || '/metrics',
      health: process.env.MONITORING_HEALTH_ENDPOINT || '/health/monitoring',
      traces: process.env.MONITORING_TRACES_ENDPOINT || '/traces',
    },
    alerting: {
      enabled: process.env.ALERTING_ENABLED !== 'false',
      webhookUrl: process.env.ALERT_WEBHOOK_URL,
      thresholds: {
        errorRate: parseFloat(process.env.ALERT_ERROR_RATE_THRESHOLD || '0.05'), // 5%
        responseTime: parseInt(process.env.ALERT_RESPONSE_TIME_THRESHOLD || '2000'), // 2 seconds
        memoryUsage: parseFloat(process.env.ALERT_MEMORY_THRESHOLD || '85'), // 85%
        cpuUsage: parseFloat(process.env.ALERT_CPU_THRESHOLD || '80'), // 80%
        diskUsage: parseFloat(process.env.ALERT_DISK_THRESHOLD || '90'), // 90%
        activeConnections: parseInt(process.env.ALERT_CONNECTIONS_THRESHOLD || '1000'),
      },
    },
    system: {
      trackCPU: process.env.MONITOR_CPU !== 'false',
      trackMemory: process.env.MONITOR_MEMORY !== 'false',
      trackDisk: process.env.MONITOR_DISK !== 'false',
      trackNetwork: process.env.MONITOR_NETWORK !== 'false',
    },
    business: {
      trackUsers: process.env.MONITOR_USERS !== 'false',
      trackRequests: process.env.MONITOR_REQUESTS !== 'false',
      trackErrors: process.env.MONITOR_ERRORS !== 'false',
      trackSecurity: process.env.MONITOR_SECURITY !== 'false',
    },
  };

  const monitoringService = new MonitoringService(config);

  // Register monitoring service
  fastify.decorate('monitoring', monitoringService);

  // Request tracking hooks
  if (config.enabled) {
    fastify.addHook('onRequest', async (request, reply) => {
      (request as any).startTime = new Date();
    });

    fastify.addHook('onResponse', async (request, reply) => {
      const startTime = (request as any).startTime;
      if (startTime) {
        monitoringService.recordRequest(request, reply, startTime);
      }
    });
  }

  // Metrics endpoint
  fastify.get(config.endpoints.metrics, {
    schema: {
      summary: 'Get application metrics',
      tags: ['Monitoring'],
      response: {
        200: {
          type: 'object',
          properties: {
            timestamp: { type: 'string' },
            summary: { type: 'object' },
            detailed: { type: 'object' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const timeRange = parseInt(request.query?.['timeRange'] as string) || 60 * 60 * 1000; // 1 hour default
    
    return reply.send({
      timestamp: new Date().toISOString(),
      summary: monitoringService.getMetricsSummary(),
      detailed: monitoringService.getDetailedMetrics(timeRange),
    });
  });

  // Health monitoring endpoint
  fastify.get(config.endpoints.health, {
    schema: {
      summary: 'Get monitoring health status',
      tags: ['Monitoring'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            monitoring: { type: 'object' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const summary = monitoringService.getMetricsSummary();
    
    // Determine health status based on metrics
    let status = 'healthy';
    if (summary.alerts.critical > 0) {
      status = 'critical';
    } else if (summary.alerts.high > 0) {
      status = 'degraded';
    }

    return reply.code(status === 'healthy' ? 200 : 503).send({
      status,
      timestamp: new Date().toISOString(),
      monitoring: {
        enabled: config.enabled,
        metricsCollected: true,
        alertingEnabled: config.alerting.enabled,
        summary,
      },
    });
  });

  // Traces endpoint
  fastify.get(config.endpoints.traces, {
    schema: {
      summary: 'Get distributed traces',
      tags: ['Monitoring'],
      response: {
        200: {
          type: 'object',
          properties: {
            traces: { type: 'array' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const timeRange = parseInt(request.query?.['timeRange'] as string) || 60 * 60 * 1000; // 1 hour default
    const detailed = monitoringService.getDetailedMetrics(timeRange);
    
    return reply.send({
      traces: detailed.traces,
      timestamp: new Date().toISOString(),
    });
  });

  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    monitoringService.shutdown();
  });

  fastify.log.info('📊 Comprehensive Monitoring & Observability Plugin initialized');
}

// =============================================================================
// TYPE DECLARATIONS
// =============================================================================

declare module 'fastify' {
  interface FastifyInstance {
    monitoring: MonitoringService;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default fastifyPlugin(monitoringPlugin, {
  name: 'monitoring',
  fastify: '4.x',
});

export type {
  MetricsConfig,
  RequestMetrics,
  SystemMetrics,
  BusinessMetrics,
  TraceSpan,
  Alert,
  AlertType,
  AlertSeverity,
};

export {
  MonitoringService,
};