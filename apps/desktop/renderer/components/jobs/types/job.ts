/**
 * JobSwipe JobCard - TypeScript Interfaces
 * Comprehensive type definitions for the job card system
 */

import { JobType, JobLevel, JobCategory, RemoteType, CompanySize, SalaryType } from '@jobswipe/database';

// Core job data interface based on database schema
export interface JobData {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  
  // Job Classification
  type: JobType;
  level: JobLevel;
  department?: string;
  category: JobCategory;
  
  // Work Arrangement
  remote: boolean;
  remoteType: RemoteType;
  location?: string;
  timeZone?: string;
  
  // Location Details
  city?: string;
  state?: string;
  country?: string;
  
  // Compensation
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  salaryType?: SalaryType;
  equity?: string;
  bonus?: string;
  
  // Job Requirements
  experienceYears?: number;
  skills: string[];
  education?: string;
  languages: string[];
  
  // Company Context
  companyId: string;
  company: CompanyData;
  
  // External Integration
  sourceUrl?: string;
  applyUrl?: string;
  
  // Quality & Verification
  qualityScore?: number;
  isVerified: boolean;
  
  // Status & Lifecycle
  isActive: boolean;
  isFeatured: boolean;
  isUrgent: boolean;
  
  // Dates
  postedAt?: Date;
  expiresAt?: Date;
  
  // Analytics
  viewCount: number;
  applicationCount: number;
  rightSwipeCount: number;
  leftSwipeCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// Company data interface
export interface CompanyData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  logo?: string;
  industry?: string;
  size?: CompanySize;
  
  // Verification & Quality
  isVerified: boolean;
  qualityScore?: number;
  
  // Location
  headquarters?: string;
  country?: string;
  
  // Company Details
  foundedYear?: number;
  employeeCount?: number;
}

// JobCard specific interfaces
export interface JobCardProps {
  job: JobData;
  matchScore?: number;
  onSwipeLeft?: (jobId: string) => void;
  onSwipeRight?: (jobId: string) => void;
  onSave?: (jobId: string) => void;
  onShare?: (jobId: string) => void;
  onMoreInfo?: (jobId: string) => void;
  isLoading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Animation and interaction states
export interface JobCardState {
  isHovered: boolean;
  isPressed: boolean;
  swipeDirection: 'left' | 'right' | null;
  swipeProgress: number;
}

// Badge types for the job card
export interface JobBadge {
  type: 'new' | 'urgent' | 'featured' | 'verified' | 'remote' | 'match';
  label: string;
  color: 'green' | 'amber' | 'blue' | 'purple' | 'indigo';
  icon?: string;
  priority: number; // Higher priority badges show first
}

// Salary display formatting
export interface FormattedSalary {
  display: string;
  range?: string;
  currency: string;
  isRange: boolean;
  isCompetitive: boolean;
}

// Company logo states
export interface CompanyLogo {
  url?: string;
  fallback: string; // Company initials
  hasLogo: boolean;
}

// Job card analytics tracking
export interface JobCardAnalytics {
  viewTime: number;
  hoverDuration: number;
  interactionCount: number;
  swipeDirection?: 'left' | 'right';
  actionsTaken: string[];
}

// Responsive breakpoints for JobCard
export interface JobCardBreakpoints {
  mobile: '320px';
  tablet: '768px';
  desktop: '1024px';
  widescreen: '1400px';
}

// Color theme for JobCard
export interface JobCardTheme {
  background: {
    primary: string;
    secondary: string;
    gradient: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  accent: {
    success: string;
    warning: string;
    info: string;
    danger: string;
  };
  shadow: {
    idle: string;
    hover: string;
    pressed: string;
  };
}

// Loading skeleton configuration
export interface JobCardSkeletonProps {
  count?: number;
  className?: string;
  animated?: boolean;
}

// Hook return type for useJobCard
export interface UseJobCardReturn {
  state: JobCardState;
  handlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onMouseDown: () => void;
    onMouseUp: () => void;
    onTouchStart: () => void;
    onTouchEnd: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  analytics: JobCardAnalytics;
  badges: JobBadge[];
  formattedSalary: FormattedSalary;
  companyLogo: CompanyLogo;
}