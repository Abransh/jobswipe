/**
 * @fileoverview Redis Connection Configuration
 * @description Centralized Redis connection configuration for BullMQ queues
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { Redis, RedisOptions } from 'ioredis';

/**
 * Redis connection configuration
 * Uses environment variables for production flexibility
 */
export const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),

  // Connection pool settings
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,

  // Reconnection strategy with exponential backoff
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    console.log(`Redis reconnection attempt ${times}, waiting ${delay}ms`);
    return delay;
  },

  // Connection timeout
  connectTimeout: 10000,

  // Keep-alive
  keepAlive: 30000,

  // Family: prefer IPv4
  family: 4,
};

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
 */
export const bullmqConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,      // Required for BullMQ
  enableOfflineQueue: false,    // Required for BullMQ
};

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
