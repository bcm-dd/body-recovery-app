/**
 * Muscle Group Constants
 * Defines muscle groups and their recovery characteristics
 */

import type { MuscleGroup, MuscleRecoveryEstimate } from '../types/exercise';

/**
 * All muscle groups
 */
export const MUSCLE_GROUPS: readonly MuscleGroup[] = [
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
] as const;

/**
 * Display names for muscle groups
 */
export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  upper_back: 'Upper Back',
  lats: 'Lats',
  shoulders_front: 'Front Delts',
  shoulders_side: 'Side Delts',
  shoulders_rear: 'Rear Delts',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  core_front: 'Abs',
  core_obliques: 'Obliques',
  lower_back: 'Lower Back',
  glutes: 'Glutes',
  hip_flexors: 'Hip Flexors',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  adductors: 'Adductors',
  abductors: 'Abductors',
  calves: 'Calves',
  neck: 'Neck',
};

/**
 * Muscle recovery time estimates (hours)
 * Based on typical recovery needs for light, moderate, and heavy sessions
 */
export const MUSCLE_RECOVERY_ESTIMATES: Record<MuscleGroup, MuscleRecoveryEstimate> = {
  chest: { light: 24, moderate: 48, heavy: 72 },
  upper_back: { light: 24, moderate: 48, heavy: 72 },
  lats: { light: 24, moderate: 48, heavy: 72 },
  shoulders_front: { light: 24, moderate: 48, heavy: 72 },
  shoulders_side: { light: 24, moderate: 48, heavy: 72 },
  shoulders_rear: { light: 24, moderate: 36, heavy: 48 },
  biceps: { light: 24, moderate: 36, heavy: 48 },
  triceps: { light: 24, moderate: 36, heavy: 48 },
  forearms: { light: 24, moderate: 36, heavy: 48 },
  core_front: { light: 12, moderate: 24, heavy: 48 },
  core_obliques: { light: 12, moderate: 24, heavy: 48 },
  lower_back: { light: 36, moderate: 48, heavy: 72 },
  glutes: { light: 36, moderate: 48, heavy: 72 },
  hip_flexors: { light: 24, moderate: 36, heavy: 48 },
  quads: { light: 36, moderate: 48, heavy: 72 },
  hamstrings: { light: 36, moderate: 48, heavy: 72 },
  adductors: { light: 24, moderate: 36, heavy: 48 },
  abductors: { light: 24, moderate: 36, heavy: 48 },
  calves: { light: 24, moderate: 36, heavy: 48 },
  neck: { light: 24, moderate: 36, heavy: 48 },
};

/**
 * Group muscles by body part
 */
export const MUSCLE_GROUP_CATEGORIES: Record<string, readonly MuscleGroup[]> = {
  upper_push: ['chest', 'shoulders_front', 'shoulders_side', 'triceps'],
  upper_pull: ['upper_back', 'lats', 'shoulders_rear', 'biceps'],
  core: ['core_front', 'core_obliques', 'lower_back'],
  lower: ['quads', 'hamstrings', 'glutes', 'calves', 'hip_flexors', 'adductors', 'abductors'],
  arms: ['biceps', 'triceps', 'forearms'],
  shoulders: ['shoulders_front', 'shoulders_side', 'shoulders_rear'],
} as const;

/**
 * Synergist muscle relationships (muscles that work together)
 */
export const MUSCLE_SYNERGISTS: Record<MuscleGroup, MuscleGroup[]> = {
  chest: ['shoulders_front', 'triceps'],
  upper_back: ['lats', 'shoulders_rear', 'biceps'],
  lats: ['upper_back', 'biceps'],
  shoulders_front: ['chest', 'triceps'],
  shoulders_side: ['shoulders_front', 'shoulders_rear'],
  shoulders_rear: ['upper_back', 'shoulders_side'],
  biceps: ['lats', 'upper_back', 'forearms'],
  triceps: ['chest', 'shoulders_front'],
  forearms: ['biceps'],
  core_front: ['core_obliques', 'hip_flexors'],
  core_obliques: ['core_front', 'lower_back'],
  lower_back: ['glutes', 'hamstrings', 'core_obliques'],
  glutes: ['hamstrings', 'lower_back', 'quads'],
  hip_flexors: ['core_front', 'quads'],
  quads: ['glutes', 'hip_flexors'],
  hamstrings: ['glutes', 'lower_back', 'calves'],
  adductors: ['quads', 'hamstrings'],
  abductors: ['glutes'],
  calves: ['hamstrings'],
  neck: ['upper_back'],
};

/**
 * Antagonist muscle pairs (opposing muscles)
 */
export const MUSCLE_ANTAGONISTS: Record<MuscleGroup, MuscleGroup[]> = {
  chest: ['upper_back', 'lats'],
  upper_back: ['chest'],
  lats: ['chest', 'shoulders_front'],
  shoulders_front: ['shoulders_rear', 'lats'],
  shoulders_side: [],
  shoulders_rear: ['shoulders_front', 'chest'],
  biceps: ['triceps'],
  triceps: ['biceps'],
  forearms: [],
  core_front: ['lower_back'],
  core_obliques: [],
  lower_back: ['core_front', 'hip_flexors'],
  glutes: ['hip_flexors'],
  hip_flexors: ['glutes', 'hamstrings'],
  quads: ['hamstrings'],
  hamstrings: ['quads', 'hip_flexors'],
  adductors: ['abductors'],
  abductors: ['adductors'],
  calves: [],
  neck: [],
};

/**
 * Calculate muscle overlap percentage (0-1)
 */
export function calculateMuscleOverlap(
  muscles1: MuscleGroup[],
  muscles2: MuscleGroup[]
): number {
  if (muscles1.length === 0 || muscles2.length === 0) return 0;

  const set1 = new Set(muscles1);
  const set2 = new Set(muscles2);

  let matches = 0;
  for (const muscle of set1) {
    if (set2.has(muscle)) {
      matches++;
    }
  }

  // Use the smaller set as denominator for a more meaningful score
  const smallerSetSize = Math.min(set1.size, set2.size);
  return matches / smallerSetSize;
}

/**
 * Calculate if muscles are sufficiently similar (including synergists)
 */
export function areMusclesSimilar(
  muscles1: MuscleGroup[],
  muscles2: MuscleGroup[]
): boolean {
  // Direct overlap
  const directOverlap = calculateMuscleOverlap(muscles1, muscles2);
  if (directOverlap >= 0.5) return true;

  // Check synergists
  const expandedMuscles1 = new Set<MuscleGroup>(muscles1);
  for (const muscle of muscles1) {
    MUSCLE_SYNERGISTS[muscle]?.forEach(syn => expandedMuscles1.add(syn));
  }

  for (const muscle of muscles2) {
    if (expandedMuscles1.has(muscle)) return true;
  }

  return false;
}
