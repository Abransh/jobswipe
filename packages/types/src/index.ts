/**
 * @fileoverview Global TypeScript types for JobSwipe
 * @description Common types and interfaces used across the entire application
 * @version 1.0.0
 * @author JobSwipe Team
 */

// =============================================================================
// GLOBAL UTILITY TYPES
// =============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
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
export type Brand<T, B> = T & { readonly __brand: B };

/**
 * Extract brand from branded type
 */
export type UnBrand<T> = T extends Brand<infer U, any> ? U : T;

/**
 * Strict object type that doesn't allow additional properties
 */
export type Strict<T> = T & { [K in Exclude<PropertyKey, keyof T>]: never };

/**
 * Extract function return type
 */
export type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (...args: any) => Promise<infer R> ? R : any;

/**
 * Extract array element type
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

/**
 * Make properties mutable (remove readonly)
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Make properties immutable (add readonly)
 */
export type Immutable<T> = {
  readonly [P in keyof T]: T[P];
};

/**
 * Flatten nested object types
 */
export type Flatten<T> = T extends object ? { [K in keyof T]: Flatten<T[K]> } : T;

/**
 * Create a union of all possible key paths in an object
 */
export type KeyPaths<T> = T extends object ? {
  [K in keyof T]: K extends string ? K | `${K}.${KeyPaths<T[K]>}` : never;
}[keyof T] : never;

/**
 * Get nested value type by key path
 */
export type GetByPath<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? GetByPath<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

// =============================================================================
// ENVIRONMENT TYPES
// =============================================================================

/**
 * Application environment
 */
export type Environment = 'development' | 'staging' | 'production' | 'test';

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

/**
 * MIME types
 */
export type MimeType = 
  | 'application/json'
  | 'application/xml'
  | 'application/pdf'
  | 'application/zip'
  | 'text/plain'
  | 'text/html'
  | 'text/csv'
  | 'image/jpeg'
  | 'image/png'
  | 'image/gif'
  | 'image/webp'
  | 'video/mp4'
  | 'audio/mp3';

// =============================================================================
// API TYPES
// =============================================================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}

/**
 * API error response
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  path?: string;
  timestamp: string;
  requestId?: string;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  cursor?: string;
}

/**
 * Pagination metadata
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
 * Paginated response
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

/**
 * ISO 8601 date string
 */
export type ISODateString = string;

/**
 * Unix timestamp
 */
export type UnixTimestamp = number;

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
  mimetype: MimeType;
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
  allowedTypes: MimeType[];
  allowedExtensions: string[];
  destination: string;
  generateThumbnails?: boolean;
}

/**
 * File upload result
 */
export interface FileUploadResult {
  success: boolean;
  file?: FileInfo;
  error?: string;
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
// NOTIFICATION TYPES
// =============================================================================

/**
 * Notification priority
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent' | 'critical';

/**
 * Notification channel
 */
export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app' | 'slack' | 'webhook';

/**
 * Notification type
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'job_match' | 'application_update' | 'interview_reminder' | 'system';

/**
 * Notification
 */
export interface Notification {
  id: string;
  type: NotificationType;
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
// AUDIT AND TRACKING TYPES
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

/**
 * Activity log entry
 */
export interface ActivityLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  error?: string;
}

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

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
// HEALTH CHECK TYPES
// =============================================================================

/**
 * Health check status
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

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
 * Application health check
 */
export interface ApplicationHealth {
  status: HealthStatus;
  timestamp: Date;
  services: ServiceHealth[];
  overall: {
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
  };
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

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  memoryUsage: number;
}

// =============================================================================
// QUEUE TYPES
// =============================================================================

/**
 * Queue job status
 */
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

/**
 * Queue job priority
 */
export type JobPriority = 'low' | 'normal' | 'high' | 'critical';

/**
 * Queue job
 */
export interface QueueJob<T = any> {
  id: string;
  type: string;
  data: T;
  priority: JobPriority;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  delay?: number;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  result?: any;
}

/**
 * Queue statistics
 */
export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled: number;
  total: number;
  throughput: number;
  averageProcessingTime: number;
}

// =============================================================================
// WEBSOCKET TYPES
// =============================================================================

/**
 * WebSocket message type
 */
export type WebSocketMessageType = 'ping' | 'pong' | 'subscribe' | 'unsubscribe' | 'notification' | 'error' | 'data';

/**
 * WebSocket message
 */
export interface WebSocketMessage<T = any> {
  id: string;
  type: WebSocketMessageType;
  data?: T;
  timestamp: Date;
  clientId?: string;
  channel?: string;
  error?: string;
}

/**
 * WebSocket connection info
 */
export interface WebSocketConnection {
  id: string;
  userId?: string;
  clientId: string;
  channels: string[];
  connectedAt: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
}

// =============================================================================
// EXPORT DEFAULTS
// =============================================================================

/**
 * Default type exports for convenience
 */
export type ID = string;
export type UUID = string;
export type Email = string;
export type URL = string;
export type PhoneNumber = string;
export type CurrencyCode = string;
export type CountryCode = string;
export type LanguageCode = string;
export type ColorHex = string;
export type Base64 = string;
export type JWT = string;
export type Hash = string;
export type Salt = string;