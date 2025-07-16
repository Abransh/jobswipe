/**
 * @fileoverview Authentication API Routes for JobSwipe
 * @description Enterprise-grade authentication endpoints with comprehensive security
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
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

import { 
  SecurityMiddlewareService,
  createSecurityRequest,
  formatSecurityErrorResponse,
  createLoginRateLimitConfig,
  createRegistrationRateLimitConfig,
  createPasswordResetRateLimitConfig,
  createTokenRefreshRateLimitConfig
} from '@jobswipe/shared';

import { 
  JwtTokenService,
  RedisSessionService,
  TokenExchangeService,
  defaultJwtTokenService,
  defaultRedisSessionService,
  createAccessTokenConfig,
  createRefreshTokenConfig,
  createDesktopTokenConfig
} from '@jobswipe/shared';

import { 
  hashPassword,
  verifyPassword,
  generateSecureToken,
  extractIpFromHeaders
} from '@jobswipe/shared';

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
// MOCK DATABASE FUNCTIONS
// =============================================================================

// In a real implementation, these would be database operations
const mockUsers = new Map<string, any>();
const mockSessions = new Map<string, any>();

async function findUserByEmail(email: string): Promise<any | null> {
  for (const user of mockUsers.values()) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

async function findUserById(id: string): Promise<any | null> {
  return mockUsers.get(id) || null;
}

async function createUser(userData: any): Promise<any> {
  const id = generateSecureToken(16);
  const user = {
    id,
    email: userData.email,
    passwordHash: await hashPassword(userData.password),
    name: userData.name,
    profile: userData.profile || {},
    role: 'user',
    status: 'active',
    emailVerified: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  mockUsers.set(id, user);
  return user;
}

async function updateUser(id: string, updates: any): Promise<any> {
  const user = mockUsers.get(id);
  if (!user) return null;
  
  Object.assign(user, updates, { updatedAt: new Date() });
  mockUsers.set(id, user);
  return user;
}

async function authenticateUser(email: string, password: string): Promise<any | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  
  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) return null;
  
  return user;
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
    
    const session = await defaultRedisSessionService.createSession(sessionOptions);
    
    // Generate tokens
    const accessTokenConfig = createAccessTokenConfig(
      createBrandedId<UserId>(user.id),
      user.email,
      user.name,
      user.role,
      validatedData.source,
      session.id
    );
    
    const refreshTokenConfig = createRefreshTokenConfig(
      createBrandedId<UserId>(user.id),
      user.email,
      validatedData.source,
      session.id
    );
    
    const accessToken = await defaultJwtTokenService.createToken(accessTokenConfig);
    const refreshToken = await defaultJwtTokenService.createToken(refreshTokenConfig);
    
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
        expiresIn: accessTokenConfig.expiresIn,
        refreshExpiresIn: refreshTokenConfig.expiresIn,
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
    
    console.error('Registration error:', error);
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
    if (user.status !== 'active') {
      return reply.status(401).send({
        success: false,
        error: `Account is ${user.status}`,
        errorCode: AuthErrorCode.ACCOUNT_DISABLED,
      });
    }
    
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
    
    const session = await defaultRedisSessionService.createSession(sessionOptions);
    
    // Generate tokens
    const accessTokenConfig = createAccessTokenConfig(
      createBrandedId<UserId>(user.id),
      user.email,
      user.name,
      user.role,
      validatedData.source,
      session.id
    );
    
    const refreshTokenConfig = createRefreshTokenConfig(
      createBrandedId<UserId>(user.id),
      user.email,
      validatedData.source,
      session.id
    );
    
    const accessToken = await defaultJwtTokenService.createToken(accessTokenConfig);
    const refreshToken = await defaultJwtTokenService.createToken(refreshTokenConfig);
    
    // Update user last login
    await updateUser(user.id, { lastLoginAt: new Date() });
    
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
        expiresIn: accessTokenConfig.expiresIn,
        refreshExpiresIn: refreshTokenConfig.expiresIn,
      },
      session,
    });
    
  } catch (error) {
    console.error('Login error:', error);
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
    const tokenResult = await defaultJwtTokenService.verifyToken(refreshToken);
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
    
    // Generate new access token
    const accessTokenConfig = createAccessTokenConfig(
      tokenResult.payload.sub,
      user.email,
      user.name,
      user.role,
      tokenResult.payload.source,
      tokenResult.payload.sessionId
    );
    
    const newAccessToken = await defaultJwtTokenService.createToken(accessTokenConfig);
    
    return reply.status(200).send({
      success: true,
      tokens: {
        accessToken: newAccessToken,
        refreshToken,
        tokenType: 'Bearer' as const,
        expiresIn: accessTokenConfig.expiresIn,
        refreshExpiresIn: tokenResult.payload.exp - Math.floor(Date.now() / 1000),
      },
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    return reply.status(500).send({
      success: false,
      error: 'Token refresh failed',
      errorCode: AuthErrorCode.INTERNAL_ERROR,
    });
  }
}

/**
 * Request password reset
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
      // In a real implementation, you'd send an email with a reset token
      console.log(`Password reset requested for user: ${user.email}`);
      
      // Generate reset token (in real app, store this in database)
      const resetToken = generateSecureToken(32);
      console.log(`Reset token generated: ${resetToken}`);
    }
    
    return reply.status(200).send(response);
    
  } catch (error) {
    console.error('Password reset error:', error);
    return reply.status(500).send({
      success: false,
      message: 'Password reset failed',
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
    
    // Hash new password
    const newPasswordHash = await hashPassword(validatedData.newPassword);
    
    // Update password
    await updateUser(user.id, { passwordHash: newPasswordHash });
    
    // In a real implementation, you might revoke all sessions
    console.log(`Password changed for user: ${user.email}`);
    
    return reply.status(200).send({
      success: true,
      message: 'Password changed successfully',
    });
    
  } catch (error) {
    console.error('Password change error:', error);
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
      await defaultRedisSessionService.revokeSession(createBrandedId(request.sessionId));
    }
    
    return reply.status(200).send({
      success: true,
      message: 'Logged out successfully',
    });
    
  } catch (error) {
    console.error('Logout error:', error);
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
    console.error('Profile error:', error);
    return reply.status(500).send({
      success: false,
      error: 'Failed to get profile',
    });
  }
}

/**
 * Initiate token exchange for desktop app
 */
async function tokenExchangeInitiateHandler(
  request: TokenExchangeInitiateRequest,
  reply: FastifyReply
): Promise<TokenExchangeRequest> {
  try {
    if (!request.user || !request.sessionId) {
      return reply.status(401).send({
        success: false,
        error: 'Authentication required',
      });
    }
    
    // Create token exchange service (in real app, this would be injected)
    const tokenExchangeService = new (require('@jobswipe/shared')).TokenExchangeService(
      defaultJwtTokenService,
      defaultRedisSessionService
    );
    
    const deviceInfo = {
      deviceId: request.body.deviceId,
      deviceName: request.body.deviceName,
      deviceType: request.body.deviceType,
      platform: request.body.platform,
      appVersion: request.body.appVersion,
      osVersion: request.body.osVersion,
    };
    
    const exchangeRequest = await tokenExchangeService.initiateExchange(
      createBrandedId(request.sessionId),
      deviceInfo,
      request.ipAddress,
      request.headers['user-agent']
    );
    
    return reply.status(200).send(exchangeRequest);
    
  } catch (error) {
    console.error('Token exchange initiate error:', error);
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
): Promise<TokenExchangeResponse> {
  try {
    // Create token exchange service (in real app, this would be injected)
    const tokenExchangeService = new (require('@jobswipe/shared')).TokenExchangeService(
      defaultJwtTokenService,
      defaultRedisSessionService
    );
    
    const deviceInfo = {
      deviceId: request.body.deviceId,
      deviceName: request.body.deviceName,
      deviceType: request.body.deviceType,
      platform: request.body.platform,
      appVersion: request.body.appVersion,
      osVersion: request.body.osVersion,
    };
    
    const exchangeResponse = await tokenExchangeService.completeExchange(
      request.body.exchangeToken,
      deviceInfo,
      request.ipAddress,
      request.headers['user-agent']
    );
    
    return reply.status(200).send(exchangeResponse);
    
  } catch (error) {
    console.error('Token exchange complete error:', error);
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
    const tokenResult = await defaultJwtTokenService.verifyToken(token);
    
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
    console.error('Auth middleware error:', error);
    return reply.status(500).send({
      success: false,
      error: 'Authentication failed',
      errorCode: AuthErrorCode.INTERNAL_ERROR,
    });
  }
}

/**
 * Security middleware
 */
async function securityMiddleware(
  request: AuthRouteRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Extract IP address
    request.ipAddress = extractIpFromHeaders(request.headers);
    
    // Create security request
    const securityRequest = createSecurityRequest(
      request.method,
      request.url,
      request.headers,
      request.body,
      request.ipAddress,
      request.sessionId,
      request.user?.id
    );
    
    // Create appropriate rate limit config based on endpoint
    let rateLimitConfig;
    if (request.url.includes('/login')) {
      rateLimitConfig = createLoginRateLimitConfig();
    } else if (request.url.includes('/register')) {
      rateLimitConfig = createRegistrationRateLimitConfig();
    } else if (request.url.includes('/password/reset')) {
      rateLimitConfig = createPasswordResetRateLimitConfig();
    } else if (request.url.includes('/token/refresh')) {
      rateLimitConfig = createTokenRefreshRateLimitConfig();
    } else {
      rateLimitConfig = createLoginRateLimitConfig(); // Default
    }
    
    // Create security middleware service
    const securityService = new SecurityMiddlewareService(
      rateLimitConfig,
      {
        secret: generateSecureToken(32),
        cookieName: 'csrf-token',
        headerName: 'X-CSRF-Token',
        tokenLength: 32,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
      },
      {
        contentSecurityPolicy: true,
        strictTransportSecurity: true,
        xFrameOptions: true,
        xContentTypeOptions: true,
        xXSSProtection: true,
        referrerPolicy: true,
        permissionsPolicy: true,
      }
    );
    
    // Process security
    const securityResult = await securityService.processRequest(securityRequest);
    
    if (!securityResult.allowed) {
      const errorResponse = formatSecurityErrorResponse(
        securityResult.error || 'Security check failed',
        securityResult.errorCode || AuthErrorCode.RATE_LIMIT_EXCEEDED,
        securityResult.rateLimitInfo
      );
      
      // Set security headers
      for (const [key, value] of Object.entries(securityResult.securityHeaders)) {
        reply.header(key, value);
      }
      
      return reply.status(errorResponse.statusCode || 429).send(errorResponse.body);
    }
    
    // Set security headers
    for (const [key, value] of Object.entries(securityResult.securityHeaders)) {
      reply.header(key, value);
    }
    
    // Set rate limit headers
    if (securityResult.rateLimitInfo) {
      reply.header('X-RateLimit-Limit', securityResult.rateLimitInfo.limit.toString());
      reply.header('X-RateLimit-Remaining', securityResult.rateLimitInfo.remaining.toString());
      reply.header('X-RateLimit-Reset', securityResult.rateLimitInfo.reset.toISOString());
    }
    
    // Set CSRF token header
    if (securityResult.csrfToken) {
      reply.header('X-CSRF-Token', securityResult.csrfToken);
    }
    
  } catch (error) {
    console.error('Security middleware error:', error);
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
  }, loginHandler);
  
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
  }, passwordResetHandler);
  
  // Protected routes (require authentication)
  fastify.register(async (fastify: FastifyInstance) => {
    fastify.addHook('preHandler', authMiddleware);
    
    fastify.post('/logout', logoutHandler);
    fastify.get('/profile', profileHandler);
    
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
  registerAuthRoutes,
  authMiddleware,
  securityMiddleware,
  loginHandler,
  registerHandler,
  refreshTokenHandler,
  passwordResetHandler,
  passwordChangeHandler,
  logoutHandler,
  profileHandler,
  tokenExchangeInitiateHandler,
  tokenExchangeCompleteHandler,
};