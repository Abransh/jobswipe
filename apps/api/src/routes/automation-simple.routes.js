"use strict";
/**
 * @fileoverview Simplified Automation Routes for JobSwipe API
 * @description Essential automation endpoints with proper error handling
 * @version 1.0.0
 * @author JobSwipe Team
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
var zod_1 = require("zod");
// =============================================================================
// SCHEMAS & VALIDATION
// =============================================================================
var TriggerAutomationSchema = zod_1.z.object({
    applicationId: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    jobId: zod_1.z.string().uuid(),
    jobData: zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string(),
        company: zod_1.z.string(),
        applyUrl: zod_1.z.string().url(),
        location: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
    }),
    userProfile: zod_1.z.object({
        firstName: zod_1.z.string(),
        lastName: zod_1.z.string(),
        email: zod_1.z.string().email(),
        phone: zod_1.z.string().optional(),
        resume: zod_1.z.object({
            url: zod_1.z.string().url(),
            content: zod_1.z.string().optional(),
        }).optional(),
    }),
    executionMode: zod_1.z.enum(['server', 'desktop']).default('server'),
    priority: zod_1.z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'IMMEDIATE']).default('NORMAL'),
});
var AutomationStatusSchema = zod_1.z.object({
    applicationId: zod_1.z.string().uuid(),
    status: zod_1.z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED']),
    progress: zod_1.z.number().min(0).max(100).optional(),
    message: zod_1.z.string().optional(),
    executionMode: zod_1.z.enum(['server', 'desktop']).optional(),
});
// =============================================================================
// ROUTE HANDLERS
// =============================================================================
/**
 * Trigger job application automation
 */
function triggerAutomation(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, applicationId, userId, jobId, jobData, userProfile, executionMode, priority, automationData, result, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    _a = request.body, applicationId = _a.applicationId, userId = _a.userId, jobId = _a.jobId, jobData = _a.jobData, userProfile = _a.userProfile, executionMode = _a.executionMode, priority = _a.priority;
                    request.log.info('🤖 Automation trigger received:', {
                        applicationId: applicationId,
                        userId: userId,
                        jobId: jobId,
                        jobTitle: jobData.title,
                        company: jobData.company,
                        executionMode: executionMode
                    });
                    // Check if automation service is available
                    if (!request.server.automationService) {
                        request.log.error('❌ Automation service not available');
                        return [2 /*return*/, reply.code(503).send({
                                success: false,
                                error: 'Automation service not available',
                                details: { serviceStatus: 'unavailable' }
                            })];
                    }
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
                            firstName: userProfile.firstName,
                            lastName: userProfile.lastName,
                            email: userProfile.email,
                            phone: userProfile.phone,
                            resume: userProfile.resume
                        },
                        options: {
                            execution_mode: executionMode,
                            priority: priority.toLowerCase(),
                            application_id: applicationId
                        }
                    };
                    return [4 /*yield*/, request.server.automationService.executeJobApplication(automationData.jobData, automationData.userProfile, automationData.options)];
                case 1:
                    result = _b.sent();
                    request.log.info('✅ Automation executed successfully:', {
                        applicationId: applicationId,
                        status: result.status,
                        executionMode: result.executionMode
                    });
                    return [2 /*return*/, reply.send({
                            success: true,
                            data: {
                                applicationId: applicationId,
                                status: result.status,
                                executionMode: result.executionMode,
                                message: result.message,
                                progress: result.progress || 0
                            }
                        })];
                case 2:
                    error_1 = _b.sent();
                    request.log.error('❌ Automation execution failed:', error_1);
                    return [2 /*return*/, reply.code(500).send({
                            success: false,
                            error: 'Automation execution failed',
                            details: {
                                message: error_1 instanceof Error ? error_1.message : 'Unknown error'
                            }
                        })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get automation status
 */
function getAutomationStatus(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var applicationId, job, status_1, error_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    applicationId = request.params.applicationId;
                    // Check if application queue service is available
                    if (!request.server.applicationQueue) {
                        return [2 /*return*/, reply.code(503).send({
                                success: false,
                                error: 'Queue service not available'
                            })];
                    }
                    return [4 /*yield*/, request.server.applicationQueue.getJob(applicationId)];
                case 1:
                    job = _c.sent();
                    if (!job) {
                        return [2 /*return*/, reply.code(404).send({
                                success: false,
                                error: 'Application not found',
                                details: { applicationId: applicationId }
                            })];
                    }
                    status_1 = {
                        applicationId: applicationId,
                        status: job.finishedOn ? 'COMPLETED' : job.failedReason ? 'FAILED' : job.processedOn ? 'RUNNING' : 'PENDING',
                        progress: job.progress || 0,
                        executionMode: ((_b = (_a = job.data) === null || _a === void 0 ? void 0 : _a.options) === null || _b === void 0 ? void 0 : _b.execution_mode) || 'server',
                        message: job.failedReason || 'Processing...',
                        createdAt: new Date(job.timestamp),
                        updatedAt: new Date(job.processedOn || job.timestamp)
                    };
                    return [2 /*return*/, reply.send({
                            success: true,
                            data: status_1
                        })];
                case 2:
                    error_2 = _c.sent();
                    request.log.error('❌ Failed to get automation status:', error_2);
                    return [2 /*return*/, reply.code(500).send({
                            success: false,
                            error: 'Failed to get automation status',
                            details: {
                                message: error_2 instanceof Error ? error_2.message : 'Unknown error'
                            }
                        })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Cancel automation
 */
function cancelAutomation(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var applicationId, job, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    applicationId = request.params.applicationId;
                    // Check if application queue service is available
                    if (!request.server.applicationQueue) {
                        return [2 /*return*/, reply.code(503).send({
                                success: false,
                                error: 'Queue service not available'
                            })];
                    }
                    return [4 /*yield*/, request.server.applicationQueue.getJob(applicationId)];
                case 1:
                    job = _a.sent();
                    if (!job) {
                        return [2 /*return*/, reply.code(404).send({
                                success: false,
                                error: 'Application not found',
                                details: { applicationId: applicationId }
                            })];
                    }
                    // Cancel the job
                    return [4 /*yield*/, job.remove()];
                case 2:
                    // Cancel the job
                    _a.sent();
                    request.log.info('🚫 Automation cancelled:', { applicationId: applicationId });
                    return [2 /*return*/, reply.send({
                            success: true,
                            data: {
                                applicationId: applicationId,
                                status: 'CANCELLED',
                                message: 'Automation cancelled successfully'
                            }
                        })];
                case 3:
                    error_3 = _a.sent();
                    request.log.error('❌ Failed to cancel automation:', error_3);
                    return [2 /*return*/, reply.code(500).send({
                            success: false,
                            error: 'Failed to cancel automation',
                            details: {
                                message: error_3 instanceof Error ? error_3.message : 'Unknown error'
                            }
                        })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// =============================================================================
// ROUTES REGISTRATION
// =============================================================================
function automationRoutes(fastify) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Trigger automation
            fastify.post('/automation/trigger', {
                schema: {
                    description: 'Trigger job application automation',
                    tags: ['Automation'],
                    body: {
                        type: 'object',
                        required: ['applicationId', 'userId', 'jobId', 'jobData', 'userProfile'],
                        properties: {
                            applicationId: { type: 'string', format: 'uuid' },
                            userId: { type: 'string', format: 'uuid' },
                            jobId: { type: 'string', format: 'uuid' },
                            jobData: {
                                type: 'object',
                                required: ['id', 'title', 'company', 'applyUrl'],
                                properties: {
                                    id: { type: 'string' },
                                    title: { type: 'string' },
                                    company: { type: 'string' },
                                    applyUrl: { type: 'string', format: 'uri' },
                                    location: { type: 'string' },
                                    description: { type: 'string' }
                                }
                            },
                            userProfile: {
                                type: 'object',
                                required: ['firstName', 'lastName', 'email'],
                                properties: {
                                    firstName: { type: 'string' },
                                    lastName: { type: 'string' },
                                    email: { type: 'string', format: 'email' },
                                    phone: { type: 'string' },
                                    resume: {
                                        type: 'object',
                                        required: ['url'],
                                        properties: {
                                            url: { type: 'string', format: 'uri' },
                                            content: { type: 'string' }
                                        }
                                    }
                                }
                            },
                            executionMode: { type: 'string' },
                            priority: { type: 'integer', minimum: 1, maximum: 10 }
                        }
                    },
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                data: {
                                    type: 'object',
                                    properties: {
                                        applicationId: { type: 'string' },
                                        status: { type: 'string' },
                                        executionMode: { type: 'string' },
                                        message: { type: 'string' },
                                        progress: { type: 'number' }
                                    }
                                }
                            }
                        }
                    }
                }
            }, triggerAutomation);
            // Get automation status
            fastify.get('/automation/status/:applicationId', {
                schema: {
                    description: 'Get automation status',
                    tags: ['Automation'],
                    params: {
                        type: 'object',
                        properties: {
                            applicationId: { type: 'string', format: 'uuid' }
                        },
                        required: ['applicationId']
                    },
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                data: {
                                    type: 'object',
                                    required: ['applicationId', 'status'],
                                    properties: {
                                        applicationId: { type: 'string', format: 'uuid' },
                                        status: { type: 'string', enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'] },
                                        progress: { type: 'number', minimum: 0, maximum: 100 },
                                        message: { type: 'string' },
                                        executionMode: { type: 'string', enum: ['server', 'desktop'] }
                                    }
                                }
                            }
                        }
                    }
                }
            }, getAutomationStatus);
            // Cancel automation
            fastify.delete('/automation/:applicationId', {
                schema: {
                    description: 'Cancel automation',
                    tags: ['Automation'],
                    params: {
                        type: 'object',
                        properties: {
                            applicationId: { type: 'string', format: 'uuid' }
                        },
                        required: ['applicationId']
                    },
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                data: {
                                    type: 'object',
                                    properties: {
                                        applicationId: { type: 'string' },
                                        status: { type: 'string' },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                }
            }, cancelAutomation);
            fastify.log.info('✅ Automation routes registered');
            return [2 /*return*/];
        });
    });
}
exports.default = automationRoutes;
