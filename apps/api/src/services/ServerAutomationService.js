"use strict";
/**
 * @fileoverview Server Automation Service
 * @description Server-side job application automation using Python scripts
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerAutomationService = void 0;
var child_process_1 = require("child_process");
var events_1 = require("events");
var crypto_1 = require("crypto");
var path_1 = require("path");
var promises_1 = require("fs/promises");
var PythonBridge_1 = require("./PythonBridge");
// =============================================================================
// SERVER AUTOMATION SERVICE
// =============================================================================
var ServerAutomationService = /** @class */ (function (_super) {
    __extends(ServerAutomationService, _super);
    function ServerAutomationService(fastify, proxyRotator) {
        var _this = _super.call(this) || this;
        _this.fastify = fastify;
        _this.proxyRotator = proxyRotator;
        _this.activeProcesses = new Map();
        _this.serverId = "server_".concat((0, crypto_1.randomUUID)().substring(0, 8));
        _this.config = {
            pythonPath: process.env.PYTHON_PATH || path_1.default.join(__dirname, '../../../../venv/bin/python'),
            companiesPath: process.env.PYTHON_COMPANIES_PATH || path_1.default.join(__dirname, '../../../desktop/companies'),
            timeout: parseInt(process.env.SERVER_AUTOMATION_TIMEOUT || '120000'), // 2 minutes
            screenshotEnabled: process.env.SCREENSHOT_ENABLED !== 'false',
            screenshotPath: process.env.SCREENSHOT_PATH || '/tmp/jobswipe/screenshots',
            maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS || '5')
        };
        // Initialize Python Bridge
        _this.pythonBridge = new PythonBridge_1.PythonBridge(_this.fastify, {
            pythonPath: _this.config.pythonPath,
            companiesPath: _this.config.companiesPath,
            timeout: _this.config.timeout,
            screenshotEnabled: _this.config.screenshotEnabled,
            screenshotPath: _this.config.screenshotPath,
            maxRetries: 3
        });
        _this.fastify.log.info("ServerAutomationService initialized (".concat(_this.serverId, ")"));
        _this.fastify.log.info("Companies path: ".concat(_this.config.companiesPath));
        _this.setupCleanup();
        _this.validateCompaniesPath();
        return _this;
    }
    // =============================================================================
    // VALIDATION & SETUP
    // =============================================================================
    /**
     * Validate that companies path exists and log available automations
     */
    ServerAutomationService.prototype.validateCompaniesPath = function () {
        return __awaiter(this, void 0, void 0, function () {
            var companies, availableCompanies, _i, availableCompanies_1, company, scriptPath, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 9, , 10]);
                        return [4 /*yield*/, promises_1.default.access(this.config.companiesPath)];
                    case 1:
                        _b.sent();
                        this.fastify.log.info("\u2705 Companies directory found: ".concat(this.config.companiesPath));
                        return [4 /*yield*/, promises_1.default.readdir(this.config.companiesPath, { withFileTypes: true })];
                    case 2:
                        companies = _b.sent();
                        availableCompanies = companies
                            .filter(function (dirent) { return dirent.isDirectory() && !dirent.name.startsWith('.'); })
                            .map(function (dirent) { return dirent.name; });
                        this.fastify.log.info("\uD83D\uDCC1 Available company automations: ".concat(availableCompanies.join(', ')));
                        _i = 0, availableCompanies_1 = availableCompanies;
                        _b.label = 3;
                    case 3:
                        if (!(_i < availableCompanies_1.length)) return [3 /*break*/, 8];
                        company = availableCompanies_1[_i];
                        scriptPath = path_1.default.join(this.config.companiesPath, company, 'run_automation.py');
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, promises_1.default.access(scriptPath)];
                    case 5:
                        _b.sent();
                        this.fastify.log.info("\u2705 ".concat(company, " automation script found"));
                        return [3 /*break*/, 7];
                    case 6:
                        _a = _b.sent();
                        this.fastify.log.warn("\u26A0\uFE0F ".concat(company, " automation script missing: ").concat(scriptPath));
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 3];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_1 = _b.sent();
                        this.fastify.log.error("\u274C Companies directory not found: ".concat(this.config.companiesPath));
                        this.fastify.log.error("Path resolution error: ".concat(error_1 instanceof Error ? error_1.message : error_1));
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // AUTOMATION EXECUTION
    // =============================================================================
    /**
     * Execute automation for a job application
     */
    ServerAutomationService.prototype.executeAutomation = function (request, correlationId) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, applicationId, companyAutomation, logContext, proxy, result, error_2, executionTime, errorMessage, failureResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        applicationId = request.applicationId, companyAutomation = request.companyAutomation;
                        logContext = {
                            correlationId: correlationId || "auto_".concat(applicationId),
                            applicationId: applicationId,
                            companyAutomation: companyAutomation,
                            userId: request.userId,
                            jobId: request.jobId,
                            serverId: this.serverId
                        };
                        this.fastify.log.info(__assign(__assign({}, logContext), { event: 'server_automation_started', message: "Starting server automation for ".concat(companyAutomation), jobTitle: request.jobData.title, company: request.jobData.company }));
                        // Check concurrency limits
                        if (this.activeProcesses.size >= this.config.maxConcurrentJobs) {
                            throw new Error("Maximum concurrent jobs (".concat(this.config.maxConcurrentJobs, ") reached"));
                        }
                        // Validate company automation exists
                        if (!this.isCompanySupported(companyAutomation)) {
                            throw new Error("Unsupported company automation: ".concat(companyAutomation));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        return [4 /*yield*/, this.proxyRotator.getNextProxy()];
                    case 2:
                        proxy = _a.sent();
                        return [4 /*yield*/, this.executeWithPythonBridge(request, proxy, logContext.correlationId)];
                    case 3:
                        result = _a.sent();
                        if (!(proxy && result.success)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.proxyRotator.reportProxyHealth(proxy.id, true, result.executionTime)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        if (!(proxy && !result.success)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.proxyRotator.reportProxyHealth(proxy.id, false, undefined, result.error)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        // Add server metadata
                        result.serverInfo = {
                            serverId: this.serverId,
                            executionMode: 'server',
                            processingTime: Date.now() - startTime
                        };
                        if (proxy) {
                            result.proxyUsed = "".concat(proxy.host, ":").concat(proxy.port);
                        }
                        this.fastify.log.info(__assign(__assign({}, logContext), { event: 'server_automation_completed', message: 'Server automation completed', success: result.success, executionTimeMs: result.executionTime, confirmationNumber: result.confirmationNumber, stepsCompleted: result.steps.length, screenshotsTaken: result.screenshots.length, captchaEvents: result.captchaEvents.length }));
                        // Emit automation events for WebSocket integration
                        this.emit('automation-completed', __assign(__assign({}, result), { correlationId: logContext.correlationId, userId: request.userId, applicationId: request.applicationId, jobData: request.jobData, completedAt: new Date().toISOString() }));
                        // Emit to WebSocket service if available
                        if (this.fastify.websocket) {
                            this.fastify.websocket.emitToUser(request.userId, 'automation-completed', {
                                applicationId: request.applicationId,
                                status: 'completed',
                                success: result.success,
                                jobTitle: request.jobData.title,
                                company: request.jobData.company,
                                completedAt: new Date().toISOString(),
                                confirmationNumber: result.confirmationNumber,
                                executionTime: result.executionTime,
                                message: result.success
                                    ? 'Job application completed successfully!'
                                    : 'Job application automation failed'
                            });
                        }
                        return [2 /*return*/, result];
                    case 8:
                        error_2 = _a.sent();
                        executionTime = Date.now() - startTime;
                        errorMessage = error_2 instanceof Error ? error_2.message : 'Unknown error';
                        this.fastify.log.error(__assign(__assign({}, logContext), { event: 'server_automation_failed', message: 'Server automation failed with error', error: errorMessage, executionTimeMs: executionTime, errorStack: error_2 instanceof Error ? error_2.stack : undefined }));
                        failureResult = {
                            success: false,
                            applicationId: applicationId,
                            executionTime: executionTime,
                            companyAutomation: companyAutomation,
                            status: 'failed',
                            error: errorMessage,
                            steps: [],
                            screenshots: [],
                            captchaEvents: [],
                            serverInfo: {
                                serverId: this.serverId,
                                executionMode: 'server',
                                processingTime: executionTime
                            }
                        };
                        // Emit automation events for WebSocket integration
                        this.emit('automation-failed', __assign(__assign({}, failureResult), { userId: request.userId, applicationId: request.applicationId, jobData: request.jobData, failedAt: new Date().toISOString(), correlationId: logContext.correlationId }));
                        // Emit to WebSocket service if available
                        if (this.fastify.websocket) {
                            this.fastify.websocket.emitToUser(request.userId, 'automation-failed', {
                                applicationId: request.applicationId,
                                status: 'failed',
                                jobTitle: request.jobData.title,
                                company: request.jobData.company,
                                failedAt: new Date().toISOString(),
                                error: errorMessage,
                                executionTime: executionTime,
                                retryAvailable: true,
                                message: 'Job application automation failed'
                            });
                        }
                        return [2 /*return*/, failureResult];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute automation using Python Bridge
     */
    ServerAutomationService.prototype.executeWithPythonBridge = function (request, proxy, correlationId) {
        return __awaiter(this, void 0, void 0, function () {
            var pythonRequest, pythonResult;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        pythonRequest = {
                            applicationId: request.applicationId,
                            correlationId: correlationId,
                            userId: request.userId,
                            jobData: request.jobData,
                            userProfile: request.userProfile,
                            automationConfig: {
                                headless: ((_a = request.options) === null || _a === void 0 ? void 0 : _a.headless) !== false,
                                timeout: ((_b = request.options) === null || _b === void 0 ? void 0 : _b.timeout) || this.config.timeout,
                                maxRetries: ((_c = request.options) === null || _c === void 0 ? void 0 : _c.maxRetries) || 3,
                                screenshotEnabled: this.config.screenshotEnabled,
                                screenshotPath: this.config.screenshotPath
                            },
                            proxyConfig: proxy ? {
                                host: proxy.host,
                                port: proxy.port,
                                username: proxy.username,
                                password: proxy.password,
                                type: proxy.proxyType
                            } : undefined
                        };
                        return [4 /*yield*/, this.pythonBridge.executePythonAutomation(request.companyAutomation, pythonRequest)];
                    case 1:
                        pythonResult = _d.sent();
                        // Convert PythonExecutionResult to ServerAutomationResult
                        return [2 /*return*/, {
                                success: pythonResult.success,
                                applicationId: pythonResult.applicationId,
                                confirmationNumber: pythonResult.confirmationNumber,
                                executionTime: pythonResult.executionTimeMs,
                                companyAutomation: request.companyAutomation,
                                status: pythonResult.success ? 'success' : 'failed',
                                error: pythonResult.error,
                                steps: pythonResult.steps,
                                screenshots: pythonResult.screenshots,
                                captchaEvents: pythonResult.captchaEvents,
                                proxyUsed: proxy ? "".concat(proxy.host, ":").concat(proxy.port) : undefined,
                                serverInfo: {
                                    serverId: this.serverId,
                                    executionMode: 'server',
                                    pythonVersion: pythonResult.metadata.pythonVersion,
                                    processingTime: pythonResult.executionTimeMs
                                }
                            }];
                }
            });
        });
    };
    /**
     * Execute Python automation script (LEGACY - Kept for compatibility)
     */
    ServerAutomationService.prototype.runPythonAutomation = function (request, proxy) {
        return __awaiter(this, void 0, void 0, function () {
            var applicationId, companyAutomation, logContext;
            var _this = this;
            return __generator(this, function (_a) {
                applicationId = request.applicationId, companyAutomation = request.companyAutomation;
                logContext = {
                    correlationId: "legacy_".concat(applicationId),
                    applicationId: applicationId,
                    companyAutomation: companyAutomation,
                    userId: request.userId,
                    jobId: request.jobId,
                    serverId: this.serverId
                };
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var env, scriptPath, _a, pythonProcess_1, stdout_1, stderr_1, startTime_1, error_3;
                        var _this = this;
                        var _b, _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    _d.trys.push([0, 6, , 7]);
                                    return [4 /*yield*/, this.createExecutionEnvironment(request, proxy)];
                                case 1:
                                    env = _d.sent();
                                    scriptPath = path_1.default.join(this.config.companiesPath, companyAutomation, 'run_automation.py');
                                    _d.label = 2;
                                case 2:
                                    _d.trys.push([2, 4, , 5]);
                                    return [4 /*yield*/, promises_1.default.access(scriptPath)];
                                case 3:
                                    _d.sent();
                                    return [3 /*break*/, 5];
                                case 4:
                                    _a = _d.sent();
                                    throw new Error("Automation script not found: ".concat(scriptPath));
                                case 5:
                                    pythonProcess_1 = (0, child_process_1.spawn)(this.config.pythonPath, [scriptPath], {
                                        env: env,
                                        cwd: path_1.default.join(this.config.companiesPath, companyAutomation),
                                        stdio: ['pipe', 'pipe', 'pipe']
                                    });
                                    this.activeProcesses.set(applicationId, pythonProcess_1);
                                    stdout_1 = '';
                                    stderr_1 = '';
                                    startTime_1 = Date.now();
                                    // Collect stdout
                                    (_b = pythonProcess_1.stdout) === null || _b === void 0 ? void 0 : _b.on('data', function (data) {
                                        var output = data.toString();
                                        stdout_1 += output;
                                        _this.fastify.log.debug(__assign(__assign({}, logContext), { event: 'python_process_stdout', message: 'Python process output', output: output.trim() }));
                                        _this.emit('process-output', {
                                            applicationId: applicationId,
                                            type: 'stdout',
                                            data: output,
                                            correlationId: logContext.correlationId
                                        });
                                    });
                                    // Collect stderr
                                    (_c = pythonProcess_1.stderr) === null || _c === void 0 ? void 0 : _c.on('data', function (data) {
                                        var output = data.toString();
                                        stderr_1 += output;
                                        _this.fastify.log.debug(__assign(__assign({}, logContext), { event: 'python_process_stderr', message: 'Python process error output', output: output.trim() }));
                                        _this.emit('process-output', {
                                            applicationId: applicationId,
                                            type: 'stderr',
                                            data: output,
                                            correlationId: logContext.correlationId
                                        });
                                    });
                                    // Handle process completion
                                    pythonProcess_1.on('close', function (code) {
                                        _this.activeProcesses.delete(applicationId);
                                        var executionTime = Date.now() - startTime_1;
                                        if (code === 0) {
                                            try {
                                                var result = _this.parseAutomationResult(stdout_1, request, executionTime);
                                                resolve(result);
                                            }
                                            catch (parseError) {
                                                reject(new Error("Failed to parse automation result: ".concat(parseError)));
                                            }
                                        }
                                        else {
                                            reject(new Error("Python process failed with code ".concat(code, ": ").concat(stderr_1)));
                                        }
                                    });
                                    // Handle process errors
                                    pythonProcess_1.on('error', function (error) {
                                        _this.activeProcesses.delete(applicationId);
                                        reject(new Error("Failed to start Python process: ".concat(error.message)));
                                    });
                                    // Set timeout
                                    setTimeout(function () {
                                        if (_this.activeProcesses.has(applicationId)) {
                                            pythonProcess_1.kill('SIGTERM');
                                            setTimeout(function () {
                                                if (_this.activeProcesses.has(applicationId)) {
                                                    pythonProcess_1.kill('SIGKILL');
                                                }
                                            }, 5000);
                                            reject(new Error("Automation timed out after ".concat(_this.config.timeout, "ms")));
                                        }
                                    }, this.config.timeout);
                                    return [3 /*break*/, 7];
                                case 6:
                                    error_3 = _d.sent();
                                    reject(error_3);
                                    return [3 /*break*/, 7];
                                case 7: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Create execution environment for Python script
     */
    ServerAutomationService.prototype.createExecutionEnvironment = function (request, proxy) {
        return __awaiter(this, void 0, void 0, function () {
            var env;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        env = __assign(__assign({}, process.env), { 
                            // Execution mode
                            EXECUTION_MODE: 'server', DATA_SOURCE: 'database', 
                            // Database connection
                            DATABASE_URL: process.env.DATABASE_URL, 
                            // User and job identifiers
                            USER_ID: request.userId, JOB_ID: request.jobId, APPLICATION_ID: request.applicationId, 
                            // AI API keys
                            ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY, OPENAI_API_KEY: process.env.OPENAI_API_KEY, GOOGLE_API_KEY: process.env.GOOGLE_API_KEY, 
                            // Automation configuration
                            AUTOMATION_HEADLESS: (((_a = request.options) === null || _a === void 0 ? void 0 : _a.headless) !== false).toString(), AUTOMATION_TIMEOUT: (((_b = request.options) === null || _b === void 0 ? void 0 : _b.timeout) || this.config.timeout).toString(), SCREENSHOT_ENABLED: this.config.screenshotEnabled.toString(), SCREENSHOT_PATH: this.config.screenshotPath, 
                            // Server identification
                            SERVER_ID: this.serverId, 
                            // Proxy configuration
                            PROXY_CONFIG: proxy ? JSON.stringify({
                                host: proxy.host,
                                port: proxy.port,
                                username: proxy.username,
                                password: proxy.password,
                                type: proxy.proxyType
                            }) : undefined });
                        if (!this.config.screenshotEnabled) return [3 /*break*/, 2];
                        return [4 /*yield*/, promises_1.default.mkdir(this.config.screenshotPath, { recursive: true })];
                    case 1:
                        _c.sent();
                        _c.label = 2;
                    case 2: return [2 /*return*/, env];
                }
            });
        });
    };
    /**
     * Parse automation result from Python output
     */
    ServerAutomationService.prototype.parseAutomationResult = function (stdout, request, executionTime) {
        try {
            // Look for JSON result in stdout
            var lines = stdout.trim().split('\n');
            var jsonLine = lines.find(function (line) {
                var trimmed = line.trim();
                return trimmed.startsWith('{') && trimmed.endsWith('}');
            });
            if (!jsonLine) {
                throw new Error('No JSON result found in Python output');
            }
            var pythonResult = JSON.parse(jsonLine);
            // Convert Python result to TypeScript format
            return {
                success: pythonResult.success || false,
                applicationId: request.applicationId,
                confirmationNumber: pythonResult.confirmation_number,
                executionTime: pythonResult.execution_time_ms || executionTime,
                companyAutomation: request.companyAutomation,
                status: pythonResult.success ? 'success' : 'failed',
                error: pythonResult.error_message,
                steps: (pythonResult.steps || []).map(function (step) { return ({
                    stepName: step.step_name || 'unknown',
                    action: step.action || '',
                    success: step.success || false,
                    timestamp: step.timestamp || new Date().toISOString(),
                    durationMs: step.duration_ms,
                    errorMessage: step.error_message
                }); }),
                screenshots: pythonResult.screenshots || [],
                captchaEvents: (pythonResult.captcha_events || []).map(function (event) { return ({
                    captchaType: event.captcha_type || 'unknown',
                    detectedAt: event.detected_at || new Date().toISOString(),
                    resolved: event.resolved || false,
                    resolutionMethod: event.resolution_method
                }); }),
                serverInfo: {
                    serverId: this.serverId,
                    executionMode: 'server',
                    pythonVersion: pythonResult.python_version,
                    processingTime: executionTime
                }
            };
        }
        catch (error) {
            throw new Error("Failed to parse Python result: ".concat(error));
        }
    };
    // =============================================================================
    // UTILITY METHODS
    // =============================================================================
    /**
     * Check if company automation is supported
     */
    ServerAutomationService.prototype.isCompanySupported = function (companyAutomation) {
        var supportedCompanies = ['greenhouse', 'linkedin'];
        return supportedCompanies.includes(companyAutomation);
    };
    /**
     * Get supported companies
     */
    ServerAutomationService.prototype.getSupportedCompanies = function () {
        return ['greenhouse', 'linkedin'];
    };
    /**
     * Detect company automation type from job URL
     */
    ServerAutomationService.prototype.detectCompanyType = function (applyUrl) {
        var url = applyUrl.toLowerCase();
        if (url.includes('greenhouse.io') || url.includes('grnh.se')) {
            return 'greenhouse';
        }
        if (url.includes('linkedin.com')) {
            return 'linkedin';
        }
        // Add more company detection logic as needed
        // For now, default to greenhouse as it's the most complete automation
        return 'greenhouse';
    };
    /**
     * Get current status
     */
    ServerAutomationService.prototype.getStatus = function () {
        var activeJobs = this.activeProcesses.size;
        var status = 'healthy';
        if (activeJobs >= this.config.maxConcurrentJobs) {
            status = 'overloaded';
        }
        else if (activeJobs > this.config.maxConcurrentJobs * 0.8) {
            status = 'busy';
        }
        return {
            serverId: this.serverId,
            activeJobs: activeJobs,
            maxConcurrentJobs: this.config.maxConcurrentJobs,
            status: status
        };
    };
    /**
     * Stop specific automation
     */
    ServerAutomationService.prototype.stopAutomation = function (applicationId) {
        return __awaiter(this, void 0, void 0, function () {
            var process;
            var _this = this;
            return __generator(this, function (_a) {
                process = this.activeProcesses.get(applicationId);
                if (!process) {
                    return [2 /*return*/, false];
                }
                process.kill('SIGTERM');
                setTimeout(function () {
                    if (_this.activeProcesses.has(applicationId)) {
                        process.kill('SIGKILL');
                    }
                }, 5000);
                this.activeProcesses.delete(applicationId);
                this.fastify.log.info("Stopped automation: ".concat(applicationId));
                return [2 /*return*/, true];
            });
        });
    };
    /**
     * Stop all active automations
     */
    ServerAutomationService.prototype.stopAllAutomations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var activeIds, stopPromises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        activeIds = Array.from(this.activeProcesses.keys());
                        this.fastify.log.info("Stopping ".concat(activeIds.length, " active automations"));
                        stopPromises = activeIds.map(function (id) { return _this.stopAutomation(id); });
                        return [4 /*yield*/, Promise.allSettled(stopPromises)];
                    case 1:
                        _a.sent();
                        this.fastify.log.info('All automations stopped');
                        return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // CLEANUP
    // =============================================================================
    /**
     * Setup cleanup handlers
     */
    ServerAutomationService.prototype.setupCleanup = function () {
        var _this = this;
        var cleanup = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.fastify.log.info('ServerAutomationService cleanup starting...');
                        return [4 /*yield*/, this.stopAllAutomations()];
                    case 1:
                        _a.sent();
                        this.fastify.log.info('ServerAutomationService cleanup completed');
                        return [2 /*return*/];
                }
            });
        }); };
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
        process.on('exit', cleanup);
    };
    /**
     * Manual cleanup
     */
    ServerAutomationService.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.stopAllAutomations()];
                    case 1:
                        _a.sent();
                        this.emit('cleanup-completed');
                        return [2 /*return*/];
                }
            });
        });
    };
    return ServerAutomationService;
}(events_1.EventEmitter));
exports.ServerAutomationService = ServerAutomationService;
