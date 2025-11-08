/**
 * @fileoverview Resume Upload API Route (Next.js Proxy)
 * @description Proxies resume upload requests to Fastify API server with S3 integration
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || process.env.API_BASE_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  console.log('📤 [API Route] Resume upload request started');

  try {
    // Get FormData from request
    const formData = await request.formData();

    console.log('📝 [API Route] FormData received:', {
      hasFile: formData.has('file'),
      hasName: formData.has('name'),
      isDefault: formData.get('isDefault')
    });

    // Extract cookies for authentication
    const cookies = request.cookies.getAll();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    // Forward to Fastify API server
    const backendUrl = `${API_BASE_URL}/api/v1/resumes/upload`;
    console.log('🌐 [API Route] Forwarding to:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader,
        'User-Agent': request.headers.get('user-agent') || '',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
        'X-Real-IP': request.headers.get('x-real-ip') || '',
      },
      body: formData,
    });

    console.log('📨 [API Route] Backend response status:', response.status, response.statusText);

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Backend API error:', data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log('✅ [API Route] Resume upload successful:', {
      resumeId: data.resume?.id,
      pdfUrl: data.resume?.pdfUrl
    });

    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ [API Route] Resume upload error:', error);
    console.error('❌ [API Route] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Resume upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log('📥 [API Route] Get user resumes request');

  try {
    // Extract cookies for authentication
    const cookies = request.cookies.getAll();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    // Forward to Fastify API server
    const backendUrl = `${API_BASE_URL}/api/v1/resumes`;
    console.log('🌐 [API Route] Forwarding to:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
        'User-Agent': request.headers.get('user-agent') || '',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ [API Route] Get resumes error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch resumes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
