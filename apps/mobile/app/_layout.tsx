import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider, Theme } from 'tamagui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import config from '../tamagui.config';
import { AppProvider } from '@/providers/AppProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config}>
        <Theme name={isDark ? 'dark' : 'light'}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AppProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  contentStyle: {
                    backgroundColor: isDark ? '#0A0A0A' : '#F9FAFB',
                  },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="onboarding"
                  options={{
                    headerShown: false,
                    presentation: 'modal',
                    animation: 'fade',
                  }}
                />
                <Stack.Screen
                  name="workout/[id]"
                  options={{
                    headerShown: false,
                    presentation: 'fullScreenModal',
                    animation: 'slide_from_bottom',
                    gestureEnabled: false,
                  }}
                />
                <Stack.Screen
                  name="workout/summary/[id]"
                  options={{
                    headerShown: false,
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                  }}
                />
                <Stack.Screen
                  name="substitution/[exerciseId]"
                  options={{
                    headerShown: false,
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                  }}
                />
              </Stack>
              <StatusBar style={isDark ? 'light' : 'dark'} />
            </AppProvider>
          </GestureHandlerRootView>
        </Theme>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
