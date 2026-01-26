'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { useReducedMotion } from './useMediaQuery';
import type {
  SpringConfig} from '../lib/animations';
import {
  springPresets,
  createSpringAnimation,
} from '../lib/animations';

/**
 * Hook for spring-based animations
 * Returns current animated value and controls
 */
export function useSpring(
  initialValue: number,
  config: SpringConfig | keyof typeof springPresets = 'default'
): {
  value: number;
  setValue: (target: number, immediate?: boolean) => void;
  isAnimating: boolean;
} {
  const [value, setValueState] = useState(initialValue);
  const [isAnimating, setIsAnimating] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const cancelRef = useRef<(() => void) | null>(null);

  // Get spring config
  const springConfig: SpringConfig =
    typeof config === 'string' ? springPresets[config] : config;

  const setValue = useCallback(
    (target: number, immediate = false) => {
      // Cancel any existing animation
      if (cancelRef.current) {
        cancelRef.current();
        cancelRef.current = null;
      }

      // If reduced motion or immediate, just set the value
      if (prefersReducedMotion || immediate) {
        setValueState(target);
        setIsAnimating(false);
        return;
      }

      setIsAnimating(true);

      cancelRef.current = createSpringAnimation(
        value,
        target,
        springConfig,
        (newValue) => {
          setValueState(newValue);
        },
        () => {
          setIsAnimating(false);
          cancelRef.current = null;
        }
      );
    },
    [value, springConfig, prefersReducedMotion]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cancelRef.current) {
        cancelRef.current();
      }
    };
  }, []);

  return { value, setValue, isAnimating };
}

/**
 * Hook for animating multiple values with spring physics
 */
export function useSpringValues<T extends Record<string, number>>(
  initialValues: T,
  config: SpringConfig | keyof typeof springPresets = 'default'
): {
  values: T;
  setValues: (updates: Partial<T>, immediate?: boolean) => void;
  isAnimating: boolean;
} {
  const [values, setValuesState] = useState(initialValues);
  const [isAnimating, setIsAnimating] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const cancelRefs = useRef<Map<string, () => void>>(new Map());

  const springConfig: SpringConfig =
    typeof config === 'string' ? springPresets[config] : config;

  const setValues = useCallback(
    (updates: Partial<T>, immediate = false) => {
      // Cancel existing animations for updated values
      Object.keys(updates).forEach((key) => {
        const cancel = cancelRefs.current.get(key);
        if (cancel) {
          cancel();
          cancelRefs.current.delete(key);
        }
      });

      if (prefersReducedMotion || immediate) {
        setValuesState((prev) => ({ ...prev, ...updates }));
        setIsAnimating(false);
        return;
      }

      setIsAnimating(true);
      let activeAnimations = Object.keys(updates).length;

      Object.entries(updates).forEach(([key, targetValue]) => {
        if (targetValue === undefined) return;

        const cancel = createSpringAnimation(
          values[key as keyof T],
          targetValue,
          springConfig,
          (newValue) => {
            setValuesState((prev) => ({
              ...prev,
              [key]: newValue,
            }));
          },
          () => {
            cancelRefs.current.delete(key);
            activeAnimations--;
            if (activeAnimations === 0) {
              setIsAnimating(false);
            }
          }
        );

        cancelRefs.current.set(key, cancel);
      });
    },
    [values, springConfig, prefersReducedMotion]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRefs.current.forEach((cancel) => cancel());
      cancelRefs.current.clear();
    };
  }, []);

  return { values, setValues, isAnimating };
}

/**
 * Hook for spring-animated transform values
 */
export function useSpringTransform(
  config: SpringConfig | keyof typeof springPresets = 'default'
): {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  setTransform: (
    updates: Partial<{ x: number; y: number; scale: number; rotation: number }>,
    immediate?: boolean
  ) => void;
  reset: () => void;
  style: React.CSSProperties;
  isAnimating: boolean;
} {
  const { values, setValues, isAnimating } = useSpringValues(
    { x: 0, y: 0, scale: 1, rotation: 0 },
    config
  );

  const reset = useCallback(() => {
    setValues({ x: 0, y: 0, scale: 1, rotation: 0 });
  }, [setValues]);

  const style: React.CSSProperties = {
    transform: `translate(${values.x}px, ${values.y}px) scale(${values.scale}) rotate(${values.rotation}deg)`,
  };

  return {
    ...values,
    setTransform: setValues,
    reset,
    style,
    isAnimating,
  };
}
