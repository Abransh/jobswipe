import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/api/auth';
import { db } from '@jobswipe/database';

export async function GET(request: NextRequest) {
  try {
    const authenticatedUser = await authenticateRequest(request);

    // FIXED: Implement actual database queries to fetch real user statistics
    // Query applications from ApplicationQueue and JobApplication tables

    // Get all queue items for this user
    const queueItems = await db.applicationQueue.findMany({
      where: { userId: authenticatedUser.id },
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
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get all job applications for this user
    const applications = await db.jobApplication.findMany({
      where: { userId: authenticatedUser.id },
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
      },
      orderBy: { createdAt: 'desc' },
      take: 10 // Recent 10 applications
    });

    // Calculate status breakdown from queue
    const statusBreakdown = {
      pending: queueItems.filter(q => q.status === 'PENDING').length,
      queued: queueItems.filter(q => q.status === 'QUEUED').length,
      processing: queueItems.filter(q => q.status === 'PROCESSING').length,
      completed: queueItems.filter(q => q.status === 'COMPLETED').length,
      failed: queueItems.filter(q => q.status === 'FAILED').length,
      cancelled: queueItems.filter(q => q.status === 'CANCELLED').length
    };

    // Format recent applications
    const recentApplications = applications.map(app => ({
      id: app.id,
      jobTitle: app.jobPosting.title,
      companyName: app.jobPosting.company.name,
      companyLogo: app.jobPosting.company.logo,
      status: app.status,
      appliedAt: app.appliedAt,
      confirmationNumber: app.confirmationNumber,
      createdAt: app.createdAt
    }));

    const stats = {
      user: {
        totalApplications: queueItems.length,
        statusBreakdown,
        recentApplications
      },
      queue: {
        total: queueItems.length,
        pending: statusBreakdown.pending,
        processing: statusBreakdown.processing,
        completed: statusBreakdown.completed,
        failed: statusBreakdown.failed
      }
    };

    const response = {
      success: true,
      data: stats
    };

    // Use structured logging instead of console.log
    return NextResponse.json(response);

  } catch (error) {
    // Use structured error logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message, errorCode: 'AUTH_ERROR' },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics', errorCode: 'DATABASE_ERROR', details: errorMessage },
      { status: 500 }
    );
  }
}