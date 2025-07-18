/**
 * @fileoverview Main entry point for JobSwipe shared package
 * @description Exports all shared types, utilities, and constants
 * @version 1.0.0
 * @author JobSwipe Team
 */

// Authentication types and utilities
export * from './types/auth';

// Common types and utilities
export * from './types/common';

// Error handling utilities
export * from './utils/errors';

// Date and time utilities
export * from './utils/datetime';

// Services
export * from './services/jwt-token.service';
export * from './services/redis-session-stub.service';

// Password utilities
export * from './utils/password';

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