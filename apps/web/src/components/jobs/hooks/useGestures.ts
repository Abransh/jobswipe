'use client';

/**
 * useGestures Hook
 * Advanced gesture handling for JobSwipe with smooth animations and haptic feedback
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { 
  GestureEvent, 
  SwipeDirection, 
  CardInteractionState,
  JobSwipeConfig 
} from '../types/jobSwipe';

interface UseGesturesProps {
  config: JobSwipeConfig;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onExpand: () => void;
  onCollapse: () => void;
  disabled?: boolean;
}

interface UseGesturesReturn {
  // State
  gestureState: CardInteractionState;
  
  // Event handlers
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
  
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  
  onKeyDown: (e: React.KeyboardEvent) => void;
  
  // Gesture helpers
  resetGesture: () => void;
  updateGestureProgress: (progress: number) => void;
}

export function useGestures({
  config,
  onSwipeLeft,
  onSwipeRight,
  onExpand,
  onCollapse,
  disabled = false
}: UseGesturesProps): UseGesturesReturn {
  
  // Gesture state
  const [gestureState, setGestureState] = useState<CardInteractionState>({
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

  // Refs for tracking gesture data
  const gestureStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Helper to trigger haptic feedback
  const triggerHapticFeedback = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[intensity]);
    }
  }, []);

  // Calculate velocity from position changes
  const calculateVelocity = useCallback((
    currentPos: { x: number; y: number },
    currentTime: number
  ) => {
    if (!lastPositionRef.current) {
      return { x: 0, y: 0 };
    }

    const deltaTime = currentTime - lastPositionRef.current.time;
    if (deltaTime === 0) return { x: 0, y: 0 };

    const deltaX = currentPos.x - lastPositionRef.current.x;
    const deltaY = currentPos.y - lastPositionRef.current.y;

    return {
      x: deltaX / deltaTime,
      y: deltaY / deltaTime
    };
  }, []);

  // Determine swipe direction and progress
  const analyzeSwipe = useCallback((offset: { x: number; y: number }, velocity: { x: number; y: number }) => {
    const absX = Math.abs(offset.x);
    const absY = Math.abs(offset.y);
    
    // Horizontal swipe detection
    if (absX > config.swipeThreshold && absX > absY) {
      const direction: SwipeDirection = offset.x > 0 ? 'right' : 'left';
      const progress = Math.min(absX / (config.swipeThreshold * 3), 1);
      return { direction, progress };
    }

    // Vertical swipe for expansion (mobile)
    if (absY > config.expandThreshold && absY > absX && offset.y < 0) {
      return { direction: null, progress: 0, shouldExpand: true };
    }

    return { direction: null, progress: 0 };
  }, [config.swipeThreshold, config.expandThreshold]);

  // Reset gesture state
  const resetGesture = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    gestureStartRef.current = null;
    lastPositionRef.current = null;

    setGestureState(prev => ({
      ...prev,
      state: prev.isExpanded ? 'expanded' : 'idle',
      isDragging: false,
      swipeDirection: null,
      swipeProgress: 0,
      dragOffset: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 }
    }));
  }, []);

  // Update gesture progress smoothly
  const updateGestureProgress = useCallback((progress: number) => {
    setGestureState(prev => ({
      ...prev,
      expansionProgress: Math.max(0, Math.min(1, progress)),
      lastUpdate: Date.now()
    }));
  }, []);

  // Mouse event handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const startPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      time: Date.now()
    };

    gestureStartRef.current = startPos;
    lastPositionRef.current = startPos;

    setGestureState(prev => ({
      ...prev,
      state: 'dragging',
      isDragging: true,
      interactionStart: Date.now()
    }));

    // Prevent text selection during drag
    e.preventDefault();
  }, [disabled]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (disabled || !gestureStartRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const currentPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      time: Date.now()
    };

    const offset = {
      x: currentPos.x - gestureStartRef.current.x,
      y: currentPos.y - gestureStartRef.current.y
    };

    const velocity = calculateVelocity(currentPos, currentPos.time);
    const { direction, progress, shouldExpand } = analyzeSwipe(offset, velocity);

    // Update state
    setGestureState(prev => ({
      ...prev,
      dragOffset: offset,
      velocity,
      swipeDirection: direction,
      swipeProgress: progress,
      lastUpdate: Date.now()
    }));

    // Trigger haptic feedback at swipe threshold
    if (progress > 0.3 && progress < 0.35) {
      triggerHapticFeedback('light');
    } else if (progress > 0.7 && progress < 0.75) {
      triggerHapticFeedback('medium');
    }

    // Handle expansion trigger
    if (shouldExpand && !gestureState.isExpanded) {
      onExpand();
    }

    lastPositionRef.current = currentPos;
  }, [disabled, calculateVelocity, analyzeSwipe, triggerHapticFeedback, gestureState.isExpanded, onExpand]);

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    if (disabled || !gestureStartRef.current) return;

    const { swipeDirection, swipeProgress, velocity } = gestureState;

    // Determine if swipe should trigger action
    const shouldSwipe = swipeProgress > 0.3 || 
                       Math.abs(velocity.x) > config.velocityThreshold;

    if (shouldSwipe && swipeDirection) {
      triggerHapticFeedback('heavy');
      
      if (swipeDirection === 'left') {
        onSwipeLeft();
      } else if (swipeDirection === 'right') {
        onSwipeRight();
      }
    } else {
      // Reset to idle position
      resetGesture();
    }
  }, [disabled, gestureState, config.velocityThreshold, triggerHapticFeedback, onSwipeLeft, onSwipeRight, resetGesture]);

  // Hover handlers for desktop expansion
  const onMouseEnter = useCallback((e: React.MouseEvent) => {
    if (disabled || !config.autoExpandOnHover) return;

    setGestureState(prev => ({
      ...prev,
      isHovered: true
    }));

    // Clear any existing hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Set timeout for hover expansion
    hoverTimeoutRef.current = setTimeout(() => {
      if (!gestureState.isExpanded && !gestureState.isDragging) {
        setGestureState(prev => ({
          ...prev,
          expansionTrigger: 'hover'
        }));
        onExpand();
      }
    }, config.hoverDelay);
  }, [disabled, config.autoExpandOnHover, config.hoverDelay, gestureState.isExpanded, gestureState.isDragging, onExpand]);

  const onMouseLeave = useCallback((e: React.MouseEvent) => {
    if (disabled) return;

    setGestureState(prev => ({
      ...prev,
      isHovered: false
    }));

    // Clear hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    // Collapse on mouse leave if expanded by hover
    if (gestureState.isExpanded && gestureState.expansionTrigger === 'hover') {
      onCollapse();
    }
  }, [disabled, gestureState.isExpanded, gestureState.expansionTrigger, onCollapse]);

  // Touch event handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const startPos = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      time: Date.now()
    };

    gestureStartRef.current = startPos;
    lastPositionRef.current = startPos;

    setGestureState(prev => ({
      ...prev,
      state: 'dragging',
      isDragging: true,
      interactionStart: Date.now()
    }));

    triggerHapticFeedback('light');
  }, [disabled, triggerHapticFeedback]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || !gestureStartRef.current || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const currentPos = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      time: Date.now()
    };

    const offset = {
      x: currentPos.x - gestureStartRef.current.x,
      y: currentPos.y - gestureStartRef.current.y
    };

    const velocity = calculateVelocity(currentPos, currentPos.time);
    const { direction, progress, shouldExpand } = analyzeSwipe(offset, velocity);

    setGestureState(prev => ({
      ...prev,
      dragOffset: offset,
      velocity,
      swipeDirection: direction,
      swipeProgress: progress,
      lastUpdate: Date.now()
    }));

    // Haptic feedback
    if (progress > 0.5 && progress < 0.55) {
      triggerHapticFeedback('medium');
    }

    // Handle expansion
    if (shouldExpand && !gestureState.isExpanded) {
      onExpand();
    }

    lastPositionRef.current = currentPos;
  }, [disabled, calculateVelocity, analyzeSwipe, triggerHapticFeedback, gestureState.isExpanded, onExpand]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (disabled || !gestureStartRef.current) return;

    const { swipeDirection, swipeProgress, velocity } = gestureState;

    const shouldSwipe = swipeProgress > 0.3 || 
                       Math.abs(velocity.x) > config.velocityThreshold;

    if (shouldSwipe && swipeDirection) {
      triggerHapticFeedback('heavy');
      
      if (swipeDirection === 'left') {
        onSwipeLeft();
      } else if (swipeDirection === 'right') {
        onSwipeRight();
      }
    } else {
      resetGesture();
    }
  }, [disabled, gestureState, config.velocityThreshold, triggerHapticFeedback, onSwipeLeft, onSwipeRight, resetGesture]);

  // Keyboard event handler
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowLeft':
      case 'Escape':
        e.preventDefault();
        triggerHapticFeedback('medium');
        onSwipeLeft();
        break;
        
      case 'ArrowRight':
      case 'Enter':
      case ' ':
        e.preventDefault();
        triggerHapticFeedback('medium');
        onSwipeRight();
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (!gestureState.isExpanded) {
          onExpand();
        }
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        if (gestureState.isExpanded) {
          onCollapse();
        }
        break;
    }
  }, [disabled, gestureState.isExpanded, triggerHapticFeedback, onSwipeLeft, onSwipeRight, onExpand, onCollapse]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
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
    resetGesture,
    updateGestureProgress
  };
}