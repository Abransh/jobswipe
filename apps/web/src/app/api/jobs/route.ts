/**
 * Jobs API Route
 * Proxies requests to the Fastify server
 */

import { NextRequest, NextResponse } from 'next/server';

const FASTIFY_API_BASE = process.env.API_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    // Proxy the request to the Fastify server
    const fastifyUrl = `${FASTIFY_API_BASE}/jobs?${searchParams.toString()}`;
    
    const response = await fetch(fastifyUrl);
    
    if (!response.ok) {
      throw new Error(`Fastify API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Jobs API proxy error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch jobs from API server',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Proxy POST requests to Fastify server
    const response = await fetch(`${FASTIFY_API_BASE}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`Fastify API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Jobs POST API proxy error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process request via API server',
    }, { status: 500 });
  }
}