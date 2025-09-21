/**
 * @fileoverview Jobs API Service for JobSwipe Web App
 * @description Client-side API service for job-related operations
 * @version 1.0.0
 * @author JobSwipe Team
 */

// =============================================================================
// TYPES
// =============================================================================

export interface SwipeJobRequest {
  direction: 'LEFT' | 'RIGHT';
  metadata: {
    source: 'web' | 'mobile' | 'desktop';
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
  };
  priority?: number;
  customFields?: Record<string, string>;
}

export interface SwipeJobResponse {
  success: boolean;
  message: string;
  data?: {
    jobId: string;
    direction: 'LEFT' | 'RIGHT';
    action: string;
    executionMode: string;
    applicationId?: string;
    automation?: {
      success: boolean;
      applicationId: string;
      confirmationNumber?: string;
      status: string;
      executionTime?: number;
    };
    serverAutomation?: {
      eligible: boolean;
      reason?: string;
      remainingServerApplications?: number;
    };
    processingTime: number;
  };
  correlationId?: string;
  error?: string;
  errorCode?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  details?: any;
  message?: string;
}

// =============================================================================
// API SERVICE CLASS
// =============================================================================

class JobsApiService {
  private baseUrl: string;
  private apiVersion: string;

  constructor() {
    // Use Fastify API backend directly
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    this.apiVersion = 'api/v1'; // Correct API route structure
  }

  /**
   * Get authorization header using server-side token bridge
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getAuthToken();

    if (token) {
      console.log('🔐 [Jobs API] Using auth token, first 20 chars:', token.substring(0, 20) + '...');
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }

    console.warn('⚠️ [Jobs API] No auth token found - request will be unauthorized');
    return {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get auth token using server-side token bridge to access HTTPOnly cookies
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      // Method 1: Try to get from auth service directly (if available)
      try {
        const authService = (globalThis as any).__authService;
        if (authService && typeof authService.getAccessToken === 'function') {
          const serviceToken = authService.getAccessToken();
          if (serviceToken) {
            console.log('🎯 [Jobs API] Using token from auth service');
            return serviceToken;
          }
        }
      } catch (serviceError) {
        console.log('ℹ️ [Jobs API] Auth service not available, trying server bridge');
      }

      // Method 2: Server-side token bridge (solves HTTPOnly cookie access)
      try {
        const response = await fetch('/api/auth/token', {
          method: 'GET',
          credentials: 'include', // Include cookies in request
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const tokenData = await response.json();

        if (tokenData.success && tokenData.token) {
          console.log('🌉 [Jobs API] Using token from server bridge');
          return tokenData.token;
        } else if (tokenData.shouldRefresh && tokenData.hasRefreshToken) {
          console.log('🔄 [Jobs API] Token expired, attempting refresh');

          // Try to refresh the token first
          const refreshed = await this.refreshAuthToken();
          if (refreshed) {
            // Try to get the token again after refresh
            const retryResponse = await fetch('/api/auth/token', {
              method: 'GET',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            });

            const retryTokenData = await retryResponse.json();
            if (retryTokenData.success && retryTokenData.token) {
              console.log('✅ [Jobs API] Token obtained after refresh');
              return retryTokenData.token;
            }
          }
        }
      } catch (bridgeError) {
        console.warn('❌ [Jobs API] Server bridge error:', bridgeError);
      }

      // Method 3: sessionStorage fallback (development)
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const sessionToken = window.sessionStorage.getItem('accessToken');
        if (sessionToken) {
          console.log('💾 [Jobs API] Using token from sessionStorage');
          return sessionToken;
        }
      }

      console.log('❌ [Jobs API] No token found in any location');
      return null;
    } catch (error) {
      console.error('❌ [Jobs API] Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Refresh authentication token
   */
  private async refreshAuthToken(): Promise<boolean> {
    try {
      console.log('🔄 [Jobs API] Attempting token refresh...');

      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (refreshResponse.ok) {
        console.log('✅ [Jobs API] Token refresh successful');
        return true;
      } else {
        const refreshData = await refreshResponse.json();
        console.log('❌ [Jobs API] Token refresh failed:', refreshData.error);
        return false;
      }
    } catch (error) {
      console.error('❌ [Jobs API] Token refresh error:', error);
      return false;
    }
  }

  /**
   * Generic API request method with automatic token refresh on 401
   */
  private async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}/${this.apiVersion}${endpoint}`;
      const headers = {
        ...(await this.getAuthHeaders()),
        ...options.headers,
      };

      console.log('🔗 [Jobs API] Making request to:', url, retryCount > 0 ? `(retry ${retryCount})` : '');

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('📡 [Jobs API] Response status:', response.status, response.statusText);

      const data = await response.json();

      if (!response.ok) {
        // Handle 401 authentication errors with automatic retry
        if (response.status === 401 && retryCount === 0) {
          console.log('🔄 [Jobs API] 401 error, attempting token refresh and retry...');

          const refreshSuccess = await this.refreshAuthToken();
          if (refreshSuccess) {
            // Retry the request once with refreshed token
            return this.apiRequest<T>(endpoint, options, 1);
          } else {
            // Refresh failed, return auth error
            return {
              success: false,
              error: 'Authentication failed. Please log in again.',
              errorCode: 'AUTH_REFRESH_FAILED',
            };
          }
        }

        let errorMessage = data.error || 'Request failed';

        // Handle other error types
        if (response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. Please check your permissions.';
        }

        return {
          success: false,
          error: errorMessage,
          errorCode: data.errorCode || `HTTP_${response.status}`,
          details: data.details,
        };
      }

      return data;
    } catch (error) {
      console.error('❌ [Jobs API] Request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        errorCode: 'NETWORK_ERROR',
      };
    }
  }

  /**
   * Swipe on a job (LEFT or RIGHT)
   */
  async swipeJob(jobId: string, request: SwipeJobRequest): Promise<SwipeJobResponse> {
    // Add browser metadata
    const requestWithMetadata: SwipeJobRequest = {
      ...request,
      metadata: {
        ...request.metadata,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
        // Note: IP address will be determined server-side
      },
    };

    console.log('👆 [Jobs API] Swiping job:', jobId, 'direction:', request.direction);

    const response = await this.apiRequest<SwipeJobResponse['data']>(`/jobs/${jobId}/swipe`, {
      method: 'POST',
      body: JSON.stringify(requestWithMetadata),
    });

    return {
      success: response.success,
      message: response.data?.action || (response.success ? 'Swipe successful' : 'Swipe failed'),
      data: response.data,
      error: response.error,
      errorCode: response.errorCode,
    };
  }

  /**
   * Swipe right on job (convenience method)
   */
  async swipeRight(jobId: string, metadata: SwipeJobRequest['metadata'], options?: {
    priority?: number;
    customFields?: Record<string, string>;
  }): Promise<SwipeJobResponse> {
    return this.swipeJob(jobId, {
      direction: 'RIGHT',
      metadata,
      priority: options?.priority,
      customFields: options?.customFields,
    });
  }

  /**
   * Swipe left on job (convenience method)
   */
  async swipeLeft(jobId: string, metadata: SwipeJobRequest['metadata']): Promise<SwipeJobResponse> {
    return this.swipeJob(jobId, {
      direction: 'LEFT',
      metadata,
    });
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate device ID for browser
 */
export function generateDeviceId(): string {
  if (typeof window === 'undefined') return 'server';

  // Try to get existing device ID from localStorage
  let deviceId = localStorage.getItem('jobswipe_device_id');

  if (!deviceId) {
    // Generate new device ID
    deviceId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('jobswipe_device_id', deviceId);
  }

  return deviceId;
}

/**
 * Determine priority from user context
 */
export function calculatePriority(
  isUrgent?: boolean,
  userPreferences?: any
): number {
  if (isUrgent) return 9;
  if (userPreferences?.prioritizeApplications) return 7;
  return 5; // Normal priority
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const jobsApi = new JobsApiService();

// =============================================================================
// EXPORTS
// =============================================================================

export {
  JobsApiService,
};