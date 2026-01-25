'use client';

// ============================================
// CORE WEB VITALS TRACKING
// ============================================

export type WebVitalName = 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';

export interface WebVitalMetric {
  name: WebVitalName;
  value: number;
  delta: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType?: 'navigate' | 'reload' | 'back-forward' | 'prerender';
}

// Thresholds based on Google's Core Web Vitals guidelines
const THRESHOLDS: Record<WebVitalName, [number, number]> = {
  CLS: [0.1, 0.25],
  FID: [100, 300],
  FCP: [1800, 3000],
  LCP: [2500, 4000],
  TTFB: [800, 1800],
  INP: [200, 500],
};

/**
 * Get rating based on metric value
 */
function getRating(name: WebVitalName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const [good, poor] = THRESHOLDS[name];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Default Web Vitals reporter - logs to console in development
 */
export function defaultReporter(metric: WebVitalMetric): void {
  if (process.env.NODE_ENV === 'development') {
    const color = metric.rating === 'good'
      ? '#22c55e'
      : metric.rating === 'needs-improvement'
      ? '#f59e0b'
      : '#ef4444';

    console.log(
      `%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`,
      `color: ${color}; font-weight: bold;`
    );
  }
}

// ============================================
// WEB VITALS MEASUREMENT
// ============================================

type ReportCallback = (metric: WebVitalMetric) => void;

let reportCallback: ReportCallback = defaultReporter;

/**
 * Set custom reporter for Web Vitals
 */
export function setWebVitalsReporter(callback: ReportCallback): void {
  reportCallback = callback;
}

/**
 * Initialize Core Web Vitals tracking
 */
export async function initWebVitals(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // Dynamically import web-vitals to reduce initial bundle size
    // Note: FID was deprecated in web-vitals v4+ in favor of INP
    const { onCLS, onFCP, onLCP, onTTFB, onINP } = await import('web-vitals');

    const createHandler = (name: WebVitalName) => (metric: any) => {
      reportCallback({
        name,
        value: metric.value,
        delta: metric.delta,
        id: metric.id,
        rating: getRating(name, metric.value),
        navigationType: metric.navigationType,
      });
    };

    onCLS(createHandler('CLS'));
    onFCP(createHandler('FCP'));
    onLCP(createHandler('LCP'));
    onTTFB(createHandler('TTFB'));
    onINP(createHandler('INP'));
  } catch (error) {
    // web-vitals not available, silently fail
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Web Vitals] Could not initialize:', error);
    }
  }
}

// ============================================
// LAYOUT SHIFT PREVENTION
// ============================================

/**
 * CSS for preventing layout shift with aspect ratio
 */
export function getAspectRatioStyles(width: number, height: number): React.CSSProperties {
  return {
    aspectRatio: `${width} / ${height}`,
    width: '100%',
    height: 'auto',
  };
}

/**
 * Reserve space for an image to prevent CLS
 */
export function getImagePlaceholderStyles(width: number, height: number): React.CSSProperties {
  return {
    position: 'relative',
    paddingBottom: `${(height / width) * 100}%`,
    overflow: 'hidden',
  };
}

// ============================================
// PERFORMANCE MARKS AND MEASURES
// ============================================

/**
 * Mark the start of a performance measurement
 */
export function markStart(name: string): void {
  if (typeof performance === 'undefined') return;
  performance.mark(`${name}-start`);
}

/**
 * Mark the end and measure duration
 */
export function markEnd(name: string): number {
  if (typeof performance === 'undefined') return 0;

  performance.mark(`${name}-end`);

  try {
    const measure = performance.measure(
      name,
      `${name}-start`,
      `${name}-end`
    );
    return measure.duration;
  } catch {
    return 0;
  }
}

/**
 * Measure async function execution time
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  markStart(name);
  const result = await fn();
  const duration = markEnd(name);
  return { result, duration };
}

/**
 * Measure sync function execution time
 */
export function measureSync<T>(
  name: string,
  fn: () => T
): { result: T; duration: number } {
  markStart(name);
  const result = fn();
  const duration = markEnd(name);
  return { result, duration };
}

// ============================================
// RESOURCE TIMING
// ============================================

export interface ResourceTiming {
  name: string;
  type: string;
  duration: number;
  transferSize: number;
  decodedBodySize: number;
}

/**
 * Get resource timing data for performance analysis
 */
export function getResourceTimings(): ResourceTiming[] {
  if (typeof performance === 'undefined') return [];

  const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  return entries.map((entry) => ({
    name: entry.name,
    type: entry.initiatorType,
    duration: entry.duration,
    transferSize: entry.transferSize,
    decodedBodySize: entry.decodedBodySize,
  }));
}

/**
 * Get slow resources (over threshold duration)
 */
export function getSlowResources(threshold: number = 1000): ResourceTiming[] {
  return getResourceTimings().filter((r) => r.duration > threshold);
}

/**
 * Get large resources (over threshold size in bytes)
 */
export function getLargeResources(threshold: number = 100000): ResourceTiming[] {
  return getResourceTimings().filter((r) => r.transferSize > threshold);
}

// ============================================
// LONG TASK DETECTION
// ============================================

/**
 * Detect long tasks that block the main thread
 */
export function observeLongTasks(
  callback: (duration: number, attribution: string) => void,
  threshold: number = 50
): () => void {
  if (typeof PerformanceObserver === 'undefined') {
    return () => {};
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > threshold) {
          const attribution = (entry as any).attribution?.[0]?.name || 'unknown';
          callback(entry.duration, attribution);
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });

    return () => observer.disconnect();
  } catch {
    return () => {};
  }
}

// ============================================
// PAINT TIMING
// ============================================

export interface PaintTiming {
  FP: number | null; // First Paint
  FCP: number | null; // First Contentful Paint
}

/**
 * Get paint timing metrics
 */
export function getPaintTimings(): PaintTiming {
  if (typeof performance === 'undefined') {
    return { FP: null, FCP: null };
  }

  const entries = performance.getEntriesByType('paint');

  return {
    FP: entries.find((e) => e.name === 'first-paint')?.startTime ?? null,
    FCP: entries.find((e) => e.name === 'first-contentful-paint')?.startTime ?? null,
  };
}

// ============================================
// INTERACTION TIMING
// ============================================

/**
 * Measure time from user interaction to visual update
 */
export function measureInteractionToPaint(interactionName: string): () => void {
  const startTime = performance.now();

  // Return a function to call after the update is painted
  return () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;

        if (process.env.NODE_ENV === 'development') {
          console.log(`[Interaction] ${interactionName}: ${duration.toFixed(2)}ms`);
        }
      });
    });
  };
}

// ============================================
// MEMORY USAGE (Chrome only)
// ============================================

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

/**
 * Get memory usage information (Chrome only)
 */
export function getMemoryUsage(): MemoryInfo | null {
  if (typeof performance === 'undefined') return null;

  const memory = (performance as any).memory;
  if (!memory) return null;

  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
  };
}

// ============================================
// BUNDLE SIZE TRACKING
// ============================================

/**
 * Track JavaScript bundle sizes from network requests
 */
export function trackBundleSizes(): Map<string, number> {
  const bundles = new Map<string, number>();

  if (typeof performance === 'undefined') return bundles;

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  for (const resource of resources) {
    if (
      resource.initiatorType === 'script' ||
      resource.name.endsWith('.js') ||
      resource.name.includes('/_next/static/')
    ) {
      bundles.set(resource.name, resource.transferSize);
    }
  }

  return bundles;
}

// ============================================
// PERFORMANCE BUDGET
// ============================================

export interface PerformanceBudget {
  LCP?: number;
  FID?: number;
  CLS?: number;
  TTFB?: number;
  TotalJS?: number;
  TotalCSS?: number;
  TotalImages?: number;
}

const DEFAULT_BUDGET: PerformanceBudget = {
  LCP: 2500,
  FID: 100,
  CLS: 0.1,
  TTFB: 800,
  TotalJS: 300000, // 300KB
  TotalCSS: 100000, // 100KB
  TotalImages: 500000, // 500KB
};

/**
 * Check if metrics are within performance budget
 */
export function checkPerformanceBudget(
  budget: PerformanceBudget = DEFAULT_BUDGET
): { metric: string; value: number; budget: number; exceeded: boolean }[] {
  const results: { metric: string; value: number; budget: number; exceeded: boolean }[] = [];

  // Check resource sizes
  const resources = getResourceTimings();

  const totalJS = resources
    .filter((r) => r.type === 'script' || r.name.endsWith('.js'))
    .reduce((sum, r) => sum + r.transferSize, 0);

  const totalCSS = resources
    .filter((r) => r.type === 'link' || r.name.endsWith('.css'))
    .reduce((sum, r) => sum + r.transferSize, 0);

  const totalImages = resources
    .filter((r) => r.type === 'img')
    .reduce((sum, r) => sum + r.transferSize, 0);

  if (budget.TotalJS) {
    results.push({
      metric: 'TotalJS',
      value: totalJS,
      budget: budget.TotalJS,
      exceeded: totalJS > budget.TotalJS,
    });
  }

  if (budget.TotalCSS) {
    results.push({
      metric: 'TotalCSS',
      value: totalCSS,
      budget: budget.TotalCSS,
      exceeded: totalCSS > budget.TotalCSS,
    });
  }

  if (budget.TotalImages) {
    results.push({
      metric: 'TotalImages',
      value: totalImages,
      budget: budget.TotalImages,
      exceeded: totalImages > budget.TotalImages,
    });
  }

  return results;
}
