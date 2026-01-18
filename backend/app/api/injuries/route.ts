/**
 * Injuries API - Movement & Recovery Companion
 *
 * Manages user injury tracking and constraints.
 * GET - List all injuries (with optional status filter)
 * POST - Log a new injury
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, AuthError, unauthorizedResponse } from '@/lib/auth';
import { getUserInjuries, saveInjury, updateInjury, deleteInjury } from '@/lib/store';
import type { InjuryInput, InjuryUpdate } from '@/lib/types';

// Validation schemas
const injuryConstraintSchema = z.object({
  type: z.enum(['avoid_exercise', 'avoid_movement', 'limit_weight', 'limit_reps', 'avoid_region']),
  value: z.string(),
  description: z.string().optional(),
});

const injuryInputSchema = z.object({
  bodyRegion: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  severity: z.enum(['mild', 'moderate', 'severe']),
  status: z.enum(['active', 'recovering', 'resolved', 'chronic']).optional(),
  constraints: z.array(injuryConstraintSchema).optional(),
  clinicalNotes: z.string().max(2000).optional(),
  startDate: z.string().optional(),
});

const injuryUpdateSchema = z.object({
  injuryId: z.string(),
  description: z.string().max(500).optional(),
  severity: z.enum(['mild', 'moderate', 'severe']).optional(),
  status: z.enum(['active', 'recovering', 'resolved', 'chronic']).optional(),
  constraints: z.array(injuryConstraintSchema).optional(),
  clinicalNotes: z.string().max(2000).optional(),
  resolvedDate: z.string().optional(),
});

/**
 * GET /api/injuries
 * List user's injuries
 *
 * Query params:
 * - status: 'active' | 'recovering' | 'resolved' | 'chronic' | 'all' (default: 'all')
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);
    const userId = user.id;

    // Get status filter from query params
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');

    const status = statusParam as 'active' | 'recovering' | 'resolved' | 'chronic' | 'all' | undefined;

    // Fetch injuries from store
    const injuries = await getUserInjuries(userId, { status: status || 'all' });

    // Calculate summary stats
    const activeCount = injuries.filter(i => i.status === 'active').length;
    const recoveringCount = injuries.filter(i => i.status === 'recovering').length;

    return NextResponse.json({
      data: injuries,
      meta: {
        timestamp: new Date().toISOString(),
        total: injuries.length,
        active: activeCount,
        recovering: recoveringCount,
      },
    });
  } catch (error) {
    console.error('Injuries GET error:', error);

    if (error instanceof AuthError) {
      return unauthorizedResponse(error.message);
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get injuries' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/injuries
 * Log a new injury
 *
 * Body:
 * - bodyRegion: string (required) - e.g., "left_shoulder", "lower_back"
 * - description: string (optional) - Description of the injury
 * - severity: 'mild' | 'moderate' | 'severe' (required)
 * - status: 'active' | 'recovering' | 'resolved' | 'chronic' (optional, default: 'active')
 * - constraints: array of constraint objects (optional)
 * - clinicalNotes: string (optional) - Notes from healthcare provider
 * - startDate: ISO date string (optional, defaults to today)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);
    const userId = user.id;

    const body = await request.json();
    const validatedInput = injuryInputSchema.parse(body);

    const injuryInput: InjuryInput = {
      bodyRegion: validatedInput.bodyRegion,
      description: validatedInput.description,
      severity: validatedInput.severity,
      status: validatedInput.status,
      constraints: validatedInput.constraints,
      clinicalNotes: validatedInput.clinicalNotes,
      startDate: validatedInput.startDate,
    };

    // Save injury to store
    const injury = await saveInjury(userId, injuryInput);

    return NextResponse.json({
      data: injury,
      meta: {
        timestamp: new Date().toISOString(),
        message: 'Injury logged successfully',
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Injuries POST error:', error);

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
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to log injury' } },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/injuries
 * Update an existing injury
 *
 * Body:
 * - injuryId: string (required)
 * - description: string (optional)
 * - severity: 'mild' | 'moderate' | 'severe' (optional)
 * - status: 'active' | 'recovering' | 'resolved' | 'chronic' (optional)
 * - constraints: array of constraint objects (optional)
 * - clinicalNotes: string (optional)
 * - resolvedDate: ISO date string (optional)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);
    const userId = user.id;

    const body = await request.json();
    const validatedInput = injuryUpdateSchema.parse(body);

    const { injuryId, ...updateData } = validatedInput;

    const injuryUpdate: InjuryUpdate = {
      description: updateData.description,
      severity: updateData.severity,
      status: updateData.status,
      constraints: updateData.constraints,
      clinicalNotes: updateData.clinicalNotes,
      resolvedDate: updateData.resolvedDate,
    };

    // Update injury in store
    const updatedInjury = await updateInjury(userId, injuryId, injuryUpdate);

    if (!updatedInjury) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Injury not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: updatedInjury,
      meta: {
        timestamp: new Date().toISOString(),
        message: 'Injury updated successfully',
      },
    });
  } catch (error) {
    console.error('Injuries PATCH error:', error);

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
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update injury' } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/injuries
 * Delete an injury
 *
 * Query params:
 * - id: string (required) - Injury ID to delete
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);
    const userId = user.id;

    // Get injury ID from query params
    const { searchParams } = new URL(request.url);
    const injuryId = searchParams.get('id');

    if (!injuryId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Injury ID is required' } },
        { status: 400 }
      );
    }

    // Delete injury from store
    const deleted = await deleteInjury(userId, injuryId);

    if (!deleted) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Injury not found or could not be deleted' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: { deleted: true, injuryId },
      meta: {
        timestamp: new Date().toISOString(),
        message: 'Injury deleted successfully',
      },
    });
  } catch (error) {
    console.error('Injuries DELETE error:', error);

    if (error instanceof AuthError) {
      return unauthorizedResponse(error.message);
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete injury' } },
      { status: 500 }
    );
  }
}
