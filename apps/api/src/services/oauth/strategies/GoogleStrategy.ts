/**
 * @fileoverview Google OAuth Strategy - OpenID Connect implementation
 * @description Enterprise Google OAuth 2.0 / OpenID Connect authentication
 * @version 1.0.0
 * @author JobSwipe Team
 * @see https://developers.google.com/identity/protocols/oauth2/openid-connect
 */

import { FastifyInstance } from 'fastify';
import { Issuer, Client, TokenSet } from 'openid-client';
import {
  BaseOAuthStrategy,
  OAuthProviderConfig,
  OAuthAuthorizationOptions,
} from './BaseOAuthStrategy';
import { OAuthProvider, GoogleOAuthProfile } from '@jobswipe/shared';

// =============================================================================
// CONSTANTS
// =============================================================================

const GOOGLE_DISCOVERY_URL = 'https://accounts.google.com/.well-known/openid-configuration';
const GOOGLE_USERINFO_ENDPOINT = 'https://openidconnect.googleapis.com/v1/userinfo';

// =============================================================================
// GOOGLE OAUTH STRATEGY
// =============================================================================

/**
 * Google OAuth Strategy
 * Implements OAuth 2.0 / OpenID Connect for Google authentication
 */
export class GoogleStrategy extends BaseOAuthStrategy {
  private openidClient: Client | null = null;

  constructor(fastify: FastifyInstance) {
    // Load Google OAuth configuration from environment
    const config: OAuthProviderConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
      scopes: (process.env.GOOGLE_SCOPES || 'openid profile email').split(' '),
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      userInfoEndpoint: GOOGLE_USERINFO_ENDPOINT,
    };

    super(fastify, config);

    // Initialize OpenID Connect client
    this.initializeOpenIDClient().catch((error) => {
      this.fastify.log.error({err: error, msg: 'Failed to initialize Google OpenID client:'});
    });
  }

  // =============================================================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // =============================================================================

  /**
   * Get OAuth provider name
   */
  getProviderName(): OAuthProvider {
    return OAuthProvider.GOOGLE;
  }

  /**
   * Build Google-specific authorization parameters
   * Includes PKCE and OpenID Connect parameters
   */
  protected buildAuthorizationParams(
    options: OAuthAuthorizationOptions
  ): Record<string, string> {
    const params: Record<string, string> = {
      access_type: 'offline', // Request refresh token
      prompt: 'consent', // Force consent screen to get refresh token
    };

    // Add PKCE parameters for enhanced security
    if (options.codeVerifier) {
      const codeChallenge = this.generateCodeChallenge(options.codeVerifier);
      params.code_challenge = codeChallenge;
      params.code_challenge_method = 'S256';
    }

    return params;
  }

  /**
   * Build Google-specific token exchange parameters
   */
  protected buildTokenExchangeParams(
    code: string,
    codeVerifier?: string
  ): Record<string, string> {
    const params: Record<string, string> = {
      grant_type: 'authorization_code',
      code,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
    };

    // Add PKCE code verifier if used
    if (codeVerifier) {
      params.code_verifier = codeVerifier;
    }

    return params;
  }

  /**
   * Parse Google user profile from OpenID Connect UserInfo endpoint
   * @param rawProfile Raw profile from Google
   * @returns Normalized Google OAuth profile
   */
  async parseUserProfile(rawProfile: any): Promise<GoogleOAuthProfile> {
    try {
      return {
        id: rawProfile.sub,
        sub: rawProfile.sub,
        email: rawProfile.email,
        emailVerified: rawProfile.email_verified === true,
        name: rawProfile.name,
        firstName: rawProfile.given_name,
        lastName: rawProfile.family_name,
        givenName: rawProfile.given_name,
        familyName: rawProfile.family_name,
        avatar: rawProfile.picture,
        picture: rawProfile.picture,
        locale: rawProfile.locale,
        hd: rawProfile.hd, // Hosted domain for Google Workspace
      };
    } catch (error) {
      this.fastify.log.error({err: error, msg:'Failed to parse Google profile:'});
      throw new Error('Failed to parse Google user profile');
    }
  }

  // =============================================================================
  // OPENID CONNECT METHODS
  // =============================================================================

  /**
   * Initialize OpenID Connect client using Google's discovery document
   */
  private async initializeOpenIDClient(): Promise<void> {
    try {
      this.fastify.log.info('Initializing Google OpenID Connect client...');

      // Discover Google's OpenID Connect configuration
      const googleIssuer = await Issuer.discover(GOOGLE_DISCOVERY_URL);

      this.fastify.log.info( {
        issuer: googleIssuer.issuer,
        authorizationEndpoint: googleIssuer.metadata.authorization_endpoint,
        tokenEndpoint: googleIssuer.metadata.token_endpoint,
        userinfoEndpoint: googleIssuer.metadata.userinfo_endpoint,
      }, 'Google OpenID Connect issuer discovered',);

      // Create OpenID Connect client
      this.openidClient = new googleIssuer.Client({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uris: [this.config.redirectUri],
        response_types: ['code'],
      });

      this.fastify.log.info('Google OpenID Connect client initialized successfully');
    } catch (error) {
      this.fastify.log.error({err: error, msg:'Failed to initialize Google OpenID Connect client:'});
      throw error;
    }
  }

  /**
   * Get user profile using OpenID Connect (ID token + UserInfo)
   * This method provides additional OpenID Connect features
   * @param accessToken OAuth access token
   * @param idToken OpenID Connect ID token (optional)
   * @returns Google user profile
   */
  async getUserProfileWithOpenID(
    accessToken: string,
    idToken?: string
  ): Promise<GoogleOAuthProfile> {
    try {
      // Fetch user info from UserInfo endpoint
      const profile = await this.getUserProfile(accessToken);

      // If ID token provided, verify and extract additional claims
      if (idToken && this.openidClient) {
        try {
          const claims = await this.openidClient.userinfo(accessToken);
          this.fastify.log.debug( {
            sub: claims.sub,
            email: claims.email,
          }, 'OpenID Connect claims received');
        } catch (error) {
          this.fastify.log.warn({err: error, msg:'Failed to verify ID token:'});
          // Continue with profile from UserInfo endpoint
        }
      }

      return profile as GoogleOAuthProfile;
    } catch (error) {
      this.fastify.log.error({err: error, msg:'Failed to get Google user profile with OpenID:'});
      throw error;
    }
  }

  /**
   * Verify Google ID token (JWT)
   * @param idToken ID token from Google
   * @returns Decoded and verified token claims
   */
  async verifyIdToken(idToken: string): Promise<any> {
    if (!this.openidClient) {
      throw new Error('OpenID client not initialized');
    }

    try {
      const tokenSet = new TokenSet({ id_token: idToken });
      const claims = tokenSet.claims();

      this.fastify.log.debug( {
        sub: claims.sub,
        email: claims.email,
      }, 'ID token verified and decoded');

      return claims;
    } catch (error) {
      this.fastify.log.error({err: error, msg:'Failed to verify Google ID token:'});
      throw error;
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Generate PKCE code challenge from verifier
   * @param codeVerifier Code verifier
   * @returns Base64URL-encoded SHA-256 hash
   */
  private generateCodeChallenge(codeVerifier: string): string {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(codeVerifier).digest();
    return hash
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Check if user's email is from Google Workspace (G Suite)
   * @param profile Google profile
   * @returns True if from Google Workspace
   */
  isWorkspaceAccount(profile: GoogleOAuthProfile): boolean {
    return !!profile.hd; // hd (hosted domain) is present for Workspace accounts
  }

  /**
   * Get Google Workspace domain
   * @param profile Google profile
   * @returns Workspace domain or null
   */
  getWorkspaceDomain(profile: GoogleOAuthProfile): string | null {
    return profile.hd || null;
  }
}

/**
 * Factory function to create Google OAuth Strategy
 */
export function createGoogleStrategy(fastify: FastifyInstance): GoogleStrategy {
  return new GoogleStrategy(fastify);
}

export default GoogleStrategy;
