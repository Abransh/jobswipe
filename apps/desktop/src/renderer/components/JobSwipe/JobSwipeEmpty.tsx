/**
 * JobSwipeEmpty Component for Desktop
 * Empty state when no jobs are available
 */

import React from 'react';
import type { DeviceType, JobSwipeConfig } from '../../types/jobSwipe';

interface JobSwipeEmptyProps {
  onRefresh: () => void;
  deviceType: DeviceType;
  config: JobSwipeConfig;
}

export function JobSwipeEmpty({ onRefresh, deviceType, config }: JobSwipeEmptyProps) {
  return (
    <div className="jobswipe-empty">
      <div className="max-w-md mx-auto p-8">
        {/* Empty State Icon */}
        <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
          <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
          </svg>
        </div>

        {/* Main Message */}
        <h3 className="text-2xl font-semibold text-gray-900 mb-3 text-center">
          You're all caught up! 🎉
        </h3>
        <p className="text-gray-600 mb-6 text-center">
          You've viewed all available jobs. New opportunities are added daily, so check back soon!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={onRefresh}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Jobs
          </button>

          <button
            onClick={() => {
              // Could open job alerts or preferences
              console.log('Set up job alerts');
            }}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h5m5 0v5h5l-5-5z" />
            </svg>
            Set up Job Alerts
          </button>
        </div>

        {/* Tips for Desktop Users */}
        {deviceType === 'desktop' && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3 text-center">
              💡 While you wait for new jobs
            </h4>
            <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Review your saved jobs</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 002 2v2a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 00-2 2h-2a2 2 0 00-2 2v6" />
                </svg>
                <span>Check your application status</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Update your job preferences</span>
              </div>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Reminder */}
        {deviceType === 'desktop' && config.enableKeyboardShortcuts && (
          <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="text-xs font-medium text-blue-900 mb-2 text-center">
              Keyboard Shortcuts
            </h5>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
              <div className="text-center">
                <kbd className="px-1 py-0.5 bg-blue-200 rounded text-blue-900 font-mono">R</kbd>
                <div>Refresh</div>
              </div>
              <div className="text-center">
                <kbd className="px-1 py-0.5 bg-blue-200 rounded text-blue-900 font-mono">Ctrl+S</kbd>
                <div>Save jobs</div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics (if available) */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">24</div>
              <div className="text-xs text-gray-500">Jobs viewed</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">12</div>
              <div className="text-xs text-gray-500">Applied</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">6</div>
              <div className="text-xs text-gray-500">Saved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}