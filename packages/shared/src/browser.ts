/**
 * @fileoverview Browser-Safe Exports for JobSwipe Shared Package
 * @description This module exports only browser-safe utilities - NO server-only code
 * @version 1.0.0
 * @author JobSwipe Team
 * @environment browser-safe
 */

// Re-export only browser-safe functionality
export * from './services/browser-jwt-utils.service';
export * from './services/frontend-auth.service';

// Re-export auth context with specific exports to avoid conflicts
export { 
  useAuth, 
  useAuthState, 
  useUser, 
  useIsAuthenticated, 
  useAuthLoading, 
  useAuthError, 
  useLogin, 
  useRegister, 
  useLogout, 
  useOAuth, 
  useProfile, 
  usePassword,
  withAuth,
  withGuest,
  AuthRequired,
  GuestOnly,
  AuthProvider as AuthContextProvider
} from './context/auth.context';

// Re-export browser-safe types
export * from './types/auth';
export * from './types/common';

// Re-export browser-safe utilities
export * from './utils/datetime';
export * from './utils/errors';
export * from './utils/security';

// Export auth security utilities with specific names to avoid conflicts
export { 
  validateJwtPayloadSecurity,
  validatePasswordStrength,
  detectSuspiciousActivity,
  sanitizeUserInput,
  validateSessionToken,
  AUTH_SECURITY_CONFIG,
  type AuthSecurityConfig
} from './utils/auth-security';

// Export string utilities with specific names to avoid conflicts
export { 
  isEmpty as isEmptyString,
  isNotEmpty as isNotEmptyString 
} from './utils/string';

export { 
  isEmpty as isEmptyValue,
  isNotEmpty as isNotEmptyValue 
} from './utils/validation';

// Re-export browser-safe constants
export {
  APP_NAME,
  APP_VERSION,
  JWT_CONFIG,
  HTTP_STATUS,
  PAGINATION,
  NOTIFICATION_TYPES,
  JOB_TYPES,
  APPLICATION_STATUSES,
  SUBSCRIPTION_PLANS,
  VALIDATION_RULES,
  THEME_COLORS,
  REGEX_PATTERNS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TIME_CONSTANTS,
  SUPPORTED_LANGUAGES
} from './constants';

// WARNING: DO NOT import or re-export server-only services from this file
// Server-only services include:
// - ServerJwtTokenService 
// - createJwtTokenService
// - Any service that uses Node.js crypto module