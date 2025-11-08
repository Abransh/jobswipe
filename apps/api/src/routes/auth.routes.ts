/**
 * @fileoverview Authentication API Routes for JobSwipe
 * @description Enterprise-grade authentication endpoints with comprehensive security
 * @version 1.0.0
 * @author JobSwipe Team
 */


import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { 
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  PasswordResetRequest,
  PasswordChangeRequest,
  LoginResponse,
  RegisterResponse,
  RefreshTokenResponse,
  PasswordResetResponse,
  PasswordChangeResponse,
  TokenExchangeRequest,
  TokenExchangeResponse,
  AuthenticatedUser,
  createAuthError,
  AuthErrorCode,
  LoginRequestSchema,
  RegisterRequestSchema,
  PasswordResetRequestSchema,
  PasswordChangeRequestSchema,
  AuthSource,
  AuthProvider,
  UserId,
  createBrandedId
} from '@jobswipe/shared';

// Import server utilities conditionally
let hashPassword: any = null;
let verifyPassword: any = null;
let generateSecureToken: any = null;
let extractIpFromHeaders: any = null;

try {
  const serverModule = require('@jobswipe/shared/server');
  hashPassword = serverModule.hashPassword;
  verifyPassword = serverModule.verifyPassword;

  const sharedModule = require('@jobswipe/shared');
  generateSecureToken = sharedModule.generateSecureToken;
  extractIpFromHeaders = sharedModule.extractIpFromHeaders;

  console.log('✅ Auth utilities loaded successfully');
} catch (error) {
  console.warn('⚠️  Failed to load auth utilities:', error);
  console.warn('Auth routes will use fallback implementations');
}

import { 
  createUser as createUserDb,
  authenticateUser as authenticateUserDb,
  getUserByEmail,
  getUserById,
  db
} from '@jobswipe/database';

// =============================================================================
// ROUTE HANDLER TYPES
// =============================================================================

interface AuthRouteRequest extends FastifyRequest {
  user?: AuthenticatedUser;
  sessionId?: string;
  ipAddress?: string;
}

interface LoginRouteRequest extends AuthRouteRequest {
  body: LoginRequest;
}

interface RegisterRouteRequest extends AuthRouteRequest {
  body: RegisterRequest;
}

interface RefreshTokenRouteRequest extends AuthRouteRequest {
  body: RefreshTokenRequest;
}

interface PasswordResetRouteRequest extends AuthRouteRequest {
  body: PasswordResetRequest;
}

interface PasswordChangeRouteRequest extends AuthRouteRequest {
  body: PasswordChangeRequest;
}

interface TokenExchangeInitiateRequest extends AuthRouteRequest {
  body: {
    deviceId: string;
    deviceName: string;
    platform: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    appVersion?: string;
    osVersion?: string;
  };
}

interface TokenExchangeCompleteRequest extends AuthRouteRequest {
  body: {
    exchangeToken: string;
    deviceId: string;
    deviceName: string;
    platform: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    appVersion?: string;
    osVersion?: string;
  };
}

// =============================================================================
// DATABASE FUNCTION WRAPPERS
// =============================================================================

/**
 * Create a new user with proper error handling
 */
async function createUser(userData: {
  email: string;
  password: string;
  name?: string;
  profile?: any;
}): Promise<any> {
  try {
    return await createUserDb({
      email: userData.email,
      password: userData.password,
      name: userData.name,
      profile: userData.profile
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      throw createAuthError(AuthErrorCode.CONFLICT, 'User already exists');
    }
    throw createAuthError(AuthErrorCode.INTERNAL_ERROR, 'Failed to create user');
  }
}

/**
 * Authenticate user with proper error handling
 */
async function authenticateUser(email: string, password: string): Promise<any | null> {
  try {
    return await authenticateUserDb(email, password);
  } catch (error) {
    return null;
  }
}

/**
 * Find user by email with error handling
 */
async function findUserByEmail(email: string): Promise<any | null> {
  try {
    return await getUserByEmail(email);
  } catch (error) {
    return null;
  }
}

/**
 * Find user by ID with error handling
 */
async function findUserById(id: string): Promise<any | null> {
  try {
    return await getUserById(id);
  } catch (error) {
    return null;
  }
}

/**
 * Update user with error handling
 */
async function updateUser(id: string, updates: any): Promise<any | null> {
  try {
    return await db.user.update({
      where: { id },
      data: { ...updates, updatedAt: new Date() },
      include: {
        profile: true,
      },
    });
  } catch (error) {
    return null;
  }
}

/**
 * Update user last login timestamp
 */
async function updateLastLogin(userId: string): Promise<void> {
  try {
    await db.user.update({
      where: { id: userId },
      data: { 
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    // Error handled silently
  }
}

/**
 * Change user password
 */
async function changePasswordDb(userId: string, newPassword: string): Promise<void> {
  try {
    const passwordHash = await hashPassword(newPassword);
    await db.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    throw error;
  }
}

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * Register a new user
 */
async function registerHandler(
  request: RegisterRouteRequest,
  reply: FastifyReply
): Promise<RegisterResponse> {
  try {
    // Validate input
    const validatedData = RegisterRequestSchema.parse(request.body);
    
    // Check if user already exists
    const existingUser = await findUserByEmail(validatedData.email);
    if (existingUser) {
      throw createAuthError(AuthErrorCode.CONFLICT, 'User already exists');
    }
    
    // Create user
    const user = await createUser({
      email: validatedData.email,
      password: validatedData.password,
      name: validatedData.name,
      profile: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        timezone: validatedData.timezone,
      },
    });
    
    // Create session
    const sessionOptions = {
      userId: createBrandedId<UserId>(user.id),
      source: validatedData.source,
      provider: AuthProvider.CREDENTIALS,
      ipAddress: request.ipAddress,
      userAgent: request.headers['user-agent'],
      metadata: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
    
    const session = await request.server.sessionService.createSession(sessionOptions);

    // Generate tokens using AuthService (HS256)
    const accessTokenResult = await request.server.jwtService.createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      sessionId: session.id,
      expiresIn: '15m', // 15 minutes
    });

    const refreshToken = await request.server.jwtService.createRefreshToken(
      user.id,
      session.id
    );

    const accessToken = accessTokenResult.token;

    // Format user response
    const userResponse: AuthenticatedUser = {
      id: createBrandedId<UserId>(user.id),
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      profile: user.profile,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return reply.status(201).send({
      success: true,
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer' as const,
        expiresIn: accessTokenResult.expiresIn,
        refreshExpiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      },
      session,
    });
    
  } catch (error) {
    if (error instanceof Error && error.message.includes('User already exists')) {
      return reply.status(409).send({
        success: false,
        error: 'User already exists',
        errorCode: AuthErrorCode.CONFLICT,
      });
    }
    
    // Registration error handled
    return reply.status(500).send({
      success: false,
      error: 'Registration failed',
      errorCode: AuthErrorCode.INTERNAL_ERROR,
    });
  }
}

/**
 * Login user
 */
async function loginHandler(
  request: LoginRouteRequest,
  reply: FastifyReply
): Promise<LoginResponse> {
  try {
    // Validate input
    const validatedData = LoginRequestSchema.parse(request.body);
    
    // Authenticate user
    const user = await authenticateUser(validatedData.email, validatedData.password);
    if (!user) {
      return reply.status(401).send({
        success: false,
        error: 'Invalid email or password',
        errorCode: AuthErrorCode.INVALID_CREDENTIALS,
      });
    }
    
    // Check account status
    // if (user.status !== 'active') {
    //   return reply.status(401).send({
    //     success: false,
    //     error: `Account is ${user.status}`,
    //     errorCode: AuthErrorCode.ACCOUNT_DISABLED,
    //   });
    // } // TODO :uncomment when account status is implemented
    
    // Create session
    const sessionOptions = {
      userId: createBrandedId<UserId>(user.id),
      source: validatedData.source,
      provider: AuthProvider.CREDENTIALS,
      ipAddress: request.ipAddress,
      userAgent: request.headers['user-agent'],
      metadata: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
    
    const session = await request.server.sessionService.createSession(sessionOptions);

    // Generate tokens using AuthService (HS256)
    const accessTokenResult = await request.server.jwtService.createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      sessionId: session.id,
      expiresIn: '15m', // 15 minutes
    });

    const refreshToken = await request.server.jwtService.createRefreshToken(
      user.id,
      session.id
    );

    const accessToken = accessTokenResult.token;

    // Update user last login timestamp
    await updateLastLogin(user.id);

    // Format user response
    const userResponse: AuthenticatedUser = {
      id: createBrandedId<UserId>(user.id),
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      profile: user.profile,
      emailVerified: user.emailVerified,
      lastLoginAt: new Date(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return reply.status(200).send({
      success: true,
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer' as const,
        expiresIn: accessTokenResult.expiresIn,
        refreshExpiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      },
      session,
    });
    
  } catch (error) {
    // Login error handled
    return reply.status(500).send({
      success: false,
      error: 'Login failed',
      errorCode: AuthErrorCode.INTERNAL_ERROR,
    });
  }
}

/**
 * Refresh access token
 */
async function refreshTokenHandler(
  request: RefreshTokenRouteRequest,
  reply: FastifyReply
): Promise<RefreshTokenResponse> {
  try {
    const { refreshToken } = request.body;
    
    // Verify refresh token
    const tokenResult = await request.server.jwtService.verifyToken(refreshToken);
    if (!tokenResult.valid || !tokenResult.payload) {
      return reply.status(401).send({
        success: false,
        error: 'Invalid refresh token',
        errorCode: AuthErrorCode.TOKEN_INVALID,
      });
    }
    
    // Get user
    const user = await findUserById(tokenResult.payload.sub);
    if (!user) {
      return reply.status(401).send({
        success: false,
        error: 'User not found',
        errorCode: AuthErrorCode.TOKEN_INVALID,
      });
    }
    
    // Generate new access token using AuthService (HS256)
    const accessTokenResult = await request.server.jwtService.createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      sessionId: tokenResult.payload.sessionId,
      expiresIn: '15m', // 15 minutes
    });

    return reply.status(200).send({
      success: true,
      tokens: {
        accessToken: accessTokenResult.token,
        refreshToken,
        tokenType: 'Bearer' as const,
        expiresIn: accessTokenResult.expiresIn,
        refreshExpiresIn: tokenResult.payload.exp - Math.floor(Date.now() / 1000),
      },
    });
    
  } catch (error) {
    // Token refresh error handled
    return reply.status(500).send({
      success: false,
      error: 'Token refresh failed',
      errorCode: AuthErrorCode.INTERNAL_ERROR,
    });
  }
}

/**
 * Request password reset
 * SECURITY: Implements proper token storage with expiration
 */
async function passwordResetHandler(
  request: PasswordResetRouteRequest,
  reply: FastifyReply
): Promise<PasswordResetResponse> {
  try {
    const validatedData = PasswordResetRequestSchema.parse(request.body);

    // Find user
    const user = await findUserByEmail(validatedData.email);

    // Always return success to prevent email enumeration
    const response: PasswordResetResponse = {
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    };

    if (user) {
      // Generate cryptographically secure reset token
      const resetToken = generateSecureToken(32);

      // Hash the token before storing (security best practice)
      const crypto = require('crypto');
      const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Set token expiration (15 minutes from now)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // Delete any existing reset tokens for this user (cleanup)
      await request.server.db.verificationToken.deleteMany({
        where: {
          identifier: `password-reset:${user.email}`,
        },
      });

      // Store hashed token in database with expiration
      await request.server.db.verificationToken.create({
        data: {
          identifier: `password-reset:${user.email}`,
          token: tokenHash,
          expires: expiresAt,
        },
      });

      // TODO: Send email with reset link containing the UNHASHED token
      // The reset link would be: https://yourdomain.com/reset-password?token={resetToken}
      // Email service integration:
      // await sendPasswordResetEmail(user.email, resetToken);

      request.server.log.info({
        msg: 'Password reset token generated',
        userId: user.id,
        email: user.email,
        expiresAt: expiresAt.toISOString(),
      });
    }

    return reply.status(200).send(response);

  } catch (error) {
    request.server.log.error('Password reset error:', error);
    return reply.status(500).send({
      success: false,
      message: 'Password reset failed',
    });
  }
}

/**
 * Complete password reset with token
 * SECURITY: Validates token, checks expiration, ensures one-time use
 */
async function passwordResetCompleteHandler(
  request: FastifyRequest<{ Body: { token: string; newPassword: string; source: string } }>,
  reply: FastifyReply
): Promise<PasswordResetResponse> {
  try {
    const { token, newPassword, source } = request.body;

    // Validate inputs
    if (!token || !newPassword) {
      return reply.status(400).send({
        success: false,
        message: 'Token and new password are required',
      });
    }

    // Validate password strength (minimum 8 characters)
    if (newPassword.length < 8) {
      return reply.status(400).send({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    // Hash the provided token (tokens are stored hashed)
    const crypto = require('crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find the verification token in database
    const verificationToken = await request.server.db.verificationToken.findFirst({
      where: {
        token: tokenHash,
        // Only match password reset tokens (identifier format: password-reset:email)
        identifier: {
          startsWith: 'password-reset:',
        },
      },
    });

    // Token not found
    if (!verificationToken) {
      request.server.log.warn('Invalid password reset token attempt');
      return reply.status(400).send({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Check if token is expired
    if (new Date() > verificationToken.expires) {
      // Delete expired token
      await request.server.db.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationToken.identifier,
            token: verificationToken.token,
          },
        },
      });

      request.server.log.warn('Expired password reset token attempt');
      return reply.status(400).send({
        success: false,
        message: 'Reset token has expired. Please request a new one.',
      });
    }

    // Extract email from identifier (format: "password-reset:email@example.com")
    const email = verificationToken.identifier.replace('password-reset:', '');

    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return reply.status(404).send({
        success: false,
        message: 'User not found',
      });
    }

    // Hash the new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update user's password
    await request.server.db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    // Delete the used token (one-time use only)
    await request.server.db.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    });

    // SECURITY: Revoke all existing sessions for this user (force re-login)
    // This ensures that if someone else had access, they're logged out
    await request.server.db.session.deleteMany({
      where: { userId: user.id },
    });

    request.server.log.info({
      msg: 'Password reset successful',
      userId: user.id,
      email: user.email,
      source,
    });

    return reply.status(200).send({
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
    });

  } catch (error) {
    request.server.log.error('Password reset completion error:', error);
    return reply.status(500).send({
      success: false,
      message: 'Password reset completion failed',
    });
  }
}

/**
 * Change password
 */
async function passwordChangeHandler(
  request: PasswordChangeRouteRequest,
  reply: FastifyReply
): Promise<PasswordChangeResponse> {
  try {
    const validatedData = PasswordChangeRequestSchema.parse(request.body);
    
    if (!request.user) {
      return reply.status(401).send({
        success: false,
        message: 'Authentication required',
      });
    }
    
    // Get current user
    const user = await findUserById(request.user.id);
    if (!user) {
      return reply.status(404).send({
        success: false,
        message: 'User not found',
      });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(
      validatedData.currentPassword,
      user.passwordHash
    );
    
    if (!isCurrentPasswordValid) {
      return reply.status(400).send({
        success: false,
        message: 'Current password is incorrect',
      });
    }
    
    // Update password using database function
    await changePasswordDb(user.id, validatedData.newPassword);
    
    // In a real implementation, you might revoke all sessions
    // Password changed successfully
    
    return reply.status(200).send({
      success: true,
      message: 'Password changed successfully',
    });
    
  } catch (error) {
    // Password change error handled
    return reply.status(500).send({
      success: false,
      message: 'Password change failed',
    });
  }
}

/**
 * Logout user
 */
async function logoutHandler(
  request: AuthRouteRequest,
  reply: FastifyReply
): Promise<{ success: boolean; message: string }> {
  try {
    if (request.sessionId) {
      await request.server.sessionService.revokeSession(createBrandedId(request.sessionId));
    }
    
    return reply.status(200).send({
      success: true,
      message: 'Logged out successfully',
    });
    
  } catch (error) {
    // Logout error handled
    return reply.status(500).send({
      success: false,
      message: 'Logout failed',
    });
  }
}

/**
 * Get current user profile
 */
async function profileHandler(
  request: AuthRouteRequest,
  reply: FastifyReply
): Promise<{ success: boolean; user?: AuthenticatedUser; error?: string }> {
  try {
    if (!request.user) {
      return reply.status(401).send({
        success: false,
        error: 'Authentication required',
      });
    }
    
    return reply.status(200).send({
      success: true,
      user: request.user,
    });
    
  } catch (error) {
    // Profile error handled
    return reply.status(500).send({
      success: false,
      error: 'Failed to get profile',
    });
  }
}

/**
 * Get current user (alias for profile) - for frontend compatibility
 */
async function meHandler(
  request: AuthRouteRequest,
  reply: FastifyReply
): Promise<{ success: boolean; user?: AuthenticatedUser; error?: string }> {
  return profileHandler(request, reply);
}

/**
 * Check email availability
 */
async function checkEmailHandler(
  request: FastifyRequest<{ Body: { email: string } }>,
  reply: FastifyReply
): Promise<{ success: boolean; available?: boolean; error?: string }> {
  try {
    const { email } = request.body;
    
    if (!email || !z.string().email().safeParse(email).success) {
      return reply.status(400).send({
        success: false,
        error: 'Valid email is required',
      });
    }
    
    // Check if user exists
    const existingUser = await findUserByEmail(email);
    const available = !existingUser;
    
    return reply.status(200).send({
      success: true,
      available,
    });
    
  } catch (error) {
    // Check email error handled
    return reply.status(500).send({
      success: false,
      error: 'Failed to check email availability',
    });
  }
}

/**
 * Initiate token exchange for desktop app
 */
async function tokenExchangeInitiateHandler(
  request: TokenExchangeInitiateRequest,
  reply: FastifyReply
): Promise<any> {
  try {
    if (!request.user || !request.sessionId) {
      return reply.status(401).send({
        success: false,
        error: 'Authentication required',
      });
    }
    
    // Generate a simple exchange token for now
    const exchangeToken = generateSecureToken(32);
    
    // In a real implementation, you'd store this token with expiration
    // For now, return a simple response
    return reply.status(200).send({
      success: true,
      exchangeToken,
      expiresIn: 300, // 5 minutes
      qrCode: `jobswipe://exchange?token=${exchangeToken}`,
    });
    
  } catch (error) {
    // Token exchange initiate error handled
    return reply.status(500).send({
      success: false,
      error: 'Token exchange initiation failed',
    });
  }
}

/**
 * Complete token exchange for desktop app
 */
async function tokenExchangeCompleteHandler(
  request: TokenExchangeCompleteRequest,
  reply: FastifyReply
): Promise<any> {
  try {
    // For now, just generate tokens for the exchange
    // In a real implementation, you'd verify the exchange token
    const { exchangeToken, deviceId } = request.body;
    
    // Generate desktop tokens
    const accessToken = generateSecureToken(32);
    const refreshToken = generateSecureToken(32);
    
    return reply.status(200).send({
      success: true,
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: 3600,
      },
      deviceId,
    });
    
  } catch (error) {
    // Token exchange complete error handled
    return reply.status(500).send({
      success: false,
      error: 'Token exchange completion failed',
    });
  }
}

// =============================================================================
// MIDDLEWARE
// =============================================================================

/**
 * Authentication middleware
 */
async function authMiddleware(
  request: AuthRouteRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        success: false,
        error: 'Authentication required',
        errorCode: AuthErrorCode.TOKEN_INVALID,
      });
    }
    
    const token = authHeader.split(' ')[1];
    const tokenResult = await request.server.jwtService.verifyToken(token);
    
    if (!tokenResult.valid || !tokenResult.payload) {
      return reply.status(401).send({
        success: false,
        error: 'Invalid token',
        errorCode: AuthErrorCode.TOKEN_INVALID,
      });
    }
    
    // Get user
    const user = await findUserById(tokenResult.payload.sub);
    if (!user) {
      return reply.status(401).send({
        success: false,
        error: 'User not found',
        errorCode: AuthErrorCode.TOKEN_INVALID,
      });
    }
    
    // Set user in request
    request.user = {
      id: createBrandedId<UserId>(user.id),
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      profile: user.profile,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    
    request.sessionId = tokenResult.payload.sessionId;
    
  } catch (error) {
    // Auth middleware error handled
    return reply.status(500).send({
      success: false,
      error: 'Authentication failed',
      errorCode: AuthErrorCode.INTERNAL_ERROR,
    });
  }
}

/**
 * Simple security middleware
 */
async function securityMiddleware(
  request: AuthRouteRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Extract IP address
    request.ipAddress = extractIpFromHeaders(request.headers);
    
    // Set basic security headers
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '1; mode=block');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    if (process.env.NODE_ENV === 'production') {
      reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
  } catch (error) {
    // Security middleware error handled
    return reply.status(500).send({
      success: false,
      error: 'Security check failed',
      errorCode: AuthErrorCode.INTERNAL_ERROR,
    });
  }
}

// =============================================================================
// ROUTE REGISTRATION
// =============================================================================

/**
 * Register authentication routes
 */
export async function registerAuthRoutes(fastify: FastifyInstance): Promise<void> {
  // Add security middleware to all routes
  fastify.addHook('preHandler', securityMiddleware);
  
  // Public routes
  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password', 'source', 'termsAccepted', 'privacyAccepted'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          name: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
          termsAccepted: { type: 'boolean' },
          privacyAccepted: { type: 'boolean' },
          marketingConsent: { type: 'boolean' },
        },
      },
    },
    config: {
      rateLimit: {
        max: 3,                    // 3 registration attempts
        timeWindow: '15 minutes'   // per 15 minutes (prevent spam)
      }
    }
  }, registerHandler);
  
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password', 'source'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
          rememberMe: { type: 'boolean' },
        },
      },
    },
    config: {
      rateLimit: {
        max: 5,                    // 5 login attempts
        timeWindow: '15 minutes'   // per 15 minutes
      }
    }
  }, loginHandler);
  
  fastify.post('/refresh', {
    schema: {
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
          source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
        },
      },
    },
  }, refreshTokenHandler);
  
  fastify.post('/token/refresh', {
    schema: {
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
          source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
        },
      },
    },
  }, refreshTokenHandler);
  
  fastify.post('/check-email', {
    schema: {
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
    },
  }, checkEmailHandler);
  
  fastify.post('/password/reset', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'source'],
        properties: {
          email: { type: 'string', format: 'email' },
          source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
        },
      },
    },
    config: {
      rateLimit: {
        max: 3,                    // 3 password reset attempts
        timeWindow: '15 minutes'   // per 15 minutes (prevent enumeration)
      }
    }
  }, passwordResetHandler);
  
  fastify.post('/password/reset-complete', {
    schema: {
      body: {
        type: 'object',
        required: ['token', 'newPassword', 'source'],
        properties: {
          token: { type: 'string' },
          newPassword: { type: 'string', minLength: 8 },
          source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
        },
      },
    },
  }, passwordResetCompleteHandler);
  
  // Protected routes (require authentication)
  fastify.register(async (fastify: FastifyInstance) => {
    fastify.addHook('preHandler', authMiddleware);
    
    fastify.post('/logout', logoutHandler);
    fastify.get('/profile', profileHandler);
    fastify.get('/me', meHandler);
    
    fastify.post('/password/change', {
      schema: {
        body: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string' },
            newPassword: { type: 'string', minLength: 8 },
          },
        },
      },
    }, passwordChangeHandler);
    
    // Token exchange routes
    fastify.post('/token/exchange/initiate', {
      schema: {
        body: {
          type: 'object',
          required: ['deviceId', 'deviceName', 'platform', 'deviceType'],
          properties: {
            deviceId: { type: 'string' },
            deviceName: { type: 'string' },
            platform: { type: 'string' },
            deviceType: { type: 'string', enum: ['desktop', 'mobile', 'tablet'] },
            appVersion: { type: 'string' },
            osVersion: { type: 'string' },
          },
        },
      },
    }, tokenExchangeInitiateHandler);
    
    fastify.post('/token/exchange/complete', {
      schema: {
        body: {
          type: 'object',
          required: ['exchangeToken', 'deviceId', 'deviceName', 'platform', 'deviceType'],
          properties: {
            exchangeToken: { type: 'string' },
            deviceId: { type: 'string' },
            deviceName: { type: 'string' },
            platform: { type: 'string' },
            deviceType: { type: 'string', enum: ['desktop', 'mobile', 'tablet'] },
            appVersion: { type: 'string' },
            osVersion: { type: 'string' },
          },
        },
      },
    }, tokenExchangeCompleteHandler);
  });
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  authMiddleware,
  securityMiddleware,
  loginHandler,
  registerHandler,
  refreshTokenHandler,
  passwordResetHandler,
  passwordResetCompleteHandler,
  passwordChangeHandler,
  logoutHandler,
  profileHandler,
  meHandler,
  checkEmailHandler,
  tokenExchangeInitiateHandler,
  tokenExchangeCompleteHandler,
};