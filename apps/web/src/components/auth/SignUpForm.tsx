'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { OAuthProviders } from './OAuthProviders';
import { FormInput } from './FormInput';
import { Button } from '@/components/ui/button';

const signUpSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
  privacyAccepted: z.boolean().refine((val) => val === true, 'You must accept the privacy policy'),
  marketingConsent: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

const passwordRequirements = [
  { label: 'At least 8 characters', test: (password: string) => password.length >= 8 },
  { label: 'Contains uppercase letter', test: (password: string) => /[A-Z]/.test(password) },
  { label: 'Contains lowercase letter', test: (password: string) => /[a-z]/.test(password) },
  { label: 'Contains number', test: (password: string) => /\d/.test(password) },
];

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const password = watch('password') || '';

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Register using credentials provider with registration flag
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        isRegistering: 'true',
        termsAccepted: data.termsAccepted.toString(),
        privacyAccepted: data.privacyAccepted.toString(),
        marketingConsent: data.marketingConsent?.toString() || 'false',
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        switch (result.error) {
          case 'CredentialsSignin':
            setError('Registration failed. Please check your information.');
            break;
          case 'AccessDenied':
            setError('Registration is currently disabled.');
            break;
          default:
            if (result.error.includes('already exists')) {
              setError('An account with this email already exists.');
            } else {
              setError('An error occurred during registration. Please try again.');
            }
        }
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* OAuth Providers */}
      <OAuthProviders callbackUrl={callbackUrl} />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or create an account</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Registration Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign Up Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            id="firstName"
            label="First name"
            type="text"
            autoComplete="given-name"
            required
            {...register('firstName')}
            error={errors.firstName?.message}
          />

          <FormInput
            id="lastName"
            label="Last name"
            type="text"
            autoComplete="family-name"
            required
            {...register('lastName')}
            error={errors.lastName?.message}
          />
        </div>

        <FormInput
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          required
          {...register('email')}
          error={errors.email?.message}
        />

        <div className="space-y-2">
          <div className="relative">
            <FormInput
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              {...register('password')}
              error={errors.password?.message}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>

          {/* Password Requirements */}
          {password && (
            <div className="space-y-1">
              {passwordRequirements.map((req) => (
                <div key={req.label} className="flex items-center text-sm">
                  {req.test(password) ? (
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <X className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <span className={req.test(password) ? 'text-green-600' : 'text-red-600'}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <FormInput
            id="confirmPassword"
            label="Confirm password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>

        {/* Terms and Privacy */}
        <div className="space-y-4">
          <div className="flex items-start">
            <input
              id="termsAccepted"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              {...register('termsAccepted')}
            />
            <label htmlFor="termsAccepted" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.termsAccepted && (
            <p className="text-sm text-red-600">{errors.termsAccepted.message}</p>
          )}

          <div className="flex items-start">
            <input
              id="privacyAccepted"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              {...register('privacyAccepted')}
            />
            <label htmlFor="privacyAccepted" className="ml-2 block text-sm text-gray-900">
              I consent to the processing of my personal data as described in the Privacy Policy
            </label>
          </div>
          {errors.privacyAccepted && (
            <p className="text-sm text-red-600">{errors.privacyAccepted.message}</p>
          )}

          <div className="flex items-start">
            <input
              id="marketingConsent"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              {...register('marketingConsent')}
            />
            <label htmlFor="marketingConsent" className="ml-2 block text-sm text-gray-900">
              I would like to receive marketing communications and product updates
            </label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>
    </div>
  );
}