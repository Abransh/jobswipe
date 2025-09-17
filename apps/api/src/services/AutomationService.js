"use strict";
/**
 * @fileoverview Automation Service
 * @description Backend service for managing job application automation queue and processing
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
exports.AutomationService = void 0;
var crypto_1 = require("crypto");
var events_1 = require("events");
// =============================================================================
// AUTOMATION SERVICE
// =============================================================================
var AutomationService = /** @class */ (function (_super) {
    __extends(AutomationService, _super);
    function AutomationService(fastify, serverAutomationService, automationLimits) {
        var _this = _super.call(this) || this;
        _this.fastify = fastify;
        _this.serverAutomationService = serverAutomationService;
        _this.automationLimits = automationLimits;
        _this.queue = new Map();
        _this.processing = new Set();
        _this.history = new Map();
        _this.stats = {
            totalProcessed: 0,
            successful: 0,
            failed: 0,
            averageProcessingTime: 0
        };
        // Supported companies and their URL patterns
        _this.supportedCompanies = new Map([
            ['greenhouse', ['greenhouse.io', 'job-boards.greenhouse.io', 'boards.greenhouse.io', 'grnh.se']],
            ['linkedin', ['linkedin.com/jobs', 'linkedin.com/jobs/view', 'linkedin.com/jobs/collections', 'linkedin.com/jobs/search']]
        ]);
        // Start queue processing
        _this.startQueueProcessor();
        return _this;
    }
    // =============================================================================
    // QUEUE MANAGEMENT
    // =============================================================================
    /**
     * Queue a new job application for automation
     */
    AutomationService.prototype.queueApplication = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var applicationId, queuedApplication;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        applicationId = (0, crypto_1.randomUUID)();
                        queuedApplication = {
                            applicationId: applicationId,
                            userId: data.userId,
                            jobData: data.jobData,
                            userProfile: data.userProfile,
                            options: data.options,
                            status: 'queued',
                            queuedAt: new Date(),
                            retryCount: 0,
                            priority: this.calculatePriority(data)
                        };
                        this.queue.set(applicationId, queuedApplication);
                        this.fastify.log.info("Application queued: ".concat(applicationId, " for job ").concat(data.jobData.id));
                        this.emit('application-queued', queuedApplication);
                        // Store in database for persistence
                        return [4 /*yield*/, this.saveApplicationToDatabase(queuedApplication)];
                    case 1:
                        // Store in database for persistence
                        _a.sent();
                        return [2 /*return*/, applicationId];
                }
            });
        });
    };
    /**
     * Get application status
     */
    AutomationService.prototype.getApplicationStatus = function (applicationId) {
        return __awaiter(this, void 0, void 0, function () {
            var application, queuePosition, estimatedTime;
            return __generator(this, function (_a) {
                application = this.queue.get(applicationId) || this.history.get(applicationId);
                if (!application) {
                    throw new Error("Application not found: ".concat(applicationId));
                }
                queuePosition = this.getQueuePosition(applicationId);
                estimatedTime = queuePosition > 0 ?
                    this.stats.averageProcessingTime * queuePosition : undefined;
                return [2 /*return*/, {
                        applicationId: applicationId,
                        userId: application.userId,
                        status: application.status,
                        progress: this.calculateProgress(application),
                        result: application.result,
                        queuePosition: queuePosition,
                        estimatedTime: estimatedTime
                    }];
            });
        });
    };
    /**
     * Cancel an application
     */
    AutomationService.prototype.cancelApplication = function (applicationId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var application;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        application = this.queue.get(applicationId);
                        if (!application) {
                            throw new Error("Application not found: ".concat(applicationId));
                        }
                        if (application.userId !== userId) {
                            throw new Error('Access denied');
                        }
                        if (application.status === 'processing') {
                            // Can't cancel processing applications easily
                            return [2 /*return*/, { cancelled: false }];
                        }
                        if (!(application.status === 'queued')) return [3 /*break*/, 2];
                        application.status = 'cancelled';
                        this.queue.delete(applicationId);
                        this.history.set(applicationId, application);
                        return [4 /*yield*/, this.updateApplicationInDatabase(application)];
                    case 1:
                        _a.sent();
                        this.emit('application-cancelled', application);
                        return [2 /*return*/, { cancelled: true, refunded: true }];
                    case 2: return [2 /*return*/, { cancelled: false }];
                }
            });
        });
    };
    /**
     * Get queue statistics
     */
    AutomationService.prototype.getQueueStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var applications;
            return __generator(this, function (_a) {
                applications = Array.from(this.queue.values());
                return [2 /*return*/, {
                        pending: applications.filter(function (app) { return app.status === 'queued'; }).length,
                        processing: applications.filter(function (app) { return app.status === 'processing'; }).length,
                        completed: this.stats.successful,
                        failed: this.stats.failed,
                        averageProcessingTime: this.stats.averageProcessingTime,
                        supportedCompanies: Array.from(this.supportedCompanies.keys())
                    }];
            });
        });
    };
    /**
     * Get user automation history
     */
    AutomationService.prototype.getUserAutomationHistory = function (userId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var allApplications, applications;
            return __generator(this, function (_a) {
                allApplications = Array.from(this.history.values())
                    .concat(Array.from(this.queue.values()))
                    .filter(function (app) { return app.userId === userId; })
                    .filter(function (app) {
                    if (options.status === 'completed')
                        return app.status === 'completed';
                    if (options.status === 'failed')
                        return app.status === 'failed';
                    return true;
                })
                    .sort(function (a, b) { return (b.queuedAt.getTime() - a.queuedAt.getTime()); });
                applications = allApplications
                    .slice(options.offset, options.offset + options.limit)
                    .map(function (app) {
                    var _a, _b;
                    return ({
                        applicationId: app.applicationId,
                        jobId: app.jobData.id,
                        jobTitle: app.jobData.title,
                        company: app.jobData.company,
                        status: app.status,
                        appliedAt: app.queuedAt.toISOString(),
                        confirmationNumber: (_a = app.result) === null || _a === void 0 ? void 0 : _a.confirmationNumber,
                        error: (_b = app.result) === null || _b === void 0 ? void 0 : _b.error
                    });
                });
                return [2 /*return*/, {
                        applications: applications,
                        total: allApplications.length,
                        hasMore: options.offset + options.limit < allApplications.length
                    }];
            });
        });
    };
    /**
     * Get supported companies
     */
    AutomationService.prototype.getSupportedCompanies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, _i, _a, _b, company, patterns;
            return __generator(this, function (_c) {
                result = {};
                for (_i = 0, _a = this.supportedCompanies.entries(); _i < _a.length; _i++) {
                    _b = _a[_i], company = _b[0], patterns = _b[1];
                    result[company] = __spreadArray([], patterns, true);
                }
                return [2 /*return*/, result];
            });
        });
    };
    /**
     * Get health status
     */
    AutomationService.prototype.getHealthStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var queueStats, issues, failureRate, status;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getQueueStats()];
                    case 1:
                        queueStats = _a.sent();
                        issues = [];
                        // Check for issues
                        if (queueStats.pending > 100) {
                            issues.push('Queue backlog is high');
                        }
                        if (queueStats.processing === 0 && queueStats.pending > 0) {
                            issues.push('No active processors while queue has pending items');
                        }
                        failureRate = this.stats.totalProcessed > 0 ?
                            this.stats.failed / this.stats.totalProcessed : 0;
                        if (failureRate > 0.1) {
                            issues.push('High failure rate detected');
                        }
                        status = 'healthy';
                        if (issues.length > 0) {
                            status = issues.length > 2 ? 'unhealthy' : 'degraded';
                        }
                        return [2 /*return*/, {
                                status: status,
                                activeProcesses: this.processing.size,
                                queueHealth: {
                                    pending: queueStats.pending,
                                    processing: queueStats.processing,
                                    failed: queueStats.failed
                                },
                                systemInfo: {
                                    uptime: process.uptime() * 1000,
                                    memoryUsage: process.memoryUsage().heapUsed,
                                    supportedCompanies: Array.from(this.supportedCompanies.keys())
                                },
                                issues: issues.length > 0 ? issues : undefined
                            }];
                }
            });
        });
    };
    // =============================================================================
    // PRIVATE METHODS
    // =============================================================================
    AutomationService.prototype.startQueueProcessor = function () {
        var _this = this;
        setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.processQueue()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, 5000); // Process queue every 5 seconds
    };
    AutomationService.prototype.processQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pendingApplications, maxConcurrent, slotsAvailable, i, application;
            return __generator(this, function (_a) {
                pendingApplications = Array.from(this.queue.values())
                    .filter(function (app) { return app.status === 'queued'; })
                    .sort(function (a, b) { return b.priority - a.priority; });
                maxConcurrent = 3;
                slotsAvailable = maxConcurrent - this.processing.size;
                for (i = 0; i < Math.min(slotsAvailable, pendingApplications.length); i++) {
                    application = pendingApplications[i];
                    this.processApplication(application);
                }
                return [2 /*return*/];
            });
        });
    };
    AutomationService.prototype.processApplication = function (application, correlationId) {
        return __awaiter(this, void 0, void 0, function () {
            var applicationId, userId, logContext, executionMode, result, error_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        applicationId = application.applicationId, userId = application.userId;
                        logContext = {
                            correlationId: correlationId || "queue_".concat(applicationId),
                            applicationId: applicationId,
                            userId: userId,
                            jobId: application.jobData.id,
                            jobTitle: application.jobData.title,
                            company: application.jobData.company
                        };
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 8, 10, 11]);
                        this.processing.add(applicationId);
                        application.status = 'processing';
                        application.startedAt = new Date();
                        this.fastify.log.info(__assign(__assign({}, logContext), { event: 'application_processing_started', message: 'Starting application processing', queuedAt: application.queuedAt, priority: application.priority }));
                        this.emit('application-processing', __assign(__assign({}, application), { correlationId: logContext.correlationId }));
                        return [4 /*yield*/, this.determineExecutionMode(userId)];
                    case 2:
                        executionMode = _c.sent();
                        result = void 0;
                        if (!(executionMode === 'server')) return [3 /*break*/, 5];
                        // Execute on server
                        this.fastify.log.info(__assign(__assign({}, logContext), { event: 'automation_mode_server', message: 'Executing automation on server' }));
                        return [4 /*yield*/, this.executeOnServer(application, logContext.correlationId)];
                    case 3:
                        result = _c.sent();
                        // Record server usage
                        return [4 /*yield*/, this.automationLimits.recordServerApplication(userId)];
                    case 4:
                        // Record server usage
                        _c.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        // Queue for desktop app
                        application.status = 'queued';
                        this.fastify.log.info(__assign(__assign({}, logContext), { event: 'automation_mode_desktop', message: 'Application queued for desktop execution (server limit exceeded)' }));
                        this.emit('application-queued-desktop', __assign(__assign({}, application), { correlationId: logContext.correlationId }));
                        return [2 /*return*/]; // Don't complete processing yet
                    case 6:
                        application.status = result.success ? 'completed' : 'failed';
                        application.completedAt = new Date();
                        application.result = result;
                        // Update statistics
                        this.updateStats(result.success, result.executionTime);
                        // Move to history
                        this.queue.delete(applicationId);
                        this.history.set(applicationId, application);
                        return [4 /*yield*/, this.updateApplicationInDatabase(application)];
                    case 7:
                        _c.sent();
                        this.fastify.log.info(__assign(__assign({}, logContext), { event: 'application_processing_completed', message: 'Application processing completed', success: result.success, executionTimeMs: result.executionTime, confirmationNumber: result.confirmationNumber, processingDurationMs: Date.now() - (((_a = application.startedAt) === null || _a === void 0 ? void 0 : _a.getTime()) || 0) }));
                        this.emit('application-completed', __assign(__assign({}, application), { correlationId: logContext.correlationId }));
                        return [3 /*break*/, 11];
                    case 8:
                        error_1 = _c.sent();
                        this.fastify.log.error(__assign(__assign({}, logContext), { event: 'application_processing_failed', message: 'Application processing failed with error', error: error_1 instanceof Error ? error_1.message : String(error_1), errorStack: error_1 instanceof Error ? error_1.stack : undefined, processingDurationMs: Date.now() - (((_b = application.startedAt) === null || _b === void 0 ? void 0 : _b.getTime()) || 0) }));
                        application.status = 'failed';
                        application.completedAt = new Date();
                        application.result = {
                            applicationId: applicationId,
                            success: false,
                            error: error_1 instanceof Error ? error_1.message : 'Unknown error',
                            executionTime: 0,
                            companyAutomation: 'unknown',
                            status: 'failed',
                            steps: [],
                            screenshots: [],
                            captchaEvents: []
                        };
                        this.queue.delete(applicationId);
                        this.history.set(applicationId, application);
                        return [4 /*yield*/, this.updateApplicationInDatabase(application)];
                    case 9:
                        _c.sent();
                        this.emit('application-failed', application);
                        return [3 /*break*/, 11];
                    case 10:
                        this.processing.delete(applicationId);
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Determine execution mode for user
     */
    AutomationService.prototype.determineExecutionMode = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var eligibility;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.automationLimits.checkServerEligibility(userId)];
                    case 1:
                        eligibility = _a.sent();
                        return [2 /*return*/, eligibility.allowed ? 'server' : 'desktop'];
                }
            });
        });
    };
    /**
     * Execute automation on server
     */
    AutomationService.prototype.executeOnServer = function (application, correlationId) {
        return __awaiter(this, void 0, void 0, function () {
            var companyAutomation, request, serverResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        companyAutomation = this.detectCompanyAutomation(application.jobData.applyUrl);
                        if (!companyAutomation) {
                            throw new Error("No automation found for URL: ".concat(application.jobData.applyUrl));
                        }
                        request = {
                            userId: application.userId,
                            jobId: application.jobData.id,
                            applicationId: application.applicationId,
                            companyAutomation: companyAutomation,
                            userProfile: {
                                firstName: application.userProfile.firstName,
                                lastName: application.userProfile.lastName,
                                email: application.userProfile.email,
                                phone: application.userProfile.phone,
                                resumeUrl: application.userProfile.resumeUrl,
                                currentTitle: application.userProfile.currentTitle,
                                yearsExperience: application.userProfile.yearsExperience,
                                skills: application.userProfile.skills,
                                currentLocation: application.userProfile.currentLocation,
                                linkedinUrl: application.userProfile.linkedinUrl,
                                workAuthorization: application.userProfile.workAuthorization,
                                coverLetter: application.userProfile.coverLetter,
                                customFields: application.userProfile.customFields
                            },
                            jobData: application.jobData,
                            options: application.options
                        };
                        return [4 /*yield*/, this.serverAutomationService.executeAutomation(request, correlationId)];
                    case 1:
                        serverResult = _a.sent();
                        // Convert server result to AutomationResult format
                        return [2 /*return*/, {
                                applicationId: serverResult.applicationId,
                                success: serverResult.success,
                                confirmationNumber: serverResult.confirmationNumber,
                                error: serverResult.error,
                                executionTime: serverResult.executionTime,
                                companyAutomation: serverResult.companyAutomation,
                                status: serverResult.status,
                                steps: serverResult.steps,
                                screenshots: serverResult.screenshots,
                                captchaEvents: serverResult.captchaEvents
                            }];
                }
            });
        });
    };
    AutomationService.prototype.detectCompanyAutomation = function (url) {
        var urlLower = url.toLowerCase();
        for (var _i = 0, _a = this.supportedCompanies.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], company = _b[0], patterns = _b[1];
            if (patterns.some(function (pattern) { return urlLower.includes(pattern); })) {
                return company;
            }
        }
        return null;
    };
    AutomationService.prototype.calculatePriority = function (data) {
        var _a;
        // Higher priority for certain conditions
        var priority = 50; // Base priority
        // Premium users get higher priority
        if ((_a = data.userProfile.customFields) === null || _a === void 0 ? void 0 : _a.isPremium) {
            priority += 30;
        }
        // Urgent applications
        if (data.options.maxRetries && data.options.maxRetries > 3) {
            priority += 20;
        }
        return priority;
    };
    AutomationService.prototype.getQueuePosition = function (applicationId) {
        var applications = Array.from(this.queue.values())
            .filter(function (app) { return app.status === 'queued'; })
            .sort(function (a, b) { return b.priority - a.priority; });
        return applications.findIndex(function (app) { return app.applicationId === applicationId; }) + 1;
    };
    AutomationService.prototype.calculateProgress = function (application) {
        switch (application.status) {
            case 'queued': return 10;
            case 'processing': return 50;
            case 'completed': return 100;
            case 'failed': return 100;
            case 'cancelled': return 0;
            default: return 0;
        }
    };
    AutomationService.prototype.updateStats = function (success, executionTime) {
        this.stats.totalProcessed++;
        if (success) {
            this.stats.successful++;
        }
        else {
            this.stats.failed++;
        }
        // Update rolling average
        var totalTime = this.stats.averageProcessingTime * (this.stats.totalProcessed - 1) + executionTime;
        this.stats.averageProcessingTime = Math.round(totalTime / this.stats.totalProcessed);
    };
    AutomationService.prototype.saveApplicationToDatabase = function (application) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In a real implementation, save to database
                // For now, just log
                this.fastify.log.info("Saving application to database: ".concat(application.applicationId));
                return [2 /*return*/];
            });
        });
    };
    AutomationService.prototype.updateApplicationInDatabase = function (application) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In a real implementation, update database record
                // For now, just log
                this.fastify.log.info("Updating application in database: ".concat(application.applicationId, " (").concat(application.status, ")"));
                return [2 /*return*/];
            });
        });
    };
    return AutomationService;
}(events_1.EventEmitter));
exports.AutomationService = AutomationService;
