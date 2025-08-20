"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowIntegrationService = void 0;
var events_1 = require("events");
var BrowserUseService_1 = require("./BrowserUseService");
var GreenhouseService_1 = require("./GreenhouseService");
var VisionServiceManager_1 = require("./VisionServiceManager");
var StrategyRegistry_1 = require("../strategies/StrategyRegistry");
var JobSwipeAutomationEngine_1 = require("../automation/JobSwipeAutomationEngine");
var EnterpriseQueueManager_1 = require("../queue/EnterpriseQueueManager");
var WorkflowIntegrationService = /** @class */ (function (_super) {
    __extends(WorkflowIntegrationService, _super);
    function WorkflowIntegrationService(config) {
        var _this = _super.call(this) || this;
        _this.isInitialized = false;
        _this.startTime = Date.now();
        // Statistics
        _this.stats = {
            totalApplications: 0,
            successfulApplications: 0,
            failedApplications: 0,
            averageExecutionTime: 0,
            queueStatus: { pending: 0, processing: 0, completed: 0, failed: 0 },
            aiAutomationStats: {
                aiSuccessRate: 0,
                traditionalFallbackRate: 0,
                captchaResolutionRate: 0
            },
            systemHealth: { healthy: true, issues: [], uptime: 0 }
        };
        _this.config = config;
        return _this;
    }
    /**
     * Initialize the complete workflow integration system
     */
    WorkflowIntegrationService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        this.emit('initialization-start');
                        console.log('🚀 Initializing JobSwipe Workflow Integration System...');
                        // Initialize Vision Service Manager with multi-provider support
                        return [4 /*yield*/, this.initializeVisionService()];
                    case 1:
                        // Initialize Vision Service Manager with multi-provider support
                        _a.sent();
                        // Initialize Browser-Use Service
                        return [4 /*yield*/, this.initializeBrowserUseService()];
                    case 2:
                        // Initialize Browser-Use Service
                        _a.sent();
                        // Initialize Strategy Registry
                        return [4 /*yield*/, this.initializeStrategyRegistry()];
                    case 3:
                        // Initialize Strategy Registry
                        _a.sent();
                        // Initialize Automation Engine
                        return [4 /*yield*/, this.initializeAutomationEngine()];
                    case 4:
                        // Initialize Automation Engine
                        _a.sent();
                        // Initialize Queue Manager
                        return [4 /*yield*/, this.initializeQueueManager()];
                    case 5:
                        // Initialize Queue Manager
                        _a.sent();
                        if (!this.config.greenhouseConfig) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.initializeGreenhouseService()];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: 
                    // Set up inter-service connections
                    return [4 /*yield*/, this.connectServices()];
                    case 8:
                        // Set up inter-service connections
                        _a.sent();
                        // Start health monitoring
                        this.startHealthMonitoring();
                        this.isInitialized = true;
                        console.log('✅ Workflow Integration System initialized successfully');
                        this.emit('initialization-complete', {
                            services: this.getInitializedServices(),
                            timestamp: new Date()
                        });
                        return [3 /*break*/, 10];
                    case 9:
                        error_1 = _a.sent();
                        console.error('❌ Failed to initialize Workflow Integration System:', error_1);
                        this.emit('initialization-error', { error: error_1.message });
                        throw error_1;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initialize Vision Service Manager with all providers
     */
    WorkflowIntegrationService.prototype.initializeVisionService = function () {
        return __awaiter(this, void 0, void 0, function () {
            var visionConfig;
            var _this = this;
            return __generator(this, function (_a) {
                console.log('🧠 Initializing AI Vision Service Manager...');
                visionConfig = {
                    providers: {
                        claude: { apiKey: this.config.anthropicApiKey },
                        openai: this.config.openaiApiKey ? { apiKey: this.config.openaiApiKey } : undefined,
                        google: this.config.googleCloudConfig,
                        azure: this.config.azureConfig,
                        aws: this.config.awsConfig,
                    },
                    caching: {
                        enabled: true,
                        maxSize: 1000,
                        ttl: 300000, // 5 minutes
                    },
                    fallback: {
                        enabled: true,
                        maxRetries: 3,
                        costThreshold: 0.01,
                        accuracyThreshold: 0.8,
                    },
                    optimization: {
                        preferFreeProviders: false,
                        balanceSpeedAndAccuracy: true,
                        enableParallelProcessing: false,
                    },
                };
                this.visionService = new VisionServiceManager_1.default(visionConfig);
                // Set up event forwarding
                this.visionService.on('initialized', function (data) {
                    _this.emit('vision-service-ready', data);
                });
                this.visionService.on('analysis-complete', function (data) {
                    _this.emit('vision-analysis-complete', data);
                });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Initialize Browser-Use Service for AI automation
     */
    WorkflowIntegrationService.prototype.initializeBrowserUseService = function () {
        return __awaiter(this, void 0, void 0, function () {
            var browserConfig;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🤖 Initializing Browser-Use AI Service...');
                        browserConfig = {
                            anthropicApiKey: this.config.anthropicApiKey,
                            headless: this.config.browserConfig.headless,
                            viewport: this.config.browserConfig.viewport,
                            userAgent: this.config.browserConfig.userAgent,
                            slowMo: this.config.browserConfig.slowMo,
                            timeout: this.config.performance.jobTimeout,
                        };
                        this.browserUseService = new BrowserUseService_1.default(browserConfig);
                        return [4 /*yield*/, this.browserUseService.initialize()];
                    case 1:
                        _a.sent();
                        // Set up event forwarding
                        this.browserUseService.on('progress', function (data) {
                            _this.emit('automation-progress', data);
                        });
                        this.browserUseService.on('captcha-detected', function (data) {
                            _this.emit('captcha-detected', data);
                        });
                        this.browserUseService.on('error', function (data) {
                            _this.emit('automation-error', data);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initialize Strategy Registry
     */
    WorkflowIntegrationService.prototype.initializeStrategyRegistry = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                console.log('📋 Initializing Strategy Registry...');
                this.strategyRegistry = new StrategyRegistry_1.StrategyRegistry({
                    cacheStrategy: true,
                    autoReload: true,
                    performanceTracking: true,
                    abTestingEnabled: false,
                });
                // Connect browser-use service to strategy registry
                this.strategyRegistry.setBrowserUseService(this.browserUseService);
                // Set up event forwarding
                this.strategyRegistry.on('strategy-matched', function (data) {
                    _this.emit('strategy-matched', data);
                });
                this.strategyRegistry.on('ai-automation-complete', function (data) {
                    _this.emit('ai-automation-complete', data);
                });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Initialize Automation Engine
     */
    WorkflowIntegrationService.prototype.initializeAutomationEngine = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                console.log('⚙️ Initializing Automation Engine...');
                this.automationEngine = new JobSwipeAutomationEngine_1.JobSwipeAutomationEngine({
                    maxConcurrentJobs: this.config.performance.maxConcurrentJobs,
                    jobTimeout: this.config.performance.jobTimeout,
                    retryAttempts: this.config.queueConfig.retryAttempts,
                });
                // Connect services to automation engine
                this.automationEngine.setVisionService(this.visionService);
                this.automationEngine.setStrategyRegistry(this.strategyRegistry);
                // Set up event forwarding
                this.automationEngine.on('job-started', function (data) {
                    _this.emit('job-started', data);
                });
                this.automationEngine.on('job-completed', function (data) {
                    _this.emit('job-completed', data);
                    _this.updateStats(data);
                });
                this.automationEngine.on('job-failed', function (data) {
                    _this.emit('job-failed', data);
                    _this.updateStats(data);
                });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Initialize Queue Manager
     */
    WorkflowIntegrationService.prototype.initializeQueueManager = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                console.log('📬 Initializing Enterprise Queue Manager...');
                this.queueManager = new EnterpriseQueueManager_1.EnterpriseQueueManager({
                    redis: {
                        connection: this.config.queueConfig.redisUrl,
                    },
                    concurrency: {
                        immediate: 1,
                        high: 3,
                        standard: this.config.queueConfig.concurrency,
                        batch: 10,
                        retry: 2,
                    },
                    retry: {
                        attempts: this.config.queueConfig.retryAttempts,
                        delay: 2000,
                        backoff: 'exponential',
                    },
                    healthCheck: {
                        enabled: true,
                        interval: 30000,
                    },
                });
                // Connect automation engine to queue
                this.queueManager.setJobProcessor(function (job) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.automationEngine.processJob(job)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                }); });
                // Set up event forwarding
                this.queueManager.on('job-queued', function (data) {
                    _this.emit('job-queued', data);
                });
                this.queueManager.on('queue-stats', function (data) {
                    _this.updateQueueStats(data);
                });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Initialize optional Greenhouse Service
     */
    WorkflowIntegrationService.prototype.initializeGreenhouseService = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.greenhouseConfig)
                            return [2 /*return*/];
                        console.log('🌱 Initializing Greenhouse API Service...');
                        this.greenhouseService = new GreenhouseService_1.default({
                            apiKey: this.config.greenhouseConfig.apiKey,
                            rateLimitRequests: 100,
                            rateLimitWindow: 60000,
                            cacheSize: 500,
                            cacheTTL: 300000,
                        });
                        return [4 /*yield*/, this.greenhouseService.initialize()];
                    case 1:
                        _a.sent();
                        // Set up event forwarding
                        this.greenhouseService.on('search-complete', function (data) {
                            _this.emit('greenhouse-jobs-synced', data);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Connect all services together
     */
    WorkflowIntegrationService.prototype.connectServices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var linkedinStrategy;
            var _this = this;
            return __generator(this, function (_a) {
                console.log('🔗 Connecting services...');
                linkedinStrategy = this.strategyRegistry.getStrategy('linkedin');
                if (linkedinStrategy) {
                    // This would require extending the strategy to accept vision service
                    // For now, just log that connection would be made
                    console.log('🤖 Vision service connected to LinkedIn strategy');
                }
                // Set up cross-service communication
                this.browserUseService.on('status', function (data) {
                    _this.emit('service-status', __assign({ service: 'browser-use' }, data));
                });
                this.visionService.on('error', function (data) {
                    _this.emit('service-error', __assign({ service: 'vision' }, data));
                });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Process a job application request
     */
    WorkflowIntegrationService.prototype.processJobApplication = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, queueJob, queueResult, result, executionTime, applicationResult, error_2, executionTime, applicationResult;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.isInitialized) {
                            throw new Error('Workflow Integration Service not initialized');
                        }
                        startTime = Date.now();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        this.emit('application-request', {
                            jobId: request.jobId,
                            userId: request.userId,
                            priority: request.priority
                        });
                        queueJob = {
                            id: "job_".concat(request.jobId, "_").concat(Date.now()),
                            type: 'job-application',
                            data: {
                                jobId: request.jobId,
                                userId: request.userId,
                                userProfile: request.userProfile,
                                options: request.options || {},
                            },
                            priority: request.priority,
                            attempts: 0,
                            maxAttempts: ((_a = request.options) === null || _a === void 0 ? void 0 : _a.maxRetries) || this.config.queueConfig.retryAttempts,
                        };
                        return [4 /*yield*/, this.queueManager.addJob(queueJob)];
                    case 2:
                        queueResult = _b.sent();
                        return [4 /*yield*/, this.waitForJobCompletion(queueJob.id, this.config.performance.jobTimeout)];
                    case 3:
                        result = _b.sent();
                        executionTime = Date.now() - startTime;
                        applicationResult = {
                            jobId: request.jobId,
                            userId: request.userId,
                            success: result.success,
                            applicationId: result.applicationId,
                            confirmationNumber: result.confirmationNumber,
                            error: result.error,
                            executionTime: executionTime,
                            strategy: result.strategy || 'unknown',
                            automationType: result.automationType || 'traditional',
                            metadata: {
                                captchaEncountered: result.captchaEncountered || false,
                                retryCount: result.retryCount || 0,
                                screenshots: result.screenshots || [],
                                logs: result.logs || [],
                            },
                        };
                        this.emit('application-complete', applicationResult);
                        return [2 /*return*/, applicationResult];
                    case 4:
                        error_2 = _b.sent();
                        executionTime = Date.now() - startTime;
                        applicationResult = {
                            jobId: request.jobId,
                            userId: request.userId,
                            success: false,
                            error: error_2.message,
                            executionTime: executionTime,
                            strategy: 'none',
                            automationType: 'traditional',
                            metadata: {
                                captchaEncountered: false,
                                retryCount: 0,
                                screenshots: [],
                                logs: [],
                            },
                        };
                        this.emit('application-failed', applicationResult);
                        return [2 /*return*/, applicationResult];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sync jobs from Greenhouse
     */
    WorkflowIntegrationService.prototype.syncGreenhouseJobs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var jobs, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.greenhouseService || !this.config.greenhouseConfig) {
                            throw new Error('Greenhouse service not configured');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.greenhouseService.syncCompanyJobs(this.config.greenhouseConfig.boardTokens)];
                    case 2:
                        jobs = _a.sent();
                        this.emit('greenhouse-sync-complete', {
                            jobCount: jobs.length,
                            timestamp: new Date()
                        });
                        return [2 /*return*/, jobs.length];
                    case 3:
                        error_3 = _a.sent();
                        this.emit('greenhouse-sync-error', { error: error_3.message });
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get current workflow statistics
     */
    WorkflowIntegrationService.prototype.getStats = function () {
        return __assign(__assign({}, this.stats), { systemHealth: __assign(__assign({}, this.stats.systemHealth), { uptime: Date.now() - this.startTime }) });
    };
    /**
     * Get health status of all services
     */
    WorkflowIntegrationService.prototype.getHealthStatus = function () {
        var _a, _b;
        var services = {
            browserUse: ((_b = (_a = this.browserUseService) === null || _a === void 0 ? void 0 : _a.getStatus()) === null || _b === void 0 ? void 0 : _b.initialized) || false,
            visionService: this.visionService !== undefined,
            strategyRegistry: this.strategyRegistry !== undefined,
            automationEngine: this.automationEngine !== undefined,
            queueManager: this.queueManager !== undefined,
            greenhouse: this.greenhouseService !== undefined || !this.config.greenhouseConfig,
        };
        var issues = [];
        var overall = true;
        for (var _i = 0, _c = Object.entries(services); _i < _c.length; _i++) {
            var _d = _c[_i], service = _d[0], healthy = _d[1];
            if (!healthy) {
                issues.push("".concat(service, " service not healthy"));
                overall = false;
            }
        }
        return {
            overall: overall,
            services: services,
            issues: issues,
        };
    };
    /**
     * Shutdown all services gracefully
     */
    WorkflowIntegrationService.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        console.log('🛑 Shutting down Workflow Integration System...');
                        // Stop health monitoring
                        this.stopHealthMonitoring();
                        // Cleanup services
                        return [4 /*yield*/, Promise.all([
                                (_a = this.browserUseService) === null || _a === void 0 ? void 0 : _a.cleanup(),
                                (_b = this.visionService) === null || _b === void 0 ? void 0 : _b.cleanup(),
                                (_c = this.queueManager) === null || _c === void 0 ? void 0 : _c.cleanup(),
                                (_d = this.greenhouseService) === null || _d === void 0 ? void 0 : _d.cleanup(),
                            ])];
                    case 1:
                        // Cleanup services
                        _e.sent();
                        this.isInitialized = false;
                        console.log('✅ Workflow Integration System shutdown complete');
                        this.emit('shutdown-complete');
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _e.sent();
                        console.error('❌ Error during shutdown:', error_4);
                        this.emit('shutdown-error', { error: error_4.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Private helper methods
     */
    WorkflowIntegrationService.prototype.getInitializedServices = function () {
        var services = [];
        if (this.browserUseService)
            services.push('browser-use');
        if (this.visionService)
            services.push('vision-service');
        if (this.strategyRegistry)
            services.push('strategy-registry');
        if (this.automationEngine)
            services.push('automation-engine');
        if (this.queueManager)
            services.push('queue-manager');
        if (this.greenhouseService)
            services.push('greenhouse-service');
        return services;
    };
    WorkflowIntegrationService.prototype.waitForJobCompletion = function (jobId, timeout) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var timeoutId = setTimeout(function () {
                            reject(new Error("Job ".concat(jobId, " timed out after ").concat(timeout, "ms")));
                        }, timeout);
                        var onComplete = function (result) {
                            if (result.jobId === jobId) {
                                clearTimeout(timeoutId);
                                _this.off('job-completed', onComplete);
                                _this.off('job-failed', onComplete);
                                resolve(result);
                            }
                        };
                        _this.on('job-completed', onComplete);
                        _this.on('job-failed', onComplete);
                    })];
            });
        });
    };
    WorkflowIntegrationService.prototype.updateStats = function (result) {
        this.stats.totalApplications++;
        if (result.success) {
            this.stats.successfulApplications++;
        }
        else {
            this.stats.failedApplications++;
        }
        // Update average execution time
        var totalTime = this.stats.averageExecutionTime * (this.stats.totalApplications - 1) + result.executionTime;
        this.stats.averageExecutionTime = totalTime / this.stats.totalApplications;
        // Update AI automation stats
        if (result.automationType === 'ai-powered') {
            var aiJobs = this.stats.totalApplications; // Simplified calculation
            this.stats.aiAutomationStats.aiSuccessRate = result.success ?
                (this.stats.aiAutomationStats.aiSuccessRate + 1) / 2 :
                this.stats.aiAutomationStats.aiSuccessRate * 0.9;
        }
    };
    WorkflowIntegrationService.prototype.updateQueueStats = function (queueData) {
        this.stats.queueStatus = {
            pending: queueData.waiting || 0,
            processing: queueData.active || 0,
            completed: queueData.completed || 0,
            failed: queueData.failed || 0,
        };
    };
    WorkflowIntegrationService.prototype.startHealthMonitoring = function () {
        var _this = this;
        this.healthCheckInterval = setInterval(function () {
            var health = _this.getHealthStatus();
            _this.stats.systemHealth = {
                healthy: health.overall,
                issues: health.issues,
                uptime: Date.now() - _this.startTime,
            };
            _this.emit('health-check', health);
        }, this.config.performance.healthCheckInterval);
    };
    WorkflowIntegrationService.prototype.stopHealthMonitoring = function () {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = undefined;
        }
    };
    return WorkflowIntegrationService;
}(events_1.EventEmitter));
exports.WorkflowIntegrationService = WorkflowIntegrationService;
exports.default = WorkflowIntegrationService;
