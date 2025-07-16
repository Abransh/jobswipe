/**
 * @fileoverview Error handling utilities for JobSwipe
 * @description Common error classes and utilities for consistent error handling
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { ApiError, ApiErrorCode, HttpStatus } from '../types/api';

// =============================================================================
// BASE ERROR CLASSES
// =============================================================================

/**
 * Base application error class
 */
export abstract class BaseError extends Error {
  abstract override readonly name: string;
  abstract readonly statusCode: HttpStatus;
  abstract readonly code: string;
  
  constructor(
    message: string,
    public readonly details?: Record<string, any>,
    public readonly cause?: Error
  ) {
    super(message);
    
    // Maintain proper stack trace
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, BaseError);
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

/**
 * Application-specific error class
 */
export class ApplicationError extends BaseError {
  readonly name = 'ApplicationError';
  readonly statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  readonly code = 'APPLICATION_ERROR';
}

/**
 * Validation error class
 */
export class ValidationError extends BaseError {
  readonly name = 'ValidationError';
  readonly statusCode = HttpStatus.BAD_REQUEST;
  readonly code = 'VALIDATION_ERROR';
  
  constructor(
    message: string,
    public readonly errors: Array<{
      field: string;
      message: string;
      code: string;
      value?: any;
    }> = [],
    details?: Record<string, any>
  ) {
    super(message, details);
  }
}

/**
 * Authentication error class
 */
export class AuthenticationError extends BaseError {
  readonly name = 'AuthenticationError';
  readonly statusCode = HttpStatus.UNAUTHORIZED;
  readonly code = 'AUTHENTICATION_ERROR';
}

/**
 * Authorization error class
 */
export class AuthorizationError extends BaseError {
  readonly name = 'AuthorizationError';
  readonly statusCode = HttpStatus.FORBIDDEN;
  readonly code = 'AUTHORIZATION_ERROR';
}

/**
 * Not found error class
 */
export class NotFoundError extends BaseError {
  readonly name = 'NotFoundError';
  readonly statusCode = HttpStatus.NOT_FOUND;
  readonly code = 'NOT_FOUND';
}

/**
 * Conflict error class
 */
export class ConflictError extends BaseError {
  readonly name = 'ConflictError';
  readonly statusCode = HttpStatus.CONFLICT;
  readonly code = 'CONFLICT';
}

/**
 * Rate limit error class
 */
export class RateLimitError extends BaseError {
  readonly name = 'RateLimitError';
  readonly statusCode = HttpStatus.TOO_MANY_REQUESTS;
  readonly code = 'RATE_LIMIT_EXCEEDED';
  
  constructor(
    message: string,
    public readonly limit: number,
    public readonly remaining: number,
    public readonly reset: Date,
    public readonly retryAfter?: number
  ) {
    super(message);
  }
}

/**
 * External service error class
 */
export class ExternalServiceError extends BaseError {
  readonly name = 'ExternalServiceError';
  readonly statusCode = HttpStatus.BAD_GATEWAY;
  readonly code = 'EXTERNAL_SERVICE_ERROR';
  
  constructor(
    message: string,
    public readonly service: string,
    public readonly originalError?: Error,
    details?: Record<string, any>
  ) {
    super(message, details, originalError);
  }
}

/**
 * Database error class
 */
export class DatabaseError extends BaseError {
  readonly name = 'DatabaseError';
  readonly statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  readonly code = 'DATABASE_ERROR';
}

/**
 * Network error class
 */
export class NetworkError extends BaseError {
  readonly name = 'NetworkError';
  readonly statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  readonly code = 'NETWORK_ERROR';
}

/**
 * File error class
 */
export class FileError extends BaseError {
  readonly name = 'FileError';
  readonly statusCode = HttpStatus.BAD_REQUEST;
  readonly code = 'FILE_ERROR';
}

// =============================================================================
// ERROR FACTORY FUNCTIONS
// =============================================================================

/**
 * Create a validation error
 */
export function createValidationError(
  message: string,
  errors: Array<{
    field: string;
    message: string;
    code: string;
    value?: any;
  }> = []
): ValidationError {
  return new ValidationError(message, errors);
}

/**
 * Create an authentication error
 */
export function createAuthenticationError(
  message: string = 'Authentication failed',
  details?: Record<string, any>
): AuthenticationError {
  return new AuthenticationError(message, details);
}

/**
 * Create an authorization error
 */
export function createAuthorizationError(
  message: string = 'Access denied',
  details?: Record<string, any>
): AuthorizationError {
  return new AuthorizationError(message, details);
}

/**
 * Create a not found error
 */
export function createNotFoundError(
  resource: string,
  id?: string
): NotFoundError {
  const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
  return new NotFoundError(message);
}

/**
 * Create a conflict error
 */
export function createConflictError(
  message: string,
  details?: Record<string, any>
): ConflictError {
  return new ConflictError(message, details);
}

/**
 * Create a rate limit error
 */
export function createRateLimitError(
  limit: number,
  remaining: number,
  reset: Date,
  retryAfter?: number
): RateLimitError {
  return new RateLimitError(
    'Rate limit exceeded',
    limit,
    remaining,
    reset,
    retryAfter
  );
}

/**
 * Create an external service error
 */
export function createExternalServiceError(
  service: string,
  message: string,
  originalError?: Error,
  details?: Record<string, any>
): ExternalServiceError {
  return new ExternalServiceError(message, service, originalError, details);
}

/**
 * Create a database error
 */
export function createDatabaseError(
  message: string,
  details?: Record<string, any>,
  cause?: Error
): DatabaseError {
  return new DatabaseError(message, details, cause);
}

// =============================================================================
// ERROR UTILITIES
// =============================================================================

/**
 * Check if error is an instance of BaseError
 */
export function isBaseError(error: any): error is BaseError {
  return error instanceof BaseError;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: any): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Check if error is an authentication error
 */
export function isAuthenticationError(error: any): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

/**
 * Check if error is an authorization error
 */
export function isAuthorizationError(error: any): error is AuthorizationError {
  return error instanceof AuthorizationError;
}

/**
 * Check if error is a not found error
 */
export function isNotFoundError(error: any): error is NotFoundError {
  return error instanceof NotFoundError;
}

/**
 * Check if error is a conflict error
 */
export function isConflictError(error: any): error is ConflictError {
  return error instanceof ConflictError;
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: any): error is RateLimitError {
  return error instanceof RateLimitError;
}

/**
 * Check if error is an external service error
 */
export function isExternalServiceError(error: any): error is ExternalServiceError {
  return error instanceof ExternalServiceError;
}

/**
 * Check if error is a database error
 */
export function isDatabaseError(error: any): error is DatabaseError {
  return error instanceof DatabaseError;
}

/**
 * Extract error message from any error type
 */
export function getErrorMessage(error: any): string {
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
export function getErrorCode(error: any): string {
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
export function getStatusCode(error: any): HttpStatus {
  if (isBaseError(error)) {
    return error.statusCode;
  }
  
  if (error && typeof error.statusCode === 'number') {
    return error.statusCode;
  }
  
  return HttpStatus.INTERNAL_SERVER_ERROR;
}

/**
 * Convert any error to a standardized error object
 */
export function normalizeError(error: any): {
  name: string;
  message: string;
  code: string;
  statusCode: HttpStatus;
  details?: Record<string, any>;
  stack?: string;
} {
  if (isBaseError(error)) {
    return error.toJSON();
  }
  
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      code: 'UNKNOWN_ERROR',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      ...(error.stack && { stack: error.stack }),
    };
  }
  
  return {
    name: 'UnknownError',
    message: getErrorMessage(error),
    code: 'UNKNOWN_ERROR',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  };
}

/**
 * Convert BaseError to ApiError
 */
export function toApiError(error: BaseError): ApiError {
  const apiErrorCode = mapToApiErrorCode(error.code);
  return new ApiError(error.message, apiErrorCode, error.statusCode, error.details);
}

/**
 * Map application error codes to API error codes
 */
function mapToApiErrorCode(code: string): ApiErrorCode {
  const mapping: Record<string, ApiErrorCode> = {
    'VALIDATION_ERROR': ApiErrorCode.VALIDATION_ERROR,
    'AUTHENTICATION_ERROR': ApiErrorCode.UNAUTHORIZED,
    'AUTHORIZATION_ERROR': ApiErrorCode.FORBIDDEN,
    'NOT_FOUND': ApiErrorCode.NOT_FOUND,
    'CONFLICT': ApiErrorCode.CONFLICT,
    'RATE_LIMIT_EXCEEDED': ApiErrorCode.RATE_LIMIT_EXCEEDED,
    'EXTERNAL_SERVICE_ERROR': ApiErrorCode.EXTERNAL_SERVICE_ERROR,
    'DATABASE_ERROR': ApiErrorCode.DATABASE_ERROR,
    'NETWORK_ERROR': ApiErrorCode.NETWORK_ERROR,
    'FILE_ERROR': ApiErrorCode.INVALID_REQUEST,
  };
  
  return mapping[code] || ApiErrorCode.INTERNAL_ERROR;
}

/**
 * Create error with stack trace
 */
export function createErrorWithStack(
  message: string,
  name: string = 'Error',
  code: string = 'UNKNOWN_ERROR'
): Error & { code: string } {
  const error = new Error(message) as Error & { code: string };
  error.name = name;
  error.code = code;
  
  if (typeof (Error as any).captureStackTrace === 'function') {
    (Error as any).captureStackTrace(error, createErrorWithStack);
  }
  
  return error;
}

/**
 * Wrap function to catch and normalize errors
 */
export function wrapWithErrorHandling<T extends any[], R>(
  fn: (...args: T) => R,
  errorTransformer?: (error: any) => BaseError
): (...args: T) => R {
  return (...args: T) => {
    try {
      return fn(...args);
    } catch (error) {
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
export function wrapAsyncWithErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorTransformer?: (error: any) => BaseError
): (...args: T) => Promise<R> {
  return async (...args: T) => {
    try {
      return await fn(...args);
    } catch (error) {
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