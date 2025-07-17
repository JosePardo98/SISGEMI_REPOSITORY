
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('firebase-session');

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  // If the user is on an auth page (login or signup)
  if (isAuthPage) {
    // If they have a session cookie, redirect them to the home page
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // Otherwise, let them stay on the auth page
    return NextResponse.next();
  }

  // If the user is on any other protected page and doesn't have a session cookie
  if (!sessionCookie) {
    // Redirect them to the login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user has a session cookie, let them proceed
  return NextResponse.next();
}

// Define the paths on which the middleware should run
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
