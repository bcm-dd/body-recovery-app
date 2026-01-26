/**
 * Haptic Feedback System
 * Uses navigator.vibrate() API for mobile web haptics
 */

// ============================================
// HAPTIC SUPPORT DETECTION
// ============================================

let isEnabled = true;

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/**
 * Enable/disable haptic feedback
 */
export function setHapticsEnabled(enabled: boolean): void {
  isEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('haptics-enabled', String(enabled));
  }
}

/**
 * Check if haptics are enabled
 */
export function isHapticsEnabled(): boolean {
  if (typeof window === 'undefined') return isEnabled;

  const stored = localStorage.getItem('haptics-enabled');
  if (stored !== null) {
    isEnabled = stored === 'true';
  }
  return isEnabled;
}

// ============================================
// CORE VIBRATION FUNCTION
// ============================================

/**
 * Trigger a vibration pattern
 * @param pattern - Duration in ms or array of [vibrate, pause, vibrate, ...] in ms
 */
function vibrate(pattern: number | number[]): boolean {
  if (!isEnabled || !isHapticSupported()) {
    return false;
  }

  try {
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}

/**
 * Stop any ongoing vibration
 */
export function stopVibration(): void {
  if (isHapticSupported()) {
    navigator.vibrate(0);
  }
}

// ============================================
// HAPTIC PATTERNS
// ============================================

export type HapticIntensity = 'light' | 'medium' | 'heavy';

export interface HapticPattern {
  name: string;
  pattern: number | number[];
  description: string;
}

/**
 * Predefined haptic patterns
 */
export const hapticPatterns: Record<string, HapticPattern> = {
  // Basic feedback
  tap: {
    name: 'Tap',
    pattern: 10,
    description: 'Quick tap feedback',
  },
  click: {
    name: 'Click',
    pattern: 15,
    description: 'Standard click feedback',
  },

  // Selection
  selection: {
    name: 'Selection',
    pattern: 8,
    description: 'Light selection feedback',
  },
  selectionChange: {
    name: 'Selection Change',
    pattern: [5, 30, 5],
    description: 'Double tap for selection change',
  },

  // Success patterns
  success: {
    name: 'Success',
    pattern: [20, 50, 20],
    description: 'Positive confirmation',
  },
  successLong: {
    name: 'Success Long',
    pattern: [20, 40, 20, 40, 40],
    description: 'Extended success pattern',
  },

  // Warning/Error patterns
  warning: {
    name: 'Warning',
    pattern: [30, 30, 30],
    description: 'Attention needed',
  },
  error: {
    name: 'Error',
    pattern: [50, 30, 50, 30, 50],
    description: 'Error or failure',
  },

  // UI interactions
  toggle: {
    name: 'Toggle',
    pattern: 12,
    description: 'Toggle switch feedback',
  },
  slider: {
    name: 'Slider',
    pattern: 5,
    description: 'Slider tick feedback',
  },

  // Navigation
  navigation: {
    name: 'Navigation',
    pattern: [10, 20, 15],
    description: 'Page navigation',
  },
  swipe: {
    name: 'Swipe',
    pattern: [8, 15, 8],
    description: 'Swipe gesture',
  },

  // Pull to refresh
  pullStart: {
    name: 'Pull Start',
    pattern: 10,
    description: 'Started pulling',
  },
  pullThreshold: {
    name: 'Pull Threshold',
    pattern: [15, 30, 15],
    description: 'Reached refresh threshold',
  },
  pullRelease: {
    name: 'Pull Release',
    pattern: [20, 50, 30],
    description: 'Released to refresh',
  },

  // Completion
  taskComplete: {
    name: 'Task Complete',
    pattern: [20, 40, 30, 40, 50],
    description: 'Task/item completed',
  },
  sessionComplete: {
    name: 'Session Complete',
    pattern: [30, 50, 30, 50, 30, 80, 50],
    description: 'Workout session completed',
  },

  // Long press
  longPressStart: {
    name: 'Long Press Start',
    pattern: 25,
    description: 'Long press initiated',
  },
  longPressComplete: {
    name: 'Long Press Complete',
    pattern: [15, 30, 30],
    description: 'Long press action triggered',
  },

  // Delete/destructive
  deleteConfirm: {
    name: 'Delete Confirm',
    pattern: [30, 50, 40],
    description: 'Destructive action confirmed',
  },

  // Heartbeat
  heartbeat: {
    name: 'Heartbeat',
    pattern: [20, 100, 20, 300],
    description: 'Heartbeat rhythm',
  },

  // Notification
  notification: {
    name: 'Notification',
    pattern: [15, 50, 15, 50, 30],
    description: 'New notification',
  },

  // ============================================
  // AMBIENT AI PATTERNS
  // ============================================

  // Gentle wave - ambient encouragement
  ambientWave: {
    name: 'Ambient Wave',
    pattern: [8, 80, 12, 80, 8],
    description: 'Gentle ambient wave for encouragement',
  },

  // Soft pulse - rest complete signal
  ambientPulse: {
    name: 'Ambient Pulse',
    pattern: [12, 100, 12],
    description: 'Soft pulse for ambient notifications',
  },

  // Breathing rhythm - calming feedback
  ambientBreath: {
    name: 'Ambient Breath',
    pattern: [10, 150, 15, 150, 10],
    description: 'Breathing rhythm for calming effect',
  },

  // Micro warmth - subtle positive feedback
  ambientWarmth: {
    name: 'Ambient Warmth',
    pattern: [6, 50, 6],
    description: 'Very subtle warmth feedback',
  },

  // Gentle attention - something needs notice
  ambientAttention: {
    name: 'Ambient Attention',
    pattern: [15, 60, 10, 60, 15],
    description: 'Gentle attention getter',
  },

  // Milestone - achievement reached
  ambientMilestone: {
    name: 'Ambient Milestone',
    pattern: [20, 50, 15, 50, 25, 50, 30],
    description: 'Milestone or achievement celebration',
  },

  // Ready signal - workout ready
  ambientReady: {
    name: 'Ambient Ready',
    pattern: [10, 40, 10, 40, 20],
    description: 'Ready state signal',
  },
};

// ============================================
// HAPTIC FUNCTIONS
// ============================================

/**
 * Quick tap - lightest feedback
 */
export function hapticTap(): boolean {
  return vibrate(hapticPatterns.tap.pattern);
}

/**
 * Standard click
 */
export function hapticClick(): boolean {
  return vibrate(hapticPatterns.click.pattern);
}

/**
 * Selection feedback
 */
export function hapticSelection(): boolean {
  return vibrate(hapticPatterns.selection.pattern);
}

/**
 * Selection change (double tap)
 */
export function hapticSelectionChange(): boolean {
  return vibrate(hapticPatterns.selectionChange.pattern);
}

/**
 * Success feedback
 */
export function hapticSuccess(): boolean {
  return vibrate(hapticPatterns.success.pattern);
}

/**
 * Extended success
 */
export function hapticSuccessLong(): boolean {
  return vibrate(hapticPatterns.successLong.pattern);
}

/**
 * Warning feedback
 */
export function hapticWarning(): boolean {
  return vibrate(hapticPatterns.warning.pattern);
}

/**
 * Error feedback
 */
export function hapticError(): boolean {
  return vibrate(hapticPatterns.error.pattern);
}

/**
 * Toggle switch feedback
 */
export function hapticToggle(): boolean {
  return vibrate(hapticPatterns.toggle.pattern);
}

/**
 * Slider tick feedback
 */
export function hapticSlider(): boolean {
  return vibrate(hapticPatterns.slider.pattern);
}

/**
 * Navigation feedback
 */
export function hapticNavigation(): boolean {
  return vibrate(hapticPatterns.navigation.pattern);
}

/**
 * Swipe gesture feedback
 */
export function hapticSwipe(): boolean {
  return vibrate(hapticPatterns.swipe.pattern);
}

/**
 * Pull to refresh - started pulling
 */
export function hapticPullStart(): boolean {
  return vibrate(hapticPatterns.pullStart.pattern);
}

/**
 * Pull to refresh - reached threshold
 */
export function hapticPullThreshold(): boolean {
  return vibrate(hapticPatterns.pullThreshold.pattern);
}

/**
 * Pull to refresh - released
 */
export function hapticPullRelease(): boolean {
  return vibrate(hapticPatterns.pullRelease.pattern);
}

/**
 * Task completion feedback
 */
export function hapticTaskComplete(): boolean {
  return vibrate(hapticPatterns.taskComplete.pattern);
}

/**
 * Session completion feedback
 */
export function hapticSessionComplete(): boolean {
  return vibrate(hapticPatterns.sessionComplete.pattern);
}

/**
 * Long press start
 */
export function hapticLongPressStart(): boolean {
  return vibrate(hapticPatterns.longPressStart.pattern);
}

/**
 * Long press action triggered
 */
export function hapticLongPressComplete(): boolean {
  return vibrate(hapticPatterns.longPressComplete.pattern);
}

/**
 * Destructive action confirmation
 */
export function hapticDeleteConfirm(): boolean {
  return vibrate(hapticPatterns.deleteConfirm.pattern);
}

/**
 * Notification alert
 */
export function hapticNotification(): boolean {
  return vibrate(hapticPatterns.notification.pattern);
}

// ============================================
// AMBIENT AI HAPTIC FUNCTIONS
// ============================================

/**
 * Ambient wave - gentle encouragement
 */
export function hapticAmbientWave(): boolean {
  return vibrate(hapticPatterns.ambientWave.pattern);
}

/**
 * Ambient pulse - rest complete or soft notification
 */
export function hapticAmbientPulse(): boolean {
  return vibrate(hapticPatterns.ambientPulse.pattern);
}

/**
 * Ambient breath - calming rhythm
 */
export function hapticAmbientBreath(): boolean {
  return vibrate(hapticPatterns.ambientBreath.pattern);
}

/**
 * Ambient warmth - very subtle positive feedback
 */
export function hapticAmbientWarmth(): boolean {
  return vibrate(hapticPatterns.ambientWarmth.pattern);
}

/**
 * Ambient attention - gentle attention getter
 */
export function hapticAmbientAttention(): boolean {
  return vibrate(hapticPatterns.ambientAttention.pattern);
}

/**
 * Ambient milestone - achievement or milestone reached
 */
export function hapticAmbientMilestone(): boolean {
  return vibrate(hapticPatterns.ambientMilestone.pattern);
}

/**
 * Ambient ready - workout ready signal
 */
export function hapticAmbientReady(): boolean {
  return vibrate(hapticPatterns.ambientReady.pattern);
}

/**
 * Impact feedback with intensity levels
 */
export function hapticImpact(intensity: HapticIntensity = 'medium'): boolean {
  const durations: Record<HapticIntensity, number> = {
    light: 8,
    medium: 15,
    heavy: 30,
  };
  return vibrate(durations[intensity]);
}

/**
 * Custom vibration pattern
 */
export function hapticCustom(pattern: number | number[]): boolean {
  return vibrate(pattern);
}

// ============================================
// HAPTIC MANAGER CLASS
// ============================================

export class HapticManager {
  private static instance: HapticManager;

  private constructor() {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('haptics-enabled');
      if (stored !== null) {
        isEnabled = stored === 'true';
      }
    }
  }

  static getInstance(): HapticManager {
    if (!HapticManager.instance) {
      HapticManager.instance = new HapticManager();
    }
    return HapticManager.instance;
  }

  isSupported(): boolean {
    return isHapticSupported();
  }

  enable(): void {
    setHapticsEnabled(true);
  }

  disable(): void {
    setHapticsEnabled(false);
  }

  toggle(): boolean {
    const newState = !isEnabled;
    setHapticsEnabled(newState);
    return newState;
  }

  isEnabled(): boolean {
    return isHapticsEnabled();
  }

  stop(): void {
    stopVibration();
  }

  // Pattern methods
  tap = hapticTap;
  click = hapticClick;
  selection = hapticSelection;
  selectionChange = hapticSelectionChange;
  success = hapticSuccess;
  successLong = hapticSuccessLong;
  warning = hapticWarning;
  error = hapticError;
  toggleFeedback = hapticToggle;
  slider = hapticSlider;
  navigation = hapticNavigation;
  swipe = hapticSwipe;
  pullStart = hapticPullStart;
  pullThreshold = hapticPullThreshold;
  pullRelease = hapticPullRelease;
  taskComplete = hapticTaskComplete;
  sessionComplete = hapticSessionComplete;
  longPressStart = hapticLongPressStart;
  longPressComplete = hapticLongPressComplete;
  deleteConfirm = hapticDeleteConfirm;
  notification = hapticNotification;
  impact = hapticImpact;
  custom = hapticCustom;

  // Ambient AI patterns
  ambientWave = hapticAmbientWave;
  ambientPulse = hapticAmbientPulse;
  ambientBreath = hapticAmbientBreath;
  ambientWarmth = hapticAmbientWarmth;
  ambientAttention = hapticAmbientAttention;
  ambientMilestone = hapticAmbientMilestone;
  ambientReady = hapticAmbientReady;
}

// Export singleton instance
export const haptics = HapticManager.getInstance();
