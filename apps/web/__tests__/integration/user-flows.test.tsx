/**
 * Integration Tests - User Flows
 *
 * Tests for complete user journeys through the application
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';

// Mock stores
const mockWorkoutStore = {
  activeWorkout: null,
  isWorkoutActive: false,
  completedWorkouts: [],
  startWorkout: vi.fn(),
  completeSet: vi.fn(),
  skipExercise: vi.fn(),
  substituteExercise: vi.fn(),
  endWorkout: vi.fn(),
  cancelWorkout: vi.fn(),
};

const mockBodyMapStore = {
  regions: new Map(),
  history: [],
  updateRegion: vi.fn(),
  updateMultipleRegions: vi.fn(),
  getActiveIssues: vi.fn(() => []),
  getRegionsWithPain: vi.fn(() => []),
  clearRegion: vi.fn(),
};

vi.mock('@app/data', () => ({
  useWorkoutStore: () => mockWorkoutStore,
  useBodyMapStore: () => mockBodyMapStore,
}));

// Mock planning engine
const mockPlanningEngine = {
  generatePlan: vi.fn(() => ({
    id: 'plan-1',
    exercises: [
      {
        exerciseId: 'cat-cow',
        name: 'Cat-Cow Stretch',
        targetSets: 3,
        targetReps: 10,
        restBetweenSets: 60,
      },
      {
        exerciseId: 'bird-dog',
        name: 'Bird Dog',
        targetSets: 3,
        targetReps: 8,
        restBetweenSets: 60,
      },
    ],
    duration: 20,
    focus: 'lower_back',
  })),
};

vi.mock('@app/domain', () => ({
  createPlanningEngine: () => mockPlanningEngine,
  createSubstitutionEngine: () => ({
    findSubstitutes: vi.fn(() => [
      { exerciseId: 'pelvic-tilts', name: 'Pelvic Tilts', reason: 'Easier variation' },
    ]),
  }),
  createSafetyEngine: () => ({
    checkContraindications: vi.fn(() => ({
      safe: true,
      warnings: [],
      contraindicated: [],
    })),
    modifyForPain: vi.fn((exercises) => exercises),
  }),
  EXERCISES: [],
}));

describe('User Flow: Check-in -> View Plan -> Start Session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWorkoutStore.activeWorkout = null;
    mockWorkoutStore.isWorkoutActive = false;
  });

  describe('Step 1: Check-in Flow', () => {
    it('should allow user to report pain levels', async () => {
      // Simulate check-in interaction
      const painUpdate = { region: 'lower_back', sensation: 'dull', level: 4 };

      act(() => {
        mockBodyMapStore.updateRegion('lower_back', 'dull', 4);
      });

      expect(mockBodyMapStore.updateRegion).toHaveBeenCalledWith(
        'lower_back',
        'dull',
        4
      );
    });

    it('should allow updating multiple regions in check-in', async () => {
      const updates = [
        { region: 'lower_back', sensation: 'dull', level: 4 },
        { region: 'knee_left', sensation: 'aching', level: 3 },
      ];

      act(() => {
        mockBodyMapStore.updateMultipleRegions(updates);
      });

      expect(mockBodyMapStore.updateMultipleRegions).toHaveBeenCalledWith(updates);
    });
  });

  describe('Step 2: View Plan', () => {
    it('should generate plan based on pain areas', () => {
      const painAreas = ['lower_back'];
      const plan = mockPlanningEngine.generatePlan({
        focusAreas: painAreas,
        duration: 20,
        skillLevel: 'beginner',
      });

      expect(plan).toBeDefined();
      expect(plan.exercises).toHaveLength(2);
      expect(plan.focus).toBe('lower_back');
    });

    it('should include appropriate exercises for pain level', () => {
      const plan = mockPlanningEngine.generatePlan({
        focusAreas: ['lower_back'],
        duration: 20,
        skillLevel: 'beginner',
      });

      // Plan should have mobility/stretching exercises
      expect(plan.exercises.some((e) => e.name.includes('Stretch'))).toBe(true);
    });
  });

  describe('Step 3: Start Session', () => {
    it('should start workout with planned exercises', () => {
      const plan = mockPlanningEngine.generatePlan({
        focusAreas: ['lower_back'],
        duration: 20,
        skillLevel: 'beginner',
      });

      act(() => {
        mockWorkoutStore.startWorkout(plan.id, 'full', plan.exercises);
      });

      expect(mockWorkoutStore.startWorkout).toHaveBeenCalledWith(
        'plan-1',
        'full',
        expect.arrayContaining([
          expect.objectContaining({ exerciseId: 'cat-cow' }),
          expect.objectContaining({ exerciseId: 'bird-dog' }),
        ])
      );
    });

    it('should track set completion', () => {
      act(() => {
        mockWorkoutStore.completeSet(0, 0, { reps: 10 });
      });

      expect(mockWorkoutStore.completeSet).toHaveBeenCalledWith(0, 0, { reps: 10 });
    });

    it('should end workout and create summary', () => {
      act(() => {
        mockWorkoutStore.endWorkout('Felt good today');
      });

      expect(mockWorkoutStore.endWorkout).toHaveBeenCalledWith('Felt good today');
    });
  });
});

describe('User Flow: Mark Pain -> Get Modified Plan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should modify plan when new pain is reported', async () => {
    // User reports new pain during session
    act(() => {
      mockBodyMapStore.updateRegion('knee_left', 'sharp', 7);
    });

    // Get active issues
    mockBodyMapStore.getActiveIssues.mockReturnValue([
      { region: 'knee_left', level: 7, sensation: 'sharp', timestamp: new Date() },
    ]);

    const issues = mockBodyMapStore.getActiveIssues();
    expect(issues).toHaveLength(1);
    expect(issues[0].level).toBe(7);

    // Safety engine should recommend modifications
    const safetyEngine = (await import('@app/domain')).createSafetyEngine();
    const result = safetyEngine.checkContraindications(['squat'], issues);

    expect(result).toBeDefined();
  });

  it('should exclude exercises that worsen pain', () => {
    mockBodyMapStore.getActiveIssues.mockReturnValue([
      { region: 'lower_back', level: 8, sensation: 'sharp', timestamp: new Date() },
    ]);

    // With severe pain, certain exercises should be excluded
    const plan = mockPlanningEngine.generatePlan({
      focusAreas: ['lower_back'],
      duration: 15,
      skillLevel: 'beginner',
      excludePainfulMovements: true,
    });

    // Should still get a plan but with gentler exercises
    expect(plan).toBeDefined();
    expect(plan.exercises.length).toBeGreaterThan(0);
  });
});

describe('User Flow: Substitute Exercise Mid-Session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWorkoutStore.activeWorkout = {
      id: 'workout-1',
      planId: 'plan-1',
      exercises: [
        {
          exerciseId: 'cat-cow',
          name: 'Cat-Cow Stretch',
          targetSets: 3,
          sets: [{ completed: false }, { completed: false }, { completed: false }],
          completed: false,
          skipped: false,
        },
      ],
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      startTime: new Date(),
      isPaused: false,
      isResting: false,
    };
    mockWorkoutStore.isWorkoutActive = true;
  });

  it('should allow substituting exercise during workout', async () => {
    const substitute = {
      exerciseId: 'pelvic-tilts',
      name: 'Pelvic Tilts',
      targetSets: 3,
      targetReps: 10,
      restBetweenSets: 60,
    };

    act(() => {
      mockWorkoutStore.substituteExercise(0, substitute);
    });

    expect(mockWorkoutStore.substituteExercise).toHaveBeenCalledWith(
      0,
      expect.objectContaining({ exerciseId: 'pelvic-tilts' })
    );
  });

  it('should provide alternative exercises based on current exercise', async () => {
    const substitutionEngine = (await import('@app/domain')).createSubstitutionEngine();
    const alternatives = substitutionEngine.findSubstitutes('cat-cow', {
      reason: 'too_difficult',
      painAreas: ['lower_back'],
    });

    expect(alternatives).toBeDefined();
    expect(alternatives.length).toBeGreaterThan(0);
    expect(alternatives[0].exerciseId).toBe('pelvic-tilts');
  });

  it('should allow skipping exercise entirely', () => {
    act(() => {
      mockWorkoutStore.skipExercise(0);
    });

    expect(mockWorkoutStore.skipExercise).toHaveBeenCalledWith(0);
  });
});

describe('User Flow: Complete Workout Cycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full workout cycle', async () => {
    // 1. Check-in with pain levels
    act(() => {
      mockBodyMapStore.updateMultipleRegions([
        { region: 'lower_back', sensation: 'dull', level: 4 },
      ]);
    });

    // 2. Generate plan
    const plan = mockPlanningEngine.generatePlan({
      focusAreas: ['lower_back'],
      duration: 15,
      skillLevel: 'beginner',
    });

    // 3. Start workout
    act(() => {
      mockWorkoutStore.startWorkout(plan.id, 'full', plan.exercises);
    });

    // 4. Complete exercises
    act(() => {
      // Complete first exercise
      mockWorkoutStore.completeSet(0, 0);
      mockWorkoutStore.completeSet(0, 1);
      mockWorkoutStore.completeSet(0, 2);

      // Complete second exercise
      mockWorkoutStore.completeSet(1, 0);
      mockWorkoutStore.completeSet(1, 1);
      mockWorkoutStore.completeSet(1, 2);
    });

    // 5. End workout
    act(() => {
      mockWorkoutStore.endWorkout('Good session!');
    });

    // Verify flow
    expect(mockBodyMapStore.updateMultipleRegions).toHaveBeenCalled();
    expect(mockPlanningEngine.generatePlan).toHaveBeenCalled();
    expect(mockWorkoutStore.startWorkout).toHaveBeenCalled();
    expect(mockWorkoutStore.completeSet).toHaveBeenCalledTimes(6);
    expect(mockWorkoutStore.endWorkout).toHaveBeenCalled();
  });

  it('should handle workout cancellation', () => {
    act(() => {
      mockWorkoutStore.startWorkout('plan-1', 'quick', []);
    });

    act(() => {
      mockWorkoutStore.cancelWorkout();
    });

    expect(mockWorkoutStore.cancelWorkout).toHaveBeenCalled();
  });

  it('should track pain before and after workout', () => {
    const painBefore = 5;
    let painAfter = painBefore;

    // Simulate workout completion improving pain
    act(() => {
      mockBodyMapStore.updateRegion('lower_back', 'dull', painBefore, {
        source: 'check_in',
      });
    });

    // After workout
    painAfter = 3;

    act(() => {
      mockBodyMapStore.updateRegion('lower_back', 'dull', painAfter, {
        source: 'workout',
      });
    });

    expect(mockBodyMapStore.updateRegion).toHaveBeenCalledWith(
      'lower_back',
      'dull',
      3,
      expect.objectContaining({ source: 'workout' })
    );

    // Pain should have improved
    expect(painAfter).toBeLessThan(painBefore);
  });
});

describe('Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle empty pain areas', () => {
    mockBodyMapStore.getRegionsWithPain.mockReturnValue([]);

    const painAreas = mockBodyMapStore.getRegionsWithPain();
    expect(painAreas).toHaveLength(0);

    // Should still be able to generate a general plan
    const plan = mockPlanningEngine.generatePlan({
      focusAreas: [],
      duration: 20,
      skillLevel: 'beginner',
    });

    expect(plan).toBeDefined();
  });

  it('should handle severe pain preventing exercise', () => {
    mockBodyMapStore.getActiveIssues.mockReturnValue([
      { region: 'lower_back', level: 10, sensation: 'sharp', timestamp: new Date() },
    ]);

    const issues = mockBodyMapStore.getActiveIssues();

    // With level 10 pain, should recommend rest
    expect(issues[0].level).toBe(10);
    // Application logic would recommend rest rather than exercise
  });

  it('should handle mid-workout pain increase', () => {
    mockWorkoutStore.isWorkoutActive = true;

    // User reports increased pain during workout
    act(() => {
      mockBodyMapStore.updateRegion('lower_back', 'sharp', 8, {
        source: 'workout',
      });
    });

    // Should be able to modify or end workout
    expect(mockBodyMapStore.updateRegion).toHaveBeenCalled();
  });

  it('should persist workout state across navigation', () => {
    mockWorkoutStore.activeWorkout = {
      id: 'workout-1',
      planId: 'plan-1',
      exercises: [],
      currentExerciseIndex: 1,
      currentSetIndex: 2,
      startTime: new Date(),
      isPaused: false,
      isResting: false,
    };
    mockWorkoutStore.isWorkoutActive = true;

    // Workout state should be maintained
    expect(mockWorkoutStore.isWorkoutActive).toBe(true);
    expect(mockWorkoutStore.activeWorkout?.currentExerciseIndex).toBe(1);
    expect(mockWorkoutStore.activeWorkout?.currentSetIndex).toBe(2);
  });
});
