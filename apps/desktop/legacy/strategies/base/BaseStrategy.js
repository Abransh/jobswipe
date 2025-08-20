"use strict";
/**
 * @fileoverview Base Strategy Abstract Class
 * @description Abstract base class for all company-specific automation strategies
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Enterprise-grade strategy execution foundation
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
exports.BaseStrategy = void 0;
var events_1 = require("events");
var StrategyTypes_1 = require("../types/StrategyTypes");
// =============================================================================
// BASE STRATEGY ABSTRACT CLASS
// =============================================================================
var BaseStrategy = /** @class */ (function (_super) {
    __extends(BaseStrategy, _super);
    function BaseStrategy(strategy) {
        var _this = _super.call(this) || this;
        _this.context = null;
        _this.startTime = null;
        _this.currentStep = 0;
        _this.screenshots = [];
        _this.logs = [];
        _this.strategy = strategy;
        return _this;
    }
    // =============================================================================
    // PUBLIC EXECUTION INTERFACE
    // =============================================================================
    /**
     * Execute the automation strategy
     */
    BaseStrategy.prototype.execute = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_1, errorMessage, recoveryResult, failureResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.context = context;
                        this.startTime = new Date();
                        this.currentStep = 0;
                        this.screenshots = [];
                        this.logs = [];
                        this.log("\uD83D\uDE80 Starting ".concat(this.strategy.name, " automation for ").concat(context.job.jobData.title));
                        this.emit('execution-started', {
                            strategyId: this.strategy.id,
                            jobId: context.job.id,
                            timestamp: this.startTime
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 9]);
                        // Pre-execution validation
                        return [4 /*yield*/, this.validateContext(context)];
                    case 2:
                        // Pre-execution validation
                        _a.sent();
                        // Execute pre-application steps
                        return [4 /*yield*/, this.executePreApplicationSteps(context)];
                    case 3:
                        // Execute pre-application steps
                        _a.sent();
                        return [4 /*yield*/, this.executeMainWorkflow(context)];
                    case 4:
                        result = _a.sent();
                        // Execute post-application steps
                        return [4 /*yield*/, this.executePostApplicationSteps(context, result)];
                    case 5:
                        // Execute post-application steps
                        _a.sent();
                        // Update metrics
                        return [4 /*yield*/, this.updateStrategyMetrics(result)];
                    case 6:
                        // Update metrics
                        _a.sent();
                        this.log("\u2705 ".concat(this.strategy.name, " automation completed successfully"));
                        this.emit('execution-completed', {
                            strategyId: this.strategy.id,
                            jobId: context.job.id,
                            result: result,
                            timestamp: new Date()
                        });
                        return [2 /*return*/, result];
                    case 7:
                        error_1 = _a.sent();
                        errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                        this.log("\u274C ".concat(this.strategy.name, " automation failed: ").concat(errorMessage));
                        return [4 /*yield*/, this.executeErrorRecovery(context, error_1)];
                    case 8:
                        recoveryResult = _a.sent();
                        failureResult = {
                            success: false,
                            error: errorMessage,
                            executionTime: Date.now() - this.startTime.getTime(),
                            stepsCompleted: this.currentStep,
                            totalSteps: this.getTotalSteps(),
                            captchaEncountered: false,
                            screenshots: this.screenshots,
                            logs: this.logs,
                            metrics: {
                                timeToFirstInteraction: 0,
                                formFillTime: 0,
                                uploadTime: 0,
                                submissionTime: 0
                            }
                        };
                        this.emit('execution-failed', {
                            strategyId: this.strategy.id,
                            jobId: context.job.id,
                            error: errorMessage,
                            recoveryResult: recoveryResult,
                            timestamp: new Date()
                        });
                        return [2 /*return*/, recoveryResult || failureResult];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // PROTECTED WORKFLOW EXECUTION METHODS
    // =============================================================================
    /**
     * Execute pre-application workflow steps
     */
    BaseStrategy.prototype.executePreApplicationSteps = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, step;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.log('📋 Executing pre-application steps');
                        _i = 0, _a = this.strategy.workflow.preApplication;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        step = _a[_i];
                        return [4 /*yield*/, this.executeStep(step, context)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute post-application workflow steps
     */
    BaseStrategy.prototype.executePostApplicationSteps = function (context, result) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, step, confirmation;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.log('🔍 Executing post-application verification');
                        _i = 0, _a = this.strategy.workflow.postApplication;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        step = _a[_i];
                        return [4 /*yield*/, this.executeStep(step, context)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (!result.success) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.extractConfirmation(context)];
                    case 5:
                        confirmation = _b.sent();
                        if (confirmation.confirmed) {
                            result.confirmationId = confirmation.confirmationId;
                            result.applicationId = confirmation.applicationId;
                        }
                        _b.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute error recovery workflow
     */
    BaseStrategy.prototype.executeErrorRecovery = function (context, error) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, step, recoveryError_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!context || !this.strategy.workflow.errorRecovery.length) {
                            return [2 /*return*/, null];
                        }
                        this.log('🔄 Attempting error recovery');
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 7, , 8]);
                        _i = 0, _a = this.strategy.workflow.errorRecovery;
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        step = _a[_i];
                        return [4 /*yield*/, this.executeStep(step, context)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [4 /*yield*/, this.executeMainWorkflow(context)];
                    case 6: 
                    // If recovery succeeded, try main workflow again (with limited retries)
                    return [2 /*return*/, _b.sent()];
                    case 7:
                        recoveryError_1 = _b.sent();
                        this.log("\u274C Error recovery failed: ".concat(recoveryError_1));
                        return [2 /*return*/, null];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // STEP EXECUTION ENGINE
    // =============================================================================
    /**
     * Execute a single workflow step
     */
    BaseStrategy.prototype.executeStep = function (step, context) {
        return __awaiter(this, void 0, void 0, function () {
            var stepStartTime, attempts, lastError, result, executionTime, error_2, _i, _a, fallbackAction, fallbackError_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.currentStep++;
                        this.log("\uD83D\uDCDD Step ".concat(this.currentStep, ": ").concat(step.name));
                        stepStartTime = Date.now();
                        this.emit('step-started', {
                            strategyId: this.strategy.id,
                            jobId: context.job.id,
                            step: step,
                            timestamp: new Date()
                        });
                        attempts = 0;
                        lastError = null;
                        _b.label = 1;
                    case 1:
                        if (!(attempts <= step.retryCount)) return [3 /*break*/, 12];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 8, , 11]);
                        return [4 /*yield*/, this.executeStepAction(step, context)];
                    case 3:
                        result = _b.sent();
                        return [4 /*yield*/, this.validateStepSuccess(step, context)];
                    case 4:
                        if (!_b.sent()) return [3 /*break*/, 5];
                        executionTime = Date.now() - stepStartTime;
                        this.emit('step-completed', {
                            strategyId: this.strategy.id,
                            jobId: context.job.id,
                            step: step,
                            result: result,
                            executionTime: executionTime,
                            attempts: attempts + 1,
                            timestamp: new Date()
                        });
                        return [2 /*return*/, result];
                    case 5:
                        if (!(attempts < step.retryCount)) return [3 /*break*/, 7];
                        this.log("\u26A0\uFE0F Step validation failed, retrying (".concat(attempts + 1, "/").concat(step.retryCount, ")"));
                        return [4 /*yield*/, this.delay(1000 * (attempts + 1))];
                    case 6:
                        _b.sent(); // Exponential backoff
                        _b.label = 7;
                    case 7: return [3 /*break*/, 11];
                    case 8:
                        error_2 = _b.sent();
                        lastError = error_2 instanceof Error ? error_2 : new Error(String(error_2));
                        if (!(attempts < step.retryCount)) return [3 /*break*/, 10];
                        this.log("\u26A0\uFE0F Step failed, retrying (".concat(attempts + 1, "/").concat(step.retryCount, "): ").concat(lastError.message));
                        return [4 /*yield*/, this.delay(1000 * (attempts + 1))];
                    case 9:
                        _b.sent();
                        _b.label = 10;
                    case 10: return [3 /*break*/, 11];
                    case 11:
                        attempts++;
                        return [3 /*break*/, 1];
                    case 12:
                        if (!step.fallbackActions) return [3 /*break*/, 18];
                        this.log('🔄 Attempting fallback actions');
                        _i = 0, _a = step.fallbackActions;
                        _b.label = 13;
                    case 13:
                        if (!(_i < _a.length)) return [3 /*break*/, 18];
                        fallbackAction = _a[_i];
                        _b.label = 14;
                    case 14:
                        _b.trys.push([14, 16, , 17]);
                        return [4 /*yield*/, this.executeStepAction(__assign(__assign({}, step), { action: fallbackAction }), context)];
                    case 15: return [2 /*return*/, _b.sent()];
                    case 16:
                        fallbackError_1 = _b.sent();
                        this.log("\u26A0\uFE0F Fallback action failed: ".concat(fallbackError_1));
                        return [3 /*break*/, 17];
                    case 17:
                        _i++;
                        return [3 /*break*/, 13];
                    case 18:
                        // If step is required, throw error
                        if (step.required) {
                            throw new Error("Required step '".concat(step.name, "' failed after ").concat(step.retryCount + 1, " attempts: ").concat(lastError === null || lastError === void 0 ? void 0 : lastError.message));
                        }
                        this.log("\u26A0\uFE0F Optional step '".concat(step.name, "' failed, continuing workflow"));
                        return [2 /*return*/, null];
                }
            });
        });
    };
    /**
     * Execute specific step action based on type
     */
    BaseStrategy.prototype.executeStepAction = function (step, context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        page = context.page;
                        _a = step.action;
                        switch (_a) {
                            case StrategyTypes_1.WorkflowAction.NAVIGATE: return [3 /*break*/, 1];
                            case StrategyTypes_1.WorkflowAction.CLICK: return [3 /*break*/, 3];
                            case StrategyTypes_1.WorkflowAction.TYPE: return [3 /*break*/, 5];
                            case StrategyTypes_1.WorkflowAction.UPLOAD: return [3 /*break*/, 7];
                            case StrategyTypes_1.WorkflowAction.SELECT: return [3 /*break*/, 9];
                            case StrategyTypes_1.WorkflowAction.WAIT: return [3 /*break*/, 11];
                            case StrategyTypes_1.WorkflowAction.VALIDATE: return [3 /*break*/, 13];
                            case StrategyTypes_1.WorkflowAction.EXTRACT: return [3 /*break*/, 15];
                            case StrategyTypes_1.WorkflowAction.SCREENSHOT: return [3 /*break*/, 17];
                            case StrategyTypes_1.WorkflowAction.CUSTOM: return [3 /*break*/, 19];
                        }
                        return [3 /*break*/, 21];
                    case 1: return [4 /*yield*/, this.executeNavigate(step, context)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.executeClick(step, context)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.executeType(step, context)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.executeUpload(step, context)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: return [4 /*yield*/, this.executeSelect(step, context)];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11: return [4 /*yield*/, this.executeWait(step, context)];
                    case 12: return [2 /*return*/, _b.sent()];
                    case 13: return [4 /*yield*/, this.executeValidate(step, context)];
                    case 14: return [2 /*return*/, _b.sent()];
                    case 15: return [4 /*yield*/, this.executeExtract(step, context)];
                    case 16: return [2 /*return*/, _b.sent()];
                    case 17: return [4 /*yield*/, this.executeScreenshot(step, context)];
                    case 18: return [2 /*return*/, _b.sent()];
                    case 19: return [4 /*yield*/, this.executeCustomAction(step, context)];
                    case 20: return [2 /*return*/, _b.sent()];
                    case 21: throw new Error("Unknown action type: ".concat(step.action));
                }
            });
        });
    };
    // =============================================================================
    // ACTION IMPLEMENTATIONS
    // =============================================================================
    BaseStrategy.prototype.executeNavigate = function (step, context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, url;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        page = context.page;
                        url = ((_a = step.metadata) === null || _a === void 0 ? void 0 : _a.url) || context.job.jobData.url;
                        this.log("\uD83C\uDF10 Navigating to: ".concat(url));
                        return [4 /*yield*/, page.goto(url, { waitUntil: 'networkidle' })];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.delay(2000)];
                    case 2:
                        _b.sent(); // Allow page to settle
                        return [2 /*return*/];
                }
            });
        });
    };
    BaseStrategy.prototype.executeClick = function (step, context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, element;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page;
                        return [4 /*yield*/, this.findElement(step.selectors, page)];
                    case 1:
                        element = _a.sent();
                        this.log("\uD83D\uDC46 Clicking element: ".concat(step.selectors[0]));
                        return [4 /*yield*/, this.humanizeClick(element, page)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BaseStrategy.prototype.executeType = function (step, context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, element, text;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        page = context.page;
                        return [4 /*yield*/, this.findElement(step.selectors, page)];
                    case 1:
                        element = _b.sent();
                        text = ((_a = step.metadata) === null || _a === void 0 ? void 0 : _a.text) || '';
                        this.log("\u2328\uFE0F Typing text: ".concat(text.substring(0, 50), "..."));
                        return [4 /*yield*/, this.humanizeType(element, text, page)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BaseStrategy.prototype.executeUpload = function (step, context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, filePath, element;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        page = context.page;
                        filePath = ((_a = step.metadata) === null || _a === void 0 ? void 0 : _a.filePath) || context.userProfile.professional.resumeUrl;
                        return [4 /*yield*/, this.findElement(step.selectors, page)];
                    case 1:
                        element = _b.sent();
                        this.log("\uD83D\uDCC4 Uploading file: ".concat(filePath));
                        return [4 /*yield*/, element.setInputFiles(filePath)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BaseStrategy.prototype.executeSelect = function (step, context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, element, value;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        page = context.page;
                        return [4 /*yield*/, this.findElement(step.selectors, page)];
                    case 1:
                        element = _b.sent();
                        value = ((_a = step.metadata) === null || _a === void 0 ? void 0 : _a.value) || '';
                        this.log("\uD83D\uDCCB Selecting option: ".concat(value));
                        return [4 /*yield*/, element.selectOption(value)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BaseStrategy.prototype.executeWait = function (step, context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, duration;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        page = context.page;
                        duration = ((_a = step.metadata) === null || _a === void 0 ? void 0 : _a.duration) || 1000;
                        if (!(step.selectors.length > 0)) return [3 /*break*/, 2];
                        this.log("\u23F3 Waiting for element: ".concat(step.selectors[0]));
                        return [4 /*yield*/, page.waitForSelector(step.selectors[0], { timeout: step.timeout })];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        this.log("\u23F3 Waiting for ".concat(duration, "ms"));
                        return [4 /*yield*/, this.delay(duration)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BaseStrategy.prototype.executeValidate = function (step, context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, _i, _a, criterion, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        page = context.page;
                        _i = 0, _a = step.successCriteria;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        criterion = _a[_i];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, page.waitForSelector(criterion, { timeout: 5000 })];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        _b = _c.sent();
                        return [2 /*return*/, false];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, true];
                }
            });
        });
    };
    BaseStrategy.prototype.executeExtract = function (step, context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, element, text;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page;
                        return [4 /*yield*/, this.findElement(step.selectors, page)];
                    case 1:
                        element = _a.sent();
                        return [4 /*yield*/, element.textContent()];
                    case 2:
                        text = _a.sent();
                        this.log("\uD83D\uDCE4 Extracted text: ".concat(text === null || text === void 0 ? void 0 : text.substring(0, 100), "..."));
                        return [2 /*return*/, text || ''];
                }
            });
        });
    };
    BaseStrategy.prototype.executeScreenshot = function (step, context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, filename, path;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page;
                        filename = "screenshot_".concat(context.job.id, "_").concat(Date.now(), ".png");
                        path = "/tmp/jobswipe-screenshots/".concat(filename);
                        return [4 /*yield*/, page.screenshot({ path: path, fullPage: true })];
                    case 1:
                        _a.sent();
                        this.screenshots.push(path);
                        this.log("\uD83D\uDCF8 Screenshot saved: ".concat(filename));
                        return [2 /*return*/, path];
                }
            });
        });
    };
    BaseStrategy.prototype.executeCustomAction = function (step, context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Override in subclasses for company-specific custom actions
                throw new Error("Custom action '".concat(step.name, "' not implemented in ").concat(this.constructor.name));
            });
        });
    };
    // =============================================================================
    // UTILITY METHODS
    // =============================================================================
    /**
     * Find element using multiple selector strategies
     */
    BaseStrategy.prototype.findElement = function (selectors, page) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, selectors_1, selector, element, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, selectors_1 = selectors;
                        _b.label = 1;
                    case 1:
                        if (!(_i < selectors_1.length)) return [3 /*break*/, 6];
                        selector = selectors_1[_i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        element = page.locator(selector);
                        return [4 /*yield*/, element.waitFor({ timeout: 5000 })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, element];
                    case 4:
                        _a = _b.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: throw new Error("Could not find element with selectors: ".concat(selectors.join(', ')));
                }
            });
        });
    };
    /**
     * Humanized click with natural mouse movement
     */
    BaseStrategy.prototype.humanizeClick = function (element, page) {
        return __awaiter(this, void 0, void 0, function () {
            var box, x, y;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, element.boundingBox()];
                    case 1:
                        box = _a.sent();
                        if (!box) return [3 /*break*/, 5];
                        x = box.x + box.width * (0.3 + Math.random() * 0.4);
                        y = box.y + box.height * (0.3 + Math.random() * 0.4);
                        // Move mouse naturally and click
                        return [4 /*yield*/, page.mouse.move(x, y)];
                    case 2:
                        // Move mouse naturally and click
                        _a.sent();
                        return [4 /*yield*/, this.delay(100 + Math.random() * 200)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, page.mouse.click(x, y)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, element.click()];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Humanized typing with variable speed
     */
    BaseStrategy.prototype.humanizeType = function (element, text, page) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, text_1, char;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, element.click()];
                    case 1:
                        _a.sent(); // Focus element
                        return [4 /*yield*/, element.clear()];
                    case 2:
                        _a.sent(); // Clear existing text
                        _i = 0, text_1 = text;
                        _a.label = 3;
                    case 3:
                        if (!(_i < text_1.length)) return [3 /*break*/, 7];
                        char = text_1[_i];
                        return [4 /*yield*/, page.keyboard.type(char)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.delay(50 + Math.random() * 100)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 3];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate step success criteria
     */
    BaseStrategy.prototype.validateStepSuccess = function (step, context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, _i, _a, criterion, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!step.successCriteria.length) {
                            return [2 /*return*/, true];
                        }
                        page = context.page;
                        _i = 0, _a = step.successCriteria;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        criterion = _a[_i];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, page.waitForSelector(criterion, { timeout: 2000 })];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        _b = _c.sent();
                        return [2 /*return*/, false];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Context validation
     */
    BaseStrategy.prototype.validateContext = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!context.job || !context.page || !context.userProfile) {
                            throw new Error('Invalid strategy context: missing required properties');
                        }
                        if (!context.userProfile.professional.resumeUrl) {
                            throw new Error('Resume URL is required for job applications');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, context.page.goto(context.job.jobData.url, { timeout: 30000 })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        throw new Error("Cannot access job URL: ".concat(context.job.jobData.url));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update strategy performance metrics
     */
    BaseStrategy.prototype.updateStrategyMetrics = function (result) {
        return __awaiter(this, void 0, void 0, function () {
            var metric, successCount, avgTime;
            return __generator(this, function (_a) {
                metric = {
                    timestamp: new Date(),
                    success: result.success,
                    executionTime: result.executionTime,
                    errorType: result.error,
                    captchaEncountered: result.captchaEncountered
                };
                this.strategy.metrics.recentPerformance.push(metric);
                // Keep only last 100 metrics
                if (this.strategy.metrics.recentPerformance.length > 100) {
                    this.strategy.metrics.recentPerformance = this.strategy.metrics.recentPerformance.slice(-100);
                }
                // Update aggregated metrics
                this.strategy.metrics.totalApplications++;
                if (result.success) {
                    successCount = this.strategy.metrics.recentPerformance.filter(function (m) { return m.success; }).length;
                    this.strategy.metrics.successRate = (successCount / this.strategy.metrics.recentPerformance.length) * 100;
                }
                avgTime = this.strategy.metrics.recentPerformance.reduce(function (sum, m) { return sum + m.executionTime; }, 0) /
                    this.strategy.metrics.recentPerformance.length;
                this.strategy.metrics.averageExecutionTime = avgTime;
                this.strategy.metrics.lastUpdated = new Date();
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get total workflow steps
     */
    BaseStrategy.prototype.getTotalSteps = function () {
        return this.strategy.workflow.preApplication.length +
            this.strategy.workflow.application.length +
            this.strategy.workflow.postApplication.length;
    };
    /**
     * Utility delay function
     */
    BaseStrategy.prototype.delay = function (ms) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
            });
        });
    };
    /**
     * Log message with timestamp
     */
    BaseStrategy.prototype.log = function (message) {
        var timestamp = new Date().toISOString();
        var logMessage = "[".concat(timestamp, "] [").concat(this.strategy.name, "] ").concat(message);
        this.logs.push(logMessage);
        console.log(logMessage);
    };
    Object.defineProperty(BaseStrategy.prototype, "strategyInfo", {
        // =============================================================================
        // GETTERS
        // =============================================================================
        get: function () {
            return this.strategy;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseStrategy.prototype, "currentExecutionLogs", {
        get: function () {
            return __spreadArray([], this.logs, true);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseStrategy.prototype, "currentExecutionScreenshots", {
        get: function () {
            return __spreadArray([], this.screenshots, true);
        },
        enumerable: false,
        configurable: true
    });
    return BaseStrategy;
}(events_1.EventEmitter));
exports.BaseStrategy = BaseStrategy;
