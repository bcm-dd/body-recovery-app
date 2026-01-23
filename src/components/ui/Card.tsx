/**
 * Card Component - Movement & Recovery Companion
 *
 * Container component for grouping related content.
 * Supports multiple variants and interactive states.
 */

import React from 'react';
import {
  View,
  Pressable,
  ViewStyle,
  StyleProp,
  PressableProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { useHaptics } from '@/hooks/useHaptics';

// ============================================================================
// Types
// ============================================================================

export type CardVariant = 'default' | 'elevated' | 'outlined';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: PressableProps['onPress'];
  onLongPress?: PressableProps['onLongPress'];
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

// ============================================================================
// Component
// ============================================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  onPress,
  onLongPress,
  haptic = true,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const { theme } = useTheme();
  const { trigger } = useHaptics();
  const pressed = useSharedValue(0);

  const isInteractive = Boolean(onPress || onLongPress);

  // Get padding value
  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return theme.spacing[2];
      case 'lg':
        return theme.spacing[6];
      case 'md':
      default:
        return theme.components.card.padding;
    }
  };

  // Get variant styles (shadows are now theme-aware)
  const getVariantStyles = (): ViewStyle => {
    const { colors, shadows } = theme;

    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.elevated,
          ...shadows.md,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.card,
        };
    }
  };

  // Animated style for press feedback
  const animatedStyle = useAnimatedStyle(() => {
    if (!isInteractive) return {};

    const scale = interpolate(pressed.value, [0, 1], [1, 0.98]);
    const opacity = interpolate(pressed.value, [0, 1], [1, 0.95]);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const handlePressIn = () => {
    if (isInteractive) {
      pressed.value = withSpring(1, { damping: 20, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    if (isInteractive) {
      pressed.value = withSpring(0, { damping: 20, stiffness: 400 });
    }
  };

  const handlePress = (event: any) => {
    if (haptic && onPress) {
      trigger('tap');
    }
    onPress?.(event);
  };

  const handleLongPress = (event: any) => {
    if (haptic && onLongPress) {
      trigger('confirm');
    }
    onLongPress?.(event);
  };

  const cardStyle: ViewStyle = {
    borderRadius: theme.components.card.borderRadius,
    padding: getPadding(),
    ...getVariantStyles(),
  };

  if (isInteractive) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[cardStyle, animatedStyle, style]}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View style={[cardStyle, style]} testID={testID}>
      {children}
    </View>
  );
}

// ============================================================================
// Convenience Components
// ============================================================================

export function ElevatedCard(props: Omit<CardProps, 'variant'>) {
  return <Card {...props} variant="elevated" />;
}

export function OutlinedCard(props: Omit<CardProps, 'variant'>) {
  return <Card {...props} variant="outlined" />;
}
