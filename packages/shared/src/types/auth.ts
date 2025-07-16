/**
 * @fileoverview Shared authentication types and interfaces for JobSwipe
 * @description Enterprise-grade authentication types supporting both web and desktop clients
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { z } from 'zod';

// =============================================================================
// USER BRANDED TYPES
// =============================================================================

/**
 * Branded type for User ID to prevent mixing with other string IDs
 */
export type UserId = string & { readonly __brand: 'UserId' };

/**
 * Branded type for Session ID to prevent mixing with other string IDs
 */
export type SessionId = string & { readonly __brand: 'SessionId' };

/**
 * Branded type for Token ID to prevent mixing with other string IDs
 */
export type TokenId = string & { readonly __brand: 'TokenId' };

// =============================================================================
// AUTHENTICATION ENUMS
// =============================================================================

/**
 * Authentication providers supported by the system
 */
export enum AuthProvider {
  CREDENTIALS = 'credentials',
  GOOGLE = 'google',
  GITHUB = 'github',
  LINKEDIN = 'linkedin',
  MICROSOFT = 'microsoft',
  APPLE = 'apple',
}

/**
 * Authentication sources for tracking and analytics
 */
export enum AuthSource {
  WEB = 'web',
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  API = 'api',
}

/**
 * Token types for different authentication scenarios
 */
export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
  VERIFICATION = 'verification',
  PASSWORD_RESET = 'password_reset',
  DESKTOP_LONG_LIVED = 'desktop_long_lived',
  API_KEY = 'api_key',
}

/**
 * Session status enumeration
 */
export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  LOCKED = 'locked',
}

/**
 * Authentication event types for audit logging
 */
export enum AuthEvent {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  TOKEN_REFRESH = 'token_refresh',
  TOKEN_REVOKE = 'token_revoke',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  VERIFICATION_EMAIL_SENT = 'verification_email_sent',
  EMAIL_VERIFIED = 'email_verified',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  SECURITY_BREACH = 'security_breach',
}

// =============================================================================
// CORE AUTHENTICATION INTERFACES
// =============================================================================

/**
 * Authenticated user information returned to clients
 */
export interface AuthenticatedUser {
  id: UserId;
  email: string;
  name?: string;
  avatar?: string;
  emailVerified?: Date;
  role: string;
  status: string;
  
  // Profile information
  profile?: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    bio?: string;
    location?: string;
    timezone?: string;
  };
  
  // Subscription information
  subscription?: {
    plan: string;
    status: string;
    expiresAt?: Date;
    features: string[];
  };
  
  // Security context
  lastLoginAt?: Date;
  twoFactorEnabled?: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * JWT token payload structure
 */
export interface JwtPayload {
  sub: UserId;
  email: string;
  name?: string;
  role: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
  jti: TokenId;
  type: TokenType;
  source: AuthSource;
  sessionId?: SessionId;
  
  // Security context
  ipAddress?: string;
  userAgent?: string;
  
  // Additional claims
  permissions?: string[];
  features?: string[];
  
  // Desktop-specific claims
  deviceId?: string;
  deviceName?: string;
}

/**
 * Authentication token pair
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  refreshExpiresIn: number;
  scope?: string;
}

/**
 * Session information
 */
export interface AuthSession {
  id: SessionId;
  userId: UserId;
  status: SessionStatus;
  source: AuthSource;
  provider: AuthProvider;
  
  // Token information
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt: Date;
  refreshExpiresAt?: Date;
  
  // Security context
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  
  // Device information
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  
  // Session metadata
  metadata?: Record<string, any>;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
}

/**
 * Authentication context for requests
 */
export interface AuthContext {
  user: AuthenticatedUser;
  session: AuthSession;
  tokens: AuthTokens;
  permissions: string[];
  features: string[];
  
  // Request context
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  
  // Security flags
  isSuspicious?: boolean;
  isNewDevice?: boolean;
  requiresReauth?: boolean;
}

// =============================================================================
// AUTHENTICATION REQUEST/RESPONSE TYPES
// =============================================================================

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  source: AuthSource;
  
  // Security context
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  deviceName?: string;
  
  // Two-factor authentication
  twoFactorCode?: string;
  twoFactorMethod?: 'totp' | 'sms' | 'email';
}

/**
 * Login response payload
 */
export interface LoginResponse {
  success: boolean;
  user?: AuthenticatedUser;
  tokens?: AuthTokens;
  session?: AuthSession;
  
  // Error information
  error?: string;
  errorCode?: string;
  
  // Security actions required
  requiresTwoFactor?: boolean;
  requiresEmailVerification?: boolean;
  requiresPasswordReset?: boolean;
  
  // Rate limiting information
  rateLimitRemaining?: number;
  rateLimitReset?: Date;
}

/**
 * Registration request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  source: AuthSource;
  
  // Profile information
  firstName?: string;
  lastName?: string;
  timezone?: string;
  
  // Consent and legal
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingConsent?: boolean;
  
  // Security context
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  deviceName?: string;
}

/**
 * Registration response payload
 */
export interface RegisterResponse {
  success: boolean;
  user?: AuthenticatedUser;
  tokens?: AuthTokens;
  session?: AuthSession;
  
  // Error information
  error?: string;
  errorCode?: string;
  
  // Actions required
  requiresEmailVerification?: boolean;
  verificationEmailSent?: boolean;
}

/**
 * Token refresh request payload
 */
export interface RefreshTokenRequest {
  refreshToken: string;
  source: AuthSource;
  
  // Security context
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
}

/**
 * Token refresh response payload
 */
export interface RefreshTokenResponse {
  success: boolean;
  tokens?: AuthTokens;
  
  // Error information
  error?: string;
  errorCode?: string;
  
  // Security actions
  requiresReauth?: boolean;
  sessionRevoked?: boolean;
}

/**
 * Password reset request payload
 */
export interface PasswordResetRequest {
  email: string;
  source: AuthSource;
  
  // Security context
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Password reset response payload
 */
export interface PasswordResetResponse {
  success: boolean;
  message: string;
  
  // Rate limiting information
  rateLimitRemaining?: number;
  rateLimitReset?: Date;
}

/**
 * Password change request payload
 */
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  
  // Security context
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Password change response payload
 */
export interface PasswordChangeResponse {
  success: boolean;
  message: string;
  
  // Security actions
  sessionsRevoked?: boolean;
  requiresReauth?: boolean;
}

// =============================================================================
// TOKEN EXCHANGE TYPES
// =============================================================================

/**
 * Token exchange request for web-desktop authentication bridge
 */
export interface TokenExchangeRequest {
  exchangeToken: string;
  expiresAt: Date;
  deviceId: string;
  
  // Instructions for user
  instructions: {
    step1: string;
    step2: string;
    step3: string;
    warning: string;
  };
}

/**
 * Token exchange response for desktop long-lived token
 */
export interface TokenExchangeResponse {
  success: boolean;
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  tokenId: TokenId;
  deviceId: string;
  
  // Token information
  issuedAt: Date;
  expiresAt: Date;
  
  // User permissions and features
  permissions: string[];
  features: string[];
  
  // Error information
  error?: string;
  errorCode?: string;
}

// =============================================================================
// DESKTOP AUTHENTICATION TYPES
// =============================================================================

/**
 * Desktop authentication request
 */
export interface DesktopAuthRequest {
  webSessionToken: string;
  deviceId: string;
  deviceName: string;
  
  // Security context
  ipAddress?: string;
  userAgent?: string;
  systemInfo?: {
    platform: string;
    version: string;
    arch: string;
  };
}

/**
 * Desktop authentication response
 */
export interface DesktopAuthResponse {
  success: boolean;
  longLivedToken?: string;
  expiresAt?: Date;
  
  // Error information
  error?: string;
  errorCode?: string;
  
  // Configuration
  config?: {
    apiBaseUrl: string;
    features: string[];
    permissions: string[];
  };
}

/**
 * Desktop token validation request
 */
export interface DesktopTokenValidationRequest {
  token: string;
  
  // Security context
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
}

/**
 * Desktop token validation response
 */
export interface DesktopTokenValidationResponse {
  valid: boolean;
  user?: AuthenticatedUser;
  
  // Error information
  error?: string;
  errorCode?: string;
  
  // Token information
  expiresAt?: Date;
  requiresRefresh?: boolean;
}

// =============================================================================
// AUDIT AND SECURITY TYPES
// =============================================================================

/**
 * Authentication audit log entry
 */
export interface AuthAuditLog {
  id: string;
  userId?: UserId;
  sessionId?: SessionId;
  event: AuthEvent;
  
  // Event details
  success: boolean;
  message?: string;
  details?: Record<string, any>;
  
  // Security context
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  
  // Device information
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  
  // Risk assessment
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors?: string[];
  
  // Metadata
  source: AuthSource;
  provider?: AuthProvider;
  timestamp: Date;
}

/**
 * Security incident report
 */
export interface SecurityIncident {
  id: string;
  type: 'brute_force' | 'credential_stuffing' | 'account_takeover' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Incident details
  description: string;
  affectedUsers: UserId[];
  ipAddresses: string[];
  userAgents: string[];
  
  // Timeline
  startTime: Date;
  endTime?: Date;
  duration?: number;
  
  // Response actions
  actionsTaken: string[];
  mitigationStatus: 'pending' | 'in_progress' | 'resolved';
  
  // Metadata
  detectedBy: 'system' | 'user' | 'admin';
  reportedAt: Date;
  resolvedAt?: Date;
}

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

/**
 * Zod schema for login request validation
 */
export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address').min(5).max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  rememberMe: z.boolean().optional(),
  source: z.nativeEnum(AuthSource),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
  twoFactorCode: z.string().optional(),
  twoFactorMethod: z.enum(['totp', 'sms', 'email']).optional(),
});

/**
 * Zod schema for registration request validation
 */
export const RegisterRequestSchema = z.object({
  email: z.string().email('Invalid email address').min(5).max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  name: z.string().min(2).max(100).optional(),
  source: z.nativeEnum(AuthSource),
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  timezone: z.string().optional(),
  termsAccepted: z.boolean().refine((val: boolean) => val === true, 'Terms must be accepted'),
  privacyAccepted: z.boolean().refine((val: boolean) => val === true, 'Privacy policy must be accepted'),
  marketingConsent: z.boolean().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
});

/**
 * Zod schema for password change request validation
 */
export const PasswordChangeRequestSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

/**
 * Zod schema for password reset request validation
 */
export const PasswordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address').min(5).max(255),
  source: z.nativeEnum(AuthSource),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

/**
 * Zod schema for desktop authentication request validation
 */
export const DesktopAuthRequestSchema = z.object({
  webSessionToken: z.string().min(1, 'Web session token is required'),
  deviceId: z.string().min(1, 'Device ID is required'),
  deviceName: z.string().min(1, 'Device name is required'),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  systemInfo: z.object({
    platform: z.string(),
    version: z.string(),
    arch: z.string(),
  }).optional(),
});

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Create branded type helper
 */
export function createBrandedId<T extends string>(id: string): T {
  return id as T;
}

/**
 * Extract user ID from branded type
 */
export function extractUserId(userId: UserId): string {
  return userId as string;
}

/**
 * Extract session ID from branded type
 */
export function extractSessionId(sessionId: SessionId): string {
  return sessionId as string;
}

/**
 * Extract token ID from branded type
 */
export function extractTokenId(tokenId: TokenId): string {
  return tokenId as string;
}

/**
 * Type guard for authenticated user
 */
export function isAuthenticatedUser(user: any): user is AuthenticatedUser {
  return user && typeof user.id === 'string' && typeof user.email === 'string';
}

/**
 * Type guard for JWT payload
 */
export function isJwtPayload(payload: any): payload is JwtPayload {
  return payload && typeof payload.sub === 'string' && typeof payload.email === 'string';
}

/**
 * Type guard for auth session
 */
export function isAuthSession(session: any): session is AuthSession {
  return session && typeof session.id === 'string' && typeof session.userId === 'string';
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Token expiration times in seconds
 */
export const TOKEN_EXPIRATION = {
  ACCESS: 15 * 60, // 15 minutes
  REFRESH: 30 * 24 * 60 * 60, // 30 days
  DESKTOP_LONG_LIVED: 90 * 24 * 60 * 60, // 90 days
  VERIFICATION: 24 * 60 * 60, // 24 hours
  PASSWORD_RESET: 2 * 60 * 60, // 2 hours
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  LOGIN: {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
  },
  REGISTER: {
    MAX_ATTEMPTS: 3,
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
  },
  PASSWORD_RESET: {
    MAX_ATTEMPTS: 3,
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
  },
  TOKEN_REFRESH: {
    MAX_ATTEMPTS: 10,
    WINDOW_MS: 60 * 1000, // 1 minute
  },
} as const;

/**
 * Security configuration
 */
export const SECURITY_CONFIG = {
  BCRYPT_ROUNDS: 12,
  JWT_ALGORITHM: 'RS256' as const,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_SESSIONS_PER_USER: 5,
  SUSPICIOUS_ACTIVITY_THRESHOLD: 3,
  DEVICE_TRUST_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days
} as const;

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * Authentication error codes
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_INVALID = 'SESSION_INVALID',
  TWO_FACTOR_REQUIRED = 'TWO_FACTOR_REQUIRED',
  TWO_FACTOR_INVALID = 'TWO_FACTOR_INVALID',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  DEVICE_NOT_TRUSTED = 'DEVICE_NOT_TRUSTED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * Authentication error class
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: AuthErrorCode,
    public statusCode: number = 401,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AuthError';
    
    // Maintain proper stack trace
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, AuthError);
    }
  }
}

/**
 * Helper function to create authentication errors
 */
export function createAuthError(
  code: AuthErrorCode,
  message?: string,
  statusCode?: number,
  details?: Record<string, any>
): AuthError {
  const defaultMessages: Record<AuthErrorCode, string> = {
    [AuthErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password',
    [AuthErrorCode.ACCOUNT_LOCKED]: 'Account is locked due to multiple failed login attempts',
    [AuthErrorCode.ACCOUNT_DISABLED]: 'Account has been disabled',
    [AuthErrorCode.EMAIL_NOT_VERIFIED]: 'Email address has not been verified',
    [AuthErrorCode.TOKEN_EXPIRED]: 'Authentication token has expired',
    [AuthErrorCode.TOKEN_INVALID]: 'Invalid authentication token',
    [AuthErrorCode.TOKEN_REVOKED]: 'Authentication token has been revoked',
    [AuthErrorCode.SESSION_EXPIRED]: 'Session has expired',
    [AuthErrorCode.SESSION_INVALID]: 'Invalid session',
    [AuthErrorCode.TWO_FACTOR_REQUIRED]: 'Two-factor authentication is required',
    [AuthErrorCode.TWO_FACTOR_INVALID]: 'Invalid two-factor authentication code',
    [AuthErrorCode.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded. Please try again later',
    [AuthErrorCode.SUSPICIOUS_ACTIVITY]: 'Suspicious activity detected. Please verify your identity',
    [AuthErrorCode.DEVICE_NOT_TRUSTED]: 'Device is not trusted. Please verify your identity',
    [AuthErrorCode.PERMISSION_DENIED]: 'Permission denied',
    [AuthErrorCode.INVALID_REQUEST]: 'Invalid request',
    [AuthErrorCode.NOT_FOUND]: 'Resource not found',
    [AuthErrorCode.CONFLICT]: 'Resource conflict',
    [AuthErrorCode.INTERNAL_ERROR]: 'Internal server error',
  };
  
  return new AuthError(
    message || defaultMessages[code],
    code,
    statusCode || 401,
    details
  );
}