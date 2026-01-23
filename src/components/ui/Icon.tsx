/**
 * Icon Component - Movement & Recovery Companion
 *
 * Theme-aware icon component using react-native-vector-icons.
 * Supports multiple icon families and automatic theme color application.
 */

import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/theme';
import { iconSizes } from '@/theme/tokens';

// ============================================================================
// Types
// ============================================================================

export type IconSize = keyof typeof iconSizes;

export type IconFamily = 'material' | 'material-community' | 'ionicons' | 'feather';

export type IconColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'accent'
  | 'error'
  | 'success'
  | 'warning'
  | 'inverse';

export interface IconProps {
  /** Icon name from the selected icon family */
  name: string;
  /** Icon size - uses design token sizes */
  size?: IconSize;
  /** Semantic color name or custom color string */
  color?: IconColor | string;
  /** Icon family to use */
  family?: IconFamily;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  /** Whether the icon is purely decorative (hidden from screen readers) */
  decorative?: boolean;
  /** Custom style */
  style?: StyleProp<TextStyle>;
  /** Test ID for testing */
  testID?: string;
}

// ============================================================================
// Color mapping helper
// ============================================================================

function getColorValue(
  color: IconColor | string | undefined,
  themeColors: ReturnType<typeof useTheme>['theme']['colors']
): string {
  if (!color) {
    return themeColors.textPrimary;
  }

  const colorMap: Record<IconColor, string> = {
    primary: themeColors.textPrimary,
    secondary: themeColors.textSecondary,
    tertiary: themeColors.textTertiary,
    accent: themeColors.accent,
    error: themeColors.error,
    success: themeColors.success,
    warning: themeColors.warning,
    inverse: themeColors.textInverse,
  };

  // Check if it's a semantic color name
  if (color in colorMap) {
    return colorMap[color as IconColor];
  }

  // Otherwise, treat as custom color string
  return color;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Icon component that renders vector icons with theme integration.
 *
 * @example
 * // Basic usage with Material Icons
 * <Icon name="home" size="md" color="primary" />
 *
 * @example
 * // Using different icon family
 * <Icon name="heart" family="ionicons" size="lg" color="accent" />
 *
 * @example
 * // Custom color and accessibility
 * <Icon
 *   name="check-circle"
 *   color="#22C55E"
 *   accessibilityLabel="Success indicator"
 * />
 */
export function Icon({
  name,
  size = 'md',
  color,
  family = 'material',
  accessibilityLabel,
  decorative = false,
  style,
  testID,
}: IconProps): React.ReactElement {
  const { theme } = useTheme();
  const iconSize = iconSizes[size];
  const iconColor = getColorValue(color, theme.colors);

  // Accessibility props
  const accessibilityProps = decorative
    ? {
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no' as const,
      }
    : {
        accessibilityLabel,
        accessibilityRole: 'image' as const,
      };

  // Common props for all icon components
  // Cast style to any to avoid type incompatibility with react-native-vector-icons
  const iconProps = {
    name,
    size: iconSize,
    color: iconColor,
    style: style as any,
    testID,
    ...accessibilityProps,
  };

  // Render the appropriate icon family
  switch (family) {
    case 'material-community':
      return <MaterialCommunityIcons {...iconProps} />;
    case 'ionicons':
      return <Ionicons {...iconProps} />;
    case 'feather':
      return <Feather {...iconProps} />;
    case 'material':
    default:
      return <MaterialIcons {...iconProps} />;
  }
}

// ============================================================================
// Convenience exports for common icons
// ============================================================================

/** Get numeric size value from size token */
export function getIconSize(size: IconSize): number {
  return iconSizes[size];
}

/** Available icon size tokens */
export const ICON_SIZES = Object.keys(iconSizes) as IconSize[];
