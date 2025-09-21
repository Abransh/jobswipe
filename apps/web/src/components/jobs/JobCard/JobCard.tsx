'use client';

/**
 * JobSwipe JobCard Component
 * The heart of the JobSwipe experience - a psychologically engaging job card
 * that combines professional credibility with social app engagement patterns
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Components
import { JobCardHeader } from './JobCardHeader';
import { JobCardContent } from './JobCardContent';
import { JobCardActions } from './JobCardActions';
import { JobCardBadges } from './JobCardBadges';

// Hooks
import { useJobCard } from '../hooks/useJobCard';

// Types
import type { JobCardProps } from '../types/job';

// Styles
import styles from './JobCard.module.css';

/**
 * JobCard Component
 * 
 * A sophisticated job card component that implements:
 * - Psychological engagement patterns from social apps
 * - Professional credibility and clear information hierarchy
 * - Smooth animations and micro-interactions
 * - Mobile-first responsive design
 * - Full accessibility support
 */
export const JobCard = forwardRef<HTMLDivElement, JobCardProps>(({
  job,
  matchScore,
  variant = 'swipe',
  onSwipeLeft,
  onSwipeRight,
  onApply,
  onSave,
  onShare,
  onMoreInfo,
  isApplying = false,
  feedback,
  isLoading = false,
  className,
  style,
  ...props
}, ref) => {
  const {
    state,
    handlers,
    analytics,
    badges,
    formattedSalary,
    companyLogo
  } = useJobCard({ job, matchScore });

  // Early return for loading state
  if (isLoading) {
    return (
      <div 
        ref={ref} 
        className={cn(styles.card, styles.loading, className)}
        style={style}
        {...props}
      >
        <div className={styles.skeleton}>
          <div className={cn(styles.skeletonLine, styles.skeletonTitle)} />
          <div className={cn(styles.skeletonLine, styles.skeletonSubtitle)} />
          <div className={cn(styles.skeletonLine, styles.skeletonContent)} />
        </div>
      </div>
    );
  }

  // Animation variants for card states
  const cardVariants = {
    idle: {
      scale: 1,
      rotateY: 0,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    hover: {
      scale: 1.02,
      rotateY: 0,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    },
    pressed: {
      scale: 0.98,
      rotateY: 0,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30
      }
    },
    swipeLeft: {
      x: -100,
      rotateZ: -10,
      opacity: 0.7,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    swipeRight: {
      x: 100,
      rotateZ: 10,
      opacity: 0.7,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  // Determine current animation variant
  const getAnimationVariant = () => {
    if (state.swipeDirection === 'left') return 'swipeLeft';
    if (state.swipeDirection === 'right') return 'swipeRight';
    if (state.isPressed) return 'pressed';
    if (state.isHovered) return 'hover';
    return 'idle';
  };

  // Handle keyboard interactions for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSwipeRight?.(job.id);
    } else if (e.key === 'Escape') {
      onSwipeLeft?.(job.id);
    }
    handlers.onKeyDown(e);
  };

  return (
    <motion.article
      ref={ref}
      className={cn(styles.card, className)}
      style={style}
      variants={cardVariants}
      initial="idle"
      animate={getAnimationVariant()}
      whileHover="hover"
      whileTap="pressed"
      {...handlers}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Job: ${job.title} at ${job.company.name}. Press Enter to apply, Escape to skip.`}
      aria-describedby={`job-description-${job.id}`}
      {...props}
    >
      {/* Glassmorphism background */}
      <div className={styles.glassmorphism} />
      
      {/* Status badges */}
      <JobCardBadges 
        badges={badges} 
        matchScore={matchScore}
        className={styles.badges}
      />

      {/* Card header with company logo and verification */}
      <JobCardHeader
        company={job.company}
        companyLogo={companyLogo}
        isVerified={job.isVerified}
        qualityScore={job.qualityScore}
        className={styles.header}
      />

      {/* Main content area */}
      <JobCardContent
        job={job}
        formattedSalary={formattedSalary}
        className={styles.content}
        descriptionId={`job-description-${job.id}`}
      />

      {/* Quick actions (visible on hover/focus) */}
      <JobCardActions
        onSave={() => onSave?.(job.id)}
        onShare={() => onShare?.(job.id)}
        onMoreInfo={() => onMoreInfo?.(job.id)}
        className={cn(
          styles.actions,
          (state.isHovered || state.isPressed) && styles.actionsVisible
        )}
        isVisible={state.isHovered || state.isPressed}
      />

      {/* Swipe direction indicator */}
      {state.swipeDirection && (
        <motion.div
          className={cn(
            styles.swipeIndicator,
            state.swipeDirection === 'left' ? styles.swipeLeft : styles.swipeRight
          )}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          {state.swipeDirection === 'left' ? '✕' : '✓'}
        </motion.div>
      )}

      {/* Accessibility enhancement: Screen reader content */}
      <div className="sr-only">
        Job posting: {job.title} at {job.company.name}.
        {formattedSalary.display && ` Salary: ${formattedSalary.display}.`}
        {job.location && ` Location: ${job.location}.`}
        {job.remote && ' Remote work available.'}
        {matchScore && ` Match score: ${Math.round(matchScore)}%.`}
        Posted {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'recently'}.
      </div>
    </motion.article>
  );
});

JobCard.displayName = 'JobCard';

// Default props for better developer experience
JobCard.defaultProps = {
  isLoading: false,
  className: '',
  style: {}
};

export default JobCard;