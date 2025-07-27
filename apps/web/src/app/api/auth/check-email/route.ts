/**
 * @fileoverview Check Email API route for web app
 * @description Proxies email availability check requests to Fastify API server
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || process.env.API_BASE_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  console.log('🚀 [API Route] Check email request started');
  
  try {
    const body = await request.json();
    console.log('📝 [API Route] Request body:', { email: body.email });
    
    // Construct and validate backend API URL
    const backendUrl = `${API_BASE_URL}/v1/auth/check-email`;
    console.log('🌐 [API Route] Backend URL:', backendUrl);
    console.log('🔧 [API Route] API_BASE_URL:', API_BASE_URL);

    // Forward request to Fastify API
    console.log('📡 [API Route] Sending request to backend...');
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || '',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
        'X-Real-IP': request.headers.get('x-real-ip') || '',
      },
      body: JSON.stringify(body),
    });

    console.log('📨 [API Route] Backend response status:', response.status, response.statusText);

    const data = await response.json();

    // Debug logging
    console.log('🔍 Backend API response (check-email):', {
      status: response.status,
      ok: response.ok,
      hasData: !!data,
      available: data?.available,
      dataKeys: data ? Object.keys(data) : [],
    });

    if (!response.ok) {
      console.error('❌ Backend API error (check-email):', data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log('✅ [API Route] Check email successful, returning response');
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ [API Route] Check email error:', error);
    console.error('❌ [API Route] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Email check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}