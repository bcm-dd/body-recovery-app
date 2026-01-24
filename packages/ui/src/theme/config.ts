/**
 * Tamagui Configuration
 *
 * Sets up the complete Tamagui theme system with:
 * - Light and dark themes
 * - Design tokens
 * - Animation configurations
 */

import { createAnimations } from '@tamagui/animations-react-native';
import { createTamagui, createTokens } from 'tamagui';

import {
  palette,
  space,
  radii,
  fontSize,
  lineHeight,
  fontWeight,
} from './tokens';

/**
 * Tamagui tokens - converted from our design tokens
 */
const tokens = createTokens({
  color: {
    // Raw palette colors
    ...palette,

    // Semantic colors (will be overridden by themes)
    background: palette.gray950,
    surface: palette.surface50,
    card: palette.surface100,
    border: palette.gray700,
    primary: palette.blue500,
    primaryHover: palette.blue600,
    secondary: palette.gray600,
    text: palette.white,
    textPrimary: palette.white,
    textSecondary: palette.gray400,
    textMuted: palette.gray500,
    success: palette.green500,
    warning: palette.amber500,
    error: palette.red500,

    // Interactive states
    pressHighlight: 'rgba(255, 255, 255, 0.1)',
    disabled: palette.gray600,
    disabledText: palette.gray500,

    // Pain level colors
    painNone: palette.painNone,
    painMild: palette.painMild,
    painModerate: palette.painModerate,
    painSevere: palette.painSevere,
  },

  space,

  size: {
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
    true: 16,
  },

  radius: radii,

  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
  },
});

/**
 * Animation presets
 */
const animations = createAnimations({
  // Quick animations for micro-interactions
  quick: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },

  // Medium animations for transitions
  medium: {
    type: 'spring',
    damping: 15,
    mass: 1,
    stiffness: 150,
  },

  // Slow animations for emphasis
  slow: {
    type: 'spring',
    damping: 15,
    mass: 1,
    stiffness: 100,
  },

  // Bouncy animation for playful elements
  bouncy: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },

  // Reduced motion alternatives (instant or minimal)
  quickReduced: {
    type: 'timing',
    duration: 0,
  },
  mediumReduced: {
    type: 'timing',
    duration: 100,
  },

  // Toast/notification animations
  toast: {
    type: 'spring',
    damping: 20,
    mass: 1,
    stiffness: 200,
  },

  // Sheet/modal animations
  sheet: {
    type: 'spring',
    damping: 22,
    mass: 1,
    stiffness: 180,
  },
});

/**
 * Dark theme - Primary theme (dark mode default)
 */
const darkTheme = {
  background: palette.gray950,
  backgroundHover: palette.surface50,
  backgroundPress: palette.surface100,
  backgroundFocus: palette.surface50,

  surface: palette.surface50,
  surfaceHover: palette.surface100,
  surfacePress: palette.surface200,

  card: palette.surface100,
  cardHover: palette.surface200,

  border: palette.gray700,
  borderHover: palette.gray600,

  primary: palette.blue500,
  primaryHover: palette.blue600,
  primaryPress: palette.blue700,

  secondary: palette.gray600,
  secondaryHover: palette.gray500,
  secondaryPress: palette.gray700,

  color: palette.white,
  colorHover: palette.gray100,
  colorPress: palette.gray200,

  textPrimary: palette.white,
  textSecondary: palette.gray400,
  textMuted: palette.gray500,
  textDisabled: palette.gray600,

  success: palette.green500,
  successBackground: 'rgba(34, 197, 94, 0.1)',
  successBorder: palette.green700,

  warning: palette.amber500,
  warningBackground: 'rgba(245, 158, 11, 0.1)',
  warningBorder: palette.amber700,

  error: palette.red500,
  errorBackground: 'rgba(239, 68, 68, 0.1)',
  errorBorder: palette.red700,

  // Pain colors
  painNone: palette.painNone,
  painMild: palette.painMild,
  painModerate: palette.painModerate,
  painSevere: palette.painSevere,

  // Interactive overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayStrong: 'rgba(0, 0, 0, 0.75)',

  // Shadows (for web)
  shadowColor: 'rgba(0, 0, 0, 0.5)',
  shadowColorHover: 'rgba(0, 0, 0, 0.6)',
};

/**
 * Light theme
 */
const lightTheme = {
  background: palette.gray50,
  backgroundHover: palette.white,
  backgroundPress: palette.gray100,
  backgroundFocus: palette.white,

  surface: palette.white,
  surfaceHover: palette.gray50,
  surfacePress: palette.gray100,

  card: palette.white,
  cardHover: palette.gray50,

  border: palette.gray200,
  borderHover: palette.gray300,

  primary: palette.blue600,
  primaryHover: palette.blue700,
  primaryPress: palette.blue800,

  secondary: palette.gray400,
  secondaryHover: palette.gray500,
  secondaryPress: palette.gray600,

  color: palette.gray900,
  colorHover: palette.gray800,
  colorPress: palette.gray700,

  textPrimary: palette.gray900,
  textSecondary: palette.gray600,
  textMuted: palette.gray500,
  textDisabled: palette.gray400,

  success: palette.green600,
  successBackground: 'rgba(34, 197, 94, 0.1)',
  successBorder: palette.green200,

  warning: palette.amber600,
  warningBackground: 'rgba(245, 158, 11, 0.1)',
  warningBorder: palette.amber200,

  error: palette.red600,
  errorBackground: 'rgba(239, 68, 68, 0.1)',
  errorBorder: palette.red200,

  // Pain colors (slightly adjusted for light mode visibility)
  painNone: palette.green600,
  painMild: palette.amber400,
  painModerate: palette.amber600,
  painSevere: palette.red600,

  // Interactive overlays
  overlay: 'rgba(0, 0, 0, 0.3)',
  overlayStrong: 'rgba(0, 0, 0, 0.5)',

  // Shadows
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  shadowColorHover: 'rgba(0, 0, 0, 0.15)',
};

/**
 * Font configuration
 */
const fonts = {
  heading: {
    family: 'System',
    size: fontSize,
    lineHeight: lineHeight,
    weight: fontWeight,
    letterSpacing: {
      1: -0.5,
      2: -0.5,
      3: -0.25,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: -0.5,
      9: -0.5,
      10: -1,
    },
  },
  body: {
    family: 'System',
    size: fontSize,
    lineHeight: lineHeight,
    weight: fontWeight,
    letterSpacing: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
    },
  },
  mono: {
    family: 'System',
    size: fontSize,
    lineHeight: lineHeight,
    weight: fontWeight,
    letterSpacing: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
    },
  },
};

/**
 * Media queries for responsive design
 */
const media = {
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
};

/**
 * Main Tamagui configuration
 */
export const config = createTamagui({
  tokens,
  themes: {
    dark: darkTheme,
    light: lightTheme,

    // Sub-themes for specific component states
    dark_Button: {
      ...darkTheme,
      background: darkTheme.primary,
      backgroundHover: darkTheme.primaryHover,
      backgroundPress: darkTheme.primaryPress,
      color: palette.white,
    },

    light_Button: {
      ...lightTheme,
      background: lightTheme.primary,
      backgroundHover: lightTheme.primaryHover,
      backgroundPress: lightTheme.primaryPress,
      color: palette.white,
    },

    dark_Card: {
      ...darkTheme,
      background: darkTheme.card,
      backgroundHover: darkTheme.cardHover,
    },

    light_Card: {
      ...lightTheme,
      background: lightTheme.card,
      backgroundHover: lightTheme.cardHover,
    },
  },
  defaultTheme: 'dark',
  animations,
  fonts,
  media,

  // Shorthands for common props
  shorthands: {
    px: 'paddingHorizontal',
    py: 'paddingVertical',
    mx: 'marginHorizontal',
    my: 'marginVertical',
    bg: 'backgroundColor',
    br: 'borderRadius',
    bw: 'borderWidth',
    bc: 'borderColor',
    w: 'width',
    h: 'height',
    f: 'flex',
    ai: 'alignItems',
    jc: 'justifyContent',
    fd: 'flexDirection',
    fw: 'flexWrap',
    ac: 'alignContent',
    as: 'alignSelf',
    fs: 'flexShrink',
    fg: 'flexGrow',
    fb: 'flexBasis',
  } as const,
});

export type AppConfig = typeof config;

// Type declarations for Tamagui
declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
