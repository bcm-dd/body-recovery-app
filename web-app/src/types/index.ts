/**
 * Core types for the Body Recovery Web App
 */

// ============================================================================
// User & Auth
// ============================================================================

export interface User {
  id: string
  email: string
  name?: string
}

export interface Session {
  user: User
  expiresAt: string
}

// ============================================================================
// Readiness
// ============================================================================

export interface ReadinessFactors {
  sleep: number      // 0-100
  recovery: number   // 0-100
  load: number       // 0-100
  body: number       // 0-100
}

export type ReadinessRecommendation = 'rest' | 'light' | 'moderate' | 'full'

export interface Readiness {
  score: number
  factors: ReadinessFactors
  recommendation: ReadinessRecommendation
  reasoning?: string
  updatedAt: string
}

// ============================================================================
// Health Data
// ============================================================================

export interface HealthSnapshot {
  id: string
  date: string
  sleepDuration?: number
  sleepQuality?: number
  hrv?: number
  restingHr?: number
  steps?: number
  activeCalories?: number
  synced: boolean
}

// ============================================================================
// Injuries & Body Model
// ============================================================================

export type BodyRegion =
  | 'head'
  | 'neck'
  | 'shoulder_left'
  | 'shoulder_right'
  | 'chest'
  | 'upper_back'
  | 'lower_back'
  | 'elbow_left'
  | 'elbow_right'
  | 'wrist_left'
  | 'wrist_right'
  | 'hip_left'
  | 'hip_right'
  | 'knee_left'
  | 'knee_right'
  | 'ankle_left'
  | 'ankle_right'

export type InjurySeverity = 'mild' | 'moderate' | 'severe'

export type InjuryStatus = 'active' | 'recovering' | 'resolved' | 'chronic'

export interface InjuryConstraint {
  type: 'avoid_exercise' | 'avoid_movement' | 'limit_weight' | 'limit_reps' | 'avoid_region'
  value: string
  description?: string
}

export interface Injury {
  id: string
  userId: string
  bodyRegion: BodyRegion
  description?: string
  severity: InjurySeverity
  status: InjuryStatus
  constraints: InjuryConstraint[]
  clinicalNotes?: string
  startDate: string
  resolvedDate?: string
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Workouts
// ============================================================================

export type WorkoutStatus = 'planned' | 'in_progress' | 'completed' | 'skipped'

export interface ExerciseSet {
  setNumber: number
  weight?: number
  reps?: number
  rpe?: number
  completed: boolean
}

export interface ExerciseLog {
  id: string
  exerciseId: string
  name: string
  order: number
  prescribedWeight?: number
  prescribedReps?: number
  prescribedSets: number
  completedSets: ExerciseSet[]
  skipped: boolean
  skipReason?: string
  painLogged: boolean
  notes?: string
}

export interface Workout {
  id: string
  userId: string
  date: string
  status: WorkoutStatus
  focus: string
  plannedDuration: number
  actualDuration?: number
  readinessScore?: number
  exercises: ExerciseLog[]
  reasoning: string
  createdAt: string
  updatedAt: string
}

// ============================================================================
// AI Chat
// ============================================================================

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  timestamp: string
}

export interface ChatContext {
  currentWorkout?: string
  currentExercise?: string
  readinessScore?: number
  activeInjuries?: string[]
}

// ============================================================================
// Stats
// ============================================================================

export interface UserStats {
  totalWorkouts: number
  totalExercises: number
  totalVolume: number
  averageWorkoutDuration: number
  averageReadiness: number
  streak: number
  updatedAt: string
}
