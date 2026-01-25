# @app/data

Data layer for the Body Recovery Companion App. Provides state management, health data adapters, and storage abstractions.

## Purpose

This package handles all data concerns for the application:

- **Stores**: Zustand-based state management for workouts, body map, health, and settings
- **Health Adapters**: Unified abstraction over HealthKit (iOS) and Health Connect (Android)
- **Storage**: Cross-platform storage with MMKV for native and localStorage for web

## Installation

This package is part of the monorepo and is installed automatically. To use it in another package:

```json
{
  "dependencies": {
    "@app/data": "workspace:*"
  }
}
```

## Usage

### State Management with Stores

```typescript
import {
  useWorkoutStore,
  useBodyMapStore,
  useHealthStore,
  useSettingsStore,
} from '@app/data';

// Access workout state
function WorkoutComponent() {
  const { currentWorkout, startWorkout, completeExercise } = useWorkoutStore();

  return (
    <View>
      {currentWorkout && (
        <Text>Current exercise: {currentWorkout.exercises[0]?.name}</Text>
      )}
    </View>
  );
}

// Access body map with selectors
import { selectActiveIssueCount, selectHasSevereIssues } from '@app/data';

function BodyStatusBadge() {
  const issueCount = useBodyMapStore(selectActiveIssueCount);
  const hasSevere = useBodyMapStore(selectHasSevereIssues);

  return <Badge count={issueCount} color={hasSevere ? 'red' : 'yellow'} />;
}

// Access settings
function SettingsScreen() {
  const { preferences, updatePreferences } = useSettingsStore();

  return (
    <Toggle
      value={preferences.theme === 'dark'}
      onValueChange={(dark) => updatePreferences({ theme: dark ? 'dark' : 'light' })}
    />
  );
}
```

### Health Data Integration

```typescript
import {
  createHealthAdapter,
  getHealthAdapter,
  type HealthAdapter,
  type DailyHealthSnapshot,
} from '@app/data';

// Get platform-appropriate adapter
const adapter = getHealthAdapter();

// Check availability
const availability = await adapter.isAvailable();

// Request permissions
if (availability === 'not_determined') {
  await adapter.requestPermissions(
    ['sleep', 'hrv', 'steps', 'heartRate'],
    ['workout']
  );
}

// Sync health data
const result = await adapter.syncHealthData(7); // Last 7 days
if (result.success) {
  const snapshots: DailyHealthSnapshot[] = result.data;
  console.log('Today readiness:', snapshots[0]?.readinessScore);
}

// Subscribe to updates
const unsubscribe = adapter.subscribeToUpdates((snapshot) => {
  console.log('New health data:', snapshot);
});
```

### Storage

```typescript
import {
  createStorage,
  getDefaultStorage,
  getSecureStorage,
  type StorageAdapter,
} from '@app/data';

// Get default storage (MMKV on native, localStorage on web)
const storage = getDefaultStorage();

// Store and retrieve data
await storage.set('user_preferences', { theme: 'dark' });
const prefs = await storage.get('user_preferences');

// Use secure storage for sensitive data
const secureStorage = getSecureStorage();
await secureStorage.set('auth_token', 'secret-token');
```

## API Reference

### Stores

| Store | Description |
|-------|-------------|
| `useWorkoutStore` | Active workout state and exercise tracking |
| `useBodyMapStore` | Body status, pain/sensation tracking |
| `useHealthStore` | Health data and readiness scores |
| `useSettingsStore` | User preferences and app settings |

### Store Selectors

```typescript
// Workout selectors
selectCurrentExercise(state)
selectWorkoutProgress(state)
selectIsWorkoutComplete(state)

// Body map selectors
selectActiveIssueCount(state)
selectHasSevereIssues(state)
selectMostSevereIssue(state)

// Health selectors
selectHasHealthData(state)
selectFormattedReadiness(state)
selectSleepSummary(state)

// Settings selectors
selectEffectiveTheme(state)
selectHealthDataEnabled(state)
```

### Health Adapter Types

| Type | Description |
|------|-------------|
| `HealthAdapter` | Core interface for health data access |
| `DailyHealthSnapshot` | Aggregated daily health metrics |
| `SleepSession` | Sleep data with optional stages |
| `HRVSample` | Heart rate variability sample |
| `HealthWorkout` | Workout from health store |

### Health Adapter Factory

```typescript
// Factory functions
createHealthAdapter(platform: Platform): HealthAdapter
getHealthAdapter(): HealthAdapter

// Control functions
useMockAdapter(): void    // Switch to mock for testing
useNativeAdapter(): void  // Switch to native adapters
isMockAdapter(): boolean
```

### Storage Types

| Type | Description |
|------|-------------|
| `StorageAdapter` | Core storage interface |
| `StorageValue` | JSON-serializable value |
| `StorageOptions` | Options for storage operations |

## Package Structure

```
src/
  index.ts              # Main entry point
  stores/
    index.ts            # Store re-exports
    workout.ts          # Workout state management
    bodyMap.ts          # Body status tracking
    health.ts           # Health data state
    settings.ts         # User preferences
  adapters/
    index.ts            # Adapter factory
    health/
      index.ts          # Health adapter factory
      types.ts          # Health data types
      mock.ts           # Mock adapter for testing
      healthkit.ts      # iOS HealthKit adapter
      healthconnect.ts  # Android Health Connect adapter
  storage/
    index.ts            # Storage factory
    interface.ts        # Storage interface
    mmkv.ts             # MMKV adapter (native)
    localStorage.ts     # localStorage adapter (web)
```

## Testing

```bash
# Run tests
pnpm test

# Run with watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage
```

The package includes comprehensive tests for all stores and adapters. Mock adapters are provided for testing health data integration without native dependencies.
