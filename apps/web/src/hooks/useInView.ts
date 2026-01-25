'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseInViewOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
  triggerOnce?: boolean;
  delay?: number;
}

export interface UseInViewReturn {
  ref: React.RefCallback<Element>;
  inView: boolean;
  entry: IntersectionObserverEntry | null;
}

/**
 * Hook to detect when an element enters or leaves the viewport
 */
export function useInView(options: UseInViewOptions = {}): UseInViewReturn {
  const {
    threshold = 0,
    rootMargin = '0px',
    root = null,
    triggerOnce = false,
    delay = 0,
  } = options;

  const [inView, setInView] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasTriggered = useRef(false);

  // Cleanup observer
  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  // Ref callback to handle element assignment
  const ref = useCallback(
    (element: Element | null) => {
      // Clean up previous observer
      cleanup();

      if (!element) {
        elementRef.current = null;
        return;
      }

      elementRef.current = element;

      // Don't observe if already triggered and triggerOnce is true
      if (triggerOnce && hasTriggered.current) {
        return;
      }

      // Create new observer
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [observerEntry] = entries;

          const isIntersecting = observerEntry.isIntersecting;

          // Handle delay
          if (delay > 0 && isIntersecting) {
            setTimeout(() => {
              setInView(isIntersecting);
              setEntry(observerEntry);
            }, delay);
          } else {
            setInView(isIntersecting);
            setEntry(observerEntry);
          }

          // Handle triggerOnce
          if (isIntersecting && triggerOnce) {
            hasTriggered.current = true;
            cleanup();
          }
        },
        {
          threshold,
          rootMargin,
          root,
        }
      );

      observerRef.current.observe(element);
    },
    [threshold, rootMargin, root, triggerOnce, delay, cleanup]
  );

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { ref, inView, entry };
}

/**
 * Hook for staggered reveal animations
 */
export function useStaggeredInView(
  itemCount: number,
  options: UseInViewOptions & { staggerDelay?: number } = {}
): {
  containerRef: React.RefCallback<Element>;
  isContainerInView: boolean;
  getItemProps: (index: number) => {
    style: React.CSSProperties;
    'data-index': number;
  };
} {
  const { staggerDelay = 100, ...inViewOptions } = options;
  const { ref: containerRef, inView: isContainerInView } = useInView({
    ...inViewOptions,
    triggerOnce: true,
  });

  const getItemProps = useCallback(
    (index: number) => ({
      style: {
        opacity: isContainerInView ? 1 : 0,
        transform: isContainerInView ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease-out ${index * staggerDelay}ms, transform 0.5s ease-out ${index * staggerDelay}ms`,
      } as React.CSSProperties,
      'data-index': index,
    }),
    [isContainerInView, staggerDelay]
  );

  return {
    containerRef,
    isContainerInView,
    getItemProps,
  };
}

/**
 * Hook for scroll progress within an element
 */
export function useScrollProgress(options: {
  offset?: [string, string];
} = {}): {
  ref: React.RefCallback<Element>;
  progress: number;
  isInView: boolean;
} {
  const { offset = ['start end', 'end start'] } = options;
  const [progress, setProgress] = useState(0);
  const elementRef = useRef<Element | null>(null);
  const { ref: inViewRef, inView } = useInView({
    threshold: Array.from({ length: 100 }, (_, i) => i / 100),
  });

  const ref = useCallback(
    (element: Element | null) => {
      elementRef.current = element;
      inViewRef(element);
    },
    [inViewRef]
  );

  useEffect(() => {
    if (!elementRef.current || typeof window === 'undefined') return;

    const handleScroll = () => {
      const element = elementRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Parse offset
      // Calculate progress based on element position in viewport
      // 0 = element bottom at viewport bottom
      // 1 = element top at viewport top
      const elementHeight = rect.height;
      const scrollProgress =
        1 - (rect.bottom - windowHeight * 0) / (elementHeight + windowHeight);

      setProgress(Math.max(0, Math.min(1, scrollProgress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [offset]);

  return { ref, progress, isInView: inView };
}

/**
 * Hook for triggering animations when element comes into view
 */
export function useAnimateOnView(
  animation: {
    initial: React.CSSProperties;
    animate: React.CSSProperties;
    transition?: {
      duration?: number;
      delay?: number;
      easing?: string;
    };
  },
  options: UseInViewOptions = {}
): {
  ref: React.RefCallback<Element>;
  style: React.CSSProperties;
  isAnimating: boolean;
} {
  const { ref, inView } = useInView({
    ...options,
    triggerOnce: options.triggerOnce ?? true,
  });

  const {
    initial,
    animate,
    transition = { duration: 500, delay: 0, easing: 'ease-out' },
  } = animation;

  const { duration = 500, delay = 0, easing = 'ease-out' } = transition;

  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (inView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [inView, hasAnimated]);

  const currentStyles = hasAnimated ? animate : initial;

  const style: React.CSSProperties = {
    ...currentStyles,
    transition: `all ${duration}ms ${easing} ${delay}ms`,
  };

  return {
    ref,
    style,
    isAnimating: inView && !hasAnimated,
  };
}
