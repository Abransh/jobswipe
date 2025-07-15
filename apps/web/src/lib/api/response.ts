import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: any;
}

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  pagination?: ApiResponse['pagination']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
    pagination,
  });
}

/**
 * Create an error API response
 */
export function createErrorResponse(
  error: ApiError | string,
  statusCode?: number
): NextResponse<ApiResponse> {
  const errorData = typeof error === 'string' 
    ? { message: error, statusCode: statusCode || 400 }
    : error;

  return NextResponse.json(
    {
      success: false,
      error: errorData.message,
      ...(errorData.details && { details: errorData.details }),
    },
    { status: errorData.statusCode }
  );
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: any): NextResponse<ApiResponse> {
  console.error('API Error:', error);

  // Handle known error types
  if (error.name === 'AuthError') {
    return createErrorResponse({
      message: error.message,
      statusCode: error.statusCode || 401,
    });
  }

  if (error.name === 'ValidationError') {
    return createErrorResponse({
      message: 'Validation failed',
      statusCode: 400,
      details: error.details,
    });
  }

  if (error.name === 'PrismaClientKnownRequestError') {
    // Handle Prisma errors
    switch (error.code) {
      case 'P2002':
        return createErrorResponse({
          message: 'A record with this information already exists',
          statusCode: 409,
        });
      case 'P2025':
        return createErrorResponse({
          message: 'Record not found',
          statusCode: 404,
        });
      default:
        return createErrorResponse({
          message: 'Database error',
          statusCode: 500,
        });
    }
  }

  // Generic error
  return createErrorResponse({
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message || 'Unknown error',
    statusCode: 500,
  });
}

/**
 * Validate request method
 */
export function validateMethod(
  request: Request,
  allowedMethods: string[]
): NextResponse | null {
  if (!allowedMethods.includes(request.method)) {
    return createErrorResponse({
      message: `Method ${request.method} not allowed`,
      statusCode: 405,
    });
  }
  return null;
}

/**
 * Parse pagination parameters from search params
 */
export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Create pagination response data
 */
export function createPaginationData(
  page: number,
  limit: number,
  total: number
): ApiResponse['pagination'] {
  return {
    page,
    limit,
    total,
    hasMore: page * limit < total,
  };
}