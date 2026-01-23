/**
 * Button Component (Web) - Movement & Recovery Companion
 *
 * Web-specific version without react-native-reanimated animations.
 * Uses CSS transitions for press feedback.
 * Respects user's reduced motion preference for WCAG 2.1 Level AAA compliance.
 */

import React, { useCallback, useState, useRef, useEffect } from 'react';
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
import { useReducedMotion, getAccessibleTransition } from '@/hooks/useReducedMotion';

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
  const { prefersReducedMotion } = useReducedMotion();
  const [isPressed, setIsPressed] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const wasKeyboardFocusRef = useRef(false);

  const isDisabled = disabled || loading;

  // Track if focus came from keyboard (Tab key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        wasKeyboardFocusRef.current = true;
      }
    };
    const handleMouseDown = () => {
      wasKeyboardFocusRef.current = false;
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('mousedown', handleMouseDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('mousedown', handleMouseDown);
      };
    }
    return undefined;
  }, []);

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

  // Handle focus for keyboard navigation (focus-visible behavior)
  const handleFocus = useCallback(() => {
    if (wasKeyboardFocusRef.current) {
      setIsFocusVisible(true);
    }
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocusVisible(false);
  }, []);

  // Handle press
  const handlePress = useCallback(
    (event: any) => {
      onPress?.(event);
    },
    [onPress]
  );

  // Focus ring style for keyboard navigation
  const focusRingStyle = isFocusVisible && !isDisabled ? {
    // @ts-ignore - web-specific style
    outline: `${theme.focusRing.width}px solid ${theme.focusRing.color}`,
    outlineOffset: theme.focusRing.offset,
  } : {
    // @ts-ignore - web-specific style
    outline: 'none',
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      // @ts-ignore - web-specific handlers
      onFocus={handleFocus}
      onBlur={handleBlur}
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
          // When reduced motion is preferred, skip scale transform entirely
          // and use opacity-only feedback for a more accessible experience
          transform: prefersReducedMotion ? undefined : [{ scale: isPressed ? 0.97 : 1 }],
          opacity: isPressed ? 0.9 : 1,
          // @ts-ignore - web-specific style
          // Use accessible transition that respects reduced motion preference
          transition: getAccessibleTransition(
            prefersReducedMotion,
            'transform 0.15s ease, opacity 0.15s ease, outline 0.1s ease'
          ),
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          ...focusRingStyle,
        } as ViewStyle,
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
                marginLeft: leftIcon ? theme.spacing[2] : 0,
                marginRight: rightIcon ? theme.spacing[2] : 0,
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
