/**
 * @fileoverview Browser-Safe JWT Utilities for JobSwipe
 * @description JWT utilities that work in browser environments (no crypto dependencies)
 * @version 1.0.0
 * @author JobSwipe Team
 * @environment browser-safe
 */

import { JwtPayload, TokenType, AuthSource, UserId, SessionId } from '../types/auth';
import { createAuthError, AuthErrorCode } from '../types/auth';

// =============================================================================
// BROWSER-SAFE JWT UTILITIES
// =============================================================================

/**
 * Parse JWT payload without verification (for client-side inspection only)
 * WARNING: Never trust this data for security decisions - always verify on server
 */
export function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [, encodedPayload] = parts;
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    
    return payload as JwtPayload;
  } catch (error) {
    console.warn('Failed to parse JWT payload:', error);
    return null;
  }
}

/**
 * Parse JWT header without verification (for client-side inspection only)
 */
export function parseJwtHeader(token: string): { alg: string; typ: string; kid?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader] = parts;
    const header = JSON.parse(base64UrlDecode(encodedHeader));
    
    return header;
  } catch (error) {
    console.warn('Failed to parse JWT header:', error);
    return null;
  }
}

/**
 * Check if token appears to be expired (client-side check only)
 * WARNING: Always verify token expiration on server
 */
export function isTokenExpiredClientSide(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * Check if token needs refresh (client-side check only)
 * WARNING: Always verify on server
 */
export function tokenNeedsRefreshClientSide(token: string, thresholdSeconds: number = 300): boolean {
  const payload = parseJwtPayload(token);
  if (!payload) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  return payload.exp - now < thresholdSeconds;
}

/**
 * Get token expiration time (client-side)
 */
export function getTokenExpirationTimeClientSide(token: string): Date | null {
  const payload = parseJwtPayload(token);
  if (!payload) {
    return null;
  }

  return new Date(payload.exp * 1000);
}

/**
 * Get token issued time (client-side)
 */
export function getTokenIssuedTimeClientSide(token: string): Date | null {
  const payload = parseJwtPayload(token);
  if (!payload) {
    return null;
  }

  return new Date(payload.iat * 1000);
}

/**
 * Extract user information from token (client-side only)
 * WARNING: Never trust this data for security decisions
 */
export function extractUserInfoFromToken(token: string): {
  userId: UserId;
  email: string;
  name?: string;
  role: string;
  sessionId?: SessionId;
  permissions: string[];
  features: string[];
} | null {
  const payload = parseJwtPayload(token);
  if (!payload) {
    return null;
  }

  return {
    userId: payload.sub,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    sessionId: payload.sessionId,
    permissions: payload.permissions || [],
    features: payload.features || [],
  };
}

/**
 * Check if token is for desktop usage (client-side)
 */
export function isDesktopTokenClientSide(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload) {
    return false;
  }

  return payload.source === AuthSource.DESKTOP || payload.type === TokenType.DESKTOP_LONG_LIVED;
}

/**
 * Check if token has permission (client-side)
 * WARNING: Always verify permissions on server
 */
export function tokenHasPermissionClientSide(token: string, permission: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload) {
    return false;
  }

  return payload.permissions?.includes(permission) || false;
}

/**
 * Check if token has feature access (client-side)
 * WARNING: Always verify feature access on server
 */
export function tokenHasFeatureClientSide(token: string, feature: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload) {
    return false;
  }

  return payload.features?.includes(feature) || false;
}

/**
 * Get token time remaining in seconds (client-side)
 */
export function getTokenTimeRemainingSeconds(token: string): number {
  const payload = parseJwtPayload(token);
  if (!payload) {
    return 0;
  }

  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - now);
}

/**
 * Get token time remaining as human-readable string (client-side)
 */
export function getTokenTimeRemainingString(token: string): string {
  const seconds = getTokenTimeRemainingSeconds(token);
  
  if (seconds <= 0) {
    return 'Expired';
  }

  if (seconds < 60) {
    return `${seconds} seconds`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minutes`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hours`;
  }

  const days = Math.floor(hours / 24);
  return `${days} days`;
}

/**
 * Validate token format (basic structure check only)
 * WARNING: This does NOT verify the token signature or content
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  // Check if parts are base64url encoded
  try {
    for (const part of parts) {
      base64UrlDecode(part);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Get token type from token (client-side)
 */
export function getTokenType(token: string): TokenType | null {
  const payload = parseJwtPayload(token);
  if (!payload) {
    return null;
  }

  return payload.type;
}

/**
 * Get token source from token (client-side)
 */
export function getTokenSource(token: string): AuthSource | null {
  const payload = parseJwtPayload(token);
  if (!payload) {
    return null;
  }

  return payload.source;
}

/**
 * Check if token is access token (client-side)
 */
export function isAccessToken(token: string): boolean {
  return getTokenType(token) === TokenType.ACCESS;
}

/**
 * Check if token is refresh token (client-side)
 */
export function isRefreshToken(token: string): boolean {
  return getTokenType(token) === TokenType.REFRESH;
}

/**
 * Check if token is verification token (client-side)
 */
export function isVerificationToken(token: string): boolean {
  return getTokenType(token) === TokenType.VERIFICATION;
}

// =============================================================================
// BROWSER-SAFE UTILITY FUNCTIONS
// =============================================================================

/**
 * Base64URL decode (browser-safe)
 */
function base64UrlDecode(data: string): string {
  // Add padding if needed
  const padded = data + '==='.slice(0, (4 - (data.length % 4)) % 4);
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  
  // Use atob for browser compatibility
  if (typeof window !== 'undefined' && window.atob) {
    return decodeURIComponent(escape(window.atob(base64)));
  }
  
  // Node.js fallback
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Base64URL encode (browser-safe)
 */
function base64UrlEncode(data: string): string {
  let base64: string;
  
  // Use btoa for browser compatibility
  if (typeof window !== 'undefined' && window.btoa) {
    base64 = window.btoa(unescape(encodeURIComponent(data)));
  } else {
    // Node.js fallback
    base64 = Buffer.from(data, 'utf8').toString('base64');
  }
  
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// =============================================================================
// TOKEN STORAGE UTILITIES (BROWSER-SAFE)
// =============================================================================

/**
 * Token storage interface for browser environments
 */
export interface TokenStorage {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  setTokens(accessToken: string, refreshToken: string): void;
  clearTokens(): void;
  isTokenStored(): boolean;
}

/**
 * Memory-based token storage (not persistent)
 */
export class MemoryTokenStorage implements TokenStorage {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }

  isTokenStored(): boolean {
    return this.accessToken !== null;
  }
}

/**
 * LocalStorage-based token storage (browser only)
 */
export class LocalStorageTokenStorage implements TokenStorage {
  private readonly accessTokenKey = 'jobswipe_access_token';
  private readonly refreshTokenKey = 'jobswipe_refresh_token';

  getAccessToken(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage.getItem(this.refreshTokenKey);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('LocalStorage not available');
      return;
    }
    
    window.localStorage.setItem(this.accessTokenKey, accessToken);
    window.localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  clearTokens(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    
    window.localStorage.removeItem(this.accessTokenKey);
    window.localStorage.removeItem(this.refreshTokenKey);
  }

  isTokenStored(): boolean {
    return this.getAccessToken() !== null;
  }
}

/**
 * SessionStorage-based token storage (browser only, session-scoped)
 */
export class SessionStorageTokenStorage implements TokenStorage {
  private readonly accessTokenKey = 'jobswipe_access_token';
  private readonly refreshTokenKey = 'jobswipe_refresh_token';

  getAccessToken(): string | null {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return null;
    }
    return window.sessionStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return null;
    }
    return window.sessionStorage.getItem(this.refreshTokenKey);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      console.warn('SessionStorage not available');
      return;
    }
    
    window.sessionStorage.setItem(this.accessTokenKey, accessToken);
    window.sessionStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  clearTokens(): void {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }
    
    window.sessionStorage.removeItem(this.accessTokenKey);
    window.sessionStorage.removeItem(this.refreshTokenKey);
  }

  isTokenStored(): boolean {
    return this.getAccessToken() !== null;
  }
}

// =============================================================================
// BROWSER-SAFE AUTH UTILITIES
// =============================================================================

/**
 * Browser-safe authentication utilities
 */
export class BrowserAuthUtils {
  constructor(private tokenStorage: TokenStorage = new LocalStorageTokenStorage()) {}

  /**
   * Get current user info from stored token (client-side only)
   */
  getCurrentUser(): {
    userId: UserId;
    email: string;
    name?: string;
    role: string;
    sessionId?: SessionId;
    permissions: string[];
    features: string[];
  } | null {
    const accessToken = this.tokenStorage.getAccessToken();
    if (!accessToken) {
      return null;
    }

    return extractUserInfoFromToken(accessToken);
  }

  /**
   * Check if user is authenticated (client-side check)
   */
  isAuthenticated(): boolean {
    const accessToken = this.tokenStorage.getAccessToken();
    if (!accessToken) {
      return false;
    }

    return !isTokenExpiredClientSide(accessToken);
  }

  /**
   * Check if access token needs refresh
   */
  needsTokenRefresh(): boolean {
    const accessToken = this.tokenStorage.getAccessToken();
    if (!accessToken) {
      return false;
    }

    return tokenNeedsRefreshClientSide(accessToken);
  }

  /**
   * Get access token for API requests
   */
  getAccessToken(): string | null {
    const token = this.tokenStorage.getAccessToken();
    
    // Return null if token is expired
    if (token && isTokenExpiredClientSide(token)) {
      return null;
    }
    
    return token;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.tokenStorage.getRefreshToken();
  }

  /**
   * Store tokens
   */
  setTokens(accessToken: string, refreshToken: string): void {
    this.tokenStorage.setTokens(accessToken, refreshToken);
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    this.tokenStorage.clearTokens();
  }

  /**
   * Get authorization header value
   */
  getAuthorizationHeader(): string | null {
    const token = this.getAccessToken();
    return token ? `Bearer ${token}` : null;
  }
}

// =============================================================================
// DEFAULT INSTANCES
// =============================================================================

/**
 * Default browser auth utils instance
 */
export const defaultBrowserAuthUtils = new BrowserAuthUtils();

// Functions are already exported inline above - no need for additional export block