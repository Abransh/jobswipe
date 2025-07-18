"use strict";
/**
 * @fileoverview API response types and interfaces for JobSwipe
 * @description Standardized API response formats and error handling
 * @version 1.0.0
 * @author JobSwipe Team
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchRequestSchema = exports.RateLimitInfoSchema = exports.ValidationErrorDetailSchema = exports.ApiResponseSchema = exports.ApiError = exports.ApiErrorCode = exports.HttpStatus = void 0;
exports.createSuccessResponse = createSuccessResponse;
exports.createErrorResponse = createErrorResponse;
exports.createValidationErrorResponse = createValidationErrorResponse;
exports.createRateLimitResponse = createRateLimitResponse;
exports.isSuccessResponse = isSuccessResponse;
exports.isErrorResponse = isErrorResponse;
exports.getErrorMessage = getErrorMessage;
exports.getErrorCode = getErrorCode;
const zod_1 = require("zod");
// =============================================================================
// HTTP STATUS CODES
// =============================================================================
/**
 * HTTP status codes enumeration
 */
var HttpStatus;
(function (HttpStatus) {
    // 2xx Success
    HttpStatus[HttpStatus["OK"] = 200] = "OK";
    HttpStatus[HttpStatus["CREATED"] = 201] = "CREATED";
    HttpStatus[HttpStatus["ACCEPTED"] = 202] = "ACCEPTED";
    HttpStatus[HttpStatus["NO_CONTENT"] = 204] = "NO_CONTENT";
    // 3xx Redirection
    HttpStatus[HttpStatus["MOVED_PERMANENTLY"] = 301] = "MOVED_PERMANENTLY";
    HttpStatus[HttpStatus["FOUND"] = 302] = "FOUND";
    HttpStatus[HttpStatus["NOT_MODIFIED"] = 304] = "NOT_MODIFIED";
    // 4xx Client Errors
    HttpStatus[HttpStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatus[HttpStatus["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpStatus[HttpStatus["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpStatus[HttpStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatus[HttpStatus["METHOD_NOT_ALLOWED"] = 405] = "METHOD_NOT_ALLOWED";
    HttpStatus[HttpStatus["NOT_ACCEPTABLE"] = 406] = "NOT_ACCEPTABLE";
    HttpStatus[HttpStatus["REQUEST_TIMEOUT"] = 408] = "REQUEST_TIMEOUT";
    HttpStatus[HttpStatus["CONFLICT"] = 409] = "CONFLICT";
    HttpStatus[HttpStatus["GONE"] = 410] = "GONE";
    HttpStatus[HttpStatus["PRECONDITION_FAILED"] = 412] = "PRECONDITION_FAILED";
    HttpStatus[HttpStatus["PAYLOAD_TOO_LARGE"] = 413] = "PAYLOAD_TOO_LARGE";
    HttpStatus[HttpStatus["UNSUPPORTED_MEDIA_TYPE"] = 415] = "UNSUPPORTED_MEDIA_TYPE";
    HttpStatus[HttpStatus["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    HttpStatus[HttpStatus["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
    // 5xx Server Errors
    HttpStatus[HttpStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    HttpStatus[HttpStatus["NOT_IMPLEMENTED"] = 501] = "NOT_IMPLEMENTED";
    HttpStatus[HttpStatus["BAD_GATEWAY"] = 502] = "BAD_GATEWAY";
    HttpStatus[HttpStatus["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
    HttpStatus[HttpStatus["GATEWAY_TIMEOUT"] = 504] = "GATEWAY_TIMEOUT";
})(HttpStatus || (exports.HttpStatus = HttpStatus = {}));
// =============================================================================
// ERROR TYPES
// =============================================================================
/**
 * API error codes
 */
var ApiErrorCode;
(function (ApiErrorCode) {
    // General errors
    ApiErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ApiErrorCode["INVALID_REQUEST"] = "INVALID_REQUEST";
    ApiErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ApiErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ApiErrorCode["CONFLICT"] = "CONFLICT";
    ApiErrorCode["FORBIDDEN"] = "FORBIDDEN";
    // Authentication errors
    ApiErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ApiErrorCode["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    ApiErrorCode["TOKEN_INVALID"] = "TOKEN_INVALID";
    ApiErrorCode["INSUFFICIENT_PERMISSIONS"] = "INSUFFICIENT_PERMISSIONS";
    // Rate limiting
    ApiErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    // Resource errors
    ApiErrorCode["RESOURCE_NOT_FOUND"] = "RESOURCE_NOT_FOUND";
    ApiErrorCode["RESOURCE_ALREADY_EXISTS"] = "RESOURCE_ALREADY_EXISTS";
    ApiErrorCode["RESOURCE_LOCKED"] = "RESOURCE_LOCKED";
    ApiErrorCode["RESOURCE_EXPIRED"] = "RESOURCE_EXPIRED";
    // Business logic errors
    ApiErrorCode["BUSINESS_RULE_VIOLATION"] = "BUSINESS_RULE_VIOLATION";
    ApiErrorCode["QUOTA_EXCEEDED"] = "QUOTA_EXCEEDED";
    ApiErrorCode["FEATURE_NOT_AVAILABLE"] = "FEATURE_NOT_AVAILABLE";
    // External service errors
    ApiErrorCode["EXTERNAL_SERVICE_ERROR"] = "EXTERNAL_SERVICE_ERROR";
    ApiErrorCode["EXTERNAL_SERVICE_TIMEOUT"] = "EXTERNAL_SERVICE_TIMEOUT";
    ApiErrorCode["EXTERNAL_SERVICE_UNAVAILABLE"] = "EXTERNAL_SERVICE_UNAVAILABLE";
    // Data errors
    ApiErrorCode["DATA_INTEGRITY_ERROR"] = "DATA_INTEGRITY_ERROR";
    ApiErrorCode["DATA_CORRUPTION"] = "DATA_CORRUPTION";
    ApiErrorCode["DATABASE_ERROR"] = "DATABASE_ERROR";
    // File errors
    ApiErrorCode["FILE_NOT_FOUND"] = "FILE_NOT_FOUND";
    ApiErrorCode["FILE_TOO_LARGE"] = "FILE_TOO_LARGE";
    ApiErrorCode["UNSUPPORTED_FILE_TYPE"] = "UNSUPPORTED_FILE_TYPE";
    // Network errors
    ApiErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    ApiErrorCode["CONNECTION_TIMEOUT"] = "CONNECTION_TIMEOUT";
    ApiErrorCode["CONNECTION_REFUSED"] = "CONNECTION_REFUSED";
})(ApiErrorCode || (exports.ApiErrorCode = ApiErrorCode = {}));
/**
 * API error class
 */
class ApiError extends Error {
    constructor(message, code, statusCode = HttpStatus.INTERNAL_SERVER_ERROR, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'ApiError';
        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }
}
exports.ApiError = ApiError;
// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================
/**
 * API response schema
 */
exports.ApiResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional(),
    errorCode: zod_1.z.string().optional(),
    message: zod_1.z.string().optional(),
    timestamp: zod_1.z.date(),
    requestId: zod_1.z.string().optional(),
    version: zod_1.z.string().optional(),
});
/**
 * Validation error detail schema
 */
exports.ValidationErrorDetailSchema = zod_1.z.object({
    field: zod_1.z.string(),
    message: zod_1.z.string(),
    code: zod_1.z.string(),
    value: zod_1.z.any().optional(),
});
/**
 * Rate limit info schema
 */
exports.RateLimitInfoSchema = zod_1.z.object({
    limit: zod_1.z.number(),
    remaining: zod_1.z.number(),
    reset: zod_1.z.date(),
    retryAfter: zod_1.z.number().optional(),
});
/**
 * Search request schema
 */
exports.SearchRequestSchema = zod_1.z.object({
    query: zod_1.z.string(),
    filters: zod_1.z.record(zod_1.z.any()).optional(),
    sort: zod_1.z.array(zod_1.z.object({
        field: zod_1.z.string(),
        direction: zod_1.z.enum(['asc', 'desc']),
    })).optional(),
    pagination: zod_1.z.object({
        page: zod_1.z.number().min(1).optional(),
        limit: zod_1.z.number().min(1).max(100).optional(),
        offset: zod_1.z.number().min(0).optional(),
    }).optional(),
    highlight: zod_1.z.object({
        fields: zod_1.z.array(zod_1.z.string()),
        fragmentSize: zod_1.z.number().optional(),
        numberOfFragments: zod_1.z.number().optional(),
    }).optional(),
    aggregations: zod_1.z.record(zod_1.z.any()).optional(),
});
// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
/**
 * Create a successful API response
 */
function createSuccessResponse(data, message, requestId) {
    return {
        success: true,
        data,
        message,
        timestamp: new Date(),
        requestId,
    };
}
/**
 * Create an error API response
 */
function createErrorResponse(error, errorCode, details, requestId) {
    return {
        success: false,
        error,
        errorCode,
        details,
        timestamp: new Date(),
        requestId,
    };
}
/**
 * Create a validation error response
 */
function createValidationErrorResponse(errors, requestId) {
    return {
        success: false,
        error: 'Validation failed',
        errorCode: 'VALIDATION_ERROR',
        details: {
            errors,
            invalidFields: errors.map(e => e.field),
        },
        timestamp: new Date(),
        requestId,
    };
}
/**
 * Create a rate limit error response
 */
function createRateLimitResponse(rateLimitInfo, requestId) {
    return {
        success: false,
        error: 'Rate limit exceeded',
        errorCode: 'RATE_LIMIT_EXCEEDED',
        details: rateLimitInfo,
        timestamp: new Date(),
        requestId,
    };
}
/**
 * Check if response is successful
 */
function isSuccessResponse(response) {
    return response.success === true;
}
/**
 * Check if response is an error
 */
function isErrorResponse(response) {
    return response.success === false;
}
/**
 * Extract error message from response
 */
function getErrorMessage(response) {
    if (isErrorResponse(response)) {
        return response.error;
    }
    return 'Unknown error';
}
/**
 * Extract error code from response
 */
function getErrorCode(response) {
    if (isErrorResponse(response)) {
        return response.errorCode;
    }
    return undefined;
}
//# sourceMappingURL=api.js.map