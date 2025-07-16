/**
 * @fileoverview Redis Session Management Service for JobSwipe
 * @description Enterprise-grade session management with Redis backend
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { 
  AuthSession, 
  SessionStatus, 
  AuthSource, 
  AuthProvider, 
  UserId, 
  SessionId, 
  AuthenticatedUser 
} from '../types/auth';
import { createAuthError, AuthErrorCode } from '../types/auth';
import { SESSION_CONFIG } from '../constants';
import { generateSessionId, generateSecureToken } from '../utils/security';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Redis connection configuration
 */
interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  maxRetriesPerRequest?: number;
  retryDelayOnFailover?: number;
  enableOfflineQueue?: boolean;
  lazyConnect?: boolean;
  keepAlive?: number;
  connectTimeout?: number;
  commandTimeout?: number;
  ssl?: boolean;
  tls?: any;
}

/**
 * Session creation options
 */
interface SessionCreateOptions {
  userId: UserId;
  source: AuthSource;
  provider: AuthProvider;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  location?: string;
  expiresIn?: number;
  metadata?: Record<string, any>;
}

/**
 * Session update options
 */
interface SessionUpdateOptions {
  lastUsedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  metadata?: Record<string, any>;
}

/**
 * Session query options
 */
interface SessionQueryOptions {
  userId?: UserId;
  source?: AuthSource;
  provider?: AuthProvider;
  status?: SessionStatus;
  deviceId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Session metrics
 */
interface SessionMetrics {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  revokedSessions: number;
  sessionsBySource: Record<AuthSource, number>;
  sessionsByProvider: Record<AuthProvider, number>;
  averageSessionDuration: number;
  sessionsCreatedToday: number;
  sessionsExpiredToday: number;
  lastCleanup: Date;
}

// =============================================================================
// MOCK REDIS CLIENT INTERFACE
// =============================================================================

/**
 * Mock Redis client interface (in a real app, you'd use ioredis or redis)
 */
interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, duration?: number): Promise<'OK' | null>;
  setex(key: string, seconds: number, value: string): Promise<'OK'>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  ttl(key: string): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  scan(cursor: number, pattern?: string, count?: number): Promise<[string, string[]]>;
  multi(): RedisMulti;
  pipeline(): RedisPipeline;
  disconnect(): Promise<void>;
}

/**
 * Mock Redis multi interface
 */
interface RedisMulti {
  set(key: string, value: string): RedisMulti;
  setex(key: string, seconds: number, value: string): RedisMulti;
  del(key: string): RedisMulti;
  expire(key: string, seconds: number): RedisMulti;
  exec(): Promise<Array<[Error | null, any]>>;
}

/**
 * Mock Redis pipeline interface
 */
interface RedisPipeline {
  get(key: string): RedisPipeline;
  set(key: string, value: string): RedisPipeline;
  del(key: string): RedisPipeline;
  exec(): Promise<Array<[Error | null, any]>>;
}

// =============================================================================
// MOCK REDIS CLIENT IMPLEMENTATION
// =============================================================================

/**
 * Mock Redis client for demonstration (replace with real Redis client)
 */
class MockRedisClient implements RedisClient {
  private store: Map<string, { value: string; expiresAt?: number }> = new Map();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK' | null> {
    const expiresAt = duration ? Date.now() + (duration * 1000) : undefined;
    this.store.set(key, { value, expiresAt });
    return 'OK';
  }

  async setex(key: string, seconds: number, value: string): Promise<'OK'> {
    const expiresAt = Date.now() + (seconds * 1000);
    this.store.set(key, { value, expiresAt });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async exists(key: string): Promise<number> {
    return this.store.has(key) ? 1 : 0;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const item = this.store.get(key);
    if (!item) return 0;
    
    item.expiresAt = Date.now() + (seconds * 1000);
    return 1;
  }

  async ttl(key: string): Promise<number> {
    const item = this.store.get(key);
    if (!item) return -2;
    if (!item.expiresAt) return -1;
    
    const ttl = Math.floor((item.expiresAt - Date.now()) / 1000);
    return ttl > 0 ? ttl : -2;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.store.keys()).filter(key => regex.test(key));
  }

  async scan(cursor: number, pattern?: string, count?: number): Promise<[string, string[]]> {
    const keys = await this.keys(pattern || '*');
    const start = cursor;
    const end = start + (count || 10);
    const result = keys.slice(start, end);
    const nextCursor = end < keys.length ? end.toString() : '0';
    
    return [nextCursor, result];
  }

  multi(): RedisMulti {
    return new MockRedisMulti(this);
  }

  pipeline(): RedisPipeline {
    return new MockRedisPipeline(this);
  }

  async disconnect(): Promise<void> {
    this.store.clear();
  }
}

/**
 * Mock Redis multi implementation
 */
class MockRedisMulti implements RedisMulti {
  private commands: Array<() => Promise<any>> = [];

  constructor(private client: MockRedisClient) {}

  set(key: string, value: string): RedisMulti {
    this.commands.push(() => this.client.set(key, value));
    return this;
  }

  setex(key: string, seconds: number, value: string): RedisMulti {
    this.commands.push(() => this.client.setex(key, seconds, value));
    return this;
  }

  del(key: string): RedisMulti {
    this.commands.push(() => this.client.del(key));
    return this;
  }

  expire(key: string, seconds: number): RedisMulti {
    this.commands.push(() => this.client.expire(key, seconds));
    return this;
  }

  async exec(): Promise<Array<[Error | null, any]>> {
    const results: Array<[Error | null, any]> = [];
    
    for (const command of this.commands) {
      try {
        const result = await command();
        results.push([null, result]);
      } catch (error) {
        results.push([error as Error, null]);
      }
    }
    
    return results;
  }
}

/**
 * Mock Redis pipeline implementation
 */
class MockRedisPipeline implements RedisPipeline {
  private commands: Array<() => Promise<any>> = [];

  constructor(private client: MockRedisClient) {}

  get(key: string): RedisPipeline {
    this.commands.push(() => this.client.get(key));
    return this;
  }

  set(key: string, value: string): RedisPipeline {
    this.commands.push(() => this.client.set(key, value));
    return this;
  }

  del(key: string): RedisPipeline {
    this.commands.push(() => this.client.del(key));
    return this;
  }

  async exec(): Promise<Array<[Error | null, any]>> {
    const results: Array<[Error | null, any]> = [];
    
    for (const command of this.commands) {
      try {
        const result = await command();
        results.push([null, result]);
      } catch (error) {
        results.push([error as Error, null]);
      }
    }
    
    return results;
  }
}

// =============================================================================
// REDIS SESSION SERVICE
// =============================================================================

export class RedisSessionService {
  private client: RedisClient;
  private keyPrefix: string;
  private defaultExpiration: number;
  private metrics: SessionMetrics;

  constructor(
    config: RedisConfig,
    options: {
      keyPrefix?: string;
      defaultExpiration?: number;
      enableMetrics?: boolean;
    } = {}
  ) {
    // In a real implementation, you'd create a real Redis client here
    this.client = new MockRedisClient();
    this.keyPrefix = options.keyPrefix || 'session:';
    this.defaultExpiration = options.defaultExpiration || SESSION_CONFIG.TIMEOUT / 1000;
    
    this.metrics = {
      totalSessions: 0,
      activeSessions: 0,
      expiredSessions: 0,
      revokedSessions: 0,
      sessionsBySource: {} as Record<AuthSource, number>,
      sessionsByProvider: {} as Record<AuthProvider, number>,
      averageSessionDuration: 0,
      sessionsCreatedToday: 0,
      sessionsExpiredToday: 0,
      lastCleanup: new Date(),
    };

    this.startCleanupJob();
  }

  /**
   * Create a new session
   */
  async createSession(options: SessionCreateOptions): Promise<AuthSession> {
    try {
      const sessionId = generateSessionId() as SessionId;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (options.expiresIn || this.defaultExpiration) * 1000);

      const session: AuthSession = {
        id: sessionId,
        userId: options.userId,
        status: SessionStatus.ACTIVE,
        source: options.source,
        provider: options.provider,
        accessToken: generateSecureToken(32),
        refreshToken: generateSecureToken(32),
        tokenExpiresAt: expiresAt,
        refreshExpiresAt: new Date(expiresAt.getTime() + (30 * 24 * 60 * 60 * 1000)), // 30 days
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        location: options.location,
        deviceId: options.deviceId,
        deviceName: options.deviceName,
        deviceType: options.deviceType,
        createdAt: now,
        updatedAt: now,
        lastUsedAt: now,
        expiresAt,
      };

      // Store in Redis
      const sessionKey = this.getSessionKey(sessionId);
      const userSessionsKey = this.getUserSessionsKey(options.userId);
      
      const multi = this.client.multi();
      multi.setex(sessionKey, this.defaultExpiration, JSON.stringify(session));
      multi.set(userSessionsKey, JSON.stringify([sessionId]));
      
      await multi.exec();

      // Update metrics
      this.updateMetricsForCreation(session);

      return session;
    } catch (error) {
      throw createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        'Failed to create session',
        500,
        { originalError: error }
      );
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: SessionId): Promise<AuthSession | null> {
    try {
      const sessionKey = this.getSessionKey(sessionId);
      const sessionData = await this.client.get(sessionKey);
      
      if (!sessionData) {
        return null;
      }

      const session = JSON.parse(sessionData) as AuthSession;
      
      // Convert string dates back to Date objects
      session.createdAt = new Date(session.createdAt);
      session.updatedAt = new Date(session.updatedAt);
      session.lastUsedAt = new Date(session.lastUsedAt);
      session.expiresAt = new Date(session.expiresAt);
      session.tokenExpiresAt = new Date(session.tokenExpiresAt);
      if (session.refreshExpiresAt) {
        session.refreshExpiresAt = new Date(session.refreshExpiresAt);
      }

      // Check if session is expired
      if (this.isSessionExpired(session)) {
        await this.deleteSession(sessionId);
        return null;
      }

      return session;
    } catch (error) {
      throw createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        'Failed to get session',
        500,
        { sessionId, originalError: error }
      );
    }
  }

  /**
   * Update session
   */
  async updateSession(sessionId: SessionId, updates: SessionUpdateOptions): Promise<AuthSession> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw createAuthError(AuthErrorCode.SESSION_INVALID, 'Session not found');
      }

      // Apply updates
      if (updates.lastUsedAt) session.lastUsedAt = updates.lastUsedAt;
      if (updates.ipAddress) session.ipAddress = updates.ipAddress;
      if (updates.userAgent) session.userAgent = updates.userAgent;
      if (updates.location) session.location = updates.location;
      if (updates.metadata) {
        session.metadata = { ...session.metadata, ...updates.metadata };
      }

      session.updatedAt = new Date();

      // Save updated session
      const sessionKey = this.getSessionKey(sessionId);
      const ttl = await this.client.ttl(sessionKey);
      
      if (ttl > 0) {
        await this.client.setex(sessionKey, ttl, JSON.stringify(session));
      } else {
        await this.client.setex(sessionKey, this.defaultExpiration, JSON.stringify(session));
      }

      return session;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session not found')) {
        throw error;
      }
      throw createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        'Failed to update session',
        500,
        { sessionId, originalError: error }
      );
    }
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: SessionId): Promise<void> {
    try {
      const sessionKey = this.getSessionKey(sessionId);
      const session = await this.getSession(sessionId);
      
      await this.client.del(sessionKey);
      
      if (session) {
        // Remove from user sessions list
        await this.removeFromUserSessions(session.userId, sessionId);
        
        // Update metrics
        this.updateMetricsForDeletion(session);
      }
    } catch (error) {
      throw createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        'Failed to delete session',
        500,
        { sessionId, originalError: error }
      );
    }
  }

  /**
   * Revoke session
   */
  async revokeSession(sessionId: SessionId): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw createAuthError(AuthErrorCode.SESSION_INVALID, 'Session not found');
      }

      session.status = SessionStatus.REVOKED;
      session.updatedAt = new Date();

      const sessionKey = this.getSessionKey(sessionId);
      await this.client.setex(sessionKey, this.defaultExpiration, JSON.stringify(session));

      // Update metrics
      this.metrics.revokedSessions++;
    } catch (error) {
      throw createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        'Failed to revoke session',
        500,
        { sessionId, originalError: error }
      );
    }
  }

  /**
   * Get user sessions
   */
  async getUserSessions(userId: UserId, options: SessionQueryOptions = {}): Promise<AuthSession[]> {
    try {
      const userSessionsKey = this.getUserSessionsKey(userId);
      const sessionIdsData = await this.client.get(userSessionsKey);
      
      if (!sessionIdsData) {
        return [];
      }

      const sessionIds = JSON.parse(sessionIdsData) as SessionId[];
      const sessions: AuthSession[] = [];

      for (const sessionId of sessionIds) {
        const session = await this.getSession(sessionId);
        if (session) {
          // Apply filters
          if (options.source && session.source !== options.source) continue;
          if (options.provider && session.provider !== options.provider) continue;
          if (options.status && session.status !== options.status) continue;
          if (options.deviceId && session.deviceId !== options.deviceId) continue;

          sessions.push(session);
        }
      }

      // Apply pagination
      const start = options.offset || 0;
      const end = start + (options.limit || sessions.length);
      
      return sessions.slice(start, end);
    } catch (error) {
      throw createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        'Failed to get user sessions',
        500,
        { userId, originalError: error }
      );
    }
  }

  /**
   * Revoke all user sessions
   */
  async revokeAllUserSessions(userId: UserId, exceptSessionId?: SessionId): Promise<void> {
    try {
      const sessions = await this.getUserSessions(userId);
      
      for (const session of sessions) {
        if (exceptSessionId && session.id === exceptSessionId) {
          continue;
        }
        
        await this.revokeSession(session.id);
      }
    } catch (error) {
      throw createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        'Failed to revoke all user sessions',
        500,
        { userId, originalError: error }
      );
    }
  }

  /**
   * Extend session expiration
   */
  async extendSession(sessionId: SessionId, extensionSeconds: number = this.defaultExpiration): Promise<void> {
    try {
      const sessionKey = this.getSessionKey(sessionId);
      const session = await this.getSession(sessionId);
      
      if (!session) {
        throw createAuthError(AuthErrorCode.SESSION_INVALID, 'Session not found');
      }

      // Update expiration
      session.expiresAt = new Date(Date.now() + (extensionSeconds * 1000));
      session.lastUsedAt = new Date();
      session.updatedAt = new Date();

      await this.client.setex(sessionKey, extensionSeconds, JSON.stringify(session));
    } catch (error) {
      throw createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        'Failed to extend session',
        500,
        { sessionId, originalError: error }
      );
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const pattern = `${this.keyPrefix}*`;
      const keys = await this.client.keys(pattern);
      let cleanedCount = 0;

      for (const key of keys) {
        const sessionData = await this.client.get(key);
        if (sessionData) {
          const session = JSON.parse(sessionData) as AuthSession;
          session.expiresAt = new Date(session.expiresAt);
          
          if (this.isSessionExpired(session)) {
            await this.client.del(key);
            cleanedCount++;
          }
        }
      }

      this.metrics.lastCleanup = new Date();
      this.metrics.expiredSessions += cleanedCount;

      return cleanedCount;
    } catch (error) {
      throw createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        'Failed to cleanup expired sessions',
        500,
        { originalError: error }
      );
    }
  }

  /**
   * Get session metrics
   */
  getMetrics(): SessionMetrics {
    return { ...this.metrics };
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  }> {
    try {
      // Test Redis connection
      const testKey = `${this.keyPrefix}health_check`;
      await this.client.set(testKey, 'ok');
      const testValue = await this.client.get(testKey);
      await this.client.del(testKey);
      
      const isRedisHealthy = testValue === 'ok';
      
      return {
        status: isRedisHealthy ? 'healthy' : 'unhealthy',
        details: {
          redis: isRedisHealthy ? 'connected' : 'disconnected',
          metrics: this.metrics,
          keyPrefix: this.keyPrefix,
          defaultExpiration: this.defaultExpiration,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          redis: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          metrics: this.metrics,
        },
      };
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
    } catch (error) {
      console.error('Error disconnecting from Redis:', error);
    }
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  /**
   * Get session key
   */
  private getSessionKey(sessionId: SessionId): string {
    return `${this.keyPrefix}${sessionId}`;
  }

  /**
   * Get user sessions key
   */
  private getUserSessionsKey(userId: UserId): string {
    return `${this.keyPrefix}user:${userId}:sessions`;
  }

  /**
   * Check if session is expired
   */
  private isSessionExpired(session: AuthSession): boolean {
    return session.expiresAt < new Date();
  }

  /**
   * Remove session from user sessions list
   */
  private async removeFromUserSessions(userId: UserId, sessionId: SessionId): Promise<void> {
    try {
      const userSessionsKey = this.getUserSessionsKey(userId);
      const sessionIdsData = await this.client.get(userSessionsKey);
      
      if (sessionIdsData) {
        const sessionIds = JSON.parse(sessionIdsData) as SessionId[];
        const filteredIds = sessionIds.filter(id => id !== sessionId);
        
        if (filteredIds.length > 0) {
          await this.client.set(userSessionsKey, JSON.stringify(filteredIds));
        } else {
          await this.client.del(userSessionsKey);
        }
      }
    } catch (error) {
      console.error('Error removing session from user sessions:', error);
    }
  }

  /**
   * Update metrics for session creation
   */
  private updateMetricsForCreation(session: AuthSession): void {
    this.metrics.totalSessions++;
    this.metrics.activeSessions++;
    this.metrics.sessionsCreatedToday++;
    
    this.metrics.sessionsBySource[session.source] = (this.metrics.sessionsBySource[session.source] || 0) + 1;
    this.metrics.sessionsByProvider[session.provider] = (this.metrics.sessionsByProvider[session.provider] || 0) + 1;
  }

  /**
   * Update metrics for session deletion
   */
  private updateMetricsForDeletion(session: AuthSession): void {
    this.metrics.activeSessions = Math.max(0, this.metrics.activeSessions - 1);
    
    if (session.status === SessionStatus.EXPIRED) {
      this.metrics.expiredSessions++;
    }
  }

  /**
   * Start cleanup job
   */
  private startCleanupJob(): void {
    setInterval(async () => {
      try {
        await this.cleanupExpiredSessions();
      } catch (error) {
        console.error('Session cleanup job failed:', error);
      }
    }, 60 * 60 * 1000); // Run every hour
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create a Redis session service
 */
export function createRedisSessionService(
  config: RedisConfig,
  options?: {
    keyPrefix?: string;
    defaultExpiration?: number;
    enableMetrics?: boolean;
  }
): RedisSessionService {
  return new RedisSessionService(config, options);
}

/**
 * Create default Redis session service
 */
export function createDefaultRedisSessionService(): RedisSessionService {
  return createRedisSessionService({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
  });
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create session from user data
 */
export function createSessionFromUser(
  user: AuthenticatedUser,
  source: AuthSource,
  provider: AuthProvider,
  ipAddress?: string,
  userAgent?: string,
  deviceId?: string,
  deviceName?: string
): SessionCreateOptions {
  return {
    userId: user.id,
    source,
    provider,
    ipAddress,
    userAgent,
    deviceId,
    deviceName,
    metadata: {
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

/**
 * Check if session is still valid
 */
export function isSessionValid(session: AuthSession): boolean {
  return session.status === SessionStatus.ACTIVE && session.expiresAt > new Date();
}

/**
 * Check if session needs refresh
 */
export function sessionNeedsRefresh(session: AuthSession, thresholdMinutes: number = 15): boolean {
  const thresholdTime = new Date(Date.now() + (thresholdMinutes * 60 * 1000));
  return session.expiresAt <= thresholdTime;
}

/**
 * Get session age in minutes
 */
export function getSessionAge(session: AuthSession): number {
  return Math.floor((Date.now() - session.createdAt.getTime()) / (1000 * 60));
}

/**
 * Get session remaining time in minutes
 */
export function getSessionRemainingTime(session: AuthSession): number {
  return Math.max(0, Math.floor((session.expiresAt.getTime() - Date.now()) / (1000 * 60)));
}

/**
 * Check if session is from mobile device
 */
export function isMobileSession(session: AuthSession): boolean {
  return session.deviceType === 'mobile' || session.source === AuthSource.MOBILE;
}

/**
 * Check if session is from desktop app
 */
export function isDesktopSession(session: AuthSession): boolean {
  return session.source === AuthSource.DESKTOP;
}

/**
 * Get human-readable session info
 */
export function getSessionInfo(session: AuthSession): {
  age: string;
  remainingTime: string;
  device: string;
  location: string;
} {
  const age = getSessionAge(session);
  const remaining = getSessionRemainingTime(session);
  
  return {
    age: age < 60 ? `${age}m` : `${Math.floor(age / 60)}h ${age % 60}m`,
    remainingTime: remaining < 60 ? `${remaining}m` : `${Math.floor(remaining / 60)}h ${remaining % 60}m`,
    device: session.deviceName || session.deviceType || 'Unknown',
    location: session.location || 'Unknown',
  };
}

// =============================================================================
// DEFAULT INSTANCE
// =============================================================================

/**
 * Default Redis session service instance
 */
export const defaultRedisSessionService = createDefaultRedisSessionService();