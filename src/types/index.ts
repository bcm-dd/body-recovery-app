/**
 * Movement & Recovery Companion - Core Type Definitions
 *
 * These types define the foundational data models for the app,
 * including the Body Model, Behavioural Model, and Readiness Model.
 */

// ============================================================================
// User & Profile
// ============================================================================

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  userId: string;
  notifications: NotificationSettings;
  training: TrainingPreferences;
  equipmentByLocation: Record<string, Equipment[]>;
  ui: UIPreferences;
  updatedAt: Date;
}

export interface NotificationSettings {
  enabled: boolean;
  morningCheckIn: boolean;
  morningCheckInTime: string; // HH:mm format
  workoutReminders: boolean;
  reminderLeadTime: number; // minutes before scheduled
  rehabReminders: boolean;
  movementNudges: boolean;
  restSuggestions: boolean;
  progressMilestones: boolean;
  weeklySummary: boolean;
  quietHoursStart?: string; // HH:mm
  quietHoursEnd?: string; // HH:mm
  intensity: 'minimal' | 'moderate' | 'full';
}

export interface TrainingPreferences {
  preferredDays: DayOfWeek[];
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'flexible';
  sessionDuration: number; // minutes
  repRangePreference: 'strength' | 'hypertrophy' | 'endurance' | 'mixed';
  equipmentPreferences: Equipment[];
  exercisesToAvoid: string[]; // exercise IDs
  autoProgressWeights: boolean;
  progressionAggressiveness: 'conservative' | 'moderate' | 'aggressive';
  deloadFrequency: 'auto' | 'every4weeks' | 'every6weeks' | 'manual';
}

export interface UIPreferences {
  theme: 'light' | 'dark' | 'system';
  accentColor: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
  reducedMotion: boolean;
  hapticFeedback: boolean;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// ============================================================================
// Body Model
// ============================================================================

export interface BodyModel {
  userId: string;
  injuries: Injury[];
  surgeries: Surgery[];
  chronicConditions: ChronicCondition[];
  constraints: Constraint[];
  mobilityBaselines: MobilityBaseline[];
  learnedPatterns: LearnedPatterns;
  updatedAt: Date;
}

export interface Injury {
  id: string;
  bodyRegion: BodyRegion;
  specificLocation?: string;
  description: string;
  severity: Severity;
  status: InjuryStatus;
  constraints: Constraint[];
  clinicalNotes?: string;
  startDate: Date;
  resolvedDate?: Date;
  expectedRecoveryWeeks?: number;
  createdAt: Date;
  updatedAt: Date;
  synced: boolean;
}

export interface Surgery {
  id: string;
  bodyRegion: BodyRegion;
  procedure: string;
  surgeon?: string;
  facility?: string;
  date: Date;
  restrictions: Restriction[];
  clearanceDate?: Date;
  notes?: string;
}

export interface ChronicCondition {
  id: string;
  name: string;
  bodyRegions: BodyRegion[];
  managementStrategy?: string;
  flareUpTriggers?: string[];
  constraints: Constraint[];
  diagnosedDate?: Date;
}

export interface Constraint {
  id: string;
  type: ConstraintType;
  description: string;
  affectedMovements: MovementPattern[];
  source: 'injury' | 'surgery' | 'condition' | 'document' | 'manual';
  sourceId?: string;
  active: boolean;
  expiresAt?: Date;
}

export interface Restriction {
  description: string;
  movements: MovementPattern[];
  duration?: string;
  clearanceRequired: boolean;
}

export interface MobilityBaseline {
  joint: string;
  movementType: string;
  rangeOfMotion: number;
  assessedAt: Date;
  notes?: string;
}

export interface LearnedPatterns {
  exercisePerformance: Record<string, ExercisePerformancePattern>;
  recoveryRates: RecoveryPattern[];
  painTriggers: PainTrigger[];
  strengthCurves: StrengthCurve[];
  preferredVariations: string[];
}

export interface ExercisePerformancePattern {
  exerciseId: string;
  averageRPE: number;
  consistencyScore: number;
  formQuality?: 'excellent' | 'good' | 'needs_work';
  lastPerformed: Date;
  personalRecords: PersonalRecord[];
}

export interface RecoveryPattern {
  muscleGroup: MuscleGroup;
  typicalRecoveryHours: number;
  factorsAffectingRecovery: string[];
}

export interface PainTrigger {
  bodyRegion: BodyRegion;
  triggers: string[];
  frequency: 'rare' | 'occasional' | 'frequent';
  lastOccurred?: Date;
}

export interface StrengthCurve {
  exerciseId: string;
  dataPoints: { date: Date; oneRepMax: number }[];
  trend: 'increasing' | 'plateau' | 'decreasing';
}

export interface PersonalRecord {
  type: 'weight' | 'reps' | 'volume';
  value: number;
  achievedAt: Date;
  workoutId: string;
}

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
  | 'glute_left'
  | 'glute_right'
  | 'thigh_left'
  | 'thigh_right'
  | 'knee_left'
  | 'knee_right'
  | 'calf_left'
  | 'calf_right'
  | 'ankle_left'
  | 'ankle_right'
  | 'foot_left'
  | 'foot_right';

export type Severity = 'mild' | 'moderate' | 'severe';

export type InjuryStatus = 'active' | 'healing' | 'resolved' | 'chronic';

export type ConstraintType =
  | 'avoid_completely'
  | 'limit_load'
  | 'limit_range'
  | 'requires_warmup'
  | 'monitor_closely';

export type MovementPattern =
  | 'push_horizontal'
  | 'push_vertical'
  | 'pull_horizontal'
  | 'pull_vertical'
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'rotation'
  | 'flexion'
  | 'extension'
  | 'abduction'
  | 'adduction'
  | 'internal_rotation'
  | 'external_rotation'
  | 'loaded_spinal_flexion'
  | 'axial_loading'
  | 'overhead';

// ============================================================================
// Behavioural Model
// ============================================================================

export interface BehaviouralModel {
  userId: string;
  temporalPatterns: TemporalPatterns;
  resistancePatterns: ResistancePatterns;
  compliancePatterns: CompliancePatterns;
  updatedAt: Date;
}

export interface TemporalPatterns {
  typicalTrainingDays: DayOfWeek[];
  typicalTrainingTimes: TimeOfDay[];
  morningVsEveningPerformance: 'morning' | 'evening' | 'no_difference';
  consistencyByDayOfWeek: Record<DayOfWeek, number>; // 0-1
  seasonalVariations?: SeasonalVariation[];
}

export interface TimeOfDay {
  start: string; // HH:mm
  end: string;
  frequency: number; // 0-1
}

export interface SeasonalVariation {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  activityModifier: number; // multiplier on baseline
  notes?: string;
}

export interface ResistancePatterns {
  skipTriggers: SkipTrigger[];
  avoidedExercises: string[];
  sessionLengthThreshold: number; // minutes before dropout likelihood increases
  effectiveMotivators: Motivator[];
  ineffectiveMotivators: Motivator[];
}

export interface SkipTrigger {
  type: 'fatigue' | 'stress' | 'time' | 'boredom' | 'pain' | 'weather' | 'social' | 'unknown';
  frequency: number; // 0-1
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
}

export type Motivator =
  | 'streak_maintenance'
  | 'progress_tracking'
  | 'social_accountability'
  | 'health_metrics'
  | 'energy_improvement'
  | 'appearance_goals'
  | 'strength_goals'
  | 'stress_relief'
  | 'routine_consistency';

export interface CompliancePatterns {
  rehabAdherenceRate: number; // 0-1
  notificationResponseRate: Record<string, number>; // notification type -> response rate
  restartBehaviourAfterGaps: RestartBehaviour;
  modifiedPlanAcceptanceRate: number; // 0-1
}

export interface RestartBehaviour {
  typicalGapBeforeRestart: number; // days
  preferredRestartIntensity: 'same' | 'reduced' | 'minimal';
  successfulRestartFactors: string[];
}

// ============================================================================
// Readiness Model
// ============================================================================

export interface ReadinessInput {
  sleep: {
    duration: number; // hours
    quality: number; // 0-100
    deepSleepRatio: number; // 0-1
  };
  hrv: {
    current: number; // ms
    baseline: number; // 7-day average
    trend: 'up' | 'down' | 'stable';
  };
  restingHR: {
    current: number; // bpm
    baseline: number;
  };
  recentLoad: {
    last48Hours: number; // training stress score
    last7Days: number;
  };
  bodyFlags: string[]; // active injury IDs
  calendarStress?: number; // 0-100 if calendar integrated
}

export interface ReadinessOutput {
  score: number; // 0-100
  factors: {
    sleep: number; // 0-100
    recovery: number; // 0-100
    load: number; // 0-100
    body: number; // 0-100
  };
  recommendation: ReadinessRecommendation;
  reasoning: string;
  suggestedModifications?: string[];
  calculatedAt: Date;
}

export type ReadinessRecommendation = 'full' | 'moderate' | 'light' | 'rest';

// ============================================================================
// Exercise & Workout
// ============================================================================

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  musclesPrimary: MuscleGroup[];
  musclesSecondary: MuscleGroup[];
  equipment: Equipment[];
  movementPattern: MovementPattern;
  jointActions: JointAction[];
  contraindications: Contraindication[];
  substitutes: string[]; // exercise IDs
  progressions: ExerciseProgression[];
  cues: string[];
  commonMistakes: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface ExerciseProgression {
  exerciseId: string;
  direction: 'easier' | 'harder';
  reason: string;
}

export interface Contraindication {
  tag: string;
  severity: 'absolute' | 'relative';
  reason: string;
}

export type MuscleGroup =
  | 'chest'
  | 'front_delts'
  | 'side_delts'
  | 'rear_delts'
  | 'triceps'
  | 'biceps'
  | 'forearms'
  | 'upper_back'
  | 'lats'
  | 'lower_back'
  | 'core'
  | 'obliques'
  | 'hip_flexors'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'adductors'
  | 'abductors'
  | 'calves';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'kettlebell'
  | 'cable'
  | 'machine'
  | 'smith_machine'
  | 'bodyweight'
  | 'resistance_band'
  | 'pullup_bar'
  | 'dip_station'
  | 'bench'
  | 'incline_bench'
  | 'decline_bench'
  | 'squat_rack'
  | 'leg_press'
  | 'rowing_machine'
  | 'treadmill'
  | 'bike'
  | 'elliptical'
  | 'foam_roller'
  | 'yoga_mat';

export type JointAction =
  | 'flexion'
  | 'extension'
  | 'abduction'
  | 'adduction'
  | 'rotation_internal'
  | 'rotation_external'
  | 'circumduction'
  | 'pronation'
  | 'supination';

// ============================================================================
// Workout Session
// ============================================================================

export interface WorkoutSession {
  id: string;
  date: Date;
  status: WorkoutStatus;
  plannedDuration: number; // minutes
  actualDuration?: number;
  readinessScore?: number;
  exercises: ExerciseLog[];
  notes?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
  synced: boolean;
}

export type WorkoutStatus = 'planned' | 'in_progress' | 'completed' | 'skipped' | 'partial';

export interface ExerciseLog {
  id: string;
  exerciseId: string;
  order: number;
  prescribedWeight?: number;
  prescribedReps: number;
  prescribedSets: number;
  completedSets: SetLog[];
  difficulty?: ExerciseDifficulty;
  notes?: string;
  skipped: boolean;
  skipReason?: SkipReason;
  painLogged: boolean;
  substitutedFrom?: string; // original exercise ID if swapped
}

export interface SetLog {
  setNumber: number;
  weight?: number;
  reps: number;
  rpe?: number; // 1-10
  completedAt: Date;
  notes?: string;
}

export type ExerciseDifficulty = 'easy' | 'moderate' | 'hard' | 'failed';

export type SkipReason = 'equipment_unavailable' | 'pain' | 'fatigue' | 'time' | 'preference' | 'other';

// ============================================================================
// Pain & Discomfort Logging
// ============================================================================

export interface PainLog {
  id: string;
  userId: string;
  workoutId?: string;
  exerciseLogId?: string;
  bodyRegion: BodyRegion;
  severity: Severity;
  painType: PainType;
  description?: string;
  loggedAt: Date;
  synced: boolean;
}

export type PainType = 'sharp' | 'dull' | 'aching' | 'burning' | 'tightness' | 'weakness' | 'numbness';

// ============================================================================
// Daily Plan
// ============================================================================

export interface DailyPlan {
  id: string;
  date: Date;
  readinessSnapshot: ReadinessOutput;
  plannedActivities: PlannedActivity[];
  actualCompletion: ActivityCompletion[];
  notes?: string;
  aiGeneratedInsight?: string;
}

export interface PlannedActivity {
  id: string;
  type: ActivityType;
  workoutSessionId?: string;
  scheduledTime?: string; // HH:mm
  estimatedDuration: number; // minutes
  priority: 'required' | 'recommended' | 'optional';
  description?: string;
}

export type ActivityType =
  | 'gym_workout'
  | 'home_workout'
  | 'morning_mobility'
  | 'evening_stretch'
  | 'rehab_exercises'
  | 'swimming'
  | 'walking'
  | 'active_recovery'
  | 'rest';

export interface ActivityCompletion {
  activityId: string;
  completed: boolean;
  actualDuration?: number;
  notes?: string;
  completedAt?: Date;
}

// ============================================================================
// Health Data
// ============================================================================

export interface HealthSnapshot {
  id: string;
  date: Date;
  sleepDuration?: number; // hours
  sleepQuality?: number; // 0-100
  deepSleepMinutes?: number;
  remSleepMinutes?: number;
  hrv?: number; // ms
  restingHR?: number; // bpm
  steps?: number;
  activeCalories?: number;
  standingMinutes?: number;
  exerciseMinutes?: number;
  weight?: number; // kg
  bodyFat?: number; // percentage
  walkingAsymmetry?: number; // percentage
  respiratoryRate?: number;
  readinessScore?: number;
  rawData?: Record<string, unknown>;
  synced: boolean;
}

// ============================================================================
// Clinical Documents
// ============================================================================

export interface ClinicalDocument {
  id: string;
  userId: string;
  type: DocumentType;
  filename?: string;
  blobUrl: string;
  extractedData?: DocumentExtraction;
  confirmed: boolean;
  uploadedAt: Date;
}

export type DocumentType = 'mri' | 'physio' | 'surgical' | 'specialist' | 'other';

export interface DocumentExtraction {
  documentType: DocumentType;
  bodyRegions: BodyRegion[];
  findings: DocumentFinding[];
  constraints: ExtractedConstraint[];
  exercises?: ExtractedExercise[];
  timeline?: DocumentTimeline;
  rawText: string;
  confidence: number; // 0-1
}

export interface DocumentFinding {
  description: string;
  severity?: Severity;
  confidence: number;
}

export interface ExtractedConstraint {
  description: string;
  duration?: string;
  movements: MovementPattern[];
}

export interface ExtractedExercise {
  name: string;
  sets?: number;
  reps?: number;
  frequency?: string;
  notes?: string;
}

export interface DocumentTimeline {
  startDate?: string;
  reviewDate?: string;
  expectedDuration?: string;
}

// ============================================================================
// Location & Equipment
// ============================================================================

export interface SavedLocation {
  id: string;
  name: string;
  type: LocationType;
  equipment: Equipment[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  lastVisited?: Date;
}

export type LocationType = 'gym' | 'home' | 'hotel' | 'outdoor' | 'pool' | 'other';

// ============================================================================
// Sync
// ============================================================================

export interface SyncAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: unknown;
  timestamp: number;
  retries: number;
}

export type ConflictStrategy = 'client_wins' | 'server_wins' | 'merge' | 'ask_user';
