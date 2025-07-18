/**
 * @fileoverview Constants for JobSwipe application
 * @description Shared constants used across the application
 * @version 1.0.0
 * @author JobSwipe Team
 */
/**
 * Application name and branding
 */
export declare const APP_NAME = "JobSwipe";
export declare const APP_TAGLINE = "Swipe Your Way to Success";
export declare const APP_DESCRIPTION = "Enterprise job application automation platform";
export declare const APP_URL = "https://jobswipe.com";
export declare const APP_SUPPORT_EMAIL = "support@jobswipe.com";
/**
 * Application version information
 */
export declare const APP_VERSION = "1.0.0";
export declare const API_VERSION = "v1";
export declare const MIN_SUPPORTED_VERSION = "1.0.0";
/**
 * Environment constants
 */
export declare const ENVIRONMENTS: {
    readonly DEVELOPMENT: "development";
    readonly STAGING: "staging";
    readonly PRODUCTION: "production";
    readonly TEST: "test";
};
export type Environment = typeof ENVIRONMENTS[keyof typeof ENVIRONMENTS];
/**
 * JWT configuration
 */
export declare const JWT_CONFIG: {
    readonly ALGORITHM: "RS256";
    readonly ISSUER: "jobswipe.com";
    readonly AUDIENCE: "jobswipe-api";
    readonly ACCESS_TOKEN_EXPIRY: number;
    readonly REFRESH_TOKEN_EXPIRY: number;
    readonly DESKTOP_TOKEN_EXPIRY: number;
    readonly VERIFICATION_TOKEN_EXPIRY: number;
    readonly PASSWORD_RESET_TOKEN_EXPIRY: number;
};
/**
 * Session configuration
 */
export declare const SESSION_CONFIG: {
    readonly TIMEOUT: number;
    readonly MAX_SESSIONS_PER_USER: 5;
    readonly CLEANUP_INTERVAL: number;
    readonly EXTEND_ON_ACTIVITY: true;
};
/**
 * Password requirements
 */
export declare const PASSWORD_CONFIG: {
    readonly MIN_LENGTH: 8;
    readonly MAX_LENGTH: 128;
    readonly REQUIRE_UPPERCASE: true;
    readonly REQUIRE_LOWERCASE: true;
    readonly REQUIRE_NUMBERS: true;
    readonly REQUIRE_SYMBOLS: false;
    readonly BCRYPT_ROUNDS: 12;
    readonly HISTORY_COUNT: 5;
};
/**
 * Rate limiting configuration
 */
export declare const RATE_LIMITS: {
    readonly LOGIN: {
        readonly MAX_ATTEMPTS: 5;
        readonly WINDOW_MS: number;
        readonly LOCKOUT_DURATION: number;
    };
    readonly REGISTRATION: {
        readonly MAX_ATTEMPTS: 3;
        readonly WINDOW_MS: number;
    };
    readonly PASSWORD_RESET: {
        readonly MAX_ATTEMPTS: 3;
        readonly WINDOW_MS: number;
    };
    readonly TOKEN_REFRESH: {
        readonly MAX_ATTEMPTS: 10;
        readonly WINDOW_MS: number;
    };
    readonly API_GENERAL: {
        readonly MAX_REQUESTS: 100;
        readonly WINDOW_MS: number;
    };
};
/**
 * Two-factor authentication
 */
export declare const TWO_FACTOR_CONFIG: {
    readonly TOTP_WINDOW: 1;
    readonly TOTP_STEP: 30;
    readonly BACKUP_CODES_COUNT: 10;
    readonly SMS_RETRY_DELAY: number;
    readonly EMAIL_RETRY_DELAY: number;
};
/**
 * HTTP status codes
 */
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly ACCEPTED: 202;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly BAD_GATEWAY: 502;
    readonly SERVICE_UNAVAILABLE: 503;
};
/**
 * API response formats
 */
export declare const API_RESPONSE_FORMAT: {
    readonly SUCCESS: "success";
    readonly ERROR: "error";
    readonly VALIDATION_ERROR: "validation_error";
};
/**
 * Content types
 */
export declare const CONTENT_TYPES: {
    readonly JSON: "application/json";
    readonly XML: "application/xml";
    readonly HTML: "text/html";
    readonly TEXT: "text/plain";
    readonly CSV: "text/csv";
    readonly PDF: "application/pdf";
    readonly ZIP: "application/zip";
};
/**
 * Cache durations (in seconds)
 */
export declare const CACHE_DURATIONS: {
    readonly SHORT: number;
    readonly MEDIUM: number;
    readonly LONG: number;
    readonly VERY_LONG: number;
    readonly PERMANENT: number;
};
/**
 * Pagination defaults
 */
export declare const PAGINATION: {
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_LIMIT: 20;
    readonly MAX_LIMIT: 100;
    readonly DEFAULT_OFFSET: 0;
};
/**
 * Sorting options
 */
export declare const SORT_DIRECTIONS: {
    readonly ASC: "asc";
    readonly DESC: "desc";
};
export type SortDirection = typeof SORT_DIRECTIONS[keyof typeof SORT_DIRECTIONS];
/**
 * File size limits (in bytes)
 */
export declare const FILE_SIZE_LIMITS: {
    readonly AVATAR: number;
    readonly RESUME: number;
    readonly COVER_LETTER: number;
    readonly DOCUMENT: number;
    readonly IMAGE: number;
    readonly VIDEO: number;
};
/**
 * Allowed file types
 */
export declare const ALLOWED_FILE_TYPES: {
    readonly IMAGE: readonly ["image/jpeg", "image/png", "image/gif", "image/webp"];
    readonly DOCUMENT: readonly ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    readonly RESUME: readonly ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    readonly AVATAR: readonly ["image/jpeg", "image/png", "image/gif", "image/webp"];
    readonly ARCHIVE: readonly ["application/zip", "application/x-rar-compressed", "application/x-tar"];
};
/**
 * File extensions
 */
export declare const FILE_EXTENSIONS: {
    readonly IMAGE: readonly [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    readonly DOCUMENT: readonly [".pdf", ".doc", ".docx"];
    readonly RESUME: readonly [".pdf", ".doc", ".docx"];
    readonly ARCHIVE: readonly [".zip", ".rar", ".tar"];
};
/**
 * Notification types
 */
export declare const NOTIFICATION_TYPES: {
    readonly INFO: "info";
    readonly SUCCESS: "success";
    readonly WARNING: "warning";
    readonly ERROR: "error";
    readonly JOB_MATCH: "job_match";
    readonly APPLICATION_UPDATE: "application_update";
    readonly INTERVIEW_REMINDER: "interview_reminder";
    readonly SYSTEM: "system";
};
export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
/**
 * Notification channels
 */
export declare const NOTIFICATION_CHANNELS: {
    readonly EMAIL: "email";
    readonly SMS: "sms";
    readonly PUSH: "push";
    readonly IN_APP: "in_app";
    readonly SLACK: "slack";
    readonly WEBHOOK: "webhook";
};
export type NotificationChannel = typeof NOTIFICATION_CHANNELS[keyof typeof NOTIFICATION_CHANNELS];
/**
 * Notification priorities
 */
export declare const NOTIFICATION_PRIORITIES: {
    readonly LOW: "low";
    readonly NORMAL: "normal";
    readonly HIGH: "high";
    readonly URGENT: "urgent";
    readonly CRITICAL: "critical";
};
export type NotificationPriority = typeof NOTIFICATION_PRIORITIES[keyof typeof NOTIFICATION_PRIORITIES];
/**
 * Job types
 */
export declare const JOB_TYPES: {
    readonly FULL_TIME: "full_time";
    readonly PART_TIME: "part_time";
    readonly CONTRACT: "contract";
    readonly FREELANCE: "freelance";
    readonly INTERNSHIP: "internship";
    readonly TEMPORARY: "temporary";
    readonly VOLUNTEER: "volunteer";
};
export type JobType = typeof JOB_TYPES[keyof typeof JOB_TYPES];
/**
 * Job experience levels
 */
export declare const JOB_LEVELS: {
    readonly ENTRY: "entry";
    readonly JUNIOR: "junior";
    readonly MID: "mid";
    readonly SENIOR: "senior";
    readonly LEAD: "lead";
    readonly MANAGER: "manager";
    readonly DIRECTOR: "director";
    readonly EXECUTIVE: "executive";
};
export type JobLevel = typeof JOB_LEVELS[keyof typeof JOB_LEVELS];
/**
 * Remote work types
 */
export declare const REMOTE_TYPES: {
    readonly ONSITE: "onsite";
    readonly REMOTE: "remote";
    readonly HYBRID: "hybrid";
    readonly FLEXIBLE: "flexible";
};
export type RemoteType = typeof REMOTE_TYPES[keyof typeof REMOTE_TYPES];
/**
 * Job application statuses
 */
export declare const APPLICATION_STATUSES: {
    readonly DRAFT: "draft";
    readonly PENDING: "pending";
    readonly SUBMITTED: "submitted";
    readonly UNDER_REVIEW: "under_review";
    readonly INTERVIEW_SCHEDULED: "interview_scheduled";
    readonly INTERVIEWED: "interviewed";
    readonly OFFER_RECEIVED: "offer_received";
    readonly ACCEPTED: "accepted";
    readonly REJECTED: "rejected";
    readonly WITHDRAWN: "withdrawn";
};
export type ApplicationStatus = typeof APPLICATION_STATUSES[keyof typeof APPLICATION_STATUSES];
/**
 * Job sources
 */
export declare const JOB_SOURCES: {
    readonly MANUAL: "manual";
    readonly LINKEDIN: "linkedin";
    readonly INDEED: "indeed";
    readonly GLASSDOOR: "glassdoor";
    readonly COMPANY_WEBSITE: "company_website";
    readonly RECRUITER: "recruiter";
    readonly REFERRAL: "referral";
};
export type JobSource = typeof JOB_SOURCES[keyof typeof JOB_SOURCES];
/**
 * Subscription plans
 */
export declare const SUBSCRIPTION_PLANS: {
    readonly FREE: "free";
    readonly BASIC: "basic";
    readonly PRO: "pro";
    readonly PREMIUM: "premium";
    readonly ENTERPRISE: "enterprise";
};
export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS];
/**
 * Subscription statuses
 */
export declare const SUBSCRIPTION_STATUSES: {
    readonly ACTIVE: "active";
    readonly INACTIVE: "inactive";
    readonly CANCELLED: "cancelled";
    readonly EXPIRED: "expired";
    readonly SUSPENDED: "suspended";
    readonly TRIAL: "trial";
};
export type SubscriptionStatus = typeof SUBSCRIPTION_STATUSES[keyof typeof SUBSCRIPTION_STATUSES];
/**
 * Plan limits
 */
export declare const PLAN_LIMITS: {
    readonly free: {
        readonly APPLICATIONS_PER_MONTH: 5;
        readonly RESUME_TEMPLATES: 1;
        readonly SAVED_JOBS: 10;
        readonly AUTOMATION_ENABLED: false;
        readonly PRIORITY_SUPPORT: false;
    };
    readonly basic: {
        readonly APPLICATIONS_PER_MONTH: 25;
        readonly RESUME_TEMPLATES: 3;
        readonly SAVED_JOBS: 50;
        readonly AUTOMATION_ENABLED: true;
        readonly PRIORITY_SUPPORT: false;
    };
    readonly pro: {
        readonly APPLICATIONS_PER_MONTH: 100;
        readonly RESUME_TEMPLATES: 10;
        readonly SAVED_JOBS: 200;
        readonly AUTOMATION_ENABLED: true;
        readonly PRIORITY_SUPPORT: true;
    };
    readonly premium: {
        readonly APPLICATIONS_PER_MONTH: 500;
        readonly RESUME_TEMPLATES: 50;
        readonly SAVED_JOBS: 1000;
        readonly AUTOMATION_ENABLED: true;
        readonly PRIORITY_SUPPORT: true;
    };
    readonly enterprise: {
        readonly APPLICATIONS_PER_MONTH: -1;
        readonly RESUME_TEMPLATES: -1;
        readonly SAVED_JOBS: -1;
        readonly AUTOMATION_ENABLED: true;
        readonly PRIORITY_SUPPORT: true;
    };
};
/**
 * Validation rules
 */
export declare const VALIDATION_RULES: {
    readonly EMAIL: {
        readonly MIN_LENGTH: 5;
        readonly MAX_LENGTH: 255;
        readonly PATTERN: RegExp;
    };
    readonly PASSWORD: {
        readonly MIN_LENGTH: 8;
        readonly MAX_LENGTH: 128;
        readonly PATTERN: RegExp;
    };
    readonly NAME: {
        readonly MIN_LENGTH: 2;
        readonly MAX_LENGTH: 100;
        readonly PATTERN: RegExp;
    };
    readonly PHONE: {
        readonly MIN_LENGTH: 10;
        readonly MAX_LENGTH: 20;
        readonly PATTERN: RegExp;
    };
    readonly URL: {
        readonly PATTERN: RegExp;
    };
    readonly SLUG: {
        readonly PATTERN: RegExp;
    };
};
/**
 * Input sanitization patterns
 */
export declare const SANITIZATION_PATTERNS: {
    readonly HTML_TAGS: RegExp;
    readonly SCRIPT_TAGS: RegExp;
    readonly SQL_INJECTION: RegExp;
    readonly XSS_BASIC: RegExp;
    readonly WHITESPACE: RegExp;
};
/**
 * Theme colors
 */
export declare const THEME_COLORS: {
    readonly PRIMARY: "#3b82f6";
    readonly SECONDARY: "#64748b";
    readonly SUCCESS: "#10b981";
    readonly WARNING: "#f59e0b";
    readonly ERROR: "#ef4444";
    readonly INFO: "#06b6d4";
    readonly LIGHT: "#f8fafc";
    readonly DARK: "#0f172a";
};
/**
 * Breakpoints
 */
export declare const BREAKPOINTS: {
    readonly SM: 640;
    readonly MD: 768;
    readonly LG: 1024;
    readonly XL: 1280;
    readonly XXL: 1536;
};
/**
 * Z-index layers
 */
export declare const Z_INDEX: {
    readonly DROPDOWN: 1000;
    readonly MODAL: 1050;
    readonly POPOVER: 1060;
    readonly TOOLTIP: 1070;
    readonly TOAST: 1080;
    readonly LOADING: 1090;
};
/**
 * Common regex patterns
 */
export declare const REGEX_PATTERNS: {
    readonly EMAIL: RegExp;
    readonly URL: RegExp;
    readonly PHONE: RegExp;
    readonly UUID: RegExp;
    readonly HEX_COLOR: RegExp;
    readonly SLUG: RegExp;
    readonly ALPHANUMERIC: RegExp;
    readonly NUMERIC: RegExp;
    readonly ALPHABETIC: RegExp;
    readonly PASSWORD_STRONG: RegExp;
    readonly IP_ADDRESS: RegExp;
    readonly CREDIT_CARD: RegExp;
    readonly SOCIAL_SECURITY: RegExp;
    readonly POSTAL_CODE: RegExp;
};
/**
 * Common error messages
 */
export declare const ERROR_MESSAGES: {
    readonly REQUIRED: "This field is required";
    readonly INVALID_EMAIL: "Please enter a valid email address";
    readonly INVALID_URL: "Please enter a valid URL";
    readonly INVALID_PHONE: "Please enter a valid phone number";
    readonly PASSWORD_TOO_SHORT: "Password must be at least 8 characters long";
    readonly PASSWORD_TOO_WEAK: "Password must contain uppercase, lowercase, and numbers";
    readonly PASSWORDS_DONT_MATCH: "Passwords do not match";
    readonly INVALID_FILE_TYPE: "Invalid file type";
    readonly FILE_TOO_LARGE: "File is too large";
    readonly NETWORK_ERROR: "Network error. Please try again.";
    readonly UNAUTHORIZED: "You are not authorized to perform this action";
    readonly FORBIDDEN: "Access denied";
    readonly NOT_FOUND: "Resource not found";
    readonly INTERNAL_ERROR: "Internal server error";
    readonly RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later.";
    readonly MAINTENANCE: "System is under maintenance. Please try again later.";
};
/**
 * Common success messages
 */
export declare const SUCCESS_MESSAGES: {
    readonly CREATED: "Successfully created";
    readonly UPDATED: "Successfully updated";
    readonly DELETED: "Successfully deleted";
    readonly SAVED: "Successfully saved";
    readonly SENT: "Successfully sent";
    readonly UPLOADED: "Successfully uploaded";
    readonly LOGGED_IN: "Successfully logged in";
    readonly LOGGED_OUT: "Successfully logged out";
    readonly REGISTERED: "Successfully registered";
    readonly PASSWORD_CHANGED: "Password successfully changed";
    readonly EMAIL_VERIFIED: "Email successfully verified";
    readonly PROFILE_UPDATED: "Profile successfully updated";
    readonly SETTINGS_SAVED: "Settings successfully saved";
};
/**
 * Feature flags
 */
export declare const FEATURE_FLAGS: {
    readonly DESKTOP_APP: "desktop_app";
    readonly MOBILE_APP: "mobile_app";
    readonly AUTOMATION: "automation";
    readonly AI_RESUME_BUILDER: "ai_resume_builder";
    readonly ADVANCED_ANALYTICS: "advanced_analytics";
    readonly TEAM_COLLABORATION: "team_collaboration";
    readonly WHITE_LABEL: "white_label";
    readonly API_ACCESS: "api_access";
    readonly WEBHOOKS: "webhooks";
    readonly SSO: "sso";
    readonly CUSTOM_BRANDING: "custom_branding";
    readonly PRIORITY_SUPPORT: "priority_support";
};
export type FeatureFlag = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS];
/**
 * Time constants
 */
export declare const TIME_CONSTANTS: {
    readonly MILLISECONDS_PER_SECOND: 1000;
    readonly SECONDS_PER_MINUTE: 60;
    readonly MINUTES_PER_HOUR: 60;
    readonly HOURS_PER_DAY: 24;
    readonly DAYS_PER_WEEK: 7;
    readonly DAYS_PER_MONTH: 30;
    readonly DAYS_PER_YEAR: 365;
};
/**
 * Date formats
 */
export declare const DATE_FORMATS: {
    readonly ISO: "YYYY-MM-DD";
    readonly ISO_WITH_TIME: "YYYY-MM-DDTHH:mm:ss";
    readonly US: "MM/DD/YYYY";
    readonly EU: "DD/MM/YYYY";
    readonly DISPLAY: "MMM DD, YYYY";
    readonly DISPLAY_WITH_TIME: "MMM DD, YYYY HH:mm";
    readonly TIME_ONLY: "HH:mm";
    readonly TIME_WITH_SECONDS: "HH:mm:ss";
};
/**
 * Supported languages
 */
export declare const SUPPORTED_LANGUAGES: {
    readonly EN: "en";
    readonly ES: "es";
    readonly FR: "fr";
    readonly DE: "de";
    readonly IT: "it";
    readonly PT: "pt";
    readonly ZH: "zh";
    readonly JA: "ja";
    readonly KO: "ko";
    readonly RU: "ru";
};
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[keyof typeof SUPPORTED_LANGUAGES];
/**
 * Supported currencies
 */
export declare const SUPPORTED_CURRENCIES: {
    readonly USD: "USD";
    readonly EUR: "EUR";
    readonly GBP: "GBP";
    readonly JPY: "JPY";
    readonly CAD: "CAD";
    readonly AUD: "AUD";
    readonly CHF: "CHF";
    readonly CNY: "CNY";
    readonly SEK: "SEK";
    readonly NOK: "NOK";
};
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[keyof typeof SUPPORTED_CURRENCIES];
/**
 * Security headers
 */
export declare const SECURITY_HEADERS: {
    readonly CONTENT_TYPE_OPTIONS: "X-Content-Type-Options";
    readonly FRAME_OPTIONS: "X-Frame-Options";
    readonly XSS_PROTECTION: "X-XSS-Protection";
    readonly HSTS: "Strict-Transport-Security";
    readonly CSP: "Content-Security-Policy";
    readonly REFERRER_POLICY: "Referrer-Policy";
    readonly PERMISSIONS_POLICY: "Permissions-Policy";
};
/**
 * Encryption algorithms
 */
export declare const ENCRYPTION_ALGORITHMS: {
    readonly AES_256_GCM: "aes-256-gcm";
    readonly AES_256_CBC: "aes-256-cbc";
    readonly RSA_OAEP: "rsa-oaep";
    readonly PBKDF2: "pbkdf2";
    readonly BCRYPT: "bcrypt";
    readonly SCRYPT: "scrypt";
};
/**
 * Hash algorithms
 */
export declare const HASH_ALGORITHMS: {
    readonly SHA256: "sha256";
    readonly SHA512: "sha512";
    readonly MD5: "md5";
    readonly BLAKE2B: "blake2b";
};
declare const _default: {
    APP_NAME: string;
    APP_VERSION: string;
    ENVIRONMENTS: {
        readonly DEVELOPMENT: "development";
        readonly STAGING: "staging";
        readonly PRODUCTION: "production";
        readonly TEST: "test";
    };
    JWT_CONFIG: {
        readonly ALGORITHM: "RS256";
        readonly ISSUER: "jobswipe.com";
        readonly AUDIENCE: "jobswipe-api";
        readonly ACCESS_TOKEN_EXPIRY: number;
        readonly REFRESH_TOKEN_EXPIRY: number;
        readonly DESKTOP_TOKEN_EXPIRY: number;
        readonly VERIFICATION_TOKEN_EXPIRY: number;
        readonly PASSWORD_RESET_TOKEN_EXPIRY: number;
    };
    SESSION_CONFIG: {
        readonly TIMEOUT: number;
        readonly MAX_SESSIONS_PER_USER: 5;
        readonly CLEANUP_INTERVAL: number;
        readonly EXTEND_ON_ACTIVITY: true;
    };
    PASSWORD_CONFIG: {
        readonly MIN_LENGTH: 8;
        readonly MAX_LENGTH: 128;
        readonly REQUIRE_UPPERCASE: true;
        readonly REQUIRE_LOWERCASE: true;
        readonly REQUIRE_NUMBERS: true;
        readonly REQUIRE_SYMBOLS: false;
        readonly BCRYPT_ROUNDS: 12;
        readonly HISTORY_COUNT: 5;
    };
    RATE_LIMITS: {
        readonly LOGIN: {
            readonly MAX_ATTEMPTS: 5;
            readonly WINDOW_MS: number;
            readonly LOCKOUT_DURATION: number;
        };
        readonly REGISTRATION: {
            readonly MAX_ATTEMPTS: 3;
            readonly WINDOW_MS: number;
        };
        readonly PASSWORD_RESET: {
            readonly MAX_ATTEMPTS: 3;
            readonly WINDOW_MS: number;
        };
        readonly TOKEN_REFRESH: {
            readonly MAX_ATTEMPTS: 10;
            readonly WINDOW_MS: number;
        };
        readonly API_GENERAL: {
            readonly MAX_REQUESTS: 100;
            readonly WINDOW_MS: number;
        };
    };
    HTTP_STATUS: {
        readonly OK: 200;
        readonly CREATED: 201;
        readonly ACCEPTED: 202;
        readonly NO_CONTENT: 204;
        readonly BAD_REQUEST: 400;
        readonly UNAUTHORIZED: 401;
        readonly FORBIDDEN: 403;
        readonly NOT_FOUND: 404;
        readonly CONFLICT: 409;
        readonly UNPROCESSABLE_ENTITY: 422;
        readonly TOO_MANY_REQUESTS: 429;
        readonly INTERNAL_SERVER_ERROR: 500;
        readonly BAD_GATEWAY: 502;
        readonly SERVICE_UNAVAILABLE: 503;
    };
    PAGINATION: {
        readonly DEFAULT_PAGE: 1;
        readonly DEFAULT_LIMIT: 20;
        readonly MAX_LIMIT: 100;
        readonly DEFAULT_OFFSET: 0;
    };
    FILE_SIZE_LIMITS: {
        readonly AVATAR: number;
        readonly RESUME: number;
        readonly COVER_LETTER: number;
        readonly DOCUMENT: number;
        readonly IMAGE: number;
        readonly VIDEO: number;
    };
    NOTIFICATION_TYPES: {
        readonly INFO: "info";
        readonly SUCCESS: "success";
        readonly WARNING: "warning";
        readonly ERROR: "error";
        readonly JOB_MATCH: "job_match";
        readonly APPLICATION_UPDATE: "application_update";
        readonly INTERVIEW_REMINDER: "interview_reminder";
        readonly SYSTEM: "system";
    };
    JOB_TYPES: {
        readonly FULL_TIME: "full_time";
        readonly PART_TIME: "part_time";
        readonly CONTRACT: "contract";
        readonly FREELANCE: "freelance";
        readonly INTERNSHIP: "internship";
        readonly TEMPORARY: "temporary";
        readonly VOLUNTEER: "volunteer";
    };
    APPLICATION_STATUSES: {
        readonly DRAFT: "draft";
        readonly PENDING: "pending";
        readonly SUBMITTED: "submitted";
        readonly UNDER_REVIEW: "under_review";
        readonly INTERVIEW_SCHEDULED: "interview_scheduled";
        readonly INTERVIEWED: "interviewed";
        readonly OFFER_RECEIVED: "offer_received";
        readonly ACCEPTED: "accepted";
        readonly REJECTED: "rejected";
        readonly WITHDRAWN: "withdrawn";
    };
    SUBSCRIPTION_PLANS: {
        readonly FREE: "free";
        readonly BASIC: "basic";
        readonly PRO: "pro";
        readonly PREMIUM: "premium";
        readonly ENTERPRISE: "enterprise";
    };
    VALIDATION_RULES: {
        readonly EMAIL: {
            readonly MIN_LENGTH: 5;
            readonly MAX_LENGTH: 255;
            readonly PATTERN: RegExp;
        };
        readonly PASSWORD: {
            readonly MIN_LENGTH: 8;
            readonly MAX_LENGTH: 128;
            readonly PATTERN: RegExp;
        };
        readonly NAME: {
            readonly MIN_LENGTH: 2;
            readonly MAX_LENGTH: 100;
            readonly PATTERN: RegExp;
        };
        readonly PHONE: {
            readonly MIN_LENGTH: 10;
            readonly MAX_LENGTH: 20;
            readonly PATTERN: RegExp;
        };
        readonly URL: {
            readonly PATTERN: RegExp;
        };
        readonly SLUG: {
            readonly PATTERN: RegExp;
        };
    };
    THEME_COLORS: {
        readonly PRIMARY: "#3b82f6";
        readonly SECONDARY: "#64748b";
        readonly SUCCESS: "#10b981";
        readonly WARNING: "#f59e0b";
        readonly ERROR: "#ef4444";
        readonly INFO: "#06b6d4";
        readonly LIGHT: "#f8fafc";
        readonly DARK: "#0f172a";
    };
    REGEX_PATTERNS: {
        readonly EMAIL: RegExp;
        readonly URL: RegExp;
        readonly PHONE: RegExp;
        readonly UUID: RegExp;
        readonly HEX_COLOR: RegExp;
        readonly SLUG: RegExp;
        readonly ALPHANUMERIC: RegExp;
        readonly NUMERIC: RegExp;
        readonly ALPHABETIC: RegExp;
        readonly PASSWORD_STRONG: RegExp;
        readonly IP_ADDRESS: RegExp;
        readonly CREDIT_CARD: RegExp;
        readonly SOCIAL_SECURITY: RegExp;
        readonly POSTAL_CODE: RegExp;
    };
    ERROR_MESSAGES: {
        readonly REQUIRED: "This field is required";
        readonly INVALID_EMAIL: "Please enter a valid email address";
        readonly INVALID_URL: "Please enter a valid URL";
        readonly INVALID_PHONE: "Please enter a valid phone number";
        readonly PASSWORD_TOO_SHORT: "Password must be at least 8 characters long";
        readonly PASSWORD_TOO_WEAK: "Password must contain uppercase, lowercase, and numbers";
        readonly PASSWORDS_DONT_MATCH: "Passwords do not match";
        readonly INVALID_FILE_TYPE: "Invalid file type";
        readonly FILE_TOO_LARGE: "File is too large";
        readonly NETWORK_ERROR: "Network error. Please try again.";
        readonly UNAUTHORIZED: "You are not authorized to perform this action";
        readonly FORBIDDEN: "Access denied";
        readonly NOT_FOUND: "Resource not found";
        readonly INTERNAL_ERROR: "Internal server error";
        readonly RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later.";
        readonly MAINTENANCE: "System is under maintenance. Please try again later.";
    };
    SUCCESS_MESSAGES: {
        readonly CREATED: "Successfully created";
        readonly UPDATED: "Successfully updated";
        readonly DELETED: "Successfully deleted";
        readonly SAVED: "Successfully saved";
        readonly SENT: "Successfully sent";
        readonly UPLOADED: "Successfully uploaded";
        readonly LOGGED_IN: "Successfully logged in";
        readonly LOGGED_OUT: "Successfully logged out";
        readonly REGISTERED: "Successfully registered";
        readonly PASSWORD_CHANGED: "Password successfully changed";
        readonly EMAIL_VERIFIED: "Email successfully verified";
        readonly PROFILE_UPDATED: "Profile successfully updated";
        readonly SETTINGS_SAVED: "Settings successfully saved";
    };
    FEATURE_FLAGS: {
        readonly DESKTOP_APP: "desktop_app";
        readonly MOBILE_APP: "mobile_app";
        readonly AUTOMATION: "automation";
        readonly AI_RESUME_BUILDER: "ai_resume_builder";
        readonly ADVANCED_ANALYTICS: "advanced_analytics";
        readonly TEAM_COLLABORATION: "team_collaboration";
        readonly WHITE_LABEL: "white_label";
        readonly API_ACCESS: "api_access";
        readonly WEBHOOKS: "webhooks";
        readonly SSO: "sso";
        readonly CUSTOM_BRANDING: "custom_branding";
        readonly PRIORITY_SUPPORT: "priority_support";
    };
    TIME_CONSTANTS: {
        readonly MILLISECONDS_PER_SECOND: 1000;
        readonly SECONDS_PER_MINUTE: 60;
        readonly MINUTES_PER_HOUR: 60;
        readonly HOURS_PER_DAY: 24;
        readonly DAYS_PER_WEEK: 7;
        readonly DAYS_PER_MONTH: 30;
        readonly DAYS_PER_YEAR: 365;
    };
    SUPPORTED_LANGUAGES: {
        readonly EN: "en";
        readonly ES: "es";
        readonly FR: "fr";
        readonly DE: "de";
        readonly IT: "it";
        readonly PT: "pt";
        readonly ZH: "zh";
        readonly JA: "ja";
        readonly KO: "ko";
        readonly RU: "ru";
    };
    SECURITY_HEADERS: {
        readonly CONTENT_TYPE_OPTIONS: "X-Content-Type-Options";
        readonly FRAME_OPTIONS: "X-Frame-Options";
        readonly XSS_PROTECTION: "X-XSS-Protection";
        readonly HSTS: "Strict-Transport-Security";
        readonly CSP: "Content-Security-Policy";
        readonly REFERRER_POLICY: "Referrer-Policy";
        readonly PERMISSIONS_POLICY: "Permissions-Policy";
    };
};
export default _default;
//# sourceMappingURL=constants.d.ts.map