'use client';

/**
 * JobSwipeCard Component
 * Minimalistic, elegant job card optimized for single-card swipe experience
 * Implements sophisticated micro-interactions and responsive expansion
 */

import React, { forwardRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { 
  MapPinIcon, 
  CurrencyDollarIcon,
  BookmarkIcon,
  ShareIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  HeartIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  BookmarkIcon as BookmarkSolidIcon,
  HeartIcon as HeartSolidIcon
} from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

// Components
import { JobSwipeDetails } from './JobSwipeDetails';

// Hooks
import { useGestures } from '../hooks/useGestures';

// Types
import type { JobSwipeCardProps, ExpansionTrigger } from '../types/jobSwipe';

// Styles
import styles from './JobSwipe.module.css';

interface JobSwipeCardPropsExtended extends Omit<JobSwipeCardProps, 'onGestureStart' | 'onGestureMove' | 'onGestureEnd'> {
  swipeLeft: () => void;
  swipeRight: () => void;
}

export const JobSwipeCard = forwardRef<HTMLDivElement, JobSwipeCardPropsExtended>(({
  job,
  matchScore,
  state,
  isActive,
  zIndex,
  onExpand,
  onCollapse,
  onSave,
  onShare,
  config,
  dimensions,
  deviceType,
  className,
  style,
  swipeLeft,
  swipeRight,
  ...props
}, ref) => {
  
  // Local state
  const [isSaved, setIsSaved] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Motion values for smooth animations
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(x, [-150, 0, 150], [0.7, 1, 0.7]);
  
  // Animation controls
  const controls = useAnimation();
  
  // Gesture handling
  const {
    gestureState,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onKeyDown,
    resetGesture
  } = useGestures({
    config,
    onSwipeLeft: swipeLeft,
    onSwipeRight: swipeRight,
    onExpand: () => onExpand('hover'),
    onCollapse,
    disabled: !isActive
  });

  // Handle save toggle
  const handleSave = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave?.();
  }, [isSaved, onSave]);

  // Handle share
  const handleShare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.();
  }, [onShare]);

  // Handle expansion toggle for mobile
  const handleExpansionToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (deviceType === 'mobile') {
      if (state.isExpanded) {
        onCollapse();
      } else {
        onExpand('tap');
      }
    }
  }, [deviceType, state.isExpanded, onExpand, onCollapse]);

  // Format salary
  const formatSalary = useCallback(() => {
    const { salaryMin, salaryMax, currency = 'USD', salaryType } = job;
    
    if (!salaryMin && !salaryMax) {
      return 'Competitive salary';
    }
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    if (salaryMin && salaryMax) {
      return `${formatter.format(salaryMin)} - ${formatter.format(salaryMax)}${salaryType === 'HOURLY' ? '/hr' : '/yr'}`;
    } else if (salaryMin) {
      return `${formatter.format(salaryMin)}${salaryType === 'HOURLY' ? '/hr' : '/yr'}+`;
    }
    
    return 'Salary not specified';
  }, [job]);

  // Format time ago
  const formatTimeAgo = useCallback(() => {
    if (!job.postedAt) return 'Recently posted';
    
    const now = new Date();
    const posted = new Date(job.postedAt);
    const diffInSeconds = Math.floor((now.getTime() - posted.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return posted.toLocaleDateString();
  }, [job.postedAt]);

  // Generate company initials
  const getCompanyInitials = useCallback(() => {
    return job.company.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }, [job.company.name]);

  // Update motion values based on gesture state
  useEffect(() => {
    x.set(gestureState.dragOffset.x);
    y.set(gestureState.dragOffset.y);
  }, [gestureState.dragOffset, x, y]);

  // Handle swipe animation completion
  useEffect(() => {
    if (gestureState.swipeProgress > 0.8) {
      if (gestureState.swipeDirection === 'left') {
        controls.start({ x: -400, opacity: 0, transition: { duration: 0.3 } });
      } else if (gestureState.swipeDirection === 'right') {
        controls.start({ x: 400, opacity: 0, transition: { duration: 0.3 } });
      }
    }
  }, [gestureState.swipeProgress, gestureState.swipeDirection, controls]);

  // Card animation variants
  const cardVariants = {
    enter: {
      scale: 0.8,
      opacity: 0,
      y: 50,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    idle: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    hover: {
      scale: deviceType === 'desktop' ? 1.02 : 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 30
      }
    },
    drag: {
      scale: 0.95,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 30
      }
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      y: -50,
      transition: {
        duration: 0.2
      }
    }
  };

  // Get current animation variant
  const getAnimationVariant = () => {
    if (gestureState.isDragging) return 'drag';
    if (gestureState.isHovered && deviceType === 'desktop') return 'hover';
    return 'idle';
  };

  return (
    <motion.div
      ref={ref}
      className={cn(styles.card, className)}
      style={{
        ...style,
        zIndex,
        width: dimensions.width,
        height: state.isExpanded ? dimensions.height.expanded : dimensions.height.collapsed,
        ...style
      }}
      variants={cardVariants}
      initial="enter"
      animate={controls.mount ? getAnimationVariant() : controls}
      exit="exit"
      whileHover={deviceType === 'desktop' ? 'hover' : undefined}
      whileTap={deviceType !== 'desktop' ? 'drag' : undefined}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onKeyDown={onKeyDown}
      tabIndex={isActive ? 0 : -1}
      role="button"
      aria-label={`Job: ${job.title} at ${job.company.name}. ${matchScore ? `${Math.round(matchScore)}% match. ` : ''}Press enter to apply, escape to pass.`}
      {...props}
    >
      {/* Swipe feedback overlay */}
      {gestureState.swipeDirection && gestureState.swipeProgress > 0.2 && (
        <motion.div
          className={cn(
            styles.swipeOverlay,
            gestureState.swipeDirection === 'left' ? styles.swipeOverlayLeft : styles.swipeOverlayRight
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: Math.min(gestureState.swipeProgress, 0.8) }}
        >
          <div className={styles.swipeIcon}>
            {gestureState.swipeDirection === 'left' ? '✕' : '✓'}
          </div>
          <div className={styles.swipeText}>
            {gestureState.swipeDirection === 'left' ? 'Pass' : 'Apply'}
          </div>
        </motion.div>
      )}

      {/* Match score badge */}
      {matchScore && matchScore >= 75 && (
        <motion.div
          className={cn(styles.matchBadge, {
            [styles.matchHigh]: matchScore >= 90,
            [styles.matchMedium]: matchScore >= 80 && matchScore < 90
          })}
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 500, damping: 30 }}
        >
          <HeartSolidIcon className="w-3 h-3" />
          <span>{Math.round(matchScore)}% Match</span>
        </motion.div>
      )}

      {/* Action buttons */}
      <div className={cn(styles.actionButtons, {
        [styles.actionButtonsVisible]: gestureState.isHovered || state.isExpanded || deviceType === 'mobile'
      })}>
        <motion.button
          className={cn(styles.actionButton, styles.saveButton, { [styles.saved]: isSaved })}
          onClick={handleSave}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isSaved ? 'Remove from saved jobs' : 'Save job'}
        >
          {isSaved ? <BookmarkSolidIcon className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
        </motion.button>
        
        <motion.button
          className={cn(styles.actionButton, styles.shareButton)}
          onClick={handleShare}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Share job"
        >
          <ShareIcon className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Main card content */}
      <div className={styles.cardContent}>
        {/* Company header */}
        <div className={styles.companyHeader}>
          <div className={styles.companyLogo}>
            {job.company.logo && !imageError ? (
              <img
                src={job.company.logo}
                alt={`${job.company.name} logo`}
                className={cn(styles.logoImage, { [styles.logoLoaded]: imageLoaded })}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={styles.logoFallback}>
                {getCompanyInitials()}
              </div>
            )}
            
            {job.company.isVerified && (
              <div className={styles.verifiedBadge}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
              </div>
            )}
          </div>
          
          <div className={styles.companyInfo}>
            <h3 className={styles.companyName}>{job.company.name}</h3>
            <div className={styles.companyMeta}>
              {job.company.industry && (
                <span className={styles.industry}>{job.company.industry}</span>
              )}
              {job.company.industry && job.company.size && <span>•</span>}
              {job.company.size && (
                <span className={styles.size}>
                  {job.company.size.toLowerCase().replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Job title */}
        <motion.h1 
          className={styles.jobTitle}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {job.title}
        </motion.h1>

        {/* Job metadata */}
        <div className={styles.jobMeta}>
          <div className={styles.location}>
            <MapPinIcon className="w-4 h-4" />
            <span>{job.location || `${job.city || 'Location'}${job.state ? `, ${job.state}` : ''}`}</span>
          </div>
          
          {job.remote && (
            <div className={cn(styles.remoteBadge, styles[`remote${job.remoteType}`])}>
              {job.remoteType === 'REMOTE' ? 'Remote' : 'Hybrid'}
            </div>
          )}
          
          <div className={styles.timePosted}>
            <ClockIcon className="w-4 h-4" />
            <span>{formatTimeAgo()}</span>
          </div>
        </div>

        {/* Salary highlight */}
        <motion.div 
          className={styles.salaryHighlight}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <CurrencyDollarIcon className="w-5 h-5" />
          <span className={styles.salaryAmount}>{formatSalary()}</span>
          {job.equity && (
            <span className={styles.equityBadge}>+ Equity</span>
          )}
        </motion.div>

        {/* Expansion trigger for mobile */}
        {deviceType === 'mobile' && (
          <motion.button
            className={styles.expandButton}
            onClick={handleExpansionToggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={state.isExpanded ? 'Show less details' : 'Show more details'}
          >
            {state.isExpanded ? (
              <>
                <ChevronUpIcon className="w-5 h-5" />
                <span>Show Less</span>
              </>
            ) : (
              <>
                <ChevronDownIcon className="w-5 h-5" />
                <span>Show More</span>
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Expandable details */}
      <JobSwipeDetails
        job={job}
        isExpanded={state.isExpanded}
        expansionProgress={state.expansionProgress}
        trigger={state.expansionTrigger}
        onCollapse={onCollapse}
        onApply={swipeRight}
        onSave={handleSave}
        onShare={handleShare}
        config={config}
        deviceType={deviceType}
      />

      {/* Accessibility content */}
      <div className="sr-only">
        {job.description && `Job description: ${job.description.slice(0, 200)}...`}
        {job.skills && job.skills.length > 0 && ` Skills required: ${job.skills.slice(0, 3).join(', ')}`}
        {job.benefits && ` Benefits: ${job.benefits.slice(0, 100)}...`}
      </div>
    </motion.div>
  );
});

JobSwipeCard.displayName = 'JobSwipeCard';