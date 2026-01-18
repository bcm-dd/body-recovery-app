/**
 * Settings Screen - Movement & Recovery Companion
 */

import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { Text, Button } from '@/components/ui';

export function SettingsScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { colors, spacing } = theme;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text variant="h3">Settings</Text>
        <Text variant="body" color="secondary" style={{ marginTop: spacing[2] }}>
          Settings configuration would appear here.
        </Text>
        <Button
          title="Back"
          variant="primary"
          style={{ marginTop: spacing[4] }}
          onPress={() => navigation.goBack()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20 },
});
