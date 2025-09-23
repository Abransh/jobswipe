"use strict";
/**
 * @fileoverview Advanced Security Plugin for Production Fastify API (Minimal Implementation)
 * @description Basic security plugin as placeholder for enterprise features
 * @version 1.0.0
 * @author JobSwipe Team
 */
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
var fastify_plugin_1 = require("fastify-plugin");
function advancedSecurityPlugin(fastify, options) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            fastify.log.info('Advanced Security Plugin initialized (minimal mode)');
            // Placeholder for advanced security features
            fastify.decorate('advancedSecurity', {
                getHealthStatus: function () { return ({ status: 'healthy', features: 'minimal' }); }
            });
            return [2 /*return*/];
        });
    });
}
exports.default = (0, fastify_plugin_1.default)(advancedSecurityPlugin, {
    name: 'advanced-security',
    fastify: '4.x',
});
// import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
// import fastifyPlugin from 'fastify-plugin';
// import crypto from 'crypto';
// import { 
//   extractIpFromHeaders,
//   generateSecureToken
// } from '@jobswipe/shared';
// // =============================================================================
// // INTERFACES & TYPES
// // =============================================================================
// interface SecurityEvent {
//   type: SecurityEventType;
//   severity: SecuritySeverity;
//   userId?: string;
//   ipAddress: string;
//   userAgent: string;
//   timestamp: Date;
//   details: Record<string, any>;
//   blocked: boolean;
//   requestId: string;
// }
// enum SecurityEventType {
//   AUTHENTICATION_FAILURE = 'auth_failure',
//   AUTHENTICATION_SUCCESS = 'auth_success',
//   AUTHORIZATION_FAILURE = 'authz_failure',
//   RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
//   SUSPICIOUS_ACTIVITY = 'suspicious_activity',
//   CSRF_ATTACK = 'csrf_attack',
//   XSS_ATTEMPT = 'xss_attempt',
//   SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
//   INVALID_TOKEN = 'invalid_token',
//   SESSION_HIJACK = 'session_hijack',
//   BRUTE_FORCE = 'brute_force',
//   ACCOUNT_LOCKOUT = 'account_lockout',
//   PRIVILEGE_ESCALATION = 'privilege_escalation',
//   DATA_EXFILTRATION = 'data_exfiltration',
// }
// enum SecuritySeverity {
//   LOW = 'low',
//   MEDIUM = 'medium',
//   HIGH = 'high',
//   CRITICAL = 'critical',
// }
// interface CSRFConfig {
//   enabled: boolean;
//   secretKey: string;
//   tokenLength: number;
//   cookieName: string;
//   headerName: string;
//   safeMethods: string[];
//   sameOriginOnly: boolean;
// }
// interface SecurityConfig {
//   csrf: CSRFConfig;
//   contentSecurityPolicy: {
//     enabled: boolean;
//     directives: Record<string, string[]>;
//     reportUri?: string;
//     reportOnly: boolean;
//   };
//   rateLimiting: {
//     enabled: boolean;
//     windowMs: number;
//     maxRequests: number;
//     skipSuccessfulRequests: boolean;
//     standardHeaders: boolean;
//     legacyHeaders: boolean;
//   };
//   attackDetection: {
//     enabled: boolean;
//     xssDetection: boolean;
//     sqlInjectionDetection: boolean;
//     pathTraversalDetection: boolean;
//     commandInjectionDetection: boolean;
//   };
//   auditLogging: {
//     enabled: boolean;
//     logSuccessfulAuth: boolean;
//     logFailedAuth: boolean;
//     logRateLimits: boolean;
//     logSuspiciousActivity: boolean;
//   };
// }
// interface SecurityMetrics {
//   securityEvents: Map<SecurityEventType, number>;
//   blockedRequests: number;
//   csrfTokensGenerated: number;
//   csrfTokensValidated: number;
//   csrfFailures: number;
//   lastSecurityEvent: Date | null;
//   attacksBlocked: number;
//   suspiciousIPs: Set<string>;
// }
// // =============================================================================
// // ATTACK DETECTION PATTERNS
// // =============================================================================
// const ATTACK_PATTERNS = {
//   XSS: [
//     /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
//     /javascript:/gi,
//     /vbscript:/gi,
//     /onload\s*=/gi,
//     /onerror\s*=/gi,
//     /onclick\s*=/gi,
//     /<iframe/gi,
//     /<object/gi,
//     /<embed/gi,
//     /<link/gi,
//     /<meta/gi,
//   ],
//   SQL_INJECTION: [
//     /(\b(select|insert|update|delete|drop|create|alter|exec|execute|union|declare|cast)\s+)/gi,
//     /(union\s+select)/gi,
//     /(select.*from)/gi,
//     /(insert\s+into)/gi,
//     /(update.*set)/gi,
//     /(delete\s+from)/gi,
//     /(drop\s+table)/gi,
//     /(;\s*(select|insert|update|delete|drop|create|alter))/gi,
//     /(or\s+1\s*=\s*1)/gi,
//     /(and\s+1\s*=\s*1)/gi,
//     /('.*;\s*select)/gi,
//     /('.*;\s*drop)/gi,
//   ],
//   PATH_TRAVERSAL: [
//     /\.\.\/|\.\.\\|\.\.\%2f|\.\.\%5c/gi,
//     /%2e%2e%2f|%2e%2e%5c/gi,
//     /\/etc\/passwd/gi,
//     /\/windows\/system32/gi,
//     /\/proc\/self\/environ/gi,
//   ],
//   COMMAND_INJECTION: [
//     /(\||;|&|`|\$\(|\$\{)/g,
//     /(cat\s|ls\s|pwd|whoami|id\s|uname)/gi,
//     /(rm\s|mv\s|cp\s|chmod\s|chown\s)/gi,
//     /(wget\s|curl\s|nc\s|netcat)/gi,
//   ],
// };
// // =============================================================================
// // ADVANCED SECURITY SERVICE
// // =============================================================================
// class AdvancedSecurityService {
//   private metrics: SecurityMetrics;
//   private securityEvents: SecurityEvent[] = [];
//   private csrfTokens: Map<string, { token: string; expires: Date; used: boolean }> = new Map();
//   private ipAttempts: Map<string, { count: number; lastAttempt: Date; blocked: boolean }> = new Map();
//   private rateLimitStore: Map<string, { count: number; resetTime: Date }> = new Map();
//   constructor(private config: SecurityConfig) {
//     this.metrics = {
//       securityEvents: new Map(),
//       blockedRequests: 0,
//       csrfTokensGenerated: 0,
//       csrfTokensValidated: 0,
//       csrfFailures: 0,
//       lastSecurityEvent: null,
//       attacksBlocked: 0,
//       suspiciousIPs: new Set(),
//     };
//     // Initialize security event counters
//     Object.values(SecurityEventType).forEach(type => {
//       this.metrics.securityEvents.set(type, 0);
//     });
//     this.startCleanupJob();
//   }
//   /**
//    * Generate CSRF token
//    */
//   generateCSRFToken(sessionId?: string): { token: string; cookieValue: string } {
//     if (!this.config.csrf.enabled) {
//       throw new Error('CSRF protection is disabled');
//     }
//     const tokenId = generateSecureToken(16);
//     const token = crypto
//       .createHmac('sha256', this.config.csrf.secretKey)
//       .update(`${tokenId}:${sessionId || 'anonymous'}:${Date.now()}`)
//       .digest('hex');
//     const fullToken = `${tokenId}:${token}`;
//     const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
//     this.csrfTokens.set(fullToken, {
//       token: fullToken,
//       expires,
//       used: false,
//     });
//     this.metrics.csrfTokensGenerated++;
//     return {
//       token: fullToken,
//       cookieValue: fullToken,
//     };
//   }
//   /**
//    * Validate CSRF token
//    */
//   validateCSRFToken(token: string, sessionId?: string): boolean {
//     if (!this.config.csrf.enabled) {
//       return true;
//     }
//     if (!token) {
//       this.metrics.csrfFailures++;
//       return false;
//     }
//     const tokenData = this.csrfTokens.get(token);
//     if (!tokenData) {
//       this.metrics.csrfFailures++;
//       return false;
//     }
//     if (tokenData.used || new Date() > tokenData.expires) {
//       this.csrfTokens.delete(token);
//       this.metrics.csrfFailures++;
//       return false;
//     }
//     // Mark token as used (one-time use)
//     tokenData.used = true;
//     this.metrics.csrfTokensValidated++;
//     return true;
//   }
//   /**
//    * Detect attacks in request data
//    */
//   detectAttacks(request: FastifyRequest): SecurityEventType | null {
//     if (!this.config.attackDetection.enabled) {
//       return null;
//     }
//     const testData = [
//       JSON.stringify(request.body || {}),
//       JSON.stringify(request.query || {}),
//       JSON.stringify(request.params || {}),
//       request.url,
//       request.headers['user-agent'] || '',
//     ].join(' ');
//     // XSS Detection
//     if (this.config.attackDetection.xssDetection) {
//       for (const pattern of ATTACK_PATTERNS.XSS) {
//         if (pattern.test(testData)) {
//           return SecurityEventType.XSS_ATTEMPT;
//         }
//       }
//     }
//     // SQL Injection Detection
//     if (this.config.attackDetection.sqlInjectionDetection) {
//       for (const pattern of ATTACK_PATTERNS.SQL_INJECTION) {
//         if (pattern.test(testData)) {
//           return SecurityEventType.SQL_INJECTION_ATTEMPT;
//         }
//       }
//     }
//     // Path Traversal Detection
//     if (this.config.attackDetection.pathTraversalDetection) {
//       for (const pattern of ATTACK_PATTERNS.PATH_TRAVERSAL) {
//         if (pattern.test(testData)) {
//           return SecurityEventType.SUSPICIOUS_ACTIVITY;
//         }
//       }
//     }
//     // Command Injection Detection
//     if (this.config.attackDetection.commandInjectionDetection) {
//       for (const pattern of ATTACK_PATTERNS.COMMAND_INJECTION) {
//         if (pattern.test(testData)) {
//           return SecurityEventType.SUSPICIOUS_ACTIVITY;
//         }
//       }
//     }
//     return null;
//   }
//   /**
//    * Check rate limiting
//    */
//   checkRateLimit(key: string): { allowed: boolean; remaining: number; resetTime: Date } {
//     if (!this.config.rateLimiting.enabled) {
//       return {
//         allowed: true,
//         remaining: this.config.rateLimiting.maxRequests,
//         resetTime: new Date(),
//       };
//     }
//     const now = new Date();
//     const entry = this.rateLimitStore.get(key);
//     let count = 1;
//     let resetTime = new Date(now.getTime() + this.config.rateLimiting.windowMs);
//     if (entry) {
//       if (now <= entry.resetTime) {
//         count = entry.count + 1;
//         resetTime = entry.resetTime;
//       } else {
//         count = 1;
//         resetTime = new Date(now.getTime() + this.config.rateLimiting.windowMs);
//       }
//     }
//     this.rateLimitStore.set(key, { count, resetTime });
//     const allowed = count <= this.config.rateLimiting.maxRequests;
//     const remaining = Math.max(0, this.config.rateLimiting.maxRequests - count);
//     return { allowed, remaining, resetTime };
//   }
//   /**
//    * Log security event
//    */
//   logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
//     if (!this.config.auditLogging.enabled) {
//       return;
//     }
//     const fullEvent: SecurityEvent = {
//       ...event,
//       timestamp: new Date(),
//     };
//     this.securityEvents.push(fullEvent);
//     this.metrics.securityEvents.set(event.type, (this.metrics.securityEvents.get(event.type) || 0) + 1);
//     this.metrics.lastSecurityEvent = fullEvent.timestamp;
//     if (event.blocked) {
//       this.metrics.blockedRequests++;
//       if (event.type !== SecurityEventType.RATE_LIMIT_EXCEEDED) {
//         this.metrics.attacksBlocked++;
//       }
//     }
//     if (event.severity === SecuritySeverity.HIGH || event.severity === SecuritySeverity.CRITICAL) {
//       this.metrics.suspiciousIPs.add(event.ipAddress);
//     }
//     // Keep only last 1000 events in memory
//     if (this.securityEvents.length > 1000) {
//       this.securityEvents.shift();
//     }
//     // Log to external system (replace console.log with proper logger in production)
//   }
//   /**
//    * Generate Content Security Policy header
//    */
//   generateCSPHeader(): string {
//     if (!this.config.contentSecurityPolicy.enabled) {
//       return '';
//     }
//     const directives = Object.entries(this.config.contentSecurityPolicy.directives)
//       .map(([key, values]) => `${key} ${values.join(' ')}`)
//       .join('; ');
//     if (this.config.contentSecurityPolicy.reportUri) {
//       return `${directives}; report-uri ${this.config.contentSecurityPolicy.reportUri}`;
//     }
//     return directives;
//   }
//   /**
//    * Get security metrics
//    */
//   getMetrics(): SecurityMetrics & { securityEventsArray: SecurityEvent[] } {
//     return {
//       ...this.metrics,
//       securityEventsArray: this.securityEvents.slice(-100), // Last 100 events
//     };
//   }
//   /**
//    * Get security health status
//    */
//   getHealthStatus(): {
//     status: 'healthy' | 'warning' | 'critical';
//     details: Record<string, any>;
//   } {
//     const recentEvents = this.securityEvents.filter(
//       event => event.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Last hour
//     );
//     const criticalEvents = recentEvents.filter(
//       event => event.severity === SecuritySeverity.CRITICAL
//     ).length;
//     const highSeverityEvents = recentEvents.filter(
//       event => event.severity === SecuritySeverity.HIGH
//     ).length;
//     let status: 'healthy' | 'warning' | 'critical' = 'healthy';
//     if (criticalEvents > 0) {
//       status = 'critical';
//     } else if (highSeverityEvents > 10 || this.metrics.suspiciousIPs.size > 20) {
//       status = 'warning';
//     }
//     return {
//       status,
//       details: {
//         recentEvents: recentEvents.length,
//         criticalEvents,
//         highSeverityEvents,
//         suspiciousIPs: this.metrics.suspiciousIPs.size,
//         blockedRequests: this.metrics.blockedRequests,
//         attacksBlocked: this.metrics.attacksBlocked,
//         csrfTokensGenerated: this.metrics.csrfTokensGenerated,
//         csrfFailures: this.metrics.csrfFailures,
//         lastSecurityEvent: this.metrics.lastSecurityEvent,
//       },
//     };
//   }
//   /**
//    * Cleanup expired tokens and old data
//    */
//   private startCleanupJob(): void {
//     setInterval(() => {
//       const now = new Date();
//       // Cleanup expired CSRF tokens
//       for (const [token, data] of this.csrfTokens.entries()) {
//         if (now > data.expires) {
//           this.csrfTokens.delete(token);
//         }
//       }
//       // Cleanup old rate limit entries
//       for (const [key, entry] of this.rateLimitStore.entries()) {
//         if (now > entry.resetTime) {
//           this.rateLimitStore.delete(key);
//         }
//       }
//       // Cleanup old IP attempt records
//       for (const [ip, data] of this.ipAttempts.entries()) {
//         if (now.getTime() - data.lastAttempt.getTime() > 24 * 60 * 60 * 1000) { // 24 hours
//           this.ipAttempts.delete(ip);
//         }
//       }
//     }, 5 * 60 * 1000); // Every 5 minutes
//   }
// }
// // =============================================================================
// // FASTIFY PLUGIN
// // =============================================================================
// async function advancedSecurityPlugin(fastify: FastifyInstance) {
//   const config: SecurityConfig = {
//     csrf: {
//       enabled: process.env.CSRF_ENABLED !== 'false',
//       secretKey: process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex'),
//       tokenLength: 32,
//       cookieName: '__csrf',
//       headerName: 'x-csrf-token',
//       safeMethods: ['GET', 'HEAD', 'OPTIONS'],
//       sameOriginOnly: true,
//     },
//     contentSecurityPolicy: {
//       enabled: process.env.CSP_ENABLED !== 'false',
//       reportOnly: process.env.CSP_REPORT_ONLY === 'true',
//       reportUri: process.env.CSP_REPORT_URI,
//       directives: {
//         'default-src': ["'self'"],
//         'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
//         'style-src': ["'self'", "'unsafe-inline'"],
//         'img-src': ["'self'", 'data:', 'https:'],
//         'font-src': ["'self'"],
//         'connect-src': ["'self'"],
//         'media-src': ["'self'"],
//         'object-src': ["'none'"],
//         'child-src': ["'none'"],
//         'frame-src': ["'none'"],
//         'worker-src': ["'none'"],
//         'frame-ancestors': ["'none'"],
//         'form-action': ["'self'"],
//         'upgrade-insecure-requests': [],
//       },
//     },
//     rateLimiting: {
//       enabled: process.env.RATE_LIMITING_ENABLED !== 'false',
//       windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
//       maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
//       skipSuccessfulRequests: false,
//       standardHeaders: true,
//       legacyHeaders: false,
//     },
//     attackDetection: {
//       enabled: process.env.ATTACK_DETECTION_ENABLED !== 'false',
//       xssDetection: process.env.XSS_DETECTION_ENABLED !== 'false',
//       sqlInjectionDetection: process.env.SQL_INJECTION_DETECTION_ENABLED !== 'false',
//       pathTraversalDetection: process.env.PATH_TRAVERSAL_DETECTION_ENABLED !== 'false',
//       commandInjectionDetection: process.env.COMMAND_INJECTION_DETECTION_ENABLED !== 'false',
//     },
//     auditLogging: {
//       enabled: process.env.AUDIT_LOGGING_ENABLED !== 'false',
//       logSuccessfulAuth: process.env.LOG_SUCCESSFUL_AUTH !== 'false',
//       logFailedAuth: process.env.LOG_FAILED_AUTH !== 'false',
//       logRateLimits: process.env.LOG_RATE_LIMITS !== 'false',
//       logSuspiciousActivity: process.env.LOG_SUSPICIOUS_ACTIVITY !== 'false',
//     },
//   };
//   const securityService = new AdvancedSecurityService(config);
//   // Register security service
//   fastify.decorate('advancedSecurity', securityService);
//   // Pre-handler hook for all requests
//   fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
//     const requestId = generateSecureToken(16);
//     const ipAddress = extractIpFromHeaders(request.headers as Record<string, string>);
//     const userAgent = request.headers['user-agent'] || '';
//     // Add request ID to request
//     (request as any).requestId = requestId;
//     // Attack Detection
//     const attackType = securityService.detectAttacks(request);
//     if (attackType) {
//       securityService.logSecurityEvent({
//         type: attackType,
//         severity: SecuritySeverity.HIGH,
//         ipAddress,
//         userAgent,
//         details: {
//           method: request.method,
//           url: request.url,
//           body: request.body,
//           query: request.query,
//           params: request.params,
//         },
//         blocked: true,
//         requestId,
//       });
//       return reply.code(403).send({
//         error: 'Security violation detected',
//         code: 'SECURITY_VIOLATION',
//         requestId,
//         timestamp: new Date().toISOString(),
//       });
//     }
//     // Rate Limiting
//     const rateLimitKey = `${ipAddress}:${request.method}:${request.routerPath || request.url}`;
//     const rateLimit = securityService.checkRateLimit(rateLimitKey);
//     if (!rateLimit.allowed) {
//       securityService.logSecurityEvent({
//         type: SecurityEventType.RATE_LIMIT_EXCEEDED,
//         severity: SecuritySeverity.MEDIUM,
//         ipAddress,
//         userAgent,
//         details: {
//           method: request.method,
//           url: request.url,
//           rateLimitKey,
//         },
//         blocked: true,
//         requestId,
//       });
//       reply.headers({
//         'X-RateLimit-Limit': config.rateLimiting.maxRequests.toString(),
//         'X-RateLimit-Remaining': '0',
//         'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime.getTime() / 1000).toString(),
//         'Retry-After': Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 1000).toString(),
//       });
//       return reply.code(429).send({
//         error: 'Too many requests',
//         code: 'RATE_LIMIT_EXCEEDED',
//         requestId,
//         timestamp: new Date().toISOString(),
//         retryAfter: Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 1000),
//       });
//     }
//     // Add rate limit headers
//     if (config.rateLimiting.standardHeaders) {
//       reply.headers({
//         'X-RateLimit-Limit': config.rateLimiting.maxRequests.toString(),
//         'X-RateLimit-Remaining': rateLimit.remaining.toString(),
//         'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime.getTime() / 1000).toString(),
//       });
//     }
//     // CSRF Protection for non-safe methods
//     if (!config.csrf.safeMethods.includes(request.method)) {
//       const token = request.headers[config.csrf.headerName] as string;
//       if (!securityService.validateCSRFToken(token)) {
//         securityService.logSecurityEvent({
//           type: SecurityEventType.CSRF_ATTACK,
//           severity: SecuritySeverity.HIGH,
//           ipAddress,
//           userAgent,
//           details: {
//             method: request.method,
//             url: request.url,
//             hasToken: !!token,
//           },
//           blocked: true,
//           requestId,
//         });
//         return reply.code(403).send({
//           error: 'CSRF token validation failed',
//           code: 'CSRF_INVALID',
//           requestId,
//           timestamp: new Date().toISOString(),
//         });
//       }
//     }
//     // Add security headers
//     const cspHeader = securityService.generateCSPHeader();
//     if (cspHeader) {
//       const headerName = config.contentSecurityPolicy.reportOnly ? 
//         'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
//       reply.header(headerName, cspHeader);
//     }
//     // Additional security headers
//     reply.headers({
//       'X-Content-Type-Options': 'nosniff',
//       'X-Frame-Options': 'DENY',
//       'X-XSS-Protection': '1; mode=block',
//       'Referrer-Policy': 'strict-origin-when-cross-origin',
//       'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
//       'X-Request-ID': requestId,
//     });
//     if (process.env.NODE_ENV === 'production') {
//       reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
//     }
//   });
//   // CSRF token generation endpoint
//   fastify.get('/security/csrf-token', {
//     schema: {
//       summary: 'Generate CSRF token',
//       tags: ['Security'],
//       response: {
//         200: {
//           type: 'object',
//           properties: {
//             token: { type: 'string' },
//             cookieName: { type: 'string' },
//             headerName: { type: 'string' },
//           },
//         },
//       },
//     },
//   }, async (request, reply) => {
//     try {
//       const sessionId = (request as any).sessionId;
//       const { token, cookieValue } = securityService.generateCSRFToken(sessionId);
//       // Return CSRF token in response (client will need to store and send in headers)
//       // In production, you might want to use HTTP-only cookies with @fastify/cookie plugin
//       return reply.send({
//         token,
//         cookieName: config.csrf.cookieName,
//         headerName: config.csrf.headerName,
//       });
//     } catch (error) {
//       return reply.code(500).send({
//         error: 'Failed to generate CSRF token',
//         code: 'CSRF_GENERATION_FAILED',
//       });
//     }
//   });
//   // Security metrics endpoint
//   fastify.get('/security/metrics', {
//     schema: {
//       summary: 'Get security metrics',
//       tags: ['Security'],
//       response: {
//         200: {
//           type: 'object',
//           properties: {
//             metrics: { type: 'object' },
//             timestamp: { type: 'string' },
//           },
//         },
//       },
//     },
//   }, async (request, reply) => {
//     const metrics = securityService.getMetrics();
//     return reply.send({
//       metrics,
//       timestamp: new Date().toISOString(),
//     });
//   });
//   // Security health endpoint
//   fastify.get('/security/health', {
//     schema: {
//       summary: 'Get security health status',
//       tags: ['Security'],
//       response: {
//         200: {
//           type: 'object',
//           properties: {
//             status: { type: 'string' },
//             details: { type: 'object' },
//             timestamp: { type: 'string' },
//           },
//         },
//       },
//     },
//   }, async (request, reply) => {
//     const health = securityService.getHealthStatus();
//     const statusCode = health.status === 'healthy' ? 200 : health.status === 'warning' ? 200 : 503;
//     return reply.code(statusCode).send({
//       ...health,
//       timestamp: new Date().toISOString(),
//     });
//   });
//   fastify.log.info('🛡️  Advanced Security Plugin initialized with enterprise features');
// }
// // =============================================================================
// // TYPE DECLARATIONS
// // =============================================================================
// declare module 'fastify' {
//   interface FastifyInstance {
//     advancedSecurity: AdvancedSecurityService;
//   }
// }
// // =============================================================================
// // EXPORTS
// // =============================================================================
// export default fastifyPlugin(advancedSecurityPlugin as any, {
//   name: 'advanced-security',
//   fastify: '4.x',
// });
// export type {
//   SecurityEvent,
//   SecurityEventType,
//   SecuritySeverity,
//   SecurityConfig,
//   SecurityMetrics,
// };
// export {
//   AdvancedSecurityService,
// };
