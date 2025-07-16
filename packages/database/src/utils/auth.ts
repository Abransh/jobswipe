import { db } from '../index';
import { hash, compare } from 'bcryptjs';
import { User, Prisma } from '../generated';

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
  profile?: Partial<Prisma.UserProfileCreateWithoutUserInput>;
}

export interface UpdateUserInput {
  name?: string;
  avatar?: string;
  profile?: Partial<Prisma.UserProfileCreateWithoutUserInput>;
}

/**
 * Create a new user with hashed password
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  const { email, password, name, profile } = input;
  
  // Hash the password
  const passwordHash = await hash(password, 12);
  
  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email },
  });
  
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  // Create user with profile
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      name,
      profile: profile ? {
        create: profile,
      } : undefined,
    },
    include: {
      profile: true,
    },
  });
  
  return user;
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await db.user.findUnique({
    where: { email },
    include: {
      profile: true,
    },
  });
  
  if (!user || !user.passwordHash) {
    return null;
  }
  
  const isValid = await compare(password, user.passwordHash);
  
  if (!isValid) {
    return null;
  }
  
  return user;
}

/**
 * Update user information
 */
export async function updateUser(userId: string, input: UpdateUserInput): Promise<User> {
  const { profile, ...userData } = input;
  
  const user = await db.user.update({
    where: { id: userId },
    data: {
      ...userData,
      profile: profile ? {
        upsert: {
          create: profile,
          update: profile,
        },
      } : undefined,
    },
    include: {
      profile: true,
    },
  });
  
  return user;
}

/**
 * Get user by ID with related data
 */
export async function getUserById(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      subscription: true,
      resumes: {
        orderBy: {
          updatedAt: 'desc',
        },
      },
      applications: {
        include: {
          jobPosting: {
            include: {
              company: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 10, // Recent applications
      },
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

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
    include: {
      profile: true,
      subscription: true,
    },
  });
}

/**
 * Delete user and all related data
 */
export async function deleteUser(userId: string): Promise<void> {
  await db.user.delete({
    where: { id: userId },
  });
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: {
      updatedAt: new Date(),
    },
  });
}

/**
 * Change user password
 */
export async function changePassword(userId: string, newPassword: string): Promise<void> {
  const passwordHash = await hash(newPassword, 12);
  
  await db.user.update({
    where: { id: userId },
    data: {
      passwordHash,
    },
  });
}

/**
 * Verify user's email
 */
export async function verifyEmail(userId: string): Promise<User> {
  return db.user.update({
    where: { id: userId },
    data: {
      emailVerified: new Date(),
    },
  });
}