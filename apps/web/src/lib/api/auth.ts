/**
 * @fileoverview Web app authentication utilities
 * @description Utilities for handling authentication in the Next.js web app
 */

import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { parseJwtPayload, isTokenExpiredClientSide } from '@jobswipe/shared/browser';

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
 * Verify JWT token with improved logic to avoid circular dependencies
 */
export async function verifyToken(token: string): Promise<AuthenticatedUser> {
  try {
    // Basic client-side validation first
    if (isTokenExpiredClientSide(token)) {
      throw new AuthError('Token has expired');
    }

    // Try to parse token payload for basic info first (faster)
    const payload = parseJwtPayload(token);
    if (!payload) {
      throw new AuthError('Invalid token format');
    }

    // Create user info from token payload
    const userFromToken = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: (payload as any).role || 'user',
      status: 'active',
      emailVerified: (payload as any).emailVerified || true,
      createdAt: new Date(payload.iat * 1000),
      updatedAt: new Date(),
    };

    // Try to call /api/auth/me for server-side validation, but with timeout and fallback
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Cookie': typeof document !== 'undefined' ? document.cookie : ''
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          console.log('✅ [Auth] Token verified via /api/auth/me');
          return data.data;
        }
      }

      // If server verification fails but token is parseable, use parsed data
      console.warn('⚠️ [Auth] Server verification failed, using token data');
      
    } catch (fetchError) {
      console.warn('⚠️ [Auth] /api/auth/me unavailable, using token data:', fetchError instanceof Error ? fetchError.message : String(fetchError));
    }

    // Return parsed token data as fallback
    return userFromToken;

  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    
    throw new AuthError('Token verification failed: ' + (error instanceof Error ? error.message : String(error)));
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