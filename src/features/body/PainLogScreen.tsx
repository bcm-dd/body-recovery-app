/**
 * Pain Log Screen - Movement & Recovery Companion
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { Text, Button, Card } from '@/components/ui';
import { BodyMap } from '@/components/body';
import { useBodyModelStore } from '@/store';
import { useHaptics } from '@/hooks';
import type { BodyRegion, Severity, PainType } from '@/types';

export function PainLogScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  const { trigger } = useHaptics();

  const logPain = useBodyModelStore((state) => state.logPain);

  const [selectedRegion, setSelectedRegion] = useState<BodyRegion | null>(null);
  const [severity, setSeverity] = useState<Severity>('mild');
  const [painType, setPainType] = useState<PainType>('aching');

  const handleSave = () => {
    if (!selectedRegion) return;

    logPain({
      userId: 'user-1',
      bodyRegion: selectedRegion,
      severity,
      painType,
    });

    trigger('confirm');
    navigation.goBack();
  };

  const painTypes: PainType[] = ['sharp', 'dull', 'aching', 'burning', 'tightness', 'weakness'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text variant="h3">Log Pain</Text>
          <Text variant="body" color="secondary" style={{ marginTop: spacing[1] }}>
            Quick discomfort tracking
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
            <View style={styles.optionRow}>
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

            <Text variant="label" color="secondary" style={{ marginTop: spacing[3], marginBottom: spacing[2] }}>
              Type
            </Text>
            <View style={styles.typeGrid}>
              {painTypes.map((type) => (
                <Button
                  key={type}
                  title={type.charAt(0).toUpperCase() + type.slice(1)}
                  variant={painType === type ? 'primary' : 'ghost'}
                  size="sm"
                  style={styles.typeButton}
                  onPress={() => setPainType(type)}
                />
              ))}
            </View>
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
            title="Log Pain"
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
  optionRow: { flexDirection: 'row' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeButton: { marginBottom: 4 },
  actions: { flexDirection: 'row', marginTop: 16 },
});
