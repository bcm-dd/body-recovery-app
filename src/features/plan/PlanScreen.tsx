/**
 * Plan Screen - Movement & Recovery Companion
 *
 * Calendar view for workout planning and scheduling.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '@/theme';
import { Text, Card } from '@/components/ui';

export function PlanScreen() {
  const { theme } = useTheme();
  const { colors, spacing } = theme;

  // Get current week dates
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + i);
    return date;
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="h2">Plan</Text>
          <Text variant="body" color="secondary" style={{ marginTop: spacing[1] }}>
            Your weekly schedule
          </Text>
        </View>

        {/* Week view */}
        <View style={styles.weekContainer}>
          {days.map((date, index) => {
            const isToday = date.toDateString() === today.toDateString();
            const isPast = date < today && !isToday;

            return (
              <Card
                key={index}
                variant={isToday ? 'elevated' : 'default'}
                padding="sm"
                style={[
                  styles.dayCard,
                  isToday && { borderColor: colors.accent, borderWidth: 2 },
                  isPast && { opacity: 0.5 },
                ]}
              >
                <Text
                  variant="caption"
                  color={isToday ? 'accent' : 'secondary'}
                  align="center"
                >
                  {dayNames[index]}
                </Text>
                <Text
                  variant="h4"
                  color={isToday ? 'accent' : 'primary'}
                  align="center"
                  style={{ marginTop: 4 }}
                >
                  {date.getDate()}
                </Text>
                {/* Activity indicator */}
                <View
                  style={[
                    styles.activityDot,
                    {
                      backgroundColor:
                        index % 3 === 0
                          ? colors.accent
                          : index % 2 === 0
                          ? colors.success
                          : 'transparent',
                    },
                  ]}
                />
              </Card>
            );
          })}
        </View>

        {/* Today's plan */}
        <View style={styles.section}>
          <Text variant="h4" style={{ marginBottom: spacing[3] }}>
            Today
          </Text>

          <Card variant="default" padding="md" style={{ marginBottom: spacing[2] }}>
            <View style={styles.planItem}>
              <View style={[styles.activityIcon, { backgroundColor: colors.accent }]} />
              <View style={styles.planInfo}>
                <Text variant="body" weight="medium">
                  Upper Body Strength
                </Text>
                <Text variant="caption" color="secondary">
                  45 min • 7 exercises
                </Text>
              </View>
            </View>
          </Card>

          <Card variant="default" padding="md">
            <View style={styles.planItem}>
              <View style={[styles.activityIcon, { backgroundColor: colors.success }]} />
              <View style={styles.planInfo}>
                <Text variant="body" weight="medium">
                  Evening Mobility
                </Text>
                <Text variant="caption" color="secondary">
                  15 min • Shoulder focus
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Upcoming */}
        <View style={styles.section}>
          <Text variant="h4" style={{ marginBottom: spacing[3] }}>
            This Week
          </Text>

          <Card variant="outlined" padding="md">
            <View style={styles.weekSummary}>
              <View style={styles.summaryItem}>
                <Text variant="h3" color="accent">
                  4
                </Text>
                <Text variant="caption" color="secondary">
                  workouts
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="h3" color="success">
                  3
                </Text>
                <Text variant="caption" color="secondary">
                  mobility
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="h3" color="warning">
                  2
                </Text>
                <Text variant="caption" color="secondary">
                  rest days
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 32,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dayCard: {
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  weekSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
});
