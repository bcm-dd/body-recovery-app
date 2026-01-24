/**
 * Types Index
 * Re-exports all domain types
 */

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
} from './body';

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
} from './exercise';

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
} from './plan';

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
} from './health';

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
} from './safety';
