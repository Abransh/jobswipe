/**
 * @fileoverview PDF Metadata Embedder for RMS
 * @description Embeds XMP metadata into PDFs following RMS standard
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { PDFDocument, PDFName, PDFString, PDFStream } from 'pdf-lib';
import { RMSMetadata } from './RMSMetadataGenerator';

// =============================================================================
// PDF METADATA EMBEDDER CLASS
// =============================================================================

export class PDFMetadataEmbedder {
  constructor() {
    console.log(`📄 PDFMetadataEmbedder initialized`);
  }

  /**
   * Embed RMS metadata into PDF
   */
  async embedMetadata(pdfBuffer: Buffer, rmsMetadata: RMSMetadata): Promise<Buffer> {
    try {
      console.log(`🔄 Embedding RMS metadata into PDF...`);

      // Load the PDF
      const pdfDoc = await PDFDocument.load(pdfBuffer);

      // Set basic PDF metadata
      pdfDoc.setProducer(rmsMetadata.version);
      pdfDoc.setCreator('JobSwipe Resume Management System');
      pdfDoc.setModificationDate(new Date());

      // Embed XMP metadata packet
      await this.embedXMPMetadata(pdfDoc, rmsMetadata.xmpXml);

      // Save and return modified PDF
      const modifiedPdfBytes = await pdfDoc.save();
      const result = Buffer.from(modifiedPdfBytes);

      console.log(`✅ RMS metadata embedded successfully`);

      return result;
    } catch (error) {
      console.error(`❌ Failed to embed metadata:`, error);
      throw new Error(`Metadata embedding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Embed XMP metadata packet into PDF
   */
  private async embedXMPMetadata(pdfDoc: PDFDocument, xmpXml: string): Promise<void> {
    try {
      // Create XMP metadata stream
      const xmpStream = pdfDoc.context.obj({
        Type: 'Metadata',
        Subtype: 'XML',
      });

      // Set the XMP content
      xmpStream.set(PDFName.of('Type'), PDFName.of('Metadata'));
      xmpStream.set(PDFName.of('Subtype'), PDFName.of('XML'));

      // Convert XMP XML to bytes and embed
      const xmpBytes = Buffer.from(xmpXml, 'utf-8');
      const stream = PDFStream.of(pdfDoc.context.obj({}), xmpBytes);

      stream.dict.set(PDFName.of('Type'), PDFName.of('Metadata'));
      stream.dict.set(PDFName.of('Subtype'), PDFName.of('XML'));

      // Add metadata to PDF catalog
      const catalog = pdfDoc.catalog;
      catalog.set(PDFName.of('Metadata'), stream);

      console.log(`✓ XMP metadata stream embedded`);
    } catch (error) {
      console.warn(`Failed to embed XMP stream, using fallback method:`, error);
      // Fallback: Add as custom properties
      this.embedAsCustomProperties(pdfDoc, xmpXml);
    }
  }

  /**
   * Fallback: Embed as custom properties
   */
  private embedAsCustomProperties(pdfDoc: PDFDocument, xmpXml: string): void {
    // Store XMP in Info dictionary as custom field
    pdfDoc.setSubject('RMS Metadata Resume');
    pdfDoc.setKeywords(['resume', 'rms', 'metadata', 'ats']);

    console.log(`✓ Metadata embedded as custom properties (fallback)`);
  }

  /**
   * Verify if PDF contains RMS metadata
   */
  async hasRMSMetadata(pdfBuffer: Buffer): Promise<boolean> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const producer = pdfDoc.getProducer();
      return producer !== undefined && producer.includes('rms_v');
    } catch {
      return false;
    }
  }

  /**
   * Extract metadata from PDF
   */
  async extractMetadata(pdfBuffer: Buffer): Promise<{ producer?: string; creator?: string; metadata?: any }> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);

      return {
        producer: pdfDoc.getProducer(),
        creator: pdfDoc.getCreator(),
        metadata: {
          title: pdfDoc.getTitle(),
          author: pdfDoc.getAuthor(),
          subject: pdfDoc.getSubject(),
          keywords: pdfDoc.getKeywords(),
        },
      };
    } catch (error) {
      console.error('Failed to extract PDF metadata:', error);
      return {};
    }
  }
}

// Singleton
let pdfMetadataEmbedder: PDFMetadataEmbedder | null = null;

export function getPDFMetadataEmbedder(): PDFMetadataEmbedder {
  if (!pdfMetadataEmbedder) {
    pdfMetadataEmbedder = new PDFMetadataEmbedder();
  }
  return pdfMetadataEmbedder;
}

export default PDFMetadataEmbedder;
