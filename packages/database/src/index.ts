import { PrismaClient } from './generated';
import { hash, compare } from 'bcryptjs';

// Password hashing configuration
const SALT_ROUNDS = 12;

/**
 * Hash password using bcryptjs
 * @param password - Plain text password to hash
 * @returns Bcrypt hashed password
 */
const hashPassword = async (password: string): Promise<string> => {
  return await hash(password, SALT_ROUNDS);
};

/**
 * Verify password against bcrypt hash
 * @param password - Plain text password to verify
 * @param hash - Bcrypt hash to compare against
 * @returns True if password matches hash
 */
const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await compare(password, hash);
};

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
    return await db.user.
    findUnique({
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
  companyId: string;
  sourceUrl?: string;
  description?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'INTERNSHIP' | 'TEMPORARY' | 'VOLUNTEER' | 'APPRENTICESHIP';
  level?: 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'PRINCIPAL' | 'STAFF' | 'MANAGER' | 'SENIOR_MANAGER' | 'DIRECTOR' | 'SENIOR_DIRECTOR' | 'VP' | 'SVP' | 'C_LEVEL' | 'FOUNDER';
  remoteType?: 'ONSITE' | 'REMOTE' | 'HYBRID' | 'FLEXIBLE';
  skills?: string[];
  requirements?: string;
}) {
  try {
    return await db.jobPosting.create({
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
  customFields?: any;
  source?: 'MANUAL' | 'AUTOMATION' | 'BULK_APPLY' | 'REFERRAL' | 'RECRUITER' | 'COMPANY_OUTREACH';
}) {
  try {
    return await db.jobApplication.create({
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
      db.jobApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          jobPosting: true,
          resume: true,
        },
      }),
      db.jobApplication.count({ where }),
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
export async function updateApplicationStatus(id: string, status: 'DRAFT' | 'QUEUED' | 'APPLYING' | 'APPLIED' | 'APPLICATION_ERROR' | 'VIEWED' | 'SCREENING' | 'PHONE_SCREEN' | 'INTERVIEW_SCHEDULED' | 'FIRST_INTERVIEW' | 'SECOND_INTERVIEW' | 'FINAL_INTERVIEW' | 'TECHNICAL_ASSESSMENT' | 'TAKE_HOME_PROJECT' | 'REFERENCE_CHECK' | 'BACKGROUND_CHECK' | 'OFFER_PENDING' | 'OFFER_RECEIVED' | 'OFFER_ACCEPTED' | 'OFFER_DECLINED' | 'REJECTED' | 'WITHDRAWN' | 'GHOSTED' | 'ARCHIVED', notes?: string) {
  try {
    return await db.jobApplication.update({
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
        jobPostingId: data.jobId,
        direction: data.swipedRight ? 'RIGHT' : 'LEFT',
      },
      include: {
        jobPosting: true,
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
      where.direction = swipedRight ? 'RIGHT' : 'LEFT';
    }

    return await db.userJobSwipe.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        jobPosting: true,
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
      db.user.count({ where: { status: 'ACTIVE' } }),
      db.jobPosting.count({ where: { status: 'ACTIVE' } }),
      db.jobApplication.count(),
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