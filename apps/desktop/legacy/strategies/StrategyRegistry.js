"use strict";
/**
 * @fileoverview Strategy Registry System
 * @description Central registry for managing company-specific automation strategies
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Enterprise-grade strategy management and execution
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
exports.StrategyRegistry = void 0;
var events_1 = require("events");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var electron_store_1 = require("electron-store");
var lru_cache_1 = require("lru-cache");
var StrategyTypes_1 = require("./types/StrategyTypes");
var BaseStrategy_1 = require("./base/BaseStrategy");
// Import company strategies
var linkedin_strategy_1 = require("./companies/linkedin/linkedin.strategy");
var indeed_strategy_1 = require("./companies/indeed/indeed.strategy");
var greenhouse_strategy_1 = require("./companies/greenhouse/greenhouse.strategy");
// =============================================================================
// STRATEGY REGISTRY CLASS
// =============================================================================
var StrategyRegistry = /** @class */ (function (_super) {
    __extends(StrategyRegistry, _super);
    function StrategyRegistry(config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this) || this;
        _this.strategies = new Map();
        _this.strategyInstances = new Map();
        _this.performanceCache = new lru_cache_1.LRUCache({ max: 1000 });
        _this.loadedStrategies = new Set();
        _this.watchTimeouts = new Map();
        _this.config = __assign({ strategyDirectory: path_1.default.join(__dirname, 'companies'), cacheStrategy: true, autoReload: true, performanceTracking: true, abTestingEnabled: false, fallbackStrategy: 'generic' }, config);
        _this.store = new electron_store_1.default({
            name: 'strategy-registry',
            defaults: {
                strategies: {},
                metrics: {},
                abTestResults: {},
                lastUpdate: null
            }
        });
        _this.initializeRegistry();
        return _this;
    }
    /**
     * Set browser-use service for AI-powered automation
     */
    StrategyRegistry.prototype.setBrowserUseService = function (browserUseService) {
        var _this = this;
        this.browserUseService = browserUseService;
        console.log('🤖 Browser-use service integrated with Strategy Registry');
        // Set up event forwarding
        browserUseService.on('progress', function (data) {
            _this.emit('ai-automation-progress', data);
        });
        browserUseService.on('error', function (data) {
            _this.emit('ai-automation-error', data);
        });
        browserUseService.on('captcha-detected', function (data) {
            _this.emit('ai-captcha-detected', data);
        });
    };
    // =============================================================================
    // INITIALIZATION
    // =============================================================================
    /**
     * Initialize the strategy registry
     */
    StrategyRegistry.prototype.initializeRegistry = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        console.log('🏗️ Initializing Strategy Registry...');
                        // Load built-in strategies first
                        return [4 /*yield*/, this.loadBuiltInStrategies()];
                    case 1:
                        // Load built-in strategies first
                        _a.sent();
                        // Load cached strategies
                        return [4 /*yield*/, this.loadCachedStrategies()];
                    case 2:
                        // Load cached strategies
                        _a.sent();
                        // Scan for new strategies
                        return [4 /*yield*/, this.scanAndLoadStrategies()];
                    case 3:
                        // Scan for new strategies
                        _a.sent();
                        if (!this.config.autoReload) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.setupFileWatching()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        console.log("\u2705 Strategy Registry initialized with ".concat(this.strategies.size, " strategies"));
                        this.emit('registry-initialized', {
                            strategiesLoaded: this.strategies.size,
                            timestamp: new Date()
                        });
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        console.error('❌ Failed to initialize Strategy Registry:', error_1);
                        this.emit('registry-error', { error: error_1, timestamp: new Date() });
                        throw error_1;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load built-in strategy implementations
     */
    StrategyRegistry.prototype.loadBuiltInStrategies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var linkedinStrategy, linkedinInstance, indeedStrategy, indeedInstance, greenhouseStrategy, greenhouseInstance;
            return __generator(this, function (_a) {
                console.log('📦 Loading built-in strategies...');
                linkedinStrategy = {
                    id: 'linkedin',
                    name: 'LinkedIn',
                    domains: ['linkedin.com'],
                    version: '1.0.0',
                    confidence: 0.95,
                    supportedJobTypes: ['easy-apply', 'standard'],
                    metadata: {
                        lastUpdated: new Date().toISOString(),
                        description: 'LinkedIn job application automation with Easy Apply support',
                        maintainer: 'JobSwipe Team',
                        tags: ['social-network', 'professional', 'easy-apply']
                    },
                    selectors: {
                        applyButton: [
                            '.jobs-apply-button[data-easy-apply-id]',
                            '.jobs-apply-button'
                        ],
                        forms: {
                            personalInfo: 'form[data-step="personal-info"]',
                            resume: 'form[data-step="resume"]',
                            questions: 'form[data-step="questions"]'
                        },
                        confirmation: [
                            '.jobs-apply-success',
                            '.application-outlet__success-message'
                        ]
                    },
                    workflow: {
                        steps: [
                            { name: 'navigate', action: 'goto', target: 'job.url' },
                            { name: 'apply', action: 'click', target: 'selectors.applyButton' },
                            { name: 'fill-form', action: 'form-fill', target: 'auto-detect' },
                            { name: 'submit', action: 'submit', target: 'form' }
                        ]
                    }
                };
                linkedinInstance = new linkedin_strategy_1.default(linkedinStrategy);
                this.strategies.set('linkedin', linkedinStrategy);
                this.strategyInstances.set('linkedin', linkedinInstance);
                indeedStrategy = {
                    id: 'indeed',
                    name: 'Indeed',
                    domains: ['indeed.com'],
                    version: '1.0.0',
                    confidence: 0.90,
                    supportedJobTypes: ['standard', 'quick-apply'],
                    metadata: {
                        lastUpdated: new Date().toISOString(),
                        description: 'Indeed job application automation',
                        maintainer: 'JobSwipe Team',
                        tags: ['job-board', 'general']
                    },
                    selectors: {
                        applyButton: [
                            '.ia-IndeedApplyButton',
                            '.indeed-apply-button'
                        ],
                        forms: {
                            personalInfo: '.ia-BasePage-content form',
                            resume: '.resume-upload',
                            questions: '.application-questions'
                        },
                        confirmation: [
                            '.ia-ApplicationConfirmation'
                        ]
                    },
                    workflow: {
                        steps: [
                            { name: 'navigate', action: 'goto', target: 'job.url' },
                            { name: 'apply', action: 'click', target: 'selectors.applyButton' },
                            { name: 'fill-form', action: 'form-fill', target: 'auto-detect' },
                            { name: 'submit', action: 'submit', target: 'form' }
                        ]
                    }
                };
                indeedInstance = new indeed_strategy_1.default(indeedStrategy);
                this.strategies.set('indeed', indeedStrategy);
                this.strategyInstances.set('indeed', indeedInstance);
                greenhouseStrategy = {
                    id: 'greenhouse',
                    name: 'Greenhouse',
                    domains: ['boards.greenhouse.io', 'greenhouse.io'],
                    version: '1.0.0',
                    confidence: 0.98,
                    supportedJobTypes: ['greenhouse-form'],
                    metadata: {
                        lastUpdated: new Date().toISOString(),
                        description: 'Greenhouse job board automation (used by many companies)',
                        maintainer: 'JobSwipe Team',
                        tags: ['job-board', 'ats', 'greenhouse']
                    },
                    selectors: {
                        applyButton: [
                            'a[href*="boards.greenhouse.io"][href*="application"]',
                            'button:has-text("Apply for this job")',
                            'a:has-text("Apply for this job")'
                        ],
                        forms: {
                            personalInfo: '.application-form',
                            resume: 'input[type="file"]',
                            questions: '.application-questions'
                        },
                        confirmation: [
                            '.application-confirmation',
                            '.success-message',
                            'h1:has-text("Thank you")'
                        ]
                    },
                    workflow: {
                        steps: [
                            { name: 'navigate', action: 'goto', target: 'job.url' },
                            { name: 'apply', action: 'click', target: 'selectors.applyButton' },
                            { name: 'analyze-form', action: 'ai-analyze', target: 'form-structure' },
                            { name: 'fill-steps', action: 'multi-step-fill', target: 'detected-steps' },
                            { name: 'submit', action: 'submit', target: 'form' }
                        ]
                    }
                };
                greenhouseInstance = new greenhouse_strategy_1.default(greenhouseStrategy);
                this.strategies.set('greenhouse', greenhouseStrategy);
                this.strategyInstances.set('greenhouse', greenhouseInstance);
                console.log("\u2705 Loaded ".concat(this.strategies.size, " built-in strategies"));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Load cached strategies from persistent storage
     */
    StrategyRegistry.prototype.loadCachedStrategies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cached, _i, _a, _b, id, strategy;
            return __generator(this, function (_c) {
                if (!this.config.cacheStrategy)
                    return [2 /*return*/];
                cached = this.store.get('strategies');
                for (_i = 0, _a = Object.entries(cached); _i < _a.length; _i++) {
                    _b = _a[_i], id = _b[0], strategy = _b[1];
                    this.strategies.set(id, strategy);
                    this.loadedStrategies.add(id);
                }
                console.log("\uD83D\uDCE6 Loaded ".concat(Object.keys(cached).length, " cached strategies"));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Scan directory and load all strategy files
     */
    StrategyRegistry.prototype.scanAndLoadStrategies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, companies, loadPromises, _i, companies_1, company;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, promises_1.access)(this.config.strategyDirectory)];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        console.warn("\u26A0\uFE0F Strategy directory does not exist: ".concat(this.config.strategyDirectory));
                        return [2 /*return*/];
                    case 3: return [4 /*yield*/, (0, promises_1.readdir)(this.config.strategyDirectory, { withFileTypes: true })];
                    case 4:
                        companies = _b.sent();
                        loadPromises = [];
                        for (_i = 0, companies_1 = companies; _i < companies_1.length; _i++) {
                            company = companies_1[_i];
                            if (company.isDirectory()) {
                                loadPromises.push(this.loadCompanyStrategy(company.name));
                            }
                        }
                        return [4 /*yield*/, Promise.allSettled(loadPromises)];
                    case 5:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load strategy for a specific company
     */
    StrategyRegistry.prototype.loadCompanyStrategy = function (companyName) {
        return __awaiter(this, void 0, void 0, function () {
            var companyDir, configPath, configContent, strategy, implPath, StrategyClass, instance, implError_1, cachedStrategies, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        companyDir = path_1.default.join(this.config.strategyDirectory, companyName);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        configPath = path_1.default.join(companyDir, 'strategy.json');
                        return [4 /*yield*/, (0, promises_1.readFile)(configPath, 'utf-8')];
                    case 2:
                        configContent = _a.sent();
                        strategy = JSON.parse(configContent);
                        // Validate strategy structure
                        if (!this.validateStrategyStructure(strategy)) {
                            throw new Error("Invalid strategy structure for ".concat(companyName));
                        }
                        implPath = path_1.default.join(companyDir, "".concat(companyName, ".strategy.ts"));
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.loadStrategyClass(implPath)];
                    case 4:
                        StrategyClass = _a.sent();
                        instance = new StrategyClass(strategy);
                        this.strategyInstances.set(strategy.id, instance);
                        return [3 /*break*/, 6];
                    case 5:
                        implError_1 = _a.sent();
                        console.warn("\u26A0\uFE0F No implementation found for ".concat(companyName, ", using base strategy"));
                        return [3 /*break*/, 6];
                    case 6:
                        // Register strategy
                        this.strategies.set(strategy.id, strategy);
                        this.loadedStrategies.add(strategy.id);
                        // Cache strategy
                        if (this.config.cacheStrategy) {
                            cachedStrategies = this.store.get('strategies');
                            cachedStrategies[strategy.id] = strategy;
                            this.store.set('strategies', cachedStrategies);
                        }
                        console.log("\u2705 Loaded strategy: ".concat(strategy.name, " (").concat(strategy.id, ")"));
                        this.emit('strategy-loaded', {
                            type: StrategyTypes_1.StrategyEventType.STRATEGY_LOADED,
                            strategyId: strategy.id,
                            timestamp: new Date(),
                            data: { strategy: strategy }
                        });
                        return [3 /*break*/, 8];
                    case 7:
                        error_2 = _a.sent();
                        console.error("\u274C Failed to load strategy for ".concat(companyName, ":"), error_2);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Dynamically load strategy implementation class
     */
    StrategyRegistry.prototype.loadStrategyClass = function (implPath) {
        return __awaiter(this, void 0, void 0, function () {
            var module;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.resolve("".concat(implPath)).then(function (s) { return require(s); })];
                    case 1:
                        module = _a.sent();
                        return [2 /*return*/, module.default || module[Object.keys(module)[0]]];
                }
            });
        });
    };
    /**
     * Setup file system watching for auto-reload
     */
    StrategyRegistry.prototype.setupFileWatching = function () {
        return __awaiter(this, void 0, void 0, function () {
            var fs;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('fs'); })];
                    case 1:
                        fs = _a.sent();
                        try {
                            fs.watch(this.config.strategyDirectory, { recursive: true }, function (eventType, filename) {
                                if (filename && (filename.endsWith('.json') || filename.endsWith('.ts'))) {
                                    var companyName_1 = filename.split('/')[0] || filename.split('\\')[0];
                                    // Debounce reload
                                    if (_this.watchTimeouts.has(companyName_1)) {
                                        clearTimeout(_this.watchTimeouts.get(companyName_1));
                                    }
                                    _this.watchTimeouts.set(companyName_1, setTimeout(function () {
                                        _this.reloadCompanyStrategy(companyName_1);
                                        _this.watchTimeouts.delete(companyName_1);
                                    }, 1000));
                                }
                            });
                            console.log('👁️ File watching enabled for strategy auto-reload');
                        }
                        catch (error) {
                            console.warn('⚠️ Could not setup file watching:', error);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // STRATEGY MATCHING & EXECUTION
    // =============================================================================
    /**
     * Find best matching strategy for a job
     */
    StrategyRegistry.prototype.findStrategy = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            var jobUrl, jobDomain, directMatch, fuzzyMatches, fallback;
            return __generator(this, function (_a) {
                jobUrl = job.jobData.url;
                jobDomain = this.extractDomain(jobUrl);
                console.log("\uD83D\uDD0D Finding strategy for domain: ".concat(jobDomain));
                directMatch = this.findByDomain(jobDomain);
                if (directMatch) {
                    return [2 /*return*/, {
                            matched: true,
                            strategy: directMatch,
                            confidence: 0.95,
                            alternateStrategies: []
                        }];
                }
                fuzzyMatches = this.findByFuzzyDomain(jobDomain);
                if (fuzzyMatches.length > 0) {
                    return [2 /*return*/, {
                            matched: true,
                            strategy: fuzzyMatches[0],
                            confidence: 0.8,
                            alternateStrategies: fuzzyMatches.slice(1)
                        }];
                }
                fallback = this.strategies.get(this.config.fallbackStrategy || 'generic');
                if (fallback) {
                    return [2 /*return*/, {
                            matched: true,
                            strategy: fallback,
                            confidence: 0.5,
                            alternateStrategies: []
                        }];
                }
                return [2 /*return*/, {
                        matched: false,
                        confidence: 0,
                        alternateStrategies: Array.from(this.strategies.values())
                    }];
            });
        });
    };
    /**
     * Execute strategy for a job
     */
    StrategyRegistry.prototype.executeStrategy = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var matchResult, strategy, aiResult, error_3, strategyInstance, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.findStrategy(context.job)];
                    case 1:
                        matchResult = _b.sent();
                        if (!matchResult.matched || !matchResult.strategy) {
                            throw new Error('No suitable strategy found for job');
                        }
                        strategy = matchResult.strategy;
                        console.log("\uD83D\uDE80 Executing strategy: ".concat(strategy.name, " for ").concat(context.job.jobData.company));
                        this.emit('strategy-matched', {
                            type: StrategyTypes_1.StrategyEventType.STRATEGY_MATCHED,
                            strategyId: strategy.id,
                            timestamp: new Date(),
                            data: { matchResult: matchResult, job: context.job }
                        });
                        if (!(this.browserUseService && this.shouldUseAIAutomation(strategy, context))) return [3 /*break*/, 7];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, , 7]);
                        console.log('🤖 Using AI-powered automation with browser-use');
                        return [4 /*yield*/, this.executeWithAI(strategy, context)];
                    case 3:
                        aiResult = _b.sent();
                        if (!this.config.performanceTracking) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.recordPerformanceMetrics(strategy.id, aiResult)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/, aiResult];
                    case 6:
                        error_3 = _b.sent();
                        console.warn('⚠️ AI automation failed, falling back to traditional strategy:', error_3.message);
                        return [3 /*break*/, 7];
                    case 7:
                        strategyInstance = this.strategyInstances.get(strategy.id);
                        if (!strategyInstance) {
                            // Create generic strategy instance
                            strategyInstance = new (/** @class */ (function (_super) {
                                __extends(class_1, _super);
                                function class_1() {
                                    return _super !== null && _super.apply(this, arguments) || this;
                                }
                                class_1.prototype.executeMainWorkflow = function (context) {
                                    return __awaiter(this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            // Generic implementation
                                            return [2 /*return*/, this.executeGenericWorkflow(context)];
                                        });
                                    });
                                };
                                class_1.prototype.mapFormFields = function (userProfile) {
                                    return __awaiter(this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            return [2 /*return*/, {
                                                    firstName: userProfile.personalInfo.firstName,
                                                    lastName: userProfile.personalInfo.lastName,
                                                    email: userProfile.personalInfo.email,
                                                    phone: userProfile.personalInfo.phone
                                                }];
                                        });
                                    });
                                };
                                class_1.prototype.handleCompanyCaptcha = function () {
                                    return __awaiter(this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            return [2 /*return*/, false]; // Will be handled by generic captcha handler
                                        });
                                    });
                                };
                                class_1.prototype.extractConfirmation = function () {
                                    return __awaiter(this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            return [2 /*return*/, { confirmed: true }];
                                        });
                                    });
                                };
                                class_1.prototype.executeGenericWorkflow = function (context) {
                                    return __awaiter(this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            return [2 /*return*/, {
                                                    success: true,
                                                    executionTime: 0,
                                                    stepsCompleted: 0,
                                                    totalSteps: 0,
                                                    captchaEncountered: false,
                                                    screenshots: [],
                                                    logs: [],
                                                    metrics: {
                                                        timeToFirstInteraction: 0,
                                                        formFillTime: 0,
                                                        uploadTime: 0,
                                                        submissionTime: 0
                                                    }
                                                }];
                                        });
                                    });
                                };
                                return class_1;
                            }(BaseStrategy_1.BaseStrategy)))(strategy);
                        }
                        return [4 /*yield*/, strategyInstance.execute(context)];
                    case 8:
                        result = _b.sent();
                        if (!this.config.performanceTracking) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.recordPerformanceMetrics(strategy.id, result)];
                    case 9:
                        _b.sent();
                        _b.label = 10;
                    case 10:
                        if (!(this.config.abTestingEnabled && ((_a = strategy.abTesting) === null || _a === void 0 ? void 0 : _a.enabled))) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.recordABTestResult(strategy.id, result)];
                    case 11:
                        _b.sent();
                        _b.label = 12;
                    case 12: return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Determine if AI automation should be used for this strategy
     */
    StrategyRegistry.prototype.shouldUseAIAutomation = function (strategy, context) {
        var _a;
        // Check if strategy explicitly enables or disables AI automation
        if (((_a = strategy.preferences) === null || _a === void 0 ? void 0 : _a.aiAutomation) === false) {
            return false;
        }
        // Use AI automation by default for better accuracy and adaptability
        return true;
    };
    /**
     * Execute job application using AI automation
     */
    StrategyRegistry.prototype.executeWithAI = function (strategy, context) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, aiTask, aiResult, strategyResult, error_4, executionTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        aiTask = {
                            id: context.job.id,
                            jobId: context.job.jobData.id,
                            jobUrl: context.job.jobData.url,
                            jobTitle: context.job.jobData.title,
                            company: context.job.jobData.company,
                            userProfile: this.convertUserProfile(context.userProfile),
                            strategy: strategy.id,
                            priority: context.job.priority || 'medium',
                            context: {
                                strategy: strategy.name,
                                companyDomain: strategy.companyDomain,
                                selectors: strategy.selectors,
                                workflow: strategy.workflow,
                            }
                        };
                        // Execute with browser-use service
                        this.emit('ai-automation-start', {
                            strategyId: strategy.id,
                            jobId: context.job.id,
                            company: context.job.jobData.company
                        });
                        return [4 /*yield*/, this.browserUseService.processJobApplication(aiTask)];
                    case 2:
                        aiResult = _a.sent();
                        strategyResult = {
                            success: aiResult.success,
                            executionTime: aiResult.executionTime,
                            stepsCompleted: aiResult.steps.length,
                            totalSteps: aiResult.steps.length,
                            captchaEncountered: aiResult.steps.some(function (step) { return step.step === 'captcha'; }),
                            screenshots: aiResult.screenshots,
                            logs: aiResult.steps.map(function (step) { return ({
                                timestamp: step.timestamp,
                                level: step.success ? 'info' : 'error',
                                message: step.description,
                                metadata: step.metadata
                            }); }),
                            metrics: {
                                timeToFirstInteraction: 2000, // Estimated from AI execution
                                formFillTime: aiResult.executionTime * 0.6,
                                uploadTime: aiResult.executionTime * 0.1,
                                submissionTime: aiResult.executionTime * 0.3
                            },
                            applicationId: aiResult.applicationId,
                            confirmationNumber: aiResult.confirmationNumber,
                            error: aiResult.error,
                            metadata: __assign(__assign({}, aiResult.metadata), { automationType: 'ai-powered', strategy: strategy.id, confidence: 0.95 })
                        };
                        this.emit('ai-automation-complete', {
                            strategyId: strategy.id,
                            jobId: context.job.id,
                            success: aiResult.success,
                            executionTime: aiResult.executionTime
                        });
                        return [2 /*return*/, strategyResult];
                    case 3:
                        error_4 = _a.sent();
                        executionTime = Date.now() - startTime;
                        this.emit('ai-automation-error', {
                            strategyId: strategy.id,
                            jobId: context.job.id,
                            error: error_4.message,
                            executionTime: executionTime
                        });
                        // Return error result
                        return [2 /*return*/, {
                                success: false,
                                executionTime: executionTime,
                                stepsCompleted: 0,
                                totalSteps: 1,
                                captchaEncountered: false,
                                screenshots: [],
                                logs: [{
                                        timestamp: Date.now(),
                                        level: 'error',
                                        message: "AI automation failed: ".concat(error_4.message),
                                        metadata: { error: error_4.message }
                                    }],
                                metrics: {
                                    timeToFirstInteraction: 0,
                                    formFillTime: 0,
                                    uploadTime: 0,
                                    submissionTime: 0
                                },
                                error: error_4.message,
                                metadata: {
                                    automationType: 'ai-powered',
                                    strategy: strategy.id,
                                    failurePoint: 'ai-execution'
                                }
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Convert internal user profile to browser-use format
     */
    StrategyRegistry.prototype.convertUserProfile = function (userProfile) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
        return {
            firstName: ((_a = userProfile.personalInfo) === null || _a === void 0 ? void 0 : _a.firstName) || userProfile.firstName,
            lastName: ((_b = userProfile.personalInfo) === null || _b === void 0 ? void 0 : _b.lastName) || userProfile.lastName,
            email: ((_c = userProfile.personalInfo) === null || _c === void 0 ? void 0 : _c.email) || userProfile.email,
            phone: ((_d = userProfile.personalInfo) === null || _d === void 0 ? void 0 : _d.phone) || userProfile.phone,
            address: {
                street: ((_e = userProfile.address) === null || _e === void 0 ? void 0 : _e.street) || '',
                city: ((_f = userProfile.address) === null || _f === void 0 ? void 0 : _f.city) || '',
                state: ((_g = userProfile.address) === null || _g === void 0 ? void 0 : _g.state) || '',
                zipCode: ((_h = userProfile.address) === null || _h === void 0 ? void 0 : _h.zipCode) || '',
                country: ((_j = userProfile.address) === null || _j === void 0 ? void 0 : _j.country) || 'US'
            },
            workAuthorization: userProfile.workAuthorization || 'citizen',
            experience: {
                years: ((_k = userProfile.experience) === null || _k === void 0 ? void 0 : _k.years) || 0,
                currentTitle: (_l = userProfile.experience) === null || _l === void 0 ? void 0 : _l.currentTitle,
                currentCompany: (_m = userProfile.experience) === null || _m === void 0 ? void 0 : _m.currentCompany
            },
            education: {
                degree: ((_o = userProfile.education) === null || _o === void 0 ? void 0 : _o.degree) || '',
                school: ((_p = userProfile.education) === null || _p === void 0 ? void 0 : _p.school) || '',
                graduationYear: ((_q = userProfile.education) === null || _q === void 0 ? void 0 : _q.graduationYear) || new Date().getFullYear()
            },
            resume: {
                fileUrl: ((_r = userProfile.resume) === null || _r === void 0 ? void 0 : _r.url) || ((_s = userProfile.resume) === null || _s === void 0 ? void 0 : _s.fileUrl) || '',
                fileName: ((_t = userProfile.resume) === null || _t === void 0 ? void 0 : _t.filename) || ((_u = userProfile.resume) === null || _u === void 0 ? void 0 : _u.fileName) || 'resume.pdf'
            },
            coverLetter: userProfile.coverLetter ? {
                fileUrl: userProfile.coverLetter.url || userProfile.coverLetter.fileUrl || '',
                fileName: userProfile.coverLetter.filename || userProfile.coverLetter.fileName || 'cover-letter.pdf'
            } : undefined,
            linkedInProfile: userProfile.linkedIn || userProfile.linkedInProfile,
            portfolioUrl: userProfile.portfolio || userProfile.portfolioUrl
        };
    };
    // =============================================================================
    // STRATEGY MANAGEMENT
    // =============================================================================
    /**
     * Register a new strategy
     */
    StrategyRegistry.prototype.registerStrategy = function (strategy) {
        return __awaiter(this, void 0, void 0, function () {
            var cachedStrategies;
            return __generator(this, function (_a) {
                if (!this.validateStrategyStructure(strategy)) {
                    throw new Error('Invalid strategy structure');
                }
                this.strategies.set(strategy.id, strategy);
                // Cache if enabled
                if (this.config.cacheStrategy) {
                    cachedStrategies = this.store.get('strategies');
                    cachedStrategies[strategy.id] = strategy;
                    this.store.set('strategies', cachedStrategies);
                }
                console.log("\u2705 Registered new strategy: ".concat(strategy.name));
                this.emit('strategy-registered', { strategy: strategy, timestamp: new Date() });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Unregister a strategy
     */
    StrategyRegistry.prototype.unregisterStrategy = function (strategyId) {
        return __awaiter(this, void 0, void 0, function () {
            var removed, cachedStrategies;
            return __generator(this, function (_a) {
                removed = this.strategies.delete(strategyId);
                this.strategyInstances.delete(strategyId);
                if (removed && this.config.cacheStrategy) {
                    cachedStrategies = this.store.get('strategies');
                    delete cachedStrategies[strategyId];
                    this.store.set('strategies', cachedStrategies);
                }
                return [2 /*return*/, removed];
            });
        });
    };
    /**
     * Reload a company strategy
     */
    StrategyRegistry.prototype.reloadCompanyStrategy = function (companyName) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, id, strategy;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log("\uD83D\uDD04 Reloading strategy for: ".concat(companyName));
                        // Find and remove existing strategy
                        for (_i = 0, _a = this.strategies.entries(); _i < _a.length; _i++) {
                            _b = _a[_i], id = _b[0], strategy = _b[1];
                            if (strategy.companyDomain.includes(companyName)) {
                                this.strategies.delete(id);
                                this.strategyInstances.delete(id);
                                break;
                            }
                        }
                        // Reload strategy
                        return [4 /*yield*/, this.loadCompanyStrategy(companyName)];
                    case 1:
                        // Reload strategy
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // UTILITY METHODS
    // =============================================================================
    /**
     * Extract domain from URL
     */
    StrategyRegistry.prototype.extractDomain = function (url) {
        try {
            var urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        }
        catch (_a) {
            return url;
        }
    };
    /**
     * Find strategy by exact domain match
     */
    StrategyRegistry.prototype.findByDomain = function (domain) {
        for (var _i = 0, _a = this.strategies.values(); _i < _a.length; _i++) {
            var strategy = _a[_i];
            if (strategy.companyDomain === domain ||
                strategy.companyDomain.includes(domain) ||
                domain.includes(strategy.companyDomain)) {
                return strategy;
            }
        }
        return null;
    };
    /**
     * Find strategies by fuzzy domain matching
     */
    StrategyRegistry.prototype.findByFuzzyDomain = function (domain) {
        var matches = [];
        for (var _i = 0, _a = this.strategies.values(); _i < _a.length; _i++) {
            var strategy = _a[_i];
            var score = this.calculateDomainSimilarity(domain, strategy.companyDomain);
            if (score > 0.6) {
                matches.push({ strategy: strategy, score: score });
            }
        }
        return matches
            .sort(function (a, b) { return b.score - a.score; })
            .map(function (match) { return match.strategy; });
    };
    /**
     * Calculate domain similarity score
     */
    StrategyRegistry.prototype.calculateDomainSimilarity = function (domain1, domain2) {
        var words1 = domain1.split('.').concat(domain1.split('-'));
        var words2 = domain2.split('.').concat(domain2.split('-'));
        var matches = 0;
        for (var _i = 0, words1_1 = words1; _i < words1_1.length; _i++) {
            var word1 = words1_1[_i];
            for (var _a = 0, words2_1 = words2; _a < words2_1.length; _a++) {
                var word2 = words2_1[_a];
                if (word1.includes(word2) || word2.includes(word1)) {
                    matches++;
                }
            }
        }
        return matches / Math.max(words1.length, words2.length);
    };
    /**
     * Validate strategy structure
     */
    StrategyRegistry.prototype.validateStrategyStructure = function (strategy) {
        var required = ['id', 'name', 'companyDomain', 'selectors', 'workflow'];
        for (var _i = 0, required_1 = required; _i < required_1.length; _i++) {
            var field = required_1[_i];
            if (!(field in strategy)) {
                console.error("\u274C Strategy validation failed: missing ".concat(field));
                return false;
            }
        }
        return true;
    };
    /**
     * Record performance metrics
     */
    StrategyRegistry.prototype.recordPerformanceMetrics = function (strategyId, result) {
        return __awaiter(this, void 0, void 0, function () {
            var metric, strategy, cached;
            return __generator(this, function (_a) {
                metric = {
                    timestamp: new Date(),
                    success: result.success,
                    executionTime: result.executionTime,
                    errorType: result.error,
                    captchaEncountered: result.captchaEncountered
                };
                strategy = this.strategies.get(strategyId);
                if (strategy) {
                    strategy.metrics.recentPerformance.push(metric);
                    // Keep only last 100 metrics
                    if (strategy.metrics.recentPerformance.length > 100) {
                        strategy.metrics.recentPerformance = strategy.metrics.recentPerformance.slice(-100);
                    }
                }
                cached = this.performanceCache.get(strategyId) || [];
                cached.push(metric);
                this.performanceCache.set(strategyId, cached.slice(-100));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Record A/B test result
     */
    StrategyRegistry.prototype.recordABTestResult = function (strategyId, result) {
        return __awaiter(this, void 0, void 0, function () {
            var abResults;
            return __generator(this, function (_a) {
                abResults = this.store.get('abTestResults');
                if (!abResults[strategyId]) {
                    abResults[strategyId] = { totalRuns: 0, successCount: 0, results: [] };
                }
                abResults[strategyId].totalRuns++;
                if (result.success) {
                    abResults[strategyId].successCount++;
                }
                abResults[strategyId].results.push({
                    timestamp: new Date(),
                    success: result.success,
                    executionTime: result.executionTime
                });
                this.store.set('abTestResults', abResults);
                return [2 /*return*/];
            });
        });
    };
    // =============================================================================
    // GETTERS & INFO METHODS
    // =============================================================================
    /**
     * Get all registered strategies
     */
    StrategyRegistry.prototype.getAllStrategies = function () {
        return Array.from(this.strategies.values());
    };
    /**
     * Get strategy by ID
     */
    StrategyRegistry.prototype.getStrategy = function (strategyId) {
        return this.strategies.get(strategyId);
    };
    /**
     * Get strategy performance metrics
     */
    StrategyRegistry.prototype.getStrategyMetrics = function (strategyId) {
        return this.performanceCache.get(strategyId) || [];
    };
    /**
     * Get registry statistics
     */
    StrategyRegistry.prototype.getRegistryStats = function () {
        return {
            totalStrategies: this.strategies.size,
            loadedStrategies: this.loadedStrategies.size,
            cachedStrategies: Object.keys(this.store.get('strategies') || {}).length,
            performanceDataPoints: Array.from(this.performanceCache.values())
                .reduce(function (sum, metrics) { return sum + metrics.length; }, 0)
        };
    };
    /**
     * Health check
     */
    StrategyRegistry.prototype.healthCheck = function () {
        var issues = [];
        if (this.strategies.size === 0) {
            issues.push('No strategies loaded');
        }
        if (!this.config.fallbackStrategy || !this.strategies.has(this.config.fallbackStrategy)) {
            issues.push('Fallback strategy not available');
        }
        return {
            healthy: issues.length === 0,
            issues: issues,
            stats: this.getRegistryStats()
        };
    };
    return StrategyRegistry;
}(events_1.EventEmitter));
exports.StrategyRegistry = StrategyRegistry;
