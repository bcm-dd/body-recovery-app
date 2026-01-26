/**
 * Scroll Effects Utilities
 * Parallax, sticky headers, scroll-linked animations
 */

import { clamp, mapRange } from './animations';

// ============================================
// SCROLL POSITION TRACKING
// ============================================

export interface ScrollPosition {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'none';
  velocity: number;
  progress: number; // 0-1 based on document height
}

let lastScrollY = 0;
let lastScrollTime = Date.now();
let scrollVelocity = 0;

/**
 * Get current scroll position with direction and velocity
 */
export function getScrollPosition(): ScrollPosition {
  if (typeof window === 'undefined') {
    return { x: 0, y: 0, direction: 'none', velocity: 0, progress: 0 };
  }

  const currentY = window.scrollY;
  const currentTime = Date.now();
  const deltaTime = currentTime - lastScrollTime;
  const deltaY = currentY - lastScrollY;

  // Calculate velocity (pixels per ms)
  if (deltaTime > 0) {
    scrollVelocity = deltaY / deltaTime;
  }

  const direction: 'up' | 'down' | 'none' =
    deltaY > 0 ? 'down' : deltaY < 0 ? 'up' : 'none';

  // Calculate scroll progress
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = documentHeight > 0 ? currentY / documentHeight : 0;

  // Update tracking
  lastScrollY = currentY;
  lastScrollTime = currentTime;

  return {
    x: window.scrollX,
    y: currentY,
    direction,
    velocity: Math.abs(scrollVelocity),
    progress: clamp(progress, 0, 1),
  };
}

// ============================================
// PARALLAX EFFECTS
// ============================================

export interface ParallaxConfig {
  speed: number;        // -1 to 1, negative = opposite direction
  direction?: 'vertical' | 'horizontal';
  clampMin?: number;    // Min transform value
  clampMax?: number;    // Max transform value
}

/**
 * Calculate parallax offset based on scroll position
 */
export function calculateParallax(
  scrollY: number,
  elementTop: number,
  windowHeight: number,
  config: ParallaxConfig
): number {
  const { speed, clampMin = -500, clampMax = 500 } = config;

  // Calculate how far the element is from the viewport center
  const viewportCenter = scrollY + windowHeight / 2;
  const distanceFromCenter = elementTop - viewportCenter;

  // Calculate parallax offset
  const offset = distanceFromCenter * speed * -0.5;

  return clamp(offset, clampMin, clampMax);
}

/**
 * Apply parallax effect to an element
 */
export function applyParallax(
  element: HTMLElement,
  config: ParallaxConfig
): () => void {
  const handleScroll = () => {
    const rect = element.getBoundingClientRect();
    const elementTop = rect.top + window.scrollY;
    const offset = calculateParallax(
      window.scrollY,
      elementTop,
      window.innerHeight,
      config
    );

    const transform = config.direction === 'horizontal'
      ? `translateX(${offset}px)`
      : `translateY(${offset}px)`;

    element.style.transform = transform;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial position

  return () => {
    window.removeEventListener('scroll', handleScroll);
    element.style.transform = '';
  };
}

// ============================================
// STICKY HEADER WITH BLUR TRANSITION
// ============================================

export interface StickyHeaderConfig {
  scrollThreshold: number;     // When to start showing background
  blurAmount?: number;         // Blur in pixels
  bgOpacityStart?: number;     // Starting opacity
  bgOpacityEnd?: number;       // Ending opacity
}

export interface StickyHeaderState {
  isSticky: boolean;
  opacity: number;
  blur: number;
  scale: number;
}

/**
 * Calculate sticky header state based on scroll
 */
export function calculateStickyState(
  scrollY: number,
  config: StickyHeaderConfig
): StickyHeaderState {
  const {
    scrollThreshold,
    blurAmount = 12,
    bgOpacityStart = 0,
    bgOpacityEnd = 0.95,
  } = config;

  const progress = clamp(scrollY / scrollThreshold, 0, 1);

  return {
    isSticky: scrollY > 0,
    opacity: mapRange(progress, 0, 1, bgOpacityStart, bgOpacityEnd),
    blur: progress * blurAmount,
    scale: 1 - progress * 0.02, // Subtle scale for logo
  };
}

/**
 * Apply sticky header effect
 */
export function applyStickyHeader(
  header: HTMLElement,
  config: StickyHeaderConfig,
  onUpdate?: (state: StickyHeaderState) => void
): () => void {
  const handleScroll = () => {
    const state = calculateStickyState(window.scrollY, config);

    header.style.backdropFilter = `blur(${state.blur}px)`;
    header.style.backgroundColor = `rgba(var(--surface-rgb, 26, 26, 26), ${state.opacity})`;

    if (state.isSticky) {
      header.classList.add('is-sticky');
    } else {
      header.classList.remove('is-sticky');
    }

    onUpdate?.(state);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}

// ============================================
// SCROLL-LINKED ANIMATIONS
// ============================================

export interface ScrollAnimationConfig {
  start: number;          // Scroll position to start (0-1 or px)
  end: number;            // Scroll position to end (0-1 or px)
  properties: {
    property: string;     // CSS property name
    from: number | string;
    to: number | string;
    unit?: string;        // e.g., 'px', '%', 'deg'
  }[];
  useProgress?: boolean;  // Use 0-1 progress instead of pixels
}

/**
 * Calculate scroll-linked animation values
 */
export function calculateScrollAnimation(
  scrollY: number,
  documentHeight: number,
  config: ScrollAnimationConfig
): Record<string, string> {
  const { start, end, properties, useProgress = false } = config;

  let startPos = start;
  let endPos = end;

  if (useProgress) {
    startPos = start * documentHeight;
    endPos = end * documentHeight;
  }

  const progress = clamp((scrollY - startPos) / (endPos - startPos), 0, 1);
  const result: Record<string, string> = {};

  properties.forEach(({ property, from, to, unit = '' }) => {
    if (typeof from === 'number' && typeof to === 'number') {
      const value = mapRange(progress, 0, 1, from, to);
      result[property] = `${value}${unit}`;
    } else {
      // For string values, switch at midpoint
      result[property] = progress < 0.5 ? String(from) : String(to);
    }
  });

  return result;
}

/**
 * Apply scroll-linked animation to element
 */
export function applyScrollAnimation(
  element: HTMLElement,
  config: ScrollAnimationConfig
): () => void {
  const handleScroll = () => {
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const values = calculateScrollAnimation(window.scrollY, documentHeight, config);

    Object.entries(values).forEach(([prop, value]) => {
      (element.style as unknown as Record<string, string>)[prop] = value;
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}

// ============================================
// FADE IN ON SCROLL
// ============================================

export interface FadeInConfig {
  threshold?: number;     // Viewport percentage to trigger (0-1)
  duration?: number;      // Animation duration in ms
  delay?: number;         // Delay before animation
  translateY?: number;    // Initial Y offset in px
  once?: boolean;         // Only animate once
}

/**
 * Create fade-in on scroll observer
 */
export function createFadeInObserver(
  config: FadeInConfig = {}
): IntersectionObserver {
  const {
    threshold = 0.1,
    duration = 600,
    delay = 0,
    translateY = 30,
    once = true,
  } = config;

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement;

        if (entry.isIntersecting) {
          el.style.transition = `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';

          if (once) {
            // Stop observing after animation
            setTimeout(() => {
              el.style.transition = '';
            }, duration + delay);
          }
        } else if (!once) {
          el.style.opacity = '0';
          el.style.transform = `translateY(${translateY}px)`;
        }
      });
    },
    { threshold }
  );
}

/**
 * Apply fade-in on scroll to elements
 */
export function applyFadeInOnScroll(
  elements: HTMLElement[] | NodeListOf<Element>,
  config: FadeInConfig = {}
): () => void {
  const { translateY = 30 } = config;

  // Set initial state
  const elementsArray = Array.from(elements) as HTMLElement[];
  elementsArray.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = `translateY(${translateY}px)`;
  });

  const observer = createFadeInObserver(config);

  elementsArray.forEach((el) => observer.observe(el));

  return () => {
    observer.disconnect();
    elementsArray.forEach((el) => {
      el.style.opacity = '';
      el.style.transform = '';
      el.style.transition = '';
    });
  };
}

// ============================================
// INFINITE SCROLL HELPER
// ============================================

export interface InfiniteScrollConfig {
  threshold?: number;     // Distance from bottom to trigger (px)
  debounce?: number;      // Debounce time in ms
}

/**
 * Create infinite scroll observer
 */
export function createInfiniteScrollObserver(
  callback: () => void | Promise<void>,
  config: InfiniteScrollConfig = {}
): IntersectionObserver {
  const { threshold = 200 } = config;
  let isLoading = false;

  return new IntersectionObserver(
    async (entries) => {
      const entry = entries[0];

      if (entry.isIntersecting && !isLoading) {
        isLoading = true;

        try {
          await callback();
        } finally {
          isLoading = false;
        }
      }
    },
    {
      rootMargin: `0px 0px ${threshold}px 0px`,
    }
  );
}

// ============================================
// SCROLL SNAP UTILITIES
// ============================================

export interface ScrollSnapConfig {
  snapType: 'x' | 'y' | 'both';
  snapAlign: 'start' | 'center' | 'end';
  behavior?: 'smooth' | 'auto';
}

/**
 * Apply scroll snap to container
 */
export function applyScrollSnap(
  container: HTMLElement,
  config: ScrollSnapConfig
): () => void {
  const { snapType, snapAlign, behavior = 'smooth' } = config;

  // Apply container styles
  container.style.scrollSnapType = `${snapType} mandatory`;
  container.style.scrollBehavior = behavior;

  // Apply child styles
  const children = container.children;
  Array.from(children).forEach((child) => {
    (child as HTMLElement).style.scrollSnapAlign = snapAlign;
  });

  return () => {
    container.style.scrollSnapType = '';
    container.style.scrollBehavior = '';
    Array.from(children).forEach((child) => {
      (child as HTMLElement).style.scrollSnapAlign = '';
    });
  };
}

// ============================================
// REVEAL ON SCROLL
// ============================================

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'fade';

export interface RevealConfig {
  direction?: RevealDirection;
  distance?: number;
  duration?: number;
  delay?: number;
  threshold?: number;
  stagger?: number;       // Stagger delay for children
}

/**
 * Get initial transform for reveal direction
 */
function getRevealTransform(direction: RevealDirection, distance: number): string {
  switch (direction) {
    case 'up':
      return `translateY(${distance}px)`;
    case 'down':
      return `translateY(-${distance}px)`;
    case 'left':
      return `translateX(${distance}px)`;
    case 'right':
      return `translateX(-${distance}px)`;
    case 'fade':
    default:
      return 'none';
  }
}

/**
 * Apply reveal animation on scroll
 */
export function applyRevealOnScroll(
  elements: HTMLElement[] | NodeListOf<Element>,
  config: RevealConfig = {}
): () => void {
  const {
    direction = 'up',
    distance = 40,
    duration = 700,
    delay = 0,
    threshold = 0.15,
    stagger = 0,
  } = config;

  const elementsArray = Array.from(elements) as HTMLElement[];
  const initialTransform = getRevealTransform(direction, distance);

  // Set initial state
  elementsArray.forEach((el, index) => {
    el.style.opacity = '0';
    if (initialTransform !== 'none') {
      el.style.transform = initialTransform;
    }
    // Store stagger delay as data attribute
    if (stagger > 0) {
      el.dataset.staggerDelay = String(index * stagger);
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const staggerDelay = parseInt(el.dataset.staggerDelay || '0', 10);
          const totalDelay = delay + staggerDelay;

          el.style.transition = `
            opacity ${duration}ms ease-out ${totalDelay}ms,
            transform ${duration}ms ease-out ${totalDelay}ms
          `;
          el.style.opacity = '1';
          el.style.transform = 'none';

          observer.unobserve(el);
        }
      });
    },
    { threshold }
  );

  elementsArray.forEach((el) => observer.observe(el));

  return () => {
    observer.disconnect();
    elementsArray.forEach((el) => {
      el.style.opacity = '';
      el.style.transform = '';
      el.style.transition = '';
      delete el.dataset.staggerDelay;
    });
  };
}
