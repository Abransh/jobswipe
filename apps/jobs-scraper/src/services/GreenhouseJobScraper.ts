/**
 * Greenhouse Job Scraper
 *
 * Scrapes job listings from Greenhouse-powered job boards,
 * extracts application form schemas, classifies fields,
 * and populates the JobSwipe database.
 *
 * @see https://developers.greenhouse.io/job-board.html
 */

import axios, { AxiosInstance } from 'axios';
import { PrismaClient } from '@jobswipe/database';
import {
  GreenhouseJobListing,
  GreenhouseJobDetails,
  GreenhouseJobsResponse,
  GreenhouseQuestion,
  GreenhouseField,
  ClassifiedField,
  ApplicationSchema,
  AutomationMetrics,
  AnswerStrategy,
  ScraperConfig,
  ScraperResult,
} from '../types/greenhouse.types';

export class GreenhouseJobScraper {
  private prisma: PrismaClient;
  private httpClient: AxiosInstance;
  private readonly baseUrl = 'https://boards-api.greenhouse.io/v1/boards';

  constructor() {
    this.prisma = new PrismaClient();

    this.httpClient = axios.create({
      timeout: 30000,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'JobSwipe-Scraper/1.0 (Job Aggregation)',
      },
    });
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  /**
   * Scrape all jobs from a Greenhouse company
   */
  async scrapeCompany(
    companyId: string,
    config?: Partial<ScraperConfig>
  ): Promise<ScraperResult> {
    const startTime = Date.now();
    const result: ScraperResult = {
      success: false,
      companyId,
      jobsProcessed: 0,
      jobsFailed: 0,
      errors: [],
      duration: 0,
    };

    console.log(`\n🌱 Starting Greenhouse scrape for: ${companyId}`);
    console.log('━'.repeat(60));

    try {
      // 1. Fetch all job listings
      const listings = await this.fetchJobListings(companyId);
      console.log(`📋 Found ${listings.length} active jobs\n`);

      if (listings.length === 0) {
        console.log('⚠️  No jobs found for this company');
        result.success = true;
        result.duration = Date.now() - startTime;
        return result;
      }

      // 2. Process each job
      for (let i = 0; i < listings.length; i++) {
        const listing = listings[i];

        try {
          console.log(
            `[${i + 1}/${listings.length}] Processing: ${listing.title}`
          );

          await this.processJob(companyId, listing);

          result.jobsProcessed++;
          console.log(`✅ Saved successfully\n`);

          // Rate limiting
          const delay = config?.rateLimit?.delayBetweenRequests || 1000;
          await this.delay(delay);
        } catch (error) {
          result.jobsFailed++;
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          result.errors.push({
            jobId: listing.id,
            error: errorMessage,
          });

          console.error(`❌ Failed: ${errorMessage}\n`);
          continue;
        }
      }

      result.success = true;
      result.duration = Date.now() - startTime;

      console.log('━'.repeat(60));
      console.log('📊 Scraping Summary:');
      console.log(`   ✅ Processed: ${result.jobsProcessed}`);
      console.log(`   ❌ Failed: ${result.jobsFailed}`);
      console.log(`   ⏱️  Duration: ${(result.duration / 1000).toFixed(2)}s`);
      console.log('━'.repeat(60));

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`\n❌ Company scrape failed: ${errorMessage}`);
      result.duration = Date.now() - startTime;
      throw error;
    }
  }

  /**
   * Test connection to Greenhouse API for a company
   */
  async testConnection(companyId: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/${companyId}/jobs`;
      const response = await this.httpClient.get(url);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.prisma.$disconnect();
  }

  // ==========================================================================
  // PRIVATE METHODS - SCRAPING
  // ==========================================================================

  /**
   * Fetch all job listings for a company
   */
  private async fetchJobListings(
    companyId: string
  ): Promise<GreenhouseJobListing[]> {
    const url = `${this.baseUrl}/${companyId}/jobs`;

    try {
      const response = await this.httpClient.get<GreenhouseJobsResponse>(url);
      return response.data.jobs || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(
            `Company '${companyId}' not found on Greenhouse. Check the company ID.`
          );
        }
        throw new Error(
          `Failed to fetch jobs: ${error.response?.status} ${error.response?.statusText}`
        );
      }
      throw error;
    }
  }

  /**
   * Fetch detailed job info including application questions
   */
  private async fetchJobDetails(
    companyId: string,
    jobId: number
  ): Promise<GreenhouseJobDetails> {
    const url = `${this.baseUrl}/${companyId}/jobs/${jobId}`;

    try {
      const response = await this.httpClient.get<GreenhouseJobDetails>(url, {
        params: {
          questions: 'true', // REQUEST APPLICATION QUESTIONS
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to fetch job details: ${error.response?.status}`
        );
      }
      throw error;
    }
  }

  /**
   * Process a single job - main orchestration method
   */
  private async processJob(
    companyId: string,
    listing: GreenhouseJobListing
  ): Promise<void> {
    // 1. Fetch detailed job info with questions
    const details = await this.fetchJobDetails(companyId, listing.id);

    // 2. Extract and classify form fields
    const classifiedFields = this.classifyFormFields(
      details.questions || []
    );

    // 3. Calculate automation metrics
    const metrics = this.calculateAutomationMetrics(classifiedFields);

    // 4. Build application schema
    const applicationSchema = this.buildApplicationSchema(
      details,
      companyId,
      classifiedFields,
      metrics
    );

    // 5. Find or create company
    const company = await this.upsertCompany(companyId, details);

    // 6. Upsert job posting to database
    await this.upsertJobPosting(company.id, details, applicationSchema, metrics);

    console.log(
      `   📊 Success Rate: ${metrics.estimatedSuccessRate}% (${metrics.automationFeasibility})`
    );
    console.log(
      `   🤖 Pre-filled: ${metrics.prefilledFieldCount}/${metrics.totalRequiredFields} | AI: ${metrics.aiRequiredFieldCount}`
    );
  }

  // ==========================================================================
  // PRIVATE METHODS - FIELD CLASSIFICATION
  // ==========================================================================

  /**
   * Classify all form fields from application questions
   */
  private classifyFormFields(
    questions: GreenhouseQuestion[]
  ): ClassifiedField[] {
    const classified: ClassifiedField[] = [];

    for (const question of questions) {
      for (const field of question.fields) {
        const classification = this.classifyField(field, question);

        classified.push({
          id: field.name,
          type: field.type,
          label: question.label,
          required: question.required,
          description: question.description || undefined,
          options: field.values,
          allowedFiletypes: field.allowed_filetypes,
          ...classification,
        });
      }
    }

    return classified;
  }

  /**
   * Classify a single field to determine answer strategy
   */
  private classifyField(
    field: GreenhouseField,
    question: GreenhouseQuestion
  ): {
    answerStrategy: AnswerStrategy;
    profileMapping?: string;
    aiInstructions?: string;
    confidence: number;
  } {
    const label = question.label.toLowerCase();
    const fieldName = field.name.toLowerCase();

    // FILE UPLOADS
    if (field.type === 'input_file') {
      const isResume =
        label.includes('resume') || label.includes('cv');
      return {
        answerStrategy: 'FILE_UPLOAD',
        profileMapping: isResume ? 'resumeUrl' : undefined,
        confidence: 1.0,
      };
    }

    // FIRST NAME
    if (
      label.includes('first name') ||
      fieldName.includes('first_name') ||
      fieldName === 'first_name'
    ) {
      return {
        answerStrategy: 'PROFILE_DIRECT',
        profileMapping: 'firstName',
        confidence: 1.0,
      };
    }

    // LAST NAME
    if (
      label.includes('last name') ||
      fieldName.includes('last_name') ||
      fieldName === 'last_name'
    ) {
      return {
        answerStrategy: 'PROFILE_DIRECT',
        profileMapping: 'lastName',
        confidence: 1.0,
      };
    }

    // EMAIL
    if (label.includes('email') || field.type === 'input_email') {
      return {
        answerStrategy: 'PROFILE_DIRECT',
        profileMapping: 'email',
        confidence: 1.0,
      };
    }

    // PHONE
    if (label.includes('phone') || field.type === 'input_tel') {
      return {
        answerStrategy: 'PROFILE_DIRECT',
        profileMapping: 'phone',
        confidence: 1.0,
      };
    }

    // LINKEDIN
    if (label.includes('linkedin')) {
      return {
        answerStrategy: 'PROFILE_DIRECT',
        profileMapping: 'linkedin',
        confidence: 1.0,
      };
    }

    // WEBSITE / PORTFOLIO
    if (label.includes('website') || label.includes('portfolio')) {
      return {
        answerStrategy: 'PROFILE_DIRECT',
        profileMapping: label.includes('portfolio') ? 'portfolio' : 'website',
        confidence: 0.9,
      };
    }

    // GITHUB
    if (label.includes('github')) {
      return {
        answerStrategy: 'PROFILE_DIRECT',
        profileMapping: 'github',
        confidence: 1.0,
      };
    }

    // VISA SPONSORSHIP
    if (label.includes('visa') || label.includes('sponsorship')) {
      return {
        answerStrategy: 'PROFILE_BOOLEAN',
        profileMapping: 'needsVisaSponsorship',
        confidence: 1.0,
      };
    }

    // RELOCATION
    if (label.includes('relocation') || label.includes('relocate')) {
      return {
        answerStrategy: 'PROFILE_BOOLEAN',
        profileMapping: 'willingToRelocate',
        confidence: 1.0,
      };
    }

    // WORK AUTHORIZATION
    if (
      label.includes('authorized to work') ||
      label.includes('work authorization')
    ) {
      return {
        answerStrategy: 'PROFILE_DIRECT',
        profileMapping: 'workAuthorization',
        confidence: 0.9,
      };
    }

    // YEARS OF EXPERIENCE
    if (
      (label.includes('years') || label.includes('experience')) &&
      field.type !== 'textarea' &&
      !label.includes('describe')
    ) {
      return {
        answerStrategy: 'PROFILE_CALCULATED',
        profileMapping: 'yearsOfExperience',
        confidence: 0.8,
      };
    }

    // COVER LETTER / WHY US / LONG FORM
    if (
      label.includes('cover letter') ||
      label.includes('why') ||
      label.includes('tell us about') ||
      label.includes('describe your') ||
      (field.type === 'textarea' && question.required && label.length > 20)
    ) {
      return {
        answerStrategy: 'AI_GENERATE',
        aiInstructions: `Generate personalized response for: "${question.label}"`,
        confidence: 0.9,
      };
    }

    // REQUIRED SELECT/MULTI-SELECT (AI can handle with context)
    if (
      question.required &&
      (field.type === 'multi_value_single_select' ||
        field.type === 'multi_value_multi_select')
    ) {
      return {
        answerStrategy: 'AI_ASSISTED',
        aiInstructions: `Choose appropriate option for: "${question.label}"`,
        confidence: 0.7,
      };
    }

    // OPTIONAL FIELDS - SKIP
    if (!question.required) {
      return {
        answerStrategy: 'SKIP',
        confidence: 1.0,
      };
    }

    // DEFAULT: AI ASSISTED FOR REQUIRED FIELDS
    return {
      answerStrategy: 'AI_ASSISTED',
      aiInstructions: `Answer question: "${question.label}"`,
      confidence: 0.5,
    };
  }

  // ==========================================================================
  // PRIVATE METHODS - METRICS & SCHEMA
  // ==========================================================================

  /**
   * Calculate automation success metrics
   */
  private calculateAutomationMetrics(
    fields: ClassifiedField[]
  ): AutomationMetrics {
    const requiredFields = fields.filter((f) => f.required);
    const totalRequired = requiredFields.length;

    if (totalRequired === 0) {
      return {
        estimatedSuccessRate: 95,
        automationFeasibility: 'high',
        prefilledFieldCount: 0,
        aiRequiredFieldCount: 0,
        totalRequiredFields: 0,
      };
    }

    // Count by strategy
    const deterministic = requiredFields.filter((f) =>
      [
        'PROFILE_DIRECT',
        'PROFILE_CALCULATED',
        'PROFILE_BOOLEAN',
        'FILE_UPLOAD',
      ].includes(f.answerStrategy)
    ).length;

    const aiGenerated = requiredFields.filter(
      (f) => f.answerStrategy === 'AI_GENERATE'
    ).length;

    const aiAssisted = requiredFields.filter(
      (f) => f.answerStrategy === 'AI_ASSISTED'
    ).length;

    // Calculate weighted success rate
    // Deterministic: 98% success
    // AI Generated: 90% success
    // AI Assisted: 75% success
    const successRate =
      (deterministic * 0.98 + aiGenerated * 0.9 + aiAssisted * 0.75) /
      totalRequired;

    const estimatedSuccessRate = Math.round(successRate * 100);

    // Determine feasibility
    let automationFeasibility: 'high' | 'medium' | 'low';
    if (estimatedSuccessRate >= 85) {
      automationFeasibility = 'high';
    } else if (estimatedSuccessRate >= 70) {
      automationFeasibility = 'medium';
    } else {
      automationFeasibility = 'low';
    }

    return {
      estimatedSuccessRate,
      automationFeasibility,
      prefilledFieldCount: deterministic,
      aiRequiredFieldCount: aiGenerated + aiAssisted,
      totalRequiredFields: totalRequired,
    };
  }

  /**
   * Build complete application schema
   */
  private buildApplicationSchema(
    details: GreenhouseJobDetails,
    companyId: string,
    fields: ClassifiedField[],
    metrics: AutomationMetrics
  ): ApplicationSchema {
    return {
      jobId: details.id.toString(),
      companyId,
      jobTitle: details.title,
      applicationUrl: details.absolute_url,
      fields,
      metadata: {
        totalFields: fields.length,
        requiredFields: fields.filter((f) => f.required).length,
        optionalFields: fields.filter((f) => !f.required).length,
        hasFileUploads: fields.some((f) => f.answerStrategy === 'FILE_UPLOAD'),
        hasCoverLetter: fields.some(
          (f) =>
            f.answerStrategy === 'AI_GENERATE' &&
            f.label.toLowerCase().includes('cover letter')
        ),
        estimatedSuccessRate: metrics.estimatedSuccessRate,
        automationFeasibility: metrics.automationFeasibility,
      },
      scrapedAt: new Date().toISOString(),
      schemaVersion: '1.0',
    };
  }

  // ==========================================================================
  // PRIVATE METHODS - DATABASE
  // ==========================================================================

  /**
   * Upsert company to database
   */
  private async upsertCompany(companyId: string, details: GreenhouseJobDetails) {
    const companyName =
      companyId.charAt(0).toUpperCase() + companyId.slice(1).replace(/-/g, ' ');

    return await this.prisma.company.upsert({
      where: { slug: companyId },
      update: {
        updatedAt: new Date(),
      },
      create: {
        name: companyName,
        slug: companyId,
        status: 'ACTIVE',
        website: `https://www.${companyId}.com`,
      },
    });
  }

  /**
   * Upsert job posting to database with full schema
   */
  private async upsertJobPosting(
    companyId: string,
    details: GreenhouseJobDetails,
    applicationSchema: ApplicationSchema,
    metrics: AutomationMetrics
  ) {
    const externalId = `greenhouse_${details.internal_job_id}`;
    const greenhouseCompanyId = details.absolute_url.split('/')[3]; // Extract from URL
    const greenhouseJobId = details.id.toString();

    await this.prisma.jobPosting.upsert({
      where: {
        externalId,
      },
      update: {
        title: details.title,
        description: this.stripHtml(details.content || ''),
        location: details.location.name,
        sourceUrl: details.absolute_url,
        applyUrl: details.absolute_url,
        source: 'COMPANY_WEBSITE',

        // Greenhouse-specific fields
        greenhouseCompanyId,
        greenhouseJobId,
        applicationSchema: applicationSchema as any,

        // Automation metrics
        automationFeasibility: metrics.automationFeasibility,
        estimatedSuccessRate: metrics.estimatedSuccessRate,
        prefilledFieldCount: metrics.prefilledFieldCount,
        aiRequiredFieldCount: metrics.aiRequiredFieldCount,
        totalRequiredFields: metrics.totalRequiredFields,

        // Timestamps
        lastSchemaUpdate: new Date(),
        lastScrapedAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        title: details.title,
        description: this.stripHtml(details.content || ''),
        location: details.location.name,
        sourceUrl: details.absolute_url,
        applyUrl: details.absolute_url,
        companyId,
        externalId,
        source: 'COMPANY_WEBSITE',
        status: 'ACTIVE',

        // Greenhouse-specific fields
        greenhouseCompanyId,
        greenhouseJobId,
        applicationSchema: applicationSchema as any,

        // Automation metrics
        automationFeasibility: metrics.automationFeasibility,
        estimatedSuccessRate: metrics.estimatedSuccessRate,
        prefilledFieldCount: metrics.prefilledFieldCount,
        aiRequiredFieldCount: metrics.aiRequiredFieldCount,
        totalRequiredFields: metrics.totalRequiredFields,

        // Timestamps
        lastSchemaUpdate: new Date(),
        lastScrapedAt: new Date(),
      },
    });
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
