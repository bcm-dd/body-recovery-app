/**
 * Main Tab Navigator - Movement & Recovery Companion
 *
 * Bottom tab navigation for the main app sections.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/theme';
import type { MainTabParamList } from './types';

// Screens
import { TodayScreen } from '@/features/today/TodayScreen';
import { PlanScreen } from '@/features/plan/PlanScreen';
import { BodyScreen } from '@/features/body/BodyScreen';
import { ProgressScreen } from '@/features/progress/ProgressScreen';
import { ProfileScreen } from '@/features/profile/ProfileScreen';

// Tab icons (using simple shapes for now - would use vector icons in production)
import { TabIcon } from './TabIcon';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const { theme } = useTheme();
  const { colors, components } = theme;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: components.tabBar.height,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{
          tabBarLabel: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="today" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Plan"
        component={PlanScreen}
        options={{
          tabBarLabel: 'Plan',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="calendar" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Body"
        component={BodyScreen}
        options={{
          tabBarLabel: 'Body',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="body" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="chart" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
