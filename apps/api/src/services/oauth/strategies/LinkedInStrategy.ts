/**
 * @fileoverview LinkedIn OAuth Strategy with Profile Syncing
 * @description Enterprise LinkedIn OAuth 2.0 with comprehensive profile data syncing
 * @version 1.0.0
 * @author JobSwipe Team
 * @see https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2
 */

import { FastifyInstance } from 'fastify';
import {
  BaseOAuthStrategy,
  OAuthProviderConfig,
  OAuthAuthorizationOptions,
} from './BaseOAuthStrategy';
import {
  OAuthProvider,
  LinkedInOAuthProfile,
  LinkedInPosition,
  LinkedInEducation,
  LinkedInSkill,
} from '@jobswipe/shared';

// =============================================================================
// CONSTANTS
// =============================================================================

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_USERINFO_URL = 'https://api.linkedin.com/v2/userinfo'; // OpenID Connect
const LINKEDIN_PROFILE_URL = 'https://api.linkedin.com/v2/me';

// LinkedIn v2 API endpoints for profile data
const LINKEDIN_PROFILE_POSITIONS_URL = 'https://api.linkedin.com/v2/positions';
const LINKEDIN_PROFILE_EDUCATION_URL = 'https://api.linkedin.com/v2/educations';
const LINKEDIN_PROFILE_SKILLS_URL = 'https://api.linkedin.com/v2/skills';

// =============================================================================
// LINKEDIN OAUTH STRATEGY
// =============================================================================

/**
 * LinkedIn OAuth Strategy
 * Implements OAuth 2.0 with OpenID Connect and profile syncing
 */
export class LinkedInStrategy extends BaseOAuthStrategy {
  constructor(fastify: FastifyInstance) {
    // Load LinkedIn OAuth configuration from environment
    const config: OAuthProviderConfig = {
      clientId: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
      redirectUri: process.env.LINKEDIN_REDIRECT_URI || '',
      scopes: (process.env.LINKEDIN_SCOPES || 'openid profile email').split(' '),
      authorizationEndpoint: LINKEDIN_AUTH_URL,
      tokenEndpoint: LINKEDIN_TOKEN_URL,
      userInfoEndpoint: LINKEDIN_USERINFO_URL,
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
    return OAuthProvider.LINKEDIN;
  }

  /**
   * Build LinkedIn-specific authorization parameters
   */
  protected buildAuthorizationParams(
    options: OAuthAuthorizationOptions
  ): Record<string, string> {
    return {
      // LinkedIn uses standard OAuth 2.0 parameters
    };
  }

  /**
   * Build LinkedIn-specific token exchange parameters
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
   * Parse LinkedIn user profile from OpenID Connect UserInfo
   * @param rawProfile Raw profile from LinkedIn
   * @returns Normalized LinkedIn OAuth profile
   */
  async parseUserProfile(rawProfile: any): Promise<LinkedInOAuthProfile> {
    try {
      // LinkedIn OpenID Connect profile (v2 API)
      const profile: LinkedInOAuthProfile = {
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
      };

      return profile;
    } catch (error) {
      this.fastify.log.error('Failed to parse LinkedIn profile:', error);
      throw new Error('Failed to parse LinkedIn user profile');
    }
  }

  // =============================================================================
  // LINKEDIN PROFILE SYNCING METHODS
  // =============================================================================

  /**
   * Fetch full LinkedIn profile with work experience, education, skills
   * @param accessToken OAuth access token
   * @returns Complete LinkedIn profile with all data
   */
  async getFullProfile(accessToken: string): Promise<LinkedInOAuthProfile> {
    try {
      this.fastify.log.info('Fetching full LinkedIn profile with extended data');

      // Fetch basic profile
      const basicProfile = await this.getUserProfile(accessToken);

      // Fetch extended profile data in parallel
      const [positions, educations, skills] = await Promise.allSettled([
        this.getProfilePositions(accessToken).catch(() => []),
        this.getProfileEducation(accessToken).catch(() => []),
        this.getProfileSkills(accessToken).catch(() => []),
      ]);

      // Build complete profile
      const fullProfile: LinkedInOAuthProfile = {
        ...basicProfile,
        positions: positions.status === 'fulfilled' ? positions.value : [],
        educations: educations.status === 'fulfilled' ? educations.value : [],
        skills: skills.status === 'fulfilled' ? skills.value : [],
      };

      // Extract headline and summary if available
      await this.enrichProfileData(fullProfile, accessToken);

      this.fastify.log.info('Successfully fetched full LinkedIn profile', {
        userId: fullProfile.id,
        positionsCount: fullProfile.positions?.length || 0,
        educationsCount: fullProfile.educations?.length || 0,
        skillsCount: fullProfile.skills?.length || 0,
      });

      return fullProfile;
    } catch (error) {
      this.fastify.log.error('Failed to fetch full LinkedIn profile:', error);
      // Return basic profile if extended data fetch fails
      return await this.getUserProfile(accessToken) as LinkedInOAuthProfile;
    }
  }

  /**
   * Fetch LinkedIn profile work experience/positions
   * @param accessToken OAuth access token
   * @returns Array of work positions
   */
  async getProfilePositions(accessToken: string): Promise<LinkedInPosition[]> {
    try {
      this.fastify.log.debug('Fetching LinkedIn profile positions');

      // Note: LinkedIn v2 API requires specific member permissions
      // This is a placeholder implementation - actual API calls require proper scopes
      const response = await this.httpClient.get(LINKEDIN_PROFILE_POSITIONS_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      const positions: LinkedInPosition[] = (response.data.elements || []).map(
        (pos: any) => ({
          id: pos.id,
          title: pos.title,
          company: pos.companyName,
          companyId: pos.company,
          location: pos.locationName,
          description: pos.description,
          startDate: {
            year: pos.timePeriod?.startDate?.year,
            month: pos.timePeriod?.startDate?.month,
          },
          endDate: pos.timePeriod?.endDate
            ? {
                year: pos.timePeriod.endDate.year,
                month: pos.timePeriod.endDate.month,
              }
            : undefined,
          isCurrent: !pos.timePeriod?.endDate,
        })
      );

      return positions;
    } catch (error: any) {
      this.fastify.log.warn('Failed to fetch LinkedIn positions (may require additional scopes):', {
        status: error.response?.status,
      });
      return [];
    }
  }

  /**
   * Fetch LinkedIn profile education
   * @param accessToken OAuth access token
   * @returns Array of education entries
   */
  async getProfileEducation(accessToken: string): Promise<LinkedInEducation[]> {
    try {
      this.fastify.log.debug('Fetching LinkedIn profile education');

      const response = await this.httpClient.get(LINKEDIN_PROFILE_EDUCATION_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      const educations: LinkedInEducation[] = (response.data.elements || []).map(
        (edu: any) => ({
          id: edu.id,
          school: edu.schoolName,
          degree: edu.degreeName,
          fieldOfStudy: edu.fieldOfStudy,
          startDate: edu.timePeriod?.startDate
            ? { year: edu.timePeriod.startDate.year }
            : undefined,
          endDate: edu.timePeriod?.endDate
            ? { year: edu.timePeriod.endDate.year }
            : undefined,
        })
      );

      return educations;
    } catch (error: any) {
      this.fastify.log.warn('Failed to fetch LinkedIn education (may require additional scopes):', {
        status: error.response?.status,
      });
      return [];
    }
  }

  /**
   * Fetch LinkedIn profile skills
   * @param accessToken OAuth access token
   * @returns Array of skills
   */
  async getProfileSkills(accessToken: string): Promise<LinkedInSkill[]> {
    try {
      this.fastify.log.debug('Fetching LinkedIn profile skills');

      const response = await this.httpClient.get(LINKEDIN_PROFILE_SKILLS_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      const skills: LinkedInSkill[] = (response.data.elements || []).map(
        (skill: any) => ({
          name: skill.name,
          endorsementCount: skill.endorsementCount || 0,
        })
      );

      return skills;
    } catch (error: any) {
      this.fastify.log.warn('Failed to fetch LinkedIn skills (may require additional scopes):', {
        status: error.response?.status,
      });
      return [];
    }
  }

  /**
   * Enrich profile data with headline and summary
   * @param profile LinkedIn profile
   * @param accessToken OAuth access token
   */
  private async enrichProfileData(
    profile: LinkedInOAuthProfile,
    accessToken: string
  ): Promise<void> {
    try {
      // Fetch additional profile data from /me endpoint
      const response = await this.httpClient.get(LINKEDIN_PROFILE_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
        params: {
          projection: '(headline,summary)',
        },
      });

      if (response.data.headline) {
        profile.headline = response.data.headline;
      }

      if (response.data.summary) {
        profile.summary = response.data.summary;
      }
    } catch (error) {
      this.fastify.log.debug('Could not fetch LinkedIn headline/summary:', error);
      // Non-critical, continue without this data
    }
  }

  // =============================================================================
  // PROFILE ANALYSIS & UTILITY METHODS
  // =============================================================================

  /**
   * Get current job title from positions
   * @param profile LinkedIn profile
   * @returns Current job title or null
   */
  getCurrentJobTitle(profile: LinkedInOAuthProfile): string | null {
    if (!profile.positions || profile.positions.length === 0) {
      return profile.headline || null;
    }

    const currentPosition = profile.positions.find((pos) => pos.isCurrent);
    return currentPosition?.title || profile.positions[0]?.title || null;
  }

  /**
   * Get current company from positions
   * @param profile LinkedIn profile
   * @returns Current company or null
   */
  getCurrentCompany(profile: LinkedInOAuthProfile): string | null {
    if (!profile.positions || profile.positions.length === 0) {
      return null;
    }

    const currentPosition = profile.positions.find((pos) => pos.isCurrent);
    return currentPosition?.company || profile.positions[0]?.company || null;
  }

  /**
   * Calculate total years of experience
   * @param profile LinkedIn profile
   * @returns Years of experience
   */
  calculateYearsOfExperience(profile: LinkedInOAuthProfile): number {
    if (!profile.positions || profile.positions.length === 0) {
      return 0;
    }

    let totalMonths = 0;

    for (const position of profile.positions) {
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
   * Extract skill names array
   * @param profile LinkedIn profile
   * @returns Array of skill names
   */
  getSkillNames(profile: LinkedInOAuthProfile): string[] {
    if (!profile.skills || profile.skills.length === 0) {
      return [];
    }

    return profile.skills.map((skill) => skill.name);
  }

  /**
   * Check if profile is complete for job applications
   * @param profile LinkedIn profile
   * @returns True if profile is complete
   */
  isProfileCompleteForJobs(profile: LinkedInOAuthProfile): boolean {
    return !!(
      profile.email &&
      profile.name &&
      (profile.headline || (profile.positions && profile.positions.length > 0)) &&
      profile.skills &&
      profile.skills.length > 0
    );
  }

  /**
   * Get LinkedIn public profile URL
   * @param profile LinkedIn profile
   * @returns Public profile URL
   */
  getPublicProfileUrl(profile: LinkedInOAuthProfile): string {
    // LinkedIn public profile URLs use vanity URLs or member IDs
    // This is a basic implementation - actual URL may vary
    return `https://www.linkedin.com/in/${profile.sub}`;
  }
}

/**
 * Factory function to create LinkedIn OAuth Strategy
 */
export function createLinkedInStrategy(fastify: FastifyInstance): LinkedInStrategy {
  return new LinkedInStrategy(fastify);
}

export default LinkedInStrategy;
