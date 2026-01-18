/**
 * Workout Generation API - Movement & Recovery Companion
 *
 * AI-powered workout generation with constraint awareness.
 * Saves generated workouts to KV for tracking and retrieval.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { z } from 'zod';
import { requireAuth, AuthError, unauthorizedResponse } from '@/lib/auth';
import { taskModels } from '@/lib/ai';
import {
  getActiveInjuries,
  getUserWorkouts,
  saveWorkout,
  getUserReadiness,
} from '@/lib/store';
import type { Workout, ExerciseLog } from '@/lib/types';

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

    // Fetch active injuries from KV store
    const activeInjuries = await getActiveInjuries(userId);

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

      // Add specific constraints from injury record
      for (const constraint of injury.constraints) {
        if (constraint.description) {
          injuryConstraints.push(constraint.description);
        } else {
          injuryConstraints.push(`${constraint.type}: ${constraint.value}`);
        }
      }

      return injuryConstraints;
    });

    // Fetch recent workouts from KV store for variety
    const recentWorkouts = await getUserWorkouts(userId, { limit: 5 });
    const recentWorkoutSummary = recentWorkouts.map(w =>
      `${w.date}: ${w.focus || 'General'} workout (${w.status})`
    );

    // Get current readiness to adjust workout intensity
    const readiness = await getUserReadiness(userId);
    const readinessContext = readiness
      ? `Current readiness score: ${readiness.score}/100 (${readiness.recommendation} intensity recommended)`
      : 'No readiness data available';

    // Generate workout using AI
    const result = await generateObject({
      model: taskModels.workoutGeneration,
      schema: workoutSchema,
      prompt: `Generate a workout for someone with the following preferences:
- Duration: ${preferences?.duration || 45} minutes
- Focus: ${preferences?.focus || 'full body'}
- Available equipment: ${preferences?.equipment?.join(', ') || 'full gym'}

${readinessContext}

Constraints to avoid:
${constraints.length > 0 ? constraints.join('\n') : 'None'}

Recent workout history:
${recentWorkoutSummary.length > 0 ? recentWorkoutSummary.join('\n') : 'First workout'}

Generate a balanced workout with proper exercise selection, sets, and reps.
Use realistic exercise IDs like 'bench_press', 'squat', 'deadlift', 'bent_over_row', 'overhead_press', 'lat_pulldown', 'leg_press', 'romanian_deadlift', 'dumbbell_curl', 'tricep_pushdown', 'plank', 'cable_row', etc.
${readiness && readiness.recommendation === 'light' ? 'Keep the workout light with reduced volume.' : ''}
${readiness && readiness.recommendation === 'rest' ? 'Generate a very light recovery-focused workout with mobility and stretching.' : ''}
Include notes for form cues where helpful.`,
    });

    // Create workout ID
    const workoutId = `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Transform AI result to our exercise log format
    const exercises: ExerciseLog[] = result.object.exercises.map((ex, index) => ({
      id: `ex_${workoutId}_${index}`,
      exerciseId: ex.exerciseId,
      name: ex.name,
      order: ex.order,
      prescribedWeight: ex.prescribedWeight,
      prescribedReps: ex.prescribedReps,
      prescribedSets: ex.prescribedSets,
      completedSets: [],
      notes: ex.notes,
      skipped: false,
    }));

    // Create workout object
    const workout: Omit<Workout, 'userId'> = {
      id: workoutId,
      date,
      status: 'planned',
      focus: result.object.focus,
      plannedDuration: result.object.estimatedDuration,
      readinessScore: readiness?.score,
      exercises,
      reasoning: result.object.reasoning,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save workout to KV store
    const savedWorkout = await saveWorkout(userId, workout);

    return NextResponse.json({
      data: {
        id: savedWorkout.id,
        date: savedWorkout.date,
        status: savedWorkout.status,
        focus: savedWorkout.focus,
        exercises: result.object.exercises,
        estimatedDuration: result.object.estimatedDuration,
        reasoning: result.object.reasoning,
        readinessScore: readiness?.score,
        recommendation: readiness?.recommendation,
      },
      meta: {
        timestamp: new Date().toISOString(),
        constraintsApplied: constraints.length,
        recentWorkoutsConsidered: recentWorkouts.length,
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

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);
    const userId = user.id;

    // Get query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Fetch workouts from KV store
    const workouts = await getUserWorkouts(userId, { limit, offset });

    return NextResponse.json({
      data: workouts,
      meta: {
        timestamp: new Date().toISOString(),
        count: workouts.length,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Workout list error:', error);

    if (error instanceof AuthError) {
      return unauthorizedResponse(error.message);
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get workouts' } },
      { status: 500 }
    );
  }
}
