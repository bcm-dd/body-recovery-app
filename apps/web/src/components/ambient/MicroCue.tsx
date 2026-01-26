'use client';

/**
 * Micro-Cue Component
 *
 * Provides subtle, almost subliminal feedback signals.
 * These are felt more than seen - gentle pulses of warmth,
 * soft haptic feedback, quiet tones.
 */

import { useEffect, useState, useCallback, useRef } from 'react';

import type {
  MicroCue,
  MicroCueVisual,
  VisualEffect,
  VisualElement,
} from '../../lib/ambient-ai/types';
import { hapticCustom } from '../../lib/haptics';

// ============================================
// PREDEFINED MICRO-CUES
// ============================================

export const MICRO_CUES = {
  // Rest complete - gentle warmth and pulse
  restComplete: {
    id: 'rest-complete',
    visual: {
      element: 'background' as VisualElement,
      effect: 'warm' as VisualEffect,
      intensity: 0.3,
      duration: 1500,
    },
    haptic: {
      pattern: 'wave' as const,
      intensity: 0.5,
    },
  },

  // Good set - micro warmth
  goodSet: {
    id: 'good-set',
    visual: {
      element: 'card' as VisualElement,
      effect: 'glow' as VisualEffect,
      intensity: 0.2,
      duration: 800,
    },
    haptic: {
      pattern: 'success' as const,
      intensity: 0.3,
    },
  },

  // Attention needed - subtle sharpen
  attentionNeeded: {
    id: 'attention-needed',
    visual: {
      element: 'border' as VisualElement,
      effect: 'sharpen' as VisualEffect,
      intensity: 0.4,
      duration: 2000,
    },
  },

  // Been still a while - gentle breathing pulse
  stillAWhile: {
    id: 'still-a-while',
    visual: {
      element: 'background' as VisualElement,
      effect: 'pulse' as VisualEffect,
      intensity: 0.15,
      duration: 3000,
    },
  },

  // Encouragement - warm glow
  encouragement: {
    id: 'encouragement',
    visual: {
      element: 'background' as VisualElement,
      effect: 'warm' as VisualEffect,
      intensity: 0.25,
      duration: 2000,
    },
    haptic: {
      pattern: 'gentle' as const,
      intensity: 0.2,
    },
  },

  // Session milestone - celebration
  milestone: {
    id: 'milestone',
    visual: {
      element: 'background' as VisualElement,
      effect: 'glow' as VisualEffect,
      intensity: 0.4,
      duration: 1500,
    },
    haptic: {
      pattern: 'success' as const,
      intensity: 0.6,
    },
  },

  // Soften - calming effect
  soften: {
    id: 'soften',
    visual: {
      element: 'background' as VisualElement,
      effect: 'soften' as VisualEffect,
      intensity: 0.3,
      duration: 2000,
    },
  },
} satisfies Record<string, MicroCue>;

// ============================================
// HAPTIC PATTERNS
// ============================================

const HAPTIC_PATTERNS: Record<string, number | number[]> = {
  tap: 10,
  pulse: [15, 100, 15],
  wave: [10, 50, 20, 50, 10],
  heartbeat: [20, 100, 20, 300],
  success: [20, 50, 20],
  gentle: [8, 80, 8],
};

function triggerHaptic(pattern: string, intensity: number): void {
  const hapticPattern = HAPTIC_PATTERNS[pattern];
  if (!hapticPattern) return;

  // Scale pattern by intensity
  if (typeof hapticPattern === 'number') {
    hapticCustom(Math.round(hapticPattern * intensity));
  } else {
    const scaled = hapticPattern.map((v, i) => (i % 2 === 0 ? Math.round(v * intensity) : v));
    hapticCustom(scaled);
  }
}

// ============================================
// VISUAL EFFECT STYLES
// ============================================

function getVisualEffectStyles(
  visual: MicroCueVisual,
  isActive: boolean,
  progress: number
): React.CSSProperties {
  if (!isActive) return {};

  const opacity = visual.intensity * Math.sin(progress * Math.PI);

  switch (visual.effect) {
    case 'warm':
      return {
        boxShadow: `inset 0 0 ${60 * visual.intensity}px rgba(255, 180, 100, ${opacity})`,
      };

    case 'cool':
      return {
        boxShadow: `inset 0 0 ${60 * visual.intensity}px rgba(100, 180, 255, ${opacity})`,
      };

    case 'pulse':
      return {
        transform: `scale(${1 + 0.01 * visual.intensity * Math.sin(progress * Math.PI * 2)})`,
      };

    case 'glow':
      return {
        boxShadow: `0 0 ${30 * visual.intensity}px rgba(59, 130, 246, ${opacity})`,
      };

    case 'sharpen':
      return {
        filter: `contrast(${1 + 0.1 * visual.intensity * opacity})`,
      };

    case 'soften':
      return {
        filter: `brightness(${1 - 0.1 * visual.intensity * opacity}) saturate(${1 - 0.1 * visual.intensity * opacity})`,
      };

    default:
      return {};
  }
}

// ============================================
// MICRO-CUE OVERLAY COMPONENT
// ============================================

interface MicroCueOverlayProps {
  cue: MicroCue | null;
  onComplete?: () => void;
}

export function MicroCueOverlay({ cue, onComplete }: MicroCueOverlayProps) {
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!cue) {
      setIsActive(false);
      setProgress(0);
      return;
    }

    // Trigger haptic
    if (cue.haptic) {
      triggerHaptic(cue.haptic.pattern, cue.haptic.intensity);
    }

    // Start visual animation
    if (cue.visual) {
      setIsActive(true);
      startTimeRef.current = performance.now();
      // Capture duration at start to avoid null assertion in closure
      const duration = cue.visual.duration;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTimeRef.current;
        const newProgress = Math.min(elapsed / duration, 1);

        setProgress(newProgress);

        if (newProgress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsActive(false);
          setProgress(0);
          onComplete?.();
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    } else {
      // No visual, just haptic
      onComplete?.();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [cue, onComplete]);

  if (!cue?.visual || !isActive) return null;

  const styles = getVisualEffectStyles(cue.visual, isActive, progress);

  // Different rendering based on target element
  if (cue.visual.element === 'background') {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-50 transition-opacity"
        style={{
          ...styles,
          opacity: isActive ? 1 : 0,
        }}
        aria-hidden="true"
      />
    );
  }

  return null;
}

// ============================================
// MICRO-CUE HOOK
// ============================================

interface UseMicroCueReturn {
  trigger: (cue: MicroCue) => void;
  triggerPreset: (presetName: keyof typeof MICRO_CUES) => void;
  currentCue: MicroCue | null;
  isActive: boolean;
  /** Internal: called when animation completes */
  _onComplete: () => void;
}

export function useMicroCue(): UseMicroCueReturn {
  const [currentCue, setCurrentCue] = useState<MicroCue | null>(null);
  const [isActive, setIsActive] = useState(false);
  const queueRef = useRef<MicroCue[]>([]);
  const isActiveRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const processQueue = useCallback(() => {
    if (queueRef.current.length === 0) {
      setIsActive(false);
      return;
    }

    const nextCue = queueRef.current.shift();
    if (nextCue) {
      setCurrentCue(nextCue);
      setIsActive(true);
    }
  }, []);

  const handleComplete = useCallback(() => {
    setCurrentCue(null);
    // Small delay before next cue - tracked for cleanup
    timeoutRef.current = setTimeout(processQueue, 200);
  }, [processQueue]);

  const trigger = useCallback(
    (cue: MicroCue) => {
      queueRef.current.push(cue);
      // Use ref to avoid stale closure
      if (!isActiveRef.current) {
        processQueue();
      }
    },
    [processQueue]
  );

  const triggerPreset = useCallback(
    (presetName: keyof typeof MICRO_CUES) => {
      trigger(MICRO_CUES[presetName]);
    },
    [trigger]
  );

  return {
    trigger,
    triggerPreset,
    currentCue,
    isActive,
    // Expose handleComplete so components can call it when animation finishes
    _onComplete: handleComplete,
  };
}

// ============================================
// MICRO-CUE CONTAINER COMPONENT
// ============================================

interface MicroCueContainerProps {
  children: React.ReactNode;
  cue: MicroCue | null;
  onComplete?: () => void;
  className?: string;
}

export function MicroCueContainer({
  children,
  cue,
  onComplete,
  className = '',
}: MicroCueContainerProps) {
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!cue?.visual || cue.visual.element === 'background') {
      return;
    }

    // Trigger haptic
    if (cue.haptic) {
      triggerHaptic(cue.haptic.pattern, cue.haptic.intensity);
    }

    setIsActive(true);
    startTimeRef.current = performance.now();
    // Capture duration at start to avoid null assertion in closure
    const duration = cue.visual.duration;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const newProgress = Math.min(elapsed / duration, 1);

      setProgress(newProgress);

      if (newProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsActive(false);
        setProgress(0);
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [cue, onComplete]);

  const styles = cue?.visual ? getVisualEffectStyles(cue.visual, isActive, progress) : {};

  return (
    <div className={`transition-all duration-300 ${className}`} style={styles}>
      {children}
    </div>
  );
}

export default MicroCueOverlay;
