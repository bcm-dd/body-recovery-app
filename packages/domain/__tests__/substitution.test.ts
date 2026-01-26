/**
 * Substitution Engine Tests
 */

import { SubstitutionEngine, SubstitutionContext } from '../src/engines/substitution';
import type { Exercise, MuscleGroup, Equipment } from '../src/types/exercise';
import type { MovementConstraint } from '../src/types/body';

// Helper to create a mock exercise
function createMockExercise(overrides: Partial<Exercise> & { id: string; name: string }): Exercise {
  return {
    id: overrides.id,
    name: overrides.name,
    category: overrides.category ?? 'strength',
    musclesPrimary: overrides.musclesPrimary ?? ['chest'],
    musclesSecondary: overrides.musclesSecondary ?? [],
    movementPattern: overrides.movementPattern ?? 'push_horizontal',
    jointActions: overrides.jointActions ?? ['shoulder_flexion', 'elbow_extension'],
    plane: overrides.plane ?? ['sagittal'],
    loadingType: overrides.loadingType ?? ['free_weight'],
    forceVector: overrides.forceVector ?? 'horizontal',
    equipmentRequired: overrides.equipmentRequired ?? ['dumbbell'],
    skillLevel: overrides.skillLevel ?? 'intermediate',
    complexity: overrides.complexity ?? 2,
    progressions: overrides.progressions ?? { easier: [], harder: [] },
    substitutes: overrides.substitutes ?? [],
    contraindications: overrides.contraindications ?? [],
    commonMistakes: [],
    description: 'Test exercise',
    setupInstructions: [],
    executionCues: [],
    isCompound: overrides.isCompound ?? true,
    isUnilateral: false,
    requiresSpotter: false,
    homeGymFriendly: true,
    defaultPrescription: {
      beginner: { sets: 3, reps: '10-12', restSeconds: 60 },
      intermediate: { sets: 3, reps: '8-10', restSeconds: 90 },
      advanced: { sets: 4, reps: '6-8', restSeconds: 120 },
    },
  };
}

// Helper to create mock context
function createMockContext(overrides: Partial<SubstitutionContext> = {}): SubstitutionContext {
  return {
    availableEquipment: overrides.availableEquipment ?? ['dumbbell', 'barbell', 'bench_flat'],
    constraints: overrides.constraints ?? [],
    userPreferences: {
      preferredDays: ['monday', 'wednesday', 'friday'],
      preferredTimeOfDay: 'morning',
      typicalSessionLength: 45,
      experienceLevel: 'intermediate',
      primaryGoal: 'general_fitness',
      preferredRepRange: 'mixed',
      preferredEquipment: [],
      avoidedEquipment: [],
      favoriteExercises: overrides.userPreferences?.favoriteExercises ?? [],
      dislikedExercises: overrides.userPreferences?.dislikedExercises ?? [],
      autoProgressWeights: false,
      progressionAggressiveness: 'moderate',
      deloadFrequency: 'auto',
      weightUnit: 'kg',
      includeWarmup: true,
      includeCooldown: true,
      includeRehabInWorkout: false,
    },
    recentlyUsedExercises: overrides.recentlyUsedExercises ?? [],
  };
}

describe('SubstitutionEngine', () => {
  let engine: SubstitutionEngine;

  beforeEach(() => {
    engine = new SubstitutionEngine();
  });

  describe('Score Calculation', () => {
    test('same muscles score high on muscle_match (40 pts max)', () => {
      const original = createMockExercise({
        id: 'bench-press',
        name: 'Bench Press',
        musclesPrimary: ['chest', 'triceps', 'shoulders_front'],
      });
      const candidate = createMockExercise({
        id: 'dumbbell-press',
        name: 'Dumbbell Press',
        musclesPrimary: ['chest', 'triceps', 'shoulders_front'],
      });

      const score = engine.calculateScore(original, candidate, createMockContext());

      const muscleFactor = score.factors.find(f => f.name === 'muscle_match');
      expect(muscleFactor).toBeDefined();
      expect(muscleFactor!.score).toBe(40); // 100% overlap
    });

    test('same movement pattern scores 25 pts', () => {
      const original = createMockExercise({
        id: 'bench-press',
        name: 'Bench Press',
        movementPattern: 'push_horizontal',
      });
      const candidate = createMockExercise({
        id: 'dumbbell-press',
        name: 'Dumbbell Press',
        movementPattern: 'push_horizontal',
      });

      const score = engine.calculateScore(original, candidate, createMockContext());

      const patternFactor = score.factors.find(f => f.name === 'movement_pattern');
      expect(patternFactor).toBeDefined();
      expect(patternFactor!.score).toBe(25);
    });

    test('similar movement pattern scores partial points', () => {
      const original = createMockExercise({
        id: 'bench-press',
        name: 'Bench Press',
        movementPattern: 'push_horizontal',
      });
      const candidate = createMockExercise({
        id: 'ohp',
        name: 'Overhead Press',
        movementPattern: 'push_vertical',
      });

      const score = engine.calculateScore(original, candidate, createMockContext());

      const patternFactor = score.factors.find(f => f.name === 'movement_pattern');
      expect(patternFactor).toBeDefined();
      expect(patternFactor!.score).toBeGreaterThan(0);
      expect(patternFactor!.score).toBeLessThan(25);
    });

    test('available equipment scores 15 pts', () => {
      const original = createMockExercise({
        id: 'bench-press',
        name: 'Bench Press',
        equipmentRequired: ['barbell', 'bench_flat'],
      });
      const candidate = createMockExercise({
        id: 'dumbbell-press',
        name: 'Dumbbell Press',
        equipmentRequired: ['dumbbell', 'bench_flat'],
      });

      const context = createMockContext({
        availableEquipment: ['dumbbell', 'bench_flat'],
      });
      const score = engine.calculateScore(original, candidate, context);

      const equipmentFactor = score.factors.find(f => f.name === 'equipment');
      expect(equipmentFactor).toBeDefined();
      expect(equipmentFactor!.score).toBe(15);
    });

    test('missing equipment scores 0 pts', () => {
      const original = createMockExercise({
        id: 'bench-press',
        name: 'Bench Press',
      });
      const candidate = createMockExercise({
        id: 'cable-fly',
        name: 'Cable Fly',
        equipmentRequired: ['cable_machine'],
      });

      const context = createMockContext({
        availableEquipment: ['dumbbell'],
      });
      const score = engine.calculateScore(original, candidate, context);

      const equipmentFactor = score.factors.find(f => f.name === 'equipment');
      expect(equipmentFactor).toBeDefined();
      expect(equipmentFactor!.score).toBe(0);
      expect(score.isViable).toBe(false);
    });

    test('same difficulty scores 10 pts', () => {
      const original = createMockExercise({
        id: 'exercise-1',
        name: 'Exercise 1',
        skillLevel: 'intermediate',
      });
      const candidate = createMockExercise({
        id: 'exercise-2',
        name: 'Exercise 2',
        skillLevel: 'intermediate',
      });

      const score = engine.calculateScore(original, candidate, createMockContext());

      const difficultyFactor = score.factors.find(f => f.name === 'difficulty');
      expect(difficultyFactor).toBeDefined();
      expect(difficultyFactor!.score).toBe(10);
    });

    test('different difficulty reduces score', () => {
      const original = createMockExercise({
        id: 'exercise-1',
        name: 'Exercise 1',
        skillLevel: 'beginner',
      });
      const candidate = createMockExercise({
        id: 'exercise-2',
        name: 'Exercise 2',
        skillLevel: 'advanced',
      });

      const score = engine.calculateScore(original, candidate, createMockContext());

      const difficultyFactor = score.factors.find(f => f.name === 'difficulty');
      expect(difficultyFactor).toBeDefined();
      expect(difficultyFactor!.score).toBeLessThan(10);
    });
  });

  describe('Bonuses and Penalties', () => {
    test('direct substitute adds 15 pts bonus', () => {
      const original = createMockExercise({
        id: 'bench-press',
        name: 'Bench Press',
        substitutes: ['dumbbell-press'],
      });
      const candidate = createMockExercise({
        id: 'dumbbell-press',
        name: 'Dumbbell Press',
      });

      const score = engine.calculateScore(original, candidate, createMockContext());

      const substituteFactor = score.factors.find(f => f.name === 'direct_substitute');
      expect(substituteFactor).toBeDefined();
      expect(substituteFactor!.score).toBe(15);
    });

    test('user favorite adds 10 pts bonus', () => {
      const original = createMockExercise({
        id: 'bench-press',
        name: 'Bench Press',
      });
      const candidate = createMockExercise({
        id: 'dumbbell-press',
        name: 'Dumbbell Press',
      });

      const context = createMockContext({
        userPreferences: {
          favoriteExercises: ['dumbbell-press'],
          dislikedExercises: [],
        } as any,
      });
      const score = engine.calculateScore(original, candidate, context);

      const favoriteFactor = score.factors.find(f => f.name === 'user_favorite');
      expect(favoriteFactor).toBeDefined();
      expect(favoriteFactor!.score).toBe(10);
    });

    test('user dislike subtracts 20 pts', () => {
      const original = createMockExercise({
        id: 'bench-press',
        name: 'Bench Press',
      });
      const candidate = createMockExercise({
        id: 'dumbbell-press',
        name: 'Dumbbell Press',
      });

      const context = createMockContext({
        userPreferences: {
          favoriteExercises: [],
          dislikedExercises: ['dumbbell-press'],
        } as any,
      });
      const score = engine.calculateScore(original, candidate, context);

      const dislikeFactor = score.factors.find(f => f.name === 'user_dislike');
      expect(dislikeFactor).toBeDefined();
      expect(dislikeFactor!.score).toBe(-20);
    });
  });

  describe('Constraint Handling', () => {
    test('constraint violation eliminates candidate', () => {
      const original = createMockExercise({
        id: 'squat',
        name: 'Squat',
        movementPattern: 'squat',
        musclesPrimary: ['quads', 'glutes'],
      });
      const candidate = createMockExercise({
        id: 'leg-press',
        name: 'Leg Press',
        movementPattern: 'squat',
        musclesPrimary: ['quads', 'glutes'],
      });

      const constraint: MovementConstraint = {
        id: 'c1',
        injuryId: 'i1',
        constraintType: 'avoid_movement',
        movementPatterns: ['squat'],
        description: 'Avoid squatting movements',
        startDate: new Date(),
        source: 'user',
        confidence: 1,
      };

      const context = createMockContext({
        constraints: [constraint],
      });
      const score = engine.calculateScore(original, candidate, context);

      expect(score.isViable).toBe(false);
      expect(score.factors.some(f => f.name === 'constraint_violation')).toBe(true);
    });
  });

  describe('Find Substitutes', () => {
    test('returns ranked substitutes', () => {
      const exercises: Exercise[] = [
        createMockExercise({
          id: 'bench-press',
          name: 'Bench Press',
          musclesPrimary: ['chest', 'triceps'],
          movementPattern: 'push_horizontal',
          equipmentRequired: ['barbell', 'bench_flat'],
        }),
        createMockExercise({
          id: 'dumbbell-press',
          name: 'Dumbbell Press',
          musclesPrimary: ['chest', 'triceps'],
          movementPattern: 'push_horizontal',
          equipmentRequired: ['dumbbell', 'bench_flat'],
        }),
        createMockExercise({
          id: 'push-up',
          name: 'Push Up',
          musclesPrimary: ['chest', 'triceps'],
          movementPattern: 'push_horizontal',
          equipmentRequired: ['none'],
        }),
        createMockExercise({
          id: 'squat',
          name: 'Squat',
          musclesPrimary: ['quads', 'glutes'],
          movementPattern: 'squat',
        }),
      ];

      const context = createMockContext({
        availableEquipment: ['dumbbell', 'bench_flat'],
      });

      const substitutes = engine.findSubstitutes(
        'bench-press',
        exercises,
        context,
        3
      );

      // Should return dumbbell press and push up, not squat
      expect(substitutes.length).toBeGreaterThan(0);
      expect(substitutes.some(s => s.exerciseId === 'dumbbell-press')).toBe(true);
      expect(substitutes.some(s => s.exerciseId === 'push-up')).toBe(true);
      expect(substitutes.some(s => s.exerciseId === 'squat')).toBe(false);
    });

    test('excludes original exercise from results', () => {
      const exercises: Exercise[] = [
        createMockExercise({
          id: 'bench-press',
          name: 'Bench Press',
        }),
        createMockExercise({
          id: 'dumbbell-press',
          name: 'Dumbbell Press',
        }),
      ];

      const substitutes = engine.findSubstitutes(
        'bench-press',
        exercises,
        createMockContext(),
        5
      );

      expect(substitutes.some(s => s.exerciseId === 'bench-press')).toBe(false);
    });

    test('respects limit parameter', () => {
      const exercises: Exercise[] = Array.from({ length: 10 }, (_, i) =>
        createMockExercise({
          id: `exercise-${i}`,
          name: `Exercise ${i}`,
          musclesPrimary: ['chest'],
          movementPattern: 'push_horizontal',
        })
      );

      const substitutes = engine.findSubstitutes(
        'exercise-0',
        exercises,
        createMockContext(),
        3
      );

      expect(substitutes.length).toBeLessThanOrEqual(3);
    });

    test('filters out low scoring candidates (< 40)', () => {
      const exercises: Exercise[] = [
        createMockExercise({
          id: 'bench-press',
          name: 'Bench Press',
          musclesPrimary: ['chest'],
          movementPattern: 'push_horizontal',
        }),
        createMockExercise({
          id: 'squat',
          name: 'Squat',
          musclesPrimary: ['quads'],
          movementPattern: 'squat',
        }),
      ];

      const substitutes = engine.findSubstitutes(
        'bench-press',
        exercises,
        createMockContext(),
        5
      );

      // Squat should be filtered out due to low similarity
      expect(substitutes.some(s => s.exerciseId === 'squat')).toBe(false);
    });

    test('generates explanation for each substitute', () => {
      const exercises: Exercise[] = [
        createMockExercise({
          id: 'bench-press',
          name: 'Bench Press',
          musclesPrimary: ['chest', 'triceps'],
          substitutes: ['dumbbell-press'],
        }),
        createMockExercise({
          id: 'dumbbell-press',
          name: 'Dumbbell Press',
          musclesPrimary: ['chest', 'triceps'],
        }),
      ];

      const substitutes = engine.findSubstitutes(
        'bench-press',
        exercises,
        createMockContext(),
        5
      );

      expect(substitutes.length).toBeGreaterThan(0);
      expect(substitutes[0].reason).toBeTruthy();
      expect(typeof substitutes[0].reason).toBe('string');
    });
  });
});
