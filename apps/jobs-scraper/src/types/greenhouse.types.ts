/**
 * Greenhouse API Types
 *
 * Type definitions for Greenhouse job board API responses
 * and internal classification system.
 */

// ============================================================================
// GREENHOUSE API RESPONSE TYPES
// ============================================================================

export interface GreenhouseJobListing {
  id: number;
  title: string;
  absolute_url: string;
  location: {
    name: string;
  };
  updated_at: string;
  requisition_id?: string;
  internal_job_id: number;
  metadata?: Array<{
    id: number;
    name: string;
    value: string;
    value_type: string;
  }>;
  departments?: Array<{
    id: number;
    name: string;
  }>;
  offices?: Array<{
    id: number;
    name: string;
    location: string;
  }>;
}

export interface GreenhouseJobsResponse {
  jobs: GreenhouseJobListing[];
}

export interface GreenhouseJobDetails {
  id: number;
  title: string;
  content: string;
  location: {
    name: string;
  };
  absolute_url: string;
  internal_job_id: number;
  metadata?: Array<{
    id: number;
    name: string;
    value: string;
    value_type: string;
  }>;
  departments?: Array<{
    id: number;
    name: string;
  }>;
  offices?: Array<{
    id: number;
    name: string;
    location: string;
  }>;

  // THE CRITICAL PART - Application questions
  questions?: GreenhouseQuestion[];
}

export interface GreenhouseQuestion {
  required: boolean;
  label: string;
  description?: string | null;
  fields: GreenhouseField[];
}

export interface GreenhouseField {
  name: string;
  type: FieldType;
  values?: FieldValue[];
  allowed_filetypes?: string[];
}

export interface FieldValue {
  value: number | string;
  label: string;
}

export type FieldType =
  | 'input_text'
  | 'input_email'
  | 'input_tel'
  | 'input_file'
  | 'textarea'
  | 'multi_value_single_select'
  | 'multi_value_multi_select'
  | 'date'
  | 'boolean';

// ============================================================================
// INTERNAL CLASSIFICATION TYPES
// ============================================================================

export interface ClassifiedField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  description?: string;
  options?: FieldValue[];
  allowedFiletypes?: string[];

  // Our classification metadata
  answerStrategy: AnswerStrategy;
  profileMapping?: string;
  aiInstructions?: string;
  confidence: number;
}

export type AnswerStrategy =
  | 'PROFILE_DIRECT'      // Direct mapping: user.firstName → field
  | 'PROFILE_BOOLEAN'     // Boolean to Yes/No: user.needsVisa → "Yes"/"No"
  | 'PROFILE_CALCULATED'  // Calculate from profile: sum(workExperience) → years
  | 'FILE_UPLOAD'         // File upload: user.resumeUrl → upload
  | 'AI_GENERATE'         // AI generates: cover letter, "Why us?"
  | 'AI_ASSISTED'         // AI helps choose: complex selects
  | 'SKIP'                // Optional field, can skip
  | 'USER_INPUT';         // Requires manual user input

export interface ApplicationSchema {
  jobId: string;
  companyId: string;
  jobTitle: string;
  applicationUrl: string;
  fields: ClassifiedField[];
  metadata: {
    totalFields: number;
    requiredFields: number;
    optionalFields: number;
    hasFileUploads: boolean;
    hasCoverLetter: boolean;
    estimatedSuccessRate: number;
    automationFeasibility: 'high' | 'medium' | 'low';
  };
  scrapedAt: string;
  schemaVersion: string;
}

export interface AutomationMetrics {
  estimatedSuccessRate: number;
  automationFeasibility: 'high' | 'medium' | 'low';
  prefilledFieldCount: number;
  aiRequiredFieldCount: number;
  totalRequiredFields: number;
}

// ============================================================================
// JOB DESCRIPTION ENRICHMENT (LLM-EXTRACTED DATA)
// ============================================================================

/**
 * Structured data extracted from job descriptions using LLM (salary, benefits, visa)
 */
export interface EnrichedJobData {
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: 'yearly' | 'hourly' | 'monthly';
    equity?: string;
    bonus?: string;
  };

  visaSponsorship?: {
    available: boolean;
    details?: string;
    restrictions?: string[];
  };

  remote?: {
    type: 'remote' | 'hybrid' | 'onsite';
    flexibility?: string;
    restrictions?: string[];
  };

  benefits?: string[];

  requirements?: {
    education?: string[];
    experience?: {
      years?: number;
      level?: string;
    };
    skills?: {
      required?: string[];
      preferred?: string[];
    };
    languages?: string[];
  };

  metadata?: {
    extractedAt: string;
    confidence: number;
    model: string;
  };
}

// ============================================================================
// JOB INTELLIGENCE EXTRACTION (COMPREHENSIVE DATA)
// ============================================================================

/**
 * Comprehensive job intelligence extracted via AI from job description
 * This includes requirements, skills, experience, keywords, tags, etc.
 */
export interface JobIntelligenceData {
  // Requirements extraction
  requirements: {
    bulletPoints: string[];  // Formatted bullet points
    summary: string;         // One-sentence summary
  };

  // Experience and level
  experience: {
    yearsMin?: number;      // Minimum years required
    yearsMax?: number;      // Maximum years (if range given)
    level: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'PRINCIPAL';
  };

  // Skills extraction
  skills: {
    required: string[];     // Must-have skills
    preferred: string[];    // Nice-to-have skills
  };

  // Education requirements
  education: {
    required: 'NONE' | 'HIGH_SCHOOL' | 'BACHELORS' | 'MASTERS' | 'PHD';
    field?: string;         // e.g., "Computer Science"
    details?: string;       // Full requirement text
  };

  // Languages
  languages: string[];      // Spoken languages (default: ["English"])

  // Remote work policy
  remoteType: 'REMOTE' | 'HYBRID' | 'ONSITE';

  // Job categorization
  category: 'ENGINEERING' | 'DESIGN' | 'PRODUCT' | 'SALES' | 'MARKETING' |
            'OPERATIONS' | 'FINANCE' | 'HR' | 'LEGAL' | 'DATA_SCIENCE' |
            'CUSTOMER_SUCCESS' | 'OTHER';

  // Search and filtering
  keywords: string[];       // 10-15 searchable keywords
  tags: string[];          // 5-10 filtering tags

  // Confidence scores
  confidence: {
    overall: number;        // 0-100
    requirements: number;
    skills: number;
    experience: number;
  };

  // Metadata
  metadata: {
    extractedAt: string;
    model: string;
    processingTime?: number; // milliseconds
  };
}

/**
 * Direct data extracted from Greenhouse API (no AI needed)
 */
export interface DirectAPIData {
  department?: string;      // From API departments array
  location: string;         // Full location string
  city?: string;           // Parsed from location
  state?: string;          // Parsed from location
  country?: string;        // Parsed from location
  jobType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  remote: boolean;         // Parsed from location string
}

/**
 * Complete job data ready for database insertion
 */
export interface CompleteJobData {
  // Basic info
  title: string;
  description: string;

  // From direct API extraction
  department?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  remote: boolean;

  // From AI intelligence extraction
  requirements?: string;
  experienceYears?: number;
  level: import('@jobswipe/database').JobLevel;
  category: import('@jobswipe/database').JobCategory;
  remoteType: import('@jobswipe/database').RemoteType;
  skills: string[];
  education?: string;
  languages: string[];
  keywords: string[];
  tags: string[];

  // From enrichment (salary, benefits)
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  salaryType?: import('@jobswipe/database').SalaryType;
  equity?: string;
  bonus?: string;

  // Metadata
  qualityScore?: number;

  // JSON fields
  formMetadata?: any;
}

// ============================================================================
// SCRAPER CONFIGURATION
// ============================================================================

export interface ScraperConfig {
  companyId: string;
  rateLimit?: {
    requestsPerMinute: number;
    delayBetweenRequests: number;
  };
  retryConfig?: {
    maxRetries: number;
    retryDelay: number;
  };
  enableEnrichment?: boolean; // Enable LLM-based description parsing
}

export interface ScraperResult {
  success: boolean;
  companyId: string;
  jobsProcessed: number;
  jobsFailed: number;
  errors: Array<{
    jobId: number;
    error: string;
  }>;
  duration: number;
}
