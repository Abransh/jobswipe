/**
 * JobSwipe Component System Exports
 * Minimalistic single-card swipe experience
 */

// Main components
export { JobSwipeContainer } from './JobSwipeContainer';
export { JobSwipeCard } from './JobSwipeCard';
export { JobSwipeDetails } from './JobSwipeDetails';
export { JobSwipeEmpty } from './JobSwipeEmpty';
export { JobSwipeLoading } from './JobSwipeLoading';

// Hooks
export { useJobSwipe } from '../hooks/useJobSwipe';
export { useGestures } from '../hooks/useGestures';

// Types
export type {
  JobSwipeContainerProps,
  JobSwipeCardProps,
  JobSwipeDetailsProps,
  SwipeDirection,
  CardState,
  ExpansionTrigger,
  DeviceType,
  JobQueueItem,
  JobSwipeConfig,
  SwipeAnalytics,
  CardInteractionState,
  UseJobSwipeReturn
} from '../types/jobSwipe';

export { DEFAULT_JOBSWIPE_CONFIG, CARD_DIMENSIONS } from '../types/jobSwipe';

// Default export
export { JobSwipeContainer as default } from './JobSwipeContainer';