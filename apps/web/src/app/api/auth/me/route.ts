/**
 * @fileoverview Current user profile API route
 * @description Gets current authenticated user info from cookies with direct token validation
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseJwtPayload, isTokenExpiredClientSide } from '@jobswipe/shared/browser';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated', errorCode: 'NO_TOKEN' },
        { status: 401 }
      );
    }

    // First, do basic client-side token validation to avoid unnecessary backend calls
    if (isTokenExpiredClientSide(accessToken)) {
      console.log('🕒 [Auth Me] Token expired client-side');
      const res = NextResponse.json(
        { success: false, error: 'Token expired', errorCode: 'TOKEN_EXPIRED' },
        { status: 401 }
      );
      res.cookies.delete('accessToken');
      res.cookies.delete('refreshToken');
      return res;
    }

    // Try to parse token payload for basic info
    let userInfo;
    try {
      const payload = parseJwtPayload(accessToken);
      if (payload) {
        userInfo = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          role: payload.role || 'user',
          status: 'active',
          emailVerified: (payload as any).emailVerified || true,
          createdAt: new Date(payload.iat * 1000),
          updatedAt: new Date(),
        };
      }
    } catch (parseError) {
      console.error('❌ [Auth Me] Token parse error:', parseError);
    }

    // If we have basic user info from token, try to get full profile from backend
    // But use this as a fallback if backend is unavailable
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ [Auth Me] Profile fetched from backend');
        return NextResponse.json(data);
      } else {
        // Backend says token is invalid
        if (response.status === 401) {
          console.log('🚫 [Auth Me] Backend rejected token');
          const res = NextResponse.json(data, { status: response.status });
          res.cookies.delete('accessToken');
          res.cookies.delete('refreshToken');
          return res;
        }
        // Other backend errors - fall back to parsed token data
        console.warn('⚠️ [Auth Me] Backend error, using parsed token data:', response.status, data.error);
      }
    } catch (fetchError) {
      console.warn('⚠️ [Auth Me] Backend unavailable, using parsed token data:', fetchError instanceof Error ? fetchError.message : String(fetchError));
    }

    // Fallback: use parsed token data if backend is unavailable but token is valid
    if (userInfo) {
      console.log('🔄 [Auth Me] Using fallback token data');
      return NextResponse.json({
        success: true,
        data: userInfo,
        source: 'token_fallback'
      });
    }

    // If we get here, token is invalid
    const res = NextResponse.json(
      { success: false, error: 'Invalid token', errorCode: 'INVALID_TOKEN' },
      { status: 401 }
    );
    res.cookies.delete('accessToken');
    res.cookies.delete('refreshToken');
    return res;

  } catch (error) {
    console.error('❌ [Auth Me] Profile API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get profile', errorCode: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}