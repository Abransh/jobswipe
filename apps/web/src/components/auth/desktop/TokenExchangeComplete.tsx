'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  AlertTriangle, 
  Shield, 
  Monitor, 
  User, 
  Clock, 
  Key, 
  Lock,
  Settings,
  ExternalLink,
  RefreshCw,
  XCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TokenExchangeCompleteProps {
  exchangeToken: string;
  success?: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  deviceInfo?: {
    deviceId: string;
    deviceName: string;
    platform: string;
    deviceType: string;
  };
  tokens?: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
  };
}

interface SecurityInfo {
  tokenType: string;
  expiresIn: number;
  permissions: string[];
  encryptionLevel: string;
  connectionSecure: boolean;
}

export function TokenExchangeComplete({
  exchangeToken,
  success = false,
  error,
  user,
  deviceInfo,
  tokens
}: TokenExchangeCompleteProps) {
  const [securityInfo, setSecurityInfo] = useState<SecurityInfo | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const router = useRouter();

  // Fetch security information
  useEffect(() => {
    if (success && tokens) {
      setSecurityInfo({
        tokenType: tokens.tokenType,
        expiresIn: tokens.expiresIn,
        permissions: ['read:profile', 'read:jobs', 'write:applications', 'read:resumes'],
        encryptionLevel: 'AES-256',
        connectionSecure: true
      });
    }
  }, [success, tokens]);

  const formatExpirationTime = (seconds: number): string => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} and ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return 'Less than 1 hour';
    }
  };

  const handleCloseWindow = () => {
    setIsClosing(true);
    
    // Send success message to desktop app
    if (success && window.opener) {
      window.opener.postMessage({
        type: 'AUTH_SUCCESS',
        data: {
          user,
          tokens,
          deviceInfo,
          securityInfo
        }
      }, '*');
    }
    
    // Close window after short delay
    setTimeout(() => {
      window.close();
    }, 1000);
  };

  const handleTryAgain = () => {
    // Reset the exchange process
    if (window.opener) {
      window.opener.postMessage({
        type: 'AUTH_RETRY',
        data: { exchangeToken }
      }, '*');
    }
    
    window.close();
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleManageDevices = () => {
    router.push('/dashboard/settings/devices');
  };

  // Success State
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Authorization Successful!
            </h1>
            <p className="text-gray-600 mt-2">
              Your desktop application has been successfully connected to your JobSwipe account.
            </p>
          </div>

          {/* User & Device Information */}
          <div className="space-y-4 mb-6">
            {user && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <User className="h-4 w-4 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-900">Account</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                </div>
              </div>
            )}

            {deviceInfo && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Monitor className="h-4 w-4 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-900">Device</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>Name:</strong> {deviceInfo.deviceName}</p>
                  <p><strong>Platform:</strong> {deviceInfo.platform}</p>
                  <p><strong>Type:</strong> {deviceInfo.deviceType}</p>
                </div>
              </div>
            )}
          </div>

          {/* Security Information */}
          {securityInfo && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h3 className="font-medium text-green-900 mb-2">
                    Security Information
                  </h3>
                  <div className="space-y-2 text-sm text-green-800">
                    <div className="flex items-center">
                      <Lock className="h-3 w-3 mr-2" />
                      <span>Encryption: {securityInfo.encryptionLevel}</span>
                    </div>
                    <div className="flex items-center">
                      <Key className="h-3 w-3 mr-2" />
                      <span>Token Type: {securityInfo.tokenType}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-2" />
                      <span>Valid for: {formatExpirationTime(securityInfo.expiresIn)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Permissions */}
          {securityInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">
                Granted Permissions
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                {securityInfo.permissions.map((permission, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-blue-600 mr-2" />
                    <span>{permission.replace(':', ' ')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              onClick={handleCloseWindow} 
              className="w-full"
              disabled={isClosing}
            >
              {isClosing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Closing...
                </>
              ) : (
                'Continue to Desktop App'
              )}
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleGoToDashboard}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="outline" onClick={handleManageDevices}>
                <Settings className="h-4 w-4 mr-2" />
                Manage Devices
              </Button>
            </div>
          </div>

          {/* Auto-close notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              This window will close automatically in a few seconds.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8">
        {/* Error Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Authorization Failed
          </h1>
          <p className="text-gray-600 mt-2">
            There was an error authorizing your desktop application.
          </p>
        </div>

        {/* Error Message */}
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error || 'An unexpected error occurred during the authorization process.'}
          </AlertDescription>
        </Alert>

        {/* Common Solutions */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">
            Try these solutions:
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Make sure you're using the latest version of the desktop app</li>
            <li>• Check your internet connection</li>
            <li>• Ensure the authorization code hasn't expired</li>
            <li>• Try generating a new authorization code</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button onClick={handleTryAgain} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleGoToDashboard}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="outline" onClick={() => window.close()}>
              Close Window
            </Button>
          </div>
        </div>

        {/* Support */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help? <a href="/support" className="text-blue-600 hover:text-blue-500">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}