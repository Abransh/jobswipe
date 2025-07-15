import { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { getUserById } from '@jobswipe/database';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Extract JWT token from request headers
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Verify JWT token and return user payload
 */
export async function verifyToken(token: string): Promise<AuthenticatedUser> {
  if (!process.env.JWT_SECRET) {
    throw new AuthError('JWT_SECRET is not configured', 500);
  }

  try {
    const payload = verify(token, process.env.JWT_SECRET) as any;
    
    if (!payload.sub) {
      throw new AuthError('Invalid token payload');
    }

    // Verify user still exists
    const user = await getUserById(payload.sub);
    if (!user) {
      throw new AuthError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Invalid token');
  }
}

/**
 * Authenticate request and return user
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedUser> {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    throw new AuthError('No authorization token provided');
  }

  return verifyToken(token);
}

/**
 * Optional authentication - returns user if authenticated, null otherwise
 */
export async function optionalAuth(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    return await authenticateRequest(request);
  } catch {
    return null;
  }
}