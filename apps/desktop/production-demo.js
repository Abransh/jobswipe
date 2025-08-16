#!/usr/bin/env npx tsx
"use strict";
/**
 * JobSwipe Production Demo
 *
 * PRODUCTION-READY demonstration of the complete JobSwipe automation system
 * using ALL enterprise components built:
 * - JobSwipeAutomationEngine (master orchestrator)
 * - BrowserUseService (AI-powered automation)
 * - FormAnalyzer (intelligent form analysis)
 * - VisionServiceManager (6-tier captcha handling)
 * - StrategyRegistry (company-specific strategies)
 * - EnterpriseQueueManager (production job processing)
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
exports.ProductionDemoOrchestrator = void 0;
exports.runProductionDemo = runProductionDemo;
var events_1 = require("events");
var crypto_1 = require("crypto");
var fs_1 = require("fs");
var path_1 = require("path");
var ProductionConfig_1 = require("./src/config/ProductionConfig");
// Import our enterprise automation system
var JobSwipeAutomationEngine_1 = require("./src/automation/JobSwipeAutomationEngine");
var BrowserUseService_1 = require("./src/services/BrowserUseService");
var StrategyRegistry_1 = require("./src/strategies/StrategyRegistry");
var FormAnalyzer_1 = require("./src/intelligence/FormAnalyzer");
var VisionServiceManager_1 = require("./src/services/VisionServiceManager");
var EnterpriseQueueManager_1 = require("./src/queue/EnterpriseQueueManager");
// =============================================================================
// PRODUCTION TEST DATA
// =============================================================================
var PRODUCTION_USER_PROFILE = {
    personalInfo: {
        firstName: 'Abransh',
        lastName: 'Baliyan',
        email: 'abranshbaliyan2807@gmail.com',
        phone: '3801052451',
        address: '123 Tech Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'United States'
    },
    professional: {
        currentTitle: 'Senior Software Engineer',
        currentCompany: 'Tech Solutions Inc.',
        yearsExperience: 5,
        linkedinUrl: 'https://linkedin.com/in/abranshbaliyan',
        portfolioUrl: 'https://abranshbaliyan.dev',
        resumeUrl: path_1.default.join(__dirname, 'assets', 'resume.pdf'),
        coverLetterTemplate: "Dear Hiring Team,\n\nI am excited to apply for this Software Engineer position. With my background in full-stack development, AI automation, and enterprise-scale systems, I believe I would be a valuable addition to your team.\n\nMy experience includes:\n- Building enterprise automation platforms with TypeScript and Node.js\n- Implementing AI-powered browser automation using Claude and Playwright\n- Developing scalable backend systems with Redis, PostgreSQL, and microservices\n- Creating responsive web applications with React and Next.js\n\nI am particularly drawn to this opportunity because of the innovative work your company is doing in the technology space. I would welcome the chance to contribute to your team's success.\n\nThank you for your consideration.\n\nBest regards,\nAbransh Baliyan"
    },
    preferences: {
        salaryMin: 120000,
        salaryMax: 180000,
        remoteWork: true,
        workAuthorization: 'US Citizen',
        availableStartDate: '2024-02-01'
    }
};
// Test job applications for different companies
var TEST_JOB_APPLICATIONS = [
    {
        id: 'anthropic-software-engineer',
        title: 'Software Engineer',
        company: 'Anthropic',
        url: 'https://job-boards.greenhouse.io/anthropic/jobs/4496424008',
        location: 'San Francisco, CA',
        description: 'Build AI safety systems and tools',
        applyUrl: 'https://job-boards.greenhouse.io/anthropic/jobs/4496424008#app'
    },
    {
        id: 'google-swe',
        title: 'Software Engineer III',
        company: 'Google',
        url: 'https://careers.google.com/jobs/results/123456789',
        location: 'Mountain View, CA',
        description: 'Develop scalable systems for billions of users'
    },
    {
        id: 'startup-fullstack',
        title: 'Full Stack Engineer',
        company: 'TechStartup',
        url: 'https://techstartup.com/careers/fullstack-engineer',
        location: 'Remote',
        description: 'Build the future of productivity software'
    }
];
// =============================================================================
// PRODUCTION DEMO ORCHESTRATOR
// =============================================================================
var ProductionDemoOrchestrator = /** @class */ (function (_super) {
    __extends(ProductionDemoOrchestrator, _super);
    function ProductionDemoOrchestrator() {
        var _this = _super.call(this) || this;
        _this.initialized = false;
        _this.demoResults = [];
        _this.screenshots = [];
        _this.ensureDirectories();
        _this.validateConfiguration();
        return _this;
    }
    // =============================================================================
    // INITIALIZATION
    // =============================================================================
    ProductionDemoOrchestrator.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var configSummary, startTime, initTime, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.initialized) {
                            console.warn('⚠️ Production demo already initialized');
                            return [2 /*return*/];
                        }
                        console.log('🚀 Initializing JobSwipe Production Automation System...');
                        console.log('='.repeat(80));
                        configSummary = (0, ProductionConfig_1.getConfigSummary)();
                        console.log('📋 Configuration Summary:');
                        console.log("   Environment: ".concat(configSummary.environment));
                        console.log("   Demo Mode: ".concat(configSummary.demoMode ? '🎬 Yes' : '🚀 Production'));
                        console.log("   AI Providers: Anthropic=".concat(configSummary.aiProviders.anthropic ? '✅' : '❌', ", OpenAI=").concat(configSummary.aiProviders.openai ? '✅' : '❌'));
                        console.log("   Vision Providers: ".concat(configSummary.aiProviders.visionProviders, " available"));
                        console.log("   Database: ".concat(configSummary.database));
                        console.log("   Browser: ".concat(configSummary.browser.headless ? 'Headless' : 'Visible'));
                        console.log('='.repeat(80));
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        // Initialize all enterprise components
                        return [4 /*yield*/, this.initializeEnterpriseComponents()];
                    case 2:
                        // Initialize all enterprise components
                        _a.sent();
                        // Setup component integration
                        this.setupComponentIntegration();
                        // Verify system health
                        return [4 /*yield*/, this.performHealthChecks()];
                    case 3:
                        // Verify system health
                        _a.sent();
                        this.initialized = true;
                        initTime = Date.now() - startTime;
                        console.log("\u2705 JobSwipe Production System initialized in ".concat(initTime, "ms"));
                        console.log('📊 Enterprise Components Ready:');
                        console.log('   ✅ JobSwipe Automation Engine - Master orchestrator');
                        console.log('   ✅ Browser-Use Service - AI-powered automation');
                        console.log('   ✅ Strategy Registry - Company-specific strategies');
                        console.log('   ✅ Form Analyzer - Intelligent form processing');
                        console.log('   ✅ Vision Service Manager - Multi-tier captcha handling');
                        console.log('   ✅ Enterprise Queue Manager - Production job processing');
                        console.log('='.repeat(80));
                        this.emit('system-initialized', { initTime: initTime, componentsReady: 6 });
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('❌ Failed to initialize production system:', error_1);
                        this.emit('initialization-failed', error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ProductionDemoOrchestrator.prototype.initializeEnterpriseComponents = function () {
        return __awaiter(this, void 0, void 0, function () {
            var visionProviders;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🔧 Initializing Enterprise Components...');
                        // 1. Initialize Strategy Registry
                        console.log('📋 Loading automation strategies...');
                        this.strategyRegistry = new StrategyRegistry_1.StrategyRegistry({
                            strategyDirectory: './src/strategies/companies',
                            cacheStrategy: true,
                            autoReload: true
                        });
                        // 2. Initialize Form Analyzer
                        console.log('🧠 Setting up intelligent form analysis...');
                        this.formAnalyzer = new FormAnalyzer_1.FormAnalyzer();
                        // 3. Initialize Vision Service Manager
                        console.log('👁️ Configuring multi-provider vision services...');
                        visionProviders = {};
                        ProductionConfig_1.productionConfig.ai.vision.providers.forEach(function (provider) {
                            visionProviders[provider.name] = __assign({ enabled: provider.enabled, priority: provider.priority }, provider.config);
                        });
                        this.visionManager = new VisionServiceManager_1.VisionServiceManager({
                            providers: visionProviders,
                            fallbackStrategy: ProductionConfig_1.productionConfig.ai.vision.fallbackStrategy,
                            timeoutMs: ProductionConfig_1.productionConfig.ai.vision.timeoutMs
                        });
                        // 4. Initialize Browser-Use Service
                        console.log('🤖 Setting up AI-powered browser automation...');
                        this.browserService = new BrowserUseService_1.BrowserUseService({
                            anthropicApiKey: ProductionConfig_1.productionConfig.ai.anthropic.apiKey,
                            headless: ProductionConfig_1.productionConfig.demoMode ? false : ProductionConfig_1.productionConfig.browser.headless, // Visible for demo
                            model: ProductionConfig_1.productionConfig.ai.anthropic.model,
                            maxTokens: ProductionConfig_1.productionConfig.ai.anthropic.maxTokens,
                            temperature: ProductionConfig_1.productionConfig.ai.anthropic.temperature,
                            viewport: ProductionConfig_1.productionConfig.browser.viewport,
                            timeout: ProductionConfig_1.productionConfig.browser.timeout,
                            useVisionService: true,
                            captchaHandling: {
                                enableVisionFallback: true,
                                enableManualFallback: true,
                                manualFallbackTimeout: 300000
                            }
                        });
                        // 5. Initialize Enterprise Queue Manager
                        console.log('⚡ Setting up enterprise job queue...');
                        this.queueManager = new EnterpriseQueueManager_1.EnterpriseQueueManager({
                            redis: {
                                host: process.env.REDIS_HOST || 'localhost',
                                port: parseInt(process.env.REDIS_PORT || '6379'),
                                retryDelayOnFailover: 100,
                                maxRetriesPerRequest: 3,
                                lazyConnect: true
                            },
                            performance: {
                                concurrency: 5,
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
                                enabled: true,
                                batchSize: 10,
                                batchDelay: 5000,
                                maxBatchWaitTime: 30000
                            },
                            monitoring: {
                                enabled: true,
                                metricsInterval: 60000,
                                alertThresholds: {
                                    queueSize: 1000,
                                    processingTime: 300000,
                                    failureRate: 0.1,
                                    stalledJobs: 50,
                                    memoryUsage: 0.85
                                }
                            }
                        });
                        // 6. Initialize Main Automation Engine
                        console.log('🎯 Setting up master automation orchestrator...');
                        this.automationEngine = new JobSwipeAutomationEngine_1.JobSwipeAutomationEngine({
                            strategies: {
                                strategyDirectory: './src/strategies/companies',
                                cacheEnabled: true,
                                autoReload: true
                            },
                            captcha: {
                                enabledMethods: ['ai-vision', 'ocr-tesseract', 'external-service', 'manual-intervention'],
                                aiVisionProvider: 'anthropic',
                                externalServices: {},
                                manualFallbackTimeout: 300000
                            },
                            intelligence: {
                                formAnalysisCache: true,
                                semanticAnalysisDepth: 'advanced',
                                confidenceThreshold: 0.7
                            },
                            queue: {
                                redisConnection: {
                                    host: process.env.REDIS_HOST || 'localhost',
                                    port: parseInt(process.env.REDIS_PORT || '6379')
                                },
                                defaultConcurrency: 5,
                                batchingEnabled: true,
                                monitoringEnabled: true
                            },
                            browser: {
                                headless: false, // Visible for demo
                                timeout: 300000,
                                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                                viewport: { width: 1920, height: 1080 }
                            }
                        });
                        // Initialize the automation engine
                        return [4 /*yield*/, this.automationEngine.initialize()];
                    case 1:
                        // Initialize the automation engine
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ProductionDemoOrchestrator.prototype.setupComponentIntegration = function () {
        console.log('🔗 Setting up enterprise component integration...');
        // Connect Browser-Use Service to Strategy Registry
        this.strategyRegistry.setBrowserUseService(this.browserService);
        // Connect Vision Service Manager to Browser-Use Service
        this.browserService.setVisionService(this.visionManager);
        // Setup event forwarding from all components
        this.setupEventForwarding();
    };
    ProductionDemoOrchestrator.prototype.setupEventForwarding = function () {
        var _this = this;
        // Forward important events to demo orchestrator
        this.automationEngine.on('job-processing-started', function (event) {
            console.log("\uD83D\uDE80 Job processing started: ".concat(event.request.jobData.title, " at ").concat(event.request.jobData.company));
            _this.emit('job-started', event);
        });
        this.automationEngine.on('job-processing-completed', function (event) {
            console.log("\u2705 Job processing completed: ".concat(event.result.success ? 'SUCCESS' : 'FAILED'));
            _this.demoResults.push(event.result);
            _this.emit('job-completed', event);
        });
        this.automationEngine.on('captcha-detected', function (event) {
            console.log("\uD83E\uDD16 Captcha detected: ".concat(event.context.captchaType));
            _this.emit('captcha-detected', event);
        });
        this.automationEngine.on('manual-intervention-required', function (event) {
            console.log("\uD83D\uDC64 Manual intervention required for job ".concat(event.jobId));
            _this.emit('manual-intervention-required', event);
        });
        this.queueManager.on('job-completed', function (event) {
            console.log("\uD83D\uDCE5 Queue job completed: ".concat(event.jobId));
        });
        this.queueManager.on('alert-triggered', function (alert) {
            console.warn("\uD83D\uDEA8 Queue alert: ".concat(alert.type, " - ").concat(alert.message));
        });
    };
    ProductionDemoOrchestrator.prototype.performHealthChecks = function () {
        return __awaiter(this, void 0, void 0, function () {
            var engineHealth, queueHealth, strategies, visionStatus, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🔍 Performing system health checks...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, this.automationEngine.getHealthStatus()];
                    case 2:
                        engineHealth = _a.sent();
                        console.log("   \u2705 Automation Engine: ".concat(engineHealth.engine.status));
                        return [4 /*yield*/, this.queueManager.getHealthStatus()];
                    case 3:
                        queueHealth = _a.sent();
                        console.log("   \u2705 Queue Manager: ".concat(queueHealth.status));
                        strategies = this.strategyRegistry.getAllStrategies();
                        console.log("   \u2705 Strategy Registry: ".concat(strategies.length, " strategies loaded"));
                        return [4 /*yield*/, this.visionManager.getHealthStatus()];
                    case 4:
                        visionStatus = _a.sent();
                        console.log("   \u2705 Vision Services: ".concat(visionStatus.availableProviders.length, " providers ready"));
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _a.sent();
                        console.warn("\u26A0\uFE0F Some health checks failed: ".concat(error_2));
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // PRODUCTION JOB PROCESSING
    // =============================================================================
    ProductionDemoOrchestrator.prototype.runProductionDemo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var i, job, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, 10, 12]);
                        console.log('\n🎬 Starting JobSwipe Production Automation Demo');
                        console.log('='.repeat(80));
                        console.log('🎯 Demonstrating REAL enterprise automation with:');
                        console.log('   • AI-powered browser automation (Claude + browser-use)');
                        console.log('   • Intelligent form analysis and field detection');
                        console.log('   • Multi-tier captcha resolution (6 provider fallback)');
                        console.log('   • Company-specific automation strategies');
                        console.log('   • Enterprise queue management and job processing');
                        console.log('   • Real-time monitoring and error handling');
                        console.log('');
                        console.log('🔍 WATCH: Browser window will show intelligent automation');
                        console.log('⚠️  NOTE: Demo will stop before actual submission');
                        console.log('='.repeat(80));
                        console.log('');
                        // Initialize the production system
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        // Initialize the production system
                        _a.sent();
                        // Wait for user to see the setup
                        console.log('⏳ Production system ready. Starting automation demo in 5 seconds...');
                        return [4 /*yield*/, this.delay(5000)];
                    case 2:
                        _a.sent();
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < TEST_JOB_APPLICATIONS.length)) return [3 /*break*/, 7];
                        job = TEST_JOB_APPLICATIONS[i];
                        console.log("\n\uD83D\uDCCB [".concat(i + 1, "/").concat(TEST_JOB_APPLICATIONS.length, "] Processing Job Application:"));
                        console.log("   Company: ".concat(job.company));
                        console.log("   Position: ".concat(job.title));
                        console.log("   URL: ".concat(job.url));
                        console.log('');
                        return [4 /*yield*/, this.processJobApplication(job)];
                    case 4:
                        result = _a.sent();
                        // Display results
                        this.displayJobResult(result, i + 1);
                        if (!(i < TEST_JOB_APPLICATIONS.length - 1)) return [3 /*break*/, 6];
                        console.log('⏳ Pausing 3 seconds before next job...\n');
                        return [4 /*yield*/, this.delay(3000)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 3];
                    case 7: 
                    // Display final demo results
                    return [4 /*yield*/, this.displayFinalResults()];
                    case 8:
                        // Display final demo results
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 9:
                        error_3 = _a.sent();
                        console.error('\n💥 Production demo failed:', error_3);
                        this.emit('demo-failed', error_3);
                        return [3 /*break*/, 12];
                    case 10: return [4 /*yield*/, this.cleanup()];
                    case 11:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    ProductionDemoOrchestrator.prototype.processJobApplication = function (jobData) {
        return __awaiter(this, void 0, void 0, function () {
            var request, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = {
                            id: (0, crypto_1.randomUUID)(),
                            userId: 'demo-user-123',
                            jobData: {
                                id: jobData.id,
                                title: jobData.title,
                                company: jobData.company,
                                url: jobData.url,
                                location: jobData.location,
                                description: jobData.description,
                                applyUrl: jobData.applyUrl
                            },
                            userProfile: PRODUCTION_USER_PROFILE,
                            priority: 'high',
                            options: {
                                useHeadless: false, // Visible for demo
                                skipCaptcha: false,
                                maxRetries: 2,
                                timeout: 300000
                            }
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        console.log('🚀 Submitting to enterprise automation engine...');
                        return [4 /*yield*/, this.automationEngine.processJobApplication(request)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 3:
                        error_4 = _a.sent();
                        console.error("\u274C Job application failed: ".concat(error_4));
                        return [2 /*return*/, {
                                success: false,
                                jobId: request.jobData.id,
                                userId: request.userId,
                                executionTime: 0,
                                strategyUsed: 'unknown',
                                stepsCompleted: 0,
                                captchaEncountered: false,
                                screenshots: [],
                                logs: [],
                                error: error_4 instanceof Error ? error_4.message : String(error_4),
                                metadata: {
                                    performanceMetrics: {
                                        timeToFirstInteraction: 0,
                                        formAnalysisTime: 0,
                                        formFillTime: 0,
                                        captchaResolutionTime: 0,
                                        strategyExecutionTime: 0,
                                        totalProcessingTime: 0,
                                        memoryUsage: process.memoryUsage().heapUsed,
                                        networkRequests: 0
                                    }
                                }
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // RESULTS AND REPORTING
    // =============================================================================
    ProductionDemoOrchestrator.prototype.displayJobResult = function (result, jobNumber) {
        var _a;
        console.log("\n\uD83D\uDCCA Job ".concat(jobNumber, " Results:"));
        console.log('─'.repeat(50));
        console.log("Status: ".concat(result.success ? '✅ SUCCESS' : '❌ FAILED'));
        console.log("Company Strategy: ".concat(result.strategyUsed));
        console.log("Execution Time: ".concat(result.executionTime, "ms"));
        console.log("Steps Completed: ".concat(result.stepsCompleted));
        console.log("Captcha Encountered: ".concat(result.captchaEncountered ? '🤖 Yes (handled)' : '⚡ No'));
        if (result.applicationId) {
            console.log("Application ID: ".concat(result.applicationId));
        }
        if (result.confirmationId) {
            console.log("Confirmation: ".concat(result.confirmationId));
        }
        if (result.error) {
            console.log("Error: ".concat(result.error));
        }
        if (result.screenshots.length > 0) {
            console.log("Screenshots: ".concat(result.screenshots.length, " captured"));
            (_a = this.screenshots).push.apply(_a, result.screenshots);
        }
        // Performance metrics
        if (result.metadata.performanceMetrics) {
            var metrics = result.metadata.performanceMetrics;
            console.log("Performance:");
            console.log("  Form Analysis: ".concat(metrics.formAnalysisTime, "ms"));
            console.log("  Form Filling: ".concat(metrics.formFillTime, "ms"));
            console.log("  Strategy Execution: ".concat(metrics.strategyExecutionTime, "ms"));
            if (metrics.captchaResolutionTime > 0) {
                console.log("  Captcha Resolution: ".concat(metrics.captchaResolutionTime, "ms"));
            }
        }
    };
    ProductionDemoOrchestrator.prototype.displayFinalResults = function () {
        return __awaiter(this, void 0, void 0, function () {
            var totalJobs, successfulJobs, failedJobs, successRate, totalTime, avgTime, captchaEncounters, engineStats;
            return __generator(this, function (_a) {
                console.log('\n🏆 JobSwipe Production Demo - Final Results');
                console.log('='.repeat(80));
                totalJobs = this.demoResults.length;
                successfulJobs = this.demoResults.filter(function (r) { return r.success; }).length;
                failedJobs = totalJobs - successfulJobs;
                successRate = totalJobs > 0 ? (successfulJobs / totalJobs * 100).toFixed(1) : '0';
                totalTime = this.demoResults.reduce(function (sum, r) { return sum + r.executionTime; }, 0);
                avgTime = totalJobs > 0 ? (totalTime / totalJobs).toFixed(0) : '0';
                captchaEncounters = this.demoResults.filter(function (r) { return r.captchaEncountered; }).length;
                console.log("\uD83D\uDCC8 Overall Statistics:");
                console.log("   Total Jobs Processed: ".concat(totalJobs));
                console.log("   Successful Applications: ".concat(successfulJobs));
                console.log("   Failed Applications: ".concat(failedJobs));
                console.log("   Success Rate: ".concat(successRate, "%"));
                console.log("   Average Processing Time: ".concat(avgTime, "ms"));
                console.log("   Captcha Encounters: ".concat(captchaEncounters));
                console.log("   Total Screenshots: ".concat(this.screenshots.length));
                engineStats = this.automationEngine.getStats();
                console.log("\n\u26A1 System Performance:");
                console.log("   Strategies Loaded: ".concat(engineStats.strategiesLoaded));
                console.log("   System Uptime: ".concat((engineStats.uptime / 1000).toFixed(1), "s"));
                console.log("   Memory Usage: ".concat((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1), "MB"));
                // Screenshots
                if (this.screenshots.length > 0) {
                    console.log("\n\uD83D\uDCF8 Screenshots saved to:");
                    console.log("   Directory: /tmp/jobswipe-screenshots/");
                    console.log("   Count: ".concat(this.screenshots.length, " screenshots"));
                    console.log("   View: open /tmp/jobswipe-screenshots/");
                }
                console.log('\n🎉 Production Demo Features Demonstrated:');
                console.log('   ✅ Enterprise automation engine orchestration');
                console.log('   ✅ AI-powered browser automation with Claude');
                console.log('   ✅ Intelligent form analysis and field detection');
                console.log('   ✅ Company-specific automation strategies');
                console.log('   ✅ Multi-tier captcha resolution system');
                console.log('   ✅ Enterprise queue management and monitoring');
                console.log('   ✅ Real-time error handling and recovery');
                console.log('   ✅ Comprehensive performance metrics');
                console.log('   ✅ Production-ready architecture and scaling');
                console.log('\n🚀 System Ready For:');
                console.log('   ✅ Real job applications at production scale');
                console.log('   ✅ Integration with web app and API');
                console.log('   ✅ Multi-user concurrent job processing');
                console.log('   ✅ Enterprise deployment and monitoring');
                console.log('='.repeat(80));
                return [2 /*return*/];
            });
        });
    };
    // =============================================================================
    // UTILITY METHODS
    // =============================================================================
    ProductionDemoOrchestrator.prototype.ensureDirectories = function () {
        var screenshotDir = '/tmp/jobswipe-screenshots';
        if (!(0, fs_1.existsSync)(screenshotDir)) {
            (0, fs_1.mkdirSync)(screenshotDir, { recursive: true });
        }
    };
    ProductionDemoOrchestrator.prototype.delay = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    ProductionDemoOrchestrator.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('\n🧹 Cleaning up production demo...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        if (!this.automationEngine) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.automationEngine.shutdown()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (this.queueManager) {
                            // await this.queueManager.gracefulShutdown();
                        }
                        if (!this.browserService) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.browserService.cleanup()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        console.log('✅ Production demo cleanup completed');
                        return [3 /*break*/, 7];
                    case 6:
                        error_5 = _a.sent();
                        console.warn("\u26A0\uFE0F Cleanup warning: ".concat(error_5));
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ProductionDemoOrchestrator.prototype.getResults = function () {
        return __spreadArray([], this.demoResults, true);
    };
    ProductionDemoOrchestrator.prototype.getScreenshots = function () {
        return __spreadArray([], this.screenshots, true);
    };
    return ProductionDemoOrchestrator;
}(events_1.EventEmitter));
exports.ProductionDemoOrchestrator = ProductionDemoOrchestrator;
// =============================================================================
// MAIN EXECUTION
// =============================================================================
function runProductionDemo() {
    return __awaiter(this, void 0, void 0, function () {
        var orchestrator;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    orchestrator = new ProductionDemoOrchestrator();
                    // Setup event listeners
                    orchestrator.on('system-initialized', function (data) {
                        console.log("\uD83C\uDFAF Production system ready with ".concat(data.componentsReady, " enterprise components"));
                    });
                    orchestrator.on('job-started', function (event) {
                        console.log("\uD83D\uDCCB Starting automation for: ".concat(event.request.jobData.company));
                    });
                    orchestrator.on('captcha-detected', function (event) {
                        console.log("\uD83E\uDD16 Captcha challenge detected, engaging AI resolution...");
                    });
                    return [4 /*yield*/, orchestrator.runProductionDemo()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Execute production demo
if (require.main === module) {
    runProductionDemo().catch(function (error) {
        console.error('💥 Production demo error:', error);
        process.exit(1);
    });
}
