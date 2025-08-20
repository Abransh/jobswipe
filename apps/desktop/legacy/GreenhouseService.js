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
exports.GreenhouseService = void 0;
var axios_1 = require("axios");
var events_1 = require("events");
var lru_cache_1 = require("lru-cache");
var GreenhouseService = /** @class */ (function (_super) {
    __extends(GreenhouseService, _super);
    function GreenhouseService(config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this) || this;
        _this.rateLimitTracker = new Map();
        _this.isInitialized = false;
        _this.config = __assign({ baseUrl: 'https://api.greenhouse.io/v1', rateLimitRequests: 100, rateLimitWindow: 60000, cacheSize: 1000, cacheTTL: 300000, timeout: 10000, retryAttempts: 3, retryDelay: 1000 }, config);
        _this.cache = new lru_cache_1.LRUCache({
            max: _this.config.cacheSize,
            ttl: _this.config.cacheTTL,
        });
        _this.httpClient = axios_1.default.create({
            baseURL: _this.config.baseUrl,
            timeout: _this.config.timeout,
            headers: {
                'User-Agent': 'JobSwipe-Desktop/1.0.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        _this.stats = {
            totalJobsFetched: 0,
            apiCallsToday: 0,
            cacheHitRate: 0,
            averageResponseTime: 0,
            lastSyncTime: new Date().toISOString(),
            rateLimitStatus: {
                remaining: _this.config.rateLimitRequests,
                resetTime: new Date(Date.now() + _this.config.rateLimitWindow).toISOString(),
            },
        };
        _this.setupHttpInterceptors();
        return _this;
    }
    /**
     * Initialize the Greenhouse service
     */
    GreenhouseService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.emit('status', { phase: 'initialization', message: 'Initializing Greenhouse API service...' });
                        // Test API connectivity
                        return [4 /*yield*/, this.testConnection()];
                    case 1:
                        // Test API connectivity
                        _a.sent();
                        this.isInitialized = true;
                        this.emit('status', { phase: 'initialization', message: 'Greenhouse service initialized successfully' });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this.emit('error', { phase: 'initialization', error: error_1.message });
                        throw new Error("Failed to initialize Greenhouse service: ".concat(error_1.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Search for jobs using Greenhouse API
     */
    GreenhouseService.prototype.searchJobs = function () {
        return __awaiter(this, arguments, void 0, function (filters) {
            var startTime, cacheKey, cachedResult, jobs, result, error_2;
            if (filters === void 0) { filters = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        cacheKey = this.generateCacheKey('search', filters);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        cachedResult = this.cache.get(cacheKey);
                        if (cachedResult) {
                            this.updateCacheStats(true);
                            return [2 /*return*/, __assign(__assign({}, cachedResult), { executionTime: Date.now() - startTime, cached: true })];
                        }
                        // Check rate limits
                        return [4 /*yield*/, this.checkRateLimit()];
                    case 2:
                        // Check rate limits
                        _a.sent();
                        this.emit('search-start', { filters: filters });
                        return [4 /*yield*/, this.fetchJobsFromAPI(filters)];
                    case 3:
                        jobs = _a.sent();
                        result = {
                            jobs: jobs,
                            totalCount: jobs.length,
                            hasMore: jobs.length === (filters.limit || 100),
                            filters: filters,
                            executionTime: Date.now() - startTime,
                            cached: false,
                        };
                        // Cache the result
                        this.cache.set(cacheKey, result);
                        this.updateCacheStats(false);
                        this.stats.totalJobsFetched += jobs.length;
                        this.stats.lastSyncTime = new Date().toISOString();
                        this.emit('search-complete', {
                            jobCount: jobs.length,
                            executionTime: result.executionTime,
                            cached: false
                        });
                        return [2 /*return*/, result];
                    case 4:
                        error_2 = _a.sent();
                        this.emit('error', { phase: 'search', error: error_2.message, filters: filters });
                        throw new Error("Job search failed: ".concat(error_2.message));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get job details by ID
     */
    GreenhouseService.prototype.getJobById = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cachedJob, response, job, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        cacheKey = this.generateCacheKey('job', { id: jobId });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        cachedJob = this.cache.get(cacheKey);
                        if (cachedJob) {
                            this.updateCacheStats(true);
                            return [2 /*return*/, cachedJob];
                        }
                        // Check rate limits
                        return [4 /*yield*/, this.checkRateLimit()];
                    case 2:
                        // Check rate limits
                        _b.sent();
                        return [4 /*yield*/, this.httpClient.get("/jobs/".concat(jobId))];
                    case 3:
                        response = _b.sent();
                        job = this.normalizeJob(response.data);
                        // Cache the job
                        this.cache.set(cacheKey, job);
                        this.updateCacheStats(false);
                        return [2 /*return*/, job];
                    case 4:
                        error_3 = _b.sent();
                        if (((_a = error_3.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
                            return [2 /*return*/, null];
                        }
                        this.emit('error', { phase: 'get-job', error: error_3.message, jobId: jobId });
                        throw new Error("Failed to fetch job ".concat(jobId, ": ").concat(error_3.message));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get jobs by company board token
     */
    GreenhouseService.prototype.getJobsByCompany = function (boardToken_1) {
        return __awaiter(this, arguments, void 0, function (boardToken, filters) {
            var cacheKey, cachedJobs, response, jobs, error_4;
            var _this = this;
            if (filters === void 0) { filters = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = this.generateCacheKey('company', __assign({ boardToken: boardToken }, filters));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        cachedJobs = this.cache.get(cacheKey);
                        if (cachedJobs) {
                            this.updateCacheStats(true);
                            return [2 /*return*/, cachedJobs];
                        }
                        // Check rate limits
                        return [4 /*yield*/, this.checkRateLimit()];
                    case 2:
                        // Check rate limits
                        _a.sent();
                        return [4 /*yield*/, this.httpClient.get("/boards/".concat(boardToken, "/jobs"), {
                                params: this.buildQueryParams(filters),
                            })];
                    case 3:
                        response = _a.sent();
                        jobs = response.data.jobs.map(function (job) { return _this.normalizeJob(job); });
                        // Cache the jobs
                        this.cache.set(cacheKey, jobs);
                        this.updateCacheStats(false);
                        this.stats.totalJobsFetched += jobs.length;
                        return [2 /*return*/, jobs];
                    case 4:
                        error_4 = _a.sent();
                        this.emit('error', { phase: 'company-jobs', error: error_4.message, boardToken: boardToken });
                        throw new Error("Failed to fetch company jobs: ".concat(error_4.message));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sync jobs from multiple companies
     */
    GreenhouseService.prototype.syncCompanyJobs = function (boardTokens) {
        return __awaiter(this, void 0, void 0, function () {
            var allJobs, _i, boardTokens_1, boardToken, jobs, error_5, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        allJobs = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, , 10]);
                        this.emit('sync-start', { companyCount: boardTokens.length });
                        _i = 0, boardTokens_1 = boardTokens;
                        _a.label = 2;
                    case 2:
                        if (!(_i < boardTokens_1.length)) return [3 /*break*/, 8];
                        boardToken = boardTokens_1[_i];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, this.getJobsByCompany(boardToken)];
                    case 4:
                        jobs = _a.sent();
                        allJobs.push.apply(allJobs, jobs);
                        this.emit('sync-progress', {
                            boardToken: boardToken,
                            jobCount: jobs.length,
                            totalJobs: allJobs.length
                        });
                        // Add delay between requests to respect rate limits
                        return [4 /*yield*/, this.delay(500)];
                    case 5:
                        // Add delay between requests to respect rate limits
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        error_5 = _a.sent();
                        this.emit('sync-error', { boardToken: boardToken, error: error_5.message });
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8:
                        this.emit('sync-complete', {
                            totalJobs: allJobs.length,
                            companiesProcessed: boardTokens.length
                        });
                        return [2 /*return*/, allJobs];
                    case 9:
                        error_6 = _a.sent();
                        this.emit('error', { phase: 'sync', error: error_6.message });
                        throw new Error("Job sync failed: ".concat(error_6.message));
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get service statistics
     */
    GreenhouseService.prototype.getStats = function () {
        return __assign(__assign({}, this.stats), { cacheHitRate: this.calculateCacheHitRate() });
    };
    /**
     * Clear cache
     */
    GreenhouseService.prototype.clearCache = function () {
        this.cache.clear();
        this.emit('cache-cleared');
    };
    /**
     * Test API connection
     */
    GreenhouseService.prototype.testConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        // Test with a simple API call (assuming there's a boards endpoint)
                        return [4 /*yield*/, this.httpClient.get('/boards', { timeout: 5000 })];
                    case 1:
                        // Test with a simple API call (assuming there's a boards endpoint)
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _b.sent();
                        if (((_a = error_7.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                            throw new Error('Invalid API key or authentication failed');
                        }
                        if (error_7.code === 'ECONNREFUSED' || error_7.code === 'ENOTFOUND') {
                            throw new Error('Unable to connect to Greenhouse API. Check your internet connection.');
                        }
                        throw new Error("API connection test failed: ".concat(error_7.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetch jobs from Greenhouse API with filtering
     */
    GreenhouseService.prototype.fetchJobsFromAPI = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var params, response, error_8;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = this.buildQueryParams(filters);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.httpClient.get('/jobs', { params: params })];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data.jobs.map(function (job) { return _this.normalizeJob(job); })];
                    case 3:
                        error_8 = _a.sent();
                        throw new Error("API request failed: ".concat(error_8.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Normalize job data from Greenhouse API format to internal format
     */
    GreenhouseService.prototype.normalizeJob = function (apiJob) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return {
            id: apiJob.id.toString(),
            title: apiJob.title,
            company: {
                name: ((_a = apiJob.company) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown Company',
                website: (_b = apiJob.company) === null || _b === void 0 ? void 0 : _b.website,
                logo: (_c = apiJob.company) === null || _c === void 0 ? void 0 : _c.logo_url,
            },
            department: (_e = (_d = apiJob.departments) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.name,
            location: {
                name: ((_f = apiJob.location) === null || _f === void 0 ? void 0 : _f.name) || 'Not specified',
                city: (_g = apiJob.location) === null || _g === void 0 ? void 0 : _g.city,
                state: (_h = apiJob.location) === null || _h === void 0 ? void 0 : _h.state,
                country: (_j = apiJob.location) === null || _j === void 0 ? void 0 : _j.country,
                remote: (_l = (_k = apiJob.location) === null || _k === void 0 ? void 0 : _k.name) === null || _l === void 0 ? void 0 : _l.toLowerCase().includes('remote'),
            },
            description: apiJob.content || apiJob.description || '',
            requirements: this.extractRequirements(apiJob.content || ''),
            applicationUrl: apiJob.absolute_url,
            postedDate: apiJob.updated_at || apiJob.created_at,
            applicationDeadline: apiJob.application_deadline,
            employmentType: this.normalizeEmploymentType(apiJob.type),
            experienceLevel: this.inferExperienceLevel(apiJob.title, apiJob.content),
            salaryRange: this.extractSalaryRange(apiJob.content || ''),
            benefits: this.extractBenefits(apiJob.content || ''),
            skills: this.extractSkills(apiJob.content || ''),
            metadata: {
                source: 'greenhouse',
                sourceId: apiJob.id.toString(),
                boardToken: apiJob.board_token,
                applicationMethod: apiJob.application_url ? 'external' : 'greenhouse',
                lastUpdated: new Date().toISOString(),
            },
        };
    };
    /**
     * Build query parameters for API requests
     */
    GreenhouseService.prototype.buildQueryParams = function (filters) {
        var params = {};
        if (filters.query)
            params.content = filters.query;
        if (filters.location)
            params.location = filters.location;
        if (filters.department)
            params.department_id = filters.department;
        if (filters.limit)
            params.limit = Math.min(filters.limit, 500); // API limit
        if (filters.offset)
            params.offset = filters.offset;
        return params;
    };
    /**
     * Generate cache key for requests
     */
    GreenhouseService.prototype.generateCacheKey = function (type, params) {
        var sortedParams = Object.keys(params)
            .sort()
            .reduce(function (result, key) {
            result[key] = params[key];
            return result;
        }, {});
        return "".concat(type, ":").concat(JSON.stringify(sortedParams));
    };
    /**
     * Check and enforce rate limits
     */
    GreenhouseService.prototype.checkRateLimit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, windowStart, requests, recentRequests, oldestRequest, waitTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = Date.now();
                        windowStart = now - this.config.rateLimitWindow;
                        requests = this.rateLimitTracker.get('api') || [];
                        recentRequests = requests.filter(function (time) { return time > windowStart; });
                        if (!(recentRequests.length >= this.config.rateLimitRequests)) return [3 /*break*/, 2];
                        oldestRequest = Math.min.apply(Math, recentRequests);
                        waitTime = oldestRequest + this.config.rateLimitWindow - now;
                        this.emit('rate-limit-hit', { waitTime: waitTime });
                        return [4 /*yield*/, this.delay(waitTime)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        // Add current request
                        recentRequests.push(now);
                        this.rateLimitTracker.set('api', recentRequests);
                        this.stats.apiCallsToday++;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Setup HTTP interceptors for logging and error handling
     */
    GreenhouseService.prototype.setupHttpInterceptors = function () {
        var _this = this;
        this.httpClient.interceptors.request.use(function (config) {
            if (_this.config.apiKey) {
                config.headers.Authorization = "Bearer ".concat(_this.config.apiKey);
            }
            return config;
        }, function (error) { return Promise.reject(error); });
        this.httpClient.interceptors.response.use(function (response) {
            // Update rate limit status from headers
            if (response.headers['x-ratelimit-remaining']) {
                _this.stats.rateLimitStatus.remaining = parseInt(response.headers['x-ratelimit-remaining']);
            }
            if (response.headers['x-ratelimit-reset']) {
                _this.stats.rateLimitStatus.resetTime = new Date(parseInt(response.headers['x-ratelimit-reset']) * 1000).toISOString();
            }
            return response;
        }, function (error) { return __awaiter(_this, void 0, void 0, function () {
            var retryAfter;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 429)) return [3 /*break*/, 2];
                        retryAfter = error.response.headers['retry-after'] || 60;
                        this.emit('rate-limit-exceeded', { retryAfter: retryAfter });
                        return [4 /*yield*/, this.delay(retryAfter * 1000)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, this.httpClient.request(error.config)];
                    case 2: return [2 /*return*/, Promise.reject(error)];
                }
            });
        }); });
    };
    /**
     * Extract requirements from job description
     */
    GreenhouseService.prototype.extractRequirements = function (content) {
        var requirements = [];
        var lines = content.split('\n');
        var inRequirements = false;
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            var cleanLine = line.trim();
            if (cleanLine.toLowerCase().includes('requirement') ||
                cleanLine.toLowerCase().includes('qualification')) {
                inRequirements = true;
                continue;
            }
            if (inRequirements) {
                if (cleanLine.startsWith('•') || cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
                    requirements.push(cleanLine.substring(1).trim());
                }
                else if (cleanLine && !cleanLine.toLowerCase().includes('preferred')) {
                    inRequirements = false;
                }
            }
        }
        return requirements.slice(0, 10); // Limit to 10 requirements
    };
    /**
     * Normalize employment type
     */
    GreenhouseService.prototype.normalizeEmploymentType = function (type) {
        var normalized = (type === null || type === void 0 ? void 0 : type.toLowerCase()) || '';
        if (normalized.includes('part'))
            return 'part-time';
        if (normalized.includes('contract') || normalized.includes('freelance'))
            return 'contract';
        if (normalized.includes('intern'))
            return 'internship';
        if (normalized.includes('temp'))
            return 'temporary';
        return 'full-time';
    };
    /**
     * Infer experience level from job title and content
     */
    GreenhouseService.prototype.inferExperienceLevel = function (title, content) {
        var text = "".concat(title, " ").concat(content).toLowerCase();
        if (text.includes('senior') || text.includes('lead') || text.includes('principal'))
            return 'senior';
        if (text.includes('executive') || text.includes('director') || text.includes('vp'))
            return 'executive';
        if (text.includes('junior') || text.includes('entry') || text.includes('associate'))
            return 'entry';
        return 'mid';
    };
    /**
     * Extract salary range from job content
     */
    GreenhouseService.prototype.extractSalaryRange = function (content) {
        var _a, _b;
        var salaryPattern = /\$(\d+(?:,\d+)*)\s*-\s*\$(\d+(?:,\d+)*)\s*(hourly|monthly|yearly|annually|per year|per hour)?/i;
        var match = content.match(salaryPattern);
        if (match) {
            var min = parseInt(match[1].replace(/,/g, ''));
            var max = parseInt(match[2].replace(/,/g, ''));
            var period = ((_a = match[3]) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('hour')) ? 'hourly' :
                ((_b = match[3]) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes('month')) ? 'monthly' : 'yearly';
            return { min: min, max: max, currency: 'USD', period: period };
        }
        return undefined;
    };
    /**
     * Extract benefits from job content
     */
    GreenhouseService.prototype.extractBenefits = function (content) {
        var benefits = [];
        var benefitKeywords = [
            'health insurance', 'dental', 'vision', '401k', 'retirement',
            'vacation', 'pto', 'remote work', 'flexible', 'gym membership'
        ];
        for (var _i = 0, benefitKeywords_1 = benefitKeywords; _i < benefitKeywords_1.length; _i++) {
            var keyword = benefitKeywords_1[_i];
            if (content.toLowerCase().includes(keyword)) {
                benefits.push(keyword);
            }
        }
        return benefits;
    };
    /**
     * Extract skills from job content
     */
    GreenhouseService.prototype.extractSkills = function (content) {
        var skills = [];
        var skillKeywords = [
            'javascript', 'python', 'java', 'react', 'node.js', 'aws',
            'sql', 'git', 'docker', 'kubernetes', 'typescript', 'html', 'css'
        ];
        for (var _i = 0, skillKeywords_1 = skillKeywords; _i < skillKeywords_1.length; _i++) {
            var keyword = skillKeywords_1[_i];
            if (content.toLowerCase().includes(keyword)) {
                skills.push(keyword);
            }
        }
        return skills;
    };
    /**
     * Update cache statistics
     */
    GreenhouseService.prototype.updateCacheStats = function (hit) {
        // Implementation depends on how you want to track cache stats
    };
    /**
     * Calculate cache hit rate
     */
    GreenhouseService.prototype.calculateCacheHitRate = function () {
        // Implementation depends on how you want to calculate hit rate
        return 0.85; // Placeholder
    };
    /**
     * Delay execution
     */
    GreenhouseService.prototype.delay = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    /**
     * Clean up resources
     */
    GreenhouseService.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.cache.clear();
                this.rateLimitTracker.clear();
                this.isInitialized = false;
                this.emit('status', { phase: 'cleanup', message: 'Greenhouse service cleaned up' });
                return [2 /*return*/];
            });
        });
    };
    return GreenhouseService;
}(events_1.EventEmitter));
exports.GreenhouseService = GreenhouseService;
exports.default = GreenhouseService;
