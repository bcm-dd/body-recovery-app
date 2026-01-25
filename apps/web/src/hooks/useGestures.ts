'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

import { haptics } from '../lib/haptics';

// ============================================
// SWIPE GESTURE HOOK
// ============================================

export interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', velocity: number) => void;
}

export interface SwipeOptions {
  threshold?: number;           // Minimum distance for swipe (px)
  velocityThreshold?: number;   // Minimum velocity for swipe (px/ms)
  preventScroll?: boolean;      // Prevent default scroll on swipe
  hapticFeedback?: boolean;     // Enable haptic feedback
}

/**
 * Hook for detecting swipe gestures
 */
export function useSwipe(
  handlers: SwipeHandlers,
  options: SwipeOptions = {}
): {
  ref: React.RefCallback<HTMLElement>;
  isSwiping: boolean;
} {
  const {
    threshold = 50,
    velocityThreshold = 0.3,
    preventScroll = false,
    hapticFeedback = true,
  } = options;

  const [isSwiping, setIsSwiping] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const startRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const ref = useCallback(
    (element: HTMLElement | null) => {
      elementRef.current = element;
    },
    []
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      setIsSwiping(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (preventScroll && startRef.current) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - startRef.current.x;
        const deltaY = touch.clientY - startRef.current.y;

        // Prevent scroll if horizontal swipe is dominant
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startRef.current.x;
      const deltaY = touch.clientY - startRef.current.y;
      const deltaTime = Date.now() - startRef.current.time;

      const velocity = Math.sqrt(deltaX ** 2 + deltaY ** 2) / deltaTime;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      setIsSwiping(false);

      // Check if it's a valid swipe
      const isValidSwipe =
        (absX > threshold || absY > threshold) &&
        velocity > velocityThreshold;

      if (!isValidSwipe) {
        startRef.current = null;
        return;
      }

      // Determine swipe direction
      let direction: 'left' | 'right' | 'up' | 'down';
      if (absX > absY) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      // Haptic feedback
      if (hapticFeedback) {
        haptics.swipe();
      }

      // Call handlers
      handlers.onSwipe?.(direction, velocity);

      switch (direction) {
        case 'left':
          handlers.onSwipeLeft?.();
          break;
        case 'right':
          handlers.onSwipeRight?.();
          break;
        case 'up':
          handlers.onSwipeUp?.();
          break;
        case 'down':
          handlers.onSwipeDown?.();
          break;
      }

      startRef.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handlers, threshold, velocityThreshold, preventScroll, hapticFeedback]);

  return { ref, isSwiping };
}

// ============================================
// PULL TO REFRESH HOOK
// ============================================

export interface PullToRefreshOptions {
  threshold?: number;           // Pull distance to trigger refresh (px)
  maxPull?: number;             // Maximum pull distance (px)
  resistance?: number;          // Pull resistance (0-1)
  hapticFeedback?: boolean;
  onRefresh: () => Promise<void> | void;
}

/**
 * Hook for pull-to-refresh functionality
 */
export function usePullToRefresh(options: PullToRefreshOptions): {
  ref: React.RefCallback<HTMLElement>;
  pullDistance: number;
  isRefreshing: boolean;
  isPulling: boolean;
  progress: number;  // 0-1 based on threshold
} {
  const {
    threshold = 80,
    maxPull = 150,
    resistance = 0.4,
    hapticFeedback = true,
    onRefresh,
  } = options;

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const startYRef = useRef<number | null>(null);
  const hasPassedThresholdRef = useRef(false);

  const ref = useCallback(
    (element: HTMLElement | null) => {
      elementRef.current = element;
    },
    []
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only start if at top of scroll
      if (element.scrollTop !== 0 || isRefreshing) return;

      startYRef.current = e.touches[0].clientY;
      hasPassedThresholdRef.current = false;
      setIsPulling(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startYRef.current === null || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startYRef.current;

      // Only pull down
      if (deltaY <= 0) {
        setPullDistance(0);
        return;
      }

      // Apply resistance
      const resistedDelta = deltaY * resistance;
      const clampedDelta = Math.min(resistedDelta, maxPull);

      setPullDistance(clampedDelta);

      // Haptic feedback when passing threshold
      if (hapticFeedback && clampedDelta >= threshold && !hasPassedThresholdRef.current) {
        hasPassedThresholdRef.current = true;
        haptics.pullThreshold();
      }

      // Prevent default scrolling
      if (deltaY > 10) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      if (startYRef.current === null) return;

      startYRef.current = null;
      setIsPulling(false);

      if (pullDistance >= threshold && !isRefreshing) {
        if (hapticFeedback) {
          haptics.pullRelease();
        }

        setIsRefreshing(true);

        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [threshold, maxPull, resistance, hapticFeedback, onRefresh, isRefreshing, pullDistance]);

  const progress = Math.min(pullDistance / threshold, 1);

  return { ref, pullDistance, isRefreshing, isPulling, progress };
}

// ============================================
// LONG PRESS HOOK
// ============================================

export interface LongPressOptions {
  delay?: number;               // Time to trigger long press (ms)
  hapticFeedback?: boolean;
  onLongPress: () => void;
  onPressStart?: () => void;
  onPressEnd?: () => void;
}

/**
 * Hook for long press detection
 */
export function useLongPress(options: LongPressOptions): {
  ref: React.RefCallback<HTMLElement>;
  isPressed: boolean;
  progress: number;  // 0-1 based on delay
} {
  const {
    delay = 500,
    hapticFeedback = true,
    onLongPress,
    onPressStart,
    onPressEnd,
  } = options;

  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);
  const elementRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const ref = useCallback(
    (element: HTMLElement | null) => {
      elementRef.current = element;
    },
    []
  );

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleStart = () => {
      setIsPressed(true);
      setProgress(0);
      startTimeRef.current = Date.now();
      onPressStart?.();

      if (hapticFeedback) {
        haptics.longPressStart();
      }

      // Update progress
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const currentProgress = Math.min(elapsed / delay, 1);
        setProgress(currentProgress);

        if (currentProgress >= 1) {
          clearTimers();
        }
      }, 16);

      // Trigger long press after delay
      timerRef.current = setTimeout(() => {
        if (hapticFeedback) {
          haptics.longPressComplete();
        }
        onLongPress();
        clearTimers();
      }, delay);
    };

    const handleEnd = () => {
      clearTimers();
      setIsPressed(false);
      setProgress(0);
      onPressEnd?.();
    };

    const handleCancel = () => {
      clearTimers();
      setIsPressed(false);
      setProgress(0);
    };

    element.addEventListener('pointerdown', handleStart);
    element.addEventListener('pointerup', handleEnd);
    element.addEventListener('pointerleave', handleCancel);
    element.addEventListener('pointercancel', handleCancel);

    return () => {
      clearTimers();
      element.removeEventListener('pointerdown', handleStart);
      element.removeEventListener('pointerup', handleEnd);
      element.removeEventListener('pointerleave', handleCancel);
      element.removeEventListener('pointercancel', handleCancel);
    };
  }, [delay, hapticFeedback, onLongPress, onPressStart, onPressEnd, clearTimers]);

  return { ref, isPressed, progress };
}

// ============================================
// PINCH TO ZOOM HOOK
// ============================================

export interface PinchToZoomOptions {
  minScale?: number;
  maxScale?: number;
  onScaleChange?: (scale: number) => void;
}

/**
 * Hook for pinch-to-zoom functionality
 */
export function usePinchToZoom(options: PinchToZoomOptions = {}): {
  ref: React.RefCallback<HTMLElement>;
  scale: number;
  isPinching: boolean;
  reset: () => void;
  style: React.CSSProperties;
} {
  const {
    minScale = 0.5,
    maxScale = 3,
    onScaleChange,
  } = options;

  const [scale, setScale] = useState(1);
  const [isPinching, setIsPinching] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const initialDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);

  const ref = useCallback(
    (element: HTMLElement | null) => {
      elementRef.current = element;
    },
    []
  );

  const reset = useCallback(() => {
    setScale(1);
    onScaleChange?.(1);
  }, [onScaleChange]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const getDistance = (touches: TouchList): number => {
      const [touch1, touch2] = [touches[0], touches[1]];
      return Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        setIsPinching(true);
        initialDistanceRef.current = getDistance(e.touches);
        initialScaleRef.current = scale;
        e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistanceRef.current !== null) {
        const currentDistance = getDistance(e.touches);
        const scaleFactor = currentDistance / initialDistanceRef.current;
        const newScale = Math.min(
          maxScale,
          Math.max(minScale, initialScaleRef.current * scaleFactor)
        );

        setScale(newScale);
        onScaleChange?.(newScale);
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        setIsPinching(false);
        initialDistanceRef.current = null;
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scale, minScale, maxScale, onScaleChange]);

  const style: React.CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: 'center center',
    transition: isPinching ? 'none' : 'transform 0.2s ease-out',
  };

  return { ref, scale, isPinching, reset, style };
}

// ============================================
// DRAG GESTURE HOOK
// ============================================

export interface DragOptions {
  axis?: 'x' | 'y' | 'both';
  bounds?: { left?: number; right?: number; top?: number; bottom?: number };
  onDragStart?: (position: { x: number; y: number }) => void;
  onDrag?: (position: { x: number; y: number }) => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
}

/**
 * Hook for drag gestures
 */
export function useDrag(options: DragOptions = {}): {
  ref: React.RefCallback<HTMLElement>;
  position: { x: number; y: number };
  isDragging: boolean;
  style: React.CSSProperties;
} {
  const {
    axis = 'both',
    bounds,
    onDragStart,
    onDrag,
    onDragEnd,
  } = options;

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startOffsetRef = useRef({ x: 0, y: 0 });

  const ref = useCallback(
    (element: HTMLElement | null) => {
      elementRef.current = element;
    },
    []
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handlePointerDown = (e: PointerEvent) => {
      setIsDragging(true);
      startPosRef.current = { x: e.clientX, y: e.clientY };
      startOffsetRef.current = { ...position };
      element.setPointerCapture(e.pointerId);
      onDragStart?.(position);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;

      let newX = startOffsetRef.current.x + (e.clientX - startPosRef.current.x);
      let newY = startOffsetRef.current.y + (e.clientY - startPosRef.current.y);

      // Apply axis constraints
      if (axis === 'x') newY = 0;
      if (axis === 'y') newX = 0;

      // Apply bounds
      if (bounds) {
        if (bounds.left !== undefined) newX = Math.max(bounds.left, newX);
        if (bounds.right !== undefined) newX = Math.min(bounds.right, newX);
        if (bounds.top !== undefined) newY = Math.max(bounds.top, newY);
        if (bounds.bottom !== undefined) newY = Math.min(bounds.bottom, newY);
      }

      const newPos = { x: newX, y: newY };
      setPosition(newPos);
      onDrag?.(newPos);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      onDragEnd?.(position);
    };

    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointercancel', handlePointerUp);

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [axis, bounds, isDragging, position, onDragStart, onDrag, onDragEnd]);

  const style: React.CSSProperties = {
    transform: `translate(${position.x}px, ${position.y}px)`,
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
    userSelect: 'none',
  };

  return { ref, position, isDragging, style };
}
