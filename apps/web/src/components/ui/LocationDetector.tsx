'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Check, X, Loader2, Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationDetectorProps {
  onLocationDetected: (country: string, location: string) => void;
  currentCountry?: string;
  currentLocation?: string;
  className?: string;
}

interface DetectedLocation {
  country: string;
  city: string;
  region?: string;
  countryCode: string;
}

const POPULAR_COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
];

export function LocationDetector({
  onLocationDetected,
  currentCountry,
  currentLocation,
  className = ''
}: LocationDetectorProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<DetectedLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isManual, setIsManual] = useState(false);
  const [manualCountry, setManualCountry] = useState(currentCountry || '');
  const [manualLocation, setManualLocation] = useState(currentLocation || '');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  useEffect(() => {
    // Auto-detect location on component mount
    if (!currentCountry && !currentLocation) {
      detectLocation();
    }
  }, []);

  const detectLocation = async () => {
    setIsDetecting(true);
    setError(null);

    try {
      // First try to get user's location using a public IP API
      const response = await fetch('https://ipapi.co/json/', {
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to detect location');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.reason || 'Location detection failed');
      }

      const location: DetectedLocation = {
        country: data.country_name || 'Unknown',
        city: data.city || 'Unknown',
        region: data.region,
        countryCode: data.country_code || 'XX'
      };

      setDetectedLocation(location);
      
      // Auto-accept if we got good data
      if (location.country !== 'Unknown' && location.city !== 'Unknown') {
        const fullLocation = location.region 
          ? `${location.city}, ${location.region}` 
          : location.city;
        
        onLocationDetected(location.country, fullLocation);
      }

    } catch (error) {
      console.error('Location detection failed:', error);
      setError('Unable to detect location automatically');
      setIsManual(true);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleAcceptDetected = () => {
    if (detectedLocation) {
      const fullLocation = detectedLocation.region 
        ? `${detectedLocation.city}, ${detectedLocation.region}` 
        : detectedLocation.city;
      
      onLocationDetected(detectedLocation.country, fullLocation);
    }
  };

  const handleRejectDetected = () => {
    setDetectedLocation(null);
    setIsManual(true);
  };

  const handleManualSubmit = () => {
    if (manualCountry && manualLocation) {
      onLocationDetected(manualCountry, manualLocation);
      setIsManual(false);
    }
  };

  const handleCountrySelect = (country: { name: string; flag: string }) => {
    setManualCountry(country.name);
    setShowCountryDropdown(false);
  };

  const getFlagForCountry = (countryName: string) => {
    const country = POPULAR_COUNTRIES.find(c => 
      c.name.toLowerCase() === countryName.toLowerCase()
    );
    return country?.flag || '🌍';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <MapPin className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Current Location</h3>
      </div>

      <AnimatePresence mode="wait">
        {/* Auto-Detection State */}
        {isDetecting && (
          <motion.div
            key="detecting"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-blue-200 bg-blue-50 rounded-xl p-6"
          >
            <div className="flex items-center space-x-4">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              <div>
                <p className="font-medium text-blue-900">Detecting your location...</p>
                <p className="text-sm text-blue-700">This helps us show relevant opportunities</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Detected Location Confirmation */}
        {detectedLocation && !currentCountry && (
          <motion.div
            key="detected"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-green-200 bg-green-50 rounded-xl p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {getFlagForCountry(detectedLocation.country)}
                </span>
                <div>
                  <p className="font-medium text-green-900">
                    We detected you're in {detectedLocation.country}
                  </p>
                  <p className="text-sm text-green-700">
                    {detectedLocation.city}
                    {detectedLocation.region && `, ${detectedLocation.region}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  onClick={handleAcceptDetected}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Correct
                </Button>
                <Button
                  type="button"
                  onClick={handleRejectDetected}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-100"
                >
                  <X className="h-4 w-4 mr-1" />
                  Wrong
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Manual Location Input */}
        {(isManual || currentCountry) && (
          <motion.div
            key="manual"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Country Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 border rounded-lg text-left
                    ${manualCountry || currentCountry 
                      ? 'border-gray-300 bg-white' 
                      : 'border-gray-300 bg-gray-50 text-gray-500'
                    }
                    hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {getFlagForCountry(manualCountry || currentCountry || '')}
                    </span>
                    <span>
                      {manualCountry || currentCountry || 'Select your country'}
                    </span>
                  </div>
                  <ChevronDown className={`
                    h-4 w-4 text-gray-400 transition-transform
                    ${showCountryDropdown ? 'rotate-180' : ''}
                  `} />
                </button>

                <AnimatePresence>
                  {showCountryDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                    >
                      {POPULAR_COUNTRIES.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => handleCountrySelect(country)}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50"
                        >
                          <span className="text-lg">{country.flag}</span>
                          <span>{country.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* City/Location Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                City / Location
              </label>
              <input
                type="text"
                value={manualLocation || currentLocation || ''}
                onChange={(e) => setManualLocation(e.target.value)}
                placeholder="e.g., San Francisco, California"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {isManual && (
              <Button
                type="button"
                onClick={handleManualSubmit}
                disabled={!manualCountry || !manualLocation}
                className="w-full"
              >
                Confirm Location
              </Button>
            )}
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-red-200 bg-red-50 rounded-xl p-6"
          >
            <div className="flex items-start space-x-3">
              <X className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Location Detection Failed</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <Button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setIsManual(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  Enter Manually
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Location Display */}
      {(currentCountry && currentLocation) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <span className="text-lg">{getFlagForCountry(currentCountry)}</span>
            <div>
              <p className="font-medium text-blue-900">{currentCountry}</p>
              <p className="text-sm text-blue-700">{currentLocation}</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setIsManual(true)}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
          >
            Change
          </Button>
        </motion.div>
      )}
    </div>
  );
}