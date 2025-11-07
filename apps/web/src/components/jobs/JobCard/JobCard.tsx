'use client';

/**
 * JobSwipe Premium JobCard Component
 * Apple-Level Aesthetic with Psychological UI/UX Principles
 *
 * Design Philosophy:
 * - Clarity: Every element has purpose
 * - Deference: Content is king, UI fades back
 * - Depth: Subtle layering creates hierarchy
 * - Precision: Pixel-perfect alignment
 * - Restraint: Minimal use of color and decoration
 *
 * Psychological Principles Applied:
 * - Serial Position Effect: Important info at top/bottom
 * - Von Restorff Effect: Match score stands out subtly
 * - Aesthetic-Usability Effect: Beauty = perceived usability
 * - Fitts's Law: Large touch targets for actions
 */

import React, { forwardRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// Types
import type { JobCardProps } from '../types/job';

export const JobCard = forwardRef<HTMLDivElement, JobCardProps>(({
  job,
  matchScore = 85,
  variant = 'swipe',
  onSwipeLeft,
  onSwipeRight,
  onApply,
  onSave,
  onShare,
  onMoreInfo,
  onViewDetails,
  isApplying = false,
  feedback,
  isLoading = false,
  className,
  style,
  ...props
}, ref) => {
  // Local state for interactions
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMatchScore, setShowMatchScore] = useState(false);

  // Format salary (concise Apple style)
  const formatSalary = useCallback(() => {
    if (!job.salaryMin && !job.salaryMax) return null;

    if (job.salaryMin && job.salaryMax) {
      return `$${(job.salaryMin / 1000).toFixed(0)}k–$${(job.salaryMax / 1000).toFixed(0)}k`;
    }

    if (job.salaryMin) return `From $${(job.salaryMin / 1000).toFixed(0)}k`;
    if (job.salaryMax) return `Up to $${(job.salaryMax / 1000).toFixed(0)}k`;

    return null;
  }, [job.salaryMin, job.salaryMax]);

  // Handle interactions
  const handleSave = useCallback(() => {
    setIsSaved(!isSaved);
    onSave?.(job.id);
  }, [isSaved, onSave, job.id]);

  const handleApply = useCallback(() => {
    if (onApply) {
      onApply();
    } else if (onSwipeRight) {
      onSwipeRight(job.id);
    }
  }, [onApply, onSwipeRight, job.id]);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Prevent card click if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    // Handle click for non-swipe variants
    if (variant !== 'swipe' && onViewDetails) {
      onViewDetails(job);
    }
  }, [variant, onViewDetails, job]);

  // Show match score on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowMatchScore(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Premium entrance animations
  const cardVariants = {
    initial: { scale: 0.96, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1] // Premium ease-out
      }
    },
    exit: {
      scale: 0.9,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="relative w-full max-w-sm mx-auto bg-white dark:bg-card rounded-xl overflow-hidden shadow-card border border-gray-200 dark:border-gray-800">
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-12 loading-shimmer" />
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 loading-shimmer" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2 loading-shimmer" />
            </div>
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full loading-shimmer" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-20 loading-shimmer" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-16 loading-shimmer" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full loading-shimmer" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-5/6 loading-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={cn(
        // Base styles - Clean white card
        'relative w-full max-w-sm mx-auto',
        'bg-white dark:bg-card',
        'rounded-xl',
        'border border-gray-200 dark:border-gray-800',
        'overflow-hidden',
        // Premium shadow system
        'shadow-card',
        'hover:shadow-elevated',
        // Smooth transitions
        'transition-all duration-quick ease-out',
        // Hover lift effect
        'hover:-translate-y-1',
        // Cursor
        onViewDetails && 'cursor-pointer',
        className
      )}
      style={style}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      {...props}
    >
      {/* Match Score Badge - Minimal circular badge */}
      <AnimatePresence>
        {showMatchScore && matchScore >= 70 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="absolute top-4 right-4 z-10"
          >
            <div className="h-12 w-12 rounded-full bg-white dark:bg-gray-800 shadow-card border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
              <span className="text-title-3 font-semibold text-primary leading-none">
                {matchScore}
              </span>
              <span className="text-caption text-gray-500 dark:text-gray-400 leading-none">
                match
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Content */}
      <div className="p-6 space-y-4">
        {/* Header: Company Logo + Title */}
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-minimal border border-gray-200 dark:border-gray-700">
              {job.company.logo ? (
                <img
                  src={job.company.logo}
                  alt={job.company.name}
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <span className="text-headline font-semibold text-gray-700 dark:text-gray-300">
                  {job.company.name.charAt(0)}
                </span>
              )}
            </div>
          </div>

          {/* Title & Company */}
          <div className="flex-1 min-w-0">
            {/* Status badges (minimal) */}
            <div className="flex items-center gap-2 mb-2">
              {job.isUrgent && (
                <Badge size="sm" variant="error">
                  Urgent
                </Badge>
              )}
              {job.isFeatured && (
                <Badge size="sm" variant="purple">
                  Featured
                </Badge>
              )}
            </div>

            {/* Job Title */}
            <h3 className="text-title-3 font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
              {job.title}
            </h3>

            {/* Company Name */}
            <div className="flex items-center gap-1.5">
              <span className="text-body text-gray-600 dark:text-gray-400">
                {job.company.name}
              </span>
              {job.company.isVerified && (
                <svg className="h-4 w-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Job Metadata Pills - Minimal gray badges */}
        <div className="flex items-center flex-wrap gap-2">
          <Badge size="sm" variant="default">
            {job.type}
          </Badge>
          <Badge size="sm" variant="default">
            {job.level}
          </Badge>
          {job.location && (
            <Badge size="sm" variant="default">
              {job.location}
            </Badge>
          )}
          {job.remote && (
            <Badge size="sm" variant="primary">
              Remote
            </Badge>
          )}
        </div>

        {/* Key Requirements (First 3) */}
        {job.requirements && (
          <div className="space-y-2">
            <h4 className="text-subhead font-medium text-gray-700 dark:text-gray-300">
              Key Requirements
            </h4>
            <div className="space-y-1.5">
              {job.requirements
                .split(/[•\n\r]/)
                .filter(req => req.trim().length > 0)
                .slice(0, 3)
                .map((requirement, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-footnote text-gray-600 dark:text-gray-400"
                  >
                    <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="flex-1">{requirement.trim()}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Skills (First 4 + more indicator) */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex items-center flex-wrap gap-2">
            {job.skills.slice(0, 4).map((skill, index) => (
              <Badge key={index} size="sm" variant="outline">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 4 && (
              <Badge size="sm" variant="outline">
                +{job.skills.length - 4} more
              </Badge>
            )}
          </div>
        )}

        {/* Footer: Salary + Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          {/* Salary */}
          <div>
            {formatSalary() ? (
              <div className="space-y-0.5">
                <p className="text-caption text-gray-500 dark:text-gray-400">
                  Salary
                </p>
                <p className="text-callout font-semibold text-gray-900 dark:text-white">
                  {formatSalary()}
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                <p className="text-caption text-gray-500 dark:text-gray-400">
                  Posted
                </p>
                <p className="text-callout font-medium text-gray-700 dark:text-gray-300">
                  {job.postedAt ? new Date(job.postedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Save Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              className="h-10 w-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-quick active:scale-95 flex items-center justify-center"
              aria-label={isSaved ? 'Unsave job' : 'Save job'}
            >
              <svg
                className={cn(
                  'h-5 w-5 transition-colors',
                  isSaved ? 'text-primary fill-current' : 'text-gray-500 dark:text-gray-400'
                )}
                fill={isSaved ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>

            {/* Apply Button (or Swipe Right) */}
            {variant === 'swipe' && onSwipeRight && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApply();
                }}
                disabled={isApplying}
                className="h-10 px-6 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all duration-quick active:scale-95 flex items-center gap-2 font-medium text-subhead shadow-card disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApplying ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Applying...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Apply</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Swipe feedback overlay (handled by parent) */}
      {/* This allows the JobSwipeContainer to add drag feedback */}
    </motion.div>
  );
});

JobCard.displayName = 'JobCard';
