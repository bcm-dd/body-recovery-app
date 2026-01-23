/**
 * Text Component - Movement & Recovery Companion
 *
 * Typography component with semantic variants.
 * Automatically adapts to theme.
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { useTheme } from '@/theme';

// ============================================================================
// Types
// ============================================================================

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'button';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'inverse'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

// ============================================================================
// Component
// ============================================================================

export function Text({
  variant = 'body',
  color = 'primary',
  weight,
  align,
  style,
  children,
  ...textProps
}: TextProps) {
  const { theme } = useTheme();
  const { typography, colors } = theme;

  // Get variant styles using iOS HIG typography scale
  const getVariantStyles = (): TextStyle => {
    switch (variant) {
      case 'h1':
        // Hero text - 34px
        return {
          fontSize: typography.fontSize.hero,
          fontWeight: typography.fontWeight.bold,
          lineHeight: typography.lineHeight.hero,
          letterSpacing: typography.letterSpacing.tight,
        };
      case 'h2':
        // Title 1 - 28px
        return {
          fontSize: typography.fontSize.title1,
          fontWeight: typography.fontWeight.bold,
          lineHeight: typography.lineHeight.title1,
          letterSpacing: typography.letterSpacing.tight,
        };
      case 'h3':
        // Title 2 - 22px
        return {
          fontSize: typography.fontSize.title2,
          fontWeight: typography.fontWeight.semibold,
          lineHeight: typography.lineHeight.title2,
        };
      case 'h4':
        // Title 3 - 20px
        return {
          fontSize: typography.fontSize.title3,
          fontWeight: typography.fontWeight.semibold,
          lineHeight: typography.lineHeight.title3,
        };
      case 'bodySmall':
        // Subhead - 15px
        return {
          fontSize: typography.fontSize.subhead,
          fontWeight: typography.fontWeight.regular,
          lineHeight: typography.lineHeight.subhead,
        };
      case 'caption':
        // Footnote - 13px
        return {
          fontSize: typography.fontSize.footnote,
          fontWeight: typography.fontWeight.regular,
          lineHeight: typography.lineHeight.footnote,
        };
      case 'label':
        // Caption 1 - 12px
        return {
          fontSize: typography.fontSize.caption1,
          fontWeight: typography.fontWeight.medium,
          lineHeight: typography.lineHeight.caption1,
          textTransform: 'uppercase',
          letterSpacing: typography.letterSpacing.wide,
        };
      case 'button':
        // Headline - 17px semibold
        return {
          fontSize: typography.fontSize.headline,
          fontWeight: typography.fontWeight.semibold,
          lineHeight: typography.lineHeight.headline,
        };
      case 'body':
      default:
        // Body - 17px
        return {
          fontSize: typography.fontSize.body,
          fontWeight: typography.fontWeight.regular,
          lineHeight: typography.lineHeight.body,
        };
    }
  };

  // Get color value
  const getColor = (): string => {
    switch (color) {
      case 'secondary':
        return colors.textSecondary;
      case 'tertiary':
        return colors.textTertiary;
      case 'inverse':
        return colors.textInverse;
      case 'accent':
        return colors.accent;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      case 'primary':
      default:
        return colors.textPrimary;
    }
  };

  // Get weight override
  const getWeight = (): TextStyle['fontWeight'] | undefined => {
    if (!weight) return undefined;
    return typography.fontWeight[weight];
  };

  const textStyle: TextStyle = {
    ...getVariantStyles(),
    color: getColor(),
    ...(weight && { fontWeight: getWeight() }),
    ...(align && { textAlign: align }),
  };

  return (
    <RNText style={[textStyle, style]} {...textProps}>
      {children}
    </RNText>
  );
}

// ============================================================================
// Convenience Components
// ============================================================================

export function Heading1(props: Omit<TextProps, 'variant'>) {
  return <Text {...props} variant="h1" />;
}

export function Heading2(props: Omit<TextProps, 'variant'>) {
  return <Text {...props} variant="h2" />;
}

export function Heading3(props: Omit<TextProps, 'variant'>) {
  return <Text {...props} variant="h3" />;
}

export function Heading4(props: Omit<TextProps, 'variant'>) {
  return <Text {...props} variant="h4" />;
}

export function Body(props: Omit<TextProps, 'variant'>) {
  return <Text {...props} variant="body" />;
}

export function Caption(props: Omit<TextProps, 'variant'>) {
  return <Text {...props} variant="caption" color={props.color || 'secondary'} />;
}

export function Label(props: Omit<TextProps, 'variant'>) {
  return <Text {...props} variant="label" color={props.color || 'secondary'} />;
}
