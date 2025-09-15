/**
 * @fileoverview Queue Polling Service for JobSwipe Desktop App
 * @description Polls server for pending job applications and manages local execution queue
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { EventEmitter } from 'events';
import axios, { AxiosInstance } from 'axios';
import { TokenStorageService } from './TokenStorageService';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export interface PendingApplication {
  id: string;
  jobId: string;
  userId: string;
  status: 'PENDING' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  priority: 'IMMEDIATE' | 'URGENT' | 'HIGH' | 'NORMAL';
  useCustomResume: boolean;
  resumeId?: string;
  coverLetter?: string;
  customFields: Record<string, string>;
  automationConfig: {
    source: string;
    deviceId?: string;
    timestamp: string;
    triggeredBySwipe?: boolean;
  };
  job: {
    title: string;
    company: string;
    location: string;
    logo?: string;
    salary?: {
      min?: number;
      max?: number;
      currency?: string;
    };
    remote: boolean;
    type: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface QueueStats {
  totalPending: number;
  totalProcessing: number;
  estimatedWaitTime: number;
  lastPolledAt: Date;
  connectionStatus: 'connected' | 'disconnected' | 'error';
}

export interface PollingConfig {
  enabled: boolean;
  intervalMs: number;
  maxRetries: number;
  backoffMultiplier: number;
  maxBackoffMs: number;
}

// =============================================================================
// QUEUE POLLING SERVICE
// =============================================================================

export class QueuePollingService extends EventEmitter {
  private apiClient: AxiosInstance;
  private tokenStorage: TokenStorageService;
  private pollingInterval: NodeJS.Timeout | null = null;
  private isPolling: boolean = false;
  private retryCount: number = 0;
  private currentBackoffMs: number = 1000;

  private config: PollingConfig = {
    enabled: true,
    intervalMs: 10000, // Poll every 10 seconds
    maxRetries: 5,
    backoffMultiplier: 2,
    maxBackoffMs: 60000, // Max 1 minute backoff
  };

  private stats: QueueStats = {
    totalPending: 0,
    totalProcessing: 0,
    estimatedWaitTime: 0,
    lastPolledAt: new Date(),
    connectionStatus: 'disconnected',
  };

  constructor(apiBaseUrl: string = 'http://localhost:3001') {
    super();

    this.tokenStorage = new TokenStorageService();

    // Initialize API client
    this.apiClient = axios.create({
      baseURL: apiBaseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'JobSwipe-Desktop/1.0.0',
      },
    });

    // Add request interceptor for authentication
    this.apiClient.interceptors.request.use(
      async (config) => {
        const token = await this.tokenStorage.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          console.warn('Authentication failed, token may be expired');
          this.emit('auth-error', error);
        }
        return Promise.reject(error);
      }
    );

    console.log('QueuePollingService initialized with baseURL:', apiBaseUrl);
  }

  // =============================================================================
  // POLLING CONTROL
  // =============================================================================

  /**
   * Start polling for pending applications
   */
  async startPolling(): Promise<void> {
    if (this.isPolling) {
      console.log('Polling already active');
      return;
    }

    console.log('Starting queue polling service...');
    this.isPolling = true;
    this.retryCount = 0;
    this.currentBackoffMs = 1000;

    // Perform initial poll
    await this.performPoll();

    // Set up recurring polling
    this.pollingInterval = setInterval(async () => {
      if (this.config.enabled && this.isPolling) {
        await this.performPoll();
      }
    }, this.config.intervalMs);

    this.emit('polling-started');
  }

  /**
   * Stop polling for pending applications
   */
  stopPolling(): void {
    console.log('Stopping queue polling service...');
    this.isPolling = false;

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    this.stats.connectionStatus = 'disconnected';
    this.emit('polling-stopped');
  }

  /**
   * Update polling configuration
   */
  updateConfig(newConfig: Partial<PollingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Polling configuration updated:', this.config);

    // Restart polling if interval changed and polling is active
    if (this.isPolling && newConfig.intervalMs) {
      this.stopPolling();
      this.startPolling();
    }
  }

  // =============================================================================
  // POLLING OPERATIONS
  // =============================================================================

  /**
   * Perform a single poll for pending applications
   */
  private async performPoll(): Promise<void> {
    try {
      console.log('Polling for pending applications...');

      const response = await this.apiClient.get('/api/v1/queue/applications', {
        params: {
          status: 'pending',
          limit: 50,
          offset: 0,
        },
      });

      if (response.data.success) {
        const applications: PendingApplication[] = response.data.data.applications;
        const total = response.data.data.pagination.total;

        // Update stats
        this.stats = {
          totalPending: applications.length,
          totalProcessing: 0, // Will be updated by processing service
          estimatedWaitTime: this.calculateEstimatedWaitTime(applications.length),
          lastPolledAt: new Date(),
          connectionStatus: 'connected',
        };

        // Reset retry count on successful poll
        this.retryCount = 0;
        this.currentBackoffMs = 1000;

        console.log(`Found ${applications.length} pending applications`);

        // Emit events for each pending application
        for (const application of applications) {
          this.emit('application-found', application);
        }

        // Emit queue position updates for all applications
        if (applications.length > 0) {
          await this.emitQueuePositionUpdates(applications);
        }

        // Emit stats update
        this.emit('stats-updated', this.stats);

        // Emit general polling success
        this.emit('polling-success', {
          applicationsFound: applications.length,
          totalInQueue: total,
          timestamp: new Date(),
        });

      } else {
        throw new Error(`API returned error: ${response.data.error}`);
      }

    } catch (error) {
      console.error('Polling failed:', error);
      await this.handlePollingError(error);
    }
  }

  /**
   * Handle polling errors with retry logic
   */
  private async handlePollingError(error: any): Promise<void> {
    this.stats.connectionStatus = 'error';
    this.retryCount++;

    if (this.retryCount >= this.config.maxRetries) {
      console.error(`Polling failed after ${this.config.maxRetries} retries, stopping...`);
      this.stopPolling();
      this.emit('polling-failed', {
        error: error.message,
        retries: this.retryCount,
        timestamp: new Date(),
      });
      return;
    }

    // Calculate backoff delay
    const backoffMs = Math.min(
      this.currentBackoffMs * this.config.backoffMultiplier,
      this.config.maxBackoffMs
    );

    console.log(`Polling retry ${this.retryCount}/${this.config.maxRetries} in ${backoffMs}ms`);

    // Wait before retry
    setTimeout(async () => {
      if (this.isPolling) {
        await this.performPoll();
      }
    }, backoffMs);

    this.currentBackoffMs = backoffMs;

    this.emit('polling-retry', {
      error: error.message,
      retryCount: this.retryCount,
      backoffMs,
      timestamp: new Date(),
    });
  }

  // =============================================================================
  // APPLICATION MANAGEMENT
  // =============================================================================

  /**
   * Claim a specific application for processing
   */
  async claimApplication(applicationId: string): Promise<boolean> {
    try {
      console.log(`Claiming application: ${applicationId}`);

      const response = await this.apiClient.post(
        `/api/v1/desktop/applications/${applicationId}/claim`,
        {
          deviceId: await this.getDeviceId(),
          timestamp: new Date().toISOString(),
        }
      );

      if (response.data.success) {
        console.log(`Successfully claimed application: ${applicationId}`);
        this.emit('application-claimed', {
          applicationId,
          timestamp: new Date(),
        });
        return true;
      } else {
        console.warn(`Failed to claim application: ${response.data.error}`);
        return false;
      }

    } catch (error) {
      console.error(`Error claiming application ${applicationId}:`, error);
      this.emit('claim-error', {
        applicationId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      });
      return false;
    }
  }

  /**
   * Report progress for an application
   */
  async reportProgress(applicationId: string, progress: number, status: string, message?: string): Promise<void> {
    try {
      await this.apiClient.patch(
        `/api/v1/desktop/applications/${applicationId}/progress`,
        {
          progress: Math.max(0, Math.min(100, progress)),
          status,
          message,
          timestamp: new Date().toISOString(),
        }
      );

      this.emit('progress-reported', {
        applicationId,
        progress,
        status,
        message,
        timestamp: new Date(),
      });

    } catch (error) {
      console.error(`Error reporting progress for ${applicationId}:`, error);
      this.emit('progress-error', {
        applicationId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Complete an application with results
   */
  async completeApplication(applicationId: string, success: boolean, result: any, error?: string): Promise<void> {
    try {
      console.log(`Completing application: ${applicationId}, success: ${success}`);

      const response = await this.apiClient.post(
        `/api/v1/desktop/applications/${applicationId}/complete`,
        {
          success,
          result,
          error,
          completedAt: new Date().toISOString(),
          deviceId: await this.getDeviceId(),
        }
      );

      if (response.data.success) {
        console.log(`Successfully completed application: ${applicationId}`);
        this.emit('application-completed', {
          applicationId,
          success,
          result,
          error,
          timestamp: new Date(),
        });
      } else {
        throw new Error(`Server rejected completion: ${response.data.error}`);
      }

    } catch (error) {
      console.error(`Error completing application ${applicationId}:`, error);
      this.emit('completion-error', {
        applicationId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      });
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get current queue statistics
   */
  getStats(): QueueStats {
    return { ...this.stats };
  }

  /**
   * Check if polling is currently active
   */
  isActive(): boolean {
    return this.isPolling;
  }

  /**
   * Get polling configuration
   */
  getConfig(): PollingConfig {
    return { ...this.config };
  }

  /**
   * Calculate estimated wait time based on queue length
   */
  private calculateEstimatedWaitTime(queueLength: number): number {
    // Estimate 2 minutes per application on average
    const avgProcessingTimeMs = 2 * 60 * 1000;
    return queueLength * avgProcessingTimeMs;
  }

  /**
   * Get queue position for a specific application
   */
  async getQueuePosition(applicationId: string): Promise<{ position: number; estimatedTime: string } | null> {
    try {
      const response = await this.apiClient.get(`/api/v1/queue/applications/${applicationId}/position`);

      if (response.data.success) {
        return {
          position: response.data.data.position,
          estimatedTime: response.data.data.estimatedTime,
        };
      }
      return null;
    } catch (error) {
      console.error(`Error getting queue position for ${applicationId}:`, error);
      return null;
    }
  }

  /**
   * Emit queue position updates for all pending applications
   */
  async emitQueuePositionUpdates(applications: PendingApplication[]): Promise<void> {
    try {
      // Get queue positions for all applications
      const positionPromises = applications.map(async (app) => {
        const position = await this.getQueuePosition(app.id);
        return {
          applicationId: app.id,
          jobTitle: app.job.title,
          company: app.job.company,
          position: position?.position || 0,
          estimatedTime: position?.estimatedTime || 'Unknown',
          isPriority: app.priority === 'IMMEDIATE' || app.priority === 'URGENT',
          status: 'queued',
          timestamp: new Date().toISOString(),
        };
      });

      const queueUpdates = await Promise.all(positionPromises);

      // Emit individual queue position updates
      queueUpdates.forEach(update => {
        this.emit('queue-position-update', update);
      });

      // Also emit a batch update
      this.emit('queue-positions-updated', {
        applications: queueUpdates,
        totalPending: applications.length,
        lastUpdated: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Error emitting queue position updates:', error);
    }
  }

  /**
   * Send queue position update to server for WebSocket broadcasting
   */
  async sendQueuePositionToServer(applicationId: string, position: number, estimatedTime: string): Promise<void> {
    try {
      await this.apiClient.post(`/api/v1/queue/applications/${applicationId}/queue-position`, {
        position,
        estimatedTime,
        timestamp: new Date().toISOString(),
      });

      console.log(`Queue position update sent for application ${applicationId}: position ${position}`);
    } catch (error) {
      console.warn('Failed to send queue position update to server:', error);
      // Don't throw error - queue position updates are not critical
    }
  }

  /**
   * Get device ID for identification
   */
  private async getDeviceId(): Promise<string> {
    // This would integrate with your existing device ID service
    // For now, use a simple approach
    const { machineId } = require('node-machine-id');
    try {
      return await machineId();
    } catch (error) {
      return 'desktop-device-unknown';
    }
  }

  /**
   * Get API base URL for external use
   */
  getApiBaseUrl(): string {
    return this.apiClient.defaults.baseURL || 'http://localhost:3001';
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    console.log('Cleaning up QueuePollingService...');
    this.stopPolling();
    this.removeAllListeners();
  }
}

export default QueuePollingService;