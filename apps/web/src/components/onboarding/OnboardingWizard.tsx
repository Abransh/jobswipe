'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Circle, 
  ArrowLeft, 
  ArrowRight, 
  X,
  Save,
  AlertTriangle,
  Info
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OnboardingProgressBar } from './shared/OnboardingProgressBar';
import { StepIndicator } from './shared/StepIndicator';

// Step Components
import { ProfessionalBackgroundStep } from './steps/ProfessionalBackgroundStep';
import { JobPreferencesStep } from './steps/JobPreferencesStep';
import { WorkPreferencesStep } from './steps/WorkPreferencesStep';
import { NotificationPreferencesStep } from './steps/NotificationPreferencesStep';
import { ProfileCompletionStep } from './steps/ProfileCompletionStep';

// Types and Schemas
import type {
  ProfessionalBackgroundData,
  JobPreferencesData,
  WorkPreferencesData,
  NotificationPreferencesData,
  ProfileCompletionData,
  OnboardingProgressData
} from '@jobswipe/shared/schemas';

interface OnboardingData {
  step1: ProfessionalBackgroundData;
  step2: JobPreferencesData;
  step3: WorkPreferencesData;
  step4: NotificationPreferencesData;
  step5: ProfileCompletionData;
}

const STEPS = [
  {
    number: 1,
    title: 'Professional Background',
    description: 'Tell us about your career experience',
    icon: '👤'
  },
  {
    number: 2,
    title: 'Job Preferences',
    description: 'What kind of jobs are you looking for?',
    icon: '🎯'
  },
  {
    number: 3,
    title: 'Work Preferences',
    description: 'How do you prefer to work?',
    icon: '🏢'
  },
  {
    number: 4,
    title: 'Notifications & Privacy',
    description: 'Control your communication preferences',
    icon: '🔔'
  },
  {
    number: 5,
    title: 'Complete Your Profile',
    description: 'Add final details to boost your applications',
    icon: '✨'
  }
];

interface OnboardingWizardProps {
  onComplete?: () => void;
  allowSkip?: boolean;
  initialStep?: number;
}

export function OnboardingWizard({ 
  onComplete, 
  allowSkip = true, 
  initialStep = 1 
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const router = useRouter();
  const { user } = useAuth();

  // Store onboarding data
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});

  // Load saved progress on mount
  useEffect(() => {
    loadSavedProgress();
  }, []);

  // Auto-save when data changes
  useEffect(() => {
    if (hasUnsavedChanges) {
      const saveTimeout = setTimeout(() => {
        saveProgress();
      }, 2000);

      return () => clearTimeout(saveTimeout);
    }
  }, [onboardingData, hasUnsavedChanges]);

  const loadSavedProgress = async () => {
    try {
      const response = await fetch('/api/onboarding/progress');
      if (response.ok) {
        const progress: OnboardingProgressData = await response.json();
        if (progress.currentStep) {
          setCurrentStep(progress.currentStep);
        }
        if (progress.completedSteps) {
          setCompletedSteps(progress.completedSteps);
        }
      }
    } catch (error) {
      console.error('Failed to load saved progress:', error);
    }
  };

  const saveProgress = async () => {
    if (!hasUnsavedChanges) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/onboarding/progress', {
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
        setHasUnsavedChanges(false);
        setSuccess('Progress saved automatically');
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = (): number => {
    return Math.round((completedSteps.length / STEPS.length) * 100);
  };

  const updateStepData = (step: number, data: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [`step${step}`]: data
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
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const skipOnboarding = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/onboarding/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        onComplete?.();
        router.push('/dashboard');
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
      
      // Save final onboarding data
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: onboardingData,
          completedSteps: [...completedSteps, currentStep]
        })
      });

      if (response.ok) {
        setSuccess('Onboarding completed successfully!');
        setTimeout(() => {
          onComplete?.();
          router.push('/dashboard');
        }, 1500);
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
    const stepProps = {
      data: onboardingData[`step${currentStep}` as keyof OnboardingData],
      onDataChange: (data: any) => updateStepData(currentStep, data),
      onNext: goToNextStep,
      onPrevious: goToPreviousStep,
      isLoading
    };

    switch (currentStep) {
      case 1:
        return <ProfessionalBackgroundStep {...stepProps} />;
      case 2:
        return <JobPreferencesStep {...stepProps} />;
      case 3:
        return <WorkPreferencesStep {...stepProps} />;
      case 4:
        return <NotificationPreferencesStep {...stepProps} />;
      case 5:
        return <ProfileCompletionStep {...stepProps} />;
      default:
        return null;
    }
  };

  const currentStepInfo = STEPS[currentStep - 1];
  const isLastStep = currentStep === STEPS.length;
  const isFirstStep = currentStep === 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-blue-600">JobSwipe</div>
              <div className="hidden sm:block text-sm text-gray-500">
                Welcome, {user?.name || 'there'}! Let's set up your profile.
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {hasUnsavedChanges && (
                <div className="flex items-center text-sm text-amber-600">
                  <Save className="h-4 w-4 mr-1" />
                  Auto-saving...
                </div>
              )}
              
              {allowSkip && (
                <Button
                  variant="ghost"
                  onClick={skipOnboarding}
                  disabled={isLoading}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Skip for now
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <OnboardingProgressBar 
        currentStep={currentStep}
        totalSteps={STEPS.length}
        completedSteps={completedSteps}
        progress={calculateProgress()}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Step Navigation */}
          <div className="lg:col-span-1">
            <StepIndicator
              steps={STEPS}
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={goToStep}
            />
          </div>

          {/* Step Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {/* Step Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="text-2xl">{currentStepInfo.icon}</div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {currentStepInfo.title}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {currentStepInfo.description}
                    </p>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  Step {currentStep} of {STEPS.length}
                </div>
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderCurrentStep()}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={goToPreviousStep}
                  disabled={isFirstStep || isLoading}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>

                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={saveProgress}
                    disabled={!hasUnsavedChanges || isLoading}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Progress</span>
                  </Button>

                  {isLastStep ? (
                    <Button
                      onClick={completeOnboarding}
                      disabled={isLoading}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Complete Setup</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={goToNextStep}
                      disabled={isLoading}
                      className="flex items-center space-x-2"
                    >
                      <span>Next</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}