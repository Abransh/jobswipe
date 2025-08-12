import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/api/auth';
import { db as prisma } from '@jobswipe/database';
import { 
  simplifiedProgressSchema,
  type SimplifiedProgressData 
} from '@jobswipe/shared/schemas';

// GET - Retrieve onboarding progress
export async function GET(request: NextRequest) {
  try {
    const authenticatedUser = await authenticateRequest(request);
    
    // Find user 
    const user = await prisma.user.findUnique({
      where: { id: authenticatedUser.id }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return the progress data using User model fields
    return NextResponse.json({
      currentStep: user.onboardingStep || 1,
      completedSteps: user.onboardingStep > 1 ? [1] : [],
      progress: user.onboardingProgress || 0,
      isCompleted: user.onboardingCompleted || false,
      startedAt: user.onboardingStartedAt,
      completedAt: user.onboardingCompletedAt,
      data: {} // We'll store this in UserProfile for now
    });

  } catch (error) {
    console.error('Failed to get onboarding progress:', error);
    
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Save onboarding progress
export async function POST(request: NextRequest) {
  try {
    const authenticatedUser = await authenticateRequest(request);
    const body = await request.json();
    
    // Validate the request body
    const validationResult = simplifiedProgressSchema.safeParse({
      ...body,
      startedAt: body.startedAt ? new Date(body.startedAt) : undefined,
      completedAt: body.completedAt ? new Date(body.completedAt) : undefined
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid progress data',
          details: validationResult.error.flatten()
        },
        { status: 400 }
      );
    }

    const progressData = validationResult.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: authenticatedUser.id }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user onboarding progress
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardingStep: progressData.currentStep,
        onboardingProgress: progressData.progress,
        onboardingCompleted: progressData.isCompleted,
        onboardingStartedAt: progressData.startedAt || user.onboardingStartedAt || new Date(),
        onboardingCompletedAt: progressData.completedAt,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Progress saved successfully',
      progress: {
        currentStep: updatedUser.onboardingStep,
        completedSteps: updatedUser.onboardingStep > 1 ? [1] : [],
        progress: updatedUser.onboardingProgress,
        isCompleted: updatedUser.onboardingCompleted
      }
    });

  } catch (error) {
    console.error('Failed to save onboarding progress:', error);
    
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}