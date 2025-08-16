/**
 * Job Database Service
 * Handles storing and retrieving job data from PostgreSQL using Prisma
 */

import { PrismaClient, JobCategory, JobStatus } from '@jobswipe/database';
import type { ProcessedJobData } from './jobDataService';
import type { JobFilters } from '@/components/jobs/types/filters';

// Initialize Prisma client
const prisma = new PrismaClient();

// Helper function to map category string to enum
function mapCategoryToEnum(category: string): JobCategory {
  const categoryMap: Record<string, JobCategory> = {
    'technology': JobCategory.TECHNOLOGY,
    'tech': JobCategory.TECHNOLOGY,
    'engineering': JobCategory.ENGINEERING,
    'design': JobCategory.DESIGN,
    'product': JobCategory.PRODUCT,
    'marketing': JobCategory.MARKETING,
    'sales': JobCategory.SALES,
    'finance': JobCategory.FINANCE,
    'operations': JobCategory.OPERATIONS,
    'human_resources': JobCategory.HUMAN_RESOURCES,
    'hr': JobCategory.HUMAN_RESOURCES,
    'legal': JobCategory.LEGAL,
  };
  
  const lowerCategory = category?.toLowerCase() || '';
  return categoryMap[lowerCategory] || JobCategory.TECHNOLOGY; // Default to TECHNOLOGY
}

export class JobDatabaseService {
  /**
   * Store jobs in the database
   */
  async storeJobs(jobs: ProcessedJobData[]): Promise<{ stored: number; updated: number; errors: number }> {
    let stored = 0;
    let updated = 0;
    let errors = 0;

    for (const jobData of jobs) {
      try {
        // First, ensure the company exists
        const company = await this.upsertCompany(jobData);
        
        // Create or update the job posting
        const existingJob = await prisma.jobPosting.findFirst({
          where: {
            externalId: jobData.externalId,
            source: jobData.source,
          },
        });

        const jobPostingData = {
          title: jobData.title,
          description: jobData.description,
          requirements: jobData.requirements,
          benefits: jobData.benefits,
          type: jobData.type,
          level: jobData.level,
          department: undefined,
          category: mapCategoryToEnum(jobData.category),
          remote: jobData.remote === 'REMOTE',
          remoteType: jobData.remote,
          location: jobData.location,
          timeZone: undefined,
          city: jobData.city,
          state: jobData.state,
          country: jobData.country,
          coordinates: jobData.coordinates,
          salaryMin: jobData.salaryMin,
          salaryMax: jobData.salaryMax,
          currency: jobData.currency,
          salaryType: jobData.salaryType,
          equity: undefined,
          bonus: undefined,
          experienceYears: jobData.experienceYears,
          skills: jobData.skills,
          education: jobData.education,
          languages: [],
          companyId: company.id,
          externalId: jobData.externalId,
          source: jobData.source,
          sourceUrl: jobData.sourceUrl,
          applyUrl: jobData.applyUrl,
          keywords: jobData.skills,
          tags: [],
          qualityScore: jobData.qualityScore,
          isVerified: jobData.isVerified,
          verifiedAt: jobData.isVerified ? new Date() : undefined,
          status: JobStatus.ACTIVE,
          isActive: jobData.isActive,
          isFeatured: jobData.isFeatured,
          isUrgent: jobData.isUrgent,
          postedAt: jobData.postedAt,
          expiresAt: jobData.expiresAt,
          lastScrapedAt: jobData.lastScrapedAt,
        };

        if (existingJob) {
          // Update existing job
          await prisma.jobPosting.update({
            where: { id: existingJob.id },
            data: jobPostingData,
          });
          updated++;
        } else {
          // Create new job
          await prisma.jobPosting.create({
            data: jobPostingData,
          });
          stored++;
        }
      } catch (error) {
        console.error('Error storing job:', error);
        errors++;
      }
    }

    return { stored, updated, errors };
  }

  /**
   * Retrieve jobs with filtering and pagination
   */
  async getJobs(params: {
    filters?: JobFilters;
    page?: number;
    limit?: number;
    sortBy?: 'relevance' | 'date' | 'salary' | 'distance';
    userLocation?: { lat: number; lng: number };
  }): Promise<{
    jobs: Array<{
      id: string;
      title: string;
      company: {
        id: string;
        name: string;
        slug: string;
        logo?: string;
        industry?: string;
        size?: string;
        headquarters?: string;
        isVerified: boolean;
      };
      description: string;
      location?: string;
      city?: string;
      state?: string;
      country?: string;
      salaryMin?: number;
      salaryMax?: number;
      currency?: string;
      salaryType?: string;
      equity?: string;
      remote: string;
      remoteType: string;
      type: string;
      level: string;
      skills: string[];
      benefits?: string;
      postedAt?: Date;
      applicationCount: number;
      viewCount: number;
      isUrgent: boolean;
      isFeatured: boolean;
      isVerified: boolean;
    }>;
    totalCount: number;
    hasMore: boolean;
  }> {
    const { filters, page = 1, limit = 50, sortBy = 'relevance' } = params;
    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const whereClause: any = {
      isActive: true,
      status: JobStatus.ACTIVE,
    };

    if (filters) {
      // Location filter with proximity support
      if (filters.location) {
        const locationSearch = filters.location.toLowerCase();
        whereClause.OR = [
          { city: { contains: locationSearch, mode: 'insensitive' } },
          { state: { contains: locationSearch, mode: 'insensitive' } },
          { country: { contains: locationSearch, mode: 'insensitive' } },
          { location: { contains: locationSearch, mode: 'insensitive' } },
        ];
      }

      // Remote work filter
      if (filters.remote && filters.remote !== 'any') {
        if (filters.remote === 'remote_only') {
          whereClause.remote = true;
        } else if (filters.remote === 'onsite') {
          whereClause.remote = false;
        } else if (filters.remote === 'hybrid') {
          whereClause.remoteType = 'HYBRID';
        }
      }

      // Job type filter
      if (filters.jobType && filters.jobType.length > 0) {
        whereClause.type = { in: filters.jobType };
      }

      // Job level filter
      if (filters.jobLevel && filters.jobLevel.length > 0) {
        whereClause.level = { in: filters.jobLevel };
      }

      // Salary filters
      if (filters.salaryMin && filters.salaryMin > 0) {
        whereClause.salaryMin = { gte: filters.salaryMin };
      }
      if (filters.salaryMax && filters.salaryMax < 300000) {
        whereClause.salaryMax = { lte: filters.salaryMax };
      }

      // Skills filter
      if (filters.skills && filters.skills.length > 0) {
        whereClause.skills = {
          hasSome: filters.skills,
        };
      }

      // Company size filter
      if (filters.companySize && filters.companySize.length > 0) {
        whereClause.company = {
          size: { in: filters.companySize },
        };
      }
    }

    // Build order by clause
    let orderBy: any[] = [];
    switch (sortBy) {
      case 'date':
        orderBy = [{ postedAt: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'salary':
        orderBy = [{ salaryMax: 'desc' }, { salaryMin: 'desc' }];
        break;
      case 'distance':
        // For distance sorting, we'd need to implement geospatial queries
        // For now, fallback to relevance
        orderBy = [{ isFeatured: 'desc' }, { qualityScore: 'desc' }, { postedAt: 'desc' }];
        break;
      default: // relevance
        orderBy = [{ isFeatured: 'desc' }, { qualityScore: 'desc' }, { isUrgent: 'desc' }, { postedAt: 'desc' }];
        break;
    }

    // Execute the query
    const [jobs, totalCount] = await Promise.all([
      prisma.jobPosting.findMany({
        where: whereClause,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              industry: true,
              size: true,
              headquarters: true,
              isVerified: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.jobPosting.count({ where: whereClause }),
    ]);

    // Transform to our frontend format
    const transformedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      company: {
        id: job.company.id,
        name: job.company.name,
        slug: job.company.slug,
        logo: job.company.logo || undefined,
        industry: job.company.industry || undefined,
        size: job.company.size || undefined,
        headquarters: job.company.headquarters || undefined,
        isVerified: job.company.isVerified,
      },
      description: job.description,
      location: job.location || undefined,
      city: job.city || undefined,
      state: job.state || undefined,
      country: job.country || undefined,
      salaryMin: job.salaryMin || undefined,
      salaryMax: job.salaryMax || undefined,
      currency: job.currency || 'EUR',
      salaryType: job.salaryType || undefined,
      equity: job.equity || undefined,
      remote: job.remoteType,
      remoteType: job.remoteType,
      type: job.type,
      level: job.level,
      skills: job.skills,
      benefits: job.benefits || undefined,
      postedAt: job.postedAt || undefined,
      applicationCount: job.applicationCount,
      viewCount: job.viewCount,
      isUrgent: job.isUrgent,
      isFeatured: job.isFeatured,
      isVerified: job.isVerified,
    }));

    return {
      jobs: transformedJobs,
      totalCount,
      hasMore: skip + jobs.length < totalCount,
    };
  }

  /**
   * Get location-based job suggestions with proximity
   */
  async getLocationSuggestions(baseLocation: string): Promise<{
    primaryJobs: any[];
    nearbyJobs: any[];
    proximityInfo: { city: string; distance: number; jobCount: number }[];
  }> {
    const proximityMap: Record<string, { nearby: string[]; distances: Record<string, number> }> = {
      'Milan': { 
        nearby: ['Turin', 'Brescia', 'Bergamo'],
        distances: { 'Turin': 140, 'Brescia': 90, 'Bergamo': 50 }
      },
      'Turin': { 
        nearby: ['Milan', 'Genoa', 'Alessandria'],
        distances: { 'Milan': 140, 'Genoa': 170, 'Alessandria': 90 }
      },
      'Rome': { 
        nearby: ['Naples', 'Florence'],
        distances: { 'Naples': 225, 'Florence': 270 }
      },
    };

    const cityData = proximityMap[baseLocation];
    if (!cityData) {
      // Fallback for unknown cities
      const primaryJobs = await this.getJobs({
        filters: { location: baseLocation, remote: 'any', jobType: [], jobLevel: [], salaryMin: 0, salaryMax: 300000, skills: [] },
        limit: 20,
      });
      return { primaryJobs: primaryJobs.jobs, nearbyJobs: [], proximityInfo: [] };
    }

    // Get jobs in primary location
    const primaryJobs = await this.getJobs({
      filters: { location: baseLocation, remote: 'any', jobType: [], jobLevel: [], salaryMin: 0, salaryMax: 300000, skills: [] },
      limit: 20,
    });

    // Get jobs in nearby cities
    const nearbyJobsPromises = cityData.nearby.map(async (city) => {
      const cityJobs = await this.getJobs({
        filters: { location: city, remote: 'any', jobType: [], jobLevel: [], salaryMin: 0, salaryMax: 300000, skills: [] },
        limit: 10,
      });
      return { city, jobs: cityJobs.jobs, totalCount: cityJobs.totalCount };
    });

    const nearbyResults = await Promise.all(nearbyJobsPromises);
    const nearbyJobs = nearbyResults.flatMap(result => result.jobs);

    // Build proximity info
    const proximityInfo = nearbyResults.map(result => ({
      city: result.city,
      distance: cityData.distances[result.city] || 0,
      jobCount: result.totalCount,
    }));

    return { primaryJobs: primaryJobs.jobs, nearbyJobs, proximityInfo };
  }

  /**
   * Search jobs with full-text search
   */
  async searchJobs(query: string, filters?: JobFilters, limit: number = 50): Promise<any[]> {
    const whereClause: any = {
      isActive: true,
      status: JobStatus.ACTIVE,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { skills: { hasSome: [query] } },
        { company: { name: { contains: query, mode: 'insensitive' } } },
      ],
    };

    // Apply additional filters if provided
    if (filters) {
      // Add filter logic here (same as getJobs method)
    }

    const jobs = await prisma.jobPosting.findMany({
      where: whereClause,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            industry: true,
            size: true,
            headquarters: true,
            isVerified: true,
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { qualityScore: 'desc' },
        { postedAt: 'desc' },
      ],
      take: limit,
    });

    return jobs;
  }

  /**
   * Get job statistics for analytics
   */
  async getJobStats(): Promise<{
    totalJobs: number;
    activeJobs: number;
    newJobsToday: number;
    topLocations: { city: string; count: number }[];
    topCompanies: { name: string; count: number }[];
    averageSalary: number;
  }> {
    const [
      totalJobs,
      activeJobs,
      newJobsToday,
      locationStats,
      companyStats,
      salaryStats,
    ] = await Promise.all([
      prisma.jobPosting.count(),
      prisma.jobPosting.count({ where: { isActive: true, status: JobStatus.ACTIVE } }),
      prisma.jobPosting.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.jobPosting.groupBy({
        by: ['city'],
        where: { isActive: true, city: { not: null } },
        _count: { city: true },
        orderBy: { _count: { city: 'desc' } },
        take: 10,
      }),
      prisma.jobPosting.groupBy({
        by: ['companyId'],
        where: { isActive: true },
        _count: { companyId: true },
        orderBy: { _count: { companyId: 'desc' } },
        take: 10,
      }),
      prisma.jobPosting.aggregate({
        where: {
          isActive: true,
          salaryMin: { not: null },
          salaryMax: { not: null },
        },
        _avg: { salaryMin: true, salaryMax: true },
      }),
    ]);

    // Get company names for top companies
    const companyIds = companyStats.map(stat => stat.companyId);
    const companies = await prisma.company.findMany({
      where: { id: { in: companyIds } },
      select: { id: true, name: true },
    });

    const topCompanies = companyStats.map(stat => {
      const company = companies.find(c => c.id === stat.companyId);
      return {
        name: company?.name || 'Unknown',
        count: stat._count.companyId,
      };
    });

    const topLocations = locationStats.map(stat => ({
      city: stat.city || 'Unknown',
      count: stat._count.city,
    }));

    const averageSalary = salaryStats._avg.salaryMin && salaryStats._avg.salaryMax
      ? (salaryStats._avg.salaryMin + salaryStats._avg.salaryMax) / 2
      : 0;

    return {
      totalJobs,
      activeJobs,
      newJobsToday,
      topLocations,
      topCompanies,
      averageSalary,
    };
  }

  /**
   * Helper method to upsert company data
   */
  private async upsertCompany(jobData: ProcessedJobData) {
    const slug = jobData.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    return await prisma.company.upsert({
      where: { slug },
      update: {
        name: jobData.companyName,
        logo: jobData.companyLogo,
        website: jobData.companyWebsite,
        industry: jobData.companyIndustry,
      },
      create: {
        name: jobData.companyName,
        slug,
        logo: jobData.companyLogo,
        website: jobData.companyWebsite,
        industry: jobData.companyIndustry,
        isVerified: false,
      },
    });
  }

  /**
   * Clean up old/expired jobs
   */
  async cleanupExpiredJobs(): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const result = await prisma.jobPosting.updateMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { lastScrapedAt: { lt: thirtyDaysAgo } },
        ],
        isActive: true,
      },
      data: {
        isActive: false,
        status: JobStatus.EXPIRED,
      },
    });

    return result.count;
  }
}

// Export singleton instance
export const jobDatabaseService = new JobDatabaseService();