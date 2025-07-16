import { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthErrorHandler } from '@/components/auth/AuthErrorHandler';
import { AuthLayout } from '@/components/auth/AuthLayout';

export const metadata: Metadata = {
  title: 'Authentication Error',
  description: 'An error occurred during authentication',
};

export default function AuthErrorPage() {
  return (
    <AuthLayout
      title="Authentication Error"
      subtitle="We encountered an issue while trying to authenticate you"
      showAuthToggle={true}
      authToggleText="Try again?"
      authToggleLink="/auth/signin"
      authToggleLinkText="Sign in"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <AuthErrorHandler />
      </Suspense>
    </AuthLayout>
  );
}