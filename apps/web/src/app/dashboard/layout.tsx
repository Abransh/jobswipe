'use client';

import { ReactNode } from 'react';
import { DashboardNavigation } from '@/components/dashboard/DashboardNavigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useRequireOnboarding } from '@/hooks/useOnboardingCheck';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isLoading, needsOnboarding, isReady } = useRequireOnboarding();

  // Show loading state while checking onboarding status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user needs onboarding, the hook will redirect them
  // But we'll show a message just in case
  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to onboarding...</p>
        </div>
      </div>
    );
  }

  // User has completed onboarding, show dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavigation />
      <div className="lg:pl-72">
        <DashboardHeader />
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}