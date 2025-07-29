import { NextRequest, NextResponse } from 'next/server';
import { getAccessTokenFromCookies } from '@/lib/api/auth';
import { parseJwtPayload } from '@jobswipe/shared/browser';
import { db } from '@jobswipe/database';
import { ApiResponse, createApiResponse } from '@/lib/api/response';
import { logger } from '@/lib/logger';

/**
 * POST /api/onboarding/skip
 * Skip the onboarding process for now (user can complete later)
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

    // Update user to mark onboarding as skipped (not completed but acknowledged)
    await (db.user.update as any)({
      where: { id: userId },
      data: {
        onboardingCompleted: false,
        onboardingProgress: 0,
        onboardingStep: 1,
        // Don't set onboardingCompletedAt since it wasn't completed
        onboardingStartedAt: new Date() // Mark that they at least saw the onboarding
      }
    });

    // Create analytics event for onboarding skip
    await db.analyticsEvent.create({
      data: {
        userId: userId,
        eventType: 'onboarding_skipped',
        eventCategory: 'user_action',
        eventName: 'Onboarding Process Skipped',
        properties: {
          skippedAt: new Date().toISOString(),
          userCanCompleteEater: true
        },
        timestamp: new Date()
      }
    });

    logger.info('User skipped onboarding', {
      userId: userId,
      timestamp: new Date().toISOString()
    });

    return createApiResponse(
      { success: true }, 
      {
        success: true,
        message: 'Onboarding skipped. You can complete it anytime from your profile settings.'
      }
    );

  } catch (error) {
    logger.error('Failed to skip onboarding', { 
      error: error instanceof Error ? error.message : error,
      userId 
    });
    
    return createApiResponse({ success: false }, {
      success: false,
      error: 'Failed to skip onboarding'
    }, 500);
  }
}