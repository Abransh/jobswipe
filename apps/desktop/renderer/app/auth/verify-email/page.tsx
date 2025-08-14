import { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyEmailForm } from '@/../../components/auth/VerifyEmailForm';
import { AuthLayout } from '@/../../components/auth/AuthLayout';

export const metadata: Metadata = {
  title: 'Verify Email - JobSwipe Desktop',
  description: 'Verify your email address',
};

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      title="Verify your email"
      subtitle="We've sent a verification link to your email address. Please check your inbox and click the link to verify your account."
      showAuthToggle={true}
      authToggleText="Need help?"
      authToggleLink="/auth/signin"
      authToggleLinkText="Back to sign in"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyEmailForm />
      </Suspense>
    </AuthLayout>
  );
}