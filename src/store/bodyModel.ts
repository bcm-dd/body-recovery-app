/**
 * Body Model Store - Movement & Recovery Companion
 *
 * Manages the persistent, evolving representation of the user's physical self.
 * Includes injuries, surgeries, chronic conditions, and constraints.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  BodyModel,
  Injury,
  Surgery,
  ChronicCondition,
  Constraint,
  BodyRegion,
  Severity,
  InjuryStatus,
  MovementPattern,
  PainLog,
} from '@/types';

// ============================================================================
// Types
// ============================================================================

interface BodyModelState {
  // Data
  injuries: Injury[];
  surgeries: Surgery[];
  chronicConditions: ChronicCondition[];
  manualConstraints: Constraint[];
  painLogs: PainLog[];

  // Derived
  activeConstraints: Constraint[];

  // Status
  isLoading: boolean;
  lastSyncedAt: Date | null;
}

interface BodyModelActions {
  // Injuries
  addInjury: (injury: Omit<Injury, 'id' | 'createdAt' | 'updatedAt' | 'synced'>) => string;
  updateInjury: (id: string, updates: Partial<Injury>) => void;
  resolveInjury: (id: string) => void;
  deleteInjury: (id: string) => void;

  // Surgeries
  addSurgery: (surgery: Omit<Surgery, 'id'>) => string;
  updateSurgery: (id: string, updates: Partial<Surgery>) => void;
  deleteSurgery: (id: string) => void;

  // Chronic Conditions
  addChronicCondition: (condition: Omit<ChronicCondition, 'id'>) => string;
  updateChronicCondition: (id: string, updates: Partial<ChronicCondition>) => void;
  deleteChronicCondition: (id: string) => void;

  // Constraints
  addManualConstraint: (constraint: Omit<Constraint, 'id' | 'source'>) => string;
  removeConstraint: (id: string) => void;
  refreshActiveConstraints: () => void;

  // Pain Logging
  logPain: (pain: Omit<PainLog, 'id' | 'loggedAt' | 'synced'>) => string;
  getPainHistory: (bodyRegion?: BodyRegion, days?: number) => PainLog[];

  // Queries
  getActiveInjuries: () => Injury[];
  getInjuriesByRegion: (region: BodyRegion) => Injury[];
  getConstraintsForMovement: (movement: MovementPattern) => Constraint[];
  isMovementRestricted: (movement: MovementPattern) => boolean;
  getBodyRegionStatus: (region: BodyRegion) => {
    hasActiveInjury: boolean;
    severity: Severity | null;
    constraints: Constraint[];
  };

  // Sync
  setLoading: (loading: boolean) => void;
  markSynced: () => void;
  reset: () => void;
}

type BodyModelStore = BodyModelState & BodyModelActions;

// ============================================================================
// Helpers
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function collectConstraints(state: BodyModelState): Constraint[] {
  const constraints: Constraint[] = [];

  // Collect from active injuries
  state.injuries
    .filter((i) => i.status === 'active' || i.status === 'healing')
    .forEach((injury) => {
      constraints.push(...injury.constraints.filter((c) => c.active));
    });

  // Collect from chronic conditions
  state.chronicConditions.forEach((condition) => {
    constraints.push(...condition.constraints.filter((c) => c.active));
  });

  // Add manual constraints
  constraints.push(...state.manualConstraints.filter((c) => c.active));

  // Filter expired constraints
  const now = new Date();
  return constraints.filter((c) => !c.expiresAt || new Date(c.expiresAt) > now);
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: BodyModelState = {
  injuries: [],
  surgeries: [],
  chronicConditions: [],
  manualConstraints: [],
  painLogs: [],
  activeConstraints: [],
  isLoading: false,
  lastSyncedAt: null,
};

// ============================================================================
// Store
// ============================================================================

export const useBodyModelStore = create<BodyModelStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // ========================================
      // Injuries
      // ========================================

      addInjury: (injuryData) => {
        const id = generateId();
        const now = new Date();

        set((state) => {
          const injury: Injury = {
            ...injuryData,
            id,
            createdAt: now,
            updatedAt: now,
            synced: false,
          };
          state.injuries.push(injury);
          state.activeConstraints = collectConstraints(state);
        });

        return id;
      },

      updateInjury: (id, updates) => {
        set((state) => {
          const index = state.injuries.findIndex((i) => i.id === id);
          if (index !== -1) {
            state.injuries[index] = {
              ...state.injuries[index],
              ...updates,
              updatedAt: new Date(),
              synced: false,
            };
            state.activeConstraints = collectConstraints(state);
          }
        });
      },

      resolveInjury: (id) => {
        set((state) => {
          const index = state.injuries.findIndex((i) => i.id === id);
          if (index !== -1) {
            state.injuries[index].status = 'resolved';
            state.injuries[index].resolvedDate = new Date();
            state.injuries[index].updatedAt = new Date();
            state.injuries[index].synced = false;
            state.activeConstraints = collectConstraints(state);
          }
        });
      },

      deleteInjury: (id) => {
        set((state) => {
          state.injuries = state.injuries.filter((i) => i.id !== id);
          state.activeConstraints = collectConstraints(state);
        });
      },

      // ========================================
      // Surgeries
      // ========================================

      addSurgery: (surgeryData) => {
        const id = generateId();
        set((state) => {
          state.surgeries.push({ ...surgeryData, id });
        });
        return id;
      },

      updateSurgery: (id, updates) => {
        set((state) => {
          const index = state.surgeries.findIndex((s) => s.id === id);
          if (index !== -1) {
            state.surgeries[index] = { ...state.surgeries[index], ...updates };
          }
        });
      },

      deleteSurgery: (id) => {
        set((state) => {
          state.surgeries = state.surgeries.filter((s) => s.id !== id);
        });
      },

      // ========================================
      // Chronic Conditions
      // ========================================

      addChronicCondition: (conditionData) => {
        const id = generateId();
        set((state) => {
          state.chronicConditions.push({ ...conditionData, id });
          state.activeConstraints = collectConstraints(state);
        });
        return id;
      },

      updateChronicCondition: (id, updates) => {
        set((state) => {
          const index = state.chronicConditions.findIndex((c) => c.id === id);
          if (index !== -1) {
            state.chronicConditions[index] = {
              ...state.chronicConditions[index],
              ...updates,
            };
            state.activeConstraints = collectConstraints(state);
          }
        });
      },

      deleteChronicCondition: (id) => {
        set((state) => {
          state.chronicConditions = state.chronicConditions.filter((c) => c.id !== id);
          state.activeConstraints = collectConstraints(state);
        });
      },

      // ========================================
      // Constraints
      // ========================================

      addManualConstraint: (constraintData) => {
        const id = generateId();
        set((state) => {
          const constraint: Constraint = {
            ...constraintData,
            id,
            source: 'manual',
          };
          state.manualConstraints.push(constraint);
          state.activeConstraints = collectConstraints(state);
        });
        return id;
      },

      removeConstraint: (id) => {
        set((state) => {
          state.manualConstraints = state.manualConstraints.filter((c) => c.id !== id);
          state.activeConstraints = collectConstraints(state);
        });
      },

      refreshActiveConstraints: () => {
        set((state) => {
          state.activeConstraints = collectConstraints(state);
        });
      },

      // ========================================
      // Pain Logging
      // ========================================

      logPain: (painData) => {
        const id = generateId();
        set((state) => {
          const pain: PainLog = {
            ...painData,
            id,
            loggedAt: new Date(),
            synced: false,
          };
          state.painLogs.push(pain);
        });
        return id;
      },

      getPainHistory: (bodyRegion, days = 30) => {
        const state = get();
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return state.painLogs.filter((p) => {
          const matchesRegion = !bodyRegion || p.bodyRegion === bodyRegion;
          const withinTimeframe = new Date(p.loggedAt) >= cutoff;
          return matchesRegion && withinTimeframe;
        });
      },

      // ========================================
      // Queries
      // ========================================

      getActiveInjuries: () => {
        return get().injuries.filter(
          (i) => i.status === 'active' || i.status === 'healing'
        );
      },

      getInjuriesByRegion: (region) => {
        return get().injuries.filter((i) => i.bodyRegion === region);
      },

      getConstraintsForMovement: (movement) => {
        return get().activeConstraints.filter((c) =>
          c.affectedMovements.includes(movement)
        );
      },

      isMovementRestricted: (movement) => {
        const constraints = get().getConstraintsForMovement(movement);
        return constraints.some((c) => c.type === 'avoid_completely');
      },

      getBodyRegionStatus: (region) => {
        const state = get();
        const regionInjuries = state.injuries.filter(
          (i) => i.bodyRegion === region && (i.status === 'active' || i.status === 'healing')
        );

        const hasActiveInjury = regionInjuries.length > 0;
        const severity = hasActiveInjury
          ? regionInjuries.reduce((worst: Severity | null, injury) => {
              if (!worst) return injury.severity;
              const severityOrder: Severity[] = ['mild', 'moderate', 'severe'];
              return severityOrder.indexOf(injury.severity) >
                severityOrder.indexOf(worst)
                ? injury.severity
                : worst;
            }, null)
          : null;

        const constraints = state.activeConstraints.filter((c) => {
          // Check if constraint is related to this body region
          // This is a simplified check - in production would be more sophisticated
          return regionInjuries.some((i) =>
            i.constraints.some((ic) => ic.id === c.id)
          );
        });

        return { hasActiveInjury, severity, constraints };
      },

      // ========================================
      // Sync & Utility
      // ========================================

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      markSynced: () => {
        set((state) => {
          state.lastSyncedAt = new Date();
          state.injuries.forEach((i) => (i.synced = true));
          state.painLogs.forEach((p) => (p.synced = true));
        });
      },

      reset: () => {
        set(initialState);
      },
    })),
    {
      name: 'body-model-storage',
      // In production, use MMKV storage
      // storage: createJSONStorage(() => mmkvStorage),
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

export const selectActiveInjuries = (state: BodyModelStore) =>
  state.injuries.filter((i) => i.status === 'active' || i.status === 'healing');

export const selectActiveConstraints = (state: BodyModelStore) =>
  state.activeConstraints;

export const selectHasActiveInjury = (state: BodyModelStore) =>
  state.injuries.some((i) => i.status === 'active' || i.status === 'healing');
