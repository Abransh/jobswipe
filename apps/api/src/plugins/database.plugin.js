"use strict";
/**
 * @fileoverview Database Plugin for Fastify
 * @description Prisma database connection and transaction management
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Production-grade database connection with proper error handling
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
var fastify_plugin_1 = require("fastify-plugin");
var env_validation_1 = require("../utils/env-validation");
// Database imports with fallbacks
var db = null;
var getUserById = null;
var createUser = null;
var updateUser = null;
var deleteUser = null;
try {
    var databaseModule = require('@jobswipe/database');
    db = databaseModule.db;
    getUserById = databaseModule.getUserById;
    createUser = databaseModule.createUser;
    updateUser = databaseModule.updateUser;
    deleteUser = databaseModule.deleteUser;
}
catch (error) {
    console.warn('⚠️  Database package not available:', error instanceof Error ? error.message : 'Unknown error');
}
// =============================================================================
// DATABASE CONNECTION MANAGER
// =============================================================================
var DatabaseManager = /** @class */ (function () {
    function DatabaseManager(fastify) {
        this.connectionChecked = false;
        this.lastHealthCheck = null;
        this.fastify = fastify;
    }
    /**
     * Initialize database connection
     */
    DatabaseManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!db) {
                            this.fastify.log.warn('Database not available - running without database connectivity');
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // Test database connection
                        return [4 /*yield*/, this.testConnection()];
                    case 2:
                        // Test database connection
                        _a.sent();
                        this.connectionChecked = true;
                        this.fastify.log.info('✅ Database connection established successfully');
                        // Setup cleanup on app close
                        this.fastify.addHook('onClose', this.cleanup.bind(this));
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        this.fastify.log.error('❌ Failed to establish database connection:', error_1);
                        throw new Error("Database connection failed: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Test database connection
     */
    DatabaseManager.prototype.testConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!db) {
                            throw new Error('Database client not available');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // Simple query to test connection
                        return [4 /*yield*/, db.$queryRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SELECT 1 as test"], ["SELECT 1 as test"])))];
                    case 2:
                        // Simple query to test connection
                        _a.sent();
                        this.fastify.log.debug('Database connection test successful');
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        this.fastify.log.error('Database connection test failed:', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get database health status
     */
    DatabaseManager.prototype.getHealth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, responseTime, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!db) {
                            return [2 /*return*/, {
                                    status: 'unhealthy',
                                    details: {
                                        connected: false,
                                        error: 'Database client not available'
                                    }
                                }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        startTime = Date.now();
                        return [4 /*yield*/, db.$queryRaw(templateObject_2 || (templateObject_2 = __makeTemplateObject(["SELECT 1 as health_check"], ["SELECT 1 as health_check"])))];
                    case 2:
                        _a.sent();
                        responseTime = Date.now() - startTime;
                        this.lastHealthCheck = {
                            status: responseTime < 1000 ? 'healthy' : 'degraded',
                            details: {
                                connected: true,
                                lastQuery: new Date(),
                                connectionCount: 1, // Simplified for now
                            }
                        };
                        return [2 /*return*/, this.lastHealthCheck];
                    case 3:
                        error_3 = _a.sent();
                        this.lastHealthCheck = {
                            status: 'unhealthy',
                            details: {
                                connected: false,
                                error: error_3 instanceof Error ? error_3.message : 'Unknown error'
                            }
                        };
                        return [2 /*return*/, this.lastHealthCheck];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute a database transaction
     */
    DatabaseManager.prototype.executeTransaction = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!db) {
                            throw new Error('Database not available for transactions');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, db.$transaction(callback)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_4 = _a.sent();
                        this.fastify.log.error('Database transaction failed:', error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cleanup database connections
     */
    DatabaseManager.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!db) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, db.$disconnect()];
                    case 2:
                        _a.sent();
                        this.fastify.log.info('Database connections closed');
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        this.fastify.log.error('Error closing database connections:', error_5);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return DatabaseManager;
}());
// =============================================================================
// ENHANCED DATABASE METHODS
// =============================================================================
var DatabaseService = /** @class */ (function () {
    function DatabaseService(fastify, manager) {
        this.fastify = fastify;
        this.manager = manager;
    }
    /**
     * Get user by ID with error handling
     */
    DatabaseService.prototype.getUserById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var user, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!db || !getUserById) {
                            throw new Error('Database or user service not available');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, getUserById(id)];
                    case 2:
                        user = _a.sent();
                        if (!user) {
                            this.fastify.log.debug("User not found: ".concat(id));
                            return [2 /*return*/, null];
                        }
                        this.fastify.log.debug("User retrieved: ".concat(user.email));
                        return [2 /*return*/, user];
                    case 3:
                        error_6 = _a.sent();
                        this.fastify.log.error('Error retrieving user:', error_6);
                        throw new Error("Failed to retrieve user: ".concat(error_6 instanceof Error ? error_6.message : 'Unknown error'));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute raw query with logging
     */
    DatabaseService.prototype.executeQuery = function (query, params) {
        return __awaiter(this, void 0, void 0, function () {
            var result, _a, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!db) {
                            throw new Error('Database not available');
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        this.fastify.log.debug("Executing query: ".concat(query));
                        if (!params) return [3 /*break*/, 3];
                        return [4 /*yield*/, db.$queryRawUnsafe.apply(db, __spreadArray([query], params, false))];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, db.$queryRawUnsafe(query)];
                    case 4:
                        _a = _b.sent();
                        _b.label = 5;
                    case 5:
                        result = _a;
                        return [2 /*return*/, result];
                    case 6:
                        error_7 = _b.sent();
                        this.fastify.log.error('Query execution failed:', error_7);
                        throw error_7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get connection info
     */
    DatabaseService.prototype.getConnectionInfo = function () {
        return {
            available: !!db,
            checked: this.manager['connectionChecked'],
            lastHealth: this.manager['lastHealthCheck'],
        };
    };
    return DatabaseService;
}());
// =============================================================================
// PLUGIN IMPLEMENTATION
// =============================================================================
var databasePlugin = function (fastify, options) { return __awaiter(void 0, void 0, void 0, function () {
    var envConfig, manager, error_8, databaseService;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                envConfig = (0, env_validation_1.getEnvironmentConfig)();
                manager = new DatabaseManager(fastify);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, manager.initialize()];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_8 = _a.sent();
                if (envConfig.nodeEnv === 'production') {
                    // In production, database is required
                    throw error_8;
                }
                else {
                    // In development, continue without database
                    fastify.log.warn('Continuing without database in development mode');
                }
                return [3 /*break*/, 4];
            case 4:
                databaseService = new DatabaseService(fastify, manager);
                // Decorate Fastify instance with database
                if (db) {
                    fastify.decorate('db', db);
                    fastify.decorate('dbService', databaseService);
                    fastify.decorate('dbHealth', manager.getHealth.bind(manager));
                    fastify.decorate('dbTransaction', manager.executeTransaction.bind(manager));
                }
                else {
                    // Add mock database for development
                    fastify.decorate('db', null);
                    fastify.decorate('dbService', null);
                    fastify.decorate('dbHealth', function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, ({
                                    status: 'unhealthy',
                                    details: { connected: false, error: 'Database not available' }
                                })];
                        });
                    }); });
                    fastify.decorate('dbTransaction', function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            throw new Error('Database not available');
                        });
                    }); });
                }
                // Add database health check endpoint
                fastify.get('/health/database', {
                    schema: {
                        description: 'Database health check',
                        tags: ['Health'],
                        response: {
                            200: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
                                    details: {
                                        type: 'object',
                                        properties: {
                                            connected: { type: 'boolean' },
                                            connectionCount: { type: 'number' },
                                            lastQuery: { type: 'string', format: 'date-time' },
                                            error: { type: 'string' }
                                        }
                                    },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                }, function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
                    var health;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, manager.getHealth()];
                            case 1:
                                health = _a.sent();
                                reply.code(health.status === 'healthy' ? 200 : 503).send(__assign(__assign({}, health), { timestamp: new Date().toISOString() }));
                                return [2 /*return*/];
                        }
                    });
                }); });
                // Add database info endpoint
                fastify.get('/health/database/info', {
                    schema: {
                        description: 'Database connection info',
                        tags: ['Health'],
                        response: {
                            200: {
                                type: 'object',
                                properties: {
                                    available: { type: 'boolean' },
                                    checked: { type: 'boolean' },
                                    version: { type: 'string' },
                                    features: {
                                        type: 'object',
                                        properties: {
                                            transactions: { type: 'boolean' },
                                            rawQueries: { type: 'boolean' },
                                            migrations: { type: 'boolean' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }, function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
                    var info;
                    return __generator(this, function (_a) {
                        info = databaseService.getConnectionInfo();
                        reply.send(__assign(__assign({}, info), { version: db ? 'Prisma Client' : 'Not Available', features: {
                                transactions: !!db,
                                rawQueries: !!db,
                                migrations: !!db
                            } }));
                        return [2 /*return*/];
                    });
                }); });
                fastify.log.info('Database plugin registered successfully');
                return [2 /*return*/];
        }
    });
}); };
exports.default = (0, fastify_plugin_1.default)(databasePlugin, {
    name: 'database',
    fastify: '4.x'
});
var templateObject_1, templateObject_2;
