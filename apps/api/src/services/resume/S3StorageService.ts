/**
 * @fileoverview S3 Storage Service for Resume Management
 * @description Enterprise-grade S3 file storage with presigned URLs and security
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Implements least-privilege access and secure file handling
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import path from 'path';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface S3UploadOptions {
  userId: string;
  resumeId: string;
  fileName: string;
  fileBuffer: Buffer;
  contentType: string;
  metadata?: Record<string, string>;
}

export interface S3UploadResult {
  key: string;
  bucket: string;
  region: string;
  url: string;
  etag?: string;
  versionId?: string;
}

export interface S3DownloadOptions {
  key: string;
  expiresIn?: number; // seconds
}

export interface S3FileInfo {
  key: string;
  size: number;
  contentType: string;
  lastModified: Date;
  etag: string;
  metadata: Record<string, string>;
}

export type FileType = 'original' | 'enhanced' | 'markdown' | 'structured';

// =============================================================================
// S3 STORAGE SERVICE CLASS
// =============================================================================

export class S3StorageService {
  private s3Client: S3Client;
  private bucket: string;
  private region: string;
  private baseFolder: string;
  private presignedUrlExpiry: number;

  constructor() {
    // Initialize S3 client with credentials from environment
    this.region = process.env.AWS_REGION || process.env.S3_BUCKET_REGION || 'us-east-1';
    this.bucket = process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET || 'jobswipe-resumes';
    this.baseFolder = process.env.S3_RESUME_FOLDER || 'resumes';
    this.presignedUrlExpiry = parseInt(process.env.S3_PRESIGNED_URL_EXPIRY || '3600', 10);

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
      // Add retry configuration for production reliability
      maxAttempts: 3,
    });

    console.log(`📦 S3StorageService initialized:`, {
      bucket: this.bucket,
      region: this.region,
      baseFolder: this.baseFolder,
    });
  }

  // ===========================================================================
  // FILE UPLOAD OPERATIONS
  // ===========================================================================

  /**
   * Upload a resume file to S3
   * Structure: resumes/{userId}/{resumeId}/{fileType}.{ext}
   */
  async uploadResume(options: S3UploadOptions): Promise<S3UploadResult> {
    const { userId, resumeId, fileName, fileBuffer, contentType, metadata } = options;

    try {
      // Generate S3 key with folder structure
      const key = this.generateS3Key(userId, resumeId, 'original', fileName);

      console.log(`📤 Uploading resume to S3:`, {
        key,
        size: fileBuffer.length,
        contentType,
      });

      // Upload to S3 with metadata
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        ServerSideEncryption: 'AES256', // Enable server-side encryption
        Metadata: {
          userId,
          resumeId,
          originalFileName: fileName,
          uploadedAt: new Date().toISOString(),
          ...metadata,
        },
        // Set appropriate Content-Disposition for downloads
        ContentDisposition: `attachment; filename="${this.sanitizeFileName(fileName)}"`,
      });

      const response = await this.s3Client.send(command);

      console.log(`✅ Resume uploaded successfully:`, {
        key,
        etag: response.ETag,
      });

      return {
        key,
        bucket: this.bucket,
        region: this.region,
        url: this.getPublicUrl(key),
        etag: response.ETag,
        versionId: response.VersionId,
      };
    } catch (error) {
      console.error(`❌ Failed to upload resume to S3:`, error);
      throw new Error(`S3 upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload processed/enhanced resume version
   */
  async uploadProcessedResume(
    userId: string,
    resumeId: string,
    fileType: FileType,
    fileBuffer: Buffer,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<S3UploadResult> {
    try {
      const extension = this.getExtensionForType(fileType, contentType);
      const key = this.generateS3KeyForType(userId, resumeId, fileType, extension);

      console.log(`📤 Uploading ${fileType} version to S3:`, { key });

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        ServerSideEncryption: 'AES256',
        Metadata: {
          userId,
          resumeId,
          fileType,
          processedAt: new Date().toISOString(),
          ...metadata,
        },
      });

      const response = await this.s3Client.send(command);

      return {
        key,
        bucket: this.bucket,
        region: this.region,
        url: this.getPublicUrl(key),
        etag: response.ETag,
      };
    } catch (error) {
      console.error(`❌ Failed to upload ${fileType} resume:`, error);
      throw new Error(`S3 upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===========================================================================
  // FILE DOWNLOAD OPERATIONS
  // ===========================================================================

  /**
   * Generate presigned URL for secure, temporary download
   */
  async getPresignedDownloadUrl(key: string, expiresIn: number = this.presignedUrlExpiry): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });

      console.log(`🔗 Generated presigned URL for ${key} (expires in ${expiresIn}s)`);

      return url;
    } catch (error) {
      console.error(`❌ Failed to generate presigned URL:`, error);
      throw new Error(`Presigned URL generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download file from S3 as buffer
   */
  async downloadFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('File body is empty');
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error(`❌ Failed to download file from S3:`, error);
      throw new Error(`S3 download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file metadata without downloading
   */
  async getFileInfo(key: string): Promise<S3FileInfo> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      return {
        key,
        size: response.ContentLength || 0,
        contentType: response.ContentType || 'application/octet-stream',
        lastModified: response.LastModified || new Date(),
        etag: response.ETag || '',
        metadata: response.Metadata || {},
      };
    } catch (error) {
      console.error(`❌ Failed to get file info:`, error);
      throw new Error(`Failed to get file info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===========================================================================
  // FILE DELETION OPERATIONS
  // ===========================================================================

  /**
   * Delete a single file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      console.log(`🗑️ Deleted file from S3: ${key}`);
    } catch (error) {
      console.error(`❌ Failed to delete file from S3:`, error);
      throw new Error(`S3 deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete all files for a resume (all versions)
   */
  async deleteResumeFiles(userId: string, resumeId: string): Promise<void> {
    try {
      const prefix = `${this.baseFolder}/${userId}/${resumeId}/`;

      console.log(`🗑️ Deleting all files for resume: ${prefix}`);

      // List all objects with this prefix
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      });

      const listResponse = await this.s3Client.send(listCommand);

      if (!listResponse.Contents || listResponse.Contents.length === 0) {
        console.log(`No files found for resume ${resumeId}`);
        return;
      }

      // Delete all objects
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: {
          Objects: listResponse.Contents.map((obj) => ({ Key: obj.Key! })),
          Quiet: true,
        },
      });

      await this.s3Client.send(deleteCommand);
      console.log(`✅ Deleted ${listResponse.Contents.length} files for resume ${resumeId}`);
    } catch (error) {
      console.error(`❌ Failed to delete resume files:`, error);
      throw new Error(`S3 batch deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===========================================================================
  // FILE COPY OPERATIONS
  // ===========================================================================

  /**
   * Copy a file to a new location (for versioning)
   */
  async copyFile(sourceKey: string, destinationKey: string): Promise<S3UploadResult> {
    try {
      const command = new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${sourceKey}`,
        Key: destinationKey,
        ServerSideEncryption: 'AES256',
      });

      const response = await this.s3Client.send(command);

      console.log(`📋 Copied file: ${sourceKey} → ${destinationKey}`);

      return {
        key: destinationKey,
        bucket: this.bucket,
        region: this.region,
        url: this.getPublicUrl(destinationKey),
        etag: response.CopyObjectResult?.ETag,
      };
    } catch (error) {
      console.error(`❌ Failed to copy file:`, error);
      throw new Error(`S3 copy failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================

  /**
   * Generate S3 key for original upload
   */
  private generateS3Key(userId: string, resumeId: string, fileType: string, fileName: string): string {
    const extension = path.extname(fileName).toLowerCase();
    return `${this.baseFolder}/${userId}/${resumeId}/${fileType}${extension}`;
  }

  /**
   * Generate S3 key for processed files
   */
  private generateS3KeyForType(userId: string, resumeId: string, fileType: FileType, extension: string): string {
    return `${this.baseFolder}/${userId}/${resumeId}/${fileType}${extension}`;
  }

  /**
   * Get file extension based on file type and content type
   */
  private getExtensionForType(fileType: FileType, contentType: string): string {
    if (fileType === 'markdown') return '.md';
    if (fileType === 'structured') return '.json';
    if (contentType.includes('pdf')) return '.pdf';
    if (contentType.includes('docx') || contentType.includes('wordprocessingml')) return '.docx';
    return '.bin';
  }

  /**
   * Get public URL for S3 object (use presigned URLs in production!)
   */
  private getPublicUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Sanitize filename to prevent injection attacks
   */
  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars
      .replace(/_{2,}/g, '_') // Remove multiple underscores
      .substring(0, 255); // Limit length
  }

  /**
   * Validate S3 key format
   */
  public validateKey(key: string): boolean {
    // Check if key follows our structure
    const pattern = new RegExp(`^${this.baseFolder}/[a-f0-9-]+/[a-f0-9-]+/(original|enhanced|markdown|structured)\\.(pdf|docx|md|json)$`);
    return pattern.test(key);
  }

  /**
   * Extract resume ID from S3 key
   */
  public extractResumeId(key: string): string | null {
    const parts = key.split('/');
    if (parts.length >= 3) {
      return parts[2]; // resumes/{userId}/{resumeId}/...
    }
    return null;
  }

  /**
   * Check if file exists in S3
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      await this.getFileInfo(key);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get S3 client for advanced operations
   */
  public getClient(): S3Client {
    return this.s3Client;
  }

  /**
   * Get bucket configuration
   */
  public getConfig() {
    return {
      bucket: this.bucket,
      region: this.region,
      baseFolder: this.baseFolder,
      presignedUrlExpiry: this.presignedUrlExpiry,
    };
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

// Singleton instance
let s3StorageService: S3StorageService | null = null;

/**
 * Get singleton instance of S3 Storage Service
 */
export function getS3StorageService(): S3StorageService {
  if (!s3StorageService) {
    s3StorageService = new S3StorageService();
  }
  return s3StorageService;
}

export default S3StorageService;
