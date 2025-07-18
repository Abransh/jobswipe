/**
 * @fileoverview Token refresh API route
 * @description Refreshes access token using refresh token
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'No refresh token available' },
        { status: 401 }
      );
    }

    // Forward request to Fastify API
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken,
        source: 'web',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
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

    return res;

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { success: false, error: 'Token refresh failed' },
      { status: 500 }
    );
  }
}