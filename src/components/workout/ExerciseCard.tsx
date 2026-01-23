/**
 * Exercise Card Component - Movement & Recovery Companion
 *
 * Displays exercise information with prescription, completion state,
 * and expandable details.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { Text, Card } from '@/components/ui';
import { useHaptics } from '@/hooks';

// ============================================================================
// Types
// ============================================================================

interface ExerciseCardProps {
  exerciseId: string;
  prescription: {
    weight?: number;
    reps: number;
    sets: number;
  };
  completedSets: number;
  expanded?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
}

// Demo exercise data (in production, would fetch from store/API)
const DEMO_EXERCISES: Record<string, { name: string; muscles: string[]; cues: string[] }> = {
  'bench_press': {
    name: 'Barbell Bench Press',
    muscles: ['Chest', 'Triceps', 'Front Delts'],
    cues: ['Keep shoulder blades pinched', 'Bar path slightly diagonal', 'Drive feet into floor'],
  },
  'bent_over_row': {
    name: 'Bent Over Row',
    muscles: ['Upper Back', 'Lats', 'Biceps'],
    cues: ['Hinge at hips, flat back', 'Pull to lower chest', 'Squeeze at the top'],
  },
  'squat': {
    name: 'Barbell Squat',
    muscles: ['Quads', 'Glutes', 'Core'],
    cues: ['Brace core before descent', 'Knees track over toes', 'Drive through whole foot'],
  },
  'deadlift': {
    name: 'Deadlift',
    muscles: ['Hamstrings', 'Glutes', 'Lower Back'],
    cues: ['Bar close to shins', 'Push floor away', 'Lock out hips at top'],
  },
  'overhead_press': {
    name: 'Overhead Press',
    muscles: ['Front Delts', 'Triceps', 'Core'],
    cues: ['Squeeze glutes', 'Press straight up', 'Head through at top'],
  },
  'default': {
    name: 'Exercise',
    muscles: ['Target Muscle'],
    cues: ['Maintain good form'],
  },
};

// ============================================================================
// Component
// ============================================================================

export function ExerciseCard({
  exerciseId,
  prescription,
  completedSets,
  expanded: initialExpanded = false,
  onPress,
  onLongPress,
  style,
}: ExerciseCardProps) {
  const { theme } = useTheme();
  const { colors, spacing, components } = theme;
  const { trigger } = useHaptics();

  const [expanded, setExpanded] = useState(initialExpanded);
  const expandAnim = useSharedValue(initialExpanded ? 1 : 0);

  const exercise = DEMO_EXERCISES[exerciseId] || DEMO_EXERCISES['default'];
  const isComplete = completedSets >= prescription.sets;
  const progress = completedSets / prescription.sets;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      trigger('tap');
      setExpanded(!expanded);
      expandAnim.value = withSpring(expanded ? 0 : 1, {
        damping: 15,
        stiffness: 150,
      });
    }
  };

  const expandedStyle = useAnimatedStyle(() => {
    return {
      opacity: expandAnim.value,
      maxHeight: interpolate(expandAnim.value, [0, 1], [0, 200]),
    };
  });

  return (
    <Card
      variant={isComplete ? 'default' : 'elevated'}
      padding="none"
      onPress={handlePress}
      onLongPress={onLongPress}
      style={[
        {
          opacity: isComplete ? 0.7 : 1,
        },
        style,
      ]}
    >
      {/* Progress indicator */}
      {!isComplete && (
        <View
          style={[
            styles.progressBar,
            { backgroundColor: `${colors.accent}30` },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.accent,
                width: `${progress * 100}%`,
              },
            ]}
          />
        </View>
      )}

      <View style={[styles.content, { padding: components.exerciseCard.padding }]}>
        {/* Main content row */}
        <View style={styles.mainRow}>
          <View style={styles.exerciseInfo}>
            <Text variant="body" weight="semibold">
              {exercise.name}
            </Text>
            <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
              {exercise.muscles.join(' • ')}
            </Text>
          </View>

          <View style={styles.prescription}>
            {prescription.weight && (
              <Text variant="h4">{prescription.weight}kg</Text>
            )}
            <Text variant="bodySmall" color="secondary">
              {prescription.reps} × {prescription.sets}
            </Text>
          </View>
        </View>

        {/* Set indicators */}
        <View style={styles.setIndicators}>
          {Array.from({ length: prescription.sets }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.setDot,
                {
                  backgroundColor:
                    index < completedSets
                      ? colors.success
                      : colors.surface,
                  borderColor:
                    index < completedSets
                      ? colors.success
                      : colors.border,
                },
              ]}
            />
          ))}
          <Text variant="caption" color="secondary" style={{ marginLeft: 8 }}>
            {completedSets}/{prescription.sets} sets
          </Text>
        </View>

        {/* Expanded content */}
        {expanded && (
          <Animated.View style={[styles.expandedContent, expandedStyle]}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <Text variant="label" color="secondary" style={{ marginBottom: spacing[1] }}>
              Cues
            </Text>
            {exercise.cues.map((cue, index) => (
              <Text
                key={index}
                variant="bodySmall"
                color="secondary"
                style={{ marginBottom: 4 }}
              >
                • {cue}
              </Text>
            ))}
          </Animated.View>
        )}
      </View>

      {/* Complete indicator */}
      {isComplete && (
        <View style={[styles.completeOverlay, { backgroundColor: `${colors.success}15` }]}>
          <Text variant="label" color="success">
            Complete
          </Text>
        </View>
      )}
    </Card>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  progressBar: {
    height: 3,
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  content: {},
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseInfo: {
    flex: 1,
  },
  prescription: {
    alignItems: 'flex-end',
  },
  setIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  setDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    marginRight: 6,
  },
  expandedContent: {
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
  completeOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 12,
  },
});
