/**
 * AI Chat API - Movement & Recovery Companion
 *
 * Streaming conversational AI for mid-workout adjustments.
 */

import { NextRequest } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { z } from 'zod';

// Request validation
const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
  context: z.object({
    currentWorkout: z.string().optional(),
    currentExercise: z.string().optional(),
    readinessScore: z.number().optional(),
    activeInjuries: z.array(z.string()).optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, context } = chatRequestSchema.parse(body);

    const systemPrompt = buildSystemPrompt(context);

    const result = await streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: systemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('AI chat error:', error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'AI service unavailable' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function buildSystemPrompt(context?: {
  currentWorkout?: string;
  currentExercise?: string;
  readinessScore?: number;
  activeInjuries?: string[];
}): string {
  return `You are a movement and recovery coach assistant within a fitness app.

Your role is to help users during their workouts with:
- Exercise modifications when something doesn't feel right
- Form cues and technique reminders
- Weight/rep adjustments based on feedback
- Motivation and encouragement (warm, not fake cheerful)
- Answering questions about exercises

Current context:
- Workout: ${context?.currentWorkout || 'Not in workout'}
- Current exercise: ${context?.currentExercise || 'None'}
- Readiness score: ${context?.readinessScore || 'Unknown'}/100
- Active injuries: ${context?.activeInjuries?.join(', ') || 'None'}

Communication style:
- Be concise - users are mid-workout
- Lead with action, not explanation
- Offer options rather than demanding decisions
- Match the user's energy (terse → terse)
- Never lecture or use fake enthusiasm
- Suggest, don't demand

Safety:
- Never diagnose medical conditions
- Suggest professional consultation when appropriate
- Don't push through pain signals
- Respect user autonomy while noting concerns

Example responses:
User: "That hurt my shoulder"
Good: "Noted. Want to try cable flies instead, or move on?"

User: "Skip squats"
Good: "Done. Want leg press instead, or just move on?"

User: "This feels too heavy"
Good: "Drop 10% and see how it feels. You can always add back."`;
}
