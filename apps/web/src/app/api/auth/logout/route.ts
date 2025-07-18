/**
 * @fileoverview Logout API route for web app
 * @description Handles user logout and token cleanup
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    // Call Fastify API logout if we have a token
    if (accessToken) {
      try {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        // Continue with logout even if API call fails
        console.error('Logout API call failed:', error);
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

    return res;

  } catch (error) {
    console.error('Logout error:', error);
    
    // Still clear cookies even if there's an error
    const res = NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
    
    res.cookies.delete('accessToken');
    res.cookies.delete('refreshToken');
    
    return res;
  }
}