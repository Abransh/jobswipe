/**
 * JobCard Component System Exports
 * Central export point for all JobCard related components, hooks, and types
 */

// Main JobCard component
export { JobCard } from './JobCard';

// Sub-components
export { JobCardHeader } from './JobCardHeader';
export { JobCardContent } from './JobCardContent';
export { JobCardBadges } from './JobCardBadges';
export { JobCardActions } from './JobCardActions';

// Loading states
export { 
  JobCardSkeleton,
  JobCardSkeletonCompact,
  JobCardSkeletonGrid 
} from './JobCardSkeleton';

// Hooks
export { useJobCard } from '../hooks/useJobCard';

// Types
export type {
  JobData,
  CompanyData,
  JobCardProps,
  JobBadge,
  FormattedSalary,
  CompanyLogo,
  JobCardState,
  JobCardAnalytics,
  UseJobCardReturn
} from '../types/job';

// Default export
export { JobCard as default } from './JobCard';