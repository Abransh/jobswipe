'use client';

import { useSearchParams } from 'next/navigation';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const errorMessages: Record<string, { title: string; description: string; action?: string }> = {
  Configuration: {
    title: 'Configuration Error',
    description: 'There is a problem with the server configuration.',
    action: 'Please try again later or contact support.',
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You do not have permission to sign in.',
    action: 'Please check your account status or contact support.',
  },
  Verification: {
    title: 'Email Verification Required',
    description: 'Please verify your email address before signing in.',
    action: 'Check your email for a verification link.',
  },
  Default: {
    title: 'Authentication Error',
    description: 'An error occurred during authentication.',
    action: 'Please try again or contact support if the problem persists.',
  },
  OAuthSignin: {
    title: 'OAuth Sign In Error',
    description: 'There was an error signing in with your chosen provider.',
    action: 'Please try again or use a different sign-in method.',
  },
  OAuthCallback: {
    title: 'OAuth Callback Error',
    description: 'There was an error processing the OAuth callback.',
    action: 'Please try signing in again.',
  },
  OAuthCreateAccount: {
    title: 'OAuth Account Creation Error',
    description: 'Could not create an account with the OAuth provider.',
    action: 'Please try again or use email/password registration.',
  },
  EmailCreateAccount: {
    title: 'Email Registration Error',
    description: 'Could not create an account with the provided email.',
    action: 'Please check your email and try again.',
  },
  Callback: {
    title: 'Callback Error',
    description: 'There was an error processing the authentication callback.',
    action: 'Please try signing in again.',
  },
  OAuthAccountNotLinked: {
    title: 'Account Not Linked',
    description: 'The email address is already associated with another account.',
    action: 'Please sign in with your original method or link your accounts.',
  },
  EmailSignin: {
    title: 'Email Sign In Error',
    description: 'There was an error sending the sign-in email.',
    action: 'Please check your email address and try again.',
  },
  CredentialsSignin: {
    title: 'Invalid Credentials',
    description: 'The email or password you entered is incorrect.',
    action: 'Please check your credentials and try again.',
  },
  SessionRequired: {
    title: 'Session Required',
    description: 'You must be signed in to access this page.',
    action: 'Please sign in to continue.',
  },
};

export function AuthErrorHandler() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  const errorInfo = errorMessages[error || ''] || errorMessages.Default;

  const handleRetry = () => {
    window.location.href = '/auth/signin';
  };

  const handleContactSupport = () => {
    window.location.href = '/support';
  };

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <AlertCircle className="h-16 w-16 text-red-500" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900">
          {errorInfo.title}
        </h3>
        <p className="text-sm text-gray-600">
          {errorInfo.description}
        </p>
        {errorInfo.action && (
          <p className="text-sm text-gray-500">
            {errorInfo.action}
          </p>
        )}
      </div>

      {error && (
        <div className="bg-gray-50 rounded-md p-4">
          <div className="text-left">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Error Details
            </h4>
            <p className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
              {error}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={handleRetry}
          className="flex items-center"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        
        <Button
          onClick={handleContactSupport}
          variant="outline"
        >
          Contact Support
        </Button>
      </div>

      <div className="text-xs text-gray-500">
        <p>
          If you continue to experience issues, please contact our support team with the error code above.
        </p>
      </div>
    </div>
  );
}