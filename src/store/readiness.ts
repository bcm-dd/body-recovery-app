/**
 * Readiness Store - Movement & Recovery Companion
 *
 * Manages real-time readiness assessment combining body model state
 * with health data signals.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  ReadinessInput,
  ReadinessOutput,
  ReadinessRecommendation,
  HealthSnapshot,
} from '@/types';

// ============================================================================
// Types
// ============================================================================

interface ReadinessState {
  // Current readiness
  currentReadiness: ReadinessOutput | null;

  // Health data
  latestHealthSnapshot: HealthSnapshot | null;
  healthHistory: HealthSnapshot[];

  // Baselines (7-day rolling averages)
  baselines: {
    hrv: number | null;
    restingHR: number | null;
    sleepDuration: number | null;
    sleepQuality: number | null;
  };

  // Status
  isLoading: boolean;
  lastCalculatedAt: Date | null;
}

interface ReadinessActions {
  // Health data
  updateHealthSnapshot: (snapshot: HealthSnapshot) => void;
  addHealthHistory: (snapshot: HealthSnapshot) => void;

  // Readiness calculation
  calculateReadiness: (activeInjuryCount: number) => void;
  setReadiness: (readiness: ReadinessOutput) => void;

  // Baselines
  updateBaselines: () => void;

  // Queries
  getReadinessColor: () => string;
  getReadinessIcon: () => string;
  shouldSuggestRest: () => boolean;

  // Utility
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

type ReadinessStore = ReadinessState & ReadinessActions;

// ============================================================================
// Constants
// ============================================================================

const READINESS_COLORS = {
  full: '#22C55E', // Green
  moderate: '#F59E0B', // Amber
  light: '#F97316', // Orange
  rest: '#EF4444', // Red
};

const READINESS_ICONS = {
  full: 'flash',
  moderate: 'flash-outline',
  light: 'battery-half',
  rest: 'bed',
};

// ============================================================================
// Initial State
// ============================================================================

const initialState: ReadinessState = {
  currentReadiness: null,
  latestHealthSnapshot: null,
  healthHistory: [],
  baselines: {
    hrv: null,
    restingHR: null,
    sleepDuration: null,
    sleepQuality: null,
  },
  isLoading: false,
  lastCalculatedAt: null,
};

// ============================================================================
// Readiness Calculation
// ============================================================================

function calculateReadinessScore(input: ReadinessInput): ReadinessOutput {
  // Sleep factor (0-100)
  let sleepScore = 0;
  if (input.sleep.duration >= 7 && input.sleep.duration <= 9) {
    sleepScore = 100;
  } else if (input.sleep.duration >= 6) {
    sleepScore = 70 + (input.sleep.duration - 6) * 30;
  } else if (input.sleep.duration >= 5) {
    sleepScore = 40 + (input.sleep.duration - 5) * 30;
  } else {
    sleepScore = Math.max(0, input.sleep.duration * 8);
  }
  sleepScore = sleepScore * 0.5 + input.sleep.quality * 0.3 + input.sleep.deepSleepRatio * 100 * 0.2;

  // Recovery factor (HRV-based) (0-100)
  let recoveryScore = 50; // Default if no data
  if (input.hrv.current && input.hrv.baseline) {
    const hrvRatio = input.hrv.current / input.hrv.baseline;
    if (hrvRatio >= 1.1) {
      recoveryScore = 100;
    } else if (hrvRatio >= 1.0) {
      recoveryScore = 80 + (hrvRatio - 1.0) * 200;
    } else if (hrvRatio >= 0.9) {
      recoveryScore = 60 + (hrvRatio - 0.9) * 200;
    } else if (hrvRatio >= 0.8) {
      recoveryScore = 40 + (hrvRatio - 0.8) * 200;
    } else {
      recoveryScore = Math.max(0, hrvRatio * 50);
    }

    // Adjust based on trend
    if (input.hrv.trend === 'up') {
      recoveryScore = Math.min(100, recoveryScore + 10);
    } else if (input.hrv.trend === 'down') {
      recoveryScore = Math.max(0, recoveryScore - 10);
    }
  }

  // Resting HR factor (inverse relationship)
  if (input.restingHR.current && input.restingHR.baseline) {
    const hrDiff = input.restingHR.current - input.restingHR.baseline;
    if (hrDiff > 5) {
      recoveryScore = Math.max(0, recoveryScore - 15);
    } else if (hrDiff > 10) {
      recoveryScore = Math.max(0, recoveryScore - 25);
    }
  }

  // Load factor (0-100) - higher score when well-recovered
  let loadScore = 80; // Default
  if (input.recentLoad.last48Hours > 150) {
    loadScore = 40;
  } else if (input.recentLoad.last48Hours > 100) {
    loadScore = 60;
  } else if (input.recentLoad.last48Hours > 50) {
    loadScore = 80;
  } else {
    loadScore = 100;
  }

  // Weekly load consideration
  if (input.recentLoad.last7Days > 500) {
    loadScore = Math.max(0, loadScore - 20);
  }

  // Body factor (injury impact)
  let bodyScore = 100;
  const injuryCount = input.bodyFlags.length;
  if (injuryCount > 0) {
    bodyScore = Math.max(40, 100 - injuryCount * 20);
  }

  // Overall score (weighted average)
  const overallScore = Math.round(
    sleepScore * 0.3 + recoveryScore * 0.3 + loadScore * 0.25 + bodyScore * 0.15
  );

  // Determine recommendation
  let recommendation: ReadinessRecommendation;
  if (overallScore >= 75) {
    recommendation = 'full';
  } else if (overallScore >= 55) {
    recommendation = 'moderate';
  } else if (overallScore >= 35) {
    recommendation = 'light';
  } else {
    recommendation = 'rest';
  }

  // Generate reasoning
  const reasons: string[] = [];
  if (sleepScore < 60) {
    reasons.push('sleep was below optimal');
  }
  if (recoveryScore < 60) {
    reasons.push('HRV suggests incomplete recovery');
  }
  if (loadScore < 60) {
    reasons.push('recent training load is high');
  }
  if (bodyScore < 80) {
    reasons.push(`${injuryCount} active injury concern${injuryCount > 1 ? 's' : ''}`);
  }

  let reasoning: string;
  if (reasons.length === 0) {
    reasoning = "You're well-recovered and ready for a full session.";
  } else {
    reasoning = `Consider ${recommendation === 'rest' ? 'resting' : `a ${recommendation} session`} because ${reasons.join(', ')}.`;
  }

  // Suggested modifications based on factors
  const suggestedModifications: string[] = [];
  if (loadScore < 60) {
    suggestedModifications.push('Reduce volume by 20-30%');
  }
  if (sleepScore < 50) {
    suggestedModifications.push('Skip high-skill movements');
  }
  if (bodyScore < 80) {
    suggestedModifications.push('Avoid exercises affecting injured areas');
  }

  return {
    score: overallScore,
    factors: {
      sleep: Math.round(sleepScore),
      recovery: Math.round(recoveryScore),
      load: Math.round(loadScore),
      body: Math.round(bodyScore),
    },
    recommendation,
    reasoning,
    suggestedModifications: suggestedModifications.length > 0 ? suggestedModifications : undefined,
    calculatedAt: new Date(),
  };
}

// ============================================================================
// Store
// ============================================================================

export const useReadinessStore = create<ReadinessStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // ========================================
      // Health Data
      // ========================================

      updateHealthSnapshot: (snapshot) => {
        set((state) => {
          state.latestHealthSnapshot = snapshot;
        });
      },

      addHealthHistory: (snapshot) => {
        set((state) => {
          state.healthHistory.unshift(snapshot);
          // Keep last 30 days
          if (state.healthHistory.length > 30) {
            state.healthHistory = state.healthHistory.slice(0, 30);
          }
        });
        get().updateBaselines();
      },

      // ========================================
      // Readiness Calculation
      // ========================================

      calculateReadiness: (activeInjuryCount) => {
        const state = get();
        const snapshot = state.latestHealthSnapshot;
        const baselines = state.baselines;

        if (!snapshot) {
          // No health data - provide default readiness
          set((s) => {
            s.currentReadiness = {
              score: 70,
              factors: { sleep: 70, recovery: 70, load: 80, body: activeInjuryCount > 0 ? 60 : 100 },
              recommendation: activeInjuryCount > 0 ? 'moderate' : 'full',
              reasoning: 'No health data available. Defaulting to moderate readiness.',
              calculatedAt: new Date(),
            };
            s.lastCalculatedAt = new Date();
          });
          return;
        }

        // Build readiness input
        const input: ReadinessInput = {
          sleep: {
            duration: snapshot.sleepDuration || 7,
            quality: snapshot.sleepQuality || 70,
            deepSleepRatio: snapshot.deepSleepMinutes
              ? snapshot.deepSleepMinutes / ((snapshot.sleepDuration || 7) * 60)
              : 0.2,
          },
          hrv: {
            current: snapshot.hrv || 50,
            baseline: baselines.hrv || 50,
            trend: state.healthHistory.length >= 3
              ? getTrend(state.healthHistory.slice(0, 3).map((h) => h.hrv || 50))
              : 'stable',
          },
          restingHR: {
            current: snapshot.restingHR || 60,
            baseline: baselines.restingHR || 60,
          },
          recentLoad: {
            last48Hours: 50, // Would be calculated from workout history
            last7Days: 200,
          },
          bodyFlags: Array(activeInjuryCount).fill('injury'),
        };

        const readiness = calculateReadinessScore(input);

        set((s) => {
          s.currentReadiness = readiness;
          s.lastCalculatedAt = new Date();
        });
      },

      setReadiness: (readiness) => {
        set((state) => {
          state.currentReadiness = readiness;
          state.lastCalculatedAt = new Date();
        });
      },

      // ========================================
      // Baselines
      // ========================================

      updateBaselines: () => {
        set((state) => {
          const history = state.healthHistory.slice(0, 7);
          if (history.length === 0) return;

          const hrvValues = history.map((h) => h.hrv).filter(Boolean) as number[];
          const hrValues = history.map((h) => h.restingHR).filter(Boolean) as number[];
          const sleepDurations = history.map((h) => h.sleepDuration).filter(Boolean) as number[];
          const sleepQualities = history.map((h) => h.sleepQuality).filter(Boolean) as number[];

          state.baselines = {
            hrv: hrvValues.length > 0 ? average(hrvValues) : null,
            restingHR: hrValues.length > 0 ? average(hrValues) : null,
            sleepDuration: sleepDurations.length > 0 ? average(sleepDurations) : null,
            sleepQuality: sleepQualities.length > 0 ? average(sleepQualities) : null,
          };
        });
      },

      // ========================================
      // Queries
      // ========================================

      getReadinessColor: () => {
        const readiness = get().currentReadiness;
        if (!readiness) return READINESS_COLORS.moderate;
        return READINESS_COLORS[readiness.recommendation];
      },

      getReadinessIcon: () => {
        const readiness = get().currentReadiness;
        if (!readiness) return READINESS_ICONS.moderate;
        return READINESS_ICONS[readiness.recommendation];
      },

      shouldSuggestRest: () => {
        const readiness = get().currentReadiness;
        return readiness?.recommendation === 'rest';
      },

      // ========================================
      // Utility
      // ========================================

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      reset: () => {
        set(initialState);
      },
    })),
    {
      name: 'readiness-storage',
    }
  )
);

// ============================================================================
// Helpers
// ============================================================================

function average(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function getTrend(values: number[]): 'up' | 'down' | 'stable' {
  if (values.length < 2) return 'stable';
  const recent = values[0];
  const older = values[values.length - 1];
  const diff = recent - older;
  const threshold = older * 0.05; // 5% change threshold

  if (diff > threshold) return 'up';
  if (diff < -threshold) return 'down';
  return 'stable';
}

// ============================================================================
// Selectors
// ============================================================================

export const selectReadiness = (state: ReadinessStore) => state.currentReadiness;

export const selectReadinessScore = (state: ReadinessStore) =>
  state.currentReadiness?.score ?? null;

export const selectReadinessRecommendation = (state: ReadinessStore) =>
  state.currentReadiness?.recommendation ?? null;
