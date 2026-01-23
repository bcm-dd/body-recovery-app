/**
 * Responsive Hook - Movement & Recovery Companion
 *
 * Detects screen width and returns breakpoint information.
 * Uses React Native Dimensions API with event listener for resize.
 */

import { useState, useEffect, useCallback } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import { breakpoints } from '@/theme/tokens';

// ============================================================================
// Types
// ============================================================================

export interface ResponsiveInfo {
  /** Current screen width in pixels */
  width: number;
  /** Current screen height in pixels */
  height: number;
  /** True if screen width is less than tablet breakpoint (768px) */
  isMobile: boolean;
  /** True if screen width is between tablet (768px) and desktop (1024px) breakpoints */
  isTablet: boolean;
  /** True if screen width is greater than or equal to desktop breakpoint (1024px) */
  isDesktop: boolean;
  /** Current breakpoint name */
  breakpoint: 'phone' | 'tablet' | 'desktop';
}

export interface UseResponsiveOptions {
  /** Use window dimensions instead of screen dimensions (default: true) */
  useWindow?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Determines the current breakpoint based on screen width
 */
function getBreakpoint(width: number): 'phone' | 'tablet' | 'desktop' {
  if (width >= breakpoints.desktop) {
    return 'desktop';
  }
  if (width >= breakpoints.tablet) {
    return 'tablet';
  }
  return 'phone';
}

/**
 * Builds responsive info object from dimensions
 */
function buildResponsiveInfo(dimensions: ScaledSize): ResponsiveInfo {
  const { width, height } = dimensions;
  const breakpoint = getBreakpoint(width);

  return {
    width,
    height,
    isMobile: breakpoint === 'phone',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    breakpoint,
  };
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for responsive design based on screen dimensions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isMobile, isTablet, isDesktop } = useResponsive();
 *
 *   return (
 *     <View style={{ padding: isMobile ? 16 : 32 }}>
 *       {isDesktop && <Sidebar />}
 *       <Content />
 *     </View>
 *   );
 * }
 * ```
 */
export function useResponsive(options: UseResponsiveOptions = {}): ResponsiveInfo {
  const { useWindow = true } = options;

  const getDimensions = useCallback((): ScaledSize => {
    return useWindow ? Dimensions.get('window') : Dimensions.get('screen');
  }, [useWindow]);

  const [responsive, setResponsive] = useState<ResponsiveInfo>(() =>
    buildResponsiveInfo(getDimensions())
  );

  useEffect(() => {
    const handleChange = ({ window, screen }: { window: ScaledSize; screen: ScaledSize }) => {
      const dimensions = useWindow ? window : screen;
      setResponsive(buildResponsiveInfo(dimensions));
    };

    // Subscribe to dimension changes
    const subscription = Dimensions.addEventListener('change', handleChange);

    // Update on mount in case dimensions changed
    setResponsive(buildResponsiveInfo(getDimensions()));

    return () => {
      subscription.remove();
    };
  }, [useWindow, getDimensions]);

  return responsive;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get current responsive info without using the hook
 * Useful for one-time checks outside of components
 */
export function getResponsiveInfo(useWindow = true): ResponsiveInfo {
  const dimensions = useWindow ? Dimensions.get('window') : Dimensions.get('screen');
  return buildResponsiveInfo(dimensions);
}

/**
 * Check if the current screen width matches a minimum breakpoint
 */
export function matchesBreakpoint(
  minBreakpoint: 'phone' | 'tablet' | 'desktop',
  useWindow = true
): boolean {
  const dimensions = useWindow ? Dimensions.get('window') : Dimensions.get('screen');
  const minWidth = breakpoints[minBreakpoint];
  return dimensions.width >= minWidth;
}
