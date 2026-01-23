/**
 * Card Component (Web) - Movement & Recovery Companion
 *
 * Web-specific version without react-native-reanimated animations.
 */

import React, { useState } from 'react';
import {
  View,
  Pressable,
  ViewStyle,
  StyleProp,
  PressableProps,
} from 'react-native';
import { useTheme } from '@/theme';

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
  const { theme, isDark } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

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

  // Get variant styles
  const getVariantStyles = (): ViewStyle => {
    const { colors, shadows } = theme;

    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.elevated,
          ...(isDark ? {} : shadows.md),
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

  const handlePressIn = () => {
    if (isInteractive) {
      setIsPressed(true);
    }
  };

  const handlePressOut = () => {
    if (isInteractive) {
      setIsPressed(false);
    }
  };

  const handlePress = (event: any) => {
    onPress?.(event);
  };

  const handleLongPress = (event: any) => {
    onLongPress?.(event);
  };

  const cardStyle: ViewStyle = {
    borderRadius: theme.components.card.borderRadius,
    padding: getPadding(),
    ...getVariantStyles(),
  };

  const pressedStyle: ViewStyle = isInteractive && isPressed ? {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  } : {};

  const webStyle = {
    // @ts-ignore - web-specific style
    transition: 'transform 0.1s ease, opacity 0.1s ease',
    cursor: isInteractive ? 'pointer' : 'default',
  };

  if (isInteractive) {
    return (
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[cardStyle, pressedStyle, webStyle, style]}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        {children}
      </Pressable>
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
