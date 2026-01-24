/**
 * useTheme hook
 *
 * Access theme values and toggle between light/dark modes.
 * Wrapper around Tamagui's useTheme with additional utilities.
 */

import { useTheme as useTamaguiTheme, useThemeName } from 'tamagui';
import { useCallback, useMemo } from 'react';
import { useColorScheme, Platform } from 'react-native';

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Extended theme hook return type
 */
export interface UseThemeReturn {
  /** Current theme object with all values */
  theme: ReturnType<typeof useTamaguiTheme>;
  /** Current theme name ('light' | 'dark') */
  themeName: string;
  /** Whether dark mode is active */
  isDark: boolean;
  /** System color scheme */
  systemColorScheme: 'light' | 'dark' | null | undefined;
  /** Get a specific color value */
  getColor: (colorKey: string) => string;
  /** Get a spacing value */
  getSpace: (spaceKey: number) => number;
}

/**
 * Hook to access theme values
 */
export function useTheme(): UseThemeReturn {
  const theme = useTamaguiTheme();
  const themeName = useThemeName();
  const systemColorScheme = useColorScheme();

  const isDark = themeName === 'dark';

  // Get a color value from the theme
  const getColor = useCallback(
    (colorKey: string): string => {
      const value = (theme as Record<string, { val: string }>)[colorKey];
      return value?.val || colorKey;
    },
    [theme]
  );

  // Get a space value
  const getSpace = useCallback(
    (spaceKey: number): number => {
      // Space values are typically multiples of 4
      return spaceKey * 4;
    },
    []
  );

  return useMemo(
    () => ({
      theme,
      themeName,
      isDark,
      systemColorScheme,
      getColor,
      getSpace,
    }),
    [theme, themeName, isDark, systemColorScheme, getColor, getSpace]
  );
}

/**
 * Hook for theme colors with semantic names
 */
export function useThemeColors() {
  const { theme, isDark } = useTheme();

  return useMemo(
    () => ({
      // Background colors
      background: theme.background?.val,
      surface: theme.surface?.val,
      card: theme.card?.val,

      // Text colors
      textPrimary: theme.textPrimary?.val,
      textSecondary: theme.textSecondary?.val,
      textMuted: theme.textMuted?.val,

      // Brand colors
      primary: theme.primary?.val,
      primaryHover: theme.primaryHover?.val,

      // Status colors
      success: theme.success?.val,
      warning: theme.warning?.val,
      error: theme.error?.val,

      // Border
      border: theme.border?.val,

      // Pain level colors
      painNone: theme.painNone?.val,
      painMild: theme.painMild?.val,
      painModerate: theme.painModerate?.val,
      painSevere: theme.painSevere?.val,

      // Meta
      isDark,
    }),
    [theme, isDark]
  );
}

/**
 * Hook for responsive theme values based on breakpoints
 */
export function useResponsiveValue<T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  default: T;
}): T {
  // In React Native, we don't have window width by default
  // This is a simplified version - could be enhanced with Dimensions
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const width = window.innerWidth;

    if (width < 660 && values.xs !== undefined) return values.xs;
    if (width < 800 && values.sm !== undefined) return values.sm;
    if (width < 1020 && values.md !== undefined) return values.md;
    if (width < 1280 && values.lg !== undefined) return values.lg;
    if (width < 1420 && values.xl !== undefined) return values.xl;
  }

  return values.default;
}

/**
 * Hook to get safe area insets-aware spacing
 * Useful for positioning elements at screen edges
 */
export function useSafeSpacing() {
  // This would integrate with react-native-safe-area-context
  // For now, return default values
  return useMemo(
    () => ({
      top: 44, // Default iOS status bar height
      bottom: 34, // Default iOS home indicator height
      left: 0,
      right: 0,
    }),
    []
  );
}
