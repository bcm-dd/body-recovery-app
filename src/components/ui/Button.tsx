/**
 * Button Component - Movement & Recovery Companion
 *
 * Primary interactive component with haptic feedback.
 * Supports multiple variants and sizes.
 */

import React, { useCallback } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
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

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  haptic?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// ============================================================================
// Component
// ============================================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  haptic = true,
  style,
  textStyle,
  onPress,
  ...pressableProps
}: ButtonProps) {
  const { theme } = useTheme();
  const { trigger } = useHaptics();
  const pressed = useSharedValue(0);

  const isDisabled = disabled || loading;

  // Get variant styles
  const getVariantStyles = useCallback(() => {
    const { colors } = theme;

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isDisabled ? colors.disabledBackground : colors.accent,
          textColor: isDisabled ? colors.disabledText : colors.accentText,
          borderColor: 'transparent',
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          textColor: isDisabled ? colors.disabledText : colors.accent,
          borderColor: isDisabled ? colors.disabledBackground : colors.accent,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          textColor: isDisabled ? colors.disabledText : colors.textPrimary,
          borderColor: 'transparent',
        };
      case 'danger':
        return {
          backgroundColor: isDisabled ? colors.disabledBackground : colors.error,
          textColor: isDisabled ? colors.disabledText : colors.textInverse,
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: colors.accent,
          textColor: colors.accentText,
          borderColor: 'transparent',
        };
    }
  }, [variant, isDisabled, theme]);

  // Get size styles
  const getSizeStyles = useCallback(() => {
    const { components, typography } = theme;

    switch (size) {
      case 'sm':
        return {
          height: components.button.height.sm,
          paddingHorizontal: components.button.paddingHorizontal.sm,
          fontSize: typography.fontSize.sm,
        };
      case 'lg':
        return {
          height: components.button.height.lg,
          paddingHorizontal: components.button.paddingHorizontal.lg,
          fontSize: typography.fontSize.lg,
        };
      case 'md':
      default:
        return {
          height: components.button.height.md,
          paddingHorizontal: components.button.paddingHorizontal.md,
          fontSize: typography.fontSize.base,
        };
    }
  }, [size, theme]);

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  // Animated style for press feedback
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.97]);
    const opacity = interpolate(pressed.value, [0, 1], [1, 0.9]);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Handle press in/out
  const handlePressIn = useCallback(() => {
    pressed.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [pressed]);

  const handlePressOut = useCallback(() => {
    pressed.value = withSpring(0, { damping: 15, stiffness: 300 });
  }, [pressed]);

  // Handle press with haptic
  const handlePress = useCallback(
    (event: any) => {
      if (haptic && !isDisabled) {
        trigger('tap');
      }
      onPress?.(event);
    },
    [haptic, isDisabled, trigger, onPress]
  );

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[
        styles.button,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          height: sizeStyles.height,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderRadius: theme.components.button.borderRadius,
          borderWidth: variant === 'secondary' ? 1.5 : 0,
        },
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.textColor} size="small" />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text
            style={[
              styles.text,
              {
                color: variantStyles.textColor,
                fontSize: sizeStyles.fontSize,
                marginLeft: leftIcon ? 8 : 0,
                marginRight: rightIcon ? 8 : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </AnimatedPressable>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
