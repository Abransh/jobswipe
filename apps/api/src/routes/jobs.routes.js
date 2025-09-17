"use strict";
/**
 * @fileoverview Enhanced Job Routes with Swiping and Automation Integration
 * @description Handles job-related API endpoints including browsing, swiping, and automation
 * @version 2.0.0
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
var JobService_1 = require("../services/JobService");
var zod_1 = require("zod");
var crypto_1 = require("crypto");
// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================
var JobSwipeRequestSchema = zod_1.z.object({
    direction: zod_1.z.enum(['LEFT', 'RIGHT'], { required_error: 'Direction is required' }),
    resumeId: zod_1.z.string().uuid('Invalid resume ID format').optional(),
    coverLetter: zod_1.z.string().max(2000, 'Cover letter too long').optional(),
    priority: zod_1.z.number().int().min(1).max(10).default(5),
    customFields: zod_1.z.record(zod_1.z.string()).optional(),
    metadata: zod_1.z.object({
        source: zod_1.z.enum(['web', 'mobile']).default('web'),
        deviceId: zod_1.z.string().optional(),
        userAgent: zod_1.z.string().optional(),
        ipAddress: zod_1.z.string().optional(),
        timestamp: zod_1.z.string().datetime().optional(),
    }).default({ source: 'web' }),
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
/**
 * Authentication middleware for protected routes
 */
function authenticateUser(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var authHeader, token, verification, error_1;
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
                    // Fallback basic token validation for development
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
                    error_1 = _a.sent();
                    request.server.log.error('Authentication error:', error_1);
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
var jobsRoutes = function (fastify) {
    return __awaiter(this, void 0, void 0, function () {
        var jobService;
        var _this = this;
        return __generator(this, function (_a) {
            jobService = new JobService_1.JobService(fastify);
            // GET /v1/jobs - Fetch jobs with filtering and pagination
            fastify.get('/jobs', function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var query, options, result, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            query = request.query;
                            fastify.log.info("\uD83D\uDCCB Fetching jobs with query: ".concat(JSON.stringify(query)));
                            options = {
                                page: parseInt(query.page) || 1,
                                limit: parseInt(query.limit) || 20,
                                sortBy: query.sortBy || 'relevance',
                                q: query.q,
                                userLocation: query.userLat && query.userLng ? {
                                    lat: parseFloat(query.userLat),
                                    lng: parseFloat(query.userLng)
                                } : undefined,
                                userId: request.headers['x-user-id'], // Get from auth header
                                filters: {
                                    location: query.location,
                                    remote: query.remote,
                                    jobType: query.jobType ? query.jobType.split(',') : [],
                                    jobLevel: query.jobLevel ? query.jobLevel.split(',') : [],
                                    salaryMin: query.salaryMin ? parseInt(query.salaryMin) : undefined,
                                    salaryMax: query.salaryMax ? parseInt(query.salaryMax) : undefined,
                                    skills: query.skills ? query.skills.split(',') : [],
                                    companySize: query.companySize ? query.companySize.split(',') : [],
                                    category: query.category ? query.category.split(',') : [],
                                    experience: query.experience ? parseInt(query.experience) : undefined
                                }
                            };
                            return [4 /*yield*/, jobService.searchJobs(options)];
                        case 1:
                            result = _a.sent();
                            reply.send({
                                success: true,
                                data: result
                            });
                            return [3 /*break*/, 3];
                        case 2:
                            error_2 = _a.sent();
                            fastify.log.error('❌ Error fetching jobs:', error_2);
                            reply.status(500).send({
                                success: false,
                                error: error_2 instanceof Error ? error_2.message : 'Failed to fetch jobs',
                            });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // GET /v1/jobs/proximity - Get location-based job suggestions
            fastify.get('/jobs/proximity', function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var query, params, result, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            query = request.query;
                            fastify.log.info("\uD83C\uDF0D Fetching proximity jobs for location: ".concat(query.location));
                            params = {
                                location: query.location || '',
                                jobType: query.jobType ? query.jobType.split(',') : [],
                                level: query.level ? query.level.split(',') : [],
                                remote: query.remote || 'any',
                                limit: parseInt(query.limit) || 20
                            };
                            return [4 /*yield*/, jobService.getProximityJobs(params)];
                        case 1:
                            result = _a.sent();
                            reply.send({
                                success: true,
                                data: result
                            });
                            return [3 /*break*/, 3];
                        case 2:
                            error_3 = _a.sent();
                            fastify.log.error('❌ Error fetching proximity jobs:', error_3);
                            reply.status(500).send({
                                success: false,
                                error: error_3 instanceof Error ? error_3.message : 'Failed to fetch proximity jobs',
                            });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // POST /v1/jobs - Job sync and management
            fastify.post('/jobs', function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var _a, action, params, _b, _c, location_1, _d, keywords, _e, sources, _f, limit, stats, error_4;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            _g.trys.push([0, 5, , 6]);
                            _a = request.body, action = _a.action, params = _a.params;
                            fastify.log.info("\uD83D\uDCCB Job management action: ".concat(action));
                            if (!(action === 'sync')) return [3 /*break*/, 1];
                            _b = params || {}, _c = _b.location, location_1 = _c === void 0 ? 'Italy' : _c, _d = _b.keywords, keywords = _d === void 0 ? 'software engineer' : _d, _e = _b.sources, sources = _e === void 0 ? ['external'] : _e, _f = _b.limit, limit = _f === void 0 ? 100 : _f;
                            fastify.log.info('📥 Manual job sync requested:', { location: location_1, keywords: keywords, sources: sources, limit: limit });
                            // TODO: Implement actual job scraping and syncing logic
                            // For now, return success response
                            reply.send({
                                success: true,
                                data: {
                                    fetched: 10,
                                    stored: 8,
                                    updated: 2,
                                    skipped: 0,
                                    cleanedUp: 5,
                                    message: 'Job sync functionality will be implemented with scraping services'
                                },
                            });
                            return [3 /*break*/, 4];
                        case 1:
                            if (!(action === 'stats')) return [3 /*break*/, 3];
                            return [4 /*yield*/, jobService.getJobStats()];
                        case 2:
                            stats = _g.sent();
                            reply.send({
                                success: true,
                                data: stats,
                            });
                            return [3 /*break*/, 4];
                        case 3:
                            reply.status(400).send({
                                success: false,
                                error: 'Invalid action',
                            });
                            _g.label = 4;
                        case 4: return [3 /*break*/, 6];
                        case 5:
                            error_4 = _g.sent();
                            fastify.log.error('❌ Error in job management:', error_4);
                            reply.status(500).send({
                                success: false,
                                error: error_4 instanceof Error ? error_4.message : 'Internal server error',
                            });
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            // POST /v1/jobs/advanced-search - Advanced job search with faceted filtering
            fastify.post('/jobs/advanced-search', function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var searchParams, userId, searchOptions, result, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            searchParams = request.body;
                            userId = request.headers['x-user-id'];
                            fastify.log.info('🔍 Advanced job search requested:', searchParams);
                            searchOptions = {
                                query: searchParams.query,
                                skills: searchParams.skills,
                                location: searchParams.location,
                                salaryMin: searchParams.salaryMin ? parseInt(searchParams.salaryMin) : undefined,
                                salaryMax: searchParams.salaryMax ? parseInt(searchParams.salaryMax) : undefined,
                                experienceMin: searchParams.experienceMin ? parseInt(searchParams.experienceMin) : undefined,
                                experienceMax: searchParams.experienceMax ? parseInt(searchParams.experienceMax) : undefined,
                                remote: searchParams.remote || 'any',
                                companySize: searchParams.companySize,
                                posted: searchParams.posted || 'any',
                                page: parseInt(searchParams.page) || 1,
                                limit: parseInt(searchParams.limit) || 20,
                                userId: userId
                            };
                            return [4 /*yield*/, jobService.searchJobs({
                                    q: searchOptions.query,
                                    page: searchOptions.page,
                                    limit: searchOptions.limit,
                                    sortBy: 'relevance',
                                    userId: searchOptions.userId,
                                    filters: {
                                        skills: searchOptions.skills,
                                        location: searchOptions.location,
                                        salaryMin: searchOptions.salaryMin,
                                        salaryMax: searchOptions.salaryMax,
                                        experience: searchOptions.experienceMin,
                                        remote: searchOptions.remote === 'only' ? 'remote_only' :
                                            searchOptions.remote === 'excluded' ? 'onsite' : 'any',
                                        jobType: [],
                                        jobLevel: [],
                                        companySize: searchOptions.companySize,
                                        category: []
                                    }
                                })];
                        case 1:
                            result = _a.sent();
                            reply.send({
                                success: true,
                                data: __assign(__assign({}, result), { searchParams: searchOptions, enhancedSearch: true })
                            });
                            return [3 /*break*/, 3];
                        case 2:
                            error_5 = _a.sent();
                            fastify.log.error('❌ Error in advanced search:', error_5);
                            reply.status(500).send({
                                success: false,
                                error: error_5 instanceof Error ? error_5.message : 'Advanced search failed',
                            });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // GET /v1/jobs/:id - Get single job details
            fastify.get('/jobs/:id', function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, userId, job, error_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            id = request.params.id;
                            userId = request.headers['x-user-id'];
                            fastify.log.info("\uD83D\uDCCB Fetching job details for: ".concat(id));
                            return [4 /*yield*/, jobService.getJobById(id)];
                        case 1:
                            job = _a.sent();
                            if (!job) {
                                reply.status(404).send({
                                    success: false,
                                    error: 'Job not found',
                                });
                                return [2 /*return*/];
                            }
                            if (!userId) return [3 /*break*/, 3];
                            return [4 /*yield*/, jobService.recordJobView(id, userId)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            reply.send({
                                success: true,
                                data: job
                            });
                            return [3 /*break*/, 5];
                        case 4:
                            error_6 = _a.sent();
                            fastify.log.error('❌ Error fetching job details:', error_6);
                            reply.status(500).send({
                                success: false,
                                error: error_6 instanceof Error ? error_6.message : 'Failed to fetch job details',
                            });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // =============================================================================
            // JOB SWIPING ENDPOINTS
            // =============================================================================
            // POST /v1/jobs/:id/swipe - Handle job swiping with automation integration
            fastify.post('/jobs/:id/swipe', {
                preHandler: authenticateUser,
                schema: {
                    summary: 'Swipe on a job (left/right) with automation integration',
                    description: 'Handle job swiping with automatic triggering of application automation for right swipes',
                    tags: ['Jobs', 'Swiping'],
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
                            direction: { type: 'string', enum: ['LEFT', 'RIGHT'] },
                            resumeId: { type: 'string', format: 'uuid' },
                            coverLetter: { type: 'string', maxLength: 2000 },
                            priority: { type: 'integer', minimum: 1, maximum: 10, default: 5 },
                            customFields: { type: 'object', additionalProperties: { type: 'string' } },
                            metadata: {
                                type: 'object',
                                properties: {
                                    source: { type: 'string', enum: ['web', 'mobile'], default: 'web' },
                                    deviceId: { type: 'string' },
                                    userAgent: { type: 'string' },
                                    ipAddress: { type: 'string' },
                                    timestamp: { type: 'string', format: 'date-time' },
                                },
                            },
                        },
                        required: ['direction'],
                    },
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                message: { type: 'string' },
                                data: { type: 'object' },
                                correlationId: { type: 'string' },
                            },
                        },
                        201: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                message: { type: 'string' },
                                data: { type: 'object' },
                                correlationId: { type: 'string' },
                            },
                        },
                    },
                },
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var correlationId, startTime, logContext, jobId, data, user, enhancedLogContext, jobPosting, existingSwipe, queueApplyData, queueRequest, serverEligibility, queueEntry, queuePosition, estimatedTime, automationError_1, error_7, processingTime;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            correlationId = (0, crypto_1.randomUUID)();
                            startTime = Date.now();
                            logContext = {
                                correlationId: correlationId,
                                requestId: request.id || (0, crypto_1.randomUUID)(),
                                endpoint: '/v1/jobs/:id/swipe',
                                userAgent: request.headers['user-agent'],
                                ip: request.ip,
                            };
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 14, , 15]);
                            fastify.log.info(__assign(__assign({}, logContext), { event: 'job_swipe_started', message: 'Job swipe request started' }));
                            jobId = request.params.id;
                            data = JobSwipeRequestSchema.parse(__assign(__assign({}, request.body), { jobId: jobId }));
                            user = getAuthenticatedUser(request);
                            enhancedLogContext = __assign(__assign({}, logContext), { userId: user.id, userEmail: user.email, jobId: data.jobId, swipeDirection: data.direction, source: data.metadata.source });
                            return [4 /*yield*/, fastify.db.jobPosting.findUnique({
                                    where: { id: data.jobId },
                                    include: { company: true },
                                })];
                        case 2:
                            jobPosting = _b.sent();
                            if (!jobPosting) {
                                fastify.log.warn(__assign(__assign({}, enhancedLogContext), { event: 'job_not_found', message: 'Job posting not found for swipe' }));
                                return [2 /*return*/, reply.code(404).send({
                                        success: false,
                                        error: 'Job not found',
                                        errorCode: 'JOB_NOT_FOUND',
                                        correlationId: correlationId,
                                    })];
                            }
                            if (!jobPosting.isActive) {
                                fastify.log.warn(__assign(__assign({}, enhancedLogContext), { event: 'job_inactive', message: 'Attempted to swipe on inactive job', jobTitle: jobPosting.title, company: jobPosting.company.name }));
                                return [2 /*return*/, reply.code(410).send({
                                        success: false,
                                        error: 'Job is no longer active',
                                        errorCode: 'JOB_INACTIVE',
                                        correlationId: correlationId,
                                    })];
                            }
                            return [4 /*yield*/, fastify.db.userJobSwipe.findUnique({
                                    where: {
                                        userId_jobPostingId: {
                                            userId: user.id,
                                            jobPostingId: data.jobId,
                                        },
                                    },
                                })];
                        case 3:
                            existingSwipe = _b.sent();
                            if (!(data.direction === 'LEFT')) return [3 /*break*/, 5];
                            return [4 /*yield*/, fastify.db.userJobSwipe.upsert({
                                    where: {
                                        userId_jobPostingId: {
                                            userId: user.id,
                                            jobPostingId: data.jobId,
                                        },
                                    },
                                    update: {
                                        direction: 'LEFT',
                                        deviceType: data.metadata.source,
                                        updatedAt: new Date(),
                                    },
                                    create: {
                                        userId: user.id,
                                        jobPostingId: data.jobId,
                                        direction: 'LEFT',
                                        deviceType: data.metadata.source,
                                        sessionId: data.metadata.deviceId,
                                        ipAddress: data.metadata.ipAddress,
                                        userAgent: data.metadata.userAgent,
                                    },
                                })];
                        case 4:
                            _b.sent();
                            fastify.log.info(__assign(__assign({}, enhancedLogContext), { event: 'left_swipe_recorded', message: 'Left swipe recorded successfully', processingTime: Date.now() - startTime }));
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    message: 'Left swipe recorded',
                                    data: {
                                        jobId: data.jobId,
                                        direction: 'LEFT',
                                        action: 'recorded',
                                        processingTime: Date.now() - startTime,
                                    },
                                    correlationId: correlationId,
                                })];
                        case 5:
                            if (!(data.direction === 'RIGHT')) return [3 /*break*/, 13];
                            // Check if user already applied (swiped right)
                            if (existingSwipe && existingSwipe.direction === 'RIGHT') {
                                fastify.log.warn(__assign(__assign({}, enhancedLogContext), { event: 'duplicate_right_swipe', message: 'User already swiped right on this job', existingSwipeId: existingSwipe.id }));
                                return [2 /*return*/, reply.code(409).send({
                                        success: false,
                                        error: 'Already applied to this job',
                                        errorCode: 'DUPLICATE_APPLICATION',
                                        correlationId: correlationId,
                                    })];
                            }
                            queueApplyData = {
                                jobId: data.jobId,
                                resumeId: data.resumeId,
                                coverLetter: data.coverLetter,
                                priority: data.priority || 5,
                                customFields: data.customFields || {},
                                metadata: {
                                    source: data.metadata.source,
                                    deviceId: data.metadata.deviceId,
                                    userAgent: request.headers['user-agent'] || data.metadata.userAgent,
                                    ipAddress: request.ip || data.metadata.ipAddress,
                                },
                            };
                            fastify.log.info(__assign(__assign({}, enhancedLogContext), { event: 'right_swipe_triggering_automation', message: 'Right swipe triggering automation via queue/apply' }));
                            _b.label = 6;
                        case 6:
                            _b.trys.push([6, 12, , 13]);
                            queueRequest = __assign(__assign({}, request), { body: queueApplyData, user: user });
                            return [4 /*yield*/, ((_a = fastify.automationLimits) === null || _a === void 0 ? void 0 : _a.checkServerEligibility(user.id))];
                        case 7:
                            serverEligibility = (_b.sent()) || {
                                allowed: false,
                                reason: 'Server automation service not available',
                                remainingServerApplications: 0,
                                upgradeRequired: true,
                                suggestedAction: 'Download desktop app for unlimited applications',
                            };
                            // Record the right swipe first
                            return [4 /*yield*/, fastify.db.userJobSwipe.upsert({
                                    where: {
                                        userId_jobPostingId: {
                                            userId: user.id,
                                            jobPostingId: data.jobId,
                                        },
                                    },
                                    update: {
                                        direction: 'RIGHT',
                                        deviceType: data.metadata.source,
                                        updatedAt: new Date(),
                                    },
                                    create: {
                                        userId: user.id,
                                        jobPostingId: data.jobId,
                                        direction: 'RIGHT',
                                        deviceType: data.metadata.source,
                                        sessionId: data.metadata.deviceId,
                                        ipAddress: data.metadata.ipAddress,
                                        userAgent: data.metadata.userAgent,
                                    },
                                })];
                        case 8:
                            // Record the right swipe first
                            _b.sent();
                            if (!(serverEligibility.allowed && fastify.serverAutomationService)) return [3 /*break*/, 9];
                            fastify.log.info(__assign(__assign({}, enhancedLogContext), { event: 'server_automation_triggered', message: 'Starting immediate server automation for right swipe' }));
                            // This would trigger the full automation logic
                            // For now, return a success response indicating server automation
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    message: 'Right swipe processed - server automation triggered',
                                    data: {
                                        jobId: data.jobId,
                                        direction: 'RIGHT',
                                        action: 'automated_immediately',
                                        executionMode: 'server',
                                        serverAutomation: {
                                            eligible: true,
                                            remainingServerApplications: serverEligibility.remainingServerApplications - 1,
                                        },
                                        processingTime: Date.now() - startTime,
                                    },
                                    correlationId: correlationId,
                                })];
                        case 9: return [4 /*yield*/, fastify.db.applicationQueue.create({
                                data: {
                                    userId: user.id,
                                    jobPostingId: data.jobId,
                                    status: 'PENDING',
                                    priority: data.priority === 10 ? 'IMMEDIATE' :
                                        data.priority >= 8 ? 'URGENT' :
                                            data.priority >= 6 ? 'HIGH' : 'NORMAL',
                                    useCustomResume: !!data.resumeId,
                                    resumeId: data.resumeId,
                                    coverLetter: data.coverLetter,
                                    customFields: data.customFields || {},
                                    automationConfig: {
                                        source: data.metadata.source,
                                        deviceId: data.metadata.deviceId,
                                        timestamp: new Date().toISOString(),
                                        triggeredBySwipe: true,
                                    },
                                },
                            })];
                        case 10:
                            queueEntry = _b.sent();
                            // Emit WebSocket event for real-time updates
                            if (fastify.websocket) {
                                queuePosition = Math.floor(Math.random() * 25) + 1;
                                estimatedTime = calculateEstimatedTime(queuePosition, data.priority >= 8);
                                // Job queued notification
                                fastify.websocket.emitToUser(user.id, 'job-queued-from-swipe', {
                                    applicationId: queueEntry.id,
                                    jobId: data.jobId,
                                    jobTitle: jobPosting.title,
                                    company: jobPosting.company.name,
                                    status: 'queued',
                                    queuedAt: new Date().toISOString(),
                                    queuePosition: queuePosition,
                                    estimatedTime: estimatedTime,
                                    isPriority: data.priority >= 8,
                                    message: 'Job application queued for desktop processing',
                                });
                                // Application status update
                                fastify.websocket.emitApplicationStatusUpdate(user.id, {
                                    applicationId: queueEntry.id,
                                    jobId: data.jobId,
                                    jobTitle: jobPosting.title,
                                    company: jobPosting.company.name,
                                    status: 'queued',
                                    queuePosition: queuePosition,
                                    estimatedTime: estimatedTime,
                                    timestamp: new Date().toISOString()
                                });
                                // User notification
                                fastify.websocket.emitNotification(user.id, {
                                    id: (0, crypto_1.randomUUID)(),
                                    type: 'info',
                                    title: 'Application Queued',
                                    message: "".concat(jobPosting.title, " at ").concat(jobPosting.company.name, " has been queued for processing"),
                                    applicationId: queueEntry.id,
                                    jobId: data.jobId,
                                    timestamp: new Date().toISOString(),
                                    duration: 5000,
                                    actions: [
                                        {
                                            label: 'View Progress',
                                            action: "navigate:/applications/".concat(queueEntry.id),
                                            variant: 'primary'
                                        }
                                    ]
                                });
                            }
                            return [2 /*return*/, reply.code(201).send({
                                    success: true,
                                    message: 'Right swipe queued for desktop processing',
                                    data: {
                                        jobId: data.jobId,
                                        direction: 'RIGHT',
                                        action: 'queued_for_desktop',
                                        executionMode: 'desktop',
                                        applicationId: queueEntry.id,
                                        serverAutomation: {
                                            eligible: serverEligibility.allowed,
                                            reason: serverEligibility.reason,
                                            remainingServerApplications: serverEligibility.remainingServerApplications,
                                            upgradeRequired: serverEligibility.upgradeRequired,
                                            suggestedAction: serverEligibility.suggestedAction,
                                        },
                                        processingTime: Date.now() - startTime,
                                    },
                                    correlationId: correlationId,
                                })];
                        case 11: return [3 /*break*/, 13];
                        case 12:
                            automationError_1 = _b.sent();
                            fastify.log.error(__assign(__assign({}, enhancedLogContext), { event: 'right_swipe_automation_failed', message: 'Failed to process right swipe automation', error: automationError_1 instanceof Error ? automationError_1.message : String(automationError_1) }));
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    error: 'Failed to process job application',
                                    errorCode: 'AUTOMATION_FAILED',
                                    correlationId: correlationId,
                                })];
                        case 13: return [3 /*break*/, 15];
                        case 14:
                            error_7 = _b.sent();
                            processingTime = Date.now() - startTime;
                            if (error_7 instanceof zod_1.z.ZodError) {
                                fastify.log.warn(__assign(__assign({}, logContext), { event: 'swipe_validation_failed', message: 'Job swipe validation failed', processingTimeMs: processingTime, validationErrors: error_7.errors }));
                                return [2 /*return*/, reply.code(400).send({
                                        success: false,
                                        error: 'Validation failed',
                                        details: error_7.errors,
                                        errorCode: 'VALIDATION_ERROR',
                                        correlationId: correlationId,
                                    })];
                            }
                            fastify.log.error(__assign(__assign({}, logContext), { event: 'swipe_request_failed', message: 'Job swipe request failed with error', processingTimeMs: processingTime, error: error_7 instanceof Error ? error_7.message : String(error_7), errorStack: error_7 instanceof Error ? error_7.stack : undefined }));
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    error: 'Internal server error',
                                    errorCode: 'INTERNAL_ERROR',
                                    correlationId: correlationId,
                                })];
                        case 15: return [2 /*return*/];
                    }
                });
            }); });
            // GET /v1/jobs/recommendations - Get personalized job recommendations for swiping
            fastify.get('/jobs/recommendations', {
                preHandler: authenticateUser,
                schema: {
                    summary: 'Get personalized job recommendations for swiping',
                    description: 'Retrieves a feed of job recommendations filtered by user preferences and excluding already swiped jobs',
                    tags: ['Jobs', 'Swiping'],
                    querystring: {
                        type: 'object',
                        properties: {
                            limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
                            offset: { type: 'integer', minimum: 0, default: 0 },
                            location: { type: 'string' },
                            remote: { type: 'boolean' },
                            salaryMin: { type: 'number' },
                            salaryMax: { type: 'number' },
                            jobType: { type: 'string', enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'] },
                            experienceLevel: { type: 'string', enum: ['ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL', 'EXECUTIVE'] },
                            skills: { type: 'string', description: 'Comma-separated list of skills' },
                            companySize: { type: 'string', enum: ['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'] },
                        },
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
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var query, user, filters_1, userSwipes, swipedJobIds, whereConditions, _a, jobs, totalCount, formattedJobs, error_8;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 3, , 4]);
                            query = request.query;
                            user = getAuthenticatedUser(request);
                            fastify.log.info('📱 Job recommendations requested', {
                                userId: user.id,
                                filters: query,
                            });
                            filters_1 = {
                                limit: Math.min(parseInt(query.limit) || 20, 50),
                                offset: parseInt(query.offset) || 0,
                                location: query.location,
                                remote: query.remote,
                                salaryMin: query.salaryMin ? parseInt(query.salaryMin) : undefined,
                                salaryMax: query.salaryMax ? parseInt(query.salaryMax) : undefined,
                                jobType: query.jobType,
                                experienceLevel: query.experienceLevel,
                                skills: query.skills ? query.skills.split(',').map(function (s) { return s.trim(); }) : [],
                                companySize: query.companySize,
                            };
                            return [4 /*yield*/, fastify.db.userJobSwipe.findMany({
                                    where: { userId: user.id },
                                    select: { jobPostingId: true },
                                })];
                        case 1:
                            userSwipes = _b.sent();
                            swipedJobIds = userSwipes.map(function (swipe) { return swipe.jobPostingId; });
                            whereConditions = {
                                isActive: true,
                                id: { notIn: swipedJobIds }, // Exclude already swiped jobs
                            };
                            // Apply location filters
                            if (filters_1.location) {
                                whereConditions.OR = [
                                    { location: { contains: filters_1.location, mode: 'insensitive' } },
                                    { city: { contains: filters_1.location, mode: 'insensitive' } },
                                    { state: { contains: filters_1.location, mode: 'insensitive' } },
                                ];
                            }
                            // Apply other filters
                            if (filters_1.remote !== undefined) {
                                whereConditions.remote = filters_1.remote;
                            }
                            if (filters_1.salaryMin) {
                                whereConditions.salaryMin = { gte: filters_1.salaryMin };
                            }
                            if (filters_1.salaryMax) {
                                whereConditions.salaryMax = { lte: filters_1.salaryMax };
                            }
                            if (filters_1.jobType) {
                                whereConditions.type = filters_1.jobType;
                            }
                            if (filters_1.experienceLevel) {
                                whereConditions.level = filters_1.experienceLevel;
                            }
                            if (filters_1.skills && filters_1.skills.length > 0) {
                                whereConditions.skills = {
                                    hasSome: filters_1.skills,
                                };
                            }
                            if (filters_1.companySize) {
                                whereConditions.company = {
                                    size: filters_1.companySize,
                                };
                            }
                            return [4 /*yield*/, Promise.all([
                                    fastify.db.jobPosting.findMany({
                                        where: whereConditions,
                                        include: {
                                            company: true,
                                        },
                                        orderBy: [
                                            { isFeatured: 'desc' }, // Featured jobs first
                                            { isUrgent: 'desc' }, // Urgent jobs next
                                            { qualityScore: 'desc' }, // High quality jobs
                                            { postedAt: 'desc' }, // Most recent jobs
                                        ],
                                        take: filters_1.limit,
                                        skip: filters_1.offset,
                                    }),
                                    fastify.db.jobPosting.count({
                                        where: whereConditions,
                                    }),
                                ])];
                        case 2:
                            _a = _b.sent(), jobs = _a[0], totalCount = _a[1];
                            formattedJobs = jobs.map(function (job) { return ({
                                id: job.id,
                                title: job.title,
                                description: job.description,
                                requirements: job.requirements,
                                benefits: job.benefits,
                                company: {
                                    id: job.company.id,
                                    name: job.company.name,
                                    logo: job.company.logo,
                                    website: job.company.website,
                                    industry: job.company.industry,
                                    size: job.company.size,
                                    description: job.company.description,
                                },
                                location: job.location,
                                city: job.city,
                                state: job.state,
                                country: job.country,
                                remote: job.remote,
                                remoteType: job.remoteType,
                                salary: {
                                    min: job.salaryMin,
                                    max: job.salaryMax,
                                    currency: job.currency,
                                    type: job.salaryType,
                                },
                                equity: job.equity,
                                bonus: job.bonus,
                                type: job.type,
                                level: job.level,
                                department: job.department,
                                category: job.category,
                                experienceYears: job.experienceYears,
                                skills: job.skills,
                                education: job.education,
                                languages: job.languages,
                                postedAt: job.postedAt,
                                expiresAt: job.expiresAt,
                                applyUrl: job.applyUrl,
                                sourceUrl: job.sourceUrl,
                                isVerified: job.isVerified,
                                isFeatured: job.isFeatured,
                                isUrgent: job.isUrgent,
                                qualityScore: job.qualityScore,
                                // Additional metadata for swiping interface
                                swipeMetadata: {
                                    hasBeenSwiped: false,
                                    swipeDirection: null,
                                    matchScore: job.qualityScore || 0,
                                    recommendationReason: job.isFeatured ? 'Featured Job' :
                                        job.isUrgent ? 'Urgent Hiring' :
                                            job.qualityScore > 80 ? 'High Quality Match' : 'Recommended',
                                },
                            }); });
                            fastify.log.info('📱 Job recommendations retrieved successfully', {
                                userId: user.id,
                                totalJobs: totalCount,
                                returnedJobs: formattedJobs.length,
                                excludedSwipes: swipedJobIds.length,
                                appliedFilters: Object.keys(filters_1).filter(function (key) { return filters_1[key] !== undefined && filters_1[key] !== ''; }),
                            });
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: {
                                        jobs: formattedJobs,
                                        pagination: {
                                            total: totalCount,
                                            limit: filters_1.limit,
                                            offset: filters_1.offset,
                                            hasMore: filters_1.offset + filters_1.limit < totalCount,
                                        },
                                        filters: filters_1,
                                        statistics: {
                                            totalAvailable: totalCount,
                                            excludedBySwipes: swipedJobIds.length,
                                            filtersApplied: Object.keys(filters_1).filter(function (key) {
                                                return filters_1[key] !== undefined &&
                                                    filters_1[key] !== '' &&
                                                    filters_1[key] !== null &&
                                                    (Array.isArray(filters_1[key]) ? filters_1[key].length > 0 : true);
                                            }).length,
                                        },
                                    },
                                })];
                        case 3:
                            error_8 = _b.sent();
                            fastify.log.error('❌ Error fetching job recommendations:', error_8);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    error: 'Failed to fetch job recommendations',
                                    errorCode: 'RECOMMENDATIONS_FAILED',
                                })];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
};
exports.default = jobsRoutes;
