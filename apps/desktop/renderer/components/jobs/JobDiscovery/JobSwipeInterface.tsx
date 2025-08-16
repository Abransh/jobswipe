'use client';

/**
 * Job Swipe Interface Component
 * Provides the familiar Tinder-like job swiping experience
 */

import React, { useState, useCallback } from 'react';
import { JobSwipeContainer } from '@/components/jobs/JobSwipe';
import type { SwipeAnalytics, ExpansionTrigger } from '@/components/jobs/types/jobSwipe';
import type { JobData } from '@/components/jobs/types/job';
import type { JobFilters } from '@/components/jobs/types/filters';
import { queueApi, generateDeviceId, calculatePriority, type SwipeRightRequest } from '@/lib/api/queue';

interface JobSwipeInterfaceProps {
  jobs: JobData[];
  searchQuery?: string;
  filters?: JobFilters;
  onApplicationUpdate?: (stats: { totalApplications: number; todayApplications: number; successRate: number }) => void;
}

export function JobSwipeInterface({ jobs, searchQuery, filters, onApplicationUpdate }: JobSwipeInterfaceProps) {
  const [swipeStats, setSwipeStats] = useState({
    totalSwipes: 0,
    leftSwipes: 0,
    rightSwipes: 0,
    expansions: 0
  });
  
  const [isApplying, setIsApplying] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  // Handle swipe events
  const handleSwipeLeft = useCallback((job: JobData, analytics: SwipeAnalytics) => {
    console.log('👈 Passed on job:', job.title, 'Analytics:', analytics);
    setSwipeStats(prev => ({
      ...prev,
      totalSwipes: prev.totalSwipes + 1,
      leftSwipes: prev.leftSwipes + 1
    }));
  }, []);

  const handleSwipeRight = useCallback(async (job: JobData, analytics: SwipeAnalytics) => {
    console.log('👉 Applying to job:', job.title, 'Analytics:', analytics);
    
    setSwipeStats(prev => ({
      ...prev,
      totalSwipes: prev.totalSwipes + 1,
      rightSwipes: prev.rightSwipes + 1
    }));
    
    setFeedback(null);
    setIsApplying(job.id);
    
    try {
      const deviceId = generateDeviceId();
      const priority = calculatePriority(job.isUrgent);
      
      const request: SwipeRightRequest = {
        jobId: job.id,
        priority,
        metadata: {
          source: 'web',
          deviceId,
          userAgent: navigator.userAgent,
        }
      };
      
      const response = await queueApi.swipeRight(request);
      
      if (response.success && response.data) {
        setFeedback({
          type: 'success',
          message: `Application queued for ${job.title}! 🚀`
        });
        
        // Update parent component with application stats
        const newStats = {
          totalApplications: swipeStats.rightSwipes + 1,
          todayApplications: swipeStats.rightSwipes + 1, // TODO: Calculate actual today count
          successRate: 95 // TODO: Calculate actual success rate
        };
        onApplicationUpdate?.(newStats);
      } else {
        throw new Error(response.error || 'Failed to queue application');
      }
      
    } catch (error) {
      console.error('❌ Failed to queue job application:', error);
      
      let errorMessage = 'Failed to apply to job. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('User not authenticated')) {
          errorMessage = 'Please log in to apply to jobs.';
        } else if (error.message.includes('Already applied')) {
          errorMessage = 'You have already applied to this job.';
        }
      }
      
      setFeedback({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsApplying(null);
      setTimeout(() => setFeedback(null), 5000);
    }
  }, [onApplicationUpdate, swipeStats.rightSwipes]);

  const handleJobSave = useCallback((job: JobData) => {
    console.log('💾 Saved job:', job.title);
  }, []);

  const handleJobShare = useCallback((job: JobData) => {
    console.log('🔗 Shared job:', job.title);
    
    if (navigator.share) {
      navigator.share({
        title: `${job.title} at ${job.company.name}`,
        text: `Check out this ${job.title} position!`,
        url: `https://jobswipe.com/jobs/${job.id}`
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(`https://jobswipe.com/jobs/${job.id}`);
    }
  }, []);

  const handleJobExpand = useCallback((job: JobData, trigger: ExpansionTrigger) => {
    console.log('📖 Expanded job details:', job.title, 'Trigger:', trigger);
    setSwipeStats(prev => ({
      ...prev,
      expansions: prev.expansions + 1
    }));
  }, []);

  const handleEmptyQueue = useCallback(() => {
    console.log('🎉 All jobs viewed!');
  }, []);

  const fetchMoreJobs = useCallback(async (offset: number, limit: number): Promise<JobData[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [];
  }, []);

  // Show empty state if no jobs match filters
  if (jobs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || Object.values(filters || {}).some(v => v && v !== 'any' && (!Array.isArray(v) || v.length > 0))
              ? 'Try adjusting your search or filters to find more opportunities.'
              : 'Check back later for new job opportunities!'}
          </p>
          {(searchQuery || Object.values(filters || {}).some(v => v && v !== 'any' && (!Array.isArray(v) || v.length > 0))) && (
            <button
              onClick={() => window.location.href = '/jobs'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Swipe Interface */}
      <div className="pt-4">
        <JobSwipeContainer
          jobs={jobs}
          fetchJobs={fetchMoreJobs}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onJobSave={handleJobSave}
          onJobShare={handleJobShare}
          onJobExpand={handleJobExpand}
          onEmptyQueue={handleEmptyQueue}
          config={{
            enableAnimations: true,
            autoExpandOnHover: true,
            hoverDelay: 300,
            trackAnalytics: true,
            debugMode: process.env.NODE_ENV === 'development'
          }}
        />
      </div>

      {/* Stats Badge for Applied Jobs */}
      {swipeStats.rightSwipes > 0 && (
        <div className="fixed top-20 left-4 z-30">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-800">
                {swipeStats.rightSwipes} applied
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Instructions for first-time users */}
      {swipeStats.totalSwipes === 0 && (
        <div className="absolute bottom-6 left-4 right-4 z-40 pointer-events-none">
          <div className="max-w-md mx-auto bg-white rounded-lg p-4 shadow-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2 text-center">How to use JobSwipe</h4>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <span className="text-red-500">←</span>
                <span>Pass</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-green-500">→</span>
                <span>Apply</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-blue-500">↑</span>
                <span>Details</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application feedback */}
      {feedback && (
        <div className="fixed top-20 left-4 right-4 z-50 pointer-events-none">
          <div className="max-w-md mx-auto">
            <div className={`
              rounded-lg p-3 shadow-md border
              ${feedback.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
              ${feedback.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
              ${feedback.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
            `}>
              <p className="text-sm font-medium">{feedback.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Processing indicator */}
      {isApplying && (
        <div className="fixed top-20 left-4 right-4 z-50 pointer-events-none">
          <div className="max-w-md mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-md">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <p className="text-sm font-medium text-blue-800">Applying...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}