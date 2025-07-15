import { PrismaClient } from './generated';

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

// Export utility functions
export * from './utils/auth';
export * from './utils/applications';
export * from './utils/resumes';
export * from './utils/subscriptions';

// Type helpers
export type UserWithProfile = Awaited<ReturnType<typeof getUserWithProfile>>;
export type JobApplicationWithDetails = Awaited<ReturnType<typeof getJobApplicationWithDetails>>;

// Helper functions
export async function getUserWithProfile(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      subscription: true,
      _count: {
        select: {
          applications: true,
          resumes: true,
          savedJobs: true,
        },
      },
    },
  });
}

export async function getJobApplicationWithDetails(applicationId: string) {
  return db.jobApplication.findUnique({
    where: { id: applicationId },
    include: {
      jobPosting: {
        include: {
          company: true,
        },
      },
      resume: true,
      user: {
        include: {
          profile: true,
        },
      },
      interactions: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
}

// Database health check
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

// Graceful shutdown
export async function disconnectDatabase() {
  await db.$disconnect();
}