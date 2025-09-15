/**
 * @fileoverview WebSocket Service for JobSwipe Real-time Updates
 * @description Handles real-time communication between server, web clients, and desktop apps
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { EventEmitter } from 'events';
import { FastifyInstance } from 'fastify';
import { WebSocket, WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';
import { IncomingMessage } from 'http';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export interface WebSocketClient {
  id: string;
  userId: string;
  deviceType: 'web' | 'desktop' | 'mobile';
  deviceId?: string;
  connectionId: string;
  socket: WebSocket;
  connectedAt: Date;
  lastPingAt: Date;
  authenticated: boolean;
  subscriptions: Set<string>;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
  };
}

export interface WebSocketMessage {
  type: string;
  event: string;
  data: any;
  messageId: string;
  timestamp: Date;
  userId?: string;
  targetUsers?: string[];
  targetDevices?: string[];
}

export interface ApplicationStatusUpdate {
  applicationId: string;
  jobId: string;
  userId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
  currentStep?: string;
  message?: string;
  executionMode: 'server' | 'desktop';
  result?: any;
  error?: string;
  timestamp: Date;
}

export interface QueuePositionUpdate {
  userId: string;
  totalInQueue: number;
  userPosition: number;
  estimatedWaitTime: number;
  processingCount: number;
  timestamp: Date;
}

export interface AutomationProgressUpdate {
  applicationId: string;
  executionId: string;
  userId: string;
  progress: number;
  currentStep: string;
  message: string;
  jobTitle: string;
  company: string;
  timestamp: Date;
}

// =============================================================================
// WEBSOCKET SERVICE
// =============================================================================

export class WebSocketService extends EventEmitter {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocketClient> = new Map();
  private userConnections: Map<string, Set<string>> = new Map(); // userId -> connectionIds
  private fastify: FastifyInstance;
  private pingInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  private config = {
    port: parseInt(process.env.WEBSOCKET_PORT || '3002'),
    pingInterval: 30000, // 30 seconds
    connectionTimeout: 60000, // 60 seconds
    maxConnections: 1000,
    enableCompression: true,
    enablePerMessageDeflate: true,
  };

  private stats = {
    totalConnections: 0,
    activeConnections: 0,
    messagesSent: 0,
    messagesReceived: 0,
    authenticationFailures: 0,
    startedAt: new Date(),
  };

  constructor(fastify: FastifyInstance) {
    super();
    this.fastify = fastify;
    console.log('WebSocketService initialized');
  }

  // =============================================================================
  // SERVICE CONTROL
  // =============================================================================

  /**
   * Start the WebSocket server
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('WebSocket service already running');
      return;
    }

    try {
      console.log(`Starting WebSocket server on port ${this.config.port}...`);

      this.wss = new WebSocketServer({
        port: this.config.port,
        perMessageDeflate: this.config.enablePerMessageDeflate,
        maxPayload: 1024 * 1024, // 1MB max message size
      });

      this.setupWebSocketServer();
      this.startPingInterval();

      this.isRunning = true;
      this.stats.startedAt = new Date();

      this.fastify.log.info('WebSocket server started successfully', {
        port: this.config.port,
        compression: this.config.enableCompression,
      });

      this.emit('server-started', {
        port: this.config.port,
        timestamp: new Date(),
      });

    } catch (error) {
      this.fastify.log.error('Failed to start WebSocket server:', error);
      throw error;
    }
  }

  /**
   * Stop the WebSocket server
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('WebSocket service not running');
      return;
    }

    console.log('Stopping WebSocket server...');
    this.isRunning = false;

    // Stop ping interval
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    // Close all client connections
    for (const client of this.clients.values()) {
      this.disconnectClient(client.connectionId, 'Server shutdown');
    }

    // Close WebSocket server
    if (this.wss) {
      this.wss.close(() => {
        console.log('✅ WebSocket server closed');
      });
      this.wss = null;
    }

    this.emit('server-stopped', {
      timestamp: new Date(),
    });

    console.log('WebSocket service stopped');
  }

  // =============================================================================
  // WEBSOCKET SERVER SETUP
  // =============================================================================

  /**
   * Set up WebSocket server event handlers
   */
  private setupWebSocketServer(): void {
    if (!this.wss) return;

    this.wss.on('connection', (socket: WebSocket, request: IncomingMessage) => {
      this.handleNewConnection(socket, request);
    });

    this.wss.on('error', (error) => {
      this.fastify.log.error('WebSocket server error:', error);
      this.emit('server-error', error);
    });

    console.log('WebSocket server event handlers set up');
  }

  /**
   * Handle new WebSocket connection
   */
  private async handleNewConnection(socket: WebSocket, request: IncomingMessage): Promise<void> {
    const connectionId = randomUUID();
    const ipAddress = request.socket.remoteAddress;
    const userAgent = request.headers['user-agent'];

    console.log(`New WebSocket connection: ${connectionId} from ${ipAddress}`);

    // Check connection limits
    if (this.clients.size >= this.config.maxConnections) {
      console.log(`Connection limit reached, rejecting connection: ${connectionId}`);
      socket.close(1013, 'Server overloaded');
      return;
    }

    // Create client object
    const client: WebSocketClient = {
      id: connectionId,
      userId: '', // Will be set during authentication
      deviceType: 'web', // Will be determined during authentication
      connectionId,
      socket,
      connectedAt: new Date(),
      lastPingAt: new Date(),
      authenticated: false,
      subscriptions: new Set(),
      metadata: {
        userAgent,
        ipAddress,
      },
    };

    // Store client
    this.clients.set(connectionId, client);
    this.stats.totalConnections++;
    this.stats.activeConnections++;

    // Set up socket event handlers
    this.setupSocketHandlers(client);

    // Send welcome message
    this.sendToClient(client, {
      type: 'system',
      event: 'connection-established',
      data: {
        connectionId,
        serverTime: new Date(),
        requiresAuthentication: true,
      },
      messageId: randomUUID(),
      timestamp: new Date(),
    });

    // Set authentication timeout
    setTimeout(() => {
      if (!client.authenticated) {
        console.log(`Authentication timeout for connection: ${connectionId}`);
        this.disconnectClient(connectionId, 'Authentication timeout');
      }
    }, this.config.connectionTimeout);

    this.emit('client-connected', {
      connectionId,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  }

  /**
   * Set up event handlers for a WebSocket connection
   */
  private setupSocketHandlers(client: WebSocketClient): void {
    const { socket, connectionId } = client;

    // Handle incoming messages
    socket.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        await this.handleIncomingMessage(client, message);
        this.stats.messagesReceived++;
      } catch (error) {
        this.fastify.log.error(`Error handling message from ${connectionId}:`, error);
        this.sendErrorToClient(client, 'Invalid message format');
      }
    });

    // Handle connection close
    socket.on('close', (code, reason) => {
      console.log(`WebSocket connection closed: ${connectionId}, code: ${code}, reason: ${reason}`);
      this.removeClient(connectionId);
    });

    // Handle connection errors
    socket.on('error', (error) => {
      this.fastify.log.error(`WebSocket connection error for ${connectionId}:`, error);
      this.removeClient(connectionId);
    });

    // Handle pong responses
    socket.on('pong', () => {
      client.lastPingAt = new Date();
    });
  }

  // =============================================================================
  // MESSAGE HANDLING
  // =============================================================================

  /**
   * Handle incoming message from client
   */
  private async handleIncomingMessage(client: WebSocketClient, message: any): Promise<void> {
    const { type, event, data } = message;

    this.fastify.log.debug('Received WebSocket message', {
      connectionId: client.connectionId,
      type,
      event,
      authenticated: client.authenticated,
    });

    switch (type) {
      case 'auth':
        await this.handleAuthenticationMessage(client, data);
        break;

      case 'subscribe':
        this.handleSubscriptionMessage(client, data);
        break;

      case 'unsubscribe':
        this.handleUnsubscriptionMessage(client, data);
        break;

      case 'ping':
        this.handlePingMessage(client);
        break;

      case 'request':
        await this.handleRequestMessage(client, event, data);
        break;

      default:
        this.sendErrorToClient(client, `Unknown message type: ${type}`);
    }
  }

  /**
   * Handle authentication message
   */
  private async handleAuthenticationMessage(client: WebSocketClient, data: any): Promise<void> {
    try {
      const { token, deviceType, deviceId } = data;

      if (!token) {
        this.sendAuthenticationError(client, 'Authentication token required');
        return;
      }

      // Verify JWT token
      if (this.fastify.jwtService) {
        const verification = await this.fastify.jwtService.verifyToken(token);
        if (!verification.valid || !verification.payload) {
          this.sendAuthenticationError(client, 'Invalid authentication token');
          return;
        }

        // Update client with user information
        client.userId = verification.payload.userId;
        client.deviceType = deviceType || 'web';
        client.deviceId = deviceId;
        client.authenticated = true;

        // Add to user connections map
        if (!this.userConnections.has(client.userId)) {
          this.userConnections.set(client.userId, new Set());
        }
        this.userConnections.get(client.userId)!.add(client.connectionId);

        // Subscribe to user-specific channels by default
        client.subscriptions.add(`user:${client.userId}`);
        client.subscriptions.add(`device:${client.deviceType}`);

        this.sendToClient(client, {
          type: 'auth',
          event: 'authentication-success',
          data: {
            userId: client.userId,
            deviceType: client.deviceType,
            subscriptions: Array.from(client.subscriptions),
          },
          messageId: randomUUID(),
          timestamp: new Date(),
        });

        this.fastify.log.info('WebSocket client authenticated', {
          connectionId: client.connectionId,
          userId: client.userId,
          deviceType: client.deviceType,
        });

        this.emit('client-authenticated', {
          connectionId: client.connectionId,
          userId: client.userId,
          deviceType: client.deviceType,
          timestamp: new Date(),
        });

      } else {
        this.sendAuthenticationError(client, 'Authentication service not available');
      }

    } catch (error) {
      this.fastify.log.error('Authentication error:', error);
      this.sendAuthenticationError(client, 'Authentication failed');
    }
  }

  /**
   * Handle subscription message
   */
  private handleSubscriptionMessage(client: WebSocketClient, data: any): void {
    if (!client.authenticated) {
      this.sendErrorToClient(client, 'Authentication required');
      return;
    }

    const { channels } = data;
    if (!Array.isArray(channels)) {
      this.sendErrorToClient(client, 'Channels must be an array');
      return;
    }

    for (const channel of channels) {
      if (this.isValidSubscription(client, channel)) {
        client.subscriptions.add(channel);
      }
    }

    this.sendToClient(client, {
      type: 'subscribe',
      event: 'subscription-updated',
      data: {
        subscriptions: Array.from(client.subscriptions),
      },
      messageId: randomUUID(),
      timestamp: new Date(),
    });
  }

  /**
   * Handle unsubscription message
   */
  private handleUnsubscriptionMessage(client: WebSocketClient, data: any): void {
    if (!client.authenticated) {
      this.sendErrorToClient(client, 'Authentication required');
      return;
    }

    const { channels } = data;
    if (!Array.isArray(channels)) {
      this.sendErrorToClient(client, 'Channels must be an array');
      return;
    }

    for (const channel of channels) {
      client.subscriptions.delete(channel);
    }

    this.sendToClient(client, {
      type: 'unsubscribe',
      event: 'subscription-updated',
      data: {
        subscriptions: Array.from(client.subscriptions),
      },
      messageId: randomUUID(),
      timestamp: new Date(),
    });
  }

  /**
   * Handle ping message
   */
  private handlePingMessage(client: WebSocketClient): void {
    this.sendToClient(client, {
      type: 'pong',
      event: 'pong',
      data: {
        serverTime: new Date(),
      },
      messageId: randomUUID(),
      timestamp: new Date(),
    });
  }

  /**
   * Handle request message (for real-time data requests)
   */
  private async handleRequestMessage(client: WebSocketClient, event: string, data: any): Promise<void> {
    if (!client.authenticated) {
      this.sendErrorToClient(client, 'Authentication required');
      return;
    }

    switch (event) {
      case 'get-application-status':
        await this.handleGetApplicationStatus(client, data);
        break;

      case 'get-queue-position':
        await this.handleGetQueuePosition(client, data);
        break;

      default:
        this.sendErrorToClient(client, `Unknown request event: ${event}`);
    }
  }

  // =============================================================================
  // REAL-TIME UPDATE METHODS
  // =============================================================================

  /**
   * Send application status update to specific user
   */
  async sendApplicationStatusUpdate(update: ApplicationStatusUpdate): Promise<void> {
    const message: WebSocketMessage = {
      type: 'update',
      event: 'application-status',
      data: update,
      messageId: randomUUID(),
      timestamp: new Date(),
      userId: update.userId,
    };

    await this.sendToUser(update.userId, message);

    this.fastify.log.debug('Application status update sent', {
      applicationId: update.applicationId,
      userId: update.userId,
      status: update.status,
    });
  }

  /**
   * Send automation progress update to specific user
   */
  async sendAutomationProgressUpdate(update: AutomationProgressUpdate): Promise<void> {
    const message: WebSocketMessage = {
      type: 'update',
      event: 'automation-progress',
      data: update,
      messageId: randomUUID(),
      timestamp: new Date(),
      userId: update.userId,
    };

    await this.sendToUser(update.userId, message);

    this.fastify.log.debug('Automation progress update sent', {
      applicationId: update.applicationId,
      userId: update.userId,
      progress: update.progress,
    });
  }

  /**
   * Send queue position update to specific user
   */
  async sendQueuePositionUpdate(update: QueuePositionUpdate): Promise<void> {
    const message: WebSocketMessage = {
      type: 'update',
      event: 'queue-position',
      data: update,
      messageId: randomUUID(),
      timestamp: new Date(),
      userId: update.userId,
    };

    await this.sendToUser(update.userId, message);
  }

  /**
   * Send notification to specific user
   */
  async sendNotification(userId: string, notification: {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    data?: any;
  }): Promise<void> {
    const message: WebSocketMessage = {
      type: 'notification',
      event: notification.type,
      data: {
        ...notification,
        id: randomUUID(),
      },
      messageId: randomUUID(),
      timestamp: new Date(),
      userId,
    };

    await this.sendToUser(userId, message);
  }

  /**
   * Broadcast message to all connected clients
   */
  async broadcast(message: WebSocketMessage): Promise<void> {
    const authenticatedClients = Array.from(this.clients.values())
      .filter(client => client.authenticated);

    for (const client of authenticatedClients) {
      this.sendToClient(client, message);
    }

    this.fastify.log.debug('Message broadcasted to all clients', {
      clientCount: authenticatedClients.length,
      messageType: message.type,
      event: message.event,
    });
  }

  /**
   * Send message to specific user (all their connections)
   */
  async sendToUser(userId: string, message: WebSocketMessage): Promise<void> {
    const userConnections = this.userConnections.get(userId);
    if (!userConnections || userConnections.size === 0) {
      this.fastify.log.debug('No active connections for user', { userId });
      return;
    }

    for (const connectionId of userConnections) {
      const client = this.clients.get(connectionId);
      if (client && client.authenticated) {
        this.sendToClient(client, message);
      }
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Send message to specific client
   */
  private sendToClient(client: WebSocketClient, message: WebSocketMessage): void {
    if (client.socket.readyState === WebSocket.OPEN) {
      try {
        const messageStr = JSON.stringify(message);
        client.socket.send(messageStr);
        this.stats.messagesSent++;
      } catch (error) {
        this.fastify.log.error(`Failed to send message to client ${client.connectionId}:`, error);
        this.removeClient(client.connectionId);
      }
    }
  }

  /**
   * Send error message to client
   */
  private sendErrorToClient(client: WebSocketClient, error: string): void {
    this.sendToClient(client, {
      type: 'error',
      event: 'error',
      data: { error },
      messageId: randomUUID(),
      timestamp: new Date(),
    });
  }

  /**
   * Send authentication error to client
   */
  private sendAuthenticationError(client: WebSocketClient, error: string): void {
    this.stats.authenticationFailures++;
    this.sendToClient(client, {
      type: 'auth',
      event: 'authentication-error',
      data: { error },
      messageId: randomUUID(),
      timestamp: new Date(),
    });

    // Disconnect client after authentication error
    setTimeout(() => {
      this.disconnectClient(client.connectionId, 'Authentication failed');
    }, 1000);
  }

  /**
   * Check if subscription is valid for client
   */
  private isValidSubscription(client: WebSocketClient, channel: string): boolean {
    // Users can only subscribe to their own channels
    if (channel.startsWith(`user:${client.userId}`)) {
      return true;
    }

    // Device-specific channels
    if (channel === `device:${client.deviceType}`) {
      return true;
    }

    // General channels
    const allowedChannels = ['general', 'system', 'announcements'];
    if (allowedChannels.includes(channel)) {
      return true;
    }

    return false;
  }

  /**
   * Disconnect client
   */
  private disconnectClient(connectionId: string, reason: string): void {
    const client = this.clients.get(connectionId);
    if (client) {
      console.log(`Disconnecting client ${connectionId}: ${reason}`);
      client.socket.close(1000, reason);
      this.removeClient(connectionId);
    }
  }

  /**
   * Remove client from tracking
   */
  private removeClient(connectionId: string): void {
    const client = this.clients.get(connectionId);
    if (client) {
      // Remove from user connections
      if (client.userId && this.userConnections.has(client.userId)) {
        this.userConnections.get(client.userId)!.delete(connectionId);
        if (this.userConnections.get(client.userId)!.size === 0) {
          this.userConnections.delete(client.userId);
        }
      }

      // Remove from clients map
      this.clients.delete(connectionId);
      this.stats.activeConnections--;

      this.emit('client-disconnected', {
        connectionId,
        userId: client.userId,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Start ping interval to keep connections alive
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      const now = new Date();
      for (const client of this.clients.values()) {
        const timeSinceLastPing = now.getTime() - client.lastPingAt.getTime();

        if (timeSinceLastPing > this.config.pingInterval * 2) {
          // Client hasn't responded to ping, disconnect
          console.log(`Client ${client.connectionId} ping timeout, disconnecting`);
          this.disconnectClient(client.connectionId, 'Ping timeout');
        } else if (timeSinceLastPing > this.config.pingInterval) {
          // Send ping
          if (client.socket.readyState === WebSocket.OPEN) {
            client.socket.ping();
          }
        }
      }
    }, this.config.pingInterval);
  }

  /**
   * Handle get application status request
   */
  private async handleGetApplicationStatus(client: WebSocketClient, data: any): Promise<void> {
    const { applicationId } = data;

    try {
      // Get application status from database
      const application = await this.fastify.db.applicationQueue.findFirst({
        where: {
          id: applicationId,
          userId: client.userId,
        },
        include: {
          jobPosting: {
            include: { company: true },
          },
        },
      });

      if (!application) {
        this.sendErrorToClient(client, 'Application not found');
        return;
      }

      this.sendToClient(client, {
        type: 'response',
        event: 'application-status',
        data: {
          applicationId,
          status: application.status.toLowerCase(),
          progress: 0, // Would be determined from execution data
          currentStep: 'Unknown',
          message: application.errorMessage || 'Processing',
          timestamp: new Date(),
        },
        messageId: randomUUID(),
        timestamp: new Date(),
      });

    } catch (error) {
      this.fastify.log.error('Error getting application status:', error);
      this.sendErrorToClient(client, 'Failed to get application status');
    }
  }

  /**
   * Handle get queue position request
   */
  private async handleGetQueuePosition(client: WebSocketClient, data: any): Promise<void> {
    try {
      // Get queue statistics
      const totalInQueue = await this.fastify.db.applicationQueue.count({
        where: { status: 'PENDING' },
      });

      const userPosition = await this.fastify.db.applicationQueue.count({
        where: {
          userId: client.userId,
          status: 'PENDING',
        },
      });

      const processingCount = await this.fastify.db.applicationQueue.count({
        where: { status: 'PROCESSING' },
      });

      this.sendToClient(client, {
        type: 'response',
        event: 'queue-position',
        data: {
          totalInQueue,
          userPosition,
          estimatedWaitTime: userPosition * 2 * 60 * 1000, // 2 minutes per application
          processingCount,
          timestamp: new Date(),
        },
        messageId: randomUUID(),
        timestamp: new Date(),
      });

    } catch (error) {
      this.fastify.log.error('Error getting queue position:', error);
      this.sendErrorToClient(client, 'Failed to get queue position');
    }
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      ...this.stats,
      activeConnections: this.clients.size,
      authenticatedConnections: Array.from(this.clients.values()).filter(c => c.authenticated).length,
      uniqueUsers: this.userConnections.size,
      uptime: Date.now() - this.stats.startedAt.getTime(),
    };
  }

  /**
   * Get connected clients info
   */
  getClients() {
    return Array.from(this.clients.values()).map(client => ({
      connectionId: client.connectionId,
      userId: client.userId,
      deviceType: client.deviceType,
      authenticated: client.authenticated,
      connectedAt: client.connectedAt,
      subscriptions: Array.from(client.subscriptions),
    }));
  }

  /**
   * Check if service is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    console.log('Cleaning up WebSocketService...');
    this.stop();
    this.removeAllListeners();
  }
}

export default WebSocketService;