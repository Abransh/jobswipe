/**
 * @fileoverview JWT Token Service with RS256 and key rotation for JobSwipe
 * @description Enterprise-grade JWT token management with security features
 * @version 1.0.0
 * @author JobSwipe Team
 */
import { JwtPayload, TokenType, AuthSource, UserId, SessionId } from '../types/auth';
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
export declare class JwtTokenService {
    private readonly keyRotationInterval;
    private readonly maxKeyAge;
    private readonly revokedTokensCleanupInterval;
    private keyPairs;
    private currentKeyId;
    private revokedTokens;
    private metrics;
    constructor(keyRotationInterval?: number, // 24 hours
    maxKeyAge?: number, // 7 days
    revokedTokensCleanupInterval?: number);
    /**
     * Initialize the JWT service
     */
    private initialize;
    /**
     * Generate a new RSA key pair
     */
    private generateKeyPair;
    /**
     * Rotate encryption keys
     */
    private rotateKeys;
    /**
     * Get the current signing key
     */
    private getCurrentKey;
    /**
     * Get a key by ID for verification
     */
    private getKeyById;
    /**
     * Create a JWT token
     */
    createToken(config: JwtTokenConfig): Promise<string>;
    /**
     * Verify a JWT token
     */
    verifyToken(token: string): Promise<JwtVerificationResult>;
    /**
     * Revoke a token
     */
    revokeToken(tokenId: string): Promise<void>;
    /**
     * Revoke all tokens for a user
     */
    revokeUserTokens(userId: UserId): Promise<void>;
    /**
     * Clean up expired revoked tokens
     */
    private cleanupRevokedTokens;
    /**
     * Get all public keys for verification
     */
    getPublicKeys(): Array<{
        keyId: string;
        publicKey: string;
        algorithm: string;
    }>;
    /**
     * Get service metrics
     */
    getMetrics(): TokenMetrics;
    /**
     * Get service health status
     */
    getHealthStatus(): {
        status: 'healthy' | 'degraded' | 'unhealthy';
        details: Record<string, any>;
    };
    /**
     * Base64URL encode
     */
    private base64UrlEncode;
    /**
     * Base64URL decode
     */
    private base64UrlDecode;
    /**
     * Shutdown the service gracefully
     */
    shutdown(): Promise<void>;
}
/**
 * Create a JWT token service instance
 */
export declare function createJwtTokenService(config?: {
    keyRotationInterval?: number;
    maxKeyAge?: number;
    revokedTokensCleanupInterval?: number;
}): JwtTokenService;
/**
 * Create access token configuration
 */
export declare function createAccessTokenConfig(userId: UserId, email: string, name?: string, role?: string, source?: AuthSource, sessionId?: SessionId, permissions?: string[], features?: string[]): JwtTokenConfig;
/**
 * Create refresh token configuration
 */
export declare function createRefreshTokenConfig(userId: UserId, email: string, source?: AuthSource, sessionId?: SessionId): JwtTokenConfig;
/**
 * Create desktop long-lived token configuration
 */
export declare function createDesktopTokenConfig(userId: UserId, email: string, name?: string, role?: string, deviceId?: string, deviceName?: string, permissions?: string[], features?: string[]): JwtTokenConfig;
/**
 * Create verification token configuration
 */
export declare function createVerificationTokenConfig(userId: UserId, email: string, purpose?: 'email_verification' | 'password_reset'): JwtTokenConfig;
/**
 * Default JWT token service instance
 */
export declare const defaultJwtTokenService: JwtTokenService;
/**
 * Extract user ID from JWT payload
 */
export declare function extractUserIdFromPayload(payload: JwtPayload): UserId;
/**
 * Extract session ID from JWT payload
 */
export declare function extractSessionIdFromPayload(payload: JwtPayload): SessionId | undefined;
/**
 * Check if token is expired
 */
export declare function isTokenExpired(payload: JwtPayload): boolean;
/**
 * Check if token needs refresh
 */
export declare function tokenNeedsRefresh(payload: JwtPayload, thresholdSeconds?: number): boolean;
/**
 * Get token expiration time
 */
export declare function getTokenExpirationTime(payload: JwtPayload): Date;
/**
 * Get token issued time
 */
export declare function getTokenIssuedTime(payload: JwtPayload): Date;
/**
 * Check if token is for desktop usage
 */
export declare function isDesktopToken(payload: JwtPayload): boolean;
/**
 * Check if token has permission
 */
export declare function tokenHasPermission(payload: JwtPayload, permission: string): boolean;
/**
 * Check if token has feature access
 */
export declare function tokenHasFeature(payload: JwtPayload, feature: string): boolean;
export {};
//# sourceMappingURL=jwt-token.service.d.ts.map