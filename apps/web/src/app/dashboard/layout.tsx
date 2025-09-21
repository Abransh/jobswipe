'use client';

import { ReactNode } from 'react';
import { DashboardNavigation } from '@/components/dashboard/DashboardNavigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useRequireOnboarding } from '@/hooks/useOnboardingCheck';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Temporarily bypass onboarding check to fix infinite loading issue
  // TODO: Fix auth service initialization and re-enable onboarding check
  // const { isLoading, needsOnboarding, isReady } = useRequireOnboarding();

  // Show dashboard directly
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