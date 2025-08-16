/**
 * JobSwipeLoading Component for Desktop
 * Loading state for job swipe interface
 */

import React from 'react';
import type { DeviceType, JobSwipeConfig } from '../../types/jobSwipe';

interface JobSwipeLoadingProps {
  deviceType: DeviceType;
  config: JobSwipeConfig;
}

export function JobSwipeLoading({ deviceType, config }: JobSwipeLoadingProps) {
  return (
    <div className="jobswipe-loading">
      <div className="text-center">
        {/* Animated Logo or Spinner */}
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="currentColor" fill="none"/>
            </svg>
          </div>
        </div>

        {/* Loading Text */}
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Loading jobs...
        </h3>
        <p className="text-gray-600 mb-4">
          Finding the best opportunities for you
        </p>

        {/* Loading Steps */}
        <div className="max-w-xs mx-auto space-y-2">
          <LoadingStep 
            text="Fetching job listings"
            isActive={true}
            isComplete={false}
          />
          <LoadingStep 
            text="Calculating match scores"
            isActive={false}
            isComplete={false}
          />
          <LoadingStep 
            text="Preparing swipe interface"
            isActive={false}
            isComplete={false}
          />
        </div>

        {/* Desktop Specific Tips */}
        {deviceType === 'desktop' && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              💡 Desktop Tips
            </h4>
            <ul className="text-xs text-blue-800 space-y-1 text-left">
              <li>• Use arrow keys to swipe through jobs</li>
              <li>• Press Space or Enter to apply</li>
              <li>• Use Ctrl+S to save jobs for later</li>
              <li>• Double-click cards to expand details</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

interface LoadingStepProps {
  text: string;
  isActive: boolean;
  isComplete: boolean;
}

function LoadingStep({ text, isActive, isComplete }: LoadingStepProps) {
  return (
    <div className="flex items-center space-x-3 text-sm">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
        isComplete 
          ? 'bg-green-500 text-white'
          : isActive 
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-400'
      }`}>
        {isComplete ? (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : isActive ? (
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        ) : (
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        )}
      </div>
      <span className={`${
        isComplete 
          ? 'text-green-600 font-medium'
          : isActive 
            ? 'text-blue-600 font-medium'
            : 'text-gray-500'
      }`}>
        {text}
      </span>
    </div>
  );
}