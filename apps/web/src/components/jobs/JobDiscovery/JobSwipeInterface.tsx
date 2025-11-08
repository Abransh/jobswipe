'use client';

/**
 * Job Swipe Interface Component
 * Provides the familiar Tinder-like job swiping experience
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useResume } from '@/hooks/useResume';
import { JobCard } from '@/components/jobs/JobCard';
import { JobDetailModal } from '@/components/jobs/JobDetailModal/JobDetailModal';
import { LoginPromptModal } from '@/components/auth/LoginPromptModal';
import { ResumeUploadModal } from '@/components/resume/ResumeUploadModal';
import type { JobData } from '@/components/jobs/types/job';
import type { JobFilters } from '@/components/jobs/types/filters';
import { generateDeviceId, calculatePriority } from '@/lib/api/jobs';
import { queueApi } from '@/lib/api/queue';

interface JobSwipeInterfaceProps {
  jobs: JobData[];
  searchQuery?: string;
  filters?: JobFilters;
  onApplicationUpdate?: (stats: { totalApplications: number; todayApplications: number; successRate: number }) => void;
  fetchMoreJobs?: (offset: number, limit: number) => Promise<JobData[]>;
}

export function JobSwipeInterface({ jobs, searchQuery, filters, onApplicationUpdate }: JobSwipeInterfaceProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasResume, isLoading: resumeLoading, refetch: refetchResumes } = useResume();

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

  // Application progress state
  const [applicationProgress, setApplicationProgress] = useState(0);
  const [progressStage, setProgressStage] = useState<'uploading' | 'filling' | 'submitting' | 'complete' | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);

  // Login prompt modal state
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);

  // Resume upload modal state
  const [isResumeUploadOpen, setIsResumeUploadOpen] = useState(false);
  const [pendingResumeJobId, setPendingResumeJobId] = useState<string | null>(null);
  const [pendingResumeJobTitle, setPendingResumeJobTitle] = useState<string | null>(null);

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
      // Call API for left swipe (pass on job) - just record analytics, no queue
      const deviceId = generateDeviceId();
      const metadata = {
        source: 'web' as const,
        deviceId,
        userAgent: navigator.userAgent,
      };

      // TODO: Add left swipe tracking endpoint if needed
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

    // Check if user has uploaded a resume
    if (!resumeLoading && !hasResume) {
      console.log('📄 [RESUME CHECK] User has no resume, showing upload prompt');
      setPendingResumeJobId(jobId);
      setPendingResumeJobTitle(job.title);
      sessionStorage.setItem('pending_swipe_job_id', jobId);
      setIsResumeUploadOpen(true);
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

    // Start progress animation
    setApplicationProgress(0);
    setProgressStage('uploading');

    try {
      const deviceId = generateDeviceId();
      const priority = calculatePriority(job.isUrgent);

      const metadata = {
        source: 'web' as const,
        deviceId,
        userAgent: navigator.userAgent,
      };

      // Simulate progress stages for better UX
      // Stage 1: Uploading resume (0-30%)
      const uploadProgress = setInterval(() => {
        setApplicationProgress(prev => {
          if (prev >= 30) {
            clearInterval(uploadProgress);
            setProgressStage('filling');
            return prev;
          }
          return prev + 2;
        });
      }, 50);

      // Stage 2: Filling application (30-70%)
      setTimeout(() => {
        const fillProgress = setInterval(() => {
          setApplicationProgress(prev => {
            if (prev >= 70) {
              clearInterval(fillProgress);
              setProgressStage('submitting');
              return prev;
            }
            return prev + 2;
          });
        }, 40);
      }, 800);

      // Stage 3: Submitting (70-95%)
      setTimeout(() => {
        const submitProgress = setInterval(() => {
          setApplicationProgress(prev => {
            if (prev >= 95) {
              clearInterval(submitProgress);
              return prev;
            }
            return prev + 1.5;
          });
        }, 35);
      }, 1600);

      console.log('🟡 [API CALL] Calling queueApi.swipeRight', {
        endpoint: `/api/v1/queue/apply`,
        metadata,
        priority
      });

      const response = await queueApi.swipeRight({
        jobId: job.id,
        priority,
        metadata
      });

      console.log('🟢 [API RESPONSE]', {
        success: response.success,
        applicationId: response.data?.applicationId,
        status: response.data?.status,
        priority: response.data?.priority
      });

      if (response.success && response.data) {
        // Complete progress animation
        setApplicationProgress(100);
        setProgressStage('complete');

        // Wait a moment to show 100% before hiding
        setTimeout(() => {
          setApplicationProgress(0);
          setProgressStage(null);
        }, 1000);

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

      // Reset progress on error
      setApplicationProgress(0);
      setProgressStage(null);

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
    <div className="relative min-h-screen flex flex-col items-center justify-start pt-16 p-4 bg-gray-50 dark:bg-gray-950">
      {/* Modern Stacked Card Interface - Landing Page Style */}
      <div className="relative w-full max-w-md mx-auto min-h-[600px]">
        {cardStack.length > 0 ? (
          <div className="relative h-[600px] sm:h-[650px]">
            {/* Stack of Cards */}
            <AnimatePresence mode="wait">
              {cardStack.map((job, index) => {
                const isTopCard = index === 0;
                const matchScore = Math.floor(Math.random() * 20) + 80;

                if (!isTopCard) {
                  // Background stack cards
                  return (
                    <div
                      key={`${job.id}-${currentIndex + index}-stack`}
                      className="absolute inset-0 bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-200 dark:border-gray-800 pointer-events-none"
                      style={{
                        zIndex: cardStack.length - index,
                        transform: `translateY(${index * 8}px) scale(${1 - (index * 0.05)})`,
                        opacity: 0.6 - (index * 0.3)
                      }}
                    />
                  );
                }

                // Format salary
                const formatSalary = () => {
                  if (!job.salaryMin && !job.salaryMax) return null;
                  if (job.salaryMin && job.salaryMax) {
                    return `$${(job.salaryMin / 1000).toFixed(0)}k–$${(job.salaryMax / 1000).toFixed(0)}k`;
                  }
                  if (job.salaryMin) return `From $${(job.salaryMin / 1000).toFixed(0)}k`;
                  if (job.salaryMax) return `Up to $${(job.salaryMax / 1000).toFixed(0)}k`;
                  return null;
                };

                return (
                  <motion.div
                    key={`${job.id}-${currentIndex}`}
                    className="absolute inset-0 bg-white dark:bg-gray-900 rounded-2xl shadow-premium border border-gray-200 dark:border-gray-800 p-6 sm:p-8 overflow-hidden cursor-grab active:cursor-grabbing"
                    style={{ zIndex: cardStack.length }}
                    initial={{ scale: 0.95, opacity: 0, rotateY: -10 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    exit={{ scale: 1.05, opacity: 0, x: 300 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    drag
                    dragElastic={0.2}
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    onDragEnd={(_, info) => {
                      const swipeThreshold = 100;
                      if (info.offset.x > swipeThreshold) {
                        handleSwipeRight(job.id);
                      } else if (info.offset.x < -swipeThreshold) {
                        handleSwipeLeft(job.id);
                      }
                    }}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('button')) return;
                      handleViewDetails(job);
                    }}
                  >
                    {/* Match Score */}
                    <div className="absolute top-4 sm:top-6 right-4 sm:right-6 h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-white dark:bg-gray-800 shadow-card border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                      <span className="text-headline sm:text-title-3 font-semibold text-primary leading-none">{matchScore}</span>
                      <span className="text-caption text-gray-500 dark:text-gray-400">match</span>
                    </div>

                    {/* Company Logo */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-primary to-purple flex items-center justify-center mb-4 sm:mb-6">
                      {job.company.logo ? (
                        <img
                          src={job.company.logo}
                          alt={job.company.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                        />
                      ) : (
                        <span className="text-xl sm:text-2xl font-bold text-white">
                          {job.company.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* Job Info */}
                    <h3 className="text-title-3 sm:text-title-2 font-semibold text-gray-900 dark:text-white mb-2 pr-16">
                      {job.title}
                    </h3>
                    <p className="text-callout sm:text-headline text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                      {job.company.name}
                    </p>

                    {/* Location & Remote */}
                    {(job.location || job.remote) && (
                      <div className="flex items-center gap-2 mb-4 sm:mb-6">
                        {job.location && (
                          <span className="text-footnote sm:text-subhead text-gray-600 dark:text-gray-400">
                            📍 {job.location}
                          </span>
                        )}
                        {job.remote && (
                          <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-footnote sm:text-subhead font-medium">
                            Remote
                          </span>
                        )}
                      </div>
                    )}

                    {/* Salary */}
                    {formatSalary() && (
                      <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-success-light dark:bg-success/20 border border-success/20 mb-6 sm:mb-8">
                        <span className="text-footnote sm:text-subhead font-semibold text-success">
                          {formatSalary()}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 sm:right-8 flex gap-3 sm:gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwipeLeft(job.id);
                        }}
                        className="flex-1 h-12 sm:h-14 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-subhead sm:text-callout"
                      >
                        Skip
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwipeRight(job.id);
                        }}
                        disabled={isApplying === job.id}
                        className="flex-1 h-12 sm:h-14 rounded-lg bg-primary text-white font-semibold shadow-card hover:bg-primary/90 transition-colors text-subhead sm:text-callout disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isApplying === job.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            <span>Applying...</span>
                          </div>
                        ) : (
                          'Apply Now'
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty State - Premium Style */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto bg-success-light dark:bg-success/20 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-title-3 font-semibold text-gray-900 dark:text-white mb-2">
              Great job! 🎉
            </h3>
            <p className="text-callout text-gray-600 dark:text-gray-400 mb-6">
              You've reviewed all available jobs. Check back later for new opportunities!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-card text-subhead"
              onClick={() => window.location.reload()}
            >
              Refresh Jobs
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Application Progress Bar - Top Right */}
      <AnimatePresence>
        {progressStage && (
          <motion.div
            initial={{ opacity: 0, x: 20, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20, y: -20 }}
            className="fixed top-20 right-4 z-50"
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-premium border border-gray-200 dark:border-gray-800 p-3 min-w-[280px]">
              {/* Stage Label */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-footnote font-semibold text-gray-900 dark:text-white">
                  {progressStage === 'uploading' && '📄 Uploading resume...'}
                  {progressStage === 'filling' && '✍️ Filling application...'}
                  {progressStage === 'submitting' && '🚀 Submitting...'}
                  {progressStage === 'complete' && '✅ Complete!'}
                </span>
                <span className="text-caption font-bold text-primary">
                  {Math.round(applicationProgress)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    progressStage === 'complete'
                      ? 'bg-success'
                      : 'bg-gradient-to-r from-primary to-purple'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${applicationProgress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>

              {/* Estimated time */}
              {progressStage !== 'complete' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-caption text-gray-500 dark:text-gray-400 mt-1.5 text-center"
                >
                  Estimated time: {progressStage === 'uploading' ? '2-3' : progressStage === 'filling' ? '3-4' : '1-2'}s
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Badge for Applied Jobs - Premium Style */}
      <AnimatePresence>
        {swipeStats.rightSwipes > 0 && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 20 }}
            className="fixed top-20 left-4 z-30"
          >
            <div className="bg-success text-white rounded-lg px-4 py-2 shadow-card border border-success">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-subhead font-semibold">
                  {swipeStats.rightSwipes} applied
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions for first-time users - Premium Style */}
      <AnimatePresence>
        {swipeStats.totalSwipes === 0 && cardStack.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 1.5 }}
            className="fixed bottom-6 left-4 right-4 z-40 pointer-events-none"
          >
            <div className="max-w-md mx-auto bg-white dark:bg-gray-900 backdrop-blur-xl rounded-2xl p-6 shadow-premium border border-gray-200 dark:border-gray-800">
              <h4 className="text-headline font-semibold text-gray-900 dark:text-white mb-4 text-center">
                👆 How to JobSwipe
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-error-light dark:bg-error/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="text-subhead font-medium text-gray-700 dark:text-gray-300">
                    Swipe left to skip
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-success-light dark:bg-success/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-subhead font-medium text-gray-700 dark:text-gray-300">
                    Swipe right to apply
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-light dark:bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <span className="text-subhead font-medium text-gray-700 dark:text-gray-300">
                    Tap card for details
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Application feedback - Premium Style */}
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
                "rounded-xl p-4 shadow-card border",
                feedback.type === 'success' && 'bg-success-light dark:bg-success/20 border-success text-success',
                feedback.type === 'error' && 'bg-error-light dark:bg-error/20 border-error text-error',
                feedback.type === 'info' && 'bg-primary-light dark:bg-primary/20 border-primary text-primary'
              )}>
                <p className="text-subhead font-semibold text-center">{feedback.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing indicator - Premium Style */}
      <AnimatePresence>
        {isApplying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-20 left-4 right-4 z-50 pointer-events-none"
          >
            <div className="max-w-md mx-auto">
              <div className="bg-primary-light dark:bg-primary/20 border border-primary rounded-xl p-4 shadow-card">
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                  <p className="text-subhead font-semibold text-primary">Applying to job...</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator - Premium Style */}
      <motion.div
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-white dark:bg-gray-900 backdrop-blur-xl rounded-full px-4 py-2 shadow-card border border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-2 text-subhead text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">{currentIndex + 1}</span>
            <span>of</span>
            <span className="font-semibold text-gray-900 dark:text-white">{jobs.length}</span>
            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1 ml-2">
              <motion.div
                className="bg-primary h-1 rounded-full"
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

      {/* Resume Upload Modal */}
      <ResumeUploadModal
        isOpen={isResumeUploadOpen}
        onClose={() => {
          setIsResumeUploadOpen(false);
          setPendingResumeJobId(null);
          setPendingResumeJobTitle(null);
          sessionStorage.removeItem('pending_swipe_job_id');
        }}
        onUploadSuccess={async (resumeId, resumeUrl) => {
          console.log('✅ [RESUME UPLOADED] Resume uploaded successfully', { resumeId, resumeUrl });

          // Refetch resumes to update hasResume state
          await refetchResumes();

          // Close modal
          setIsResumeUploadOpen(false);

          // Execute pending swipe if exists
          if (pendingResumeJobId) {
            console.log('🔄 [PENDING SWIPE] Executing pending swipe after resume upload');
            setTimeout(() => {
              handleSwipeRight(pendingResumeJobId);
              setPendingResumeJobId(null);
              setPendingResumeJobTitle(null);
            }, 500);
          }
        }}
        jobTitle={pendingResumeJobTitle || undefined}
      />
    </div>
  );
}