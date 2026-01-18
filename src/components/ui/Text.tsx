/**
 * Text Component - Movement & Recovery Companion
 *
 * Typography component with semantic variants.
 * Automatically adapts to theme.
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
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
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
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

  // Get variant styles
  const getVariantStyles = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: typography.fontSize['4xl'],
          fontWeight: typography.fontWeight.bold,
          lineHeight: typography.fontSize['4xl'] * typography.lineHeight.tight,
          letterSpacing: typography.letterSpacing.tight,
        };
      case 'h2':
        return {
          fontSize: typography.fontSize['3xl'],
          fontWeight: typography.fontWeight.bold,
          lineHeight: typography.fontSize['3xl'] * typography.lineHeight.tight,
          letterSpacing: typography.letterSpacing.tight,
        };
      case 'h3':
        return {
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.semibold,
          lineHeight: typography.fontSize['2xl'] * typography.lineHeight.tight,
        };
      case 'h4':
        return {
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.semibold,
          lineHeight: typography.fontSize.xl * typography.lineHeight.tight,
        };
      case 'bodySmall':
        return {
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.normal,
          lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
        };
      case 'caption':
        return {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.normal,
          lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
        };
      case 'label':
        return {
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          lineHeight: typography.fontSize.sm * typography.lineHeight.tight,
          textTransform: 'uppercase',
          letterSpacing: typography.letterSpacing.wide,
        };
      case 'button':
        return {
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          lineHeight: typography.fontSize.base * typography.lineHeight.tight,
        };
      case 'body':
      default:
        return {
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.normal,
          lineHeight: typography.fontSize.base * typography.lineHeight.normal,
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
