/**
 * Hooks Tests
 *
 * Tests for UI hooks: useTheme, useReducedMotion
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Store original values
const originalMatchMedia = window.matchMedia;
const originalPlatform = { OS: 'web' };

// Mock React Native
vi.mock('react-native', () => ({
  Platform: {
    OS: 'web',
    select: <T>(obj: { web?: T; default?: T }): T | undefined =>
      obj.web ?? obj.default,
  },
  AccessibilityInfo: {
    isReduceMotionEnabled: vi.fn().mockResolvedValue(false),
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
  },
  useColorScheme: vi.fn(() => 'light'),
}));

// Mock Tamagui hooks
const mockTheme = {
  background: { val: '#0A0A0A' },
  surface: { val: '#1A1A1A' },
  card: { val: '#242424' },
  border: { val: '#374151' },
  primary: { val: '#3B82F6' },
  primaryHover: { val: '#2563EB' },
  textPrimary: { val: '#FFFFFF' },
  textSecondary: { val: '#9CA3AF' },
  textMuted: { val: '#6B7280' },
  success: { val: '#22C55E' },
  warning: { val: '#F59E0B' },
  error: { val: '#EF4444' },
  painNone: { val: '#22C55E' },
  painMild: { val: '#FCD34D' },
  painModerate: { val: '#F59E0B' },
  painSevere: { val: '#EF4444' },
};

vi.mock('tamagui', () => ({
  useTheme: vi.fn(() => mockTheme),
  useThemeName: vi.fn(() => 'dark'),
}));

// Import after mocks
import {
  useTheme,
  useThemeColors,
  useResponsiveValue,
  useSafeSpacing,
} from '../src/hooks/useTheme';
import {
  useReducedMotion,
  useMotionSafeAnimation,
  useMotionSafeStyles,
} from '../src/hooks/useReducedMotion';

describe('useTheme Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Theme Access', () => {
    it('should return theme object', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBeDefined();
    });

    it('should return theme name', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.themeName).toBe('dark');
    });

    it('should return isDark boolean', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.isDark).toBe(true);
    });

    it('should return systemColorScheme', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.systemColorScheme).toBeDefined();
    });
  });

  describe('getColor Function', () => {
    it('should return color value for valid key', () => {
      const { result } = renderHook(() => useTheme());
      const color = result.current.getColor('primary');
      expect(color).toBe('#3B82F6');
    });

    it('should return key if color not found', () => {
      const { result } = renderHook(() => useTheme());
      const color = result.current.getColor('nonexistent');
      expect(color).toBe('nonexistent');
    });

    it('should return background color', () => {
      const { result } = renderHook(() => useTheme());
      const color = result.current.getColor('background');
      expect(color).toBe('#0A0A0A');
    });

    it('should return text colors', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.getColor('textPrimary')).toBe('#FFFFFF');
      expect(result.current.getColor('textSecondary')).toBe('#9CA3AF');
    });
  });

  describe('getSpace Function', () => {
    it('should calculate space based on 4px unit', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.getSpace(1)).toBe(4);
      expect(result.current.getSpace(2)).toBe(8);
      expect(result.current.getSpace(4)).toBe(16);
      expect(result.current.getSpace(8)).toBe(32);
    });

    it('should handle zero spacing', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.getSpace(0)).toBe(0);
    });
  });
});

describe('useThemeColors Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return background colors', () => {
    const { result } = renderHook(() => useThemeColors());
    expect(result.current.background).toBe('#0A0A0A');
    expect(result.current.surface).toBe('#1A1A1A');
    expect(result.current.card).toBe('#242424');
  });

  it('should return text colors', () => {
    const { result } = renderHook(() => useThemeColors());
    expect(result.current.textPrimary).toBe('#FFFFFF');
    expect(result.current.textSecondary).toBe('#9CA3AF');
    expect(result.current.textMuted).toBe('#6B7280');
  });

  it('should return brand colors', () => {
    const { result } = renderHook(() => useThemeColors());
    expect(result.current.primary).toBe('#3B82F6');
    expect(result.current.primaryHover).toBe('#2563EB');
  });

  it('should return status colors', () => {
    const { result } = renderHook(() => useThemeColors());
    expect(result.current.success).toBe('#22C55E');
    expect(result.current.warning).toBe('#F59E0B');
    expect(result.current.error).toBe('#EF4444');
  });

  it('should return pain level colors', () => {
    const { result } = renderHook(() => useThemeColors());
    expect(result.current.painNone).toBe('#22C55E');
    expect(result.current.painMild).toBe('#FCD34D');
    expect(result.current.painModerate).toBe('#F59E0B');
    expect(result.current.painSevere).toBe('#EF4444');
  });

  it('should return isDark flag', () => {
    const { result } = renderHook(() => useThemeColors());
    expect(result.current.isDark).toBe(true);
  });
});

describe('useResponsiveValue Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return default value when no breakpoint matches', () => {
    const { result } = renderHook(() =>
      useResponsiveValue({
        xs: 'xs-value',
        default: 'default-value',
      })
    );
    expect(result.current).toBe('default-value');
  });

  it('should accept different value types', () => {
    const { result: numberResult } = renderHook(() =>
      useResponsiveValue({ default: 100 })
    );
    expect(numberResult.current).toBe(100);

    const { result: objectResult } = renderHook(() =>
      useResponsiveValue({ default: { size: 'lg' } })
    );
    expect(objectResult.current).toEqual({ size: 'lg' });
  });
});

describe('useSafeSpacing Hook', () => {
  it('should return default safe area insets', () => {
    const { result } = renderHook(() => useSafeSpacing());

    expect(result.current.top).toBe(44);
    expect(result.current.bottom).toBe(34);
    expect(result.current.left).toBe(0);
    expect(result.current.right).toBe(0);
  });

  it('should return memoized values', () => {
    const { result, rerender } = renderHook(() => useSafeSpacing());
    const firstResult = result.current;

    rerender();
    expect(result.current).toBe(firstResult);
  });
});

describe('useReducedMotion Hook', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    });
  });

  it('should return false when reduced motion is not preferred', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('should return true when reduced motion is preferred', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('should listen for changes', () => {
    const addEventListenerMock = vi.fn();
    const removeEventListenerMock = vi.fn();

    matchMediaMock.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
      dispatchEvent: vi.fn(),
    }));

    const { unmount } = renderHook(() => useReducedMotion());

    expect(addEventListenerMock).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );

    unmount();

    expect(removeEventListenerMock).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('should update when preference changes', async () => {
    let changeHandler: ((event: { matches: boolean }) => void) | null = null;

    matchMediaMock.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event: string, handler: typeof changeHandler) => {
        if (event === 'change') {
          changeHandler = handler;
        }
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    // Simulate preference change
    if (changeHandler) {
      act(() => {
        changeHandler!({ matches: true });
      });
    }

    expect(result.current).toBe(true);
  });
});

describe('useMotionSafeAnimation Hook', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    });
  });

  it('should return normal animation when motion is allowed', () => {
    const { result } = renderHook(() =>
      useMotionSafeAnimation('bouncy', 'quickReduced')
    );
    expect(result.current).toBe('bouncy');
  });

  it('should return reduced animation when motion is reduced', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() =>
      useMotionSafeAnimation('bouncy', 'quickReduced')
    );
    expect(result.current).toBe('quickReduced');
  });

  it('should return default quickReduced when no reduced animation specified', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useMotionSafeAnimation('bouncy'));
    expect(result.current).toBe('quickReduced');
  });
});

describe('useMotionSafeStyles Hook', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    });
  });

  it('should return normal styles when motion is allowed', () => {
    const styles = {
      transform: 'translateY(-10px)',
      opacity: 0,
    };

    const { result } = renderHook(() => useMotionSafeStyles(styles));
    expect(result.current).toEqual(styles);
  });

  it('should return empty object when motion is reduced', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const styles = {
      transform: 'translateY(-10px)',
      opacity: 0,
    };

    const { result } = renderHook(() => useMotionSafeStyles(styles));
    expect(result.current).toEqual({});
  });
});
