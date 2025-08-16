/**
 * JobSwipeCard Component for Desktop
 * Individual job card with gesture support and desktop enhancements
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { JobSwipeCardProps } from '../../types/jobSwipe';

export function JobSwipeCard({
  job,
  matchScore,
  state,
  isActive,
  zIndex,
  onGestureStart,
  onGestureMove,
  onGestureEnd,
  onExpand,
  onCollapse,
  onSave,
  onShare,
  swipeLeft,
  swipeRight,
  config,
  dimensions,
  deviceType,
  className = '',
  style
}: JobSwipeCardProps) {
  
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Format salary
  const formatSalary = (salary?: { min: number; max: number; currency: string }) => {
    if (!salary) return 'Salary not specified';
    
    const format = (amount: number) => {
      if (amount >= 1000) {
        return `${Math.round(amount / 1000)}k`;
      }
      return amount.toString();
    };
    
    return `$${format(salary.min)} - $${format(salary.max)} ${salary.currency}`;
  };

  // Get match score styling
  const getMatchScoreClass = (score?: number) => {
    if (!score) return 'match-score low';
    if (score >= 85) return 'match-score high';
    if (score >= 70) return 'match-score medium';
    return 'match-score low';
  };

  // Handle mouse down for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!config.enableMouseGestures) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    
    onGestureStart({
      type: 'start',
      direction: null,
      distance: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      deltaTime: 0,
      target: e.target,
      inputMethod: 'mouse'
    });
    
    e.preventDefault();
  }, [config.enableMouseGestures, onGestureStart]);

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    const direction = deltaX > 0 ? 'right' : deltaX < 0 ? 'left' : null;
    
    onGestureMove({
      type: 'move',
      direction,
      distance: { x: deltaX, y: deltaY },
      velocity: { x: deltaX / 10, y: deltaY / 10 }, // Simplified velocity
      deltaTime: Date.now(),
      target: e.target,
      inputMethod: 'mouse'
    });
  }, [isDragging, dragStart, onGestureMove]);

  // Handle mouse up for dragging
  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const deltaX = e.clientX - dragStart.x;
    const direction = deltaX > 0 ? 'right' : deltaX < 0 ? 'left' : null;
    
    onGestureEnd({
      type: 'end',
      direction,
      distance: { x: deltaX, y: e.clientY - dragStart.y },
      velocity: { x: deltaX / 10, y: 0 },
      deltaTime: Date.now(),
      target: e.target,
      inputMethod: 'mouse'
    });

    // Trigger swipe actions based on distance
    if (Math.abs(deltaX) > config.swipeThreshold) {
      if (direction === 'left') {
        swipeLeft();
      } else if (direction === 'right') {
        swipeRight();
      }
    }
  }, [isDragging, dragStart, onGestureEnd, config.swipeThreshold, swipeLeft, swipeRight]);

  // Set up mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Calculate transform based on state
  const getTransform = () => {
    let transform = '';
    
    // Apply drag offset
    if (state.isDragging && state.dragOffset) {
      const rotationAngle = (state.dragOffset.x / dimensions.width) * 15; // Max 15 degrees
      transform += `translateX(${state.dragOffset.x}px) translateY(${state.dragOffset.y}px) rotate(${rotationAngle}deg)`;
    }
    
    // Apply expansion scaling
    if (state.isExpanded) {
      const scale = 1 + (state.expansionProgress * 0.05); // Subtle scale increase
      transform += ` scale(${scale})`;
    }
    
    return transform || 'none';
  };

  // Calculate height based on expansion
  const getHeight = () => {
    const { collapsed, expanded } = dimensions.height;
    if (state.isExpanded) {
      return collapsed + ((expanded - collapsed) * state.expansionProgress);
    }
    return collapsed;
  };

  return (
    <div
      ref={cardRef}
      className={`jobswipe-card ${state.state} ${className}`}
      style={{
        width: dimensions.width,
        height: getHeight(),
        transform: getTransform(),
        zIndex,
        padding: dimensions.padding,
        cursor: isDragging ? 'grabbing' : 'grab',
        ...style
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={() => !state.isExpanded ? onExpand('tap') : onCollapse()}
      role="article"
      aria-label={`Job: ${job.title} at ${job.company.name}`}
      tabIndex={isActive ? 0 : -1}
    >
      {/* Card Header */}
      <div className="jobswipe-card-header">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Company Logo */}
            <div className="company-logo">
              {job.company.logo ? (
                <img 
                  src={job.company.logo} 
                  alt={job.company.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span>{job.company.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {job.title}
              </h3>
              <p className="text-sm text-gray-600">{job.company.name}</p>
            </div>
          </div>
          
          {/* Match Score */}
          {matchScore && (
            <div className={getMatchScoreClass(matchScore)}>
              {Math.round(matchScore)}% match
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="jobswipe-card-body">
        {/* Location and Remote Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm text-gray-600">{job.location}</span>
          </div>
          
          {job.remote && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Remote OK
            </span>
          )}
          
          {job.isUrgent && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Urgent
            </span>
          )}
        </div>

        {/* Salary */}
        {job.salary && (
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span className="text-sm font-medium text-gray-900">
              {formatSalary(job.salary)}
            </span>
          </div>
        )}

        {/* Description (truncated unless expanded) */}
        <div className="text-sm text-gray-700">
          <p className={state.isExpanded ? '' : 'line-clamp-3'}>
            {job.description}
          </p>
        </div>

        {/* Requirements (visible when expanded) */}
        {state.isExpanded && job.requirements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements</h4>
            <div className="flex flex-wrap gap-2">
              {job.requirements.slice(0, 6).map((req, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {req}
                </span>
              ))}
              {job.requirements.length > 6 && (
                <span className="text-xs text-gray-500">
                  +{job.requirements.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Benefits (visible when expanded) */}
        {state.isExpanded && job.benefits && job.benefits.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Benefits</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {job.benefits.slice(0, 4).map((benefit, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="jobswipe-card-footer">
        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {/* Pass Button */}
          <button
            className="swipe-action-btn pass"
            onClick={(e) => {
              e.stopPropagation();
              swipeLeft();
            }}
            title="Pass on this job (Left Arrow)"
            aria-label="Pass on this job"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Expand/Collapse Button */}
          <button
            className="swipe-action-btn expand"
            onClick={(e) => {
              e.stopPropagation();
              if (state.isExpanded) {
                onCollapse();
              } else {
                onExpand('tap');
              }
            }}
            title={state.isExpanded ? "Collapse details (Down Arrow)" : "Expand details (Up Arrow)"}
            aria-label={state.isExpanded ? "Collapse job details" : "Expand job details"}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {state.isExpanded ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7-7m0 0l-7 7m7-7v18" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              )}
            </svg>
          </button>

          {/* Apply Button */}
          <button
            className="swipe-action-btn apply"
            onClick={(e) => {
              e.stopPropagation();
              swipeRight();
            }}
            title="Apply to this job (Right Arrow or Space)"
            aria-label="Apply to this job"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="flex items-center space-x-2">
          {/* Save Button */}
          {onSave && (
            <button
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onSave();
              }}
              title="Save job (Ctrl+S)"
              aria-label="Save this job"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}

          {/* Share Button */}
          {onShare && (
            <button
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              title="Open in browser (O)"
              aria-label="Open job in browser"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Swipe Direction Indicator */}
      {state.isDragging && state.swipeDirection && (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
          state.swipeDirection === 'left' ? 'bg-red-500' : 'bg-green-500'
        } bg-opacity-20 rounded-2xl transition-opacity`}>
          <div className={`text-6xl font-bold ${
            state.swipeDirection === 'left' ? 'text-red-500' : 'text-green-500'
          }`}>
            {state.swipeDirection === 'left' ? '✕' : '✓'}
          </div>
        </div>
      )}
    </div>
  );
}