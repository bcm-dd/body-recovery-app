'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import { type ReactNode, useState, createContext, useContext, useEffect, useMemo } from 'react';

import enMessages from '../messages/en.json';
import esMessages from '../messages/es.json';
import frMessages from '../messages/fr.json';
import deMessages from '../messages/de.json';
import { PWAProvider } from '../src/components/PWAProvider';
import { WebVitalsProvider } from '../src/components/WebVitalsProvider';
import { defaultLocale, locales, type Locale, setStoredLocale, getStoredLocale, detectBrowserLocale, getTextDirection } from '../src/lib/i18n';

// Theme context for dark mode toggle
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

// Locale context for language switching
interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  availableLocales: readonly Locale[];
  dir: 'ltr' | 'rtl';
}

const LocaleContext = createContext<LocaleContextType>({
  locale: defaultLocale,
  setLocale: () => {},
  availableLocales: locales,
  dir: 'ltr',
});

export function useLocaleContext() {
  return useContext(LocaleContext);
}

// Mock Zustand store integration - in production, would import from @app/data
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

interface BodyRegion {
  id: string;
  name: string;
  painLevel: number; // 0-10
  lastUpdated: Date;
}

interface Session {
  id: string;
  date: Date;
  duration: number; // minutes
  exercises: ExerciseCompleted[];
  painBefore: number;
  painAfter: number;
}

interface ExerciseCompleted {
  id: string;
  name: string;
  setsCompleted: number;
  setsTarget: number;
}

interface UserPreferences {
  sessionDuration: number;
  reminderTime: string;
  darkMode: boolean;
}

// App state context
const AppStateContext = createContext<AppState | null>(null);

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context;
}

// Mock data adapter - simulates @app/data MockHealthAdapter
function createMockAppState(): AppState {
  return {
    user: {
      id: 'user-1',
      name: 'Demo User',
      email: 'demo@example.com',
    },
    bodyRegions: [
      { id: 'lower-back', name: 'Lower Back', painLevel: 4, lastUpdated: new Date() },
      { id: 'left-shoulder', name: 'Left Shoulder', painLevel: 2, lastUpdated: new Date() },
      { id: 'right-knee', name: 'Right Knee', painLevel: 3, lastUpdated: new Date() },
      { id: 'neck', name: 'Neck', painLevel: 1, lastUpdated: new Date() },
      { id: 'left-hip', name: 'Left Hip', painLevel: 2, lastUpdated: new Date() },
    ],
    sessions: [
      {
        id: 'session-1',
        date: new Date(Date.now() - 86400000), // Yesterday
        duration: 18,
        exercises: [
          { id: 'ex-1', name: 'Cat-Cow Stretch', setsCompleted: 3, setsTarget: 3 },
          { id: 'ex-2', name: 'Hip Circles', setsCompleted: 2, setsTarget: 2 },
          { id: 'ex-3', name: 'Child\'s Pose', setsCompleted: 3, setsTarget: 3 },
          { id: 'ex-4', name: 'Bird Dog', setsCompleted: 2, setsTarget: 3 },
        ],
        painBefore: 5,
        painAfter: 3,
      },
      {
        id: 'session-2',
        date: new Date(Date.now() - 172800000), // 2 days ago
        duration: 22,
        exercises: [
          { id: 'ex-1', name: 'Cat-Cow Stretch', setsCompleted: 3, setsTarget: 3 },
          { id: 'ex-5', name: 'Shoulder Rolls', setsCompleted: 2, setsTarget: 2 },
          { id: 'ex-6', name: 'Thread the Needle', setsCompleted: 3, setsTarget: 3 },
          { id: 'ex-7', name: 'Knee to Chest', setsCompleted: 3, setsTarget: 3 },
          { id: 'ex-8', name: 'Pelvic Tilts', setsCompleted: 3, setsTarget: 3 },
        ],
        painBefore: 6,
        painAfter: 4,
      },
      {
        id: 'session-3',
        date: new Date(Date.now() - 259200000), // 3 days ago
        duration: 15,
        exercises: [
          { id: 'ex-3', name: 'Child\'s Pose', setsCompleted: 3, setsTarget: 3 },
          { id: 'ex-4', name: 'Bird Dog', setsCompleted: 3, setsTarget: 3 },
          { id: 'ex-9', name: 'Standing Quad Stretch', setsCompleted: 2, setsTarget: 2 },
        ],
        painBefore: 5,
        painAfter: 3,
      },
      {
        id: 'session-4',
        date: new Date(Date.now() - 345600000), // 4 days ago
        duration: 20,
        exercises: [
          { id: 'ex-1', name: 'Cat-Cow Stretch', setsCompleted: 3, setsTarget: 3 },
          { id: 'ex-2', name: 'Hip Circles', setsCompleted: 2, setsTarget: 2 },
          { id: 'ex-10', name: 'Supine Twist', setsCompleted: 2, setsTarget: 2 },
          { id: 'ex-6', name: 'Thread the Needle', setsCompleted: 3, setsTarget: 3 },
        ],
        painBefore: 6,
        painAfter: 3,
      },
      {
        id: 'session-5',
        date: new Date(Date.now() - 518400000), // 6 days ago
        duration: 17,
        exercises: [
          { id: 'ex-3', name: 'Child\'s Pose', setsCompleted: 3, setsTarget: 3 },
          { id: 'ex-7', name: 'Knee to Chest', setsCompleted: 3, setsTarget: 3 },
          { id: 'ex-8', name: 'Pelvic Tilts', setsCompleted: 3, setsTarget: 3 },
        ],
        painBefore: 7,
        painAfter: 4,
      },
    ],
    preferences: {
      sessionDuration: 20,
      reminderTime: '07:30',
      darkMode: true,
    },
  };
}

// Import messages for all supported locales
// Messages are statically imported for better performance and type safety

const allMessages: Record<Locale, typeof enMessages> = {
  en: enMessages,
  es: esMessages as typeof enMessages,
  fr: frMessages as typeof enMessages,
  de: deMessages as typeof enMessages,
};

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Optimized QueryClient configuration for performance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is fresh for 5 minutes (reduces unnecessary refetches)
            staleTime: 5 * 60 * 1000,
            // Keep unused data in cache for 30 minutes
            gcTime: 30 * 60 * 1000,
            // Don't refetch on window focus (reduces network requests)
            refetchOnWindowFocus: false,
            // Refetch when reconnecting to network
            refetchOnReconnect: true,
            // Retry failed requests up to 3 times with exponential backoff
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Enable structural sharing for better memory efficiency
            structuralSharing: true,
          },
          mutations: {
            // Retry mutations once
            retry: 1,
          },
        },
      })
  );

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [appState] = useState<AppState>(createMockAppState);

  // Get text direction for current locale
  const dir = useMemo(() => getTextDirection(locale), [locale]);

  // Handle locale change
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setStoredLocale(newLocale);
    // Update document direction for RTL support
    document.documentElement.dir = getTextDirection(newLocale);
    document.documentElement.lang = newLocale;
  };

  // Initialize locale from storage or browser preference
  useEffect(() => {
    const storedLocale = getStoredLocale();
    if (storedLocale && locales.includes(storedLocale)) {
      setLocaleState(storedLocale);
      document.documentElement.dir = getTextDirection(storedLocale);
      document.documentElement.lang = storedLocale;
    } else {
      const browserLocale = detectBrowserLocale();
      if (browserLocale !== defaultLocale) {
        setLocaleState(browserLocale);
        document.documentElement.dir = getTextDirection(browserLocale);
        document.documentElement.lang = browserLocale;
      }
    }
  }, []);

  useEffect(() => {
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    // Apply theme class to document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Get messages for current locale
  const messages = allMessages[locale] || allMessages[defaultLocale];

  return (
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
        <LocaleContext.Provider
          value={{
            locale,
            setLocale,
            availableLocales: locales,
            dir,
          }}
        >
          <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <AppStateContext.Provider value={appState}>
              <PWAProvider
                showInstallPrompt={true}
                showNotificationPrompt={true}
                showOfflineIndicator={true}
                installPromptDelay={5000}
                notificationPromptDelay={15000}
              >
                <WebVitalsProvider debug={process.env.NODE_ENV === 'development'}>
                  {children}
                </WebVitalsProvider>
              </PWAProvider>
            </AppStateContext.Provider>
          </ThemeContext.Provider>
        </LocaleContext.Provider>
      </NextIntlClientProvider>
    </QueryClientProvider>
  );
}
