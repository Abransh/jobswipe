/**
 * @fileoverview Production-Ready Authentication Middleware for Fastify
 * @description Enterprise-grade JWT authentication with session management
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Critical security component - handles all authentication flows
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import {
  AuthenticatedUser,
  AuthSession,
  AuthContext,
  JwtPayload,
  createAuthError,
  AuthErrorCode,
  UserId,
  SessionId,
  TokenType,
  AuthSource,
  createBrandedId
} from '@jobswipe/shared';

// =============================================================================
// INTERFACES
// =============================================================================

interface AuthMiddlewareOptions {
  required?: boolean;
  allowedTokenTypes?: TokenType[];
  allowedSources?: AuthSource[];
  requirePermissions?: string[];
  requireFeatures?: string[];
}

interface AuthenticatedRequest extends FastifyRequest {
  authContext?: AuthContext;
  user?: AuthenticatedUser;
  sessionId?: string;
  ipAddress?: string;
}

// =============================================================================
// AUTH MIDDLEWARE
// =============================================================================

/**
 * Create authentication middleware
 */
export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  return async function authMiddleware(
    request: AuthenticatedRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      // Extract IP address
      request.ipAddress = extractIpAddress(request);

      // If auth is not required and no token provided, continue
      if (!options.required && !hasAuthHeader(request)) {
        return;
      }

      // Extract token from header
      const token = extractTokenFromHeader(request);
      if (!token) {
        if (options.required) {
          throw createAuthError(
            AuthErrorCode.TOKEN_INVALID,
            'Authentication required'
          );
        }
        return;
      }

      // Verify JWT token
      const tokenResult = await request.server.jwtService.verifyToken(token);
      if (!tokenResult.valid || !tokenResult.payload) {
        throw createAuthError(
          AuthErrorCode.TOKEN_INVALID,
          tokenResult.error || 'Invalid token'
        );
      }

      // The payload from verifyToken is correctly typed as JwtPayload
      // However, JWT serialization means branded types come back as plain strings
      // We need to treat them as branded types for TypeScript
      const payload = tokenResult.payload as JwtPayload;

      // Check token type restrictions
      if (options.allowedTokenTypes && !options.allowedTokenTypes.includes(payload.type)) {
        throw createAuthError(
          AuthErrorCode.TOKEN_INVALID,
          `Token type '${payload.type}' not allowed for this endpoint`
        );
      }

      // Check source restrictions
      if (options.allowedSources && !options.allowedSources.includes(payload.source)) {
        throw createAuthError(
          AuthErrorCode.TOKEN_INVALID,
          `Token source '${payload.source}' not allowed for this endpoint`
        );
      }

      // Get user session if sessionId is present
      let session: AuthSession | null = null;
      if (payload.sessionId) {
        session = await request.server.sessionService.getSession(payload.sessionId);
        if (!session) {
          throw createAuthError(
            AuthErrorCode.SESSION_INVALID,
            'Session not found or expired'
          );
        }

        // Update session last used time
        await request.server.sessionService.updateSession(payload.sessionId, {
          lastUsedAt: new Date(),
          ipAddress: (request as any).ipAddress,
          userAgent: request.headers['user-agent'],
        } as any);
      }

      // Create authenticated user object
      // Note: payload.sub is already typed as UserId from JwtPayload
      const user: AuthenticatedUser = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        status: 'active', // This would be fetched from database in real implementation
        profile: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Check permission requirements
      if (options.requirePermissions && options.requirePermissions.length > 0) {
        const hasAllPermissions = options.requirePermissions.every(permission =>
          payload.permissions?.includes(permission)
        );
        
        if (!hasAllPermissions) {
          throw createAuthError(
            'INSUFFICIENT_PERMISSIONS' as any,
            'Insufficient permissions for this operation'
          );
        }
      }

      // Check feature requirements
      if (options.requireFeatures && options.requireFeatures.length > 0) {
        const hasAllFeatures = options.requireFeatures.every(feature =>
          payload.features?.includes(feature)
        );
        
        if (!hasAllFeatures) {
          throw createAuthError(
            'FEATURE_NOT_AVAILABLE' as any,
            'Required features not available for this account'
          );
        }
      }

      // Create auth context
      const authContext: AuthContext = {
        user,
        session: session!,
        tokens: {
          accessToken: token,
          refreshToken: session?.refreshToken || '',
          tokenType: 'Bearer',
          expiresIn: payload.exp - Math.floor(Date.now() / 1000),
          refreshExpiresIn: 0, // Would be calculated from refresh token
        },
        permissions: payload.permissions || [],
        features: payload.features || [],
        ipAddress: request.ipAddress,
        userAgent: request.headers['user-agent'],
        requestId: generateRequestId(),
        isSuspicious: false,
        isNewDevice: false,
        requiresReauth: false,
      };

      // Attach to request
      request.authContext = authContext;
      request.user = user;
      request.sessionId = payload.sessionId;

      // Check for suspicious activity
      if (await isSuspiciousActivity(request, payload)) {
        authContext.isSuspicious = true;
        request.server.log.warn({
          msg: 'Suspicious activity detected',
          userId: user.id,
          ipAddress: request.ipAddress,
          userAgent: request.headers['user-agent'],
          path: request.url,
        });
      }

    } catch (error) {
      request.server.log.error({ err: error, msg: 'Authentication middleware error' });
      
      if (error instanceof Error && error.message.includes('AUTH_')) {
        // This is an auth error, pass it through
        throw error;
      }

      // Handle other errors
      const statusCode = getErrorStatusCode(error);
      const errorMessage = getErrorMessage(error);
      
      return reply.code(statusCode).send({
        success: false,
        error: errorMessage,
        errorCode: getErrorCode(error),
        timestamp: new Date().toISOString(),
      });
    }
  };
}

// =============================================================================
// MIDDLEWARE PRESETS
// =============================================================================

/**
 * Middleware for protected routes (requires authentication)
 */
export const requireAuth = createAuthMiddleware({
  required: true,
  allowedTokenTypes: [TokenType.ACCESS, TokenType.DESKTOP_LONG_LIVED],
});

/**
 * Middleware for optional authentication
 */
export const optionalAuth = createAuthMiddleware({
  required: false,
});

/**
 * Middleware for admin-only routes
 */
export const requireAdmin = createAuthMiddleware({
  required: true,
  allowedTokenTypes: [TokenType.ACCESS],
  requirePermissions: ['admin'],
});

/**
 * Middleware for desktop app only
 */
export const requireDesktop = createAuthMiddleware({
  required: true,
  allowedTokenTypes: [TokenType.DESKTOP_LONG_LIVED],
  allowedSources: [AuthSource.DESKTOP],
});

/**
 * Middleware for premium features
 */
export const requirePremium = createAuthMiddleware({
  required: true,
  requireFeatures: ['premium'],
});

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Extract IP address from request
 */
function extractIpAddress(request: FastifyRequest): string {
  return (
    (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (request.headers['x-real-ip'] as string) ||
    request.ip ||
    'unknown'
  );
}

/**
 * Check if request has authorization header
 */
function hasAuthHeader(request: FastifyRequest): boolean {
  const authHeader = request.headers.authorization;
  return !!(authHeader && authHeader.startsWith('Bearer '));
}

/**
 * Extract token from authorization header
 */
function extractTokenFromHeader(request: FastifyRequest): string | null {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1] || null;
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Check for suspicious activity
 */
async function isSuspiciousActivity(
  request: AuthenticatedRequest,
  payload: JwtPayload
): Promise<boolean> {
  // Implement suspicious activity detection
  // This is a simplified version - in production you'd have more sophisticated checks
  
  const suspiciousIndicators = [];

  // Check for unusual user agent
  const userAgent = request.headers['user-agent'] || '';
  if (!userAgent || userAgent.length < 10) {
    suspiciousIndicators.push('unusual_user_agent');
  }

  // Check for rapid requests (would need rate limiting data)
  // suspiciousIndicators.push('rapid_requests');

  // Check for unusual geographic location (would need IP geolocation)
  // suspiciousIndicators.push('unusual_location');

  return suspiciousIndicators.length >= 2;
}

/**
 * Get HTTP status code for error
 */
function getErrorStatusCode(error: any): number {
  if (error instanceof Error) {
    if (error.message.includes('TOKEN_INVALID') || error.message.includes('Authentication required')) {
      return 401;
    }
    if (error.message.includes('INSUFFICIENT_PERMISSIONS') || error.message.includes('FEATURE_NOT_AVAILABLE')) {
      return 403;
    }
    if (error.message.includes('SESSION_INVALID')) {
      return 401;
    }
  }
  return 500;
}

/**
 * Get error message for response
 */
function getErrorMessage(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Authentication failed';
}

/**
 * Get error code for response
 */
function getErrorCode(error: any): string {
  if (error instanceof Error) {
    if (error.message.includes('TOKEN_INVALID')) return 'TOKEN_INVALID';
    if (error.message.includes('SESSION_INVALID')) return 'SESSION_INVALID';
    if (error.message.includes('INSUFFICIENT_PERMISSIONS')) return 'INSUFFICIENT_PERMISSIONS';
    if (error.message.includes('FEATURE_NOT_AVAILABLE')) return 'FEATURE_NOT_AVAILABLE';
  }
  return 'AUTH_ERROR';
}

// =============================================================================
// TYPE DECLARATIONS
// =============================================================================

declare module 'fastify' {
  interface FastifyRequest {
    authContext?: AuthContext;
    user?: AuthenticatedUser;
    sessionId?: string;
    ipAddress?: string;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  extractIpAddress,
  hasAuthHeader,
  extractTokenFromHeader,
  generateRequestId,
};

export type { AuthMiddlewareOptions, AuthenticatedRequest };