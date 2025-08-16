/**
 * JobSwipeContainer Component for Desktop
 * Main container for the single-card JobSwipe experience
 * Enhanced for desktop with keyboard shortcuts and mouse interactions
 */

import React, { useState, useEffect } from 'react';
import { JobSwipeCard } from './JobSwipeCard';
import { JobSwipeEmpty } from './JobSwipeEmpty';
import { JobSwipeLoading } from './JobSwipeLoading';
import { useJobSwipe } from '../../hooks/useJobSwipe';
import type { JobSwipeContainerProps, DeviceType, CardDimensions } from '../../types/jobSwipe';
import { CARD_DIMENSIONS } from '../../types/jobSwipe';

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
  className = '',
  style,
  isLoading: externalLoading = false,
  error: externalError = null
}: JobSwipeContainerProps) {
  
  // Device detection - defaulting to desktop for Electron
  const [deviceType] = useState<DeviceType>('desktop');
  const [dimensions] = useState<CardDimensions>(CARD_DIMENSIONS.desktop);
  
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

  // Handle keyboard shortcuts (enhanced for desktop)
  useEffect(() => {
    if (!config.enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not focused on input elements
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Prevent default for our handled keys
      const handledKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' ', 'Escape'];
      if (handledKeys.includes(e.key)) {
        e.preventDefault();
      }
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'Escape':
          swipeLeft();
          break;
          
        case 'ArrowRight':
        case 'Enter':
        case ' ':
          swipeRight();
          break;
          
        case 'ArrowUp':
          if (!cardState.isExpanded) {
            expandCard('keyboard');
          }
          break;
          
        case 'ArrowDown':
          if (cardState.isExpanded) {
            collapseCard();
          }
          break;

        // Additional desktop shortcuts
        case 's':
        case 'S':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (currentJob) {
              onJobSave?.(currentJob.job);
            }
          }
          break;

        case 'o':
        case 'O':
          if (currentJob) {
            onJobShare?.(currentJob.job);
          }
          break;

        case 'r':
        case 'R':
          preloadNext();
          break;
          
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    config.enableKeyboardShortcuts,
    swipeLeft, 
    swipeRight, 
    expandCard, 
    collapseCard, 
    cardState.isExpanded,
    currentJob,
    onJobSave,
    onJobShare,
    preloadNext
  ]);

  // Loading state
  if (externalLoading || (!currentJob && queueLength === 0 && !externalError)) {
    return (
      <div className={`jobswipe-container ${className}`} style={style}>
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
      <div className={`jobswipe-container ${className}`} style={style}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">{externalError}</p>
            <button 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              onClick={() => preloadNext()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!currentJob && queueLength === 0) {
    return (
      <div className={`jobswipe-container ${className}`} style={style}>
        <JobSwipeEmpty 
          onRefresh={() => preloadNext()}
          deviceType={deviceType}
          config={config}
        />
      </div>
    );
  }

  // Main swipe interface
  return (
    <div 
      className={`jobswipe-container ${className}`}
      style={style}
      role="application"
      aria-label="Job swipe interface"
      tabIndex={-1}
    >
      {/* Background cards stack */}
      <div className="jobswipe-card-stack">
        {hasNextJob && (
          <>
            <div className="jobswipe-stack-card stack-1">
              <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center">
                <div className="text-gray-400 text-sm">Next job</div>
              </div>
            </div>
            <div className="jobswipe-stack-card stack-2">
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl"></div>
            </div>
          </>
        )}
      </div>

      {/* Main card area */}
      <div className="absolute inset-0 flex items-center justify-center">
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
      </div>

      {/* Status bar */}
      <div className="jobswipe-status-bar">
        {/* Queue indicator */}
        {queueLength > 0 && (
          <div className="queue-indicator">
            <span className="text-sm font-medium text-gray-900">{queueLength}</span>
            <span className="text-xs text-gray-500">
              {queueLength === 1 ? 'job left' : 'jobs left'}
            </span>
          </div>
        )}

        {/* Desktop keyboard hints */}
        {analytics.length === 0 && queueLength > 0 && config.enableKeyboardShortcuts && (
          <div className="swipe-hints">
            <div className="swipe-hint">
              <span className="text-red-500 font-mono">←</span>
              <span>Pass</span>
            </div>
            <div className="swipe-hint">
              <span className="text-green-500 font-mono">→</span>
              <span>Apply</span>
            </div>
            <div className="swipe-hint">
              <span className="text-blue-500 font-mono">↑</span>
              <span>Details</span>
            </div>
          </div>
        )}

        {/* Debug info for development */}
        {config.debugMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs">
            <div>Queue: {queueLength}</div>
            <div>Device: {deviceType}</div>
            <div>State: {cardState.state}</div>
            <div>Expanded: {cardState.isExpanded ? 'Yes' : 'No'}</div>
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
          <li>Press S to save the current job</li>
          <li>Press O to open job in browser</li>
          <li>Press R to refresh jobs</li>
          <li>Use tab to navigate interactive elements</li>
        </ul>
      </div>
    </div>
  );
}