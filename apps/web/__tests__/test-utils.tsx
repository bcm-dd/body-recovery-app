/**
 * Test Utilities
 *
 * Custom render function with providers for testing components
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode, createContext, useContext } from 'react';
import { vi } from 'vitest';

// Mock app state type
interface BodyRegion {
  id: string;
  name: string;
  painLevel: number;
  lastUpdated: Date;
}

interface ExerciseCompleted {
  id: string;
  name: string;
  setsCompleted: number;
  setsTarget: number;
}

interface Session {
  id: string;
  date: Date;
  duration: number;
  exercises: ExerciseCompleted[];
  painBefore: number;
  painAfter: number;
}

interface UserPreferences {
  sessionDuration: number;
  reminderTime: string;
  darkMode: boolean;
}

interface AppState {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  bodyRegions: BodyRegion[];
  sessions: Session[];
  preferences: UserPreferences;
}

// Mock data
export const mockAppState: AppState = {
  user: {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
  },
  bodyRegions: [
    { id: 'lower-back', name: 'Lower Back', painLevel: 4, lastUpdated: new Date() },
    { id: 'left-shoulder', name: 'Left Shoulder', painLevel: 2, lastUpdated: new Date() },
    { id: 'right-knee', name: 'Right Knee', painLevel: 3, lastUpdated: new Date() },
  ],
  sessions: [
    {
      id: 'session-1',
      date: new Date(Date.now() - 86400000),
      duration: 18,
      exercises: [
        { id: 'ex-1', name: 'Cat-Cow Stretch', setsCompleted: 3, setsTarget: 3 },
        { id: 'ex-2', name: 'Hip Circles', setsCompleted: 2, setsTarget: 2 },
      ],
      painBefore: 5,
      painAfter: 3,
    },
    {
      id: 'session-2',
      date: new Date(Date.now() - 172800000),
      duration: 22,
      exercises: [
        { id: 'ex-1', name: 'Cat-Cow Stretch', setsCompleted: 3, setsTarget: 3 },
        { id: 'ex-3', name: 'Bird Dog', setsCompleted: 3, setsTarget: 3 },
      ],
      painBefore: 6,
      painAfter: 4,
    },
  ],
  preferences: {
    sessionDuration: 20,
    reminderTime: '07:30',
    darkMode: true,
  },
};

// Mock theme context
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// Mock app state context
const AppStateContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within TestProviders');
  }
  return context;
};

// Test providers wrapper
interface TestProvidersProps {
  children: ReactNode;
  appState?: Partial<AppState>;
  theme?: 'light' | 'dark';
}

export function TestProviders({
  children,
  appState = {},
  theme = 'dark',
}: TestProvidersProps) {
  const mergedState = { ...mockAppState, ...appState };
  const mockToggleTheme = vi.fn();

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: mockToggleTheme }}>
      <AppStateContext.Provider value={mergedState}>
        {children}
      </AppStateContext.Provider>
    </ThemeContext.Provider>
  );
}

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  appState?: Partial<AppState>;
  theme?: 'light' | 'dark';
}

export function customRender(
  ui: ReactElement,
  { appState, theme, ...options }: CustomRenderOptions = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders appState={appState} theme={theme}>
        {children}
      </TestProviders>
    ),
    ...options,
  });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };

// Helper to create mock sessions
export function createMockSession(
  overrides: Partial<Session> = {}
): Session {
  return {
    id: `session-${Date.now()}`,
    date: new Date(),
    duration: 20,
    exercises: [
      { id: 'ex-1', name: 'Test Exercise', setsCompleted: 3, setsTarget: 3 },
    ],
    painBefore: 5,
    painAfter: 3,
    ...overrides,
  };
}

// Helper to create mock body region
export function createMockBodyRegion(
  overrides: Partial<BodyRegion> = {}
): BodyRegion {
  return {
    id: 'test-region',
    name: 'Test Region',
    painLevel: 0,
    lastUpdated: new Date(),
    ...overrides,
  };
}
