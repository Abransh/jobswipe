/**
 * JobSwipe Component System Exports for Desktop
 * Desktop-optimized job swiping experience
 */

// Main components
export { JobSwipeContainer } from './JobSwipeContainer';
export { JobSwipeCard } from './JobSwipeCard';
export { JobSwipeEmpty } from './JobSwipeEmpty';
export { JobSwipeLoading } from './JobSwipeLoading';

// Hooks
export { useJobSwipe } from '../../hooks/useJobSwipe';

// Types
export type {
  JobSwipeContainerProps,
  JobSwipeCardProps,
  SwipeDirection,
  CardState,
  ExpansionTrigger,
  DeviceType,
  JobQueueItem,
  JobSwipeConfig,
  SwipeAnalytics,
  CardInteractionState,
  UseJobSwipeReturn
} from '../../types/jobSwipe';

export { DEFAULT_JOBSWIPE_CONFIG, CARD_DIMENSIONS } from '../../types/jobSwipe';

// Default export
export { JobSwipeContainer as default } from './JobSwipeContainer';