/**
 * @fileoverview Resume Versioning Service - Track Resume Versions
 * @description Manage resume versions (original + tailored versions per job)
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { db } from '@jobswipe/database';
import { StructuredResume } from './ResumeStructurerService';
import { TailoredResume, DiffResult } from './ResumeEnhancerService';
import { getResumeEnhancerService } from './ResumeEnhancerService';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

/**
 * Resume version (from database)
 */
export interface ResumeVersion {
  id: string;
  resumeId: string;
  jobPostingId: string | null;
  type: string; // EnhancementType
  description: string;
  originalContent: any; // JSON - StructuredResume
  enhancedContent: any; // JSON - TailoredResume
  changes: any; // JSON - ChangeLog[]
  aiModel: string | null;
  confidence: number | null;
  isApplied: boolean;
  appliedAt: Date | null;
  improvedMatch: number | null; // Expected match score improvement
  successRate: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Version history summary
 */
export interface VersionHistory {
  resumeId: string;
  originalResume: {
    name: string;
    createdAt: Date;
    processingStatus: string;
  };
  versions: VersionSummary[];
  statistics: {
    totalVersions: number;
    appliedVersions: number;
    averageMatchImprovement: number;
    mostSuccessfulType: string | null;
  };
}

/**
 * Version summary for list view
 */
export interface VersionSummary {
  id: string;
  jobPostingId: string | null;
  jobTitle: string | null;
  company: string | null;
  type: string;
  description: string;
  changesCount: number;
  improvedMatch: number | null;
  isApplied: boolean;
  appliedAt: Date | null;
  createdAt: Date;
}

/**
 * Version creation options
 */
export interface CreateVersionOptions {
  type: 'JOB_SPECIFIC_TAILORING' | 'KEYWORD_OPTIMIZATION' | 'ATS_OPTIMIZATION' | 'SKILL_HIGHLIGHTING';
  description?: string;
  autoApply?: boolean; // Automatically apply this version
}

// =============================================================================
// RESUME VERSIONING SERVICE CLASS
// =============================================================================

export class ResumeVersioningService {
  private enhancerService = getResumeEnhancerService();

  constructor() {
    console.log('📚 ResumeVersioningService initialized');
  }

  // ===========================================================================
  // VERSION CREATION
  // ===========================================================================

  /**
   * Create new resume version (tailored for specific job)
   */
  async createVersion(
    resumeId: string,
    jobPostingId: string,
    tailoredResume: TailoredResume,
    options?: Partial<CreateVersionOptions>
  ): Promise<ResumeVersion> {
    console.log(`📚 Creating resume version for job: ${tailoredResume.metadata.jobTitle}`);

    try {
      // Get original resume
      const originalResume = await db.resume.findUnique({
        where: { id: resumeId },
      });

      if (!originalResume) {
        throw new Error(`Resume not found: ${resumeId}`);
      }

      // Determine version type
      const type = options?.type || 'JOB_SPECIFIC_TAILORING';

      // Generate description
      const description = options?.description ||
        `Tailored for ${tailoredResume.metadata.jobTitle} at ${tailoredResume.metadata.company}`;

      // If auto-apply, mark previous versions as unapplied
      if (options?.autoApply) {
        await db.resumeEnhancement.updateMany({
          where: {
            resumeId,
            isApplied: true,
          },
          data: {
            isApplied: false,
          },
        });
      }

      // Create enhancement record
      const enhancement = await db.resumeEnhancement.create({
        data: {
          resumeId,
          jobPostingId,
          type,
          description,
          originalContent: originalResume.content,
          enhancedContent: tailoredResume,
          changes: tailoredResume.changes,
          aiModel: tailoredResume.metadata.aiModel,
          confidence: 85, // Default confidence
          isApplied: options?.autoApply || false,
          appliedAt: options?.autoApply ? new Date() : null,
          improvedMatch: tailoredResume.metadata.matchScore,
        },
      });

      console.log(`✅ Resume version created: ${enhancement.id}`);

      return this.mapToResumeVersion(enhancement);
    } catch (error) {
      console.error('❌ Failed to create resume version:', error);
      throw new Error(`Failed to create version: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===========================================================================
  // VERSION RETRIEVAL
  // ===========================================================================

  /**
   * Get version history for a resume
   */
  async getVersionHistory(resumeId: string): Promise<VersionHistory> {
    console.log(`📚 Fetching version history for resume: ${resumeId}`);

    try {
      // Get original resume
      const resume = await db.resume.findUnique({
        where: { id: resumeId },
        select: {
          name: true,
          createdAt: true,
          processingStatus: true,
        },
      });

      if (!resume) {
        throw new Error(`Resume not found: ${resumeId}`);
      }

      // Get all versions
      const enhancements = await db.resumeEnhancement.findMany({
        where: { resumeId },
        include: {
          jobPosting: {
            select: {
              title: true,
              companyId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Map to version summaries
      const versions: VersionSummary[] = enhancements.map(enh => ({
        id: enh.id,
        jobPostingId: enh.jobPostingId,
        jobTitle: (enh.jobPosting as any)?.title || null,
        company: (enh.jobPosting as any)?.companyId || null,
        type: enh.type,
        description: enh.description,
        changesCount: Array.isArray(enh.changes) ? (enh.changes as any[]).length : 0,
        improvedMatch: enh.improvedMatch,
        isApplied: enh.isApplied,
        appliedAt: enh.appliedAt,
        createdAt: enh.createdAt,
      }));

      // Calculate statistics
      const appliedVersions = enhancements.filter(e => e.isApplied).length;
      const avgMatch = enhancements.reduce((sum, e) => sum + (e.improvedMatch || 0), 0) / (enhancements.length || 1);

      // Find most successful type
      const typeCounts = enhancements.reduce((acc, e) => {
        acc[e.type] = (acc[e.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostSuccessfulType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

      return {
        resumeId,
        originalResume: {
          name: resume.name,
          createdAt: resume.createdAt,
          processingStatus: resume.processingStatus,
        },
        versions,
        statistics: {
          totalVersions: enhancements.length,
          appliedVersions,
          averageMatchImprovement: Math.round(avgMatch),
          mostSuccessfulType,
        },
      };
    } catch (error) {
      console.error('❌ Failed to get version history:', error);
      throw new Error(`Failed to get history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get specific version by ID
   */
  async getVersion(versionId: string): Promise<ResumeVersion | null> {
    console.log(`📚 Fetching version: ${versionId}`);

    try {
      const enhancement = await db.resumeEnhancement.findUnique({
        where: { id: versionId },
      });

      if (!enhancement) {
        return null;
      }

      return this.mapToResumeVersion(enhancement);
    } catch (error) {
      console.error('❌ Failed to get version:', error);
      throw new Error(`Failed to get version: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get versions for specific job posting
   */
  async getVersionsForJob(resumeId: string, jobPostingId: string): Promise<ResumeVersion[]> {
    console.log(`📚 Fetching versions for job: ${jobPostingId}`);

    try {
      const enhancements = await db.resumeEnhancement.findMany({
        where: {
          resumeId,
          jobPostingId,
        },
        orderBy: { createdAt: 'desc' },
      });

      return enhancements.map(e => this.mapToResumeVersion(e));
    } catch (error) {
      console.error('❌ Failed to get job versions:', error);
      throw new Error(`Failed to get versions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get currently applied version
   */
  async getAppliedVersion(resumeId: string): Promise<ResumeVersion | null> {
    console.log(`📚 Fetching applied version for resume: ${resumeId}`);

    try {
      const enhancement = await db.resumeEnhancement.findFirst({
        where: {
          resumeId,
          isApplied: true,
        },
        orderBy: { appliedAt: 'desc' },
      });

      if (!enhancement) {
        return null;
      }

      return this.mapToResumeVersion(enhancement);
    } catch (error) {
      console.error('❌ Failed to get applied version:', error);
      throw new Error(`Failed to get version: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===========================================================================
  // VERSION COMPARISON
  // ===========================================================================

  /**
   * Compare two versions
   */
  async compareVersions(versionId1: string, versionId2: string): Promise<DiffResult> {
    console.log(`📚 Comparing versions: ${versionId1} vs ${versionId2}`);

    try {
      const [version1, version2] = await Promise.all([
        db.resumeEnhancement.findUnique({ where: { id: versionId1 } }),
        db.resumeEnhancement.findUnique({ where: { id: versionId2 } }),
      ]);

      if (!version1 || !version2) {
        throw new Error('One or both versions not found');
      }

      // Use enhancer service to generate diff
      const diff = await this.enhancerService.compareVersions(
        version1.originalContent as StructuredResume,
        version2.enhancedContent as TailoredResume
      );

      console.log(`✅ Version comparison complete (${diff.summary.totalChanges} changes)`);

      return diff;
    } catch (error) {
      console.error('❌ Failed to compare versions:', error);
      throw new Error(`Failed to compare: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Compare version with original resume
   */
  async compareWithOriginal(versionId: string): Promise<DiffResult> {
    console.log(`📚 Comparing version with original: ${versionId}`);

    try {
      const version = await db.resumeEnhancement.findUnique({
        where: { id: versionId },
      });

      if (!version) {
        throw new Error('Version not found');
      }

      const diff = await this.enhancerService.compareVersions(
        version.originalContent as StructuredResume,
        version.enhancedContent as TailoredResume
      );

      return diff;
    } catch (error) {
      console.error('❌ Failed to compare with original:', error);
      throw new Error(`Failed to compare: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===========================================================================
  // VERSION APPLICATION
  // ===========================================================================

  /**
   * Apply a version (set as active)
   */
  async applyVersion(versionId: string): Promise<ResumeVersion> {
    console.log(`📚 Applying version: ${versionId}`);

    try {
      const version = await db.resumeEnhancement.findUnique({
        where: { id: versionId },
      });

      if (!version) {
        throw new Error('Version not found');
      }

      // Unapply all other versions for this resume
      await db.resumeEnhancement.updateMany({
        where: {
          resumeId: version.resumeId,
          isApplied: true,
        },
        data: {
          isApplied: false,
        },
      });

      // Apply this version
      const updated = await db.resumeEnhancement.update({
        where: { id: versionId },
        data: {
          isApplied: true,
          appliedAt: new Date(),
        },
      });

      console.log(`✅ Version applied: ${versionId}`);

      return this.mapToResumeVersion(updated);
    } catch (error) {
      console.error('❌ Failed to apply version:', error);
      throw new Error(`Failed to apply version: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Unapply all versions (revert to original)
   */
  async revertToOriginal(resumeId: string): Promise<void> {
    console.log(`📚 Reverting to original resume: ${resumeId}`);

    try {
      await db.resumeEnhancement.updateMany({
        where: {
          resumeId,
          isApplied: true,
        },
        data: {
          isApplied: false,
        },
      });

      console.log(`✅ Reverted to original resume`);
    } catch (error) {
      console.error('❌ Failed to revert:', error);
      throw new Error(`Failed to revert: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Rollback to specific version
   */
  async rollbackToVersion(versionId: string): Promise<any> {
    console.log(`📚 Rolling back to version: ${versionId}`);

    try {
      // Apply the version
      const version = await this.applyVersion(versionId);

      // Get the resume with applied version
      const resume = await db.resume.findUnique({
        where: { id: version.resumeId },
        include: {
          resumeEnhancements: {
            where: { isApplied: true },
          },
        },
      });

      console.log(`✅ Rolled back to version: ${versionId}`);

      return resume;
    } catch (error) {
      console.error('❌ Failed to rollback:', error);
      throw new Error(`Failed to rollback: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===========================================================================
  // VERSION DELETION
  // ===========================================================================

  /**
   * Delete a version
   */
  async deleteVersion(versionId: string): Promise<void> {
    console.log(`📚 Deleting version: ${versionId}`);

    try {
      await db.resumeEnhancement.delete({
        where: { id: versionId },
      });

      console.log(`✅ Version deleted: ${versionId}`);
    } catch (error) {
      console.error('❌ Failed to delete version:', error);
      throw new Error(`Failed to delete version: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete all versions for a resume
   */
  async deleteAllVersions(resumeId: string): Promise<number> {
    console.log(`📚 Deleting all versions for resume: ${resumeId}`);

    try {
      const result = await db.resumeEnhancement.deleteMany({
        where: { resumeId },
      });

      console.log(`✅ Deleted ${result.count} versions`);

      return result.count;
    } catch (error) {
      console.error('❌ Failed to delete versions:', error);
      throw new Error(`Failed to delete versions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===========================================================================
  // ANALYTICS
  // ===========================================================================

  /**
   * Get version statistics
   */
  async getVersionStatistics(resumeId: string): Promise<{
    totalVersions: number;
    appliedVersions: number;
    byJobPosting: Array<{ jobPostingId: string; count: number }>;
    byType: Array<{ type: string; count: number }>;
    averageMatchImprovement: number;
  }> {
    console.log(`📚 Fetching version statistics for resume: ${resumeId}`);

    try {
      const enhancements = await db.resumeEnhancement.findMany({
        where: { resumeId },
        select: {
          jobPostingId: true,
          type: true,
          improvedMatch: true,
          isApplied: true,
        },
      });

      // Group by job posting
      const byJobPosting = Object.entries(
        enhancements.reduce((acc, e) => {
          if (e.jobPostingId) {
            acc[e.jobPostingId] = (acc[e.jobPostingId] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>)
      ).map(([jobPostingId, count]) => ({ jobPostingId, count }));

      // Group by type
      const byType = Object.entries(
        enhancements.reduce((acc, e) => {
          acc[e.type] = (acc[e.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([type, count]) => ({ type, count }));

      // Calculate average match improvement
      const avgMatch = enhancements.reduce((sum, e) => sum + (e.improvedMatch || 0), 0) / (enhancements.length || 1);

      return {
        totalVersions: enhancements.length,
        appliedVersions: enhancements.filter(e => e.isApplied).length,
        byJobPosting,
        byType,
        averageMatchImprovement: Math.round(avgMatch),
      };
    } catch (error) {
      console.error('❌ Failed to get statistics:', error);
      throw new Error(`Failed to get statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================

  /**
   * Map database record to ResumeVersion
   */
  private mapToResumeVersion(enhancement: any): ResumeVersion {
    return {
      id: enhancement.id,
      resumeId: enhancement.resumeId,
      jobPostingId: enhancement.jobPostingId,
      type: enhancement.type,
      description: enhancement.description,
      originalContent: enhancement.originalContent,
      enhancedContent: enhancement.enhancedContent,
      changes: enhancement.changes,
      aiModel: enhancement.aiModel,
      confidence: enhancement.confidence,
      isApplied: enhancement.isApplied,
      appliedAt: enhancement.appliedAt,
      improvedMatch: enhancement.improvedMatch,
      successRate: enhancement.successRate,
      createdAt: enhancement.createdAt,
      updatedAt: enhancement.updatedAt,
    };
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

let resumeVersioningService: ResumeVersioningService | null = null;

export function getResumeVersioningService(): ResumeVersioningService {
  if (!resumeVersioningService) {
    resumeVersioningService = new ResumeVersioningService();
  }
  return resumeVersioningService;
}

export default ResumeVersioningService;
