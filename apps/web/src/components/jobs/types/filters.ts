/**
 * Job Filter Types
 * Defines the structure for job filtering and search parameters
 */

export type RemoteType = 'any' | 'remote_only' | 'hybrid' | 'onsite';
export type SortOption = 'relevance' | 'date' | 'salary' | 'distance' | 'company';

export interface JobFilters {
  // Search
  query?: string;
  
  // Location
  location: string;
  radius?: number; // in km
  coordinates?: {
    lat: number;
    lng: number;
  };
  
  // Remote work
  remote: RemoteType;
  
  // Job characteristics
  jobType: string[]; // FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP
  jobLevel: string[]; // ENTRY, MID, SENIOR, LEAD, EXECUTIVE
  
  // Salary
  salaryMin: number;
  salaryMax: number;
  currency?: string;
  
  // Skills and requirements
  skills: string[];
  experienceYears?: {
    min: number;
    max: number;
  };
  
  // Company
  companySize?: string[]; // STARTUP, SMALL, MEDIUM, LARGE, ENTERPRISE
  industry?: string[];
  
  // Posting metadata
  postedSince?: Date;
  isUrgent?: boolean;
  isFeatured?: boolean;
  hasEquity?: boolean;
  
  // Sorting
  sortBy?: SortOption;
  sortOrder?: 'asc' | 'desc';
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: JobFilters;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  icon?: string;
}

export interface FilterSection {
  key: keyof JobFilters;
  title: string;
  type: 'select' | 'multiselect' | 'range' | 'search' | 'toggle' | 'location';
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  description?: string;
}

export interface LocationSuggestion {
  id: string;
  name: string;
  type: 'city' | 'state' | 'country' | 'region';
  fullName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  jobCount?: number;
  isPopular?: boolean;
}

export interface FilterState {
  activeFilters: JobFilters;
  savedFilters: SavedFilter[];
  recentSearches: string[];
  locationSuggestions: LocationSuggestion[];
  isLoading: boolean;
  error?: string;
}

// Predefined filter options
export const JOB_TYPES: FilterOption[] = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'TEMPORARY', label: 'Temporary' },
  { value: 'FREELANCE', label: 'Freelance' }
];

export const JOB_LEVELS: FilterOption[] = [
  { value: 'ENTRY', label: 'Entry Level' },
  { value: 'MID', label: 'Mid Level' },
  { value: 'SENIOR', label: 'Senior Level' },
  { value: 'LEAD', label: 'Lead' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'DIRECTOR', label: 'Director' },
  { value: 'EXECUTIVE', label: 'Executive' }
];

export const COMPANY_SIZES: FilterOption[] = [
  { value: 'STARTUP', label: 'Startup (1-10)' },
  { value: 'SMALL', label: 'Small (11-50)' },
  { value: 'MEDIUM', label: 'Medium (51-200)' },
  { value: 'LARGE', label: 'Large (201-1000)' },
  { value: 'ENTERPRISE', label: 'Enterprise (1000+)' }
];

export const REMOTE_OPTIONS: FilterOption[] = [
  { value: 'any', label: 'Any' },
  { value: 'remote_only', label: 'Remote Only' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' }
];

export const SORT_OPTIONS: FilterOption[] = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'date', label: 'Newest First' },
  { value: 'salary', label: 'Highest Salary' },
  { value: 'distance', label: 'Closest to You' },
  { value: 'company', label: 'Company Name' }
];

// Popular tech skills for autocomplete
export const POPULAR_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
  'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'PostgreSQL', 'MongoDB',
  'Next.js', 'Vue.js', 'Angular', 'Express', 'Django', 'Spring',
  'Git', 'REST API', 'Microservices', 'CI/CD', 'Agile', 'Scrum'
];

// Popular industries
export const POPULAR_INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'E-commerce', 'Education',
  'Media', 'Gaming', 'Automotive', 'Real Estate', 'Consulting',
  'Manufacturing', 'Retail', 'Transportation', 'Energy', 'Government'
];