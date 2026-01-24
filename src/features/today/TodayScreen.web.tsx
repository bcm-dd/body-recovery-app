/**
 * Today Screen (Web) - Movement & Recovery Companion
 *
 * Premium web dashboard with refined layout and interactions.
 */

import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { Text, Card, Button, LoadingState, EmptyState, Skeleton, SkeletonText } from '@/components/ui';
import { ReadinessRing } from '@/components/readiness/ReadinessRing';
import { useReadinessStore, useWorkoutStore, useBodyModelStore } from '@/store';
import type { MainTabScreenProps } from '@/navigation/types';

export function TodayScreen() {
  const navigation = useNavigation<MainTabScreenProps<'Today'>['navigation']>();
  const { theme } = useTheme();
  const { colors, spacing, borderRadius } = theme;

  // Store state
  const readiness = useReadinessStore((state) => state.currentReadiness);
  const readinessLoading = useReadinessStore((state) => state.isLoading);
  const calculateReadiness = useReadinessStore((state) => state.calculateReadiness);
  const activeInjuries = useBodyModelStore((state) => state.getActiveInjuries());
  const activeWorkout = useWorkoutStore((state) => state.activeWorkout);
  const workoutLoading = useWorkoutStore((state) => state.isLoading);

  const [hasScheduledWorkout] = useState(true);

  // Calculate readiness on mount
  useEffect(() => {
    calculateReadiness(activeInjuries.length);
  }, [calculateReadiness, activeInjuries.length]);

  const handleStartWorkout = () => {
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
        contentContainerStyle={[styles.content, { padding: spacing[4] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingBottom: spacing[4] }]}>
          <Text variant="h2">{getGreeting()}</Text>
          <Text variant="bodySmall" color="secondary" style={{ marginTop: spacing[1] }}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Readiness Ring */}
        <View style={[styles.readinessContainer, { paddingVertical: spacing[6] }]}>
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
                size="md"
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
          <Pressable
            onPress={() => navigation.navigate('Body')}
            style={({ pressed }) => [
              styles.alertCard,
              {
                backgroundColor: `${colors.warning}15`,
                borderColor: colors.warning,
                borderWidth: 1,
                borderRadius: borderRadius.md,
                padding: spacing[3],
                marginBottom: spacing[4],
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text variant="bodySmall" weight="semibold" color="warning">
              {activeInjuries.length} active injury concern{activeInjuries.length > 1 ? 's' : ''}
            </Text>
            <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
              Tap to view and manage
            </Text>
          </Pressable>
        )}

        {/* Today's Workout */}
        <View style={[styles.section, { marginBottom: spacing[4] }]}>
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
                <View style={[styles.badge, { backgroundColor: colors.accentMuted }]}>
                  <Text variant="caption" color="accent">~45 min</Text>
                </View>
              </View>

              <View style={[styles.workoutMeta, {
                borderTopColor: colors.border,
                marginTop: spacing[4],
                paddingTop: spacing[4],
              }]}>
                <View style={styles.metaItem}>
                  <Text variant="h3" color="accent">7</Text>
                  <Text variant="caption" color="secondary">exercises</Text>
                </View>
                <View style={[styles.metaItem, styles.metaDivider, { borderLeftColor: colors.border }]}>
                  <Text variant="h3" color="accent">24</Text>
                  <Text variant="caption" color="secondary">sets</Text>
                </View>
                <View style={[styles.metaItem, styles.metaDivider, { borderLeftColor: colors.border }]}>
                  <Text variant="h3" color="accent">
                    {readiness?.recommendation === 'full' ? 'Full' : 'Mod'}
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
        <View style={[styles.section, { marginBottom: spacing[4] }]}>
          <Text variant="h4" style={{ marginBottom: spacing[3] }}>
            Quick Actions
          </Text>

          <View style={[styles.quickActions, { gap: spacing[3] }]}>
            <Pressable
              onPress={() => navigation.navigate('Body')}
              style={({ pressed }) => [
                styles.quickActionCard,
                {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.lg,
                  padding: spacing[4],
                  opacity: pressed ? 0.8 : 1,
                  // @ts-ignore
                  transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
                  transition: 'transform 0.15s ease, opacity 0.15s ease',
                },
              ]}
            >
              <Text variant="body" weight="medium">Log Pain</Text>
              <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                Track discomfort
              </Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate('Plan')}
              style={({ pressed }) => [
                styles.quickActionCard,
                {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.lg,
                  padding: spacing[4],
                  opacity: pressed ? 0.8 : 1,
                  // @ts-ignore
                  transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
                  transition: 'transform 0.15s ease, opacity 0.15s ease',
                },
              ]}
            >
              <Text variant="body" weight="medium">Adjust Plan</Text>
              <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                Modify schedule
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Readiness Factors */}
        {readiness && (
          <View style={styles.section}>
            <Text variant="h4" style={{ marginBottom: spacing[3] }}>
              Readiness Factors
            </Text>

            <Card variant="default" padding="md">
              {[
                { label: 'Sleep', value: readiness.factors.sleep },
                { label: 'Recovery', value: readiness.factors.recovery },
                { label: 'Training Load', value: readiness.factors.load },
                { label: 'Body Status', value: readiness.factors.body },
              ].map((factor, index) => (
                <View
                  key={factor.label}
                  style={[
                    styles.factorRow,
                    index > 0 && { marginTop: spacing[3], paddingTop: spacing[3], borderTopWidth: 1, borderTopColor: colors.border }
                  ]}
                >
                  <Text variant="body">{factor.label}</Text>
                  <View style={styles.factorValue}>
                    <View
                      style={[
                        styles.factorBar,
                        {
                          backgroundColor: colors.border,
                          borderRadius: borderRadius.full,
                        }
                      ]}
                    >
                      <View
                        style={[
                          styles.factorBarFill,
                          {
                            width: `${factor.value}%`,
                            backgroundColor: factor.value >= 70 ? colors.success : factor.value >= 40 ? colors.warning : colors.error,
                            borderRadius: borderRadius.full,
                          }
                        ]}
                      />
                    </View>
                    <Text variant="bodySmall" weight="semibold" style={{ minWidth: 36, textAlign: 'right' }}>
                      {factor.value}%
                    </Text>
                  </View>
                </View>
              ))}

              {readiness.reasoning && (
                <Text
                  variant="caption"
                  color="secondary"
                  style={{ marginTop: spacing[4] }}
                >
                  {readiness.reasoning}
                </Text>
              )}
            </Card>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: spacing[4] }} />
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
    paddingBottom: 32,
  },
  header: {},
  readinessContainer: {
    alignItems: 'center',
  },
  alertCard: {},
  section: {},
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  workoutMeta: {
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaDivider: {
    borderLeftWidth: 1,
  },
  quickActions: {
    flexDirection: 'row',
  },
  quickActionCard: {
    flex: 1,
  },
  factorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  factorValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  factorBar: {
    width: 80,
    height: 6,
    overflow: 'hidden',
  },
  factorBarFill: {
    height: '100%',
  },
});
