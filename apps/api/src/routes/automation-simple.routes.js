"use strict";
/**
 * Simple Automation Routes for Testing
 * Minimal implementation to test automation trigger functionality
 */
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
exports.automationRoutes = automationRoutes;
function automationRoutes(fastify) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            /**
             * Trigger automation from Next.js swipe-right action
             */
            fastify.post('/automation/trigger', {
                schema: {
                    description: 'Trigger job application automation from web interface',
                    tags: ['automation'],
                    body: {
                        type: 'object',
                        required: ['applicationId', 'userId', 'jobData', 'userProfile', 'executionMode'],
                        properties: {
                            applicationId: { type: 'string' },
                            userId: { type: 'string' },
                            jobId: { type: 'string' },
                            jobData: {
                                type: 'object',
                                required: ['id', 'title', 'company', 'applyUrl'],
                                properties: {
                                    id: { type: 'string' },
                                    title: { type: 'string' },
                                    company: { type: 'string' },
                                    applyUrl: { type: 'string', format: 'uri' }
                                }
                            },
                            userProfile: {
                                type: 'object',
                                required: ['firstName', 'lastName', 'email'],
                                properties: {
                                    id: { type: 'string' },
                                    firstName: { type: 'string' },
                                    lastName: { type: 'string' },
                                    email: { type: 'string', format: 'email' },
                                    phone: { type: 'string' }
                                }
                            },
                            executionMode: { type: 'string', enum: ['server', 'desktop'] },
                            priority: { type: 'number' }
                        }
                    }
                },
                handler: function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                    var _a, applicationId, userId, jobId, jobData, userProfile, executionMode, priority, automationData, result, error_1, errorCode, statusCode;
                    var _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                _d.trys.push([0, 2, , 3]);
                                _a = request.body, applicationId = _a.applicationId, userId = _a.userId, jobId = _a.jobId, jobData = _a.jobData, userProfile = _a.userProfile, executionMode = _a.executionMode, priority = _a.priority;
                                fastify.log.info('🤖 Automation trigger received:', {
                                    applicationId: applicationId,
                                    userId: userId,
                                    jobId: jobId,
                                    jobTitle: jobData.title,
                                    company: jobData.company,
                                    executionMode: executionMode
                                });
                                automationData = {
                                    userId: userId,
                                    jobData: {
                                        job_id: jobData.id,
                                        title: jobData.title,
                                        company: jobData.company,
                                        apply_url: jobData.applyUrl,
                                        location: jobData.location,
                                        description: jobData.description
                                    },
                                    userProfile: {
                                        first_name: userProfile.firstName,
                                        last_name: userProfile.lastName,
                                        email: userProfile.email,
                                        phone: userProfile.phone || '',
                                        resume_url: userProfile.resumeUrl,
                                        current_title: userProfile.currentTitle,
                                        years_experience: userProfile.yearsExperience,
                                        skills: userProfile.skills || [],
                                        current_location: userProfile.location,
                                        work_authorization: userProfile.workAuthorization,
                                        linkedin_url: userProfile.linkedinUrl
                                    },
                                    options: {
                                        execution_mode: executionMode,
                                        priority: priority || 5,
                                        application_id: applicationId
                                    }
                                };
                                // Check if AutomationService is available
                                if (!fastify.automationService) {
                                    fastify.log.error('❌ AutomationService not available');
                                    return [2 /*return*/, reply.code(503).send({
                                            success: false,
                                            error: 'Automation service not available',
                                            details: { serviceStatus: 'unavailable' }
                                        })];
                                }
                                // Check if ServerAutomationService is available for server execution
                                if (executionMode === 'server' && !fastify.serverAutomationService) {
                                    fastify.log.warn('⚠️ ServerAutomationService not available, queuing for desktop');
                                    automationData.options.execution_mode = 'desktop';
                                }
                                return [4 /*yield*/, fastify.automationService.queueApplication(automationData)];
                            case 1:
                                result = _d.sent();
                                fastify.log.info('✅ Automation queued successfully:', {
                                    automationId: result.id,
                                    status: result.status,
                                    executionMode: automationData.options.execution_mode
                                });
                                // Emit WebSocket event for real-time updates
                                if (fastify.websocket) {
                                    fastify.websocket.emit('automation-queued', {
                                        userId: userId,
                                        applicationId: applicationId,
                                        automationId: result.id,
                                        status: 'queued',
                                        executionMode: automationData.options.execution_mode,
                                        jobTitle: jobData.title,
                                        company: jobData.company,
                                        timestamp: new Date().toISOString()
                                    });
                                }
                                reply.send({
                                    success: true,
                                    automationId: result.id,
                                    status: result.status,
                                    executionMode: automationData.options.execution_mode,
                                    message: "Automation queued for ".concat(executionMode, " execution")
                                });
                                return [3 /*break*/, 3];
                            case 2:
                                error_1 = _d.sent();
                                fastify.log.error('❌ Automation trigger failed:', error_1);
                                errorCode = 'AUTOMATION_ERROR';
                                statusCode = 500;
                                if ((_b = error_1.message) === null || _b === void 0 ? void 0 : _b.includes('not available')) {
                                    errorCode = 'SERVICE_UNAVAILABLE';
                                    statusCode = 503;
                                }
                                reply.code(statusCode).send({
                                    success: false,
                                    error: error_1 instanceof Error ? error_1.message : 'Failed to trigger automation',
                                    details: {
                                        errorCode: errorCode,
                                        applicationId: (_c = request.body) === null || _c === void 0 ? void 0 : _c.applicationId,
                                        timestamp: new Date().toISOString()
                                    }
                                });
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); }
            });
            /**
             * Get automation health
             */
            fastify.get('/automation/health', {
                handler: function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        reply.send({
                            success: true,
                            status: 'healthy',
                            servicesAvailable: {
                                automationService: !!fastify.automationService,
                                serverAutomationService: !!fastify.serverAutomationService,
                                websocket: !!fastify.websocket
                            }
                        });
                        return [2 /*return*/];
                    });
                }); }
            });
            return [2 /*return*/];
        });
    });
}
