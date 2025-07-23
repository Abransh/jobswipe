/**
 * @fileoverview Production Authentication Routes for JobSwipe API
 * @description Enterprise-grade authentication with database integration
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  createAccessTokenConfig, 
  createRefreshTokenConfig,
  hashPassword,
  verifyPassword,
  createAuthError,
  AuthErrorCode,
  AuthSource,
  SessionId
} from '@jobswipe/shared';
import { z } from 'zod';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  source: z.enum(['web', 'desktop', 'mobile', 'api']).default('web'),
  rememberMe: z.boolean().optional().default(false),
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
});

const RegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  source: z.enum(['web', 'desktop', 'mobile', 'api']).default('web'),
  dataConsent: z.boolean().refine(val => val === true, 'Data consent is required'),
  marketingConsent: z.boolean().optional().default(false),
});

const RefreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

const PasswordResetRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const PasswordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
});

const VerifyTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate session ID
 */
function generateSessionId(): SessionId {
  return crypto.randomUUID() as SessionId;
}

/**
 * Get client IP address
 */
function getClientIP(request: FastifyRequest): string {
  const forwarded = request.headers['x-forwarded-for'];
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return ip?.split(',')[0]?.trim() || request.headers['x-real-ip'] || request.ip;
}

/**
 * Get user agent
 */
function getUserAgent(request: FastifyRequest): string {
  return request.headers['user-agent'] || 'Unknown';
}

/**
 * Set HTTP-only cookies for tokens
 */
function setTokenCookies(reply: FastifyReply, accessToken: string, refreshToken: string, rememberMe: boolean = false): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const domain = process.env.COOKIE_DOMAIN;
  
  // Access token cookie (15 minutes)
  reply.setCookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 15 * 60, // 15 minutes
    domain,
    path: '/',
  });

  // Refresh token cookie (30 days or session)
  reply.setCookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 : undefined, // 30 days or session
    domain,
    path: '/',
  });
}

/**
 * Clear authentication cookies
 */
function clearTokenCookies(reply: FastifyReply): void {
  const domain = process.env.COOKIE_DOMAIN;
  
  reply.clearCookie('accessToken', {
    domain,
    path: '/',
  });
  
  reply.clearCookie('refreshToken', {
    domain,
    path: '/',
  });
}

// =============================================================================
// AUTHENTICATION ROUTES
// =============================================================================

export async function registerAuthRoutes(fastify: FastifyInstance): Promise<void> {
  // Ensure database is available
  if (!fastify.db) {
    throw new Error('Database connection is required for authentication routes');
  }

  // =============================================================================
  // USER REGISTRATION
  // =============================================================================

  fastify.post('/register', {
    schema: {
      summary: 'Register a new user account',
      description: 'Create a new user account with email and password',
      tags: ['Authentication'],
      body: {
        type: 'object',
        required: ['email', 'password', 'name', 'dataConsent'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          name: { type: 'string', minLength: 1, maxLength: 100 },
          source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
          dataConsent: { type: 'boolean' },
          marketingConsent: { type: 'boolean' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' },
                status: { type: 'string' },
                emailVerified: { type: 'boolean' },
                createdAt: { type: 'string' },
              },
            },
            tokens: {
              type: 'object',
              properties: {
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
                tokenType: { type: 'string' },
                expiresIn: { type: 'number' },
              },
            },
            message: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            errorCode: { type: 'string' },
            details: { type: 'object' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const body = RegisterSchema.parse(request.body);
      const ipAddress = getClientIP(request);
      const userAgent = getUserAgent(request);

      // Check if user already exists
      const existingUser = await fastify.db.user.findUnique({
        where: { email: body.email.toLowerCase() },
      });

      if (existingUser) {
        return reply.code(400).send({
          success: false,
          error: 'User already exists with this email address',
          errorCode: 'USER_EXISTS',
        });
      }

      // Hash password
      const passwordHash = await hashPassword(body.password);

      // Create user with profile
      const sessionId = generateSessionId();
      
      const user = await fastify.db.user.create({
        data: {
          email: body.email.toLowerCase(),
          passwordHash,
          name: body.name,
          role: 'USER',
          status: 'ACTIVE',
          dataConsent: body.dataConsent,
          consentDate: new Date(),
          ipAddress,
          userAgent,
          locale: 'en',
          profile: {
            create: {
              firstName: body.name.split(' ')[0],
              lastName: body.name.split(' ').slice(1).join(' ') || undefined,
              displayName: body.name,
            },
          },
          preferences: {
            create: {
              emailNotifications: true,
              pushNotifications: true,
              marketingConsent: body.marketingConsent,
              dataProcessingConsent: body.dataConsent,
            },
          },
        },
        include: {
          profile: true,
          preferences: true,
        },
      });

      // Generate tokens
      const accessTokenConfig = createAccessTokenConfig(
        user.id,
        user.email,
        user.name,
        user.role,
        body.source as AuthSource,
        sessionId
      );

      const refreshTokenConfig = createRefreshTokenConfig(
        user.id,
        user.email,
        body.source as AuthSource,
        sessionId
      );

      const accessToken = await fastify.jwtService.createToken(accessTokenConfig);
      const refreshToken = await fastify.jwtService.createToken(refreshTokenConfig);

      // Set HTTP-only cookies
      setTokenCookies(reply, accessToken, refreshToken, false);

      // Log successful registration
      fastify.log.info('User registered successfully', {
        userId: user.id,
        email: user.email,
        source: body.source,
        ipAddress,
      });

      return reply.code(201).send({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          emailVerified: !!user.emailVerified,
          createdAt: user.createdAt.toISOString(),
        },
        tokens: {
          accessToken,
          refreshToken,
          tokenType: 'Bearer',
          expiresIn: 15 * 60, // 15 minutes
        },
        message: 'User registered successfully',
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation failed',
          errorCode: 'VALIDATION_ERROR',
          details: error.errors,
        });
      }

      fastify.log.error('Registration failed:', error);
      return reply.code(500).send({
        success: false,
        error: 'Registration failed',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  });

  // =============================================================================
  // USER LOGIN
  // =============================================================================

  fastify.post('/login', {
    schema: {
      summary: 'Authenticate user with email and password',
      description: 'Login with email and password to get access tokens',
      tags: ['Authentication'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
          rememberMe: { type: 'boolean' },
          deviceId: { type: 'string' },
          deviceName: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' },
                status: { type: 'string' },
                emailVerified: { type: 'boolean' },
                lastLoginAt: { type: 'string' },
              },
            },
            tokens: {
              type: 'object',
              properties: {
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
                tokenType: { type: 'string' },
                expiresIn: { type: 'number' },
              },
            },
          },
        },
        401: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            errorCode: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const body = LoginSchema.parse(request.body);
      const ipAddress = getClientIP(request);
      const userAgent = getUserAgent(request);

      // Find user by email
      const user = await fastify.db.user.findUnique({
        where: { email: body.email.toLowerCase() },
        include: {
          profile: true,
        },
      });

      if (!user || !user.passwordHash) {
        return reply.code(401).send({
          success: false,
          error: 'Invalid email or password',
          errorCode: 'INVALID_CREDENTIALS',
        });
      }

      // Check user status
      if (user.status !== 'ACTIVE') {
        return reply.code(401).send({
          success: false,
          error: 'Account is not active',
          errorCode: 'ACCOUNT_INACTIVE',
        });
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        return reply.code(401).send({
          success: false,
          error: 'Account is temporarily locked due to too many failed attempts',
          errorCode: 'ACCOUNT_LOCKED',
        });
      }

      // Verify password
      const isValidPassword = await verifyPassword(body.password, user.passwordHash);
      
      if (!isValidPassword) {
        // Increment login attempts
        const loginAttempts = user.loginAttempts + 1;
        const shouldLock = loginAttempts >= 5;
        
        await fastify.db.user.update({
          where: { id: user.id },
          data: {
            loginAttempts,
            lockedUntil: shouldLock ? new Date(Date.now() + 30 * 60 * 1000) : null, // 30 minutes
          },
        });

        return reply.code(401).send({
          success: false,
          error: 'Invalid email or password',
          errorCode: 'INVALID_CREDENTIALS',
        });
      }

      // Reset login attempts and update last login
      const sessionId = generateSessionId();
      
      const updatedUser = await fastify.db.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
          ipAddress,
          userAgent,
        },
        include: {
          profile: true,
        },
      });

      // Generate tokens
      const accessTokenConfig = createAccessTokenConfig(
        user.id,
        user.email,
        user.name,
        user.role,
        body.source as AuthSource,
        sessionId
      );

      const refreshTokenConfig = createRefreshTokenConfig(
        user.id,
        user.email,
        body.source as AuthSource,
        sessionId
      );

      const accessToken = await fastify.jwtService.createToken(accessTokenConfig);
      const refreshToken = await fastify.jwtService.createToken(refreshTokenConfig);

      // Set HTTP-only cookies
      setTokenCookies(reply, accessToken, refreshToken, body.rememberMe);

      // Log successful login
      fastify.log.info('User logged in successfully', {
        userId: user.id,
        email: user.email,
        source: body.source,
        ipAddress,
      });

      return reply.send({
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          status: updatedUser.status,
          emailVerified: !!updatedUser.emailVerified,
          lastLoginAt: updatedUser.lastLoginAt?.toISOString(),
        },
        tokens: {
          accessToken,
          refreshToken,
          tokenType: 'Bearer',
          expiresIn: 15 * 60, // 15 minutes
        },
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation failed',
          errorCode: 'VALIDATION_ERROR',
          details: error.errors,
        });
      }

      fastify.log.error('Login failed:', error);
      return reply.code(500).send({
        success: false,
        error: 'Login failed',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  });

  // =============================================================================
  // TOKEN REFRESH
  // =============================================================================

  fastify.post('/token/refresh', {
    schema: {
      summary: 'Refresh access token',
      description: 'Refresh access token using refresh token',
      tags: ['Authentication'],
      body: {
        type: 'object',
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            tokens: {
              type: 'object',
              properties: {
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
                tokenType: { type: 'string' },
                expiresIn: { type: 'number' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const body = RefreshTokenSchema.parse(request.body);
      
      // Get refresh token from body or cookies
      const refreshToken = body.refreshToken || request.cookies.refreshToken;
      
      if (!refreshToken) {
        return reply.code(401).send({
          success: false,
          error: 'Refresh token is required',
          errorCode: 'MISSING_REFRESH_TOKEN',
        });
      }

      // Verify refresh token
      const verificationResult = await fastify.jwtService.verifyToken(refreshToken);
      
      if (!verificationResult.valid || !verificationResult.payload) {
        clearTokenCookies(reply);
        return reply.code(401).send({
          success: false,
          error: 'Invalid or expired refresh token',
          errorCode: 'INVALID_REFRESH_TOKEN',
        });
      }

      const { payload } = verificationResult;

      // Verify user still exists and is active
      const user = await fastify.db.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.status !== 'ACTIVE') {
        clearTokenCookies(reply);
        return reply.code(401).send({
          success: false,
          error: 'User not found or inactive',
          errorCode: 'USER_INACTIVE',
        });
      }

      // Generate new tokens
      const sessionId = payload.sessionId || generateSessionId();
      
      const accessTokenConfig = createAccessTokenConfig(
        user.id,
        user.email,
        user.name,
        user.role,
        payload.source,
        sessionId
      );

      const refreshTokenConfig = createRefreshTokenConfig(
        user.id,
        user.email,
        payload.source,
        sessionId
      );

      const newAccessToken = await fastify.jwtService.createToken(accessTokenConfig);
      const newRefreshToken = await fastify.jwtService.createToken(refreshTokenConfig);

      // Set new cookies
      setTokenCookies(reply, newAccessToken, newRefreshToken, true);

      return reply.send({
        success: true,
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          tokenType: 'Bearer',
          expiresIn: 15 * 60, // 15 minutes
        },
      });

    } catch (error) {
      fastify.log.error('Token refresh failed:', error);
      clearTokenCookies(reply);
      return reply.code(401).send({
        success: false,
        error: 'Token refresh failed',
        errorCode: 'REFRESH_FAILED',
      });
    }
  });

  // =============================================================================
  // TOKEN VERIFICATION
  // =============================================================================

  fastify.post('/verify-token', {
    schema: {
      summary: 'Verify JWT token',
      description: 'Verify the validity of a JWT token and return user information',
      tags: ['Authentication'],
      security: [{ Bearer: [] }],
      body: {
        type: 'object',
        properties: {
          token: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' },
                status: { type: 'string' },
                emailVerified: { type: 'boolean' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
            valid: { type: 'boolean' },
            needsRefresh: { type: 'boolean' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const body = VerifyTokenSchema.parse(request.body);
      
      // Get token from body, header, or cookies
      const token = body.token || 
        request.headers.authorization?.replace('Bearer ', '') ||
        request.cookies.accessToken;
      
      if (!token) {
        return reply.code(401).send({
          success: false,
          error: 'Token is required',
          errorCode: 'MISSING_TOKEN',
        });
      }

      // Verify token
      const verificationResult = await fastify.jwtService.verifyToken(token);
      
      if (!verificationResult.valid || !verificationResult.payload) {
        return reply.code(401).send({
          success: false,
          error: 'Invalid or expired token',
          errorCode: 'INVALID_TOKEN',
          valid: false,
        });
      }

      const { payload, needsRefresh } = verificationResult;

      // Get user from database
      const user = await fastify.db.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        return reply.code(401).send({
          success: false,
          error: 'User not found',
          errorCode: 'USER_NOT_FOUND',
          valid: false,
        });
      }

      return reply.send({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          emailVerified: !!user.emailVerified,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        valid: true,
        needsRefresh: !!needsRefresh,
      });

    } catch (error) {
      fastify.log.error('Token verification failed:', error);
      return reply.code(500).send({
        success: false,
        error: 'Token verification failed',
        errorCode: 'VERIFICATION_FAILED',
        valid: false,
      });
    }
  });

  // =============================================================================
  // LOGOUT
  // =============================================================================

  fastify.post('/logout', {
    schema: {
      summary: 'Logout user',
      description: 'Logout user and invalidate tokens',
      tags: ['Authentication'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // Get tokens from cookies or headers
      const accessToken = request.cookies.accessToken || 
        request.headers.authorization?.replace('Bearer ', '');
      const refreshToken = request.cookies.refreshToken;

      // Try to revoke tokens if they exist
      if (accessToken) {
        try {
          const result = await fastify.jwtService.verifyToken(accessToken);
          if (result.valid && result.payload) {
            await fastify.jwtService.revokeToken(result.payload.jti);
          }
        } catch (error) {
          // Ignore token verification errors during logout
        }
      }

      if (refreshToken) {
        try {
          const result = await fastify.jwtService.verifyToken(refreshToken);
          if (result.valid && result.payload) {
            await fastify.jwtService.revokeToken(result.payload.jti);
          }
        } catch (error) {
          // Ignore token verification errors during logout
        }
      }

      // Clear cookies
      clearTokenCookies(reply);

      return reply.send({
        success: true,
        message: 'Logged out successfully',
      });

    } catch (error) {
      fastify.log.error('Logout failed:', error);
      clearTokenCookies(reply);
      
      return reply.send({
        success: true,
        message: 'Logged out successfully',
      });
    }
  });

  fastify.log.info('✅ Production authentication routes registered successfully');
}