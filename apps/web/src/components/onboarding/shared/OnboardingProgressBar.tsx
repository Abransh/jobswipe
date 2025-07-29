'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OnboardingProgressBarProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  progress: number;
}

export function OnboardingProgressBar({
  currentStep,
  totalSteps,
  completedSteps,
  progress
}: OnboardingProgressBarProps) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-700">
            Step {currentStep} of {totalSteps}
          </div>
          <div className="text-sm text-gray-500">
            {progress}% Complete
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="relative">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            {/* Progress Fill */}
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>

          {/* Step Markers */}
          <div className="absolute top-0 left-0 w-full h-2 flex justify-between">
            {Array.from({ length: totalSteps }, (_, index) => {
              const stepNumber = index + 1;
              const isCompleted = completedSteps.includes(stepNumber);
              const isCurrent = stepNumber === currentStep;
              const stepProgress = ((stepNumber - 1) / (totalSteps - 1)) * 100;

              return (
                <div
                  key={stepNumber}
                  className="relative flex items-center justify-center"
                  style={{ 
                    left: `${stepProgress}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {/* Step Marker */}
                  <motion.div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 bg-white z-10 transition-colors duration-300",
                      isCompleted && "border-blue-600 bg-blue-600",
                      isCurrent && !isCompleted && "border-blue-600 bg-white",
                      !isCompleted && !isCurrent && "border-gray-300 bg-white"
                    )}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: isCurrent ? 1.2 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isCompleted && (
                      <motion.div
                        className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                      />
                    )}
                  </motion.div>

                  {/* Step Label */}
                  <div
                    className={cn(
                      "absolute top-6 text-xs font-medium whitespace-nowrap",
                      isCurrent ? "text-blue-600" : "text-gray-500"
                    )}
                  >
                    {stepNumber}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Text */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          {completedSteps.length === totalSteps ? (
            <span className="text-green-600 font-medium">
              🎉 Onboarding Complete!
            </span>
          ) : (
            <span>
              {completedSteps.length} of {totalSteps} steps completed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}