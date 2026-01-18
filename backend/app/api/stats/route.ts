/**
 * Stats API - Movement & Recovery Companion
 *
 * Provides user profile statistics and progress metrics.
 * GET - Retrieve user stats
 * POST - Reset/initialize stats (admin use)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError, unauthorizedResponse } from '@/lib/auth';
import { getUserStats, initializeUserStats } from '@/lib/store';

/**
 * GET /api/stats
 * Get user's profile statistics
 *
 * Returns:
 * - totalWorkouts: Total number of workouts completed
 * - totalExercises: Total number of exercises performed
 * - totalVolume: Total weight lifted (all time)
 * - averageWorkoutDuration: Average workout duration in minutes
 * - averageReadiness: Average readiness score
 * - streak: Current and longest workout streaks
 * - volumeStats: Weekly, monthly, and all-time volume
 * - favoriteExercises: Top exercises by frequency
 * - bodyRegionFocus: Distribution of training focus
 * - activeInjuries: Number of active injuries
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);
    const userId = user.id;

    // Fetch stats from store
    const stats = await getUserStats(userId);

    return NextResponse.json({
      data: {
        totalWorkouts: stats.totalWorkouts,
        totalExercises: stats.totalExercises,
        totalVolume: stats.totalVolume,
        averageWorkoutDuration: stats.averageWorkoutDuration,
        averageReadiness: stats.averageReadiness,
        streak: stats.streak,
        volumeStats: stats.volumeStats,
        favoriteExercises: stats.favoriteExercises,
        bodyRegionFocus: stats.bodyRegionFocus,
        activeInjuries: stats.activeInjuries,
        updatedAt: stats.updatedAt,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Stats GET error:', error);

    if (error instanceof AuthError) {
      return unauthorizedResponse(error.message);
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get user stats' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stats
 * Initialize or reset user stats
 *
 * Note: This is primarily for admin/testing use.
 * In production, stats are automatically updated when workouts are saved.
 *
 * Body:
 * - reset: boolean (optional) - If true, resets stats to default values
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);
    const userId = user.id;

    // Check for reset flag
    let shouldReset = false;
    try {
      const body = await request.json();
      shouldReset = body?.reset === true;
    } catch {
      // No body or invalid JSON - just initialize if not exists
    }

    if (shouldReset) {
      // Force reset stats
      const stats = await initializeUserStats(userId);

      return NextResponse.json({
        data: stats,
        meta: {
          timestamp: new Date().toISOString(),
          message: 'Stats have been reset to default values',
        },
      });
    }

    // Just get or initialize stats
    const existingStats = await getUserStats(userId);

    // If stats already exist and have data, just return them
    if (existingStats.totalWorkouts > 0) {
      return NextResponse.json({
        data: existingStats,
        meta: {
          timestamp: new Date().toISOString(),
          message: 'Stats already initialized',
        },
      });
    }

    // Initialize new stats
    const stats = await initializeUserStats(userId);

    return NextResponse.json({
      data: stats,
      meta: {
        timestamp: new Date().toISOString(),
        message: 'Stats initialized successfully',
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Stats POST error:', error);

    if (error instanceof AuthError) {
      return unauthorizedResponse(error.message);
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to initialize stats' } },
      { status: 500 }
    );
  }
}
