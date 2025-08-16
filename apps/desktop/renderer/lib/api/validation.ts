import { z } from 'zod';

export class ValidationError extends Error {
  constructor(message: string, public details: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate request body against a Zod schema
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Validation failed', {
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    throw error;
  }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateSearchParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): T {
  try {
    const params = Object.fromEntries(searchParams.entries());
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid query parameters', {
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    throw error;
  }
}

// Common validation schemas
export const schemas = {
  // Pagination
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),

  // User registration
  userRegistration: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required').optional(),
  }),

  // User login
  userLogin: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),

  // User profile update
  userProfileUpdate: z.object({
    name: z.string().min(1).optional(),
    avatar: z.string().url().optional(),
    profile: z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
      location: z.string().optional(),
      website: z.string().url().optional(),
      linkedin: z.string().url().optional(),
      github: z.string().url().optional(),
      bio: z.string().optional(),
      title: z.string().optional(),
      experience: z.string().optional(),
      skills: z.array(z.string()).optional(),
    }).optional(),
  }),

  // Job application creation
  jobApplicationCreate: z.object({
    jobPostingId: z.string().cuid('Invalid job posting ID'),
    resumeId: z.string().cuid('Invalid resume ID').optional(),
    coverLetter: z.string().optional(),
    notes: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  }),

  // Job application update
  jobApplicationUpdate: z.object({
    status: z.enum([
      'DRAFT', 'APPLIED', 'SCREENING', 'INTERVIEW', 'TECHNICAL',
      'FINAL_ROUND', 'OFFER', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'
    ]).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    coverLetter: z.string().optional(),
    notes: z.string().optional(),
    appliedAt: z.string().datetime().optional(),
    responseAt: z.string().datetime().optional(),
    interviewAt: z.string().datetime().optional(),
    followUpAt: z.string().datetime().optional(),
    atsUrl: z.string().url().optional(),
    externalId: z.string().optional(),
  }),

  // Resume creation
  resumeCreate: z.object({
    templateId: z.string().cuid().optional(),
    name: z.string().min(1, 'Resume name is required'),
    content: z.record(z.any()),
    isDefault: z.boolean().optional(),
  }),

  // Resume update
  resumeUpdate: z.object({
    name: z.string().min(1).optional(),
    content: z.record(z.any()).optional(),
    pdfUrl: z.string().url().optional(),
    docxUrl: z.string().url().optional(),
    isDefault: z.boolean().optional(),
  }),

  // Job posting search
  jobSearch: z.object({
    query: z.string().optional(),
    location: z.string().optional(),
    type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'TEMPORARY']).optional(),
    level: z.enum(['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'MANAGER', 'DIRECTOR', 'VP', 'C_LEVEL']).optional(),
    remote: z.coerce.boolean().optional(),
    salaryMin: z.coerce.number().optional(),
    salaryMax: z.coerce.number().optional(),
    company: z.string().optional(),
  }),

  // Application interaction
  applicationInteraction: z.object({
    type: z.enum([
      'EMAIL', 'PHONE_CALL', 'VIDEO_CALL', 'IN_PERSON', 'ONLINE_ASSESSMENT',
      'TECHNICAL_INTERVIEW', 'BEHAVIORAL_INTERVIEW', 'FOLLOW_UP', 'OFFER_DISCUSSION',
      'REJECTION', 'OTHER'
    ]),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    contactPerson: z.string().optional(),
    contactEmail: z.string().email().optional(),
    scheduledAt: z.string().datetime().optional(),
    completedAt: z.string().datetime().optional(),
    metadata: z.record(z.any()).optional(),
  }),

  // Subscription update
  subscriptionUpdate: z.object({
    plan: z.enum(['FREE', 'BASIC', 'PRO', 'ENTERPRISE']).optional(),
    cancelAtPeriodEnd: z.boolean().optional(),
  }),
};

/**
 * Validate required environment variables
 */
export function validateEnvVars() {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NEXTAUTH_SECRET',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}