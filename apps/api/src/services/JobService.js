"use strict";
/**
 * @fileoverview Job Service
 * @description Database service for job-related operations with advanced filtering and search
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
exports.jobService = exports.JobService = void 0;
var database_1 = require("@jobswipe/database");
// Import enums directly from Prisma
var database_2 = require("@jobswipe/database");
// =============================================================================
// JOB SERVICE CLASS
// =============================================================================
var JobService = /** @class */ (function () {
    function JobService(fastify) {
        this.fastify = fastify;
    }
    // =============================================================================
    // MAIN JOB SEARCH & FILTERING
    // =============================================================================
    /**
     * Search and filter jobs with advanced options
     */
    JobService.prototype.searchJobs = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, limit, _c, sortBy, _d, filters, q, userLocation, userId, offset, where, orderBy, _e, jobs, totalCount, transformedJobs, hasMore, error_1;
            var _f, _g, _h, _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        _a = options.page, page = _a === void 0 ? 1 : _a, _b = options.limit, limit = _b === void 0 ? 20 : _b, _c = options.sortBy, sortBy = _c === void 0 ? 'relevance' : _c, _d = options.filters, filters = _d === void 0 ? {} : _d, q = options.q, userLocation = options.userLocation, userId = options.userId;
                        offset = (page - 1) * limit;
                        _k.label = 1;
                    case 1:
                        _k.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, this.buildWhereClause(filters, q)];
                    case 2:
                        where = _k.sent();
                        orderBy = this.buildOrderByClause(sortBy);
                        return [4 /*yield*/, Promise.all([
                                database_1.db.jobPosting.findMany({
                                    where: where,
                                    orderBy: orderBy,
                                    skip: offset,
                                    take: limit,
                                    include: {
                                        company: {
                                            select: {
                                                id: true,
                                                name: true,
                                                slug: true,
                                                description: true,
                                                website: true,
                                                logo: true,
                                                industry: true,
                                                size: true,
                                                isVerified: true,
                                                qualityScore: true,
                                                headquarters: true,
                                                country: true,
                                                foundedYear: true,
                                                employeeCount: true,
                                            }
                                        }
                                    }
                                }),
                                database_1.db.jobPosting.count({ where: where })
                            ])];
                    case 3:
                        _e = _k.sent(), jobs = _e[0], totalCount = _e[1];
                        return [4 /*yield*/, this.transformJobsForFrontend(jobs, userId)];
                    case 4:
                        transformedJobs = _k.sent();
                        hasMore = offset + jobs.length < totalCount;
                        (_g = (_f = this.fastify) === null || _f === void 0 ? void 0 : _f.log) === null || _g === void 0 ? void 0 : _g.info("\uD83D\uDCCB Found ".concat(jobs.length, " jobs (").concat(totalCount, " total) for page ").concat(page));
                        return [2 /*return*/, {
                                jobs: transformedJobs,
                                totalCount: totalCount,
                                hasMore: hasMore,
                                page: page,
                                limit: limit,
                                filters: filters
                            }];
                    case 5:
                        error_1 = _k.sent();
                        (_j = (_h = this.fastify) === null || _h === void 0 ? void 0 : _h.log) === null || _j === void 0 ? void 0 : _j.error('❌ Error searching jobs:', error_1);
                        throw new Error("Failed to search jobs: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'));
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get jobs with proximity-based location search
     */
    JobService.prototype.getProximityJobs = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var location, _a, jobType, _b, level, _c, remote, _d, limit, primaryWhere, primaryJobs, mockProximityInfo, nearbyJobs, transformedPrimaryJobs, transformedNearbyJobs, error_2;
            var _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        location = params.location, _a = params.jobType, jobType = _a === void 0 ? [] : _a, _b = params.level, level = _b === void 0 ? [] : _b, _c = params.remote, remote = _c === void 0 ? 'any' : _c, _d = params.limit, limit = _d === void 0 ? 20 : _d;
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 6, , 7]);
                        primaryWhere = {
                            status: database_2.JobStatus.ACTIVE,
                            isActive: true,
                            OR: [
                                { city: { contains: location, mode: 'insensitive' } },
                                { location: { contains: location, mode: 'insensitive' } },
                                { state: { contains: location, mode: 'insensitive' } }
                            ]
                        };
                        // Add filters
                        if (remote !== 'any') {
                            if (remote === 'remote_only') {
                                primaryWhere['remote'] = true;
                                primaryWhere['remoteType'] = RemoteType.REMOTE;
                            }
                            else if (remote === 'hybrid') {
                                primaryWhere['remoteType'] = RemoteType.HYBRID;
                            }
                            else if (remote === 'onsite') {
                                primaryWhere['remoteType'] = RemoteType.ONSITE;
                            }
                        }
                        if (jobType.length > 0) {
                            primaryWhere['type'] = { in: jobType };
                        }
                        if (level.length > 0) {
                            primaryWhere['level'] = { in: level };
                        }
                        return [4 /*yield*/, database_1.db.jobPosting.findMany({
                                where: primaryWhere,
                                take: limit,
                                orderBy: { createdAt: 'desc' },
                                include: {
                                    company: {
                                        select: {
                                            id: true,
                                            name: true,
                                            slug: true,
                                            logo: true,
                                            industry: true,
                                            size: true,
                                            isVerified: true,
                                            qualityScore: true,
                                            headquarters: true,
                                            country: true,
                                        }
                                    }
                                }
                            })];
                    case 2:
                        primaryJobs = _g.sent();
                        mockProximityInfo = [
                            { city: 'Rome', distance: 25, jobCount: 45 },
                            { city: 'Naples', distance: 50, jobCount: 28 },
                            { city: 'Turin', distance: 75, jobCount: 32 }
                        ];
                        return [4 /*yield*/, database_1.db.jobPosting.findMany({
                                where: {
                                    status: database_2.JobStatus.ACTIVE,
                                    isActive: true,
                                    NOT: { id: { in: primaryJobs.map(function (job) { return job.id; }) } }
                                },
                                take: 10,
                                orderBy: { createdAt: 'desc' },
                                include: {
                                    company: {
                                        select: {
                                            id: true,
                                            name: true,
                                            slug: true,
                                            logo: true,
                                            industry: true,
                                            isVerified: true,
                                        }
                                    }
                                }
                            })];
                    case 3:
                        nearbyJobs = _g.sent();
                        return [4 /*yield*/, this.transformJobsForFrontend(primaryJobs)];
                    case 4:
                        transformedPrimaryJobs = _g.sent();
                        return [4 /*yield*/, this.transformJobsForFrontend(nearbyJobs)];
                    case 5:
                        transformedNearbyJobs = _g.sent();
                        return [2 /*return*/, {
                                location: location,
                                primaryJobs: transformedPrimaryJobs,
                                proximityInfo: mockProximityInfo,
                                suggestions: {
                                    expandSearch: primaryJobs.length < 5,
                                    nextCities: mockProximityInfo,
                                    totalNearbyJobs: nearbyJobs.length
                                },
                                nearbyJobs: transformedNearbyJobs,
                                meta: {
                                    primaryCount: primaryJobs.length,
                                    nearbyCount: nearbyJobs.length,
                                    totalAvailable: primaryJobs.length + nearbyJobs.length
                                }
                            }];
                    case 6:
                        error_2 = _g.sent();
                        (_f = (_e = this.fastify) === null || _e === void 0 ? void 0 : _e.log) === null || _f === void 0 ? void 0 : _f.error('❌ Error getting proximity jobs:', error_2);
                        throw new Error("Failed to get proximity jobs: ".concat(error_2 instanceof Error ? error_2.message : 'Unknown error'));
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // QUERY BUILDERS
    // =============================================================================
    /**
     * Build complex where clause for job filtering
     */
    JobService.prototype.buildWhereClause = function (filters, searchQuery) {
        return __awaiter(this, void 0, void 0, function () {
            var where, searchTerms;
            return __generator(this, function (_a) {
                where = {
                    status: database_2.JobStatus.ACTIVE,
                    isActive: true,
                    company: {
                        status: database_2.CompanyStatus.ACTIVE
                    }
                };
                // Text search across multiple fields
                if (searchQuery) {
                    searchTerms = searchQuery.trim().split(' ').filter(function (term) { return term.length > 0; });
                    where.OR = [
                        {
                            title: {
                                contains: searchQuery,
                                mode: 'insensitive'
                            }
                        },
                        {
                            description: {
                                contains: searchQuery,
                                mode: 'insensitive'
                            }
                        },
                        {
                            skills: {
                                hasSome: searchTerms
                            }
                        },
                        {
                            company: {
                                name: {
                                    contains: searchQuery,
                                    mode: 'insensitive'
                                }
                            }
                        }
                    ];
                }
                // Location filtering
                if (filters.location) {
                    where.OR = __spreadArray(__spreadArray([], (where.OR || []), true), [
                        {
                            city: { contains: filters.location, mode: 'insensitive' }
                        },
                        {
                            state: { contains: filters.location, mode: 'insensitive' }
                        },
                        {
                            country: { contains: filters.location, mode: 'insensitive' }
                        },
                        {
                            location: { contains: filters.location, mode: 'insensitive' }
                        }
                    ], false);
                }
                // Remote work filtering
                if (filters.remote && filters.remote !== 'any') {
                    if (filters.remote === 'remote_only') {
                        where.remote = true;
                        where.remoteType = RemoteType.REMOTE;
                    }
                    else if (filters.remote === 'hybrid') {
                        where.remoteType = RemoteType.HYBRID;
                    }
                    else if (filters.remote === 'onsite') {
                        where.remoteType = RemoteType.ONSITE;
                    }
                }
                // Job type filtering
                if (filters.jobType && filters.jobType.length > 0) {
                    where.type = { in: filters.jobType };
                }
                // Job level filtering
                if (filters.jobLevel && filters.jobLevel.length > 0) {
                    where.level = { in: filters.jobLevel };
                }
                // Salary filtering
                if (filters.salaryMin || filters.salaryMax) {
                    where.AND = where.AND || [];
                    if (filters.salaryMin) {
                        where.AND.push({
                            OR: [
                                { salaryMin: { gte: filters.salaryMin } },
                                { salaryMax: { gte: filters.salaryMin } }
                            ]
                        });
                    }
                    if (filters.salaryMax) {
                        where.AND.push({
                            OR: [
                                { salaryMax: { lte: filters.salaryMax } },
                                { salaryMin: { lte: filters.salaryMax } }
                            ]
                        });
                    }
                }
                // Skills filtering
                if (filters.skills && filters.skills.length > 0) {
                    where.skills = {
                        hasSome: filters.skills
                    };
                }
                // Company size filtering
                if (filters.companySize && filters.companySize.length > 0) {
                    where.company = __assign(__assign({}, where.company), { size: { in: filters.companySize } });
                }
                // Category filtering
                if (filters.category && filters.category.length > 0) {
                    where.category = { in: filters.category };
                }
                // Experience filtering
                if (filters.experience) {
                    where.experienceYears = {
                        lte: filters.experience + 2 // Allow some flexibility
                    };
                }
                return [2 /*return*/, where];
            });
        });
    };
    /**
     * Build order by clause based on sort option
     */
    JobService.prototype.buildOrderByClause = function (sortBy) {
        switch (sortBy) {
            case 'date':
                return [
                    { postedAt: 'desc' },
                    { createdAt: 'desc' }
                ];
            case 'salary':
                return [
                    { salaryMax: 'desc' },
                    { salaryMin: 'desc' },
                    { createdAt: 'desc' }
                ];
            case 'relevance':
            default:
                return [
                    { isFeatured: 'desc' },
                    { isUrgent: 'desc' },
                    { qualityScore: 'desc' },
                    { rightSwipeCount: 'desc' },
                    { viewCount: 'desc' },
                    { createdAt: 'desc' }
                ];
        }
    };
    // =============================================================================
    // DATA TRANSFORMATION
    // =============================================================================
    /**
     * Transform Prisma job results to match frontend interface
     */
    JobService.prototype.transformJobsForFrontend = function (jobs, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.all(jobs.map(function (job) { return __awaiter(_this, void 0, void 0, function () {
                        var matchScore;
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    if (!userId) return [3 /*break*/, 2];
                                    return [4 /*yield*/, this.calculateJobMatchScore(job, userId)];
                                case 1:
                                    matchScore = _c.sent();
                                    _c.label = 2;
                                case 2: 
                                // Transform the job data
                                return [2 /*return*/, {
                                        id: job.id,
                                        title: job.title,
                                        description: job.description,
                                        requirements: job.requirements,
                                        benefits: job.benefits,
                                        // Job Classification
                                        type: job.type,
                                        level: job.level,
                                        department: job.department,
                                        category: job.category,
                                        // Work Arrangement
                                        remote: job.remote,
                                        remoteType: job.remoteType,
                                        location: job.location,
                                        timeZone: job.timeZone,
                                        // Location Details
                                        city: job.city,
                                        state: job.state,
                                        country: job.country,
                                        // Compensation
                                        salaryMin: job.salaryMin,
                                        salaryMax: job.salaryMax,
                                        currency: job.currency || 'EUR',
                                        salaryType: job.salaryType,
                                        equity: job.equity,
                                        bonus: job.bonus,
                                        // Job Requirements
                                        experienceYears: job.experienceYears,
                                        skills: job.skills || [],
                                        education: job.education,
                                        languages: job.languages || [],
                                        // Company Context
                                        companyId: job.companyId,
                                        company: {
                                            id: job.company.id,
                                            name: job.company.name,
                                            slug: job.company.slug,
                                            description: job.company.description,
                                            website: job.company.website,
                                            logo: job.company.logo || this.generateCompanyLogo(job.company.name),
                                            industry: job.company.industry,
                                            size: job.company.size,
                                            isVerified: job.company.isVerified,
                                            qualityScore: job.company.qualityScore,
                                            headquarters: job.company.headquarters,
                                            country: job.company.country,
                                            foundedYear: job.company.foundedYear,
                                            employeeCount: job.company.employeeCount
                                        },
                                        // External Integration
                                        sourceUrl: job.sourceUrl,
                                        applyUrl: job.applyUrl || job.sourceUrl,
                                        // Quality & Verification
                                        qualityScore: job.qualityScore,
                                        isVerified: job.isVerified,
                                        // Status & Lifecycle
                                        isActive: job.isActive,
                                        isFeatured: job.isFeatured,
                                        isUrgent: job.isUrgent,
                                        // Dates
                                        postedAt: (_a = job.postedAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
                                        expiresAt: (_b = job.expiresAt) === null || _b === void 0 ? void 0 : _b.toISOString(),
                                        // Analytics
                                        viewCount: job.viewCount,
                                        applicationCount: job.applicationCount,
                                        rightSwipeCount: job.rightSwipeCount,
                                        leftSwipeCount: job.leftSwipeCount,
                                        // Metadata
                                        createdAt: job.createdAt.toISOString(),
                                        updatedAt: job.updatedAt.toISOString(),
                                        // Additional frontend fields
                                        matchScore: matchScore,
                                        badges: this.generateJobBadges(job),
                                        formattedSalary: this.formatSalary(job)
                                    }];
                            }
                        });
                    }); }))];
            });
        });
    };
    /**
     * Calculate job match score for a user (mock implementation)
     */
    JobService.prototype.calculateJobMatchScore = function (job, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var score;
            return __generator(this, function (_a) {
                score = 70;
                if (job.isFeatured)
                    score += 5;
                if (job.company.isVerified)
                    score += 3;
                if (job.remote)
                    score += 2;
                if (job.qualityScore > 80)
                    score += job.qualityScore * 0.1;
                return [2 /*return*/, Math.min(Math.round(score), 100)];
            });
        });
    };
    /**
     * Generate company logo placeholder
     */
    JobService.prototype.generateCompanyLogo = function (companyName) {
        var initials = companyName
            .split(' ')
            .map(function (word) { return word.charAt(0); })
            .join('')
            .substring(0, 2)
            .toUpperCase();
        var colors = ['0066cc', 'ff6600', '28a745', 'dc3545', '6f42c1', '20c997'];
        var color = colors[companyName.length % colors.length];
        return "https://via.placeholder.com/64x64/".concat(color, "/ffffff?text=").concat(initials);
    };
    /**
     * Generate job badges for frontend display
     */
    JobService.prototype.generateJobBadges = function (job) {
        var badges = [];
        if (job.isUrgent) {
            badges.push({
                type: 'urgent',
                label: 'Urgent',
                color: 'amber',
                priority: 10
            });
        }
        if (job.isFeatured) {
            badges.push({
                type: 'featured',
                label: 'Featured',
                color: 'purple',
                priority: 9
            });
        }
        if (job.company.isVerified) {
            badges.push({
                type: 'verified',
                label: 'Verified',
                color: 'blue',
                priority: 8
            });
        }
        if (job.remote) {
            badges.push({
                type: 'remote',
                label: 'Remote',
                color: 'green',
                priority: 7
            });
        }
        // Add "new" badge for jobs posted in last 7 days
        var weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (job.postedAt && new Date(job.postedAt) > weekAgo) {
            badges.push({
                type: 'new',
                label: 'New',
                color: 'indigo',
                priority: 6
            });
        }
        return badges.sort(function (a, b) { return b.priority - a.priority; });
    };
    /**
     * Format salary for display
     */
    JobService.prototype.formatSalary = function (job) {
        if (!job.salaryMin && !job.salaryMax) {
            return {
                display: 'Competitive',
                range: null,
                currency: job.currency || 'EUR',
                isRange: false,
                isCompetitive: true
            };
        }
        var currency = job.currency || 'EUR';
        var formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        if (job.salaryMin && job.salaryMax) {
            return {
                display: "".concat(formatter.format(job.salaryMin), " - ").concat(formatter.format(job.salaryMax)),
                range: "".concat(job.salaryMin, "-").concat(job.salaryMax),
                currency: currency,
                isRange: true,
                isCompetitive: false
            };
        }
        var salary = job.salaryMin || job.salaryMax;
        var prefix = job.salaryMin ? 'From ' : 'Up to ';
        return {
            display: "".concat(prefix).concat(formatter.format(salary)),
            range: salary.toString(),
            currency: currency,
            isRange: false,
            isCompetitive: false
        };
    };
    // =============================================================================
    // STATISTICS & ANALYTICS
    // =============================================================================
    /**
     * Get job by ID with detailed information
     */
    JobService.prototype.getJobById = function (jobId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var job, transformedJobs, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, database_1.db.jobPosting.findUnique({
                                where: {
                                    id: jobId,
                                    status: database_2.JobStatus.ACTIVE,
                                    isActive: true
                                },
                                include: {
                                    company: {
                                        select: {
                                            id: true,
                                            name: true,
                                            slug: true,
                                            description: true,
                                            website: true,
                                            logo: true,
                                            industry: true,
                                            size: true,
                                            isVerified: true,
                                            qualityScore: true,
                                            headquarters: true,
                                            country: true,
                                            foundedYear: true,
                                            employeeCount: true,
                                        }
                                    }
                                }
                            })];
                    case 1:
                        job = _a.sent();
                        if (!job) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this.transformJobsForFrontend([job], userId)];
                    case 2:
                        transformedJobs = _a.sent();
                        return [2 /*return*/, transformedJobs[0]];
                    case 3:
                        error_3 = _a.sent();
                        this.fastify.log.error('Error getting job by ID:', error_3);
                        throw new Error('Failed to get job details');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get job statistics
     */
    JobService.prototype.getJobStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, totalJobs, activeJobs, recentJobs, companies, featuredJobs, expiredJobs, error_4;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                database_1.db.jobPosting.count(),
                                database_1.db.jobPosting.count({
                                    where: {
                                        status: database_2.JobStatus.ACTIVE,
                                        isActive: true
                                    }
                                }),
                                database_1.db.jobPosting.count({
                                    where: {
                                        status: database_2.JobStatus.ACTIVE,
                                        isActive: true,
                                        createdAt: {
                                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                                        }
                                    }
                                }),
                                database_1.db.company.count({
                                    where: {
                                        status: database_2.CompanyStatus.ACTIVE
                                    }
                                }),
                                database_1.db.jobPosting.count({
                                    where: {
                                        status: database_2.JobStatus.ACTIVE,
                                        isActive: true,
                                        isFeatured: true
                                    }
                                })
                            ])];
                    case 1:
                        _a = _d.sent(), totalJobs = _a[0], activeJobs = _a[1], recentJobs = _a[2], companies = _a[3], featuredJobs = _a[4];
                        expiredJobs = totalJobs - activeJobs;
                        return [2 /*return*/, {
                                totalJobs: totalJobs,
                                activeJobs: activeJobs,
                                expiredJobs: expiredJobs,
                                recentJobs: recentJobs,
                                featuredJobs: featuredJobs,
                                companies: companies,
                                timestamp: new Date().toISOString()
                            }];
                    case 2:
                        error_4 = _d.sent();
                        (_c = (_b = this.fastify) === null || _b === void 0 ? void 0 : _b.log) === null || _c === void 0 ? void 0 : _c.error('❌ Error getting job stats:', error_4);
                        throw new Error('Failed to get job statistics');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Record job view
     */
    JobService.prototype.recordJobView = function (jobId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        // Update view count
                        return [4 /*yield*/, database_1.db.jobPosting.update({
                                where: { id: jobId },
                                data: {
                                    viewCount: {
                                        increment: 1
                                    }
                                }
                            })];
                    case 1:
                        // Update view count
                        _c.sent();
                        if (!userId) return [3 /*break*/, 3];
                        return [4 /*yield*/, database_1.db.analyticsEvent.create({
                                data: {
                                    userId: userId,
                                    eventType: 'job_view',
                                    eventCategory: 'user_action',
                                    eventName: 'Job Viewed',
                                    properties: {
                                        jobId: jobId
                                    }
                                }
                            })];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_5 = _c.sent();
                        (_b = (_a = this.fastify) === null || _a === void 0 ? void 0 : _a.log) === null || _b === void 0 ? void 0 : _b.warn('⚠️ Failed to record job view:', error_5);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return JobService;
}());
exports.JobService = JobService;
// Export singleton instance
exports.jobService = new JobService();
