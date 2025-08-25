/**
 * useJobs Hook
 * Custom React hook for managing job data fetching and state
 * Provides real-time job data from the backend API
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { jobsApiClient, type JobsApiResponse } from '@/lib/services/jobsApiClient';
import type { JobFilters } from '@/components/jobs/types/filters';
import type { JobData } from '@/components/jobs/types/job';

export interface UseJobsOptions {
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'salary' | 'distance';
  filters?: JobFilters;
  q?: string;
  userLocation?: { lat: number; lng: number };
  autoFetch?: boolean; // Whether to fetch automatically on mount
  refresh?: boolean; // Force refresh from server
}

export interface UseJobsReturn {
  // Data
  jobs: JobData[];
  totalCount: number;
  hasMore: boolean;
  page: number;
  limit: number;
  
  // State
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  
  // Actions
  fetchJobs: () => Promise<void>;
  fetchMore: () => Promise<void>;
  refetch: () => Promise<void>;
  clearError: () => void;
  
  // Computed
  hasJobs: boolean;
  isEmpty: boolean;
  totalPages: number;
  currentFilters: JobFilters;
}

/**
 * Custom hook for job data management
 */
export function useJobs(options: UseJobsOptions = {}): UseJobsReturn {
  const {
    page: initialPage = 1,
    limit = 20,
    sortBy = 'relevance',
    filters = {
      location: '',
      remote: 'any',
      jobType: [],
      jobLevel: [],
      salaryMin: 0,
      salaryMax: 300000,
      skills: []
    },
    q = '',
    userLocation,
    autoFetch = true,
    refresh = false
  } = options;

  // State
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized filter comparison to prevent unnecessary re-fetches
  const currentFilters = useMemo(() => filters, [
    filters.location,
    filters.remote,
    JSON.stringify(filters.jobType),
    JSON.stringify(filters.jobLevel),
    filters.salaryMin,
    filters.salaryMax,
    JSON.stringify(filters.skills)
  ]);

  // Clear error handler
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch jobs with pagination support
  const fetchJobs = useCallback(async (resetPage = false, isRefresh = false) => {
    if (loading && !isRefresh) return;
    
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const currentPage = resetPage ? 1 : page;
      
      const response: JobsApiResponse = await jobsApiClient.getJobs({
        page: currentPage,
        limit,
        sortBy,
        filters: currentFilters,
        q: q.trim(),
        userLocation,
        refresh: isRefresh || refresh
      });

      if (response.success && response.data) {
        const newJobs = response.data.jobs || [];
        
        if (resetPage) {
          setJobs(newJobs);
          setPage(1);
        } else {
          setJobs(prevJobs => [...prevJobs, ...newJobs]);
        }
        
        setTotalCount(response.data.totalCount || 0);
        setHasMore(response.data.hasMore || false);
        
        // Update page for next fetch
        if (!resetPage) {
          setPage(prev => prev + 1);
        }
      } else {
        setError(response.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading, page, limit, sortBy, currentFilters, q, userLocation, refresh]);

  // Fetch more jobs (pagination)
  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;
    await fetchJobs(false, false);
  }, [fetchJobs, loading, hasMore]);

  // Refetch from beginning (refresh)
  const refetch = useCallback(async () => {
    setPage(1);
    await fetchJobs(true, true);
  }, [fetchJobs]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      setPage(initialPage);
      fetchJobs(true, false);
    }
  }, [currentFilters, q, sortBy, userLocation, autoFetch, initialPage]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setJobs([]);
  }, [currentFilters, q, sortBy]);

  // Computed values
  const hasJobs = jobs.length > 0;
  const isEmpty = !loading && !refreshing && jobs.length === 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    // Data
    jobs,
    totalCount,
    hasMore,
    page,
    limit,
    
    // State
    loading,
    error,
    refreshing,
    
    // Actions
    fetchJobs: () => fetchJobs(true, false),
    fetchMore,
    refetch,
    clearError,
    
    // Computed
    hasJobs,
    isEmpty,
    totalPages,
    currentFilters
  };
}

/**
 * Hook for proximity-based job search
 */
export function useProximityJobs(location: string, options?: {
  jobType?: string[];
  level?: string[];
  remote?: 'any' | 'remote_only' | 'hybrid' | 'onsite';
  limit?: number;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProximityJobs = useCallback(async () => {
    if (!location.trim() || loading) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobsApiClient.getProximityJobs({
        location: location.trim(),
        ...options
      });
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch proximity jobs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [location, options, loading]);

  useEffect(() => {
    if (location.trim()) {
      fetchProximityJobs();
    }
  }, [location, JSON.stringify(options)]);

  return {
    data,
    loading,
    error,
    refetch: fetchProximityJobs,
    clearError: () => setError(null)
  };
}