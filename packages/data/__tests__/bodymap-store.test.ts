/**
 * Body Map Store Tests
 *
 * Tests for body region status state management
 * Uses direct Zustand store access to avoid React concurrent rendering issues
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  useBodyMapStore,
  getViewStatus,
  isActiveIssue,
  selectActiveIssueCount,
  selectHasSevereIssues,
  selectMostSevereIssue,
  BODY_REGIONS,
  REGION_DISPLAY_NAMES,
} from '../src/stores/bodyMap';
import type { BodyRegion, SensationType, PainLevel } from '../src/stores/bodyMap';

describe('useBodyMapStore', () => {
  beforeEach(() => {
    // Reset store using direct getState access
    const state = useBodyMapStore.getState();
    state.clearAllRegions();
    state.clearHistory();
  });

  describe('Initial State', () => {
    it('should have empty regions initially', () => {
      const state = useBodyMapStore.getState();
      expect(state.regions.size).toBe(0);
    });

    it('should have empty history initially', () => {
      const state = useBodyMapStore.getState();
      expect(state.history).toHaveLength(0);
    });
  });

  describe('updateRegion', () => {
    it('should add a new region status', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('lower_back', 'sharp', 5);

      const updatedState = useBodyMapStore.getState();
      expect(updatedState.regions.size).toBe(1);
      const status = updatedState.getRegionStatus('lower_back');
      expect(status?.sensation).toBe('sharp');
      expect(status?.level).toBe(5);
    });

    it('should update existing region status', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('lower_back', 'dull', 3);
      state.updateRegion('lower_back', 'sharp', 7);

      const updatedState = useBodyMapStore.getState();
      const status = updatedState.getRegionStatus('lower_back');
      expect(status?.sensation).toBe('sharp');
      expect(status?.level).toBe(7);
    });

    it('should remove region when level is 0 and sensation is none', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('lower_back', 'sharp', 5);
      expect(useBodyMapStore.getState().regions.size).toBe(1);

      state.updateRegion('lower_back', 'none', 0);
      expect(useBodyMapStore.getState().regions.size).toBe(0);
    });

    it('should add to history', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('knee_left', 'aching', 4);

      const updatedState = useBodyMapStore.getState();
      expect(updatedState.history).toHaveLength(1);
      expect(updatedState.history[0].region).toBe('knee_left');
    });

    it('should include notes when provided', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('shoulder_right', 'stiffness', 3, {
        notes: 'Morning stiffness',
      });

      const updatedState = useBodyMapStore.getState();
      const status = updatedState.getRegionStatus('shoulder_right');
      expect(status?.notes).toBe('Morning stiffness');
    });

    it('should include source when provided', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('hip_left', 'tightness', 2, {
        source: 'check_in',
      });

      const updatedState = useBodyMapStore.getState();
      const status = updatedState.getRegionStatus('hip_left');
      expect(status?.source).toBe('check_in');
    });

    it('should default source to manual', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('hip_left', 'tightness', 2);

      const updatedState = useBodyMapStore.getState();
      const status = updatedState.getRegionStatus('hip_left');
      expect(status?.source).toBe('manual');
    });
  });

  describe('clearRegion', () => {
    it('should remove specific region', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('lower_back', 'sharp', 5);
      state.updateRegion('knee_left', 'dull', 3);

      state.clearRegion('lower_back');

      const updatedState = useBodyMapStore.getState();
      expect(updatedState.regions.size).toBe(1);
      expect(updatedState.getRegionStatus('lower_back')).toBeUndefined();
      expect(updatedState.getRegionStatus('knee_left')).toBeDefined();
    });
  });

  describe('clearAllRegions', () => {
    it('should remove all regions', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('lower_back', 'sharp', 5);
      state.updateRegion('knee_left', 'dull', 3);
      state.updateRegion('shoulder_right', 'aching', 4);

      state.clearAllRegions();

      const updatedState = useBodyMapStore.getState();
      expect(updatedState.regions.size).toBe(0);
    });
  });

  describe('updateMultipleRegions', () => {
    it('should update multiple regions at once', () => {
      const state = useBodyMapStore.getState();
      state.updateMultipleRegions([
        { region: 'lower_back', sensation: 'sharp', level: 5 },
        { region: 'knee_left', sensation: 'dull', level: 3 },
        { region: 'shoulder_right', sensation: 'aching', level: 4 },
      ]);

      const updatedState = useBodyMapStore.getState();
      expect(updatedState.regions.size).toBe(3);
      expect(updatedState.getRegionStatus('lower_back')?.level).toBe(5);
      expect(updatedState.getRegionStatus('knee_left')?.level).toBe(3);
      expect(updatedState.getRegionStatus('shoulder_right')?.level).toBe(4);
    });

    it('should add all updates to history', () => {
      const state = useBodyMapStore.getState();
      state.updateMultipleRegions([
        { region: 'lower_back', sensation: 'sharp', level: 5 },
        { region: 'knee_left', sensation: 'dull', level: 3 },
      ]);

      const updatedState = useBodyMapStore.getState();
      expect(updatedState.history).toHaveLength(2);
    });

    it('should set source as check_in', () => {
      const state = useBodyMapStore.getState();
      state.updateMultipleRegions([
        { region: 'lower_back', sensation: 'sharp', level: 5 },
      ]);

      const updatedState = useBodyMapStore.getState();
      const status = updatedState.getRegionStatus('lower_back');
      expect(status?.source).toBe('check_in');
    });

    it('should remove regions with level 0 and sensation none', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('lower_back', 'sharp', 5);

      state.updateMultipleRegions([
        { region: 'lower_back', sensation: 'none', level: 0 },
      ]);

      const updatedState = useBodyMapStore.getState();
      expect(updatedState.regions.size).toBe(0);
    });
  });

  describe('getActiveIssues', () => {
    it('should return issues with level >= 3 and sensation not none', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('lower_back', 'sharp', 5);
      state.updateRegion('knee_left', 'dull', 2); // Below threshold
      state.updateRegion('shoulder_right', 'aching', 4);

      const issues = useBodyMapStore.getState().getActiveIssues();
      expect(issues).toHaveLength(2);
    });

    it('should sort issues by severity (highest first)', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('knee_left', 'dull', 3);
      state.updateRegion('lower_back', 'sharp', 8);
      state.updateRegion('shoulder_right', 'aching', 5);

      const issues = useBodyMapStore.getState().getActiveIssues();
      expect(issues[0].level).toBe(8);
      expect(issues[1].level).toBe(5);
      expect(issues[2].level).toBe(3);
    });

    it('should not include issues with sensation none', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('lower_back', 'none', 5);

      const issues = useBodyMapStore.getState().getActiveIssues();
      expect(issues).toHaveLength(0);
    });
  });

  describe('getRegionsWithPain', () => {
    it('should return all regions with level > 0', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('lower_back', 'sharp', 5);
      state.updateRegion('knee_left', 'dull', 1);

      const regions = useBodyMapStore.getState().getRegionsWithPain();
      expect(regions).toHaveLength(2);
      expect(regions).toContain('lower_back');
      expect(regions).toContain('knee_left');
    });

    it('should return empty array when no regions have pain', () => {
      const regions = useBodyMapStore.getState().getRegionsWithPain();
      expect(regions).toHaveLength(0);
    });
  });

  describe('getViewStatusMap', () => {
    it('should return status for all body regions', () => {
      const statusMap = useBodyMapStore.getState().getViewStatusMap();
      expect(statusMap.size).toBe(BODY_REGIONS.length);
    });

    it('should return correct view status for pain levels', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('lower_back', 'sharp', 8);
      state.updateRegion('knee_left', 'dull', 5);
      state.updateRegion('shoulder_right', 'aching', 2);

      const statusMap = useBodyMapStore.getState().getViewStatusMap();
      expect(statusMap.get('lower_back')).toBe('severe');
      expect(statusMap.get('knee_left')).toBe('moderate');
      expect(statusMap.get('shoulder_right')).toBe('mild');
      expect(statusMap.get('neck')).toBe('normal');
    });

    it('should default all regions to normal', () => {
      const statusMap = useBodyMapStore.getState().getViewStatusMap();

      statusMap.forEach((status) => {
        expect(status).toBe('normal');
      });
    });
  });

  describe('getRegionHistory', () => {
    it('should return history for specific region', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('lower_back', 'sharp', 5);
      state.updateRegion('knee_left', 'dull', 3);
      state.updateRegion('lower_back', 'dull', 4);

      const history = useBodyMapStore.getState().getRegionHistory('lower_back');
      expect(history).toHaveLength(2);
    });

    it('should filter by days', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('lower_back', 'sharp', 5);

      // Recent history should include it
      const recentHistory = useBodyMapStore.getState().getRegionHistory('lower_back', 1);
      expect(recentHistory).toHaveLength(1);
    });

    it('should return empty array for region with no history', () => {
      const history = useBodyMapStore.getState().getRegionHistory('neck');
      expect(history).toHaveLength(0);
    });
  });

  describe('clearHistory', () => {
    it('should clear all history', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('lower_back', 'sharp', 5);
      state.updateRegion('knee_left', 'dull', 3);

      expect(useBodyMapStore.getState().history.length).toBeGreaterThan(0);

      state.clearHistory();

      expect(useBodyMapStore.getState().history).toHaveLength(0);
    });
  });
});

describe('Helper Functions', () => {
  describe('getViewStatus', () => {
    it('should return normal for level 0', () => {
      expect(getViewStatus(0)).toBe('normal');
    });

    it('should return mild for levels 1-3', () => {
      expect(getViewStatus(1)).toBe('mild');
      expect(getViewStatus(2)).toBe('mild');
      expect(getViewStatus(3)).toBe('mild');
    });

    it('should return moderate for levels 4-6', () => {
      expect(getViewStatus(4)).toBe('moderate');
      expect(getViewStatus(5)).toBe('moderate');
      expect(getViewStatus(6)).toBe('moderate');
    });

    it('should return severe for levels 7-10', () => {
      expect(getViewStatus(7)).toBe('severe');
      expect(getViewStatus(8)).toBe('severe');
      expect(getViewStatus(9)).toBe('severe');
      expect(getViewStatus(10)).toBe('severe');
    });
  });

  describe('isActiveIssue', () => {
    it('should return true for level >= 3 with non-none sensation', () => {
      expect(
        isActiveIssue({
          region: 'lower_back',
          sensation: 'sharp',
          level: 3,
          timestamp: new Date(),
        })
      ).toBe(true);
    });

    it('should return true for higher levels', () => {
      expect(
        isActiveIssue({
          region: 'lower_back',
          sensation: 'dull',
          level: 7,
          timestamp: new Date(),
        })
      ).toBe(true);
    });

    it('should return false for level < 3', () => {
      expect(
        isActiveIssue({
          region: 'lower_back',
          sensation: 'sharp',
          level: 2,
          timestamp: new Date(),
        })
      ).toBe(false);
    });

    it('should return false for sensation none', () => {
      expect(
        isActiveIssue({
          region: 'lower_back',
          sensation: 'none',
          level: 5,
          timestamp: new Date(),
        })
      ).toBe(false);
    });
  });
});

describe('Selectors', () => {
  beforeEach(() => {
    const state = useBodyMapStore.getState();
    state.clearAllRegions();
    state.clearHistory();
  });

  describe('selectActiveIssueCount', () => {
    it('should return count of active issues', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('lower_back', 'sharp', 5);
      state.updateRegion('knee_left', 'dull', 4);
      state.updateRegion('shoulder_right', 'aching', 2);

      const count = selectActiveIssueCount(useBodyMapStore.getState());
      expect(count).toBe(2);
    });

    it('should return 0 when no active issues', () => {
      const count = selectActiveIssueCount(useBodyMapStore.getState());
      expect(count).toBe(0);
    });
  });

  describe('selectHasSevereIssues', () => {
    it('should return true if any issue has level >= 7', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('lower_back', 'sharp', 8);

      expect(selectHasSevereIssues(useBodyMapStore.getState())).toBe(true);
    });

    it('should return true for level exactly 7', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('lower_back', 'sharp', 7);

      expect(selectHasSevereIssues(useBodyMapStore.getState())).toBe(true);
    });

    it('should return false if no severe issues', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('lower_back', 'sharp', 5);

      expect(selectHasSevereIssues(useBodyMapStore.getState())).toBe(false);
    });

    it('should return false when no issues', () => {
      expect(selectHasSevereIssues(useBodyMapStore.getState())).toBe(false);
    });
  });

  describe('selectMostSevereIssue', () => {
    it('should return the issue with highest level', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('lower_back', 'sharp', 5);
      state.updateRegion('knee_left', 'dull', 8);
      state.updateRegion('shoulder_right', 'aching', 4);

      const mostSevere = selectMostSevereIssue(useBodyMapStore.getState());
      expect(mostSevere?.region).toBe('knee_left');
      expect(mostSevere?.level).toBe(8);
    });

    it('should return null if no issues', () => {
      const mostSevere = selectMostSevereIssue(useBodyMapStore.getState());
      expect(mostSevere).toBeNull();
    });

    it('should only consider active issues (level >= 3)', () => {
      const state = useBodyMapStore.getState();
      state.updateRegion('lower_back', 'sharp', 2);
      state.updateRegion('knee_left', 'dull', 1);

      const mostSevere = selectMostSevereIssue(useBodyMapStore.getState());
      expect(mostSevere).toBeNull();
    });
  });
});

describe('Constants', () => {
  it('BODY_REGIONS should contain all 35 regions', () => {
    // 35 regions: head, neck, 12 arm parts (2 sides x 6), 5 torso, 16 leg parts (2 sides x 8)
    expect(BODY_REGIONS).toHaveLength(35);
  });

  it('BODY_REGIONS should include key regions', () => {
    expect(BODY_REGIONS).toContain('head');
    expect(BODY_REGIONS).toContain('neck');
    expect(BODY_REGIONS).toContain('lower_back');
    expect(BODY_REGIONS).toContain('knee_left');
    expect(BODY_REGIONS).toContain('knee_right');
    expect(BODY_REGIONS).toContain('shoulder_left');
    expect(BODY_REGIONS).toContain('shoulder_right');
  });

  it('REGION_DISPLAY_NAMES should have names for all regions', () => {
    BODY_REGIONS.forEach((region) => {
      expect(REGION_DISPLAY_NAMES[region]).toBeDefined();
      expect(typeof REGION_DISPLAY_NAMES[region]).toBe('string');
    });
  });

  it('REGION_DISPLAY_NAMES should have human-readable names', () => {
    expect(REGION_DISPLAY_NAMES.lower_back).toBe('Lower Back');
    expect(REGION_DISPLAY_NAMES.knee_left).toBe('Left Knee');
    expect(REGION_DISPLAY_NAMES.shoulder_right).toBe('Right Shoulder');
  });
});

describe('Edge Cases', () => {
  beforeEach(() => {
    const state = useBodyMapStore.getState();
    state.clearAllRegions();
    state.clearHistory();
  });

  it('should handle updating same region multiple times', () => {
    const state = useBodyMapStore.getState();

    for (let i = 1; i <= 10; i++) {
      state.updateRegion('lower_back', 'sharp', i as PainLevel);
    }

    const updatedState = useBodyMapStore.getState();
    expect(updatedState.regions.size).toBe(1);
    expect(updatedState.getRegionStatus('lower_back')?.level).toBe(10);
    expect(updatedState.history).toHaveLength(10);
  });

  it('should handle all sensation types', () => {
    const sensations: SensationType[] = [
      'sharp',
      'dull',
      'aching',
      'burning',
      'tingling',
      'numbness',
      'stiffness',
      'tightness',
      'throbbing',
    ];

    const state = useBodyMapStore.getState();

    sensations.forEach((sensation, index) => {
      const region = BODY_REGIONS[index] as BodyRegion;
      state.updateRegion(region, sensation, 5);
    });

    const updatedState = useBodyMapStore.getState();
    expect(updatedState.regions.size).toBe(sensations.length);
  });

  it('should handle all pain levels', () => {
    const state = useBodyMapStore.getState();
    const painLevels: PainLevel[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    painLevels.forEach((level, index) => {
      if (index < BODY_REGIONS.length) {
        const region = BODY_REGIONS[index] as BodyRegion;
        if (level === 0) {
          state.updateRegion(region, 'none', level);
        } else {
          state.updateRegion(region, 'sharp', level);
        }
      }
    });

    // Level 0 with sensation 'none' should not be stored
    const updatedState = useBodyMapStore.getState();
    expect(updatedState.regions.size).toBe(10); // 11 levels - 1 (level 0) = 10
  });
});
