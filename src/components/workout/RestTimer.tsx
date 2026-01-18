/**
 * Rest Timer Component - Movement & Recovery Companion
 *
 * Circular countdown timer with haptic feedback for rest periods.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/theme';
import { Text, Button } from '@/components/ui';

// ============================================================================
// Types
// ============================================================================

interface RestTimerProps {
  seconds: number;
  totalSeconds?: number;
  onSkip?: () => void;
  onAdd30?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function RestTimer({
  seconds,
  totalSeconds = 90,
  onSkip,
  onAdd30,
}: RestTimerProps) {
  const { theme } = useTheme();
  const { colors, components, spacing } = theme;

  const size = components.restTimer.size;
  const strokeWidth = components.restTimer.strokeWidth;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = seconds / totalSeconds;
  const strokeDashoffset = circumference * (1 - progress);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (seconds <= 10) return colors.warning;
    if (seconds <= 5) return colors.error;
    return colors.accent;
  };

  return (
    <View style={styles.container}>
      <Text variant="h4" color="secondary" style={{ marginBottom: spacing[4] }}>
        Rest
      </Text>

      <View style={[styles.timerContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.surface}
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getTimerColor()}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>

        <View style={styles.timerContent}>
          <Text variant="h1" style={{ color: getTimerColor(), fontSize: 56 }}>
            {formatTime(seconds)}
          </Text>
          <Text variant="caption" color="secondary">
            until next set
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="+30s"
          variant="ghost"
          size="md"
          style={{ marginRight: spacing[2] }}
          onPress={onAdd30}
        />
        <Button
          title="Skip Rest"
          variant="secondary"
          size="md"
          onPress={onSkip}
        />
      </View>
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
  timerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 32,
  },
});
