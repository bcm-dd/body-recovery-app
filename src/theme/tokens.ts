/**
 * Design Tokens - Movement & Recovery Companion
 *
 * Core design values that drive the entire visual system.
 * These tokens are the single source of truth for colors, typography,
 * spacing, and other visual properties.
 */

// ============================================================================
// Colors
// ============================================================================

export const palette = {
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',

  // Dark mode backgrounds
  dark: {
    background: '#0A0A0A',
    surface: '#1A1A1A',
    card: '#242424',
    elevated: '#2E2E2E',
    border: '#3A3A3A',
  },

  // Light mode backgrounds
  light: {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    elevated: '#FFFFFF',
    border: '#E5E7EB',
  },

  // Primary accent (Blue)
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Alternative accents
  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7E22CE',
    800: '#6B21A8',
    900: '#581C87',
  },

  orange: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },

  pink: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899',
    600: '#DB2777',
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
  },

  // Semantic colors
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Status colors
  success: {
    light: '#22C55E',
    dark: '#22C55E',
  },
  warning: {
    light: '#F59E0B',
    dark: '#F59E0B',
  },
  error: {
    light: '#EF4444',
    dark: '#EF4444',
  },
  info: {
    light: '#3B82F6',
    dark: '#60A5FA',
  },

  // Readiness ring colors
  readiness: {
    sleep: '#8B5CF6', // Purple for sleep
    recovery: '#10B981', // Emerald for HRV/recovery
    load: '#F59E0B', // Amber for training load
    body: '#EF4444', // Red for injury/body flags
  },

  // Body map colors
  bodyMap: {
    good: '#22C55E',
    mild: '#F59E0B',
    moderate: '#F97316',
    severe: '#EF4444',
    neutral: '#6B7280',
  },
} as const;

// ============================================================================
// Typography
// ============================================================================

export const typography = {
  // Font families
  fontFamily: {
    sans: 'System',
    mono: 'Menlo',
  },

  // Font sizes (in pixels, will be converted to scaled units)
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Font weights
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line heights (multipliers)
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;

// ============================================================================
// Spacing
// ============================================================================

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
} as const;

// ============================================================================
// Border Radius
// ============================================================================

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

// ============================================================================
// Shadows (for light mode)
// ============================================================================

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ============================================================================
// Animation
// ============================================================================

export const animation = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 400,
    ring: 500,
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: {
      damping: 15,
      stiffness: 150,
    },
  },
} as const;

// ============================================================================
// Z-Index
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
  toast: 70,
} as const;

// ============================================================================
// Breakpoints (for tablet responsiveness)
// ============================================================================

export const breakpoints = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
} as const;

// ============================================================================
// Component-specific tokens
// ============================================================================

export const components = {
  // Button
  button: {
    height: {
      sm: 36,
      md: 44,
      lg: 52,
    },
    paddingHorizontal: {
      sm: spacing[3],
      md: spacing[4],
      lg: spacing[6],
    },
    borderRadius: borderRadius.lg,
  },

  // Card
  card: {
    padding: spacing[4],
    borderRadius: borderRadius.xl,
  },

  // Input
  input: {
    height: 48,
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },

  // Exercise card
  exerciseCard: {
    height: {
      collapsed: 80,
      expanded: 'auto',
    },
    borderRadius: borderRadius.xl,
    padding: spacing[4],
  },

  // Readiness ring
  readinessRing: {
    size: {
      sm: 120,
      md: 180,
      lg: 240,
    },
    strokeWidth: {
      sm: 8,
      md: 12,
      lg: 16,
    },
  },

  // Bottom tab bar
  tabBar: {
    height: 84,
    iconSize: 24,
  },

  // Rest timer
  restTimer: {
    size: 200,
    strokeWidth: 8,
  },
} as const;

// ============================================================================
// Type exports
// ============================================================================

export type ColorPalette = typeof palette;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type Animation = typeof animation;
export type ZIndex = typeof zIndex;
export type Breakpoints = typeof breakpoints;
export type Components = typeof components;
