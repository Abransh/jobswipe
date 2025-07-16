import { Metadata } from 'next';
import { Suspense } from 'react';
import { SignInForm } from '@/components/auth/SignInForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your JobSwipe account',
};

export default function SignInPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your JobSwipe account to continue your job search journey"
      showAuthToggle={true}
      authToggleText="Don't have an account?"
      authToggleLink="/auth/signup"
      authToggleLinkText="Sign up"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <SignInForm />
      </Suspense>
    </AuthLayout>
  );
}