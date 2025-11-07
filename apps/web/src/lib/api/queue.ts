/**
 * @fileoverview Queue API Service for JobSwipe Web App
 * @description Client-side API service for job application queue management
 * @version 1.0.0
 * @author JobSwipe Team
 */

// =============================================================================
// TYPES
// =============================================================================

export interface JobApplicationRequest {
  jobId: string;
  resumeId?: string;
  coverLetter?: string;
  priority?: number;
  customFields?: Record<string, string>;
  metadata: {
    source: 'web' | 'mobile' | 'desktop';
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
  };
}

export interface ApplicationStatus {
  id: string;
  jobId: string;
  status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'immediate';
  attempts: number;
  maxAttempts: number;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  success?: boolean;
  errorMessage?: string;
  job: {
    title: string;
    company: string;
    location: string;
    logo?: string;
    url?: string; // Job application URL (applyUrl or sourceUrl)
    salary?: {
      min?: number;
      max?: number;
      currency?: string;
    };
    remote: boolean;
    type: string;
  };
  // Optional metadata for future features
  metadata?: {
    resume?: {
      summary?: string;
      fileName?: string;
      url?: string;
    };
    responses?: Record<string, string | string[]>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface QueueStats {
  user: {
    totalApplications: number;
    statusBreakdown: {
      pending: number;
      queued: number;
      processing: number;
      completed: number;
      failed: number;
      cancelled: number;
    };
    recentApplications: Array<{
      id: string;
      title: string;
      company: string;
      status: string;
      createdAt: string;
    }>;
  };
  queue?: any;
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

class QueueApiService {
  private baseUrl: string;
  private apiVersion: string;

  constructor() {
    // Use Fastify API backend directly for better performance and consistency
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    this.apiVersion = 'api/v1'; // Use Fastify API route structure with /api prefix
  }

  /**
   * Get authorization header using server-side token bridge
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getAuthToken();
    
    if (token) {
      console.log('🔐 [Queue API] Using auth token, first 20 chars:', token.substring(0, 20) + '...');
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }

    console.warn('⚠️ [Queue API] No auth token found - request will be unauthorized');
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
            console.log('🎯 [Queue API] Using token from auth service');
            return serviceToken;
          }
        }
      } catch (serviceError) {
        console.log('ℹ️ [Queue API] Auth service not available, trying server bridge');
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
          console.log('🌉 [Queue API] Using token from server bridge');
          console.log('🔍 [Queue API] Token source:', tokenData.source);
          return tokenData.token;
        } else if (tokenData.shouldRefresh && tokenData.hasRefreshToken) {
          console.log('🔄 [Queue API] Token expired, attempting refresh before getting token');
          
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
              console.log('✅ [Queue API] Token obtained after refresh');
              return retryTokenData.token;
            }
          }
        } else {
          console.log('⚠️ [Queue API] Server bridge failed:', tokenData.error);
        }
      } catch (bridgeError) {
        console.warn('❌ [Queue API] Server bridge error:', bridgeError);
      }

      // Method 3: sessionStorage fallback (development)
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const sessionToken = window.sessionStorage.getItem('accessToken');
        if (sessionToken) {
          console.log('💾 [Queue API] Using token from sessionStorage');
          return sessionToken;
        }
      }

      console.log('❌ [Queue API] No token found in any location');
      return null;
    } catch (error) {
      console.error('❌ [Queue API] Error getting auth token:', error);
      return null;
    }
  }


  /**
   * Refresh authentication token
   */
  private async refreshAuthToken(): Promise<boolean> {
    try {
      console.log('🔄 [Queue API] Attempting token refresh...');
      
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (refreshResponse.ok) {
        console.log('✅ [Queue API] Token refresh successful');
        return true;
      } else {
        const refreshData = await refreshResponse.json();
        console.log('❌ [Queue API] Token refresh failed:', refreshData.error);
        
        // If refresh requires login, we need to redirect
        if (refreshData.requiresLogin) {
          console.log('🔐 [Queue API] Refresh token expired, login required');
          // Could emit event or redirect to login here
        }
        
        return false;
      }
    } catch (error) {
      console.error('❌ [Queue API] Token refresh error:', error);
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

      console.log('🔗 [Queue API] Making request to:', url, retryCount > 0 ? `(retry ${retryCount})` : '');
      console.log('📋 [Queue API] Headers:', headers);
      console.log('📦 [Queue API] Options:', options);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('📡 [Queue API] Response status:', response.status, response.statusText);

      const data = await response.json();

      if (!response.ok) {
        // Handle 401 authentication errors with automatic retry
        if (response.status === 401 && retryCount === 0) {
          console.log('🔄 [Queue API] 401 error, attempting token refresh and retry...');
          
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
              details: { 
                originalError: data.error,
                refreshFailed: true,
                requiresLogin: true
              },
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
      console.error('❌ [Queue API] Request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        errorCode: 'NETWORK_ERROR',
      };
    }
  }

  /**
   * Queue job application when user applies to a job
   */
  async apply(request: JobApplicationRequest): Promise<ApiResponse<{
    applicationId: string;
    snapshotId: string;
    status: string;
    priority: string;
  }>> {
    // Add browser metadata
    const requestWithMetadata: JobApplicationRequest = {
      ...request,
      metadata: {
        ...request.metadata,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
        // Note: IP address will be determined server-side
      },
    };

    return this.apiRequest('/queue/apply', {
      method: 'POST',
      body: JSON.stringify(requestWithMetadata),
    });
  }

  /**
   * Get user's job applications
   */
  async getApplications(params: {
    limit?: number;
    offset?: number;
    status?: string;
  } = {}): Promise<ApiResponse<{
    applications: ApplicationStatus[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.status) queryParams.append('status', params.status);

    const endpoint = `/queue/applications${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.apiRequest(endpoint);
  }

  /**
   * Get specific application details
   */
  async getApplication(id: string): Promise<ApiResponse<ApplicationStatus & {
    queueStatus?: any;
    logs: Array<{
      id: string;
      level: string;
      message: string;
      step?: string;
      action?: string;
      executionTime?: number;
      createdAt: string;
    }>;
  }>> {
    return this.apiRequest(`/queue/applications/${id}`);
  }

  /**
   * Perform action on application
   */
  async applicationAction(
    id: string,
    action: 'cancel' | 'retry' | 'prioritize',
    reason?: string
  ): Promise<ApiResponse<{
    id: string;
    status: string;
    priority: string;
    message: string;
  }>> {
    return this.apiRequest(`/queue/applications/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    });
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<ApiResponse<QueueStats>> {
    return this.apiRequest('/queue/stats');
  }

  /**
   * Cancel application
   */
  async cancelApplication(id: string, reason?: string): Promise<ApiResponse<any>> {
    return this.applicationAction(id, 'cancel', reason);
  }

  /**
   * Retry application
   */
  async retryApplication(id: string, reason?: string): Promise<ApiResponse<any>> {
    return this.applicationAction(id, 'retry', reason);
  }

  /**
   * Prioritize application
   */
  async prioritizeApplication(id: string, reason?: string): Promise<ApiResponse<any>> {
    return this.applicationAction(id, 'prioritize', reason);
  }

  /**
   * Swipe right on job (alias for apply method for backward compatibility)
   */
  async swipeRight(request: SwipeRightRequest): Promise<ApiResponse<{
    applicationId: string;
    snapshotId: string;
    status: string;
    priority: string;
  }>> {
    return this.apply(request);
  }
}

// =============================================================================
// ADDITIONAL TYPES
// =============================================================================

export type SwipeRightRequest = JobApplicationRequest;

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

/**
 * Format status for display
 */
export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    queued: 'Queued',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
  };
  
  return statusMap[status] || status;
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'text-yellow-600 bg-yellow-100',
    queued: 'text-blue-600 bg-blue-100',
    processing: 'text-purple-600 bg-purple-100',
    completed: 'text-green-600 bg-green-100',
    failed: 'text-red-600 bg-red-100',
    cancelled: 'text-gray-600 bg-gray-100',
  };
  
  return colorMap[status] || 'text-gray-600 bg-gray-100';
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const queueApi = new QueueApiService();

// =============================================================================
// EXPORTS
// =============================================================================

export {
  QueueApiService,
};