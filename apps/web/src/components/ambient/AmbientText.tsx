'use client';

/**
 * Ambient Text Component
 *
 * Single words that appear as part of the environment, not as messages.
 * They're noticed or not - never demanding attention.
 * Part of the atmosphere rather than communication.
 *
 * Examples:
 * - "steady" - You're doing well, keep going
 * - "breathe" - During rest, a gentle reminder
 * - "listen" - When something might need attention
 * - "strong" - After a good set
 * - "enough" - When it might be time to stop
 * - "rest" - On recovery days
 */

import { useEffect, useState, useRef, useCallback } from 'react';

import type {
  AmbientText,
  AmbientWord,
  AmbientTextPosition,
  AmbientTextAnimation,
} from '../../lib/ambient-ai/types';

// ============================================
// AMBIENT TEXT PRESETS
// ============================================

export const AMBIENT_TEXT_PRESETS: Record<AmbientWord, AmbientText> = {
  steady: {
    word: 'steady',
    position: 'center',
    opacity: 0.4,
    animation: 'fade_in_out',
    duration: 3000,
  },
  breathe: {
    word: 'breathe',
    position: 'center',
    opacity: 0.35,
    animation: 'breathe',
    duration: 4000,
  },
  listen: {
    word: 'listen',
    position: 'bottom',
    opacity: 0.45,
    animation: 'fade_in_out',
    duration: 3500,
  },
  strong: {
    word: 'strong',
    position: 'center',
    opacity: 0.5,
    animation: 'fade_in_out',
    duration: 2500,
  },
  enough: {
    word: 'enough',
    position: 'center',
    opacity: 0.4,
    animation: 'fade_in_out',
    duration: 3000,
  },
  rest: {
    word: 'rest',
    position: 'center',
    opacity: 0.35,
    animation: 'breathe',
    duration: 5000,
  },
  ready: {
    word: 'ready',
    position: 'bottom',
    opacity: 0.4,
    animation: 'fade_in_out',
    duration: 2500,
  },
  good: {
    word: 'good',
    position: 'center',
    opacity: 0.45,
    animation: 'fade_in_out',
    duration: 2000,
  },
  gentle: {
    word: 'gentle',
    position: 'center',
    opacity: 0.35,
    animation: 'breathe',
    duration: 4000,
  },
  pause: {
    word: 'pause',
    position: 'center',
    opacity: 0.4,
    animation: 'breathe',
    duration: 3500,
  },
};

// ============================================
// ANIMATION KEYFRAMES
// ============================================

const getAnimationStyle = (
  animation: AmbientTextAnimation,
  progress: number,
  baseOpacity: number
): { opacity: number; transform: string } => {
  switch (animation) {
    case 'fade_in_out': {
      // Smooth sine wave fade
      const fadeOpacity = baseOpacity * Math.sin(progress * Math.PI);
      return {
        opacity: fadeOpacity,
        transform: 'translateY(0)',
      };
    }

    case 'breathe': {
      // Breathing effect - slower, more organic
      const breathePhase = Math.sin(progress * Math.PI);
      const breatheOpacity = baseOpacity * 0.5 + baseOpacity * 0.5 * breathePhase;
      const breatheScale = 1 + 0.02 * breathePhase;
      return {
        opacity: breatheOpacity,
        transform: `scale(${breatheScale})`,
      };
    }

    case 'drift': {
      // Gentle upward drift while fading
      const driftOpacity = baseOpacity * Math.sin(progress * Math.PI);
      const driftY = -20 * progress;
      return {
        opacity: driftOpacity,
        transform: `translateY(${driftY}px)`,
      };
    }

    default:
      return {
        opacity: baseOpacity,
        transform: 'translateY(0)',
      };
  }
};

// ============================================
// POSITION STYLES
// ============================================

const getPositionClasses = (position: AmbientTextPosition): string => {
  switch (position) {
    case 'center':
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    case 'bottom':
      return 'bottom-24 left-1/2 -translate-x-1/2';
    case 'floating':
      return 'top-1/3 left-1/2 -translate-x-1/2';
    default:
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
  }
};

// ============================================
// AMBIENT TEXT COMPONENT
// ============================================

interface AmbientTextDisplayProps {
  text: AmbientText | null;
  onComplete?: () => void;
}

export function AmbientTextDisplay({ text, onComplete }: AmbientTextDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [animationStyle, setAnimationStyle] = useState({ opacity: 0, transform: 'translateY(0)' });
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!text) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / text.duration, 1);

      const style = getAnimationStyle(text.animation, progress, text.opacity);
      setAnimationStyle(style);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsVisible(false);
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [text, onComplete]);

  if (!text || !isVisible) return null;

  return (
    <div
      className={`
        fixed pointer-events-none z-40
        ${getPositionClasses(text.position)}
      `}
      aria-hidden="true"
      role="presentation"
    >
      <span
        className="
          text-2xl sm:text-3xl md:text-4xl
          font-light tracking-[0.2em]
          text-foreground/60
          select-none
          transition-transform duration-300
        "
        style={{
          opacity: animationStyle.opacity,
          transform: animationStyle.transform,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '0.25em',
          textTransform: 'lowercase',
        }}
      >
        {text.word}
      </span>
    </div>
  );
}

// ============================================
// AMBIENT TEXT WITH DECORATIVE DOTS
// ============================================

interface AmbientTextWithDotsProps {
  text: AmbientText | null;
  onComplete?: () => void;
}

export function AmbientTextWithDots({ text, onComplete }: AmbientTextWithDotsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [animationStyle, setAnimationStyle] = useState({ opacity: 0, transform: 'translateY(0)' });
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!text) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / text.duration, 1);

      const style = getAnimationStyle(text.animation, progress, text.opacity);
      setAnimationStyle(style);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsVisible(false);
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [text, onComplete]);

  if (!text || !isVisible) return null;

  return (
    <div
      className={`
        fixed pointer-events-none z-40
        ${getPositionClasses(text.position)}
        flex items-center gap-3
      `}
      aria-hidden="true"
      role="presentation"
    >
      {/* Decorative dots before */}
      <span
        className="text-foreground/30 text-sm tracking-widest"
        style={{ opacity: animationStyle.opacity * 0.5 }}
      >
        · · ·
      </span>

      {/* Main word */}
      <span
        className="
          text-xl sm:text-2xl
          font-light tracking-[0.15em]
          text-foreground/50
          select-none
        "
        style={{
          opacity: animationStyle.opacity,
          transform: animationStyle.transform,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '0.2em',
          textTransform: 'lowercase',
        }}
      >
        {text.word}
      </span>

      {/* Decorative dots after */}
      <span
        className="text-foreground/30 text-sm tracking-widest"
        style={{ opacity: animationStyle.opacity * 0.5 }}
      >
        · · ·
      </span>
    </div>
  );
}

// ============================================
// HOOK FOR AMBIENT TEXT
// ============================================

interface UseAmbientTextReturn {
  show: (text: AmbientText) => void;
  showWord: (word: AmbientWord, options?: Partial<AmbientText>) => void;
  hide: () => void;
  currentText: AmbientText | null;
  isVisible: boolean;
}

export function useAmbientText(): UseAmbientTextReturn {
  const [currentText, setCurrentText] = useState<AmbientText | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const show = useCallback((text: AmbientText) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setCurrentText(text);
    setIsVisible(true);

    // Auto-hide after duration
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setCurrentText(null);
    }, text.duration + 500); // Small buffer for animation
  }, []);

  const showWord = useCallback(
    (word: AmbientWord, options?: Partial<AmbientText>) => {
      const preset = AMBIENT_TEXT_PRESETS[word];
      show({
        ...preset,
        ...options,
      });
    },
    [show]
  );

  const hide = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
    setCurrentText(null);
  }, []);

  return {
    show,
    showWord,
    hide,
    currentText,
    isVisible,
  };
}

// ============================================
// AMBIENT TEXT QUEUE (for multiple words)
// ============================================

interface UseAmbientTextQueueReturn {
  queue: (text: AmbientText) => void;
  queueWord: (word: AmbientWord, options?: Partial<AmbientText>) => void;
  clear: () => void;
  currentText: AmbientText | null;
  isVisible: boolean;
  queueLength: number;
}

export function useAmbientTextQueue(): UseAmbientTextQueueReturn {
  const [currentText, setCurrentText] = useState<AmbientText | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const queueRef = useRef<AmbientText[]>([]);
  const isProcessingRef = useRef(false);
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  // Helper to create tracked timeouts
  const createTimeout = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current.delete(id);
      fn();
    }, delay);
    timeoutsRef.current.add(id);
    return id;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current.clear();
    };
  }, []);

  const processQueue = useCallback(() => {
    if (queueRef.current.length === 0) {
      isProcessingRef.current = false;
      setCurrentText(null);
      setIsVisible(false);
      return;
    }

    isProcessingRef.current = true;
    const nextText = queueRef.current.shift();
    if (!nextText) return;

    setCurrentText(nextText);
    setIsVisible(true);

    // Schedule next after duration + gap
    createTimeout(() => {
      setIsVisible(false);
      createTimeout(processQueue, 500); // Gap between texts
    }, nextText.duration);
  }, [createTimeout]);

  const queue = useCallback(
    (text: AmbientText) => {
      queueRef.current.push(text);
      if (!isProcessingRef.current) {
        processQueue();
      }
    },
    [processQueue]
  );

  const queueWord = useCallback(
    (word: AmbientWord, options?: Partial<AmbientText>) => {
      const preset = AMBIENT_TEXT_PRESETS[word];
      queue({
        ...preset,
        ...options,
      });
    },
    [queue]
  );

  const clear = useCallback(() => {
    queueRef.current = [];
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current.clear();
    setCurrentText(null);
    setIsVisible(false);
    isProcessingRef.current = false;
  }, []);

  return {
    queue,
    queueWord,
    clear,
    currentText,
    isVisible,
    queueLength: queueRef.current.length,
  };
}

export default AmbientTextDisplay;
