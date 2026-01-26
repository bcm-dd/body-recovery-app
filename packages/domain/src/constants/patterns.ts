/**
 * Movement Pattern Constants
 * Defines movement patterns and their relationships
 */

import type { MovementPattern, MuscleGroup } from '../types/exercise';

/**
 * All movement patterns
 */
export const MOVEMENT_PATTERNS: readonly MovementPattern[] = [
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
] as const;

/**
 * Display names for movement patterns
 */
export const MOVEMENT_PATTERN_LABELS: Record<MovementPattern, string> = {
  squat: 'Squat',
  hip_hinge: 'Hip Hinge',
  lunge: 'Lunge',
  push_horizontal: 'Horizontal Push',
  push_vertical: 'Vertical Push',
  pull_horizontal: 'Horizontal Pull',
  pull_vertical: 'Vertical Pull',
  carry: 'Carry',
  rotation: 'Rotation',
  anti_rotation: 'Anti-Rotation',
  flexion: 'Flexion',
  extension: 'Extension',
  lateral: 'Lateral',
  gait: 'Gait/Walking',
  isometric: 'Isometric Hold',
};

/**
 * Primary muscles activated by each movement pattern
 */
export const PATTERN_PRIMARY_MUSCLES: Record<MovementPattern, MuscleGroup[]> = {
  squat: ['quads', 'glutes', 'core_front'],
  hip_hinge: ['hamstrings', 'glutes', 'lower_back'],
  lunge: ['quads', 'glutes', 'hamstrings'],
  push_horizontal: ['chest', 'triceps', 'shoulders_front'],
  push_vertical: ['shoulders_front', 'shoulders_side', 'triceps'],
  pull_horizontal: ['upper_back', 'lats', 'biceps'],
  pull_vertical: ['lats', 'upper_back', 'biceps'],
  carry: ['core_front', 'core_obliques', 'forearms', 'shoulders_side'],
  rotation: ['core_obliques', 'core_front'],
  anti_rotation: ['core_obliques', 'core_front'],
  flexion: ['core_front', 'hip_flexors'],
  extension: ['lower_back', 'glutes'],
  lateral: ['abductors', 'adductors', 'core_obliques'],
  gait: ['quads', 'hamstrings', 'calves', 'glutes'],
  isometric: [], // Varies by exercise
};

/**
 * Similar movement patterns (for substitution scoring)
 */
export const SIMILAR_PATTERNS: Record<MovementPattern, MovementPattern[]> = {
  squat: ['lunge', 'hip_hinge'],
  hip_hinge: ['squat', 'extension'],
  lunge: ['squat', 'gait'],
  push_horizontal: ['push_vertical'],
  push_vertical: ['push_horizontal'],
  pull_horizontal: ['pull_vertical'],
  pull_vertical: ['pull_horizontal'],
  carry: ['anti_rotation', 'isometric'],
  rotation: ['anti_rotation', 'lateral'],
  anti_rotation: ['rotation', 'carry', 'isometric'],
  flexion: ['isometric'],
  extension: ['hip_hinge', 'isometric'],
  lateral: ['lunge', 'rotation'],
  gait: ['lunge', 'squat'],
  isometric: ['anti_rotation', 'carry'],
};

/**
 * Check if two movement patterns are similar
 */
export function areSimilarPatterns(pattern1: MovementPattern, pattern2: MovementPattern): boolean {
  if (pattern1 === pattern2) return true;
  return SIMILAR_PATTERNS[pattern1]?.includes(pattern2) ?? false;
}

/**
 * Movement patterns that are push-based
 */
export const PUSH_PATTERNS: readonly MovementPattern[] = [
  'push_horizontal',
  'push_vertical',
  'squat',
  'lunge',
] as const;

/**
 * Movement patterns that are pull-based
 */
export const PULL_PATTERNS: readonly MovementPattern[] = [
  'pull_horizontal',
  'pull_vertical',
  'hip_hinge',
] as const;

/**
 * Movement patterns that heavily load the spine
 */
export const SPINAL_LOADING_PATTERNS: readonly MovementPattern[] = [
  'squat',
  'hip_hinge',
  'carry',
  'extension',
] as const;

/**
 * Movement patterns safe for beginners
 */
export const BEGINNER_FRIENDLY_PATTERNS: readonly MovementPattern[] = [
  'push_horizontal',
  'pull_horizontal',
  'squat',
  'gait',
  'isometric',
] as const;
