/**
 * Jobs Proximity API Route
 * Proxies requests to the Fastify server
 */

import { NextRequest, NextResponse } from 'next/server';

const FASTIFY_API_BASE = 'http://localhost:3001/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    // Proxy the request to the Fastify server
    const fastifyUrl = `${FASTIFY_API_BASE}/jobs/proximity?${searchParams.toString()}`;
    
    const response = await fetch(fastifyUrl);
    
    if (!response.ok) {
      throw new Error(`Fastify API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Proximity API proxy error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch proximity jobs from API server',
    }, { status: 500 });
  }
}