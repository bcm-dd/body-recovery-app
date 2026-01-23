/**
 * Button Component (Web) - Movement & Recovery Companion
 *
 * Web-specific version without react-native-reanimated animations.
 * Uses CSS transitions for press feedback.
 */

import React, { useCallback, useState } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  PressableProps,
} from 'react-native';
import { useTheme } from '@/theme';

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
  accessibilityHint?: string;
}

// ============================================================================
// Component
// ============================================================================

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
  accessibilityHint,
  onPress,
  ...pressableProps
}: ButtonProps) {
  const { theme } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

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

  // Handle press in/out
  const handlePressIn = useCallback(() => {
    setIsPressed(true);
  }, []);

  const handlePressOut = useCallback(() => {
    setIsPressed(false);
  }, []);

  // Handle press
  const handlePress = useCallback(
    (event: any) => {
      onPress?.(event);
    },
    [onPress]
  );

  return (
    <Pressable
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
          transform: [{ scale: isPressed ? 0.97 : 1 }],
          opacity: isPressed ? 0.9 : 1,
          // @ts-ignore - web-specific style
          transition: 'transform 0.1s ease, opacity 0.1s ease',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
        },
        fullWidth && styles.fullWidth,
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
    </Pressable>
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
