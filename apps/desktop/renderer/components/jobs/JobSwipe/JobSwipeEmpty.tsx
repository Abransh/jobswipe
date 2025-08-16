'use client';

/**
 * JobSwipeEmpty Component
 * Beautiful empty state when no more jobs are available
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  HeartIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

// Types
import type { DeviceType, JobSwipeConfig } from '../types/jobSwipe';

// Styles
import styles from './JobSwipe.module.css';

interface JobSwipeEmptyProps {
  onRefresh?: () => void;
  deviceType: DeviceType;
  config: JobSwipeConfig;
  className?: string;
}

export function JobSwipeEmpty({
  onRefresh,
  deviceType,
  config,
  className
}: JobSwipeEmptyProps) {
  
  const iconVariants = {
    hidden: { scale: 0, opacity: 0, rotate: -180 },
    visible: (delay: number) => ({
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        delay: delay * 0.2,
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    }),
    float: {
      y: [-5, 5, -5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: delay * 0.1,
        duration: 0.6,
        ease: 'easeOut'
      }
    })
  };

  const buttonVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 1.2,
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  return (
    <div className={cn(styles.emptyState, className)}>
      <motion.div
        className={styles.emptyContent}
        initial="hidden"
        animate="visible"
      >
        {/* Floating Icons */}
        <div className={styles.floatingIcons}>
          <motion.div
            className={cn(styles.floatingIcon, styles.icon1)}
            variants={iconVariants}
            initial="hidden"
            animate={['visible', 'float']}
            custom={0}
          >
            <HeartIcon className="w-8 h-8 text-pink-400" />
          </motion.div>
          
          <motion.div
            className={cn(styles.floatingIcon, styles.icon2)}
            variants={iconVariants}
            initial="hidden"
            animate={['visible', 'float']}
            custom={1}
          >
            <CheckCircleIcon className="w-6 h-6 text-green-400" />
          </motion.div>
          
          <motion.div
            className={cn(styles.floatingIcon, styles.icon3)}
            variants={iconVariants}
            initial="hidden"
            animate={['visible', 'float']}
            custom={2}
          >
            <MagnifyingGlassIcon className="w-7 h-7 text-blue-400" />
          </motion.div>
        </div>

        {/* Main Illustration */}
        <motion.div
          className={styles.emptyIllustration}
          variants={iconVariants}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <div className={styles.illustrationCircle}>
            <motion.div
              className={styles.illustrationInner}
              animate={{
                rotate: [0, 360],
                transition: {
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear'
                }
              }}
            >
              <MagnifyingGlassIcon className="w-16 h-16 text-gray-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Text Content */}
        <div className={styles.emptyText}>
          <motion.h2
            className={styles.emptyTitle}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            You've seen all available jobs! 🎉
          </motion.h2>
          
          <motion.p
            className={styles.emptyDescription}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            custom={4}
          >
            Great job exploring all the opportunities. Check back later for new positions,
            or adjust your preferences to see more matches.
          </motion.p>
        </div>

        {/* Action Buttons */}
        <motion.div
          className={styles.emptyActions}
          variants={textVariants}
          initial="hidden"
          animate="visible"
          custom={5}
        >
          {onRefresh && (
            <motion.button
              className={styles.refreshButton}
              onClick={onRefresh}
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              aria-label="Refresh to load more jobs"
            >
              <ArrowPathIcon className="w-5 h-5" />
              <span>Refresh Jobs</span>
            </motion.button>
          )}
          
          <motion.button
            className={styles.secondaryButton}
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            whileTap="tap"
            onClick={() => {
              // Navigate to preferences or saved jobs
              console.log('Navigate to preferences');
            }}
            aria-label="View your preferences"
          >
            <HeartIcon className="w-5 h-5" />
            <span>View Saved Jobs</span>
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          className={styles.emptyStats}
          variants={textVariants}
          initial="hidden"
          animate="visible"
          custom={6}
        >
          <div className={styles.statItem}>
            <CheckCircleIcon className="w-4 h-4 text-green-500" />
            <span>All caught up!</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Background Pattern */}
      <div className={styles.emptyBackground}>
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className={styles.backgroundDot}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1, 0], 
              opacity: [0, 0.3, 0],
              transition: {
                duration: 3,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut'
              }
            }}
            style={{
              left: `${10 + (i % 4) * 25}%`,
              top: `${20 + Math.floor(i / 4) * 30}%`
            }}
          />
        ))}
      </div>

      {/* Accessibility */}
      <div className="sr-only" aria-live="polite">
        No more jobs available at this time. You can refresh to check for new opportunities.
      </div>
    </div>
  );
}

// Add styles to JobSwipe.module.css
const emptyStateStyles = `
/* Empty State Styles */
.emptyState {
  @apply relative w-full h-full flex items-center justify-center p-8;
  @apply bg-gradient-to-br from-blue-50 to-indigo-50;
}

.emptyContent {
  @apply relative text-center max-w-md mx-auto space-y-8;
}

.floatingIcons {
  @apply absolute inset-0 pointer-events-none;
}

.floatingIcon {
  @apply absolute opacity-60;
}

.icon1 {
  @apply top-8 right-12;
}

.icon2 {
  @apply top-24 left-8;
}

.icon3 {
  @apply bottom-16 right-4;
}

.emptyIllustration {
  @apply relative mx-auto w-32 h-32;
}

.illustrationCircle {
  @apply w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200;
  @apply flex items-center justify-center shadow-lg;
  @apply border-4 border-white;
}

.illustrationInner {
  @apply flex items-center justify-center;
}

.emptyText {
  @apply space-y-4;
}

.emptyTitle {
  @apply text-2xl font-bold text-gray-900;
}

.emptyDescription {
  @apply text-gray-600 leading-relaxed max-w-xs mx-auto;
}

.emptyActions {
  @apply flex flex-col sm:flex-row gap-3 justify-center;
}

.refreshButton {
  @apply flex items-center justify-center space-x-2 px-6 py-3;
  @apply bg-gradient-to-r from-blue-600 to-blue-700 text-white;
  @apply rounded-lg font-semibold shadow-lg;
  @apply transition-all duration-200 ease-out;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500/50;
}

.refreshButton:hover {
  @apply from-blue-700 to-blue-800 shadow-xl;
  transform: translateY(-1px);
}

.secondaryButton {
  @apply flex items-center justify-center space-x-2 px-6 py-3;
  @apply bg-white text-gray-700 border border-gray-200;
  @apply rounded-lg font-medium shadow-sm;
  @apply transition-all duration-200 ease-out;
  @apply focus:outline-none focus:ring-2 focus:ring-gray-500/50;
}

.secondaryButton:hover {
  @apply bg-gray-50 border-gray-300 shadow-md;
}

.emptyStats {
  @apply flex justify-center;
}

.statItem {
  @apply flex items-center space-x-2 text-sm text-gray-600;
}

.emptyBackground {
  @apply absolute inset-0 overflow-hidden pointer-events-none;
}

.backgroundDot {
  @apply absolute w-2 h-2 bg-blue-300 rounded-full;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .emptyState {
    @apply from-gray-900 to-gray-800;
  }
  
  .emptyTitle {
    @apply text-white;
  }
  
  .emptyDescription {
    @apply text-gray-300;
  }
  
  .illustrationCircle {
    @apply from-gray-700 to-gray-800 border-gray-600;
  }
  
  .secondaryButton {
    @apply bg-gray-800 text-gray-300 border-gray-600;
  }
  
  .secondaryButton:hover {
    @apply bg-gray-700 border-gray-500;
  }
  
  .statItem {
    @apply text-gray-400;
  }
  
  .backgroundDot {
    @apply bg-gray-600;
  }
}
`;