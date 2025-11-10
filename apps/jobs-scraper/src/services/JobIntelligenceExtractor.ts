/**
 * Job Intelligence Extraction Service
 *
 * Comprehensive AI-powered extraction of structured data from job descriptions.
 * Extracts: requirements, skills, experience, education, keywords, tags, level, category.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { JobIntelligenceData, DirectAPIData, GreenhouseJobDetails } from '../types/greenhouse.types';

export type LLMProvider = 'claude' | 'gemini';

export interface IntelligenceConfig {
  provider?: LLMProvider;
  model?: string;
}

export class JobIntelligenceExtractor {
  private provider: LLMProvider;
  private model: string;
  private anthropic?: Anthropic;
  private gemini?: GoogleGenerativeAI;

  constructor(config?: IntelligenceConfig) {
    // Determine provider from config or environment
    this.provider = config?.provider || (process.env.LLM_PROVIDER as LLMProvider) || 'gemini';

    // Initialize the appropriate SDK
    if (this.provider === 'claude') {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error(
          'ANTHROPIC_API_KEY is required when using Claude for intelligence extraction.'
        );
      }
      this.anthropic = new Anthropic({ apiKey });
      this.model = config?.model || 'claude-3-haiku-20240307';
    } else if (this.provider === 'gemini') {
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error(
          'GOOGLE_API_KEY is required when using Gemini for intelligence extraction.'
        );
      }
      this.gemini = new GoogleGenerativeAI(apiKey);
      this.model = config?.model || 'gemini-2.0-flash-exp';
    } else {
      throw new Error(`Unsupported LLM provider: ${this.provider}`);
    }
  }

  /**
   * Extract comprehensive job intelligence from job description
   */
  async extract(
    title: string,
    descriptionHtml: string,
    apiData: DirectAPIData
  ): Promise<JobIntelligenceData> {
    const startTime = Date.now();

    try {
      // Strip HTML tags for cleaner text
      const cleanDescription = this.stripHtml(descriptionHtml);

      // Build comprehensive extraction prompt
      const prompt = this.buildExtractionPrompt(title, cleanDescription, apiData);

      // Call LLM
      let responseText: string;
      if (this.provider === 'claude') {
        responseText = await this.callClaude(prompt);
      } else {
        responseText = await this.callGemini(prompt);
      }

      // Parse response
      const extracted = this.parseResponse(responseText);

      // Add metadata
      const processingTime = Date.now() - startTime;
      return {
        ...extracted,
        metadata: {
          extractedAt: new Date().toISOString(),
          model: this.model,
          processingTime,
        },
      };
    } catch (error) {
      console.error('❌ Intelligence extraction failed:', error);

      // Return default/empty data on failure
      return this.getDefaultIntelligence();
    }
  }

  /**
   * Extract direct data from Greenhouse API (no AI needed)
   */
  extractDirectData(details: GreenhouseJobDetails): DirectAPIData {
    const locationString = details.location.name;
    const locationData = this.parseLocation(locationString);

    return {
      department: details.departments?.[0]?.name,
      location: locationString,
      ...locationData,
      jobType: this.parseJobType(details.metadata),
      remote: locationData.remote || false,
    };
  }

  /**
   * Build comprehensive extraction prompt
   */
  private buildExtractionPrompt(
    title: string,
    description: string,
    apiData: DirectAPIData
  ): string {
    return `You are an expert job posting analyzer. Extract structured data from this job posting.

**Job Title:** ${title}
**Department:** ${apiData.department || 'Unknown'}
**Location:** ${apiData.location}

**Job Description:**
${description}

---

Extract the following and return ONLY valid JSON (no markdown, no explanations):

{
  "requirements": {
    "bulletPoints": [
      // Extract 5-10 main requirements as clear bullet points
      // Example: "5+ years of software development experience"
      // Example: "Proficiency in Python and React"
    ],
    "summary": "One concise sentence summarizing key requirements"
  },

  "experience": {
    "yearsMin": <number or null>,  // Minimum years (e.g., "5+ years" → 5, "3-5 years" → 3)
    "yearsMax": <number or null>,  // Maximum if range given (e.g., "3-5 years" → 5)
    "level": "ENTRY" | "MID" | "SENIOR" | "LEAD" | "PRINCIPAL"
    // Infer from title and description:
    // - "Junior", "Entry", "Associate" → ENTRY
    // - No prefix, "Mid-level" → MID
    // - "Senior", "Sr" → SENIOR
    // - "Lead", "Staff" → LEAD
    // - "Principal", "Distinguished" → PRINCIPAL
  },

  "skills": {
    "required": [
      // 5-15 required technical skills
      // Include: programming languages, frameworks, tools, platforms
      // Example: "Python", "React", "AWS", "Docker", "Kubernetes"
    ],
    "preferred": [
      // 3-10 nice-to-have skills
      // Skills marked as "plus", "bonus", "preferred", "nice to have"
    ]
  },

  "education": {
    "required": "NONE" | "HIGH_SCHOOL" | "BACHELORS" | "MASTERS" | "PHD",
    "field": <string or null>,  // e.g., "Computer Science", "Engineering"
    "details": <string or null>  // Full education requirement text if specified
  },

  "languages": [
    // Spoken languages required (if mentioned)
    // Look for: "fluent in", "proficient", "native speaker"
    // Default to ["English"] if not specified
  ],

  "remoteType": "REMOTE" | "HYBRID" | "ONSITE",
  // Determine from:
  // - "Remote", "Work from anywhere", "Fully remote" → REMOTE
  // - "Hybrid", "3 days in office", "Flexible" → HYBRID
  // - "On-site", "In office", specific city location → ONSITE

  "category": "ENGINEERING" | "DESIGN" | "PRODUCT" | "SALES" | "MARKETING" |
              "OPERATIONS" | "FINANCE" | "HR" | "LEGAL" | "DATA_SCIENCE" |
              "CUSTOMER_SUCCESS" | "OTHER",
  // Map from department and title:
  // - Engineering, Technical, Development, Software → ENGINEERING
  // - Design, UX, UI, Creative → DESIGN
  // - Product Management, Product Manager → PRODUCT
  // - Sales, Business Development, Account → SALES
  // - Marketing, Growth, Content → MARKETING
  // - Operations, Program Management → OPERATIONS
  // - Finance, Accounting, FP&A → FINANCE
  // - HR, People, Talent, Recruiting → HR
  // - Legal, Compliance → LEGAL
  // - Data Science, Analytics, ML, AI → DATA_SCIENCE
  // - Customer Success, Support, Customer Experience → CUSTOMER_SUCCESS

  "keywords": [
    // 10-15 searchable keywords extracted from description
    // Include: technologies, skills, domain concepts, methodologies
    // Make them searchable and relevant
    // Example: "backend", "python", "microservices", "cloud", "api", "rest", "kubernetes"
  ],

  "tags": [
    // 5-10 filtering tags (broader categories)
    // Include experience level, work arrangement, function area
    // Example: "senior-level", "remote-friendly", "full-time", "engineering", "backend", "cloud-native"
  ],

  "confidence": {
    "overall": <0-100>,      // Overall confidence in extraction
    "requirements": <0-100>, // Confidence in requirements extraction
    "skills": <0-100>,       // Confidence in skills extraction
    "experience": <0-100>    // Confidence in experience inference
  }
}

**Extraction Rules:**

1. **Requirements**:
   - Extract clear, actionable requirements
   - Convert paragraphs/sentences to concise bullet points
   - Focus on what candidate must have/do
   - Keep each point under 80 characters

2. **Experience**:
   - "5+ years" → yearsMin: 5, yearsMax: null
   - "3-5 years" → yearsMin: 3, yearsMax: 5
   - "2+ years" → yearsMin: 2
   - If no years mentioned, infer from level: ENTRY → 0-2, MID → 2-5, SENIOR → 5+

3. **Level Inference**:
   - Look at title first: "Senior" → SENIOR, "Jr" → ENTRY, "Lead" → LEAD
   - Consider years: 0-2 → ENTRY, 2-5 → MID, 5-8 → SENIOR, 8+ → LEAD/PRINCIPAL
   - Consider responsibilities: managing others → LEAD+

4. **Skills**:
   - Required: explicitly "required", "must have", "proficient in"
   - Preferred: "nice to have", "bonus", "plus", "preferred"
   - Be specific: "Python" not "programming", "React" not "frontend framework"
   - Include tools, platforms, methodologies

5. **Education**:
   - Look for "Bachelor's", "Master's", "PhD", "degree"
   - If "Bachelor's required" → required: BACHELORS
   - If "degree preferred" or not mentioned clearly → required: NONE for many roles
   - For technical roles without explicit requirement → BACHELORS

6. **Languages**:
   - Only include if explicitly mentioned
   - Look for "fluent in X", "proficient in Y", "multilingual"
   - Default: ["English"] if nothing mentioned

7. **Remote Type**:
   - Be specific based on location and policy mentions
   - "Remote" location string → REMOTE
   - Specific city + "flexible" → HYBRID
   - Specific city without flexibility mention → ONSITE

8. **Category**:
   - Primary function of the role
   - Use department if clear, otherwise infer from title
   - Be specific: don't default to OTHER unless truly unclear

9. **Keywords**:
   - Actual technologies and skills mentioned
   - Domain-specific terms
   - Make them useful for search
   - Lowercase, hyphenated if needed

10. **Tags**:
    - Combine: experience level + work type + function + tech stack
    - Examples: ["senior-level", "remote-friendly", "full-time", "backend", "python", "cloud"]
    - Make them useful for filtering UI

**Important**: Return ONLY the JSON object. No markdown code blocks, no explanations.
`;
  }

  /**
   * Call Claude API
   */
  private async callClaude(prompt: string): Promise<string> {
    if (!this.anthropic) throw new Error('Claude not initialized');

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected Claude response');
    return content.text;
  }

  /**
   * Call Gemini API
   */
  private async callGemini(prompt: string): Promise<string> {
    if (!this.gemini) throw new Error('Gemini not initialized');

    const model = this.gemini.getGenerativeModel({ model: this.model });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  /**
   * Parse LLM response (handles markdown-wrapped JSON)
   */
  private parseResponse(text: string): JobIntelligenceData {
    let cleaned = text.trim();

    // Remove markdown code blocks
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    return JSON.parse(cleaned.trim());
  }

  /**
   * Parse location string into components
   */
  private parseLocation(locationString: string): {
    city?: string;
    state?: string;
    country?: string;
    remote: boolean;
  } {
    const lower = locationString.toLowerCase();

    // Check if remote
    if (lower.includes('remote') || lower.includes('anywhere')) {
      return { remote: true };
    }

    // Parse "City, State" or "City, Country"
    const parts = locationString.split(',').map((p) => p.trim());

    if (parts.length === 2) {
      // Check if second part is a US state (2 letters)
      if (parts[1].length === 2) {
        return {
          city: parts[0],
          state: parts[1],
          country: 'USA',
          remote: false,
        };
      } else {
        return {
          city: parts[0],
          country: parts[1],
          remote: false,
        };
      }
    }

    // Single location (just city or country)
    return {
      city: parts[0],
      remote: false,
    };
  }

  /**
   * Parse job type from metadata
   */
  private parseJobType(
    metadata?: Array<{ name: string; value: string }>
  ): 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | undefined {
    if (!metadata) return undefined;

    const employmentType = metadata.find(
      (m) => m.name === 'Employment Type' || m.name === 'Type'
    );

    if (!employmentType) return undefined;

    const value = employmentType.value.toLowerCase();
    if (value.includes('full') || value.includes('ft')) return 'FULL_TIME';
    if (value.includes('part') || value.includes('pt')) return 'PART_TIME';
    if (value.includes('contract') || value.includes('contractor')) return 'CONTRACT';
    if (value.includes('intern')) return 'INTERNSHIP';

    return undefined;
  }

  /**
   * Strip HTML tags
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Get default intelligence data (fallback)
   */
  private getDefaultIntelligence(): JobIntelligenceData {
    return {
      requirements: {
        bulletPoints: [],
        summary: '',
      },
      experience: {
        level: 'MID',
      },
      skills: {
        required: [],
        preferred: [],
      },
      education: {
        required: 'NONE',
      },
      languages: ['English'],
      remoteType: 'ONSITE',
      category: 'OTHER',
      keywords: [],
      tags: [],
      confidence: {
        overall: 0,
        requirements: 0,
        skills: 0,
        experience: 0,
      },
      metadata: {
        extractedAt: new Date().toISOString(),
        model: this.model,
      },
    };
  }
}
