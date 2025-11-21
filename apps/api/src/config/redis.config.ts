/**
 * @fileoverview Redis Connection Configuration
 * @description Centralized Redis connection configuration for BullMQ queues
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { Redis, RedisOptions } from 'ioredis';

/**
 * Parse Redis URL into connection options
 * Supports formats: redis://[[username]:password@]host[:port][/db-number]
 */
function parseRedisUrl(url: string): Partial<RedisOptions> {
  try {
    const parsed = new URL(url);
    const config: Partial<RedisOptions> = {
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : 6379,
    };

    if (parsed.password) {
      config.password = parsed.password;
    }

    // Extract DB number from pathname
    if (parsed.pathname && parsed.pathname.length > 1) {
      const db = parseInt(parsed.pathname.substring(1), 10);
      if (!isNaN(db)) {
        config.db = db;
      }
    }

    // Support TLS URLs
    if (parsed.protocol === 'rediss:') {
      config.tls = {};
    }

    return config;
  } catch (error) {
    console.error('Failed to parse REDIS_URL:', error);
    throw new Error('Invalid REDIS_URL format. Expected: redis://[username:password@]host[:port][/db]');
  }
}

/**
 * Get Redis connection configuration from environment
 * Priority: REDIS_URL > individual env vars (REDIS_HOST, etc.) > defaults
 */
function getRedisConfig(): RedisOptions {
  let config: RedisOptions;

  // Priority 1: Use REDIS_URL if available (common in cloud deployments)
  if (process.env.REDIS_URL) {
    console.log('📡 Using REDIS_URL for Redis connection');
    config = {
      ...parseRedisUrl(process.env.REDIS_URL),
      // Connection pool settings
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
      // Connection timeout
      connectTimeout: 10000,
      // Keep-alive
      keepAlive: 30000,
      // Family: prefer IPv4
      family: 4,
    } as RedisOptions;
  } else {
    // Priority 2: Use individual environment variables
    console.log('📡 Using individual Redis env vars (REDIS_HOST, REDIS_PORT, etc.)');
    config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      // Connection pool settings
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
      // Connection timeout
      connectTimeout: 10000,
      // Keep-alive
      keepAlive: 30000,
      // Family: prefer IPv4
      family: 4,
    };
  }

  // Add reconnection strategy
  config.retryStrategy = function(times: number) {
    const delay = Math.min(times * 50, 2000);
    console.log(`Redis reconnection attempt ${times}, waiting ${delay}ms`);
    return delay;
  };

  return config;
}

/**
 * Redis connection configuration
 * Uses environment variables for production flexibility
 */
export const redisConfig: RedisOptions = getRedisConfig();

/**
 * Create a new Redis connection instance
 * @returns Redis connection instance
 */
export function createRedisConnection(): Redis {
  const redis = new Redis(redisConfig);

  redis.on('connect', () => {
    console.log('✅ Redis connection established');
  });

  redis.on('ready', () => {
    console.log('✅ Redis ready to accept commands');
  });

  redis.on('error', (error) => {
    console.error('❌ Redis connection error:', error);
  });

  redis.on('close', () => {
    console.log('🔌 Redis connection closed');
  });

  redis.on('reconnecting', (delay: number) => {
    console.log(`🔄 Redis reconnecting in ${delay}ms`);
  });

  return redis;
}

/**
 * BullMQ connection options (simplified for BullMQ compatibility)
 * Uses same logic as redisConfig but with BullMQ-specific settings
 */
function getBullMQConnection() {
  let config: any;

  if (process.env.REDIS_URL) {
    config = {
      ...parseRedisUrl(process.env.REDIS_URL),
      maxRetriesPerRequest: null, // Required for BullMQ
      enableReadyCheck: false,      // Required for BullMQ
      enableOfflineQueue: false,    // Required for BullMQ
    };
  } else {
    config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      maxRetriesPerRequest: null, // Required for BullMQ
      enableReadyCheck: false,      // Required for BullMQ
      enableOfflineQueue: false,    // Required for BullMQ
    };
  }

  return config;
}

export const bullmqConnection = getBullMQConnection();

/**
 * Test Redis connection
 * @returns Promise<boolean> - true if connection successful
 */
export async function testRedisConnection(): Promise<boolean> {
  const redis = createRedisConnection();

  try {
    await redis.ping();
    console.log('✅ Redis connection test successful');
    await redis.quit();
    return true;
  } catch (error) {
    console.error('❌ Redis connection test failed:', error);
    await redis.quit();
    return false;
  }
}
