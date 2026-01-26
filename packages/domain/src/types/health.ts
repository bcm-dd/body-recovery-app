/**
 * Health Types
 * Defines daily signals, readiness scores, and check-in data
 */

import type { BodyRegion, BodyRegionStatus } from './body';
import type { Equipment } from './exercise';

/**
 * Readiness factor description
 */
export interface ReadinessFactor {
  type: 'positive' | 'negative' | 'neutral';
  category: 'sleep' | 'hrv' | 'training_load' | 'body' | 'subjective';
  description: string;
  impact: 'high' | 'medium' | 'low';
  dataPoint?: string;                  // e.g., "HRV: 45ms (-12% from baseline)"
}

/**
 * Computed readiness assessment
 */
export interface ReadinessScore {
  overall: number;                     // 0-100

  // Component scores (each 0-100)
  components: {
    sleep: number;
    recovery: number;                  // HRV-based
    fatigue: number;                   // Training load based
    body: number;                      // Injury/pain based
  };

  // Recommendation
  recommendation: 'full_intensity' | 'moderate' | 'light' | 'active_recovery' | 'rest';

  // Factors that influenced the score
  factors: ReadinessFactor[];

  // Human-readable summary
  summary: string;
}

/**
 * HRV trend direction
 */
export type HRVTrend = 'significantly_up' | 'up' | 'stable' | 'down' | 'significantly_down';

/**
 * Simple trend direction
 */
export type SimpleTrend = 'up' | 'stable' | 'down';

/**
 * Health data signals from device integration
 */
export interface DailySignals {
  userId: string;
  date: Date;                          // Date these signals represent
  fetchedAt: Date;                     // When data was retrieved

  // Sleep data
  sleep: {
    available: boolean;
    duration?: number;                 // hours
    quality?: number;                  // 0-100 score
    deepSleepMinutes?: number;
    remSleepMinutes?: number;
    lightSleepMinutes?: number;
    awakeMinutes?: number;
    sleepEfficiency?: number;          // 0-100
    bedtime?: Date;
    wakeTime?: Date;
    respiratoryRate?: number;          // breaths per minute
  };

  // Heart rate variability
  hrv: {
    available: boolean;
    current?: number;                  // ms (SDNN or RMSSD)
    method?: 'sdnn' | 'rmssd';
    baseline7Day?: number;             // 7-day rolling average
    baseline30Day?: number;            // 30-day rolling average
    trend: HRVTrend;
    percentFromBaseline?: number;      // e.g., -15 means 15% below baseline
  };

  // Resting heart rate
  restingHR: {
    available: boolean;
    current?: number;                  // bpm
    baseline7Day?: number;
    trend: SimpleTrend;
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
    last24Hours: number;               // Arbitrary load units
    last48Hours: number;
    last7Days: number;
    acuteLoad: number;                 // Last 7 days average
    chronicLoad: number;               // Last 28 days average
    acuteChronicRatio: number;         // ACWR - injury risk indicator
  };

  // Mobility/gait data (if available from Apple Watch etc.)
  mobility?: {
    walkingAsymmetry?: number;         // percentage
    strideLength?: number;             // meters
    walkingSpeed?: number;             // m/s
    stairSpeed?: number;               // floors/minute
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
 * Subjective check-in ratings
 */
export interface SubjectiveRatings {
  energyLevel?: number;                // How energized do you feel?
  motivation?: number;                 // How motivated to train?
  stress?: number;                     // Mental/life stress level
  sleepQuality?: number;               // How well did you sleep? (if not from device)
  muscleSoreness?: number;             // Overall DOMS level
  mood?: number;                       // General mood
}

/**
 * Quick flags for check-in
 */
export interface CheckInFlags {
  feelingIll: boolean;
  newPainOrInjury: boolean;
  unusualFatigue: boolean;
  menstrualPhase?: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  poorSleep: boolean;
  highStress: boolean;
  travelOrJetlag: boolean;
}

/**
 * Check-in type
 */
export type CheckInType = 'morning' | 'pre_workout' | 'post_workout' | 'evening' | 'ad_hoc';

/**
 * Daily/session check-in data structure
 */
export interface CheckIn {
  id: string;
  userId: string;
  timestamp: Date;
  type: CheckInType;

  // Subjective ratings (1-10 scale)
  subjective: SubjectiveRatings;

  // Body status updates
  bodyUpdates: BodyRegionStatus[];

  // Quick flags
  flags: CheckInFlags;

  // Free-form notes
  notes?: string;

  // Context
  workoutId?: string;                  // If pre/post workout
  location?: string;
}

/**
 * Session feedback for post-workout check-in
 */
export interface SessionFeedback {
  overallDifficulty: 'too_easy' | 'just_right' | 'too_hard';
  energyAfter: 'energized' | 'neutral' | 'drained';
  enjoyment: 1 | 2 | 3 | 4 | 5;
}

/**
 * Issue logged during a workout session
 */
export interface SessionIssue {
  exerciseId: string;
  issue: 'pain' | 'form_breakdown' | 'equipment_issue' | 'too_heavy' | 'other';
  notes?: string;
}

/**
 * Pre-workout specific check-in
 */
export interface PreWorkoutCheckIn extends CheckIn {
  type: 'pre_workout';

  // Equipment availability
  availableEquipment?: Equipment[];

  // Time constraints
  availableTime?: number;              // minutes

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
  sessionFeedback: SessionFeedback;

  // Any issues during session
  issuesDuring: SessionIssue[];
}
