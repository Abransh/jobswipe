/**
 * @fileoverview Authentication Context for React Applications
 * @description React context and hooks for unified authentication across JobSwipe applications
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Enterprise-grade authentication with custom JWT integration
 */

'use client';

// Browser environment type declarations
declare const window: Window | undefined;

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { 
  FrontendAuthService, 
  AuthState, 
  AuthConfig, 
  getAuthService,
  defaultAuthConfig 
} from '../services/frontend-auth.service';
import { 
  AuthenticatedUser, 
  LoginResponse,
  RegisterRequest, 
  RegisterResponse,
  AuthProvider 
} from '../types/auth';

// =============================================================================
// CONTEXT INTERFACES
// =============================================================================

export interface AuthContextValue {
  // Auth state
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Auth actions
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
  
  // OAuth actions
  loginWithOAuth: (provider: AuthProvider, redirectUri?: string) => void;
  handleOAuthCallback: (code: string, state: string, provider: AuthProvider) => Promise<LoginResponse>;
  
  // Profile actions
  updateProfile: (data: Partial<AuthenticatedUser>) => Promise<AuthenticatedUser>;
  
  // Password actions
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  
  // Utility methods
  getAuthService: () => FrontendAuthService;
}

// =============================================================================
// CONTEXT CREATION
// =============================================================================

const AuthContext = createContext<AuthContextValue | null>(null);

// =============================================================================
// AUTH PROVIDER COMPONENT
// =============================================================================

export interface AuthProviderProps {
  children: ReactNode;
  config?: Partial<AuthConfig>;
}

export function AuthProvider({ children, config }: AuthProviderProps) {
  const [authState, setAuthState] = React.useState<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Get auth service instance
  const authService = React.useMemo(
    () => getAuthService(config),
    [config]
  );

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = authService.subscribe((newState: AuthState) => {
      setAuthState(newState);
    });

    // Initialize with current state
    setAuthState(authService.getAuthState());

    return unsubscribe;
  }, [authService]);

  // ==========================================================================
  // AUTH ACTION IMPLEMENTATIONS
  // ==========================================================================

  const login = React.useCallback(
    async (email: string, password: string): Promise<LoginResponse> => {
      return authService.login(email, password);
    },
    [authService]
  );

  const register = React.useCallback(
    async (data: RegisterRequest): Promise<RegisterResponse> => {
      return authService.register(data);
    },
    [authService]
  );

  const logout = React.useCallback(async (): Promise<void> => {
    return authService.logout();
  }, [authService]);

  const refreshToken = React.useCallback(async (): Promise<boolean> => {
    return authService.refreshAccessToken();
  }, [authService]);

  const clearError = React.useCallback((): void => {
    // Clear error by setting internal state (will be handled by service)
    setAuthState((prev: AuthState) => ({ ...prev, error: null }));
  }, []);

  // ==========================================================================
  // OAUTH ACTION IMPLEMENTATIONS
  // ==========================================================================

  const loginWithOAuth = React.useCallback(
    (provider: AuthProvider, redirectUri?: string): void => {
      const authUrl = authService.getOAuthUrl(provider, redirectUri);
      if (typeof window !== 'undefined') {
        window.location.href = authUrl;
      }
    },
    [authService]
  );

  const handleOAuthCallback = React.useCallback(
    async (code: string, state: string, provider: AuthProvider): Promise<LoginResponse> => {
      return authService.handleOAuthCallback(code, state, provider);
    },
    [authService]
  );

  // ==========================================================================
  // PROFILE ACTION IMPLEMENTATIONS
  // ==========================================================================

  const updateProfile = React.useCallback(
    async (data: Partial<AuthenticatedUser>): Promise<AuthenticatedUser> => {
      return authService.updateProfile(data);
    },
    [authService]
  );

  // ==========================================================================
  // PASSWORD ACTION IMPLEMENTATIONS
  // ==========================================================================

  const requestPasswordReset = React.useCallback(
    async (email: string): Promise<void> => {
      return authService.requestPasswordReset(email);
    },
    [authService]
  );

  const resetPassword = React.useCallback(
    async (token: string, newPassword: string): Promise<void> => {
      return authService.resetPassword(token, newPassword);
    },
    [authService]
  );

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  const getAuthServiceInstance = React.useCallback((): FrontendAuthService => {
    return authService;
  }, [authService]);

  // ==========================================================================
  // CONTEXT VALUE
  // ==========================================================================

  const contextValue: AuthContextValue = React.useMemo(
    () => ({
      // Auth state
      user: authState.user,
      isAuthenticated: authState.isAuthenticated,
      isLoading: authState.isLoading,
      error: authState.error,
      
      // Auth actions
      login,
      register,
      logout,
      refreshToken,
      clearError,
      
      // OAuth actions
      loginWithOAuth,
      handleOAuthCallback,
      
      // Profile actions
      updateProfile,
      
      // Password actions
      requestPasswordReset,
      resetPassword,
      
      // Utility methods
      getAuthService: getAuthServiceInstance,
    }),
    [
      authState,
      login,
      register,
      logout,
      refreshToken,
      clearError,
      loginWithOAuth,
      handleOAuthCallback,
      updateProfile,
      requestPasswordReset,
      resetPassword,
      getAuthServiceInstance,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// =============================================================================
// AUTH HOOKS
// =============================================================================

/**
 * Primary auth hook - provides complete auth functionality
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Hook for auth state only (no actions)
 */
export function useAuthState() {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  return { user, isAuthenticated, isLoading, error };
}

/**
 * Hook for current user
 */
export function useUser(): AuthenticatedUser | null {
  const { user } = useAuth();
  return user;
}

/**
 * Hook for authentication status
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook for loading state
 */
export function useAuthLoading(): boolean {
  const { isLoading } = useAuth();
  return isLoading;
}

/**
 * Hook for authentication error
 */
export function useAuthError(): string | null {
  const { error } = useAuth();
  return error;
}

/**
 * Hook for login action
 */
export function useLogin() {
  const { login, isLoading, error } = useAuth();
  return { login, isLoading, error };
}

/**
 * Hook for registration action
 */
export function useRegister() {
  const { register, isLoading, error } = useAuth();
  return { register, isLoading, error };
}

/**
 * Hook for logout action
 */
export function useLogout() {
  const { logout, isLoading } = useAuth();
  return { logout, isLoading };
}

/**
 * Hook for OAuth authentication
 */
export function useOAuth() {
  const { loginWithOAuth, handleOAuthCallback, isLoading, error } = useAuth();
  return { loginWithOAuth, handleOAuthCallback, isLoading, error };
}

/**
 * Hook for profile management
 */
export function useProfile() {
  const { user, updateProfile, isLoading, error } = useAuth();
  return { user, updateProfile, isLoading, error };
}

/**
 * Hook for password management
 */
export function usePassword() {
  const { requestPasswordReset, resetPassword, isLoading, error } = useAuth();
  return { requestPasswordReset, resetPassword, isLoading, error };
}

// =============================================================================
// HIGHER-ORDER COMPONENTS
// =============================================================================

/**
 * HOC to protect routes that require authentication
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    redirectTo?: string;
    loading?: React.ComponentType;
    unauthorized?: React.ComponentType;
  } = {}
) {
  const { 
    redirectTo = '/auth/signin', 
    loading: LoadingComponent,
    unauthorized: UnauthorizedComponent 
  } = options;

  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, user } = useAuth();

    // Show loading component while checking authentication
    if (isLoading) {
      if (LoadingComponent) {
        return <LoadingComponent />;
      }
      return <div>Loading...</div>;
    }

    // Redirect or show unauthorized component if not authenticated
    if (!isAuthenticated || !user) {
      if (UnauthorizedComponent) {
        return <UnauthorizedComponent />;
      }
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
      return null;
    }

    // Render protected component
    return <Component {...props} />;
  };
}

/**
 * HOC to protect routes that require guest status (not authenticated)
 */
export function withGuest<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    redirectTo?: string;
    loading?: React.ComponentType;
  } = {}
) {
  const { redirectTo = '/dashboard', loading: LoadingComponent } = options;

  return function GuestComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    // Show loading component while checking authentication
    if (isLoading) {
      if (LoadingComponent) {
        return <LoadingComponent />;
      }
      return <div>Loading...</div>;
    }

    // Redirect if already authenticated
    if (isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
      return null;
    }

    // Render guest component
    return <Component {...props} />;
  };
}

// =============================================================================
// UTILITY COMPONENTS
// =============================================================================

/**
 * Component that renders children only when authenticated
 */
export function AuthRequired({ 
  children, 
  fallback 
}: { 
  children: ReactNode; 
  fallback?: ReactNode; 
}) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return fallback || <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * Component that renders children only when not authenticated
 */
export function GuestOnly({ 
  children, 
  fallback 
}: { 
  children: ReactNode; 
  fallback?: ReactNode; 
}) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return fallback || <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return fallback || null;
  }

  return <>{children}</>;
}

// =============================================================================
// EXPORTS
// =============================================================================

export default AuthContext;
export type { AuthContextValue, AuthProviderProps };