'use client';

/**
 * JobSwipeLoading Component
 * Elegant loading state with card-shaped skeletons and smooth animations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Types
import type { DeviceType, JobSwipeConfig } from '../types/jobSwipe';

// Styles
import styles from './JobSwipe.module.css';

interface JobSwipeLoadingProps {
  deviceType: DeviceType;
  config: JobSwipeConfig;
  className?: string;
}

export function JobSwipeLoading({
  deviceType,
  config,
  className
}: JobSwipeLoadingProps) {
  
  const shimmerVariants = {
    initial: { 
      backgroundPosition: '-200% 0' 
    },
    animate: { 
      backgroundPosition: '200% 0',
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: "linear"
      }
    }
  };

  const cardVariants = {
    hidden: { 
      scale: 0.8, 
      opacity: 0, 
      y: 20 
    },
    visible: (delay: number) => ({
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        delay: delay * 0.1,
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }),
    pulse: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const SkeletonElement = ({ 
    width = 'w-full', 
    height = 'h-4', 
    className: skeletonClassName,
    delay = 0
  }: {
    width?: string;
    height?: string;
    className?: string;
    delay?: number;
  }) => (
    <motion.div
      className={cn(
        'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md',
        width,
        height,
        skeletonClassName
      )}
      variants={config.enableAnimations ? shimmerVariants : {}}
      initial="initial"
      animate="animate"
      style={config.enableAnimations ? {
        backgroundSize: '200% 100%'
      } : {}}
    />
  );

  const LoadingCard = ({ delay = 0 }: { delay?: number }) => (
    <motion.div
      className={cn(styles.loadingCard, {
        [styles.loadingCardMobile]: deviceType === 'mobile',
        [styles.loadingCardTablet]: deviceType === 'tablet',
        [styles.loadingCardDesktop]: deviceType === 'desktop'
      })}
      variants={cardVariants}
      initial="hidden"
      animate={['visible', 'pulse']}
      custom={delay}
    >
      {/* Header skeleton */}
      <div className={styles.loadingHeader}>
        <SkeletonElement 
          width="w-12" 
          height="h-12" 
          className="rounded-xl flex-shrink-0" 
        />
        <div className="flex-1 space-y-2">
          <SkeletonElement width="w-32" height="h-4" />
          <SkeletonElement width="w-24" height="h-3" />
        </div>
        <SkeletonElement width="w-16" height="h-6" className="rounded-full" />
      </div>

      {/* Title skeleton */}
      <div className={styles.loadingTitle}>
        <SkeletonElement width="w-full" height="h-6" />
        <SkeletonElement width="w-3/4" height="h-6" />
      </div>

      {/* Metadata skeleton */}
      <div className={styles.loadingMeta}>
        <SkeletonElement width="w-20" height="h-3" />
        <SkeletonElement width="w-16" height="h-6" className="rounded-md" />
        <SkeletonElement width="w-18" height="h-3" />
      </div>

      {/* Salary skeleton */}
      <div className={styles.loadingSalary}>
        <SkeletonElement width="w-32" height="h-5" />
      </div>

      {/* Description skeleton */}
      <div className={styles.loadingDescription}>
        <SkeletonElement width="w-full" height="h-3" />
        <SkeletonElement width="w-full" height="h-3" />
        <SkeletonElement width="w-2/3" height="h-3" />
      </div>

      {/* Skills skeleton */}
      <div className={styles.loadingSkills}>
        <SkeletonElement width="w-12" height="h-6" className="rounded-md" />
        <SkeletonElement width="w-16" height="h-6" className="rounded-md" />
        <SkeletonElement width="w-14" height="h-6" className="rounded-md" />
      </div>
    </motion.div>
  );

  return (
    <div className={cn(styles.loadingContainer, className)}>
      {/* Main loading card */}
      <div className={styles.loadingCardArea}>
        <LoadingCard delay={0} />
      </div>

      {/* Background stack cards */}
      <div className={styles.loadingStack}>
        <motion.div
          className={cn(styles.stackLoadingCard, styles.stack1)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 0.6, y: 8 }}
          transition={{ delay: 0.2 }}
        />
        <motion.div
          className={cn(styles.stackLoadingCard, styles.stack2)}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 0.4, y: 16 }}
          transition={{ delay: 0.4 }}
        />
      </div>

      {/* Loading indicator */}
      <motion.div
        className={styles.loadingIndicator}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className={styles.loadingSpinner}>
          <motion.div
            className={styles.spinnerRing}
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: 'linear' 
            }}
          />
        </div>
        <span className={styles.loadingText}>Finding amazing jobs for you...</span>
      </motion.div>

      {/* Floating elements */}
      {config.enableAnimations && (
        <div className={styles.floatingElements}>
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className={styles.floatingElement}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 0], 
                opacity: [0, 0.3, 0],
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                transition: {
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: 'easeInOut'
                }
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>
      )}

      {/* Progress hints */}
      <motion.div
        className={styles.progressHints}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          className={styles.progressDot}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className={styles.progressDot}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className={styles.progressDot}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
        />
      </motion.div>

      {/* Accessibility */}
      <div className="sr-only" aria-live="polite">
        Loading job opportunities. Please wait while we find the best matches for you.
      </div>
    </div>
  );
}

// Add styles to JobSwipe.module.css
const loadingStateStyles = `
/* Loading State Styles */
.loadingContainer {
  @apply relative w-full h-full flex items-center justify-center;
  @apply bg-gradient-to-br from-blue-50 to-indigo-50;
}

.loadingCardArea {
  @apply relative z-20;
}

.loadingCard {
  @apply relative w-80 bg-white rounded-2xl shadow-lg border border-gray-200;
  @apply p-6 space-y-4 backdrop-blur-sm;
  min-height: 320px;
}

.loadingCardMobile {
  @apply w-full max-w-sm;
  min-height: 280px;
}

.loadingCardTablet {
  @apply w-96;
  min-height: 300px;
}

.loadingCardDesktop {
  @apply w-80;
  min-height: 320px;
}

.loadingHeader {
  @apply flex items-center space-x-3;
}

.loadingTitle {
  @apply space-y-2;
}

.loadingMeta {
  @apply flex items-center space-x-3;
}

.loadingSalary {
  @apply p-3 bg-gray-50 rounded-lg;
}

.loadingDescription {
  @apply space-y-2;
}

.loadingSkills {
  @apply flex space-x-2;
}

.loadingStack {
  @apply absolute inset-0 flex items-center justify-center pointer-events-none;
}

.stackLoadingCard {
  @apply absolute w-80 bg-white rounded-2xl shadow-lg border border-gray-200;
  min-height: 320px;
  background: linear-gradient(135deg, rgba(249, 250, 251, 0.95) 0%, rgba(243, 244, 246, 0.9) 100%);
}

.loadingIndicator {
  @apply absolute bottom-8 left-1/2 transform -translate-x-1/2;
  @apply flex flex-col items-center space-y-3;
}

.loadingSpinner {
  @apply relative w-8 h-8;
}

.spinnerRing {
  @apply w-full h-full border-2 border-blue-200 border-t-blue-600 rounded-full;
}

.loadingText {
  @apply text-sm text-gray-600 font-medium;
}

.floatingElements {
  @apply absolute inset-0 overflow-hidden pointer-events-none;
}

.floatingElement {
  @apply absolute w-2 h-2 bg-blue-300 rounded-full opacity-30;
}

.progressHints {
  @apply absolute bottom-20 left-1/2 transform -translate-x-1/2;
  @apply flex space-x-2;
}

.progressDot {
  @apply w-2 h-2 bg-blue-400 rounded-full;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .loadingContainer {
    @apply from-gray-900 to-gray-800;
  }
  
  .loadingCard {
    @apply bg-gray-800 border-gray-700;
  }
  
  .stackLoadingCard {
    @apply bg-gray-800 border-gray-700;
    background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(55, 65, 81, 0.9) 100%);
  }
  
  .loadingSalary {
    @apply bg-gray-700;
  }
  
  .loadingText {
    @apply text-gray-300;
  }
  
  .spinnerRing {
    @apply border-gray-600 border-t-blue-400;
  }
  
  .progressDot {
    @apply bg-blue-500;
  }
  
  .floatingElement {
    @apply bg-gray-600;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .loadingCard,
  .stackLoadingCard,
  .loadingIndicator,
  .progressHints {
    @apply transition-none;
  }
  
  .spinnerRing {
    @apply animate-none;
  }
  
  .progressDot {
    @apply animate-none;
  }
  
  .floatingElement {
    @apply animate-none opacity-20;
  }
}
`;