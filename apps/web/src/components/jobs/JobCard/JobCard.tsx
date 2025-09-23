'use client';

/**
 * JobSwipe JobCard Component
 * Modern, engaging job card with premium UI/UX and smooth animations
 * Designed like the most important app interface - combines Tinder UX with professional credibility
 */

import React, { forwardRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Types
import type { JobCardProps } from '../types/job';

/**
 * Premium JobCard Component
 *
 * Features:
 * - Tinder-like swipe mechanics with visual feedback
 * - Glassmorphism design with premium gradients
 * - Micro-interactions and hover states
 * - Psychological engagement patterns
 * - Mobile-first responsive design
 * - Accessibility-first approach
 */
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMatchScore, setShowMatchScore] = useState(false);

  // Animation will be handled by parent wrapper when dragging

  // Format salary
  const formatSalary = useCallback(() => {
    if (!job.salaryMin && !job.salaryMax) return null;

    if (job.salaryMin && job.salaryMax) {
      return `$${(job.salaryMin / 1000).toFixed(0)}k - $${(job.salaryMax / 1000).toFixed(0)}k`;
    }

    if (job.salaryMin) return `$${(job.salaryMin / 1000).toFixed(0)}k+`;
    if (job.salaryMax) return `Up to $${(job.salaryMax / 1000).toFixed(0)}k`;

    return null;
  }, [job.salaryMin, job.salaryMax]);

  // Handle card interactions
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

  // Handle card click to view details (simplified)
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Prevent card click if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    // This will be handled by parent component for swipe variant
    // Only handle click for non-swipe variants
    if (variant !== 'swipe' && onViewDetails) {
      console.log('🎯 Card clicked - opening details for:', job.title);
      onViewDetails(job);
    }
  }, [variant, onViewDetails, job]);

  // Show match score on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowMatchScore(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Swipe animations
  const swipeVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      transition: { duration: 0.2 }
    },
    hover: {
      scale: 1.02,
      y: -5,
      transition: { type: "spring", stiffness: 400, damping: 25 }
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="relative w-full max-w-sm mx-auto bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100/50 animate-pulse">
        <div className="h-48 bg-gray-200" />
        <div className="p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
          <div className="flex space-x-2">
            <div className="h-6 bg-gray-200 rounded-full w-16" />
            <div className="h-6 bg-gray-200 rounded-full w-20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={cn(
        // Base styles
        "relative w-full max-w-sm mx-auto bg-white rounded-3xl overflow-hidden",
        "shadow-xl border",
        variant === 'swipe' && "border-2 border-blue-300",
        variant !== 'swipe' && "border-gray-100/50",
        // Premium glass effect
        "backdrop-blur-xl bg-white/90",
        // Hover states
        "transition-all duration-300 ease-out",
        // Cursor pointer when onViewDetails is available
        onViewDetails && "cursor-pointer",
        className
      )}
      style={{
        ...style,
      }}
      variants={swipeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={variant === 'swipe' ? "hover" : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      {...props}
    >
      {/* Swipe feedback is now handled by parent wrapper */}

      {/* Match Score Badge */}
      <AnimatePresence>
        {showMatchScore && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-4 right-4 z-20"
          >
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
              {matchScore}% match
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Company Logo Section */}
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
        {/* Company logo placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-2xl font-bold text-gray-700">
              {job.company.name.charAt(0)}
            </span>
          </motion.div>
        </div>

        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Urgent badge */}
        {job.isUrgent && (
          <motion.div
            initial={{ scale: 0, x: -20 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg"
          >
            🔥 Urgent
          </motion.div>
        )}

        {/* Featured badge */}
        {job.isFeatured && (
          <motion.div
            initial={{ scale: 0, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg"
          >
            ⭐ Featured
          </motion.div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 space-y-4">
        {/* Job Title & Company */}
        <div className="space-y-2">
          <motion.h3
            className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {job.title}
          </motion.h3>
          <motion.div
            className="flex items-center space-x-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-lg font-semibold text-gray-700">
              {job.company.name}
            </span>
            {job.company.isVerified && (
              <motion.div
                className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Job Details */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >

          {/* Job Type, Level, Location & Pay */}
          <div className="flex items-center flex-wrap gap-2">
            <motion.span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v.5a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
              </svg>
              {job.type}
            </motion.span>
            <motion.span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {job.level}
            </motion.span>
            {job.location && (
              <motion.span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </motion.span>
            )}
            {formatSalary() && (
              <motion.span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                {formatSalary()}
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* Job Requirements */}
        {job.requirements && (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="text-sm font-semibold text-gray-700 flex items-center">
              <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Key Requirements
            </h4>
            <div className="space-y-1">
              {job.requirements.split(/[•\n\r]/).filter(req => req.trim().length > 0).slice(0, 3).map((requirement, index) => (
                <motion.div
                  key={index}
                  className="flex items-start text-xs text-gray-600"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                  <span className="line-clamp-2 leading-relaxed">{requirement.trim()}</span>
                </motion.div>
              ))}
              {job.requirements.split(/[•\n\r]/).filter(req => req.trim().length > 0).length > 3 && (
                <div className="text-xs text-gray-500 italic pl-4">
                  +{job.requirements.split(/[•\n\r]/).filter(req => req.trim().length > 0).length - 3} more requirements
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Skills */}
        {job.skills.length > 0 && (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="text-sm font-semibold text-gray-700">Required Skills</h4>
            <div className="flex flex-wrap gap-1">
              {job.skills.slice(0, 4).map((skill, index) => (
                <motion.span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {skill}
                </motion.span>
              ))}
              {job.skills.length > 4 && (
                <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-500">
                  +{job.skills.length - 4} more
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          className="pt-4 border-t border-gray-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {variant === 'swipe' ? (
            /* Swipe Actions */
            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSwipeLeft?.(job.id)}
                className="w-14 h-14 bg-gray-100 hover:bg-red-100 rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 transition-colors shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                  isSaved
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 hover:bg-yellow-100 text-gray-600 hover:text-yellow-600'
                }`}
              >
                <svg className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleApply}
                disabled={isApplying}
                className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-green-300 disabled:to-emerald-300 rounded-full flex items-center justify-center text-white transition-all shadow-lg"
              >
                {isApplying ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
              </motion.button>
            </div>
          ) : (
            /* Grid/List Actions */
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApply}
                disabled={isApplying}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg"
              >
                {isApplying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Applying...</span>
                  </>
                ) : (
                  <>
                    <span>Apply Now</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-lg ${
                  isSaved
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 hover:bg-yellow-100 text-gray-600 hover:text-yellow-600'
                }`}
              >
                <svg className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`p-3 rounded-lg text-sm font-medium border ${
                feedback.type === 'success'
                  ? 'bg-green-50 text-green-800 border-green-200'
                  : feedback.type === 'error'
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

JobCard.displayName = 'JobCard';

export default JobCard;