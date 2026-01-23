/**
 * Skeleton Component - Movement & Recovery Companion
 *
 * Animated loading placeholder with shimmer effect.
 * Use for content that is loading to show layout preview.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';

// ============================================================================
// Types
// ============================================================================

export type SkeletonVariant = 'text' | 'circle' | 'rect';

export interface SkeletonProps {
  /** Width of the skeleton. Can be number or string (e.g., '100%') */
  width?: DimensionValue;
  /** Height of the skeleton */
  height?: number;
  /** Shape variant */
  variant?: SkeletonVariant;
  /** Border radius (overrides variant default) */
  borderRadius?: number;
  /** Custom container style */
  style?: ViewStyle;
  /** Whether to animate the shimmer effect */
  animated?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function Skeleton({
  width = '100%',
  height = 16,
  variant = 'text',
  borderRadius: customBorderRadius,
  style,
  animated = true,
}: SkeletonProps): React.ReactElement {
  const { theme } = useTheme();
  const { colors, borderRadius: themeBorderRadius } = theme;

  // Animation value for shimmer effect
  const shimmer = useSharedValue(0);

  // Start shimmer animation on mount
  useEffect(() => {
    if (animated) {
      shimmer.value = withRepeat(
        withTiming(1, {
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
        }),
        -1, // Repeat indefinitely
        false // Don't reverse
      );
    }
  }, [animated, shimmer]);

  // Calculate border radius based on variant
  const getBorderRadius = () => {
    if (customBorderRadius !== undefined) {
      return customBorderRadius;
    }

    switch (variant) {
      case 'circle':
        return typeof height === 'number' ? height / 2 : 9999;
      case 'text':
        return themeBorderRadius.sm;
      case 'rect':
      default:
        return themeBorderRadius.md;
    }
  };

  // For circle variant, ensure width equals height
  const finalWidth = variant === 'circle' ? height : width;

  // Animated style for shimmer effect
  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      shimmer.value,
      [0, 0.5, 1],
      [0.3, 0.6, 0.3]
    );

    return {
      opacity,
    };
  });

  const containerStyle: ViewStyle = {
    width: finalWidth,
    height,
    borderRadius: getBorderRadius(),
    backgroundColor: colors.border,
    overflow: 'hidden',
  };

  return (
    <View
      style={[containerStyle, style]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading content"
      accessibilityState={{ busy: true }}
    >
      <Animated.View
        style={[
          styles.shimmer,
          { backgroundColor: colors.surface },
          animated && animatedStyle,
        ]}
      />
    </View>
  );
}

// ============================================================================
// Convenience Components
// ============================================================================

/**
 * Text skeleton with default height for single line text
 */
export function SkeletonText({
  width = '100%',
  height = 16,
  ...props
}: Omit<SkeletonProps, 'variant'>): React.ReactElement {
  return <Skeleton {...props} width={width} height={height} variant="text" />;
}

/**
 * Circle skeleton, useful for avatars
 */
export function SkeletonCircle({
  size = 40,
  ...props
}: Omit<SkeletonProps, 'variant' | 'width' | 'height'> & { size?: number }): React.ReactElement {
  return <Skeleton {...props} width={size} height={size} variant="circle" />;
}

/**
 * Rectangle skeleton, useful for cards and images
 */
export function SkeletonRect({
  width = '100%',
  height = 100,
  ...props
}: Omit<SkeletonProps, 'variant'>): React.ReactElement {
  return <Skeleton {...props} width={width} height={height} variant="rect" />;
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  shimmer: {
    ...StyleSheet.absoluteFillObject,
  },
});
