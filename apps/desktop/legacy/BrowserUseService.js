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
exports.BrowserUseService = void 0;
var browser_use_1 = require("browser-use");
var events_1 = require("events");
var FormAnalyzer_1 = require("../intelligence/FormAnalyzer");
var BrowserUseService = /** @class */ (function (_super) {
    __extends(BrowserUseService, _super);
    function BrowserUseService(config) {
        var _this = _super.call(this) || this;
        _this.agent = null;
        _this.browser = null;
        _this.page = null;
        _this.isInitialized = false;
        _this.visionService = null;
        _this.formAnalyzer = null;
        _this.config = __assign(__assign({}, config), { viewport: config.viewport || { width: 1920, height: 1080 }, model: config.model || 'claude-3-sonnet-20240229', maxTokens: config.maxTokens || 4000, temperature: config.temperature || 0.1 });
        // Initialize form analyzer if requested
        if (config.useVisionService) {
            _this.formAnalyzer = new FormAnalyzer_1.FormAnalyzer();
        }
        return _this;
    }
    /**
     * Set the vision service for captcha handling
     */
    BrowserUseService.prototype.setVisionService = function (visionService) {
        this.visionService = visionService;
        console.log('🔗 Vision service connected to BrowserUseService');
    };
    /**
     * Initialize the browser-use agent with AI capabilities
     */
    BrowserUseService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    this.emit('status', { phase: 'initialization', message: 'Initializing browser-use agent...' });
                    // Validate configuration
                    if (!this.config.anthropicApiKey) {
                        throw new Error('Anthropic API key is required for browser-use integration');
                    }
                    // Initialize the AI agent with browser-use library
                    this.agent = new browser_use_1.Agent({
                        task: 'JobSwipe AI Automation Agent - Intelligent job application processing',
                        llm: {
                            provider: 'anthropic',
                            model: this.config.model,
                            apiKey: this.config.anthropicApiKey,
                            maxTokens: this.config.maxTokens,
                            temperature: this.config.temperature
                        },
                        browser: {
                            headless: this.config.headless,
                            viewport: this.config.viewport,
                            slowMo: this.config.slowMo || 100,
                            args: [
                                '--no-sandbox',
                                '--disable-setuid-sandbox',
                                '--disable-web-security',
                                '--disable-features=VizDisplayCompositor'
                            ]
                        },
                        timeout: this.config.timeout || 300000, // 5 minutes default
                    });
                    this.isInitialized = true;
                    this.emit('status', { phase: 'initialization', message: 'Browser-use agent initialized successfully' });
                }
                catch (error) {
                    this.emit('error', { phase: 'initialization', error: error.message });
                    throw new Error("Failed to initialize browser-use service: ".concat(error.message));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Process a job application using AI automation
     */
    BrowserUseService.prototype.processJobApplication = function (task) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, steps, screenshots, navigationStep, analysisStep, formFillingStep, captchaStep, submissionStep, confirmationStep, executionTime, error_1, executionTime;
            var _this = this;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        startTime = Date.now();
                        steps = [];
                        screenshots = [];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 10, , 11]);
                        if (!(!this.isInitialized || !this.agent)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.initialize()];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        this.emit('progress', { taskId: task.id, progress: 5, message: 'Starting AI job application automation' });
                        return [4 /*yield*/, this.executeStep('navigate', "Navigate to job application page: ".concat(task.jobUrl), function () { return __awaiter(_this, void 0, void 0, function () {
                                var result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.agent.run("Navigate to the job application page at ".concat(task.jobUrl, " and analyze the application process"))];
                                        case 1:
                                            result = _a.sent();
                                            return [2 /*return*/, result];
                                    }
                                });
                            }); })];
                    case 4:
                        navigationStep = _c.sent();
                        steps.push(navigationStep);
                        this.emit('progress', { taskId: task.id, progress: 15, message: 'Navigated to job page' });
                        return [4 /*yield*/, this.executeStep('analyze', 'Analyze job application form and requirements', function () { return __awaiter(_this, void 0, void 0, function () {
                                var result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.agent.run("Analyze this job application page. Determine:\n             1. Is this an \"Easy Apply\" or multi-step application?\n             2. What information is required?\n             3. Are there any special requirements or assessments?\n             4. What is the best strategy to complete this application?\n             \n             Job: ".concat(task.jobTitle, " at ").concat(task.company))];
                                        case 1:
                                            result = _a.sent();
                                            return [2 /*return*/, result];
                                    }
                                });
                            }); })];
                    case 5:
                        analysisStep = _c.sent();
                        steps.push(analysisStep);
                        this.emit('progress', { taskId: task.id, progress: 25, message: 'Analyzed application requirements' });
                        return [4 /*yield*/, this.executeStep('fill-form', 'Fill out job application form with user profile information', function () { return __awaiter(_this, void 0, void 0, function () {
                                var userInfo, result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            userInfo = this.formatUserProfileForAI(task.userProfile);
                                            return [4 /*yield*/, this.agent.run("Fill out the job application form using the following user information:\n             \n             ".concat(userInfo, "\n             \n             Instructions:\n             - Fill out all required fields accurately\n             - Use the resume file when requested: ").concat(task.userProfile.resume.fileName, "\n             - Answer screening questions appropriately based on user profile\n             - Be honest about work authorization status\n             - Save progress frequently if possible\n             - Take screenshots of important steps"))];
                                        case 1:
                                            result = _a.sent();
                                            return [2 /*return*/, result];
                                    }
                                });
                            }); })];
                    case 6:
                        formFillingStep = _c.sent();
                        steps.push(formFillingStep);
                        this.emit('progress', { taskId: task.id, progress: 60, message: 'Filled application form' });
                        return [4 /*yield*/, this.executeStep('captcha', 'Detect and resolve any captcha challenges', function () { return __awaiter(_this, void 0, void 0, function () {
                                var result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.agent.run("Check for any captcha or verification challenges on this page.\n             If found, attempt to solve them. If unable to solve automatically,\n             switch to headful mode for manual intervention.")];
                                        case 1:
                                            result = _a.sent();
                                            if (!(result.includes('captcha') && this.config.headless)) return [3 /*break*/, 3];
                                            this.emit('captcha-detected', {
                                                taskId: task.id,
                                                message: 'Captcha detected, switching to headful mode'
                                            });
                                            return [4 /*yield*/, this.switchToHeadfulMode()];
                                        case 2:
                                            _a.sent();
                                            _a.label = 3;
                                        case 3: return [2 /*return*/, result];
                                    }
                                });
                            }); })];
                    case 7:
                        captchaStep = _c.sent();
                        steps.push(captchaStep);
                        this.emit('progress', { taskId: task.id, progress: 80, message: 'Handled captcha verification' });
                        return [4 /*yield*/, this.executeStep('submit', 'Submit the job application', function () { return __awaiter(_this, void 0, void 0, function () {
                                var result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.agent.run("Review the completed application form for accuracy, then submit it.\n             After submission:\n             1. Look for confirmation message or application ID\n             2. Take a screenshot of the confirmation page\n             3. Extract any reference numbers or confirmation details\n             4. Note any next steps mentioned")];
                                        case 1:
                                            result = _a.sent();
                                            return [2 /*return*/, result];
                                    }
                                });
                            }); })];
                    case 8:
                        submissionStep = _c.sent();
                        steps.push(submissionStep);
                        this.emit('progress', { taskId: task.id, progress: 95, message: 'Application submitted' });
                        return [4 /*yield*/, this.executeStep('confirmation', 'Extract application confirmation details', function () { return __awaiter(_this, void 0, void 0, function () {
                                var result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.agent.run("Extract the application confirmation details from the current page:\n             - Application ID or reference number\n             - Confirmation message\n             - Next steps or timeline\n             - Any additional requirements\n             \n             Return this information in a structured format.")];
                                        case 1:
                                            result = _a.sent();
                                            return [2 /*return*/, result];
                                    }
                                });
                            }); })];
                    case 9:
                        confirmationStep = _c.sent();
                        steps.push(confirmationStep);
                        executionTime = Date.now() - startTime;
                        this.emit('progress', { taskId: task.id, progress: 100, message: 'Application completed successfully' });
                        return [2 /*return*/, {
                                success: true,
                                applicationId: this.extractApplicationId((_a = confirmationStep.metadata) === null || _a === void 0 ? void 0 : _a.result),
                                confirmationNumber: this.extractConfirmationNumber((_b = confirmationStep.metadata) === null || _b === void 0 ? void 0 : _b.result),
                                screenshots: screenshots,
                                executionTime: executionTime,
                                steps: steps,
                                metadata: {
                                    jobUrl: task.jobUrl,
                                    company: task.company,
                                    jobTitle: task.jobTitle,
                                    strategy: 'browser-use-ai',
                                    userAgent: this.config.userAgent,
                                }
                            }];
                    case 10:
                        error_1 = _c.sent();
                        executionTime = Date.now() - startTime;
                        this.emit('error', {
                            taskId: task.id,
                            error: error_1.message,
                            steps: steps.length
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: error_1.message,
                                errorType: this.classifyError(error_1.message),
                                screenshots: screenshots,
                                executionTime: executionTime,
                                steps: steps,
                                metadata: {
                                    jobUrl: task.jobUrl,
                                    company: task.company,
                                    jobTitle: task.jobTitle,
                                    strategy: 'browser-use-ai',
                                    failurePoint: steps.length > 0 ? steps[steps.length - 1].step : 'initialization',
                                }
                            }];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute a single automation step with error handling and tracking
     */
    BrowserUseService.prototype.executeStep = function (stepName, description, action) {
        return __awaiter(this, void 0, void 0, function () {
            var timestamp, result, screenshot, error_2, screenshot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        timestamp = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 6]);
                        this.emit('step-start', { step: stepName, description: description });
                        return [4 /*yield*/, action()];
                    case 2:
                        result = _a.sent();
                        return [4 /*yield*/, this.takeScreenshot()];
                    case 3:
                        screenshot = _a.sent();
                        this.emit('step-complete', { step: stepName, success: true });
                        return [2 /*return*/, {
                                step: stepName,
                                description: description,
                                timestamp: timestamp,
                                success: true,
                                screenshot: screenshot,
                                metadata: { result: result }
                            }];
                    case 4:
                        error_2 = _a.sent();
                        return [4 /*yield*/, this.takeScreenshot()];
                    case 5:
                        screenshot = _a.sent();
                        this.emit('step-error', { step: stepName, error: error_2.message });
                        return [2 /*return*/, {
                                step: stepName,
                                description: description,
                                timestamp: timestamp,
                                success: false,
                                error: error_2.message,
                                screenshot: screenshot,
                                metadata: { error: error_2.message }
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Switch from headless to headful mode for manual captcha solving
     */
    BrowserUseService.prototype.switchToHeadfulMode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var headfulAgent;
            return __generator(this, function (_a) {
                try {
                    this.emit('status', { phase: 'mode-switch', message: 'Switching to headful mode for captcha resolution' });
                    headfulAgent = new browser_use_1.Agent({
                        llm: {
                            provider: 'anthropic',
                            model: 'claude-3-5-sonnet-20241022',
                            apiKey: this.config.anthropicApiKey,
                        },
                        browser: {
                            headless: false, // Switch to headful
                            viewport: this.config.viewport,
                            slowMo: this.config.slowMo || 100,
                        },
                        timeout: this.config.timeout || 300000,
                    });
                    // Replace the current agent
                    this.agent = headfulAgent;
                    this.config.headless = false;
                    this.emit('status', { phase: 'mode-switch', message: 'Switched to headful mode successfully' });
                }
                catch (error) {
                    this.emit('error', { phase: 'mode-switch', error: error.message });
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Take a screenshot of the current page
     */
    BrowserUseService.prototype.takeScreenshot = function () {
        return __awaiter(this, void 0, void 0, function () {
            var screenshot, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!(this.agent && this.agent.page)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.agent.page.screenshot({
                                type: 'png',
                                fullPage: true
                            })];
                    case 1:
                        screenshot = _a.sent();
                        return [2 /*return*/, screenshot.toString('base64')];
                    case 2: return [2 /*return*/, ''];
                    case 3:
                        error_3 = _a.sent();
                        console.warn('Failed to take screenshot:', error_3.message);
                        return [2 /*return*/, ''];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Format user profile data for AI consumption
     */
    BrowserUseService.prototype.formatUserProfileForAI = function (profile) {
        var _a;
        return "\nName: ".concat(profile.firstName, " ").concat(profile.lastName, "\nEmail: ").concat(profile.email, "\nPhone: ").concat(profile.phone, "\n\nAddress:\n").concat(profile.address.street, "\n").concat(profile.address.city, ", ").concat(profile.address.state, " ").concat(profile.address.zipCode, "\n").concat(profile.address.country, "\n\nWork Authorization: ").concat(profile.workAuthorization, "\n\nExperience:\n- Years of experience: ").concat(profile.experience.years, "\n- Current title: ").concat(profile.experience.currentTitle || 'Not specified', "\n- Current company: ").concat(profile.experience.currentCompany || 'Not specified', "\n\nEducation:\n- Degree: ").concat(profile.education.degree, "\n- School: ").concat(profile.education.school, "\n- Graduation year: ").concat(profile.education.graduationYear, "\n\nDocuments:\n- Resume: ").concat(profile.resume.fileName, "\n- Cover letter: ").concat(((_a = profile.coverLetter) === null || _a === void 0 ? void 0 : _a.fileName) || 'Not provided', "\n\nLinks:\n- LinkedIn: ").concat(profile.linkedInProfile || 'Not provided', "\n- Portfolio: ").concat(profile.portfolioUrl || 'Not provided', "\n");
    };
    /**
     * Extract application ID from confirmation text
     */
    BrowserUseService.prototype.extractApplicationId = function (confirmationText) {
        if (!confirmationText)
            return undefined;
        var patterns = [
            /application\s+id[:\s]+([a-zA-Z0-9\-_]+)/i,
            /reference\s+number[:\s]+([a-zA-Z0-9\-_]+)/i,
            /application\s+number[:\s]+([a-zA-Z0-9\-_]+)/i,
        ];
        for (var _i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
            var pattern = patterns_1[_i];
            var match = confirmationText.match(pattern);
            if (match)
                return match[1];
        }
        return undefined;
    };
    /**
     * Extract confirmation number from confirmation text
     */
    BrowserUseService.prototype.extractConfirmationNumber = function (confirmationText) {
        if (!confirmationText)
            return undefined;
        var patterns = [
            /confirmation\s+number[:\s]+([a-zA-Z0-9\-_]+)/i,
            /confirmation\s+code[:\s]+([a-zA-Z0-9\-_]+)/i,
            /confirmation[:\s]+([a-zA-Z0-9\-_]+)/i,
        ];
        for (var _i = 0, patterns_2 = patterns; _i < patterns_2.length; _i++) {
            var pattern = patterns_2[_i];
            var match = confirmationText.match(pattern);
            if (match)
                return match[1];
        }
        return undefined;
    };
    /**
     * Classify error type for retry strategy
     */
    BrowserUseService.prototype.classifyError = function (errorMessage) {
        var message = errorMessage.toLowerCase();
        if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
            return 'network';
        }
        if (message.includes('captcha') || message.includes('verification') || message.includes('recaptcha')) {
            return 'captcha';
        }
        if (message.includes('form') || message.includes('field') || message.includes('validation')) {
            return 'form_error';
        }
        if (message.includes('blocked') || message.includes('forbidden') || message.includes('access denied')) {
            return 'blocked';
        }
        if (message.includes('element not found') || message.includes('page changed') || message.includes('layout')) {
            return 'site_change';
        }
        return 'unknown';
    };
    /**
     * Clean up resources
     */
    BrowserUseService.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!this.agent) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.agent.close()];
                    case 1:
                        _a.sent();
                        this.agent = null;
                        _a.label = 2;
                    case 2:
                        this.browser = null;
                        this.page = null;
                        this.isInitialized = false;
                        this.emit('status', { phase: 'cleanup', message: 'Browser-use service cleaned up successfully' });
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        this.emit('error', { phase: 'cleanup', error: error_4.message });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get current service status
     */
    BrowserUseService.prototype.getStatus = function () {
        return {
            initialized: this.isInitialized,
            hasActiveAgent: this.agent !== null,
            mode: this.config.headless ? 'headless' : 'headful',
            config: {
                viewport: this.config.viewport,
                timeout: this.config.timeout,
                slowMo: this.config.slowMo,
            }
        };
    };
    return BrowserUseService;
}(events_1.EventEmitter));
exports.BrowserUseService = BrowserUseService;
exports.default = BrowserUseService;
