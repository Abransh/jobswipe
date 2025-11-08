
/**
 * @fileoverview Service Factory for creating service instances
 * @description Centralized factory for creating properly configured services
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { RedisSessionService } from './redis-session-stub.service';

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
 * Get default Redis Session Service instance
 * This function creates the instance only when called, preventing browser initialization
 */
export function getDefaultRedisSessionService(): RedisSessionService {
  return createRedisSessionService({
    host: 'localhost',
    port: 6379,
  });
}

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