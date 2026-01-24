/**
 * Health Store
 *
 * Manages health data state, including daily snapshots and readiness scores.
 * Uses Zustand for state management with optional persistence.
 */

import { create } from 'zustand';
import {
  DailyHealthSnapshot,
  ReadinessFactors,
  getHealthAdapter,
} from '../adapters/health';

// ============================================
// TYPES
// ============================================

/**
 * Readiness tier for simplified display
 */
export type ReadinessTier = 'good' | 'moderate' | 'rest';

/**
 * Sync status
 */
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

// ============================================
// HELPERS
// ============================================

/**
 * Convert readiness score to tier
 */
export function getReadinessTier(score: number): ReadinessTier {
  if (score >= 70) return 'good';
  if (score >= 40) return 'moderate';
  return 'rest';
}

/**
 * Get readiness tier display info
 */
export function getReadinessTierInfo(tier: ReadinessTier): {
  label: string;
  description: string;
  color: string;
} {
  switch (tier) {
    case 'good':
      return {
        label: 'Ready to Go',
        description: 'Your body is well-rested and ready for a full session.',
        color: '#22C55E', // green-500
      };
    case 'moderate':
      return {
        label: 'Take It Easy',
        description: 'Consider a lighter session today.',
        color: '#F59E0B', // amber-500
      };
    case 'rest':
      return {
        label: 'Rest Day',
        description: 'Your body needs recovery. Focus on gentle movement.',
        color: '#EF4444', // red-500
      };
  }
}

// ============================================
// STORE STATE
// ============================================

interface HealthState {
  // Today's snapshot
  todaySnapshot: DailyHealthSnapshot | null;
  readinessScore: number | null;
  readinessFactors: ReadinessFactors | null;
  readinessTier: ReadinessTier | null;

  // Historical snapshots (last 14 days)
  recentSnapshots: DailyHealthSnapshot[];

  // Sync state
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  syncError: string | null;

  // Demo mode
  isDemoMode: boolean;

  // Actions
  setTodaySnapshot: (snapshot: DailyHealthSnapshot) => void;
  fetchHealth: (days?: number) => Promise<void>;
  refreshTodayHealth: () => Promise<void>;

  // Demo mode
  setDemoMode: (enabled: boolean) => void;

  // Queries
  getSnapshotForDate: (date: Date) => DailyHealthSnapshot | undefined;
  getReadinessTrend: (days?: number) => number[];

  // Clear
  clearHealth: () => void;
}

// ============================================
// STORE
// ============================================

export const useHealthStore = create<HealthState>((set, get) => ({
  todaySnapshot: null,
  readinessScore: null,
  readinessFactors: null,
  readinessTier: null,
  recentSnapshots: [],
  syncStatus: 'idle',
  lastSyncedAt: null,
  syncError: null,
  isDemoMode: false,

  setTodaySnapshot: (snapshot) => {
    const readinessScore = snapshot.readinessScore ?? null;
    const readinessFactors = snapshot.readinessFactors ?? null;
    const readinessTier = readinessScore !== null
      ? getReadinessTier(readinessScore)
      : null;

    set({
      todaySnapshot: snapshot,
      readinessScore,
      readinessFactors,
      readinessTier,
    });
  },

  fetchHealth: async (days = 7) => {
    const { isDemoMode } = get();

    set({ syncStatus: 'syncing', syncError: null });

    try {
      const adapter = getHealthAdapter(isDemoMode ? 'mock' : 'native');

      // Check availability
      const availability = await adapter.isAvailable();

      if (availability !== 'available') {
        // Try mock adapter if native not available
        const mockAdapter = getHealthAdapter('mock');
        const result = await mockAdapter.syncHealthData(days);

        if (!result.success) {
          throw new Error(result.error.message);
        }

        const snapshots = result.data;
        const today = new Date().toISOString().split('T')[0];
        const todaySnapshot = snapshots.find((s) => s.date === today);

        set({
          recentSnapshots: snapshots,
          syncStatus: 'success',
          lastSyncedAt: new Date(),
          isDemoMode: true, // Automatically switch to demo mode
        });

        if (todaySnapshot) {
          get().setTodaySnapshot(todaySnapshot);
        }

        return;
      }

      // Use native adapter
      const result = await adapter.syncHealthData(days);

      if (!result.success) {
        throw new Error(result.error.message);
      }

      const snapshots = result.data;
      const today = new Date().toISOString().split('T')[0];
      const todaySnapshot = snapshots.find((s) => s.date === today);

      set({
        recentSnapshots: snapshots,
        syncStatus: 'success',
        lastSyncedAt: new Date(),
      });

      if (todaySnapshot) {
        get().setTodaySnapshot(todaySnapshot);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({
        syncStatus: 'error',
        syncError: message,
      });
    }
  },

  refreshTodayHealth: async () => {
    const { isDemoMode } = get();

    try {
      const adapter = getHealthAdapter(isDemoMode ? 'mock' : 'native');
      const result = await adapter.getDailySnapshot(new Date());

      if (result.success) {
        get().setTodaySnapshot(result.data);
      }
    } catch (error) {
      console.error('Failed to refresh today health:', error);
    }
  },

  setDemoMode: (enabled) => {
    set({ isDemoMode: enabled });
    // Refetch with new mode
    get().fetchHealth();
  },

  getSnapshotForDate: (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const { recentSnapshots, todaySnapshot } = get();

    if (todaySnapshot?.date === dateStr) {
      return todaySnapshot;
    }

    return recentSnapshots.find((s) => s.date === dateStr);
  },

  getReadinessTrend: (days = 7) => {
    const { recentSnapshots } = get();

    // Get last N days of readiness scores
    const trend = recentSnapshots
      .slice(0, days)
      .map((s) => s.readinessScore ?? 50) // Default to 50 if no score
      .reverse(); // Oldest first for chart

    return trend;
  },

  clearHealth: () => {
    set({
      todaySnapshot: null,
      readinessScore: null,
      readinessFactors: null,
      readinessTier: null,
      recentSnapshots: [],
      lastSyncedAt: null,
      syncError: null,
    });
  },
}));

// ============================================
// SELECTORS
// ============================================

/**
 * Check if health data is available
 */
export const selectHasHealthData = (state: HealthState) =>
  state.todaySnapshot !== null;

/**
 * Get formatted readiness score
 */
export const selectFormattedReadiness = (state: HealthState) => {
  if (state.readinessScore === null) return '--';
  return `${state.readinessScore}%`;
};

/**
 * Get sleep summary
 */
export const selectSleepSummary = (state: HealthState) => {
  const snapshot = state.todaySnapshot;
  if (!snapshot?.sleepDuration) return null;

  const hours = Math.floor(snapshot.sleepDuration / 60);
  const minutes = snapshot.sleepDuration % 60;

  return {
    hours,
    minutes,
    formatted: `${hours}h ${minutes}m`,
    quality: snapshot.sleepQuality,
  };
};

/**
 * Get activity summary
 */
export const selectActivitySummary = (state: HealthState) => {
  const snapshot = state.todaySnapshot;
  if (!snapshot) return null;

  return {
    steps: snapshot.steps ?? 0,
    activeEnergy: snapshot.activeEnergy ?? 0,
    workoutMinutes: snapshot.workoutMinutes ?? 0,
    workoutCount: snapshot.workoutCount ?? 0,
  };
};

/**
 * Check if sync is in progress
 */
export const selectIsSyncing = (state: HealthState) =>
  state.syncStatus === 'syncing';
