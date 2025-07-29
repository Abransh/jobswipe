import { NextRequest, NextResponse } from 'next/server';
import { getAccessTokenFromCookies } from '@/lib/api/auth';
import { parseJwtPayload } from '@jobswipe/shared/browser';
import { db } from '@jobswipe/database';
import { ApiResponse, createApiResponse } from '@/lib/api/response';
import { logger } from '@/lib/logger';

interface OnboardingStatus {
  isCompleted: boolean;
  progress: number;
  currentStep: number;
  shouldShowOnboarding: boolean;
  canSkip: boolean;
  startedAt: Date | null;
  completedAt: Date | null;
}

/**
 * GET /api/onboarding/status
 * Get user's onboarding status and whether to show onboarding flow
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<OnboardingStatus>>> {
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

    // Get user's onboarding status
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        onboardingCompleted: true,
        onboardingProgress: true,
        onboardingStep: true,
        onboardingStartedAt: true,
        onboardingCompletedAt: true,
        createdAt: true
      }
    }) as {
      onboardingCompleted: boolean;
      onboardingProgress: number;
      onboardingStep: number;
      onboardingStartedAt: Date | null;
      onboardingCompletedAt: Date | null;
      createdAt: Date;
    } | null;

    if (!user) {
      return createApiResponse(null, {
        success: false,
        error: 'User not found'
      }, 404);
    }

    // Determine if we should show onboarding
    const isNewUser = !user.onboardingStartedAt;
    const hasPartialProgress = user.onboardingProgress > 0 && !user.onboardingCompleted;
    const shouldShowOnboarding = isNewUser || hasPartialProgress;

    const status: OnboardingStatus = {
      isCompleted: user.onboardingCompleted,
      progress: user.onboardingProgress,
      currentStep: user.onboardingStep,
      shouldShowOnboarding,
      canSkip: !user.onboardingCompleted, // Can skip if not completed
      startedAt: user.onboardingStartedAt,
      completedAt: user.onboardingCompletedAt
    };

    logger.info('Retrieved onboarding status', {
      userId: userId,
      isCompleted: user.onboardingCompleted,
      shouldShowOnboarding
    });

    return createApiResponse(status, {
      success: true,
      message: 'Onboarding status retrieved successfully'
    });

  } catch (error) {
    logger.error('Failed to get onboarding status', { 
      error: error instanceof Error ? error.message : error,
      userId: payload?.userId 
    });
    
    return createApiResponse(null, {
      success: false,
      error: 'Failed to retrieve onboarding status'
    }, 500);
  }
}