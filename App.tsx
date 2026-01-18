/**
 * Movement & Recovery Companion
 *
 * An AI-driven movement and recovery coaching app with clinical context,
 * deep device integration, and behavioural intelligence.
 */

import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from '@/theme';
import { RootNavigator } from '@/navigation';

// Ignore specific warnings during development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider initialThemeMode="dark" initialAccentColor="blue">
            <StatusBar barStyle="light-content" />
            <RootNavigator />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
