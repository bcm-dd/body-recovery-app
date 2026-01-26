'use client';

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useId,
} from 'react';
import type { RefObject } from 'react';

// ============================================
// REDUCED MOTION HOOK
// Respects prefers-reduced-motion system setting
// ============================================

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// ============================================
// FOCUS RETURN HOOK
// Saves and restores focus for modals/dialogs
// ============================================

interface UseFocusReturnOptions {
  /**
   * Whether to restore focus when the hook unmounts
   * @default true
   */
  restoreOnUnmount?: boolean;
  /**
   * Element to focus instead of the previously focused element
   */
  fallbackElement?: RefObject<HTMLElement>;
}

export function useFocusReturn(options: UseFocusReturnOptions = {}) {
  const { restoreOnUnmount = true, fallbackElement } = options;
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Save the currently focused element
  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  // Restore focus to the previously focused element
  const restoreFocus = useCallback(() => {
    if (fallbackElement?.current) {
      fallbackElement.current.focus();
    } else if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
      previousFocusRef.current.focus();
    }
  }, [fallbackElement]);

  // Automatically restore focus on unmount if enabled
  useEffect(() => {
    if (restoreOnUnmount) {
      return () => {
        restoreFocus();
      };
    }
  }, [restoreOnUnmount, restoreFocus]);

  return {
    saveFocus,
    restoreFocus,
    previousElement: previousFocusRef.current,
  };
}

// ============================================
// ARROW NAVIGATION HOOK
// Implements arrow key navigation for lists
// ============================================

interface UseArrowNavigationOptions {
  /**
   * The orientation of the navigation
   * @default 'vertical'
   */
  orientation?: 'horizontal' | 'vertical' | 'both';
  /**
   * Whether navigation should loop around
   * @default true
   */
  loop?: boolean;
  /**
   * Callback when an item is selected (Enter/Space)
   */
  onSelect?: (index: number) => void;
  /**
   * Callback when the active index changes
   */
  onChange?: (index: number) => void;
  /**
   * Initial active index
   * @default 0
   */
  initialIndex?: number;
}

export function useArrowNavigation(
  itemCount: number,
  options: UseArrowNavigationOptions = {}
) {
  const {
    orientation = 'vertical',
    loop = true,
    onSelect,
    onChange,
    initialIndex = 0,
  } = options;

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  // Update refs array when item count changes
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, itemCount);
  }, [itemCount]);

  // Focus the active item when it changes
  useEffect(() => {
    const activeItem = itemRefs.current[activeIndex];
    if (activeItem) {
      activeItem.focus();
    }
    onChange?.(activeIndex);
  }, [activeIndex, onChange]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      let newIndex = activeIndex;
      const isHorizontal = orientation === 'horizontal' || orientation === 'both';
      const isVertical = orientation === 'vertical' || orientation === 'both';

      switch (event.key) {
        case 'ArrowLeft':
          if (isHorizontal) {
            event.preventDefault();
            newIndex = activeIndex - 1;
          }
          break;
        case 'ArrowRight':
          if (isHorizontal) {
            event.preventDefault();
            newIndex = activeIndex + 1;
          }
          break;
        case 'ArrowUp':
          if (isVertical) {
            event.preventDefault();
            newIndex = activeIndex - 1;
          }
          break;
        case 'ArrowDown':
          if (isVertical) {
            event.preventDefault();
            newIndex = activeIndex + 1;
          }
          break;
        case 'Home':
          event.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          newIndex = itemCount - 1;
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          onSelect?.(activeIndex);
          return;
        default:
          return;
      }

      // Handle wrapping
      if (loop) {
        if (newIndex < 0) newIndex = itemCount - 1;
        if (newIndex >= itemCount) newIndex = 0;
      } else {
        newIndex = Math.max(0, Math.min(itemCount - 1, newIndex));
      }

      setActiveIndex(newIndex);
    },
    [activeIndex, itemCount, loop, onSelect, orientation]
  );

  // Get props for each item
  const getItemProps = useCallback(
    (index: number) => ({
      ref: (el: HTMLElement | null) => {
        itemRefs.current[index] = el;
      },
      tabIndex: index === activeIndex ? 0 : -1,
      onKeyDown: handleKeyDown,
      'aria-selected': index === activeIndex,
      role: 'option',
    }),
    [activeIndex, handleKeyDown]
  );

  // Get props for the container
  const getContainerProps = useCallback(
    () => ({
      role: 'listbox',
      'aria-activedescendant': itemRefs.current[activeIndex]?.id,
    }),
    [activeIndex]
  );

  return {
    activeIndex,
    setActiveIndex,
    getItemProps,
    getContainerProps,
    handleKeyDown,
  };
}

// ============================================
// ANNOUNCE HOOK
// Announces messages to screen readers
// ============================================

interface UseAnnounceOptions {
  /**
   * Default politeness level
   * @default 'polite'
   */
  defaultPoliteness?: 'polite' | 'assertive';
  /**
   * How long to keep the message before clearing (ms)
   * @default 1000
   */
  clearAfter?: number;
}

export function useAnnounce(options: UseAnnounceOptions = {}) {
  const { defaultPoliteness = 'polite', clearAfter = 1000 } = options;
  const [message, setMessage] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>(defaultPoliteness);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const regionId = useId();

  const announce = useCallback(
    (text: string, level: 'polite' | 'assertive' = defaultPoliteness) => {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Clear the message briefly to ensure re-announcement of same text
      setMessage('');

      // Use requestAnimationFrame to ensure the clear is processed
      requestAnimationFrame(() => {
        setPoliteness(level);
        setMessage(text);

        // Clear after delay
        timeoutRef.current = setTimeout(() => {
          setMessage('');
        }, clearAfter);
      });
    },
    [defaultPoliteness, clearAfter]
  );

  const announcePolite = useCallback(
    (text: string) => announce(text, 'polite'),
    [announce]
  );

  const announceAssertive = useCallback(
    (text: string) => announce(text, 'assertive'),
    [announce]
  );

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setMessage('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // The live region component
  const LiveRegion = useCallback(
    () => (
      <div
        id={regionId}
        role="status"
        aria-live={politeness}
        aria-atomic="true"
        className="sr-only"
      >
        {message}
      </div>
    ),
    [regionId, politeness, message]
  );

  return {
    announce,
    announcePolite,
    announceAssertive,
    clear,
    message,
    LiveRegion,
  };
}

// ============================================
// HIGH CONTRAST MODE HOOK
// Detects Windows High Contrast Mode
// ============================================

export function useHighContrastMode(): boolean {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(forced-colors: active)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isHighContrast;
}

// ============================================
// FOCUS VISIBLE HOOK
// Tracks if focus should be visible (keyboard navigation)
// ============================================

export function useFocusVisible(): boolean {
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setIsFocusVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isFocusVisible;
}

// ============================================
// SCREEN READER DETECTION HOOK
// Detects likely screen reader usage (heuristic)
// ============================================

export function useScreenReaderDetection(): boolean {
  const [likelyScreenReader, setLikelyScreenReader] = useState(false);

  useEffect(() => {
    // Check for reduced motion (common with screen readers)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Check for forced colors (common with screen readers)
    const forcedColors = window.matchMedia('(forced-colors: active)').matches;

    // Check for navigator.userAgent hints (NVDA, JAWS, VoiceOver)
    const ua = navigator.userAgent.toLowerCase();
    const screenReaderHints =
      ua.includes('nvda') ||
      ua.includes('jaws') ||
      ua.includes('voiceover') ||
      ua.includes('chromevox');

    setLikelyScreenReader(prefersReducedMotion || forcedColors || screenReaderHints);
  }, []);

  return likelyScreenReader;
}

// ============================================
// SKIP LINK TARGET HOOK
// Creates a target for skip links
// ============================================

interface UseSkipLinkTargetOptions {
  /**
   * The ID to use for the skip link target
   * @default 'main-content'
   */
  id?: string;
}

export function useSkipLinkTarget(options: UseSkipLinkTargetOptions = {}) {
  const { id = 'main-content' } = options;
  const ref = useRef<HTMLElement>(null);

  // Focus the target when it's navigated to
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === `#${id}` && ref.current) {
        ref.current.focus();
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    // Check initial hash
    if (window.location.hash === `#${id}` && ref.current) {
      ref.current.focus();
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [id]);

  const getTargetProps = useCallback(
    () => ({
      ref,
      id,
      tabIndex: -1,
      style: { outline: 'none' } as const,
    }),
    [id]
  );

  return { ref, getTargetProps };
}

// ============================================
// TRAP FOCUS HOOK
// Traps focus within a container
// ============================================

const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
].join(', ');

interface UseTrapFocusOptions {
  /**
   * Whether the trap is active
   * @default true
   */
  active?: boolean;
  /**
   * Initial element to focus
   */
  initialFocus?: RefObject<HTMLElement>;
}

export function useTrapFocus(
  containerRef: RefObject<HTMLElement>,
  options: UseTrapFocusOptions = {}
) {
  const { active = true, initialFocus } = options;

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;

    // Focus initial element or first focusable
    const focusInitial = () => {
      if (initialFocus?.current) {
        initialFocus.current.focus();
      } else {
        const focusable = container.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
        if (focusable) {
          focusable.focus();
        } else {
          container.focus();
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(focusInitial, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: going backwards
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: going forwards
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, containerRef, initialFocus]);
}

// ============================================
// ANIMATION PAUSE HOOK
// Allows users to pause/play animations
// ============================================

interface UseAnimationPauseOptions {
  /**
   * Initial paused state
   * @default false (uses prefers-reduced-motion)
   */
  initialPaused?: boolean;
  /**
   * Persist the preference to localStorage
   * @default true
   */
  persist?: boolean;
  /**
   * localStorage key
   * @default 'animations-paused'
   */
  storageKey?: string;
}

export function useAnimationPause(options: UseAnimationPauseOptions = {}) {
  const {
    persist = true,
    storageKey = 'animations-paused',
  } = options;

  const prefersReducedMotion = useReducedMotion();

  const [isPaused, setIsPaused] = useState(() => {
    // Check localStorage first
    if (persist && typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        return stored === 'true';
      }
    }
    // Default to reduced motion preference
    return options.initialPaused ?? prefersReducedMotion;
  });

  // Update document attribute for CSS
  useEffect(() => {
    if (isPaused) {
      document.documentElement.setAttribute('data-animations-paused', 'true');
    } else {
      document.documentElement.removeAttribute('data-animations-paused');
    }
  }, [isPaused]);

  // Persist to localStorage
  useEffect(() => {
    if (persist) {
      localStorage.setItem(storageKey, String(isPaused));
    }
  }, [isPaused, persist, storageKey]);

  const pause = useCallback(() => setIsPaused(true), []);
  const play = useCallback(() => setIsPaused(false), []);
  const toggle = useCallback(() => setIsPaused((prev) => !prev), []);

  return {
    isPaused,
    pause,
    play,
    toggle,
    prefersReducedMotion,
  };
}

// ============================================
// ACCESSIBLE ID HOOK
// Generates stable IDs for accessibility attributes
// ============================================

interface UseAccessibleIdsOptions {
  /**
   * Prefix for the generated IDs
   */
  prefix?: string;
}

export function useAccessibleIds(options: UseAccessibleIdsOptions = {}) {
  const { prefix = '' } = options;
  const baseId = useId();
  const idPrefix = prefix ? `${prefix}-${baseId}` : baseId;

  return {
    baseId: idPrefix,
    labelId: `${idPrefix}-label`,
    descriptionId: `${idPrefix}-description`,
    errorId: `${idPrefix}-error`,
    hintId: `${idPrefix}-hint`,
    headingId: `${idPrefix}-heading`,
    contentId: `${idPrefix}-content`,
    triggerId: `${idPrefix}-trigger`,
    panelId: `${idPrefix}-panel`,
    listId: `${idPrefix}-list`,
    itemId: (index: number) => `${idPrefix}-item-${index}`,
  };
}

// ============================================
// COLOR SCHEME HOOK
// Detects system color scheme preference
// ============================================

export function useColorScheme(): 'light' | 'dark' {
  const [scheme, setScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setScheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setScheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return scheme;
}

// ============================================
// DOCUMENT TITLE HOOK
// Updates document title with announcements
// ============================================

interface UseDocumentTitleOptions {
  /**
   * Whether to announce the title change to screen readers
   * @default true
   */
  announce?: boolean;
  /**
   * Base title suffix
   */
  suffix?: string;
}

export function useDocumentTitle(
  title: string,
  options: UseDocumentTitleOptions = {}
) {
  const { announce = true, suffix } = options;
  const { announce: announceMessage } = useAnnounce();

  useEffect(() => {
    const fullTitle = suffix ? `${title} | ${suffix}` : title;
    const previousTitle = document.title;
    document.title = fullTitle;

    if (announce && title !== previousTitle) {
      announceMessage(`Navigated to ${title}`);
    }

    return () => {
      // Don't restore - let the next page set its title
    };
  }, [title, suffix, announce, announceMessage]);
}

// Export everything
export default {
  useReducedMotion,
  useFocusReturn,
  useArrowNavigation,
  useAnnounce,
  useHighContrastMode,
  useFocusVisible,
  useScreenReaderDetection,
  useSkipLinkTarget,
  useTrapFocus,
  useAnimationPause,
  useAccessibleIds,
  useColorScheme,
  useDocumentTitle,
};
