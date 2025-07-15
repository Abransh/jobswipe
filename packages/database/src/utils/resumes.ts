import { db } from '../index';
import { Resume, ResumeTemplate } from '../generated';

export interface CreateResumeInput {
  userId: string;
  templateId?: string;
  name: string;
  content: any; // JSON content
  isDefault?: boolean;
}

export interface UpdateResumeInput {
  name?: string;
  content?: any;
  pdfUrl?: string;
  docxUrl?: string;
  isDefault?: boolean;
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  category?: string;
  content: any; // JSON structure
  preview?: string;
  isPremium?: boolean;
  tags?: string[];
}

/**
 * Create a new resume
 */
export async function createResume(input: CreateResumeInput): Promise<Resume> {
  // If this is set as default, unset other defaults
  if (input.isDefault) {
    await db.resume.updateMany({
      where: {
        userId: input.userId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  return db.resume.create({
    data: {
      ...input,
      version: 1,
    },
    include: {
      template: true,
      user: {
        include: {
          profile: true,
        },
      },
    },
  });
}

/**
 * Update resume
 */
export async function updateResume(
  resumeId: string,
  input: UpdateResumeInput
): Promise<Resume> {
  // If this is set as default, unset other defaults for the user
  if (input.isDefault) {
    const resume = await db.resume.findUnique({
      where: { id: resumeId },
      select: { userId: true },
    });

    if (resume) {
      await db.resume.updateMany({
        where: {
          userId: resume.userId,
          isDefault: true,
          id: { not: resumeId },
        },
        data: {
          isDefault: false,
        },
      });
    }
  }

  return db.resume.update({
    where: { id: resumeId },
    data: {
      ...input,
      // Increment version if content is updated
      ...(input.content && { version: { increment: 1 } }),
    },
    include: {
      template: true,
      applications: {
        include: {
          jobPosting: {
            include: {
              company: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5, // Recent applications using this resume
      },
    },
  });
}

/**
 * Get user's resumes
 */
export async function getUserResumes(userId: string) {
  return db.resume.findMany({
    where: { userId },
    include: {
      template: true,
      _count: {
        select: {
          applications: true,
        },
      },
    },
    orderBy: [
      { isDefault: 'desc' },
      { updatedAt: 'desc' },
    ],
  });
}

/**
 * Get resume by ID with full details
 */
export async function getResumeById(resumeId: string) {
  return db.resume.findUnique({
    where: { id: resumeId },
    include: {
      template: true,
      user: {
        include: {
          profile: true,
        },
      },
      applications: {
        include: {
          jobPosting: {
            include: {
              company: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
}

/**
 * Clone resume with new name
 */
export async function cloneResume(resumeId: string, newName: string): Promise<Resume> {
  const originalResume = await db.resume.findUnique({
    where: { id: resumeId },
    include: {
      template: true,
    },
  });

  if (!originalResume) {
    throw new Error('Resume not found');
  }

  return db.resume.create({
    data: {
      userId: originalResume.userId,
      templateId: originalResume.templateId,
      name: newName,
      content: originalResume.content,
      version: 1,
      isDefault: false,
    },
    include: {
      template: true,
    },
  });
}

/**
 * Delete resume
 */
export async function deleteResume(resumeId: string): Promise<void> {
  await db.resume.delete({
    where: { id: resumeId },
  });
}

/**
 * Get all resume templates
 */
export async function getResumeTemplates(filters?: {
  category?: string;
  isPremium?: boolean;
  tags?: string[];
}) {
  const { category, isPremium, tags } = filters || {};

  return db.resumeTemplate.findMany({
    where: {
      isActive: true,
      ...(category && { category }),
      ...(isPremium !== undefined && { isPremium }),
      ...(tags && { tags: { hasSome: tags } }),
    },
    orderBy: [
      { isPremium: 'asc' }, // Free templates first
      { createdAt: 'desc' },
    ],
  });
}

/**
 * Get template by ID
 */
export async function getTemplateById(templateId: string) {
  return db.resumeTemplate.findUnique({
    where: { id: templateId },
    include: {
      _count: {
        select: {
          resumes: true,
        },
      },
    },
  });
}

/**
 * Create resume template (admin function)
 */
export async function createResumeTemplate(input: CreateTemplateInput): Promise<ResumeTemplate> {
  return db.resumeTemplate.create({
    data: {
      ...input,
      isActive: true,
    },
  });
}

/**
 * Update resume template (admin function)
 */
export async function updateResumeTemplate(
  templateId: string,
  input: Partial<CreateTemplateInput>
): Promise<ResumeTemplate> {
  return db.resumeTemplate.update({
    where: { id: templateId },
    data: input,
  });
}

/**
 * Get resume usage statistics
 */
export async function getResumeAnalytics(userId: string) {
  const [totalResumes, defaultResume, mostUsedTemplate, recentActivity] = await Promise.all([
    // Total resumes count
    db.resume.count({
      where: { userId },
    }),

    // Default resume
    db.resume.findFirst({
      where: {
        userId,
        isDefault: true,
      },
      include: {
        template: true,
      },
    }),

    // Most used template
    db.resume.groupBy({
      by: ['templateId'],
      where: {
        userId,
        templateId: { not: null },
      },
      _count: {
        templateId: true,
      },
      orderBy: {
        _count: {
          templateId: 'desc',
        },
      },
      take: 1,
    }),

    // Recent resume activity
    db.resume.count({
      where: {
        userId,
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    }),
  ]);

  return {
    totalResumes,
    defaultResume,
    mostUsedTemplate: mostUsedTemplate[0] || null,
    recentActivity,
  };
}

/**
 * Set resume as default
 */
export async function setDefaultResume(resumeId: string): Promise<Resume> {
  const resume = await db.resume.findUnique({
    where: { id: resumeId },
    select: { userId: true },
  });

  if (!resume) {
    throw new Error('Resume not found');
  }

  // Unset current default
  await db.resume.updateMany({
    where: {
      userId: resume.userId,
      isDefault: true,
    },
    data: {
      isDefault: false,
    },
  });

  // Set new default
  return db.resume.update({
    where: { id: resumeId },
    data: {
      isDefault: true,
    },
    include: {
      template: true,
    },
  });
}