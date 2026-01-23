/**
 * Reduced Motion Hook (Web) - Movement & Recovery Companion
 *
 * Detects user's motion preference for accessibility on web.
 * Uses window.matchMedia('(prefers-reduced-motion: reduce)').
 *
 * Supports WCAG 2.1 Level AAA compliance for motion accessibility.
 */

import { useState, useEffect } from 'react';

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
// Constants
// ============================================================================

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to detect user's motion preference on web
 *
 * Uses window.matchMedia('(prefers-reduced-motion: reduce)') and
 * listens for changes to the preference.
 *
 * Handles SSR by checking typeof window before accessing browser APIs.
 *
 * @returns Object containing prefersReducedMotion boolean and loading state
 *
 * @example
 * ```tsx
 * const { prefersReducedMotion } = useReducedMotion();
 *
 * const transitionStyle = prefersReducedMotion
 *   ? { transition: 'none' }
 *   : { transition: 'transform 0.3s ease' };
 * ```
 */
export function useReducedMotion(): UseReducedMotionResult {
  // SSR-safe initial state - default to false, will update on client
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return false;
    }

    // Get initial value from media query
    try {
      return window.matchMedia(REDUCED_MOTION_QUERY).matches;
    } catch {
      return false;
    }
  });

  const [isLoading, setIsLoading] = useState(() => {
    // Loading only on server, client has immediate access
    return typeof window === 'undefined';
  });

  useEffect(() => {
    // Ensure we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    let isMounted = true;

    try {
      const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);

      // Update state with actual value (handles hydration)
      if (isMounted) {
        setPrefersReducedMotion(mediaQuery.matches);
        setIsLoading(false);
      }

      // Handler for preference changes
      const handleChange = (event: MediaQueryListEvent) => {
        if (isMounted) {
          setPrefersReducedMotion(event.matches);
        }
      };

      // Add event listener using the modern API with fallback
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        // Fallback for older browsers (Safari < 14)
        mediaQuery.addListener(handleChange);
      }

      // Cleanup
      return () => {
        isMounted = false;
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange);
        } else {
          // Fallback for older browsers
          mediaQuery.removeListener(handleChange);
        }
      };
    } catch {
      // Fallback if matchMedia is not supported
      if (isMounted) {
        setPrefersReducedMotion(false);
        setIsLoading(false);
      }
      return undefined;
    }
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

// ============================================================================
// CSS Transition Helpers (Web-specific)
// ============================================================================

/**
 * Get CSS transition string that respects reduced motion preference
 *
 * @example
 * ```tsx
 * const { prefersReducedMotion } = useReducedMotion();
 *
 * <View style={{
 *   // @ts-ignore - web style
 *   transition: getTransitionStyle(prefersReducedMotion, 'transform 0.2s ease'),
 * }} />
 * ```
 */
export function getTransitionStyle(
  prefersReducedMotion: boolean,
  normalTransition: string
): string {
  return prefersReducedMotion ? 'none' : normalTransition;
}

/**
 * Get opacity-only transition for reduced motion fallback
 * When users prefer reduced motion, transforms can still be disorienting
 * but opacity changes are generally acceptable
 *
 * @example
 * ```tsx
 * const { prefersReducedMotion } = useReducedMotion();
 *
 * <View style={{
 *   opacity: isPressed ? 0.8 : 1,
 *   // @ts-ignore - web style
 *   transition: getAccessibleTransition(prefersReducedMotion, 'transform 0.2s ease, opacity 0.2s ease'),
 * }} />
 * ```
 */
export function getAccessibleTransition(
  prefersReducedMotion: boolean,
  normalTransition: string
): string {
  if (prefersReducedMotion) {
    // Only allow opacity transitions for reduced motion
    return 'opacity 0.1s ease';
  }
  return normalTransition;
}
