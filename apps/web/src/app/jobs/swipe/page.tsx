'use client';

/**
 * Enhanced JobSwipe Demo Page
 * Showcases the minimalistic single-card swipe experience
 */

import React, { useState, useCallback } from 'react';
import { JobSwipeContainer } from '@/components/jobs/JobSwipe';
import type { SwipeAnalytics, ExpansionTrigger } from '@/components/jobs/types/jobSwipe';
import type { JobData } from '@/components/jobs/types/job';
import { queueApi, generateDeviceId, calculatePriority, type SwipeRightRequest } from '@/lib/api/queue';

export default function JobSwipePage() {
  const [swipeStats, setSwipeStats] = useState({
    totalSwipes: 0,
    leftSwipes: 0,
    rightSwipes: 0,
    expansions: 0
  });
  
  const [currentTheme, setCurrentTheme] = useState<'default' | 'minimal' | 'dark' | 'warm'>('default');
  const [isApplying, setIsApplying] = useState<string | null>(null); // jobId being applied to
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  // Mock job data optimized for swipe experience
  const mockJobs: JobData[] = [
    {
      id: '1',
      title: 'Senior Frontend Engineer',
      company: {
        id: 'company-1',
        name: 'TechFlow',
        logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=100&h=100&fit=crop&crop=center',
        industry: 'Technology',
        size: 'MEDIUM',
        headquarters: 'San Francisco, CA',
        isVerified: true
      },
      description: 'Join our innovative team building the future of web applications. We\'re looking for a passionate frontend engineer who loves creating beautiful, responsive interfaces that delight users. You\'ll work with React, TypeScript, and cutting-edge tools while collaborating with a world-class design team.',
      location: 'San Francisco, CA',
      city: 'San Francisco',
      state: 'CA',
      country: 'US',
      salaryMin: 140000,
      salaryMax: 200000,
      currency: 'USD',
      salaryType: 'ANNUAL',
      equity: true,
      remote: true,
      remoteType: 'HYBRID',
      type: 'FULL_TIME',
      level: 'SENIOR',
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL', 'AWS', 'Figma'],
      benefits: 'Comprehensive health insurance, unlimited PTO, $5k learning budget, equity package, remote work stipend, top-tier equipment',
      postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      applicationCount: 45,
      viewCount: 234,
      isUrgent: false,
      isFeatured: true,
      isVerified: true
    },
    {
      id: '2',
      title: 'Product Designer',
      company: {
        id: 'company-2',
        name: 'DesignLab',
        logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center',
        industry: 'Design',
        size: 'SMALL',
        headquarters: 'New York, NY',
        isVerified: false
      },
      description: 'Shape the future of digital experiences as our next Product Designer. You\'ll own the end-to-end design process, from user research to pixel-perfect prototypes. We value creativity, user empathy, and collaborative problem-solving in a fast-paced startup environment.',
      location: 'New York, NY',
      city: 'New York',
      state: 'NY',
      salaryMin: 95000,
      salaryMax: 140000,
      currency: 'USD',
      salaryType: 'ANNUAL',
      remote: true,
      remoteType: 'REMOTE',
      type: 'FULL_TIME',
      level: 'MID',
      skills: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'Design Systems'],
      benefits: 'Health insurance, flexible PTO, design conference budget, modern workspace, catered lunches',
      postedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      applicationCount: 18,
      viewCount: 89,
      isUrgent: true,
      isFeatured: false,
      isVerified: false
    },
    {
      id: '3',
      title: 'Full Stack Engineer',
      company: {
        id: 'company-3',
        name: 'InnovateCorp',
        logo: null,
        industry: 'Fintech',
        size: 'STARTUP',
        headquarters: 'Austin, TX',
        isVerified: true
      },
      description: 'Build the next generation of financial technology with our lean, high-impact team. You\'ll work across our entire stack, from React frontends to Node.js microservices, helping democratize access to financial services for millions of users.',
      location: 'Austin, TX',
      city: 'Austin',
      state: 'TX',
      salaryMin: 110000,
      salaryMax: 150000,
      currency: 'USD',
      salaryType: 'ANNUAL',
      equity: true,
      remote: false,
      remoteType: 'ONSITE',
      type: 'FULL_TIME',
      level: 'MID',
      skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'AWS', 'Docker', 'GraphQL'],
      benefits: 'Equity package, health insurance, 401k matching, team lunches, standing desk setup',
      postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      applicationCount: 67,
      viewCount: 312,
      isUrgent: false,
      isFeatured: false,
      isVerified: true
    },
    {
      id: '4',
      title: 'DevOps Engineer',
      company: {
        id: 'company-4',
        name: 'CloudScale',
        logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop&crop=center',
        industry: 'Cloud Infrastructure',
        size: 'LARGE',
        headquarters: 'Seattle, WA',
        isVerified: true
      },
      description: 'Lead infrastructure automation and scaling initiatives for our cloud platform serving millions of developers. You\'ll architect CI/CD pipelines, optimize cloud costs, and ensure 99.99% uptime across our global infrastructure.',
      location: 'Seattle, WA',
      city: 'Seattle',
      state: 'WA',
      salaryMin: 130000,
      salaryMax: 180000,
      currency: 'USD',
      salaryType: 'ANNUAL',
      remote: true,
      remoteType: 'HYBRID',
      type: 'FULL_TIME',
      level: 'SENIOR',
      skills: ['Kubernetes', 'AWS', 'Terraform', 'Docker', 'Python', 'Monitoring', 'CI/CD'],
      benefits: 'Stock options, comprehensive insurance, unlimited PTO, $10k annual learning budget',
      postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      applicationCount: 89,
      viewCount: 445,
      isUrgent: false,
      isFeatured: true,
      isVerified: true
    },
    {
      id: '5',
      title: 'Mobile App Developer',
      company: {
        id: 'company-5',
        name: 'AppFlow',
        logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&h=100&fit=crop&crop=center',
        industry: 'Mobile Technology',
        size: 'MEDIUM',
        headquarters: 'Los Angeles, CA',
        isVerified: false
      },
      description: 'Craft beautiful, performant mobile experiences that reach millions of users. Join our mobile team to build cross-platform apps using React Native and native iOS/Android technologies.',
      location: 'Los Angeles, CA',
      city: 'Los Angeles',
      state: 'CA',
      salaryMin: 105000,
      salaryMax: 145000,
      currency: 'USD',
      salaryType: 'ANNUAL',
      remote: true,
      remoteType: 'REMOTE',
      type: 'FULL_TIME',
      level: 'MID',
      skills: ['React Native', 'Swift', 'Kotlin', 'JavaScript', 'Firebase', 'App Store Optimization'],
      benefits: 'Health insurance, flexible hours, remote work, professional development budget',
      postedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      applicationCount: 34,
      viewCount: 178,
      isUrgent: true,
      isFeatured: false,
      isVerified: false
    }
  ];

  // Handle swipe events
  const handleSwipeLeft = useCallback((job: JobData, analytics: SwipeAnalytics) => {
    console.log('👈 Passed on job:', job.title, 'Analytics:', analytics);
    setSwipeStats(prev => ({
      ...prev,
      totalSwipes: prev.totalSwipes + 1,
      leftSwipes: prev.leftSwipes + 1
    }));
    
    // Could integrate with backend API here
    // await markJobAsNotInterested(job.id);
  }, []);

  const handleSwipeRight = useCallback(async (job: JobData, analytics: SwipeAnalytics) => {
    console.log('👉 Applying to job:', job.title, 'Analytics:', analytics);
    
    // Update stats immediately for UI responsiveness
    setSwipeStats(prev => ({
      ...prev,
      totalSwipes: prev.totalSwipes + 1,
      rightSwipes: prev.rightSwipes + 1
    }));
    
    // Clear previous feedback
    setFeedback(null);
    setIsApplying(job.id);
    
    try {
      // Prepare queue request
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
      
      // Queue the job application
      const response = await queueApi.swipeRight(request);
      
      if (response.success && response.data) {
        setFeedback({
          type: 'success',
          message: `Application queued for ${job.title} at ${job.company.name}! 🚀`
        });
        
        console.log('✅ Job application queued successfully:', {
          applicationId: response.data.applicationId,
          snapshotId: response.data.snapshotId,
          status: response.data.status,
          priority: response.data.priority
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
        } else if (error.message.includes('Job not found')) {
          errorMessage = 'This job is no longer available.';
        } else if (error.message.includes('Job is no longer active')) {
          errorMessage = 'This job posting has expired.';
        }
      }
      
      setFeedback({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsApplying(null);
      
      // Clear feedback after 5 seconds
      setTimeout(() => {
        setFeedback(null);
      }, 5000);
    }
  }, []);

  const handleJobSave = useCallback((job: JobData) => {
    console.log('💾 Saved job:', job.title);
    // Could integrate with backend API here
    // await saveJobForLater(job.id);
  }, []);

  const handleJobShare = useCallback((job: JobData) => {
    console.log('🔗 Shared job:', job.title);
    
    if (navigator.share) {
      navigator.share({
        title: `${job.title} at ${job.company.name}`,
        text: `Check out this ${job.title} position at ${job.company.name}!`,
        url: `https://jobswipe.com/jobs/${job.id}`
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(`https://jobswipe.com/jobs/${job.id}`);
      // Could show a toast notification here
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
    // Could navigate to results page or show completion UI
  }, []);

  // Mock function to simulate loading more jobs
  const fetchMoreJobs = useCallback(async (offset: number, limit: number): Promise<JobData[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return empty array to simulate no more jobs (for demo)
    return [];
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">JobSwipe</h1>
            
            {/* Theme Selector & Stats */}
            <div className="flex items-center space-x-6">
              {/* Theme Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 font-medium">Theme:</span>
                <select 
                  value={currentTheme}
                  onChange={(e) => setCurrentTheme(e.target.value as any)}
                  className="text-xs bg-white/80 backdrop-blur-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="default">Default</option>
                  <option value="minimal">Minimal</option>
                  <option value="dark">Dark</option>
                  <option value="warm">Warm</option>
                </select>
              </div>
              
              {/* Stats and Applications Link */}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>{swipeStats.rightSwipes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span>{swipeStats.leftSwipes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>{swipeStats.expansions}</span>
                </div>
                
                {/* Applications Dashboard Link */}
                {swipeStats.rightSwipes > 0 && (
                  <a
                    href="/dashboard/applications"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <span>📊</span>
                    <span>View Applications</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main JobSwipe Interface */}
      <div className="pt-20">
        <JobSwipeContainer
          jobs={mockJobs}
          fetchJobs={fetchMoreJobs}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onJobSave={handleJobSave}
          onJobShare={handleJobShare}
          onJobExpand={handleJobExpand}
          onEmptyQueue={handleEmptyQueue}
          className={`theme-${currentTheme}`}
          config={{
            enableAnimations: true,
            autoExpandOnHover: true,
            hoverDelay: 300,
            trackAnalytics: true,
            debugMode: process.env.NODE_ENV === 'development'
          }}
        />
      </div>

      {/* Instructions overlay (for first time users) */}
      {swipeStats.totalSwipes === 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-40 pointer-events-none">
          <div className="max-w-md mx-auto bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/50">
            <h3 className="font-semibold text-gray-900 mb-2">How to JobSwipe</h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="text-lg">👈</span>
                <span>Swipe left to pass</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">👉</span>
                <span>Swipe right to apply</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">👆</span>
                <span>Tap/hover for details</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">⌨️</span>
                <span>Use arrow keys</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Status Feedback */}
      {feedback && (
        <div className={`fixed top-20 left-4 right-4 z-60 pointer-events-none`}>
          <div className="max-w-md mx-auto">
            <div className={`
              backdrop-blur-sm rounded-lg p-4 shadow-lg border
              ${feedback.type === 'success' ? 'bg-green-500/90 border-green-400/50 text-white' : ''}
              ${feedback.type === 'error' ? 'bg-red-500/90 border-red-400/50 text-white' : ''}
              ${feedback.type === 'info' ? 'bg-blue-500/90 border-blue-400/50 text-white' : ''}
              transition-all duration-300 ease-out
            `}>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {feedback.type === 'success' && <span className="text-xl">✅</span>}
                  {feedback.type === 'error' && <span className="text-xl">❌</span>}
                  {feedback.type === 'info' && <span className="text-xl">ℹ️</span>}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{feedback.message}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Processing Indicator */}
      {isApplying && (
        <div className="fixed top-20 left-4 right-4 z-60 pointer-events-none">
          <div className="max-w-md mx-auto">
            <div className="bg-blue-500/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-blue-400/50 text-white">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Queueing job application...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Development stats (visible in dev mode only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono space-y-1 z-50">
          <div>Total Swipes: {swipeStats.totalSwipes}</div>
          <div>Apply Rate: {swipeStats.totalSwipes > 0 ? Math.round((swipeStats.rightSwipes / swipeStats.totalSwipes) * 100) : 0}%</div>
          <div>Expansion Rate: {swipeStats.totalSwipes > 0 ? Math.round((swipeStats.expansions / swipeStats.totalSwipes) * 100) : 0}%</div>
          {isApplying && <div className="text-blue-400">Applying: {isApplying}</div>}
        </div>
      )}
    </div>
  );
}