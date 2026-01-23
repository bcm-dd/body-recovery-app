/**
 * Error Boundary - Movement & Recovery Companion
 *
 * Catches React errors and displays a fallback UI.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text } from './Text';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // Log to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
            <Text variant="h3" style={styles.title}>
              Something went wrong
            </Text>

            <Text variant="body" color="secondary" style={styles.message}>
              An error occurred while rendering this screen.
            </Text>

            {this.state.error && (
              <View style={styles.errorBox}>
                <Text variant="bodySmall" style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
              </View>
            )}

            {this.state.errorInfo && (
              <View style={styles.stackBox}>
                <Text variant="caption" color="tertiary" style={styles.stackText}>
                  {this.state.errorInfo.componentStack}
                </Text>
              </View>
            )}

            <Pressable style={styles.button} onPress={this.handleReset}>
              <Text variant="body" weight="semibold" color="inverse">
                Try Again
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    color: '#EF4444',
    marginBottom: 12,
  },
  message: {
    marginBottom: 24,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: '#EF4444',
    fontFamily: 'monospace',
  },
  stackBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    maxHeight: 200,
  },
  stackText: {
    fontFamily: 'monospace',
    fontSize: 10,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
});
