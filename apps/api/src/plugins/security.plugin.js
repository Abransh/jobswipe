"use strict";
/**
 * @fileoverview Security Plugin for Fastify API
 * @description Integrates enterprise security middleware with Fastify
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
var shared_1 = require("@jobswipe/shared");
// =============================================================================
// SECURITY PLUGIN
// =============================================================================
var SecurityService = /** @class */ (function () {
    function SecurityService(config) {
        this.config = config;
        this.rateLimitStore = new Map();
        this.blockedIps = new Map();
        this.suspiciousActivity = new Map();
        this.startCleanupTimer();
    }
    /**
     * Check if IP is blocked
     */
    SecurityService.prototype.isIpBlocked = function (ip) {
        var blockInfo = this.blockedIps.get(ip);
        if (!blockInfo)
            return false;
        // Check if block has expired
        if (blockInfo.expiresAt <= new Date()) {
            this.blockedIps.delete(ip);
            return false;
        }
        return true;
    };
    /**
     * Block IP address
     */
    SecurityService.prototype.blockIp = function (ip, reason) {
        if (!this.config.ipBlocking.enabled)
            return;
        var blockInfo = {
            ip: ip,
            reason: reason,
            blockedAt: new Date(),
            expiresAt: new Date(Date.now() + this.config.ipBlocking.blockDuration),
            attempts: 1,
        };
        this.blockedIps.set(ip, blockInfo);
        console.warn("IP blocked: ".concat(ip, " - ").concat(reason));
    };
    /**
     * Check rate limit
     */
    SecurityService.prototype.checkRateLimit = function (key) {
        if (!this.config.rateLimiting.enabled) {
            return { allowed: true, remaining: this.config.rateLimiting.maxRequests, resetTime: new Date() };
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
     * Check for suspicious activity
     */
    SecurityService.prototype.checkSuspiciousActivity = function (ip, userAgent, referer) {
        if (!this.config.suspiciousActivity.enabled)
            return false;
        var isSuspicious = (0, shared_1.isSuspiciousRequest)(ip, userAgent, referer);
        if (!isSuspicious)
            return false;
        var key = "suspicious:".concat(ip);
        var count = this.suspiciousActivity.get(key) || 0;
        this.suspiciousActivity.set(key, count + 1);
        if (count >= this.config.suspiciousActivity.threshold) {
            this.blockIp(ip, 'Suspicious activity detected');
            return true;
        }
        return false;
    };
    /**
     * Generate security headers
     */
    SecurityService.prototype.generateHeaders = function (nonce) {
        if (!this.config.securityHeaders.enabled)
            return {};
        var headers = {};
        if (this.config.securityHeaders.contentTypeOptions) {
            headers['X-Content-Type-Options'] = 'nosniff';
        }
        if (this.config.securityHeaders.frameOptions) {
            headers['X-Frame-Options'] = 'DENY';
        }
        if (this.config.securityHeaders.xssProtection) {
            headers['X-XSS-Protection'] = '1; mode=block';
        }
        if (this.config.securityHeaders.hsts && process.env.NODE_ENV === 'production') {
            headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
        }
        // Add additional security headers
        headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
        headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()';
        headers['X-Powered-By'] = 'JobSwipe';
        headers['X-Request-ID'] = (0, shared_1.generateSecureToken)(16);
        if (nonce) {
            headers['Content-Security-Policy'] = "\n        default-src 'self';\n        script-src 'self' 'nonce-".concat(nonce, "';\n        style-src 'self' 'unsafe-inline';\n        img-src 'self' data: https:;\n        font-src 'self';\n        connect-src 'self';\n        media-src 'self';\n        object-src 'none';\n        child-src 'none';\n        frame-src 'none';\n        worker-src 'none';\n        frame-ancestors 'none';\n        form-action 'self';\n        upgrade-insecure-requests;\n      ").replace(/\s+/g, ' ').trim();
        }
        return headers;
    };
    /**
     * Clean up expired entries
     */
    SecurityService.prototype.cleanup = function () {
        var now = new Date();
        // Clean rate limit entries
        for (var _i = 0, _a = this.rateLimitStore.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], entry = _b[1];
            if (entry.resetTime <= now) {
                this.rateLimitStore.delete(key);
            }
        }
        // Clean blocked IPs
        for (var _c = 0, _d = this.blockedIps.entries(); _c < _d.length; _c++) {
            var _e = _d[_c], ip = _e[0], blockInfo = _e[1];
            if (blockInfo.expiresAt <= now) {
                this.blockedIps.delete(ip);
            }
        }
        // Clean suspicious activity (keep only recent entries)
        if (this.suspiciousActivity.size > 10000) {
            this.suspiciousActivity.clear();
        }
    };
    /**
     * Start cleanup timer
     */
    SecurityService.prototype.startCleanupTimer = function () {
        var _this = this;
        setInterval(function () {
            _this.cleanup();
        }, 5 * 60 * 1000); // Every 5 minutes
    };
    /**
     * Get statistics
     */
    SecurityService.prototype.getStats = function () {
        return {
            rateLimitEntries: this.rateLimitStore.size,
            blockedIps: this.blockedIps.size,
            suspiciousActivity: this.suspiciousActivity.size,
            blockedIpsList: Array.from(this.blockedIps.values()),
        };
    };
    return SecurityService;
}());
// =============================================================================
// FASTIFY PLUGIN
// =============================================================================
function securityPlugin(fastify) {
    return __awaiter(this, void 0, void 0, function () {
        var config, securityService;
        var _this = this;
        return __generator(this, function (_a) {
            config = {
                rateLimiting: {
                    enabled: true,
                    windowMs: 15 * 60 * 1000, // 15 minutes
                    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
                    skipSuccessfulRequests: false,
                },
                securityHeaders: {
                    enabled: true,
                    hsts: true,
                    contentTypeOptions: true,
                    frameOptions: true,
                    xssProtection: true,
                },
                ipBlocking: {
                    enabled: true,
                    maxAttempts: 10,
                    blockDuration: 60 * 60 * 1000, // 1 hour
                },
                suspiciousActivity: {
                    enabled: true,
                    threshold: 5,
                },
            };
            securityService = new SecurityService(config);
            // Register security service with Fastify
            fastify.decorate('security', securityService);
            // Add pre-handler hook for all routes
            fastify.addHook('preHandler', function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var ip, userAgent, referer, rateLimitKey, rateLimit, securityHeaders;
                return __generator(this, function (_a) {
                    ip = (0, shared_1.extractIpFromHeaders)(request.headers);
                    userAgent = request.headers['user-agent'] || '';
                    referer = request.headers.referer;
                    // Check if IP is blocked
                    if (securityService.isIpBlocked(ip)) {
                        return [2 /*return*/, reply.code(403).send({
                                error: 'IP blocked due to suspicious activity',
                                code: 'IP_BLOCKED',
                                timestamp: new Date().toISOString(),
                            })];
                    }
                    // Check for suspicious activity
                    if (securityService.checkSuspiciousActivity(ip, userAgent, referer)) {
                        return [2 /*return*/, reply.code(403).send({
                                error: 'Suspicious activity detected',
                                code: 'SUSPICIOUS_ACTIVITY',
                                timestamp: new Date().toISOString(),
                            })];
                    }
                    rateLimitKey = "".concat(ip, ":").concat(request.method, ":").concat(request.url);
                    rateLimit = securityService.checkRateLimit(rateLimitKey);
                    if (!rateLimit.allowed) {
                        reply.headers({
                            'X-RateLimit-Limit': config.rateLimiting.maxRequests.toString(),
                            'X-RateLimit-Remaining': '0',
                            'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime.getTime() / 1000).toString(),
                            'Retry-After': Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 1000).toString(),
                        });
                        return [2 /*return*/, reply.code(429).send({
                                error: 'Too many requests',
                                code: 'RATE_LIMIT_EXCEEDED',
                                timestamp: new Date().toISOString(),
                                retryAfter: Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 1000),
                            })];
                    }
                    // Add rate limit headers
                    reply.headers({
                        'X-RateLimit-Limit': config.rateLimiting.maxRequests.toString(),
                        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                        'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime.getTime() / 1000).toString(),
                    });
                    securityHeaders = securityService.generateHeaders();
                    reply.headers(securityHeaders);
                    return [2 /*return*/];
                });
            }); });
            // Add security stats endpoint
            fastify.get('/security/stats', {
                schema: {
                    summary: 'Get security statistics',
                    tags: ['Security'],
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                stats: { type: 'object' },
                            },
                        },
                    },
                },
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var stats;
                return __generator(this, function (_a) {
                    stats = securityService.getStats();
                    return [2 /*return*/, reply.send({ stats: stats })];
                });
            }); });
            return [2 /*return*/];
        });
    });
}
// Export as Fastify plugin
exports.default = (0, fastify_plugin_1.default)(securityPlugin, {
    name: 'security',
    fastify: '4.x',
});
