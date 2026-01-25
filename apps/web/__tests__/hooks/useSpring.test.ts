/**
 * useSpring Hook Tests
 *
 * Tests for spring-based animation hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock the animation library
vi.mock('../../src/lib/animations', () => ({
  springPresets: {
    default: { stiffness: 100, damping: 10, mass: 1 },
    gentle: { stiffness: 50, damping: 15, mass: 1 },
    bouncy: { stiffness: 200, damping: 8, mass: 1 },
  },
  createSpringAnimation: vi.fn(
    (
      _from: number,
      to: number,
      _config: unknown,
      onUpdate: (value: number) => void,
      onComplete: () => void
    ) => {
      // Immediately complete the animation for tests
      queueMicrotask(() => {
        onUpdate(to);
        onComplete();
      });

      return () => {}; // Cancel function
    }
  ),
}));

// Mock useReducedMotion
vi.mock('../../src/hooks/useMediaQuery', () => ({
  useReducedMotion: () => false,
}));

import { useSpring, useSpringValues, useSpringTransform } from '../../src/hooks/useSpring';

describe('useSpring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return initial value', () => {
      const { result } = renderHook(() => useSpring(0));

      expect(result.current.value).toBe(0);
      expect(result.current.isAnimating).toBe(false);
    });

    it('should accept custom initial value', () => {
      const { result } = renderHook(() => useSpring(100));

      expect(result.current.value).toBe(100);
    });
  });

  describe('setValue', () => {
    it('should set value immediately when immediate flag is true', () => {
      const { result } = renderHook(() => useSpring(0));

      act(() => {
        result.current.setValue(100, true);
      });

      expect(result.current.value).toBe(100);
      expect(result.current.isAnimating).toBe(false);
    });

    it('should trigger animation when setValue is called', async () => {
      const { result } = renderHook(() => useSpring(0));

      act(() => {
        result.current.setValue(100);
      });

      // Animation should start
      expect(result.current.isAnimating).toBe(true);

      // Wait for microtask to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.value).toBe(100);
      expect(result.current.isAnimating).toBe(false);
    });
  });

  describe('Configuration', () => {
    it('should accept string preset config', () => {
      const { result } = renderHook(() => useSpring(0, 'gentle'));

      expect(result.current.value).toBe(0);
    });

    it('should accept custom config object', () => {
      const customConfig = { stiffness: 300, damping: 20, mass: 2 };
      const { result } = renderHook(() => useSpring(0, customConfig));

      expect(result.current.value).toBe(0);
    });
  });
});

describe('useSpringValues', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return initial values object', () => {
      const { result } = renderHook(() =>
        useSpringValues({ x: 0, y: 0, scale: 1 })
      );

      expect(result.current.values.x).toBe(0);
      expect(result.current.values.y).toBe(0);
      expect(result.current.values.scale).toBe(1);
      expect(result.current.isAnimating).toBe(false);
    });
  });

  describe('setValues', () => {
    it('should set values immediately when immediate flag is true', () => {
      const { result } = renderHook(() =>
        useSpringValues({ x: 0, y: 0 })
      );

      act(() => {
        result.current.setValues({ x: 100, y: 50 }, true);
      });

      expect(result.current.values.x).toBe(100);
      expect(result.current.values.y).toBe(50);
      expect(result.current.isAnimating).toBe(false);
    });

    it('should trigger animation when setValues is called', async () => {
      const { result } = renderHook(() =>
        useSpringValues({ x: 0, y: 0 })
      );

      act(() => {
        result.current.setValues({ x: 100, y: 50 });
      });

      expect(result.current.isAnimating).toBe(true);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.values.x).toBe(100);
      expect(result.current.values.y).toBe(50);
    });

    it('should update partial values', async () => {
      const { result } = renderHook(() =>
        useSpringValues({ x: 0, y: 0, z: 0 })
      );

      act(() => {
        result.current.setValues({ x: 50 }, true);
      });

      expect(result.current.values.x).toBe(50);
      expect(result.current.values.y).toBe(0);
      expect(result.current.values.z).toBe(0);
    });
  });
});

describe('useSpringTransform', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return default transform values', () => {
      const { result } = renderHook(() => useSpringTransform());

      expect(result.current.x).toBe(0);
      expect(result.current.y).toBe(0);
      expect(result.current.scale).toBe(1);
      expect(result.current.rotation).toBe(0);
    });

    it('should return style object', () => {
      const { result } = renderHook(() => useSpringTransform());

      expect(result.current.style).toBeDefined();
      expect(result.current.style.transform).toContain('translate');
      expect(result.current.style.transform).toContain('scale');
      expect(result.current.style.transform).toContain('rotate');
    });
  });

  describe('setTransform', () => {
    it('should set transform immediately when immediate flag is true', () => {
      const { result } = renderHook(() => useSpringTransform());

      act(() => {
        result.current.setTransform({ x: 10, y: 20 }, true);
      });

      expect(result.current.x).toBe(10);
      expect(result.current.y).toBe(20);
    });

    it('should update scale immediately', () => {
      const { result } = renderHook(() => useSpringTransform());

      act(() => {
        result.current.setTransform({ scale: 1.5 }, true);
      });

      expect(result.current.scale).toBe(1.5);
    });

    it('should update rotation immediately', () => {
      const { result } = renderHook(() => useSpringTransform());

      act(() => {
        result.current.setTransform({ rotation: 45 }, true);
      });

      expect(result.current.rotation).toBe(45);
    });

    it('should trigger animation when setTransform is called', async () => {
      const { result } = renderHook(() => useSpringTransform());

      act(() => {
        result.current.setTransform({ x: 10, y: 20 });
      });

      expect(result.current.isAnimating).toBe(true);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.x).toBe(10);
      expect(result.current.y).toBe(20);
    });
  });

  describe('reset', () => {
    it('should start reset animation', async () => {
      const { result } = renderHook(() => useSpringTransform());

      act(() => {
        result.current.setTransform({ x: 100, y: 50, scale: 2, rotation: 90 }, true);
      });

      expect(result.current.x).toBe(100);

      act(() => {
        result.current.reset();
      });

      // reset triggers animation
      expect(result.current.isAnimating).toBe(true);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.x).toBe(0);
      expect(result.current.y).toBe(0);
      expect(result.current.scale).toBe(1);
      expect(result.current.rotation).toBe(0);
    });
  });

  describe('Style Generation', () => {
    it('should generate correct transform string', () => {
      const { result } = renderHook(() => useSpringTransform());

      act(() => {
        result.current.setTransform(
          { x: 10, y: 20, scale: 1.5, rotation: 45 },
          true
        );
      });

      const style = result.current.style;
      expect(style.transform).toBe(
        'translate(10px, 20px) scale(1.5) rotate(45deg)'
      );
    });
  });
});
