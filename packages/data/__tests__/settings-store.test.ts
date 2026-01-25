/**
 * Settings Store Tests
 *
 * Tests for user preferences, theme settings, and notification settings.
 * Uses direct Zustand store access to avoid React concurrent rendering issues.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  useSettingsStore,
  selectEffectiveTheme,
  selectHealthDataEnabled,
  selectNotificationsEnabled,
  selectFormattedReminderTime,
  DEFAULT_PREFERENCES,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_PRIVACY,
} from '../src/stores/settings';
import type {
  ThemeMode,
  WeightUnit,
  DistanceUnit,
  NotificationPreferences,
  PrivacyPreferences,
} from '../src/stores/settings';

describe('useSettingsStore', () => {
  beforeEach(() => {
    // Reset store to default state before each test
    useSettingsStore.getState().resetPreferences();
  });

  describe('Initial State', () => {
    it('should have default preferences initially', () => {
      const state = useSettingsStore.getState();
      expect(state.preferences).toEqual(DEFAULT_PREFERENCES);
    });

    it('should have system theme by default', () => {
      const state = useSettingsStore.getState();
      expect(state.theme).toBe('system');
    });

    it('should have isDemoMode false by default', () => {
      const state = useSettingsStore.getState();
      expect(state.isDemoMode).toBe(false);
    });

    it('should have hasCompletedOnboarding false by default', () => {
      const state = useSettingsStore.getState();
      expect(state.hasCompletedOnboarding).toBe(false);
    });

    it('should have empty name by default', () => {
      const state = useSettingsStore.getState();
      expect(state.preferences.name).toBe('');
    });

    it('should have beginner fitness level by default', () => {
      const state = useSettingsStore.getState();
      expect(state.preferences.fitnessLevel).toBe('beginner');
    });
  });

  describe('updatePreferences', () => {
    it('should update single preference', () => {
      useSettingsStore.getState().updatePreferences({ name: 'John' });

      const state = useSettingsStore.getState();
      expect(state.preferences.name).toBe('John');
    });

    it('should update multiple preferences at once', () => {
      useSettingsStore.getState().updatePreferences({
        name: 'Jane',
        fitnessLevel: 'advanced',
        focusAreas: ['lower_back', 'knees'],
      });

      const state = useSettingsStore.getState();
      expect(state.preferences.name).toBe('Jane');
      expect(state.preferences.fitnessLevel).toBe('advanced');
      expect(state.preferences.focusAreas).toEqual(['lower_back', 'knees']);
    });

    it('should sync theme to state root', () => {
      useSettingsStore.getState().updatePreferences({ theme: 'dark' });

      const state = useSettingsStore.getState();
      expect(state.theme).toBe('dark');
      expect(state.preferences.theme).toBe('dark');
    });

    it('should sync isDemoMode to state root', () => {
      useSettingsStore.getState().updatePreferences({ isDemoMode: true });

      const state = useSettingsStore.getState();
      expect(state.isDemoMode).toBe(true);
      expect(state.preferences.isDemoMode).toBe(true);
    });

    it('should sync hasCompletedOnboarding to state root', () => {
      useSettingsStore.getState().updatePreferences({ hasCompletedOnboarding: true });

      const state = useSettingsStore.getState();
      expect(state.hasCompletedOnboarding).toBe(true);
      expect(state.preferences.hasCompletedOnboarding).toBe(true);
    });
  });

  describe('Theme Management', () => {
    it('should set light theme', () => {
      useSettingsStore.getState().setTheme('light');

      const state = useSettingsStore.getState();
      expect(state.theme).toBe('light');
      expect(state.preferences.theme).toBe('light');
    });

    it('should set dark theme', () => {
      useSettingsStore.getState().setTheme('dark');

      const state = useSettingsStore.getState();
      expect(state.theme).toBe('dark');
      expect(state.preferences.theme).toBe('dark');
    });

    it('should set system theme', () => {
      useSettingsStore.getState().setTheme('dark');
      useSettingsStore.getState().setTheme('system');

      const state = useSettingsStore.getState();
      expect(state.theme).toBe('system');
    });
  });

  describe('Demo Mode', () => {
    it('should enable demo mode', () => {
      useSettingsStore.getState().setDemoMode(true);

      const state = useSettingsStore.getState();
      expect(state.isDemoMode).toBe(true);
      expect(state.preferences.isDemoMode).toBe(true);
    });

    it('should disable demo mode', () => {
      useSettingsStore.getState().setDemoMode(true);
      useSettingsStore.getState().setDemoMode(false);

      const state = useSettingsStore.getState();
      expect(state.isDemoMode).toBe(false);
    });
  });

  describe('Onboarding', () => {
    it('should complete onboarding', () => {
      expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(false);

      useSettingsStore.getState().completeOnboarding();

      const state = useSettingsStore.getState();
      expect(state.hasCompletedOnboarding).toBe(true);
      expect(state.preferences.hasCompletedOnboarding).toBe(true);
    });
  });

  describe('Notification Preferences', () => {
    it('should set workout reminders', () => {
      useSettingsStore.getState().setNotificationPreference('workoutReminders', false);

      expect(useSettingsStore.getState().preferences.notifications.workoutReminders).toBe(false);
    });

    it('should set check-in reminders', () => {
      useSettingsStore.getState().setNotificationPreference('checkInReminders', false);

      expect(useSettingsStore.getState().preferences.notifications.checkInReminders).toBe(false);
    });

    it('should set progress updates', () => {
      useSettingsStore.getState().setNotificationPreference('progressUpdates', false);

      expect(useSettingsStore.getState().preferences.notifications.progressUpdates).toBe(false);
    });

    it('should set rest day reminders', () => {
      useSettingsStore.getState().setNotificationPreference('restDayReminders', true);

      expect(useSettingsStore.getState().preferences.notifications.restDayReminders).toBe(true);
    });

    it('should set reminder time object', () => {
      const newReminderTime = { hour: 10, minute: 30, enabled: true };
      useSettingsStore.getState().setNotificationPreference('reminderTime', newReminderTime);

      expect(useSettingsStore.getState().preferences.notifications.reminderTime).toEqual(newReminderTime);
    });
  });

  describe('setReminderTime', () => {
    it('should set workout reminder time', () => {
      useSettingsStore.getState().setReminderTime('workout', { hour: 7, minute: 0 });

      const { reminderTime } = useSettingsStore.getState().preferences.notifications;
      expect(reminderTime.hour).toBe(7);
      expect(reminderTime.minute).toBe(0);
    });

    it('should set check-in reminder time', () => {
      useSettingsStore.getState().setReminderTime('checkIn', { hour: 20, minute: 30 });

      const { checkInTime } = useSettingsStore.getState().preferences.notifications;
      expect(checkInTime.hour).toBe(20);
      expect(checkInTime.minute).toBe(30);
    });

    it('should partially update reminder time', () => {
      const originalTime = useSettingsStore.getState().preferences.notifications.reminderTime;

      useSettingsStore.getState().setReminderTime('workout', { hour: 11 });

      const { reminderTime } = useSettingsStore.getState().preferences.notifications;
      expect(reminderTime.hour).toBe(11);
      expect(reminderTime.minute).toBe(originalTime.minute);
      expect(reminderTime.enabled).toBe(originalTime.enabled);
    });

    it('should toggle reminder enabled state', () => {
      useSettingsStore.getState().setReminderTime('workout', { enabled: false });

      expect(useSettingsStore.getState().preferences.notifications.reminderTime.enabled).toBe(false);
    });
  });

  describe('Privacy Preferences', () => {
    it('should set health data enabled', () => {
      useSettingsStore.getState().setPrivacyPreference('healthDataEnabled', true);

      expect(useSettingsStore.getState().preferences.privacy.healthDataEnabled).toBe(true);
    });

    it('should set analytics enabled', () => {
      useSettingsStore.getState().setPrivacyPreference('analyticsEnabled', false);

      expect(useSettingsStore.getState().preferences.privacy.analyticsEnabled).toBe(false);
    });

    it('should set crash reporting enabled', () => {
      useSettingsStore.getState().setPrivacyPreference('crashReportingEnabled', false);

      expect(useSettingsStore.getState().preferences.privacy.crashReportingEnabled).toBe(false);
    });

    it('should enable health data via convenience method', () => {
      useSettingsStore.getState().enableHealthData();

      expect(useSettingsStore.getState().preferences.privacy.healthDataEnabled).toBe(true);
    });

    it('should disable health data via convenience method', () => {
      useSettingsStore.getState().enableHealthData();
      useSettingsStore.getState().disableHealthData();

      expect(useSettingsStore.getState().preferences.privacy.healthDataEnabled).toBe(false);
    });
  });

  describe('Profile Settings', () => {
    it('should set name', () => {
      useSettingsStore.getState().setName('Alice');

      expect(useSettingsStore.getState().preferences.name).toBe('Alice');
    });

    it('should set fitness level to beginner', () => {
      useSettingsStore.getState().setFitnessLevel('beginner');

      expect(useSettingsStore.getState().preferences.fitnessLevel).toBe('beginner');
    });

    it('should set fitness level to intermediate', () => {
      useSettingsStore.getState().setFitnessLevel('intermediate');

      expect(useSettingsStore.getState().preferences.fitnessLevel).toBe('intermediate');
    });

    it('should set fitness level to advanced', () => {
      useSettingsStore.getState().setFitnessLevel('advanced');

      expect(useSettingsStore.getState().preferences.fitnessLevel).toBe('advanced');
    });

    it('should set focus areas', () => {
      const areas = ['lower_back', 'shoulders', 'knees'];
      useSettingsStore.getState().setFocusAreas(areas);

      expect(useSettingsStore.getState().preferences.focusAreas).toEqual(areas);
    });

    it('should clear focus areas', () => {
      useSettingsStore.getState().setFocusAreas(['lower_back']);
      useSettingsStore.getState().setFocusAreas([]);

      expect(useSettingsStore.getState().preferences.focusAreas).toEqual([]);
    });
  });

  describe('Unit Settings', () => {
    it('should set weight unit to kg', () => {
      useSettingsStore.getState().setWeightUnit('kg');

      expect(useSettingsStore.getState().preferences.weightUnit).toBe('kg');
    });

    it('should set weight unit to lbs', () => {
      useSettingsStore.getState().setWeightUnit('lbs');

      expect(useSettingsStore.getState().preferences.weightUnit).toBe('lbs');
    });

    it('should set distance unit to km', () => {
      useSettingsStore.getState().setDistanceUnit('km');

      expect(useSettingsStore.getState().preferences.distanceUnit).toBe('km');
    });

    it('should set distance unit to miles', () => {
      useSettingsStore.getState().setDistanceUnit('miles');

      expect(useSettingsStore.getState().preferences.distanceUnit).toBe('miles');
    });
  });

  describe('Accessibility Settings', () => {
    it('should set reduced motion', () => {
      useSettingsStore.getState().setReducedMotion(true);

      expect(useSettingsStore.getState().preferences.reducedMotion).toBe(true);
    });

    it('should disable reduced motion', () => {
      useSettingsStore.getState().setReducedMotion(true);
      useSettingsStore.getState().setReducedMotion(false);

      expect(useSettingsStore.getState().preferences.reducedMotion).toBe(false);
    });

    it('should set haptic feedback', () => {
      useSettingsStore.getState().setHapticFeedback(false);

      expect(useSettingsStore.getState().preferences.hapticFeedback).toBe(false);
    });

    it('should enable haptic feedback', () => {
      useSettingsStore.getState().setHapticFeedback(false);
      useSettingsStore.getState().setHapticFeedback(true);

      expect(useSettingsStore.getState().preferences.hapticFeedback).toBe(true);
    });
  });

  describe('Activity Tracking', () => {
    it('should update last active timestamp', () => {
      const before = new Date();
      useSettingsStore.getState().updateLastActive();
      const after = new Date();

      const lastActive = useSettingsStore.getState().preferences.lastActiveAt;
      expect(lastActive).toBeInstanceOf(Date);
      expect(lastActive!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(lastActive!.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('resetPreferences', () => {
    it('should reset all preferences to defaults', () => {
      // Make various changes
      useSettingsStore.getState().setName('Test User');
      useSettingsStore.getState().setTheme('dark');
      useSettingsStore.getState().setDemoMode(true);
      useSettingsStore.getState().completeOnboarding();
      useSettingsStore.getState().setFitnessLevel('advanced');

      // Reset
      useSettingsStore.getState().resetPreferences();

      const state = useSettingsStore.getState();
      expect(state.preferences).toEqual(DEFAULT_PREFERENCES);
      expect(state.theme).toBe('system');
      expect(state.isDemoMode).toBe(false);
      expect(state.hasCompletedOnboarding).toBe(false);
    });
  });
});

describe('Selectors', () => {
  beforeEach(() => {
    useSettingsStore.getState().resetPreferences();
  });

  describe('selectEffectiveTheme', () => {
    it('should return system theme as light when system is light', () => {
      useSettingsStore.getState().setTheme('system');

      const state = useSettingsStore.getState();
      expect(selectEffectiveTheme(state, 'light')).toBe('light');
    });

    it('should return system theme as dark when system is dark', () => {
      useSettingsStore.getState().setTheme('system');

      const state = useSettingsStore.getState();
      expect(selectEffectiveTheme(state, 'dark')).toBe('dark');
    });

    it('should return light when explicitly set to light', () => {
      useSettingsStore.getState().setTheme('light');

      const state = useSettingsStore.getState();
      expect(selectEffectiveTheme(state, 'dark')).toBe('light');
    });

    it('should return dark when explicitly set to dark', () => {
      useSettingsStore.getState().setTheme('dark');

      const state = useSettingsStore.getState();
      expect(selectEffectiveTheme(state, 'light')).toBe('dark');
    });
  });

  describe('selectHealthDataEnabled', () => {
    it('should return false by default', () => {
      const state = useSettingsStore.getState();
      expect(selectHealthDataEnabled(state)).toBe(false);
    });

    it('should return true when health data is enabled', () => {
      useSettingsStore.getState().enableHealthData();

      const state = useSettingsStore.getState();
      expect(selectHealthDataEnabled(state)).toBe(true);
    });
  });

  describe('selectNotificationsEnabled', () => {
    it('should return true by default (default has workout reminders on)', () => {
      const state = useSettingsStore.getState();
      expect(selectNotificationsEnabled(state)).toBe(true);
    });

    it('should return true if any notification type is enabled', () => {
      useSettingsStore.getState().setNotificationPreference('workoutReminders', false);
      useSettingsStore.getState().setNotificationPreference('checkInReminders', false);
      // progressUpdates is still true by default

      const state = useSettingsStore.getState();
      expect(selectNotificationsEnabled(state)).toBe(true);
    });

    it('should return false if all relevant notifications disabled', () => {
      useSettingsStore.getState().setNotificationPreference('workoutReminders', false);
      useSettingsStore.getState().setNotificationPreference('checkInReminders', false);
      useSettingsStore.getState().setNotificationPreference('progressUpdates', false);

      const state = useSettingsStore.getState();
      expect(selectNotificationsEnabled(state)).toBe(false);
    });
  });

  describe('selectFormattedReminderTime', () => {
    it('should format workout reminder time correctly (AM)', () => {
      useSettingsStore.getState().setReminderTime('workout', { hour: 9, minute: 0 });

      const state = useSettingsStore.getState();
      expect(selectFormattedReminderTime(state, 'workout')).toBe('9:00 AM');
    });

    it('should format workout reminder time correctly (PM)', () => {
      useSettingsStore.getState().setReminderTime('workout', { hour: 14, minute: 30 });

      const state = useSettingsStore.getState();
      expect(selectFormattedReminderTime(state, 'workout')).toBe('2:30 PM');
    });

    it('should format check-in time correctly', () => {
      useSettingsStore.getState().setReminderTime('checkIn', { hour: 8, minute: 0 });

      const state = useSettingsStore.getState();
      expect(selectFormattedReminderTime(state, 'checkIn')).toBe('8:00 AM');
    });

    it('should handle midnight (00:00)', () => {
      useSettingsStore.getState().setReminderTime('workout', { hour: 0, minute: 0 });

      const state = useSettingsStore.getState();
      expect(selectFormattedReminderTime(state, 'workout')).toBe('12:00 AM');
    });

    it('should handle noon (12:00)', () => {
      useSettingsStore.getState().setReminderTime('workout', { hour: 12, minute: 0 });

      const state = useSettingsStore.getState();
      expect(selectFormattedReminderTime(state, 'workout')).toBe('12:00 PM');
    });

    it('should pad single digit minutes', () => {
      useSettingsStore.getState().setReminderTime('workout', { hour: 9, minute: 5 });

      const state = useSettingsStore.getState();
      expect(selectFormattedReminderTime(state, 'workout')).toBe('9:05 AM');
    });
  });
});

describe('Default Constants', () => {
  describe('DEFAULT_PREFERENCES', () => {
    it('should have empty name', () => {
      expect(DEFAULT_PREFERENCES.name).toBe('');
    });

    it('should have beginner fitness level', () => {
      expect(DEFAULT_PREFERENCES.fitnessLevel).toBe('beginner');
    });

    it('should have empty focus areas', () => {
      expect(DEFAULT_PREFERENCES.focusAreas).toEqual([]);
    });

    it('should have system theme', () => {
      expect(DEFAULT_PREFERENCES.theme).toBe('system');
    });

    it('should have haptic feedback enabled', () => {
      expect(DEFAULT_PREFERENCES.hapticFeedback).toBe(true);
    });

    it('should have reduced motion disabled', () => {
      expect(DEFAULT_PREFERENCES.reducedMotion).toBe(false);
    });

    it('should have kg as default weight unit', () => {
      expect(DEFAULT_PREFERENCES.weightUnit).toBe('kg');
    });

    it('should have km as default distance unit', () => {
      expect(DEFAULT_PREFERENCES.distanceUnit).toBe('km');
    });

    it('should have onboarding incomplete', () => {
      expect(DEFAULT_PREFERENCES.hasCompletedOnboarding).toBe(false);
    });

    it('should have demo mode off', () => {
      expect(DEFAULT_PREFERENCES.isDemoMode).toBe(false);
    });
  });

  describe('DEFAULT_NOTIFICATIONS', () => {
    it('should have workout reminders enabled', () => {
      expect(DEFAULT_NOTIFICATIONS.workoutReminders).toBe(true);
    });

    it('should have check-in reminders enabled', () => {
      expect(DEFAULT_NOTIFICATIONS.checkInReminders).toBe(true);
    });

    it('should have progress updates enabled', () => {
      expect(DEFAULT_NOTIFICATIONS.progressUpdates).toBe(true);
    });

    it('should have rest day reminders disabled', () => {
      expect(DEFAULT_NOTIFICATIONS.restDayReminders).toBe(false);
    });

    it('should have workout reminder at 9:00 AM', () => {
      expect(DEFAULT_NOTIFICATIONS.reminderTime.hour).toBe(9);
      expect(DEFAULT_NOTIFICATIONS.reminderTime.minute).toBe(0);
      expect(DEFAULT_NOTIFICATIONS.reminderTime.enabled).toBe(true);
    });

    it('should have check-in at 8:00 AM', () => {
      expect(DEFAULT_NOTIFICATIONS.checkInTime.hour).toBe(8);
      expect(DEFAULT_NOTIFICATIONS.checkInTime.minute).toBe(0);
      expect(DEFAULT_NOTIFICATIONS.checkInTime.enabled).toBe(true);
    });
  });

  describe('DEFAULT_PRIVACY', () => {
    it('should have health data disabled by default', () => {
      expect(DEFAULT_PRIVACY.healthDataEnabled).toBe(false);
    });

    it('should have analytics enabled by default', () => {
      expect(DEFAULT_PRIVACY.analyticsEnabled).toBe(true);
    });

    it('should have crash reporting enabled by default', () => {
      expect(DEFAULT_PRIVACY.crashReportingEnabled).toBe(true);
    });
  });
});

describe('Edge Cases', () => {
  beforeEach(() => {
    useSettingsStore.getState().resetPreferences();
  });

  it('should handle rapid theme changes', () => {
    const themes: ThemeMode[] = ['light', 'dark', 'system', 'dark', 'light'];

    themes.forEach((theme) => {
      useSettingsStore.getState().setTheme(theme);
    });

    expect(useSettingsStore.getState().theme).toBe('light');
  });

  it('should handle very long names', () => {
    const longName = 'A'.repeat(1000);
    useSettingsStore.getState().setName(longName);

    expect(useSettingsStore.getState().preferences.name).toBe(longName);
  });

  it('should handle special characters in name', () => {
    const specialName = "O'Brien-Smith @#$%";
    useSettingsStore.getState().setName(specialName);

    expect(useSettingsStore.getState().preferences.name).toBe(specialName);
  });

  it('should handle empty string name', () => {
    useSettingsStore.getState().setName('Test');
    useSettingsStore.getState().setName('');

    expect(useSettingsStore.getState().preferences.name).toBe('');
  });

  it('should handle many focus areas', () => {
    const manyAreas = Array.from({ length: 50 }, (_, i) => `area_${i}`);
    useSettingsStore.getState().setFocusAreas(manyAreas);

    expect(useSettingsStore.getState().preferences.focusAreas).toHaveLength(50);
  });

  it('should handle edge time values', () => {
    // Earliest time
    useSettingsStore.getState().setReminderTime('workout', { hour: 0, minute: 0 });
    expect(useSettingsStore.getState().preferences.notifications.reminderTime.hour).toBe(0);

    // Latest time
    useSettingsStore.getState().setReminderTime('workout', { hour: 23, minute: 59 });
    expect(useSettingsStore.getState().preferences.notifications.reminderTime.hour).toBe(23);
    expect(useSettingsStore.getState().preferences.notifications.reminderTime.minute).toBe(59);
  });

  it('should maintain state consistency after multiple operations', () => {
    // Perform various operations
    useSettingsStore.getState().setName('Test');
    useSettingsStore.getState().setTheme('dark');
    useSettingsStore.getState().completeOnboarding();
    useSettingsStore.getState().setDemoMode(true);
    useSettingsStore.getState().enableHealthData();
    useSettingsStore.getState().setFitnessLevel('advanced');
    useSettingsStore.getState().setWeightUnit('lbs');
    useSettingsStore.getState().setReducedMotion(true);

    const state = useSettingsStore.getState();

    // Verify all state is consistent
    expect(state.preferences.name).toBe('Test');
    expect(state.theme).toBe('dark');
    expect(state.preferences.theme).toBe('dark');
    expect(state.hasCompletedOnboarding).toBe(true);
    expect(state.preferences.hasCompletedOnboarding).toBe(true);
    expect(state.isDemoMode).toBe(true);
    expect(state.preferences.isDemoMode).toBe(true);
    expect(state.preferences.privacy.healthDataEnabled).toBe(true);
    expect(state.preferences.fitnessLevel).toBe('advanced');
    expect(state.preferences.weightUnit).toBe('lbs');
    expect(state.preferences.reducedMotion).toBe(true);
  });
});
