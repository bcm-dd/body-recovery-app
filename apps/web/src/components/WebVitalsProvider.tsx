'use client';

import type { ReactNode } from 'react';
import { useEffect, useCallback, createContext, useContext, useState } from 'react';

import { initWebVitals, setWebVitalsReporter, type WebVitalMetric, observeLongTasks, getPaintTimings } from '../lib/web-vitals';

// ============================================
// WEB VITALS CONTEXT
// ============================================

interface WebVitalsContextValue {
  /** Latest metrics collected */
  metrics: Map<string, WebVitalMetric>;
  /** Whether Web Vitals tracking is enabled */
  isEnabled: boolean;
  /** Enable/disable tracking */
  setEnabled: (enabled: boolean) => void;
  /** Get all collected metrics */
  getAllMetrics: () => WebVitalMetric[];
  /** Clear collected metrics */
  clearMetrics: () => void;
}

const WebVitalsContext = createContext<WebVitalsContextValue | null>(null);

/**
 * Hook to access Web Vitals context
 */
export function useWebVitals(): WebVitalsContextValue {
  const context = useContext(WebVitalsContext);
  if (!context) {
    throw new Error('useWebVitals must be used within a WebVitalsProvider');
  }
  return context;
}

// ============================================
// WEB VITALS PROVIDER
// ============================================

interface WebVitalsProviderProps {
  children: ReactNode;
  /** Custom reporter function */
  reporter?: (metric: WebVitalMetric) => void;
  /** Enable tracking immediately */
  enabled?: boolean;
  /** Report to console in development */
  debug?: boolean;
  /** Send metrics to analytics endpoint */
  analyticsEndpoint?: string;
}

/**
 * Provider component for tracking Web Vitals throughout the app
 */
export function WebVitalsProvider({
  children,
  reporter,
  enabled = true,
  debug = process.env.NODE_ENV === 'development',
  analyticsEndpoint,
}: WebVitalsProviderProps) {
  const [metrics, setMetrics] = useState<Map<string, WebVitalMetric>>(new Map());
  const [isEnabled, setIsEnabled] = useState(enabled);

  // Create the reporter function
  const handleMetric = useCallback((metric: WebVitalMetric) => {
    // Store the metric
    setMetrics((prev) => {
      const next = new Map(prev);
      next.set(metric.name, metric);
      return next;
    });

    // Debug logging
    if (debug) {
      const color = metric.rating === 'good'
        ? 'color: #22c55e'
        : metric.rating === 'needs-improvement'
        ? 'color: #f59e0b'
        : 'color: #ef4444';

      console.log(
        `%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`,
        color
      );
    }

    // Send to analytics endpoint
    if (analyticsEndpoint) {
      sendToAnalytics(analyticsEndpoint, metric);
    }

    // Call custom reporter
    if (reporter) {
      reporter(metric);
    }
  }, [debug, analyticsEndpoint, reporter]);

  // Initialize Web Vitals tracking
  useEffect(() => {
    if (!isEnabled) return;

    // Set the reporter
    setWebVitalsReporter(handleMetric);

    // Initialize Web Vitals
    initWebVitals();

    // Track long tasks
    const unsubscribeLongTasks = observeLongTasks((duration, attribution) => {
      if (debug) {
        console.warn(`[Long Task] ${duration.toFixed(2)}ms - ${attribution}`);
      }
    });

    return () => {
      unsubscribeLongTasks();
    };
  }, [isEnabled, handleMetric, debug]);

  // Log paint timings on load
  useEffect(() => {
    if (!debug) return;

    const timerId = setTimeout(() => {
      const paintTimings = getPaintTimings();
      if (paintTimings.FP) {
        console.log(`[Paint] First Paint: ${paintTimings.FP.toFixed(2)}ms`);
      }
      if (paintTimings.FCP) {
        console.log(`[Paint] First Contentful Paint: ${paintTimings.FCP.toFixed(2)}ms`);
      }
    }, 1000);

    return () => clearTimeout(timerId);
  }, [debug]);

  const getAllMetrics = useCallback(() => {
    return Array.from(metrics.values());
  }, [metrics]);

  const clearMetrics = useCallback(() => {
    setMetrics(new Map());
  }, []);

  const contextValue: WebVitalsContextValue = {
    metrics,
    isEnabled,
    setEnabled: setIsEnabled,
    getAllMetrics,
    clearMetrics,
  };

  return (
    <WebVitalsContext.Provider value={contextValue}>
      {children}
    </WebVitalsContext.Provider>
  );
}

// ============================================
// ANALYTICS SENDER
// ============================================

/**
 * Send metrics to analytics endpoint
 */
function sendToAnalytics(endpoint: string, metric: WebVitalMetric): void {
  // Use sendBeacon for better reliability
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(metric)], { type: 'application/json' });
    navigator.sendBeacon(endpoint, blob);
  } else {
    // Fallback to fetch
    fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(metric),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {
      // Silently fail - don't interrupt user experience
    });
  }
}

// ============================================
// WEB VITALS DISPLAY COMPONENT
// ============================================

interface WebVitalsDisplayProps {
  /** Show only in development */
  developmentOnly?: boolean;
  /** Position on screen */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Optional component to display Web Vitals on screen (for debugging)
 */
export function WebVitalsDisplay({
  developmentOnly = true,
  position = 'bottom-right',
}: WebVitalsDisplayProps) {
  const { metrics } = useWebVitals();
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development if specified
  if (developmentOnly && process.env.NODE_ENV !== 'development') {
    return null;
  }

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`fixed ${positionClasses[position]} z-50 p-2 rounded-full bg-gray-800/90 text-white text-xs font-mono shadow-lg hover:bg-gray-700/90 transition-colors`}
        title="Toggle Web Vitals"
      >
        {isVisible ? 'Hide' : 'Vitals'}
      </button>

      {/* Metrics panel */}
      {isVisible && (
        <div
          className={`fixed ${position.includes('bottom') ? 'bottom-14' : 'top-14'} ${position.includes('right') ? 'right-4' : 'left-4'} z-50 p-3 rounded-lg bg-gray-900/95 text-white text-xs font-mono shadow-xl backdrop-blur-sm min-w-[200px]`}
        >
          <h4 className="font-bold mb-2 text-sm">Web Vitals</h4>
          {Array.from(metrics.entries()).map(([name, metric]) => (
            <div key={name} className="flex justify-between items-center py-1 border-t border-gray-700">
              <span className="text-gray-300">{name}:</span>
              <span
                className={`font-medium ${
                  metric.rating === 'good'
                    ? 'text-green-400'
                    : metric.rating === 'needs-improvement'
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}
              >
                {metric.value.toFixed(name === 'CLS' ? 3 : 0)}
                {name !== 'CLS' && 'ms'}
              </span>
            </div>
          ))}
          {metrics.size === 0 && (
            <p className="text-gray-400 italic">Collecting metrics...</p>
          )}
        </div>
      )}
    </>
  );
}

// ============================================
// PERFORMANCE BUDGET WARNING
// ============================================

interface PerformanceBudgetWarningProps {
  /** Show warning when LCP exceeds this value (ms) */
  lcpThreshold?: number;
  /** Show warning when CLS exceeds this value */
  clsThreshold?: number;
  /** Show warning when FID/INP exceeds this value (ms) */
  interactionThreshold?: number;
}

/**
 * Component that warns when performance budgets are exceeded
 */
export function PerformanceBudgetWarning({
  lcpThreshold = 2500,
  clsThreshold = 0.1,
  interactionThreshold = 200,
}: PerformanceBudgetWarningProps) {
  const { metrics } = useWebVitals();
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    const newWarnings: string[] = [];

    const lcp = metrics.get('LCP');
    if (lcp && lcp.value > lcpThreshold) {
      newWarnings.push(`LCP is ${lcp.value.toFixed(0)}ms (budget: ${lcpThreshold}ms)`);
    }

    const cls = metrics.get('CLS');
    if (cls && cls.value > clsThreshold) {
      newWarnings.push(`CLS is ${cls.value.toFixed(3)} (budget: ${clsThreshold})`);
    }

    const inp = metrics.get('INP');
    if (inp && inp.value > interactionThreshold) {
      newWarnings.push(`INP is ${inp.value.toFixed(0)}ms (budget: ${interactionThreshold}ms)`);
    }

    const fid = metrics.get('FID');
    if (fid && fid.value > interactionThreshold) {
      newWarnings.push(`FID is ${fid.value.toFixed(0)}ms (budget: ${interactionThreshold}ms)`);
    }

    setWarnings(newWarnings);
  }, [metrics, lcpThreshold, clsThreshold, interactionThreshold]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development' || warnings.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 p-4 rounded-lg bg-yellow-500/90 text-black text-sm max-w-sm shadow-lg">
      <h4 className="font-bold mb-2">Performance Budget Exceeded</h4>
      <ul className="list-disc list-inside space-y-1">
        {warnings.map((warning, index) => (
          <li key={index}>{warning}</li>
        ))}
      </ul>
    </div>
  );
}
