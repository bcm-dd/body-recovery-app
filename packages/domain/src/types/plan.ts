/**
 * Plan Types
 * Defines day plans, plan blocks, and exercise prescriptions
 */

import type { BodyMap, BodyRegionStatus, BodyRegion, MovementConstraint } from './body';
import type { Exercise, Equipment, MuscleGroup, MovementPattern } from './exercise';
import type { DailySignals, CheckIn, ReadinessScore } from './health';

/**
 * Plan type classification
 */
export type PlanType =
  | 'full_workout'
  | 'moderate_workout'
  | 'light_movement'
  | 'mobility_only'
  | 'rehab_focus'
  | 'active_recovery'
  | 'rest_day';

/**
 * Block type within a plan
 */
export type BlockType =
  | 'warmup_general'        // Light cardio, get blood flowing
  | 'warmup_dynamic'        // Dynamic stretches, movement prep
  | 'warmup_specific'       // Movement-specific preparation
  | 'activation'            // Muscle activation drills
  | 'mobility'              // Mobility/flexibility work
  | 'strength_main'         // Primary strength exercises
  | 'strength_accessory'    // Secondary/isolation exercises
  | 'conditioning'          // Cardio/metabolic work
  | 'rehab'                 // Rehabilitation exercises
  | 'prehab'                // Injury prevention exercises
  | 'cooldown'              // Post-workout cooldown
  | 'stretch_static'        // Static stretching
  | 'recovery';             // Recovery modalities (foam rolling, etc.)

/**
 * Intensity levels for blocks and exercises
 */
export type Intensity = 'low' | 'moderate' | 'high' | 'variable';

/**
 * Exercise prescription - how to perform an exercise
 */
export interface ExercisePrescription {
  // Set/rep scheme
  sets: number;
  reps: number | string;               // number or range like "8-12"

  // Loading
  weight?: number;                     // kg or lbs based on user preference
  weightUnit: 'kg' | 'lbs';
  rpe?: number;                        // 1-10 rate of perceived exertion
  percentOf1RM?: number;

  // Tempo (if specified)
  tempo?: {
    eccentric: number;                 // seconds
    bottomPause: number;
    concentric: number;
    topPause: number;
  };

  // Time-based (for holds, cardio, etc.)
  duration?: number;                   // seconds

  // Rest
  restAfter: number;                   // seconds

  // Notes
  notes?: string;
  cues?: string[];                     // Form cues
}

/**
 * Substitute exercise option
 */
export interface SubstituteExercise {
  exerciseId: string;
  reason: string;                      // "No barbell available", "Easier variation"
  prescriptionAdjustment?: Partial<ExercisePrescription>;
  suitabilityScore: number;            // 0-100
}

/**
 * Completed set data
 */
export interface CompletedSet {
  setNumber: number;
  reps: number;
  weight?: number;
  rpe?: number;
  notes?: string;
  timestamp: Date;
}

/**
 * Feedback for a completed exercise
 */
export interface ExerciseFeedback {
  difficulty: 'too_easy' | 'just_right' | 'too_hard';
  painDuring: boolean;
  painLocation?: BodyRegion;
  painLevel?: number;
  formIssues?: string;
  notes?: string;
}

/**
 * An exercise as planned within a block
 */
export interface PlannedExercise {
  id: string;
  blockId: string;
  exerciseId: string;                  // Reference to exercise definition
  order: number;

  // Prescription
  prescription: ExercisePrescription;

  // Why this exercise
  rationale?: string;

  // Alternatives ready if needed
  substitutes: SubstituteExercise[];

  // Execution status
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'substituted';

  // Logged data (filled during workout)
  completedSets?: CompletedSet[];
  feedback?: ExerciseFeedback;
}

/**
 * A block within a plan (warmup, main work, cooldown, etc.)
 */
export interface PlanBlock {
  id: string;
  planId: string;

  // Block identity
  blockType: BlockType;
  name: string;                        // "Dynamic Warmup", "Strength Work", etc.
  order: number;

  // Content
  exercises: PlannedExercise[];

  // Timing
  estimatedDuration: number;           // minutes
  restBetweenExercises?: number;       // seconds

  // Instructions
  instructions?: string;
  intensity: Intensity;

  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;

  // Block-specific rationale
  rationale?: string;
}

/**
 * Reason for a plan decision
 */
export interface PlanReason {
  category: 'readiness' | 'recovery' | 'injury' | 'preference' | 'progression';
  explanation: string;
  impact: 'drove_plan_type' | 'modified_intensity' | 'excluded_exercises' | 'added_exercises';
}

/**
 * Avoidance entry in rationale
 */
export interface PlanAvoidance {
  item: string;                        // Exercise or movement pattern
  reason: string;
}

/**
 * Explanation of why the plan was generated this way
 */
export interface PlanRationale {
  summary: string;                     // 1-2 sentence overview

  // Detailed reasoning
  reasons: PlanReason[];

  // What was avoided and why
  avoidances: PlanAvoidance[];

  // Warnings or notes
  warnings: string[];
}

/**
 * Alternative plan option
 */
export interface AlternativePlan {
  planType: PlanType;
  description: string;
  estimatedDuration: number;
  whyAlternative: string;              // "If you have more time", "If feeling better"
}

/**
 * Modification made to a plan
 */
export interface PlanModification {
  timestamp: Date;
  modificationType: 'swap_exercise' | 'adjust_load' | 'skip_block' | 'add_exercise' | 'reorder';
  originalValue: string;
  newValue: string;
  reason?: string;
  source: 'user' | 'ai' | 'system';
}

/**
 * Recent workout summary for planning context
 */
export interface RecentWorkoutSummary {
  date: Date;
  type: PlanType;
  muscleGroupsWorked: MuscleGroup[];
  totalVolume: number;
  intensity: 'low' | 'moderate' | 'high';
}

/**
 * Muscle recovery status
 */
export interface MuscleRecoveryStatus {
  muscleGroup: MuscleGroup;
  lastWorked: Date;
  hoursSinceLastWorked: number;
  estimatedRecoveryHours: number;
  recoveryPercent: number;             // 0-100
  readyToTrain: boolean;
}

/**
 * User training preferences
 */
export interface UserTrainingPreferences {
  // Schedule
  preferredDays: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  preferredTimeOfDay: 'early_morning' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'flexible';
  typicalSessionLength: number;        // minutes

  // Training style
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  primaryGoal: 'strength' | 'hypertrophy' | 'endurance' | 'general_fitness' | 'rehabilitation' | 'weight_loss';

  // Rep ranges
  preferredRepRange: 'strength' | 'hypertrophy' | 'endurance' | 'mixed';

  // Equipment preferences
  preferredEquipment: Equipment[];
  avoidedEquipment: Equipment[];

  // Exercise preferences
  favoriteExercises: string[];         // Exercise IDs
  dislikedExercises: string[];

  // Specific avoidances (not injury-related)
  avoidedMovements?: MovementPattern[];

  // Progression preferences
  autoProgressWeights: boolean;
  progressionAggressiveness: 'conservative' | 'moderate' | 'aggressive';
  deloadFrequency: 'auto' | 'every_4_weeks' | 'every_6_weeks' | 'manual';

  // Units
  weightUnit: 'kg' | 'lbs';

  // Other
  includeWarmup: boolean;
  includeCooldown: boolean;
  includeRehabInWorkout: boolean;
}

/**
 * Plan generation inputs
 */
export interface PlanInputs {
  readinessScore: number;
  readinessRecommendation: string;
  activeInjuries: string[];            // Injury IDs
  activeConstraints: string[];         // Constraint IDs
  recentWorkouts: RecentWorkoutSummary[];
  muscleRecoveryStatus: Record<MuscleGroup, MuscleRecoveryStatus>;
  userPreferences: UserTrainingPreferences;
  availableEquipment: Equipment[];
  availableTime: number;               // minutes
  checkInData?: CheckIn;
}

/**
 * Input for plan generation
 */
export interface PlanGenerationInput {
  userId: string;
  date: Date;
  dailySignals: DailySignals;
  bodyMap: BodyMap;
  checkIn?: CheckIn;
  userPreferences: UserTrainingPreferences;
  recentWorkouts: RecentWorkoutSummary[];
  availableEquipment: Equipment[];
  availableTime?: number;              // Override typical session length
  requestedFocus?: MuscleGroup[];      // User-requested focus
}

/**
 * Generated daily recovery/workout plan
 */
export interface DayPlan {
  id: string;
  userId: string;
  date: Date;

  // Plan metadata
  status: 'generated' | 'modified' | 'in_progress' | 'completed' | 'skipped' | 'partial';
  generatedAt: Date;
  generatedBy: 'system' | 'ai' | 'user_modified';
  version: number;                     // Increments on modification

  // What drove this plan
  inputs: PlanInputs;

  // The plan itself
  planType: PlanType;
  blocks: PlanBlock[];

  // Timing
  estimatedDuration: number;           // minutes
  actualDuration?: number;
  scheduledTime?: Date;
  startedAt?: Date;
  completedAt?: Date;

  // Rationale
  rationale: PlanRationale;

  // Alternatives offered
  alternatives: AlternativePlan[];

  // Modifications made
  modifications: PlanModification[];
}
