/**
 * @fileoverview Main entry point for JobSwipe shared package
 * @description Exports all shared types, utilities, and constants
 * @version 1.0.0
 * @author JobSwipe Team
 */

// Constants (export explicitly to avoid conflicts)
export {
  APP_NAME,
  APP_VERSION,
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
  ENCRYPTION_ALGORITHMS,
  HASH_ALGORITHMS
} from './constants';

// Authentication types and utilities
export * from './types/auth';

// Export context for React apps (explicit exports to avoid conflicts)
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

// Export frontend auth service
export * from './services/frontend-auth.service';

// Common types and utilities  
export * from './types/common';

// Error handling utilities
export * from './utils/errors';

// Date and time utilities
export * from './utils/datetime';

// Services
export { JwtTokenService } from './services/jwt-token.service';
export { RedisSessionService } from './services/redis-session-stub.service';
export { TokenExchangeService } from './services/token-exchange.service';
export * from './services/factory';

// Export specific service types and functions for API usage
export type { SecurityMiddlewareService } from './services/factory';
export { 
  createRedisSessionService, 
  createSecurityMiddlewareService,
  createJwtTokenService
} from './services/factory';

// Security utilities
export * from './utils/security';

// Re-export specific functions to avoid conflicts
export { 
  isEmpty as isEmptyString,
  isNotEmpty as isNotEmptyString 
} from './utils/string';

export { 
  isEmpty as isEmptyValue,
  isNotEmpty as isNotEmptyValue 
} from './utils/validation';

// Password utilities (export specific functions to avoid conflicts)
export {
  hashPassword,
  verifyPassword,
  validatePassword,
  generateSecurePassword,
  needsRehash
} from './utils/password';

// Note: Services already exported above