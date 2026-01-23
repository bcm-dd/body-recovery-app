/**
 * Movement & Recovery Companion (Web)
 *
 * Web-specific App component without native-only dependencies.
 */

import React from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from '@/theme';
import { RootNavigator } from '@/navigation';
import { ErrorBoundary } from '@/components/ui';

// Debug component to verify app is rendering
const DebugBanner = () => (
  <View style={{ backgroundColor: '#3B82F6', padding: 8 }}>
    <RNText style={{ color: '#fff', textAlign: 'center', fontSize: 12 }}>
      Web App v0.1 - Debug Mode
    </RNText>
  </View>
);

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
    <View style={styles.container}>
      <DebugBanner />
      <ErrorBoundary>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider initialThemeMode="dark" initialAccentColor="blue">
              <ErrorBoundary>
                <RootNavigator />
              </ErrorBoundary>
            </ThemeProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </View>
  );
}

// Web-specific styles need explicit height/width
const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%' as any,
    width: '100%' as any,
    minHeight: '100vh' as any,
  },
});
