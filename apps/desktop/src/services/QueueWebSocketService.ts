/**
 * @fileoverview Queue WebSocket Service for JobSwipe Desktop App
 * @description Real-time queue stream using WebSocket (REPLACES polling)
 * @version 2.0.0
 * @author JobSwipe Team
 *
 * PERFORMANCE IMPROVEMENTS:
 * - Instant job delivery (was 10 second delay with polling)
 * - Zero battery drain (no constant HTTP requests)
 * - Scalable (1,000 users = 1,000 connections vs 8.6M requests/day)
 * - Automatic reconnection with exponential backoff
 */

import { EventEmitter } from 'events';
import { io, Socket } from 'socket.io-client';
import { TokenStorageService } from './TokenStorageService';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export interface PendingApplication {
  id: string;
  jobId: string;
  userId: string;
  status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed';
  priority: 'immediate' | 'urgent' | 'high' | 'normal';
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
    url: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface QueueStats {
  totalPending: number;
  totalProcessing: number;
  estimatedWaitTime: number;
  lastUpdatedAt: Date;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
}

export interface WebSocketConfig {
  enabled: boolean;
  apiBaseUrl: string;
  autoReconnect: boolean;
  reconnectAttempts: number;
  reconnectDelay: number;
  reconnectBackoffMultiplier: number;
  maxReconnectDelay: number;
}

// =============================================================================
// QUEUE WEBSOCKET SERVICE
// =============================================================================

export class QueueWebSocketService extends EventEmitter {
  private socket: Socket | null = null;
  private tokenStorage: TokenStorageService;
  private isConnected: boolean = false;
  private reconnectAttempt: number = 0;
  private currentReconnectDelay: number = 1000;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  private config: WebSocketConfig = {
    enabled: true,
    apiBaseUrl: 'http://localhost:3001',
    autoReconnect: true,
    reconnectAttempts: 10,
    reconnectDelay: 1000,
    reconnectBackoffMultiplier: 2,
    maxReconnectDelay: 30000, // Max 30 seconds
  };

  private stats: QueueStats = {
    totalPending: 0,
    totalProcessing: 0,
    estimatedWaitTime: 0,
    lastUpdatedAt: new Date(),
    connectionStatus: 'disconnected',
  };

  constructor(apiBaseUrl: string = 'http://localhost:3001') {
    super();

    this.config.apiBaseUrl = apiBaseUrl;
    this.tokenStorage = new TokenStorageService();

    console.log('✅ QueueWebSocketService initialized with baseURL:', apiBaseUrl);
  }

  // =============================================================================
  // CONNECTION MANAGEMENT
  // =============================================================================

  /**
   * Connect to WebSocket server and subscribe to queue stream
   */
  async connect(): Promise<void> {
    if (this.isConnected && this.socket?.connected) {
      console.log('⚠️  Already connected to queue stream');
      return;
    }

    try {
      console.log('🔌 Connecting to queue stream WebSocket...');
      this.stats.connectionStatus = 'connecting';

      // Get authentication token
      const token = await this.tokenStorage.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Create Socket.IO client
      this.socket = io(this.config.apiBaseUrl, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'], // Prefer WebSocket
        reconnection: false, // We handle reconnection manually
        timeout: 10000,
      });

      // Setup event listeners
      this.setupEventListeners();

      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.socket!.once('connect', () => {
          clearTimeout(timeout);
          resolve();
        });

        this.socket!.once('connect_error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

    } catch (error) {
      console.error('❌ Failed to connect to queue stream:', error);
      this.stats.connectionStatus = 'error';
      this.emit('connection-error', error);

      // Auto-reconnect
      if (this.config.autoReconnect) {
        this.scheduleReconnect();
      }

      throw error;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    console.log('🔌 Disconnecting from queue stream...');

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnected = false;
    this.stats.connectionStatus = 'disconnected';
    this.emit('disconnected');
  }

  /**
   * Reconnect to WebSocket server
   */
  private async reconnect(): Promise<void> {
    this.reconnectAttempt++;

    if (this.reconnectAttempt > this.config.reconnectAttempts) {
      console.error(`❌ Max reconnection attempts (${this.config.reconnectAttempts}) reached`);
      this.emit('reconnect-failed');
      return;
    }

    console.log(`🔄 Reconnection attempt ${this.reconnectAttempt}/${this.config.reconnectAttempts}...`);

    try {
      await this.connect();
      this.reconnectAttempt = 0; // Reset on successful connection
      this.currentReconnectDelay = this.config.reconnectDelay; // Reset delay
    } catch (error) {
      console.error('Reconnection failed:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = Math.min(
      this.currentReconnectDelay,
      this.config.maxReconnectDelay
    );

    console.log(`⏳ Scheduling reconnect in ${delay}ms...`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnect();
    }, delay);

    // Exponential backoff
    this.currentReconnectDelay *= this.config.reconnectBackoffMultiplier;
  }

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  /**
   * Setup Socket.IO event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection confirmed
    this.socket.on('connection-confirmed', (data: any) => {
      console.log('✅ WebSocket connection confirmed:', data.socketId);
      this.isConnected = true;
      this.stats.connectionStatus = 'connected';
      this.reconnectAttempt = 0; // Reset reconnect counter
      this.currentReconnectDelay = this.config.reconnectDelay;

      // Subscribe to queue stream
      this.socket!.emit('subscribe-queue-stream');

      this.emit('connected', data);
    });

    // Queue stream initialized (sent after subscribe)
    this.socket.on('queue-stream-initialized', (data: any) => {
      console.log(`📊 Queue stream initialized: ${data.totalPending} pending jobs`);

      this.stats.totalPending = data.totalPending;
      this.stats.lastUpdatedAt = new Date();

      this.emit('stream-initialized', data);
    });

    // NEW JOB AVAILABLE (real-time push!)
    this.socket.on('queue-job-available', (job: PendingApplication) => {
      console.log(`📨 New job received: ${job.job.title} at ${job.job.company}`);

      this.stats.totalPending++;
      this.stats.lastUpdatedAt = new Date();

      // Emit to application for processing
      this.emit('job-available', job);

      // Update stats
      this.emit('stats-updated', this.stats);
    });

    // Job claim confirmed
    this.socket.on('queue-job-claim-confirmed', (data: any) => {
      console.log(`✅ Job claim confirmed: ${data.applicationId}`);
      this.emit('job-claim-confirmed', data);
    });

    // WebSocket errors
    this.socket.on('error', (error: any) => {
      console.error('❌ WebSocket error:', error);
      this.stats.connectionStatus = 'error';
      this.emit('error', error);
    });

    // Connection error
    this.socket.on('connect_error', (error: Error) => {
      console.error('❌ Connection error:', error.message);
      this.stats.connectionStatus = 'error';
      this.emit('connection-error', error);

      // Auto-reconnect
      if (this.config.autoReconnect) {
        this.scheduleReconnect();
      }
    });

    // Disconnection
    this.socket.on('disconnect', (reason: string) => {
      console.warn(`🔌 Disconnected from queue stream: ${reason}`);
      this.isConnected = false;
      this.stats.connectionStatus = 'disconnected';
      this.emit('disconnected', { reason });

      // Auto-reconnect (unless intentional disconnect)
      if (reason !== 'io client disconnect' && this.config.autoReconnect) {
        this.scheduleReconnect();
      }
    });

    // Ping/pong for keepalive
    this.socket.on('pong', (data: any) => {
      this.emit('pong', data);
    });
  }

  // =============================================================================
  // JOB OPERATIONS
  // =============================================================================

  /**
   * Claim a job for processing
   * This prevents duplicate processing if server also tries to process
   */
  async claimJob(applicationId: string): Promise<void> {
    if (!this.isConnected || !this.socket) {
      throw new Error('Not connected to queue stream');
    }

    console.log(`🎯 Claiming job: ${applicationId}`);

    this.socket.emit('queue-job-claimed', { applicationId });

    this.stats.totalPending = Math.max(0, this.stats.totalPending - 1);
    this.stats.totalProcessing++;
    this.emit('stats-updated', this.stats);
  }

  /**
   * Send heartbeat ping
   */
  ping(): void {
    if (this.socket?.connected) {
      this.socket.emit('ping');
    }
  }

  // =============================================================================
  // CONFIGURATION
  // =============================================================================

  /**
   * Update WebSocket configuration
   */
  updateConfig(newConfig: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 WebSocket configuration updated:', this.config);
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): QueueStats['connectionStatus'] {
    return this.stats.connectionStatus;
  }

  /**
   * Get current statistics
   */
  getStats(): QueueStats {
    return { ...this.stats };
  }

  /**
   * Check if connected
   */
  isConnectionActive(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // =============================================================================
  // CLEANUP
  // =============================================================================

  /**
   * Cleanup and disconnect
   */
  cleanup(): void {
    console.log('🧹 Cleaning up QueueWebSocketService...');

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.disconnect();

    // Remove all listeners
    this.removeAllListeners();

    console.log('✅ Cleanup completed');
  }
}
