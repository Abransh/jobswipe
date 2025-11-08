// /**
//  * @fileoverview Resume Routes with S3 Upload Integration
//  * @description Handles resume upload, management, and S3 storage
//  * @version 1.0.0
//  * @author JobSwipe Team
//  * @security Enterprise-grade file handling and validation
//  */

// import { FastifyPluginAsync } from 'fastify';
// import { z } from 'zod';
// import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
// import { randomUUID } from 'crypto';
// import path from 'path';
// import { db } from '@jobswipe/database';

// // =============================================================================
// // S3 CLIENT CONFIGURATION
// // =============================================================================

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION || 'us-east-1',
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
//   },
// });

// const S3_BUCKET = process.env.AWS_S3_BUCKET || 'jobswipe-resumes';
// const S3_REGION = process.env.AWS_REGION || 'us-east-1';

// // =============================================================================
// // VALIDATION SCHEMAS
// // =============================================================================

// const ResumeMetadataSchema = z.object({
//   name: z.string().min(1, 'Resume name is required').max(255),
//   isDefault: z.boolean().default(false),
// });

// // =============================================================================
// // UTILITY FUNCTIONS
// // =============================================================================

// /**
//  * Validate file type and size
//  */
// function validateResumeFile(file: any): {
//   valid: boolean;
//   error?: string;
// } {
//   const allowedMimeTypes = [
//     'application/pdf',
//     'application/msword',
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//   ];

//   const allowedExtensions = ['.pdf', '.doc', '.docx'];

//   const maxSize = 5 * 1024 * 1024; // 5MB

//   // Check if file exists
//   if (!file) {
//     return { valid: false, error: 'No file provided' };
//   }

//   // Check file size
//   if (file.size > maxSize) {
//     return {
//       valid: false,
//       error: `File size exceeds maximum of 5MB (${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
//     };
//   }

//   // Check MIME type
//   if (!allowedMimeTypes.includes(file.mimetype)) {
//     return {
//       valid: false,
//       error: `Invalid file type: ${file.mimetype}. Only PDF, DOC, and DOCX files are allowed.`,
//     };
//   }

//   // Check file extension
//   const ext = path.extname(file.filename).toLowerCase();
//   if (!allowedExtensions.includes(ext)) {
//     return {
//       valid: false,
//       error: `Invalid file extension: ${ext}. Only .pdf, .doc, and .docx files are allowed.`,
//     };
//   }

//   return { valid: true };
// }

// /**
//  * Generate S3 key for resume
//  */
// function generateS3Key(userId: string, fileName: string): string {
//   const fileExt = path.extname(fileName).toLowerCase();
//   const timestamp = Date.now();
//   const randomId = randomUUID().split('-')[0];
//   return `resumes/${userId}/${timestamp}-${randomId}${fileExt}`;
// }

// /**
//  * Get public S3 URL
//  */
// function getS3Url(key: string): string {
//   return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
// }

// /**
//  * Upload file to S3
//  */
// async function uploadToS3(
//   file: any,
//   userId: string
// ): Promise<{ url: string; key: string; fileSize: number }> {
//   const key = generateS3Key(userId, file.filename);

//   // Convert buffer to Uint8Array
//   const fileBuffer = await file.toBuffer();

//   const command = new PutObjectCommand({
//     Bucket: S3_BUCKET,
//     Key: key,
//     Body: fileBuffer,
//     ContentType: file.mimetype,
//     Metadata: {
//       userId,
//       uploadedAt: new Date().toISOString(),
//       originalName: file.filename,
//     },
//     ServerSideEncryption: 'AES256', // Enable server-side encryption
//   });

//   await s3Client.send(command);

//   return {
//     url: getS3Url(key),
//     key,
//     fileSize: file.size,
//   };
// }

// /**
//  * Delete file from S3
//  */
// async function deleteFromS3(key: string): Promise<void> {
//   const command = new DeleteObjectCommand({
//     Bucket: S3_BUCKET,
//     Key: key,
//   });

//   await s3Client.send(command);
// }

// /**
//  * Extract user from authenticated request
//  */
// function getAuthenticatedUser(request: any) {
//   if (!request.user?.id) {
//     throw new Error('User not authenticated');
//   }
//   return request.user;
// }

// // =============================================================================
// // RESUME ROUTES PLUGIN
// // =============================================================================

// const resumeRoutes: FastifyPluginAsync = async (fastify) => {
//   // ==========================================================================
//   // POST /api/v1/resumes/upload - Upload Resume to S3
//   // ==========================================================================
//   fastify.post('/api/v1/resumes/upload', {
//     preHandler: fastify.auth([fastify.verifyJWT]),
//     handler: async (request, reply) => {
//       const correlationId = randomUUID();
//       console.log(`📤 [${correlationId}] Resume upload request started`);

//       try {
//         const user = getAuthenticatedUser(request);
//         console.log(`👤 [${correlationId}] User authenticated:`, user.email);

//         // Get uploaded file from multipart form
//         const data = await request.file();

//         if (!data) {
//           console.error(`❌ [${correlationId}] No file in request`);
//           return reply.code(400).send({
//             success: false,
//             error: 'No file uploaded',
//             errorCode: 'NO_FILE',
//           });
//         }

//         // Validate file
//         const validation = validateResumeFile(data);
//         if (!validation.valid) {
//           console.error(`❌ [${correlationId}] File validation failed:`, validation.error);
//           return reply.code(400).send({
//             success: false,
//             error: validation.error,
//             errorCode: 'INVALID_FILE',
//           });
//         }

//         // Extract metadata
//         const { name, isDefault } = data.fields as any;

//         if (!name || typeof name.value !== 'string' || name.value.trim() === '') {
//           console.error(`❌ [${correlationId}] Missing resume name`);
//           return reply.code(400).send({
//             success: false,
//             error: 'Resume name is required',
//             errorCode: 'MISSING_NAME',
//           });
//         }

//         const resumeName = name.value;
//         const setAsDefault = isDefault?.value === 'true';

//         console.log(`📝 [${correlationId}] Upload metadata:`, {
//           fileName: data.filename,
//           fileSize: data.file.bytesRead,
//           resumeName,
//           setAsDefault,
//         });

//         // Upload to S3
//         console.log(`☁️ [${correlationId}] Uploading to S3...`);
//         const s3Result = await uploadToS3(data, user.id);

//         console.log(`✅ [${correlationId}] S3 upload successful:`, {
//           url: s3Result.url,
//           key: s3Result.key,
//         });

//         // If setting as default, unset other defaults
//         if (setAsDefault) {
//           await db.resume.updateMany({
//             where: {
//               userId: user.id,
//               isDefault: true,
//             },
//             data: {
//               isDefault: false,
//             },
//           });
//         }

//         // Create resume record in database
//         const resume = await db.resume.create({
//           data: {
//             userId: user.id,
//             name: resumeName,
//             pdfUrl: s3Result.url,
//             fileSize: s3Result.fileSize,
//             isDefault: setAsDefault,
//             content: {}, // Empty for now, can be parsed later
//             sections: {}, // Empty for now
//             metadata: {
//               s3Key: s3Result.key,
//               originalFileName: data.filename,
//               uploadedAt: new Date().toISOString(),
//             },
//             version: 1,
//           },
//         });

//         console.log(`✅ [${correlationId}] Resume record created:`, resume.id);

//         return reply.send({
//           success: true,
//           message: 'Resume uploaded successfully',
//           resume: {
//             id: resume.id,
//             name: resume.name,
//             pdfUrl: resume.pdfUrl,
//             fileSize: resume.fileSize,
//             isDefault: resume.isDefault,
//             createdAt: resume.createdAt,
//           },
//           correlationId,
//         });
//       } catch (error) {
//         console.error(`❌ [${correlationId}] Resume upload error:`, error);

//         return reply.code(500).send({
//           success: false,
//           error: 'Failed to upload resume',
//           details: error instanceof Error ? error.message : 'Unknown error',
//           errorCode: 'UPLOAD_FAILED',
//           correlationId,
//         });
//       }
//     },
//   });

//   // ==========================================================================
//   // GET /api/v1/resumes - Get User's Resumes
//   // ==========================================================================
//   fastify.get('/api/v1/resumes', {
//     preHandler: fastify.auth([fastify.verifyJWT]),
//     handler: async (request, reply) => {
//       const correlationId = randomUUID();

//       try {
//         const user = getAuthenticatedUser(request);

//         const resumes = await db.resume.findMany({
//           where: { userId: user.id },
//           orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
//           select: {
//             id: true,
//             name: true,
//             title: true,
//             pdfUrl: true,
//             docxUrl: true,
//             htmlUrl: true,
//             fileSize: true,
//             pageCount: true,
//             isDefault: true,
//             aiEnhanced: true,
//             completeness: true,
//             readabilityScore: true,
//             keywordMatch: true,
//             applicationCount: true,
//             createdAt: true,
//             updatedAt: true,
//             _count: {
//               select: {
//                 applications: true,
//               },
//             },
//           },
//         });

//         return reply.send({
//           success: true,
//           resumes,
//           total: resumes.length,
//           correlationId,
//         });
//       } catch (error) {
//         console.error(`❌ [${correlationId}] Get resumes error:`, error);

//         return reply.code(500).send({
//           success: false,
//           error: 'Failed to fetch resumes',
//           details: error instanceof Error ? error.message : 'Unknown error',
//           correlationId,
//         });
//       }
//     },
//   });

//   // ==========================================================================
//   // GET /api/v1/resumes/:id - Get Specific Resume
//   // ==========================================================================
//   fastify.get('/api/v1/resumes/:id', {
//     preHandler: fastify.auth([fastify.verifyJWT]),
//     handler: async (request, reply) => {
//       const correlationId = randomUUID();
//       const { id } = request.params as { id: string };

//       try {
//         const user = getAuthenticatedUser(request);

//         const resume = await db.resume.findFirst({
//           where: {
//             id,
//             userId: user.id,
//           },
//           include: {
//             template: true,
//             _count: {
//               select: {
//                 applications: true,
//                 enhancements: true,
//               },
//             },
//           },
//         });

//         if (!resume) {
//           return reply.code(404).send({
//             success: false,
//             error: 'Resume not found',
//             errorCode: 'NOT_FOUND',
//           });
//         }

//         return reply.send({
//           success: true,
//           resume,
//           correlationId,
//         });
//       } catch (error) {
//         console.error(`❌ [${correlationId}] Get resume error:`, error);

//         return reply.code(500).send({
//           success: false,
//           error: 'Failed to fetch resume',
//           details: error instanceof Error ? error.message : 'Unknown error',
//           correlationId,
//         });
//       }
//     },
//   });

//   // ==========================================================================
//   // DELETE /api/v1/resumes/:id - Delete Resume
//   // ==========================================================================
//   fastify.delete('/api/v1/resumes/:id', {
//     preHandler: fastify.auth([fastify.verifyJWT]),
//     handler: async (request, reply) => {
//       const correlationId = randomUUID();
//       const { id } = request.params as { id: string };

//       try {
//         const user = getAuthenticatedUser(request);

//         // Get resume to ensure it belongs to user and get S3 key
//         const resume = await db.resume.findFirst({
//           where: {
//             id,
//             userId: user.id,
//           },
//         });

//         if (!resume) {
//           return reply.code(404).send({
//             success: false,
//             error: 'Resume not found',
//             errorCode: 'NOT_FOUND',
//           });
//         }

//         // Delete from S3 if key exists
//         if (resume.metadata && typeof resume.metadata === 'object' && 's3Key' in resume.metadata) {
//           const s3Key = (resume.metadata as any).s3Key;
//           if (s3Key) {
//             try {
//               await deleteFromS3(s3Key);
//               console.log(`🗑️ [${correlationId}] Deleted from S3:`, s3Key);
//             } catch (s3Error) {
//               console.warn(`⚠️ [${correlationId}] Failed to delete from S3:`, s3Error);
//               // Continue with database deletion even if S3 deletion fails
//             }
//           }
//         }

//         // Delete from database
//         await db.resume.delete({
//           where: { id },
//         });

//         console.log(`✅ [${correlationId}] Resume deleted:`, id);

//         return reply.send({
//           success: true,
//           message: 'Resume deleted successfully',
//           correlationId,
//         });
//       } catch (error) {
//         console.error(`❌ [${correlationId}] Delete resume error:`, error);

//         return reply.code(500).send({
//           success: false,
//           error: 'Failed to delete resume',
//           details: error instanceof Error ? error.message : 'Unknown error',
//           correlationId,
//         });
//       }
//     },
//   });

//   // ==========================================================================
//   // PATCH /api/v1/resumes/:id/default - Set Resume as Default
//   // ==========================================================================
//   fastify.patch('/api/v1/resumes/:id/default', {
//     preHandler: fastify.auth([fastify.verifyJWT]),
//     handler: async (request, reply) => {
//       const correlationId = randomUUID();
//       const { id } = request.params as { id: string };

//       try {
//         const user = getAuthenticatedUser(request);

//         // Verify resume belongs to user
//         const resume = await db.resume.findFirst({
//           where: {
//             id,
//             userId: user.id,
//           },
//         });

//         if (!resume) {
//           return reply.code(404).send({
//             success: false,
//             error: 'Resume not found',
//             errorCode: 'NOT_FOUND',
//           });
//         }

//         // Unset other defaults
//         await db.resume.updateMany({
//           where: {
//             userId: user.id,
//             isDefault: true,
//           },
//           data: {
//             isDefault: false,
//           },
//         });

//         // Set this resume as default
//         const updatedResume = await db.resume.update({
//           where: { id },
//           data: {
//             isDefault: true,
//           },
//         });

//         console.log(`✅ [${correlationId}] Resume set as default:`, id);

//         return reply.send({
//           success: true,
//           message: 'Resume set as default',
//           resume: updatedResume,
//           correlationId,
//         });
//       } catch (error) {
//         console.error(`❌ [${correlationId}] Set default resume error:`, error);

//         return reply.code(500).send({
//           success: false,
//           error: 'Failed to set default resume',
//           details: error instanceof Error ? error.message : 'Unknown error',
//           correlationId,
//         });
//       }
//     },
//   });
// };

// export default resumeRoutes;
