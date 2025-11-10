/**
 * @fileoverview OAuth 2.0 Types and Interfaces for JobSwipe
 * @description Enterprise-grade OAuth types supporting Google, GitHub, and LinkedIn
 * @version 1.0.0
 * @author JobSwipe Team
 * @security OAuth implementations must validate state tokens and use PKCE where supported
 */

import { z } from 'zod';

// =============================================================================
// OAUTH PROVIDER ENUMS
// =============================================================================

/**
 * Supported OAuth 2.0 providers
 */
export enum OAuthProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
  LINKEDIN = 'linkedin',
}

/**
 * OAuth authentication source platforms
 */
export enum OAuthSource {
  WEB = 'web',
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
}

/**
 * OAuth account linking status
 */
export enum AccountLinkingStatus {
  SUCCESS = 'success',
  EXISTING_USER = 'existing_user',
  EMAIL_MISMATCH = 'email_mismatch',
  REQUIRES_PASSWORD = 'requires_password',
  PROVIDER_ERROR = 'provider_error',
}

// =============================================================================
// OAUTH PROFILE INTERFACES
// =============================================================================

/**
 * Base OAuth user profile interface
 */
export interface BaseOAuthProfile {
  id: string; // Provider's user ID
  email: string;
  emailVerified: boolean;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  locale?: string;
}

/**
 * Google OAuth profile
 * @see https://developers.google.com/identity/protocols/oauth2/openid-connect
 */
export interface GoogleOAuthProfile extends BaseOAuthProfile {
  sub: string; // Google's unique user ID
  picture?: string;
  givenName?: string;
  familyName?: string;
  hd?: string; // Hosted domain for Google Workspace
}

/**
 * GitHub OAuth profile
 * @see https://docs.github.com/en/rest/users/users
 */
export interface GitHubOAuthProfile extends BaseOAuthProfile {
  login: string; // GitHub username
  avatarUrl?: string;
  bio?: string;
  company?: string;
  location?: string;
  blog?: string; // Personal website
  hireable?: boolean;
  publicRepos?: number;
  followers?: number;
}

/**
 * LinkedIn OAuth profile with profile syncing data
 * @see https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2
 */
export interface LinkedInOAuthProfile extends BaseOAuthProfile {
  sub: string; // LinkedIn's unique user ID
  givenName?: string;
  familyName?: string;
  picture?: string;

  // Extended LinkedIn profile data for syncing
  headline?: string; // Current job title
  summary?: string; // Professional summary/bio
  positions?: LinkedInPosition[]; // Work experience
  educations?: LinkedInEducation[]; // Educational background
  skills?: LinkedInSkill[]; // Professional skills
  certifications?: LinkedInCertification[]; // Professional certifications
  languages?: LinkedInLanguage[]; // Language proficiencies
}

/**
 * LinkedIn position (work experience)
 */
export interface LinkedInPosition {
  id?: string;
  title: string;
  company: string;
  companyId?: string;
  companyLogo?: string;
  location?: string;
  description?: string;
  startDate: { year: number; month?: number };
  endDate?: { year: number; month?: number };
  isCurrent: boolean;
}

/**
 * LinkedIn education
 */
export interface LinkedInEducation {
  id?: string;
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  grade?: string;
  startDate?: { year: number };
  endDate?: { year: number };
}

/**
 * LinkedIn skill
 */
export interface LinkedInSkill {
  name: string;
  endorsementCount?: number;
}

/**
 * LinkedIn certification
 */
export interface LinkedInCertification {
  name: string;
  authority: string;
  licenseNumber?: string;
  startDate?: { year: number; month?: number };
  endDate?: { year: number; month?: number };
  url?: string;
}

/**
 * LinkedIn language proficiency
 */
export interface LinkedInLanguage {
  name: string;
  proficiency?: 'elementary' | 'limited_working' | 'professional_working' | 'full_professional' | 'native_or_bilingual';
}

// =============================================================================
// OAUTH STATE MANAGEMENT
// =============================================================================

/**
 * OAuth state for CSRF protection
 */
export interface OAuthState {
  id: string;
  state: string; // Random state token
  codeVerifier?: string; // PKCE code verifier
  provider: OAuthProvider;
  redirectUri: string;
  source: OAuthSource;
  metadata?: {
    deviceId?: string;
    deviceName?: string;
    userAgent?: string;
    ipAddress?: string;
  };
  createdAt: Date;
  expiresAt: Date;
}

/**
 * OAuth state creation request
 */
export interface CreateOAuthStateRequest {
  provider: OAuthProvider;
  source: OAuthSource;
  redirectUri?: string;
  deviceId?: string;
  deviceName?: string;
}

// =============================================================================
// OAUTH FLOW REQUESTS & RESPONSES
// =============================================================================

/**
 * OAuth authorization request (initiate OAuth flow)
 */
export interface OAuthAuthorizationRequest {
  provider: OAuthProvider;
  source: OAuthSource;
  redirectUri?: string; // Post-auth redirect
  deviceId?: string;
  deviceName?: string;
}

/**
 * OAuth authorization response (redirect URL)
 */
export interface OAuthAuthorizationResponse {
  authorizationUrl: string;
  state: string;
  codeVerifier?: string; // For PKCE (stored in session)
}

/**
 * OAuth callback request (from OAuth provider)
 */
export interface OAuthCallbackRequest {
  code: string; // Authorization code
  state: string; // State token for CSRF validation
  error?: string; // OAuth error
  errorDescription?: string;
}

/**
 * OAuth callback response (JWT tokens + user)
 */
export interface OAuthCallbackResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    emailVerified: boolean;
    role: string;
    status: string;
    isNewUser: boolean; // First-time OAuth user
  };
  tokens?: {
    accessToken: string;
    refreshToken: string;
    tokenType: 'Bearer';
    expiresIn: number;
  };
  accountLinkingStatus?: AccountLinkingStatus;
  error?: string;
  errorCode?: string;
}

// =============================================================================
// OAUTH ACCOUNT LINKING
// =============================================================================

/**
 * Link OAuth account to existing user request
 */
export interface LinkOAuthAccountRequest {
  provider: OAuthProvider;
  providerAccountId: string;
  providerAccessToken: string;
  providerRefreshToken?: string;
  providerTokenExpiry?: number;
  profile: BaseOAuthProfile;

  // Security: Require current password for linking
  currentPassword?: string;
}

/**
 * Unlink OAuth account request
 */
export interface UnlinkOAuthAccountRequest {
  provider: OAuthProvider;
  currentPassword?: string; // Security: require password confirmation
}

/**
 * OAuth account info response
 */
export interface OAuthAccountInfo {
  provider: OAuthProvider;
  providerAccountId: string;
  email: string;
  name?: string;
  avatar?: string;
  linkedAt: Date;
  lastUsedAt?: Date;
  isPrimary: boolean; // Primary auth method
}

// =============================================================================
// OAUTH TOKEN MANAGEMENT
// =============================================================================

/**
 * OAuth provider tokens (stored encrypted in database)
 */
export interface OAuthProviderTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string; // OpenID Connect ID token
  tokenType: string;
  scope: string;
  expiresAt?: number; // Unix timestamp
}

/**
 * Refresh OAuth provider token request
 */
export interface RefreshOAuthTokenRequest {
  provider: OAuthProvider;
  refreshToken: string;
}

/**
 * Refresh OAuth provider token response
 */
export interface RefreshOAuthTokenResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
}

// =============================================================================
// LINKEDIN PROFILE SYNCING
// =============================================================================

/**
 * LinkedIn profile sync request
 */
export interface LinkedInProfileSyncRequest {
  userId: string;
  linkedInAccessToken: string;
  syncMode: 'full' | 'partial'; // Full sync or selective
  syncOptions?: {
    syncPositions?: boolean;
    syncEducation?: boolean;
    syncSkills?: boolean;
    syncCertifications?: boolean;
    syncLanguages?: boolean;
  };
}

/**
 * LinkedIn profile sync response
 */
export interface LinkedInProfileSyncResponse {
  success: boolean;
  syncedAt: Date;
  profileData?: {
    headline?: string;
    summary?: string;
    positionsCount?: number;
    educationsCount?: number;
    skillsCount?: number;
    certificationsCount?: number;
    languagesCount?: number;
  };
  error?: string;
}

// =============================================================================
// OAUTH ERROR TYPES
// =============================================================================

/**
 * OAuth error codes
 */
export enum OAuthErrorCode {
  // OAuth provider errors
  INVALID_CODE = 'invalid_code',
  INVALID_STATE = 'invalid_state',
  STATE_EXPIRED = 'state_expired',
  PROVIDER_ERROR = 'provider_error',
  ACCESS_DENIED = 'access_denied',

  // Account linking errors
  EMAIL_ALREADY_EXISTS = 'email_already_exists',
  EMAIL_NOT_VERIFIED = 'email_not_verified',
  ACCOUNT_ALREADY_LINKED = 'account_already_linked',
  PASSWORD_REQUIRED = 'password_required',

  // Token errors
  TOKEN_EXPIRED = 'token_expired',
  TOKEN_INVALID = 'token_invalid',
  TOKEN_REFRESH_FAILED = 'token_refresh_failed',

  // Configuration errors
  PROVIDER_NOT_CONFIGURED = 'provider_not_configured',
  INVALID_REDIRECT_URI = 'invalid_redirect_uri',

  // General errors
  NETWORK_ERROR = 'network_error',
  INTERNAL_ERROR = 'internal_error',
}

/**
 * OAuth error class
 */
export class OAuthError extends Error {
  constructor(
    message: string,
    public code: OAuthErrorCode,
    public statusCode: number = 400,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'OAuthError';

    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, OAuthError);
    }
  }
}

// =============================================================================
// VALIDATION SCHEMAS (Zod)
// =============================================================================

/**
 * OAuth provider validation schema
 */
export const OAuthProviderSchema = z.nativeEnum(OAuthProvider);

/**
 * OAuth source validation schema
 */
export const OAuthSourceSchema = z.nativeEnum(OAuthSource);

/**
 * OAuth authorization request validation schema
 */
export const OAuthAuthorizationRequestSchema = z.object({
  provider: OAuthProviderSchema,
  source: OAuthSourceSchema,
  redirectUri: z.string().url().optional(),
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
});

/**
 * OAuth callback request validation schema
 */
export const OAuthCallbackRequestSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State token is required'),
  error: z.string().optional(),
  errorDescription: z.string().optional(),
});

/**
 * Link OAuth account request validation schema
 */
export const LinkOAuthAccountRequestSchema = z.object({
  provider: OAuthProviderSchema,
  providerAccountId: z.string().min(1),
  providerAccessToken: z.string().min(1),
  providerRefreshToken: z.string().optional(),
  providerTokenExpiry: z.number().optional(),
  profile: z.object({
    id: z.string(),
    email: z.string().email(),
    emailVerified: z.boolean(),
    name: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    avatar: z.string().url().optional(),
    locale: z.string().optional(),
  }),
  currentPassword: z.string().optional(),
});

/**
 * Unlink OAuth account request validation schema
 */
export const UnlinkOAuthAccountRequestSchema = z.object({
  provider: OAuthProviderSchema,
  currentPassword: z.string().optional(),
});

/**
 * LinkedIn profile sync request validation schema
 */
export const LinkedInProfileSyncRequestSchema = z.object({
  userId: z.string().uuid(),
  linkedInAccessToken: z.string().min(1),
  syncMode: z.enum(['full', 'partial']),
  syncOptions: z.object({
    syncPositions: z.boolean().optional(),
    syncEducation: z.boolean().optional(),
    syncSkills: z.boolean().optional(),
    syncCertifications: z.boolean().optional(),
    syncLanguages: z.boolean().optional(),
  }).optional(),
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if provider is supported
 */
export function isSupportedProvider(provider: string): provider is OAuthProvider {
  return Object.values(OAuthProvider).includes(provider as OAuthProvider);
}

/**
 * Get provider display name
 */
export function getProviderDisplayName(provider: OAuthProvider): string {
  const names: Record<OAuthProvider, string> = {
    [OAuthProvider.GOOGLE]: 'Google',
    [OAuthProvider.GITHUB]: 'GitHub',
    [OAuthProvider.LINKEDIN]: 'LinkedIn',
  };
  return names[provider];
}

/**
 * Get provider icon name
 */
export function getProviderIcon(provider: OAuthProvider): string {
  const icons: Record<OAuthProvider, string> = {
    [OAuthProvider.GOOGLE]: 'google',
    [OAuthProvider.GITHUB]: 'github',
    [OAuthProvider.LINKEDIN]: 'linkedin',
  };
  return icons[provider];
}

/**
 * Create OAuth error helper
 */
export function createOAuthError(
  code: OAuthErrorCode,
  message?: string,
  statusCode?: number,
  details?: Record<string, any>
): OAuthError {
  const defaultMessages: Record<OAuthErrorCode, string> = {
    [OAuthErrorCode.INVALID_CODE]: 'Invalid authorization code',
    [OAuthErrorCode.INVALID_STATE]: 'Invalid state token - possible CSRF attempt',
    [OAuthErrorCode.STATE_EXPIRED]: 'OAuth state has expired - please try again',
    [OAuthErrorCode.PROVIDER_ERROR]: 'OAuth provider error',
    [OAuthErrorCode.ACCESS_DENIED]: 'Access denied by user',
    [OAuthErrorCode.EMAIL_ALREADY_EXISTS]: 'Email already registered',
    [OAuthErrorCode.EMAIL_NOT_VERIFIED]: 'Email not verified by OAuth provider',
    [OAuthErrorCode.ACCOUNT_ALREADY_LINKED]: 'Account already linked',
    [OAuthErrorCode.PASSWORD_REQUIRED]: 'Password required for account linking',
    [OAuthErrorCode.TOKEN_EXPIRED]: 'OAuth token expired',
    [OAuthErrorCode.TOKEN_INVALID]: 'Invalid OAuth token',
    [OAuthErrorCode.TOKEN_REFRESH_FAILED]: 'Failed to refresh OAuth token',
    [OAuthErrorCode.PROVIDER_NOT_CONFIGURED]: 'OAuth provider not configured',
    [OAuthErrorCode.INVALID_REDIRECT_URI]: 'Invalid redirect URI',
    [OAuthErrorCode.NETWORK_ERROR]: 'Network error during OAuth',
    [OAuthErrorCode.INTERNAL_ERROR]: 'Internal OAuth error',
  };

  return new OAuthError(
    message || defaultMessages[code],
    code,
    statusCode || 400,
    details
  );
}
