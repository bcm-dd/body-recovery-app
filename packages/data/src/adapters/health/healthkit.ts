/**
 * HealthKit Adapter (iOS)
 *
 * Stub implementation for iOS HealthKit integration.
 * This file contains the interface but requires native code setup.
 *
 * REQUIREMENTS FOR REAL IMPLEMENTATION:
 * =====================================
 *
 * 1. Expo Development Build Required
 *    - Expo Go does not support HealthKit
 *    - Run: `eas build --profile development --platform ios`
 *
 * 2. Required Packages:
 *    - react-native-health (recommended)
 *    - Or: @kilohealth/expo-health-connect (cross-platform)
 *
 * 3. App Config (app.config.ts):
 *    ```typescript
 *    ios: {
 *      entitlements: {
 *        'com.apple.developer.healthkit': true,
 *        'com.apple.developer.healthkit.background-delivery': true,
 *      },
 *      infoPlist: {
 *        NSHealthShareUsageDescription: 'We use your health data to personalize recovery recommendations.',
 *        NSHealthUpdateUsageDescription: 'We save your workouts to Apple Health.',
 *        UIBackgroundModes: ['fetch', 'processing'],
 *      },
 *    }
 *    ```
 *
 * 4. Permissions to Request:
 *    - SleepAnalysis
 *    - HeartRateVariabilitySDNN
 *    - RestingHeartRate
 *    - HeartRate
 *    - StepCount
 *    - ActiveEnergyBurned
 *    - BodyMass
 *    - BodyFatPercentage
 *    - WalkingAsymmetryPercentage
 *    - WalkingSpeed
 *    - Workout (read + write)
 */

import {
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
  HealthErrors,
} from './types';

/**
 * HealthKit adapter stub for iOS
 *
 * This is a stub that returns 'not_available' for all operations.
 * Replace with real implementation when setting up native HealthKit.
 */
export class HealthKitAdapter implements HealthAdapter {
  private initialized = false;

  async isAvailable(): Promise<HealthAvailability> {
    // TODO: Implement real HealthKit availability check
    // Real implementation:
    // ```
    // return new Promise((resolve) => {
    //   AppleHealthKit.isAvailable((error, available) => {
    //     if (error || !available) {
    //       resolve('not_available');
    //     } else {
    //       resolve('available');
    //     }
    //   });
    // });
    // ```
    return 'not_available';
  }

  async requestPermissions(
    _read: HealthDataType[],
    _write?: HealthWriteType[]
  ): Promise<HealthResult<HealthPermissionStatus>> {
    // TODO: Implement real HealthKit permission request
    // Real implementation uses AppleHealthKit.initHealthKit()
    // See /ops/04_health_and_data.md for full implementation
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getPermissionStatus(): Promise<HealthPermissionStatus> {
    // TODO: HealthKit doesn't expose permission status directly
    // We typically check at read time
    return {
      read: {},
      write: {},
    };
  }

  async hasMinimumPermissions(): Promise<boolean> {
    // TODO: Check if we have sleep + HRV + resting HR
    return false;
  }

  async getSleep(_range: DateRange): Promise<HealthResult<SleepSession[]>> {
    // TODO: Implement using AppleHealthKit.getSleepSamples()
    // Must merge overlapping samples into coherent sessions
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getLastNightSleep(): Promise<HealthResult<SleepSession | null>> {
    // TODO: Get sleep from last night (previous evening to this morning)
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getHRV(_range: DateRange): Promise<HealthResult<HRVSample[]>> {
    // TODO: Implement using AppleHealthKit.getHeartRateVariabilitySamples()
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
    // TODO: Implement using AppleHealthKit.getRestingHeartRate()
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
    // TODO: Implement using AppleHealthKit.getHeartRateSamples()
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getSteps(_range: DateRange): Promise<HealthResult<StepCount[]>> {
    // TODO: Implement using AppleHealthKit.getDailyStepCountSamples()
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getTodaySteps(): Promise<HealthResult<number>> {
    // TODO: Implement using AppleHealthKit.getStepCount()
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getWorkouts(_range: DateRange): Promise<HealthResult<HealthWorkout[]>> {
    // TODO: Implement using AppleHealthKit.getWorkoutSamples()
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getActiveEnergy(_range: DateRange): Promise<HealthResult<number>> {
    // TODO: Implement using AppleHealthKit.getActiveEnergyBurned()
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getBodyMeasurements(
    _range: DateRange
  ): Promise<HealthResult<BodyMeasurement[]>> {
    // TODO: Implement using AppleHealthKit.getWeightSamples() and getBodyFatPercentageSamples()
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
    // TODO: Implement using AppleHealthKit mobility APIs
    // Walking asymmetry, speed, and step length are key injury indicators
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async writeWorkout(
    _workout: Omit<HealthWorkout, 'id' | 'source'>
  ): Promise<HealthResult<string>> {
    // TODO: Implement using AppleHealthKit.saveWorkout()
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  async getDailySnapshot(
    _date: Date
  ): Promise<HealthResult<DailyHealthSnapshot>> {
    // TODO: Aggregate all health data for a single day
    // Fetch sleep, HRV, RHR, steps, energy, workouts, body, mobility in parallel
    // Then build DailyHealthSnapshot with readiness calculation
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
    // Called on app foreground and background fetch
    return {
      success: false,
      error: HealthErrors.notAvailable(),
    };
  }

  subscribeToUpdates(
    _callback: (snapshot: DailyHealthSnapshot) => void
  ): () => void {
    // TODO: Implement using AppleHealthKit observer queries
    // Enable background delivery for key data types
    return () => {
      // Cleanup function
    };
  }

  async initializeBackgroundSync(): Promise<void> {
    // TODO: Enable background delivery for key data types
    // ```
    // AppleHealthKit.enableBackgroundDelivery(
    //   AppleHealthKit.Constants.Permissions.SleepAnalysis,
    //   AppleHealthKit.Constants.ObserverQueryOptions.DISCRETE,
    //   () => {}
    // );
    // ```
  }

  async isBackgroundSyncEnabled(): Promise<boolean> {
    // TODO: Check if background delivery is enabled
    return false;
  }
}

/**
 * Check if the current platform is iOS
 */
export function isIOS(): boolean {
  // This would use Platform.OS === 'ios' in React Native
  return typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
}
