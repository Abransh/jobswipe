'use client';

import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
  onStepClick: (step: number) => void;
}

export function StepIndicator({
  steps,
  currentStep,
  completedSteps,
  onStepClick
}: StepIndicatorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Setup Steps</h3>
      
      <div className="space-y-2">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.number);
          const isCurrent = step.number === currentStep;
          const isClickable = step.number <= currentStep || isCompleted;
          
          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.number * 0.1 }}
            >
              <button
                onClick={() => isClickable && onStepClick(step.number)}
                disabled={!isClickable}
                className={`
                  w-full text-left p-4 rounded-lg border transition-all duration-200
                  ${isCurrent 
                    ? 'border-blue-500 bg-blue-50 shadow-sm' 
                    : isCompleted
                      ? 'border-green-500 bg-green-50 hover:bg-green-100'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }
                  ${isClickable && !isCurrent ? 'hover:border-gray-300 hover:bg-gray-100' : ''}
                  ${!isClickable ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-start space-x-3">
                  {/* Step Icon/Status */}
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium mt-0.5
                    ${isCurrent 
                      ? 'bg-blue-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-lg">{step.icon}</span>
                    )}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`
                        text-sm font-medium
                        ${isCurrent 
                          ? 'text-blue-900' 
                          : isCompleted 
                            ? 'text-green-900'
                            : 'text-gray-600'
                        }
                      `}>
                        {step.title}
                      </h4>
                      
                      {isCurrent && (
                        <ArrowRight className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    
                    <p className={`
                      text-xs mt-1 
                      ${isCurrent 
                        ? 'text-blue-700' 
                        : isCompleted 
                          ? 'text-green-700'
                          : 'text-gray-500'
                      }
                    `}>
                      {step.description}
                    </p>
                    
                    {/* Step Status */}
                    <div className="mt-2">
                      <span className={`
                        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${isCurrent 
                          ? 'bg-blue-100 text-blue-800' 
                          : isCompleted 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }
                      `}>
                        {isCurrent 
                          ? 'In Progress' 
                          : isCompleted 
                            ? 'Completed'
                            : 'Pending'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>
      
      {/* Quick Tips */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Quick Tips</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Your progress is saved automatically</li>
          <li>• You can go back to previous steps anytime</li>
          <li>• Complete more steps for better job matches</li>
          <li>• Skip any step if you want to come back later</li>
        </ul>
      </div>
    </div>
  );
}