"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.getUserById = getUserById;
exports.getUserByEmail = getUserByEmail;
exports.createUser = createUser;
exports.authenticateUser = authenticateUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.createJob = createJob;
exports.getJobById = getJobById;
exports.getJobs = getJobs;
exports.createApplication = createApplication;
exports.getUserApplications = getUserApplications;
exports.updateApplicationStatus = updateApplicationStatus;
exports.createUserJobSwipe = createUserJobSwipe;
exports.getUserSwipedJobs = getUserSwipedJobs;
exports.checkDatabaseHealth = checkDatabaseHealth;
exports.getDatabaseStats = getDatabaseStats;
exports.disconnectDatabase = disconnectDatabase;
const generated_1 = require("./generated");
const shared_1 = require("@jobswipe/shared");
// Singleton pattern for Prisma client
const globalForPrisma = globalThis;
exports.db = globalForPrisma.prisma ?? new generated_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.db;
// Export all types from Prisma
__exportStar(require("./generated"), exports);
// =============================================================================
// USER CRUD OPERATIONS
// =============================================================================
/**
 * Get user by ID with profile
 */
async function getUserById(id) {
    try {
        return await exports.db.user.findUnique({
            where: { id },
            include: {
                profile: true,
            },
        });
    }
    catch (error) {
        console.error('getUserById error:', error);
        throw new Error('Failed to get user by ID');
    }
}
/**
 * Get user by email with profile
 */
async function getUserByEmail(email) {
    try {
        return await exports.db.user.findUnique({
            where: { email },
            include: {
                profile: true,
            },
        });
    }
    catch (error) {
        console.error('getUserByEmail error:', error);
        throw new Error('Failed to get user by email');
    }
}
/**
 * Create new user with hashed password
 */
async function createUser(data) {
    try {
        // Check if user already exists
        const existingUser = await getUserByEmail(data.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        // Hash the password
        const passwordHash = await (0, shared_1.hashPassword)(data.password);
        // Create user with profile
        const user = await exports.db.user.create({
            data: {
                email: data.email,
                passwordHash,
                name: data.name,
                profile: data.profile ? {
                    create: {
                        firstName: data.profile.firstName,
                        lastName: data.profile.lastName,
                    },
                } : undefined,
            },
            include: {
                profile: true,
            },
        });
        return user;
    }
    catch (error) {
        console.error('createUser error:', error);
        if (error instanceof Error && error.message.includes('already exists')) {
            throw error;
        }
        throw new Error('Failed to create user');
    }
}
/**
 * Authenticate user with email and password
 */
async function authenticateUser(email, password) {
    try {
        // Get user with password hash
        const user = await exports.db.user.findUnique({
            where: { email },
            include: {
                profile: true,
            },
        });
        if (!user || !user.passwordHash) {
            return null;
        }
        // Verify password
        const isValidPassword = await (0, shared_1.verifyPassword)(password, user.passwordHash);
        if (!isValidPassword) {
            return null;
        }
        return user;
    }
    catch (error) {
        console.error('authenticateUser error:', error);
        return null;
    }
}
/**
 * Update user data
 */
async function updateUser(id, data) {
    try {
        return await exports.db.user.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
                profile: data.profile ? {
                    upsert: {
                        create: data.profile,
                        update: data.profile,
                    },
                } : undefined,
            },
            include: {
                profile: true,
            },
        });
    }
    catch (error) {
        console.error('updateUser error:', error);
        throw new Error('Failed to update user');
    }
}
/**
 * Delete user (soft delete by updating status)
 */
async function deleteUser(id) {
    try {
        return await exports.db.user.update({
            where: { id },
            data: {
                status: 'DELETED',
                updatedAt: new Date(),
            },
        });
    }
    catch (error) {
        console.error('deleteUser error:', error);
        throw new Error('Failed to delete user');
    }
}
// =============================================================================
// JOB CRUD OPERATIONS
// =============================================================================
/**
 * Create a new job
 */
async function createJob(data) {
    try {
        return await exports.db.jobPosting.create({
            data: {
                title: data.title,
                companyId: data.companyId,
                sourceUrl: data.sourceUrl,
                description: data.description || '',
                location: data.location,
                salaryMin: data.salaryMin,
                salaryMax: data.salaryMax,
                type: data.type || 'FULL_TIME',
                level: data.level || 'MID',
                remoteType: data.remoteType || 'ONSITE',
                skills: data.skills || [],
                requirements: data.requirements,
            },
        });
    }
    catch (error) {
        console.error('createJob error:', error);
        throw new Error('Failed to create job');
    }
}
/**
 * Get job by ID
 */
async function getJobById(id) {
    try {
        return await exports.db.jobPosting.findUnique({
            where: { id },
            include: {
                applications: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }
    catch (error) {
        console.error('getJobById error:', error);
        throw new Error('Failed to get job by ID');
    }
}
/**
 * Get jobs with pagination and filters
 */
async function getJobs(options = {}) {
    try {
        const { page = 1, limit = 20, search, jobType, remoteType, minSalary, maxSalary, skills, } = options;
        const offset = (page - 1) * limit;
        const where = {
            status: 'ACTIVE',
        };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { company: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (jobType) {
            where.jobType = jobType;
        }
        if (remoteType) {
            where.remoteType = remoteType;
        }
        if (minSalary !== undefined) {
            where.salary = { gte: minSalary };
        }
        if (maxSalary !== undefined) {
            where.salary = { ...where.salary, lte: maxSalary };
        }
        if (skills && skills.length > 0) {
            where.skills = { hasSome: skills };
        }
        const [jobs, total] = await Promise.all([
            exports.db.jobPosting.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit,
            }),
            exports.db.jobPosting.count({ where }),
        ]);
        return {
            jobs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    catch (error) {
        console.error('getJobs error:', error);
        throw new Error('Failed to get jobs');
    }
}
// =============================================================================
// APPLICATION CRUD OPERATIONS
// =============================================================================
/**
 * Create job application
 */
async function createApplication(data) {
    try {
        return await exports.db.jobApplication.create({
            data: {
                userId: data.userId,
                jobPostingId: data.jobId,
                resumeId: data.resumeId,
                coverLetter: data.coverLetter,
                customFields: data.customFields,
                source: data.source || 'MANUAL',
                status: 'DRAFT',
            },
            include: {
                jobPosting: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
                resume: true,
            },
        });
    }
    catch (error) {
        console.error('createApplication error:', error);
        throw new Error('Failed to create application');
    }
}
/**
 * Get user applications
 */
async function getUserApplications(userId, options = {}) {
    try {
        const { page = 1, limit = 20, status } = options;
        const offset = (page - 1) * limit;
        const where = { userId };
        if (status) {
            where.status = status;
        }
        const [applications, total] = await Promise.all([
            exports.db.jobApplication.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit,
                include: {
                    jobPosting: true,
                    resume: true,
                },
            }),
            exports.db.jobApplication.count({ where }),
        ]);
        return {
            applications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    catch (error) {
        console.error('getUserApplications error:', error);
        throw new Error('Failed to get user applications');
    }
}
/**
 * Update application status
 */
async function updateApplicationStatus(id, status, notes) {
    try {
        return await exports.db.jobApplication.update({
            where: { id },
            data: {
                status,
                notes,
                updatedAt: new Date(),
            },
            include: {
                jobPosting: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });
    }
    catch (error) {
        console.error('updateApplicationStatus error:', error);
        throw new Error('Failed to update application status');
    }
}
// =============================================================================
// USER JOB SWIPES
// =============================================================================
/**
 * Record user job swipe
 */
async function createUserJobSwipe(data) {
    try {
        return await exports.db.userJobSwipe.create({
            data: {
                userId: data.userId,
                jobPostingId: data.jobId,
                direction: data.swipedRight ? 'RIGHT' : 'LEFT',
            },
            include: {
                jobPosting: true,
            },
        });
    }
    catch (error) {
        console.error('createUserJobSwipe error:', error);
        throw new Error('Failed to create user job swipe');
    }
}
/**
 * Get user's swiped jobs
 */
async function getUserSwipedJobs(userId, swipedRight) {
    try {
        const where = { userId };
        if (swipedRight !== undefined) {
            where.direction = swipedRight ? 'RIGHT' : 'LEFT';
        }
        return await exports.db.userJobSwipe.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                jobPosting: true,
            },
        });
    }
    catch (error) {
        console.error('getUserSwipedJobs error:', error);
        throw new Error('Failed to get user swiped jobs');
    }
}
// =============================================================================
// DATABASE UTILITIES
// =============================================================================
/**
 * Database health check
 */
async function checkDatabaseHealth() {
    try {
        await exports.db.$queryRaw `SELECT 1`;
        return { status: 'healthy', timestamp: new Date() };
    }
    catch (error) {
        return {
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date()
        };
    }
}
/**
 * Get database statistics
 */
async function getDatabaseStats() {
    try {
        const [userCount, jobCount, applicationCount] = await Promise.all([
            exports.db.user.count({ where: { status: 'ACTIVE' } }),
            exports.db.jobPosting.count({ where: { status: 'ACTIVE' } }),
            exports.db.jobApplication.count(),
        ]);
        return {
            users: userCount,
            jobs: jobCount,
            applications: applicationCount,
            timestamp: new Date(),
        };
    }
    catch (error) {
        console.error('getDatabaseStats error:', error);
        throw new Error('Failed to get database statistics');
    }
}
/**
 * Graceful shutdown
 */
async function disconnectDatabase() {
    await exports.db.$disconnect();
}
//# sourceMappingURL=index.js.map