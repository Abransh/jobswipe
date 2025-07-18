/**
 * @fileoverview Validation utilities for JobSwipe
 * @description Common validation functions and helpers
 * @version 1.0.0
 * @author JobSwipe Team
 */
import { z } from 'zod';
import { ValidationError } from './errors';
/**
 * Validate data against a Zod schema
 */
export declare function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T;
/**
 * Safely validate data against a Zod schema
 */
export declare function safeValidateData<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: true;
    data: T;
} | {
    success: false;
    error: ValidationError;
};
/**
 * UUID validation schema
 */
export declare const uuidSchema: z.ZodString;
/**
 * Email validation schema
 */
export declare const emailSchema: z.ZodString;
/**
 * Password validation schema
 */
export declare const passwordSchema: z.ZodString;
/**
 * Strong password validation schema
 */
export declare const strongPasswordSchema: z.ZodString;
/**
 * Phone number validation schema
 */
export declare const phoneSchema: z.ZodString;
/**
 * URL validation schema
 */
export declare const urlSchema: z.ZodString;
/**
 * Slug validation schema
 */
export declare const slugSchema: z.ZodString;
/**
 * Name validation schema
 */
export declare const nameSchema: z.ZodString;
/**
 * Username validation schema
 */
export declare const usernameSchema: z.ZodString;
/**
 * Date validation schema
 */
export declare const dateSchema: z.ZodDate;
/**
 * Date string validation schema
 */
export declare const dateStringSchema: z.ZodString;
/**
 * ISO date string validation schema
 */
export declare const isoDateStringSchema: z.ZodString;
/**
 * Positive number validation schema
 */
export declare const positiveNumberSchema: z.ZodNumber;
/**
 * Non-negative number validation schema
 */
export declare const nonNegativeNumberSchema: z.ZodNumber;
/**
 * Positive integer validation schema
 */
export declare const positiveIntegerSchema: z.ZodNumber;
/**
 * Non-negative integer validation schema
 */
export declare const nonNegativeIntegerSchema: z.ZodNumber;
/**
 * Check if a string is a valid email
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Check if a string is a valid UUID
 */
export declare function isValidUUID(uuid: string): boolean;
/**
 * Check if a string is a valid URL
 */
export declare function isValidURL(url: string): boolean;
/**
 * Check if a string is a valid phone number
 */
export declare function isValidPhone(phone: string): boolean;
/**
 * Check if a string is a valid slug
 */
export declare function isValidSlug(slug: string): boolean;
/**
 * Check if a password meets strength requirements
 */
export declare function isStrongPassword(password: string): boolean;
/**
 * Get password strength score (0-100)
 */
export declare function getPasswordStrength(password: string): number;
/**
 * Sanitize input string
 */
export declare function sanitizeInput(input: string): string;
/**
 * Normalize email address
 */
export declare function normalizeEmail(email: string): string;
/**
 * Normalize phone number
 */
export declare function normalizePhone(phone: string): string;
/**
 * Create a slug from a string
 */
export declare function createSlug(text: string): string;
/**
 * Validate and normalize a slug
 */
export declare function validateAndNormalizeSlug(slug: string): string;
/**
 * Check if a value is empty
 */
export declare function isEmpty(value: any): boolean;
/**
 * Check if a value is not empty
 */
export declare function isNotEmpty(value: any): boolean;
/**
 * Validate required fields
 */
export declare function validateRequiredFields(data: Record<string, any>, requiredFields: string[]): void;
/**
 * Validate field lengths
 */
export declare function validateFieldLengths(data: Record<string, any>, fieldLengths: Record<string, {
    min?: number;
    max?: number;
}>): void;
/**
 * Validate email format
 */
export declare function validateEmailFormat(email: string): void;
/**
 * Validate password strength
 */
export declare function validatePasswordStrength(password: string, minStrength?: number): void;
/**
 * Validate date range
 */
export declare function validateDateRange(from: Date, to: Date): void;
/**
 * Validate pagination parameters
 */
export declare function validatePagination(page: number, limit: number): void;
//# sourceMappingURL=validation.d.ts.map