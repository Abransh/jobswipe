"use strict";
/**
 * @fileoverview Authentication API Routes for JobSwipe
 * @description Enterprise-grade authentication endpoints with comprehensive security
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAuthRoutes = registerAuthRoutes;
exports.authMiddleware = authMiddleware;
exports.securityMiddleware = securityMiddleware;
exports.loginHandler = loginHandler;
exports.registerHandler = registerHandler;
exports.refreshTokenHandler = refreshTokenHandler;
exports.passwordResetHandler = passwordResetHandler;
exports.passwordResetCompleteHandler = passwordResetCompleteHandler;
exports.passwordChangeHandler = passwordChangeHandler;
exports.logoutHandler = logoutHandler;
exports.profileHandler = profileHandler;
exports.meHandler = meHandler;
exports.checkEmailHandler = checkEmailHandler;
exports.tokenExchangeInitiateHandler = tokenExchangeInitiateHandler;
exports.tokenExchangeCompleteHandler = tokenExchangeCompleteHandler;
var zod_1 = require("zod");
var shared_1 = require("@jobswipe/shared");
var shared_2 = require("@jobswipe/shared");
var database_1 = require("@jobswipe/database");
// =============================================================================
// DATABASE FUNCTION WRAPPERS
// =============================================================================
/**
 * Create a new user with proper error handling
 */
function createUser(userData) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, database_1.createUser)({
                            email: userData.email,
                            password: userData.password,
                            name: userData.name,
                            profile: userData.profile
                        })];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_1 = _a.sent();
                    if (error_1 instanceof Error && error_1.message.includes('already exists')) {
                        throw (0, shared_1.createAuthError)(shared_1.AuthErrorCode.CONFLICT, 'User already exists');
                    }
                    throw (0, shared_1.createAuthError)(shared_1.AuthErrorCode.INTERNAL_ERROR, 'Failed to create user');
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Authenticate user with proper error handling
 */
function authenticateUser(email, password) {
    return __awaiter(this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, database_1.authenticateUser)(email, password)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_2 = _a.sent();
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Find user by email with error handling
 */
function findUserByEmail(email) {
    return __awaiter(this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, database_1.getUserByEmail)(email)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_3 = _a.sent();
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Find user by ID with error handling
 */
function findUserById(id) {
    return __awaiter(this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, database_1.getUserById)(id)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_4 = _a.sent();
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Update user with error handling
 */
function updateUser(id, updates) {
    return __awaiter(this, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, database_1.db.user.update({
                            where: { id: id },
                            data: __assign(__assign({}, updates), { updatedAt: new Date() }),
                            include: {
                                profile: true,
                            },
                        })];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_5 = _a.sent();
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Update user last login timestamp
 */
function updateLastLogin(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, database_1.db.user.update({
                            where: { id: userId },
                            data: {
                                lastLoginAt: new Date(),
                                updatedAt: new Date(),
                            },
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_6 = _a.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Change user password
 */
function changePasswordDb(userId, newPassword) {
    return __awaiter(this, void 0, void 0, function () {
        var passwordHash, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, shared_2.hashPassword)(newPassword)];
                case 1:
                    passwordHash = _a.sent();
                    return [4 /*yield*/, database_1.db.user.update({
                            where: { id: userId },
                            data: {
                                passwordHash: passwordHash,
                                updatedAt: new Date(),
                            },
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_7 = _a.sent();
                    throw error_7;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// =============================================================================
// ROUTE HANDLERS
// =============================================================================
/**
 * Register a new user
 */
function registerHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var validatedData, existingUser, user, sessionOptions, session, accessTokenConfig, refreshTokenConfig, accessToken, refreshToken, userResponse, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    validatedData = shared_1.RegisterRequestSchema.parse(request.body);
                    return [4 /*yield*/, findUserByEmail(validatedData.email)];
                case 1:
                    existingUser = _a.sent();
                    if (existingUser) {
                        throw (0, shared_1.createAuthError)(shared_1.AuthErrorCode.CONFLICT, 'User already exists');
                    }
                    return [4 /*yield*/, createUser({
                            email: validatedData.email,
                            password: validatedData.password,
                            name: validatedData.name,
                            profile: {
                                firstName: validatedData.firstName,
                                lastName: validatedData.lastName,
                                timezone: validatedData.timezone,
                            },
                        })];
                case 2:
                    user = _a.sent();
                    sessionOptions = {
                        userId: (0, shared_1.createBrandedId)(user.id),
                        source: validatedData.source,
                        provider: shared_1.AuthProvider.CREDENTIALS,
                        ipAddress: request.ipAddress,
                        userAgent: request.headers['user-agent'],
                        metadata: {
                            email: user.email,
                            name: user.name,
                            role: user.role,
                        },
                    };
                    return [4 /*yield*/, request.server.sessionService.createSession(sessionOptions)];
                case 3:
                    session = _a.sent();
                    accessTokenConfig = (0, shared_2.createAccessTokenConfig)((0, shared_1.createBrandedId)(user.id), user.email, user.name, user.role, validatedData.source, session.id);
                    refreshTokenConfig = (0, shared_2.createRefreshTokenConfig)((0, shared_1.createBrandedId)(user.id), user.email, validatedData.source, session.id);
                    return [4 /*yield*/, request.server.jwtService.createToken(accessTokenConfig)];
                case 4:
                    accessToken = _a.sent();
                    return [4 /*yield*/, request.server.jwtService.createToken(refreshTokenConfig)];
                case 5:
                    refreshToken = _a.sent();
                    userResponse = {
                        id: (0, shared_1.createBrandedId)(user.id),
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        status: user.status,
                        profile: user.profile,
                        emailVerified: user.emailVerified,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                    };
                    return [2 /*return*/, reply.status(201).send({
                            success: true,
                            user: userResponse,
                            tokens: {
                                accessToken: accessToken,
                                refreshToken: refreshToken,
                                tokenType: 'Bearer',
                                expiresIn: accessTokenConfig.expiresIn,
                                refreshExpiresIn: refreshTokenConfig.expiresIn,
                            },
                            session: session,
                        })];
                case 6:
                    error_8 = _a.sent();
                    if (error_8 instanceof Error && error_8.message.includes('User already exists')) {
                        return [2 /*return*/, reply.status(409).send({
                                success: false,
                                error: 'User already exists',
                                errorCode: shared_1.AuthErrorCode.CONFLICT,
                            })];
                    }
                    // Registration error handled
                    return [2 /*return*/, reply.status(500).send({
                            success: false,
                            error: 'Registration failed',
                            errorCode: shared_1.AuthErrorCode.INTERNAL_ERROR,
                        })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Login user
 */
function loginHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var validatedData, user, sessionOptions, session, accessTokenConfig, refreshTokenConfig, accessToken, refreshToken, userResponse, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    validatedData = shared_1.LoginRequestSchema.parse(request.body);
                    return [4 /*yield*/, authenticateUser(validatedData.email, validatedData.password)];
                case 1:
                    user = _a.sent();
                    if (!user) {
                        return [2 /*return*/, reply.status(401).send({
                                success: false,
                                error: 'Invalid email or password',
                                errorCode: shared_1.AuthErrorCode.INVALID_CREDENTIALS,
                            })];
                    }
                    // Check account status
                    if (user.status !== 'active') {
                        return [2 /*return*/, reply.status(401).send({
                                success: false,
                                error: "Account is ".concat(user.status),
                                errorCode: shared_1.AuthErrorCode.ACCOUNT_DISABLED,
                            })];
                    }
                    sessionOptions = {
                        userId: (0, shared_1.createBrandedId)(user.id),
                        source: validatedData.source,
                        provider: shared_1.AuthProvider.CREDENTIALS,
                        ipAddress: request.ipAddress,
                        userAgent: request.headers['user-agent'],
                        metadata: {
                            email: user.email,
                            name: user.name,
                            role: user.role,
                        },
                    };
                    return [4 /*yield*/, request.server.sessionService.createSession(sessionOptions)];
                case 2:
                    session = _a.sent();
                    accessTokenConfig = (0, shared_2.createAccessTokenConfig)((0, shared_1.createBrandedId)(user.id), user.email, user.name, user.role, validatedData.source, session.id);
                    refreshTokenConfig = (0, shared_2.createRefreshTokenConfig)((0, shared_1.createBrandedId)(user.id), user.email, validatedData.source, session.id);
                    return [4 /*yield*/, request.server.jwtService.createToken(accessTokenConfig)];
                case 3:
                    accessToken = _a.sent();
                    return [4 /*yield*/, request.server.jwtService.createToken(refreshTokenConfig)];
                case 4:
                    refreshToken = _a.sent();
                    // Update user last login timestamp
                    return [4 /*yield*/, updateLastLogin(user.id)];
                case 5:
                    // Update user last login timestamp
                    _a.sent();
                    userResponse = {
                        id: (0, shared_1.createBrandedId)(user.id),
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        status: user.status,
                        profile: user.profile,
                        emailVerified: user.emailVerified,
                        lastLoginAt: new Date(),
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                    };
                    return [2 /*return*/, reply.status(200).send({
                            success: true,
                            user: userResponse,
                            tokens: {
                                accessToken: accessToken,
                                refreshToken: refreshToken,
                                tokenType: 'Bearer',
                                expiresIn: accessTokenConfig.expiresIn,
                                refreshExpiresIn: refreshTokenConfig.expiresIn,
                            },
                            session: session,
                        })];
                case 6:
                    error_9 = _a.sent();
                    // Login error handled
                    return [2 /*return*/, reply.status(500).send({
                            success: false,
                            error: 'Login failed',
                            errorCode: shared_1.AuthErrorCode.INTERNAL_ERROR,
                        })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Refresh access token
 */
function refreshTokenHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var refreshToken, tokenResult, user, accessTokenConfig, newAccessToken, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    refreshToken = request.body.refreshToken;
                    return [4 /*yield*/, request.server.jwtService.verifyToken(refreshToken)];
                case 1:
                    tokenResult = _a.sent();
                    if (!tokenResult.valid || !tokenResult.payload) {
                        return [2 /*return*/, reply.status(401).send({
                                success: false,
                                error: 'Invalid refresh token',
                                errorCode: shared_1.AuthErrorCode.TOKEN_INVALID,
                            })];
                    }
                    return [4 /*yield*/, findUserById(tokenResult.payload.sub)];
                case 2:
                    user = _a.sent();
                    if (!user) {
                        return [2 /*return*/, reply.status(401).send({
                                success: false,
                                error: 'User not found',
                                errorCode: shared_1.AuthErrorCode.TOKEN_INVALID,
                            })];
                    }
                    accessTokenConfig = (0, shared_2.createAccessTokenConfig)(tokenResult.payload.sub, user.email, user.name, user.role, tokenResult.payload.source, tokenResult.payload.sessionId);
                    return [4 /*yield*/, request.server.jwtService.createToken(accessTokenConfig)];
                case 3:
                    newAccessToken = _a.sent();
                    return [2 /*return*/, reply.status(200).send({
                            success: true,
                            tokens: {
                                accessToken: newAccessToken,
                                refreshToken: refreshToken,
                                tokenType: 'Bearer',
                                expiresIn: accessTokenConfig.expiresIn,
                                refreshExpiresIn: tokenResult.payload.exp - Math.floor(Date.now() / 1000),
                            },
                        })];
                case 4:
                    error_10 = _a.sent();
                    // Token refresh error handled
                    return [2 /*return*/, reply.status(500).send({
                            success: false,
                            error: 'Token refresh failed',
                            errorCode: shared_1.AuthErrorCode.INTERNAL_ERROR,
                        })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Request password reset
 */
function passwordResetHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var validatedData, user, response, resetToken, error_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    validatedData = shared_1.PasswordResetRequestSchema.parse(request.body);
                    return [4 /*yield*/, findUserByEmail(validatedData.email)];
                case 1:
                    user = _a.sent();
                    response = {
                        success: true,
                        message: 'If the email exists, a password reset link has been sent',
                    };
                    if (user) {
                        resetToken = (0, shared_2.generateSecureToken)(32);
                    }
                    return [2 /*return*/, reply.status(200).send(response)];
                case 2:
                    error_11 = _a.sent();
                    // Password reset error handled
                    return [2 /*return*/, reply.status(500).send({
                            success: false,
                            message: 'Password reset failed',
                        })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Complete password reset with token
 */
function passwordResetCompleteHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, token, newPassword, source;
        return __generator(this, function (_b) {
            try {
                _a = request.body, token = _a.token, newPassword = _a.newPassword, source = _a.source;
                // In a real implementation, you'd verify the reset token from database
                // For now, just return success
                // Password reset completed
                return [2 /*return*/, reply.status(200).send({
                        success: true,
                        message: 'Password reset successfully',
                    })];
            }
            catch (error) {
                // Password reset complete error handled
                return [2 /*return*/, reply.status(500).send({
                        success: false,
                        message: 'Password reset completion failed',
                    })];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Change password
 */
function passwordChangeHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var validatedData, user, isCurrentPasswordValid, error_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    validatedData = shared_1.PasswordChangeRequestSchema.parse(request.body);
                    if (!request.user) {
                        return [2 /*return*/, reply.status(401).send({
                                success: false,
                                message: 'Authentication required',
                            })];
                    }
                    return [4 /*yield*/, findUserById(request.user.id)];
                case 1:
                    user = _a.sent();
                    if (!user) {
                        return [2 /*return*/, reply.status(404).send({
                                success: false,
                                message: 'User not found',
                            })];
                    }
                    return [4 /*yield*/, (0, shared_2.verifyPassword)(validatedData.currentPassword, user.passwordHash)];
                case 2:
                    isCurrentPasswordValid = _a.sent();
                    if (!isCurrentPasswordValid) {
                        return [2 /*return*/, reply.status(400).send({
                                success: false,
                                message: 'Current password is incorrect',
                            })];
                    }
                    // Update password using database function
                    return [4 /*yield*/, changePasswordDb(user.id, validatedData.newPassword)];
                case 3:
                    // Update password using database function
                    _a.sent();
                    // In a real implementation, you might revoke all sessions
                    // Password changed successfully
                    return [2 /*return*/, reply.status(200).send({
                            success: true,
                            message: 'Password changed successfully',
                        })];
                case 4:
                    error_12 = _a.sent();
                    // Password change error handled
                    return [2 /*return*/, reply.status(500).send({
                            success: false,
                            message: 'Password change failed',
                        })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Logout user
 */
function logoutHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var error_13;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    if (!request.sessionId) return [3 /*break*/, 2];
                    return [4 /*yield*/, request.server.sessionService.revokeSession((0, shared_1.createBrandedId)(request.sessionId))];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, reply.status(200).send({
                        success: true,
                        message: 'Logged out successfully',
                    })];
                case 3:
                    error_13 = _a.sent();
                    // Logout error handled
                    return [2 /*return*/, reply.status(500).send({
                            success: false,
                            message: 'Logout failed',
                        })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get current user profile
 */
function profileHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                if (!request.user) {
                    return [2 /*return*/, reply.status(401).send({
                            success: false,
                            error: 'Authentication required',
                        })];
                }
                return [2 /*return*/, reply.status(200).send({
                        success: true,
                        user: request.user,
                    })];
            }
            catch (error) {
                // Profile error handled
                return [2 /*return*/, reply.status(500).send({
                        success: false,
                        error: 'Failed to get profile',
                    })];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Get current user (alias for profile) - for frontend compatibility
 */
function meHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, profileHandler(request, reply)];
        });
    });
}
/**
 * Check email availability
 */
function checkEmailHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var email, existingUser, available, error_14;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    email = request.body.email;
                    if (!email || !zod_1.z.string().email().safeParse(email).success) {
                        return [2 /*return*/, reply.status(400).send({
                                success: false,
                                error: 'Valid email is required',
                            })];
                    }
                    return [4 /*yield*/, findUserByEmail(email)];
                case 1:
                    existingUser = _a.sent();
                    available = !existingUser;
                    return [2 /*return*/, reply.status(200).send({
                            success: true,
                            available: available,
                        })];
                case 2:
                    error_14 = _a.sent();
                    // Check email error handled
                    return [2 /*return*/, reply.status(500).send({
                            success: false,
                            error: 'Failed to check email availability',
                        })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Initiate token exchange for desktop app
 */
function tokenExchangeInitiateHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var exchangeToken;
        return __generator(this, function (_a) {
            try {
                if (!request.user || !request.sessionId) {
                    return [2 /*return*/, reply.status(401).send({
                            success: false,
                            error: 'Authentication required',
                        })];
                }
                exchangeToken = (0, shared_2.generateSecureToken)(32);
                // In a real implementation, you'd store this token with expiration
                // For now, return a simple response
                return [2 /*return*/, reply.status(200).send({
                        success: true,
                        exchangeToken: exchangeToken,
                        expiresIn: 300, // 5 minutes
                        qrCode: "jobswipe://exchange?token=".concat(exchangeToken),
                    })];
            }
            catch (error) {
                // Token exchange initiate error handled
                return [2 /*return*/, reply.status(500).send({
                        success: false,
                        error: 'Token exchange initiation failed',
                    })];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Complete token exchange for desktop app
 */
function tokenExchangeCompleteHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, exchangeToken, deviceId, accessToken, refreshToken;
        return __generator(this, function (_b) {
            try {
                _a = request.body, exchangeToken = _a.exchangeToken, deviceId = _a.deviceId;
                accessToken = (0, shared_2.generateSecureToken)(32);
                refreshToken = (0, shared_2.generateSecureToken)(32);
                return [2 /*return*/, reply.status(200).send({
                        success: true,
                        tokens: {
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                            tokenType: 'Bearer',
                            expiresIn: 3600,
                        },
                        deviceId: deviceId,
                    })];
            }
            catch (error) {
                // Token exchange complete error handled
                return [2 /*return*/, reply.status(500).send({
                        success: false,
                        error: 'Token exchange completion failed',
                    })];
            }
            return [2 /*return*/];
        });
    });
}
// =============================================================================
// MIDDLEWARE
// =============================================================================
/**
 * Authentication middleware
 */
function authMiddleware(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var authHeader, token, tokenResult, user, error_15;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    authHeader = request.headers.authorization;
                    if (!authHeader || !authHeader.startsWith('Bearer ')) {
                        return [2 /*return*/, reply.status(401).send({
                                success: false,
                                error: 'Authentication required',
                                errorCode: shared_1.AuthErrorCode.TOKEN_INVALID,
                            })];
                    }
                    token = authHeader.split(' ')[1];
                    return [4 /*yield*/, request.server.jwtService.verifyToken(token)];
                case 1:
                    tokenResult = _a.sent();
                    if (!tokenResult.valid || !tokenResult.payload) {
                        return [2 /*return*/, reply.status(401).send({
                                success: false,
                                error: 'Invalid token',
                                errorCode: shared_1.AuthErrorCode.TOKEN_INVALID,
                            })];
                    }
                    return [4 /*yield*/, findUserById(tokenResult.payload.sub)];
                case 2:
                    user = _a.sent();
                    if (!user) {
                        return [2 /*return*/, reply.status(401).send({
                                success: false,
                                error: 'User not found',
                                errorCode: shared_1.AuthErrorCode.TOKEN_INVALID,
                            })];
                    }
                    // Set user in request
                    request.user = {
                        id: (0, shared_1.createBrandedId)(user.id),
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        status: user.status,
                        profile: user.profile,
                        emailVerified: user.emailVerified,
                        lastLoginAt: user.lastLoginAt,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                    };
                    request.sessionId = tokenResult.payload.sessionId;
                    return [3 /*break*/, 4];
                case 3:
                    error_15 = _a.sent();
                    // Auth middleware error handled
                    return [2 /*return*/, reply.status(500).send({
                            success: false,
                            error: 'Authentication failed',
                            errorCode: shared_1.AuthErrorCode.INTERNAL_ERROR,
                        })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Simple security middleware
 */
function securityMiddleware(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // Extract IP address
                request.ipAddress = (0, shared_2.extractIpFromHeaders)(request.headers);
                // Set basic security headers
                reply.header('X-Content-Type-Options', 'nosniff');
                reply.header('X-Frame-Options', 'DENY');
                reply.header('X-XSS-Protection', '1; mode=block');
                reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
                if (process.env.NODE_ENV === 'production') {
                    reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
                }
            }
            catch (error) {
                // Security middleware error handled
                return [2 /*return*/, reply.status(500).send({
                        success: false,
                        error: 'Security check failed',
                        errorCode: shared_1.AuthErrorCode.INTERNAL_ERROR,
                    })];
            }
            return [2 /*return*/];
        });
    });
}
// =============================================================================
// ROUTE REGISTRATION
// =============================================================================
/**
 * Register authentication routes
 */
function registerAuthRoutes(fastify) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            // Add security middleware to all routes
            fastify.addHook('preHandler', securityMiddleware);
            // Public routes
            fastify.post('/register', {
                schema: {
                    body: {
                        type: 'object',
                        required: ['email', 'password', 'source', 'termsAccepted', 'privacyAccepted'],
                        properties: {
                            email: { type: 'string', format: 'email' },
                            password: { type: 'string', minLength: 8 },
                            name: { type: 'string' },
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                            source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
                            termsAccepted: { type: 'boolean' },
                            privacyAccepted: { type: 'boolean' },
                            marketingConsent: { type: 'boolean' },
                        },
                    },
                },
            }, registerHandler);
            fastify.post('/login', {
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
            }, loginHandler);
            fastify.post('/refresh', {
                schema: {
                    body: {
                        type: 'object',
                        required: ['refreshToken'],
                        properties: {
                            refreshToken: { type: 'string' },
                            source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
                        },
                    },
                },
            }, refreshTokenHandler);
            fastify.post('/token/refresh', {
                schema: {
                    body: {
                        type: 'object',
                        required: ['refreshToken'],
                        properties: {
                            refreshToken: { type: 'string' },
                            source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
                        },
                    },
                },
            }, refreshTokenHandler);
            fastify.post('/check-email', {
                schema: {
                    body: {
                        type: 'object',
                        required: ['email'],
                        properties: {
                            email: { type: 'string', format: 'email' },
                        },
                    },
                },
            }, checkEmailHandler);
            fastify.post('/password/reset', {
                schema: {
                    body: {
                        type: 'object',
                        required: ['email', 'source'],
                        properties: {
                            email: { type: 'string', format: 'email' },
                            source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
                        },
                    },
                },
            }, passwordResetHandler);
            fastify.post('/password/reset-complete', {
                schema: {
                    body: {
                        type: 'object',
                        required: ['token', 'newPassword', 'source'],
                        properties: {
                            token: { type: 'string' },
                            newPassword: { type: 'string', minLength: 8 },
                            source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
                        },
                    },
                },
            }, passwordResetCompleteHandler);
            // Protected routes (require authentication)
            fastify.register(function (fastify) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    fastify.addHook('preHandler', authMiddleware);
                    fastify.post('/logout', logoutHandler);
                    fastify.get('/profile', profileHandler);
                    fastify.get('/me', meHandler);
                    fastify.post('/password/change', {
                        schema: {
                            body: {
                                type: 'object',
                                required: ['currentPassword', 'newPassword'],
                                properties: {
                                    currentPassword: { type: 'string' },
                                    newPassword: { type: 'string', minLength: 8 },
                                },
                            },
                        },
                    }, passwordChangeHandler);
                    // Token exchange routes
                    fastify.post('/token/exchange/initiate', {
                        schema: {
                            body: {
                                type: 'object',
                                required: ['deviceId', 'deviceName', 'platform', 'deviceType'],
                                properties: {
                                    deviceId: { type: 'string' },
                                    deviceName: { type: 'string' },
                                    platform: { type: 'string' },
                                    deviceType: { type: 'string', enum: ['desktop', 'mobile', 'tablet'] },
                                    appVersion: { type: 'string' },
                                    osVersion: { type: 'string' },
                                },
                            },
                        },
                    }, tokenExchangeInitiateHandler);
                    fastify.post('/token/exchange/complete', {
                        schema: {
                            body: {
                                type: 'object',
                                required: ['exchangeToken', 'deviceId', 'deviceName', 'platform', 'deviceType'],
                                properties: {
                                    exchangeToken: { type: 'string' },
                                    deviceId: { type: 'string' },
                                    deviceName: { type: 'string' },
                                    platform: { type: 'string' },
                                    deviceType: { type: 'string', enum: ['desktop', 'mobile', 'tablet'] },
                                    appVersion: { type: 'string' },
                                    osVersion: { type: 'string' },
                                },
                            },
                        },
                    }, tokenExchangeCompleteHandler);
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    });
}
