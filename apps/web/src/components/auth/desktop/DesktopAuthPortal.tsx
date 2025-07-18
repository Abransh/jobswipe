'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  QrCode, 
  Smartphone, 
  Monitor, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  RefreshCw,
  Copy,
  ExternalLink,
  Download,
  Loader2,
  Key,
  Lock
} from 'lucide-react';
// QR Code library import - fallback if library not available
let QRCodeSVG: any = null;
try {
  QRCodeSVG = require('qrcode.react').QRCodeSVG;
} catch (e) {
  // Fallback component
  QRCodeSVG = ({ value, size }: { value: string; size: number }) => (
    <div 
      className="bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-mono"
      style={{ width: size, height: size }}
    >
      QR Code: {value.substring(0, 20)}...
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  platform: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  appVersion?: string;
  osVersion?: string;
}

interface TokenExchangeRequest {
  success: boolean;
  exchangeToken: string;
  expiresAt: string;
  qrCodeUrl: string;
  deepLinkUrl: string;
}

interface TokenExchangeResponse {
  success: boolean;
  tokens: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
  };
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface AuthStep {
  step: number;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed';
}

const DEFAULT_STEPS: AuthStep[] = [
  {
    step: 1,
    title: 'Device Registration',
    description: 'Register your desktop application',
    status: 'current'
  },
  {
    step: 2,
    title: 'Authorization',
    description: 'Authorize access to your account',
    status: 'pending'
  },
  {
    step: 3,
    title: 'Token Exchange',
    description: 'Secure token exchange with desktop app',
    status: 'pending'
  },
  {
    step: 4,
    title: 'Complete',
    description: 'Desktop app is now authenticated',
    status: 'pending'
  }
];

export function DesktopAuthPortal() {
  const [steps, setSteps] = useState<AuthStep[]>(DEFAULT_STEPS);
  const [currentStep, setCurrentStep] = useState(1);
  const [exchangeRequest, setExchangeRequest] = useState<TokenExchangeRequest | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(300); // 5 minutes
  const [isCompleted, setIsCompleted] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get device info from URL parameters
  useEffect(() => {
    const deviceId = searchParams.get('deviceId');
    const deviceName = searchParams.get('deviceName');
    const platform = searchParams.get('platform');
    const deviceType = searchParams.get('deviceType') as 'desktop' | 'mobile' | 'tablet';
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

  // Countdown timer
  useEffect(() => {
    if (exchangeRequest && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setError('Token exchange expired. Please try again.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [exchangeRequest, timeRemaining]);

  // Check for completion
  useEffect(() => {
    if (exchangeRequest && !isCompleted) {
      const checkCompletion = async () => {
        try {
          const response = await fetch('/api/auth/token-exchange/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              exchangeToken: exchangeRequest.exchangeToken 
            }),
          });

          const data = await response.json();
          
          if (data.completed) {
            setIsCompleted(true);
            updateStep(4, 'completed');
            setCurrentStep(4);
          }
        } catch (error) {
          // Silent error - continue checking
        }
      };

      const interval = setInterval(checkCompletion, 2000);
      return () => clearInterval(interval);
    }
  }, [exchangeRequest, isCompleted]);

  const updateStep = (stepNumber: number, status: AuthStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.step === stepNumber ? { ...step, status } : step
    ));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const initiateTokenExchange = async () => {
    if (!session || !deviceInfo) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/token-exchange/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceInfo),
      });

      const data: TokenExchangeRequest = await response.json();

      if (data.success) {
        setExchangeRequest(data);
        setTimeRemaining(300); // Reset timer
        updateStep(1, 'completed');
        updateStep(2, 'current');
        setCurrentStep(2);
      } else {
        setError('Failed to initiate token exchange');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const refreshExchange = () => {
    setExchangeRequest(null);
    setTimeRemaining(300);
    setIsCompleted(false);
    setSteps(DEFAULT_STEPS);
    setCurrentStep(1);
  };

  if (!session) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please sign in to your account to authorize desktop app access.
          </p>
          <Button onClick={() => router.push('/auth/signin')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Monitor className="h-8 w-8 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Desktop App Authorization</h1>
        </div>
        <p className="text-gray-600">
          Authorize your desktop application to access your JobSwipe account
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.step} className="flex-1">
              <div className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step.status === 'completed' ? 'bg-green-500 text-white' :
                    step.status === 'current' ? 'bg-blue-500 text-white' :
                    'bg-gray-200 text-gray-600'}
                `}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.step
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-0.5 mx-2
                    ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'}
                  `} />
                )}
              </div>
              <div className="mt-2 text-center">
                <p className="text-sm font-medium text-gray-900">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Device Info */}
      {deviceInfo && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Device Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Device Name:</span> {deviceInfo.deviceName}
            </div>
            <div>
              <span className="font-medium">Platform:</span> {deviceInfo.platform}
            </div>
            <div>
              <span className="font-medium">Type:</span> {deviceInfo.deviceType}
            </div>
            {deviceInfo.appVersion && (
              <div>
                <span className="font-medium">App Version:</span> {deviceInfo.appVersion}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Device Registration */}
      {currentStep === 1 && (
        <div className="text-center">
          <Key className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Authorize Desktop Application
          </h2>
          <p className="text-gray-600 mb-6">
            Click the button below to generate a secure authorization code for your desktop application.
          </p>
          <Button 
            onClick={initiateTokenExchange} 
            disabled={isLoading || !deviceInfo}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Generate Authorization Code
              </>
            )}
          </Button>
        </div>
      )}

      {/* Step 2 & 3: QR Code and Token Exchange */}
      {exchangeRequest && currentStep >= 2 && !isCompleted && (
        <div className="space-y-6">
          {/* Timer */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-4 w-4 text-orange-500 mr-2" />
              <span className="text-sm text-gray-600">
                Code expires in: <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
              </span>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center">
            <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
              <QRCodeSVG 
                value={exchangeRequest.qrCodeUrl} 
                size={200}
                level="M"
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Scan this QR code with your desktop application
            </p>
          </div>

          {/* Alternative Methods */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">Or use one of these alternative methods:</p>
            </div>

            {/* Copy Exchange Token */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Exchange Token</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(exchangeRequest.exchangeToken)}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <code className="text-sm bg-gray-100 p-2 rounded block font-mono break-all">
                {exchangeRequest.exchangeToken}
              </code>
            </div>

            {/* Deep Link */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Deep Link</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(exchangeRequest.deepLinkUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open
                </Button>
              </div>
              <code className="text-sm bg-gray-100 p-2 rounded block font-mono break-all">
                {exchangeRequest.deepLinkUrl}
              </code>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Instructions</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Open your JobSwipe desktop application</li>
              <li>2. Click "Sign In" or "Connect Account"</li>
              <li>3. Use one of the methods above to authenticate</li>
              <li>4. Wait for the confirmation message</li>
            </ol>
          </div>

          {/* Refresh Button */}
          <div className="text-center">
            <Button variant="outline" onClick={refreshExchange}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Completion */}
      {isCompleted && (
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Authorization Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Your desktop application has been successfully authorized and is now connected to your account.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Lock className="h-4 w-4 text-green-600 mr-2" />
              <span className="font-medium text-green-900">Secure Connection Established</span>
            </div>
            <p className="text-sm text-green-800">
              Your desktop app can now access your JobSwipe account securely. 
              The connection uses enterprise-grade encryption and will remain active 
              until you revoke access.
            </p>
          </div>

          <div className="space-y-4">
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
            <div>
              <Button variant="outline" onClick={() => router.push('/dashboard/settings')}>
                Manage Connected Devices
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}