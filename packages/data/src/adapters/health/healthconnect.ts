/**
 * Health Connect Adapter (Android)
 *
 * Stub implementation for Android Health Connect integration.
 * This file contains the interface but requires native code setup.
 *
 * REQUIREMENTS FOR REAL IMPLEMENTATION:
 * =====================================
 *
 * 1. Expo Development Build Required
 *    - Expo Go does not support Health Connect
 *    - Run: `eas build --profile development --platform android`
 *
 * 2. Required Packages:
 *    - react-native-health-connect (recommended)
 *    - Or: @kilohealth/expo-health-connect (cross-platform)
 *
 * 3. App Config (app.config.ts):
 *    ```typescript
 *    android: {
 *      permissions: [
 *        'android.permission.health.READ_SLEEP',
 *        'android.permission.health.READ_HEART_RATE',
 *        'android.permission.health.READ_HEART_RATE_VARIABILITY',
 *        'android.permission.health.READ_RESTING_HEART_RATE',
 *        'android.permission.health.READ_STEPS',
 *        'android.permission.health.READ_DISTANCE',
 *        'android.permission.health.READ_ACTIVE_CALORIES_BURNED',
 *        'android.permission.health.READ_WEIGHT',
 *        'android.permission.health.READ_BODY_FAT',
 *        'android.permission.health.READ_EXERCISE',
 *        'android.permission.health.WRITE_EXERCISE',
 *        'android.permission.health.WRITE_ACTIVE_CALORIES_BURNED',
 *      ],
 *    },
 *    plugins: [
 *      ['react-native-health-connect', {}],
 *    ],
 *    ```
 *
 * 4. Health Connect App Required:
 *    - Health Connect must be installed on the device
 *    - Available on Play Store for Android 9+
 *    - Built-in on Android 14+
 *
 * 5. Record Types to Request:
 *    - SleepSession
 *    - HeartRateVariabilityRmssd
 *    - RestingHeartRate
 *    - HeartRate
 *    - Steps
 *    - ActiveCaloriesBurned
 *    - Weight
 *    - BodyFat
 *    - ExerciseSession
 */

import type {
  HealthAdapter,
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
} from './types';
import { HealthErrors } from './types';

/**
 * Health Connect SDK availability status
 * Matches react-native-health-connect SdkAvailabilityStatus
 */
export enum SdkAvailabilityStatus {
  SDK_AVAILABLE = 'SDK_AVAILABLE',
  SDK_UNAVAILABLE = 'SDK_UNAVAILABLE',
  SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED = 'SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED',
}

/**
 * Health Connect adapter stub for Android
 *
 * This is a stub that returns 'not_available' for all operations.
 * Replace with real implementation when setting up native Health Connect.
 */
export class HealthConnectAdapter implements HealthAdapter {
  private initialized = false;

  async isAvailable(): Promise<HealthAvailability> {
    // TODO: Implement real Health Connect availability check
    // Real implementation:
    // ```
    // const status = await getSdkStatus();
    // switch (status) {
    //   case SdkAvailabilityStatus.SDK_AVAILABLE:
    //     return 'available';
    //   case SdkAvailabilityStatus.SDK_UNAVAILABLE:
    //   case SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED:
    //   default:
    //     return 'not_available';
    // }
    // ```
    return 'not_available';
  }

  async requestPermissions(
    _read: HealthDataType[],
    _write?: HealthWriteType[]
  ): Promise<HealthResult<HealthPermissionStatus>> {
    // TODO: Implement real Health Connect permission request
    // Real implementation:
    // ```
    // await initialize();
    // const granted = await requestPermission(HEALTH_CONNECT_PERMISSIONS);
    // return { success: true, data: this.parsePermissionResult(granted) };
    // ```
    // See /ops/04_health_and_data.md for full implementation
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getPermissionStatus(): Promise<HealthPermissionStatus> {
    // TODO: Get current permission status from Health Connect
    return {
      read: {},
      write: {},
    };
  }

  async hasMinimumPermissions(): Promise<boolean> {
    // TODO: Check if we have sleep + HRV + resting HR permissions
    return false;
  }

  async getSleep(_range: DateRange): Promise<HealthResult<SleepSession[]>> {
    // TODO: Implement using readRecords('SleepSession', ...)
    // Health Connect provides sleep stage data within the session
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getLastNightSleep(): Promise<HealthResult<SleepSession | null>> {
    // TODO: Get sleep from last night
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getHRV(_range: DateRange): Promise<HealthResult<HRVSample[]>> {
    // TODO: Implement using readRecords('HeartRateVariabilityRmssd', ...)
    // Note: Health Connect uses RMSSD, HealthKit uses SDNN
    // They are correlated but not identical
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getLatestHRV(): Promise<HealthResult<HRVSample | null>> {
    // TODO: Get most recent HRV reading
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getRestingHeartRate(
    _range: DateRange
  ): Promise<HealthResult<HeartRateSample[]>> {
    // TODO: Implement using readRecords('RestingHeartRate', ...)
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getTodayRestingHeartRate(): Promise<HealthResult<number | null>> {
    // TODO: Get today's resting heart rate
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getHeartRate(
    _range: DateRange
  ): Promise<HealthResult<HeartRateSample[]>> {
    // TODO: Implement using readRecords('HeartRate', ...)
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getSteps(_range: DateRange): Promise<HealthResult<StepCount[]>> {
    // TODO: Implement using readRecords('Steps', ...)
    // Aggregate by day
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getTodaySteps(): Promise<HealthResult<number>> {
    // TODO: Get today's step count
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getWorkouts(_range: DateRange): Promise<HealthResult<HealthWorkout[]>> {
    // TODO: Implement using readRecords('ExerciseSession', ...)
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getActiveEnergy(_range: DateRange): Promise<HealthResult<number>> {
    // TODO: Implement using readRecords('ActiveCaloriesBurned', ...)
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getBodyMeasurements(
    _range: DateRange
  ): Promise<HealthResult<BodyMeasurement[]>> {
    // TODO: Implement using readRecords('Weight', ...) and ('BodyFat', ...)
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getLatestBodyMeasurement(): Promise<
    HealthResult<BodyMeasurement | null>
  > {
    // TODO: Get latest weight and body fat
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getMobilityMetrics(
    _range: DateRange
  ): Promise<HealthResult<MobilityMetrics[]>> {
    // TODO: Health Connect has limited mobility data compared to HealthKit
    // May need to compute from step data or use third-party sensors
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async writeWorkout(
    _workout: Omit<HealthWorkout, 'id' | 'source'>
  ): Promise<HealthResult<string>> {
    // TODO: Implement using insertRecords('ExerciseSession', ...)
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getDailySnapshot(
    _date: Date
  ): Promise<HealthResult<DailyHealthSnapshot>> {
    // TODO: Aggregate all health data for a single day
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getDailySnapshots(
    _range: DateRange
  ): Promise<HealthResult<DailyHealthSnapshot[]>> {
    // TODO: Get snapshots for each day in range
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async syncHealthData(
    _days: number = 7
  ): Promise<HealthResult<DailyHealthSnapshot[]>> {
    // TODO: Sync last N days of health data
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  subscribeToUpdates(
    _callback: (snapshot: DailyHealthSnapshot) => void
  ): () => void {
    // TODO: Health Connect doesn't have real-time subscriptions
    // Use foreground service or WorkManager for periodic syncs
    return () => {
      // Cleanup function
    };
  }

  async initializeBackgroundSync(): Promise<void> {
    // TODO: Set up WorkManager for periodic background sync
    // Android requires different approach than iOS for background work
  }

  async isBackgroundSyncEnabled(): Promise<boolean> {
    // TODO: Check if background work is scheduled
    return false;
  }

  /**
   * Map Health Connect sleep stage to our unified type
   * Health Connect uses numeric constants for sleep stages
   */
  mapSleepStage(
    stage: number
  ): 'awake' | 'rem' | 'core' | 'deep' | 'unknown' {
    // Health Connect SleepStage constants:
    // 1 = AWAKE
    // 2 = REM
    // 3 = LIGHT (maps to core)
    // 4 = LIGHT (maps to core)
    // 5 = DEEP
    // 6 = SLEEPING (unknown specific stage)
    switch (stage) {
      case 1:
        return 'awake';
      case 2:
        return 'rem';
      case 3:
      case 4:
        return 'core';
      case 5:
        return 'deep';
      default:
        return 'unknown';
    }
  }
}

/**
 * Check if the current platform is Android
 */
export function isAndroid(): boolean {
  // This would use Platform.OS === 'android' in React Native
  return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
}
