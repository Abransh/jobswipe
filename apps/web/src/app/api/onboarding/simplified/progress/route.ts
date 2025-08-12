import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/api/auth';
import { prisma } from '@jobswipe/database';
import { 
  simplifiedProgressSchema,
  type SimplifiedProgressData 
} from '@jobswipe/shared/schemas';

// GET - Retrieve onboarding progress
export async function GET(request: NextRequest) {
  try {
    const authenticatedUser = await authenticateRequest(request);
    
    // Find user and their onboarding progress
    const user = await prisma.user.findUnique({
      where: { id: authenticatedUser.id },
      include: {
        onboardingProgress: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If no progress exists, return default
    if (!user.onboardingProgress) {
      return NextResponse.json({
        currentStep: 1,
        completedSteps: [],
        progress: 0,
        isCompleted: false,
        data: {}
      });
    }

    // Return the progress data
    return NextResponse.json({
      currentStep: user.onboardingProgress.currentStep || 1,
      completedSteps: user.onboardingProgress.completedSteps || [],
      progress: user.onboardingProgress.progress || 0,
      isCompleted: user.onboardingProgress.isCompleted || false,
      startedAt: user.onboardingProgress.startedAt,
      completedAt: user.onboardingProgress.completedAt,
      data: user.onboardingProgress.data || {}
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
      where: { id: authenticatedUser.id },
      include: { onboardingProgress: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update or create onboarding progress
    const updatedProgress = await prisma.onboardingProgress.upsert({
      where: {
        userId: user.id
      },
      create: {
        userId: user.id,
        currentStep: progressData.currentStep,
        completedSteps: progressData.completedSteps,
        progress: progressData.progress,
        isCompleted: progressData.isCompleted,
        startedAt: progressData.startedAt || new Date(),
        completedAt: progressData.completedAt,
        data: body.data || {}
      },
      update: {
        currentStep: progressData.currentStep,
        completedSteps: progressData.completedSteps,
        progress: progressData.progress,
        isCompleted: progressData.isCompleted,
        completedAt: progressData.completedAt,
        data: body.data || {},
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Progress saved successfully',
      progress: updatedProgress
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