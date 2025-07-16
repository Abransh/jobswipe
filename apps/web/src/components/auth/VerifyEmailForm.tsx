'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Mail, CheckCircle, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function VerifyEmailForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationState, setVerificationState] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0 && !canResend) {
      setCanResend(true);
    }
  }, [resendTimer, canResend]);

  const verifyEmail = async (verificationToken: string) => {
    setVerificationState('verifying');
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: verificationToken,
        }),
      });

      if (response.ok) {
        setVerificationState('success');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Email verification failed');
        setVerificationState('error');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      setVerificationState('error');
    }
  };

  const resendVerificationEmail = async () => {
    if (!email) {
      setError('Email address is required to resend verification');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'web',
        }),
      });

      if (response.ok) {
        setCanResend(false);
        setResendTimer(60); // 60 seconds cooldown
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to resend verification email');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (verificationState === 'verifying') {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Verifying your email</h3>
        <p className="text-sm text-gray-600">
          Please wait while we verify your email address...
        </p>
      </div>
    );
  }

  if (verificationState === 'success') {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Email verified successfully!</h3>
        <p className="text-sm text-gray-600">
          Your email has been verified. You can now sign in to your account.
        </p>
        <Button
          onClick={() => window.location.href = '/auth/signin'}
          className="w-full"
        >
          Continue to sign in
        </Button>
      </div>
    );
  }

  if (verificationState === 'error') {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <XCircle className="h-16 w-16 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Email verification failed</h3>
        <p className="text-sm text-gray-600">
          {error || 'The verification link may have expired or is invalid.'}
        </p>
        {email && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              We can send you a new verification link to {email}
            </p>
            <Button
              onClick={resendVerificationEmail}
              disabled={!canResend || isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : canResend ? (
                'Resend verification email'
              ) : (
                `Resend in ${resendTimer}s`
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Default state - no token provided
  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <Mail className="h-16 w-16 text-blue-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
      <p className="text-sm text-gray-600">
        We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
      </p>
      <p className="text-xs text-gray-500">
        Didn't receive the email? Check your spam folder or try again in a few minutes.
      </p>
      
      {email && (
        <Button
          onClick={resendVerificationEmail}
          disabled={!canResend || isLoading}
          variant="outline"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : canResend ? (
            'Resend verification email'
          ) : (
            `Resend in ${resendTimer}s`
          )}
        </Button>
      )}
    </div>
  );
}