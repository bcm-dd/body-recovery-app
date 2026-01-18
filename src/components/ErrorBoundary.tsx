/**
 * Error Boundary - Movement & Recovery Companion
 *
 * Catches JavaScript errors in child components and displays fallback UI.
 * Prevents crashes from propagating and breaking the entire app.
 */

import React, { Component, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors } from '../theme/tokens';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'screen' | 'component' | 'app';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary component for catching and handling React errors
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });

    // Log to error reporting service
    console.error('ErrorBoundary caught error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, level = 'component' } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <ErrorFallback
          error={error}
          level={level}
          onRetry={this.handleRetry}
        />
      );
    }

    return children;
  }
}

/**
 * Default error fallback UI
 */
interface ErrorFallbackProps {
  error: Error | null;
  level: 'screen' | 'component' | 'app';
  onRetry: () => void;
}

function ErrorFallback({ error, level, onRetry }: ErrorFallbackProps): JSX.Element {
  const isAppLevel = level === 'app';
  const isScreenLevel = level === 'screen';

  return (
    <View
      style={[
        styles.container,
        isAppLevel && styles.appContainer,
        isScreenLevel && styles.screenContainer,
      ]}
      accessibilityRole="alert"
      accessibilityLabel="An error occurred"
    >
      <View style={styles.content}>
        <Text style={styles.icon}>!</Text>
        <Text style={styles.title}>
          {isAppLevel ? 'Something went wrong' : 'Error loading content'}
        </Text>
        <Text style={styles.message}>
          {isAppLevel
            ? "We're sorry, but something unexpected happened. Please try again."
            : 'This section encountered an error.'}
        </Text>

        {__DEV__ && error && (
          <ScrollView style={styles.debugContainer} horizontal={false}>
            <Text style={styles.debugTitle}>Debug Info:</Text>
            <Text style={styles.debugText}>{error.message}</Text>
            <Text style={styles.debugStack}>{error.stack?.slice(0, 500)}</Text>
          </ScrollView>
        )}

        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Try again"
          accessibilityHint="Attempts to reload this content"
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    margin: 8,
  },
  appContainer: {
    flex: 1,
    margin: 0,
    borderRadius: 0,
    backgroundColor: colors.white,
  },
  screenContainer: {
    flex: 1,
    margin: 0,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  icon: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.red[500],
    marginBottom: 16,
    width: 80,
    height: 80,
    lineHeight: 80,
    textAlign: 'center',
    backgroundColor: colors.red[50],
    borderRadius: 40,
    overflow: 'hidden',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  debugContainer: {
    backgroundColor: colors.gray[100],
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    maxHeight: 150,
    width: '100%',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 4,
  },
  debugText: {
    fontSize: 11,
    color: colors.red[600],
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  debugStack: {
    fontSize: 10,
    color: colors.gray[500],
    fontFamily: 'monospace',
  },
  retryButton: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

/**
 * HOC to wrap a component with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: Omit<Props, 'children'>
): React.ComponentType<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...options}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return WithErrorBoundary;
}

export default ErrorBoundary;
