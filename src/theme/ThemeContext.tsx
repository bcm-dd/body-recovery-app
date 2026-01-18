/**
 * Theme Context - Movement & Recovery Companion
 *
 * Provides theme values throughout the app and handles
 * theme switching between light, dark, and system modes.
 */

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useColorScheme, ColorSchemeName } from 'react-native';
import { Theme, ThemeMode, AccentColor, getTheme } from './theme';
import { darkTheme } from './theme';

// ============================================================================
// Context Types
// ============================================================================

interface ThemeContextValue {
  theme: Theme;
  themeMode: ThemeMode;
  accentColor: AccentColor;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  isDark: boolean;
}

// ============================================================================
// Context
// ============================================================================

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

interface ThemeProviderProps {
  children: React.ReactNode;
  initialThemeMode?: ThemeMode;
  initialAccentColor?: AccentColor;
}

export function ThemeProvider({
  children,
  initialThemeMode = 'system',
  initialAccentColor = 'blue',
}: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialThemeMode);
  const [accentColor, setAccentColor] = useState<AccentColor>(initialAccentColor);

  // Determine actual theme mode based on setting and system preference
  const resolvedMode: 'light' | 'dark' = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  // Create theme object
  const theme = useMemo(() => {
    return getTheme(resolvedMode, accentColor);
  }, [resolvedMode, accentColor]);

  const isDark = resolvedMode === 'dark';

  const value: ThemeContextValue = useMemo(
    () => ({
      theme,
      themeMode,
      accentColor,
      setThemeMode,
      setAccentColor,
      isDark,
    }),
    [theme, themeMode, accentColor, isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// ============================================================================
// Convenience hooks
// ============================================================================

/**
 * Returns just the theme colors for quick access
 */
export function useThemeColors() {
  const { theme } = useTheme();
  return theme.colors;
}

/**
 * Returns spacing values
 */
export function useSpacing() {
  const { theme } = useTheme();
  return theme.spacing;
}

/**
 * Returns typography values
 */
export function useTypography() {
  const { theme } = useTheme();
  return theme.typography;
}

/**
 * Returns a styled component helper
 */
export function useStyled() {
  const { theme, isDark } = useTheme();

  return useCallback(
    <T extends Record<string, unknown>>(
      lightStyles: T,
      darkStyles?: Partial<T>
    ): T => {
      if (isDark && darkStyles) {
        return { ...lightStyles, ...darkStyles };
      }
      return lightStyles;
    },
    [isDark]
  );
}

// ============================================================================
// Export context for edge cases
// ============================================================================

export { ThemeContext };
