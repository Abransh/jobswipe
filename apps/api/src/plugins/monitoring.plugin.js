"use strict";
/**
 * @fileoverview Comprehensive Monitoring & Observability Plugin for Production Fastify API
 * @description Enterprise-grade metrics collection, tracing, and observability
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Production monitoring with data aggregation and alerting
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
exports.MonitoringService = void 0;
var fastify_plugin_1 = require("fastify-plugin");
var shared_1 = require("@jobswipe/shared");
var AlertType;
(function (AlertType) {
    AlertType["PERFORMANCE"] = "performance";
    AlertType["ERROR"] = "error";
    AlertType["SECURITY"] = "security";
    AlertType["SYSTEM"] = "system";
    AlertType["BUSINESS"] = "business";
})(AlertType || (AlertType = {}));
var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["LOW"] = "low";
    AlertSeverity["MEDIUM"] = "medium";
    AlertSeverity["HIGH"] = "high";
    AlertSeverity["CRITICAL"] = "critical";
})(AlertSeverity || (AlertSeverity = {}));
// =============================================================================
// MONITORING SERVICE
// =============================================================================
var MonitoringService = /** @class */ (function () {
    function MonitoringService(config) {
        this.config = config;
        this.requestMetrics = [];
        this.systemMetrics = [];
        this.businessMetrics = [];
        this.traces = new Map();
        this.alerts = [];
        this.activeTraces = new Map();
        if (this.config.enabled) {
            this.startMetricsCollection();
        }
    }
    /**
     * Start metrics collection interval
     */
    MonitoringService.prototype.startMetricsCollection = function () {
        var _this = this;
        this.metricsInterval = setInterval(function () {
            _this.collectSystemMetrics();
            _this.collectBusinessMetrics();
            _this.checkAlerts();
            _this.cleanupOldMetrics();
        }, this.config.collection.interval);
    };
    /**
     * Record request metrics
     */
    MonitoringService.prototype.recordRequest = function (request, reply, startTime) {
        var _a;
        if (!this.config.enabled)
            return;
        var endTime = new Date();
        var responseTime = endTime.getTime() - startTime.getTime();
        var metrics = {
            id: (0, shared_1.generateSecureToken)(16),
            timestamp: endTime,
            method: request.method,
            url: this.sanitizeUrl(request.url),
            statusCode: reply.statusCode,
            responseTime: responseTime,
            userAgent: request.headers['user-agent'] || 'unknown',
            ipAddress: this.extractIP(request),
            userId: (_a = request.user) === null || _a === void 0 ? void 0 : _a.id,
            sessionId: request.sessionId,
            errorType: reply.statusCode >= 400 ? this.getErrorType(reply.statusCode) : undefined,
            size: {
                request: this.getRequestSize(request),
                response: this.getResponseSize(reply),
            },
        };
        this.requestMetrics.push(metrics);
        // Check for immediate alerts
        this.checkRequestAlert(metrics);
    };
    /**
     * Start a trace span
     */
    MonitoringService.prototype.startTrace = function (operationName, parentSpanId) {
        var traceId = parentSpanId ?
            this.findTraceIdBySpan(parentSpanId) || (0, shared_1.generateSecureToken)(16) :
            (0, shared_1.generateSecureToken)(16);
        var span = {
            traceId: traceId,
            spanId: (0, shared_1.generateSecureToken)(8),
            parentSpanId: parentSpanId,
            operationName: operationName,
            startTime: new Date(),
            tags: {},
            logs: [],
            status: 'pending',
        };
        this.activeTraces.set(span.spanId, span);
        if (!this.traces.has(traceId)) {
            this.traces.set(traceId, []);
        }
        this.traces.get(traceId).push(span);
        return span;
    };
    /**
     * Finish a trace span
     */
    MonitoringService.prototype.finishTrace = function (spanId, tags, error) {
        var span = this.activeTraces.get(spanId);
        if (!span)
            return;
        span.endTime = new Date();
        span.duration = span.endTime.getTime() - span.startTime.getTime();
        span.status = error ? 'error' : 'success';
        if (tags) {
            span.tags = __assign(__assign({}, span.tags), tags);
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
    };
    /**
     * Add log to trace span
     */
    MonitoringService.prototype.addTraceLog = function (spanId, level, message, fields) {
        var span = this.activeTraces.get(spanId);
        if (!span)
            return;
        span.logs.push({
            timestamp: new Date(),
            level: level,
            message: message,
            fields: fields,
        });
    };
    /**
     * Collect system metrics
     */
    MonitoringService.prototype.collectSystemMetrics = function () {
        if (!this.config.system.trackCPU && !this.config.system.trackMemory)
            return;
        var metrics = {
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
    };
    /**
     * Collect business metrics
     */
    MonitoringService.prototype.collectBusinessMetrics = function () {
        if (!this.config.business.trackUsers && !this.config.business.trackRequests)
            return;
        var now = new Date();
        var oneHour = 60 * 60 * 1000;
        var recentRequests = this.requestMetrics.filter(function (m) { return now.getTime() - m.timestamp.getTime() < oneHour; });
        var metrics = {
            timestamp: now,
            users: {
                active: this.countActiveUsers(oneHour),
                registered: 0, // Would need database integration
                authenticated: this.countAuthenticatedUsers(oneHour),
            },
            requests: {
                total: recentRequests.length,
                successful: recentRequests.filter(function (r) { return r.statusCode < 400; }).length,
                failed: recentRequests.filter(function (r) { return r.statusCode >= 400; }).length,
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
    };
    /**
     * Check for alerts
     */
    MonitoringService.prototype.checkAlerts = function () {
        if (!this.config.alerting.enabled || !this.lastSystemMetrics)
            return;
        var thresholds = this.config.alerting.thresholds;
        // Check error rate
        var recentRequests = this.getRecentRequests(5 * 60 * 1000); // 5 minutes
        if (recentRequests.length > 0) {
            var errorRate = recentRequests.filter(function (r) { return r.statusCode >= 400; }).length / recentRequests.length;
            if (errorRate > thresholds.errorRate) {
                this.createAlert(AlertType.ERROR, AlertSeverity.HIGH, 'High Error Rate', "Error rate is ".concat((errorRate * 100).toFixed(2), "%"), 'error_rate', errorRate, thresholds.errorRate);
            }
        }
        // Check response time
        if (recentRequests.length > 0) {
            var avgResponseTime = recentRequests.reduce(function (sum, r) { return sum + r.responseTime; }, 0) / recentRequests.length;
            if (avgResponseTime > thresholds.responseTime) {
                this.createAlert(AlertType.PERFORMANCE, AlertSeverity.MEDIUM, 'Slow Response Time', "Average response time is ".concat(avgResponseTime.toFixed(2), "ms"), 'response_time', avgResponseTime, thresholds.responseTime);
            }
        }
        // Check memory usage
        if (this.lastSystemMetrics.memory.usage > thresholds.memoryUsage) {
            this.createAlert(AlertType.SYSTEM, AlertSeverity.HIGH, 'High Memory Usage', "Memory usage is ".concat(this.lastSystemMetrics.memory.usage.toFixed(2), "%"), 'memory_usage', this.lastSystemMetrics.memory.usage, thresholds.memoryUsage);
        }
        // Check CPU usage
        if (this.lastSystemMetrics.cpu.usage > thresholds.cpuUsage) {
            this.createAlert(AlertType.SYSTEM, AlertSeverity.HIGH, 'High CPU Usage', "CPU usage is ".concat(this.lastSystemMetrics.cpu.usage.toFixed(2), "%"), 'cpu_usage', this.lastSystemMetrics.cpu.usage, thresholds.cpuUsage);
        }
    };
    /**
     * Create an alert
     */
    MonitoringService.prototype.createAlert = function (type, severity, title, description, metric, value, threshold) {
        var alert = {
            id: (0, shared_1.generateSecureToken)(16),
            type: type,
            severity: severity,
            title: title,
            description: description,
            timestamp: new Date(),
            metric: metric,
            value: value,
            threshold: threshold,
            resolved: false,
        };
        this.alerts.push(alert);
        // Send webhook notification if configured
        if (this.config.alerting.webhookUrl) {
            this.sendAlertWebhook(alert);
        }
        console.error("\uD83D\uDEA8 ALERT [".concat(severity.toUpperCase(), "]: ").concat(title, " - ").concat(description));
    };
    /**
     * Get current metrics summary
     */
    MonitoringService.prototype.getMetricsSummary = function () {
        var recentRequests = this.getRecentRequests(60 * 60 * 1000); // 1 hour
        var activeAlerts = this.alerts.filter(function (a) { return !a.resolved; });
        return {
            requests: {
                total: recentRequests.length,
                successful: recentRequests.filter(function (r) { return r.statusCode < 400; }).length,
                failed: recentRequests.filter(function (r) { return r.statusCode >= 400; }).length,
                averageResponseTime: recentRequests.length > 0 ?
                    recentRequests.reduce(function (sum, r) { return sum + r.responseTime; }, 0) / recentRequests.length : 0,
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
                critical: activeAlerts.filter(function (a) { return a.severity === AlertSeverity.CRITICAL; }).length,
                high: activeAlerts.filter(function (a) { return a.severity === AlertSeverity.HIGH; }).length,
                recent: activeAlerts.slice(-10),
            },
        };
    };
    /**
     * Get detailed metrics for specific time range
     */
    MonitoringService.prototype.getDetailedMetrics = function (timeRange) {
        if (timeRange === void 0) { timeRange = 60 * 60 * 1000; }
        var cutoff = new Date(Date.now() - timeRange);
        return {
            requests: this.requestMetrics.filter(function (m) { return m.timestamp > cutoff; }),
            system: this.systemMetrics.filter(function (m) { return m.timestamp > cutoff; }),
            business: this.businessMetrics.filter(function (m) { return m.timestamp > cutoff; }),
            traces: Array.from(this.traces.entries())
                .filter(function (_a) {
                var _ = _a[0], spans = _a[1];
                return spans.some(function (s) { return s.startTime > cutoff; });
            })
                .map(function (_a) {
                var traceId = _a[0], spans = _a[1];
                return ({ traceId: traceId, spans: spans });
            }),
        };
    };
    /**
     * Utility methods
     */
    MonitoringService.prototype.sanitizeUrl = function (url) {
        return url.split('?')[0]; // Remove query parameters for privacy
    };
    MonitoringService.prototype.extractIP = function (request) {
        var _a;
        var xForwardedFor = request.headers['x-forwarded-for'];
        var xRealIP = request.headers['x-real-ip'];
        return ((_a = xForwardedFor === null || xForwardedFor === void 0 ? void 0 : xForwardedFor.split(',')[0]) === null || _a === void 0 ? void 0 : _a.trim()) || xRealIP || request.ip || 'unknown';
    };
    MonitoringService.prototype.getRequestSize = function (request) {
        return parseInt(request.headers['content-length']) || 0;
    };
    MonitoringService.prototype.getResponseSize = function (reply) {
        return parseInt(reply.getHeader('content-length')) || 0;
    };
    MonitoringService.prototype.getErrorType = function (statusCode) {
        if (statusCode >= 400 && statusCode < 500)
            return 'client_error';
        if (statusCode >= 500)
            return 'server_error';
        return 'unknown';
    };
    MonitoringService.prototype.getCPUUsage = function () {
        // Simplified CPU usage calculation
        var usage = process.cpuUsage();
        return (usage.user + usage.system) / 1000000 * 100; // Convert to percentage
    };
    MonitoringService.prototype.getMemoryUsagePercent = function () {
        var total = require('os').totalmem();
        var free = require('os').freemem();
        return ((total - free) / total) * 100;
    };
    MonitoringService.prototype.getActiveConnections = function () {
        // Placeholder - would need proper implementation
        return this.requestMetrics.filter(function (m) { return Date.now() - m.timestamp.getTime() < 5000; }).length;
    };
    MonitoringService.prototype.getRecentRequests = function (timeRange) {
        var cutoff = new Date(Date.now() - timeRange);
        return this.requestMetrics.filter(function (m) { return m.timestamp > cutoff; });
    };
    MonitoringService.prototype.countActiveUsers = function (timeRange) {
        var cutoff = new Date(Date.now() - timeRange);
        var recentRequests = this.requestMetrics.filter(function (m) { return m.timestamp > cutoff && m.userId; });
        return new Set(recentRequests.map(function (r) { return r.userId; })).size;
    };
    MonitoringService.prototype.countAuthenticatedUsers = function (timeRange) {
        return this.countActiveUsers(timeRange); // Same as active for now
    };
    MonitoringService.prototype.countSecurityEvents = function (timeRange) {
        var cutoff = new Date(Date.now() - timeRange);
        return this.requestMetrics.filter(function (m) { return m.timestamp > cutoff && (m.statusCode === 401 || m.statusCode === 403); }).length;
    };
    MonitoringService.prototype.countFailedLogins = function (timeRange) {
        var cutoff = new Date(Date.now() - timeRange);
        return this.requestMetrics.filter(function (m) { return m.timestamp > cutoff && m.url.includes('/auth/login') && m.statusCode === 401; }).length;
    };
    MonitoringService.prototype.findTraceIdBySpan = function (spanId) {
        for (var _i = 0, _a = this.traces.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], traceId = _b[0], spans = _b[1];
            if (spans.some(function (s) { return s.spanId === spanId; })) {
                return traceId;
            }
        }
        return undefined;
    };
    MonitoringService.prototype.checkRequestAlert = function (metrics) {
        // Check for immediate response time alert
        if (metrics.responseTime > this.config.alerting.thresholds.responseTime * 2) {
            this.createAlert(AlertType.PERFORMANCE, AlertSeverity.HIGH, 'Slow Request', "Request ".concat(metrics.url, " took ").concat(metrics.responseTime, "ms"), 'single_request_time', metrics.responseTime, this.config.alerting.thresholds.responseTime);
        }
    };
    MonitoringService.prototype.sendAlertWebhook = function (alert) {
        // Placeholder for webhook implementation
        console.log("Sending webhook for alert: ".concat(alert.title));
    };
    MonitoringService.prototype.cleanupOldMetrics = function () {
        var retention = this.config.collection.retention;
        var cutoff = new Date(Date.now() - retention);
        this.requestMetrics = this.requestMetrics.filter(function (m) { return m.timestamp > cutoff; });
        this.systemMetrics = this.systemMetrics.filter(function (m) { return m.timestamp > cutoff; });
        this.businessMetrics = this.businessMetrics.filter(function (m) { return m.timestamp > cutoff; });
        // Clean up old traces
        for (var _i = 0, _a = this.traces.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], traceId = _b[0], spans = _b[1];
            var filteredSpans = spans.filter(function (s) { return s.startTime > cutoff; });
            if (filteredSpans.length === 0) {
                this.traces.delete(traceId);
            }
            else {
                this.traces.set(traceId, filteredSpans);
            }
        }
    };
    /**
     * Shutdown monitoring service
     */
    MonitoringService.prototype.shutdown = function () {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
    };
    return MonitoringService;
}());
exports.MonitoringService = MonitoringService;
// =============================================================================
// FASTIFY PLUGIN
// =============================================================================
function monitoringPlugin(fastify) {
    return __awaiter(this, void 0, void 0, function () {
        var config, monitoringService;
        var _this = this;
        return __generator(this, function (_a) {
            config = {
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
            monitoringService = new MonitoringService(config);
            // Register monitoring service
            fastify.decorate('monitoring', monitoringService);
            // Request tracking hooks
            if (config.enabled) {
                fastify.addHook('onRequest', function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        request.startTime = new Date();
                        return [2 /*return*/];
                    });
                }); });
                fastify.addHook('onResponse', function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                    var startTime;
                    return __generator(this, function (_a) {
                        startTime = request.startTime;
                        if (startTime) {
                            monitoringService.recordRequest(request, reply, startTime);
                        }
                        return [2 /*return*/];
                    });
                }); });
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
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var timeRange;
                var _a;
                return __generator(this, function (_b) {
                    timeRange = parseInt((_a = request.query) === null || _a === void 0 ? void 0 : _a['timeRange']) || 60 * 60 * 1000;
                    return [2 /*return*/, reply.send({
                            timestamp: new Date().toISOString(),
                            summary: monitoringService.getMetricsSummary(),
                            detailed: monitoringService.getDetailedMetrics(timeRange),
                        })];
                });
            }); });
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
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var summary, status;
                return __generator(this, function (_a) {
                    summary = monitoringService.getMetricsSummary();
                    status = 'healthy';
                    if (summary.alerts.critical > 0) {
                        status = 'critical';
                    }
                    else if (summary.alerts.high > 0) {
                        status = 'degraded';
                    }
                    return [2 /*return*/, reply.code(status === 'healthy' ? 200 : 503).send({
                            status: status,
                            timestamp: new Date().toISOString(),
                            monitoring: {
                                enabled: config.enabled,
                                metricsCollected: true,
                                alertingEnabled: config.alerting.enabled,
                                summary: summary,
                            },
                        })];
                });
            }); });
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
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var timeRange, detailed;
                var _a;
                return __generator(this, function (_b) {
                    timeRange = parseInt((_a = request.query) === null || _a === void 0 ? void 0 : _a['timeRange']) || 60 * 60 * 1000;
                    detailed = monitoringService.getDetailedMetrics(timeRange);
                    return [2 /*return*/, reply.send({
                            traces: detailed.traces,
                            timestamp: new Date().toISOString(),
                        })];
                });
            }); });
            // Graceful shutdown
            fastify.addHook('onClose', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    monitoringService.shutdown();
                    return [2 /*return*/];
                });
            }); });
            fastify.log.info('📊 Comprehensive Monitoring & Observability Plugin initialized');
            return [2 /*return*/];
        });
    });
}
// =============================================================================
// EXPORTS
// =============================================================================
exports.default = (0, fastify_plugin_1.default)(monitoringPlugin, {
    name: 'monitoring',
    fastify: '4.x',
});
