/**
 * @fileoverview Common types and interfaces for JobSwipe
 * @description Shared types used across the application
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { z } from 'zod';

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make specific properties optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Create branded types for type safety
 */
export type Brand<T, B> = T & { __brand: B };

/**
 * Extract brand from branded type
 */
export type UnBrand<T> = T extends Brand<infer U, any> ? U : T;

/**
 * Strict object type that doesn't allow additional properties
 */
export type Strict<T> = T & { [K in Exclude<PropertyKey, keyof T>]: never };

// =============================================================================
// PAGINATION TYPES
// =============================================================================

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  cursor?: string;
}

/**
 * Pagination metadata for API responses
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// =============================================================================
// SORTING AND FILTERING TYPES
// =============================================================================

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort parameter
 */
export interface SortParam {
  field: string;
  direction: SortDirection;
}

/**
 * Filter operators
 */
export type FilterOperator = 
  | 'eq'     // equals
  | 'neq'    // not equals
  | 'gt'     // greater than
  | 'gte'    // greater than or equal
  | 'lt'     // less than
  | 'lte'    // less than or equal
  | 'in'     // in array
  | 'nin'    // not in array
  | 'like'   // contains (case-insensitive)
  | 'regex'  // regex match
  | 'exists' // field exists
  | 'null'   // field is null
  | 'nnull'; // field is not null

/**
 * Filter parameter
 */
export interface FilterParam {
  field: string;
  operator: FilterOperator;
  value: any;
}

/**
 * Search parameters
 */
export interface SearchParams {
  query?: string;
  filters?: FilterParam[];
  sort?: SortParam[];
  pagination?: PaginationParams;
}

// =============================================================================
// DATE AND TIME TYPES
// =============================================================================

/**
 * Date range
 */
export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Time period
 */
export type TimePeriod = 
  | 'hour'
  | 'day' 
  | 'week' 
  | 'month' 
  | 'quarter' 
  | 'year';

/**
 * Timezone information
 */
export interface TimezoneInfo {
  timezone: string;
  offset: number;
  abbreviation: string;
}

// =============================================================================
// FILE AND MEDIA TYPES
// =============================================================================

/**
 * File information
 */
export interface FileInfo {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Image information
 */
export interface ImageInfo extends FileInfo {
  width: number;
  height: number;
  aspectRatio: number;
  thumbnails?: {
    small: string;
    medium: string;
    large: string;
  };
}

/**
 * File upload configuration
 */
export interface FileUploadConfig {
  maxSize: number;
  allowedTypes: string[];
  allowedExtensions: string[];
  destination: string;
  generateThumbnails?: boolean;
}

// =============================================================================
// LOCATION TYPES
// =============================================================================

/**
 * Geographic coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Address information
 */
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  coordinates?: Coordinates;
}

/**
 * Location information
 */
export interface Location extends Address {
  name?: string;
  description?: string;
  timezone?: string;
}

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

/**
 * Pagination parameters schema
 */
export const PaginationParamsSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  cursor: z.string().optional(),
});

/**
 * Sort parameter schema
 */
export const SortParamSchema = z.object({
  field: z.string().min(1),
  direction: z.enum(['asc', 'desc']),
});

/**
 * Filter parameter schema
 */
export const FilterParamSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'like', 'regex', 'exists', 'null', 'nnull']),
  value: z.any(),
});

/**
 * Search parameters schema
 */
export const SearchParamsSchema = z.object({
  query: z.string().optional(),
  filters: z.array(FilterParamSchema).optional(),
  sort: z.array(SortParamSchema).optional(),
  pagination: PaginationParamsSchema.optional(),
});

/**
 * Date range schema
 */
export const DateRangeSchema = z.object({
  from: z.date(),
  to: z.date(),
});

/**
 * Coordinates schema
 */
export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

/**
 * Address schema
 */
export const AddressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  coordinates: CoordinatesSchema.optional(),
});

// =============================================================================
// ENVIRONMENT TYPES
// =============================================================================

/**
 * Environment configuration
 */
export type Environment = 'development' | 'staging' | 'production' | 'test';

/**
 * Feature flags
 */
export interface FeatureFlags {
  [key: string]: boolean;
}

/**
 * Application configuration
 */
export interface AppConfig {
  environment: Environment;
  version: string;
  buildNumber: string;
  buildDate: Date;
  features: FeatureFlags;
  maintenance?: {
    enabled: boolean;
    message?: string;
    estimatedDuration?: number;
  };
}

// =============================================================================
// STATUS TYPES
// =============================================================================

/**
 * Generic status enumeration
 */
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
  ARCHIVED = 'archived',
}

/**
 * Health check status
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown',
}

/**
 * Service health check
 */
export interface ServiceHealth {
  name: string;
  status: HealthStatus;
  version?: string;
  uptime?: number;
  responseTime?: number;
  lastCheck: Date;
  dependencies?: ServiceHealth[];
  details?: Record<string, any>;
}

// =============================================================================
// METADATA TYPES
// =============================================================================

/**
 * Audit metadata
 */
export interface AuditMetadata {
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  source?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Soft delete metadata
 */
export interface SoftDeleteMetadata {
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  deleteReason?: string;
}

/**
 * Versioning metadata
 */
export interface VersionMetadata {
  version: number;
  previousVersion?: number;
  changes?: string[];
  changelog?: string;
}

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================

/**
 * Notification priority
 */
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

/**
 * Notification channel
 */
export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  SLACK = 'slack',
  WEBHOOK = 'webhook',
}

/**
 * Notification
 */
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  channel: NotificationChannel;
  recipient: string;
  data?: Record<string, any>;
  scheduledAt?: Date;
  sentAt?: Date;
  readAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

// =============================================================================
// CACHE TYPES
// =============================================================================

/**
 * Cache configuration
 */
export interface CacheConfig {
  ttl: number;
  maxKeys?: number;
  strategy?: 'lru' | 'fifo' | 'lfu';
  compress?: boolean;
  namespace?: string;
}

/**
 * Cache entry
 */
export interface CacheEntry<T> {
  key: string;
  value: T;
  ttl: number;
  createdAt: Date;
  expiresAt: Date;
  hitCount: number;
  lastAccessed: Date;
}