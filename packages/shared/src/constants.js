"use strict";
/**
 * @fileoverview Constants for JobSwipe application
 * @description Shared constants used across the application
 * @version 1.0.0
 * @author JobSwipe Team
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HASH_ALGORITHMS = exports.ENCRYPTION_ALGORITHMS = exports.SECURITY_HEADERS = exports.SUPPORTED_CURRENCIES = exports.SUPPORTED_LANGUAGES = exports.DATE_FORMATS = exports.TIME_CONSTANTS = exports.FEATURE_FLAGS = exports.SUCCESS_MESSAGES = exports.ERROR_MESSAGES = exports.REGEX_PATTERNS = exports.Z_INDEX = exports.BREAKPOINTS = exports.THEME_COLORS = exports.SANITIZATION_PATTERNS = exports.VALIDATION_RULES = exports.PLAN_LIMITS = exports.SUBSCRIPTION_STATUSES = exports.SUBSCRIPTION_PLANS = exports.JOB_SOURCES = exports.APPLICATION_STATUSES = exports.REMOTE_TYPES = exports.JOB_LEVELS = exports.JOB_TYPES = exports.NOTIFICATION_PRIORITIES = exports.NOTIFICATION_CHANNELS = exports.NOTIFICATION_TYPES = exports.FILE_EXTENSIONS = exports.ALLOWED_FILE_TYPES = exports.FILE_SIZE_LIMITS = exports.SORT_DIRECTIONS = exports.PAGINATION = exports.CACHE_DURATIONS = exports.CONTENT_TYPES = exports.API_RESPONSE_FORMAT = exports.HTTP_STATUS = exports.TWO_FACTOR_CONFIG = exports.RATE_LIMITS = exports.PASSWORD_CONFIG = exports.SESSION_CONFIG = exports.JWT_CONFIG = exports.ENVIRONMENTS = exports.MIN_SUPPORTED_VERSION = exports.API_VERSION = exports.APP_VERSION = exports.APP_SUPPORT_EMAIL = exports.APP_URL = exports.APP_DESCRIPTION = exports.APP_TAGLINE = exports.APP_NAME = void 0;
// =============================================================================
// APPLICATION CONSTANTS
// =============================================================================
/**
 * Application name and branding
 */
exports.APP_NAME = 'JobSwipe';
exports.APP_TAGLINE = 'Swipe Your Way to Success';
exports.APP_DESCRIPTION = 'Enterprise job application automation platform';
exports.APP_URL = 'https://jobswipe.com';
exports.APP_SUPPORT_EMAIL = 'support@jobswipe.com';
/**
 * Application version information
 */
exports.APP_VERSION = '1.0.0';
exports.API_VERSION = 'v1';
exports.MIN_SUPPORTED_VERSION = '1.0.0';
/**
 * Environment constants
 */
exports.ENVIRONMENTS = {
    DEVELOPMENT: 'development',
    STAGING: 'staging',
    PRODUCTION: 'production',
    TEST: 'test',
};
// =============================================================================
// AUTHENTICATION CONSTANTS
// =============================================================================
/**
 * JWT configuration
 */
exports.JWT_CONFIG = {
    ALGORITHM: 'RS256',
    ISSUER: 'jobswipe.com',
    AUDIENCE: 'jobswipe-api',
    ACCESS_TOKEN_EXPIRY: 15 * 60, // 15 minutes
    REFRESH_TOKEN_EXPIRY: 30 * 24 * 60 * 60, // 30 days
    DESKTOP_TOKEN_EXPIRY: 90 * 24 * 60 * 60, // 90 days
    VERIFICATION_TOKEN_EXPIRY: 24 * 60 * 60, // 24 hours
    PASSWORD_RESET_TOKEN_EXPIRY: 2 * 60 * 60, // 2 hours
};
/**
 * Session configuration
 */
exports.SESSION_CONFIG = {
    TIMEOUT: 30 * 60 * 1000, // 30 minutes
    MAX_SESSIONS_PER_USER: 5,
    CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour
    EXTEND_ON_ACTIVITY: true,
};
/**
 * Password requirements
 */
exports.PASSWORD_CONFIG = {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: false,
    BCRYPT_ROUNDS: 12,
    HISTORY_COUNT: 5, // Remember last 5 passwords
};
/**
 * Rate limiting configuration
 */
exports.RATE_LIMITS = {
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
};
/**
 * Two-factor authentication
 */
exports.TWO_FACTOR_CONFIG = {
    TOTP_WINDOW: 1,
    TOTP_STEP: 30,
    BACKUP_CODES_COUNT: 10,
    SMS_RETRY_DELAY: 60 * 1000, // 1 minute
    EMAIL_RETRY_DELAY: 2 * 60 * 1000, // 2 minutes
};
// =============================================================================
// API CONSTANTS
// =============================================================================
/**
 * HTTP status codes
 */
exports.HTTP_STATUS = {
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
};
/**
 * API response formats
 */
exports.API_RESPONSE_FORMAT = {
    SUCCESS: 'success',
    ERROR: 'error',
    VALIDATION_ERROR: 'validation_error',
};
/**
 * Content types
 */
exports.CONTENT_TYPES = {
    JSON: 'application/json',
    XML: 'application/xml',
    HTML: 'text/html',
    TEXT: 'text/plain',
    CSV: 'text/csv',
    PDF: 'application/pdf',
    ZIP: 'application/zip',
};
/**
 * Cache durations (in seconds)
 */
exports.CACHE_DURATIONS = {
    SHORT: 5 * 60, // 5 minutes
    MEDIUM: 30 * 60, // 30 minutes
    LONG: 2 * 60 * 60, // 2 hours
    VERY_LONG: 24 * 60 * 60, // 24 hours
    PERMANENT: 365 * 24 * 60 * 60, // 1 year
};
// =============================================================================
// PAGINATION CONSTANTS
// =============================================================================
/**
 * Pagination defaults
 */
exports.PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    DEFAULT_OFFSET: 0,
};
/**
 * Sorting options
 */
exports.SORT_DIRECTIONS = {
    ASC: 'asc',
    DESC: 'desc',
};
// =============================================================================
// FILE UPLOAD CONSTANTS
// =============================================================================
/**
 * File size limits (in bytes)
 */
exports.FILE_SIZE_LIMITS = {
    AVATAR: 2 * 1024 * 1024, // 2MB
    RESUME: 10 * 1024 * 1024, // 10MB
    COVER_LETTER: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 25 * 1024 * 1024, // 25MB
    IMAGE: 5 * 1024 * 1024, // 5MB
    VIDEO: 100 * 1024 * 1024, // 100MB
};
/**
 * Allowed file types
 */
exports.ALLOWED_FILE_TYPES = {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    RESUME: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    AVATAR: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ARCHIVE: ['application/zip', 'application/x-rar-compressed', 'application/x-tar'],
};
/**
 * File extensions
 */
exports.FILE_EXTENSIONS = {
    IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    DOCUMENT: ['.pdf', '.doc', '.docx'],
    RESUME: ['.pdf', '.doc', '.docx'],
    ARCHIVE: ['.zip', '.rar', '.tar'],
};
// =============================================================================
// NOTIFICATION CONSTANTS
// =============================================================================
/**
 * Notification types
 */
exports.NOTIFICATION_TYPES = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    JOB_MATCH: 'job_match',
    APPLICATION_UPDATE: 'application_update',
    INTERVIEW_REMINDER: 'interview_reminder',
    SYSTEM: 'system',
};
/**
 * Notification channels
 */
exports.NOTIFICATION_CHANNELS = {
    EMAIL: 'email',
    SMS: 'sms',
    PUSH: 'push',
    IN_APP: 'in_app',
    SLACK: 'slack',
    WEBHOOK: 'webhook',
};
/**
 * Notification priorities
 */
exports.NOTIFICATION_PRIORITIES = {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent',
    CRITICAL: 'critical',
};
// =============================================================================
// JOB CONSTANTS
// =============================================================================
/**
 * Job types
 */
exports.JOB_TYPES = {
    FULL_TIME: 'full_time',
    PART_TIME: 'part_time',
    CONTRACT: 'contract',
    FREELANCE: 'freelance',
    INTERNSHIP: 'internship',
    TEMPORARY: 'temporary',
    VOLUNTEER: 'volunteer',
};
/**
 * Job experience levels
 */
exports.JOB_LEVELS = {
    ENTRY: 'entry',
    JUNIOR: 'junior',
    MID: 'mid',
    SENIOR: 'senior',
    LEAD: 'lead',
    MANAGER: 'manager',
    DIRECTOR: 'director',
    EXECUTIVE: 'executive',
};
/**
 * Remote work types
 */
exports.REMOTE_TYPES = {
    ONSITE: 'onsite',
    REMOTE: 'remote',
    HYBRID: 'hybrid',
    FLEXIBLE: 'flexible',
};
/**
 * Job application statuses
 */
exports.APPLICATION_STATUSES = {
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
};
/**
 * Job sources
 */
exports.JOB_SOURCES = {
    MANUAL: 'manual',
    LINKEDIN: 'linkedin',
    INDEED: 'indeed',
    GLASSDOOR: 'glassdoor',
    COMPANY_WEBSITE: 'company_website',
    RECRUITER: 'recruiter',
    REFERRAL: 'referral',
};
// =============================================================================
// SUBSCRIPTION CONSTANTS
// =============================================================================
/**
 * Subscription plans
 */
exports.SUBSCRIPTION_PLANS = {
    FREE: 'free',
    BASIC: 'basic',
    PRO: 'pro',
    PREMIUM: 'premium',
    ENTERPRISE: 'enterprise',
};
/**
 * Subscription statuses
 */
exports.SUBSCRIPTION_STATUSES = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
    SUSPENDED: 'suspended',
    TRIAL: 'trial',
};
/**
 * Plan limits
 */
exports.PLAN_LIMITS = {
    [exports.SUBSCRIPTION_PLANS.FREE]: {
        APPLICATIONS_PER_MONTH: 5,
        RESUME_TEMPLATES: 1,
        SAVED_JOBS: 10,
        AUTOMATION_ENABLED: false,
        PRIORITY_SUPPORT: false,
    },
    [exports.SUBSCRIPTION_PLANS.BASIC]: {
        APPLICATIONS_PER_MONTH: 25,
        RESUME_TEMPLATES: 3,
        SAVED_JOBS: 50,
        AUTOMATION_ENABLED: true,
        PRIORITY_SUPPORT: false,
    },
    [exports.SUBSCRIPTION_PLANS.PRO]: {
        APPLICATIONS_PER_MONTH: 100,
        RESUME_TEMPLATES: 10,
        SAVED_JOBS: 200,
        AUTOMATION_ENABLED: true,
        PRIORITY_SUPPORT: true,
    },
    [exports.SUBSCRIPTION_PLANS.PREMIUM]: {
        APPLICATIONS_PER_MONTH: 500,
        RESUME_TEMPLATES: 50,
        SAVED_JOBS: 1000,
        AUTOMATION_ENABLED: true,
        PRIORITY_SUPPORT: true,
    },
    [exports.SUBSCRIPTION_PLANS.ENTERPRISE]: {
        APPLICATIONS_PER_MONTH: -1, // Unlimited
        RESUME_TEMPLATES: -1, // Unlimited
        SAVED_JOBS: -1, // Unlimited
        AUTOMATION_ENABLED: true,
        PRIORITY_SUPPORT: true,
    },
};
// =============================================================================
// VALIDATION CONSTANTS
// =============================================================================
/**
 * Validation rules
 */
exports.VALIDATION_RULES = {
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
};
/**
 * Input sanitization patterns
 */
exports.SANITIZATION_PATTERNS = {
    HTML_TAGS: /<[^>]*>/g,
    SCRIPT_TAGS: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    SQL_INJECTION: /['";\\]/g,
    XSS_BASIC: /[<>\"']/g,
    WHITESPACE: /\s+/g,
};
// =============================================================================
// UI CONSTANTS
// =============================================================================
/**
 * Theme colors
 */
exports.THEME_COLORS = {
    PRIMARY: '#3b82f6',
    SECONDARY: '#64748b',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#06b6d4',
    LIGHT: '#f8fafc',
    DARK: '#0f172a',
};
/**
 * Breakpoints
 */
exports.BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536,
};
/**
 * Z-index layers
 */
exports.Z_INDEX = {
    DROPDOWN: 1000,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    TOAST: 1080,
    LOADING: 1090,
};
// =============================================================================
// REGEX PATTERNS
// =============================================================================
/**
 * Common regex patterns
 */
exports.REGEX_PATTERNS = {
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
};
// =============================================================================
// ERROR MESSAGES
// =============================================================================
/**
 * Common error messages
 */
exports.ERROR_MESSAGES = {
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
};
// =============================================================================
// SUCCESS MESSAGES
// =============================================================================
/**
 * Common success messages
 */
exports.SUCCESS_MESSAGES = {
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
};
// =============================================================================
// FEATURE FLAGS
// =============================================================================
/**
 * Feature flags
 */
exports.FEATURE_FLAGS = {
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
};
// =============================================================================
// DATETIME CONSTANTS
// =============================================================================
/**
 * Time constants
 */
exports.TIME_CONSTANTS = {
    MILLISECONDS_PER_SECOND: 1000,
    SECONDS_PER_MINUTE: 60,
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24,
    DAYS_PER_WEEK: 7,
    DAYS_PER_MONTH: 30,
    DAYS_PER_YEAR: 365,
};
/**
 * Date formats
 */
exports.DATE_FORMATS = {
    ISO: 'YYYY-MM-DD',
    ISO_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss',
    US: 'MM/DD/YYYY',
    EU: 'DD/MM/YYYY',
    DISPLAY: 'MMM DD, YYYY',
    DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
    TIME_ONLY: 'HH:mm',
    TIME_WITH_SECONDS: 'HH:mm:ss',
};
// =============================================================================
// LOCALIZATION CONSTANTS
// =============================================================================
/**
 * Supported languages
 */
exports.SUPPORTED_LANGUAGES = {
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
};
/**
 * Supported currencies
 */
exports.SUPPORTED_CURRENCIES = {
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
};
// =============================================================================
// SECURITY CONSTANTS
// =============================================================================
/**
 * Security headers
 */
exports.SECURITY_HEADERS = {
    CONTENT_TYPE_OPTIONS: 'X-Content-Type-Options',
    FRAME_OPTIONS: 'X-Frame-Options',
    XSS_PROTECTION: 'X-XSS-Protection',
    HSTS: 'Strict-Transport-Security',
    CSP: 'Content-Security-Policy',
    REFERRER_POLICY: 'Referrer-Policy',
    PERMISSIONS_POLICY: 'Permissions-Policy',
};
/**
 * Encryption algorithms
 */
exports.ENCRYPTION_ALGORITHMS = {
    AES_256_GCM: 'aes-256-gcm',
    AES_256_CBC: 'aes-256-cbc',
    RSA_OAEP: 'rsa-oaep',
    PBKDF2: 'pbkdf2',
    BCRYPT: 'bcrypt',
    SCRYPT: 'scrypt',
};
/**
 * Hash algorithms
 */
exports.HASH_ALGORITHMS = {
    SHA256: 'sha256',
    SHA512: 'sha512',
    MD5: 'md5',
    BLAKE2B: 'blake2b',
};
// =============================================================================
// EXPORT ALL CONSTANTS
// =============================================================================
exports.default = {
    APP_NAME: exports.APP_NAME,
    APP_VERSION: exports.APP_VERSION,
    ENVIRONMENTS: exports.ENVIRONMENTS,
    JWT_CONFIG: exports.JWT_CONFIG,
    SESSION_CONFIG: exports.SESSION_CONFIG,
    PASSWORD_CONFIG: exports.PASSWORD_CONFIG,
    RATE_LIMITS: exports.RATE_LIMITS,
    HTTP_STATUS: exports.HTTP_STATUS,
    PAGINATION: exports.PAGINATION,
    FILE_SIZE_LIMITS: exports.FILE_SIZE_LIMITS,
    NOTIFICATION_TYPES: exports.NOTIFICATION_TYPES,
    JOB_TYPES: exports.JOB_TYPES,
    APPLICATION_STATUSES: exports.APPLICATION_STATUSES,
    SUBSCRIPTION_PLANS: exports.SUBSCRIPTION_PLANS,
    VALIDATION_RULES: exports.VALIDATION_RULES,
    THEME_COLORS: exports.THEME_COLORS,
    REGEX_PATTERNS: exports.REGEX_PATTERNS,
    ERROR_MESSAGES: exports.ERROR_MESSAGES,
    SUCCESS_MESSAGES: exports.SUCCESS_MESSAGES,
    FEATURE_FLAGS: exports.FEATURE_FLAGS,
    TIME_CONSTANTS: exports.TIME_CONSTANTS,
    SUPPORTED_LANGUAGES: exports.SUPPORTED_LANGUAGES,
    SECURITY_HEADERS: exports.SECURITY_HEADERS,
};
//# sourceMappingURL=constants.js.map