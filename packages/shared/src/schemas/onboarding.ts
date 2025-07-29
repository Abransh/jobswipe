/**
 * JobSwipe Onboarding Validation Schemas
 * Comprehensive Zod schemas for multi-step onboarding process
 * Ensures data integrity and user experience consistency
 */

import { z } from 'zod';

// =============================================================================
// CONSTANTS & ENUMS
// =============================================================================

export const EXPERIENCE_LEVELS = [
  'entry',
  'junior', 
  'mid',
  'senior',
  'lead',
  'principal',
  'staff',
  'manager',
  'director',
  'c_level'
] as const;

export const JOB_TYPES = [
  'FULL_TIME',
  'PART_TIME', 
  'CONTRACT',
  'FREELANCE',
  'INTERNSHIP',
  'TEMPORARY'
] as const;

export const REMOTE_PREFERENCES = [
  'REMOTE_ONLY',
  'HYBRID',
  'ONSITE_ONLY', 
  'NO_PREFERENCE'
] as const;

export const INDUSTRIES = [
  'TECHNOLOGY',
  'ENGINEERING',
  'DESIGN',
  'PRODUCT',
  'MARKETING',
  'SALES',
  'FINANCE',
  'OPERATIONS',
  'HUMAN_RESOURCES',
  'LEGAL',
  'CUSTOMER_SUCCESS',
  'DATA_SCIENCE',
  'HEALTHCARE',
  'EDUCATION',
  'CONSULTING',
  'MANUFACTURING',
  'RETAIL',
  'HOSPITALITY',
  'MEDIA',
  'NON_PROFIT',
  'GOVERNMENT',
  'OTHER'
] as const;

export const COMPANY_TYPES = [
  'STARTUP',
  'SMALL',
  'MEDIUM',
  'LARGE',
  'ENTERPRISE'
] as const;

export const SALARY_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD'
] as const;

// =============================================================================
// STEP 1: PROFESSIONAL BACKGROUND
// =============================================================================

export const professionalBackgroundSchema = z.object({
  currentTitle: z.string()
    .min(2, 'Job title must be at least 2 characters')
    .max(100, 'Job title must be less than 100 characters')
    .optional(),
  
  currentCompany: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters')
    .optional(),
  
  experienceLevel: z.enum(EXPERIENCE_LEVELS)
    .optional(),
  
  yearsOfExperience: z.number()
    .min(0, 'Years of experience cannot be negative')
    .max(50, 'Years of experience seems too high')
    .optional(),
  
  skills: z.array(z.string().min(1).max(50))
    .max(20, 'Please select no more than 20 skills')
    .optional()
    .default([]),
  
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  
  headline: z.string()
    .max(120, 'Professional headline must be less than 120 characters')
    .optional(),
  
  // Professional links
  linkedin: z.string()
    .url('Invalid LinkedIn URL')
    .refine((url) => url.includes('linkedin.com'), 'Must be a LinkedIn URL')
    .optional()
    .or(z.literal('')),
  
  github: z.string()
    .url('Invalid GitHub URL')
    .refine((url) => url.includes('github.com'), 'Must be a GitHub URL')
    .optional()
    .or(z.literal('')),
  
  portfolio: z.string()
    .url('Invalid portfolio URL')
    .optional()
    .or(z.literal('')),
  
  website: z.string()
    .url('Invalid website URL')
    .optional()
    .or(z.literal(''))
});

export type ProfessionalBackgroundData = z.infer<typeof professionalBackgroundSchema>;

// =============================================================================
// STEP 2: JOB PREFERENCES  
// =============================================================================

export const jobPreferencesSchema = z.object({
  desiredJobTypes: z.array(z.enum(JOB_TYPES))
    .min(1, 'Please select at least one job type')
    .max(6, 'Please select no more than 6 job types'),
  
  industries: z.array(z.enum(INDUSTRIES))
    .min(1, 'Please select at least one industry')
    .max(10, 'Please select no more than 10 industries'),
  
  companyTypes: z.array(z.enum(COMPANY_TYPES))
    .min(1, 'Please select at least one company type')
    .max(5, 'Please select no more than 5 company types'),
  
  experienceLevels: z.array(z.enum(EXPERIENCE_LEVELS))
    .min(1, 'Please select at least one experience level')
    .max(5, 'Please select no more than 5 experience levels'),
  
  // Salary expectations
  desiredSalaryMin: z.number()
    .min(0, 'Minimum salary cannot be negative')
    .max(1000000, 'Minimum salary seems too high')
    .optional(),
  
  desiredSalaryMax: z.number()
    .min(0, 'Maximum salary cannot be negative')
    .max(2000000, 'Maximum salary seems too high')
    .optional(),
  
  preferredCurrency: z.enum(SALARY_CURRENCIES)
    .default('USD'),
  
  // Job search radius
  jobSearchRadius: z.number()
    .min(1, 'Search radius must be at least 1 mile/km')
    .max(500, 'Search radius seems too large')
    .default(50)
}).refine(
  (data) => !data.desiredSalaryMin || !data.desiredSalaryMax || data.desiredSalaryMin <= data.desiredSalaryMax,
  {
    message: 'Minimum salary cannot be higher than maximum salary',
    path: ['desiredSalaryMax']
  }
);

export type JobPreferencesData = z.infer<typeof jobPreferencesSchema>;

// =============================================================================
// STEP 3: WORK PREFERENCES
// =============================================================================

export const workPreferencesSchema = z.object({
  remotePref: z.enum(REMOTE_PREFERENCES)
    .default('NO_PREFERENCE'),
  
  willingToRelocate: z.boolean()
    .default(false),
  
  // Location preferences
  city: z.string()
    .min(2, 'City name must be at least 2 characters')
    .max(100, 'City name must be less than 100 characters')
    .optional(),
  
  state: z.string()
    .min(2, 'State name must be at least 2 characters')
    .max(100, 'State name must be less than 100 characters')
    .optional(),
  
  country: z.string()
    .min(2, 'Country name must be at least 2 characters')
    .max(100, 'Country name must be less than 100 characters')
    .optional(),
  
  // Automation preferences
  autoApplyEnabled: z.boolean()
    .default(false),
  
  autoApplyMaxPerDay: z.number()
    .min(1, 'Auto-apply limit must be at least 1')
    .max(50, 'Auto-apply limit cannot exceed 50 per day')
    .default(5),
  
  autoApplyRequireMatch: z.boolean()
    .default(true),
  
  autoApplyJobTypes: z.array(z.enum(JOB_TYPES))
    .optional()
    .default([])
});

export type WorkPreferencesData = z.infer<typeof workPreferencesSchema>;

// =============================================================================
// STEP 4: NOTIFICATION & PRIVACY SETTINGS
// =============================================================================

export const notificationPreferencesSchema = z.object({
  // Communication preferences
  emailNotifications: z.boolean()
    .default(true),
  
  pushNotifications: z.boolean()
    .default(true),
  
  smsNotifications: z.boolean()
    .default(false),
  
  // Specific notification types
  newJobMatches: z.boolean()
    .default(true),
  
  applicationUpdates: z.boolean()
    .default(true),
  
  interviewReminders: z.boolean()
    .default(true),
  
  weeklyDigest: z.boolean()
    .default(true),
  
  promotionalEmails: z.boolean()
    .default(false),
  
  // Privacy preferences
  dataProcessingConsent: z.boolean()
    .refine((val) => val === true, 'Data processing consent is required'),
  
  marketingConsent: z.boolean()
    .default(false),
  
  analyticsConsent: z.boolean()
    .default(true),
  
  thirdPartySharing: z.boolean()
    .default(false),
  
  // Profile visibility
  profileVisibility: z.enum(['PRIVATE', 'PUBLIC', 'RECRUITERS_ONLY'])
    .default('PRIVATE'),
  
  showEmail: z.boolean()
    .default(false),
  
  showPhone: z.boolean()
    .default(false)
});

export type NotificationPreferencesData = z.infer<typeof notificationPreferencesSchema>;

// =============================================================================
// STEP 5: RESUME & PROFILE COMPLETION
// =============================================================================

export const profileCompletionSchema = z.object({
  // Contact information
  phone: z.string()
    .regex(/^[+]?[1-9]?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  
  // Education background
  education: z.array(z.object({
    institution: z.string().min(1, 'Institution name is required'),
    degree: z.string().min(1, 'Degree is required'),
    field: z.string().optional(),
    startYear: z.number().min(1950).max(new Date().getFullYear()),
    endYear: z.number().min(1950).max(new Date().getFullYear() + 10).optional(),
    gpa: z.number().min(0).max(4.0).optional()
  }))
    .max(5, 'Please add no more than 5 education entries')
    .optional()
    .default([]),
  
  // Work experience
  workExperience: z.array(z.object({
    company: z.string().min(1, 'Company name is required'),
    title: z.string().min(1, 'Job title is required'), 
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
    isCurrent: z.boolean().default(false)
  }))
    .max(10, 'Please add no more than 10 work experiences')
    .optional()
    .default([]),
  
  // Certifications
  certifications: z.array(z.object({
    name: z.string().min(1, 'Certification name is required'),
    issuer: z.string().min(1, 'Issuer is required'),
    issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
    expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
    credentialId: z.string().optional(),
    credentialUrl: z.string().url('Invalid credential URL').optional()
  }))
    .max(10, 'Please add no more than 10 certifications')
    .optional()
    .default([]),
  
  // Languages
  languages: z.array(z.object({
    language: z.string().min(1, 'Language is required'),
    proficiency: z.enum(['NATIVE', 'FLUENT', 'ADVANCED', 'INTERMEDIATE', 'BEGINNER'])
  }))
    .max(10, 'Please add no more than 10 languages')
    .optional()
    .default([])
});

export type ProfileCompletionData = z.infer<typeof profileCompletionSchema>;

// =============================================================================
// COMBINED ONBOARDING SCHEMA
// =============================================================================

export const onboardingSchema = z.object({
  step1: professionalBackgroundSchema,
  step2: jobPreferencesSchema,
  step3: workPreferencesSchema,
  step4: notificationPreferencesSchema,
  step5: profileCompletionSchema
});

export type OnboardingData = z.infer<typeof onboardingSchema>;

// =============================================================================
// PROGRESS TRACKING SCHEMA
// =============================================================================

export const onboardingProgressSchema = z.object({
  currentStep: z.number()
    .min(1, 'Step must be at least 1')
    .max(5, 'Step cannot exceed 5'),
  
  completedSteps: z.array(z.number().min(1).max(5))
    .max(5),
  
  progress: z.number()
    .min(0, 'Progress cannot be negative')
    .max(100, 'Progress cannot exceed 100%'),
  
  isCompleted: z.boolean()
    .default(false),
  
  startedAt: z.date()
    .optional(),
  
  completedAt: z.date()
    .optional()
});

export type OnboardingProgressData = z.infer<typeof onboardingProgressSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

export const validateStep = (step: number, data: any) => {
  switch (step) {
    case 1:
      return professionalBackgroundSchema.safeParse(data);
    case 2:
      return jobPreferencesSchema.safeParse(data);
    case 3:
      return workPreferencesSchema.safeParse(data);
    case 4:
      return notificationPreferencesSchema.safeParse(data);
    case 5:
      return profileCompletionSchema.safeParse(data);
    default:
      return { success: false, error: { message: 'Invalid step number' } };
  }
};

export const calculateProgress = (completedSteps: number[]): number => {
  return Math.round((completedSteps.length / 5) * 100);
};

export const getNextStep = (currentStep: number): number => {
  return Math.min(currentStep + 1, 5);
};

export const getPreviousStep = (currentStep: number): number => {
  return Math.max(currentStep - 1, 1);
};

// =============================================================================
// EXPORT ALL SCHEMAS
// =============================================================================

// All schemas are already exported above, no need to re-export