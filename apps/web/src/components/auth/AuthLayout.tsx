'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header with Logo */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full px-4 sm:px-6 lg:px-8 py-6"
      >
        <Link href="/" className="inline-flex items-center space-x-3 group">
          {/* Premium Logo */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
            <span className="text-xl sm:text-2xl font-bold text-white dark:text-gray-900">J</span>
          </div>
          <span className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            JobSwipe
          </span>
        </Link>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-title-1 font-semibold text-gray-900 dark:text-white mb-3"
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-callout sm:text-headline text-gray-600 dark:text-gray-400"
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-premium border border-gray-200 dark:border-gray-800 p-6 sm:p-8"
          >
            {children}
          </motion.div>

          {/* Auth Toggle */}
          {showAuthToggle && authToggleText && authToggleLink && authToggleLinkText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-center"
            >
              <span className="text-subhead sm:text-callout text-gray-600 dark:text-gray-400">
                {authToggleText}{' '}
                <Link
                  href={authToggleLink}
                  className="font-semibold text-primary hover:text-primary/90 transition-colors"
                >
                  {authToggleLinkText}
                </Link>
              </span>
            </motion.div>
          )}

          {/* Footer Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 sm:mt-10"
          >
            <div className="flex items-center justify-center gap-6 text-caption text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
                </svg>
                <span>Secure</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                <span>Trusted</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Private</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full px-4 sm:px-6 lg:px-8 py-6 text-center"
      >
        <p className="text-caption text-gray-500 dark:text-gray-400">
          © 2025 JobSwipe. All rights reserved.
        </p>
      </motion.footer>
    </div>
  );
}