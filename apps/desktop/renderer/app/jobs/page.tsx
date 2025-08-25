// 'use client';

// /**
//  * Jobs Page for JobSwipe Desktop
//  * Integrated job swiping interface with Next.js
//  */

// import React, { useState, useEffect } from 'react';
// import { JobSwipeInterface } from '@/components/jobs/JobDiscovery/JobSwipeInterface';
// import type { JobData } from '@/types/job';

// export default function JobsPage() {
//   const [jobs, setJobs] = useState<JobData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

  // Mock data removed - using real API data only

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
//           <p className="text-muted-foreground">Loading jobs...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="text-center max-w-md mx-auto p-8">
//           <div className="w-24 h-24 mx-auto bg-destructive/10 rounded-full flex items-center justify-center mb-6">
//             <svg className="w-12 h-12 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//           </div>
//           <h3 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h3>
//           <p className="text-muted-foreground mb-6">{error}</p>
//           <button
//             onClick={loadJobs}
//             className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
//           >
//             Try again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Header */}
//       <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <h1 className="text-2xl font-bold gradient-text">JobSwipe</h1>
//               <div className="flex items-center space-x-2">
//                 <span className="text-sm text-muted-foreground">
//                   {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} available
//                 </span>
//                 <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
//               </div>
//             </div>
            
//             <div className="flex items-center space-x-2">
//               <button
//                 onClick={loadJobs}
//                 className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
//                 title="Refresh jobs"
//               >
//                 <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Job Swipe Interface */}
//       <main className="flex-1">
//         <JobSwipeInterface 
//           jobs={jobs}
//           onApplicationUpdate={(stats) => {
//             console.log('Application stats updated:', stats);
//             // Could show notification or update UI
//           }}
//         />
//       </main>
//     </div>
//   );
// }
'use client';

/**
 * Main Jobs Discovery Page
 * Multi-view interface with Swipe, List, and Grid modes
 * Location-based filtering and search capabilities
 */

import React, { useState, useCallback, Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
// Import icons will be replaced with inline SVGs to avoid type conflicts
import { useJobs } from '@/hooks/useJobs';

// Job Components
import { JobSwipeInterface } from '@/components/jobs/JobDiscovery/JobSwipeInterface';
import { JobListInterface } from '@/components/jobs/JobDiscovery/JobListInterface';
import { JobGridInterface } from '@/components/jobs/JobDiscovery/JobGridInterface';
import { JobFilters } from '@/components/jobs/JobDiscovery/JobFilters';
import { ProximityLocationFilter } from '@/components/jobs/JobDiscovery/ProximityLocationFilter';

// Types
import type { JobData } from '@/components/jobs/types/job';
import type { JobFilters as JobFiltersType } from '@/components/jobs/types/filters';

// Job data will be fetched from API

type ViewMode = 'swipe' | 'list' | 'grid';

function JobsPageContent() {
  const searchParams = useSearchParams();
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
  
  // Enhanced application tracking state
  const [applicationStats, setApplicationStats] = useState({
    totalApplications: 0,
    todayApplications: 0,
    successRate: 0
  });
  
  // Use real job data from API
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

  // Mobile touch/swipe support
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [pullToRefresh, setPullToRefresh] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Proximity-based location filtering
  const [expandedResults, setExpandedResults] = useState<any>(null);
  const [showProximityExpansion, setShowProximityExpansion] = useState(false);


  const handleViewChange = useCallback((newView: ViewMode) => {
    setViewMode(newView);
    // Update URL without page refresh
    const url = new URL(window.location.href);
    url.searchParams.set('view', newView);
    window.history.replaceState({}, '', url.toString());
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    // Update URL
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
    // Update URL with filter params
    const url = new URL(window.location.href);
    
    if (newFilters.location) {
      url.searchParams.set('location', newFilters.location);
    } else {
      url.searchParams.delete('location');
    }
    
    if (newFilters.remote !== 'any') {
      url.searchParams.set('remote', newFilters.remote);
    } else {
      url.searchParams.delete('remote');
    }
    
    window.history.replaceState({}, '', url.toString());
  }, []);

  // Mobile touch/swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartY.current) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    
    // Pull to refresh when at top of page and pulling down
    if (window.scrollY === 0 && deltaY > 50 && !loading) {
      setPullToRefresh(true);
    }
  }, [loading]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    // Only process horizontal swipes (not vertical scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      const viewModes: ViewMode[] = ['swipe', 'list', 'grid'];
      const currentIndex = viewModes.indexOf(viewMode);
      
      if (deltaX > 0 && currentIndex > 0) {
        // Swipe right - previous view mode
        handleViewChange(viewModes[currentIndex - 1]);
      } else if (deltaX < 0 && currentIndex < viewModes.length - 1) {
        // Swipe left - next view mode
        handleViewChange(viewModes[currentIndex + 1]);
      }
    }

    // Handle pull to refresh
    if (pullToRefresh && Math.abs(deltaY) > Math.abs(deltaX)) {
      refetch();
      setPullToRefresh(false);
    }

    // Reset touch tracking
    touchStartX.current = null;
    touchStartY.current = null;
    setPullToRefresh(false);
  }, [viewMode, handleViewChange, pullToRefresh, refetch]);

  // Proximity-based location handlers
  const handleProximityLocationChange = useCallback((location: string) => {
    setFilters(prev => ({ ...prev, location }));
    setExpandedResults(null);
    setShowProximityExpansion(false);
  }, []);

  const handleExpandSearch = useCallback((expandedData: any) => {
    setExpandedResults(expandedData);
    setShowProximityExpansion(true);
  }, []);

  return (
    <div 
      className="min-h-screen bg-gray-50"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      {pullToRefresh && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white text-center py-2 text-sm">
          Release to refresh jobs...
        </div>
      )}

      {/* Enhanced Header with Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        {/* Breadcrumb Navigation */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex py-2" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <div>
                    <a href="/" className="text-gray-400 hover:text-gray-500 text-sm">
                      Home
                    </a>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-4 text-sm font-medium text-gray-900">Job Discovery</span>
                  </div>
                </li>
                {(searchQuery || filters.location) && (
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-sm text-gray-500 truncate max-w-32">
                        {searchQuery || filters.location}
                      </span>
                    </div>
                  </li>
                )}
              </ol>
            </nav>
          </div>
        </div>
        
        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">JobSwipe</h1>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">
                  {loading ? 'Loading...' : `${totalCount} ${totalCount === 1 ? 'job' : 'jobs'}`}
                </span>
                {applicationStats.totalApplications > 0 && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 rounded-full">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs font-medium text-blue-700">
                      {applicationStats.totalApplications} applied
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search jobs, companies, skills..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-2">
              {/* Applications Dashboard Link (Mobile Hidden) */}
              {applicationStats.totalApplications > 0 && (
                <a
                  href="/dashboard/applications"
                  className="hidden sm:flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <span>View Applications</span>
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                    {applicationStats.totalApplications}
                  </span>
                </a>
              )}
              
              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Filters"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
                </svg>
              </button>

              {/* View Mode Selector with Mobile Swipe Indicator */}
              <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
                {/* Desktop View Mode Buttons */}
                <button
                  onClick={() => handleViewChange('swipe')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'swipe' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  title="Swipe View"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                  </svg>
                </button>
                <button
                  onClick={() => handleViewChange('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  title="List View"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => handleViewChange('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  title="Grid View"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </button>
              </div>

              {/* Mobile View Mode Indicator with Swipe Hint */}
              <div className="sm:hidden flex flex-col items-center">
                <div className="flex items-center space-x-1 bg-gray-100 rounded-full px-3 py-1">
                  <span className="text-xs font-medium text-gray-600 capitalize">{viewMode}</span>
                  <div className="flex space-x-1">
                    {['swipe', 'list', 'grid'].map((mode) => (
                      <div
                        key={mode}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          viewMode === mode ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {/* Swipe Hint */}
                <div className="flex items-center mt-1 text-xs text-gray-400">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  <span>Swipe to change view</span>
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="space-y-4">
              {/* Enhanced Proximity Location Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Location & Proximity</h3>
                <ProximityLocationFilter
                  currentLocation={filters.location}
                  filters={filters}
                  onLocationChange={handleProximityLocationChange}
                  onExpandSearch={handleExpandSearch}
                  jobCount={jobs.length}
                />
              </div>

              {/* Other Filters */}
              <JobFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                jobCount={jobs.length}
              />
            </div>
          </div>
        </div>
      )}

      {/* Expanded Search Results */}
      {showProximityExpansion && expandedResults && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Expanded Search Results</h3>
                <p className="text-sm text-blue-700">
                  {expandedResults.suggestion || 'Found additional jobs in nearby cities'}
                </p>
              </div>
              <button
                onClick={() => setShowProximityExpansion(false)}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nearby Cities Results */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {expandedResults.expandedResults?.map((cityResult: any) => (
                <div key={cityResult.city} className="bg-white rounded-lg border border-blue-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{cityResult.city}</h4>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      {cityResult.distance}km away
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {cityResult.jobs.length} jobs • {cityResult.totalCount} total available
                  </p>
                  
                  {/* Sample Jobs */}
                  <div className="space-y-2 mb-3">
                    {cityResult.jobs.slice(0, 2).map((job: any, jobIndex: number) => (
                      <div key={jobIndex} className="text-sm">
                        <p className="font-medium text-gray-800 truncate">{job.title}</p>
                        <p className="text-gray-600 text-xs">{job.company.name}</p>
                      </div>
                    ))}
                    {cityResult.jobs.length > 2 && (
                      <p className="text-xs text-blue-600">+{cityResult.jobs.length - 2} more jobs</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleProximityLocationChange(cityResult.city)}
                    className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    View Jobs in {cityResult.city}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main 
        ref={mainContentRef}
        className="flex-1 relative"
      >
        {loading ? (
          /* Loading State */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Finding the best jobs for you...</p>
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => {
                  clearError();
                  refetch();
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        ) : jobs.length > 0 ? (
          <>
            {/* Enhanced Job Discovery Views */}
            {viewMode === 'swipe' && (
              <JobSwipeInterface 
                jobs={jobs}
                searchQuery={searchQuery}
                filters={filters}
                onApplicationUpdate={(stats) => setApplicationStats(stats)}
                fetchMoreJobs={async (offset: number, limit: number) => {
                  console.log('Fetching more jobs from parent, offset:', offset, 'limit:', limit);
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
          </>
        ) : (
          /* Enhanced Empty State */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found in your area</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || Object.values(filters || {}).some(v => v && v !== 'any' && (!Array.isArray(v) || v.length > 0))
                  ? 'Try expanding your search criteria or explore jobs in nearby cities like Turin or Brescia.'
                  : 'New opportunities are added daily. Check back soon or set up job alerts!'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
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
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Clear all filters
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, remote: 'remote_only' }))}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Show remote jobs
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile FAB for Filters and Applications */}
      <div className="fixed bottom-6 right-6 sm:hidden">
        <div className="flex flex-col space-y-3">
          {/* Applications Button */}
          {applicationStats.totalApplications > 0 && (
            <a
              href="/dashboard/applications"
              className="relative p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-blue-600 bg-white rounded-full border border-blue-600">
                {applicationStats.totalApplications}
              </span>
            </a>
          )}
          
          {/* Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-4 rounded-full shadow-lg transition-colors ${
              showFilters 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 border border-gray-300'
            }`}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    }>
      <JobsPageContent />
    </Suspense>
  );
}