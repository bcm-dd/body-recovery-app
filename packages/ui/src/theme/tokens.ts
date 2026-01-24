/**
 * Design Tokens for the Movement & Recovery Companion
 *
 * Based on the architecture doc specifications:
 * - Colors: background (#0A0A0A dark), surface, primary (#3B82F6), text, success, warning, error
 * - Spacing: 4, 8, 12, 16, 24, 32 scale
 * - Radii: 4, 8, 12, 16
 */

/**
 * Color palette - raw color values
 */
export const palette = {
  // Neutrals
  black: '#000000',
  white: '#FFFFFF',

  // Grays (dark theme optimized)
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  gray950: '#0A0A0A',

  // Dark surfaces
  surface50: '#1A1A1A',
  surface100: '#242424',
  surface200: '#2E2E2E',

  // Primary (blue)
  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue200: '#BFDBFE',
  blue300: '#93C5FD',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',
  blue800: '#1E40AF',
  blue900: '#1E3A8A',

  // Success (green)
  green50: '#F0FDF4',
  green100: '#DCFCE7',
  green200: '#BBF7D0',
  green300: '#86EFAC',
  green400: '#4ADE80',
  green500: '#22C55E',
  green600: '#16A34A',
  green700: '#15803D',

  // Warning (amber/orange)
  amber50: '#FFFBEB',
  amber100: '#FEF3C7',
  amber200: '#FDE68A',
  amber300: '#FCD34D',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  amber600: '#D97706',
  amber700: '#B45309',

  // Error (red)
  red50: '#FEF2F2',
  red100: '#FEE2E2',
  red200: '#FECACA',
  red300: '#FCA5A5',
  red400: '#F87171',
  red500: '#EF4444',
  red600: '#DC2626',
  red700: '#B91C1C',

  // Pain level colors (for BodyMap)
  painNone: '#22C55E', // green - no pain
  painMild: '#FCD34D', // yellow - mild
  painModerate: '#F59E0B', // orange - moderate
  painSevere: '#EF4444', // red - severe
} as const;

/**
 * Spacing scale following 4px base unit
 */
export const space = {
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
  true: 16, // default spacing
} as const;

/**
 * Border radius scale
 */
export const radii = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  full: 9999,
  true: 8, // default radius
} as const;

/**
 * Z-index scale for layering
 */
export const zIndex = {
  0: 0,
  1: 100,
  2: 200,
  3: 300,
  4: 400,
  5: 500,
  modal: 1000,
  toast: 1100,
  sheet: 900,
} as const;

/**
 * Font sizes
 */
export const fontSize = {
  1: 11,
  2: 12,
  3: 13,
  4: 14,
  5: 16,
  6: 18,
  7: 20,
  8: 24,
  9: 32,
  10: 40,
  11: 48,
  12: 56,
  true: 16, // default
} as const;

/**
 * Line heights
 */
export const lineHeight = {
  1: 16,
  2: 18,
  3: 20,
  4: 22,
  5: 24,
  6: 26,
  7: 28,
  8: 32,
  9: 40,
  10: 48,
  true: 24, // default
} as const;

/**
 * Font weights
 */
export const fontWeight = {
  1: '100',
  2: '200',
  3: '300',
  4: '400',
  5: '500',
  6: '600',
  7: '700',
  8: '800',
  9: '900',
  true: '400', // default
} as const;

/**
 * Shadow definitions for elevation
 */
export const shadows = {
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
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

/**
 * Animation durations in milliseconds
 */
export const durations = {
  instant: 0,
  fast: 150,
  normal: 200,
  medium: 250,
  slow: 300,
  slower: 500,
} as const;

export type Palette = typeof palette;
export type Space = typeof space;
export type Radii = typeof radii;
export type ZIndex = typeof zIndex;
export type FontSize = typeof fontSize;
export type LineHeight = typeof lineHeight;
export type FontWeight = typeof fontWeight;
export type Shadows = typeof shadows;
export type Durations = typeof durations;
