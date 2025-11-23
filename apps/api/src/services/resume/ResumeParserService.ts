/**
 * @fileoverview Resume Parser Service for PDF and DOCX files
 * @description Extracts text and basic structure from resume files
 * @version 1.0.0
 * @author JobSwipe Team
 */

import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { PDFDocument } from 'pdf-lib';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface ParsedResume {
  rawText: string;
  pageCount: number;
  metadata: ResumeMetadata;
  sections?: ResumeSections;
  extractionMethod: 'pdf' | 'docx';
  quality: ParseQuality;
}

export interface ResumeMetadata {
  title?: string;
  author?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  pageCount: number;
  fileSize: number;
  hasRMSMetadata?: boolean; // Check if RMS metadata exists
  rmsVersion?: string;
}

export interface ResumeSections {
  contact?: string;
  summary?: string;
  experience?: string;
  education?: string;
  skills?: string;
  certifications?: string;
  projects?: string;
  [key: string]: string | undefined;
}

export interface ParseQuality {
  score: number; // 0-100
  issues: string[];
  warnings: string[];
  hasImages: boolean;
  hasFormatting: boolean;
  isScanned: boolean; // Scanned PDF (would need OCR)
}

export interface ParserOptions {
  extractImages?: boolean;
  parseMetadata?: boolean;
  detectRMS?: boolean;
  maxPages?: number;
}

// =============================================================================
// RESUME PARSER SERVICE CLASS
// =============================================================================

export class ResumeParserService {
  private maxPages: number;
  private maxFileSize: number; // bytes

  constructor() {
    this.maxPages = parseInt(process.env.MAX_RESUME_PAGES || '10', 10);
    this.maxFileSize = parseInt(process.env.MAX_RESUME_SIZE || '10485760', 10); // 10MB

    console.log(`📄 ResumeParserService initialized:`, {
      maxPages: this.maxPages,
      maxFileSize: `${(this.maxFileSize / 1024 / 1024).toFixed(2)}MB`,
    });
  }

  // ===========================================================================
  // MAIN PARSING METHODS
  // ===========================================================================

  /**
   * Parse resume file (auto-detect type)
   */
  async parseResume(fileBuffer: Buffer, fileName: string, options: ParserOptions = {}): Promise<ParsedResume> {
    const startTime = Date.now();

    try {
      // Validate file size
      if (fileBuffer.length > this.maxFileSize) {
        throw new Error(
          `File size ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(this.maxFileSize / 1024 / 1024).toFixed(2)}MB`
        );
      }

      // Determine file type from extension
      const fileType = this.detectFileType(fileName, fileBuffer);

      console.log(`📄 Parsing ${fileType.toUpperCase()} resume: ${fileName}`);

      let result: ParsedResume;

      if (fileType === 'pdf') {
        result = await this.parsePDF(fileBuffer, options);
      } else if (fileType === 'docx') {
        result = await this.parseDOCX(fileBuffer, options);
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      const duration = Date.now() - startTime;
      console.log(`✅ Resume parsed successfully in ${duration}ms`, {
        fileName,
        pageCount: result.pageCount,
        textLength: result.rawText.length,
        quality: result.quality.score,
      });

      return result;
    } catch (error) {
      console.error(`❌ Failed to parse resume:`, error);
      throw new Error(`Resume parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse PDF resume
   */
  private async parsePDF(fileBuffer: Buffer, options: ParserOptions = {}): Promise<ParsedResume> {
    try {
      // Parse PDF using pdf-parse (use .default for CommonJS module)
      const pdfData = await (pdfParse as any).default(fileBuffer);

      // Extract metadata using pdf-lib for more detailed info
      let pdfDoc: PDFDocument | null = null;
      let metadata: ResumeMetadata = {
        pageCount: pdfData.numpages,
        fileSize: fileBuffer.length,
      };

      try {
        pdfDoc = await PDFDocument.load(fileBuffer);
        metadata = await this.extractPDFMetadata(pdfDoc, fileBuffer.length);
      } catch (metaError) {
        console.warn('Failed to extract detailed PDF metadata:', metaError);
      }

      // Check for RMS metadata if requested
      if (options.detectRMS && pdfDoc) {
        const rmsInfo = await this.detectRMSMetadata(pdfDoc);
        metadata.hasRMSMetadata = rmsInfo.hasRMS;
        metadata.rmsVersion = rmsInfo.version;
      }

      // Validate page count
      if (pdfData.numpages > this.maxPages) {
        throw new Error(`Resume has ${pdfData.numpages} pages, maximum allowed is ${this.maxPages}`);
      }

      // Clean and extract text
      const rawText = this.cleanText(pdfData.text);

      // Perform basic section extraction
      const sections = this.extractBasicSections(rawText);

      // Analyze quality
      const quality = this.analyzeParseQuality(rawText, pdfData);

      return {
        rawText,
        pageCount: pdfData.numpages,
        metadata,
        sections,
        extractionMethod: 'pdf',
        quality,
      };
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse DOCX resume
   */
  private async parseDOCX(fileBuffer: Buffer, options: ParserOptions = {}): Promise<ParsedResume> {
    try {
      // Parse DOCX using mammoth
      const result = await mammoth.extractRawText({ buffer: fileBuffer });

      if (result.messages.length > 0) {
        console.warn('DOCX parsing warnings:', result.messages);
      }

      // Clean text
      const rawText = this.cleanText(result.value);

      // Estimate page count (rough estimate: 3000 chars per page)
      const pageCount = Math.ceil(rawText.length / 3000);

      // Basic metadata
      const metadata: ResumeMetadata = {
        pageCount,
        fileSize: fileBuffer.length,
        creator: 'Microsoft Word',
      };

      // Extract sections
      const sections = this.extractBasicSections(rawText);

      // Analyze quality
      const quality = this.analyzeParseQuality(rawText, { numpages: pageCount });

      return {
        rawText,
        pageCount,
        metadata,
        sections,
        extractionMethod: 'docx',
        quality,
      };
    } catch (error) {
      console.error('DOCX parsing error:', error);
      throw new Error(`DOCX parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===========================================================================
  // METADATA EXTRACTION
  // ===========================================================================

  /**
   * Extract detailed PDF metadata using pdf-lib
   */
  private async extractPDFMetadata(pdfDoc: PDFDocument, fileSize: number): Promise<ResumeMetadata> {
    const metadata: ResumeMetadata = {
      pageCount: pdfDoc.getPageCount(),
      fileSize,
    };

    try {
      const title = pdfDoc.getTitle();
      const author = pdfDoc.getAuthor();
      const creator = pdfDoc.getCreator();
      const producer = pdfDoc.getProducer();
      const creationDate = pdfDoc.getCreationDate();
      const modificationDate = pdfDoc.getModificationDate();

      if (title) metadata.title = title;
      if (author) metadata.author = author;
      if (creator) metadata.creator = creator;
      if (producer) metadata.producer = producer;
      if (creationDate) metadata.creationDate = creationDate;
      if (modificationDate) metadata.modificationDate = modificationDate;
    } catch (error) {
      console.warn('Some PDF metadata fields could not be extracted:', error);
    }

    return metadata;
  }

  /**
   * Detect RMS (Resume Metadata Standard) in PDF
   */
  private async detectRMSMetadata(pdfDoc: PDFDocument): Promise<{ hasRMS: boolean; version?: string }> {
    try {
      const producer = pdfDoc.getProducer();

      if (producer && producer.includes('rms_v')) {
        // Extract version
        const versionMatch = producer.match(/rms_v([\d.]+)/);
        return {
          hasRMS: true,
          version: versionMatch ? versionMatch[1] : undefined,
        };
      }

      return { hasRMS: false };
    } catch (error) {
      console.warn('Failed to detect RMS metadata:', error);
      return { hasRMS: false };
    }
  }

  // ===========================================================================
  // TEXT PROCESSING
  // ===========================================================================

  /**
   * Clean extracted text
   */
  private cleanText(text: string): string {
    return (
      text
        // Remove multiple spaces
        .replace(/[ \t]+/g, ' ')
        // Remove excessive newlines (more than 2)
        .replace(/\n{3,}/g, '\n\n')
        // Trim each line
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
        // Trim overall
        .trim()
    );
  }

  /**
   * Extract basic resume sections using keywords
   */
  private extractBasicSections(text: string): ResumeSections {
    const sections: ResumeSections = {};

    // Common section headers (case-insensitive)
    const sectionPatterns = {
      contact: /^(contact|contact\s+information|personal\s+information)/im,
      summary: /^(summary|profile|professional\s+summary|objective|about\s+me)/im,
      experience: /^(experience|work\s+experience|employment\s+history|professional\s+experience)/im,
      education: /^(education|academic\s+background|qualifications)/im,
      skills: /^(skills|technical\s+skills|core\s+competencies|expertise)/im,
      certifications: /^(certifications|certificates|licenses)/im,
      projects: /^(projects|portfolio|key\s+projects)/im,
    };

    // Split into lines
    const lines = text.split('\n');

    let currentSection: string | null = null;
    let sectionContent: string[] = [];

    for (const line of lines) {
      // Check if line is a section header
      let isHeader = false;
      for (const [sectionName, pattern] of Object.entries(sectionPatterns)) {
        if (pattern.test(line)) {
          // Save previous section
          if (currentSection && sectionContent.length > 0) {
            sections[currentSection] = sectionContent.join('\n').trim();
          }

          // Start new section
          currentSection = sectionName;
          sectionContent = [];
          isHeader = true;
          break;
        }
      }

      // Add content to current section
      if (!isHeader && currentSection) {
        sectionContent.push(line);
      }
    }

    // Save last section
    if (currentSection && sectionContent.length > 0) {
      sections[currentSection] = sectionContent.join('\n').trim();
    }

    return sections;
  }

  // ===========================================================================
  // QUALITY ANALYSIS
  // ===========================================================================

  /**
   * Analyze parsing quality and detect issues
   */
  private analyzeParseQuality(text: string, pdfData: any): ParseQuality {
    const issues: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Check text length
    if (text.length < 100) {
      issues.push('Very little text extracted (possible scanned PDF or parsing error)');
      score -= 50;
    } else if (text.length < 500) {
      warnings.push('Limited text extracted');
      score -= 20;
    }

    // Check for gibberish or encoding issues
    const gibberishRatio = this.detectGibberish(text);
    if (gibberishRatio > 0.3) {
      issues.push('High gibberish content detected (encoding issues?)');
      score -= 30;
    } else if (gibberishRatio > 0.1) {
      warnings.push('Some gibberish characters detected');
      score -= 10;
    }

    // Check for scanned PDF indicators
    const isScanned = this.isLikelyScanned(text, pdfData);
    if (isScanned) {
      issues.push('Document appears to be scanned - OCR required for accurate extraction');
      score -= 40;
    }

    // Check for common resume elements
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
    const hasPhone = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);

    if (!hasEmail && !hasPhone) {
      warnings.push('No contact information detected');
      score -= 15;
    }

    return {
      score: Math.max(0, score),
      issues,
      warnings,
      hasImages: false, // Would need image extraction
      hasFormatting: true, // Assume PDF has formatting
      isScanned,
    };
  }

  /**
   * Detect gibberish or encoding issues
   */
  private detectGibberish(text: string): number {
    const totalChars = text.length;
    if (totalChars === 0) return 0;

    // Count non-standard characters
    const nonStandardChars = text.match(/[^\x20-\x7E\n\r\t]/g) || [];
    return nonStandardChars.length / totalChars;
  }

  /**
   * Detect if PDF is likely a scanned image
   */
  private isLikelyScanned(text: string, pdfData: any): boolean {
    // Very low text-to-page ratio suggests scanned document
    const avgTextPerPage = text.length / (pdfData.numpages || 1);
    return avgTextPerPage < 200; // Less than 200 chars per page
  }

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================

  /**
   * Detect file type from filename and magic bytes
   */
  private detectFileType(fileName: string, fileBuffer: Buffer): 'pdf' | 'docx' {
    // Check file extension
    const ext = fileName.toLowerCase().split('.').pop();

    if (ext === 'pdf') {
      // Verify PDF magic bytes: %PDF
      if (fileBuffer.slice(0, 4).toString() === '%PDF') {
        return 'pdf';
      }
    }

    if (ext === 'docx' || ext === 'doc') {
      // Verify DOCX magic bytes: PK (ZIP format)
      if (fileBuffer.slice(0, 2).toString('hex') === '504b') {
        return 'docx';
      }
    }

    throw new Error(`Unsupported or corrupted file type: ${ext}`);
  }

  /**
   * Validate file before parsing
   */
  async validateFile(fileBuffer: Buffer, fileName: string): Promise<{ valid: boolean; error?: string }> {
    try {
      // Check file size
      if (fileBuffer.length === 0) {
        return { valid: false, error: 'File is empty' };
      }

      if (fileBuffer.length > this.maxFileSize) {
        return {
          valid: false,
          error: `File size ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(this.maxFileSize / 1024 / 1024).toFixed(2)}MB`,
        };
      }

      // Check file type
      try {
        this.detectFileType(fileName, fileBuffer);
      } catch (error) {
        return { valid: false, error: error instanceof Error ? error.message : 'Invalid file type' };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      };
    }
  }

  /**
   * Extract text preview (first N characters)
   */
  extractPreview(text: string, maxLength: number = 500): string {
    if (text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength) + '...';
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

// Singleton instance
let resumeParserService: ResumeParserService | null = null;

/**
 * Get singleton instance of Resume Parser Service
 */
export function getResumeParserService(): ResumeParserService {
  if (!resumeParserService) {
    resumeParserService = new ResumeParserService();
  }
  return resumeParserService;
}

export default ResumeParserService;
