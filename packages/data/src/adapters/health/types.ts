/**
 * Health Adapter Types
 *
 * Unified abstraction layer over platform-specific health APIs
 * (HealthKit on iOS, Health Connect on Android)
 */

// ============================================
// AVAILABILITY & PERMISSIONS
// ============================================

/**
 * Represents the availability state of health data access
 */
export type HealthAvailability =
  | 'available' // Health data can be accessed
  | 'not_available' // Platform doesn't support health data
  | 'not_authorized' // User hasn't granted permission
  | 'not_determined' // Permission not yet requested
  | 'restricted'; // Parental controls or MDM restrictions

/**
 * Permission status for individual health data types
 */
export interface HealthPermissionStatus {
  read: Partial<Record<HealthDataType, HealthAvailability>>;
  write: Partial<Record<HealthWriteType, HealthAvailability>>;
}

/**
 * All readable health data types
 */
export type HealthDataType =
  | 'steps'
  | 'sleep'
  | 'sleepStages'
  | 'heartRate'
  | 'restingHeartRate'
  | 'hrv'
  | 'activeEnergy'
  | 'basalEnergy'
  | 'workouts'
  | 'weight'
  | 'bodyFat'
  | 'walkingAsymmetry'
  | 'walkingSpeed'
  | 'walkingStepLength'
  | 'respiratoryRate'
  | 'menstrualFlow';

/**
 * Writable health data types
 */
export type HealthWriteType = 'workout' | 'activeEnergy';

// ============================================
// RESULT TYPES
// ============================================

/**
 * Date range for health queries
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Result wrapper with error handling
 */
export type HealthResult<T> =
  | { success: true; data: T }
  | { success: false; error: HealthError };

export interface HealthError {
  code: HealthErrorCode;
  message: string;
  recoverable: boolean;
  suggestedAction?: string;
}

export type HealthErrorCode =
  | 'NOT_AVAILABLE'
  | 'NOT_AUTHORIZED'
  | 'PERMISSION_DENIED'
  | 'DATA_NOT_FOUND'
  | 'QUERY_FAILED'
  | 'WRITE_FAILED'
  | 'SYNC_IN_PROGRESS'
  | 'UNKNOWN';

// ============================================
// HEALTH DATA MODELS
// ============================================

/**
 * Sleep session with optional stage breakdown
 */
export interface SleepSession {
  id: string;
  startDate: Date;
  endDate: Date;
  duration: number; // minutes
  source: string; // e.g., "Apple Watch", "Oura"
  stages?: SleepStage[];
  quality?: number; // 0-100, calculated
}

export interface SleepStage {
  stage: 'awake' | 'rem' | 'core' | 'deep' | 'unknown';
  startDate: Date;
  endDate: Date;
  duration: number; // minutes
}

/**
 * Heart rate variability sample
 */
export interface HRVSample {
  timestamp: Date;
  value: number; // SDNN in milliseconds
  source: string;
}

/**
 * Heart rate sample
 */
export interface HeartRateSample {
  timestamp: Date;
  bpm: number;
  context?: 'resting' | 'active' | 'workout' | 'unknown';
  source: string;
}

/**
 * Step count aggregate
 */
export interface StepCount {
  date: Date;
  count: number;
  source: string;
}

/**
 * Workout session from health store
 */
export interface HealthWorkout {
  id: string;
  activityType: WorkoutActivityType;
  startDate: Date;
  endDate: Date;
  duration: number; // seconds
  activeEnergy?: number; // kcal
  distance?: number; // meters
  averageHeartRate?: number; // bpm
  maxHeartRate?: number; // bpm
  source: string;
}

export type WorkoutActivityType =
  | 'strength_training'
  | 'running'
  | 'walking'
  | 'cycling'
  | 'swimming'
  | 'yoga'
  | 'hiit'
  | 'flexibility'
  | 'other';

/**
 * Body measurement
 */
export interface BodyMeasurement {
  timestamp: Date;
  weight?: number; // kg
  bodyFat?: number; // percentage
  source: string;
}

/**
 * Walking/mobility metrics
 */
export interface MobilityMetrics {
  date: Date;
  walkingAsymmetry?: number; // percentage
  walkingSpeed?: number; // m/s
  stepLength?: number; // meters
  source: string;
}

/**
 * Readiness factors breakdown
 */
export interface ReadinessFactors {
  sleep: number; // 0-100
  recovery: number; // 0-100 (HRV-based)
  strain: number; // 0-100 (recent activity load)
  body: number; // 0-100 (active injuries factor)
}

/**
 * Aggregated daily health snapshot
 * This is the primary data structure stored locally
 */
export interface DailyHealthSnapshot {
  date: string; // ISO date string (YYYY-MM-DD)

  // Sleep
  sleepDuration?: number; // minutes
  sleepQuality?: number; // 0-100
  deepSleepMinutes?: number;
  remSleepMinutes?: number;
  sleepEfficiency?: number; // percentage

  // Heart
  restingHeartRate?: number; // bpm
  hrvAverage?: number; // ms (SDNN)
  hrvTrend?: 'up' | 'down' | 'stable';

  // Activity
  steps?: number;
  activeEnergy?: number; // kcal
  workoutMinutes?: number;
  workoutCount?: number;

  // Body
  weight?: number; // kg
  bodyFat?: number; // percentage

  // Mobility (injury detection signals)
  walkingAsymmetry?: number; // percentage
  walkingSpeed?: number; // m/s

  // Menstrual (if applicable)
  menstrualPhase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

  // Meta
  dataCompleteness: number; // 0-100, how much data we have
  sources: string[]; // Data sources that contributed
  syncedAt: Date;

  // Calculated
  readinessScore?: number; // 0-100, calculated from above
  readinessFactors?: ReadinessFactors;
}

// ============================================
// HEALTH ADAPTER INTERFACE
// ============================================

/**
 * Core HealthAdapter interface
 * All health data access goes through this abstraction
 */
export interface HealthAdapter {
  // ============================================
  // INITIALIZATION & PERMISSIONS
  // ============================================

  /**
   * Check if health data is available on this platform
   */
  isAvailable(): Promise<HealthAvailability>;

  /**
   * Request permissions for specified data types
   * @param read - Data types to request read access for
   * @param write - Data types to request write access for
   * @returns Updated permission status
   */
  requestPermissions(
    read: HealthDataType[],
    write?: HealthWriteType[]
  ): Promise<HealthResult<HealthPermissionStatus>>;

  /**
   * Get current permission status for all data types
   */
  getPermissionStatus(): Promise<HealthPermissionStatus>;

  /**
   * Check if we have the minimum permissions needed for core functionality
   * Core = sleep + HRV + resting HR (for readiness calculation)
   */
  hasMinimumPermissions(): Promise<boolean>;

  // ============================================
  // SLEEP DATA
  // ============================================

  /**
   * Get sleep sessions for a date range
   */
  getSleep(range: DateRange): Promise<HealthResult<SleepSession[]>>;

  /**
   * Get last night's sleep (convenience method)
   */
  getLastNightSleep(): Promise<HealthResult<SleepSession | null>>;

  // ============================================
  // HEART DATA
  // ============================================

  /**
   * Get HRV samples for a date range
   */
  getHRV(range: DateRange): Promise<HealthResult<HRVSample[]>>;

  /**
   * Get most recent HRV reading
   */
  getLatestHRV(): Promise<HealthResult<HRVSample | null>>;

  /**
   * Get resting heart rate samples
   */
  getRestingHeartRate(
    range: DateRange
  ): Promise<HealthResult<HeartRateSample[]>>;

  /**
   * Get today's resting heart rate
   */
  getTodayRestingHeartRate(): Promise<HealthResult<number | null>>;

  /**
   * Get heart rate samples (for workout analysis)
   */
  getHeartRate(range: DateRange): Promise<HealthResult<HeartRateSample[]>>;

  // ============================================
  // ACTIVITY DATA
  // ============================================

  /**
   * Get step counts aggregated by day
   */
  getSteps(range: DateRange): Promise<HealthResult<StepCount[]>>;

  /**
   * Get today's step count
   */
  getTodaySteps(): Promise<HealthResult<number>>;

  /**
   * Get workouts from health store
   */
  getWorkouts(range: DateRange): Promise<HealthResult<HealthWorkout[]>>;

  /**
   * Get active energy burned (kcal) for a date range
   */
  getActiveEnergy(range: DateRange): Promise<HealthResult<number>>;

  // ============================================
  // BODY DATA
  // ============================================

  /**
   * Get body measurements (weight, body fat)
   */
  getBodyMeasurements(
    range: DateRange
  ): Promise<HealthResult<BodyMeasurement[]>>;

  /**
   * Get latest body measurement
   */
  getLatestBodyMeasurement(): Promise<HealthResult<BodyMeasurement | null>>;

  // ============================================
  // MOBILITY DATA (Injury Detection Signals)
  // ============================================

  /**
   * Get walking/mobility metrics
   * These are useful for detecting gait changes that indicate injury
   */
  getMobilityMetrics(range: DateRange): Promise<HealthResult<MobilityMetrics[]>>;

  // ============================================
  // WRITE OPERATIONS
  // ============================================

  /**
   * Write a completed workout to health store
   */
  writeWorkout(
    workout: Omit<HealthWorkout, 'id' | 'source'>
  ): Promise<HealthResult<string>>;

  // ============================================
  // AGGREGATION
  // ============================================

  /**
   * Get aggregated daily snapshot for a specific date
   * This is the primary method for getting all health data for a day
   */
  getDailySnapshot(date: Date): Promise<HealthResult<DailyHealthSnapshot>>;

  /**
   * Get daily snapshots for a date range
   */
  getDailySnapshots(
    range: DateRange
  ): Promise<HealthResult<DailyHealthSnapshot[]>>;

  /**
   * Sync health data for the last N days
   * Called on app foreground and background fetch
   * @param days - Number of days to sync (default 7)
   */
  syncHealthData(days?: number): Promise<HealthResult<DailyHealthSnapshot[]>>;

  // ============================================
  // SUBSCRIPTIONS (Real-time updates)
  // ============================================

  /**
   * Subscribe to health data updates
   * Called when new data arrives in health store
   */
  subscribeToUpdates(
    callback: (snapshot: DailyHealthSnapshot) => void
  ): () => void; // Returns unsubscribe function

  // ============================================
  // BACKGROUND SYNC
  // ============================================

  /**
   * Initialize background sync (called once at app startup)
   */
  initializeBackgroundSync(): Promise<void>;

  /**
   * Check if background sync is enabled
   */
  isBackgroundSyncEnabled(): Promise<boolean>;
}

// ============================================
// ERROR HELPERS
// ============================================

/**
 * Create standardized health errors
 */
export function createHealthError(
  code: HealthErrorCode,
  message: string,
  recoverable: boolean = true,
  suggestedAction?: string
): HealthError {
  return { code, message, recoverable, suggestedAction };
}

/**
 * Common error factory functions
 */
export const HealthErrors = {
  notAvailable: () =>
    createHealthError(
      'NOT_AVAILABLE',
      'Health data is not available on this device',
      false,
      'This feature requires Apple Health or Health Connect'
    ),

  notAuthorized: (dataType: string) =>
    createHealthError(
      'NOT_AUTHORIZED',
      `Permission not granted for ${dataType}`,
      true,
      'Open Settings to grant health permissions'
    ),

  dataNotFound: (dataType: string, range: string) =>
    createHealthError(
      'DATA_NOT_FOUND',
      `No ${dataType} data found for ${range}`,
      true,
      'Data may not have been recorded yet'
    ),

  queryFailed: (reason: string) =>
    createHealthError(
      'QUERY_FAILED',
      `Health query failed: ${reason}`,
      true,
      'Try again in a moment'
    ),

  syncInProgress: () =>
    createHealthError(
      'SYNC_IN_PROGRESS',
      'A sync is already in progress',
      true,
      'Please wait for the current sync to complete'
    ),
};
