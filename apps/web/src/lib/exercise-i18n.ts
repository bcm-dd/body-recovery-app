/**
 * Exercise Internationalization Utilities
 *
 * This module provides utilities for translating exercise content
 * including names, descriptions, and coaching cues.
 *
 * Exercise translations are structured to:
 * 1. Support name, description, and cues for each exercise
 * 2. Fall back to English if translation is missing
 * 3. Support dynamic exercise additions without code changes
 * 4. Maintain type safety for known exercises
 */

import type { Locale } from './i18n';

// ============================================================================
// Types
// ============================================================================

/**
 * Structure for a translated exercise
 */
export interface TranslatedExercise {
  name: string;
  description: string;
  cues: string[];
}

/**
 * Exercise catalog keyed by exercise ID
 */
export type ExerciseCatalog = Record<string, TranslatedExercise>;

/**
 * Full exercise translations structure
 */
export interface ExerciseTranslations {
  catalog: ExerciseCatalog;
  // UI strings related to exercises
  ui: {
    setsCompleted: string; // "{completed}/{target} sets"
    reps: string; // "{count} reps"
    hold: string; // "Hold for {seconds}s"
    rest: string; // "Rest for {seconds}s"
    nextExercise: string;
    previousExercise: string;
    skipExercise: string;
    modifyExercise: string;
    watchDemo: string;
    startExercise: string;
    completeExercise: string;
  };
}

// ============================================================================
// Default English Exercise Catalog
// ============================================================================

/**
 * Default English translations for all exercises
 * This serves as the fallback and source of truth
 */
export const defaultExerciseCatalog: ExerciseCatalog = {
  'cat-cow-stretch': {
    name: 'Cat-Cow Stretch',
    description: 'A gentle flow between two poses that warms up the spine and stretches the back muscles.',
    cues: [
      'Start on hands and knees',
      'Arch back up like a cat',
      'Drop belly down, look up',
      'Move slowly between positions',
    ],
  },
  'hip-circles': {
    name: 'Hip Circles',
    description: 'Circular movements to improve hip mobility and loosen tight muscles around the pelvis.',
    cues: [
      'Stand with feet hip-width apart',
      'Make slow circles with hips',
      'Keep upper body stable',
      'Reverse direction',
    ],
  },
  'childs-pose': {
    name: "Child's Pose",
    description: 'A resting pose that gently stretches the lower back, hips, and thighs.',
    cues: [
      'Kneel on the floor',
      'Sit back on heels',
      'Reach arms forward',
      'Rest forehead on ground',
    ],
  },
  'bird-dog': {
    name: 'Bird Dog',
    description: 'A core stability exercise that strengthens the back and improves balance.',
    cues: [
      'Start on hands and knees',
      'Extend opposite arm and leg',
      'Keep back flat',
      'Hold briefly, then switch',
    ],
  },
  'shoulder-rolls': {
    name: 'Shoulder Rolls',
    description: 'Simple circular movements to release tension in the shoulders and upper back.',
    cues: [
      'Relax arms at sides',
      'Roll shoulders forward',
      'Then roll backwards',
      'Keep movements smooth',
    ],
  },
  'thread-the-needle': {
    name: 'Thread the Needle',
    description: 'A rotational stretch that opens up the thoracic spine and shoulders.',
    cues: [
      'Start on hands and knees',
      'Thread one arm under body',
      'Rotate torso',
      'Feel stretch in upper back',
    ],
  },
  'knee-to-chest': {
    name: 'Knee to Chest',
    description: 'A gentle stretch for the lower back and hips.',
    cues: [
      'Lie on your back',
      'Pull one knee to chest',
      'Hold gently',
      'Switch legs',
    ],
  },
  'pelvic-tilts': {
    name: 'Pelvic Tilts',
    description: 'Subtle movements to mobilize the lower back and strengthen core stability.',
    cues: [
      'Lie on back, knees bent',
      'Flatten lower back to floor',
      'Then arch slightly',
      'Move slowly',
    ],
  },
  'standing-quad-stretch': {
    name: 'Standing Quad Stretch',
    description: 'A classic stretch for the front of the thigh.',
    cues: [
      'Stand on one leg',
      'Pull foot toward buttock',
      'Keep knees together',
      'Hold for balance',
    ],
  },
  'supine-twist': {
    name: 'Supine Twist',
    description: 'A relaxing twist that stretches the spine and releases tension.',
    cues: [
      'Lie on your back',
      'Drop knees to one side',
      'Keep shoulders flat',
      'Look opposite direction',
    ],
  },
};

/**
 * Default English UI strings for exercises
 */
export const defaultExerciseUI: ExerciseTranslations['ui'] = {
  setsCompleted: '{completed}/{target} sets',
  reps: '{count} reps',
  hold: 'Hold for {seconds}s',
  rest: 'Rest for {seconds}s',
  nextExercise: 'Next Exercise',
  previousExercise: 'Previous Exercise',
  skipExercise: 'Skip',
  modifyExercise: 'Modify',
  watchDemo: 'Watch Demo',
  startExercise: 'Start',
  completeExercise: 'Complete',
};

// ============================================================================
// Translation Functions
// ============================================================================

/**
 * Get translated exercise by ID
 * Falls back to English if translation not found
 */
export function getTranslatedExercise(
  exerciseId: string,
  translations?: ExerciseCatalog,
  _locale?: Locale
): TranslatedExercise {
  // First check translations, then fall back to default
  const translated = translations?.[exerciseId];
  if (translated) return translated;

  // Normalize the ID (handle different formats)
  const normalizedId = exerciseId.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const defaultExercise = defaultExerciseCatalog[normalizedId];

  if (defaultExercise) return defaultExercise;

  // Return a generic fallback
  return {
    name: exerciseId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    description: 'Follow the movement pattern shown.',
    cues: ['Follow the demonstration', 'Move at your own pace', 'Stop if you feel pain'],
  };
}

/**
 * Get all translated exercises
 */
export function getAllTranslatedExercises(
  translations?: ExerciseCatalog,
  _locale?: Locale
): ExerciseCatalog {
  return {
    ...defaultExerciseCatalog,
    ...translations,
  };
}

/**
 * Get translated exercise UI string
 */
export function getExerciseUIString(
  key: keyof ExerciseTranslations['ui'],
  translations?: ExerciseTranslations['ui'],
  _locale?: Locale
): string {
  return translations?.[key] || defaultExerciseUI[key];
}

// ============================================================================
// Interpolation Helpers
// ============================================================================

/**
 * Format sets completed string
 */
export function formatSetsCompleted(
  completed: number,
  target: number,
  translations?: ExerciseTranslations['ui']
): string {
  const template = getExerciseUIString('setsCompleted', translations);
  return template
    .replace('{completed}', completed.toString())
    .replace('{target}', target.toString());
}

/**
 * Format reps string
 */
export function formatReps(
  count: number,
  translations?: ExerciseTranslations['ui']
): string {
  const template = getExerciseUIString('reps', translations);
  return template.replace('{count}', count.toString());
}

/**
 * Format hold duration string
 */
export function formatHold(
  seconds: number,
  translations?: ExerciseTranslations['ui']
): string {
  const template = getExerciseUIString('hold', translations);
  return template.replace('{seconds}', seconds.toString());
}

/**
 * Format rest duration string
 */
export function formatRest(
  seconds: number,
  translations?: ExerciseTranslations['ui']
): string {
  const template = getExerciseUIString('rest', translations);
  return template.replace('{seconds}', seconds.toString());
}

// ============================================================================
// React Hook
// ============================================================================

/**
 * Hook to use exercise translations in React components
 *
 * @example
 * ```tsx
 * import { useExerciseTranslation } from '@/lib/exercise-i18n';
 *
 * function ExerciseCard({ exerciseId }) {
 *   const { getExercise, formatSets } = useExerciseTranslation();
 *   const exercise = getExercise(exerciseId);
 *
 *   return (
 *     <div>
 *       <h3>{exercise.name}</h3>
 *       <p>{exercise.description}</p>
 *       <ul>
 *         {exercise.cues.map((cue, i) => <li key={i}>{cue}</li>)}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export function useExerciseTranslation(
  translations?: ExerciseTranslations,
  locale?: Locale
) {
  return {
    getExercise: (id: string) => getTranslatedExercise(id, translations?.catalog, locale),
    getAllExercises: () => getAllTranslatedExercises(translations?.catalog, locale),
    getUIString: (key: keyof ExerciseTranslations['ui']) =>
      getExerciseUIString(key, translations?.ui, locale),
    formatSets: (completed: number, target: number) =>
      formatSetsCompleted(completed, target, translations?.ui),
    formatReps: (count: number) => formatReps(count, translations?.ui),
    formatHold: (seconds: number) => formatHold(seconds, translations?.ui),
    formatRest: (seconds: number) => formatRest(seconds, translations?.ui),
  };
}

// Types are exported at the top via the interface declarations
