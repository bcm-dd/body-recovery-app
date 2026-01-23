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
import type { IconFamily } from './Icon';

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
  /** Custom left icon element (takes precedence over leftIconName) */
  leftIcon?: React.ReactNode;
  /** Custom right icon element (takes precedence over rightIconName) */
  rightIcon?: React.ReactNode;
  /** Icon name for left icon (uses Icon component internally) */
  leftIconName?: string;
  /** Icon name for right icon (uses Icon component internally) */
  rightIconName?: string;
  /** Icon family for both left and right icons */
  iconFamily?: IconFamily;
  haptic?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityHint?: string;
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
  leftIconName,
  rightIconName,
  iconFamily = 'material',
  haptic = true,
  style,
  textStyle,
  accessibilityHint,
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

  // Get spring config from theme
  const springConfig = theme.animation.spring.button;

  // Animated style for press feedback - premium 0.96 scale
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.96]);

    return {
      transform: [{ scale }],
    };
  });

  // Handle press in/out with theme spring config
  const handlePressIn = useCallback(() => {
    pressed.value = withSpring(1, springConfig);
  }, [pressed, springConfig]);

  const handlePressOut = useCallback(() => {
    pressed.value = withSpring(0, springConfig);
  }, [pressed, springConfig]);

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
      accessibilityRole="button"
      accessibilityLabel={loading ? `${title}, loading` : title}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      accessibilityHint={accessibilityHint}
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
