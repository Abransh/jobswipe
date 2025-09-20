"use strict";
/**
 * @fileoverview Queue Management Plugin for Fastify
 * @description Enterprise-grade job application queue system using Redis + BullMQ
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Production-level queue processing with comprehensive error handling
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
exports.QueueService = void 0;
var fastify_plugin_1 = require("fastify-plugin");
var bullmq_1 = require("bullmq");
var ioredis_1 = require("ioredis");
var database_1 = require("@jobswipe/database");
// =============================================================================
// QUEUE SERVICE CLASS
// =============================================================================
var QueueService = /** @class */ (function () {
    function QueueService(config) {
        this.isInitialized = false;
        this.config = config;
        this.redisConnection = new ioredis_1.Redis(__assign(__assign({}, config.redis), { maxRetriesPerRequest: null, lazyConnect: true }));
        // Initialize queues
        this.applicationQueue = new bullmq_1.Queue(config.queues.applications.name, {
            connection: this.redisConnection,
            defaultJobOptions: config.queues.applications.defaultJobOptions,
        });
        this.priorityQueue = new bullmq_1.Queue(config.queues.priority.name, {
            connection: this.redisConnection,
            defaultJobOptions: config.queues.priority.defaultJobOptions,
        });
        // Queue events for monitoring
        this.queueEvents = new bullmq_1.QueueEvents(config.queues.applications.name, {
            connection: this.redisConnection,
        });
    }
    /**
     * Set WebSocket service for real-time updates
     */
    QueueService.prototype.setWebSocketService = function (websocketService) {
        this.websocketService = websocketService;
        this.setupQueueEventListeners();
    };
    /**
     * Setup queue event listeners for WebSocket notifications
     */
    QueueService.prototype.setupQueueEventListeners = function () {
        var _this = this;
        if (!this.websocketService)
            return;
        // Listen for job events and emit WebSocket updates
        this.queueEvents.on('active', function (_a) {
            var jobId = _a.jobId, prev = _a.prev;
            _this.emitJobUpdate(jobId, 'job-claimed', { previousStatus: prev });
        });
        this.queueEvents.on('progress', function (_a) {
            var jobId = _a.jobId, data = _a.data;
            _this.emitJobUpdate(jobId, 'processing-progress', { progress: data });
        });
        this.queueEvents.on('completed', function (_a) {
            var jobId = _a.jobId, returnvalue = _a.returnvalue;
            _this.emitJobUpdate(jobId, 'processing-completed', {
                success: true,
                result: returnvalue
            });
        });
        this.queueEvents.on('failed', function (_a) {
            var jobId = _a.jobId, failedReason = _a.failedReason;
            _this.emitJobUpdate(jobId, 'processing-failed', {
                success: false,
                errorMessage: failedReason
            });
        });
        this.queueEvents.on('stalled', function (_a) {
            var jobId = _a.jobId;
            _this.emitJobUpdate(jobId, 'processing-progress', {
                message: 'Job processing stalled, retrying...'
            });
        });
        console.log('✅ Queue event listeners setup for WebSocket notifications');
    };
    /**
     * Emit job update via WebSocket
     */
    QueueService.prototype.emitJobUpdate = function (jobId, eventType, data) {
        return __awaiter(this, void 0, void 0, function () {
            var job, _a, userId, applicationJobId, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.websocketService)
                            return [2 /*return*/];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, this.applicationQueue.getJob(jobId)];
                    case 2:
                        job = _b.sent();
                        if (!!job) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.priorityQueue.getJob(jobId)];
                    case 3:
                        job = _b.sent();
                        _b.label = 4;
                    case 4:
                        if (job && job.data) {
                            _a = job.data, userId = _a.userId, applicationJobId = _a.jobId;
                            // Emit to the specific user
                            this.websocketService.emitToUser(userId, eventType, __assign({ applicationId: applicationJobId, jobId: jobId }, data));
                            // Emit to application subscribers
                            this.websocketService.emitToApplication(applicationJobId, eventType, __assign({ jobId: jobId }, data));
                            console.log("\uD83D\uDD14 Emitted ".concat(eventType, " for job ").concat(jobId, " to user ").concat(userId));
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _b.sent();
                        console.error('Failed to emit job update:', error_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initialize queue service
     */
    QueueService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isInitialized)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        // Test Redis connection
                        return [4 /*yield*/, this.redisConnection.ping()];
                    case 2:
                        // Test Redis connection
                        _a.sent();
                        // Wait for queues to be ready
                        return [4 /*yield*/, Promise.all([
                                this.applicationQueue.waitUntilReady(),
                                this.priorityQueue.waitUntilReady(),
                            ])];
                    case 3:
                        // Wait for queues to be ready
                        _a.sent();
                        // Initialize workers
                        return [4 /*yield*/, this.initializeWorkers()];
                    case 4:
                        // Initialize workers
                        _a.sent();
                        this.isInitialized = true;
                        console.log('✅ Queue service initialized successfully');
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _a.sent();
                        console.error('❌ Failed to initialize queue service:', error_2);
                        throw error_2;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initialize BullMQ workers for processing job applications
     */
    QueueService.prototype.initializeWorkers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    // Create worker for processing job applications
                    this.worker = new bullmq_1.Worker(this.config.queues.applications.name, function (job) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.processJobApplication(job)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); }, {
                        connection: this.redisConnection,
                        concurrency: this.config.workers.concurrency,
                        maxStalledCount: this.config.workers.maxStalledCount,
                        stalledInterval: this.config.workers.stalledInterval,
                        removeOnComplete: { count: this.config.workers.removeOnComplete },
                        removeOnFail: { count: this.config.workers.removeOnFail },
                    });
                    // Setup worker event listeners
                    this.setupWorkerEventListeners();
                    console.log('✅ BullMQ workers initialized successfully');
                }
                catch (error) {
                    console.error('❌ Failed to initialize workers:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Setup worker event listeners for monitoring and logging
     */
    QueueService.prototype.setupWorkerEventListeners = function () {
        if (!this.worker)
            return;
        this.worker.on('ready', function () {
            console.log('🔄 Worker is ready and waiting for jobs');
        });
        this.worker.on('active', function (job) {
            console.log("\uD83C\uDFC3 Worker started processing job ".concat(job.id));
        });
        this.worker.on('completed', function (job, result) {
            console.log("\u2705 Worker completed job ".concat(job.id, ":"), result);
        });
        this.worker.on('failed', function (job, err) {
            console.error("\u274C Worker failed job ".concat(job === null || job === void 0 ? void 0 : job.id, ":"), err);
        });
        this.worker.on('stalled', function (jobId) {
            console.warn("\u26A0\uFE0F Worker job ".concat(jobId, " stalled"));
        });
        this.worker.on('error', function (err) {
            console.error('❌ Worker error:', err);
        });
    };
    /**
     * Process job application - main worker logic
     */
    QueueService.prototype.processJobApplication = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, userId, jobId, applicationId, companyAutomation, userProfile, jobData, options, processingTime_1, success, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = job.data, userId = _a.userId, jobId = _a.jobId, applicationId = _a.applicationId, companyAutomation = _a.companyAutomation, userProfile = _a.userProfile, jobData = _a.jobData, options = _a.options;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 7, , 8]);
                        // Update progress
                        return [4 /*yield*/, job.updateProgress(10)];
                    case 2:
                        // Update progress
                        _b.sent();
                        console.log("\uD83E\uDD16 Processing job application ".concat(applicationId, " for user ").concat(userId));
                        // Simulate automation processing (replace with actual automation service calls)
                        return [4 /*yield*/, job.updateProgress(30)];
                    case 3:
                        // Simulate automation processing (replace with actual automation service calls)
                        _b.sent();
                        processingTime_1 = Math.random() * 10000 + 5000;
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, processingTime_1); })];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, job.updateProgress(80)];
                    case 5:
                        _b.sent();
                        success = Math.random() > 0.1;
                        return [4 /*yield*/, job.updateProgress(100)];
                    case 6:
                        _b.sent();
                        if (success) {
                            return [2 /*return*/, {
                                    success: true,
                                    applicationId: applicationId,
                                    status: 'COMPLETED',
                                    message: 'Job application submitted successfully',
                                    submittedAt: new Date().toISOString(),
                                    executionMode: 'desktop',
                                    processingTime: Math.round(processingTime_1)
                                }];
                        }
                        else {
                            throw new Error('Automation failed: Unable to submit application');
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        error_3 = _b.sent();
                        console.error("\u274C Job application processing failed for ".concat(applicationId, ":"), error_3);
                        return [2 /*return*/, {
                                success: false,
                                applicationId: applicationId,
                                status: 'FAILED',
                                message: error_3 instanceof Error ? error_3.message : 'Unknown error occurred',
                                failedAt: new Date().toISOString(),
                                executionMode: 'desktop'
                            }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add job application to queue
     */
    QueueService.prototype.addJobApplication = function (data_1) {
        return __awaiter(this, arguments, void 0, function (data, isPriority) {
            var queue, jobOptions, job, error_4;
            if (isPriority === void 0) { isPriority = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isInitialized) {
                            throw new Error('Queue service not initialized');
                        }
                        queue = isPriority ? this.priorityQueue : this.applicationQueue;
                        jobOptions = {
                            priority: data.priority,
                            delay: 0, // Process immediately
                            attempts: 3,
                            backoff: {
                                type: 'exponential',
                                delay: 5000,
                            },
                            removeOnComplete: 100,
                            removeOnFail: 50,
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, queue.add('process-job-application', data, jobOptions)];
                    case 2:
                        job = _a.sent();
                        console.log("Job application queued: ".concat(job.id, " for user ").concat(data.userId));
                        return [2 /*return*/, job.id];
                    case 3:
                        error_4 = _a.sent();
                        console.error('Failed to add job application to queue:', error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get job status
     */
    QueueService.prototype.getJobStatus = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var job, state, progress, result, failedReason, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.applicationQueue.getJob(jobId)];
                    case 1:
                        job = _a.sent();
                        if (!!job) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.priorityQueue.getJob(jobId)];
                    case 2:
                        job = _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!job) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, job.getState()];
                    case 4:
                        state = _a.sent();
                        progress = job.progress;
                        result = job.returnvalue;
                        failedReason = job.failedReason;
                        return [2 /*return*/, {
                                id: job.id,
                                jobId: job.data.jobId,
                                userId: job.data.userId,
                                status: this.mapJobState(state),
                                progress: typeof progress === 'number' ? progress : undefined,
                                message: failedReason || undefined,
                                result: result || undefined,
                                createdAt: new Date(job.timestamp),
                                updatedAt: new Date(job.processedOn || job.timestamp),
                                processedAt: job.processedOn ? new Date(job.processedOn) : undefined,
                                completedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
                            }];
                    case 5:
                        error_5 = _a.sent();
                        console.error('Failed to get job status:', error_5);
                        return [2 /*return*/, null];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get queue statistics
     */
    QueueService.prototype.getQueueStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, appStats, priorityStats, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                this.applicationQueue.getJobCounts(),
                                this.priorityQueue.getJobCounts(),
                            ])];
                    case 1:
                        _a = _b.sent(), appStats = _a[0], priorityStats = _a[1];
                        return [2 /*return*/, {
                                applications: appStats,
                                priority: priorityStats,
                                total: {
                                    waiting: appStats.waiting + priorityStats.waiting,
                                    active: appStats.active + priorityStats.active,
                                    completed: appStats.completed + priorityStats.completed,
                                    failed: appStats.failed + priorityStats.failed,
                                    delayed: appStats.delayed + priorityStats.delayed,
                                },
                            }];
                    case 2:
                        error_6 = _b.sent();
                        console.error('Failed to get queue statistics:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get user's job applications
     */
    QueueService.prototype.getUserApplications = function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, limit) {
            var _a, appJobs, priorityJobs, allJobs, applications, _i, allJobs_1, job, status_1, error_7;
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, Promise.all([
                                this.applicationQueue.getJobs(['waiting', 'active', 'completed', 'failed'], 0, limit),
                                this.priorityQueue.getJobs(['waiting', 'active', 'completed', 'failed'], 0, limit),
                            ])];
                    case 1:
                        _a = _b.sent(), appJobs = _a[0], priorityJobs = _a[1];
                        allJobs = __spreadArray(__spreadArray([], appJobs, true), priorityJobs, true).filter(function (job) { return job.data.userId === userId; });
                        applications = [];
                        _i = 0, allJobs_1 = allJobs;
                        _b.label = 2;
                    case 2:
                        if (!(_i < allJobs_1.length)) return [3 /*break*/, 5];
                        job = allJobs_1[_i];
                        return [4 /*yield*/, this.getJobStatus(job.id)];
                    case 3:
                        status_1 = _b.sent();
                        if (status_1) {
                            applications.push(status_1);
                        }
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: 
                    // Sort by creation date (newest first)
                    return [2 /*return*/, applications.sort(function (a, b) { return b.createdAt.getTime() - a.createdAt.getTime(); })];
                    case 6:
                        error_7 = _b.sent();
                        console.error('Failed to get user applications:', error_7);
                        return [2 /*return*/, []];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cancel job application
     */
    QueueService.prototype.cancelJobApplication = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var job, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.applicationQueue.getJob(jobId)];
                    case 1:
                        job = _a.sent();
                        if (!!job) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.priorityQueue.getJob(jobId)];
                    case 2:
                        job = _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!job) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, job.remove()];
                    case 4:
                        _a.sent();
                        console.log("Job application cancelled: ".concat(jobId));
                        return [2 /*return*/, true];
                    case 5:
                        error_8 = _a.sent();
                        console.error('Failed to cancel job application:', error_8);
                        return [2 /*return*/, false];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get health status
     */
    QueueService.prototype.getHealthStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ping, stats, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.redisConnection.ping()];
                    case 1:
                        ping = _a.sent();
                        return [4 /*yield*/, this.getQueueStats()];
                    case 2:
                        stats = _a.sent();
                        return [2 /*return*/, {
                                status: 'healthy',
                                details: {
                                    redis: ping === 'PONG' ? 'connected' : 'disconnected',
                                    initialized: this.isInitialized,
                                    queues: {
                                        applications: this.config.queues.applications.name,
                                        priority: this.config.queues.priority.name,
                                    },
                                    stats: stats,
                                },
                            }];
                    case 3:
                        error_9 = _a.sent();
                        return [2 /*return*/, {
                                status: 'unhealthy',
                                details: {
                                    error: error_9 instanceof Error ? error_9.message : 'Unknown error',
                                    initialized: this.isInitialized,
                                },
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cleanup and shutdown
     */
    QueueService.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Shutting down queue service...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        if (!this.worker) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.worker.close()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: 
                    // Close queue events
                    return [4 /*yield*/, this.queueEvents.close()];
                    case 4:
                        // Close queue events
                        _a.sent();
                        // Close queues
                        return [4 /*yield*/, Promise.all([
                                this.applicationQueue.close(),
                                this.priorityQueue.close(),
                            ])];
                    case 5:
                        // Close queues
                        _a.sent();
                        // Close Redis connection
                        return [4 /*yield*/, this.redisConnection.disconnect()];
                    case 6:
                        // Close Redis connection
                        _a.sent();
                        this.isInitialized = false;
                        console.log('Queue service shut down successfully');
                        return [3 /*break*/, 8];
                    case 7:
                        error_10 = _a.sent();
                        console.error('Error shutting down queue service:', error_10);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Map BullMQ job state to application status
     */
    QueueService.prototype.mapJobState = function (state) {
        switch (state) {
            case 'waiting':
            case 'delayed':
                return database_1.QueueStatus.QUEUED;
            case 'active':
                return database_1.QueueStatus.PROCESSING;
            case 'completed':
                return database_1.QueueStatus.COMPLETED;
            case 'failed':
                return database_1.QueueStatus.FAILED;
            default:
                return database_1.QueueStatus.PENDING;
        }
    };
    // Getters for queue instances (for external worker setup)
    QueueService.prototype.getApplicationQueue = function () {
        return this.applicationQueue;
    };
    QueueService.prototype.getPriorityQueue = function () {
        return this.priorityQueue;
    };
    QueueService.prototype.getQueueEvents = function () {
        return this.queueEvents;
    };
    return QueueService;
}());
exports.QueueService = QueueService;
// =============================================================================
// QUEUE PLUGIN
// =============================================================================
var queuePlugin = function (fastify) { return __awaiter(void 0, void 0, void 0, function () {
    var config, queueService, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                config = {
                    redis: {
                        host: process.env.REDIS_HOST || 'localhost',
                        port: parseInt(process.env.REDIS_PORT || '6379'),
                        password: process.env.REDIS_PASSWORD,
                        db: parseInt(process.env.REDIS_DB || '1'), // Use DB 1 for queues
                        maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
                        retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100'),
                        lazyConnect: process.env.REDIS_LAZY_CONNECT !== 'false',
                        ssl: process.env.REDIS_SSL === 'true',
                    },
                    queues: {
                        applications: {
                            name: process.env.QUEUE_APPLICATIONS_NAME || 'job-applications',
                            defaultJobOptions: {
                                removeOnComplete: parseInt(process.env.QUEUE_REMOVE_ON_COMPLETE || '100'),
                                removeOnFail: parseInt(process.env.QUEUE_REMOVE_ON_FAIL || '50'),
                                attempts: parseInt(process.env.QUEUE_MAX_ATTEMPTS || '3'),
                                backoff: {
                                    type: 'exponential',
                                    delay: parseInt(process.env.QUEUE_BACKOFF_DELAY || '5000'),
                                },
                            },
                        },
                        priority: {
                            name: process.env.QUEUE_PRIORITY_NAME || 'job-applications-priority',
                            defaultJobOptions: {
                                removeOnComplete: parseInt(process.env.QUEUE_REMOVE_ON_COMPLETE || '100'),
                                removeOnFail: parseInt(process.env.QUEUE_REMOVE_ON_FAIL || '50'),
                                attempts: parseInt(process.env.QUEUE_MAX_ATTEMPTS || '3'),
                                backoff: {
                                    type: 'exponential',
                                    delay: parseInt(process.env.QUEUE_BACKOFF_DELAY || '2000'), // Faster for priority
                                },
                            },
                        },
                    },
                    workers: {
                        concurrency: parseInt(process.env.QUEUE_WORKER_CONCURRENCY || '3'),
                        maxStalledCount: parseInt(process.env.QUEUE_MAX_STALLED_COUNT || '1'),
                        stalledInterval: parseInt(process.env.QUEUE_STALLED_INTERVAL || '30000'),
                        removeOnComplete: parseInt(process.env.QUEUE_REMOVE_ON_COMPLETE || '100'),
                        removeOnFail: parseInt(process.env.QUEUE_REMOVE_ON_FAIL || '50'),
                    },
                };
                fastify.log.info('Initializing Queue Management Service...');
                queueService = new QueueService(config);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                // Initialize the service
                return [4 /*yield*/, queueService.initialize()];
            case 2:
                // Initialize the service
                _a.sent();
                // Register with service registry if available
                if (fastify.serviceRegistry) {
                    fastify.serviceRegistry.register('queue', queueService, function () { return queueService.getHealthStatus(); });
                }
                fastify.log.info('✅ Queue Management Service initialized successfully');
                return [3 /*break*/, 4];
            case 3:
                error_11 = _a.sent();
                fastify.log.error('❌ Failed to initialize Queue Management Service:', error_11);
                throw error_11;
            case 4:
                // =============================================================================
                // REGISTER WITH FASTIFY
                // =============================================================================
                // Decorate Fastify instance
                fastify.decorate('queueService', queueService);
                // Connect WebSocket service if available (after websocket plugin loads)
                fastify.addHook('onReady', function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        if (fastify.websocket) {
                            queueService.setWebSocketService(fastify.websocket);
                            fastify.log.info('✅ Queue service connected to WebSocket service');
                        }
                        else {
                            fastify.log.warn('⚠️ WebSocket service not available - real-time updates disabled');
                        }
                        return [2 /*return*/];
                    });
                }); });
                // Add queue health check endpoint
                fastify.get('/health/queue', {
                    schema: {
                        summary: 'Get queue service health status',
                        tags: ['Health'],
                        response: {
                            200: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string' },
                                    timestamp: { type: 'string' },
                                    queue: { type: 'object' },
                                },
                            },
                        },
                    },
                }, function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
                    var health, statusCode, error_12;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, queueService.getHealthStatus()];
                            case 1:
                                health = _a.sent();
                                statusCode = health.status === 'healthy' ? 200 : 503;
                                return [2 /*return*/, reply.code(statusCode).send({
                                        status: health.status,
                                        timestamp: new Date().toISOString(),
                                        queue: health.details,
                                    })];
                            case 2:
                                error_12 = _a.sent();
                                return [2 /*return*/, reply.code(503).send({
                                        status: 'unhealthy',
                                        timestamp: new Date().toISOString(),
                                        error: error_12 instanceof Error ? error_12.message : 'Queue health check failed',
                                    })];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
                // Add queue statistics endpoint
                fastify.get('/queue/stats', {
                    schema: {
                        summary: 'Get queue statistics',
                        tags: ['Queue'],
                        response: {
                            200: {
                                type: 'object',
                                properties: {
                                    timestamp: { type: 'string' },
                                    stats: { type: 'object' },
                                },
                            },
                        },
                    },
                }, function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
                    var stats, error_13;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, queueService.getQueueStats()];
                            case 1:
                                stats = _a.sent();
                                return [2 /*return*/, reply.send({
                                        timestamp: new Date().toISOString(),
                                        stats: stats,
                                    })];
                            case 2:
                                error_13 = _a.sent();
                                return [2 /*return*/, reply.code(500).send({
                                        error: error_13 instanceof Error ? error_13.message : 'Failed to get queue stats',
                                        timestamp: new Date().toISOString(),
                                    })];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
                // Graceful shutdown
                fastify.addHook('onClose', function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                fastify.log.info('Shutting down queue service...');
                                return [4 /*yield*/, queueService.shutdown()];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                fastify.log.info('🚀 Queue service registered successfully with Fastify');
                return [2 /*return*/];
        }
    });
}); };
// =============================================================================
// EXPORTS
// =============================================================================
exports.default = (0, fastify_plugin_1.default)(queuePlugin, {
    name: 'queue',
    fastify: '4.x',
    dependencies: ['services'], // Depends on services plugin for Redis
});
