/**
 * Input Component (Web) - Movement & Recovery Companion
 *
 * Web-specific version without react-native-reanimated animations.
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
import { useTheme, spacing } from '@/theme';
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
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const { colors, components, spacing, typography, focusRing } = theme;

    const handleFocus = useCallback(
      (e: any) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: any) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur]
    );

    // Determine border color based on state
    const getBorderColor = () => {
      if (error) return colors.error;
      if (isFocused) return colors.borderFocused;
      return colors.border;
    };

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

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: disabled ? colors.disabledBackground : colors.surface,
              borderRadius: components.input.borderRadius,
              height: components.input.height,
              borderColor: getBorderColor(),
              borderWidth: isFocused ? 2 : components.input.borderWidth,
              // @ts-ignore - web-specific style (uses animation.duration.fast = 150ms)
              transition: 'border-color 0.15s ease, border-width 0.15s ease, outline 0.1s ease',
              // Focus ring for keyboard navigation
              // @ts-ignore - web-specific style
              outline: isFocused && !disabled ? `${focusRing.width}px solid ${focusRing.color}` : 'none',
              outlineOffset: focusRing.offset,
            },
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
                // @ts-ignore - web-specific style
                outlineStyle: 'none',
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
              hitSlop={{ top: spacing[2.5], bottom: spacing[2.5], left: spacing[2.5], right: spacing[2.5] }}
            >
              {rightIcon}
            </Pressable>
          )}
        </View>

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
    marginBottom: spacing[1.5],
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
    paddingLeft: spacing[3],
  },
  rightIcon: {
    paddingRight: spacing[3],
  },
  helperText: {
    marginTop: spacing[1],
  },
});
