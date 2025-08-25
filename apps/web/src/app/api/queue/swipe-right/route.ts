import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/api/auth';
import { PrismaClient, ApplicationStatus, QueueStatus, SwipeDirection, ApplicationPriority, QueuePriority } from '@jobswipe/database';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const authenticatedUser = await authenticateRequest(request);
    const body = await request.json();
    
    // Validate the swipe-right request
    const { jobId, resumeId, coverLetter, priority, customFields, metadata } = body;
    
    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    if (!metadata?.source) {
      return NextResponse.json(
        { success: false, error: 'Metadata source is required' },
        { status: 400 }
      );
    }

    // Check if job exists
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: { company: true }
    });

    if (!jobPosting) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if user already has an application for this job
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        userId: authenticatedUser.id,
        jobPostingId: jobId
      }
    });

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: 'Application already exists for this job' },
        { status: 409 }
      );
    }

    // Record the swipe action
    await prisma.userJobSwipe.create({
      data: {
        userId: authenticatedUser.id,
        jobPostingId: jobId,
        direction: SwipeDirection.RIGHT,
        deviceType: metadata.source?.toUpperCase() || 'WEB',
        userAgent: metadata.userAgent,
        metadata: {
          priority,
          customFields,
          source: metadata.source
        }
      }
    });

    // Get user's default resume if no resumeId provided
    let finalResumeId = resumeId;
    if (!finalResumeId) {
      const defaultResume = await prisma.resume.findFirst({
        where: {
          userId: authenticatedUser.id,
          isDefault: true
        }
      });
      finalResumeId = defaultResume?.id;
    }

    // Create job application record
    const application = await prisma.jobApplication.create({
      data: {
        userId: authenticatedUser.id,
        jobPostingId: jobId,
        resumeId: finalResumeId,
        status: ApplicationStatus.QUEUED,
        priority: mapPriority(priority),
        coverLetter,
        customFields: customFields ? JSON.stringify(customFields) : undefined,
        notes: `Applied via ${metadata.source} - Device: ${metadata.deviceId}`
      },
      include: {
        jobPosting: {
          include: {
            company: true
          }
        }
      }
    });

    // Add to application queue
    const queueItem = await prisma.applicationQueue.create({
      data: {
        userId: authenticatedUser.id,
        jobPostingId: jobId,
        applicationId: application.id,
        status: QueueStatus.PENDING,
        priority: mapQueuePriority(priority),
        scheduledAt: new Date()
      }
    });

    // Create snapshot for tracking (simplified for now)
    const snapshotId = `snap_${application.id}_${Date.now()}`;
    // TODO: Implement proper snapshot creation when ApplicationSnapshot model is available

    console.log('✅ [Queue API] Swipe right successful:', {
      userId: authenticatedUser.id,
      jobId,
      applicationId: application.id,
      queueItemId: queueItem.id,
      snapshotId: snapshotId,
      jobTitle: jobPosting.title,
      company: jobPosting.company.name
    });

    return NextResponse.json({
      success: true,
      data: {
        applicationId: application.id,
        snapshotId: snapshotId,
        status: application.status,
        priority: application.priority,
        queuePosition: await getQueuePosition(queueItem.id),
        jobTitle: jobPosting.title,
        companyName: jobPosting.company.name
      }
    });

  } catch (error) {
    console.error('❌ [Queue API] Swipe right failed:', error);
    
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message, errorCode: 'AUTH_ERROR' },
        { status: error.statusCode }
      );
    }

    // Handle Prisma errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'Duplicate application detected', errorCode: 'DUPLICATE_APPLICATION' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error', errorCode: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// Helper function to map priority number to enum
function mapPriority(priority?: number): ApplicationPriority {
  if (!priority || priority < 3) return ApplicationPriority.LOW;
  if (priority < 7) return ApplicationPriority.MEDIUM;
  if (priority < 9) return ApplicationPriority.HIGH;
  return ApplicationPriority.URGENT;
}

// Helper function to map priority number to queue priority enum
function mapQueuePriority(priority?: number): QueuePriority {
  if (!priority || priority < 3) return QueuePriority.LOW;
  if (priority < 7) return QueuePriority.NORMAL;
  if (priority < 9) return QueuePriority.HIGH;
  return QueuePriority.URGENT;
}

// Helper function to get queue position
async function getQueuePosition(_queueItemId: string): Promise<number> {
  const queueCount = await prisma.applicationQueue.count({
    where: {
      status: QueueStatus.PENDING,
      createdAt: {
        lte: new Date()
      }
    }
  });
  return queueCount;
}