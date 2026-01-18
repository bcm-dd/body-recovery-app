/**
 * Profile Screen - Movement & Recovery Companion
 *
 * User profile and settings access.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { Text, Card } from '@/components/ui';

export function ProfileScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { colors, spacing } = theme;

  const menuItems = [
    { title: 'Training Preferences', subtitle: 'Goals, schedule, intensity', screen: 'TrainingPreferences' },
    { title: 'Equipment & Locations', subtitle: 'Gym, home, saved places', screen: 'EquipmentSettings' },
    { title: 'Notifications', subtitle: 'Reminders and alerts', screen: 'NotificationSettings' },
    { title: 'Privacy & Data', subtitle: 'Health data, export, delete', screen: 'PrivacySettings' },
    { title: 'Account', subtitle: 'Email, password, subscription', screen: 'AccountSettings' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="h2">Profile</Text>
        </View>

        {/* User info */}
        <Card variant="elevated" padding="lg" style={{ marginBottom: spacing[6] }}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
              <Text variant="h2" color="inverse">
                A
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text variant="h4">Alex</Text>
              <Text variant="bodySmall" color="secondary">
                Training since Oct 2024
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="h3" color="accent">
                42
              </Text>
              <Text variant="caption" color="secondary">
                workouts
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="h3" color="success">
                12
              </Text>
              <Text variant="caption" color="secondary">
                week streak
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="h3" color="warning">
                88%
              </Text>
              <Text variant="caption" color="secondary">
                compliance
              </Text>
            </View>
          </View>
        </Card>

        {/* Menu items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => navigation.navigate(item.screen as never)}
            >
              <Card
                variant="default"
                padding="md"
                style={{ marginBottom: spacing[2] }}
              >
                <View style={styles.menuItem}>
                  <View>
                    <Text variant="body" weight="medium">
                      {item.title}
                    </Text>
                    <Text variant="caption" color="secondary">
                      {item.subtitle}
                    </Text>
                  </View>
                  <Text variant="body" color="tertiary">
                    &gt;
                  </Text>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>

        {/* App info */}
        <View style={styles.appInfo}>
          <Text variant="caption" color="tertiary" align="center">
            Movement & Recovery Companion
          </Text>
          <Text variant="caption" color="tertiary" align="center">
            Version 0.1.0
          </Text>
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  menuSection: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appInfo: {
    alignItems: 'center',
    paddingTop: 16,
  },
});
