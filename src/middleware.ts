
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('firebase-session');

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isAuthPage) {
    if (sessionCookie) {
      // If the user has a session cookie, they are already logged in. Redirect to home.
      return NextResponse.redirect(new URL('/', request.url));
    }
    // Allow unauthenticated users to access login and signup pages.
    return NextResponse.next();
  }
  
  if (!sessionCookie) {
      // If the user is not on an auth page and has no session cookie, redirect to login.
      // We need to preserve the original destination to redirect after login.
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
  }

  // User has a session cookie, let them proceed.
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
