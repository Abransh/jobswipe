/**
 * @fileoverview RMS Metadata Reader Service
 * @description Extracts and parses RMS v2 metadata from PDF files
 * @version 1.0.0
 * @author JobSwipe Team
 * @critical This is the REVERSE of RMSMetadataGenerator - reads what we wrote
 */

import { PDFDocument, PDFName, PDFStream } from 'pdf-lib';
import xml2js from 'xml2js';
import { StructuredResume, ContactInfo, WorkExperience, Education, Skills, DateInfo } from './ResumeStructurerService';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface ExtractedRMSMetadata {
  version: string;
  schemaUrl: string;
  hasMetadata: boolean;
  flatMetadata: Record<string, string>;
  structuredData: StructuredResume | null;
  extractionErrors: string[];
}

// =============================================================================
// METADATA READER SERVICE CLASS
// =============================================================================

export class MetadataReaderService {
  private readonly RMS_PREFIX = 'rms:';
  private readonly EXPECTED_VERSION_PREFIX = 'rms_v';

  constructor() {
    console.log(`📖 MetadataReaderService initialized`);
  }

  // ===========================================================================
  // MAIN EXTRACTION METHOD
  // ===========================================================================

  /**
   * Extract RMS metadata from PDF buffer
   */
  async extractRMSMetadata(pdfBuffer: Buffer): Promise<ExtractedRMSMetadata> {
    const errors: string[] = [];

    try {
      console.log(`🔍 Extracting RMS metadata from PDF...`);

      // Load PDF
      const pdfDoc = await PDFDocument.load(pdfBuffer);

      // Check Producer field first (quick check)
      const producer = pdfDoc.getProducer();
      const hasRMS = producer !== undefined && producer.includes(this.EXPECTED_VERSION_PREFIX);

      if (!hasRMS) {
        console.warn('PDF does not contain RMS metadata in Producer field');
        return {
          version: '',
          schemaUrl: '',
          hasMetadata: false,
          flatMetadata: {},
          structuredData: null,
          extractionErrors: ['No RMS metadata found in PDF'],
        };
      }

      // Extract XMP metadata stream
      const xmpXml = await this.extractXMPStream(pdfDoc);

      if (!xmpXml) {
        errors.push('Could not extract XMP stream from PDF');
        return {
          version: producer || '',
          schemaUrl: '',
          hasMetadata: false,
          flatMetadata: {},
          structuredData: null,
          extractionErrors: errors,
        };
      }

      console.log(`✓ XMP stream extracted (${xmpXml.length} characters)`);

      // Parse XML to flat metadata
      const flatMetadata = await this.parseXMPtoFlat(xmpXml);

      console.log(`✓ Parsed ${Object.keys(flatMetadata).length} metadata fields`);

      // Convert flat metadata to structured resume
      const structuredData = this.flatToStructured(flatMetadata);

      console.log(`✅ RMS metadata extracted successfully`);

      return {
        version: flatMetadata['Producer'] || producer || '',
        schemaUrl: flatMetadata['rms_schema_details'] || '',
        hasMetadata: true,
        flatMetadata,
        structuredData,
        extractionErrors: errors,
      };
    } catch (error) {
      console.error(`❌ Failed to extract RMS metadata:`, error);
      errors.push(error instanceof Error ? error.message : 'Unknown error');

      return {
        version: '',
        schemaUrl: '',
        hasMetadata: false,
        flatMetadata: {},
        structuredData: null,
        extractionErrors: errors,
      };
    }
  }

  /**
   * Quick check if PDF has RMS metadata
   */
  async hasRMSMetadata(pdfBuffer: Buffer): Promise<boolean> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const producer = pdfDoc.getProducer();
      return producer !== undefined && producer.includes(this.EXPECTED_VERSION_PREFIX);
    } catch {
      return false;
    }
  }

  // ===========================================================================
  // XMP EXTRACTION
  // ===========================================================================

  /**
   * Extract XMP metadata stream from PDF
   */
  private async extractXMPStream(pdfDoc: PDFDocument): Promise<string | null> {
    try {
      // Access PDF catalog
      const catalog = pdfDoc.catalog;

      // Get Metadata reference
      const metadataRef = catalog.lookup(PDFName.of('Metadata'));

      if (!metadataRef) {
        console.warn('No /Metadata entry in PDF catalog');
        return null;
      }

      // Get metadata stream
      const metadataStream = pdfDoc.context.lookup(metadataRef);

      if (!metadataStream || !(metadataStream instanceof PDFStream)) {
        console.warn('Metadata is not a stream');
        return null;
      }

      // Decode stream content
      const xmpBytes = metadataStream.getContents();
      const xmpXml = new TextDecoder('utf-8').decode(xmpBytes);

      return xmpXml;
    } catch (error) {
      console.error('Failed to extract XMP stream:', error);
      return null;
    }
  }

  // ===========================================================================
  // XML PARSING
  // ===========================================================================

  /**
   * Parse XMP XML to flat key-value metadata
   */
  private async parseXMPtoFlat(xmpXml: string): Promise<Record<string, string>> {
    try {
      const parser = new xml2js.Parser({
        explicitArray: false,
        mergeAttrs: true,
        tagNameProcessors: [xml2js.processors.stripPrefix],
      });

      const result = await parser.parseStringPromise(xmpXml);

      const flatMetadata: Record<string, string> = {};

      // Navigate XML structure to find RDF Description
      const xmpmeta = result?.xmpmeta || result;
      const rdf = xmpmeta?.RDF || xmpmeta?.['rdf:RDF'];
      const description = rdf?.Description || rdf?.['rdf:Description'];

      if (!description) {
        console.warn('Could not find rdf:Description in XMP');
        return flatMetadata;
      }

      // Extract all properties
      Object.entries(description).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number') {
          // Remove namespace prefix if present (rms:rms_contact_email -> rms_contact_email)
          const cleanKey = key.replace(/^rms:/, '');
          flatMetadata[cleanKey] = String(value);
        }
      });

      return flatMetadata;
    } catch (error) {
      console.error('Failed to parse XMP XML:', error);
      return {};
    }
  }

  // ===========================================================================
  // FLAT TO STRUCTURED CONVERSION
  // ===========================================================================

  /**
   * Convert flat RMS metadata back to StructuredResume format
   * This is the CORE LOGIC - reverses what RMSMetadataGenerator does
   */
  private flatToStructured(flatMetadata: Record<string, string>): StructuredResume {
    return {
      contact: this.extractContact(flatMetadata),
      summary: flatMetadata['rms_summary'] || undefined,
      experience: this.extractExperience(flatMetadata),
      education: this.extractEducation(flatMetadata),
      skills: this.extractSkills(flatMetadata),
      certifications: this.extractCertifications(flatMetadata),
      projects: this.extractProjects(flatMetadata),
      awards: this.extractAwards(flatMetadata),
      publications: this.extractPublications(flatMetadata),
      languages: this.extractLanguages(flatMetadata),
      references: this.extractReferences(flatMetadata),
      metadata: {
        model: 'rms_extracted',
        version: flatMetadata['Producer'] || 'unknown',
        structuredAt: new Date().toISOString(),
        confidence: 100, // Metadata is already structured
        warnings: [],
        processingTime: 0,
      },
    };
  }

  /**
   * Extract contact information
   */
  private extractContact(meta: Record<string, string>): ContactInfo {
    return {
      fullName: meta['rms_contact_fullName'] || '',
      email: meta['rms_contact_email'] || undefined,
      phone: meta['rms_contact_phone'] || undefined,
      location: {
        city: meta['rms_contact_city'] || undefined,
        state: meta['rms_contact_state'] || undefined,
        country: meta['rms_contact_country'] || undefined,
        countryCode: meta['rms_contact_countryCode'] || undefined,
      },
      linkedin: meta['rms_contact_linkedin'] || undefined,
      github: meta['rms_contact_github'] || undefined,
      portfolio: meta['rms_contact_portfolio'] || undefined,
      website: meta['rms_contact_website'] || undefined,
    };
  }

  /**
   * Extract work experience array
   */
  private extractExperience(meta: Record<string, string>): WorkExperience[] {
    const count = parseInt(meta['rms_experience_count'] || '0', 10);
    const experiences: WorkExperience[] = [];

    for (let i = 0; i < count; i++) {
      const prefix = `rms_experience_${i}_`;

      experiences.push({
        company: meta[`${prefix}company`] || '',
        role: meta[`${prefix}role`] || '',
        location: meta[`${prefix}location`] || undefined,
        startDate: this.extractDate(meta, prefix, 'dateBegin'),
        endDate: meta[`${prefix}isCurrent`] === 'true' ? undefined : this.extractDate(meta, prefix, 'dateEnd'),
        isCurrent: meta[`${prefix}isCurrent`] === 'true',
        description: meta[`${prefix}description`] || '',
        highlights: undefined, // Not stored in RMS v2
      });
    }

    return experiences;
  }

  /**
   * Extract education array
   */
  private extractEducation(meta: Record<string, string>): Education[] {
    const count = parseInt(meta['rms_education_count'] || '0', 10);
    const education: Education[] = [];

    for (let i = 0; i < count; i++) {
      const prefix = `rms_education_${i}_`;

      education.push({
        institution: meta[`${prefix}institution`] || '',
        degree: meta[`${prefix}qualification`] || '',
        field: meta[`${prefix}field`] || undefined,
        location: meta[`${prefix}location`] || undefined,
        graduationDate: this.extractDate(meta, prefix, 'date'),
        gpa: meta[`${prefix}score`] ? parseFloat(meta[`${prefix}score`]) : undefined,
        honors: meta[`${prefix}honors`] || undefined,
        isGraduate: meta[`${prefix}isGraduate`] === 'true',
        description: meta[`${prefix}description`] || undefined,
      });
    }

    return education;
  }

  /**
   * Extract skills
   */
  private extractSkills(meta: Record<string, string>): Skills {
    const count = parseInt(meta['rms_skill_count'] || '0', 10);
    const skills: Skills = {
      categories: {},
    };

    for (let i = 0; i < count; i++) {
      const prefix = `rms_skill_${i}_`;
      const category = meta[`${prefix}category`];
      const keywords = meta[`${prefix}keywords`];

      if (category && keywords) {
        const keywordArray = keywords.split(',').map((k) => k.trim());

        // Map to standard categories
        if (category === 'Technical') {
          skills.technical = keywordArray;
        } else if (category === 'Frameworks') {
          skills.frameworks = keywordArray;
        } else if (category === 'Tools') {
          skills.tools = keywordArray;
        } else if (category === 'Soft Skills') {
          skills.soft = keywordArray;
        } else if (category === 'Programming Languages') {
          skills.languages = keywordArray;
        } else {
          // Custom category
          if (!skills.categories) skills.categories = {};
          skills.categories[category] = keywordArray;
        }
      }
    }

    return skills;
  }

  /**
   * Extract certifications
   */
  private extractCertifications(meta: Record<string, string>) {
    const count = parseInt(meta['rms_certification_count'] || '0', 10);
    if (count === 0) return undefined;

    const certifications = [];

    for (let i = 0; i < count; i++) {
      const prefix = `rms_certification_${i}_`;

      certifications.push({
        name: meta[`${prefix}name`] || '',
        issuer: meta[`${prefix}issuer`] || '',
        date: this.extractDate(meta, prefix, 'date'),
        expirationDate: undefined, // Not commonly stored
        credentialId: meta[`${prefix}credentialId`] || undefined,
        url: meta[`${prefix}url`] || undefined,
      });
    }

    return certifications;
  }

  /**
   * Extract projects
   */
  private extractProjects(meta: Record<string, string>) {
    const count = parseInt(meta['rms_project_count'] || '0', 10);
    if (count === 0) return undefined;

    const projects = [];

    for (let i = 0; i < count; i++) {
      const prefix = `rms_project_${i}_`;

      projects.push({
        name: meta[`${prefix}name`] || '',
        description: meta[`${prefix}description`] || '',
        role: meta[`${prefix}role`] || undefined,
        technologies: meta[`${prefix}technologies`]?.split(',').map((t) => t.trim()) || undefined,
        url: meta[`${prefix}url`] || undefined,
        startDate: this.extractDate(meta, prefix, 'dateBegin'),
        endDate: this.extractDate(meta, prefix, 'dateEnd'),
      });
    }

    return projects;
  }

  /**
   * Extract awards
   */
  private extractAwards(meta: Record<string, string>) {
    const count = parseInt(meta['rms_award_count'] || '0', 10);
    if (count === 0) return undefined;

    const awards = [];

    for (let i = 0; i < count; i++) {
      const prefix = `rms_award_${i}_`;

      awards.push({
        name: meta[`${prefix}name`] || '',
        issuer: meta[`${prefix}issuer`] || '',
        date: this.extractDate(meta, prefix, 'date'),
        description: meta[`${prefix}description`] || undefined,
      });
    }

    return awards;
  }

  /**
   * Extract publications
   */
  private extractPublications(meta: Record<string, string>) {
    const count = parseInt(meta['rms_publication_count'] || '0', 10);
    if (count === 0) return undefined;

    const publications = [];

    for (let i = 0; i < count; i++) {
      const prefix = `rms_publication_${i}_`;

      publications.push({
        title: meta[`${prefix}title`] || '',
        publisher: meta[`${prefix}publisher`] || '',
        date: this.extractDate(meta, prefix, 'date'),
        url: meta[`${prefix}url`] || undefined,
        authors: meta[`${prefix}authors`]?.split(',').map((a) => a.trim()) || undefined,
      });
    }

    return publications;
  }

  /**
   * Extract languages
   */
  private extractLanguages(meta: Record<string, string>) {
    const count = parseInt(meta['rms_language_count'] || '0', 10);
    if (count === 0) return undefined;

    const languages = [];

    for (let i = 0; i < count; i++) {
      const prefix = `rms_language_${i}_`;

      languages.push({
        name: meta[`${prefix}name`] || '',
        proficiency: (meta[`${prefix}proficiency`] || 'intermediate') as any,
      });
    }

    return languages;
  }

  /**
   * Extract references
   */
  private extractReferences(meta: Record<string, string>) {
    const count = parseInt(meta['rms_reference_count'] || '0', 10);
    if (count === 0) return undefined;

    const references = [];

    for (let i = 0; i < count; i++) {
      const prefix = `rms_reference_${i}_`;

      references.push({
        name: meta[`${prefix}name`] || '',
        title: meta[`${prefix}title`] || undefined,
        company: meta[`${prefix}company`] || undefined,
        email: meta[`${prefix}email`] || undefined,
        phone: meta[`${prefix}phone`] || undefined,
        relationship: meta[`${prefix}relationship`] || undefined,
      });
    }

    return references;
  }

  // ===========================================================================
  // DATE PARSING
  // ===========================================================================

  /**
   * Extract date from metadata fields
   */
  private extractDate(meta: Record<string, string>, prefix: string, fieldName: string): DateInfo | undefined {
    const formatted = meta[`${prefix}${fieldName}`];
    if (!formatted) return undefined;

    const format = meta[`${prefix}${fieldName}Format`];
    const timestamp = meta[`${prefix}${fieldName}TS`];

    const dateInfo: DateInfo = {
      formatted,
    };

    // Parse timestamp
    if (timestamp) {
      const ts = parseInt(timestamp, 10);
      dateInfo.timestamp = ts;

      const date = new Date(ts);
      dateInfo.year = date.getFullYear();
      dateInfo.month = date.getMonth() + 1;
    }

    return dateInfo;
  }

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================

  /**
   * Get specific section from metadata
   */
  async getSection(
    pdfBuffer: Buffer,
    section: 'experience' | 'education' | 'skills' | 'contact'
  ): Promise<any> {
    const extracted = await this.extractRMSMetadata(pdfBuffer);

    if (!extracted.structuredData) {
      return null;
    }

    return extracted.structuredData[section];
  }

  /**
   * Validate extracted metadata
   */
  validateExtraction(extracted: ExtractedRMSMetadata): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!extracted.hasMetadata) {
      errors.push('No RMS metadata found');
    }

    if (!extracted.structuredData) {
      errors.push('Failed to parse structured data');
    }

    if (extracted.structuredData) {
      if (!extracted.structuredData.contact.fullName) {
        errors.push('Missing contact full name');
      }

      if (extracted.structuredData.experience.length === 0) {
        errors.push('No work experience found');
      }

      if (extracted.structuredData.education.length === 0) {
        errors.push('No education found');
      }
    }

    return {
      valid: errors.length === 0,
      errors: [...errors, ...extracted.extractionErrors],
    };
  }

  /**
   * Compare extracted metadata with database record
   */
  async verifyIntegrity(pdfBuffer: Buffer, dbContent: any): Promise<{ matches: boolean; differences: string[] }> {
    const extracted = await this.extractRMSMetadata(pdfBuffer);
    const differences: string[] = [];

    if (!extracted.structuredData || !dbContent) {
      differences.push('Missing data for comparison');
      return { matches: false, differences };
    }

    // Compare contact
    if (extracted.structuredData.contact.fullName !== dbContent.contact?.fullName) {
      differences.push('Contact name mismatch');
    }

    // Compare experience count
    if (extracted.structuredData.experience.length !== (dbContent.experience?.length || 0)) {
      differences.push('Experience count mismatch');
    }

    // Compare education count
    if (extracted.structuredData.education.length !== (dbContent.education?.length || 0)) {
      differences.push('Education count mismatch');
    }

    return {
      matches: differences.length === 0,
      differences,
    };
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

// Singleton instance
let metadataReaderService: MetadataReaderService | null = null;

/**
 * Get singleton instance of Metadata Reader Service
 */
export function getMetadataReaderService(): MetadataReaderService {
  if (!metadataReaderService) {
    metadataReaderService = new MetadataReaderService();
  }
  return metadataReaderService;
}

export default MetadataReaderService;
