'use client';

import { ReactNode } from 'react';
import { AuthProvider as AuthContextProvider } from '../../../../../packages/shared/src/context/auth.context';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <AuthContextProvider
      config={{
        apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
        enableAutoRefresh: true,
        refreshThresholdMinutes: 5,
      }}
    >
      {children}
    </AuthContextProvider>
  );
}