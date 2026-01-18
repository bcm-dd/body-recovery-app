/**
 * Health Sync API - Movement & Recovery Companion
 *
 * Receives health data from mobile devices and returns readiness.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, healthSnapshots } from '@/db';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { requireAuth, AuthError, unauthorizedResponse } from '@/lib/auth';

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

    // Upsert health snapshots
    for (const snapshot of snapshots) {
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
    }

    // Calculate readiness for the latest snapshot
    const latestSnapshot = snapshots[snapshots.length - 1];
    const readiness = calculateReadiness(latestSnapshot);

    return NextResponse.json({
      data: {
        synced: snapshots.length,
        readiness,
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

function calculateReadiness(snapshot: {
  sleepDuration?: number;
  sleepQuality?: number;
  hrv?: number;
  restingHr?: number;
  steps?: number;
  activeCalories?: number;
}) {
  // Factor scores (0-100 each)
  const factors = {
    sleep: calculateSleepFactor(snapshot.sleepDuration, snapshot.sleepQuality),
    recovery: calculateRecoveryFactor(snapshot.hrv, snapshot.restingHr),
    load: calculateLoadFactor(snapshot.steps, snapshot.activeCalories),
    body: 100, // Default until injury data is integrated
  };

  // Weighted average: 30% sleep, 30% recovery, 25% load, 15% body
  const score = Math.round(
    factors.sleep * 0.30 +
    factors.recovery * 0.30 +
    factors.load * 0.25 +
    factors.body * 0.15
  );

  let recommendation: string;
  if (score >= 75) recommendation = 'full';
  else if (score >= 55) recommendation = 'moderate';
  else if (score >= 35) recommendation = 'light';
  else recommendation = 'rest';

  return {
    score,
    factors,
    recommendation,
  };
}

function calculateSleepFactor(duration?: number, quality?: number): number {
  let score = 70; // Base

  if (duration !== undefined) {
    if (duration >= 7 && duration <= 9) {
      score += 20;
    } else if (duration >= 6 && duration < 7) {
      score += 5;
    } else if (duration > 9) {
      score += 10;
    } else if (duration < 6) {
      score -= 20;
    }
  }

  if (quality !== undefined) {
    // Quality is 0-100
    score += (quality - 70) / 3;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateRecoveryFactor(hrv?: number, restingHr?: number): number {
  let score = 70; // Base

  if (hrv !== undefined) {
    // HRV baseline assumption: 50ms is average
    if (hrv >= 60) score += 20;
    else if (hrv >= 50) score += 10;
    else if (hrv >= 40) score -= 5;
    else score -= 15;
  }

  if (restingHr !== undefined) {
    // Resting HR baseline assumption: 60 bpm is average
    if (restingHr <= 55) score += 10;
    else if (restingHr <= 65) score += 5;
    else if (restingHr > 75) score -= 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateLoadFactor(steps?: number, activeCalories?: number): number {
  // Load factor: higher load = lower readiness (need recovery)
  let score = 85; // Base - assume moderate activity

  if (steps !== undefined) {
    // 7500 steps is "moderate" baseline
    if (steps > 15000) score -= 20;
    else if (steps > 10000) score -= 10;
    else if (steps < 3000) score += 5;
  }

  if (activeCalories !== undefined) {
    // 400 cal is moderate baseline
    if (activeCalories > 800) score -= 15;
    else if (activeCalories > 500) score -= 5;
    else if (activeCalories < 200) score += 5;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
