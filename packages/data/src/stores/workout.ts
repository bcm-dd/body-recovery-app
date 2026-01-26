/**
 * Workout Store
 *
 * Manages active workout state, completed sets, and workout history.
 * Uses Zustand for state management with optional persistence.
 */

import { create } from 'zustand';

// ============================================
// TYPES
// ============================================

/**
 * A single set within an exercise
 */
export interface WorkoutSet {
  id: string;
  reps?: number;
  weight?: number;
  duration?: number; // seconds
  completed: boolean;
  completedAt?: Date;
  difficulty?: 'easy' | 'moderate' | 'hard';
  notes?: string;
}

/**
 * An exercise within a workout with its sets
 */
export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  sets: WorkoutSet[];
  targetSets: number;
  targetReps?: number;
  targetWeight?: number;
  targetDuration?: number;
  restBetweenSets: number; // seconds
  completed: boolean;
  skipped: boolean;
  substitutedFrom?: string; // Original exercise ID if substituted
}

/**
 * Active workout session
 */
export interface ActiveWorkout {
  id: string;
  planId: string;
  planType: 'full' | 'moderate' | 'light' | 'rest';
  startedAt: Date;
  exercises: WorkoutExercise[];
  currentExerciseIndex: number;
  currentSetIndex: number;
  isResting: boolean;
  restEndTime?: Date;
  isPaused: boolean;
  pausedAt?: Date;
  totalPausedTime: number; // milliseconds
}

/**
 * Completed workout summary
 */
export interface CompletedWorkout {
  id: string;
  planId: string;
  planType: 'full' | 'moderate' | 'light' | 'rest';
  startedAt: Date;
  completedAt: Date;
  duration: number; // minutes
  exercisesCompleted: number;
  exercisesSkipped: number;
  setsCompleted: number;
  totalSets: number;
  notes?: string;
}

// ============================================
// STORE STATE
// ============================================

interface WorkoutState {
  // Current workout
  activeWorkout: ActiveWorkout | null;
  isWorkoutActive: boolean;

  // Completed workouts (recent history)
  completedWorkouts: CompletedWorkout[];

  // Actions
  startWorkout: (
    planId: string,
    planType: ActiveWorkout['planType'],
    exercises: Omit<WorkoutExercise, 'id' | 'completed' | 'skipped' | 'sets'>[]
  ) => void;
  endWorkout: (notes?: string) => CompletedWorkout | null;
  cancelWorkout: () => void;

  // Exercise actions
  completeSet: (
    exerciseIndex: number,
    setIndex: number,
    data?: Partial<WorkoutSet>
  ) => void;
  skipExercise: (exerciseIndex: number) => void;
  substituteExercise: (
    exerciseIndex: number,
    newExercise: Omit<WorkoutExercise, 'id' | 'completed' | 'skipped' | 'sets'>
  ) => void;

  // Navigation
  goToExercise: (index: number) => void;
  goToNextExercise: () => void;
  goToPreviousExercise: () => void;

  // Rest timer
  startRest: (durationSeconds: number) => void;
  endRest: () => void;

  // Pause/Resume
  pauseWorkout: () => void;
  resumeWorkout: () => void;

  // History
  clearHistory: () => void;
}

// ============================================
// HELPERS
// ============================================

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function createSets(targetSets: number): WorkoutSet[] {
  return Array.from({ length: targetSets }, () => ({
    id: generateId('set'),
    completed: false,
  }));
}

function calculateWorkoutDuration(workout: ActiveWorkout): number {
  const now = Date.now();
  const startTime = workout.startedAt.getTime();
  const elapsed = now - startTime - workout.totalPausedTime;
  return Math.round(elapsed / 60000); // Convert to minutes
}

// ============================================
// STORE
// ============================================

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  activeWorkout: null,
  isWorkoutActive: false,
  completedWorkouts: [],

  startWorkout: (planId, planType, exercises) => {
    const workoutExercises: WorkoutExercise[] = exercises.map((ex) => ({
      ...ex,
      id: generateId('ex'),
      sets: createSets(ex.targetSets),
      completed: false,
      skipped: false,
    }));

    const activeWorkout: ActiveWorkout = {
      id: generateId('workout'),
      planId,
      planType,
      startedAt: new Date(),
      exercises: workoutExercises,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      isResting: false,
      isPaused: false,
      totalPausedTime: 0,
    };

    set({ activeWorkout, isWorkoutActive: true });
  },

  endWorkout: (notes) => {
    const { activeWorkout, completedWorkouts } = get();

    if (!activeWorkout) {
      return null;
    }

    const exercisesCompleted = activeWorkout.exercises.filter(
      (ex) => ex.completed
    ).length;
    const exercisesSkipped = activeWorkout.exercises.filter(
      (ex) => ex.skipped
    ).length;
    const setsCompleted = activeWorkout.exercises.reduce(
      (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
      0
    );
    const totalSets = activeWorkout.exercises.reduce(
      (sum, ex) => sum + ex.sets.length,
      0
    );

    const completedWorkout: CompletedWorkout = {
      id: activeWorkout.id,
      planId: activeWorkout.planId,
      planType: activeWorkout.planType,
      startedAt: activeWorkout.startedAt,
      completedAt: new Date(),
      duration: calculateWorkoutDuration(activeWorkout),
      exercisesCompleted,
      exercisesSkipped,
      setsCompleted,
      totalSets,
      notes,
    };

    set({
      activeWorkout: null,
      isWorkoutActive: false,
      completedWorkouts: [completedWorkout, ...completedWorkouts].slice(0, 50), // Keep last 50
    });

    return completedWorkout;
  },

  cancelWorkout: () => {
    set({ activeWorkout: null, isWorkoutActive: false });
  },

  completeSet: (exerciseIndex, setIndex, data) => {
    const { activeWorkout } = get();

    if (!activeWorkout) return;

    const exercises = [...activeWorkout.exercises];
    const exercise = { ...exercises[exerciseIndex] };
    const sets = [...exercise.sets];

    sets[setIndex] = {
      ...sets[setIndex],
      ...data,
      completed: true,
      completedAt: new Date(),
    };

    exercise.sets = sets;

    // Check if all sets are completed
    const allSetsCompleted = sets.every((s) => s.completed);
    if (allSetsCompleted) {
      exercise.completed = true;
    }

    exercises[exerciseIndex] = exercise;

    set({
      activeWorkout: {
        ...activeWorkout,
        exercises,
        currentSetIndex: setIndex + 1,
      },
    });
  },

  skipExercise: (exerciseIndex) => {
    const { activeWorkout } = get();

    if (!activeWorkout) return;

    const exercises = [...activeWorkout.exercises];
    exercises[exerciseIndex] = {
      ...exercises[exerciseIndex],
      skipped: true,
    };

    // Move to next exercise
    const nextIndex = Math.min(exerciseIndex + 1, exercises.length - 1);

    set({
      activeWorkout: {
        ...activeWorkout,
        exercises,
        currentExerciseIndex: nextIndex,
        currentSetIndex: 0,
      },
    });
  },

  substituteExercise: (exerciseIndex, newExercise) => {
    const { activeWorkout } = get();

    if (!activeWorkout) return;

    const exercises = [...activeWorkout.exercises];
    const originalExercise = exercises[exerciseIndex];

    exercises[exerciseIndex] = {
      ...newExercise,
      id: generateId('ex'),
      sets: createSets(newExercise.targetSets),
      completed: false,
      skipped: false,
      substitutedFrom: originalExercise.exerciseId,
    };

    set({
      activeWorkout: {
        ...activeWorkout,
        exercises,
        currentSetIndex: 0,
      },
    });
  },

  goToExercise: (index) => {
    const { activeWorkout } = get();

    if (!activeWorkout) return;

    const clampedIndex = Math.max(
      0,
      Math.min(index, activeWorkout.exercises.length - 1)
    );

    set({
      activeWorkout: {
        ...activeWorkout,
        currentExerciseIndex: clampedIndex,
        currentSetIndex: 0,
        isResting: false,
      },
    });
  },

  goToNextExercise: () => {
    const { activeWorkout } = get();

    if (!activeWorkout) return;

    const nextIndex = Math.min(
      activeWorkout.currentExerciseIndex + 1,
      activeWorkout.exercises.length - 1
    );

    set({
      activeWorkout: {
        ...activeWorkout,
        currentExerciseIndex: nextIndex,
        currentSetIndex: 0,
        isResting: false,
      },
    });
  },

  goToPreviousExercise: () => {
    const { activeWorkout } = get();

    if (!activeWorkout) return;

    const prevIndex = Math.max(activeWorkout.currentExerciseIndex - 1, 0);

    set({
      activeWorkout: {
        ...activeWorkout,
        currentExerciseIndex: prevIndex,
        currentSetIndex: 0,
        isResting: false,
      },
    });
  },

  startRest: (durationSeconds) => {
    const { activeWorkout } = get();

    if (!activeWorkout) return;

    set({
      activeWorkout: {
        ...activeWorkout,
        isResting: true,
        restEndTime: new Date(Date.now() + durationSeconds * 1000),
      },
    });
  },

  endRest: () => {
    const { activeWorkout } = get();

    if (!activeWorkout) return;

    set({
      activeWorkout: {
        ...activeWorkout,
        isResting: false,
        restEndTime: undefined,
      },
    });
  },

  pauseWorkout: () => {
    const { activeWorkout } = get();

    if (!activeWorkout || activeWorkout.isPaused) return;

    set({
      activeWorkout: {
        ...activeWorkout,
        isPaused: true,
        pausedAt: new Date(),
      },
    });
  },

  resumeWorkout: () => {
    const { activeWorkout } = get();

    if (!activeWorkout || !activeWorkout.isPaused || !activeWorkout.pausedAt)
      return;

    const pausedDuration = Date.now() - activeWorkout.pausedAt.getTime();

    set({
      activeWorkout: {
        ...activeWorkout,
        isPaused: false,
        pausedAt: undefined,
        totalPausedTime: activeWorkout.totalPausedTime + pausedDuration,
      },
    });
  },

  clearHistory: () => {
    set({ completedWorkouts: [] });
  },
}));

// ============================================
// SELECTORS
// ============================================

/**
 * Get the current exercise being performed
 */
export const selectCurrentExercise = (state: WorkoutState) => {
  if (!state.activeWorkout) return null;
  return state.activeWorkout.exercises[state.activeWorkout.currentExerciseIndex];
};

/**
 * Get workout progress percentage
 */
export const selectWorkoutProgress = (state: WorkoutState) => {
  if (!state.activeWorkout) return 0;

  const totalSets = state.activeWorkout.exercises.reduce(
    (sum, ex) => sum + ex.sets.length,
    0
  );
  const completedSets = state.activeWorkout.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );

  return totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
};

/**
 * Check if workout is complete
 */
export const selectIsWorkoutComplete = (state: WorkoutState) => {
  if (!state.activeWorkout) return false;

  return state.activeWorkout.exercises.every(
    (ex) => ex.completed || ex.skipped
  );
};
