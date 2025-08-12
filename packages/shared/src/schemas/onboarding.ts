/**
 * JobSwipe Simplified Onboarding Validation Schemas
 * Modern 2-step onboarding flow with essential fields only
 * Focus on user experience and conversion optimization
 */

import { z } from 'zod';

// =============================================================================
// SIMPLIFIED ONBOARDING SCHEMAS (2-STEP FLOW)
// =============================================================================

// Work Authorization Constants
export const WORK_AUTH_STATUS = [
  'CITIZEN',
  'PERMANENT_RESIDENT', 
  'WORK_PERMIT',
  'NEEDS_SPONSORSHIP',
  'UNKNOWN'
] as const;

export const TARGET_REGIONS = [
  'US',
  'EU',
  'UK', 
  'CANADA',
  'AUSTRALIA',
  'APAC'
] as const;

export const POPULAR_ROLES = [
  'Software Engineer',
  'Product Manager',
  'Data Scientist', 
  'UX/UI Designer',
  'Marketing Manager',
  'Sales Representative',
  'DevOps Engineer',
  'Business Analyst',
  'Project Manager',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Machine Learning Engineer',
  'Quality Assurance Engineer',
  'Customer Success Manager',
  'Operations Manager',
  'Financial Analyst',
  'Content Creator',
  'Technical Writer',
  'Other'
] as const;

// Step 1: Essential Profile Data
export const essentialProfileSchema = z.object({
  // Core Identity
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters'),
  
  phone: z.string()
    .min(10, 'Please enter a valid phone number')
    .max(20, 'Phone number seems too long')
    .regex(/^[\+]?[\d\s\-\(\)]+$/, 'Invalid phone number format'),
  
  // Role Information  
  roleType: z.string()
    .min(2, 'Please select or enter your role')
    .max(100, 'Role type must be less than 100 characters'),
  
  // Salary Expectations (Optional)
  salaryMin: z.number()
    .min(0, 'Minimum salary cannot be negative')
    .max(500000, 'Minimum salary seems too high')
    .optional(),
    
  salaryMax: z.number()
    .min(0, 'Maximum salary cannot be negative') 
    .max(1000000, 'Maximum salary seems too high')
    .optional(),
    
  salaryCurrency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD'])
    .default('USD'),
  
  // Resume Upload
  resumeFile: z.instanceof(File, { message: 'Please upload a resume' })
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Resume must be less than 5MB')
    .refine(
      (file) => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type),
      'Resume must be PDF, DOC, or DOCX format'
    )
    .optional()
}).refine(
  (data) => !data.salaryMin || !data.salaryMax || data.salaryMin <= data.salaryMax,
  {
    message: 'Minimum salary cannot be higher than maximum salary',
    path: ['salaryMax']
  }
);

export type EssentialProfileData = z.infer<typeof essentialProfileSchema>;

// Step 2: Smart Work Authorization 
export const workAuthorizationSchema = z.object({
  // Current Location
  currentCountry: z.string()
    .min(2, 'Please select your current country')
    .max(100, 'Country name too long'),
  
  currentLocation: z.string()
    .min(2, 'Please enter your current city/location')
    .max(200, 'Location name too long'),
  
  // Work Authorization for Current Country
  canWorkInCurrentCountry: z.boolean(),
  
  currentCountryWorkAuth: z.enum(WORK_AUTH_STATUS)
    .optional(),
  
  // International Interest
  interestedInInternational: z.boolean()
    .default(false),
  
  // Target Regions (only if international = true)
  targetRegions: z.array(z.enum(TARGET_REGIONS))
    .optional()
    .default([]),
  
  // Work Auth Status per Region
  workAuthByRegion: z.record(
    z.enum(TARGET_REGIONS), 
    z.enum(WORK_AUTH_STATUS)
  )
    .optional()
    .default({})
});

export type WorkAuthorizationData = z.infer<typeof workAuthorizationSchema>;

// Combined Simplified Onboarding
export const simplifiedOnboardingSchema = z.object({
  essentialProfile: essentialProfileSchema,
  workAuthorization: workAuthorizationSchema
});

export type SimplifiedOnboardingData = z.infer<typeof simplifiedOnboardingSchema>;

// Progress tracking for 2-step flow
export const simplifiedProgressSchema = z.object({
  currentStep: z.number()
    .min(1, 'Step must be at least 1')
    .max(2, 'Step cannot exceed 2'),
  
  completedSteps: z.array(z.number().min(1).max(2))
    .max(2),
  
  progress: z.number()
    .min(0, 'Progress cannot be negative')
    .max(100, 'Progress cannot exceed 100%'),
  
  isCompleted: z.boolean()
    .default(false),
  
  startedAt: z.date()
    .optional(),
  
  completedAt: z.date()
    .optional(),
    
  data: z.any()
    .optional()
});

export type SimplifiedProgressData = z.infer<typeof simplifiedProgressSchema>;

// Simplified validation helpers
export const validateSimplifiedStep = (step: number, data: any) => {
  switch (step) {
    case 1:
      return essentialProfileSchema.safeParse(data);
    case 2:
      return workAuthorizationSchema.safeParse(data);
    default:
      return { success: false, error: { message: 'Invalid step number' } };
  }
};

export const calculateSimplifiedProgress = (completedSteps: number[]): number => {
  return Math.round((completedSteps.length / 2) * 100);
};

// =============================================================================
// EXPORT ALL SCHEMAS  
// =============================================================================

// All simplified onboarding schemas are exported above