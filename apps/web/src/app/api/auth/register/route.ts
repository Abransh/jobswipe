/**
 * @fileoverview Register API route for web app
 * @description Proxies registration requests to Fastify API server
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Add source identifier and required fields for web requests
    const registerData = {
      ...body,
      source: 'web' as const,
      termsAccepted: body.termsAccepted || true,
      privacyAccepted: body.privacyAccepted || true,
      marketingConsent: body.marketingConsent || false,
    };

    // Forward request to Fastify API
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || '',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
        'X-Real-IP': request.headers.get('x-real-ip') || '',
      },
      body: JSON.stringify(registerData),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Create response with user data (without tokens for security)
    const res = NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
    });

    // Set HTTP-only cookies for secure token storage
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

    return res;

  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}