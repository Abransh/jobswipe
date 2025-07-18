/**
 * @fileoverview API response types and interfaces for JobSwipe
 * @description Standardized API response formats and error handling
 * @version 1.0.0
 * @author JobSwipe Team
 */
import { z } from 'zod';
import { PaginationMeta } from './common';
/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    errorCode?: string;
    message?: string;
    timestamp: Date;
    requestId?: string;
    version?: string;
}
/**
 * Paginated API response
 */
export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
    meta: PaginationMeta;
}
/**
 * API error response
 */
export interface ApiErrorResponse extends ApiResponse {
    success: false;
    error: string;
    errorCode: string;
    details?: Record<string, any>;
    stack?: string;
}
/**
 * API success response
 */
export interface ApiSuccessResponse<T = any> extends ApiResponse<T> {
    success: true;
    data: T;
}
/**
 * HTTP status codes enumeration
 */
export declare enum HttpStatus {
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NO_CONTENT = 204,
    MOVED_PERMANENTLY = 301,
    FOUND = 302,
    NOT_MODIFIED = 304,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,
    REQUEST_TIMEOUT = 408,
    CONFLICT = 409,
    GONE = 410,
    PRECONDITION_FAILED = 412,
    PAYLOAD_TOO_LARGE = 413,
    UNSUPPORTED_MEDIA_TYPE = 415,
    UNPROCESSABLE_ENTITY = 422,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504
}
/**
 * API error codes
 */
export declare enum ApiErrorCode {
    INTERNAL_ERROR = "INTERNAL_ERROR",
    INVALID_REQUEST = "INVALID_REQUEST",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    NOT_FOUND = "NOT_FOUND",
    CONFLICT = "CONFLICT",
    FORBIDDEN = "FORBIDDEN",
    UNAUTHORIZED = "UNAUTHORIZED",
    TOKEN_EXPIRED = "TOKEN_EXPIRED",
    TOKEN_INVALID = "TOKEN_INVALID",
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
    RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",
    RESOURCE_LOCKED = "RESOURCE_LOCKED",
    RESOURCE_EXPIRED = "RESOURCE_EXPIRED",
    BUSINESS_RULE_VIOLATION = "BUSINESS_RULE_VIOLATION",
    QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
    FEATURE_NOT_AVAILABLE = "FEATURE_NOT_AVAILABLE",
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
    EXTERNAL_SERVICE_TIMEOUT = "EXTERNAL_SERVICE_TIMEOUT",
    EXTERNAL_SERVICE_UNAVAILABLE = "EXTERNAL_SERVICE_UNAVAILABLE",
    DATA_INTEGRITY_ERROR = "DATA_INTEGRITY_ERROR",
    DATA_CORRUPTION = "DATA_CORRUPTION",
    DATABASE_ERROR = "DATABASE_ERROR",
    FILE_NOT_FOUND = "FILE_NOT_FOUND",
    FILE_TOO_LARGE = "FILE_TOO_LARGE",
    UNSUPPORTED_FILE_TYPE = "UNSUPPORTED_FILE_TYPE",
    NETWORK_ERROR = "NETWORK_ERROR",
    CONNECTION_TIMEOUT = "CONNECTION_TIMEOUT",
    CONNECTION_REFUSED = "CONNECTION_REFUSED"
}
/**
 * API error class
 */
export declare class ApiError extends Error {
    code: ApiErrorCode;
    statusCode: HttpStatus;
    details?: Record<string, any> | undefined;
    constructor(message: string, code: ApiErrorCode, statusCode?: HttpStatus, details?: Record<string, any> | undefined);
}
/**
 * Validation error details
 */
export interface ValidationErrorDetail {
    field: string;
    message: string;
    code: string;
    value?: any;
}
/**
 * Validation error response
 */
export interface ValidationErrorResponse extends ApiErrorResponse {
    errorCode: 'VALIDATION_ERROR';
    details: {
        errors: ValidationErrorDetail[];
        invalidFields: string[];
    };
}
/**
 * Rate limiting information
 */
export interface RateLimitInfo {
    limit: number;
    remaining: number;
    reset: Date;
    retryAfter?: number;
}
/**
 * Rate limit exceeded response
 */
export interface RateLimitResponse extends ApiErrorResponse {
    errorCode: 'RATE_LIMIT_EXCEEDED';
    details: RateLimitInfo;
}
/**
 * Health check response
 */
export interface HealthResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: Date;
    uptime: number;
    version: string;
    environment: string;
    services: {
        database: ServiceStatus;
        redis: ServiceStatus;
        external: ServiceStatus[];
    };
    metrics: {
        memory: MemoryMetrics;
        cpu: CpuMetrics;
        requests: RequestMetrics;
    };
}
/**
 * Service status
 */
export interface ServiceStatus {
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    responseTime?: number;
    lastCheck: Date;
    error?: string;
    version?: string;
    uptime?: number;
}
/**
 * Memory metrics
 */
export interface MemoryMetrics {
    used: number;
    total: number;
    percentage: number;
    heapUsed: number;
    heapTotal: number;
}
/**
 * CPU metrics
 */
export interface CpuMetrics {
    usage: number;
    loadAverage: number[];
    cores: number;
}
/**
 * Request metrics
 */
export interface RequestMetrics {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
    requestsPerSecond: number;
}
/**
 * API version information
 */
export interface ApiVersionInfo {
    version: string;
    buildNumber: string;
    buildDate: Date;
    environment: string;
    features: string[];
    deprecated?: boolean;
    sunsetDate?: Date;
    migrationGuide?: string;
}
/**
 * Webhook event
 */
export interface WebhookEvent {
    id: string;
    type: string;
    data: Record<string, any>;
    timestamp: Date;
    version: string;
    signature: string;
    deliveryAttempt: number;
    maxDeliveryAttempts: number;
}
/**
 * Webhook delivery status
 */
export interface WebhookDeliveryStatus {
    id: string;
    webhookId: string;
    eventId: string;
    status: 'pending' | 'delivered' | 'failed' | 'expired';
    attempt: number;
    responseCode?: number;
    responseBody?: string;
    error?: string;
    deliveredAt?: Date;
    nextRetryAt?: Date;
}
/**
 * Bulk operation request
 */
export interface BulkOperationRequest<T> {
    operation: 'create' | 'update' | 'delete';
    items: T[];
    options?: {
        continueOnError?: boolean;
        batchSize?: number;
        validateOnly?: boolean;
    };
}
/**
 * Bulk operation response
 */
export interface BulkOperationResponse<T> {
    success: boolean;
    processed: number;
    failed: number;
    results: BulkOperationResult<T>[];
    errors: BulkOperationError[];
    summary: {
        totalItems: number;
        successfulItems: number;
        failedItems: number;
        processingTime: number;
    };
}
/**
 * Bulk operation result
 */
export interface BulkOperationResult<T> {
    index: number;
    id?: string;
    status: 'success' | 'error';
    data?: T;
    error?: string;
    errorCode?: string;
}
/**
 * Bulk operation error
 */
export interface BulkOperationError {
    index: number;
    error: string;
    errorCode: string;
    details?: Record<string, any>;
}
/**
 * Search request
 */
export interface SearchRequest {
    query: string;
    filters?: Record<string, any>;
    sort?: Array<{
        field: string;
        direction: 'asc' | 'desc';
    }>;
    pagination?: {
        page?: number;
        limit?: number;
        offset?: number;
    };
    highlight?: {
        fields: string[];
        fragmentSize?: number;
        numberOfFragments?: number;
    };
    aggregations?: Record<string, any>;
}
/**
 * Search response
 */
export interface SearchResponse<T> {
    results: SearchResult<T>[];
    total: number;
    took: number;
    aggregations?: Record<string, any>;
    suggestions?: string[];
    facets?: Record<string, SearchFacet>;
}
/**
 * Search result
 */
export interface SearchResult<T> {
    id: string;
    score: number;
    source: T;
    highlights?: Record<string, string[]>;
    explanation?: SearchExplanation;
}
/**
 * Search facet
 */
export interface SearchFacet {
    field: string;
    values: Array<{
        value: string;
        count: number;
    }>;
}
/**
 * Search explanation
 */
export interface SearchExplanation {
    value: number;
    description: string;
    details?: SearchExplanation[];
}
/**
 * API response schema
 */
export declare const ApiResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodString>;
    errorCode: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodDate;
    requestId: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    timestamp: Date;
    error?: string | undefined;
    message?: string | undefined;
    version?: string | undefined;
    data?: any;
    errorCode?: string | undefined;
    requestId?: string | undefined;
}, {
    success: boolean;
    timestamp: Date;
    error?: string | undefined;
    message?: string | undefined;
    version?: string | undefined;
    data?: any;
    errorCode?: string | undefined;
    requestId?: string | undefined;
}>;
/**
 * Validation error detail schema
 */
export declare const ValidationErrorDetailSchema: z.ZodObject<{
    field: z.ZodString;
    message: z.ZodString;
    code: z.ZodString;
    value: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    code: string;
    message: string;
    field: string;
    value?: any;
}, {
    code: string;
    message: string;
    field: string;
    value?: any;
}>;
/**
 * Rate limit info schema
 */
export declare const RateLimitInfoSchema: z.ZodObject<{
    limit: z.ZodNumber;
    remaining: z.ZodNumber;
    reset: z.ZodDate;
    retryAfter: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    remaining: number;
    reset: Date;
    retryAfter?: number | undefined;
}, {
    limit: number;
    remaining: number;
    reset: Date;
    retryAfter?: number | undefined;
}>;
/**
 * Search request schema
 */
export declare const SearchRequestSchema: z.ZodObject<{
    query: z.ZodString;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    sort: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        direction: z.ZodEnum<["asc", "desc"]>;
    }, "strip", z.ZodTypeAny, {
        field: string;
        direction: "asc" | "desc";
    }, {
        field: string;
        direction: "asc" | "desc";
    }>, "many">>;
    pagination: z.ZodOptional<z.ZodObject<{
        page: z.ZodOptional<z.ZodNumber>;
        limit: z.ZodOptional<z.ZodNumber>;
        offset: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        page?: number | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
    }, {
        page?: number | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
    }>>;
    highlight: z.ZodOptional<z.ZodObject<{
        fields: z.ZodArray<z.ZodString, "many">;
        fragmentSize: z.ZodOptional<z.ZodNumber>;
        numberOfFragments: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        fields: string[];
        fragmentSize?: number | undefined;
        numberOfFragments?: number | undefined;
    }, {
        fields: string[];
        fragmentSize?: number | undefined;
        numberOfFragments?: number | undefined;
    }>>;
    aggregations: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    query: string;
    sort?: {
        field: string;
        direction: "asc" | "desc";
    }[] | undefined;
    filters?: Record<string, any> | undefined;
    pagination?: {
        page?: number | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
    } | undefined;
    highlight?: {
        fields: string[];
        fragmentSize?: number | undefined;
        numberOfFragments?: number | undefined;
    } | undefined;
    aggregations?: Record<string, any> | undefined;
}, {
    query: string;
    sort?: {
        field: string;
        direction: "asc" | "desc";
    }[] | undefined;
    filters?: Record<string, any> | undefined;
    pagination?: {
        page?: number | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
    } | undefined;
    highlight?: {
        fields: string[];
        fragmentSize?: number | undefined;
        numberOfFragments?: number | undefined;
    } | undefined;
    aggregations?: Record<string, any> | undefined;
}>;
/**
 * Create a successful API response
 */
export declare function createSuccessResponse<T>(data: T, message?: string, requestId?: string): ApiSuccessResponse<T>;
/**
 * Create an error API response
 */
export declare function createErrorResponse(error: string, errorCode: ApiErrorCode, details?: Record<string, any>, requestId?: string): ApiErrorResponse;
/**
 * Create a validation error response
 */
export declare function createValidationErrorResponse(errors: ValidationErrorDetail[], requestId?: string): ValidationErrorResponse;
/**
 * Create a rate limit error response
 */
export declare function createRateLimitResponse(rateLimitInfo: RateLimitInfo, requestId?: string): RateLimitResponse;
/**
 * Check if response is successful
 */
export declare function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T>;
/**
 * Check if response is an error
 */
export declare function isErrorResponse(response: ApiResponse): response is ApiErrorResponse;
/**
 * Extract error message from response
 */
export declare function getErrorMessage(response: ApiResponse): string;
/**
 * Extract error code from response
 */
export declare function getErrorCode(response: ApiResponse): string | undefined;
//# sourceMappingURL=api.d.ts.map