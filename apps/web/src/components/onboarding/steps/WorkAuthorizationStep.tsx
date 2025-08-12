'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  MapPin, 
  Check, 
  HelpCircle,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Plane,
  Building,
  Shield
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { LocationDetector } from '@/components/ui/LocationDetector';
import {
  workAuthorizationSchema,
  WORK_AUTH_STATUS,
  TARGET_REGIONS,
  type WorkAuthorizationData
} from '@jobswipe/shared/schemas';

interface WorkAuthorizationStepProps {
  data?: WorkAuthorizationData;
  onDataChange: (data: WorkAuthorizationData) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
  onAutoSave?: (data: WorkAuthorizationData) => void;
}

const WORK_AUTH_LABELS = {
  CITIZEN: 'Citizen',
  PERMANENT_RESIDENT: 'Permanent Resident',
  WORK_PERMIT: 'Work Permit/Visa',
  NEEDS_SPONSORSHIP: 'Need Sponsorship',
  UNKNOWN: 'Not Sure'
};

const WORK_AUTH_DESCRIPTIONS = {
  CITIZEN: 'I am a citizen of this country',
  PERMANENT_RESIDENT: 'I have permanent residency/green card',
  WORK_PERMIT: 'I have a valid work permit or visa',
  NEEDS_SPONSORSHIP: 'I would need visa sponsorship to work',
  UNKNOWN: 'I need to research work authorization requirements'
};

const REGION_LABELS = {
  US: 'United States 🇺🇸',
  EU: 'European Union 🇪🇺',
  UK: 'United Kingdom 🇬🇧',
  CANADA: 'Canada 🇨🇦',
  AUSTRALIA: 'Australia 🇦🇺',
  APAC: 'Asia-Pacific 🌏'
};

const REGION_DESCRIPTIONS = {
  US: 'Jobs in the United States requiring US work authorization',
  EU: 'Jobs across European Union countries',
  UK: 'Jobs in the United Kingdom post-Brexit',
  CANADA: 'Jobs in Canada requiring Canadian work authorization',
  AUSTRALIA: 'Jobs in Australia and New Zealand',
  APAC: 'Jobs in Singapore, Japan, Hong Kong, and other APAC regions'
};

export function WorkAuthorizationStep({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isLoading = false,
  onAutoSave
}: WorkAuthorizationStepProps) {
  const [currentStep, setCurrentStep] = useState<'location' | 'current-auth' | 'international' | 'target-regions' | 'region-auth'>('location');
  const [selectedRegions, setSelectedRegions] = useState<string[]>(data?.targetRegions || []);
  const [regionWorkAuth, setRegionWorkAuth] = useState<Record<string, string>>(data?.workAuthByRegion || {});

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty }
  } = useForm<WorkAuthorizationData>({
    resolver: zodResolver(workAuthorizationSchema),
    mode: 'onChange',
    defaultValues: {
      currentCountry: data?.currentCountry || '',
      currentLocation: data?.currentLocation || '',
      canWorkInCurrentCountry: data?.canWorkInCurrentCountry ?? false,
      currentCountryWorkAuth: data?.currentCountryWorkAuth,
      interestedInInternational: data?.interestedInInternational ?? false,
      targetRegions: data?.targetRegions || [],
      workAuthByRegion: data?.workAuthByRegion || {}
    }
  });

  const watchedData = watch();

  // Auto-save when data changes
  useEffect(() => {
    if (isDirty && onAutoSave) {
      const formData = {
        ...watchedData,
        targetRegions: selectedRegions as any,
        workAuthByRegion: regionWorkAuth
      };
      
      const timeout = setTimeout(() => {
        onAutoSave(formData);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [watchedData, selectedRegions, regionWorkAuth, isDirty, onAutoSave]);

  // Update parent component when form data changes
  useEffect(() => {
    const updatedData = {
      ...watchedData,
      targetRegions: selectedRegions as any,
      workAuthByRegion: regionWorkAuth
    };
    onDataChange(updatedData);
  }, [watchedData, selectedRegions, regionWorkAuth, onDataChange]);

  // Auto-progress through steps based on data
  useEffect(() => {
    if (watchedData.currentCountry && watchedData.currentLocation && currentStep === 'location') {
      setCurrentStep('current-auth');
    }
  }, [watchedData.currentCountry, watchedData.currentLocation, currentStep]);

  const handleLocationDetected = (country: string, location: string) => {
    setValue('currentCountry', country);
    setValue('currentLocation', location);
    setCurrentStep('current-auth');
  };

  const handleWorkAuthSelection = (canWork: boolean, authType?: string) => {
    setValue('canWorkInCurrentCountry', canWork);
    if (authType) {
      setValue('currentCountryWorkAuth', authType as any);
    }
    setCurrentStep('international');
  };

  const handleInternationalInterest = (interested: boolean) => {
    setValue('interestedInInternational', interested);
    if (interested) {
      setCurrentStep('target-regions');
    } else {
      // Skip to completion
      onSubmit(watchedData);
    }
  };

  const handleRegionToggle = (region: string) => {
    const newRegions = selectedRegions.includes(region)
      ? selectedRegions.filter(r => r !== region)
      : [...selectedRegions, region];
    
    setSelectedRegions(newRegions);
    setValue('targetRegions', newRegions as any);
    
    // If region was removed, also remove its work auth
    if (!newRegions.includes(region)) {
      const newRegionAuth = { ...regionWorkAuth };
      delete newRegionAuth[region];
      setRegionWorkAuth(newRegionAuth);
    }
  };

  const handleRegionAuthSelection = (region: string, authType: string) => {
    const newRegionAuth = {
      ...regionWorkAuth,
      [region]: authType
    };
    setRegionWorkAuth(newRegionAuth);
    setValue('workAuthByRegion', newRegionAuth);
  };

  const canProceedToRegionAuth = selectedRegions.length > 0;
  const canComplete = selectedRegions.length === 0 || selectedRegions.every(region => regionWorkAuth[region]);

  const onSubmit = (formData: WorkAuthorizationData) => {
    const finalData = {
      ...formData,
      targetRegions: selectedRegions as any,
      workAuthByRegion: regionWorkAuth
    };
    onNext();
  };

  const renderProgressBar = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          ['location', 'current-auth', 'international', 'target-regions', 'region-auth'].includes(currentStep)
            ? 'bg-blue-500' : 'bg-gray-200'
        }`}></div>
        <div className={`w-8 h-1 ${
          ['current-auth', 'international', 'target-regions', 'region-auth'].includes(currentStep)
            ? 'bg-blue-500' : 'bg-gray-200'
        }`}></div>
        <div className={`w-3 h-3 rounded-full ${
          ['current-auth', 'international', 'target-regions', 'region-auth'].includes(currentStep)
            ? 'bg-blue-500' : 'bg-gray-200'
        }`}></div>
        <div className={`w-8 h-1 ${
          ['international', 'target-regions', 'region-auth'].includes(currentStep)
            ? 'bg-blue-500' : 'bg-gray-200'
        }`}></div>
        <div className={`w-3 h-3 rounded-full ${
          ['international', 'target-regions', 'region-auth'].includes(currentStep)
            ? 'bg-blue-500' : 'bg-gray-200'
        }`}></div>
        <div className={`w-8 h-1 ${
          ['target-regions', 'region-auth'].includes(currentStep)
            ? 'bg-blue-500' : 'bg-gray-200'
        }`}></div>
        <div className={`w-3 h-3 rounded-full ${
          ['region-auth'].includes(currentStep) ? 'bg-blue-500' : 'bg-gray-200'
        }`}></div>
      </div>
      <span className="text-sm text-gray-500 ml-4">Step 2 of 2</span>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center"
          >
            <Globe className="h-8 w-8 text-white" />
          </motion.div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Work Authorization 🌍
            </h1>
            <p className="text-lg text-gray-600">
              Help us understand where you can work so we show you the right opportunities
            </p>
          </div>
        </div>

        {renderProgressBar()}

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <AnimatePresence mode="wait">
            {/* Step 1: Location Detection */}
            {currentStep === 'location' && (
              <motion.div
                key="location"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <LocationDetector
                  onLocationDetected={handleLocationDetected}
                  currentCountry={watchedData.currentCountry}
                  currentLocation={watchedData.currentLocation}
                />
              </motion.div>
            )}

            {/* Step 2: Current Country Work Authorization */}
            {currentStep === 'current-auth' && (
              <motion.div
                key="current-auth"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Can you work in {watchedData.currentCountry}?
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Yes - Can Work */}
                  <button
                    type="button"
                    onClick={() => handleWorkAuthSelection(true)}
                    className={`
                      p-6 border-2 rounded-xl text-left transition-all duration-200 hover:shadow-md
                      ${watchedData.canWorkInCurrentCountry === true
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            Yes, I can work in {watchedData.currentCountry}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            I'm authorized to work without restrictions
                          </p>
                        </div>
                      </div>
                      {watchedData.canWorkInCurrentCountry === true && (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </button>

                  {/* No - Need Sponsorship */}
                  <button
                    type="button"
                    onClick={() => handleWorkAuthSelection(false, 'NEEDS_SPONSORSHIP')}
                    className={`
                      p-6 border-2 rounded-xl text-left transition-all duration-200 hover:shadow-md
                      ${watchedData.canWorkInCurrentCountry === false
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <AlertCircle className="h-6 w-6 text-orange-500" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            No, I would need sponsorship
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            I would need a work visa or permit to work here
                          </p>
                        </div>
                      </div>
                      {watchedData.canWorkInCurrentCountry === false && (
                        <Check className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
                  </button>
                </div>

                {/* Work Auth Type Selection (if can work) */}
                {watchedData.canWorkInCurrentCountry === true && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 space-y-4"
                  >
                    <h3 className="font-medium text-gray-900">What's your work authorization status?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {['CITIZEN', 'PERMANENT_RESIDENT', 'WORK_PERMIT'].map((authType) => (
                        <button
                          key={authType}
                          type="button"
                          onClick={() => setValue('currentCountryWorkAuth', authType as any)}
                          className={`
                            p-4 border rounded-lg text-left transition-all duration-200
                            ${watchedData.currentCountryWorkAuth === authType
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                        >
                          <p className="font-medium text-gray-900">{WORK_AUTH_LABELS[authType]}</p>
                          <p className="text-sm text-gray-600">{WORK_AUTH_DESCRIPTIONS[authType]}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 3: International Interest */}
            {currentStep === 'international' && (
              <motion.div
                key="international"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plane className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Interested in international opportunities?
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <button
                    type="button"
                    onClick={() => handleInternationalInterest(true)}
                    className={`
                      p-6 border-2 rounded-xl text-left transition-all duration-200 hover:shadow-md
                      ${watchedData.interestedInInternational === true
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <Plane className="h-6 w-6 text-blue-500" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            Yes, show me international jobs
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            I'm open to working in other countries
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInternationalInterest(false)}
                    className={`
                      p-6 border-2 rounded-xl text-left transition-all duration-200 hover:shadow-md
                      ${watchedData.interestedInInternational === false
                        ? 'border-gray-500 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <Building className="h-6 w-6 text-gray-500" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            No, only jobs in {watchedData.currentCountry}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            I prefer to stay in my current country
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Target Regions */}
            {currentStep === 'target-regions' && (
              <motion.div
                key="target-regions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Globe className="h-5 w-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Which regions interest you?
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TARGET_REGIONS.filter(region => {
                    // Filter out current country's region if applicable
                    const currentCountry = watchedData.currentCountry?.toLowerCase();
                    if (currentCountry?.includes('united states') && region === 'US') return false;
                    if (currentCountry?.includes('canada') && region === 'CANADA') return false;
                    if (currentCountry?.includes('united kingdom') && region === 'UK') return false;
                    if (currentCountry?.includes('australia') && region === 'AUSTRALIA') return false;
                    return true;
                  }).map((region) => (
                    <button
                      key={region}
                      type="button"
                      onClick={() => handleRegionToggle(region)}
                      className={`
                        p-4 border-2 rounded-xl text-left transition-all duration-200 hover:shadow-md
                        ${selectedRegions.includes(region)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{REGION_LABELS[region]}</p>
                          <p className="text-sm text-gray-600 mt-1">{REGION_DESCRIPTIONS[region]}</p>
                        </div>
                        {selectedRegions.includes(region) && (
                          <Check className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-500">
                    {selectedRegions.length} region{selectedRegions.length !== 1 ? 's' : ''} selected
                  </p>
                  
                  <Button
                    type="button"
                    onClick={() => setCurrentStep('region-auth')}
                    disabled={!canProceedToRegionAuth}
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Regional Work Authorization */}
            {currentStep === 'region-auth' && selectedRegions.length > 0 && (
              <motion.div
                key="region-auth"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Work authorization for selected regions
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Let us know your work status for each region
                  </p>
                </div>

                {selectedRegions.map((region) => (
                  <div key={region} className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                      <span>{REGION_LABELS[region]}</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(WORK_AUTH_LABELS).map(([authType, label]) => (
                        <button
                          key={`${region}-${authType}`}
                          type="button"
                          onClick={() => handleRegionAuthSelection(region, authType)}
                          className={`
                            p-4 border rounded-lg text-left transition-all duration-200
                            ${regionWorkAuth[region] === authType
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{label}</p>
                              <p className="text-sm text-gray-600">{WORK_AUTH_DESCRIPTIONS[authType]}</p>
                            </div>
                            {regionWorkAuth[region] === authType && (
                              <Check className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6">
          <Button
            type="button"
            onClick={onPrevious}
            variant="ghost"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          {(currentStep === 'region-auth' || (currentStep === 'international' && !watchedData.interestedInInternational)) && (
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading || !canComplete}
              size="lg"
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Completing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Complete Setup</span>
                  <CheckCircle className="h-4 w-4" />
                </div>
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}