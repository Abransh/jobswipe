/**
 * @fileoverview Register API route for desktop app
 * @description Proxies registration requests to Fastify API server
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || process.env.API_BASE_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  console.log('🚀 [Desktop API Route] Register request started');
  
  try {
    const body = await request.json();
    console.log('📝 [Desktop API Route] Request body:', { email: body.email, hasPassword: !!body.password, name: body.name });
    
    // Add source identifier and required fields for desktop requests
    const registerData = {
      ...body,
      source: 'desktop' as const,
      termsAccepted: body.termsAccepted || true,
      privacyAccepted: body.privacyAccepted || true,
      marketingConsent: body.marketingConsent || false,
    };

    // Construct and validate backend API URL
    const backendUrl = `${API_BASE_URL}/api/v1/auth/register`;
    console.log('🌐 [Desktop API Route] Backend URL:', backendUrl);
    console.log('🔧 [Desktop API Route] API_BASE_URL:', API_BASE_URL);

    // Forward request to Fastify API
    console.log('📡 [Desktop API Route] Sending request to backend...');
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'JobSwipe Desktop App',
        'X-Source': 'desktop',
      },
      body: JSON.stringify(registerData),
    });

    console.log('📨 [Desktop API Route] Backend response status:', response.status, response.statusText);

    const data = await response.json();

    // Debug logging
    console.log('🔍 Backend API response (register):', {
      status: response.status,
      ok: response.ok,
      hasData: !!data,
      hasTokens: !!data?.tokens,
      hasUser: !!data?.user,
      dataKeys: data ? Object.keys(data) : [],
    });

    if (!response.ok) {
      console.error('❌ Backend API error (register):', data);
      return NextResponse.json(data, { status: response.status });
    }

    // Check if we have the required data
    if (!data.tokens) {
      console.error('❌ No tokens in backend response (register):', data);
      return NextResponse.json(
        { success: false, error: 'Registration failed - no tokens received' },
        { status: 500 }
      );
    }

    if (!data.user) {
      console.error('❌ No user in backend response (register):', data);
      return NextResponse.json(
        { success: false, error: 'Registration failed - no user data received' },
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
    console.log('🍪 Setting cookies (register):', {
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

    console.log('✅ [Desktop API Route] Register successful, returning response');
    return res;

  } catch (error) {
    console.error('❌ [Desktop API Route] Register error:', error);
    console.error('❌ [Desktop API Route] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Registration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}