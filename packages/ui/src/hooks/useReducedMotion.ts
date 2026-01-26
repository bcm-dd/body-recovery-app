/**
 * useReducedMotion hook
 *
 * Detects if the user prefers reduced motion for accessibility.
 * Works on both React Native (via Reanimated) and web (via media query).
 */

import { useEffect, useState } from 'react';
import { Platform, AccessibilityInfo } from 'react-native';

/**
 * Hook to detect reduced motion preference
 *
 * @returns boolean - true if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Web: Use media query
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        // Set initial value
        setReducedMotion(mediaQuery.matches);

        // Listen for changes
        const handleChange = (event: MediaQueryListEvent) => {
          setReducedMotion(event.matches);
        };

        // Modern browsers
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', handleChange);
          return () => mediaQuery.removeEventListener('change', handleChange);
        }
        // Legacy browsers
        else if (mediaQuery.addListener) {
          mediaQuery.addListener(handleChange);
          return () => mediaQuery.removeListener(handleChange);
        }
      }
    } else {
      // React Native: Use AccessibilityInfo
      const checkReducedMotion = async () => {
        try {
          const isReducedMotionEnabled =
            await AccessibilityInfo.isReduceMotionEnabled();
          setReducedMotion(isReducedMotionEnabled);
        } catch {
          // Default to false if we can't determine
          setReducedMotion(false);
        }
      };

      checkReducedMotion();

      // Listen for changes
      const subscription = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        (isEnabled) => {
          setReducedMotion(isEnabled);
        }
      );

      return () => {
        subscription?.remove();
      };
    }
  }, []);

  return reducedMotion;
}

/**
 * Get animation name based on reduced motion preference
 *
 * @param normalAnimation - Animation name for normal motion
 * @param reducedAnimation - Animation name for reduced motion (optional)
 * @returns Animation name to use
 */
export function useMotionSafeAnimation(
  normalAnimation: string,
  reducedAnimation?: string
): string {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return reducedAnimation || 'quickReduced';
  }

  return normalAnimation;
}

/**
 * Get enter/exit styles based on reduced motion preference
 *
 * @param normalStyles - Styles for normal motion
 * @returns Styles to use (empty object for reduced motion)
 */
export function useMotionSafeStyles<T extends Record<string, unknown>>(
  normalStyles: T
): T | Record<string, never> {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return {};
  }

  return normalStyles;
}
