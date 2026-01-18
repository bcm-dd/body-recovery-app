/**
 * Exercise Swap Screen - Movement & Recovery Companion
 */

import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { Text, Button, Card } from '@/components/ui';

export function ExerciseSwapScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { colors, spacing } = theme;

  const alternatives = [
    { id: 'incline_press', name: 'Incline Dumbbell Press', reason: 'Similar muscles, less shoulder stress' },
    { id: 'cable_fly', name: 'Cable Fly', reason: 'Isolation movement, good for pump' },
    { id: 'pushup', name: 'Push-ups', reason: 'Bodyweight alternative' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text variant="h3">Swap Exercise</Text>
        <Text variant="body" color="secondary" style={{ marginTop: spacing[1] }}>
          Choose an alternative
        </Text>
      </View>

      <View style={styles.content}>
        {alternatives.map((alt) => (
          <Card
            key={alt.id}
            variant="default"
            padding="md"
            style={{ marginBottom: spacing[2] }}
            onPress={() => navigation.goBack()}
          >
            <Text variant="body" weight="medium">{alt.name}</Text>
            <Text variant="caption" color="secondary">{alt.reason}</Text>
          </Card>
        ))}

        <Button
          title="Cancel"
          variant="ghost"
          style={{ marginTop: spacing[4] }}
          onPress={() => navigation.goBack()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  content: { flex: 1, paddingHorizontal: 20 },
});
