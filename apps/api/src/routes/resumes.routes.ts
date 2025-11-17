/**
 * @fileoverview Resume Routes with Full Processing Pipeline
 * @description Complete resume management API with S3, parsing, AI structuring, and RMS
 * @version 2.0.0
 * @author JobSwipe Team
 */

import { FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'crypto';
import { getResumeManagementService } from '../services/resume/ResumeManagementService';
import { requireAuth } from '../middleware/auth.middleware';

// =============================================================================
// RESUME ROUTES PLUGIN
// =============================================================================

export const resumeRoutes: FastifyPluginAsync = async (fastify) => {
  const resumeService = getResumeManagementService();

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
};

export default resumeRoutes;
