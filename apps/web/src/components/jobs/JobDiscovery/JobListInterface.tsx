'use client';

/**
 * Job List Interface Component
 * Provides a traditional list view for job browsing
 */

import React, { useState, useCallback } from 'react';
import { JobCard } from '@/components/jobs/JobCard';
import type { JobData } from '@/components/jobs/types/job';
import type { JobFilters } from '@/components/jobs/types/filters';
import { queueApi, generateDeviceId, calculatePriority, type SwipeRightRequest } from '@/lib/api/queue';

interface JobListInterfaceProps {
  jobs: JobData[];
  searchQuery?: string;
  filters?: JobFilters;
  onApplicationUpdate?: (stats: { totalApplications: number; todayApplications: number; successRate: number }) => void;
}

export function JobListInterface({ jobs, searchQuery, filters, onApplicationUpdate }: JobListInterfaceProps) {
  const [applicationStats, setApplicationStats] = useState({
    totalApplications: 0,
    todayApplications: 0,
    successRate: 0
  });
  const [applyingJobs, setApplyingJobs] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info', message: string, jobId?: string } | null>(null);

  const handleJobApply = useCallback(async (job: JobData) => {
    setApplyingJobs(prev => new Set(prev).add(job.id));
    setFeedback(null);
    
    try {
      const deviceId = generateDeviceId();
      const priority = calculatePriority(job.isUrgent);
      
      const request: SwipeRightRequest = {
        jobId: job.id,
        priority,
        metadata: {
          source: 'web_list',
          deviceId,
          userAgent: navigator.userAgent,
        }
      };
      
      const response = await queueApi.swipeRight(request);
      
      if (response.success && response.data) {
        const newStats = {
          totalApplications: applicationStats.totalApplications + 1,
          todayApplications: applicationStats.todayApplications + 1,
          successRate: 95
        };
        setApplicationStats(newStats);
        onApplicationUpdate?.(newStats);
        
        setFeedback({
          type: 'success',
          message: `Application queued for ${job.title}! 🚀`,
          jobId: job.id
        });
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
        message: errorMessage,
        jobId: job.id
      });
    } finally {
      setApplyingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(job.id);
        return newSet;
      });
      
      setTimeout(() => setFeedback(null), 5000);
    }
  }, [applicationStats, onApplicationUpdate]);

  const handleJobSave = useCallback((job: JobData) => {
    console.log('💾 Saved job:', job.title);
    // TODO: Implement save functionality
  }, []);

  const handleJobShare = useCallback((job: JobData) => {
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

  // Show empty state if no jobs
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
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Feedback Messages */}
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

      {/* Job List */}
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <JobCard 
              job={job}
              variant="list"
              onApply={() => handleJobApply(job)}
              onSave={() => handleJobSave(job)}
              onShare={() => handleJobShare(job)}
              isApplying={applyingJobs.has(job.id)}
              feedback={feedback?.jobId === job.id ? feedback : undefined}
            />
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="text-center p-8">
        <button className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Load More Jobs
        </button>
      </div>
    </div>
  );
}