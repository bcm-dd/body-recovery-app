/**
 * Health Sync API - Movement & Recovery Companion
 *
 * Receives health data from mobile devices and returns readiness.
 * Uses Vercel KV for fast storage with Postgres fallback.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, healthSnapshots } from '@/db';
import { z } from 'zod';
import { requireAuth, AuthError, unauthorizedResponse } from '@/lib/auth';
import { saveUserReadiness, saveHealthSnapshot } from '@/lib/store';
import type { ReadinessInput } from '@/lib/types';

// Request validation
const healthSyncSchema = z.object({
  snapshots: z.array(z.object({
    date: z.string(),
    sleepDuration: z.number().optional(),
    sleepQuality: z.number().optional(),
    hrv: z.number().optional(),
    restingHr: z.number().optional(),
    steps: z.number().optional(),
    activeCalories: z.number().optional(),
  })),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);
    const userId = user.id;

    const body = await request.json();
    const { snapshots } = healthSyncSchema.parse(body);

    // Process each snapshot
    for (const snapshot of snapshots) {
      // Save to Postgres for historical data
      try {
        await db
          .insert(healthSnapshots)
          .values({
            userId,
            date: snapshot.date,
            sleepDuration: snapshot.sleepDuration?.toString(),
            sleepQuality: snapshot.sleepQuality,
            hrv: snapshot.hrv?.toString(),
            restingHr: snapshot.restingHr,
            steps: snapshot.steps,
            activeCalories: snapshot.activeCalories,
          })
          .onConflictDoUpdate({
            target: [healthSnapshots.userId, healthSnapshots.date],
            set: {
              sleepDuration: snapshot.sleepDuration?.toString(),
              sleepQuality: snapshot.sleepQuality,
              hrv: snapshot.hrv?.toString(),
              restingHr: snapshot.restingHr,
              steps: snapshot.steps,
              activeCalories: snapshot.activeCalories,
            },
          });
      } catch (dbError) {
        // Log but continue - KV will still work
        console.warn('Postgres insert failed, continuing with KV:', dbError);
      }

      // Save to KV for fast access
      await saveHealthSnapshot(userId, {
        date: snapshot.date,
        sleepDuration: snapshot.sleepDuration,
        sleepQuality: snapshot.sleepQuality,
        hrv: snapshot.hrv,
        restingHr: snapshot.restingHr,
        steps: snapshot.steps,
        activeCalories: snapshot.activeCalories,
      });
    }

    // Calculate and save readiness for the latest snapshot
    const latestSnapshot = snapshots[snapshots.length - 1];
    const readinessInput: ReadinessInput = {
      date: latestSnapshot.date,
      sleepDuration: latestSnapshot.sleepDuration,
      sleepQuality: latestSnapshot.sleepQuality,
      hrv: latestSnapshot.hrv,
      restingHr: latestSnapshot.restingHr,
      steps: latestSnapshot.steps,
      activeCalories: latestSnapshot.activeCalories,
    };

    const readiness = await saveUserReadiness(userId, readinessInput);

    return NextResponse.json({
      data: {
        synced: snapshots.length,
        readiness: {
          score: readiness.score,
          factors: readiness.factors,
          recommendation: readiness.recommendation,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Health sync error:', error);

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
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to sync health data' } },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);
    const userId = user.id;

    // Get date from query params
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    // Import dynamically to avoid circular dependency issues
    const { getHealthSnapshot } = await import('@/lib/store');
    const snapshot = await getHealthSnapshot(userId, date || new Date().toISOString().split('T')[0]);

    if (!snapshot) {
      return NextResponse.json({
        data: null,
        meta: {
          timestamp: new Date().toISOString(),
          message: 'No health data found for the specified date',
        },
      });
    }

    return NextResponse.json({
      data: snapshot,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Health get error:', error);

    if (error instanceof AuthError) {
      return unauthorizedResponse(error.message);
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get health data' } },
      { status: 500 }
    );
  }
}
