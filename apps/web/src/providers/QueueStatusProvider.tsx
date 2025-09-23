/**
 * @fileoverview Queue Status Provider for Real-time Updates
 * @description WebSocket-based real-time queue status updates
 * @version 1.0.0
 * @author JobSwipe Team
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { ApplicationStatus } from '@/lib/api/queue';

// =============================================================================
// TYPES
// =============================================================================

interface QueueStatusContextType {
  // Connection status
  isConnected: boolean;
  connectionError: string | null;
  
  // Application updates
  applications: Map<string, ApplicationStatus>;
  updateApplication: (application: ApplicationStatus) => void;
  
  // Real-time events
  lastEvent: QueueEvent | null;
  
  // Methods
  subscribeToApplication: (applicationId: string) => void;
  unsubscribeFromApplication: (applicationId: string) => void;
  reconnect: () => void;
}

interface QueueEvent {
  type: 'job-claimed' | 'processing-started' | 'processing-progress' | 'processing-completed' | 'processing-failed';
  applicationId: string;
  data: any;
  timestamp: Date;
}

interface QueueStatusProviderProps {
  children: ReactNode;
  apiUrl?: string;
}

// =============================================================================
// CONTEXT
// =============================================================================

const QueueStatusContext = createContext<QueueStatusContextType | undefined>(undefined);

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

export function QueueStatusProvider({ children, apiUrl }: QueueStatusProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Map<string, ApplicationStatus>>(new Map());
  const [lastEvent, setLastEvent] = useState<QueueEvent | null>(null);
  const [subscribedApplications, setSubscribedApplications] = useState<Set<string>>(new Set());

  const baseUrl = apiUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Initialize WebSocket connection
  const initializeConnection = useCallback(() => {
    try {
      // Get authentication token
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
        : null;

      if (!token) {
        setConnectionError('Authentication required for real-time updates');
        return;
      }

      // Create socket connection with authentication
      const newSocket = io(baseUrl, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        
        // Resubscribe to applications after reconnection
        subscribedApplications.forEach(applicationId => {
          newSocket.emit('subscribe-application', applicationId);
        });
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ WebSocket disconnected:', reason);
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't auto-reconnect
          setConnectionError('Server disconnected the connection');
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        setConnectionError(error.message || 'Connection failed');
        setIsConnected(false);
      });

      // Queue event handlers
      newSocket.on('job-claimed', (data) => {
        const event: QueueEvent = {
          type: 'job-claimed',
          applicationId: data.applicationId,
          data,
          timestamp: new Date(),
        };
        setLastEvent(event);
        updateApplicationStatus(data.applicationId, { status: 'processing' });
      });

      newSocket.on('processing-started', (data) => {
        const event: QueueEvent = {
          type: 'processing-started',
          applicationId: data.applicationId,
          data,
          timestamp: new Date(),
        };
        setLastEvent(event);
        updateApplicationStatus(data.applicationId, { 
          status: 'processing',
          startedAt: new Date().toISOString(),
        });
      });

      newSocket.on('processing-progress', (data) => {
        const event: QueueEvent = {
          type: 'processing-progress',
          applicationId: data.applicationId,
          data,
          timestamp: new Date(),
        };
        setLastEvent(event);
        updateApplicationStatus(data.applicationId, {
          status: 'processing',
          ...data.progress,
        });
      });

      newSocket.on('processing-completed', (data) => {
        const event: QueueEvent = {
          type: 'processing-completed',
          applicationId: data.applicationId,
          data,
          timestamp: new Date(),
        };
        setLastEvent(event);
        updateApplicationStatus(data.applicationId, {
          status: 'completed',
          success: data.success,
          completedAt: new Date().toISOString(),
        });
      });

      newSocket.on('processing-failed', (data) => {
        const event: QueueEvent = {
          type: 'processing-failed',
          applicationId: data.applicationId,
          data,
          timestamp: new Date(),
        };
        setLastEvent(event);
        updateApplicationStatus(data.applicationId, {
          status: 'failed',
          success: false,
          errorMessage: data.errorMessage,
          completedAt: new Date().toISOString(),
        });
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error);
      setConnectionError(error instanceof Error ? error.message : 'Connection initialization failed');
    }
  }, [baseUrl, subscribedApplications]);

  // Update application status
  const updateApplicationStatus = useCallback((applicationId: string, updates: Partial<ApplicationStatus>) => {
    setApplications(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(applicationId);
      if (existing) {
        newMap.set(applicationId, { ...existing, ...updates });
      }
      return newMap;
    });
  }, []);

  // Update application (external updates)
  const updateApplication = useCallback((application: ApplicationStatus) => {
    setApplications(prev => {
      const newMap = new Map(prev);
      newMap.set(application.id, application);
      return newMap;
    });
  }, []);

  // Subscribe to application updates
  const subscribeToApplication = useCallback((applicationId: string) => {
    if (!socket || !isConnected) return;

    socket.emit('subscribe-application', applicationId);
    setSubscribedApplications(prev => {
      const newSet = new Set(prev);
      newSet.add(applicationId);
      return newSet;
    });
  }, [socket, isConnected]);

  // Unsubscribe from application updates
  const unsubscribeFromApplication = useCallback((applicationId: string) => {
    if (!socket) return;

    socket.emit('unsubscribe-application', applicationId);
    setSubscribedApplications(prev => {
      const newSet = new Set(prev);
      newSet.delete(applicationId);
      return newSet;
    });
  }, [socket]);

  // Reconnect to WebSocket
  const reconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }
    setConnectionError(null);
    initializeConnection();
  }, [socket, initializeConnection]);

  // Initialize connection on mount
  useEffect(() => {
    initializeConnection();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [initializeConnection]);

  // Context value
  const contextValue: QueueStatusContextType = {
    isConnected,
    connectionError,
    applications,
    updateApplication,
    lastEvent,
    subscribeToApplication,
    unsubscribeFromApplication,
    reconnect,
  };

  return (
    <QueueStatusContext.Provider value={contextValue}>
      {children}
    </QueueStatusContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useQueueStatus(): QueueStatusContextType {
  const context = useContext(QueueStatusContext);
  if (context === undefined) {
    throw new Error('useQueueStatus must be used within a QueueStatusProvider');
  }
  return context;
}

// =============================================================================
// UTILITIES
// =============================================================================

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'text-yellow-600 bg-yellow-100 border-yellow-200',
    queued: 'text-blue-600 bg-blue-100 border-blue-200',
    processing: 'text-purple-600 bg-purple-100 border-purple-200',
    completed: 'text-green-600 bg-green-100 border-green-200',
    failed: 'text-red-600 bg-red-100 border-red-200',
    cancelled: 'text-gray-600 bg-gray-100 border-gray-200',
  };
  
  return colorMap[status] || 'text-gray-600 bg-gray-100 border-gray-200';
}

export function getStatusIcon(status: string): string {
  const iconMap: Record<string, string> = {
    pending: '⏳',
    queued: '📋',
    processing: '⚡',
    completed: '✅',
    failed: '❌',
    cancelled: '🚫',
  };
  
  return iconMap[status] || '❓';
}

export function formatStatusMessage(event: QueueEvent): string {
  switch (event.type) {
    case 'job-claimed':
      return `Application claimed by automation system`;
    case 'processing-started':
      return `Started processing job application`;
    case 'processing-progress':
      return event.data.message || 'Processing application...';
    case 'processing-completed':
      return event.data.success ? 'Application submitted successfully!' : 'Application processing completed';
    case 'processing-failed':
      return `Application failed: ${event.data.errorMessage || 'Unknown error'}`;
    default:
      return 'Status updated';
  }
}