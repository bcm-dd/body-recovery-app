'use client';

/**
 * Gentle Prompt Component
 *
 * Soft, non-intrusive prompts that appear when the AI has something
 * to say but doesn't want to interrupt. Always dismissible, never blocking.
 *
 * Rules:
 * - Always dismissible
 * - Never blocking
 * - Max 2 options
 * - Can be swiped away
 * - Won't repeat if dismissed
 * - Positioned to not obstruct primary task
 */

import { X, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

import type { GentlePrompt, GentlePromptOption } from '../../lib/ambient-ai/types';
import { hapticTap, hapticSelection } from '../../lib/haptics';

// ============================================
// GENTLE PROMPT COMPONENT
// ============================================

interface GentlePromptDisplayProps {
  prompt: GentlePrompt | null;
  onOptionSelect: (action: string) => void;
  onDismiss: () => void;
  position?: 'top' | 'bottom' | 'center';
  autoHideDelay?: number; // ms, 0 to disable
}

export function GentlePromptDisplay({
  prompt,
  onOptionSelect,
  onDismiss,
  position = 'bottom',
  autoHideDelay = 0,
}: GentlePromptDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Refs for cleanup
  const dismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const optionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Define callbacks first (before useEffects that use them)
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    hapticTap();
    dismissTimeoutRef.current = setTimeout(() => {
      onDismiss();
      setIsExiting(false);
    }, 300);
  }, [onDismiss]);

  const handleOptionClick = useCallback(
    (action: string) => {
      hapticSelection();
      setIsExiting(true);
      optionTimeoutRef.current = setTimeout(() => {
        onOptionSelect(action);
        setIsExiting(false);
      }, 200);
    },
    [onOptionSelect]
  );

  // Show animation on mount
  useEffect(() => {
    if (prompt) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setIsExiting(false);
    }
  }, [prompt]);

  // Auto-hide timer
  useEffect(() => {
    if (prompt && autoHideDelay > 0) {
      autoHideTimerRef.current = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);

      return () => {
        if (autoHideTimerRef.current) {
          clearTimeout(autoHideTimerRef.current);
        }
      };
    }
  }, [prompt, autoHideDelay, handleDismiss]);

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
      if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current);
      if (optionTimeoutRef.current) clearTimeout(optionTimeoutRef.current);
    };
  }, []);

  // Swipe to dismiss handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (Math.abs(dragOffset) > 100) {
      handleDismiss();
    } else {
      setDragOffset(0);
    }
  };

  if (!prompt) return null;

  const positionClasses = {
    top: 'top-4 left-1/2 -translate-x-1/2',
    bottom: 'bottom-24 left-1/2 -translate-x-1/2',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <div
      ref={containerRef}
      className={`
        fixed z-50 w-full max-w-sm px-4
        ${positionClasses[position]}
        transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${isDragging ? 'transition-none' : ''}
      `}
      style={{
        transform: isDragging ? `translateX(calc(-50% + ${dragOffset}px))` : undefined,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="false"
      aria-label="Suggestion"
    >
      <div
        className={`
          relative rounded-2xl border border-border/50
          bg-card/95 backdrop-blur-lg
          shadow-xl shadow-black/20
          overflow-hidden
        `}
      >
        {/* Dismiss button */}
        {prompt.dismissible && (
          <button
            onClick={handleDismiss}
            className="
              absolute top-3 right-3 p-1.5
              text-muted hover:text-foreground
              rounded-full hover:bg-surface
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-primary/50
            "
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Content */}
        <div className="p-5 pr-10">
          <p className="text-sm text-foreground leading-relaxed">{prompt.message}</p>
        </div>

        {/* Options */}
        {prompt.options.length > 0 && (
          <div className="flex border-t border-border/50">
            {prompt.options.slice(0, 2).map((option, index) => (
              <button
                key={option.action}
                onClick={() => handleOptionClick(option.action)}
                className={`
                  flex-1 px-4 py-3
                  text-sm font-medium
                  transition-colors
                  focus:outline-none focus:bg-surface
                  ${
                    option.primary || index === 0
                      ? 'text-primary hover:bg-primary/5'
                      : 'text-muted hover:text-foreground hover:bg-surface'
                  }
                  ${index > 0 ? 'border-l border-border/50' : ''}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Swipe hint indicator */}
      {prompt.dismissible && (
        <div className="flex justify-center mt-2">
          <div className="w-8 h-1 rounded-full bg-muted/30" />
        </div>
      )}
    </div>
  );
}

// ============================================
// INLINE GENTLE PROMPT
// ============================================

interface InlineGentlePromptProps {
  prompt: GentlePrompt | null;
  onOptionSelect: (action: string) => void;
  onDismiss: () => void;
  className?: string;
}

export function InlineGentlePrompt({
  prompt,
  onOptionSelect,
  onDismiss,
  className = '',
}: InlineGentlePromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const dismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const optionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    hapticTap();
    dismissTimeoutRef.current = setTimeout(() => {
      onDismiss();
      setIsExiting(false);
    }, 300);
  }, [onDismiss]);

  const handleOptionClick = useCallback(
    (action: string) => {
      hapticSelection();
      setIsExiting(true);
      optionTimeoutRef.current = setTimeout(() => {
        onOptionSelect(action);
        setIsExiting(false);
      }, 200);
    },
    [onOptionSelect]
  );

  useEffect(() => {
    if (prompt) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setIsExiting(false);
    }
  }, [prompt]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current);
      if (optionTimeoutRef.current) clearTimeout(optionTimeoutRef.current);
    };
  }, []);

  if (!prompt) return null;

  return (
    <div
      className={`
        rounded-xl border border-border/50
        bg-surface/50 backdrop-blur-sm
        overflow-hidden
        transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        ${className}
      `}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-1">
          <p className="text-sm text-foreground leading-relaxed">{prompt.message}</p>

          {/* Inline options */}
          {prompt.options.length > 0 && (
            <div className="flex gap-2 mt-3">
              {prompt.options.slice(0, 2).map((option, index) => (
                <button
                  key={option.action}
                  onClick={() => handleOptionClick(option.action)}
                  className={`
                    inline-flex items-center gap-1.5
                    px-3 py-1.5 rounded-lg
                    text-xs font-medium
                    transition-colors
                    focus:outline-none focus:ring-2 focus:ring-primary/50
                    ${
                      option.primary || index === 0
                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                        : 'bg-surface text-muted hover:text-foreground hover:bg-surface/80'
                    }
                  `}
                >
                  {option.label}
                  {(option.primary || index === 0) && <ChevronRight className="w-3 h-3" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {prompt.dismissible && (
          <button
            onClick={handleDismiss}
            className="
              p-1 text-muted hover:text-foreground
              rounded-full hover:bg-surface
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-primary/50
            "
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// GENTLE PROMPT HOOK
// ============================================

interface UseGentlePromptReturn {
  show: (prompt: GentlePrompt) => void;
  hide: () => void;
  currentPrompt: GentlePrompt | null;
  isVisible: boolean;
  handleOptionSelect: (action: string) => void;
  handleDismiss: () => void;
}

interface UseGentlePromptOptions {
  onAction?: (action: string, promptId: string) => void;
  onDismiss?: (promptId: string) => void;
}

export function useGentlePrompt(options?: UseGentlePromptOptions): UseGentlePromptReturn {
  const [currentPrompt, setCurrentPrompt] = useState<GentlePrompt | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use refs for options to avoid recreating callbacks
  const onActionRef = useRef(options?.onAction);
  const onDismissRef = useRef(options?.onDismiss);
  onActionRef.current = options?.onAction;
  onDismissRef.current = options?.onDismiss;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const show = useCallback((prompt: GentlePrompt) => {
    setCurrentPrompt(prompt);
    setIsVisible(true);
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
    hideTimeoutRef.current = setTimeout(() => setCurrentPrompt(null), 300);
  }, []);

  const handleOptionSelect = useCallback(
    (action: string) => {
      if (currentPrompt) {
        onActionRef.current?.(action, currentPrompt.id);
      }
      hide();
    },
    [currentPrompt, hide]
  );

  const handleDismiss = useCallback(() => {
    if (currentPrompt) {
      onDismissRef.current?.(currentPrompt.id);
    }
    hide();
  }, [currentPrompt, hide]);

  return {
    show,
    hide,
    currentPrompt,
    isVisible,
    handleOptionSelect,
    handleDismiss,
  };
}

// ============================================
// GENTLE PROMPT QUEUE
// ============================================

interface UseGentlePromptQueueReturn {
  queue: (prompt: GentlePrompt) => void;
  processNext: () => void;
  clear: () => void;
  currentPrompt: GentlePrompt | null;
  isVisible: boolean;
  queueLength: number;
  handleOptionSelect: (action: string) => void;
  handleDismiss: () => void;
}

interface UseGentlePromptQueueOptions {
  minDelayBetweenPrompts?: number; // ms
  onAction?: (action: string, promptId: string) => void;
  onDismiss?: (promptId: string) => void;
}

export function useGentlePromptQueue(
  options?: UseGentlePromptQueueOptions
): UseGentlePromptQueueReturn {
  const [currentPrompt, setCurrentPrompt] = useState<GentlePrompt | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const queueRef = useRef<GentlePrompt[]>([]);
  const lastPromptTimeRef = useRef<number>(0);
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  // Use refs for options to avoid recreating callbacks
  const onActionRef = useRef(options?.onAction);
  const onDismissRef = useRef(options?.onDismiss);
  const minDelayRef = useRef(options?.minDelayBetweenPrompts ?? 5000);
  onActionRef.current = options?.onAction;
  onDismissRef.current = options?.onDismiss;
  minDelayRef.current = options?.minDelayBetweenPrompts ?? 5000;

  // Helper to create tracked timeouts
  const createTimeout = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current.delete(id);
      fn();
    }, delay);
    timeoutsRef.current.add(id);
    return id;
  }, []);

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current.clear();
    };
  }, []);

  const processNext = useCallback(() => {
    const now = Date.now();
    const minDelay = minDelayRef.current;

    if (queueRef.current.length === 0) {
      setCurrentPrompt(null);
      setIsVisible(false);
      return;
    }

    const timeSinceLastPrompt = now - lastPromptTimeRef.current;
    if (timeSinceLastPrompt < minDelay) {
      createTimeout(processNext, minDelay - timeSinceLastPrompt);
      return;
    }

    const nextPrompt = queueRef.current.shift();
    if (nextPrompt) {
      setCurrentPrompt(nextPrompt);
      setIsVisible(true);
      lastPromptTimeRef.current = now;
    }
  }, [createTimeout]);

  const queue = useCallback(
    (prompt: GentlePrompt) => {
      queueRef.current.push(prompt);
      if (!currentPrompt) {
        processNext();
      }
    },
    [currentPrompt, processNext]
  );

  const clear = useCallback(() => {
    queueRef.current = [];
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current.clear();
    setCurrentPrompt(null);
    setIsVisible(false);
  }, []);

  const handleOptionSelect = useCallback(
    (action: string) => {
      if (currentPrompt) {
        onActionRef.current?.(action, currentPrompt.id);
      }
      setIsVisible(false);
      createTimeout(() => {
        setCurrentPrompt(null);
        processNext();
      }, 300);
    },
    [currentPrompt, processNext, createTimeout]
  );

  const handleDismiss = useCallback(() => {
    if (currentPrompt) {
      onDismissRef.current?.(currentPrompt.id);
    }
    setIsVisible(false);
    createTimeout(() => {
      setCurrentPrompt(null);
      processNext();
    }, 300);
  }, [currentPrompt, processNext, createTimeout]);

  return {
    queue,
    processNext,
    clear,
    currentPrompt,
    isVisible,
    queueLength: queueRef.current.length,
    handleOptionSelect,
    handleDismiss,
  };
}

// ============================================
// FACTORY FOR COMMON PROMPTS
// ============================================

export function createGentlePrompt(
  id: string,
  message: string,
  options: GentlePromptOption[],
  priority: 'low' | 'medium' | 'high' = 'medium'
): GentlePrompt {
  return {
    id,
    message,
    options,
    dismissible: true,
    priority,
  };
}

export const COMMON_PROMPTS = {
  fatigueDetected: (onAdjust: string, onDismiss: string) =>
    createGentlePrompt(
      'fatigue-detected',
      "You're working hard today. Want to adjust the remaining sets?",
      [
        { label: 'Adjust workout', action: onAdjust },
        { label: "I'm good", action: onDismiss },
      ],
      'medium'
    ),

  checkIn: (onHurts: string, onResting: string) =>
    createGentlePrompt(
      'check-in',
      'Everything okay?',
      [
        { label: 'Something hurts', action: onHurts },
        { label: 'Just resting', action: onResting },
      ],
      'low'
    ),

  sessionNotWorking: (onDifferent: string, onEnd: string) =>
    createGentlePrompt(
      'session-not-working',
      "This session isn't clicking today. That's okay.",
      [
        { label: 'Try something different', action: onDifferent },
        { label: 'Call it here', action: onEnd },
      ],
      'medium'
    ),

  welcomeBack: (onStart: string, onBrowse: string) =>
    createGentlePrompt(
      'welcome-back',
      "Welcome back. Let's start gentle and build from there.",
      [
        { label: 'Start gentle session', action: onStart, primary: true },
        { label: 'Just browsing', action: onBrowse },
      ],
      'medium'
    ),

  painPattern: (region: string, onShow: string, onDismiss: string) =>
    createGentlePrompt(
      `pain-pattern-${region}`,
      `I've noticed your ${region.toLowerCase()} has been bothering you. Worth a look?`,
      [
        { label: 'Show details', action: onShow, primary: true },
        { label: 'Not now', action: onDismiss },
      ],
      'medium'
    ),
};

export default GentlePromptDisplay;
