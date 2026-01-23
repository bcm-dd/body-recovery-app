/**
 * Theme System - Movement & Recovery Companion
 *
 * Premium theme system implementing "Calm Confidence" design philosophy.
 * Dark mode as default - OLED-optimized for gyms, early mornings, late evenings.
 * Light mode feels like a premium magazine - warm, not clinical.
 */

import { palette, typography, spacing, borderRadius, shadows, shadowsDark, animation, components, focusRing } from './tokens';

// ============================================================================
// Theme Types
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'blue' | 'green' | 'purple' | 'orange';

export interface ThemeFocusRing {
  width: number;
  offset: number;
  color: string;
}

export interface Theme {
  mode: 'light' | 'dark';
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows | typeof shadowsDark;
  animation: typeof animation;
  components: typeof components;
  focusRing: ThemeFocusRing;
}

export interface ThemeColors {
  // Backgrounds - stepped for dark mode depth
  background: string;
  surface: string;
  elevated: string;
  card: string;  // Legacy alias for surface

  // Text hierarchy
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Borders
  border: string;
  borderFocused: string;

  // Accent (signature blue by default)
  accent: string;
  accentHover: string;
  accentMuted: string;
  accentText: string;

  // Semantic colors
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

  // Readiness ring colors
  readinessSleep: string;
  readinessRecovery: string;
  readinessLoad: string;
  readinessBody: string;
  readinessBackground: string;

  // Body map colors
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
  accentHover: string;
  accentMuted: string;
  accentText: string;
}

function getAccentColors(accentKey: AccentColor, isDark: boolean): AccentColors {
  // Default to iOS System Blue
  if (accentKey === 'blue') {
    return {
      accent: palette.accent.default,
      accentHover: palette.accent.hover,
      accentMuted: palette.accent.muted,
      accentText: palette.white,
    };
  }

  const accentPalette = palette[accentKey];
  return {
    accent: accentPalette[500],
    accentHover: isDark ? accentPalette[400] : accentPalette[600],
    accentMuted: `${accentPalette[500]}20`,
    accentText: palette.white,
  };
}

export function createDarkTheme(accent: AccentColor = 'blue'): Theme {
  const accentColors = getAccentColors(accent, true);

  return {
    mode: 'dark',
    colors: {
      // Backgrounds - OLED-optimized stepped depth
      background: palette.dark.base,
      surface: palette.dark.surface,
      elevated: palette.dark.elevated,
      card: palette.dark.surface,  // Legacy alias

      // Text - proper contrast hierarchy
      textPrimary: palette.textDark.primary,
      textSecondary: palette.textDark.secondary,
      textTertiary: palette.textDark.tertiary,
      textInverse: palette.textDark.inverse,

      // Borders - subtle in dark mode
      border: palette.dark.border,
      borderFocused: accentColors.accent,

      // Accent
      ...accentColors,

      // Semantic - iOS System Colors
      success: palette.success,
      successBackground: `${palette.success}20`,
      warning: palette.warning,
      warningBackground: `${palette.warning}20`,
      error: palette.error,
      errorBackground: `${palette.error}20`,
      info: palette.info,
      infoBackground: `${palette.info}20`,

      // Interactive
      pressedOverlay: 'rgba(255, 255, 255, 0.1)',
      disabledBackground: palette.dark.surface,
      disabledText: palette.textDark.tertiary,

      // Readiness ring
      readinessSleep: palette.readiness.sleep,
      readinessRecovery: palette.readiness.recovery,
      readinessLoad: palette.readiness.load,
      readinessBody: palette.readiness.body,
      readinessBackground: palette.readiness.background,

      // Body map
      bodyMapGood: palette.bodyMap.good,
      bodyMapMild: palette.bodyMap.mild,
      bodyMapModerate: palette.bodyMap.moderate,
      bodyMapSevere: palette.bodyMap.severe,
      bodyMapNeutral: palette.bodyMap.neutral,

      // Exercise card states
      exerciseUpcoming: palette.dark.surface,
      exerciseActive: accentColors.accent,
      exerciseComplete: palette.success,
      exerciseSkipped: palette.dark.elevated,
    },
    typography,
    spacing,
    borderRadius,
    shadows: shadowsDark,
    animation,
    components,
    focusRing: {
      width: focusRing.width,
      offset: focusRing.offset,
      color: accentColors.accent,
    },
  };
}

export function createLightTheme(accent: AccentColor = 'blue'): Theme {
  const accentColors = getAccentColors(accent, false);

  return {
    mode: 'light',
    colors: {
      // Backgrounds - warm, paper-like
      background: palette.light.base,
      surface: palette.light.surface,
      elevated: palette.light.elevated,
      card: palette.light.surface,  // Legacy alias

      // Text
      textPrimary: palette.textLight.primary,
      textSecondary: palette.textLight.secondary,
      textTertiary: palette.textLight.tertiary,
      textInverse: palette.textLight.inverse,

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
      error: palette.error,
      errorBackground: `${palette.error}15`,
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
      readinessBackground: palette.gray[200],

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
    focusRing: {
      width: focusRing.width,
      offset: focusRing.offset,
      color: accentColors.accent,
    },
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
