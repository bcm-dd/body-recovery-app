/**
 * @package @app/domain
 * @description Domain layer for the Body Recovery App
 *
 * This package contains:
 * - Types: Complete TypeScript interfaces for body map, exercises, plans, health, and safety
 * - Engines: Rules-based planning, substitution scoring, and safety detection
 * - Constants: Body regions, movement patterns, and muscle groups
 */

// =============================================================================
// Types
// =============================================================================

// Body types
export type {
  BodyRegion,
  PainLevel,
  SensationType,
  InjuryStatus,
  InjuryType,
  BodyRegionStatus,
  MovementConstraint,
  Injury,
  MobilityBaseline,
  StrengthBaseline,
  BodyMap,
} from './types/body';

// Exercise types
export type {
  MovementPattern,
  MuscleGroup,
  JointAction,
  MovementPlane,
  LoadingType,
  ForceVector,
  Equipment,
  ExerciseCategory,
  SkillLevel,
  Contraindication,
  DefaultPrescription,
  Exercise,
  MuscleRecoveryEstimate,
} from './types/exercise';

// Plan types
export type {
  PlanType,
  BlockType,
  Intensity,
  ExercisePrescription,
  SubstituteExercise,
  CompletedSet,
  ExerciseFeedback,
  PlannedExercise,
  PlanBlock,
  PlanReason,
  PlanAvoidance,
  PlanRationale,
  AlternativePlan,
  PlanModification,
  RecentWorkoutSummary,
  MuscleRecoveryStatus,
  UserTrainingPreferences,
  PlanInputs,
  PlanGenerationInput,
  DayPlan,
} from './types/plan';

// Health types
export type {
  ReadinessFactor,
  ReadinessScore,
  HRVTrend,
  SimpleTrend,
  DailySignals,
  SubjectiveRatings,
  CheckInFlags,
  CheckInType,
  CheckIn,
  SessionFeedback,
  SessionIssue,
  PreWorkoutCheckIn,
  PostWorkoutCheckIn,
} from './types/health';

// Safety types
export type {
  SafetyAction,
  SafetySeverity,
  SafetyCheckInput,
  SafetyTrigger,
  SafetyCheckResult,
  RedFlag,
  EscalationAction,
  EscalationUI,
  RedFlagCategory,
  CategorizedRedFlag,
} from './types/safety';

// =============================================================================
// Engines
// =============================================================================

// Planning Engine
export {
  PlanningEngine,
  planningEngine,
  type IPlanningEngine,
} from './engines/planning';

// Substitution Engine
export {
  SubstitutionEngine,
  substitutionEngine,
  type ISubstitutionEngine,
  type SubstitutionContext,
  type SubstitutionFactor,
  type SubstitutionScore,
} from './engines/substitution';

// Safety Engine
export {
  SafetyEngine,
  safetyEngine,
  redFlags,
  safetyKeywords,
  type ISafetyEngine,
} from './engines/safety';

// =============================================================================
// Constants
// =============================================================================

// Body regions
export {
  BODY_REGIONS,
  BODY_REGION_LABELS,
  BODY_REGION_GROUPS,
  BODY_REGION_TO_MUSCLES,
  BILATERAL_PAIRS,
} from './constants/regions';

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
} from './constants/patterns';

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
} from './constants/muscles';
