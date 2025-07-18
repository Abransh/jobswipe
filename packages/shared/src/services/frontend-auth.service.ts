/**
 * @fileoverview Frontend Authentication Service
 * @description Unified authentication service for JobSwipe web and desktop applications
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Enterprise-grade authentication with JWT tokens
 */

// Browser environment type declarations
declare const window: Window | undefined;
declare const document: Document | undefined;
declare const sessionStorage: Storage | undefined;
declare const localStorage: Storage | undefined;

import { 
  LoginRequest, 
  LoginResponse,
  RegisterRequest, 
  RegisterResponse, 
  RefreshTokenRequest,
  AuthSource,
  AuthProvider,
  AuthErrorCode,
  createAuthError,
  AuthenticatedUser,
  AuthSession,
  AuthTokens
} from '../types/auth';
import { 
  JWT_CONFIG, 
  API_VERSION 
} from '../constants';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export interface AuthState {
  user: AuthenticatedUser | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthConfig {
  apiBaseUrl: string;
  tokenStorageKey: string;
  refreshTokenStorageKey: string;
  sessionStorageKey: string;
  enableAutoRefresh: boolean;
  refreshThresholdMinutes: number;
}

export interface OAuthProvider {
  id: AuthProvider;
  name: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  authUrl: string;
}

export interface TokenStorage {
  getAccessToken(): string | null;
  setAccessToken(token: string): void;
  getRefreshToken(): string | null;
  setRefreshToken(token: string): void;
  clearTokens(): void;
  isTokenExpired(token: string): boolean;
}

// =============================================================================
// TOKEN STORAGE IMPLEMENTATION
// =============================================================================

class SecureTokenStorage implements TokenStorage {
  private readonly ACCESS_TOKEN_KEY = 'jobswipe_access_token';
  private readonly REFRESH_TOKEN_KEY = 'jobswipe_refresh_token';

  /**
   * Get access token from secure storage
   */
  getAccessToken(): string | null {
    try {
      // In browser environment, use httpOnly cookies when possible
      if (typeof document !== 'undefined') {
        const token = this.getCookie(this.ACCESS_TOKEN_KEY);
        if (token) return token;
      }
      
      // Fallback to sessionStorage for development
      return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving access token:', error);
      return null;
    }
  }

  /**
   * Set access token in secure storage
   */
  setAccessToken(token: string): void {
    try {
      // In production, this should be set via httpOnly cookie from backend
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(this.ACCESS_TOKEN_KEY, token);
      }
    } catch (error) {
      console.error('Error storing access token:', error);
    }
  }

  /**
   * Get refresh token from secure storage
   */
  getRefreshToken(): string | null {
    try {
      // In browser environment, use httpOnly cookies when possible
      if (typeof document !== 'undefined') {
        const token = this.getCookie(this.REFRESH_TOKEN_KEY);
        if (token) return token;
      }
      
      // Fallback to localStorage for development
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }
  }

  /**
   * Set refresh token in secure storage
   */
  setRefreshToken(token: string): void {
    try {
      // In production, this should be set via httpOnly cookie from backend
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
      }
    } catch (error) {
      console.error('Error storing refresh token:', error);
    }
  }

  /**
   * Clear all tokens from storage
   */
  clearTokens(): void {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      }
      
      // Clear cookies if available
      if (typeof document !== 'undefined') {
        this.deleteCookie(this.ACCESS_TOKEN_KEY);
        this.deleteCookie(this.REFRESH_TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      if (!token) return true;
      
      // Parse JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  /**
   * Get cookie value by name
   */
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  /**
   * Delete cookie by name
   */
  private deleteCookie(name: string): void {
    if (typeof document === 'undefined') return;
    
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}

// =============================================================================
// FRONTEND AUTH SERVICE
// =============================================================================

export class FrontendAuthService {
  private config: AuthConfig;
  private tokenStorage: TokenStorage;
  private refreshTimer: NodeJS.Timeout | null = null;
  private authState: AuthState = {
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };
  private listeners: Array<(state: AuthState) => void> = [];

  constructor(config: AuthConfig) {
    this.config = config;
    this.tokenStorage = new SecureTokenStorage();
    
    // Initialize auth state on service creation
    this.initializeAuthState();
  }

  // ===========================================================================
  // PUBLIC API METHODS
  // ===========================================================================

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      this.setLoading(true);
      this.clearError();

      const loginRequest: LoginRequest = {
        email,
        password,
        source: AuthSource.WEB,
      };

      const response = await this.makeAuthRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginRequest),
      });

      if (response.success && response.tokens && response.user) {
        await this.handleSuccessfulAuth(response);
      }

      return response;
    } catch (error) {
      const authError = this.handleAuthError(error);
      this.setError(authError.message);
      throw authError;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Register new user account
   */
  async register(registerData: RegisterRequest): Promise<RegisterResponse> {
    try {
      this.setLoading(true);
      this.clearError();

      const response = await this.makeAuthRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...registerData,
          source: AuthSource.WEB,
        }),
      });

      if (response.success && response.tokens && response.user) {
        await this.handleSuccessfulAuth(response);
      }

      return response;
    } catch (error) {
      const authError = this.handleAuthError(error);
      this.setError(authError.message);
      throw authError;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Logout user and clear session
   */
  async logout(): Promise<void> {
    try {
      this.setLoading(true);
      
      // Call logout endpoint to invalidate session
      await this.makeAuthRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      this.clearAuthState();
      this.setLoading(false);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = this.tokenStorage.getRefreshToken();
      if (!refreshToken || this.tokenStorage.isTokenExpired(refreshToken)) {
        this.clearAuthState();
        return false;
      }

      const refreshRequest: RefreshTokenRequest = {
        refreshToken,
        source: AuthSource.WEB,
      };

      const response = await this.makeAuthRequest('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify(refreshRequest),
      });

      if (response.success && response.tokens) {
        this.tokenStorage.setAccessToken(response.tokens.accessToken);
        
        if (response.tokens.refreshToken) {
          this.tokenStorage.setRefreshToken(response.tokens.refreshToken);
        }
        
        this.scheduleTokenRefresh();
        return true;
      }

      this.clearAuthState();
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearAuthState();
      return false;
    }
  }

  /**
   * Get current authentication state
   */
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get OAuth authorization URL
   */
  getOAuthUrl(provider: AuthProvider, redirectUri?: string): string {
    const baseUrl = `${this.config.apiBaseUrl}/${API_VERSION}/auth/oauth/${provider}`;
    const defaultRedirectUri = typeof window !== 'undefined' ? window.location.origin + '/auth/callback' : '/auth/callback';
    const params = new URLSearchParams({
      redirect_uri: redirectUri || defaultRedirectUri,
      source: AuthSource.WEB,
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(code: string, state: string, provider: AuthProvider): Promise<LoginResponse> {
    try {
      this.setLoading(true);
      this.clearError();

      const response = await this.makeAuthRequest(`/auth/oauth/${provider}/callback`, {
        method: 'POST',
        body: JSON.stringify({
          code,
          state,
          source: AuthSource.WEB,
        }),
      });

      if (response.success && response.tokens && response.user) {
        await this.handleSuccessfulAuth(response);
      }

      return response;
    } catch (error) {
      const authError = this.handleAuthError(error);
      this.setError(authError.message);
      throw authError;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const accessToken = this.tokenStorage.getAccessToken();
    return !!(accessToken && !this.tokenStorage.isTokenExpired(accessToken));
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthenticatedUser | null {
    return this.authState.user;
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<AuthenticatedUser>): Promise<AuthenticatedUser> {
    try {
      this.setLoading(true);
      
      const response = await this.makeAuthRequest('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(profileData),
      });

      if (response.success && response.user) {
        this.setUser(response.user);
        return response.user;
      }

      throw createAuthError(AuthErrorCode.INTERNAL_ERROR, 'Failed to update profile');
    } catch (error) {
      const authError = this.handleAuthError(error);
      this.setError(authError.message);
      throw authError;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      this.setLoading(true);
      
      await this.makeAuthRequest('/auth/password/reset-request', {
        method: 'POST',
        body: JSON.stringify({ email, source: AuthSource.WEB }),
      });
    } catch (error) {
      const authError = this.handleAuthError(error);
      this.setError(authError.message);
      throw authError;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      this.setLoading(true);
      
      await this.makeAuthRequest('/auth/password/reset', {
        method: 'POST',
        body: JSON.stringify({ 
          token, 
          newPassword,
          source: AuthSource.WEB 
        }),
      });
    } catch (error) {
      const authError = this.handleAuthError(error);
      this.setError(authError.message);
      throw authError;
    } finally {
      this.setLoading(false);
    }
  }

  // ===========================================================================
  // PRIVATE METHODS
  // ===========================================================================

  /**
   * Initialize authentication state on service startup
   */
  private async initializeAuthState(): Promise<void> {
    try {
      const accessToken = this.tokenStorage.getAccessToken();
      
      if (accessToken && !this.tokenStorage.isTokenExpired(accessToken)) {
        // Try to get current user with existing token
        const response = await this.makeAuthRequest('/auth/me', {
          method: 'GET',
        });

        if (response.success && response.user) {
          this.setUser(response.user);
          this.setAuthenticated(true);
          this.scheduleTokenRefresh();
        } else {
          this.clearAuthState();
        }
      } else {
        // Try to refresh token
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          await this.initializeAuthState();
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth state:', error);
      this.clearAuthState();
    }
  }

  /**
   * Handle successful authentication response
   */
  private async handleSuccessfulAuth(response: LoginResponse | RegisterResponse): Promise<void> {
    if (!response.tokens || !response.user) {
      throw createAuthError(AuthErrorCode.INTERNAL_ERROR, 'Invalid auth response');
    }

    // Store tokens securely
    this.tokenStorage.setAccessToken(response.tokens.accessToken);
    if (response.tokens.refreshToken) {
      this.tokenStorage.setRefreshToken(response.tokens.refreshToken);
    }

    // Update auth state
    this.setUser(response.user);
    this.setAuthenticated(true);

    // Schedule automatic token refresh
    this.scheduleTokenRefresh();
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(): void {
    if (!this.config.enableAutoRefresh) return;

    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const accessToken = this.tokenStorage.getAccessToken();
    if (!accessToken) return;

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const refreshTime = expirationTime - (this.config.refreshThresholdMinutes * 60 * 1000);
      const timeUntilRefresh = refreshTime - currentTime;

      if (timeUntilRefresh > 0) {
        this.refreshTimer = setTimeout(() => {
          this.refreshAccessToken();
        }, timeUntilRefresh);
      }
    } catch (error) {
      console.error('Error scheduling token refresh:', error);
    }
  }

  /**
   * Make authenticated API request
   */
  private async makeAuthRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.config.apiBaseUrl}/${API_VERSION}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if token available
    const accessToken = this.tokenStorage.getAccessToken();
    if (accessToken && !this.tokenStorage.isTokenExpired(accessToken)) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for httpOnly tokens
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as any;
      throw createAuthError(
        errorData?.code || AuthErrorCode.INTERNAL_ERROR,
        errorData?.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: any): Error {
    if (error?.code) {
      return error;
    }

    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      return createAuthError(AuthErrorCode.INTERNAL_ERROR, 'Network error. Please check your connection.');
    }

    return createAuthError(AuthErrorCode.INTERNAL_ERROR, error?.message || 'An unexpected error occurred');
  }

  /**
   * Clear authentication state
   */
  private clearAuthState(): void {
    this.tokenStorage.clearTokens();
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    this.authState = {
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };

    this.notifyListeners();
  }

  /**
   * Set user in auth state
   */
  private setUser(user: AuthenticatedUser): void {
    this.authState.user = user;
    this.notifyListeners();
  }

  /**
   * Set authentication status
   */
  private setAuthenticated(isAuthenticated: boolean): void {
    this.authState.isAuthenticated = isAuthenticated;
    this.notifyListeners();
  }

  /**
   * Set loading state
   */
  private setLoading(isLoading: boolean): void {
    this.authState.isLoading = isLoading;
    this.notifyListeners();
  }

  /**
   * Set error message
   */
  private setError(error: string): void {
    this.authState.error = error;
    this.notifyListeners();
  }

  /**
   * Clear error message
   */
  private clearError(): void {
    this.authState.error = null;
    this.notifyListeners();
  }

  /**
   * Notify all subscribers of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getAuthState());
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

export const defaultAuthConfig: AuthConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  tokenStorageKey: 'jobswipe_auth',
  refreshTokenStorageKey: 'jobswipe_refresh',
  sessionStorageKey: 'jobswipe_session',
  enableAutoRefresh: true,
  refreshThresholdMinutes: 5, // Refresh 5 minutes before expiration
};

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let authServiceInstance: FrontendAuthService | null = null;

/**
 * Get singleton auth service instance
 */
export function getAuthService(config?: Partial<AuthConfig>): FrontendAuthService {
  if (!authServiceInstance) {
    const finalConfig = { ...defaultAuthConfig, ...config };
    authServiceInstance = new FrontendAuthService(finalConfig);
  }
  return authServiceInstance;
}

/**
 * Reset auth service instance (useful for testing)
 */
export function resetAuthService(): void {
  authServiceInstance = null;
}

export default FrontendAuthService;