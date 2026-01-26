/**
 * @app/data
 *
 * Data layer package for the Body Recovery Companion App.
 *
 * Provides:
 * - Health adapters (mock, HealthKit, Health Connect)
 * - Zustand stores (workout, bodyMap, health, settings)
 * - Storage adapters (MMKV, localStorage)
 */

// ============================================
// STORES
// ============================================

// Workout store
export {
  useWorkoutStore,
  selectCurrentExercise,
  selectWorkoutProgress,
  selectIsWorkoutComplete,
} from './stores/workout';
export type {
  WorkoutSet,
  WorkoutExercise,
  ActiveWorkout,
  CompletedWorkout,
} from './stores/workout';

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
} from './stores/bodyMap';
export type {
  BodyRegion,
  SensationType,
  PainLevel,
  BodyRegionStatus,
  RegionViewStatus,
} from './stores/bodyMap';

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
} from './stores/health';
export type { ReadinessTier, SyncStatus } from './stores/health';

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
} from './stores/settings';
export type {
  ThemeMode,
  WeightUnit,
  DistanceUnit,
  ReminderTime,
  NotificationPreferences,
  PrivacyPreferences,
  UserPreferences,
} from './stores/settings';

// ============================================
// HEALTH ADAPTERS
// ============================================

// Types
export type {
  HealthAdapter,
  HealthAvailability,
  HealthPermissionStatus,
  HealthResult,
  HealthError,
  HealthErrorCode,
  HealthDataType,
  HealthWriteType,
  DateRange,
  SleepSession,
  SleepStage,
  HRVSample,
  HeartRateSample,
  StepCount,
  HealthWorkout,
  WorkoutActivityType,
  BodyMeasurement,
  MobilityMetrics,
  DailyHealthSnapshot,
  ReadinessFactors,
} from './adapters/health/types';

// Error helpers
export { HealthErrors, createHealthError } from './adapters/health/types';

// Adapters
export { MockHealthAdapter } from './adapters/health/mock';
export { HealthKitAdapter, isIOS } from './adapters/health/healthkit';
export { HealthConnectAdapter, isAndroid } from './adapters/health/healthconnect';

// Factory
export {
  createHealthAdapter,
  getHealthAdapter,
  useMockAdapter,
  useNativeAdapter,
  isMockAdapter,
  isNativeAdapter,
  getCurrentPlatform,
  setPlatform,
  resetAdapter,
} from './adapters/health';
export type { Platform, AdapterType } from './adapters/health';

// ============================================
// STORAGE
// ============================================

// Interface
export type {
  StorageAdapter,
  StorageValue,
  StorageOptions,
  StorageListener,
} from './storage/interface';
export { createNamespacedStorage } from './storage/interface';

// Adapters
export {
  MMKVStorageAdapter,
  createMMKVStorage,
  createSecureMMKVStorage,
} from './storage/mmkv';
export {
  LocalStorageAdapter,
  createLocalStorage,
  InMemoryStorageAdapter,
  createInMemoryStorage,
} from './storage/localStorage';

// Factory
export {
  createStorage,
  getDefaultStorage,
  getSecureStorage,
  resetStorageInstances,
} from './storage';
