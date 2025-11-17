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
import { PrismaClient, SalaryType } from '@/../../packages/database/src/generated';;
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
  EnrichedJobData,
  JobIntelligenceData,
  CompleteJobData,
} from '../types/greenhouse.types';
import { JobDescriptionEnrichment } from './JobDescriptionEnrichment';
import { JobIntelligenceExtractor } from './JobIntelligenceExtractor';
import { mergeJobData } from '../utils/dataTransformers';

export class GreenhouseJobScraper {
  private prisma: PrismaClient;
  private httpClient: AxiosInstance;
  private enrichment?: JobDescriptionEnrichment;
  private intelligence: JobIntelligenceExtractor;
  private enableEnrichment: boolean;
  private readonly baseUrl = 'https://boards-api.greenhouse.io/v1/boards';

  constructor(config?: { enableEnrichment?: boolean }) {
    this.prisma = new PrismaClient();
    this.enableEnrichment = config?.enableEnrichment ?? false;

    this.httpClient = axios.create({
      timeout: 30000,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'JobSwipe-Scraper/1.0 (Job Aggregation)',
      },
    });

    // Initialize intelligence extractor (ALWAYS enabled)
    try {
      this.intelligence = new JobIntelligenceExtractor();
      console.log('🧠 Job intelligence extraction enabled');
    } catch (error) {
      throw new Error(`Failed to initialize intelligence extractor: ${error}`);
    }

    // Initialize optional enrichment service (salary, visa, benefits)
    if (this.enableEnrichment) {
      try {
        this.enrichment = new JobDescriptionEnrichment();
        console.log('💰 Salary/benefits enrichment enabled');
      } catch (error) {
        console.warn('⚠️  Failed to initialize enrichment service:', error);
        this.enableEnrichment = false;
      }
    }
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
   * Process a single job - main orchestration method with comprehensive intelligence extraction
   */
  private async processJob(
    companyId: string,
    listing: GreenhouseJobListing
  ): Promise<void> {
    // 1. Fetch detailed job info with questions
    const details = await this.fetchJobDetails(companyId, listing.id);

    // 2. Extract direct data from API (department, location)
    const directData = this.intelligence.extractDirectData(details);

    // 3. Extract job intelligence from description (requirements, skills, experience, etc.)
    const intelligenceData = await this.intelligence.extract(
      details.title,
      details.content || '',
      directData
    );

    // Log extracted intelligence
    console.log(`   🎯 Level: ${intelligenceData.experience.level} | Years: ${intelligenceData.experience.yearsMin || 'N/A'}`);
    console.log(`   💼 Skills: ${intelligenceData.skills.required.slice(0, 3).join(', ')}${intelligenceData.skills.required.length > 3 ? '...' : ''}`);

    // 4. Optional: Enrich with salary/benefits data (if enabled)
    let enrichedData: EnrichedJobData | undefined;
    if (this.enableEnrichment && this.enrichment && details.content) {
      enrichedData = await this.enrichment.enrichJobDescription(
        details.title,
        details.content,
        companyId
      );

      if (enrichedData.salary?.min || enrichedData.salary?.max) {
        console.log(`   💰 Salary: ${enrichedData.salary.currency ?? '$'}${enrichedData.salary.min}-${enrichedData.salary.max}`);
      }
      if (enrichedData.visaSponsorship) {
        console.log(`   🛂 Visa: ${enrichedData.visaSponsorship.available ? 'Available' : 'Not Available'}`);
      }
    }

    // 5. Merge all data into complete job data
    const completeJobData = mergeJobData(
      details.title,
      this.stripHtml(details.content || ''),
      directData,
      intelligenceData,
      enrichedData
    );

    // 6. Extract and classify form fields (for automation)
    const classifiedFields = this.classifyFormFields(
      details.questions || []
    );

    // 7. Calculate automation metrics
    const metrics = this.calculateAutomationMetrics(classifiedFields);

    // 8. Build application schema
    const applicationSchema = this.buildApplicationSchema(
      details,
      companyId,
      classifiedFields,
      metrics
    );

    // 9. Find or create company
    const company = await this.upsertCompany(companyId, details);

    // 10. Upsert job posting to database with ALL extracted data
    await this.upsertJobPosting(
      company.id,
      details,
      completeJobData,
      applicationSchema,
      metrics
    );

    console.log(
      `   📊 Automation: ${metrics.estimatedSuccessRate}% | Quality: ${Math.round((completeJobData.qualityScore || 0) * 100)}%`
    );
    console.log(
      `   🏷️  Tags: ${completeJobData.tags.slice(0, 5).join(', ')}`
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
   * Upsert job posting to database with full schema and intelligence-extracted data
   */
  private async upsertJobPosting(
    companyId: string,
    details: GreenhouseJobDetails,
    completeJobData: CompleteJobData,
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
        title: completeJobData.title,
        description: completeJobData.description,
        location: completeJobData.location,
        sourceUrl: details.absolute_url,
        applyUrl: details.absolute_url,
        source: 'COMPANY_WEBSITE',

        // Location data (parsed from API)
        city: completeJobData.city,
        state: completeJobData.state,
        country: completeJobData.country,
        remote: completeJobData.remote,

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

        // Intelligence-extracted fields
        department: completeJobData.department,
        requirements: completeJobData.requirements,
        experienceYears: completeJobData.experienceYears,
        level: completeJobData.level,
        category: completeJobData.category,
        remoteType: completeJobData.remoteType,
        skills: completeJobData.skills,
        education: completeJobData.education,
        languages: completeJobData.languages,
        keywords: completeJobData.keywords,
        tags: completeJobData.tags,

        // Enrichment fields (salary, visa, benefits)
        salaryMin: completeJobData.salaryMin,
        salaryMax: completeJobData.salaryMax,
        currency: completeJobData.currency,
        salaryType: completeJobData.salaryType,
        equity: completeJobData.equity,
        bonus: completeJobData.bonus,

        // Quality score and metadata
        qualityScore: completeJobData.qualityScore,
        formMetadata: completeJobData.formMetadata as any,

        // Timestamps
        lastSchemaUpdate: new Date(),
        lastScrapedAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        title: completeJobData.title,
        description: completeJobData.description,
        location: completeJobData.location,
        sourceUrl: details.absolute_url,
        applyUrl: details.absolute_url,
        companyId,
        externalId,
        source: 'COMPANY_WEBSITE',
        status: 'ACTIVE',

        // Location data (parsed from API)
        city: completeJobData.city,
        state: completeJobData.state,
        country: completeJobData.country,
        remote: completeJobData.remote,

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

        // Intelligence-extracted fields
        department: completeJobData.department,
        requirements: completeJobData.requirements,
        experienceYears: completeJobData.experienceYears,
        level: completeJobData.level,
        category: completeJobData.category,
        remoteType: completeJobData.remoteType,
        skills: completeJobData.skills,
        education: completeJobData.education,
        languages: completeJobData.languages,
        keywords: completeJobData.keywords,
        tags: completeJobData.tags,

        // Enrichment fields (salary, visa, benefits)
        salaryMin: completeJobData.salaryMin,
        salaryMax: completeJobData.salaryMax,
        currency: completeJobData.currency,
        salaryType: completeJobData.salaryType,
        equity: completeJobData.equity,
        bonus: completeJobData.bonus,

        // Quality score and metadata
        qualityScore: completeJobData.qualityScore,
        formMetadata: completeJobData.formMetadata as any,

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

  /**
   * Map LLM period string to Prisma SalaryType enum
   */
  private mapPeriodToSalaryType(period?: string): SalaryType | undefined {
    if (!period) return undefined;

    const mapping: Record<string, SalaryType> = {
      yearly: SalaryType.ANNUAL,
      hourly: SalaryType.HOURLY,
      monthly: SalaryType.MONTHLY,
      daily: SalaryType.DAILY,
      weekly: SalaryType.WEEKLY,
    };

    return mapping[period.toLowerCase()];
  }
}
