"use strict";
/**
 * @fileoverview Centralized Logging & Error Handling Plugin for Production Fastify API
 * @description Enterprise-grade structured logging with correlation IDs, error classification, and audit trails
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Production logging with PII protection and security event tracking
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingService = void 0;
var fastify_plugin_1 = require("fastify-plugin");
var shared_1 = require("@jobswipe/shared");
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
    LogLevel["TRACE"] = "trace";
})(LogLevel || (LogLevel = {}));
var ErrorType;
(function (ErrorType) {
    ErrorType["VALIDATION"] = "validation";
    ErrorType["AUTHENTICATION"] = "authentication";
    ErrorType["AUTHORIZATION"] = "authorization";
    ErrorType["NOT_FOUND"] = "not_found";
    ErrorType["RATE_LIMIT"] = "rate_limit";
    ErrorType["INTERNAL"] = "internal";
    ErrorType["EXTERNAL"] = "external";
    ErrorType["DATABASE"] = "database";
    ErrorType["NETWORK"] = "network";
    ErrorType["TIMEOUT"] = "timeout";
    ErrorType["SECURITY"] = "security";
})(ErrorType || (ErrorType = {}));
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (ErrorSeverity = {}));
// =============================================================================
// ERROR CLASSIFICATION
// =============================================================================
var ERROR_CLASSIFICATIONS = {
    // Authentication errors
    'AUTH_TOKEN_INVALID': { type: ErrorType.AUTHENTICATION, severity: ErrorSeverity.MEDIUM, retryable: false },
    'AUTH_TOKEN_EXPIRED': { type: ErrorType.AUTHENTICATION, severity: ErrorSeverity.LOW, retryable: true },
    'AUTH_CREDENTIALS_INVALID': { type: ErrorType.AUTHENTICATION, severity: ErrorSeverity.MEDIUM, retryable: false },
    'AUTH_SESSION_INVALID': { type: ErrorType.AUTHENTICATION, severity: ErrorSeverity.MEDIUM, retryable: false },
    // Authorization errors
    'INSUFFICIENT_PERMISSIONS': { type: ErrorType.AUTHORIZATION, severity: ErrorSeverity.MEDIUM, retryable: false },
    'FEATURE_NOT_AVAILABLE': { type: ErrorType.AUTHORIZATION, severity: ErrorSeverity.LOW, retryable: false },
    //'ACCOUNT_DISABLED': { type: ErrorType.AUTHORIZATION, severity: ErrorSeverity.HIGH, retryable: false }, // TODO: uncomment if needed
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
var LoggingService = /** @class */ (function () {
    function LoggingService(config) {
        this.config = config;
        this.correlationStore = new Map();
        this.performanceStore = new Map();
    }
    /**
     * Create log context from request
     */
    LoggingService.prototype.createContext = function (request) {
        var _a;
        var requestId = request.requestId || (0, shared_1.generateSecureToken)(16);
        var correlationId = this.getOrCreateCorrelationId(request);
        return {
            requestId: requestId,
            userId: (_a = request.user) === null || _a === void 0 ? void 0 : _a.id,
            sessionId: request.sessionId,
            ipAddress: this.extractIP(request),
            userAgent: request.headers['user-agent'] || 'unknown',
            method: request.method,
            url: this.sanitizeUrl(request.url),
            timestamp: new Date(),
            correlationId: correlationId,
            traceId: request.headers['x-trace-id'] || correlationId,
            spanId: (0, shared_1.generateSecureToken)(8),
        };
    };
    /**
     * Log structured entry
     */
    LoggingService.prototype.log = function (entry) {
        var logData = this.formatLogEntry(entry);
        // Output based on configuration
        if (this.config.structured) {
            console.log(JSON.stringify(logData));
        }
        else if (this.config.prettyPrint) {
            this.prettyLog(entry);
        }
        else {
            console.log(this.formatSimpleLog(entry));
        }
        // Store for correlation if needed
        if (this.config.correlation.enabled && entry.context.correlationId) {
            this.correlationStore.set(entry.context.requestId, entry.context.correlationId);
        }
    };
    /**
     * Log error with classification
     */
    LoggingService.prototype.logError = function (error, context, additionalInfo) {
        var errorDetails = this.classifyError(error);
        this.log({
            level: errorDetails.severity === ErrorSeverity.CRITICAL ? LogLevel.ERROR :
                errorDetails.severity === ErrorSeverity.HIGH ? LogLevel.ERROR : LogLevel.WARN,
            message: errorDetails.userMessage,
            context: context,
            error: errorDetails,
            metadata: additionalInfo,
        });
        // Notify if critical
        if (errorDetails.severity === ErrorSeverity.CRITICAL && this.config.errorHandling.notifyOnCritical) {
            this.notifyCriticalError(errorDetails, context);
        }
    };
    /**
     * Log audit event
     */
    LoggingService.prototype.logAudit = function (action, resource, outcome, context, details) {
        if (!this.config.auditLogging.enabled) {
            return;
        }
        this.log({
            level: LogLevel.INFO,
            message: "Audit: ".concat(action, " ").concat(resource, " - ").concat(outcome),
            context: context,
            audit: {
                action: action,
                resource: resource,
                outcome: outcome,
                changes: details,
                sensitiveData: this.containsSensitiveData(details),
            },
        });
    };
    /**
     * Log performance metrics
     */
    LoggingService.prototype.logPerformance = function (context, metrics) {
        if (!this.config.performance.enabled) {
            return;
        }
        var level = metrics.duration > this.config.performance.slowRequestThreshold ? LogLevel.WARN : LogLevel.INFO;
        this.log({
            level: level,
            message: "Request completed in ".concat(metrics.duration, "ms"),
            context: context,
            performance: metrics,
        });
    };
    /**
     * Start performance tracking
     */
    LoggingService.prototype.startPerformanceTracking = function (requestId) {
        if (!this.config.performance.enabled) {
            return;
        }
        this.performanceStore.set(requestId, {
            start: process.hrtime(),
            cpuUsage: process.cpuUsage(),
        });
    };
    /**
     * End performance tracking and log
     */
    LoggingService.prototype.endPerformanceTracking = function (context, additionalMetrics) {
        if (!this.config.performance.enabled) {
            return;
        }
        var perfData = this.performanceStore.get(context.requestId);
        if (!perfData) {
            return;
        }
        var _a = process.hrtime(perfData.start), seconds = _a[0], nanoseconds = _a[1];
        var duration = Math.round((seconds * 1000) + (nanoseconds / 1000000));
        var metrics = __assign({ duration: duration, memoryUsage: this.config.performance.trackMemory ? process.memoryUsage() : {}, cpuUsage: this.config.performance.trackCPU ? process.cpuUsage(perfData.cpuUsage) : {} }, additionalMetrics);
        this.logPerformance(context, metrics);
        this.performanceStore.delete(context.requestId);
    };
    /**
     * Log security event
     */
    LoggingService.prototype.logSecurity = function (eventType, severity, blocked, context, details) {
        this.log({
            level: severity === 'critical' ? LogLevel.ERROR : severity === 'high' ? LogLevel.WARN : LogLevel.INFO,
            message: "Security event: ".concat(eventType),
            context: context,
            security: {
                eventType: eventType,
                severity: severity,
                blocked: blocked,
                threatSignature: details === null || details === void 0 ? void 0 : details.signature,
                riskScore: details === null || details === void 0 ? void 0 : details.riskScore,
            },
            metadata: details,
        });
    };
    /**
     * Get or create correlation ID
     */
    LoggingService.prototype.getOrCreateCorrelationId = function (request) {
        if (!this.config.correlation.enabled) {
            return (0, shared_1.generateSecureToken)(16);
        }
        var headerValue = request.headers[this.config.correlation.headerName];
        if (headerValue) {
            return headerValue;
        }
        if (this.config.correlation.generateIfMissing) {
            return (0, shared_1.generateSecureToken)(16);
        }
        return '';
    };
    /**
     * Classify error and determine handling strategy
     */
    LoggingService.prototype.classifyError = function (error) {
        var code = error.code || error.name;
        var classification = ERROR_CLASSIFICATIONS[code] || {
            type: ErrorType.INTERNAL,
            severity: ErrorSeverity.MEDIUM,
            retryable: false,
        };
        return {
            name: error.name,
            message: error.message,
            stack: this.config.errorHandling.includeStackTrace ? error.stack : undefined,
            code: code,
            statusCode: error.statusCode || 500,
            type: classification.type,
            severity: classification.severity,
            retryable: classification.retryable,
            userMessage: this.generateUserMessage(classification.type, error.message),
            internalMessage: error.message,
        };
    };
    /**
     * Generate user-friendly error message
     */
    LoggingService.prototype.generateUserMessage = function (type, originalMessage) {
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
    };
    /**
     * Extract IP address safely
     */
    LoggingService.prototype.extractIP = function (request) {
        var _a;
        var xForwardedFor = request.headers['x-forwarded-for'];
        var xRealIP = request.headers['x-real-ip'];
        return ((_a = xForwardedFor === null || xForwardedFor === void 0 ? void 0 : xForwardedFor.split(',')[0]) === null || _a === void 0 ? void 0 : _a.trim()) || xRealIP || request.ip || 'unknown';
    };
    /**
     * Sanitize URL for logging
     */
    LoggingService.prototype.sanitizeUrl = function (url) {
        // Remove sensitive query parameters
        var sensitiveParams = ['password', 'token', 'secret', 'key', 'auth'];
        var sanitized = url;
        sensitiveParams.forEach(function (param) {
            var regex = new RegExp("([?&])".concat(param, "=[^&]*"), 'gi');
            sanitized = sanitized.replace(regex, "$1".concat(param, "=***"));
        });
        return sanitized;
    };
    /**
     * Check if data contains sensitive information
     */
    LoggingService.prototype.containsSensitiveData = function (data) {
        if (!data)
            return false;
        var sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'credit_card', 'phone', 'email'];
        var dataString = JSON.stringify(data).toLowerCase();
        return sensitiveFields.some(function (field) { return dataString.includes(field); });
    };
    /**
     * Format log entry for structured output
     */
    LoggingService.prototype.formatLogEntry = function (entry) {
        var formatted = {
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
    };
    /**
     * Pretty print log for development
     */
    LoggingService.prototype.prettyLog = function (entry) {
        var timestamp = entry.context.timestamp.toISOString();
        var level = entry.level.toUpperCase().padEnd(5);
        var context = "[".concat(entry.context.requestId.substring(0, 8), "]");
        console.log("".concat(timestamp, " ").concat(level, " ").concat(context, " ").concat(entry.message));
        if (entry.error) {
            console.log("  Error: ".concat(entry.error.name, " - ").concat(entry.error.message));
            if (entry.error.stack && this.config.errorHandling.includeStackTrace) {
                console.log("  Stack: ".concat(entry.error.stack));
            }
        }
        if (entry.performance) {
            console.log("  Performance: ".concat(entry.performance.duration, "ms"));
        }
    };
    /**
     * Format simple log line
     */
    LoggingService.prototype.formatSimpleLog = function (entry) {
        var timestamp = entry.context.timestamp.toISOString();
        var level = entry.level.toUpperCase();
        var requestId = entry.context.requestId.substring(0, 8);
        return "".concat(timestamp, " ").concat(level, " [").concat(requestId, "] ").concat(entry.message);
    };
    /**
     * Redact sensitive fields from object
     */
    LoggingService.prototype.redactSensitiveFields = function (obj) {
        if (!obj || typeof obj !== 'object') {
            return obj;
        }
        var redacted = __assign({}, obj);
        this.config.redactFields.forEach(function (field) {
            if (field in redacted) {
                redacted[field] = '***';
            }
        });
        return redacted;
    };
    /**
     * Hash PII for privacy-preserving logs
     */
    LoggingService.prototype.hashPII = function (value) {
        var crypto = require('crypto');
        return crypto.createHash('sha256').update(value).digest('hex').substring(0, 16);
    };
    /**
     * Notify about critical errors
     */
    LoggingService.prototype.notifyCriticalError = function (error, context) {
        // In production, this would integrate with alerting systems
        console.error("\uD83D\uDEA8 CRITICAL ERROR ALERT: ".concat(error.name, " - ").concat(error.message), {
            requestId: context.requestId,
            userId: context.userId,
            timestamp: context.timestamp,
        });
    };
    return LoggingService;
}());
exports.LoggingService = LoggingService;
// =============================================================================
// FASTIFY PLUGIN
// =============================================================================
function loggingPlugin(fastify, options) {
    return __awaiter(this, void 0, void 0, function () {
        var config, loggingService;
        var _this = this;
        return __generator(this, function (_a) {
            config = {
                level: process.env.LOG_LEVEL || LogLevel.INFO,
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
            loggingService = new LoggingService(config);
            // Register logging service
            fastify.decorate('logging', loggingService);
            // Request start hook
            fastify.addHook('onRequest', function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var context;
                return __generator(this, function (_a) {
                    context = loggingService.createContext(request);
                    request.logContext = context;
                    // Start performance tracking
                    loggingService.startPerformanceTracking(context.requestId);
                    // Add correlation ID to response headers
                    if (context.correlationId) {
                        reply.header(config.correlation.headerName, context.correlationId);
                    }
                    // Log request start
                    loggingService.log({
                        level: LogLevel.INFO,
                        message: "Request started: ".concat(request.method, " ").concat(request.url),
                        context: context,
                    });
                    return [2 /*return*/];
                });
            }); });
            // Response hook
            fastify.addHook('onResponse', function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var context;
                return __generator(this, function (_a) {
                    context = request.logContext;
                    if (!context)
                        return [2 /*return*/];
                    // End performance tracking
                    loggingService.endPerformanceTracking(context);
                    // Log response
                    loggingService.log({
                        level: LogLevel.INFO,
                        message: "Request completed: ".concat(reply.statusCode),
                        context: context,
                        metadata: {
                            statusCode: reply.statusCode,
                            responseTime: Date.now() - context.timestamp.getTime(),
                        },
                    });
                    return [2 /*return*/];
                });
            }); });
            // Error handler hook
            fastify.setErrorHandler(function (error, request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var context, classification, statusCode;
                return __generator(this, function (_a) {
                    context = request.logContext || loggingService.createContext(request);
                    // Log the error
                    loggingService.logError(error, context, {
                        url: request.url,
                        method: request.method,
                        body: request.body,
                        query: request.query,
                        params: request.params,
                    });
                    classification = ERROR_CLASSIFICATIONS[error.code || error.name] || {
                        type: ErrorType.INTERNAL,
                        severity: ErrorSeverity.MEDIUM,
                        retryable: false,
                    };
                    statusCode = error.statusCode ||
                        (classification.type === ErrorType.AUTHENTICATION ? 401 :
                            classification.type === ErrorType.AUTHORIZATION ? 403 :
                                classification.type === ErrorType.VALIDATION ? 400 :
                                    classification.type === ErrorType.NOT_FOUND ? 404 :
                                        classification.type === ErrorType.RATE_LIMIT ? 429 : 500);
                    // Send user-friendly error response
                    return [2 /*return*/, reply.code(statusCode).send({
                            success: false,
                            error: loggingService['generateUserMessage'](classification.type, error.message),
                            code: error.code || error.name,
                            requestId: context.requestId,
                            timestamp: new Date().toISOString(),
                            retryable: classification.retryable,
                        })];
                });
            }); });
            fastify.log.info('📝 Centralized Logging Plugin initialized with enterprise features');
            return [2 /*return*/];
        });
    });
}
// =============================================================================
// EXPORTS
// =============================================================================
exports.default = (0, fastify_plugin_1.default)(loggingPlugin, {
    name: 'logging',
    fastify: '4.x',
});
