/**
 * @fileoverview API response types and interfaces for JobSwipe
 * @description Standardized API response formats and error handling
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { z } from 'zod';
import { PaginationMeta } from './common';

// =============================================================================
// STANDARD API RESPONSE TYPES
// =============================================================================

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
  stack?: string; // Only in development
}

/**
 * API success response
 */
export interface ApiSuccessResponse<T = any> extends ApiResponse<T> {
  success: true;
  data: T;
}

// =============================================================================
// HTTP STATUS CODES
// =============================================================================

/**
 * HTTP status codes enumeration
 */
export enum HttpStatus {
  // 2xx Success
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  
  // 3xx Redirection
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  NOT_MODIFIED = 304,
  
  // 4xx Client Errors
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
  
  // 5xx Server Errors
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * API error codes
 */
export enum ApiErrorCode {
  // General errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  FORBIDDEN = 'FORBIDDEN',
  
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Resource errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_LOCKED = 'RESOURCE_LOCKED',
  RESOURCE_EXPIRED = 'RESOURCE_EXPIRED',
  
  // Business logic errors
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  FEATURE_NOT_AVAILABLE = 'FEATURE_NOT_AVAILABLE',
  
  // External service errors
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  EXTERNAL_SERVICE_TIMEOUT = 'EXTERNAL_SERVICE_TIMEOUT',
  EXTERNAL_SERVICE_UNAVAILABLE = 'EXTERNAL_SERVICE_UNAVAILABLE',
  
  // Data errors
  DATA_INTEGRITY_ERROR = 'DATA_INTEGRITY_ERROR',
  DATA_CORRUPTION = 'DATA_CORRUPTION',
  DATABASE_ERROR = 'DATABASE_ERROR',
  
  // File errors
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNSUPPORTED_FILE_TYPE = 'UNSUPPORTED_FILE_TYPE',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',
}

/**
 * API error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code: ApiErrorCode,
    public statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

// =============================================================================
// VALIDATION ERROR TYPES
// =============================================================================

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

// =============================================================================
// RATE LIMITING TYPES
// =============================================================================

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

// =============================================================================
// HEALTH CHECK TYPES
// =============================================================================

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

// =============================================================================
// API VERSIONING TYPES
// =============================================================================

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

// =============================================================================
// WEBHOOK TYPES
// =============================================================================

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

// =============================================================================
// BULK OPERATIONS TYPES
// =============================================================================

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

// =============================================================================
// SEARCH TYPES
// =============================================================================

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

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

/**
 * API response schema
 */
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  errorCode: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.date(),
  requestId: z.string().optional(),
  version: z.string().optional(),
});

/**
 * Validation error detail schema
 */
export const ValidationErrorDetailSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string(),
  value: z.any().optional(),
});

/**
 * Rate limit info schema
 */
export const RateLimitInfoSchema = z.object({
  limit: z.number(),
  remaining: z.number(),
  reset: z.date(),
  retryAfter: z.number().optional(),
});

/**
 * Search request schema
 */
export const SearchRequestSchema = z.object({
  query: z.string(),
  filters: z.record(z.any()).optional(),
  sort: z.array(z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc']),
  })).optional(),
  pagination: z.object({
    page: z.number().min(1).optional(),
    limit: z.number().min(1).max(100).optional(),
    offset: z.number().min(0).optional(),
  }).optional(),
  highlight: z.object({
    fields: z.array(z.string()),
    fragmentSize: z.number().optional(),
    numberOfFragments: z.number().optional(),
  }).optional(),
  aggregations: z.record(z.any()).optional(),
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  requestId?: string
): ApiSuccessResponse<T> {
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
export function createErrorResponse(
  error: string,
  errorCode: ApiErrorCode,
  details?: Record<string, any>,
  requestId?: string
): ApiErrorResponse {
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
export function createValidationErrorResponse(
  errors: ValidationErrorDetail[],
  requestId?: string
): ValidationErrorResponse {
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
export function createRateLimitResponse(
  rateLimitInfo: RateLimitInfo,
  requestId?: string
): RateLimitResponse {
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
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
 * Check if response is an error
 */
export function isErrorResponse(
  response: ApiResponse
): response is ApiErrorResponse {
  return response.success === false;
}

/**
 * Extract error message from response
 */
export function getErrorMessage(response: ApiResponse): string {
  if (isErrorResponse(response)) {
    return response.error;
  }
  return 'Unknown error';
}

/**
 * Extract error code from response
 */
export function getErrorCode(response: ApiResponse): string | undefined {
  if (isErrorResponse(response)) {
    return response.errorCode;
  }
  return undefined;
}