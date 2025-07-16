'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  QrCode, 
  CheckCircle, 
  AlertTriangle,
  Copy,
  Download,
  RefreshCw,
  Clock,
  Lock,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormInput } from '../FormInput';

interface MFASetupProps {
  onComplete: (backupCodes: string[]) => void;
  onCancel: () => void;
}

interface MFASetupStep {
  step: number;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed';
}

interface TOTPSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  manualEntryKey: string;
}

const MFA_STEPS: MFASetupStep[] = [
  {
    step: 1,
    title: 'Choose Method',
    description: 'Select your preferred MFA method',
    status: 'current'
  },
  {
    step: 2,
    title: 'Configure App',
    description: 'Set up your authenticator app',
    status: 'pending'
  },
  {
    step: 3,
    title: 'Verify Setup',
    description: 'Confirm your setup works',
    status: 'pending'
  },
  {
    step: 4,
    title: 'Backup Codes',
    description: 'Save your recovery codes',
    status: 'pending'
  }
];

export function MFASetup({ onComplete, onCancel }: MFASetupProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<MFASetupStep[]>(MFA_STEPS);
  const [selectedMethod, setSelectedMethod] = useState<'totp' | 'sms' | null>(null);
  const [totpSetup, setTotpSetup] = useState<TOTPSetup | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [backupCodesDownloaded, setBackupCodesDownloaded] = useState(false);

  const router = useRouter();

  const updateStep = (stepNumber: number, status: MFASetupStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.step === stepNumber ? { ...step, status } : step
    ));
  };

  const initializeTOTP = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/mfa/setup/totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        setTotpSetup(data.setup);
        updateStep(1, 'completed');
        updateStep(2, 'current');
        setCurrentStep(2);
      } else {
        setError(data.error || 'Failed to initialize TOTP setup');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSMS = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/mfa/setup/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        updateStep(1, 'completed');
        updateStep(2, 'current');
        setCurrentStep(2);
      } else {
        setError(data.error || 'Failed to send SMS verification code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifySetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: verificationCode,
          method: selectedMethod 
        }),
      });

      const data = await response.json();

      if (data.success) {
        updateStep(2, 'completed');
        updateStep(3, 'completed');
        updateStep(4, 'current');
        setCurrentStep(4);
        
        // Show backup codes
        if (data.backupCodes) {
          setTotpSetup(prev => prev ? { ...prev, backupCodes: data.backupCodes } : null);
        }
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const completeMFASetup = async () => {
    if (!backupCodesDownloaded) {
      setError('Please download your backup codes before completing setup');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/mfa/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        updateStep(4, 'completed');
        onComplete(totpSetup?.backupCodes || []);
      } else {
        setError(data.error || 'Failed to complete MFA setup');
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
      // Fallback for older browsers
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

  const downloadBackupCodes = () => {
    if (!totpSetup?.backupCodes) return;

    const codesText = totpSetup.backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jobswipe-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    setBackupCodesDownloaded(true);
  };

  // QR Code fallback component
  const QRCodeFallback = ({ value, size }: { value: string; size: number }) => (
    <div 
      className="bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-mono border-2 border-gray-300"
      style={{ width: size, height: size }}
    >
      QR Code: {value.substring(0, 20)}...
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Multi-Factor Authentication Setup</h1>
        </div>
        <p className="text-gray-600">
          Add an extra layer of security to your account
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

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Choose Method */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Choose Your MFA Method
            </h2>
            <p className="text-gray-600">
              Select how you'd like to receive your second factor authentication codes
            </p>
          </div>

          <div className="space-y-4">
            {/* TOTP Method */}
            <div 
              className={`
                border-2 rounded-lg p-4 cursor-pointer transition-all
                ${selectedMethod === 'totp' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'}
              `}
              onClick={() => setSelectedMethod('totp')}
            >
              <div className="flex items-start">
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    name="mfa-method" 
                    checked={selectedMethod === 'totp'}
                    onChange={() => setSelectedMethod('totp')}
                    className="mr-3"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Smartphone className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="font-medium text-gray-900">Authenticator App (Recommended)</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Use apps like Google Authenticator, Authy, or 1Password to generate time-based codes
                  </p>
                  <div className="mt-2 text-xs text-green-600">
                    ✓ Works offline • ✓ Most secure • ✓ Industry standard
                  </div>
                </div>
              </div>
            </div>

            {/* SMS Method */}
            <div 
              className={`
                border-2 rounded-lg p-4 cursor-pointer transition-all
                ${selectedMethod === 'sms' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'}
              `}
              onClick={() => setSelectedMethod('sms')}
            >
              <div className="flex items-start">
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    name="mfa-method" 
                    checked={selectedMethod === 'sms'}
                    onChange={() => setSelectedMethod('sms')}
                    className="mr-3"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Mail className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="font-medium text-gray-900">SMS Text Message</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Receive verification codes via SMS to your mobile phone
                  </p>
                  <div className="mt-2 text-xs text-orange-600">
                    ⚠ Requires cell service • ⚠ Less secure than app
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phone Number Input for SMS */}
          {selectedMethod === 'sms' && (
            <div className="mt-4">
              <FormInput
                id="phoneNumber"
                label="Phone Number"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={selectedMethod === 'totp' ? initializeTOTP : initializeSMS}
              disabled={!selectedMethod || isLoading || (selectedMethod === 'sms' && !phoneNumber)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Configure App (TOTP) */}
      {currentStep === 2 && selectedMethod === 'totp' && totpSetup && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Configure Your Authenticator App
            </h2>
            <p className="text-gray-600">
              Scan the QR code or enter the setup key manually
            </p>
          </div>

          {/* QR Code */}
          <div className="text-center">
            <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
              <QRCodeFallback value={totpSetup.qrCodeUrl} size={200} />
            </div>
          </div>

          {/* Manual Setup */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">Manual Setup Key</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(totpSetup.manualEntryKey)}
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
              {totpSetup.manualEntryKey}
            </code>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Instructions</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Open your authenticator app (Google Authenticator, Authy, etc.)</li>
              <li>2. Scan the QR code above or enter the setup key manually</li>
              <li>3. Your app will generate a 6-digit code</li>
              <li>4. Enter the code below to verify setup</li>
            </ol>
          </div>

          {/* Verification */}
          <div className="space-y-4">
            <FormInput
              id="verificationCode"
              label="Verification Code"
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              required
            />
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              Back
            </Button>
            <Button 
              onClick={verifySetup}
              disabled={!verificationCode || verificationCode.length !== 6 || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Continue'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Backup Codes */}
      {currentStep === 4 && totpSetup?.backupCodes && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Save Your Backup Codes
            </h2>
            <p className="text-gray-600">
              Store these codes in a safe place. You can use them to access your account if you lose your authenticator device.
            </p>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Each backup code can only be used once. 
              Store them securely and don't share them with anyone.
            </AlertDescription>
          </Alert>

          {/* Backup Codes */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium text-gray-900">Backup Codes</span>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadBackupCodes}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {totpSetup.backupCodes.map((code, index) => (
                <code key={index} className="text-sm bg-white p-2 rounded font-mono border">
                  {code}
                </code>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="backup-codes-saved"
              checked={backupCodesDownloaded}
              onChange={(e) => setBackupCodesDownloaded(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="backup-codes-saved" className="text-sm text-gray-700">
              I have downloaded and safely stored my backup codes
            </label>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={completeMFASetup}
              disabled={!backupCodesDownloaded || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Complete Setup
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}