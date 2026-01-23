/**
 * LoadingState Component - Movement & Recovery Companion
 *
 * Displays a loading indicator with optional message.
 * Use for asynchronous operations and data fetching states.
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

// ============================================================================
// Types
// ============================================================================

export type LoadingStateSize = 'sm' | 'md' | 'lg';

export interface LoadingStateProps {
  /** Size of the loading indicator */
  size?: LoadingStateSize;
  /** Optional message to display below the indicator */
  message?: string;
  /** Whether to display in full screen mode (centered in container) */
  fullScreen?: boolean;
  /** Custom container style */
  style?: ViewStyle;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
}

// ============================================================================
// Component
// ============================================================================

export function LoadingState({
  size = 'md',
  message,
  fullScreen = false,
  style,
  accessibilityLabel = 'Loading',
}: LoadingStateProps): React.ReactElement {
  const { theme } = useTheme();
  const { colors, spacing } = theme;

  // Map size to ActivityIndicator size and container dimensions
  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          indicatorSize: 'small' as const,
          minHeight: 48,
          fontSize: 'caption' as const,
        };
      case 'lg':
        return {
          indicatorSize: 'large' as const,
          minHeight: 120,
          fontSize: 'body' as const,
        };
      case 'md':
      default:
        return {
          indicatorSize: 'large' as const,
          minHeight: 80,
          fontSize: 'bodySmall' as const,
        };
    }
  };

  const sizeConfig = getSizeConfig();

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { minHeight: sizeConfig.minHeight },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: true }}
    >
      <ActivityIndicator
        size={sizeConfig.indicatorSize}
        color={colors.accent}
      />
      {message && (
        <Text
          variant={sizeConfig.fontSize}
          color="secondary"
          align="center"
          style={{ marginTop: spacing[3] }}
        >
          {message}
        </Text>
      )}
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  fullScreen: {
    flex: 1,
  },
});
