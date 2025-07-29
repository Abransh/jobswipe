'use client';

import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  number: number;
  title: string;
  description: string;
  icon: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
}

export function StepIndicator({
  steps,
  currentStep,
  completedSteps,
  onStepClick
}: StepIndicatorProps) {
  const isStepCompleted = (stepNumber: number) => {
    return completedSteps.includes(stepNumber);
  };

  const isStepCurrent = (stepNumber: number) => {
    return stepNumber === currentStep;
  };

  const isStepClickable = (stepNumber: number) => {
    // Allow clicking on completed steps and current step
    return isStepCompleted(stepNumber) || isStepCurrent(stepNumber);
  };

  return (
    <nav className="space-y-1">
      {steps.map((step, index) => {
        const isCompleted = isStepCompleted(step.number);
        const isCurrent = isStepCurrent(step.number);
        const isClickable = isStepClickable(step.number);

        return (
          <div key={step.number} className="relative">
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "absolute left-4 top-8 w-0.5 h-12 -ml-px",
                  isCompleted ? "bg-blue-600" : "bg-gray-200"
                )}
              />
            )}

            {/* Step Content */}
            <button
              type="button"
              onClick={() => isClickable && onStepClick?.(step.number)}
              disabled={!isClickable}
              className={cn(
                "relative flex items-start w-full p-3 rounded-lg text-left transition-all duration-200",
                isCurrent && "bg-blue-50 border border-blue-200",
                isCompleted && !isCurrent && "hover:bg-gray-50",
                !isClickable && "cursor-not-allowed opacity-60",
                isClickable && "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              )}
            >
              {/* Step Icon/Number */}
              <div className="flex-shrink-0 flex items-center justify-center">
                {isCompleted ? (
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                ) : (
                  <div
                    className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-full border-2",
                      isCurrent
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 bg-white text-gray-500"
                    )}
                  >
                    {isCurrent ? (
                      <Circle className="h-4 w-4 fill-current" />
                    ) : (
                      <span className="text-sm font-medium">{step.number}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Step Content */}
              <div className="ml-3 min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{step.icon}</span>
                  <h3
                    className={cn(
                      "text-sm font-medium",
                      isCurrent ? "text-blue-900" : "text-gray-900"
                    )}
                  >
                    {step.title}
                  </h3>
                </div>
                <p
                  className={cn(
                    "mt-1 text-xs",
                    isCurrent ? "text-blue-700" : "text-gray-500"
                  )}
                >
                  {step.description}
                </p>
              </div>

              {/* Status Indicator */}
              <div className="flex-shrink-0 flex items-center">
                {isCompleted && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Complete
                  </span>
                )}
                {isCurrent && !isCompleted && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Current
                  </span>
                )}
              </div>
            </button>
          </div>
        );
      })}
    </nav>
  );
}