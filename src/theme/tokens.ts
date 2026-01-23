/**
 * Design Tokens - Movement & Recovery Companion
 *
 * Premium design system based on "Calm Confidence" philosophy.
 * Every element should feel inevitable, considered, and deeply satisfying.
 *
 * Core principles:
 * - Timeless over trendy
 * - Purposeful color
 * - Restrained motion
 * - OLED-optimized dark mode
 */

// ============================================================================
// Colors - Premium Palette
// ============================================================================

export const palette = {
  // Pure values
  white: '#FFFFFF',
  black: '#000000',
  void: '#000000', // True black for OLED optimization

  // Dark mode backgrounds (OLED-optimized)
  dark: {
    void: '#000000',      // True black - OLED optimization, maximum contrast
    base: '#0A0A0B',      // Primary background - almost black, slight warmth
    surface: '#141416',   // Cards, elevated elements
    elevated: '#1C1C1F',  // Modals, popovers, focused states
    border: '#2A2A2E',    // Subtle dividers, card edges
  },

  // Light mode backgrounds (warm, paper-like)
  light: {
    base: '#FAFAFA',      // Primary background - warm white
    surface: '#FFFFFF',   // Cards, elevated elements
    elevated: '#FFFFFF',  // With shadow for elevation
    border: '#E5E5E7',    // Subtle dividers
  },

  // Text hierarchy - Dark mode
  textDark: {
    primary: '#FFFFFF',   // Headlines, primary content
    secondary: '#A1A1A6', // Supporting text, labels
    tertiary: '#636366',  // Timestamps, hints, disabled
    inverse: '#000000',   // Text on light backgrounds
  },

  // Text hierarchy - Light mode
  textLight: {
    primary: '#000000',   // Headlines, primary content
    secondary: '#6B6B6B', // Supporting text, labels
    tertiary: '#8E8E93',  // Timestamps, hints, disabled
    inverse: '#FFFFFF',   // Text on dark backgrounds
  },

  // Primary accent - iOS System Blue
  accent: {
    default: '#0A84FF',   // The signature blue - familiar, accessible, trusted
    hover: '#409CFF',     // Lighter on hover/press
    muted: '#0A84FF20',   // Backgrounds, subtle highlights (20% opacity)
  },

  // Alternative accent palettes
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#0A84FF',   // iOS System Blue
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#30D158',   // iOS System Green
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
    500: '#BF5AF2',   // iOS System Purple
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
    500: '#FF9F0A',   // iOS System Orange
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },

  // Neutral grays
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

  // Semantic colors - iOS System Colors
  success: '#30D158',   // Completions, positive trends
  warning: '#FFD60A',   // Cautions, attention needed
  error: '#FF453A',     // Errors, pain, stop signals
  info: '#64D2FF',      // Informational, neutral highlights

  // Readiness ring colors
  readiness: {
    sleep: '#BF5AF2',     // Purple - night, rest
    recovery: '#64D2FF',  // Cyan - freshness
    load: '#FF9F0A',      // Orange - effort, work
    body: '#30D158',      // Green - physical state
    background: '#2A2A2E', // Ring background track
  },

  // Body map colors
  bodyMap: {
    severe: '#FF453A',    // Red - severe pain
    moderate: '#FF9F0A',  // Orange - moderate pain
    mild: '#FFD60A',      // Yellow - mild pain
    good: '#30D158',      // Green - good
    neutral: '#636366',   // Gray - neutral/unselected
  },
} as const;

// ============================================================================
// Typography - iOS-inspired Scale
// ============================================================================

export const typography = {
  // Font families - System fonts for native feel
  fontFamily: {
    sans: 'System',   // SF Pro on iOS, Roboto on Android
    mono: 'Menlo',
  },

  // Font sizes following iOS HIG
  fontSize: {
    caption2: 11,     // Minimum legible size
    caption1: 12,     // Labels, small UI
    footnote: 13,     // Timestamps, hints
    subhead: 15,      // Supporting text
    callout: 16,      // Secondary content
    body: 17,         // Primary reading text
    headline: 17,     // Emphasized body (semibold)
    title3: 20,       // Card titles, exercise names
    title2: 22,       // Section headers
    title1: 28,       // Screen titles
    hero: 34,         // App title, major celebrations

    // Legacy aliases for backward compatibility
    xs: 11,
    sm: 13,
    base: 17,
    lg: 20,
    xl: 22,
    '2xl': 28,
    '3xl': 34,
    '4xl': 40,
  },

  // Line heights (absolute values)
  lineHeight: {
    caption2: 13,
    caption1: 16,
    footnote: 18,
    subhead: 20,
    callout: 21,
    body: 22,
    headline: 22,
    title3: 25,
    title2: 28,
    title1: 34,
    hero: 41,

    // Legacy aliases for backward compatibility
    tight: 20,
    normal: 22,
    xs: 13,
    sm: 18,
    base: 22,
    lg: 25,
    xl: 28,
    '2xl': 34,
    '3xl': 41,
    '4xl': 48,
  },

  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    // Legacy alias
    normal: '400' as const,
  },

  // Letter spacing - mostly untouched, system fonts are optimized
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;

// ============================================================================
// Spacing - 4px Base Unit
// ============================================================================

export const spacing = {
  0: 0,
  0.5: 2,    // Extra small - fine adjustments
  1: 4,      // xs - Inline spacing, icon gaps
  1.5: 6,    // Between xs and sm
  2: 8,      // sm - Related elements
  2.5: 10,   // Between sm and md
  3: 12,     // md - Component internal padding
  3.5: 14,   // Between md and base
  4: 16,     // base - Standard gaps between elements
  5: 20,     // lg - Section gaps (used sparingly)
  6: 24,     // xl - Major section separation
  8: 32,     // 2xl - Screen edge margins (mobile)
  10: 40,    // Between 2xl and 3xl
  12: 48,    // 3xl - Large feature spacing
  16: 64,    // 4xl - Hero spacing

  // Named aliases for clarity
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

// ============================================================================
// Border Radius
// ============================================================================

export const borderRadius = {
  none: 0,       // Sharp edges (dividers, full-bleed)
  sm: 8,         // Small buttons, tags, chips
  md: 12,        // Cards, inputs, standard buttons
  lg: 16,        // Large cards, modals
  xl: 20,        // Feature cards, hero elements
  '2xl': 24,     // Larger rounded elements
  full: 9999,    // Pills, circular buttons, avatars
} as const;

// ============================================================================
// Shadows - Light Mode
// Uses subtle shadows for elegant depth
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 48,
    elevation: 8,
  },
} as const;

// ============================================================================
// Shadows - Dark Mode
// In dark mode, shadows disappear into darkness
// Use background color stepping and borders instead
// ============================================================================

export const shadowsDark = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  md: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  lg: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xl: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;

// ============================================================================
// Animation - Physics-Based Motion
// ============================================================================

export const animation = {
  duration: {
    instant: 0,       // No animation, immediate state changes
    fast: 100,        // Quick micro-interactions (80-150ms)
    normal: 200,      // Standard transitions
    slow: 300,        // Deliberate animations
    slower: 400,      // Page transitions
    ring: 800,        // Extended animations (readiness ring)
  },

  // Spring configurations for physics-based motion
  spring: {
    button: { damping: 15, stiffness: 300 },      // Quick, snappy feedback
    transition: { damping: 20, stiffness: 200 },  // Smooth transitions
    bounce: { damping: 10, stiffness: 150 },      // Bouncy, playful
    gentle: { damping: 25, stiffness: 120 },      // Gentle, subtle
  },

  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
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
// Breakpoints (for responsive design)
// ============================================================================

export const breakpoints = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
} as const;

// ============================================================================
// Focus Ring (Web Accessibility)
// ============================================================================

export const focusRing = {
  width: 2,
  offset: 2,
  color: 'accent',
} as const;

// ============================================================================
// Icon Sizes
// ============================================================================

export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

// ============================================================================
// Component-specific tokens
// ============================================================================

export const components = {
  // Button - 44pt minimum touch target
  button: {
    height: {
      sm: 36,
      md: 44,    // Minimum accessible touch target
      lg: 52,
    },
    paddingHorizontal: {
      sm: spacing[3],  // 12
      md: spacing[4],  // 16
      lg: spacing[6],  // 24
    },
    borderRadius: borderRadius.md,  // 12px
  },

  // Card
  card: {
    padding: {
      sm: spacing[3],  // 12
      md: spacing[4],  // 16
      lg: spacing[5],  // 20
    },
    borderRadius: borderRadius.lg,  // 16px
    borderWidth: 1,
  },

  // Input
  input: {
    height: 48,
    paddingHorizontal: spacing[4],  // 16
    borderRadius: borderRadius.md,  // 12px
    borderWidth: 1,
  },

  // Exercise card
  exerciseCard: {
    height: {
      collapsed: 80,
      expanded: 'auto' as const,
    },
    videoThumbnail: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.md,  // 12px
    },
    borderRadius: borderRadius.lg,  // 16px
    padding: spacing[4],  // 16
  },

  // Readiness ring - Signature visual element
  readinessRing: {
    size: {
      sm: 120,
      md: 200,   // Mobile default
      lg: 240,   // Tablet
    },
    strokeWidth: {
      sm: 8,
      md: 12,
      lg: 12,
    },
    segmentGap: 4,  // Gap between segments in degrees
    scoreSize: {
      sm: 32,
      md: 48,
      lg: 48,
    },
  },

  // Bottom tab bar
  tabBar: {
    height: 84,
    iconSize: 24,
    labelSize: 11,
  },

  // Rest timer
  restTimer: {
    size: 200,
    strokeWidth: 8,
    fontSize: 48,
  },

  // Set indicator dots
  setIndicator: {
    size: 8,
    gap: 8,
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
export type ShadowsDark = typeof shadowsDark;
export type Animation = typeof animation;
export type ZIndex = typeof zIndex;
export type Breakpoints = typeof breakpoints;
export type Components = typeof components;
export type FocusRing = typeof focusRing;
export type IconSizes = typeof iconSizes;
