/**
 * Data exports for Body Recovery Companion App
 *
 * This module exports the exercise library and demo profiles
 * for use throughout the application.
 */

// ============================================================================
// Exercise Library Exports
// ============================================================================

export {
  // Types
  type ExerciseCategory,
  type MuscleGroup,
  type MovementPattern,
  type JointAction,
  type Equipment,
  type Contraindication,
  type Exercise,
  type ContraindicationCondition,

  // Constants
  EXERCISES,
  EXERCISES_BY_ID,
  CONTRAINDICATION_CONDITIONS,

  // Functions
  getExerciseById,
  getExercisesByCategory,
  getExercisesByMuscleGroup,
  getExercisesByMovementPattern,
  getExercisesBySkillLevel,
  getBodyweightExercises,
  filterByEquipment,
  filterByContraindications,
  getAlternativesForContraindication,
} from './exercises';

// ============================================================================
// Demo Profiles Exports
// ============================================================================

export {
  // Types
  type BodyRegion,
  type PainLevel,
  type SensationType,
  type InjuryStatus,
  type InjuryType,
  type MovementConstraint,
  type Injury,
  type BodyRegionStatus,
  type UserTrainingPreferences,
  type DemoProfile,

  // Demo Profiles
  ACL_RECOVERY_PROFILE,
  LOW_BACK_PROFILE,
  SHOULDER_REHAB_PROFILE,
  DEMO_PROFILES,
  DEMO_PROFILES_BY_ID,

  // Functions
  getDemoProfileById,
  getDemoProfileIds,
  getDemoProfileSummaries,
  getProfileContraindications,
  getRecommendedCategories,
} from './profiles';

// ============================================================================
// Convenience Re-exports for Common Use Cases
// ============================================================================

/**
 * Quick access to exercise count by category
 */
export { EXERCISES } from './exercises';
import { EXERCISES } from './exercises';

export const EXERCISE_COUNTS = {
  total: EXERCISES.length,
  mobility: EXERCISES.filter((e) => e.category === 'mobility').length,
  stretching: EXERCISES.filter((e) => e.category === 'stretching').length,
  activation: EXERCISES.filter((e) => e.category === 'activation').length,
  strength: EXERCISES.filter((e) => e.category === 'strength').length,
  recovery: EXERCISES.filter((e) => e.category === 'recovery').length,
} as const;

/**
 * Exercise IDs grouped by category for easy reference
 */
export const EXERCISE_IDS_BY_CATEGORY = {
  mobility: EXERCISES.filter((e) => e.category === 'mobility').map((e) => e.id),
  stretching: EXERCISES.filter((e) => e.category === 'stretching').map((e) => e.id),
  activation: EXERCISES.filter((e) => e.category === 'activation').map((e) => e.id),
  strength: EXERCISES.filter((e) => e.category === 'strength').map((e) => e.id),
  recovery: EXERCISES.filter((e) => e.category === 'recovery').map((e) => e.id),
} as const;
