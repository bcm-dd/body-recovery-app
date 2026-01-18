/**
 * Progress Screen - Movement & Recovery Companion
 *
 * Visualizes training progress, trends, and insights.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '@/theme';
import { Text, Card } from '@/components/ui';

export function ProgressScreen() {
  const { theme } = useTheme();
  const { colors, spacing } = theme;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="h2">Progress</Text>
          <Text variant="body" color="secondary" style={{ marginTop: spacing[1] }}>
            Track your journey
          </Text>
        </View>

        {/* Consistency grid */}
        <View style={styles.section}>
          <Text variant="h4" style={{ marginBottom: spacing[3] }}>
            Consistency
          </Text>

          <Card variant="default" padding="md">
            <View style={styles.consistencyGrid}>
              {Array.from({ length: 12 * 7 }).map((_, index) => {
                const intensity = Math.random();
                return (
                  <View
                    key={index}
                    style={[
                      styles.consistencyCell,
                      {
                        backgroundColor:
                          intensity > 0.7
                            ? colors.accent
                            : intensity > 0.4
                            ? `${colors.accent}80`
                            : intensity > 0.2
                            ? `${colors.accent}40`
                            : colors.surface,
                      },
                    ]}
                  />
                );
              })}
            </View>
            <View style={styles.consistencyLegend}>
              <Text variant="caption" color="secondary">
                Less
              </Text>
              <View style={styles.legendBlocks}>
                {[0.1, 0.3, 0.5, 0.7, 0.9].map((intensity, i) => (
                  <View
                    key={i}
                    style={[
                      styles.legendBlock,
                      {
                        backgroundColor:
                          intensity > 0.7
                            ? colors.accent
                            : intensity > 0.4
                            ? `${colors.accent}80`
                            : intensity > 0.2
                            ? `${colors.accent}40`
                            : colors.surface,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text variant="caption" color="secondary">
                More
              </Text>
            </View>
          </Card>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text variant="h4" style={{ marginBottom: spacing[3] }}>
            This Month
          </Text>

          <View style={styles.statsRow}>
            <Card variant="elevated" padding="md" style={styles.statCard}>
              <Text variant="h2" color="accent">
                16
              </Text>
              <Text variant="caption" color="secondary">
                Sessions
              </Text>
            </Card>

            <Card variant="elevated" padding="md" style={styles.statCard}>
              <Text variant="h2" color="success">
                92%
              </Text>
              <Text variant="caption" color="secondary">
                Completion
              </Text>
            </Card>

            <Card variant="elevated" padding="md" style={styles.statCard}>
              <Text variant="h2" color="warning">
                45k
              </Text>
              <Text variant="caption" color="secondary">
                Volume (kg)
              </Text>
            </Card>
          </View>
        </View>

        {/* Recent PRs */}
        <View style={styles.section}>
          <Text variant="h4" style={{ marginBottom: spacing[3] }}>
            Recent PRs
          </Text>

          <Card variant="default" padding="md" style={{ marginBottom: spacing[2] }}>
            <View style={styles.prItem}>
              <View>
                <Text variant="body" weight="medium">
                  Bench Press
                </Text>
                <Text variant="caption" color="secondary">
                  2 days ago
                </Text>
              </View>
              <View style={styles.prValue}>
                <Text variant="h3" color="success">
                  80kg
                </Text>
                <Text variant="caption" color="success">
                  +5kg
                </Text>
              </View>
            </View>
          </Card>

          <Card variant="default" padding="md">
            <View style={styles.prItem}>
              <View>
                <Text variant="body" weight="medium">
                  Squat
                </Text>
                <Text variant="caption" color="secondary">
                  1 week ago
                </Text>
              </View>
              <View style={styles.prValue}>
                <Text variant="h3" color="success">
                  100kg
                </Text>
                <Text variant="caption" color="success">
                  +2.5kg
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <Text variant="h4" style={{ marginBottom: spacing[3] }}>
            Insights
          </Text>

          <Card variant="outlined" padding="md">
            <Text variant="body" weight="medium">
              Shoulder recovery improving
            </Text>
            <Text variant="bodySmall" color="secondary" style={{ marginTop: spacing[1] }}>
              Pain incidents have decreased 60% over the last 4 weeks. Your rehab
              compliance is at 88%.
            </Text>
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
  section: {
    marginBottom: 24,
  },
  consistencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  consistencyCell: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  consistencyLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  legendBlocks: {
    flexDirection: 'row',
    gap: 2,
  },
  legendBlock: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  prItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prValue: {
    alignItems: 'flex-end',
  },
});
