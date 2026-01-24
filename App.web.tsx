/**
 * Movement & Recovery Companion (Web)
 *
 * Web-specific App component with responsive layout.
 * Designed to feel like a premium mobile app experience on web.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from '@/theme';
import { RootNavigator } from '@/navigation';
import { ErrorBoundary } from '@/components/ui';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

/**
 * Web Layout Container
 * Centers the app content and constrains width for a mobile-like experience
 */
function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.webContainer}>
      <View style={styles.appFrame}>
        {children}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <View style={styles.container}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider initialThemeMode="dark" initialAccentColor="blue">
              <WebLayout>
                <ErrorBoundary>
                  <RootNavigator />
                </ErrorBoundary>
              </WebLayout>
            </ThemeProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </View>
  );
}

// Web-specific styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%' as any,
    width: '100%' as any,
    minHeight: '100vh' as any,
    backgroundColor: '#000000', // OLED black background
  },
  webContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  appFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 430, // iPhone Pro Max width for mobile-like experience
    // @ts-ignore - web-specific shadow
    boxShadow: '0 0 60px rgba(10, 132, 255, 0.1)',
    overflow: 'hidden' as any,
  },
});
