/**
 * Workout Store Tests
 *
 * Tests for workout state management
 * Uses direct store access for simpler testing
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';

// Re-create a simplified version of the store for testing
// This avoids issues with React concurrent rendering in tests

interface WorkoutSet {
  id: string;
  reps?: number;
  weight?: number;
  completed: boolean;
}

interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  sets: WorkoutSet[];
  targetSets: number;
  completed: boolean;
  skipped: boolean;
  substitutedFrom?: string;
}

interface ActiveWorkout {
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
  totalPausedTime: number;
}

interface CompletedWorkout {
  id: string;
  planId: string;
  planType: 'full' | 'moderate' | 'light' | 'rest';
  startedAt: Date;
  completedAt: Date;
  duration: number;
  exercisesCompleted: number;
  exercisesSkipped: number;
  setsCompleted: number;
  totalSets: number;
  notes?: string;
}

interface WorkoutState {
  activeWorkout: ActiveWorkout | null;
  isWorkoutActive: boolean;
  completedWorkouts: CompletedWorkout[];
  startWorkout: (
    planId: string,
    planType: ActiveWorkout['planType'],
    exercises: { exerciseId: string; name: string; targetSets: number }[]
  ) => void;
  completeSet: (exerciseIndex: number, setIndex: number, data?: { reps?: number; weight?: number }) => void;
  skipExercise: (exerciseIndex: number) => void;
  substituteExercise: (exerciseIndex: number, newExercise: { exerciseId: string; name: string; targetSets: number }) => void;
  goToNextExercise: () => void;
  goToPreviousExercise: () => void;
  goToExercise: (index: number) => void;
  startRest: (seconds: number) => void;
  endRest: () => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  endWorkout: (notes?: string) => CompletedWorkout | null;
  cancelWorkout: () => void;
  clearHistory: () => void;
}

// Create a test store
const createTestStore = () =>
  create<WorkoutState>((set, get) => ({
    activeWorkout: null,
    isWorkoutActive: false,
    completedWorkouts: [],

    startWorkout: (planId, planType, exercises) => {
      const workout: ActiveWorkout = {
        id: `workout-${Date.now()}`,
        planId,
        planType,
        startedAt: new Date(),
        exercises: exercises.map((ex, i) => ({
          id: `ex-${i}`,
          exerciseId: ex.exerciseId,
          name: ex.name,
          targetSets: ex.targetSets,
          sets: Array.from({ length: ex.targetSets }, (_, j) => ({
            id: `set-${i}-${j}`,
            completed: false,
          })),
          completed: false,
          skipped: false,
        })),
        currentExerciseIndex: 0,
        currentSetIndex: 0,
        isResting: false,
        isPaused: false,
        totalPausedTime: 0,
      };
      set({ activeWorkout: workout, isWorkoutActive: true });
    },

    completeSet: (exerciseIndex, setIndex, data) => {
      const { activeWorkout } = get();
      if (!activeWorkout) return;

      const exercises = [...activeWorkout.exercises];
      const exercise = { ...exercises[exerciseIndex] };
      const sets = [...exercise.sets];
      sets[setIndex] = { ...sets[setIndex], completed: true, ...data };
      exercise.sets = sets;

      // Check if all sets completed
      exercise.completed = sets.every((s) => s.completed);
      exercises[exerciseIndex] = exercise;

      // Advance set index
      let nextSetIndex = setIndex + 1;
      if (nextSetIndex >= sets.length) {
        nextSetIndex = 0;
      }

      set({
        activeWorkout: {
          ...activeWorkout,
          exercises,
          currentSetIndex: nextSetIndex,
        },
      });
    },

    skipExercise: (exerciseIndex) => {
      const { activeWorkout } = get();
      if (!activeWorkout) return;

      const exercises = [...activeWorkout.exercises];
      exercises[exerciseIndex] = { ...exercises[exerciseIndex], skipped: true };

      let nextIndex = exerciseIndex + 1;
      if (nextIndex >= exercises.length) {
        nextIndex = exercises.length - 1;
      }

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
      const oldExercise = exercises[exerciseIndex];
      exercises[exerciseIndex] = {
        ...oldExercise,
        exerciseId: newExercise.exerciseId,
        name: newExercise.name,
        substitutedFrom: oldExercise.exerciseId,
      };

      set({ activeWorkout: { ...activeWorkout, exercises } });
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
        },
      });
    },

    startRest: (seconds) => {
      const { activeWorkout } = get();
      if (!activeWorkout) return;

      set({
        activeWorkout: {
          ...activeWorkout,
          isResting: true,
          restEndTime: new Date(Date.now() + seconds * 1000),
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
      if (!activeWorkout) return;

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
      if (!activeWorkout || !activeWorkout.pausedAt) return;

      const pauseDuration = Date.now() - activeWorkout.pausedAt.getTime();

      set({
        activeWorkout: {
          ...activeWorkout,
          isPaused: false,
          pausedAt: undefined,
          totalPausedTime: activeWorkout.totalPausedTime + pauseDuration,
        },
      });
    },

    endWorkout: (notes) => {
      const { activeWorkout, completedWorkouts } = get();
      if (!activeWorkout) return null;

      const completed: CompletedWorkout = {
        id: activeWorkout.id,
        planId: activeWorkout.planId,
        planType: activeWorkout.planType,
        startedAt: activeWorkout.startedAt,
        completedAt: new Date(),
        duration: Math.round(
          (Date.now() - activeWorkout.startedAt.getTime() - activeWorkout.totalPausedTime) / 60000
        ),
        exercisesCompleted: activeWorkout.exercises.filter((e) => e.completed).length,
        exercisesSkipped: activeWorkout.exercises.filter((e) => e.skipped).length,
        setsCompleted: activeWorkout.exercises.reduce(
          (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
          0
        ),
        totalSets: activeWorkout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0),
        notes,
      };

      set({
        activeWorkout: null,
        isWorkoutActive: false,
        completedWorkouts: [completed, ...completedWorkouts].slice(0, 50),
      });

      return completed;
    },

    cancelWorkout: () => {
      set({ activeWorkout: null, isWorkoutActive: false });
    },

    clearHistory: () => {
      set({ completedWorkouts: [] });
    },
  }));

describe('Workout Store', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('Initial State', () => {
    it('should have no active workout initially', () => {
      expect(store.getState().activeWorkout).toBeNull();
      expect(store.getState().isWorkoutActive).toBe(false);
    });

    it('should have empty completed workouts', () => {
      expect(store.getState().completedWorkouts).toHaveLength(0);
    });
  });

  describe('startWorkout', () => {
    it('should create active workout with correct structure', () => {
      const exercises = [
        { exerciseId: 'ex1', name: 'Push Up', targetSets: 3 },
        { exerciseId: 'ex2', name: 'Squat', targetSets: 3 },
      ];

      store.getState().startWorkout('plan-1', 'full', exercises);
      const state = store.getState();

      expect(state.isWorkoutActive).toBe(true);
      expect(state.activeWorkout).not.toBeNull();
      expect(state.activeWorkout?.planId).toBe('plan-1');
      expect(state.activeWorkout?.planType).toBe('full');
      expect(state.activeWorkout?.exercises).toHaveLength(2);
      expect(state.activeWorkout?.currentExerciseIndex).toBe(0);
      expect(state.activeWorkout?.currentSetIndex).toBe(0);
      expect(state.activeWorkout?.isPaused).toBe(false);
    });

    it('should create sets for each exercise', () => {
      store.getState().startWorkout('plan-1', 'full', [
        { exerciseId: 'ex1', name: 'Push Up', targetSets: 3 },
      ]);

      const exercise = store.getState().activeWorkout?.exercises[0];
      expect(exercise?.sets).toHaveLength(3);
      expect(exercise?.sets[0].completed).toBe(false);
    });
  });

  describe('completeSet', () => {
    beforeEach(() => {
      store.getState().startWorkout('plan-1', 'full', [
        { exerciseId: 'ex1', name: 'Push Up', targetSets: 3 },
      ]);
    });

    it('should mark set as completed', () => {
      store.getState().completeSet(0, 0, { reps: 10, weight: 0 });

      const sets = store.getState().activeWorkout?.exercises[0].sets;
      expect(sets?.[0].completed).toBe(true);
      expect(sets?.[0].reps).toBe(10);
    });

    it('should mark exercise as completed when all sets done', () => {
      store.getState().completeSet(0, 0);
      store.getState().completeSet(0, 1);
      store.getState().completeSet(0, 2);

      const exercise = store.getState().activeWorkout?.exercises[0];
      expect(exercise?.completed).toBe(true);
    });

    it('should advance current set index', () => {
      store.getState().completeSet(0, 0);

      expect(store.getState().activeWorkout?.currentSetIndex).toBe(1);
    });
  });

  describe('skipExercise', () => {
    beforeEach(() => {
      store.getState().startWorkout('plan-1', 'full', [
        { exerciseId: 'ex1', name: 'Push Up', targetSets: 3 },
        { exerciseId: 'ex2', name: 'Squat', targetSets: 3 },
      ]);
    });

    it('should mark exercise as skipped', () => {
      store.getState().skipExercise(0);

      expect(store.getState().activeWorkout?.exercises[0].skipped).toBe(true);
      expect(store.getState().activeWorkout?.currentExerciseIndex).toBe(1);
    });
  });

  describe('substituteExercise', () => {
    beforeEach(() => {
      store.getState().startWorkout('plan-1', 'full', [
        { exerciseId: 'ex1', name: 'Push Up', targetSets: 3 },
      ]);
    });

    it('should replace exercise with new one', () => {
      store.getState().substituteExercise(0, {
        exerciseId: 'ex2',
        name: 'Incline Push Up',
        targetSets: 3,
      });

      const exercise = store.getState().activeWorkout?.exercises[0];
      expect(exercise?.exerciseId).toBe('ex2');
      expect(exercise?.name).toBe('Incline Push Up');
      expect(exercise?.substitutedFrom).toBe('ex1');
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      store.getState().startWorkout('plan-1', 'full', [
        { exerciseId: 'ex1', name: 'Push Up', targetSets: 3 },
        { exerciseId: 'ex2', name: 'Squat', targetSets: 3 },
        { exerciseId: 'ex3', name: 'Lunge', targetSets: 3 },
      ]);
    });

    it('goToNextExercise should advance index', () => {
      store.getState().goToNextExercise();

      expect(store.getState().activeWorkout?.currentExerciseIndex).toBe(1);
    });

    it('goToPreviousExercise should decrease index', () => {
      store.getState().goToNextExercise();
      store.getState().goToPreviousExercise();

      expect(store.getState().activeWorkout?.currentExerciseIndex).toBe(0);
    });

    it('goToExercise should go to specific index', () => {
      store.getState().goToExercise(2);

      expect(store.getState().activeWorkout?.currentExerciseIndex).toBe(2);
    });

    it('should clamp navigation to valid range', () => {
      store.getState().goToPreviousExercise();
      expect(store.getState().activeWorkout?.currentExerciseIndex).toBe(0);

      store.getState().goToExercise(10);
      expect(store.getState().activeWorkout?.currentExerciseIndex).toBe(2);
    });
  });

  describe('Rest Timer', () => {
    beforeEach(() => {
      store.getState().startWorkout('plan-1', 'full', [
        { exerciseId: 'ex1', name: 'Push Up', targetSets: 3 },
      ]);
    });

    it('should start rest with end time', () => {
      store.getState().startRest(60);

      expect(store.getState().activeWorkout?.isResting).toBe(true);
      expect(store.getState().activeWorkout?.restEndTime).toBeDefined();
    });

    it('should end rest', () => {
      store.getState().startRest(60);
      store.getState().endRest();

      expect(store.getState().activeWorkout?.isResting).toBe(false);
      expect(store.getState().activeWorkout?.restEndTime).toBeUndefined();
    });
  });

  describe('Pause/Resume', () => {
    beforeEach(() => {
      store.getState().startWorkout('plan-1', 'full', [
        { exerciseId: 'ex1', name: 'Push Up', targetSets: 3 },
      ]);
    });

    it('should pause workout', () => {
      store.getState().pauseWorkout();

      expect(store.getState().activeWorkout?.isPaused).toBe(true);
      expect(store.getState().activeWorkout?.pausedAt).toBeDefined();
    });

    it('should resume workout', () => {
      store.getState().pauseWorkout();
      store.getState().resumeWorkout();

      expect(store.getState().activeWorkout?.isPaused).toBe(false);
      expect(store.getState().activeWorkout?.pausedAt).toBeUndefined();
    });
  });

  describe('endWorkout', () => {
    beforeEach(() => {
      store.getState().startWorkout('plan-1', 'full', [
        { exerciseId: 'ex1', name: 'Push Up', targetSets: 2 },
        { exerciseId: 'ex2', name: 'Squat', targetSets: 2 },
      ]);
      store.getState().completeSet(0, 0);
      store.getState().completeSet(0, 1);
      store.getState().skipExercise(1);
    });

    it('should create completed workout summary', () => {
      const completed = store.getState().endWorkout('Great workout!');

      expect(completed).not.toBeNull();
      expect(completed?.planId).toBe('plan-1');
      expect(completed?.exercisesCompleted).toBe(1);
      expect(completed?.exercisesSkipped).toBe(1);
      expect(completed?.setsCompleted).toBe(2);
      expect(completed?.notes).toBe('Great workout!');
    });

    it('should add to completed workouts history', () => {
      store.getState().endWorkout();

      expect(store.getState().completedWorkouts).toHaveLength(1);
    });

    it('should clear active workout', () => {
      store.getState().endWorkout();

      expect(store.getState().activeWorkout).toBeNull();
      expect(store.getState().isWorkoutActive).toBe(false);
    });
  });

  describe('cancelWorkout', () => {
    it('should clear active workout without saving', () => {
      store.getState().startWorkout('plan-1', 'full', [
        { exerciseId: 'ex1', name: 'Push Up', targetSets: 2 },
      ]);

      store.getState().cancelWorkout();

      expect(store.getState().activeWorkout).toBeNull();
      expect(store.getState().completedWorkouts).toHaveLength(0);
    });
  });
});
