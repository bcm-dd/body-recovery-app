/**
 * Workout Store - Movement & Recovery Companion
 *
 * Manages active workout state, exercise logging, and session data.
 * Designed for offline-first operation with sync queue.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  WorkoutSession,
  WorkoutStatus,
  ExerciseLog,
  SetLog,
  ExerciseDifficulty,
  SkipReason,
} from '@/types';

// ============================================================================
// Types
// ============================================================================

interface WorkoutState {
  // Active workout
  activeWorkout: WorkoutSession | null;
  currentExerciseIndex: number;
  currentSetIndex: number;

  // Timer
  restTimerSeconds: number;
  restTimerRunning: boolean;
  restTimerTarget: number;

  // History (recent, for offline access)
  recentWorkouts: WorkoutSession[];

  // Status
  isLoading: boolean;
}

interface WorkoutActions {
  // Workout lifecycle
  startWorkout: (workout: Omit<WorkoutSession, 'status'>) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  completeWorkout: () => void;
  abandonWorkout: () => void;

  // Exercise navigation
  nextExercise: () => void;
  previousExercise: () => void;
  goToExercise: (index: number) => void;
  skipExercise: (reason: SkipReason) => void;
  swapExercise: (exerciseLogId: string, newExerciseId: string) => void;

  // Set logging
  startSet: () => void;
  completeSet: (data: { weight?: number; reps: number; rpe?: number }) => void;
  updateSet: (setIndex: number, data: Partial<SetLog>) => void;
  deleteSet: (setIndex: number) => void;

  // Exercise feedback
  setExerciseDifficulty: (difficulty: ExerciseDifficulty) => void;
  addExerciseNote: (note: string) => void;

  // Timer
  setRestTimer: (seconds: number) => void;
  startRestTimer: () => void;
  pauseRestTimer: () => void;
  resetRestTimer: () => void;
  tickRestTimer: () => void;

  // Prescription adjustments
  adjustWeight: (delta: number) => void;
  adjustReps: (delta: number) => void;
  adjustSets: (delta: number) => void;

  // Queries
  getCurrentExercise: () => ExerciseLog | null;
  getWorkoutProgress: () => { completed: number; total: number; percentage: number };
  getExerciseProgress: () => { completed: number; total: number };

  // Utility
  setLoading: (loading: boolean) => void;
  addToHistory: (workout: WorkoutSession) => void;
  clearHistory: () => void;
  reset: () => void;
}

type WorkoutStore = WorkoutState & WorkoutActions;

// ============================================================================
// Helpers
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: WorkoutState = {
  activeWorkout: null,
  currentExerciseIndex: 0,
  currentSetIndex: 0,
  restTimerSeconds: 0,
  restTimerRunning: false,
  restTimerTarget: 90, // default rest time
  recentWorkouts: [],
  isLoading: false,
};

// ============================================================================
// Store
// ============================================================================

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // ========================================
      // Workout Lifecycle
      // ========================================

      startWorkout: (workoutData) => {
        set((state) => {
          state.activeWorkout = {
            ...workoutData,
            status: 'in_progress',
          };
          state.currentExerciseIndex = 0;
          state.currentSetIndex = 0;
          state.restTimerSeconds = 0;
          state.restTimerRunning = false;
        });
      },

      pauseWorkout: () => {
        set((state) => {
          if (state.activeWorkout) {
            state.activeWorkout.status = 'in_progress'; // still in progress, just paused
            state.restTimerRunning = false;
          }
        });
      },

      resumeWorkout: () => {
        set((state) => {
          if (state.activeWorkout) {
            state.activeWorkout.status = 'in_progress';
          }
        });
      },

      completeWorkout: () => {
        const state = get();
        if (!state.activeWorkout) return;

        const completedWorkout: WorkoutSession = {
          ...state.activeWorkout,
          status: 'completed',
          actualDuration: Math.round(
            (Date.now() - new Date(state.activeWorkout.createdAt).getTime()) / 60000
          ),
          updatedAt: new Date(),
        };

        set((s) => {
          s.recentWorkouts.unshift(completedWorkout);
          // Keep only last 20 workouts in local storage
          if (s.recentWorkouts.length > 20) {
            s.recentWorkouts = s.recentWorkouts.slice(0, 20);
          }
          s.activeWorkout = null;
          s.currentExerciseIndex = 0;
          s.currentSetIndex = 0;
          s.restTimerSeconds = 0;
          s.restTimerRunning = false;
        });
      },

      abandonWorkout: () => {
        const state = get();
        if (!state.activeWorkout) return;

        // Save as partial if any exercises were completed
        const hasCompletedExercises = state.activeWorkout.exercises.some(
          (e) => e.completedSets.length > 0
        );

        if (hasCompletedExercises) {
          const partialWorkout: WorkoutSession = {
            ...state.activeWorkout,
            status: 'partial',
            updatedAt: new Date(),
          };

          set((s) => {
            s.recentWorkouts.unshift(partialWorkout);
            s.activeWorkout = null;
            s.currentExerciseIndex = 0;
            s.currentSetIndex = 0;
          });
        } else {
          set((s) => {
            s.activeWorkout = null;
            s.currentExerciseIndex = 0;
            s.currentSetIndex = 0;
          });
        }
      },

      // ========================================
      // Exercise Navigation
      // ========================================

      nextExercise: () => {
        set((state) => {
          if (!state.activeWorkout) return;
          const nextIndex = state.currentExerciseIndex + 1;
          if (nextIndex < state.activeWorkout.exercises.length) {
            state.currentExerciseIndex = nextIndex;
            state.currentSetIndex = 0;
          }
        });
      },

      previousExercise: () => {
        set((state) => {
          if (state.currentExerciseIndex > 0) {
            state.currentExerciseIndex -= 1;
            state.currentSetIndex = 0;
          }
        });
      },

      goToExercise: (index) => {
        set((state) => {
          if (!state.activeWorkout) return;
          if (index >= 0 && index < state.activeWorkout.exercises.length) {
            state.currentExerciseIndex = index;
            state.currentSetIndex = 0;
          }
        });
      },

      skipExercise: (reason) => {
        set((state) => {
          if (!state.activeWorkout) return;
          const exercise = state.activeWorkout.exercises[state.currentExerciseIndex];
          if (exercise) {
            exercise.skipped = true;
            exercise.skipReason = reason;
          }
          // Move to next exercise
          const nextIndex = state.currentExerciseIndex + 1;
          if (nextIndex < state.activeWorkout.exercises.length) {
            state.currentExerciseIndex = nextIndex;
            state.currentSetIndex = 0;
          }
        });
      },

      swapExercise: (exerciseLogId, newExerciseId) => {
        set((state) => {
          if (!state.activeWorkout) return;
          const index = state.activeWorkout.exercises.findIndex(
            (e) => e.id === exerciseLogId
          );
          if (index !== -1) {
            const exercise = state.activeWorkout.exercises[index];
            exercise.substitutedFrom = exercise.exerciseId;
            exercise.exerciseId = newExerciseId;
            // Reset completed sets for the new exercise
            exercise.completedSets = [];
          }
        });
      },

      // ========================================
      // Set Logging
      // ========================================

      startSet: () => {
        // Placeholder for any set start logic (e.g., starting a timer)
      },

      completeSet: (data) => {
        set((state) => {
          if (!state.activeWorkout) return;
          const exercise = state.activeWorkout.exercises[state.currentExerciseIndex];
          if (!exercise) return;

          const setLog: SetLog = {
            setNumber: exercise.completedSets.length + 1,
            weight: data.weight,
            reps: data.reps,
            rpe: data.rpe,
            completedAt: new Date(),
          };

          exercise.completedSets.push(setLog);
          state.currentSetIndex = exercise.completedSets.length;

          // Start rest timer if not on last set
          if (exercise.completedSets.length < exercise.prescribedSets) {
            state.restTimerSeconds = state.restTimerTarget;
            state.restTimerRunning = true;
          }
        });
      },

      updateSet: (setIndex, data) => {
        set((state) => {
          if (!state.activeWorkout) return;
          const exercise = state.activeWorkout.exercises[state.currentExerciseIndex];
          if (exercise && exercise.completedSets[setIndex]) {
            exercise.completedSets[setIndex] = {
              ...exercise.completedSets[setIndex],
              ...data,
            };
          }
        });
      },

      deleteSet: (setIndex) => {
        set((state) => {
          if (!state.activeWorkout) return;
          const exercise = state.activeWorkout.exercises[state.currentExerciseIndex];
          if (exercise) {
            exercise.completedSets.splice(setIndex, 1);
            // Renumber remaining sets
            exercise.completedSets.forEach((s, i) => {
              s.setNumber = i + 1;
            });
            state.currentSetIndex = Math.max(0, exercise.completedSets.length - 1);
          }
        });
      },

      // ========================================
      // Exercise Feedback
      // ========================================

      setExerciseDifficulty: (difficulty) => {
        set((state) => {
          if (!state.activeWorkout) return;
          const exercise = state.activeWorkout.exercises[state.currentExerciseIndex];
          if (exercise) {
            exercise.difficulty = difficulty;
          }
        });
      },

      addExerciseNote: (note) => {
        set((state) => {
          if (!state.activeWorkout) return;
          const exercise = state.activeWorkout.exercises[state.currentExerciseIndex];
          if (exercise) {
            exercise.notes = exercise.notes ? `${exercise.notes}\n${note}` : note;
          }
        });
      },

      // ========================================
      // Rest Timer
      // ========================================

      setRestTimer: (seconds) => {
        set({ restTimerTarget: seconds });
      },

      startRestTimer: () => {
        set((state) => {
          state.restTimerSeconds = state.restTimerTarget;
          state.restTimerRunning = true;
        });
      },

      pauseRestTimer: () => {
        set({ restTimerRunning: false });
      },

      resetRestTimer: () => {
        set((state) => {
          state.restTimerSeconds = state.restTimerTarget;
          state.restTimerRunning = false;
        });
      },

      tickRestTimer: () => {
        set((state) => {
          if (state.restTimerRunning && state.restTimerSeconds > 0) {
            state.restTimerSeconds -= 1;
          }
          if (state.restTimerSeconds === 0) {
            state.restTimerRunning = false;
          }
        });
      },

      // ========================================
      // Prescription Adjustments
      // ========================================

      adjustWeight: (delta) => {
        set((state) => {
          if (!state.activeWorkout) return;
          const exercise = state.activeWorkout.exercises[state.currentExerciseIndex];
          if (exercise && exercise.prescribedWeight !== undefined) {
            exercise.prescribedWeight = Math.max(0, exercise.prescribedWeight + delta);
          }
        });
      },

      adjustReps: (delta) => {
        set((state) => {
          if (!state.activeWorkout) return;
          const exercise = state.activeWorkout.exercises[state.currentExerciseIndex];
          if (exercise) {
            exercise.prescribedReps = Math.max(1, exercise.prescribedReps + delta);
          }
        });
      },

      adjustSets: (delta) => {
        set((state) => {
          if (!state.activeWorkout) return;
          const exercise = state.activeWorkout.exercises[state.currentExerciseIndex];
          if (exercise) {
            exercise.prescribedSets = Math.max(1, exercise.prescribedSets + delta);
          }
        });
      },

      // ========================================
      // Queries
      // ========================================

      getCurrentExercise: () => {
        const state = get();
        if (!state.activeWorkout) return null;
        return state.activeWorkout.exercises[state.currentExerciseIndex] || null;
      },

      getWorkoutProgress: () => {
        const state = get();
        if (!state.activeWorkout) {
          return { completed: 0, total: 0, percentage: 0 };
        }

        const total = state.activeWorkout.exercises.length;
        const completed = state.activeWorkout.exercises.filter(
          (e) => e.completedSets.length >= e.prescribedSets || e.skipped
        ).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percentage };
      },

      getExerciseProgress: () => {
        const state = get();
        const exercise = state.activeWorkout?.exercises[state.currentExerciseIndex];
        if (!exercise) {
          return { completed: 0, total: 0 };
        }

        return {
          completed: exercise.completedSets.length,
          total: exercise.prescribedSets,
        };
      },

      // ========================================
      // Utility
      // ========================================

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      addToHistory: (workout) => {
        set((state) => {
          state.recentWorkouts.unshift(workout);
          if (state.recentWorkouts.length > 20) {
            state.recentWorkouts = state.recentWorkouts.slice(0, 20);
          }
        });
      },

      clearHistory: () => {
        set({ recentWorkouts: [] });
      },

      reset: () => {
        set(initialState);
      },
    })),
    {
      name: 'workout-storage',
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

export const selectActiveWorkout = (state: WorkoutStore) => state.activeWorkout;

export const selectIsWorkoutActive = (state: WorkoutStore) =>
  state.activeWorkout !== null;

export const selectCurrentExercise = (state: WorkoutStore) =>
  state.activeWorkout?.exercises[state.currentExerciseIndex] || null;

export const selectRestTimer = (state: WorkoutStore) => ({
  seconds: state.restTimerSeconds,
  running: state.restTimerRunning,
  target: state.restTimerTarget,
});
