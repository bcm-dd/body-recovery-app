# Domain Model & Planning Engine Design

## Overview

This document defines the complete domain model and planning engine specifications for the Movement & Recovery Companion app. All logic is rules-based (not ML) to ensure transparency and explainability.

---

## 1. Domain Types (TypeScript Definitions)

### 1.1 Body Map Types

```typescript
/**
 * Anatomical regions for body mapping
 * Hierarchical: major region -> specific area
 */
export type BodyRegion =
  | 'head'
  | 'neck'
  | 'shoulder_left'
  | 'shoulder_right'
  | 'upper_back'
  | 'lower_back'
  | 'chest'
  | 'core'
  | 'hip_left'
  | 'hip_right'
  | 'glute_left'
  | 'glute_right'
  | 'upper_arm_left'
  | 'upper_arm_right'
  | 'elbow_left'
  | 'elbow_right'
  | 'forearm_left'
  | 'forearm_right'
  | 'wrist_left'
  | 'wrist_right'
  | 'hand_left'
  | 'hand_right'
  | 'thigh_front_left'
  | 'thigh_front_right'
  | 'thigh_back_left'
  | 'thigh_back_right'
  | 'knee_left'
  | 'knee_right'
  | 'calf_left'
  | 'calf_right'
  | 'ankle_left'
  | 'ankle_right'
  | 'foot_left'
  | 'foot_right';

/**
 * Pain/sensation severity scale (1-10)
 * Clinical standard: 1-3 mild, 4-6 moderate, 7-10 severe
 */
export type PainLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Type of sensation being reported
 */
export type SensationType =
  | 'pain_sharp'      // Acute, stabbing pain
  | 'pain_dull'       // Aching, throbbing pain
  | 'pain_burning'    // Nerve-related sensation
  | 'tightness'       // Muscular tension
  | 'stiffness'       // Limited mobility feeling
  | 'weakness'        // Reduced strength/stability
  | 'numbness'        // Loss of sensation (RED FLAG)
  | 'tingling'        // Pins and needles (potential RED FLAG)
  | 'clicking'        // Joint sounds
  | 'instability'     // Joint giving way
  | 'swelling'        // Visible/felt inflammation
  | 'good';           // Positive report - area feels fine

/**
 * Injury status lifecycle
 */
export type InjuryStatus =
  | 'acute'           // Fresh injury, needs immediate care
  | 'subacute'        // Healing phase, 2-6 weeks
  | 'chronic'         // Long-term condition, >6 weeks
  | 'recovering'      // Actively improving
  | 'resolved'        // Healed, for historical reference
  | 'flare_up';       // Recurring issue currently active

/**
 * Injury type classification
 */
export type InjuryType =
  | 'muscle_strain'
  | 'muscle_tear'
  | 'tendinopathy'
  | 'tendon_tear'
  | 'ligament_sprain'
  | 'ligament_tear'
  | 'joint_inflammation'
  | 'disc_bulge'
  | 'disc_herniation'
  | 'nerve_impingement'
  | 'fracture'
  | 'post_surgical'
  | 'overuse'
  | 'chronic_condition'
  | 'undiagnosed';    // User-reported, not clinically confirmed

/**
 * A single body region status entry
 */
export interface BodyRegionStatus {
  region: BodyRegion;
  sensation: SensationType;
  level: PainLevel;
  timestamp: Date;
  context?: string;                    // "during squat", "after waking"
  exerciseId?: string;                 // If logged during specific exercise
  workoutId?: string;                  // If logged during workout
}

/**
 * An injury/condition record
 */
export interface Injury {
  id: string;
  userId: string;

  // Location and type
  bodyRegions: BodyRegion[];           // Can affect multiple regions
  injuryType: InjuryType;
  status: InjuryStatus;

  // Details
  description: string;                 // User's description
  clinicalDiagnosis?: string;          // From medical document
  severity: 'mild' | 'moderate' | 'severe';

  // Constraints derived from this injury
  constraints: MovementConstraint[];

  // Timeline
  onsetDate: Date;
  diagnosisDate?: Date;
  expectedRecoveryDate?: Date;
  resolvedDate?: Date;

  // Source
  source: 'user_reported' | 'document_extracted' | 'ai_detected';
  documentIds?: string[];              // Related clinical documents

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  notes: string[];
}

/**
 * Movement constraint derived from injury/condition
 */
export interface MovementConstraint {
  id: string;
  injuryId: string;

  // What to avoid
  constraintType:
    | 'avoid_movement'      // Don't do this at all
    | 'limit_range'         // Partial ROM only
    | 'limit_load'          // Reduce weight
    | 'limit_volume'        // Fewer sets/reps
    | 'limit_frequency'     // Less often
    | 'modify_tempo'        // Slower/controlled
    | 'require_warmup';     // Extended warmup needed

  // Targeting
  movementPatterns?: MovementPattern[];   // e.g., ['hip_hinge', 'spinal_flexion']
  exerciseIds?: string[];                  // Specific exercises
  muscleGroups?: MuscleGroup[];           // Target muscles

  // Specifics
  description: string;                     // Human-readable
  maxLoadPercent?: number;                 // e.g., 50 = max 50% of normal
  maxRangePercent?: number;                // e.g., 75 = 3/4 ROM

  // Duration
  startDate: Date;
  endDate?: Date;                          // null = ongoing

  // Source
  source: 'clinical' | 'user' | 'ai_inferred';
  confidence: number;                      // 0-1
}

/**
 * Complete body model for a user
 */
export interface BodyMap {
  userId: string;

  // Current status snapshot
  currentStatus: BodyRegionStatus[];

  // Active injuries and conditions
  activeInjuries: Injury[];

  // Historical injuries (for pattern detection)
  injuryHistory: Injury[];

  // All active constraints (derived from injuries)
  activeConstraints: MovementConstraint[];

  // Baseline data
  mobilityBaselines?: Record<BodyRegion, MobilityBaseline>;
  strengthBaselines?: Record<MuscleGroup, StrengthBaseline>;

  // Metadata
  lastUpdated: Date;
  lastFullAssessment?: Date;
}

export interface MobilityBaseline {
  region: BodyRegion;
  normalRom: number;          // degrees or percentage
  currentRom: number;
  assessedAt: Date;
}

export interface StrengthBaseline {
  muscleGroup: MuscleGroup;
  estimatedOneRepMax?: number;
  lastTestedWeight: number;
  lastTestedReps: number;
  assessedAt: Date;
}
```

### 1.2 Check-In Types

```typescript
/**
 * Daily/session check-in data structure
 */
export interface CheckIn {
  id: string;
  userId: string;
  timestamp: Date;
  type: 'morning' | 'pre_workout' | 'post_workout' | 'evening' | 'ad_hoc';

  // Subjective ratings (1-10 scale)
  subjective: {
    energyLevel?: number;           // How energized do you feel?
    motivation?: number;            // How motivated to train?
    stress?: number;                // Mental/life stress level
    sleepQuality?: number;          // How well did you sleep? (if not from device)
    muscleSoreness?: number;        // Overall DOMS level
    mood?: number;                  // General mood
  };

  // Body status updates
  bodyUpdates: BodyRegionStatus[];

  // Quick flags
  flags: {
    feelingIll: boolean;
    newPainOrInjury: boolean;
    unusualFatigue: boolean;
    menstrualPhase?: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
    poorSleep: boolean;
    highStress: boolean;
    travelOrJetlag: boolean;
  };

  // Free-form notes
  notes?: string;

  // Context
  workoutId?: string;              // If pre/post workout
  location?: string;
}

/**
 * Pre-workout specific check-in
 */
export interface PreWorkoutCheckIn extends CheckIn {
  type: 'pre_workout';

  // Equipment availability
  availableEquipment?: Equipment[];

  // Time constraints
  availableTime?: number;          // minutes

  // Any areas to avoid today
  areasToAvoid?: BodyRegion[];

  // Preference for today
  sessionPreference?: 'full' | 'moderate' | 'light' | 'skip';
}

/**
 * Post-workout specific check-in
 */
export interface PostWorkoutCheckIn extends CheckIn {
  type: 'post_workout';
  workoutId: string;

  // Session feedback
  sessionFeedback: {
    overallDifficulty: 'too_easy' | 'just_right' | 'too_hard';
    energyAfter: 'energized' | 'neutral' | 'drained';
    enjoyment: 1 | 2 | 3 | 4 | 5;
  };

  // Any issues during session
  issuesDuring: {
    exerciseId: string;
    issue: 'pain' | 'form_breakdown' | 'equipment_issue' | 'too_heavy' | 'other';
    notes?: string;
  }[];
}
```

### 1.3 Daily Signals Types

```typescript
/**
 * Health data signals from device integration
 */
export interface DailySignals {
  userId: string;
  date: Date;                        // Date these signals represent
  fetchedAt: Date;                   // When data was retrieved

  // Sleep data
  sleep: {
    available: boolean;
    duration?: number;               // hours
    quality?: number;                // 0-100 score
    deepSleepMinutes?: number;
    remSleepMinutes?: number;
    lightSleepMinutes?: number;
    awakeMinutes?: number;
    sleepEfficiency?: number;        // 0-100
    bedtime?: Date;
    wakeTime?: Date;
    respiratoryRate?: number;        // breaths per minute
  };

  // Heart rate variability
  hrv: {
    available: boolean;
    current?: number;                // ms (SDNN or RMSSD)
    method?: 'sdnn' | 'rmssd';
    baseline7Day?: number;           // 7-day rolling average
    baseline30Day?: number;          // 30-day rolling average
    trend: 'significantly_up' | 'up' | 'stable' | 'down' | 'significantly_down';
    percentFromBaseline?: number;    // e.g., -15 means 15% below baseline
  };

  // Resting heart rate
  restingHR: {
    available: boolean;
    current?: number;                // bpm
    baseline7Day?: number;
    trend: 'up' | 'stable' | 'down';
    percentFromBaseline?: number;
  };

  // Activity data
  activity: {
    available: boolean;
    steps?: number;
    activeMinutes?: number;
    activeCalories?: number;
    standingHours?: number;
    flightsClimbed?: number;
    distanceKm?: number;
  };

  // Recent training load
  trainingLoad: {
    last24Hours: number;             // Arbitrary load units
    last48Hours: number;
    last7Days: number;
    acuteLoad: number;               // Last 7 days average
    chronicLoad: number;             // Last 28 days average
    acuteChronicRatio: number;       // ACWR - injury risk indicator
  };

  // Mobility/gait data (if available from Apple Watch etc.)
  mobility?: {
    walkingAsymmetry?: number;       // percentage
    strideLength?: number;           // meters
    walkingSpeed?: number;           // m/s
    stairSpeed?: number;             // floors/minute
  };

  // Cycle tracking (if enabled and available)
  cycleData?: {
    currentPhase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
    dayInCycle: number;
    predictedNextPeriod?: Date;
  };

  // Computed readiness
  readiness: ReadinessScore;
}

/**
 * Computed readiness assessment
 */
export interface ReadinessScore {
  overall: number;                   // 0-100

  // Component scores (each 0-100)
  components: {
    sleep: number;
    recovery: number;                // HRV-based
    fatigue: number;                 // Training load based
    body: number;                    // Injury/pain based
  };

  // Recommendation
  recommendation: 'full_intensity' | 'moderate' | 'light' | 'active_recovery' | 'rest';

  // Factors that influenced the score
  factors: ReadinessFactor[];

  // Human-readable summary
  summary: string;
}

export interface ReadinessFactor {
  type: 'positive' | 'negative' | 'neutral';
  category: 'sleep' | 'hrv' | 'training_load' | 'body' | 'subjective';
  description: string;
  impact: 'high' | 'medium' | 'low';
  dataPoint?: string;                // e.g., "HRV: 45ms (-12% from baseline)"
}
```

### 1.4 Day Plan Types

```typescript
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
  version: number;                   // Increments on modification

  // What drove this plan
  inputs: PlanInputs;

  // The plan itself
  planType: PlanType;
  blocks: PlanBlock[];

  // Timing
  estimatedDuration: number;         // minutes
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

export type PlanType =
  | 'full_workout'
  | 'moderate_workout'
  | 'light_movement'
  | 'mobility_only'
  | 'rehab_focus'
  | 'active_recovery'
  | 'rest_day';

export interface PlanInputs {
  readinessScore: number;
  readinessRecommendation: string;
  activeInjuries: string[];          // Injury IDs
  activeConstraints: string[];       // Constraint IDs
  recentWorkouts: RecentWorkoutSummary[];
  muscleRecoveryStatus: Record<MuscleGroup, MuscleRecoveryStatus>;
  userPreferences: UserTrainingPreferences;
  availableEquipment: Equipment[];
  availableTime: number;             // minutes
  checkInData?: CheckIn;
}

export interface RecentWorkoutSummary {
  date: Date;
  type: PlanType;
  muscleGroupsWorked: MuscleGroup[];
  totalVolume: number;
  intensity: 'low' | 'moderate' | 'high';
}

export interface MuscleRecoveryStatus {
  muscleGroup: MuscleGroup;
  lastWorked: Date;
  hoursSinceLastWorked: number;
  estimatedRecoveryHours: number;
  recoveryPercent: number;           // 0-100
  readyToTrain: boolean;
}

/**
 * Explanation of why the plan was generated this way
 */
export interface PlanRationale {
  summary: string;                   // 1-2 sentence overview

  // Detailed reasoning
  reasons: {
    category: 'readiness' | 'recovery' | 'injury' | 'preference' | 'progression';
    explanation: string;
    impact: 'drove_plan_type' | 'modified_intensity' | 'excluded_exercises' | 'added_exercises';
  }[];

  // What was avoided and why
  avoidances: {
    item: string;                    // Exercise or movement pattern
    reason: string;
  }[];

  // Warnings or notes
  warnings: string[];
}

export interface AlternativePlan {
  planType: PlanType;
  description: string;
  estimatedDuration: number;
  whyAlternative: string;            // "If you have more time", "If feeling better"
}

export interface PlanModification {
  timestamp: Date;
  modificationType: 'swap_exercise' | 'adjust_load' | 'skip_block' | 'add_exercise' | 'reorder';
  originalValue: string;
  newValue: string;
  reason?: string;
  source: 'user' | 'ai' | 'system';
}
```

### 1.5 Plan Block Types

```typescript
/**
 * A block within a plan (warmup, main work, cooldown, etc.)
 */
export interface PlanBlock {
  id: string;
  planId: string;

  // Block identity
  blockType: BlockType;
  name: string;                      // "Dynamic Warmup", "Strength Work", etc.
  order: number;

  // Content
  exercises: PlannedExercise[];

  // Timing
  estimatedDuration: number;         // minutes
  restBetweenExercises?: number;     // seconds

  // Instructions
  instructions?: string;
  intensity: 'low' | 'moderate' | 'high' | 'variable';

  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;

  // Block-specific rationale
  rationale?: string;
}

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
 * An exercise as planned within a block
 */
export interface PlannedExercise {
  id: string;
  blockId: string;
  exerciseId: string;                // Reference to exercise definition
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

export interface ExercisePrescription {
  // Set/rep scheme
  sets: number;
  reps: number | string;             // number or range like "8-12"

  // Loading
  weight?: number;                   // kg or lbs based on user preference
  weightUnit: 'kg' | 'lbs';
  rpe?: number;                      // 1-10 rate of perceived exertion
  percentOf1RM?: number;

  // Tempo (if specified)
  tempo?: {
    eccentric: number;               // seconds
    bottomPause: number;
    concentric: number;
    topPause: number;
  };

  // Time-based (for holds, cardio, etc.)
  duration?: number;                 // seconds

  // Rest
  restAfter: number;                 // seconds

  // Notes
  notes?: string;
  cues?: string[];                   // Form cues
}

export interface SubstituteExercise {
  exerciseId: string;
  reason: string;                    // "No barbell available", "Easier variation"
  prescriptionAdjustment?: Partial<ExercisePrescription>;
  suitabilityScore: number;          // 0-100
}

export interface CompletedSet {
  setNumber: number;
  reps: number;
  weight?: number;
  rpe?: number;
  notes?: string;
  timestamp: Date;
}

export interface ExerciseFeedback {
  difficulty: 'too_easy' | 'just_right' | 'too_hard';
  painDuring: boolean;
  painLocation?: BodyRegion;
  painLevel?: PainLevel;
  formIssues?: string;
  notes?: string;
}
```

### 1.6 Exercise Definition Types

```typescript
/**
 * Complete exercise definition with all metadata
 */
export interface Exercise {
  id: string;
  name: string;
  alternateNames?: string[];         // Other common names

  // Categorization
  category: ExerciseCategory;
  subcategory?: string;

  // Muscles
  musclesPrimary: MuscleGroup[];
  musclesSecondary: MuscleGroup[];

  // Movement characteristics
  movementPattern: MovementPattern;
  jointActions: JointAction[];
  plane: MovementPlane[];

  // Loading characteristics
  loadingType: LoadingType[];
  forceVector: ForceVector;

  // Equipment
  equipmentRequired: Equipment[];
  equipmentOptional?: Equipment[];

  // Difficulty and progression
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  complexity: 1 | 2 | 3 | 4 | 5;     // Technical complexity

  // Relationships
  progressions: {
    easier: string[];                // Exercise IDs
    harder: string[];
  };
  substitutes: string[];             // Equivalent exercise IDs

  // Safety
  contraindications: Contraindication[];
  commonMistakes: string[];

  // Instructional
  description: string;
  setupInstructions: string[];
  executionCues: string[];
  breathingPattern?: string;

  // Media
  videoUrl?: string;
  thumbnailUrl?: string;

  // Metadata
  isCompound: boolean;
  isUnilateral: boolean;
  requiresSpotter: boolean;
  homeGymFriendly: boolean;

  // Default prescription ranges
  defaultPrescription: {
    beginner: { sets: number; reps: string; restSeconds: number };
    intermediate: { sets: number; reps: string; restSeconds: number };
    advanced: { sets: number; reps: string; restSeconds: number };
  };
}

export type ExerciseCategory =
  | 'strength'
  | 'mobility'
  | 'stability'
  | 'power'
  | 'cardio'
  | 'flexibility'
  | 'rehabilitation'
  | 'warmup'
  | 'cooldown';

export type MovementPattern =
  | 'squat'
  | 'hip_hinge'
  | 'lunge'
  | 'push_horizontal'
  | 'push_vertical'
  | 'pull_horizontal'
  | 'pull_vertical'
  | 'carry'
  | 'rotation'
  | 'anti_rotation'
  | 'flexion'
  | 'extension'
  | 'lateral'
  | 'gait'
  | 'isometric';

export type MuscleGroup =
  | 'chest'
  | 'upper_back'
  | 'lats'
  | 'shoulders_front'
  | 'shoulders_side'
  | 'shoulders_rear'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core_front'
  | 'core_obliques'
  | 'lower_back'
  | 'glutes'
  | 'hip_flexors'
  | 'quads'
  | 'hamstrings'
  | 'adductors'
  | 'abductors'
  | 'calves'
  | 'neck';

export type JointAction =
  | 'shoulder_flexion'
  | 'shoulder_extension'
  | 'shoulder_abduction'
  | 'shoulder_adduction'
  | 'shoulder_internal_rotation'
  | 'shoulder_external_rotation'
  | 'elbow_flexion'
  | 'elbow_extension'
  | 'wrist_flexion'
  | 'wrist_extension'
  | 'spinal_flexion'
  | 'spinal_extension'
  | 'spinal_rotation'
  | 'spinal_lateral_flexion'
  | 'hip_flexion'
  | 'hip_extension'
  | 'hip_abduction'
  | 'hip_adduction'
  | 'hip_internal_rotation'
  | 'hip_external_rotation'
  | 'knee_flexion'
  | 'knee_extension'
  | 'ankle_dorsiflexion'
  | 'ankle_plantarflexion';

export type MovementPlane = 'sagittal' | 'frontal' | 'transverse';

export type LoadingType =
  | 'axial'              // Load through spine (squats, deadlifts)
  | 'anterior'           // Load in front (front squats, goblet)
  | 'posterior'          // Load behind
  | 'unilateral'         // Single side
  | 'bilateral'          // Both sides
  | 'bodyweight'
  | 'resistance_band'
  | 'cable'
  | 'free_weight'
  | 'machine';

export type ForceVector = 'vertical' | 'horizontal' | 'diagonal' | 'rotational';

export type Equipment =
  | 'none'
  | 'barbell'
  | 'dumbbell'
  | 'kettlebell'
  | 'cable_machine'
  | 'smith_machine'
  | 'leg_press'
  | 'lat_pulldown'
  | 'cable_row'
  | 'chest_press_machine'
  | 'shoulder_press_machine'
  | 'leg_extension'
  | 'leg_curl'
  | 'hack_squat'
  | 'pull_up_bar'
  | 'dip_station'
  | 'bench_flat'
  | 'bench_incline'
  | 'bench_decline'
  | 'squat_rack'
  | 'resistance_band'
  | 'foam_roller'
  | 'yoga_mat'
  | 'stability_ball'
  | 'medicine_ball'
  | 'battle_ropes'
  | 'trx'
  | 'box'
  | 'sled';

/**
 * Contraindication linking exercise to conditions/injuries
 */
export interface Contraindication {
  condition: string;                 // e.g., "shoulder_impingement", "disc_herniation"
  severity: 'absolute' | 'relative'; // absolute = never do, relative = caution
  reason: string;
  modification?: string;             // How to modify if relative
  alternativeExerciseIds?: string[];
}
```

### 1.7 User Preferences Types

```typescript
/**
 * User training preferences
 */
export interface UserTrainingPreferences {
  // Schedule
  preferredDays: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  preferredTimeOfDay: 'early_morning' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'flexible';
  typicalSessionLength: number;      // minutes

  // Training style
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  primaryGoal: 'strength' | 'hypertrophy' | 'endurance' | 'general_fitness' | 'rehabilitation' | 'weight_loss';

  // Rep ranges
  preferredRepRange: 'strength' | 'hypertrophy' | 'endurance' | 'mixed';

  // Equipment preferences
  preferredEquipment: Equipment[];
  avoidedEquipment: Equipment[];

  // Exercise preferences
  favoriteExercises: string[];       // Exercise IDs
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
```

---

## 2. Rules-Based Planning Logic

### 2.1 Planning Engine Overview

```typescript
/**
 * Main planning engine interface
 */
export interface PlanningEngine {
  generateDayPlan(input: PlanGenerationInput): Promise<DayPlan>;
  modifyPlan(planId: string, modification: PlanModificationRequest): Promise<DayPlan>;
  getAlternatives(planId: string): AlternativePlan[];
  explainPlan(planId: string): PlanRationale;
}

export interface PlanGenerationInput {
  userId: string;
  date: Date;
  dailySignals: DailySignals;
  bodyMap: BodyMap;
  checkIn?: CheckIn;
  userPreferences: UserTrainingPreferences;
  recentWorkouts: RecentWorkoutSummary[];
  availableEquipment: Equipment[];
  availableTime?: number;            // Override typical session length
  requestedFocus?: MuscleGroup[];    // User-requested focus
}
```

### 2.2 Planning Rules

#### 2.2.1 Readiness-Based Plan Type Selection

```typescript
/**
 * RULE SET: Determine plan type based on readiness score
 */
const PLAN_TYPE_RULES: PlanTypeRule[] = [
  {
    id: 'readiness_excellent',
    condition: (input) => input.dailySignals.readiness.overall >= 85,
    result: 'full_workout',
    rationale: 'Readiness score is excellent - you are well recovered and ready for a full session'
  },
  {
    id: 'readiness_good',
    condition: (input) => input.dailySignals.readiness.overall >= 70,
    result: 'full_workout',
    rationale: 'Readiness score is good - proceeding with planned workout'
  },
  {
    id: 'readiness_moderate',
    condition: (input) => input.dailySignals.readiness.overall >= 50,
    result: 'moderate_workout',
    rationale: 'Readiness is moderate - reducing intensity to match recovery status'
  },
  {
    id: 'readiness_low',
    condition: (input) => input.dailySignals.readiness.overall >= 35,
    result: 'light_movement',
    rationale: 'Readiness is below optimal - suggesting light movement to aid recovery'
  },
  {
    id: 'readiness_very_low',
    condition: (input) => input.dailySignals.readiness.overall < 35,
    result: 'rest_day',
    rationale: 'Readiness is very low - rest day recommended for recovery'
  }
];
```

#### 2.2.2 Sleep-Based Modifications

```typescript
/**
 * RULE SET: Modify plan based on sleep quality/duration
 */
const SLEEP_RULES: SleepRule[] = [
  {
    id: 'sleep_severely_deprived',
    condition: (signals) => signals.sleep.duration !== undefined && signals.sleep.duration < 5,
    modification: {
      maxIntensity: 'moderate',
      volumeMultiplier: 0.6,
      addBlock: 'warmup_extended',
      removeBlock: 'conditioning'
    },
    rationale: 'Less than 5 hours of sleep significantly impairs recovery and coordination - reducing intensity and volume'
  },
  {
    id: 'sleep_deprived',
    condition: (signals) => signals.sleep.duration !== undefined && signals.sleep.duration < 6,
    modification: {
      maxIntensity: 'moderate',
      volumeMultiplier: 0.75
    },
    rationale: 'Less than 6 hours of sleep - moderating session to prevent overreaching'
  },
  {
    id: 'sleep_poor_quality',
    condition: (signals) => signals.sleep.quality !== undefined && signals.sleep.quality < 50,
    modification: {
      maxIntensity: 'moderate',
      volumeMultiplier: 0.8
    },
    rationale: 'Sleep quality was poor - adjusting intensity accordingly'
  },
  {
    id: 'sleep_excellent',
    condition: (signals) =>
      signals.sleep.duration !== undefined && signals.sleep.duration >= 8 &&
      signals.sleep.quality !== undefined && signals.sleep.quality >= 80,
    modification: {
      allowIntensityIncrease: true
    },
    rationale: 'Excellent sleep - you may be able to push harder today if you feel ready'
  }
];
```

#### 2.2.3 HRV-Based Modifications

```typescript
/**
 * RULE SET: Modify plan based on HRV trends
 */
const HRV_RULES: HRVRule[] = [
  {
    id: 'hrv_significantly_below_baseline',
    condition: (signals) =>
      signals.hrv.percentFromBaseline !== undefined &&
      signals.hrv.percentFromBaseline < -20,
    modification: {
      maxPlanType: 'light_movement',
      volumeMultiplier: 0.5,
      addWarning: 'HRV is significantly below your baseline - your body may be fighting something or under stress'
    },
    rationale: 'HRV more than 20% below baseline indicates significant physiological stress'
  },
  {
    id: 'hrv_below_baseline',
    condition: (signals) =>
      signals.hrv.percentFromBaseline !== undefined &&
      signals.hrv.percentFromBaseline < -10,
    modification: {
      maxIntensity: 'moderate',
      volumeMultiplier: 0.75
    },
    rationale: 'HRV below baseline suggests incomplete recovery - reducing load'
  },
  {
    id: 'hrv_trending_down',
    condition: (signals) => signals.hrv.trend === 'significantly_down',
    modification: {
      suggestDeload: true,
      addWarning: 'HRV has been trending down - consider a lighter week'
    },
    rationale: 'Downward HRV trend may indicate accumulated fatigue'
  },
  {
    id: 'hrv_above_baseline',
    condition: (signals) =>
      signals.hrv.percentFromBaseline !== undefined &&
      signals.hrv.percentFromBaseline > 10,
    modification: {
      allowIntensityIncrease: true
    },
    rationale: 'HRV above baseline indicates good recovery state'
  }
];
```

#### 2.2.4 Pain/Injury-Based Rules

```typescript
/**
 * RULE SET: Handle pain levels and injuries
 * These rules take precedence over readiness-based rules
 */
const PAIN_RULES: PainRule[] = [
  {
    id: 'severe_pain_reported',
    condition: (input) =>
      input.bodyMap.currentStatus.some(s =>
        s.level >= 7 &&
        ['pain_sharp', 'pain_dull', 'pain_burning'].includes(s.sensation)
      ),
    modification: {
      avoidRegions: (input) => input.bodyMap.currentStatus
        .filter(s => s.level >= 7)
        .map(s => s.region),
      maxPlanType: 'light_movement',
      addWarning: 'Significant pain reported - avoiding affected areas and reducing overall intensity'
    },
    rationale: 'Pain level 7+ requires caution - training around the affected area only'
  },
  {
    id: 'moderate_pain_reported',
    condition: (input) =>
      input.bodyMap.currentStatus.some(s =>
        s.level >= 4 && s.level < 7 &&
        ['pain_sharp', 'pain_dull'].includes(s.sensation)
      ),
    modification: {
      avoidRegions: (input) => input.bodyMap.currentStatus
        .filter(s => s.level >= 4 && s.level < 7)
        .map(s => s.region),
      reduceLoadForRegions: true
    },
    rationale: 'Moderate pain reported - modifying exercises for affected areas'
  },
  {
    id: 'acute_injury_present',
    condition: (input) =>
      input.bodyMap.activeInjuries.some(i => i.status === 'acute'),
    modification: {
      respectConstraints: true,
      maxIntensity: 'moderate',
      addRehabBlock: true,
      addWarning: 'Acute injury present - following constraints and including rehabilitation work'
    },
    rationale: 'Acute injury requires careful management - following medical constraints'
  },
  {
    id: 'numbness_or_tingling',
    condition: (input) =>
      input.bodyMap.currentStatus.some(s =>
        ['numbness', 'tingling'].includes(s.sensation)
      ),
    modification: {
      maxPlanType: 'mobility_only',
      addSafetyFlag: true,
      requireAcknowledgment: true
    },
    rationale: 'Numbness or tingling reported - this may indicate nerve involvement. Gentle mobility only until this resolves.'
  }
];
```

#### 2.2.5 Training Load Rules

```typescript
/**
 * RULE SET: Manage training load and prevent overreaching
 */
const LOAD_RULES: LoadRule[] = [
  {
    id: 'acwr_high_risk',
    condition: (signals) => signals.trainingLoad.acuteChronicRatio > 1.5,
    modification: {
      maxPlanType: 'light_movement',
      volumeMultiplier: 0.5,
      addWarning: 'Training load has spiked - high injury risk. Reducing volume significantly.'
    },
    rationale: 'Acute:Chronic workload ratio above 1.5 indicates high injury risk'
  },
  {
    id: 'acwr_moderate_risk',
    condition: (signals) => signals.trainingLoad.acuteChronicRatio > 1.3,
    modification: {
      volumeMultiplier: 0.7,
      addWarning: 'Training load increasing rapidly - moderating today\'s session'
    },
    rationale: 'Acute:Chronic workload ratio elevated - managing load to reduce injury risk'
  },
  {
    id: 'acwr_optimal',
    condition: (signals) =>
      signals.trainingLoad.acuteChronicRatio >= 0.8 &&
      signals.trainingLoad.acuteChronicRatio <= 1.3,
    modification: {
      // No modification needed
    },
    rationale: 'Training load is in optimal range'
  },
  {
    id: 'acwr_undertrained',
    condition: (signals) => signals.trainingLoad.acuteChronicRatio < 0.8,
    modification: {
      allowProgressiveOverload: true,
      suggestVolumeIncrease: true
    },
    rationale: 'Training load has been lower than usual - safe to progress'
  },
  {
    id: 'consecutive_hard_days',
    condition: (input) => {
      const lastThree = input.recentWorkouts.slice(0, 3);
      return lastThree.filter(w => w.intensity === 'high').length >= 2;
    },
    modification: {
      maxIntensity: 'moderate',
      suggestActiveRecovery: true
    },
    rationale: 'Multiple high-intensity sessions recently - moderating today for recovery'
  }
];
```

#### 2.2.6 Muscle Recovery Rules

```typescript
/**
 * RULE SET: Ensure adequate muscle group recovery
 */
const MUSCLE_RECOVERY_RULES: MuscleRecoveryRule[] = [
  {
    id: 'muscle_not_recovered',
    condition: (muscleStatus) => muscleStatus.recoveryPercent < 70,
    modification: {
      excludeMuscleGroup: true,
      suggestAlternate: true
    },
    rationale: (muscle) => `${muscle} is still recovering (${muscleStatus.recoveryPercent}%) - training other areas today`
  },
  {
    id: 'muscle_partially_recovered',
    condition: (muscleStatus) =>
      muscleStatus.recoveryPercent >= 70 && muscleStatus.recoveryPercent < 90,
    modification: {
      reduceVolume: 0.7,
      reduceIntensity: true
    },
    rationale: (muscle) => `${muscle} is partially recovered - reducing volume`
  },
  {
    id: 'muscle_fully_recovered',
    condition: (muscleStatus) => muscleStatus.recoveryPercent >= 90,
    modification: {
      // Full volume and intensity allowed
    },
    rationale: (muscle) => `${muscle} is fully recovered and ready to train`
  },
  {
    id: 'muscle_overdue',
    condition: (muscleStatus) => muscleStatus.hoursSinceLastWorked > 168, // 7 days
    modification: {
      prioritizeInPlan: true
    },
    rationale: (muscle) => `${muscle} hasn't been trained in over a week - prioritizing today`
  }
];

/**
 * Muscle recovery time estimates (hours)
 */
const MUSCLE_RECOVERY_ESTIMATES: Record<MuscleGroup, { light: number; moderate: number; heavy: number }> = {
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
  neck: { light: 24, moderate: 36, heavy: 48 }
};
```

### 2.3 Plan Generation Algorithm

```typescript
/**
 * Main plan generation algorithm
 */
async function generateDayPlan(input: PlanGenerationInput): Promise<DayPlan> {
  const rationale: PlanRationale = {
    summary: '',
    reasons: [],
    avoidances: [],
    warnings: []
  };

  // Step 1: Determine base plan type from readiness
  let planType = determinePlanType(input, rationale);

  // Step 2: Apply sleep modifications
  planType = applySleepRules(input.dailySignals, planType, rationale);

  // Step 3: Apply HRV modifications
  planType = applyHRVRules(input.dailySignals, planType, rationale);

  // Step 4: Apply pain/injury rules (can override everything)
  planType = applyPainRules(input, planType, rationale);

  // Step 5: Apply training load rules
  const loadModifiers = applyLoadRules(input, rationale);

  // Step 6: Calculate muscle recovery status
  const muscleStatus = calculateMuscleRecovery(input.recentWorkouts);

  // Step 7: Determine available muscles based on recovery
  const availableMuscles = getAvailableMuscles(muscleStatus, rationale);

  // Step 8: Get constraint-filtered exercise pool
  const exercisePool = filterExercisesByConstraints(
    input.bodyMap.activeConstraints,
    input.availableEquipment,
    rationale
  );

  // Step 9: Select exercises based on plan type and available muscles
  const selectedExercises = selectExercises(
    planType,
    availableMuscles,
    exercisePool,
    input.userPreferences,
    rationale
  );

  // Step 10: Build blocks
  const blocks = buildPlanBlocks(
    planType,
    selectedExercises,
    input.userPreferences,
    loadModifiers
  );

  // Step 11: Generate prescriptions
  for (const block of blocks) {
    for (const exercise of block.exercises) {
      exercise.prescription = generatePrescription(
        exercise.exerciseId,
        input.userPreferences,
        muscleStatus,
        loadModifiers,
        input.dailySignals.readiness.overall
      );
    }
  }

  // Step 12: Add substitutes for each exercise
  for (const block of blocks) {
    for (const exercise of block.exercises) {
      exercise.substitutes = findSubstitutes(
        exercise.exerciseId,
        exercisePool,
        input.availableEquipment,
        input.bodyMap.activeConstraints
      );
    }
  }

  // Step 13: Generate rationale summary
  rationale.summary = generateRationaleSummary(planType, rationale);

  // Step 14: Generate alternatives
  const alternatives = generateAlternatives(input, planType);

  return {
    id: generateId(),
    userId: input.userId,
    date: input.date,
    status: 'generated',
    generatedAt: new Date(),
    generatedBy: 'system',
    version: 1,
    inputs: extractInputsSummary(input),
    planType,
    blocks,
    estimatedDuration: calculateTotalDuration(blocks),
    rationale,
    alternatives,
    modifications: []
  };
}
```

### 2.4 Rationale Generation

```typescript
/**
 * Generate human-readable rationale for the plan
 */
function generateRationaleSummary(planType: PlanType, rationale: PlanRationale): string {
  const parts: string[] = [];

  // Lead with the plan type decision
  switch (planType) {
    case 'full_workout':
      parts.push('Your recovery signals look good.');
      break;
    case 'moderate_workout':
      parts.push('Recovery signals suggest a moderate session today.');
      break;
    case 'light_movement':
      parts.push('Your body could use a lighter day.');
      break;
    case 'mobility_only':
      parts.push('Focusing on mobility work today.');
      break;
    case 'rehab_focus':
      parts.push('Prioritizing rehabilitation exercises today.');
      break;
    case 'active_recovery':
      parts.push('Active recovery day - gentle movement to aid recovery.');
      break;
    case 'rest_day':
      parts.push('Rest day recommended - recovery is essential for progress.');
      break;
  }

  // Add key factors
  const highImpactReasons = rationale.reasons.filter(r =>
    r.impact === 'drove_plan_type'
  );

  if (highImpactReasons.length > 0) {
    parts.push(highImpactReasons[0].explanation);
  }

  // Add any warnings
  if (rationale.warnings.length > 0) {
    parts.push(rationale.warnings[0]);
  }

  return parts.join(' ');
}

/**
 * Examples of generated rationale:
 *
 * "Your recovery signals look good. HRV is above baseline and you slept well."
 *
 * "Recovery signals suggest a moderate session today. Sleep was under 6 hours -
 *  reducing intensity to match recovery capacity."
 *
 * "Your body could use a lighter day. HRV is 15% below baseline and you've had
 *  two hard sessions in a row."
 *
 * "Focusing on mobility work today. You reported significant knee pain -
 *  training around this area with gentle movement."
 */
```

---

## 3. Substitution Engine Strategy

### 3.1 Substitution Scoring Model

```typescript
/**
 * Calculate substitution suitability score (0-100)
 */
function calculateSubstitutionScore(
  original: Exercise,
  candidate: Exercise,
  context: SubstitutionContext
): SubstitutionScore {
  let score = 0;
  const factors: SubstitutionFactor[] = [];

  // Factor 1: Primary muscle match (40 points max)
  const muscleOverlap = calculateMuscleOverlap(
    original.musclesPrimary,
    candidate.musclesPrimary
  );
  const muscleScore = muscleOverlap * 40;
  score += muscleScore;
  factors.push({
    name: 'muscle_match',
    score: muscleScore,
    maxScore: 40,
    explanation: `Targets ${Math.round(muscleOverlap * 100)}% of the same primary muscles`
  });

  // Factor 2: Movement pattern match (25 points max)
  const patternMatch = original.movementPattern === candidate.movementPattern;
  const patternScore = patternMatch ? 25 :
    areSimilarPatterns(original.movementPattern, candidate.movementPattern) ? 15 : 0;
  score += patternScore;
  factors.push({
    name: 'movement_pattern',
    score: patternScore,
    maxScore: 25,
    explanation: patternMatch ?
      'Same movement pattern' :
      patternScore > 0 ? 'Similar movement pattern' : 'Different movement pattern'
  });

  // Factor 3: Equipment availability (15 points max)
  const equipmentAvailable = candidate.equipmentRequired.every(
    e => context.availableEquipment.includes(e)
  );
  const equipmentScore = equipmentAvailable ? 15 : 0;
  score += equipmentScore;
  factors.push({
    name: 'equipment',
    score: equipmentScore,
    maxScore: 15,
    explanation: equipmentAvailable ?
      'Equipment available' : 'Required equipment not available'
  });

  // Factor 4: Difficulty match (10 points max)
  const difficultyDiff = Math.abs(
    ['beginner', 'intermediate', 'advanced', 'expert'].indexOf(original.skillLevel) -
    ['beginner', 'intermediate', 'advanced', 'expert'].indexOf(candidate.skillLevel)
  );
  const difficultyScore = Math.max(0, 10 - (difficultyDiff * 4));
  score += difficultyScore;
  factors.push({
    name: 'difficulty',
    score: difficultyScore,
    maxScore: 10,
    explanation: difficultyDiff === 0 ?
      'Same difficulty level' :
      `${difficultyDiff > 0 ? 'Easier' : 'Harder'} than original`
  });

  // Factor 5: Joint action similarity (10 points max)
  const jointOverlap = calculateJointOverlap(
    original.jointActions,
    candidate.jointActions
  );
  const jointScore = jointOverlap * 10;
  score += jointScore;
  factors.push({
    name: 'joint_actions',
    score: jointScore,
    maxScore: 10,
    explanation: `Uses ${Math.round(jointOverlap * 100)}% of the same joint actions`
  });

  // Penalties

  // Penalty: Constraint violation (-100, eliminates candidate)
  const violatesConstraint = context.constraints.some(c =>
    exerciseViolatesConstraint(candidate, c)
  );
  if (violatesConstraint) {
    score = -100;
    factors.push({
      name: 'constraint_violation',
      score: -100,
      maxScore: 0,
      explanation: 'Violates an active movement constraint'
    });
  }

  // Penalty: User dislikes exercise (-20)
  if (context.userPreferences.dislikedExercises.includes(candidate.id)) {
    score -= 20;
    factors.push({
      name: 'user_dislike',
      score: -20,
      maxScore: 0,
      explanation: 'This exercise is on your dislike list'
    });
  }

  // Bonus: User favorites (+10)
  if (context.userPreferences.favoriteExercises.includes(candidate.id)) {
    score += 10;
    factors.push({
      name: 'user_favorite',
      score: 10,
      maxScore: 10,
      explanation: 'This is one of your favorite exercises'
    });
  }

  // Bonus: Listed as direct substitute in exercise definition (+15)
  if (original.substitutes.includes(candidate.id)) {
    score += 15;
    factors.push({
      name: 'direct_substitute',
      score: 15,
      maxScore: 15,
      explanation: 'Recognized as a direct substitute'
    });
  }

  return {
    candidateId: candidate.id,
    candidateName: candidate.name,
    totalScore: Math.max(0, Math.min(100, score)),
    factors,
    isViable: score > 0 && !violatesConstraint
  };
}

interface SubstitutionScore {
  candidateId: string;
  candidateName: string;
  totalScore: number;
  factors: SubstitutionFactor[];
  isViable: boolean;
}

interface SubstitutionFactor {
  name: string;
  score: number;
  maxScore: number;
  explanation: string;
}

interface SubstitutionContext {
  availableEquipment: Equipment[];
  constraints: MovementConstraint[];
  userPreferences: UserTrainingPreferences;
  recentlyUsedExercises: string[];
}
```

### 3.2 Finding Substitutes

```typescript
/**
 * Find ranked substitutes for an exercise
 */
function findSubstitutes(
  exerciseId: string,
  exercisePool: Exercise[],
  availableEquipment: Equipment[],
  constraints: MovementConstraint[],
  userPreferences: UserTrainingPreferences,
  limit: number = 5
): SubstituteExercise[] {
  const original = getExerciseById(exerciseId);
  if (!original) return [];

  const context: SubstitutionContext = {
    availableEquipment,
    constraints,
    userPreferences,
    recentlyUsedExercises: [] // Could be passed in for variety
  };

  // Score all candidates
  const scored = exercisePool
    .filter(e => e.id !== exerciseId) // Exclude original
    .map(candidate => calculateSubstitutionScore(original, candidate, context))
    .filter(s => s.isViable && s.totalScore >= 40) // Minimum threshold
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit);

  // Convert to SubstituteExercise format with explanations
  return scored.map(s => ({
    exerciseId: s.candidateId,
    reason: generateSubstitutionExplanation(s),
    prescriptionAdjustment: calculatePrescriptionAdjustment(original, getExerciseById(s.candidateId)!),
    suitabilityScore: s.totalScore
  }));
}

/**
 * Generate human-readable explanation for substitution
 */
function generateSubstitutionExplanation(score: SubstitutionScore): string {
  const primary = score.factors
    .filter(f => f.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  if (primary.length === 0) {
    return 'Alternative option';
  }

  const explanations = primary.map(f => {
    switch (f.name) {
      case 'muscle_match':
        return 'works the same muscles';
      case 'movement_pattern':
        return 'similar movement';
      case 'direct_substitute':
        return 'direct equivalent';
      case 'user_favorite':
        return 'one of your favorites';
      default:
        return f.explanation.toLowerCase();
    }
  });

  return explanations.join(', ').replace(/^./, s => s.toUpperCase());
}

/**
 * Examples of generated explanations:
 *
 * "Works the same muscles, similar movement"
 * "Direct equivalent, equipment available"
 * "Works the same muscles, one of your favorites"
 * "Similar movement, easier variation"
 */
```

### 3.3 Skip Logic

```typescript
/**
 * Determine if skipping is better than substituting
 */
function shouldSkipInsteadOfSubstitute(
  exercise: PlannedExercise,
  skipReason: SkipReason,
  context: SkipContext
): SkipDecision {

  // ALWAYS skip if safety-related
  if (skipReason === 'pain' || skipReason === 'injury_flare') {
    return {
      shouldSkip: true,
      reason: 'Safety first - skipping is appropriate when pain or injury is involved',
      suggestAlternative: false
    };
  }

  // Check if good substitutes exist
  const substitutes = findSubstitutes(
    exercise.exerciseId,
    context.exercisePool,
    context.availableEquipment,
    context.constraints,
    context.userPreferences,
    3
  );

  const hasGoodSubstitute = substitutes.some(s => s.suitabilityScore >= 70);

  // Equipment not available
  if (skipReason === 'equipment_unavailable') {
    if (hasGoodSubstitute) {
      return {
        shouldSkip: false,
        reason: 'Good alternatives available that use available equipment',
        suggestAlternative: true,
        suggestedExercise: substitutes[0]
      };
    } else {
      return {
        shouldSkip: true,
        reason: 'No suitable alternatives with available equipment',
        suggestAlternative: false
      };
    }
  }

  // Time constraints
  if (skipReason === 'time_constraint') {
    const exerciseData = getExerciseById(exercise.exerciseId);

    // Skip accessory work first
    if (!exerciseData?.isCompound) {
      return {
        shouldSkip: true,
        reason: 'Skipping accessory exercise to save time - compounds are priority',
        suggestAlternative: false
      };
    }

    // Don't skip compounds - suggest abbreviated version
    return {
      shouldSkip: false,
      reason: 'Keeping compound movement but reducing sets',
      suggestAlternative: false,
      suggestModification: {
        sets: Math.max(2, exercise.prescription.sets - 1)
      }
    };
  }

  // Fatigue
  if (skipReason === 'fatigue') {
    // If already done 70%+ of workout, OK to skip remainder
    if (context.workoutProgress >= 0.7) {
      return {
        shouldSkip: true,
        reason: 'Good session - OK to stop here given fatigue',
        suggestAlternative: false
      };
    }

    // Suggest easier variation
    if (hasGoodSubstitute) {
      const easierSub = substitutes.find(s => {
        const sub = getExerciseById(s.exerciseId);
        return sub &&
          ['beginner', 'intermediate'].indexOf(sub.skillLevel) <
          ['beginner', 'intermediate'].indexOf(getExerciseById(exercise.exerciseId)!.skillLevel);
      });

      if (easierSub) {
        return {
          shouldSkip: false,
          reason: 'Suggesting easier variation to work around fatigue',
          suggestAlternative: true,
          suggestedExercise: easierSub
        };
      }
    }

    return {
      shouldSkip: false,
      reason: 'Reducing load but continuing - you\'re doing well',
      suggestModification: {
        weight: exercise.prescription.weight ? exercise.prescription.weight * 0.8 : undefined,
        rpe: 6
      }
    };
  }

  // User preference / "don't feel like it"
  if (skipReason === 'preference') {
    if (hasGoodSubstitute) {
      return {
        shouldSkip: false,
        reason: 'Found a good alternative',
        suggestAlternative: true,
        suggestedExercise: substitutes[0]
      };
    }

    // Allow skip but note it
    return {
      shouldSkip: true,
      reason: 'Skipping - no worries, we\'ll catch this muscle group next time',
      suggestAlternative: false
    };
  }

  return {
    shouldSkip: false,
    reason: 'Continuing as planned',
    suggestAlternative: false
  };
}

type SkipReason =
  | 'pain'
  | 'injury_flare'
  | 'equipment_unavailable'
  | 'time_constraint'
  | 'fatigue'
  | 'preference';

interface SkipContext {
  exercisePool: Exercise[];
  availableEquipment: Equipment[];
  constraints: MovementConstraint[];
  userPreferences: UserTrainingPreferences;
  workoutProgress: number; // 0-1
}

interface SkipDecision {
  shouldSkip: boolean;
  reason: string;
  suggestAlternative: boolean;
  suggestedExercise?: SubstituteExercise;
  suggestModification?: Partial<ExercisePrescription>;
}
```

---

## 4. Safety Engine

### 4.1 Safety Trigger Conditions

```typescript
/**
 * Safety engine - monitors for red flags and handles escalation
 */
export interface SafetyEngine {
  checkInput(input: SafetyCheckInput): SafetyCheckResult;
  getEscalationUI(trigger: SafetyTrigger): EscalationUI;
}

export interface SafetyCheckInput {
  checkInData?: CheckIn;
  bodyStatus?: BodyRegionStatus[];
  userMessage?: string;
  exerciseFeedback?: ExerciseFeedback;
  vitalSigns?: {
    heartRate?: number;
    bloodPressure?: { systolic: number; diastolic: number };
  };
}

export interface SafetyCheckResult {
  safe: boolean;
  triggers: SafetyTrigger[];
  action: SafetyAction;
  userMessage: string;
}

export type SafetyAction =
  | 'continue'              // All clear
  | 'warn'                  // Show warning, allow continue
  | 'require_acknowledgment' // Must acknowledge before continuing
  | 'block_activity'        // Cannot continue this activity
  | 'recommend_rest'        // Suggest rest instead
  | 'seek_medical'          // Recommend professional attention
  | 'emergency';            // Potential emergency
```

### 4.2 Red Flag Detection

```typescript
/**
 * RED FLAG CONDITIONS
 * These require immediate attention and safety responses
 */
const RED_FLAGS: RedFlag[] = [
  // Neurological red flags
  {
    id: 'numbness',
    condition: (input) =>
      input.bodyStatus?.some(s => s.sensation === 'numbness') ||
      containsKeywords(input.userMessage, NUMBNESS_KEYWORDS),
    severity: 'high',
    action: 'seek_medical',
    message: 'Numbness can indicate nerve involvement. Please consult a healthcare provider before continuing exercise.',
    neverSuggest: ['Continue exercising', 'Push through it']
  },
  {
    id: 'tingling_radiating',
    condition: (input) =>
      input.bodyStatus?.some(s => s.sensation === 'tingling') ||
      containsKeywords(input.userMessage, TINGLING_KEYWORDS),
    severity: 'high',
    action: 'seek_medical',
    message: 'Tingling or pins and needles can indicate nerve involvement. Rest and consult a healthcare provider.',
    neverSuggest: ['Stretch it out', 'Work through it']
  },

  // Cardiac red flags
  {
    id: 'chest_pain',
    condition: (input) =>
      (input.bodyStatus?.some(s =>
        s.region === 'chest' &&
        ['pain_sharp', 'pain_dull'].includes(s.sensation)
      )) ||
      containsKeywords(input.userMessage, CHEST_PAIN_KEYWORDS),
    severity: 'critical',
    action: 'emergency',
    message: 'Chest pain during or after exercise requires immediate medical attention. Stop all activity. If severe, call emergency services.',
    neverSuggest: ['Rest and try again', 'Lighter weight']
  },
  {
    id: 'breathing_difficulty',
    condition: (input) =>
      containsKeywords(input.userMessage, BREATHING_KEYWORDS),
    severity: 'critical',
    action: 'emergency',
    message: 'Difficulty breathing that persists after rest requires immediate medical attention.',
    neverSuggest: ['Keep going', 'Push through']
  },
  {
    id: 'dizziness_fainting',
    condition: (input) =>
      containsKeywords(input.userMessage, DIZZINESS_KEYWORDS),
    severity: 'high',
    action: 'seek_medical',
    message: 'Dizziness or feeling faint during exercise could indicate a serious issue. Stop activity, sit or lie down, and consult a healthcare provider.',
    neverSuggest: ['Continue carefully', 'Take a short break then resume']
  },

  // Musculoskeletal red flags
  {
    id: 'severe_sudden_pain',
    condition: (input) =>
      input.bodyStatus?.some(s =>
        s.level >= 8 &&
        s.sensation === 'pain_sharp'
      ) ||
      containsKeywords(input.userMessage, SEVERE_PAIN_KEYWORDS),
    severity: 'high',
    action: 'block_activity',
    message: 'Severe sudden pain could indicate a significant injury. Stop the exercise immediately. Rest, ice if appropriate, and seek medical evaluation.',
    neverSuggest: ['Reduce weight and continue', 'Try a different exercise']
  },
  {
    id: 'joint_locking',
    condition: (input) =>
      containsKeywords(input.userMessage, LOCKING_KEYWORDS),
    severity: 'medium',
    action: 'require_acknowledgment',
    message: 'Joint locking or catching may indicate internal joint issues. Avoid loading this joint and consult a healthcare provider.',
    neverSuggest: ['Work through it', 'Stretch it out']
  },
  {
    id: 'giving_way',
    condition: (input) =>
      input.bodyStatus?.some(s => s.sensation === 'instability') ||
      containsKeywords(input.userMessage, INSTABILITY_KEYWORDS),
    severity: 'medium',
    action: 'block_activity',
    message: 'Joint instability or giving way could indicate ligament damage. Avoid loading this joint and consult a healthcare provider.',
    neverSuggest: ['Strengthen around it', 'Use lighter weight']
  },

  // Swelling and inflammation
  {
    id: 'significant_swelling',
    condition: (input) =>
      input.bodyStatus?.some(s => s.sensation === 'swelling' && s.level >= 6) ||
      containsKeywords(input.userMessage, SWELLING_KEYWORDS),
    severity: 'medium',
    action: 'require_acknowledgment',
    message: 'Significant swelling indicates inflammation or injury. Rest, ice, elevate the area, and consider medical evaluation if it persists.',
    neverSuggest: ['Exercise to reduce swelling', 'Work through it']
  },

  // Mental health considerations
  {
    id: 'overexertion_pressure',
    condition: (input) =>
      containsKeywords(input.userMessage, OVEREXERTION_KEYWORDS),
    severity: 'low',
    action: 'warn',
    message: 'Rest is a crucial part of progress. It\'s OK to take a break. Your health matters more than any workout.',
    neverSuggest: ['Push harder', 'No pain no gain']
  }
];

/**
 * Keyword lists for detection
 */
const NUMBNESS_KEYWORDS = [
  'numb', 'numbness', 'can\'t feel', 'no feeling', 'dead', 'lost sensation'
];

const TINGLING_KEYWORDS = [
  'tingling', 'pins and needles', 'prickling', 'electric', 'shooting down',
  'radiating', 'traveling pain'
];

const CHEST_PAIN_KEYWORDS = [
  'chest pain', 'chest hurts', 'chest pressure', 'tight chest',
  'pain in chest', 'heart hurts', 'heart pain'
];

const BREATHING_KEYWORDS = [
  'can\'t breathe', 'hard to breathe', 'breathing problem', 'short of breath',
  'gasping', 'can\'t catch breath', 'breathing difficulty'
];

const DIZZINESS_KEYWORDS = [
  'dizzy', 'lightheaded', 'faint', 'fainting', 'blacking out', 'seeing stars',
  'room spinning', 'vertigo', 'about to pass out'
];

const SEVERE_PAIN_KEYWORDS = [
  'extreme pain', 'worst pain', 'excruciating', 'unbearable', 'agonizing',
  'something snapped', 'heard a pop', 'felt a tear', 'sudden sharp pain'
];

const LOCKING_KEYWORDS = [
  'locked', 'locking', 'catching', 'stuck', 'won\'t move', 'frozen'
];

const INSTABILITY_KEYWORDS = [
  'gave way', 'giving out', 'buckled', 'unstable', 'wobbly', 'doesn\'t feel stable',
  'slipping', 'shifting'
];

const SWELLING_KEYWORDS = [
  'swollen', 'swelling', 'puffed up', 'inflamed', 'balloon'
];

const OVEREXERTION_KEYWORDS = [
  'have to exercise', 'must work out', 'can\'t skip', 'feel guilty',
  'punishment', 'make up for', 'burn off'
];
```

### 4.3 Safety Check Implementation

```typescript
/**
 * Main safety check function
 */
function checkSafety(input: SafetyCheckInput): SafetyCheckResult {
  const triggers: SafetyTrigger[] = [];

  // Check all red flags
  for (const flag of RED_FLAGS) {
    if (flag.condition(input)) {
      triggers.push({
        id: flag.id,
        severity: flag.severity,
        action: flag.action,
        message: flag.message,
        neverSuggest: flag.neverSuggest
      });
    }
  }

  // No triggers
  if (triggers.length === 0) {
    return {
      safe: true,
      triggers: [],
      action: 'continue',
      userMessage: ''
    };
  }

  // Determine highest severity action needed
  const criticalTriggers = triggers.filter(t => t.severity === 'critical');
  const highTriggers = triggers.filter(t => t.severity === 'high');
  const mediumTriggers = triggers.filter(t => t.severity === 'medium');

  let action: SafetyAction;
  let userMessage: string;

  if (criticalTriggers.length > 0) {
    action = 'emergency';
    userMessage = criticalTriggers[0].message;
  } else if (highTriggers.length > 0) {
    action = highTriggers[0].action;
    userMessage = highTriggers[0].message;
  } else if (mediumTriggers.length > 0) {
    action = mediumTriggers[0].action;
    userMessage = mediumTriggers[0].message;
  } else {
    action = 'warn';
    userMessage = triggers[0].message;
  }

  return {
    safe: false,
    triggers,
    action,
    userMessage
  };
}
```

### 4.4 Escalation UX Requirements

```typescript
/**
 * UI requirements for safety escalation
 */
interface EscalationUI {
  // Display
  modalType: 'info' | 'warning' | 'danger' | 'emergency';
  title: string;
  message: string;
  icon: string;

  // Actions
  primaryAction: EscalationAction;
  secondaryAction?: EscalationAction;

  // Requirements
  requiresAcknowledgment: boolean;
  acknowledgmentText?: string;
  canBeDismissed: boolean;
  blocksActivity: boolean;

  // Resources
  helpfulResources?: {
    title: string;
    url?: string;
    phone?: string;
  }[];
}

interface EscalationAction {
  label: string;
  action: 'dismiss' | 'acknowledge' | 'stop_workout' | 'call_emergency' | 'open_url';
  url?: string;
  phone?: string;
}

/**
 * Generate escalation UI based on trigger
 */
function getEscalationUI(trigger: SafetyTrigger): EscalationUI {
  switch (trigger.action) {
    case 'emergency':
      return {
        modalType: 'emergency',
        title: 'Stop Activity Immediately',
        message: trigger.message,
        icon: 'alert-octagon',
        primaryAction: {
          label: 'Call Emergency Services',
          action: 'call_emergency',
          phone: '911' // Localized
        },
        secondaryAction: {
          label: 'I Understand',
          action: 'acknowledge'
        },
        requiresAcknowledgment: true,
        acknowledgmentText: 'I understand this may be serious and will seek appropriate help',
        canBeDismissed: false,
        blocksActivity: true,
        helpfulResources: [
          { title: 'Emergency Services', phone: '911' }
        ]
      };

    case 'seek_medical':
      return {
        modalType: 'danger',
        title: 'Medical Attention Recommended',
        message: trigger.message,
        icon: 'alert-triangle',
        primaryAction: {
          label: 'Stop Workout',
          action: 'stop_workout'
        },
        secondaryAction: {
          label: 'I\'ll Seek Medical Advice',
          action: 'acknowledge'
        },
        requiresAcknowledgment: true,
        acknowledgmentText: 'I understand and will consult a healthcare provider',
        canBeDismissed: false,
        blocksActivity: true
      };

    case 'block_activity':
      return {
        modalType: 'warning',
        title: 'Activity Stopped',
        message: trigger.message,
        icon: 'pause-circle',
        primaryAction: {
          label: 'OK',
          action: 'acknowledge'
        },
        requiresAcknowledgment: true,
        canBeDismissed: false,
        blocksActivity: true
      };

    case 'require_acknowledgment':
      return {
        modalType: 'warning',
        title: 'Please Note',
        message: trigger.message,
        icon: 'alert-circle',
        primaryAction: {
          label: 'I Understand',
          action: 'acknowledge'
        },
        secondaryAction: {
          label: 'Stop Workout',
          action: 'stop_workout'
        },
        requiresAcknowledgment: true,
        canBeDismissed: false,
        blocksActivity: false
      };

    case 'warn':
      return {
        modalType: 'info',
        title: 'A Note',
        message: trigger.message,
        icon: 'info',
        primaryAction: {
          label: 'OK',
          action: 'dismiss'
        },
        requiresAcknowledgment: false,
        canBeDismissed: true,
        blocksActivity: false
      };

    default:
      return {
        modalType: 'info',
        title: 'Notice',
        message: trigger.message,
        icon: 'info',
        primaryAction: {
          label: 'OK',
          action: 'dismiss'
        },
        requiresAcknowledgment: false,
        canBeDismissed: true,
        blocksActivity: false
      };
  }
}
```

### 4.5 What Must NEVER Be Claimed or Suggested

```typescript
/**
 * ABSOLUTE PROHIBITIONS
 * The system must NEVER make these claims or suggestions
 */
const PROHIBITED_CLAIMS = [
  // Medical diagnosis
  'You have [condition]',
  'This is [diagnosis]',
  'You\'re suffering from [condition]',
  'This indicates [disease/condition]',

  // Treatment claims
  'This will heal your [condition]',
  'This will cure [condition]',
  'This will fix your [problem]',
  'Do this to treat [condition]',

  // Medical certainty
  'You definitely have',
  'This is definitely',
  'You\'re safe to',
  'There\'s nothing wrong',
  'It\'s just [minimizing]',

  // Overriding professional advice
  'Ignore what your doctor said',
  'Your physio is wrong',
  'You don\'t need to see a professional',
  'Skip the medical appointment',

  // Dangerous encouragement
  'Push through the pain',
  'Pain means it\'s working',
  'No pain no gain',
  'Ignore your body\'s signals',
  'Just tough it out',
  'Don\'t be soft',

  // Timing claims
  'You\'ll be healed in [timeframe]',
  'This injury takes [specific time]',
  'You\'ll be back to normal by [date]',

  // Guarantees
  'Guaranteed to',
  'Will definitely',
  '100% safe',
  'Risk-free',
  'Nothing bad can happen'
];

const PROHIBITED_SUGGESTIONS = [
  // Training through serious symptoms
  'Continue if you have chest pain',
  'Work through numbness',
  'Exercise despite difficulty breathing',
  'Train on a potentially broken bone',

  // Avoiding professional help
  'You don\'t need to see anyone about this',
  'Skip the doctor',
  'Just rest and it will be fine',

  // Specific medical advice
  'Take [medication]',
  'Use [specific medical treatment]',
  'Apply [medical procedure]',

  // Minimizing symptoms
  'It\'s probably nothing',
  'Don\'t worry about it',
  'You\'re overreacting'
];

/**
 * Safe language patterns to use instead
 */
const SAFE_LANGUAGE = {
  // Instead of diagnosis
  suggestions: [
    'This might indicate...',
    'Consider consulting a professional about...',
    'Symptoms like this can sometimes mean...',
    'It may be worth having someone look at...'
  ],

  // Instead of treatment claims
  exercise_benefits: [
    'This exercise is often used for...',
    'This may help with...',
    'People sometimes find this helpful for...',
    'Your physio/doctor can advise if this is appropriate'
  ],

  // Instead of certainty
  uncertainty: [
    'I\'m not certain, but...',
    'Based on what you\'ve told me...',
    'This could be... but please verify with a professional',
    'I\'d suggest asking a healthcare provider about...'
  ],

  // Encouraging professional consultation
  referral: [
    'This is beyond what I can help with - please see a professional',
    'A healthcare provider would be the best person to assess this',
    'I\'d recommend getting this checked out',
    'Your physio/doctor can give you specific guidance'
  ]
};
```

---

## 5. Implementation Guidelines

### 5.1 Rule Priority Order

When multiple rules conflict, apply in this order (highest priority first):

1. **Safety rules** - Red flags always take precedence
2. **Pain/injury rules** - Active symptoms override everything else
3. **Medical constraints** - From clinical documents or user-confirmed
4. **Readiness rules** - Sleep, HRV, training load
5. **Recovery rules** - Muscle group recovery status
6. **Preference rules** - User preferences are lowest priority

### 5.2 Transparency Requirements

Every plan must include:
- Clear rationale for plan type selection
- List of factors that influenced the decision
- Explanation of any exercises avoided and why
- Acknowledgment of user's current state

### 5.3 Conservative Defaults

When uncertain:
- Default to less intensity, not more
- Default to fewer sets, not more
- Default to longer rest, not shorter
- Default to easier variations, not harder
- Default to suggesting professional consultation

### 5.4 User Override Handling

Users can override recommendations, but:
- Safety-critical overrides require explicit acknowledgment
- Override reasons are logged
- System tracks patterns of overrides
- Repeated overrides of the same advice trigger re-education

---

## 6. Example Scenarios

### Scenario 1: Good Recovery Day

**Input:**
- Readiness: 82
- Sleep: 7.5hrs, 85% quality
- HRV: +8% from baseline
- No active injuries
- 3 days since last workout

**Output:**
- Plan type: `full_workout`
- Rationale: "Your recovery signals look good. Well rested with HRV above baseline. Ready for a full session."

### Scenario 2: Poor Sleep + Moderate Pain

**Input:**
- Readiness: 58
- Sleep: 5hrs, 45% quality
- HRV: -5% from baseline
- Knee pain reported: level 5, dull ache
- 2 days since last workout

**Output:**
- Plan type: `moderate_workout`
- Modifications: Avoid heavy quad loading, extended warmup
- Rationale: "Recovery signals suggest a moderate session today. Sleep was under 6 hours and you've reported knee discomfort. Keeping intensity moderate and avoiding heavy leg loading."

### Scenario 3: Red Flag Detected

**Input:**
- User message: "My lower back has shooting pain going down my leg"

**Output:**
- Safety trigger: `tingling_radiating`
- Action: `seek_medical`
- Message: "Radiating pain from the back down the leg can indicate nerve involvement. Please rest and consult a healthcare provider before resuming exercise."
- Plan: Rest day enforced

---

*End of Domain Model & Planning Engine Design Document*
