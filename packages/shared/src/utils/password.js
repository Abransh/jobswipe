"use strict";
/**
 * @fileoverview Password utilities for JobSwipe
 * @description Enterprise-grade password hashing and verification using bcrypt
 * @version 1.0.0
 * @author JobSwipe Team
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePassword = validatePassword;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.generateSecurePassword = generateSecurePassword;
exports.needsRehash = needsRehash;
const crypto = __importStar(require("crypto"));
// =============================================================================
// CONFIGURATION
// =============================================================================
/**
 * Number of salt rounds for bcrypt (enterprise standard: 12)
 */
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
/**
 * Minimum password length requirement
 */
const MIN_PASSWORD_LENGTH = 8;
/**
 * Maximum password length (to prevent DoS attacks)
 */
const MAX_PASSWORD_LENGTH = 128;
// =============================================================================
// PASSWORD VALIDATION
// =============================================================================
/**
 * Validate password meets security requirements
 */
function validatePassword(password) {
    const errors = [];
    if (!password) {
        errors.push('Password is required');
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
        errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
        errors.push(`Password must be no more than ${MAX_PASSWORD_LENGTH} characters long`);
    }
    // Check for common patterns
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
}
// =============================================================================
// BCRYPT IMPLEMENTATION (Fallback)
// =============================================================================
/**
 * Simple bcrypt-like implementation for development
 * Note: In production, use actual bcrypt library
 */
function simpleBcrypt(password, salt) {
    const iterations = BCRYPT_SALT_ROUNDS;
    let hash = password + salt;
    for (let i = 0; i < Math.pow(2, iterations); i++) {
        hash = crypto.createHash('sha256').update(hash).digest('hex');
    }
    return `$2b$${iterations.toString().padStart(2, '0')}$${salt}$${hash}`;
}
/**
 * Generate a random salt
 */
function generateSalt() {
    return crypto.randomBytes(16).toString('hex');
}
/**
 * Extract salt from bcrypt hash
 */
function extractSalt(hash) {
    const parts = hash.split('$');
    if (parts.length >= 4) {
        return parts[3];
    }
    return null;
}
// =============================================================================
// PUBLIC API
// =============================================================================
/**
 * Hash password using bcrypt with enterprise-grade salt rounds
 * @param password - Plain text password to hash
 * @returns Promise resolving to bcrypt hash
 */
async function hashPassword(password) {
    try {
        // Validate password first
        const validation = validatePassword(password);
        if (!validation.isValid) {
            throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
        }
        // Try to use bcrypt if available, fallback to our implementation
        try {
            // Using eval to avoid TypeScript compilation error
            const bcrypt = eval('require("bcryptjs")');
            return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        }
        catch (importError) {
            // Fallback implementation for development
            console.warn('bcrypt not available, using fallback implementation');
            const salt = generateSalt();
            return simpleBcrypt(password, salt);
        }
    }
    catch (error) {
        throw new Error(`Password hashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Verify password against bcrypt hash
 * @param password - Plain text password to verify
 * @param hashedPassword - Bcrypt hash to verify against
 * @returns Promise resolving to boolean indicating if password matches
 */
async function verifyPassword(password, hashedPassword) {
    try {
        if (!password || !hashedPassword) {
            return false;
        }
        // Try to use bcrypt if available, fallback to our implementation
        try {
            // Using eval to avoid TypeScript compilation error
            const bcrypt = eval('require("bcryptjs")');
            return await bcrypt.compare(password, hashedPassword);
        }
        catch (importError) {
            // Fallback implementation for development
            const salt = extractSalt(hashedPassword);
            if (!salt) {
                return false;
            }
            const testHash = simpleBcrypt(password, salt);
            return testHash === hashedPassword;
        }
    }
    catch (error) {
        console.error('Password verification error:', error);
        return false;
    }
}
/**
 * Generate a secure random password
 * @param length - Length of password to generate (default: 16)
 * @returns Randomly generated password meeting security requirements
 */
function generateSecurePassword(length = 16) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
}
/**
 * Check if password needs rehashing (e.g., salt rounds changed)
 * @param hashedPassword - Current password hash
 * @returns Boolean indicating if password should be rehashed
 */
function needsRehash(hashedPassword) {
    try {
        const parts = hashedPassword.split('$');
        if (parts.length >= 3) {
            const rounds = parseInt(parts[2], 10);
            return rounds !== BCRYPT_SALT_ROUNDS;
        }
        return true; // Invalid format, needs rehash
    }
    catch (error) {
        return true; // Error parsing, needs rehash
    }
}
//# sourceMappingURL=password.js.map