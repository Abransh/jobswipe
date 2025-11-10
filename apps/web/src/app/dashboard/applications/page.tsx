/**
 * Premium Applications Dashboard
 * Apple-Level Interactive Design
 *
 * Features:
 * - Expandable application cards with progress indicators
 * - Hover preview with subtle expansion
 * - Click to reveal full application details
 * - Real-time progress tracking
 * - Advanced animations with Framer Motion
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  LinkIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { queueApi, type ApplicationStatus } from '@/lib/api/queue';
import { useQueueStatus } from '@/providers/QueueStatusProvider';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

type FilterStatus = 'all' | 'successful' | 'in-progress' | 'failed';

interface ApplicationProgress {
  currentStep: number;
  totalSteps: number;
  steps: {
    name: string;
    status: 'completed' | 'in-progress' | 'pending' | 'failed';
    timestamp?: Date;
  }[];
}

// =============================================================================
// MOCK DATA FOR PROGRESS & DETAILS
// =============================================================================

const mockApplicationDetails = {
  resume: {
    name: 'John_Doe_Resume_2024.pdf',
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  coverLetter: {
    content: 'I am writing to express my strong interest in the Senior Frontend Developer position...',
    customized: true,
  },
  questionsAnswered: [
    {
      question: 'Why do you want to work here?',
      answer: 'I am passionate about building user-centric applications...',
    },
    {
      question: 'What is your expected salary?',
      answer: '$120,000 - $150,000',
    },
    {
      question: 'When can you start?',
      answer: '2 weeks notice',
    },
  ],
  appliedWith: {
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    linkedin: 'linkedin.com/in/johndoe',
    portfolio: 'johndoe.dev',
  },
};

const mockProgress: ApplicationProgress = {
  currentStep: 3,
  totalSteps: 5,
  steps: [
    { name: 'Job page opened', status: 'completed', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    { name: 'Form filled', status: 'completed', timestamp: new Date(Date.now() - 1000 * 60 * 4) },
    { name: 'Resume uploaded', status: 'completed', timestamp: new Date(Date.now() - 1000 * 60 * 3) },
    { name: 'Submitting application', status: 'in-progress' },
    { name: 'Confirmation received', status: 'pending' },
  ],
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const {
    isConnected,
    connectionError,
    applications: realtimeApplications,
    subscribeToApplication,
    reconnect,
  } = useQueueStatus();

  // Load applications
  const loadApplications = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const response = await queueApi.getApplications({
        limit: 100,
        offset: 0,
      });

      if (response.success && response.data) {
        const apps = response.data.applications;
        setApplications(apps);

        apps.forEach((app) => {
          subscribeToApplication(app.id);
        });
      } else {
        throw new Error(response.error || 'Failed to load applications');
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [subscribeToApplication]);

  // Refresh applications
  const refreshApplications = useCallback(async () => {
    setRefreshing(true);
    await loadApplications(false);
    setRefreshing(false);
  }, [loadApplications]);

  // Update applications with real-time data
  useEffect(() => {
    if (realtimeApplications.size > 0) {
      setApplications((prev) =>
        prev.map((app) => {
          const realtimeApp = realtimeApplications.get(app.id);
          return realtimeApp ? { ...app, ...realtimeApp } : app;
        })
      );
    }
  }, [realtimeApplications]);

  // Load applications on mount
  useEffect(() => {
    loadApplications(true);
  }, [loadApplications]);

  // Map backend statuses to filter statuses
  const getFilterCategory = (status: string): FilterStatus => {
    if (status === 'completed') return 'successful';
    if (status === 'failed') return 'failed';
    return 'in-progress'; // pending, queued, processing
  };

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      searchQuery === '' ||
      app.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job.company.toLowerCase().includes(searchQuery.toLowerCase());

    const category = getFilterCategory(app.status);
    const matchesFilter = filterStatus === 'all' || category === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // Get counts for filter tabs
  const counts = {
    all: applications.length,
    successful: applications.filter((app) => getFilterCategory(app.status) === 'successful').length,
    'in-progress': applications.filter((app) => getFilterCategory(app.status) === 'in-progress').length,
    failed: applications.filter((app) => getFilterCategory(app.status) === 'failed').length,
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-title-1 font-semibold text-gray-900 dark:text-white">
                Applications
              </h1>

              {/* Connection Status & Refresh */}
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-caption font-medium',
                    isConnected
                      ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                      : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                  )}
                >
                  <div
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                    )}
                  />
                  <span>{isConnected ? 'Live' : 'Offline'}</span>
                  {!isConnected && connectionError && (
                    <button
                      onClick={reconnect}
                      className="ml-1 p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-colors"
                    >
                      <ArrowPathIcon className="w-3 h-3" />
                    </button>
                  )}
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={refreshApplications}
                  disabled={refreshing}
                  className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors disabled:opacity-50"
                >
                  <ArrowPathIcon className={cn('w-4 h-4 text-gray-700 dark:text-gray-300', refreshing && 'animate-spin')} />
                </motion.button>
              </div>
            </div>

            <p className="text-body text-gray-500 dark:text-gray-400">
              Track and manage your job applications in real-time
            </p>
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide"
          >
            {[
              { key: 'all' as FilterStatus, label: 'All Applications', icon: BriefcaseIcon },
              { key: 'successful' as FilterStatus, label: 'Successful', icon: CheckCircleIcon },
              { key: 'in-progress' as FilterStatus, label: 'In Progress', icon: ClockIcon },
              { key: 'failed' as FilterStatus, label: 'Failed', icon: XCircleIcon },
            ].map((filter) => {
              const isActive = filterStatus === filter.key;
              const count = counts[filter.key];

              return (
                <motion.button
                  key={filter.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilterStatus(filter.key)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-subhead transition-all duration-200 whitespace-nowrap',
                    isActive
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-card'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  )}
                >
                  <filter.icon className="w-4 h-4" />
                  <span>{filter.label}</span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-md text-caption font-semibold',
                      isActive
                        ? 'bg-white/20 dark:bg-gray-900/20'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    )}
                  >
                    {count}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search by job title or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-subhead text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </motion.div>

          {/* Error State */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl"
              >
                <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-subhead text-red-800 dark:text-red-300">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <EmptyState searchQuery={searchQuery} filterStatus={filterStatus} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <AnimatePresence mode="popLayout">
                {filteredApplications.map((application, index) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    index={index}
                    isExpanded={expandedCard === application.id}
                    onToggle={() => setExpandedCard(expandedCard === application.id ? null : application.id)}
                    isRealtime={realtimeApplications.has(application.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// =============================================================================
// APPLICATION CARD COMPONENT
// =============================================================================

interface ApplicationCardProps {
  application: ApplicationStatus;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  isRealtime: boolean;
}

function ApplicationCard({ application, index, isExpanded, onToggle, isRealtime }: ApplicationCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Determine status configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Successful',
          icon: CheckCircleIcon,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-950/30',
          borderColor: 'border-green-200 dark:border-green-800',
        };
      case 'failed':
        return {
          label: 'Failed',
          icon: XCircleIcon,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-950/30',
          borderColor: 'border-red-200 dark:border-red-800',
        };
      case 'processing':
        return {
          label: 'Processing',
          icon: ArrowPathIcon,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-950/30',
          borderColor: 'border-blue-200 dark:border-blue-800',
          animated: true,
        };
      default:
        return {
          label: 'In Progress',
          icon: ClockIcon,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
        };
    }
  };

  const statusConfig = getStatusConfig(application.status);
  const isInProgress = !['completed', 'failed'].includes(application.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1],
        layout: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        'bg-white dark:bg-gray-900 rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer',
        isExpanded
          ? 'border-gray-300 dark:border-gray-700 shadow-premium'
          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 shadow-card hover:shadow-premium',
        isRealtime && 'ring-2 ring-primary/20'
      )}
      onClick={onToggle}
    >
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-subhead font-semibold text-gray-900 dark:text-white truncate">
                {application.job.title}
              </h3>
              {isRealtime && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-caption font-medium"
                >
                  <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                  Live
                </motion.span>
              )}
            </div>

            <p className="text-body text-gray-600 dark:text-gray-400 mb-3">
              {application.job.company}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-caption text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
              </span>
              {application.job.location && (
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-3.5 h-3.5" />
                  {application.job.location}
                </span>
              )}
              {application.job.salary && (
                <span className="flex items-center gap-1">
                  <CurrencyDollarIcon className="w-3.5 h-3.5" />
                  ${application.job.salary.min?.toLocaleString()}-${application.job.salary.max?.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Status Badge & Toggle */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg border', statusConfig.bgColor, statusConfig.borderColor)}>
              <statusConfig.icon className={cn('w-4 h-4', statusConfig.color, statusConfig.animated && 'animate-spin')} />
              <span className={cn('text-caption font-medium', statusConfig.color)}>{statusConfig.label}</span>
            </div>

            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <ChevronDownIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </motion.div>
          </div>
        </div>

        {/* Progress Bar (visible on hover or when in progress) */}
        <AnimatePresence>
          {(isHovered || isInProgress) && isInProgress && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProgressIndicator progress={mockProgress} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <ApplicationDetails application={application} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================================
// PROGRESS INDICATOR COMPONENT
// =============================================================================

interface ProgressIndicatorProps {
  progress: ApplicationProgress;
}

function ProgressIndicator({ progress }: ProgressIndicatorProps) {
  const percentage = (progress.currentStep / progress.totalSteps) * 100;

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-caption font-medium text-gray-700 dark:text-gray-300">
            Application Progress
          </span>
          <span className="text-caption font-semibold text-primary">
            {progress.currentStep}/{progress.totalSteps} steps
          </span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {progress.steps.map((step, index) => {
          const getStepIcon = () => {
            switch (step.status) {
              case 'completed':
                return <CheckCircleSolid className="w-4 h-4 text-green-500" />;
              case 'in-progress':
                return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
              case 'failed':
                return <XCircleIcon className="w-4 h-4 text-red-500" />;
              default:
                return <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-700 rounded-full" />;
            }
          };

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg',
                step.status === 'completed' && 'bg-green-50 dark:bg-green-950/30',
                step.status === 'in-progress' && 'bg-blue-50 dark:bg-blue-950/30',
                step.status === 'failed' && 'bg-red-50 dark:bg-red-950/30',
                step.status === 'pending' && 'bg-gray-50 dark:bg-gray-800'
              )}
            >
              {getStepIcon()}
              <span
                className={cn(
                  'text-caption font-medium truncate',
                  step.status === 'completed' && 'text-green-700 dark:text-green-400',
                  step.status === 'in-progress' && 'text-blue-700 dark:text-blue-400',
                  step.status === 'failed' && 'text-red-700 dark:text-red-400',
                  step.status === 'pending' && 'text-gray-500 dark:text-gray-400'
                )}
              >
                {step.name}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// APPLICATION DETAILS COMPONENT
// =============================================================================

interface ApplicationDetailsProps {
  application: ApplicationStatus;
}

function ApplicationDetails({ application }: ApplicationDetailsProps) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-6 py-5 space-y-6">
      {/* Applied With Section */}
      <div>
        <h4 className="text-subhead font-semibold text-gray-900 dark:text-white mb-3">
          Applied With
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DetailItem icon={EnvelopeIcon} label="Email" value={mockApplicationDetails.appliedWith.email} />
          <DetailItem icon={LinkIcon} label="LinkedIn" value={mockApplicationDetails.appliedWith.linkedin} />
          <DetailItem icon={LinkIcon} label="Portfolio" value={mockApplicationDetails.appliedWith.portfolio} />
          <DetailItem icon={DocumentTextIcon} label="Phone" value={mockApplicationDetails.appliedWith.phone} />
        </div>
      </div>

      {/* Resume Section */}
      <div>
        <h4 className="text-subhead font-semibold text-gray-900 dark:text-white mb-3">
          Resume
        </h4>
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-gray-300 dark:hover:border-gray-700 transition-colors cursor-pointer"
        >
          <div className="p-2 bg-primary/10 rounded-lg">
            <DocumentTextIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-subhead font-medium text-gray-900 dark:text-white truncate">
              {mockApplicationDetails.resume.name}
            </p>
            <p className="text-caption text-gray-500 dark:text-gray-400">
              Uploaded {formatDistanceToNow(mockApplicationDetails.resume.uploadedAt, { addSuffix: true })}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1.5 text-caption font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            View
          </motion.button>
        </motion.div>
      </div>

      {/* Cover Letter Section */}
      <div>
        <h4 className="text-subhead font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          Cover Letter
          {mockApplicationDetails.coverLetter.customized && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-caption font-medium rounded-md">
              Customized
            </span>
          )}
        </h4>
        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
          <p className="text-body text-gray-700 dark:text-gray-300 line-clamp-3">
            {mockApplicationDetails.coverLetter.content}
          </p>
          <button className="mt-2 text-caption font-medium text-primary hover:text-primary/80 transition-colors">
            Read more
          </button>
        </div>
      </div>

      {/* Questions Answered Section */}
      <div>
        <h4 className="text-subhead font-semibold text-gray-900 dark:text-white mb-3">
          Questions Answered ({mockApplicationDetails.questionsAnswered.length})
        </h4>
        <div className="space-y-3">
          {mockApplicationDetails.questionsAnswered.map((qa, index) => (
            <div key={index} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
              <p className="text-caption font-medium text-gray-900 dark:text-white mb-1">
                {qa.question}
              </p>
              <p className="text-body text-gray-600 dark:text-gray-400">
                {qa.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Error Message (if failed) */}
      {application.errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-start gap-3">
            <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-subhead font-medium text-red-900 dark:text-red-300">Error Details</p>
              <p className="text-body text-red-700 dark:text-red-400 mt-1">{application.errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        {application.status === 'failed' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium text-subhead rounded-xl transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Retry Application
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-subhead rounded-xl transition-colors"
        >
          <LinkIcon className="w-4 h-4" />
          View Job Posting
        </motion.button>
      </div>
    </div>
  );
}

// =============================================================================
// DETAIL ITEM COMPONENT
// =============================================================================

interface DetailItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function DetailItem({ icon: Icon, label, value }: DetailItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-caption text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-subhead font-medium text-gray-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );
}

// =============================================================================
// EMPTY STATE COMPONENT
// =============================================================================

function EmptyState({ searchQuery, filterStatus }: { searchQuery: string; filterStatus: FilterStatus }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
        <BriefcaseIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-title-3 font-semibold text-gray-900 dark:text-white mb-2">
        {searchQuery || filterStatus !== 'all' ? 'No applications found' : 'No applications yet'}
      </h3>
      <p className="text-body text-gray-500 dark:text-gray-400 mb-6">
        {searchQuery || filterStatus !== 'all'
          ? 'Try adjusting your search or filter'
          : 'Start swiping on jobs to see applications here'}
      </p>
      {!searchQuery && filterStatus === 'all' && (
        <motion.a
          href="/jobs"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold text-subhead rounded-xl shadow-card transition-colors"
        >
          Start Swiping
        </motion.a>
      )}
    </motion.div>
  );
}

// =============================================================================
// LOADING SKELETON COMPONENT
// =============================================================================

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="animate-pulse space-y-6">
          {/* Header skeleton */}
          <div>
            <div className="h-9 bg-gray-200 dark:bg-gray-800 rounded-lg w-48 mb-2" />
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-96" />
          </div>

          {/* Filters skeleton */}
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-11 bg-gray-200 dark:bg-gray-800 rounded-xl w-40" />
            ))}
          </div>

          {/* Search skeleton */}
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl w-full" />

          {/* Cards skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-64 mb-2" />
                <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-48 mb-4" />
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-32" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
