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
    // Type assertion needed due to Prisma client type inference with complex includes
    const appData = application as any;

    const response = {
      success: true,
      data: {
        id: appData.id,
        status: appData.status,
        priority: appData.priority,
        attempts: appData.attempts,
        maxAttempts: appData.maxAttempts,
        scheduledAt: appData.scheduledAt,
        startedAt: appData.startedAt,
        completedAt: appData.completedAt,
        failedAt: appData.failedAt,
        errorMessage: appData.errorMessage,
        errorType: appData.errorType,
        success: appData.success,
        requiresCaptcha: appData.requiresCaptcha,
        captchaSolved: appData.captchaSolved,
        claimedBy: appData.claimedBy,
        createdAt: appData.createdAt,
        updatedAt: appData.updatedAt,
        job: {
          id: appData.jobPosting.id,
          title: appData.jobPosting.title,
          description: appData.jobPosting.description,
          type: appData.jobPosting.type,
          level: appData.jobPosting.level,
          location: appData.jobPosting.location,
          remote: appData.jobPosting.remote,
          remoteType: appData.jobPosting.remoteType,
          salaryMin: appData.jobPosting.salaryMin,
          salaryMax: appData.jobPosting.salaryMax,
          currency: appData.jobPosting.currency,
          applyUrl: appData.jobPosting.applyUrl,
          company: appData.jobPosting.company
        },
        jobApplication: appData.application,
        automationLogs: appData.automationLogs,
        jobSnapshot: appData.jobSnapshot || null
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