/**
 * Body Screen - Movement & Recovery Companion
 *
 * Main screen for body model management, injury tracking, and pain logging.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { Text, Card, Button } from '@/components/ui';
import { BodyMap } from '@/components/body';
import { useBodyModelStore } from '@/store';
import { useHaptics } from '@/hooks';
import type { BodyRegion, Severity } from '@/types';

export function BodyScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  const { trigger } = useHaptics();

  const [selectedRegion, setSelectedRegion] = useState<BodyRegion | null>(null);
  const [bodyView, setBodyView] = useState<'front' | 'back'>('front');

  // Store state
  const injuries = useBodyModelStore((state) => state.injuries);
  const getActiveInjuries = useBodyModelStore((state) => state.getActiveInjuries);
  const getBodyRegionStatus = useBodyModelStore((state) => state.getBodyRegionStatus);

  const activeInjuries = getActiveInjuries();

  // Build highlighted regions map from injuries
  const highlightedRegions = new Map<BodyRegion, Severity>();
  activeInjuries.forEach((injury) => {
    const existing = highlightedRegions.get(injury.bodyRegion);
    // Keep the more severe status
    if (!existing || severityOrder(injury.severity) > severityOrder(existing)) {
      highlightedRegions.set(injury.bodyRegion, injury.severity);
    }
  });

  function severityOrder(severity: Severity): number {
    return { mild: 1, moderate: 2, severe: 3 }[severity];
  }

  const handleRegionPress = useCallback((region: BodyRegion) => {
    trigger('tap');
    setSelectedRegion(region);
  }, [trigger]);

  const handleToggleView = () => {
    trigger('selection');
    setBodyView((v) => (v === 'front' ? 'back' : 'front'));
    setSelectedRegion(null);
  };

  const handleLogPain = () => {
    if (selectedRegion) {
      navigation.navigate('PainLog', { bodyRegion: selectedRegion });
    } else {
      navigation.navigate('PainLog', {});
    }
  };

  const handleAddInjury = () => {
    navigation.navigate('InjuryAdd', { bodyRegion: selectedRegion ?? undefined });
  };

  const selectedRegionStatus = selectedRegion ? getBodyRegionStatus(selectedRegion) : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h2">Body</Text>
          <Text variant="body" color="secondary" style={{ marginTop: spacing[1] }}>
            Track pain and manage injuries
          </Text>
        </View>

        {/* Body Map */}
        <View style={styles.bodyMapContainer}>
          <BodyMap
            view={bodyView}
            size="lg"
            onRegionPress={handleRegionPress}
            highlightedRegions={highlightedRegions}
            selectedRegion={selectedRegion}
          />

          <Button
            title={bodyView === 'front' ? 'Show Back' : 'Show Front'}
            variant="ghost"
            size="sm"
            style={{ marginTop: spacing[2] }}
            onPress={handleToggleView}
          />
        </View>

        {/* Selected Region Info */}
        {selectedRegion && (
          <Card variant="elevated" style={styles.regionInfo}>
            <Text variant="h4" style={{ textTransform: 'capitalize' }}>
              {selectedRegion.replace(/_/g, ' ')}
            </Text>

            {selectedRegionStatus?.hasActiveInjury ? (
              <View style={{ marginTop: spacing[2] }}>
                <Text variant="bodySmall" color="warning">
                  Active injury - {selectedRegionStatus.severity} severity
                </Text>
                <Text variant="caption" color="secondary" style={{ marginTop: spacing[1] }}>
                  {selectedRegionStatus.constraints.length} active constraint
                  {selectedRegionStatus.constraints.length !== 1 ? 's' : ''}
                </Text>
              </View>
            ) : (
              <Text variant="bodySmall" color="secondary" style={{ marginTop: spacing[1] }}>
                No active issues
              </Text>
            )}

            <View style={styles.regionActions}>
              <Button
                title="Log Pain"
                variant="secondary"
                size="sm"
                style={{ flex: 1, marginRight: spacing[2] }}
                onPress={handleLogPain}
              />
              <Button
                title="Add Injury"
                variant="primary"
                size="sm"
                style={{ flex: 1 }}
                onPress={handleAddInjury}
              />
            </View>
          </Card>
        )}

        {/* Active Injuries List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h4">Active Issues</Text>
            <Button
              title="Add"
              variant="ghost"
              size="sm"
              onPress={handleAddInjury}
            />
          </View>

          {activeInjuries.length === 0 ? (
            <Card variant="outlined" padding="lg">
              <Text variant="body" color="secondary" align="center">
                No active injuries or concerns.
              </Text>
              <Text variant="caption" color="tertiary" align="center" style={{ marginTop: spacing[1] }}>
                Tap the body map to log pain or add an injury.
              </Text>
            </Card>
          ) : (
            activeInjuries.map((injury) => (
              <Card
                key={injury.id}
                variant="default"
                padding="md"
                style={{ marginBottom: spacing[2] }}
                onPress={() => navigation.navigate('InjuryDetail', { injuryId: injury.id })}
              >
                <View style={styles.injuryRow}>
                  <View style={styles.injuryInfo}>
                    <Text variant="body" weight="medium" style={{ textTransform: 'capitalize' }}>
                      {injury.bodyRegion.replace(/_/g, ' ')}
                    </Text>
                    <Text variant="bodySmall" color="secondary" numberOfLines={1}>
                      {injury.description}
                    </Text>
                  </View>
                  <View style={[
                    styles.severityBadge,
                    {
                      backgroundColor:
                        injury.severity === 'severe'
                          ? colors.error
                          : injury.severity === 'moderate'
                          ? colors.warning
                          : colors.bodyMapMild,
                    },
                  ]}>
                    <Text variant="caption" color="inverse" style={{ textTransform: 'capitalize' }}>
                      {injury.severity}
                    </Text>
                  </View>
                </View>
              </Card>
            ))
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
              onPress={handleLogPain}
            >
              <Text variant="body" weight="medium">
                Log Pain
              </Text>
              <Text variant="caption" color="secondary">
                Quick discomfort log
              </Text>
            </Card>

            <Card
              variant="default"
              padding="md"
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('DocumentUpload')}
            >
              <Text variant="body" weight="medium">
                Add Document
              </Text>
              <Text variant="caption" color="secondary">
                MRI, physio sheet
              </Text>
            </Card>
          </View>
        </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  bodyMapContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  regionInfo: {
    marginBottom: 24,
  },
  regionActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  injuryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  injuryInfo: {
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
  },
});
