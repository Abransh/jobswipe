'use client';

import { useAuth as useAuthContext } from '../../../../packages/shared/src/context/auth.context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth() {
  const authContext = useAuthContext();
  
  return {
    user: authContext.user,
    isAuthenticated: authContext.isAuthenticated,
    isLoading: authContext.isLoading,
    error: authContext.error,
    login: authContext.login,
    register: authContext.register,
    logout: authContext.logout,
    updateProfile: authContext.updateProfile,
    clearError: authContext.clearError,
  };
}

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}