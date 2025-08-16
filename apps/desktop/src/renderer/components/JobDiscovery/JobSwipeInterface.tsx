/**
 * Job Swipe Interface Component for Desktop
 * Main interface for job swiping with enterprise automation integration
 */

import React, { useState, useCallback } from 'react';
import { JobSwipeContainer } from '../JobSwipe/JobSwipeContainer';
import { useElectron } from '../providers/ElectronContextProvider';
import type { SwipeAnalytics, ExpansionTrigger } from '../../types/jobSwipe';
import type { JobData, ApplicationStats } from '../../types/job';

interface JobSwipeInterfaceProps {
  jobs: JobData[];
  searchQuery?: string;
  onApplicationUpdate?: (stats: ApplicationStats) => void;
}

export function JobSwipeInterface({ 
  jobs, 
  searchQuery, 
  onApplicationUpdate 
}: JobSwipeInterfaceProps) {
  const { api: electronAPI, isElectron } = useElectron();
  
  const [swipeStats, setSwipeStats] = useState({
    totalSwipes: 0,
    leftSwipes: 0,
    rightSwipes: 0,
    expansions: 0
  });
  
  const [isApplying, setIsApplying] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ 
    type: 'success' | 'error' | 'info', 
    message: string 
  } | null>(null);

  // Handle swipe left (pass on job)
  const handleSwipeLeft = useCallback((job: JobData, analytics: SwipeAnalytics) => {
    console.log('👈 Passed on job:', job.title, 'Analytics:', analytics);
    
    setSwipeStats(prev => ({
      ...prev,
      totalSwipes: prev.totalSwipes + 1,
      leftSwipes: prev.leftSwipes + 1
    }));

    // Track analytics in main process if available
    if (electronAPI) {
      // Could send analytics to main process for tracking
      console.log('Desktop analytics:', analytics);
    }
  }, [electronAPI]);

  // Handle swipe right (apply to job)
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
      if (electronAPI?.applyToJob) {
        // Use Electron API for job application with enterprise automation
        const response = await electronAPI.applyToJob(job.id, job);
        
        if (response.success && response.queueId) {
          setFeedback({
            type: 'success',
            message: `Application queued for ${job.title}! 🚀 Queue ID: ${response.queueId.slice(0, 8)}...`
          });
          
          // Update parent component with application stats
          const newStats: ApplicationStats = {
            totalApplications: swipeStats.rightSwipes + 1,
            todayApplications: swipeStats.rightSwipes + 1, // TODO: Calculate actual today count
            successRate: 95 // TODO: Calculate actual success rate
          };
          onApplicationUpdate?.(newStats);
          
          // Show more detailed success message for desktop
          setTimeout(() => {
            setFeedback({
              type: 'info',
              message: `JobSwipe automation will apply to ${job.company.name} in the background.`
            });
          }, 2000);
          
        } else {
          throw new Error(response.error || 'Failed to queue application');
        }
      } else {
        // Fallback for non-Electron environments
        setFeedback({
          type: 'info',
          message: `Would apply to ${job.title} (Desktop automation not available)`
        });
      }
      
    } catch (error) {
      console.error('❌ Failed to queue job application:', error);
      
      let errorMessage = 'Failed to apply to job. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('User not authenticated')) {
          errorMessage = 'Please log in to apply to jobs.';
        } else if (error.message.includes('Already applied')) {
          errorMessage = 'You have already applied to this job.';
        } else if (error.message.includes('automation')) {
          errorMessage = 'Automation service temporarily unavailable. Please try again.';
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
  }, [electronAPI, onApplicationUpdate, swipeStats.rightSwipes]);

  // Handle job save
  const handleJobSave = useCallback((job: JobData) => {
    console.log('💾 Saved job:', job.title);
    
    // Could integrate with local storage or database
    setFeedback({
      type: 'success',
      message: `Saved ${job.title} for later!`
    });
    
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  // Handle job share
  const handleJobShare = useCallback((job: JobData) => {
    console.log('🔗 Shared job:', job.title);
    
    if (electronAPI?.openJobInBrowser) {
      electronAPI.openJobInBrowser(job.applicationUrl);
    } else {
      // Fallback to clipboard
      const shareText = `Check out this ${job.title} position at ${job.company.name}!\n${job.applicationUrl}`;
      navigator.clipboard.writeText(shareText).then(() => {
        setFeedback({
          type: 'success',
          message: 'Job link copied to clipboard!'
        });
        setTimeout(() => setFeedback(null), 3000);
      }).catch(() => {
        setFeedback({
          type: 'error',
          message: 'Failed to copy link'
        });
        setTimeout(() => setFeedback(null), 3000);
      });
    }
  }, [electronAPI]);

  // Handle job expand
  const handleJobExpand = useCallback((job: JobData, trigger: ExpansionTrigger) => {
    console.log('📖 Expanded job details:', job.title, 'Trigger:', trigger);
    setSwipeStats(prev => ({
      ...prev,
      expansions: prev.expansions + 1
    }));
  }, []);

  // Handle empty queue
  const handleEmptyQueue = useCallback(() => {
    console.log('🎉 All jobs viewed!');
    setFeedback({
      type: 'info',
      message: 'You\'ve viewed all available jobs! Check back later for new opportunities.'
    });
    setTimeout(() => setFeedback(null), 5000);
  }, []);

  // Fetch more jobs (for infinite loading)
  const fetchMoreJobs = useCallback(async (offset: number, limit: number): Promise<JobData[]> => {
    if (electronAPI?.getJobs) {
      try {
        const moreJobs = await electronAPI.getJobs();
        return moreJobs || [];
      } catch (error) {
        console.error('Failed to fetch more jobs:', error);
        return [];
      }
    }
    
    // Simulate API delay for development
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [];
  }, [electronAPI]);

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
            {searchQuery 
              ? 'Try adjusting your search to find more opportunities.'
              : 'Check back later for new job opportunities!'}
          </p>
          {searchQuery && (
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear search
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
            enableKeyboardShortcuts: true,
            enableMouseGestures: true,
            debugMode: process.env.NODE_ENV === 'development'
          }}
        />
      </div>

      {/* Stats Badge for Applied Jobs */}
      {swipeStats.rightSwipes > 0 && (
        <div className="fixed top-20 left-4 z-30">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">
                {swipeStats.rightSwipes} applied
              </span>
              {isElectron && (
                <span className="text-xs text-blue-600">
                  (automating...)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced instructions for desktop */}
      {swipeStats.totalSwipes === 0 && (
        <div className="absolute bottom-6 left-4 right-4 z-40 pointer-events-none">
          <div className="max-w-md mx-auto bg-white rounded-lg p-4 shadow-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2 text-center">
              How to use JobSwipe Desktop
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div className="text-center">
                <div className="text-red-500 text-lg mb-1">←</div>
                <div>Swipe or press ← to pass</div>
              </div>
              <div className="text-center">
                <div className="text-green-500 text-lg mb-1">→</div>
                <div>Swipe or press → to apply</div>
              </div>
              <div className="text-center">
                <div className="text-blue-500 text-lg mb-1">↑</div>
                <div>Press ↑ to expand details</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-lg mb-1">Space</div>
                <div>Press Space to apply</div>
              </div>
            </div>
            {isElectron && (
              <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                <span className="text-xs text-blue-600 font-medium">
                  🤖 Desktop automation enabled
                </span>
              </div>
            )}
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
                <p className="text-sm font-medium text-blue-800">
                  {isElectron ? 'Starting automation...' : 'Processing application...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}