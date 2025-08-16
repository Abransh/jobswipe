"use strict";
/**
 * @fileoverview Greenhouse Job Board Automation Strategy
 * @description Specialized strategy for Greenhouse-powered job boards (including Anthropic)
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Enterprise-grade Greenhouse automation with compliance
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
var BaseStrategy_1 = require("../../base/BaseStrategy");
// =============================================================================
// GREENHOUSE STRATEGY IMPLEMENTATION
// =============================================================================
var GreenhouseStrategy = /** @class */ (function (_super) {
    __extends(GreenhouseStrategy, _super);
    function GreenhouseStrategy() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.currentStepIndex = 0;
        _this.formSteps = [];
        return _this;
    }
    /**
     * Set vision service for AI-powered form analysis
     */
    GreenhouseStrategy.prototype.setVisionService = function (visionService) {
        this.visionService = visionService;
        this.log('🤖 Vision AI service integrated with Greenhouse strategy');
    };
    // =============================================================================
    // MAIN WORKFLOW EXECUTION
    // =============================================================================
    GreenhouseStrategy.prototype.executeMainWorkflow = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, captchaEncountered, screenshots, formAnalysis, i, stepType, stepResult, captchaSolved, confirmation, finalScreenshot, error_1, errorMessage, errorScreenshot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        captchaEncountered = false;
                        screenshots = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 16, , 18]);
                        this.log('🌱 Starting Greenhouse job application workflow');
                        this.log("\uD83D\uDCCB Applying to: ".concat(context.job.url));
                        // Step 1: Navigate to job page and analyze
                        return [4 /*yield*/, this.navigateToJobPage(context)];
                    case 2:
                        // Step 1: Navigate to job page and analyze
                        _a.sent();
                        // Step 2: Click Apply button to start application
                        return [4 /*yield*/, this.initiateApplication(context)];
                    case 3:
                        // Step 2: Click Apply button to start application
                        _a.sent();
                        return [4 /*yield*/, this.analyzeApplicationForm(context)];
                    case 4:
                        formAnalysis = _a.sent();
                        this.formSteps = formAnalysis.steps;
                        this.log("\uD83D\uDCDD Detected ".concat(this.formSteps.length, " form steps"));
                        i = 0;
                        _a.label = 5;
                    case 5:
                        if (!(i < this.formSteps.length)) return [3 /*break*/, 12];
                        this.currentStepIndex = i;
                        stepType = this.formSteps[i];
                        this.log("\uD83D\uDCCB Processing step ".concat(i + 1, "/").concat(this.formSteps.length, ": ").concat(stepType));
                        return [4 /*yield*/, this.processFormStep(context, stepType, i)];
                    case 6:
                        stepResult = _a.sent();
                        if (!stepResult.success) {
                            throw new Error("Failed to process step ".concat(i + 1, ": ").concat(stepResult.error));
                        }
                        return [4 /*yield*/, this.detectCaptcha(context.page)];
                    case 7:
                        if (!_a.sent()) return [3 /*break*/, 9];
                        this.log('🧩 Captcha detected during form processing');
                        captchaEncountered = true;
                        return [4 /*yield*/, this.handleCompanyCaptcha(context)];
                    case 8:
                        captchaSolved = _a.sent();
                        if (!captchaSolved) {
                            throw new Error('Failed to solve captcha during application');
                        }
                        _a.label = 9;
                    case 9: 
                    // Wait between steps to avoid being flagged as bot
                    return [4 /*yield*/, this.delay(2000)];
                    case 10:
                        // Wait between steps to avoid being flagged as bot
                        _a.sent();
                        _a.label = 11;
                    case 11:
                        i++;
                        return [3 /*break*/, 5];
                    case 12: 
                    // Step 5: Submit application
                    return [4 /*yield*/, this.submitApplication(context)];
                    case 13:
                        // Step 5: Submit application
                        _a.sent();
                        return [4 /*yield*/, this.extractConfirmation(context)];
                    case 14:
                        confirmation = _a.sent();
                        return [4 /*yield*/, this.captureScreenshot(context, 'final_success')];
                    case 15:
                        finalScreenshot = _a.sent();
                        screenshots.push(finalScreenshot);
                        return [2 /*return*/, {
                                success: confirmation.confirmed,
                                applicationId: confirmation.applicationId,
                                confirmationNumber: confirmation.confirmationId,
                                executionTime: Date.now() - startTime,
                                stepsCompleted: this.formSteps.length,
                                totalSteps: this.formSteps.length,
                                captchaEncountered: captchaEncountered,
                                screenshots: screenshots,
                                logs: this.currentExecutionLogs,
                                metrics: {
                                    timeToFirstInteraction: 0,
                                    formFillTime: Date.now() - startTime,
                                    uploadTime: 0,
                                    submissionTime: 0
                                }
                            }];
                    case 16:
                        error_1 = _a.sent();
                        errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                        this.log("\u274C Greenhouse workflow failed: ".concat(errorMessage));
                        return [4 /*yield*/, this.captureScreenshot(context, 'error')];
                    case 17:
                        errorScreenshot = _a.sent();
                        screenshots.push(errorScreenshot);
                        return [2 /*return*/, {
                                success: false,
                                error: errorMessage,
                                executionTime: Date.now() - startTime,
                                stepsCompleted: this.currentStepIndex,
                                totalSteps: this.formSteps.length || 5,
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
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // GREENHOUSE-SPECIFIC AUTOMATION METHODS
    // =============================================================================
    GreenhouseStrategy.prototype.navigateToJobPage = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, job;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page, job = context.job;
                        this.log("\uD83C\uDF10 Navigating to: ".concat(job.url));
                        return [4 /*yield*/, page.goto(job.url, {
                                waitUntil: 'networkidle',
                                timeout: 30000
                            })];
                    case 1:
                        _a.sent();
                        // Wait for page to fully load
                        return [4 /*yield*/, this.delay(3000)];
                    case 2:
                        // Wait for page to fully load
                        _a.sent();
                        this.log('✅ Job page loaded successfully');
                        return [2 /*return*/];
                }
            });
        });
    };
    GreenhouseStrategy.prototype.initiateApplication = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, applyButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page;
                        this.log('🚀 Looking for Apply button');
                        return [4 /*yield*/, this.findElement([
                                'a[href*="boards.greenhouse.io"][href*="application"]',
                                'button:has-text("Apply for this job")',
                                'a:has-text("Apply for this job")',
                                '.application-outlet button',
                                'button[data-provides*="application"]',
                                'a.postings-btn'
                            ], page)];
                    case 1:
                        applyButton = _a.sent();
                        return [4 /*yield*/, this.humanizeClick(applyButton, page)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.delay(5000)];
                    case 3:
                        _a.sent(); // Wait for application form to load
                        this.log('✅ Application form opened');
                        return [2 /*return*/];
                }
            });
        });
    };
    GreenhouseStrategy.prototype.analyzeApplicationForm = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, hasMultipleSteps;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page;
                        this.log('🔍 Analyzing Greenhouse application form structure');
                        return [4 /*yield*/, this.checkElementExists(page, [
                                '.application-step',
                                '.step-indicator',
                                '.progress-bar',
                                '[data-step]'
                            ])];
                    case 1:
                        hasMultipleSteps = _a.sent();
                        if (hasMultipleSteps) {
                            return [2 /*return*/, this.analyzeMultiStepForm(page)];
                        }
                        else {
                            return [2 /*return*/, this.analyzeSinglePageForm(page)];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    GreenhouseStrategy.prototype.analyzeMultiStepForm = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            var stepIndicators, steps;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log('📋 Multi-step form detected');
                        return [4 /*yield*/, page.locator('.step-indicator, [data-step], .progress-step').count()];
                    case 1:
                        stepIndicators = _a.sent();
                        steps = [];
                        // Common Greenhouse form progression
                        steps.push('personal-info');
                        if (stepIndicators > 1) {
                            steps.push('resume-upload');
                        }
                        if (stepIndicators > 2) {
                            steps.push('additional-questions');
                        }
                        if (stepIndicators > 3) {
                            steps.push('cover-letter');
                        }
                        steps.push('review-submit');
                        return [2 /*return*/, { steps: steps }];
                }
            });
        });
    };
    GreenhouseStrategy.prototype.analyzeSinglePageForm = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            var steps;
            return __generator(this, function (_a) {
                this.log('📄 Single page form detected');
                steps = ['single-page-form'];
                return [2 /*return*/, { steps: steps }];
            });
        });
    };
    GreenhouseStrategy.prototype.processFormStep = function (context, stepType, stepIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var page, _a, error_2, errorMessage;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        page = context.page;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 17, , 18]);
                        this.log("\uD83D\uDCDD Processing step: ".concat(stepType));
                        _a = stepType;
                        switch (_a) {
                            case 'personal-info': return [3 /*break*/, 2];
                            case 'resume-upload': return [3 /*break*/, 4];
                            case 'additional-questions': return [3 /*break*/, 6];
                            case 'cover-letter': return [3 /*break*/, 8];
                            case 'review-submit': return [3 /*break*/, 10];
                            case 'single-page-form': return [3 /*break*/, 12];
                        }
                        return [3 /*break*/, 14];
                    case 2: return [4 /*yield*/, this.fillPersonalInfoStep(context)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4: return [4 /*yield*/, this.handleResumeUploadStep(context)];
                    case 5: return [2 /*return*/, _b.sent()];
                    case 6: return [4 /*yield*/, this.fillAdditionalQuestionsStep(context)];
                    case 7: return [2 /*return*/, _b.sent()];
                    case 8: return [4 /*yield*/, this.fillCoverLetterStep(context)];
                    case 9: return [2 /*return*/, _b.sent()];
                    case 10: return [4 /*yield*/, this.handleReviewStep(context)];
                    case 11: return [2 /*return*/, _b.sent()];
                    case 12: return [4 /*yield*/, this.fillSinglePageForm(context)];
                    case 13: return [2 /*return*/, _b.sent()];
                    case 14:
                        this.log("\u26A0\uFE0F Unknown step type: ".concat(stepType, ", using generic approach"));
                        return [4 /*yield*/, this.fillGenericFormStep(context)];
                    case 15: return [2 /*return*/, _b.sent()];
                    case 16: return [3 /*break*/, 18];
                    case 17:
                        error_2 = _b.sent();
                        errorMessage = error_2 instanceof Error ? error_2.message : String(error_2);
                        this.log("\u274C Step ".concat(stepType, " failed: ").concat(errorMessage));
                        return [2 /*return*/, { success: false, error: errorMessage }];
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // FORM STEP IMPLEMENTATIONS
    // =============================================================================
    GreenhouseStrategy.prototype.fillPersonalInfoStep = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, userProfile, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page, userProfile = context.userProfile;
                        this.log('👤 Filling personal information');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 10, , 11]);
                        // Fill first name
                        return [4 /*yield*/, this.fillFieldIfExists(page, [
                                'input[name*="first_name"]',
                                'input[name*="firstName"]',
                                'input[id*="first_name"]',
                                'input[placeholder*="First name"]'
                            ], userProfile.personalInfo.firstName)];
                    case 2:
                        // Fill first name
                        _a.sent();
                        // Fill last name
                        return [4 /*yield*/, this.fillFieldIfExists(page, [
                                'input[name*="last_name"]',
                                'input[name*="lastName"]',
                                'input[id*="last_name"]',
                                'input[placeholder*="Last name"]'
                            ], userProfile.personalInfo.lastName)];
                    case 3:
                        // Fill last name
                        _a.sent();
                        // Fill email
                        return [4 /*yield*/, this.fillFieldIfExists(page, [
                                'input[name*="email"]',
                                'input[type="email"]',
                                'input[id*="email"]'
                            ], userProfile.personalInfo.email)];
                    case 4:
                        // Fill email
                        _a.sent();
                        // Fill phone
                        return [4 /*yield*/, this.fillFieldIfExists(page, [
                                'input[name*="phone"]',
                                'input[type="tel"]',
                                'input[id*="phone"]'
                            ], userProfile.personalInfo.phone)];
                    case 5:
                        // Fill phone
                        _a.sent();
                        // Fill address fields if present
                        return [4 /*yield*/, this.fillFieldIfExists(page, [
                                'input[name*="address"]',
                                'input[id*="address"]'
                            ], userProfile.personalInfo.address || '')];
                    case 6:
                        // Fill address fields if present
                        _a.sent();
                        return [4 /*yield*/, this.fillFieldIfExists(page, [
                                'input[name*="city"]',
                                'input[id*="city"]'
                            ], userProfile.personalInfo.city || '')];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, this.fillFieldIfExists(page, [
                                'input[name*="state"]',
                                'select[name*="state"]',
                                'input[id*="state"]'
                            ], userProfile.personalInfo.state || '')];
                    case 8:
                        _a.sent();
                        // Move to next step
                        return [4 /*yield*/, this.clickNextButton(page)];
                    case 9:
                        // Move to next step
                        _a.sent();
                        return [2 /*return*/, { success: true }];
                    case 10:
                        error_3 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_3 instanceof Error ? error_3.message : String(error_3)
                            }];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    GreenhouseStrategy.prototype.handleResumeUploadStep = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, userProfile, fileInput, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page, userProfile = context.userProfile;
                        this.log('📄 Handling resume upload');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 10]);
                        return [4 /*yield*/, this.findElement([
                                'input[type="file"]',
                                'input[name*="resume"]',
                                'input[accept*=".pdf"]'
                            ], page)];
                    case 2:
                        fileInput = _a.sent();
                        if (!userProfile.professional.resumeUrl) return [3 /*break*/, 5];
                        return [4 /*yield*/, fileInput.setInputFiles(userProfile.professional.resumeUrl)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.delay(3000)];
                    case 4:
                        _a.sent(); // Wait for upload processing
                        this.log('✅ Resume uploaded');
                        return [3 /*break*/, 6];
                    case 5:
                        this.log('⚠️ No resume file provided, skipping upload');
                        _a.label = 6;
                    case 6: return [4 /*yield*/, this.clickNextButton(page)];
                    case 7:
                        _a.sent();
                        return [2 /*return*/, { success: true }];
                    case 8:
                        error_4 = _a.sent();
                        this.log("\u26A0\uFE0F Resume upload failed: ".concat(error_4, ", continuing anyway"));
                        return [4 /*yield*/, this.clickNextButton(page)];
                    case 9:
                        _a.sent();
                        return [2 /*return*/, { success: true }]; // Continue even if upload fails
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    GreenhouseStrategy.prototype.fillAdditionalQuestionsStep = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, userProfile, formFields, _i, formFields_1, field, isVisible, fieldError_1, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page, userProfile = context.userProfile;
                        this.log('❓ Filling additional questions');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 12, , 13]);
                        return [4 /*yield*/, page.locator('input, select, textarea').all()];
                    case 2:
                        formFields = _a.sent();
                        _i = 0, formFields_1 = formFields;
                        _a.label = 3;
                    case 3:
                        if (!(_i < formFields_1.length)) return [3 /*break*/, 10];
                        field = formFields_1[_i];
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 8, , 9]);
                        return [4 /*yield*/, field.isVisible()];
                    case 5:
                        isVisible = _a.sent();
                        if (!isVisible) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.smartFillField(field, userProfile, page)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        fieldError_1 = _a.sent();
                        // Continue with other fields if one fails
                        this.log("\u26A0\uFE0F Field fill error: ".concat(fieldError_1));
                        return [3 /*break*/, 9];
                    case 9:
                        _i++;
                        return [3 /*break*/, 3];
                    case 10: return [4 /*yield*/, this.clickNextButton(page)];
                    case 11:
                        _a.sent();
                        return [2 /*return*/, { success: true }];
                    case 12:
                        error_5 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_5 instanceof Error ? error_5.message : String(error_5)
                            }];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    GreenhouseStrategy.prototype.fillCoverLetterStep = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, userProfile, coverLetterField, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page, userProfile = context.userProfile;
                        this.log('📝 Filling cover letter');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 8]);
                        return [4 /*yield*/, this.findElement([
                                'textarea[name*="cover_letter"]',
                                'textarea[id*="cover_letter"]',
                                'textarea[placeholder*="cover letter"]'
                            ], page)];
                    case 2:
                        coverLetterField = _a.sent();
                        if (!userProfile.professional.coverLetterTemplate) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.humanizeType(coverLetterField, userProfile.professional.coverLetterTemplate, page)];
                    case 3:
                        _a.sent();
                        this.log('✅ Cover letter filled');
                        _a.label = 4;
                    case 4: return [4 /*yield*/, this.clickNextButton(page)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, { success: true }];
                    case 6:
                        error_6 = _a.sent();
                        this.log("\u26A0\uFE0F Cover letter step failed: ".concat(error_6, ", continuing anyway"));
                        return [4 /*yield*/, this.clickNextButton(page)];
                    case 7:
                        _a.sent();
                        return [2 /*return*/, { success: true }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    GreenhouseStrategy.prototype.handleReviewStep = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page;
            return __generator(this, function (_a) {
                page = context.page;
                this.log('👀 Handling review step');
                try {
                    // This is typically the final step before submission
                    // Just proceed to submit
                    return [2 /*return*/, { success: true }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            success: false,
                            error: error instanceof Error ? error.message : String(error)
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    GreenhouseStrategy.prototype.fillSinglePageForm = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, userProfile, uploadError_1, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page, userProfile = context.userProfile;
                        this.log('📄 Filling single page form');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        // Fill personal information first
                        return [4 /*yield*/, this.fillPersonalInfoStep(context)];
                    case 2:
                        // Fill personal information first
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.handleResumeUploadStep(context)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        uploadError_1 = _a.sent();
                        this.log("\u26A0\uFE0F Upload section skipped: ".concat(uploadError_1));
                        return [3 /*break*/, 6];
                    case 6: 
                    // Fill additional questions
                    return [4 /*yield*/, this.fillAdditionalQuestionsStep(context)];
                    case 7:
                        // Fill additional questions
                        _a.sent();
                        return [2 /*return*/, { success: true }];
                    case 8:
                        error_7 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_7 instanceof Error ? error_7.message : String(error_7)
                            }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    GreenhouseStrategy.prototype.fillGenericFormStep = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, userProfile, allFields, _i, allFields_1, field, fieldError_2, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page, userProfile = context.userProfile;
                        this.log('🔧 Using generic form filling approach');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 10, , 11]);
                        return [4 /*yield*/, page.locator('input:visible, select:visible, textarea:visible').all()];
                    case 2:
                        allFields = _a.sent();
                        _i = 0, allFields_1 = allFields;
                        _a.label = 3;
                    case 3:
                        if (!(_i < allFields_1.length)) return [3 /*break*/, 8];
                        field = allFields_1[_i];
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.smartFillField(field, userProfile, page)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        fieldError_2 = _a.sent();
                        return [3 /*break*/, 7]; // Skip failed fields
                    case 7:
                        _i++;
                        return [3 /*break*/, 3];
                    case 8: return [4 /*yield*/, this.clickNextButton(page)];
                    case 9:
                        _a.sent();
                        return [2 /*return*/, { success: true }];
                    case 10:
                        error_8 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_8 instanceof Error ? error_8.message : String(error_8)
                            }];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // ABSTRACT METHOD IMPLEMENTATIONS
    // =============================================================================
    GreenhouseStrategy.prototype.mapFormFields = function (userProfile) {
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
                        country: userProfile.personalInfo.country || 'United States',
                        linkedinUrl: userProfile.professional.linkedinUrl || '',
                        currentCompany: userProfile.professional.currentCompany || '',
                        currentTitle: userProfile.professional.currentTitle || '',
                        yearsExperience: ((_a = userProfile.professional.yearsExperience) === null || _a === void 0 ? void 0 : _a.toString()) || '',
                        salaryExpectation: ((_b = userProfile.preferences.salaryMin) === null || _b === void 0 ? void 0 : _b.toString()) || ''
                    }];
            });
        });
    };
    GreenhouseStrategy.prototype.handleCompanyCaptcha = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, captchaSelectors, hasCaptcha;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page;
                        this.log('🤖 Handling Greenhouse captcha with AI vision');
                        captchaSelectors = [
                            'iframe[src*="recaptcha"]',
                            '.g-recaptcha',
                            '.h-captcha',
                            '.recaptcha-checkbox'
                        ];
                        return [4 /*yield*/, this.checkElementExists(page, captchaSelectors)];
                    case 1:
                        hasCaptcha = _a.sent();
                        if (!hasCaptcha) return [3 /*break*/, 5];
                        this.log('🧩 CAPTCHA detected on Greenhouse form');
                        if (!this.visionService) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.resolveWithAI(context)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        this.log('⚠️ No vision service available, manual intervention may be required');
                        // Wait for manual resolution
                        return [4 /*yield*/, this.delay(30000)];
                    case 4:
                        // Wait for manual resolution
                        _a.sent();
                        return [2 /*return*/, true];
                    case 5: return [2 /*return*/, true]; // No captcha detected
                }
            });
        });
    };
    GreenhouseStrategy.prototype.extractConfirmation = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, successSelectors, successElement, isConfirmed, confirmationId, confirmationText, patterns, _i, patterns_1, pattern, match, extractError_1, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        successSelectors = [
                            '.application-confirmation',
                            '.success-message',
                            'h1:has-text("Thank you")',
                            'h2:has-text("Application submitted")',
                            '.application-submitted'
                        ];
                        return [4 /*yield*/, page.locator(successSelectors.join(', ')).first()];
                    case 2:
                        successElement = _a.sent();
                        return [4 /*yield*/, successElement.isVisible({ timeout: 10000 })];
                    case 3:
                        isConfirmed = _a.sent();
                        if (!isConfirmed) {
                            return [2 /*return*/, { confirmed: false }];
                        }
                        confirmationId = void 0;
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, page.textContent('body')];
                    case 5:
                        confirmationText = _a.sent();
                        if (confirmationText) {
                            patterns = [
                                /confirmation.*?([A-Z0-9]{6,})/i,
                                /reference.*?([A-Z0-9]{6,})/i,
                                /application.*?id.*?([A-Z0-9]{6,})/i,
                                /tracking.*?([A-Z0-9]{6,})/i
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
                        return [3 /*break*/, 7];
                    case 6:
                        extractError_1 = _a.sent();
                        this.log("\u26A0\uFE0F Could not extract confirmation ID: ".concat(extractError_1));
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, {
                            confirmed: true,
                            confirmationId: confirmationId || "GH_".concat(Date.now()),
                            applicationId: confirmationId || "APP_".concat(Date.now())
                        }];
                    case 8:
                        error_9 = _a.sent();
                        this.log("\u274C Failed to extract confirmation: ".concat(error_9));
                        return [2 /*return*/, { confirmed: false }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // UTILITY METHODS
    // =============================================================================
    GreenhouseStrategy.prototype.submitApplication = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, submitButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page;
                        this.log('🚀 Submitting application');
                        return [4 /*yield*/, this.findElement([
                                'button[type="submit"]',
                                'input[type="submit"]',
                                'button:has-text("Submit Application")',
                                'button:has-text("Submit")',
                                '.application-submit button'
                            ], page)];
                    case 1:
                        submitButton = _a.sent();
                        return [4 /*yield*/, this.humanizeClick(submitButton, page)];
                    case 2:
                        _a.sent();
                        // Wait for submission to process
                        return [4 /*yield*/, this.delay(5000)];
                    case 3:
                        // Wait for submission to process
                        _a.sent();
                        this.log('✅ Application submitted');
                        return [2 /*return*/];
                }
            });
        });
    };
    GreenhouseStrategy.prototype.resolveWithAI = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var page, screenshot, analysisRequest, result, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.visionService)
                            return [2 /*return*/, false];
                        page = context.page;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        this.log('🧠 Attempting AI-powered captcha resolution');
                        return [4 /*yield*/, page.screenshot({ type: 'png' })];
                    case 2:
                        screenshot = _a.sent();
                        analysisRequest = {
                            image: screenshot,
                            imageType: 'png',
                            analysisType: 'captcha-resolution',
                            context: {
                                jobSite: 'greenhouse',
                                formType: 'application',
                                language: 'en'
                            },
                            options: {
                                preferredProviders: ['claude-vision'],
                                requireHighAccuracy: true,
                                urgentProcessing: true
                            }
                        };
                        return [4 /*yield*/, this.visionService.analyzeImage(analysisRequest)];
                    case 3:
                        result = _a.sent();
                        if (result.success && result.captchaSolution) {
                            this.log("\uD83C\uDFAF AI solution: ".concat(result.captchaSolution));
                            // Apply the solution (implementation depends on captcha type)
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, false];
                    case 4:
                        error_10 = _a.sent();
                        this.log("\u274C AI captcha resolution failed: ".concat(error_10));
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    GreenhouseStrategy.prototype.smartFillField = function (field, userProfile, page) {
        return __awaiter(this, void 0, void 0, function () {
            var name_1, id, placeholder, type, tagName, fieldIdentifier, value, _a, options, _i, options_1, option, optionText, error_11;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 21, , 22]);
                        return [4 /*yield*/, field.getAttribute('name')];
                    case 1:
                        name_1 = (_d.sent()) || '';
                        return [4 /*yield*/, field.getAttribute('id')];
                    case 2:
                        id = (_d.sent()) || '';
                        return [4 /*yield*/, field.getAttribute('placeholder')];
                    case 3:
                        placeholder = (_d.sent()) || '';
                        return [4 /*yield*/, field.getAttribute('type')];
                    case 4:
                        type = (_d.sent()) || '';
                        return [4 /*yield*/, field.evaluate(function (el) { return el.tagName.toLowerCase(); })];
                    case 5:
                        tagName = _d.sent();
                        fieldIdentifier = "".concat(name_1, " ").concat(id, " ").concat(placeholder).toLowerCase();
                        value = '';
                        // Smart field mapping based on common patterns
                        if (fieldIdentifier.includes('first') && fieldIdentifier.includes('name')) {
                            value = userProfile.personalInfo.firstName;
                        }
                        else if (fieldIdentifier.includes('last') && fieldIdentifier.includes('name')) {
                            value = userProfile.personalInfo.lastName;
                        }
                        else if (fieldIdentifier.includes('email') || type === 'email') {
                            value = userProfile.personalInfo.email;
                        }
                        else if (fieldIdentifier.includes('phone') || type === 'tel') {
                            value = userProfile.personalInfo.phone;
                        }
                        else if (fieldIdentifier.includes('address')) {
                            value = userProfile.personalInfo.address || '';
                        }
                        else if (fieldIdentifier.includes('city')) {
                            value = userProfile.personalInfo.city || '';
                        }
                        else if (fieldIdentifier.includes('state')) {
                            value = userProfile.personalInfo.state || '';
                        }
                        else if (fieldIdentifier.includes('zip') || fieldIdentifier.includes('postal')) {
                            value = userProfile.personalInfo.zipCode || '';
                        }
                        else if (fieldIdentifier.includes('country')) {
                            value = userProfile.personalInfo.country || 'United States';
                        }
                        else if (fieldIdentifier.includes('linkedin')) {
                            value = userProfile.professional.linkedinUrl || '';
                        }
                        else if (fieldIdentifier.includes('company')) {
                            value = userProfile.professional.currentCompany || '';
                        }
                        else if (fieldIdentifier.includes('title')) {
                            value = userProfile.professional.currentTitle || '';
                        }
                        else if (fieldIdentifier.includes('experience') || fieldIdentifier.includes('years')) {
                            value = ((_b = userProfile.professional.yearsExperience) === null || _b === void 0 ? void 0 : _b.toString()) || '';
                        }
                        else if (fieldIdentifier.includes('salary')) {
                            value = ((_c = userProfile.preferences.salaryMin) === null || _c === void 0 ? void 0 : _c.toString()) || '';
                        }
                        if (!(value && tagName === 'input')) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.humanizeType(field, value, page)];
                    case 6:
                        _d.sent();
                        return [3 /*break*/, 20];
                    case 7:
                        if (!(value && tagName === 'select')) return [3 /*break*/, 18];
                        _d.label = 8;
                    case 8:
                        _d.trys.push([8, 10, , 17]);
                        return [4 /*yield*/, field.selectOption({ label: value })];
                    case 9:
                        _d.sent();
                        return [3 /*break*/, 17];
                    case 10:
                        _a = _d.sent();
                        return [4 /*yield*/, field.locator('option').all()];
                    case 11:
                        options = _d.sent();
                        _i = 0, options_1 = options;
                        _d.label = 12;
                    case 12:
                        if (!(_i < options_1.length)) return [3 /*break*/, 16];
                        option = options_1[_i];
                        return [4 /*yield*/, option.textContent()];
                    case 13:
                        optionText = _d.sent();
                        if (!(optionText && optionText.toLowerCase().includes(value.toLowerCase()))) return [3 /*break*/, 15];
                        return [4 /*yield*/, option.click()];
                    case 14:
                        _d.sent();
                        return [3 /*break*/, 16];
                    case 15:
                        _i++;
                        return [3 /*break*/, 12];
                    case 16: return [3 /*break*/, 17];
                    case 17: return [3 /*break*/, 20];
                    case 18:
                        if (!(value && tagName === 'textarea')) return [3 /*break*/, 20];
                        return [4 /*yield*/, this.humanizeType(field, value, page)];
                    case 19:
                        _d.sent();
                        _d.label = 20;
                    case 20: return [3 /*break*/, 22];
                    case 21:
                        error_11 = _d.sent();
                        // Skip field if there's an error
                        this.log("\u26A0\uFE0F Skipping field due to error: ".concat(error_11));
                        return [3 /*break*/, 22];
                    case 22: return [2 /*return*/];
                }
            });
        });
    };
    GreenhouseStrategy.prototype.fillFieldIfExists = function (page, selectors, value) {
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
    GreenhouseStrategy.prototype.clickNextButton = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            var nextButton, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.findElement([
                                'button:has-text("Next")',
                                'button:has-text("Continue")',
                                'input[value*="Next"]',
                                'input[value*="Continue"]',
                                '.btn-next',
                                '.continue-btn'
                            ], page)];
                    case 1:
                        nextButton = _a.sent();
                        return [4 /*yield*/, this.humanizeClick(nextButton, page)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.delay(3000)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_12 = _a.sent();
                        this.log("\u26A0\uFE0F Could not find or click next button: ".concat(error_12));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    GreenhouseStrategy.prototype.checkElementExists = function (page, selectors) {
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
                        return [4 /*yield*/, element.isVisible({ timeout: 2000 })];
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
    GreenhouseStrategy.prototype.captureScreenshot = function (context, suffix) {
        return __awaiter(this, void 0, void 0, function () {
            var page, job, filename, path, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = context.page, job = context.job;
                        filename = "greenhouse_".concat(job.id, "_").concat(suffix, "_").concat(Date.now(), ".png");
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
                        error_13 = _a.sent();
                        this.log("\u26A0\uFE0F Failed to capture screenshot: ".concat(error_13));
                        return [2 /*return*/, ''];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return GreenhouseStrategy;
}(BaseStrategy_1.BaseStrategy));
exports.default = GreenhouseStrategy;
