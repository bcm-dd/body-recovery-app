import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Mock window
Object.defineProperty(global, 'window', {
  value: {
    localStorage: localStorageMock,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  writable: true,
});

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});
