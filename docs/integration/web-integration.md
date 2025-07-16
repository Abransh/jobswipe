# Web Application Authentication Integration Guide

## Overview

This guide provides step-by-step instructions for integrating JobSwipe's authentication system into web applications using React, TypeScript, and modern web technologies.

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- React 18+ application
- TypeScript 5.0+
- Modern bundler (Vite, Webpack, etc.)

## Installation

### 1. Install Required Dependencies

```bash
# Core dependencies
npm install @jobswipe/auth-client axios zod

# UI dependencies (if using our components)
npm install @radix-ui/react-dialog @radix-ui/react-form
npm install @radix-ui/react-toast @radix-ui/react-progress
npm install tailwindcss @tailwindcss/forms class-variance-authority
npm install lucide-react clsx tailwind-merge

# Optional: For advanced features
npm install qrcode.react react-hook-form @hookform/resolvers
```

### 2. Configure TypeScript

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

### 3. Environment Configuration

Create `.env.local`:

```env
REACT_APP_API_BASE_URL=http://localhost:3000
REACT_APP_AUTH_TOKEN_KEY=jobswipe_auth_token
REACT_APP_REFRESH_TOKEN_KEY=jobswipe_refresh_token
```

## Core Integration

### 1. Authentication Client Setup

Create `src/lib/auth-client.ts`:

```typescript
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { z } from 'zod';

// API Response Schemas
const AuthResponseSchema = z.object({
  success: z.boolean(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    role: z.string(),
    profile: z.record(z.any())
  }),
  tokens: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    tokenType: z.literal('Bearer'),
    expiresIn: z.number(),
    refreshExpiresIn: z.number()
  }),
  session: z.object({
    id: z.string(),
    userId: z.string(),
    expiresAt: z.string()
  })
});

const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  errorCode: z.string(),
  details: z.record(z.any()).optional()
});

// Request Schemas
const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  source: z.enum(['web', 'desktop', 'mobile', 'api']),
  rememberMe: z.boolean().optional()
});

const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  source: z.enum(['web', 'desktop', 'mobile', 'api']),
  termsAccepted: z.boolean(),
  privacyAccepted: z.boolean(),
  marketingConsent: z.boolean().optional(),
  timezone: z.string().optional(),
  companySize: z.string().optional(),
  industry: z.string().optional()
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export class AuthClient {
  private api: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseURL: string = process.env.REACT_APP_API_BASE_URL!) {
    this.api = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Load tokens from localStorage
    this.loadTokens();
    
    // Setup interceptors
    this.setupInterceptors();
  }

  // Authentication Methods
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const validated = RegisterRequestSchema.parse(data);
    
    const response = await this.api.post('/auth/register', validated);
    const result = AuthResponseSchema.parse(response.data);
    
    if (result.success) {
      this.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
    }
    
    return result;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const validated = LoginRequestSchema.parse(data);
    
    const response = await this.api.post('/auth/login', validated);
    const result = AuthResponseSchema.parse(response.data);
    
    if (result.success) {
      this.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
    }
    
    return result;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await this.api.post('/auth/token/refresh', {
        refreshToken: this.refreshToken
      });
      
      const result = AuthResponseSchema.parse(response.data);
      
      if (result.success) {
        this.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
        return true;
      }
    } catch (error) {
      this.clearTokens();
    }
    
    return false;
  }

  async getProfile(): Promise<AuthResponse['user']> {
    const response = await this.api.get('/auth/profile');
    const result = z.object({
      success: z.boolean(),
      user: AuthResponseSchema.shape.user
    }).parse(response.data);
    
    return result.user;
  }

  // Token Management
  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    localStorage.setItem(process.env.REACT_APP_AUTH_TOKEN_KEY!, accessToken);
    localStorage.setItem(process.env.REACT_APP_REFRESH_TOKEN_KEY!, refreshToken);
  }

  private loadTokens(): void {
    this.accessToken = localStorage.getItem(process.env.REACT_APP_AUTH_TOKEN_KEY!);
    this.refreshToken = localStorage.getItem(process.env.REACT_APP_REFRESH_TOKEN_KEY!);
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    
    localStorage.removeItem(process.env.REACT_APP_AUTH_TOKEN_KEY!);
    localStorage.removeItem(process.env.REACT_APP_REFRESH_TOKEN_KEY!);
  }

  // Interceptors
  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          const refreshed = await this.refreshAccessToken();
          
          if (refreshed) {
            originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
            return this.api(originalRequest);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Utility Methods
  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}

// Export singleton instance
export const authClient = new AuthClient();
```

### 2. Authentication Context

Create `src/contexts/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authClient, AuthResponse } from '../lib/auth-client';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingConsent?: boolean;
  timezone?: string;
  companySize?: string;
  industry?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      if (authClient.isAuthenticated()) {
        const profile = await authClient.getProfile();
        setUser(profile);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authClient.login({
        email,
        password,
        source: 'web',
        rememberMe
      });
      
      setUser(response.user);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authClient.register({
        ...data,
        source: 'web'
      });
      
      setUser(response.user);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authClient.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

### 3. Authentication Components

Create `src/components/auth/LoginForm.tsx`:

```typescript
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear global error
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await login(formData.email, formData.password, formData.rememberMe);
      onSuccess?.();
    } catch (error) {
      // Error is handled by context
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {formErrors.email && (
              <p className="text-sm text-red-600">{formErrors.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-2 top-2 h-5 w-5 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {formErrors.password && (
              <p className="text-sm text-red-600">{formErrors.password}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={isLoading}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="rememberMe" className="text-sm">
              Remember me
            </Label>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-sm text-blue-600 hover:underline"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
```

### 4. Route Protection

Create `src/components/auth/ProtectedRoute.tsx`:

```typescript
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
```

### 5. App Integration

Update your `src/App.tsx`:

```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginForm } from './components/auth/LoginForm';
import { Dashboard } from './pages/Dashboard';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route
              path="/login"
              element={
                <ProtectedRoute requireAuth={false}>
                  <div className="flex items-center justify-center min-h-screen">
                    <LoginForm />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

## Advanced Features

### 1. Session Management

```typescript
// src/hooks/useSession.ts
import { useEffect, useState } from 'react';
import { authClient } from '../lib/auth-client';

export const useSession = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await authClient.api.get('/auth/sessions');
      setSessions(response.data.sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      await authClient.api.post('/auth/sessions/terminate', { sessionId });
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Failed to terminate session:', error);
    }
  };

  return { sessions, loading, terminateSession, refetch: loadSessions };
};
```

### 2. Multi-Factor Authentication

```typescript
// src/components/auth/MFASetup.tsx
import React, { useState, useEffect } from 'react';
import { authClient } from '../../lib/auth-client';
import QRCode from 'qrcode.react';

export const MFASetup: React.FC = () => {
  const [setup, setSetup] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initiateMFASetup();
  }, []);

  const initiateMFASetup = async () => {
    try {
      const response = await authClient.api.post('/auth/mfa/setup/totp');
      setSetup(response.data.setup);
    } catch (error) {
      console.error('Failed to setup MFA:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyMFA = async () => {
    try {
      await authClient.api.post('/auth/mfa/verify', {
        code: verificationCode,
        method: 'totp'
      });
      // Handle success
    } catch (error) {
      console.error('MFA verification failed:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Setup Two-Factor Authentication</h3>
        <p className="text-gray-600">Scan the QR code with your authenticator app</p>
      </div>
      
      {setup && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <QRCode value={setup.qrCodeUrl} size={200} />
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Manual entry key: <code className="bg-gray-100 px-2 py-1 rounded">{setup.manualEntryKey}</code>
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Verification Code</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <button
            onClick={verifyMFA}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Verify and Enable
          </button>
        </div>
      )}
    </div>
  );
};
```

## Error Handling

### 1. Global Error Boundary

```typescript
// src/components/ErrorBoundary.tsx
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Authentication error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
            <p className="mt-2 text-gray-600">Please refresh the page and try again</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Testing

### 1. Test Setup

```typescript
// src/test-utils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
};

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### 2. Authentication Tests

```typescript
// src/__tests__/auth.test.tsx
import { render, screen, fireEvent, waitFor } from '../test-utils';
import { LoginForm } from '../components/auth/LoginForm';

describe('LoginForm', () => {
  it('renders login form', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<LoginForm />);
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    });
  });
});
```

## Performance Optimization

### 1. Code Splitting

```typescript
// src/pages/LazyAuthPages.tsx
import { lazy } from 'react';

export const LazyLogin = lazy(() => import('./LoginPage'));
export const LazyRegister = lazy(() => import('./RegisterPage'));
export const LazyDashboard = lazy(() => import('./Dashboard'));
```

### 2. Token Refresh Optimization

```typescript
// src/hooks/useTokenRefresh.ts
import { useEffect, useRef } from 'react';
import { authClient } from '../lib/auth-client';

export const useTokenRefresh = () => {
  const refreshTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const scheduleRefresh = () => {
      // Clear existing timer
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      // Schedule refresh 5 minutes before expiry
      const refreshTime = 10 * 60 * 1000; // 10 minutes
      refreshTimerRef.current = setTimeout(async () => {
        try {
          await authClient.refreshAccessToken();
          scheduleRefresh(); // Schedule next refresh
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
      }, refreshTime);
    };

    if (authClient.isAuthenticated()) {
      scheduleRefresh();
    }

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);
};
```

## Production Considerations

### 1. Environment Variables

```env
# Production .env
REACT_APP_API_BASE_URL=https://api.jobswipe.io
REACT_APP_AUTH_TOKEN_KEY=jobswipe_auth_token
REACT_APP_REFRESH_TOKEN_KEY=jobswipe_refresh_token
REACT_APP_ENVIRONMENT=production
```

### 2. Security Headers

```typescript
// src/utils/security.ts
export const setupSecurityHeaders = () => {
  // Content Security Policy
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";
  document.head.appendChild(meta);
};
```

### 3. Error Monitoring

```typescript
// src/utils/monitoring.ts
export const logAuthError = (error: Error, context: string) => {
  // Log to your monitoring service
  console.error(`Auth Error [${context}]:`, error);
  
  // Send to monitoring service (e.g., Sentry)
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error, { tags: { context } });
  }
};
```

## Troubleshooting

### Common Issues

1. **Token Refresh Loops**: Ensure proper error handling in token refresh interceptor
2. **CORS Issues**: Configure CORS properly on your API server
3. **localStorage Security**: Consider using secure storage for sensitive data
4. **Race Conditions**: Use proper loading states and debouncing

### Debug Mode

```typescript
// src/config/debug.ts
export const DEBUG = process.env.NODE_ENV === 'development';

export const debugLog = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[JobSwipe Auth] ${message}`, data);
  }
};
```

---

This guide provides a comprehensive integration solution for web applications. For additional support, refer to the [API documentation](../api/authentication.md) or contact the development team.