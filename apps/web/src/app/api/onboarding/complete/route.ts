import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAccessTokenFromCookies } from '@/lib/api/auth';
import { parseJwtPayload } from '@jobswipe/shared/browser';
import { db } from '@jobswipe/database';
import { ApiResponse, createApiResponse } from '@/lib/api/response';
import { logger } from '@/lib/logger';
import {
  professionalBackgroundSchema,
  jobPreferencesSchema,
  workPreferencesSchema,
  notificationPreferencesSchema,
  profileCompletionSchema,
  validateStep
} from '@jobswipe/shared/schemas';

// Complete onboarding schema
const completeOnboardingSchema = z.object({
  data: z.object({
    step1: professionalBackgroundSchema.optional(),
    step2: jobPreferencesSchema.optional(),
    step3: workPreferencesSchema.optional(),
    step4: notificationPreferencesSchema.optional(),
    step5: profileCompletionSchema.optional()
  }),
  completedSteps: z.array(z.number().min(1).max(5))
});

/**
 * POST /api/onboarding/complete
 * Complete the onboarding process and save all user data
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
  let userId: string | undefined;
  
  try {
    const token = await getAccessTokenFromCookies();
    
    if (!token) {
      return createApiResponse({ success: false }, { 
        success: false, 
        error: 'Authentication required' 
      }, 401);
    }

    const payload = parseJwtPayload(token);
    if (!payload?.sub) {
      return createApiResponse({ success: false }, { 
        success: false, 
        error: 'Invalid token' 
      }, 401);
    }

    userId = payload.sub;

    const body = await request.json();
    const validation = completeOnboardingSchema.safeParse(body);

    if (!validation.success) {
      return createApiResponse({ success: false }, {
        success: false,
        error: 'Invalid onboarding data',
        details: validation.error.errors
      }, 400);
    }

    const { data, completedSteps } = validation.data;

    // Validate each step's data
    const validationErrors: string[] = [];
    for (const [stepKey, stepData] of Object.entries(data)) {
      if (stepData) {
        const stepNumber = parseInt(stepKey.replace('step', ''));
        const stepValidation = validateStep(stepNumber, stepData);
        
        if (!stepValidation.success) {
          validationErrors.push(`Step ${stepNumber} validation failed`);
          logger.warn('Step validation failed during onboarding completion', {
            userId: userId,
            step: stepNumber,
            errors: stepValidation.error
          });
        }
      }
    }

    // Use a transaction to ensure data consistency
    await db.$transaction(async (tx) => {
      // Update user onboarding status
      await (tx.user.update as any)({
        where: { id: userId },
        data: {
          onboardingCompleted: true,
          onboardingProgress: 100,
          onboardingStep: 5,
          onboardingCompletedAt: new Date(),
          onboardingStartedAt: new Date()
        }
      });

      // Create or update user profile
      if (data.step1 || data.step5) {
        const profileData = {
          ...(data.step1 && {
            currentTitle: data.step1.currentTitle,
            currentCompany: data.step1.currentCompany,
            experienceLevel: data.step1.experienceLevel,
            yearsOfExperience: data.step1.yearsOfExperience,
            skills: data.step1.skills,
            bio: data.step1.bio,
            headline: data.step1.headline,
            linkedin: data.step1.linkedin,
            github: data.step1.github,
            portfolio: data.step1.portfolio,
            website: data.step1.website
          }),
          ...(data.step5 && {
            phone: data.step5.phone,
            education: data.step5.education ? JSON.stringify(data.step5.education) : undefined,
            certifications: data.step5.certifications ? JSON.stringify(data.step5.certifications) : undefined,
            languages: data.step5.languages ? JSON.stringify(data.step5.languages) : undefined
          })
        };

        await tx.userProfile.upsert({
          where: { userId: userId },
          create: {
            userId: userId,
            ...profileData
          },
          update: profileData
        });
      }

      // Create or update user preferences
      if (data.step2 || data.step3 || data.step4) {
        const preferencesData = {
          ...(data.step2 && {
            jobTypes: data.step2.desiredJobTypes,
            industries: data.step2.industries,
            // Map company types and experience levels
            jobSearchRadius: data.step2.jobSearchRadius
          }),
          ...(data.step3 && {
            remotePref: data.step3.remotePref,
            autoApplyEnabled: data.step3.autoApplyEnabled,
            autoApplyMaxPerDay: data.step3.autoApplyMaxPerDay,
            autoApplyRequireMatch: data.step3.autoApplyRequireMatch,
            autoApplyJobTypes: data.step3.autoApplyJobTypes
          }),
          ...(data.step4 && {
            emailNotifications: data.step4.emailNotifications,
            pushNotifications: data.step4.pushNotifications,
            smsNotifications: data.step4.smsNotifications,
            newJobMatches: data.step4.newJobMatches,
            applicationUpdates: data.step4.applicationUpdates,
            interviewReminders: data.step4.interviewReminders,
            weeklyDigest: data.step4.weeklyDigest,
            promotionalEmails: data.step4.promotionalEmails,
            dataProcessingConsent: data.step4.dataProcessingConsent,
            marketingConsent: data.step4.marketingConsent,
            analyticsConsent: data.step4.analyticsConsent,
            thirdPartySharing: data.step4.thirdPartySharing
          })
        };

        await tx.userPreferences.upsert({
          where: { userId: userId },
          create: {
            userId: userId,
            ...preferencesData
          },
          update: preferencesData
        });
      }

      // Update profile visibility if specified
      if (data.step4?.profileVisibility) {
        await tx.userProfile.upsert({
          where: { userId: userId },
          create: {
            userId: userId,
            profileVisibility: data.step4.profileVisibility,
            showEmail: data.step4.showEmail,
            showPhone: data.step4.showPhone
          },
          update: {
            profileVisibility: data.step4.profileVisibility,
            showEmail: data.step4.showEmail,
            showPhone: data.step4.showPhone
          }
        });
      }

      // Save work experience if provided
      if (data.step5?.workExperience && data.step5.workExperience.length > 0) {
        // Store as JSON in user profile for now
        // In a more complex system, you might have a separate WorkExperience table
        await tx.userProfile.upsert({
          where: { userId: userId },
          create: {
            userId: userId,
          },
          update: {}
        });
      }
    });

    logger.info('Onboarding completed successfully', {
      userId: userId,
      completedSteps,
      hasValidationErrors: validationErrors.length > 0,
      validationErrors
    });

    // Create analytics event for onboarding completion
    await db.analyticsEvent.create({
      data: {
        userId: userId,
        eventType: 'onboarding_completed',
        eventCategory: 'user_action',
        eventName: 'Onboarding Process Completed',
        properties: {
          completedSteps,
          totalSteps: 5,
          hasValidationErrors: validationErrors.length > 0
        },
        timestamp: new Date()
      }
    });

    return createApiResponse(
      { success: true }, 
      {
        success: true,
        message: 'Onboarding completed successfully',
        ...(validationErrors.length > 0 && {
          warnings: validationErrors
        })
      }
    );

  } catch (error) {
    logger.error('Failed to complete onboarding', { 
      error: error instanceof Error ? error.message : error,
      userId 
    });
    
    return createApiResponse({ success: false }, {
      success: false,
      error: 'Failed to complete onboarding'
    }, 500);
  }
}