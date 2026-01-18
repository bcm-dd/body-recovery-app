/**
 * Injury Add Screen - Movement & Recovery Companion
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { Text, Button, Card, Input } from '@/components/ui';
import { BodyMap } from '@/components/body';
import { useBodyModelStore } from '@/store';
import type { BodyRegion, Severity } from '@/types';

export function InjuryAddScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { colors, spacing } = theme;

  const addInjury = useBodyModelStore((state) => state.addInjury);

  const [selectedRegion, setSelectedRegion] = useState<BodyRegion | null>(null);
  const [severity, setSeverity] = useState<Severity>('mild');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!selectedRegion) return;

    addInjury({
      bodyRegion: selectedRegion,
      description: description || `${selectedRegion.replace(/_/g, ' ')} issue`,
      severity,
      status: 'active',
      constraints: [],
      startDate: new Date(),
    });

    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text variant="h3">Add Injury</Text>
          <Text variant="body" color="secondary" style={{ marginTop: spacing[1] }}>
            Tap a body region to select
          </Text>
        </View>

        <View style={styles.bodyMapContainer}>
          <BodyMap
            size="md"
            onRegionPress={setSelectedRegion}
            selectedRegion={selectedRegion}
          />
        </View>

        {selectedRegion && (
          <Card variant="default" padding="md" style={{ marginBottom: spacing[4] }}>
            <Text variant="body" weight="medium" style={{ textTransform: 'capitalize' }}>
              {selectedRegion.replace(/_/g, ' ')}
            </Text>

            <Text variant="label" color="secondary" style={{ marginTop: spacing[3], marginBottom: spacing[2] }}>
              Severity
            </Text>
            <View style={styles.severityRow}>
              {(['mild', 'moderate', 'severe'] as Severity[]).map((s) => (
                <Button
                  key={s}
                  title={s.charAt(0).toUpperCase() + s.slice(1)}
                  variant={severity === s ? 'primary' : 'secondary'}
                  size="sm"
                  style={{ flex: 1, marginHorizontal: 4 }}
                  onPress={() => setSeverity(s)}
                />
              ))}
            </View>

            <Input
              label="Description (optional)"
              placeholder="e.g., Sharp pain during overhead movements"
              value={description}
              onChangeText={setDescription}
              containerStyle={{ marginTop: spacing[3] }}
            />
          </Card>
        )}

        <View style={styles.actions}>
          <Button
            title="Cancel"
            variant="ghost"
            style={{ flex: 1, marginRight: spacing[2] }}
            onPress={() => navigation.goBack()}
          />
          <Button
            title="Save"
            variant="primary"
            disabled={!selectedRegion}
            style={{ flex: 1 }}
            onPress={handleSave}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  header: { paddingTop: 16, paddingBottom: 16 },
  bodyMapContainer: { alignItems: 'center', marginBottom: 24 },
  severityRow: { flexDirection: 'row' },
  actions: { flexDirection: 'row', marginTop: 16 },
});
