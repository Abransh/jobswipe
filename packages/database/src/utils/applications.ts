import { db } from '../index';
import { ApplicationStatus, ApplicationPriority, InteractionType, JobApplication } from '../generated';

export interface CreateApplicationInput {
  userId: string;
  jobPostingId: string;
  resumeId?: string;
  coverLetter?: string;
  notes?: string;
  priority?: ApplicationPriority;
}

export interface UpdateApplicationInput {
  status?: ApplicationStatus;
  priority?: ApplicationPriority;
  coverLetter?: string;
  notes?: string;
  appliedAt?: Date;
  responseAt?: Date;
  interviewAt?: Date;
  followUpAt?: Date;
  atsUrl?: string;
  externalId?: string;
}

export interface CreateInteractionInput {
  applicationId: string;
  type: InteractionType;
  title: string;
  description?: string;
  contactPerson?: string;
  contactEmail?: string;
  scheduledAt?: Date;
  completedAt?: Date;
  metadata?: any;
}

/**
 * Create a new job application
 */
export async function createJobApplication(input: CreateApplicationInput): Promise<JobApplication> {
  return db.jobApplication.create({
    data: {
      ...input,
      status: ApplicationStatus.DRAFT,
      priority: input.priority || ApplicationPriority.MEDIUM,
    },
    include: {
      jobPosting: {
        include: {
          company: true,
        },
      },
      resume: true,
      user: {
        include: {
          profile: true,
        },
      },
    },
  });
}

/**
 * Update job application
 */
export async function updateJobApplication(
  applicationId: string,
  input: UpdateApplicationInput
): Promise<JobApplication> {
  return db.jobApplication.update({
    where: { id: applicationId },
    data: input,
    include: {
      jobPosting: {
        include: {
          company: true,
        },
      },
      resume: true,
      interactions: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
}

/**
 * Get user's job applications with filtering and pagination
 */
export async function getUserApplications(
  userId: string,
  filters?: {
    status?: ApplicationStatus[];
    priority?: ApplicationPriority[];
    companyName?: string;
    limit?: number;
    offset?: number;
  }
) {
  const { status, priority, companyName, limit = 50, offset = 0 } = filters || {};
  
  const where = {
    userId,
    ...(status && { status: { in: status } }),
    ...(priority && { priority: { in: priority } }),
    ...(companyName && {
      jobPosting: {
        company: {
          name: {
            contains: companyName,
            mode: 'insensitive' as const,
          },
        },
      },
    }),
  };

  const [applications, total] = await Promise.all([
    db.jobApplication.findMany({
      where,
      include: {
        jobPosting: {
          include: {
            company: true,
          },
        },
        resume: true,
        interactions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 3, // Recent interactions
        },
        _count: {
          select: {
            interactions: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
      skip: offset,
    }),
    db.jobApplication.count({ where }),
  ]);

  return {
    applications,
    total,
    hasMore: offset + limit < total,
  };
}

/**
 * Get application analytics for a user
 */
export async function getApplicationAnalytics(userId: string) {
  const [statusCounts, priorityCounts, recentActivity, monthlyStats] = await Promise.all([
    // Count by status
    db.jobApplication.groupBy({
      by: ['status'],
      where: { userId },
      _count: {
        status: true,
      },
    }),
    
    // Count by priority
    db.jobApplication.groupBy({
      by: ['priority'],
      where: { userId },
      _count: {
        priority: true,
      },
    }),
    
    // Recent activity (last 30 days)
    db.jobApplication.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    
    // Monthly statistics for the last 6 months
    db.$queryRaw`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'APPLIED' THEN 1 END) as applied,
        COUNT(CASE WHEN status = 'INTERVIEW' THEN 1 END) as interviews,
        COUNT(CASE WHEN status = 'OFFER' THEN 1 END) as offers
      FROM job_applications 
      WHERE user_id = ${userId}
        AND created_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `,
  ]);

  return {
    statusCounts: statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count.status;
      return acc;
    }, {} as Record<ApplicationStatus, number>),
    
    priorityCounts: priorityCounts.reduce((acc, curr) => {
      acc[curr.priority] = curr._count.priority;
      return acc;
    }, {} as Record<ApplicationPriority, number>),
    
    recentActivity,
    monthlyStats,
  };
}

/**
 * Add interaction to application
 */
export async function addApplicationInteraction(input: CreateInteractionInput) {
  return db.applicationInteraction.create({
    data: input,
    include: {
      application: {
        include: {
          jobPosting: {
            include: {
              company: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Get application with full details
 */
export async function getApplicationById(applicationId: string) {
  return db.jobApplication.findUnique({
    where: { id: applicationId },
    include: {
      jobPosting: {
        include: {
          company: true,
        },
      },
      resume: true,
      user: {
        include: {
          profile: true,
        },
      },
      interactions: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
}

/**
 * Delete job application
 */
export async function deleteJobApplication(applicationId: string): Promise<void> {
  await db.jobApplication.delete({
    where: { id: applicationId },
  });
}

/**
 * Bulk update application statuses
 */
export async function bulkUpdateApplicationStatus(
  applicationIds: string[],
  status: ApplicationStatus
): Promise<void> {
  await db.jobApplication.updateMany({
    where: {
      id: {
        in: applicationIds,
      },
    },
    data: {
      status,
    },
  });
}

/**
 * Get applications that need follow-up
 */
export async function getApplicationsNeedingFollowUp(userId: string) {
  return db.jobApplication.findMany({
    where: {
      userId,
      followUpAt: {
        lte: new Date(),
      },
      status: {
        in: [ApplicationStatus.APPLIED, ApplicationStatus.INTERVIEW],
      },
    },
    include: {
      jobPosting: {
        include: {
          company: true,
        },
      },
    },
    orderBy: {
      followUpAt: 'asc',
    },
  });
}