/**
 * Readiness Store Tests - Movement & Recovery Companion
 *
 * Tests for readiness score calculation, health data management,
 * and baseline tracking.
 */

import { useReadinessStore } from './readiness';
import type { HealthSnapshot } from '@/types';

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Creates a mock health snapshot with sensible defaults.
 */
function createHealthSnapshot(overrides: Partial<HealthSnapshot> = {}): HealthSnapshot {
  return {
    id: `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    date: new Date(),
    sleepDuration: 7.5,
    sleepQuality: 80,
    deepSleepMinutes: 90,
    remSleepMinutes: 100,
    hrv: 55,
    restingHR: 58,
    steps: 8000,
    activeCalories: 400,
    synced: false,
    ...overrides,
  };
}

/**
 * Creates an optimal health snapshot for full readiness.
 */
function createOptimalSnapshot(): HealthSnapshot {
  return createHealthSnapshot({
    sleepDuration: 8,
    sleepQuality: 90,
    deepSleepMinutes: 120,
    hrv: 65,
    restingHR: 55,
  });
}

/**
 * Creates a poor health snapshot for rest recommendation.
 */
function createPoorSnapshot(): HealthSnapshot {
  return createHealthSnapshot({
    sleepDuration: 4,
    sleepQuality: 30,
    deepSleepMinutes: 30,
    hrv: 25,
    restingHR: 80,
  });
}

// =============================================================================
// Test Suite
// =============================================================================

describe('readinessStore', () => {
  beforeEach(() => {
    // Reset the store to initial state before each test
    useReadinessStore.getState().reset();
  });

  // ==========================================================================
  // Basic Store Operations
  // ==========================================================================

  describe('initial state', () => {
    it('starts with null readiness', () => {
      const store = useReadinessStore.getState();
      expect(store.currentReadiness).toBeNull();
    });

    it('starts with no health history', () => {
      const store = useReadinessStore.getState();
      expect(store.healthHistory).toHaveLength(0);
    });

    it('starts with null baselines', () => {
      const store = useReadinessStore.getState();
      expect(store.baselines.hrv).toBeNull();
      expect(store.baselines.restingHR).toBeNull();
      expect(store.baselines.sleepDuration).toBeNull();
      expect(store.baselines.sleepQuality).toBeNull();
    });
  });

  // ==========================================================================
  // Health Data Management
  // ==========================================================================

  describe('health data management', () => {
    it('updates latest health snapshot', () => {
      const store = useReadinessStore.getState();
      const snapshot = createHealthSnapshot();

      store.updateHealthSnapshot(snapshot);

      expect(useReadinessStore.getState().latestHealthSnapshot).toEqual(snapshot);
    });

    it('adds snapshot to health history', () => {
      const store = useReadinessStore.getState();
      const snapshot = createHealthSnapshot();

      store.addHealthHistory(snapshot);

      const updatedState = useReadinessStore.getState();
      expect(updatedState.healthHistory).toHaveLength(1);
      expect(updatedState.healthHistory[0]).toEqual(snapshot);
    });

    it('maintains health history in reverse chronological order', () => {
      const store = useReadinessStore.getState();
      const older = createHealthSnapshot({ id: 'older' });
      const newer = createHealthSnapshot({ id: 'newer' });

      store.addHealthHistory(older);
      store.addHealthHistory(newer);

      const updatedState = useReadinessStore.getState();
      expect(updatedState.healthHistory[0].id).toBe('newer');
      expect(updatedState.healthHistory[1].id).toBe('older');
    });

    it('limits health history to 30 days', () => {
      const store = useReadinessStore.getState();

      // Add 35 snapshots
      for (let i = 0; i < 35; i++) {
        store.addHealthHistory(createHealthSnapshot({ id: `day-${i}` }));
      }

      const updatedState = useReadinessStore.getState();
      expect(updatedState.healthHistory.length).toBe(30);
    });
  });

  // ==========================================================================
  // Readiness Calculation
  // ==========================================================================

  describe('calculateReadiness', () => {
    it('returns full recommendation when all factors are optimal', () => {
      const store = useReadinessStore.getState();
      const snapshot = createOptimalSnapshot();

      store.updateHealthSnapshot(snapshot);
      store.addHealthHistory(snapshot);
      store.calculateReadiness(0); // no active injuries

      const readiness = useReadinessStore.getState().currentReadiness;
      expect(readiness).not.toBeNull();
      expect(readiness?.recommendation).toBe('full');
      expect(readiness?.score).toBeGreaterThanOrEqual(75);
    });

    it('recommends rest when multiple factors are poor', () => {
      const store = useReadinessStore.getState();
      const poorSnapshot = createPoorSnapshot();

      store.updateHealthSnapshot(poorSnapshot);
      store.calculateReadiness(2); // 2 active injuries

      const readiness = useReadinessStore.getState().currentReadiness;
      expect(readiness?.recommendation).toBe('rest');
      expect(readiness?.score).toBeLessThan(35);
    });

    it('adjusts score for active injuries', () => {
      const store = useReadinessStore.getState();
      const goodSnapshot = createHealthSnapshot({
        sleepDuration: 7.5,
        sleepQuality: 85,
        hrv: 60,
        restingHR: 58,
      });

      store.updateHealthSnapshot(goodSnapshot);
      store.calculateReadiness(0);
      const scoreWithNoInjuries = useReadinessStore.getState().currentReadiness?.score ?? 0;

      store.calculateReadiness(3); // 3 injuries
      const scoreWithInjuries = useReadinessStore.getState().currentReadiness?.score ?? 0;

      expect(scoreWithInjuries).toBeLessThan(scoreWithNoInjuries);
    });

    it('provides default readiness when no health data available', () => {
      const store = useReadinessStore.getState();

      store.calculateReadiness(0);

      const readiness = useReadinessStore.getState().currentReadiness;
      expect(readiness).not.toBeNull();
      expect(readiness?.score).toBe(70); // Default score
      expect(readiness?.reasoning).toContain('No health data available');
    });

    it('calculates readiness factors correctly', () => {
      const store = useReadinessStore.getState();
      const snapshot = createHealthSnapshot({
        sleepDuration: 6,
        sleepQuality: 70,
        hrv: 50,
        restingHR: 60,
      });

      store.updateHealthSnapshot(snapshot);
      store.calculateReadiness(1);

      const readiness = useReadinessStore.getState().currentReadiness;
      expect(readiness?.factors).toHaveProperty('sleep');
      expect(readiness?.factors).toHaveProperty('recovery');
      expect(readiness?.factors).toHaveProperty('load');
      expect(readiness?.factors).toHaveProperty('body');
    });

    it('updates lastCalculatedAt timestamp', () => {
      const store = useReadinessStore.getState();
      const snapshot = createHealthSnapshot();

      store.updateHealthSnapshot(snapshot);
      const beforeCalculation = new Date();
      store.calculateReadiness(0);

      const lastCalculated = useReadinessStore.getState().lastCalculatedAt;
      expect(lastCalculated).not.toBeNull();
      expect(lastCalculated!.getTime()).toBeGreaterThanOrEqual(beforeCalculation.getTime());
    });
  });

  // ==========================================================================
  // Recommendation Thresholds
  // ==========================================================================

  describe('recommendation thresholds', () => {
    it('returns moderate recommendation for medium readiness', () => {
      const store = useReadinessStore.getState();
      const snapshot = createHealthSnapshot({
        sleepDuration: 6,
        sleepQuality: 60,
        hrv: 45,
        restingHR: 65,
      });

      store.updateHealthSnapshot(snapshot);
      store.calculateReadiness(1);

      const readiness = useReadinessStore.getState().currentReadiness;
      // Score should be between 55-74 for 'moderate'
      expect(['moderate', 'light']).toContain(readiness?.recommendation);
    });

    it('provides reasoning for recommendations', () => {
      const store = useReadinessStore.getState();
      const poorSleepSnapshot = createHealthSnapshot({
        sleepDuration: 4,
        sleepQuality: 40,
      });

      store.updateHealthSnapshot(poorSleepSnapshot);
      store.calculateReadiness(0);

      const readiness = useReadinessStore.getState().currentReadiness;
      expect(readiness?.reasoning).toBeTruthy();
      expect(readiness?.reasoning.toLowerCase()).toContain('sleep');
    });

    it('suggests modifications when needed', () => {
      const store = useReadinessStore.getState();
      const snapshot = createHealthSnapshot({
        sleepDuration: 4.5,
        sleepQuality: 40,
      });

      store.updateHealthSnapshot(snapshot);
      store.calculateReadiness(2);

      const readiness = useReadinessStore.getState().currentReadiness;
      expect(readiness?.suggestedModifications).toBeDefined();
      expect(readiness?.suggestedModifications?.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // Baselines
  // ==========================================================================

  describe('baselines', () => {
    it('calculates 7-day rolling averages', () => {
      const store = useReadinessStore.getState();

      // Add 7 days of health data with varying HRV: 50, 52, 54, 56, 58, 60, 62
      for (let i = 0; i < 7; i++) {
        store.addHealthHistory(
          createHealthSnapshot({
            id: `day-${i}`,
            date: new Date(Date.now() - i * 86400000),
            hrv: 50 + i * 2,
            restingHR: 60,
            sleepDuration: 7,
          })
        );
      }

      const baselines = useReadinessStore.getState().baselines;
      // Average of 50, 52, 54, 56, 58, 60, 62 = 56
      expect(baselines.hrv).toBeCloseTo(56, 0);
    });

    it('updates baselines when health history changes', () => {
      const store = useReadinessStore.getState();

      store.addHealthHistory(createHealthSnapshot({ hrv: 50 }));
      expect(useReadinessStore.getState().baselines.hrv).toBe(50);

      store.addHealthHistory(createHealthSnapshot({ hrv: 60 }));
      expect(useReadinessStore.getState().baselines.hrv).toBe(55); // (50 + 60) / 2
    });

    it('handles missing values in baseline calculation', () => {
      const store = useReadinessStore.getState();

      store.addHealthHistory(createHealthSnapshot({ hrv: 50, sleepDuration: 7 }));
      store.addHealthHistory(createHealthSnapshot({ hrv: undefined, sleepDuration: 8 }));

      const baselines = useReadinessStore.getState().baselines;
      expect(baselines.hrv).toBe(50); // Only one valid HRV value
      expect(baselines.sleepDuration).toBe(7.5); // Average of both
    });

    it('only considers last 7 entries for baselines', () => {
      const store = useReadinessStore.getState();

      // Add 10 snapshots with HRV values
      for (let i = 0; i < 10; i++) {
        store.addHealthHistory(
          createHealthSnapshot({
            id: `day-${i}`,
            hrv: i < 3 ? 100 : 50, // First 3 (most recent) are 100, rest are 50
          })
        );
      }

      const baselines = useReadinessStore.getState().baselines;
      // Should only consider the first 7 entries (3 x 100 + 4 x 50) / 7 = ~71.4
      expect(baselines.hrv).toBeCloseTo(71.4, 0);
    });
  });

  // ==========================================================================
  // Query Methods
  // ==========================================================================

  describe('query methods', () => {
    describe('getReadinessColor', () => {
      it('returns correct color for full recommendation', () => {
        const store = useReadinessStore.getState();
        store.setReadiness({
          score: 80,
          factors: { sleep: 80, recovery: 80, load: 80, body: 100 },
          recommendation: 'full',
          reasoning: 'All good',
          calculatedAt: new Date(),
        });

        expect(store.getReadinessColor()).toBe('#22C55E'); // Green
      });

      it('returns correct color for rest recommendation', () => {
        const store = useReadinessStore.getState();
        store.setReadiness({
          score: 20,
          factors: { sleep: 20, recovery: 20, load: 20, body: 40 },
          recommendation: 'rest',
          reasoning: 'Need rest',
          calculatedAt: new Date(),
        });

        expect(store.getReadinessColor()).toBe('#EF4444'); // Red
      });

      it('returns moderate color when no readiness set', () => {
        const store = useReadinessStore.getState();
        expect(store.getReadinessColor()).toBe('#F59E0B'); // Amber
      });
    });

    describe('getReadinessIcon', () => {
      it('returns correct icon for recommendations', () => {
        const store = useReadinessStore.getState();

        store.setReadiness({
          score: 80,
          factors: { sleep: 80, recovery: 80, load: 80, body: 100 },
          recommendation: 'full',
          reasoning: 'All good',
          calculatedAt: new Date(),
        });
        expect(store.getReadinessIcon()).toBe('flash');

        store.setReadiness({
          score: 20,
          factors: { sleep: 20, recovery: 20, load: 20, body: 40 },
          recommendation: 'rest',
          reasoning: 'Need rest',
          calculatedAt: new Date(),
        });
        expect(store.getReadinessIcon()).toBe('bed');
      });
    });

    describe('shouldSuggestRest', () => {
      it('returns true when recommendation is rest', () => {
        const store = useReadinessStore.getState();
        store.setReadiness({
          score: 20,
          factors: { sleep: 20, recovery: 20, load: 20, body: 40 },
          recommendation: 'rest',
          reasoning: 'Need rest',
          calculatedAt: new Date(),
        });

        expect(store.shouldSuggestRest()).toBe(true);
      });

      it('returns false for other recommendations', () => {
        const store = useReadinessStore.getState();
        store.setReadiness({
          score: 80,
          factors: { sleep: 80, recovery: 80, load: 80, body: 100 },
          recommendation: 'full',
          reasoning: 'All good',
          calculatedAt: new Date(),
        });

        expect(store.shouldSuggestRest()).toBe(false);
      });
    });
  });

  // ==========================================================================
  // Loading State
  // ==========================================================================

  describe('loading state', () => {
    it('sets loading state correctly', () => {
      const store = useReadinessStore.getState();

      expect(store.isLoading).toBe(false);

      store.setLoading(true);
      expect(useReadinessStore.getState().isLoading).toBe(true);

      store.setLoading(false);
      expect(useReadinessStore.getState().isLoading).toBe(false);
    });
  });

  // ==========================================================================
  // Reset
  // ==========================================================================

  describe('reset', () => {
    it('resets store to initial state', () => {
      const store = useReadinessStore.getState();

      // Set up some state
      store.updateHealthSnapshot(createHealthSnapshot());
      store.addHealthHistory(createHealthSnapshot());
      store.calculateReadiness(0);
      store.setLoading(true);

      // Reset
      store.reset();

      const resetState = useReadinessStore.getState();
      expect(resetState.currentReadiness).toBeNull();
      expect(resetState.latestHealthSnapshot).toBeNull();
      expect(resetState.healthHistory).toHaveLength(0);
      expect(resetState.isLoading).toBe(false);
    });
  });
});
