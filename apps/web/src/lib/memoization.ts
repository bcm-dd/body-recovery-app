'use client';

import { memo, useMemo, useCallback, useRef, useState, useEffect, type ComponentType } from 'react';

// ============================================
// MEMOIZATION UTILITIES
// ============================================

/**
 * Creates a memoized component with custom comparison function
 */
export function createMemoComponent<P extends object>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) {
  return memo(Component, propsAreEqual);
}

/**
 * Shallow equality check for props
 */
export function shallowEqual<T extends object>(objA: T, objB: T): boolean {
  if (objA === objB) return true;

  const keysA = Object.keys(objA) as (keyof T)[];
  const keysB = Object.keys(objB) as (keyof T)[];

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (objA[key] !== objB[key]) return false;
  }

  return true;
}

/**
 * Deep equality check for objects
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (typeof a !== 'object') return a === b;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => deepEqual(a[key], b[key]));
}

/**
 * Creates a props comparison function that ignores specified keys
 */
export function createPropsComparison<P extends object>(
  ignoreKeys: (keyof P)[]
): (prevProps: P, nextProps: P) => boolean {
  return (prevProps, nextProps) => {
    const keysA = Object.keys(prevProps) as (keyof P)[];
    const keysB = Object.keys(nextProps) as (keyof P)[];

    const filteredKeysA = keysA.filter((key) => !ignoreKeys.includes(key));
    const filteredKeysB = keysB.filter((key) => !ignoreKeys.includes(key));

    if (filteredKeysA.length !== filteredKeysB.length) return false;

    for (const key of filteredKeysA) {
      if (prevProps[key] !== nextProps[key]) return false;
    }

    return true;
  };
}

// ============================================
// HOOK UTILITIES
// ============================================

/**
 * Memoize a function with custom cache key generator
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string = (...args) => JSON.stringify(args)
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = keyGenerator(...args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Hook that returns a stable reference to a value
 * Only updates the reference when the value actually changes (deep comparison)
 */
export function useStableValue<T>(value: T): T {
  const ref = useRef<T>(value);

  if (!deepEqual(ref.current, value)) {
    ref.current = value;
  }

  return ref.current;
}

/**
 * Hook that returns a stable callback reference
 * The callback is always up-to-date but the reference never changes
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
    []
  );
}

/**
 * Hook that only re-renders when specific picked props change
 */
export function usePickedMemo<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return useMemo(() => {
    const picked: Partial<Pick<T, K>> = {};
    for (const key of keys) {
      picked[key] = obj[key];
    }
    return picked as Pick<T, K>;
  }, keys.map((key) => obj[key]));
}

/**
 * Hook to detect if a component is being re-rendered unnecessarily
 * Only works in development mode
 */
export function useWhyDidYouRender<T extends object>(
  componentName: string,
  props: T
): void {
  if (process.env.NODE_ENV !== 'development') return;

  const previousProps = useRef<T | null>(null);

  useEffect(() => {
    if (previousProps.current !== null) {
      const changedProps: string[] = [];
      const allKeys = new Set([
        ...Object.keys(previousProps.current),
        ...Object.keys(props),
      ]) as Set<keyof T>;

      for (const key of allKeys) {
        if (previousProps.current[key] !== props[key]) {
          changedProps.push(String(key));
        }
      }

      if (changedProps.length > 0) {
        console.log(`[WhyDidYouRender] ${componentName} re-rendered due to:`, changedProps);
      }
    }

    previousProps.current = props;
  });
}

// ============================================
// EXPENSIVE COMPUTATION HELPERS
// ============================================

/**
 * Create a lazy computed value that's only calculated when needed
 */
export function createLazyValue<T>(compute: () => T): () => T {
  let value: T | undefined;
  let computed = false;

  return () => {
    if (!computed) {
      value = compute();
      computed = true;
    }
    return value!;
  };
}

/**
 * Hook for lazy initialization of expensive values
 */
export function useLazyInit<T>(factory: () => T): T {
  const [value] = useState(factory);
  return value;
}

/**
 * Hook that computes a value only once per mount
 */
export function useComputeOnce<T>(compute: () => T): T {
  const ref = useRef<{ value: T; computed: boolean }>({
    value: undefined as unknown as T,
    computed: false,
  });

  if (!ref.current.computed) {
    ref.current.value = compute();
    ref.current.computed = true;
  }

  return ref.current.value;
}

// ============================================
// SELECTOR UTILITIES
// ============================================

type Selector<S, R> = (state: S) => R;

/**
 * Create a memoized selector
 */
export function createSelector<S, R1, Result>(
  selector1: Selector<S, R1>,
  combiner: (result1: R1) => Result
): Selector<S, Result>;
export function createSelector<S, R1, R2, Result>(
  selector1: Selector<S, R1>,
  selector2: Selector<S, R2>,
  combiner: (result1: R1, result2: R2) => Result
): Selector<S, Result>;
export function createSelector<S, R1, R2, R3, Result>(
  selector1: Selector<S, R1>,
  selector2: Selector<S, R2>,
  selector3: Selector<S, R3>,
  combiner: (result1: R1, result2: R2, result3: R3) => Result
): Selector<S, Result>;
export function createSelector(...args: any[]): any {
  const selectors = args.slice(0, -1);
  const combiner = args[args.length - 1];

  let lastResults: any[] | null = null;
  let lastValue: any = null;

  return (state: any) => {
    const results = selectors.map((selector: any) => selector(state));

    if (lastResults !== null) {
      const allEqual = results.every((result, index) => result === lastResults![index]);
      if (allEqual) {
        return lastValue;
      }
    }

    lastResults = results;
    lastValue = combiner(...results);
    return lastValue;
  };
}

// ============================================
// BATCH UPDATES
// ============================================

/**
 * Batch multiple state updates into a single render
 */
export function batchUpdates(callback: () => void): void {
  // React 18+ automatically batches updates
  // This is a compatibility wrapper for older patterns
  callback();
}

/**
 * Schedule an update for the next frame
 */
export function scheduleUpdate(callback: () => void): number {
  if (typeof requestAnimationFrame !== 'undefined') {
    return requestAnimationFrame(callback);
  }
  return setTimeout(callback, 16) as unknown as number;
}

/**
 * Cancel a scheduled update
 */
export function cancelScheduledUpdate(id: number): void {
  if (typeof cancelAnimationFrame !== 'undefined') {
    cancelAnimationFrame(id);
  } else {
    clearTimeout(id);
  }
}
