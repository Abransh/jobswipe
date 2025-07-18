/**
 * @fileoverview Password utilities for JobSwipe
 * @description Enterprise-grade password hashing and verification using bcrypt
 * @version 1.0.0
 * @author JobSwipe Team
 */
/**
 * Validate password meets security requirements
 */
export declare function validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
};
/**
 * Hash password using bcrypt with enterprise-grade salt rounds
 * @param password - Plain text password to hash
 * @returns Promise resolving to bcrypt hash
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Verify password against bcrypt hash
 * @param password - Plain text password to verify
 * @param hashedPassword - Bcrypt hash to verify against
 * @returns Promise resolving to boolean indicating if password matches
 */
export declare function verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
/**
 * Generate a secure random password
 * @param length - Length of password to generate (default: 16)
 * @returns Randomly generated password meeting security requirements
 */
export declare function generateSecurePassword(length?: number): string;
/**
 * Check if password needs rehashing (e.g., salt rounds changed)
 * @param hashedPassword - Current password hash
 * @returns Boolean indicating if password should be rehashed
 */
export declare function needsRehash(hashedPassword: string): boolean;
//# sourceMappingURL=password.d.ts.map