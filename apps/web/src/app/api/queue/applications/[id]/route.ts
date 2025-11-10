import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/api/auth';
import { db } from '@jobswipe/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authenticatedUser = await authenticateRequest(request);
    const applicationId = params.id;

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // FIXED: Implement actual database query to fetch specific application
    // Query from ApplicationQueue table with full details
    const application = await db.applicationQueue.findFirst({
      where: {
        id: applicationId,
        userId: authenticatedUser.id // Security: only return user's own applications
      },
      include: {
        jobPosting: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
                website: true,
                industry: true,
                size: true
              }
            }
          }
        },
        application: {
          select: {
            id: true,
            status: true,
            appliedAt: true,
            confirmationNumber: true,
            automationStatus: true,
            automationData: true
          }
        },
        automationLogs: {
          orderBy: { createdAt: 'desc' },
          take: 50 // Last 50 logs
        }
      }
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found', errorCode: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Format the response
    const response = {
      success: true,
      data: {
        id: application.id,
        status: application.status,
        priority: application.priority,
        attempts: application.attempts,
        maxAttempts: application.maxAttempts,
        scheduledAt: application.scheduledAt,
        startedAt: application.startedAt,
        completedAt: application.completedAt,
        failedAt: application.failedAt,
        errorMessage: application.errorMessage,
        errorType: application.errorType,
        success: application.success,
        requiresCaptcha: application.requiresCaptcha,
        captchaSolved: application.captchaSolved,
        claimedBy: application.claimedBy,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        job: {
          id: application.jobPosting.id,
          title: application.jobPosting.title,
          description: application.jobPosting.description,
          type: application.jobPosting.type,
          level: application.jobPosting.level,
          location: application.jobPosting.location,
          remote: application.jobPosting.remote,
          remoteType: application.jobPosting.remoteType,
          salaryMin: application.jobPosting.salaryMin,
          salaryMax: application.jobPosting.salaryMax,
          currency: application.jobPosting.currency,
          applyUrl: application.jobPosting.applyUrl,
          company: application.jobPosting.company
        },
        jobApplication: application.application,
        automationLogs: application.automationLogs,
        jobSnapshot: application.jobSnapshot
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message, errorCode: 'AUTH_ERROR' },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch application', errorCode: 'DATABASE_ERROR', details: errorMessage },
      { status: 500 }
    );
  }
}