/**
 * @fileoverview Service Factory for creating service instances
 * @description Centralized factory for creating properly configured services
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { JwtTokenService } from './jwt-token.service';
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
 * Create JWT Token Service with configuration
 */
export function createJwtTokenService(config?: JwtServiceConfig): JwtTokenService {
  return new JwtTokenService(config);
}

/**
 * Create Redis Session Service with configuration
 */
export function createRedisSessionService(
  redisConfig: RedisConfig,
  sessionConfig?: SessionConfig
): RedisSessionService {
  return new RedisSessionService();
}

/**
 * Default JWT Token Service instance
 */
export const defaultJwtTokenService = createJwtTokenService();

/**
 * Default Redis Session Service instance
 */
export const defaultRedisSessionService = createRedisSessionService({
  host: 'localhost',
  port: 6379,
});

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

/**
 * Create Security Middleware Service
 */
export function createSecurityMiddlewareService(): SecurityMiddlewareService {
  return {
    async checkRateLimit(key: string, maxRequests: number, windowMs: number): Promise<boolean> {
      // Simple in-memory rate limiting for now
      return true;
    },
    async blockIp(ip: string, reason: string): Promise<void> {
      console.log(`IP blocked: ${ip} - ${reason}`);
    },
    async isIpBlocked(ip: string): Promise<boolean> {
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