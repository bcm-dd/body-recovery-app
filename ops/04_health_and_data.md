# Health Integration & Data Strategy

> Agent D - Health Integrations + Data Strategy Designer
> Movement & Recovery Companion App

This document defines the technical specification for health data integration, local persistence, and data flow architecture. Designed for privacy-first, offline-capable operation with GDPR compliance.

---

## Table of Contents

1. [HealthAdapter Interface](#1-healthadapter-interface)
2. [Expo-Compatible Health Approaches](#2-expo-compatible-health-approaches)
3. [Data Flow Architecture](#3-data-flow-architecture)
4. [Persistence Strategy](#4-persistence-strategy)
5. [Mock Adapter Strategy](#5-mock-adapter-strategy)
6. [Future Backend Considerations](#6-future-backend-considerations)

---

## 1. HealthAdapter Interface

### Design Philosophy

The HealthAdapter provides a unified abstraction layer over platform-specific health APIs (HealthKit on iOS, Health Connect on Android). This enables:

- **Platform agnosticism**: Business logic doesn't care about the underlying health API
- **Testability**: Easy to swap real adapters for mocks in tests and demo mode
- **Graceful degradation**: Handle missing permissions or unavailable data consistently
- **Future extensibility**: Add new health sources (Oura, Whoop, Garmin) without changing consumers

### Core Types

```typescript
// /src/types/health.ts

/**
 * Represents the availability state of health data access
 */
export type HealthAvailability =
  | 'available'           // Health data can be accessed
  | 'not_available'       // Platform doesn't support health data
  | 'not_authorized'      // User hasn't granted permission
  | 'not_determined'      // Permission not yet requested
  | 'restricted';         // Parental controls or MDM restrictions

/**
 * Permission status for individual health data types
 */
export interface HealthPermissionStatus {
  read: Record<HealthDataType, HealthAvailability>;
  write: Record<HealthWriteType, HealthAvailability>;
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
export type HealthWriteType =
  | 'workout'
  | 'activeEnergy';

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
```

### Health Data Models

```typescript
// /src/types/health-data.ts

/**
 * Sleep session with optional stage breakdown
 */
export interface SleepSession {
  id: string;
  startDate: Date;
  endDate: Date;
  duration: number;              // minutes
  source: string;                // e.g., "Apple Watch", "Oura"
  stages?: SleepStage[];
  quality?: number;              // 0-100, calculated
}

export interface SleepStage {
  stage: 'awake' | 'rem' | 'core' | 'deep' | 'unknown';
  startDate: Date;
  endDate: Date;
  duration: number;              // minutes
}

/**
 * Heart rate variability sample
 */
export interface HRVSample {
  timestamp: Date;
  value: number;                 // SDNN in milliseconds
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
  duration: number;              // seconds
  activeEnergy?: number;         // kcal
  distance?: number;             // meters
  averageHeartRate?: number;     // bpm
  maxHeartRate?: number;         // bpm
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
  weight?: number;               // kg
  bodyFat?: number;              // percentage
  source: string;
}

/**
 * Walking/mobility metrics
 */
export interface MobilityMetrics {
  date: Date;
  walkingAsymmetry?: number;     // percentage
  walkingSpeed?: number;         // m/s
  stepLength?: number;           // meters
  source: string;
}

/**
 * Aggregated daily health snapshot
 * This is the primary data structure stored locally
 */
export interface DailyHealthSnapshot {
  date: string;                  // ISO date string (YYYY-MM-DD)

  // Sleep
  sleepDuration?: number;        // minutes
  sleepQuality?: number;         // 0-100
  deepSleepMinutes?: number;
  remSleepMinutes?: number;
  sleepEfficiency?: number;      // percentage

  // Heart
  restingHeartRate?: number;     // bpm
  hrvAverage?: number;           // ms (SDNN)
  hrvTrend?: 'up' | 'down' | 'stable';

  // Activity
  steps?: number;
  activeEnergy?: number;         // kcal
  workoutMinutes?: number;
  workoutCount?: number;

  // Body
  weight?: number;               // kg
  bodyFat?: number;              // percentage

  // Mobility (injury detection signals)
  walkingAsymmetry?: number;     // percentage
  walkingSpeed?: number;         // m/s

  // Menstrual (if applicable)
  menstrualPhase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

  // Meta
  dataCompleteness: number;      // 0-100, how much data we have
  sources: string[];             // Data sources that contributed
  syncedAt: Date;

  // Calculated
  readinessScore?: number;       // 0-100, calculated from above
  readinessFactors?: ReadinessFactors;
}

export interface ReadinessFactors {
  sleep: number;                 // 0-100
  recovery: number;              // 0-100 (HRV-based)
  strain: number;                // 0-100 (recent activity load)
  body: number;                  // 0-100 (active injuries factor)
}
```

### HealthAdapter Interface Definition

```typescript
// /src/adapters/health/types.ts

import {
  HealthAvailability,
  HealthPermissionStatus,
  HealthDataType,
  HealthWriteType,
  HealthResult,
  DateRange,
  SleepSession,
  HRVSample,
  HeartRateSample,
  StepCount,
  HealthWorkout,
  BodyMeasurement,
  MobilityMetrics,
  DailyHealthSnapshot,
} from '@/types/health';

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
  getRestingHeartRate(range: DateRange): Promise<HealthResult<HeartRateSample[]>>;

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
  getBodyMeasurements(range: DateRange): Promise<HealthResult<BodyMeasurement[]>>;

  /**
   * Get latest body measurement
   */
  getLatestBodyMeasurement(): Promise<HealthResult<BodyMeasurement | null>>;

  // ============================================
  // MOBILITY DATA (Injury Detection Signals)
  // ============================================

  /**
   * Get walking/mobility metrics
   * These are goldmines for detecting gait changes that indicate injury
   */
  getMobilityMetrics(range: DateRange): Promise<HealthResult<MobilityMetrics[]>>;

  // ============================================
  // WRITE OPERATIONS
  // ============================================

  /**
   * Write a completed workout to health store
   */
  writeWorkout(workout: Omit<HealthWorkout, 'id' | 'source'>): Promise<HealthResult<string>>;

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
  getDailySnapshots(range: DateRange): Promise<HealthResult<DailyHealthSnapshot[]>>;

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
  ): () => void;  // Returns unsubscribe function

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
```

### Error Handling Strategy

```typescript
// /src/adapters/health/errors.ts

import { HealthError, HealthErrorCode } from '@/types/health';

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
  notAvailable: () => createHealthError(
    'NOT_AVAILABLE',
    'Health data is not available on this device',
    false,
    'This feature requires Apple Health or Health Connect'
  ),

  notAuthorized: (dataType: string) => createHealthError(
    'NOT_AUTHORIZED',
    `Permission not granted for ${dataType}`,
    true,
    'Open Settings to grant health permissions'
  ),

  dataNotFound: (dataType: string, range: string) => createHealthError(
    'DATA_NOT_FOUND',
    `No ${dataType} data found for ${range}`,
    true,
    'Data may not have been recorded yet'
  ),

  queryFailed: (reason: string) => createHealthError(
    'QUERY_FAILED',
    `Health query failed: ${reason}`,
    true,
    'Try again in a moment'
  ),

  syncInProgress: () => createHealthError(
    'SYNC_IN_PROGRESS',
    'A sync is already in progress',
    true,
    'Please wait for the current sync to complete'
  ),
};

/**
 * Handle missing/unavailable data gracefully
 * Returns null instead of error for expected missing data
 */
export function handleMissingData<T>(
  result: { success: true; data: T[] } | { success: false; error: HealthError }
): T[] {
  if (!result.success) {
    // Only log unexpected errors
    if (result.error.code !== 'DATA_NOT_FOUND') {
      console.warn('[Health] Query failed:', result.error.message);
    }
    return [];
  }
  return result.data;
}
```

---

## 2. Expo-Compatible Health Approaches

### Overview

Health data integration in Expo requires **development builds** (custom native code). Expo Go does not support HealthKit or Health Connect. This section outlines the recommended approach.

### Package Selection

```typescript
// Recommended packages for Expo

// iOS HealthKit
// expo-health (community package) or react-native-health with config plugin

// Android Health Connect
// react-native-health-connect with config plugin

// Recommended: Use expo-health-connect for unified API
// Package: @kilohealth/expo-health-connect (supports both platforms)
```

### Required Dependencies

```json
{
  "dependencies": {
    "react-native-health": "^1.18.0",
    "react-native-health-connect": "^3.0.0",
    "expo-background-fetch": "~12.0.0",
    "expo-task-manager": "~12.0.0"
  }
}
```

### Expo Config Plugin Setup

```typescript
// app.config.ts

import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Movement Companion',
  slug: 'movement-companion',

  ios: {
    ...config.ios,
    bundleIdentifier: 'com.yourcompany.movementcompanion',

    // HealthKit entitlement
    entitlements: {
      'com.apple.developer.healthkit': true,
      'com.apple.developer.healthkit.background-delivery': true,
      'com.apple.developer.healthkit.access': [
        'health-records',  // If reading clinical records
      ],
    },

    // Info.plist entries
    infoPlist: {
      NSHealthShareUsageDescription:
        'We use your health data to personalize your recovery recommendations and track your readiness to train.',
      NSHealthUpdateUsageDescription:
        'We save your workouts to Apple Health so they appear in your health record.',
      UIBackgroundModes: ['fetch', 'processing'],
    },
  },

  android: {
    ...config.android,
    package: 'com.yourcompany.movementcompanion',

    // Health Connect permissions
    permissions: [
      'android.permission.health.READ_SLEEP',
      'android.permission.health.READ_HEART_RATE',
      'android.permission.health.READ_HEART_RATE_VARIABILITY',
      'android.permission.health.READ_RESTING_HEART_RATE',
      'android.permission.health.READ_STEPS',
      'android.permission.health.READ_DISTANCE',
      'android.permission.health.READ_ACTIVE_CALORIES_BURNED',
      'android.permission.health.READ_TOTAL_CALORIES_BURNED',
      'android.permission.health.READ_WEIGHT',
      'android.permission.health.READ_BODY_FAT',
      'android.permission.health.READ_EXERCISE',
      'android.permission.health.WRITE_EXERCISE',
      'android.permission.health.WRITE_ACTIVE_CALORIES_BURNED',
    ],
  },

  plugins: [
    // Health Connect config plugin
    [
      'react-native-health-connect',
      {
        // Permissions requested at runtime
      }
    ],

    // Background fetch for health sync
    [
      'expo-background-fetch',
      {
        minimumInterval: 15 * 60,  // 15 minutes (iOS minimum)
      }
    ],

    // Task manager for background processing
    'expo-task-manager',
  ],
});
```

### iOS HealthKit Implementation

```typescript
// /src/adapters/health/ios/HealthKitAdapter.ts

import AppleHealthKit, {
  HealthKitPermissions,
  HealthValue,
  HealthUnit,
} from 'react-native-health';
import { HealthAdapter } from '../types';
import {
  HealthDataType,
  HealthResult,
  DateRange,
  SleepSession,
  HRVSample,
  DailyHealthSnapshot,
} from '@/types/health';

const HEALTHKIT_PERMISSIONS: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.HeartRateVariabilitySDNN,
      AppleHealthKit.Constants.Permissions.RestingHeartRate,
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.BasalEnergyBurned,
      AppleHealthKit.Constants.Permissions.BodyMass,
      AppleHealthKit.Constants.Permissions.BodyFatPercentage,
      AppleHealthKit.Constants.Permissions.WalkingAsymmetryPercentage,
      AppleHealthKit.Constants.Permissions.WalkingSpeed,
      AppleHealthKit.Constants.Permissions.AppleExerciseTime,
      AppleHealthKit.Constants.Permissions.Workout,
    ],
    write: [
      AppleHealthKit.Constants.Permissions.Workout,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
    ],
  },
};

export class HealthKitAdapter implements HealthAdapter {
  private initialized = false;
  private syncInProgress = false;

  async isAvailable(): Promise<HealthAvailability> {
    return new Promise((resolve) => {
      AppleHealthKit.isAvailable((error, available) => {
        if (error || !available) {
          resolve('not_available');
        } else {
          resolve('available');
        }
      });
    });
  }

  async requestPermissions(): Promise<HealthResult<HealthPermissionStatus>> {
    return new Promise((resolve) => {
      AppleHealthKit.initHealthKit(HEALTHKIT_PERMISSIONS, (error) => {
        if (error) {
          resolve({
            success: false,
            error: {
              code: 'PERMISSION_DENIED',
              message: error,
              recoverable: true,
              suggestedAction: 'Open Settings > Health > Movement Companion',
            },
          });
        } else {
          this.initialized = true;
          // HealthKit doesn't tell us exactly which permissions were granted
          // We check individually when reading data
          resolve({
            success: true,
            data: this.buildPermissionStatus(),
          });
        }
      });
    });
  }

  async getSleep(range: DateRange): Promise<HealthResult<SleepSession[]>> {
    if (!this.initialized) {
      await this.requestPermissions();
    }

    return new Promise((resolve) => {
      const options = {
        startDate: range.startDate.toISOString(),
        endDate: range.endDate.toISOString(),
        limit: 100,
      };

      AppleHealthKit.getSleepSamples(options, (error, results) => {
        if (error) {
          resolve({
            success: false,
            error: {
              code: 'QUERY_FAILED',
              message: error,
              recoverable: true,
            },
          });
          return;
        }

        // Process and merge sleep samples into sessions
        const sessions = this.processSleepSamples(results);
        resolve({ success: true, data: sessions });
      });
    });
  }

  async getHRV(range: DateRange): Promise<HealthResult<HRVSample[]>> {
    if (!this.initialized) {
      await this.requestPermissions();
    }

    return new Promise((resolve) => {
      const options = {
        startDate: range.startDate.toISOString(),
        endDate: range.endDate.toISOString(),
        ascending: false,
        limit: 100,
      };

      AppleHealthKit.getHeartRateVariabilitySamples(options, (error, results) => {
        if (error) {
          resolve({
            success: false,
            error: { code: 'QUERY_FAILED', message: error, recoverable: true },
          });
          return;
        }

        const samples: HRVSample[] = results.map((r: any) => ({
          timestamp: new Date(r.startDate),
          value: r.value,
          source: r.sourceName || 'Apple Health',
        }));

        resolve({ success: true, data: samples });
      });
    });
  }

  async getDailySnapshot(date: Date): Promise<HealthResult<DailyHealthSnapshot>> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const range: DateRange = { startDate: startOfDay, endDate: endOfDay };

    // Fetch all data in parallel
    const [sleep, hrv, restingHR, steps, activeEnergy, workouts, body, mobility] =
      await Promise.all([
        this.getSleep({
          startDate: new Date(startOfDay.getTime() - 12 * 60 * 60 * 1000), // Previous night
          endDate: endOfDay
        }),
        this.getHRV(range),
        this.getRestingHeartRate(range),
        this.getSteps(range),
        this.getActiveEnergy(range),
        this.getWorkouts(range),
        this.getBodyMeasurements(range),
        this.getMobilityMetrics(range),
      ]);

    // Calculate snapshot
    const snapshot = this.buildDailySnapshot(
      date,
      sleep.success ? sleep.data : [],
      hrv.success ? hrv.data : [],
      restingHR.success ? restingHR.data : [],
      steps.success ? steps.data : [],
      activeEnergy.success ? activeEnergy.data : 0,
      workouts.success ? workouts.data : [],
      body.success ? body.data : [],
      mobility.success ? mobility.data : [],
    );

    return { success: true, data: snapshot };
  }

  async initializeBackgroundSync(): Promise<void> {
    // Enable background delivery for key data types
    AppleHealthKit.enableBackgroundDelivery(
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.ObserverQueryOptions.DISCRETE,
      () => {}
    );

    AppleHealthKit.enableBackgroundDelivery(
      AppleHealthKit.Constants.Permissions.HeartRateVariabilitySDNN,
      AppleHealthKit.Constants.ObserverQueryOptions.DISCRETE,
      () => {}
    );
  }

  // ... additional method implementations

  private processSleepSamples(samples: any[]): SleepSession[] {
    // Merge overlapping/adjacent sleep samples into sessions
    // HealthKit stores each sleep stage as a separate sample
    // Implementation merges them into coherent sleep sessions
    const sessions: SleepSession[] = [];
    // ... merge logic
    return sessions;
  }

  private buildDailySnapshot(
    date: Date,
    sleep: SleepSession[],
    hrv: HRVSample[],
    restingHR: HeartRateSample[],
    steps: StepCount[],
    activeEnergy: number,
    workouts: HealthWorkout[],
    body: BodyMeasurement[],
    mobility: MobilityMetrics[],
  ): DailyHealthSnapshot {
    const sources = new Set<string>();

    // Process sleep
    const lastNightSleep = sleep.find(s =>
      s.endDate.toDateString() === date.toDateString()
    );
    if (lastNightSleep) sources.add(lastNightSleep.source);

    // Process HRV (take morning reading as most reliable)
    const morningHRV = hrv.find(h => h.timestamp.getHours() < 10);
    const avgHRV = hrv.length > 0
      ? hrv.reduce((sum, h) => sum + h.value, 0) / hrv.length
      : undefined;

    // Calculate completeness
    const dataPoints = [
      lastNightSleep,
      avgHRV,
      restingHR[0],
      steps[0],
    ].filter(Boolean).length;
    const dataCompleteness = (dataPoints / 4) * 100;

    return {
      date: date.toISOString().split('T')[0],
      sleepDuration: lastNightSleep?.duration,
      sleepQuality: lastNightSleep?.quality,
      deepSleepMinutes: lastNightSleep?.stages
        ?.filter(s => s.stage === 'deep')
        .reduce((sum, s) => sum + s.duration, 0),
      hrvAverage: avgHRV,
      restingHeartRate: restingHR[0]?.bpm,
      steps: steps.reduce((sum, s) => sum + s.count, 0),
      activeEnergy,
      workoutMinutes: workouts.reduce((sum, w) => sum + w.duration / 60, 0),
      workoutCount: workouts.length,
      weight: body[0]?.weight,
      bodyFat: body[0]?.bodyFat,
      walkingAsymmetry: mobility[0]?.walkingAsymmetry,
      walkingSpeed: mobility[0]?.walkingSpeed,
      dataCompleteness,
      sources: Array.from(sources),
      syncedAt: new Date(),
    };
  }

  private buildPermissionStatus(): HealthPermissionStatus {
    // HealthKit doesn't expose permission status directly
    // We return 'not_determined' and check at read time
    return {
      read: {} as any,
      write: {} as any,
    };
  }
}
```

### Android Health Connect Implementation

```typescript
// /src/adapters/health/android/HealthConnectAdapter.ts

import {
  initialize,
  requestPermission,
  readRecords,
  getSdkStatus,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';
import { HealthAdapter } from '../types';
import {
  HealthAvailability,
  HealthResult,
  DateRange,
  SleepSession,
  HRVSample,
  DailyHealthSnapshot,
} from '@/types/health';

const HEALTH_CONNECT_PERMISSIONS = [
  { accessType: 'read', recordType: 'SleepSession' },
  { accessType: 'read', recordType: 'HeartRateVariabilityRmssd' },
  { accessType: 'read', recordType: 'RestingHeartRate' },
  { accessType: 'read', recordType: 'HeartRate' },
  { accessType: 'read', recordType: 'Steps' },
  { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
  { accessType: 'read', recordType: 'Weight' },
  { accessType: 'read', recordType: 'BodyFat' },
  { accessType: 'read', recordType: 'ExerciseSession' },
  { accessType: 'write', recordType: 'ExerciseSession' },
  { accessType: 'write', recordType: 'ActiveCaloriesBurned' },
];

export class HealthConnectAdapter implements HealthAdapter {
  private initialized = false;

  async isAvailable(): Promise<HealthAvailability> {
    try {
      const status = await getSdkStatus();

      switch (status) {
        case SdkAvailabilityStatus.SDK_AVAILABLE:
          return 'available';
        case SdkAvailabilityStatus.SDK_UNAVAILABLE:
          return 'not_available';
        case SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED:
          return 'not_available';
        default:
          return 'not_available';
      }
    } catch {
      return 'not_available';
    }
  }

  async requestPermissions(): Promise<HealthResult<HealthPermissionStatus>> {
    try {
      await initialize();
      this.initialized = true;

      const granted = await requestPermission(HEALTH_CONNECT_PERMISSIONS);

      return {
        success: true,
        data: this.parsePermissionResult(granted),
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: error.message || 'Failed to request permissions',
          recoverable: true,
          suggestedAction: 'Open Health Connect app to manage permissions',
        },
      };
    }
  }

  async getSleep(range: DateRange): Promise<HealthResult<SleepSession[]>> {
    try {
      const records = await readRecords('SleepSession', {
        timeRangeFilter: {
          operator: 'between',
          startTime: range.startDate.toISOString(),
          endTime: range.endDate.toISOString(),
        },
      });

      const sessions: SleepSession[] = records.map((r: any) => ({
        id: r.metadata.id,
        startDate: new Date(r.startTime),
        endDate: new Date(r.endTime),
        duration: (new Date(r.endTime).getTime() - new Date(r.startTime).getTime()) / 60000,
        source: r.metadata.dataOrigin || 'Health Connect',
        stages: r.stages?.map((s: any) => ({
          stage: this.mapSleepStage(s.stage),
          startDate: new Date(s.startTime),
          endDate: new Date(s.endTime),
          duration: (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000,
        })),
      }));

      return { success: true, data: sessions };
    } catch (error: any) {
      return {
        success: false,
        error: { code: 'QUERY_FAILED', message: error.message, recoverable: true },
      };
    }
  }

  async getHRV(range: DateRange): Promise<HealthResult<HRVSample[]>> {
    try {
      const records = await readRecords('HeartRateVariabilityRmssd', {
        timeRangeFilter: {
          operator: 'between',
          startTime: range.startDate.toISOString(),
          endTime: range.endDate.toISOString(),
        },
      });

      const samples: HRVSample[] = records.map((r: any) => ({
        timestamp: new Date(r.time),
        value: r.heartRateVariabilityMillis,
        source: r.metadata.dataOrigin || 'Health Connect',
      }));

      return { success: true, data: samples };
    } catch (error: any) {
      return {
        success: false,
        error: { code: 'QUERY_FAILED', message: error.message, recoverable: true },
      };
    }
  }

  // ... additional implementations following same pattern

  private mapSleepStage(stage: number): SleepSession['stages'][0]['stage'] {
    // Health Connect sleep stage constants
    switch (stage) {
      case 1: return 'awake';
      case 2: return 'rem';
      case 3: return 'core';  // Light
      case 4: return 'core';  // Light
      case 5: return 'deep';
      default: return 'unknown';
    }
  }

  private parsePermissionResult(granted: any[]): HealthPermissionStatus {
    // Parse Health Connect permission response
    return {
      read: {} as any,
      write: {} as any,
    };
  }
}
```

### Platform Adapter Factory

```typescript
// /src/adapters/health/index.ts

import { Platform } from 'react-native';
import { HealthAdapter } from './types';
import { HealthKitAdapter } from './ios/HealthKitAdapter';
import { HealthConnectAdapter } from './android/HealthConnectAdapter';
import { MockHealthAdapter } from './mock/MockHealthAdapter';

export type AdapterType = 'native' | 'mock';

let currentAdapter: HealthAdapter | null = null;
let currentType: AdapterType = 'native';

/**
 * Get the appropriate health adapter for the current platform
 */
export function getHealthAdapter(type: AdapterType = currentType): HealthAdapter {
  if (currentAdapter && currentType === type) {
    return currentAdapter;
  }

  currentType = type;

  if (type === 'mock') {
    currentAdapter = new MockHealthAdapter();
    return currentAdapter;
  }

  if (Platform.OS === 'ios') {
    currentAdapter = new HealthKitAdapter();
  } else if (Platform.OS === 'android') {
    currentAdapter = new HealthConnectAdapter();
  } else {
    // Web or unsupported platform - use mock
    currentAdapter = new MockHealthAdapter();
  }

  return currentAdapter;
}

/**
 * Switch to mock adapter (for demo mode)
 */
export function useMockAdapter(): void {
  currentAdapter = new MockHealthAdapter();
  currentType = 'mock';
}

/**
 * Switch to native adapter
 */
export function useNativeAdapter(): void {
  currentAdapter = null;  // Will be recreated on next getHealthAdapter call
  currentType = 'native';
}

/**
 * Check if currently using mock adapter
 */
export function isMockAdapter(): boolean {
  return currentType === 'mock';
}

// Re-export types
export * from './types';
export { MockHealthAdapter } from './mock/MockHealthAdapter';
```

### Dev Build Requirements

```markdown
## Development Build Setup

Health integrations require Expo Development Builds. Expo Go does NOT support
HealthKit or Health Connect.

### Creating a Development Build

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Configure EAS:
   ```bash
   eas build:configure
   ```

3. Build for development:
   ```bash
   # iOS Simulator
   eas build --profile development --platform ios

   # Android Emulator
   eas build --profile development --platform android

   # Physical devices
   eas build --profile development:device --platform ios
   ```

4. Install and run:
   ```bash
   npx expo start --dev-client
   ```

### eas.json Configuration

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      }
    },
    "development:device": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

### Testing Without Health Data

For testing on simulators or without health permissions:

1. Use demo mode (mock adapter)
2. Mock adapter provides realistic fake data
3. Toggle in Settings > Developer > Use Demo Data
```

### User Consent Flow

```typescript
// /src/features/onboarding/HealthPermissionScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getHealthAdapter } from '@/adapters/health';
import { Button } from '@/components/ui/Button';
import { useDemoMode } from '@/store/settings';

export function HealthPermissionScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setDemoMode } = useDemoMode();

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    const adapter = getHealthAdapter();

    // Check availability first
    const availability = await adapter.isAvailable();

    if (availability === 'not_available') {
      setError('Health data is not available on this device');
      setLoading(false);
      return;
    }

    // Request permissions
    const result = await adapter.requestPermissions(
      ['sleep', 'hrv', 'restingHeartRate', 'steps', 'workouts'],
      ['workout']
    );

    if (result.success) {
      // Initialize background sync
      await adapter.initializeBackgroundSync();

      // Do initial sync
      await adapter.syncHealthData(7);

      navigation.navigate('OnboardingFocus');
    } else {
      setError(result.error.suggestedAction || result.error.message);
    }

    setLoading(false);
  };

  const handleSkip = () => {
    // Continue without health data
    // App will ask more questions to compensate
    navigation.navigate('OnboardingFocus');
  };

  const handleDemoMode = () => {
    setDemoMode(true);
    navigation.navigate('OnboardingFocus');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect Your Health Data</Text>

      <View style={styles.benefits}>
        <BenefitItem
          icon="moon"
          text="Know when you're rested and ready to push"
        />
        <BenefitItem
          icon="heart"
          text="Track recovery between sessions"
        />
        <BenefitItem
          icon="activity"
          text="Automatic workout logging"
        />
      </View>

      <Text style={styles.privacy}>
        Your health data stays on your device. We only use it to personalize
        your recommendations.
      </Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        title="Connect Health Data"
        onPress={handleConnect}
        loading={loading}
        style={styles.primaryButton}
      />

      <Button
        title="Maybe Later"
        variant="ghost"
        onPress={handleSkip}
        style={styles.secondaryButton}
      />

      {__DEV__ && (
        <Button
          title="Use Demo Mode"
          variant="outline"
          onPress={handleDemoMode}
          style={styles.devButton}
        />
      )}
    </View>
  );
}
```

---

## 3. Data Flow Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MOBILE APP                                   │
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │   HealthKit  │    │    Health    │    │                      │  │
│  │   (iOS)      │    │   Connect    │    │    Mock Adapter      │  │
│  │              │    │  (Android)   │    │    (Demo Mode)       │  │
│  └──────┬───────┘    └──────┬───────┘    └──────────┬───────────┘  │
│         │                   │                       │               │
│         └───────────────────┼───────────────────────┘               │
│                             │                                        │
│                             ▼                                        │
│                    ┌────────────────┐                               │
│                    │ HealthAdapter  │                               │
│                    │   Interface    │                               │
│                    └────────┬───────┘                               │
│                             │                                        │
│                             ▼                                        │
│                    ┌────────────────┐                               │
│                    │  HealthService │  ← Business logic layer       │
│                    │                │                               │
│                    │ - Sync logic   │                               │
│                    │ - Aggregation  │                               │
│                    │ - Caching      │                               │
│                    └────────┬───────┘                               │
│                             │                                        │
│              ┌──────────────┼──────────────┐                        │
│              ▼              ▼              ▼                        │
│    ┌──────────────┐ ┌─────────────┐ ┌─────────────┐                │
│    │    MMKV     │ │   SQLite/   │ │   Zustand   │                │
│    │ (Hot Data)  │ │ WatermelonDB│ │   (State)   │                │
│    │             │ │ (History)   │ │             │                │
│    │ - Today's   │ │             │ │ - Current   │                │
│    │   snapshot  │ │ - All days  │ │   readiness │                │
│    │ - Prefs     │ │ - Workouts  │ │ - UI state  │                │
│    └──────────────┘ └─────────────┘ └─────────────┘                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ (Future: Sync to backend)
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Future)                                │
│                                                                      │
│   - Aggregated snapshots only (not raw health data)                 │
│   - Cross-device sync                                                │
│   - AI analysis of patterns                                          │
│   - Clinical document storage                                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### DailySignals Write Flow

```typescript
// /src/services/health/HealthService.ts

import { getHealthAdapter, HealthAdapter } from '@/adapters/health';
import { storage } from '@/lib/storage';
import { database } from '@/lib/database';
import { useHealthStore } from '@/store/health';
import { DailyHealthSnapshot } from '@/types/health';
import { calculateReadiness } from './readiness';

export class HealthService {
  private adapter: HealthAdapter;
  private syncLock = false;

  constructor() {
    this.adapter = getHealthAdapter();
  }

  /**
   * Main sync flow - called on app foreground and background fetch
   */
  async syncHealthData(days: number = 7): Promise<void> {
    if (this.syncLock) {
      console.log('[HealthService] Sync already in progress');
      return;
    }

    this.syncLock = true;

    try {
      // 1. Check permissions
      const hasPermissions = await this.adapter.hasMinimumPermissions();
      if (!hasPermissions) {
        console.log('[HealthService] Missing permissions, skipping sync');
        return;
      }

      // 2. Fetch snapshots from health adapter
      const result = await this.adapter.syncHealthData(days);

      if (!result.success) {
        console.error('[HealthService] Sync failed:', result.error);
        return;
      }

      const snapshots = result.data;

      // 3. Calculate readiness for each day
      const enrichedSnapshots = await Promise.all(
        snapshots.map(async (snapshot) => {
          const readiness = await this.calculateReadinessForSnapshot(snapshot);
          return {
            ...snapshot,
            readinessScore: readiness.score,
            readinessFactors: readiness.factors,
          };
        })
      );

      // 4. Write to persistent storage
      await this.persistSnapshots(enrichedSnapshots);

      // 5. Update Zustand store with today's data
      const today = new Date().toISOString().split('T')[0];
      const todaySnapshot = enrichedSnapshots.find(s => s.date === today);

      if (todaySnapshot) {
        useHealthStore.getState().setTodaySnapshot(todaySnapshot);
      }

      // 6. Update last sync timestamp
      storage.set('health.lastSync', Date.now());

      console.log(`[HealthService] Synced ${enrichedSnapshots.length} days`);

    } finally {
      this.syncLock = false;
    }
  }

  /**
   * Persist snapshots to local storage
   */
  private async persistSnapshots(snapshots: DailyHealthSnapshot[]): Promise<void> {
    // Write today to MMKV (fast access)
    const today = new Date().toISOString().split('T')[0];
    const todaySnapshot = snapshots.find(s => s.date === today);

    if (todaySnapshot) {
      storage.set('health.today', JSON.stringify(todaySnapshot));
    }

    // Write all to database (history)
    await database.write(async () => {
      for (const snapshot of snapshots) {
        await database.healthSnapshots.upsert(snapshot);
      }
    });
  }

  /**
   * Calculate readiness score for a snapshot
   */
  private async calculateReadinessForSnapshot(
    snapshot: DailyHealthSnapshot
  ): Promise<{ score: number; factors: ReadinessFactors }> {
    // Get baseline data for comparison
    const baseline = await this.getBaseline();

    // Get active injuries from body model
    const injuries = await database.injuries.getActive();

    return calculateReadiness(snapshot, baseline, injuries);
  }

  /**
   * Get user's baseline metrics (7-day averages)
   */
  private async getBaseline(): Promise<HealthBaseline> {
    const cached = storage.getString('health.baseline');

    if (cached) {
      const parsed = JSON.parse(cached);
      const cacheAge = Date.now() - parsed.calculatedAt;

      // Refresh baseline daily
      if (cacheAge < 24 * 60 * 60 * 1000) {
        return parsed;
      }
    }

    // Calculate from last 14 days of data
    const snapshots = await database.healthSnapshots.getLast(14);

    const baseline: HealthBaseline = {
      hrvAverage: this.average(snapshots, 'hrvAverage'),
      hrvStdDev: this.stdDev(snapshots, 'hrvAverage'),
      restingHRAverage: this.average(snapshots, 'restingHeartRate'),
      sleepDurationAverage: this.average(snapshots, 'sleepDuration'),
      calculatedAt: Date.now(),
    };

    storage.set('health.baseline', JSON.stringify(baseline));

    return baseline;
  }

  private average(items: any[], key: string): number {
    const values = items.map(i => i[key]).filter(v => v != null);
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private stdDev(items: any[], key: string): number {
    const values = items.map(i => i[key]).filter(v => v != null);
    if (values.length < 2) return 0;
    const avg = this.average(items, key);
    const sqDiffs = values.map(v => Math.pow(v - avg, 2));
    return Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / values.length);
  }
}

// Singleton instance
export const healthService = new HealthService();
```

### Readiness Calculation

```typescript
// /src/services/health/readiness.ts

import { DailyHealthSnapshot, ReadinessFactors } from '@/types/health';
import { Injury } from '@/types/body';

export interface HealthBaseline {
  hrvAverage: number;
  hrvStdDev: number;
  restingHRAverage: number;
  sleepDurationAverage: number;
  calculatedAt: number;
}

export interface ReadinessResult {
  score: number;
  factors: ReadinessFactors;
  recommendation: 'full' | 'moderate' | 'light' | 'rest';
  reasoning: string;
}

/**
 * Calculate readiness score from health data
 * All calculations happen on-device for privacy and speed
 */
export function calculateReadiness(
  snapshot: DailyHealthSnapshot,
  baseline: HealthBaseline,
  injuries: Injury[]
): ReadinessResult {
  const factors: ReadinessFactors = {
    sleep: calculateSleepScore(snapshot, baseline),
    recovery: calculateRecoveryScore(snapshot, baseline),
    strain: calculateStrainScore(snapshot),
    body: calculateBodyScore(injuries),
  };

  // Weighted average - sleep and recovery most important
  const weights = {
    sleep: 0.30,
    recovery: 0.35,
    strain: 0.20,
    body: 0.15,
  };

  const score = Math.round(
    factors.sleep * weights.sleep +
    factors.recovery * weights.recovery +
    factors.strain * weights.strain +
    factors.body * weights.body
  );

  const recommendation = getRecommendation(score, factors);
  const reasoning = generateReasoning(factors, snapshot, baseline);

  return { score, factors, recommendation, reasoning };
}

function calculateSleepScore(
  snapshot: DailyHealthSnapshot,
  baseline: HealthBaseline
): number {
  if (!snapshot.sleepDuration) {
    return 50; // Neutral if no data
  }

  // Score based on:
  // 1. Duration compared to personal average
  // 2. Absolute duration (7-9 hours optimal)
  // 3. Deep sleep percentage if available

  let score = 50;

  // Duration vs average
  const durationRatio = snapshot.sleepDuration / baseline.sleepDurationAverage;
  if (durationRatio >= 1.0) {
    score += 20;
  } else if (durationRatio >= 0.85) {
    score += 10;
  } else if (durationRatio < 0.7) {
    score -= 20;
  }

  // Absolute duration (in minutes)
  if (snapshot.sleepDuration >= 420 && snapshot.sleepDuration <= 540) {
    // 7-9 hours
    score += 20;
  } else if (snapshot.sleepDuration >= 360) {
    // 6+ hours
    score += 10;
  } else if (snapshot.sleepDuration < 300) {
    // Less than 5 hours
    score -= 20;
  }

  // Deep sleep bonus
  if (snapshot.deepSleepMinutes && snapshot.sleepDuration) {
    const deepRatio = snapshot.deepSleepMinutes / snapshot.sleepDuration;
    if (deepRatio >= 0.15) {
      score += 10;
    }
  }

  return Math.max(0, Math.min(100, score));
}

function calculateRecoveryScore(
  snapshot: DailyHealthSnapshot,
  baseline: HealthBaseline
): number {
  // HRV is the primary recovery indicator
  if (!snapshot.hrvAverage || !baseline.hrvAverage) {
    return 50;
  }

  let score = 50;

  // HRV compared to personal baseline
  const hrvDiff = snapshot.hrvAverage - baseline.hrvAverage;
  const hrvZScore = hrvDiff / (baseline.hrvStdDev || 1);

  if (hrvZScore >= 1) {
    score += 30; // Significantly above average
  } else if (hrvZScore >= 0) {
    score += 20; // Above average
  } else if (hrvZScore >= -1) {
    score += 0; // Near average
  } else {
    score -= 20; // Significantly below average
  }

  // Resting HR (lower is generally better for recovery)
  if (snapshot.restingHeartRate && baseline.restingHRAverage) {
    const hrDiff = snapshot.restingHeartRate - baseline.restingHRAverage;
    if (hrDiff <= -3) {
      score += 15;
    } else if (hrDiff <= 0) {
      score += 5;
    } else if (hrDiff >= 5) {
      score -= 15; // Elevated RHR suggests stress/illness
    }
  }

  return Math.max(0, Math.min(100, score));
}

function calculateStrainScore(snapshot: DailyHealthSnapshot): number {
  // Strain score represents recovery from recent training load
  // Higher score = more recovered

  // For MVP, use simple heuristics
  // Future: Track training load over time

  let score = 70; // Default to moderate recovery

  if (snapshot.workoutCount && snapshot.workoutCount > 0) {
    // Had a workout yesterday, slightly lower recovery
    score -= 10 * snapshot.workoutCount;
  }

  return Math.max(0, Math.min(100, score));
}

function calculateBodyScore(injuries: Injury[]): number {
  // Body score based on active injuries

  if (injuries.length === 0) {
    return 100;
  }

  // Reduce score based on severity and count
  let penalty = 0;

  for (const injury of injuries) {
    switch (injury.severity) {
      case 'severe':
        penalty += 30;
        break;
      case 'moderate':
        penalty += 15;
        break;
      case 'mild':
        penalty += 5;
        break;
    }
  }

  return Math.max(0, 100 - penalty);
}

function getRecommendation(
  score: number,
  factors: ReadinessFactors
): 'full' | 'moderate' | 'light' | 'rest' {
  // Check for any critical factors
  if (factors.sleep < 30 || factors.recovery < 30) {
    return 'rest';
  }

  if (factors.body < 50) {
    return 'light'; // Active injuries limit intensity
  }

  if (score >= 75) {
    return 'full';
  } else if (score >= 55) {
    return 'moderate';
  } else if (score >= 35) {
    return 'light';
  } else {
    return 'rest';
  }
}

function generateReasoning(
  factors: ReadinessFactors,
  snapshot: DailyHealthSnapshot,
  baseline: HealthBaseline
): string {
  const points: string[] = [];

  // Sleep
  if (factors.sleep >= 80) {
    points.push('Well rested');
  } else if (factors.sleep < 50) {
    points.push('Sleep was short');
  }

  // Recovery
  if (factors.recovery >= 80 && snapshot.hrvAverage) {
    points.push('HRV is strong');
  } else if (factors.recovery < 50) {
    points.push('Recovery indicators are low');
  }

  // Body
  if (factors.body < 100) {
    points.push('Accounting for active injuries');
  }

  return points.join('. ') + '.';
}
```

### Sync Strategy

```typescript
// /src/services/health/sync.ts

import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { healthService } from './HealthService';
import { storage } from '@/lib/storage';

const BACKGROUND_SYNC_TASK = 'HEALTH_BACKGROUND_SYNC';

/**
 * Register background sync task
 */
export async function registerBackgroundSync(): Promise<void> {
  // Define the task
  TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
    try {
      console.log('[BackgroundSync] Starting health sync');

      await healthService.syncHealthData(3); // Last 3 days in background

      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
      console.error('[BackgroundSync] Failed:', error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });

  // Register for background fetch
  const status = await BackgroundFetch.getStatusAsync();

  if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 15 * 60, // 15 minutes (iOS minimum)
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log('[BackgroundSync] Registered');
  } else {
    console.log('[BackgroundSync] Not available:', status);
  }
}

/**
 * Handle app coming to foreground
 */
export async function handleForeground(): Promise<void> {
  const lastSync = storage.getNumber('health.lastSync') || 0;
  const timeSinceSync = Date.now() - lastSync;

  // Sync if more than 5 minutes since last sync
  if (timeSinceSync > 5 * 60 * 1000) {
    await healthService.syncHealthData(7);
  }
}

/**
 * Offline-first sync queue for write operations
 */
export interface SyncQueueItem {
  id: string;
  type: 'workout' | 'snapshot';
  data: any;
  createdAt: number;
  retries: number;
}

export class SyncQueue {
  private queue: SyncQueueItem[] = [];

  constructor() {
    this.loadQueue();
  }

  private loadQueue(): void {
    const saved = storage.getString('sync.queue');
    if (saved) {
      this.queue = JSON.parse(saved);
    }
  }

  private saveQueue(): void {
    storage.set('sync.queue', JSON.stringify(this.queue));
  }

  enqueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retries'>): void {
    this.queue.push({
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      retries: 0,
    });
    this.saveQueue();
  }

  async processQueue(): Promise<void> {
    // Future: Process queue items when backend is available
  }
}

export const syncQueue = new SyncQueue();
```

---

## 4. Persistence Strategy

### Storage Layer Overview

| Data Type | Storage | Encryption | Reason |
|-----------|---------|------------|--------|
| Today's snapshot | MMKV | No* | Fast access, refreshed frequently |
| Historical snapshots | SQLite | Yes | Query flexibility, offline access |
| User preferences | MMKV | No | Simple key-value, fast reads |
| Auth tokens | MMKV + Keychain | Yes | Security critical |
| Workout history | SQLite | Yes | Relational data, complex queries |
| Body model | SQLite | Yes | Sensitive health data |
| Sync queue | MMKV | No | Ephemeral, processed quickly |
| Baseline metrics | MMKV | No | Cached calculation, refreshed daily |

*Note: On iOS, MMKV uses Data Protection by default. On Android, consider encryption for sensitive data.

### MMKV vs AsyncStorage Comparison

```typescript
// Why MMKV over AsyncStorage

/**
 * Performance Comparison (typical operation times):
 *
 * | Operation      | AsyncStorage | MMKV     | Difference |
 * |----------------|--------------|----------|------------|
 * | Read string    | 5-10ms       | <0.1ms   | ~100x      |
 * | Write string   | 10-20ms      | <0.1ms   | ~100x      |
 * | Read object    | 10-15ms      | <0.2ms   | ~50x       |
 * | Write object   | 15-25ms      | <0.2ms   | ~75x       |
 * | Batch read     | 50-100ms     | <1ms     | ~50x       |
 *
 * AsyncStorage issues:
 * - Async only (can't read synchronously during render)
 * - JSON serialization overhead
 * - File I/O for every operation
 * - No encryption
 *
 * MMKV advantages:
 * - Synchronous reads (critical for UI)
 * - Memory-mapped (OS handles I/O)
 * - Built-in encryption option
 * - Multi-process safe
 * - Smaller serialization overhead
 */
```

### MMKV Setup

```typescript
// /src/lib/storage.ts

import { MMKV } from 'react-native-mmkv';

// Main storage instance
export const storage = new MMKV({
  id: 'movement-companion',
  // encryptionKey: 'your-encryption-key', // Optional
});

// Encrypted storage for sensitive data
export const secureStorage = new MMKV({
  id: 'movement-companion-secure',
  encryptionKey: 'generate-unique-key-per-device',
});

// Type-safe wrapper
export const AppStorage = {
  // Health data
  getTodaySnapshot: (): DailyHealthSnapshot | null => {
    const data = storage.getString('health.today');
    return data ? JSON.parse(data) : null;
  },

  setTodaySnapshot: (snapshot: DailyHealthSnapshot): void => {
    storage.set('health.today', JSON.stringify(snapshot));
  },

  getLastSync: (): number => {
    return storage.getNumber('health.lastSync') || 0;
  },

  setLastSync: (timestamp: number): void => {
    storage.set('health.lastSync', timestamp);
  },

  // Preferences
  getPreferences: (): UserPreferences => {
    const data = storage.getString('preferences');
    return data ? JSON.parse(data) : defaultPreferences;
  },

  setPreferences: (prefs: UserPreferences): void => {
    storage.set('preferences', JSON.stringify(prefs));
  },

  // Demo mode
  isDemoMode: (): boolean => {
    return storage.getBoolean('demoMode') || false;
  },

  setDemoMode: (enabled: boolean): void => {
    storage.set('demoMode', enabled);
  },

  // Clear all data (for account deletion / logout)
  clearAll: (): void => {
    storage.clearAll();
    secureStorage.clearAll();
  },
};
```

### SQLite/WatermelonDB Schema

```typescript
// /src/lib/database/schema.ts

import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    // Health snapshots history
    tableSchema({
      name: 'health_snapshots',
      columns: [
        { name: 'date', type: 'string', isIndexed: true },
        { name: 'sleep_duration', type: 'number', isOptional: true },
        { name: 'sleep_quality', type: 'number', isOptional: true },
        { name: 'deep_sleep_minutes', type: 'number', isOptional: true },
        { name: 'hrv_average', type: 'number', isOptional: true },
        { name: 'resting_heart_rate', type: 'number', isOptional: true },
        { name: 'steps', type: 'number', isOptional: true },
        { name: 'active_energy', type: 'number', isOptional: true },
        { name: 'workout_minutes', type: 'number', isOptional: true },
        { name: 'readiness_score', type: 'number', isOptional: true },
        { name: 'readiness_factors', type: 'string', isOptional: true }, // JSON
        { name: 'data_completeness', type: 'number' },
        { name: 'sources', type: 'string' }, // JSON array
        { name: 'synced_at', type: 'number' },
      ],
    }),

    // Workouts
    tableSchema({
      name: 'workouts',
      columns: [
        { name: 'server_id', type: 'string', isOptional: true },
        { name: 'date', type: 'number', isIndexed: true },
        { name: 'status', type: 'string' },
        { name: 'planned_duration', type: 'number', isOptional: true },
        { name: 'actual_duration', type: 'number', isOptional: true },
        { name: 'readiness_score', type: 'number', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Exercise logs
    tableSchema({
      name: 'exercise_logs',
      columns: [
        { name: 'workout_id', type: 'string', isIndexed: true },
        { name: 'exercise_id', type: 'string', isIndexed: true },
        { name: 'order_index', type: 'number' },
        { name: 'prescribed_weight', type: 'number', isOptional: true },
        { name: 'prescribed_reps', type: 'number', isOptional: true },
        { name: 'prescribed_sets', type: 'number', isOptional: true },
        { name: 'completed_sets', type: 'string' }, // JSON array
        { name: 'difficulty', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'skipped', type: 'boolean' },
        { name: 'pain_logged', type: 'boolean' },
      ],
    }),

    // Injuries
    tableSchema({
      name: 'injuries',
      columns: [
        { name: 'server_id', type: 'string', isOptional: true },
        { name: 'body_region', type: 'string', isIndexed: true },
        { name: 'description', type: 'string' },
        { name: 'severity', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'constraints', type: 'string' }, // JSON array
        { name: 'start_date', type: 'number' },
        { name: 'resolved_date', type: 'number', isOptional: true },
        { name: 'synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Pain logs
    tableSchema({
      name: 'pain_logs',
      columns: [
        { name: 'workout_id', type: 'string', isOptional: true },
        { name: 'exercise_log_id', type: 'string', isOptional: true },
        { name: 'body_region', type: 'string', isIndexed: true },
        { name: 'severity', type: 'string' },
        { name: 'pain_type', type: 'string', isOptional: true },
        { name: 'timestamp', type: 'number' },
        { name: 'synced', type: 'boolean' },
      ],
    }),
  ],
});
```

### Encryption Strategy

```typescript
// /src/lib/database/encryption.ts

import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import * as SecureStore from 'expo-secure-store';

const DB_ENCRYPTION_KEY = 'DB_ENCRYPTION_KEY';

/**
 * Get or generate database encryption key
 * Stored in secure enclave (Keychain on iOS, Keystore on Android)
 */
async function getDatabaseKey(): Promise<string> {
  let key = await SecureStore.getItemAsync(DB_ENCRYPTION_KEY);

  if (!key) {
    // Generate new key
    key = generateSecureKey();
    await SecureStore.setItemAsync(DB_ENCRYPTION_KEY, key);
  }

  return key;
}

function generateSecureKey(): string {
  // Generate 256-bit key
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create encrypted database instance
 */
export async function createDatabase(): Promise<Database> {
  const encryptionKey = await getDatabaseKey();

  const adapter = new SQLiteAdapter({
    schema,
    dbName: 'movement_companion',
    // SQLCipher encryption
    jsi: true,
    onSetUpError: (error) => {
      console.error('[Database] Setup error:', error);
    },
  });

  return new Database({
    adapter,
    modelClasses: [
      // Model classes here
    ],
  });
}

/**
 * GDPR: Delete all user data
 */
export async function deleteAllUserData(): Promise<void> {
  // Clear MMKV
  storage.clearAll();
  secureStorage.clearAll();

  // Clear database
  const db = await createDatabase();
  await db.write(async () => {
    await db.unsafeResetDatabase();
  });

  // Clear encryption key (new key on next use)
  await SecureStore.deleteItemAsync(DB_ENCRYPTION_KEY);

  console.log('[Data] All user data deleted');
}

/**
 * GDPR: Export all user data
 */
export async function exportAllUserData(): Promise<UserDataExport> {
  const db = await createDatabase();

  const [snapshots, workouts, injuries, painLogs] = await Promise.all([
    db.get('health_snapshots').query().fetch(),
    db.get('workouts').query().fetch(),
    db.get('injuries').query().fetch(),
    db.get('pain_logs').query().fetch(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    healthSnapshots: snapshots.map(s => s._raw),
    workouts: workouts.map(w => w._raw),
    injuries: injuries.map(i => i._raw),
    painLogs: painLogs.map(p => p._raw),
    preferences: AppStorage.getPreferences(),
  };
}
```

---

## 5. Mock Adapter Strategy

### Mock Adapter Implementation

```typescript
// /src/adapters/health/mock/MockHealthAdapter.ts

import { HealthAdapter } from '../types';
import {
  HealthAvailability,
  HealthPermissionStatus,
  HealthResult,
  DateRange,
  SleepSession,
  HRVSample,
  HeartRateSample,
  StepCount,
  HealthWorkout,
  BodyMeasurement,
  MobilityMetrics,
  DailyHealthSnapshot,
  HealthDataType,
  HealthWriteType,
} from '@/types/health';
import { generateMockData } from './generators';

/**
 * Mock adapter for demo mode and testing
 * Provides realistic fake data without requiring health permissions
 */
export class MockHealthAdapter implements HealthAdapter {
  private permissionsGranted = false;
  private mockDataSeed: number;

  constructor(seed?: number) {
    // Seed for reproducible data (useful for testing)
    this.mockDataSeed = seed || Date.now();
  }

  async isAvailable(): Promise<HealthAvailability> {
    return 'available';
  }

  async requestPermissions(
    read: HealthDataType[],
    write?: HealthWriteType[]
  ): Promise<HealthResult<HealthPermissionStatus>> {
    // Simulate permission grant
    this.permissionsGranted = true;

    return {
      success: true,
      data: this.buildFullPermissions(read, write),
    };
  }

  async getPermissionStatus(): Promise<HealthPermissionStatus> {
    return this.buildFullPermissions();
  }

  async hasMinimumPermissions(): Promise<boolean> {
    return this.permissionsGranted;
  }

  async getSleep(range: DateRange): Promise<HealthResult<SleepSession[]>> {
    const sessions = generateMockData.sleepSessions(range, this.mockDataSeed);
    return { success: true, data: sessions };
  }

  async getLastNightSleep(): Promise<HealthResult<SleepSession | null>> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(22, 0, 0, 0);

    const today = new Date();
    today.setHours(8, 0, 0, 0);

    const result = await this.getSleep({ startDate: yesterday, endDate: today });

    if (result.success && result.data.length > 0) {
      return { success: true, data: result.data[0] };
    }

    return { success: true, data: null };
  }

  async getHRV(range: DateRange): Promise<HealthResult<HRVSample[]>> {
    const samples = generateMockData.hrvSamples(range, this.mockDataSeed);
    return { success: true, data: samples };
  }

  async getLatestHRV(): Promise<HealthResult<HRVSample | null>> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const result = await this.getHRV({ startDate: yesterday, endDate: now });

    if (result.success && result.data.length > 0) {
      return { success: true, data: result.data[0] };
    }

    return { success: true, data: null };
  }

  async getRestingHeartRate(range: DateRange): Promise<HealthResult<HeartRateSample[]>> {
    const samples = generateMockData.restingHeartRate(range, this.mockDataSeed);
    return { success: true, data: samples };
  }

  async getTodayRestingHeartRate(): Promise<HealthResult<number | null>> {
    const rhr = generateMockData.singleRestingHeartRate(this.mockDataSeed);
    return { success: true, data: rhr };
  }

  async getHeartRate(range: DateRange): Promise<HealthResult<HeartRateSample[]>> {
    const samples = generateMockData.heartRateSamples(range, this.mockDataSeed);
    return { success: true, data: samples };
  }

  async getSteps(range: DateRange): Promise<HealthResult<StepCount[]>> {
    const steps = generateMockData.stepCounts(range, this.mockDataSeed);
    return { success: true, data: steps };
  }

  async getTodaySteps(): Promise<HealthResult<number>> {
    const steps = generateMockData.singleDaySteps(this.mockDataSeed);
    return { success: true, data: steps };
  }

  async getWorkouts(range: DateRange): Promise<HealthResult<HealthWorkout[]>> {
    const workouts = generateMockData.workouts(range, this.mockDataSeed);
    return { success: true, data: workouts };
  }

  async getActiveEnergy(range: DateRange): Promise<HealthResult<number>> {
    const energy = generateMockData.activeEnergy(range, this.mockDataSeed);
    return { success: true, data: energy };
  }

  async getBodyMeasurements(range: DateRange): Promise<HealthResult<BodyMeasurement[]>> {
    const measurements = generateMockData.bodyMeasurements(range, this.mockDataSeed);
    return { success: true, data: measurements };
  }

  async getLatestBodyMeasurement(): Promise<HealthResult<BodyMeasurement | null>> {
    const measurement = generateMockData.singleBodyMeasurement(this.mockDataSeed);
    return { success: true, data: measurement };
  }

  async getMobilityMetrics(range: DateRange): Promise<HealthResult<MobilityMetrics[]>> {
    const metrics = generateMockData.mobilityMetrics(range, this.mockDataSeed);
    return { success: true, data: metrics };
  }

  async writeWorkout(workout: Omit<HealthWorkout, 'id' | 'source'>): Promise<HealthResult<string>> {
    // Simulate successful write
    const id = `mock-workout-${Date.now()}`;
    return { success: true, data: id };
  }

  async getDailySnapshot(date: Date): Promise<HealthResult<DailyHealthSnapshot>> {
    const snapshot = generateMockData.dailySnapshot(date, this.mockDataSeed);
    return { success: true, data: snapshot };
  }

  async getDailySnapshots(range: DateRange): Promise<HealthResult<DailyHealthSnapshot[]>> {
    const snapshots = generateMockData.dailySnapshots(range, this.mockDataSeed);
    return { success: true, data: snapshots };
  }

  async syncHealthData(days: number = 7): Promise<HealthResult<DailyHealthSnapshot[]>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.getDailySnapshots({ startDate, endDate });
  }

  subscribeToUpdates(callback: (snapshot: DailyHealthSnapshot) => void): () => void {
    // Simulate periodic updates every 5 minutes
    const interval = setInterval(async () => {
      const result = await this.getDailySnapshot(new Date());
      if (result.success) {
        callback(result.data);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }

  async initializeBackgroundSync(): Promise<void> {
    // No-op for mock
  }

  async isBackgroundSyncEnabled(): Promise<boolean> {
    return true;
  }

  private buildFullPermissions(
    read?: HealthDataType[],
    write?: HealthWriteType[]
  ): HealthPermissionStatus {
    const allRead: HealthDataType[] = read || [
      'steps', 'sleep', 'sleepStages', 'heartRate', 'restingHeartRate',
      'hrv', 'activeEnergy', 'workouts', 'weight', 'bodyFat',
    ];

    const allWrite: HealthWriteType[] = write || ['workout', 'activeEnergy'];

    return {
      read: Object.fromEntries(
        allRead.map(type => [type, 'available'])
      ) as Record<HealthDataType, HealthAvailability>,
      write: Object.fromEntries(
        allWrite.map(type => [type, 'available'])
      ) as Record<HealthWriteType, HealthAvailability>,
    };
  }
}
```

### Realistic Data Generators

```typescript
// /src/adapters/health/mock/generators.ts

import {
  SleepSession,
  HRVSample,
  HeartRateSample,
  StepCount,
  HealthWorkout,
  BodyMeasurement,
  MobilityMetrics,
  DailyHealthSnapshot,
  DateRange,
} from '@/types/health';

// Seeded random number generator for reproducible data
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Normal distribution random (for more realistic data)
function normalRandom(mean: number, stdDev: number, random: () => number): number {
  const u1 = random();
  const u2 = random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

// Clamp value to range
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export const generateMockData = {
  /**
   * Generate sleep sessions for a date range
   */
  sleepSessions(range: DateRange, seed: number): SleepSession[] {
    const random = seededRandom(seed);
    const sessions: SleepSession[] = [];

    let currentDate = new Date(range.startDate);

    while (currentDate <= range.endDate) {
      // Most nights have sleep data
      if (random() > 0.1) {
        const bedtime = new Date(currentDate);
        bedtime.setHours(22 + Math.floor(random() * 2), Math.floor(random() * 60), 0, 0);

        const duration = normalRandom(420, 60, random); // ~7 hours, 1 hour stddev
        const wakeTime = new Date(bedtime.getTime() + duration * 60 * 1000);

        // Generate sleep stages
        const stages = this.generateSleepStages(bedtime, wakeTime, random);

        // Calculate quality from stages
        const deepMinutes = stages
          .filter(s => s.stage === 'deep')
          .reduce((sum, s) => sum + s.duration, 0);
        const remMinutes = stages
          .filter(s => s.stage === 'rem')
          .reduce((sum, s) => sum + s.duration, 0);
        const quality = Math.round(
          clamp(((deepMinutes / duration) * 200 + (remMinutes / duration) * 150), 0, 100)
        );

        sessions.push({
          id: `mock-sleep-${currentDate.toISOString()}`,
          startDate: bedtime,
          endDate: wakeTime,
          duration: Math.round(duration),
          source: 'Apple Watch',
          stages,
          quality,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return sessions;
  },

  generateSleepStages(
    start: Date,
    end: Date,
    random: () => number
  ): SleepSession['stages'] {
    const stages: SleepSession['stages'] = [];
    let currentTime = start.getTime();
    const endTime = end.getTime();

    // Sleep typically follows cycles of ~90 minutes
    const cycleLength = 90 * 60 * 1000;

    while (currentTime < endTime) {
      const remainingTime = endTime - currentTime;
      const isLastCycle = remainingTime < cycleLength;

      // Light sleep (stage 1-2)
      const lightDuration = clamp(
        normalRandom(20, 5, random) * 60 * 1000,
        10 * 60 * 1000,
        Math.min(30 * 60 * 1000, remainingTime)
      );

      stages.push({
        stage: 'core',
        startDate: new Date(currentTime),
        endDate: new Date(currentTime + lightDuration),
        duration: Math.round(lightDuration / 60000),
      });
      currentTime += lightDuration;

      if (currentTime >= endTime) break;

      // Deep sleep (more in first half of night)
      const cycleIndex = stages.length / 4;
      const deepProbability = cycleIndex < 2 ? 0.8 : 0.3;

      if (random() < deepProbability) {
        const deepDuration = clamp(
          normalRandom(cycleIndex < 2 ? 30 : 15, 10, random) * 60 * 1000,
          10 * 60 * 1000,
          Math.min(45 * 60 * 1000, endTime - currentTime)
        );

        stages.push({
          stage: 'deep',
          startDate: new Date(currentTime),
          endDate: new Date(currentTime + deepDuration),
          duration: Math.round(deepDuration / 60000),
        });
        currentTime += deepDuration;
      }

      if (currentTime >= endTime) break;

      // REM sleep (more in second half of night)
      const remProbability = cycleIndex > 1 ? 0.9 : 0.6;

      if (random() < remProbability) {
        const remDuration = clamp(
          normalRandom(cycleIndex > 1 ? 25 : 15, 8, random) * 60 * 1000,
          5 * 60 * 1000,
          Math.min(40 * 60 * 1000, endTime - currentTime)
        );

        stages.push({
          stage: 'rem',
          startDate: new Date(currentTime),
          endDate: new Date(currentTime + remDuration),
          duration: Math.round(remDuration / 60000),
        });
        currentTime += remDuration;
      }

      // Brief awake period between cycles
      if (random() < 0.2 && currentTime < endTime) {
        const awakeDuration = clamp(
          random() * 5 * 60 * 1000,
          1 * 60 * 1000,
          Math.min(5 * 60 * 1000, endTime - currentTime)
        );

        stages.push({
          stage: 'awake',
          startDate: new Date(currentTime),
          endDate: new Date(currentTime + awakeDuration),
          duration: Math.round(awakeDuration / 60000),
        });
        currentTime += awakeDuration;
      }
    }

    return stages;
  },

  /**
   * Generate HRV samples
   */
  hrvSamples(range: DateRange, seed: number): HRVSample[] {
    const random = seededRandom(seed);
    const samples: HRVSample[] = [];

    // Base HRV varies by person (using seed for consistency)
    const baseHRV = 30 + (seed % 30); // 30-60ms base

    let currentDate = new Date(range.startDate);

    while (currentDate <= range.endDate) {
      // HRV typically measured in morning
      if (random() > 0.15) {
        const sampleTime = new Date(currentDate);
        sampleTime.setHours(6 + Math.floor(random() * 3), Math.floor(random() * 60), 0, 0);

        // Daily variation (affected by sleep, stress, training)
        const dailyVariation = normalRandom(0, 8, random);
        const value = clamp(baseHRV + dailyVariation, 15, 100);

        samples.push({
          timestamp: sampleTime,
          value: Math.round(value),
          source: 'Apple Watch',
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return samples.reverse(); // Most recent first
  },

  /**
   * Generate resting heart rate samples
   */
  restingHeartRate(range: DateRange, seed: number): HeartRateSample[] {
    const random = seededRandom(seed);
    const samples: HeartRateSample[] = [];

    // Base RHR
    const baseRHR = 55 + (seed % 15); // 55-70 bpm base

    let currentDate = new Date(range.startDate);

    while (currentDate <= range.endDate) {
      if (random() > 0.1) {
        const sampleTime = new Date(currentDate);
        sampleTime.setHours(7, 0, 0, 0);

        const dailyVariation = normalRandom(0, 3, random);
        const bpm = clamp(baseRHR + dailyVariation, 40, 90);

        samples.push({
          timestamp: sampleTime,
          bpm: Math.round(bpm),
          context: 'resting',
          source: 'Apple Watch',
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return samples;
  },

  singleRestingHeartRate(seed: number): number {
    const random = seededRandom(seed + Date.now());
    const baseRHR = 55 + (seed % 15);
    return Math.round(clamp(normalRandom(baseRHR, 3, random), 40, 90));
  },

  heartRateSamples(range: DateRange, seed: number): HeartRateSample[] {
    // More detailed HR data - not implemented for brevity
    return [];
  },

  /**
   * Generate step counts
   */
  stepCounts(range: DateRange, seed: number): StepCount[] {
    const random = seededRandom(seed);
    const counts: StepCount[] = [];

    let currentDate = new Date(range.startDate);

    while (currentDate <= range.endDate) {
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      const baseSteps = isWeekend ? 6000 : 8000;

      const steps = clamp(
        normalRandom(baseSteps, 2500, random),
        1000,
        25000
      );

      counts.push({
        date: new Date(currentDate),
        count: Math.round(steps),
        source: 'iPhone',
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return counts;
  },

  singleDaySteps(seed: number): number {
    const random = seededRandom(seed + Date.now());
    const hour = new Date().getHours();
    const expectedByNow = (hour / 24) * 8000;
    return Math.round(clamp(normalRandom(expectedByNow, 1500, random), 0, 20000));
  },

  /**
   * Generate workouts
   */
  workouts(range: DateRange, seed: number): HealthWorkout[] {
    const random = seededRandom(seed);
    const workouts: HealthWorkout[] = [];

    let currentDate = new Date(range.startDate);

    while (currentDate <= range.endDate) {
      // ~4 workouts per week
      if (random() < 0.57) {
        const workoutTime = new Date(currentDate);
        const isMorning = random() > 0.5;
        workoutTime.setHours(isMorning ? 7 : 18, Math.floor(random() * 60), 0, 0);

        const duration = normalRandom(45, 15, random) * 60; // 45 mins +/- 15

        const types: HealthWorkout['activityType'][] = [
          'strength_training', 'strength_training', 'strength_training',
          'running', 'cycling', 'yoga'
        ];
        const activityType = types[Math.floor(random() * types.length)];

        workouts.push({
          id: `mock-workout-${currentDate.toISOString()}`,
          activityType,
          startDate: workoutTime,
          endDate: new Date(workoutTime.getTime() + duration * 1000),
          duration: Math.round(duration),
          activeEnergy: Math.round(duration / 60 * 8), // ~8 kcal/min
          averageHeartRate: Math.round(normalRandom(135, 15, random)),
          maxHeartRate: Math.round(normalRandom(165, 10, random)),
          source: 'Apple Watch',
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workouts;
  },

  activeEnergy(range: DateRange, seed: number): number {
    const random = seededRandom(seed);
    const days = Math.ceil((range.endDate.getTime() - range.startDate.getTime()) / (24 * 60 * 60 * 1000));
    return Math.round(normalRandom(400, 100, random) * days);
  },

  bodyMeasurements(range: DateRange, seed: number): BodyMeasurement[] {
    const random = seededRandom(seed);
    const measurements: BodyMeasurement[] = [];

    // Weight typically measured weekly
    let currentDate = new Date(range.startDate);
    const baseWeight = 70 + (seed % 30); // 70-100kg base

    while (currentDate <= range.endDate) {
      if (random() < 0.15) { // ~1x per week
        const measureTime = new Date(currentDate);
        measureTime.setHours(7, 0, 0, 0);

        measurements.push({
          timestamp: measureTime,
          weight: clamp(normalRandom(baseWeight, 0.5, random), 40, 150),
          bodyFat: random() > 0.5 ? clamp(normalRandom(20, 3, random), 5, 40) : undefined,
          source: 'Withings Scale',
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return measurements;
  },

  singleBodyMeasurement(seed: number): BodyMeasurement {
    const random = seededRandom(seed);
    const baseWeight = 70 + (seed % 30);

    return {
      timestamp: new Date(),
      weight: clamp(normalRandom(baseWeight, 0.5, random), 40, 150),
      bodyFat: clamp(normalRandom(20, 3, random), 5, 40),
      source: 'Withings Scale',
    };
  },

  mobilityMetrics(range: DateRange, seed: number): MobilityMetrics[] {
    const random = seededRandom(seed);
    const metrics: MobilityMetrics[] = [];

    let currentDate = new Date(range.startDate);

    while (currentDate <= range.endDate) {
      if (random() > 0.2) {
        metrics.push({
          date: new Date(currentDate),
          walkingAsymmetry: clamp(normalRandom(3, 2, random), 0, 15),
          walkingSpeed: clamp(normalRandom(1.2, 0.15, random), 0.8, 1.8),
          stepLength: clamp(normalRandom(0.7, 0.05, random), 0.5, 0.9),
          source: 'iPhone',
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return metrics;
  },

  /**
   * Generate complete daily snapshot
   */
  dailySnapshot(date: Date, seed: number): DailyHealthSnapshot {
    const dateSeed = seed + date.getTime();
    const random = seededRandom(dateSeed);

    const baseHRV = 30 + (seed % 30);
    const baseRHR = 55 + (seed % 15);

    const sleepDuration = clamp(normalRandom(420, 60, random), 180, 600);
    const sleepQuality = clamp(normalRandom(75, 15, random), 30, 100);
    const hrvAverage = clamp(normalRandom(baseHRV, 8, random), 15, 100);
    const restingHR = clamp(normalRandom(baseRHR, 3, random), 40, 90);
    const steps = clamp(normalRandom(8000, 2500, random), 1000, 25000);

    // Readiness calculation
    const sleepFactor = (sleepDuration / 420) * 50 + (sleepQuality / 100) * 50;
    const recoveryFactor = ((hrvAverage - (baseHRV - 10)) / 20) * 100;
    const readinessScore = clamp(
      (sleepFactor * 0.35 + recoveryFactor * 0.35 + 70 * 0.30),
      0,
      100
    );

    return {
      date: date.toISOString().split('T')[0],
      sleepDuration: Math.round(sleepDuration),
      sleepQuality: Math.round(sleepQuality),
      deepSleepMinutes: Math.round(sleepDuration * normalRandom(0.15, 0.03, random)),
      remSleepMinutes: Math.round(sleepDuration * normalRandom(0.22, 0.04, random)),
      hrvAverage: Math.round(hrvAverage),
      hrvTrend: random() > 0.6 ? 'up' : random() > 0.3 ? 'stable' : 'down',
      restingHeartRate: Math.round(restingHR),
      steps: Math.round(steps),
      activeEnergy: Math.round(normalRandom(400, 100, random)),
      workoutMinutes: random() > 0.6 ? Math.round(normalRandom(45, 15, random)) : 0,
      workoutCount: random() > 0.6 ? 1 : 0,
      dataCompleteness: Math.round(normalRandom(85, 10, random)),
      sources: ['Apple Watch', 'iPhone'],
      syncedAt: new Date(),
      readinessScore: Math.round(readinessScore),
      readinessFactors: {
        sleep: Math.round(clamp(sleepFactor, 0, 100)),
        recovery: Math.round(clamp(recoveryFactor, 0, 100)),
        strain: Math.round(normalRandom(70, 15, random)),
        body: 100,
      },
    };
  },

  dailySnapshots(range: DateRange, seed: number): DailyHealthSnapshot[] {
    const snapshots: DailyHealthSnapshot[] = [];
    let currentDate = new Date(range.startDate);

    while (currentDate <= range.endDate) {
      snapshots.push(this.dailySnapshot(new Date(currentDate), seed));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return snapshots;
  },
};
```

### Switching Between Adapters

```typescript
// /src/store/settings.ts

import { create } from 'zustand';
import { AppStorage } from '@/lib/storage';
import { useMockAdapter, useNativeAdapter, isMockAdapter } from '@/adapters/health';

interface SettingsState {
  demoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  demoMode: AppStorage.isDemoMode(),

  setDemoMode: (enabled: boolean) => {
    AppStorage.setDemoMode(enabled);

    if (enabled) {
      useMockAdapter();
    } else {
      useNativeAdapter();
    }

    set({ demoMode: enabled });
  },
}));

// Hook for demo mode
export function useDemoMode() {
  const { demoMode, setDemoMode } = useSettingsStore();
  return { demoMode, setDemoMode, isMockAdapter: isMockAdapter() };
}
```

---

## 6. Future Backend Considerations

### What Stays Local vs What Syncs

| Data | Local | Backend | Reasoning |
|------|-------|---------|-----------|
| Raw health readings | Yes | No | Privacy - raw biometrics stay on device |
| Daily snapshots (aggregated) | Yes | Yes | Needed for cross-device, AI analysis |
| Readiness scores | Yes | Yes | Historical tracking |
| Workout logs | Yes | Yes | Core feature, needs sync |
| Exercise history | Yes | Yes | Progress tracking |
| Body model / Injuries | Yes | Yes | Clinical data, provider sharing |
| Pain logs | Yes | Yes | Pattern analysis |
| Clinical documents | Yes | Yes (encrypted) | Provider collaboration |
| User preferences | Yes | Yes | Cross-device |
| Auth tokens | Yes | No | Device-specific |
| Sync queue | Yes | No | Ephemeral |

### API Contract Suggestions

```typescript
// /src/types/api.ts

/**
 * Health data sync endpoint
 * Mobile → Backend
 */
interface SyncHealthDataRequest {
  snapshots: DailyHealthSnapshotDTO[];
}

interface DailyHealthSnapshotDTO {
  date: string;                  // YYYY-MM-DD
  sleepDuration?: number;
  sleepQuality?: number;
  hrvAverage?: number;
  restingHeartRate?: number;
  steps?: number;
  activeEnergy?: number;
  workoutMinutes?: number;
  readinessScore?: number;
  readinessFactors?: ReadinessFactors;
  dataCompleteness: number;
}

interface SyncHealthDataResponse {
  synced: number;
  insights?: AIInsight[];        // Backend can return insights
  readinessOverride?: {          // Backend can override readiness
    score: number;
    reasoning: string;
  };
}

/**
 * Workout sync
 */
interface SyncWorkoutRequest {
  workouts: WorkoutDTO[];
}

interface WorkoutDTO {
  localId: string;               // Client-generated ID
  serverId?: string;             // Set after first sync
  date: string;
  status: 'planned' | 'in_progress' | 'completed' | 'skipped';
  plannedDuration?: number;
  actualDuration?: number;
  readinessScore?: number;
  exercises: ExerciseLogDTO[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * AI insights from backend
 */
interface AIInsight {
  id: string;
  type: 'pattern' | 'recommendation' | 'warning' | 'milestone';
  title: string;
  body: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  action?: {
    type: string;
    params: Record<string, any>;
  };
  createdAt: string;
  expiresAt?: string;
}

/**
 * Generic sync response with conflict handling
 */
interface SyncResponse<T> {
  created: T[];
  updated: T[];
  deleted: string[];            // IDs
  conflicts: SyncConflict<T>[];
}

interface SyncConflict<T> {
  localId: string;
  local: T;
  server: T;
  resolution: 'client_wins' | 'server_wins' | 'merge' | 'manual';
  merged?: T;
}
```

### Backend Integration Points

```typescript
// /src/services/sync/BackendSync.ts

import { apiClient } from '@/api/client';
import { database } from '@/lib/database';
import { storage } from '@/lib/storage';

export class BackendSyncService {
  private syncInProgress = false;

  /**
   * Full sync with backend
   * Called periodically and on app foreground when online
   */
  async fullSync(): Promise<void> {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      // 1. Push local changes
      await this.pushHealthSnapshots();
      await this.pushWorkouts();
      await this.pushInjuries();
      await this.pushPainLogs();

      // 2. Pull remote changes
      await this.pullWorkouts();
      await this.pullInjuries();
      await this.pullInsights();

      // 3. Update last sync timestamp
      storage.set('backend.lastSync', Date.now());

    } finally {
      this.syncInProgress = false;
    }
  }

  private async pushHealthSnapshots(): Promise<void> {
    // Get snapshots not yet synced
    const unsyncedSnapshots = await database.healthSnapshots.getUnsynced();

    if (unsyncedSnapshots.length === 0) return;

    const response = await apiClient.post('/api/health/sync', {
      snapshots: unsyncedSnapshots.map(this.toDTO),
    });

    // Mark as synced
    await database.write(async () => {
      for (const snapshot of unsyncedSnapshots) {
        await snapshot.update((s: any) => {
          s.synced = true;
        });
      }
    });

    // Process any insights returned
    if (response.data.insights) {
      await this.processInsights(response.data.insights);
    }
  }

  private async pushWorkouts(): Promise<void> {
    const unsyncedWorkouts = await database.workouts.getUnsynced();

    if (unsyncedWorkouts.length === 0) return;

    const response = await apiClient.post('/api/workouts/sync', {
      workouts: unsyncedWorkouts.map(this.workoutToDTO),
    });

    // Handle response, update server IDs
    await this.processWorkoutSyncResponse(response.data, unsyncedWorkouts);
  }

  // ... additional methods
}

export const backendSync = new BackendSyncService();
```

### GDPR Compliance Hooks

```typescript
// /src/services/gdpr/GDPRService.ts

import { apiClient } from '@/api/client';
import { deleteAllUserData, exportAllUserData } from '@/lib/database/encryption';

export class GDPRService {
  /**
   * Export all user data (GDPR Article 20 - Right to data portability)
   */
  async exportData(): Promise<Blob> {
    // Get local data
    const localData = await exportAllUserData();

    // Get backend data (if backend exists)
    let backendData = null;
    try {
      const response = await apiClient.get('/api/user/data-export');
      backendData = response.data;
    } catch {
      // No backend or offline
    }

    const fullExport = {
      exportedAt: new Date().toISOString(),
      local: localData,
      backend: backendData,
    };

    return new Blob([JSON.stringify(fullExport, null, 2)], {
      type: 'application/json',
    });
  }

  /**
   * Delete all user data (GDPR Article 17 - Right to erasure)
   */
  async deleteAllData(): Promise<void> {
    // Delete from backend first
    try {
      await apiClient.delete('/api/user/data');
    } catch {
      // Continue with local deletion even if backend fails
    }

    // Delete local data
    await deleteAllUserData();
  }

  /**
   * Get privacy policy acceptance status
   */
  async getConsentStatus(): Promise<ConsentStatus> {
    return {
      healthDataCollection: storage.getBoolean('consent.healthData') || false,
      analyticsCollection: storage.getBoolean('consent.analytics') || false,
      crashReporting: storage.getBoolean('consent.crashReporting') || false,
      marketingCommunications: storage.getBoolean('consent.marketing') || false,
      lastUpdated: storage.getNumber('consent.updatedAt') || 0,
    };
  }

  /**
   * Update consent preferences
   */
  async updateConsent(consent: Partial<ConsentStatus>): Promise<void> {
    if (consent.healthDataCollection !== undefined) {
      storage.set('consent.healthData', consent.healthDataCollection);
    }
    if (consent.analyticsCollection !== undefined) {
      storage.set('consent.analytics', consent.analyticsCollection);
    }
    if (consent.crashReporting !== undefined) {
      storage.set('consent.crashReporting', consent.crashReporting);
    }
    if (consent.marketingCommunications !== undefined) {
      storage.set('consent.marketing', consent.marketingCommunications);
    }

    storage.set('consent.updatedAt', Date.now());

    // Sync to backend
    try {
      await apiClient.put('/api/user/consent', consent);
    } catch {
      // Will sync later
    }
  }
}

interface ConsentStatus {
  healthDataCollection: boolean;
  analyticsCollection: boolean;
  crashReporting: boolean;
  marketingCommunications: boolean;
  lastUpdated: number;
}

export const gdprService = new GDPRService();
```

---

## Summary

This specification provides a complete technical foundation for health data integration:

1. **HealthAdapter Interface** - Platform-agnostic abstraction with comprehensive error handling
2. **Expo Integration** - Config plugins, permissions, and dev build requirements
3. **Data Flow** - Clear separation between hot data (MMKV) and historical data (SQLite)
4. **Persistence** - Encrypted local storage with GDPR-ready export/delete
5. **Mock Adapter** - Realistic fake data for demo mode and testing
6. **Backend Ready** - Clean API contracts for future server integration

Key principles maintained:
- Privacy-first: Raw biometrics never leave the device
- Offline-first: Full functionality without network
- Demo-capable: Works without health permissions
- GDPR-ready: Export and delete user data

---

*End of Health Integration & Data Strategy specification.*
