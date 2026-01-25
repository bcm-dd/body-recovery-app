'use client';

import { usePathname } from 'next/navigation';
import type {
  ReactNode} from 'react';
import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
  useState
} from 'react';

import {
  analytics,
  trackPageView,
  trackTiming,
  AnalyticsEvents,
  Features,
  type FeatureName,
  type AnalyticsConfig,
} from '../lib/analytics';
import {
  errorMonitoring,
  setErrorRoute,
  addBreadcrumb,
} from '../lib/error-monitoring';

// ============================================================================
// Types
// ============================================================================

export interface WebVitals {
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  fid?: number; // First Input Delay
  lcp?: number; // Largest Contentful Paint
  ttfb?: number; // Time to First Byte
  inp?: number; // Interaction to Next Paint
}

export interface AnalyticsContextValue {
  // Tracking
  trackEvent: (name: string, properties?: Record<string, unknown>) => void;
  trackFeature: (feature: FeatureName, metadata?: Record<string, unknown>) => void;
  trackTiming: (name: string, duration: number, category?: string) => void;

  // Privacy controls
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  isAnonymousMode: boolean;
  setAnonymousMode: (anonymous: boolean) => void;
  hasConsent: boolean;
  setConsent: (given: boolean) => void;

  // Web Vitals
  webVitals: WebVitals;

  // Performance marks
  startMark: (name: string) => void;
  endMark: (name: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

// ============================================================================
// Provider Props
// ============================================================================

export interface AnalyticsProviderProps {
  children: ReactNode;
  config?: Partial<AnalyticsConfig>;
  autoTrackPageViews?: boolean;
  trackWebVitals?: boolean;
  trackPerformance?: boolean;
  debug?: boolean;
}

// ============================================================================
// Analytics Provider Component
// ============================================================================

export function AnalyticsProvider({
  children,
  config,
  autoTrackPageViews = true,
  trackWebVitals = true,
  trackPerformance = true,
  debug = process.env.NODE_ENV === 'development',
}: AnalyticsProviderProps) {
  const pathname = usePathname();
  const prevPathname = useRef<string>('');
  const performanceMarks = useRef<Map<string, number>>(new Map());

  const [isEnabled, setIsEnabledState] = useState(() => analytics.isEnabled());
  const [isAnonymousMode, setIsAnonymousModeState] = useState(() => analytics.isAnonymousMode());
  const [hasConsent, setHasConsentState] = useState(() => analytics.hasConsent());
  const [webVitals, setWebVitals] = useState<WebVitals>({});

  // ============================================================================
  // Initialization
  // ============================================================================

  useEffect(() => {
    // Initialize analytics
    analytics.init({
      debug,
      ...config,
    });

    // Initialize error monitoring
    errorMonitoring.init({
      debug,
    });

    // Sync state
    setIsEnabledState(analytics.isEnabled());
    setIsAnonymousModeState(analytics.isAnonymousMode());
    setHasConsentState(analytics.hasConsent());
  }, [config, debug]);

  // ============================================================================
  // Page View Tracking
  // ============================================================================

  useEffect(() => {
    if (!autoTrackPageViews) return;
    if (pathname === prevPathname.current) return;

    prevPathname.current = pathname;

    // Track page view
    trackPageView(pathname);

    // Update error monitoring context
    setErrorRoute(pathname);

    // Add navigation breadcrumb
    addBreadcrumb({
      type: 'navigation',
      category: 'navigation',
      message: `Navigated to ${pathname}`,
      level: 'info',
    });
  }, [pathname, autoTrackPageViews]);

  // ============================================================================
  // Web Vitals Tracking
  // ============================================================================

  useEffect(() => {
    if (!trackWebVitals || typeof window === 'undefined') return;

    // Dynamically import web-vitals to avoid SSR issues
    const reportWebVitals = async () => {
      try {
        // Try to use web-vitals library if available
        // Note: onFID was removed in web-vitals v5, replaced by onINP
        const { onCLS, onFCP, onLCP, onTTFB, onINP } = await import('web-vitals');

        onCLS((metric: { value: number }) => {
          setWebVitals((prev) => ({ ...prev, cls: metric.value }));
          trackTiming('web_vitals_cls', metric.value, 'web_vitals');
        });

        onFCP((metric: { value: number }) => {
          setWebVitals((prev) => ({ ...prev, fcp: metric.value }));
          trackTiming('web_vitals_fcp', metric.value, 'web_vitals');
        });

        onLCP((metric: { value: number }) => {
          setWebVitals((prev) => ({ ...prev, lcp: metric.value }));
          trackTiming('web_vitals_lcp', metric.value, 'web_vitals');
        });

        onTTFB((metric: { value: number }) => {
          setWebVitals((prev) => ({ ...prev, ttfb: metric.value }));
          trackTiming('web_vitals_ttfb', metric.value, 'web_vitals');
        });

        onINP((metric: { value: number }) => {
          // INP replaces FID in web-vitals v5
          setWebVitals((prev) => ({ ...prev, inp: metric.value, fid: metric.value }));
          trackTiming('web_vitals_inp', metric.value, 'web_vitals');
        });
      } catch {
        // web-vitals not available, use fallback measurements
        if (debug) {
          console.log('[Analytics] web-vitals library not available, using fallback');
        }

        // Fallback: Use Performance API
        if (window.performance && window.performance.getEntriesByType) {
          const navigationEntries = window.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
          if (navigationEntries.length > 0) {
            const nav = navigationEntries[0];
            const ttfb = nav.responseStart - nav.requestStart;
            setWebVitals((prev) => ({ ...prev, ttfb }));
            trackTiming('web_vitals_ttfb', ttfb, 'web_vitals');
          }

          const paintEntries = window.performance.getEntriesByType('paint');
          const fcpEntry = paintEntries.find((e) => e.name === 'first-contentful-paint');
          if (fcpEntry) {
            setWebVitals((prev) => ({ ...prev, fcp: fcpEntry.startTime }));
            trackTiming('web_vitals_fcp', fcpEntry.startTime, 'web_vitals');
          }
        }
      }
    };

    // Delay to ensure page has loaded
    const timer = setTimeout(reportWebVitals, 0);

    return () => clearTimeout(timer);
  }, [trackWebVitals, debug]);

  // ============================================================================
  // Performance Tracking
  // ============================================================================

  useEffect(() => {
    if (!trackPerformance || typeof window === 'undefined') return;

    // Track initial page load time
    if (window.performance && window.performance.timing) {
      const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
      if (loadTime > 0) {
        trackTiming('page_load', loadTime, 'performance');
      }
    }

    // Track long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              trackTiming('long_task', entry.duration, 'performance');
            }
          }
        });

        longTaskObserver.observe({ entryTypes: ['longtask'] });

        return () => longTaskObserver.disconnect();
      } catch {
        // Long task observer not supported
      }
    }
  }, [trackPerformance]);

  // ============================================================================
  // Context Methods
  // ============================================================================

  const handleTrackEvent = useCallback((name: string, properties?: Record<string, unknown>) => {
    analytics.trackEvent(name, properties);
  }, []);

  const handleTrackFeature = useCallback((feature: FeatureName, metadata?: Record<string, unknown>) => {
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, { feature, ...metadata });
  }, []);

  const handleTrackTiming = useCallback((name: string, duration: number, category?: string) => {
    analytics.trackTiming(name, duration, category);
  }, []);

  const handleSetEnabled = useCallback((enabled: boolean) => {
    analytics.setEnabled(enabled);
    setIsEnabledState(enabled);
  }, []);

  const handleSetAnonymousMode = useCallback((anonymous: boolean) => {
    analytics.setAnonymousMode(anonymous);
    setIsAnonymousModeState(anonymous);
  }, []);

  const handleSetConsent = useCallback((given: boolean) => {
    analytics.setConsent(given);
    setHasConsentState(given);
  }, []);

  const startMark = useCallback((name: string) => {
    performanceMarks.current.set(name, performance.now());

    if (typeof window !== 'undefined' && window.performance?.mark) {
      try {
        window.performance.mark(`${name}_start`);
      } catch {
        // Mark failed
      }
    }
  }, []);

  const endMark = useCallback((name: string) => {
    const startTime = performanceMarks.current.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      performanceMarks.current.delete(name);
      handleTrackTiming(name, duration, 'custom');

      if (typeof window !== 'undefined' && window.performance?.mark) {
        try {
          window.performance.mark(`${name}_end`);
          window.performance.measure(name, `${name}_start`, `${name}_end`);
        } catch {
          // Measure failed
        }
      }
    }
  }, [handleTrackTiming]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const contextValue: AnalyticsContextValue = {
    trackEvent: handleTrackEvent,
    trackFeature: handleTrackFeature,
    trackTiming: handleTrackTiming,
    isEnabled,
    setEnabled: handleSetEnabled,
    isAnonymousMode,
    setAnonymousMode: handleSetAnonymousMode,
    hasConsent,
    setConsent: handleSetConsent,
    webVitals,
    startMark,
    endMark,
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useAnalyticsContext(): AnalyticsContextValue {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }

  return context;
}

// ============================================================================
// Error Boundary Component
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorId: string, reset: () => void) => ReactNode);
  onError?: (error: Error, errorId: string) => void;
}

export class AnalyticsErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorId: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const errorId = errorMonitoring.captureErrorBoundary(error, {
      componentStack: errorInfo.componentStack || undefined,
    });

    this.setState({ errorId });

    if (this.props.onError) {
      this.props.onError(error, errorId);
    }
  }

  handleReset = (): void => {
    addBreadcrumb({
      type: 'user',
      category: 'error_boundary',
      message: 'Error boundary reset by user',
      level: 'info',
    });

    this.setState({ hasError: false, error: null, errorId: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(
          this.state.error,
          this.state.errorId || 'unknown',
          this.handleReset
        );
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            We apologize for the inconvenience. Please try again.
          </p>
          {this.state.errorId && (
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Error ID: {this.state.errorId}
            </p>
          )}
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// Consent Banner Component
// ============================================================================

interface ConsentBannerProps {
  onAccept: () => void;
  onDecline: () => void;
  onCustomize?: () => void;
  privacyPolicyUrl?: string;
}

export function ConsentBanner({
  onAccept,
  onDecline,
  onCustomize,
  privacyPolicyUrl = '/privacy',
}: ConsentBannerProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[var(--glass-bg)] backdrop-blur-xl border-t border-[var(--glass-border)]">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-[var(--text-muted)]">
          <p>
            We use analytics to improve your experience. Your data is never sold and is handled
            according to our{' '}
            <a href={privacyPolicyUrl} className="text-[var(--primary)] hover:underline">
              privacy policy
            </a>
            . You can opt out at any time in settings.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onCustomize && (
            <button
              onClick={onCustomize}
              className="px-4 py-2 text-sm text-[var(--text-muted)] hover:text-foreground transition-colors"
            >
              Customize
            </button>
          )}
          <button
            onClick={onDecline}
            className="px-4 py-2 text-sm border border-[var(--glass-border)] rounded-lg hover:bg-[var(--glass-bg)] transition-colors"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="px-4 py-2 text-sm bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Re-export Features for convenience
// ============================================================================

export { Features };
export type { FeatureName };
