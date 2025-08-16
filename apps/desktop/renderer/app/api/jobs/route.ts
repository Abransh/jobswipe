/**
 * Jobs API Route
 * Proxies requests to the backend Fastify API server
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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
    const backendUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    
    // Forward the request to the backend API
    const url = new URL('/v1/jobs', backendUrl);
    
    // Copy all search parameters to the backend request
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });
    
    console.log('🔗 [Desktop Jobs API] Proxying request to backend:', url.toString());
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward any authentication headers if present
        ...(request.headers.get('authorization') && {
          authorization: request.headers.get('authorization')!
        }),
      },
    });

    if (!response.ok) {
      console.error('❌ [Desktop Jobs API] Backend request failed:', response.status, response.statusText);
      throw new Error(`Backend request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ [Desktop Jobs API] Successfully proxied request to backend');
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ [Desktop Jobs API] Proxy error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request parameters',
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch jobs from backend API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    
    console.log('🔗 [Desktop Jobs API] Proxying POST request to backend');
    
    const response = await fetch(`${backendUrl}/v1/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward any authentication headers if present
        ...(request.headers.get('authorization') && {
          authorization: request.headers.get('authorization')!
        }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('❌ [Desktop Jobs API] Backend POST request failed:', response.status, response.statusText);
      throw new Error(`Backend request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ [Desktop Jobs API] Successfully proxied POST request to backend');
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ [Desktop Jobs API] POST proxy error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process request via backend API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}