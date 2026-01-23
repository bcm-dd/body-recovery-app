/**
 * LoadingState Component (Web) - Movement & Recovery Companion
 *
 * Web-specific version with CSS animation spinner.
 * Uses keyframe animations instead of ActivityIndicator.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
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
// CSS Spinner Component
// ============================================================================

interface SpinnerProps {
  size: number;
  color: string;
}

function Spinner({ size, color }: SpinnerProps): React.ReactElement {
  // Inject CSS animation if not already present
  React.useEffect(() => {
    const styleId = 'loading-state-spinner-styles';
    if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes loading-spinner-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .loading-spinner {
          animation: loading-spinner-rotate 1s linear infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <View
      // @ts-ignore - web-specific className
      className="loading-spinner"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: size * 0.1,
        borderColor: `${color}30`,
        borderTopColor: color,
        // @ts-ignore - web-specific style
        boxSizing: 'border-box',
      }}
    />
  );
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

  // Map size to spinner dimensions
  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          spinnerSize: 24,
          minHeight: 48,
          fontSize: 'caption' as const,
        };
      case 'lg':
        return {
          spinnerSize: 48,
          minHeight: 120,
          fontSize: 'body' as const,
        };
      case 'md':
      default:
        return {
          spinnerSize: 36,
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
      aria-busy={true}
    >
      <Spinner size={sizeConfig.spinnerSize} color={colors.accent} />
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
