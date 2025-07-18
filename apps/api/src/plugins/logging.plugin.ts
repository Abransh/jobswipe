/**
 * @fileoverview Centralized Logging & Error Handling Plugin for Production Fastify API
 * @description Enterprise-grade structured logging with correlation IDs, error classification, and audit trails
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Production logging with PII protection and security event tracking
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { generateSecureToken } from '@jobswipe/shared';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

interface LogContext {
  requestId: string;
  userId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  method: string;
  url: string;
  timestamp: Date;
  correlationId?: string;
  traceId?: string;
  spanId?: string;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: ErrorDetails;
  performance?: PerformanceMetrics;
  security?: SecurityLogData;
  audit?: AuditLogData;
  metadata?: Record<string, any>;
}

interface ErrorDetails {
  name: string;
  message: string;
  stack?: string;
  code?: string;
  statusCode?: number;
  type: ErrorType;
  severity: ErrorSeverity;
  retryable: boolean;
  userMessage: string;
  internalMessage: string;
}

interface PerformanceMetrics {
  duration: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  dbQueries?: number;
  cacheHits?: number;
  cacheMisses?: number;
  externalCalls?: number;
}

interface SecurityLogData {
  eventType: string;
  severity: string;
  blocked: boolean;
  threatSignature?: string;
  riskScore?: number;
}

interface AuditLogData {
  action: string;
  resource: string;
  outcome: 'success' | 'failure';
  changes?: Record<string, any>;
  sensitiveData: boolean;
}

enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  DATABASE = 'database',
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  SECURITY = 'security',
}

enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

interface LoggingConfig {
  level: LogLevel;
  structured: boolean;
  prettyPrint: boolean;
  includePII: boolean;
  redactFields: string[];
  auditLogging: {
    enabled: boolean;
    includeRequestBody: boolean;
    includeResponseBody: boolean;
    maxBodySize: number;
  };
  performance: {
    enabled: boolean;
    slowRequestThreshold: number;
    trackMemory: boolean;
    trackCPU: boolean;
  };
  errorHandling: {
    includeStackTrace: boolean;
    notifyOnCritical: boolean;
    retryableErrors: string[];
  };
  correlation: {
    enabled: boolean;
    headerName: string;
    generateIfMissing: boolean;
  };
}

// =============================================================================
// ERROR CLASSIFICATION
// =============================================================================

const ERROR_CLASSIFICATIONS: Record<string, { type: ErrorType; severity: ErrorSeverity; retryable: boolean }> = {
  // Authentication errors
  'AUTH_TOKEN_INVALID': { type: ErrorType.AUTHENTICATION, severity: ErrorSeverity.MEDIUM, retryable: false },
  'AUTH_TOKEN_EXPIRED': { type: ErrorType.AUTHENTICATION, severity: ErrorSeverity.LOW, retryable: true },
  'AUTH_CREDENTIALS_INVALID': { type: ErrorType.AUTHENTICATION, severity: ErrorSeverity.MEDIUM, retryable: false },
  'AUTH_SESSION_INVALID': { type: ErrorType.AUTHENTICATION, severity: ErrorSeverity.MEDIUM, retryable: false },
  
  // Authorization errors
  'INSUFFICIENT_PERMISSIONS': { type: ErrorType.AUTHORIZATION, severity: ErrorSeverity.MEDIUM, retryable: false },
  'FEATURE_NOT_AVAILABLE': { type: ErrorType.AUTHORIZATION, severity: ErrorSeverity.LOW, retryable: false },
  'ACCOUNT_DISABLED': { type: ErrorType.AUTHORIZATION, severity: ErrorSeverity.HIGH, retryable: false },
  
  // Validation errors
  'VALIDATION_ERROR': { type: ErrorType.VALIDATION, severity: ErrorSeverity.LOW, retryable: false },
  'INVALID_INPUT': { type: ErrorType.VALIDATION, severity: ErrorSeverity.LOW, retryable: false },
  'MISSING_REQUIRED_FIELD': { type: ErrorType.VALIDATION, severity: ErrorSeverity.LOW, retryable: false },
  
  // Rate limiting
  'RATE_LIMIT_EXCEEDED': { type: ErrorType.RATE_LIMIT, severity: ErrorSeverity.MEDIUM, retryable: true },
  'TOO_MANY_REQUESTS': { type: ErrorType.RATE_LIMIT, severity: ErrorSeverity.MEDIUM, retryable: true },
  
  // Database errors
  'DATABASE_CONNECTION_ERROR': { type: ErrorType.DATABASE, severity: ErrorSeverity.CRITICAL, retryable: true },
  'DATABASE_QUERY_ERROR': { type: ErrorType.DATABASE, severity: ErrorSeverity.HIGH, retryable: true },
  'DATABASE_CONSTRAINT_VIOLATION': { type: ErrorType.DATABASE, severity: ErrorSeverity.MEDIUM, retryable: false },
  
  // Network errors
  'NETWORK_TIMEOUT': { type: ErrorType.NETWORK, severity: ErrorSeverity.MEDIUM, retryable: true },
  'NETWORK_CONNECTION_ERROR': { type: ErrorType.NETWORK, severity: ErrorSeverity.MEDIUM, retryable: true },
  'SERVICE_UNAVAILABLE': { type: ErrorType.EXTERNAL, severity: ErrorSeverity.HIGH, retryable: true },
  
  // Security errors
  'SECURITY_VIOLATION': { type: ErrorType.SECURITY, severity: ErrorSeverity.CRITICAL, retryable: false },
  'SUSPICIOUS_ACTIVITY': { type: ErrorType.SECURITY, severity: ErrorSeverity.HIGH, retryable: false },
  'CSRF_TOKEN_INVALID': { type: ErrorType.SECURITY, severity: ErrorSeverity.HIGH, retryable: false },
};

// =============================================================================
// LOGGING SERVICE
// =============================================================================

class LoggingService {
  private correlationStore = new Map<string, string>();
  private performanceStore = new Map<string, { start: [number, number]; cpuUsage: NodeJS.CpuUsage }>();

  constructor(private config: LoggingConfig) {}

  /**
   * Create log context from request
   */
  createContext(request: FastifyRequest): LogContext {
    const requestId = (request as any).requestId || generateSecureToken(16);
    const correlationId = this.getOrCreateCorrelationId(request);
    
    return {
      requestId,
      userId: (request as any).user?.id,
      sessionId: (request as any).sessionId,
      ipAddress: this.extractIP(request),
      userAgent: request.headers['user-agent'] || 'unknown',
      method: request.method,
      url: this.sanitizeUrl(request.url),
      timestamp: new Date(),
      correlationId,
      traceId: (request.headers['x-trace-id'] as string) || correlationId,
      spanId: generateSecureToken(8),
    };
  }

  /**
   * Log structured entry
   */
  log(entry: LogEntry): void {
    const logData = this.formatLogEntry(entry);
    
    // Output based on configuration
    if (this.config.structured) {
      console.log(JSON.stringify(logData));
    } else if (this.config.prettyPrint) {
      this.prettyLog(entry);
    } else {
      console.log(this.formatSimpleLog(entry));
    }

    // Store for correlation if needed
    if (this.config.correlation.enabled && entry.context.correlationId) {
      this.correlationStore.set(entry.context.requestId, entry.context.correlationId);
    }
  }

  /**
   * Log error with classification
   */
  logError(error: Error, context: LogContext, additionalInfo?: Record<string, any>): void {
    const errorDetails = this.classifyError(error);
    
    this.log({
      level: errorDetails.severity === ErrorSeverity.CRITICAL ? LogLevel.ERROR : 
             errorDetails.severity === ErrorSeverity.HIGH ? LogLevel.ERROR : LogLevel.WARN,
      message: errorDetails.userMessage,
      context,
      error: errorDetails,
      metadata: additionalInfo,
    });

    // Notify if critical
    if (errorDetails.severity === ErrorSeverity.CRITICAL && this.config.errorHandling.notifyOnCritical) {
      this.notifyCriticalError(errorDetails, context);
    }
  }

  /**
   * Log audit event
   */
  logAudit(action: string, resource: string, outcome: 'success' | 'failure', context: LogContext, details?: Record<string, any>): void {
    if (!this.config.auditLogging.enabled) {
      return;
    }

    this.log({
      level: LogLevel.INFO,
      message: `Audit: ${action} ${resource} - ${outcome}`,
      context,
      audit: {
        action,
        resource,
        outcome,
        changes: details,
        sensitiveData: this.containsSensitiveData(details),
      },
    });
  }

  /**
   * Log performance metrics
   */
  logPerformance(context: LogContext, metrics: PerformanceMetrics): void {
    if (!this.config.performance.enabled) {
      return;
    }

    const level = metrics.duration > this.config.performance.slowRequestThreshold ? LogLevel.WARN : LogLevel.INFO;
    
    this.log({
      level,
      message: `Request completed in ${metrics.duration}ms`,
      context,
      performance: metrics,
    });
  }

  /**
   * Start performance tracking
   */
  startPerformanceTracking(requestId: string): void {
    if (!this.config.performance.enabled) {
      return;
    }

    this.performanceStore.set(requestId, {
      start: process.hrtime(),
      cpuUsage: process.cpuUsage(),
    });
  }

  /**
   * End performance tracking and log
   */
  endPerformanceTracking(context: LogContext, additionalMetrics?: Partial<PerformanceMetrics>): void {
    if (!this.config.performance.enabled) {
      return;
    }

    const perfData = this.performanceStore.get(context.requestId);
    if (!perfData) {
      return;
    }

    const [seconds, nanoseconds] = process.hrtime(perfData.start);
    const duration = Math.round((seconds * 1000) + (nanoseconds / 1000000));
    
    const metrics: PerformanceMetrics = {
      duration,
      memoryUsage: this.config.performance.trackMemory ? process.memoryUsage() : {} as NodeJS.MemoryUsage,
      cpuUsage: this.config.performance.trackCPU ? process.cpuUsage(perfData.cpuUsage) : {} as NodeJS.CpuUsage,
      ...additionalMetrics,
    };

    this.logPerformance(context, metrics);
    this.performanceStore.delete(context.requestId);
  }

  /**
   * Log security event
   */
  logSecurity(eventType: string, severity: string, blocked: boolean, context: LogContext, details?: Record<string, any>): void {
    this.log({
      level: severity === 'critical' ? LogLevel.ERROR : severity === 'high' ? LogLevel.WARN : LogLevel.INFO,
      message: `Security event: ${eventType}`,
      context,
      security: {
        eventType,
        severity,
        blocked,
        threatSignature: details?.signature,
        riskScore: details?.riskScore,
      },
      metadata: details,
    });
  }

  /**
   * Get or create correlation ID
   */
  private getOrCreateCorrelationId(request: FastifyRequest): string {
    if (!this.config.correlation.enabled) {
      return generateSecureToken(16);
    }

    const headerValue = request.headers[this.config.correlation.headerName] as string;
    if (headerValue) {
      return headerValue;
    }

    if (this.config.correlation.generateIfMissing) {
      return generateSecureToken(16);
    }

    return '';
  }

  /**
   * Classify error and determine handling strategy
   */
  private classifyError(error: Error): ErrorDetails {
    const code = (error as any).code || error.name;
    const classification = ERROR_CLASSIFICATIONS[code] || {
      type: ErrorType.INTERNAL,
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
    };

    return {
      name: error.name,
      message: error.message,
      stack: this.config.errorHandling.includeStackTrace ? error.stack : undefined,
      code,
      statusCode: (error as any).statusCode || 500,
      type: classification.type,
      severity: classification.severity,
      retryable: classification.retryable,
      userMessage: this.generateUserMessage(classification.type, error.message),
      internalMessage: error.message,
    };
  }

  /**
   * Generate user-friendly error message
   */
  private generateUserMessage(type: ErrorType, originalMessage: string): string {
    switch (type) {
      case ErrorType.AUTHENTICATION:
        return 'Authentication failed. Please check your credentials and try again.';
      case ErrorType.AUTHORIZATION:
        return 'You do not have permission to perform this action.';
      case ErrorType.VALIDATION:
        return 'The provided data is invalid. Please check your input and try again.';
      case ErrorType.RATE_LIMIT:
        return 'Too many requests. Please wait a moment and try again.';
      case ErrorType.NOT_FOUND:
        return 'The requested resource was not found.';
      case ErrorType.DATABASE:
      case ErrorType.INTERNAL:
        return 'An internal error occurred. Please try again later.';
      case ErrorType.EXTERNAL:
      case ErrorType.NETWORK:
        return 'A service is temporarily unavailable. Please try again later.';
      case ErrorType.SECURITY:
        return 'Security violation detected. This incident has been logged.';
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  }

  /**
   * Extract IP address safely
   */
  private extractIP(request: FastifyRequest): string {
    const xForwardedFor = request.headers['x-forwarded-for'] as string;
    const xRealIP = request.headers['x-real-ip'] as string;
    
    return (xForwardedFor?.split(',')[0]?.trim()) || xRealIP || request.ip || 'unknown';
  }

  /**
   * Sanitize URL for logging
   */
  private sanitizeUrl(url: string): string {
    // Remove sensitive query parameters
    const sensitiveParams = ['password', 'token', 'secret', 'key', 'auth'];
    let sanitized = url;
    
    sensitiveParams.forEach(param => {
      const regex = new RegExp(`([?&])${param}=[^&]*`, 'gi');
      sanitized = sanitized.replace(regex, `$1${param}=***`);
    });
    
    return sanitized;
  }

  /**
   * Check if data contains sensitive information
   */
  private containsSensitiveData(data?: Record<string, any>): boolean {
    if (!data) return false;
    
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'credit_card', 'phone', 'email'];
    const dataString = JSON.stringify(data).toLowerCase();
    
    return sensitiveFields.some(field => dataString.includes(field));
  }

  /**
   * Format log entry for structured output
   */
  private formatLogEntry(entry: LogEntry): Record<string, any> {
    const formatted: Record<string, any> = {
      timestamp: entry.context.timestamp.toISOString(),
      level: entry.level,
      message: entry.message,
      requestId: entry.context.requestId,
      correlationId: entry.context.correlationId,
      traceId: entry.context.traceId,
      spanId: entry.context.spanId,
      method: entry.context.method,
      url: entry.context.url,
      ipAddress: this.config.includePII ? entry.context.ipAddress : this.hashPII(entry.context.ipAddress),
      userAgent: entry.context.userAgent,
    };

    if (entry.context.userId) {
      formatted.userId = this.config.includePII ? entry.context.userId : this.hashPII(entry.context.userId);
    }

    if (entry.context.sessionId) {
      formatted.sessionId = entry.context.sessionId;
    }

    if (entry.error) {
      formatted.error = this.redactSensitiveFields(entry.error);
    }

    if (entry.performance) {
      formatted.performance = entry.performance;
    }

    if (entry.security) {
      formatted.security = entry.security;
    }

    if (entry.audit) {
      formatted.audit = this.redactSensitiveFields(entry.audit);
    }

    if (entry.metadata) {
      formatted.metadata = this.redactSensitiveFields(entry.metadata);
    }

    return formatted;
  }

  /**
   * Pretty print log for development
   */
  private prettyLog(entry: LogEntry): void {
    const timestamp = entry.context.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    const context = `[${entry.context.requestId.substring(0, 8)}]`;
    
    console.log(`${timestamp} ${level} ${context} ${entry.message}`);
    
    if (entry.error) {
      console.log(`  Error: ${entry.error.name} - ${entry.error.message}`);
      if (entry.error.stack && this.config.errorHandling.includeStackTrace) {
        console.log(`  Stack: ${entry.error.stack}`);
      }
    }
    
    if (entry.performance) {
      console.log(`  Performance: ${entry.performance.duration}ms`);
    }
  }

  /**
   * Format simple log line
   */
  private formatSimpleLog(entry: LogEntry): string {
    const timestamp = entry.context.timestamp.toISOString();
    const level = entry.level.toUpperCase();
    const requestId = entry.context.requestId.substring(0, 8);
    
    return `${timestamp} ${level} [${requestId}] ${entry.message}`;
  }

  /**
   * Redact sensitive fields from object
   */
  private redactSensitiveFields(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const redacted = { ...obj };
    
    this.config.redactFields.forEach(field => {
      if (field in redacted) {
        redacted[field] = '***';
      }
    });

    return redacted;
  }

  /**
   * Hash PII for privacy-preserving logs
   */
  private hashPII(value: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(value).digest('hex').substring(0, 16);
  }

  /**
   * Notify about critical errors
   */
  private notifyCriticalError(error: ErrorDetails, context: LogContext): void {
    // In production, this would integrate with alerting systems
    console.error(`🚨 CRITICAL ERROR ALERT: ${error.name} - ${error.message}`, {
      requestId: context.requestId,
      userId: context.userId,
      timestamp: context.timestamp,
    });
  }
}

// =============================================================================
// FASTIFY PLUGIN
// =============================================================================

async function loggingPlugin(fastify: FastifyInstance, options: any) {
  const config: LoggingConfig = {
    level: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
    structured: process.env.LOG_STRUCTURED === 'true',
    prettyPrint: process.env.LOG_PRETTY_PRINT === 'true' || process.env.NODE_ENV === 'development',
    includePII: process.env.LOG_INCLUDE_PII === 'true',
    redactFields: (process.env.LOG_REDACT_FIELDS || 'password,token,secret,key').split(','),
    auditLogging: {
      enabled: process.env.AUDIT_LOGGING_ENABLED !== 'false',
      includeRequestBody: process.env.AUDIT_INCLUDE_REQUEST_BODY === 'true',
      includeResponseBody: process.env.AUDIT_INCLUDE_RESPONSE_BODY === 'true',
      maxBodySize: parseInt(process.env.AUDIT_MAX_BODY_SIZE || '10240'), // 10KB
    },
    performance: {
      enabled: process.env.PERFORMANCE_LOGGING_ENABLED !== 'false',
      slowRequestThreshold: parseInt(process.env.SLOW_REQUEST_THRESHOLD || '1000'), // 1 second
      trackMemory: process.env.PERFORMANCE_TRACK_MEMORY === 'true',
      trackCPU: process.env.PERFORMANCE_TRACK_CPU === 'true',
    },
    errorHandling: {
      includeStackTrace: process.env.ERROR_INCLUDE_STACK_TRACE !== 'false',
      notifyOnCritical: process.env.ERROR_NOTIFY_CRITICAL === 'true',
      retryableErrors: (process.env.ERROR_RETRYABLE_CODES || 'DATABASE_CONNECTION_ERROR,NETWORK_TIMEOUT').split(','),
    },
    correlation: {
      enabled: process.env.CORRELATION_ENABLED !== 'false',
      headerName: process.env.CORRELATION_HEADER_NAME || 'x-correlation-id',
      generateIfMissing: process.env.CORRELATION_GENERATE_IF_MISSING !== 'false',
    },
  };

  const loggingService = new LoggingService(config);

  // Register logging service
  fastify.decorate('logging', loggingService);

  // Request start hook
  fastify.addHook('onRequest', async (request, reply) => {
    const context = loggingService.createContext(request);
    (request as any).logContext = context;
    
    // Start performance tracking
    loggingService.startPerformanceTracking(context.requestId);
    
    // Add correlation ID to response headers
    if (context.correlationId) {
      reply.header(config.correlation.headerName, context.correlationId);
    }
    
    // Log request start
    loggingService.log({
      level: LogLevel.INFO,
      message: `Request started: ${request.method} ${request.url}`,
      context,
    });
  });

  // Response hook
  fastify.addHook('onResponse', async (request, reply) => {
    const context = (request as any).logContext;
    if (!context) return;

    // End performance tracking
    loggingService.endPerformanceTracking(context);
    
    // Log response
    loggingService.log({
      level: LogLevel.INFO,
      message: `Request completed: ${reply.statusCode}`,
      context,
      metadata: {
        statusCode: reply.statusCode,
        responseTime: Date.now() - context.timestamp.getTime(),
      },
    });
  });

  // Error handler hook
  fastify.setErrorHandler(async (error, request, reply) => {
    const context = (request as any).logContext || loggingService.createContext(request);
    
    // Log the error
    loggingService.logError(error, context, {
      url: request.url,
      method: request.method,
      body: request.body,
      query: request.query,
      params: request.params,
    });

    // Classify error for response
    const classification = ERROR_CLASSIFICATIONS[(error as any).code || error.name] || {
      type: ErrorType.INTERNAL,
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
    };

    const statusCode = (error as any).statusCode || 
                      (classification.type === ErrorType.AUTHENTICATION ? 401 :
                       classification.type === ErrorType.AUTHORIZATION ? 403 :
                       classification.type === ErrorType.VALIDATION ? 400 :
                       classification.type === ErrorType.NOT_FOUND ? 404 :
                       classification.type === ErrorType.RATE_LIMIT ? 429 : 500);

    // Send user-friendly error response
    return reply.code(statusCode).send({
      success: false,
      error: loggingService['generateUserMessage'](classification.type, error.message),
      code: (error as any).code || error.name,
      requestId: context.requestId,
      timestamp: new Date().toISOString(),
      retryable: classification.retryable,
    });
  });

  fastify.log.info('📝 Centralized Logging Plugin initialized with enterprise features');
}

// =============================================================================
// TYPE DECLARATIONS
// =============================================================================

declare module 'fastify' {
  interface FastifyInstance {
    logging: LoggingService;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default fastifyPlugin(loggingPlugin as any, {
  name: 'logging',
  fastify: '4.x',
});

export type {
  LogContext,
  LogEntry,
  LogLevel,
  ErrorType,
  ErrorSeverity,
  LoggingConfig,
};

export {
  LoggingService,
};