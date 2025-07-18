"use strict";
/**
 * @fileoverview JWT Token Service with RS256 and key rotation for JobSwipe
 * @description Enterprise-grade JWT token management with security features
 * @version 1.0.0
 * @author JobSwipe Team
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultJwtTokenService = exports.JwtTokenService = void 0;
exports.createJwtTokenService = createJwtTokenService;
exports.createAccessTokenConfig = createAccessTokenConfig;
exports.createRefreshTokenConfig = createRefreshTokenConfig;
exports.createDesktopTokenConfig = createDesktopTokenConfig;
exports.createVerificationTokenConfig = createVerificationTokenConfig;
exports.extractUserIdFromPayload = extractUserIdFromPayload;
exports.extractSessionIdFromPayload = extractSessionIdFromPayload;
exports.isTokenExpired = isTokenExpired;
exports.tokenNeedsRefresh = tokenNeedsRefresh;
exports.getTokenExpirationTime = getTokenExpirationTime;
exports.getTokenIssuedTime = getTokenIssuedTime;
exports.isDesktopToken = isDesktopToken;
exports.tokenHasPermission = tokenHasPermission;
exports.tokenHasFeature = tokenHasFeature;
const crypto_1 = __importDefault(require("crypto"));
const auth_1 = require("../types/auth");
const auth_2 = require("../types/auth");
const constants_1 = require("../constants");
// =============================================================================
// JWT TOKEN SERVICE
// =============================================================================
class JwtTokenService {
    constructor(keyRotationInterval = 24 * 60 * 60 * 1000, // 24 hours
    maxKeyAge = 7 * 24 * 60 * 60 * 1000, // 7 days
    revokedTokensCleanupInterval = 60 * 60 * 1000 // 1 hour
    ) {
        this.keyRotationInterval = keyRotationInterval;
        this.maxKeyAge = maxKeyAge;
        this.revokedTokensCleanupInterval = revokedTokensCleanupInterval;
        this.keyPairs = new Map();
        this.currentKeyId = null;
        this.revokedTokens = new Set();
        this.metrics = {
            tokensIssued: 0,
            tokensVerified: 0,
            tokensRevoked: 0,
            keyRotations: 0,
            errors: 0,
            lastKeyRotation: new Date(),
        };
        this.initialize();
    }
    /**
     * Initialize the JWT service
     */
    async initialize() {
        try {
            // Generate initial key pair
            await this.generateKeyPair();
            // Set up key rotation interval
            setInterval(() => {
                this.rotateKeys().catch(error => {
                    console.error('Key rotation failed:', error);
                    this.metrics.errors++;
                });
            }, this.keyRotationInterval);
            // Set up revoked tokens cleanup
            setInterval(() => {
                this.cleanupRevokedTokens();
            }, this.revokedTokensCleanupInterval);
            console.log('JWT Token Service initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize JWT Token Service:', error);
            throw new Error('JWT service initialization failed');
        }
    }
    /**
     * Generate a new RSA key pair
     */
    async generateKeyPair() {
        try {
            const keyId = crypto_1.default.randomUUID();
            const keyPair = crypto_1.default.generateKeyPairSync('rsa', {
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
            const jwtKeyPair = {
                privateKey: keyPair.privateKey,
                publicKey: keyPair.publicKey,
                keyId,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + this.maxKeyAge),
                algorithm: constants_1.JWT_CONFIG.ALGORITHM,
            };
            // Store the key pair
            this.keyPairs.set(keyId, jwtKeyPair);
            // Set as current key if no current key exists
            if (!this.currentKeyId) {
                this.currentKeyId = keyId;
            }
            return jwtKeyPair;
        }
        catch (error) {
            this.metrics.errors++;
            throw new Error(`Failed to generate key pair: ${error}`);
        }
    }
    /**
     * Rotate encryption keys
     */
    async rotateKeys() {
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
        }
        catch (error) {
            this.metrics.errors++;
            console.error('Key rotation failed:', error);
            throw error;
        }
    }
    /**
     * Get the current signing key
     */
    getCurrentKey() {
        if (!this.currentKeyId) {
            throw (0, auth_2.createAuthError)(auth_2.AuthErrorCode.INTERNAL_ERROR, 'No current signing key available');
        }
        const keyPair = this.keyPairs.get(this.currentKeyId);
        if (!keyPair) {
            throw (0, auth_2.createAuthError)(auth_2.AuthErrorCode.INTERNAL_ERROR, 'Current signing key not found');
        }
        return keyPair;
    }
    /**
     * Get a key by ID for verification
     */
    getKeyById(keyId) {
        return this.keyPairs.get(keyId);
    }
    /**
     * Create a JWT token
     */
    async createToken(config) {
        try {
            const currentKey = this.getCurrentKey();
            const now = Math.floor(Date.now() / 1000);
            const tokenId = crypto_1.default.randomUUID();
            // Create JWT payload
            const payload = {
                sub: config.subject,
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
                alg: constants_1.JWT_CONFIG.ALGORITHM,
                typ: 'JWT',
                kid: currentKey.keyId,
            };
            // Encode header and payload
            const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
            const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
            // Create signature
            const signatureInput = `${encodedHeader}.${encodedPayload}`;
            const signature = crypto_1.default
                .createSign('RSA-SHA256')
                .update(signatureInput)
                .sign(currentKey.privateKey, 'base64url');
            // Combine to create JWT
            const token = `${signatureInput}.${signature}`;
            this.metrics.tokensIssued++;
            return token;
        }
        catch (error) {
            this.metrics.errors++;
            throw (0, auth_2.createAuthError)(auth_2.AuthErrorCode.INTERNAL_ERROR, 'Failed to create JWT token', 500, { originalError: error });
        }
    }
    /**
     * Verify a JWT token
     */
    async verifyToken(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                return { valid: false, error: 'Invalid token format' };
            }
            const [encodedHeader, encodedPayload, signature] = parts;
            // Decode header and payload
            const header = JSON.parse(this.base64UrlDecode(encodedHeader));
            const payload = JSON.parse(this.base64UrlDecode(encodedPayload));
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
            const isValidSignature = crypto_1.default
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
            if (payload.aud !== constants_1.JWT_CONFIG.AUDIENCE || payload.iss !== constants_1.JWT_CONFIG.ISSUER) {
                return { valid: false, error: 'Invalid audience or issuer' };
            }
            this.metrics.tokensVerified++;
            return {
                valid: true,
                payload,
                needsRefresh,
            };
        }
        catch (error) {
            this.metrics.errors++;
            return { valid: false, error: 'Token verification failed' };
        }
    }
    /**
     * Revoke a token
     */
    async revokeToken(tokenId) {
        try {
            this.revokedTokens.add(tokenId);
            this.metrics.tokensRevoked++;
        }
        catch (error) {
            this.metrics.errors++;
            throw (0, auth_2.createAuthError)(auth_2.AuthErrorCode.INTERNAL_ERROR, 'Failed to revoke token', 500, { tokenId, originalError: error });
        }
    }
    /**
     * Revoke all tokens for a user
     */
    async revokeUserTokens(userId) {
        try {
            // In a real implementation, you'd need to track tokens by user
            // For now, this is a placeholder
            console.log(`Revoking all tokens for user: ${userId}`);
            // This would typically involve:
            // 1. Querying a database for all active tokens for the user
            // 2. Adding their JTIs to the revoked tokens set
            // 3. Possibly updating the user's session version to invalidate all tokens
            // For demo purposes, we'll just increment the counter
            this.metrics.tokensRevoked++;
        }
        catch (error) {
            this.metrics.errors++;
            throw (0, auth_2.createAuthError)(auth_2.AuthErrorCode.INTERNAL_ERROR, 'Failed to revoke user tokens', 500, { userId, originalError: error });
        }
    }
    /**
     * Clean up expired revoked tokens
     */
    cleanupRevokedTokens() {
        try {
            // In a real implementation, you'd check if revoked tokens have expired
            // and remove them from the set to prevent memory leaks
            // For now, we'll just log the cleanup
            console.log(`Cleaning up revoked tokens. Current count: ${this.revokedTokens.size}`);
            // Clear very old tokens (this is a simplified approach)
            // In production, you'd want to be more selective
            if (this.revokedTokens.size > 10000) {
                this.revokedTokens.clear();
                console.log('Cleared old revoked tokens');
            }
        }
        catch (error) {
            this.metrics.errors++;
            console.error('Failed to cleanup revoked tokens:', error);
        }
    }
    /**
     * Get all public keys for verification
     */
    getPublicKeys() {
        const publicKeys = [];
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
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get service health status
     */
    getHealthStatus() {
        const hasCurrentKey = this.currentKeyId && this.keyPairs.has(this.currentKeyId);
        const keyCount = this.keyPairs.size;
        const errorRate = this.metrics.errors / Math.max(this.metrics.tokensIssued + this.metrics.tokensVerified, 1);
        let status = 'healthy';
        if (!hasCurrentKey || keyCount === 0) {
            status = 'unhealthy';
        }
        else if (errorRate > 0.1 || keyCount < 2) {
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
    base64UrlEncode(data) {
        return Buffer.from(data, 'utf8')
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }
    /**
     * Base64URL decode
     */
    base64UrlDecode(data) {
        // Add padding if needed
        const padded = data + '==='.slice(0, (4 - (data.length % 4)) % 4);
        const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
        return Buffer.from(base64, 'base64').toString('utf8');
    }
    /**
     * Shutdown the service gracefully
     */
    async shutdown() {
        try {
            // Clear all intervals
            // In a real implementation, you'd store interval IDs and clear them
            // Clear sensitive data
            this.keyPairs.clear();
            this.revokedTokens.clear();
            this.currentKeyId = null;
            console.log('JWT Token Service shutdown completed');
        }
        catch (error) {
            console.error('Error during JWT service shutdown:', error);
        }
    }
}
exports.JwtTokenService = JwtTokenService;
// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================
/**
 * Create a JWT token service instance
 */
function createJwtTokenService(config) {
    return new JwtTokenService(config?.keyRotationInterval, config?.maxKeyAge, config?.revokedTokensCleanupInterval);
}
/**
 * Create access token configuration
 */
function createAccessTokenConfig(userId, email, name, role = 'user', source = auth_1.AuthSource.WEB, sessionId, permissions, features) {
    return {
        expiresIn: constants_1.JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
        audience: constants_1.JWT_CONFIG.AUDIENCE,
        issuer: constants_1.JWT_CONFIG.ISSUER,
        subject: userId,
        tokenType: auth_1.TokenType.ACCESS,
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
function createRefreshTokenConfig(userId, email, source = auth_1.AuthSource.WEB, sessionId) {
    return {
        expiresIn: constants_1.JWT_CONFIG.REFRESH_TOKEN_EXPIRY,
        audience: constants_1.JWT_CONFIG.AUDIENCE,
        issuer: constants_1.JWT_CONFIG.ISSUER,
        subject: userId,
        tokenType: auth_1.TokenType.REFRESH,
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
function createDesktopTokenConfig(userId, email, name, role = 'user', deviceId, deviceName, permissions, features) {
    return {
        expiresIn: constants_1.JWT_CONFIG.DESKTOP_TOKEN_EXPIRY,
        audience: constants_1.JWT_CONFIG.AUDIENCE,
        issuer: constants_1.JWT_CONFIG.ISSUER,
        subject: userId,
        tokenType: auth_1.TokenType.DESKTOP_LONG_LIVED,
        source: auth_1.AuthSource.DESKTOP,
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
function createVerificationTokenConfig(userId, email, purpose = 'email_verification') {
    return {
        expiresIn: constants_1.JWT_CONFIG.VERIFICATION_TOKEN_EXPIRY,
        audience: constants_1.JWT_CONFIG.AUDIENCE,
        issuer: constants_1.JWT_CONFIG.ISSUER,
        subject: userId,
        tokenType: auth_1.TokenType.VERIFICATION,
        source: auth_1.AuthSource.API,
        metadata: {
            email,
            purpose,
        },
    };
}
// =============================================================================
// DEFAULT INSTANCE
// =============================================================================
/**
 * Default JWT token service instance
 */
exports.defaultJwtTokenService = createJwtTokenService();
// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
/**
 * Extract user ID from JWT payload
 */
function extractUserIdFromPayload(payload) {
    return payload.sub;
}
/**
 * Extract session ID from JWT payload
 */
function extractSessionIdFromPayload(payload) {
    return payload.sessionId;
}
/**
 * Check if token is expired
 */
function isTokenExpired(payload) {
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
}
/**
 * Check if token needs refresh
 */
function tokenNeedsRefresh(payload, thresholdSeconds = 300) {
    const now = Math.floor(Date.now() / 1000);
    return payload.exp - now < thresholdSeconds;
}
/**
 * Get token expiration time
 */
function getTokenExpirationTime(payload) {
    return new Date(payload.exp * 1000);
}
/**
 * Get token issued time
 */
function getTokenIssuedTime(payload) {
    return new Date(payload.iat * 1000);
}
/**
 * Check if token is for desktop usage
 */
function isDesktopToken(payload) {
    return payload.source === auth_1.AuthSource.DESKTOP || payload.type === auth_1.TokenType.DESKTOP_LONG_LIVED;
}
/**
 * Check if token has permission
 */
function tokenHasPermission(payload, permission) {
    return payload.permissions?.includes(permission) || false;
}
/**
 * Check if token has feature access
 */
function tokenHasFeature(payload, feature) {
    return payload.features?.includes(feature) || false;
}
//# sourceMappingURL=jwt-token.service.js.map