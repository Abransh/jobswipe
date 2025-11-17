/**
 * @fileoverview Resume Structurer Service using Gemini 2.5 Pro
 * @description Converts raw resume text into structured JSON data using AI
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface StructuredResume {
  contact: ContactInfo;
  summary?: string;
  experience: WorkExperience[];
  education: Education[];
  skills: Skills;
  certifications?: Certification[];
  projects?: Project[];
  awards?: Award[];
  publications?: Publication[];
  languages?: Language[];
  references?: Reference[];
  metadata: StructuringMetadata;
}

export interface ContactInfo {
  fullName: string;
  email?: string;
  phone?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    countryCode?: string;
  };
  linkedin?: string;
  github?: string;
  portfolio?: string;
  website?: string;
}

export interface WorkExperience {
  company: string;
  role: string;
  location?: string;
  startDate: DateInfo;
  endDate?: DateInfo;
  isCurrent: boolean;
  description: string;
  highlights?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  location?: string;
  graduationDate?: DateInfo;
  gpa?: number;
  honors?: string;
  isGraduate: boolean;
  description?: string;
}

export interface Skills {
  technical?: string[];
  languages?: string[];
  frameworks?: string[];
  tools?: string[];
  soft?: string[];
  categories?: { [category: string]: string[] };
}

export interface Certification {
  name: string;
  issuer: string;
  date?: DateInfo;
  expirationDate?: DateInfo;
  credentialId?: string;
  url?: string;
}

export interface Project {
  name: string;
  description: string;
  role?: string;
  technologies?: string[];
  url?: string;
  startDate?: DateInfo;
  endDate?: DateInfo;
}

export interface Award {
  name: string;
  issuer: string;
  date?: DateInfo;
  description?: string;
}

export interface Publication {
  title: string;
  publisher: string;
  date?: DateInfo;
  url?: string;
  authors?: string[];
}

export interface Language {
  name: string;
  proficiency: 'native' | 'fluent' | 'professional' | 'intermediate' | 'basic';
}

export interface Reference {
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  relationship?: string;
}

export interface DateInfo {
  formatted: string; // Human-readable: "January 2023", "2023", etc.
  year?: number;
  month?: number;
  timestamp?: number; // Unix timestamp in milliseconds
}

export interface StructuringMetadata {
  model: string;
  version: string;
  structuredAt: string;
  confidence: number; // 0-100
  warnings: string[];
  processingTime: number; // milliseconds
}

// =============================================================================
// RESUME STRUCTURER SERVICE CLASS
// =============================================================================

export class ResumeStructurerService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private modelName: string;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY or GEMINI_API_KEY environment variable is required');
    }

    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
    this.genAI = new GoogleGenerativeAI(apiKey);

    // Initialize model with safety settings
    this.model = this.genAI.getGenerativeModel({
      model: this.modelName,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
      generationConfig: {
        temperature: 0.1, // Low temperature for more consistent output
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });

    console.log(`🤖 ResumeStructurerService initialized with model: ${this.modelName}`);
  }

  // ===========================================================================
  // MAIN STRUCTURING METHOD
  // ===========================================================================

  /**
   * Structure raw resume text into JSON format using Gemini
   */
  async structureResume(rawText: string): Promise<StructuredResume> {
    const startTime = Date.now();

    try {
      console.log(`🔄 Structuring resume with Gemini (${rawText.length} characters)...`);

      // Build the prompt
      const prompt = this.buildStructuringPrompt(rawText);

      // Call Gemini API
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log(`📥 Received response from Gemini (${text.length} characters)`);

      // Parse JSON response
      const structured = this.parseGeminiResponse(text);

      // Add metadata
      const processingTime = Date.now() - startTime;
      structured.metadata = {
        model: this.modelName,
        version: '2.5',
        structuredAt: new Date().toISOString(),
        confidence: this.calculateConfidence(structured),
        warnings: this.validateStructure(structured),
        processingTime,
      };

      console.log(`✅ Resume structured successfully in ${processingTime}ms`, {
        confidence: structured.metadata.confidence,
        experienceCount: structured.experience.length,
        educationCount: structured.education.length,
      });

      return structured;
    } catch (error) {
      console.error(`❌ Failed to structure resume:`, error);
      throw new Error(`Resume structuring failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===========================================================================
  // PROMPT ENGINEERING
  // ===========================================================================

  /**
   * Build comprehensive prompt for Gemini
   */
  private buildStructuringPrompt(rawText: string): string {
    return `You are an expert resume parser. Extract and structure the following resume into a precise JSON format.

**RESUME TEXT:**
${rawText}

**INSTRUCTIONS:**
1. Extract ALL information accurately from the resume
2. Return ONLY valid JSON (no markdown, no explanations)
3. Use the exact schema provided below
4. For dates, provide multiple formats: formatted string, year, month, and Unix timestamp (milliseconds)
5. Parse dates intelligently (e.g., "Jan 2023" = {formatted: "January 2023", year: 2023, month: 1, timestamp: 1672531200000})
6. If information is missing, use null (not empty strings)
7. For "isCurrent" fields, check for keywords like "Present", "Current", "Now"
8. Extract skills into categories when possible
9. Parse email, phone, LinkedIn, GitHub, and other URLs carefully

**REQUIRED JSON SCHEMA:**
{
  "contact": {
    "fullName": "string (required)",
    "email": "string | null",
    "phone": "string | null",
    "location": {
      "city": "string | null",
      "state": "string | null",
      "country": "string | null",
      "countryCode": "string (ISO 3166 A-2) | null"
    },
    "linkedin": "string (URL) | null",
    "github": "string (URL) | null",
    "portfolio": "string (URL) | null",
    "website": "string (URL) | null"
  },
  "summary": "string | null",
  "experience": [
    {
      "company": "string",
      "role": "string",
      "location": "string | null",
      "startDate": {
        "formatted": "string",
        "year": number | null,
        "month": number | null,
        "timestamp": number | null
      },
      "endDate": {
        "formatted": "string",
        "year": number | null,
        "month": number | null,
        "timestamp": number | null
      } | null,
      "isCurrent": boolean,
      "description": "string",
      "highlights": ["string"] | null
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string | null",
      "location": "string | null",
      "graduationDate": {
        "formatted": "string",
        "year": number | null,
        "month": number | null,
        "timestamp": number | null
      } | null,
      "gpa": number | null,
      "honors": "string | null",
      "isGraduate": boolean,
      "description": "string | null"
    }
  ],
  "skills": {
    "technical": ["string"] | null,
    "languages": ["string"] | null,
    "frameworks": ["string"] | null,
    "tools": ["string"] | null,
    "soft": ["string"] | null,
    "categories": {
      "category_name": ["string"]
    } | null
  },
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": DateInfo | null,
      "expirationDate": DateInfo | null,
      "credentialId": "string | null",
      "url": "string | null"
    }
  ] | null,
  "projects": [
    {
      "name": "string",
      "description": "string",
      "role": "string | null",
      "technologies": ["string"] | null,
      "url": "string | null",
      "startDate": DateInfo | null,
      "endDate": DateInfo | null
    }
  ] | null,
  "awards": [
    {
      "name": "string",
      "issuer": "string",
      "date": DateInfo | null,
      "description": "string | null"
    }
  ] | null,
  "publications": [
    {
      "title": "string",
      "publisher": "string",
      "date": DateInfo | null,
      "url": "string | null",
      "authors": ["string"] | null
    }
  ] | null,
  "languages": [
    {
      "name": "string",
      "proficiency": "native | fluent | professional | intermediate | basic"
    }
  ] | null,
  "references": [
    {
      "name": "string",
      "title": "string | null",
      "company": "string | null",
      "email": "string | null",
      "phone": "string | null",
      "relationship": "string | null"
    }
  ] | null
}

**IMPORTANT:**
- Return ONLY the JSON object, no other text
- Ensure all dates are properly formatted
- Extract ALL work experience and education entries
- Be precise with contact information
- Skills should be comprehensive and categorized

**OUTPUT (JSON only):**`;
  }

  // ===========================================================================
  // RESPONSE PARSING
  // ===========================================================================

  /**
   * Parse Gemini response and clean JSON
   */
  private parseGeminiResponse(text: string): StructuredResume {
    try {
      // Remove markdown code blocks if present
      let cleanedText = text.trim();

      // Remove ```json or ``` markers
      cleanedText = cleanedText.replace(/^```json\s*/i, '');
      cleanedText = cleanedText.replace(/^```\s*/i, '');
      cleanedText = cleanedText.replace(/\s*```$/i, '');

      // Parse JSON
      const parsed = JSON.parse(cleanedText);

      // Validate required fields
      if (!parsed.contact || !parsed.contact.fullName) {
        throw new Error('Invalid response: missing required contact.fullName field');
      }

      if (!parsed.experience) {
        parsed.experience = [];
      }

      if (!parsed.education) {
        parsed.education = [];
      }

      if (!parsed.skills) {
        parsed.skills = {};
      }

      return parsed as StructuredResume;
    } catch (error) {
      console.error('Failed to parse Gemini response:', text);
      throw new Error(`JSON parsing failed: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }
  }

  // ===========================================================================
  // VALIDATION & QUALITY
  // ===========================================================================

  /**
   * Validate structured resume and return warnings
   */
  private validateStructure(resume: StructuredResume): string[] {
    const warnings: string[] = [];

    // Check contact information
    if (!resume.contact.email && !resume.contact.phone) {
      warnings.push('No contact email or phone number found');
    }

    // Check experience
    if (!resume.experience || resume.experience.length === 0) {
      warnings.push('No work experience found');
    }

    // Check education
    if (!resume.education || resume.education.length === 0) {
      warnings.push('No education information found');
    }

    // Check skills
    if (!resume.skills || Object.keys(resume.skills).length === 0) {
      warnings.push('No skills found');
    }

    // Validate dates in experience
    resume.experience?.forEach((exp, index) => {
      if (exp.isCurrent && exp.endDate) {
        warnings.push(`Experience #${index + 1}: Marked as current but has end date`);
      }
    });

    return warnings;
  }

  /**
   * Calculate confidence score based on extracted data
   */
  private calculateConfidence(resume: StructuredResume): number {
    let score = 0;
    let maxScore = 0;

    // Contact information (30 points)
    maxScore += 30;
    if (resume.contact.fullName) score += 10;
    if (resume.contact.email) score += 10;
    if (resume.contact.phone) score += 5;
    if (resume.contact.location) score += 5;

    // Experience (30 points)
    maxScore += 30;
    if (resume.experience && resume.experience.length > 0) {
      score += 20;
      if (resume.experience.length >= 2) score += 10;
    }

    // Education (20 points)
    maxScore += 20;
    if (resume.education && resume.education.length > 0) {
      score += 15;
      if (resume.education.length >= 2) score += 5;
    }

    // Skills (20 points)
    maxScore += 20;
    if (resume.skills) {
      const skillCount = Object.values(resume.skills).flat().length;
      if (skillCount > 0) score += 10;
      if (skillCount >= 5) score += 5;
      if (skillCount >= 10) score += 5;
    }

    return Math.round((score / maxScore) * 100);
  }

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================

  /**
   * Generate markdown representation of structured resume
   */
  generateMarkdown(resume: StructuredResume): string {
    const sections: string[] = [];

    // Header with contact
    sections.push(`# ${resume.contact.fullName}`);
    sections.push('');

    const contactDetails: string[] = [];
    if (resume.contact.email) contactDetails.push(`📧 ${resume.contact.email}`);
    if (resume.contact.phone) contactDetails.push(`📱 ${resume.contact.phone}`);
    if (resume.contact.location?.city) {
      contactDetails.push(`📍 ${resume.contact.location.city}${resume.contact.location.state ? ', ' + resume.contact.location.state : ''}`);
    }
    if (resume.contact.linkedin) contactDetails.push(`🔗 [LinkedIn](${resume.contact.linkedin})`);
    if (resume.contact.github) contactDetails.push(`💻 [GitHub](${resume.contact.github})`);

    if (contactDetails.length > 0) {
      sections.push(contactDetails.join(' | '));
      sections.push('');
    }

    // Summary
    if (resume.summary) {
      sections.push('## Summary');
      sections.push('');
      sections.push(resume.summary);
      sections.push('');
    }

    // Experience
    if (resume.experience && resume.experience.length > 0) {
      sections.push('## Experience');
      sections.push('');

      resume.experience.forEach((exp) => {
        sections.push(`### ${exp.role} at ${exp.company}`);
        sections.push(`*${exp.startDate.formatted} - ${exp.isCurrent ? 'Present' : exp.endDate?.formatted || 'N/A'}*${exp.location ? ` | ${exp.location}` : ''}`);
        sections.push('');
        sections.push(exp.description);
        sections.push('');
      });
    }

    // Education
    if (resume.education && resume.education.length > 0) {
      sections.push('## Education');
      sections.push('');

      resume.education.forEach((edu) => {
        sections.push(`### ${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`);
        sections.push(`**${edu.institution}**${edu.location ? ` | ${edu.location}` : ''}`);
        if (edu.graduationDate) sections.push(`*Graduated: ${edu.graduationDate.formatted}*`);
        if (edu.gpa) sections.push(`GPA: ${edu.gpa}`);
        sections.push('');
      });
    }

    // Skills
    if (resume.skills) {
      sections.push('## Skills');
      sections.push('');

      if (resume.skills.technical) {
        sections.push(`**Technical:** ${resume.skills.technical.join(', ')}`);
        sections.push('');
      }

      if (resume.skills.categories) {
        Object.entries(resume.skills.categories).forEach(([category, skills]) => {
          sections.push(`**${category}:** ${skills.join(', ')}`);
          sections.push('');
        });
      }
    }

    // Certifications
    if (resume.certifications && resume.certifications.length > 0) {
      sections.push('## Certifications');
      sections.push('');

      resume.certifications.forEach((cert) => {
        sections.push(`- **${cert.name}** - ${cert.issuer}${cert.date ? ` (${cert.date.formatted})` : ''}`);
      });
      sections.push('');
    }

    // Projects
    if (resume.projects && resume.projects.length > 0) {
      sections.push('## Projects');
      sections.push('');

      resume.projects.forEach((project) => {
        sections.push(`### ${project.name}`);
        sections.push(project.description);
        if (project.technologies) sections.push(`**Technologies:** ${project.technologies.join(', ')}`);
        sections.push('');
      });
    }

    return sections.join('\n');
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      name: this.modelName,
      provider: 'Google Gemini',
      version: '2.5 Pro',
    };
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

// Singleton instance
let resumeStructurerService: ResumeStructurerService | null = null;

/**
 * Get singleton instance of Resume Structurer Service
 */
export function getResumeStructurerService(): ResumeStructurerService {
  if (!resumeStructurerService) {
    resumeStructurerService = new ResumeStructurerService();
  }
  return resumeStructurerService;
}

export default ResumeStructurerService;
