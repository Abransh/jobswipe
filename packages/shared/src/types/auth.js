"use strict";
/**
 * @fileoverview Shared authentication types and interfaces for JobSwipe
 * @description Enterprise-grade authentication types supporting both web and desktop clients
 * @version 1.0.0
 * @author JobSwipe Team
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthError = exports.AuthErrorCode = exports.SECURITY_CONFIG = exports.RATE_LIMITS = exports.TOKEN_EXPIRATION = exports.DesktopAuthRequestSchema = exports.PasswordResetRequestSchema = exports.PasswordChangeRequestSchema = exports.RegisterRequestSchema = exports.LoginRequestSchema = exports.AuthEvent = exports.SessionStatus = exports.TokenType = exports.AuthSource = exports.AuthProvider = void 0;
exports.createBrandedId = createBrandedId;
exports.extractUserId = extractUserId;
exports.extractSessionId = extractSessionId;
exports.extractTokenId = extractTokenId;
exports.isAuthenticatedUser = isAuthenticatedUser;
exports.isJwtPayload = isJwtPayload;
exports.isAuthSession = isAuthSession;
exports.createAuthError = createAuthError;
const zod_1 = require("zod");
// =============================================================================
// AUTHENTICATION ENUMS
// =============================================================================
/**
 * Authentication providers supported by the system
 */
var AuthProvider;
(function (AuthProvider) {
    AuthProvider["CREDENTIALS"] = "credentials";
    AuthProvider["GOOGLE"] = "google";
    AuthProvider["GITHUB"] = "github";
    AuthProvider["LINKEDIN"] = "linkedin";
    AuthProvider["MICROSOFT"] = "microsoft";
    AuthProvider["APPLE"] = "apple";
})(AuthProvider || (exports.AuthProvider = AuthProvider = {}));
/**
 * Authentication sources for tracking and analytics
 */
var AuthSource;
(function (AuthSource) {
    AuthSource["WEB"] = "web";
    AuthSource["DESKTOP"] = "desktop";
    AuthSource["MOBILE"] = "mobile";
    AuthSource["API"] = "api";
})(AuthSource || (exports.AuthSource = AuthSource = {}));
/**
 * Token types for different authentication scenarios
 */
var TokenType;
(function (TokenType) {
    TokenType["ACCESS"] = "access";
    TokenType["REFRESH"] = "refresh";
    TokenType["VERIFICATION"] = "verification";
    TokenType["PASSWORD_RESET"] = "password_reset";
    TokenType["DESKTOP_LONG_LIVED"] = "desktop_long_lived";
    TokenType["API_KEY"] = "api_key";
})(TokenType || (exports.TokenType = TokenType = {}));
/**
 * Session status enumeration
 */
var SessionStatus;
(function (SessionStatus) {
    SessionStatus["ACTIVE"] = "active";
    SessionStatus["EXPIRED"] = "expired";
    SessionStatus["REVOKED"] = "revoked";
    SessionStatus["LOCKED"] = "locked";
})(SessionStatus || (exports.SessionStatus = SessionStatus = {}));
/**
 * Authentication event types for audit logging
 */
var AuthEvent;
(function (AuthEvent) {
    AuthEvent["LOGIN_SUCCESS"] = "login_success";
    AuthEvent["LOGIN_FAILURE"] = "login_failure";
    AuthEvent["LOGOUT"] = "logout";
    AuthEvent["TOKEN_REFRESH"] = "token_refresh";
    AuthEvent["TOKEN_REVOKE"] = "token_revoke";
    AuthEvent["PASSWORD_CHANGE"] = "password_change";
    AuthEvent["PASSWORD_RESET"] = "password_reset";
    AuthEvent["ACCOUNT_LOCKED"] = "account_locked";
    AuthEvent["ACCOUNT_UNLOCKED"] = "account_unlocked";
    AuthEvent["VERIFICATION_EMAIL_SENT"] = "verification_email_sent";
    AuthEvent["EMAIL_VERIFIED"] = "email_verified";
    AuthEvent["SUSPICIOUS_ACTIVITY"] = "suspicious_activity";
    AuthEvent["SECURITY_BREACH"] = "security_breach";
})(AuthEvent || (exports.AuthEvent = AuthEvent = {}));
// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================
/**
 * Zod schema for login request validation
 */
exports.LoginRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address').min(5).max(255),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters').max(128),
    rememberMe: zod_1.z.boolean().optional(),
    source: zod_1.z.nativeEnum(AuthSource),
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
    deviceId: zod_1.z.string().optional(),
    deviceName: zod_1.z.string().optional(),
    twoFactorCode: zod_1.z.string().optional(),
    twoFactorMethod: zod_1.z.enum(['totp', 'sms', 'email']).optional(),
});
/**
 * Zod schema for registration request validation
 */
exports.RegisterRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address').min(5).max(255),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters').max(128),
    name: zod_1.z.string().min(2).max(100).optional(),
    source: zod_1.z.nativeEnum(AuthSource),
    firstName: zod_1.z.string().min(2).max(50).optional(),
    lastName: zod_1.z.string().min(2).max(50).optional(),
    timezone: zod_1.z.string().optional(),
    termsAccepted: zod_1.z.boolean().refine((val) => val === true, 'Terms must be accepted'),
    privacyAccepted: zod_1.z.boolean().refine((val) => val === true, 'Privacy policy must be accepted'),
    marketingConsent: zod_1.z.boolean().optional(),
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
    deviceId: zod_1.z.string().optional(),
    deviceName: zod_1.z.string().optional(),
});
/**
 * Zod schema for password change request validation
 */
exports.PasswordChangeRequestSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z.string().min(8, 'New password must be at least 8 characters').max(128),
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
});
/**
 * Zod schema for password reset request validation
 */
exports.PasswordResetRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address').min(5).max(255),
    source: zod_1.z.nativeEnum(AuthSource),
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
});
/**
 * Zod schema for desktop authentication request validation
 */
exports.DesktopAuthRequestSchema = zod_1.z.object({
    webSessionToken: zod_1.z.string().min(1, 'Web session token is required'),
    deviceId: zod_1.z.string().min(1, 'Device ID is required'),
    deviceName: zod_1.z.string().min(1, 'Device name is required'),
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
    systemInfo: zod_1.z.object({
        platform: zod_1.z.string(),
        version: zod_1.z.string(),
        arch: zod_1.z.string(),
    }).optional(),
});
// =============================================================================
// UTILITY TYPES
// =============================================================================
/**
 * Create branded type helper
 */
function createBrandedId(id) {
    return id;
}
/**
 * Extract user ID from branded type
 */
function extractUserId(userId) {
    return userId;
}
/**
 * Extract session ID from branded type
 */
function extractSessionId(sessionId) {
    return sessionId;
}
/**
 * Extract token ID from branded type
 */
function extractTokenId(tokenId) {
    return tokenId;
}
/**
 * Type guard for authenticated user
 */
function isAuthenticatedUser(user) {
    return user && typeof user.id === 'string' && typeof user.email === 'string';
}
/**
 * Type guard for JWT payload
 */
function isJwtPayload(payload) {
    return payload && typeof payload.sub === 'string' && typeof payload.email === 'string';
}
/**
 * Type guard for auth session
 */
function isAuthSession(session) {
    return session && typeof session.id === 'string' && typeof session.userId === 'string';
}
// =============================================================================
// CONSTANTS
// =============================================================================
/**
 * Token expiration times in seconds
 */
exports.TOKEN_EXPIRATION = {
    ACCESS: 15 * 60, // 15 minutes
    REFRESH: 30 * 24 * 60 * 60, // 30 days
    DESKTOP_LONG_LIVED: 90 * 24 * 60 * 60, // 90 days
    VERIFICATION: 24 * 60 * 60, // 24 hours
    PASSWORD_RESET: 2 * 60 * 60, // 2 hours
};
/**
 * Rate limiting configuration
 */
exports.RATE_LIMITS = {
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
};
/**
 * Security configuration
 */
exports.SECURITY_CONFIG = {
    BCRYPT_ROUNDS: 12,
    JWT_ALGORITHM: 'RS256',
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    MAX_SESSIONS_PER_USER: 5,
    SUSPICIOUS_ACTIVITY_THRESHOLD: 3,
    DEVICE_TRUST_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days
};
// =============================================================================
// ERROR TYPES
// =============================================================================
/**
 * Authentication error codes
 */
var AuthErrorCode;
(function (AuthErrorCode) {
    AuthErrorCode["INVALID_CREDENTIALS"] = "INVALID_CREDENTIALS";
    AuthErrorCode["ACCOUNT_LOCKED"] = "ACCOUNT_LOCKED";
    AuthErrorCode["ACCOUNT_DISABLED"] = "ACCOUNT_DISABLED";
    AuthErrorCode["EMAIL_NOT_VERIFIED"] = "EMAIL_NOT_VERIFIED";
    AuthErrorCode["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    AuthErrorCode["TOKEN_INVALID"] = "TOKEN_INVALID";
    AuthErrorCode["TOKEN_REVOKED"] = "TOKEN_REVOKED";
    AuthErrorCode["SESSION_EXPIRED"] = "SESSION_EXPIRED";
    AuthErrorCode["SESSION_INVALID"] = "SESSION_INVALID";
    AuthErrorCode["TWO_FACTOR_REQUIRED"] = "TWO_FACTOR_REQUIRED";
    AuthErrorCode["TWO_FACTOR_INVALID"] = "TWO_FACTOR_INVALID";
    AuthErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    AuthErrorCode["SUSPICIOUS_ACTIVITY"] = "SUSPICIOUS_ACTIVITY";
    AuthErrorCode["DEVICE_NOT_TRUSTED"] = "DEVICE_NOT_TRUSTED";
    AuthErrorCode["PERMISSION_DENIED"] = "PERMISSION_DENIED";
    AuthErrorCode["INVALID_REQUEST"] = "INVALID_REQUEST";
    AuthErrorCode["NOT_FOUND"] = "NOT_FOUND";
    AuthErrorCode["CONFLICT"] = "CONFLICT";
    AuthErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
})(AuthErrorCode || (exports.AuthErrorCode = AuthErrorCode = {}));
/**
 * Authentication error class
 */
class AuthError extends Error {
    constructor(message, code, statusCode = 401, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AuthError';
        // Maintain proper stack trace
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, AuthError);
        }
    }
}
exports.AuthError = AuthError;
/**
 * Helper function to create authentication errors
 */
function createAuthError(code, message, statusCode, details) {
    const defaultMessages = {
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
    return new AuthError(message || defaultMessages[code], code, statusCode || 401, details);
}
//# sourceMappingURL=auth.js.map