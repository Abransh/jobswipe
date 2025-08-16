# JobCard Component System

## Overview

The JobCard component system is the core UI component for JobSwipe that implements psychological engagement patterns from dating apps combined with professional job searching. It creates an engaging, accessible, and performant experience that makes job searching feel as intuitive as social apps.

## Features

### 🎯 Psychological UX Patterns
- **Fitts' Law**: Optimal button sizing and positioning for mobile interactions
- **Miller's Law**: Information chunking with 7±2 rule for cognitive load management
- **Von Restorff Effect**: High-contrast badges for important information visibility
- **Hick's Law**: Simplified decision making with clear visual hierarchy
- **Variable Reward Schedule**: Micro-animations and engagement patterns
- **Endowment Effect**: Save/bookmark functionality for psychological ownership

### 🎨 Visual Design
- **Glassmorphism**: Modern glass-like effects with backdrop blur
- **Micro-animations**: Smooth 60fps animations with Framer Motion
- **Mobile-first**: Responsive design optimized for touch interactions
- **Dark mode**: Full dark mode support with proper contrast ratios
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support

### ⚡ Performance
- **Optimized rendering**: Memoized components and calculations
- **Lazy loading**: Progressive image loading with fallbacks
- **Gesture ready**: Optimized for swipe gesture integration
- **Memory efficient**: Proper cleanup and state management

## Component Architecture

```
JobCard (Main Container)
├── JobCardHeader (Company branding & verification)
├── JobCardContent (Job details & information)
├── JobCardBadges (Status badges with Von Restorff Effect)
├── JobCardActions (Quick action buttons)
└── JobCardSkeleton (Loading states)
```

## Usage

### Basic Usage

```tsx
import { JobCard } from '@/components/jobs/JobCard';
import type { JobData } from '@/components/jobs/types/job';

const jobData: JobData = {
  id: '123',
  title: 'Senior Frontend Engineer',
  company: {
    id: 'company-123',
    name: 'TechCorp',
    logo: 'https://example.com/logo.png',
    industry: 'Technology',
    size: 'MEDIUM',
    headquarters: 'San Francisco, CA',
    isVerified: true
  },
  description: 'Join our team building next-generation web applications...',
  location: 'San Francisco, CA',
  salaryMin: 120000,
  salaryMax: 180000,
  currency: 'USD',
  salaryType: 'ANNUAL',
  remote: true,
  remoteType: 'HYBRID',
  skills: ['React', 'TypeScript', 'Node.js'],
  postedAt: new Date(),
  isUrgent: false,
  isFeatured: true,
  isVerified: true
};

function JobList() {
  return (
    <JobCard
      job={jobData}
      matchScore={87}
      onSwipeLeft={(jobId) => console.log('Passed on:', jobId)}
      onSwipeRight={(jobId) => console.log('Applied to:', jobId)}
      onSave={(jobId) => console.log('Saved:', jobId)}
      onShare={(jobId) => console.log('Shared:', jobId)}
      onMoreInfo={(jobId) => console.log('More info:', jobId)}
    />
  );
}
```

### Loading States

```tsx
import { JobCardSkeleton, JobCardSkeletonCompact, JobCardSkeletonGrid } from '@/components/jobs/JobCard/JobCardSkeleton';

// Single card loading
<JobCardSkeleton />

// Multiple cards
<JobCardSkeleton count={3} />

// Compact list view
<JobCardSkeletonCompact />

// Grid layout
<JobCardSkeletonGrid columns={3} rows={2} />
```

## Component Props

### JobCard Props

```tsx
interface JobCardProps {
  job: JobData;                          // Job data object
  matchScore?: number;                   // AI match score (0-100)
  onSwipeLeft?: (jobId: string) => void; // Left swipe handler
  onSwipeRight?: (jobId: string) => void;// Right swipe handler  
  onSave?: (jobId: string) => void;      // Save/bookmark handler
  onShare?: (jobId: string) => void;     // Share handler
  onMoreInfo?: (jobId: string) => void;  // More info handler
  isLoading?: boolean;                   // Loading state
  className?: string;                    // Additional CSS classes
  style?: React.CSSProperties;          // Inline styles
}
```

### JobData Interface

```tsx
interface JobData {
  id: string;
  title: string;
  company: CompanyData;
  description: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  salaryType?: 'HOURLY' | 'ANNUAL';
  equity?: boolean;
  remote?: boolean;
  remoteType?: 'REMOTE' | 'HYBRID' | 'ONSITE';
  type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  level?: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
  skills?: string[];
  benefits?: string;
  postedAt?: Date | string;
  applicationCount?: number;
  viewCount?: number;
  isUrgent?: boolean;
  isFeatured?: boolean;
  isVerified?: boolean;
}
```

## Sub-Components

### JobCardHeader
Displays company branding, logo, and verification status.

**Features:**
- Company logo with fallback to initials
- Verification badge animation
- Company metadata (industry, size, location)
- Quality score indicator

### JobCardContent  
Main job information with optimized information hierarchy.

**Features:**
- Job title with proper truncation
- Salary display with formatting
- Location and remote work indicators
- Job description preview
- Skills tags with overflow handling
- Application statistics

### JobCardBadges
Status badges implementing Von Restorff Effect for visibility.

**Badge Types:**
- **New**: Posted within 24 hours (green)
- **Urgent**: High priority posting (amber)
- **Featured**: Sponsored listing (purple)
- **Verified**: Verified company (blue)
- **Remote**: Remote work available (indigo)
- **Match**: High match score (green)

### JobCardActions
Quick action buttons with hover/focus interactions.

**Actions:**
- **Save/Bookmark**: Toggle saved state
- **Share**: Share job posting
- **More Info**: View full details

### JobCardSkeleton
Loading state components maintaining visual structure.

**Variants:**
- **Default**: Full card skeleton
- **Compact**: List view skeleton
- **Grid**: Multi-card grid skeleton

## Accessibility

### Screen Reader Support
- Semantic HTML structure with proper ARIA labels
- Live regions for dynamic content updates
- Descriptive alt text for images
- Focus management for keyboard navigation

### Keyboard Navigation
- **Enter/Space**: Apply to job (swipe right equivalent)
- **Escape**: Skip job (swipe left equivalent)
- **Tab**: Navigate through action buttons
- Focus indicators for all interactive elements

### Color and Contrast
- WCAG 2.1 AA compliant color ratios
- High contrast mode support
- No color-only information conveyed
- Sufficient color contrast for all text

### Motion and Animation
- Respects `prefers-reduced-motion` setting
- Smooth 60fps animations with hardware acceleration
- Optional animation disable for accessibility needs

## Performance Optimizations

### Rendering
- React.memo for component memoization
- useMemo for expensive calculations
- useCallback for event handler stability
- Proper dependency arrays to prevent re-renders

### Images
- Lazy loading with intersection observer
- WebP format with fallbacks
- Responsive image sizing
- Error handling with fallback states

### Memory Management
- Proper cleanup of event listeners
- Efficient state updates
- Debounced interactions
- Garbage collection friendly patterns

## Styling

### CSS Architecture
- CSS Modules for scoped styling
- Tailwind CSS for utility classes  
- Custom properties for theming
- Mobile-first responsive design

### Design Tokens
- Consistent spacing scale
- Typography scale with proper line heights
- Color palette with semantic naming
- Border radius and shadow scales

### Theme Support
- Light/dark mode variables
- High contrast mode
- Custom brand color integration
- RTL language support ready

## Integration

### Swipe Gestures
The component is designed to integrate seamlessly with swipe gesture libraries:

```tsx
import { usePanGesture } from '@use-gesture/react';

function SwipeableJobCard({ job }) {
  const bind = usePanGesture({
    onDragEnd: ({ direction: [dx] }) => {
      if (dx > 0) handleSwipeRight();
      else handleSwipeLeft();
    }
  });

  return (
    <div {...bind()}>
      <JobCard job={job} />
    </div>
  );
}
```

### Analytics Integration
Built-in analytics tracking for user engagement:

```tsx
const { analytics } = useJobCard({ job, matchScore });

// Track engagement metrics
console.log({
  viewTime: analytics.viewTime,
  hoverDuration: analytics.hoverDuration,
  interactionCount: analytics.interactionCount,
  actionsTaken: analytics.actionsTaken
});
```

## Testing

### Unit Tests
- Component rendering with various props
- Event handler functionality
- Accessibility features
- Error boundary behavior

### Integration Tests  
- Swipe gesture integration
- Analytics tracking
- Performance benchmarks
- Cross-browser compatibility

### Visual Regression Tests
- Component visual consistency
- Animation frame accuracy
- Responsive design breakpoints
- Theme variations

## Browser Support

### Modern Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Support
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+
- Firefox Mobile 88+

### Fallbacks
- Graceful degradation for older browsers
- Progressive enhancement approach
- Polyfills for missing features
- Alternative interaction methods

## Contributing

### Development Setup
```bash
npm install
npm run dev
```

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Accessibility linting

### Testing Requirements
- Unit test coverage >90%
- Accessibility testing
- Performance benchmarking
- Cross-browser testing

---

## Examples

### Complete Implementation

```tsx
'use client';

import React, { useState } from 'react';
import { JobCard, JobCardSkeleton } from '@/components/jobs/JobCard';
import { useJobSwipe } from '@/hooks/useJobSwipe';
import type { JobData } from '@/components/jobs/types/job';

interface JobFeedProps {
  initialJobs: JobData[];
}

export function JobFeed({ initialJobs }: JobFeedProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [loading, setLoading] = useState(false);
  const { swipeJob, saveJob, shareJob } = useJobSwipe();

  const handleSwipeRight = async (jobId: string) => {
    setLoading(true);
    await swipeJob(jobId, 'right');
    setJobs(prev => prev.filter(job => job.id !== jobId));
    setLoading(false);
  };

  const handleSwipeLeft = async (jobId: string) => {
    setLoading(true);
    await swipeJob(jobId, 'left');
    setJobs(prev => prev.filter(job => job.id !== jobId));
    setLoading(false);
  };

  if (loading && jobs.length === 0) {
    return <JobCardSkeleton count={3} />;
  }

  return (
    <div className="space-y-6">
      {jobs.map((job, index) => (
        <JobCard
          key={job.id}
          job={job}
          matchScore={job.matchScore}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onSave={saveJob}
          onShare={shareJob}
          onMoreInfo={(jobId) => {
            // Navigate to job details
            window.open(`/jobs/${jobId}`, '_blank');
          }}
        />
      ))}
    </div>
  );
}
```

This component system creates the foundation for an engaging, accessible, and performant job browsing experience that combines the psychological engagement patterns of social apps with the professionalism required for career decisions.