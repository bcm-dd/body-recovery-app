/**
 * SafeArea Component (Web) - Movement & Recovery Companion
 *
 * On web, SafeAreaView doesn't work properly, so we use a regular View
 * with appropriate padding for the notch/status bar areas.
 */

import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';

interface SafeAreaProps extends ViewProps {
  children?: React.ReactNode;
}

export function SafeArea({ children, style, ...props }: SafeAreaProps) {
  return (
    <View style={[styles.container, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Add safe area padding for mobile web browsers
    paddingTop: 'env(safe-area-inset-top)' as any,
    paddingBottom: 'env(safe-area-inset-bottom)' as any,
    paddingLeft: 'env(safe-area-inset-left)' as any,
    paddingRight: 'env(safe-area-inset-right)' as any,
  },
});
