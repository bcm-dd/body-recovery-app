/**
 * Haptic Feedback Hook - Movement & Recovery Companion
 *
 * Provides haptic feedback patterns for different interactions.
 * Handles both iOS and Android with platform-specific implementations.
 */

import { useCallback } from 'react';
import { Platform, Vibration } from 'react-native';
// import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

// ============================================================================
// Types
// ============================================================================

export type HapticPattern =
  // Confirmations
  | 'tap'
  | 'confirm'
  // Workout
  | 'repCounted'
  | 'setComplete'
  | 'exerciseComplete'
  | 'workoutComplete'
  // Timer
  | 'timerWarning'
  | 'timerComplete'
  // Notifications
  | 'nudge'
  | 'alert'
  // Errors
  | 'error'
  // Input
  | 'dialTick'
  | 'selection';

interface HapticConfig {
  ios: {
    type: 'impact' | 'notification' | 'selection';
    style?: 'light' | 'medium' | 'heavy' | 'soft' | 'rigid';
    notificationType?: 'success' | 'warning' | 'error';
  };
  android: {
    pattern: number[];
    amplitudes?: number[];
  };
}

// ============================================================================
// Haptic Patterns
// ============================================================================

const hapticPatterns: Record<HapticPattern, HapticConfig> = {
  // Confirmations
  tap: {
    ios: { type: 'impact', style: 'light' },
    android: { pattern: [0, 10], amplitudes: [0, 120] },
  },
  confirm: {
    ios: { type: 'notification', notificationType: 'success' },
    android: { pattern: [0, 20, 50, 20], amplitudes: [0, 180, 0, 180] },
  },

  // Workout
  repCounted: {
    ios: { type: 'impact', style: 'soft' },
    android: { pattern: [0, 15], amplitudes: [0, 100] },
  },
  setComplete: {
    ios: { type: 'impact', style: 'medium' },
    android: { pattern: [0, 25, 30, 25], amplitudes: [0, 150, 0, 150] },
  },
  exerciseComplete: {
    ios: { type: 'notification', notificationType: 'success' },
    android: { pattern: [0, 30, 50, 30, 50, 30], amplitudes: [0, 180, 0, 180, 0, 180] },
  },
  workoutComplete: {
    ios: { type: 'notification', notificationType: 'success' },
    android: { pattern: [0, 50, 100, 50, 100, 100], amplitudes: [0, 200, 0, 200, 0, 255] },
  },

  // Timer
  timerWarning: {
    ios: { type: 'impact', style: 'light' },
    android: { pattern: [0, 15], amplitudes: [0, 80] },
  },
  timerComplete: {
    ios: { type: 'impact', style: 'heavy' },
    android: { pattern: [0, 40, 30, 40], amplitudes: [0, 200, 0, 200] },
  },

  // Notifications
  nudge: {
    ios: { type: 'impact', style: 'soft' },
    android: { pattern: [0, 20, 80, 20], amplitudes: [0, 100, 0, 100] },
  },
  alert: {
    ios: { type: 'notification', notificationType: 'warning' },
    android: { pattern: [0, 30, 50, 30, 50, 50], amplitudes: [0, 150, 0, 150, 0, 200] },
  },

  // Errors
  error: {
    ios: { type: 'notification', notificationType: 'error' },
    android: { pattern: [0, 50, 100, 50], amplitudes: [0, 255, 0, 255] },
  },

  // Input
  dialTick: {
    ios: { type: 'selection' },
    android: { pattern: [0, 5], amplitudes: [0, 60] },
  },
  selection: {
    ios: { type: 'selection' },
    android: { pattern: [0, 10], amplitudes: [0, 80] },
  },
};

// ============================================================================
// Hook
// ============================================================================

interface UseHapticsOptions {
  enabled?: boolean;
}

export function useHaptics(options: UseHapticsOptions = {}) {
  const { enabled = true } = options;

  const trigger = useCallback(
    (pattern: HapticPattern) => {
      if (!enabled) return;

      const config = hapticPatterns[pattern];
      if (!config) return;

      if (Platform.OS === 'ios') {
        // For now, use a simple vibration as a fallback
        // In production, use react-native-haptic-feedback
        // ReactNativeHapticFeedback.trigger(config.ios.type, {
        //   enableVibrateFallback: true,
        //   ignoreAndroidSystemSettings: false,
        // });

        // Fallback: simple vibration
        Vibration.vibrate(10);
      } else if (Platform.OS === 'android') {
        // Use vibration pattern for Android
        Vibration.vibrate(config.android.pattern);
      }
    },
    [enabled]
  );

  const triggerSequence = useCallback(
    (patterns: HapticPattern[], delays: number[]) => {
      if (!enabled) return;

      patterns.forEach((pattern, index) => {
        const delay = delays.slice(0, index).reduce((sum, d) => sum + d, 0);
        setTimeout(() => trigger(pattern), delay);
      });
    },
    [enabled, trigger]
  );

  return {
    trigger,
    triggerSequence,
    patterns: hapticPatterns,
  };
}

// ============================================================================
// Standalone trigger function for use outside React
// ============================================================================

export function triggerHaptic(pattern: HapticPattern) {
  const config = hapticPatterns[pattern];
  if (!config) return;

  if (Platform.OS === 'ios') {
    Vibration.vibrate(10);
  } else if (Platform.OS === 'android') {
    Vibration.vibrate(config.android.pattern);
  }
}
