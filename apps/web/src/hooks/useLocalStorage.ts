'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for persisting state in localStorage
 * Provides a type-safe way to store and retrieve data from localStorage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to localStorage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * Hook to sync state with localStorage (for Zustand persist middleware on web)
 */
export function createWebStorageAdapter() {
  return {
    get: (key: string): string | null => {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem(key);
    },
    set: (key: string, value: string): void => {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(key, value);
    },
    delete: (key: string): void => {
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem(key);
    },
  };
}
