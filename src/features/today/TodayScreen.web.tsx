/**
 * Today Screen (Web) - Movement & Recovery Companion
 *
 * Simplified web version without SafeAreaView issues.
 */

import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { Text, Card, Button, LoadingState, EmptyState, Skeleton, SkeletonText } from '@/components/ui';
import { ReadinessRing } from '@/components/readiness/ReadinessRing';
import { useReadinessStore, useWorkoutStore, useBodyModelStore } from '@/store';
import { useHaptics } from '@/hooks';
import type { MainTabScreenProps } from '@/navigation/types';

export function TodayScreen() {
  const navigation = useNavigation<MainTabScreenProps<'Today'>['navigation']>();
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  const { trigger } = useHaptics();

  // Store state
  const readiness = useReadinessStore((state) => state.currentReadiness);
  const readinessLoading = useReadinessStore((state) => state.isLoading);
  const calculateReadiness = useReadinessStore((state) => state.calculateReadiness);
  const activeInjuries = useBodyModelStore((state) => state.getActiveInjuries());
  const activeWorkout = useWorkoutStore((state) => state.activeWorkout);
  const workoutLoading = useWorkoutStore((state) => state.isLoading);

  const [_refreshing, _setRefreshing] = useState(false);
  const [hasScheduledWorkout, _setHasScheduledWorkout] = useState(true);

  // Calculate readiness on mount
  useEffect(() => {
    calculateReadiness(activeInjuries.length);
  }, [calculateReadiness, activeInjuries.length]);

  const handleStartWorkout = () => {
    trigger('confirm');
    navigation.navigate('WorkoutExecution', { workoutId: 'demo-workout' });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getReadinessMessage = () => {
    if (!readiness) return 'Calculating your readiness...';

    switch (readiness.recommendation) {
      case 'full':
        return "You're ready for a full session";
      case 'moderate':
        return 'A moderate session is recommended';
      case 'light':
        return 'Take it easy today';
      case 'rest':
        return 'Rest day recommended';
      default:
        return '';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h3">{getGreeting()}</Text>
          <Text variant="body" color="secondary" style={{ marginTop: spacing[1] }}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Readiness Ring */}
        <View style={styles.readinessContainer}>
          {readinessLoading ? (
            <LoadingState
              size="lg"
              message="Calculating your readiness..."
            />
          ) : (
            <>
              <ReadinessRing
                score={readiness?.score ?? 0}
                factors={readiness?.factors}
                recommendation={readiness?.recommendation ?? 'moderate'}
              />
              <Text
                variant="body"
                color="secondary"
                align="center"
                style={{ marginTop: spacing[4] }}
              >
                {getReadinessMessage()}
              </Text>
            </>
          )}
        </View>

        {/* Active Injuries Alert */}
        {activeInjuries.length > 0 && (
          <Card
            variant="outlined"
            style={[styles.alertCard, { borderColor: colors.warning }]}
            onPress={() => navigation.navigate('Body')}
          >
            <View style={styles.alertContent}>
              <Text variant="bodySmall" weight="semibold" color="warning">
                {activeInjuries.length} active injury concern{activeInjuries.length > 1 ? 's' : ''}
              </Text>
              <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                Tap to view and manage
              </Text>
            </View>
          </Card>
        )}

        {/* Today's Workout */}
        <View style={styles.section}>
          <Text variant="h4" style={{ marginBottom: spacing[3] }}>
            Today's Session
          </Text>

          {workoutLoading ? (
            <Card variant="elevated" padding="lg">
              <View style={styles.workoutHeader}>
                <SkeletonText width={160} height={24} />
                <SkeletonText width={50} height={14} />
              </View>
              <Skeleton
                width="100%"
                height={52}
                variant="rect"
                borderRadius={12}
                style={{ marginTop: spacing[4] }}
              />
            </Card>
          ) : !hasScheduledWorkout ? (
            <Card variant="elevated" padding="lg">
              <EmptyState
                title="No workout scheduled"
                message="Your rest day or no session planned."
                action={{
                  title: 'Generate Workout',
                  onPress: () => navigation.navigate('Plan'),
                  variant: 'primary',
                }}
              />
            </Card>
          ) : (
            <Card variant="elevated" padding="lg">
              <View style={styles.workoutHeader}>
                <Text variant="h4">Upper Body Strength</Text>
                <Text variant="caption" color="secondary">
                  ~45 min
                </Text>
              </View>

              <View style={styles.workoutMeta}>
                <View style={styles.metaItem}>
                  <Text variant="h3" color="accent">7</Text>
                  <Text variant="caption" color="secondary">exercises</Text>
                </View>
                <View style={[styles.metaItem, { borderLeftWidth: 1, borderLeftColor: colors.border }]}>
                  <Text variant="h3" color="accent">24</Text>
                  <Text variant="caption" color="secondary">sets</Text>
                </View>
                <View style={[styles.metaItem, { borderLeftWidth: 1, borderLeftColor: colors.border }]}>
                  <Text variant="h3" color="accent">
                    {readiness?.recommendation === 'full' ? 'Full' : 'Modified'}
                  </Text>
                  <Text variant="caption" color="secondary">intensity</Text>
                </View>
              </View>

              <Button
                title={activeWorkout ? 'Resume Workout' : 'Start Workout'}
                variant="primary"
                size="lg"
                fullWidth
                style={{ marginTop: spacing[4] }}
                onPress={handleStartWorkout}
              />
            </Card>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text variant="h4" style={{ marginBottom: spacing[3] }}>
            Quick Actions
          </Text>

          <View style={styles.quickActions}>
            <Card
              variant="default"
              padding="md"
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Body')}
            >
              <Text variant="body" weight="medium">Log Pain</Text>
              <Text variant="caption" color="secondary">Track discomfort</Text>
            </Card>

            <Card
              variant="default"
              padding="md"
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Plan')}
            >
              <Text variant="body" weight="medium">Adjust Plan</Text>
              <Text variant="caption" color="secondary">Modify schedule</Text>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    paddingBottom: 24,
  },
  readinessContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  alertCard: {
    marginBottom: 24,
  },
  alertContent: {
    flexDirection: 'column',
  },
  section: {
    marginBottom: 24,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutMeta: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
  },
});
