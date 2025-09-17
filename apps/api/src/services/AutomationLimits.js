"use strict";
/**
 * @fileoverview Automation Limits Service
 * @description Track and enforce user limits for server-side automation
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
exports.AutomationLimits = void 0;
var events_1 = require("events");
// =============================================================================
// AUTOMATION LIMITS SERVICE
// =============================================================================
var AutomationLimits = /** @class */ (function (_super) {
    __extends(AutomationLimits, _super);
    function AutomationLimits(fastify) {
        var _this = _super.call(this) || this;
        _this.fastify = fastify;
        _this.userLimits = new Map();
        _this.resetInterval = null;
        // Default limits by plan
        _this.DEFAULT_LIMITS = {
            free: {
                serverApplicationsLimit: 5,
                monthlyApplicationsLimit: 20,
                dailyApplicationsLimit: 3
            },
            basic: {
                serverApplicationsLimit: 15,
                monthlyApplicationsLimit: 100,
                dailyApplicationsLimit: 10
            },
            pro: {
                serverApplicationsLimit: 50,
                monthlyApplicationsLimit: 500,
                dailyApplicationsLimit: 25
            },
            premium: {
                serverApplicationsLimit: 200,
                monthlyApplicationsLimit: 2000,
                dailyApplicationsLimit: 100
            },
            enterprise: {
                serverApplicationsLimit: -1, // Unlimited
                monthlyApplicationsLimit: -1, // Unlimited
                dailyApplicationsLimit: -1 // Unlimited
            }
        };
        _this.startDailyReset();
        _this.fastify.log.info('AutomationLimits service initialized');
        return _this;
    }
    // =============================================================================
    // LIMIT CHECKING
    // =============================================================================
    /**
     * Check if user can use server automation
     */
    AutomationLimits.prototype.checkServerEligibility = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var limits, remainingServer, remainingDaily, remainingMonthly;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUserLimits(userId)];
                    case 1:
                        limits = _a.sent();
                        // Check if server automation is available for this plan
                        if (!limits.canUseServerAutomation) {
                            return [2 /*return*/, {
                                    allowed: false,
                                    reason: 'Server automation not available for your plan',
                                    suggestedAction: 'upgrade_required',
                                    remainingServerApplications: 0,
                                    upgradeRequired: true
                                }];
                        }
                        // Check daily limits first
                        if (limits.dailyApplicationsLimit > 0 && limits.dailyApplicationsUsed >= limits.dailyApplicationsLimit) {
                            return [2 /*return*/, {
                                    allowed: false,
                                    reason: 'Daily application limit reached',
                                    suggestedAction: 'wait_until_tomorrow',
                                    remainingServerApplications: 0,
                                    upgradeRequired: false
                                }];
                        }
                        // Check server-specific limits
                        if (limits.serverApplicationsLimit > 0 && limits.serverApplicationsUsed >= limits.serverApplicationsLimit) {
                            return [2 /*return*/, {
                                    allowed: false,
                                    reason: 'Server automation limit reached. Download desktop app for unlimited applications.',
                                    suggestedAction: 'download_desktop_app',
                                    remainingServerApplications: 0,
                                    upgradeRequired: false
                                }];
                        }
                        // Check monthly limits
                        if (limits.monthlyApplicationsLimit > 0 && limits.totalApplicationsUsed >= limits.monthlyApplicationsLimit) {
                            return [2 /*return*/, {
                                    allowed: false,
                                    reason: 'Monthly application limit reached',
                                    suggestedAction: 'upgrade_required',
                                    remainingServerApplications: 0,
                                    upgradeRequired: true
                                }];
                        }
                        remainingServer = limits.serverApplicationsLimit > 0
                            ? limits.serverApplicationsLimit - limits.serverApplicationsUsed
                            : 999999;
                        remainingDaily = limits.dailyApplicationsLimit > 0
                            ? limits.dailyApplicationsLimit - limits.dailyApplicationsUsed
                            : 999999;
                        remainingMonthly = limits.monthlyApplicationsLimit > 0
                            ? limits.monthlyApplicationsLimit - limits.totalApplicationsUsed
                            : 999999;
                        remainingServer = Math.min(remainingServer, remainingDaily, remainingMonthly);
                        return [2 /*return*/, {
                                allowed: true,
                                remainingServerApplications: remainingServer,
                                upgradeRequired: false
                            }];
                }
            });
        });
    };
    /**
     * Record a server automation usage
     */
    AutomationLimits.prototype.recordServerApplication = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var limits, remaining;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUserLimits(userId)];
                    case 1:
                        limits = _a.sent();
                        limits.serverApplicationsUsed++;
                        limits.totalApplicationsUsed++;
                        limits.dailyApplicationsUsed++;
                        // Save to persistent storage
                        return [4 /*yield*/, this.saveUserLimits(limits)];
                    case 2:
                        // Save to persistent storage
                        _a.sent();
                        // Emit events for tracking
                        this.emit('application-recorded', {
                            userId: userId,
                            type: 'server',
                            remaining: Math.max(0, limits.serverApplicationsLimit - limits.serverApplicationsUsed)
                        });
                        // Check if user is approaching limits
                        if (limits.serverApplicationsLimit > 0) {
                            remaining = limits.serverApplicationsLimit - limits.serverApplicationsUsed;
                            if (remaining <= 2) {
                                this.emit('limit-approaching', {
                                    userId: userId,
                                    type: 'server',
                                    remaining: remaining,
                                    suggestedAction: 'download_desktop_app'
                                });
                            }
                        }
                        this.fastify.log.info("Recorded server application for user ".concat(userId, ": ").concat(limits.serverApplicationsUsed, "/").concat(limits.serverApplicationsLimit));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Record a desktop automation usage
     */
    AutomationLimits.prototype.recordDesktopApplication = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var limits;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUserLimits(userId)];
                    case 1:
                        limits = _a.sent();
                        limits.totalApplicationsUsed++;
                        limits.dailyApplicationsUsed++;
                        return [4 /*yield*/, this.saveUserLimits(limits)];
                    case 2:
                        _a.sent();
                        this.emit('application-recorded', {
                            userId: userId,
                            type: 'desktop',
                            unlimited: true
                        });
                        this.fastify.log.debug("Recorded desktop application for user ".concat(userId, ": ").concat(limits.totalApplicationsUsed, " total"));
                        return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // USER LIMIT MANAGEMENT
    // =============================================================================
    /**
     * Get user limits (from cache or database)
     */
    AutomationLimits.prototype.getUserLimits = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var limits;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Check cache first
                        if (this.userLimits.has(userId)) {
                            return [2 /*return*/, this.userLimits.get(userId)];
                        }
                        return [4 /*yield*/, this.loadUserLimitsFromDatabase(userId)];
                    case 1:
                        limits = _a.sent();
                        this.userLimits.set(userId, limits);
                        return [2 /*return*/, limits];
                }
            });
        });
    };
    /**
     * Load user limits from database
     */
    AutomationLimits.prototype.loadUserLimitsFromDatabase = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var plan, planLimits, usage, limits, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getUserPlan(userId)];
                    case 1:
                        plan = _a.sent();
                        planLimits = this.DEFAULT_LIMITS[plan];
                        return [4 /*yield*/, this.getUserUsage(userId)];
                    case 2:
                        usage = _a.sent();
                        limits = {
                            userId: userId,
                            plan: plan,
                            serverApplicationsUsed: usage.serverApplicationsUsed,
                            serverApplicationsLimit: planLimits.serverApplicationsLimit,
                            totalApplicationsUsed: usage.totalApplicationsUsed,
                            monthlyApplicationsLimit: planLimits.monthlyApplicationsLimit,
                            dailyApplicationsUsed: usage.dailyApplicationsUsed,
                            dailyApplicationsLimit: planLimits.dailyApplicationsLimit,
                            canUseServerAutomation: plan !== 'free' || usage.serverApplicationsUsed < planLimits.serverApplicationsLimit,
                            resetDate: this.getNextResetDate()
                        };
                        return [2 /*return*/, limits];
                    case 3:
                        error_1 = _a.sent();
                        this.fastify.log.error("Failed to load user limits for ".concat(userId, ":"), error_1);
                        // Return free plan limits as fallback
                        return [2 /*return*/, {
                                userId: userId,
                                plan: 'free',
                                serverApplicationsUsed: 0,
                                serverApplicationsLimit: this.DEFAULT_LIMITS.free.serverApplicationsLimit,
                                totalApplicationsUsed: 0,
                                monthlyApplicationsLimit: this.DEFAULT_LIMITS.free.monthlyApplicationsLimit,
                                dailyApplicationsUsed: 0,
                                dailyApplicationsLimit: this.DEFAULT_LIMITS.free.dailyApplicationsLimit,
                                canUseServerAutomation: true,
                                resetDate: this.getNextResetDate()
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get user plan from database
     */
    AutomationLimits.prototype.getUserPlan = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var defaultPlan;
            return __generator(this, function (_a) {
                try {
                    defaultPlan = process.env.NODE_ENV === 'development' ? 'pro' : 'free';
                    return [2 /*return*/, defaultPlan];
                }
                catch (error) {
                    this.fastify.log.warn("Failed to get user plan for ".concat(userId, ", defaulting to free"));
                    return [2 /*return*/, 'free'];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get user usage from database
     */
    AutomationLimits.prototype.getUserUsage = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // In production, query usage records and job applications
                    // const today = new Date();
                    // today.setHours(0, 0, 0, 0);
                    // const [serverUsage, totalUsage, dailyUsage] = await Promise.all([
                    //   this.fastify.db.jobApplication.count({
                    //     where: {
                    //       userId,
                    //       executionMode: 'SERVER',
                    //       createdAt: { gte: this.getMonthStart() }
                    //     }
                    //   }),
                    //   this.fastify.db.jobApplication.count({
                    //     where: {
                    //       userId,
                    //       createdAt: { gte: this.getMonthStart() }
                    //     }
                    //   }),
                    //   this.fastify.db.jobApplication.count({
                    //     where: {
                    //       userId,
                    //       createdAt: { gte: today }
                    //     }
                    //   })
                    // ]);
                    // For development, return zero usage
                    return [2 /*return*/, {
                            serverApplicationsUsed: 0,
                            totalApplicationsUsed: 0,
                            dailyApplicationsUsed: 0
                        }];
                }
                catch (error) {
                    this.fastify.log.warn("Failed to get user usage for ".concat(userId, ":"), error);
                    return [2 /*return*/, {
                            serverApplicationsUsed: 0,
                            totalApplicationsUsed: 0,
                            dailyApplicationsUsed: 0
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Save user limits to database
     */
    AutomationLimits.prototype.saveUserLimits = function (limits) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // Update cache
                    this.userLimits.set(limits.userId, limits);
                    // In production, save to database
                    // await this.fastify.db.usageRecord.upsert({
                    //   where: {
                    //     userId_feature_date: {
                    //       userId: limits.userId,
                    //       feature: 'APPLICATION_SERVER',
                    //       date: new Date()
                    //     }
                    //   },
                    //   create: {
                    //     userId: limits.userId,
                    //     feature: 'APPLICATION_SERVER',
                    //     count: limits.serverApplicationsUsed,
                    //     date: new Date()
                    //   },
                    //   update: {
                    //     count: limits.serverApplicationsUsed
                    //   }
                    // });
                }
                catch (error) {
                    this.fastify.log.error("Failed to save user limits for ".concat(limits.userId, ":"), error);
                }
                return [2 /*return*/];
            });
        });
    };
    // =============================================================================
    // RESET & MAINTENANCE
    // =============================================================================
    /**
     * Start daily reset interval
     */
    AutomationLimits.prototype.startDailyReset = function () {
        var _this = this;
        // Reset daily counters at midnight
        var msUntilMidnight = this.getMillisecondsUntilMidnight();
        setTimeout(function () {
            _this.resetDailyCounts();
            // Then reset daily every 24 hours
            _this.resetInterval = setInterval(function () {
                _this.resetDailyCounts();
            }, 24 * 60 * 60 * 1000);
        }, msUntilMidnight);
        this.fastify.log.info('Daily reset interval started');
    };
    /**
     * Reset daily usage counters
     */
    AutomationLimits.prototype.resetDailyCounts = function () {
        for (var _i = 0, _a = this.userLimits.values(); _i < _a.length; _i++) {
            var limits = _a[_i];
            limits.dailyApplicationsUsed = 0;
        }
        this.fastify.log.info('Daily usage counters reset');
        this.emit('daily-reset');
    };
    /**
     * Get milliseconds until next midnight
     */
    AutomationLimits.prototype.getMillisecondsUntilMidnight = function () {
        var now = new Date();
        var midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        return midnight.getTime() - now.getTime();
    };
    /**
     * Get next reset date (first day of next month)
     */
    AutomationLimits.prototype.getNextResetDate = function () {
        var now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 1);
    };
    /**
     * Get start of current month
     */
    AutomationLimits.prototype.getMonthStart = function () {
        var now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    };
    // =============================================================================
    // ADMIN & REPORTING
    // =============================================================================
    /**
     * Get usage statistics
     */
    AutomationLimits.prototype.getUserStats = function (userId) {
        return this.userLimits.get(userId) || null;
    };
    /**
     * Get system usage statistics
     */
    AutomationLimits.prototype.getSystemStats = function () {
        var users = Array.from(this.userLimits.values());
        var activeUsers = users.filter(function (u) { return u.dailyApplicationsUsed > 0; });
        var serverApplicationsToday = users.reduce(function (sum, u) { return sum + u.dailyApplicationsUsed; }, 0);
        var usageByPlan = users.reduce(function (acc, user) {
            if (!acc[user.plan])
                acc[user.plan] = [];
            acc[user.plan].push(user.serverApplicationsUsed);
            return acc;
        }, {});
        var averageUsageByPlan = Object.entries(usageByPlan).reduce(function (acc, _a) {
            var plan = _a[0], usages = _a[1];
            acc[plan] = usages.length > 0 ? usages.reduce(function (a, b) { return a + b; }, 0) / usages.length : 0;
            return acc;
        }, {});
        return {
            totalUsers: users.length,
            activeUsers: activeUsers.length,
            serverApplicationsToday: serverApplicationsToday,
            averageUsageByPlan: averageUsageByPlan
        };
    };
    /**
     * Update user plan (for admin use)
     */
    AutomationLimits.prototype.updateUserPlan = function (userId, newPlan) {
        return __awaiter(this, void 0, void 0, function () {
            var limits, planLimits;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUserLimits(userId)];
                    case 1:
                        limits = _a.sent();
                        limits.plan = newPlan;
                        planLimits = this.DEFAULT_LIMITS[newPlan];
                        limits.serverApplicationsLimit = planLimits.serverApplicationsLimit;
                        limits.monthlyApplicationsLimit = planLimits.monthlyApplicationsLimit;
                        limits.dailyApplicationsLimit = planLimits.dailyApplicationsLimit;
                        limits.canUseServerAutomation = true;
                        return [4 /*yield*/, this.saveUserLimits(limits)];
                    case 2:
                        _a.sent();
                        this.emit('plan-updated', { userId: userId, oldPlan: limits.plan, newPlan: newPlan });
                        this.fastify.log.info("Updated user plan: ".concat(userId, " -> ").concat(newPlan));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reset user limits (for admin use)
     */
    AutomationLimits.prototype.resetUserLimits = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var limits;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUserLimits(userId)];
                    case 1:
                        limits = _a.sent();
                        limits.serverApplicationsUsed = 0;
                        limits.totalApplicationsUsed = 0;
                        limits.dailyApplicationsUsed = 0;
                        return [4 /*yield*/, this.saveUserLimits(limits)];
                    case 2:
                        _a.sent();
                        this.emit('limits-reset', { userId: userId });
                        this.fastify.log.info("Reset limits for user: ".concat(userId));
                        return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // CLEANUP
    // =============================================================================
    /**
     * Cleanup intervals
     */
    AutomationLimits.prototype.cleanup = function () {
        if (this.resetInterval) {
            clearInterval(this.resetInterval);
            this.resetInterval = null;
        }
        this.fastify.log.info('AutomationLimits cleanup completed');
        this.emit('cleanup-completed');
    };
    return AutomationLimits;
}(events_1.EventEmitter));
exports.AutomationLimits = AutomationLimits;
