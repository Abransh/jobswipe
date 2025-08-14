/**
 * @fileoverview Desktop Queue Service
 * @description Handles queue communication, job claiming, and processing coordination
 * @version 1.0.0
 * @author JobSwipe Team
 */

// import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
// import { io, Socket } from 'socket.io-client';

// Temporary types for compilation
interface AxiosInstance {
  get: (url: string, config?: any) => Promise<any>;
  post: (url: string, data: any, config?: any) => Promise<any>;
  interceptors: {
    request: { use: (onFulfilled: any, onRejected: any) => void };
    response: { use: (onFulfilled: any, onRejected: any) => void };
  };
}

interface Socket {
  on: (event: string, callback: (...args: any[]) => void) => void;
  emit: (event: string, ...args: any[]) => void;
  disconnect: () => void;
}

// Temporary stubs
const axios = {
  create: (): AxiosInstance => ({
    get: async () => ({ data: { success: true, data: {} } }),
    post: async () => ({ data: { success: true } }),
    interceptors: {
      request: { use: () => {} },
      response: { use: () => {} }
    }
  })
};

const io = (url: string, options?: any): Socket => ({
  on: () => {},
  emit: () => {},
  disconnect: () => {}
});
import { EventEmitter } from 'events';
import Store from 'electron-store';
import { AuthService } from './AuthService';
import { BrowserAutomationService } from './BrowserAutomationService';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface QueueJob {
  id: string;
  jobId: string;
  userId: string;
  jobData: {
    title: string;
    company: string;
    url: string;
    description: string;
    requirements?: string;
    salary?: {
      min?: number;
      max?: number;
      currency?: string;
    };
    location: string;
    remote: boolean;
    type: string;
    level: string;
  };
  userProfile: {
    resumeUrl?: string;
    coverLetter?: string;
    preferences: Record<string, any>;
  };
  priority: number;
  status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  metadata: {
    source: 'web' | 'mobile' | 'desktop';
    deviceId?: string;
    timestamp: string;
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
  };
  queue: any;
}

export interface ProcessingResult {
  success: boolean;
  applicationId?: string;
  confirmationId?: string;
  screenshots?: string[];
  error?: string;
  logs?: string[];
}

// =============================================================================
// QUEUE SERVICE CLASS
// =============================================================================

export class QueueService extends EventEmitter {
  private apiClient: AxiosInstance;
  private socket: Socket | null = null;
  private authService: AuthService;
  private store: Store;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private processingJobs = new Map<string, QueueJob>();
  private pollingInterval: NodeJS.Timeout | null = null;
  private browserAutomation: BrowserAutomationService;

  constructor() {
    super();
    
    this.authService = AuthService.getInstance();
    this.store = new Store({
      name: 'queue-service',
      defaults: {
        processingJobs: {},
        lastSync: null,
        settings: {
          pollingInterval: 30000, // 30 seconds
          maxConcurrentJobs: 3,
          autoStartProcessing: false,
        },
      },
    }) as any;

    // Initialize API client
    this.apiClient = axios.create();

    // Setup request interceptor for authentication
    this.apiClient.interceptors.request.use(
      (config: any) => {
        const token = this.authService.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Setup response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          try {
            // await this.authService.refreshToken(); // TODO: Implement refreshToken method
            // Retry the original request
            const originalRequest = error.config;
            const token = this.authService.getAccessToken();
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              // return this.apiClient.request(originalRequest); // TODO: Implement after fixing axios
            }
          } catch (refreshError) {
            this.emit('auth-error', refreshError);
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );

    // Initialize browser automation service
    this.browserAutomation = new BrowserAutomationService();
    
    // Setup browser automation event listeners
    this.setupBrowserAutomationListeners();
    
    // Load persisted processing jobs
    this.loadProcessingJobs();
  }

  // =============================================================================
  // CONNECTION MANAGEMENT
  // =============================================================================

  /**
   * Initialize queue service
   */
  async initialize(): Promise<void> {
    try {
      // Initialize browser automation service
      await this.browserAutomation.initialize();
      
      // Test API connection
      await this.testConnection();
      
      // Setup WebSocket connection
      await this.connectWebSocket();
      
      // Start polling for jobs
      this.startPolling();
      
      this.emit('initialized');
      console.log('✅ Queue service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize queue service:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Test API connection
   */
  private async testConnection(): Promise<void> {
    try {
      await this.apiClient.get('/queue/stats');
      console.log('✅ API connection established');
    } catch (error) {
      console.error('❌ Failed to connect to API:', error);
      throw new Error('Unable to connect to JobSwipe API');
    }
  }

  /**
   * Connect to WebSocket for real-time updates
   */
  private async connectWebSocket(): Promise<void> {
    const token = this.authService.getAccessToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const socketUrl = process.env.API_URL || 'http://localhost:3001';
    
    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
      
      // Subscribe to queue status updates
      this.socket?.emit('subscribe-queue-status');
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnected', reason);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('❌ WebSocket connection error:', error);
      this.reconnectAttempts++;
      this.emit('connection-error', error);
    });

    // Listen for job events
    this.socket.on('job-claimed', (data: any) => {
      this.emit('job-claimed', data);
    });

    this.socket.on('processing-started', (data: any) => {
      this.emit('processing-started', data);
    });

    this.socket.on('processing-completed', (data: any) => {
      this.emit('processing-completed', data);
    });

    this.socket.on('processing-failed', (data: any) => {
      this.emit('processing-failed', data);
    });
  }

  /**
   * Disconnect from services
   */
  async disconnect(): Promise<void> {
    try {
      // Stop polling
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }

      // Disconnect WebSocket
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      // Stop browser automation
      await this.browserAutomation.stopAllAutomations();

      this.isConnected = false;
      this.emit('disconnected', 'manual');
      console.log('✅ Queue service disconnected');
    } catch (error) {
      console.error('❌ Error during disconnect:', error);
    }
  }

  // =============================================================================
  // JOB MANAGEMENT
  // =============================================================================

  /**
   * Get available jobs from queue
   */
  async getAvailableJobs(limit = 10): Promise<QueueJob[]> {
    try {
      const response = await this.apiClient.get('/queue/applications', {
        params: {
          limit,
          status: 'queued', // Only get queued jobs ready for processing
        },
      });

      if (response.data.success) {
        return response.data.data.applications;
      } else {
        throw new Error(response.data.error || 'Failed to get available jobs');
      }
    } catch (error) {
      console.error('Failed to get available jobs:', error);
      return [];
    }
  }

  /**
   * Claim a job for processing
   */
  async claimJob(jobId: string): Promise<boolean> {
    try {
      const response = await this.apiClient.post(`/queue/applications/${jobId}/action`, {
        action: 'claim',
        deviceId: this.getDeviceId(),
      });

      if (response.data.success) {
        console.log(`✅ Successfully claimed job: ${jobId}`);
        this.emit('job-claimed', { jobId });
        return true;
      } else {
        console.warn(`⚠️ Failed to claim job ${jobId}: ${response.data.error}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error claiming job ${jobId}:`, error);
      return false;
    }
  }

  /**
   * Update job processing status
   */
  async updateJobStatus(
    jobId: string, 
    status: 'processing' | 'completed' | 'failed',
    result?: ProcessingResult
  ): Promise<void> {
    try {
      const response = await this.apiClient.post(`/queue/applications/${jobId}/status`, {
        status,
        result,
        deviceId: this.getDeviceId(),
        timestamp: new Date().toISOString(),
      });

      if (response.data.success) {
        console.log(`✅ Updated job ${jobId} status to: ${status}`);
        this.emit('job-status-updated', { jobId, status, result });
      } else {
        console.error(`❌ Failed to update job ${jobId} status:`, response.data.error);
      }
    } catch (error) {
      console.error(`❌ Error updating job ${jobId} status:`, error);
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<QueueStats | null> {
    try {
      const response = await this.apiClient.get('/queue/stats');
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to get queue stats');
      }
    } catch (error) {
      console.error('Failed to get queue stats:', error);
      return null;
    }
  }

  // =============================================================================
  // JOB PROCESSING
  // =============================================================================

  /**
   * Start processing jobs automatically
   */
  startPolling(): void {
    if (this.pollingInterval) return;

    const interval = this.store.get('settings.pollingInterval') as number;
    
    this.pollingInterval = setInterval(async () => {
      await this.pollForJobs();
    }, interval);

    console.log(`✅ Started polling for jobs every ${interval}ms`);
  }

  /**
   * Stop processing jobs
   */
  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('✅ Stopped polling for jobs');
    }
  }

  /**
   * Poll for available jobs and claim them
   */
  private async pollForJobs(): Promise<void> {
    try {
      const maxConcurrent = this.store.get('settings.maxConcurrentJobs') as number;
      const currentProcessingCount = this.processingJobs.size;

      if (currentProcessingCount >= maxConcurrent) {
        console.log(`⏸️ Already processing ${currentProcessingCount} jobs (max: ${maxConcurrent})`);
        return;
      }

      const availableSlots = maxConcurrent - currentProcessingCount;
      const jobs = await this.getAvailableJobs(availableSlots);

      for (const job of jobs) {
        if (this.processingJobs.has(job.id)) continue; // Already processing

        const claimed = await this.claimJob(job.id);
        if (claimed) {
          this.processingJobs.set(job.id, job);
          this.saveProcessingJobs();
          
          // Start processing this job
          this.processJob(job).catch(error => {
            console.error(`❌ Error processing job ${job.id}:`, error);
            this.handleJobError(job.id, error);
          });
        }
      }
    } catch (error) {
      console.error('❌ Error during job polling:', error);
    }
  }

  /**
   * Process a claimed job
   */
  private async processJob(job: QueueJob): Promise<void> {
    console.log(`🚀 Starting to process job: ${job.id} (${job.jobData.title})`);
    
    try {
      // Update status to processing
      await this.updateJobStatus(job.id, 'processing');

      // Process job using browser automation
      const result = await this.browserAutomation.processJobApplication(job);

      // Update status to completed
      await this.updateJobStatus(job.id, 'completed', result);

      // Remove from processing jobs
      this.processingJobs.delete(job.id);
      this.saveProcessingJobs();

      console.log(`✅ Successfully processed job: ${job.id}`);
      this.emit('job-processed', { job, result });

    } catch (error) {
      console.error(`❌ Failed to process job ${job.id}:`, error);
      await this.handleJobError(job.id, error);
    }
  }

  /**
   * Setup browser automation event listeners
   */
  private setupBrowserAutomationListeners(): void {
    this.browserAutomation.on('processing-started', (data) => {
      console.log(`🚀 Browser automation started for job: ${data.jobId}`);
      this.emit('browser-automation-started', data);
    });

    this.browserAutomation.on('processing-completed', (data) => {
      console.log(`✅ Browser automation completed for job: ${data.jobId}`);
      this.emit('browser-automation-completed', data);
    });

    this.browserAutomation.on('processing-failed', (data) => {
      console.error(`❌ Browser automation failed for job: ${data.jobId}`);
      this.emit('browser-automation-failed', data);
    });

    this.browserAutomation.on('step-completed', (data) => {
      console.log(`📝 Automation step completed: ${data.step}`);
      this.emit('automation-step-completed', data);
    });

    this.browserAutomation.on('step-failed', (data) => {
      console.warn(`⚠️ Automation step failed: ${data.step} - ${data.error}`);
      this.emit('automation-step-failed', data);
    });

    this.browserAutomation.on('automation-output', (data) => {
      this.emit('automation-output', data);
    });
  }

  /**
   * Handle job processing error
   */
  private async handleJobError(jobId: string, error: any): Promise<void> {
    const result: ProcessingResult = {
      success: false,
      error: error.message || 'Unknown error occurred',
      logs: [error.stack || error.toString()],
    };

    await this.updateJobStatus(jobId, 'failed', result);
    
    // Remove from processing jobs
    this.processingJobs.delete(jobId);
    this.saveProcessingJobs();

    this.emit('job-error', { jobId, error });
  }

  // =============================================================================
  // PERSISTENCE
  // =============================================================================

  /**
   * Save processing jobs to disk
   */
  private saveProcessingJobs(): void {
    const jobs = Object.fromEntries(this.processingJobs);
    this.store.set('processingJobs', jobs);
  }

  /**
   * Load processing jobs from disk
   */
  private loadProcessingJobs(): void {
    const jobs = this.store.get('processingJobs') as Record<string, QueueJob>;
    this.processingJobs = new Map(Object.entries(jobs || {}));
  }

  // =============================================================================
  // UTILITIES
  // =============================================================================

  /**
   * Get device ID
   */
  private getDeviceId(): string {
    let deviceId = this.store.get('deviceId') as string;
    if (!deviceId) {
      deviceId = `desktop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.store.set('deviceId', deviceId);
    }
    return deviceId;
  }

  /**
   * Get connection status
   */
  isConnectedToQueue(): boolean {
    return this.isConnected;
  }

  /**
   * Get processing jobs count
   */
  getProcessingJobsCount(): number {
    return this.processingJobs.size;
  }

  /**
   * Get processing jobs
   */
  getProcessingJobs(): QueueJob[] {
    return Array.from(this.processingJobs.values());
  }

  /**
   * Update settings
   */
  updateSettings(settings: {
    pollingInterval?: number;
    maxConcurrentJobs?: number;
    autoStartProcessing?: boolean;
  }): void {
    const currentSettings = this.store.get('settings') as any;
    const newSettings = { ...currentSettings, ...settings };
    this.store.set('settings', newSettings);

    // Restart polling with new interval if changed
    if (settings.pollingInterval && this.pollingInterval) {
      this.stopPolling();
      this.startPolling();
    }

    this.emit('settings-updated', newSettings);
  }

  /**
   * Get current settings
   */
  getSettings() {
    return this.store.get('settings');
  }

  /**
   * Stop automation for a specific job
   */
  async stopJobAutomation(jobId: string): Promise<boolean> {
    try {
      const stopped = await this.browserAutomation.stopAutomation(jobId);
      if (stopped) {
        // Update job status to cancelled
        await this.updateJobStatus(jobId, 'failed', {
          success: false,
          error: 'Job automation was manually stopped',
          logs: ['Automation stopped by user'],
        });
        
        // Remove from processing jobs
        this.processingJobs.delete(jobId);
        this.saveProcessingJobs();
        
        this.emit('job-stopped', { jobId });
        return true;
      }
      return false;
    } catch (error) {
      console.error(`❌ Error stopping job automation ${jobId}:`, error);
      return false;
    }
  }

  /**
   * Get browser automation configuration
   */
  getBrowserAutomationConfig() {
    return this.browserAutomation.getConfig();
  }

  /**
   * Update browser automation configuration
   */
  updateBrowserAutomationConfig(config: any): void {
    this.browserAutomation.updateConfig(config);
    this.emit('browser-config-updated', config);
  }

  /**
   * Get automation logs for a specific job
   */
  getJobAutomationLogs(): Record<string, any> {
    return this.browserAutomation.getAutomationLogs();
  }

  /**
   * Get running automations count
   */
  getRunningAutomationsCount(): number {
    return this.browserAutomation.getRunningAutomationsCount();
  }

  /**
   * Cleanup on exit
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up queue service...');
    await this.browserAutomation.cleanup();
    await this.disconnect();
    this.saveProcessingJobs();
  }
}