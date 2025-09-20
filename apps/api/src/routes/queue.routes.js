"use strict";
/**
 * @fileoverview Queue Management API Routes for JobSwipe
 * @description Enterprise-grade job application queue endpoints with authentication
 * @version 1.0.0
 * @author JobSwipe Team
 */
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
exports.registerQueueRoutes = registerQueueRoutes;
var zod_1 = require("zod");
var crypto_1 = require("crypto");
var database_1 = require("@jobswipe/database");
// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
/**
 * Detect company automation type based on URL patterns
 */
function detectCompanyAutomation(url) {
    var urlLower = url.toLowerCase();
    // Common job site patterns
    var patterns = {
        'linkedin': ['linkedin.com/jobs', 'linkedin.com/in/'],
        'indeed': ['indeed.com'],
        'glassdoor': ['glassdoor.com'],
        'monster': ['monster.com'],
        'ziprecruiter': ['ziprecruiter.com'],
        'dice': ['dice.com'],
        'stackoverflow': ['stackoverflow.com/jobs'],
        'angellist': ['angel.co', 'wellfound.com'],
        'greenhouse': ['greenhouse.io'],
        'lever': ['lever.co'],
        'workday': ['myworkdayjobs.com', 'workday.com'],
        'bamboohr': ['bamboohr.com'],
        'jobvite': ['jobvite.com'],
        'smartrecruiters': ['smartrecruiters.com']
    };
    for (var _i = 0, _a = Object.entries(patterns); _i < _a.length; _i++) {
        var _b = _a[_i], company = _b[0], urls = _b[1];
        if (urls.some(function (pattern) { return urlLower.includes(pattern); })) {
            return company;
        }
    }
    return 'generic';
}
// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================
var JobApplicationRequestSchema = zod_1.z.object({
    jobId: zod_1.z.string().uuid('Invalid job ID format'),
    resumeId: zod_1.z.string().uuid('Invalid resume ID format').optional(),
    coverLetter: zod_1.z.string().max(2000, 'Cover letter too long').optional(),
    priority: zod_1.z.number().int().min(1).max(10).default(5),
    customFields: zod_1.z.record(zod_1.z.string()).optional(),
    metadata: zod_1.z.object({
        source: zod_1.z.enum(['web', 'mobile', 'desktop']),
        deviceId: zod_1.z.string().optional(),
        userAgent: zod_1.z.string().optional(),
        ipAddress: zod_1.z.string().optional(),
    }),
});
var GetApplicationsRequestSchema = zod_1.z.object({
    limit: zod_1.z.number().int().min(1).max(100).default(50),
    offset: zod_1.z.number().int().min(0).default(0),
    status: zod_1.z.nativeEnum(database_1.QueueStatus).optional(),
});
var ApplicationActionRequestSchema = zod_1.z.object({
    action: zod_1.z.enum(['cancel', 'retry', 'prioritize']),
    reason: zod_1.z.string().max(500).optional(),
});
// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
/**
 * Extract user from authenticated request
 */
function getAuthenticatedUser(request) {
    var _a;
    if (!((_a = request.user) === null || _a === void 0 ? void 0 : _a.id)) {
        throw new Error('User not authenticated');
    }
    return request.user;
}
/**
 * Create job snapshot from job posting
 */
function createJobSnapshot(fastify, jobPosting, applicationQueueId) {
    return __awaiter(this, void 0, void 0, function () {
        var snapshot, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fastify.db.jobSnapshot.create({
                            data: {
                                applicationQueueId: applicationQueueId,
                                originalJobId: jobPosting.id,
                                // Job data snapshot
                                title: jobPosting.title,
                                description: jobPosting.description,
                                requirements: jobPosting.requirements,
                                benefits: jobPosting.benefits,
                                // Classification
                                type: jobPosting.type.toString(),
                                level: jobPosting.level.toString(),
                                department: jobPosting.department,
                                category: jobPosting.category.toString(),
                                // Work arrangement
                                remote: jobPosting.remote,
                                remoteType: jobPosting.remoteType.toString(),
                                location: jobPosting.location,
                                timeZone: jobPosting.timeZone,
                                // Location details
                                city: jobPosting.city,
                                state: jobPosting.state,
                                country: jobPosting.country,
                                coordinates: jobPosting.coordinates,
                                // Compensation
                                salaryMin: jobPosting.salaryMin,
                                salaryMax: jobPosting.salaryMax,
                                currency: jobPosting.currency,
                                salaryType: (_a = jobPosting.salaryType) === null || _a === void 0 ? void 0 : _a.toString(),
                                equity: jobPosting.equity,
                                bonus: jobPosting.bonus,
                                // Requirements
                                experienceYears: jobPosting.experienceYears,
                                skills: jobPosting.skills,
                                education: jobPosting.education,
                                languages: jobPosting.languages,
                                // Company data snapshot
                                companyName: jobPosting.company.name,
                                companyLogo: jobPosting.company.logo,
                                companyWebsite: jobPosting.company.website,
                                companyIndustry: jobPosting.company.industry,
                                companySize: (_b = jobPosting.company.size) === null || _b === void 0 ? void 0 : _b.toString(),
                                companyDescription: jobPosting.company.description,
                                // External integration
                                externalId: jobPosting.externalId,
                                source: jobPosting.source.toString(),
                                sourceUrl: jobPosting.sourceUrl,
                                applyUrl: jobPosting.applyUrl,
                                // Metadata
                                qualityScore: jobPosting.qualityScore,
                                isVerified: jobPosting.isVerified,
                                // Original status
                                originalStatus: jobPosting.status.toString(),
                                isActive: jobPosting.isActive,
                                isFeatured: jobPosting.isFeatured,
                                isUrgent: jobPosting.isUrgent,
                                // Original dates
                                originalPostedAt: jobPosting.postedAt,
                                originalExpiresAt: jobPosting.expiresAt,
                                // Analytics snapshot
                                viewCount: jobPosting.viewCount,
                                applicationCount: jobPosting.applicationCount,
                                rightSwipeCount: jobPosting.rightSwipeCount,
                                leftSwipeCount: jobPosting.leftSwipeCount,
                            },
                        })];
                case 1:
                    snapshot = _c.sent();
                    return [2 /*return*/, snapshot];
                case 2:
                    error_1 = _c.sent();
                    fastify.log.error('Failed to create job snapshot:', error_1);
                    throw new Error('Failed to create job snapshot');
                case 3: return [2 /*return*/];
            }
        });
    });
}
// =============================================================================
// QUEUE UTILITIES
// =============================================================================
/**
 * Get the position of an application in the queue
 */
function getQueuePosition(snapshotId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // Mock implementation - in real scenario, this would query the database
                // to find the position based on priority and creation time
                return [2 /*return*/, Math.floor(Math.random() * 50) + 1]; // Random position 1-50 for development
            }
            catch (error) {
                console.warn('Failed to get queue position:', error);
                return [2 /*return*/, 0];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Calculate estimated processing time based on queue position
 */
function calculateEstimatedTime(position, isPriority) {
    try {
        // Base processing time per application (in minutes)
        var baseTimePerApp = isPriority ? 3 : 5;
        // Calculate estimated minutes
        var estimatedMinutes = position * baseTimePerApp;
        if (estimatedMinutes < 1)
            return 'Starting soon';
        if (estimatedMinutes < 60)
            return "~".concat(estimatedMinutes, " minutes");
        var hours = Math.floor(estimatedMinutes / 60);
        var minutes = estimatedMinutes % 60;
        if (hours === 1)
            return minutes > 0 ? "~1 hour ".concat(minutes, " minutes") : '~1 hour';
        return minutes > 0 ? "~".concat(hours, " hours ").concat(minutes, " minutes") : "~".concat(hours, " hours");
    }
    catch (error) {
        console.warn('Failed to calculate estimated time:', error);
        return 'Unknown';
    }
}
// =============================================================================
// AUTHENTICATION MIDDLEWARE
// =============================================================================
function authenticateUser(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var authHeader, token, verification, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    authHeader = request.headers.authorization;
                    if (!authHeader || !authHeader.startsWith('Bearer ')) {
                        return [2 /*return*/, reply.code(401).send({
                                success: false,
                                error: 'Missing or invalid authorization header',
                                errorCode: 'UNAUTHORIZED',
                            })];
                    }
                    token = authHeader.substring(7);
                    if (!request.server.jwtService) return [3 /*break*/, 2];
                    return [4 /*yield*/, request.server.jwtService.verifyToken(token)];
                case 1:
                    verification = _a.sent();
                    if (!verification.valid || !verification.payload) {
                        return [2 /*return*/, reply.code(401).send({
                                success: false,
                                error: 'Invalid or expired token',
                                errorCode: 'INVALID_TOKEN',
                            })];
                    }
                    request.user = {
                        id: verification.payload.sub || verification.payload.userId,
                        email: verification.payload.email,
                        role: verification.payload.role || 'user',
                        status: verification.payload.status || 'active',
                    };
                    return [3 /*break*/, 3];
                case 2:
                    // Fallback basic token validation
                    if (!token || token.length < 20) {
                        return [2 /*return*/, reply.code(401).send({
                                success: false,
                                error: 'Invalid token format',
                                errorCode: 'INVALID_TOKEN',
                            })];
                    }
                    // Mock user for basic mode
                    request.user = {
                        id: 'basic-user-id',
                        email: 'user@example.com',
                        role: 'user',
                        status: 'active',
                    };
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    request.server.log.error('Authentication error:', error_2);
                    return [2 /*return*/, reply.code(401).send({
                            success: false,
                            error: 'Authentication failed',
                            errorCode: 'AUTH_ERROR',
                        })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// =============================================================================
// ROUTE HANDLERS
// =============================================================================
/**
 * POST /api/v1/queue/apply
 * Queue a job application when user applies to a job
 */
function applyHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var correlationId, startTime, logContext, data_1, user_1, enhancedLogContext_1, existingSwipe, jobPosting_1, userProfile_1, serverEligibility, companyAutomation, serverRequest, automationResult, serverError_1, result, processingTime, _a, _b, _c, error_3, processingTime;
        var _d;
        var _this = this;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    correlationId = (0, crypto_1.randomUUID)();
                    startTime = Date.now();
                    logContext = {
                        correlationId: correlationId,
                        requestId: request.id || (0, crypto_1.randomUUID)(),
                        endpoint: '/api/v1/queue/apply',
                        userAgent: request.headers['user-agent'],
                        ip: request.ip
                    };
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 13, , 14]);
                    request.server.log.info(__assign(__assign({}, logContext), { event: 'request_started', message: 'Job application request started' }));
                    data_1 = JobApplicationRequestSchema.parse(request.body);
                    user_1 = getAuthenticatedUser(request);
                    enhancedLogContext_1 = __assign(__assign({}, logContext), { userId: user_1.id, userEmail: user_1.email, jobId: data_1.jobId, source: data_1.metadata.source });
                    return [4 /*yield*/, request.server.db.userJobSwipe.findUnique({
                            where: {
                                userId_jobPostingId: {
                                    userId: user_1.id,
                                    jobPostingId: data_1.jobId,
                                },
                            },
                        })];
                case 2:
                    existingSwipe = _e.sent();
                    if (existingSwipe && existingSwipe.direction === 'RIGHT') {
                        request.server.log.warn(__assign(__assign({}, enhancedLogContext_1), { event: 'duplicate_application', message: 'User already applied to this job', existingSwipeId: existingSwipe.id }));
                        return [2 /*return*/, reply.code(409).send({
                                success: false,
                                error: 'Already applied to this job',
                                errorCode: 'DUPLICATE_APPLICATION',
                                correlationId: correlationId
                            })];
                    }
                    return [4 /*yield*/, request.server.db.jobPosting.findUnique({
                            where: { id: data_1.jobId },
                            include: { company: true },
                        })];
                case 3:
                    jobPosting_1 = _e.sent();
                    if (!jobPosting_1) {
                        request.server.log.warn(__assign(__assign({}, enhancedLogContext_1), { event: 'job_not_found', message: 'Job posting not found in database' }));
                        return [2 /*return*/, reply.code(404).send({
                                success: false,
                                error: 'Job not found',
                                errorCode: 'JOB_NOT_FOUND',
                                correlationId: correlationId
                            })];
                    }
                    if (!jobPosting_1.isActive) {
                        request.server.log.warn(__assign(__assign({}, enhancedLogContext_1), { event: 'job_inactive', message: 'Job posting is no longer active', jobTitle: jobPosting_1.title, company: jobPosting_1.company.name }));
                        return [2 /*return*/, reply.code(410).send({
                                success: false,
                                error: 'Job is no longer active',
                                errorCode: 'JOB_INACTIVE',
                                correlationId: correlationId
                            })];
                    }
                    request.server.log.info(__assign(__assign({}, enhancedLogContext_1), { event: 'job_validated', message: 'Job posting found and validated', jobTitle: jobPosting_1.title, company: jobPosting_1.company.name, jobLocation: jobPosting_1.location }));
                    return [4 /*yield*/, request.server.db.userProfile.findUnique({
                            where: { userId: user_1.id },
                        })];
                case 4:
                    userProfile_1 = _e.sent();
                    return [4 /*yield*/, request.server.automationLimits.checkServerEligibility(user_1.id)];
                case 5:
                    serverEligibility = _e.sent();
                    request.server.log.info(__assign(__assign({}, enhancedLogContext_1), { event: 'server_eligibility_checked', message: 'Server automation eligibility checked', eligible: serverEligibility.allowed, reason: serverEligibility.reason, remainingApplications: serverEligibility.remainingServerApplications }));
                    if (!(serverEligibility.allowed && request.server.serverAutomationService)) return [3 /*break*/, 10];
                    _e.label = 6;
                case 6:
                    _e.trys.push([6, 9, , 10]);
                    request.server.log.info(__assign(__assign({}, enhancedLogContext_1), { event: 'server_automation_started', message: 'Starting immediate server automation' }));
                    companyAutomation = detectCompanyAutomation(jobPosting_1.externalUrl);
                    serverRequest = {
                        userId: user_1.id,
                        jobId: data_1.jobId,
                        applicationId: (0, crypto_1.randomUUID)(),
                        companyAutomation: companyAutomation,
                        userProfile: {
                            firstName: (userProfile_1 === null || userProfile_1 === void 0 ? void 0 : userProfile_1.firstName) || '',
                            lastName: (userProfile_1 === null || userProfile_1 === void 0 ? void 0 : userProfile_1.lastName) || '',
                            email: user_1.email,
                            phone: (userProfile_1 === null || userProfile_1 === void 0 ? void 0 : userProfile_1.phone) || '',
                            resumeUrl: (userProfile_1 === null || userProfile_1 === void 0 ? void 0 : userProfile_1.website) || '',
                            currentTitle: (userProfile_1 === null || userProfile_1 === void 0 ? void 0 : userProfile_1.currentTitle) || '',
                            yearsExperience: (userProfile_1 === null || userProfile_1 === void 0 ? void 0 : userProfile_1.yearsOfExperience) || 0,
                            skills: (userProfile_1 === null || userProfile_1 === void 0 ? void 0 : userProfile_1.skills) || [],
                            currentLocation: (userProfile_1 === null || userProfile_1 === void 0 ? void 0 : userProfile_1.location) || '',
                            linkedinUrl: (userProfile_1 === null || userProfile_1 === void 0 ? void 0 : userProfile_1.linkedin) || '',
                            workAuthorization: (userProfile_1 === null || userProfile_1 === void 0 ? void 0 : userProfile_1.workAuthorization) || '',
                            coverLetter: data_1.coverLetter,
                            customFields: data_1.customFields || {}
                        },
                        jobData: {
                            id: data_1.jobId,
                            title: jobPosting_1.title,
                            company: jobPosting_1.company.name,
                            applyUrl: jobPosting_1.externalUrl,
                            location: jobPosting_1.location,
                            description: jobPosting_1.description,
                            requirements: Array.isArray(jobPosting_1.requirements) ? jobPosting_1.requirements : []
                        },
                        options: {
                            headless: true,
                            timeout: 300000 // 5 minutes
                        }
                    };
                    return [4 /*yield*/, request.server.serverAutomationService.executeAutomation(serverRequest, correlationId)];
                case 7:
                    automationResult = _e.sent();
                    // Record server application usage
                    return [4 /*yield*/, request.server.automationLimits.recordServerApplication(user_1.id)];
                case 8:
                    // Record server application usage
                    _e.sent();
                    request.server.log.info(__assign(__assign({}, enhancedLogContext_1), { event: 'server_automation_completed', message: 'Server automation completed successfully', success: automationResult.success, processingTime: Date.now() - startTime }));
                    // Return immediate server automation result
                    return [2 /*return*/, reply.send({
                            success: true,
                            message: 'Job application processed immediately via server automation',
                            data: {
                                applicationId: serverRequest.applicationId,
                                jobId: data_1.jobId,
                                userId: user_1.id,
                                status: automationResult.success ? database_1.QueueStatus.COMPLETED : database_1.QueueStatus.FAILED,
                                executionMode: 'server',
                                result: automationResult,
                                processingTime: Date.now() - startTime
                            }
                        })];
                case 9:
                    serverError_1 = _e.sent();
                    request.server.log.error(__assign(__assign({}, enhancedLogContext_1), { event: 'server_automation_failed', message: 'Server automation failed, falling back to desktop queue', error: serverError_1 instanceof Error ? serverError_1.message : 'Unknown error' }));
                    return [3 /*break*/, 10];
                case 10:
                    // Log desktop queue routing
                    request.server.log.info(__assign(__assign({}, enhancedLogContext_1), { event: 'desktop_queue_routing', message: 'Routing application to desktop queue', reason: serverEligibility.allowed ? 'server_automation_failed' : serverEligibility.reason }));
                    // Start database transaction
                    request.server.log.info(__assign(__assign({}, enhancedLogContext_1), { event: 'database_transaction_started', message: 'Starting database transaction for job application' }));
                    return [4 /*yield*/, request.server.db.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var queueEntry, snapshot, queueJobData, isPriority, queueJobId, queuePosition, estimatedTime, queueError_1;
                            var _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0: 
                                    // Create or update swipe record
                                    return [4 /*yield*/, tx.userJobSwipe.upsert({
                                            where: {
                                                userId_jobPostingId: {
                                                    userId: user_1.id,
                                                    jobPostingId: data_1.jobId,
                                                },
                                            },
                                            update: {
                                                direction: 'RIGHT',
                                                deviceType: data_1.metadata.source,
                                                updatedAt: new Date(),
                                            },
                                            create: {
                                                userId: user_1.id,
                                                jobPostingId: data_1.jobId,
                                                direction: 'RIGHT',
                                                deviceType: data_1.metadata.source,
                                                sessionId: data_1.metadata.deviceId,
                                                ipAddress: data_1.metadata.ipAddress,
                                                userAgent: data_1.metadata.userAgent,
                                            },
                                        })];
                                    case 1:
                                        // Create or update swipe record
                                        _c.sent();
                                        return [4 /*yield*/, tx.applicationQueue.create({
                                                data: {
                                                    userId: user_1.id,
                                                    jobPostingId: data_1.jobId,
                                                    status: database_1.QueueStatus.PENDING,
                                                    priority: data_1.priority === 10 ? 'IMMEDIATE' :
                                                        data_1.priority >= 8 ? 'URGENT' :
                                                            data_1.priority >= 6 ? 'HIGH' : 'NORMAL',
                                                    useCustomResume: !!data_1.resumeId,
                                                    resumeId: data_1.resumeId,
                                                    coverLetter: data_1.coverLetter,
                                                    customFields: data_1.customFields || {},
                                                    automationConfig: {
                                                        source: data_1.metadata.source,
                                                        deviceId: data_1.metadata.deviceId,
                                                        timestamp: new Date().toISOString(),
                                                    },
                                                },
                                            })];
                                    case 2:
                                        queueEntry = _c.sent();
                                        return [4 /*yield*/, tx.jobSnapshot.create({
                                                data: {
                                                    applicationQueueId: queueEntry.id,
                                                    originalJobId: jobPosting_1.id,
                                                    // Job data snapshot
                                                    title: jobPosting_1.title,
                                                    description: jobPosting_1.description,
                                                    requirements: jobPosting_1.requirements,
                                                    benefits: jobPosting_1.benefits,
                                                    // Classification
                                                    type: jobPosting_1.type.toString(),
                                                    level: jobPosting_1.level.toString(),
                                                    department: jobPosting_1.department,
                                                    category: jobPosting_1.category.toString(),
                                                    // Work arrangement
                                                    remote: jobPosting_1.remote,
                                                    remoteType: jobPosting_1.remoteType.toString(),
                                                    location: jobPosting_1.location,
                                                    timeZone: jobPosting_1.timeZone,
                                                    // Location details
                                                    city: jobPosting_1.city,
                                                    state: jobPosting_1.state,
                                                    country: jobPosting_1.country,
                                                    coordinates: jobPosting_1.coordinates,
                                                    // Compensation
                                                    salaryMin: jobPosting_1.salaryMin,
                                                    salaryMax: jobPosting_1.salaryMax,
                                                    currency: jobPosting_1.currency,
                                                    salaryType: (_a = jobPosting_1.salaryType) === null || _a === void 0 ? void 0 : _a.toString(),
                                                    equity: jobPosting_1.equity,
                                                    bonus: jobPosting_1.bonus,
                                                    // Requirements
                                                    experienceYears: jobPosting_1.experienceYears,
                                                    skills: jobPosting_1.skills,
                                                    education: jobPosting_1.education,
                                                    languages: jobPosting_1.languages,
                                                    // Company data snapshot
                                                    companyName: jobPosting_1.company.name,
                                                    companyLogo: jobPosting_1.company.logo,
                                                    companyWebsite: jobPosting_1.company.website,
                                                    companyIndustry: jobPosting_1.company.industry,
                                                    companySize: (_b = jobPosting_1.company.size) === null || _b === void 0 ? void 0 : _b.toString(),
                                                    companyDescription: jobPosting_1.company.description,
                                                    // External integration
                                                    externalId: jobPosting_1.externalId,
                                                    source: jobPosting_1.source.toString(),
                                                    sourceUrl: jobPosting_1.sourceUrl,
                                                    applyUrl: jobPosting_1.applyUrl,
                                                    // Metadata
                                                    qualityScore: jobPosting_1.qualityScore,
                                                    isVerified: jobPosting_1.isVerified,
                                                    // Original status
                                                    originalStatus: jobPosting_1.status.toString(),
                                                    isActive: jobPosting_1.isActive,
                                                    isFeatured: jobPosting_1.isFeatured,
                                                    isUrgent: jobPosting_1.isUrgent,
                                                    // Original dates
                                                    originalPostedAt: jobPosting_1.postedAt,
                                                    originalExpiresAt: jobPosting_1.expiresAt,
                                                    // Analytics snapshot
                                                    viewCount: jobPosting_1.viewCount,
                                                    applicationCount: jobPosting_1.applicationCount,
                                                    rightSwipeCount: jobPosting_1.rightSwipeCount,
                                                    leftSwipeCount: jobPosting_1.leftSwipeCount,
                                                },
                                            })];
                                    case 3:
                                        snapshot = _c.sent();
                                        if (!request.server.queueService) return [3 /*break*/, 11];
                                        queueJobData = {
                                            jobId: data_1.jobId,
                                            userId: user_1.id,
                                            jobData: {
                                                title: jobPosting_1.title,
                                                company: jobPosting_1.company.name,
                                                url: jobPosting_1.applyUrl || jobPosting_1.sourceUrl || '',
                                                description: jobPosting_1.description,
                                                requirements: jobPosting_1.requirements || '',
                                                salary: jobPosting_1.salaryMin && jobPosting_1.salaryMax ? {
                                                    min: jobPosting_1.salaryMin,
                                                    max: jobPosting_1.salaryMax,
                                                    currency: jobPosting_1.currency || 'USD'
                                                } : undefined,
                                                location: jobPosting_1.location || "".concat(jobPosting_1.city, ", ").concat(jobPosting_1.state),
                                                remote: jobPosting_1.remote,
                                                type: jobPosting_1.type.toString(),
                                                level: jobPosting_1.level.toString(),
                                            },
                                            userProfile: {
                                                resumeUrl: userProfile_1 === null || userProfile_1 === void 0 ? void 0 : userProfile_1.resumeUrl,
                                                coverLetter: data_1.coverLetter,
                                                preferences: {
                                                    firstName: (userProfile_1 === null || userProfile_1 === void 0 ? void 0 : userProfile_1.firstName) || user_1.email.split('@')[0],
                                                    lastName: (userProfile_1 === null || userProfile_1 === void 0 ? void 0 : userProfile_1.lastName) || 'User',
                                                    email: user_1.email,
                                                    phone: (userProfile_1 === null || userProfile_1 === void 0 ? void 0 : userProfile_1.phone) || '',
                                                    currentTitle: userProfile_1 === null || userProfile_1 === void 0 ? void 0 : userProfile_1.currentTitle,
                                                    yearsExperience: userProfile_1 === null || userProfile_1 === void 0 ? void 0 : userProfile_1.yearsExperience,
                                                    skills: (userProfile_1 === null || userProfile_1 === void 0 ? void 0 : userProfile_1.skills) || [],
                                                    currentLocation: (userProfile_1 === null || userProfile_1 === void 0 ? void 0 : userProfile_1.currentLocation) || jobPosting_1.location,
                                                    linkedinUrl: userProfile_1 === null || userProfile_1 === void 0 ? void 0 : userProfile_1.linkedinUrl,
                                                    workAuthorization: userProfile_1 === null || userProfile_1 === void 0 ? void 0 : userProfile_1.workAuthorization,
                                                    applicationId: queueEntry.id,
                                                }
                                            },
                                            priority: data_1.priority,
                                            metadata: {
                                                source: data_1.metadata.source,
                                                deviceId: data_1.metadata.deviceId,
                                                timestamp: new Date().toISOString(),
                                            }
                                        };
                                        _c.label = 4;
                                    case 4:
                                        _c.trys.push([4, 9, , 10]);
                                        isPriority = data_1.priority >= 8;
                                        return [4 /*yield*/, request.server.queueService.addJobApplication(queueJobData, isPriority)];
                                    case 5:
                                        queueJobId = _c.sent();
                                        request.server.log.info(__assign(__assign({}, enhancedLogContext_1), { event: 'bullmq_job_queued', message: 'Application queued in BullMQ for processing', queueJobId: queueJobId, queueName: isPriority ? 'priority' : 'applications', executionMode: 'worker' }));
                                        if (!request.server.websocket) return [3 /*break*/, 7];
                                        return [4 /*yield*/, getQueuePosition(snapshot.id)];
                                    case 6:
                                        queuePosition = _c.sent();
                                        estimatedTime = calculateEstimatedTime(queuePosition, isPriority);
                                        request.server.websocket.emitToUser(user_1.id, 'job-queued', {
                                            applicationId: queueEntry.id,
                                            queueJobId: queueJobId,
                                            status: 'queued',
                                            jobTitle: queueJobData.jobData.title,
                                            company: queueJobData.jobData.company,
                                            queuedAt: new Date().toISOString(),
                                            isPriority: isPriority,
                                            queuePosition: queuePosition,
                                            estimatedTime: estimatedTime,
                                            message: 'Job application has been queued for automation'
                                        });
                                        // Application status update
                                        request.server.websocket.emitApplicationStatusUpdate(user_1.id, {
                                            applicationId: queueEntry.id,
                                            jobId: data_1.jobId,
                                            jobTitle: queueJobData.jobData.title,
                                            company: queueJobData.jobData.company,
                                            status: 'queued',
                                            queuePosition: queuePosition,
                                            estimatedTime: estimatedTime,
                                            timestamp: new Date().toISOString()
                                        });
                                        _c.label = 7;
                                    case 7: 
                                    // Update the database entry with queue job ID
                                    return [4 /*yield*/, tx.applicationQueue.update({
                                            where: { id: queueEntry.id },
                                            data: {
                                                status: 'QUEUED',
                                                automationConfig: __assign(__assign({}, queueEntry.automationConfig), { queueJobId: queueJobId, queuedAt: new Date().toISOString(), isPriority: isPriority })
                                            }
                                        })];
                                    case 8:
                                        // Update the database entry with queue job ID
                                        _c.sent();
                                        return [3 /*break*/, 10];
                                    case 9:
                                        queueError_1 = _c.sent();
                                        request.server.log.error(__assign(__assign({}, enhancedLogContext_1), { event: 'bullmq_queue_failed', message: 'Failed to queue job in BullMQ - job saved for manual processing', error: queueError_1 instanceof Error ? queueError_1.message : String(queueError_1), errorStack: queueError_1 instanceof Error ? queueError_1.stack : undefined, queueServiceAvailable: !!request.server.queueService, websocketAvailable: !!request.server.websocket }));
                                        // Emit WebSocket event about queue failure
                                        if (request.server.websocket) {
                                            request.server.websocket.emitToUser(user_1.id, 'queue-failed', {
                                                applicationId: queueEntry.id,
                                                status: 'pending',
                                                jobTitle: jobPosting_1.title,
                                                company: jobPosting_1.company.name,
                                                failedAt: new Date().toISOString(),
                                                error: 'Failed to queue job - will be processed manually',
                                                message: 'Job application saved but queuing failed'
                                            });
                                        }
                                        return [3 /*break*/, 10];
                                    case 10: return [3 /*break*/, 12];
                                    case 11:
                                        request.server.log.warn(__assign(__assign({}, enhancedLogContext_1), { event: 'queue_service_unavailable', message: 'Queue service not available - job saved for manual processing' }));
                                        _c.label = 12;
                                    case 12: return [2 /*return*/, {
                                            applicationId: queueEntry.id,
                                            snapshotId: snapshot.id,
                                            status: queueEntry.status,
                                            priority: queueEntry.priority,
                                        }];
                                }
                            });
                        }); })];
                case 11:
                    result = _e.sent();
                    processingTime = Date.now() - startTime;
                    _b = (_a = request.server.log).info;
                    _c = [__assign({}, enhancedLogContext_1)];
                    _d = { event: 'request_completed_success', message: 'Job application request completed successfully', processingTimeMs: processingTime, applicationId: result.applicationId };
                    return [4 /*yield*/, getQueuePosition(result.snapshotId)];
                case 12:
                    _b.apply(_a, [__assign.apply(void 0, _c.concat([(_d.queuePosition = _e.sent(), _d)]))]);
                    return [2 /*return*/, reply.code(201).send({
                            success: true,
                            data: __assign(__assign({}, result), { executionMode: 'desktop', serverAutomation: {
                                    eligible: serverEligibility.allowed,
                                    reason: serverEligibility.reason,
                                    remainingServerApplications: serverEligibility.remainingServerApplications,
                                    upgradeRequired: serverEligibility.upgradeRequired,
                                    suggestedAction: serverEligibility.suggestedAction
                                } }),
                            message: serverEligibility.allowed
                                ? 'Server automation not available - job queued for desktop processing'
                                : "Server automation limit reached - ".concat(serverEligibility.reason, ". Download desktop app for unlimited applications."),
                            correlationId: correlationId,
                            processingTime: processingTime
                        })];
                case 13:
                    error_3 = _e.sent();
                    processingTime = Date.now() - startTime;
                    if (error_3 instanceof zod_1.z.ZodError) {
                        request.server.log.warn(__assign(__assign({}, logContext), { event: 'request_validation_failed', message: 'Job application request validation failed', processingTimeMs: processingTime, validationErrors: error_3.errors }));
                        return [2 /*return*/, reply.code(400).send({
                                success: false,
                                error: 'Validation failed',
                                details: error_3.errors,
                                errorCode: 'VALIDATION_ERROR',
                                correlationId: correlationId
                            })];
                    }
                    request.server.log.error(__assign(__assign({}, logContext), { event: 'request_failed_error', message: 'Job application request failed with error', processingTimeMs: processingTime, error: error_3 instanceof Error ? error_3.message : String(error_3), errorStack: error_3 instanceof Error ? error_3.stack : undefined }));
                    return [2 /*return*/, reply.code(500).send({
                            success: false,
                            error: 'Internal server error',
                            errorCode: 'INTERNAL_ERROR',
                            correlationId: correlationId
                        })];
                case 14: return [2 /*return*/];
            }
        });
    });
}
/**
 * GET /api/v1/queue/applications
 * Get user's job applications from queue
 */
function getApplicationsHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var query, user, applications, total, formattedApplications, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    query = GetApplicationsRequestSchema.parse(request.query);
                    user = getAuthenticatedUser(request);
                    return [4 /*yield*/, request.server.db.applicationQueue.findMany({
                            where: __assign({ userId: user.id }, (query.status && { status: query.status.toUpperCase() })),
                            include: {
                                jobPosting: {
                                    include: { company: true },
                                },
                                jobSnapshot: true,
                            },
                            orderBy: { createdAt: 'desc' },
                            take: query.limit,
                            skip: query.offset,
                        })];
                case 1:
                    applications = _a.sent();
                    return [4 /*yield*/, request.server.db.applicationQueue.count({
                            where: __assign({ userId: user.id }, (query.status && { status: query.status.toUpperCase() })),
                        })];
                case 2:
                    total = _a.sent();
                    formattedApplications = applications.map(function (app) {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                        return ({
                            id: app.id,
                            jobId: app.jobPostingId,
                            status: app.status.toLowerCase(),
                            priority: app.priority.toLowerCase(),
                            attempts: app.attempts,
                            maxAttempts: app.maxAttempts,
                            scheduledAt: app.scheduledAt,
                            startedAt: app.startedAt,
                            completedAt: app.completedAt,
                            success: app.success,
                            errorMessage: app.errorMessage,
                            job: {
                                title: ((_a = app.jobSnapshot) === null || _a === void 0 ? void 0 : _a.title) || app.jobPosting.title,
                                company: ((_b = app.jobSnapshot) === null || _b === void 0 ? void 0 : _b.companyName) || app.jobPosting.company.name,
                                location: ((_c = app.jobSnapshot) === null || _c === void 0 ? void 0 : _c.location) || app.jobPosting.location,
                                logo: ((_d = app.jobSnapshot) === null || _d === void 0 ? void 0 : _d.companyLogo) || app.jobPosting.company.logo,
                                salary: {
                                    min: ((_e = app.jobSnapshot) === null || _e === void 0 ? void 0 : _e.salaryMin) || app.jobPosting.salaryMin,
                                    max: ((_f = app.jobSnapshot) === null || _f === void 0 ? void 0 : _f.salaryMax) || app.jobPosting.salaryMax,
                                    currency: ((_g = app.jobSnapshot) === null || _g === void 0 ? void 0 : _g.currency) || app.jobPosting.currency,
                                },
                                remote: (_j = (_h = app.jobSnapshot) === null || _h === void 0 ? void 0 : _h.remote) !== null && _j !== void 0 ? _j : app.jobPosting.remote,
                                type: ((_k = app.jobSnapshot) === null || _k === void 0 ? void 0 : _k.type) || app.jobPosting.type,
                            },
                            createdAt: app.createdAt,
                            updatedAt: app.updatedAt,
                        });
                    });
                    return [2 /*return*/, reply.send({
                            success: true,
                            data: {
                                applications: formattedApplications,
                                pagination: {
                                    total: total,
                                    limit: query.limit,
                                    offset: query.offset,
                                    hasMore: query.offset + query.limit < total,
                                },
                            },
                        })];
                case 3:
                    error_4 = _a.sent();
                    if (error_4 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, reply.code(400).send({
                                success: false,
                                error: 'Validation failed',
                                details: error_4.errors,
                                errorCode: 'VALIDATION_ERROR',
                            })];
                    }
                    request.server.log.error('Get applications error:', error_4);
                    return [2 /*return*/, reply.code(500).send({
                            success: false,
                            error: 'Internal server error',
                            errorCode: 'INTERNAL_ERROR',
                        })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * GET /api/v1/queue/applications/:id
 * Get specific application details
 */
function getApplicationHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var id, user, application, automationStatus, automationApplicationId, error_5, formattedApplication, error_6;
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    _j.trys.push([0, 7, , 8]);
                    id = request.params.id;
                    user = getAuthenticatedUser(request);
                    return [4 /*yield*/, request.server.db.applicationQueue.findFirst({
                            where: {
                                id: id,
                                userId: user.id,
                            },
                            include: {
                                jobPosting: {
                                    include: { company: true },
                                },
                                jobSnapshot: true,
                                automationLogs: {
                                    orderBy: { createdAt: 'desc' },
                                    take: 50,
                                },
                            },
                        })];
                case 1:
                    application = _j.sent();
                    if (!application) {
                        return [2 /*return*/, reply.code(404).send({
                                success: false,
                                error: 'Application not found',
                                errorCode: 'APPLICATION_NOT_FOUND',
                            })];
                    }
                    automationStatus = null;
                    if (!request.server.automationService) return [3 /*break*/, 6];
                    _j.label = 2;
                case 2:
                    _j.trys.push([2, 5, , 6]);
                    automationApplicationId = (_a = application.automationConfig) === null || _a === void 0 ? void 0 : _a.automationApplicationId;
                    if (!automationApplicationId) return [3 /*break*/, 4];
                    return [4 /*yield*/, request.server.automationService.getApplicationStatus(automationApplicationId)];
                case 3:
                    automationStatus = _j.sent();
                    _j.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_5 = _j.sent();
                    request.server.log.warn('Failed to get automation status:', error_5);
                    return [3 /*break*/, 6];
                case 6:
                    formattedApplication = {
                        id: application.id,
                        jobId: application.jobPostingId,
                        status: application.status.toLowerCase(),
                        priority: application.priority.toLowerCase(),
                        attempts: application.attempts,
                        maxAttempts: application.maxAttempts,
                        scheduledAt: application.scheduledAt,
                        startedAt: application.startedAt,
                        completedAt: application.completedAt,
                        success: application.success,
                        errorMessage: application.errorMessage,
                        errorType: application.errorType,
                        responseData: application.responseData,
                        automationStatus: automationStatus,
                        job: {
                            title: ((_b = application.jobSnapshot) === null || _b === void 0 ? void 0 : _b.title) || application.jobPosting.title,
                            company: ((_c = application.jobSnapshot) === null || _c === void 0 ? void 0 : _c.companyName) || application.jobPosting.company.name,
                            description: ((_d = application.jobSnapshot) === null || _d === void 0 ? void 0 : _d.description) || application.jobPosting.description,
                            requirements: ((_e = application.jobSnapshot) === null || _e === void 0 ? void 0 : _e.requirements) || application.jobPosting.requirements,
                            location: ((_f = application.jobSnapshot) === null || _f === void 0 ? void 0 : _f.location) || application.jobPosting.location,
                            applyUrl: ((_g = application.jobSnapshot) === null || _g === void 0 ? void 0 : _g.applyUrl) || application.jobPosting.applyUrl,
                            sourceUrl: ((_h = application.jobSnapshot) === null || _h === void 0 ? void 0 : _h.sourceUrl) || application.jobPosting.sourceUrl,
                        },
                        logs: application.automationLogs.map(function (log) { return ({
                            id: log.id,
                            level: log.level.toLowerCase(),
                            message: log.message,
                            step: log.step,
                            action: log.action,
                            executionTime: log.executionTime,
                            createdAt: log.createdAt,
                        }); }),
                        createdAt: application.createdAt,
                        updatedAt: application.updatedAt,
                    };
                    return [2 /*return*/, reply.send({
                            success: true,
                            data: formattedApplication,
                        })];
                case 7:
                    error_6 = _j.sent();
                    request.server.log.error('Get application error:', error_6);
                    return [2 /*return*/, reply.code(500).send({
                            success: false,
                            error: 'Internal server error',
                            errorCode: 'INTERNAL_ERROR',
                        })];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * POST /api/v1/queue/applications/:id/action
 * Perform action on application (cancel, retry, prioritize)
 */
function applicationActionHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var id, data, user, application, updateData, queueAction, _a, automationApplicationId, cancelResult, error_7, updatedApplication, error_8;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 15, , 16]);
                    id = request.params.id;
                    data = ApplicationActionRequestSchema.parse(request.body);
                    user = getAuthenticatedUser(request);
                    return [4 /*yield*/, request.server.db.applicationQueue.findFirst({
                            where: {
                                id: id,
                                userId: user.id,
                            },
                        })];
                case 1:
                    application = _c.sent();
                    if (!application) {
                        return [2 /*return*/, reply.code(404).send({
                                success: false,
                                error: 'Application not found',
                                errorCode: 'APPLICATION_NOT_FOUND',
                            })];
                    }
                    updateData = {};
                    queueAction = null;
                    _a = data.action;
                    switch (_a) {
                        case 'cancel': return [3 /*break*/, 2];
                        case 'retry': return [3 /*break*/, 8];
                        case 'prioritize': return [3 /*break*/, 9];
                    }
                    return [3 /*break*/, 10];
                case 2:
                    updateData = { status: database_1.QueueStatus.CANCELLED };
                    if (!request.server.automationService) return [3 /*break*/, 7];
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 6, , 7]);
                    automationApplicationId = (_b = application.automationConfig) === null || _b === void 0 ? void 0 : _b.automationApplicationId;
                    if (!automationApplicationId) return [3 /*break*/, 5];
                    return [4 /*yield*/, request.server.automationService.cancelApplication(automationApplicationId, user.id)];
                case 4:
                    cancelResult = _c.sent();
                    if (!cancelResult.cancelled) {
                        return [2 /*return*/, reply.code(400).send({
                                success: false,
                                error: 'Cannot cancel application - it may already be processing',
                                errorCode: 'CANCEL_FAILED',
                            })];
                    }
                    _c.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_7 = _c.sent();
                    request.server.log.warn('Failed to cancel automation:', error_7);
                    return [3 /*break*/, 7];
                case 7: return [3 /*break*/, 11];
                case 8:
                    if (application.attempts >= application.maxAttempts) {
                        return [2 /*return*/, reply.code(400).send({
                                success: false,
                                error: 'Maximum retry attempts reached',
                                errorCode: 'MAX_ATTEMPTS_REACHED',
                            })];
                    }
                    updateData = {
                        status: database_1.QueueStatus.PENDING,
                        nextRetryAt: new Date(Date.now() + 30000), // Retry in 30 seconds
                        errorMessage: null,
                        errorType: null,
                    };
                    return [3 /*break*/, 11];
                case 9:
                    updateData = { priority: 'HIGH' };
                    return [3 /*break*/, 11];
                case 10: return [2 /*return*/, reply.code(400).send({
                        success: false,
                        error: 'Invalid action',
                        errorCode: 'INVALID_ACTION',
                    })];
                case 11: return [4 /*yield*/, request.server.db.applicationQueue.update({
                        where: { id: id },
                        data: updateData,
                    })];
                case 12:
                    updatedApplication = _c.sent();
                    if (!queueAction) return [3 /*break*/, 14];
                    return [4 /*yield*/, queueAction];
                case 13:
                    _c.sent();
                    _c.label = 14;
                case 14: return [2 /*return*/, reply.send({
                        success: true,
                        data: {
                            id: updatedApplication.id,
                            status: updatedApplication.status.toLowerCase(),
                            priority: updatedApplication.priority.toLowerCase(),
                            message: "Application ".concat(data.action, " successful"),
                        },
                    })];
                case 15:
                    error_8 = _c.sent();
                    if (error_8 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, reply.code(400).send({
                                success: false,
                                error: 'Validation failed',
                                details: error_8.errors,
                                errorCode: 'VALIDATION_ERROR',
                            })];
                    }
                    request.server.log.error('Application action error:', error_8);
                    return [2 /*return*/, reply.code(500).send({
                            success: false,
                            error: 'Internal server error',
                            errorCode: 'INTERNAL_ERROR',
                        })];
                case 16: return [2 /*return*/];
            }
        });
    });
}
/**
 * GET /api/v1/queue/applications/:id/position
 * Get queue position for application
 */
function queuePositionHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var id, user, application, position, estimatedTime, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    id = request.params.id;
                    user = getAuthenticatedUser(request);
                    return [4 /*yield*/, request.server.db.applicationQueue.findFirst({
                            where: {
                                id: id,
                                userId: user.id,
                            },
                        })];
                case 1:
                    application = _a.sent();
                    if (!application) {
                        return [2 /*return*/, reply.code(404).send({
                                success: false,
                                error: 'Application not found',
                                errorCode: 'APPLICATION_NOT_FOUND',
                            })];
                    }
                    return [4 /*yield*/, request.server.db.applicationQueue.count({
                            where: {
                                status: { in: ['PENDING', 'QUEUED'] },
                                OR: [
                                    { priority: { in: ['IMMEDIATE', 'URGENT'] } },
                                    {
                                        priority: application.priority,
                                        createdAt: { lt: application.createdAt },
                                    },
                                ],
                            },
                        })];
                case 2:
                    position = _a.sent();
                    estimatedTime = calculateEstimatedTime(position + 1, ['IMMEDIATE', 'URGENT'].includes(application.priority));
                    return [2 /*return*/, reply.send({
                            success: true,
                            data: {
                                position: position + 1,
                                estimatedTime: estimatedTime,
                                isPriority: ['IMMEDIATE', 'URGENT'].includes(application.priority),
                                status: application.status.toLowerCase(),
                                timestamp: new Date().toISOString(),
                            },
                        })];
                case 3:
                    error_9 = _a.sent();
                    request.server.log.error('Queue position error:', error_9);
                    return [2 /*return*/, reply.code(500).send({
                            success: false,
                            error: 'Internal server error',
                            errorCode: 'INTERNAL_ERROR',
                        })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * POST /api/v1/queue/applications/:id/queue-position
 * Update queue position from desktop app
 */
function queuePositionUpdateHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var id, data, user, application, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    id = request.params.id;
                    data = request.body;
                    user = getAuthenticatedUser(request);
                    return [4 /*yield*/, request.server.db.applicationQueue.findFirst({
                            where: {
                                id: id,
                                userId: user.id,
                            },
                            include: {
                                jobSnapshot: { select: { title: true, companyName: true } },
                            },
                        })];
                case 1:
                    application = _a.sent();
                    if (!application) {
                        return [2 /*return*/, reply.code(404).send({
                                success: false,
                                error: 'Application not found',
                                errorCode: 'APPLICATION_NOT_FOUND',
                            })];
                    }
                    // Emit WebSocket event for queue position update
                    if (request.server.websocket) {
                        request.server.websocket.emitQueuePositionUpdate(user.id, {
                            applicationId: id,
                            status: 'queued',
                            queuePosition: data.position,
                            estimatedWaitTime: data.estimatedTime,
                            isPriority: ['IMMEDIATE', 'URGENT'].includes(application.priority),
                            message: "You are #".concat(data.position, " in the queue"),
                            timestamp: data.timestamp,
                        });
                    }
                    return [2 /*return*/, reply.send({
                            success: true,
                            message: 'Queue position update received and broadcasted',
                            data: {
                                applicationId: id,
                                position: data.position,
                                estimatedTime: data.estimatedTime,
                                timestamp: new Date().toISOString(),
                            },
                        })];
                case 2:
                    error_10 = _a.sent();
                    request.server.log.error('Queue position update error:', error_10);
                    return [2 /*return*/, reply.code(500).send({
                            success: false,
                            error: 'Internal server error',
                            errorCode: 'INTERNAL_ERROR',
                        })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * POST /api/v1/queue/applications/:id/progress
 * Update application progress from desktop automation
 */
function progressUpdateHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var id, data, user, application, error_11;
        var _a, _b, _c, _d, _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    _h.trys.push([0, 3, , 4]);
                    id = request.params.id;
                    data = request.body;
                    user = getAuthenticatedUser(request);
                    return [4 /*yield*/, request.server.db.applicationQueue.findFirst({
                            where: {
                                id: id,
                                userId: user.id,
                            },
                            include: {
                                jobSnapshot: { select: { title: true, companyName: true } },
                            },
                        })];
                case 1:
                    application = _h.sent();
                    if (!application) {
                        return [2 /*return*/, reply.code(404).send({
                                success: false,
                                error: 'Application not found',
                                errorCode: 'APPLICATION_NOT_FOUND',
                            })];
                    }
                    // Update application status in database
                    return [4 /*yield*/, request.server.db.applicationQueue.update({
                            where: { id: id },
                            data: {
                                status: data.status.toUpperCase(),
                                lastProgressUpdate: new Date(),
                                automationConfig: __assign(__assign({}, application.automationConfig), { lastProgress: {
                                        step: data.progress.step,
                                        percentage: data.progress.percentage,
                                        message: data.progress.message,
                                        timestamp: data.progress.timestamp,
                                        executionId: data.executionId,
                                    } }),
                            },
                        })];
                case 2:
                    // Update application status in database
                    _h.sent();
                    // Emit WebSocket events for real-time updates
                    if (request.server.websocket) {
                        // Automation progress update
                        request.server.websocket.emitAutomationProgress(user.id, {
                            applicationId: id,
                            jobId: application.jobPostingId,
                            jobTitle: ((_a = application.jobSnapshot) === null || _a === void 0 ? void 0 : _a.title) || 'Unknown Job',
                            company: ((_b = application.jobSnapshot) === null || _b === void 0 ? void 0 : _b.companyName) || 'Unknown Company',
                            progress: {
                                step: data.progress.step,
                                percentage: data.progress.percentage,
                                message: data.progress.message,
                                timestamp: data.progress.timestamp,
                            },
                            status: data.status,
                            executionId: data.executionId,
                        });
                        // Application status update
                        request.server.websocket.emitApplicationStatusUpdate(user.id, {
                            applicationId: id,
                            jobId: application.jobPostingId,
                            jobTitle: ((_c = application.jobSnapshot) === null || _c === void 0 ? void 0 : _c.title) || 'Unknown Job',
                            company: ((_d = application.jobSnapshot) === null || _d === void 0 ? void 0 : _d.companyName) || 'Unknown Company',
                            status: data.status,
                            progress: {
                                step: data.progress.step,
                                percentage: data.progress.percentage,
                                message: data.progress.message,
                                timestamp: data.progress.timestamp,
                            },
                            timestamp: new Date().toISOString(),
                        });
                        // Send notification for significant progress milestones
                        if (data.progress.percentage === 100 || data.status === 'completed') {
                            request.server.websocket.emitNotification(user.id, {
                                id: (0, crypto_1.randomUUID)(),
                                type: 'success',
                                title: 'Application Completed',
                                message: "Successfully applied to ".concat((_e = application.jobSnapshot) === null || _e === void 0 ? void 0 : _e.title, " at ").concat((_f = application.jobSnapshot) === null || _f === void 0 ? void 0 : _f.companyName),
                                applicationId: id,
                                jobId: application.jobPostingId,
                                timestamp: new Date().toISOString(),
                                duration: 8000,
                                actions: [
                                    {
                                        label: 'View Details',
                                        action: "navigate:/applications/".concat(id),
                                        variant: 'primary'
                                    }
                                ]
                            });
                        }
                        else if (data.status === 'failed') {
                            request.server.websocket.emitNotification(user.id, {
                                id: (0, crypto_1.randomUUID)(),
                                type: 'error',
                                title: 'Application Failed',
                                message: "Failed to apply to ".concat((_g = application.jobSnapshot) === null || _g === void 0 ? void 0 : _g.title, ": ").concat(data.progress.message),
                                applicationId: id,
                                jobId: application.jobPostingId,
                                timestamp: new Date().toISOString(),
                                duration: 10000,
                                actions: [
                                    {
                                        label: 'Retry',
                                        action: "retry:".concat(id),
                                        variant: 'primary'
                                    },
                                    {
                                        label: 'View Details',
                                        action: "navigate:/applications/".concat(id),
                                        variant: 'secondary'
                                    }
                                ]
                            });
                        }
                    }
                    return [2 /*return*/, reply.send({
                            success: true,
                            message: 'Progress update received and broadcasted',
                            data: {
                                applicationId: id,
                                status: data.status,
                                progress: data.progress.percentage,
                                timestamp: new Date().toISOString(),
                            },
                        })];
                case 3:
                    error_11 = _h.sent();
                    request.server.log.error('Progress update error:', error_11);
                    return [2 /*return*/, reply.code(500).send({
                            success: false,
                            error: 'Internal server error',
                            errorCode: 'INTERNAL_ERROR',
                        })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * GET /api/v1/queue/stats
 * Get queue statistics for user
 */
function getQueueStatsHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var user, _a, totalApplications, statusCounts, recentApplications, statusStats, automationServiceStats, error_12, stats, error_13;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    user = getAuthenticatedUser(request);
                    return [4 /*yield*/, Promise.all([
                            request.server.db.applicationQueue.count({
                                where: { userId: user.id },
                            }),
                            request.server.db.applicationQueue.groupBy({
                                by: ['status'],
                                where: { userId: user.id },
                                _count: { status: true },
                            }),
                            request.server.db.applicationQueue.findMany({
                                where: { userId: user.id },
                                orderBy: { createdAt: 'desc' },
                                take: 10,
                                include: {
                                    jobSnapshot: { select: { title: true, companyName: true } },
                                },
                            }),
                        ])];
                case 1:
                    _a = _b.sent(), totalApplications = _a[0], statusCounts = _a[1], recentApplications = _a[2];
                    statusStats = statusCounts.reduce(function (acc, item) {
                        acc[item.status.toLowerCase()] = item._count.status;
                        return acc;
                    }, {});
                    automationServiceStats = null;
                    if (!request.server.automationService) return [3 /*break*/, 5];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, request.server.automationService.getQueueStats()];
                case 3:
                    automationServiceStats = _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_12 = _b.sent();
                    request.server.log.warn('Failed to get automation service stats:', error_12);
                    return [3 /*break*/, 5];
                case 5:
                    stats = {
                        user: {
                            totalApplications: totalApplications,
                            statusBreakdown: {
                                pending: statusStats.pending || 0,
                                queued: statusStats.queued || 0,
                                processing: statusStats.processing || 0,
                                completed: statusStats.completed || 0,
                                failed: statusStats.failed || 0,
                                cancelled: statusStats.cancelled || 0,
                            },
                            recentApplications: recentApplications.map(function (app) {
                                var _a, _b;
                                return ({
                                    id: app.id,
                                    title: ((_a = app.jobSnapshot) === null || _a === void 0 ? void 0 : _a.title) || 'Unknown Job',
                                    company: ((_b = app.jobSnapshot) === null || _b === void 0 ? void 0 : _b.companyName) || 'Unknown Company',
                                    status: app.status.toLowerCase(),
                                    createdAt: app.createdAt,
                                });
                            }),
                        },
                        automation: automationServiceStats,
                    };
                    return [2 /*return*/, reply.send({
                            success: true,
                            data: stats,
                        })];
                case 6:
                    error_13 = _b.sent();
                    request.server.log.error('Get queue stats error:', error_13);
                    return [2 /*return*/, reply.code(500).send({
                            success: false,
                            error: 'Internal server error',
                            errorCode: 'INTERNAL_ERROR',
                        })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// =============================================================================
// ROUTE REGISTRATION
// =============================================================================
function registerQueueRoutes(fastify) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Add authentication hook for all queue routes
            fastify.addHook('preHandler', authenticateUser);
            // Queue job application
            fastify.post('/apply', {
                schema: {
                    summary: 'Queue job application when user applies to a job',
                    description: 'Creates a job application queue entry when user applies to a job',
                    tags: ['Queue'],
                    body: {
                        type: 'object',
                        properties: {
                            jobId: { type: 'string', format: 'uuid' },
                            resumeId: { type: 'string', format: 'uuid' },
                            coverLetter: { type: 'string', maxLength: 2000 },
                            priority: { type: 'integer', minimum: 1, maximum: 10, default: 5 },
                            customFields: { type: 'object', additionalProperties: { type: 'string' } },
                            metadata: {
                                type: 'object',
                                properties: {
                                    source: { type: 'string', enum: ['web', 'mobile', 'desktop'] },
                                    deviceId: { type: 'string' },
                                    userAgent: { type: 'string' },
                                    ipAddress: { type: 'string' }
                                },
                                required: ['source']
                            }
                        },
                        required: ['jobId', 'metadata']
                    },
                    response: {
                        201: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                data: { type: 'object' },
                                message: { type: 'string' },
                            },
                        },
                        400: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                error: { type: 'string' },
                                errorCode: { type: 'string' },
                            },
                        },
                    },
                },
            }, applyHandler);
            // Backward compatibility alias - TODO: Remove after client migration
            fastify.post('/swipe-right', {
                schema: {
                    summary: '[DEPRECATED] Use /apply instead',
                    description: 'Legacy endpoint - use /apply instead',
                    tags: ['Queue', 'Deprecated'],
                    deprecated: true,
                    body: {
                        type: 'object',
                        properties: {
                            jobId: { type: 'string', format: 'uuid' },
                            resumeId: { type: 'string', format: 'uuid' },
                            coverLetter: { type: 'string', maxLength: 2000 },
                            priority: { type: 'integer', minimum: 1, maximum: 10, default: 5 },
                            customFields: { type: 'object', additionalProperties: { type: 'string' } },
                            metadata: {
                                type: 'object',
                                properties: {
                                    source: { type: 'string', enum: ['web', 'mobile', 'desktop'] },
                                    deviceId: { type: 'string' },
                                    userAgent: { type: 'string' },
                                    ipAddress: { type: 'string' }
                                },
                                required: ['source']
                            }
                        },
                        required: ['jobId', 'metadata']
                    }
                }
            }, applyHandler);
            // Get user applications
            fastify.get('/applications', {
                schema: {
                    summary: 'Get user job applications from queue',
                    description: 'Retrieves paginated list of user job applications',
                    tags: ['Queue'],
                    querystring: {
                        type: 'object',
                        properties: {
                            limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
                            offset: { type: 'integer', minimum: 0, default: 0 },
                            status: {
                                type: 'string',
                                enum: ['pending', 'queued', 'processing', 'completed', 'failed', 'cancelled']
                            }
                        }
                    },
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                data: { type: 'object' },
                            },
                        },
                    },
                },
            }, getApplicationsHandler);
            // Get specific application
            fastify.get('/applications/:id', {
                schema: {
                    summary: 'Get specific job application details',
                    description: 'Retrieves detailed information about a specific job application',
                    tags: ['Queue'],
                    params: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                        },
                        required: ['id'],
                    },
                },
            }, getApplicationHandler);
            // Application actions
            fastify.post('/applications/:id/action', {
                schema: {
                    summary: 'Perform action on job application',
                    description: 'Cancel, retry, or prioritize a job application',
                    tags: ['Queue'],
                    params: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                        },
                        required: ['id'],
                    },
                    body: {
                        type: 'object',
                        properties: {
                            action: {
                                type: 'string',
                                enum: ['cancel', 'retry', 'prioritize']
                            },
                            reason: {
                                type: 'string',
                                maxLength: 500
                            }
                        },
                        required: ['action']
                    },
                },
            }, applicationActionHandler);
            // Queue statistics
            fastify.get('/stats', {
                schema: {
                    summary: 'Get queue statistics for user',
                    description: 'Retrieves queue statistics and recent application activity',
                    tags: ['Queue'],
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                data: { type: 'object' },
                            },
                        },
                    },
                },
            }, getQueueStatsHandler);
            // Progress updates from desktop app
            fastify.post('/applications/:id/progress', {
                schema: {
                    summary: 'Update application progress from desktop automation',
                    description: 'Receives progress updates from desktop app and broadcasts via WebSocket',
                    tags: ['Queue'],
                    params: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                        },
                        required: ['id'],
                    },
                    body: {
                        type: 'object',
                        properties: {
                            applicationId: { type: 'string', format: 'uuid' },
                            progress: {
                                type: 'object',
                                properties: {
                                    step: { type: 'string' },
                                    percentage: { type: 'number', minimum: 0, maximum: 100 },
                                    message: { type: 'string' },
                                    timestamp: { type: 'string', format: 'date-time' },
                                },
                                required: ['step', 'percentage', 'message', 'timestamp'],
                            },
                            status: {
                                type: 'string',
                                enum: ['starting', 'processing', 'completed', 'failed', 'cancelled']
                            },
                            executionId: { type: 'string' },
                        },
                        required: ['applicationId', 'progress', 'status'],
                    },
                },
            }, progressUpdateHandler);
            // Queue position endpoint
            fastify.get('/applications/:id/position', {
                schema: {
                    summary: 'Get queue position for application',
                    description: 'Returns the current position and estimated time for an application in the queue',
                    tags: ['Queue'],
                    params: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                        },
                        required: ['id'],
                    },
                },
            }, queuePositionHandler);
            // Queue position updates from desktop app
            fastify.post('/applications/:id/queue-position', {
                schema: {
                    summary: 'Update queue position from desktop app',
                    description: 'Receives queue position updates from desktop app and broadcasts via WebSocket',
                    tags: ['Queue'],
                    params: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                        },
                        required: ['id'],
                    },
                    body: {
                        type: 'object',
                        properties: {
                            position: { type: 'number', minimum: 0 },
                            estimatedTime: { type: 'string' },
                            timestamp: { type: 'string', format: 'date-time' },
                        },
                        required: ['position', 'estimatedTime', 'timestamp'],
                    },
                },
            }, queuePositionUpdateHandler);
            return [2 /*return*/];
        });
    });
}
exports.default = registerQueueRoutes;
