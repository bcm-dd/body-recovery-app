/**
 * Data Store - Movement & Recovery Companion
 *
 * Data access layer using Vercel KV for fast key-value storage.
 * Falls back to mock data when KV is not configured (local development).
 */

import { kv } from '@vercel/kv';
import {
  Readiness,
  ReadinessFactors,
  ReadinessInput,
  ReadinessRecommendation,
  Workout,
  WorkoutSession,
  Injury,
  InjuryInput,
  InjuryUpdate,
  UserStats,
  HealthSnapshot,
} from './types';

// ============================================================================
// KV Availability Check
// ============================================================================

let kvAvailable: boolean | null = null;

async function isKvAvailable(): Promise<boolean> {
  if (kvAvailable !== null) {
    return kvAvailable;
  }

  try {
    // Try a simple operation to check if KV is configured
    await kv.ping();
    kvAvailable = true;
    return true;
  } catch (error) {
    console.warn('Vercel KV not available, using mock data:', error);
    kvAvailable = false;
    return false;
  }
}

// ============================================================================
// Mock Data for Local Development
// ============================================================================

const mockReadiness: Readiness = {
  userId: 'mock-user',
  date: new Date().toISOString().split('T')[0],
  score: 72,
  factors: {
    sleep: 78,
    recovery: 65,
    load: 80,
    body: 70,
  },
  recommendation: 'moderate',
  updatedAt: new Date().toISOString(),
};

const mockWorkouts: Workout[] = [
  {
    id: 'workout_mock_1',
    userId: 'mock-user',
    date: new Date().toISOString().split('T')[0],
    status: 'completed',
    focus: 'upper body',
    plannedDuration: 45,
    actualDuration: 52,
    readinessScore: 72,
    exercises: [
      {
        id: 'ex_1',
        exerciseId: 'bench_press',
        name: 'Bench Press',
        order: 1,
        prescribedWeight: 60,
        prescribedReps: 8,
        prescribedSets: 3,
        completedSets: [
          { setNumber: 1, weight: 60, reps: 8, completed: true },
          { setNumber: 2, weight: 60, reps: 8, completed: true },
          { setNumber: 3, weight: 60, reps: 7, completed: true },
        ],
        skipped: false,
      },
      {
        id: 'ex_2',
        exerciseId: 'bent_over_row',
        name: 'Bent Over Row',
        order: 2,
        prescribedWeight: 50,
        prescribedReps: 10,
        prescribedSets: 3,
        completedSets: [
          { setNumber: 1, weight: 50, reps: 10, completed: true },
          { setNumber: 2, weight: 50, reps: 10, completed: true },
          { setNumber: 3, weight: 50, reps: 9, completed: true },
        ],
        skipped: false,
      },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockInjuries: Injury[] = [
  {
    id: 'injury_mock_1',
    userId: 'mock-user',
    bodyRegion: 'left_shoulder',
    description: 'Rotator cuff strain from overhead press',
    severity: 'mild',
    status: 'recovering',
    constraints: [
      { type: 'avoid_movement', value: 'overhead_press', description: 'Avoid overhead pressing movements' },
      { type: 'limit_weight', value: '30kg', description: 'Limit shoulder pressing to 30kg max' },
    ],
    startDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockStats: UserStats = {
  userId: 'mock-user',
  totalWorkouts: 47,
  totalExercises: 423,
  totalVolume: 125000,
  averageWorkoutDuration: 48,
  averageReadiness: 71,
  streak: {
    current: 3,
    longest: 12,
    lastWorkoutDate: new Date().toISOString().split('T')[0],
  },
  volumeStats: {
    weekly: 8500,
    monthly: 32000,
    allTime: 125000,
  },
  favoriteExercises: [
    { exerciseId: 'bench_press', name: 'Bench Press', count: 42 },
    { exerciseId: 'squat', name: 'Squat', count: 38 },
    { exerciseId: 'deadlift', name: 'Deadlift', count: 35 },
  ],
  bodyRegionFocus: {
    upper: 45,
    lower: 35,
    core: 20,
  },
  activeInjuries: 1,
  updatedAt: new Date().toISOString(),
};

// ============================================================================
// Readiness Functions
// ============================================================================

/**
 * Get user's current readiness score and factors
 */
export async function getUserReadiness(userId: string, date?: string): Promise<Readiness | null> {
  if (!(await isKvAvailable())) {
    return { ...mockReadiness, userId };
  }

  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const key = `readiness:${userId}:${targetDate}`;
    const data = await kv.get<Readiness>(key);

    // If no specific date data, try to get latest
    if (!data && !date) {
      const latestKey = `readiness:${userId}:latest`;
      return await kv.get<Readiness>(latestKey);
    }

    return data;
  } catch (error) {
    console.error('Error getting user readiness:', error);
    return null;
  }
}

/**
 * Save user's readiness data and calculate score
 */
export async function saveUserReadiness(userId: string, input: ReadinessInput): Promise<Readiness> {
  const factors = calculateReadinessFactors(input);
  const score = calculateReadinessScore(factors);
  const recommendation = getReadinessRecommendation(score);

  const readiness: Readiness = {
    userId,
    date: input.date,
    score,
    factors,
    recommendation,
    updatedAt: new Date().toISOString(),
  };

  if (!(await isKvAvailable())) {
    return readiness;
  }

  try {
    const dateKey = `readiness:${userId}:${input.date}`;
    const latestKey = `readiness:${userId}:latest`;

    // Store both date-specific and latest
    await Promise.all([
      kv.set(dateKey, readiness),
      kv.set(latestKey, readiness),
    ]);

    return readiness;
  } catch (error) {
    console.error('Error saving user readiness:', error);
    return readiness; // Return calculated data even if save fails
  }
}

function calculateReadinessFactors(input: ReadinessInput): ReadinessFactors {
  return {
    sleep: calculateSleepFactor(input.sleepDuration, input.sleepQuality),
    recovery: calculateRecoveryFactor(input.hrv, input.restingHr),
    load: calculateLoadFactor(input.steps, input.activeCalories),
    body: input.bodyScore ?? 100,
  };
}

function calculateSleepFactor(duration?: number, quality?: number): number {
  let score = 70;

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
    score += (quality - 70) / 3;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateRecoveryFactor(hrv?: number, restingHr?: number): number {
  let score = 70;

  if (hrv !== undefined) {
    if (hrv >= 60) score += 20;
    else if (hrv >= 50) score += 10;
    else if (hrv >= 40) score -= 5;
    else score -= 15;
  }

  if (restingHr !== undefined) {
    if (restingHr <= 55) score += 10;
    else if (restingHr <= 65) score += 5;
    else if (restingHr > 75) score -= 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateLoadFactor(steps?: number, activeCalories?: number): number {
  let score = 85;

  if (steps !== undefined) {
    if (steps > 15000) score -= 20;
    else if (steps > 10000) score -= 10;
    else if (steps < 3000) score += 5;
  }

  if (activeCalories !== undefined) {
    if (activeCalories > 800) score -= 15;
    else if (activeCalories > 500) score -= 5;
    else if (activeCalories < 200) score += 5;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateReadinessScore(factors: ReadinessFactors): number {
  // Weighted average: 30% sleep, 30% recovery, 25% load, 15% body
  return Math.round(
    factors.sleep * 0.30 +
    factors.recovery * 0.30 +
    factors.load * 0.25 +
    factors.body * 0.15
  );
}

function getReadinessRecommendation(score: number): ReadinessRecommendation {
  if (score >= 75) return 'full';
  if (score >= 55) return 'moderate';
  if (score >= 35) return 'light';
  return 'rest';
}

// ============================================================================
// Workout Functions
// ============================================================================

/**
 * Get user's workout history
 */
export async function getUserWorkouts(
  userId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<Workout[]> {
  const { limit = 20, offset = 0 } = options;

  if (!(await isKvAvailable())) {
    return mockWorkouts.map(w => ({ ...w, userId }));
  }

  try {
    // Get list of workout IDs for user
    const workoutIdsKey = `workouts:${userId}`;
    const workoutIds = await kv.lrange<string>(workoutIdsKey, offset, offset + limit - 1);

    if (!workoutIds || workoutIds.length === 0) {
      return [];
    }

    // Fetch each workout
    const workouts = await Promise.all(
      workoutIds.map(async (id) => {
        const workout = await kv.get<Workout>(`workout:${userId}:${id}`);
        return workout;
      })
    );

    return workouts.filter((w): w is Workout => w !== null);
  } catch (error) {
    console.error('Error getting user workouts:', error);
    return [];
  }
}

/**
 * Get a specific workout by ID
 */
export async function getWorkout(userId: string, workoutId: string): Promise<Workout | null> {
  if (!(await isKvAvailable())) {
    return mockWorkouts.find(w => w.id === workoutId) || null;
  }

  try {
    return await kv.get<Workout>(`workout:${userId}:${workoutId}`);
  } catch (error) {
    console.error('Error getting workout:', error);
    return null;
  }
}

/**
 * Save a workout (new or update)
 */
export async function saveWorkout(userId: string, workout: Omit<Workout, 'userId'>): Promise<Workout> {
  const fullWorkout: Workout = {
    ...workout,
    userId,
    updatedAt: new Date().toISOString(),
  };

  if (!(await isKvAvailable())) {
    return fullWorkout;
  }

  try {
    const workoutKey = `workout:${userId}:${workout.id}`;
    const workoutIdsKey = `workouts:${userId}`;

    // Check if this is a new workout
    const existingWorkout = await kv.get<Workout>(workoutKey);

    if (!existingWorkout) {
      // Add to the list of workout IDs (prepend for most recent first)
      await kv.lpush(workoutIdsKey, workout.id);
    }

    // Save the workout
    await kv.set(workoutKey, fullWorkout);

    // Update stats
    await updateStatsAfterWorkout(userId, fullWorkout);

    return fullWorkout;
  } catch (error) {
    console.error('Error saving workout:', error);
    return fullWorkout;
  }
}

/**
 * Save a completed workout session
 */
export async function saveWorkoutSession(userId: string, session: WorkoutSession): Promise<Workout> {
  const workout: Omit<Workout, 'userId'> = {
    id: session.workoutId,
    date: new Date().toISOString().split('T')[0],
    status: 'completed',
    focus: 'custom',
    actualDuration: session.duration,
    exercises: session.exercises,
    notes: session.notes,
    createdAt: session.startedAt,
    updatedAt: session.completedAt || new Date().toISOString(),
  };

  return saveWorkout(userId, workout);
}

// ============================================================================
// Injury Functions
// ============================================================================

/**
 * Get user's injuries
 */
export async function getUserInjuries(
  userId: string,
  options: { status?: 'active' | 'recovering' | 'resolved' | 'chronic' | 'all' } = {}
): Promise<Injury[]> {
  const { status = 'all' } = options;

  if (!(await isKvAvailable())) {
    const injuries = mockInjuries.map(i => ({ ...i, userId }));
    if (status === 'all') return injuries;
    return injuries.filter(i => i.status === status);
  }

  try {
    // Get list of injury IDs for user
    const injuryIdsKey = `injuries:${userId}`;
    const injuryIds = await kv.lrange<string>(injuryIdsKey, 0, -1);

    if (!injuryIds || injuryIds.length === 0) {
      return [];
    }

    // Fetch each injury
    const injuries = await Promise.all(
      injuryIds.map(async (id) => {
        const injury = await kv.get<Injury>(`injury:${userId}:${id}`);
        return injury;
      })
    );

    const validInjuries = injuries.filter((i): i is Injury => i !== null);

    // Filter by status if specified
    if (status === 'all') {
      return validInjuries;
    }

    return validInjuries.filter(i => i.status === status);
  } catch (error) {
    console.error('Error getting user injuries:', error);
    return [];
  }
}

/**
 * Get active injuries (active or recovering)
 */
export async function getActiveInjuries(userId: string): Promise<Injury[]> {
  const injuries = await getUserInjuries(userId, { status: 'all' });
  return injuries.filter(i => i.status === 'active' || i.status === 'recovering');
}

/**
 * Save a new injury
 */
export async function saveInjury(userId: string, input: InjuryInput): Promise<Injury> {
  const now = new Date().toISOString();
  const id = `injury_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const injury: Injury = {
    id,
    userId,
    bodyRegion: input.bodyRegion,
    description: input.description,
    severity: input.severity,
    status: input.status || 'active',
    constraints: input.constraints || [],
    clinicalNotes: input.clinicalNotes,
    startDate: input.startDate || now.split('T')[0],
    createdAt: now,
    updatedAt: now,
  };

  if (!(await isKvAvailable())) {
    return injury;
  }

  try {
    const injuryKey = `injury:${userId}:${id}`;
    const injuryIdsKey = `injuries:${userId}`;

    // Add to the list of injury IDs
    await kv.lpush(injuryIdsKey, id);

    // Save the injury
    await kv.set(injuryKey, injury);

    // Update stats
    await updateInjuryCount(userId);

    return injury;
  } catch (error) {
    console.error('Error saving injury:', error);
    return injury;
  }
}

/**
 * Update an existing injury
 */
export async function updateInjury(
  userId: string,
  injuryId: string,
  update: InjuryUpdate
): Promise<Injury | null> {
  if (!(await isKvAvailable())) {
    const injury = mockInjuries.find(i => i.id === injuryId);
    if (!injury) return null;
    return { ...injury, ...update, userId, updatedAt: new Date().toISOString() };
  }

  try {
    const injuryKey = `injury:${userId}:${injuryId}`;
    const existing = await kv.get<Injury>(injuryKey);

    if (!existing) {
      return null;
    }

    const updated: Injury = {
      ...existing,
      ...update,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(injuryKey, updated);

    // Update stats if status changed
    if (update.status) {
      await updateInjuryCount(userId);
    }

    return updated;
  } catch (error) {
    console.error('Error updating injury:', error);
    return null;
  }
}

/**
 * Delete an injury
 */
export async function deleteInjury(userId: string, injuryId: string): Promise<boolean> {
  if (!(await isKvAvailable())) {
    return true;
  }

  try {
    const injuryKey = `injury:${userId}:${injuryId}`;
    const injuryIdsKey = `injuries:${userId}`;

    // Remove from list
    await kv.lrem(injuryIdsKey, 0, injuryId);

    // Delete the injury
    await kv.del(injuryKey);

    // Update stats
    await updateInjuryCount(userId);

    return true;
  } catch (error) {
    console.error('Error deleting injury:', error);
    return false;
  }
}

// ============================================================================
// Stats Functions
// ============================================================================

/**
 * Get user's profile stats
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  if (!(await isKvAvailable())) {
    return { ...mockStats, userId };
  }

  try {
    const statsKey = `stats:${userId}`;
    const stats = await kv.get<UserStats>(statsKey);

    if (stats) {
      return stats;
    }

    // Return default stats if none exist
    return createDefaultStats(userId);
  } catch (error) {
    console.error('Error getting user stats:', error);
    return createDefaultStats(userId);
  }
}

/**
 * Initialize or reset user stats
 */
export async function initializeUserStats(userId: string): Promise<UserStats> {
  const stats = createDefaultStats(userId);

  if (!(await isKvAvailable())) {
    return stats;
  }

  try {
    await kv.set(`stats:${userId}`, stats);
    return stats;
  } catch (error) {
    console.error('Error initializing user stats:', error);
    return stats;
  }
}

function createDefaultStats(userId: string): UserStats {
  return {
    userId,
    totalWorkouts: 0,
    totalExercises: 0,
    totalVolume: 0,
    averageWorkoutDuration: 0,
    averageReadiness: 0,
    streak: {
      current: 0,
      longest: 0,
    },
    volumeStats: {
      weekly: 0,
      monthly: 0,
      allTime: 0,
    },
    favoriteExercises: [],
    bodyRegionFocus: {},
    activeInjuries: 0,
    updatedAt: new Date().toISOString(),
  };
}

async function updateStatsAfterWorkout(userId: string, workout: Workout): Promise<void> {
  if (!(await isKvAvailable())) {
    return;
  }

  try {
    const stats = await getUserStats(userId);

    // Calculate workout volume
    let workoutVolume = 0;
    const exerciseCounts: Record<string, { name: string; count: number }> = {};

    for (const exercise of workout.exercises) {
      for (const set of exercise.completedSets) {
        if (set.completed && set.weight) {
          workoutVolume += set.weight * set.reps;
        }
      }

      if (!exerciseCounts[exercise.exerciseId]) {
        exerciseCounts[exercise.exerciseId] = { name: exercise.name, count: 0 };
      }
      exerciseCounts[exercise.exerciseId].count++;
    }

    // Update stats
    const totalWorkouts = stats.totalWorkouts + 1;
    const totalExercises = stats.totalExercises + workout.exercises.length;
    const totalVolume = stats.totalVolume + workoutVolume;

    // Update average duration
    const totalDuration = stats.averageWorkoutDuration * stats.totalWorkouts + (workout.actualDuration || 0);
    const averageWorkoutDuration = Math.round(totalDuration / totalWorkouts);

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const lastWorkoutDate = stats.streak.lastWorkoutDate;
    let currentStreak = stats.streak.current;

    if (lastWorkoutDate) {
      const lastDate = new Date(lastWorkoutDate);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / 86400000);

      if (daysDiff <= 1) {
        currentStreak = daysDiff === 0 ? currentStreak : currentStreak + 1;
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }

    const longestStreak = Math.max(stats.streak.longest, currentStreak);

    // Update favorite exercises
    const existingFavorites = new Map(
      stats.favoriteExercises.map(f => [f.exerciseId, f])
    );

    for (const [exerciseId, data] of Object.entries(exerciseCounts)) {
      const existing = existingFavorites.get(exerciseId);
      if (existing) {
        existing.count += data.count;
      } else {
        existingFavorites.set(exerciseId, { exerciseId, ...data });
      }
    }

    const favoriteExercises = Array.from(existingFavorites.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const updatedStats: UserStats = {
      ...stats,
      totalWorkouts,
      totalExercises,
      totalVolume,
      averageWorkoutDuration,
      streak: {
        current: currentStreak,
        longest: longestStreak,
        lastWorkoutDate: today,
      },
      volumeStats: {
        ...stats.volumeStats,
        weekly: stats.volumeStats.weekly + workoutVolume,
        monthly: stats.volumeStats.monthly + workoutVolume,
        allTime: totalVolume,
      },
      favoriteExercises,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`stats:${userId}`, updatedStats);
  } catch (error) {
    console.error('Error updating stats after workout:', error);
  }
}

async function updateInjuryCount(userId: string): Promise<void> {
  if (!(await isKvAvailable())) {
    return;
  }

  try {
    const stats = await getUserStats(userId);
    const injuries = await getActiveInjuries(userId);

    const updatedStats: UserStats = {
      ...stats,
      activeInjuries: injuries.length,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`stats:${userId}`, updatedStats);
  } catch (error) {
    console.error('Error updating injury count:', error);
  }
}

// ============================================================================
// Health Snapshot Functions
// ============================================================================

/**
 * Save health snapshot data
 */
export async function saveHealthSnapshot(userId: string, snapshot: Omit<HealthSnapshot, 'userId' | 'createdAt'>): Promise<HealthSnapshot> {
  const fullSnapshot: HealthSnapshot = {
    ...snapshot,
    userId,
    createdAt: new Date().toISOString(),
  };

  if (!(await isKvAvailable())) {
    return fullSnapshot;
  }

  try {
    const key = `health:${userId}:${snapshot.date}`;
    await kv.set(key, fullSnapshot);
    return fullSnapshot;
  } catch (error) {
    console.error('Error saving health snapshot:', error);
    return fullSnapshot;
  }
}

/**
 * Get health snapshot for a specific date
 */
export async function getHealthSnapshot(userId: string, date: string): Promise<HealthSnapshot | null> {
  if (!(await isKvAvailable())) {
    return null;
  }

  try {
    const key = `health:${userId}:${date}`;
    return await kv.get<HealthSnapshot>(key);
  } catch (error) {
    console.error('Error getting health snapshot:', error);
    return null;
  }
}

// ============================================================================
// Utility Exports
// ============================================================================

export const store = {
  // Readiness
  getUserReadiness,
  saveUserReadiness,

  // Workouts
  getUserWorkouts,
  getWorkout,
  saveWorkout,
  saveWorkoutSession,

  // Injuries
  getUserInjuries,
  getActiveInjuries,
  saveInjury,
  updateInjury,
  deleteInjury,

  // Stats
  getUserStats,
  initializeUserStats,

  // Health
  saveHealthSnapshot,
  getHealthSnapshot,

  // Utils
  isKvAvailable,
};

export default store;
