/**
 * Main Tab Navigator (Web) - Movement & Recovery Companion
 *
 * Web-optimized bottom tab navigation with refined styling.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/theme';
import type { MainTabParamList } from './types';

// Screens
import { TodayScreen } from '@/features/today/TodayScreen';
import { PlanScreen } from '@/features/plan/PlanScreen';
import { BodyScreen } from '@/features/body/BodyScreen';
import { ProgressScreen } from '@/features/progress/ProgressScreen';
import { ProfileScreen } from '@/features/profile/ProfileScreen';

// Tab icons
import { TabIcon } from './TabIcon';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          // @ts-ignore - web-specific styles
          transition: 'background-color 0.2s ease',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          // @ts-ignore - web-specific styles
          cursor: 'pointer',
        },
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{
          tabBarLabel: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="today" color={color} focused={focused} size={22} />
          ),
        }}
      />
      <Tab.Screen
        name="Plan"
        component={PlanScreen}
        options={{
          tabBarLabel: 'Plan',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="calendar" color={color} focused={focused} size={22} />
          ),
        }}
      />
      <Tab.Screen
        name="Body"
        component={BodyScreen}
        options={{
          tabBarLabel: 'Body',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="body" color={color} focused={focused} size={22} />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="chart" color={color} focused={focused} size={22} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" color={color} focused={focused} size={22} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
