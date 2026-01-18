/**
 * Workout Generation API - Movement & Recovery Companion
 *
 * AI-powered workout generation with constraint awareness.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { z } from 'zod';
import { db, injuries, workouts } from '@/db';
import { eq, desc, and, or } from 'drizzle-orm';
import { requireAuth, AuthError, unauthorizedResponse } from '@/lib/auth';
import { taskModels } from '@/lib/ai';

// Request validation
const generateRequestSchema = z.object({
  date: z.string(),
  preferences: z.object({
    duration: z.number().optional().default(45),
    focus: z.string().optional(),
    equipment: z.array(z.string()).optional(),
  }).optional(),
});

// Response schema for AI
const workoutSchema = z.object({
  exercises: z.array(z.object({
    exerciseId: z.string(),
    name: z.string(),
    order: z.number(),
    prescribedWeight: z.number().optional(),
    prescribedReps: z.number(),
    prescribedSets: z.number(),
    notes: z.string().optional(),
  })),
  estimatedDuration: z.number(),
  focus: z.string(),
  reasoning: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);
    const userId = user.id;

    const body = await request.json();
    const { date, preferences } = generateRequestSchema.parse(body);

    // Fetch active injuries and their constraints
    const activeInjuries = await db
      .select()
      .from(injuries)
      .where(
        and(
          eq(injuries.userId, userId),
          or(
            eq(injuries.status, 'active'),
            eq(injuries.status, 'recovering')
          )
        )
      );

    // Build constraints from injuries
    const constraints: string[] = activeInjuries.flatMap(injury => {
      const injuryConstraints: string[] = [];
      if (injury.bodyRegion) {
        injuryConstraints.push(`Avoid exercises that stress the ${injury.bodyRegion}`);
      }
      if (injury.severity === 'severe') {
        injuryConstraints.push(`${injury.bodyRegion}: Complete rest recommended`);
      } else if (injury.severity === 'moderate') {
        injuryConstraints.push(`${injury.bodyRegion}: Light exercises only, avoid impact`);
      }
      return injuryConstraints;
    });

    // Fetch recent workouts for variety
    const recentWorkoutData = await db
      .select()
      .from(workouts)
      .where(eq(workouts.userId, userId))
      .orderBy(desc(workouts.date))
      .limit(5);

    const recentWorkouts = recentWorkoutData.map(w =>
      `${w.date}: ${w.status || 'General'} workout`
    );

    const result = await generateObject({
      model: taskModels.workoutGeneration,
      schema: workoutSchema,
      prompt: `Generate a workout for someone with the following preferences:
- Duration: ${preferences?.duration || 45} minutes
- Focus: ${preferences?.focus || 'full body'}
- Available equipment: ${preferences?.equipment?.join(', ') || 'full gym'}

Constraints to avoid:
${constraints.length > 0 ? constraints.join('\n') : 'None'}

Recent workout history:
${recentWorkouts.length > 0 ? recentWorkouts.join('\n') : 'First workout'}

Generate a balanced workout with proper exercise selection, sets, and reps.
Use realistic exercise IDs like 'bench_press', 'squat', 'deadlift', 'bent_over_row', etc.
Include notes for form cues where helpful.`,
    });

    // Create workout in database
    const workoutId = `workout_${Date.now()}`;

    return NextResponse.json({
      data: {
        id: workoutId,
        date,
        ...result.object,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Workout generation error:', error);

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
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to generate workout' } },
      { status: 500 }
    );
  }
}
