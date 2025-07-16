/**
 * @fileoverview Constants for JobSwipe application
 * @description Shared constants used across the application
 * @version 1.0.0
 * @author JobSwipe Team
 */

// =============================================================================
// APPLICATION CONSTANTS
// =============================================================================

/**
 * Application name and branding
 */
export const APP_NAME = 'JobSwipe';
export const APP_TAGLINE = 'Swipe Your Way to Success';
export const APP_DESCRIPTION = 'Enterprise job application automation platform';
export const APP_URL = 'https://jobswipe.com';
export const APP_SUPPORT_EMAIL = 'support@jobswipe.com';

/**
 * Application version information
 */
export const APP_VERSION = '1.0.0';
export const API_VERSION = 'v1';
export const MIN_SUPPORTED_VERSION = '1.0.0';

/**
 * Environment constants
 */
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

export type Environment = typeof ENVIRONMENTS[keyof typeof ENVIRONMENTS];

// =============================================================================
// AUTHENTICATION CONSTANTS
// =============================================================================

/**
 * JWT configuration
 */
export const JWT_CONFIG = {
  ALGORITHM: 'RS256',
  ISSUER: 'jobswipe.com',
  AUDIENCE: 'jobswipe-api',
  ACCESS_TOKEN_EXPIRY: 15 * 60, // 15 minutes
  REFRESH_TOKEN_EXPIRY: 30 * 24 * 60 * 60, // 30 days
  DESKTOP_TOKEN_EXPIRY: 90 * 24 * 60 * 60, // 90 days
  VERIFICATION_TOKEN_EXPIRY: 24 * 60 * 60, // 24 hours
  PASSWORD_RESET_TOKEN_EXPIRY: 2 * 60 * 60, // 2 hours
} as const;

/**
 * Session configuration
 */
export const SESSION_CONFIG = {
  TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_SESSIONS_PER_USER: 5,
  CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour
  EXTEND_ON_ACTIVITY: true,
} as const;

/**
 * Password requirements
 */
export const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SYMBOLS: false,
  BCRYPT_ROUNDS: 12,
  HISTORY_COUNT: 5, // Remember last 5 passwords
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  LOGIN: {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
  },
  REGISTRATION: {
    MAX_ATTEMPTS: 3,
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
  },
  PASSWORD_RESET: {
    MAX_ATTEMPTS: 3,
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
  },
  TOKEN_REFRESH: {
    MAX_ATTEMPTS: 10,
    WINDOW_MS: 60 * 1000, // 1 minute
  },
  API_GENERAL: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 60 * 1000, // 1 minute
  },
} as const;

/**
 * Two-factor authentication
 */
export const TWO_FACTOR_CONFIG = {
  TOTP_WINDOW: 1,
  TOTP_STEP: 30,
  BACKUP_CODES_COUNT: 10,
  SMS_RETRY_DELAY: 60 * 1000, // 1 minute
  EMAIL_RETRY_DELAY: 2 * 60 * 1000, // 2 minutes
} as const;

// =============================================================================
// API CONSTANTS
// =============================================================================

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * API response formats
 */
export const API_RESPONSE_FORMAT = {
  SUCCESS: 'success',
  ERROR: 'error',
  VALIDATION_ERROR: 'validation_error',
} as const;

/**
 * Content types
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  XML: 'application/xml',
  HTML: 'text/html',
  TEXT: 'text/plain',
  CSV: 'text/csv',
  PDF: 'application/pdf',
  ZIP: 'application/zip',
} as const;

/**
 * Cache durations (in seconds)
 */
export const CACHE_DURATIONS = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 2 * 60 * 60, // 2 hours
  VERY_LONG: 24 * 60 * 60, // 24 hours
  PERMANENT: 365 * 24 * 60 * 60, // 1 year
} as const;

// =============================================================================
// PAGINATION CONSTANTS
// =============================================================================

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0,
} as const;

/**
 * Sorting options
 */
export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type SortDirection = typeof SORT_DIRECTIONS[keyof typeof SORT_DIRECTIONS];

// =============================================================================
// FILE UPLOAD CONSTANTS
// =============================================================================

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  AVATAR: 2 * 1024 * 1024, // 2MB
  RESUME: 10 * 1024 * 1024, // 10MB
  COVER_LETTER: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 25 * 1024 * 1024, // 25MB
  IMAGE: 5 * 1024 * 1024, // 5MB
  VIDEO: 100 * 1024 * 1024, // 100MB
} as const;

/**
 * Allowed file types
 */
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  RESUME: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  AVATAR: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ARCHIVE: ['application/zip', 'application/x-rar-compressed', 'application/x-tar'],
} as const;

/**
 * File extensions
 */
export const FILE_EXTENSIONS = {
  IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  DOCUMENT: ['.pdf', '.doc', '.docx'],
  RESUME: ['.pdf', '.doc', '.docx'],
  ARCHIVE: ['.zip', '.rar', '.tar'],
} as const;

// =============================================================================
// NOTIFICATION CONSTANTS
// =============================================================================

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  JOB_MATCH: 'job_match',
  APPLICATION_UPDATE: 'application_update',
  INTERVIEW_REMINDER: 'interview_reminder',
  SYSTEM: 'system',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

/**
 * Notification channels
 */
export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app',
  SLACK: 'slack',
  WEBHOOK: 'webhook',
} as const;

export type NotificationChannel = typeof NOTIFICATION_CHANNELS[keyof typeof NOTIFICATION_CHANNELS];

/**
 * Notification priorities
 */
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical',
} as const;

export type NotificationPriority = typeof NOTIFICATION_PRIORITIES[keyof typeof NOTIFICATION_PRIORITIES];

// =============================================================================
// JOB CONSTANTS
// =============================================================================

/**
 * Job types
 */
export const JOB_TYPES = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  CONTRACT: 'contract',
  FREELANCE: 'freelance',
  INTERNSHIP: 'internship',
  TEMPORARY: 'temporary',
  VOLUNTEER: 'volunteer',
} as const;

export type JobType = typeof JOB_TYPES[keyof typeof JOB_TYPES];

/**
 * Job experience levels
 */
export const JOB_LEVELS = {
  ENTRY: 'entry',
  JUNIOR: 'junior',
  MID: 'mid',
  SENIOR: 'senior',
  LEAD: 'lead',
  MANAGER: 'manager',
  DIRECTOR: 'director',
  EXECUTIVE: 'executive',
} as const;

export type JobLevel = typeof JOB_LEVELS[keyof typeof JOB_LEVELS];

/**
 * Remote work types
 */
export const REMOTE_TYPES = {
  ONSITE: 'onsite',
  REMOTE: 'remote',
  HYBRID: 'hybrid',
  FLEXIBLE: 'flexible',
} as const;

export type RemoteType = typeof REMOTE_TYPES[keyof typeof REMOTE_TYPES];

/**
 * Job application statuses
 */
export const APPLICATION_STATUSES = {
  DRAFT: 'draft',
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  INTERVIEWED: 'interviewed',
  OFFER_RECEIVED: 'offer_received',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
} as const;

export type ApplicationStatus = typeof APPLICATION_STATUSES[keyof typeof APPLICATION_STATUSES];

/**
 * Job sources
 */
export const JOB_SOURCES = {
  MANUAL: 'manual',
  LINKEDIN: 'linkedin',
  INDEED: 'indeed',
  GLASSDOOR: 'glassdoor',
  COMPANY_WEBSITE: 'company_website',
  RECRUITER: 'recruiter',
  REFERRAL: 'referral',
} as const;

export type JobSource = typeof JOB_SOURCES[keyof typeof JOB_SOURCES];

// =============================================================================
// SUBSCRIPTION CONSTANTS
// =============================================================================

/**
 * Subscription plans
 */
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
} as const;

export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS];

/**
 * Subscription statuses
 */
export const SUBSCRIPTION_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  SUSPENDED: 'suspended',
  TRIAL: 'trial',
} as const;

export type SubscriptionStatus = typeof SUBSCRIPTION_STATUSES[keyof typeof SUBSCRIPTION_STATUSES];

/**
 * Plan limits
 */
export const PLAN_LIMITS = {
  [SUBSCRIPTION_PLANS.FREE]: {
    APPLICATIONS_PER_MONTH: 5,
    RESUME_TEMPLATES: 1,
    SAVED_JOBS: 10,
    AUTOMATION_ENABLED: false,
    PRIORITY_SUPPORT: false,
  },
  [SUBSCRIPTION_PLANS.BASIC]: {
    APPLICATIONS_PER_MONTH: 25,
    RESUME_TEMPLATES: 3,
    SAVED_JOBS: 50,
    AUTOMATION_ENABLED: true,
    PRIORITY_SUPPORT: false,
  },
  [SUBSCRIPTION_PLANS.PRO]: {
    APPLICATIONS_PER_MONTH: 100,
    RESUME_TEMPLATES: 10,
    SAVED_JOBS: 200,
    AUTOMATION_ENABLED: true,
    PRIORITY_SUPPORT: true,
  },
  [SUBSCRIPTION_PLANS.PREMIUM]: {
    APPLICATIONS_PER_MONTH: 500,
    RESUME_TEMPLATES: 50,
    SAVED_JOBS: 1000,
    AUTOMATION_ENABLED: true,
    PRIORITY_SUPPORT: true,
  },
  [SUBSCRIPTION_PLANS.ENTERPRISE]: {
    APPLICATIONS_PER_MONTH: -1, // Unlimited
    RESUME_TEMPLATES: -1, // Unlimited
    SAVED_JOBS: -1, // Unlimited
    AUTOMATION_ENABLED: true,
    PRIORITY_SUPPORT: true,
  },
} as const;

// =============================================================================
// VALIDATION CONSTANTS
// =============================================================================

/**
 * Validation rules
 */
export const VALIDATION_RULES = {
  EMAIL: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 255,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z\s\-'\.]+$/,
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 20,
    PATTERN: /^\+?[\d\s\-\(\)\.]+$/,
  },
  URL: {
    PATTERN: /^https?:\/\/.+/,
  },
  SLUG: {
    PATTERN: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  },
} as const;

/**
 * Input sanitization patterns
 */
export const SANITIZATION_PATTERNS = {
  HTML_TAGS: /<[^>]*>/g,
  SCRIPT_TAGS: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  SQL_INJECTION: /['";\\]/g,
  XSS_BASIC: /[<>\"']/g,
  WHITESPACE: /\s+/g,
} as const;

// =============================================================================
// UI CONSTANTS
// =============================================================================

/**
 * Theme colors
 */
export const THEME_COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#64748b',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#06b6d4',
  LIGHT: '#f8fafc',
  DARK: '#0f172a',
} as const;

/**
 * Breakpoints
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
} as const;

/**
 * Z-index layers
 */
export const Z_INDEX = {
  DROPDOWN: 1000,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
  LOADING: 1090,
} as const;

// =============================================================================
// REGEX PATTERNS
// =============================================================================

/**
 * Common regex patterns
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/,
  PHONE: /^\+?[\d\s\-\(\)\.]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  NUMERIC: /^[0-9]+$/,
  ALPHABETIC: /^[a-zA-Z]+$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  IP_ADDRESS: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  CREDIT_CARD: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/,
  SOCIAL_SECURITY: /^\d{3}-?\d{2}-?\d{4}$/,
  POSTAL_CODE: /^\d{5}(-\d{4})?$/,
} as const;

// =============================================================================
// ERROR MESSAGES
// =============================================================================

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_PHONE: 'Please enter a valid phone number',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
  PASSWORD_TOO_WEAK: 'Password must contain uppercase, lowercase, and numbers',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File is too large',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'Internal server error',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  MAINTENANCE: 'System is under maintenance. Please try again later.',
} as const;

// =============================================================================
// SUCCESS MESSAGES
// =============================================================================

/**
 * Common success messages
 */
export const SUCCESS_MESSAGES = {
  CREATED: 'Successfully created',
  UPDATED: 'Successfully updated',
  DELETED: 'Successfully deleted',
  SAVED: 'Successfully saved',
  SENT: 'Successfully sent',
  UPLOADED: 'Successfully uploaded',
  LOGGED_IN: 'Successfully logged in',
  LOGGED_OUT: 'Successfully logged out',
  REGISTERED: 'Successfully registered',
  PASSWORD_CHANGED: 'Password successfully changed',
  EMAIL_VERIFIED: 'Email successfully verified',
  PROFILE_UPDATED: 'Profile successfully updated',
  SETTINGS_SAVED: 'Settings successfully saved',
} as const;

// =============================================================================
// FEATURE FLAGS
// =============================================================================

/**
 * Feature flags
 */
export const FEATURE_FLAGS = {
  DESKTOP_APP: 'desktop_app',
  MOBILE_APP: 'mobile_app',
  AUTOMATION: 'automation',
  AI_RESUME_BUILDER: 'ai_resume_builder',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  TEAM_COLLABORATION: 'team_collaboration',
  WHITE_LABEL: 'white_label',
  API_ACCESS: 'api_access',
  WEBHOOKS: 'webhooks',
  SSO: 'sso',
  CUSTOM_BRANDING: 'custom_branding',
  PRIORITY_SUPPORT: 'priority_support',
} as const;

export type FeatureFlag = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS];

// =============================================================================
// DATETIME CONSTANTS
// =============================================================================

/**
 * Time constants
 */
export const TIME_CONSTANTS = {
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  DAYS_PER_WEEK: 7,
  DAYS_PER_MONTH: 30,
  DAYS_PER_YEAR: 365,
} as const;

/**
 * Date formats
 */
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  ISO_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss',
  US: 'MM/DD/YYYY',
  EU: 'DD/MM/YYYY',
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
  TIME_ONLY: 'HH:mm',
  TIME_WITH_SECONDS: 'HH:mm:ss',
} as const;

// =============================================================================
// LOCALIZATION CONSTANTS
// =============================================================================

/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de',
  IT: 'it',
  PT: 'pt',
  ZH: 'zh',
  JA: 'ja',
  KO: 'ko',
  RU: 'ru',
} as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[keyof typeof SUPPORTED_LANGUAGES];

/**
 * Supported currencies
 */
export const SUPPORTED_CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  JPY: 'JPY',
  CAD: 'CAD',
  AUD: 'AUD',
  CHF: 'CHF',
  CNY: 'CNY',
  SEK: 'SEK',
  NOK: 'NOK',
} as const;

export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[keyof typeof SUPPORTED_CURRENCIES];

// =============================================================================
// SECURITY CONSTANTS
// =============================================================================

/**
 * Security headers
 */
export const SECURITY_HEADERS = {
  CONTENT_TYPE_OPTIONS: 'X-Content-Type-Options',
  FRAME_OPTIONS: 'X-Frame-Options',
  XSS_PROTECTION: 'X-XSS-Protection',
  HSTS: 'Strict-Transport-Security',
  CSP: 'Content-Security-Policy',
  REFERRER_POLICY: 'Referrer-Policy',
  PERMISSIONS_POLICY: 'Permissions-Policy',
} as const;

/**
 * Encryption algorithms
 */
export const ENCRYPTION_ALGORITHMS = {
  AES_256_GCM: 'aes-256-gcm',
  AES_256_CBC: 'aes-256-cbc',
  RSA_OAEP: 'rsa-oaep',
  PBKDF2: 'pbkdf2',
  BCRYPT: 'bcrypt',
  SCRYPT: 'scrypt',
} as const;

/**
 * Hash algorithms
 */
export const HASH_ALGORITHMS = {
  SHA256: 'sha256',
  SHA512: 'sha512',
  MD5: 'md5',
  BLAKE2B: 'blake2b',
} as const;

// =============================================================================
// EXPORT ALL CONSTANTS
// =============================================================================

export default {
  APP_NAME,
  APP_VERSION,
  ENVIRONMENTS,
  JWT_CONFIG,
  SESSION_CONFIG,
  PASSWORD_CONFIG,
  RATE_LIMITS,
  HTTP_STATUS,
  PAGINATION,
  FILE_SIZE_LIMITS,
  NOTIFICATION_TYPES,
  JOB_TYPES,
  APPLICATION_STATUSES,
  SUBSCRIPTION_PLANS,
  VALIDATION_RULES,
  THEME_COLORS,
  REGEX_PATTERNS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURE_FLAGS,
  TIME_CONSTANTS,
  SUPPORTED_LANGUAGES,
  SECURITY_HEADERS,
};