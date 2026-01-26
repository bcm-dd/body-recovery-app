/**
 * useHaptic Hook Tests
 *
 * Tests for haptic feedback hook and browser compatibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock haptics module - must use inline factory to avoid hoisting issues
vi.mock('../../src/lib/haptics', () => ({
  haptics: {
    tap: vi.fn(),
    click: vi.fn(),
    selection: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    impact: vi.fn(),
    toggleFeedback: vi.fn(),
    taskComplete: vi.fn(),
    slider: vi.fn(),
  },
  isHapticSupported: vi.fn(() => true),
  isHapticsEnabled: vi.fn(() => false),
  setHapticsEnabled: vi.fn(),
}));

// Mock sounds module
vi.mock('../../src/lib/sounds', () => ({
  sounds: {
    tap: vi.fn(),
    click: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    complete: vi.fn(),
    pop: vi.fn(),
    toggleSound: vi.fn(),
    slide: vi.fn(),
    getVolume: vi.fn(() => 0.3),
    setVolume: vi.fn(),
    toggle: vi.fn(() => true),
  },
  isSoundsEnabled: vi.fn(() => false),
  setSoundsEnabled: vi.fn(),
}));

import {
  useHaptic,
  useSound,
  useFeedback,
  useButtonFeedback,
  useToggleFeedback,
  useSliderFeedback,
} from '../../src/hooks/useHaptic';
import { haptics, isHapticSupported, setHapticsEnabled } from '../../src/lib/haptics';
import { sounds } from '../../src/lib/sounds';

describe('useHaptic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should return isSupported from haptics module', () => {
      const { result } = renderHook(() => useHaptic());

      expect(result.current.isSupported).toBe(true);
    });

    it('should return isEnabled based on stored preference', () => {
      const { result } = renderHook(() => useHaptic());

      // Initial state from mock is false
      expect(result.current.isEnabled).toBe(false);
    });
  });

  describe('Enable/Disable', () => {
    it('should enable haptics', () => {
      const { result } = renderHook(() => useHaptic());

      act(() => {
        result.current.enable();
      });

      expect(setHapticsEnabled).toHaveBeenCalledWith(true);
      expect(result.current.isEnabled).toBe(true);
    });

    it('should disable haptics', () => {
      const { result } = renderHook(() => useHaptic());

      act(() => {
        result.current.enable();
      });

      act(() => {
        result.current.disable();
      });

      expect(setHapticsEnabled).toHaveBeenCalledWith(false);
      expect(result.current.isEnabled).toBe(false);
    });

    it('should toggle haptics', () => {
      const { result } = renderHook(() => useHaptic());

      act(() => {
        const newState = result.current.toggle();
        expect(newState).toBe(true);
      });

      expect(result.current.isEnabled).toBe(true);

      act(() => {
        const newState = result.current.toggle();
        expect(newState).toBe(false);
      });

      expect(result.current.isEnabled).toBe(false);
    });
  });

  describe('Haptic Functions', () => {
    it('should provide tap function', () => {
      const { result } = renderHook(() => useHaptic());

      act(() => {
        result.current.tap();
      });

      expect(haptics.tap).toHaveBeenCalled();
    });

    it('should provide click function', () => {
      const { result } = renderHook(() => useHaptic());

      act(() => {
        result.current.click();
      });

      expect(haptics.click).toHaveBeenCalled();
    });

    it('should provide selection function', () => {
      const { result } = renderHook(() => useHaptic());

      act(() => {
        result.current.selection();
      });

      expect(haptics.selection).toHaveBeenCalled();
    });

    it('should provide success function', () => {
      const { result } = renderHook(() => useHaptic());

      act(() => {
        result.current.success();
      });

      expect(haptics.success).toHaveBeenCalled();
    });

    it('should provide warning function', () => {
      const { result } = renderHook(() => useHaptic());

      act(() => {
        result.current.warning();
      });

      expect(haptics.warning).toHaveBeenCalled();
    });

    it('should provide error function', () => {
      const { result } = renderHook(() => useHaptic());

      act(() => {
        result.current.error();
      });

      expect(haptics.error).toHaveBeenCalled();
    });

    it('should provide impact function with intensity', () => {
      const { result } = renderHook(() => useHaptic());

      act(() => {
        result.current.impact('heavy');
      });

      expect(haptics.impact).toHaveBeenCalledWith('heavy');
    });
  });
});

describe('useSound', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should return isEnabled based on stored preference', () => {
      const { result } = renderHook(() => useSound());

      expect(result.current.isEnabled).toBe(false);
    });

    it('should return initial volume', () => {
      const { result } = renderHook(() => useSound());

      expect(result.current.volume).toBe(0.3);
    });
  });

  describe('Enable/Disable', () => {
    it('should enable sounds', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.enable();
      });

      expect(result.current.isEnabled).toBe(true);
    });

    it('should disable sounds', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.enable();
        result.current.disable();
      });

      expect(result.current.isEnabled).toBe(false);
    });
  });

  describe('Volume Control', () => {
    it('should set volume', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.setVolume(0.7);
      });

      expect(sounds.setVolume).toHaveBeenCalledWith(0.7);
    });
  });

  describe('Sound Functions', () => {
    it('should provide click sound', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.click();
      });

      expect(sounds.click).toHaveBeenCalled();
    });

    it('should provide success sound', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.success();
      });

      expect(sounds.success).toHaveBeenCalled();
    });
  });
});

describe('useFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should return combined haptic and sound state', () => {
    const { result } = renderHook(() => useFeedback());

    expect(result.current.hapticsEnabled).toBeDefined();
    expect(result.current.soundsEnabled).toBeDefined();
  });

  it('should provide combined feedback functions', () => {
    const { result } = renderHook(() => useFeedback());

    expect(typeof result.current.tap).toBe('function');
    expect(typeof result.current.click).toBe('function');
    expect(typeof result.current.success).toBe('function');
    expect(typeof result.current.warning).toBe('function');
    expect(typeof result.current.error).toBe('function');
    expect(typeof result.current.complete).toBe('function');
    expect(typeof result.current.selection).toBe('function');
  });

  it('should trigger both haptic and sound on combined functions', () => {
    const { result } = renderHook(() => useFeedback());

    act(() => {
      result.current.success();
    });

    expect(haptics.success).toHaveBeenCalled();
    expect(sounds.success).toHaveBeenCalled();
  });
});

describe('useButtonFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return pointer event handlers', () => {
    const { result } = renderHook(() => useButtonFeedback());

    expect(typeof result.current.onPointerDown).toBe('function');
    expect(typeof result.current.onPointerUp).toBe('function');
  });

  it('should trigger haptic on pointer down by default', () => {
    const { result } = renderHook(() => useButtonFeedback());

    act(() => {
      result.current.onPointerDown();
    });

    expect(haptics.impact).toHaveBeenCalled();
  });

  it('should not trigger sound by default', () => {
    const { result } = renderHook(() => useButtonFeedback());

    act(() => {
      result.current.onPointerDown();
    });

    expect(sounds.tap).not.toHaveBeenCalled();
  });

  it('should trigger sound when enabled', () => {
    const { result } = renderHook(() => useButtonFeedback({ sound: true }));

    act(() => {
      result.current.onPointerDown();
    });

    expect(sounds.tap).toHaveBeenCalled();
  });

  it('should not trigger haptic when disabled', () => {
    const { result } = renderHook(() => useButtonFeedback({ haptic: false }));

    act(() => {
      result.current.onPointerDown();
    });

    expect(haptics.impact).not.toHaveBeenCalled();
  });

  it('should use specified intensity', () => {
    const { result } = renderHook(() =>
      useButtonFeedback({ intensity: 'heavy' })
    );

    act(() => {
      result.current.onPointerDown();
    });

    expect(haptics.impact).toHaveBeenCalledWith('heavy');
  });
});

describe('useToggleFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return onToggle handler', () => {
    const { result } = renderHook(() => useToggleFeedback());

    expect(typeof result.current.onToggle).toBe('function');
  });

  it('should trigger haptic and sound on toggle', () => {
    const { result } = renderHook(() => useToggleFeedback());

    act(() => {
      result.current.onToggle(true);
    });

    expect(haptics.toggleFeedback).toHaveBeenCalled();
    expect(sounds.toggleSound).toHaveBeenCalledWith(true);
  });
});

describe('useSliderFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return onSlide handler', () => {
    const { result } = renderHook(() => useSliderFeedback());

    expect(typeof result.current.onSlide).toBe('function');
  });

  it('should trigger feedback on significant value change', () => {
    const { result } = renderHook(() => useSliderFeedback());

    act(() => {
      result.current.onSlide(0.1);
    });

    expect(haptics.slider).toHaveBeenCalled();
    expect(sounds.slide).toHaveBeenCalledWith(0.1);
  });

  it('should not trigger feedback on small value change', () => {
    const { result } = renderHook(() => useSliderFeedback());

    // First call with a value
    act(() => {
      result.current.onSlide(0.5);
    });

    // Get initial call count
    const initialCallCount = vi.mocked(haptics.slider).mock.calls.length;

    act(() => {
      result.current.onSlide(0.51); // Only 0.01 difference
    });

    // Should not trigger again for small change
    expect(haptics.slider).toHaveBeenCalledTimes(initialCallCount);
  });
});

describe('Browser Compatibility', () => {
  it('should handle missing vibration API gracefully', () => {
    // Mock unsupported
    vi.mocked(isHapticSupported).mockReturnValueOnce(false);

    const { result } = renderHook(() => useHaptic());

    expect(result.current.isSupported).toBe(false);

    // Should still be able to call functions without errors
    expect(() => {
      act(() => {
        result.current.tap();
        result.current.success();
      });
    }).not.toThrow();
  });
});
