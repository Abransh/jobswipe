/**
 * @fileoverview Current user profile API route for desktop app
 * @description Gets current authenticated user info from cookies
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || process.env.API_BASE_URL || 'http://localhost:3001';

export async function GET() {
  console.log('🚀 [Desktop API Route] User profile request started');
  
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      console.error('❌ [Desktop API Route] No access token available');
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.log('📡 [Desktop API Route] Sending profile request to backend...');
    // Forward request to Fastify API
    const backendUrl = `${API_BASE_URL}/v1/auth/profile`;
    console.log('🌐 [Desktop API Route] Backend URL:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'JobSwipe Desktop App',
        'X-Source': 'desktop',
      },
    });

    console.log('📨 [Desktop API Route] Backend response status:', response.status, response.statusText);

    const data = await response.json();

    // Debug logging
    console.log('🔍 Backend API response (profile):', {
      status: response.status,
      ok: response.ok,
      hasData: !!data,
      hasUser: !!data?.user,
      dataKeys: data ? Object.keys(data) : [],
    });

    if (!response.ok) {
      console.error('❌ Backend API error (profile):', data);
      // If token is invalid, clear cookies
      if (response.status === 401) {
        const res = NextResponse.json(data, { status: response.status });
        res.cookies.delete('accessToken');
        res.cookies.delete('refreshToken');
        return res;
      }
      return NextResponse.json(data, { status: response.status });
    }

    console.log('✅ [Desktop API Route] Profile request successful');
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ [Desktop API Route] Profile API error:', error);
    console.error('❌ [Desktop API Route] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}