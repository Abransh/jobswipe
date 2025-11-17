import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/api/auth';
import { db } from '@jobswipe/database';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authenticatedUser = await authenticateRequest(request);
    const applicationId = params.id;
    const body = await request.json();
    
    const { action, reason } = body;

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      );
    }

    if (!action || !['cancel', 'retry', 'prioritize'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Valid action is required (cancel, retry, prioritize)' },
        { status: 400 }
      );
    }

    // FIXED: Implement actual application action logic
    // First, verify the application exists and belongs to the user
    const application = await db.applicationQueue.findFirst({
      where: {
        id: applicationId,
        userId: authenticatedUser.id // Security: only allow actions on user's own applications
      }
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found', errorCode: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Perform the requested action
    let updatedApplication;

    switch (action) {
      case 'cancel':
        // Cancel the application - set status to CANCELLED
        updatedApplication = await db.applicationQueue.update({
          where: { id: applicationId },
          data: {
            status: 'CANCELLED',
            completedAt: new Date(),
            errorMessage: reason || 'Cancelled by user',
            updatedAt: new Date()
          },
          include: {
            jobPosting: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    name: true,
                    logo: true
                  }
                }
              }
            }
          }
        });
        break;

      case 'retry':
        // Retry the application - reset attempts and reschedule
        updatedApplication = await db.applicationQueue.update({
          where: { id: applicationId },
          data: {
            status: 'PENDING',
            attempts: 0,
            scheduledAt: new Date(), // Schedule for immediate retry
            startedAt: null,
            completedAt: null,
            failedAt: null,
            errorMessage: null,
            errorType: null,
            success: null,
            updatedAt: new Date()
          },
          include: {
            jobPosting: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    name: true,
                    logo: true
                  }
                }
              }
            }
          }
        });
        break;

      case 'prioritize':
        // Prioritize the application - increase priority
        updatedApplication = await db.applicationQueue.update({
          where: { id: applicationId },
          data: {
            priority: 'IMMEDIATE', // Set highest priority
            scheduledAt: new Date(), // Move to front of queue
            updatedAt: new Date()
          },
          include: {
            jobPosting: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    name: true,
                    logo: true
                  }
                }
              }
            }
          }
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action', errorCode: 'INVALID_ACTION' },
          { status: 400 }
        );
    }

    // Return the updated application
    return NextResponse.json({
      success: true,
      data: {
        action,
        application: {
          id: updatedApplication.id,
          status: updatedApplication.status,
          priority: updatedApplication.priority,
          attempts: updatedApplication.attempts,
          scheduledAt: updatedApplication.scheduledAt,
          completedAt: updatedApplication.completedAt,
          errorMessage: updatedApplication.errorMessage,
          job: {
            id: updatedApplication.jobPosting.id,
            title: updatedApplication.jobPosting.title,
            company: updatedApplication.jobPosting.company
          }
        }
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message, errorCode: 'AUTH_ERROR' },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to perform action', errorCode: 'DATABASE_ERROR', details: errorMessage },
      { status: 500 }
    );
  }
}