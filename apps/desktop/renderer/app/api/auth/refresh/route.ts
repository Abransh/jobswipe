/**
 * @fileoverview Token refresh API route for desktop app
 * @description Refreshes access token using refresh token
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || process.env.API_BASE_URL || 'http://localhost:3001';

export async function POST() {
  console.log('🚀 [Desktop API Route] Token refresh request started');
  
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      console.error('❌ [Desktop API Route] No refresh token available');
      return NextResponse.json(
        { success: false, error: 'No refresh token available' },
        { status: 401 }
      );
    }

    console.log('📡 [Desktop API Route] Sending refresh request to backend...');
    // Forward request to Fastify API
    const backendUrl = `${API_BASE_URL}/v1/auth/token/refresh`;
    console.log('🌐 [Desktop API Route] Backend URL:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'JobSwipe Desktop App',
        'X-Source': 'desktop',
      },
      body: JSON.stringify({
        refreshToken,
        source: 'desktop' as const,
      }),
    });

    console.log('📨 [Desktop API Route] Backend response status:', response.status, response.statusText);

    const data = await response.json();

    // Debug logging
    console.log('🔍 Backend API response (refresh):', {
      status: response.status,
      ok: response.ok,
      hasData: !!data,
      hasTokens: !!data?.tokens,
      dataKeys: data ? Object.keys(data) : [],
    });

    if (!response.ok) {
      console.error('❌ Backend API error (refresh):', data);
      // If refresh token is invalid, clear all cookies
      const res = NextResponse.json(data, { status: response.status });
      res.cookies.delete('accessToken');
      res.cookies.delete('refreshToken');
      return res;
    }

    // Create response with success
    const res = NextResponse.json({
      success: true,
      tokens: {
        tokenType: data.tokens.tokenType,
        expiresIn: data.tokens.expiresIn,
        refreshExpiresIn: data.tokens.refreshExpiresIn,
      },
    });

    // Set cookies for desktop app
    console.log('🍪 Setting refreshed cookies (desktop):', {
      accessToken: data.tokens.accessToken ? `${data.tokens.accessToken.substring(0, 20)}...` : 'missing',
      refreshToken: data.tokens.refreshToken ? `${data.tokens.refreshToken.substring(0, 20)}...` : 'missing',
      expiresIn: data.tokens.expiresIn,
      refreshExpiresIn: data.tokens.refreshExpiresIn,
    });

    // Update access token cookie
    res.cookies.set('accessToken', data.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: data.tokens.expiresIn,
      path: '/',
    });

    // Update refresh token cookie if provided
    if (data.tokens.refreshToken) {
      res.cookies.set('refreshToken', data.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: data.tokens.refreshExpiresIn,
        path: '/',
      });
    }

    console.log('✅ [Desktop API Route] Token refresh successful');
    return res;

  } catch (error) {
    console.error('❌ [Desktop API Route] Token refresh error:', error);
    console.error('❌ [Desktop API Route] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Token refresh failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}