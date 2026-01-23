/**
 * Skeleton Component (Web) - Movement & Recovery Companion
 *
 * Web-specific version with CSS animation shimmer effect.
 * Uses keyframe animations instead of react-native-reanimated.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
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

  // Inject CSS animation if not already present
  useEffect(() => {
    const styleId = 'skeleton-shimmer-styles';
    if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = `
        @keyframes skeleton-shimmer {
          0% { opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; }
        }
        .skeleton-animated {
          animation: skeleton-shimmer 1.2s ease-in-out infinite;
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);

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

  const containerStyle: ViewStyle = {
    width: finalWidth,
    height,
    borderRadius: getBorderRadius(),
    backgroundColor: colors.border,
    overflow: 'hidden',
  };

  return (
    <View
      // @ts-ignore - web-specific className
      className={animated ? 'skeleton-animated' : undefined}
      style={[containerStyle, style]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading content"
      // @ts-ignore - web-specific
      aria-busy="true"
    >
      <View
        style={[
          styles.shimmer,
          { backgroundColor: colors.surface },
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
