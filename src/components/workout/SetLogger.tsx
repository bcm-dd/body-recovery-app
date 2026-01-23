/**
 * Set Logger Component - Movement & Recovery Companion
 *
 * Interface for logging weight and reps for a set with haptic dial.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/theme';
import { Text, Button, Card } from '@/components/ui';
import { useHaptics } from '@/hooks';

// ============================================================================
// Types
// ============================================================================

interface SetLoggerProps {
  currentSet: number;
  totalSets: number;
  suggestedWeight?: number;
  suggestedReps: number;
  onComplete: (data: { weight?: number; reps: number }) => void;
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function SetLogger({
  currentSet,
  totalSets,
  suggestedWeight,
  suggestedReps,
  onComplete,
  disabled = false,
}: SetLoggerProps) {
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  const { trigger } = useHaptics();

  const [weight, setWeight] = useState(suggestedWeight);
  const [reps, setReps] = useState(suggestedReps);

  const handleWeightChange = useCallback(
    (delta: number) => {
      trigger('dialTick');
      setWeight((w) => Math.max(0, (w ?? 0) + delta));
    },
    [trigger]
  );

  const handleRepsChange = useCallback(
    (delta: number) => {
      trigger('dialTick');
      setReps((r) => Math.max(1, r + delta));
    },
    [trigger]
  );

  const handleComplete = () => {
    onComplete({ weight, reps });
    // Reset to suggested for next set
    setWeight(suggestedWeight);
    setReps(suggestedReps);
  };

  if (disabled) {
    return (
      <Card variant="default" padding="lg">
        <View style={styles.completedMessage}>
          <Text variant="h4" color="success">
            All Sets Complete
          </Text>
          <Text variant="body" color="secondary" style={{ marginTop: spacing[1] }}>
            Great work! Move to the next exercise.
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg">
      <Text variant="label" color="secondary" align="center">
        Set {currentSet} of {totalSets}
      </Text>

      <View style={styles.loggerRow}>
        {/* Weight */}
        <View style={styles.valueColumn}>
          <Text variant="caption" color="secondary">
            Weight
          </Text>
          <View style={styles.adjusterRow}>
            <Pressable
              style={[styles.adjusterButton, { borderColor: colors.border }]}
              onPress={() => handleWeightChange(-2.5)}
              accessibilityRole="button"
              accessibilityLabel="Decrease weight by 2.5 kg"
            >
              <Text variant="h4" color="accent">
                -
              </Text>
            </Pressable>
            <View style={styles.valueDisplay}>
              <Text variant="h2">{weight ?? '-'}</Text>
              <Text variant="caption" color="secondary">
                kg
              </Text>
            </View>
            <Pressable
              style={[styles.adjusterButton, { borderColor: colors.border }]}
              onPress={() => handleWeightChange(2.5)}
              accessibilityRole="button"
              accessibilityLabel="Increase weight by 2.5 kg"
            >
              <Text variant="h4" color="accent">
                +
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Reps */}
        <View style={styles.valueColumn}>
          <Text variant="caption" color="secondary">
            Reps
          </Text>
          <View style={styles.adjusterRow}>
            <Pressable
              style={[styles.adjusterButton, { borderColor: colors.border }]}
              onPress={() => handleRepsChange(-1)}
              accessibilityRole="button"
              accessibilityLabel="Decrease reps by 1"
            >
              <Text variant="h4" color="accent">
                -
              </Text>
            </Pressable>
            <View style={styles.valueDisplay}>
              <Text variant="h2">{reps}</Text>
              <Text variant="caption" color="secondary">
                reps
              </Text>
            </View>
            <Pressable
              style={[styles.adjusterButton, { borderColor: colors.border }]}
              onPress={() => handleRepsChange(1)}
              accessibilityRole="button"
              accessibilityLabel="Increase reps by 1"
            >
              <Text variant="h4" color="accent">
                +
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Quick adjust buttons */}
      <View style={styles.quickButtons}>
        <Pressable
          style={[styles.quickButton, { backgroundColor: colors.surface }]}
          onPress={() => {
            setWeight(suggestedWeight);
            setReps(suggestedReps);
            trigger('tap');
          }}
          accessibilityRole="button"
          accessibilityLabel="Reset to suggested weight and reps"
        >
          <Text variant="caption" color="secondary">
            Reset
          </Text>
        </Pressable>
        <Pressable
          style={[styles.quickButton, { backgroundColor: colors.surface }]}
          onPress={() => {
            setReps(suggestedReps - 2);
            trigger('tap');
          }}
          accessibilityRole="button"
          accessibilityLabel="Reduce reps by 2"
        >
          <Text variant="caption" color="secondary">
            Fewer reps
          </Text>
        </Pressable>
        <Pressable
          style={[styles.quickButton, { backgroundColor: colors.surface }]}
          onPress={() => {
            handleWeightChange(-5);
          }}
          accessibilityRole="button"
          accessibilityLabel="Reduce weight by 5 kg for drop set"
        >
          <Text variant="caption" color="secondary">
            Drop set
          </Text>
        </Pressable>
      </View>

      <Button
        title="Complete Set"
        variant="primary"
        size="lg"
        fullWidth
        style={{ marginTop: spacing[4] }}
        onPress={handleComplete}
      />
    </Card>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  loggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  valueColumn: {
    alignItems: 'center',
    flex: 1,
  },
  adjusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  adjusterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueDisplay: {
    alignItems: 'center',
    minWidth: 80,
    paddingHorizontal: 12,
  },
  divider: {
    width: 1,
    height: 60,
  },
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  quickButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  completedMessage: {
    alignItems: 'center',
    padding: 16,
  },
});
