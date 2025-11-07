/**
 * @fileoverview Edge Runtime compatible JWT authentication utility for middleware
 * @description Lightweight JWT verification for Next.js middleware with Edge Runtime support
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { NextRequest } from 'next/server';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * JWT payload structure
 */
export interface MiddlewareJwtPayload {
  sub: string; // user ID
  email: string;
  name?: string;
  role: string;
  iat: number; // issued at
  exp: number; // expiration
  aud: string; // audience
  iss: string; // issuer
  jti: string; // token ID
  type: string; // token type
  source: string; // auth source
  sessionId?: string;
}

/**
 * Token verification result
 */
export interface TokenVerificationResult {
  valid: boolean;
  payload?: MiddlewareJwtPayload;
  error?: string;
  expired?: boolean;
}

/**
 * Authentication result for middleware
 */
export interface MiddlewareAuthResult {
  isAuthenticated: boolean;
  user?: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
  error?: string;
  needsRefresh?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const JWT_CONSTANTS = {
  ISSUER: 'jobswipe.com',
  AUDIENCE: 'jobswipe-api',
  ACCESS_TOKEN_COOKIE: 'accessToken',
  REFRESH_TOKEN_COOKIE: 'refreshToken',
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Base64URL decode function compatible with Edge Runtime
 */
function base64UrlDecode(str: string): string {
  try {
    // Add padding if needed
    const padded = str + '==='.slice(0, (4 - (str.length % 4)) % 4);
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    
    // Use atob for Edge Runtime compatibility
    const decoded = atob(base64);
    
    // Convert to UTF-8
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    
    return new TextDecoder().decode(bytes);
  } catch (error) {
    throw new Error('Invalid base64url encoding');
  }
}

/**
 * Extract JWT token from cookies
 */
function extractTokenFromCookies(request: NextRequest, cookieName: string): string | null {
  try {
    const token = request.cookies.get(cookieName)?.value;
    return token || null;
  } catch (error) {
    console.error('Error extracting token from cookies:', error);
    return null;
  }
}

/**
 * Basic JWT structure validation (Edge Runtime compatible)
 */
function validateJwtStructure(token: string): TokenVerificationResult {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token format' };
    }

    const [headerStr, payloadStr] = parts;
    
    // Decode header and payload
    const header = JSON.parse(base64UrlDecode(headerStr));
    const payload = JSON.parse(base64UrlDecode(payloadStr)) as MiddlewareJwtPayload;

    // Basic header validation
    if (!header.alg || !header.typ || header.typ !== 'JWT') {
      return { valid: false, error: 'Invalid token header' };
    }

    // Basic payload validation
    if (!payload.sub || !payload.exp || !payload.iat) {
      return { valid: false, error: 'Invalid token payload' };
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return { valid: false, error: 'Token has expired', expired: true };
    }

    // Check issuer and audience
    if (payload.iss !== JWT_CONSTANTS.ISSUER || payload.aud !== JWT_CONSTANTS.AUDIENCE) {
      return { valid: false, error: 'Invalid token issuer or audience' };
    }

    // Check if token is too old (issued more than 30 days ago)
    const maxAge = 30 * 24 * 60 * 60; // 30 days
    if (now - payload.iat > maxAge) {
      return { valid: false, error: 'Token is too old' };
    }

    return {
      valid: true,
      payload,
    };
  } catch (error) {
    return { valid: false, error: 'Token parsing failed' };
  }
}

/**
 * Verify JWT signature using Web Crypto API (Edge Runtime compatible)
 * SECURITY: This now performs FULL signature verification, not just structure validation
 *
 * @param token - The JWT token to verify
 * @returns Promise<TokenVerificationResult> - Verification result with payload
 */
async function verifyTokenWithSignature(token: string): Promise<TokenVerificationResult> {
  try {
    // First validate basic structure
    const structureCheck = validateJwtStructure(token);
    if (!structureCheck.valid) {
      return structureCheck;
    }

    // Split token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token format' };
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // Get JWT secret from environment
    const jwtSecret = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET not configured');
      return { valid: false, error: 'Server configuration error' };
    }

    // Create signing input (header.payload)
    const signingInput = `${headerB64}.${payloadB64}`;

    // Convert secret to bytes
    const encoder = new TextEncoder();
    const secretKey = encoder.encode(jwtSecret);

    // Import key for HMAC-SHA256 (Edge Runtime compatible)
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      secretKey,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    // Convert signature from base64url to ArrayBuffer
    const signatureBytes = Uint8Array.from(
      atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );

    // Verify signature
    const isValid = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      signatureBytes,
      encoder.encode(signingInput)
    );

    if (!isValid) {
      console.warn('🔒 JWT signature verification failed - potential token forgery attempt');
      return { valid: false, error: 'Invalid token signature' };
    }

    // Signature is valid, return payload from structure check
    return structureCheck;

  } catch (error) {
    console.error('JWT verification error:', error);
    return { valid: false, error: 'Token verification failed' };
  }
}

/**
 * Synchronous token verification wrapper
 * DEPRECATED: Use verifyTokenWithSignature for proper security
 * This should only be used in specific edge cases where async is not possible
 */
function verifyTokenBasic(token: string): TokenVerificationResult {
  console.warn('⚠️ Using basic token validation without signature verification - NOT RECOMMENDED');
  return validateJwtStructure(token);
}

// =============================================================================
// MAIN AUTHENTICATION FUNCTION
// =============================================================================

/**
 * Verify authentication from request cookies (Edge Runtime compatible)
 * SECURITY: Now performs full JWT signature verification
 */
export async function verifyAuthFromRequest(request: NextRequest): Promise<MiddlewareAuthResult> {
  try {
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      const allCookies = request.cookies.getAll();
      console.log('🍪 Available cookies:', allCookies.map(c => c.name));
    }

    // Extract access token from cookies
    const accessToken = extractTokenFromCookies(request, JWT_CONSTANTS.ACCESS_TOKEN_COOKIE);

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔑 Token extraction:', {
        cookieName: JWT_CONSTANTS.ACCESS_TOKEN_COOKIE,
        hasToken: !!accessToken,
        tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'none'
      });
    }

    if (!accessToken) {
      return {
        isAuthenticated: false,
        error: 'No access token found',
      };
    }

    // SECURITY: Verify token with FULL signature verification
    const verification = await verifyTokenWithSignature(accessToken);

    if (!verification.valid) {
      // Log security event for monitoring
      if (verification.error === 'Invalid token signature') {
        console.error('🚨 SECURITY ALERT: Invalid JWT signature detected - potential forgery attempt');
      }

      return {
        isAuthenticated: false,
        error: verification.error,
        needsRefresh: verification.expired,
      };
    }

    if (!verification.payload) {
      return {
        isAuthenticated: false,
        error: 'Invalid token payload',
      };
    }

    // Extract user information
    const user = {
      id: verification.payload.sub,
      email: verification.payload.email,
      name: verification.payload.name,
      role: verification.payload.role,
    };

    return {
      isAuthenticated: true,
      user,
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return {
      isAuthenticated: false,
      error: 'Authentication verification failed',
    };
  }
}

/**
 * Check if user has required role
 */
export function hasRole(authResult: MiddlewareAuthResult, requiredRole: string): boolean {
  if (!authResult.isAuthenticated || !authResult.user) {
    return false;
  }
  
  const roleHierarchy = ['user', 'admin', 'super_admin'];
  const userRoleIndex = roleHierarchy.indexOf(authResult.user.role);
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
  
  return userRoleIndex >= requiredRoleIndex;
}

/**
 * Check if refresh token exists (for redirect logic)
 */
export function hasRefreshToken(request: NextRequest): boolean {
  const refreshToken = extractTokenFromCookies(request, JWT_CONSTANTS.REFRESH_TOKEN_COOKIE);
  return !!refreshToken;
}

/**
 * Get client IP for logging
 */
export function getClientIP(request: NextRequest): string | undefined {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-client-ip') ||
    undefined
  );
}

/**
 * Get user agent for logging
 */
export function getUserAgent(request: NextRequest): string | undefined {
  return request.headers.get('user-agent') || undefined;
}

// =============================================================================
// ROUTE HELPERS
// =============================================================================

/**
 * Check if route is protected
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    '/dashboard',
    '/profile', 
    '/settings',
    '/applications',
    '/resumes',
    '/jobs/saved',
    '/automation',
  ];
  
  return protectedRoutes.some(route => pathname.startsWith(route));
}

/**
 * Check if route is auth-only (should redirect authenticated users)
 */
export function isAuthRoute(pathname: string): boolean {
  const authRoutes = [
    '/auth/signin',
    '/auth/signup', 
    '/auth/reset-password',
    '/auth/verify-email',
    '/login', // legacy route
  ];
  
  return authRoutes.some(route => pathname.startsWith(route) || pathname === route);
}

/**
 * Check if route is public (no auth required)
 */
export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/pricing',
    '/help',
    '/api/health',
  ];
  
  return publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  JWT_CONSTANTS,
  extractTokenFromCookies,
  validateJwtStructure,
  verifyTokenBasic,
};

// Types are already exported above