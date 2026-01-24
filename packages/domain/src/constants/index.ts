/**
 * Constants Index
 * Re-exports all domain constants
 */

// Body regions
export {
  BODY_REGIONS,
  BODY_REGION_LABELS,
  BODY_REGION_GROUPS,
  BODY_REGION_TO_MUSCLES,
  BILATERAL_PAIRS,
} from './regions';

// Movement patterns
export {
  MOVEMENT_PATTERNS,
  MOVEMENT_PATTERN_LABELS,
  PATTERN_PRIMARY_MUSCLES,
  SIMILAR_PATTERNS,
  areSimilarPatterns,
  PUSH_PATTERNS,
  PULL_PATTERNS,
  SPINAL_LOADING_PATTERNS,
  BEGINNER_FRIENDLY_PATTERNS,
} from './patterns';

// Muscle groups
export {
  MUSCLE_GROUPS,
  MUSCLE_GROUP_LABELS,
  MUSCLE_RECOVERY_ESTIMATES,
  MUSCLE_GROUP_CATEGORIES,
  MUSCLE_SYNERGISTS,
  MUSCLE_ANTAGONISTS,
  calculateMuscleOverlap,
  areMusclesSimilar,
} from './muscles';
