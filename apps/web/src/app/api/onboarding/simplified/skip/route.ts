import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/api/auth';
import { prisma } from '@jobswipe/database';

// POST - Skip simplified onboarding
export async function POST(request: NextRequest) {
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

    // Update user to mark onboarding as skipped
    await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardingSkipped: true,
        onboardingSkippedAt: new Date()
      }
    });

    // Create or update onboarding progress to track that it was skipped
    await prisma.onboardingProgress.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        currentStep: 1,
        completedSteps: [],
        progress: 0,
        isCompleted: false,
        isSkipped: true,
        startedAt: new Date(),
        data: { skipped: true, skippedAt: new Date().toISOString() }
      },
      update: {
        isSkipped: true,
        data: { 
          ...{}, // preserve existing data
          skipped: true, 
          skippedAt: new Date().toISOString() 
        }
      }
    });

    // TODO: In a real implementation, you might want to:
    // 1. Log analytics event for skipped onboarding
    // 2. Set up reminder emails to complete onboarding later
    // 3. Show limited functionality until onboarding is completed
    // 4. Track skip reasons for improvement

    return NextResponse.json({
      message: 'Onboarding skipped successfully. You can complete it later from your profile.',
      canCompleteInProfile: true
    });

  } catch (error) {
    console.error('Failed to skip onboarding:', error);
    
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to skip onboarding. Please try again.' },
      { status: 500 }
    );
  }
}