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
