/**
 * Workout Execution Screen - Movement & Recovery Companion
 *
 * Full-screen workout mode with exercise cards, set logging,
 * rest timer, and voice/haptic feedback.
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { Text, Button } from '@/components/ui';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { RestTimer } from '@/components/workout/RestTimer';
import { SetLogger } from '@/components/workout/SetLogger';
import { useWorkoutStore } from '@/store';
import { useHaptics } from '@/hooks';

export function WorkoutExecutionScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  const { trigger } = useHaptics();

  // Store state
  const activeWorkout = useWorkoutStore((state) => state.activeWorkout);
  const currentExerciseIndex = useWorkoutStore((state) => state.currentExerciseIndex);
  const getCurrentExercise = useWorkoutStore((state) => state.getCurrentExercise);
  const getWorkoutProgress = useWorkoutStore((state) => state.getWorkoutProgress);
  const getExerciseProgress = useWorkoutStore((state) => state.getExerciseProgress);
  const completeSet = useWorkoutStore((state) => state.completeSet);
  const nextExercise = useWorkoutStore((state) => state.nextExercise);
  const skipExercise = useWorkoutStore((state) => state.skipExercise);
  const completeWorkout = useWorkoutStore((state) => state.completeWorkout);
  const restTimerSeconds = useWorkoutStore((state) => state.restTimerSeconds);
  const restTimerRunning = useWorkoutStore((state) => state.restTimerRunning);

  const currentExercise = getCurrentExercise();
  const workoutProgress = getWorkoutProgress();
  const exerciseProgress = getExerciseProgress();

  // Rest timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (restTimerRunning && restTimerSeconds > 0) {
      interval = setInterval(() => {
        useWorkoutStore.getState().tickRestTimer();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restTimerRunning, restTimerSeconds]);

  // Timer complete haptic
  useEffect(() => {
    if (restTimerSeconds === 0 && !restTimerRunning) {
      // Timer just completed
      trigger('timerComplete');
    } else if (restTimerSeconds === 10 && restTimerRunning) {
      // 10 second warning
      trigger('timerWarning');
    }
  }, [restTimerSeconds, restTimerRunning, trigger]);

  const handleCompleteSet = useCallback(
    (data: { weight?: number; reps: number }) => {
      trigger('setComplete');
      completeSet(data);

      // Check if exercise is complete
      const progress = useWorkoutStore.getState().getExerciseProgress();
      if (progress.completed >= progress.total) {
        trigger('exerciseComplete');
      }
    },
    [trigger, completeSet]
  );

  const handleNextExercise = useCallback(() => {
    trigger('confirm');
    nextExercise();
  }, [trigger, nextExercise]);

  const handleSkipExercise = useCallback(() => {
    trigger('tap');
    skipExercise('preference');
  }, [trigger, skipExercise]);

  const handleCompleteWorkout = useCallback(() => {
    trigger('workoutComplete');
    completeWorkout();
    navigation.goBack();
  }, [trigger, completeWorkout, navigation]);

  const handleClose = useCallback(() => {
    // Show confirmation dialog in production
    navigation.goBack();
  }, [navigation]);

  if (!activeWorkout || !currentExercise) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <Text variant="h3">No Active Workout</Text>
          <Text variant="body" color="secondary" style={{ marginTop: spacing[2] }}>
            Start a workout from the Today screen.
          </Text>
          <Button
            title="Go Back"
            variant="primary"
            style={{ marginTop: spacing[4] }}
            onPress={() => navigation.goBack()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isLastExercise = currentExerciseIndex === activeWorkout.exercises.length - 1;
  const isExerciseComplete = exerciseProgress.completed >= exerciseProgress.total;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleClose} hitSlop={16}>
          <Text variant="body" color="accent">
            Close
          </Text>
        </Pressable>

        <View style={styles.progressContainer}>
          <Text variant="caption" color="secondary">
            {workoutProgress.completed}/{workoutProgress.total} exercises
          </Text>
          <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.accent,
                  width: `${workoutProgress.percentage}%`,
                },
              ]}
            />
          </View>
        </View>

        <Pressable onPress={() => {}} hitSlop={16}>
          <Text variant="body" color="secondary">
            Menu
          </Text>
        </Pressable>
      </View>

      {/* Rest Timer Overlay */}
      {restTimerRunning && restTimerSeconds > 0 && (
        <View style={styles.timerOverlay}>
          <RestTimer
            seconds={restTimerSeconds}
            onSkip={() => useWorkoutStore.getState().resetRestTimer()}
          />
        </View>
      )}

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Exercise */}
        <View style={styles.exerciseSection}>
          <Text variant="label" color="secondary" style={{ marginBottom: spacing[2] }}>
            Current Exercise
          </Text>

          <ExerciseCard
            exerciseId={currentExercise.exerciseId}
            prescription={{
              weight: currentExercise.prescribedWeight,
              reps: currentExercise.prescribedReps,
              sets: currentExercise.prescribedSets,
            }}
            completedSets={currentExercise.completedSets.length}
            expanded
          />
        </View>

        {/* Set Logger */}
        <View style={styles.setLoggerSection}>
          <SetLogger
            currentSet={exerciseProgress.completed + 1}
            totalSets={exerciseProgress.total}
            suggestedWeight={currentExercise.prescribedWeight}
            suggestedReps={currentExercise.prescribedReps}
            onComplete={handleCompleteSet}
            disabled={isExerciseComplete}
          />
        </View>

        {/* Exercise Actions */}
        <View style={styles.actionSection}>
          {isExerciseComplete ? (
            isLastExercise ? (
              <Button
                title="Complete Workout"
                variant="primary"
                size="lg"
                fullWidth
                onPress={handleCompleteWorkout}
              />
            ) : (
              <Button
                title="Next Exercise"
                variant="primary"
                size="lg"
                fullWidth
                onPress={handleNextExercise}
              />
            )
          ) : (
            <View style={styles.exerciseActions}>
              <Button
                title="Skip"
                variant="ghost"
                size="md"
                style={{ flex: 1, marginRight: spacing[2] }}
                onPress={handleSkipExercise}
              />
              <Button
                title="Swap"
                variant="secondary"
                size="md"
                style={{ flex: 1 }}
                onPress={() =>
                  navigation.navigate('ExerciseSwap', { exerciseLogId: currentExercise.id })
                }
              />
            </View>
          )}
        </View>

        {/* Upcoming Exercises */}
        {currentExerciseIndex < activeWorkout.exercises.length - 1 && (
          <View style={styles.upcomingSection}>
            <Text variant="label" color="secondary" style={{ marginBottom: spacing[2] }}>
              Up Next
            </Text>

            {activeWorkout.exercises
              .slice(currentExerciseIndex + 1, currentExerciseIndex + 3)
              .map((exercise, index) => (
                <ExerciseCard
                  key={exercise.id}
                  exerciseId={exercise.exerciseId}
                  prescription={{
                    weight: exercise.prescribedWeight,
                    reps: exercise.prescribedReps,
                    sets: exercise.prescribedSets,
                  }}
                  completedSets={0}
                  style={{ marginBottom: spacing[2], opacity: 0.7 - index * 0.2 }}
                />
              ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  exerciseSection: {
    marginBottom: 24,
  },
  setLoggerSection: {
    marginBottom: 24,
  },
  actionSection: {
    marginBottom: 24,
  },
  exerciseActions: {
    flexDirection: 'row',
  },
  upcomingSection: {
    marginBottom: 24,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
