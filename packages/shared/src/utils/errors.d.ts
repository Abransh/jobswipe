/**
 * @fileoverview Error handling utilities for JobSwipe
 * @description Common error classes and utilities for consistent error handling
 * @version 1.0.0
 * @author JobSwipe Team
 */
import { ApiError, HttpStatus } from '../types/api';
/**
 * Base application error class
 */
export declare abstract class BaseError extends Error {
    readonly details?: Record<string, any> | undefined;
    readonly cause?: Error | undefined;
    abstract readonly name: string;
    abstract readonly statusCode: HttpStatus;
    abstract readonly code: string;
    constructor(message: string, details?: Record<string, any> | undefined, cause?: Error | undefined);
    /**
     * Convert error to JSON representation
     */
    toJSON(): {
        stack?: string | undefined;
        details?: Record<string, any> | undefined;
        name: string;
        message: string;
        code: string;
        statusCode: HttpStatus;
    };
}
/**
 * Application-specific error class
 */
export declare class ApplicationError extends BaseError {
    readonly name = "ApplicationError";
    readonly statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    readonly code = "APPLICATION_ERROR";
}
/**
 * Validation error class
 */
export declare class ValidationError extends BaseError {
    readonly errors: Array<{
        field: string;
        message: string;
        code: string;
        value?: any;
    }>;
    readonly name = "ValidationError";
    readonly statusCode = HttpStatus.BAD_REQUEST;
    readonly code = "VALIDATION_ERROR";
    constructor(message: string, errors?: Array<{
        field: string;
        message: string;
        code: string;
        value?: any;
    }>, details?: Record<string, any>);
}
/**
 * Authentication error class
 */
export declare class AuthenticationError extends BaseError {
    readonly name = "AuthenticationError";
    readonly statusCode = HttpStatus.UNAUTHORIZED;
    readonly code = "AUTHENTICATION_ERROR";
}
/**
 * Authorization error class
 */
export declare class AuthorizationError extends BaseError {
    readonly name = "AuthorizationError";
    readonly statusCode = HttpStatus.FORBIDDEN;
    readonly code = "AUTHORIZATION_ERROR";
}
/**
 * Not found error class
 */
export declare class NotFoundError extends BaseError {
    readonly name = "NotFoundError";
    readonly statusCode = HttpStatus.NOT_FOUND;
    readonly code = "NOT_FOUND";
}
/**
 * Conflict error class
 */
export declare class ConflictError extends BaseError {
    readonly name = "ConflictError";
    readonly statusCode = HttpStatus.CONFLICT;
    readonly code = "CONFLICT";
}
/**
 * Rate limit error class
 */
export declare class RateLimitError extends BaseError {
    readonly limit: number;
    readonly remaining: number;
    readonly reset: Date;
    readonly retryAfter?: number | undefined;
    readonly name = "RateLimitError";
    readonly statusCode = HttpStatus.TOO_MANY_REQUESTS;
    readonly code = "RATE_LIMIT_EXCEEDED";
    constructor(message: string, limit: number, remaining: number, reset: Date, retryAfter?: number | undefined);
}
/**
 * External service error class
 */
export declare class ExternalServiceError extends BaseError {
    readonly service: string;
    readonly originalError?: Error | undefined;
    readonly name = "ExternalServiceError";
    readonly statusCode = HttpStatus.BAD_GATEWAY;
    readonly code = "EXTERNAL_SERVICE_ERROR";
    constructor(message: string, service: string, originalError?: Error | undefined, details?: Record<string, any>);
}
/**
 * Database error class
 */
export declare class DatabaseError extends BaseError {
    readonly name = "DatabaseError";
    readonly statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    readonly code = "DATABASE_ERROR";
}
/**
 * Network error class
 */
export declare class NetworkError extends BaseError {
    readonly name = "NetworkError";
    readonly statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    readonly code = "NETWORK_ERROR";
}
/**
 * File error class
 */
export declare class FileError extends BaseError {
    readonly name = "FileError";
    readonly statusCode = HttpStatus.BAD_REQUEST;
    readonly code = "FILE_ERROR";
}
/**
 * Create a validation error
 */
export declare function createValidationError(message: string, errors?: Array<{
    field: string;
    message: string;
    code: string;
    value?: any;
}>): ValidationError;
/**
 * Create an authentication error
 */
export declare function createAuthenticationError(message?: string, details?: Record<string, any>): AuthenticationError;
/**
 * Create an authorization error
 */
export declare function createAuthorizationError(message?: string, details?: Record<string, any>): AuthorizationError;
/**
 * Create a not found error
 */
export declare function createNotFoundError(resource: string, id?: string): NotFoundError;
/**
 * Create a conflict error
 */
export declare function createConflictError(message: string, details?: Record<string, any>): ConflictError;
/**
 * Create a rate limit error
 */
export declare function createRateLimitError(limit: number, remaining: number, reset: Date, retryAfter?: number): RateLimitError;
/**
 * Create an external service error
 */
export declare function createExternalServiceError(service: string, message: string, originalError?: Error, details?: Record<string, any>): ExternalServiceError;
/**
 * Create a database error
 */
export declare function createDatabaseError(message: string, details?: Record<string, any>, cause?: Error): DatabaseError;
/**
 * Check if error is an instance of BaseError
 */
export declare function isBaseError(error: any): error is BaseError;
/**
 * Check if error is a validation error
 */
export declare function isValidationError(error: any): error is ValidationError;
/**
 * Check if error is an authentication error
 */
export declare function isAuthenticationError(error: any): error is AuthenticationError;
/**
 * Check if error is an authorization error
 */
export declare function isAuthorizationError(error: any): error is AuthorizationError;
/**
 * Check if error is a not found error
 */
export declare function isNotFoundError(error: any): error is NotFoundError;
/**
 * Check if error is a conflict error
 */
export declare function isConflictError(error: any): error is ConflictError;
/**
 * Check if error is a rate limit error
 */
export declare function isRateLimitError(error: any): error is RateLimitError;
/**
 * Check if error is an external service error
 */
export declare function isExternalServiceError(error: any): error is ExternalServiceError;
/**
 * Check if error is a database error
 */
export declare function isDatabaseError(error: any): error is DatabaseError;
/**
 * Extract error message from any error type
 */
export declare function getErrorMessage(error: any): string;
/**
 * Extract error code from any error type
 */
export declare function getErrorCode(error: any): string;
/**
 * Extract HTTP status code from any error type
 */
export declare function getStatusCode(error: any): HttpStatus;
/**
 * Convert any error to a standardized error object
 */
export declare function normalizeError(error: any): {
    name: string;
    message: string;
    code: string;
    statusCode: HttpStatus;
    details?: Record<string, any>;
    stack?: string;
};
/**
 * Convert BaseError to ApiError
 */
export declare function toApiError(error: BaseError): ApiError;
/**
 * Create error with stack trace
 */
export declare function createErrorWithStack(message: string, name?: string, code?: string): Error & {
    code: string;
};
/**
 * Wrap function to catch and normalize errors
 */
export declare function wrapWithErrorHandling<T extends any[], R>(fn: (...args: T) => R, errorTransformer?: (error: any) => BaseError): (...args: T) => R;
/**
 * Wrap async function to catch and normalize errors
 */
export declare function wrapAsyncWithErrorHandling<T extends any[], R>(fn: (...args: T) => Promise<R>, errorTransformer?: (error: any) => BaseError): (...args: T) => Promise<R>;
//# sourceMappingURL=errors.d.ts.map