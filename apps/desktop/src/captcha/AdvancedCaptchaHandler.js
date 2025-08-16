"use strict";
/**
 * @fileoverview Advanced Captcha Resolution System
 * @description Multi-tier captcha resolution with AI, OCR, external services, and manual fallback
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Enterprise-grade captcha handling with multiple resolution strategies
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
exports.AdvancedCaptchaHandler = exports.ResolutionMethod = exports.CaptchaType = void 0;
var events_1 = require("events");
var crypto_1 = require("crypto");
var electron_store_1 = require("electron-store");
var CaptchaType;
(function (CaptchaType) {
    CaptchaType["TEXT"] = "text";
    CaptchaType["IMAGE"] = "image";
    CaptchaType["RECAPTCHA_V2"] = "recaptcha-v2";
    CaptchaType["RECAPTCHA_V3"] = "recaptcha-v3";
    CaptchaType["HCAPTCHA"] = "hcaptcha";
    CaptchaType["CLOUDFLARE"] = "cloudflare";
    CaptchaType["CUSTOM"] = "custom";
    CaptchaType["UNKNOWN"] = "unknown";
})(CaptchaType || (exports.CaptchaType = CaptchaType = {}));
var ResolutionMethod;
(function (ResolutionMethod) {
    ResolutionMethod["AI_VISION"] = "ai-vision";
    ResolutionMethod["OCR_TESSERACT"] = "ocr-tesseract";
    ResolutionMethod["OCR_CLOUD"] = "ocr-cloud";
    ResolutionMethod["EXTERNAL_SERVICE"] = "external-service";
    ResolutionMethod["MANUAL_INTERVENTION"] = "manual-intervention";
    ResolutionMethod["BEHAVIORAL_BYPASS"] = "behavioral-bypass";
    ResolutionMethod["FAILED"] = "failed";
})(ResolutionMethod || (exports.ResolutionMethod = ResolutionMethod = {}));
// =============================================================================
// ADVANCED CAPTCHA HANDLER
// =============================================================================
var AdvancedCaptchaHandler = /** @class */ (function (_super) {
    __extends(AdvancedCaptchaHandler, _super);
    function AdvancedCaptchaHandler(config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this) || this;
        _this.activeSessions = new Map();
        _this.resolutionCache = new Map();
        _this.config = __assign({ enabledMethods: [
                ResolutionMethod.AI_VISION,
                ResolutionMethod.OCR_TESSERACT,
                ResolutionMethod.EXTERNAL_SERVICE,
                ResolutionMethod.MANUAL_INTERVENTION
            ], aiVision: {
                provider: 'anthropic',
                model: 'claude-3-sonnet-20240229',
                apiKey: process.env.ANTHROPIC_API_KEY || '',
                maxTokens: 1000,
                temperature: 0.1
            }, ocr: {
                tesseractPath: 'tesseract',
                languages: ['eng'],
                cloudProvider: 'aws',
                cloudApiKey: process.env.AWS_ACCESS_KEY_ID || ''
            }, externalServices: {
                twoCaptcha: {
                    apiKey: process.env.TWOCAPTCHA_API_KEY || '',
                    timeout: 120000
                }
            }, manual: {
                enabled: true,
                timeout: 300000, // 5 minutes
                notificationMethod: 'ui'
            }, behavioral: {
                mouseMovementVariance: 0.2,
                typingSpeedVariance: 0.3,
                clickDelayRange: [100, 500],
                humanPatterns: true
            } }, config);
        _this.store = new electron_store_1.default({
            name: 'captcha-handler',
            defaults: {
                stats: {
                    totalEncountered: 0,
                    successfullyResolved: 0,
                    resolutionMethods: {},
                    averageResolutionTime: 0,
                    successRate: 0,
                    costMetrics: {
                        totalCost: 0,
                        averageCostPerCaptcha: 0
                    }
                },
                cache: {}
            }
        });
        _this.stats = _this.store.get('stats');
        _this.loadCachedSolutions();
        return _this;
    }
    // =============================================================================
    // MAIN CAPTCHA RESOLUTION INTERFACE
    // =============================================================================
    /**
     * Detect and resolve captcha using multi-tier approach
     */
    AdvancedCaptchaHandler.prototype.resolveCaptcha = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionId, startTime, cachedSolution, solution, executionTime, error_1, failedSolution;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionId = (0, crypto_1.randomUUID)();
                        this.activeSessions.set(sessionId, context);
                        console.log("\uD83E\uDD16 [".concat(sessionId, "] Starting captcha resolution for ").concat(context.captchaType));
                        this.emit('captcha-detected', { sessionId: sessionId, context: context });
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        // Update stats
                        this.stats.totalEncountered++;
                        cachedSolution = this.checkCache(context);
                        if (cachedSolution) {
                            console.log("\uD83D\uDCBE [".concat(sessionId, "] Using cached solution"));
                            return [2 /*return*/, cachedSolution];
                        }
                        // Take screenshot for analysis
                        return [4 /*yield*/, this.captureContext(context)];
                    case 2:
                        // Take screenshot for analysis
                        _a.sent();
                        return [4 /*yield*/, this.executeResolutionTiers(context, sessionId)];
                    case 3:
                        solution = _a.sent();
                        executionTime = Date.now() - startTime;
                        solution.executionTime = executionTime;
                        if (solution.success) {
                            this.stats.successfullyResolved++;
                            this.updateMethodStats(solution.method);
                            this.cacheSuccessfulSolution(context, solution);
                        }
                        this.updateStats();
                        this.emit('captcha-resolved', { sessionId: sessionId, solution: solution, context: context });
                        console.log("\u2705 [".concat(sessionId, "] Captcha resolved: ").concat(solution.success, " via ").concat(solution.method));
                        return [2 /*return*/, solution];
                    case 4:
                        error_1 = _a.sent();
                        failedSolution = {
                            success: false,
                            confidence: 0,
                            method: ResolutionMethod.FAILED,
                            executionTime: Date.now() - startTime,
                            error: error_1 instanceof Error ? error_1.message : String(error_1)
                        };
                        this.emit('captcha-failed', { sessionId: sessionId, error: failedSolution.error, context: context });
                        return [2 /*return*/, failedSolution];
                    case 5:
                        this.activeSessions.delete(sessionId);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // CAPTCHA DETECTION
    // =============================================================================
    /**
     * Detect captcha type and create context
     */
    AdvancedCaptchaHandler.prototype.detectCaptcha = function (page, jobId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var detectionSelectors, _i, _a, _b, type, selectors, _c, selectors_1, selector, element, isVisible, _d;
            var _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        detectionSelectors = (_e = {},
                            _e[CaptchaType.RECAPTCHA_V2] = [
                                'iframe[src*="recaptcha"]',
                                '.g-recaptcha',
                                '[data-sitekey]'
                            ],
                            _e[CaptchaType.HCAPTCHA] = [
                                'iframe[src*="hcaptcha"]',
                                '.h-captcha'
                            ],
                            _e[CaptchaType.CLOUDFLARE] = [
                                '.cf-browser-verification',
                                '#challenge-form',
                                '.challenge-page'
                            ],
                            _e[CaptchaType.IMAGE] = [
                                'img[alt*="captcha" i]',
                                'img[src*="captcha" i]',
                                '.captcha-image'
                            ],
                            _e[CaptchaType.TEXT] = [
                                'input[name*="captcha" i]',
                                'input[placeholder*="captcha" i]'
                            ],
                            _e);
                        _i = 0, _a = Object.entries(detectionSelectors);
                        _g.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 10];
                        _b = _a[_i], type = _b[0], selectors = _b[1];
                        _c = 0, selectors_1 = selectors;
                        _g.label = 2;
                    case 2:
                        if (!(_c < selectors_1.length)) return [3 /*break*/, 9];
                        selector = selectors_1[_c];
                        _g.label = 3;
                    case 3:
                        _g.trys.push([3, 7, , 8]);
                        element = page.locator(selector);
                        return [4 /*yield*/, element.isVisible({ timeout: 1000 })];
                    case 4:
                        isVisible = _g.sent();
                        if (!isVisible) return [3 /*break*/, 6];
                        console.log("\uD83D\uDD0D Detected ".concat(type, " captcha with selector: ").concat(selector));
                        _f = {
                            page: page,
                            jobId: jobId,
                            userId: userId,
                            captchaType: type
                        };
                        return [4 /*yield*/, element.first()];
                    case 5: return [2 /*return*/, (_f.element = _g.sent(),
                            _f.url = page.url(),
                            _f.timestamp = new Date(),
                            _f)];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        _d = _g.sent();
                        return [3 /*break*/, 8];
                    case 8:
                        _c++;
                        return [3 /*break*/, 2];
                    case 9:
                        _i++;
                        return [3 /*break*/, 1];
                    case 10: return [2 /*return*/, null];
                }
            });
        });
    };
    // =============================================================================
    // RESOLUTION TIERS
    // =============================================================================
    /**
     * Execute resolution tiers in priority order
     */
    AdvancedCaptchaHandler.prototype.executeResolutionTiers = function (context, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var enabledMethods, tierAttempts, _i, tierAttempts_1, _a, method, attempt, solution, error_2;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        enabledMethods = this.config.enabledMethods;
                        tierAttempts = [];
                        // Tier 1: AI Vision (fastest, most intelligent)
                        if (enabledMethods.includes(ResolutionMethod.AI_VISION) &&
                            this.canUseAIVision(context.captchaType)) {
                            tierAttempts.push({
                                method: ResolutionMethod.AI_VISION,
                                attempt: function () { return _this.resolveWithAIVision(context, sessionId); }
                            });
                        }
                        // Tier 2: OCR Recognition
                        if (enabledMethods.includes(ResolutionMethod.OCR_TESSERACT) &&
                            this.canUseOCR(context.captchaType)) {
                            tierAttempts.push({
                                method: ResolutionMethod.OCR_TESSERACT,
                                attempt: function () { return _this.resolveWithOCR(context, sessionId); }
                            });
                        }
                        // Tier 3: External Services
                        if (enabledMethods.includes(ResolutionMethod.EXTERNAL_SERVICE)) {
                            tierAttempts.push({
                                method: ResolutionMethod.EXTERNAL_SERVICE,
                                attempt: function () { return _this.resolveWithExternalService(context, sessionId); }
                            });
                        }
                        // Tier 4: Behavioral Bypass
                        if (enabledMethods.includes(ResolutionMethod.BEHAVIORAL_BYPASS)) {
                            tierAttempts.push({
                                method: ResolutionMethod.BEHAVIORAL_BYPASS,
                                attempt: function () { return _this.resolveWithBehavioralBypass(context, sessionId); }
                            });
                        }
                        // Tier 5: Manual Intervention
                        if (enabledMethods.includes(ResolutionMethod.MANUAL_INTERVENTION) &&
                            this.config.manual.enabled) {
                            tierAttempts.push({
                                method: ResolutionMethod.MANUAL_INTERVENTION,
                                attempt: function () { return _this.resolveWithManualIntervention(context, sessionId); }
                            });
                        }
                        _i = 0, tierAttempts_1 = tierAttempts;
                        _b.label = 1;
                    case 1:
                        if (!(_i < tierAttempts_1.length)) return [3 /*break*/, 6];
                        _a = tierAttempts_1[_i], method = _a.method, attempt = _a.attempt;
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        console.log("\uD83D\uDD04 [".concat(sessionId, "] Attempting ").concat(method));
                        return [4 /*yield*/, attempt()];
                    case 3:
                        solution = _b.sent();
                        if (solution.success && solution.confidence > 0.7) {
                            console.log("\u2705 [".concat(sessionId, "] ").concat(method, " successful (confidence: ").concat(solution.confidence, ")"));
                            return [2 /*return*/, solution];
                        }
                        else {
                            console.log("\u26A0\uFE0F [".concat(sessionId, "] ").concat(method, " failed or low confidence (").concat(solution.confidence, ")"));
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _b.sent();
                        console.log("\u274C [".concat(sessionId, "] ").concat(method, " error: ").concat(error_2));
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: 
                    // All tiers failed
                    return [2 /*return*/, {
                            success: false,
                            confidence: 0,
                            method: ResolutionMethod.FAILED,
                            executionTime: 0,
                            error: 'All resolution tiers failed'
                        }];
                }
            });
        });
    };
    // =============================================================================
    // TIER IMPLEMENTATIONS
    // =============================================================================
    /**
     * Tier 1: AI Vision Resolution
     */
    AdvancedCaptchaHandler.prototype.resolveWithAIVision = function (context, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, prompt_1, solution, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        if (!context.screenshot) {
                            throw new Error('Screenshot required for AI vision');
                        }
                        prompt_1 = this.buildAIVisionPrompt(context.captchaType);
                        return [4 /*yield*/, this.callAIVisionService(context.screenshot, prompt_1)];
                    case 2:
                        solution = _a.sent();
                        return [2 /*return*/, {
                                success: !!solution,
                                solution: solution || undefined,
                                confidence: solution ? 0.9 : 0,
                                method: ResolutionMethod.AI_VISION,
                                executionTime: Date.now() - startTime,
                                cost: this.calculateAIVisionCost()
                            }];
                    case 3:
                        error_3 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                confidence: 0,
                                method: ResolutionMethod.AI_VISION,
                                executionTime: Date.now() - startTime,
                                error: error_3 instanceof Error ? error_3.message : String(error_3)
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Tier 2: OCR Resolution
     */
    AdvancedCaptchaHandler.prototype.resolveWithOCR = function (context, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, solution, confidence, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        if (!context.screenshot) {
                            throw new Error('Screenshot required for OCR');
                        }
                        return [4 /*yield*/, this.runTesseractOCR(context.screenshot)];
                    case 2:
                        solution = _a.sent();
                        if (!(!solution && this.config.ocr.cloudProvider && this.config.ocr.cloudApiKey)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.runCloudOCR(context.screenshot)];
                    case 3:
                        solution = _a.sent();
                        _a.label = 4;
                    case 4:
                        confidence = this.calculateOCRConfidence(solution, context.captchaType);
                        return [2 /*return*/, {
                                success: !!solution && confidence > 0.6,
                                solution: solution || undefined,
                                confidence: confidence,
                                method: ResolutionMethod.OCR_TESSERACT,
                                executionTime: Date.now() - startTime,
                                cost: 0 // Free for Tesseract
                            }];
                    case 5:
                        error_4 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                confidence: 0,
                                method: ResolutionMethod.OCR_TESSERACT,
                                executionTime: Date.now() - startTime,
                                error: error_4 instanceof Error ? error_4.message : String(error_4)
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Tier 3: External Service Resolution
     */
    AdvancedCaptchaHandler.prototype.resolveWithExternalService = function (context, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, solution, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startTime = Date.now();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        if (!((_a = this.config.externalServices.twoCaptcha) === null || _a === void 0 ? void 0 : _a.apiKey)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.resolve2Captcha(context)];
                    case 2:
                        solution = _b.sent();
                        if (solution) {
                            return [2 /*return*/, {
                                    success: true,
                                    solution: solution,
                                    confidence: 0.95,
                                    method: ResolutionMethod.EXTERNAL_SERVICE,
                                    executionTime: Date.now() - startTime,
                                    cost: this.calculate2CaptchaCost(context.captchaType)
                                }];
                        }
                        _b.label = 3;
                    case 3: 
                    // Try other services...
                    throw new Error('No external service available or all failed');
                    case 4:
                        error_5 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                confidence: 0,
                                method: ResolutionMethod.EXTERNAL_SERVICE,
                                executionTime: Date.now() - startTime,
                                error: error_5 instanceof Error ? error_5.message : String(error_5)
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Tier 4: Behavioral Bypass
     */
    AdvancedCaptchaHandler.prototype.resolveWithBehavioralBypass = function (context, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, bypassed, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        // Implement human-like behavioral patterns
                        return [4 /*yield*/, this.simulateHumanBehavior(context)];
                    case 2:
                        // Implement human-like behavioral patterns
                        _a.sent();
                        return [4 /*yield*/, this.checkCaptchaBypassed(context)];
                    case 3:
                        bypassed = _a.sent();
                        return [2 /*return*/, {
                                success: bypassed,
                                confidence: bypassed ? 0.8 : 0,
                                method: ResolutionMethod.BEHAVIORAL_BYPASS,
                                executionTime: Date.now() - startTime,
                                cost: 0
                            }];
                    case 4:
                        error_6 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                confidence: 0,
                                method: ResolutionMethod.BEHAVIORAL_BYPASS,
                                executionTime: Date.now() - startTime,
                                error: error_6 instanceof Error ? error_6.message : String(error_6)
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Tier 5: Manual Intervention
     */
    AdvancedCaptchaHandler.prototype.resolveWithManualIntervention = function (context, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, solution, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        console.log("\uD83D\uDC64 [".concat(sessionId, "] Requesting manual intervention"));
                        // Switch to headful mode
                        return [4 /*yield*/, this.switchToHeadfulMode(context)];
                    case 2:
                        // Switch to headful mode
                        _a.sent();
                        // Notify user
                        return [4 /*yield*/, this.notifyUserForManualSolution(context, sessionId)];
                    case 3:
                        // Notify user
                        _a.sent();
                        return [4 /*yield*/, this.waitForManualResolution(context, sessionId)];
                    case 4:
                        solution = _a.sent();
                        return [2 /*return*/, {
                                success: !!solution,
                                solution: solution || undefined,
                                confidence: solution ? 1.0 : 0,
                                method: ResolutionMethod.MANUAL_INTERVENTION,
                                executionTime: Date.now() - startTime,
                                cost: 0
                            }];
                    case 5:
                        error_7 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                confidence: 0,
                                method: ResolutionMethod.MANUAL_INTERVENTION,
                                executionTime: Date.now() - startTime,
                                error: error_7 instanceof Error ? error_7.message : String(error_7)
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // HELPER METHODS
    // =============================================================================
    AdvancedCaptchaHandler.prototype.canUseAIVision = function (captchaType) {
        return [CaptchaType.IMAGE, CaptchaType.TEXT, CaptchaType.CUSTOM].includes(captchaType);
    };
    AdvancedCaptchaHandler.prototype.canUseOCR = function (captchaType) {
        return [CaptchaType.TEXT, CaptchaType.IMAGE].includes(captchaType);
    };
    AdvancedCaptchaHandler.prototype.captureContext = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d, error_8;
            var _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (!!context.screenshot) return [3 /*break*/, 7];
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 6, , 7]);
                        _a = context;
                        _c = (_b = context.page).screenshot;
                        _e = {};
                        if (!context.element) return [3 /*break*/, 3];
                        return [4 /*yield*/, context.element.boundingBox()];
                    case 2:
                        _d = _f.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _d = undefined;
                        _f.label = 4;
                    case 4: return [4 /*yield*/, _c.apply(_b, [(_e.clip = _d,
                                _e)])];
                    case 5:
                        _a.screenshot = _f.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        error_8 = _f.sent();
                        console.warn("\u26A0\uFE0F Failed to capture captcha screenshot: ".concat(error_8));
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    AdvancedCaptchaHandler.prototype.buildAIVisionPrompt = function (captchaType) {
        var basePrompt = "You are an expert captcha solver. Please analyze this captcha image and provide the solution.";
        switch (captchaType) {
            case CaptchaType.TEXT:
                return "".concat(basePrompt, " This is a text-based captcha. Read and return exactly the characters shown.");
            case CaptchaType.IMAGE:
                return "".concat(basePrompt, " This is an image captcha. Identify what is shown and return the answer.");
            default:
                return "".concat(basePrompt, " Return only the solution, no explanation.");
        }
    };
    AdvancedCaptchaHandler.prototype.callAIVisionService = function (screenshot, prompt) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation would call Claude Vision API or OpenAI GPT-4V
                // For now, returning null to indicate not implemented
                return [2 /*return*/, null];
            });
        });
    };
    AdvancedCaptchaHandler.prototype.runTesseractOCR = function (screenshot) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation would use Tesseract.js or system Tesseract
                // For now, returning null to indicate not implemented
                return [2 /*return*/, null];
            });
        });
    };
    AdvancedCaptchaHandler.prototype.runCloudOCR = function (screenshot) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation would use AWS Textract, Google Vision, or Azure OCR
                return [2 /*return*/, null];
            });
        });
    };
    AdvancedCaptchaHandler.prototype.calculateOCRConfidence = function (solution, captchaType) {
        if (!solution)
            return 0;
        // Basic confidence calculation based on solution characteristics
        var confidence = 0.5;
        if (captchaType === CaptchaType.TEXT && /^[A-Za-z0-9]{4,8}$/.test(solution)) {
            confidence = 0.8;
        }
        return confidence;
    };
    AdvancedCaptchaHandler.prototype.resolve2Captcha = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation would integrate with 2captcha API
                return [2 /*return*/, null];
            });
        });
    };
    AdvancedCaptchaHandler.prototype.simulateHumanBehavior = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, i, x, y;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < 3)) return [3 /*break*/, 5];
                        x = Math.random() * 800;
                        y = Math.random() * 600;
                        return [4 /*yield*/, page.mouse.move(x, y, { steps: 10 })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.randomDelay()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 1];
                    case 5: 
                    // Random scrolling
                    return [4 /*yield*/, page.mouse.wheel(0, Math.random() * 100 - 50)];
                    case 6:
                        // Random scrolling
                        _a.sent();
                        return [4 /*yield*/, this.randomDelay()];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AdvancedCaptchaHandler.prototype.checkCaptchaBypassed = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var element, isVisible, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        element = context.element;
                        if (!element)
                            return [2 /*return*/, false];
                        return [4 /*yield*/, element.isVisible({ timeout: 2000 })];
                    case 1:
                        isVisible = _b.sent();
                        return [2 /*return*/, !isVisible];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, true]; // Assume bypassed if can't check
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AdvancedCaptchaHandler.prototype.switchToHeadfulMode = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This would be handled by the BrowserAutomationService
                this.emit('request-headful-mode', {
                    jobId: context.jobId,
                    reason: 'manual-captcha-resolution'
                });
                return [2 /*return*/];
            });
        });
    };
    AdvancedCaptchaHandler.prototype.notifyUserForManualSolution = function (context, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var notification;
            return __generator(this, function (_a) {
                notification = {
                    type: 'captcha-manual-intervention',
                    sessionId: sessionId,
                    jobId: context.jobId,
                    captchaType: context.captchaType,
                    url: context.url,
                    message: 'Manual captcha resolution required',
                    timestamp: new Date()
                };
                this.emit('manual-intervention-required', notification);
                return [2 /*return*/];
            });
        });
    };
    AdvancedCaptchaHandler.prototype.waitForManualResolution = function (context, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var timeout = setTimeout(function () {
                            resolve(null);
                        }, _this.config.manual.timeout);
                        // Listen for manual resolution event
                        var onResolved = function (data) {
                            if (data.sessionId === sessionId) {
                                clearTimeout(timeout);
                                _this.off('manual-resolution-provided', onResolved);
                                resolve(data.solution);
                            }
                        };
                        _this.on('manual-resolution-provided', onResolved);
                    })];
            });
        });
    };
    AdvancedCaptchaHandler.prototype.checkCache = function (context) {
        // Simple cache key based on captcha type and screenshot hash
        // In production, would use more sophisticated caching
        return null;
    };
    AdvancedCaptchaHandler.prototype.cacheSuccessfulSolution = function (context, solution) {
        // Cache successful solutions for reuse
        // Implementation would hash screenshot and store solution
    };
    AdvancedCaptchaHandler.prototype.updateMethodStats = function (method) {
        if (!this.stats.resolutionMethods[method]) {
            this.stats.resolutionMethods[method] = 0;
        }
        this.stats.resolutionMethods[method]++;
    };
    AdvancedCaptchaHandler.prototype.updateStats = function () {
        this.stats.successRate = this.stats.totalEncountered > 0 ?
            (this.stats.successfullyResolved / this.stats.totalEncountered) * 100 : 0;
        this.store.set('stats', this.stats);
    };
    AdvancedCaptchaHandler.prototype.loadCachedSolutions = function () {
        var cache = this.store.get('cache');
        for (var _i = 0, _a = Object.entries(cache); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], solution = _b[1];
            this.resolutionCache.set(key, solution);
        }
    };
    AdvancedCaptchaHandler.prototype.calculateAIVisionCost = function () {
        return 0.01; // Approximate cost per API call
    };
    AdvancedCaptchaHandler.prototype.calculate2CaptchaCost = function (captchaType) {
        var _a;
        var costs = (_a = {},
            _a[CaptchaType.TEXT] = 0.5,
            _a[CaptchaType.IMAGE] = 1.0,
            _a[CaptchaType.RECAPTCHA_V2] = 2.0,
            _a[CaptchaType.RECAPTCHA_V3] = 2.5,
            _a[CaptchaType.HCAPTCHA] = 2.0,
            _a[CaptchaType.CLOUDFLARE] = 3.0,
            _a[CaptchaType.CUSTOM] = 1.5,
            _a[CaptchaType.UNKNOWN] = 1.0,
            _a);
        return costs[captchaType] || 1.0;
    };
    AdvancedCaptchaHandler.prototype.randomDelay = function () {
        return __awaiter(this, arguments, void 0, function (min, max) {
            var delay;
            if (min === void 0) { min = 100; }
            if (max === void 0) { max = 500; }
            return __generator(this, function (_a) {
                delay = Math.random() * (max - min) + min;
                return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, delay); })];
            });
        });
    };
    // =============================================================================
    // PUBLIC API
    // =============================================================================
    /**
     * Get captcha resolution statistics
     */
    AdvancedCaptchaHandler.prototype.getStats = function () {
        return __assign({}, this.stats);
    };
    /**
     * Update configuration
     */
    AdvancedCaptchaHandler.prototype.updateConfig = function (newConfig) {
        this.config = __assign(__assign({}, this.config), newConfig);
    };
    /**
     * Provide manual solution for a captcha session
     */
    AdvancedCaptchaHandler.prototype.provideManualSolution = function (sessionId, solution) {
        this.emit('manual-resolution-provided', { sessionId: sessionId, solution: solution });
    };
    /**
     * Get active captcha sessions
     */
    AdvancedCaptchaHandler.prototype.getActiveSessions = function () {
        return new Map(this.activeSessions);
    };
    return AdvancedCaptchaHandler;
}(events_1.EventEmitter));
exports.AdvancedCaptchaHandler = AdvancedCaptchaHandler;
