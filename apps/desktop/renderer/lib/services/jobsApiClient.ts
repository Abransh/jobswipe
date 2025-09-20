/**
 * Jobs API Client
 * Frontend service for fetching jobs from our API
 */

import type { JobFilters } from '@/components/jobs/types/filters';

export interface JobsApiResponse {
  success: boolean;
  data?: {
    jobs: any[];
    totalCount: number;
    hasMore: boolean;
    page: number;
    limit: number;
    filters: JobFilters;
    refreshed?: boolean;
  };
  error?: string;
}

export interface ProximityApiResponse {
  success: boolean;
  data?: {
    location: string;
    primaryJobs: any[];
    proximityInfo: { city: string; distance: number; jobCount: number }[];
    suggestions: {
      expandSearch: boolean;
      nextCities: { city: string; distance: number; jobCount: number }[];
      totalNearbyJobs: number;
    };
    nearbyJobs: any[];
    meta: {
      primaryCount: number;
      nearbyCount: number;
      totalAvailable: number;
    };
  };
  error?: string;
}

export class JobsApiClient {
  private baseUrl = 'http://localhost:3001/api/v1/jobs';

  /**
   * Fetch jobs with filtering and pagination
   */
  async getJobs(params: {
    page?: number;
    limit?: number;
    sortBy?: 'relevance' | 'date' | 'salary' | 'distance';
    filters?: JobFilters;
    q?: string;
    userLocation?: { lat: number; lng: number };
    refresh?: boolean;
  }): Promise<JobsApiResponse> {
    try {
      const { page = 1, limit = 50, sortBy = 'relevance', filters, q, userLocation, refresh = false } = params;
      
      const searchParams = new URLSearchParams();
      
      // Basic params
      searchParams.set('page', page.toString());
      searchParams.set('limit', limit.toString());
      searchParams.set('sortBy', sortBy);
      
      // Search query
      if (q) {
        searchParams.set('q', q);
      }
      
      // User location for proximity
      if (userLocation) {
        searchParams.set('userLat', userLocation.lat.toString());
        searchParams.set('userLng', userLocation.lng.toString());
      }
      
      // Refresh flag
      if (refresh) {
        searchParams.set('refresh', 'true');
      }
      
      // Filters
      if (filters) {
        if (filters.location) searchParams.set('location', filters.location);
        if (filters.remote && filters.remote !== 'any') searchParams.set('remote', filters.remote);
        if (filters.jobType.length > 0) searchParams.set('jobType', filters.jobType.join(','));
        if (filters.jobLevel.length > 0) searchParams.set('jobLevel', filters.jobLevel.join(','));
        if (filters.skills.length > 0) searchParams.set('skills', filters.skills.join(','));
        if (filters.salaryMin > 0) searchParams.set('salaryMin', filters.salaryMin.toString());
        if (filters.salaryMax < 300000) searchParams.set('salaryMax', filters.salaryMax.toString());
        if (filters.companySize && filters.companySize.length > 0) {
          searchParams.set('companySize', filters.companySize.join(','));
        }
      }

      const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get location-based job suggestions with proximity
   */
  async getProximityJobs(params: {
    location: string;
    jobType?: string[];
    level?: string[];
    remote?: 'any' | 'remote_only' | 'hybrid' | 'onsite';
    limit?: number;
  }): Promise<ProximityApiResponse> {
    try {
      const { location, jobType = [], level = [], remote = 'any', limit = 20 } = params;
      
      const searchParams = new URLSearchParams();
      searchParams.set('location', location);
      searchParams.set('limit', limit.toString());
      
      if (jobType.length > 0) searchParams.set('jobType', jobType.join(','));
      if (level.length > 0) searchParams.set('level', level.join(','));
      if (remote !== 'any') searchParams.set('remote', remote);

      const response = await fetch(`${this.baseUrl}/proximity?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching proximity jobs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Expand search to nearby cities
   */
  async expandSearch(location: string, preferences: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/proximity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'expand-search',
          location,
          preferences,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error expanding search:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Manual job sync (admin function)
   */
  async syncJobs(params: {
    location?: string;
    keywords?: string;
    sources?: string[];
    limit?: number;
  }): Promise<any> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sync',
          params,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error syncing jobs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get job statistics
   */
  async getStats(): Promise<any> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'stats',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const jobsApiClient = new JobsApiClient();