/**
 * Type Definitions - Movement & Recovery Companion
 *
 * Core TypeScript types for all data models used throughout the application.
 */

// ============================================================================
// Readiness Types
// ============================================================================

export interface ReadinessFactors {
  sleep: number;       // 0-100: Sleep quality and duration score
  recovery: number;    // 0-100: HRV and resting HR score
  load: number;        // 0-100: Training load impact (inverted - high load = lower score)
  body: number;        // 0-100: Injury/pain status score
}

export type ReadinessRecommendation = 'rest' | 'light' | 'moderate' | 'full';

export interface Readiness {
  userId: string;
  date: string;                         // ISO date string (YYYY-MM-DD)
  score: number;                        // 0-100 overall readiness score
  factors: ReadinessFactors;
  recommendation: ReadinessRecommendation;
  updatedAt: string;                    // ISO timestamp
}

export interface ReadinessInput {
  date: string;
  sleepDuration?: number;               // hours
  sleepQuality?: number;                // 0-100
  hrv?: number;                         // milliseconds
  restingHr?: number;                   // bpm
  steps?: number;
  activeCalories?: number;
  bodyScore?: number;                   // Manual override for body factor
}

// ============================================================================
// Exercise Types
// ============================================================================

export interface Exercise {
  id: string;
  name: string;
  musclesPrimary: string[];
  musclesSecondary: string[];
  equipment: string[];
  movementPattern?: string;
  jointActions: string[];
  contraindications: string[];
  substitutes: string[];
  progressions: string[];
  videoUrl?: string;
  cues?: string;
  commonMistakes?: string;
}

export interface ExerciseSet {
  setNumber: number;
  weight?: number;                      // kg or lbs
  reps: number;
  rpe?: number;                         // 1-10 rating of perceived exertion
  completed: boolean;
  notes?: string;
}

export interface ExerciseLog {
  id: string;
  exerciseId: string;
  name: string;
  order: number;
  prescribedWeight?: number;
  prescribedReps: number;
  prescribedSets: number;
  completedSets: ExerciseSet[];
  difficulty?: 'easy' | 'moderate' | 'hard' | 'failed';
  notes?: string;
  skipped: boolean;
}

// ============================================================================
// Workout Types
// ============================================================================

export type WorkoutStatus = 'planned' | 'in_progress' | 'completed' | 'skipped';

export interface Workout {
  id: string;
  userId: string;
  date: string;                         // ISO date string
  status: WorkoutStatus;
  focus: string;                        // e.g., "upper body", "full body", "recovery"
  plannedDuration?: number;             // minutes
  actualDuration?: number;              // minutes
  readinessScore?: number;              // 0-100
  exercises: ExerciseLog[];
  reasoning?: string;                   // AI reasoning for workout selection
  notes?: string;
  createdAt: string;                    // ISO timestamp
  updatedAt: string;                    // ISO timestamp
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  startedAt: string;                    // ISO timestamp
  completedAt?: string;                 // ISO timestamp
  exercises: ExerciseLog[];
  totalVolume?: number;                 // Total weight lifted
  duration?: number;                    // minutes
  perceivedEffort?: number;             // 1-10
  notes?: string;
}

export interface WorkoutPreferences {
  duration: number;                     // Preferred duration in minutes
  focus?: string;                       // Body focus area
  equipment?: string[];                 // Available equipment
}

export interface GeneratedWorkout {
  id: string;
  date: string;
  exercises: Array<{
    exerciseId: string;
    name: string;
    order: number;
    prescribedWeight?: number;
    prescribedReps: number;
    prescribedSets: number;
    notes?: string;
  }>;
  estimatedDuration: number;
  focus: string;
  reasoning: string;
}

// ============================================================================
// Injury Types
// ============================================================================

export type InjurySeverity = 'mild' | 'moderate' | 'severe';
export type InjuryStatus = 'active' | 'recovering' | 'resolved' | 'chronic';

export interface InjuryConstraint {
  type: 'avoid_exercise' | 'avoid_movement' | 'limit_weight' | 'limit_reps' | 'avoid_region';
  value: string;                        // e.g., "bench_press", "overhead", "50kg"
  description?: string;
}

export interface Injury {
  id: string;
  userId: string;
  bodyRegion: string;                   // e.g., "left_shoulder", "lower_back", "right_knee"
  description?: string;
  severity: InjurySeverity;
  status: InjuryStatus;
  constraints: InjuryConstraint[];
  clinicalNotes?: string;               // Notes from healthcare provider
  startDate: string;                    // ISO date string
  resolvedDate?: string;                // ISO date string
  createdAt: string;                    // ISO timestamp
  updatedAt: string;                    // ISO timestamp
}

export interface InjuryInput {
  bodyRegion: string;
  description?: string;
  severity: InjurySeverity;
  status?: InjuryStatus;
  constraints?: InjuryConstraint[];
  clinicalNotes?: string;
  startDate?: string;                   // Defaults to today
}

export interface InjuryUpdate {
  description?: string;
  severity?: InjurySeverity;
  status?: InjuryStatus;
  constraints?: InjuryConstraint[];
  clinicalNotes?: string;
  resolvedDate?: string;
}

// ============================================================================
// User Stats Types
// ============================================================================

export interface WorkoutStreak {
  current: number;                      // Current consecutive workout days
  longest: number;                      // Longest streak ever
  lastWorkoutDate?: string;             // ISO date string
}

export interface VolumeStats {
  weekly: number;                       // Total volume this week
  monthly: number;                      // Total volume this month
  allTime: number;                      // Total volume all time
}

export interface UserStats {
  userId: string;
  totalWorkouts: number;
  totalExercises: number;
  totalVolume: number;                  // Total weight lifted (all time)
  averageWorkoutDuration: number;       // minutes
  averageReadiness: number;             // 0-100
  streak: WorkoutStreak;
  volumeStats: VolumeStats;
  favoriteExercises: Array<{
    exerciseId: string;
    name: string;
    count: number;
  }>;
  bodyRegionFocus: Record<string, number>; // e.g., { "upper": 45, "lower": 30, "core": 25 }
  activeInjuries: number;
  updatedAt: string;                    // ISO timestamp
}

// ============================================================================
// Health Data Types
// ============================================================================

export interface HealthSnapshot {
  userId: string;
  date: string;                         // ISO date string
  sleepDuration?: number;               // hours
  sleepQuality?: number;                // 0-100
  hrv?: number;                         // milliseconds
  restingHr?: number;                   // bpm
  steps?: number;
  activeCalories?: number;
  readinessScore?: number;              // Calculated 0-100
  rawData?: Record<string, unknown>;    // Raw data from health provider
  createdAt: string;                    // ISO timestamp
}

// ============================================================================
// Pain Log Types
// ============================================================================

export type PainSeverity = 'none' | 'mild' | 'moderate' | 'severe';
export type PainType = 'sharp' | 'dull' | 'aching' | 'burning' | 'throbbing' | 'other';

export interface PainLog {
  id: string;
  userId: string;
  workoutId?: string;
  exerciseLogId?: string;
  bodyRegion: string;
  severity: PainSeverity;
  painType?: PainType;
  notes?: string;
  loggedAt: string;                     // ISO timestamp
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    [key: string]: unknown;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ============================================================================
// Store Key Types
// ============================================================================

export type StoreKey =
  | `readiness:${string}:${string}`     // readiness:userId:date
  | `readiness:${string}:latest`        // readiness:userId:latest
  | `workouts:${string}`                // workouts:userId (list)
  | `workout:${string}:${string}`       // workout:userId:workoutId
  | `injuries:${string}`                // injuries:userId (list)
  | `injury:${string}:${string}`        // injury:userId:injuryId
  | `stats:${string}`                   // stats:userId
  | `health:${string}:${string}`;       // health:userId:date
