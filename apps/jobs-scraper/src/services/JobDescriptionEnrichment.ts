/**
 * Job Description Enrichment Service
 *
 * Uses LLM APIs (Claude or Gemini) to extract structured data from unstructured job descriptions.
 * Extracts: salary, visa sponsorship, remote policy, benefits, requirements.
 */

import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { EnrichedJobData } from '../types/greenhouse.types';

export type LLMProvider = 'claude' | 'gemini';

export interface EnrichmentConfig {
  provider?: LLMProvider;
  model?: string;
}

export class JobDescriptionEnrichment {
  private provider: LLMProvider;
  private model: string;
  private anthropic?: Anthropic;
  private gemini?: GoogleGenerativeAI;

  constructor(config?: EnrichmentConfig) {
    // Determine provider from config or environment
    this.provider = config?.provider || (process.env.LLM_PROVIDER as LLMProvider) || 'gemini';

    // Initialize the appropriate SDK
    if (this.provider === 'claude') {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error(
          'ANTHROPIC_API_KEY is required when using Claude. ' +
            'Set it in your .env file or use a different provider.'
        );
      }
      this.anthropic = new Anthropic({ apiKey });
      this.model = config?.model || 'claude-3-haiku-20240307';
    } else if (this.provider === 'gemini') {
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error(
          'GOOGLE_API_KEY is required when using Gemini. ' +
            'Set it in your .env file or use a different provider.'
        );
      }
      this.gemini = new GoogleGenerativeAI(apiKey);
      this.model = config?.model || 'gemini-2.0-flash-exp';
    } else {
      throw new Error(`Unsupported LLM provider: ${this.provider}`);
    }

    console.log(`🤖 Using ${this.provider.toUpperCase()} (${this.model}) for enrichment`);
  }

  /**
   * Extract structured data from job description HTML/text
   */
  async enrichJobDescription(
    jobTitle: string,
    descriptionHtml: string,
    companyName: string
  ): Promise<EnrichedJobData> {
    try {
      // Strip HTML tags for cleaner text
      const cleanText = this.stripHtml(descriptionHtml);

      // Build the extraction prompt
      const prompt = this.buildExtractionPrompt(jobTitle, cleanText, companyName);

      // Call the appropriate LLM
      let extractedText: string;
      if (this.provider === 'claude') {
        extractedText = await this.callClaude(prompt);
      } else if (this.provider === 'gemini') {
        extractedText = await this.callGemini(prompt);
      } else {
        throw new Error(`Unsupported provider: ${this.provider}`);
      }

      // Parse the JSON response
      const extractedData = this.parseResponse(extractedText);

      // Add metadata
      return {
        ...extractedData,
        metadata: {
          extractedAt: new Date().toISOString(),
          confidence: this.calculateConfidence(extractedData),
          model: this.model,
        },
      };
    } catch (error) {
      console.error('Failed to enrich job description:', error);

      // Return empty enrichment data on failure
      return {
        metadata: {
          extractedAt: new Date().toISOString(),
          confidence: 0,
          model: this.model,
        },
      };
    }
  }

  /**
   * Call Claude API
   */
  private async callClaude(prompt: string): Promise<string> {
    if (!this.anthropic) {
      throw new Error('Claude client not initialized');
    }

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return content.text;
  }

  /**
   * Call Gemini API
   */
  private async callGemini(prompt: string): Promise<string> {
    if (!this.gemini) {
      throw new Error('Gemini client not initialized');
    }

    const model = this.gemini.getGenerativeModel({ model: this.model });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  }

  /**
   * Parse LLM response (handles both clean JSON and markdown-wrapped JSON)
   */
  private parseResponse(text: string): EnrichedJobData {
    // Remove markdown code blocks if present
    let cleanedText = text.trim();

    // Remove ```json and ``` markers
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    // Parse JSON
    return JSON.parse(cleanedText.trim());
  }

  /**
   * Build the extraction prompt for the LLM
   */
  private buildExtractionPrompt(
    jobTitle: string,
    description: string,
    companyName: string
  ): string {
    return `You are a job posting data extraction expert. Extract structured information from the following job description.

**Job Title:** ${jobTitle}
**Company:** ${companyName}

**Job Description:**
${description}

---

Extract the following information and return ONLY a valid JSON object (no markdown, no explanations):

{
  "salary": {
    "min": <number or null>,
    "max": <number or null>,
    "currency": <"USD" | "GBP" | "EUR" | null>,
    "period": <"yearly" | "hourly" | "monthly" | null>,
    "equity": <string describing equity/stock options or null>,
    "bonus": <string describing bonus structure or null>
  },
  "visaSponsorship": {
    "available": <boolean>,
    "details": <string or null>,
    "restrictions": <array of strings or null>
  },
  "remote": {
    "type": <"remote" | "hybrid" | "onsite">,
    "flexibility": <string or null>,
    "restrictions": <array of strings or null>
  },
  "benefits": <array of strings (e.g., ["401k", "health insurance", "unlimited PTO"]) or null>,
  "requirements": {
    "education": <array of education requirements or null>,
    "experience": {
      "years": <number or null>,
      "level": <"entry" | "mid" | "senior" | "lead" | "principal" or null>
    },
    "skills": {
      "required": <array of required skills or null>,
      "preferred": <array of preferred/nice-to-have skills or null>
    },
    "languages": <array of language requirements or null>
  }
}

**Important extraction rules:**
1. **Salary**: Extract numeric values only. If it says "$120k-$150k", use min:120000, max:150000, currency:"USD", period:"yearly"
2. **Visa Sponsorship**:
   - If it says "cannot provide sponsorship", "must be authorized to work", set available:false
   - If it says "will sponsor" or "visa available", set available:true
   - If not mentioned, set available:false (conservative default)
3. **Remote**: Determine based on location and work policy mentions
4. **Benefits**: Extract specific benefits mentioned (avoid vague terms like "great benefits")
5. **Skills**: Separate "required" from "nice to have" or "preferred"
6. If any field is not mentioned or unclear, use null

Return ONLY the JSON object, nothing else.`;
  }

  /**
   * Calculate confidence score based on how much data was extracted
   */
  private calculateConfidence(data: EnrichedJobData): number {
    let score = 0;
    let total = 0;

    // Salary fields (20 points max)
    total += 20;
    if (data.salary?.min || data.salary?.max) score += 15;
    if (data.salary?.currency) score += 5;

    // Visa sponsorship (20 points max)
    total += 20;
    if (data.visaSponsorship !== undefined) score += 20;

    // Remote policy (15 points max)
    total += 15;
    if (data.remote?.type) score += 15;

    // Benefits (15 points max)
    total += 15;
    if (data.benefits && data.benefits.length > 0) score += 15;

    // Requirements (30 points max)
    total += 30;
    if (data.requirements?.experience) score += 10;
    if (data.requirements?.skills?.required && data.requirements.skills.required.length > 0)
      score += 10;
    if (data.requirements?.education && data.requirements.education.length > 0) score += 10;

    return Math.round((score / total) * 100);
  }

  /**
   * Strip HTML tags from description
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
