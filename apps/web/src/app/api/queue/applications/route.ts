import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/api/auth';

export async function GET(request: NextRequest) {
  try {
    const authenticatedUser = await authenticateRequest(request);
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const status = searchParams.get('status');

    // Proxy request to Fastify backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    queryParams.append('offset', offset.toString());
    if (status) queryParams.append('status', status);

    const backendEndpoint = `${backendUrl}/api/v1/queue/applications?${queryParams.toString()}`;

    // Get auth token from user's session
    const authHeader = request.headers.get('authorization');

    console.log('🔗 [Web API] Proxying to backend:', backendEndpoint);

    const backendResponse = await fetch(backendEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ [Web API] Backend error:', backendResponse.status, backendData);
      return NextResponse.json(backendData, { status: backendResponse.status });
    }

    console.log('✅ [Web API] Applications fetched from backend:', {
      userId: authenticatedUser.id,
      limit,
      offset,
      status,
      count: backendData.data?.applications?.length || 0
    });

    return NextResponse.json(backendData);

  } catch (error) {
    console.error('❌ [Web API] Applications fetch failed:', error);

    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message, errorCode: 'AUTH_ERROR' },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error', errorCode: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}