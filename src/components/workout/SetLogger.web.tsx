/**
 * Set Logger Component (Web) - Movement & Recovery Companion
 *
 * Web-specific version without haptic feedback.
 * Uses CSS transitions for button press feedback.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { Text, Button, Card } from '@/components/ui';

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

  const [weight, setWeight] = useState(suggestedWeight);
  const [reps, setReps] = useState(suggestedReps);

  const handleWeightChange = useCallback(
    (delta: number) => {
      setWeight((w) => Math.max(0, (w ?? 0) + delta));
    },
    []
  );

  const handleRepsChange = useCallback(
    (delta: number) => {
      setReps((r) => Math.max(1, r + delta));
    },
    []
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
            <AdjusterButton
              label="-"
              onPress={() => handleWeightChange(-2.5)}
              accessibilityLabel="Decrease weight by 2.5 kg"
              colors={colors}
            />
            <View style={styles.valueDisplay}>
              <Text variant="h2">{weight ?? '-'}</Text>
              <Text variant="caption" color="secondary">
                kg
              </Text>
            </View>
            <AdjusterButton
              label="+"
              onPress={() => handleWeightChange(2.5)}
              accessibilityLabel="Increase weight by 2.5 kg"
              colors={colors}
            />
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
            <AdjusterButton
              label="-"
              onPress={() => handleRepsChange(-1)}
              accessibilityLabel="Decrease reps by 1"
              colors={colors}
            />
            <View style={styles.valueDisplay}>
              <Text variant="h2">{reps}</Text>
              <Text variant="caption" color="secondary">
                reps
              </Text>
            </View>
            <AdjusterButton
              label="+"
              onPress={() => handleRepsChange(1)}
              accessibilityLabel="Increase reps by 1"
              colors={colors}
            />
          </View>
        </View>
      </View>

      {/* Quick adjust buttons */}
      <View style={styles.quickButtons}>
        <QuickButton
          label="Reset"
          onPress={() => {
            setWeight(suggestedWeight);
            setReps(suggestedReps);
          }}
          accessibilityLabel="Reset to suggested weight and reps"
          colors={colors}
        />
        <QuickButton
          label="Fewer reps"
          onPress={() => {
            setReps(suggestedReps - 2);
          }}
          accessibilityLabel="Reduce reps by 2"
          colors={colors}
        />
        <QuickButton
          label="Drop set"
          onPress={() => {
            handleWeightChange(-5);
          }}
          accessibilityLabel="Reduce weight by 5 kg for drop set"
          colors={colors}
        />
      </View>

      <Button
        title="Complete Set"
        variant="primary"
        size="lg"
        fullWidth
        style={{ marginTop: spacing[4] } as ViewStyle}
        onPress={handleComplete}
      />
    </Card>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface AdjusterButtonProps {
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
  colors: any;
}

function AdjusterButton({ label, onPress, accessibilityLabel, colors }: AdjusterButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable
      style={[
        styles.adjusterButton,
        {
          borderColor: colors.border,
          transform: [{ scale: isPressed ? 0.95 : 1 }],
          // @ts-ignore - web-specific
          transition: 'transform 0.1s ease',
          cursor: 'pointer',
        } as ViewStyle,
      ]}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Text variant="h4" color="accent">
        {label}
      </Text>
    </Pressable>
  );
}

interface QuickButtonProps {
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
  colors: any;
}

function QuickButton({ label, onPress, accessibilityLabel, colors }: QuickButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable
      style={[
        styles.quickButton,
        {
          backgroundColor: colors.surface,
          transform: [{ scale: isPressed ? 0.95 : 1 }],
          // @ts-ignore - web-specific
          transition: 'transform 0.1s ease, background-color 0.1s ease',
          cursor: 'pointer',
        } as ViewStyle,
      ]}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Text variant="caption" color="secondary">
        {label}
      </Text>
    </Pressable>
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
