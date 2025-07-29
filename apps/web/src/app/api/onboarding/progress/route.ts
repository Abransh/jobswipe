import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAccessTokenFromCookies } from '@/lib/api/auth';
import { parseJwtPayload } from '@jobswipe/shared/browser';
import { db } from '@jobswipe/database';
import { ApiResponse, createApiResponse } from '@/lib/api/response';
import { logger } from '@/lib/logger';
import {
  onboardingProgressSchema,
  validateStep,
  calculateProgress,
  type OnboardingProgressData
} from '@jobswipe/shared/schemas';

// Progress update schema
const progressUpdateSchema = z.object({
  currentStep: z.number().min(1).max(5),
  completedSteps: z.array(z.number().min(1).max(5)),
  progress: z.number().min(0).max(100),
  data: z.object({
    step1: z.any().optional(),
    step2: z.any().optional(),
    step3: z.any().optional(),
    step4: z.any().optional(),
    step5: z.any().optional()
  }).optional()
});

/**
 * GET /api/onboarding/progress
 * Retrieve user's onboarding progress
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<OnboardingProgressData>>> {
  try {
    const token = await getAccessTokenFromCookies();
    
    if (!token) {
      return createApiResponse(null, { 
        success: false, 
        error: 'Authentication required' 
      }, 401);
    }

    const payload = parseJwtPayload(token);
    if (!payload?.sub) {
      return createApiResponse(null, { 
        success: false, 
        error: 'Invalid token' 
      }, 401);
    }

    const userId = payload.sub;

    // Get user's current onboarding progress
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        onboardingCompleted: true,
        onboardingProgress: true,
        onboardingStep: true,
        onboardingStartedAt: true,
        onboardingCompletedAt: true
      }
    }) as {
      onboardingCompleted: boolean;
      onboardingProgress: number;
      onboardingStep: number;
      onboardingStartedAt: Date | null;
      onboardingCompletedAt: Date | null;
    } | null;

    if (!user) {
      return createApiResponse(null, {
        success: false,
        error: 'User not found'
      }, 404);
    }

    // Calculate completed steps based on progress
    const completedSteps: number[] = [];
    if (user.onboardingProgress >= 20) completedSteps.push(1);
    if (user.onboardingProgress >= 40) completedSteps.push(2);
    if (user.onboardingProgress >= 60) completedSteps.push(3);
    if (user.onboardingProgress >= 80) completedSteps.push(4);
    if (user.onboardingProgress >= 100) completedSteps.push(5);

    const progressData: OnboardingProgressData = {
      currentStep: user.onboardingStep,
      completedSteps,
      progress: user.onboardingProgress,
      isCompleted: user.onboardingCompleted,
      startedAt: user.onboardingStartedAt,
      completedAt: user.onboardingCompletedAt
    };

    logger.info('Retrieved onboarding progress', {
      userId: userId,
      progress: user.onboardingProgress,
      currentStep: user.onboardingStep
    });

    return createApiResponse(progressData, {
      success: true,
      message: 'Progress retrieved successfully'
    });

  } catch (error) {
    logger.error('Failed to get onboarding progress', { error });
    return createApiResponse(null, {
      success: false,
      error: 'Failed to retrieve progress'
    }, 500);
  }
}

/**
 * POST /api/onboarding/progress
 * Update user's onboarding progress
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<OnboardingProgressData>>> {
  try {
    const token = await getAccessTokenFromCookies();
    
    if (!token) {
      return createApiResponse(null, { 
        success: false, 
        error: 'Authentication required' 
      }, 401);
    }

    const payload = parseJwtPayload(token);
    if (!payload?.sub) {
      return createApiResponse(null, { 
        success: false, 
        error: 'Invalid token' 
      }, 401);
    }

    const userId = payload.sub;

    const body = await request.json();
    const validation = progressUpdateSchema.safeParse(body);

    if (!validation.success) {
      return createApiResponse(null, {
        success: false,
        error: 'Invalid progress data',
        details: validation.error.errors
      }, 400);
    }

    const { currentStep, completedSteps, progress, data } = validation.data;

    // Validate step data if provided
    if (data) {
      for (const [stepKey, stepData] of Object.entries(data)) {
        if (stepData) {
          const stepNumber = parseInt(stepKey.replace('step', ''));
          const stepValidation = validateStep(stepNumber, stepData);
          
          if (!stepValidation.success) {
            logger.warn('Invalid step data during progress save', {
              userId: userId,
              step: stepNumber,
              errors: stepValidation.error
            });
          }
        }
      }
    }

    // Update user progress in database
    const updatedUser = await (db.user.update as any)({
      where: { id: userId },
      data: {
        onboardingStep: currentStep,
        onboardingProgress: progress
      },
      select: {
        onboardingCompleted: true,
        onboardingProgress: true,
        onboardingStep: true,
        onboardingStartedAt: true,
        onboardingCompletedAt: true
      }
    }) as {
      onboardingCompleted: boolean;
      onboardingProgress: number;
      onboardingStep: number;
      onboardingStartedAt: Date | null;
      onboardingCompletedAt: Date | null;
    };

    // Set started date if this is the first save
    if (!updatedUser.onboardingStartedAt) {
      await (db.user.update as any)({
        where: { id: userId },
        data: {
          onboardingStartedAt: new Date()
        }
      });
    }

    const progressData: OnboardingProgressData = {
      currentStep,
      completedSteps,
      progress,
      isCompleted: updatedUser.onboardingCompleted,
      startedAt: updatedUser.onboardingStartedAt,
      completedAt: updatedUser.onboardingCompletedAt
    };

    logger.info('Updated onboarding progress', {
      userId: userId,
      currentStep,
      progress,
      completedSteps
    });

    return createApiResponse(progressData, {
      success: true,
      message: 'Progress saved successfully'
    });

  } catch (error) {
    logger.error('Failed to update onboarding progress', { error });
    return createApiResponse(null, {
      success: false,
      error: 'Failed to save progress'
    }, 500);
  }
}