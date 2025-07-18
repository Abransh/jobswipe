import { PrismaClient } from './generated';
import { hashPassword, verifyPassword } from '@jobswipe/shared';

// Singleton pattern for Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// Export all types from Prisma
export * from './generated';

// =============================================================================
// USER CRUD OPERATIONS
// =============================================================================

/**
 * Get user by ID with profile
 */
export async function getUserById(id: string) {
  try {
    return await db.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });
  } catch (error) {
    console.error('getUserById error:', error);
    throw new Error('Failed to get user by ID');
  }
}

/**
 * Get user by email with profile
 */
export async function getUserByEmail(email: string) {
  try {
    return await db.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });
  } catch (error) {
    console.error('getUserByEmail error:', error);
    throw new Error('Failed to get user by email');
  }
}

/**
 * Create new user with hashed password
 */
export async function createUser(data: {
  email: string;
  password: string;
  name?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    timezone?: string;
  };
}) {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash the password
    const passwordHash = await hashPassword(data.password);

    // Create user with profile
    const user = await db.user.create({
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
  } catch (error) {
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
export async function authenticateUser(email: string, password: string) {
  try {
    // Get user with password hash
    const user = await db.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user || !user.passwordHash) {
      return null;
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('authenticateUser error:', error);
    return null;
  }
}

/**
 * Update user data
 */
export async function updateUser(id: string, data: {
  name?: string;
  email?: string;
  lastLoginAt?: Date;
  profile?: {
    firstName?: string;
    lastName?: string;
    timezone?: string;
  };
}) {
  try {
    return await db.user.update({
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
  } catch (error) {
    console.error('updateUser error:', error);
    throw new Error('Failed to update user');
  }
}

/**
 * Delete user (soft delete by updating status)
 */
export async function deleteUser(id: string) {
  try {
    return await db.user.update({
      where: { id },
      data: {
        status: 'DELETED',
        updatedAt: new Date(),
      },
    });
  } catch (error) {
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
export async function createJob(data: {
  title: string;
  company: string;
  jobUrl: string;
  description?: string;
  location?: string;
  salary?: number;
  jobType?: string;
  experienceLevel?: string;
  remoteType?: string;
  skills?: string[];
  benefits?: string[];
  requirements?: string[];
  scraped?: boolean;
  scrapedData?: any;
}) {
  try {
    return await db.jobPosting.create({
      data: {
        title: data.title,
        company: data.company,
        jobUrl: data.jobUrl,
        description: data.description,
        location: data.location,
        salary: data.salary,
        jobType: data.jobType,
        experienceLevel: data.experienceLevel,
        remoteType: data.remoteType,
        skills: data.skills,
        benefits: data.benefits,
        requirements: data.requirements,
        scraped: data.scraped || false,
        scrapedData: data.scrapedData,
      },
    });
  } catch (error) {
    console.error('createJob error:', error);
    throw new Error('Failed to create job');
  }
}

/**
 * Get job by ID
 */
export async function getJobById(id: string) {
  try {
    return await db.jobPosting.findUnique({
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
  } catch (error) {
    console.error('getJobById error:', error);
    throw new Error('Failed to get job by ID');
  }
}

/**
 * Get jobs with pagination and filters
 */
export async function getJobs(options: {
  page?: number;
  limit?: number;
  search?: string;
  jobType?: string;
  remoteType?: string;
  minSalary?: number;
  maxSalary?: number;
  skills?: string[];
} = {}) {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      jobType,
      remoteType,
      minSalary,
      maxSalary,
      skills,
    } = options;

    const offset = (page - 1) * limit;

    const where: any = {
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
      db.jobPosting.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.jobPosting.count({ where }),
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
  } catch (error) {
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
export async function createApplication(data: {
  userId: string;
  jobId: string;
  resumeId?: string;
  coverLetter?: string;
  customAnswers?: any;
  source?: string;
}) {
  try {
    return await db.jobApplication.create({
      data: {
        userId: data.userId,
        jobPostingId: data.jobId,
        resumeId: data.resumeId,
        coverLetter: data.coverLetter,
        customAnswers: data.customAnswers,
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
  } catch (error) {
    console.error('createApplication error:', error);
    throw new Error('Failed to create application');
  }
}

/**
 * Get user applications
 */
export async function getUserApplications(userId: string, options: {
  page?: number;
  limit?: number;
  status?: string;
} = {}) {
  try {
    const { page = 1, limit = 20, status } = options;
    const offset = (page - 1) * limit;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      db.application.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          job: true,
          resume: true,
        },
      }),
      db.application.count({ where }),
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
  } catch (error) {
    console.error('getUserApplications error:', error);
    throw new Error('Failed to get user applications');
  }
}

/**
 * Update application status
 */
export async function updateApplicationStatus(id: string, status: string, notes?: string) {
  try {
    return await db.application.update({
      where: { id },
      data: {
        status,
        notes,
        updatedAt: new Date(),
      },
      include: {
        job: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  } catch (error) {
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
export async function createUserJobSwipe(data: {
  userId: string;
  jobId: string;
  swipedRight: boolean;
}) {
  try {
    return await db.userJobSwipe.create({
      data: {
        userId: data.userId,
        jobId: data.jobId,
        swipedRight: data.swipedRight,
      },
      include: {
        job: true,
      },
    });
  } catch (error) {
    console.error('createUserJobSwipe error:', error);
    throw new Error('Failed to create user job swipe');
  }
}

/**
 * Get user's swiped jobs
 */
export async function getUserSwipedJobs(userId: string, swipedRight?: boolean) {
  try {
    const where: any = { userId };
    if (swipedRight !== undefined) {
      where.swipedRight = swipedRight;
    }

    return await db.userJobSwipe.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        job: true,
      },
    });
  } catch (error) {
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
export async function checkDatabaseHealth() {
  try {
    await db.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date() };
  } catch (error) {
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
export async function getDatabaseStats() {
  try {
    const [userCount, jobCount, applicationCount] = await Promise.all([
      db.user.count({ where: { status: 'active' } }),
      db.job.count({ where: { status: 'active' } }),
      db.application.count(),
    ]);

    return {
      users: userCount,
      jobs: jobCount,
      applications: applicationCount,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('getDatabaseStats error:', error);
    throw new Error('Failed to get database statistics');
  }
}

/**
 * Graceful shutdown
 */
export async function disconnectDatabase() {
  await db.$disconnect();
}