/**
 * Job Field Analyzer Service
 *
 * Uses LLM to analyze job postings and predict what application form fields will be required.
 * This enables pre-emptive data collection (SERVER mode) or intelligent pause-and-resume (DESKTOP mode).
 *
 * @module JobFieldAnalyzer
 */

import { FastifyInstance } from 'fastify';
import { ChatAnthropic } from '@langchain/anthropic';

// ═══════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface RequiredField {
  fieldName: string;        // Normalized name: "why_this_company"
  fieldLabel: string;       // What user sees: "Why do you want to work here?"
  fieldType: 'text' | 'textarea' | 'select' | 'date' | 'file';
  required: boolean;
  context?: string;         // Additional context for field
  possibleValues?: string[]; // For select fields
  maxLength?: number;
  aiCanGenerate: boolean;   // Can AI auto-generate this?
}

export interface JobFieldAnalysis {
  standardFields: string[];      // email, phone, resume, etc.
  additionalFields: RequiredField[]; // Company-specific fields
  estimatedComplexity: 'simple' | 'moderate' | 'complex';
  confidenceScore?: number;       // 0-100, how confident is the analysis
}

export interface MissingDataCheck {
  missing: RequiredField[];
  canProceed: boolean;
  missingCount: number;
  requiredMissingCount: number;
}

// ═══════════════════════════════════════════════════════════════
// FIELD MAPPING (Profile Fields → Form Fields)
// ═══════════════════════════════════════════════════════════════

const PROFILE_FIELD_MAPPING: Record<string, string | string[] | null> = {
  // Basic contact
  'email': 'email',
  'phone': 'phone',
  'first_name': 'firstName',
  'last_name': 'lastName',
  'full_name': ['firstName', 'lastName'],
  'address': 'address',
  'city': 'city',
  'state': 'state',
  'country': 'country',
  'postal_code': 'postalCode',

  // Professional
  'linkedin': 'linkedin',
  'github': 'github',
  'portfolio': 'portfolio',
  'website': 'website',
  'current_title': 'currentTitle',
  'current_company': 'currentCompany',
  'years_experience': 'yearsOfExperience',
  'experience_level': 'experienceLevel',

  // Resume
  'resume': 'resumeLocalPath',
  'cv': 'resumeLocalPath',

  // Fields that typically require user input (not in profile)
  'why_this_company': null,
  'why_this_role': null,
  'salary_expectation': null,
  'expected_salary': null,
  'start_date': null,
  'availability': null,
  'referral_code': null,
  'referral_source': null,
  'cover_letter_custom': null,
  'motivation': null,
  'interest_reason': null,
};

// ═══════════════════════════════════════════════════════════════
// JOB FIELD ANALYZER SERVICE
// ═══════════════════════════════════════════════════════════════

export class JobFieldAnalyzer {
  private llm: ChatAnthropic;
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;

    // Initialize LLM
    if (!process.env.ANTHROPIC_API_KEY) {
      this.fastify.log.warn('ANTHROPIC_API_KEY not set - JobFieldAnalyzer will not work');
    }

    this.llm = new ChatAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key',
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.1, // Low temperature for deterministic analysis
      maxTokens: 2000
    });
  }

  // ─────────────────────────────────────────────────────────────
  // MAIN ANALYSIS METHOD
  // ─────────────────────────────────────────────────────────────

  /**
   * Analyze a job posting and predict what form fields will be required
   */
  async analyzeJobRequirements(jobUrl: string, jobData: any): Promise<JobFieldAnalysis> {
    this.fastify.log.info({ jobUrl, jobTitle: jobData.title }, 'Analyzing job requirements');

    try {
      // Fetch job page content (if we have web scraping capability)
      // For now, we'll use the job description
      const jobContent = this.prepareJobContent(jobData);

      const prompt = this.buildAnalysisPrompt(jobContent, jobData);

      const response = await this.llm.invoke(prompt);
      const analysisText = response.content.toString();

      // Parse LLM response
      const analysis = this.parseAnalysisResponse(analysisText);

      this.fastify.log.info({
        standardFieldCount: analysis.standardFields.length,
        additionalFieldCount: analysis.additionalFields.length,
        complexity: analysis.estimatedComplexity
      }, 'Job analysis complete');

      return analysis;

    } catch (error) {
      this.fastify.log.error({ error, jobUrl }, 'Failed to analyze job requirements');

      // Return fallback analysis
      return {
        standardFields: ['name', 'email', 'phone', 'resume'],
        additionalFields: [],
        estimatedComplexity: 'simple',
        confidenceScore: 0
      };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // USER PROFILE CHECKING
  // ─────────────────────────────────────────────────────────────

  /**
   * Check which required fields are missing from user profile
   */
  async checkUserProfile(
    userId: string,
    requiredFields: RequiredField[]
  ): Promise<MissingDataCheck> {
    try {
      // Fetch user profile with all relations
      const userProfile = await this.fastify.db.userProfile.findUnique({
        where: { userId },
        include: {
          user: true
        }
      });

      if (!userProfile) {
        this.fastify.log.warn({ userId }, 'User profile not found');
        return {
          missing: requiredFields,
          canProceed: false,
          missingCount: requiredFields.length,
          requiredMissingCount: requiredFields.filter(f => f.required).length
        };
      }

      const missing: RequiredField[] = [];

      for (const field of requiredFields) {
        const hasData = this.checkFieldInProfile(field.fieldName, userProfile);

        if (!hasData) {
          missing.push(field);
        }
      }

      const requiredMissing = missing.filter(f => f.required);

      return {
        missing,
        canProceed: requiredMissing.length === 0,
        missingCount: missing.length,
        requiredMissingCount: requiredMissing.length
      };

    } catch (error) {
      this.fastify.log.error({ error, userId }, 'Failed to check user profile');
      throw error;
    }
  }

  /**
   * Check if a specific field exists in user profile
   */
  private checkFieldInProfile(fieldName: string, profile: any): boolean {
    const profileKey = PROFILE_FIELD_MAPPING[fieldName];

    if (!profileKey) {
      // Field not in mapping - assume it's missing
      return false;
    }

    if (profileKey === null) {
      // Known missing field (needs user input)
      return false;
    }

    // Check if profile has this field
    if (Array.isArray(profileKey)) {
      // Multiple fields (e.g., firstName + lastName)
      return profileKey.every(key => profile[key] || profile.user?.[key]);
    }

    // Single field
    return !!(profile[profileKey] || profile.user?.[profileKey]);
  }

  // ─────────────────────────────────────────────────────────────
  // AI SUGGESTION GENERATION
  // ─────────────────────────────────────────────────────────────

  /**
   * Generate AI suggestion for a specific field
   */
  async generateAiSuggestion(
    field: RequiredField,
    userProfile: any,
    jobData: any
  ): Promise<string> {
    if (!field.aiCanGenerate) {
      return '';
    }

    try {
      const prompt = `
Generate a professional, personalized response for this job application field.

FIELD INFORMATION:
- Label: ${field.fieldLabel}
- Type: ${field.fieldType}
${field.context ? `- Context: ${field.context}` : ''}
${field.maxLength ? `- Max Length: ${field.maxLength} characters` : ''}

JOB DETAILS:
- Title: ${jobData.title}
- Company: ${jobData.company}
- Location: ${jobData.location || 'Not specified'}
- Description: ${jobData.description?.substring(0, 500) || 'Not provided'}

CANDIDATE PROFILE:
- Name: ${userProfile.firstName || ''} ${userProfile.lastName || ''}
- Current Title: ${userProfile.currentTitle || 'Not specified'}
- Experience: ${userProfile.yearsOfExperience || 'Not specified'} years
- Summary: ${userProfile.summary || 'Not provided'}

INSTRUCTIONS:
1. Write a response that is specific to THIS job at THIS company
2. Highlight relevant experience from the candidate's profile
3. Sound authentic, professional, and personal (not generic)
4. ${field.maxLength ? `Keep it under ${field.maxLength} characters` : 'Be concise but impactful'}
5. Return ONLY the response text, no JSON, no formatting, no preamble

Response:`;

      const response = await this.llm.invoke(prompt);
      const suggestion = response.content.toString().trim();

      // Enforce max length if specified
      if (field.maxLength && suggestion.length > field.maxLength) {
        return suggestion.substring(0, field.maxLength - 3) + '...';
      }

      return suggestion;

    } catch (error) {
      this.fastify.log.error({ error, fieldName: field.fieldName }, 'Failed to generate AI suggestion');
      return '';
    }
  }

  // ─────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────

  private prepareJobContent(jobData: any): string {
    return `
TITLE: ${jobData.title}
COMPANY: ${jobData.company}
LOCATION: ${jobData.location || 'Not specified'}
TYPE: ${jobData.type || 'Not specified'}
REMOTE: ${jobData.remote ? 'Yes' : 'No'}

DESCRIPTION:
${jobData.description || 'Not provided'}

REQUIREMENTS:
${jobData.requirements || 'Not provided'}
`.trim();
  }

  private buildAnalysisPrompt(jobContent: string, jobData: any): string {
    return `
You are an expert at analyzing job application forms. Your task is to predict what fields an online job application form will require based on the job posting.

${jobContent}

Analyze this job posting and predict what fields the application form will likely require.

Return a JSON object in this EXACT format:
{
  "standardFields": ["name", "email", "phone", "resume"],
  "additionalFields": [
    {
      "fieldName": "why_this_company",
      "fieldLabel": "Why do you want to work at ${jobData.company}?",
      "fieldType": "textarea",
      "required": true,
      "context": "Asks about specific motivation for this company",
      "maxLength": 500,
      "aiCanGenerate": true
    }
  ],
  "estimatedComplexity": "moderate",
  "confidenceScore": 85
}

FIELD TYPES:
- "text": short single-line input (name, email, phone)
- "textarea": long multi-line input (essays, explanations, motivations)
- "select": dropdown (experience level, education)
- "date": date picker (availability, start date)
- "file": file upload (resume, cover letter, portfolio)

FIELD NAME CONVENTIONS:
Use snake_case: "why_this_company", "salary_expectation", "start_date", "work_authorization"

AI CAN GENERATE (aiCanGenerate):
- true: AI can create personalized response (company-specific essays, motivations, experience descriptions)
- false: User must provide (personal references, specific IDs, passwords, availability dates)

COMPLEXITY LEVELS:
- "simple": Basic contact info + resume only
- "moderate": Contact info + resume + 1-3 additional questions
- "complex": Contact info + resume + 4+ questions or multi-step process

CONFIDENCE SCORE:
Rate 0-100 how confident you are in this prediction based on the information available.

Return ONLY the JSON, no other text.`;
  }

  private parseAnalysisResponse(responseText: string): JobFieldAnalysis {
    try {
      // Extract JSON from response (LLM might add text before/after)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const analysis = JSON.parse(jsonMatch[0]);

      // Validate structure
      if (!analysis.standardFields || !Array.isArray(analysis.standardFields)) {
        throw new Error('Invalid standardFields');
      }

      if (!analysis.additionalFields || !Array.isArray(analysis.additionalFields)) {
        throw new Error('Invalid additionalFields');
      }

      return analysis as JobFieldAnalysis;

    } catch (error) {
      this.fastify.log.error({ error, responseText }, 'Failed to parse analysis response');

      // Return fallback
      return {
        standardFields: ['name', 'email', 'phone', 'resume'],
        additionalFields: [],
        estimatedComplexity: 'simple',
        confidenceScore: 0
      };
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export default JobFieldAnalyzer;
