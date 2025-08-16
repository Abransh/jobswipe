/**
 * Main App Component for JobSwipe Desktop
 * Root component managing the entire desktop application
 */

import React, { useState, useEffect } from 'react';
import { JobSwipeInterface } from './components/JobDiscovery/JobSwipeInterface';
import { ElectronContextProvider } from './components/providers/ElectronContextProvider';
import type { JobData } from './types/job';

export function App() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial jobs on mount
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Request jobs from main process via IPC
      const jobsData = await window.electronAPI?.getJobs();
      if (jobsData) {
        setJobs(jobsData);
      } else {
        // Fallback to mock data for development
        setJobs(generateMockJobs());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock jobs for development
  const generateMockJobs = (): JobData[] => {
    return [
      {
        id: '1',
        title: 'Senior Software Engineer',
        company: {
          id: 'anthropic',
          name: 'Anthropic',
          logo: 'https://via.placeholder.com/64'
        },
        location: 'San Francisco, CA',
        salary: {
          min: 150000,
          max: 220000,
          currency: 'USD'
        },
        description: 'Join our AI safety team to build responsible AI systems.',
        requirements: ['React', 'TypeScript', 'Node.js', 'AI/ML'],
        benefits: ['Health insurance', 'Stock options', 'Remote work'],
        remote: true,
        isUrgent: false,
        postedAt: new Date(),
        applicationUrl: 'https://jobs.lever.co/anthropic/software-engineer'
      },
      {
        id: '2',
        title: 'Frontend Developer',
        company: {
          id: 'google',
          name: 'Google',
          logo: 'https://via.placeholder.com/64'
        },
        location: 'Mountain View, CA',
        salary: {
          min: 130000,
          max: 180000,
          currency: 'USD'
        },
        description: 'Build the next generation of web applications.',
        requirements: ['JavaScript', 'React', 'CSS', 'HTML'],
        benefits: ['Health insurance', 'Free meals', 'Gym access'],
        remote: false,
        isUrgent: true,
        postedAt: new Date(),
        applicationUrl: 'https://careers.google.com/jobs/frontend-developer'
      }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading JobSwipe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadJobs}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ElectronContextProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Desktop Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-gray-900">JobSwipe Desktop</h1>
                <span className="text-sm text-gray-500">
                  {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} available
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={loadJobs}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh jobs"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                
                <button
                  onClick={() => window.electronAPI?.openApplicationsView?.()}
                  className="inline-flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <span>Applications</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1">
          <JobSwipeInterface 
            jobs={jobs}
            onApplicationUpdate={(stats) => {
              console.log('Application stats updated:', stats);
            }}
          />
        </main>
      </div>
    </ElectronContextProvider>
  );
}