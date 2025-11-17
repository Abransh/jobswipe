/**
 * @fileoverview GitHub OAuth Strategy
 * @description Enterprise GitHub OAuth 2.0 authentication with user profile syncing
 * @version 1.0.0
 * @author JobSwipe Team
 * @see https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
 */

import { FastifyInstance } from 'fastify';
import {
  BaseOAuthStrategy,
  OAuthProviderConfig,
  OAuthAuthorizationOptions,
} from './BaseOAuthStrategy';
import { OAuthProvider, GitHubOAuthProfile } from '@jobswipe/shared';

// =============================================================================
// CONSTANTS
// =============================================================================

const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';
const GITHUB_USER_EMAILS_URL = 'https://api.github.com/user/emails';

// =============================================================================
// GITHUB OAUTH STRATEGY
// =============================================================================

/**
 * GitHub OAuth Strategy
 * Implements OAuth 2.0 for GitHub authentication
 */
export class GitHubStrategy extends BaseOAuthStrategy {
  constructor(fastify: FastifyInstance) {
    // Load GitHub OAuth configuration from environment
    const config: OAuthProviderConfig = {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      redirectUri: process.env.GITHUB_REDIRECT_URI || '',
      scopes: (process.env.GITHUB_SCOPES || 'user:email read:user').split(' '),
      authorizationEndpoint: GITHUB_AUTH_URL,
      tokenEndpoint: GITHUB_TOKEN_URL,
      userInfoEndpoint: GITHUB_USER_URL,
    };

    super(fastify, config);
  }

  // =============================================================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // =============================================================================

  /**
   * Get OAuth provider name
   */
  getProviderName(): OAuthProvider {
    return OAuthProvider.GITHUB;
  }

  /**
   * Build GitHub-specific authorization parameters
   */
  protected buildAuthorizationParams(
    options: OAuthAuthorizationOptions
  ): Record<string, string> {
    return {
      allow_signup: 'true', // Allow new GitHub user signups
    };
  }

  /**
   * Build GitHub-specific token exchange parameters
   */
  protected buildTokenExchangeParams(
    code: string,
    codeVerifier?: string
  ): Record<string, string> {
    return {
      grant_type: 'authorization_code',
      code,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
    };
  }

  /**
   * Parse GitHub user profile
   * @param rawProfile Raw profile from GitHub
   * @returns Normalized GitHub OAuth profile
   */
  async parseUserProfile(rawProfile: any): Promise<GitHubOAuthProfile> {
    try {
      // GitHub profile structure
      const profile: GitHubOAuthProfile = {
        id: rawProfile.id.toString(),
        login: rawProfile.login,
        email: rawProfile.email || '', // Email might be null
        emailVerified: false, // We'll verify with emails API
        name: rawProfile.name,
        firstName: this.extractFirstName(rawProfile.name),
        lastName: this.extractLastName(rawProfile.name),
        avatar: rawProfile.avatar_url,
        avatarUrl: rawProfile.avatar_url,
        bio: rawProfile.bio,
        company: rawProfile.company,
        location: rawProfile.location,
        blog: rawProfile.blog,
        hireable: rawProfile.hireable,
        publicRepos: rawProfile.public_repos,
        followers: rawProfile.followers,
      };

      return profile;
    } catch (error) {
      this.fastify.log.error({err: error, msg: 'Failed to parse GitHub profile:'});
      throw new Error('Failed to parse GitHub user profile');
    }
  }

  // =============================================================================
  // GITHUB-SPECIFIC METHODS
  // =============================================================================

  /**
   * Fetch user's verified email from GitHub
   * GitHub allows users to have multiple emails, we need to find the verified primary one
   * @param accessToken OAuth access token
   * @returns Verified email address
   */
  async getVerifiedEmail(accessToken: string): Promise<{
    email: string;
    verified: boolean;
    primary: boolean;
  } | null> {
    try {
      this.fastify.log.debug('Fetching GitHub user emails');

      const response = await this.httpClient.get(GITHUB_USER_EMAILS_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      const emails = response.data;

      // Find primary verified email
      const primaryVerifiedEmail = emails.find(
        (email: any) => email.primary && email.verified
      );

      if (primaryVerifiedEmail) {
        this.fastify.log.info({
          email: primaryVerifiedEmail.email,
        }, 'Found primary verified GitHub email');

        return {
          email: primaryVerifiedEmail.email,
          verified: true,
          primary: true,
        };
      }

      // Fallback: Find any verified email
      const verifiedEmail = emails.find((email: any) => email.verified);

      if (verifiedEmail) {
        this.fastify.log.info( {
          email: verifiedEmail.email,
        }, 'Found verified GitHub email (not primary)');

        return {
          email: verifiedEmail.email,
          verified: true,
          primary: false,
        };
      }

      // No verified email found
      this.fastify.log.warn('No verified email found for GitHub user');
      return null;
    } catch (error: any) {
      this.fastify.log.error({err: error, msg: 'Failed to fetch GitHub user emails:'});
      // Don't fail the entire OAuth flow if email fetch fails
      return null;
    }
  }

  /**
   * Get complete GitHub user profile with verified email
   * @param accessToken OAuth access token
   * @returns Complete GitHub profile with verified email
   */
  async getCompleteUserProfile(accessToken: string): Promise<GitHubOAuthProfile> {
    try {
      // Fetch basic profile
      const profile = await this.getUserProfile(accessToken);

      // Fetch verified email if not present in basic profile
      if (!profile.email || !profile.emailVerified) {
        const emailInfo = await this.getVerifiedEmail(accessToken);

        if (emailInfo) {
          profile.email = emailInfo.email;
          profile.emailVerified = emailInfo.verified;
        }
      }

      // Validate that we have an email
      if (!profile.email) {
        this.fastify.log.warn( {
          userId: profile.id,
          login: (profile as GitHubOAuthProfile).login,
        }, 'GitHub user has no email available');
        throw new Error('GitHub user has no email address available');
      }

      return profile as GitHubOAuthProfile;
    } catch (error) {
      this.fastify.log.error({err: error, msg: 'Failed to get complete GitHub user profile:'});
      throw error;
    }
  }

  /**
   * Fetch GitHub user's public repositories
   * @param accessToken OAuth access token
   * @param username GitHub username
   * @returns Array of public repositories
   */
  async getUserRepositories(accessToken: string, username: string): Promise<any[]> {
    try {
      this.fastify.log.debug({ username }, 'Fetching GitHub user repositories');

      const response = await this.httpClient.get(
        `https://api.github.com/users/${username}/repos`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
          params: {
            sort: 'updated',
            per_page: 10, // Limit to 10 most recent
          },
        }
      );

      return response.data;
    } catch (error) {
      this.fastify.log.error({err: error, msg: 'Failed to fetch GitHub repositories:'});
      return [];
    }
  }

  /**
   * Check if GitHub user is hireable
   * @param profile GitHub profile
   * @returns True if user is hireable
   */
  isHireable(profile: GitHubOAuthProfile): boolean {
    return profile.hireable === true;
  }

  /**
   * Get GitHub profile URL
   * @param profile GitHub profile
   * @returns GitHub profile URL
   */
  getProfileUrl(profile: GitHubOAuthProfile): string {
    return `https://github.com/${profile.login}`;
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Extract first name from full name
   * @param fullName Full name
   * @returns First name
   */
  private extractFirstName(fullName?: string): string | undefined {
    if (!fullName) return undefined;
    return fullName.split(' ')[0];
  }

  /**
   * Extract last name from full name
   * @param fullName Full name
   * @returns Last name
   */
  private extractLastName(fullName?: string): string | undefined {
    if (!fullName) return undefined;
    const parts = fullName.split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : undefined;
  }

  /**
   * Validate GitHub profile completeness
   * @param profile GitHub profile
   * @returns True if profile is complete enough for job applications
   */
  isProfileComplete(profile: GitHubOAuthProfile): boolean {
    return !!(
      profile.email &&
      profile.name &&
      profile.location &&
      (profile.bio || profile.company)
    );
  }
}

/**
 * Factory function to create GitHub OAuth Strategy
 */
export function createGitHubStrategy(fastify: FastifyInstance): GitHubStrategy {
  return new GitHubStrategy(fastify);
}

export default GitHubStrategy;
