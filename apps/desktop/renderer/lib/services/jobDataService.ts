/**
 * Job Data Service
 * Handles fetching jobs from external APIs and processing for storage
 */

import { z } from 'zod';

// External job API response schemas
const ExternalJobSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.object({
    name: z.string(),
    logo: z.string().optional(),
    website: z.string().optional(),
  }),
  description: z.string(),
  location: z.string().optional(),
  salary: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default('USD'),
  }).optional(),
  remote: z.boolean().default(false),
  jobType: z.string().default('FULL_TIME'),
  level: z.string().default('MID'),
  skills: z.array(z.string()).default([]),
  postedAt: z.string().or(z.date()).optional(),
  applyUrl: z.string().url().optional(),
  source: z.string().default('api'),
});

const ExternalJobsResponseSchema = z.object({
  jobs: z.array(ExternalJobSchema),
  totalCount: z.number().optional(),
  nextPage: z.string().optional(),
});

type ExternalJob = z.infer<typeof ExternalJobSchema>;
type ExternalJobsResponse = z.infer<typeof ExternalJobsResponseSchema>;

// Internal job data structure for database storage
export interface ProcessedJobData {
  externalId: string;
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  
  // Job classification
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY' | 'FREELANCE';
  level: 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'PRINCIPAL' | 'MANAGER' | 'DIRECTOR' | 'C_LEVEL';
  category: string;
  
  // Work arrangement
  remote: 'ONSITE' | 'REMOTE' | 'HYBRID';
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  coordinates?: { lat: number; lng: number };
  
  // Compensation
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  salaryType?: 'HOURLY' | 'ANNUAL' | 'CONTRACT';
  
  // Skills and requirements
  skills: string[];
  experienceYears?: number;
  education?: string;
  
  // Company data
  companyName: string;
  companyLogo?: string;
  companyWebsite?: string;
  companyIndustry?: string;
  
  // External integration
  source: 'LINKEDIN' | 'INDEED' | 'GLASSDOOR' | 'ANGELLIST' | 'COMPANY_WEBSITE' | 'OTHER';
  sourceUrl?: string;
  applyUrl?: string;
  
  // Metadata
  qualityScore?: number;
  isVerified: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isUrgent: boolean;
  
  // Dates
  postedAt?: Date;
  expiresAt?: Date;
  lastScrapedAt: Date;
}

export class JobDataService {
  private apiEndpoints = {
    // Example job APIs - these would be real endpoints
    adzuna: process.env.ADZUNA_API_URL || 'https://api.adzuna.com/v1/api/jobs',
    theJob: process.env.THEJOB_API_URL || 'https://api.thejob.com/v1/jobs',
    remoteOk: process.env.REMOTEOK_API_URL || 'https://remoteok.io/api',
    // Add more job APIs as needed
  };

  private apiKeys = {
    adzuna: {
      appId: process.env.ADZUNA_APP_ID,
      appKey: process.env.ADZUNA_APP_KEY,
    },
    theJob: process.env.THEJOB_API_KEY,
    // Add more API keys as needed
  };

  /**
   * Fetch jobs from multiple external APIs
   */
  async fetchJobsFromAPIs(params: {
    location?: string;
    keywords?: string;
    page?: number;
    limit?: number;
    sources?: string[];
  }): Promise<ProcessedJobData[]> {
    const { location = 'Italy', keywords = 'software engineer', page = 1, limit = 50, sources = ['adzuna', 'remoteOk'] } = params;
    
    const allJobs: ProcessedJobData[] = [];
    
    // Fetch from each enabled source
    const fetchPromises = sources.map(async (source) => {
      try {
        switch (source) {
          case 'adzuna':
            return await this.fetchFromAdzuna({ location, keywords, page, limit });
          case 'remoteOk':
            return await this.fetchFromRemoteOk({ keywords, page, limit });
          case 'theJob':
            return await this.fetchFromTheJob({ location, keywords, page, limit });
          default:
            console.warn(`Unknown job source: ${source}`);
            return [];
        }
      } catch (error) {
        console.error(`Error fetching jobs from ${source}:`, error);
        return [];
      }
    });

    const results = await Promise.allSettled(fetchPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allJobs.push(...result.value);
      } else {
        console.error(`Failed to fetch from ${sources[index]}:`, result.reason);
      }
    });

    // Deduplicate jobs based on title, company, and location
    const uniqueJobs = this.deduplicateJobs(allJobs);
    
    // Enhance job data with quality scoring and categorization
    const enhancedJobs = uniqueJobs.map(job => this.enhanceJobData(job));
    
    // Sort by quality score and recency
    return enhancedJobs.sort((a, b) => {
      const scoreA = (a.qualityScore || 0) + (a.isFeatured ? 10 : 0);
      const scoreB = (b.qualityScore || 0) + (b.isFeatured ? 10 : 0);
      return scoreB - scoreA;
    });
  }

  /**
   * Fetch jobs from Adzuna API
   */
  private async fetchFromAdzuna(params: { location: string; keywords: string; page: number; limit: number }): Promise<ProcessedJobData[]> {
    const { location, keywords, page, limit } = params;
    
    if (!this.apiKeys.adzuna.appId || !this.apiKeys.adzuna.appKey) {
      console.warn('Adzuna API credentials not configured');
      return this.generateMockJobs('adzuna', limit);
    }

    try {
      const url = new URL(`${this.apiEndpoints.adzuna}/it/search/${page}`);
      url.searchParams.set('app_id', this.apiKeys.adzuna.appId!);
      url.searchParams.set('app_key', this.apiKeys.adzuna.appKey!);
      url.searchParams.set('what', keywords);
      url.searchParams.set('where', location);
      url.searchParams.set('results_per_page', limit.toString());
      url.searchParams.set('sort_by', 'relevance');

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Adzuna API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.results?.map((job: any) => this.transformAdzunaJob(job)) || [];
    } catch (error) {
      console.error('Error fetching from Adzuna:', error);
      return this.generateMockJobs('adzuna', limit);
    }
  }

  /**
   * Fetch jobs from RemoteOK API
   */
  private async fetchFromRemoteOk(params: { keywords: string; page: number; limit: number }): Promise<ProcessedJobData[]> {
    try {
      const response = await fetch(`${this.apiEndpoints.remoteOk}?tags=${encodeURIComponent(params.keywords)}`);
      
      if (!response.ok) {
        throw new Error(`RemoteOK API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // RemoteOK returns an array directly
      return Array.isArray(data) 
        ? data.slice(0, params.limit).map((job: any) => this.transformRemoteOkJob(job))
        : [];
    } catch (error) {
      console.error('Error fetching from RemoteOK:', error);
      return this.generateMockJobs('remoteOk', params.limit);
    }
  }

  /**
   * Fetch jobs from TheJob API (example)
   */
  private async fetchFromTheJob(params: { location: string; keywords: string; page: number; limit: number }): Promise<ProcessedJobData[]> {
    // This is a placeholder for another job API
    console.log('TheJob API integration not implemented yet');
    return this.generateMockJobs('theJob', params.limit);
  }

  /**
   * Transform Adzuna job data to our internal format
   */
  private transformAdzunaJob(job: any): ProcessedJobData {
    return {
      externalId: job.id?.toString() || `adzuna-${Date.now()}-${Math.random()}`,
      title: job.title || 'Software Engineer',
      description: job.description || 'No description available',
      type: this.mapJobType(job.contract_type),
      level: this.mapJobLevel(job.title),
      category: this.categorizeJob(job.title, job.description),
      remote: job.location?.area?.includes('Remote') ? 'REMOTE' : 'ONSITE',
      location: job.location?.display_name || job.location?.area?.[0] || 'Milan, Italy',
      city: job.location?.area?.[1] || 'Milan',
      state: job.location?.area?.[2] || 'Lombardy',
      country: job.location?.area?.[3] || 'Italy',
      salaryMin: job.salary_min ? Math.round(job.salary_min) : undefined,
      salaryMax: job.salary_max ? Math.round(job.salary_max) : undefined,
      currency: 'EUR',
      salaryType: 'ANNUAL',
      skills: this.extractSkills(job.title, job.description),
      companyName: job.company?.display_name || 'Unknown Company',
      companyWebsite: job.redirect_url,
      source: 'OTHER',
      sourceUrl: job.redirect_url,
      applyUrl: job.redirect_url,
      qualityScore: this.calculateQualityScore(job),
      isVerified: false,
      isActive: true,
      isFeatured: false,
      isUrgent: false,
      postedAt: job.created ? new Date(job.created) : new Date(),
      lastScrapedAt: new Date(),
    };
  }

  /**
   * Transform RemoteOK job data to our internal format
   */
  private transformRemoteOkJob(job: any): ProcessedJobData {
    return {
      externalId: job.id?.toString() || `remoteok-${Date.now()}-${Math.random()}`,
      title: job.position || 'Remote Position',
      description: job.description || 'No description available',
      type: 'FULL_TIME',
      level: this.mapJobLevel(job.position),
      category: this.categorizeJob(job.position, job.description),
      remote: 'REMOTE',
      location: 'Remote',
      city: undefined,
      state: undefined,
      country: 'Worldwide',
      skills: job.tags || [],
      companyName: job.company || 'Remote Company',
      companyLogo: job.company_logo,
      companyWebsite: job.url,
      currency: 'USD',
      source: 'OTHER',
      sourceUrl: job.url,
      applyUrl: job.apply_url || job.url,
      qualityScore: this.calculateQualityScore(job),
      isVerified: false,
      isActive: true,
      isFeatured: false,
      isUrgent: false,
      postedAt: job.date ? new Date(job.date * 1000) : new Date(),
      lastScrapedAt: new Date(),
    };
  }

  /**
   * Generate mock jobs for development/fallback
   */
  private generateMockJobs(source: string, count: number): ProcessedJobData[] {
    const mockJobs: ProcessedJobData[] = [];
    const companies = ['TechFlow', 'InnovateIt', 'CodeCraft', 'DigitalPioneers', 'NextGenTech'];
    const titles = ['Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 'Software Engineer', 'DevOps Engineer'];
    const levels = ['ENTRY', 'MID', 'SENIOR'] as const;
    const cities = ['Milan', 'Rome', 'Turin', 'Florence', 'Naples'];

    for (let i = 0; i < count; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const title = titles[Math.floor(Math.random() * titles.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];

      mockJobs.push({
        externalId: `mock-${source}-${i}`,
        title: `${level === 'SENIOR' ? 'Senior ' : level === 'ENTRY' ? 'Junior ' : ''}${title}`,
        description: `Join ${company} as a ${title}. We're looking for talented developers to help build amazing products.`,
        type: 'FULL_TIME',
        level,
        category: 'TECHNOLOGY',
        remote: Math.random() > 0.5 ? 'HYBRID' : 'ONSITE',
        location: `${city}, Italy`,
        city,
        state: 'Lombardy',
        country: 'Italy',
        salaryMin: 30000 + (level === 'SENIOR' ? 30000 : level === 'MID' ? 15000 : 0),
        salaryMax: 50000 + (level === 'SENIOR' ? 40000 : level === 'MID' ? 20000 : 0),
        currency: 'EUR',
        salaryType: 'ANNUAL',
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
        companyName: company,
        source: 'OTHER',
        qualityScore: 70 + Math.random() * 30,
        isVerified: Math.random() > 0.7,
        isActive: true,
        isFeatured: Math.random() > 0.8,
        isUrgent: Math.random() > 0.9,
        postedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        lastScrapedAt: new Date(),
      });
    }

    return mockJobs;
  }

  /**
   * Utility functions for data processing
   */
  private mapJobType(type: string): ProcessedJobData['type'] {
    const normalized = type?.toLowerCase() || '';
    if (normalized.includes('intern')) return 'INTERNSHIP';
    if (normalized.includes('contract') || normalized.includes('freelance')) return 'CONTRACT';
    if (normalized.includes('part')) return 'PART_TIME';
    return 'FULL_TIME';
  }

  private mapJobLevel(title: string): ProcessedJobData['level'] {
    const normalized = title?.toLowerCase() || '';
    if (normalized.includes('senior') || normalized.includes('sr.')) return 'SENIOR';
    if (normalized.includes('lead') || normalized.includes('principal')) return 'LEAD';
    if (normalized.includes('junior') || normalized.includes('jr.') || normalized.includes('entry')) return 'ENTRY';
    if (normalized.includes('manager') || normalized.includes('director')) return 'MANAGER';
    return 'MID';
  }

  private categorizeJob(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('frontend') || text.includes('react') || text.includes('vue')) return 'FRONTEND';
    if (text.includes('backend') || text.includes('api') || text.includes('server')) return 'BACKEND';
    if (text.includes('devops') || text.includes('infrastructure')) return 'DEVOPS';
    if (text.includes('mobile') || text.includes('ios') || text.includes('android')) return 'MOBILE';
    if (text.includes('data') || text.includes('analytics')) return 'DATA_SCIENCE';
    return 'TECHNOLOGY';
  }

  private extractSkills(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const skills: string[] = [];
    
    const skillMap = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'react': 'React',
      'vue': 'Vue.js',
      'angular': 'Angular',
      'node': 'Node.js',
      'python': 'Python',
      'java': 'Java',
      'php': 'PHP',
      'docker': 'Docker',
      'kubernetes': 'Kubernetes',
      'aws': 'AWS',
      'azure': 'Azure',
      'git': 'Git',
    };

    Object.entries(skillMap).forEach(([key, value]) => {
      if (text.includes(key)) {
        skills.push(value);
      }
    });

    return skills;
  }

  private calculateQualityScore(job: any): number {
    let score = 50; // Base score
    
    // Check for completeness
    if (job.description && job.description.length > 100) score += 20;
    if (job.salary_min || job.salary_max) score += 15;
    if (job.company) score += 10;
    if (job.location) score += 5;
    
    return Math.min(100, score);
  }

  private deduplicateJobs(jobs: ProcessedJobData[]): ProcessedJobData[] {
    const seen = new Set<string>();
    return jobs.filter(job => {
      const key = `${job.title.toLowerCase()}-${job.companyName.toLowerCase()}-${job.city?.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private enhanceJobData(job: ProcessedJobData): ProcessedJobData {
    // Add proximity-based location data for Italian cities
    if (job.country === 'Italy') {
      const proximityMap: Record<string, { lat: number; lng: number; nearby: string[] }> = {
        'Milan': { lat: 45.4642, lng: 9.1900, nearby: ['Turin', 'Brescia', 'Bergamo'] },
        'Turin': { lat: 45.0703, lng: 7.6869, nearby: ['Milan', 'Genoa', 'Alessandria'] },
        'Rome': { lat: 41.9028, lng: 12.4964, nearby: ['Naples', 'Florence'] },
        'Florence': { lat: 43.7696, lng: 11.2558, nearby: ['Rome', 'Bologna'] },
        'Naples': { lat: 40.8518, lng: 14.2681, nearby: ['Rome', 'Bari'] },
      };

      const cityData = proximityMap[job.city || ''];
      if (cityData) {
        job.coordinates = { lat: cityData.lat, lng: cityData.lng };
      }
    }

    return job;
  }
}

// Export singleton instance
export const jobDataService = new JobDataService();