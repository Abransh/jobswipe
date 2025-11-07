'use client';

/**
 * Job Swipe Interface Component
 * Provides the familiar Tinder-like job swiping experience
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { JobCard } from '@/components/jobs/JobCard';
import { JobDetailModal } from '@/components/jobs/JobDetailModal/JobDetailModal';
import { LoginPromptModal } from '@/components/auth/LoginPromptModal';
import type { JobData } from '@/components/jobs/types/job';
import type { JobFilters } from '@/components/jobs/types/filters';
import { jobsApi, generateDeviceId, calculatePriority } from '@/lib/api/jobs';

interface JobSwipeInterfaceProps {
  jobs: JobData[];
  searchQuery?: string;
  filters?: JobFilters;
  onApplicationUpdate?: (stats: { totalApplications: number; todayApplications: number; successRate: number }) => void;
  fetchMoreJobs?: (offset: number, limit: number) => Promise<JobData[]>;
}

export function JobSwipeInterface({ jobs, searchQuery, filters, onApplicationUpdate }: JobSwipeInterfaceProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [swipeStats, setSwipeStats] = useState({
    totalSwipes: 0,
    leftSwipes: 0,
    rightSwipes: 0,
    expansions: 0
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isApplying, setIsApplying] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info', message: string, jobId?: string } | null>(null);
  const [cardStack, setCardStack] = useState<JobData[]>(jobs.slice(0, 3)); // Show 3 cards in stack

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);

  // Login prompt modal state
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);

  // Update card stack when jobs change
  useEffect(() => {
    setCardStack(jobs.slice(currentIndex, currentIndex + 3));
  }, [jobs, currentIndex]);

  // Check for pending swipe on mount (after successful login)
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const pendingSwipeJobId = sessionStorage.getItem('pending_swipe_job_id');
      if (pendingSwipeJobId) {
        console.log('🔄 [PENDING SWIPE] Executing pending swipe for job:', pendingSwipeJobId);
        sessionStorage.removeItem('pending_swipe_job_id');

        // Small delay to ensure UI is ready
        setTimeout(() => {
          handleSwipeRight(pendingSwipeJobId);
        }, 500);
      }
    }
  }, [authLoading, isAuthenticated]);

  // Handle swipe events
  const handleSwipeLeft = useCallback(async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
      console.error('❌ [JobSwipeInterface] Job not found for left swipe:', jobId);
      return;
    }

    console.log('👈 [SWIPE LEFT]', {
      jobId,
      jobTitle: job.title,
      company: job.company.name,
      timestamp: new Date().toISOString(),
      view: 'swipe'
    });

    setSwipeStats(prev => ({
      ...prev,
      totalSwipes: prev.totalSwipes + 1,
      leftSwipes: prev.leftSwipes + 1
    }));

    try {
      // Call API for left swipe (pass on job)
      const deviceId = generateDeviceId();
      const metadata = {
        source: 'web' as const,
        deviceId,
        userAgent: navigator.userAgent,
      };

      await jobsApi.swipeLeft(job.id, metadata);
      console.log('✅ [LEFT SWIPE RECORDED]', { jobId, jobTitle: job.title });
    } catch (error) {
      console.error('🔴 [LEFT SWIPE ERROR]', {
        jobId,
        jobTitle: job.title,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Move to next card
    setCurrentIndex(prev => Math.min(prev + 1, jobs.length - 1));
  }, [jobs]);

  const handleSwipeRight = useCallback(async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
      console.error('❌ [JobSwipeInterface] Job not found:', jobId);
      return;
    }

    // Check authentication before proceeding
    if (!authLoading && !isAuthenticated) {
      console.log('🔒 [AUTH CHECK] User not authenticated, showing login prompt');
      setPendingJobId(jobId);
      sessionStorage.setItem('pending_swipe_job_id', jobId);
      setIsLoginPromptOpen(true);
      return;
    }

    console.log('🔵 [SWIPE START]', {
      jobId,
      jobTitle: job.title,
      company: job.company.name,
      timestamp: new Date().toISOString(),
      view: 'swipe'
    });

    // Update stats immediately for UI feedback
    const newRightSwipes = swipeStats.rightSwipes + 1;
    setSwipeStats(prev => ({
      ...prev,
      totalSwipes: prev.totalSwipes + 1,
      rightSwipes: newRightSwipes
    }));

    setFeedback(null);
    setIsApplying(job.id);

    try {
      const deviceId = generateDeviceId();
      const priority = calculatePriority(job.isUrgent);

      const metadata = {
        source: 'web' as const,
        deviceId,
        userAgent: navigator.userAgent,
      };

      console.log('🟡 [API CALL] Calling jobsApi.swipeRight', {
        endpoint: `/api/v1/jobs/${job.id}/swipe`,
        metadata,
        priority
      });

      const response = await jobsApi.swipeRight(job.id, metadata, { priority });

      console.log('🟢 [API RESPONSE]', {
        success: response.success,
        action: response.data?.action,
        executionMode: response.data?.executionMode,
        remainingApps: response.data?.serverAutomation?.remainingServerApplications,
        correlationId: response.correlationId
      });

      if (response.success && response.data) {
        setFeedback({
          type: 'success',
          message: `Application queued for ${job.title}! 🚀${response.data.serverAutomation?.remainingServerApplications !== undefined ? ` (${response.data.serverAutomation.remainingServerApplications} server apps remaining)` : ''}`,
          jobId: job.id
        });

        // Update parent component with application stats
        const newStats = {
          totalApplications: newRightSwipes,
          todayApplications: newRightSwipes,
          successRate: 95
        };
        onApplicationUpdate?.(newStats);

        // Move to next card after successful application
        setCurrentIndex(prev => Math.min(prev + 1, jobs.length - 1));

        console.log('✅ [SWIPE COMPLETE]', {
          jobId,
          success: true,
          totalApplications: newRightSwipes
        });
      } else {
        throw new Error(response.error || 'Failed to queue application');
      }

    } catch (error) {
      console.error('🔴 [API ERROR]', {
        jobId,
        jobTitle: job.title,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });

      let errorMessage = 'Failed to apply to job. Please try again.';

      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('not authenticated') || message.includes('401')) {
          errorMessage = 'Please log in to apply to jobs.';
        } else if (message.includes('already applied') || message.includes('409')) {
          errorMessage = 'You have already applied to this job.';
        } else if (message.includes('rate limit') || message.includes('429')) {
          errorMessage = 'Too many applications. Please wait a moment.';
        } else if (message.includes('network') || message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (message.includes('proxy')) {
          errorMessage = 'Server automation unavailable. Try again or use desktop app.';
        }
      }

      setFeedback({
        type: 'error',
        message: errorMessage,
        jobId: job.id
      });

      // Revert stats on error
      setSwipeStats(prev => ({
        ...prev,
        totalSwipes: prev.totalSwipes - 1,
        rightSwipes: prev.rightSwipes - 1
      }));
    } finally {
      setIsApplying(null);
      setTimeout(() => setFeedback(null), 5000);
    }
  }, [jobs, onApplicationUpdate, swipeStats.rightSwipes, isAuthenticated, authLoading]);

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

  // Modal handlers
  const handleViewDetails = useCallback((job: JobData) => {
    console.log('👁️ Opening job details for:', job.title);
    setSelectedJob(job);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedJob(null);
  }, []);

  const handleModalApply = useCallback(async (jobId: string) => {
    // Find the job and apply
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      await handleSwipeRight(jobId);
      handleCloseModal();
    }
  }, [jobs, handleSwipeRight]);

  const handleModalSave = useCallback((jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      handleJobSave(job);
    }
  }, [jobs, handleJobSave]);

  const handleModalShare = useCallback((jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      handleJobShare(job);
    }
  }, [jobs, handleJobShare]);




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
    <div className="relative min-h-screen flex flex-col items-center justify-start pt-16 p-4 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Modern Stacked Card Interface */}
      <div className="relative w-full max-w-sm mx-auto min-h-[600px]">
        {cardStack.length > 0 ? (
          <div className="relative h-[600px] overflow-visible">
            {/* Stack of Cards */}
            {cardStack.map((job, index) => {
              const isTopCard = index === 0;
              const zIndex = cardStack.length - index;
              const scale = 1 - (index * 0.05);
              const yOffset = index * 8;

              return (
                <motion.div
                  key={`${job.id}-${currentIndex + index}`}
                  className={cn(
                    "absolute",
                    isTopCard && "cursor-grab active:cursor-grabbing select-none"
                  )}
                  style={isTopCard ? {
                    zIndex,
                    top: 0,
                    left: 0,
                    width: '100%',
                  } : {
                    zIndex,
                    scale,
                    y: yOffset,
                    top: 0,
                    left: 0,
                    width: '100%',
                  }}
                  initial={isTopCard ? { opacity: 1 } : { scale: 0.8, opacity: 0 }}
                  animate={isTopCard ? { opacity: 1 } : {
                    scale,
                    y: yOffset,
                    opacity: 1
                  }}
                  exit={{
                    scale: 0.8,
                    opacity: 0,
                    transition: { duration: 0.2 }
                  }}
                  transition={isTopCard ? undefined : {
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    delay: index * 0.1
                  }}
                  // Add drag to the parent for the top card
                  drag={isTopCard ? true : false}
                  dragElastic={0.2}
                  dragMomentum={false}
                  whileDrag={{ scale: 1.05, rotate: 5 }}
                  onMouseDown={() => {
                    if (isTopCard) {
                      console.log('🖱️ Mouse down on top card:', job.title);
                    }
                  }}
                  onDragStart={() => {
                    if (isTopCard) {
                      console.log('🎯 Drag started on top card:', job.title);
                    }
                  }}
                  onDrag={(_, info) => {
                    if (isTopCard) {
                      console.log('🔄 Dragging top card:', info.offset.x);
                    }
                  }}
                  onClick={(e) => {
                    if (!isTopCard) return;

                    // Check if clicking on action buttons
                    if ((e.target as HTMLElement).closest('button')) {
                      return;
                    }

                    console.log('🎯 Click detected on top card - opening job details for:', job.title);
                    handleViewDetails(job);
                  }}
                  onDragEnd={(_, info) => {
                    if (!isTopCard) return;

                    const swipeThreshold = 100;
                    const swipeVelocity = 300;
                    const clickThreshold = 5; // Maximum distance for a click
                    const clickVelocityThreshold = 50; // Maximum velocity for a click

                    // Calculate total drag distance
                    const dragDistance = Math.sqrt(
                      Math.pow(info.offset.x, 2) + Math.pow(info.offset.y, 2)
                    );
                    const totalVelocity = Math.sqrt(
                      Math.pow(info.velocity.x, 2) + Math.pow(info.velocity.y, 2)
                    );

                    console.log('🎯 Drag ended on top card:', {
                      offsetX: info.offset.x,
                      offsetY: info.offset.y,
                      velocityX: info.velocity.x,
                      velocityY: info.velocity.y,
                      dragDistance,
                      totalVelocity,
                      threshold: swipeThreshold
                    });

                    // Check if this was a click (minimal movement and velocity)
                    if (dragDistance < clickThreshold && totalVelocity < clickVelocityThreshold) {
                      console.log('🎯 Drag-click detected - opening job details for:', job.title);
                      handleViewDetails(job);
                      return;
                    }

                    // Handle as swipe
                    const shouldSwipeRight = info.offset.x > swipeThreshold || info.velocity.x > swipeVelocity;
                    const shouldSwipeLeft = info.offset.x < -swipeThreshold || info.velocity.x < -swipeVelocity;

                    if (shouldSwipeRight) {
                      console.log('👉 Swiping right on:', job.title);
                      handleSwipeRight(job.id);
                    } else if (shouldSwipeLeft) {
                      console.log('👈 Swiping left on:', job.title);
                      handleSwipeLeft(job.id);
                    } else {
                      console.log('↩️ Snapping back to center');
                    }
                  }}
                >
                  <JobCard
                    job={job}
                    variant={isTopCard ? "swipe" : "grid"}
                    onSwipeLeft={() => handleSwipeLeft(job.id)}
                    onSwipeRight={() => handleSwipeRight(job.id)}
                    onSave={() => handleJobSave(job)}
                    onShare={() => handleJobShare(job)}
                    onViewDetails={handleViewDetails}
                    isApplying={isApplying === job.id}
                    feedback={feedback?.jobId === job.id ? feedback : undefined}
                    matchScore={Math.floor(Math.random() * 20) + 80} // Mock match score
                    className={cn(
                      !isTopCard && "pointer-events-none opacity-80"
                    )}
                  />
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 20l5 5 11-11" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Great job!</h3>
            <p className="text-gray-600 mb-6">You've reviewed all available jobs. Check back later for new opportunities!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              onClick={() => window.location.reload()}
            >
              Refresh Jobs
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Stats Badge for Applied Jobs */}
      <AnimatePresence>
        {swipeStats.rightSwipes > 0 && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 20 }}
            className="fixed top-20 left-4 z-30"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg px-4 py-2 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">
                  {swipeStats.rightSwipes} applied
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions for first-time users */}
      <AnimatePresence>
        {swipeStats.totalSwipes === 0 && cardStack.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 1 }}
            className="fixed bottom-6 left-4 right-4 z-40 pointer-events-none"
          >
            <div className="max-w-md ml-10 mt-2 bg-white/90 backdrop-blur-xl rounded-2xl p-6  shadow-xl border border-white/20">
              <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">How to JobSwipe</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Swipe left to pass</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Swipe right to apply</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Tap bookmark to save</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Application feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-20 left-4 right-4 z-50 pointer-events-none"
          >
            <div className="max-w-md mx-auto">
              <div className={cn(
                "rounded-2xl p-4 shadow-xl border backdrop-blur-xl",
                feedback.type === 'success' && 'bg-green-50/90 border-green-200 text-green-800',
                feedback.type === 'error' && 'bg-red-50/90 border-red-200 text-red-800',
                feedback.type === 'info' && 'bg-blue-50/90 border-blue-200 text-blue-800'
              )}>
                <p className="text-sm font-medium text-center">{feedback.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing indicator */}
      <AnimatePresence>
        {isApplying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-20 left-4 right-4 z-50 pointer-events-none"
          >
            <div className="max-w-md mx-auto">
              <div className="bg-blue-50/90 backdrop-blur-xl border border-blue-200 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                  <p className="text-sm font-medium text-blue-800">Applying to job...</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <motion.div
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-full px-4 py-2 shadow-lg border border-white/20">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="font-medium">{currentIndex + 1}</span>
            <span>of</span>
            <span className="font-medium">{jobs.length}</span>
            <div className="w-16 bg-gray-200 rounded-full h-1 ml-2">
              <motion.div
                className="bg-blue-500 h-1 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / jobs.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Job Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onApply={handleModalApply}
        onSave={handleModalSave}
        onShare={handleModalShare}
        matchScore={selectedJob ? Math.floor(Math.random() * 20) + 80 : undefined}
        isApplying={selectedJob ? isApplying === selectedJob.id : false}
      />

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={isLoginPromptOpen}
        onClose={() => {
          setIsLoginPromptOpen(false);
          setPendingJobId(null);
          sessionStorage.removeItem('pending_swipe_job_id');
        }}
        jobTitle={pendingJobId ? jobs.find(j => j.id === pendingJobId)?.title : undefined}
      />
    </div>
  );
}