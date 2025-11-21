/**
 * @fileoverview PDF Generator Service - Rebuild PDFs from Structured Data
 * @description Generate professional PDFs from StructuredResume after AI enhancement
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from 'pdf-lib';
import {
  StructuredResume,
  WorkExperience,
  Education,
  Skills,
  Certification,
  Project,
} from './ResumeStructurerService';
import { TailoredResume } from './ResumeEnhancerService';
import { RMSMetadata } from './RMSMetadataGenerator';
import { getPDFMetadataEmbedder } from './PDFMetadataEmbedder';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

/**
 * PDF generation options
 */
export interface PDFOptions {
  template: 'modern' | 'classic' | 'minimal' | 'creative';
  fontSize: number;
  lineHeight: number;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  colors: {
    primary: string; // Hex color for headings
    secondary: string; // Hex color for subheadings
    text: string; // Hex color for body text
  };
  includeMetadata: boolean;
  embedRMS: boolean;
}

/**
 * Resume template definition
 */
export interface ResumeTemplate {
  name: string;
  defaultOptions: PDFOptions;
  renderFunction: (resume: StructuredResume, doc: PDFDocument, fonts: TemplateFonts, options: PDFOptions) => Promise<PDFDocument>;
}

/**
 * Fonts used in template
 */
export interface TemplateFonts {
  heading: PDFFont;
  subheading: PDFFont;
  body: PDFFont;
  bold: PDFFont;
}

// =============================================================================
// PDF GENERATOR SERVICE CLASS
// =============================================================================

export class PDFGeneratorService {
  private pdfEmbedder = getPDFMetadataEmbedder();

  constructor() {
    console.log('📄 PDFGeneratorService initialized');
  }

  // ===========================================================================
  // MAIN GENERATION METHODS
  // ===========================================================================

  /**
   * Generate PDF from structured resume
   */
  async generatePDFFromStructured(
    resume: StructuredResume | TailoredResume,
    options?: Partial<PDFOptions>
  ): Promise<Buffer> {
    console.log(`📄 Generating PDF for: ${resume.contact.fullName}`);

    const opts = this.getDefaultOptions(options);

    try {
      // Create new PDF document
      const pdfDoc = await PDFDocument.create();

      // Load fonts
      const fonts = await this.loadFonts(pdfDoc);

      // Apply template
      const template = this.getTemplate(opts.template);
      await template.renderFunction(resume, pdfDoc, fonts, opts);

      // Add PDF metadata
      pdfDoc.setTitle(`Resume - ${resume.contact.fullName}`);
      pdfDoc.setAuthor(resume.contact.fullName);
      pdfDoc.setSubject('Professional Resume');
      pdfDoc.setKeywords(['resume', 'cv', 'job application']);
      pdfDoc.setCreator('JobSwipe Resume Generator');
      pdfDoc.setProducer('JobSwipe Platform');

      // Save PDF
      const pdfBytes = await pdfDoc.save();

      console.log(`✅ PDF generated (${pdfBytes.length} bytes)`);

      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Regenerate PDF with RMS metadata embedded
   */
  async regenerateWithMetadata(resume: StructuredResume, rmsMetadata: RMSMetadata): Promise<Buffer> {
    console.log(`📄 Generating PDF with RMS metadata for: ${resume.contact.fullName}`);

    // Generate base PDF
    const pdfBuffer = await this.generatePDFFromStructured(resume, { embedRMS: false });

    // Embed RMS metadata
    const enhancedBuffer = await this.pdfEmbedder.embedMetadata(pdfBuffer, rmsMetadata);

    console.log(`✅ PDF regenerated with RMS metadata`);

    return enhancedBuffer;
  }

  /**
   * Create thumbnail from PDF
   */
  async createThumbnail(pdfBuffer: Buffer, width: number = 200): Promise<Buffer> {
    // Note: Creating actual image thumbnails requires additional libraries like pdf-to-img
    // For now, return a placeholder or the first page as a smaller PDF
    console.log('📸 Creating PDF thumbnail...');

    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const thumbnailDoc = await PDFDocument.create();

      // Copy first page only
      const [firstPage] = await thumbnailDoc.copyPages(pdfDoc, [0]);
      thumbnailDoc.addPage(firstPage);

      const thumbnailBytes = await thumbnailDoc.save();
      console.log(`✅ Thumbnail created (${thumbnailBytes.length} bytes)`);

      return Buffer.from(thumbnailBytes);
    } catch (error) {
      console.error('Failed to create thumbnail:', error);
      throw new Error(`Failed to create thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===========================================================================
  // TEMPLATE MANAGEMENT
  // ===========================================================================

  /**
   * Get template by name
   */
  private getTemplate(name: string): ResumeTemplate {
    const templates: Record<string, ResumeTemplate> = {
      modern: {
        name: 'Modern',
        defaultOptions: this.getDefaultOptions(),
        renderFunction: this.renderModernTemplate.bind(this),
      },
      classic: {
        name: 'Classic',
        defaultOptions: this.getDefaultOptions({ template: 'classic' }),
        renderFunction: this.renderClassicTemplate.bind(this),
      },
      minimal: {
        name: 'Minimal',
        defaultOptions: this.getDefaultOptions({ template: 'minimal' }),
        renderFunction: this.renderMinimalTemplate.bind(this),
      },
    };

    return templates[name] || templates.modern;
  }

  /**
   * Get default PDF options
   */
  private getDefaultOptions(overrides?: Partial<PDFOptions>): PDFOptions {
    return {
      template: 'modern',
      fontSize: 11,
      lineHeight: 1.5,
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
      colors: {
        primary: '#2563eb', // Blue
        secondary: '#64748b', // Slate
        text: '#1e293b', // Dark slate
      },
      includeMetadata: true,
      embedRMS: false,
      ...overrides,
    };
  }

  /**
   * Load fonts for PDF
   */
  private async loadFonts(pdfDoc: PDFDocument): Promise<TemplateFonts> {
    return {
      heading: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
      subheading: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
      body: await pdfDoc.embedFont(StandardFonts.Helvetica),
      bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    };
  }

  // ===========================================================================
  // TEMPLATE RENDERERS
  // ===========================================================================

  /**
   * Render Modern Template
   */
  private async renderModernTemplate(
    resume: StructuredResume,
    pdfDoc: PDFDocument,
    fonts: TemplateFonts,
    options: PDFOptions
  ): Promise<PDFDocument> {
    let page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();

    let yPosition = height - options.margins.top;
    const leftMargin = options.margins.left;
    const rightMargin = width - options.margins.right;
    const contentWidth = rightMargin - leftMargin;

    // Helper to add new page if needed
    const checkPageBreak = (neededSpace: number): void => {
      if (yPosition - neededSpace < options.margins.bottom) {
        page = pdfDoc.addPage([595, 842]);
        yPosition = height - options.margins.top;
      }
    };

    // 1. HEADER - Name and Contact
    page.drawText(resume.contact.fullName.toUpperCase(), {
      x: leftMargin,
      y: yPosition,
      size: 24,
      font: fonts.heading,
      color: this.hexToRgb(options.colors.primary),
    });
    yPosition -= 30;

    // Contact info
    const contactInfo = [
      resume.contact.email,
      resume.contact.phone,
      resume.contact.location?.city && resume.contact.location?.state
        ? `${resume.contact.location.city}, ${resume.contact.location.state}`
        : resume.contact.location?.city,
      resume.contact.linkedin,
      resume.contact.github,
    ].filter(Boolean).join(' • ');

    page.drawText(contactInfo, {
      x: leftMargin,
      y: yPosition,
      size: 10,
      font: fonts.body,
      color: this.hexToRgb(options.colors.secondary),
    });
    yPosition -= 30;

    // 2. SUMMARY
    if (resume.summary) {
      checkPageBreak(60);

      page.drawText('PROFESSIONAL SUMMARY', {
        x: leftMargin,
        y: yPosition,
        size: 14,
        font: fonts.heading,
        color: this.hexToRgb(options.colors.primary),
      });
      yPosition -= 20;

      const summaryLines = this.wrapText(resume.summary, contentWidth, fonts.body, options.fontSize);
      summaryLines.forEach(line => {
        checkPageBreak(15);
        page.drawText(line, {
          x: leftMargin,
          y: yPosition,
          size: options.fontSize,
          font: fonts.body,
          color: this.hexToRgb(options.colors.text),
        });
        yPosition -= options.fontSize * options.lineHeight;
      });
      yPosition -= 15;
    }

    // 3. SKILLS
    if (resume.skills) {
      checkPageBreak(60);

      page.drawText('SKILLS', {
        x: leftMargin,
        y: yPosition,
        size: 14,
        font: fonts.heading,
        color: this.hexToRgb(options.colors.primary),
      });
      yPosition -= 20;

      const skillCategories = [
        { label: 'Technical', skills: resume.skills.technical },
        { label: 'Languages', skills: resume.skills.languages },
        { label: 'Frameworks', skills: resume.skills.frameworks },
        { label: 'Tools', skills: resume.skills.tools },
      ].filter(cat => cat.skills && cat.skills.length > 0);

      skillCategories.forEach(category => {
        checkPageBreak(25);

        page.drawText(`${category.label}:`, {
          x: leftMargin,
          y: yPosition,
          size: options.fontSize,
          font: fonts.bold,
          color: this.hexToRgb(options.colors.text),
        });

        const skillsText = category.skills!.join(', ');
        const skillsLines = this.wrapText(skillsText, contentWidth - 100, fonts.body, options.fontSize);

        skillsLines.forEach((line, index) => {
          page.drawText(line, {
            x: leftMargin + 100,
            y: yPosition - (index * options.fontSize * options.lineHeight),
            size: options.fontSize,
            font: fonts.body,
            color: this.hexToRgb(options.colors.text),
          });
        });

        yPosition -= (skillsLines.length * options.fontSize * options.lineHeight) + 5;
      });

      yPosition -= 15;
    }

    // 4. EXPERIENCE
    if (resume.experience && resume.experience.length > 0) {
      checkPageBreak(60);

      page.drawText('PROFESSIONAL EXPERIENCE', {
        x: leftMargin,
        y: yPosition,
        size: 14,
        font: fonts.heading,
        color: this.hexToRgb(options.colors.primary),
      });
      yPosition -= 25;

      resume.experience.forEach(exp => {
        checkPageBreak(80);

        // Company and role
        page.drawText(exp.role, {
          x: leftMargin,
          y: yPosition,
          size: options.fontSize + 1,
          font: fonts.bold,
          color: this.hexToRgb(options.colors.text),
        });
        yPosition -= 15;

        // Company and dates
        const dateRange = `${exp.startDate.formatted} - ${exp.isCurrent ? 'Present' : exp.endDate?.formatted || ''}`;
        page.drawText(`${exp.company} | ${dateRange}`, {
          x: leftMargin,
          y: yPosition,
          size: options.fontSize,
          font: fonts.body,
          color: this.hexToRgb(options.colors.secondary),
        });
        yPosition -= 18;

        // Highlights
        if (exp.highlights && exp.highlights.length > 0) {
          exp.highlights.forEach(highlight => {
            checkPageBreak(30);

            const bulletLines = this.wrapText(highlight, contentWidth - 20, fonts.body, options.fontSize);

            bulletLines.forEach((line, index) => {
              if (index === 0) {
                page.drawText('•', {
                  x: leftMargin,
                  y: yPosition,
                  size: options.fontSize,
                  font: fonts.body,
                  color: this.hexToRgb(options.colors.text),
                });
              }

              page.drawText(line, {
                x: leftMargin + 15,
                y: yPosition,
                size: options.fontSize,
                font: fonts.body,
                color: this.hexToRgb(options.colors.text),
              });
              yPosition -= options.fontSize * options.lineHeight;
            });
          });
        }

        yPosition -= 10;
      });

      yPosition -= 10;
    }

    // 5. EDUCATION
    if (resume.education && resume.education.length > 0) {
      checkPageBreak(60);

      page.drawText('EDUCATION', {
        x: leftMargin,
        y: yPosition,
        size: 14,
        font: fonts.heading,
        color: this.hexToRgb(options.colors.primary),
      });
      yPosition -= 25;

      resume.education.forEach(edu => {
        checkPageBreak(50);

        // Degree
        page.drawText(`${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`, {
          x: leftMargin,
          y: yPosition,
          size: options.fontSize + 1,
          font: fonts.bold,
          color: this.hexToRgb(options.colors.text),
        });
        yPosition -= 15;

        // Institution and date
        const eduDate = edu.graduationDate?.formatted || '';
        page.drawText(`${edu.institution}${eduDate ? ` | ${eduDate}` : ''}`, {
          x: leftMargin,
          y: yPosition,
          size: options.fontSize,
          font: fonts.body,
          color: this.hexToRgb(options.colors.secondary),
        });
        yPosition -= 15;

        if (edu.gpa) {
          page.drawText(`GPA: ${edu.gpa}`, {
            x: leftMargin,
            y: yPosition,
            size: options.fontSize,
            font: fonts.body,
            color: this.hexToRgb(options.colors.text),
          });
          yPosition -= 15;
        }

        yPosition -= 10;
      });
    }

    // 6. CERTIFICATIONS
    if (resume.certifications && resume.certifications.length > 0) {
      checkPageBreak(60);

      page.drawText('CERTIFICATIONS', {
        x: leftMargin,
        y: yPosition,
        size: 14,
        font: fonts.heading,
        color: this.hexToRgb(options.colors.primary),
      });
      yPosition -= 25;

      resume.certifications.forEach(cert => {
        checkPageBreak(40);

        page.drawText(`${cert.name} - ${cert.issuer}`, {
          x: leftMargin,
          y: yPosition,
          size: options.fontSize,
          font: fonts.body,
          color: this.hexToRgb(options.colors.text),
        });
        yPosition -= 15;

        if (cert.date) {
          page.drawText(cert.date.formatted, {
            x: leftMargin,
            y: yPosition,
            size: options.fontSize - 1,
            font: fonts.body,
            color: this.hexToRgb(options.colors.secondary),
          });
          yPosition -= 15;
        }
      });
    }

    // 7. PROJECTS
    if (resume.projects && resume.projects.length > 0) {
      checkPageBreak(60);

      page.drawText('PROJECTS', {
        x: leftMargin,
        y: yPosition,
        size: 14,
        font: fonts.heading,
        color: this.hexToRgb(options.colors.primary),
      });
      yPosition -= 25;

      resume.projects.forEach(project => {
        checkPageBreak(60);

        page.drawText(project.name, {
          x: leftMargin,
          y: yPosition,
          size: options.fontSize + 1,
          font: fonts.bold,
          color: this.hexToRgb(options.colors.text),
        });
        yPosition -= 15;

        const descLines = this.wrapText(project.description, contentWidth, fonts.body, options.fontSize);
        descLines.forEach(line => {
          checkPageBreak(15);
          page.drawText(line, {
            x: leftMargin,
            y: yPosition,
            size: options.fontSize,
            font: fonts.body,
            color: this.hexToRgb(options.colors.text),
          });
          yPosition -= options.fontSize * options.lineHeight;
        });

        if (project.technologies && project.technologies.length > 0) {
          const techText = `Technologies: ${project.technologies.join(', ')}`;
          page.drawText(techText, {
            x: leftMargin,
            y: yPosition,
            size: options.fontSize - 1,
            font: fonts.body,
            color: this.hexToRgb(options.colors.secondary),
          });
          yPosition -= 15;
        }

        yPosition -= 10;
      });
    }

    return pdfDoc;
  }

  /**
   * Render Classic Template (placeholder - similar to modern for now)
   */
  private async renderClassicTemplate(
    resume: StructuredResume,
    pdfDoc: PDFDocument,
    fonts: TemplateFonts,
    options: PDFOptions
  ): Promise<PDFDocument> {
    // Use modern template for now - can be customized later
    return this.renderModernTemplate(resume, pdfDoc, fonts, options);
  }

  /**
   * Render Minimal Template (placeholder - similar to modern for now)
   */
  private async renderMinimalTemplate(
    resume: StructuredResume,
    pdfDoc: PDFDocument,
    fonts: TemplateFonts,
    options: PDFOptions
  ): Promise<PDFDocument> {
    // Use modern template for now - can be customized later
    return this.renderModernTemplate(resume, pdfDoc, fonts, options);
  }

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================

  /**
   * Wrap text to fit within width
   */
  private wrapText(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): ReturnType<typeof rgb> {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      return rgb(0, 0, 0); // Default to black
    }

    return rgb(
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    );
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

let pdfGeneratorService: PDFGeneratorService | null = null;

export function getPDFGeneratorService(): PDFGeneratorService {
  if (!pdfGeneratorService) {
    pdfGeneratorService = new PDFGeneratorService();
  }
  return pdfGeneratorService;
}

export default PDFGeneratorService;
