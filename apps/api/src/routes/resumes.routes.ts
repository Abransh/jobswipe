/**
 * @fileoverview Resume Routes with Full Processing Pipeline
 * @description Complete resume management API with S3, parsing, AI structuring, and RMS
 * @version 2.0.0
 * @author JobSwipe Team
 */

import { FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'crypto';
import { getResumeManagementService } from '../services/resume/ResumeManagementService';
import { getJobMatchingService } from '../services/resume/JobMatchingService';
import { getResumeEnhancerService } from '../services/resume/ResumeEnhancerService';
import { getPDFGeneratorService } from '../services/resume/PDFGeneratorService';
import { getResumeVersioningService } from '../services/resume/ResumeVersioningService';
import { getMetadataReaderService } from '../services/resume/MetadataReaderService';
import { getRMSMetadataGenerator } from '../services/resume/RMSMetadataGenerator';
import { getS3StorageService } from '../services/resume/S3StorageService';
import { db } from '@jobswipe/database';
import { requireAuth } from '../middleware/auth.middleware';

// =============================================================================
// RESUME ROUTES PLUGIN
// =============================================================================

export const resumeRoutes: FastifyPluginAsync = async (fastify) => {
  const resumeService = getResumeManagementService();
  const jobMatchingService = getJobMatchingService();
  const resumeEnhancerService = getResumeEnhancerService();
  const pdfGeneratorService = getPDFGeneratorService();
  const versioningService = getResumeVersioningService();
  const metadataReaderService = getMetadataReaderService();
  const rmsGenerator = getRMSMetadataGenerator();
  const s3Service = getS3StorageService();

  // ===========================================================================
  // POST /api/v1/resumes/upload - Upload and Process Resume
  // ===========================================================================
  fastify.post('/api/v1/resumes/upload', {
    preHandler: requireAuth,
    handler: async (request, reply) => {
      const correlationId = randomUUID();
      console.log(`📤 [${correlationId}] Resume upload request started`);

      try {
        const user = request.user;
        if (!user) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required',
            errorCode: 'UNAUTHORIZED',
          });
        }

        console.log(`👤 [${correlationId}] User authenticated:`, user.email);

        // Get uploaded file from multipart form
        const data = await request.file();

        if (!data) {
          console.error(`❌ [${correlationId}] No file in request`);
          return reply.code(400).send({
            success: false,
            error: 'No file uploaded',
            errorCode: 'NO_FILE',
            correlationId,
          });
        }

        // Validate file type
        const allowedMimeTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowedMimeTypes.includes(data.mimetype)) {
          console.error(`❌ [${correlationId}] Invalid file type:`, data.mimetype);
          return reply.code(400).send({
            success: false,
            error: `Invalid file type: ${data.mimetype}. Only PDF, DOC, and DOCX files are allowed.`,
            errorCode: 'INVALID_FILE_TYPE',
            correlationId,
          });
        }

        // Validate file size (10MB max)
        const maxSize = parseInt(process.env.MAX_RESUME_SIZE || '10485760', 10);
        const fileBuffer = await data.toBuffer();

        if (fileBuffer.length > maxSize) {
          console.error(`❌ [${correlationId}] File too large:`, fileBuffer.length);
          return reply.code(400).send({
            success: false,
            error: `File size ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(maxSize / 1024 / 1024).toFixed(2)}MB`,
            errorCode: 'FILE_TOO_LARGE',
            correlationId,
          });
        }

        // Extract metadata from form fields
        const fields = data.fields as any;
        const resumeName = fields.name?.value || data.filename.replace(/\.[^/.]+$/, '');
        const isDefault = fields.isDefault?.value === 'true';

        console.log(`📝 [${correlationId}] Upload metadata:`, {
          fileName: data.filename,
          fileSize: fileBuffer.length,
          resumeName,
          isDefault,
        });

        // Upload and process resume
        console.log(`🔄 [${correlationId}] Starting resume processing...`);

        const result = await resumeService.uploadAndProcessResume({
          userId: user.id,
          fileName: data.filename,
          fileBuffer,
          contentType: data.mimetype,
          resumeName,
          isDefault,
        });

        console.log(`✅ [${correlationId}] Resume processing complete:`, result.resumeId);

        return reply.send({
          success: true,
          message: 'Resume uploaded and processed successfully',
          resume: {
            id: result.resumeId,
            name: resumeName,
            status: result.status,
            url: result.s3Url,
            downloadUrl: result.downloadUrl,
            processing: result.processing,
            metadata: result.metadata,
          },
          correlationId,
        });
      } catch (error) {
        console.error(`❌ [${correlationId}] Resume upload error:`, error);

        return reply.code(500).send({
          success: false,
          error: 'Failed to upload and process resume',
          details: error instanceof Error ? error.message : 'Unknown error',
          errorCode: 'PROCESSING_FAILED',
          correlationId,
        });
      }
    },
  });

  // ===========================================================================
  // GET /api/v1/resumes - List User's Resumes
  // ===========================================================================
  fastify.get('/api/v1/resumes', {
    preHandler: requireAuth,
    handler: async (request, reply) => {
      const correlationId = randomUUID();

      try {
        const user = request.user;
        if (!user) {
          return reply.code(401).send({ success: false, error: 'Unauthorized' });
        }

        const resumes = await resumeService.listResumes(user.id);

        return reply.send({
          success: true,
          resumes,
          total: resumes.length,
          correlationId,
        });
      } catch (error) {
        console.error(`❌ [${correlationId}] Get resumes error:`, error);

        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch resumes',
          details: error instanceof Error ? error.message : 'Unknown error',
          correlationId,
        });
      }
    },
  });

  // ===========================================================================
  // GET /api/v1/resumes/:id - Get Specific Resume
  // ===========================================================================
  fastify.get('/api/v1/resumes/:id', {
    preHandler: requireAuth,
    handler: async (request, reply) => {
      const correlationId = randomUUID();
      const { id } = request.params as { id: string };

      try {
        const user = request.user;
        if (!user) {
          return reply.code(401).send({ success: false, error: 'Unauthorized' });
        }

        const resume = await resumeService.getResume(id, user.id);

        if (!resume) {
          return reply.code(404).send({
            success: false,
            error: 'Resume not found',
            errorCode: 'NOT_FOUND',
          });
        }

        return reply.send({
          success: true,
          resume,
          correlationId,
        });
      } catch (error) {
        console.error(`❌ [${correlationId}] Get resume error:`, error);

        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch resume',
          details: error instanceof Error ? error.message : 'Unknown error',
          correlationId,
        });
      }
    },
  });

  // ===========================================================================
  // GET /api/v1/resumes/:id/download - Download Resume
  // ===========================================================================
  fastify.get('/api/v1/resumes/:id/download', {
    preHandler: requireAuth,
    handler: async (request, reply) => {
      const correlationId = randomUUID();
      const { id } = request.params as { id: string };

      try {
        const user = request.user;
        if (!user) {
          return reply.code(401).send({ success: false, error: 'Unauthorized' });
        }

        const downloadUrl = await resumeService.getDownloadUrl(id, user.id);

        return reply.send({
          success: true,
          downloadUrl,
          expiresIn: 3600, // 1 hour
          correlationId,
        });
      } catch (error) {
        console.error(`❌ [${correlationId}] Download URL error:`, error);

        return reply.code(500).send({
          success: false,
          error: 'Failed to generate download URL',
          details: error instanceof Error ? error.message : 'Unknown error',
          correlationId,
        });
      }
    },
  });

  // ===========================================================================
  // DELETE /api/v1/resumes/:id - Delete Resume
  // ===========================================================================
  fastify.delete('/api/v1/resumes/:id', {
    preHandler: requireAuth,
    handler: async (request, reply) => {
      const correlationId = randomUUID();
      const { id } = request.params as { id: string };

      try {
        const user = request.user;
        if (!user) {
          return reply.code(401).send({ success: false, error: 'Unauthorized' });
        }

        await resumeService.deleteResume(id, user.id);

        console.log(`✅ [${correlationId}] Resume deleted:`, id);

        return reply.send({
          success: true,
          message: 'Resume deleted successfully',
          correlationId,
        });
      } catch (error) {
        console.error(`❌ [${correlationId}] Delete resume error:`, error);

        return reply.code(500).send({
          success: false,
          error: 'Failed to delete resume',
          details: error instanceof Error ? error.message : 'Unknown error',
          correlationId,
        });
      }
    },
  });

  // ===========================================================================
  // PATCH /api/v1/resumes/:id/default - Set Resume as Default
  // ===========================================================================
  fastify.patch('/api/v1/resumes/:id/default', {
    preHandler: requireAuth,
    handler: async (request, reply) => {
      const correlationId = randomUUID();
      const { id } = request.params as { id: string };

      try {
        const user = request.user;
        if (!user) {
          return reply.code(401).send({ success: false, error: 'Unauthorized' });
        }

        // Set as default
        await (fastify as any).db.resume.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false },
        });

        const resume = await (fastify as any).db.resume.update({
          where: { id },
          data: { isDefault: true },
        });

        console.log(`✅ [${correlationId}] Resume set as default:`, id);

        return reply.send({
          success: true,
          message: 'Resume set as default',
          resume,
          correlationId,
        });
      } catch (error) {
        console.error(`❌ [${correlationId}] Set default resume error:`, error);

        return reply.code(500).send({
          success: false,
          error: 'Failed to set default resume',
          details: error instanceof Error ? error.message : 'Unknown error',
          correlationId,
        });
      }
    },
  });

  // ===========================================================================
  // PHASE 2: ENHANCEMENT ENDPOINTS
  // ===========================================================================

  // ===========================================================================
  // POST /api/v1/resumes/:id/tailor - Tailor Resume to Job
  // ===========================================================================
  fastify.post('/api/v1/resumes/:id/tailor', {
    preHandler: requireAuth,
    handler: async (request, reply) => {
      const correlationId = randomUUID();
      const { id } = request.params as { id: string };
      const { jobPostingId, options } = request.body as { jobPostingId: string; options?: any };

      console.log(`✨ [${correlationId}] Tailor resume request: ${id} for job ${jobPostingId}`);

      try {
        const user = request.user;
        if (!user) {
          return reply.code(401).send({ success: false, error: 'Unauthorized' });
        }

        // Verify resume ownership
        const resume = await db.resume.findFirst({
          where: { id, userId: user.id },
        });

        if (!resume) {
          return reply.code(404).send({
            success: false,
            error: 'Resume not found',
            errorCode: 'NOT_FOUND',
          });
        }

        // Get job posting
        const jobPosting = await db.jobPosting.findUnique({
          where: { id: jobPostingId },
        });

        if (!jobPosting) {
          return reply.code(404).send({
            success: false,
            error: 'Job posting not found',
            errorCode: 'JOB_NOT_FOUND',
          });
        }

        // Tailor resume
        const tailored = await resumeEnhancerService.tailorResumeToJob(
          resume.content as any,
          jobPosting as any,
          options
        );

        // Create version (don't apply yet - user needs to confirm)
        const version = await versioningService.createVersion(
          id,
          jobPostingId,
          tailored,
          { type: 'JOB_SPECIFIC_TAILORING', autoApply: false }
        );

        // Generate diff
        const diff = await resumeEnhancerService.compareVersions(
          resume.content as any,
          tailored
        );

        console.log(`✅ [${correlationId}] Resume tailored (${diff.summary.totalChanges} changes)`);

        return reply.send({
          success: true,
          message: 'Resume tailored successfully',
          enhancement: {
            id: version.id,
            changes: diff.summary.totalChanges,
            improvedMatchScore: tailored.metadata.matchScore,
            diff: diff.visualDiff,
            metadata: tailored.metadata,
          },
          diff,
          correlationId,
        });
      } catch (error) {
        console.error(`❌ [${correlationId}] Tailor resume error:`, error);

        return reply.code(500).send({
          success: false,
          error: 'Failed to tailor resume',
          details: error instanceof Error ? error.message : 'Unknown error',
          correlationId,
        });
      }
    },
  });

  // ===========================================================================
  // POST /api/v1/resumes/:id/tailor/:enhancementId/confirm - Confirm Tailoring
  // ===========================================================================
  fastify.post('/api/v1/resumes/:id/tailor/:enhancementId/confirm', {
    preHandler: requireAuth,
    handler: async (request, reply) => {
      const correlationId = randomUUID();
      const { id, enhancementId } = request.params as { id: string; enhancementId: string };

      console.log(`✅ [${correlationId}] Confirm tailoring: ${enhancementId}`);

      try {
        const user = request.user;
        if (!user) {
          return reply.code(401).send({ success: false, error: 'Unauthorized' });
        }

        // Verify resume ownership
        const resume = await db.resume.findFirst({
          where: { id, userId: user.id },
        });

        if (!resume) {
          return reply.code(404).send({
            success: false,
            error: 'Resume not found',
          });
        }

        // Get enhancement version
        const version = await versioningService.getVersion(enhancementId);

        if (!version || version.resumeId !== id) {
          return reply.code(404).send({
            success: false,
            error: 'Enhancement not found',
          });
        }

        // Apply the version
        await versioningService.applyVersion(enhancementId);

        // Generate new PDF from tailored resume
        const tailoredResume = version.enhancedContent;
        const pdfBuffer = await pdfGeneratorService.generatePDFFromStructured(tailoredResume);

        // Generate RMS metadata
        const rmsMetadata = await rmsGenerator.generateMetadata(tailoredResume);

        // Embed metadata in PDF
        const enhancedPdf = await pdfGeneratorService.regenerateWithMetadata(tailoredResume, rmsMetadata);

        // Upload enhanced PDF to S3
        const s3Result = await s3Service.uploadProcessedResume(
          user.id,
          id,
          'enhanced',
          enhancedPdf,
          'application/pdf',
          { tailoredFor: version.jobPostingId || '' }
        );

        console.log(`✅ [${correlationId}] Tailoring confirmed and PDF generated`);

        return reply.send({
          success: true,
          message: 'Tailored resume applied and PDF generated',
          pdfUrl: s3Result.url,
          downloadUrl: await s3Service.getPresignedDownloadUrl(s3Result.key),
          correlationId,
        });
      } catch (error) {
        console.error(`❌ [${correlationId}] Confirm tailoring error:`, error);

        return reply.code(500).send({
          success: false,
          error: 'Failed to confirm tailoring',
          details: error instanceof Error ? error.message : 'Unknown error',
          correlationId,
        });
      }
    },
  });

  // ===========================================================================
  // POST /api/v1/resumes/:id/enhance - Generic Enhancement
  // ===========================================================================
  fastify.post('/api/v1/resumes/:id/enhance', {
    preHandler: requireAuth,
    handler: async (request, reply) => {
      const correlationId = randomUUID();
      const { id } = request.params as { id: string };
      const { type, options } = request.body as { type: string; options?: any };

      console.log(`✨ [${correlationId}] Generic enhancement: ${id}, type: ${type}`);

      try {
        const user = request.user;
        if (!user) {
          return reply.code(401).send({ success: false, error: 'Unauthorized' });
        }

        const resume = await db.resume.findFirst({
          where: { id, userId: user.id },
        });

        if (!resume) {
          return reply.code(404).send({
            success: false,
            error: 'Resume not found',
          });
        }

        // For now, generic enhancement just regenerates PDF with current data
        // Can be extended later for keyword optimization, ATS optimization, etc.

        return reply.send({
          success: true,
          message: 'Generic enhancement feature coming soon',
          correlationId,
        });
      } catch (error) {
        console.error(`❌ [${correlationId}] Generic enhancement error:`, error);

        return reply.code(500).send({
          success: false,
          error: 'Failed to enhance resume',
          details: error instanceof Error ? error.message : 'Unknown error',
          correlationId,
        });
      }
    },
  });

  // ===========================================================================
  // GET /api/v1/resumes/:id/metadata - Read RMS Metadata from PDF
  // ===========================================================================
  fastify.get('/api/v1/resumes/:id/metadata', {
    preHandler: requireAuth,
    handler: async (request, reply) => {
      const correlationId = randomUUID();
      const { id } = request.params as { id: string };

      console.log(`📄 [${correlationId}] Read metadata from resume: ${id}`);

      try {
        const user = request.user;
        if (!user) {
          return reply.code(401).send({ success: false, error: 'Unauthorized' });
        }

        const resume = await db.resume.findFirst({
          where: { id, userId: user.id },
        });

        if (!resume || !resume.s3Key) {
          return reply.code(404).send({
            success: false,
            error: 'Resume not found or not uploaded',
          });
        }

        // Download PDF from S3
        const s3Client = s3Service as any;
        const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3');

        const client = new S3Client({
          region: process.env.AWS_REGION || 'us-east-1',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          },
        });

        const command = new GetObjectCommand({
          Bucket: resume.s3Bucket!,
          Key: resume.s3Key,
        });

        const response = await client.send(command);
        const pdfBuffer = Buffer.from(await response.Body!.transformToByteArray());

        // Extract RMS metadata
        const metadata = await metadataReaderService.extractRMSMetadata(pdfBuffer);

        console.log(`✅ [${correlationId}] Metadata extracted`);

        return reply.send({
          success: true,
          metadata,
          correlationId,
        });
      } catch (error) {
        console.error(`❌ [${correlationId}] Read metadata error:`, error);

        return reply.code(500).send({
          success: false,
          error: 'Failed to read metadata',
          details: error instanceof Error ? error.message : 'Unknown error',
          correlationId,
        });
      }
    },
  });

  // ===========================================================================
  // GET /api/v1/resumes/:id/versions - Get Version History
  // ===========================================================================
  fastify.get('/api/v1/resumes/:id/versions', {
    preHandler: requireAuth,
    handler: async (request, reply) => {
      const correlationId = randomUUID();
      const { id } = request.params as { id: string };

      console.log(`📚 [${correlationId}] Get version history: ${id}`);

      try {
        const user = request.user;
        if (!user) {
          return reply.code(401).send({ success: false, error: 'Unauthorized' });
        }

        // Verify resume ownership
        const resume = await db.resume.findFirst({
          where: { id, userId: user.id },
        });

        if (!resume) {
          return reply.code(404).send({
            success: false,
            error: 'Resume not found',
          });
        }

        // Get version history
        const history = await versioningService.getVersionHistory(id);

        return reply.send({
          success: true,
          history,
          correlationId,
        });
      } catch (error) {
        console.error(`❌ [${correlationId}] Get versions error:`, error);

        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch version history',
          details: error instanceof Error ? error.message : 'Unknown error',
          correlationId,
        });
      }
    },
  });

  // ===========================================================================
  // GET /api/v1/resumes/:id/analyze/:jobId - Analyze Job Fit
  // ===========================================================================
  fastify.get('/api/v1/resumes/:id/analyze/:jobId', {
    preHandler: requireAuth,
    handler: async (request, reply) => {
      const correlationId = randomUUID();
      const { id, jobId } = request.params as { id: string; jobId: string };

      console.log(`🔍 [${correlationId}] Analyze job fit: resume ${id} vs job ${jobId}`);

      try {
        const user = request.user;
        if (!user) {
          return reply.code(401).send({ success: false, error: 'Unauthorized' });
        }

        // Get resume
        const resume = await db.resume.findFirst({
          where: { id, userId: user.id },
        });

        if (!resume) {
          return reply.code(404).send({
            success: false,
            error: 'Resume not found',
          });
        }

        // Get job posting
        const jobPosting = await db.jobPosting.findUnique({
          where: { id: jobId },
        });

        if (!jobPosting) {
          return reply.code(404).send({
            success: false,
            error: 'Job posting not found',
          });
        }

        // Analyze job fit
        const analysis = await jobMatchingService.analyzeJobFit(
          jobPosting as any,
          resume.content as any
        );

        console.log(`✅ [${correlationId}] Job fit analysis complete: ${analysis.overallMatchScore}% match`);

        return reply.send({
          success: true,
          analysis,
          correlationId,
        });
      } catch (error) {
        console.error(`❌ [${correlationId}] Analyze job fit error:`, error);

        return reply.code(500).send({
          success: false,
          error: 'Failed to analyze job fit',
          details: error instanceof Error ? error.message : 'Unknown error',
          correlationId,
        });
      }
    },
  });
};

export default resumeRoutes;

