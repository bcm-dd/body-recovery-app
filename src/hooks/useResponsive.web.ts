/**
 * Responsive Hook (Web) - Movement & Recovery Companion
 *
 * Web-specific version using window.matchMedia for better performance.
 * Supports SSR by checking typeof window.
 */

import { useState, useEffect, useMemo } from 'react';
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
  /** Use window dimensions instead of screen dimensions (default: true) - ignored on web */
  useWindow?: boolean;
}

// ============================================================================
// SSR-Safe Helpers
// ============================================================================

const isClient = typeof window !== 'undefined';

/**
 * Get default responsive info for SSR (assumes mobile-first)
 */
function getSSRDefaults(): ResponsiveInfo {
  return {
    width: 375, // iPhone default
    height: 812,
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    breakpoint: 'phone',
  };
}

/**
 * Get current dimensions from window
 */
function getWindowDimensions(): { width: number; height: number } {
  if (!isClient) {
    return { width: 375, height: 812 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

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
function buildResponsiveInfo(width: number, height: number): ResponsiveInfo {
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
 * Hook for responsive design based on screen dimensions (Web version)
 *
 * Uses window.matchMedia for efficient breakpoint detection.
 * Falls back to resize event listener for dimension updates.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isMobile, isTablet, isDesktop } = useResponsive();
 *
 *   return (
 *     <div style={{ maxWidth: isDesktop ? 1200 : '100%' }}>
 *       {isDesktop && <Sidebar />}
 *       <Content />
 *     </div>
 *   );
 * }
 * ```
 */
export function useResponsive(_options: UseResponsiveOptions = {}): ResponsiveInfo {
  // Initial state - use SSR defaults if not in browser
  const [responsive, setResponsive] = useState<ResponsiveInfo>(() => {
    if (!isClient) {
      return getSSRDefaults();
    }
    const { width, height } = getWindowDimensions();
    return buildResponsiveInfo(width, height);
  });

  // Create media query lists for breakpoints
  const mediaQueries = useMemo(() => {
    if (!isClient) {
      return null;
    }

    return {
      tablet: window.matchMedia(`(min-width: ${breakpoints.tablet}px)`),
      desktop: window.matchMedia(`(min-width: ${breakpoints.desktop}px)`),
    };
  }, []);

  useEffect(() => {
    if (!isClient || !mediaQueries) {
      return;
    }

    // Handler for media query changes
    const handleMediaChange = () => {
      const { width, height } = getWindowDimensions();
      setResponsive(buildResponsiveInfo(width, height));
    };

    // Handler for resize events (to get exact dimensions)
    const handleResize = () => {
      const { width, height } = getWindowDimensions();
      setResponsive(buildResponsiveInfo(width, height));
    };

    // Use matchMedia for breakpoint changes (more efficient)
    mediaQueries.tablet.addEventListener('change', handleMediaChange);
    mediaQueries.desktop.addEventListener('change', handleMediaChange);

    // Use resize for dimension updates
    window.addEventListener('resize', handleResize);

    // Update on mount to ensure we have current values
    handleResize();

    return () => {
      mediaQueries.tablet.removeEventListener('change', handleMediaChange);
      mediaQueries.desktop.removeEventListener('change', handleMediaChange);
      window.removeEventListener('resize', handleResize);
    };
  }, [mediaQueries]);

  return responsive;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get current responsive info without using the hook
 * Useful for one-time checks outside of components
 */
export function getResponsiveInfo(_useWindow = true): ResponsiveInfo {
  if (!isClient) {
    return getSSRDefaults();
  }
  const { width, height } = getWindowDimensions();
  return buildResponsiveInfo(width, height);
}

/**
 * Check if the current screen width matches a minimum breakpoint
 */
export function matchesBreakpoint(
  minBreakpoint: 'phone' | 'tablet' | 'desktop',
  _useWindow = true
): boolean {
  if (!isClient) {
    return minBreakpoint === 'phone';
  }
  const minWidth = breakpoints[minBreakpoint];
  return window.innerWidth >= minWidth;
}
