'use client';

/**
 * JobSwipeContainer Component
 * Main container for the single-card JobSwipe experience
 * Manages the full-screen swipe interface with smooth transitions
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Components
import { JobSwipeCard } from './JobSwipeCard';
import { JobSwipeEmpty } from './JobSwipeEmpty';
import { JobSwipeLoading } from './JobSwipeLoading';

// Hooks
import { useJobSwipe } from '../hooks/useJobSwipe';

// Types
import type { JobSwipeContainerProps, DeviceType, CardDimensions } from '../types/jobSwipe';
import { CARD_DIMENSIONS } from '../types/jobSwipe';

// Styles
import styles from './JobSwipe.module.css';

type Theme = 'default' | 'minimal' | 'dark' | 'warm';

export function JobSwipeContainer({
  jobs = [],
  fetchJobs,
  onSwipeLeft,
  onSwipeRight,
  onJobSave,
  onJobShare,
  onJobExpand,
  onEmptyQueue,
  config: userConfig = {},
  className,
  style,
  isLoading: externalLoading = false,
  error: externalError = null
}: JobSwipeContainerProps) {
  
  // Device detection for responsive design
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [dimensions, setDimensions] = useState<CardDimensions>(CARD_DIMENSIONS.desktop);
  
  // Theme state
  const [currentTheme, setCurrentTheme] = useState<Theme>('default');
  
  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      let newDeviceType: DeviceType;
      
      if (width < 768) {
        newDeviceType = 'mobile';
      } else if (width < 1024) {
        newDeviceType = 'tablet';
      } else {
        newDeviceType = 'desktop';
      }
      
      setDeviceType(newDeviceType);
      setDimensions(CARD_DIMENSIONS[newDeviceType]);
    };
    
    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  // JobSwipe hook
  const {
    currentJob,
    hasNextJob,
    queueLength,
    cardState,
    swipeLeft,
    swipeRight,
    expandCard,
    collapseCard,
    toggleExpansion,
    preloadNext,
    config,
    analytics,
    getAnalyticsSummary
  } = useJobSwipe({
    jobs,
    fetchJobs,
    onSwipeLeft: (job, analyticsData) => {
      onSwipeLeft?.(job, analyticsData);
    },
    onSwipeRight: (job, analyticsData) => {
      onSwipeRight?.(job, analyticsData);
    },
    onEmptyQueue,
    config: userConfig
  });

  // Handle card stack animations
  const getStackCardStyle = (index: number) => {
    const offset = index * 4;
    const scale = 1 - (index * 0.02);
    const opacity = 1 - (index * 0.1);
    
    return {
      transform: `translateY(${offset}px) scale(${scale})`,
      opacity: Math.max(opacity, 0.7),
      zIndex: 10 - index
    };
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not focused on input elements
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'Escape':
          e.preventDefault();
          swipeLeft();
          break;
          
        case 'ArrowRight':
        case 'Enter':
        case ' ':
          e.preventDefault();
          swipeRight();
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          if (!cardState.isExpanded) {
            expandCard('keyboard');
          }
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          if (cardState.isExpanded) {
            collapseCard();
          }
          break;
          
        case 'Tab':
          // Allow natural tab behavior
          break;
          
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [swipeLeft, swipeRight, expandCard, collapseCard, cardState.isExpanded]);

  // Loading state
  if (externalLoading || (!currentJob && queueLength === 0 && !externalError)) {
    return (
      <div className={cn(styles.container, className)} style={style}>
        <JobSwipeLoading 
          deviceType={deviceType}
          config={config}
        />
      </div>
    );
  }

  // Error state
  if (externalError) {
    return (
      <div className={cn(styles.container, styles.error, className)} style={style}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>Something went wrong</h2>
          <p className={styles.errorMessage}>{externalError}</p>
          <button 
            className={styles.retryButton}
            onClick={() => preloadNext()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!currentJob && queueLength === 0) {
    return (
      <div className={cn(styles.container, className)} style={style}>
        <JobSwipeEmpty 
          onRefresh={() => preloadNext()}
          deviceType={deviceType}
          config={config}
        />
      </div>
    );
  }

  // Get theme class
  const getThemeClass = () => {
    switch (currentTheme) {
      case 'minimal': return styles.themeMinimal;
      case 'dark': return styles.themeDark;
      case 'warm': return styles.themeWarm;
      default: return '';
    }
  };

  // Main swipe interface
  return (
    <div 
      className={cn(styles.container, getThemeClass(), className)} 
      style={style}
      role="application"
      aria-label="Job swipe interface"
      tabIndex={-1}
    >
      {/* Background cards stack effect */}
      <div className={styles.cardStack}>
        {/* Show preview of next cards */}
        {[1, 2].map((index) => (
          hasNextJob && (
            <motion.div
              key={`stack-${index}`}
              className={cn(styles.stackCard, styles[`stack${index}`])}
              style={getStackCardStyle(index)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={styles.stackCardPlaceholder} />
            </motion.div>
          )
        ))}
      </div>

      {/* Main card area */}
      <div className={styles.cardArea}>
        <AnimatePresence mode="wait" initial={false}>
          {currentJob && (
            <JobSwipeCard
              key={currentJob.job.id}
              job={currentJob.job}
              matchScore={currentJob.matchScore}
              state={cardState}
              isActive={true}
              zIndex={20}
              onGestureStart={() => {}}
              onGestureMove={() => {}}
              onGestureEnd={() => {}}
              onExpand={(trigger) => {
                expandCard(trigger);
                onJobExpand?.(currentJob.job, trigger);
              }}
              onCollapse={collapseCard}
              onSave={() => onJobSave?.(currentJob.job)}
              onShare={() => onJobShare?.(currentJob.job)}
              config={config}
              dimensions={dimensions}
              deviceType={deviceType}
              swipeLeft={swipeLeft}
              swipeRight={swipeRight}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Status indicators */}
      <div className={styles.statusBar}>
        {/* Queue indicator */}
        <div className={styles.queueIndicator}>
          <span className={styles.queueCount}>{queueLength}</span>
          <span className={styles.queueLabel}>
            {queueLength === 1 ? 'job left' : 'jobs left'}
          </span>
        </div>

        {/* Swipe hints for first-time users */}
        {analytics.length === 0 && (
          <motion.div
            className={styles.swipeHints}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <div className={styles.swipeHint}>
              <span className={styles.swipeIcon}>👈</span>
              <span>Pass</span>
            </div>
            <div className={styles.swipeHint}>
              <span className={styles.swipeIcon}>👉</span>
              <span>Apply</span>
            </div>
          </motion.div>
        )}

        {/* Debug info (development only) */}
        {config.debugMode && (
          <div className={styles.debugInfo}>
            <div>State: {cardState.state}</div>
            <div>Expanded: {cardState.isExpanded.toString()}</div>
            <div>Queue: {queueLength}</div>
            <div>Device: {deviceType}</div>
          </div>
        )}
      </div>

      {/* Accessibility announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {currentJob && !cardState.isDragging && (
          `Job ${currentJob.job.title} at ${currentJob.job.company.name}. 
           ${currentJob.matchScore ? `${Math.round(currentJob.matchScore)}% match. ` : ''}
           ${queueLength} ${queueLength === 1 ? 'job' : 'jobs'} remaining. 
           Use arrow keys or swipe to navigate.`
        )}
      </div>

      {/* Screen reader instructions */}
      <div className="sr-only">
        <h2>Job swipe interface instructions</h2>
        <ul>
          <li>Use right arrow or enter to apply to the current job</li>
          <li>Use left arrow or escape to pass on the current job</li>
          <li>Use up arrow to expand job details</li>
          <li>Use down arrow to collapse job details</li>
          <li>Use tab to navigate interactive elements</li>
        </ul>
      </div>
    </div>
  );
}