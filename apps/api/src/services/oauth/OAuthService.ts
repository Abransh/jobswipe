/**
 * @fileoverview Main OAuth Service - Orchestrates all OAuth flows
 * @description Enterprise OAuth service managing all providers, account linking, and profile syncing
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Implements complete OAuth 2.0 flows with CSRF protection and token encryption
 */

import { FastifyInstance } from 'fastify';
import {
  OAuthProvider,
  OAuthSource,
  BaseOAuthProfile,
  OAuthAuthorizationResponse,
  OAuthCallbackResponse,
  OAuthProviderTokens,
  OAuthAccountInfo,
  AccountLinkingStatus,
  AuthError,
  AuthErrorCode,
  createAuthError,
  LinkedInOAuthProfile,
} from '@jobswipe/shared';
import { OAuthStateManager } from './OAuthStateManager';
import { OAuthTokenEncryption, encryptOAuthTokens, decryptOAuthTokens } from './OAuthTokenEncryption';
import { GoogleStrategy } from './strategies/GoogleStrategy';
import { GitHubStrategy } from './strategies/GitHubStrategy';
import { LinkedInStrategy } from './strategies/LinkedInStrategy';
import { BaseOAuthStrategy } from './strategies/BaseOAuthStrategy';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * OAuth initiation request
 */
export interface OAuthInitiationRequest {
  provider: OAuthProvider;
  source: OAuthSource;
  redirectUri?: string;
  deviceId?: string;
  deviceName?: string;
}

/**
 * OAuth callback request
 */
export interface OAuthCallbackRequest {
  provider: OAuthProvider;
  code: string;
  state: string;
  error?: string;
  errorDescription?: string;
}

/**
 * OAuth account creation result
 */
interface OAuthAccountCreationResult {
  user: any; // Prisma User with relations
  account: any; // Prisma Account
  isNewUser: boolean;
  profileSynced: boolean;
}

// =============================================================================
// MAIN OAUTH SERVICE
// =============================================================================

/**
 * OAuth Service - Orchestrates all OAuth authentication flows
 */
export class OAuthService {
  private fastify: FastifyInstance;
  private stateManager: OAuthStateManager;
  private tokenEncryption: OAuthTokenEncryption;

  // OAuth strategy instances
  private strategies: Map<OAuthProvider, BaseOAuthStrategy>;
  private googleStrategy: GoogleStrategy;
  private githubStrategy: GitHubStrategy;
  private linkedinStrategy: LinkedInStrategy;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;

    // Initialize services
    this.stateManager = new OAuthStateManager(fastify);
    this.tokenEncryption = new OAuthTokenEncryption();

    // Initialize OAuth strategies
    this.googleStrategy = new GoogleStrategy(fastify);
    this.githubStrategy = new GitHubStrategy(fastify);
    this.linkedinStrategy = new LinkedInStrategy(fastify);

    // Map strategies - explicit type casting to BaseOAuthStrategy for type compatibility
    this.strategies = new Map<OAuthProvider, BaseOAuthStrategy>([
      [OAuthProvider.GOOGLE, this.googleStrategy as BaseOAuthStrategy],
      [OAuthProvider.GITHUB, this.githubStrategy as BaseOAuthStrategy],
      [OAuthProvider.LINKEDIN, this.linkedinStrategy as BaseOAuthStrategy],
    ]);

    this.fastify.log.info('✅ OAuthService initialized with all providers');
  }

  // =============================================================================
  // OAUTH INITIATION FLOW
  // =============================================================================

  /**
   * Initiate OAuth flow - Generate authorization URL
   * @param request OAuth initiation request
   * @returns Authorization URL to redirect user
   */
  async initiateOAuthFlow(request: OAuthInitiationRequest): Promise<OAuthAuthorizationResponse> {
    try {
      this.fastify.log.info( {
        provider: request.provider,
        source: request.source,
      }, 'Initiating OAuth flow');

      // Get OAuth strategy
      const strategy = this.getStrategy(request.provider);

      // Create OAuth state for CSRF protection
      const oauthState = await this.stateManager.createState({
        provider: request.provider,
        source: request.source,
        redirectUri: request.redirectUri,
        deviceId: request.deviceId,
        deviceName: request.deviceName,
      });

      // Generate authorization URL
      const authorizationUrl = strategy.generateAuthorizationUrl({
        state: oauthState.state,
        codeVerifier: oauthState.codeVerifier,
        redirectUri: request.redirectUri,
        source: request.source,
      });

      this.fastify.log.info( {
        provider: request.provider,
        stateId: oauthState.id,
      }, 'OAuth authorization URL generated');

      return {
        authorizationUrl,
        state: oauthState.state,
        codeVerifier: oauthState.codeVerifier,
      };
    } catch (error) {
      this.fastify.log.error({err: error, msg: 'Failed to initiate OAuth flow:'});
      throw createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        'Failed to initiate OAuth flow',
        500
      );
    }
  }

  // =============================================================================
  // OAUTH CALLBACK FLOW
  // =============================================================================

  /**
   * Handle OAuth callback - Complete OAuth flow
   * @param request OAuth callback request
   * @returns User data and JWT tokens
   */
  async handleOAuthCallback(request: OAuthCallbackRequest): Promise<OAuthCallbackResponse> {
    try {
      this.fastify.log.info( {
        provider: request.provider,
        hasCode: !!request.code,
        hasError: !!request.error,
      }, 'Handling OAuth callback');

      // Check for OAuth provider errors
      if (request.error) {
        this.fastify.log.warn( {
          error: request.error,
          description: request.errorDescription,
        }, 'OAuth provider returned error');

        return {
          success: false,
          error: request.errorDescription || request.error,
          errorCode: this.mapProviderErrorToCode(request.error),
        };
      }

      // Validate and consume state token (CSRF protection)
      const oauthState = await this.stateManager.validateAndConsumeState(
        request.state,
        request.provider
      );

      // Get OAuth strategy
      const strategy = this.getStrategy(request.provider);

      // Exchange authorization code for tokens
      const providerTokens = await strategy.exchangeCodeForTokens({
        code: request.code,
        state: request.state,
        codeVerifier: oauthState.codeVerifier,
      });

      // Fetch user profile from OAuth provider
      let userProfile: BaseOAuthProfile;

      if (request.provider === OAuthProvider.GITHUB) {
        // GitHub requires special handling for email verification
        userProfile = await this.githubStrategy.getCompleteUserProfile(providerTokens.accessToken);
      } else if (request.provider === OAuthProvider.LINKEDIN) {
        // LinkedIn may need full profile for syncing
        userProfile = await this.linkedinStrategy.getFullProfile(providerTokens.accessToken);
      } else {
        userProfile = await strategy.getUserProfile(providerTokens.accessToken);
      }

      // Create or link account
      const accountResult = await this.createOrLinkAccount(
        request.provider,
        userProfile,
        providerTokens,
        oauthState.source
      );

      // Generate JWT tokens for JobSwipe
      const jwtTokens = await this.generateJWTTokens(
        accountResult.user,
        request.provider,
        oauthState.source
      );

      // Log audit event
      await this.logOAuthEvent('oauth_login_success', accountResult.user.id, request.provider, {
        isNewUser: accountResult.isNewUser,
        profileSynced: accountResult.profileSynced,
        source: oauthState.source,
      });

      this.fastify.log.info( {
        userId: accountResult.user.id,
        provider: request.provider,
        isNewUser: accountResult.isNewUser,
      }, 'OAuth callback completed successfully');

      return {
        success: true,
        user: {
          id: accountResult.user.id,
          email: accountResult.user.email,
          name: accountResult.user.name,
          avatar: accountResult.user.avatar,
          emailVerified: !!accountResult.user.emailVerified,
          role: accountResult.user.role,
          status: accountResult.user.status,
          isNewUser: accountResult.isNewUser,
        },
        tokens: {
          accessToken: jwtTokens.accessToken,
          refreshToken: jwtTokens.refreshToken,
          tokenType: 'Bearer',
          expiresIn: 15 * 60, // 15 minutes
        },
        accountLinkingStatus: accountResult.isNewUser
          ? AccountLinkingStatus.SUCCESS
          : AccountLinkingStatus.EXISTING_USER,
      };
    } catch (error) {
      if (error instanceof AuthError) {
        this.fastify.log.warn({err: error, msg: 'OAuth callback failed with known error:'});
        return {
          success: false,
          error: error.message,
          errorCode: error.code,
        };
      }

      this.fastify.log.error({err: error, msg: 'OAuth callback failed with unexpected error:'});
      return {
        success: false,
        error: 'OAuth authentication failed',
        errorCode: AuthErrorCode.INTERNAL_ERROR,
      };
    }
  }

  // =============================================================================
  // ACCOUNT CREATION & LINKING
  // =============================================================================

  /**
   * Create new account or link to existing user
   * @param provider OAuth provider
   * @param profile User profile from provider
   * @param tokens OAuth provider tokens
   * @param source OAuth source
   * @returns Account creation result
   */
  private async createOrLinkAccount(
    provider: OAuthProvider,
    profile: BaseOAuthProfile,
    tokens: OAuthProviderTokens,
    source: OAuthSource
  ): Promise<OAuthAccountCreationResult> {
    try {
      // Check if email is verified
      if (!profile.emailVerified && provider !== OAuthProvider.GITHUB) {
        throw createAuthError(
          AuthErrorCode.EMAIL_NOT_VERIFIED,
          'Email address is not verified by OAuth provider',
          403
        );
      }

      // Check if user exists with this email
      const existingUser = await this.fastify.db.user.findUnique({
        where: { email: profile.email.toLowerCase() },
        include: {
          accounts: true,
          profile: true,
        },
      });

      // Encrypt OAuth tokens before storage
      const encryptedTokens = encryptOAuthTokens(
        {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          idToken: tokens.idToken,
        },
        this.tokenEncryption
      );

      if (existingUser) {
        // Link OAuth provider to existing user
        return await this.linkOAuthToExistingUser(
          existingUser,
          provider,
          profile,
          encryptedTokens,
          tokens
        );
      } else {
        // Create new user with OAuth account
        return await this.createNewOAuthUser(
          provider,
          profile,
          encryptedTokens,
          tokens,
          source
        );
      }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      this.fastify.log.error({err: error, msg: 'Failed to create/link OAuth account:'});
      throw createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        'Failed to create or link account',
        500
      );
    }
  }

  /**
   * Create new user from OAuth provider
   */
  private async createNewOAuthUser(
    provider: OAuthProvider,
    profile: BaseOAuthProfile,
    encryptedTokens: { accessToken: string; refreshToken?: string; idToken?: string },
    rawTokens: OAuthProviderTokens,
    source: OAuthSource
  ): Promise<OAuthAccountCreationResult> {
    try {
      this.fastify.log.info( {
        provider,
        email: profile.email,
      }, 'Creating new OAuth user');

      // Create user with OAuth account in transaction
      const user = await this.fastify.db.user.create({
        data: {
          email: profile.email.toLowerCase(),
          name: profile.name,
          avatar: profile.avatar,
          emailVerified: profile.emailVerified ? new Date() : null,
          role: 'USER',
          status: 'ACTIVE',
          locale: profile.locale || 'en',
          oauthProviders: [provider],
          primaryAuthProvider: provider,
          dataConsent: true, // OAuth implies consent
          consentDate: new Date(),

          // Create OAuth account
          accounts: {
            create: {
              type: 'oauth',
              provider: provider,
              providerAccountId: profile.id,
              access_token: encryptedTokens.accessToken,
              refresh_token: encryptedTokens.refreshToken,
              id_token: encryptedTokens.idToken,
              expires_at: rawTokens.expiresAt,
              token_type: rawTokens.tokenType,
              scope: rawTokens.scope,
            },
          },

          // Create user profile
          profile: {
            create: {
              firstName: profile.firstName,
              lastName: profile.lastName,
              displayName: profile.name,
            },
          },

          // Create user preferences
          preferences: {
            create: {
              emailNotifications: true,
              pushNotifications: true,
              dataProcessingConsent: true,
            },
          },
        },
        include: {
          accounts: true,
          profile: true,
          preferences: true,
        },
      });

      // Sync LinkedIn profile if applicable
      let profileSynced = false;
      if (provider === OAuthProvider.LINKEDIN) {
        profileSynced = await this.syncLinkedInProfile(
          user.id,
          profile as LinkedInOAuthProfile
        );
      }

      this.fastify.log.info( {
        userId: user.id,
        provider,
        profileSynced,
      }, 'New OAuth user created successfully');

      return {
        user,
        account: user.accounts[0],
        isNewUser: true,
        profileSynced,
      };
    } catch (error) {
      this.fastify.log.error({ err: error, msg: 'Failed to create new OAuth user:'});
      throw error;
    }
  }

  /**
   * Link OAuth provider to existing user
   */
  private async linkOAuthToExistingUser(
    user: any,
    provider: OAuthProvider,
    profile: BaseOAuthProfile,
    encryptedTokens: { accessToken: string; refreshToken?: string; idToken?: string },
    rawTokens: OAuthProviderTokens
  ): Promise<OAuthAccountCreationResult> {
    try {
      this.fastify.log.info( {
        userId: user.id,
        provider,
      }, 'Linking OAuth provider to existing user');

      // Check if provider already linked
      const existingAccount = user.accounts.find((acc: any) => acc.provider === provider);

      if (existingAccount) {
        // Update existing account tokens
        const account = await this.fastify.db.account.update({
          where: { id: existingAccount.id },
          data: {
            access_token: encryptedTokens.accessToken,
            refresh_token: encryptedTokens.refreshToken,
            id_token: encryptedTokens.idToken,
            expires_at: rawTokens.expiresAt,
            token_type: rawTokens.tokenType,
            scope: rawTokens.scope,
          },
        });

        // Update user's last login
        const updatedUser = await this.fastify.db.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            emailVerified: profile.emailVerified ? new Date() : user.emailVerified,
          },
          include: {
            accounts: true,
            profile: true,
          },
        });

        return {
          user: updatedUser,
          account,
          isNewUser: false,
          profileSynced: false,
        };
      }

      // Create new account link
      const account = await this.fastify.db.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: provider,
          providerAccountId: profile.id,
          access_token: encryptedTokens.accessToken,
          refresh_token: encryptedTokens.refreshToken,
          id_token: encryptedTokens.idToken,
          expires_at: rawTokens.expiresAt,
          token_type: rawTokens.tokenType,
          scope: rawTokens.scope,
        },
      });

      // Update user OAuth providers array
      const updatedOAuthProviders = Array.from(new Set([...user.oauthProviders, provider]));

      const updatedUser = await this.fastify.db.user.update({
        where: { id: user.id },
        data: {
          oauthProviders: updatedOAuthProviders,
          lastLoginAt: new Date(),
          emailVerified: profile.emailVerified ? new Date() : user.emailVerified,
          // Set primary provider if not set
          primaryAuthProvider: user.primaryAuthProvider || provider,
        },
        include: {
          accounts: true,
          profile: true,
        },
      });

      // Sync LinkedIn profile if applicable
      let profileSynced = false;
      if (provider === OAuthProvider.LINKEDIN) {
        profileSynced = await this.syncLinkedInProfile(
          user.id,
          profile as LinkedInOAuthProfile
        );
      }

      this.fastify.log.info( {
        userId: user.id,
        provider,
        profileSynced,
      }, 'OAuth provider linked successfully');

      return {
        user: updatedUser,
        account,
        isNewUser: false,
        profileSynced,
      };
    } catch (error) {
      this.fastify.log.error({err: error, msg: 'Failed to link OAuth provider:'});
      throw error;
    }
  }

  // =============================================================================
  // LINKEDIN PROFILE SYNCING
  // =============================================================================

  /**
   * Sync LinkedIn profile data to user profile
   * @param userId User ID
   * @param profile LinkedIn profile with full data
   * @returns True if sync successful
   */
  private async syncLinkedInProfile(
    userId: string,
    profile: LinkedInOAuthProfile
  ): Promise<boolean> {
    try {
      if (!profile.positions && !profile.skills && !profile.headline) {
        this.fastify.log.debug('No LinkedIn profile data to sync');
        return false;
      }

      this.fastify.log.info( {
        userId,
        hasPositions: !!profile.positions?.length,
        hasSkills: !!profile.skills?.length,
        hasEducation: !!profile.educations?.length,
      }, 'Syncing LinkedIn profile',);

      // Calculate current position
      const currentPosition = profile.positions?.find(p => p.isCurrent) || profile.positions?.[0];

      // Calculate experience
      const yearsOfExperience = this.calculateYearsOfExperience(profile.positions || []);
      const experienceLevel = this.determineExperienceLevel(yearsOfExperience);

      // Extract skills
      const skills = profile.skills?.map(s => s.name) || [];

      // Update user profile
      await this.fastify.db.userProfile.update({
        where: { userId },
        data: {
          headline: profile.headline || currentPosition?.title,
          summary: profile.summary,
          currentTitle: currentPosition?.title,
          currentCompany: currentPosition?.company,
          experienceLevel,
          yearsOfExperience,
          skills,
          education: profile.educations ? JSON.parse(JSON.stringify(profile.educations)) : undefined,
          linkedin: profile.sub ? `https://www.linkedin.com/in/${profile.sub}` : undefined,
        },
      });

      this.fastify.log.info( {
        userId,
        yearsOfExperience,
        experienceLevel,
        skillsCount: skills.length,
      }, 'LinkedIn profile synced successfully',);

      return true;
    } catch (error) {
      this.fastify.log.error({err: error, msg: 'Failed to sync LinkedIn profile:'});
      return false;
    }
  }

  /**
   * Calculate years of experience from positions
   */
  private calculateYearsOfExperience(positions: any[]): number {
    if (!positions || positions.length === 0) return 0;

    let totalMonths = 0;

    for (const position of positions) {
      const startDate = new Date(position.startDate.year, position.startDate.month || 0);
      const endDate = position.endDate
        ? new Date(position.endDate.year, position.endDate.month || 11)
        : new Date();

      const months = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      totalMonths += months;
    }

    return Math.round(totalMonths / 12);
  }

  /**
   * Determine experience level from years
   */
  private determineExperienceLevel(years: number): string {
    if (years <= 2) return 'Entry';
    if (years <= 5) return 'Mid';
    if (years <= 10) return 'Senior';
    return 'Lead';
  }

  // =============================================================================
  // JWT TOKEN GENERATION
  // =============================================================================

  /**
   * Generate JobSwipe JWT tokens from OAuth user
   */
  private async generateJWTTokens(
    user: any,
    provider: OAuthProvider,
    source: OAuthSource
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Use jwtService to generate tokens (registered as jwtService in services.plugin.ts)
      const authService = this.fastify.jwtService;

      if (!authService) {
        throw new Error('JWT Service not available');
      }

      // Generate access token
      const accessTokenResult = await authService.createToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        expiresIn: '15m',
      });

      // Generate refresh token
      const refreshToken = await authService.createRefreshToken(user.id);

      return {
        accessToken: accessTokenResult.token,
        refreshToken,
      };
    } catch (error) {
      this.fastify.log.error({err: error, msg: 'Failed to generate JWT tokens:'});
      throw error;
    }
  }

  // =============================================================================
  // ACCOUNT MANAGEMENT
  // =============================================================================

  /**
   * Get user's linked OAuth accounts
   */
  async getLinkedAccounts(userId: string): Promise<OAuthAccountInfo[]> {
    try {
      const accounts = await this.fastify.db.account.findMany({
        where: {
          userId,
          type: 'oauth',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Get user to check primary provider
      const user = await this.fastify.db.user.findUnique({
        where: { id: userId },
        select: { primaryAuthProvider: true },
      });

      return accounts.map(account => ({
        provider: account.provider as OAuthProvider,
        providerAccountId: account.providerAccountId,
        email: '', // We don't store email in Account
        linkedAt: account.createdAt,
        isPrimary: user?.primaryAuthProvider === account.provider,
      }));
    } catch (error) {
      this.fastify.log.error({err: error, msg: 'Failed to get linked accounts:'});
      throw error;
    }
  }

  /**
   * Unlink OAuth provider from user account
   */
  async unlinkOAuthProvider(userId: string, provider: OAuthProvider): Promise<boolean> {
    try {
      this.fastify.log.info({ userId, provider }, 'Unlinking OAuth provider');

      // Check if user has password (can't unlink if no other auth method)
      const user = await this.fastify.db.user.findUnique({
        where: { id: userId },
        include: { accounts: true },
      });

      if (!user) {
        throw createAuthError(AuthErrorCode.NOT_FOUND, 'User not found', 404);
      }

      // Prevent unlinking if it's the only auth method
      if (!user.passwordHash && user.accounts.length === 1) {
        throw createAuthError(
          AuthErrorCode.INVALID_REQUEST,
          'Cannot unlink last authentication method. Set a password first.',
          400
        );
      }

      // Delete OAuth account
      await this.fastify.db.account.deleteMany({
        where: {
          userId,
          provider,
        },
      });

      // Update user's OAuth providers array
      const updatedProviders = user.oauthProviders.filter(p => p !== provider);
      await this.fastify.db.user.update({
        where: { id: userId },
        data: {
          oauthProviders: updatedProviders,
          // Reset primary provider if it was unlinked
          primaryAuthProvider: user.primaryAuthProvider === provider
            ? (updatedProviders[0] || 'email')
            : user.primaryAuthProvider,
        },
      });

      // Log audit event
      await this.logOAuthEvent('oauth_unlink', userId, provider);

      this.fastify.log.info( { userId, provider }, 'OAuth provider unlinked successfully');

      return true;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      this.fastify.log.error({err: error, msg: 'Failed to unlink OAuth provider:'});
      throw createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        'Failed to unlink OAuth provider',
        500
      );
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get OAuth strategy by provider
   */
  private getStrategy(provider: OAuthProvider): BaseOAuthStrategy {
    const strategy = this.strategies.get(provider);

    if (!strategy) {
      throw createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        `OAuth provider ${provider} is not configured`,
        500
      );
    }

    return strategy;
  }

  /**
   * Map OAuth provider error to internal error code
   */
  private mapProviderErrorToCode(providerError: string): string {
    const errorMap: Record<string, string> = {
      'access_denied': AuthErrorCode.PERMISSION_DENIED,
      'invalid_request': AuthErrorCode.INVALID_REQUEST,
      'unauthorized_client': AuthErrorCode.INTERNAL_ERROR,
      'unsupported_response_type': AuthErrorCode.INTERNAL_ERROR,
      'invalid_scope': AuthErrorCode.INTERNAL_ERROR,
      'server_error': AuthErrorCode.INTERNAL_ERROR,
      'temporarily_unavailable': AuthErrorCode.INTERNAL_ERROR,
    };

    return errorMap[providerError] || AuthErrorCode.INTERNAL_ERROR;
  }

  /**
   * Log OAuth audit event
   */
  private async logOAuthEvent(
    event: string,
    userId: string,
    provider: OAuthProvider,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.fastify.db.auditLog.create({
        data: {
          userId,
          action: event,
          resource: 'oauth',
          resourceId: provider,
          metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
          riskLevel: 'LOW',
        },
      });
    } catch (error) {
      this.fastify.log.warn({err: error, msg : 'Failed to log OAuth audit event:'});
      // Don't fail the OAuth flow if audit logging fails
    }
  }

  /**
   * Get enabled OAuth providers
   */
  getEnabledProviders(): OAuthProvider[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Cleanup and destroy service resources
   */
  async destroy(): Promise<void> {
    await this.stateManager.destroy();
    this.fastify.log.info('OAuthService destroyed');
  }
}

/**
 * Factory function to create OAuth Service
 */
export function createOAuthService(fastify: FastifyInstance): OAuthService {
  return new OAuthService(fastify);
}

export default OAuthService;
