/**
 * @fileoverview Server-Only JWT Token Service with RS256 and key rotation for JobSwipe
 * @description Enterprise-grade JWT token management - SERVER SIDE ONLY
 * @version 1.0.0
 * @author JobSwipe Team
 * @environment server-only
 */

import crypto from 'crypto';
import { JwtPayload, TokenType, AuthSource, UserId, SessionId, TokenId } from '../types/auth';
import { createAuthError, AuthErrorCode } from '../types/auth';
import { JWT_CONFIG } from '../constants';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * JWT key pair for signing and verification
 */
interface JwtKeyPair {
  privateKey: string;
  publicKey: string;
  keyId: string;
  createdAt: Date;
  expiresAt: Date;
  algorithm: string;
}

/**
 * JWT token configuration
 */
interface JwtTokenConfig {
  expiresIn: number;
  audience: string;
  issuer: string;
  subject: string;
  tokenType: TokenType;
  source: AuthSource;
  sessionId?: SessionId;
  permissions?: string[];
  features?: string[];
  metadata?: Record<string, any>;
}

/**
 * JWT verification result
 */
interface JwtVerificationResult {
  valid: boolean;
  payload?: JwtPayload;
  error?: string;
  expired?: boolean;
  needsRefresh?: boolean;
}

/**
 * Token metrics for monitoring
 */
interface TokenMetrics {
  tokensIssued: number;
  tokensVerified: number;
  tokensRevoked: number;
  keyRotations: number;
  errors: number;
  lastKeyRotation: Date;
}

// =============================================================================
// SERVER JWT TOKEN SERVICE
// =============================================================================

export class ServerJwtTokenService {
  private keyPairs: Map<string, JwtKeyPair> = new Map();
  private currentKeyId: string | null = null;
  private revokedTokens: Set<string> = new Set();
  private keyRotationInterval: NodeJS.Timer | null = null;
  private cleanupInterval: NodeJS.Timer | null = null;
  private metrics: TokenMetrics = {
    tokensIssued: 0,
    tokensVerified: 0,
    tokensRevoked: 0,
    keyRotations: 0,
    errors: 0,
    lastKeyRotation: new Date(),
  };

  constructor(
    private readonly keyRotationIntervalMs: number = 24 * 60 * 60 * 1000, // 24 hours
    private readonly maxKeyAge: number = 7 * 24 * 60 * 60 * 1000, // 7 days
    private readonly revokedTokensCleanupIntervalMs: number = 60 * 60 * 1000 // 1 hour
  ) {
    // Validate server environment
    if (typeof window !== 'undefined') {
      throw createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        'ServerJwtTokenService can only be used in server environments',
        500
      );
    }

    this.initialize();
  }

  /**
   * Initialize the JWT service
   */
  private async initialize(): Promise<void> {
    try {
      // Generate initial key pair
      await this.generateKeyPair();

      // Set up key rotation interval
      this.keyRotationInterval = setInterval(() => {
        this.rotateKeys().catch(error => {
          console.error('Key rotation failed:', error);
          this.metrics.errors++;
        });
      }, this.keyRotationIntervalMs);

      // Set up revoked tokens cleanup
      this.cleanupInterval = setInterval(() => {
        this.cleanupRevokedTokens();
      }, this.revokedTokensCleanupIntervalMs);

      console.log('Server JWT Token Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Server JWT Token Service:', error);
      throw new Error('Server JWT service initialization failed');
    }
  }

  /**
   * Generate a new RSA key pair
   */
  private async generateKeyPair(): Promise<JwtKeyPair> {
    try {
      const keyId = crypto.randomUUID();
      const keyPair = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      });

      const jwtKeyPair: JwtKeyPair = {
        privateKey: keyPair.privateKey,
        publicKey: keyPair.publicKey,
        keyId,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.maxKeyAge),
        algorithm: JWT_CONFIG.ALGORITHM,
      };

      // Store the key pair
      this.keyPairs.set(keyId, jwtKeyPair);

      // Set as current key if no current key exists
      if (!this.currentKeyId) {
        this.currentKeyId = keyId;
      }

      return jwtKeyPair;
    } catch (error) {
      this.metrics.errors++;
      throw new Error(`Failed to generate key pair: ${error}`);
    }
  }

  /**
   * Rotate encryption keys
   */
  private async rotateKeys(): Promise<void> {
    try {
      console.log('Starting key rotation...');

      // Generate new key pair
      const newKeyPair = await this.generateKeyPair();
      this.currentKeyId = newKeyPair.keyId;

      // Remove expired keys
      const now = new Date();
      for (const [keyId, keyPair] of this.keyPairs.entries()) {
        if (keyPair.expiresAt < now) {
          this.keyPairs.delete(keyId);
          console.log(`Removed expired key: ${keyId}`);
        }
      }

      this.metrics.keyRotations++;
      this.metrics.lastKeyRotation = now;

      console.log(`Key rotation completed. New key ID: ${this.currentKeyId}`);
    } catch (error) {
      this.metrics.errors++;
      console.error('Key rotation failed:', error);
      throw error;
    }
  }

  /**
   * Get the current signing key
   */
  private getCurrentKey(): JwtKeyPair {
    if (!this.currentKeyId) {
      throw createAuthError(AuthErrorCode.INTERNAL_ERROR, 'No current signing key available');
    }

    const keyPair = this.keyPairs.get(this.currentKeyId);
    if (!keyPair) {
      throw createAuthError(AuthErrorCode.INTERNAL_ERROR, 'Current signing key not found');
    }

    return keyPair;
  }

  /**
   * Get a key by ID for verification
   */
  private getKeyById(keyId: string): JwtKeyPair | undefined {
    return this.keyPairs.get(keyId);
  }

  /**
   * Create a JWT token
   */
  async createToken(config: JwtTokenConfig): Promise<string> {
    try {
      const currentKey = this.getCurrentKey();
      const now = Math.floor(Date.now() / 1000);
      const tokenId = crypto.randomUUID() as TokenId;

      // Create JWT payload
      const payload: JwtPayload = {
        sub: config.subject as UserId,
        email: config.metadata?.email || '',
        name: config.metadata?.name,
        role: config.metadata?.role || 'user',
        iat: now,
        exp: now + config.expiresIn,
        aud: config.audience,
        iss: config.issuer,
        jti: tokenId,
        type: config.tokenType,
        source: config.source,
        sessionId: config.sessionId,
        permissions: config.permissions || [],
        features: config.features || [],
        ...config.metadata,
      };

      // Create JWT header
      const header = {
        alg: JWT_CONFIG.ALGORITHM,
        typ: 'JWT',
        kid: currentKey.keyId,
      };

      // Encode header and payload
      const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
      const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));

      // Create signature
      const signatureInput = `${encodedHeader}.${encodedPayload}`;
      const signature = crypto
        .createSign('RSA-SHA256')
        .update(signatureInput)
        .sign(currentKey.privateKey, 'base64url');

      // Combine to create JWT
      const token = `${signatureInput}.${signature}`;

      this.metrics.tokensIssued++;

      return token;
    } catch (error) {
      this.metrics.errors++;
      throw createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        'Failed to create JWT token',
        500,
        { originalError: error }
      );
    }
  }

  /**
   * Verify a JWT token
   */
  async verifyToken(token: string): Promise<JwtVerificationResult> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token format' };
      }

      const [encodedHeader, encodedPayload, signature] = parts;

      // Decode header and payload
      const header = JSON.parse(this.base64UrlDecode(encodedHeader));
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload)) as JwtPayload;

      // Check if token is revoked
      if (this.revokedTokens.has(payload.jti)) {
        return { valid: false, error: 'Token has been revoked' };
      }

      // Get key for verification
      const keyPair = this.getKeyById(header.kid);
      if (!keyPair) {
        return { valid: false, error: 'Unknown key ID' };
      }

      // Verify signature
      const signatureInput = `${encodedHeader}.${encodedPayload}`;
      const isValidSignature = crypto
        .createVerify('RSA-SHA256')
        .update(signatureInput)
        .verify(keyPair.publicKey, signature, 'base64url');

      if (!isValidSignature) {
        return { valid: false, error: 'Invalid signature' };
      }

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return { valid: false, error: 'Token has expired', expired: true };
      }

      // Check if token needs refresh (within 5 minutes of expiry)
      const needsRefresh = payload.exp - now < 300;

      // Verify audience and issuer
      if (payload.aud !== JWT_CONFIG.AUDIENCE || payload.iss !== JWT_CONFIG.ISSUER) {
        return { valid: false, error: 'Invalid audience or issuer' };
      }

      this.metrics.tokensVerified++;

      return {
        valid: true,
        payload,
        needsRefresh,
      };
    } catch (error) {
      this.metrics.errors++;
      return { valid: false, error: 'Token verification failed' };
    }
  }

  /**
   * Revoke a token
   */
  async revokeToken(tokenId: string): Promise<void> {
    try {
      this.revokedTokens.add(tokenId);
      this.metrics.tokensRevoked++;
    } catch (error) {
      this.metrics.errors++;
      throw createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        'Failed to revoke token',
        500,
        { tokenId, originalError: error }
      );
    }
  }

  /**
   * Revoke all tokens for a user (placeholder for session invalidation)
   */
  async revokeUserTokens(userId: UserId): Promise<void> {
    try {
      // In a real implementation, you'd track tokens by user in the database
      console.log(`Revoking all tokens for user: ${userId}`);
      this.metrics.tokensRevoked++;
    } catch (error) {
      this.metrics.errors++;
      throw createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        'Failed to revoke user tokens',
        500,
        { userId, originalError: error }
      );
    }
  }

  /**
   * Clean up expired revoked tokens
   */
  private cleanupRevokedTokens(): void {
    try {
      console.log(`Cleaning up revoked tokens. Current count: ${this.revokedTokens.size}`);
      
      // Clear very old tokens (simplified approach)
      if (this.revokedTokens.size > 10000) {
        this.revokedTokens.clear();
        console.log('Cleared old revoked tokens');
      }
    } catch (error) {
      this.metrics.errors++;
      console.error('Failed to cleanup revoked tokens:', error);
    }
  }

  /**
   * Get all public keys for verification
   */
  getPublicKeys(): Array<{ keyId: string; publicKey: string; algorithm: string }> {
    const publicKeys: Array<{ keyId: string; publicKey: string; algorithm: string }> = [];
    
    for (const [keyId, keyPair] of this.keyPairs.entries()) {
      publicKeys.push({
        keyId,
        publicKey: keyPair.publicKey,
        algorithm: keyPair.algorithm,
      });
    }
    
    return publicKeys;
  }

  /**
   * Get service metrics
   */
  getMetrics(): TokenMetrics {
    return { ...this.metrics };
  }

  /**
   * Get service health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  } {
    const hasCurrentKey = this.currentKeyId && this.keyPairs.has(this.currentKeyId);
    const keyCount = this.keyPairs.size;
    const errorRate = this.metrics.errors / Math.max(this.metrics.tokensIssued + this.metrics.tokensVerified, 1);
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (!hasCurrentKey || keyCount === 0) {
      status = 'unhealthy';
    } else if (errorRate > 0.1 || keyCount < 2) {
      status = 'degraded';
    }
    
    return {
      status,
      details: {
        currentKeyId: this.currentKeyId,
        keyCount,
        revokedTokensCount: this.revokedTokens.size,
        errorRate,
        lastKeyRotation: this.metrics.lastKeyRotation,
        metrics: this.metrics,
      },
    };
  }

  /**
   * Base64URL encode
   */
  private base64UrlEncode(data: string): string {
    return Buffer.from(data, 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Base64URL decode
   */
  private base64UrlDecode(data: string): string {
    // Add padding if needed
    const padded = data + '==='.slice(0, (4 - (data.length % 4)) % 4);
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(base64, 'base64').toString('utf8');
  }

  /**
   * Shutdown the service gracefully
   */
  async shutdown(): Promise<void> {
    try {
      // Clear intervals
      if (this.keyRotationInterval) {
        clearInterval(this.keyRotationInterval);
        this.keyRotationInterval = null;
      }
      
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }
      
      // Clear sensitive data
      this.keyPairs.clear();
      this.revokedTokens.clear();
      this.currentKeyId = null;
      
      console.log('Server JWT Token Service shutdown completed');
    } catch (error) {
      console.error('Error during Server JWT service shutdown:', error);
    }
  }
}

// =============================================================================
// FACTORY FUNCTIONS AND CONFIGURATIONS
// =============================================================================

/**
 * Create access token configuration
 */
export function createAccessTokenConfig(
  userId: UserId,
  email: string,
  name?: string,
  role: string = 'user',
  source: AuthSource = AuthSource.WEB,
  sessionId?: SessionId,
  permissions?: string[],
  features?: string[]
): JwtTokenConfig {
  return {
    expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
    audience: JWT_CONFIG.AUDIENCE,
    issuer: JWT_CONFIG.ISSUER,
    subject: userId,
    tokenType: TokenType.ACCESS,
    source,
    sessionId,
    permissions,
    features,
    metadata: {
      email,
      name,
      role,
    },
  };
}

/**
 * Create refresh token configuration
 */
export function createRefreshTokenConfig(
  userId: UserId,
  email: string,
  source: AuthSource = AuthSource.WEB,
  sessionId?: SessionId
): JwtTokenConfig {
  return {
    expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRY,
    audience: JWT_CONFIG.AUDIENCE,
    issuer: JWT_CONFIG.ISSUER,
    subject: userId,
    tokenType: TokenType.REFRESH,
    source,
    sessionId,
    metadata: {
      email,
    },
  };
}

/**
 * Create desktop long-lived token configuration
 */
export function createDesktopTokenConfig(
  userId: UserId,
  email: string,
  name?: string,
  role: string = 'user',
  deviceId?: string,
  deviceName?: string,
  permissions?: string[],
  features?: string[]
): JwtTokenConfig {
  return {
    expiresIn: JWT_CONFIG.DESKTOP_TOKEN_EXPIRY,
    audience: JWT_CONFIG.AUDIENCE,
    issuer: JWT_CONFIG.ISSUER,
    subject: userId,
    tokenType: TokenType.DESKTOP_LONG_LIVED,
    source: AuthSource.DESKTOP,
    permissions,
    features,
    metadata: {
      email,
      name,
      role,
      deviceId,
      deviceName,
    },
  };
}

/**
 * Create verification token configuration
 */
export function createVerificationTokenConfig(
  userId: UserId,
  email: string,
  purpose: 'email_verification' | 'password_reset' = 'email_verification'
): JwtTokenConfig {
  return {
    expiresIn: JWT_CONFIG.VERIFICATION_TOKEN_EXPIRY,
    audience: JWT_CONFIG.AUDIENCE,
    issuer: JWT_CONFIG.ISSUER,
    subject: userId,
    tokenType: TokenType.VERIFICATION,
    source: AuthSource.API,
    metadata: {
      email,
      purpose,
    },
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Extract user ID from JWT payload
 */
export function extractUserIdFromPayload(payload: JwtPayload): UserId {
  return payload.sub;
}

/**
 * Extract session ID from JWT payload
 */
export function extractSessionIdFromPayload(payload: JwtPayload): SessionId | undefined {
  return payload.sessionId;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(payload: JwtPayload): boolean {
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * Check if token needs refresh
 */
export function tokenNeedsRefresh(payload: JwtPayload, thresholdSeconds: number = 300): boolean {
  const now = Math.floor(Date.now() / 1000);
  return payload.exp - now < thresholdSeconds;
}

/**
 * Get token expiration time
 */
export function getTokenExpirationTime(payload: JwtPayload): Date {
  return new Date(payload.exp * 1000);
}

/**
 * Get token issued time
 */
export function getTokenIssuedTime(payload: JwtPayload): Date {
  return new Date(payload.iat * 1000);
}

/**
 * Check if token is for desktop usage
 */
export function isDesktopToken(payload: JwtPayload): boolean {
  return payload.source === AuthSource.DESKTOP || payload.type === TokenType.DESKTOP_LONG_LIVED;
}

/**
 * Check if token has permission
 */
export function tokenHasPermission(payload: JwtPayload, permission: string): boolean {
  return payload.permissions?.includes(permission) || false;
}

/**
 * Check if token has feature access
 */
export function tokenHasFeature(payload: JwtPayload, feature: string): boolean {
  return payload.features?.includes(feature) || false;
}

export type { JwtTokenConfig, JwtVerificationResult, TokenMetrics };