/**
 * Root Navigator - Movement & Recovery Companion
 *
 * Top-level navigation configuration.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/theme';
import type { RootStackParamList } from './types';

// Navigators
import { MainTabs } from './MainTabs';

// Screens - Workout Flow
import { WorkoutExecutionScreen } from '@/features/workout/WorkoutExecutionScreen';
import { ExerciseDetailScreen } from '@/features/workout/ExerciseDetailScreen';
import { ExerciseSwapScreen } from '@/features/workout/ExerciseSwapScreen';

// Screens - Body Flow
import { InjuryDetailScreen } from '@/features/body/InjuryDetailScreen';
import { InjuryAddScreen } from '@/features/body/InjuryAddScreen';
import { PainLogScreen } from '@/features/body/PainLogScreen';

// Screens - Settings
import { SettingsScreen } from '@/features/settings/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { theme, isDark } = useTheme();
  const { colors } = theme;

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: colors.accent,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.error,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        {/* Main app with tabs */}
        <Stack.Screen name="Main" component={MainTabs} />

        {/* Workout flow - presented as modal */}
        <Stack.Group
          screenOptions={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        >
          <Stack.Screen name="WorkoutExecution" component={WorkoutExecutionScreen} />
        </Stack.Group>

        {/* Exercise sheets */}
        <Stack.Group
          screenOptions={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        >
          <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
          <Stack.Screen name="ExerciseSwap" component={ExerciseSwapScreen} />
        </Stack.Group>

        {/* Body/Injury flow */}
        <Stack.Group
          screenOptions={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        >
          <Stack.Screen name="InjuryDetail" component={InjuryDetailScreen} />
          <Stack.Screen name="InjuryAdd" component={InjuryAddScreen} />
          <Stack.Screen name="PainLog" component={PainLogScreen} />
        </Stack.Group>

        {/* Settings */}
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
