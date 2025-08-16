'use client';

/**
 * useJobCard Hook
 * Handles all JobCard logic, state management, and psychological UX patterns
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { 
  JobData, 
  UseJobCardReturn, 
  JobCardState, 
  JobCardAnalytics,
  JobBadge,
  FormattedSalary,
  CompanyLogo
} from '../types/job';

interface UseJobCardProps {
  job: JobData;
  matchScore?: number;
}

export function useJobCard({ job, matchScore }: UseJobCardProps): UseJobCardReturn {
  // Component state
  const [state, setState] = useState<JobCardState>({
    isHovered: false,
    isPressed: false,
    swipeDirection: null,
    swipeProgress: 0
  });

  // Analytics tracking
  const [analytics, setAnalytics] = useState<JobCardAnalytics>({
    viewTime: 0,
    hoverDuration: 0,
    interactionCount: 0,
    actionsTaken: []
  });

  // View time tracking
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setAnalytics(prev => ({
        ...prev,
        viewTime: Date.now() - startTime
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Hover duration tracking
  useEffect(() => {
    let hoverStart: number | null = null;

    if (state.isHovered) {
      hoverStart = Date.now();
    } else if (hoverStart) {
      setAnalytics(prev => ({
        ...prev,
        hoverDuration: prev.hoverDuration + (Date.now() - hoverStart!)
      }));
    }

    return () => {
      if (hoverStart) {
        setAnalytics(prev => ({
          ...prev,
          hoverDuration: prev.hoverDuration + (Date.now() - hoverStart!)
        }));
      }
    };
  }, [state.isHovered]);

  // Generate job badges based on job properties
  const badges = useMemo((): JobBadge[] => {
    const badges: JobBadge[] = [];

    // New job badge (posted within 24 hours)
    // if (job.postedAt && isWithin24Hours(job.postedAt)) {
    //   badges.push({
    //     type: 'new',
    //     label: 'New',
    //     color: 'green',
    //     priority: 9
    //   });
    // }

    // Urgent job badge
    if (job.isUrgent) {
      badges.push({
        type: 'urgent',
        label: 'Urgent',
        color: 'amber',
        priority: 8
      });
    }

    // Featured job badge
    if (job.isFeatured) {
      badges.push({
        type: 'featured',
        label: 'Featured',
        color: 'purple',
        priority: 7
      });
    }

    // Verified company badge
    if (job.isVerified || job.company.isVerified) {
      badges.push({
        type: 'verified',
        label: 'Verified',
        color: 'blue',
        priority: 6
      });
    }

    // Remote work badge
    if (job.remote) {
      badges.push({
        type: 'remote',
        label: job.remoteType === 'REMOTE' ? 'Remote' : 'Hybrid',
        color: 'indigo',
        priority: 5
      });
    }

    // High match score badge
    if (matchScore && matchScore >= 85) {
      badges.push({
        type: 'match',
        label: `${Math.round(matchScore)}% Match`,
        color: 'green',
        priority: 10
      });
    }

    // Sort badges by priority (highest first) and limit to top 3
    return badges
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);
  }, [job, matchScore]);

  // Format salary information
  const formattedSalary = useMemo((): FormattedSalary => {
    const { salaryMin, salaryMax, currency = 'USD', salaryType } = job;

    // No salary information available
    if (!salaryMin && !salaryMax) {
      return {
        display: 'Competitive salary',
        currency,
        isRange: false,
        isCompetitive: true
      };
    }

    // Format currency
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };

    // Single salary value
    if (salaryMin && !salaryMax) {
      const display = formatCurrency(salaryMin);
      return {
        display: salaryType === 'HOURLY' ? `${display}/hr` : `${display}/yr`,
        currency,
        isRange: false,
        isCompetitive: false
      };
    }

    // Salary range
    if (salaryMin && salaryMax) {
      const minFormatted = formatCurrency(salaryMin);
      const maxFormatted = formatCurrency(salaryMax);
      const suffix = salaryType === 'HOURLY' ? '/hr' : '/yr';
      
      return {
        display: `${minFormatted} - ${maxFormatted}${suffix}`,
        range: `${minFormatted} - ${maxFormatted}`,
        currency,
        isRange: true,
        isCompetitive: false
      };
    }

    return {
      display: 'Salary not specified',
      currency,
      isRange: false,
      isCompetitive: true
    };
  }, [job.salaryMin, job.salaryMax, job.currency, job.salaryType]);

  // Generate company logo information
  const companyLogo = useMemo((): CompanyLogo => {
    const { company } = job;
    
    // Generate company initials fallback
    const generateInitials = (name: string): string => {
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2);
    };

    return {
      url: company.logo,
      fallback: generateInitials(company.name),
      hasLogo: Boolean(company.logo)
    };
  }, [job.company]);

  // Event handlers
  const handleMouseEnter = useCallback(() => {
    setState(prev => ({ ...prev, isHovered: true }));
    setAnalytics(prev => ({
      ...prev,
      interactionCount: prev.interactionCount + 1
    }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setState(prev => ({
      ...prev,
      isHovered: false,
      isPressed: false,
      swipeDirection: null,
      swipeProgress: 0
    }));
  }, []);

  const handleMouseDown = useCallback(() => {
    setState(prev => ({ ...prev, isPressed: true }));
  }, []);

  const handleMouseUp = useCallback(() => {
    setState(prev => ({ ...prev, isPressed: false }));
  }, []);

  const handleTouchStart = useCallback(() => {
    setState(prev => ({ ...prev, isPressed: true }));
    // Simulate haptic feedback on supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setState(prev => ({ ...prev, isPressed: false }));
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle keyboard interactions for accessibility
    if (e.key === 'Enter' || e.key === ' ') {
      setAnalytics(prev => ({
        ...prev,
        actionsTaken: [...prev.actionsTaken, 'keyboard_apply'],
        swipeDirection: 'right'
      }));
    } else if (e.key === 'Escape') {
      setAnalytics(prev => ({
        ...prev,
        actionsTaken: [...prev.actionsTaken, 'keyboard_skip'],
        swipeDirection: 'left'
      }));
    }
  }, []);

  // Utility functions
  const isWithin24Hours = (date: Date): boolean => {
    const now = new Date();
    const diffInHours = (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60);
    return diffInHours <= 24;
  };

  return {
    state,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onKeyDown: handleKeyDown
    },
    analytics,
    badges,
    formattedSalary,
    companyLogo
  };
}