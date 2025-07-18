/**
 * @fileoverview Common types and interfaces for JobSwipe
 * @description Shared types used across the application
 * @version 1.0.0
 * @author JobSwipe Team
 */
import { z } from 'zod';
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
export type Brand<T, B> = T & {
    __brand: B;
};
/**
 * Extract brand from branded type
 */
export type UnBrand<T> = T extends Brand<infer U, any> ? U : T;
/**
 * Strict object type that doesn't allow additional properties
 */
export type Strict<T> = T & {
    [K in Exclude<PropertyKey, keyof T>]: never;
};
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
export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'regex' | 'exists' | 'null' | 'nnull';
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
export type TimePeriod = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
/**
 * Timezone information
 */
export interface TimezoneInfo {
    timezone: string;
    offset: number;
    abbreviation: string;
}
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
/**
 * Pagination parameters schema
 */
export declare const PaginationParamsSchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
    cursor: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page?: number | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    cursor?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    cursor?: string | undefined;
}>;
/**
 * Sort parameter schema
 */
export declare const SortParamSchema: z.ZodObject<{
    field: z.ZodString;
    direction: z.ZodEnum<["asc", "desc"]>;
}, "strip", z.ZodTypeAny, {
    field: string;
    direction: "asc" | "desc";
}, {
    field: string;
    direction: "asc" | "desc";
}>;
/**
 * Filter parameter schema
 */
export declare const FilterParamSchema: z.ZodObject<{
    field: z.ZodString;
    operator: z.ZodEnum<["eq", "neq", "gt", "gte", "lt", "lte", "in", "nin", "like", "regex", "exists", "null", "nnull"]>;
    value: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    field: string;
    operator: "null" | "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "like" | "regex" | "exists" | "nnull";
    value?: any;
}, {
    field: string;
    operator: "null" | "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "like" | "regex" | "exists" | "nnull";
    value?: any;
}>;
/**
 * Search parameters schema
 */
export declare const SearchParamsSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    filters: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        operator: z.ZodEnum<["eq", "neq", "gt", "gte", "lt", "lte", "in", "nin", "like", "regex", "exists", "null", "nnull"]>;
        value: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        field: string;
        operator: "null" | "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "like" | "regex" | "exists" | "nnull";
        value?: any;
    }, {
        field: string;
        operator: "null" | "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "like" | "regex" | "exists" | "nnull";
        value?: any;
    }>, "many">>;
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
        cursor: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        page?: number | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
        cursor?: string | undefined;
    }, {
        page?: number | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
        cursor?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    sort?: {
        field: string;
        direction: "asc" | "desc";
    }[] | undefined;
    query?: string | undefined;
    filters?: {
        field: string;
        operator: "null" | "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "like" | "regex" | "exists" | "nnull";
        value?: any;
    }[] | undefined;
    pagination?: {
        page?: number | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
        cursor?: string | undefined;
    } | undefined;
}, {
    sort?: {
        field: string;
        direction: "asc" | "desc";
    }[] | undefined;
    query?: string | undefined;
    filters?: {
        field: string;
        operator: "null" | "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "like" | "regex" | "exists" | "nnull";
        value?: any;
    }[] | undefined;
    pagination?: {
        page?: number | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
        cursor?: string | undefined;
    } | undefined;
}>;
/**
 * Date range schema
 */
export declare const DateRangeSchema: z.ZodObject<{
    from: z.ZodDate;
    to: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    from: Date;
    to: Date;
}, {
    from: Date;
    to: Date;
}>;
/**
 * Coordinates schema
 */
export declare const CoordinatesSchema: z.ZodObject<{
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    latitude: number;
    longitude: number;
}, {
    latitude: number;
    longitude: number;
}>;
/**
 * Address schema
 */
export declare const AddressSchema: z.ZodObject<{
    street: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodOptional<z.ZodString>;
    coordinates: z.ZodOptional<z.ZodObject<{
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        latitude: number;
        longitude: number;
    }, {
        latitude: number;
        longitude: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    street?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    country?: string | undefined;
    postalCode?: string | undefined;
    coordinates?: {
        latitude: number;
        longitude: number;
    } | undefined;
}, {
    street?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    country?: string | undefined;
    postalCode?: string | undefined;
    coordinates?: {
        latitude: number;
        longitude: number;
    } | undefined;
}>;
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
/**
 * Generic status enumeration
 */
export declare enum Status {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
    SUSPENDED = "suspended",
    DELETED = "deleted",
    ARCHIVED = "archived"
}
/**
 * Health check status
 */
export declare enum HealthStatus {
    HEALTHY = "healthy",
    DEGRADED = "degraded",
    UNHEALTHY = "unhealthy",
    UNKNOWN = "unknown"
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
/**
 * Notification priority
 */
export declare enum NotificationPriority {
    LOW = "low",
    NORMAL = "normal",
    HIGH = "high",
    URGENT = "urgent",
    CRITICAL = "critical"
}
/**
 * Notification channel
 */
export declare enum NotificationChannel {
    EMAIL = "email",
    SMS = "sms",
    PUSH = "push",
    IN_APP = "in_app",
    SLACK = "slack",
    WEBHOOK = "webhook"
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
//# sourceMappingURL=common.d.ts.map