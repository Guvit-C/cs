import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Public paths that don't require auth
  const isPublicPath = path === '/login' || path === '/api/auth';
  
  // Get the session token from cookies
  const sessionToken = request.cookies.get('session_token')?.value;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // If no password is set in env, we just allow everything (failsafe)
  if (!adminPassword) {
    return NextResponse.next();
  }

  const isAuthenticated = sessionToken === adminPassword;

  // Redirect unauthenticated users to login page
  if (!isAuthenticated && !isPublicPath) {
    // Exclude static files and API images to prevent breaking the app layout
    if (path.match(/\.(.*)$/)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from login page
  if (isAuthenticated && path === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
