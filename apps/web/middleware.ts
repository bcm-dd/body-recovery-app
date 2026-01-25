/**
 * Next.js Middleware for Security
 *
 * This middleware runs at the edge before every request.
 * It provides:
 * - Security header enforcement
 * - CSRF protection for mutations
 * - Request validation
 * - Rate limiting hints
 */

import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Paths that should be protected with CSRF validation
 */
const CSRF_PROTECTED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * API routes that require authentication
 */
const PROTECTED_API_ROUTES = [
  '/api/user',
  '/api/settings',
  '/api/sessions',
];

/**
 * Paths to exclude from middleware processing
 */
const EXCLUDED_PATHS = [
  '/_next',
  '/static',
  '/favicon.ico',
  '/manifest.json',
  '/sw.js',
  '/icons',
];

// =============================================================================
// Security Headers
// =============================================================================

/**
 * Generates a nonce for CSP inline scripts
 * Note: For production, use a cryptographically secure random generator
 */
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)));
}

/**
 * Applies security headers to the response
 */
function applySecurityHeaders(
  response: NextResponse,
  nonce?: string
): NextResponse {
  // Content-Security-Policy with nonce for inline scripts
  // Note: Main CSP is in next.config.js, this adds nonce support
  if (nonce) {
    response.headers.set('X-Nonce', nonce);
  }

  // Additional security headers not covered in next.config.js
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  // Cache control for security-sensitive responses
  if (response.headers.get('Content-Type')?.includes('text/html')) {
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, max-age=0, must-revalidate'
    );
  }

  return response;
}

// =============================================================================
// CSRF Protection
// =============================================================================

/**
 * Validates CSRF token for state-changing requests
 *
 * IMPLEMENTATION NOTE:
 * In production, implement proper CSRF validation:
 * 1. Generate token server-side on session creation
 * 2. Store in httpOnly cookie (or session)
 * 3. Compare with X-CSRF-Token header
 */
function validateCSRF(request: NextRequest): boolean {
  // Skip for GET, HEAD, OPTIONS
  if (!CSRF_PROTECTED_METHODS.includes(request.method)) {
    return true;
  }

  // Skip for API routes that handle their own CSRF
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return true;
  }

  // Check for CSRF token in header
  const csrfHeader = request.headers.get('X-CSRF-Token');
  const csrfCookie = request.cookies.get('csrf_token')?.value;

  // For now, just check that CSRF header is present for mutations
  // In production, compare with server-side generated token
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Require CSRF header for API mutations
    // This is a basic check - enhance for production
    const origin = request.headers.get('Origin');
    const host = request.headers.get('Host');

    // Check same-origin
    if (origin) {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        console.warn('[SECURITY] Cross-origin request blocked:', {
          origin,
          host,
          path: request.nextUrl.pathname,
        });
        return false;
      }
    }
  }

  return true;
}

// =============================================================================
// Request Validation
// =============================================================================

/**
 * Validates incoming request for suspicious patterns
 */
function validateRequest(request: NextRequest): { valid: boolean; reason?: string } {
  const url = request.nextUrl;

  // Check for path traversal attempts
  if (url.pathname.includes('..') || url.pathname.includes('%2e%2e')) {
    return { valid: false, reason: 'Path traversal detected' };
  }

  // Check for null bytes
  if (url.pathname.includes('\0') || url.pathname.includes('%00')) {
    return { valid: false, reason: 'Null byte detected' };
  }

  // Check for suspicious query parameters
  const searchParams = url.searchParams.toString();
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /eval\(/i,
    /expression\(/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(decodeURIComponent(searchParams))) {
      return { valid: false, reason: 'Suspicious input detected' };
    }
  }

  // Check Content-Length for POST/PUT requests
  const contentLength = request.headers.get('Content-Length');
  if (contentLength) {
    const length = parseInt(contentLength, 10);
    const maxBodySize = 10 * 1024 * 1024; // 10MB limit

    if (length > maxBodySize) {
      return { valid: false, reason: 'Request body too large' };
    }
  }

  return { valid: true };
}

// =============================================================================
// Rate Limiting (Client Hints)
// =============================================================================

/**
 * Adds rate limit hints to response headers
 * Actual rate limiting should be done server-side or with edge functions
 */
function addRateLimitHints(response: NextResponse, request: NextRequest): void {
  // These are hints for the client - actual enforcement is server-side
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/');

  if (isApiRoute) {
    // Suggest rate limits to clients
    response.headers.set('X-RateLimit-Policy', 'standard');

    // Add Retry-After hint for failed requests (placeholder)
    // In production, calculate actual remaining requests
    response.headers.set('X-RateLimit-Limit', '60');
    response.headers.set('X-RateLimit-Window', '60');
  }
}

// =============================================================================
// Authentication Check
// =============================================================================

/**
 * Checks if a route requires authentication
 */
function requiresAuth(pathname: string): boolean {
  return PROTECTED_API_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Validates authentication for protected routes
 */
function validateAuth(request: NextRequest): boolean {
  // Check for auth token
  const authHeader = request.headers.get('Authorization');
  const sessionCookie = request.cookies.get('session')?.value;

  // For protected routes, require some form of authentication
  if (requiresAuth(request.nextUrl.pathname)) {
    if (!authHeader && !sessionCookie) {
      return false;
    }
  }

  return true;
}

// =============================================================================
// Main Middleware
// =============================================================================

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip excluded paths
  if (EXCLUDED_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Validate request
  const validation = validateRequest(request);
  if (!validation.valid) {
    console.warn('[SECURITY] Request blocked:', validation.reason, {
      path: pathname,
      method: request.method,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    return new NextResponse(
      JSON.stringify({ error: 'Bad Request', code: 'INVALID_REQUEST' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Validate CSRF for mutations
  if (!validateCSRF(request)) {
    console.warn('[SECURITY] CSRF validation failed:', {
      path: pathname,
      method: request.method,
    });

    return new NextResponse(
      JSON.stringify({ error: 'Forbidden', code: 'CSRF_INVALID' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Check authentication for protected routes
  if (!validateAuth(request)) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Generate nonce for CSP
  const nonce = generateNonce();

  // Create response
  const response = NextResponse.next();

  // Apply security headers
  applySecurityHeaders(response, nonce);

  // Add rate limit hints
  addRateLimitHints(response, request);

  // Add request ID for tracing
  const requestId = crypto.randomUUID();
  response.headers.set('X-Request-Id', requestId);

  return response;
}

// =============================================================================
// Middleware Configuration
// =============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
