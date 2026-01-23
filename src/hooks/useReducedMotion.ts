/**
 * Reduced Motion Hook (Native) - Movement & Recovery Companion
 *
 * Detects user's motion preference for accessibility.
 * Returns true if user prefers reduced motion.
 *
 * Supports WCAG 2.1 Level AAA compliance for motion accessibility.
 */

import { useState, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

// ============================================================================
// Types
// ============================================================================

export interface UseReducedMotionResult {
  /** Whether the user prefers reduced motion */
  prefersReducedMotion: boolean;
  /** Whether the preference has been loaded */
  isLoading: boolean;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to detect user's motion preference
 *
 * Uses AccessibilityInfo.isReduceMotionEnabled() for native platforms.
 *
 * @returns Object containing prefersReducedMotion boolean and loading state
 *
 * @example
 * ```tsx
 * const { prefersReducedMotion } = useReducedMotion();
 *
 * const animationDuration = prefersReducedMotion ? 0 : 300;
 * ```
 */
export function useReducedMotion(): UseReducedMotionResult {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Get initial value
    const checkReducedMotion = async () => {
      try {
        const isEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        if (isMounted) {
          setPrefersReducedMotion(isEnabled);
          setIsLoading(false);
        }
      } catch {
        // Default to false if unable to determine
        if (isMounted) {
          setPrefersReducedMotion(false);
          setIsLoading(false);
        }
      }
    };

    checkReducedMotion();

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (isEnabled: boolean) => {
        if (isMounted) {
          setPrefersReducedMotion(isEnabled);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return { prefersReducedMotion, isLoading };
}

// ============================================================================
// Utility Constants
// ============================================================================

/**
 * Duration tokens for motion-safe animations
 * Use 'instant' values when user prefers reduced motion
 */
export const MOTION_DURATIONS = {
  instant: 0,
  fast: 100,
  normal: 200,
  slow: 300,
  verySlow: 500,
} as const;

/**
 * Get appropriate animation duration based on reduced motion preference
 */
export function getMotionDuration(
  prefersReducedMotion: boolean,
  normalDuration: number = MOTION_DURATIONS.normal
): number {
  return prefersReducedMotion ? MOTION_DURATIONS.instant : normalDuration;
}

/**
 * Get CSS transition string that respects reduced motion preference
 * On native, this returns the normal transition (no CSS support)
 */
export function getTransitionStyle(
  prefersReducedMotion: boolean,
  normalTransition: string
): string {
  return prefersReducedMotion ? 'none' : normalTransition;
}

/**
 * Get opacity-only transition for reduced motion fallback
 * On native, returns appropriate transition string
 */
export function getAccessibleTransition(
  prefersReducedMotion: boolean,
  normalTransition: string
): string {
  if (prefersReducedMotion) {
    return 'opacity 0.1s ease';
  }
  return normalTransition;
}
