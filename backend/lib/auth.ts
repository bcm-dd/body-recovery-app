/**
 * Authentication utilities for Movement & Recovery Companion
 *
 * Provides JWT-based authentication with secure token handling.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';

// Types
export interface AuthUser {
  id: string;
  email: string;
  createdAt: Date;
}

export interface AuthResult {
  user: AuthUser | null;
  error: string | null;
}

// JWT payload schema
const jwtPayloadSchema = z.object({
  sub: z.string(), // user id
  email: z.string().email(),
  iat: z.number(),
  exp: z.number(),
});

/**
 * Extract and validate user from request Authorization header
 *
 * In production, this would verify JWT signature with a secret.
 * For MVP, we decode and validate the payload structure.
 */
export async function getAuthUser(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return { user: null, error: 'Missing Authorization header' };
    }

    if (!authHeader.startsWith('Bearer ')) {
      return { user: null, error: 'Invalid Authorization format. Expected: Bearer <token>' };
    }

    const token = authHeader.slice(7);

    if (!token) {
      return { user: null, error: 'Empty token' };
    }

    // Decode JWT (base64url encoded payload)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { user: null, error: 'Invalid token format' };
    }

    const payloadBase64 = parts[1];
    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson);

    // Validate payload structure
    const validatedPayload = jwtPayloadSchema.parse(payload);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (validatedPayload.exp < now) {
      return { user: null, error: 'Token expired' };
    }

    return {
      user: {
        id: validatedPayload.sub,
        email: validatedPayload.email,
        createdAt: new Date(validatedPayload.iat * 1000),
      },
      error: null,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return { user: null, error: 'Invalid token' };
  }
}

/**
 * Require authentication - returns user or throws error response
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const { user, error } = await getAuthUser(request);

  if (!user) {
    throw new AuthError(error || 'Unauthorized', 401);
  }

  return user;
}

/**
 * Custom error class for auth failures
 */
export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return new Response(
    JSON.stringify({
      error: {
        code: 'UNAUTHORIZED',
        message
      }
    }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Generate a simple JWT token for development/testing
 * In production, use a proper JWT library with signing
 */
export function generateDevToken(userId: string, email: string): string {
  const header = { alg: 'none', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: userId,
    email,
    iat: now,
    exp: now + 86400 * 30, // 30 days
  };

  const headerBase64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');

  return `${headerBase64}.${payloadBase64}.`;
}
