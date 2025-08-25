'use client';

/**
 * useJobSwipe Hook
 * Core hook managing job queue, card states, and swipe interactions
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { 
  JobData, 
  JobQueueItem, 
  SwipeAnalytics, 
  JobSwipeConfig,
  UseJobSwipeReturn,
  SwipeDirection,
  ExpansionTrigger,
  DeviceType,
  CardInteractionState
} from '../types/jobSwipe';
import { DEFAULT_JOBSWIPE_CONFIG } from '../types/jobSwipe';

interface UseJobSwipeProps {
  jobs?: JobData[];
  fetchJobs?: (offset: number, limit: number) => Promise<JobData[]>;
  onSwipeLeft?: (job: JobData, analytics: SwipeAnalytics) => void;
  onSwipeRight?: (job: JobData, analytics: SwipeAnalytics) => void;
  onEmptyQueue?: () => void;
  config?: Partial<JobSwipeConfig>;
}

export function useJobSwipe({
  jobs = [],
  fetchJobs,
  onSwipeLeft,
  onSwipeRight,
  onEmptyQueue,
  config: userConfig = {}
}: UseJobSwipeProps): UseJobSwipeReturn {
  
  // Merge user config with defaults
  const config = { ...DEFAULT_JOBSWIPE_CONFIG, ...userConfig };
  
  // Queue state
  const [jobQueue, setJobQueue] = useState<JobQueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Card interaction state
  const [cardState, setCardState] = useState<CardInteractionState>({
    state: 'idle',
    isExpanded: false,
    isHovered: false,
    isDragging: false,
    swipeDirection: null,
    swipeProgress: 0,
    dragOffset: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    expansionTrigger: null,
    expansionProgress: 0,
    interactionStart: 0,
    lastUpdate: Date.now()
  });
  
  // Analytics
  const [analytics, setAnalytics] = useState<SwipeAnalytics[]>([]);
  
  // Refs
  const fetchOffsetRef = useRef(0);
  const interactionStartTimeRef = useRef<number | null>(null);
  
  // Device type detection
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  
  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };
    
    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  // Initialize queue with provided jobs
  useEffect(() => {
    if (jobs.length > 0) {
      const queueItems: JobQueueItem[] = jobs.map((job, index) => ({
        job,
        matchScore: Math.floor(Math.random() * 40) + 60, // Mock match score
        preloaded: true,
        priority: jobs.length - index,
        timestamp: new Date()
      }));
      
      setJobQueue(queueItems);
      setCurrentIndex(0);
    }
  }, [jobs]);

  // Get current job
  const currentJob = jobQueue[currentIndex] || null;
  const hasNextJob = currentIndex + 1 < jobQueue.length;
  const queueLength = Math.max(0, jobQueue.length - currentIndex);
  
  // Debug logging
  useEffect(() => {
    console.log('Job queue state:', {
      currentIndex,
      jobQueueLength: jobQueue.length,
      currentJob: currentJob?.job?.title || 'None',
      hasNextJob,
      queueLength
    });
  }, [currentIndex, jobQueue.length, currentJob, hasNextJob, queueLength]);

  // Preload next jobs
  const preloadNext = useCallback(async () => {
    if (!fetchJobs || isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const newJobs = await fetchJobs(fetchOffsetRef.current, config.preloadCount);
      
      if (newJobs.length > 0) {
        const newQueueItems: JobQueueItem[] = newJobs.map((job, index) => ({
          job,
          matchScore: Math.floor(Math.random() * 40) + 60,
          preloaded: true,
          priority: index,
          timestamp: new Date()
        }));
        
        setJobQueue(prev => [...prev, ...newQueueItems]);
        fetchOffsetRef.current += newJobs.length;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  }, [fetchJobs, isLoading, config.preloadCount]);

  // Refill queue when running low
  const refillQueue = useCallback(async () => {
    const remainingJobs = jobQueue.length - currentIndex;
    
    if (remainingJobs <= config.preloadCount && fetchJobs) {
      await preloadNext();
    }
  }, [jobQueue.length, currentIndex, config.preloadCount, fetchJobs, preloadNext]);

  // Create analytics record
  const createAnalytics = useCallback((
    job: JobData,
    direction: SwipeDirection,
    velocity: { x: number; y: number }
  ): SwipeAnalytics => {
    const timeSpent = interactionStartTimeRef.current 
      ? Date.now() - interactionStartTimeRef.current 
      : 0;
    
    return {
      jobId: job.id,
      direction,
      velocity: Math.sqrt(velocity.x ** 2 + velocity.y ** 2),
      timeSpent,
      expanded: cardState.isExpanded,
      timestamp: new Date(),
      deviceType
    };
  }, [cardState.isExpanded, deviceType]);

  // Handle swipe left
  const swipeLeft = useCallback(() => {
    if (!currentJob) {
      console.log('swipeLeft: No current job available');
      return;
    }
    
    console.log('swipeLeft: Processing job', currentJob.job.title, 'currentIndex:', currentIndex, 'queueLength:', jobQueue.length);
    
    const analyticsData = createAnalytics(
      currentJob.job,
      'left',
      cardState.velocity
    );
    
    // Record analytics
    if (config.trackAnalytics) {
      setAnalytics(prev => [...prev, analyticsData]);
    }
    
    // Call user handler
    onSwipeLeft?.(currentJob.job, analyticsData);
    
    // Move to next job
    const nextIndex = currentIndex + 1;
    console.log('swipeLeft: Moving to next index:', nextIndex, 'available jobs:', jobQueue.length);
    setCurrentIndex(nextIndex);
    
    // Reset card state
    setCardState(prev => ({
      ...prev,
      state: 'idle',
      isExpanded: false,
      swipeDirection: null,
      swipeProgress: 0,
      dragOffset: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 }
    }));
    
    // Check if queue needs refill
    refillQueue();
    
    // Check if queue is empty
    if (nextIndex >= jobQueue.length && !fetchJobs) {
      console.log('swipeLeft: Queue empty, calling onEmptyQueue');
      onEmptyQueue?.();
    }
  }, [currentJob, createAnalytics, cardState.velocity, config.trackAnalytics, onSwipeLeft, currentIndex, jobQueue.length, fetchJobs, onEmptyQueue, refillQueue]);

  // Handle swipe right
  const swipeRight = useCallback(() => {
    if (!currentJob) {
      console.log('swipeRight: No current job available');
      return;
    }
    
    console.log('swipeRight: Processing job', currentJob.job.title, 'currentIndex:', currentIndex, 'queueLength:', jobQueue.length);
    
    const analyticsData = createAnalytics(
      currentJob.job,
      'right',
      cardState.velocity
    );
    
    // Record analytics
    if (config.trackAnalytics) {
      setAnalytics(prev => [...prev, analyticsData]);
    }
    
    // Call user handler
    onSwipeRight?.(currentJob.job, analyticsData);
    
    // Move to next job
    const nextIndex = currentIndex + 1;
    console.log('swipeRight: Moving to next index:', nextIndex, 'available jobs:', jobQueue.length);
    setCurrentIndex(nextIndex);
    
    // Reset card state
    setCardState(prev => ({
      ...prev,
      state: 'idle',
      isExpanded: false,
      swipeDirection: null,
      swipeProgress: 0,
      dragOffset: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 }
    }));
    
    // Check if queue needs refill
    refillQueue();
    
    // Check if queue is empty
    if (nextIndex >= jobQueue.length && !fetchJobs) {
      console.log('swipeRight: Queue empty, calling onEmptyQueue');
      onEmptyQueue?.();
    }
  }, [currentJob, createAnalytics, cardState.velocity, config.trackAnalytics, onSwipeRight, currentIndex, jobQueue.length, fetchJobs, onEmptyQueue, refillQueue]);

  // Handle card expansion
  const expandCard = useCallback((trigger: ExpansionTrigger = 'programmatic') => {
    if (cardState.isExpanded) return;
    
    setCardState(prev => ({
      ...prev,
      state: 'expanding',
      isExpanded: true,
      expansionTrigger: trigger,
      expansionProgress: 0
    }));
    
    // Start interaction timer
    interactionStartTimeRef.current = Date.now();
    
    // Animate expansion
    const startTime = Date.now();
    const duration = config.animationDuration;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setCardState(prev => ({
        ...prev,
        expansionProgress: progress,
        state: progress >= 1 ? 'expanded' : 'expanding'
      }));
      
      if (progress < 1 && config.enableAnimations) {
        requestAnimationFrame(animate);
      }
    };
    
    if (config.enableAnimations && !config.reducedMotion) {
      requestAnimationFrame(animate);
    } else {
      setCardState(prev => ({
        ...prev,
        expansionProgress: 1,
        state: 'expanded'
      }));
    }
  }, [cardState.isExpanded, config.animationDuration, config.enableAnimations, config.reducedMotion]);

  // Handle card collapse
  const collapseCard = useCallback(() => {
    if (!cardState.isExpanded) return;
    
    setCardState(prev => ({
      ...prev,
      state: 'collapsing'
    }));
    
    // Animate collapse
    const startTime = Date.now();
    const duration = config.animationDuration * 0.7; // Faster collapse
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setCardState(prev => ({
        ...prev,
        expansionProgress: 1 - progress,
        state: progress >= 1 ? 'idle' : 'collapsing'
      }));
      
      if (progress >= 1) {
        setCardState(prev => ({
          ...prev,
          isExpanded: false,
          expansionTrigger: null
        }));
      } else if (config.enableAnimations) {
        requestAnimationFrame(animate);
      }
    };
    
    if (config.enableAnimations && !config.reducedMotion) {
      requestAnimationFrame(animate);
    } else {
      setCardState(prev => ({
        ...prev,
        isExpanded: false,
        expansionProgress: 0,
        expansionTrigger: null,
        state: 'idle'
      }));
    }
  }, [cardState.isExpanded, config.animationDuration, config.enableAnimations, config.reducedMotion]);

  // Toggle expansion
  const toggleExpansion = useCallback(() => {
    if (cardState.isExpanded) {
      collapseCard();
    } else {
      expandCard('programmatic');
    }
  }, [cardState.isExpanded, expandCard, collapseCard]);

  // Gesture event handlers
  const onGestureStart = useCallback((event: any) => {
    interactionStartTimeRef.current = Date.now();
    
    setCardState(prev => ({
      ...prev,
      state: 'dragging',
      isDragging: true,
      interactionStart: Date.now()
    }));
  }, []);

  const onGestureMove = useCallback((event: any) => {
    setCardState(prev => ({
      ...prev,
      dragOffset: event.distance,
      velocity: event.velocity,
      swipeDirection: event.direction,
      lastUpdate: Date.now()
    }));
  }, []);

  const onGestureEnd = useCallback((event: any) => {
    const shouldSwipe = Math.abs(event.distance.x) > config.swipeThreshold ||
                       Math.abs(event.velocity.x) > config.velocityThreshold;
    
    if (shouldSwipe) {
      if (event.direction === 'left') {
        swipeLeft();
      } else if (event.direction === 'right') {
        swipeRight();
      }
    } else {
      // Reset to idle
      setCardState(prev => ({
        ...prev,
        state: prev.isExpanded ? 'expanded' : 'idle',
        isDragging: false,
        swipeDirection: null,
        swipeProgress: 0,
        dragOffset: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 }
      }));
    }
  }, [config.swipeThreshold, config.velocityThreshold, swipeLeft, swipeRight]);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<JobSwipeConfig>) => {
    // Note: This would update the config, but since config is derived from props,
    // we'd need to lift this state up to the parent component
    console.warn('updateConfig not implemented - lift config state to parent');
  }, []);

  // Get analytics summary
  const getAnalyticsSummary = useCallback(() => {
    const total = analytics.length;
    const leftSwipes = analytics.filter(a => a.direction === 'left').length;
    const rightSwipes = analytics.filter(a => a.direction === 'right').length;
    const avgTimeSpent = analytics.reduce((sum, a) => sum + a.timeSpent, 0) / total || 0;
    const expansionRate = analytics.filter(a => a.expanded).length / total || 0;
    
    return {
      total,
      leftSwipes,
      rightSwipes,
      leftSwipeRate: leftSwipes / total || 0,
      rightSwipeRate: rightSwipes / total || 0,
      avgTimeSpent,
      expansionRate,
      deviceBreakdown: {
        mobile: analytics.filter(a => a.deviceType === 'mobile').length,
        tablet: analytics.filter(a => a.deviceType === 'tablet').length,
        desktop: analytics.filter(a => a.deviceType === 'desktop').length
      }
    };
  }, [analytics]);

  // Auto-refill queue when running low
  useEffect(() => {
    const remainingJobs = jobQueue.length - currentIndex;
    if (remainingJobs <= 2 && fetchJobs && !isLoading) {
      console.log('Auto-refilling queue, remaining jobs:', remainingJobs);
      preloadNext();
    }
  }, [currentIndex, jobQueue.length, fetchJobs, isLoading, preloadNext]);

  return {
    // Current state
    currentJob,
    hasNextJob,
    queueLength,
    
    // Interaction state
    cardState,
    
    // Actions
    swipeLeft,
    swipeRight,
    expandCard,
    collapseCard,
    toggleExpansion,
    
    // Queue management
    preloadNext,
    refillQueue,
    
    // Event handlers
    onGestureStart,
    onGestureMove,
    onGestureEnd,
    
    // Configuration
    config,
    updateConfig,
    
    // Analytics
    analytics,
    getAnalyticsSummary
  };
}