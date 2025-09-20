/**
 * @fileoverview Logout API route for desktop app
 * @description Handles user logout and token cleanup
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || process.env.API_BASE_URL || 'http://localhost:3001';

export async function POST() {
  console.log('🚀 [Desktop API Route] Logout request started');
  
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    // Call Fastify API logout if we have a token
    if (accessToken) {
      try {
        console.log('📡 [Desktop API Route] Calling backend logout...');
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'User-Agent': 'JobSwipe Desktop App',
            'X-Source': 'desktop',
          },
        });
        console.log('✅ [Desktop API Route] Backend logout successful');
      } catch (error) {
        // Continue with logout even if API call fails
        console.error('❌ Backend logout API call failed:', error);
      }
    }

    // Create response
    const res = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear auth cookies
    res.cookies.delete('accessToken');
    res.cookies.delete('refreshToken');

    console.log('✅ [Desktop API Route] Logout successful, cookies cleared');
    return res;

  } catch (error) {
    console.error('❌ [Desktop API Route] Logout error:', error);
    console.error('❌ [Desktop API Route] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Still clear cookies even if there's an error
    const res = NextResponse.json(
      { 
        success: false, 
        error: 'Logout failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
    
    res.cookies.delete('accessToken');
    res.cookies.delete('refreshToken');
    
    return res;
  }
}