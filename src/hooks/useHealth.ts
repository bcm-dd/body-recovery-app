/**
 * useHealth Hook - Movement & Recovery Companion
 *
 * Cross-platform health data integration with HealthKit (iOS) and Health Connect (Android).
 * Handles permissions, data fetching, and sync with backend.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';

// Types for health data
export interface HealthSnapshot {
  date: string;
  sleepDuration?: number;
  sleepQuality?: number;
  hrv?: number;
  restingHr?: number;
  steps?: number;
  activeCalories?: number;
}

export interface HealthPermissions {
  sleep: boolean;
  heartRate: boolean;
  steps: boolean;
  workouts: boolean;
}

export interface UseHealthResult {
  isAvailable: boolean;
  permissions: HealthPermissions;
  isLoading: boolean;
  error: string | null;
  requestPermissions: () => Promise<boolean>;
  fetchTodaySnapshot: () => Promise<HealthSnapshot | null>;
  fetchWeekSnapshots: () => Promise<HealthSnapshot[]>;
  syncToBackend: (snapshots: HealthSnapshot[]) => Promise<void>;
}

// Permission types we request
const HEALTH_PERMISSIONS = {
  ios: {
    read: [
      'HKQuantityTypeIdentifierStepCount',
      'HKQuantityTypeIdentifierActiveEnergyBurned',
      'HKQuantityTypeIdentifierHeartRate',
      'HKQuantityTypeIdentifierRestingHeartRate',
      'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
      'HKCategoryTypeIdentifierSleepAnalysis',
    ],
    write: [],
  },
  android: {
    read: [
      'Steps',
      'TotalCaloriesBurned',
      'HeartRate',
      'RestingHeartRate',
      'HeartRateVariability',
      'SleepSession',
    ],
    write: [],
  },
};

/**
 * Health data hook for cross-platform health integration
 */
export function useHealth(): UseHealthResult {
  const [isAvailable, setIsAvailable] = useState(false);
  const [permissions, setPermissions] = useState<HealthPermissions>({
    sleep: false,
    heartRate: false,
    steps: false,
    workouts: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep track of health module
  const healthModuleRef = useRef<any>(null);

  // Initialize health availability check
  useEffect(() => {
    checkAvailability();
  }, []);

  // Re-check permissions when app becomes active
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      checkPermissions();
    }
  }, []);

  const checkAvailability = useCallback(async () => {
    try {
      setIsLoading(true);

      if (Platform.OS === 'ios') {
        // Check HealthKit availability
        try {
          const AppleHealthKit = require('react-native-health').default;
          healthModuleRef.current = AppleHealthKit;

          AppleHealthKit.isAvailable((err: Error | null, available: boolean) => {
            setIsAvailable(available && !err);
            if (available) {
              checkPermissions();
            } else {
              setIsLoading(false);
            }
          });
        } catch (e) {
          console.log('HealthKit not available:', e);
          setIsAvailable(false);
          setIsLoading(false);
        }
      } else if (Platform.OS === 'android') {
        // Check Health Connect availability
        try {
          const { initialize, getSdkStatus, SdkAvailabilityStatus } =
            require('react-native-health-connect');

          const isInitialized = await initialize();
          if (isInitialized) {
            const status = await getSdkStatus();
            const available = status === SdkAvailabilityStatus.SDK_AVAILABLE;
            setIsAvailable(available);
            healthModuleRef.current = require('react-native-health-connect');
            if (available) {
              checkPermissions();
            }
          }
        } catch (e) {
          console.log('Health Connect not available:', e);
          setIsAvailable(false);
        }
        setIsLoading(false);
      } else {
        setIsAvailable(false);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Health availability check failed:', err);
      setIsAvailable(false);
      setIsLoading(false);
    }
  }, []);

  const checkPermissions = useCallback(async () => {
    if (!isAvailable && !healthModuleRef.current) {
      return;
    }

    try {
      if (Platform.OS === 'ios') {
        // HealthKit doesn't have a direct "check permissions" API
        // We infer from successful data reads
        setPermissions({
          sleep: true, // Will verify on actual read
          heartRate: true,
          steps: true,
          workouts: true,
        });
      } else if (Platform.OS === 'android') {
        const { getGrantedPermissions } = healthModuleRef.current;
        const granted = await getGrantedPermissions();

        setPermissions({
          sleep: granted.includes('android.permission.health.READ_SLEEP'),
          heartRate: granted.includes('android.permission.health.READ_HEART_RATE'),
          steps: granted.includes('android.permission.health.READ_STEPS'),
          workouts: granted.includes('android.permission.health.READ_EXERCISE'),
        });
      }
    } catch (err) {
      console.error('Permission check failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAvailable]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (!isAvailable) {
      setError('Health services not available on this device');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (Platform.OS === 'ios') {
        const AppleHealthKit = healthModuleRef.current;

        return new Promise((resolve) => {
          AppleHealthKit.initHealthKit(
            { permissions: HEALTH_PERMISSIONS.ios },
            (err: Error | null) => {
              if (err) {
                setError('Failed to get health permissions');
                resolve(false);
              } else {
                setPermissions({
                  sleep: true,
                  heartRate: true,
                  steps: true,
                  workouts: true,
                });
                resolve(true);
              }
              setIsLoading(false);
            }
          );
        });
      } else if (Platform.OS === 'android') {
        const { requestPermission } = healthModuleRef.current;

        const permissions = [
          { accessType: 'read', recordType: 'Steps' },
          { accessType: 'read', recordType: 'TotalCaloriesBurned' },
          { accessType: 'read', recordType: 'HeartRate' },
          { accessType: 'read', recordType: 'RestingHeartRate' },
          { accessType: 'read', recordType: 'SleepSession' },
        ];

        const granted = await requestPermission(permissions);
        const allGranted = granted.length === permissions.length;

        if (allGranted) {
          setPermissions({
            sleep: true,
            heartRate: true,
            steps: true,
            workouts: true,
          });
        }

        setIsLoading(false);
        return allGranted;
      }

      return false;
    } catch (err) {
      console.error('Permission request failed:', err);
      setError('Failed to request health permissions');
      setIsLoading(false);
      return false;
    }
  }, [isAvailable]);

  const fetchTodaySnapshot = useCallback(async (): Promise<HealthSnapshot | null> => {
    if (!isAvailable || !healthModuleRef.current) {
      return null;
    }

    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      if (Platform.OS === 'ios') {
        return await fetchIOSSnapshot(healthModuleRef.current, startOfDay, today);
      } else if (Platform.OS === 'android') {
        return await fetchAndroidSnapshot(healthModuleRef.current, startOfDay, today);
      }

      return null;
    } catch (err) {
      console.error('Failed to fetch today snapshot:', err);
      return null;
    }
  }, [isAvailable]);

  const fetchWeekSnapshots = useCallback(async (): Promise<HealthSnapshot[]> => {
    if (!isAvailable || !healthModuleRef.current) {
      return [];
    }

    try {
      const snapshots: HealthSnapshot[] = [];
      const today = new Date();

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        let snapshot: HealthSnapshot | null = null;

        if (Platform.OS === 'ios') {
          snapshot = await fetchIOSSnapshot(healthModuleRef.current, startOfDay, endOfDay);
        } else if (Platform.OS === 'android') {
          snapshot = await fetchAndroidSnapshot(healthModuleRef.current, startOfDay, endOfDay);
        }

        if (snapshot) {
          snapshots.push(snapshot);
        }
      }

      return snapshots;
    } catch (err) {
      console.error('Failed to fetch week snapshots:', err);
      return [];
    }
  }, [isAvailable]);

  const syncToBackend = useCallback(
    async (snapshots: HealthSnapshot[]): Promise<void> => {
      if (snapshots.length === 0) {
        return;
      }

      try {
        // This would be called with the auth token from your auth context
        const response = await fetch('/api/health/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Authorization header would be added by an auth interceptor
          },
          body: JSON.stringify({ snapshots }),
        });

        if (!response.ok) {
          throw new Error('Sync failed');
        }
      } catch (err) {
        console.error('Failed to sync health data:', err);
        throw err;
      }
    },
    []
  );

  return {
    isAvailable,
    permissions,
    isLoading,
    error,
    requestPermissions,
    fetchTodaySnapshot,
    fetchWeekSnapshots,
    syncToBackend,
  };
}

// iOS-specific data fetching
async function fetchIOSSnapshot(
  AppleHealthKit: any,
  startDate: Date,
  endDate: Date
): Promise<HealthSnapshot | null> {
  const dateString = startDate.toISOString().split('T')[0];

  const options = {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };

  const [steps, calories, sleepData, hrv, restingHr] = await Promise.all([
    fetchIOSSteps(AppleHealthKit, options),
    fetchIOSCalories(AppleHealthKit, options),
    fetchIOSSleep(AppleHealthKit, options),
    fetchIOSHRV(AppleHealthKit, options),
    fetchIOSRestingHR(AppleHealthKit, options),
  ]);

  return {
    date: dateString,
    steps,
    activeCalories: calories,
    sleepDuration: sleepData.duration,
    sleepQuality: sleepData.quality,
    hrv,
    restingHr,
  };
}

function fetchIOSSteps(AppleHealthKit: any, options: any): Promise<number | undefined> {
  return new Promise((resolve) => {
    AppleHealthKit.getStepCount(options, (err: Error | null, results: any) => {
      if (err || !results) {
        resolve(undefined);
      } else {
        resolve(results.value || 0);
      }
    });
  });
}

function fetchIOSCalories(AppleHealthKit: any, options: any): Promise<number | undefined> {
  return new Promise((resolve) => {
    AppleHealthKit.getActiveEnergyBurned(options, (err: Error | null, results: any[]) => {
      if (err || !results) {
        resolve(undefined);
      } else {
        const total = results.reduce((sum, r) => sum + (r.value || 0), 0);
        resolve(Math.round(total));
      }
    });
  });
}

function fetchIOSSleep(
  AppleHealthKit: any,
  options: any
): Promise<{ duration?: number; quality?: number }> {
  return new Promise((resolve) => {
    AppleHealthKit.getSleepSamples(options, (err: Error | null, results: any[]) => {
      if (err || !results || results.length === 0) {
        resolve({});
      } else {
        // Calculate total sleep duration in hours
        let totalMinutes = 0;
        results.forEach((sample) => {
          if (sample.value === 'ASLEEP' || sample.value === 'INBED') {
            const start = new Date(sample.startDate);
            const end = new Date(sample.endDate);
            totalMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
          }
        });

        const duration = Math.round((totalMinutes / 60) * 10) / 10;
        // Simple quality estimate based on duration (would be more sophisticated in production)
        const quality = Math.min(100, Math.round((duration / 8) * 100));

        resolve({ duration, quality });
      }
    });
  });
}

function fetchIOSHRV(AppleHealthKit: any, options: any): Promise<number | undefined> {
  return new Promise((resolve) => {
    AppleHealthKit.getHeartRateVariabilitySamples(options, (err: Error | null, results: any[]) => {
      if (err || !results || results.length === 0) {
        resolve(undefined);
      } else {
        // Get most recent HRV reading
        const latest = results[results.length - 1];
        resolve(Math.round(latest.value * 1000)); // Convert to ms
      }
    });
  });
}

function fetchIOSRestingHR(AppleHealthKit: any, options: any): Promise<number | undefined> {
  return new Promise((resolve) => {
    AppleHealthKit.getRestingHeartRate(options, (err: Error | null, results: any[]) => {
      if (err || !results || results.length === 0) {
        resolve(undefined);
      } else {
        const latest = results[results.length - 1];
        resolve(Math.round(latest.value));
      }
    });
  });
}

// Android-specific data fetching
async function fetchAndroidSnapshot(
  HealthConnect: any,
  startDate: Date,
  endDate: Date
): Promise<HealthSnapshot | null> {
  const { readRecords } = HealthConnect;
  const dateString = startDate.toISOString().split('T')[0];

  const timeRangeFilter = {
    operator: 'between',
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString(),
  };

  try {
    const [stepsData, caloriesData, sleepData, hrvData, restingHrData] = await Promise.all([
      readRecords('Steps', { timeRangeFilter }).catch(() => ({ records: [] })),
      readRecords('TotalCaloriesBurned', { timeRangeFilter }).catch(() => ({ records: [] })),
      readRecords('SleepSession', { timeRangeFilter }).catch(() => ({ records: [] })),
      readRecords('HeartRateVariability', { timeRangeFilter }).catch(() => ({ records: [] })),
      readRecords('RestingHeartRate', { timeRangeFilter }).catch(() => ({ records: [] })),
    ]);

    // Sum steps
    const steps = stepsData.records.reduce(
      (sum: number, r: any) => sum + (r.count || 0),
      0
    );

    // Sum calories
    const calories = Math.round(
      caloriesData.records.reduce(
        (sum: number, r: any) => sum + (r.energy?.inKilocalories || 0),
        0
      )
    );

    // Calculate sleep
    let sleepDuration: number | undefined;
    let sleepQuality: number | undefined;
    if (sleepData.records.length > 0) {
      let totalMinutes = 0;
      sleepData.records.forEach((session: any) => {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        totalMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
      });
      sleepDuration = Math.round((totalMinutes / 60) * 10) / 10;
      sleepQuality = Math.min(100, Math.round((sleepDuration / 8) * 100));
    }

    // Get latest HRV
    const hrv = hrvData.records.length > 0
      ? Math.round(hrvData.records[hrvData.records.length - 1].heartRateVariabilityMillis)
      : undefined;

    // Get latest resting HR
    const restingHr = restingHrData.records.length > 0
      ? Math.round(restingHrData.records[restingHrData.records.length - 1].beatsPerMinute)
      : undefined;

    return {
      date: dateString,
      steps: steps > 0 ? steps : undefined,
      activeCalories: calories > 0 ? calories : undefined,
      sleepDuration,
      sleepQuality,
      hrv,
      restingHr,
    };
  } catch (err) {
    console.error('Android health fetch error:', err);
    return null;
  }
}

export default useHealth;
