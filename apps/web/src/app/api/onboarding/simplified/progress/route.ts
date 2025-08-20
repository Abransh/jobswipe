import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

// GET - Load saved onboarding progress
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Forward request to Fastify API backend
    const response = await fetch(`${API_BASE_URL}/api/v1/onboarding/progress`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // If token is invalid, clear cookies
      if (response.status === 401) {
        const res = NextResponse.json(data, { status: response.status });
        res.cookies.delete('accessToken');
        res.cookies.delete('refreshToken');
        return res;
      }
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Onboarding progress GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load progress' },
      { status: 500 }
    );
  }
}

// POST - Save onboarding progress
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();

    // Forward request to Fastify API backend
    const response = await fetch(`${API_BASE_URL}/api/v1/onboarding/progress`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      // If token is invalid, clear cookies
      if (response.status === 401) {
        const res = NextResponse.json(data, { status: response.status });
        res.cookies.delete('accessToken');
        res.cookies.delete('refreshToken');
        return res;
      }
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Onboarding progress POST API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save progress' },
      { status: 500 }
    );
  }
}