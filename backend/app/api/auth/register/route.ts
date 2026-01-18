/**
 * User Registration API Route
 *
 * POST /api/auth/register
 * Creates a new user account
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createUser, findUserByEmail } from '@/lib/auth';
import { checkRateLimit, rateLimitedResponse, rateLimitConfigs } from '@/lib/rate-limit';
import { sanitizeString, sanitizeEmail } from '@/lib/sanitize';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = await checkRateLimit(`register:${ip}`, rateLimitConfigs.strict);
  if (rateLimit.limited) {
    return rateLimitedResponse(rateLimit.resetAt);
  }

  try {
    const body = await request.json();

    // Validate input
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Sanitize name and email to prevent XSS
    const sanitizedName = sanitizeString(name);
    const sanitizedEmail = sanitizeEmail(email);

    // Check if user already exists
    const existingUser = await findUserByEmail(sanitizedEmail);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Create user
    const user = await createUser(sanitizedEmail, password, sanitizedName);
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
