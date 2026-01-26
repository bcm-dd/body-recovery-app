import { createTamagui, createTokens } from '@tamagui/core';
import { createInterFont } from '@tamagui/font-inter';
import { shorthands } from '@tamagui/shorthands';
import { themes as tamaguiThemes, tokens as defaultTokens } from '@tamagui/config/v3';
import { createAnimations } from '@tamagui/animations-react-native';

const headingFont = createInterFont({
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 40,
    10: 48,
  },
  weight: {
    4: '400',
    5: '500',
    6: '600',
    7: '700',
  },
});

const bodyFont = createInterFont({
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
    6: 24,
  },
  weight: {
    4: '400',
    5: '500',
    6: '600',
  },
});

const animations = createAnimations({
  fast: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  medium: {
    type: 'spring',
    damping: 15,
    mass: 1,
    stiffness: 150,
  },
  slow: {
    type: 'spring',
    damping: 15,
    mass: 1,
    stiffness: 100,
  },
  // For reduced motion
  none: {
    type: 'timing',
    duration: 0,
  },
});

const tokens = createTokens({
  ...defaultTokens,
  color: {
    ...defaultTokens.color,
    // Brand colors
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    primaryLight: '#60A5FA',

    // Readiness states
    readinessGood: '#22C55E',
    readinessModerate: '#F59E0B',
    readinessRest: '#EF4444',

    // Pain severity
    painMild: '#FCD34D',
    painModerate: '#F97316',
    painSevere: '#EF4444',

    // Semantic colors
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',

    // Dark theme
    backgroundDark: '#0A0A0A',
    surfaceDark: '#1A1A1A',
    cardDark: '#242424',
    borderDark: '#374151',
    textPrimaryDark: '#FFFFFF',
    textSecondaryDark: '#9CA3AF',

    // Light theme
    backgroundLight: '#F9FAFB',
    surfaceLight: '#FFFFFF',
    cardLight: '#FFFFFF',
    borderLight: '#E5E7EB',
    textPrimaryLight: '#111827',
    textSecondaryLight: '#6B7280',
  },
});

const lightTheme = {
  background: tokens.color.backgroundLight,
  backgroundHover: tokens.color.surfaceLight,
  backgroundPress: tokens.color.borderLight,
  backgroundFocus: tokens.color.surfaceLight,
  color: tokens.color.textPrimaryLight,
  colorHover: tokens.color.textPrimaryLight,
  colorPress: tokens.color.textSecondaryLight,
  colorFocus: tokens.color.textPrimaryLight,
  borderColor: tokens.color.borderLight,
  borderColorHover: tokens.color.textSecondaryLight,
  borderColorFocus: tokens.color.primary,
  borderColorPress: tokens.color.borderLight,
  placeholderColor: tokens.color.textSecondaryLight,
};

const darkTheme = {
  background: tokens.color.backgroundDark,
  backgroundHover: tokens.color.surfaceDark,
  backgroundPress: tokens.color.cardDark,
  backgroundFocus: tokens.color.surfaceDark,
  color: tokens.color.textPrimaryDark,
  colorHover: tokens.color.textPrimaryDark,
  colorPress: tokens.color.textSecondaryDark,
  colorFocus: tokens.color.textPrimaryDark,
  borderColor: tokens.color.borderDark,
  borderColorHover: tokens.color.textSecondaryDark,
  borderColorFocus: tokens.color.primary,
  borderColorPress: tokens.color.borderDark,
  placeholderColor: tokens.color.textSecondaryDark,
};

export const config = createTamagui({
  animations,
  defaultTheme: 'dark',
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  tokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  media: {
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  },
});

export default config;

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
