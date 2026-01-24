/**
 * Body Recovery Companion - Domain Types
 * Core type definitions for the application
 */

// ============================================================================
// Body Map Types
// ============================================================================

/**
 * 34 Anatomical regions for body mapping
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

export const BODY_REGIONS: BodyRegion[] = [
  'head', 'neck', 'shoulder_left', 'shoulder_right', 'upper_back', 'lower_back',
  'chest', 'core', 'hip_left', 'hip_right', 'glute_left', 'glute_right',
  'upper_arm_left', 'upper_arm_right', 'elbow_left', 'elbow_right',
  'forearm_left', 'forearm_right', 'wrist_left', 'wrist_right',
  'hand_left', 'hand_right', 'thigh_front_left', 'thigh_front_right',
  'thigh_back_left', 'thigh_back_right', 'knee_left', 'knee_right',
  'calf_left', 'calf_right', 'ankle_left', 'ankle_right', 'foot_left', 'foot_right'
];

/** Pain/sensation severity scale (1-10) */
export type PainLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/** Type of sensation being reported */
export type SensationType =
  | 'pain_sharp'
  | 'pain_dull'
  | 'pain_burning'
  | 'tightness'
  | 'stiffness'
  | 'weakness'
  | 'numbness'
  | 'tingling'
  | 'clicking'
  | 'instability'
  | 'swelling'
  | 'good';

/** A single body region status entry */
export interface BodyRegionStatus {
  region: BodyRegion;
  sensation: SensationType;
  level: PainLevel;
  timestamp: Date;
  context?: string;
}

// ============================================================================
// Exercise Types
// ============================================================================

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

export const MOVEMENT_PATTERNS: MovementPattern[] = [
  'squat', 'hip_hinge', 'lunge', 'push_horizontal', 'push_vertical',
  'pull_horizontal', 'pull_vertical', 'carry', 'rotation', 'anti_rotation',
  'flexion', 'extension', 'lateral', 'gait', 'isometric'
];

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

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'upper_back', 'lats', 'shoulders_front', 'shoulders_side',
  'shoulders_rear', 'biceps', 'triceps', 'forearms', 'core_front',
  'core_obliques', 'lower_back', 'glutes', 'hip_flexors', 'quads',
  'hamstrings', 'adductors', 'abductors', 'calves', 'neck'
];

export type Equipment =
  | 'none'
  | 'barbell'
  | 'dumbbell'
  | 'kettlebell'
  | 'resistance_band'
  | 'foam_roller'
  | 'yoga_mat'
  | 'pull_up_bar'
  | 'bench_flat'
  | 'stability_ball';

export type ExerciseCategory =
  | 'strength'
  | 'mobility'
  | 'stability'
  | 'flexibility'
  | 'rehabilitation'
  | 'warmup'
  | 'cooldown';

/** Complete exercise definition */
export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  musclesPrimary: MuscleGroup[];
  musclesSecondary: MuscleGroup[];
  movementPattern: MovementPattern;
  equipmentRequired: Equipment[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  cues: string[];
  contraindications: string[];
  duration?: number; // seconds, for time-based
  defaultSets: number;
  defaultReps: string;
  defaultRestSeconds: number;
  substitutes: string[]; // exercise IDs
  videoUrl?: string;
}

// ============================================================================
// Day Plan Types
// ============================================================================

export type PlanType =
  | 'full'
  | 'moderate'
  | 'light'
  | 'mobility_only'
  | 'rest';

export type BlockType =
  | 'warmup'
  | 'main'
  | 'cooldown'
  | 'rehab';

export interface PlannedExercise {
  id: string;
  exerciseId: string;
  order: number;
  sets: number;
  reps: string;
  restSeconds: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completedSets: CompletedSet[];
}

export interface CompletedSet {
  setNumber: number;
  reps: number;
  weight?: number;
  rpe?: number;
  timestamp: Date;
}

export interface PlanBlock {
  id: string;
  blockType: BlockType;
  name: string;
  order: number;
  exercises: PlannedExercise[];
  estimatedDuration: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
}

export interface PlanRationale {
  summary: string;
  reasons: string[];
  warnings: string[];
}

export interface DayPlan {
  id: string;
  date: Date;
  planType: PlanType;
  blocks: PlanBlock[];
  estimatedDuration: number;
  rationale: PlanRationale;
  status: 'generated' | 'in_progress' | 'completed' | 'skipped';
}

// ============================================================================
// Check-In Types
// ============================================================================

export interface CheckIn {
  id: string;
  timestamp: Date;
  type: 'morning' | 'pre_workout' | 'post_workout';
  energyLevel?: number;
  sleepQuality?: number;
  bodyUpdates: BodyRegionStatus[];
  notes?: string;
}

// ============================================================================
// Health Data Types
// ============================================================================

export interface DailySignals {
  date: Date;
  sleep?: {
    duration: number;
    quality: number;
  };
  hrv?: {
    current: number;
    baseline7Day: number;
  };
  steps?: number;
}

export interface ReadinessScore {
  overall: number; // 0-100
  tier: 'good' | 'moderate' | 'rest';
  factors: string[];
  summary: string;
}

// ============================================================================
// Safety Types
// ============================================================================

export type SafetyAction =
  | 'continue'
  | 'warn'
  | 'block'
  | 'emergency';

export interface SafetyTrigger {
  id: string;
  category: 'emergency' | 'professional' | 'monitor';
  keywords: string[];
  message: string;
  action: SafetyAction;
}

export interface SafetyCheckResult {
  safe: boolean;
  triggers: SafetyTrigger[];
  action: SafetyAction;
  userMessage: string;
}

export interface RedFlag {
  id: string;
  category: 'emergency' | 'professional' | 'monitor';
  detected: boolean;
  message: string;
}

// ============================================================================
// User Preferences
// ============================================================================

export interface UserPreferences {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  availableEquipment: Equipment[];
  typicalSessionLength: number;
  weightUnit: 'kg' | 'lbs';
  includeWarmup: boolean;
  includeCooldown: boolean;
  theme: 'light' | 'dark' | 'system';
  reduceMotion: boolean;
}
