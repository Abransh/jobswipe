'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  MapPin, 
  Clock, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Trash2,
  Info,
  RefreshCw,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatTimeAgo } from '@/lib/utils';

interface SessionInfo {
  id: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  deviceName: string;
  platform: string;
  browser: string;
  ipAddress: string;
  location: {
    city: string;
    country: string;
    countryCode: string;
  };
  isCurrentSession: boolean;
  lastActivity: string;
  createdAt: string;
  userAgent: string;
  trusted: boolean;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'suspicious' | 'blocked' | 'password_change' | 'mfa_change';
  description: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
}

interface SessionManagerProps {
  userId: string;
}

export function SessionManager({ userId }: SessionManagerProps) {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [terminatingSession, setTerminatingSession] = useState<string | null>(null);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionInfo | null>(null);

  const router = useRouter();

  // Fetch sessions and security events
  useEffect(() => {
    fetchSessions();
    fetchSecurityEvents();
  }, [userId]);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/auth/sessions', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setSessions(data.sessions);
      } else {
        setError(data.error || 'Failed to fetch sessions');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSecurityEvents = async () => {
    try {
      const response = await fetch('/api/auth/security-events', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setSecurityEvents(data.events);
      }
    } catch (error) {
      console.error('Failed to fetch security events:', error);
    }
  };

  const terminateSession = async (sessionId: string) => {
    setTerminatingSession(sessionId);
    setError(null);

    try {
      const response = await fetch('/api/auth/sessions/terminate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (data.success) {
        setSessions(prev => prev.filter(session => session.id !== sessionId));
      } else {
        setError(data.error || 'Failed to terminate session');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setTerminatingSession(null);
    }
  };

  const terminateAllOtherSessions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/sessions/terminate-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setSessions(prev => prev.filter(session => session.isCurrentSession));
      } else {
        setError(data.error || 'Failed to terminate sessions');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const trustDevice = async (sessionId: string) => {
    try {
      const response = await fetch('/api/auth/sessions/trust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (data.success) {
        setSessions(prev => prev.map(session => 
          session.id === sessionId 
            ? { ...session, trusted: true }
            : session
        ));
      }
    } catch (error) {
      console.error('Failed to trust device:', error);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop':
        return Monitor;
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Globe;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login':
        return CheckCircle;
      case 'logout':
        return XCircle;
      case 'suspicious':
      case 'blocked':
        return AlertTriangle;
      case 'password_change':
      case 'mfa_change':
        return Shield;
      default:
        return Info;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Session Management</h2>
          <p className="text-gray-600 mt-1">
            Monitor and manage your active sessions across all devices
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchSessions}
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Active Sessions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Active Sessions</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
              </span>
              {sessions.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={terminateAllOtherSessions}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Terminate Others
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {sessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session.deviceType);
            
            return (
              <div key={session.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <DeviceIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {session.deviceName}
                        </h4>
                        {session.isCurrentSession && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Current
                          </span>
                        )}
                        {session.trusted && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Trusted
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span>{session.platform} • {session.browser}</span>
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {session.location.city}, {session.location.country}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span>IP: {session.ipAddress}</span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Last active: {formatTimeAgo(session.lastActivity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!session.trusted && !session.isCurrentSession && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => trustDevice(session.id)}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Trust
                      </Button>
                    )}
                    {!session.isCurrentSession && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => terminateSession(session.id)}
                        disabled={terminatingSession === session.id}
                      >
                        {terminatingSession === session.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSession(session)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Events */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Security Events</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllEvents(!showAllEvents)}
            >
              {showAllEvents ? 'Show Recent' : 'Show All'}
            </Button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {(showAllEvents ? securityEvents : securityEvents.slice(0, 5)).map((event) => {
            const EventIcon = getEventIcon(event.type);
            
            return (
              <div key={event.id} className="px-6 py-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <EventIcon className={`h-5 w-5 mt-0.5 ${getSeverityColor(event.severity)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {event.description}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(event.timestamp)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-xs text-gray-500 space-x-4">
                      <span>IP: {event.ipAddress}</span>
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">Security Recommendations</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Regularly review and terminate unused sessions</li>
              <li>• Enable MFA for additional security</li>
              <li>• Only mark trusted devices as trusted</li>
              <li>• Report suspicious activity immediately</li>
              <li>• Use different passwords for different accounts</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Session Details
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Device</label>
                <p className="text-sm text-gray-900">{selectedSession.deviceName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Platform</label>
                <p className="text-sm text-gray-900">{selectedSession.platform}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Browser</label>
                <p className="text-sm text-gray-900">{selectedSession.browser}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">IP Address</label>
                <p className="text-sm text-gray-900">{selectedSession.ipAddress}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Location</label>
                <p className="text-sm text-gray-900">
                  {selectedSession.location.city}, {selectedSession.location.country}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">User Agent</label>
                <p className="text-xs text-gray-600 font-mono break-all">
                  {selectedSession.userAgent}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Created</label>
                <p className="text-sm text-gray-900">{formatTimeAgo(selectedSession.createdAt)}</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSelectedSession(null)}>
                Close
              </Button>
              {!selectedSession.isCurrentSession && (
                <Button 
                  variant="destructive"
                  onClick={() => {
                    terminateSession(selectedSession.id);
                    setSelectedSession(null);
                  }}
                >
                  Terminate Session
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}