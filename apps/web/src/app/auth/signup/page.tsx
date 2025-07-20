import { Metadata } from 'next';
import { Suspense } from 'react';
import { EnhancedSignUpForm } from '@/components/auth/enhanced/EnhancedSignUpForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your JobSwipe account',
};

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join thousands of job seekers who've automated their application process"
      showAuthToggle={true}
      authToggleText="Already have an account?"
      authToggleLink="/auth/signin"
      authToggleLinkText="Sign in"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <EnhancedSignUpForm />
      </Suspense>
    </AuthLayout>
  );
}