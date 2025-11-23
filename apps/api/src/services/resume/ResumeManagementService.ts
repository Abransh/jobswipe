/**
 * @fileoverview Resume Management Service - Main Orchestrator
 * @description Coordinates all resume operations: upload, parse, structure, enhance
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { db } from '@jobswipe/database';
import { getS3StorageService } from './S3StorageService';
import { getResumeParserService } from './ResumeParserService';
import { getResumeStructurerService } from './ResumeStructurerService';
import { getRMSMetadataGenerator } from './RMSMetadataGenerator';
import { getPDFMetadataEmbedder } from './PDFMetadataEmbedder';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface UploadResumeRequest {
  userId: string;
  fileName: string;
  fileBuffer: Buffer;
  contentType: string;
  resumeName: string;
  isDefault?: boolean;
}

export interface UploadResumeResult {
  resumeId: string;
  status: string;
  s3Url: string;
  downloadUrl?: string;
  processing: {
    parsed: boolean;
    structured: boolean;
    rmsEmbedded: boolean;
  };
  metadata: {
    pageCount: number;
    fileSize: number;
    quality: number;
  };
}

// =============================================================================
// RESUME MANAGEMENT SERVICE CLASS
// =============================================================================

export class ResumeManagementService {
  private s3Service = getS3StorageService();
  private parserService = getResumeParserService();
  private structurerService = getResumeStructurerService();
  private rmsGenerator = getRMSMetadataGenerator();
  private pdfEmbedder = getPDFMetadataEmbedder();

  constructor() {
    console.log(`📋 ResumeManagementService initialized`);
  }

  // ===========================================================================
  // MAIN UPLOAD & PROCESS WORKFLOW
  // ===========================================================================

  /**
   * Upload and process resume (synchronous processing)
   */
  async uploadAndProcessResume(request: UploadResumeRequest): Promise<UploadResumeResult> {
    const startTime = Date.now();
    let resumeId: string;

    try {
      console.log(`📤 Starting resume upload and processing for user ${request.userId}`);

      // Step 1: Create database record (PENDING status)
      const resume = await db.resume.create({
        data: {
          userId: request.userId,
          name: request.resumeName,
          originalFileName: request.fileName,
          fileSize: request.fileBuffer.length,
          processingStatus: 'PARSING',
          isDefault: request.isDefault || false,
          content: {},
          sections: {},
        },
      });

      resumeId = resume.id;
      console.log(`✓ Resume record created: ${resumeId}`);

      // Step 2: Upload original to S3
      const s3Result = await this.s3Service.uploadResume({
        userId: request.userId,
        resumeId,
        fileName: request.fileName,
        fileBuffer: request.fileBuffer,
        contentType: request.contentType,
      });

      console.log(`✓ Original uploaded to S3: ${s3Result.key}`);

      // Step 3: Parse resume
      const parsed = await this.parserService.parseResume(request.fileBuffer, request.fileName, {
        parseMetadata: true,
        detectRMS: true,
      });

      console.log(`✓ Resume parsed (${parsed.pageCount} pages, quality: ${parsed.quality.score})`);

      // Step 4: Structure with AI
      const structured = await this.structurerService.structureResume(parsed.rawText);

      console.log(`✓ Resume structured (confidence: ${structured.metadata.confidence}%)`);

      // Step 5: Generate markdown
      const markdown = this.structurerService.generateMarkdown(structured);

      // Step 6: Generate RMS metadata
      const rmsMetadata = await this.rmsGenerator.generateMetadata(structured);

      console.log(`✓ RMS metadata generated (${rmsMetadata.fieldCount} fields)`);

      // Step 7: Embed metadata into PDF (only for PDF files)
      let enhancedBuffer: Buffer | null = null;
      let enhancedS3Result = null;

      if (request.contentType === 'application/pdf') {
        enhancedBuffer = await this.pdfEmbedder.embedMetadata(request.fileBuffer, rmsMetadata);

        enhancedS3Result = await this.s3Service.uploadProcessedResume(
          request.userId,
          resumeId,
          'enhanced',
          enhancedBuffer,
          'application/pdf',
          { rmsVersion: rmsMetadata.version }
        );

        console.log(`✓ Enhanced PDF uploaded: ${enhancedS3Result.key}`);
      }

      // Step 8: Upload markdown version
      const markdownBuffer = Buffer.from(markdown, 'utf-8');
      const markdownS3Result = await this.s3Service.uploadProcessedResume(
        request.userId,
        resumeId,
        'markdown',
        markdownBuffer,
        'text/markdown'
      );

      console.log(`✓ Markdown uploaded: ${markdownS3Result.key}`);

      // Step 9: Upload structured JSON
      const structuredBuffer = Buffer.from(JSON.stringify(structured, null, 2), 'utf-8');
      const structuredS3Result = await this.s3Service.uploadProcessedResume(
        request.userId,
        resumeId,
        'structured',
        structuredBuffer,
        'application/json'
      );

      console.log(`✓ Structured JSON uploaded: ${structuredS3Result.key}`);

      // Step 10: Update database with all processed data
      await db.resume.update({
        where: { id: resumeId },
        data: {
          // S3 info
          s3Key: s3Result.key,
          s3Bucket: s3Result.bucket,
          s3Region: s3Result.region,
          pdfUrl: enhancedS3Result?.url || s3Result.url,
          htmlUrl: null, // Could add HTML generation later

          // Parsed data
          rawText: parsed.rawText,
          markdownContent: markdown,
          pageCount: parsed.pageCount,

          // Structured data
          content: structured as any,
          sections: {
            experience: structured.experience,
            education: structured.education,
            skills: structured.skills,
          } as any,

          // Metadata
          metadata: {
            parser: parsed.metadata,
            structured: structured.metadata,
            rms: {
              version: rmsMetadata.version,
              fieldCount: rmsMetadata.fieldCount,
              sections: rmsMetadata.sections,
            },
          } as any,

          // RMS tracking
          hasRMSMetadata: request.contentType === 'application/pdf',
          rmsVersion: rmsMetadata.version,
          rmsSchemaUrl: rmsMetadata.schemaUrl,

          // Status
          processingStatus: 'PARSED',
          lastParsedAt: new Date(),

          // Quality scores
          completeness: structured.metadata.confidence,
          readabilityScore: parsed.quality.score,
          keywordMatch: this.calculateKeywordMatch(structured),

          // AI enhancement
          aiEnhanced: true,
          enhancementData: {
            model: structured.metadata.model,
            processingTime: Date.now() - startTime,
            warnings: [...parsed.quality.warnings, ...structured.metadata.warnings],
          } as any,

          updatedAt: new Date(),
        },
      });

      // Step 11: If setting as default, unset others
      if (request.isDefault) {
        await db.resume.updateMany({
          where: {
            userId: request.userId,
            id: { not: resumeId },
            isDefault: true,
          },
          data: { isDefault: false },
        });
      }

      // Generate presigned URL for download
      const downloadUrl = await this.s3Service.getPresignedDownloadUrl(enhancedS3Result?.key || s3Result.key);

      const processingTime = Date.now() - startTime;
      console.log(`✅ Resume processing complete in ${processingTime}ms`);

      return {
        resumeId,
        status: 'completed',
        s3Url: enhancedS3Result?.url || s3Result.url,
        downloadUrl,
        processing: {
          parsed: true,
          structured: true,
          rmsEmbedded: request.contentType === 'application/pdf',
        },
        metadata: {
          pageCount: parsed.pageCount,
          fileSize: request.fileBuffer.length,
          quality: parsed.quality.score,
        },
      };
    } catch (error) {
      console.error(`❌ Resume processing failed:`, error);

      // Update status to ERROR if we have a resume ID
      if (resumeId!) {
        await db.resume.update({
          where: { id: resumeId },
          data: {
            processingStatus: 'FAILED',
            processingError: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }

      throw error;
    }
  }

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================

  /**
   * Calculate keyword match score
   */
  private calculateKeywordMatch(structured: any): number {
    // Simple heuristic: count of skills + experience + education entries
    const skillCount = Object.values(structured.skills || {}).flat().length;
    const expCount = (structured.experience || []).length;
    const eduCount = (structured.education || []).length;

    const total = skillCount + expCount * 5 + eduCount * 3;
    return Math.min(100, (total / 50) * 100);
  }

  /**
   * Get resume by ID with all data
   */
  async getResume(resumeId: string, userId: string) {
    return await db.resume.findFirst({
      where: { id: resumeId, userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        applications: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * List user's resumes
   */
  async listResumes(userId: string) {
    return await db.resume.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
      select: {
        id: true,
        name: true,
        originalFileName: true,
        fileSize: true,
        pageCount: true,
        isDefault: true,
        processingStatus: true,
        hasRMSMetadata: true,
        completeness: true,
        readabilityScore: true,
        pdfUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { applications: true },
        },
      },
    });
  }

  /**
   * Delete resume
   */
  async deleteResume(resumeId: string, userId: string): Promise<void> {
    const resume = await db.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new Error('Resume not found');
    }

    // Delete from S3
    if (resume.s3Key) {
      try {
        await this.s3Service.deleteResumeFiles(userId, resumeId);
      } catch (error) {
        console.warn(`Failed to delete S3 files:`, error);
      }
    }

    // Delete from database
    await db.resume.delete({
      where: { id: resumeId },
    });
  }

  /**
   * Generate download URL
   */
  async getDownloadUrl(resumeId: string, userId: string): Promise<string> {
    const resume = await db.resume.findFirst({
      where: { id: resumeId, userId },
      select: { s3Key: true },
    });

    if (!resume || !resume.s3Key) {
      throw new Error('Resume not found or not uploaded');
    }

    return await this.s3Service.getPresignedDownloadUrl(resume.s3Key);
  }
}

// Singleton
let resumeManagementService: ResumeManagementService | null = null;

export function getResumeManagementService(): ResumeManagementService {
  if (!resumeManagementService) {
    resumeManagementService = new ResumeManagementService();
  }
  return resumeManagementService;
}

export default ResumeManagementService;
