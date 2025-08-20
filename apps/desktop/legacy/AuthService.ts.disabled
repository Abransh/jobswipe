/**
 * @fileoverview Desktop App Authentication Service
 * @description Enterprise-grade authentication service for Electron app
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { BrowserWindow, ipcMain, shell } from 'electron';
import { EventEmitter } from 'events';
import { TokenStorageService } from './TokenStorageService';
import { DeviceRegistrationService } from './DeviceRegistrationService';

// =============================================================================
// INTERFACES
// =============================================================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  profile: Record<string, any>;
}

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
  sessionId: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
}

export interface TokenExchangeRequest {
  success: boolean;
  exchangeToken: string;
  expiresAt: string;
  qrCodeUrl: string;
  deepLinkUrl: string;
  deviceId: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  session: AuthSession | null;
  error: string | null;
}

// =============================================================================
// AUTHENTICATION SERVICE
// =============================================================================

export class AuthService extends EventEmitter {
  private static instance: AuthService;
  private tokenStorage: TokenStorageService;
  private deviceRegistration: DeviceRegistrationService;
  private authWindow: BrowserWindow | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private state: AuthState = {
    isAuthenticated: false,
    isLoading: false,
    user: null,
    session: null,
    error: null
  };

  private constructor() {
    super();
    this.tokenStorage = new TokenStorageService();
    this.deviceRegistration = new DeviceRegistrationService();
    this.setupIpcHandlers();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Initialize authentication service
   */
  async initialize(): Promise<void> {
    try {
      this.setState({ isLoading: true, error: null });

      // Check for existing valid session
      const storedSession = await this.tokenStorage.getSession();
      if (storedSession && !this.isSessionExpired(storedSession)) {
        await this.validateStoredSession(storedSession);
      } else {
        // Clear expired session
        await this.tokenStorage.clearSession();
        this.setState({ isAuthenticated: false, session: null, user: null });
      }
    } catch (error) {
      console.error('Failed to initialize auth service:', error);
      this.setState({ error: 'Failed to initialize authentication' });
    } finally {
      this.setState({ isLoading: false });
    }
  }

  /**
   * Start authentication flow
   */
  async startAuthentication(): Promise<void> {
    try {
      this.setState({ isLoading: true, error: null });

      // Register device
      const deviceInfo = await this.deviceRegistration.getDeviceInfo();
      
      // Create auth window
      await this.createAuthWindow(deviceInfo);
      
    } catch (error) {
      console.error('Failed to start authentication:', error);
      this.setState({ 
        error: 'Failed to start authentication process',
        isLoading: false 
      });
    }
  }

  /**
   * Handle token exchange
   */
  async handleTokenExchange(exchangeToken: string): Promise<void> {
    try {
      this.setState({ isLoading: true, error: null });

      const deviceInfo = await this.deviceRegistration.getDeviceInfo();
      
      const response = await fetch('http://localhost:3000/api/auth/token-exchange/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exchangeToken,
          ...deviceInfo
        }),
      });

      const data = await response.json();

      if (data.success) {
        const session: AuthSession = {
          user: data.user,
          tokens: data.tokens,
          sessionId: data.sessionId,
          expiresAt: new Date(Date.now() + data.tokens.expiresIn * 1000),
          refreshExpiresAt: new Date(Date.now() + data.tokens.refreshExpiresIn * 1000)
        };

        await this.setSession(session);
        this.closeAuthWindow();
        
        this.emit('authenticated', session);
      } else {
        throw new Error(data.error || 'Token exchange failed');
      }
    } catch (error) {
      console.error('Token exchange failed:', error);
      this.setState({ 
        error: 'Authentication failed. Please try again.',
        isLoading: false 
      });
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<boolean> {
    try {
      const session = this.state.session;
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch('http://localhost:3000/api/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: session.tokens.refreshToken
        }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedSession: AuthSession = {
          ...session,
          tokens: data.tokens,
          expiresAt: new Date(Date.now() + data.tokens.expiresIn * 1000)
        };

        await this.setSession(updatedSession);
        this.scheduleTokenRefresh(updatedSession);
        
        return true;
      } else {
        throw new Error(data.error || 'Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.logout();
      return false;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Clear refresh timer
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }

      // Revoke tokens on server
      if (this.state.session) {
        try {
          await fetch('http://localhost:3000/api/auth/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.state.session.tokens.accessToken}`
            },
          });
        } catch (error) {
          console.error('Failed to revoke tokens on server:', error);
        }
      }

      // Clear local storage
      await this.tokenStorage.clearSession();
      
      // Reset state
      this.setState({
        isAuthenticated: false,
        user: null,
        session: null,
        error: null
      });

      this.emit('logout');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  /**
   * Get current authentication state
   */
  getState(): AuthState {
    return { ...this.state };
  }

  /**
   * Get current user
   */
  getUser(): AuthUser | null {
    return this.state.user;
  }

  /**
   * Get current session
   */
  getSession(): AuthSession | null {
    return this.state.session;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  /**
   * Get access token for API calls
   */
  getAccessToken(): string | null {
    return this.state.session?.tokens.accessToken || null;
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  /**
   * Create authentication window
   */
  private async createAuthWindow(deviceInfo: any): Promise<void> {
    if (this.authWindow) {
      this.authWindow.close();
    }

    const queryParams = new URLSearchParams({
      deviceId: deviceInfo.deviceId,
      deviceName: deviceInfo.deviceName,
      platform: deviceInfo.platform,
      deviceType: deviceInfo.deviceType,
      appVersion: deviceInfo.appVersion || '',
      osVersion: deviceInfo.osVersion || ''
    }).toString();

    const authUrl = `http://localhost:3000/desktop/auth?${queryParams}`;

    this.authWindow = new BrowserWindow({
      width: 800,
      height: 700,
      show: false,
      resizable: false,
      maximizable: false,
      minimizable: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true
      },
      title: 'JobSwipe Authentication',
      icon: undefined // Add app icon path
    });

    this.authWindow.loadURL(authUrl);

    this.authWindow.once('ready-to-show', () => {
      this.authWindow?.show();
    });

    this.authWindow.on('closed', () => {
      this.authWindow = null;
      this.setState({ isLoading: false });
    });

    // Handle external links
    this.authWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    // Handle navigation
    this.authWindow.webContents.on('will-navigate', (event, url) => {
      if (url.startsWith('jobswipe://')) {
        event.preventDefault();
        this.handleDeepLink(url);
      } else if (!url.startsWith('http://localhost:3000')) {
        event.preventDefault();
        shell.openExternal(url);
      }
    });
  }

  /**
   * Handle deep link authentication
   */
  private async handleDeepLink(url: string): Promise<void> {
    try {
      const urlObj = new URL(url);
      const exchangeToken = urlObj.searchParams.get('token');
      
      if (exchangeToken) {
        await this.handleTokenExchange(exchangeToken);
      } else {
        throw new Error('Invalid deep link');
      }
    } catch (error) {
      console.error('Deep link handling failed:', error);
      this.setState({ error: 'Authentication link is invalid' });
    }
  }

  /**
   * Close authentication window
   */
  private closeAuthWindow(): void {
    if (this.authWindow) {
      this.authWindow.close();
      this.authWindow = null;
    }
  }

  /**
   * Set authentication session
   */
  private async setSession(session: AuthSession): Promise<void> {
    await this.tokenStorage.setSession(session);
    
    this.setState({
      isAuthenticated: true,
      user: session.user,
      session: session,
      error: null,
      isLoading: false
    });

    this.scheduleTokenRefresh(session);
  }

  /**
   * Validate stored session
   */
  private async validateStoredSession(session: AuthSession): Promise<void> {
    try {
      // Verify token with server
      const response = await fetch('http://localhost:3000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${session.tokens.accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          this.setState({
            isAuthenticated: true,
            user: data.user,
            session: session,
            error: null
          });
          
          this.scheduleTokenRefresh(session);
          this.emit('authenticated', session);
        } else {
          throw new Error('Invalid session');
        }
      } else if (response.status === 401) {
        // Try to refresh token
        const refreshed = await this.refreshAccessToken();
        if (!refreshed) {
          throw new Error('Session expired');
        }
      } else {
        throw new Error('Session validation failed');
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      await this.tokenStorage.clearSession();
      this.setState({ 
        isAuthenticated: false, 
        session: null, 
        user: null,
        error: 'Session expired. Please sign in again.' 
      });
    }
  }

  /**
   * Schedule token refresh
   */
  private scheduleTokenRefresh(session: AuthSession): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Refresh token 5 minutes before expiry
    const refreshTime = session.expiresAt.getTime() - Date.now() - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(async () => {
        await this.refreshAccessToken();
      }, refreshTime);
    }
  }

  /**
   * Check if session is expired
   */
  private isSessionExpired(session: AuthSession): boolean {
    return new Date() >= session.refreshExpiresAt;
  }

  /**
   * Update authentication state
   */
  private setState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };
    this.emit('stateChanged', this.state);
  }

  /**
   * Setup IPC handlers
   */
  private setupIpcHandlers(): void {
    ipcMain.handle('auth-get-state', () => {
      return this.getState();
    });

    ipcMain.handle('auth-start-authentication', async () => {
      await this.startAuthentication();
    });

    ipcMain.handle('auth-logout', async () => {
      await this.logout();
    });

    ipcMain.handle('auth-get-access-token', () => {
      return this.getAccessToken();
    });

    ipcMain.handle('auth-refresh-token', async () => {
      return await this.refreshAccessToken();
    });

    // Handle token exchange from renderer
    ipcMain.handle('auth-token-exchange', async (_, exchangeToken: string) => {
      await this.handleTokenExchange(exchangeToken);
    });
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    if (this.authWindow) {
      this.authWindow.close();
      this.authWindow = null;
    }

    this.removeAllListeners();
  }
}