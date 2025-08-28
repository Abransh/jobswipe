/**
 * @fileoverview Token Bridge API Route
 * @description Server-side token accessor to solve HTTPOnly cookie accessibility issues
 * Provides secure access to authentication tokens for client-side API calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isTokenExpiredClientSide } from '@jobswipe/shared/browser';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;
    
    console.log('🔐 [Token Bridge] Token request received');
    console.log('🍪 [Token Bridge] Access token found:', !!accessToken);
    console.log('🔄 [Token Bridge] Refresh token found:', !!refreshToken);
    
    if (!accessToken) {
      console.log('❌ [Token Bridge] No access token found in cookies');
      
      // Check if we have a refresh token for potential client-side refresh
      if (refreshToken) {
        console.log('🔄 [Token Bridge] Refresh token available, suggesting client-side refresh');
        
        return NextResponse.json({ 
          success: false,
          token: null,
          error: 'No access token found',
          errorCode: 'TOKEN_EXPIRED',
          hasRefreshToken: true,
          shouldRefresh: true // Signal to client to perform refresh
        });
      }
      
      return NextResponse.json({ 
        success: false,
        token: null,
        error: 'No access token found',
        errorCode: 'NO_TOKEN',
        hasRefreshToken: false
      });
    }
    
    // Check if token is expired client-side (basic validation)
    if (isTokenExpiredClientSide(accessToken)) {
      console.log('⏰ [Token Bridge] Token expired client-side');
      
      // Clear expired token cookies
      const response = NextResponse.json({
        success: false,
        token: null,
        error: 'Token expired',
        errorCode: 'TOKEN_EXPIRED'
      });
      
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      
      return response;
    }
    
    console.log('✅ [Token Bridge] Valid token provided to client');
    console.log('🔍 [Token Bridge] Token preview:', `${accessToken.substring(0, 20)}...`);
    
    return NextResponse.json({
      success: true,
      token: accessToken,
      tokenLength: accessToken.length,
      source: 'httponly_cookie'
    });
    
  } catch (error) {
    console.error('❌ [Token Bridge] Error accessing token:', error);
    
    return NextResponse.json({
      success: false,
      token: null,
      error: 'Internal server error',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}