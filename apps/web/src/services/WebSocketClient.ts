/**
 * @fileoverview WebSocket Client for Real-time Updates in JobSwipe Frontend
 * @description Handles real-time communication with the server for job applications
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { EventEmitter } from 'events';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface WebSocketClientOptions {
  url?: string;
  token?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  debug?: boolean;
}

export interface ApplicationUpdate {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: string;
  progress?: {
    step: string;
    percentage: number;
    message: string;
    timestamp: string;
  };
  result?: {
    success: boolean;
    message: string;
    error?: string;
  };
  queuePosition?: number;
  estimatedTime?: string;
  timestamp: string;
}

export interface QueueUpdate {
  applicationId: string;
  status: string;
  queuePosition: number;
  estimatedWaitTime: string;
  isPriority: boolean;
  message: string;
  timestamp: string;
}

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  applicationId?: string;
  jobId?: string;
  timestamp: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: string;
    variant?: 'primary' | 'secondary';
  }>;
}

// =============================================================================
// WEBSOCKET CLIENT CLASS
// =============================================================================

export class WebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting: boolean = false;
  private isAuthenticated: boolean = false;
  private debug: boolean = false;
  private subscriptions: Set<string> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastHeartbeat: Date | null = null;

  constructor(options: WebSocketClientOptions = {}) {
    super();
    this.url = options.url || this.getDefaultWebSocketUrl();
    this.token = options.token || null;
    this.reconnectInterval = options.reconnectInterval || 5000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.debug = options.debug || false;

    // Auto-connect if token is provided
    if (this.token) {
      this.connect();
    }
  }

  // =============================================================================
  // CONNECTION MANAGEMENT
  // =============================================================================

  /**
   * Get default WebSocket URL based on current location
   */
  private getDefaultWebSocketUrl(): string {
    if (typeof window === 'undefined') return '';

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NODE_ENV === 'development'
      ? 'localhost:3001'
      : window.location.host;

    return `${protocol}//${host}/ws`;
  }

  /**
   * Connect to WebSocket server
   */
  public connect(token?: string): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
      this.log('Already connecting...');
      return;
    }

    if (token) {
      this.token = token;
    }

    if (!this.token) {
      this.log('No authentication token provided');
      this.emit('error', new Error('No authentication token'));
      return;
    }

    this.isConnecting = true;
    this.log(`Connecting to ${this.url}`);

    try {
      // Add token as query parameter for initial authentication
      const wsUrl = `${this.url}?token=${encodeURIComponent(this.token)}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

    } catch (error) {
      this.log('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.emit('error', error);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    this.log('Disconnecting...');

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.reconnectAttempts = 0;
    this.isAuthenticated = false;
    this.subscriptions.clear();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  private handleOpen(): void {
    this.log('WebSocket connected');
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.isAuthenticated = true;

    // Start heartbeat
    this.startHeartbeat();

    // Re-subscribe to previous subscriptions
    this.resubscribe();

    this.emit('connected');
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      this.log('Received message:', message);

      switch (message.type) {
        case 'pong':
          this.lastHeartbeat = new Date();
          break;

        case 'application-status-update':
          this.emit('applicationUpdate', message.data as ApplicationUpdate);
          break;

        case 'automation-progress':
          this.emit('automationProgress', message.data);
          break;

        case 'queue-position-update':
          this.emit('queueUpdate', message.data as QueueUpdate);
          break;

        case 'notification':
          this.emit('notification', message.data as NotificationData);
          break;

        case 'job-queued':
        case 'job-queued-from-swipe':
          this.emit('jobQueued', message.data);
          break;

        case 'queue-failed':
          this.emit('queueFailed', message.data);
          break;

        case 'application-completed':
          this.emit('applicationCompleted', message.data);
          break;

        case 'application-failed':
          this.emit('applicationFailed', message.data);
          break;

        case 'subscription-confirmed':
          this.log('Subscription confirmed:', message.data);
          break;

        case 'error':
          this.emit('error', new Error(message.data.message || 'WebSocket error'));
          break;

        default:
          this.log('Unknown message type:', message.type);
      }

    } catch (error) {
      this.log('Failed to parse message:', error, event.data);
    }
  }

  private handleClose(event: CloseEvent): void {
    this.log(`WebSocket closed: ${event.code} - ${event.reason}`);
    this.isConnecting = false;
    this.isAuthenticated = false;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.emit('disconnected', { code: event.code, reason: event.reason });

    // Auto-reconnect if not intentional close
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  private handleError(event: Event): void {
    this.log('WebSocket error:', event);
    this.isConnecting = false;
    this.emit('error', new Error('WebSocket connection error'));
  }

  // =============================================================================
  // RECONNECTION LOGIC
  // =============================================================================

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1), 30000);

    this.log(`Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  // =============================================================================
  // SUBSCRIPTION MANAGEMENT
  // =============================================================================

  /**
   * Subscribe to application updates for a specific user
   */
  public subscribeToApplications(): void {
    this.subscribe('user-applications');
  }

  /**
   * Subscribe to queue updates
   */
  public subscribeToQueue(): void {
    this.subscribe('user-queue');
  }

  /**
   * Subscribe to notifications
   */
  public subscribeToNotifications(): void {
    this.subscribe('user-notifications');
  }

  /**
   * Subscribe to specific application updates
   */
  public subscribeToApplication(applicationId: string): void {
    this.subscribe(`application:${applicationId}`);
  }

  /**
   * Unsubscribe from application updates
   */
  public unsubscribeFromApplication(applicationId: string): void {
    this.unsubscribe(`application:${applicationId}`);
  }

  private subscribe(channel: string): void {
    if (!this.isConnected()) {
      this.log('Cannot subscribe - not connected');
      return;
    }

    this.subscriptions.add(channel);
    this.send({
      type: 'subscribe',
      data: { channel }
    });

    this.log(`Subscribed to ${channel}`);
  }

  private unsubscribe(channel: string): void {
    if (!this.isConnected()) return;

    this.subscriptions.delete(channel);
    this.send({
      type: 'unsubscribe',
      data: { channel }
    });

    this.log(`Unsubscribed from ${channel}`);
  }

  private resubscribe(): void {
    for (const channel of this.subscriptions) {
      this.send({
        type: 'subscribe',
        data: { channel }
      });
    }
  }

  // =============================================================================
  // HEARTBEAT & CONNECTION STATUS
  // =============================================================================

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping' });
      }
    }, 30000); // Send ping every 30 seconds
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN && this.isAuthenticated;
  }

  public getConnectionStatus(): {
    connected: boolean;
    authenticated: boolean;
    reconnectAttempts: number;
    lastHeartbeat: Date | null;
  } {
    return {
      connected: this.ws?.readyState === WebSocket.OPEN || false,
      authenticated: this.isAuthenticated,
      reconnectAttempts: this.reconnectAttempts,
      lastHeartbeat: this.lastHeartbeat,
    };
  }

  // =============================================================================
  // MESSAGE SENDING
  // =============================================================================

  private send(message: any): void {
    if (!this.isConnected()) {
      this.log('Cannot send message - not connected');
      return;
    }

    try {
      this.ws!.send(JSON.stringify(message));
      this.log('Sent message:', message);
    } catch (error) {
      this.log('Failed to send message:', error);
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Update authentication token
   */
  public setToken(token: string): void {
    this.token = token;

    // Reconnect with new token if currently connected
    if (this.ws) {
      this.disconnect();
      this.connect();
    }
  }

  /**
   * Enable/disable debug logging
   */
  public setDebug(enabled: boolean): void {
    this.debug = enabled;
  }

  private log(...args: any[]): void {
    if (this.debug) {
      console.log('[WebSocketClient]', ...args);
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let webSocketClient: WebSocketClient | null = null;

/**
 * Get or create singleton WebSocket client instance
 */
export function getWebSocketClient(options?: WebSocketClientOptions): WebSocketClient {
  if (!webSocketClient) {
    webSocketClient = new WebSocketClient(options);
  }
  return webSocketClient;
}

export default WebSocketClient;