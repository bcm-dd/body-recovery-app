/**
 * NextAuth.js API Route Handler
 *
 * Handles all authentication-related API requests:
 * - GET /api/auth/session - Get current session
 * - GET /api/auth/csrf - Get CSRF token
 * - GET /api/auth/providers - List providers
 * - GET/POST /api/auth/signin - Sign in
 * - GET/POST /api/auth/signout - Sign out
 * - GET/POST /api/auth/callback/* - Provider callbacks
 */

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
