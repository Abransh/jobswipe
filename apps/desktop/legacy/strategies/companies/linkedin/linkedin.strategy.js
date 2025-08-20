"use strict";
/**
 * @fileoverview LinkedIn Automation Strategy Implementation
 * @description Specialized strategy for LinkedIn job applications (Easy Apply & Standard)
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Enterprise-grade LinkedIn automation with compliance
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
var BaseStrategy_1 = require("../../base/BaseStrategy");
// =============================================================================
// LINKEDIN STRATEGY IMPLEMENTATION
// =============================================================================
var LinkedInStrategy = /** @class */ (function (_super) {
    __extends(LinkedInStrategy, _super);
    function LinkedInStrategy() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.easyApplyDetected = false;
        _this.currentStep = 0;
        _this.maxEasyApplySteps = 5;
        return _this;
    }
    /**
     * Set vision service for AI-powered form analysis and captcha resolution
     */
    LinkedInStrategy.prototype.setVisionService = function (visionService) {
        this.visionService = visionService;
        this.log('🤖 Vision AI service integrated with LinkedIn strategy');
    };
    // =============================================================================
    // MAIN WORKFLOW EXECUTION
    // =============================================================================
    LinkedInStrategy.prototype.executeMainWorkflow = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, captchaEncountered, screenshots, applicationType, result, finalScreenshot, error_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        captchaEncountered = false;
                        screenshots = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        this.log('🔵 Starting LinkedIn-specific automation workflow');
                        return [4 /*yield*/, this.detectApplicationType(context)];
                    case 2:
                        applicationType = _a.sent();
                        this.easyApplyDetected = applicationType === 'easy-apply';
                        this.log("\uD83D\uDCCB Application type detected: ".concat(applicationType));
                        result = void 0;
                        if (!this.easyApplyDetected) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.executeEasyApplyWorkflow(context)];
                    case 3:
                        result = _a.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.executeStandardApplicationWorkflow(context)];
                    case 5:
                        result = _a.sent();
                        _a.label = 6;
                    case 6: return [4 /*yield*/, this.captureScreenshot(context, 'final_success')];
                    case 7:
                        finalScreenshot = _a.sent();
                        screenshots.push(finalScreenshot);
                        return [2 /*return*/, __assign(__assign({}, result), { executionTime: Date.now() - startTime, screenshots: __spreadArray(__spreadArray([], screenshots, true), result.screenshots, true), captchaEncountered: captchaEncountered })];
                    case 8:
                        error_1 = _a.sent();
                        errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                        this.log("\u274C LinkedIn workflow failed: ".concat(errorMessage));
                        return [2 /*return*/, {
                                success: false,
                                error: errorMessage,
                                executionTime: Date.now() - startTime,
                                stepsCompleted: this.currentStep,
                                totalSteps: this.getTotalSteps(),
                                captchaEncountered: captchaEncountered,
                                screenshots: screenshots,
                                logs: this.currentExecutionLogs,
                                metrics: {
                                    timeToFirstInteraction: 0,
                                    formFillTime: 0,
                                    uploadTime: 0,
                                    submissionTime: 0
                                }
                            }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // EASY APPLY WORKFLOW
    // =============================================================================
    LinkedInStrategy.prototype.executeEasyApplyWorkflow = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, startTime, timeToFirstInteraction, formFillTime, uploadTime, submissionTime, applyButton, formStartTime, stepCount, maxSteps, isComplete, stepProcessed, captchaSolved, stepError_1, submissionStartTime, success;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log('🚀 Executing LinkedIn Easy Apply workflow');
                        page = context.page;
                        startTime = Date.now();
                        timeToFirstInteraction = 0;
                        formFillTime = 0;
                        uploadTime = 0;
                        submissionTime = 0;
                        return [4 /*yield*/, this.findElement([
                                ".jobs-apply-button[data-easy-apply-id]",
                                ".jobs-apply-button .jobs-apply-button__text:contains('Easy Apply')"
                            ], page)];
                    case 1:
                        applyButton = _a.sent();
                        timeToFirstInteraction = Date.now() - startTime;
                        return [4 /*yield*/, this.humanizeClick(applyButton, page)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.delay(3000)];
                    case 3:
                        _a.sent(); // Wait for modal to load
                        formStartTime = Date.now();
                        stepCount = 0;
                        maxSteps = this.maxEasyApplySteps;
                        _a.label = 4;
                    case 4:
                        if (!(stepCount < maxSteps)) return [3 /*break*/, 14];
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 12, , 13]);
                        return [4 /*yield*/, this.checkEasyApplyComplete(page)];
                    case 6:
                        isComplete = _a.sent();
                        if (isComplete) {
                            return [3 /*break*/, 14];
                        }
                        return [4 /*yield*/, this.processEasyApplyStep(context, stepCount)];
                    case 7:
                        stepProcessed = _a.sent();
                        if (!stepProcessed) {
                            this.log("\u26A0\uFE0F Could not process Easy Apply step ".concat(stepCount + 1));
                            return [3 /*break*/, 14];
                        }
                        stepCount++;
                        return [4 /*yield*/, this.delay(2000)];
                    case 8:
                        _a.sent(); // Wait between steps
                        return [4 /*yield*/, this.detectCaptcha(page)];
                    case 9:
                        if (!_a.sent()) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.handleCompanyCaptcha(context)];
                    case 10:
                        captchaSolved = _a.sent();
                        if (!captchaSolved) {
                            throw new Error('Failed to solve captcha in Easy Apply flow');
                        }
                        _a.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        stepError_1 = _a.sent();
                        this.log("\u274C Easy Apply step ".concat(stepCount + 1, " failed: ").concat(stepError_1));
                        return [3 /*break*/, 14];
                    case 13: return [3 /*break*/, 4];
                    case 14:
                        formFillTime = Date.now() - formStartTime;
                        submissionStartTime = Date.now();
                        return [4 /*yield*/, this.handleEasyApplySubmission(context)];
                    case 15:
                        _a.sent();
                        submissionTime = Date.now() - submissionStartTime;
                        return [4 /*yield*/, this.verifyEasyApplySuccess(page)];
                    case 16:
                        success = _a.sent();
                        return [2 /*return*/, {
                                success: success,
                                executionTime: Date.now() - startTime,
                                stepsCompleted: stepCount,
                                totalSteps: maxSteps,
                                captchaEncountered: false,
                                screenshots: [],
                                logs: this.currentExecutionLogs,
                                metrics: {
                                    timeToFirstInteraction: timeToFirstInteraction,
                                    formFillTime: formFillTime,
                                    uploadTime: uploadTime,
                                    submissionTime: submissionTime
                                }
                            }];
                }
            });
        });
    };
    /**
     * Process individual Easy Apply step
     */
    LinkedInStrategy.prototype.processEasyApplyStep = function (context, stepIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var page, stepType, _a, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        page = context.page;
                        this.log("\uD83D\uDCDD Processing Easy Apply step ".concat(stepIndex + 1));
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 16, , 17]);
                        return [4 /*yield*/, this.detectEasyApplyStepType(page)];
                    case 2:
                        stepType = _b.sent();
                        this.log("\uD83D\uDD0D Step type detected: ".concat(stepType));
                        _a = stepType;
                        switch (_a) {
                            case 'contact-info': return [3 /*break*/, 3];
                            case 'resume-upload': return [3 /*break*/, 5];
                            case 'additional-questions': return [3 /*break*/, 7];
                            case 'cover-letter': return [3 /*break*/, 9];
                            case 'review': return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 13];
                    case 3: return [4 /*yield*/, this.fillContactInfoStep(context)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.handleResumeUploadStep(context)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.fillAdditionalQuestionsStep(context)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: return [4 /*yield*/, this.handleCoverLetterStep(context)];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11: return [4 /*yield*/, this.handleReviewStep(context)];
                    case 12: return [2 /*return*/, _b.sent()];
                    case 13:
                        this.log("\u26A0\uFE0F Unknown step type: ".concat(stepType, ", trying generic approach"));
                        return [4 /*yield*/, this.fillGenericEasyApplyStep(context)];
                    case 14: return [2 /*return*/, _b.sent()];
                    case 15: return [3 /*break*/, 17];
                    case 16:
                        error_2 = _b.sent();
                        this.log("\u274C Failed to process step ".concat(stepIndex + 1, ": ").concat(error_2));
                        return [2 /*return*/, false];
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Detect Easy Apply step type
     */
    LinkedInStrategy.prototype.detectEasyApplyStepType = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            var hasContactFields, hasFileUpload, hasQuestions, hasCoverLetter, hasReview;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkElementExists(page, [
                            "input[name='phoneNumber']",
                            "input[name='firstName']"
                        ])];
                    case 1:
                        hasContactFields = _a.sent();
                        if (hasContactFields)
                            return [2 /*return*/, 'contact-info'];
                        return [4 /*yield*/, this.checkElementExists(page, [
                                "input[type='file']",
                                ".file-input"
                            ])];
                    case 2:
                        hasFileUpload = _a.sent();
                        if (hasFileUpload)
                            return [2 /*return*/, 'resume-upload'];
                        return [4 /*yield*/, this.checkElementExists(page, [
                                "fieldset",
                                ".jobs-easy-apply-form-section__grouping",
                                ".fb-dash-form-element"
                            ])];
                    case 3:
                        hasQuestions = _a.sent();
                        if (hasQuestions)
                            return [2 /*return*/, 'additional-questions'];
                        return [4 /*yield*/, this.checkElementExists(page, [
                                "textarea[name='coverLetter']",
                                ".cover-letter"
                            ])];
                    case 4:
                        hasCoverLetter = _a.sent();
                        if (hasCoverLetter)
                            return [2 /*return*/, 'cover-letter'];
                        return [4 /*yield*/, this.checkElementExists(page, [
                                ".jobs-easy-apply-form-section--review",
                                "button[aria-label*='Submit application']"
                            ])];
                    case 5:
                        hasReview = _a.sent();
                        if (hasReview)
                            return [2 /*return*/, 'review'];
                        return [2 /*return*/, 'unknown'];
                }
            });
        });
    };
    /**
     * Fill contact information step
     */
    LinkedInStrategy.prototype.fillContactInfoStep = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, userProfile, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page, userProfile = context.userProfile;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        // Fill phone number if present
                        return [4 /*yield*/, this.fillFieldIfExists(page, [
                                "input[name='phoneNumber']",
                                "input[type='tel']"
                            ], userProfile.personalInfo.phone)];
                    case 2:
                        // Fill phone number if present
                        _a.sent();
                        // Fill email if present
                        return [4 /*yield*/, this.fillFieldIfExists(page, [
                                "input[name='email']",
                                "input[type='email']"
                            ], userProfile.personalInfo.email)];
                    case 3:
                        // Fill email if present
                        _a.sent();
                        // Fill address fields if present
                        return [4 /*yield*/, this.fillFieldIfExists(page, [
                                "input[name='address']"
                            ], userProfile.personalInfo.address || '')];
                    case 4:
                        // Fill address fields if present
                        _a.sent();
                        return [4 /*yield*/, this.clickNextButton(page)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 6:
                        error_3 = _a.sent();
                        this.log("\u274C Failed to fill contact info: ".concat(error_3));
                        return [2 /*return*/, false];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle resume upload step
     */
    LinkedInStrategy.prototype.handleResumeUploadStep = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, userProfile, fileInput, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page, userProfile = context.userProfile;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 9]);
                        return [4 /*yield*/, this.findElement([
                                "input[type='file']",
                                ".file-input input[type='file']"
                            ], page)];
                    case 2:
                        fileInput = _a.sent();
                        if (!userProfile.professional.resumeUrl) return [3 /*break*/, 5];
                        return [4 /*yield*/, fileInput.setInputFiles(userProfile.professional.resumeUrl)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.delay(3000)];
                    case 4:
                        _a.sent(); // Wait for upload
                        this.log('📄 Resume uploaded successfully');
                        _a.label = 5;
                    case 5: return [4 /*yield*/, this.clickNextButton(page)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 7:
                        error_4 = _a.sent();
                        this.log("\u274C Failed to upload resume: ".concat(error_4));
                        // Resume upload might be optional, continue anyway
                        return [4 /*yield*/, this.clickNextButton(page)];
                    case 8:
                        // Resume upload might be optional, continue anyway
                        _a.sent();
                        return [2 /*return*/, true];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fill additional questions step
     */
    LinkedInStrategy.prototype.fillAdditionalQuestionsStep = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, formElements, _i, formElements_1, element, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 10]);
                        return [4 /*yield*/, page.locator('.fb-dash-form-element, fieldset').all()];
                    case 2:
                        formElements = _a.sent();
                        _i = 0, formElements_1 = formElements;
                        _a.label = 3;
                    case 3:
                        if (!(_i < formElements_1.length)) return [3 /*break*/, 6];
                        element = formElements_1[_i];
                        return [4 /*yield*/, this.fillFormElement(element, context)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [4 /*yield*/, this.clickNextButton(page)];
                    case 7:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 8:
                        error_5 = _a.sent();
                        this.log("\u274C Failed to fill additional questions: ".concat(error_5));
                        // Try to continue anyway
                        return [4 /*yield*/, this.clickNextButton(page)];
                    case 9:
                        // Try to continue anyway
                        _a.sent();
                        return [2 /*return*/, true];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle cover letter step
     */
    LinkedInStrategy.prototype.handleCoverLetterStep = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, userProfile, coverLetterField, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page, userProfile = context.userProfile;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 8]);
                        return [4 /*yield*/, this.findElement([
                                "textarea[name='coverLetter']",
                                ".cover-letter textarea"
                            ], page)];
                    case 2:
                        coverLetterField = _a.sent();
                        if (!userProfile.professional.coverLetterTemplate) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.humanizeType(coverLetterField, userProfile.professional.coverLetterTemplate, page)];
                    case 3:
                        _a.sent();
                        this.log('📝 Cover letter added');
                        _a.label = 4;
                    case 4: return [4 /*yield*/, this.clickNextButton(page)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 6:
                        error_6 = _a.sent();
                        this.log("\u274C Failed to handle cover letter: ".concat(error_6));
                        return [4 /*yield*/, this.clickNextButton(page)];
                    case 7:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle review step
     */
    LinkedInStrategy.prototype.handleReviewStep = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // This is usually the final step before submission
                        // Just continue to submission
                        return [4 /*yield*/, this.clickNextButton(page)];
                    case 2:
                        // This is usually the final step before submission
                        // Just continue to submission
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_7 = _a.sent();
                        this.log("\u274C Failed to handle review step: ".concat(error_7));
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // STANDARD APPLICATION WORKFLOW
    // =============================================================================
    LinkedInStrategy.prototype.executeStandardApplicationWorkflow = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, startTime, applyButton, formFilled, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log('🔵 Executing LinkedIn standard application workflow');
                        page = context.page;
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, this.findElement([
                                ".jobs-apply-button:not([data-easy-apply-id])"
                            ], page)];
                    case 2:
                        applyButton = _a.sent();
                        return [4 /*yield*/, this.humanizeClick(applyButton, page)];
                    case 3:
                        _a.sent();
                        // This might redirect to external site or LinkedIn application form
                        return [4 /*yield*/, this.delay(5000)];
                    case 4:
                        // This might redirect to external site or LinkedIn application form
                        _a.sent();
                        return [4 /*yield*/, this.fillStandardApplicationForm(context)];
                    case 5:
                        formFilled = _a.sent();
                        return [2 /*return*/, {
                                success: formFilled,
                                executionTime: Date.now() - startTime,
                                stepsCompleted: 1,
                                totalSteps: 3,
                                captchaEncountered: false,
                                screenshots: [],
                                logs: this.currentExecutionLogs,
                                metrics: {
                                    timeToFirstInteraction: 0,
                                    formFillTime: 0,
                                    uploadTime: 0,
                                    submissionTime: 0
                                }
                            }];
                    case 6:
                        error_8 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_8 instanceof Error ? error_8.message : String(error_8),
                                executionTime: Date.now() - startTime,
                                stepsCompleted: 0,
                                totalSteps: 3,
                                captchaEncountered: false,
                                screenshots: [],
                                logs: this.currentExecutionLogs,
                                metrics: {
                                    timeToFirstInteraction: 0,
                                    formFillTime: 0,
                                    uploadTime: 0,
                                    submissionTime: 0
                                }
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // ABSTRACT METHOD IMPLEMENTATIONS
    // =============================================================================
    LinkedInStrategy.prototype.mapFormFields = function (userProfile) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                return [2 /*return*/, {
                        firstName: userProfile.personalInfo.firstName,
                        lastName: userProfile.personalInfo.lastName,
                        email: userProfile.personalInfo.email,
                        phone: userProfile.personalInfo.phone,
                        address: userProfile.personalInfo.address || '',
                        city: userProfile.personalInfo.city || '',
                        state: userProfile.personalInfo.state || '',
                        zipCode: userProfile.personalInfo.zipCode || '',
                        country: userProfile.personalInfo.country || '',
                        linkedinUrl: userProfile.professional.linkedinUrl || '',
                        currentCompany: userProfile.professional.currentCompany || '',
                        yearsExperience: ((_a = userProfile.professional.yearsExperience) === null || _a === void 0 ? void 0 : _a.toString()) || '',
                        salaryExpectation: ((_b = userProfile.preferences.salaryMin) === null || _b === void 0 ? void 0 : _b.toString()) || ''
                    }];
            });
        });
    };
    LinkedInStrategy.prototype.handleCompanyCaptcha = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, challengeSelectors, hasSecurityChallenge, resolved, challengeResolved;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page;
                        this.log('🤖 Handling LinkedIn-specific captcha with AI vision');
                        challengeSelectors = [
                            '.challenge-page',
                            '.security-challenge-form',
                            'iframe[src*="recaptcha"]',
                            '.g-recaptcha',
                            '.h-captcha',
                            '.arkose-challenge'
                        ];
                        return [4 /*yield*/, this.checkElementExists(page, challengeSelectors)];
                    case 1:
                        hasSecurityChallenge = _a.sent();
                        if (!hasSecurityChallenge) return [3 /*break*/, 6];
                        this.log('🔒 LinkedIn security challenge detected, attempting AI resolution');
                        if (!this.visionService) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.resolveWithAI(context)];
                    case 2:
                        resolved = _a.sent();
                        if (resolved) {
                            this.log('✅ Captcha resolved using AI vision');
                            return [2 /*return*/, true];
                        }
                        _a.label = 3;
                    case 3:
                        // Fallback to traditional handling
                        this.log('⚠️ AI resolution failed, using fallback method');
                        return [4 /*yield*/, this.delay(10000)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.checkElementExists(page, challengeSelectors)];
                    case 5:
                        challengeResolved = !(_a.sent());
                        return [2 /*return*/, challengeResolved];
                    case 6: return [2 /*return*/, true]; // No captcha detected
                }
            });
        });
    };
    /**
     * Resolve captcha using AI vision services
     */
    LinkedInStrategy.prototype.resolveWithAI = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, captchaScreenshot, _a, _b, analysisRequest, analysisResult, applied, resolved, error_9;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        page = context.page;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 9, , 10]);
                        this.log('🧠 Attempting AI-powered captcha resolution');
                        _b = (_a = page).screenshot;
                        _c = {
                            type: 'png',
                            fullPage: false
                        };
                        return [4 /*yield*/, this.getCaptchaArea(page)];
                    case 2: return [4 /*yield*/, _b.apply(_a, [(_c.clip = _d.sent(),
                                _c)])];
                    case 3:
                        captchaScreenshot = _d.sent();
                        analysisRequest = {
                            image: captchaScreenshot,
                            imageType: 'png',
                            analysisType: 'captcha-resolution',
                            context: {
                                jobSite: 'linkedin',
                                formType: 'application',
                                language: 'en'
                            },
                            options: {
                                preferredProviders: ['claude-vision', 'gpt-4-vision'],
                                requireHighAccuracy: true,
                                urgentProcessing: true
                            }
                        };
                        return [4 /*yield*/, this.visionService.analyzeImage(analysisRequest)];
                    case 4:
                        analysisResult = _d.sent();
                        if (!(analysisResult.success && analysisResult.captchaSolution)) return [3 /*break*/, 8];
                        this.log("\uD83C\uDFAF AI identified captcha type: ".concat(analysisResult.captchaType));
                        this.log("\uD83D\uDCA1 Solution: ".concat(analysisResult.captchaSolution));
                        return [4 /*yield*/, this.applyCaptchaSolution(page, analysisResult)];
                    case 5:
                        applied = _d.sent();
                        if (!applied) return [3 /*break*/, 8];
                        // Wait for verification
                        return [4 /*yield*/, this.delay(3000)];
                    case 6:
                        // Wait for verification
                        _d.sent();
                        return [4 /*yield*/, this.checkElementExists(page, [
                                '.challenge-page',
                                '.security-challenge-form',
                                'iframe[src*="recaptcha"]'
                            ])];
                    case 7:
                        resolved = !(_d.sent());
                        return [2 /*return*/, resolved];
                    case 8: return [2 /*return*/, false];
                    case 9:
                        error_9 = _d.sent();
                        this.log("\u274C AI captcha resolution failed: ".concat(error_9));
                        return [2 /*return*/, false];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get captcha area coordinates for screenshot
     */
    LinkedInStrategy.prototype.getCaptchaArea = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            var captchaSelectors, _i, captchaSelectors_1, selector, element, isVisible, boundingBox, _a, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 9, , 10]);
                        captchaSelectors = [
                            '.challenge-page',
                            '.security-challenge-form',
                            'iframe[src*="recaptcha"]',
                            '.g-recaptcha',
                            '.h-captcha'
                        ];
                        _i = 0, captchaSelectors_1 = captchaSelectors;
                        _b.label = 1;
                    case 1:
                        if (!(_i < captchaSelectors_1.length)) return [3 /*break*/, 8];
                        selector = captchaSelectors_1[_i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, , 7]);
                        element = page.locator(selector);
                        return [4 /*yield*/, element.isVisible({ timeout: 1000 })];
                    case 3:
                        isVisible = _b.sent();
                        if (!isVisible) return [3 /*break*/, 5];
                        return [4 /*yield*/, element.boundingBox()];
                    case 4:
                        boundingBox = _b.sent();
                        if (boundingBox) {
                            return [2 /*return*/, {
                                    x: Math.max(0, boundingBox.x - 50),
                                    y: Math.max(0, boundingBox.y - 50),
                                    width: Math.min(boundingBox.width + 100, 800),
                                    height: Math.min(boundingBox.height + 100, 600)
                                }];
                        }
                        _b.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        _a = _b.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 1];
                    case 8: 
                    // Default to center portion of screen
                    return [2 /*return*/, {
                            x: 200,
                            y: 200,
                            width: 600,
                            height: 400
                        }];
                    case 9:
                        error_10 = _b.sent();
                        this.log("\u26A0\uFE0F Could not determine captcha area: ".concat(error_10));
                        return [2 /*return*/, undefined];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Apply captcha solution based on AI analysis
     */
    LinkedInStrategy.prototype.applyCaptchaSolution = function (page, analysisResult) {
        return __awaiter(this, void 0, void 0, function () {
            var captchaType, captchaSolution, captchaInstructions, _a, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 11, , 12]);
                        captchaType = analysisResult.captchaType, captchaSolution = analysisResult.captchaSolution, captchaInstructions = analysisResult.captchaInstructions;
                        _a = captchaType;
                        switch (_a) {
                            case 'recaptcha-v2': return [3 /*break*/, 1];
                            case 'text-based': return [3 /*break*/, 3];
                            case 'image-based': return [3 /*break*/, 5];
                            case 'hcaptcha': return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 1: return [4 /*yield*/, this.solveRecaptchaV2(page, captchaSolution)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.solveTextCaptcha(page, captchaSolution)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.solveImageCaptcha(page, captchaInstructions)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.solveHCaptcha(page, captchaSolution)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9:
                        this.log("\u2753 Unknown captcha type: ".concat(captchaType));
                        return [2 /*return*/, false];
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        error_11 = _b.sent();
                        this.log("\u274C Failed to apply captcha solution: ".concat(error_11));
                        return [2 /*return*/, false];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Solve reCAPTCHA v2 checkbox
     */
    LinkedInStrategy.prototype.solveRecaptchaV2 = function (page, solution) {
        return __awaiter(this, void 0, void 0, function () {
            var checkbox, isVisible, hasChallenge, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, page.locator('.recaptcha-checkbox').first()];
                    case 1:
                        checkbox = _a.sent();
                        return [4 /*yield*/, checkbox.isVisible({ timeout: 5000 })];
                    case 2:
                        isVisible = _a.sent();
                        if (!isVisible) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.humanizeClick(checkbox, page)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.delay(2000)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.checkElementExists(page, [
                                '.recaptcha-challenge-container',
                                '.rc-imageselect'
                            ])];
                    case 5:
                        hasChallenge = _a.sent();
                        if (hasChallenge && solution) {
                            // This would require more sophisticated image analysis
                            this.log('🖼️ reCAPTCHA image challenge detected, needs advanced handling');
                        }
                        return [2 /*return*/, true];
                    case 6: return [2 /*return*/, false];
                    case 7:
                        error_12 = _a.sent();
                        this.log("\u274C reCAPTCHA v2 solving failed: ".concat(error_12));
                        return [2 /*return*/, false];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Solve text-based captcha
     */
    LinkedInStrategy.prototype.solveTextCaptcha = function (page, solution) {
        return __awaiter(this, void 0, void 0, function () {
            var textInput, isVisible, submitButton, submitVisible, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        return [4 /*yield*/, page.locator([
                                'input[type="text"][name*="captcha"]',
                                'input[type="text"][id*="captcha"]',
                                '.captcha-input input',
                                '.challenge-input input'
                            ].join(', ')).first()];
                    case 1:
                        textInput = _a.sent();
                        return [4 /*yield*/, textInput.isVisible({ timeout: 5000 })];
                    case 2:
                        isVisible = _a.sent();
                        if (!(isVisible && solution)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.humanizeType(textInput, solution, page)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, page.locator([
                                'button[type="submit"]',
                                'input[type="submit"]',
                                '.submit-button',
                                '.challenge-submit'
                            ].join(', ')).first()];
                    case 4:
                        submitButton = _a.sent();
                        return [4 /*yield*/, submitButton.isVisible({ timeout: 2000 })];
                    case 5:
                        submitVisible = _a.sent();
                        if (!submitVisible) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.humanizeClick(submitButton, page)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/, true];
                    case 8: return [2 /*return*/, false];
                    case 9:
                        error_13 = _a.sent();
                        this.log("\u274C Text captcha solving failed: ".concat(error_13));
                        return [2 /*return*/, false];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Solve image-based captcha (requires AI guidance)
     */
    LinkedInStrategy.prototype.solveImageCaptcha = function (page, instructions) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    this.log("\uD83D\uDDBC\uFE0F Image captcha instructions: ".concat(instructions));
                    // For image-based captchas, we would need to:
                    // 1. Identify clickable image tiles
                    // 2. Use AI to determine which tiles match the instructions
                    // 3. Click the appropriate tiles
                    // 4. Submit the solution
                    // This is a complex implementation that would require 
                    // additional AI vision analysis of individual image tiles
                    this.log('🚧 Image-based captcha solving requires advanced implementation');
                    return [2 /*return*/, false];
                }
                catch (error) {
                    this.log("\u274C Image captcha solving failed: ".concat(error));
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Solve hCaptcha
     */
    LinkedInStrategy.prototype.solveHCaptcha = function (page, solution) {
        return __awaiter(this, void 0, void 0, function () {
            var checkbox, isVisible, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, page.locator('.hcaptcha-checkbox').first()];
                    case 1:
                        checkbox = _a.sent();
                        return [4 /*yield*/, checkbox.isVisible({ timeout: 5000 })];
                    case 2:
                        isVisible = _a.sent();
                        if (!isVisible) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.humanizeClick(checkbox, page)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.delay(2000)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 5: return [2 /*return*/, false];
                    case 6:
                        error_14 = _a.sent();
                        this.log("\u274C hCaptcha solving failed: ".concat(error_14));
                        return [2 /*return*/, false];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    LinkedInStrategy.prototype.extractConfirmation = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, successElement, isConfirmed, confirmationId, confirmationElement, confirmationText, patterns, _i, patterns_1, pattern, match, extractError_1, error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, , 10]);
                        return [4 /*yield*/, page.locator([
                                '.jobs-apply-success',
                                '.application-outlet__success-message',
                                'h3:contains("Application submitted")'
                            ].join(', ')).first()];
                    case 2:
                        successElement = _a.sent();
                        return [4 /*yield*/, successElement.isVisible()];
                    case 3:
                        isConfirmed = _a.sent();
                        if (!isConfirmed) {
                            return [2 /*return*/, { confirmed: false }];
                        }
                        confirmationId = void 0;
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 7, , 8]);
                        return [4 /*yield*/, page.locator([
                                '.application-outlet__confirmation-number',
                                '.jobs-apply-success .confirmation-number'
                            ].join(', ')).first()];
                    case 5:
                        confirmationElement = _a.sent();
                        return [4 /*yield*/, confirmationElement.textContent()];
                    case 6:
                        confirmationText = _a.sent();
                        if (confirmationText) {
                            patterns = [
                                /confirmation.*?([A-Z0-9]{6,})/i,
                                /reference.*?([A-Z0-9]{6,})/i,
                                /application.*?id.*?([A-Z0-9]{6,})/i
                            ];
                            for (_i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
                                pattern = patterns_1[_i];
                                match = confirmationText.match(pattern);
                                if (match) {
                                    confirmationId = match[1];
                                    break;
                                }
                            }
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        extractError_1 = _a.sent();
                        this.log("\u26A0\uFE0F Could not extract confirmation ID: ".concat(extractError_1));
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, {
                            confirmed: true,
                            confirmationId: confirmationId,
                            applicationId: confirmationId // Use same ID for now
                        }];
                    case 9:
                        error_15 = _a.sent();
                        this.log("\u274C Failed to extract confirmation: ".concat(error_15));
                        return [2 /*return*/, { confirmed: false }];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // UTILITY METHODS
    // =============================================================================
    LinkedInStrategy.prototype.detectApplicationType = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, hasEasyApply, hasStandardApply;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page;
                        return [4 /*yield*/, this.checkElementExists(page, [
                                ".jobs-apply-button[data-easy-apply-id]",
                                ".jobs-apply-button .jobs-apply-button__text:contains('Easy Apply')"
                            ])];
                    case 1:
                        hasEasyApply = _a.sent();
                        if (hasEasyApply) {
                            return [2 /*return*/, 'easy-apply'];
                        }
                        return [4 /*yield*/, this.checkElementExists(page, [
                                ".jobs-apply-button:not([data-easy-apply-id])"
                            ])];
                    case 2:
                        hasStandardApply = _a.sent();
                        if (hasStandardApply) {
                            return [2 /*return*/, 'standard'];
                        }
                        return [2 /*return*/, 'external'];
                }
            });
        });
    };
    LinkedInStrategy.prototype.checkElementExists = function (page, selectors) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, selectors_1, selector, element, isVisible, _a;
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
                        return [4 /*yield*/, element.isVisible({ timeout: 1000 })];
                    case 3:
                        isVisible = _b.sent();
                        if (isVisible)
                            return [2 /*return*/, true];
                        return [3 /*break*/, 5];
                    case 4:
                        _a = _b.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, false];
                }
            });
        });
    };
    LinkedInStrategy.prototype.fillFieldIfExists = function (page, selectors, value) {
        return __awaiter(this, void 0, void 0, function () {
            var element, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!value)
                            return [2 /*return*/, false];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.findElement(selectors, page)];
                    case 2:
                        element = _b.sent();
                        return [4 /*yield*/, this.humanizeType(element, value, page)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 4:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    LinkedInStrategy.prototype.clickNextButton = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            var nextButton, error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.findElement([
                                "button[aria-label='Continue to next step']",
                                ".artdeco-button--primary[data-control-name*='continue']",
                                "footer button:contains('Next')",
                                "button[data-control-name='continue_unify']"
                            ], page)];
                    case 1:
                        nextButton = _a.sent();
                        return [4 /*yield*/, this.humanizeClick(nextButton, page)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.delay(2000)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_16 = _a.sent();
                        this.log("\u26A0\uFE0F Could not find or click next button: ".concat(error_16));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    LinkedInStrategy.prototype.checkEasyApplyComplete = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkElementExists(page, [
                            '.jobs-apply-success',
                            '.application-outlet__success-message',
                            'h3:contains("Application submitted")',
                            'button[aria-label="Submit application"]'
                        ])];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    LinkedInStrategy.prototype.handleEasyApplySubmission = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, submitButton, error_17;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, this.findElement([
                                'button[aria-label="Submit application"]',
                                '.artdeco-button--primary[data-control-name*="submit"]'
                            ], page)];
                    case 2:
                        submitButton = _a.sent();
                        return [4 /*yield*/, this.humanizeClick(submitButton, page)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.delay(5000)];
                    case 4:
                        _a.sent(); // Wait for submission
                        this.log('✅ Application submitted successfully');
                        return [3 /*break*/, 6];
                    case 5:
                        error_17 = _a.sent();
                        this.log("\u274C Failed to submit application: ".concat(error_17));
                        throw error_17;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    LinkedInStrategy.prototype.verifyEasyApplySuccess = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkElementExists(page, [
                            '.jobs-apply-success',
                            '.application-outlet__success-message',
                            'h3:contains("Application submitted")'
                        ])];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    LinkedInStrategy.prototype.fillGenericEasyApplyStep = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, formFields, _i, formFields_1, field, isVisible, _a, error_18;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        page = context.page;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 12, , 13]);
                        return [4 /*yield*/, page.locator('input, select, textarea').all()];
                    case 2:
                        formFields = _b.sent();
                        _i = 0, formFields_1 = formFields;
                        _b.label = 3;
                    case 3:
                        if (!(_i < formFields_1.length)) return [3 /*break*/, 10];
                        field = formFields_1[_i];
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 8, , 9]);
                        return [4 /*yield*/, field.isVisible()];
                    case 5:
                        isVisible = _b.sent();
                        if (!isVisible) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.fillFormElement(field, context)];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        _a = _b.sent();
                        return [3 /*break*/, 9];
                    case 9:
                        _i++;
                        return [3 /*break*/, 3];
                    case 10: return [4 /*yield*/, this.clickNextButton(page)];
                    case 11:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 12:
                        error_18 = _b.sent();
                        this.log("\u274C Failed to fill generic step: ".concat(error_18));
                        return [2 /*return*/, false];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    LinkedInStrategy.prototype.fillFormElement = function (element, context) {
        return __awaiter(this, void 0, void 0, function () {
            var userProfile, name_1, type, tagName, value, error_19;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userProfile = context.userProfile;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, element.getAttribute('name')];
                    case 2:
                        name_1 = (_a.sent()) || '';
                        return [4 /*yield*/, element.getAttribute('type')];
                    case 3:
                        type = (_a.sent()) || '';
                        return [4 /*yield*/, element.evaluate(function (el) { return el.tagName.toLowerCase(); })];
                    case 4:
                        tagName = _a.sent();
                        value = '';
                        // Determine value based on field name/type
                        if (name_1.includes('phone') || type === 'tel') {
                            value = userProfile.personalInfo.phone;
                        }
                        else if (name_1.includes('email') || type === 'email') {
                            value = userProfile.personalInfo.email;
                        }
                        else if (name_1.includes('firstName')) {
                            value = userProfile.personalInfo.firstName;
                        }
                        else if (name_1.includes('lastName')) {
                            value = userProfile.personalInfo.lastName;
                        }
                        else if (name_1.includes('address')) {
                            value = userProfile.personalInfo.address || '';
                        }
                        else if (name_1.includes('city')) {
                            value = userProfile.personalInfo.city || '';
                        }
                        if (!(value && tagName === 'input')) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.humanizeType(element, value, context.page)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_19 = _a.sent();
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    LinkedInStrategy.prototype.fillStandardApplicationForm = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Placeholder for standard application form handling
                        // Would implement full form filling logic here
                        this.log('📋 Filling standard application form (placeholder)');
                        return [4 /*yield*/, this.delay(3000)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    LinkedInStrategy.prototype.detectCaptcha = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkElementExists(page, [
                            'iframe[src*="recaptcha"]',
                            '.challenge-page',
                            '.security-challenge-form',
                            '.g-recaptcha'
                        ])];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    LinkedInStrategy.prototype.captureScreenshot = function (context, suffix) {
        return __awaiter(this, void 0, void 0, function () {
            var page, job, filename, path, error_20;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page, job = context.job;
                        filename = "linkedin_".concat(job.id, "_").concat(suffix, "_").concat(Date.now(), ".png");
                        path = "/tmp/jobswipe-screenshots/".concat(filename);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, page.screenshot({ path: path, fullPage: true })];
                    case 2:
                        _a.sent();
                        this.log("\uD83D\uDCF8 Screenshot captured: ".concat(filename));
                        return [2 /*return*/, path];
                    case 3:
                        error_20 = _a.sent();
                        this.log("\u26A0\uFE0F Failed to capture screenshot: ".concat(error_20));
                        return [2 /*return*/, ''];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return LinkedInStrategy;
}(BaseStrategy_1.BaseStrategy));
exports.default = LinkedInStrategy;
