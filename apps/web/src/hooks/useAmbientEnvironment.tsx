'use client';

/**
 * useAmbientEnvironment Hook
 *
 * Manages the environmental state of the app - the visual atmosphere
 * that shifts based on user context, readiness, and session state.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import {
  calculateEnvironmentState,
  interpolateEnvironment,
  ENVIRONMENT_PRESETS,
  applyMicroWarmth,
  applyMicroCool,
  applySoften,
} from '../lib/ambient-ai/environment-state';
import type { EnvironmentState, FullAmbientContext } from '../lib/ambient-ai/types';

// ============================================
// TYPES
// ============================================

interface UseAmbientEnvironmentOptions {
  enabled?: boolean;
  transitionDuration?: number; // ms
  updateInterval?: number; // ms
}

interface UseAmbientEnvironmentReturn {
  // Current state
  environmentState: EnvironmentState;
  cssVariables: Record<string, string>;
  isTransitioning: boolean;

  // Actions
  setPreset: (preset: keyof typeof ENVIRONMENT_PRESETS) => void;
  applyWarmth: () => void;
  applyCoolness: () => void;
  soften: () => void;
  reset: () => void;

  // Manual control
  setEnvironment: (state: Partial<EnvironmentState>) => void;
  transitionTo: (state: EnvironmentState, duration?: number) => void;
}

// ============================================
// DEFAULT STATE
// ============================================

const DEFAULT_ENVIRONMENT: EnvironmentState = {
  colorTemperature: 4000,
  brightness: 0.85,
  saturation: 0.9,
  animationSpeed: 1.0,
  ambientMotion: 'breathing',
  cssVariables: {},
};

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useAmbientEnvironment(
  context: FullAmbientContext | null,
  options: UseAmbientEnvironmentOptions = {}
): UseAmbientEnvironmentReturn {
  const { enabled = true, transitionDuration = 2000, updateInterval = 5000 } = options;

  const [environmentState, setEnvironmentState] = useState<EnvironmentState>(DEFAULT_ENVIRONMENT);
  const [targetState, setTargetState] = useState<EnvironmentState>(DEFAULT_ENVIRONMENT);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const startStateRef = useRef<EnvironmentState>(DEFAULT_ENVIRONMENT);

  // Calculate target environment based on context
  const calculatedEnvironment = useMemo(() => {
    if (!enabled || !context) {
      return DEFAULT_ENVIRONMENT;
    }
    return calculateEnvironmentState(context);
  }, [context, enabled]);

  // Transition animation
  const animateTransition = useCallback(
    (from: EnvironmentState, to: EnvironmentState, duration: number) => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      setIsTransitioning(true);
      startTimeRef.current = performance.now();
      startStateRef.current = from;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-in-out function
        const eased =
          progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const interpolated = interpolateEnvironment(startStateRef.current, to, eased);
        setEnvironmentState(interpolated);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsTransitioning(false);
          setTargetState(to);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    },
    []
  );

  // Update environment when context changes
  useEffect(() => {
    if (!enabled) return;

    // Check if significant change
    const significantChange =
      Math.abs(calculatedEnvironment.colorTemperature - environmentState.colorTemperature) > 200 ||
      Math.abs(calculatedEnvironment.brightness - environmentState.brightness) > 0.1 ||
      Math.abs(calculatedEnvironment.saturation - environmentState.saturation) > 0.1;

    if (significantChange) {
      animateTransition(environmentState, calculatedEnvironment, transitionDuration);
    }
  }, [calculatedEnvironment, enabled]);

  // Periodic subtle updates
  useEffect(() => {
    if (!enabled || !context) return;

    const interval = setInterval(() => {
      // Only update if not currently transitioning
      if (!isTransitioning) {
        const newState = calculateEnvironmentState(context);
        // Only apply subtle changes
        const subtleChange =
          Math.abs(newState.colorTemperature - environmentState.colorTemperature) < 200 &&
          Math.abs(newState.brightness - environmentState.brightness) < 0.1;

        if (subtleChange) {
          setEnvironmentState(newState);
        }
      }
    }, updateInterval);

    return () => clearInterval(interval);
  }, [context, enabled, updateInterval, isTransitioning, environmentState]);

  // Apply CSS variables to document
  useEffect(() => {
    if (!enabled) return;

    const root = document.documentElement;
    Object.entries(environmentState.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Cleanup
    return () => {
      Object.keys(environmentState.cssVariables).forEach((key) => {
        root.style.removeProperty(key);
      });
    };
  }, [environmentState.cssVariables, enabled]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // ============================================
  // ACTIONS
  // ============================================

  const setPreset = useCallback(
    (preset: keyof typeof ENVIRONMENT_PRESETS) => {
      const presetState = ENVIRONMENT_PRESETS[preset];
      animateTransition(environmentState, presetState, transitionDuration);
    },
    [environmentState, animateTransition, transitionDuration]
  );

  const applyWarmth = useCallback(() => {
    const warmed = applyMicroWarmth(environmentState);
    setEnvironmentState(warmed);
    // Revert after short duration
    setTimeout(() => {
      if (!isTransitioning) {
        setEnvironmentState(targetState);
      }
    }, 1500);
  }, [environmentState, targetState, isTransitioning]);

  const applyCoolness = useCallback(() => {
    const cooled = applyMicroCool(environmentState);
    setEnvironmentState(cooled);
    setTimeout(() => {
      if (!isTransitioning) {
        setEnvironmentState(targetState);
      }
    }, 1500);
  }, [environmentState, targetState, isTransitioning]);

  const soften = useCallback(() => {
    const softened = applySoften(environmentState);
    animateTransition(environmentState, softened, 1000);
  }, [environmentState, animateTransition]);

  const reset = useCallback(() => {
    animateTransition(environmentState, DEFAULT_ENVIRONMENT, transitionDuration);
  }, [environmentState, animateTransition, transitionDuration]);

  const setEnvironment = useCallback((state: Partial<EnvironmentState>) => {
    setEnvironmentState((prev) => ({
      ...prev,
      ...state,
      cssVariables: {
        ...prev.cssVariables,
        ...(state.cssVariables || {}),
      },
    }));
  }, []);

  const transitionTo = useCallback(
    (state: EnvironmentState, duration?: number) => {
      animateTransition(environmentState, state, duration ?? transitionDuration);
    },
    [environmentState, animateTransition, transitionDuration]
  );

  return {
    environmentState,
    cssVariables: environmentState.cssVariables,
    isTransitioning,
    setPreset,
    applyWarmth,
    applyCoolness,
    soften,
    reset,
    setEnvironment,
    transitionTo,
  };
}

// ============================================
// ENVIRONMENT OVERLAY COMPONENT
// ============================================

interface EnvironmentOverlayProps {
  cssVariables: Record<string, string>;
  className?: string;
}

export function EnvironmentOverlay({ cssVariables, className = '' }: EnvironmentOverlayProps) {
  const warmOverlay = cssVariables['--ambient-warm-overlay'] || 'transparent';
  const coolOverlay = cssVariables['--ambient-cool-overlay'] || 'transparent';

  return (
    <>
      {/* Warm overlay */}
      <div
        className={`fixed inset-0 pointer-events-none z-0 transition-colors duration-1000 ${className}`}
        style={{ backgroundColor: warmOverlay }}
        aria-hidden="true"
      />
      {/* Cool overlay */}
      <div
        className={`fixed inset-0 pointer-events-none z-0 transition-colors duration-1000 ${className}`}
        style={{ backgroundColor: coolOverlay }}
        aria-hidden="true"
      />
    </>
  );
}

export default useAmbientEnvironment;
