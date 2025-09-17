"use strict";
/**
 * @fileoverview Proxy Rotation Service
 * @description Smart proxy management for server-side automation
 * @version 1.0.0
 * @author JobSwipe Team
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.ProxyRotator = void 0;
var events_1 = require("events");
var crypto_1 = require("crypto");
// =============================================================================
// PROXY ROTATOR SERVICE
// =============================================================================
var ProxyRotator = /** @class */ (function (_super) {
    __extends(ProxyRotator, _super);
    function ProxyRotator(fastify) {
        var _this = _super.call(this) || this;
        _this.fastify = fastify;
        _this.proxies = new Map();
        _this.healthCheckInterval = null;
        _this.usageResetInterval = null;
        _this.stats = {
            totalRequests: 0,
            failedRequests: 0,
            totalCost: 0
        };
        _this.startHealthChecking();
        _this.startUsageReset();
        _this.loadProxiesFromDatabase();
        return _this;
    }
    // =============================================================================
    // PROXY MANAGEMENT
    // =============================================================================
    /**
     * Load proxies from database
     */
    ProxyRotator.prototype.loadProxiesFromDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var proxyList, proxies, _i, proxies_1, proxy;
            return __generator(this, function (_a) {
                try {
                    // In a real implementation, this would use Prisma or database connection
                    // For now, we'll simulate with environment variables and default configs
                    this.fastify.log.info('Loading proxies from database...');
                    proxyList = process.env.PROXY_LIST;
                    if (proxyList) {
                        try {
                            proxies = JSON.parse(proxyList);
                            for (_i = 0, proxies_1 = proxies; _i < proxies_1.length; _i++) {
                                proxy = proxies_1[_i];
                                this.addProxy(proxy);
                            }
                        }
                        catch (error) {
                            this.fastify.log.warn('Failed to parse PROXY_LIST from environment');
                        }
                    }
                    // Add default development proxy if none configured
                    if (this.proxies.size === 0) {
                        this.addDefaultProxies();
                    }
                    this.fastify.log.info("Loaded ".concat(this.proxies.size, " proxies"));
                    this.emit('proxies-loaded', this.proxies.size);
                }
                catch (error) {
                    this.fastify.log.error('Failed to load proxies from database:', error);
                    this.addDefaultProxies();
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Add default proxies for development/testing
     */
    ProxyRotator.prototype.addDefaultProxies = function () {
        var defaultProxies = [
            {
                host: '127.0.0.1',
                port: 8080,
                proxyType: 'datacenter',
                provider: 'development',
                country: 'US',
                requestsPerHour: 100,
                dailyLimit: 1000
            },
            // Add more default proxies as needed
        ];
        for (var _i = 0, defaultProxies_1 = defaultProxies; _i < defaultProxies_1.length; _i++) {
            var proxyData = defaultProxies_1[_i];
            this.addProxy(proxyData);
        }
    };
    /**
     * Add a new proxy to the rotation pool
     */
    ProxyRotator.prototype.addProxy = function (proxyData) {
        var _a;
        var proxyId = proxyData.id || this.generateProxyId();
        var proxy = {
            id: proxyId,
            host: proxyData.host || 'localhost',
            port: proxyData.port || 8080,
            username: proxyData.username,
            password: proxyData.password,
            proxyType: proxyData.proxyType || 'datacenter',
            provider: proxyData.provider,
            country: proxyData.country,
            region: proxyData.region,
            isActive: (_a = proxyData.isActive) !== null && _a !== void 0 ? _a : true,
            failureCount: proxyData.failureCount || 0,
            successRate: proxyData.successRate || 100.0,
            lastUsedAt: proxyData.lastUsedAt,
            lastCheckedAt: proxyData.lastCheckedAt,
            requestsPerHour: proxyData.requestsPerHour || 100,
            dailyLimit: proxyData.dailyLimit || 1000,
            currentHourlyUsage: 0,
            currentDailyUsage: 0,
            avgResponseTime: proxyData.avgResponseTime,
            uptime: proxyData.uptime || 100.0,
            costPerRequest: proxyData.costPerRequest,
            monthlyLimit: proxyData.monthlyLimit,
            notes: proxyData.notes,
            tags: proxyData.tags || []
        };
        this.proxies.set(proxyId, proxy);
        this.fastify.log.info("Added proxy: ".concat(proxy.host, ":").concat(proxy.port, " (").concat(proxyId, ")"));
        this.emit('proxy-added', proxy);
        return proxyId;
    };
    /**
     * Get the next available proxy using smart selection algorithm
     */
    ProxyRotator.prototype.getNextProxy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var availableProxies, selectedProxy;
            return __generator(this, function (_a) {
                availableProxies = Array.from(this.proxies.values()).filter(function (proxy) {
                    return proxy.isActive &&
                        proxy.currentHourlyUsage < proxy.requestsPerHour &&
                        proxy.currentDailyUsage < proxy.dailyLimit &&
                        proxy.failureCount < 10;
                } // Max 10 failures before temp disable
                );
                if (availableProxies.length === 0) {
                    this.fastify.log.warn('No available proxies found');
                    this.emit('no-proxies-available');
                    return [2 /*return*/, null];
                }
                selectedProxy = availableProxies.sort(function (a, b) {
                    // Primary: Success rate (higher is better)
                    if (Math.abs(a.successRate - b.successRate) > 5) {
                        return b.successRate - a.successRate;
                    }
                    // Secondary: Current usage (lower is better)
                    var aUsagePercent = a.currentHourlyUsage / a.requestsPerHour;
                    var bUsagePercent = b.currentHourlyUsage / b.requestsPerHour;
                    if (Math.abs(aUsagePercent - bUsagePercent) > 0.1) {
                        return aUsagePercent - bUsagePercent;
                    }
                    // Tertiary: Last used time (older is better)
                    if (!a.lastUsedAt)
                        return -1;
                    if (!b.lastUsedAt)
                        return 1;
                    return a.lastUsedAt.getTime() - b.lastUsedAt.getTime();
                })[0];
                // Update usage tracking
                selectedProxy.currentHourlyUsage++;
                selectedProxy.currentDailyUsage++;
                selectedProxy.lastUsedAt = new Date();
                this.fastify.log.debug("Selected proxy: ".concat(selectedProxy.host, ":").concat(selectedProxy.port));
                this.emit('proxy-selected', selectedProxy);
                return [2 /*return*/, selectedProxy];
            });
        });
    };
    /**
     * Report the result of using a proxy
     */
    ProxyRotator.prototype.reportProxyHealth = function (proxyId, success, responseTime, error) {
        return __awaiter(this, void 0, void 0, function () {
            var proxy, healthCheck;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        proxy = this.proxies.get(proxyId);
                        if (!proxy) {
                            this.fastify.log.warn("Proxy not found for health report: ".concat(proxyId));
                            return [2 /*return*/];
                        }
                        healthCheck = {
                            proxyId: proxyId,
                            success: success,
                            responseTime: responseTime,
                            error: error,
                            timestamp: new Date()
                        };
                        // Update proxy statistics
                        if (success) {
                            // Reset failure count on success
                            proxy.failureCount = Math.max(0, proxy.failureCount - 1);
                            // Update success rate (rolling average)
                            proxy.successRate = (proxy.successRate * 0.9) + (100 * 0.1);
                            // Update response time
                            if (responseTime) {
                                proxy.avgResponseTime = proxy.avgResponseTime
                                    ? (proxy.avgResponseTime * 0.8) + (responseTime * 0.2)
                                    : responseTime;
                            }
                        }
                        else {
                            // Increment failure count
                            proxy.failureCount++;
                            // Decrease success rate
                            proxy.successRate = (proxy.successRate * 0.9) + (0 * 0.1);
                            // Disable proxy if too many failures
                            if (proxy.failureCount >= 10) {
                                proxy.isActive = false;
                                this.fastify.log.warn("Disabled proxy due to failures: ".concat(proxy.host, ":").concat(proxy.port));
                                this.emit('proxy-disabled', proxy);
                            }
                        }
                        proxy.lastCheckedAt = new Date();
                        // Update statistics
                        this.stats.totalRequests++;
                        if (!success) {
                            this.stats.failedRequests++;
                        }
                        // Track cost if applicable
                        if (proxy.costPerRequest) {
                            this.stats.totalCost += proxy.costPerRequest;
                        }
                        this.fastify.log.debug("Proxy health reported: ".concat(proxyId, " - ").concat(success ? 'SUCCESS' : 'FAILURE'));
                        this.emit('proxy-health-reported', healthCheck);
                        // Save to database in production
                        return [4 /*yield*/, this.saveProxyHealth(healthCheck)];
                    case 1:
                        // Save to database in production
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // HEALTH MONITORING
    // =============================================================================
    /**
     * Start periodic health checks
     */
    ProxyRotator.prototype.startHealthChecking = function () {
        var _this = this;
        // Check proxy health every 5 minutes
        this.healthCheckInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.performHealthChecks()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, 5 * 60 * 1000);
        this.fastify.log.info('Started proxy health checking (5min intervals)');
    };
    /**
     * Perform health checks on all proxies
     */
    ProxyRotator.prototype.performHealthChecks = function () {
        return __awaiter(this, void 0, void 0, function () {
            var proxies, healthChecks;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        proxies = Array.from(this.proxies.values());
                        this.fastify.log.debug("Performing health checks on ".concat(proxies.length, " proxies"));
                        healthChecks = proxies.map(function (proxy) { return _this.checkProxyHealth(proxy); });
                        return [4 /*yield*/, Promise.allSettled(healthChecks)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check individual proxy health
     */
    ProxyRotator.prototype.checkProxyHealth = function (proxy) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, testResult, responseTime, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 5]);
                        startTime = Date.now();
                        return [4 /*yield*/, this.testProxyConnection(proxy)];
                    case 1:
                        testResult = _a.sent();
                        responseTime = Date.now() - startTime;
                        return [4 /*yield*/, this.reportProxyHealth(proxy.id, testResult.success, responseTime, testResult.error)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        return [4 /*yield*/, this.reportProxyHealth(proxy.id, false, undefined, error_1 instanceof Error ? error_1.message : 'Health check failed')];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Test proxy connection
     */
    ProxyRotator.prototype.testProxyConnection = function (proxy) {
        return __awaiter(this, void 0, void 0, function () {
            var simulatedSuccess;
            return __generator(this, function (_a) {
                try {
                    simulatedSuccess = Math.random() > 0.1;
                    return [2 /*return*/, {
                            success: simulatedSuccess,
                            error: simulatedSuccess ? undefined : 'Simulated connection failure'
                        }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            success: false,
                            error: error instanceof Error ? error.message : 'Connection test failed'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    // =============================================================================
    // USAGE TRACKING & RESET
    // =============================================================================
    /**
     * Start usage reset intervals
     */
    ProxyRotator.prototype.startUsageReset = function () {
        var _this = this;
        // Reset hourly usage every hour
        this.usageResetInterval = setInterval(function () {
            _this.resetHourlyUsage();
        }, 60 * 60 * 1000);
        // Reset daily usage at midnight (simplified)
        var msUntilMidnight = this.getMillisecondsUntilMidnight();
        setTimeout(function () {
            _this.resetDailyUsage();
            // Then reset daily usage every 24 hours
            setInterval(function () {
                _this.resetDailyUsage();
            }, 24 * 60 * 60 * 1000);
        }, msUntilMidnight);
        this.fastify.log.info('Started usage tracking and reset intervals');
    };
    /**
     * Reset hourly usage counters
     */
    ProxyRotator.prototype.resetHourlyUsage = function () {
        for (var _i = 0, _a = this.proxies.values(); _i < _a.length; _i++) {
            var proxy = _a[_i];
            proxy.currentHourlyUsage = 0;
        }
        this.fastify.log.debug('Reset hourly usage counters');
    };
    /**
     * Reset daily usage counters
     */
    ProxyRotator.prototype.resetDailyUsage = function () {
        for (var _i = 0, _a = this.proxies.values(); _i < _a.length; _i++) {
            var proxy = _a[_i];
            proxy.currentDailyUsage = 0;
        }
        this.fastify.log.info('Reset daily usage counters');
    };
    /**
     * Get milliseconds until next midnight
     */
    ProxyRotator.prototype.getMillisecondsUntilMidnight = function () {
        var now = new Date();
        var midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        return midnight.getTime() - now.getTime();
    };
    // =============================================================================
    // STATISTICS & REPORTING
    // =============================================================================
    /**
     * Get usage statistics
     */
    ProxyRotator.prototype.getUsageStats = function () {
        var proxies = Array.from(this.proxies.values());
        var activeProxies = proxies.filter(function (p) { return p.isActive; });
        var totalSuccessRate = activeProxies.length > 0
            ? activeProxies.reduce(function (sum, p) { return sum + p.successRate; }, 0) / activeProxies.length
            : 0;
        var totalResponseTime = activeProxies.filter(function (p) { return p.avgResponseTime; }).length > 0
            ? activeProxies.filter(function (p) { return p.avgResponseTime; }).reduce(function (sum, p) { return sum + (p.avgResponseTime || 0); }, 0) / activeProxies.filter(function (p) { return p.avgResponseTime; }).length
            : 0;
        var topPerformers = activeProxies
            .sort(function (a, b) { return b.successRate - a.successRate; })
            .slice(0, 5);
        return {
            totalProxies: proxies.length,
            activeProxies: activeProxies.length,
            averageSuccessRate: Math.round(totalSuccessRate * 100) / 100,
            totalRequests: this.stats.totalRequests,
            failedRequests: this.stats.failedRequests,
            averageResponseTime: Math.round(totalResponseTime),
            costToday: Math.round(this.stats.totalCost * 100) / 100,
            topPerformers: topPerformers,
            recentFailures: [] // Would be populated from database
        };
    };
    /**
     * Get proxy by ID
     */
    ProxyRotator.prototype.getProxy = function (proxyId) {
        return this.proxies.get(proxyId) || null;
    };
    /**
     * Get all proxies
     */
    ProxyRotator.prototype.getAllProxies = function () {
        return Array.from(this.proxies.values());
    };
    /**
     * Update proxy configuration
     */
    ProxyRotator.prototype.updateProxy = function (proxyId, updates) {
        var proxy = this.proxies.get(proxyId);
        if (!proxy)
            return false;
        Object.assign(proxy, updates);
        this.emit('proxy-updated', proxy);
        return true;
    };
    /**
     * Remove proxy from rotation
     */
    ProxyRotator.prototype.removeProxy = function (proxyId) {
        var proxy = this.proxies.get(proxyId);
        if (!proxy)
            return false;
        this.proxies.delete(proxyId);
        this.emit('proxy-removed', proxy);
        return true;
    };
    // =============================================================================
    // UTILITY METHODS
    // =============================================================================
    /**
     * Generate unique proxy ID
     */
    ProxyRotator.prototype.generateProxyId = function () {
        return "proxy_".concat((0, crypto_1.randomBytes)(8).toString('hex'));
    };
    /**
     * Save proxy health to database
     */
    ProxyRotator.prototype.saveProxyHealth = function (healthCheck) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // In production, save to database
                    // await this.fastify.db.automationProxy.update({
                    //   where: { id: healthCheck.proxyId },
                    //   data: {
                    //     lastCheckedAt: healthCheck.timestamp,
                    //     successRate: this.proxies.get(healthCheck.proxyId)?.successRate,
                    //     failureCount: this.proxies.get(healthCheck.proxyId)?.failureCount
                    //   }
                    // });
                }
                catch (error) {
                    this.fastify.log.error('Failed to save proxy health to database:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    // =============================================================================
    // CLEANUP
    // =============================================================================
    /**
     * Cleanup intervals and resources
     */
    ProxyRotator.prototype.cleanup = function () {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
        if (this.usageResetInterval) {
            clearInterval(this.usageResetInterval);
            this.usageResetInterval = null;
        }
        this.fastify.log.info('ProxyRotator cleanup completed');
        this.emit('cleanup-completed');
    };
    return ProxyRotator;
}(events_1.EventEmitter));
exports.ProxyRotator = ProxyRotator;
