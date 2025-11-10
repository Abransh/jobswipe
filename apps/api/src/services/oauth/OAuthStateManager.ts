/**
 * @fileoverview OAuth State Manager - CSRF protection for OAuth flows
 * @description Manages OAuth state tokens to prevent CSRF attacks
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Critical security component - validates OAuth state tokens
 */

import { FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';
import crypto from 'crypto';
import {
  OAuthProvider,
  OAuthSource,
  OAuthState,
  CreateOAuthStateRequest,
  OAuthError,
  OAuthErrorCode,
  createOAuthError,
} from '@jobswipe/shared';

// =============================================================================
// CONSTANTS
// =============================================================================

const STATE_TOKEN_LENGTH = 32; // 256 bits of entropy
const CODE_VERIFIER_LENGTH = 43; // PKCE code verifier (43-128 characters)
const STATE_EXPIRY_SECONDS = 600; // 10 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// =============================================================================
// OAUTH STATE MANAGER
// =============================================================================

/**
 * OAuth State Manager
 * Handles creation, storage, validation, and cleanup of OAuth state tokens
 */
export class OAuthStateManager {
  private fastify: FastifyInstance;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.startCleanupTask();
  }

  // =============================================================================
  // STATE CREATION
  // =============================================================================

  /**
   * Create and store OAuth state for CSRF protection
   * @param request State creation request
   * @returns OAuth state object
   */
  async createState(request: CreateOAuthStateRequest): Promise<OAuthState> {
    try {
      // Generate secure random state token
      const state = this.generateStateToken();

      // Generate PKCE code verifier if provider supports it
      const codeVerifier = this.shouldUsePKCE(request.provider)
        ? this.generateCodeVerifier()
        : undefined;

      // Determine redirect URI
      const redirectUri = request.redirectUri || this.getDefaultRedirectUri(request.source);

      // Calculate expiry
      const createdAt = new Date();
      const expiresAt = new Date(Date.now() + STATE_EXPIRY_SECONDS * 1000);

      // Build metadata
      const metadata = {
        deviceId: request.deviceId,
        deviceName: request.deviceName,
      };

      // Store state in database
      const oauthState = await this.fastify.db.oAuthState.create({
        data: {
          state,
          codeVerifier,
          provider: request.provider,
          redirectUri,
          source: request.source,
          metadata,
          createdAt,
          expiresAt,
        },
      });

      this.fastify.log.info('Created OAuth state', {
        provider: request.provider,
        source: request.source,
        stateId: oauthState.id,
        expiresAt: expiresAt.toISOString(),
      });

      return {
        id: oauthState.id,
        state: oauthState.state,
        codeVerifier: oauthState.codeVerifier || undefined,
        provider: oauthState.provider as OAuthProvider,
        redirectUri: oauthState.redirectUri,
        source: oauthState.source as OAuthSource,
        metadata: oauthState.metadata as any,
        createdAt: oauthState.createdAt,
        expiresAt: oauthState.expiresAt,
      };
    } catch (error) {
      this.fastify.log.error('Failed to create OAuth state:', error);
      throw createOAuthError(
        OAuthErrorCode.INTERNAL_ERROR,
        'Failed to create OAuth state',
        500
      );
    }
  }

  // =============================================================================
  // STATE VALIDATION
  // =============================================================================

  /**
   * Validate and consume OAuth state token (one-time use)
   * @param stateToken State token from OAuth callback
   * @param provider OAuth provider
   * @returns Validated OAuth state
   * @throws OAuthError if state is invalid or expired
   */
  async validateAndConsumeState(
    stateToken: string,
    provider: OAuthProvider
  ): Promise<OAuthState> {
    try {
      // Find state in database
      const oauthState = await this.fastify.db.oAuthState.findUnique({
        where: { state: stateToken },
      });

      if (!oauthState) {
        this.fastify.log.warn('Invalid OAuth state token - not found', {
          state: stateToken.substring(0, 8) + '...',
          provider,
        });

        throw createOAuthError(
          OAuthErrorCode.INVALID_STATE,
          'Invalid or expired OAuth state token',
          403
        );
      }

      // Verify provider matches
      if (oauthState.provider !== provider) {
        this.fastify.log.warn('OAuth state provider mismatch', {
          expected: provider,
          actual: oauthState.provider,
        });

        throw createOAuthError(
          OAuthErrorCode.INVALID_STATE,
          'OAuth provider mismatch',
          403
        );
      }

      // Check if state has expired
      if (oauthState.expiresAt < new Date()) {
        this.fastify.log.warn('OAuth state has expired', {
          stateId: oauthState.id,
          expiresAt: oauthState.expiresAt.toISOString(),
        });

        // Delete expired state
        await this.deleteState(oauthState.state);

        throw createOAuthError(
          OAuthErrorCode.STATE_EXPIRED,
          'OAuth state has expired - please try again',
          403
        );
      }

      // Delete state (one-time use) - CRITICAL for security
      await this.deleteState(oauthState.state);

      this.fastify.log.info('Successfully validated and consumed OAuth state', {
        stateId: oauthState.id,
        provider: oauthState.provider,
        source: oauthState.source,
      });

      return {
        id: oauthState.id,
        state: oauthState.state,
        codeVerifier: oauthState.codeVerifier || undefined,
        provider: oauthState.provider as OAuthProvider,
        redirectUri: oauthState.redirectUri,
        source: oauthState.source as OAuthSource,
        metadata: oauthState.metadata as any,
        createdAt: oauthState.createdAt,
        expiresAt: oauthState.expiresAt,
      };
    } catch (error) {
      if (error instanceof OAuthError) {
        throw error;
      }

      this.fastify.log.error('Failed to validate OAuth state:', error);
      throw createOAuthError(
        OAuthErrorCode.INTERNAL_ERROR,
        'Failed to validate OAuth state',
        500
      );
    }
  }

  // =============================================================================
  // STATE DELETION
  // =============================================================================

  /**
   * Delete OAuth state by token
   * @param stateToken State token to delete
   */
  async deleteState(stateToken: string): Promise<void> {
    try {
      await this.fastify.db.oAuthState.delete({
        where: { state: stateToken },
      });

      this.fastify.log.debug('Deleted OAuth state', {
        state: stateToken.substring(0, 8) + '...',
      });
    } catch (error) {
      // Ignore deletion errors (state might already be deleted)
      this.fastify.log.debug('Failed to delete OAuth state (might not exist):', error);
    }
  }

  // =============================================================================
  // STATE CLEANUP
  // =============================================================================

  /**
   * Clean up expired OAuth states
   * Runs periodically to remove old state tokens
   */
  async cleanupExpiredStates(): Promise<number> {
    try {
      const result = await this.fastify.db.oAuthState.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      if (result.count > 0) {
        this.fastify.log.info(`Cleaned up ${result.count} expired OAuth states`);
      }

      return result.count;
    } catch (error) {
      this.fastify.log.error('Failed to cleanup expired OAuth states:', error);
      return 0;
    }
  }

  /**
   * Start background cleanup task
   */
  private startCleanupTask(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredStates().catch((error) => {
        this.fastify.log.error('OAuth state cleanup task failed:', error);
      });
    }, CLEANUP_INTERVAL_MS);

    this.fastify.log.info('Started OAuth state cleanup task', {
      intervalMs: CLEANUP_INTERVAL_MS,
    });
  }

  /**
   * Stop background cleanup task
   */
  public stopCleanupTask(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      this.fastify.log.info('Stopped OAuth state cleanup task');
    }
  }

  // =============================================================================
  // PKCE SUPPORT
  // =============================================================================

  /**
   * Check if provider should use PKCE
   * @param provider OAuth provider
   * @returns True if PKCE should be used
   */
  private shouldUsePKCE(provider: OAuthProvider): boolean {
    // Google recommends PKCE, GitHub and LinkedIn don't require it but support it
    return provider === OAuthProvider.GOOGLE;
  }

  /**
   * Generate PKCE code verifier
   * @returns Random code verifier (43-128 characters, base64url encoded)
   */
  private generateCodeVerifier(): string {
    const buffer = crypto.randomBytes(32); // 256 bits
    return this.base64URLEncode(buffer);
  }

  /**
   * Generate PKCE code challenge from verifier
   * @param codeVerifier Code verifier
   * @returns Base64URL-encoded SHA-256 hash of code verifier
   */
  public generateCodeChallenge(codeVerifier: string): string {
    const hash = crypto.createHash('sha256').update(codeVerifier).digest();
    return this.base64URLEncode(hash);
  }

  /**
   * Base64URL encode buffer (RFC 7636)
   * @param buffer Buffer to encode
   * @returns Base64URL encoded string
   */
  private base64URLEncode(buffer: Buffer): string {
    return buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Generate cryptographically secure random state token
   * @returns Random state token (32 characters)
   */
  private generateStateToken(): string {
    return nanoid(STATE_TOKEN_LENGTH);
  }

  /**
   * Get default redirect URI based on source platform
   * @param source OAuth source
   * @returns Default redirect URI
   */
  private getDefaultRedirectUri(source: OAuthSource): string {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const desktopUrl = process.env.DESKTOP_CALLBACK_URL || 'jobswipe://auth/callback';

    switch (source) {
      case OAuthSource.WEB:
        return `${frontendUrl}/auth/callback`;
      case OAuthSource.DESKTOP:
        return desktopUrl;
      case OAuthSource.MOBILE:
        return `${frontendUrl}/auth/callback`; // TODO: Add mobile deep link
      default:
        return `${frontendUrl}/auth/callback`;
    }
  }

  // =============================================================================
  // LIFECYCLE
  // =============================================================================

  /**
   * Cleanup and destroy service resources
   */
  public async destroy(): Promise<void> {
    this.stopCleanupTask();
    this.fastify.log.info('OAuth State Manager destroyed');
  }
}

/**
 * Factory function to create OAuth State Manager
 */
export function createOAuthStateManager(fastify: FastifyInstance): OAuthStateManager {
  return new OAuthStateManager(fastify);
}

export default OAuthStateManager;
