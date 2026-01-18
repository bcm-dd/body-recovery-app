/**
 * Authentication configuration for Movement & Recovery Companion
 *
 * Uses NextAuth.js with credentials provider for email/password authentication.
 * JWT-based sessions for stateless authentication.
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  isGuest?: boolean;
}

// Validation schemas
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Mock user store - in production, this would be a database
// For MVP, we store users in memory (resets on server restart)
const users: Map<string, { id: string; email: string; name: string; password: string }> = new Map();

// Pre-seed with a demo user
users.set('demo@example.com', {
  id: 'demo-user-1',
  email: 'demo@example.com',
  name: 'Demo User',
  password: 'password123',
});

/**
 * Find user by email
 */
export function findUserByEmail(email: string) {
  return users.get(email.toLowerCase()) || null;
}

/**
 * Create a new user
 */
export function createUser(email: string, password: string, name: string) {
  const normalizedEmail = email.toLowerCase();

  if (users.has(normalizedEmail)) {
    return null; // User already exists
  }

  const newUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: normalizedEmail,
    name,
    password,
  };

  users.set(normalizedEmail, newUser);
  return newUser;
}

/**
 * Validate user credentials
 */
export function validateCredentials(email: string, password: string) {
  const user = findUserByEmail(email);
  if (!user) return null;

  // Simple password comparison - in production, use bcrypt
  if (user.password !== password) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

/**
 * NextAuth configuration
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        isGuest: { label: 'Guest Mode', type: 'text' },
        name: { label: 'Name', type: 'text' },
      },
      async authorize(credentials) {
        // Handle guest login
        if (credentials?.isGuest === 'true') {
          return {
            id: `guest-${Date.now()}`,
            email: 'guest@demo.local',
            name: 'Guest User',
            isGuest: true,
          };
        }

        // Validate credentials
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const user = validateCredentials(email, password);

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isGuest: false,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.isGuest = (user as User).isGuest || false;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user id and guest status to session
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as User).isGuest = token.isGuest as boolean;
      }
      return session;
    },
  },
  trustHost: true,
});

// Re-export auth as getSession for convenience
export const getSession = auth;

/**
 * Auth error class for consistent error handling
 */
export class AuthError extends Error {
  constructor(message: string, public status: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Helper to create unauthorized response
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Auth user interface for API routes
 */
export interface AuthUser {
  id: string;
  email?: string;
}

/**
 * Require authentication for API routes
 * Returns user object if authenticated, throws AuthError otherwise
 */
export async function requireAuth(request: Request): Promise<AuthUser> {
  // Check for Authorization header (Bearer token or simple auth)
  const authHeader = request.headers.get('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    // For demo/development, accept 'demo' token
    if (token === 'demo') {
      return { id: 'demo-user-1', email: 'demo@example.com' };
    }
  }

  // Try to get session from NextAuth
  try {
    const session = await auth();
    if (session?.user?.id) {
      return {
        id: session.user.id as string,
        email: session.user.email || undefined,
      };
    }
  } catch {
    // Session check failed
  }

  throw new AuthError('Authentication required');
}
