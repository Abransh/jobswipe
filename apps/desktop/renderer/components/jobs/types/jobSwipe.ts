/**
 * JobSwipe Type Definitions
 * TypeScript interfaces for the minimalistic single-card JobSwipe experience
 */

import type { JobData } from './job';

// Core swipe directions
export type SwipeDirection = 'left' | 'right' | null;

// Card states
export type CardState = 'idle' | 'dragging' | 'expanding' | 'expanded' | 'collapsing' | 'swiping';

// Expansion trigger types
export type ExpansionTrigger = 'hover' | 'tap' | 'keyboard' | 'programmatic';

// Device types for responsive behavior
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// Animation variants
export type AnimationVariant = 'enter' | 'idle' | 'hover' | 'drag' | 'swipe' | 'expand' | 'exit';

/**
 * Job queue item with metadata
 */
export interface JobQueueItem {
  job: JobData;
  matchScore?: number;
  preloaded: boolean;
  priority: number;
  timestamp: Date;
}

/**
 * Job swipe configuration
 */
export interface JobSwipeConfig {
  // Preloading settings
  preloadCount: number;
  maxQueueSize: number;
  
  // Animation settings
  enableAnimations: boolean;
  reducedMotion: boolean;
  animationDuration: number;
  
  // Gesture settings
  swipeThreshold: number;
  velocityThreshold: number;
  expandThreshold: number;
  
  // Auto-expansion settings
  autoExpandOnHover: boolean;
  hoverDelay: number;
  
  // Analytics
  trackAnalytics: boolean;
  debugMode: boolean;
}

/**
 * Swipe analytics data
 */
export interface SwipeAnalytics {
  jobId: string;
  direction: SwipeDirection;
  velocity: number;
  timeSpent: number;
  expanded: boolean;
  timestamp: Date;
  deviceType: DeviceType;
}

/**
 * Card interaction state
 */
export interface CardInteractionState {
  // Current state
  state: CardState;
  isExpanded: boolean;
  isHovered: boolean;
  isDragging: boolean;
  
  // Gesture data
  swipeDirection: SwipeDirection;
  swipeProgress: number; // 0-1
  dragOffset: { x: number; y: number };
  velocity: { x: number; y: number };
  
  // Expansion data
  expansionTrigger: ExpansionTrigger | null;
  expansionProgress: number; // 0-1
  
  // Timing
  interactionStart: number;
  lastUpdate: number;
}

/**
 * Job card dimensions for responsive design
 */
export interface CardDimensions {
  width: number;
  height: {
    collapsed: number;
    expanded: number;
  };
  padding: number;
  borderRadius: number;
}

/**
 * Gesture event data
 */
export interface GestureEvent {
  type: 'start' | 'move' | 'end' | 'cancel';
  direction: SwipeDirection;
  distance: { x: number; y: number };
  velocity: { x: number; y: number };
  deltaTime: number;
  target: EventTarget | null;
}

/**
 * JobSwipe hook return type
 */
export interface UseJobSwipeReturn {
  // Current job state
  currentJob: JobQueueItem | null;
  hasNextJob: boolean;
  queueLength: number;
  
  // Interaction state
  cardState: CardInteractionState;
  
  // Actions
  swipeLeft: () => Promise<void>;
  swipeRight: () => Promise<void>;
  expandCard: (trigger?: ExpansionTrigger) => void;
  collapseCard: () => void;
  toggleExpansion: () => void;
  
  // Queue management
  preloadNext: () => Promise<void>;
  refillQueue: () => Promise<void>;
  
  // Event handlers
  onGestureStart: (event: GestureEvent) => void;
  onGestureMove: (event: GestureEvent) => void;
  onGestureEnd: (event: GestureEvent) => void;
  
  // Configuration
  config: JobSwipeConfig;
  updateConfig: (config: Partial<JobSwipeConfig>) => void;
  
  // Analytics
  analytics: SwipeAnalytics[];
  getAnalyticsSummary: () => any;
}

/**
 * JobSwipe container props
 */
export interface JobSwipeContainerProps {
  // Data source
  jobs?: JobData[];
  fetchJobs?: (offset: number, limit: number) => Promise<JobData[]>;
  
  // Event handlers
  onSwipeLeft?: (job: JobData, analytics: SwipeAnalytics) => void | Promise<void>;
  onSwipeRight?: (job: JobData, analytics: SwipeAnalytics) => void | Promise<void>;
  onJobSave?: (job: JobData) => void;
  onJobShare?: (job: JobData) => void;
  onJobExpand?: (job: JobData, trigger: ExpansionTrigger) => void;
  onEmptyQueue?: () => void;
  
  // Configuration
  config?: Partial<JobSwipeConfig>;
  className?: string;
  style?: React.CSSProperties;
  
  // Loading states
  isLoading?: boolean;
  error?: string | null;
}

/**
 * JobSwipe card props
 */
export interface JobSwipeCardProps {
  // Data
  job: JobData;
  matchScore?: number;
  
  // State
  state: CardInteractionState;
  isActive: boolean;
  zIndex: number;
  
  // Event handlers
  onGestureStart: (event: GestureEvent) => void;
  onGestureMove: (event: GestureEvent) => void;
  onGestureEnd: (event: GestureEvent) => void;
  onExpand: (trigger: ExpansionTrigger) => void;
  onCollapse: () => void;
  onSave?: () => void;
  onShare?: () => void;
  
  // Configuration
  config: JobSwipeConfig;
  dimensions: CardDimensions;
  deviceType: DeviceType;
  
  // Styling
  className?: string;
  style?: React.CSSProperties;
}

/**
 * JobSwipe details props
 */
export interface JobSwipeDetailsProps {
  // Data
  job: JobData;
  
  // State
  isExpanded: boolean;
  expansionProgress: number;
  trigger: ExpansionTrigger | null;
  
  // Event handlers
  onCollapse: () => void;
  onApply: () => void;
  onSave: () => void;
  onShare: () => void;
  
  // Configuration
  config: JobSwipeConfig;
  deviceType: DeviceType;
  
  // Styling
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Default configuration values
 */
export const DEFAULT_JOBSWIPE_CONFIG: JobSwipeConfig = {
  // Preloading
  preloadCount: 3,
  maxQueueSize: 10,
  
  // Animations
  enableAnimations: true,
  reducedMotion: false,
  animationDuration: 300,
  
  // Gestures
  swipeThreshold: 50,
  velocityThreshold: 0.3,
  expandThreshold: 20,
  
  // Auto-expansion
  autoExpandOnHover: true,
  hoverDelay: 500,
  
  // Analytics
  trackAnalytics: true,
  debugMode: false,
};

/**
 * Responsive breakpoints for card dimensions
 */
export const CARD_DIMENSIONS: Record<DeviceType, CardDimensions> = {
  mobile: {
    width: 320,
    height: { collapsed: 240, expanded: 480 },
    padding: 16,
    borderRadius: 16,
  },
  tablet: {
    width: 400,
    height: { collapsed: 280, expanded: 520 },
    padding: 20,
    borderRadius: 20,
  },
  desktop: {
    width: 480,
    height: { collapsed: 320, expanded: 600 },
    padding: 24,
    borderRadius: 24,
  },
};