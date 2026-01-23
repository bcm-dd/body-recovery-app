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

    const { colors, components, spacing, typography } = theme;

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
              // @ts-ignore - web-specific style
              transition: 'border-color 0.15s ease, border-width 0.15s ease',
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
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
