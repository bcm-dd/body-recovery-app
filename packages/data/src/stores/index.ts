/**
 * Stores Module
 *
 * Zustand stores for application state management.
 */

// Workout store
export {
  useWorkoutStore,
  selectCurrentExercise,
  selectWorkoutProgress,
  selectIsWorkoutComplete,
} from './workout';
export type {
  WorkoutSet,
  WorkoutExercise,
  ActiveWorkout,
  CompletedWorkout,
} from './workout';

// Body map store
export {
  useBodyMapStore,
  BODY_REGIONS,
  REGION_DISPLAY_NAMES,
  getViewStatus,
  isActiveIssue,
  selectActiveIssueCount,
  selectHasSevereIssues,
  selectMostSevereIssue,
} from './bodyMap';
export type {
  BodyRegion,
  SensationType,
  PainLevel,
  BodyRegionStatus,
  RegionViewStatus,
} from './bodyMap';

// Health store
export {
  useHealthStore,
  getReadinessTier,
  getReadinessTierInfo,
  selectHasHealthData,
  selectFormattedReadiness,
  selectSleepSummary,
  selectActivitySummary,
  selectIsSyncing,
} from './health';
export type { ReadinessTier, SyncStatus } from './health';

// Settings store
export {
  useSettingsStore,
  selectEffectiveTheme,
  selectHealthDataEnabled,
  selectNotificationsEnabled,
  selectFormattedReminderTime,
  DEFAULT_PREFERENCES,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_PRIVACY,
} from './settings';
export type {
  ThemeMode,
  WeightUnit,
  DistanceUnit,
  ReminderTime,
  NotificationPreferences,
  PrivacyPreferences,
  UserPreferences,
} from './settings';
