/**
 * @fileoverview Job Service
 * @description Database service for job-related operations with advanced filtering and search
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { db } from '@jobswipe/database';
import type {
  JobType,
  JobLevel,
  JobCategory,
  CompanySize
} from '@jobswipe/database';

import { RemoteType } from '@jobswipe/database';

// Import enums directly from Prisma
import {
  JobStatus,
  CompanyStatus,
  Prisma
} from '@jobswipe/database';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export interface JobFilters {
  location?: string;
  remote?: 'any' | 'remote_only' | 'hybrid' | 'onsite';
  jobType?: JobType[];
  jobLevel?: JobLevel[];
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  companySize?: CompanySize[];
  category?: JobCategory[];
  experience?: number;
}

export interface JobSearchOptions {
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'salary' | 'distance';
  filters?: JobFilters;
  q?: string;
  userLocation?: { lat: number; lng: number };
  userId?: string; // For personalized results
}

export interface JobServiceResult {
  jobs: any[];
  totalCount: number;
  hasMore: boolean;
  page: number;
  limit: number;
  filters: JobFilters;
}

export interface ProximityResult {
  location: string;
  primaryJobs: any[];
  proximityInfo: { city: string; distance: number; jobCount: number }[];
  suggestions: {
    expandSearch: boolean;
    nextCities: { city: string; distance: number; jobCount: number }[];
    totalNearbyJobs: number;
  };
  nearbyJobs: any[];
  meta: {
    primaryCount: number;
    nearbyCount: number;
    totalAvailable: number;
  };
}

// =============================================================================
// JOB SERVICE CLASS
// =============================================================================

export class JobService {
  private fastify: any;

  constructor(fastify?: any) {
    this.fastify = fastify;
  }

  // =============================================================================
  // MAIN JOB SEARCH & FILTERING
  // =============================================================================

  /**
   * Search and filter jobs with advanced options
   */
  async searchJobs(options: JobSearchOptions): Promise<JobServiceResult> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'relevance',
      filters = {},
      q,
      userLocation,
      userId
    } = options;

    const offset = (page - 1) * limit;

    try {
      // Build where clause
      const where = await this.buildWhereClause(filters, q);

      // Build order by clause
      const orderBy = this.buildOrderByClause(sortBy);

      // Execute main query with proper includes
      const [jobs, totalCount] = await Promise.all([
        db.jobPosting.findMany({
          where,
          orderBy,
          skip: offset,
          take: limit,
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                website: true,
                logo: true,
                industry: true,
                size: true,
                isVerified: true,
                qualityScore: true,
                headquarters: true,
                country: true,
                foundedYear: true,
                employeeCount: true,
              }
            }
          }
        }),
        db.jobPosting.count({ where })
      ]);

      // Transform jobs to match frontend interface
      const transformedJobs = await this.transformJobsForFrontend(jobs, userId);

      // Calculate if there are more jobs
      const hasMore = offset + jobs.length < totalCount;

      this.fastify?.log?.info(`📋 Found ${jobs.length} jobs (${totalCount} total) for page ${page}`);

      return {
        jobs: transformedJobs,
        totalCount,
        hasMore,
        page,
        limit,
        filters
      };

    } catch (error) {
      this.fastify?.log?.error('❌ Error searching jobs:', error);
      throw new Error(`Failed to search jobs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get jobs with proximity-based location search
   */
  async getProximityJobs(params: {
    location: string;
    jobType?: string[];
    level?: string[];
    remote?: 'any' | 'remote_only' | 'hybrid' | 'onsite';
    limit?: number;
  }): Promise<ProximityResult> {
    const { location, jobType = [], level = [], remote = 'any', limit = 20 } = params;

    try {
      // Primary location search
      const primaryWhere = {
        status: JobStatus.ACTIVE,
        isActive: true,
        OR: [
          { city: { contains: location, mode: Prisma.QueryMode.insensitive } },
          { location: { contains: location, mode: Prisma.QueryMode.insensitive } },
          { state: { contains: location, mode: Prisma.QueryMode.insensitive } }
        ]
      };

      // Add filters
      if (remote !== 'any') {
        if (remote === 'remote_only') {
          primaryWhere['remote'] = true;
          primaryWhere['remoteType'] = RemoteType.REMOTE;
        } else if (remote === 'hybrid') {
          primaryWhere['remoteType'] = RemoteType.HYBRID;
        } else if (remote === 'onsite') {
          primaryWhere['remoteType'] = RemoteType.ONSITE;
        }
      }

      if (jobType.length > 0) {
        primaryWhere['type'] = { in: jobType };
      }

      if (level.length > 0) {
        primaryWhere['level'] = { in: level };
      }

      // Get primary jobs in the specified location
      const primaryJobs = await db.jobPosting.findMany({
        where: primaryWhere,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              industry: true,
              size: true,
              isVerified: true,
              qualityScore: true,
              headquarters: true,
              country: true,
            }
          }
        }
      });

      // Mock proximity data (in production, you'd use geographic queries)
      const mockProximityInfo = [
        { city: 'Rome', distance: 25, jobCount: 45 },
        { city: 'Naples', distance: 50, jobCount: 28 },
        { city: 'Turin', distance: 75, jobCount: 32 }
      ];

      // Mock nearby jobs (would be real geographic query in production)
      const nearbyJobs = await db.jobPosting.findMany({
        where: {
          status: JobStatus.ACTIVE,
          isActive: true,
          NOT: { id: { in: primaryJobs.map(job => job.id) } }
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              industry: true,
              isVerified: true,
            }
          }
        }
      });

      const transformedPrimaryJobs = await this.transformJobsForFrontend(primaryJobs);
      const transformedNearbyJobs = await this.transformJobsForFrontend(nearbyJobs);

      return {
        location,
        primaryJobs: transformedPrimaryJobs,
        proximityInfo: mockProximityInfo,
        suggestions: {
          expandSearch: primaryJobs.length < 5,
          nextCities: mockProximityInfo,
          totalNearbyJobs: nearbyJobs.length
        },
        nearbyJobs: transformedNearbyJobs,
        meta: {
          primaryCount: primaryJobs.length,
          nearbyCount: nearbyJobs.length,
          totalAvailable: primaryJobs.length + nearbyJobs.length
        }
      };

    } catch (error) {
      this.fastify?.log?.error('❌ Error getting proximity jobs:', error);
      throw new Error(`Failed to get proximity jobs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // =============================================================================
  // QUERY BUILDERS
  // =============================================================================

  /**
   * Build complex where clause for job filtering
   */
  private async buildWhereClause(filters: JobFilters, searchQuery?: string): Promise<any> {
    const where: any = {
      status: JobStatus.ACTIVE,
      isActive: true,
      company: {
        status: CompanyStatus.ACTIVE
      }
    };

    // Text search across multiple fields
    if (searchQuery) {
      const searchTerms = searchQuery.trim().split(' ').filter(term => term.length > 0);
      where.OR = [
        {
          title: {
            contains: searchQuery,
            mode: Prisma.QueryMode.insensitive
          }
        },
        {
          description: {
            contains: searchQuery,
            mode: Prisma.QueryMode.insensitive
          }
        },
        {
          skills: {
            hasSome: searchTerms
          }
        },
        {
          company: {
            name: {
              contains: searchQuery,
              mode: Prisma.QueryMode.insensitive
            }
          }
        }
      ];
    }

    // Location filtering
    if (filters.location) {
      where.OR = [
        ...(where.OR || []),
        {
          city: { contains: filters.location, mode: Prisma.QueryMode.insensitive }
        },
        {
          state: { contains: filters.location, mode: Prisma.QueryMode.insensitive }
        },
        {
          country: { contains: filters.location, mode: Prisma.QueryMode.insensitive }
        },
        {
          location: { contains: filters.location, mode: Prisma.QueryMode.insensitive }
        }
      ];
    }

    // Remote work filtering
    if (filters.remote && filters.remote !== 'any') {
      if (filters.remote === 'remote_only') {
        where.remote = true;
        where.remoteType = RemoteType.REMOTE;
      } else if (filters.remote === 'hybrid') {
        where.remoteType = RemoteType.HYBRID;
      } else if (filters.remote === 'onsite') {
        where.remoteType = RemoteType.ONSITE;
      }
    }

    // Job type filtering
    if (filters.jobType && filters.jobType.length > 0) {
      where.type = { in: filters.jobType };
    }

    // Job level filtering
    if (filters.jobLevel && filters.jobLevel.length > 0) {
      where.level = { in: filters.jobLevel };
    }

    // Salary filtering
    if (filters.salaryMin || filters.salaryMax) {
      where.AND = where.AND || [];
      if (filters.salaryMin) {
        where.AND.push({
          OR: [
            { salaryMin: { gte: filters.salaryMin } },
            { salaryMax: { gte: filters.salaryMin } }
          ]
        });
      }
      if (filters.salaryMax) {
        where.AND.push({
          OR: [
            { salaryMax: { lte: filters.salaryMax } },
            { salaryMin: { lte: filters.salaryMax } }
          ]
        });
      }
    }

    // Skills filtering
    if (filters.skills && filters.skills.length > 0) {
      where.skills = {
        hasSome: filters.skills
      };
    }

    // Company size filtering
    if (filters.companySize && filters.companySize.length > 0) {
      where.company = {
        ...where.company,
        size: { in: filters.companySize }
      };
    }

    // Category filtering
    if (filters.category && filters.category.length > 0) {
      where.category = { in: filters.category };
    }

    // Experience filtering
    if (filters.experience) {
      where.experienceYears = {
        lte: filters.experience + 2 // Allow some flexibility
      };
    }

    return where;
  }

  /**
   * Build order by clause based on sort option
   */
  private buildOrderByClause(sortBy: string): any[] {
    switch (sortBy) {
      case 'date':
        return [
          { postedAt: 'desc' },
          { createdAt: 'desc' }
        ];
      
      case 'salary':
        return [
          { salaryMax: 'desc' },
          { salaryMin: 'desc' },
          { createdAt: 'desc' }
        ];
      
      case 'relevance':
      default:
        return [
          { isFeatured: 'desc' },
          { isUrgent: 'desc' },
          { qualityScore: 'desc' },
          { rightSwipeCount: 'desc' },
          { viewCount: 'desc' },
          { createdAt: 'desc' }
        ];
    }
  }

  // =============================================================================
  // DATA TRANSFORMATION
  // =============================================================================

  /**
   * Transform Prisma job results to match frontend interface
   */
  private async transformJobsForFrontend(jobs: any[], userId?: string): Promise<any[]> {
    return Promise.all(jobs.map(async (job) => {
      // Calculate match score if user provided
      let matchScore;
      if (userId) {
        matchScore = await this.calculateJobMatchScore(job, userId);
      }

      // Transform the job data
      return {
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits,
        
        // Job Classification
        type: job.type,
        level: job.level,
        department: job.department,
        category: job.category,
        
        // Work Arrangement
        remote: job.remote,
        remoteType: job.remoteType,
        location: job.location,
        timeZone: job.timeZone,
        
        // Location Details
        city: job.city,
        state: job.state,
        country: job.country,
        
        // Compensation
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: job.currency || 'EUR',
        salaryType: job.salaryType,
        equity: job.equity,
        bonus: job.bonus,
        
        // Job Requirements
        experienceYears: job.experienceYears,
        skills: job.skills || [],
        education: job.education,
        languages: job.languages || [],
        
        // Company Context
        companyId: job.companyId,
        company: {
          id: job.company.id,
          name: job.company.name,
          slug: job.company.slug,
          description: job.company.description,
          website: job.company.website,
          logo: job.company.logo || this.generateCompanyLogo(job.company.name),
          industry: job.company.industry,
          size: job.company.size,
          isVerified: job.company.isVerified,
          qualityScore: job.company.qualityScore,
          headquarters: job.company.headquarters,
          country: job.company.country,
          foundedYear: job.company.foundedYear,
          employeeCount: job.company.employeeCount
        },
        
        // External Integration
        sourceUrl: job.sourceUrl,
        applyUrl: job.applyUrl || job.sourceUrl,
        
        // Quality & Verification
        qualityScore: job.qualityScore,
        isVerified: job.isVerified,
        
        // Status & Lifecycle
        isActive: job.isActive,
        isFeatured: job.isFeatured,
        isUrgent: job.isUrgent,
        
        // Dates
        postedAt: job.postedAt?.toISOString(),
        expiresAt: job.expiresAt?.toISOString(),
        
        // Analytics
        viewCount: job.viewCount,
        applicationCount: job.applicationCount,
        rightSwipeCount: job.rightSwipeCount,
        leftSwipeCount: job.leftSwipeCount,
        
        // Metadata
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
        
        // Additional frontend fields
        matchScore,
        badges: this.generateJobBadges(job),
        formattedSalary: this.formatSalary(job)
      };
    }));
  }

  /**
   * Calculate job match score for a user (mock implementation)
   */
  private async calculateJobMatchScore(job: any, userId: string): Promise<number> {
    // This would be a complex algorithm in production
    // For now, return a mock score based on job attributes
    let score = 70; // Base score

    if (job.isFeatured) score += 5;
    if (job.company.isVerified) score += 3;
    if (job.remote) score += 2;
    if (job.qualityScore > 80) score += job.qualityScore * 0.1;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Generate company logo placeholder
   */
  private generateCompanyLogo(companyName: string): string {
    const initials = companyName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
    
    const colors = ['0066cc', 'ff6600', '28a745', 'dc3545', '6f42c1', '20c997'];
    const color = colors[companyName.length % colors.length];
    
    return `https://via.placeholder.com/64x64/${color}/ffffff?text=${initials}`;
  }

  /**
   * Generate job badges for frontend display
   */
  private generateJobBadges(job: any): any[] {
    const badges = [];

    if (job.isUrgent) {
      badges.push({
        type: 'urgent',
        label: 'Urgent',
        color: 'amber',
        priority: 10
      });
    }

    if (job.isFeatured) {
      badges.push({
        type: 'featured',
        label: 'Featured',
        color: 'purple',
        priority: 9
      });
    }

    if (job.company.isVerified) {
      badges.push({
        type: 'verified',
        label: 'Verified',
        color: 'blue',
        priority: 8
      });
    }

    if (job.remote) {
      badges.push({
        type: 'remote',
        label: 'Remote',
        color: 'green',
        priority: 7
      });
    }

    // Add "new" badge for jobs posted in last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (job.postedAt && new Date(job.postedAt) > weekAgo) {
      badges.push({
        type: 'new',
        label: 'New',
        color: 'indigo',
        priority: 6
      });
    }

    return badges.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Format salary for display
   */
  private formatSalary(job: any): any {
    if (!job.salaryMin && !job.salaryMax) {
      return {
        display: 'Competitive',
        range: null,
        currency: job.currency || 'EUR',
        isRange: false,
        isCompetitive: true
      };
    }

    const currency = job.currency || 'EUR';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

    if (job.salaryMin && job.salaryMax) {
      return {
        display: `${formatter.format(job.salaryMin)} - ${formatter.format(job.salaryMax)}`,
        range: `${job.salaryMin}-${job.salaryMax}`,
        currency,
        isRange: true,
        isCompetitive: false
      };
    }

    const salary = job.salaryMin || job.salaryMax;
    const prefix = job.salaryMin ? 'From ' : 'Up to ';

    return {
      display: `${prefix}${formatter.format(salary)}`,
      range: salary.toString(),
      currency,
      isRange: false,
      isCompetitive: false
    };
  }

  // =============================================================================
  // STATISTICS & ANALYTICS
  // =============================================================================

  /**
   * Get job by ID with detailed information
   */
  async getJobById(jobId: string, userId?: string): Promise<any> {
    try {
      const job = await db.jobPosting.findUnique({
        where: { 
          id: jobId,
          status: JobStatus.ACTIVE,
          isActive: true 
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              website: true,
              logo: true,
              industry: true,
              size: true,
              isVerified: true,
              qualityScore: true,
              headquarters: true,
              country: true,
              foundedYear: true,
              employeeCount: true,
            }
          }
        }
      });

      if (!job) {
        return null;
      }

      // Transform the job for frontend
      const transformedJobs = await this.transformJobsForFrontend([job], userId);
      return transformedJobs[0];
      
    } catch (error) {
      this.fastify.log.error('Error getting job by ID:', error);
      throw new Error('Failed to get job details');
    }
  }

  /**
   * Get job statistics
   */
  async getJobStats(): Promise<any> {
    try {
      const [totalJobs, activeJobs, recentJobs, companies, featuredJobs] = await Promise.all([
        db.jobPosting.count(),
        db.jobPosting.count({
          where: {
            status: JobStatus.ACTIVE,
            isActive: true
          }
        }),
        db.jobPosting.count({
          where: {
            status: JobStatus.ACTIVE,
            isActive: true,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          }
        }),
        db.company.count({
          where: {
            status: CompanyStatus.ACTIVE
          }
        }),
        db.jobPosting.count({
          where: {
            status: JobStatus.ACTIVE,
            isActive: true,
            isFeatured: true
          }
        })
      ]);

      const expiredJobs = totalJobs - activeJobs;

      return {
        totalJobs,
        activeJobs,
        expiredJobs,
        recentJobs,
        featuredJobs,
        companies,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.fastify?.log?.error('❌ Error getting job stats:', error);
      throw new Error('Failed to get job statistics');
    }
  }

  /**
   * Record job view
   */
  async recordJobView(jobId: string, userId?: string): Promise<void> {
    try {
      // Update view count
      await db.jobPosting.update({
        where: { id: jobId },
        data: {
          viewCount: {
            increment: 1
          }
        }
      });

      // Record analytics event if user provided
      if (userId) {
        await db.analyticsEvent.create({
          data: {
            userId,
            eventType: 'job_view',
            eventCategory: 'user_action',
            eventName: 'Job Viewed',
            properties: {
              jobId
            }
          }
        });
      }

    } catch (error) {
      this.fastify?.log?.warn('⚠️ Failed to record job view:', error);
      // Don't throw error as this is not critical
    }
  }
}

// Export singleton instance
export const jobService = new JobService();