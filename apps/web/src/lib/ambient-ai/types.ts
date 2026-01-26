/**
 * Ambient AI Type Definitions
 *
 * The sensing layer types for the ambient AI system.
 * These types define the full context the AI uses to make decisions.
 */

// ============================================
// TEMPORAL CONTEXT
// ============================================

export type TimeOfDay =
  | 'early_morning'
  | 'morning'
  | 'midday'
  | 'afternoon'
  | 'evening'
  | 'night';

export interface TemporalContext {
  currentTime: Date;
  timeOfDay: TimeOfDay;
  dayOfWeek: string;
  isWeekend: boolean;
  daysSinceLastSession: number;
  daysSinceLastAppOpen: number;
  currentStreak: number;
  typicalSessionTime: { start: number; end: number } | null; // Hour range
}

// ============================================
// BODY CONTEXT
// ============================================

export type TrendDirection = 'up' | 'stable' | 'down';

export interface SleepData {
  duration: number; // hours
  quality: number; // 0-100
  deepSleepPercent: number;
}

export interface ReadinessFactors {
  sleep: {
    score: number;
    trend: TrendDirection;
    lastNight: SleepData | null;
  };
  recovery: {
    score: number;
    hrvTrend: TrendDirection;
  };
  load: {
    acute: number; // Recent load
    chronic: number; // Baseline load
    ratio: number; // Acute:Chronic ratio
  };
  body: {
    activeInjuries: string[];
    recentPain: Array<{
      region: string;
      severity: number;
      timestamp: Date;
    }>;
  };
}

export type RecoveryStatus = 'fresh' | 'recovered' | 'fatigued' | 'very_fatigued';

export interface Constraint {
  type: 'injury' | 'pain' | 'equipment' | 'time';
  description: string;
  affectedRegions?: string[];
  severity: 'mild' | 'moderate' | 'severe';
}

export interface BodyContext {
  readinessScore: number; // 0-100
  readinessFactors: ReadinessFactors;
  muscleRecoveryStatus: Map<string, RecoveryStatus>;
  currentConstraints: Constraint[];
  bodyModelLastUpdated: Date | null;
  averagePainLevel: number;
  highestPainRegion: string | null;
  painTrend: 'improving' | 'stable' | 'worsening';
}

// ============================================
// BEHAVIORAL CONTEXT
// ============================================

export interface LastSession {
  date: Date;
  type: string;
  completed: boolean;
  earlyEnd: boolean;
  difficulty: 'easy' | 'moderate' | 'hard';
  painLogged: boolean;
  duration: number;
}

export interface SkipPatterns {
  dayOfWeek: Map<string, number>; // Day -> skip rate
  exerciseTypes: Map<string, number>; // Exercise -> skip rate
  afterPainLog: number; // Skip rate after logging pain
}

export interface BehavioralContext {
  // Patterns
  averageSessionsPerWeek: number;
  preferredDays: string[];
  preferredTime: { start: number; end: number } | null;
  averageSessionDuration: number;

  // Recent behavior
  lastSession: LastSession | null;

  // Tendencies
  skipPatterns: SkipPatterns;

  // Engagement
  voiceCommandUsage: number; // 0-1
  detailViewFrequency: number; // 0-1
  insightEngagement: number; // 0-1

  // Advanced patterns
  recoveryVelocity: 'fast' | 'moderate' | 'slow';
  bestTimeForRecovery: 'morning' | 'afternoon' | 'evening' | 'unknown';
  restDayImpact: 'positive' | 'neutral' | 'negative';
  peakMotivationDays: string[];
}

// ============================================
// SESSION CONTEXT (during workout)
// ============================================

export interface SessionExercise {
  id: string;
  name: string;
  targetSets: number;
  completedSets: number;
}

export type ApparentState = 'fresh' | 'moderate' | 'fatigued';
export type EngagementState = 'focused' | 'distracted' | 'struggling';
export type PaceState = 'fast' | 'normal' | 'slow';

export interface SessionContext {
  isActive: boolean;
  currentExercise: SessionExercise | null;
  currentSet: number;
  totalSets: number;
  exercisesCompleted: number;
  exercisesRemaining: number;

  // Real-time signals
  timeSinceLastAction: number; // Seconds
  restTimeTaken: number[]; // Array of actual rest times
  prescribedRestTime: number;
  difficultyRatings: ('easy' | 'moderate' | 'hard')[];

  // Inferred state
  apparentFatigue: ApparentState;
  apparentEngagement: EngagementState;
  apparentPace: PaceState;

  // Video views for uncertainty detection
  videoViewsThisExercise: number;

  // Skips this session
  skipsThisSession: number;
}

// ============================================
// ENVIRONMENT CONTEXT
// ============================================

export type Location = 'home' | 'gym' | 'travel' | 'unknown';
export type DevicePosition = 'handheld' | 'flat' | 'propped';

export interface EnvironmentContext {
  likelyLocation: Location;
  availableEquipment: string[];
  screenOrientation: 'portrait' | 'landscape';
  devicePosition: DevicePosition;
  isOnline: boolean;
  connectionQuality: 'good' | 'poor';
}

// ============================================
// FULL AMBIENT CONTEXT
// ============================================

export interface FullAmbientContext {
  temporal: TemporalContext;
  body: BodyContext;
  behavioral: BehavioralContext;
  session: SessionContext | null;
  environment: EnvironmentContext;
}

// ============================================
// INTERVENTION TYPES
// ============================================

export type InterventionType =
  | 'environmental_shift' // Change atmosphere/color
  | 'subtle_cue' // Small visual/haptic hint
  | 'gentle_prompt' // Soft text appearance
  | 'direct_message' // Conversational intervention
  | 'action_suggestion' // Offer specific action
  | 'automatic_action'; // Do something without asking

export type Urgency = 'immediate' | 'soon' | 'whenever' | 'background';
export type Intrusiveness = 'invisible' | 'subtle' | 'noticeable' | 'prominent';

export interface InterventionDecision {
  shouldIntervene: boolean;
  confidence: number; // 0-1
  type: InterventionType;
  urgency: Urgency;
  intrusiveness: Intrusiveness;
  reason: string;
  // Optional action/message based on type
  action?: string;
  message?: string;
  options?: Array<{ label: string; action: string }>;
}

export interface NonInterventionDecision {
  shouldIntervene: false;
  reason: string;
}

// ============================================
// ENVIRONMENT STATE (Expression Layer)
// ============================================

export type AmbientMotion = 'still' | 'breathing' | 'flowing' | 'energetic';

export interface EnvironmentState {
  colorTemperature: number; // 2700K (warm) to 6500K (cool)
  brightness: number; // 0-1
  saturation: number; // 0-1
  animationSpeed: number; // 0.5 (slow) to 1.5 (energetic)
  ambientMotion: AmbientMotion;
  // CSS variables that will be applied
  cssVariables: Record<string, string>;
}

// ============================================
// MICRO-CUE TYPES
// ============================================

export type VisualEffect = 'pulse' | 'warm' | 'cool' | 'sharpen' | 'soften' | 'glow';
export type VisualElement = 'background' | 'card' | 'text' | 'border' | 'icon';
export type HapticPattern = 'tap' | 'pulse' | 'wave' | 'heartbeat' | 'success' | 'gentle';
export type AudioSound = 'tone' | 'chime' | 'breath';

export interface MicroCueVisual {
  element: VisualElement;
  effect: VisualEffect;
  intensity: number; // 0-1
  duration: number; // ms
}

export interface MicroCueHaptic {
  pattern: HapticPattern;
  intensity: number; // 0-1
}

export interface MicroCueAudio {
  sound: AudioSound;
  volume: number; // 0-1 (typically very low, 0.1-0.3)
}

export interface MicroCue {
  id: string;
  visual?: MicroCueVisual;
  haptic?: MicroCueHaptic;
  audio?: MicroCueAudio;
}

// ============================================
// AMBIENT TEXT
// ============================================

export type AmbientWord =
  | 'steady'
  | 'breathe'
  | 'listen'
  | 'strong'
  | 'enough'
  | 'rest'
  | 'ready'
  | 'good'
  | 'gentle'
  | 'pause';

export type AmbientTextPosition = 'center' | 'bottom' | 'floating';
export type AmbientTextAnimation = 'fade_in_out' | 'breathe' | 'drift';

export interface AmbientText {
  word: AmbientWord;
  position: AmbientTextPosition;
  opacity: number; // Low - 0.3 to 0.6
  animation: AmbientTextAnimation;
  duration: number; // How long visible (ms)
}

// ============================================
// GENTLE PROMPT
// ============================================

export interface GentlePromptOption {
  label: string;
  action: string;
  primary?: boolean;
}

export interface GentlePrompt {
  id: string;
  message: string;
  options: GentlePromptOption[];
  dismissible: boolean;
  priority: 'low' | 'medium' | 'high';
}

// ============================================
// DISTRESS SIGNALS
// ============================================

export type DistressType =
  | 'stuck'
  | 'uncertain_form'
  | 'possible_pain'
  | 'not_working'
  | 'overwhelmed';

export interface DistressSignal {
  type: DistressType;
  confidence: number; // 0-1
  context?: string;
}

// ============================================
// LEARNING & ADAPTATION
// ============================================

export type UserResponseType = 'helpful' | 'dismissed' | 'negative' | 'ignored';

export interface LearningEvent {
  timestamp: Date;
  interventionType: InterventionType;
  context: Partial<FullAmbientContext>;
  response: UserResponseType;
  outcome?: 'positive' | 'neutral' | 'negative';
}

export interface UserPreferences {
  // Environmental
  enableEnvironmentalAdaptation: boolean;
  enableProactiveSuggestions: boolean;
  enableAutomaticAdjustments: boolean;
  enableInsightsAndPatterns: boolean;

  // AI presence level (0 = minimal, 1 = active)
  presenceLevel: number;

  // Learned thresholds
  interventionThresholds: Map<InterventionType, number>;
}

// ============================================
// CONFIDENCE FACTORS
// ============================================

export interface ConfidenceFactors {
  dataQuality: number; // 0-1, How much data do we have?
  patternStrength: number; // 0-1, How consistent is the pattern?
  recentChange: boolean; // Has something changed recently?
  userFeedback: number; // 0-1, Have they confirmed/rejected similar insights?
}

export interface Confidence {
  level: number; // 0-1
  factors: ConfidenceFactors;
}
