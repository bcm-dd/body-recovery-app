/**
 * Haptic Feedback Hook (Web) - Movement & Recovery Companion
 *
 * Web stub - haptics not supported on web browsers.
 * Returns no-op functions to maintain API compatibility.
 */

import { useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export type HapticPattern =
  | 'tap'
  | 'confirm'
  | 'repCounted'
  | 'setComplete'
  | 'exerciseComplete'
  | 'workoutComplete'
  | 'timerWarning'
  | 'timerComplete'
  | 'nudge'
  | 'alert'
  | 'error'
  | 'dialTick'
  | 'selection';

// ============================================================================
// Hook
// ============================================================================

interface UseHapticsOptions {
  enabled?: boolean;
}

export function useHaptics(_options: UseHapticsOptions = {}) {
  // No-op on web - haptics not supported
  const trigger = useCallback((_pattern: HapticPattern) => {
    // Haptics not available on web
  }, []);

  const triggerSequence = useCallback(
    (_patterns: HapticPattern[], _delays: number[]) => {
      // Haptics not available on web
    },
    []
  );

  return {
    trigger,
    triggerSequence,
    patterns: {},
  };
}

// ============================================================================
// Standalone trigger function
// ============================================================================

export function triggerHaptic(_pattern: HapticPattern) {
  // No-op on web
}
