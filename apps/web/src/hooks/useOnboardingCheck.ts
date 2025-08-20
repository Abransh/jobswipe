'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './useAuth';

/**
 * Hook to check if user needs to complete onboarding and redirect accordingly
 */
export function useOnboardingCheck() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Don't run checks if still loading or not authenticated
    if (isLoading || !isAuthenticated || !user) {
      return;
    }

    // Don't redirect if already on onboarding pages or auth pages
    if (pathname.startsWith('/onboarding') || pathname.startsWith('/auth/')) {
      return;
    }

    // Check if user has completed onboarding
    // This assumes the user object has onboarding completion status
    // If not available in user object, we'd need to make an API call
    const needsOnboarding = checkIfUserNeedsOnboarding(user);

    if (needsOnboarding) {
      console.log('User needs to complete onboarding, redirecting...');
      router.push('/onboarding');
    }
  }, [user, isAuthenticated, isLoading, pathname, router]);

  return {
    isLoading,
    needsOnboarding: user ? checkIfUserNeedsOnboarding(user) : false,
  };
}

/**
 * Determine if user needs to complete onboarding
 */
function checkIfUserNeedsOnboarding(user: any): boolean {
  // Check if user has completed onboarding
  if (user.onboardingCompleted === true) {
    return false;
  }

  // Check if user has essential profile data
  if (user.profile) {
    const hasPhone = Boolean(user.profile.phone);
    const hasRole = Boolean(user.profile.currentTitle);
    
    // If user has essential data, consider onboarding complete
    if (hasPhone && hasRole) {
      return false;
    }
  }

  // User needs onboarding
  return true;
}

/**
 * Hook for pages that should redirect incomplete users to onboarding
 * Use this in layout components or individual pages
 */
export function useRequireOnboarding() {
  const { isLoading, needsOnboarding } = useOnboardingCheck();
  
  return {
    isLoading,
    needsOnboarding,
    isReady: !isLoading && !needsOnboarding,
  };
}