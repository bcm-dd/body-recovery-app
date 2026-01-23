/**
 * Theme System - Movement & Recovery Companion
 *
 * Creates themed color values and provides theme context.
 * Supports light, dark, and system themes.
 */

import { palette, typography, spacing, borderRadius, shadows, animation, components } from './tokens';

// ============================================================================
// Theme Types
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'pink';

export interface Theme {
  mode: 'light' | 'dark';
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  animation: typeof animation;
  components: typeof components;
}

export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  card: string;
  elevated: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Borders
  border: string;
  borderFocused: string;

  // Accent (primary brand color)
  accent: string;
  accentLight: string;
  accentDark: string;
  accentText: string;

  // Semantic
  success: string;
  successBackground: string;
  warning: string;
  warningBackground: string;
  error: string;
  errorBackground: string;
  info: string;
  infoBackground: string;

  // Interactive states
  pressedOverlay: string;
  disabledBackground: string;
  disabledText: string;

  // Readiness ring
  readinessSleep: string;
  readinessRecovery: string;
  readinessLoad: string;
  readinessBody: string;
  readinessBackground: string;

  // Body map
  bodyMapGood: string;
  bodyMapMild: string;
  bodyMapModerate: string;
  bodyMapSevere: string;
  bodyMapNeutral: string;

  // Exercise card states
  exerciseUpcoming: string;
  exerciseActive: string;
  exerciseComplete: string;
  exerciseSkipped: string;
}

// ============================================================================
// Theme Factories
// ============================================================================

interface AccentColors {
  accent: string;
  accentLight: string;
  accentDark: string;
  accentText: string;
}

function getAccentColors(accent: AccentColor): AccentColors {
  const accentPalette = palette[accent];
  return {
    accent: accentPalette[500],
    accentLight: accentPalette[400],
    accentDark: accentPalette[600],
    accentText: palette.white,
  };
}

export function createDarkTheme(accent: AccentColor = 'blue'): Theme {
  const accentColors = getAccentColors(accent);

  return {
    mode: 'dark',
    colors: {
      // Backgrounds
      background: palette.dark.background,
      surface: palette.dark.surface,
      card: palette.dark.card,
      elevated: palette.dark.elevated,

      // Text
      textPrimary: palette.white,
      textSecondary: palette.gray[400],
      textTertiary: palette.gray[500],
      textInverse: palette.gray[900],

      // Borders
      border: palette.dark.border,
      borderFocused: accentColors.accent,

      // Accent
      ...accentColors,

      // Semantic
      success: palette.success.dark,
      successBackground: `${palette.success.dark}20`,
      warning: palette.warning.dark,
      warningBackground: `${palette.warning.dark}20`,
      error: palette.error.dark,
      errorBackground: `${palette.error.dark}20`,
      info: palette.info.dark,
      infoBackground: `${palette.info.dark}20`,

      // Interactive
      pressedOverlay: 'rgba(255, 255, 255, 0.1)',
      disabledBackground: palette.gray[800],
      disabledText: palette.gray[600],

      // Readiness ring
      readinessSleep: palette.readiness.sleep,
      readinessRecovery: palette.readiness.recovery,
      readinessLoad: palette.readiness.load,
      readinessBody: palette.readiness.body,
      readinessBackground: palette.dark.surface,

      // Body map
      bodyMapGood: palette.bodyMap.good,
      bodyMapMild: palette.bodyMap.mild,
      bodyMapModerate: palette.bodyMap.moderate,
      bodyMapSevere: palette.bodyMap.severe,
      bodyMapNeutral: palette.gray[600],

      // Exercise card states
      exerciseUpcoming: palette.dark.card,
      exerciseActive: accentColors.accent,
      exerciseComplete: palette.success.dark,
      exerciseSkipped: palette.gray[700],
    },
    typography,
    spacing,
    borderRadius,
    shadows,
    animation,
    components,
  };
}

export function createLightTheme(accent: AccentColor = 'blue'): Theme {
  const accentColors = getAccentColors(accent);
  // Adjust accent for light mode readability
  accentColors.accent = palette[accent][600];
  accentColors.accentLight = palette[accent][500];
  accentColors.accentDark = palette[accent][700];

  return {
    mode: 'light',
    colors: {
      // Backgrounds
      background: palette.light.background,
      surface: palette.light.surface,
      card: palette.light.card,
      elevated: palette.light.elevated,

      // Text
      textPrimary: palette.gray[900],
      textSecondary: palette.gray[600],
      textTertiary: palette.gray[500],
      textInverse: palette.white,

      // Borders
      border: palette.light.border,
      borderFocused: accentColors.accent,

      // Accent
      ...accentColors,

      // Semantic
      success: palette.green[600],
      successBackground: palette.green[50],
      warning: palette.orange[600],
      warningBackground: palette.orange[50],
      error: palette.error.light,
      errorBackground: `${palette.error.light}15`,
      info: palette.blue[600],
      infoBackground: palette.blue[50],

      // Interactive
      pressedOverlay: 'rgba(0, 0, 0, 0.05)',
      disabledBackground: palette.gray[100],
      disabledText: palette.gray[400],

      // Readiness ring
      readinessSleep: palette.readiness.sleep,
      readinessRecovery: palette.readiness.recovery,
      readinessLoad: palette.readiness.load,
      readinessBody: palette.readiness.body,
      readinessBackground: palette.gray[100],

      // Body map
      bodyMapGood: palette.bodyMap.good,
      bodyMapMild: palette.bodyMap.mild,
      bodyMapModerate: palette.bodyMap.moderate,
      bodyMapSevere: palette.bodyMap.severe,
      bodyMapNeutral: palette.gray[400],

      // Exercise card states
      exerciseUpcoming: palette.white,
      exerciseActive: accentColors.accent,
      exerciseComplete: palette.green[500],
      exerciseSkipped: palette.gray[200],
    },
    typography,
    spacing,
    borderRadius,
    shadows,
    animation,
    components,
  };
}

// ============================================================================
// Default themes
// ============================================================================

export const darkTheme = createDarkTheme('blue');
export const lightTheme = createLightTheme('blue');

// ============================================================================
// Theme helpers
// ============================================================================

export function getTheme(mode: 'light' | 'dark', accent: AccentColor = 'blue'): Theme {
  return mode === 'dark' ? createDarkTheme(accent) : createLightTheme(accent);
}
