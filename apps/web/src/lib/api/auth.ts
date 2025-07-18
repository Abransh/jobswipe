/**
 * @fileoverview Web app authentication utilities
 * @description Utilities for handling authentication in the Next.js web app
 */

import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { defaultJwtTokenService } from '@jobswipe/shared';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Get access token from cookies
 */
export async function getAccessTokenFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('accessToken')?.value || null;
  } catch {
    return null;
  }
}

/**
 * Get refresh token from cookies
 */
export async function getRefreshTokenFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('refreshToken')?.value || null;
  } catch {
    return null;
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
 * Verify JWT token using enterprise JWT service
 */
export async function verifyToken(token: string): Promise<AuthenticatedUser> {
  try {
    const result = await defaultJwtTokenService.verifyToken(token);
    
    if (!result.valid || !result.payload) {
      throw new AuthError('Invalid token');
    }

    const payload = result.payload;

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      status: 'active', // TODO: Get from payload or database
      emailVerified: true, // TODO: Get from payload or database
      createdAt: new Date(payload.iat * 1000),
      updatedAt: new Date(),
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Token verification failed');
  }
}

/**
 * Authenticate request using Bearer token or cookies
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedUser> {
  // Try Bearer token first
  const bearerToken = getTokenFromRequest(request);
  if (bearerToken) {
    return verifyToken(bearerToken);
  }

  // Fall back to cookies
  const accessToken = await getAccessTokenFromCookies();
  if (!accessToken) {
    throw new AuthError('No authorization token provided');
  }

  return verifyToken(accessToken);
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

/**
 * Get current user from cookies (for server components)
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const accessToken = await getAccessTokenFromCookies();
    if (!accessToken) {
      return null;
    }

    return verifyToken(accessToken);
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated (for server components)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();
    return { success: response.ok };
  } catch (error) {
    return { success: false, error: 'Refresh failed' };
  }
}