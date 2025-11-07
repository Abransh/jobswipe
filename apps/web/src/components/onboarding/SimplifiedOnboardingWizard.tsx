
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  X,
  Save,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Clock,
  Shield
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Step Components
import { EssentialProfileStep } from './steps/EssentialProfileStep';
import { WorkAuthorizationStep } from './steps/WorkAuthorizationStep';

// Types and Schemas
import type {
  EssentialProfileData,
  WorkAuthorizationData,
  SimplifiedOnboardingData,
  SimplifiedProgressData
} from '@jobswipe/shared/schemas';

// Remove duplicate interface - using the one from schemas

const STEPS = [
  {
    number: 1,
    title: 'Essential Profile',
    description: 'Your basic info and what you\'re looking for',
    icon: '✨',
    estimatedTime: '30 seconds'
  },
  {
    number: 2,
    title: 'Work Authorization',
    description: 'Where you can work to show relevant jobs',
    icon: '🌍',
    estimatedTime: '45 seconds'
  }
];

interface SimplifiedOnboardingWizardProps {
  onComplete?: () => void;
  allowSkip?: boolean;
  initialStep?: number;
}

export function SimplifiedOnboardingWizard({ 
  onComplete, 
  allowSkip = true, 
  initialStep = 1 
}: SimplifiedOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const router = useRouter();
  const { user } = useAuth();

  // Store simplified onboarding data - pre-populate with user data from signup
  const [onboardingData, setOnboardingData] = useState<Partial<SimplifiedOnboardingData>>(() => {
    const initialData: Partial<SimplifiedOnboardingData> = {};
    
    // Pre-populate from user data if available
    if (user?.name) {
      const nameParts = user.name.split(' ');
      initialData.essentialProfile = {
        fullName: user.name,
        // Don't include phone as it's not from signup
        phone: '',
        roleType: '',
        salaryMin: undefined,
        salaryMax: undefined,
        salaryCurrency: 'USD'
      };
    }
    
    return initialData;
  });

  // Load saved progress on mount
  useEffect(() => {
    loadSavedProgress();
  }, []);

  // Auto-clear success messages
  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timeout);
    }
  }, [success]);

  // Auto-clear errors
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  const loadSavedProgress = async () => {
    try {
      const response = await fetch('/api/onboarding/simplified/progress');
      if (response.ok) {
        const progress: SimplifiedProgressData & { data?: Partial<SimplifiedOnboardingData> } = await response.json();
        if (progress.currentStep) {
          setCurrentStep(progress.currentStep);
        }
        if (progress.completedSteps) {
          setCompletedSteps(progress.completedSteps);
        }
        if (progress.data) {
          setOnboardingData(progress.data);
        }
      }
    } catch (error) {
      console.error('Failed to load saved progress:', error);
    }
  };

  const autoSave = async (stepData: any) => {
    if (autoSaveStatus === 'saving') return; // Prevent concurrent saves

    try {
      setAutoSaveStatus('saving');
      
      const response = await fetch('/api/onboarding/simplified/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStep,
          completedSteps,
          progress: calculateProgress(),
          data: onboardingData
        })
      });

      if (response.ok) {
        setAutoSaveStatus('saved');
        setHasUnsavedChanges(false);
        
        // Reset to idle after a short delay
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } else {
        throw new Error('Auto-save failed');
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('idle');
      // Don't show error for auto-save failures to avoid interrupting user
    }
  };

  const calculateProgress = (): number => {
    return Math.round((completedSteps.length / STEPS.length) * 100);
  };

  const updateStepData = (step: number, data: EssentialProfileData | WorkAuthorizationData) => {
    setOnboardingData(prev => ({
      ...prev,
      ...(step === 1 ? { essentialProfile: data as EssentialProfileData } : { workAuthorization: data as WorkAuthorizationData })
    }));
    setHasUnsavedChanges(true);
  };

  const markStepCompleted = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= STEPS.length) {
      setCurrentStep(step);
      setError(null);
    }
  };

  const goToNextStep = () => {
    if (currentStep < STEPS.length) {
      markStepCompleted(currentStep);
      setCurrentStep(currentStep + 1);
      setError(null);
      setSuccess(null);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
      setSuccess(null);
    }
  };

  const skipOnboarding = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/onboarding/simplified/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setSuccess('Skipped onboarding - you can complete it later from your profile!');
        setTimeout(() => {
          onComplete?.();
          router.push('/jobs');
        }, 1500);
      } else {
        setError('Failed to skip onboarding');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/onboarding/simplified/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: onboardingData,
          completedSteps: [...completedSteps, currentStep]
        })
      });

      if (response.ok) {
        setSuccess('🎉 Welcome to JobSwipe! Your profile is ready!');
        setTimeout(() => {
          onComplete?.();
          router.push('/jobs');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to complete onboarding');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <EssentialProfileStep
            data={onboardingData.essentialProfile}
            onDataChange={(data: EssentialProfileData) => updateStepData(currentStep, data)}
            onNext={currentStep === STEPS.length ? completeOnboarding : goToNextStep}
            onPrevious={goToPreviousStep}
            onAutoSave={autoSave}
            isLoading={isLoading}
          />
        );
      case 2:
        return (
          <WorkAuthorizationStep
            data={onboardingData.workAuthorization}
            onDataChange={(data: WorkAuthorizationData) => updateStepData(currentStep, data)}
            onNext={currentStep === STEPS.length ? completeOnboarding : goToNextStep}
            onPrevious={goToPreviousStep}
            onAutoSave={autoSave}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  const currentStepInfo = STEPS[currentStep - 1];
  const isLastStep = currentStep === STEPS.length;
  const isFirstStep = currentStep === 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  JobSwipe
                </span>
              </motion.div>
              
              <div className="hidden sm:block">
                <div className="text-sm text-gray-600">
                  Hey {user?.name?.split(' ')[0] || 'there'}! 👋 Let's get you set up
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Auto-save Status */}
              <AnimatePresence>
                {autoSaveStatus !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center text-sm"
                  >
                    {autoSaveStatus === 'saving' ? (
                      <div className="flex items-center text-blue-600">
                        <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        <span>Saved</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Time Estimate */}
              <div className="hidden sm:flex items-center text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                <Clock className="h-3 w-3 mr-1" />
                <span>{currentStepInfo.estimatedTime}</span>
              </div>
              
              {allowSkip && (
                <Button
                  variant="ghost"
                  onClick={skipOnboarding}
                  disabled={isLoading}
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Skip for now
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <span className="text-2xl">{currentStepInfo.icon}</span>
              <span>{currentStepInfo.title}</span>
            </h1>
            <div className="text-sm text-gray-500">
              {currentStep} of {STEPS.length}
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          
          <p className="text-sm text-gray-600">{currentStepInfo.description}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
                <button
                  onClick={() => setError(null)}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </Alert>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
                <button
                  onClick={() => setSuccess(null)}
                  className="absolute top-3 right-3 text-green-400 hover:text-green-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>

        {/* Step Navigation Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center space-x-8 mt-16 mb-8"
        >
          {STEPS.map((step, index) => (
            <motion.div
              key={step.number}
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <button
                onClick={() => goToStep(step.number)}
                disabled={step.number > currentStep && !completedSteps.includes(step.number - 1)}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
                  ${step.number === currentStep
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : completedSteps.includes(step.number)
                    ? 'bg-green-500 text-white'
                    : step.number < currentStep
                    ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {completedSteps.includes(step.number) ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span>{step.number}</span>
                )}
              </button>
              
              <div className="hidden md:block">
                <p className={`text-sm font-medium ${
                  step.number === currentStep ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-400">{step.estimatedTime}</p>
              </div>
              
              {index < STEPS.length - 1 && (
                <div className={`hidden md:block w-8 h-px ml-4 ${
                  step.number < currentStep || completedSteps.includes(step.number)
                    ? 'bg-green-300'
                    : 'bg-gray-200'
                }`} />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-center space-x-2 text-sm text-gray-500 mt-8"
        >
          <Shield className="h-4 w-4" />
          <span>Your data is encrypted and secure</span>
        </motion.div>
      </div>
    </div>
  );
}