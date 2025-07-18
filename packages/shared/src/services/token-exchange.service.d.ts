/**
 * @fileoverview Token Exchange Service for Web-Desktop Authentication Bridge
 * @description Secure token exchange between web sessions and desktop long-lived tokens
 * @version 1.0.0
 * @author JobSwipe Team
 */
import { TokenExchangeRequest, TokenExchangeResponse, UserId, SessionId, TokenId } from '../types/auth';
import { JwtTokenService } from './jwt-token.service';
import { RedisSessionService } from './redis-session-stub.service';
/**
 * Token exchange configuration
 */
interface TokenExchangeConfig {
    maxExchangesPerUser: number;
    exchangeTokenTTL: number;
    desktopTokenTTL: number;
    requireDeviceRegistration: boolean;
    allowMultipleDevices: boolean;
    revokeOldTokens: boolean;
}
/**
 * Device registration info
 */
interface DeviceInfo {
    deviceId: string;
    deviceName: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    platform: string;
    browserInfo?: string;
    appVersion?: string;
    osVersion?: string;
    ipAddress?: string;
    location?: string;
}
/**
 * Desktop token info
 */
interface DesktopTokenInfo {
    tokenId: TokenId;
    userId: UserId;
    deviceId: string;
    deviceName: string;
    token: string;
    createdAt: Date;
    expiresAt: Date;
    lastUsedAt: Date;
    ipAddress?: string;
    location?: string;
    revoked: boolean;
    revokedAt?: Date;
    revokedReason?: string;
}
/**
 * Token exchange metrics
 */
interface TokenExchangeMetrics {
    totalExchanges: number;
    successfulExchanges: number;
    failedExchanges: number;
    activeDesktopTokens: number;
    revokedDesktopTokens: number;
    exchangesByDevice: Record<string, number>;
    lastExchange: Date;
    averageExchangeTime: number;
}
export declare class TokenExchangeService {
    private readonly jwtService;
    private readonly sessionService;
    private readonly config;
    private exchangeTokens;
    private desktopTokens;
    private userDevices;
    private metrics;
    constructor(jwtService: JwtTokenService, sessionService: RedisSessionService, config?: TokenExchangeConfig);
    /**
     * Initiate token exchange - Generate exchange token for web user
     */
    initiateExchange(sessionId: SessionId, deviceInfo: DeviceInfo, ipAddress?: string, userAgent?: string): Promise<TokenExchangeRequest>;
    /**
     * Complete token exchange - Exchange token for desktop long-lived token
     */
    completeExchange(exchangeToken: string, deviceInfo: DeviceInfo, ipAddress?: string, userAgent?: string): Promise<TokenExchangeResponse>;
    /**
     * Validate desktop token
     */
    validateDesktopToken(tokenId: TokenId): Promise<DesktopTokenInfo | null>;
    /**
     * Revoke desktop token
     */
    revokeDesktopToken(tokenId: TokenId, reason?: string): Promise<void>;
    /**
     * Revoke all desktop tokens for a user
     */
    revokeAllUserTokens(userId: UserId, reason?: string): Promise<number>;
    /**
     * Revoke desktop tokens for a specific device
     */
    revokeUserDeviceTokens(userId: UserId, deviceId: string, reason?: string): Promise<number>;
    /**
     * Get user's desktop tokens
     */
    getUserDesktopTokens(userId: UserId): Promise<DesktopTokenInfo[]>;
    /**
     * Get service metrics
     */
    getMetrics(): TokenExchangeMetrics;
    /**
     * Get service health status
     */
    getHealthStatus(): {
        status: 'healthy' | 'degraded' | 'unhealthy';
        details: Record<string, any>;
    };
    /**
     * Validate device info
     */
    private isValidDeviceInfo;
    /**
     * Update exchange metrics
     */
    private updateExchangeMetrics;
    /**
     * Clean up expired exchange tokens and update metrics
     */
    private cleanupExpiredTokens;
    /**
     * Start cleanup job
     */
    private startCleanupJob;
}
/**
 * Create token exchange service
 */
export declare function createTokenExchangeService(jwtService: JwtTokenService, sessionService: RedisSessionService, config?: Partial<TokenExchangeConfig>): TokenExchangeService;
/**
 * Create default token exchange service
 */
export declare function createDefaultTokenExchangeService(jwtService: JwtTokenService, sessionService: RedisSessionService): TokenExchangeService;
/**
 * Generate device ID from device info
 */
export declare function generateDeviceId(deviceInfo: Partial<DeviceInfo>): string;
/**
 * Validate exchange token format
 */
export declare function isValidExchangeToken(token: string): boolean;
/**
 * Check if device type is supported
 */
export declare function isSupportedDeviceType(deviceType: string): boolean;
/**
 * Create device info from user agent
 */
export declare function createDeviceInfoFromUserAgent(userAgent: string, deviceId?: string, deviceName?: string): Partial<DeviceInfo>;
/**
 * Format token expiry for display
 */
export declare function formatTokenExpiry(expiresAt: Date): string;
export {};
//# sourceMappingURL=token-exchange.service.d.ts.map