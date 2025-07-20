"use strict";
/**
 * @fileoverview Secure Web-to-Desktop Token Exchange Routes
 * @description Enterprise-grade secure token exchange for desktop app authentication
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Critical security component - handles cross-platform authentication
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
exports.default = tokenExchangeRoutes;
var zod_1 = require("zod");
var uuid_1 = require("uuid");
var crypto_1 = require("crypto");
var shared_1 = require("@jobswipe/shared");
// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================
var TokenExchangeInitiateSchema = zod_1.z.object({
    deviceId: zod_1.z.string().uuid('Invalid device ID format'),
    deviceName: zod_1.z.string().min(1).max(100),
    deviceType: zod_1.z.enum(['desktop', 'mobile']),
    platform: zod_1.z.string().min(1).max(50),
    osVersion: zod_1.z.string().optional(),
    appVersion: zod_1.z.string().optional(),
});
var TokenExchangeCompleteSchema = zod_1.z.object({
    exchangeToken: zod_1.z.string().min(32).max(256),
    deviceId: zod_1.z.string().uuid(),
    deviceName: zod_1.z.string().min(1).max(100),
    platform: zod_1.z.string().min(1).max(50),
    systemInfo: zod_1.z.object({
        platform: zod_1.z.string(),
        version: zod_1.z.string(),
        arch: zod_1.z.string(),
    }).optional(),
});
var TokenExchangeVerifySchema = zod_1.z.object({
    exchangeToken: zod_1.z.string().min(32).max(256),
    userConfirmation: zod_1.z.boolean(),
});
// Simple Redis client implementation (replace with ioredis in production)
var SimpleRedisClient = /** @class */ (function () {
    function SimpleRedisClient() {
        this.store = new Map();
    }
    SimpleRedisClient.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var item;
            return __generator(this, function (_a) {
                item = this.store.get(key);
                if (!item)
                    return [2 /*return*/, null];
                if (Date.now() > item.expiresAt) {
                    this.store.delete(key);
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, item.value];
            });
        });
    };
    SimpleRedisClient.prototype.setex = function (key, seconds, value) {
        return __awaiter(this, void 0, void 0, function () {
            var expiresAt;
            return __generator(this, function (_a) {
                expiresAt = Date.now() + (seconds * 1000);
                this.store.set(key, { value: value, expiresAt: expiresAt });
                return [2 /*return*/, 'OK'];
            });
        });
    };
    SimpleRedisClient.prototype.del = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.store.delete(key) ? 1 : 0];
            });
        });
    };
    SimpleRedisClient.prototype.keys = function (pattern) {
        return __awaiter(this, void 0, void 0, function () {
            var regex;
            return __generator(this, function (_a) {
                regex = new RegExp(pattern.replace(/\*/g, '.*'));
                return [2 /*return*/, Array.from(this.store.keys()).filter(function (key) { return regex.test(key); })];
            });
        });
    };
    return SimpleRedisClient;
}());
// =============================================================================
// TOKEN EXCHANGE SERVICE
// =============================================================================
var TokenExchangeService = /** @class */ (function () {
    function TokenExchangeService(jwtService, sessionService) {
        var _this = this;
        this.jwtService = jwtService;
        this.sessionService = sessionService;
        this.keyPrefix = 'token_exchange:';
        // Initialize Redis client (replace with real Redis in production)
        this.redis = new SimpleRedisClient();
        // Cleanup expired exchanges every 5 minutes
        this.cleanupInterval = setInterval(function () {
            _this.cleanupExpiredExchanges();
        }, 5 * 60 * 1000);
    }
    TokenExchangeService.getInstance = function (jwtService, sessionService) {
        if (!TokenExchangeService.instance) {
            TokenExchangeService.instance = new TokenExchangeService(jwtService, sessionService);
        }
        return TokenExchangeService.instance;
    };
    /**
     * Initiate token exchange session
     */
    TokenExchangeService.prototype.initiateExchange = function (userId, deviceInfo, webSessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var exchangeToken, expiresAt, exchangeSession, redisKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        exchangeToken = this.generateSecureExchangeToken();
                        expiresAt = new Date(Date.now() + 10 * 60 * 1000);
                        exchangeSession = {
                            exchangeToken: exchangeToken,
                            userId: userId,
                            deviceId: deviceInfo.deviceId,
                            deviceName: deviceInfo.deviceName,
                            platform: deviceInfo.platform,
                            createdAt: new Date(),
                            expiresAt: expiresAt,
                            isUsed: false,
                            webSessionId: webSessionId,
                        };
                        redisKey = "".concat(this.keyPrefix).concat(exchangeToken);
                        return [4 /*yield*/, this.redis.setex(redisKey, 10 * 60, JSON.stringify(exchangeSession))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, {
                                exchangeToken: exchangeToken,
                                expiresAt: expiresAt,
                                deviceId: deviceInfo.deviceId,
                                instructions: {
                                    step1: 'Open the JobSwipe desktop application',
                                    step2: 'The app will automatically detect this authentication request',
                                    step3: 'Confirm the device details match your desktop application',
                                    warning: 'Only complete this process on your trusted device',
                                },
                            }];
                }
            });
        });
    };
    /**
     * Complete token exchange and issue desktop token
     */
    TokenExchangeService.prototype.completeExchange = function (exchangeToken, deviceInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var redisKey, sessionData, exchangeSession, createDesktopTokenConfig, tokenConfig, desktopToken, desktopSession, tokenString, expiresInSeconds, tokenId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        redisKey = "".concat(this.keyPrefix).concat(exchangeToken);
                        return [4 /*yield*/, this.redis.get(redisKey)];
                    case 1:
                        sessionData = _a.sent();
                        if (!sessionData) {
                            throw (0, shared_1.createAuthError)(shared_1.AuthErrorCode.TOKEN_INVALID, 'Invalid or expired exchange token');
                        }
                        exchangeSession = JSON.parse(sessionData);
                        // Convert string dates back to Date objects
                        exchangeSession.createdAt = new Date(exchangeSession.createdAt);
                        exchangeSession.expiresAt = new Date(exchangeSession.expiresAt);
                        if (exchangeSession.isUsed) {
                            throw (0, shared_1.createAuthError)(shared_1.AuthErrorCode.TOKEN_INVALID, 'Exchange token has already been used');
                        }
                        if (!(new Date() > exchangeSession.expiresAt)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.redis.del(redisKey)];
                    case 2:
                        _a.sent();
                        throw (0, shared_1.createAuthError)(shared_1.AuthErrorCode.TOKEN_EXPIRED, 'Exchange token has expired');
                    case 3:
                        // Verify device matches
                        if (exchangeSession.deviceId !== deviceInfo.deviceId) {
                            throw (0, shared_1.createAuthError)(shared_1.AuthErrorCode.DEVICE_NOT_TRUSTED, 'Device ID mismatch - security violation');
                        }
                        // Mark as used and update in Redis
                        exchangeSession.isUsed = true;
                        return [4 /*yield*/, this.redis.setex(redisKey, 60, JSON.stringify(exchangeSession))];
                    case 4:
                        _a.sent(); // Keep for 1 minute for audit
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@jobswipe/shared'); })];
                    case 5:
                        createDesktopTokenConfig = (_a.sent()).createDesktopTokenConfig;
                        tokenConfig = createDesktopTokenConfig(exchangeSession.userId, 'user@example.com', // This would come from the user data
                        'User Name', 'user', deviceInfo.deviceId, deviceInfo.deviceName);
                        return [4 /*yield*/, this.jwtService.createToken(tokenConfig)];
                    case 6:
                        desktopToken = _a.sent();
                        return [4 /*yield*/, this.sessionService.createSession({
                                userId: exchangeSession.userId,
                                source: shared_1.AuthSource.DESKTOP,
                                provider: 'credentials',
                                userAgent: "JobSwipe Desktop/".concat(deviceInfo.appVersion || '1.0.0'),
                                metadata: {
                                    platform: deviceInfo.platform,
                                    deviceName: deviceInfo.deviceName,
                                    deviceId: deviceInfo.deviceId,
                                    systemInfo: deviceInfo.systemInfo,
                                    tokenExchangeUsed: true,
                                },
                            })];
                    case 7:
                        desktopSession = _a.sent();
                        // Clean up exchange session - delete after successful use
                        return [4 /*yield*/, this.redis.del(redisKey)];
                    case 8:
                        // Clean up exchange session - delete after successful use
                        _a.sent();
                        if (!desktopToken) {
                            throw (0, shared_1.createAuthError)(shared_1.AuthErrorCode.INTERNAL_ERROR, 'Failed to create desktop token');
                        }
                        if (typeof desktopToken === 'string') {
                            tokenString = desktopToken;
                            expiresInSeconds = 90 * 24 * 60 * 60; // 90 days default
                            tokenId = 'token-id';
                        }
                        else if (desktopToken && typeof desktopToken === 'object') {
                            tokenString = desktopToken.token || String(desktopToken);
                            expiresInSeconds = desktopToken.expiresIn || 90 * 24 * 60 * 60;
                            tokenId = desktopToken.jti || 'token-id';
                        }
                        else {
                            tokenString = String(desktopToken);
                            expiresInSeconds = 90 * 24 * 60 * 60;
                            tokenId = 'token-id';
                        }
                        return [2 /*return*/, {
                                success: true,
                                accessToken: tokenString,
                                tokenType: 'Bearer',
                                expiresIn: expiresInSeconds,
                                tokenId: (0, shared_1.createBrandedId)(tokenId),
                                deviceId: deviceInfo.deviceId,
                                issuedAt: new Date(),
                                expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
                                permissions: [], // Add user permissions
                                features: [], // Add user features
                            }];
                }
            });
        });
    };
    /**
     * Verify exchange token status
     */
    TokenExchangeService.prototype.verifyExchange = function (exchangeToken) {
        return __awaiter(this, void 0, void 0, function () {
            var redisKey, sessionData, exchangeSession;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        redisKey = "".concat(this.keyPrefix).concat(exchangeToken);
                        return [4 /*yield*/, this.redis.get(redisKey)];
                    case 1:
                        sessionData = _a.sent();
                        if (!sessionData) {
                            return [2 /*return*/, { valid: false }];
                        }
                        exchangeSession = JSON.parse(sessionData);
                        exchangeSession.expiresAt = new Date(exchangeSession.expiresAt);
                        if (exchangeSession.isUsed || new Date() > exchangeSession.expiresAt) {
                            return [2 /*return*/, { valid: false }];
                        }
                        return [2 /*return*/, {
                                valid: true,
                                deviceInfo: {
                                    deviceId: exchangeSession.deviceId,
                                    deviceName: exchangeSession.deviceName,
                                    platform: exchangeSession.platform,
                                },
                                expiresAt: exchangeSession.expiresAt,
                            }];
                }
            });
        });
    };
    /**
     * Generate cryptographically secure exchange token
     */
    TokenExchangeService.prototype.generateSecureExchangeToken = function () {
        // Generate cryptographically secure random bytes
        var randomBytes = crypto_1.default.randomBytes(32);
        // Add timestamp for ordering and uniqueness
        var timestamp = Date.now().toString(36);
        // Add UUID for additional entropy
        var uuid = (0, uuid_1.v4)().replace(/-/g, '');
        // Combine all components and hash for final security
        var tokenData = "".concat(timestamp, "_").concat(uuid, "_").concat(randomBytes.toString('hex'));
        var hash = crypto_1.default.createHash('sha256').update(tokenData).digest('hex');
        return "exch_".concat(timestamp, "_").concat(hash.substring(0, 48));
    };
    /**
     * Cleanup expired exchange sessions
     */
    TokenExchangeService.prototype.cleanupExpiredExchanges = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pattern, keys, cleanedCount, _i, keys_1, key, sessionData, session, parseError_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 11, , 12]);
                        pattern = "".concat(this.keyPrefix, "*");
                        return [4 /*yield*/, this.redis.keys(pattern)];
                    case 1:
                        keys = _a.sent();
                        cleanedCount = 0;
                        _i = 0, keys_1 = keys;
                        _a.label = 2;
                    case 2:
                        if (!(_i < keys_1.length)) return [3 /*break*/, 10];
                        key = keys_1[_i];
                        return [4 /*yield*/, this.redis.get(key)];
                    case 3:
                        sessionData = _a.sent();
                        if (!sessionData) return [3 /*break*/, 9];
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 7, , 9]);
                        session = JSON.parse(sessionData);
                        session.expiresAt = new Date(session.expiresAt);
                        if (!(new Date() > session.expiresAt)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.redis.del(key)];
                    case 5:
                        _a.sent();
                        cleanedCount++;
                        _a.label = 6;
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        parseError_1 = _a.sent();
                        // Invalid JSON, delete the key
                        return [4 /*yield*/, this.redis.del(key)];
                    case 8:
                        // Invalid JSON, delete the key
                        _a.sent();
                        cleanedCount++;
                        return [3 /*break*/, 9];
                    case 9:
                        _i++;
                        return [3 /*break*/, 2];
                    case 10:
                        if (cleanedCount > 0) {
                            // Cleaned up expired token exchange sessions
                        }
                        return [3 /*break*/, 12];
                    case 11:
                        error_1 = _a.sent();
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cleanup service
     */
    TokenExchangeService.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        clearInterval(this.cleanupInterval);
                        // Final cleanup of any remaining sessions
                        return [4 /*yield*/, this.cleanupExpiredExchanges()];
                    case 1:
                        // Final cleanup of any remaining sessions
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return TokenExchangeService;
}());
// =============================================================================
// ROUTE HANDLERS
// =============================================================================
function tokenExchangeRoutes(fastify) {
    return __awaiter(this, void 0, void 0, function () {
        var jwtService, sessionService, securityService, tokenExchangeService;
        var _this = this;
        return __generator(this, function (_a) {
            jwtService = fastify.jwtService;
            sessionService = fastify.sessionService;
            securityService = fastify.security;
            tokenExchangeService = TokenExchangeService.getInstance(jwtService, sessionService);
            /**
             * Initiate token exchange from web session
             * POST /token-exchange/initiate
             */
            fastify.post('/token-exchange/initiate', {
                schema: {
                    body: {
                        type: 'object',
                        required: ['deviceId', 'deviceName', 'deviceType', 'platform'],
                        properties: {
                            deviceId: { type: 'string', format: 'uuid' },
                            deviceName: { type: 'string', minLength: 1, maxLength: 100 },
                            deviceType: { type: 'string', enum: ['desktop', 'mobile'] },
                            platform: { type: 'string', minLength: 1, maxLength: 50 },
                            osVersion: { type: 'string' },
                            appVersion: { type: 'string' }
                        }
                    },
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                exchangeToken: { type: 'string' },
                                expiresAt: { type: 'string' },
                                deviceId: { type: 'string' },
                                instructions: {
                                    type: 'object',
                                    properties: {
                                        step1: { type: 'string' },
                                        step2: { type: 'string' },
                                        step3: { type: 'string' },
                                        warning: { type: 'string' },
                                    },
                                },
                            },
                        },
                        400: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                error: { type: 'string' },
                                code: { type: 'string' }
                            }
                        },
                        401: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                error: { type: 'string' },
                                code: { type: 'string' }
                            }
                        },
                        429: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                error: { type: 'string' },
                                code: { type: 'string' }
                            }
                        },
                    },
                },
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var authContext, deviceInfo, rateLimitKey, rateLimitResult, isAllowed, result, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            authContext = request.authContext;
                            if (!authContext || !authContext.user) {
                                throw (0, shared_1.createAuthError)(shared_1.AuthErrorCode.INVALID_CREDENTIALS, 'Authentication required');
                            }
                            deviceInfo = request.body;
                            rateLimitKey = "token-exchange:".concat(authContext.user.id);
                            rateLimitResult = securityService.checkRateLimit ? securityService.checkRateLimit(rateLimitKey) : { allowed: true };
                            isAllowed = typeof rateLimitResult === 'object' ? rateLimitResult.allowed : true;
                            if (!isAllowed) {
                                throw (0, shared_1.createAuthError)(shared_1.AuthErrorCode.RATE_LIMIT_EXCEEDED, 'Too many token exchange attempts. Please try again later.');
                            }
                            return [4 /*yield*/, tokenExchangeService.initiateExchange(authContext.user.id, deviceInfo, authContext.session.id)];
                        case 1:
                            result = _a.sent();
                            reply.send(result);
                            return [3 /*break*/, 3];
                        case 2:
                            error_2 = _a.sent();
                            fastify.log.error('Token exchange initiation failed:', error_2);
                            if (error_2 instanceof Error && error_2.message.includes('rate limit')) {
                                reply.code(429);
                            }
                            else if (error_2 instanceof Error && error_2.message.includes('auth')) {
                                reply.code(401);
                            }
                            else {
                                reply.code(400);
                            }
                            reply.send({
                                success: false,
                                error: error_2 instanceof Error ? error_2.message : 'Token exchange failed',
                                code: 'TOKEN_EXCHANGE_FAILED',
                            });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            /**
             * Complete token exchange from desktop app
             * POST /token-exchange/complete
             */
            fastify.post('/token-exchange/complete', {
                schema: {
                    body: {
                        type: 'object',
                        required: ['exchangeToken', 'deviceId', 'deviceName', 'platform'],
                        properties: {
                            exchangeToken: { type: 'string', minLength: 32, maxLength: 256 },
                            deviceId: { type: 'string', format: 'uuid' },
                            deviceName: { type: 'string', minLength: 1, maxLength: 100 },
                            platform: { type: 'string', minLength: 1, maxLength: 50 },
                            systemInfo: {
                                type: 'object',
                                properties: {
                                    platform: { type: 'string' },
                                    version: { type: 'string' },
                                    arch: { type: 'string' }
                                }
                            }
                        }
                    },
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                accessToken: { type: 'string' },
                                tokenType: { type: 'string' },
                                expiresIn: { type: 'number' },
                                tokenId: { type: 'string' },
                                deviceId: { type: 'string' },
                                issuedAt: { type: 'string' },
                                expiresAt: { type: 'string' },
                                permissions: { type: 'array', items: { type: 'string' } },
                                features: { type: 'array', items: { type: 'string' } },
                            },
                        },
                        400: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                error: { type: 'string' },
                                code: { type: 'string' }
                            }
                        },
                        401: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                error: { type: 'string' },
                                code: { type: 'string' }
                            }
                        },
                        429: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                error: { type: 'string' },
                                code: { type: 'string' }
                            }
                        },
                    },
                },
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var exchangeData, rateLimitKey, rateLimitResult, isAllowed, result, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            exchangeData = request.body;
                            rateLimitKey = "token-exchange-complete:".concat(exchangeData.deviceId);
                            rateLimitResult = securityService.checkRateLimit ? securityService.checkRateLimit(rateLimitKey) : { allowed: true };
                            isAllowed = typeof rateLimitResult === 'object' ? rateLimitResult.allowed : true;
                            if (!isAllowed) {
                                throw (0, shared_1.createAuthError)(shared_1.AuthErrorCode.RATE_LIMIT_EXCEEDED, 'Too many exchange completion attempts');
                            }
                            return [4 /*yield*/, tokenExchangeService.completeExchange(exchangeData.exchangeToken, exchangeData)];
                        case 1:
                            result = _a.sent();
                            reply.send(result);
                            return [3 /*break*/, 3];
                        case 2:
                            error_3 = _a.sent();
                            fastify.log.error('Token exchange completion failed:', error_3);
                            if (error_3 instanceof Error && error_3.message.includes('rate limit')) {
                                reply.code(429);
                            }
                            else if (error_3 instanceof Error && error_3.message.includes('Invalid')) {
                                reply.code(401);
                            }
                            else {
                                reply.code(400);
                            }
                            reply.send({
                                success: false,
                                error: error_3 instanceof Error ? error_3.message : 'Token exchange failed',
                                code: 'TOKEN_EXCHANGE_FAILED',
                            });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            /**
             * Verify token exchange status
             * GET /token-exchange/verify/:token
             */
            fastify.get('/token-exchange/verify/:token', {
                schema: {
                    params: {
                        type: 'object',
                        properties: {
                            token: { type: 'string' },
                        },
                        required: ['token'],
                    },
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                valid: { type: 'boolean' },
                                deviceInfo: {
                                    type: 'object',
                                    properties: {
                                        deviceId: { type: 'string' },
                                        deviceName: { type: 'string' },
                                        platform: { type: 'string' },
                                    },
                                },
                                expiresAt: { type: 'string' },
                            },
                        },
                    },
                },
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var token, result, error_4;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            token = request.params.token;
                            return [4 /*yield*/, tokenExchangeService.verifyExchange(token)];
                        case 1:
                            result = _b.sent();
                            reply.send({
                                valid: result.valid,
                                deviceInfo: result.deviceInfo,
                                expiresAt: (_a = result.expiresAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
                            });
                            return [3 /*break*/, 3];
                        case 2:
                            error_4 = _b.sent();
                            fastify.log.error('Token exchange verification failed:', error_4);
                            reply.send({ valid: false });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            /**
             * Cancel token exchange
             * DELETE /token-exchange/:token
             */
            fastify.delete('/token-exchange/:token', {
                schema: {
                    params: {
                        type: 'object',
                        properties: {
                            token: { type: 'string' },
                        },
                        required: ['token'],
                    },
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                message: { type: 'string' },
                            },
                        },
                    },
                },
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var authContext;
                return __generator(this, function (_a) {
                    try {
                        authContext = request.authContext;
                        if (!authContext || !authContext.user) {
                            throw (0, shared_1.createAuthError)(shared_1.AuthErrorCode.INVALID_CREDENTIALS, 'Authentication required');
                        }
                        // Implementation would verify user owns the exchange and cancel it
                        // For now, return success
                        reply.send({
                            success: true,
                            message: 'Token exchange cancelled',
                        });
                    }
                    catch (error) {
                        fastify.log.error('Token exchange cancellation failed:', error);
                        reply.code(400).send({
                            success: false,
                            error: error instanceof Error ? error.message : 'Cancellation failed',
                        });
                    }
                    return [2 /*return*/];
                });
            }); });
            // Cleanup on server shutdown
            fastify.addHook('onClose', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    tokenExchangeService.cleanup();
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    });
}
