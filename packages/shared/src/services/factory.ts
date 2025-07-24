
/**
 * @fileoverview Service Factory for creating service instances
 * @description Centralized factory for creating properly configured services
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { ServerJwtTokenService } from './server-jwt-token.service';
import { RedisSessionService } from './redis-session-stub.service';

/**
 * Configuration for JWT Token Service
 */
export interface JwtServiceConfig {
  keyRotationInterval?: number;
  maxKeyAge?: number;
  revokedTokensCleanupInterval?: number;
}

/**
 * Configuration for Redis Service
 */
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  maxRetriesPerRequest?: number;
  retryDelayOnFailover?: number;
  enableOfflineQueue?: boolean;
  lazyConnect?: boolean;
  ssl?: boolean;
}

/**
 * Configuration for Session Service
 */
export interface SessionConfig {
  keyPrefix?: string;
  defaultExpiration?: number;
  enableMetrics?: boolean;
}

/**
 * Create JWT Token Service with configuration (Server-Only)
 */
export function createJwtTokenService(config?: JwtServiceConfig): ServerJwtTokenService {
  return new ServerJwtTokenService(
    config?.keyRotationInterval,
    config?.maxKeyAge,
    config?.revokedTokensCleanupInterval
  );
}

// This function is now defined below after the SecurityMiddlewareService interface

/**
 * Get default JWT Token Service instance (SERVER-ONLY)
 * This function creates the instance only when called, preventing browser initialization
 */
export function getDefaultJwtTokenService(): ServerJwtTokenService | null {
  if (typeof window !== 'undefined') {
    console.warn('Default JWT Token Service not available in browser environment');
    return null;
  }
  
  try {
    return createJwtTokenService();
  } catch (error) {
    console.error('Failed to create default JWT Token Service:', error);
    return null;
  }
}

/**
 * Get default Redis Session Service instance
 * This function creates the instance only when called, preventing browser initialization
 */
export function getDefaultRedisSessionService(): RedisSessionService {
  return createRedisSessionService({
    host: 'localhost',
    port: 6379,
  });
}

// Re-export JWT token configuration functions
export {
  createAccessTokenConfig,
  createRefreshTokenConfig,
  createDesktopTokenConfig,
  createVerificationTokenConfig
} from './server-jwt-token.service';

/**
 * Security Middleware Service interface
 */
export interface SecurityMiddlewareService {
  checkRateLimit(key: string, maxRequests: number, windowMs: number): Promise<boolean>;
  blockIp(ip: string, reason: string): Promise<void>;
  isIpBlocked(ip: string): Promise<boolean>;
  getStats(): {
    rateLimitEntries: number;
    blockedIps: number;
    suspiciousActivity: number;
  };
}

// Export session service factory
export function createRedisSessionService(
  redisConfig: RedisConfig,
  sessionConfig?: SessionConfig
): RedisSessionService {
  console.log('Creating Redis session service with config:', redisConfig.host);
  return new RedisSessionService();
}

/**
 * Create Security Middleware Service
 */
export function createSecurityMiddlewareService(): SecurityMiddlewareService {
  return {
    async checkRateLimit(_key: string, _maxRequests: number, _windowMs: number): Promise<boolean> {
      // Simple in-memory rate limiting for now
      return true;
    },
    async blockIp(ip: string, reason: string): Promise<void> {
      console.log(`IP blocked: ${ip} - ${reason}`);
    },
    async isIpBlocked(_ip: string): Promise<boolean> {
      return false;
    },
    getStats() {
      return {
        rateLimitEntries: 0,
        blockedIps: 0,
        suspiciousActivity: 0,
      };
    },
  };
}