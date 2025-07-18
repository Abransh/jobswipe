/**
 * @fileoverview Shared authentication types and interfaces for JobSwipe
 * @description Enterprise-grade authentication types supporting both web and desktop clients
 * @version 1.0.0
 * @author JobSwipe Team
 */
import { z } from 'zod';
/**
 * Branded type for User ID to prevent mixing with other string IDs
 */
export type UserId = string & {
    readonly __brand: 'UserId';
};
/**
 * Branded type for Session ID to prevent mixing with other string IDs
 */
export type SessionId = string & {
    readonly __brand: 'SessionId';
};
/**
 * Branded type for Token ID to prevent mixing with other string IDs
 */
export type TokenId = string & {
    readonly __brand: 'TokenId';
};
/**
 * Authentication providers supported by the system
 */
export declare enum AuthProvider {
    CREDENTIALS = "credentials",
    GOOGLE = "google",
    GITHUB = "github",
    LINKEDIN = "linkedin",
    MICROSOFT = "microsoft",
    APPLE = "apple"
}
/**
 * Authentication sources for tracking and analytics
 */
export declare enum AuthSource {
    WEB = "web",
    DESKTOP = "desktop",
    MOBILE = "mobile",
    API = "api"
}
/**
 * Token types for different authentication scenarios
 */
export declare enum TokenType {
    ACCESS = "access",
    REFRESH = "refresh",
    VERIFICATION = "verification",
    PASSWORD_RESET = "password_reset",
    DESKTOP_LONG_LIVED = "desktop_long_lived",
    API_KEY = "api_key"
}
/**
 * Session status enumeration
 */
export declare enum SessionStatus {
    ACTIVE = "active",
    EXPIRED = "expired",
    REVOKED = "revoked",
    LOCKED = "locked"
}
/**
 * Authentication event types for audit logging
 */
export declare enum AuthEvent {
    LOGIN_SUCCESS = "login_success",
    LOGIN_FAILURE = "login_failure",
    LOGOUT = "logout",
    TOKEN_REFRESH = "token_refresh",
    TOKEN_REVOKE = "token_revoke",
    PASSWORD_CHANGE = "password_change",
    PASSWORD_RESET = "password_reset",
    ACCOUNT_LOCKED = "account_locked",
    ACCOUNT_UNLOCKED = "account_unlocked",
    VERIFICATION_EMAIL_SENT = "verification_email_sent",
    EMAIL_VERIFIED = "email_verified",
    SUSPICIOUS_ACTIVITY = "suspicious_activity",
    SECURITY_BREACH = "security_breach"
}
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
    profile?: {
        firstName?: string;
        lastName?: string;
        displayName?: string;
        bio?: string;
        location?: string;
        timezone?: string;
    };
    subscription?: {
        plan: string;
        status: string;
        expiresAt?: Date;
        features: string[];
    };
    lastLoginAt?: Date;
    twoFactorEnabled?: boolean;
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
    ipAddress?: string;
    userAgent?: string;
    permissions?: string[];
    features?: string[];
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
    accessToken: string;
    refreshToken?: string;
    tokenExpiresAt: Date;
    refreshExpiresAt?: Date;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    deviceId?: string;
    deviceName?: string;
    deviceType?: string;
    metadata?: Record<string, any>;
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
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
    isSuspicious?: boolean;
    isNewDevice?: boolean;
    requiresReauth?: boolean;
}
/**
 * Login request payload
 */
export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
    source: AuthSource;
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
    deviceName?: string;
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
    error?: string;
    errorCode?: string;
    requiresTwoFactor?: boolean;
    requiresEmailVerification?: boolean;
    requiresPasswordReset?: boolean;
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
    firstName?: string;
    lastName?: string;
    timezone?: string;
    termsAccepted: boolean;
    privacyAccepted: boolean;
    marketingConsent?: boolean;
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
    error?: string;
    errorCode?: string;
    requiresEmailVerification?: boolean;
    verificationEmailSent?: boolean;
}
/**
 * Token refresh request payload
 */
export interface RefreshTokenRequest {
    refreshToken: string;
    source: AuthSource;
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
    error?: string;
    errorCode?: string;
    requiresReauth?: boolean;
    sessionRevoked?: boolean;
}
/**
 * Password reset request payload
 */
export interface PasswordResetRequest {
    email: string;
    source: AuthSource;
    ipAddress?: string;
    userAgent?: string;
}
/**
 * Password reset response payload
 */
export interface PasswordResetResponse {
    success: boolean;
    message: string;
    rateLimitRemaining?: number;
    rateLimitReset?: Date;
}
/**
 * Password change request payload
 */
export interface PasswordChangeRequest {
    currentPassword: string;
    newPassword: string;
    ipAddress?: string;
    userAgent?: string;
}
/**
 * Password change response payload
 */
export interface PasswordChangeResponse {
    success: boolean;
    message: string;
    sessionsRevoked?: boolean;
    requiresReauth?: boolean;
}
/**
 * Token exchange request for web-desktop authentication bridge
 */
export interface TokenExchangeRequest {
    exchangeToken: string;
    expiresAt: Date;
    deviceId: string;
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
    issuedAt: Date;
    expiresAt: Date;
    permissions: string[];
    features: string[];
    error?: string;
    errorCode?: string;
}
/**
 * Desktop authentication request
 */
export interface DesktopAuthRequest {
    webSessionToken: string;
    deviceId: string;
    deviceName: string;
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
    error?: string;
    errorCode?: string;
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
    error?: string;
    errorCode?: string;
    expiresAt?: Date;
    requiresRefresh?: boolean;
}
/**
 * Authentication audit log entry
 */
export interface AuthAuditLog {
    id: string;
    userId?: UserId;
    sessionId?: SessionId;
    event: AuthEvent;
    success: boolean;
    message?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    deviceId?: string;
    deviceName?: string;
    deviceType?: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskFactors?: string[];
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
    description: string;
    affectedUsers: UserId[];
    ipAddresses: string[];
    userAgents: string[];
    startTime: Date;
    endTime?: Date;
    duration?: number;
    actionsTaken: string[];
    mitigationStatus: 'pending' | 'in_progress' | 'resolved';
    detectedBy: 'system' | 'user' | 'admin';
    reportedAt: Date;
    resolvedAt?: Date;
}
/**
 * Zod schema for login request validation
 */
export declare const LoginRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    rememberMe: z.ZodOptional<z.ZodBoolean>;
    source: z.ZodNativeEnum<typeof AuthSource>;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    deviceId: z.ZodOptional<z.ZodString>;
    deviceName: z.ZodOptional<z.ZodString>;
    twoFactorCode: z.ZodOptional<z.ZodString>;
    twoFactorMethod: z.ZodOptional<z.ZodEnum<["totp", "sms", "email"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    source: AuthSource;
    rememberMe?: boolean | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    deviceId?: string | undefined;
    deviceName?: string | undefined;
    twoFactorCode?: string | undefined;
    twoFactorMethod?: "email" | "sms" | "totp" | undefined;
}, {
    email: string;
    password: string;
    source: AuthSource;
    rememberMe?: boolean | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    deviceId?: string | undefined;
    deviceName?: string | undefined;
    twoFactorCode?: string | undefined;
    twoFactorMethod?: "email" | "sms" | "totp" | undefined;
}>;
/**
 * Zod schema for registration request validation
 */
export declare const RegisterRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    source: z.ZodNativeEnum<typeof AuthSource>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    timezone: z.ZodOptional<z.ZodString>;
    termsAccepted: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
    privacyAccepted: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
    marketingConsent: z.ZodOptional<z.ZodBoolean>;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    deviceId: z.ZodOptional<z.ZodString>;
    deviceName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    source: AuthSource;
    termsAccepted: boolean;
    privacyAccepted: boolean;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    deviceId?: string | undefined;
    deviceName?: string | undefined;
    name?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    timezone?: string | undefined;
    marketingConsent?: boolean | undefined;
}, {
    email: string;
    password: string;
    source: AuthSource;
    termsAccepted: boolean;
    privacyAccepted: boolean;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    deviceId?: string | undefined;
    deviceName?: string | undefined;
    name?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    timezone?: string | undefined;
    marketingConsent?: boolean | undefined;
}>;
/**
 * Zod schema for password change request validation
 */
export declare const PasswordChangeRequestSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}, {
    currentPassword: string;
    newPassword: string;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}>;
/**
 * Zod schema for password reset request validation
 */
export declare const PasswordResetRequestSchema: z.ZodObject<{
    email: z.ZodString;
    source: z.ZodNativeEnum<typeof AuthSource>;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    source: AuthSource;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}, {
    email: string;
    source: AuthSource;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}>;
/**
 * Zod schema for desktop authentication request validation
 */
export declare const DesktopAuthRequestSchema: z.ZodObject<{
    webSessionToken: z.ZodString;
    deviceId: z.ZodString;
    deviceName: z.ZodString;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    systemInfo: z.ZodOptional<z.ZodObject<{
        platform: z.ZodString;
        version: z.ZodString;
        arch: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        platform: string;
        version: string;
        arch: string;
    }, {
        platform: string;
        version: string;
        arch: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    deviceId: string;
    deviceName: string;
    webSessionToken: string;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    systemInfo?: {
        platform: string;
        version: string;
        arch: string;
    } | undefined;
}, {
    deviceId: string;
    deviceName: string;
    webSessionToken: string;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    systemInfo?: {
        platform: string;
        version: string;
        arch: string;
    } | undefined;
}>;
/**
 * Create branded type helper
 */
export declare function createBrandedId<T extends string>(id: string): T;
/**
 * Extract user ID from branded type
 */
export declare function extractUserId(userId: UserId): string;
/**
 * Extract session ID from branded type
 */
export declare function extractSessionId(sessionId: SessionId): string;
/**
 * Extract token ID from branded type
 */
export declare function extractTokenId(tokenId: TokenId): string;
/**
 * Type guard for authenticated user
 */
export declare function isAuthenticatedUser(user: any): user is AuthenticatedUser;
/**
 * Type guard for JWT payload
 */
export declare function isJwtPayload(payload: any): payload is JwtPayload;
/**
 * Type guard for auth session
 */
export declare function isAuthSession(session: any): session is AuthSession;
/**
 * Token expiration times in seconds
 */
export declare const TOKEN_EXPIRATION: {
    readonly ACCESS: number;
    readonly REFRESH: number;
    readonly DESKTOP_LONG_LIVED: number;
    readonly VERIFICATION: number;
    readonly PASSWORD_RESET: number;
};
/**
 * Rate limiting configuration
 */
export declare const RATE_LIMITS: {
    readonly LOGIN: {
        readonly MAX_ATTEMPTS: 5;
        readonly WINDOW_MS: number;
        readonly LOCKOUT_DURATION: number;
    };
    readonly REGISTER: {
        readonly MAX_ATTEMPTS: 3;
        readonly WINDOW_MS: number;
    };
    readonly PASSWORD_RESET: {
        readonly MAX_ATTEMPTS: 3;
        readonly WINDOW_MS: number;
    };
    readonly TOKEN_REFRESH: {
        readonly MAX_ATTEMPTS: 10;
        readonly WINDOW_MS: number;
    };
};
/**
 * Security configuration
 */
export declare const SECURITY_CONFIG: {
    readonly BCRYPT_ROUNDS: 12;
    readonly JWT_ALGORITHM: "RS256";
    readonly SESSION_TIMEOUT: number;
    readonly MAX_SESSIONS_PER_USER: 5;
    readonly SUSPICIOUS_ACTIVITY_THRESHOLD: 3;
    readonly DEVICE_TRUST_DURATION: number;
};
/**
 * Authentication error codes
 */
export declare enum AuthErrorCode {
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
    ACCOUNT_DISABLED = "ACCOUNT_DISABLED",
    EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED",
    TOKEN_EXPIRED = "TOKEN_EXPIRED",
    TOKEN_INVALID = "TOKEN_INVALID",
    TOKEN_REVOKED = "TOKEN_REVOKED",
    SESSION_EXPIRED = "SESSION_EXPIRED",
    SESSION_INVALID = "SESSION_INVALID",
    TWO_FACTOR_REQUIRED = "TWO_FACTOR_REQUIRED",
    TWO_FACTOR_INVALID = "TWO_FACTOR_INVALID",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
    DEVICE_NOT_TRUSTED = "DEVICE_NOT_TRUSTED",
    PERMISSION_DENIED = "PERMISSION_DENIED",
    INVALID_REQUEST = "INVALID_REQUEST",
    NOT_FOUND = "NOT_FOUND",
    CONFLICT = "CONFLICT",
    INTERNAL_ERROR = "INTERNAL_ERROR"
}
/**
 * Authentication error class
 */
export declare class AuthError extends Error {
    code: AuthErrorCode;
    statusCode: number;
    details?: Record<string, any> | undefined;
    constructor(message: string, code: AuthErrorCode, statusCode?: number, details?: Record<string, any> | undefined);
}
/**
 * Helper function to create authentication errors
 */
export declare function createAuthError(code: AuthErrorCode, message?: string, statusCode?: number, details?: Record<string, any>): AuthError;
//# sourceMappingURL=auth.d.ts.map