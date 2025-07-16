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

// Export basic utility functions that work
export async function getUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    include: {
      profile: true,
    },
  });
}

export async function getUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
    include: {
      profile: true,
    },
  });
}

export async function createUser(data: {
  email: string;
  password: string;
  name?: string;
  profile?: any;
}) {
  return db.user.create({
    data: {
      email: data.email,
      passwordHash: data.password,
      name: data.name,
    },
    include: {
      profile: true,
    },
  });
}

export async function authenticateUser(email: string, password: string) {
  return db.user.findUnique({
    where: { email },
    include: {
      profile: true,
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