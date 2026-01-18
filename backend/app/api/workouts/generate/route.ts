/**
 * Workout Generation API - Movement & Recovery Companion
 *
 * AI-powered workout generation with constraint awareness.
 */

import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';

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
    // TODO: Get user from auth session
    const userId = 'demo-user-id';

    const body = await request.json();
    const { date, preferences } = generateRequestSchema.parse(body);

    // TODO: Fetch actual user data
    const constraints: string[] = []; // Would come from body model
    const recentWorkouts: string[] = []; // Would come from DB

    const result = await generateObject({
      model: anthropic('claude-sonnet-4-20250514'),
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
