'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useRef, useMemo, useEffect } from 'react';

import {
  analytics,
  AnalyticsEvents,
  Features,
  trackSessionStarted,
  trackSessionCompleted,
  trackSessionAbandoned,
  trackExerciseSubstituted,
  trackExerciseSkipped,
  trackPainLogged,
  trackCheckinCompleted,
  trackPlanGenerated,
  trackPlanModified,
  type FeatureName,
} from '../lib/analytics';
import { addBreadcrumb, addUIBreadcrumb, addUserBreadcrumb } from '../lib/error-monitoring';

// ============================================================================
// Types
// ============================================================================

export interface UseAnalyticsOptions {
  /**
   * Debounce time in milliseconds for rapid events
   * @default 300
   */
  debounceMs?: number;

  /**
   * Auto-include common properties with every event
   */
  commonProperties?: Record<string, unknown>;

  /**
   * Component or feature name for context
   */
  componentName?: string;
}

export interface UseAnalyticsReturn {
  // Core tracking
  trackEvent: (name: string, properties?: Record<string, unknown>) => void;
  trackFeature: (feature: FeatureName, metadata?: Record<string, unknown>) => void;

  // Session tracking
  trackSessionStart: (sessionId: string, metadata?: Record<string, unknown>) => void;
  trackSessionComplete: (sessionId: string, duration: number, metadata?: Record<string, unknown>) => void;
  trackSessionAbandon: (sessionId: string, progress: number, reason?: string) => void;

  // Exercise tracking
  trackExerciseSubstitute: (original: string, replacement: string, reason?: string) => void;
  trackExerciseSkip: (exerciseId: string, reason?: string) => void;

  // Health tracking
  trackPainLog: (region: string, level: number) => void;
  trackCheckin: (type: string, metadata?: Record<string, unknown>) => void;

  // Plan tracking
  trackPlanGenerate: (planType: string, exerciseCount: number) => void;
  trackPlanModify: (modificationType: string, details?: Record<string, unknown>) => void;

  // UI interaction tracking
  trackClick: (element: string, data?: Record<string, unknown>) => void;
  trackFormSubmit: (formName: string, success: boolean, data?: Record<string, unknown>) => void;
  trackModalOpen: (modalName: string) => void;
  trackModalClose: (modalName: string, action?: string) => void;

  // Performance
  measureDuration: <T>(name: string, fn: () => T) => T;
  measureAsyncDuration: <T>(name: string, fn: () => Promise<T>) => Promise<T>;

  // State
  isEnabled: boolean;
}

// ============================================================================
// Debounce Helper
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCalledRef = useRef<number>(0);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: unknown[]) => {
      const now = Date.now();

      // If enough time has passed, call immediately
      if (now - lastCalledRef.current >= delay) {
        lastCalledRef.current = now;
        callbackRef.current(...args);
        return;
      }

      // Otherwise, debounce
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        lastCalledRef.current = Date.now();
        callbackRef.current(...args);
      }, delay - (now - lastCalledRef.current));
    }) as T,
    [delay]
  );
}

// ============================================================================
// useAnalytics Hook
// ============================================================================

export function useAnalytics(options: UseAnalyticsOptions = {}): UseAnalyticsReturn {
  const {
    debounceMs = 300,
    commonProperties = {},
    componentName,
  } = options;

  const pathname = usePathname();

  // Build common properties
  const buildProperties = useCallback(
    (properties?: Record<string, unknown>): Record<string, unknown> => {
      return {
        ...commonProperties,
        ...(componentName && { component: componentName }),
        route: pathname,
        ...properties,
      };
    },
    [commonProperties, componentName, pathname]
  );

  // ============================================================================
  // Core Tracking
  // ============================================================================

  const trackEventRaw = useCallback(
    (name: string, properties?: Record<string, unknown>) => {
      analytics.trackEvent(name, buildProperties(properties));
    },
    [buildProperties]
  );

  const trackEvent = useDebouncedCallback(trackEventRaw, debounceMs);

  const trackFeature = useCallback(
    (feature: FeatureName, metadata?: Record<string, unknown>) => {
      analytics.trackEvent(AnalyticsEvents.FEATURE_USED, buildProperties({ feature, ...metadata }));
      addUserBreadcrumb(`Used feature: ${feature}`, metadata);
    },
    [buildProperties]
  );

  // ============================================================================
  // Session Tracking
  // ============================================================================

  const trackSessionStart = useCallback(
    (sessionId: string, metadata?: Record<string, unknown>) => {
      trackSessionStarted(sessionId, buildProperties(metadata));
      addUserBreadcrumb('Session started', { sessionId });
    },
    [buildProperties]
  );

  const trackSessionComplete = useCallback(
    (sessionId: string, duration: number, metadata?: Record<string, unknown>) => {
      trackSessionCompleted(sessionId, duration, buildProperties(metadata));
      addUserBreadcrumb('Session completed', { sessionId, duration });
    },
    [buildProperties]
  );

  const trackSessionAbandon = useCallback(
    (sessionId: string, progress: number, reason?: string) => {
      trackSessionAbandoned(sessionId, progress, reason);
      addUserBreadcrumb('Session abandoned', { sessionId, progress, reason });
    },
    []
  );

  // ============================================================================
  // Exercise Tracking
  // ============================================================================

  const trackExerciseSubstitute = useCallback(
    (original: string, replacement: string, reason?: string) => {
      trackExerciseSubstituted(original, replacement, reason);
      addUserBreadcrumb('Exercise substituted', { original, replacement, reason });
    },
    []
  );

  const trackExerciseSkip = useCallback(
    (exerciseId: string, reason?: string) => {
      trackExerciseSkipped(exerciseId, reason);
      addUserBreadcrumb('Exercise skipped', { exerciseId, reason });
    },
    []
  );

  // ============================================================================
  // Health Tracking
  // ============================================================================

  const trackPainLog = useCallback(
    (region: string, level: number) => {
      trackPainLogged(region, level);
      addUserBreadcrumb('Pain logged', { region, level });
    },
    []
  );

  const trackCheckin = useCallback(
    (type: string, metadata?: Record<string, unknown>) => {
      trackCheckinCompleted(type, buildProperties(metadata));
      addUserBreadcrumb('Check-in completed', { type });
    },
    [buildProperties]
  );

  // ============================================================================
  // Plan Tracking
  // ============================================================================

  const trackPlanGenerate = useCallback(
    (planType: string, exerciseCount: number) => {
      trackPlanGenerated(planType, exerciseCount);
      addUserBreadcrumb('Plan generated', { planType, exerciseCount });
    },
    []
  );

  const trackPlanModify = useCallback(
    (modificationType: string, details?: Record<string, unknown>) => {
      trackPlanModified(modificationType, buildProperties(details));
      addUserBreadcrumb('Plan modified', { modificationType });
    },
    [buildProperties]
  );

  // ============================================================================
  // UI Interaction Tracking
  // ============================================================================

  const trackClick = useCallback(
    (element: string, data?: Record<string, unknown>) => {
      analytics.trackEvent('ui_click', buildProperties({ element, ...data }));
      addUIBreadcrumb('click', element, data);
    },
    [buildProperties]
  );

  const trackFormSubmit = useCallback(
    (formName: string, success: boolean, data?: Record<string, unknown>) => {
      analytics.trackEvent('form_submit', buildProperties({
        formName,
        success,
        ...data,
      }));
      addUIBreadcrumb('submit', formName, { success, ...data });
    },
    [buildProperties]
  );

  const trackModalOpen = useCallback(
    (modalName: string) => {
      analytics.trackEvent('modal_open', buildProperties({ modalName }));
      addUIBreadcrumb('open', `modal:${modalName}`);
    },
    [buildProperties]
  );

  const trackModalClose = useCallback(
    (modalName: string, action?: string) => {
      analytics.trackEvent('modal_close', buildProperties({ modalName, action }));
      addUIBreadcrumb('close', `modal:${modalName}`, { action });
    },
    [buildProperties]
  );

  // ============================================================================
  // Performance Measurement
  // ============================================================================

  const measureDuration = useCallback(
    <T>(name: string, fn: () => T): T => {
      const start = performance.now();
      try {
        const result = fn();
        const duration = performance.now() - start;
        analytics.trackTiming(name, duration, 'custom');
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        analytics.trackTiming(`${name}_error`, duration, 'custom');
        throw error;
      }
    },
    []
  );

  const measureAsyncDuration = useCallback(
    async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
      const start = performance.now();
      try {
        const result = await fn();
        const duration = performance.now() - start;
        analytics.trackTiming(name, duration, 'custom');
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        analytics.trackTiming(`${name}_error`, duration, 'custom');
        throw error;
      }
    },
    []
  );

  // ============================================================================
  // Return Value
  // ============================================================================

  return useMemo(
    () => ({
      trackEvent,
      trackFeature,
      trackSessionStart,
      trackSessionComplete,
      trackSessionAbandon,
      trackExerciseSubstitute,
      trackExerciseSkip,
      trackPainLog,
      trackCheckin,
      trackPlanGenerate,
      trackPlanModify,
      trackClick,
      trackFormSubmit,
      trackModalOpen,
      trackModalClose,
      measureDuration,
      measureAsyncDuration,
      isEnabled: analytics.isEnabled(),
    }),
    [
      trackEvent,
      trackFeature,
      trackSessionStart,
      trackSessionComplete,
      trackSessionAbandon,
      trackExerciseSubstitute,
      trackExerciseSkip,
      trackPainLog,
      trackCheckin,
      trackPlanGenerate,
      trackPlanModify,
      trackClick,
      trackFormSubmit,
      trackModalOpen,
      trackModalClose,
      measureDuration,
      measureAsyncDuration,
    ]
  );
}

// ============================================================================
// Specialized Hooks
// ============================================================================

/**
 * Hook for tracking session-related analytics
 */
export function useSessionAnalytics(sessionId?: string) {
  const { trackSessionStart, trackSessionComplete, trackSessionAbandon } = useAnalytics({
    componentName: 'session',
  });

  const currentSessionId = useRef(sessionId);
  const sessionStartTime = useRef<number | null>(null);

  useEffect(() => {
    currentSessionId.current = sessionId;
  }, [sessionId]);

  const startSession = useCallback(
    (id?: string, metadata?: Record<string, unknown>) => {
      const sid = id || currentSessionId.current;
      if (!sid) return;

      sessionStartTime.current = Date.now();
      trackSessionStart(sid, metadata);
    },
    [trackSessionStart]
  );

  const completeSession = useCallback(
    (metadata?: Record<string, unknown>) => {
      const sid = currentSessionId.current;
      if (!sid) return;

      const duration = sessionStartTime.current
        ? Date.now() - sessionStartTime.current
        : 0;

      trackSessionComplete(sid, duration, metadata);
      sessionStartTime.current = null;
    },
    [trackSessionComplete]
  );

  const abandonSession = useCallback(
    (progress: number, reason?: string) => {
      const sid = currentSessionId.current;
      if (!sid) return;

      trackSessionAbandon(sid, progress, reason);
      sessionStartTime.current = null;
    },
    [trackSessionAbandon]
  );

  return {
    startSession,
    completeSession,
    abandonSession,
    isSessionActive: sessionStartTime.current !== null,
  };
}

/**
 * Hook for tracking feature usage with automatic component context
 */
export function useFeatureAnalytics(featureName: FeatureName) {
  const { trackFeature, trackEvent, trackClick } = useAnalytics({
    componentName: featureName,
  });

  const trackFeatureUsed = useCallback(
    (metadata?: Record<string, unknown>) => {
      trackFeature(featureName, metadata);
    },
    [trackFeature, featureName]
  );

  const trackFeatureAction = useCallback(
    (action: string, metadata?: Record<string, unknown>) => {
      trackEvent(`${featureName}_${action}`, metadata);
    },
    [trackEvent, featureName]
  );

  const trackFeatureClick = useCallback(
    (element: string, data?: Record<string, unknown>) => {
      trackClick(`${featureName}:${element}`, data);
    },
    [trackClick, featureName]
  );

  // Track feature view on mount
  useEffect(() => {
    trackFeatureUsed({ action: 'view' });
  }, [trackFeatureUsed]);

  return {
    trackFeatureUsed,
    trackFeatureAction,
    trackFeatureClick,
  };
}

/**
 * Hook for tracking form interactions
 */
export function useFormAnalytics(formName: string) {
  const { trackFormSubmit, trackEvent, trackClick } = useAnalytics({
    componentName: `form:${formName}`,
  });

  const trackFieldFocus = useCallback(
    (fieldName: string) => {
      trackEvent('form_field_focus', { formName, fieldName });
    },
    [trackEvent, formName]
  );

  const trackFieldBlur = useCallback(
    (fieldName: string, hasValue: boolean) => {
      trackEvent('form_field_blur', { formName, fieldName, hasValue });
    },
    [trackEvent, formName]
  );

  const trackFieldError = useCallback(
    (fieldName: string, errorType: string) => {
      trackEvent('form_field_error', { formName, fieldName, errorType });
    },
    [trackEvent, formName]
  );

  const trackSubmit = useCallback(
    (success: boolean, data?: Record<string, unknown>) => {
      trackFormSubmit(formName, success, data);
    },
    [trackFormSubmit, formName]
  );

  return {
    trackFieldFocus,
    trackFieldBlur,
    trackFieldError,
    trackSubmit,
  };
}

// ============================================================================
// useTrackOnMount Hook
// ============================================================================

/**
 * Hook to track an event when a component mounts
 * Useful for tracking page views or feature usage on component render
 */
export function useTrackOnMount(
  eventName: string,
  properties?: Record<string, unknown>,
  options?: {
    /** Only track once per session */
    once?: boolean;
    /** Track on unmount as well */
    trackOnUnmount?: boolean;
    /** Event to track on unmount */
    unmountEventName?: string;
    /** Properties for unmount event */
    unmountProperties?: Record<string, unknown>;
  }
) {
  const { trackEvent } = useAnalytics();
  const hasTracked = useRef(false);
  const mountTime = useRef<number>(0);

  useEffect(() => {
    // Skip if already tracked and once is true
    if (options?.once && hasTracked.current) {
      return;
    }

    mountTime.current = Date.now();
    trackEvent(eventName, {
      ...properties,
      mountedAt: new Date().toISOString(),
    });
    hasTracked.current = true;

    // Cleanup function for unmount tracking
    return () => {
      if (options?.trackOnUnmount) {
        const duration = Date.now() - mountTime.current;
        trackEvent(options.unmountEventName || `${eventName}_unmount`, {
          ...options.unmountProperties,
          duration,
          unmountedAt: new Date().toISOString(),
        });
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Hook to track page view on mount with automatic duration tracking on unmount
 */
export function useTrackPageView(pageName: string, properties?: Record<string, unknown>) {
  useTrackOnMount(`page_view_${pageName}`, properties, {
    trackOnUnmount: true,
    unmountEventName: `page_leave_${pageName}`,
  });
}

/**
 * Hook to track component visibility and time spent
 */
export function useTrackVisibility(
  componentName: string,
  options?: {
    /** Threshold for considering component visible (0-1) */
    threshold?: number;
    /** Minimum time visible before tracking (ms) */
    minVisibleTime?: number;
  }
) {
  const { trackEvent } = useAnalytics();
  const elementRef = useRef<HTMLElement | null>(null);
  const visibleStartTime = useRef<number | null>(null);
  const totalVisibleTime = useRef<number>(0);
  const hasTrackedFirstView = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const threshold = options?.threshold ?? 0.5;
    const minVisibleTime = options?.minVisibleTime ?? 1000;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleStartTime.current = Date.now();

            // Track first view
            if (!hasTrackedFirstView.current) {
              trackEvent(`${componentName}_first_view`, {
                threshold,
                intersectionRatio: entry.intersectionRatio,
              });
              hasTrackedFirstView.current = true;
            }
          } else if (visibleStartTime.current) {
            const duration = Date.now() - visibleStartTime.current;
            totalVisibleTime.current += duration;

            if (duration >= minVisibleTime) {
              trackEvent(`${componentName}_viewed`, {
                duration,
                totalVisibleTime: totalVisibleTime.current,
              });
            }

            visibleStartTime.current = null;
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();

      // Track final visibility on unmount
      if (visibleStartTime.current) {
        const duration = Date.now() - visibleStartTime.current;
        totalVisibleTime.current += duration;
      }

      if (totalVisibleTime.current >= minVisibleTime) {
        trackEvent(`${componentName}_total_viewed`, {
          totalVisibleTime: totalVisibleTime.current,
        });
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentName]);

  return elementRef;
}

// ============================================================================
// Re-exports
// ============================================================================

export { Features, AnalyticsEvents };
