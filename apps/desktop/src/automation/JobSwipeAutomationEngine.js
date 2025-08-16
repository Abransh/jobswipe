"use strict";
/**
 * @fileoverview JobSwipe Automation Engine - Enterprise Integration
 * @description Unified automation system integrating all enterprise components
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Enterprise-grade automation engine with comprehensive integration
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobSwipeAutomationEngine = void 0;
var events_1 = require("events");
var crypto_1 = require("crypto");
var electron_store_1 = require("electron-store");
// Import our enterprise components
var StrategyRegistry_1 = require("../strategies/StrategyRegistry");
var AdvancedCaptchaHandler_1 = require("../captcha/AdvancedCaptchaHandler");
var FormAnalyzer_1 = require("../intelligence/FormAnalyzer");
var EnterpriseQueueManager_1 = require("../queue/EnterpriseQueueManager");
// =============================================================================
// JOBSWIPE AUTOMATION ENGINE
// =============================================================================
var JobSwipeAutomationEngine = /** @class */ (function (_super) {
    __extends(JobSwipeAutomationEngine, _super);
    function JobSwipeAutomationEngine(config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this) || this;
        // State Management
        _this.initialized = false;
        _this.activeJobs = new Map();
        _this.startTime = new Date();
        _this.config = {
            strategies: __assign({ strategyDirectory: './strategies/companies', cacheEnabled: true, autoReload: true }, config.strategies),
            captcha: __assign({ enabledMethods: ['ai-vision', 'ocr-tesseract', 'external-service', 'manual-intervention'], aiVisionProvider: 'anthropic', externalServices: {}, manualFallbackTimeout: 300000 }, config.captcha),
            intelligence: __assign({ formAnalysisCache: true, semanticAnalysisDepth: 'advanced', confidenceThreshold: 0.7 }, config.intelligence),
            queue: __assign({ redisConnection: null, defaultConcurrency: 10, batchingEnabled: true, monitoringEnabled: true }, config.queue),
            browser: __assign({ headless: true, timeout: 300000, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', viewport: { width: 1920, height: 1080 } }, config.browser)
        };
        _this.store = new electron_store_1.default({
            name: 'jobswipe-automation-engine',
            defaults: {
                stats: {
                    totalJobsProcessed: 0,
                    successfulApplications: 0,
                    failedApplications: 0,
                    averageProcessingTime: 0,
                    captchaEncounterRate: 0,
                    captchaSuccessRate: 0,
                    strategiesLoaded: 0,
                    queueMetrics: {},
                    uptime: 0
                },
                configuration: {}
            }
        });
        _this.stats = _this.store.get('stats');
        _this.initializeComponents();
        return _this;
    }
    // =============================================================================
    // INITIALIZATION
    // =============================================================================
    /**
     * Initialize the automation engine with all components
     */
    JobSwipeAutomationEngine.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, strategies, initTime, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.initialized) {
                            console.warn('⚠️ JobSwipe Automation Engine already initialized');
                            return [2 /*return*/];
                        }
                        console.log('🚀 Initializing JobSwipe Automation Engine...');
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // Initialize components in dependency order
                        console.log('📋 Initializing Strategy Registry...');
                        // Strategy Registry initializes itself in constructor
                        console.log('🤖 Initializing Captcha Handler...');
                        // Captcha Handler initializes itself in constructor
                        console.log('🧠 Initializing Form Analyzer...');
                        // Form Analyzer initializes itself in constructor
                        console.log('⚡ Initializing Queue Manager...');
                        return [4 /*yield*/, this.queueManager.initialize()];
                    case 2:
                        _a.sent();
                        // Setup inter-component communication
                        this.setupComponentIntegration();
                        strategies = this.strategyRegistry.getAllStrategies();
                        this.stats.strategiesLoaded = strategies.length;
                        this.initialized = true;
                        initTime = Date.now() - startTime;
                        console.log("\u2705 JobSwipe Automation Engine initialized in ".concat(initTime, "ms"));
                        console.log("\uD83D\uDCCA Loaded ".concat(strategies.length, " automation strategies"));
                        this.emit('engine-initialized', {
                            initTime: initTime,
                            strategiesLoaded: strategies.length,
                            componentsReady: {
                                strategyRegistry: true,
                                captchaHandler: true,
                                formAnalyzer: true,
                                queueManager: true
                            }
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('❌ Failed to initialize JobSwipe Automation Engine:', error_1);
                        this.emit('engine-initialization-failed', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initialize core components
     */
    JobSwipeAutomationEngine.prototype.initializeComponents = function () {
        // Initialize Strategy Registry
        this.strategyRegistry = new StrategyRegistry_1.StrategyRegistry({
            strategyDirectory: this.config.strategies.strategyDirectory,
            cacheStrategy: this.config.strategies.cacheEnabled,
            autoReload: this.config.strategies.autoReload
        });
        // Initialize Advanced Captcha Handler
        this.captchaHandler = new AdvancedCaptchaHandler_1.AdvancedCaptchaHandler({
            enabledMethods: this.config.captcha.enabledMethods,
            aiVision: {
                provider: this.config.captcha.aiVisionProvider,
                model: 'claude-3-sonnet-20240229',
                apiKey: process.env.ANTHROPIC_API_KEY || '',
                maxTokens: 1000,
                temperature: 0.1
            },
            manual: {
                enabled: true,
                timeout: this.config.captcha.manualFallbackTimeout,
                notificationMethod: 'ui'
            }
        });
        // Initialize Form Analyzer
        this.formAnalyzer = new FormAnalyzer_1.FormAnalyzer();
        // Initialize Enterprise Queue Manager
        this.queueManager = new EnterpriseQueueManager_1.EnterpriseQueueManager({
            redis: this.config.queue.redisConnection,
            performance: {
                concurrency: this.config.queue.defaultConcurrency,
                stalledInterval: 30000,
                maxStalledCount: 2,
                removeOnComplete: 1000,
                removeOnFail: 500,
                defaultJobOptions: {
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 2000 },
                    removeOnComplete: true,
                    removeOnFail: true
                }
            },
            batching: {
                enabled: this.config.queue.batchingEnabled,
                batchSize: 25,
                batchDelay: 3000,
                maxBatchWaitTime: 30000
            },
            monitoring: {
                enabled: this.config.queue.monitoringEnabled,
                metricsInterval: 60000,
                alertThresholds: {
                    queueSize: 5000,
                    processingTime: 300000,
                    failureRate: 0.1,
                    stalledJobs: 50,
                    memoryUsage: 0.85
                }
            }
        });
    };
    /**
     * Setup integration between components
     */
    JobSwipeAutomationEngine.prototype.setupComponentIntegration = function () {
        var _this = this;
        // Strategy Registry Events
        this.strategyRegistry.on('strategy-loaded', function (event) {
            console.log("\uD83D\uDCCB Strategy loaded: ".concat(event.data.strategy.name));
            _this.stats.strategiesLoaded++;
        });
        this.strategyRegistry.on('strategy-matched', function (event) {
            console.log("\uD83C\uDFAF Strategy matched: ".concat(event.strategyId, " for job ").concat(event.data.job.id));
        });
        // Captcha Handler Events  
        this.captchaHandler.on('captcha-detected', function (event) {
            console.log("\uD83E\uDD16 Captcha detected: ".concat(event.context.captchaType, " for job ").concat(event.context.jobId));
            _this.emit('captcha-detected', event);
        });
        this.captchaHandler.on('captcha-resolved', function (event) {
            console.log("\u2705 Captcha resolved via ".concat(event.solution.method, " for job ").concat(event.context.jobId));
            _this.updateCaptchaStats(event.solution.success);
        });
        this.captchaHandler.on('manual-intervention-required', function (event) {
            console.log("\uD83D\uDC64 Manual captcha intervention required for job ".concat(event.jobId));
            _this.emit('manual-intervention-required', event);
        });
        // Form Analyzer Events
        this.formAnalyzer.on('analysis-completed', function (event) {
            console.log("\uD83E\uDDE0 Form analysis completed: ".concat(event.elementsFound, " elements found in ").concat(event.analysisTime, "ms"));
        });
        // Queue Manager Events
        this.queueManager.on('job-completed', function (event) {
            console.log("\u2705 Queue job completed: ".concat(event.jobId, " in ").concat(event.duration, "ms"));
            _this.updateJobStats(true, event.duration);
        });
        this.queueManager.on('job-failed', function (event) {
            console.error("\u274C Queue job failed: ".concat(event.jobId, " - ").concat(event.error));
            _this.updateJobStats(false, event.duration);
        });
        this.queueManager.on('alert-triggered', function (alert) {
            console.warn("\uD83D\uDEA8 Queue alert: ".concat(alert.type, " in ").concat(alert.queue, " (").concat(alert.severity, ")"));
            _this.emit('queue-alert', alert);
        });
    };
    // =============================================================================
    // MAIN AUTOMATION INTERFACE
    // =============================================================================
    /**
     * Process a job application request
     */
    JobSwipeAutomationEngine.prototype.processJobApplication = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var processingId, startTime, perfMetrics, queueJobData, queueJob, result, totalTime, automationResult, error_2, errorMessage, totalTime, errorResult;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.initialized) {
                            throw new Error('Automation engine not initialized');
                        }
                        processingId = (0, crypto_1.randomUUID)();
                        startTime = Date.now();
                        console.log("\uD83D\uDE80 [".concat(processingId, "] Processing job application: ").concat(request.jobData.title, " at ").concat(request.jobData.company));
                        this.activeJobs.set(request.id, request);
                        this.emit('job-processing-started', { processingId: processingId, request: request });
                        perfMetrics = {
                            timeToFirstInteraction: 0,
                            formAnalysisTime: 0,
                            formFillTime: 0,
                            captchaResolutionTime: 0,
                            strategyExecutionTime: 0,
                            totalProcessingTime: 0,
                            memoryUsage: process.memoryUsage().heapUsed,
                            networkRequests: 0
                        };
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, 5, 6]);
                        queueJobData = {
                            id: request.id,
                            userId: request.userId,
                            jobId: request.jobData.id,
                            type: request.priority === 'critical' ? 'priority' : 'standard',
                            payload: request,
                            metadata: {
                                createdAt: new Date(),
                                priority: this.mapPriorityToNumber(request.priority),
                                attempts: ((_a = request.options) === null || _a === void 0 ? void 0 : _a.maxRetries) || 3
                            }
                        };
                        return [4 /*yield*/, this.queueManager.addJob(queueJobData)];
                    case 2:
                        queueJob = _b.sent();
                        console.log("\uD83D\uDCE5 [".concat(processingId, "] Job queued: ").concat(queueJob.id));
                        return [4 /*yield*/, this.executeAutomation(request, perfMetrics, processingId)];
                    case 3:
                        result = _b.sent();
                        totalTime = Date.now() - startTime;
                        perfMetrics.totalProcessingTime = totalTime;
                        automationResult = {
                            success: result.success,
                            jobId: request.jobData.id,
                            userId: request.userId,
                            applicationId: result.applicationId,
                            confirmationId: result.confirmationId,
                            executionTime: totalTime,
                            strategyUsed: result.strategyUsed || 'unknown',
                            stepsCompleted: result.stepsCompleted || 0,
                            captchaEncountered: result.captchaEncountered || false,
                            screenshots: result.screenshots || [],
                            logs: result.logs || [],
                            error: result.error,
                            metadata: {
                                performanceMetrics: perfMetrics
                            }
                        };
                        console.log("\u2705 [".concat(processingId, "] Job application ").concat(result.success ? 'successful' : 'failed', " (").concat(totalTime, "ms)"));
                        this.emit('job-processing-completed', { processingId: processingId, result: automationResult });
                        return [2 /*return*/, automationResult];
                    case 4:
                        error_2 = _b.sent();
                        errorMessage = error_2 instanceof Error ? error_2.message : String(error_2);
                        totalTime = Date.now() - startTime;
                        console.error("\u274C [".concat(processingId, "] Job application failed: ").concat(errorMessage));
                        errorResult = {
                            success: false,
                            jobId: request.jobData.id,
                            userId: request.userId,
                            executionTime: totalTime,
                            strategyUsed: 'unknown',
                            stepsCompleted: 0,
                            captchaEncountered: false,
                            screenshots: [],
                            logs: [],
                            error: errorMessage,
                            metadata: {
                                performanceMetrics: perfMetrics
                            }
                        };
                        this.emit('job-processing-failed', { processingId: processingId, error: errorMessage });
                        return [2 /*return*/, errorResult];
                    case 5:
                        this.activeJobs.delete(request.id);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute the core automation logic
     */
    JobSwipeAutomationEngine.prototype.executeAutomation = function (request, perfMetrics, processingId) {
        return __awaiter(this, void 0, void 0, function () {
            var fakeJob, strategyMatchResult, strategy, mockBrowserContext, formAnalysisStart, formSchema, formError_1, strategyStart, strategyContext, strategyResult, captchaStart, captchaContext, captchaSolution, strategyError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Step 1: Find appropriate strategy
                        console.log("\uD83D\uDD0D [".concat(processingId, "] Finding strategy for ").concat(request.jobData.company));
                        fakeJob = __assign(__assign({}, request), { userProfile: request.userProfile });
                        return [4 /*yield*/, this.strategyRegistry.findStrategy(fakeJob)];
                    case 1:
                        strategyMatchResult = _a.sent();
                        if (!strategyMatchResult.matched || !strategyMatchResult.strategy) {
                            throw new Error("No suitable automation strategy found for ".concat(request.jobData.company));
                        }
                        strategy = strategyMatchResult.strategy;
                        console.log("\uD83C\uDFAF [".concat(processingId, "] Using strategy: ").concat(strategy.name, " (confidence: ").concat(strategyMatchResult.confidence, ")"));
                        // Step 2: Create browser context (simulated)
                        console.log("\uD83C\uDF10 [".concat(processingId, "] Creating browser context"));
                        mockBrowserContext = this.createMockBrowserContext(request);
                        perfMetrics.timeToFirstInteraction = Date.now();
                        // Step 3: Form Analysis
                        console.log("\uD83E\uDDE0 [".concat(processingId, "] Analyzing form structure"));
                        formAnalysisStart = Date.now();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.simulateFormAnalysis(request, mockBrowserContext.page)];
                    case 3:
                        formSchema = _a.sent();
                        perfMetrics.formAnalysisTime = Date.now() - formAnalysisStart;
                        console.log("\u2705 [".concat(processingId, "] Form analysis completed: ").concat(formSchema.elements.length, " elements"));
                        return [3 /*break*/, 5];
                    case 4:
                        formError_1 = _a.sent();
                        console.warn("\u26A0\uFE0F [".concat(processingId, "] Form analysis failed, proceeding with strategy-based approach"));
                        return [3 /*break*/, 5];
                    case 5:
                        // Step 4: Strategy Execution
                        console.log("\u26A1 [".concat(processingId, "] Executing automation strategy"));
                        strategyStart = Date.now();
                        strategyContext = {
                            job: fakeJob,
                            page: mockBrowserContext.page,
                            userProfile: request.userProfile,
                            strategy: strategy,
                            sessionData: {
                                sessionId: processingId,
                                startTime: new Date(),
                                cookies: [],
                                localStorage: {},
                                sessionStorage: {},
                                navigationHistory: [request.jobData.url],
                                screenshots: []
                            }
                        };
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 11, , 12]);
                        return [4 /*yield*/, this.strategyRegistry.executeStrategy(strategyContext)];
                    case 7:
                        strategyResult = _a.sent();
                        perfMetrics.strategyExecutionTime = Date.now() - strategyStart;
                        if (!strategyResult.captchaEncountered) return [3 /*break*/, 10];
                        console.log("\uD83E\uDD16 [".concat(processingId, "] Handling captcha"));
                        captchaStart = Date.now();
                        return [4 /*yield*/, this.captchaHandler.detectCaptcha(mockBrowserContext.page, request.jobData.id, request.userId)];
                    case 8:
                        captchaContext = _a.sent();
                        if (!captchaContext) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.captchaHandler.resolveCaptcha(captchaContext)];
                    case 9:
                        captchaSolution = _a.sent();
                        console.log("".concat(captchaSolution.success ? '✅' : '❌', " [").concat(processingId, "] Captcha resolution: ").concat(captchaSolution.method));
                        perfMetrics.captchaResolutionTime = Date.now() - captchaStart;
                        _a.label = 10;
                    case 10: return [2 /*return*/, __assign(__assign({}, strategyResult), { strategyUsed: strategy.name })];
                    case 11:
                        strategyError_1 = _a.sent();
                        console.error("\u274C [".concat(processingId, "] Strategy execution failed:"), strategyError_1);
                        throw strategyError_1;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // HELPER METHODS
    // =============================================================================
    JobSwipeAutomationEngine.prototype.createMockBrowserContext = function (request) {
        var _this = this;
        // Mock browser context for demonstration
        // In production, this would create actual Playwright browser and page
        var mockPage = {
            url: function () { return request.jobData.url; },
            goto: function (url) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, console.log("\uD83D\uDCC4 Navigating to ".concat(url))];
            }); }); },
            locator: function (selector) { return ({
                isVisible: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, Math.random() > 0.3];
                }); }); },
                click: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, console.log("\uD83D\uDC46 Clicking ".concat(selector))];
                }); }); },
                fill: function (text) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, console.log("\u2328\uFE0F Filling ".concat(selector, " with ").concat(text))];
                }); }); },
                screenshot: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, Buffer.from('fake-screenshot')];
                }); }); }
            }); },
            screenshot: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, Buffer.from('fake-screenshot')];
            }); }); },
            evaluate: function (fn) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, fn()];
            }); }); },
            mouse: {
                move: function (x, y) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, console.log("\uD83D\uDDB1\uFE0F Mouse move to ".concat(x, ",").concat(y))];
                }); }); },
                click: function (x, y) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, console.log("\uD83D\uDC46 Mouse click at ".concat(x, ",").concat(y))];
                }); }); }
            }
        };
        return { page: mockPage };
    };
    JobSwipeAutomationEngine.prototype.simulateFormAnalysis = function (request, page) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Simulate form analysis
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, Math.random() * 2000 + 1000); })];
                    case 1:
                        // Simulate form analysis
                        _a.sent();
                        return [2 /*return*/, {
                                id: (0, crypto_1.randomUUID)(),
                                url: request.jobData.url,
                                timestamp: new Date(),
                                elements: [], // Would contain actual form elements
                                sections: [],
                                flow: {
                                    steps: [],
                                    currentStep: 0,
                                    canNavigateBack: false,
                                    canNavigateForward: false
                                },
                                validation: {
                                    clientSide: false,
                                    serverSide: false,
                                    realTimeValidation: false,
                                    validationSelectors: []
                                },
                                metadata: {
                                    company: request.jobData.company,
                                    formType: 'application',
                                    estimatedFillTime: 60000,
                                    complexity: 'medium',
                                    language: 'en'
                                }
                            }];
                }
            });
        });
    };
    JobSwipeAutomationEngine.prototype.mapPriorityToNumber = function (priority) {
        var priorityMap = {
            'low': 25,
            'normal': 50,
            'high': 75,
            'critical': 100
        };
        return priorityMap[priority] || 50;
    };
    JobSwipeAutomationEngine.prototype.updateJobStats = function (success, duration) {
        this.stats.totalJobsProcessed++;
        if (success) {
            this.stats.successfulApplications++;
        }
        else {
            this.stats.failedApplications++;
        }
        // Update average processing time
        var totalJobs = this.stats.totalJobsProcessed;
        var currentAvg = this.stats.averageProcessingTime;
        this.stats.averageProcessingTime = (currentAvg * (totalJobs - 1) + duration) / totalJobs;
        this.saveStats();
    };
    JobSwipeAutomationEngine.prototype.updateCaptchaStats = function (solved) {
        // Update captcha statistics
        if (solved) {
            this.stats.captchaSuccessRate =
                (this.stats.captchaSuccessRate * 0.9) + (1 * 0.1); // Exponential moving average
        }
        else {
            this.stats.captchaSuccessRate *= 0.95;
        }
        this.saveStats();
    };
    JobSwipeAutomationEngine.prototype.saveStats = function () {
        this.stats.uptime = Date.now() - this.startTime.getTime();
        this.store.set('stats', this.stats);
    };
    // =============================================================================
    // PUBLIC API
    // =============================================================================
    /**
     * Get engine statistics
     */
    JobSwipeAutomationEngine.prototype.getStats = function () {
        this.stats.uptime = Date.now() - this.startTime.getTime();
        return __assign({}, this.stats);
    };
    /**
     * Get health status of all components
     */
    JobSwipeAutomationEngine.prototype.getHealthStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var health;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {
                            engine: {
                                status: this.initialized ? 'healthy' : 'not-initialized',
                                uptime: Date.now() - this.startTime.getTime(),
                                activeJobs: this.activeJobs.size
                            },
                            strategyRegistry: this.strategyRegistry.healthCheck(),
                            captchaHandler: {
                                status: 'healthy',
                                stats: this.captchaHandler.getStats()
                            }
                        };
                        return [4 /*yield*/, this.queueManager.getHealthStatus()];
                    case 1:
                        health = (_a.queueManager = _b.sent(),
                            _a);
                        return [2 /*return*/, health];
                }
            });
        });
    };
    /**
     * Graceful shutdown
     */
    JobSwipeAutomationEngine.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🛑 Shutting down JobSwipe Automation Engine...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        if (!(this.activeJobs.size > 0)) return [3 /*break*/, 3];
                        console.log("\u23F3 Waiting for ".concat(this.activeJobs.size, " active jobs to complete..."));
                        // In production, would implement proper job completion waiting
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })];
                    case 2:
                        // In production, would implement proper job completion waiting
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        // Shutdown queue manager
                        // await this.queueManager.gracefulShutdown(); // Would implement this method
                        // Save final stats
                        this.saveStats();
                        console.log('✅ JobSwipe Automation Engine shutdown complete');
                        this.emit('engine-shutdown');
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        console.error('❌ Error during shutdown:', error_3);
                        this.emit('engine-shutdown-error', error_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update configuration
     */
    JobSwipeAutomationEngine.prototype.updateConfig = function (newConfig) {
        this.config = __assign(__assign({}, this.config), newConfig);
        this.store.set('configuration', this.config);
        this.emit('config-updated', this.config);
    };
    /**
     * Get loaded strategies
     */
    JobSwipeAutomationEngine.prototype.getLoadedStrategies = function () {
        return this.strategyRegistry.getAllStrategies();
    };
    /**
     * Provide manual captcha solution
     */
    JobSwipeAutomationEngine.prototype.provideManualCaptchaSolution = function (sessionId, solution) {
        this.captchaHandler.provideManualSolution(sessionId, solution);
    };
    /**
     * Get active jobs
     */
    JobSwipeAutomationEngine.prototype.getActiveJobs = function () {
        return Array.from(this.activeJobs.values());
    };
    return JobSwipeAutomationEngine;
}(events_1.EventEmitter));
exports.JobSwipeAutomationEngine = JobSwipeAutomationEngine;
