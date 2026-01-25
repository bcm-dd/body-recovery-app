'use client';

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  createContext,
  useContext,
} from 'react';
import type { ReactNode } from 'react';

// ============================================
// SKIP LINK COMPONENT
// Allows keyboard users to skip to main content
// ============================================

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
}

export function SkipLink({ href = '#main-content', children = 'Skip to main content' }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--primary)] focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--primary)] focus:font-medium focus:text-sm"
    >
      {children}
    </a>
  );
}

// ============================================
// VISUALLY HIDDEN COMPONENT
// Hide content visually but keep accessible
// ============================================

interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  id?: string;
  className?: string;
}

export function VisuallyHidden({ children, as: Component = 'span', id, className = '' }: VisuallyHiddenProps) {
  return (
    <Component className={`sr-only ${className}`.trim()} id={id}>
      {children}
    </Component>
  );
}

// ============================================
// LIVE REGION COMPONENT
// Announces dynamic content to screen readers
// ============================================

type AriaLive = 'polite' | 'assertive' | 'off';

interface LiveRegionProps {
  children?: React.ReactNode;
  'aria-live'?: AriaLive;
  'aria-atomic'?: boolean;
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all' | 'additions text';
  role?: 'status' | 'alert' | 'log' | 'timer';
  clearAfter?: number; // milliseconds to clear the message
}

export function LiveRegion({
  children,
  'aria-live': ariaLive = 'polite',
  'aria-atomic': ariaAtomic = true,
  'aria-relevant': ariaRelevant = 'additions text',
  role = 'status',
  clearAfter,
}: LiveRegionProps) {
  const [message, setMessage] = useState(children);

  useEffect(() => {
    setMessage(children);
    if (clearAfter && children) {
      const timer = setTimeout(() => setMessage(null), clearAfter);
      return () => clearTimeout(timer);
    }
  }, [children, clearAfter]);

  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      aria-relevant={ariaRelevant}
      className="sr-only"
    >
      {message}
    </div>
  );
}

// ============================================
// ANNOUNCER CONTEXT
// Global announcer for dynamic announcements
// ============================================

interface AnnouncerContextType {
  announce: (message: string, priority?: AriaLive) => void;
  announcePolite: (message: string) => void;
  announceAssertive: (message: string) => void;
}

const AnnouncerContext = createContext<AnnouncerContextType | null>(null);

export function useAnnouncer(): AnnouncerContextType {
  const context = useContext(AnnouncerContext);
  if (!context) {
    // Return no-op functions if provider not found
    return {
      announce: () => {},
      announcePolite: () => {},
      announceAssertive: () => {},
    };
  }
  return context;
}

interface AnnouncerProviderProps {
  children: React.ReactNode;
}

export function AnnouncerProvider({ children }: AnnouncerProviderProps) {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  const announce = useCallback((message: string, priority: AriaLive = 'polite') => {
    if (priority === 'assertive') {
      setAssertiveMessage(message);
      setTimeout(() => setAssertiveMessage(''), 1000);
    } else {
      setPoliteMessage(message);
      setTimeout(() => setPoliteMessage(''), 1000);
    }
  }, []);

  const announcePolite = useCallback((message: string) => {
    announce(message, 'polite');
  }, [announce]);

  const announceAssertive = useCallback((message: string) => {
    announce(message, 'assertive');
  }, [announce]);

  return (
    <AnnouncerContext.Provider value={{ announce, announcePolite, announceAssertive }}>
      {children}
      <LiveRegion aria-live="polite" role="status">
        {politeMessage}
      </LiveRegion>
      <LiveRegion aria-live="assertive" role="alert">
        {assertiveMessage}
      </LiveRegion>
    </AnnouncerContext.Provider>
  );
}

// ============================================
// FOCUS TRAP COMPONENT
// Traps focus within a container (modals, dialogs)
// ============================================

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  restoreFocus?: boolean;
  autoFocus?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
}

const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
].join(', ');

export function FocusTrap({
  children,
  active = true,
  restoreFocus = true,
  autoFocus = true,
  initialFocus,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    // Store the previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus the initial element or the first focusable element
    const focusInitial = () => {
      if (initialFocus?.current) {
        initialFocus.current.focus();
      } else if (containerRef.current && autoFocus) {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          // If no focusable elements, focus the container itself
          containerRef.current.focus();
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(focusInitial, 0);

    return () => {
      clearTimeout(timer);
      // Restore focus when unmounting or deactivating
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [active, autoFocus, initialFocus, restoreFocus]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!active || event.key !== 'Tab') return;

      const container = containerRef.current;
      if (!container) return;

      const focusableElements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab: going backwards
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: going forwards
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [active]
  );

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      style={{ outline: 'none' }}
    >
      {children}
    </div>
  );
}

// ============================================
// ROVING TABINDEX HOOK
// For keyboard navigation in groups
// ============================================

interface RovingTabIndexOptions {
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
  onSelect?: (index: number) => void;
}

export function useRovingTabIndex(
  itemCount: number,
  options: RovingTabIndexOptions = {}
) {
  const { orientation = 'vertical', loop = true, onSelect } = options;
  const [activeIndex, setActiveIndex] = useState(0);

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

  const getTabIndex = useCallback(
    (index: number) => (index === activeIndex ? 0 : -1),
    [activeIndex]
  );

  const getRovingProps = useCallback(
    (index: number) => ({
      tabIndex: getTabIndex(index),
      onKeyDown: handleKeyDown,
      onFocus: () => setActiveIndex(index),
    }),
    [getTabIndex, handleKeyDown]
  );

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    getTabIndex,
    getRovingProps,
  };
}

// ============================================
// KEYBOARD SHORTCUTS HOOK
// For power user keyboard shortcuts
// ============================================

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: (event: KeyboardEvent) => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;
        const metaMatches = shortcut.meta ? event.metaKey : true; // meta is optional

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          event.preventDefault();
          shortcut.handler(event);
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// ============================================
// FOCUS MANAGEMENT HOOK
// For managing focus programmatically
// ============================================

export function useFocusManagement() {
  const focusRef = useRef<HTMLElement | null>(null);

  const focusElement = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.focus();
      focusRef.current = element;
    }
  }, []);

  const focusById = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.focus();
      focusRef.current = element;
    }
  }, []);

  const focusFirst = useCallback((container: HTMLElement | null) => {
    if (!container) return;
    const focusable = container.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
    if (focusable) {
      focusable.focus();
      focusRef.current = focusable;
    }
  }, []);

  const restoreFocus = useCallback(() => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  }, []);

  return {
    focusElement,
    focusById,
    focusFirst,
    restoreFocus,
    currentFocus: focusRef.current,
  };
}

// ============================================
// ACCESSIBLE ICON BUTTON
// Icon button with proper accessibility
// ============================================

interface AccessibleIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: React.ReactNode;
  showTooltip?: boolean;
}

export function AccessibleIconButton({
  label,
  icon,
  showTooltip = true,
  className = '',
  ...props
}: AccessibleIconButtonProps) {
  return (
    <button
      aria-label={label}
      title={showTooltip ? label : undefined}
      className={className}
      {...props}
    >
      {icon}
      <VisuallyHidden>{label}</VisuallyHidden>
    </button>
  );
}

// ============================================
// ACCESSIBLE HEADING
// Ensures proper heading hierarchy
// ============================================

interface AccessibleHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  id?: string;
  tabIndex?: number;
}

export function AccessibleHeading({
  level,
  children,
  className = '',
  id,
  tabIndex,
}: AccessibleHeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag className={className} id={id} tabIndex={tabIndex}>
      {children}
    </Tag>
  );
}

// ============================================
// ACCESSIBLE LINK
// Link with proper accessibility attributes
// ============================================

interface AccessibleLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  external?: boolean;
  children: React.ReactNode;
}

export function AccessibleLink({
  external = false,
  children,
  ...props
}: AccessibleLinkProps) {
  const externalProps = external
    ? {
        target: '_blank',
        rel: 'noopener noreferrer',
      }
    : {};

  return (
    <a {...props} {...externalProps}>
      {children}
      {external && (
        <VisuallyHidden> (opens in new tab)</VisuallyHidden>
      )}
    </a>
  );
}

// ============================================
// ACCESSIBLE LOADING INDICATOR
// Loading state with screen reader support
// ============================================

interface AccessibleLoadingProps {
  loading: boolean;
  loadingText?: string;
  children?: React.ReactNode;
}

export function AccessibleLoading({
  loading,
  loadingText = 'Loading...',
  children,
}: AccessibleLoadingProps) {
  return (
    <>
      {loading && (
        <div role="status" aria-live="polite">
          <VisuallyHidden>{loadingText}</VisuallyHidden>
          {children}
        </div>
      )}
    </>
  );
}

// ============================================
// ACCESSIBLE PROGRESS
// Progress indicator with screen reader support
// ============================================

interface AccessibleProgressProps {
  value: number;
  max?: number;
  label: string;
  showValue?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function AccessibleProgress({
  value,
  max = 100,
  label,
  showValue = true,
  className = '',
  children,
}: AccessibleProgressProps) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={className}>
      <VisuallyHidden>
        <span id={`progress-${label.replace(/\s/g, '-')}`}>
          {label}: {percentage}%
        </span>
      </VisuallyHidden>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        aria-valuetext={`${percentage}%`}
      >
        {children}
        {showValue && (
          <span aria-hidden="true">{percentage}%</span>
        )}
      </div>
    </div>
  );
}

// ============================================
// ACCESSIBLE ERROR MESSAGE
// Error message linked to form field
// ============================================

interface AccessibleErrorProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function AccessibleError({
  id,
  children,
  className = '',
}: AccessibleErrorProps) {
  return (
    <p
      id={id}
      role="alert"
      aria-live="assertive"
      className={`text-red-500 text-sm ${className}`}
    >
      {children}
    </p>
  );
}

// ============================================
// ACCESSIBLE DESCRIPTION
// Description/hint text linked to form field
// ============================================

interface AccessibleDescriptionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function AccessibleDescription({
  id,
  children,
  className = '',
}: AccessibleDescriptionProps) {
  return (
    <p id={id} className={`text-[var(--text-muted)] text-sm ${className}`}>
      {children}
    </p>
  );
}

// ============================================
// ACCESSIBLE REQUIRED INDICATOR
// Required field indicator
// ============================================

export function RequiredIndicator() {
  return (
    <>
      <span aria-hidden="true" className="text-red-500 ml-0.5">
        *
      </span>
      <VisuallyHidden> (required)</VisuallyHidden>
    </>
  );
}

// ============================================
// HIGH CONTRAST MODE DETECTION
// Detect and respond to high contrast mode
// ============================================

export function useHighContrastMode(): boolean {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    // Check for forced colors (high contrast mode)
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
// REDUCED MOTION DETECTION
// Already respecting in CSS, but hook for JS
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
// ANIMATION PAUSE CONTROL
// Allows users to pause/play animations
// ============================================

interface AnimationPauseControlProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimationPauseControl({
  children,
  className = '',
}: AnimationPauseControlProps) {
  const [isPaused, setIsPaused] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsPaused(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsPaused(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div
      className={`animation-pause-control ${className}`}
      data-paused={isPaused}
    >
      <button
        onClick={() => setIsPaused(!isPaused)}
        className="sr-only-focusable focus:not-sr-only focus:fixed focus:bottom-4 focus:right-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--primary)] focus:text-white focus:rounded-lg focus:font-medium focus:text-sm"
        aria-pressed={isPaused}
        aria-label={isPaused ? 'Resume animations' : 'Pause animations'}
      >
        {isPaused ? 'Resume animations' : 'Pause animations'}
      </button>
      {children}
    </div>
  );
}

// ============================================
// ACCESSIBLE SLIDER/RANGE INPUT
// Range input with proper announcements
// ============================================

interface AccessibleSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  onChange: (value: number) => void;
  valueText?: (value: number) => string;
  disabled?: boolean;
  className?: string;
  id?: string;
  hint?: string;
}

export function AccessibleSlider({
  value,
  min = 0,
  max = 100,
  step = 1,
  label,
  onChange,
  valueText,
  disabled = false,
  className = '',
  id: providedId,
  hint,
}: AccessibleSliderProps) {
  const generatedId = React.useId();
  const sliderId = providedId || generatedId;
  const hintId = `${sliderId}-hint`;

  const displayValue = valueText ? valueText(value) : `${value}`;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={sliderId}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
        <span
          className="text-sm text-[var(--text-muted)]"
          aria-hidden="true"
        >
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        id={sliderId}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={displayValue}
        aria-describedby={hint ? hintId : undefined}
      />
      {hint && (
        <p id={hintId} className="text-xs text-[var(--text-muted)]">
          {hint}
        </p>
      )}
    </div>
  );
}

// ============================================
// STATUS INDICATOR
// Visual indicator that doesn't rely on color alone
// ============================================

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusIndicatorProps {
  status: StatusType;
  label: string;
  showDot?: boolean;
  showIcon?: boolean;
  className?: string;
}

export function StatusIndicator({
  status,
  label,
  showDot = true,
  showIcon = true,
  className = '',
}: StatusIndicatorProps) {
  const statusConfig = {
    success: {
      dotColor: 'bg-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
        </svg>
      ),
      pattern: 'pattern-success',
    },
    warning: {
      dotColor: 'bg-amber-500',
      textColor: 'text-amber-600 dark:text-amber-400',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      ),
      pattern: 'pattern-warning',
    },
    error: {
      dotColor: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
        </svg>
      ),
      pattern: 'pattern-error',
    },
    info: {
      dotColor: 'bg-cyan-500',
      textColor: 'text-cyan-600 dark:text-cyan-400',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
        </svg>
      ),
      pattern: '',
    },
    neutral: {
      dotColor: 'bg-gray-500',
      textColor: 'text-gray-600 dark:text-gray-400',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 15.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
        </svg>
      ),
      pattern: '',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${config.textColor} ${className}`}
      role="status"
    >
      {showDot && (
        <span
          className={`h-2 w-2 rounded-full ${config.dotColor} flex-shrink-0`}
          aria-hidden="true"
        />
      )}
      {showIcon && config.icon}
      <span className="text-sm font-medium">{label}</span>
      <VisuallyHidden>
        Status: {status}
      </VisuallyHidden>
    </span>
  );
}

// ============================================
// ACCESSIBLE FORM
// Form with proper ARIA attributes
// ============================================

interface AccessibleFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  label: string;
  description?: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}

export function AccessibleForm({
  label,
  description,
  onSubmit,
  children,
  className = '',
  ...props
}: AccessibleFormProps) {
  const formId = React.useId();
  const descriptionId = `${formId}-description`;

  return (
    <form
      onSubmit={onSubmit}
      aria-label={label}
      aria-describedby={description ? descriptionId : undefined}
      className={className}
      noValidate
      {...props}
    >
      {description && (
        <p id={descriptionId} className="text-sm text-[var(--text-muted)] mb-4">
          {description}
        </p>
      )}
      {children}
    </form>
  );
}

// ============================================
// ACCESSIBLE TABLE
// Table with proper accessibility attributes
// ============================================

interface AccessibleTableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

interface AccessibleTableProps<T extends Record<string, unknown>> {
  caption: string;
  columns: AccessibleTableColumn<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
}

export function AccessibleTable<T extends Record<string, unknown>>({
  caption,
  columns,
  data,
  keyExtractor,
  className = '',
  striped = true,
  hoverable = true,
  sortColumn,
  sortDirection,
  onSort,
}: AccessibleTableProps<T>) {
  return (
    <div className={`overflow-x-auto ${className}`} role="region" aria-label={caption} tabIndex={0}>
      <table className="w-full">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="glass-table-header">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                scope="col"
                className="px-4 py-3 text-left text-sm font-semibold text-foreground"
                aria-sort={
                  sortColumn === column.key
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : undefined
                }
              >
                {column.sortable && onSort ? (
                  <button
                    onClick={() => onSort(String(column.key))}
                    className="inline-flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
                    aria-label={`Sort by ${column.header}`}
                  >
                    {column.header}
                    {sortColumn === column.key && (
                      <span aria-hidden="true">
                        {sortDirection === 'asc' ? ' \u2191' : ' \u2193'}
                      </span>
                    )}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={keyExtractor(item, index)}
              className={`
                glass-table-row
                ${striped && index % 2 === 1 ? 'bg-[var(--glass-bg-subtle)]' : ''}
                ${hoverable ? 'hover:bg-[var(--glass-bg)]' : ''}
              `}
            >
              {columns.map((column) => (
                <td
                  key={`${keyExtractor(item, index)}-${String(column.key)}`}
                  className="px-4 py-3 text-sm text-foreground"
                >
                  {column.render
                    ? column.render(item, index)
                    : (item[column.key as keyof T] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <p className="text-center py-8 text-[var(--text-muted)]">
          No data available
        </p>
      )}
    </div>
  );
}

// ============================================
// LANDMARK REGIONS
// Wrapper components for landmark regions
// ============================================

interface LandmarkProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

export function MainLandmark({ children, label, className = '' }: LandmarkProps) {
  return (
    <main role="main" aria-label={label} className={className} tabIndex={-1}>
      {children}
    </main>
  );
}

export function NavigationLandmark({ children, label, className = '' }: LandmarkProps) {
  return (
    <nav role="navigation" aria-label={label} className={className}>
      {children}
    </nav>
  );
}

export function AsideLandmark({ children, label, className = '' }: LandmarkProps) {
  return (
    <aside role="complementary" aria-label={label} className={className}>
      {children}
    </aside>
  );
}

export function FooterLandmark({ children, label, className = '' }: LandmarkProps) {
  return (
    <footer role="contentinfo" aria-label={label} className={className}>
      {children}
    </footer>
  );
}

export function HeaderLandmark({ children, label, className = '' }: LandmarkProps) {
  return (
    <header role="banner" aria-label={label} className={className}>
      {children}
    </header>
  );
}

export function SearchLandmark({ children, label = 'Search', className = '' }: LandmarkProps) {
  return (
    <search role="search" aria-label={label} className={className}>
      {children}
    </search>
  );
}

// ============================================
// A11Y TESTING HELPERS
// Development utilities for accessibility testing
// ============================================

interface A11yTestingProps {
  enabled?: boolean;
  showFocusOrder?: boolean;
  showTouchTargets?: boolean;
  showLandmarks?: boolean;
}

export function A11yTestingOverlay({
  enabled = false,
  showFocusOrder = false,
  showTouchTargets = false,
  showLandmarks = false,
}: A11yTestingProps) {
  useEffect(() => {
    if (!enabled) return;

    const html = document.documentElement;

    if (showFocusOrder) {
      html.classList.add('debug-focus-order');
    }
    if (showTouchTargets) {
      html.classList.add('debug-touch-targets');
    }
    if (showLandmarks) {
      // Add visible borders to landmarks
      const style = document.createElement('style');
      style.id = 'a11y-landmark-debug';
      style.textContent = `
        [role="main"] { outline: 2px dashed blue !important; }
        [role="navigation"] { outline: 2px dashed green !important; }
        [role="complementary"] { outline: 2px dashed orange !important; }
        [role="contentinfo"] { outline: 2px dashed purple !important; }
        [role="banner"] { outline: 2px dashed red !important; }
        [role="search"] { outline: 2px dashed cyan !important; }
      `;
      document.head.appendChild(style);
    }

    return () => {
      html.classList.remove('debug-focus-order', 'debug-touch-targets');
      const debugStyle = document.getElementById('a11y-landmark-debug');
      if (debugStyle) debugStyle.remove();
    };
  }, [enabled, showFocusOrder, showTouchTargets, showLandmarks]);

  if (!enabled) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-50 glass-panel p-4 space-y-2 text-xs"
      role="region"
      aria-label="Accessibility testing controls"
    >
      <p className="font-semibold text-foreground">A11y Testing Mode</p>
      <ul className="space-y-1 text-[var(--text-muted)]">
        {showFocusOrder && <li>Focus order visible</li>}
        {showTouchTargets && <li>Touch targets outlined</li>}
        {showLandmarks && <li>Landmarks outlined</li>}
      </ul>
      <p className="text-[10px]">
        Note: Use axe-core DevTools extension for comprehensive testing
      </p>
    </div>
  );
}

// Export all components and hooks
export default {
  SkipLink,
  VisuallyHidden,
  LiveRegion,
  AnnouncerProvider,
  FocusTrap,
  AccessibleIconButton,
  AccessibleHeading,
  AccessibleLink,
  AccessibleLoading,
  AccessibleProgress,
  AccessibleError,
  AccessibleDescription,
  RequiredIndicator,
  AnimationPauseControl,
  AccessibleSlider,
  StatusIndicator,
  AccessibleForm,
  AccessibleTable,
  MainLandmark,
  NavigationLandmark,
  AsideLandmark,
  FooterLandmark,
  HeaderLandmark,
  SearchLandmark,
  A11yTestingOverlay,
};
