/**
 * Readiness API - Movement & Recovery Companion
 *
 * Provides access to user readiness scores and factors.
 * GET - Retrieve current or historical readiness
 * POST - Manually submit readiness data (for devices without auto-sync)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, AuthError, unauthorizedResponse } from '@/lib/auth';
import { getUserReadiness, saveUserReadiness } from '@/lib/store';
import type { ReadinessInput } from '@/lib/types';

// Request validation for POST
const readinessInputSchema = z.object({
  date: z.string().optional(),
  sleepDuration: z.number().min(0).max(24).optional(),
  sleepQuality: z.number().min(0).max(100).optional(),
  hrv: z.number().min(0).optional(),
  restingHr: z.number().min(30).max(200).optional(),
  steps: z.number().min(0).optional(),
  activeCalories: z.number().min(0).optional(),
  bodyScore: z.number().min(0).max(100).optional(),
});

/**
 * GET /api/readiness
 * Get user's current readiness or for a specific date
 *
 * Query params:
 * - date: ISO date string (YYYY-MM-DD) - optional, defaults to today
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);
    const userId = user.id;

    // Get date from query params
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || undefined;

    // Fetch readiness from store
    const readiness = await getUserReadiness(userId, date);

    if (!readiness) {
      return NextResponse.json({
        data: null,
        meta: {
          timestamp: new Date().toISOString(),
          message: 'No readiness data available. Sync health data or submit manually.',
        },
      });
    }

    return NextResponse.json({
      data: {
        date: readiness.date,
        score: readiness.score,
        factors: readiness.factors,
        recommendation: readiness.recommendation,
        updatedAt: readiness.updatedAt,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Readiness GET error:', error);

    if (error instanceof AuthError) {
      return unauthorizedResponse(error.message);
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get readiness data' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/readiness
 * Submit readiness data manually
 *
 * Body:
 * - date: ISO date string (optional, defaults to today)
 * - sleepDuration: hours of sleep
 * - sleepQuality: 0-100
 * - hrv: milliseconds
 * - restingHr: bpm
 * - steps: step count
 * - activeCalories: calories burned
 * - bodyScore: manual override for body factor (0-100)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);
    const userId = user.id;

    const body = await request.json();
    const validatedInput = readinessInputSchema.parse(body);

    // Default date to today if not provided
    const readinessInput: ReadinessInput = {
      date: validatedInput.date || new Date().toISOString().split('T')[0],
      sleepDuration: validatedInput.sleepDuration,
      sleepQuality: validatedInput.sleepQuality,
      hrv: validatedInput.hrv,
      restingHr: validatedInput.restingHr,
      steps: validatedInput.steps,
      activeCalories: validatedInput.activeCalories,
      bodyScore: validatedInput.bodyScore,
    };

    // Calculate and save readiness
    const readiness = await saveUserReadiness(userId, readinessInput);

    return NextResponse.json({
      data: {
        date: readiness.date,
        score: readiness.score,
        factors: readiness.factors,
        recommendation: readiness.recommendation,
        updatedAt: readiness.updatedAt,
      },
      meta: {
        timestamp: new Date().toISOString(),
        message: 'Readiness calculated and saved successfully',
      },
    });
  } catch (error) {
    console.error('Readiness POST error:', error);

    if (error instanceof AuthError) {
      return unauthorizedResponse(error.message);
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to save readiness data' } },
      { status: 500 }
    );
  }
}
