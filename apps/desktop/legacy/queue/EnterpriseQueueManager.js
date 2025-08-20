"use strict";
/**
 * @fileoverview Enterprise Queue Manager
 * @description Scalable BullMQ configuration with advanced features for millions of users
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Enterprise-grade queue management with comprehensive monitoring
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
exports.EnterpriseQueueManager = void 0;
var events_1 = require("events");
var bullmq_1 = require("bullmq");
var ioredis_1 = require("ioredis");
var electron_store_1 = require("electron-store");
var crypto_1 = require("crypto");
// =============================================================================
// ENTERPRISE QUEUE MANAGER
// =============================================================================
var EnterpriseQueueManager = /** @class */ (function (_super) {
    __extends(EnterpriseQueueManager, _super);
    function EnterpriseQueueManager(config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this) || this;
        // Queue Management
        _this.queues = new Map();
        _this.workers = new Map();
        _this.queueNames = ['immediate', 'high', 'standard', 'batch', 'retry'];
        // Metrics & Monitoring
        _this.metrics = new Map();
        _this.alertsEnabled = true;
        // Batching
        _this.batchBuffer = new Map();
        _this.batchTimers = new Map();
        // Load Balancing
        _this.workerInstances = new Map();
        _this.loadBalancer = new Map();
        _this.config = {
            redis: __assign({ cluster: false, host: 'localhost', port: 6379, keyPrefix: 'jobswipe:queue:', maxRetriesPerRequest: 3, retryDelayOnFailover: 100, connectionPoolSize: 10 }, config.redis),
            performance: __assign({ concurrency: 50, stalledInterval: 30000, maxStalledCount: 2, removeOnComplete: 1000, removeOnFail: 500, defaultJobOptions: {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 2000
                    },
                    removeOnComplete: true,
                    removeOnFail: true
                } }, config.performance),
            monitoring: __assign({ enabled: true, metricsInterval: 60000, alertThresholds: {
                    queueSize: 10000,
                    processingTime: 300000, // 5 minutes
                    failureRate: 0.05, // 5%
                    stalledJobs: 100,
                    memoryUsage: 0.85 // 85%
                } }, config.monitoring),
            batching: __assign({ enabled: true, batchSize: 50, batchDelay: 5000, maxBatchWaitTime: 30000 }, config.batching),
            priorities: __assign({ levels: {
                    critical: 100,
                    high: 75,
                    normal: 50,
                    low: 25,
                    batch: 10
                }, autoScaling: true, dynamicPriority: true }, config.priorities),
            failover: __assign({ enabled: true, maxFailures: 5, backoffStrategies: [
                    { type: 'exponential', delay: 1000, multiplier: 2, maxDelay: 30000 }
                ] }, config.failover)
        };
        _this.store = new electron_store_1.default({
            name: 'enterprise-queue-manager',
            defaults: {
                metrics: {},
                failureHistory: {},
                configuration: {}
            }
        });
        _this.initializeRedisConnection();
        return _this;
    }
    // =============================================================================
    // INITIALIZATION
    // =============================================================================
    /**
     * Initialize the enterprise queue system
     */
    EnterpriseQueueManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🏗️ Initializing Enterprise Queue Manager...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, , 10]);
                        // Initialize Redis connection
                        return [4 /*yield*/, this.setupRedisConnection()];
                    case 2:
                        // Initialize Redis connection
                        _a.sent();
                        // Create queues with enterprise configuration
                        return [4 /*yield*/, this.createQueues()];
                    case 3:
                        // Create queues with enterprise configuration
                        _a.sent();
                        // Initialize workers with load balancing
                        return [4 /*yield*/, this.createWorkers()];
                    case 4:
                        // Initialize workers with load balancing
                        _a.sent();
                        if (!this.config.monitoring.enabled) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.setupMonitoring()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!this.config.batching.enabled) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.setupBatching()];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        // Setup graceful shutdown
                        this.setupGracefulShutdown();
                        console.log('✅ Enterprise Queue Manager initialized successfully');
                        this.emit('initialized', {
                            queues: this.queues.size,
                            workers: this.workers.size,
                            config: this.config
                        });
                        return [3 /*break*/, 10];
                    case 9:
                        error_1 = _a.sent();
                        console.error('❌ Failed to initialize Enterprise Queue Manager:', error_1);
                        this.emit('initialization-failed', error_1);
                        throw error_1;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initialize Redis connection with clustering support
     */
    EnterpriseQueueManager.prototype.initializeRedisConnection = function () {
        var _this = this;
        var redisConfig = this.config.redis;
        if (redisConfig.cluster && redisConfig.nodes) {
            console.log('🔗 Connecting to Redis Cluster...');
            this.redisConnection = new ioredis_1.default.Cluster(redisConfig.nodes, {
                redisOptions: {
                    password: redisConfig.password,
                    keyPrefix: redisConfig.keyPrefix,
                    maxRetriesPerRequest: redisConfig.maxRetriesPerRequest
                }
            });
        }
        else {
            console.log('🔗 Connecting to single Redis instance...');
            this.redisConnection = new ioredis_1.default({
                host: redisConfig.host,
                port: redisConfig.port,
                password: redisConfig.password,
                keyPrefix: redisConfig.keyPrefix,
                maxRetriesPerRequest: redisConfig.maxRetriesPerRequest
            });
        }
        this.redisConnection.on('connect', function () {
            console.log('✅ Redis connected successfully');
            _this.emit('redis-connected');
        });
        this.redisConnection.on('error', function (error) {
            console.error('❌ Redis connection error:', error);
            _this.emit('redis-error', error);
        });
    };
    EnterpriseQueueManager.prototype.setupRedisConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var timeout = setTimeout(function () {
                            reject(new Error('Redis connection timeout'));
                        }, 10000);
                        _this.redisConnection.once('connect', function () {
                            clearTimeout(timeout);
                            resolve();
                        });
                        _this.redisConnection.once('error', function (error) {
                            clearTimeout(timeout);
                            reject(error);
                        });
                    })];
            });
        });
    };
    // =============================================================================
    // QUEUE MANAGEMENT
    // =============================================================================
    /**
     * Create enterprise-configured queues
     */
    EnterpriseQueueManager.prototype.createQueues = function () {
        return __awaiter(this, void 0, void 0, function () {
            var queueOptions, _i, _a, queueName, queue;
            return __generator(this, function (_b) {
                console.log('📋 Creating enterprise queues...');
                queueOptions = {
                    connection: this.redisConnection,
                    defaultJobOptions: {
                        attempts: this.config.performance.defaultJobOptions.attempts,
                        backoff: this.config.performance.defaultJobOptions.backoff,
                        removeOnComplete: this.config.performance.removeOnComplete,
                        removeOnFail: this.config.performance.removeOnFail
                    }
                };
                for (_i = 0, _a = this.queueNames; _i < _a.length; _i++) {
                    queueName = _a[_i];
                    try {
                        queue = new bullmq_1.Queue(queueName, queueOptions);
                        // Setup queue event listeners
                        this.setupQueueEventListeners(queue, queueName);
                        this.queues.set(queueName, queue);
                        console.log("\u2705 Queue '".concat(queueName, "' created successfully"));
                    }
                    catch (error) {
                        console.error("\u274C Failed to create queue '".concat(queueName, "':"), error);
                        throw error;
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Create workers with load balancing and auto-scaling
     */
    EnterpriseQueueManager.prototype.createWorkers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, queueName, concurrency, workerOptions, worker;
            return __generator(this, function (_b) {
                console.log('👷 Creating enterprise workers...');
                for (_i = 0, _a = this.queueNames; _i < _a.length; _i++) {
                    queueName = _a[_i];
                    try {
                        concurrency = this.calculateOptimalConcurrency(queueName);
                        workerOptions = {
                            connection: this.redisConnection,
                            concurrency: concurrency,
                            stalledInterval: this.config.performance.stalledInterval,
                            maxStalledCount: this.config.performance.maxStalledCount
                        };
                        worker = new bullmq_1.Worker(queueName, this.createJobProcessor(queueName), workerOptions);
                        // Setup worker event listeners
                        this.setupWorkerEventListeners(worker, queueName);
                        this.workers.set(queueName, worker);
                        this.workerInstances.set(queueName, concurrency);
                        console.log("\u2705 Worker for '".concat(queueName, "' created with ").concat(concurrency, " concurrency"));
                    }
                    catch (error) {
                        console.error("\u274C Failed to create worker for '".concat(queueName, "':"), error);
                        throw error;
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Calculate optimal concurrency based on queue type and system resources
     */
    EnterpriseQueueManager.prototype.calculateOptimalConcurrency = function (queueName) {
        var baseConcurrency = this.config.performance.concurrency;
        switch (queueName) {
            case 'immediate':
                return Math.floor(baseConcurrency * 0.4); // 40% for immediate jobs
            case 'high':
                return Math.floor(baseConcurrency * 0.3); // 30% for high priority
            case 'standard':
                return Math.floor(baseConcurrency * 0.2); // 20% for standard
            case 'batch':
                return Math.floor(baseConcurrency * 0.05); // 5% for batch jobs
            case 'retry':
                return Math.floor(baseConcurrency * 0.05); // 5% for retries
            default:
                return Math.floor(baseConcurrency * 0.1); // 10% default
        }
    };
    /**
     * Create job processor with enterprise features
     */
    EnterpriseQueueManager.prototype.createJobProcessor = function (queueName) {
        var _this = this;
        return function (job) { return __awaiter(_this, void 0, void 0, function () {
            var startTime, jobData, result, _a, duration, error_2, duration, errorResult;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startTime = Date.now();
                        jobData = job.data;
                        console.log("\uD83D\uDE80 [".concat(queueName, "] Processing job: ").concat(jobData.id));
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 9, , 10]);
                        // Update load balancer metrics
                        this.updateLoadBalancer(queueName);
                        result = void 0;
                        _a = jobData.type;
                        switch (_a) {
                            case 'batch': return [3 /*break*/, 2];
                            case 'priority': return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 6];
                    case 2: return [4 /*yield*/, this.processBatchJob(job)];
                    case 3:
                        result = _b.sent();
                        return [3 /*break*/, 8];
                    case 4: return [4 /*yield*/, this.processPriorityJob(job)];
                    case 5:
                        result = _b.sent();
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, this.processStandardJob(job)];
                    case 7:
                        result = _b.sent();
                        return [3 /*break*/, 8];
                    case 8:
                        duration = Date.now() - startTime;
                        result.duration = duration;
                        // Update metrics
                        this.updateJobMetrics(queueName, result, duration);
                        console.log("\u2705 [".concat(queueName, "] Job completed: ").concat(jobData.id, " (").concat(duration, "ms)"));
                        this.emit('job-completed', {
                            queue: queueName,
                            jobId: jobData.id,
                            duration: duration,
                            result: result
                        });
                        return [2 /*return*/, result];
                    case 9:
                        error_2 = _b.sent();
                        duration = Date.now() - startTime;
                        errorResult = {
                            success: false,
                            error: error_2 instanceof Error ? error_2.message : String(error_2),
                            duration: duration,
                            retryable: this.isRetryableError(error_2)
                        };
                        console.error("\u274C [".concat(queueName, "] Job failed: ").concat(jobData.id, " - ").concat(errorResult.error));
                        this.emit('job-failed', {
                            queue: queueName,
                            jobId: jobData.id,
                            error: errorResult.error,
                            duration: duration
                        });
                        throw error_2; // BullMQ will handle retries based on job configuration
                    case 10: return [2 /*return*/];
                }
            });
        }); };
    };
    // =============================================================================
    // JOB PROCESSING
    // =============================================================================
    /**
     * Add job to appropriate queue with intelligent routing
     */
    EnterpriseQueueManager.prototype.addJob = function (jobData_1) {
        return __awaiter(this, arguments, void 0, function (jobData, options) {
            var queueName, queue, finalOptions, job;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queueName = this.determineOptimalQueue(jobData);
                        queue = this.queues.get(queueName);
                        if (!queue) {
                            throw new Error("Queue '".concat(queueName, "' not found"));
                        }
                        // Apply batching if enabled and applicable
                        if (this.config.batching.enabled && this.isBatchableJob(jobData)) {
                            return [2 /*return*/, this.addToBatch(jobData, options)];
                        }
                        finalOptions = __assign(__assign(__assign({}, this.config.performance.defaultJobOptions), options), { priority: jobData.metadata.priority });
                        return [4 /*yield*/, queue.add(jobData.id, jobData, finalOptions)];
                    case 1:
                        job = _a.sent();
                        console.log("\uD83D\uDCE5 Job added to ".concat(queueName, ": ").concat(jobData.id));
                        this.emit('job-added', { queue: queueName, jobId: jobData.id, priority: jobData.metadata.priority });
                        return [2 /*return*/, job];
                }
            });
        });
    };
    /**
     * Determine optimal queue based on job characteristics and system load
     */
    EnterpriseQueueManager.prototype.determineOptimalQueue = function (jobData) {
        var priority = jobData.metadata.priority;
        // Check load balancing
        var loadBalanced = this.getLoadBalancedQueue(priority);
        if (loadBalanced) {
            return loadBalanced;
        }
        // Default priority-based routing
        if (priority >= this.config.priorities.levels.critical) {
            return 'immediate';
        }
        else if (priority >= this.config.priorities.levels.high) {
            return 'high';
        }
        else if (priority >= this.config.priorities.levels.normal) {
            return 'standard';
        }
        else if (jobData.type === 'batch') {
            return 'batch';
        }
        else {
            return 'standard';
        }
    };
    /**
     * Get load-balanced queue selection
     */
    EnterpriseQueueManager.prototype.getLoadBalancedQueue = function (priority) {
        if (!this.config.priorities.autoScaling) {
            return null;
        }
        // Find queue with lowest current load for this priority tier
        var eligibleQueues = this.getEligibleQueues(priority);
        var minLoad = Infinity;
        var selectedQueue = null;
        for (var _i = 0, eligibleQueues_1 = eligibleQueues; _i < eligibleQueues_1.length; _i++) {
            var queueName = eligibleQueues_1[_i];
            var load = this.loadBalancer.get(queueName) || 0;
            if (load < minLoad) {
                minLoad = load;
                selectedQueue = queueName;
            }
        }
        return selectedQueue;
    };
    EnterpriseQueueManager.prototype.getEligibleQueues = function (priority) {
        if (priority >= this.config.priorities.levels.critical) {
            return ['immediate'];
        }
        else if (priority >= this.config.priorities.levels.high) {
            return ['immediate', 'high'];
        }
        else {
            return ['high', 'standard'];
        }
    };
    // =============================================================================
    // BATCHING SYSTEM
    // =============================================================================
    EnterpriseQueueManager.prototype.addToBatch = function (jobData, options) {
        return __awaiter(this, void 0, void 0, function () {
            var batchKey, batch, queue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        batchKey = this.getBatchKey(jobData);
                        if (!this.batchBuffer.has(batchKey)) {
                            this.batchBuffer.set(batchKey, []);
                        }
                        batch = this.batchBuffer.get(batchKey);
                        batch.push(jobData);
                        // Setup batch timer if first job
                        if (batch.length === 1) {
                            this.setupBatchTimer(batchKey);
                        }
                        // Process batch if full
                        if (batch.length >= this.config.batching.batchSize) {
                            return [2 /*return*/, this.processBatch(batchKey, options)];
                        }
                        queue = this.queues.get('batch');
                        return [4 /*yield*/, queue.add("batch_placeholder_".concat(jobData.id), jobData, __assign(__assign({}, options), { delay: this.config.batching.batchDelay }))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    EnterpriseQueueManager.prototype.getBatchKey = function (jobData) {
        // Group by user or job type for batching efficiency
        return "".concat(jobData.userId, "_").concat(jobData.type);
    };
    EnterpriseQueueManager.prototype.setupBatchTimer = function (batchKey) {
        var _this = this;
        var timer = setTimeout(function () {
            _this.processBatch(batchKey);
            _this.batchTimers.delete(batchKey);
        }, this.config.batching.maxBatchWaitTime);
        this.batchTimers.set(batchKey, timer);
    };
    EnterpriseQueueManager.prototype.processBatch = function (batchKey_1) {
        return __awaiter(this, arguments, void 0, function (batchKey, options) {
            var batch, timer, batchJob, queue, job;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        batch = this.batchBuffer.get(batchKey);
                        if (!batch || batch.length === 0) {
                            throw new Error("No batch found for key: ".concat(batchKey));
                        }
                        timer = this.batchTimers.get(batchKey);
                        if (timer) {
                            clearTimeout(timer);
                            this.batchTimers.delete(batchKey);
                        }
                        batchJob = {
                            id: "batch_".concat((0, crypto_1.randomUUID)()),
                            userId: batch[0].userId,
                            jobId: 'batch',
                            type: 'batch',
                            payload: {
                                jobs: batch,
                                batchSize: batch.length
                            },
                            metadata: {
                                createdAt: new Date(),
                                priority: Math.min.apply(Math, batch.map(function (job) { return job.metadata.priority; })),
                                attempts: 3
                            }
                        };
                        // Clear batch buffer
                        this.batchBuffer.delete(batchKey);
                        queue = this.queues.get('batch');
                        return [4 /*yield*/, queue.add(batchJob.id, batchJob, options)];
                    case 1:
                        job = _a.sent();
                        console.log("\uD83D\uDCE6 Batch processed: ".concat(batchKey, " (").concat(batch.length, " jobs)"));
                        return [2 /*return*/, job];
                }
            });
        });
    };
    EnterpriseQueueManager.prototype.isBatchableJob = function (jobData) {
        // Only certain types of jobs are batchable
        return jobData.type === 'standard' && jobData.metadata.priority < this.config.priorities.levels.high;
    };
    // =============================================================================
    // MONITORING & METRICS
    // =============================================================================
    EnterpriseQueueManager.prototype.setupMonitoring = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                console.log('📊 Setting up enterprise monitoring...');
                this.metricsInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.collectMetrics()];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, this.checkAlerts()];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); }, this.config.monitoring.metricsInterval);
                // Setup graceful metrics collection
                process.on('SIGTERM', function () { return _this.saveMetrics(); });
                process.on('SIGINT', function () { return _this.saveMetrics(); });
                return [2 /*return*/];
            });
        });
    };
    EnterpriseQueueManager.prototype.collectMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, queueName, queue, counts, metrics, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _i = 0, _a = this.queues.entries();
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        _b = _a[_i], queueName = _b[0], queue = _b[1];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed', 'stalled')];
                    case 3:
                        counts = _c.sent();
                        metrics = {
                            totalJobs: Object.values(counts).reduce(function (sum, count) { return sum + count; }, 0),
                            activeJobs: counts.active,
                            waitingJobs: counts.waiting,
                            completedJobs: counts.completed,
                            failedJobs: counts.failed,
                            delayedJobs: counts.delayed,
                            stalledJobs: counts.stalled || 0,
                            throughputPerSecond: this.calculateThroughput(queueName),
                            averageProcessingTime: this.calculateAverageProcessingTime(queueName),
                            memoryUsage: process.memoryUsage().heapUsed,
                            errorRate: this.calculateErrorRate(queueName, counts)
                        };
                        this.metrics.set(queueName, metrics);
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _c.sent();
                        console.error("\u274C Failed to collect metrics for ".concat(queueName, ":"), error_3);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        this.emit('metrics-updated', Object.fromEntries(this.metrics.entries()));
                        return [2 /*return*/];
                }
            });
        });
    };
    EnterpriseQueueManager.prototype.checkAlerts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var thresholds, _i, _a, _b, queueName, metrics;
            return __generator(this, function (_c) {
                if (!this.alertsEnabled)
                    return [2 /*return*/];
                thresholds = this.config.monitoring.alertThresholds;
                for (_i = 0, _a = this.metrics.entries(); _i < _a.length; _i++) {
                    _b = _a[_i], queueName = _b[0], metrics = _b[1];
                    // Check queue size alert
                    if (metrics.waitingJobs > thresholds.queueSize) {
                        this.triggerAlert('QUEUE_SIZE', queueName, {
                            current: metrics.waitingJobs,
                            threshold: thresholds.queueSize
                        });
                    }
                    // Check processing time alert
                    if (metrics.averageProcessingTime > thresholds.processingTime) {
                        this.triggerAlert('PROCESSING_TIME', queueName, {
                            current: metrics.averageProcessingTime,
                            threshold: thresholds.processingTime
                        });
                    }
                    // Check failure rate alert
                    if (metrics.errorRate > thresholds.failureRate) {
                        this.triggerAlert('FAILURE_RATE', queueName, {
                            current: metrics.errorRate,
                            threshold: thresholds.failureRate
                        });
                    }
                    // Check stalled jobs alert
                    if (metrics.stalledJobs > thresholds.stalledJobs) {
                        this.triggerAlert('STALLED_JOBS', queueName, {
                            current: metrics.stalledJobs,
                            threshold: thresholds.stalledJobs
                        });
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    EnterpriseQueueManager.prototype.triggerAlert = function (type, queueName, data) {
        var alert = {
            id: (0, crypto_1.randomUUID)(),
            type: type,
            queue: queueName,
            severity: this.calculateAlertSeverity(type, data),
            data: data,
            timestamp: new Date()
        };
        console.warn("\uD83D\uDEA8 ALERT [".concat(alert.severity, "]: ").concat(type, " in queue '").concat(queueName, "'"), data);
        this.emit('alert-triggered', alert);
    };
    EnterpriseQueueManager.prototype.calculateAlertSeverity = function (type, data) {
        var ratio = data.current / data.threshold;
        if (ratio > 3)
            return 'CRITICAL';
        if (ratio > 2)
            return 'HIGH';
        if (ratio > 1.5)
            return 'MEDIUM';
        return 'LOW';
    };
    // =============================================================================
    // EVENT HANDLERS
    // =============================================================================
    EnterpriseQueueManager.prototype.setupQueueEventListeners = function (queue, queueName) {
        queue.on('waiting', function (job) {
            console.log("\u23F3 [".concat(queueName, "] Job waiting: ").concat(job.id));
        });
        queue.on('active', function (job) {
            console.log("\uD83D\uDD04 [".concat(queueName, "] Job active: ").concat(job.id));
        });
        queue.on('completed', function (job, result) {
            console.log("\u2705 [".concat(queueName, "] Job completed: ").concat(job.id));
        });
        queue.on('failed', function (job, error) {
            console.error("\u274C [".concat(queueName, "] Job failed: ").concat(job === null || job === void 0 ? void 0 : job.id, " - ").concat(error.message));
        });
        queue.on('stalled', function (job) {
            console.warn("\u26A0\uFE0F [".concat(queueName, "] Job stalled: ").concat(job.id));
        });
    };
    EnterpriseQueueManager.prototype.setupWorkerEventListeners = function (worker, queueName) {
        worker.on('ready', function () {
            console.log("\uD83D\uDC77 [".concat(queueName, "] Worker ready"));
        });
        worker.on('error', function (error) {
            console.error("\u274C [".concat(queueName, "] Worker error:"), error);
        });
        worker.on('stalled', function (jobId) {
            console.warn("\u26A0\uFE0F [".concat(queueName, "] Worker stalled on job: ").concat(jobId));
        });
    };
    // =============================================================================
    // UTILITY METHODS
    // =============================================================================
    EnterpriseQueueManager.prototype.processStandardJob = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Placeholder for standard job processing
                    // This would integrate with the BrowserAutomationService
                    return [4 /*yield*/, this.simulateProcessing(1000, 3000)];
                    case 1:
                        // Placeholder for standard job processing
                        // This would integrate with the BrowserAutomationService
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                duration: 0, // Will be set by processor
                                retryable: false
                            }];
                }
            });
        });
    };
    EnterpriseQueueManager.prototype.processPriorityJob = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Placeholder for priority job processing
                    return [4 /*yield*/, this.simulateProcessing(500, 1500)];
                    case 1:
                        // Placeholder for priority job processing
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                duration: 0,
                                retryable: false
                            }];
                }
            });
        });
    };
    EnterpriseQueueManager.prototype.processBatchJob = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            var batchData, jobs, results, _i, jobs_1, jobData, error_4, successCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        batchData = job.data.payload;
                        jobs = batchData.jobs;
                        console.log("\uD83D\uDCE6 Processing batch of ".concat(jobs.length, " jobs"));
                        results = [];
                        _i = 0, jobs_1 = jobs;
                        _a.label = 1;
                    case 1:
                        if (!(_i < jobs_1.length)) return [3 /*break*/, 6];
                        jobData = jobs_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.simulateProcessing(200, 800)];
                    case 3:
                        _a.sent();
                        results.push({ success: true, jobId: jobData.id });
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        results.push({ success: false, jobId: jobData.id, error: error_4 });
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        successCount = results.filter(function (r) { return r.success; }).length;
                        return [2 /*return*/, {
                                success: successCount > jobs.length * 0.8, // 80% success rate required
                                data: { results: results, successCount: successCount, totalJobs: jobs.length },
                                duration: 0,
                                retryable: successCount === 0
                            }];
                }
            });
        });
    };
    EnterpriseQueueManager.prototype.simulateProcessing = function (minMs, maxMs) {
        return __awaiter(this, void 0, void 0, function () {
            var delay;
            return __generator(this, function (_a) {
                delay = Math.random() * (maxMs - minMs) + minMs;
                return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, delay); })];
            });
        });
    };
    EnterpriseQueueManager.prototype.isRetryableError = function (error) {
        var _a;
        var errorMessage = ((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
        // Network errors are retryable
        if (errorMessage.includes('network') || errorMessage.includes('timeout') ||
            errorMessage.includes('econnreset') || errorMessage.includes('enotfound')) {
            return true;
        }
        // Rate limit errors are retryable
        if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
            return true;
        }
        return false;
    };
    EnterpriseQueueManager.prototype.updateLoadBalancer = function (queueName) {
        var _this = this;
        var currentLoad = this.loadBalancer.get(queueName) || 0;
        this.loadBalancer.set(queueName, currentLoad + 1);
        // Decay load over time
        setTimeout(function () {
            var load = _this.loadBalancer.get(queueName) || 0;
            _this.loadBalancer.set(queueName, Math.max(0, load - 1));
        }, 60000); // 1 minute decay
    };
    EnterpriseQueueManager.prototype.updateJobMetrics = function (queueName, result, duration) {
        // Implementation would update detailed job metrics
    };
    EnterpriseQueueManager.prototype.calculateThroughput = function (queueName) {
        // Implementation would calculate jobs per second
        return 0;
    };
    EnterpriseQueueManager.prototype.calculateAverageProcessingTime = function (queueName) {
        // Implementation would calculate average processing time
        return 0;
    };
    EnterpriseQueueManager.prototype.calculateErrorRate = function (queueName, counts) {
        var total = counts.completed + counts.failed;
        return total > 0 ? counts.failed / total : 0;
    };
    EnterpriseQueueManager.prototype.setupGracefulShutdown = function () {
        var _this = this;
        process.on('SIGTERM', function () { return _this.gracefulShutdown(); });
        process.on('SIGINT', function () { return _this.gracefulShutdown(); });
    };
    EnterpriseQueueManager.prototype.gracefulShutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, worker, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('🛑 Graceful shutdown initiated...');
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 9, , 10]);
                        _i = 0, _a = this.workers.values();
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        worker = _a[_i];
                        return [4 /*yield*/, worker.close()];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: 
                    // Wait for active jobs to complete
                    return [4 /*yield*/, Promise.all(Array.from(this.queues.values()).map(function (queue) { return queue.close(); }))];
                    case 6:
                        // Wait for active jobs to complete
                        _b.sent();
                        // Close Redis connection
                        return [4 /*yield*/, this.redisConnection.quit()];
                    case 7:
                        // Close Redis connection
                        _b.sent();
                        // Save final metrics
                        return [4 /*yield*/, this.saveMetrics()];
                    case 8:
                        // Save final metrics
                        _b.sent();
                        console.log('✅ Graceful shutdown completed');
                        return [3 /*break*/, 10];
                    case 9:
                        error_5 = _b.sent();
                        console.error('❌ Error during shutdown:', error_5);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    EnterpriseQueueManager.prototype.saveMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.metricsInterval) {
                    clearInterval(this.metricsInterval);
                }
                this.store.set('metrics', Object.fromEntries(this.metrics.entries()));
                return [2 /*return*/];
            });
        });
    };
    // =============================================================================
    // PUBLIC API
    // =============================================================================
    /**
     * Get current queue metrics
     */
    EnterpriseQueueManager.prototype.getMetrics = function () {
        return Object.fromEntries(this.metrics.entries());
    };
    /**
     * Get queue health status
     */
    EnterpriseQueueManager.prototype.getHealthStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var health, _i, _a, _b, queueName, queue, counts, worker, error_6;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        health = {};
                        _i = 0, _a = this.queues.entries();
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        _b = _a[_i], queueName = _b[0], queue = _b[1];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, queue.getJobCounts('waiting', 'active', 'failed', 'stalled')];
                    case 3:
                        counts = _c.sent();
                        worker = this.workers.get(queueName);
                        health[queueName] = {
                            status: 'healthy',
                            jobs: counts,
                            worker: {
                                running: worker ? !worker.closing : false,
                                concurrency: this.workerInstances.get(queueName) || 0
                            }
                        };
                        return [3 /*break*/, 5];
                    case 4:
                        error_6 = _c.sent();
                        health[queueName] = {
                            status: 'unhealthy',
                            error: error_6 instanceof Error ? error_6.message : String(error_6)
                        };
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, health];
                }
            });
        });
    };
    /**
     * Pause/Resume queues
     */
    EnterpriseQueueManager.prototype.pauseQueue = function (queueName) {
        return __awaiter(this, void 0, void 0, function () {
            var queue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queue = this.queues.get(queueName);
                        if (!queue) return [3 /*break*/, 2];
                        return [4 /*yield*/, queue.pause()];
                    case 1:
                        _a.sent();
                        console.log("\u23F8\uFE0F Queue '".concat(queueName, "' paused"));
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    EnterpriseQueueManager.prototype.resumeQueue = function (queueName) {
        return __awaiter(this, void 0, void 0, function () {
            var queue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queue = this.queues.get(queueName);
                        if (!queue) return [3 /*break*/, 2];
                        return [4 /*yield*/, queue.resume()];
                    case 1:
                        _a.sent();
                        console.log("\u25B6\uFE0F Queue '".concat(queueName, "' resumed"));
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clean up old jobs
     */
    EnterpriseQueueManager.prototype.cleanupOldJobs = function () {
        return __awaiter(this, arguments, void 0, function (olderThanMs) {
            var _i, _a, _b, queueName, queue, error_7;
            if (olderThanMs === void 0) { olderThanMs = 24 * 60 * 60 * 1000; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log('🧹 Cleaning up old jobs...');
                        _i = 0, _a = this.queues.entries();
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        _b = _a[_i], queueName = _b[0], queue = _b[1];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, queue.clean(olderThanMs, 1000, 'completed')];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, queue.clean(olderThanMs, 500, 'failed')];
                    case 4:
                        _c.sent();
                        console.log("\u2705 Cleaned up old jobs in '".concat(queueName, "'"));
                        return [3 /*break*/, 6];
                    case 5:
                        error_7 = _c.sent();
                        console.error("\u274C Failed to clean queue '".concat(queueName, "':"), error_7);
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return EnterpriseQueueManager;
}(events_1.EventEmitter));
exports.EnterpriseQueueManager = EnterpriseQueueManager;
