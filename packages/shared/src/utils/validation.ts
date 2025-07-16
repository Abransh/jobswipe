/**
 * @fileoverview Validation utilities for JobSwipe
 * @description Common validation functions and helpers
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { z, ZodError } from 'zod';
import { ValidationError } from './errors';

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate data against a Zod schema
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
        value: err.code === 'invalid_type' ? err.received : undefined,
      }));
      
      throw new ValidationError('Validation failed', validationErrors);
    }
    
    throw error;
  }
}

/**
 * Safely validate data against a Zod schema
 */
export function safeValidateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: ValidationError } {
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
      error: new ValidationError('Validation failed', validationErrors),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ValidationError ? error : new ValidationError('Validation failed'),
    };
  }
}

// =============================================================================
// COMMON VALIDATION SCHEMAS
// =============================================================================

/**
 * UUID validation schema
 */
export const uuidSchema = z.string().uuid();

/**
 * Email validation schema
 */
export const emailSchema = z.string().email().min(5).max(255);

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');

/**
 * Strong password validation schema
 */
export const strongPasswordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character');

/**
 * Phone number validation schema
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)\.]+$/, 'Invalid phone number format')
  .min(10)
  .max(20);

/**
 * URL validation schema
 */
export const urlSchema = z.string().url();

/**
 * Slug validation schema
 */
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
  .min(1)
  .max(100);

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be at most 100 characters')
  .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods');

/**
 * Username validation schema
 */
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens');

/**
 * Date validation schema
 */
export const dateSchema = z.date();

/**
 * Date string validation schema
 */
export const dateStringSchema = z.string().datetime();

/**
 * ISO date string validation schema
 */
export const isoDateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/);

/**
 * Positive number validation schema
 */
export const positiveNumberSchema = z.number().positive();

/**
 * Non-negative number validation schema
 */
export const nonNegativeNumberSchema = z.number().nonnegative();

/**
 * Positive integer validation schema
 */
export const positiveIntegerSchema = z.number().int().positive();

/**
 * Non-negative integer validation schema
 */
export const nonNegativeIntegerSchema = z.number().int().nonnegative();

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Check if a string is a valid email
 */
export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

/**
 * Check if a string is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  return uuidSchema.safeParse(uuid).success;
}

/**
 * Check if a string is a valid URL
 */
export function isValidURL(url: string): boolean {
  return urlSchema.safeParse(url).success;
}

/**
 * Check if a string is a valid phone number
 */
export function isValidPhone(phone: string): boolean {
  return phoneSchema.safeParse(phone).success;
}

/**
 * Check if a string is a valid slug
 */
export function isValidSlug(slug: string): boolean {
  return slugSchema.safeParse(slug).success;
}

/**
 * Check if a password meets strength requirements
 */
export function isStrongPassword(password: string): boolean {
  return strongPasswordSchema.safeParse(password).success;
}

/**
 * Get password strength score (0-100)
 */
export function getPasswordStrength(password: string): number {
  let score = 0;
  
  // Length
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  // Character types
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 10;
  if (/[@$!%*?&]/.test(password)) score += 10;
  
  // Complexity
  if (/[a-z].*[A-Z]|[A-Z].*[a-z]/.test(password)) score += 5;
  if (/\d.*[a-zA-Z]|[a-zA-Z].*\d/.test(password)) score += 5;
  if (/[@$!%*?&].*[a-zA-Z0-9]|[a-zA-Z0-9].*[@$!%*?&]/.test(password)) score += 5;
  
  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
  if (/123|abc|qwe|asd|zxc/i.test(password)) score -= 10; // Common sequences
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Sanitize input string
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[<>]/g, ''); // Remove potential HTML tags
}

/**
 * Normalize email address
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Normalize phone number
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Create a slug from a string
 */
export function createSlug(text: string): string {
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
export function validateAndNormalizeSlug(slug: string): string {
  const normalized = createSlug(slug);
  
  if (!isValidSlug(normalized)) {
    throw new ValidationError('Invalid slug format');
  }
  
  return normalized;
}

/**
 * Check if a value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Check if a value is not empty
 */
export function isNotEmpty(value: any): boolean {
  return !isEmpty(value);
}

/**
 * Validate required fields
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter(field => isEmpty(data[field]));
  
  if (missingFields.length > 0) {
    const errors = missingFields.map(field => ({
      field,
      message: `${field} is required`,
      code: 'required',
    }));
    
    throw new ValidationError('Missing required fields', errors);
  }
}

/**
 * Validate field lengths
 */
export function validateFieldLengths(
  data: Record<string, any>,
  fieldLengths: Record<string, { min?: number; max?: number }>
): void {
  const errors: Array<{
    field: string;
    message: string;
    code: string;
    value?: any;
  }> = [];
  
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
    throw new ValidationError('Field length validation failed', errors);
  }
}

/**
 * Validate email format
 */
export function validateEmailFormat(email: string): void {
  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email format', [
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
export function validatePasswordStrength(password: string, minStrength: number = 60): void {
  const strength = getPasswordStrength(password);
  
  if (strength < minStrength) {
    throw new ValidationError('Password is too weak', [
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
export function validateDateRange(from: Date, to: Date): void {
  if (from >= to) {
    throw new ValidationError('Invalid date range', [
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
export function validatePagination(page: number, limit: number): void {
  if (page < 1) {
    throw new ValidationError('Invalid pagination', [
      {
        field: 'page',
        message: 'Page must be greater than 0',
        code: 'min_value',
        value: page,
      },
    ]);
  }
  
  if (limit < 1 || limit > 100) {
    throw new ValidationError('Invalid pagination', [
      {
        field: 'limit',
        message: 'Limit must be between 1 and 100',
        code: 'out_of_range',
        value: limit,
      },
    ]);
  }
}