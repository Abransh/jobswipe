'use client';

import { ReactNode } from 'react';
import { AuthContextProvider } from '@jobswipe/shared/browser';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <AuthContextProvider
      config={{
        apiBaseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        enableAutoRefresh: true,
        refreshThresholdMinutes: 5,
      }}
    >
      {children}
    </AuthContextProvider>
  );
}