"use strict";
/**
 * @fileoverview Validation utilities for JobSwipe
 * @description Common validation functions and helpers
 * @version 1.0.0
 * @author JobSwipe Team
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.nonNegativeIntegerSchema = exports.positiveIntegerSchema = exports.nonNegativeNumberSchema = exports.positiveNumberSchema = exports.isoDateStringSchema = exports.dateStringSchema = exports.dateSchema = exports.usernameSchema = exports.nameSchema = exports.slugSchema = exports.urlSchema = exports.phoneSchema = exports.strongPasswordSchema = exports.passwordSchema = exports.emailSchema = exports.uuidSchema = void 0;
exports.validateData = validateData;
exports.safeValidateData = safeValidateData;
exports.isValidEmail = isValidEmail;
exports.isValidUUID = isValidUUID;
exports.isValidURL = isValidURL;
exports.isValidPhone = isValidPhone;
exports.isValidSlug = isValidSlug;
exports.isStrongPassword = isStrongPassword;
exports.getPasswordStrength = getPasswordStrength;
exports.sanitizeInput = sanitizeInput;
exports.normalizeEmail = normalizeEmail;
exports.normalizePhone = normalizePhone;
exports.createSlug = createSlug;
exports.validateAndNormalizeSlug = validateAndNormalizeSlug;
exports.isEmpty = isEmpty;
exports.isNotEmpty = isNotEmpty;
exports.validateRequiredFields = validateRequiredFields;
exports.validateFieldLengths = validateFieldLengths;
exports.validateEmailFormat = validateEmailFormat;
exports.validatePasswordStrength = validatePasswordStrength;
exports.validateDateRange = validateDateRange;
exports.validatePagination = validatePagination;
const zod_1 = require("zod");
const errors_1 = require("./errors");
// =============================================================================
// VALIDATION HELPERS
// =============================================================================
/**
 * Validate data against a Zod schema
 */
function validateData(schema, data) {
    try {
        return schema.parse(data);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const validationErrors = error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code,
                value: err.code === 'invalid_type' ? err.received : undefined,
            }));
            throw new errors_1.ValidationError('Validation failed', validationErrors);
        }
        throw error;
    }
}
/**
 * Safely validate data against a Zod schema
 */
function safeValidateData(schema, data) {
    try {
        const result = schema.safeParse(data);
        if (result.success) {
            return { success: true, data: result.data };
        }
        const validationErrors = result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
            value: err.code === 'invalid_type' ? err.received : undefined,
        }));
        return {
            success: false,
            error: new errors_1.ValidationError('Validation failed', validationErrors),
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof errors_1.ValidationError ? error : new errors_1.ValidationError('Validation failed'),
        };
    }
}
// =============================================================================
// COMMON VALIDATION SCHEMAS
// =============================================================================
/**
 * UUID validation schema
 */
exports.uuidSchema = zod_1.z.string().uuid();
/**
 * Email validation schema
 */
exports.emailSchema = zod_1.z.string().email().min(5).max(255);
/**
 * Password validation schema
 */
exports.passwordSchema = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');
/**
 * Strong password validation schema
 */
exports.strongPasswordSchema = zod_1.z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character');
/**
 * Phone number validation schema
 */
exports.phoneSchema = zod_1.z
    .string()
    .regex(/^\+?[\d\s\-\(\)\.]+$/, 'Invalid phone number format')
    .min(10)
    .max(20);
/**
 * URL validation schema
 */
exports.urlSchema = zod_1.z.string().url();
/**
 * Slug validation schema
 */
exports.slugSchema = zod_1.z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .min(1)
    .max(100);
/**
 * Name validation schema
 */
exports.nameSchema = zod_1.z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods');
/**
 * Username validation schema
 */
exports.usernameSchema = zod_1.z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens');
/**
 * Date validation schema
 */
exports.dateSchema = zod_1.z.date();
/**
 * Date string validation schema
 */
exports.dateStringSchema = zod_1.z.string().datetime();
/**
 * ISO date string validation schema
 */
exports.isoDateStringSchema = zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/);
/**
 * Positive number validation schema
 */
exports.positiveNumberSchema = zod_1.z.number().positive();
/**
 * Non-negative number validation schema
 */
exports.nonNegativeNumberSchema = zod_1.z.number().nonnegative();
/**
 * Positive integer validation schema
 */
exports.positiveIntegerSchema = zod_1.z.number().int().positive();
/**
 * Non-negative integer validation schema
 */
exports.nonNegativeIntegerSchema = zod_1.z.number().int().nonnegative();
// =============================================================================
// VALIDATION UTILITIES
// =============================================================================
/**
 * Check if a string is a valid email
 */
function isValidEmail(email) {
    return exports.emailSchema.safeParse(email).success;
}
/**
 * Check if a string is a valid UUID
 */
function isValidUUID(uuid) {
    return exports.uuidSchema.safeParse(uuid).success;
}
/**
 * Check if a string is a valid URL
 */
function isValidURL(url) {
    return exports.urlSchema.safeParse(url).success;
}
/**
 * Check if a string is a valid phone number
 */
function isValidPhone(phone) {
    return exports.phoneSchema.safeParse(phone).success;
}
/**
 * Check if a string is a valid slug
 */
function isValidSlug(slug) {
    return exports.slugSchema.safeParse(slug).success;
}
/**
 * Check if a password meets strength requirements
 */
function isStrongPassword(password) {
    return exports.strongPasswordSchema.safeParse(password).success;
}
/**
 * Get password strength score (0-100)
 */
function getPasswordStrength(password) {
    let score = 0;
    // Length
    if (password.length >= 8)
        score += 20;
    if (password.length >= 12)
        score += 10;
    if (password.length >= 16)
        score += 10;
    // Character types
    if (/[a-z]/.test(password))
        score += 10;
    if (/[A-Z]/.test(password))
        score += 10;
    if (/\d/.test(password))
        score += 10;
    if (/[@$!%*?&]/.test(password))
        score += 10;
    // Complexity
    if (/[a-z].*[A-Z]|[A-Z].*[a-z]/.test(password))
        score += 5;
    if (/\d.*[a-zA-Z]|[a-zA-Z].*\d/.test(password))
        score += 5;
    if (/[@$!%*?&].*[a-zA-Z0-9]|[a-zA-Z0-9].*[@$!%*?&]/.test(password))
        score += 5;
    // Penalty for common patterns
    if (/(.)\1{2,}/.test(password))
        score -= 10; // Repeated characters
    if (/123|abc|qwe|asd|zxc/i.test(password))
        score -= 10; // Common sequences
    return Math.max(0, Math.min(100, score));
}
/**
 * Sanitize input string
 */
function sanitizeInput(input) {
    return input
        .trim()
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/[<>]/g, ''); // Remove potential HTML tags
}
/**
 * Normalize email address
 */
function normalizeEmail(email) {
    return email.toLowerCase().trim();
}
/**
 * Normalize phone number
 */
function normalizePhone(phone) {
    return phone.replace(/[^\d+]/g, '');
}
/**
 * Create a slug from a string
 */
function createSlug(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}
/**
 * Validate and normalize a slug
 */
function validateAndNormalizeSlug(slug) {
    const normalized = createSlug(slug);
    if (!isValidSlug(normalized)) {
        throw new errors_1.ValidationError('Invalid slug format');
    }
    return normalized;
}
/**
 * Check if a value is empty
 */
function isEmpty(value) {
    if (value === null || value === undefined)
        return true;
    if (typeof value === 'string')
        return value.trim() === '';
    if (Array.isArray(value))
        return value.length === 0;
    if (typeof value === 'object')
        return Object.keys(value).length === 0;
    return false;
}
/**
 * Check if a value is not empty
 */
function isNotEmpty(value) {
    return !isEmpty(value);
}
/**
 * Validate required fields
 */
function validateRequiredFields(data, requiredFields) {
    const missingFields = requiredFields.filter(field => isEmpty(data[field]));
    if (missingFields.length > 0) {
        const errors = missingFields.map(field => ({
            field,
            message: `${field} is required`,
            code: 'required',
        }));
        throw new errors_1.ValidationError('Missing required fields', errors);
    }
}
/**
 * Validate field lengths
 */
function validateFieldLengths(data, fieldLengths) {
    const errors = [];
    Object.entries(fieldLengths).forEach(([field, { min, max }]) => {
        const value = data[field];
        if (value && typeof value === 'string') {
            if (min && value.length < min) {
                errors.push({
                    field,
                    message: `${field} must be at least ${min} characters`,
                    code: 'min_length',
                    value: value.length,
                });
            }
            if (max && value.length > max) {
                errors.push({
                    field,
                    message: `${field} must be at most ${max} characters`,
                    code: 'max_length',
                    value: value.length,
                });
            }
        }
    });
    if (errors.length > 0) {
        throw new errors_1.ValidationError('Field length validation failed', errors);
    }
}
/**
 * Validate email format
 */
function validateEmailFormat(email) {
    if (!isValidEmail(email)) {
        throw new errors_1.ValidationError('Invalid email format', [
            {
                field: 'email',
                message: 'Please enter a valid email address',
                code: 'invalid_format',
                value: email,
            },
        ]);
    }
}
/**
 * Validate password strength
 */
function validatePasswordStrength(password, minStrength = 60) {
    const strength = getPasswordStrength(password);
    if (strength < minStrength) {
        throw new errors_1.ValidationError('Password is too weak', [
            {
                field: 'password',
                message: `Password strength is ${strength}%, minimum required is ${minStrength}%`,
                code: 'weak_password',
                value: strength,
            },
        ]);
    }
}
/**
 * Validate date range
 */
function validateDateRange(from, to) {
    if (from >= to) {
        throw new errors_1.ValidationError('Invalid date range', [
            {
                field: 'dateRange',
                message: 'Start date must be before end date',
                code: 'invalid_range',
            },
        ]);
    }
}
/**
 * Validate pagination parameters
 */
function validatePagination(page, limit) {
    if (page < 1) {
        throw new errors_1.ValidationError('Invalid pagination', [
            {
                field: 'page',
                message: 'Page must be greater than 0',
                code: 'min_value',
                value: page,
            },
        ]);
    }
    if (limit < 1 || limit > 100) {
        throw new errors_1.ValidationError('Invalid pagination', [
            {
                field: 'limit',
                message: 'Limit must be between 1 and 100',
                code: 'out_of_range',
                value: limit,
            },
        ]);
    }
}
//# sourceMappingURL=validation.js.map