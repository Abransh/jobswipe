import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { 
  verifyAuthFromRequest, 
  isProtectedRoute, 
  isAuthRoute, 
  isPublicRoute,
  hasRefreshToken,
  getClientIP,
  getUserAgent,
  type MiddlewareAuthResult 
} from '@/lib/auth/middleware-auth';

/**
 * Edge Runtime compatible middleware using custom JWT authentication
 * SECURITY: Now performs full JWT signature verification (not just structure)
 */
export default async function middleware(req: NextRequest) {
  try {
    const { nextUrl } = req;
    const pathname = nextUrl.pathname;

    // Skip middleware for API routes, static files, and images
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/)
    ) {
      return NextResponse.next();
    }

    // Handle /login route specifically (redirect to proper auth page)
    if (pathname === '/login') {
      console.log('Redirecting /login to /auth/signin');
      return NextResponse.redirect(new URL('/auth/signin', nextUrl));
    }

    // Allow public routes without authentication check
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    // SECURITY: Verify authentication with FULL signature verification
    const authResult: MiddlewareAuthResult = await verifyAuthFromRequest(req);
    const isAuthenticated = authResult.isAuthenticated;

    // Log authentication attempt for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] ${pathname} - Auth: ${isAuthenticated ? 'SUCCESS' : 'FAILED'}`, {
        user: authResult.user?.email,
        error: authResult.error,
        hasCookies: req.cookies.getAll().length > 0,
        cookieNames: req.cookies.getAll().map(c => c.name),
        ip: getClientIP(req),
        userAgent: getUserAgent(req)?.substring(0, 100),
      });
    }

    // Handle authentication routes
    if (isAuthRoute(pathname)) {
      if (isAuthenticated) {
        // Redirect authenticated users away from auth pages
        console.log(`Redirecting authenticated user from ${pathname} to /jobs`);
        return NextResponse.redirect(new URL('/jobs', nextUrl));
      }
      // Allow unauthenticated users to access auth pages
      return NextResponse.next();
    }

    // Handle protected routes
    if (isProtectedRoute(pathname)) {
      if (!isAuthenticated) {
        // Check if there's a refresh token for automatic redirect vs manual login
        const hasRefresh = hasRefreshToken(req);
        
        if (hasRefresh && authResult.needsRefresh) {
          // User has a refresh token but access token expired
          // Redirect to a refresh endpoint or login with auto-refresh
          console.log(`Access token expired for ${pathname}, redirecting for refresh`);
          const callbackUrl = encodeURIComponent(pathname + nextUrl.search);
          return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}&refresh=true`, nextUrl));
        } else {
          // No valid authentication, redirect to signin
          console.log(`Redirecting unauthenticated user from ${pathname} to signin`);
          const callbackUrl = encodeURIComponent(pathname + nextUrl.search);
          return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, nextUrl));
        }
      }
      
      // User is authenticated, now check if they need to complete onboarding
      // Skip onboarding check for onboarding pages themselves
      if (isAuthenticated && !pathname.startsWith('/onboarding') && !pathname.startsWith('/auth/')) {
        // Add onboarding check here - this would need to be done via an API call
        // For now, we'll add a response header to signal the frontend to check onboarding status
        const response = NextResponse.next();
        response.headers.set('x-check-onboarding', 'true');
        return response;
      }
      
      // User is authenticated, allow access to protected route
      return NextResponse.next();
    }

    // For all other routes, allow access
    return NextResponse.next();
    
  } catch (error) {
    // Handle any unexpected errors gracefully
    console.error('Middleware error:', error);
    
    const { nextUrl } = req;
    const pathname = nextUrl.pathname;
    
    // Log error for monitoring
    console.error(`[Middleware Error] ${pathname}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      ip: getClientIP(req),
      userAgent: getUserAgent(req)?.substring(0, 100),
    });
    
    // For protected routes, redirect to signin on error (fail-safe)
    if (isProtectedRoute(pathname)) {
      console.log(`Error in middleware for protected route ${pathname}, redirecting to signin`);
      const callbackUrl = encodeURIComponent(pathname + nextUrl.search);
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}&error=auth_error`, nextUrl));
    }
    
    // Handle /login route error specifically
    if (pathname === '/login') {
      console.log('Error handling /login route, redirecting to /auth/signin');
      return NextResponse.redirect(new URL('/auth/signin', nextUrl));
    }
    
    // For other routes, allow access (graceful degradation)
    console.log(`Allowing access to ${pathname} despite middleware error`);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};