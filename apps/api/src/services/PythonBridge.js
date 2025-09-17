"use strict";
/**
 * @fileoverview Python-TypeScript Communication Bridge
 * @description Standardized interface for passing data to Python automation scripts
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
exports.PythonBridge = void 0;
var child_process_1 = require("child_process");
var path_1 = require("path");
var promises_1 = require("fs/promises");
var events_1 = require("events");
// =============================================================================
// PYTHON BRIDGE SERVICE
// =============================================================================
var PythonBridge = /** @class */ (function (_super) {
    __extends(PythonBridge, _super);
    function PythonBridge(fastify, config) {
        var _a;
        var _this = _super.call(this) || this;
        _this.fastify = fastify;
        _this.activeProcesses = new Map();
        _this.config = {
            pythonPath: (config === null || config === void 0 ? void 0 : config.pythonPath) || process.env.PYTHON_PATH || path_1.default.join(__dirname, '../../../desktop/venv/bin/python'),
            companiesPath: (config === null || config === void 0 ? void 0 : config.companiesPath) || process.env.PYTHON_COMPANIES_PATH || path_1.default.join(__dirname, '../../../desktop/companies'),
            timeout: (config === null || config === void 0 ? void 0 : config.timeout) || parseInt(process.env.PYTHON_TIMEOUT || '120000'), // 2 minutes
            screenshotEnabled: (_a = config === null || config === void 0 ? void 0 : config.screenshotEnabled) !== null && _a !== void 0 ? _a : (process.env.SCREENSHOT_ENABLED !== 'false'),
            screenshotPath: (config === null || config === void 0 ? void 0 : config.screenshotPath) || process.env.SCREENSHOT_PATH || '/tmp/jobswipe/screenshots',
            maxRetries: (config === null || config === void 0 ? void 0 : config.maxRetries) || parseInt(process.env.PYTHON_MAX_RETRIES || '3')
        };
        _this.fastify.log.info({
            event: 'python_bridge_initialized',
            message: 'Python Bridge initialized',
            config: {
                pythonPath: _this.config.pythonPath,
                companiesPath: _this.config.companiesPath,
                timeout: _this.config.timeout,
                screenshotEnabled: _this.config.screenshotEnabled
            }
        });
        return _this;
    }
    // =============================================================================
    // EXECUTION METHODS
    // =============================================================================
    /**
     * Execute Python automation script with standardized data passing
     */
    PythonBridge.prototype.executePythonAutomation = function (companyAutomation, request) {
        return __awaiter(this, void 0, void 0, function () {
            var logContext, scriptPath, env, dataFilePath, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logContext = {
                            correlationId: request.correlationId,
                            applicationId: request.applicationId,
                            userId: request.userId,
                            companyAutomation: companyAutomation,
                            jobTitle: request.jobData.title,
                            company: request.jobData.company
                        };
                        this.fastify.log.info(__assign(__assign({}, logContext), { event: 'python_execution_started', message: "Starting Python automation for ".concat(companyAutomation), scriptPath: this.getScriptPath(companyAutomation) }));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, this.validateScript(companyAutomation)];
                    case 2:
                        scriptPath = _a.sent();
                        env = this.createExecutionEnvironment(request);
                        return [4 /*yield*/, this.createDataFile(request)];
                    case 3:
                        dataFilePath = _a.sent();
                        return [4 /*yield*/, this.runPythonScript(scriptPath, env, dataFilePath, logContext)];
                    case 4:
                        result = _a.sent();
                        // Cleanup temporary file
                        return [4 /*yield*/, this.cleanupDataFile(dataFilePath)];
                    case 5:
                        // Cleanup temporary file
                        _a.sent();
                        this.fastify.log.info(__assign(__assign({}, logContext), { event: 'python_execution_completed', message: 'Python automation completed successfully', success: result.success, executionTimeMs: result.executionTimeMs, stepsCompleted: result.steps.length }));
                        return [2 /*return*/, result];
                    case 6:
                        error_1 = _a.sent();
                        this.fastify.log.error(__assign(__assign({}, logContext), { event: 'python_execution_failed', message: 'Python automation failed', error: error_1 instanceof Error ? error_1.message : String(error_1), errorStack: error_1 instanceof Error ? error_1.stack : undefined }));
                        // Return failure result
                        return [2 /*return*/, {
                                success: false,
                                applicationId: request.applicationId,
                                correlationId: request.correlationId,
                                executionTimeMs: 0,
                                error: error_1 instanceof Error ? error_1.message : 'Unknown error',
                                steps: [],
                                screenshots: [],
                                captchaEvents: [],
                                metadata: {
                                    serverInfo: { errorType: 'execution_failed' }
                                }
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate that the automation script exists and Python environment is available
     */
    PythonBridge.prototype.validateScript = function (companyAutomation) {
        return __awaiter(this, void 0, void 0, function () {
            var scriptPath, error_2, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        scriptPath = this.getScriptPath(companyAutomation);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, promises_1.default.access(this.config.pythonPath)];
                    case 2:
                        _a.sent();
                        this.fastify.log.debug({
                            event: 'python_executable_validated',
                            message: 'Python executable found',
                            pythonPath: this.config.pythonPath
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        throw new Error("Python executable not found: ".concat(this.config.pythonPath, ". Make sure virtual environment is set up."));
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, promises_1.default.access(scriptPath)];
                    case 5:
                        _a.sent();
                        this.fastify.log.debug({
                            event: 'python_script_validated',
                            message: 'Python script found and validated',
                            scriptPath: scriptPath,
                            companyAutomation: companyAutomation
                        });
                        return [2 /*return*/, scriptPath];
                    case 6:
                        error_3 = _a.sent();
                        throw new Error("Automation script not found: ".concat(scriptPath));
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get the path to the automation script
     */
    PythonBridge.prototype.getScriptPath = function (companyAutomation) {
        return path_1.default.join(this.config.companiesPath, companyAutomation, 'run_automation.py');
    };
    /**
     * Create execution environment with all necessary variables
     */
    PythonBridge.prototype.createExecutionEnvironment = function (request) {
        var _a;
        return __assign(__assign(__assign(__assign({}, process.env), { 
            // Request identifiers
            CORRELATION_ID: request.correlationId, APPLICATION_ID: request.applicationId, USER_ID: request.userId, JOB_ID: request.jobData.id, 
            // Execution mode
            EXECUTION_MODE: 'server', DATA_SOURCE: 'bridge', 
            // API keys
            ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY, OPENAI_API_KEY: process.env.OPENAI_API_KEY, GOOGLE_API_KEY: process.env.GOOGLE_API_KEY, 
            // Automation configuration
            AUTOMATION_HEADLESS: (request.automationConfig.headless !== false).toString(), AUTOMATION_TIMEOUT: (request.automationConfig.timeout || this.config.timeout).toString(), AUTOMATION_MAX_RETRIES: (request.automationConfig.maxRetries || this.config.maxRetries).toString(), SCREENSHOT_ENABLED: this.config.screenshotEnabled.toString(), SCREENSHOT_PATH: request.automationConfig.screenshotPath || this.config.screenshotPath }), (request.proxyConfig && {
            PROXY_HOST: request.proxyConfig.host,
            PROXY_PORT: request.proxyConfig.port.toString(),
            PROXY_USERNAME: request.proxyConfig.username || '',
            PROXY_PASSWORD: request.proxyConfig.password || '',
            PROXY_TYPE: request.proxyConfig.type
        })), { 
            // Basic user data (for simple access)
            USER_FIRST_NAME: request.userProfile.firstName, USER_LAST_NAME: request.userProfile.lastName, USER_EMAIL: request.userProfile.email, USER_PHONE: request.userProfile.phone, USER_CURRENT_TITLE: request.userProfile.currentTitle || '', USER_YEARS_EXPERIENCE: ((_a = request.userProfile.yearsExperience) === null || _a === void 0 ? void 0 : _a.toString()) || '0', USER_CURRENT_LOCATION: request.userProfile.currentLocation || '', USER_WORK_AUTHORIZATION: request.userProfile.workAuthorization || '', USER_LINKEDIN_URL: request.userProfile.linkedinUrl || '', 
            // Job data
            JOB_TITLE: request.jobData.title, JOB_COMPANY: request.jobData.company, JOB_APPLY_URL: request.jobData.applyUrl, JOB_LOCATION: request.jobData.location || '', JOB_DESCRIPTION: request.jobData.description || '', 
            // Resume handling
            USER_RESUME_URL: request.userProfile.resumeUrl || '', USER_RESUME_LOCAL_PATH: request.userProfile.resumeLocalPath || '', 
            // Cover letter and custom fields
            USER_COVER_LETTER: request.userProfile.coverLetter || '', USER_SKILLS: JSON.stringify(request.userProfile.skills || []), USER_CUSTOM_FIELDS: JSON.stringify(request.userProfile.customFields || {}) });
    };
    /**
     * Ensure requirements field is always an array for Python validation
     */
    PythonBridge.prototype.ensureRequirementsArray = function (requirements) {
        if (!requirements) {
            return ['General requirements'];
        }
        if (Array.isArray(requirements)) {
            return requirements.filter(function (req) { return req && typeof req === 'string'; });
        }
        if (typeof requirements === 'string') {
            // Split by common delimiters or return as single item array
            var trimmed = requirements.trim();
            if (trimmed.includes('\n')) {
                return trimmed.split('\n').map(function (req) { return req.trim(); }).filter(function (req) { return req; });
            }
            else if (trimmed.includes(',')) {
                return trimmed.split(',').map(function (req) { return req.trim(); }).filter(function (req) { return req; });
            }
            else {
                return [trimmed];
            }
        }
        // Fallback for unexpected types
        return ['General requirements'];
    };
    /**
     * Create temporary data file for complex data structures
     */
    PythonBridge.prototype.createDataFile = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var dataFileName, dataFilePath, dataPayload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dataFileName = "job_data_".concat(request.applicationId, "_").concat(Date.now(), ".json");
                        dataFilePath = path_1.default.join('/tmp', dataFileName);
                        dataPayload = {
                            user_profile: {
                                first_name: request.userProfile.firstName || 'Unknown',
                                last_name: request.userProfile.lastName || 'User',
                                email: request.userProfile.email,
                                phone: request.userProfile.phone || '000-000-0000',
                                resume_url: request.userProfile.resumeUrl,
                                resume_local_path: request.userProfile.resumeLocalPath,
                                current_title: request.userProfile.currentTitle || 'Professional',
                                years_experience: request.userProfile.yearsExperience || 2,
                                skills: request.userProfile.skills || ['General Skills'],
                                linkedin_url: request.userProfile.linkedinUrl,
                                current_location: request.userProfile.currentLocation || 'Remote',
                                work_authorization: request.userProfile.workAuthorization || 'citizen',
                                cover_letter: request.userProfile.coverLetter,
                                custom_fields: request.userProfile.customFields || {}
                            },
                            job_data: {
                                job_id: request.jobData.id,
                                title: request.jobData.title,
                                company: request.jobData.company,
                                apply_url: request.jobData.applyUrl,
                                location: request.jobData.location,
                                description: request.jobData.description,
                                requirements: this.ensureRequirementsArray(request.jobData.requirements)
                            },
                            automation_config: request.automationConfig,
                            proxy_config: request.proxyConfig,
                            metadata: {
                                correlationId: request.correlationId,
                                applicationId: request.applicationId,
                                userId: request.userId,
                                timestamp: new Date().toISOString()
                            }
                        };
                        return [4 /*yield*/, promises_1.default.writeFile(dataFilePath, JSON.stringify(dataPayload, null, 2), 'utf8')];
                    case 1:
                        _a.sent();
                        this.fastify.log.debug({
                            correlationId: request.correlationId,
                            event: 'data_file_created',
                            message: 'Temporary data file created for Python script',
                            dataFilePath: dataFilePath,
                            dataSize: JSON.stringify(dataPayload).length
                        });
                        return [2 /*return*/, dataFilePath];
                }
            });
        });
    };
    /**
     * Execute the Python script and parse results
     */
    PythonBridge.prototype.runPythonScript = function (scriptPath, env, dataFilePath, logContext) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var _a, _b;
                        var startTime = Date.now();
                        // Add data file path to environment
                        var scriptEnv = __assign(__assign({}, env), { JOB_DATA_FILE: dataFilePath });
                        // Debug log the execution environment
                        _this.fastify.log.info(__assign(__assign({}, logContext), { event: 'python_execution_debug', message: 'Python execution environment', pythonPath: _this.config.pythonPath, scriptPath: scriptPath, workingDirectory: path_1.default.dirname(scriptPath), dataSource: env.DATA_SOURCE, dataFilePath: scriptEnv.JOB_DATA_FILE }));
                        // Spawn Python process
                        var pythonProcess = (0, child_process_1.spawn)(_this.config.pythonPath, [scriptPath], {
                            env: scriptEnv,
                            cwd: path_1.default.dirname(scriptPath),
                            stdio: ['pipe', 'pipe', 'pipe']
                        });
                        _this.activeProcesses.set(logContext.applicationId, pythonProcess);
                        var stdout = '';
                        var stderr = '';
                        // Collect stdout
                        (_a = pythonProcess.stdout) === null || _a === void 0 ? void 0 : _a.on('data', function (data) {
                            var output = data.toString();
                            stdout += output;
                            _this.fastify.log.debug(__assign(__assign({}, logContext), { event: 'python_stdout', message: 'Python script output', output: output.trim() }));
                        });
                        // Collect stderr
                        (_b = pythonProcess.stderr) === null || _b === void 0 ? void 0 : _b.on('data', function (data) {
                            var output = data.toString();
                            stderr += output;
                            _this.fastify.log.debug(__assign(__assign({}, logContext), { event: 'python_stderr', message: 'Python script error output', output: output.trim() }));
                        });
                        // Handle process completion
                        pythonProcess.on('close', function (code) {
                            _this.activeProcesses.delete(logContext.applicationId);
                            var executionTime = Date.now() - startTime;
                            // Try to parse result regardless of exit code, as some Python scripts
                            // return non-zero exit codes but still produce valid JSON output
                            try {
                                var result = _this.parseExecutionResult(stdout, logContext, executionTime);
                                if (code !== 0) {
                                    // Mark as failed but still return the parsed result for debugging
                                    result.success = false;
                                    result.error = result.error || "Python process exited with code ".concat(code, ": ").concat(stderr);
                                    _this.fastify.log.warn(__assign(__assign({}, logContext), { event: 'python_non_zero_exit', message: 'Python script returned non-zero exit code but produced valid output', exitCode: code, stderr: stderr.trim(), parsedSuccess: result.success }));
                                }
                                resolve(result);
                            }
                            catch (parseError) {
                                // If parsing fails and exit code is non-zero, this is a complete failure
                                var errorMessage = code === 0
                                    ? "Failed to parse Python output: ".concat(parseError)
                                    : "Python process failed with code ".concat(code, ". Stderr: ").concat(stderr, ". Parse error: ").concat(parseError);
                                _this.fastify.log.error(__assign(__assign({}, logContext), { event: 'python_complete_failure', message: 'Python execution failed completely', exitCode: code, parseError: parseError.message, stderr: stderr.trim(), stdout: stdout.slice(0, 500) // Log first 500 chars for debugging
                                 }));
                                reject(new Error(errorMessage));
                            }
                        });
                        // Handle process errors
                        pythonProcess.on('error', function (error) {
                            _this.activeProcesses.delete(logContext.applicationId);
                            reject(new Error("Failed to start Python process: ".concat(error.message)));
                        });
                        // Set timeout
                        setTimeout(function () {
                            if (_this.activeProcesses.has(logContext.applicationId)) {
                                pythonProcess.kill('SIGTERM');
                                setTimeout(function () {
                                    if (_this.activeProcesses.has(logContext.applicationId)) {
                                        pythonProcess.kill('SIGKILL');
                                    }
                                }, 5000);
                                reject(new Error("Python execution timed out after ".concat(_this.config.timeout, "ms")));
                            }
                        }, _this.config.timeout);
                    })];
            });
        });
    };
    /**
     * Parse Python execution result from stdout
     */
    PythonBridge.prototype.parseExecutionResult = function (stdout, logContext, executionTime) {
        try {
            // Look for JSON result in stdout
            var lines = stdout.trim().split('\n');
            var jsonLine = lines.find(function (line) {
                var trimmed = line.trim();
                return trimmed.startsWith('{') && trimmed.includes('"success"');
            });
            if (!jsonLine) {
                throw new Error('No valid JSON result found in Python output');
            }
            var pythonResult = JSON.parse(jsonLine);
            // Convert Python result to standardized TypeScript format
            return {
                success: pythonResult.success || false,
                applicationId: logContext.applicationId,
                correlationId: logContext.correlationId,
                executionTimeMs: pythonResult.execution_time_ms || executionTime,
                confirmationNumber: pythonResult.confirmation_number,
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
                metadata: {
                    pythonVersion: pythonResult.python_version,
                    aiModel: pythonResult.ai_model_used,
                    browserVersion: pythonResult.browser_version,
                    proxyUsed: pythonResult.proxy_used,
                    serverInfo: pythonResult.server_info || {}
                }
            };
        }
        catch (error) {
            throw new Error("Failed to parse Python result: ".concat(error));
        }
    };
    /**
     * Cleanup temporary data file
     */
    PythonBridge.prototype.cleanupDataFile = function (dataFilePath) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, promises_1.default.unlink(dataFilePath)];
                    case 1:
                        _a.sent();
                        this.fastify.log.debug({
                            event: 'data_file_cleaned',
                            message: 'Temporary data file cleaned up',
                            dataFilePath: dataFilePath
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        this.fastify.log.warn({
                            event: 'data_file_cleanup_failed',
                            message: 'Failed to cleanup temporary data file',
                            dataFilePath: dataFilePath,
                            error: error_4 instanceof Error ? error_4.message : String(error_4)
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Stop specific Python process
     */
    PythonBridge.prototype.stopExecution = function (applicationId) {
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
                this.fastify.log.info({
                    event: 'python_execution_stopped',
                    message: 'Python execution stopped',
                    applicationId: applicationId
                });
                return [2 /*return*/, true];
            });
        });
    };
    /**
     * Get current status
     */
    PythonBridge.prototype.getStatus = function () {
        return {
            activeProcesses: this.activeProcesses.size,
            config: __assign({}, this.config)
        };
    };
    /**
     * Cleanup all active processes
     */
    PythonBridge.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var activeIds, stopPromises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        activeIds = Array.from(this.activeProcesses.keys());
                        this.fastify.log.info({
                            event: 'python_bridge_cleanup',
                            message: "Cleaning up ".concat(activeIds.length, " active Python processes")
                        });
                        stopPromises = activeIds.map(function (id) { return _this.stopExecution(id); });
                        return [4 /*yield*/, Promise.allSettled(stopPromises)];
                    case 1:
                        _a.sent();
                        this.emit('cleanup-completed');
                        return [2 /*return*/];
                }
            });
        });
    };
    return PythonBridge;
}(events_1.EventEmitter));
exports.PythonBridge = PythonBridge;
