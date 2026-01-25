/**
 * Exercise Library Tests
 * Tests that all exercises have required fields and valid data
 */

import { EXERCISES, getExerciseById, EXERCISES_BY_ID } from '../src/data/exercises';
import type { Exercise } from '../src/data/exercises';

describe('Exercise Library', () => {
  describe('All Exercises Have Required Fields', () => {
    test.each(EXERCISES.map((e) => [e.id, e]))(
      'exercise %s has all required fields',
      (_id, exercise: Exercise) => {
        // Basic identification
        expect(exercise.id).toBeTruthy();
        expect(typeof exercise.id).toBe('string');
        expect(exercise.name).toBeTruthy();
        expect(typeof exercise.name).toBe('string');

        // Category
        expect(exercise.category).toBeTruthy();
        expect([
          'mobility',
          'stretching',
          'activation',
          'strength',
          'recovery',
        ]).toContain(exercise.category);

        // Muscles
        expect(Array.isArray(exercise.musclesPrimary)).toBe(true);
        expect(exercise.musclesPrimary.length).toBeGreaterThan(0);
        expect(Array.isArray(exercise.musclesSecondary)).toBe(true);

        // Movement characteristics
        expect(exercise.movementPattern).toBeTruthy();
        expect(Array.isArray(exercise.jointActions)).toBe(true);

        // Equipment
        expect(Array.isArray(exercise.equipmentRequired)).toBe(true);

        // Difficulty
        expect(['beginner', 'intermediate', 'advanced']).toContain(
          exercise.skillLevel
        );

        // Instructions
        expect(exercise.description).toBeTruthy();
        expect(typeof exercise.description).toBe('string');
        expect(Array.isArray(exercise.cues)).toBe(true);
        expect(exercise.cues.length).toBeGreaterThan(0);

        // Safety
        expect(Array.isArray(exercise.contraindications)).toBe(true);
      }
    );

    test('all exercise IDs are unique', () => {
      const ids = EXERCISES.map((e) => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    test('all exercise names are unique', () => {
      const names = EXERCISES.map((e) => e.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    test('exercises cover all major categories', () => {
      const categories = new Set(EXERCISES.map((e) => e.category));
      expect(categories.has('mobility')).toBe(true);
      expect(categories.has('stretching')).toBe(true);
      expect(categories.has('activation')).toBe(true);
      expect(categories.has('strength')).toBe(true);
      expect(categories.has('recovery')).toBe(true);
    });
  });

  describe('Exercise Data Integrity', () => {
    test('all primary muscles are valid muscle groups', () => {
      const validMuscles = [
        'chest',
        'upper_back',
        'lats',
        'shoulders_front',
        'shoulders_side',
        'shoulders_rear',
        'biceps',
        'triceps',
        'forearms',
        'core_front',
        'core_obliques',
        'lower_back',
        'glutes',
        'hip_flexors',
        'quads',
        'hamstrings',
        'adductors',
        'abductors',
        'calves',
        'neck',
      ];

      EXERCISES.forEach((exercise) => {
        exercise.musclesPrimary.forEach((muscle) => {
          expect(validMuscles).toContain(muscle);
        });
        exercise.musclesSecondary.forEach((muscle) => {
          expect(validMuscles).toContain(muscle);
        });
      });
    });

    test('all movement patterns are valid', () => {
      const validPatterns = [
        'squat',
        'hip_hinge',
        'lunge',
        'push_horizontal',
        'push_vertical',
        'pull_horizontal',
        'pull_vertical',
        'carry',
        'rotation',
        'anti_rotation',
        'flexion',
        'extension',
        'lateral',
        'gait',
        'isometric',
      ];

      EXERCISES.forEach((exercise) => {
        expect(validPatterns).toContain(exercise.movementPattern);
      });
    });

    test('contraindications have required fields', () => {
      EXERCISES.forEach((exercise) => {
        exercise.contraindications.forEach((ci) => {
          expect(ci.condition).toBeTruthy();
          expect(['absolute', 'relative']).toContain(ci.severity);
          expect(ci.reason).toBeTruthy();
        });
      });
    });
  });

  describe('Exercise Lookup Functions', () => {
    test('getExerciseById returns correct exercise', () => {
      const firstExercise = EXERCISES[0];
      const found = getExerciseById(firstExercise.id);
      expect(found).toEqual(firstExercise);
    });

    test('getExerciseById returns undefined for invalid ID', () => {
      const found = getExerciseById('nonexistent-id');
      expect(found).toBeUndefined();
    });

    test('EXERCISES_BY_ID contains all exercises', () => {
      expect(Object.keys(EXERCISES_BY_ID).length).toBe(EXERCISES.length);
      EXERCISES.forEach((exercise) => {
        expect(EXERCISES_BY_ID[exercise.id]).toEqual(exercise);
      });
    });
  });

  describe('Exercise Coverage', () => {
    test('library has sufficient number of exercises', () => {
      // MVP should have at least 30 exercises
      expect(EXERCISES.length).toBeGreaterThanOrEqual(30);
    });

    test('each skill level has exercises', () => {
      const beginnerExercises = EXERCISES.filter(
        (e) => e.skillLevel === 'beginner'
      );
      const intermediateExercises = EXERCISES.filter(
        (e) => e.skillLevel === 'intermediate'
      );
      const advancedExercises = EXERCISES.filter(
        (e) => e.skillLevel === 'advanced'
      );

      expect(beginnerExercises.length).toBeGreaterThan(0);
      expect(intermediateExercises.length).toBeGreaterThan(0);
      expect(advancedExercises.length).toBeGreaterThan(0);
    });

    test('has bodyweight-only exercises', () => {
      const bodyweightExercises = EXERCISES.filter(
        (e) =>
          e.equipmentRequired.length === 0 ||
          (e.equipmentRequired.length === 1 &&
            (e.equipmentRequired[0] === 'none' ||
              e.equipmentRequired[0] === 'yoga_mat'))
      );
      expect(bodyweightExercises.length).toBeGreaterThan(5);
    });

    test('covers major body regions', () => {
      const musclesCovered = new Set<string>();
      EXERCISES.forEach((exercise) => {
        exercise.musclesPrimary.forEach((m) => musclesCovered.add(m));
      });

      // Should cover at least upper body, core, and lower body
      const upperBody = ['chest', 'upper_back'];
      const core = ['core_front', 'lower_back'];
      const lowerBody = ['glutes', 'quads', 'hamstrings'];

      upperBody.forEach((m) => expect(musclesCovered.has(m)).toBe(true));
      core.forEach((m) => expect(musclesCovered.has(m)).toBe(true));
      lowerBody.forEach((m) => expect(musclesCovered.has(m)).toBe(true));
    });
  });
});
