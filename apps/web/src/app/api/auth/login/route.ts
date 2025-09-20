/**
 * @fileoverview Login API route for web app
 * @description Proxies authentication requests to Fastify API server
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || process.env.API_BASE_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  console.log('🚀 [API Route] Login request started');
  
  try {
    const body = await request.json();
    console.log('📝 [API Route] Request body:', { email: body.email, hasPassword: !!body.password });
    
    // Add source identifier for web requests
    const loginData = {
      ...body,
      source: 'web' as const,
    };

    // Construct and validate backend API URL
    const backendUrl = `${API_BASE_URL}/api/v1/auth/login`;
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
      body: JSON.stringify(loginData),
    });

    console.log('📨 [API Route] Backend response status:', response.status, response.statusText);

    const data = await response.json();

    // Debug logging
    console.log('🔍 Backend API response:', {
      status: response.status,
      ok: response.ok,
      hasData: !!data,
      hasTokens: !!data?.tokens,
      hasUser: !!data?.user,
      dataKeys: data ? Object.keys(data) : [],
    });

    if (!response.ok) {
      console.error('❌ Backend API error:', data);
      return NextResponse.json(data, { status: response.status });
    }

    // Check if we have the required data
    if (!data.tokens) {
      console.error('❌ No tokens in backend response:', data);
      return NextResponse.json(
        { success: false, error: 'Authentication failed - no tokens received' },
        { status: 500 }
      );
    }

    if (!data.user) {
      console.error('❌ No user in backend response:', data);
      return NextResponse.json(
        { success: false, error: 'Authentication failed - no user data received' },
        { status: 500 }
      );
    }

    // Create response with user data (without tokens for security)
    const res = NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
    });

    // Set HTTP-only cookies for secure token storage
    console.log('🍪 Setting cookies:', {
      accessToken: data.tokens.accessToken ? `${data.tokens.accessToken.substring(0, 20)}...` : 'missing',
      refreshToken: data.tokens.refreshToken ? `${data.tokens.refreshToken.substring(0, 20)}...` : 'missing',
      expiresIn: data.tokens.expiresIn,
      refreshExpiresIn: data.tokens.refreshExpiresIn,
    });

    res.cookies.set('accessToken', data.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: data.tokens.expiresIn,
      path: '/',
    });

    res.cookies.set('refreshToken', data.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: data.tokens.refreshExpiresIn,
      path: '/',
    });

    console.log('✅ [API Route] Login successful, returning response');
    return res;

  } catch (error) {
    console.error('❌ [API Route] Login error:', error);
    console.error('❌ [API Route] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Login failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}