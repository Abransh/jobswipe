"use strict";
/**
 * @fileoverview Token Exchange Service for Web-Desktop Authentication Bridge
 * @description Secure token exchange between web sessions and desktop long-lived tokens
 * @version 1.0.0
 * @author JobSwipe Team
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenExchangeService = void 0;
exports.createTokenExchangeService = createTokenExchangeService;
exports.createDefaultTokenExchangeService = createDefaultTokenExchangeService;
exports.generateDeviceId = generateDeviceId;
exports.isValidExchangeToken = isValidExchangeToken;
exports.isSupportedDeviceType = isSupportedDeviceType;
exports.createDeviceInfoFromUserAgent = createDeviceInfoFromUserAgent;
exports.formatTokenExpiry = formatTokenExpiry;
const auth_1 = require("../types/auth");
const auth_2 = require("../types/auth");
const jwt_token_service_1 = require("./jwt-token.service");
const security_1 = require("../utils/security");
const datetime_1 = require("../utils/datetime");
// =============================================================================
// TOKEN EXCHANGE SERVICE
// =============================================================================
class TokenExchangeService {
    constructor(jwtService, sessionService, config = {
        maxExchangesPerUser: 5,
        exchangeTokenTTL: 300, // 5 minutes
        desktopTokenTTL: 90 * 24 * 60 * 60, // 90 days
        requireDeviceRegistration: true,
        allowMultipleDevices: true,
        revokeOldTokens: false,
    }) {
        this.jwtService = jwtService;
        this.sessionService = sessionService;
        this.config = config;
        this.exchangeTokens = new Map();
        this.desktopTokens = new Map();
        this.userDevices = new Map();
        this.metrics = {
            totalExchanges: 0,
            successfulExchanges: 0,
            failedExchanges: 0,
            activeDesktopTokens: 0,
            revokedDesktopTokens: 0,
            exchangesByDevice: {},
            lastExchange: new Date(),
            averageExchangeTime: 0,
        };
        this.startCleanupJob();
    }
    /**
     * Initiate token exchange - Generate exchange token for web user
     */
    async initiateExchange(sessionId, deviceInfo, ipAddress, userAgent) {
        try {
            const startTime = Date.now();
            // Validate session
            const session = await this.sessionService.getSession(sessionId);
            if (!session) {
                throw (0, auth_2.createAuthError)(auth_2.AuthErrorCode.SESSION_INVALID, 'Invalid session');
            }
            // Check if user has exceeded max exchanges
            if (this.config.maxExchangesPerUser > 0) {
                const userExchanges = Array.from(this.exchangeTokens.values())
                    .filter(mapping => mapping.userId === session.userId && !mapping.used);
                if (userExchanges.length >= this.config.maxExchangesPerUser) {
                    throw (0, auth_2.createAuthError)(auth_2.AuthErrorCode.RATE_LIMIT_EXCEEDED, 'Maximum concurrent exchanges exceeded');
                }
            }
            // Validate device info
            if (this.config.requireDeviceRegistration && !this.isValidDeviceInfo(deviceInfo)) {
                throw (0, auth_2.createAuthError)(auth_2.AuthErrorCode.INVALID_REQUEST, 'Invalid device information');
            }
            // Generate exchange token
            const exchangeToken = (0, security_1.generateSecureToken)(32);
            const expiresAt = new Date(Date.now() + (this.config.exchangeTokenTTL * 1000));
            // Create exchange mapping
            const mapping = {
                exchangeToken,
                userId: session.userId,
                sessionId,
                deviceInfo: {
                    ...deviceInfo,
                    ...(ipAddress && { ipAddress }),
                },
                expiresAt,
                createdAt: new Date(),
                used: false,
            };
            // Store mapping
            this.exchangeTokens.set(exchangeToken, mapping);
            // Update metrics
            this.metrics.totalExchanges++;
            this.updateExchangeMetrics(startTime);
            // Log user agent for debugging
            if (userAgent) {
                console.log(`Exchange initiated from: ${userAgent}`);
            }
            return {
                exchangeToken,
                expiresAt,
                deviceId: deviceInfo.deviceId,
                instructions: {
                    step1: 'Copy this exchange token to your desktop application',
                    step2: 'Paste the token in the desktop app authentication dialog',
                    step3: 'The desktop app will exchange this token for a long-lived access token',
                    warning: 'This token expires in 5 minutes and can only be used once',
                },
            };
        }
        catch (error) {
            this.metrics.failedExchanges++;
            if (error instanceof Error && error.message.includes('Invalid session')) {
                throw error;
            }
            if (error instanceof Error && error.message.includes('Maximum concurrent')) {
                throw error;
            }
            if (error instanceof Error && error.message.includes('Invalid device')) {
                throw error;
            }
            throw (0, auth_2.createAuthError)(auth_2.AuthErrorCode.INTERNAL_ERROR, 'Failed to initiate token exchange', 500, { originalError: error });
        }
    }
    /**
     * Complete token exchange - Exchange token for desktop long-lived token
     */
    async completeExchange(exchangeToken, deviceInfo, ipAddress, userAgent) {
        try {
            const startTime = Date.now();
            // Find exchange mapping
            const mapping = this.exchangeTokens.get(exchangeToken);
            if (!mapping) {
                throw (0, auth_2.createAuthError)(auth_2.AuthErrorCode.INVALID_CREDENTIALS, 'Invalid exchange token');
            }
            // Check if already used
            if (mapping.used) {
                throw (0, auth_2.createAuthError)(auth_2.AuthErrorCode.INVALID_CREDENTIALS, 'Exchange token already used');
            }
            // Check expiration
            if (mapping.expiresAt < new Date()) {
                this.exchangeTokens.delete(exchangeToken);
                throw (0, auth_2.createAuthError)(auth_2.AuthErrorCode.TOKEN_EXPIRED, 'Exchange token has expired');
            }
            // Validate device info matches
            if (mapping.deviceInfo.deviceId !== deviceInfo.deviceId) {
                throw (0, auth_2.createAuthError)(auth_2.AuthErrorCode.INVALID_REQUEST, 'Device ID mismatch');
            }
            // Get user session for token generation
            const session = await this.sessionService.getSession(mapping.sessionId);
            if (!session) {
                throw (0, auth_2.createAuthError)(auth_2.AuthErrorCode.SESSION_INVALID, 'Original session no longer valid');
            }
            // Check if multiple devices are allowed
            if (!this.config.allowMultipleDevices) {
                await this.revokeUserDeviceTokens(mapping.userId, deviceInfo.deviceId);
            }
            // Revoke old tokens if configured
            if (this.config.revokeOldTokens) {
                await this.revokeUserDeviceTokens(mapping.userId, deviceInfo.deviceId);
            }
            // Generate desktop long-lived token
            const tokenConfig = (0, jwt_token_service_1.createDesktopTokenConfig)(mapping.userId, session.metadata?.email || '', session.metadata?.name, session.metadata?.role || 'user', deviceInfo.deviceId, deviceInfo.deviceName, session.metadata?.permissions, session.metadata?.features);
            // Set custom expiry for desktop token
            tokenConfig.expiresIn = this.config.desktopTokenTTL;
            const desktopToken = await this.jwtService.createToken(tokenConfig);
            const tokenId = (0, auth_1.createBrandedId)((0, security_1.generateSecureToken)(16));
            // Create desktop token info
            const desktopTokenInfo = {
                tokenId,
                userId: mapping.userId,
                deviceId: deviceInfo.deviceId,
                deviceName: deviceInfo.deviceName,
                token: desktopToken,
                createdAt: new Date(),
                expiresAt: (0, datetime_1.addDays)(new Date(), 90), // 90 days
                lastUsedAt: new Date(),
                ...(ipAddress && { ipAddress }),
                revoked: false,
            };
            // Store desktop token
            this.desktopTokens.set(tokenId, desktopTokenInfo);
            // Track user devices
            if (!this.userDevices.has(mapping.userId)) {
                this.userDevices.set(mapping.userId, new Set());
            }
            this.userDevices.get(mapping.userId).add(deviceInfo.deviceId);
            // Mark exchange as used
            mapping.used = true;
            mapping.usedAt = new Date();
            mapping.desktopToken = desktopToken;
            mapping.desktopTokenId = tokenId;
            // Update metrics
            this.metrics.successfulExchanges++;
            this.metrics.activeDesktopTokens++;
            this.metrics.exchangesByDevice[deviceInfo.platform] =
                (this.metrics.exchangesByDevice[deviceInfo.platform] || 0) + 1;
            this.updateExchangeMetrics(startTime);
            // Log user agent for debugging
            if (userAgent) {
                console.log(`Exchange completed from: ${userAgent}`);
            }
            // Clean up exchange token after successful use
            // In a real implementation, you might want to keep this for audit purposes
            // For now, we'll clean it up in the regular cleanup job
            return {
                success: true,
                accessToken: desktopToken,
                tokenType: 'Bearer',
                expiresIn: this.config.desktopTokenTTL,
                tokenId,
                deviceId: deviceInfo.deviceId,
                issuedAt: new Date(),
                expiresAt: desktopTokenInfo.expiresAt,
                permissions: session.metadata?.permissions || [],
                features: session.metadata?.features || [],
            };
        }
        catch (error) {
            this.metrics.failedExchanges++;
            if (error instanceof Error && error.message.includes('Invalid exchange token')) {
                throw error;
            }
            if (error instanceof Error && error.message.includes('Exchange token already used')) {
                throw error;
            }
            if (error instanceof Error && error.message.includes('Exchange token has expired')) {
                throw error;
            }
            if (error instanceof Error && error.message.includes('Device ID mismatch')) {
                throw error;
            }
            if (error instanceof Error && error.message.includes('Original session no longer valid')) {
                throw error;
            }
            throw (0, auth_2.createAuthError)(auth_2.AuthErrorCode.INTERNAL_ERROR, 'Failed to complete token exchange', 500, { originalError: error });
        }
    }
    /**
     * Validate desktop token
     */
    async validateDesktopToken(tokenId) {
        try {
            const tokenInfo = this.desktopTokens.get(tokenId);
            if (!tokenInfo) {
                return null;
            }
            // Check if revoked
            if (tokenInfo.revoked) {
                return null;
            }
            // Check expiration
            if (tokenInfo.expiresAt < new Date()) {
                // Mark as expired and remove
                this.desktopTokens.delete(tokenId);
                this.metrics.activeDesktopTokens = Math.max(0, this.metrics.activeDesktopTokens - 1);
                return null;
            }
            // Update last used
            tokenInfo.lastUsedAt = new Date();
            return tokenInfo;
        }
        catch (error) {
            throw (0, auth_2.createAuthError)(auth_2.AuthErrorCode.INTERNAL_ERROR, 'Failed to validate desktop token', 500, { tokenId, originalError: error });
        }
    }
    /**
     * Revoke desktop token
     */
    async revokeDesktopToken(tokenId, reason) {
        try {
            const tokenInfo = this.desktopTokens.get(tokenId);
            if (!tokenInfo) {
                throw (0, auth_2.createAuthError)(auth_2.AuthErrorCode.NOT_FOUND, 'Desktop token not found');
            }
            if (tokenInfo.revoked) {
                return; // Already revoked
            }
            // Mark as revoked
            tokenInfo.revoked = true;
            tokenInfo.revokedAt = new Date();
            if (reason) {
                tokenInfo.revokedReason = reason;
            }
            // Revoke the JWT token (simplified implementation)
            console.log(`Revoking JWT token: ${tokenId}`);
            // Update metrics
            this.metrics.activeDesktopTokens = Math.max(0, this.metrics.activeDesktopTokens - 1);
            this.metrics.revokedDesktopTokens++;
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('Desktop token not found')) {
                throw error;
            }
            throw (0, auth_2.createAuthError)(auth_2.AuthErrorCode.INTERNAL_ERROR, 'Failed to revoke desktop token', 500, { tokenId, originalError: error });
        }
    }
    /**
     * Revoke all desktop tokens for a user
     */
    async revokeAllUserTokens(userId, reason) {
        try {
            let revokedCount = 0;
            for (const [tokenId, tokenInfo] of this.desktopTokens.entries()) {
                if (tokenInfo.userId === userId && !tokenInfo.revoked) {
                    await this.revokeDesktopToken((0, auth_1.createBrandedId)(tokenId), reason);
                    revokedCount++;
                }
            }
            // Clear user devices
            this.userDevices.delete(userId);
            return revokedCount;
        }
        catch (error) {
            throw (0, auth_2.createAuthError)(auth_2.AuthErrorCode.INTERNAL_ERROR, 'Failed to revoke all user tokens', 500, { userId, originalError: error });
        }
    }
    /**
     * Revoke desktop tokens for a specific device
     */
    async revokeUserDeviceTokens(userId, deviceId, reason) {
        try {
            let revokedCount = 0;
            for (const [tokenId, tokenInfo] of this.desktopTokens.entries()) {
                if (tokenInfo.userId === userId && tokenInfo.deviceId === deviceId && !tokenInfo.revoked) {
                    await this.revokeDesktopToken((0, auth_1.createBrandedId)(tokenId), reason);
                    revokedCount++;
                }
            }
            return revokedCount;
        }
        catch (error) {
            throw (0, auth_2.createAuthError)(auth_2.AuthErrorCode.INTERNAL_ERROR, 'Failed to revoke user device tokens', 500, { userId, deviceId, originalError: error });
        }
    }
    /**
     * Get user's desktop tokens
     */
    async getUserDesktopTokens(userId) {
        try {
            const userTokens = [];
            for (const tokenInfo of this.desktopTokens.values()) {
                if (tokenInfo.userId === userId) {
                    // Don't include the actual token in the response
                    userTokens.push({
                        ...tokenInfo,
                        token: '***', // Masked for security
                    });
                }
            }
            return userTokens.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }
        catch (error) {
            throw (0, auth_2.createAuthError)(auth_2.AuthErrorCode.INTERNAL_ERROR, 'Failed to get user desktop tokens', 500, { userId, originalError: error });
        }
    }
    /**
     * Get service metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get service health status
     */
    getHealthStatus() {
        const activeExchanges = Array.from(this.exchangeTokens.values())
            .filter(mapping => !mapping.used && mapping.expiresAt > new Date()).length;
        const errorRate = this.metrics.failedExchanges / Math.max(this.metrics.totalExchanges, 1);
        let status = 'healthy';
        if (activeExchanges > 1000 || errorRate > 0.1) {
            status = 'degraded';
        }
        if (errorRate > 0.5) {
            status = 'unhealthy';
        }
        return {
            status,
            details: {
                activeExchanges,
                activeDesktopTokens: this.metrics.activeDesktopTokens,
                errorRate,
                totalExchanges: this.metrics.totalExchanges,
                successRate: this.metrics.successfulExchanges / Math.max(this.metrics.totalExchanges, 1),
                averageExchangeTime: this.metrics.averageExchangeTime,
                lastExchange: this.metrics.lastExchange,
                config: this.config,
            },
        };
    }
    // =============================================================================
    // PRIVATE METHODS
    // =============================================================================
    /**
     * Validate device info
     */
    isValidDeviceInfo(deviceInfo) {
        return !!(deviceInfo.deviceId &&
            deviceInfo.deviceName &&
            deviceInfo.deviceType &&
            deviceInfo.platform &&
            deviceInfo.deviceId.length >= 8 &&
            deviceInfo.deviceName.length >= 1 &&
            ['desktop', 'mobile', 'tablet'].includes(deviceInfo.deviceType));
    }
    /**
     * Update exchange metrics
     */
    updateExchangeMetrics(startTime) {
        const exchangeTime = Date.now() - startTime;
        // Update average exchange time (simple moving average)
        this.metrics.averageExchangeTime =
            (this.metrics.averageExchangeTime * (this.metrics.totalExchanges - 1) + exchangeTime) /
                this.metrics.totalExchanges;
        this.metrics.lastExchange = new Date();
    }
    /**
     * Clean up expired exchange tokens and update metrics
     */
    cleanupExpiredTokens() {
        try {
            const now = new Date();
            let cleanedCount = 0;
            // Clean up expired exchange tokens
            for (const [token, mapping] of this.exchangeTokens.entries()) {
                if (mapping.expiresAt < now) {
                    this.exchangeTokens.delete(token);
                    cleanedCount++;
                }
            }
            // Clean up expired desktop tokens
            for (const [tokenId, tokenInfo] of this.desktopTokens.entries()) {
                if (tokenInfo.expiresAt < now && !tokenInfo.revoked) {
                    this.desktopTokens.delete(tokenId);
                    this.metrics.activeDesktopTokens = Math.max(0, this.metrics.activeDesktopTokens - 1);
                    cleanedCount++;
                }
            }
            if (cleanedCount > 0) {
                console.log(`Token exchange cleanup: removed ${cleanedCount} expired tokens`);
            }
        }
        catch (error) {
            console.error('Token exchange cleanup failed:', error);
        }
    }
    /**
     * Start cleanup job
     */
    startCleanupJob() {
        // In a real implementation, you'd set up a proper interval
        // For now, we'll just log that cleanup would be scheduled
        console.log('Token exchange cleanup job would be scheduled to run every 5 minutes');
        // Schedule cleanup to run periodically
        setInterval(() => {
            this.cleanupExpiredTokens();
        }, 5 * 60 * 1000); // Every 5 minutes
    }
}
exports.TokenExchangeService = TokenExchangeService;
// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================
/**
 * Create token exchange service
 */
function createTokenExchangeService(jwtService, sessionService, config) {
    return new TokenExchangeService(jwtService, sessionService, config);
}
/**
 * Create default token exchange service
 */
function createDefaultTokenExchangeService(jwtService, sessionService) {
    return createTokenExchangeService(jwtService, sessionService);
}
// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
/**
 * Generate device ID from device info
 */
function generateDeviceId(deviceInfo) {
    const data = `${deviceInfo.platform || ''}-${deviceInfo.deviceName || ''}-${deviceInfo.browserInfo || ''}-${deviceInfo.osVersion || ''}`;
    return (0, security_1.createSecureHash)(data).substring(0, 16);
}
/**
 * Validate exchange token format
 */
function isValidExchangeToken(token) {
    return !!(token && token.length >= 32 && /^[a-zA-Z0-9]+$/.test(token));
}
/**
 * Check if device type is supported
 */
function isSupportedDeviceType(deviceType) {
    return ['desktop', 'mobile', 'tablet'].includes(deviceType);
}
/**
 * Create device info from user agent
 */
function createDeviceInfoFromUserAgent(userAgent, deviceId, deviceName) {
    // This is a simplified implementation
    // In production, you'd use a proper user agent parser
    const isMobile = /Mobile|Android|iPhone/.test(userAgent);
    const isTablet = /Tablet|iPad/.test(userAgent);
    let deviceType = 'desktop';
    if (isMobile)
        deviceType = 'mobile';
    else if (isTablet)
        deviceType = 'tablet';
    let platform = 'unknown';
    if (/Windows/.test(userAgent))
        platform = 'windows';
    else if (/Mac/.test(userAgent))
        platform = 'macos';
    else if (/Linux/.test(userAgent))
        platform = 'linux';
    else if (/Android/.test(userAgent))
        platform = 'android';
    else if (/iPhone|iPad/.test(userAgent))
        platform = 'ios';
    const computedDeviceName = deviceName || `${platform} device`;
    return {
        deviceId: deviceId || generateDeviceId({ platform, deviceName: computedDeviceName, browserInfo: userAgent }),
        deviceName: computedDeviceName,
        deviceType,
        platform,
        browserInfo: userAgent,
    };
}
/**
 * Format token expiry for display
 */
function formatTokenExpiry(expiresAt) {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    if (diff <= 0) {
        return 'Expired';
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) {
        return `${days} day${days === 1 ? '' : 's'}`;
    }
    else if (hours > 0) {
        return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    else {
        return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    }
}
//# sourceMappingURL=token-exchange.service.js.map