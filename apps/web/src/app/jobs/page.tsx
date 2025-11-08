'use client';

/**
 * Premium Jobs Discovery Page
 * Apple-Level Minimal Aesthetic
 *
 * Design Principles:
 * - 90% neutral, 10% primary
 * - Minimal UI, maximum content
 * - Professional & mature
 * - Clean typography
 */

import React, { useState, useCallback, Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useJobs } from '@/hooks/useJobs';
import { useAuth } from '@/hooks/useAuth';

// Job Components
import { JobSwipeInterface } from '@/components/jobs/JobDiscovery/JobSwipeInterface';
import { JobListInterface } from '@/components/jobs/JobDiscovery/JobListInterface';
import { JobGridInterface } from '@/components/jobs/JobDiscovery/JobGridInterface';
import { JobFilters } from '@/components/jobs/JobDiscovery/JobFilters';
import { ProximityLocationFilter } from '@/components/jobs/JobDiscovery/ProximityLocationFilter';

// Types
import type { JobData } from '@/components/jobs/types/job';
import type { JobFilters as JobFiltersType } from '@/components/jobs/types/filters';

type ViewMode = 'swipe' | 'list' | 'grid';

function JobsPageContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [viewMode, setViewMode] = useState<ViewMode>((searchParams.get('view') as ViewMode) || 'swipe');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<JobFiltersType>({
    location: searchParams.get('location') || '',
    remote: (searchParams.get('remote') as any) || 'any',
    jobType: [],
    jobLevel: [],
    salaryMin: 0,
    salaryMax: 300000,
    skills: []
  });

  const [applicationStats, setApplicationStats] = useState({
    totalApplications: 0,
    todayApplications: 0,
    successRate: 0
  });

  const {
    jobs,
    loading,
    error,
    totalCount,
    hasMore,
    fetchMore,
    refetch,
    clearError
  } = useJobs({
    filters,
    q: searchQuery,
    sortBy: 'relevance',
    limit: 50,
    autoFetch: true
  });

  const handleViewChange = useCallback((newView: ViewMode) => {
    setViewMode(newView);
    const url = new URL(window.location.href);
    url.searchParams.set('view', newView);
    window.history.replaceState({}, '', url.toString());
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set('q', query);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url.toString());
  }, []);

  const handleFiltersChange = useCallback((newFilters: JobFiltersType) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Premium Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Title & Count */}
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-title-3 sm:text-title-2 font-semibold text-gray-900 dark:text-white">
                  Jobs
                </h1>
                <p className="text-caption text-gray-500 dark:text-gray-400">
                  {loading ? 'Loading...' : `${totalCount.toLocaleString()} opportunities`}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search */}
              <div className="relative hidden sm:block">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-48 lg:w-64 h-9 pl-9 pr-3 text-subhead bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Filters Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`h-9 px-3 rounded-lg text-subhead font-medium transition-colors ${
                  showFilters
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
                  </svg>
                  <span className="hidden sm:inline">Filters</span>
                </span>
              </motion.button>

              {/* View Mode Toggle */}
              <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
                {[
                  { mode: 'swipe', icon: 'M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11', title: 'Swipe' },
                  { mode: 'list', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', title: 'List' },
                  { mode: 'grid', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z', title: 'Grid' }
                ].map(({ mode, icon, title }) => (
                  <motion.button
                    key={mode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleViewChange(mode as ViewMode)}
                    className={`h-8 w-8 rounded-md flex items-center justify-center transition-all ${
                      viewMode === mode
                        ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-minimal'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    title={title}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                    </svg>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <JobFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                jobCount={jobs.length}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          /* Premium Loading State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <div className="text-center">
              <div className="relative w-12 h-12 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-800"></div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent"
                ></motion.div>
              </div>
              <p className="text-subhead text-gray-600 dark:text-gray-400">Finding opportunities...</p>
            </div>
          </motion.div>
        ) : error ? (
          /* Premium Error State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center py-20"
          >
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-light dark:bg-error/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-title-3 font-semibold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h3>
              <p className="text-body text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  clearError();
                  refetch();
                }}
                className="h-11 px-6 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-subhead shadow-card hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Try again
              </motion.button>
            </div>
          </motion.div>
        ) : jobs.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Job Discovery Views */}
            {viewMode === 'swipe' && (
              <JobSwipeInterface
                jobs={jobs}
                searchQuery={searchQuery}
                filters={filters}
                onApplicationUpdate={(stats) => setApplicationStats(stats)}
                fetchMoreJobs={async (offset: number, limit: number) => {
                  if (hasMore && !loading) {
                    await fetchMore();
                    return jobs.slice(offset, offset + limit);
                  }
                  return [];
                }}
              />
            )}

            {viewMode === 'list' && (
              <JobListInterface
                jobs={jobs}
                searchQuery={searchQuery}
                filters={filters}
                onApplicationUpdate={(stats) => setApplicationStats(stats)}
              />
            )}

            {viewMode === 'grid' && (
              <JobGridInterface
                jobs={jobs}
                searchQuery={searchQuery}
                filters={filters}
                onApplicationUpdate={(stats) => setApplicationStats(stats)}
              />
            )}
          </motion.div>
        ) : (
          /* Premium Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center py-20"
          >
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                </svg>
              </div>
              <h3 className="text-title-3 font-semibold text-gray-900 dark:text-white mb-2">
                No jobs found
              </h3>
              <p className="text-body text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery || Object.values(filters || {}).some(v => v && v !== 'any' && (!Array.isArray(v) || v.length > 0))
                  ? 'Try adjusting your filters or search criteria'
                  : 'New opportunities are added daily. Check back soon!'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setFilters({
                      location: '',
                      remote: 'any',
                      jobType: [],
                      jobLevel: [],
                      salaryMin: 0,
                      salaryMax: 300000,
                      skills: []
                    });
                    setSearchQuery('');
                  }}
                  className="h-11 px-6 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-subhead shadow-card hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  Clear filters
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilters(prev => ({ ...prev, remote: 'remote_only' }))}
                  className="h-11 px-6 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-medium text-subhead hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Show remote jobs
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Mobile Search (Bottom Sheet) */}
      <div className="sm:hidden">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 safe-area-bottom"
        >
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-11 pl-10 pr-3 text-subhead bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-800"></div>
          <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    }>
      <JobsPageContent />
    </Suspense>
  );
}
