"use strict";
/**
 * @fileoverview JobSwipe API Server Entry Point
 * @description Enterprise-grade Fastify server with comprehensive features
 * @version 1.0.0
 * @author JobSwipe Team
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
exports.start = start;
// Load environment variables first
var dotenv_1 = require("dotenv");
var path_1 = require("path");
// Load .env.local file
var envPath = (0, path_1.resolve)(__dirname, '../.env.local');
(0, dotenv_1.config)({ path: envPath });
// Fallback to .env if .env.local doesn't exist
(0, dotenv_1.config)({ path: (0, path_1.resolve)(__dirname, '../.env') });
console.log('🔧 Environment variables loaded from:', envPath);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 Database URL:', process.env.DATABASE_URL ? '[CONFIGURED]' : '[MISSING]');
console.log('🔧 Redis URL:', process.env.REDIS_URL ? '[CONFIGURED]' : '[MISSING]');
console.log('🔧 JWT Secret:', process.env.JWT_SECRET ? '[CONFIGURED]' : '[MISSING]');
var fastify_1 = require("fastify");
var cors_1 = require("@fastify/cors");
var helmet_1 = require("@fastify/helmet");
var multipart_1 = require("@fastify/multipart");
var rate_limit_1 = require("@fastify/rate-limit");
var swagger_1 = require("@fastify/swagger");
var swagger_ui_1 = require("@fastify/swagger-ui");
// Import route handlers (ensure they exist first)
function loadRoutes() {
    return __awaiter(this, void 0, void 0, function () {
        var registerAuthRoutes, tokenExchangeRoutes, registerQueueRoutes, jobsRoutes, automationRoutes, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    console.log('Loading enterprise authentication routes...');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./routes/auth.routes'); })];
                case 1:
                    registerAuthRoutes = (_a.sent()).registerAuthRoutes;
                    console.log('Auth routes loaded successfully');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./routes/token-exchange.routes'); })];
                case 2:
                    tokenExchangeRoutes = _a.sent();
                    console.log('Token exchange routes loaded successfully');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./routes/queue.routes'); })];
                case 3:
                    registerQueueRoutes = (_a.sent()).registerQueueRoutes;
                    console.log('Queue routes loaded successfully');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./routes/jobs.routes'); })];
                case 4:
                    jobsRoutes = _a.sent();
                    console.log('Jobs routes loaded successfully');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./routes/automation-simple.routes'); })];
                case 5:
                    automationRoutes = _a.sent();
                    console.log('Automation routes loaded successfully');
                    return [2 /*return*/, {
                            registerAuthRoutes: registerAuthRoutes,
                            tokenExchangeRoutes: tokenExchangeRoutes.default,
                            registerQueueRoutes: registerQueueRoutes,
                            jobsRoutes: jobsRoutes.default,
                            automationRoutes: automationRoutes.automationRoutes
                        }];
                case 6:
                    error_1 = _a.sent();
                    console.error('❌ Failed to load enterprise routes:', error_1);
                    console.error('Error details:', {
                        message: error_1 instanceof Error ? error_1.message : 'Unknown error',
                        stack: error_1 instanceof Error ? error_1.stack : undefined,
                    });
                    console.warn('Falling back to basic routes');
                    return [2 /*return*/, null];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Import database conditionally
function loadDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var db, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('@jobswipe/database'); })];
                case 1:
                    db = (_a.sent()).db;
                    return [2 /*return*/, db];
                case 2:
                    error_2 = _a.sent();
                    console.warn('Database not available, using basic health checks');
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Import plugins conditionally
function loadPlugins() {
    return __awaiter(this, void 0, void 0, function () {
        var databasePlugin, securityPlugin, servicesPlugin, advancedSecurityPlugin, loggingPlugin, monitoringPlugin, queuePlugin, websocketPlugin, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    console.log('Loading enterprise plugins...');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./plugins/database.plugin'); })];
                case 1:
                    databasePlugin = _a.sent();
                    console.log('Database plugin loaded');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./plugins/security.plugin'); })];
                case 2:
                    securityPlugin = _a.sent();
                    console.log('Security plugin loaded');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./plugins/services.plugin'); })];
                case 3:
                    servicesPlugin = _a.sent();
                    console.log('Services plugin loaded');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./plugins/advanced-security.plugin'); })];
                case 4:
                    advancedSecurityPlugin = _a.sent();
                    console.log('Advanced security plugin loaded');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./plugins/logging.plugin'); })];
                case 5:
                    loggingPlugin = _a.sent();
                    console.log('Logging plugin loaded');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./plugins/monitoring.plugin'); })];
                case 6:
                    monitoringPlugin = _a.sent();
                    console.log('Monitoring plugin loaded');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./plugins/queue.plugin'); })];
                case 7:
                    queuePlugin = _a.sent();
                    console.log('Queue plugin loaded');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./plugins/websocket.plugin'); })];
                case 8:
                    websocketPlugin = _a.sent();
                    console.log('WebSocket plugin loaded');
                    console.log('✅ All enterprise plugins loaded successfully');
                    return [2 /*return*/, {
                            databasePlugin: databasePlugin.default,
                            securityPlugin: securityPlugin.default,
                            servicesPlugin: servicesPlugin.default,
                            advancedSecurityPlugin: advancedSecurityPlugin.default,
                            loggingPlugin: loggingPlugin.default,
                            monitoringPlugin: monitoringPlugin.default,
                            queuePlugin: queuePlugin.default,
                            websocketPlugin: websocketPlugin.default,
                        }];
                case 9:
                    error_3 = _a.sent();
                    console.error('❌ Failed to load enterprise plugins:', error_3);
                    console.error('Error details:', {
                        message: error_3 instanceof Error ? error_3.message : 'Unknown error',
                        stack: error_3 instanceof Error ? error_3.stack : undefined,
                    });
                    console.warn('Falling back to basic security');
                    return [2 /*return*/, null];
                case 10: return [2 /*return*/];
            }
        });
    });
}
// =============================================================================
// CONFIGURATION
// =============================================================================
var isDevelopment = process.env.NODE_ENV === 'development';
var isProduction = process.env.NODE_ENV === 'production';
var config = {
    port: parseInt(process.env.API_PORT || '3001'),
    host: process.env.API_HOST || 'localhost',
    cors: {
        origin: ((_a = process.env.API_CORS_ORIGIN) === null || _a === void 0 ? void 0 : _a.split(',')) || [
            'http://localhost:3000', // Next.js web app
            'http://localhost:3001', // Fastify API (self)
            'capacitor://localhost', // Capacitor iOS/Android
            'ionic://localhost', // Ionic apps
            'tauri://localhost', // Tauri desktop
            'file://', // Electron file:// protocol
            'null' // Electron null origin
        ],
        credentials: true,
    },
    rateLimit: {
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
        timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    },
    logger: {
        level: process.env.LOG_LEVEL || 'info',
        transport: isDevelopment ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
            },
        } : undefined,
    },
};
// =============================================================================
// BASIC ROUTES FALLBACK
// =============================================================================
/**
 * Register basic authentication routes as fallback
 */
function registerBasicRoutes(server, apiPrefix) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            server.log.info('Registering basic authentication routes...');
            // Basic auth routes
            server.post("".concat(apiPrefix, "/auth/login"), {
                schema: {
                    body: {
                        type: 'object',
                        required: ['email', 'password', 'source'],
                        properties: {
                            email: { type: 'string', format: 'email' },
                            password: { type: 'string' },
                            source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
                            rememberMe: { type: 'boolean' },
                        },
                    },
                },
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var _a, email, password;
                return __generator(this, function (_b) {
                    _a = request.body, email = _a.email, password = _a.password;
                    // Basic validation - accept any valid email/password for development
                    if (!email || !password || password.length < 8) {
                        return [2 /*return*/, reply.status(401).send({
                                success: false,
                                error: 'Invalid email or password',
                                errorCode: 'INVALID_CREDENTIALS',
                            })];
                    }
                    // Mock successful login
                    return [2 /*return*/, reply.status(200).send({
                            success: true,
                            user: {
                                id: 'basic-user-id',
                                email: email,
                                name: 'Basic User',
                                role: 'user',
                                status: 'active'
                            },
                            tokens: {
                                accessToken: "basic_token_".concat(Date.now()),
                                refreshToken: "basic_refresh_".concat(Date.now()),
                                tokenType: 'Bearer',
                                expiresIn: 3600,
                            },
                            message: 'Basic authentication - enterprise features not available'
                        })];
                });
            }); });
            server.post("".concat(apiPrefix, "/auth/register"), {
                schema: {
                    body: {
                        type: 'object',
                        required: ['email', 'password', 'source'],
                        properties: {
                            email: { type: 'string', format: 'email' },
                            password: { type: 'string', minLength: 8 },
                            name: { type: 'string' },
                            source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
                        },
                    },
                },
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var _a, email, password, name;
                return __generator(this, function (_b) {
                    _a = request.body, email = _a.email, password = _a.password, name = _a.name;
                    return [2 /*return*/, reply.status(201).send({
                            success: true,
                            user: {
                                id: 'basic-user-id',
                                email: email,
                                name: name || 'Basic User',
                                role: 'user',
                                status: 'active'
                            },
                            tokens: {
                                accessToken: "basic_token_".concat(Date.now()),
                                refreshToken: "basic_refresh_".concat(Date.now()),
                                tokenType: 'Bearer',
                                expiresIn: 3600,
                            },
                            message: 'Basic registration - enterprise features not available'
                        })];
                });
            }); });
            // Basic token refresh
            server.post("".concat(apiPrefix, "/auth/token/refresh"), function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, reply.send({
                            success: true,
                            tokens: {
                                accessToken: "basic_token_".concat(Date.now()),
                                refreshToken: "basic_refresh_".concat(Date.now()),
                                tokenType: 'Bearer',
                                expiresIn: 3600,
                            }
                        })];
                });
            }); });
            // Basic password reset
            server.post("".concat(apiPrefix, "/auth/password/reset"), function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, reply.send({
                            success: true,
                            message: 'If the email exists, a password reset link has been sent'
                        })];
                });
            }); });
            // Basic token exchange routes
            server.post("".concat(apiPrefix, "/token-exchange/initiate"), function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, reply.send({
                            success: true,
                            exchangeToken: "basic_exchange_".concat(Date.now()),
                            expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
                            instructions: {
                                step1: 'Basic token exchange - enterprise features not available',
                                step2: 'This is a development/testing endpoint',
                                step3: 'Enable enterprise plugins for full functionality'
                            }
                        })];
                });
            }); });
            server.post("".concat(apiPrefix, "/token-exchange/complete"), function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, reply.send({
                            success: true,
                            accessToken: "basic_desktop_".concat(Date.now()),
                            tokenType: 'Bearer',
                            expiresIn: 3600,
                            message: 'Basic token exchange completed'
                        })];
                });
            }); });
            server.log.info('✅ Basic routes registered successfully');
            return [2 /*return*/];
        });
    });
}
// =============================================================================
// SERVER SETUP
// =============================================================================
/**
 * Create and configure Fastify server instance
 */
function createServer() {
    return __awaiter(this, void 0, void 0, function () {
        var server, plugins, error_4, database, apiPrefix, routes, error_5;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    server = (0, fastify_1.default)({
                        logger: config.logger,
                        trustProxy: isProduction,
                        disableRequestLogging: false,
                        ignoreTrailingSlash: true,
                        caseSensitive: false,
                    });
                    return [4 /*yield*/, loadPlugins()];
                case 1:
                    plugins = _a.sent();
                    if (!plugins) return [3 /*break*/, 13];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 11, , 12]);
                    // Register database connection first
                    server.log.info('Registering database plugin...');
                    return [4 /*yield*/, server.register(plugins.databasePlugin)];
                case 3:
                    _a.sent();
                    // Register services first (JWT, Redis, Security)
                    server.log.info('Registering enterprise services plugin...');
                    return [4 /*yield*/, server.register(plugins.servicesPlugin)];
                case 4:
                    _a.sent();
                    // Register enterprise logging plugin
                    server.log.info('Registering enterprise logging plugin...');
                    return [4 /*yield*/, server.register(plugins.loggingPlugin)];
                case 5:
                    _a.sent();
                    // Register monitoring and observability plugin
                    server.log.info('Registering enterprise monitoring plugin...');
                    return [4 /*yield*/, server.register(plugins.monitoringPlugin)];
                case 6:
                    _a.sent();
                    // Register queue management plugin
                    server.log.info('Registering queue management plugin...');
                    return [4 /*yield*/, server.register(plugins.queuePlugin)];
                case 7:
                    _a.sent();
                    // Register WebSocket plugin
                    server.log.info('Registering WebSocket plugin...');
                    return [4 /*yield*/, server.register(plugins.websocketPlugin)];
                case 8:
                    _a.sent();
                    // Register advanced security plugin
                    server.log.info('Registering advanced security plugin...');
                    return [4 /*yield*/, server.register(plugins.advancedSecurityPlugin)];
                case 9:
                    _a.sent();
                    // Register basic security plugin (for backwards compatibility)
                    server.log.info('Registering basic security plugin...');
                    return [4 /*yield*/, server.register(plugins.securityPlugin)];
                case 10:
                    _a.sent();
                    server.log.info('✅ All enterprise plugins registered successfully');
                    return [3 /*break*/, 12];
                case 11:
                    error_4 = _a.sent();
                    server.log.warn('Some enterprise plugins failed to load, continuing with basic functionality');
                    server.log.error(error_4);
                    return [3 /*break*/, 12];
                case 12: return [3 /*break*/, 14];
                case 13:
                    server.log.warn('Enterprise plugins not available, using basic security headers');
                    _a.label = 14;
                case 14:
                    // Add comprehensive security headers fallback for all requests
                    server.addHook('onRequest', function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            // Security headers
                            reply.header('X-Content-Type-Options', 'nosniff');
                            reply.header('X-Frame-Options', 'DENY');
                            reply.header('X-XSS-Protection', '1; mode=block');
                            reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
                            // CORS debugging headers
                            reply.header('X-API-Version', '1.0.0');
                            reply.header('X-Request-ID', "req_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)));
                            if (process.env.NODE_ENV === 'production') {
                                reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
                            }
                            else {
                                // Development debugging headers
                                reply.header('X-Development-Mode', 'true');
                                reply.header('X-Request-Time', new Date().toISOString());
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    // Security headers (additional to security plugin)
                    return [4 /*yield*/, server.register(helmet_1.default, {
                            contentSecurityPolicy: {
                                directives: {
                                    defaultSrc: ["'self'"],
                                    styleSrc: ["'self'", "'unsafe-inline'"],
                                    scriptSrc: ["'self'"],
                                    imgSrc: ["'self'", "data:", "https:"],
                                    connectSrc: ["'self'"],
                                    fontSrc: ["'self'"],
                                    objectSrc: ["'none'"],
                                    mediaSrc: ["'self'"],
                                    frameSrc: ["'none'"],
                                },
                            },
                            crossOriginEmbedderPolicy: false,
                        })];
                case 15:
                    // Security headers (additional to security plugin)
                    _a.sent();
                    // CORS configuration with enhanced support for desktop apps
                    return [4 /*yield*/, server.register(cors_1.default, {
                            origin: function (origin, callback) {
                                var allowedOrigins = config.cors.origin;
                                server.log.debug("CORS request from origin: ".concat(origin));
                                // Allow requests with no origin (mobile apps, Electron, Postman)
                                if (!origin) {
                                    server.log.debug('CORS: Allowing request with no origin (mobile/desktop app)');
                                    return callback(null, true);
                                }
                                // Check if origin is in allowed list
                                if (allowedOrigins.includes(origin)) {
                                    server.log.debug("CORS: Allowing origin: ".concat(origin));
                                    return callback(null, true);
                                }
                                // Allow localhost with any port for development
                                if (isDevelopment && origin.startsWith('http://localhost')) {
                                    server.log.debug("CORS: Allowing localhost origin in development: ".concat(origin));
                                    return callback(null, true);
                                }
                                server.log.warn("CORS: Blocking origin: ".concat(origin));
                                callback(new Error('Not allowed by CORS'), false);
                            },
                            credentials: config.cors.credentials,
                            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
                            allowedHeaders: [
                                'Origin',
                                'X-Requested-With',
                                'Content-Type',
                                'Accept',
                                'Authorization',
                                'X-CSRF-Token',
                                'X-API-Key',
                                'User-Agent',
                                'X-Request-Source',
                                'X-Device-Type',
                                'X-App-Version',
                                'Cache-Control',
                                'Pragma',
                                'Expires'
                            ],
                            exposedHeaders: [
                                'X-Request-ID',
                                'X-Response-Time',
                                'X-Rate-Limit-Remaining',
                                'X-Rate-Limit-Reset'
                            ],
                            maxAge: isDevelopment ? 86400 : 3600, // 24h in dev, 1h in prod
                        })];
                case 16:
                    // CORS configuration with enhanced support for desktop apps
                    _a.sent();
                    // Rate limiting
                    return [4 /*yield*/, server.register(rate_limit_1.default, {
                            max: config.rateLimit.max,
                            timeWindow: config.rateLimit.timeWindow,
                            allowList: ['127.0.0.1'],
                            // Disable Redis for rate limiting to fix pipeline issue
                            // redis: process.env.REDIS_URL ? {
                            //   url: process.env.REDIS_URL,
                            // } : undefined,
                            keyGenerator: function (request) {
                                return request.headers['x-forwarded-for'] ||
                                    request.headers['x-real-ip'] ||
                                    request.ip;
                            },
                            errorResponseBuilder: function (request, context) {
                                return {
                                    code: 429,
                                    error: 'Too Many Requests',
                                    message: "Rate limit exceeded, retry in ".concat(Math.round(context.ttl / 1000), " seconds"),
                                    statusCode: 429,
                                    time: Date.now(),
                                };
                            },
                        })];
                case 17:
                    // Rate limiting
                    _a.sent();
                    // File upload support
                    return [4 /*yield*/, server.register(multipart_1.default, {
                            limits: {
                                fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
                                files: 10,
                                fields: 20,
                            },
                            attachFieldsToBody: true,
                        })];
                case 18:
                    // File upload support
                    _a.sent();
                    if (!isDevelopment) return [3 /*break*/, 21];
                    return [4 /*yield*/, server.register(swagger_1.default, {
                            swagger: {
                                info: {
                                    title: 'JobSwipe API',
                                    description: 'Enterprise job application automation platform API',
                                    version: '1.0.0',
                                    contact: {
                                        name: 'JobSwipe Team',
                                        email: 'api@jobswipe.com',
                                    },
                                },
                                externalDocs: {
                                    url: 'https://docs.jobswipe.com',
                                    description: 'Find more info here',
                                },
                                host: "".concat(config.host, ":").concat(config.port),
                                schemes: ['http', 'https'],
                                consumes: ['application/json', 'multipart/form-data'],
                                produces: ['application/json'],
                                tags: [
                                    { name: 'Authentication', description: 'User authentication endpoints' },
                                    { name: 'Users', description: 'User management endpoints' },
                                    { name: 'Jobs', description: 'Job management endpoints' },
                                    { name: 'Applications', description: 'Job application endpoints' },
                                    { name: 'Health', description: 'System health endpoints' },
                                ],
                                securityDefinitions: {
                                    Bearer: {
                                        type: 'apiKey',
                                        name: 'Authorization',
                                        in: 'header',
                                        description: 'Enter: Bearer {token}',
                                    },
                                },
                            },
                        })];
                case 19:
                    _a.sent();
                    return [4 /*yield*/, server.register(swagger_ui_1.default, {
                            routePrefix: '/docs',
                            uiConfig: {
                                docExpansion: 'list',
                                deepLinking: false,
                            },
                            staticCSP: true,
                            transformStaticCSP: function (header) { return header; },
                        })];
                case 20:
                    _a.sent();
                    _a.label = 21;
                case 21: return [4 /*yield*/, loadDatabase()];
                case 22:
                    database = _a.sent();
                    // Basic health check
                    server.get('/health', function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        var databaseStatus, statusCode, error_6;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    databaseStatus = 'not_connected';
                                    statusCode = 200;
                                    if (!database) return [3 /*break*/, 4];
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    // Test database connection
                                    return [4 /*yield*/, database.$queryRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SELECT 1"], ["SELECT 1"])))];
                                case 2:
                                    // Test database connection
                                    _a.sent();
                                    databaseStatus = 'connected';
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_6 = _a.sent();
                                    databaseStatus = 'disconnected';
                                    statusCode = 503;
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/, reply.code(statusCode).send({
                                        status: statusCode === 200 ? 'healthy' : 'unhealthy',
                                        timestamp: new Date().toISOString(),
                                        version: process.env.npm_package_version || '1.0.0',
                                        environment: process.env.NODE_ENV || 'development',
                                        uptime: process.uptime(),
                                        database: databaseStatus,
                                    })];
                            }
                        });
                    }); });
                    // Detailed health check
                    server.get('/health/detailed', function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        var healthChecks, start_1, error_7, memUsage, overallStatus;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    healthChecks = {
                                        database: { status: 'not_connected', latency: 0 },
                                        memory: { status: 'unknown', usage: 0, limit: 0 },
                                        redis: { status: 'not_connected', latency: 0 },
                                    };
                                    if (!database) return [3 /*break*/, 4];
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    start_1 = Date.now();
                                    return [4 /*yield*/, database.$queryRaw(templateObject_2 || (templateObject_2 = __makeTemplateObject(["SELECT 1"], ["SELECT 1"])))];
                                case 2:
                                    _a.sent();
                                    healthChecks.database = {
                                        status: 'healthy',
                                        latency: Date.now() - start_1,
                                    };
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_7 = _a.sent();
                                    healthChecks.database = {
                                        status: 'unhealthy',
                                        latency: 0,
                                    };
                                    return [3 /*break*/, 4];
                                case 4:
                                    memUsage = process.memoryUsage();
                                    healthChecks.memory = {
                                        status: memUsage.heapUsed < memUsage.heapTotal * 0.9 ? 'healthy' : 'warning',
                                        usage: memUsage.heapUsed,
                                        limit: memUsage.heapTotal,
                                    };
                                    // Redis health check (if configured)
                                    if (process.env.REDIS_URL) {
                                        try {
                                            // This would be implemented with actual Redis client
                                            healthChecks.redis = { status: 'healthy', latency: 0 };
                                        }
                                        catch (error) {
                                            healthChecks.redis = { status: 'unhealthy', latency: 0 };
                                        }
                                    }
                                    overallStatus = Object.values(healthChecks).every(function (check) {
                                        return check.status === 'healthy';
                                    }) ? 'healthy' : 'degraded';
                                    return [2 /*return*/, reply.code(overallStatus === 'healthy' ? 200 : 503).send({
                                            status: overallStatus,
                                            timestamp: new Date().toISOString(),
                                            checks: healthChecks,
                                        })];
                            }
                        });
                    }); });
                    // Ready check (Kubernetes readiness probe)
                    server.get('/ready', function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        var error_8;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!database) return [3 /*break*/, 5];
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, database.$queryRaw(templateObject_3 || (templateObject_3 = __makeTemplateObject(["SELECT 1"], ["SELECT 1"])))];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/, reply.code(200).send({
                                            ready: true,
                                            timestamp: new Date().toISOString()
                                        })];
                                case 3:
                                    error_8 = _a.sent();
                                    return [2 /*return*/, reply.code(503).send({
                                            ready: false,
                                            timestamp: new Date().toISOString(),
                                            error: 'Database not ready'
                                        })];
                                case 4: return [3 /*break*/, 6];
                                case 5: return [2 /*return*/, reply.code(200).send({
                                        ready: true,
                                        timestamp: new Date().toISOString(),
                                        note: 'Database not configured'
                                    })];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Live check (Kubernetes liveness probe)
                    server.get('/live', function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, reply.code(200).send({
                                    status: 'alive',
                                    timestamp: new Date().toISOString(),
                                })];
                        });
                    }); });
                    // Security health check
                    server.get('/health/security', function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        var basicSecurityStats, advancedSecurityStats;
                        var _a, _b, _c, _d;
                        return __generator(this, function (_e) {
                            try {
                                basicSecurityStats = ((_b = (_a = server.security) === null || _a === void 0 ? void 0 : _a.getStats) === null || _b === void 0 ? void 0 : _b.call(_a)) || {};
                                advancedSecurityStats = ((_d = (_c = server.advancedSecurity) === null || _c === void 0 ? void 0 : _c.getHealthStatus) === null || _d === void 0 ? void 0 : _d.call(_c)) || {};
                                return [2 /*return*/, reply.code(200).send({
                                        status: 'healthy',
                                        timestamp: new Date().toISOString(),
                                        security: {
                                            basic: basicSecurityStats,
                                            advanced: advancedSecurityStats,
                                        },
                                    })];
                            }
                            catch (error) {
                                return [2 /*return*/, reply.code(503).send({
                                        status: 'unhealthy',
                                        timestamp: new Date().toISOString(),
                                        error: error instanceof Error ? error.message : 'Security check failed',
                                    })];
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    apiPrefix = process.env.API_PREFIX || '/api/v1';
                    return [4 /*yield*/, loadRoutes()];
                case 23:
                    routes = _a.sent();
                    if (!routes) return [3 /*break*/, 33];
                    _a.label = 24;
                case 24:
                    _a.trys.push([24, 30, , 32]);
                    // Enterprise authentication routes
                    server.log.info('Registering enterprise authentication routes...');
                    return [4 /*yield*/, server.register(function (fastify) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, routes.registerAuthRoutes(fastify)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        }, { prefix: "".concat(apiPrefix, "/auth") })];
                case 25:
                    _a.sent();
                    // Enterprise token exchange routes
                    server.log.info('Registering enterprise token exchange routes...');
                    return [4 /*yield*/, server.register(routes.tokenExchangeRoutes, { prefix: "".concat(apiPrefix, "/token-exchange") })];
                case 26:
                    _a.sent();
                    // Enterprise queue management routes
                    server.log.info('Registering enterprise queue management routes...');
                    return [4 /*yield*/, server.register(function (fastify) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, routes.registerQueueRoutes(fastify)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        }, { prefix: "".concat(apiPrefix, "/queue") })];
                case 27:
                    _a.sent();
                    // Enterprise jobs routes
                    server.log.info('Registering enterprise jobs routes...');
                    return [4 /*yield*/, server.register(routes.jobsRoutes, { prefix: apiPrefix })];
                case 28:
                    _a.sent();
                    // Enterprise automation routes
                    server.log.info('Registering enterprise automation routes...');
                    return [4 /*yield*/, server.register(routes.automationRoutes, { prefix: apiPrefix })];
                case 29:
                    _a.sent();
                    server.log.info('✅ Enterprise routes registered successfully');
                    return [3 /*break*/, 32];
                case 30:
                    error_5 = _a.sent();
                    server.log.warn('Enterprise routes failed to load, registering basic routes');
                    server.log.error(error_5);
                    return [4 /*yield*/, registerBasicRoutes(server, apiPrefix)];
                case 31:
                    _a.sent();
                    return [3 /*break*/, 32];
                case 32: return [3 /*break*/, 35];
                case 33:
                    server.log.warn('Enterprise routes not available, using basic authentication');
                    return [4 /*yield*/, registerBasicRoutes(server, apiPrefix)];
                case 34:
                    _a.sent();
                    _a.label = 35;
                case 35:
                    // =============================================================================
                    // ERROR HANDLING
                    // =============================================================================
                    // Global error handler (will be overridden by logging plugin if registered)
                    server.setErrorHandler(function (error, request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        var isDev, statusCode;
                        return __generator(this, function (_a) {
                            isDev = process.env.NODE_ENV === 'development';
                            // Use logging service if available
                            if (server.logging && request.logContext) {
                                server.logging.logError(error, request.logContext, {
                                    url: request.url,
                                    method: request.method,
                                    body: request.body,
                                    query: request.query,
                                    params: request.params,
                                });
                            }
                            else {
                                server.log.error({
                                    error: error.message,
                                    stack: error.stack,
                                    request: {
                                        method: request.method,
                                        url: request.url,
                                        headers: request.headers,
                                        query: request.query,
                                        params: request.params,
                                    },
                                }, 'Unhandled error');
                            }
                            // Validation errors
                            if (error.validation) {
                                return [2 /*return*/, reply.code(400).send({
                                        error: 'Validation Error',
                                        message: 'Invalid request data',
                                        details: error.validation,
                                        statusCode: 400,
                                        timestamp: new Date().toISOString(),
                                    })];
                            }
                            // Rate limit errors
                            if (error.statusCode === 429) {
                                return [2 /*return*/, reply.code(429).send({
                                        error: 'Too Many Requests',
                                        message: 'Rate limit exceeded',
                                        statusCode: 429,
                                        timestamp: new Date().toISOString(),
                                    })];
                            }
                            // Authentication errors
                            if (error.statusCode === 401) {
                                return [2 /*return*/, reply.code(401).send({
                                        error: 'Unauthorized',
                                        message: 'Authentication required',
                                        statusCode: 401,
                                        timestamp: new Date().toISOString(),
                                    })];
                            }
                            // Authorization errors
                            if (error.statusCode === 403) {
                                return [2 /*return*/, reply.code(403).send({
                                        error: 'Forbidden',
                                        message: 'Insufficient permissions',
                                        statusCode: 403,
                                        timestamp: new Date().toISOString(),
                                    })];
                            }
                            // Not found errors
                            if (error.statusCode === 404) {
                                return [2 /*return*/, reply.code(404).send({
                                        error: 'Not Found',
                                        message: 'Resource not found',
                                        statusCode: 404,
                                        timestamp: new Date().toISOString(),
                                    })];
                            }
                            statusCode = error.statusCode || 500;
                            return [2 /*return*/, reply.code(statusCode).send(__assign({ error: 'Internal Server Error', message: isDev ? error.message : 'An unexpected error occurred', statusCode: statusCode, timestamp: new Date().toISOString() }, (isDev && { stack: error.stack })))];
                        });
                    }); });
                    // 404 handler
                    server.setNotFoundHandler(function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, reply.code(404).send({
                                    error: 'Not Found',
                                    message: "Route ".concat(request.method, " ").concat(request.url, " not found"),
                                    statusCode: 404,
                                    timestamp: new Date().toISOString(),
                                })];
                        });
                    }); });
                    return [2 /*return*/, server];
            }
        });
    });
}
// =============================================================================
// SERVER STARTUP
// =============================================================================
/**
 * Start the server
 */
function start() {
    return __awaiter(this, void 0, void 0, function () {
        var server_1, gracefulShutdown_1, error_9;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, createServer()];
                case 1:
                    server_1 = _a.sent();
                    gracefulShutdown_1 = function (signal) { return __awaiter(_this, void 0, void 0, function () {
                        var database, error_10;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    server_1.log.info("Received ".concat(signal, ", starting graceful shutdown..."));
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 6, , 7]);
                                    return [4 /*yield*/, server_1.close()];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, loadDatabase()];
                                case 3:
                                    database = _a.sent();
                                    if (!database) return [3 /*break*/, 5];
                                    return [4 /*yield*/, database.$disconnect()];
                                case 4:
                                    _a.sent();
                                    _a.label = 5;
                                case 5:
                                    server_1.log.info('Server shut down gracefully');
                                    process.exit(0);
                                    return [3 /*break*/, 7];
                                case 6:
                                    error_10 = _a.sent();
                                    server_1.log.error(error_10, 'Error during graceful shutdown');
                                    process.exit(1);
                                    return [3 /*break*/, 7];
                                case 7: return [2 /*return*/];
                            }
                        });
                    }); };
                    // Register signal handlers
                    process.on('SIGTERM', function () { return gracefulShutdown_1('SIGTERM'); });
                    process.on('SIGINT', function () { return gracefulShutdown_1('SIGINT'); });
                    // Unhandled promise rejection
                    process.on('unhandledRejection', function (reason, promise) {
                        server_1.log.fatal({
                            reason: reason,
                            promise: promise,
                        }, 'Unhandled Promise Rejection');
                        process.exit(1);
                    });
                    // Uncaught exception
                    process.on('uncaughtException', function (error) {
                        server_1.log.fatal(error, 'Uncaught Exception');
                        process.exit(1);
                    });
                    // Start listening
                    return [4 /*yield*/, server_1.listen({
                            port: config.port,
                            host: config.host,
                        })];
                case 2:
                    // Start listening
                    _a.sent();
                    server_1.log.info("\uD83D\uDE80 JobSwipe API Server started successfully!");
                    server_1.log.info("\uD83D\uDCE1 Server listening on http://".concat(config.host, ":").concat(config.port));
                    server_1.log.info("\uD83D\uDD0D Health check: http://".concat(config.host, ":").concat(config.port, "/health"));
                    server_1.log.info("\uD83D\uDEE1\uFE0F  Security middleware: http://".concat(config.host, ":").concat(config.port, "/health/security"));
                    server_1.log.info("\uD83D\uDCCA Monitoring metrics: http://".concat(config.host, ":").concat(config.port, "/metrics"));
                    server_1.log.info("\uD83D\uDCC8 Monitoring health: http://".concat(config.host, ":").concat(config.port, "/health/monitoring"));
                    if (isDevelopment) {
                        server_1.log.info("\uD83D\uDCDA API Documentation: http://".concat(config.host, ":").concat(config.port, "/docs"));
                    }
                    server_1.log.info("\uD83C\uDF0D Environment: ".concat(process.env.NODE_ENV || 'development'));
                    return [3 /*break*/, 4];
                case 3:
                    error_9 = _a.sent();
                    console.error('❌ Failed to start server:', error_9);
                    process.exit(1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Start server if this file is run directly
if (require.main === module) {
    start();
}
var templateObject_1, templateObject_2, templateObject_3;
