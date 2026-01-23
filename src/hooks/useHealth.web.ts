/**
 * useHealth Hook (Web) - Movement & Recovery Companion
 *
 * Web stub - native health APIs not available on web.
 * Returns mock data and no-op functions for compatibility.
 */

import { useState, useCallback } from 'react';

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

/**
 * Web stub for useHealth hook.
 * Health data APIs are not available in web browsers.
 */
export function useHealth(): UseHealthResult {
  const [isLoading] = useState(false);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    // Health permissions not available on web
    console.log('Health permissions not available on web');
    return false;
  }, []);

  const fetchTodaySnapshot = useCallback(async (): Promise<HealthSnapshot | null> => {
    // Return mock data for web preview
    return {
      date: new Date().toISOString().split('T')[0],
      sleepDuration: 7.5,
      sleepQuality: 85,
      hrv: 55,
      restingHr: 58,
      steps: 8500,
      activeCalories: 450,
    };
  }, []);

  const fetchWeekSnapshots = useCallback(async (): Promise<HealthSnapshot[]> => {
    // Return mock week data for web preview
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        sleepDuration: 6.5 + Math.random() * 2,
        sleepQuality: 70 + Math.floor(Math.random() * 25),
        hrv: 45 + Math.floor(Math.random() * 20),
        restingHr: 55 + Math.floor(Math.random() * 10),
        steps: 5000 + Math.floor(Math.random() * 8000),
        activeCalories: 300 + Math.floor(Math.random() * 400),
      };
    });
  }, []);

  const syncToBackend = useCallback(async (_snapshots: HealthSnapshot[]): Promise<void> => {
    // No-op on web
    console.log('Health sync not available on web');
  }, []);

  return {
    isAvailable: false,
    permissions: {
      sleep: false,
      heartRate: false,
      steps: false,
      workouts: false,
    },
    isLoading,
    error: 'Health data not available on web',
    requestPermissions,
    fetchTodaySnapshot,
    fetchWeekSnapshots,
    syncToBackend,
  };
}
