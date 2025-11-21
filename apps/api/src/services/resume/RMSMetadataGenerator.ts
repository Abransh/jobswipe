/**
 * @fileoverview RMS (Resume Metadata Standard) Generator
 * @description Generates XMP metadata following Rezi Resume Metadata Standard v2
 * @version 1.0.0
 * @author JobSwipe Team
 * @spec https://github.com/rezi-io/resume-standard
 */

import { StructuredResume, DateInfo } from './ResumeStructurerService';
import xml2js from 'xml2js';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface RMSMetadata {
  version: string;
  schemaUrl: string;
  xmpXml: string;
  fieldCount: number;
  sections: string[];
}

export interface RMSGenerationOptions {
  includeOptionalFields?: boolean;
  version?: string;
}

// =============================================================================
// RMS METADATA GENERATOR CLASS
// =============================================================================

export class RMSMetadataGenerator {
  private readonly RMS_VERSION = 'rms_v2.0.1';
  private readonly SCHEMA_URL = 'https://github.com/rezi-io/resume-standard';
  private readonly NAMESPACE = 'adobe:ns:meta/';

  constructor() {
    console.log(`📋 RMSMetadataGenerator initialized (version: ${this.RMS_VERSION})`);
  }

  // ===========================================================================
  // MAIN GENERATION METHOD
  // ===========================================================================

  /**
   * Generate RMS metadata from structured resume
   */
  async generateMetadata(resume: StructuredResume, options: RMSGenerationOptions = {}): Promise<RMSMetadata> {
    try {
      console.log(`🔄 Generating RMS metadata...`);

      // Build metadata key-value pairs
      const metadata: Record<string, string> = {};

      // Core RMS fields
      metadata['Producer'] = this.RMS_VERSION;
      metadata['rms_schema_details'] = this.SCHEMA_URL;

      // Contact information
      this.addContactMetadata(metadata, resume.contact);

      // Summary
      if (resume.summary) {
        metadata['rms_summary'] = this.sanitizeText(resume.summary);
      }

      // Experience
      this.addExperienceMetadata(metadata, resume.experience);

      // Education
      this.addEducationMetadata(metadata, resume.education);

      // Skills
      this.addSkillsMetadata(metadata, resume.skills);

      // Certifications
      if (resume.certifications) {
        this.addCertificationsMetadata(metadata, resume.certifications);
      }

      // Projects
      if (resume.projects) {
        this.addProjectsMetadata(metadata, resume.projects);
      }

      // Awards
      if (resume.awards) {
        this.addAwardsMetadata(metadata, resume.awards);
      }

      // Publications
      if (resume.publications) {
        this.addPublicationsMetadata(metadata, resume.publications);
      }

      // Languages
      if (resume.languages) {
        this.addLanguagesMetadata(metadata, resume.languages);
      }

      // References
      if (resume.references) {
        this.addReferencesMetadata(metadata, resume.references);
      }

      // Generate XMP XML
      const xmpXml = this.generateXMP(metadata);

      const result: RMSMetadata = {
        version: this.RMS_VERSION,
        schemaUrl: this.SCHEMA_URL,
        xmpXml,
        fieldCount: Object.keys(metadata).length,
        sections: this.getIncludedSections(metadata),
      };

      console.log(`✅ RMS metadata generated successfully`, {
        fieldCount: result.fieldCount,
        sections: result.sections,
      });

      return result;
    } catch (error) {
      console.error(`❌ Failed to generate RMS metadata:`, error);
      throw new Error(`RMS generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===========================================================================
  // SECTION-SPECIFIC METADATA GENERATORS
  // ===========================================================================

  /**
   * Add contact information metadata
   * Format: rms_contact_{field}
   */
  private addContactMetadata(metadata: Record<string, string>, contact: any): void {
    if (contact.fullName) {
      const nameParts = this.parseFullName(contact.fullName);
      metadata['rms_contact_fullName'] = contact.fullName;
      if (nameParts.givenNames) metadata['rms_contact_givenNames'] = nameParts.givenNames;
      if (nameParts.lastName) metadata['rms_contact_lastName'] = nameParts.lastName;
    }

    if (contact.email) metadata['rms_contact_email'] = contact.email;
    if (contact.phone) metadata['rms_contact_phone'] = contact.phone;

    if (contact.location) {
      if (contact.location.city) metadata['rms_contact_city'] = contact.location.city;
      if (contact.location.state) metadata['rms_contact_state'] = contact.location.state;
      if (contact.location.country) metadata['rms_contact_country'] = contact.location.country;
      if (contact.location.countryCode) metadata['rms_contact_countryCode'] = contact.location.countryCode;
    }

    if (contact.linkedin) metadata['rms_contact_linkedin'] = contact.linkedin;
    if (contact.github) metadata['rms_contact_github'] = contact.github;
    if (contact.portfolio) metadata['rms_contact_portfolio'] = contact.portfolio;
    if (contact.website) metadata['rms_contact_website'] = contact.website;
  }

  /**
   * Add work experience metadata
   * Format: rms_experience_{index}_{field}
   */
  private addExperienceMetadata(metadata: Record<string, string>, experience: any[]): void {
    if (!experience || experience.length === 0) return;

    metadata['rms_experience_count'] = experience.length.toString();

    experience.forEach((exp, index) => {
      const prefix = `rms_experience_${index}`;

      metadata[`${prefix}_company`] = exp.company;
      metadata[`${prefix}_role`] = exp.role;

      if (exp.location) metadata[`${prefix}_location`] = exp.location;

      // Start date
      if (exp.startDate) {
        this.addDateMetadata(metadata, prefix, 'dateBegin', exp.startDate);
      }

      // End date
      if (exp.endDate && !exp.isCurrent) {
        this.addDateMetadata(metadata, prefix, 'dateEnd', exp.endDate);
      }

      metadata[`${prefix}_isCurrent`] = exp.isCurrent ? 'true' : 'false';

      if (exp.description) {
        metadata[`${prefix}_description`] = this.sanitizeText(exp.description);
      }
    });
  }

  /**
   * Add education metadata
   * Format: rms_education_{index}_{field}
   */
  private addEducationMetadata(metadata: Record<string, string>, education: any[]): void {
    if (!education || education.length === 0) return;

    metadata['rms_education_count'] = education.length.toString();

    education.forEach((edu, index) => {
      const prefix = `rms_education_${index}`;

      metadata[`${prefix}_institution`] = edu.institution;
      metadata[`${prefix}_qualification`] = edu.degree;

      if (edu.field) metadata[`${prefix}_field`] = edu.field;
      if (edu.location) metadata[`${prefix}_location`] = edu.location;

      if (edu.graduationDate) {
        this.addDateMetadata(metadata, prefix, 'date', edu.graduationDate);
      }

      if (edu.gpa) metadata[`${prefix}_score`] = edu.gpa.toString();
      if (edu.gpa) metadata[`${prefix}_scoreType`] = 'GPA';

      metadata[`${prefix}_isGraduate`] = edu.isGraduate ? 'true' : 'false';

      if (edu.honors) metadata[`${prefix}_honors`] = edu.honors;
      if (edu.description) metadata[`${prefix}_description`] = this.sanitizeText(edu.description);
    });
  }

  /**
   * Add skills metadata
   * Format: rms_skill_{index}_{field}
   */
  private addSkillsMetadata(metadata: Record<string, string>, skills: any): void {
    if (!skills) return;

    const allSkills: Array<{ category: string; keywords: string[] }> = [];

    // Collect all skills with categories
    if (skills.technical) {
      allSkills.push({ category: 'Technical', keywords: skills.technical });
    }
    if (skills.frameworks) {
      allSkills.push({ category: 'Frameworks', keywords: skills.frameworks });
    }
    if (skills.tools) {
      allSkills.push({ category: 'Tools', keywords: skills.tools });
    }
    if (skills.soft) {
      allSkills.push({ category: 'Soft Skills', keywords: skills.soft });
    }
    if (skills.languages) {
      allSkills.push({ category: 'Programming Languages', keywords: skills.languages });
    }

    // Add custom categories
    if (skills.categories) {
      Object.entries(skills.categories).forEach(([category, keywords]) => {
        if (Array.isArray(keywords) && keywords.length > 0) {
          allSkills.push({ category, keywords });
        }
      });
    }

    if (allSkills.length === 0) return;

    metadata['rms_skill_count'] = allSkills.length.toString();

    allSkills.forEach((skill, index) => {
      const prefix = `rms_skill_${index}`;
      metadata[`${prefix}_category`] = skill.category;
      metadata[`${prefix}_keywords`] = skill.keywords.join(', ');
    });
  }

  /**
   * Add certifications metadata
   * Format: rms_certification_{index}_{field}
   */
  private addCertificationsMetadata(metadata: Record<string, string>, certifications: any[]): void {
    metadata['rms_certification_count'] = certifications.length.toString();

    certifications.forEach((cert, index) => {
      const prefix = `rms_certification_${index}`;

      metadata[`${prefix}_name`] = cert.name;
      metadata[`${prefix}_issuer`] = cert.issuer;

      if (cert.date) {
        this.addDateMetadata(metadata, prefix, 'date', cert.date);
      }

      if (cert.credentialId) metadata[`${prefix}_credentialId`] = cert.credentialId;
      if (cert.url) metadata[`${prefix}_url`] = cert.url;
    });
  }

  /**
   * Add projects metadata
   * Format: rms_project_{index}_{field}
   */
  private addProjectsMetadata(metadata: Record<string, string>, projects: any[]): void {
    metadata['rms_project_count'] = projects.length.toString();

    projects.forEach((project, index) => {
      const prefix = `rms_project_${index}`;

      metadata[`${prefix}_name`] = project.name;
      metadata[`${prefix}_description`] = this.sanitizeText(project.description);

      if (project.role) metadata[`${prefix}_role`] = project.role;
      if (project.technologies) metadata[`${prefix}_technologies`] = project.technologies.join(', ');
      if (project.url) metadata[`${prefix}_url`] = project.url;

      if (project.startDate) {
        this.addDateMetadata(metadata, prefix, 'dateBegin', project.startDate);
      }

      if (project.endDate) {
        this.addDateMetadata(metadata, prefix, 'dateEnd', project.endDate);
      }
    });
  }

  /**
   * Add awards metadata
   * Format: rms_award_{index}_{field}
   */
  private addAwardsMetadata(metadata: Record<string, string>, awards: any[]): void {
    metadata['rms_award_count'] = awards.length.toString();

    awards.forEach((award, index) => {
      const prefix = `rms_award_${index}`;

      metadata[`${prefix}_name`] = award.name;
      metadata[`${prefix}_issuer`] = award.issuer;

      if (award.date) {
        this.addDateMetadata(metadata, prefix, 'date', award.date);
      }

      if (award.description) metadata[`${prefix}_description`] = this.sanitizeText(award.description);
    });
  }

  /**
   * Add publications metadata
   * Format: rms_publication_{index}_{field}
   */
  private addPublicationsMetadata(metadata: Record<string, string>, publications: any[]): void {
    metadata['rms_publication_count'] = publications.length.toString();

    publications.forEach((pub, index) => {
      const prefix = `rms_publication_${index}`;

      metadata[`${prefix}_title`] = pub.title;
      metadata[`${prefix}_publisher`] = pub.publisher;

      if (pub.date) {
        this.addDateMetadata(metadata, prefix, 'date', pub.date);
      }

      if (pub.url) metadata[`${prefix}_url`] = pub.url;
      if (pub.authors) metadata[`${prefix}_authors`] = pub.authors.join(', ');
    });
  }

  /**
   * Add languages metadata
   * Format: rms_language_{index}_{field}
   */
  private addLanguagesMetadata(metadata: Record<string, string>, languages: any[]): void {
    metadata['rms_language_count'] = languages.length.toString();

    languages.forEach((lang, index) => {
      const prefix = `rms_language_${index}`;

      metadata[`${prefix}_name`] = lang.name;
      metadata[`${prefix}_proficiency`] = lang.proficiency;
    });
  }

  /**
   * Add references metadata
   * Format: rms_reference_{index}_{field}
   */
  private addReferencesMetadata(metadata: Record<string, string>, references: any[]): void {
    metadata['rms_reference_count'] = references.length.toString();

    references.forEach((ref, index) => {
      const prefix = `rms_reference_${index}`;

      metadata[`${prefix}_name`] = ref.name;

      if (ref.title) metadata[`${prefix}_title`] = ref.title;
      if (ref.company) metadata[`${prefix}_company`] = ref.company;
      if (ref.email) metadata[`${prefix}_email`] = ref.email;
      if (ref.phone) metadata[`${prefix}_phone`] = ref.phone;
      if (ref.relationship) metadata[`${prefix}_relationship`] = ref.relationship;
    });
  }

  // ===========================================================================
  // DATE HANDLING
  // ===========================================================================

  /**
   * Add date metadata with multiple formats
   */
  private addDateMetadata(metadata: Record<string, string>, prefix: string, fieldName: string, dateInfo: DateInfo): void {
    // Formatted string
    metadata[`${prefix}_${fieldName}`] = dateInfo.formatted;

    // Date format pattern
    metadata[`${prefix}_${fieldName}Format`] = this.inferDateFormat(dateInfo.formatted);

    // Unix timestamp (milliseconds)
    if (dateInfo.timestamp) {
      metadata[`${prefix}_${fieldName}TS`] = dateInfo.timestamp.toString();
    } else if (dateInfo.year) {
      // Generate timestamp from year/month
      const date = new Date(dateInfo.year, (dateInfo.month || 1) - 1, 1);
      metadata[`${prefix}_${fieldName}TS`] = date.getTime().toString();
    }
  }

  /**
   * Infer date format pattern
   */
  private inferDateFormat(dateString: string): string {
    // January 2023 -> MMMM YYYY
    if (/^[A-Za-z]+ \d{4}$/.test(dateString)) return 'MMMM YYYY';

    // Jan 2023 -> MMM YYYY
    if (/^[A-Za-z]{3} \d{4}$/.test(dateString)) return 'MMM YYYY';

    // 2023 -> YYYY
    if (/^\d{4}$/.test(dateString)) return 'YYYY';

    // 01/2023 -> MM/YYYY
    if (/^\d{2}\/\d{4}$/.test(dateString)) return 'MM/YYYY';

    // 2023-01 -> YYYY-MM
    if (/^\d{4}-\d{2}$/.test(dateString)) return 'YYYY-MM';

    return 'MMMM YYYY'; // Default
  }

  // ===========================================================================
  // XMP XML GENERATION
  // ===========================================================================

  /**
   * Generate XMP XML from metadata key-value pairs
   */
  private generateXMP(metadata: Record<string, string>): string {
    const builder = new xml2js.Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' },
      renderOpts: { pretty: true, indent: '  ' },
    });

    // Build XMP structure
    const xmp = {
      'x:xmpmeta': {
        $: {
          'xmlns:x': 'adobe:ns:meta/',
          'x:xmptk': 'JobSwipe RMS Generator 1.0',
        },
        'rdf:RDF': {
          $: {
            'xmlns:rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
            'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
            'xmlns:pdf': 'http://ns.adobe.com/pdf/1.3/',
            'xmlns:rms': 'http://rezi.io/rms/',
          },
          'rdf:Description': {
            $: {
              'rdf:about': '',
            },
            ...this.buildRDFProperties(metadata),
          },
        },
      },
    };

    return builder.buildObject(xmp);
  }

  /**
   * Build RDF properties from metadata
   */
  private buildRDFProperties(metadata: Record<string, string>): Record<string, any> {
    const properties: Record<string, any> = {};

    Object.entries(metadata).forEach(([key, value]) => {
      // Add each field as an RDF property
      properties[`rms:${key}`] = value;
    });

    return properties;
  }

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================

  /**
   * Parse full name into given names and last name
   */
  private parseFullName(fullName: string): { givenNames?: string; lastName?: string } {
    const parts = fullName.trim().split(/\s+/);

    if (parts.length === 1) {
      return { lastName: parts[0] };
    } else if (parts.length === 2) {
      return {
        givenNames: parts[0],
        lastName: parts[1],
      };
    } else {
      return {
        givenNames: parts.slice(0, -1).join(' '),
        lastName: parts[parts.length - 1],
      };
    }
  }

  /**
   * Sanitize text for XML
   */
  private sanitizeText(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 2000); // Limit length
  }

  /**
   * Get list of included sections
   */
  private getIncludedSections(metadata: Record<string, string>): string[] {
    const sections = new Set<string>();

    Object.keys(metadata).forEach((key) => {
      if (key.startsWith('rms_')) {
        const section = key.split('_')[1];
        if (section && section !== 'schema') {
          sections.add(section);
        }
      }
    });

    return Array.from(sections);
  }

  /**
   * Validate RMS metadata
   */
  validateMetadata(metadata: RMSMetadata): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!metadata.version.includes('rms_v')) {
      errors.push('Invalid RMS version format');
    }

    if (!metadata.xmpXml || metadata.xmpXml.length === 0) {
      errors.push('XMP XML is empty');
    }

    if (metadata.fieldCount < 5) {
      errors.push('Too few fields in metadata');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

// Singleton instance
let rmsMetadataGenerator: RMSMetadataGenerator | null = null;

/**
 * Get singleton instance of RMS Metadata Generator
 */
export function getRMSMetadataGenerator(): RMSMetadataGenerator {
  if (!rmsMetadataGenerator) {
    rmsMetadataGenerator = new RMSMetadataGenerator();
  }
  return rmsMetadataGenerator;
}

export default RMSMetadataGenerator;
