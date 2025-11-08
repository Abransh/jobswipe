'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@jobswipe/shared/browser';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { OAuthProviders } from '../OAuthProviders';
import { FormInput } from '../FormInput';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

type SignInFormData = z.infer<typeof signInSchema>;

export function EnhancedSignInForm() {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/jobs';

  const { login, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      clearError();
      console.log('🔐 Attempting login...');

      const result = await login(data.email, data.password);

      console.log('📊 Login result:', { success: result.success, hasUser: !!result.user });

      if (result.success) {
        console.log('✅ Login successful, redirecting to:', callbackUrl);

        // Show success toast
        toast.success('Welcome back!', {
          description: 'You have successfully signed in.',
          duration: 3000,
        });

      if (response.success && response.user) {
        addSecurityEvent('success', 'Authentication successful');

        // Store device trust if selected
        if (data.deviceTrust) {
          localStorage.setItem('deviceTrusted', 'true');
          localStorage.setItem('deviceTrustDate', new Date().toISOString());
        }

        // CRITICAL FIX: Use window.location.href for full page reload
        // This ensures HTTP-only cookies are properly available to middleware
        // router.push() doesn't reload the page, so middleware might not see new cookies
        if (typeof window !== 'undefined') {
          window.location.href = callbackUrl;
        } else {
          // Fallback for SSR (shouldn't happen in client component)
          router.push(callbackUrl);
        }
      } else {
        console.error('❌ Login failed:', result);
        toast.error('Login failed', {
          description: 'Please check your credentials and try again.',
        });
      }
    } catch (err) {
      console.error('❌ Sign in error:', err);
      // Error will be displayed by the error state from useAuth
      toast.error('Login failed', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* OAuth Providers */}
      <div>
        <OAuthProviders callbackUrl={callbackUrl} />
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-800" />
        </div>
        <div className="relative flex justify-center text-footnote">
          <span className="px-3 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-error-light dark:bg-error/20 border border-error/20"
        >
          <p className="text-footnote text-error flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
            </svg>
            {error}
          </p>
        </motion.div>
      )}

      {/* Sign In Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <FormInput
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email')}
          required
        />

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-subhead font-medium text-gray-900 dark:text-white">
            Password<span className="text-error ml-1">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="appearance-none block w-full h-11 border rounded-lg transition-all duration-quick text-subhead text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pl-10 pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-footnote text-error flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
              </svg>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              {...register('rememberMe')}
            />
            <span className="ml-2 text-subhead text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              Remember me
            </span>
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-subhead font-medium text-primary hover:text-primary/90 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className="w-full h-11 px-4 rounded-lg bg-primary text-white font-semibold shadow-card hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-subhead"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
