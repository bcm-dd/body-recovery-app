/**
 * Settings Store
 *
 * Manages user preferences, theme settings, and notification settings.
 * Uses Zustand for state management with persistence.
 */

import { create } from 'zustand';

// ============================================
// TYPES
// ============================================

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Measurement units
 */
export type WeightUnit = 'kg' | 'lbs';
export type DistanceUnit = 'km' | 'miles';

/**
 * Workout reminder time
 */
export interface ReminderTime {
  hour: number;
  minute: number;
  enabled: boolean;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  workoutReminders: boolean;
  reminderTime: ReminderTime;
  checkInReminders: boolean;
  checkInTime: ReminderTime;
  progressUpdates: boolean;
  restDayReminders: boolean;
}

/**
 * Privacy preferences
 */
export interface PrivacyPreferences {
  healthDataEnabled: boolean;
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
}

/**
 * User preferences
 */
export interface UserPreferences {
  // Profile
  name: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  focusAreas: string[]; // Body regions to focus on

  // Display
  theme: ThemeMode;
  reducedMotion: boolean;
  hapticFeedback: boolean;

  // Units
  weightUnit: WeightUnit;
  distanceUnit: DistanceUnit;

  // Notifications
  notifications: NotificationPreferences;

  // Privacy
  privacy: PrivacyPreferences;

  // App state
  hasCompletedOnboarding: boolean;
  isDemoMode: boolean;
  lastActiveAt: Date | null;
}

// ============================================
// DEFAULTS
// ============================================

const DEFAULT_REMINDER_TIME: ReminderTime = {
  hour: 9,
  minute: 0,
  enabled: true,
};

const DEFAULT_CHECKIN_TIME: ReminderTime = {
  hour: 8,
  minute: 0,
  enabled: true,
};

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  workoutReminders: true,
  reminderTime: DEFAULT_REMINDER_TIME,
  checkInReminders: true,
  checkInTime: DEFAULT_CHECKIN_TIME,
  progressUpdates: true,
  restDayReminders: false,
};

const DEFAULT_PRIVACY: PrivacyPreferences = {
  healthDataEnabled: false,
  analyticsEnabled: true,
  crashReportingEnabled: true,
};

const DEFAULT_PREFERENCES: UserPreferences = {
  name: '',
  fitnessLevel: 'beginner',
  focusAreas: [],
  theme: 'system',
  reducedMotion: false,
  hapticFeedback: true,
  weightUnit: 'kg',
  distanceUnit: 'km',
  notifications: DEFAULT_NOTIFICATIONS,
  privacy: DEFAULT_PRIVACY,
  hasCompletedOnboarding: false,
  isDemoMode: false,
  lastActiveAt: null,
};

// ============================================
// STORE STATE
// ============================================

interface SettingsState {
  // Preferences
  preferences: UserPreferences;

  // Quick access
  theme: ThemeMode;
  isDemoMode: boolean;
  hasCompletedOnboarding: boolean;

  // Actions
  updatePreferences: (partial: Partial<UserPreferences>) => void;
  setTheme: (theme: ThemeMode) => void;
  setDemoMode: (enabled: boolean) => void;
  completeOnboarding: () => void;

  // Notifications
  setNotificationPreference: (
    key: keyof NotificationPreferences,
    value: boolean | ReminderTime
  ) => void;
  setReminderTime: (
    type: 'workout' | 'checkIn',
    time: Partial<ReminderTime>
  ) => void;

  // Privacy
  setPrivacyPreference: (key: keyof PrivacyPreferences, value: boolean) => void;
  enableHealthData: () => void;
  disableHealthData: () => void;

  // Profile
  setName: (name: string) => void;
  setFitnessLevel: (level: UserPreferences['fitnessLevel']) => void;
  setFocusAreas: (areas: string[]) => void;

  // Units
  setWeightUnit: (unit: WeightUnit) => void;
  setDistanceUnit: (unit: DistanceUnit) => void;

  // Accessibility
  setReducedMotion: (enabled: boolean) => void;
  setHapticFeedback: (enabled: boolean) => void;

  // Activity tracking
  updateLastActive: () => void;

  // Reset
  resetPreferences: () => void;
}

// ============================================
// STORE
// ============================================

export const useSettingsStore = create<SettingsState>((set, get) => ({
  preferences: DEFAULT_PREFERENCES,
  theme: 'system',
  isDemoMode: false,
  hasCompletedOnboarding: false,

  updatePreferences: (partial) => {
    const { preferences } = get();
    const newPreferences = { ...preferences, ...partial };

    set({
      preferences: newPreferences,
      theme: newPreferences.theme,
      isDemoMode: newPreferences.isDemoMode,
      hasCompletedOnboarding: newPreferences.hasCompletedOnboarding,
    });
  },

  setTheme: (theme) => {
    const { preferences } = get();
    set({
      preferences: { ...preferences, theme },
      theme,
    });
  },

  setDemoMode: (enabled) => {
    const { preferences } = get();
    set({
      preferences: { ...preferences, isDemoMode: enabled },
      isDemoMode: enabled,
    });
  },

  completeOnboarding: () => {
    const { preferences } = get();
    set({
      preferences: { ...preferences, hasCompletedOnboarding: true },
      hasCompletedOnboarding: true,
    });
  },

  setNotificationPreference: (key, value) => {
    const { preferences } = get();
    set({
      preferences: {
        ...preferences,
        notifications: {
          ...preferences.notifications,
          [key]: value,
        },
      },
    });
  },

  setReminderTime: (type, time) => {
    const { preferences } = get();
    const key = type === 'workout' ? 'reminderTime' : 'checkInTime';

    set({
      preferences: {
        ...preferences,
        notifications: {
          ...preferences.notifications,
          [key]: {
            ...preferences.notifications[key],
            ...time,
          },
        },
      },
    });
  },

  setPrivacyPreference: (key, value) => {
    const { preferences } = get();
    set({
      preferences: {
        ...preferences,
        privacy: {
          ...preferences.privacy,
          [key]: value,
        },
      },
    });
  },

  enableHealthData: () => {
    const { preferences } = get();
    set({
      preferences: {
        ...preferences,
        privacy: {
          ...preferences.privacy,
          healthDataEnabled: true,
        },
      },
    });
  },

  disableHealthData: () => {
    const { preferences } = get();
    set({
      preferences: {
        ...preferences,
        privacy: {
          ...preferences.privacy,
          healthDataEnabled: false,
        },
      },
    });
  },

  setName: (name) => {
    const { preferences } = get();
    set({
      preferences: { ...preferences, name },
    });
  },

  setFitnessLevel: (level) => {
    const { preferences } = get();
    set({
      preferences: { ...preferences, fitnessLevel: level },
    });
  },

  setFocusAreas: (areas) => {
    const { preferences } = get();
    set({
      preferences: { ...preferences, focusAreas: areas },
    });
  },

  setWeightUnit: (unit) => {
    const { preferences } = get();
    set({
      preferences: { ...preferences, weightUnit: unit },
    });
  },

  setDistanceUnit: (unit) => {
    const { preferences } = get();
    set({
      preferences: { ...preferences, distanceUnit: unit },
    });
  },

  setReducedMotion: (enabled) => {
    const { preferences } = get();
    set({
      preferences: { ...preferences, reducedMotion: enabled },
    });
  },

  setHapticFeedback: (enabled) => {
    const { preferences } = get();
    set({
      preferences: { ...preferences, hapticFeedback: enabled },
    });
  },

  updateLastActive: () => {
    const { preferences } = get();
    set({
      preferences: { ...preferences, lastActiveAt: new Date() },
    });
  },

  resetPreferences: () => {
    set({
      preferences: DEFAULT_PREFERENCES,
      theme: 'system',
      isDemoMode: false,
      hasCompletedOnboarding: false,
    });
  },
}));

// ============================================
// SELECTORS
// ============================================

/**
 * Get effective theme (resolving 'system')
 */
export const selectEffectiveTheme = (
  state: SettingsState,
  systemTheme: 'light' | 'dark'
) => {
  if (state.theme === 'system') {
    return systemTheme;
  }
  return state.theme;
};

/**
 * Check if user has enabled health data
 */
export const selectHealthDataEnabled = (state: SettingsState) =>
  state.preferences.privacy.healthDataEnabled;

/**
 * Check if notifications are enabled
 */
export const selectNotificationsEnabled = (state: SettingsState) =>
  state.preferences.notifications.workoutReminders ||
  state.preferences.notifications.checkInReminders ||
  state.preferences.notifications.progressUpdates;

/**
 * Get formatted reminder time
 */
export const selectFormattedReminderTime = (
  state: SettingsState,
  type: 'workout' | 'checkIn'
): string => {
  const time =
    type === 'workout'
      ? state.preferences.notifications.reminderTime
      : state.preferences.notifications.checkInTime;

  const hour = time.hour % 12 || 12;
  const ampm = time.hour < 12 ? 'AM' : 'PM';
  const minute = time.minute.toString().padStart(2, '0');

  return `${hour}:${minute} ${ampm}`;
};

// ============================================
// EXPORTS
// ============================================

export { DEFAULT_PREFERENCES, DEFAULT_NOTIFICATIONS, DEFAULT_PRIVACY };
