/**
 * Jobs API Route
 * Handles fetching jobs from database with filtering and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { jobDatabaseService } from '@/lib/services/jobDatabaseService';
import { jobDataService } from '@/lib/services/jobDataService';
import type { JobFilters } from '@/components/jobs/types/filters';

// Request validation schema
const JobsRequestSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val) || 50, 100) : 50),
  sortBy: z.enum(['relevance', 'date', 'salary', 'distance']).optional().default('relevance'),
  
  // Filters
  location: z.string().optional(),
  remote: z.enum(['any', 'remote_only', 'hybrid', 'onsite']).optional().default('any'),
  jobType: z.string().optional().transform(val => val ? val.split(',') : []),
  jobLevel: z.string().optional().transform(val => val ? val.split(',') : []),
  skills: z.string().optional().transform(val => val ? val.split(',') : []),
  salaryMin: z.string().optional().transform(val => val ? parseInt(val) : 0),
  salaryMax: z.string().optional().transform(val => val ? parseInt(val) : 300000),
  companySize: z.string().optional().transform(val => val ? val.split(',') : []),
  
  // Search query
  q: z.string().optional(),
  
  // User location for proximity
  userLat: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  userLng: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  
  // Force refresh from external APIs
  refresh: z.string().optional().transform(val => val === 'true'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const params = Object.fromEntries(searchParams.entries());
    
    // Validate request parameters
    const validatedParams = JobsRequestSchema.parse(params);
    
    const {
      page,
      limit,
      sortBy,
      location,
      remote,
      jobType,
      jobLevel,
      skills,
      salaryMin,
      salaryMax,
      companySize,
      q,
      userLat,
      userLng,
      refresh,
    } = validatedParams;

    // Build filters object
    const filters: JobFilters = {
      location: location || '',
      remote,
      jobType,
      jobLevel,
      skills,
      salaryMin,
      salaryMax,
      companySize,
      query: q,
    };

    // User location for proximity-based sorting
    const userLocation = userLat && userLng ? { lat: userLat, lng: userLng } : undefined;

    // If refresh is requested or we have no jobs in database, fetch from external APIs
    if (refresh) {
      console.log('Refreshing job data from external APIs...');
      
      try {
        // Fetch fresh data from external APIs
        const externalJobs = await jobDataService.fetchJobsFromAPIs({
          location: location || 'Italy',
          keywords: q || 'software engineer',
          page: 1,
          limit: 100, // Fetch more for initial seeding
        });

        // Store in database
        const storeResult = await jobDatabaseService.storeJobs(externalJobs);
        console.log('Job storage result:', storeResult);
      } catch (error) {
        console.error('Error refreshing job data:', error);
        // Continue with existing data in database
      }
    }

    // Handle search queries differently
    if (q) {
      const searchResults = await jobDatabaseService.searchJobs(q, filters, limit);
      
      return NextResponse.json({
        success: true,
        data: {
          jobs: searchResults,
          totalCount: searchResults.length,
          hasMore: false,
          page,
          limit,
          filters,
        },
      });
    }

    // Get jobs from database
    const result = await jobDatabaseService.getJobs({
      filters,
      page,
      limit,
      sortBy,
      userLocation,
    });

    // If no jobs found and no refresh was requested, try to fetch some
    if (result.jobs.length === 0 && !refresh) {
      console.log('No jobs found in database, fetching from external APIs...');
      
      try {
        const externalJobs = await jobDataService.fetchJobsFromAPIs({
          location: location || 'Italy',
          keywords: q || 'software engineer',
          page: 1,
          limit: 50,
        });

        if (externalJobs.length > 0) {
          await jobDatabaseService.storeJobs(externalJobs);
          
          // Re-fetch from database
          const newResult = await jobDatabaseService.getJobs({
            filters,
            page,
            limit,
            sortBy,
            userLocation,
          });
          
          return NextResponse.json({
            success: true,
            data: {
              ...newResult,
              page,
              limit,
              filters,
              refreshed: true,
            },
          });
        }
      } catch (error) {
        console.error('Error fetching external job data:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        page,
        limit,
        filters,
      },
    });

  } catch (error) {
    console.error('Jobs API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request parameters',
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Manual job sync endpoint for admin users
    const { action, params } = body;

    if (action === 'sync') {
      const {
        location = 'Italy',
        keywords = 'software engineer',
        sources = ['adzuna', 'remoteOk'],
        limit = 100,
      } = params || {};

      console.log('Manual job sync requested:', { location, keywords, sources, limit });

      // Fetch jobs from external APIs
      const externalJobs = await jobDataService.fetchJobsFromAPIs({
        location,
        keywords,
        page: 1,
        limit,
        sources,
      });

      // Store in database
      const storeResult = await jobDatabaseService.storeJobs(externalJobs);

      // Clean up expired jobs
      const cleanupCount = await jobDatabaseService.cleanupExpiredJobs();

      return NextResponse.json({
        success: true,
        data: {
          fetched: externalJobs.length,
          ...storeResult,
          cleanedUp: cleanupCount,
        },
      });
    }

    if (action === 'stats') {
      const stats = await jobDatabaseService.getJobStats();
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action',
    }, { status: 400 });

  } catch (error) {
    console.error('Jobs sync API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}