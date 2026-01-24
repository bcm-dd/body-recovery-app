/**
 * Middleware - Body Recovery
 *
 * Rewrites all non-API routes to serve the Vite SPA.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, Next.js internals, and static assets
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.includes('.') // Files with extensions (favicon.ico, etc.)
  ) {
    return NextResponse.next();
  }

  // Rewrite all other routes to serve the SPA index.html
  return NextResponse.rewrite(new URL('/index.html', request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - Files with extensions (.ico, .png, .svg, etc.)
     */
    '/((?!api|_next/static|_next/image|.*\\..*).*)',
  ],
};
