import Link from 'next/link';
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showAuthToggle?: boolean;
  authToggleText?: string;
  authToggleLink?: string;
  authToggleLinkText?: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showAuthToggle = false,
  authToggleText,
  authToggleLink,
  authToggleLinkText,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">J</span>
            </div>
            <span className="text-xl font-bold text-gray-900">JobSwipe</span>
          </Link>
        </div>
        
        <div className="mt-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          {children}
        </div>
      </div>

      {showAuthToggle && authToggleText && authToggleLink && authToggleLinkText && (
        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600">
            {authToggleText}{' '}
            <Link 
              href={authToggleLink}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {authToggleLinkText}
            </Link>
          </span>
        </div>
      )}
    </div>
  );
}