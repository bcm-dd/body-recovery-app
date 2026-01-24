import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import { storage, StorageKeys, getJSON, setJSON, getBoolean, setBoolean } from '@/lib/storage';

/**
 * App-wide state and context provider
 * Handles initialization, preferences, and global state
 */

// Types
interface UserPreferences {
  sessionDuration: number; // minutes
  preferredTime: string; // HH:mm format
  intensityLevel: 'light' | 'moderate' | 'challenging';
  reminderEnabled: boolean;
  eveningReminderEnabled: boolean;
  healthDataConnected: boolean;
}

interface AppState {
  isInitialized: boolean;
  isOnboardingComplete: boolean;
  userPreferences: UserPreferences;
  isOffline: boolean;
}

interface AppContextValue extends AppState {
  setOnboardingComplete: (complete: boolean) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  resetApp: () => void;
}

// Default values
const DEFAULT_PREFERENCES: UserPreferences = {
  sessionDuration: 20,
  preferredTime: '07:30',
  intensityLevel: 'moderate',
  reminderEnabled: true,
  eveningReminderEnabled: false,
  healthDataConnected: false,
};

const DEFAULT_STATE: AppState = {
  isInitialized: false,
  isOnboardingComplete: false,
  userPreferences: DEFAULT_PREFERENCES,
  isOffline: false,
};

// Context
const AppContext = createContext<AppContextValue | null>(null);

/**
 * Hook to access app context
 */
export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

/**
 * Hook to check if app is ready
 */
export function useIsAppReady(): boolean {
  const { isInitialized } = useApp();
  return isInitialized;
}

/**
 * Hook to check onboarding status
 */
export function useIsOnboardingComplete(): boolean {
  const { isOnboardingComplete } = useApp();
  return isOnboardingComplete;
}

/**
 * Hook to access user preferences
 */
export function useUserPreferences(): UserPreferences {
  const { userPreferences } = useApp();
  return userPreferences;
}

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Main app provider component
 */
export function AppProvider({ children }: AppProviderProps) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);

  // Initialize app state from storage on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load onboarding status
        const isOnboardingComplete = getBoolean(StorageKeys.ONBOARDING_COMPLETED);

        // Load user preferences
        const savedPreferences = getJSON<UserPreferences>(StorageKeys.USER_PREFERENCES);
        const userPreferences = savedPreferences
          ? { ...DEFAULT_PREFERENCES, ...savedPreferences }
          : DEFAULT_PREFERENCES;

        setState({
          isInitialized: true,
          isOnboardingComplete,
          userPreferences,
          isOffline: false,
        });
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Still mark as initialized with defaults
        setState({
          ...DEFAULT_STATE,
          isInitialized: true,
        });
      }
    };

    initializeApp();
  }, []);

  // Set onboarding complete
  const setOnboardingComplete = (complete: boolean) => {
    setBoolean(StorageKeys.ONBOARDING_COMPLETED, complete);
    setState((prev) => ({ ...prev, isOnboardingComplete: complete }));
  };

  // Update user preferences
  const updatePreferences = (preferences: Partial<UserPreferences>) => {
    const newPreferences = { ...state.userPreferences, ...preferences };
    setJSON(StorageKeys.USER_PREFERENCES, newPreferences);
    setState((prev) => ({ ...prev, userPreferences: newPreferences }));
  };

  // Reset entire app state (for logout/debugging)
  const resetApp = () => {
    storage.clearAll();
    setState({
      ...DEFAULT_STATE,
      isInitialized: true,
    });
  };

  const value: AppContextValue = {
    ...state,
    setOnboardingComplete,
    updatePreferences,
    resetApp,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export default AppProvider;
