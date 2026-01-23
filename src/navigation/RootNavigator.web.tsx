/**
 * Root Navigator (Web) - Movement & Recovery Companion
 *
 * Web-specific navigation using @react-navigation/stack instead of native-stack.
 * The native-stack navigator doesn't work properly on web.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
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

// Screens - AI Chat
import { ChatScreen } from '@/features/chat/ChatScreen';

const Stack = createStackNavigator<RootStackParamList>();

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
          cardStyle: { backgroundColor: colors.background },
          ...TransitionPresets.SlideFromRightIOS,
        }}
      >
        {/* Main app with tabs */}
        <Stack.Screen name="Main" component={MainTabs} />

        {/* Workout flow - presented as modal */}
        <Stack.Group
          screenOptions={{
            presentation: 'modal',
            ...TransitionPresets.ModalSlideFromBottomIOS,
          }}
        >
          <Stack.Screen name="WorkoutExecution" component={WorkoutExecutionScreen} />
        </Stack.Group>

        {/* Exercise sheets */}
        <Stack.Group
          screenOptions={{
            presentation: 'modal',
            ...TransitionPresets.ModalSlideFromBottomIOS,
          }}
        >
          <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
          <Stack.Screen name="ExerciseSwap" component={ExerciseSwapScreen} />
        </Stack.Group>

        {/* Body/Injury flow */}
        <Stack.Group
          screenOptions={{
            presentation: 'modal',
            ...TransitionPresets.ModalSlideFromBottomIOS,
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
            ...TransitionPresets.SlideFromRightIOS,
          }}
        />

        {/* AI Chat - presented as modal from bottom */}
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            presentation: 'modal',
            ...TransitionPresets.ModalSlideFromBottomIOS,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
