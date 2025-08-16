/**
 * Job Proximity API Route
 * Handles location-based job discovery with proximity suggestions
 * Milan → Turin → Brescia progression logic
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { jobDatabaseService } from '@/lib/services/jobDatabaseService';

const ProximityRequestSchema = z.object({
  location: z.string().min(1),
  jobType: z.string().optional().transform(val => val ? val.split(',') : []),
  level: z.string().optional().transform(val => val ? val.split(',') : []),
  remote: z.enum(['any', 'remote_only', 'hybrid', 'onsite']).optional().default('any'),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val) || 20, 50) : 20),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const params = Object.fromEntries(searchParams.entries());
    
    const validatedParams = ProximityRequestSchema.parse(params);
    const { location, jobType, level, remote, limit } = validatedParams;

    // Get location-based suggestions with proximity
    const result = await jobDatabaseService.getLocationSuggestions(location);

    // Apply additional filters to the results
    const filters = {
      location: '',
      remote,
      jobType,
      jobLevel: level,
      skills: [],
      salaryMin: 0,
      salaryMax: 300000,
    };

    // Filter primary jobs
    const filteredPrimaryJobs = result.primaryJobs.filter(job => {
      if (jobType.length > 0 && !jobType.includes(job.type)) return false;
      if (level.length > 0 && !level.includes(job.level)) return false;
      if (remote !== 'any') {
        if (remote === 'remote_only' && job.remote !== 'REMOTE') return false;
        if (remote === 'onsite' && job.remote !== 'ONSITE') return false;
        if (remote === 'hybrid' && job.remote !== 'HYBRID') return false;
      }
      return true;
    }).slice(0, limit);

    // Filter nearby jobs
    const filteredNearbyJobs = result.nearbyJobs.filter(job => {
      if (jobType.length > 0 && !jobType.includes(job.type)) return false;
      if (level.length > 0 && !level.includes(job.level)) return false;
      if (remote !== 'any') {
        if (remote === 'remote_only' && job.remote !== 'REMOTE') return false;
        if (remote === 'onsite' && job.remote !== 'ONSITE') return false;
        if (remote === 'hybrid' && job.remote !== 'HYBRID') return false;
      }
      return true;
    }).slice(0, limit);

    // Build response with progressive discovery
    const response = {
      location,
      primaryJobs: filteredPrimaryJobs,
      proximityInfo: result.proximityInfo,
      suggestions: {
        expandSearch: filteredPrimaryJobs.length < 5,
        nextCities: result.proximityInfo.slice(0, 3),
        totalNearbyJobs: filteredNearbyJobs.length,
      },
      nearbyJobs: filteredNearbyJobs,
      meta: {
        primaryCount: filteredPrimaryJobs.length,
        nearbyCount: filteredNearbyJobs.length,
        totalAvailable: result.proximityInfo.reduce((sum, info) => sum + info.jobCount, 0),
      },
    };

    return NextResponse.json({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error('Proximity API error:', error);
    
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
    const { action, location, preferences } = body;

    if (action === 'expand-search') {
      // Expand search to nearby cities when primary location has few jobs
      const result = await jobDatabaseService.getLocationSuggestions(location);
      
      // Get more jobs from nearby cities
      const nearbyJobsPromises = result.proximityInfo.slice(0, 3).map(async (cityInfo) => {
        const cityJobs = await jobDatabaseService.getJobs({
          filters: {
            location: cityInfo.city,
            remote: preferences?.remote || 'any',
            jobType: preferences?.jobType || [],
            jobLevel: preferences?.level || [],
            skills: preferences?.skills || [],
            salaryMin: preferences?.salaryMin || 0,
            salaryMax: preferences?.salaryMax || 300000,
          },
          limit: 20,
        });
        
        return {
          city: cityInfo.city,
          distance: cityInfo.distance,
          jobs: cityJobs.jobs,
          totalCount: cityJobs.totalCount,
        };
      });

      const nearbyResults = await Promise.all(nearbyJobsPromises);
      
      return NextResponse.json({
        success: true,
        data: {
          expandedResults: nearbyResults,
          suggestion: `Found ${nearbyResults.reduce((sum, result) => sum + result.jobs.length, 0)} additional jobs in nearby cities`,
        },
      });
    }

    if (action === 'save-location-preference') {
      // This would typically save user location preferences
      // For now, just return success
      return NextResponse.json({
        success: true,
        data: {
          saved: true,
          location,
          preferences,
        },
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action',
    }, { status: 400 });

  } catch (error) {
    console.error('Proximity POST API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}