/**
 * @fileoverview Main entry point for JobSwipe shared package
 * @description Exports all shared types, utilities, and constants
 * @version 1.0.0
 * @author JobSwipe Team
 * 
 * IMPORTANT: For better tree-shaking and to avoid server/client conflicts:
 * - Use '@jobswipe/shared/browser' for React components and client-side code
 * - Use '@jobswipe/shared/server' for API routes and server-side code
 * - Use '@jobswipe/shared' (this file) only when you need both environments
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

// OAuth types and schemas
export * from './types/oauth.types';

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

// Validation schemas
export * from './schemas';

// Error handling utilities
export * from './utils/errors';

// Date and time utilities
export * from './utils/datetime';

// =============================================================================
// BROWSER-SAFE SERVICE EXPORTS
// =============================================================================

// Browser-safe services (always available)
export * from './services/browser-jwt-utils.service';

// Universal services (work in both environments)
export { RedisSessionService } from './services/redis-session-stub.service';
export { TokenExchangeService } from './services/token-exchange.service';

// =============================================================================
// SERVER-ONLY SERVICE EXPORTS (DO NOT IMPORT IN CLIENT CODE)
// =============================================================================

// WARNING: These exports should ONLY be used in server-side code (API routes, middleware, etc.)
// Do NOT import these in React components or client-side code

// Server-only services (Node.js crypto dependencies)
// Only import these in your API routes or server-side code
export { ServerJwtTokenService } from './services/server-jwt-token.service';

// Factory functions for server-only services
export { 
  createRedisSessionService, 
  createSecurityMiddlewareService,
  getDefaultJwtTokenService,
  getDefaultRedisSessionService
} from './services/factory';

// Safe factory function (with environment guards)
export { createJwtTokenService } from './services/jwt-token.service';

// Export types (always safe to export)
export type { SecurityMiddlewareService } from './services/factory';

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