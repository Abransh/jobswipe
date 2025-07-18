import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import type { NextRequest } from 'next/server';

/**
 * Enhanced middleware with robust error handling for OIDC token validation errors
 * Specifically handles Next.js 15 + NextAuth v4 compatibility issues
 */
export default function middleware(req: NextRequest) {
  try {
    // Use NextAuth middleware with enhanced error handling
    return auth((authReq: NextRequest & { auth?: any }) => {
      try {
        const { nextUrl } = authReq;
        const isLoggedIn = !!authReq.auth;

        // Define route types
        const protectedRoutes = ['/dashboard', '/profile', '/settings', '/applications', '/resumes'];
        const authRoutes = ['/auth/signin', '/auth/signup', '/auth/reset-password', '/login'];
        const publicRoutes = ['/', '/about', '/contact', '/privacy', '/terms'];

        const isProtectedRoute = protectedRoutes.some(route => 
          nextUrl.pathname.startsWith(route)
        );
        
        const isAuthRoute = authRoutes.some(route => 
          nextUrl.pathname.startsWith(route) || nextUrl.pathname === route
        );

        // Handle /login route specifically (redirect to proper auth page)
        if (nextUrl.pathname === '/login') {
          return NextResponse.redirect(new URL('/auth/signin', nextUrl));
        }

        // Redirect authenticated users away from auth pages
        if (isLoggedIn && isAuthRoute) {
          return NextResponse.redirect(new URL('/dashboard', nextUrl));
        }

        // Redirect unauthenticated users away from protected routes
        if (!isLoggedIn && isProtectedRoute) {
          const callbackUrl = nextUrl.pathname + nextUrl.search;
          return NextResponse.redirect(
            new URL(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl)
          );
        }

        // Allow all other requests
        return NextResponse.next();
        
      } catch (innerError) {
        // Handle specific auth processing errors
        console.error('Inner middleware auth error:', innerError);
        
        const { nextUrl } = authReq;
        const protectedRoutes = ['/dashboard', '/profile', '/settings', '/applications', '/resumes'];
        const isProtectedRoute = protectedRoutes.some(route => 
          nextUrl.pathname.startsWith(route)
        );
        
        if (isProtectedRoute) {
          const callbackUrl = nextUrl.pathname + nextUrl.search;
          return NextResponse.redirect(
            new URL(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl)
          );
        }
        
        // Handle /login route error specifically
        if (nextUrl.pathname === '/login') {
          return NextResponse.redirect(new URL('/auth/signin', nextUrl));
        }
        
        // For non-protected routes, allow access
        return NextResponse.next();
      }
    })(req);
    
  } catch (error) {
    // Handle outer-level errors (OIDC token validation, crypto issues, etc.)
    console.error('Middleware initialization error:', error);
    
    const { nextUrl } = req;
    
    // Check if this is an OIDC-related error
    const isOIDCError = error instanceof Error && (
      error.message.includes('oidc-token-hash') ||
      error.message.includes('substring') ||
      error.message.includes('crypto') ||
      error.stack?.includes('oidc-token-hash')
    );
    
    if (isOIDCError) {
      console.warn('OIDC token validation error detected, falling back to no-auth state');
    }
    
    // Define route types for fallback handling
    const protectedRoutes = ['/dashboard', '/profile', '/settings', '/applications', '/resumes'];
    const authRoutes = ['/auth/signin', '/auth/signup', '/auth/reset-password', '/login'];
    
    const isProtectedRoute = protectedRoutes.some(route => 
      nextUrl.pathname.startsWith(route)
    );
    
    // Handle /login route specifically
    if (nextUrl.pathname === '/login') {
      console.log('Redirecting /login to /auth/signin due to auth error');
      return NextResponse.redirect(new URL('/auth/signin', nextUrl));
    }
    
    // For protected routes, redirect to signin when auth fails
    if (isProtectedRoute) {
      console.log(`Redirecting protected route ${nextUrl.pathname} to signin due to auth error`);
      const callbackUrl = nextUrl.pathname + nextUrl.search;
      return NextResponse.redirect(
        new URL(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl)
      );
    }
    
    // For all other routes, allow access (graceful degradation)
    console.log(`Allowing access to ${nextUrl.pathname} despite auth error`);
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
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};