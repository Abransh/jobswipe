/**
 * @fileoverview Security utilities for JobSwipe
 * @description Common security functions and helpers
 * @version 1.0.0
 * @author JobSwipe Team
 */
/**
 * Generate a cryptographically secure random string
 */
export declare function generateSecureRandomString(length?: number): string;
/**
 * Generate a cryptographically secure random token
 */
export declare function generateSecureToken(length?: number): string;
/**
 * Generate a UUID v4
 */
export declare function generateUUID(): string;
/**
 * Generate a secure random number
 */
export declare function generateSecureRandomNumber(min?: number, max?: number): number;
/**
 * Create secure hash from string
 */
export declare function createSecureHash(data: string, algorithm?: string): string;
/**
 * Hash a password using bcrypt (async)
 */
export declare function hashPassword(password: string, saltRounds?: number): Promise<string>;
/**
 * Verify a password against a hash
 */
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
/**
 * Create HMAC signature
 */
export declare function createHmacSignature(data: string, secret: string, algorithm?: string): string;
/**
 * Verify HMAC signature
 */
export declare function verifyHmacSignature(data: string, signature: string, secret: string, algorithm?: string): boolean;
/**
 * Encrypt data using AES-256-GCM
 */
export declare function encryptData(data: string, key: string): {
    encrypted: string;
    iv: string;
    tag: string;
};
/**
 * Decrypt data using AES-256-GCM
 */
export declare function decryptData(encrypted: string, key: string, iv: string, tag: string): string;
/**
 * Sanitize HTML content
 */
export declare function sanitizeHtml(html: string): string;
/**
 * Sanitize SQL input (basic protection)
 */
export declare function sanitizeSql(input: string): string;
/**
 * Sanitize file name
 */
export declare function sanitizeFileName(fileName: string): string;
/**
 * Sanitize URL
 */
export declare function sanitizeUrl(url: string): string;
/**
 * Extract IP address from request headers
 */
export declare function extractIpFromHeaders(headers: Record<string, string | string[] | undefined>): string;
/**
 * Check if IP address is valid
 */
export declare function isValidIpAddress(ip: string): boolean;
/**
 * Check if IP address is private
 */
export declare function isPrivateIpAddress(ip: string): boolean;
/**
 * Check if user agent is suspicious
 */
export declare function isSuspiciousUserAgent(userAgent: string): boolean;
/**
 * Check if email domain is suspicious
 */
export declare function isSuspiciousEmailDomain(email: string): boolean;
/**
 * Check if request is from a suspicious source
 */
export declare function isSuspiciousRequest(ipAddress: string, userAgent: string, referer?: string): boolean;
/**
 * Generate rate limit key
 */
export declare function generateRateLimitKey(prefix: string, identifier: string): string;
/**
 * Calculate rate limit reset time
 */
export declare function calculateRateLimitReset(windowMs: number): Date;
/**
 * Check if rate limit is exceeded
 */
export declare function isRateLimitExceeded(current: number, limit: number, windowStart: Date, windowMs: number): boolean;
/**
 * Generate session ID
 */
export declare function generateSessionId(): string;
/**
 * Generate CSRF token
 */
export declare function generateCsrfToken(): string;
/**
 * Validate session timeout
 */
export declare function isSessionExpired(lastActivity: Date, timeoutMs: number): boolean;
/**
 * Generate device fingerprint
 */
export declare function generateDeviceFingerprint(userAgent: string, ipAddress: string, acceptLanguage?: string, timezone?: string): string;
/**
 * Validate device fingerprint
 */
export declare function validateDeviceFingerprint(currentFingerprint: string, storedFingerprint: string, tolerance?: number): boolean;
/**
 * Generate security headers
 */
export declare function generateSecurityHeaders(nonce?: string): Record<string, string>;
/**
 * Generate CSP nonce
 */
export declare function generateCspNonce(): string;
/**
 * Generate encryption key pair
 */
export declare function generateKeyPair(): {
    privateKey: string;
    publicKey: string;
};
/**
 * Rotate encryption key
 */
export declare function rotateEncryptionKey(_oldKey: string): string;
/**
 * Derive key from password
 */
export declare function deriveKeyFromPassword(password: string, salt: string, iterations?: number): string;
/**
 * Generate audit log entry
 */
export declare function generateAuditLogEntry(action: string, resource: string, userId?: string, details?: Record<string, any>): {
    id: string;
    action: string;
    resource: string;
    userId?: string;
    details?: Record<string, any>;
    timestamp: Date;
    hash: string;
};
/**
 * Verify audit log entry integrity
 */
export declare function verifyAuditLogEntry(entry: {
    id: string;
    action: string;
    resource: string;
    userId?: string;
    details?: Record<string, any>;
    timestamp: Date;
    hash: string;
}): boolean;
//# sourceMappingURL=security.d.ts.map