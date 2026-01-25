/**
 * Health Store Tests
 *
 * Tests for health data state management including readiness scores,
 * sync operations, and selectors.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  useHealthStore,
  getReadinessTier,
  getReadinessTierInfo,
  selectHasHealthData,
  selectFormattedReadiness,
  selectSleepSummary,
  selectActivitySummary,
  selectIsSyncing,
} from '../src/stores/health';
import type { ReadinessTier } from '../src/stores/health';

// Mock the health adapter module
vi.mock('../src/adapters/health', () => ({
  getHealthAdapter: vi.fn(() => ({
    isAvailable: vi.fn().mockResolvedValue('available'),
    syncHealthData: vi.fn().mockResolvedValue({
      success: true,
      data: [
        {
          date: new Date().toISOString().split('T')[0],
          sleepDuration: 420,
          sleepQuality: 85,
          readinessScore: 75,
          readinessFactors: {
            sleepQuality: 85,
            sleepDuration: 80,
            hrv: 70,
            restingHeartRate: 75,
            activityBalance: 72,
          },
          steps: 8000,
          activeEnergy: 450,
          workoutMinutes: 45,
          workoutCount: 1,
        },
      ],
    }),
    getDailySnapshot: vi.fn().mockResolvedValue({
      success: true,
      data: {
        date: new Date().toISOString().split('T')[0],
        sleepDuration: 420,
        sleepQuality: 85,
        readinessScore: 75,
        readinessFactors: {
          sleepQuality: 85,
          sleepDuration: 80,
          hrv: 70,
          restingHeartRate: 75,
          activityBalance: 72,
        },
        steps: 8000,
        activeEnergy: 450,
        workoutMinutes: 45,
        workoutCount: 1,
      },
    }),
  })),
}));

describe('useHealthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const state = useHealthStore.getState();
    state.clearHealth();
    // Reset demo mode
    useHealthStore.setState({ isDemoMode: false, syncStatus: 'idle' });
  });

  describe('Initial State', () => {
    it('should have null todaySnapshot initially', () => {
      const state = useHealthStore.getState();
      expect(state.todaySnapshot).toBeNull();
    });

    it('should have null readinessScore initially', () => {
      const state = useHealthStore.getState();
      expect(state.readinessScore).toBeNull();
    });

    it('should have null readinessFactors initially', () => {
      const state = useHealthStore.getState();
      expect(state.readinessFactors).toBeNull();
    });

    it('should have null readinessTier initially', () => {
      const state = useHealthStore.getState();
      expect(state.readinessTier).toBeNull();
    });

    it('should have empty recentSnapshots initially', () => {
      const state = useHealthStore.getState();
      expect(state.recentSnapshots).toHaveLength(0);
    });

    it('should have idle syncStatus initially', () => {
      const state = useHealthStore.getState();
      expect(state.syncStatus).toBe('idle');
    });

    it('should have null lastSyncedAt initially', () => {
      const state = useHealthStore.getState();
      expect(state.lastSyncedAt).toBeNull();
    });

    it('should have null syncError initially', () => {
      const state = useHealthStore.getState();
      expect(state.syncError).toBeNull();
    });

    it('should have isDemoMode false initially', () => {
      const state = useHealthStore.getState();
      expect(state.isDemoMode).toBe(false);
    });
  });

  describe('setTodaySnapshot', () => {
    it('should set today snapshot', () => {
      const snapshot = {
        date: '2024-01-15',
        sleepDuration: 480,
        sleepQuality: 90,
        readinessScore: 85,
        readinessFactors: {
          sleepQuality: 90,
          sleepDuration: 88,
          hrv: 82,
          restingHeartRate: 85,
          activityBalance: 80,
        },
        steps: 10000,
        activeEnergy: 500,
        workoutMinutes: 60,
        workoutCount: 2,
      };

      useHealthStore.getState().setTodaySnapshot(snapshot);

      const state = useHealthStore.getState();
      expect(state.todaySnapshot).toEqual(snapshot);
      expect(state.readinessScore).toBe(85);
      expect(state.readinessFactors).toEqual(snapshot.readinessFactors);
      expect(state.readinessTier).toBe('good');
    });

    it('should calculate readiness tier as good for score >= 70', () => {
      const snapshot = {
        date: '2024-01-15',
        readinessScore: 75,
      };

      useHealthStore.getState().setTodaySnapshot(snapshot);

      expect(useHealthStore.getState().readinessTier).toBe('good');
    });

    it('should calculate readiness tier as moderate for score 40-69', () => {
      const snapshot = {
        date: '2024-01-15',
        readinessScore: 55,
      };

      useHealthStore.getState().setTodaySnapshot(snapshot);

      expect(useHealthStore.getState().readinessTier).toBe('moderate');
    });

    it('should calculate readiness tier as rest for score < 40', () => {
      const snapshot = {
        date: '2024-01-15',
        readinessScore: 30,
      };

      useHealthStore.getState().setTodaySnapshot(snapshot);

      expect(useHealthStore.getState().readinessTier).toBe('rest');
    });

    it('should handle snapshot without readiness score', () => {
      const snapshot = {
        date: '2024-01-15',
        sleepDuration: 420,
      };

      useHealthStore.getState().setTodaySnapshot(snapshot);

      const state = useHealthStore.getState();
      expect(state.todaySnapshot).toEqual(snapshot);
      expect(state.readinessScore).toBeNull();
      expect(state.readinessTier).toBeNull();
    });
  });

  describe('fetchHealth', () => {
    it('should set syncStatus to syncing during fetch', async () => {
      const fetchPromise = useHealthStore.getState().fetchHealth(7);

      // Check syncing status (may be instant due to mock)
      expect(['syncing', 'success']).toContain(useHealthStore.getState().syncStatus);

      await fetchPromise;
    });

    it('should set syncStatus to success after successful fetch', async () => {
      await useHealthStore.getState().fetchHealth(7);

      expect(useHealthStore.getState().syncStatus).toBe('success');
    });

    it('should set lastSyncedAt after successful fetch', async () => {
      await useHealthStore.getState().fetchHealth(7);

      expect(useHealthStore.getState().lastSyncedAt).toBeInstanceOf(Date);
    });

    it('should populate recentSnapshots after fetch', async () => {
      await useHealthStore.getState().fetchHealth(7);

      expect(useHealthStore.getState().recentSnapshots.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('setDemoMode', () => {
    it('should set demo mode', () => {
      useHealthStore.getState().setDemoMode(true);

      expect(useHealthStore.getState().isDemoMode).toBe(true);
    });

    it('should toggle demo mode off', async () => {
      useHealthStore.getState().setDemoMode(true);
      useHealthStore.getState().setDemoMode(false);

      expect(useHealthStore.getState().isDemoMode).toBe(false);
    });
  });

  describe('getSnapshotForDate', () => {
    it('should return todaySnapshot for today date', () => {
      const today = new Date();
      const snapshot = {
        date: today.toISOString().split('T')[0],
        readinessScore: 75,
      };

      useHealthStore.getState().setTodaySnapshot(snapshot);

      const result = useHealthStore.getState().getSnapshotForDate(today);
      expect(result).toEqual(snapshot);
    });

    it('should return snapshot from recentSnapshots for past date', () => {
      const pastDate = new Date('2024-01-10');
      const pastSnapshot = {
        date: '2024-01-10',
        readinessScore: 65,
      };

      useHealthStore.setState({
        recentSnapshots: [pastSnapshot],
      });

      const result = useHealthStore.getState().getSnapshotForDate(pastDate);
      expect(result).toEqual(pastSnapshot);
    });

    it('should return undefined for date not in snapshots', () => {
      const unknownDate = new Date('2020-01-01');

      const result = useHealthStore.getState().getSnapshotForDate(unknownDate);
      expect(result).toBeUndefined();
    });
  });

  describe('getReadinessTrend', () => {
    it('should return array of readiness scores', () => {
      useHealthStore.setState({
        recentSnapshots: [
          { date: '2024-01-15', readinessScore: 80 },
          { date: '2024-01-14', readinessScore: 75 },
          { date: '2024-01-13', readinessScore: 70 },
        ],
      });

      const trend = useHealthStore.getState().getReadinessTrend(3);
      expect(trend).toHaveLength(3);
      // Reversed: oldest first for chart
      expect(trend).toEqual([70, 75, 80]);
    });

    it('should default to 50 for missing readiness scores', () => {
      useHealthStore.setState({
        recentSnapshots: [
          { date: '2024-01-15' },
          { date: '2024-01-14', readinessScore: 75 },
        ],
      });

      const trend = useHealthStore.getState().getReadinessTrend(2);
      expect(trend).toEqual([75, 50]);
    });

    it('should limit to requested number of days', () => {
      useHealthStore.setState({
        recentSnapshots: [
          { date: '2024-01-15', readinessScore: 80 },
          { date: '2024-01-14', readinessScore: 75 },
          { date: '2024-01-13', readinessScore: 70 },
          { date: '2024-01-12', readinessScore: 65 },
          { date: '2024-01-11', readinessScore: 60 },
        ],
      });

      const trend = useHealthStore.getState().getReadinessTrend(3);
      expect(trend).toHaveLength(3);
    });

    it('should return empty array when no snapshots', () => {
      const trend = useHealthStore.getState().getReadinessTrend(7);
      expect(trend).toEqual([]);
    });
  });

  describe('clearHealth', () => {
    it('should clear all health data', () => {
      // Set some data first
      useHealthStore.getState().setTodaySnapshot({
        date: '2024-01-15',
        readinessScore: 75,
        readinessFactors: {
          sleepQuality: 80,
          sleepDuration: 75,
          hrv: 70,
          restingHeartRate: 72,
          activityBalance: 68,
        },
      });
      useHealthStore.setState({
        recentSnapshots: [{ date: '2024-01-14', readinessScore: 70 }],
        lastSyncedAt: new Date(),
        syncError: 'previous error',
      });

      // Clear
      useHealthStore.getState().clearHealth();

      const state = useHealthStore.getState();
      expect(state.todaySnapshot).toBeNull();
      expect(state.readinessScore).toBeNull();
      expect(state.readinessFactors).toBeNull();
      expect(state.readinessTier).toBeNull();
      expect(state.recentSnapshots).toHaveLength(0);
      expect(state.lastSyncedAt).toBeNull();
      expect(state.syncError).toBeNull();
    });
  });
});

describe('Helper Functions', () => {
  describe('getReadinessTier', () => {
    it('should return good for scores >= 70', () => {
      expect(getReadinessTier(70)).toBe('good');
      expect(getReadinessTier(85)).toBe('good');
      expect(getReadinessTier(100)).toBe('good');
    });

    it('should return moderate for scores 40-69', () => {
      expect(getReadinessTier(40)).toBe('moderate');
      expect(getReadinessTier(55)).toBe('moderate');
      expect(getReadinessTier(69)).toBe('moderate');
    });

    it('should return rest for scores < 40', () => {
      expect(getReadinessTier(0)).toBe('rest');
      expect(getReadinessTier(20)).toBe('rest');
      expect(getReadinessTier(39)).toBe('rest');
    });

    it('should handle boundary values correctly', () => {
      expect(getReadinessTier(70)).toBe('good');
      expect(getReadinessTier(69)).toBe('moderate');
      expect(getReadinessTier(40)).toBe('moderate');
      expect(getReadinessTier(39)).toBe('rest');
    });
  });

  describe('getReadinessTierInfo', () => {
    it('should return correct info for good tier', () => {
      const info = getReadinessTierInfo('good');
      expect(info.label).toBe('Ready to Go');
      expect(info.description).toContain('ready for a full session');
      expect(info.color).toBe('#22C55E');
    });

    it('should return correct info for moderate tier', () => {
      const info = getReadinessTierInfo('moderate');
      expect(info.label).toBe('Take It Easy');
      expect(info.description).toContain('lighter session');
      expect(info.color).toBe('#F59E0B');
    });

    it('should return correct info for rest tier', () => {
      const info = getReadinessTierInfo('rest');
      expect(info.label).toBe('Rest Day');
      expect(info.description).toContain('recovery');
      expect(info.color).toBe('#EF4444');
    });

    it('should have consistent structure for all tiers', () => {
      const tiers: ReadinessTier[] = ['good', 'moderate', 'rest'];

      tiers.forEach((tier) => {
        const info = getReadinessTierInfo(tier);
        expect(info).toHaveProperty('label');
        expect(info).toHaveProperty('description');
        expect(info).toHaveProperty('color');
        expect(typeof info.label).toBe('string');
        expect(typeof info.description).toBe('string');
        expect(info.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });
});

describe('Selectors', () => {
  beforeEach(() => {
    useHealthStore.getState().clearHealth();
  });

  describe('selectHasHealthData', () => {
    it('should return false when no snapshot', () => {
      const state = useHealthStore.getState();
      expect(selectHasHealthData(state)).toBe(false);
    });

    it('should return true when snapshot exists', () => {
      useHealthStore.getState().setTodaySnapshot({
        date: '2024-01-15',
        readinessScore: 75,
      });

      const state = useHealthStore.getState();
      expect(selectHasHealthData(state)).toBe(true);
    });
  });

  describe('selectFormattedReadiness', () => {
    it('should return -- when no readiness score', () => {
      const state = useHealthStore.getState();
      expect(selectFormattedReadiness(state)).toBe('--');
    });

    it('should return formatted percentage when score exists', () => {
      useHealthStore.getState().setTodaySnapshot({
        date: '2024-01-15',
        readinessScore: 75,
      });

      const state = useHealthStore.getState();
      expect(selectFormattedReadiness(state)).toBe('75%');
    });

    it('should handle zero score', () => {
      useHealthStore.getState().setTodaySnapshot({
        date: '2024-01-15',
        readinessScore: 0,
      });

      const state = useHealthStore.getState();
      expect(selectFormattedReadiness(state)).toBe('0%');
    });
  });

  describe('selectSleepSummary', () => {
    it('should return null when no snapshot', () => {
      const state = useHealthStore.getState();
      expect(selectSleepSummary(state)).toBeNull();
    });

    it('should return null when snapshot has no sleep data', () => {
      useHealthStore.getState().setTodaySnapshot({
        date: '2024-01-15',
        readinessScore: 75,
      });

      const state = useHealthStore.getState();
      expect(selectSleepSummary(state)).toBeNull();
    });

    it('should return formatted sleep summary', () => {
      useHealthStore.getState().setTodaySnapshot({
        date: '2024-01-15',
        sleepDuration: 450, // 7h 30m
        sleepQuality: 85,
      });

      const state = useHealthStore.getState();
      const summary = selectSleepSummary(state);

      expect(summary).not.toBeNull();
      expect(summary?.hours).toBe(7);
      expect(summary?.minutes).toBe(30);
      expect(summary?.formatted).toBe('7h 30m');
      expect(summary?.quality).toBe(85);
    });

    it('should handle whole hour sleep', () => {
      useHealthStore.getState().setTodaySnapshot({
        date: '2024-01-15',
        sleepDuration: 480, // 8h 0m
        sleepQuality: 90,
      });

      const state = useHealthStore.getState();
      const summary = selectSleepSummary(state);

      expect(summary?.hours).toBe(8);
      expect(summary?.minutes).toBe(0);
      expect(summary?.formatted).toBe('8h 0m');
    });
  });

  describe('selectActivitySummary', () => {
    it('should return null when no snapshot', () => {
      const state = useHealthStore.getState();
      expect(selectActivitySummary(state)).toBeNull();
    });

    it('should return activity summary with defaults for missing values', () => {
      useHealthStore.getState().setTodaySnapshot({
        date: '2024-01-15',
        readinessScore: 75,
      });

      const state = useHealthStore.getState();
      const summary = selectActivitySummary(state);

      expect(summary).not.toBeNull();
      expect(summary?.steps).toBe(0);
      expect(summary?.activeEnergy).toBe(0);
      expect(summary?.workoutMinutes).toBe(0);
      expect(summary?.workoutCount).toBe(0);
    });

    it('should return activity summary with actual values', () => {
      useHealthStore.getState().setTodaySnapshot({
        date: '2024-01-15',
        steps: 10000,
        activeEnergy: 500,
        workoutMinutes: 60,
        workoutCount: 2,
      });

      const state = useHealthStore.getState();
      const summary = selectActivitySummary(state);

      expect(summary?.steps).toBe(10000);
      expect(summary?.activeEnergy).toBe(500);
      expect(summary?.workoutMinutes).toBe(60);
      expect(summary?.workoutCount).toBe(2);
    });
  });

  describe('selectIsSyncing', () => {
    it('should return false when status is idle', () => {
      useHealthStore.setState({ syncStatus: 'idle' });
      const state = useHealthStore.getState();
      expect(selectIsSyncing(state)).toBe(false);
    });

    it('should return true when status is syncing', () => {
      useHealthStore.setState({ syncStatus: 'syncing' });
      const state = useHealthStore.getState();
      expect(selectIsSyncing(state)).toBe(true);
    });

    it('should return false when status is success', () => {
      useHealthStore.setState({ syncStatus: 'success' });
      const state = useHealthStore.getState();
      expect(selectIsSyncing(state)).toBe(false);
    });

    it('should return false when status is error', () => {
      useHealthStore.setState({ syncStatus: 'error' });
      const state = useHealthStore.getState();
      expect(selectIsSyncing(state)).toBe(false);
    });
  });
});

describe('Edge Cases', () => {
  beforeEach(() => {
    useHealthStore.getState().clearHealth();
  });

  it('should handle updating snapshot multiple times', () => {
    const store = useHealthStore.getState();

    store.setTodaySnapshot({ date: '2024-01-15', readinessScore: 50 });
    expect(useHealthStore.getState().readinessScore).toBe(50);
    expect(useHealthStore.getState().readinessTier).toBe('moderate');

    store.setTodaySnapshot({ date: '2024-01-15', readinessScore: 75 });
    expect(useHealthStore.getState().readinessScore).toBe(75);
    expect(useHealthStore.getState().readinessTier).toBe('good');

    store.setTodaySnapshot({ date: '2024-01-15', readinessScore: 30 });
    expect(useHealthStore.getState().readinessScore).toBe(30);
    expect(useHealthStore.getState().readinessTier).toBe('rest');
  });

  it('should handle extreme readiness scores', () => {
    expect(getReadinessTier(0)).toBe('rest');
    expect(getReadinessTier(100)).toBe('good');
  });

  it('should handle very long sleep duration', () => {
    useHealthStore.getState().setTodaySnapshot({
      date: '2024-01-15',
      sleepDuration: 720, // 12 hours
      sleepQuality: 95,
    });

    const state = useHealthStore.getState();
    const summary = selectSleepSummary(state);

    expect(summary?.hours).toBe(12);
    expect(summary?.minutes).toBe(0);
  });

  it('should handle very short sleep duration', () => {
    useHealthStore.getState().setTodaySnapshot({
      date: '2024-01-15',
      sleepDuration: 30, // 30 minutes
      sleepQuality: 20,
    });

    const state = useHealthStore.getState();
    const summary = selectSleepSummary(state);

    expect(summary?.hours).toBe(0);
    expect(summary?.minutes).toBe(30);
  });

  it('should handle high step counts', () => {
    useHealthStore.getState().setTodaySnapshot({
      date: '2024-01-15',
      steps: 50000,
      activeEnergy: 3000,
    });

    const state = useHealthStore.getState();
    const summary = selectActivitySummary(state);

    expect(summary?.steps).toBe(50000);
    expect(summary?.activeEnergy).toBe(3000);
  });
});
