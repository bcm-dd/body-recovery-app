/**
 * Body Map Store
 *
 * Manages body region status, pain logging, and injury tracking.
 * Uses Zustand for state management with optional persistence.
 */

import { create } from 'zustand';

// ============================================
// TYPES
// ============================================

/**
 * Anatomical body regions (34 regions as defined in domain)
 */
export type BodyRegion =
  // Head & Neck
  | 'head'
  | 'neck'
  // Shoulders & Arms
  | 'shoulder_left'
  | 'shoulder_right'
  | 'upper_arm_left'
  | 'upper_arm_right'
  | 'elbow_left'
  | 'elbow_right'
  | 'forearm_left'
  | 'forearm_right'
  | 'wrist_left'
  | 'wrist_right'
  | 'hand_left'
  | 'hand_right'
  // Torso
  | 'chest'
  | 'upper_back'
  | 'mid_back'
  | 'lower_back'
  | 'abdomen'
  // Hips & Legs
  | 'hip_left'
  | 'hip_right'
  | 'glute_left'
  | 'glute_right'
  | 'thigh_front_left'
  | 'thigh_front_right'
  | 'thigh_back_left'
  | 'thigh_back_right'
  | 'knee_left'
  | 'knee_right'
  | 'calf_left'
  | 'calf_right'
  | 'ankle_left'
  | 'ankle_right'
  | 'foot_left'
  | 'foot_right';

/**
 * Pain/sensation type
 */
export type SensationType =
  | 'sharp'
  | 'dull'
  | 'aching'
  | 'burning'
  | 'tingling'
  | 'numbness'
  | 'stiffness'
  | 'tightness'
  | 'throbbing'
  | 'none';

/**
 * Pain level (1-10 scale)
 */
export type PainLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Status of a body region
 */
export interface BodyRegionStatus {
  region: BodyRegion;
  sensation: SensationType;
  level: PainLevel;
  timestamp: Date;
  notes?: string;
  source?: 'check_in' | 'workout' | 'manual';
}

/**
 * Simplified view status for UI rendering
 */
export type RegionViewStatus = 'normal' | 'mild' | 'moderate' | 'severe';

// ============================================
// CONSTANTS
// ============================================

/**
 * All body regions
 */
export const BODY_REGIONS: BodyRegion[] = [
  'head',
  'neck',
  'shoulder_left',
  'shoulder_right',
  'upper_arm_left',
  'upper_arm_right',
  'elbow_left',
  'elbow_right',
  'forearm_left',
  'forearm_right',
  'wrist_left',
  'wrist_right',
  'hand_left',
  'hand_right',
  'chest',
  'upper_back',
  'mid_back',
  'lower_back',
  'abdomen',
  'hip_left',
  'hip_right',
  'glute_left',
  'glute_right',
  'thigh_front_left',
  'thigh_front_right',
  'thigh_back_left',
  'thigh_back_right',
  'knee_left',
  'knee_right',
  'calf_left',
  'calf_right',
  'ankle_left',
  'ankle_right',
  'foot_left',
  'foot_right',
];

/**
 * Region display names for UI
 */
export const REGION_DISPLAY_NAMES: Record<BodyRegion, string> = {
  head: 'Head',
  neck: 'Neck',
  shoulder_left: 'Left Shoulder',
  shoulder_right: 'Right Shoulder',
  upper_arm_left: 'Left Upper Arm',
  upper_arm_right: 'Right Upper Arm',
  elbow_left: 'Left Elbow',
  elbow_right: 'Right Elbow',
  forearm_left: 'Left Forearm',
  forearm_right: 'Right Forearm',
  wrist_left: 'Left Wrist',
  wrist_right: 'Right Wrist',
  hand_left: 'Left Hand',
  hand_right: 'Right Hand',
  chest: 'Chest',
  upper_back: 'Upper Back',
  mid_back: 'Mid Back',
  lower_back: 'Lower Back',
  abdomen: 'Abdomen',
  hip_left: 'Left Hip',
  hip_right: 'Right Hip',
  glute_left: 'Left Glute',
  glute_right: 'Right Glute',
  thigh_front_left: 'Left Quad',
  thigh_front_right: 'Right Quad',
  thigh_back_left: 'Left Hamstring',
  thigh_back_right: 'Right Hamstring',
  knee_left: 'Left Knee',
  knee_right: 'Right Knee',
  calf_left: 'Left Calf',
  calf_right: 'Right Calf',
  ankle_left: 'Left Ankle',
  ankle_right: 'Right Ankle',
  foot_left: 'Left Foot',
  foot_right: 'Right Foot',
};

// ============================================
// HELPERS
// ============================================

/**
 * Convert pain level to view status for UI
 */
export function getViewStatus(level: PainLevel): RegionViewStatus {
  if (level === 0) return 'normal';
  if (level <= 3) return 'mild';
  if (level <= 6) return 'moderate';
  return 'severe';
}

/**
 * Check if a pain level is considered an "issue" requiring attention
 */
export function isActiveIssue(status: BodyRegionStatus): boolean {
  return status.level >= 3 && status.sensation !== 'none';
}

// ============================================
// STORE STATE
// ============================================

interface BodyMapState {
  // Current region statuses (keyed by region)
  regions: Map<BodyRegion, BodyRegionStatus>;

  // Pain history (last 30 days)
  history: BodyRegionStatus[];

  // Actions
  updateRegion: (
    region: BodyRegion,
    sensation: SensationType,
    level: PainLevel,
    options?: { notes?: string; source?: BodyRegionStatus['source'] }
  ) => void;
  clearRegion: (region: BodyRegion) => void;
  clearAllRegions: () => void;

  // Bulk updates (for check-in flow)
  updateMultipleRegions: (
    updates: Array<{
      region: BodyRegion;
      sensation: SensationType;
      level: PainLevel;
    }>
  ) => void;

  // Queries
  getRegionStatus: (region: BodyRegion) => BodyRegionStatus | undefined;
  getActiveIssues: () => BodyRegionStatus[];
  getRegionsWithPain: () => BodyRegion[];
  getViewStatusMap: () => Map<BodyRegion, RegionViewStatus>;

  // History
  getRegionHistory: (
    region: BodyRegion,
    days?: number
  ) => BodyRegionStatus[];
  clearHistory: () => void;
}

// ============================================
// STORE
// ============================================

export const useBodyMapStore = create<BodyMapState>((set, get) => ({
  regions: new Map(),
  history: [],

  updateRegion: (region, sensation, level, options = {}) => {
    const { regions, history } = get();
    const timestamp = new Date();

    const status: BodyRegionStatus = {
      region,
      sensation,
      level,
      timestamp,
      notes: options.notes,
      source: options.source || 'manual',
    };

    const newRegions = new Map(regions);

    if (level === 0 && sensation === 'none') {
      // Remove region if no pain
      newRegions.delete(region);
    } else {
      newRegions.set(region, status);
    }

    // Add to history
    const newHistory = [status, ...history].slice(0, 500); // Keep last 500 entries

    set({ regions: newRegions, history: newHistory });
  },

  clearRegion: (region) => {
    const { regions } = get();
    const newRegions = new Map(regions);
    newRegions.delete(region);
    set({ regions: newRegions });
  },

  clearAllRegions: () => {
    set({ regions: new Map() });
  },

  updateMultipleRegions: (updates) => {
    const { regions, history } = get();
    const timestamp = new Date();

    const newRegions = new Map(regions);
    const newHistoryEntries: BodyRegionStatus[] = [];

    for (const update of updates) {
      const status: BodyRegionStatus = {
        region: update.region,
        sensation: update.sensation,
        level: update.level,
        timestamp,
        source: 'check_in',
      };

      if (update.level === 0 && update.sensation === 'none') {
        newRegions.delete(update.region);
      } else {
        newRegions.set(update.region, status);
      }

      newHistoryEntries.push(status);
    }

    const newHistory = [...newHistoryEntries, ...history].slice(0, 500);

    set({ regions: newRegions, history: newHistory });
  },

  getRegionStatus: (region) => {
    return get().regions.get(region);
  },

  getActiveIssues: () => {
    const { regions } = get();
    const issues: BodyRegionStatus[] = [];

    regions.forEach((status) => {
      if (isActiveIssue(status)) {
        issues.push(status);
      }
    });

    // Sort by severity (highest first)
    return issues.sort((a, b) => b.level - a.level);
  },

  getRegionsWithPain: () => {
    const { regions } = get();
    const regionsWithPain: BodyRegion[] = [];

    regions.forEach((status, region) => {
      if (status.level > 0) {
        regionsWithPain.push(region);
      }
    });

    return regionsWithPain;
  },

  getViewStatusMap: () => {
    const { regions } = get();
    const statusMap = new Map<BodyRegion, RegionViewStatus>();

    // Initialize all regions as normal
    BODY_REGIONS.forEach((region) => {
      statusMap.set(region, 'normal');
    });

    // Update with actual statuses
    regions.forEach((status, region) => {
      statusMap.set(region, getViewStatus(status.level));
    });

    return statusMap;
  },

  getRegionHistory: (region, days = 30) => {
    const { history } = get();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return history.filter(
      (entry) =>
        entry.region === region && entry.timestamp >= cutoff
    );
  },

  clearHistory: () => {
    set({ history: [] });
  },
}));

// ============================================
// SELECTORS
// ============================================

/**
 * Get count of active issues
 */
export const selectActiveIssueCount = (state: BodyMapState) =>
  state.getActiveIssues().length;

/**
 * Check if any severe issues exist
 */
export const selectHasSevereIssues = (state: BodyMapState) =>
  state.getActiveIssues().some((issue) => issue.level >= 7);

/**
 * Get the most severe issue
 */
export const selectMostSevereIssue = (state: BodyMapState) => {
  const issues = state.getActiveIssues();
  return issues.length > 0 ? issues[0] : null;
};
