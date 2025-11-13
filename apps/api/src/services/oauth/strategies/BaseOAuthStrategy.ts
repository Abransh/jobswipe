/**
 * @fileoverview Base OAuth Strategy - Abstract class for all OAuth providers
 * @description Enterprise-grade OAuth strategy pattern implementation
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Implements CSRF protection, PKCE where supported, and secure token handling
 */

import { FastifyInstance } from 'fastify';
import axios, { AxiosInstance } from 'axios';
import {
  OAuthProvider,
  OAuthSource,
  BaseOAuthProfile,
  OAuthProviderTokens,
  OAuthAuthorizationResponse,
  OAuthCallbackResponse,
  AuthError,
  AuthErrorCode,
  createAuthError,
} from '@jobswipe/shared';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * OAuth provider configuration
 */
export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
}

/**
 * OAuth token exchange response (from provider)
 */
export interface OAuthTokenExchangeResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string; // OpenID Connect
}

/**
 * OAuth authorization options
 */
export interface OAuthAuthorizationOptions {
  state: string;
  codeVerifier?: string; // PKCE
  redirectUri?: string;
  source: OAuthSource;
  metadata?: Record<string, any>;
}

/**
 * OAuth callback options
 */
export interface OAuthCallbackOptions {
  code: string;
  state: string;
  codeVerifier?: string; // PKCE
}

// =============================================================================
// BASE OAUTH STRATEGY (Abstract Class)
// =============================================================================

/**
 * Abstract base class for all OAuth 2.0 strategies
 * Implements common OAuth flow logic with provider-specific customization
 */
export abstract class BaseOAuthStrategy {
  protected fastify: FastifyInstance;
  protected config: OAuthProviderConfig;
  protected httpClient: AxiosInstance;

  constructor(fastify: FastifyInstance, config: OAuthProviderConfig) {
    this.fastify = fastify;
    this.config = config;

    // Create HTTP client with default configuration
    this.httpClient = axios.create({
      timeout: 10000, // 10 seconds
      headers: {
        'User-Agent': 'JobSwipe/1.0',
        'Accept': 'application/json',
      },
    });

    this.validateConfig();
  }

  // =============================================================================
  // ABSTRACT METHODS (Must be implemented by subclasses)
  // =============================================================================

  /**
   * Get OAuth provider name
   */
  abstract getProviderName(): OAuthProvider;

  /**
   * Parse and normalize user profile from provider-specific format
   * @param rawProfile Raw profile data from OAuth provider
   * @returns Normalized user profile
   */
  abstract parseUserProfile(rawProfile: any): Promise<BaseOAuthProfile>;

  /**
   * Build provider-specific authorization URL parameters
   * @param options Authorization options
   * @returns Additional URL parameters for authorization endpoint
   */
  protected abstract buildAuthorizationParams(
    options: OAuthAuthorizationOptions
  ): Record<string, string>;

  /**
   * Build provider-specific token exchange parameters
   * @param code Authorization code
   * @param codeVerifier PKCE code verifier (optional)
   * @returns Token exchange parameters
   */
  protected abstract buildTokenExchangeParams(
    code: string,
    codeVerifier?: string
  ): Record<string, string>;

  // =============================================================================
  // COMMON OAUTH FLOW METHODS
  // =============================================================================

  /**
   * Generate authorization URL for OAuth flow initiation
   * @param options Authorization options
   * @returns Authorization URL to redirect user
   */
  public generateAuthorizationUrl(options: OAuthAuthorizationOptions): string {
    try {
      const baseParams = {
        client_id: this.config.clientId,
        redirect_uri: options.redirectUri || this.config.redirectUri,
        response_type: 'code',
        scope: this.config.scopes.join(' '),
        state: options.state,
      };

      // Add provider-specific parameters
      const providerParams = this.buildAuthorizationParams(options);
      const allParams = { ...baseParams, ...providerParams };

      // Build URL with query parameters
      const url = new URL(this.config.authorizationEndpoint);
      Object.entries(allParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      this.fastify.log.info(`Generated ${this.getProviderName()} OAuth authorization URL`, {
        provider: this.getProviderName(),
        state: options.state,
        scopes: this.config.scopes,
      });

      return url.toString();
    } catch (error) {
      this.fastify.log.error(`Failed to generate authorization URL for ${this.getProviderName()}:`, error);
      throw createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        'Failed to generate authorization URL',
        500,
        { provider: this.getProviderName() }
      );
    }
  }

  /**
   * Exchange authorization code for access token
   * @param options Callback options with code and state
   * @returns OAuth provider tokens
   */
  public async exchangeCodeForTokens(
    options: OAuthCallbackOptions
  ): Promise<OAuthProviderTokens> {
    try {
      const params = this.buildTokenExchangeParams(options.code, options.codeVerifier);

      this.fastify.log.debug(`Exchanging authorization code for tokens: ${this.getProviderName()}`);

      const response = await this.httpClient.post<OAuthTokenExchangeResponse>(
        this.config.tokenEndpoint,
        new URLSearchParams(params),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
        }
      );

      const tokenData = response.data;

      // Validate token response
      if (!tokenData.access_token) {
        throw createAuthError(
          AuthErrorCode.INTERNAL_ERROR,
          'No access token received from provider',
          502,
          { provider: this.getProviderName() }
        );
      }

      const expiresAt = tokenData.expires_in
        ? Math.floor(Date.now() / 1000) + tokenData.expires_in
        : undefined;

      this.fastify.log.info(`Successfully exchanged authorization code for tokens: ${this.getProviderName()}`);

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        idToken: tokenData.id_token,
        tokenType: tokenData.token_type || 'Bearer',
        scope: tokenData.scope || this.config.scopes.join(' '),
        expiresAt,
      };
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        this.fastify.log.error(`Token exchange failed for ${this.getProviderName()}:`, {
          status: error.response?.status,
          data: error.response?.data,
        });

        throw createAuthError(
          AuthErrorCode.INTERNAL_ERROR,
          `Failed to exchange code for tokens: ${error.response?.data?.error_description || error.message}`,
          502,
          {
            provider: this.getProviderName(),
            status: error.response?.status,
            error: error.response?.data,
          }
        );
      }

      throw error;
    }
  }

  /**
   * Fetch user profile from OAuth provider
   * @param accessToken OAuth access token
   * @returns Normalized user profile
   */
  public async getUserProfile(accessToken: string): Promise<BaseOAuthProfile> {
    try {
      this.fastify.log.debug(`Fetching user profile from ${this.getProviderName()}`);

      const response = await this.httpClient.get(this.config.userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const rawProfile = response.data;

      // Parse and normalize profile using provider-specific logic
      const profile = await this.parseUserProfile(rawProfile);

      this.fastify.log.info(`Successfully fetched user profile from ${this.getProviderName()}`, {
        provider: this.getProviderName(),
        userId: profile.id,
        email: profile.email,
      });

      return profile;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        this.fastify.log.error(`Failed to fetch user profile from ${this.getProviderName()}:`, {
          status: error.response?.status,
          data: error.response?.data,
        });

        throw createAuthError(
          AuthErrorCode.INTERNAL_ERROR,
          `Failed to fetch user profile: ${error.message}`,
          502,
          {
            provider: this.getProviderName(),
            status: error.response?.status,
          }
        );
      }

      throw error;
    }
  }

  /**
   * Refresh OAuth provider access token
   * @param refreshToken OAuth refresh token
   * @returns New OAuth provider tokens
   */
  public async refreshAccessToken(refreshToken: string): Promise<OAuthProviderTokens> {
    try {
      this.fastify.log.debug(`Refreshing access token for ${this.getProviderName()}`);

      const params = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      };

      const response = await this.httpClient.post<OAuthTokenExchangeResponse>(
        this.config.tokenEndpoint,
        new URLSearchParams(params),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
        }
      );

      const tokenData = response.data;

      if (!tokenData.access_token) {
        throw createAuthError(
          AuthErrorCode.TOKEN_INVALID,
          'No access token received when refreshing',
          502
        );
      }

      const expiresAt = tokenData.expires_in
        ? Math.floor(Date.now() / 1000) + tokenData.expires_in
        : undefined;

      this.fastify.log.info(`Successfully refreshed access token for ${this.getProviderName()}`);

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || refreshToken, // Use old refresh token if new one not provided
        idToken: tokenData.id_token,
        tokenType: tokenData.token_type || 'Bearer',
        scope: tokenData.scope || this.config.scopes.join(' '),
        expiresAt,
      };
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        this.fastify.log.error(`Failed to refresh access token for ${this.getProviderName()}:`, {
          status: error.response?.status,
          data: error.response?.data,
        });

        throw createAuthError(
          AuthErrorCode.TOKEN_INVALID,
          `Failed to refresh access token: ${error.message}`,
          502,
          {
            provider: this.getProviderName(),
            status: error.response?.status,
          }
        );
      }

      throw error;
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Validate OAuth provider configuration
   */
  protected validateConfig(): void {
    const requiredFields: (keyof OAuthProviderConfig)[] = [
      'clientId',
      'clientSecret',
      'redirectUri',
      'authorizationEndpoint',
      'tokenEndpoint',
      'userInfoEndpoint',
    ];

    for (const field of requiredFields) {
      if (!this.config[field]) {
        this.fastify.log.error(`Missing required OAuth configuration: ${field} for ${this.getProviderName()}`);
        throw new Error(`Missing required OAuth configuration: ${field}`);
      }
    }

    // Validate scopes
    if (!Array.isArray(this.config.scopes) || this.config.scopes.length === 0) {
      this.fastify.log.error(`OAuth scopes must be a non-empty array for ${this.getProviderName()}`);
      throw new Error('OAuth scopes must be a non-empty array');
    }

    this.fastify.log.info(`OAuth configuration validated for ${this.getProviderName()}`);
  }

  /**
   * Get provider configuration (for debugging/logging)
   */
  public getConfig(): Omit<OAuthProviderConfig, 'clientSecret'> {
    const { clientSecret, ...safeConfig } = this.config;
    return safeConfig;
  }
}

export default BaseOAuthStrategy;
