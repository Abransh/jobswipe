import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

export default auth((req: any) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/settings', '/applications', '/resumes'];
  const authRoutes = ['/auth/signin', '/auth/signup', '/auth/reset-password'];
  const publicRoutes = ['/', '/about', '/contact', '/privacy', '/terms'];

  const isProtectedRoute = protectedRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  );
  
  const isAuthRoute = authRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  );

  const isPublicRoute = publicRoutes.some(route => 
    nextUrl.pathname === route
  );

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
});

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