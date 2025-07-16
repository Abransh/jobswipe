'use client';

import { useState, useEffect } from 'react';
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
import { 
  QrCode, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Copy,
  Download,
  Share2,
  Shield
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QRCodePairingProps {
  qrCodeUrl: string;
  exchangeToken: string;
  deepLinkUrl: string;
  expiresAt: string;
  onRefresh: () => void;
  isCompleted?: boolean;
}

export function QRCodePairing({
  qrCodeUrl,
  exchangeToken,
  deepLinkUrl,
  expiresAt,
  onRefresh,
  isCompleted = false
}: QRCodePairingProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Calculate time remaining
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      
      setTimeRemaining(diff);
      setIsExpired(diff === 0);
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const downloadQRCode = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'jobswipe-qr-code.png';
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    };
    
    // Convert SVG to image
    const svg = document.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      img.src = url;
    }
  };

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'JobSwipe Desktop Authorization',
          text: 'Scan this QR code to authorize your desktop application',
          url: deepLinkUrl,
        });
      } catch (error) {
        // Fallback to copy
        copyToClipboard(deepLinkUrl);
      }
    } else {
      copyToClipboard(deepLinkUrl);
    }
  };

  if (isCompleted) {
    return (
      <div className="text-center p-8">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Pairing Successful!
        </h2>
        <p className="text-gray-600 mb-6">
          Your desktop application has been successfully paired with your account.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <Shield className="h-4 w-4 text-green-600 mr-2" />
            <span className="font-medium text-green-900">Secure Connection Active</span>
          </div>
          <p className="text-sm text-green-800">
            Your desktop app can now access your JobSwipe account securely.
          </p>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          QR Code Expired
        </h2>
        <p className="text-gray-600 mb-6">
          The QR code has expired for security reasons. Please generate a new one.
        </p>
        <Button onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Generate New QR Code
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timer */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Clock className="h-4 w-4 text-orange-500 mr-2" />
          <span className="text-sm text-gray-600">
            Expires in: <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${(timeRemaining / 300) * 100}%` }}
          />
        </div>
      </div>

      {/* QR Code */}
      <div className="text-center">
        <div className="inline-block p-6 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
          <QRCodeSVG 
            value={qrCodeUrl} 
            size={256}
            level="M"
            includeMargin={true}
            fgColor="#000000"
            bgColor="#ffffff"
          />
        </div>
        
        {/* QR Code Actions */}
        <div className="flex justify-center space-x-2 mt-4">
          <Button variant="outline" size="sm" onClick={downloadQRCode}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={shareQRCode}>
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <QrCode className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">How to use QR Code</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Open your JobSwipe desktop application</li>
              <li>2. Click "Sign In" or "Connect Account"</li>
              <li>3. Select "Scan QR Code" option</li>
              <li>4. Point your camera at the QR code above</li>
              <li>5. Wait for the authentication to complete</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Alternative Methods */}
      <div className="space-y-4">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Alternative methods</span>
            </div>
          </div>
        </div>

        {/* Manual Token Entry */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-900">Manual Token Entry</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(exchangeToken)}
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
          <p className="text-sm text-gray-600 mb-2">
            Enter this token manually in your desktop application:
          </p>
          <code className="text-sm bg-gray-100 p-2 rounded block font-mono break-all">
            {exchangeToken}
          </code>
        </div>

        {/* Deep Link */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-900">Direct Link</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(deepLinkUrl, '_blank')}
            >
              Open App
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Click the button above to open your desktop application directly.
          </p>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Generate New Code
        </Button>
      </div>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> This QR code contains a temporary authorization token. 
          Do not share it with anyone and ensure you're using it with your own desktop application.
        </AlertDescription>
      </Alert>
    </div>
  );
}