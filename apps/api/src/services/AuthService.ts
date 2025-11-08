/**
 * @fileoverview Authentication Service for JobSwipe
 * @description Handles JWT token validation, user authentication, and session management
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Critical security component - handles authentication and authorization
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { FastifyInstance } from 'fastify';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export interface JWTPayload {
  sub: string; // User ID (subject)
  userId: string; // Alias for sub
  email: string;
  role: string;
  status: string;
  iat: number; // Issued at
  exp: number; // Expires at
  jti?: string; // JWT ID
  sessionId?: string;
  deviceId?: string;
  deviceType?: string;
}

export interface TokenVerificationResult {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
  expired?: boolean;
}

export interface CreateTokenRequest {
  userId: string;
  email: string;
  role?: string;
  status?: string;
  sessionId?: string;
  deviceId?: string;
  deviceType?: string;
  expiresIn?: string | number;
}

export interface CreateTokenResult {
  token: string;
  tokenId: string;
  expiresIn: number;
  expiresAt: Date;
  issuedAt: Date;
}

export interface RefreshTokenRequest {
  refreshToken: string;
  deviceId?: string;
}

export interface AuthContext {
  user: {
    id: string;
    email: string;
    role: string;
    status: string;
  };
  session: {
    id: string;
    deviceId?: string;
    deviceType?: string;
  };
  token: {
    jti: string;
    iat: number;
    exp: number;
  };
}

// =============================================================================
// AUTHENTICATION SERVICE
// =============================================================================

export class AuthService {
  private jwtSecret: string;
  private jwtRefreshSecret: string;
  private defaultExpiresIn: string;
  private refreshExpiresIn: string;
  private saltRounds: number;
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;

    // SECURITY FIX: Require JWT secrets to be set in environment - no fallback defaults
    // This prevents using predictable secrets that could compromise authentication
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      const errorMsg = 'CRITICAL SECURITY ERROR: JWT_SECRET and JWT_REFRESH_SECRET must be set in environment variables. Never use default secrets.';
      this.fastify.log.fatal(errorMsg);
      throw new Error(errorMsg);
    }

    // Load configuration from environment (all secrets required, other settings have safe defaults)
    this.jwtSecret = process.env.JWT_SECRET;
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    this.defaultExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
    this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');

    // Additional validation: ensure secrets are strong enough
    if (this.jwtSecret.length < 32) {
      this.fastify.log.warn('⚠️  JWT_SECRET is shorter than 32 characters. Consider using a stronger secret.');
    }
    if (this.jwtRefreshSecret.length < 32) {
      this.fastify.log.warn('⚠️  JWT_REFRESH_SECRET is shorter than 32 characters. Consider using a stronger secret.');
    }

    this.fastify.log.info('✅ AuthService initialized securely with configuration:', {
      defaultExpiresIn: this.defaultExpiresIn,
      refreshExpiresIn: this.refreshExpiresIn,
      saltRounds: this.saltRounds,
      jwtSecretLength: this.jwtSecret.length,
      refreshSecretLength: this.jwtRefreshSecret.length,
      environment: process.env.NODE_ENV || 'development'
    });
  }

  // =============================================================================
  // JWT TOKEN MANAGEMENT
  // =============================================================================

  /**
   * Create a new JWT access token
   */
  async createToken(request: CreateTokenRequest): Promise<CreateTokenResult> {
    try {
      const tokenId = randomUUID();
      const issuedAt = new Date();
      const expiresIn = typeof request.expiresIn === 'string'
        ? this.parseExpiration(request.expiresIn)
        : request.expiresIn || this.parseExpiration(this.defaultExpiresIn);

      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      const payload: JWTPayload = {
        sub: request.userId,
        userId: request.userId,
        email: request.email,
        role: request.role || 'user',
        status: request.status || 'active',
        iat: Math.floor(issuedAt.getTime() / 1000),
        exp: Math.floor(expiresAt.getTime() / 1000),
        jti: tokenId,
        sessionId: request.sessionId,
        deviceId: request.deviceId,
        deviceType: request.deviceType,
      };

      const token = jwt.sign(payload, this.jwtSecret, {
        algorithm: 'HS256',
      });

      this.fastify.log.info('JWT token created successfully', {
        tokenId,
        userId: request.userId,
        email: request.email,
        expiresAt: expiresAt.toISOString(),
        deviceId: request.deviceId,
      });

      return {
        token,
        tokenId,
        expiresIn,
        expiresAt,
        issuedAt,
      };

    } catch (error) {
      this.fastify.log.error('Failed to create JWT token:', error);
      throw new Error('Token creation failed');
    }
  }

  /**
   * Verify and decode a JWT token
   */
  async verifyToken(token: string): Promise<TokenVerificationResult> {
    try {
      if (!token) {
        return {
          valid: false,
          error: 'Token is required',
        };
      }

      const payload = jwt.verify(token, this.jwtSecret, {
        algorithms: ['HS256'],
      }) as JWTPayload;

      // Additional validation
      if (!payload.sub || !payload.userId || !payload.email) {
        return {
          valid: false,
          error: 'Invalid token payload - missing required fields',
        };
      }

      // Check if user still exists and is active
      if (this.fastify.db) {
        try {
          const user = await this.fastify.db.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, email: true, isActive: true, status: true },
          });

          if (!user) {
            return {
              valid: false,
              error: 'User not found',
            };
          }

          if (!user.isActive || user.status !== 'ACTIVE') {
            return {
              valid: false,
              error: 'User account is not active',
            };
          }
        } catch (dbError) {
          this.fastify.log.warn('Could not verify user status from database:', dbError);
          // Continue with token validation if DB is unavailable
        }
      }

      this.fastify.log.debug('JWT token verified successfully', {
        tokenId: payload.jti,
        userId: payload.userId,
        email: payload.email,
        expiresAt: new Date(payload.exp * 1000).toISOString(),
      });

      return {
        valid: true,
        payload,
      };

    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        this.fastify.log.warn('JWT token expired:', {
          expiredAt: error.expiredAt,
        });
        return {
          valid: false,
          error: 'Token expired',
          expired: true,
        };
      }

      if (error instanceof jwt.JsonWebTokenError) {
        this.fastify.log.warn('JWT token validation failed:', error.message);
        return {
          valid: false,
          error: 'Invalid token',
        };
      }

      this.fastify.log.error('Unexpected error during token verification:', error);
      return {
        valid: false,
        error: 'Token verification failed',
      };
    }
  }

  /**
   * Create a refresh token
   */
  async createRefreshToken(userId: string, deviceId?: string): Promise<string> {
    try {
      const payload = {
        sub: userId,
        userId: userId,
        type: 'refresh',
        deviceId: deviceId,
        jti: randomUUID(),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + this.parseExpiration(this.refreshExpiresIn),
      };

      const refreshToken = jwt.sign(payload, this.jwtRefreshSecret, {
        algorithm: 'HS256',
      });

      this.fastify.log.info('Refresh token created successfully', {
        userId,
        deviceId,
        tokenId: payload.jti,
        expiresAt: new Date(payload.exp * 1000).toISOString(),
      });

      return refreshToken;

    } catch (error) {
      this.fastify.log.error('Failed to create refresh token:', error);
      throw new Error('Refresh token creation failed');
    }
  }

  /**
   * Verify and use a refresh token to create a new access token
   */
  async refreshAccessToken(request: RefreshTokenRequest): Promise<CreateTokenResult> {
    try {
      const payload = jwt.verify(request.refreshToken, this.jwtRefreshSecret, {
        algorithms: ['HS256'],
      }) as any;

      if (payload.type !== 'refresh') {
        throw new Error('Invalid refresh token type');
      }

      // Verify user still exists and is active
      if (this.fastify.db) {
        const user = await this.fastify.db.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, email: true, isActive: true, status: true, role: true },
        });

        if (!user) {
          throw new Error('User not found');
        }

        if (!user.isActive || user.status !== 'ACTIVE') {
          throw new Error('User account is not active');
        }

        // Create new access token
        return await this.createToken({
          userId: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          deviceId: request.deviceId || payload.deviceId,
        });
      } else {
        throw new Error('Database not available for user verification');
      }

    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        this.fastify.log.warn('Refresh token expired');
        throw new Error('Refresh token expired');
      }

      if (error instanceof jwt.JsonWebTokenError) {
        this.fastify.log.warn('Invalid refresh token:', error.message);
        throw new Error('Invalid refresh token');
      }

      this.fastify.log.error('Refresh token verification failed:', error);
      throw new Error('Refresh token verification failed');
    }
  }

  // =============================================================================
  // PASSWORD MANAGEMENT
  // =============================================================================

  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    try {
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const hashedPassword = await bcrypt.hash(password, this.saltRounds);

      this.fastify.log.debug('Password hashed successfully', {
        saltRounds: this.saltRounds,
      });

      return hashedPassword;

    } catch (error) {
      this.fastify.log.error('Password hashing failed:', error);
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Verify a password against its hash
   */
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      if (!password || !hashedPassword) {
        return false;
      }

      const isValid = await bcrypt.compare(password, hashedPassword);

      this.fastify.log.debug('Password verification completed', {
        isValid,
      });

      return isValid;

    } catch (error) {
      this.fastify.log.error('Password verification failed:', error);
      return false;
    }
  }

  // =============================================================================
  // AUTHENTICATION CONTEXT
  // =============================================================================

  /**
   * Extract authentication context from a verified JWT payload
   */
  createAuthContext(payload: JWTPayload): AuthContext {
    return {
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        status: payload.status,
      },
      session: {
        id: payload.sessionId || 'unknown',
        deviceId: payload.deviceId,
        deviceType: payload.deviceType,
      },
      token: {
        jti: payload.jti || 'unknown',
        iat: payload.iat,
        exp: payload.exp,
      },
    };
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Parse expiration time string to seconds
   */
  private parseExpiration(expiresIn: string): number {
    const units: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid expiration format: ${expiresIn}`);
    }

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }

  /**
   * Generate a secure random token for various purposes
   */
  generateSecureToken(length: number = 32): string {
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Cleanup and destroy service resources
   */
  cleanup(): void {
    this.fastify.log.info('AuthService cleanup completed');
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create and configure AuthService instance
 */
export function createAuthService(fastify: FastifyInstance): AuthService {
  return new AuthService(fastify);
}

export default AuthService;