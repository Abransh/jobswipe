"use strict";
/**
 * @fileoverview WebSocket Plugin for Real-time Communication
 * @description Socket.IO integration with authentication and room management
 * @version 1.0.0
 * @author JobSwipe Team
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_1 = require("socket.io");
var redis_adapter_1 = require("@socket.io/redis-adapter");
var ioredis_1 = require("ioredis");
var fastify_plugin_1 = require("fastify-plugin");
// =============================================================================
// WEBSOCKET PLUGIN
// =============================================================================
var websocketPlugin = function (fastify_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([fastify_1], args_1, true), void 0, function (fastify, options) {
        var log, redisConfig, pubClient_1, subClient_1, io_1, websocketService_1, setupAutomationListeners, error_1;
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    log = fastify.log;
                    _j.label = 1;
                case 1:
                    _j.trys.push([1, 3, , 4]);
                    redisConfig = {
                        host: ((_a = options.redis) === null || _a === void 0 ? void 0 : _a.host) || process.env.REDIS_HOST || 'localhost',
                        port: ((_b = options.redis) === null || _b === void 0 ? void 0 : _b.port) || parseInt(process.env.REDIS_PORT || '6379'),
                        password: ((_c = options.redis) === null || _c === void 0 ? void 0 : _c.password) || process.env.REDIS_PASSWORD,
                        db: ((_d = options.redis) === null || _d === void 0 ? void 0 : _d.db) || parseInt(process.env.REDIS_DB || '0'),
                    };
                    pubClient_1 = new ioredis_1.default(redisConfig);
                    subClient_1 = pubClient_1.duplicate();
                    // Wait for Redis connections
                    return [4 /*yield*/, Promise.all([
                            new Promise(function (resolve, reject) {
                                pubClient_1.once('ready', resolve);
                                pubClient_1.once('error', reject);
                            }),
                            new Promise(function (resolve, reject) {
                                subClient_1.once('ready', resolve);
                                subClient_1.once('error', reject);
                            }),
                        ])];
                case 2:
                    // Wait for Redis connections
                    _j.sent();
                    log.info('✅ Redis clients connected for WebSocket adapter');
                    io_1 = new socket_io_1.Server(fastify.server, {
                        cors: {
                            origin: ((_e = options.cors) === null || _e === void 0 ? void 0 : _e.origin) || ((_f = process.env.CORS_ORIGIN) === null || _f === void 0 ? void 0 : _f.split(',')) || ['http://localhost:3000'],
                            credentials: (_h = (_g = options.cors) === null || _g === void 0 ? void 0 : _g.credentials) !== null && _h !== void 0 ? _h : true,
                            methods: ['GET', 'POST'],
                            allowedHeaders: ['Authorization'],
                        },
                        transports: ['websocket', 'polling'],
                        allowEIO3: true,
                        pingTimeout: 60000,
                        pingInterval: 25000,
                    });
                    // Setup Redis adapter for horizontal scaling
                    io_1.adapter((0, redis_adapter_1.createAdapter)(pubClient_1, subClient_1));
                    // =============================================================================
                    // AUTHENTICATION MIDDLEWARE
                    // =============================================================================
                    io_1.use(function (socket, next) { return __awaiter(void 0, void 0, void 0, function () {
                        var token, tokenResult, error_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 4, , 5]);
                                    token = socket.handshake.auth.token;
                                    if (!token) {
                                        return [2 /*return*/, next(new Error('Authentication token required'))];
                                    }
                                    if (!fastify.jwtService) return [3 /*break*/, 2];
                                    return [4 /*yield*/, fastify.jwtService.verifyToken(token)];
                                case 1:
                                    tokenResult = _a.sent();
                                    if (!tokenResult.valid || !tokenResult.payload) {
                                        return [2 /*return*/, next(new Error('Invalid or expired token'))];
                                    }
                                    // Set user information on socket
                                    socket.userId = tokenResult.payload.sub || tokenResult.payload.userId;
                                    socket.userEmail = tokenResult.payload.email;
                                    socket.userRole = tokenResult.payload.role || 'user';
                                    socket.sessionId = tokenResult.payload.sessionId;
                                    log.info("WebSocket authenticated: ".concat(socket.userId, " (").concat(socket.userEmail, ")"));
                                    return [3 /*break*/, 3];
                                case 2:
                                    // Fallback for basic development mode
                                    if (token.startsWith('basic_')) {
                                        socket.userId = 'basic-user-id';
                                        socket.userEmail = 'user@example.com';
                                        socket.userRole = 'user';
                                    }
                                    else {
                                        return [2 /*return*/, next(new Error('Authentication service not available'))];
                                    }
                                    _a.label = 3;
                                case 3:
                                    next();
                                    return [3 /*break*/, 5];
                                case 4:
                                    error_2 = _a.sent();
                                    log.error('WebSocket authentication error:', error_2);
                                    next(new Error('Authentication failed'));
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    // =============================================================================
                    // CONNECTION HANDLING
                    // =============================================================================
                    io_1.on('connection', function (socket) {
                        var userId = socket.userId;
                        var userEmail = socket.userEmail;
                        log.info("WebSocket connected: ".concat(userId, " (").concat(userEmail, ") - Socket: ").concat(socket.id));
                        // Join user-specific room
                        socket.join("user:".concat(userId));
                        // Track connection
                        socket.emit('connection-confirmed', {
                            socketId: socket.id,
                            userId: userId,
                            timestamp: new Date().toISOString(),
                        });
                        // =============================================================================
                        // APPLICATION SUBSCRIPTION HANDLERS
                        // =============================================================================
                        socket.on('subscribe-application', function (applicationId) {
                            if (!applicationId) {
                                socket.emit('error', { message: 'Application ID required' });
                                return;
                            }
                            socket.join("application:".concat(applicationId));
                            log.debug("User ".concat(userId, " subscribed to application ").concat(applicationId));
                            socket.emit('subscription-confirmed', {
                                applicationId: applicationId,
                                type: 'application',
                                timestamp: new Date().toISOString(),
                            });
                        });
                        socket.on('unsubscribe-application', function (applicationId) {
                            if (!applicationId) {
                                socket.emit('error', { message: 'Application ID required' });
                                return;
                            }
                            socket.leave("application:".concat(applicationId));
                            log.debug("User ".concat(userId, " unsubscribed from application ").concat(applicationId));
                        });
                        // =============================================================================
                        // QUEUE STATUS HANDLERS
                        // =============================================================================
                        socket.on('subscribe-queue-status', function () {
                            socket.join("queue:user:".concat(userId));
                            log.debug("User ".concat(userId, " subscribed to queue status updates"));
                        });
                        socket.on('unsubscribe-queue-status', function () {
                            socket.leave("queue:user:".concat(userId));
                            log.debug("User ".concat(userId, " unsubscribed from queue status updates"));
                        });
                        // =============================================================================
                        // HEARTBEAT
                        // =============================================================================
                        socket.on('ping', function () {
                            socket.emit('pong', { timestamp: new Date().toISOString() });
                        });
                        // =============================================================================
                        // DISCONNECTION HANDLING
                        // =============================================================================
                        socket.on('disconnect', function (reason) {
                            log.info("WebSocket disconnected: ".concat(userId, " (").concat(userEmail, ") - Reason: ").concat(reason));
                        });
                        socket.on('error', function (error) {
                            log.error("WebSocket error for user ".concat(userId, ":"), error);
                        });
                    });
                    websocketService_1 = {
                        io: io_1,
                        // Emit to all sockets of a specific user
                        emitToUser: function (userId, event, data) {
                            io_1.to("user:".concat(userId)).emit(event, data);
                            log.debug("Emitted '".concat(event, "' to user ").concat(userId), data);
                        },
                        // Emit to all subscribers of a specific application
                        emitToApplication: function (applicationId, event, data) {
                            io_1.to("application:".concat(applicationId)).emit(event, __assign(__assign({}, data), { applicationId: applicationId, timestamp: new Date().toISOString() }));
                            log.debug("Emitted '".concat(event, "' to application ").concat(applicationId), data);
                        },
                        // Broadcast queue update to all connected users
                        broadcastQueueUpdate: function (event, data) {
                            io_1.emit(event, __assign(__assign({}, data), { timestamp: new Date().toISOString() }));
                            log.debug("Broadcasted '".concat(event, "'"), data);
                        },
                        // Get number of active sockets for a user
                        getUserSocketCount: function (userId) {
                            var room = io_1.sockets.adapter.rooms.get("user:".concat(userId));
                            return room ? room.size : 0;
                        },
                    };
                    // Register the service
                    fastify.decorate('websocket', websocketService_1);
                    setupAutomationListeners = function () {
                        if (fastify.automationService) {
                            log.info('Setting up automation event listeners for WebSocket...');
                            // Application queued event
                            fastify.automationService.on('application-queued', function (application) {
                                var userId = application.userId, applicationId = application.applicationId;
                                websocketService_1.emitToUser(userId, 'automation-queued', {
                                    applicationId: applicationId,
                                    status: 'queued',
                                    jobTitle: application.jobData.title,
                                    company: application.jobData.company,
                                    queuedAt: application.queuedAt,
                                    message: 'Job application has been queued for automation'
                                });
                            });
                            // Application processing event
                            fastify.automationService.on('application-processing', function (application) {
                                var userId = application.userId, applicationId = application.applicationId;
                                websocketService_1.emitToUser(userId, 'automation-processing', {
                                    applicationId: applicationId,
                                    status: 'processing',
                                    jobTitle: application.jobData.title,
                                    company: application.jobData.company,
                                    startedAt: application.startedAt,
                                    message: 'Job application automation is now processing'
                                });
                            });
                            // Application completed event
                            fastify.automationService.on('application-completed', function (application) {
                                var userId = application.userId, applicationId = application.applicationId, result = application.result;
                                websocketService_1.emitToUser(userId, 'automation-completed', {
                                    applicationId: applicationId,
                                    status: 'completed',
                                    success: (result === null || result === void 0 ? void 0 : result.success) || false,
                                    jobTitle: application.jobData.title,
                                    company: application.jobData.company,
                                    completedAt: application.completedAt,
                                    confirmationNumber: result === null || result === void 0 ? void 0 : result.confirmationNumber,
                                    executionTime: result === null || result === void 0 ? void 0 : result.executionTime,
                                    message: (result === null || result === void 0 ? void 0 : result.success)
                                        ? 'Job application completed successfully!'
                                        : 'Job application automation failed'
                                });
                            });
                            // Application failed event
                            fastify.automationService.on('application-failed', function (application) {
                                var userId = application.userId, applicationId = application.applicationId, result = application.result;
                                websocketService_1.emitToUser(userId, 'automation-failed', {
                                    applicationId: applicationId,
                                    status: 'failed',
                                    jobTitle: application.jobData.title,
                                    company: application.jobData.company,
                                    failedAt: application.completedAt,
                                    error: result === null || result === void 0 ? void 0 : result.error,
                                    executionTime: result === null || result === void 0 ? void 0 : result.executionTime,
                                    retryAvailable: application.retryCount < 3,
                                    message: 'Job application automation failed'
                                });
                            });
                            // Application cancelled event
                            fastify.automationService.on('application-cancelled', function (application) {
                                var userId = application.userId, applicationId = application.applicationId;
                                websocketService_1.emitToUser(userId, 'automation-cancelled', {
                                    applicationId: applicationId,
                                    status: 'cancelled',
                                    jobTitle: application.jobData.title,
                                    company: application.jobData.company,
                                    cancelledAt: new Date().toISOString(),
                                    message: 'Job application automation was cancelled'
                                });
                            });
                            // Application queued for desktop event
                            fastify.automationService.on('application-queued-desktop', function (application) {
                                var userId = application.userId, applicationId = application.applicationId;
                                websocketService_1.emitToUser(userId, 'automation-queued-desktop', {
                                    applicationId: applicationId,
                                    status: 'queued-desktop',
                                    jobTitle: application.jobData.title,
                                    company: application.jobData.company,
                                    message: 'Application queued for desktop app - please ensure your desktop app is running'
                                });
                            });
                            log.info('✅ Automation event listeners setup complete');
                        }
                        else {
                            log.warn('⚠️  AutomationService not available, skipping event listeners setup');
                        }
                    };
                    // Setup listeners after a short delay to ensure services are registered
                    setTimeout(setupAutomationListeners, 1000);
                    log.info('✅ WebSocket plugin registered successfully');
                    // =============================================================================
                    // CLEANUP ON CLOSE
                    // =============================================================================
                    fastify.addHook('onClose', function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    log.info('Closing WebSocket connections...');
                                    // Close Socket.IO server
                                    return [4 /*yield*/, new Promise(function (resolve) {
                                            io_1.close(function () {
                                                log.info('Socket.IO server closed');
                                                resolve();
                                            });
                                        })];
                                case 1:
                                    // Close Socket.IO server
                                    _a.sent();
                                    // Close Redis clients
                                    return [4 /*yield*/, Promise.all([
                                            pubClient_1.quit(),
                                            subClient_1.quit(),
                                        ])];
                                case 2:
                                    // Close Redis clients
                                    _a.sent();
                                    log.info('WebSocket cleanup completed');
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _j.sent();
                    log.error('Failed to initialize WebSocket plugin:', error_1);
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
};
// =============================================================================
// EXPORT PLUGIN
// =============================================================================
exports.default = (0, fastify_plugin_1.default)(websocketPlugin, {
    fastify: '4.x',
    name: 'websocket',
    dependencies: ['services'], // Ensure services plugin loads before WebSocket
});
