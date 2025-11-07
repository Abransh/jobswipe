import Link from 'next/link';
import { ReactNode } from 'react';
import { Sparkles, Shield, Zap, TrendingUp } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showAuthToggle?: boolean;
  authToggleText?: string;
  authToggleLink?: string;
  authToggleLinkText?: string;
  splitLayout?: boolean; // Enable split layout design
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showAuthToggle = false,
  authToggleText,
  authToggleLink,
  authToggleLinkText,
  splitLayout = true, // Default to true for new design
}: AuthLayoutProps) {
  // Old centered layout (fallback)
  if (!splitLayout) {
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

  // New split layout design
  return (
    <div className="min-h-screen flex">
      {/* Left Side - OAuth & Branding (40%) */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
          <div className="absolute top-0 -right-4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold">J</span>
            </div>
            <span className="text-2xl font-bold">JobSwipe</span>
          </Link>

          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">
                Your Dream Job<br />Awaits
              </h1>
              <p className="text-xl text-white/90">
                Join thousands of professionals who automated their job search
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {[
                { icon: Sparkles, text: 'AI-powered job matching' },
                { icon: Zap, text: 'One-click applications' },
                { icon: Shield, text: 'Enterprise-grade security' },
                { icon: TrendingUp, text: 'Track your success' }
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-lg flex items-center justify-center">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <span className="text-lg">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-white/70 text-sm">
            © 2025 JobSwipe. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Form (60%) */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">J</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">JobSwipe</span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-600">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {children}
          </div>

          {/* Auth Toggle */}
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
      </div>
    </div>
  );
}