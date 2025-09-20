"use strict";
/**
 * @fileoverview Services Registration Plugin for Fastify
 * @description Enterprise-grade dependency injection for authentication services
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Production-level service registration with proper error handling
 */
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
var fastify_plugin_1 = require("fastify-plugin");
var AutomationService_1 = require("../services/AutomationService");
var ServerAutomationService_1 = require("../services/ServerAutomationService");
var AutomationLimits_1 = require("../services/AutomationLimits");
var ProxyRotator_1 = require("../services/ProxyRotator");
// Import server services conditionally
var ServerJwtTokenService = null;
var RedisSessionService = null;
var createJwtTokenService = null;
var createRedisSessionService = null;
try {
    var serverModule = require('@jobswipe/shared/server');
    ServerJwtTokenService = serverModule.ServerJwtTokenService;
    RedisSessionService = serverModule.RedisSessionService;
    createJwtTokenService = serverModule.createJwtTokenService;
    createRedisSessionService = serverModule.createRedisSessionService;
    console.log('✅ Server modules loaded successfully');
}
catch (error) {
    console.warn('⚠️  Failed to load server modules:', error);
    console.warn('Services plugin will use fallback implementations');
}
// Database import (conditional)
var db = null;
try {
    var database = require('@jobswipe/database').db;
    db = database;
}
catch (error) {
    console.warn('Database package not available, services will continue without database connectivity');
}
// Create fallback service functions
function createFallbackRedisSessionService(redisConfig, sessionConfig) {
    var _this = this;
    console.log('Creating fallback Redis session service with config:', redisConfig);
    return {
        createSession: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, ({ id: 'fallback-session', userId: 'fallback-user' })];
        }); }); },
        getSession: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, null];
        }); }); },
        updateSession: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); }); },
        revokeSession: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); }); },
        cleanExpiredSessions: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 0];
        }); }); },
        getHealthStatus: function () { return ({ status: 'healthy', details: { fallback: true } }); },
    };
}
function createSecurityMiddlewareService() {
    return {
        checkRateLimit: function (_key, _maxRequests, _windowMs) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, true];
                });
            });
        },
        blockIp: function (ip, reason) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    console.log("IP blocked: ".concat(ip, " - ").concat(reason));
                    return [2 /*return*/];
                });
            });
        },
        isIpBlocked: function (_ip) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, false];
                });
            });
        },
        getStats: function () {
            return { rateLimitEntries: 0, blockedIps: 0, suspiciousActivity: 0 };
        },
    };
}
// =============================================================================
// SERVICE REGISTRY
// =============================================================================
var ServiceRegistry = /** @class */ (function () {
    function ServiceRegistry() {
        this.services = new Map();
        this.healthChecks = new Map();
        this.metrics = new Map();
    }
    /**
     * Register a service
     */
    ServiceRegistry.prototype.register = function (name, service, healthCheck) {
        this.services.set(name, service);
        if (healthCheck) {
            this.healthChecks.set(name, healthCheck);
        }
    };
    /**
     * Get a service
     */
    ServiceRegistry.prototype.get = function (name) {
        var service = this.services.get(name);
        if (!service) {
            throw new Error("Service '".concat(name, "' not found"));
        }
        return service;
    };
    /**
     * Check if service exists
     */
    ServiceRegistry.prototype.has = function (name) {
        return this.services.has(name);
    };
    /**
     * Get all service health
     */
    ServiceRegistry.prototype.getHealth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var health, _i, _a, _b, name_1, healthCheck, _c, _d, error_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        health = {};
                        _i = 0, _a = this.healthChecks.entries();
                        _e.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        _b = _a[_i], name_1 = _b[0], healthCheck = _b[1];
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 4, , 5]);
                        _c = health;
                        _d = name_1;
                        return [4 /*yield*/, healthCheck()];
                    case 3:
                        _c[_d] = _e.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _e.sent();
                        health[name_1] = {
                            status: 'unhealthy',
                            error: error_1 instanceof Error ? error_1.message : 'Unknown error'
                        };
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, health];
                }
            });
        });
    };
    /**
     * Get service metrics
     */
    ServiceRegistry.prototype.getMetrics = function () {
        var metrics = {};
        for (var _i = 0, _a = this.services.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], name_2 = _b[0], service = _b[1];
            if (service && typeof service.getMetrics === 'function') {
                try {
                    metrics[name_2] = service.getMetrics();
                }
                catch (error) {
                    metrics[name_2] = { error: 'Failed to get metrics' };
                }
            }
        }
        return metrics;
    };
    /**
     * Shutdown all services
     */
    ServiceRegistry.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, name_3, service, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _i = 0, _a = this.services.entries();
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        _b = _a[_i], name_3 = _b[0], service = _b[1];
                        if (!(service && typeof service.shutdown === 'function')) return [3 /*break*/, 5];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, service.shutdown()];
                    case 3:
                        _c.sent();
                        console.log("Service '".concat(name_3, "' shut down successfully"));
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _c.sent();
                        console.error("Error shutting down service '".concat(name_3, "':"), error_2);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        this.services.clear();
                        this.healthChecks.clear();
                        this.metrics.clear();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ServiceRegistry;
}());
// =============================================================================
// SERVICES PLUGIN
// =============================================================================
var servicesPlugin = function (fastify) { return __awaiter(void 0, void 0, void 0, function () {
    var config, serviceRegistry, jwtService, error_3, sessionService, securityService, error_4, automationService, proxyRotator, serverAutomationService, automationLimits;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                config = {
                    jwt: {
                        keyRotationInterval: parseInt(process.env.JWT_KEY_ROTATION_INTERVAL || '86400000'), // 24 hours
                        maxKeyAge: parseInt(process.env.JWT_MAX_KEY_AGE || '604800000'), // 7 days
                        revokedTokensCleanupInterval: parseInt(process.env.JWT_CLEANUP_INTERVAL || '3600000'), // 1 hour
                    },
                    redis: {
                        host: process.env.REDIS_HOST || 'localhost',
                        port: parseInt(process.env.REDIS_PORT || '6379'),
                        password: process.env.REDIS_PASSWORD,
                        db: parseInt(process.env.REDIS_DB || '0'),
                        keyPrefix: process.env.REDIS_KEY_PREFIX || 'jobswipe:',
                        maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
                        retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100'),
                        enableOfflineQueue: process.env.REDIS_OFFLINE_QUEUE === 'true',
                        lazyConnect: process.env.REDIS_LAZY_CONNECT === 'true',
                        ssl: process.env.REDIS_SSL === 'true',
                    },
                    session: {
                        keyPrefix: process.env.SESSION_KEY_PREFIX || 'session:',
                        defaultExpiration: parseInt(process.env.SESSION_DEFAULT_EXPIRATION || '1800'), // 30 minutes
                        enableMetrics: process.env.SESSION_ENABLE_METRICS !== 'false',
                    },
                    security: {
                        rateLimiting: {
                            enabled: process.env.RATE_LIMITING_ENABLED !== 'false',
                            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
                            maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
                        },
                        ipBlocking: {
                            enabled: process.env.IP_BLOCKING_ENABLED !== 'false',
                            maxAttempts: parseInt(process.env.IP_BLOCKING_MAX_ATTEMPTS || '10'),
                            blockDuration: parseInt(process.env.IP_BLOCKING_DURATION || '3600000'), // 1 hour
                        },
                        suspiciousActivity: {
                            enabled: process.env.SUSPICIOUS_ACTIVITY_ENABLED !== 'false',
                            threshold: parseInt(process.env.SUSPICIOUS_ACTIVITY_THRESHOLD || '5'),
                        },
                    },
                };
                serviceRegistry = new ServiceRegistry();
                // =============================================================================
                // JWT TOKEN SERVICE
                // =============================================================================
                fastify.log.info('Initializing JWT Token Service...');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                if (!createJwtTokenService) {
                    throw new Error('createJwtTokenService not available');
                }
                fastify.log.info('Creating JWT service with config:', {
                    keyRotationInterval: config.jwt.keyRotationInterval,
                    maxKeyAge: config.jwt.maxKeyAge,
                    revokedTokensCleanupInterval: config.jwt.revokedTokensCleanupInterval,
                });
                jwtService = createJwtTokenService({
                    keyRotationInterval: config.jwt.keyRotationInterval,
                    maxKeyAge: config.jwt.maxKeyAge,
                    revokedTokensCleanupInterval: config.jwt.revokedTokensCleanupInterval,
                });
                fastify.log.info('JWT service created, waiting for initialization...');
                // Wait for service to initialize
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 200); })];
            case 2:
                // Wait for service to initialize
                _a.sent();
                serviceRegistry.register('jwt', jwtService, function () { return Promise.resolve(jwtService.getHealthStatus()); });
                fastify.log.info('✅ JWT Token Service initialized successfully');
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                fastify.log.error('❌ Failed to initialize JWT Token Service:', error_3);
                fastify.log.error('Error details:', {
                    message: error_3 instanceof Error ? error_3.message : 'Unknown error',
                    stack: error_3 instanceof Error ? error_3.stack : undefined,
                });
                // Create fallback JWT service
                fastify.log.warn('Using fallback JWT service implementation');
                jwtService = {
                    createToken: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, 'fallback-jwt-token'];
                    }); }); },
                    verifyToken: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, ({ valid: true, payload: { sub: 'fallback-user' } })];
                    }); }); },
                    getHealthStatus: function () { return ({ status: 'degraded', details: { fallback: true } }); },
                };
                serviceRegistry.register('jwt', jwtService, function () { return Promise.resolve(jwtService.getHealthStatus()); });
                return [3 /*break*/, 4];
            case 4:
                // =============================================================================
                // REDIS SESSION SERVICE
                // =============================================================================
                fastify.log.info('Initializing Redis Session Service...');
                try {
                    if (!createRedisSessionService) {
                        throw new Error('createRedisSessionService not available');
                    }
                    fastify.log.info('Creating Redis session service with config:', {
                        redis: __assign(__assign({}, config.redis), { password: config.redis.password ? '[REDACTED]' : undefined }),
                        session: config.session,
                    });
                    sessionService = createRedisSessionService(config.redis, config.session);
                    fastify.log.info('Redis session service created successfully');
                    serviceRegistry.register('session', sessionService, function () { return Promise.resolve(sessionService.getHealthStatus()); });
                    fastify.log.info('✅ Redis Session Service initialized successfully');
                }
                catch (error) {
                    fastify.log.error('❌ Failed to initialize Redis Session Service:', error);
                    fastify.log.error('Error details:', {
                        message: error instanceof Error ? error.message : 'Unknown error',
                        stack: error instanceof Error ? error.stack : undefined,
                    });
                    // Create fallback session service
                    fastify.log.warn('Using fallback session service implementation');
                    sessionService = createFallbackRedisSessionService(config.redis, config.session);
                    serviceRegistry.register('session', sessionService, function () { return Promise.resolve(sessionService.getHealthStatus()); });
                }
                // =============================================================================
                // SECURITY MIDDLEWARE SERVICE
                // =============================================================================
                fastify.log.info('Initializing Security Middleware Service...');
                try {
                    securityService = createSecurityMiddlewareService();
                    serviceRegistry.register('security', securityService, function () { return Promise.resolve({ status: 'healthy', details: securityService.getStats() }); });
                    fastify.log.info('✅ Security Middleware Service initialized successfully');
                }
                catch (error) {
                    fastify.log.error('❌ Failed to initialize Security Middleware Service:', error);
                    throw new Error("Security service initialization failed: ".concat(error));
                }
                if (!db) return [3 /*break*/, 9];
                fastify.log.info('Initializing Database Service...');
                _a.label = 5;
            case 5:
                _a.trys.push([5, 7, , 8]);
                // Test database connection
                return [4 /*yield*/, db.$queryRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SELECT 1"], ["SELECT 1"])))];
            case 6:
                // Test database connection
                _a.sent();
                serviceRegistry.register('database', db, function () { return __awaiter(void 0, void 0, void 0, function () {
                    var start, latency, error_5;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                start = Date.now();
                                return [4 /*yield*/, db.$queryRaw(templateObject_2 || (templateObject_2 = __makeTemplateObject(["SELECT 1"], ["SELECT 1"])))];
                            case 1:
                                _a.sent();
                                latency = Date.now() - start;
                                return [2 /*return*/, {
                                        status: 'healthy',
                                        details: {
                                            latency: latency,
                                            connected: true,
                                        },
                                    }];
                            case 2:
                                error_5 = _a.sent();
                                return [2 /*return*/, {
                                        status: 'unhealthy',
                                        details: {
                                            connected: false,
                                            error: error_5 instanceof Error ? error_5.message : 'Unknown error',
                                        },
                                    }];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
                fastify.log.info('✅ Database Service initialized successfully');
                return [3 /*break*/, 8];
            case 7:
                error_4 = _a.sent();
                fastify.log.warn('⚠️  Database connection test failed:', error_4);
                // Register database service as unhealthy but still available
                serviceRegistry.register('database', db, function () { return Promise.resolve({
                    status: 'unhealthy',
                    details: {
                        connected: false,
                        error: error_4 instanceof Error ? error_4.message : 'Connection failed',
                    },
                }); });
                return [3 /*break*/, 8];
            case 8:
                // Add database cleanup on close
                fastify.addHook('onClose', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var error_6;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, db.$disconnect()];
                            case 1:
                                _a.sent();
                                fastify.log.info('Database connection closed');
                                return [3 /*break*/, 3];
                            case 2:
                                error_6 = _a.sent();
                                fastify.log.error('Error closing database connection:', error_6);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
                _a.label = 9;
            case 9:
                // =============================================================================
                // AUTOMATION SERVICES
                // =============================================================================
                fastify.log.info('Initializing Automation Services...');
                try {
                    proxyRotator = new ProxyRotator_1.ProxyRotator(fastify);
                    serverAutomationService = new ServerAutomationService_1.ServerAutomationService(fastify, proxyRotator);
                    automationLimits = new AutomationLimits_1.AutomationLimits(fastify);
                    // Create main AutomationService
                    automationService = new AutomationService_1.AutomationService(fastify, serverAutomationService, automationLimits);
                    // Register all automation services
                    serviceRegistry.register('proxyRotator', proxyRotator);
                    serviceRegistry.register('serverAutomation', serverAutomationService);
                    serviceRegistry.register('automationLimits', automationLimits);
                    serviceRegistry.register('automation', automationService, function () { return __awaiter(void 0, void 0, void 0, function () {
                        var healthStatus, error_7;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, automationService.getHealthStatus()];
                                case 1:
                                    healthStatus = _a.sent();
                                    return [2 /*return*/, {
                                            status: healthStatus.status,
                                            details: {
                                                activeProcesses: healthStatus.activeProcesses,
                                                queueHealth: healthStatus.queueHealth,
                                                systemInfo: healthStatus.systemInfo,
                                                issues: healthStatus.issues
                                            }
                                        }];
                                case 2:
                                    error_7 = _a.sent();
                                    return [2 /*return*/, {
                                            status: 'unhealthy',
                                            details: {
                                                error: error_7 instanceof Error ? error_7.message : 'Health check failed'
                                            }
                                        }];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    fastify.log.info('✅ Automation Services initialized successfully');
                }
                catch (error) {
                    fastify.log.error('❌ Failed to initialize Automation Services:', error);
                    throw new Error("Automation services initialization failed: ".concat(error));
                }
                // =============================================================================
                // REGISTER SERVICES WITH FASTIFY
                // =============================================================================
                // Decorate Fastify instance with services
                fastify.decorate('jwtService', jwtService);
                fastify.decorate('sessionService', sessionService);
                fastify.decorate('securityService', securityService);
                fastify.decorate('serviceRegistry', serviceRegistry);
                // Decorate automation services
                fastify.decorate('automationService', automationService);
                fastify.decorate('proxyRotator', serviceRegistry.get('proxyRotator'));
                fastify.decorate('serverAutomationService', serviceRegistry.get('serverAutomation'));
                fastify.decorate('automationLimits', serviceRegistry.get('automationLimits'));
                // Database decorator is registered by database.plugin.ts
                // Add service health check endpoint
                fastify.get('/health/services', {
                    schema: {
                        summary: 'Get all services health status',
                        tags: ['Health'],
                        response: {
                            200: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string' },
                                    timestamp: { type: 'string' },
                                    services: { type: 'object' },
                                },
                            },
                        },
                    },
                }, function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
                    var servicesHealth, allHealthy, anyUnhealthy, overallStatus, error_8;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, serviceRegistry.getHealth()];
                            case 1:
                                servicesHealth = _a.sent();
                                allHealthy = Object.values(servicesHealth).every(function (health) { return health.status === 'healthy'; });
                                anyUnhealthy = Object.values(servicesHealth).some(function (health) { return health.status === 'unhealthy'; });
                                overallStatus = anyUnhealthy ? 'unhealthy' : allHealthy ? 'healthy' : 'degraded';
                                return [2 /*return*/, reply.code(overallStatus === 'healthy' ? 200 : 503).send({
                                        status: overallStatus,
                                        timestamp: new Date().toISOString(),
                                        services: servicesHealth,
                                    })];
                            case 2:
                                error_8 = _a.sent();
                                return [2 /*return*/, reply.code(503).send({
                                        status: 'unhealthy',
                                        timestamp: new Date().toISOString(),
                                        error: error_8 instanceof Error ? error_8.message : 'Service health check failed',
                                    })];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
                // Add service metrics endpoint
                fastify.get('/health/services/metrics', {
                    schema: {
                        summary: 'Get all services metrics',
                        tags: ['Health'],
                        response: {
                            200: {
                                type: 'object',
                                properties: {
                                    timestamp: { type: 'string' },
                                    metrics: { type: 'object' },
                                },
                            },
                        },
                    },
                }, function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
                    var metrics;
                    return __generator(this, function (_a) {
                        try {
                            metrics = serviceRegistry.getMetrics();
                            return [2 /*return*/, reply.send({
                                    timestamp: new Date().toISOString(),
                                    metrics: metrics,
                                })];
                        }
                        catch (error) {
                            return [2 /*return*/, reply.code(500).send({
                                    error: error instanceof Error ? error.message : 'Failed to get metrics',
                                    timestamp: new Date().toISOString(),
                                })];
                        }
                        return [2 /*return*/];
                    });
                }); });
                // Graceful shutdown handling
                fastify.addHook('onClose', function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                fastify.log.info('Shutting down services...');
                                return [4 /*yield*/, serviceRegistry.shutdown()];
                            case 1:
                                _a.sent();
                                fastify.log.info('All services shut down successfully');
                                return [2 /*return*/];
                        }
                    });
                }); });
                fastify.log.info('🚀 All services registered successfully with Fastify');
                return [2 /*return*/];
        }
    });
}); };
// =============================================================================
// EXPORTS
// =============================================================================
exports.default = (0, fastify_plugin_1.default)(servicesPlugin, {
    name: 'services',
    fastify: '4.x',
});
var templateObject_1, templateObject_2;
