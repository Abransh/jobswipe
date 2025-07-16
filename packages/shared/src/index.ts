/**
 * @fileoverview Main entry point for JobSwipe shared package
 * @description Exports all shared types, utilities, and constants
 * @version 1.0.0
 * @author JobSwipe Team
 */

// Authentication types and utilities
export * from './types/auth';

// Common utility types
export * from './types/common';

// API response types
export * from './types/api';

// Error handling utilities
export * from './utils/errors';

// Validation utilities
export * from './utils/validation';

// Security utilities
export * from './utils/security';

// Date and time utilities
export * from './utils/datetime';

// String utilities
export * from './utils/string';

// Constants
export * from './constants';

// Services
export * from './services/jwt-token.service';
export * from './services/redis-session.service';
export * from './services/token-exchange.service';
export * from './services/security-middleware.service';

// Re-export specific functions to avoid conflicts
export { 
  getErrorMessage as getApiErrorMessage,
  getErrorCode as getApiErrorCode 
} from './types/api';

export { 
  isEmpty as isEmptyString,
  isNotEmpty as isNotEmptyString 
} from './utils/string';

export { 
  isEmpty as isEmptyValue,
  isNotEmpty as isNotEmptyValue 
} from './utils/validation';