'use client';

import { useCallback, useEffect, useState } from 'react';

import type {
  HapticIntensity} from '../lib/haptics';
import {
  haptics,
  isHapticSupported,
  isHapticsEnabled,
  setHapticsEnabled
} from '../lib/haptics';
import { sounds, isSoundsEnabled, setSoundsEnabled } from '../lib/sounds';

/**
 * Hook for haptic feedback
 */
export function useHaptic(): {
  isSupported: boolean;
  isEnabled: boolean;
  enable: () => void;
  disable: () => void;
  toggle: () => boolean;
  // Haptic patterns
  tap: () => void;
  click: () => void;
  selection: () => void;
  success: () => void;
  warning: () => void;
  error: () => void;
  impact: (intensity?: HapticIntensity) => void;
} {
  const [isEnabled, setIsEnabled] = useState(false);
  const isSupported = isHapticSupported();

  // Initialize state from storage
  useEffect(() => {
    setIsEnabled(isHapticsEnabled());
  }, []);

  const enable = useCallback(() => {
    setHapticsEnabled(true);
    setIsEnabled(true);
  }, []);

  const disable = useCallback(() => {
    setHapticsEnabled(false);
    setIsEnabled(false);
  }, []);

  const toggle = useCallback(() => {
    const newState = !isEnabled;
    setHapticsEnabled(newState);
    setIsEnabled(newState);
    return newState;
  }, [isEnabled]);

  return {
    isSupported,
    isEnabled,
    enable,
    disable,
    toggle,
    tap: haptics.tap,
    click: haptics.click,
    selection: haptics.selection,
    success: haptics.success,
    warning: haptics.warning,
    error: haptics.error,
    impact: haptics.impact,
  };
}

/**
 * Hook for sound feedback
 */
export function useSound(): {
  isEnabled: boolean;
  enable: () => void;
  disable: () => void;
  toggle: () => boolean;
  volume: number;
  setVolume: (v: number) => void;
  // Sound methods
  click: () => void;
  toggleSound: (on: boolean) => void;
  success: () => void;
  complete: () => void;
  alert: () => void;
  warning: () => void;
  error: () => void;
  pop: () => void;
} {
  const [isEnabled, setIsEnabled] = useState(false);
  const [volume, setVolumeState] = useState(0.3);

  // Initialize state from storage
  useEffect(() => {
    setIsEnabled(isSoundsEnabled());
    setVolumeState(sounds.getVolume());
  }, []);

  const enable = useCallback(() => {
    setSoundsEnabled(true);
    setIsEnabled(true);
  }, []);

  const disable = useCallback(() => {
    setSoundsEnabled(false);
    setIsEnabled(false);
  }, []);

  const toggleEnabled = useCallback(() => {
    const newState = sounds.toggle();
    setIsEnabled(newState);
    return newState;
  }, []);

  const setVolume = useCallback((v: number) => {
    sounds.setVolume(v);
    setVolumeState(v);
  }, []);

  return {
    isEnabled,
    enable,
    disable,
    toggle: toggleEnabled,
    volume,
    setVolume,
    click: sounds.click,
    toggleSound: sounds.toggleSound,
    success: sounds.success,
    complete: sounds.complete,
    alert: sounds.alert,
    warning: sounds.warning,
    error: sounds.error,
    pop: sounds.pop,
  } as ReturnType<typeof useSound>;
}

/**
 * Combined feedback hook (haptic + sound)
 */
export function useFeedback(): {
  // State
  hapticsEnabled: boolean;
  soundsEnabled: boolean;
  // Controls
  enableHaptics: () => void;
  disableHaptics: () => void;
  toggleHaptics: () => boolean;
  enableSounds: () => void;
  disableSounds: () => void;
  toggleSounds: () => boolean;
  // Combined feedback actions
  tap: () => void;
  click: () => void;
  success: () => void;
  warning: () => void;
  error: () => void;
  complete: () => void;
  selection: () => void;
} {
  const hapticHook = useHaptic();
  const soundHook = useSound();

  // Combined feedback functions
  const tap = useCallback(() => {
    hapticHook.tap();
    sounds.tap();
  }, [hapticHook]);

  const click = useCallback(() => {
    hapticHook.click();
    sounds.click();
  }, [hapticHook]);

  const success = useCallback(() => {
    hapticHook.success();
    sounds.success();
  }, [hapticHook]);

  const warning = useCallback(() => {
    hapticHook.warning();
    sounds.warning();
  }, [hapticHook]);

  const error = useCallback(() => {
    hapticHook.error();
    sounds.error();
  }, [hapticHook]);

  const complete = useCallback(() => {
    haptics.taskComplete();
    sounds.complete();
  }, []);

  const selection = useCallback(() => {
    hapticHook.selection();
    sounds.pop();
  }, [hapticHook]);

  return {
    hapticsEnabled: hapticHook.isEnabled,
    soundsEnabled: soundHook.isEnabled,
    enableHaptics: hapticHook.enable,
    disableHaptics: hapticHook.disable,
    toggleHaptics: hapticHook.toggle,
    enableSounds: soundHook.enable,
    disableSounds: soundHook.disable,
    toggleSounds: soundHook.toggle,
    tap,
    click,
    success,
    warning,
    error,
    complete,
    selection,
  };
}

/**
 * Hook for button feedback (haptic + optional sound)
 * Returns event handlers to attach to buttons
 */
export function useButtonFeedback(options: {
  haptic?: boolean;
  sound?: boolean;
  intensity?: HapticIntensity;
} = {}): {
  onPointerDown: () => void;
  onPointerUp: () => void;
} {
  const {
    haptic = true,
    sound = false,
    intensity = 'light',
  } = options;

  const onPointerDown = useCallback(() => {
    if (haptic) {
      haptics.impact(intensity);
    }
    if (sound) {
      sounds.tap();
    }
  }, [haptic, sound, intensity]);

  const onPointerUp = useCallback(() => {
    // Optional: add release feedback
  }, []);

  return { onPointerDown, onPointerUp };
}

/**
 * Hook for toggle switch feedback
 */
export function useToggleFeedback(): {
  onToggle: (isOn: boolean) => void;
} {
  const onToggle = useCallback((isOn: boolean) => {
    haptics.toggleFeedback();
    sounds.toggleSound(isOn);
  }, []);

  return { onToggle };
}

/**
 * Hook for slider feedback
 */
export function useSliderFeedback(): {
  onSlide: (value: number) => void;
} {
  const lastValue = { current: 0 };

  const onSlide = useCallback((value: number) => {
    // Only trigger feedback if value changed significantly
    if (Math.abs(value - lastValue.current) > 0.05) {
      haptics.slider();
      sounds.slide(value);
      lastValue.current = value;
    }
  }, []);

  return { onSlide };
}
