/**
 * EmptyState Component - Movement & Recovery Companion
 *
 * Displays a centered message when there is no data to show.
 * Supports icon, title, message, and optional action button.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { Button, ButtonProps } from './Button';

// ============================================================================
// Types
// ============================================================================

export interface EmptyStateAction {
  /** Button title */
  title: string;
  /** Button callback */
  onPress: () => void;
  /** Button variant */
  variant?: ButtonProps['variant'];
}

export interface EmptyStateProps {
  /** Icon component to display at the top */
  icon?: React.ReactNode;
  /** Main title text */
  title: string;
  /** Descriptive message */
  message?: string;
  /** Optional action button */
  action?: EmptyStateAction;
  /** Whether to display in full screen mode (centered in container) */
  fullScreen?: boolean;
  /** Custom container style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export function EmptyState({
  icon,
  title,
  message,
  action,
  fullScreen = false,
  style,
  testID,
}: EmptyStateProps): React.ReactElement {
  const { theme } = useTheme();
  const { spacing } = theme;

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        style,
      ]}
      testID={testID}
      accessibilityRole="text"
      accessibilityLabel={`${title}${message ? `. ${message}` : ''}`}
    >
      {icon && (
        <View style={[styles.iconContainer, { marginBottom: spacing[4] }]}>
          {icon}
        </View>
      )}

      <Text
        variant="h4"
        align="center"
        style={styles.title}
      >
        {title}
      </Text>

      {message && (
        <Text
          variant="body"
          color="secondary"
          align="center"
          style={[styles.message, { marginTop: spacing[2] }]}
        >
          {message}
        </Text>
      )}

      {action && (
        <Button
          title={action.title}
          onPress={action.onPress}
          variant={action.variant ?? 'primary'}
          style={{ marginTop: spacing[6] }}
        />
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
    padding: 24,
  },
  fullScreen: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    maxWidth: 280,
  },
  message: {
    maxWidth: 320,
  },
});
