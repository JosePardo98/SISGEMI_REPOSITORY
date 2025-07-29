
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  const session = request.cookies.get('firebase-session')?.value;

  const publicPaths = ['/login', '/signup'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // If the user is logged in and tries to access a public path, redirect to home.
  if (session && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If the user is not logged in and tries to access a protected path, redirect to login.
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
