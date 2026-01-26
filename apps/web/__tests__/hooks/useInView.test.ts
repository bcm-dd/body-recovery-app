/**
 * useInView Hook Tests
 *
 * Tests for intersection observer based viewport detection
 * Uses the global IntersectionObserver mock from vitest.setup.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInView, useStaggeredInView, useAnimateOnView } from '../../src/hooks/useInView';

describe('useInView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return ref callback function', () => {
      const { result } = renderHook(() => useInView());

      expect(typeof result.current.ref).toBe('function');
    });

    it('should have entry initially null', () => {
      const { result } = renderHook(() => useInView());

      expect(result.current.entry).toBeNull();
    });
  });

  describe('Observer Integration', () => {
    it('should work with ref attachment', () => {
      const { result } = renderHook(() => useInView());
      const element = document.createElement('div');

      // The global mock immediately triggers intersection when observe is called
      act(() => {
        result.current.ref(element);
      });

      // With the global mock, inView should become true after observe is called
      expect(result.current.inView).toBe(true);
    });

    it('should cleanup on unmount', () => {
      const { result, unmount } = renderHook(() => useInView());
      const element = document.createElement('div');

      act(() => {
        result.current.ref(element);
      });

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Options', () => {
    it('should accept threshold option', () => {
      const { result } = renderHook(() => useInView({ threshold: 0.5 }));

      expect(typeof result.current.ref).toBe('function');
    });

    it('should accept rootMargin option', () => {
      const { result } = renderHook(() =>
        useInView({ rootMargin: '10px 20px' })
      );

      expect(typeof result.current.ref).toBe('function');
    });

    it('should accept root option', () => {
      const root = document.createElement('div');
      const { result } = renderHook(() => useInView({ root }));

      expect(typeof result.current.ref).toBe('function');
    });
  });

  describe('triggerOnce Option', () => {
    it('should accept triggerOnce option', () => {
      const { result } = renderHook(() => useInView({ triggerOnce: true }));
      const element = document.createElement('div');

      act(() => {
        result.current.ref(element);
      });

      expect(result.current.inView).toBe(true);
    });
  });

  describe('delay Option', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should accept delay option', () => {
      const { result } = renderHook(() => useInView({ delay: 100 }));

      expect(typeof result.current.ref).toBe('function');
    });
  });
});

describe('useStaggeredInView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return container ref and item props generator', () => {
    const { result } = renderHook(() => useStaggeredInView(3));

    expect(typeof result.current.containerRef).toBe('function');
    expect(typeof result.current.getItemProps).toBe('function');
  });

  it('should generate item props for each index', () => {
    const { result } = renderHook(() => useStaggeredInView(3, { staggerDelay: 50 }));

    const props0 = result.current.getItemProps(0);
    const props1 = result.current.getItemProps(1);
    const props2 = result.current.getItemProps(2);

    expect(props0['data-index']).toBe(0);
    expect(props1['data-index']).toBe(1);
    expect(props2['data-index']).toBe(2);
  });

  it('should return opacity 0 when not in view', () => {
    const { result } = renderHook(() => useStaggeredInView(3));

    const props = result.current.getItemProps(0);
    expect(props.style.opacity).toBe(0);
  });

  it('should return opacity 1 when container is in view', () => {
    const { result } = renderHook(() => useStaggeredInView(3));
    const element = document.createElement('div');

    act(() => {
      result.current.containerRef(element);
    });

    // Global mock immediately triggers intersection
    const props = result.current.getItemProps(0);
    expect(props.style.opacity).toBe(1);
  });
});

describe('useAnimateOnView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial styles before in view', () => {
    const animation = {
      initial: { opacity: 0, transform: 'translateY(20px)' },
      animate: { opacity: 1, transform: 'translateY(0)' },
    };

    const { result } = renderHook(() => useAnimateOnView(animation));

    expect(result.current.style.opacity).toBe(0);
    expect(result.current.style.transform).toBe('translateY(20px)');
  });

  it('should return ref function', () => {
    const animation = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    };

    const { result } = renderHook(() => useAnimateOnView(animation));

    expect(typeof result.current.ref).toBe('function');
  });

  it('should include transition in style when specified', () => {
    const animation = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 500, delay: 100 },
    };

    const { result } = renderHook(() => useAnimateOnView(animation));

    expect(result.current.style.transition).toContain('500ms');
    expect(result.current.style.transition).toContain('100ms');
  });

  it('should return animate styles after ref is attached', () => {
    const animation = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    };

    const { result } = renderHook(() => useAnimateOnView(animation));
    const element = document.createElement('div');

    act(() => {
      result.current.ref(element);
    });

    // Global mock immediately triggers intersection
    expect(result.current.style.opacity).toBe(1);
  });

  it('should report isAnimating correctly', () => {
    const animation = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    };

    const { result } = renderHook(() => useAnimateOnView(animation));

    // Initially not animating
    expect(result.current.isAnimating).toBe(false);
  });
});
