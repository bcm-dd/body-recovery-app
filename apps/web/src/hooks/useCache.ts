'use client';

import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// ============================================
// CACHE CONFIGURATION
// ============================================

interface CacheConfig {
  /** Time in milliseconds before data is considered stale */
  staleTime?: number;
  /** Time in milliseconds to keep unused data in cache */
  cacheTime?: number;
  /** Retry failed requests */
  retry?: boolean | number;
  /** Refetch on window focus */
  refetchOnWindowFocus?: boolean;
  /** Refetch on reconnect */
  refetchOnReconnect?: boolean;
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
  retry: 3,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
};

// ============================================
// CACHED DATA HOOK
// ============================================

interface UseCachedDataOptions<T> extends CacheConfig {
  /** Initial data while loading */
  initialData?: T;
  /** Enable/disable the query */
  enabled?: boolean;
  /** On success callback */
  onSuccess?: (data: T) => void;
  /** On error callback */
  onError?: (error: Error) => void;
}

/**
 * Hook for fetching and caching data with React Query
 */
export function useCachedData<T>(
  key: string | readonly unknown[],
  fetcher: () => Promise<T>,
  options: UseCachedDataOptions<T> = {}
) {
  const {
    staleTime = DEFAULT_CACHE_CONFIG.staleTime,
    cacheTime = DEFAULT_CACHE_CONFIG.cacheTime,
    retry = DEFAULT_CACHE_CONFIG.retry,
    refetchOnWindowFocus = DEFAULT_CACHE_CONFIG.refetchOnWindowFocus,
    refetchOnReconnect = DEFAULT_CACHE_CONFIG.refetchOnReconnect,
    initialData,
    enabled = true,
    onSuccess,
    onError,
  } = options;

  const queryKey = typeof key === 'string' ? [key] : key;

  return useQuery({
    queryKey,
    queryFn: fetcher,
    staleTime,
    gcTime: cacheTime,
    retry,
    refetchOnWindowFocus,
    refetchOnReconnect,
    initialData,
    enabled,
  });
}

// ============================================
// OPTIMISTIC MUTATION HOOK
// ============================================

interface UseOptimisticMutationOptions<TData, TVariables> {
  /** Query key to invalidate on success */
  invalidateKeys?: (string | readonly unknown[])[];
  /** Optimistically update cache before mutation */
  optimisticUpdate?: (variables: TVariables) => TData;
  /** On success callback */
  onSuccess?: (data: TData) => void;
  /** On error callback */
  onError?: (error: Error, variables: TVariables, context: any) => void;
  /** On settled callback (success or error) */
  onSettled?: () => void;
}

/**
 * Hook for mutations with optimistic updates
 */
export function useOptimisticMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseOptimisticMutationOptions<TData, TVariables> = {}
) {
  const queryClient = useQueryClient();
  const {
    invalidateKeys = [],
    optimisticUpdate,
    onSuccess,
    onError,
    onSettled,
  } = options;

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      for (const key of invalidateKeys) {
        const queryKey = typeof key === 'string' ? [key] : key;
        await queryClient.cancelQueries({ queryKey });
      }

      // Snapshot previous values
      const previousData: Record<string, unknown> = {};
      for (const key of invalidateKeys) {
        const queryKey = typeof key === 'string' ? [key] : key;
        previousData[JSON.stringify(queryKey)] = queryClient.getQueryData(queryKey);
      }

      // Optimistically update cache
      if (optimisticUpdate) {
        const optimisticData = optimisticUpdate(variables);
        for (const key of invalidateKeys) {
          const queryKey = typeof key === 'string' ? [key] : key;
          queryClient.setQueryData(queryKey, optimisticData);
        }
      }

      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        for (const [keyStr, data] of Object.entries(context.previousData)) {
          const queryKey = JSON.parse(keyStr);
          queryClient.setQueryData(queryKey, data);
        }
      }
      onError?.(error as Error, variables, context);
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onSettled: () => {
      // Invalidate queries to refetch
      for (const key of invalidateKeys) {
        const queryKey = typeof key === 'string' ? [key] : key;
        queryClient.invalidateQueries({ queryKey });
      }
      onSettled?.();
    },
  });
}

// ============================================
// PREFETCH DATA HOOK
// ============================================

/**
 * Hook to prefetch data before it's needed
 */
export function usePrefetch() {
  const queryClient = useQueryClient();

  const prefetch = useCallback(
    async <T>(
      key: string | readonly unknown[],
      fetcher: () => Promise<T>,
      options: { staleTime?: number } = {}
    ) => {
      const queryKey = typeof key === 'string' ? [key] : key;
      const { staleTime = DEFAULT_CACHE_CONFIG.staleTime } = options;

      await queryClient.prefetchQuery({
        queryKey,
        queryFn: fetcher,
        staleTime,
      });
    },
    [queryClient]
  );

  return { prefetch };
}

// ============================================
// INVALIDATE CACHE HOOK
// ============================================

/**
 * Hook to manually invalidate cached data
 */
export function useInvalidateCache() {
  const queryClient = useQueryClient();

  const invalidate = useCallback(
    (keys: (string | readonly unknown[])[]) => {
      for (const key of keys) {
        const queryKey = typeof key === 'string' ? [key] : key;
        queryClient.invalidateQueries({ queryKey });
      }
    },
    [queryClient]
  );

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  return { invalidate, invalidateAll };
}

// ============================================
// IN-MEMORY CACHE WITH TTL
// ============================================

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
export const memoryCache = new MemoryCache();

// ============================================
// USE MEMORY CACHE HOOK
// ============================================

/**
 * Hook for using the in-memory cache
 */
export function useMemoryCache<T>(
  key: string,
  fetcher: () => Promise<T> | T,
  ttl: number = 5 * 60 * 1000
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(() => memoryCache.get<T>(key));
  const [isLoading, setIsLoading] = useState(!memoryCache.has(key));
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    // Check cache first
    const cached = memoryCache.get<T>(key);
    if (cached !== null) {
      setData(cached);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      memoryCache.set(key, result, ttl);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, ttl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    memoryCache.delete(key);
    await fetchData();
  }, [key, fetchData]);

  return { data, isLoading, error, refetch };
}

// ============================================
// STALE WHILE REVALIDATE PATTERN
// ============================================

/**
 * Hook implementing stale-while-revalidate pattern
 */
export function useStaleWhileRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    staleTime?: number;
    revalidateOnFocus?: boolean;
    revalidateOnReconnect?: boolean;
  } = {}
): {
  data: T | null;
  isStale: boolean;
  isValidating: boolean;
  error: Error | null;
  mutate: (data: T) => void;
} {
  const {
    staleTime = 60 * 1000, // 1 minute
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lastFetchRef = useRef<number>(0);

  const isStale = useMemo(() => {
    return Date.now() - lastFetchRef.current > staleTime;
  }, [staleTime, data]);

  const revalidate = useCallback(async () => {
    setIsValidating(true);
    try {
      const result = await fetcher();
      setData(result);
      lastFetchRef.current = Date.now();
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsValidating(false);
    }
  }, [fetcher]);

  // Initial fetch
  useEffect(() => {
    revalidate();
  }, [key]);

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const handleFocus = () => {
      if (isStale) {
        revalidate();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [revalidateOnFocus, isStale, revalidate]);

  // Revalidate on reconnect
  useEffect(() => {
    if (!revalidateOnReconnect) return;

    const handleOnline = () => {
      if (isStale) {
        revalidate();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [revalidateOnReconnect, isStale, revalidate]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);

  return { data, isStale, isValidating, error, mutate };
}
