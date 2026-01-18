/**
 * Input Component - Movement & Recovery Companion
 *
 * Text input component with various states and validation.
 */

import React, { useState, useCallback, forwardRef } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { Text } from './Text';

// ============================================================================
// Types
// ============================================================================

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

// ============================================================================
// Component
// ============================================================================

const AnimatedView = Animated.createAnimatedComponent(View);

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconPress,
      disabled = false,
      containerStyle,
      onFocus,
      onBlur,
      ...textInputProps
    },
    ref
  ) => {
    const { theme, isDark } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useSharedValue(0);

    const { colors, components, borderRadius, spacing, typography } = theme;

    const handleFocus = useCallback(
      (e: any) => {
        setIsFocused(true);
        focusAnim.value = withTiming(1, { duration: 150 });
        onFocus?.(e);
      },
      [focusAnim, onFocus]
    );

    const handleBlur = useCallback(
      (e: any) => {
        setIsFocused(false);
        focusAnim.value = withTiming(0, { duration: 150 });
        onBlur?.(e);
      },
      [focusAnim, onBlur]
    );

    // Determine border color based on state
    const getBorderColor = () => {
      if (error) return colors.error;
      if (isFocused) return colors.borderFocused;
      return colors.border;
    };

    // Animated border style
    const animatedBorderStyle = useAnimatedStyle(() => {
      return {
        borderColor: getBorderColor(),
        borderWidth: isFocused ? 2 : components.input.borderWidth,
      };
    });

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text
            variant="bodySmall"
            weight="medium"
            color={error ? 'error' : 'secondary'}
            style={styles.label}
          >
            {label}
          </Text>
        )}

        <AnimatedView
          style={[
            styles.inputContainer,
            {
              backgroundColor: disabled ? colors.disabledBackground : colors.surface,
              borderRadius: components.input.borderRadius,
              height: components.input.height,
            },
            animatedBorderStyle,
          ]}
        >
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: disabled ? colors.disabledText : colors.textPrimary,
                fontSize: typography.fontSize.base,
                paddingHorizontal: components.input.paddingHorizontal,
                paddingLeft: leftIcon ? spacing[2] : components.input.paddingHorizontal,
                paddingRight: rightIcon ? spacing[2] : components.input.paddingHorizontal,
              },
            ]}
            placeholderTextColor={colors.textTertiary}
            editable={!disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...textInputProps}
          />

          {rightIcon && (
            <Pressable
              onPress={onRightIconPress}
              style={styles.rightIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {rightIcon}
            </Pressable>
          )}
        </AnimatedView>

        {(error || hint) && (
          <Text
            variant="caption"
            color={error ? 'error' : 'tertiary'}
            style={styles.helperText}
          >
            {error || hint}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: '100%',
  },
  leftIcon: {
    paddingLeft: 12,
  },
  rightIcon: {
    paddingRight: 12,
  },
  helperText: {
    marginTop: 4,
  },
});
