/**
 * Card Component (Web) - Movement & Recovery Companion
 *
 * Web-specific version without react-native-reanimated animations.
 * Respects user's reduced motion preference for WCAG 2.1 Level AAA compliance.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Pressable,
  ViewStyle,
  StyleProp,
  PressableProps,
} from 'react-native';
import { useTheme } from '@/theme';
import { useReducedMotion, getAccessibleTransition } from '@/hooks/useReducedMotion';

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
  haptic: _haptic = true,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const { theme } = useTheme();
  const { prefersReducedMotion } = useReducedMotion();
  const [isPressed, setIsPressed] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const wasKeyboardFocusRef = useRef(false);

  const isInteractive = Boolean(onPress || onLongPress);

  // Track if focus came from keyboard (Tab key)
  useEffect(() => {
    if (!isInteractive) return undefined;

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
  }, [isInteractive]);

  // Get padding value
  const getPadding = (): number => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return theme.components.card.padding.sm;
      case 'lg':
        return theme.components.card.padding.lg;
      case 'md':
      default:
        return theme.components.card.padding.md;
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

  // Handle focus for keyboard navigation (focus-visible behavior)
  const handleFocus = useCallback(() => {
    if (wasKeyboardFocusRef.current) {
      setIsFocusVisible(true);
    }
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocusVisible(false);
  }, []);

  const cardStyle: ViewStyle = {
    borderRadius: theme.components.card.borderRadius,
    padding: getPadding(),
    ...getVariantStyles(),
  };

  // When reduced motion is preferred, skip scale transform and use opacity-only feedback
  const pressedStyle: ViewStyle = isInteractive && isPressed ? {
    transform: prefersReducedMotion ? undefined : [{ scale: 0.98 }],
    opacity: 0.95,
  } : {};

  // Focus ring style for keyboard navigation
  const focusRingStyle = isFocusVisible ? {
    // @ts-ignore - web-specific style
    outline: `${theme.focusRing.width}px solid ${theme.focusRing.color}`,
    outlineOffset: theme.focusRing.offset,
  } : {
    // @ts-ignore - web-specific style
    outline: 'none',
  };

  // Uses accessible transition that respects reduced motion preference
  const webStyle = {
    transition: getAccessibleTransition(
      prefersReducedMotion,
      'transform 0.15s ease, opacity 0.15s ease, outline 0.1s ease'
    ),
    cursor: isInteractive ? 'pointer' : 'default',
    ...focusRingStyle,
  } as unknown as ViewStyle;

  if (isInteractive) {
    return (
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        // @ts-ignore - web-specific handlers
        onFocus={handleFocus}
        onBlur={handleBlur}
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
