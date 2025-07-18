/**
 * @fileoverview Desktop Authentication Portal
 * @description Secure web-to-desktop token exchange interface
 * @version 1.0.0
 * @author JobSwipe Team
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { QrCode, Smartphone, Monitor, Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

// =============================================================================
// INTERFACES
// =============================================================================

interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  platform: string;
  deviceType: string;
  appVersion?: string;
  osVersion?: string;
}

interface TokenExchangeResult {
  success: boolean;
  exchangeToken: string;
  expiresAt: string;
  deviceId: string;
  instructions: {
    step1: string;
    step2: string;
    step3: string;
    warning: string;
  };
}

// =============================================================================
// DESKTOP AUTH PORTAL COMPONENT
// =============================================================================

export default function DesktopAuthPortal() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const searchParams = useSearchParams();
  
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [exchangeResult, setExchangeResult] = useState<TokenExchangeResult | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Extract device info from URL parameters
  useEffect(() => {
    const deviceId = searchParams.get('deviceId');
    const deviceName = searchParams.get('deviceName');
    const platform = searchParams.get('platform');
    const deviceType = searchParams.get('deviceType');
    const appVersion = searchParams.get('appVersion');
    const osVersion = searchParams.get('osVersion');

    if (deviceId && deviceName && platform && deviceType) {
      setDeviceInfo({
        deviceId,
        deviceName,
        platform,
        deviceType,
        appVersion: appVersion || undefined,
        osVersion: osVersion || undefined,
      });
    }
  }, [searchParams]);

  // Countdown timer for token expiry
  useEffect(() => {
    if (exchangeResult && !isCompleted) {
      const expiryTime = new Date(exchangeResult.expiresAt).getTime();
      
      const timer = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, expiryTime - now);
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          setError('Token exchange has expired. Please try again.');
          setExchangeResult(null);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [exchangeResult, isCompleted]);

  // Check exchange completion status
  useEffect(() => {
    if (exchangeResult && !isCompleted) {
      const checkCompletion = async () => {
        try {
          const response = await fetch(`/api/auth/token-exchange/verify/${exchangeResult.exchangeToken}`);
          const data = await response.json();
          
          if (!data.valid) {
            setIsCompleted(true);
            setExchangeResult(null);
            setError(null);
          }
        } catch (error) {
          console.error('Error checking exchange status:', error);
        }
      };

      const interval = setInterval(checkCompletion, 2000);
      return () => clearInterval(interval);
    }
  }, [exchangeResult, isCompleted]);

  /**
   * Initiate token exchange
   */
  const handleInitiateExchange = async () => {
    if (!deviceInfo || !isAuthenticated) return;

    setIsInitiating(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/token-exchange/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(deviceInfo),
      });

      const data = await response.json();

      if (data.success) {
        setExchangeResult(data);
        setIsCompleted(false);
      } else {
        setError(data.error || 'Failed to initiate token exchange');
      }
    } catch (error) {
      console.error('Token exchange initiation failed:', error);
      setError('Failed to connect to authentication service');
    } finally {
      setIsInitiating(false);
    }
  };

  /**
   * Format time remaining
   */
  const formatTimeRemaining = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  /**
   * Get platform icon
   */
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'darwin':
      case 'macos':
        return '🍎';
      case 'win32':
      case 'windows':
        return '🪟';
      case 'linux':
        return '🐧';
      default:
        return '💻';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please sign in to your JobSwipe account to authenticate your desktop application.
          </p>
          <Button
            onClick={() => window.location.href = '/auth/signin'}
            className="w-full"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // No device info
  if (!deviceInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Invalid Request
          </h1>
          <p className="text-gray-600">
            This page can only be accessed from the JobSwipe desktop application.
          </p>
        </div>
      </div>
    );
  }

  // Exchange completed
  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Your desktop application has been successfully authenticated. You can now close this window.
          </p>
          <Button
            onClick={() => window.close()}
            className="w-full"
          >
            Close Window
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-8 w-8 text-blue-600" />
              <span className="text-2xl">⟶</span>
              <Monitor className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Authenticate Desktop App
          </h1>
          <p className="text-gray-600 mt-2">
            Connect your JobSwipe desktop application to your account
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Device Info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{getPlatformIcon(deviceInfo.platform)}</div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {deviceInfo.deviceName}
                </h3>
                <p className="text-sm text-gray-500">
                  {deviceInfo.platform} • {deviceInfo.deviceType}
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Signed in as {user?.name || user?.email}
                </p>
                <p className="text-xs text-gray-500">
                  This device will be linked to your account
                </p>
              </div>
            </div>
          </div>

          {/* Exchange Status */}
          <div className="px-6 py-6">
            {!exchangeResult && !error && (
              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  Click the button below to authenticate your desktop application. 
                  This will create a secure connection between your web session and desktop app.
                </p>
                <Button
                  onClick={handleInitiateExchange}
                  disabled={isInitiating}
                  className="w-full"
                >
                  {isInitiating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    'Authenticate Desktop App'
                  )}
                </Button>
              </div>
            )}

            {exchangeResult && (
              <div className="text-center">
                <div className="mb-6">
                  <QrCode className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Waiting for Desktop App
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Your desktop application should automatically detect this authentication request.
                  </p>
                  
                  {timeRemaining > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-800">
                        <strong>Time remaining:</strong> {formatTimeRemaining(timeRemaining)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-gray-900 mb-3">Instructions:</h4>
                  <ol className="text-sm text-gray-600 space-y-2">
                    <li>1. {exchangeResult.instructions.step1}</li>
                    <li>2. {exchangeResult.instructions.step2}</li>
                    <li>3. {exchangeResult.instructions.step3}</li>
                  </ol>
                  <div className="mt-3 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                    <p className="text-xs text-yellow-800">
                      ⚠️ {exchangeResult.instructions.warning}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setExchangeResult(null);
                    setError(null);
                  }}
                  variant="outline"
                  className="w-full mt-4"
                >
                  Cancel
                </Button>
              </div>
            )}

            {error && (
              <div className="text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Authentication Failed
                </h3>
                <p className="text-sm text-red-600 mb-6">{error}</p>
                <Button
                  onClick={() => {
                    setError(null);
                    setExchangeResult(null);
                  }}
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <div className="flex">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Security Notice</h4>
              <p className="text-xs text-blue-700 mt-1">
                This authentication link is temporary and secure. It will expire automatically 
                and can only be used once by your verified desktop application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}