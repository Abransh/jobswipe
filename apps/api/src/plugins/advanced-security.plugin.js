"use strict";
/**
 * @fileoverview Advanced Security Plugin for Production Fastify API
 * @description Enterprise-grade security with CSRF, CSP, attack detection, and audit logging
 * @version 1.0.0
 * @author JobSwipe Team
 * @security CRITICAL - Production security implementation
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
exports.AdvancedSecurityService = void 0;
var fastify_plugin_1 = require("fastify-plugin");
var crypto_1 = require("crypto");
var shared_1 = require("@jobswipe/shared");
var SecurityEventType;
(function (SecurityEventType) {
    SecurityEventType["AUTHENTICATION_FAILURE"] = "auth_failure";
    SecurityEventType["AUTHENTICATION_SUCCESS"] = "auth_success";
    SecurityEventType["AUTHORIZATION_FAILURE"] = "authz_failure";
    SecurityEventType["RATE_LIMIT_EXCEEDED"] = "rate_limit_exceeded";
    SecurityEventType["SUSPICIOUS_ACTIVITY"] = "suspicious_activity";
    SecurityEventType["CSRF_ATTACK"] = "csrf_attack";
    SecurityEventType["XSS_ATTEMPT"] = "xss_attempt";
    SecurityEventType["SQL_INJECTION_ATTEMPT"] = "sql_injection_attempt";
    SecurityEventType["INVALID_TOKEN"] = "invalid_token";
    SecurityEventType["SESSION_HIJACK"] = "session_hijack";
    SecurityEventType["BRUTE_FORCE"] = "brute_force";
    SecurityEventType["ACCOUNT_LOCKOUT"] = "account_lockout";
    SecurityEventType["PRIVILEGE_ESCALATION"] = "privilege_escalation";
    SecurityEventType["DATA_EXFILTRATION"] = "data_exfiltration";
})(SecurityEventType || (SecurityEventType = {}));
var SecuritySeverity;
(function (SecuritySeverity) {
    SecuritySeverity["LOW"] = "low";
    SecuritySeverity["MEDIUM"] = "medium";
    SecuritySeverity["HIGH"] = "high";
    SecuritySeverity["CRITICAL"] = "critical";
})(SecuritySeverity || (SecuritySeverity = {}));
// =============================================================================
// ATTACK DETECTION PATTERNS
// =============================================================================
var ATTACK_PATTERNS = {
    XSS: [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /onload\s*=/gi,
        /onerror\s*=/gi,
        /onclick\s*=/gi,
        /<iframe/gi,
        /<object/gi,
        /<embed/gi,
        /<link/gi,
        /<meta/gi,
    ],
    SQL_INJECTION: [
        /(\b(select|insert|update|delete|drop|create|alter|exec|execute|union|declare|cast)\b)/gi,
        /(union\s+select)/gi,
        /(select.*from)/gi,
        /(insert\s+into)/gi,
        /(update.*set)/gi,
        /(delete\s+from)/gi,
        /(drop\s+table)/gi,
        /('|"|\;|\||\*|%|<|>)/g,
        /(or\s+1\s*=\s*1)/gi,
        /(and\s+1\s*=\s*1)/gi,
    ],
    PATH_TRAVERSAL: [
        /\.\.\/|\.\.\\|\.\.\%2f|\.\.\%5c/gi,
        /%2e%2e%2f|%2e%2e%5c/gi,
        /\/etc\/passwd/gi,
        /\/windows\/system32/gi,
        /\/proc\/self\/environ/gi,
    ],
    COMMAND_INJECTION: [
        /(\||;|&|`|\$\(|\$\{)/g,
        /(cat\s|ls\s|pwd|whoami|id\s|uname)/gi,
        /(rm\s|mv\s|cp\s|chmod\s|chown\s)/gi,
        /(wget\s|curl\s|nc\s|netcat)/gi,
    ],
};
// =============================================================================
// ADVANCED SECURITY SERVICE
// =============================================================================
var AdvancedSecurityService = /** @class */ (function () {
    function AdvancedSecurityService(config) {
        var _this = this;
        this.config = config;
        this.securityEvents = [];
        this.csrfTokens = new Map();
        this.ipAttempts = new Map();
        this.rateLimitStore = new Map();
        this.metrics = {
            securityEvents: new Map(),
            blockedRequests: 0,
            csrfTokensGenerated: 0,
            csrfTokensValidated: 0,
            csrfFailures: 0,
            lastSecurityEvent: null,
            attacksBlocked: 0,
            suspiciousIPs: new Set(),
        };
        // Initialize security event counters
        Object.values(SecurityEventType).forEach(function (type) {
            _this.metrics.securityEvents.set(type, 0);
        });
        this.startCleanupJob();
    }
    /**
     * Generate CSRF token
     */
    AdvancedSecurityService.prototype.generateCSRFToken = function (sessionId) {
        if (!this.config.csrf.enabled) {
            throw new Error('CSRF protection is disabled');
        }
        var tokenId = (0, shared_1.generateSecureToken)(16);
        var token = crypto_1.default
            .createHmac('sha256', this.config.csrf.secretKey)
            .update("".concat(tokenId, ":").concat(sessionId || 'anonymous', ":").concat(Date.now()))
            .digest('hex');
        var fullToken = "".concat(tokenId, ":").concat(token);
        var expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
        this.csrfTokens.set(fullToken, {
            token: fullToken,
            expires: expires,
            used: false,
        });
        this.metrics.csrfTokensGenerated++;
        return {
            token: fullToken,
            cookieValue: fullToken,
        };
    };
    /**
     * Validate CSRF token
     */
    AdvancedSecurityService.prototype.validateCSRFToken = function (token, sessionId) {
        if (!this.config.csrf.enabled) {
            return true;
        }
        if (!token) {
            this.metrics.csrfFailures++;
            return false;
        }
        var tokenData = this.csrfTokens.get(token);
        if (!tokenData) {
            this.metrics.csrfFailures++;
            return false;
        }
        if (tokenData.used || new Date() > tokenData.expires) {
            this.csrfTokens.delete(token);
            this.metrics.csrfFailures++;
            return false;
        }
        // Mark token as used (one-time use)
        tokenData.used = true;
        this.metrics.csrfTokensValidated++;
        return true;
    };
    /**
     * Detect attacks in request data
     */
    AdvancedSecurityService.prototype.detectAttacks = function (request) {
        if (!this.config.attackDetection.enabled) {
            return null;
        }
        var testData = [
            JSON.stringify(request.body || {}),
            JSON.stringify(request.query || {}),
            JSON.stringify(request.params || {}),
            request.url,
            request.headers['user-agent'] || '',
        ].join(' ');
        // XSS Detection
        if (this.config.attackDetection.xssDetection) {
            for (var _i = 0, _a = ATTACK_PATTERNS.XSS; _i < _a.length; _i++) {
                var pattern = _a[_i];
                if (pattern.test(testData)) {
                    return SecurityEventType.XSS_ATTEMPT;
                }
            }
        }
        // SQL Injection Detection
        if (this.config.attackDetection.sqlInjectionDetection) {
            for (var _b = 0, _c = ATTACK_PATTERNS.SQL_INJECTION; _b < _c.length; _b++) {
                var pattern = _c[_b];
                if (pattern.test(testData)) {
                    return SecurityEventType.SQL_INJECTION_ATTEMPT;
                }
            }
        }
        // Path Traversal Detection
        if (this.config.attackDetection.pathTraversalDetection) {
            for (var _d = 0, _e = ATTACK_PATTERNS.PATH_TRAVERSAL; _d < _e.length; _d++) {
                var pattern = _e[_d];
                if (pattern.test(testData)) {
                    return SecurityEventType.SUSPICIOUS_ACTIVITY;
                }
            }
        }
        // Command Injection Detection
        if (this.config.attackDetection.commandInjectionDetection) {
            for (var _f = 0, _g = ATTACK_PATTERNS.COMMAND_INJECTION; _f < _g.length; _f++) {
                var pattern = _g[_f];
                if (pattern.test(testData)) {
                    return SecurityEventType.SUSPICIOUS_ACTIVITY;
                }
            }
        }
        return null;
    };
    /**
     * Check rate limiting
     */
    AdvancedSecurityService.prototype.checkRateLimit = function (key) {
        if (!this.config.rateLimiting.enabled) {
            return {
                allowed: true,
                remaining: this.config.rateLimiting.maxRequests,
                resetTime: new Date(),
            };
        }
        var now = new Date();
        var entry = this.rateLimitStore.get(key);
        var count = 1;
        var resetTime = new Date(now.getTime() + this.config.rateLimiting.windowMs);
        if (entry) {
            if (now <= entry.resetTime) {
                count = entry.count + 1;
                resetTime = entry.resetTime;
            }
            else {
                count = 1;
                resetTime = new Date(now.getTime() + this.config.rateLimiting.windowMs);
            }
        }
        this.rateLimitStore.set(key, { count: count, resetTime: resetTime });
        var allowed = count <= this.config.rateLimiting.maxRequests;
        var remaining = Math.max(0, this.config.rateLimiting.maxRequests - count);
        return { allowed: allowed, remaining: remaining, resetTime: resetTime };
    };
    /**
     * Log security event
     */
    AdvancedSecurityService.prototype.logSecurityEvent = function (event) {
        if (!this.config.auditLogging.enabled) {
            return;
        }
        var fullEvent = __assign(__assign({}, event), { timestamp: new Date() });
        this.securityEvents.push(fullEvent);
        this.metrics.securityEvents.set(event.type, (this.metrics.securityEvents.get(event.type) || 0) + 1);
        this.metrics.lastSecurityEvent = fullEvent.timestamp;
        if (event.blocked) {
            this.metrics.blockedRequests++;
            if (event.type !== SecurityEventType.RATE_LIMIT_EXCEEDED) {
                this.metrics.attacksBlocked++;
            }
        }
        if (event.severity === SecuritySeverity.HIGH || event.severity === SecuritySeverity.CRITICAL) {
            this.metrics.suspiciousIPs.add(event.ipAddress);
        }
        // Keep only last 1000 events in memory
        if (this.securityEvents.length > 1000) {
            this.securityEvents.shift();
        }
        // Log to external system (replace console.log with proper logger in production)
    };
    /**
     * Generate Content Security Policy header
     */
    AdvancedSecurityService.prototype.generateCSPHeader = function () {
        if (!this.config.contentSecurityPolicy.enabled) {
            return '';
        }
        var directives = Object.entries(this.config.contentSecurityPolicy.directives)
            .map(function (_a) {
            var key = _a[0], values = _a[1];
            return "".concat(key, " ").concat(values.join(' '));
        })
            .join('; ');
        if (this.config.contentSecurityPolicy.reportUri) {
            return "".concat(directives, "; report-uri ").concat(this.config.contentSecurityPolicy.reportUri);
        }
        return directives;
    };
    /**
     * Get security metrics
     */
    AdvancedSecurityService.prototype.getMetrics = function () {
        return __assign(__assign({}, this.metrics), { securityEventsArray: this.securityEvents.slice(-100) });
    };
    /**
     * Get security health status
     */
    AdvancedSecurityService.prototype.getHealthStatus = function () {
        var recentEvents = this.securityEvents.filter(function (event) { return event.timestamp > new Date(Date.now() - 60 * 60 * 1000); } // Last hour
        );
        var criticalEvents = recentEvents.filter(function (event) { return event.severity === SecuritySeverity.CRITICAL; }).length;
        var highSeverityEvents = recentEvents.filter(function (event) { return event.severity === SecuritySeverity.HIGH; }).length;
        var status = 'healthy';
        if (criticalEvents > 0) {
            status = 'critical';
        }
        else if (highSeverityEvents > 10 || this.metrics.suspiciousIPs.size > 20) {
            status = 'warning';
        }
        return {
            status: status,
            details: {
                recentEvents: recentEvents.length,
                criticalEvents: criticalEvents,
                highSeverityEvents: highSeverityEvents,
                suspiciousIPs: this.metrics.suspiciousIPs.size,
                blockedRequests: this.metrics.blockedRequests,
                attacksBlocked: this.metrics.attacksBlocked,
                csrfTokensGenerated: this.metrics.csrfTokensGenerated,
                csrfFailures: this.metrics.csrfFailures,
                lastSecurityEvent: this.metrics.lastSecurityEvent,
            },
        };
    };
    /**
     * Cleanup expired tokens and old data
     */
    AdvancedSecurityService.prototype.startCleanupJob = function () {
        var _this = this;
        setInterval(function () {
            var now = new Date();
            // Cleanup expired CSRF tokens
            for (var _i = 0, _a = _this.csrfTokens.entries(); _i < _a.length; _i++) {
                var _b = _a[_i], token = _b[0], data = _b[1];
                if (now > data.expires) {
                    _this.csrfTokens.delete(token);
                }
            }
            // Cleanup old rate limit entries
            for (var _c = 0, _d = _this.rateLimitStore.entries(); _c < _d.length; _c++) {
                var _e = _d[_c], key = _e[0], entry = _e[1];
                if (now > entry.resetTime) {
                    _this.rateLimitStore.delete(key);
                }
            }
            // Cleanup old IP attempt records
            for (var _f = 0, _g = _this.ipAttempts.entries(); _f < _g.length; _f++) {
                var _h = _g[_f], ip = _h[0], data = _h[1];
                if (now.getTime() - data.lastAttempt.getTime() > 24 * 60 * 60 * 1000) { // 24 hours
                    _this.ipAttempts.delete(ip);
                }
            }
        }, 5 * 60 * 1000); // Every 5 minutes
    };
    return AdvancedSecurityService;
}());
exports.AdvancedSecurityService = AdvancedSecurityService;
// =============================================================================
// FASTIFY PLUGIN
// =============================================================================
function advancedSecurityPlugin(fastify) {
    return __awaiter(this, void 0, void 0, function () {
        var config, securityService;
        var _this = this;
        return __generator(this, function (_a) {
            config = {
                csrf: {
                    enabled: process.env.CSRF_ENABLED !== 'false',
                    secretKey: process.env.CSRF_SECRET || crypto_1.default.randomBytes(32).toString('hex'),
                    tokenLength: 32,
                    cookieName: '__csrf',
                    headerName: 'x-csrf-token',
                    safeMethods: ['GET', 'HEAD', 'OPTIONS'],
                    sameOriginOnly: true,
                },
                contentSecurityPolicy: {
                    enabled: process.env.CSP_ENABLED !== 'false',
                    reportOnly: process.env.CSP_REPORT_ONLY === 'true',
                    reportUri: process.env.CSP_REPORT_URI,
                    directives: {
                        'default-src': ["'self'"],
                        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                        'style-src': ["'self'", "'unsafe-inline'"],
                        'img-src': ["'self'", 'data:', 'https:'],
                        'font-src': ["'self'"],
                        'connect-src': ["'self'"],
                        'media-src': ["'self'"],
                        'object-src': ["'none'"],
                        'child-src': ["'none'"],
                        'frame-src': ["'none'"],
                        'worker-src': ["'none'"],
                        'frame-ancestors': ["'none'"],
                        'form-action': ["'self'"],
                        'upgrade-insecure-requests': [],
                    },
                },
                rateLimiting: {
                    enabled: process.env.RATE_LIMITING_ENABLED !== 'false',
                    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
                    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
                    skipSuccessfulRequests: false,
                    standardHeaders: true,
                    legacyHeaders: false,
                },
                attackDetection: {
                    enabled: process.env.ATTACK_DETECTION_ENABLED !== 'false',
                    xssDetection: process.env.XSS_DETECTION_ENABLED !== 'false',
                    sqlInjectionDetection: process.env.SQL_INJECTION_DETECTION_ENABLED !== 'false',
                    pathTraversalDetection: process.env.PATH_TRAVERSAL_DETECTION_ENABLED !== 'false',
                    commandInjectionDetection: process.env.COMMAND_INJECTION_DETECTION_ENABLED !== 'false',
                },
                auditLogging: {
                    enabled: process.env.AUDIT_LOGGING_ENABLED !== 'false',
                    logSuccessfulAuth: process.env.LOG_SUCCESSFUL_AUTH !== 'false',
                    logFailedAuth: process.env.LOG_FAILED_AUTH !== 'false',
                    logRateLimits: process.env.LOG_RATE_LIMITS !== 'false',
                    logSuspiciousActivity: process.env.LOG_SUSPICIOUS_ACTIVITY !== 'false',
                },
            };
            securityService = new AdvancedSecurityService(config);
            // Register security service
            fastify.decorate('advancedSecurity', securityService);
            // Pre-handler hook for all requests
            fastify.addHook('preHandler', function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var requestId, ipAddress, userAgent, attackType, rateLimitKey, rateLimit, token, cspHeader, headerName;
                return __generator(this, function (_a) {
                    requestId = (0, shared_1.generateSecureToken)(16);
                    ipAddress = (0, shared_1.extractIpFromHeaders)(request.headers);
                    userAgent = request.headers['user-agent'] || '';
                    // Add request ID to request
                    request.requestId = requestId;
                    attackType = securityService.detectAttacks(request);
                    if (attackType) {
                        securityService.logSecurityEvent({
                            type: attackType,
                            severity: SecuritySeverity.HIGH,
                            ipAddress: ipAddress,
                            userAgent: userAgent,
                            details: {
                                method: request.method,
                                url: request.url,
                                body: request.body,
                                query: request.query,
                                params: request.params,
                            },
                            blocked: true,
                            requestId: requestId,
                        });
                        return [2 /*return*/, reply.code(403).send({
                                error: 'Security violation detected',
                                code: 'SECURITY_VIOLATION',
                                requestId: requestId,
                                timestamp: new Date().toISOString(),
                            })];
                    }
                    rateLimitKey = "".concat(ipAddress, ":").concat(request.method, ":").concat(request.routerPath || request.url);
                    rateLimit = securityService.checkRateLimit(rateLimitKey);
                    if (!rateLimit.allowed) {
                        securityService.logSecurityEvent({
                            type: SecurityEventType.RATE_LIMIT_EXCEEDED,
                            severity: SecuritySeverity.MEDIUM,
                            ipAddress: ipAddress,
                            userAgent: userAgent,
                            details: {
                                method: request.method,
                                url: request.url,
                                rateLimitKey: rateLimitKey,
                            },
                            blocked: true,
                            requestId: requestId,
                        });
                        reply.headers({
                            'X-RateLimit-Limit': config.rateLimiting.maxRequests.toString(),
                            'X-RateLimit-Remaining': '0',
                            'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime.getTime() / 1000).toString(),
                            'Retry-After': Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 1000).toString(),
                        });
                        return [2 /*return*/, reply.code(429).send({
                                error: 'Too many requests',
                                code: 'RATE_LIMIT_EXCEEDED',
                                requestId: requestId,
                                timestamp: new Date().toISOString(),
                                retryAfter: Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 1000),
                            })];
                    }
                    // Add rate limit headers
                    if (config.rateLimiting.standardHeaders) {
                        reply.headers({
                            'X-RateLimit-Limit': config.rateLimiting.maxRequests.toString(),
                            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                            'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime.getTime() / 1000).toString(),
                        });
                    }
                    // CSRF Protection for non-safe methods
                    if (!config.csrf.safeMethods.includes(request.method)) {
                        token = request.headers[config.csrf.headerName];
                        if (!securityService.validateCSRFToken(token)) {
                            securityService.logSecurityEvent({
                                type: SecurityEventType.CSRF_ATTACK,
                                severity: SecuritySeverity.HIGH,
                                ipAddress: ipAddress,
                                userAgent: userAgent,
                                details: {
                                    method: request.method,
                                    url: request.url,
                                    hasToken: !!token,
                                },
                                blocked: true,
                                requestId: requestId,
                            });
                            return [2 /*return*/, reply.code(403).send({
                                    error: 'CSRF token validation failed',
                                    code: 'CSRF_INVALID',
                                    requestId: requestId,
                                    timestamp: new Date().toISOString(),
                                })];
                        }
                    }
                    cspHeader = securityService.generateCSPHeader();
                    if (cspHeader) {
                        headerName = config.contentSecurityPolicy.reportOnly ?
                            'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
                        reply.header(headerName, cspHeader);
                    }
                    // Additional security headers
                    reply.headers({
                        'X-Content-Type-Options': 'nosniff',
                        'X-Frame-Options': 'DENY',
                        'X-XSS-Protection': '1; mode=block',
                        'Referrer-Policy': 'strict-origin-when-cross-origin',
                        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
                        'X-Request-ID': requestId,
                    });
                    if (process.env.NODE_ENV === 'production') {
                        reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
                    }
                    return [2 /*return*/];
                });
            }); });
            // CSRF token generation endpoint
            fastify.get('/security/csrf-token', {
                schema: {
                    summary: 'Generate CSRF token',
                    tags: ['Security'],
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                token: { type: 'string' },
                                cookieName: { type: 'string' },
                                headerName: { type: 'string' },
                            },
                        },
                    },
                },
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var sessionId, _a, token, cookieValue;
                return __generator(this, function (_b) {
                    try {
                        sessionId = request.sessionId;
                        _a = securityService.generateCSRFToken(sessionId), token = _a.token, cookieValue = _a.cookieValue;
                        // Return CSRF token in response (client will need to store and send in headers)
                        // In production, you might want to use HTTP-only cookies with @fastify/cookie plugin
                        return [2 /*return*/, reply.send({
                                token: token,
                                cookieName: config.csrf.cookieName,
                                headerName: config.csrf.headerName,
                            })];
                    }
                    catch (error) {
                        return [2 /*return*/, reply.code(500).send({
                                error: 'Failed to generate CSRF token',
                                code: 'CSRF_GENERATION_FAILED',
                            })];
                    }
                    return [2 /*return*/];
                });
            }); });
            // Security metrics endpoint
            fastify.get('/security/metrics', {
                schema: {
                    summary: 'Get security metrics',
                    tags: ['Security'],
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                metrics: { type: 'object' },
                                timestamp: { type: 'string' },
                            },
                        },
                    },
                },
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var metrics;
                return __generator(this, function (_a) {
                    metrics = securityService.getMetrics();
                    return [2 /*return*/, reply.send({
                            metrics: metrics,
                            timestamp: new Date().toISOString(),
                        })];
                });
            }); });
            // Security health endpoint
            fastify.get('/security/health', {
                schema: {
                    summary: 'Get security health status',
                    tags: ['Security'],
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                status: { type: 'string' },
                                details: { type: 'object' },
                                timestamp: { type: 'string' },
                            },
                        },
                    },
                },
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var health, statusCode;
                return __generator(this, function (_a) {
                    health = securityService.getHealthStatus();
                    statusCode = health.status === 'healthy' ? 200 : health.status === 'warning' ? 200 : 503;
                    return [2 /*return*/, reply.code(statusCode).send(__assign(__assign({}, health), { timestamp: new Date().toISOString() }))];
                });
            }); });
            fastify.log.info('🛡️  Advanced Security Plugin initialized with enterprise features');
            return [2 /*return*/];
        });
    });
}
// =============================================================================
// EXPORTS
// =============================================================================
exports.default = (0, fastify_plugin_1.default)(advancedSecurityPlugin, {
    name: 'advanced-security',
    fastify: '4.x',
});
