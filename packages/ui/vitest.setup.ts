import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-color-scheme: dark)' ? false : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
class MockResizeObserver {
  observe(_target: Element): void {}
  unobserve(_target: Element): void {}
  disconnect(): void {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(
    private callback: IntersectionObserverCallback,
    _options?: IntersectionObserverInit
  ) {}

  observe(_target: Element): void {
    this.callback(
      [
        {
          isIntersecting: true,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRatio: 1,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          target: {} as Element,
          time: Date.now(),
        },
      ],
      this
    );
  }

  unobserve(_target: Element): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock requestAnimationFrame
let rafId = 0;
global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  rafId++;
  setTimeout(() => callback(Date.now()), 16);
  return rafId;
};

global.cancelAnimationFrame = (_id: number): void => {};

// Mock React Native modules
vi.mock('react-native', async () => {
  return {
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
    StyleSheet: {
      create: <T extends Record<string, unknown>>(styles: T): T => styles,
      flatten: <T>(style: T): T => style,
    },
    View: 'div',
    Text: 'span',
    Pressable: 'button',
    TextInput: 'input',
  };
});

// Mock Tamagui
const mockTheme = {
  background: { val: '#0A0A0A' },
  surface: { val: '#1A1A1A' },
  card: { val: '#242424' },
  border: { val: '#374151' },
  primary: { val: '#3B82F6' },
  primaryHover: { val: '#2563EB' },
  primaryPress: { val: '#1D4ED8' },
  secondary: { val: '#4B5563' },
  color: { val: '#FFFFFF' },
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

vi.mock('tamagui', async () => {
  const React = await import('react');

  // Base styled component factory
  const styled = (
    Component: React.ComponentType | string,
    config?: Record<string, unknown>
  ) => {
    const StyledComponent = React.forwardRef<
      HTMLElement,
      React.ComponentPropsWithRef<'div'> & {
        variant?: string;
        size?: string;
        color?: string;
        align?: string;
        weight?: string;
        truncate?: boolean;
        uppercase?: boolean;
        fullWidth?: boolean;
        circular?: boolean;
        horizontal?: boolean;
        pressable?: boolean;
        error?: boolean;
        disabled?: boolean;
        noBorder?: boolean;
        spread?: boolean;
        fullBleed?: boolean;
        compact?: boolean;
      }
    >((props, ref) => {
      const {
        children,
        variant,
        size,
        color,
        align,
        weight,
        truncate,
        uppercase,
        fullWidth,
        circular,
        horizontal,
        pressable,
        error,
        disabled,
        noBorder,
        spread,
        fullBleed,
        compact,
        ...rest
      } = props;

      const elementType =
        typeof Component === 'string' ? Component : Component || 'div';
      const dataAttrs: Record<string, string | boolean | undefined> = {
        'data-variant': variant,
        'data-size': size,
        'data-color': color,
        'data-align': align,
        'data-weight': weight,
        'data-truncate': truncate,
        'data-uppercase': uppercase,
        'data-full-width': fullWidth,
        'data-circular': circular,
        'data-horizontal': horizontal,
        'data-pressable': pressable,
        'data-error': error,
        'data-disabled': disabled,
        'data-no-border': noBorder,
        'data-spread': spread,
        'data-full-bleed': fullBleed,
        'data-compact': compact,
        'data-testid': config?.name as string,
      };

      if (typeof elementType === 'string') {
        return React.createElement(
          elementType,
          { ref, ...rest, ...dataAttrs },
          children
        );
      }

      return React.createElement(elementType, { ref, ...rest, ...dataAttrs }, children);
    });

    StyledComponent.displayName = (config?.name as string) || 'StyledComponent';
    return StyledComponent;
  };

  // Stack components
  const Stack = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithRef<'div'>
  >((props, ref) => React.createElement('div', { ref, ...props }));
  Stack.displayName = 'Stack';

  const XStack = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithRef<'div'>
  >((props, ref) =>
    React.createElement('div', {
      ref,
      style: { display: 'flex', flexDirection: 'row' },
      ...props,
    })
  );
  XStack.displayName = 'XStack';

  const YStack = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithRef<'div'>
  >((props, ref) =>
    React.createElement('div', {
      ref,
      style: { display: 'flex', flexDirection: 'column' },
      ...props,
    })
  );
  YStack.displayName = 'YStack';

  // Text component
  const Text = React.forwardRef<
    HTMLSpanElement,
    React.ComponentPropsWithRef<'span'>
  >((props, ref) => React.createElement('span', { ref, ...props }));
  Text.displayName = 'Text';

  // Input component
  const Input = React.forwardRef<
    HTMLInputElement,
    React.ComponentPropsWithRef<'input'>
  >((props, ref) => React.createElement('input', { ref, ...props }));
  Input.displayName = 'Input';

  // Theme component
  const Theme = ({
    children,
    name,
  }: {
    children: React.ReactNode;
    name?: string;
  }) =>
    React.createElement(
      'div',
      { 'data-theme': name, 'data-testid': 'theme-provider' },
      children
    );

  // TamaguiProvider
  const TamaguiProvider = ({
    children,
    config,
  }: {
    children: React.ReactNode;
    config?: unknown;
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'tamagui-provider' },
      children
    );

  return {
    styled,
    Stack,
    XStack,
    YStack,
    Text,
    Input,
    Theme,
    TamaguiProvider,
    useTheme: vi.fn(() => mockTheme),
    useThemeName: vi.fn(() => 'dark'),
    createTamagui: vi.fn((config) => config),
    createTokens: vi.fn((tokens) => tokens),
    GetProps: {} as never,
  };
});

// Mock Tamagui animations
vi.mock('@tamagui/animations-react-native', () => ({
  createAnimations: vi.fn((animations) => animations),
}));

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
