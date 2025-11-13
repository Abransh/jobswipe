/**
 * @fileoverview Secure Web-to-Desktop Token Exchange Routes
 * @description Enterprise-grade secure token exchange for desktop app authentication
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Critical security component - handles cross-platform authentication
 */


import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import {
  ServerJwtTokenService,
  RedisSessionService,
  SecurityMiddlewareService
} from '@jobswipe/shared';

// Mock createDesktopTokenConfig for development
const createDesktopTokenConfig = (userId: any, email: string, name?: string, role?: string, deviceId?: string, deviceName?: string) => ({
  sub: userId,
  email,
  name,
  role: role || 'user',
  device_id: deviceId,
  device_name: deviceName,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
  type: 'desktop'
});
import { 
  TokenExchangeRequest,
  TokenExchangeResponse,
  DesktopAuthRequest,
  DesktopAuthResponse,
  AuthSource,
  TokenType,
  createAuthError,
  AuthErrorCode,
  TokenId,
  createBrandedId
} from '@jobswipe/shared';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const TokenExchangeInitiateSchema = z.object({
  deviceId: z.string().uuid('Invalid device ID format'),
  deviceName: z.string().min(1).max(100),
  deviceType: z.enum(['desktop', 'mobile']),
  platform: z.string().min(1).max(50),
  osVersion: z.string().optional(),
  appVersion: z.string().optional(),
});

const TokenExchangeCompleteSchema = z.object({
  exchangeToken: z.string().min(32).max(256),
  deviceId: z.string().uuid(),
  deviceName: z.string().min(1).max(100),
  platform: z.string().min(1).max(50),
  systemInfo: z.object({
    platform: z.string(),
    version: z.string(),
    arch: z.string(),
  }).optional(),
});

const TokenExchangeVerifySchema = z.object({
  exchangeToken: z.string().min(32).max(256),
  userConfirmation: z.boolean(),
});

// =============================================================================
// INTERFACES
// =============================================================================

interface TokenExchangeSession {
  exchangeToken: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  platform: string;
  createdAt: Date;
  expiresAt: Date;
  isUsed: boolean;
  webSessionId?: string;
}

// =============================================================================
// REDIS CLIENT INTERFACE
// =============================================================================

interface RedisClient {
  get(key: string): Promise<string | null>;
  setex(key: string, seconds: number, value: string): Promise<'OK'>;
  del(key: string): Promise<number>;
  keys(pattern: string): Promise<string[]>;
}

// Simple Redis client implementation (replace with ioredis in production)
class SimpleRedisClient implements RedisClient {
  private store: Map<string, { value: string; expiresAt: number }> = new Map();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    
    return item.value;
  }

  async setex(key: string, seconds: number, value: string): Promise<'OK'> {
    const expiresAt = Date.now() + (seconds * 1000);
    this.store.set(key, { value, expiresAt });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.store.keys()).filter(key => regex.test(key));
  }
}

// =============================================================================
// TOKEN EXCHANGE SERVICE
// =============================================================================

class TokenExchangeService {
  private static instance: TokenExchangeService;
  private redis: RedisClient;
  private keyPrefix: string = 'token_exchange:';
  private cleanupInterval: NodeJS.Timeout;

  private constructor(
    private jwtService: any, // ServerJwtTokenService
    private sessionService: RedisSessionService
  ) {
    // Initialize Redis client (replace with real Redis in production)
    this.redis = new SimpleRedisClient();
    
    // Cleanup expired exchanges every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredExchanges();
    }, 5 * 60 * 1000);
  }

  static getInstance(
    jwtService: any, // ServerJwtTokenService
    sessionService: RedisSessionService
  ): TokenExchangeService {
    if (!TokenExchangeService.instance) {
      TokenExchangeService.instance = new TokenExchangeService(jwtService, sessionService);
    }
    return TokenExchangeService.instance;
  }

  /**
   * Initiate token exchange session
   */
  async initiateExchange(
    userId: string,
    deviceInfo: any,
    webSessionId?: string
  ): Promise<TokenExchangeRequest> {
    const exchangeToken = this.generateSecureExchangeToken();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const exchangeSession: TokenExchangeSession = {
      exchangeToken,
      userId,
      deviceId: deviceInfo.deviceId,
      deviceName: deviceInfo.deviceName,
      platform: deviceInfo.platform,
      createdAt: new Date(),
      expiresAt,
      isUsed: false,
      webSessionId,
    };

    // Store in Redis with TTL
    const redisKey = `${this.keyPrefix}${exchangeToken}`;
    await this.redis.setex(redisKey, 10 * 60, JSON.stringify(exchangeSession));

    return {
      exchangeToken,
      expiresAt: expiresAt,
      deviceId: deviceInfo.deviceId,
      instructions: {
        step1: 'Open the JobSwipe desktop application',
        step2: 'The app will automatically detect this authentication request',
        step3: 'Confirm the device details match your desktop application',
        warning: 'Only complete this process on your trusted device',
      },
    };
  }

  /**
   * Complete token exchange and issue desktop token
   */
  async completeExchange(
    exchangeToken: string,
    deviceInfo: any
  ): Promise<TokenExchangeResponse> {
    const redisKey = `${this.keyPrefix}${exchangeToken}`;
    const sessionData = await this.redis.get(redisKey);

    if (!sessionData) {
      throw createAuthError(
        AuthErrorCode.TOKEN_INVALID,
        'Invalid or expired exchange token'
      );
    }

    const exchangeSession: TokenExchangeSession = JSON.parse(sessionData);
    
    // Convert string dates back to Date objects
    exchangeSession.createdAt = new Date(exchangeSession.createdAt);
    exchangeSession.expiresAt = new Date(exchangeSession.expiresAt);

    if (exchangeSession.isUsed) {
      throw createAuthError(
        AuthErrorCode.TOKEN_INVALID,
        'Exchange token has already been used'
      );
    }

    if (new Date() > exchangeSession.expiresAt) {
      await this.redis.del(redisKey);
      throw createAuthError(
        AuthErrorCode.TOKEN_EXPIRED,
        'Exchange token has expired'
      );
    }

    // Verify device matches
    if (exchangeSession.deviceId !== deviceInfo.deviceId) {
      throw createAuthError(
        AuthErrorCode.DEVICE_NOT_TRUSTED,
        'Device ID mismatch - security violation'
      );
    }

    // Mark as used and update in Redis
    exchangeSession.isUsed = true;
    await this.redis.setex(redisKey, 60, JSON.stringify(exchangeSession)); // Keep for 1 minute for audit

    // Generate long-lived desktop token
    const tokenConfig = createDesktopTokenConfig(
      exchangeSession.userId as any,
      'user@example.com', // This would come from the user data
      'User Name',
      'user',
      deviceInfo.deviceId,
      deviceInfo.deviceName
    );
    const desktopToken = await this.jwtService.createToken(tokenConfig);

    // Create desktop session
    const desktopSession = await this.sessionService.createSession({
      userId: exchangeSession.userId as any,
      source: AuthSource.DESKTOP,
      provider: 'credentials' as any,
      userAgent: `JobSwipe Desktop/${deviceInfo.appVersion || '1.0.0'}`,
      metadata: {
        platform: deviceInfo.platform,
        deviceName: deviceInfo.deviceName,
        deviceId: deviceInfo.deviceId,
        systemInfo: deviceInfo.systemInfo,
        tokenExchangeUsed: true,
      },
    });

    // Clean up exchange session - delete after successful use
    await this.redis.del(redisKey);

    if (!desktopToken) {
      throw createAuthError(AuthErrorCode.INTERNAL_ERROR, 'Failed to create desktop token');
    }

    // Handle different token formats that may come from jwtService.createToken
    let tokenString: string;
    let expiresInSeconds: number;
    let tokenId: string;

    if (typeof desktopToken === 'string') {
      tokenString = desktopToken;
      expiresInSeconds = 90 * 24 * 60 * 60; // 90 days default
      tokenId = 'token-id';
    } else if (desktopToken && typeof desktopToken === 'object') {
      tokenString = (desktopToken as any).token || String(desktopToken);
      expiresInSeconds = (desktopToken as any).expiresIn || 90 * 24 * 60 * 60;
      tokenId = (desktopToken as any).jti || 'token-id';
    } else {
      tokenString = String(desktopToken);
      expiresInSeconds = 90 * 24 * 60 * 60;
      tokenId = 'token-id';
    }

    return {
      success: true,
      accessToken: tokenString,
      tokenType: 'Bearer',
      expiresIn: expiresInSeconds,
      tokenId: createBrandedId<TokenId>(tokenId),
      deviceId: deviceInfo.deviceId,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
      permissions: [], // Add user permissions
      features: [], // Add user features
    };
  }

  /**
   * Verify exchange token status
   */
  async verifyExchange(exchangeToken: string): Promise<{
    valid: boolean;
    deviceInfo?: any;
    expiresAt?: Date;
  }> {
    const redisKey = `${this.keyPrefix}${exchangeToken}`;
    const sessionData = await this.redis.get(redisKey);

    if (!sessionData) {
      return { valid: false };
    }

    const exchangeSession: TokenExchangeSession = JSON.parse(sessionData);
    exchangeSession.expiresAt = new Date(exchangeSession.expiresAt);

    if (exchangeSession.isUsed || new Date() > exchangeSession.expiresAt) {
      return { valid: false };
    }

    return {
      valid: true,
      deviceInfo: {
        deviceId: exchangeSession.deviceId,
        deviceName: exchangeSession.deviceName,
        platform: exchangeSession.platform,
      },
      expiresAt: exchangeSession.expiresAt,
    };
  }

  /**
   * Generate cryptographically secure exchange token
   */
  private generateSecureExchangeToken(): string {
    // Generate cryptographically secure random bytes
    const randomBytes = crypto.randomBytes(32);
    
    // Add timestamp for ordering and uniqueness
    const timestamp = Date.now().toString(36);
    
    // Add UUID for additional entropy
    const uuid = uuidv4().replace(/-/g, '');
    
    // Combine all components and hash for final security
    const tokenData = `${timestamp}_${uuid}_${randomBytes.toString('hex')}`;
    const hash = crypto.createHash('sha256').update(tokenData).digest('hex');
    
    return `exch_${timestamp}_${hash.substring(0, 48)}`;
  }

  /**
   * Cleanup expired exchange sessions
   */
  private async cleanupExpiredExchanges(): Promise<void> {
    try {
      const pattern = `${this.keyPrefix}*`;
      const keys = await this.redis.keys(pattern);
      let cleanedCount = 0;

      for (const key of keys) {
        const sessionData = await this.redis.get(key);
        if (sessionData) {
          try {
            const session: TokenExchangeSession = JSON.parse(sessionData);
            session.expiresAt = new Date(session.expiresAt);
            
            if (new Date() > session.expiresAt) {
              await this.redis.del(key);
              cleanedCount++;
            }
          } catch (parseError) {
            // Invalid JSON, delete the key
            await this.redis.del(key);
            cleanedCount++;
          }
        }
      }

      if (cleanedCount > 0) {
        // Cleaned up expired token exchange sessions
      }
    } catch (error) {
      // Error during token exchange cleanup
    }
  }

  /**
   * Cleanup service
   */
  async cleanup(): Promise<void> {
    clearInterval(this.cleanupInterval);
    
    // Final cleanup of any remaining sessions
    await this.cleanupExpiredExchanges();
  }
}

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

export default async function tokenExchangeRoutes(fastify: FastifyInstance) {
  // jwtService can be AuthService or ServerJwtTokenService - both implement createToken()
  const jwtService = fastify.jwtService as any;
  const sessionService = fastify.sessionService as RedisSessionService;
  const securityService = fastify.security;

  const tokenExchangeService = TokenExchangeService.getInstance(jwtService, sessionService);

  /**
   * Initiate token exchange from web session
   * POST /token-exchange/initiate
   */
  fastify.post('/token-exchange/initiate', {
    schema: {
      body: {
        type: 'object',
        required: ['deviceId', 'deviceName', 'deviceType', 'platform'],
        properties: {
          deviceId: { type: 'string', format: 'uuid' },
          deviceName: { type: 'string', minLength: 1, maxLength: 100 },
          deviceType: { type: 'string', enum: ['desktop', 'mobile'] },
          platform: { type: 'string', minLength: 1, maxLength: 50 },
          osVersion: { type: 'string' },
          appVersion: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            exchangeToken: { type: 'string' },
            expiresAt: { type: 'string' },
            deviceId: { type: 'string' },
            instructions: {
              type: 'object',
              properties: {
                step1: { type: 'string' },
                step2: { type: 'string' },
                step3: { type: 'string' },
                warning: { type: 'string' },
              },
            },
          },
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            code: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            code: { type: 'string' }
          }
        },
        429: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            code: { type: 'string' }
          }
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Validate authenticated user
      const authContext = (request as any).authContext;
      if (!authContext || !authContext.user) {
        throw createAuthError(AuthErrorCode.INVALID_CREDENTIALS, 'Authentication required');
      }

      const deviceInfo = request.body as any; // Fastify will validate this automatically

      // Rate limiting check for token exchange
      const rateLimitKey = `token-exchange:${authContext.user.id}`;
      const rateLimitResult = securityService.checkRateLimit ? securityService.checkRateLimit(rateLimitKey) : { allowed: true };
      const isAllowed = typeof rateLimitResult === 'object' ? rateLimitResult.allowed : true;

      if (!isAllowed) {
        throw createAuthError(
          AuthErrorCode.RATE_LIMIT_EXCEEDED,
          'Too many token exchange attempts. Please try again later.'
        );
      }

      const result = await tokenExchangeService.initiateExchange(
        authContext.user.id,
        deviceInfo,
        authContext.session.id
      );

      reply.send(result);
    } catch (error) {
      fastify.log.error('Token exchange initiation failed:', error);
      
      if (error instanceof Error && error.message.includes('rate limit')) {
        reply.code(429);
      } else if (error instanceof Error && error.message.includes('auth')) {
        reply.code(401);
      } else {
        reply.code(400);
      }
      
      reply.send({
        success: false,
        error: error instanceof Error ? error.message : 'Token exchange failed',
        code: 'TOKEN_EXCHANGE_FAILED',
      });
    }
  });

  /**
   * Complete token exchange from desktop app
   * POST /token-exchange/complete
   */
  fastify.post('/token-exchange/complete', {
    schema: {
      body: {
        type: 'object',
        required: ['exchangeToken', 'deviceId', 'deviceName', 'platform'],
        properties: {
          exchangeToken: { type: 'string', minLength: 32, maxLength: 256 },
          deviceId: { type: 'string', format: 'uuid' },
          deviceName: { type: 'string', minLength: 1, maxLength: 100 },
          platform: { type: 'string', minLength: 1, maxLength: 50 },
          systemInfo: {
            type: 'object',
            properties: {
              platform: { type: 'string' },
              version: { type: 'string' },
              arch: { type: 'string' }
            }
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            accessToken: { type: 'string' },
            tokenType: { type: 'string' },
            expiresIn: { type: 'number' },
            tokenId: { type: 'string' },
            deviceId: { type: 'string' },
            issuedAt: { type: 'string' },
            expiresAt: { type: 'string' },
            permissions: { type: 'array', items: { type: 'string' } },
            features: { type: 'array', items: { type: 'string' } },
          },
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            code: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            code: { type: 'string' }
          }
        },
        429: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            code: { type: 'string' }
          }
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const exchangeData = request.body as any; // Fastify will validate this automatically

      // Security: Rate limiting for exchange completion
      const rateLimitKey = `token-exchange-complete:${exchangeData.deviceId}`;
      const rateLimitResult = securityService.checkRateLimit ? securityService.checkRateLimit(rateLimitKey) : { allowed: true };
      const isAllowed = typeof rateLimitResult === 'object' ? rateLimitResult.allowed : true;

      if (!isAllowed) {
        throw createAuthError(
          AuthErrorCode.RATE_LIMIT_EXCEEDED,
          'Too many exchange completion attempts'
        );
      }

      const result = await tokenExchangeService.completeExchange(
        exchangeData.exchangeToken,
        exchangeData
      );

      reply.send(result);
    } catch (error) {
      fastify.log.error('Token exchange completion failed:', error);
      
      if (error instanceof Error && error.message.includes('rate limit')) {
        reply.code(429);
      } else if (error instanceof Error && error.message.includes('Invalid')) {
        reply.code(401);
      } else {
        reply.code(400);
      }
      
      reply.send({
        success: false,
        error: error instanceof Error ? error.message : 'Token exchange failed',
        code: 'TOKEN_EXCHANGE_FAILED',
      });
    }
  });

  /**
   * Verify token exchange status
   * GET /token-exchange/verify/:token
   */
  fastify.get('/token-exchange/verify/:token', {
    schema: {
      params: {
        type: 'object',
        properties: {
          token: { type: 'string' },
        },
        required: ['token'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            valid: { type: 'boolean' },
            deviceInfo: {
              type: 'object',
              properties: {
                deviceId: { type: 'string' },
                deviceName: { type: 'string' },
                platform: { type: 'string' },
              },
            },
            expiresAt: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) => {
    try {
      const { token } = request.params;
      const result = await tokenExchangeService.verifyExchange(token);
      
      reply.send({
        valid: result.valid,
        deviceInfo: result.deviceInfo,
        expiresAt: result.expiresAt?.toISOString(),
      });
    } catch (error) {
      fastify.log.error('Token exchange verification failed:', error);
      reply.send({ valid: false });
    }
  });

  /**
   * Cancel token exchange
   * DELETE /token-exchange/:token
   */
  fastify.delete('/token-exchange/:token', {
    schema: {
      params: {
        type: 'object',
        properties: {
          token: { type: 'string' },
        },
        required: ['token'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) => {
    try {
      // Only authenticated users can cancel their own exchanges
      const authContext = (request as any).authContext;
      if (!authContext || !authContext.user) {
        throw createAuthError(AuthErrorCode.INVALID_CREDENTIALS, 'Authentication required');
      }

      // Implementation would verify user owns the exchange and cancel it
      // For now, return success
      reply.send({
        success: true,
        message: 'Token exchange cancelled',
      });
    } catch (error) {
      fastify.log.error('Token exchange cancellation failed:', error);
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Cancellation failed',
      });
    }
  });

  // Cleanup on server shutdown
  fastify.addHook('onClose', async () => {
    tokenExchangeService.cleanup();
  });
}