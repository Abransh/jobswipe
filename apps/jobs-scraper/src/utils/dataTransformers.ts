/**
 * Data Transformation Utilities
 *
 * Convert AI-extracted data to Prisma enum types and format for database insertion
 */

import { JobLevel, JobCategory, RemoteType, SalaryType } from '@jobswipe/database';
import { JobIntelligenceData, EnrichedJobData, DirectAPIData, CompleteJobData } from '../types/greenhouse.types';

/**
 * Map AI level string to Prisma JobLevel enum
 */
export function mapToJobLevel(level: string): JobLevel {
  const mapping: Record<string, JobLevel> = {
    ENTRY: JobLevel.ENTRY,
    MID: JobLevel.MID,
    SENIOR: JobLevel.SENIOR,
    LEAD: JobLevel.LEAD,
    PRINCIPAL: JobLevel.PRINCIPAL,
  };

  return mapping[level] || JobLevel.MID;
}

/**
 * Map AI category string to Prisma JobCategory enum
 */
export function mapToJobCategory(category: string): JobCategory {
  const mapping: Record<string, JobCategory> = {
    ENGINEERING: JobCategory.ENGINEERING,
    DESIGN: JobCategory.DESIGN,
    PRODUCT: JobCategory.PRODUCT,
    SALES: JobCategory.SALES,
    MARKETING: JobCategory.MARKETING,
    OPERATIONS: JobCategory.OPERATIONS,
    FINANCE: JobCategory.FINANCE,
    HR: JobCategory.HUMAN_RESOURCES,
    LEGAL: JobCategory.LEGAL,
    DATA_SCIENCE: JobCategory.DATA_SCIENCE,
    CUSTOMER_SUCCESS: JobCategory.CUSTOMER_SUCCESS,
    OTHER: JobCategory.OTHER,
  };

  return mapping[category] || JobCategory.OTHER;
}

/**
 * Map AI remoteType string to Prisma RemoteType enum
 */
export function mapToRemoteType(remoteType: string): RemoteType {
  const mapping: Record<string, RemoteType> = {
    REMOTE: RemoteType.REMOTE,
    HYBRID: RemoteType.HYBRID,
    ONSITE: RemoteType.ONSITE,
  };

  return mapping[remoteType] || RemoteType.ONSITE;
}

/**
 * Map period string to Prisma SalaryType enum
 */
export function mapToSalaryType(period?: string): SalaryType | undefined {
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

/**
 * Format requirements as bullet-pointed text
 */
export function formatRequirements(requirements: { bulletPoints: string[]; summary: string }): string {
  if (requirements.bulletPoints.length === 0) {
    return requirements.summary || '';
  }

  return requirements.bulletPoints.map((point) => `• ${point}`).join('\n');
}

/**
 * Format education details
 */
export function formatEducation(education: { required: string; field?: string; details?: string }): string | undefined {
  if (education.details) return education.details;
  if (education.required === 'NONE') return undefined;

  let text = education.required.replace('_', ' ').toLowerCase();
  text = text.charAt(0).toUpperCase() + text.slice(1);

  if (education.field) {
    text += ` in ${education.field}`;
  }

  return text;
}

/**
 * Calculate quality score based on data completeness
 */
export function calculateQualityScore(
  intelligence: JobIntelligenceData,
  enrichment?: EnrichedJobData
): number {
  let score = 0;
  let maxScore = 0;

  // Intelligence data (70 points)
  maxScore += 10;
  if (intelligence.requirements.bulletPoints.length > 0) score += 10;

  maxScore += 15;
  if (intelligence.skills.required.length > 0) score += 15;

  maxScore += 10;
  if (intelligence.experience.yearsMin !== null && intelligence.experience.yearsMin !== undefined) score += 10;

  maxScore += 10;
  if (intelligence.keywords.length >= 5) score += 10;

  maxScore += 10;
  if (intelligence.tags.length >= 3) score += 10;

  maxScore += 15;
  score += (intelligence.confidence.overall / 100) * 15;

  // Enrichment data (30 points)
  if (enrichment) {
    maxScore += 10;
    if (enrichment.salary?.min || enrichment.salary?.max) score += 10;

    maxScore += 10;
    if (enrichment.visaSponsorship) score += 10;

    maxScore += 10;
    if (enrichment.benefits && enrichment.benefits.length > 0) score += 10;
  }

  // Normalize to 0-1 scale
  return maxScore > 0 ? score / maxScore : 0.5;
}

/**
 * Merge all data sources into complete job data
 */
export function mergeJobData(
  title: string,
  description: string,
  directData: DirectAPIData,
  intelligence: JobIntelligenceData,
  enrichment?: EnrichedJobData
): CompleteJobData {
  return {
    // Basic info
    title,
    description,

    // From direct API extraction
    department: directData.department,
    location: directData.location,
    city: directData.city,
    state: directData.state,
    country: directData.country,
    remote: directData.remote || intelligence.remoteType === 'REMOTE',

    // From AI intelligence extraction
    requirements: formatRequirements(intelligence.requirements),
    experienceYears: intelligence.experience.yearsMin,
    level: mapToJobLevel(intelligence.experience.level),
    category: mapToJobCategory(intelligence.category),
    remoteType: mapToRemoteType(intelligence.remoteType),
    skills: intelligence.skills.required,
    education: formatEducation(intelligence.education),
    languages: intelligence.languages,
    keywords: intelligence.keywords,
    tags: intelligence.tags,

    // From enrichment (salary, benefits, visa)
    salaryMin: enrichment?.salary?.min,
    salaryMax: enrichment?.salary?.max,
    currency: enrichment?.salary?.currency,
    salaryType: mapToSalaryType(enrichment?.salary?.period),
    equity: enrichment?.salary?.equity,
    bonus: enrichment?.salary?.bonus,

    // Metadata
    qualityScore: calculateQualityScore(intelligence, enrichment),

    // Store additional enrichment data in JSON
    formMetadata: enrichment
      ? {
          visaSponsorship: enrichment.visaSponsorship,
          remote: enrichment.remote,
          benefits: enrichment.benefits,
          enrichmentMetadata: enrichment.metadata,
          intelligenceMetadata: intelligence.metadata,
          intelligenceConfidence: intelligence.confidence,
          preferredSkills: intelligence.skills.preferred,
        }
      : {
          intelligenceMetadata: intelligence.metadata,
          intelligenceConfidence: intelligence.confidence,
          preferredSkills: intelligence.skills.preferred,
        },
  };
}

/**
 * Generate tags from job data
 */
export function generateAdditionalTags(data: CompleteJobData): string[] {
  const tags = [...data.tags];

  // Add experience level tag
  if (data.level) {
    tags.push(`${data.level.toLowerCase()}-level`);
  }

  // Add remote tag
  if (data.remote || data.remoteType === RemoteType.REMOTE) {
    tags.push('remote-friendly');
  }

  // Add category tag
  if (data.category) {
    tags.push(data.category.toLowerCase());
  }

  // Add top skills as tags (limit to 3)
  const topSkills = data.skills.slice(0, 3).map((s) => s.toLowerCase());
  tags.push(...topSkills);

  // Remove duplicates and return
  return Array.from(new Set(tags));
}
