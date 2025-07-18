"use strict";
/**
 * @fileoverview Error handling utilities for JobSwipe
 * @description Common error classes and utilities for consistent error handling
 * @version 1.0.0
 * @author JobSwipe Team
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileError = exports.NetworkError = exports.DatabaseError = exports.ExternalServiceError = exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.ApplicationError = exports.BaseError = void 0;
exports.createValidationError = createValidationError;
exports.createAuthenticationError = createAuthenticationError;
exports.createAuthorizationError = createAuthorizationError;
exports.createNotFoundError = createNotFoundError;
exports.createConflictError = createConflictError;
exports.createRateLimitError = createRateLimitError;
exports.createExternalServiceError = createExternalServiceError;
exports.createDatabaseError = createDatabaseError;
exports.isBaseError = isBaseError;
exports.isValidationError = isValidationError;
exports.isAuthenticationError = isAuthenticationError;
exports.isAuthorizationError = isAuthorizationError;
exports.isNotFoundError = isNotFoundError;
exports.isConflictError = isConflictError;
exports.isRateLimitError = isRateLimitError;
exports.isExternalServiceError = isExternalServiceError;
exports.isDatabaseError = isDatabaseError;
exports.getErrorMessage = getErrorMessage;
exports.getErrorCode = getErrorCode;
exports.getStatusCode = getStatusCode;
exports.normalizeError = normalizeError;
exports.toApiError = toApiError;
exports.createErrorWithStack = createErrorWithStack;
exports.wrapWithErrorHandling = wrapWithErrorHandling;
exports.wrapAsyncWithErrorHandling = wrapAsyncWithErrorHandling;
const api_1 = require("../types/api");
// =============================================================================
// BASE ERROR CLASSES
// =============================================================================
/**
 * Base application error class
 */
class BaseError extends Error {
    constructor(message, details, cause) {
        super(message);
        this.details = details;
        this.cause = cause;
        // Maintain proper stack trace
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, BaseError);
        }
    }
    /**
     * Convert error to JSON representation
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            ...(this.details && { details: this.details }),
            ...(this.stack && { stack: this.stack }),
        };
    }
}
exports.BaseError = BaseError;
/**
 * Application-specific error class
 */
class ApplicationError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = 'ApplicationError';
        this.statusCode = api_1.HttpStatus.INTERNAL_SERVER_ERROR;
        this.code = 'APPLICATION_ERROR';
    }
}
exports.ApplicationError = ApplicationError;
/**
 * Validation error class
 */
class ValidationError extends BaseError {
    constructor(message, errors = [], details) {
        super(message, details);
        this.errors = errors;
        this.name = 'ValidationError';
        this.statusCode = api_1.HttpStatus.BAD_REQUEST;
        this.code = 'VALIDATION_ERROR';
    }
}
exports.ValidationError = ValidationError;
/**
 * Authentication error class
 */
class AuthenticationError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = 'AuthenticationError';
        this.statusCode = api_1.HttpStatus.UNAUTHORIZED;
        this.code = 'AUTHENTICATION_ERROR';
    }
}
exports.AuthenticationError = AuthenticationError;
/**
 * Authorization error class
 */
class AuthorizationError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = 'AuthorizationError';
        this.statusCode = api_1.HttpStatus.FORBIDDEN;
        this.code = 'AUTHORIZATION_ERROR';
    }
}
exports.AuthorizationError = AuthorizationError;
/**
 * Not found error class
 */
class NotFoundError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = 'NotFoundError';
        this.statusCode = api_1.HttpStatus.NOT_FOUND;
        this.code = 'NOT_FOUND';
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Conflict error class
 */
class ConflictError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = 'ConflictError';
        this.statusCode = api_1.HttpStatus.CONFLICT;
        this.code = 'CONFLICT';
    }
}
exports.ConflictError = ConflictError;
/**
 * Rate limit error class
 */
class RateLimitError extends BaseError {
    constructor(message, limit, remaining, reset, retryAfter) {
        super(message);
        this.limit = limit;
        this.remaining = remaining;
        this.reset = reset;
        this.retryAfter = retryAfter;
        this.name = 'RateLimitError';
        this.statusCode = api_1.HttpStatus.TOO_MANY_REQUESTS;
        this.code = 'RATE_LIMIT_EXCEEDED';
    }
}
exports.RateLimitError = RateLimitError;
/**
 * External service error class
 */
class ExternalServiceError extends BaseError {
    constructor(message, service, originalError, details) {
        super(message, details, originalError);
        this.service = service;
        this.originalError = originalError;
        this.name = 'ExternalServiceError';
        this.statusCode = api_1.HttpStatus.BAD_GATEWAY;
        this.code = 'EXTERNAL_SERVICE_ERROR';
    }
}
exports.ExternalServiceError = ExternalServiceError;
/**
 * Database error class
 */
class DatabaseError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = 'DatabaseError';
        this.statusCode = api_1.HttpStatus.INTERNAL_SERVER_ERROR;
        this.code = 'DATABASE_ERROR';
    }
}
exports.DatabaseError = DatabaseError;
/**
 * Network error class
 */
class NetworkError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = 'NetworkError';
        this.statusCode = api_1.HttpStatus.INTERNAL_SERVER_ERROR;
        this.code = 'NETWORK_ERROR';
    }
}
exports.NetworkError = NetworkError;
/**
 * File error class
 */
class FileError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = 'FileError';
        this.statusCode = api_1.HttpStatus.BAD_REQUEST;
        this.code = 'FILE_ERROR';
    }
}
exports.FileError = FileError;
// =============================================================================
// ERROR FACTORY FUNCTIONS
// =============================================================================
/**
 * Create a validation error
 */
function createValidationError(message, errors = []) {
    return new ValidationError(message, errors);
}
/**
 * Create an authentication error
 */
function createAuthenticationError(message = 'Authentication failed', details) {
    return new AuthenticationError(message, details);
}
/**
 * Create an authorization error
 */
function createAuthorizationError(message = 'Access denied', details) {
    return new AuthorizationError(message, details);
}
/**
 * Create a not found error
 */
function createNotFoundError(resource, id) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    return new NotFoundError(message);
}
/**
 * Create a conflict error
 */
function createConflictError(message, details) {
    return new ConflictError(message, details);
}
/**
 * Create a rate limit error
 */
function createRateLimitError(limit, remaining, reset, retryAfter) {
    return new RateLimitError('Rate limit exceeded', limit, remaining, reset, retryAfter);
}
/**
 * Create an external service error
 */
function createExternalServiceError(service, message, originalError, details) {
    return new ExternalServiceError(message, service, originalError, details);
}
/**
 * Create a database error
 */
function createDatabaseError(message, details, cause) {
    return new DatabaseError(message, details, cause);
}
// =============================================================================
// ERROR UTILITIES
// =============================================================================
/**
 * Check if error is an instance of BaseError
 */
function isBaseError(error) {
    return error instanceof BaseError;
}
/**
 * Check if error is a validation error
 */
function isValidationError(error) {
    return error instanceof ValidationError;
}
/**
 * Check if error is an authentication error
 */
function isAuthenticationError(error) {
    return error instanceof AuthenticationError;
}
/**
 * Check if error is an authorization error
 */
function isAuthorizationError(error) {
    return error instanceof AuthorizationError;
}
/**
 * Check if error is a not found error
 */
function isNotFoundError(error) {
    return error instanceof NotFoundError;
}
/**
 * Check if error is a conflict error
 */
function isConflictError(error) {
    return error instanceof ConflictError;
}
/**
 * Check if error is a rate limit error
 */
function isRateLimitError(error) {
    return error instanceof RateLimitError;
}
/**
 * Check if error is an external service error
 */
function isExternalServiceError(error) {
    return error instanceof ExternalServiceError;
}
/**
 * Check if error is a database error
 */
function isDatabaseError(error) {
    return error instanceof DatabaseError;
}
/**
 * Extract error message from any error type
 */
function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (error && typeof error.message === 'string') {
        return error.message;
    }
    return 'Unknown error';
}
/**
 * Extract error code from any error type
 */
function getErrorCode(error) {
    if (isBaseError(error)) {
        return error.code;
    }
    if (error && typeof error.code === 'string') {
        return error.code;
    }
    return 'UNKNOWN_ERROR';
}
/**
 * Extract HTTP status code from any error type
 */
function getStatusCode(error) {
    if (isBaseError(error)) {
        return error.statusCode;
    }
    if (error && typeof error.statusCode === 'number') {
        return error.statusCode;
    }
    return api_1.HttpStatus.INTERNAL_SERVER_ERROR;
}
/**
 * Convert any error to a standardized error object
 */
function normalizeError(error) {
    if (isBaseError(error)) {
        return error.toJSON();
    }
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            code: 'UNKNOWN_ERROR',
            statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR,
            ...(error.stack && { stack: error.stack }),
        };
    }
    return {
        name: 'UnknownError',
        message: getErrorMessage(error),
        code: 'UNKNOWN_ERROR',
        statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR,
    };
}
/**
 * Convert BaseError to ApiError
 */
function toApiError(error) {
    const apiErrorCode = mapToApiErrorCode(error.code);
    return new api_1.ApiError(error.message, apiErrorCode, error.statusCode, error.details);
}
/**
 * Map application error codes to API error codes
 */
function mapToApiErrorCode(code) {
    const mapping = {
        'VALIDATION_ERROR': api_1.ApiErrorCode.VALIDATION_ERROR,
        'AUTHENTICATION_ERROR': api_1.ApiErrorCode.UNAUTHORIZED,
        'AUTHORIZATION_ERROR': api_1.ApiErrorCode.FORBIDDEN,
        'NOT_FOUND': api_1.ApiErrorCode.NOT_FOUND,
        'CONFLICT': api_1.ApiErrorCode.CONFLICT,
        'RATE_LIMIT_EXCEEDED': api_1.ApiErrorCode.RATE_LIMIT_EXCEEDED,
        'EXTERNAL_SERVICE_ERROR': api_1.ApiErrorCode.EXTERNAL_SERVICE_ERROR,
        'DATABASE_ERROR': api_1.ApiErrorCode.DATABASE_ERROR,
        'NETWORK_ERROR': api_1.ApiErrorCode.NETWORK_ERROR,
        'FILE_ERROR': api_1.ApiErrorCode.INVALID_REQUEST,
    };
    return mapping[code] || api_1.ApiErrorCode.INTERNAL_ERROR;
}
/**
 * Create error with stack trace
 */
function createErrorWithStack(message, name = 'Error', code = 'UNKNOWN_ERROR') {
    const error = new Error(message);
    error.name = name;
    error.code = code;
    if (typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(error, createErrorWithStack);
    }
    return error;
}
/**
 * Wrap function to catch and normalize errors
 */
function wrapWithErrorHandling(fn, errorTransformer) {
    return (...args) => {
        try {
            return fn(...args);
        }
        catch (error) {
            if (errorTransformer) {
                throw errorTransformer(error);
            }
            if (isBaseError(error)) {
                throw error;
            }
            throw new ApplicationError(getErrorMessage(error), undefined, error instanceof Error ? error : undefined);
        }
    };
}
/**
 * Wrap async function to catch and normalize errors
 */
function wrapAsyncWithErrorHandling(fn, errorTransformer) {
    return async (...args) => {
        try {
            return await fn(...args);
        }
        catch (error) {
            if (errorTransformer) {
                throw errorTransformer(error);
            }
            if (isBaseError(error)) {
                throw error;
            }
            throw new ApplicationError(getErrorMessage(error), undefined, error instanceof Error ? error : undefined);
        }
    };
}
//# sourceMappingURL=errors.js.map