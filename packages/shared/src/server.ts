/**
 * @fileoverview Server-Only Exports for JobSwipe Shared Package
 * @description This module exports server-only functionality - NODE.JS ONLY
 * @version 1.0.0
 * @author JobSwipe Team
 * @environment server-only
 */

// Environment check
if (typeof window !== 'undefined') {
  throw new Error('This module can only be imported in Node.js server environments');
}

// Server-only service exports
export {
  createRedisSessionService,
  createSecurityMiddlewareService,
  getDefaultRedisSessionService
} from './services/factory';

// Universal services (safe in server environment)
export { RedisSessionService } from './services/redis-session-stub.service';
export { TokenExchangeService } from './services/token-exchange.service';
// Note: security-middleware.service exports already included via browser.ts re-export

// Server-safe password utilities (uses Node.js crypto)
export {
  hashPassword,
  verifyPassword,
  generateSecurePassword,
  needsRehash
} from './utils/password';

// Re-export all browser-safe content for convenience
export * from './browser';

// Export server-side security middleware
export * from './middleware/auth-security.middleware';

// Export types (always safe)
export type { SecurityMiddlewareService } from './services/factory';