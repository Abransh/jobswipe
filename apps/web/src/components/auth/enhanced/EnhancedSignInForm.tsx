'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@jobswipe/shared/browser';
import Link from 'next/link';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Fingerprint,
  Smartphone
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { OAuthProviders } from '../OAuthProviders';
import { FormInput } from '../FormInput';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
  deviceTrust: z.boolean().optional(),
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SecurityEvent {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
}

interface RateLimitInfo {
  remaining: number;
  reset: Date;
  blocked: boolean;
}

export function EnhancedSignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState<Date | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  // Use the custom auth context
  const { login, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
  });

  const email = watch('email');
  const password = watch('password');

  // Check for biometric authentication support
  useEffect(() => {
    const checkBiometricSupport = async () => {
      try {
        if (typeof window !== 'undefined' && 'credentials' in navigator) {
          const available = await (navigator.credentials as any).get({
            publicKey: {
              challenge: new Uint8Array(32),
              rp: { name: 'JobSwipe' },
              user: {
                id: new Uint8Array(16),
                name: 'test',
                displayName: 'Test User',
              },
              pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
              timeout: 60000,
            },
          });
          setBiometricSupported(!!available);
        }
      } catch (error) {
        // Biometric not supported or available
        setBiometricSupported(false);
      }
    };

    checkBiometricSupport();
  }, []);

  // Add security event
  const addSecurityEvent = (type: SecurityEvent['type'], message: string) => {
    setSecurityEvents(prev => [...prev.slice(-4), {
      type,
      message,
      timestamp: new Date(),
    }]);
  };

  // Real-time validation feedback
  const getEmailValidationStatus = () => {
    if (!email) return null;
    if (errors.email) return 'error';
    if (z.string().email().safeParse(email).success) return 'success';
    return 'warning';
  };

  const getPasswordValidationStatus = () => {
    if (!password) return null;
    if (errors.password) return 'error';
    if (password.length >= 8) return 'success';
    return 'warning';
  };

  const handleBiometricAuth = async () => {
    try {
      addSecurityEvent('info', 'Biometric authentication initiated');
      
      const credential = await (navigator.credentials as any).get({
        publicKey: {
          challenge: new Uint8Array(32),
          rpId: window.location.hostname,
          allowCredentials: [],
          userVerification: 'required',
        },
      });

      if (credential) {
        // In a real implementation, send credential to server for verification
        addSecurityEvent('success', 'Biometric authentication successful');
        router.push(callbackUrl);
      }
    } catch (error) {
      addSecurityEvent('error', 'Biometric authentication failed');
    }
  };

  const onSubmit = async (data: SignInFormData) => {
    // Clear any existing errors
    clearError();
    setAttemptCount(prev => prev + 1);
    setLastAttemptTime(new Date());

    try {
      addSecurityEvent('info', 'Sign-in attempt initiated');

      const response = await login(data.email, data.password);

      if (response.success && response.user) {
        addSecurityEvent('success', 'Authentication successful');
        
        // Store device trust if selected
        if (data.deviceTrust) {
          localStorage.setItem('deviceTrusted', 'true');
          localStorage.setItem('deviceTrustDate', new Date().toISOString());
        }
        
        // Redirect to callback URL on successful login
        router.push(callbackUrl);
      } else {
        // Handle specific error cases
        if (error?.includes('Invalid email or password')) {
          addSecurityEvent('error', 'Invalid credentials provided');
        } else if (error?.includes('Account')) {
          addSecurityEvent('error', 'Account access denied');
        } else if (error?.includes('Rate limit') || error?.includes('Too many')) {
          addSecurityEvent('error', 'Rate limit exceeded');
          setRateLimitInfo({
            remaining: 0,
            reset: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
            blocked: true,
          });
        } else {
          addSecurityEvent('error', 'Unknown authentication error');
        }
      }
    } catch (error: any) {
      addSecurityEvent('error', 'Unexpected authentication error');
      // Error is automatically handled by the auth context
    }
  };

  const isRateLimited = rateLimitInfo?.blocked && rateLimitInfo.reset > new Date();
  const showSecurityWarning = attemptCount >= 3;

  return (
    <div className="space-y-6">
      {/* Security Status */}
      {securityEvents.length > 0 && (
        <div className="space-y-2">
          {securityEvents.slice(-2).map((event, index) => (
            <Alert key={index} variant={event.type === 'error' ? 'destructive' : 'default'}>
              <div className="flex items-center space-x-2">
                {event.type === 'success' && <CheckCircle className="h-4 w-4" />}
                {event.type === 'error' && <AlertTriangle className="h-4 w-4" />}
                {event.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                {event.type === 'info' && <Shield className="h-4 w-4" />}
                <AlertDescription>{event.message}</AlertDescription>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Rate Limit Warning */}
      {isRateLimited && (
        <Alert variant="destructive">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Too many failed attempts. Please try again after{' '}
            {rateLimitInfo?.reset.toLocaleTimeString()}.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Warning */}
      {showSecurityWarning && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Multiple failed attempts detected. Consider using password recovery or biometric authentication.
          </AlertDescription>
        </Alert>
      )}

      {/* OAuth Providers */}
      <OAuthProviders callbackUrl={callbackUrl} />

      {/* Biometric Authentication */}
      {biometricSupported && (
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or use biometric</span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleBiometricAuth}
            disabled={isLoading || isRateLimited}
          >
            <Fingerprint className="mr-2 h-4 w-4" />
            Use Biometric Authentication
          </Button>
        </div>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with password</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Sign In Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="relative">
          <FormInput
            id="email"
            label="Email address"
            type="email"
            autoComplete="email"
            required
            {...register('email')}
            error={errors.email?.message}
          />
          {/* Real-time validation indicator */}
          <div className="absolute right-3 top-8 flex items-center">
            {getEmailValidationStatus() === 'success' && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            {getEmailValidationStatus() === 'error' && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>

        <div className="relative">
          <FormInput
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            {...register('password')}
            error={errors.password?.message}
          />
          <button
            type="button"
            className="absolute right-10 top-8 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
          {/* Real-time validation indicator */}
          <div className="absolute right-3 top-8 flex items-center">
            {getPasswordValidationStatus() === 'success' && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            {getPasswordValidationStatus() === 'error' && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                {...register('rememberMe')}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="device-trust"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                {...register('deviceTrust')}
              />
              <label htmlFor="device-trust" className="ml-2 text-sm text-gray-900 flex items-center">
                <Smartphone className="h-3 w-3 mr-1" />
                Trust this device
              </label>
            </div>
          </div>

          <div className="text-sm">
            <Link
              href="/auth/reset-password"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !isValid || isRateLimited}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Sign in securely
            </>
          )}
        </Button>
      </form>

      {/* Security Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">Security Notice</p>
            <p className="text-blue-700 mt-1">
              Your connection is encrypted and secure. We use enterprise-grade security measures
              to protect your account.
            </p>
            {lastAttemptTime && (
              <p className="text-blue-600 mt-2">
                Last attempt: {lastAttemptTime.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}