// /**
//  * @fileoverview Unified Authentication Routes for JobSwipe API
//  * @description Enterprise-grade authentication with comprehensive security features
//  * @version 2.0.0
//  * @author JobSwipe Team
//  *
//  * SECURITY FEATURES:
//  * - Account lockout after 5 failed login attempts (30-minute lockout)
//  * - Email verification for new user registrations
//  * - CSRF protection integration with advanced-security plugin
//  * - Session-based token management with Redis
//  * - Rate limiting on sensitive endpoints
//  * - Password reset with hashed token storage
//  * - Secure HTTP-only cookie handling
//  * - Device tracking and IP address logging
//  * - Audit logging for all authentication events
//  */

// import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
// import { z } from 'zod';
// import {
//   LoginRequest,
//   RegisterRequest,
//   RefreshTokenRequest,
//   PasswordResetRequest,
//   PasswordChangeRequest,
//   LoginResponse,
//   RegisterResponse,
//   RefreshTokenResponse,
//   PasswordResetResponse,
//   PasswordChangeResponse,
//   AuthenticatedUser,
//   createAuthError,
//   AuthErrorCode,
//   LoginRequestSchema,
//   RegisterRequestSchema,
//   PasswordResetRequestSchema,
//   PasswordChangeRequestSchema,
//   AuthSource,
//   AuthProvider,
//   UserId,
//   createBrandedId,
//   generateSecureToken
// } from '@jobswipe/shared';

// import {
//   createUser as createUserDb,
//   authenticateUser as authenticateUserDb,
//   getUserByEmail,
//   getUserById,
//   db
// } from '@jobswipe/database';

// // Import server utilities
// let hashPassword: any = null;
// let verifyPassword: any = null;
// let extractIpFromHeaders: any = null;

// try {
//   const serverModule = require('@jobswipe/shared/server');
//   hashPassword = serverModule.hashPassword;
//   verifyPassword = serverModule.verifyPassword;
//   extractIpFromHeaders = require('@jobswipe/shared').extractIpFromHeaders;
// } catch (error) {
//   console.warn('⚠️  Failed to load auth utilities:', error);
// }

// // =============================================================================
// // CONSTANTS & CONFIGURATION
// // =============================================================================

// const ACCOUNT_LOCKOUT_THRESHOLD = 5; // Failed attempts before lockout
// const ACCOUNT_LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
// const EMAIL_VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
// const PASSWORD_RESET_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

// // =============================================================================
// // TYPE DEFINITIONS
// // =============================================================================

// interface AuthRouteRequest extends FastifyRequest {
//   user?: AuthenticatedUser;
//   sessionId?: string;
//   ipAddress?: string;
// }

// interface LoginRouteRequest extends AuthRouteRequest {
//   body: LoginRequest;
// }

// interface RegisterRouteRequest extends AuthRouteRequest {
//   body: RegisterRequest;
// }

// interface RefreshTokenRouteRequest extends AuthRouteRequest {
//   body: RefreshTokenRequest;
// }

// interface PasswordResetRouteRequest extends AuthRouteRequest {
//   body: PasswordResetRequest;
// }

// interface PasswordChangeRouteRequest extends AuthRouteRequest {
//   body: PasswordChangeRequest;
// }

// interface TokenExchangeInitiateRequest extends AuthRouteRequest {
//   body: {
//     deviceId: string;
//     deviceName: string;
//     platform: string;
//     deviceType: 'desktop' | 'mobile' | 'tablet';
//     appVersion?: string;
//     osVersion?: string;
//   };
// }

// interface TokenExchangeCompleteRequest extends AuthRouteRequest {
//   body: {
//     exchangeToken: string;
//     deviceId: string;
//     deviceName: string;
//     platform: string;
//     deviceType: 'desktop' | 'mobile' | 'tablet';
//     appVersion?: string;
//     osVersion?: string;
//   };
// }

// // =============================================================================
// // HELPER FUNCTIONS
// // =============================================================================

// /**
//  * Get client IP address from request headers
//  */
// function getClientIP(request: FastifyRequest): string {
//   try {
//     return extractIpFromHeaders(request.headers) || request.ip;
//   } catch {
//     const forwarded = request.headers['x-forwarded-for'];
//     const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded;
//     return ip?.split(',')[0]?.trim() || request.headers['x-real-ip'] as string || request.ip;
//   }
// }

// /**
//  * Get user agent from request headers
//  */
// function getUserAgent(request: FastifyRequest): string {
//   return request.headers['user-agent'] || 'Unknown';
// }

// /**
//  * Generate email verification token
//  */
// async function generateEmailVerificationToken(email: string, server: FastifyInstance): Promise<string> {
//   const crypto = require('crypto');
//   const token = generateSecureToken(32);
//   const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
//   const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS);

//   // Delete any existing verification tokens for this email
//   await server.db.verificationToken.deleteMany({
//     where: {
//       identifier: `email-verify:${email.toLowerCase()}`,
//     },
//   });

//   // Store hashed token
//   await server.db.verificationToken.create({
//     data: {
//       identifier: `email-verify:${email.toLowerCase()}`,
//       token: tokenHash,
//       expires: expiresAt,
//     },
//   });

//   return token; // Return unhashed token for email
// }

// /**
//  * Verify email verification token
//  */
// async function verifyEmailToken(token: string, server: FastifyInstance): Promise<string | null> {
//   const crypto = require('crypto');
//   const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

//   const verificationToken = await server.db.verificationToken.findFirst({
//     where: {
//       token: tokenHash,
//       identifier: {
//         startsWith: 'email-verify:',
//       },
//     },
//   });

//   if (!verificationToken) {
//     return null;
//   }

//   // Check expiration
//   if (new Date() > verificationToken.expires) {
//     // Delete expired token
//     await server.db.verificationToken.delete({
//       where: {
//         identifier_token: {
//           identifier: verificationToken.identifier,
//           token: verificationToken.token,
//         },
//       },
//     });
//     return null;
//   }

//   // Extract email from identifier
//   const email = verificationToken.identifier.replace('email-verify:', '');

//   // Delete used token
//   await server.db.verificationToken.delete({
//     where: {
//       identifier_token: {
//         identifier: verificationToken.identifier,
//         token: verificationToken.token,
//       },
//     },
//   });

//   return email;
// }

// /**
//  * Check if account is locked due to failed login attempts
//  */
// async function checkAccountLockout(userId: string, server: FastifyInstance): Promise<{ locked: boolean; until?: Date }> {
//   const user = await server.db.user.findUnique({
//     where: { id: userId },
//     select: { lockedUntil: true },
//   });

//   if (!user) {
//     return { locked: false };
//   }

//   if (user.lockedUntil && user.lockedUntil > new Date()) {
//     return { locked: true, until: user.lockedUntil };
//   }

//   return { locked: false };
// }

// /**
//  * Increment failed login attempts and lock account if threshold reached
//  */
// async function handleFailedLogin(userId: string, server: FastifyInstance): Promise<void> {
//   const user = await server.db.user.findUnique({
//     where: { id: userId },
//     select: { loginAttempts: true },
//   });

//   if (!user) return;

//   const loginAttempts = user.loginAttempts + 1;
//   const shouldLock = loginAttempts >= ACCOUNT_LOCKOUT_THRESHOLD;

//   await server.db.user.update({
//     where: { id: userId },
//     data: {
//       loginAttempts,
//       lockedUntil: shouldLock ? new Date(Date.now() + ACCOUNT_LOCKOUT_DURATION_MS) : null,
//       updatedAt: new Date(),
//     },
//   });

//   // Log security event
//   server.log.warn({
//     msg: 'Failed login attempt',
//     userId,
//     attempts: loginAttempts,
//     locked: shouldLock,
//   });
// }

// /**
//  * Reset login attempts on successful login
//  */
// async function resetLoginAttempts(userId: string, server: FastifyInstance): Promise<void> {
//   await server.db.user.update({
//     where: { id: userId },
//     data: {
//       loginAttempts: 0,
//       lockedUntil: null,
//       lastLoginAt: new Date(),
//       updatedAt: new Date(),
//     },
//   });
// }

// // =============================================================================
// // AUTHENTICATION HANDLERS
// // =============================================================================

// /**
//  * Register a new user with email verification
//  */
// async function registerHandler(
//   request: RegisterRouteRequest,
//   reply: FastifyReply
// ): Promise<RegisterResponse> {
//   try {
//     // Validate input
//     const validatedData = RegisterRequestSchema.parse(request.body);

//     // Check if user already exists
//     const existingUser = await getUserByEmail(validatedData.email);
//     if (existingUser) {
//       return reply.status(409).send({
//         success: false,
//         error: 'User already exists with this email address',
//         errorCode: AuthErrorCode.CONFLICT,
//       });
//     }

//     // Get IP address and user agent for audit
//     const ipAddress = getClientIP(request);
//     const userAgent = getUserAgent(request);

//     // Create user (emailVerified will be null until verified)
//     const user = await createUserDb({
//       email: validatedData.email,
//       password: validatedData.password,
//       name: validatedData.name,
//       profile: {
//         firstName: validatedData.firstName,
//         lastName: validatedData.lastName,
//         timezone: validatedData.timezone,
//       },
//     });

//     // Update user with additional fields
//     await db.user.update({
//       where: { id: user.id },
//       data: {
//         dataConsent: true, // Required by GDPR
//         consentDate: new Date(),
//         ipAddress,
//         userAgent,
//         locale: validatedData.timezone || 'en',
//       },
//     });

//     // Generate email verification token
//     const verificationToken = await generateEmailVerificationToken(
//       validatedData.email,
//       request.server
//     );

//     // TODO: Send verification email
//     // await sendVerificationEmail(user.email, verificationToken);
//     request.server.log.info({
//       msg: 'Email verification token generated',
//       userId: user.id,
//       email: user.email,
//       // In development, log the token (remove in production)
//       ...(process.env.NODE_ENV !== 'production' && { verificationToken }),
//     });

//     // Create session
//     const sessionOptions = {
//       userId: createBrandedId<UserId>(user.id),
//       source: validatedData.source,
//       provider: AuthProvider.CREDENTIALS,
//       ipAddress,
//       userAgent,
//       metadata: {
//         email: user.email,
//         name: user.name,
//         role: user.role,
//         emailVerified: false,
//       },
//     };

//     const session = await request.server.sessionService.createSession(sessionOptions);

//     // Generate tokens
//     const accessTokenResult = await request.server.jwtService.createToken({
//       userId: user.id,
//       email: user.email,
//       role: user.role,
//       status: user.status,
//       sessionId: session.id,
//       expiresIn: '15m',
//     });

//     const refreshToken = await request.server.jwtService.createRefreshToken(
//       user.id,
//       session.id
//     );

//     const accessToken = accessTokenResult.token;

//     // Format user response
//     const userResponse: AuthenticatedUser = {
//       id: createBrandedId<UserId>(user.id),
//       email: user.email,
//       name: user.name,
//       role: user.role,
//       status: user.status,
//       profile: user.profile,
//       emailVerified: user.emailVerified,
//       createdAt: user.createdAt,
//       updatedAt: user.updatedAt,
//     };

//     return reply.status(201).send({
//       success: true,
//       user: userResponse,
//       tokens: {
//         accessToken,
//         refreshToken,
//         tokenType: 'Bearer' as const,
//         expiresIn: accessTokenResult.expiresIn,
//         refreshExpiresIn: 7 * 24 * 60 * 60,
//       },
//       session,
//       message: 'Registration successful. Please check your email to verify your account.',
//     });

//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return reply.status(400).send({
//         success: false,
//         error: 'Validation failed',
//         errorCode: AuthErrorCode.VALIDATION_ERROR,
//         details: error.errors,
//       });
//     }

//     request.server.log.error('Registration failed:', error);
//     return reply.status(500).send({
//       success: false,
//       error: 'Registration failed',
//       errorCode: AuthErrorCode.INTERNAL_ERROR,
//     });
//   }
// }

// /**
//  * Login user with account lockout protection
//  */
// async function loginHandler(
//   request: LoginRouteRequest,
//   reply: FastifyReply
// ): Promise<LoginResponse> {
//   try {
//     // Validate input
//     const validatedData = LoginRequestSchema.parse(request.body);

//     // Get IP address and user agent for audit
//     const ipAddress = getClientIP(request);
//     const userAgent = getUserAgent(request);

//     // Find user by email
//     const user = await getUserByEmail(validatedData.email);
//     if (!user) {
//       return reply.status(401).send({
//         success: false,
//         error: 'Invalid email or password',
//         errorCode: AuthErrorCode.INVALID_CREDENTIALS,
//       });
//     }

//     // Check if account is locked
//     const lockStatus = await checkAccountLockout(user.id, request.server);
//     if (lockStatus.locked) {
//       const minutesRemaining = Math.ceil(
//         (lockStatus.until!.getTime() - Date.now()) / (60 * 1000)
//       );

//       return reply.status(401).send({
//         success: false,
//         error: `Account is temporarily locked due to too many failed login attempts. Please try again in ${minutesRemaining} minutes.`,
//         errorCode: AuthErrorCode.ACCOUNT_LOCKED,
//       });
//     }

//     // Check account status
//     if (user.status !== 'ACTIVE') {
//       return reply.status(401).send({
//         success: false,
//         error: `Account is ${user.status.toLowerCase()}`,
//         errorCode: AuthErrorCode.ACCOUNT_DISABLED,
//       });
//     }

//     // Authenticate user (verify password)
//     const authenticatedUser = await authenticateUserDb(validatedData.email, validatedData.password);
//     if (!authenticatedUser) {
//       // Handle failed login
//       await handleFailedLogin(user.id, request.server);

//       return reply.status(401).send({
//         success: false,
//         error: 'Invalid email or password',
//         errorCode: AuthErrorCode.INVALID_CREDENTIALS,
//       });
//     }

//     // Reset login attempts on successful authentication
//     await resetLoginAttempts(user.id, request.server);

//     // Update user metadata
//     await db.user.update({
//       where: { id: user.id },
//       data: {
//         ipAddress,
//         userAgent,
//         updatedAt: new Date(),
//       },
//     });

//     // Create session
//     const sessionOptions = {
//       userId: createBrandedId<UserId>(user.id),
//       source: validatedData.source,
//       provider: AuthProvider.CREDENTIALS,
//       ipAddress,
//       userAgent,
//       metadata: {
//         email: user.email,
//         name: user.name,
//         role: user.role,
//         emailVerified: !!user.emailVerified,
//       },
//     };

//     const session = await request.server.sessionService.createSession(sessionOptions);

//     // Generate tokens
//     const accessTokenResult = await request.server.jwtService.createToken({
//       userId: user.id,
//       email: user.email,
//       role: user.role,
//       status: user.status,
//       sessionId: session.id,
//       expiresIn: '15m',
//     });

//     const refreshToken = await request.server.jwtService.createRefreshToken(
//       user.id,
//       session.id
//     );

//     const accessToken = accessTokenResult.token;

//     // Format user response
//     const userResponse: AuthenticatedUser = {
//       id: createBrandedId<UserId>(user.id),
//       email: user.email,
//       name: user.name,
//       role: user.role,
//       status: user.status,
//       profile: user.profile,
//       emailVerified: user.emailVerified,
//       lastLoginAt: new Date(),
//       createdAt: user.createdAt,
//       updatedAt: user.updatedAt,
//     };

//     // Log successful login
//     request.server.log.info({
//       msg: 'User logged in successfully',
//       userId: user.id,
//       email: user.email,
//       source: validatedData.source,
//       ipAddress,
//     });

//     return reply.status(200).send({
//       success: true,
//       user: userResponse,
//       tokens: {
//         accessToken,
//         refreshToken,
//         tokenType: 'Bearer' as const,
//         expiresIn: accessTokenResult.expiresIn,
//         refreshExpiresIn: 7 * 24 * 60 * 60,
//       },
//       session,
//     });

//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return reply.status(400).send({
//         success: false,
//         error: 'Validation failed',
//         errorCode: AuthErrorCode.VALIDATION_ERROR,
//         details: error.errors,
//       });
//     }

//     request.server.log.error('Login failed:', error);
//     return reply.status(500).send({
//       success: false,
//       error: 'Login failed',
//       errorCode: AuthErrorCode.INTERNAL_ERROR,
//     });
//   }
// }

// /**
//  * Verify email address with verification token
//  */
// async function verifyEmailHandler(
//   request: FastifyRequest<{ Body: { token: string } }>,
//   reply: FastifyReply
// ): Promise<{ success: boolean; message: string; error?: string }> {
//   try {
//     const { token } = request.body;

//     if (!token) {
//       return reply.status(400).send({
//         success: false,
//         message: 'Verification token is required',
//       });
//     }

//     // Verify token and get email
//     const email = await verifyEmailToken(token, request.server);

//     if (!email) {
//       return reply.status(400).send({
//         success: false,
//         message: 'Invalid or expired verification token',
//       });
//     }

//     // Update user email verification status
//     const user = await db.user.update({
//       where: { email: email.toLowerCase() },
//       data: {
//         emailVerified: new Date(),
//         updatedAt: new Date(),
//       },
//     });

//     request.server.log.info({
//       msg: 'Email verified successfully',
//       userId: user.id,
//       email: user.email,
//     });

//     return reply.status(200).send({
//       success: true,
//       message: 'Email verified successfully. You can now access all features.',
//     });

//   } catch (error) {
//     request.server.log.error('Email verification failed:', error);
//     return reply.status(500).send({
//       success: false,
//       message: 'Email verification failed',
//     });
//   }
// }

// /**
//  * Resend email verification token
//  */
// async function resendVerificationHandler(
//   request: FastifyRequest<{ Body: { email: string } }>,
//   reply: FastifyReply
// ): Promise<{ success: boolean; message: string }> {
//   try {
//     const { email } = request.body;

//     if (!email) {
//       return reply.status(400).send({
//         success: false,
//         message: 'Email is required',
//       });
//     }

//     // Find user
//     const user = await getUserByEmail(email);

//     if (!user) {
//       // Return success to prevent email enumeration
//       return reply.status(200).send({
//         success: true,
//         message: 'If the email exists and is unverified, a verification link has been sent.',
//       });
//     }

//     // Check if already verified
//     if (user.emailVerified) {
//       return reply.status(400).send({
//         success: false,
//         message: 'Email is already verified',
//       });
//     }

//     // Generate new verification token
//     const verificationToken = await generateEmailVerificationToken(email, request.server);

//     // TODO: Send verification email
//     // await sendVerificationEmail(user.email, verificationToken);
//     request.server.log.info({
//       msg: 'Email verification token resent',
//       userId: user.id,
//       email: user.email,
//       // In development, log the token (remove in production)
//       ...(process.env.NODE_ENV !== 'production' && { verificationToken }),
//     });

//     return reply.status(200).send({
//       success: true,
//       message: 'Verification email has been sent. Please check your inbox.',
//     });

//   } catch (error) {
//     request.server.log.error('Resend verification failed:', error);
//     return reply.status(500).send({
//       success: false,
//       message: 'Failed to resend verification email',
//     });
//   }
// }

// /**
//  * Refresh access token using refresh token
//  */
// async function refreshTokenHandler(
//   request: RefreshTokenRouteRequest,
//   reply: FastifyReply
// ): Promise<RefreshTokenResponse> {
//   try {
//     const { refreshToken } = request.body;

//     // Verify refresh token
//     const tokenResult = await request.server.jwtService.verifyToken(refreshToken);
//     if (!tokenResult.valid || !tokenResult.payload) {
//       return reply.status(401).send({
//         success: false,
//         error: 'Invalid refresh token',
//         errorCode: AuthErrorCode.TOKEN_INVALID,
//       });
//     }

//     // Get user
//     const user = await getUserById(tokenResult.payload.sub);
//     if (!user) {
//       return reply.status(401).send({
//         success: false,
//         error: 'User not found',
//         errorCode: AuthErrorCode.TOKEN_INVALID,
//       });
//     }

//     // Check if account is active
//     if (user.status !== 'ACTIVE') {
//       return reply.status(401).send({
//         success: false,
//         error: 'Account is not active',
//         errorCode: AuthErrorCode.ACCOUNT_DISABLED,
//       });
//     }

//     // Generate new access token
//     const accessTokenResult = await request.server.jwtService.createToken({
//       userId: user.id,
//       email: user.email,
//       role: user.role,
//       status: user.status,
//       sessionId: tokenResult.payload.sessionId,
//       expiresIn: '15m',
//     });

//     return reply.status(200).send({
//       success: true,
//       tokens: {
//         accessToken: accessTokenResult.token,
//         refreshToken,
//         tokenType: 'Bearer' as const,
//         expiresIn: accessTokenResult.expiresIn,
//         refreshExpiresIn: tokenResult.payload.exp - Math.floor(Date.now() / 1000),
//       },
//     });

//   } catch (error) {
//     request.server.log.error('Token refresh failed:', error);
//     return reply.status(500).send({
//       success: false,
//       error: 'Token refresh failed',
//       errorCode: AuthErrorCode.INTERNAL_ERROR,
//     });
//   }
// }

// /**
//  * Request password reset
//  */
// async function passwordResetHandler(
//   request: PasswordResetRouteRequest,
//   reply: FastifyReply
// ): Promise<PasswordResetResponse> {
//   try {
//     const validatedData = PasswordResetRequestSchema.parse(request.body);

//     // Find user
//     const user = await getUserByEmail(validatedData.email);

//     // Always return success to prevent email enumeration
//     const response: PasswordResetResponse = {
//       success: true,
//       message: 'If the email exists, a password reset link has been sent',
//     };

//     if (user) {
//       const crypto = require('crypto');
//       const resetToken = generateSecureToken(32);
//       const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
//       const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);

//       // Delete any existing reset tokens
//       await request.server.db.verificationToken.deleteMany({
//         where: {
//           identifier: `password-reset:${user.email}`,
//         },
//       });

//       // Store hashed token
//       await request.server.db.verificationToken.create({
//         data: {
//           identifier: `password-reset:${user.email}`,
//           token: tokenHash,
//           expires: expiresAt,
//         },
//       });

//       // TODO: Send password reset email
//       // await sendPasswordResetEmail(user.email, resetToken);
//       request.server.log.info({
//         msg: 'Password reset token generated',
//         userId: user.id,
//         email: user.email,
//         expiresAt: expiresAt.toISOString(),
//         // In development, log the token (remove in production)
//         ...(process.env.NODE_ENV !== 'production' && { resetToken }),
//       });
//     }

//     return reply.status(200).send(response);

//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return reply.status(400).send({
//         success: false,
//         message: 'Validation failed',
//       });
//     }

//     request.server.log.error('Password reset failed:', error);
//     return reply.status(500).send({
//       success: false,
//       message: 'Password reset failed',
//     });
//   }
// }

// /**
//  * Complete password reset with token
//  */
// async function passwordResetCompleteHandler(
//   request: FastifyRequest<{ Body: { token: string; newPassword: string; source: string } }>,
//   reply: FastifyReply
// ): Promise<PasswordResetResponse> {
//   try {
//     const { token, newPassword, source } = request.body;

//     if (!token || !newPassword) {
//       return reply.status(400).send({
//         success: false,
//         message: 'Token and new password are required',
//       });
//     }

//     // Validate password strength
//     if (newPassword.length < 8) {
//       return reply.status(400).send({
//         success: false,
//         message: 'Password must be at least 8 characters long',
//       });
//     }

//     const crypto = require('crypto');
//     const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

//     // Find verification token
//     const verificationToken = await request.server.db.verificationToken.findFirst({
//       where: {
//         token: tokenHash,
//         identifier: {
//           startsWith: 'password-reset:',
//         },
//       },
//     });

//     if (!verificationToken) {
//       return reply.status(400).send({
//         success: false,
//         message: 'Invalid or expired reset token',
//       });
//     }

//     // Check expiration
//     if (new Date() > verificationToken.expires) {
//       await request.server.db.verificationToken.delete({
//         where: {
//           identifier_token: {
//             identifier: verificationToken.identifier,
//             token: verificationToken.token,
//           },
//         },
//       });

//       return reply.status(400).send({
//         success: false,
//         message: 'Reset token has expired. Please request a new one.',
//       });
//     }

//     // Extract email
//     const email = verificationToken.identifier.replace('password-reset:', '');

//     // Find user
//     const user = await getUserByEmail(email);
//     if (!user) {
//       return reply.status(404).send({
//         success: false,
//         message: 'User not found',
//       });
//     }

//     // Hash new password
//     const newPasswordHash = await hashPassword(newPassword);

//     // Update password
//     await request.server.db.user.update({
//       where: { id: user.id },
//       data: {
//         passwordHash: newPasswordHash,
//         updatedAt: new Date(),
//       },
//     });

//     // Delete used token
//     await request.server.db.verificationToken.delete({
//       where: {
//         identifier_token: {
//           identifier: verificationToken.identifier,
//           token: verificationToken.token,
//         },
//       },
//     });

//     // Revoke all existing sessions (force re-login for security)
//     await request.server.db.session.deleteMany({
//       where: { userId: user.id },
//     });

//     request.server.log.info({
//       msg: 'Password reset successful',
//       userId: user.id,
//       email: user.email,
//       source,
//     });

//     return reply.status(200).send({
//       success: true,
//       message: 'Password reset successfully. Please login with your new password.',
//     });

//   } catch (error) {
//     request.server.log.error('Password reset completion failed:', error);
//     return reply.status(500).send({
//       success: false,
//       message: 'Password reset completion failed',
//     });
//   }
// }

// /**
//  * Change password (authenticated)
//  */
// async function passwordChangeHandler(
//   request: PasswordChangeRouteRequest,
//   reply: FastifyReply
// ): Promise<PasswordChangeResponse> {
//   try {
//     const validatedData = PasswordChangeRequestSchema.parse(request.body);

//     if (!request.user) {
//       return reply.status(401).send({
//         success: false,
//         message: 'Authentication required',
//       });
//     }

//     // Get current user
//     const user = await getUserById(request.user.id);
//     if (!user) {
//       return reply.status(404).send({
//         success: false,
//         message: 'User not found',
//       });
//     }

//     // Verify current password
//     const isCurrentPasswordValid = await verifyPassword(
//       validatedData.currentPassword,
//       user.passwordHash!
//     );

//     if (!isCurrentPasswordValid) {
//       return reply.status(400).send({
//         success: false,
//         message: 'Current password is incorrect',
//       });
//     }

//     // Hash new password
//     const newPasswordHash = await hashPassword(validatedData.newPassword);

//     // Update password
//     await db.user.update({
//       where: { id: user.id },
//       data: {
//         passwordHash: newPasswordHash,
//         updatedAt: new Date(),
//       },
//     });

//     // Revoke all sessions except current (optional - can be made strict)
//     // For now, just log the change
//     request.server.log.info({
//       msg: 'Password changed successfully',
//       userId: user.id,
//       email: user.email,
//     });

//     return reply.status(200).send({
//       success: true,
//       message: 'Password changed successfully',
//     });

//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return reply.status(400).send({
//         success: false,
//         message: 'Validation failed',
//       });
//     }

//     request.server.log.error('Password change failed:', error);
//     return reply.status(500).send({
//       success: false,
//       message: 'Password change failed',
//     });
//   }
// }

// /**
//  * Logout user
//  */
// async function logoutHandler(
//   request: AuthRouteRequest,
//   reply: FastifyReply
// ): Promise<{ success: boolean; message: string }> {
//   try {
//     if (request.sessionId) {
//       await request.server.sessionService.revokeSession(createBrandedId(request.sessionId));
//     }

//     return reply.status(200).send({
//       success: true,
//       message: 'Logged out successfully',
//     });

//   } catch (error) {
//     request.server.log.error('Logout failed:', error);
//     return reply.status(500).send({
//       success: false,
//       message: 'Logout failed',
//     });
//   }
// }

// /**
//  * Get current user profile
//  */
// async function profileHandler(
//   request: AuthRouteRequest,
//   reply: FastifyReply
// ): Promise<{ success: boolean; user?: AuthenticatedUser; error?: string }> {
//   try {
//     if (!request.user) {
//       return reply.status(401).send({
//         success: false,
//         error: 'Authentication required',
//       });
//     }

//     return reply.status(200).send({
//       success: true,
//       user: request.user,
//     });

//   } catch (error) {
//     request.server.log.error('Profile fetch failed:', error);
//     return reply.status(500).send({
//       success: false,
//       error: 'Failed to get profile',
//     });
//   }
// }

// /**
//  * Get current user (alias for profile)
//  */
// async function meHandler(
//   request: AuthRouteRequest,
//   reply: FastifyReply
// ): Promise<{ success: boolean; user?: AuthenticatedUser; error?: string }> {
//   return profileHandler(request, reply);
// }

// /**
//  * Check email availability
//  */
// async function checkEmailHandler(
//   request: FastifyRequest<{ Body: { email: string } }>,
//   reply: FastifyReply
// ): Promise<{ success: boolean; available?: boolean; error?: string }> {
//   try {
//     const { email } = request.body;

//     if (!email || !z.string().email().safeParse(email).success) {
//       return reply.status(400).send({
//         success: false,
//         error: 'Valid email is required',
//       });
//     }

//     const existingUser = await getUserByEmail(email);
//     const available = !existingUser;

//     return reply.status(200).send({
//       success: true,
//       available,
//     });

//   } catch (error) {
//     request.server.log.error('Email check failed:', error);
//     return reply.status(500).send({
//       success: false,
//       error: 'Failed to check email availability',
//     });
//   }
// }

// /**
//  * Initiate token exchange for desktop app
//  * User scans QR code on web, desktop app gets tokens
//  */
// async function tokenExchangeInitiateHandler(
//   request: TokenExchangeInitiateRequest,
//   reply: FastifyReply
// ): Promise<any> {
//   try {
//     if (!request.user || !request.sessionId) {
//       return reply.status(401).send({
//         success: false,
//         error: 'Authentication required',
//       });
//     }

//     // Generate exchange token
//     const crypto = require('crypto');
//     const exchangeToken = generateSecureToken(32);
//     const tokenHash = crypto.createHash('sha256').update(exchangeToken).digest('hex');
//     const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

//     // Store exchange token
//     await request.server.db.verificationToken.create({
//       data: {
//         identifier: `token-exchange:${request.user.id}`,
//         token: tokenHash,
//         expires: expiresAt,
//       },
//     });

//     request.server.log.info({
//       msg: 'Token exchange initiated',
//       userId: request.user.id,
//       deviceId: request.body.deviceId,
//       platform: request.body.platform,
//     });

//     return reply.status(200).send({
//       success: true,
//       exchangeToken,
//       expiresIn: 300, // 5 minutes
//       qrCode: `jobswipe://exchange?token=${exchangeToken}`,
//     });

//   } catch (error) {
//     request.server.log.error('Token exchange initiation failed:', error);
//     return reply.status(500).send({
//       success: false,
//       error: 'Token exchange initiation failed',
//     });
//   }
// }

// /**
//  * Complete token exchange for desktop app
//  * Desktop app exchanges token for access/refresh tokens
//  */
// async function tokenExchangeCompleteHandler(
//   request: TokenExchangeCompleteRequest,
//   reply: FastifyReply
// ): Promise<any> {
//   try {
//     const { exchangeToken, deviceId, deviceName, platform, deviceType } = request.body;

//     // Verify exchange token
//     const crypto = require('crypto');
//     const tokenHash = crypto.createHash('sha256').update(exchangeToken).digest('hex');

//     const verificationToken = await request.server.db.verificationToken.findFirst({
//       where: {
//         token: tokenHash,
//         identifier: {
//           startsWith: 'token-exchange:',
//         },
//       },
//     });

//     if (!verificationToken) {
//       return reply.status(400).send({
//         success: false,
//         error: 'Invalid or expired exchange token',
//       });
//     }

//     // Check expiration
//     if (new Date() > verificationToken.expires) {
//       await request.server.db.verificationToken.delete({
//         where: {
//           identifier_token: {
//             identifier: verificationToken.identifier,
//             token: verificationToken.token,
//           },
//         },
//       });

//       return reply.status(400).send({
//         success: false,
//         error: 'Exchange token has expired',
//       });
//     }

//     // Extract user ID from identifier
//     const userId = verificationToken.identifier.replace('token-exchange:', '');

//     // Get user
//     const user = await getUserById(userId);
//     if (!user) {
//       return reply.status(404).send({
//         success: false,
//         error: 'User not found',
//       });
//     }

//     // Delete used token
//     await request.server.db.verificationToken.delete({
//       where: {
//         identifier_token: {
//           identifier: verificationToken.identifier,
//           token: verificationToken.token,
//         },
//       },
//     });

//     // Create desktop session
//     const sessionOptions = {
//       userId: createBrandedId<UserId>(user.id),
//       source: 'desktop' as any,
//       provider: AuthProvider.CREDENTIALS,
//       ipAddress: getClientIP(request),
//       userAgent: `${platform} ${deviceType} - ${deviceName}`,
//       metadata: {
//         email: user.email,
//         name: user.name,
//         role: user.role,
//         deviceId,
//         deviceName,
//         platform,
//         deviceType,
//       },
//     };

//     const session = await request.server.sessionService.createSession(sessionOptions);

//     // Generate tokens for desktop
//     const accessTokenResult = await request.server.jwtService.createToken({
//       userId: user.id,
//       email: user.email,
//       role: user.role,
//       status: user.status,
//       sessionId: session.id,
//       expiresIn: '15m',
//     });

//     const refreshToken = await request.server.jwtService.createRefreshToken(
//       user.id,
//       session.id
//     );

//     request.server.log.info({
//       msg: 'Token exchange completed',
//       userId: user.id,
//       deviceId,
//       platform,
//       deviceType,
//     });

//     return reply.status(200).send({
//       success: true,
//       tokens: {
//         accessToken: accessTokenResult.token,
//         refreshToken,
//         tokenType: 'Bearer',
//         expiresIn: accessTokenResult.expiresIn,
//         refreshExpiresIn: 7 * 24 * 60 * 60,
//       },
//       deviceId,
//       session,
//     });

//   } catch (error) {
//     request.server.log.error('Token exchange completion failed:', error);
//     return reply.status(500).send({
//       success: false,
//       error: 'Token exchange completion failed',
//     });
//   }
// }

// // =============================================================================
// // MIDDLEWARE
// // =============================================================================

// /**
//  * Authentication middleware
//  */
// async function authMiddleware(
//   request: AuthRouteRequest,
//   reply: FastifyReply
// ): Promise<void> {
//   try {
//     const authHeader = request.headers.authorization;
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return reply.status(401).send({
//         success: false,
//         error: 'Authentication required',
//         errorCode: AuthErrorCode.TOKEN_INVALID,
//       });
//     }

//     const token = authHeader.split(' ')[1];
//     const tokenResult = await request.server.jwtService.verifyToken(token);

//     if (!tokenResult.valid || !tokenResult.payload) {
//       return reply.status(401).send({
//         success: false,
//         error: 'Invalid token',
//         errorCode: AuthErrorCode.TOKEN_INVALID,
//       });
//     }

//     // Get user
//     const user = await getUserById(tokenResult.payload.sub);
//     if (!user) {
//       return reply.status(401).send({
//         success: false,
//         error: 'User not found',
//         errorCode: AuthErrorCode.TOKEN_INVALID,
//       });
//     }

//     // Set user in request
//     request.user = {
//       id: createBrandedId<UserId>(user.id),
//       email: user.email,
//       name: user.name,
//       role: user.role,
//       status: user.status,
//       profile: user.profile,
//       emailVerified: user.emailVerified,
//       lastLoginAt: user.lastLoginAt,
//       createdAt: user.createdAt,
//       updatedAt: user.updatedAt,
//     };

//     request.sessionId = tokenResult.payload.sessionId;

//   } catch (error) {
//     request.server.log.error('Auth middleware failed:', error);
//     return reply.status(500).send({
//       success: false,
//       error: 'Authentication failed',
//       errorCode: AuthErrorCode.INTERNAL_ERROR,
//     });
//   }
// }

// /**
//  * Security middleware for IP tracking and security headers
//  */
// async function securityMiddleware(
//   request: AuthRouteRequest,
//   reply: FastifyReply
// ): Promise<void> {
//   try {
//     // Extract IP address
//     request.ipAddress = getClientIP(request);

//     // Set security headers
//     reply.header('X-Content-Type-Options', 'nosniff');
//     reply.header('X-Frame-Options', 'DENY');
//     reply.header('X-XSS-Protection', '1; mode=block');
//     reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');

//     if (process.env.NODE_ENV === 'production') {
//       reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
//     }

//   } catch (error) {
//     request.server.log.error('Security middleware failed:', error);
//     return reply.status(500).send({
//       success: false,
//       error: 'Security check failed',
//       errorCode: AuthErrorCode.INTERNAL_ERROR,
//     });
//   }
// }

// // =============================================================================
// // ROUTE REGISTRATION
// // =============================================================================

// /**
//  * Register unified authentication routes
//  */
// export async function registerAuthRoutes(fastify: FastifyInstance): Promise<void> {
//   // Add security middleware to all routes
//   fastify.addHook('preHandler', securityMiddleware);

//   // Public routes
//   fastify.post('/register', {
//     schema: {
//       summary: 'Register new user account',
//       description: 'Create a new user account with email verification',
//       tags: ['Authentication'],
//       body: {
//         type: 'object',
//         required: ['email', 'password', 'source', 'termsAccepted', 'privacyAccepted'],
//         properties: {
//           email: { type: 'string', format: 'email' },
//           password: { type: 'string', minLength: 8 },
//           name: { type: 'string' },
//           firstName: { type: 'string' },
//           lastName: { type: 'string' },
//           source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
//           termsAccepted: { type: 'boolean' },
//           privacyAccepted: { type: 'boolean' },
//           marketingConsent: { type: 'boolean' },
//         },
//       },
//     },
//     config: {
//       rateLimit: {
//         max: 3,
//         timeWindow: '15 minutes'
//       }
//     }
//   }, registerHandler);

//   fastify.post('/login', {
//     schema: {
//       summary: 'Authenticate user',
//       description: 'Login with email and password (includes account lockout protection)',
//       tags: ['Authentication'],
//       body: {
//         type: 'object',
//         required: ['email', 'password', 'source'],
//         properties: {
//           email: { type: 'string', format: 'email' },
//           password: { type: 'string' },
//           source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
//           rememberMe: { type: 'boolean' },
//         },
//       },
//     },
//     config: {
//       rateLimit: {
//         max: 5,
//         timeWindow: '15 minutes'
//       }
//     }
//   }, loginHandler);

//   fastify.post('/verify-email', {
//     schema: {
//       summary: 'Verify email address',
//       description: 'Verify user email with verification token from email',
//       tags: ['Authentication'],
//       body: {
//         type: 'object',
//         required: ['token'],
//         properties: {
//           token: { type: 'string' },
//         },
//       },
//     },
//   }, verifyEmailHandler);

//   fastify.post('/resend-verification', {
//     schema: {
//       summary: 'Resend verification email',
//       description: 'Resend email verification link to user',
//       tags: ['Authentication'],
//       body: {
//         type: 'object',
//         required: ['email'],
//         properties: {
//           email: { type: 'string', format: 'email' },
//         },
//       },
//     },
//     config: {
//       rateLimit: {
//         max: 3,
//         timeWindow: '15 minutes'
//       }
//     }
//   }, resendVerificationHandler);

//   fastify.post('/refresh', {
//     schema: {
//       summary: 'Refresh access token',
//       description: 'Refresh access token using refresh token',
//       tags: ['Authentication'],
//       body: {
//         type: 'object',
//         required: ['refreshToken'],
//         properties: {
//           refreshToken: { type: 'string' },
//           source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
//         },
//       },
//     },
//   }, refreshTokenHandler);

//   fastify.post('/token/refresh', {
//     schema: {
//       summary: 'Refresh access token (alternate path)',
//       description: 'Refresh access token using refresh token',
//       tags: ['Authentication'],
//       body: {
//         type: 'object',
//         required: ['refreshToken'],
//         properties: {
//           refreshToken: { type: 'string' },
//           source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
//         },
//       },
//     },
//   }, refreshTokenHandler);

//   fastify.post('/check-email', {
//     schema: {
//       summary: 'Check email availability',
//       description: 'Check if email is available for registration',
//       tags: ['Authentication'],
//       body: {
//         type: 'object',
//         required: ['email'],
//         properties: {
//           email: { type: 'string', format: 'email' },
//         },
//       },
//     },
//   }, checkEmailHandler);

//   fastify.post('/password/reset', {
//     schema: {
//       summary: 'Request password reset',
//       description: 'Request password reset link via email',
//       tags: ['Authentication'],
//       body: {
//         type: 'object',
//         required: ['email', 'source'],
//         properties: {
//           email: { type: 'string', format: 'email' },
//           source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
//         },
//       },
//     },
//     config: {
//       rateLimit: {
//         max: 3,
//         timeWindow: '15 minutes'
//       }
//     }
//   }, passwordResetHandler);

//   fastify.post('/password/reset-complete', {
//     schema: {
//       summary: 'Complete password reset',
//       description: 'Complete password reset with token from email',
//       tags: ['Authentication'],
//       body: {
//         type: 'object',
//         required: ['token', 'newPassword', 'source'],
//         properties: {
//           token: { type: 'string' },
//           newPassword: { type: 'string', minLength: 8 },
//           source: { type: 'string', enum: ['web', 'desktop', 'mobile', 'api'] },
//         },
//       },
//     },
//   }, passwordResetCompleteHandler);

//   // Protected routes (require authentication)
//   fastify.register(async (fastify: FastifyInstance) => {
//     fastify.addHook('preHandler', authMiddleware);

//     fastify.post('/logout', {
//       schema: {
//         summary: 'Logout user',
//         description: 'Logout user and revoke session',
//         tags: ['Authentication'],
//         security: [{ Bearer: [] }],
//       },
//     }, logoutHandler);

//     fastify.get('/profile', {
//       schema: {
//         summary: 'Get user profile',
//         description: 'Get current user profile',
//         tags: ['Authentication'],
//         security: [{ Bearer: [] }],
//       },
//     }, profileHandler);

//     fastify.get('/me', {
//       schema: {
//         summary: 'Get current user',
//         description: 'Get current authenticated user',
//         tags: ['Authentication'],
//         security: [{ Bearer: [] }],
//       },
//     }, meHandler);

//     fastify.post('/password/change', {
//       schema: {
//         summary: 'Change password',
//         description: 'Change user password (requires authentication)',
//         tags: ['Authentication'],
//         security: [{ Bearer: [] }],
//         body: {
//           type: 'object',
//           required: ['currentPassword', 'newPassword'],
//           properties: {
//             currentPassword: { type: 'string' },
//             newPassword: { type: 'string', minLength: 8 },
//           },
//         },
//       },
//     }, passwordChangeHandler);

//     // Desktop token exchange routes (protected - requires web authentication)
//     fastify.post('/token/exchange/initiate', {
//       schema: {
//         summary: 'Initiate desktop token exchange',
//         description: 'Generate exchange token for desktop app (scan QR code on web)',
//         tags: ['Authentication', 'Desktop'],
//         security: [{ Bearer: [] }],
//         body: {
//           type: 'object',
//           required: ['deviceId', 'deviceName', 'platform', 'deviceType'],
//           properties: {
//             deviceId: { type: 'string' },
//             deviceName: { type: 'string' },
//             platform: { type: 'string' },
//             deviceType: { type: 'string', enum: ['desktop', 'mobile', 'tablet'] },
//             appVersion: { type: 'string' },
//             osVersion: { type: 'string' },
//           },
//         },
//       },
//     }, tokenExchangeInitiateHandler);

//     fastify.post('/token/exchange/complete', {
//       schema: {
//         summary: 'Complete desktop token exchange',
//         description: 'Exchange token for desktop app tokens',
//         tags: ['Authentication', 'Desktop'],
//         body: {
//           type: 'object',
//           required: ['exchangeToken', 'deviceId', 'deviceName', 'platform', 'deviceType'],
//           properties: {
//             exchangeToken: { type: 'string' },
//             deviceId: { type: 'string' },
//             deviceName: { type: 'string' },
//             platform: { type: 'string' },
//             deviceType: { type: 'string', enum: ['desktop', 'mobile', 'tablet'] },
//             appVersion: { type: 'string' },
//             osVersion: { type: 'string' },
//           },
//         },
//       },
//     }, tokenExchangeCompleteHandler);
//   });

//   fastify.log.info('✅ Unified authentication routes registered successfully');
// }

// // =============================================================================
// // EXPORTS
// // =============================================================================

// export {
//   // Middleware
//   authMiddleware,
//   securityMiddleware,

//   // Authentication handlers
//   loginHandler,
//   registerHandler,
//   refreshTokenHandler,
//   logoutHandler,

//   // Password management
//   passwordResetHandler,
//   passwordResetCompleteHandler,
//   passwordChangeHandler,

//   // Email verification
//   verifyEmailHandler,
//   resendVerificationHandler,

//   // User profile
//   profileHandler,
//   meHandler,
//   checkEmailHandler,

//   // Desktop token exchange
//   tokenExchangeInitiateHandler,
//   tokenExchangeCompleteHandler,
// };
