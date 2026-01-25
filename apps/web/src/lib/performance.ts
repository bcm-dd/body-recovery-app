'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';

// ============================================
// DEBOUNCE & THROTTLE UTILITIES
// ============================================

/**
 * Creates a debounced function that delays invoking the callback
 * until after `delay` milliseconds have elapsed since the last time it was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Creates a throttled function that only invokes the callback
 * at most once per every `limit` milliseconds.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          func.apply(this, lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

// ============================================
// REACT HOOKS FOR DEBOUNCE & THROTTLE
// ============================================

/**
 * Hook that returns a debounced version of the callback
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    debounce((...args: Parameters<T>) => {
      callbackRef.current(...args);
    }, delay),
    [delay]
  );
}

/**
 * Hook that returns a throttled version of the callback
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    throttle((...args: Parameters<T>) => {
      callbackRef.current(...args);
    }, limit),
    [limit]
  );
}

/**
 * Hook that returns a debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================
// PREFETCH UTILITIES
// ============================================

const prefetchedRoutes = new Set<string>();

/**
 * Prefetch a route's code on hover/focus for faster navigation
 */
export function prefetchRoute(href: string): void {
  if (prefetchedRoutes.has(href)) return;

  // Use Next.js router prefetch if available
  if (typeof window !== 'undefined' && 'next' in window) {
    const router = (window as any).__NEXT_DATA__?.router;
    if (router?.prefetch) {
      router.prefetch(href);
      prefetchedRoutes.add(href);
    }
  }
}

/**
 * Hook to prefetch a route on hover
 */
export function usePrefetchOnHover(href: string) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onMouseEnter = useCallback(() => {
    // Delay prefetch slightly to avoid prefetching on quick mouse movements
    timeoutRef.current = setTimeout(() => {
      prefetchRoute(href);
    }, 100);
  }, [href]);

  const onMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { onMouseEnter, onMouseLeave };
}

// ============================================
// LAZY LOADING UTILITIES
// ============================================

interface DynamicImportOptions {
  loading?: () => JSX.Element | null;
  ssr?: boolean;
}

/**
 * Create a lazily loaded component with proper loading states
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: DynamicImportOptions = {}
) {
  return dynamic(importFn, {
    loading: options.loading,
    ssr: options.ssr ?? true,
  });
}

// ============================================
// INTERSECTION OBSERVER FOR LAZY LOADING
// ============================================

/**
 * Hook for lazy loading content when it enters the viewport
 */
export function useLazyLoad(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Start loading before element is in view
        threshold: 0,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return [ref, isVisible];
}

// ============================================
// PERFORMANCE MEASUREMENT
// ============================================

/**
 * Measure and log performance of a function
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  if (process.env.NODE_ENV !== 'development') {
    return fn();
  }

  const start = performance.now();
  const result = fn();
  const end = performance.now();

  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);

  return result;
}

/**
 * Hook to measure render performance
 */
export function useRenderCount(componentName: string): void {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Render] ${componentName}: ${renderCount.current}`);
    }
  });
}

// ============================================
// MEMORY OPTIMIZATION
// ============================================

/**
 * Hook for memoizing expensive computations with deep equality check
 */
export function useDeepMemo<T>(
  factory: () => T,
  deps: any[]
): T {
  const ref = useRef<{ deps: any[]; value: T } | null>(null);

  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = { deps, value: factory() };
  }

  return ref.current.value;
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null || b === null) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }

  return true;
}

// ============================================
// IDLE CALLBACK UTILITIES
// ============================================

/**
 * Schedule non-urgent work during browser idle time
 */
export function requestIdleCallback(
  callback: () => void,
  options?: { timeout?: number }
): number {
  if (typeof window === 'undefined') return 0;

  if ('requestIdleCallback' in window) {
    return (window as any).requestIdleCallback(callback, options);
  }

  // Fallback for Safari and older browsers
  return setTimeout(callback, options?.timeout ?? 1) as unknown as number;
}

/**
 * Cancel a scheduled idle callback
 */
export function cancelIdleCallback(id: number): void {
  if (typeof window === 'undefined') return;

  if ('cancelIdleCallback' in window) {
    (window as any).cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Hook to run non-urgent work during idle time
 */
export function useIdleCallback(
  callback: () => void,
  deps: any[] = [],
  options?: { timeout?: number }
): void {
  useEffect(() => {
    const id = requestIdleCallback(callback, options);
    return () => cancelIdleCallback(id);
  }, deps);
}

// ============================================
// RESOURCE HINTS
// ============================================

/**
 * Preload a resource for faster loading
 */
export function preloadResource(
  href: string,
  as: 'script' | 'style' | 'image' | 'font' | 'fetch'
): void {
  if (typeof document === 'undefined') return;

  const existing = document.querySelector(`link[rel="preload"][href="${href}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;

  if (as === 'font') {
    link.crossOrigin = 'anonymous';
  }

  document.head.appendChild(link);
}

/**
 * Prefetch a resource for future navigation
 */
export function prefetchResource(href: string): void {
  if (typeof document === 'undefined') return;

  const existing = document.querySelector(`link[rel="prefetch"][href="${href}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;

  document.head.appendChild(link);
}

// ============================================
// WEB VITALS TRACKING
// ============================================

export interface WebVitalMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Report Web Vitals to analytics or console
 */
export function reportWebVitals(
  metric: WebVitalMetric,
  handler?: (metric: WebVitalMetric) => void
): void {
  if (handler) {
    handler(metric);
  } else if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
  }
}
