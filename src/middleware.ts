import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  const session = request.cookies.get('firebase-session')?.value;

  const publicPaths = ['/login', '/signup'];

  // If user is logged in, redirect away from login/signup pages
  if (session && publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(`${origin}/`);
  }

  // If user is not logged in and accessing a protected page, redirect to login
  if (!session && !publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(`${origin}/login`);
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
