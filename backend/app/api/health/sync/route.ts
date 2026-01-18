/**
 * Health Sync API - Movement & Recovery Companion
 *
 * Receives health data from mobile devices and returns readiness.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, healthSnapshots } from '@/db';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

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
    // TODO: Get user from auth session
    const userId = 'demo-user-id';

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

function calculateReadiness(snapshot: any) {
  // Simplified readiness calculation
  let score = 70; // Base score

  if (snapshot.sleepDuration) {
    if (snapshot.sleepDuration >= 7 && snapshot.sleepDuration <= 9) {
      score += 10;
    } else if (snapshot.sleepDuration < 6) {
      score -= 15;
    }
  }

  if (snapshot.sleepQuality) {
    score += (snapshot.sleepQuality - 70) / 5;
  }

  if (snapshot.hrv) {
    // Assume baseline of 50ms
    if (snapshot.hrv > 50) {
      score += 10;
    } else if (snapshot.hrv < 40) {
      score -= 10;
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let recommendation: string;
  if (score >= 75) recommendation = 'full';
  else if (score >= 55) recommendation = 'moderate';
  else if (score >= 35) recommendation = 'light';
  else recommendation = 'rest';

  return {
    score,
    factors: {
      sleep: Math.round(score * 0.9 + Math.random() * 10),
      recovery: Math.round(score * 0.8 + Math.random() * 15),
      load: Math.round(70 + Math.random() * 20),
      body: 100,
    },
    recommendation,
  };
}
