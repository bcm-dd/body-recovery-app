# Movement & Recovery Companion - Technical Architecture Addendum

This document defines the technical architecture for a React Native mobile application with a Vercel-hosted backend.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE DEVICES                            │
│  ┌─────────────────┐                    ┌─────────────────┐     │
│  │   iOS App       │                    │   Android App   │     │
│  │  React Native   │                    │  React Native   │     │
│  │                 │                    │                 │     │
│  │  ┌───────────┐  │                    │  ┌───────────┐  │     │
│  │  │ HealthKit │  │                    │  │  Health   │  │     │
│  │  └───────────┘  │                    │  │  Connect  │  │     │
│  │  ┌───────────┐  │                    │  └───────────┘  │     │
│  │  │ WatchOS   │  │                    │  ┌───────────┐  │     │
│  │  │ Companion │  │                    │  │  WearOS   │  │     │
│  │  └───────────┘  │                    │  │ Companion │  │     │
│  └────────┬────────┘                    └───────┬───────┘  │     │
│           │                                     │                │
└───────────┼─────────────────────────────────────┼────────────────┘
            │                                     │
            └──────────────┬──────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL PLATFORM                             │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐   │
│  │  Next.js API    │  │  Edge Functions │  │  Cron Jobs     │   │
│  │  Routes         │  │  (AI Streaming) │  │  (Background)  │   │
│  └────────┬────────┘  └────────┬────────┘  └───────┬────────┘   │
│           │                    │                   │             │
│           └────────────────────┼───────────────────┘             │
│                                │                                 │
│  ┌─────────────────┐  ┌───────┴───────┐  ┌─────────────────┐    │
│  │ Vercel Postgres │  │  Vercel KV    │  │  Vercel Blob    │    │
│  │ (Primary DB)    │  │  (Sessions/   │  │  (Documents/    │    │
│  │                 │  │   Real-time)  │  │   Media)        │    │
│  └─────────────────┘  └───────────────┘  └─────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ API Calls
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐   │
│  │  Anthropic      │  │  Wearable APIs  │  │  Auth          │   │
│  │  Claude API     │  │  (Oura, Whoop,  │  │  Providers     │   │
│  │                 │  │   Garmin, etc)  │  │                │   │
│  └─────────────────┘  └─────────────────┘  └────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## React Native App

### Framework & Tooling

**React Native CLI** (not Expo)
- Full native module access required
- HealthKit/Health Connect integration
- Watch companion apps
- Custom native haptics

**TypeScript**
- Strict mode enabled
- Shared types with backend

**Key Dependencies:**
```json
{
  "react-native": "0.73+",
  "react-navigation": "^6",
  "@tanstack/react-query": "^5",
  "zustand": "^4",
  "react-native-reanimated": "^3",
  "react-native-gesture-handler": "^2",
  "react-native-mmkv": "^2",
  "@react-native-community/netinfo": "^11",
  "react-native-health": "^1",
  "react-native-health-connect": "^1",
  "react-native-haptic-feedback": "^2",
  "react-native-voice": "^3",
  "react-native-vision-camera": "^3",
  "react-native-background-fetch": "^4"
}
```

### Project Structure

```
/src
  /api
    client.ts              # API client setup
    endpoints.ts           # Typed API endpoints
    sync.ts                # Sync logic
  /components
    /ui                    # Base UI components
    /workout               # Workout-specific components
    /body                  # Body map components
    /progress              # Charts and visualisations
  /features
    /auth                  # Authentication
    /onboarding            # Onboarding flow
    /today                 # Today/dashboard
    /workout               # Workout execution
    /plan                  # Planning/scheduling
    /body                  # Body model/injuries
    /progress              # Progress tracking
    /settings              # Settings
  /hooks
    useHealth.ts           # HealthKit/Health Connect
    useHaptics.ts          # Haptic patterns
    useVoice.ts            # Voice input
    useWorkout.ts          # Workout state
    useSync.ts             # Sync status
  /lib
    storage.ts             # MMKV wrapper
    database.ts            # Local SQLite/WatermelonDB
    haptics.ts             # Haptic pattern definitions
    ai.ts                  # AI interaction helpers
  /navigation
    index.tsx              # Navigation setup
    types.ts               # Navigation types
  /store
    index.ts               # Zustand stores
    bodyModel.ts           # Body model state
    workout.ts             # Active workout state
    sync.ts                # Sync queue state
  /theme
    tokens.ts              # Design tokens
    components.ts          # Themed component styles
  /types
    index.ts               # Shared types
    api.ts                 # API response types
    health.ts              # Health data types
  /utils
    date.ts
    exercise.ts
    formatting.ts
```

### Native Modules Required

**iOS:**
- HealthKit entitlement
- Background modes (fetch, processing)
- Push notifications
- Camera usage
- Microphone usage (voice input)
- Watch connectivity (WatchKit)

**Android:**
- Health Connect permissions
- Foreground service (workout tracking)
- Camera permission
- Microphone permission
- POST_NOTIFICATIONS permission
- WearOS data layer

---

## Health Data Integration

### iOS (HealthKit)

**Data Types to Read:**
```typescript
const healthKitPermissions = {
  read: [
    'SleepAnalysis',
    'HeartRateVariabilitySDNN',
    'RestingHeartRate',
    'HeartRate',
    'StepCount',
    'DistanceWalkingRunning',
    'FlightsClimbed',
    'ActiveEnergyBurned',
    'BasalEnergyBurned',
    'BodyMass',
    'BodyFatPercentage',
    'WalkingAsymmetryPercentage',
    'WalkingSpeed',
    'WalkingStepLength',
    'AppleExerciseTime',
    'AppleStandTime',
    'MenstrualFlow', // if applicable
    'RespiratoryRate',
  ],
  write: [
    'Workout',
    'ActiveEnergyBurned',
  ]
}
```

**Sync Strategy:**
- Background fetch every 15 minutes (iOS minimum)
- Pull last 24 hours of data
- Aggregate locally, send summary to backend
- Full sync on app foreground

### Android (Health Connect)

**Data Types:**
```typescript
const healthConnectPermissions = [
  'SleepSession',
  'HeartRateVariability',
  'RestingHeartRate',
  'HeartRate',
  'Steps',
  'Distance',
  'FloorsClimbed',
  'ActiveCaloriesBurned',
  'BasalMetabolicRate',
  'Weight',
  'BodyFat',
  'ExerciseSession',
  'MenstruationPeriod',
  'RespiratoryRate',
]
```

**Sync Strategy:**
- WorkManager for background sync
- Pull on app foreground
- Same aggregation as iOS

### Health Data Flow

```
Device Health Store
       │
       ▼
┌──────────────────┐
│  React Native    │
│  Health Module   │
│                  │
│  - Fetch data    │
│  - Aggregate     │
│  - Calculate     │
│    readiness     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Local Storage   │
│  (MMKV/SQLite)   │
│                  │
│  - Raw data      │
│  - Aggregates    │
│  - Readiness     │
└────────┬─────────┘
         │
         ▼ (on sync)
┌──────────────────┐
│  Vercel Backend  │
│                  │
│  - Store history │
│  - AI analysis   │
│  - Pattern       │
│    detection     │
└──────────────────┘
```

### Readiness Calculation (On-Device)

```typescript
interface ReadinessInput {
  sleep: {
    duration: number;        // hours
    quality: number;         // 0-100
    deepSleepRatio: number;  // 0-1
  };
  hrv: {
    current: number;         // ms
    baseline: number;        // 7-day average
    trend: 'up' | 'down' | 'stable';
  };
  restingHR: {
    current: number;         // bpm
    baseline: number;
  };
  recentLoad: {
    last48Hours: number;     // training stress score
    last7Days: number;
  };
  bodyFlags: string[];       // active injury IDs
}

interface ReadinessOutput {
  score: number;             // 0-100
  factors: {
    sleep: number;           // 0-100
    recovery: number;        // 0-100
    load: number;            // 0-100
    body: number;            // 0-100
  };
  recommendation: 'full' | 'moderate' | 'light' | 'rest';
  reasoning: string;
}
```

Calculate on-device for instant display. Send to backend for AI-enhanced insights.

---

## Haptic System

### Haptic Pattern Definitions

```typescript
// iOS uses UIImpactFeedbackGenerator, UINotificationFeedbackGenerator
// Android uses VibrationEffect

type HapticPattern = {
  ios: {
    type: 'impact' | 'notification' | 'selection';
    style?: 'light' | 'medium' | 'heavy' | 'soft' | 'rigid';
    notificationType?: 'success' | 'warning' | 'error';
  };
  android: {
    pattern: number[];       // [wait, vibrate, wait, vibrate, ...]
    amplitudes?: number[];   // 0-255 for each vibration
  };
};

const hapticPatterns: Record<string, HapticPattern> = {
  // Confirmations
  tap: {
    ios: { type: 'impact', style: 'light' },
    android: { pattern: [0, 10], amplitudes: [0, 120] }
  },
  confirm: {
    ios: { type: 'notification', notificationType: 'success' },
    android: { pattern: [0, 20, 50, 20], amplitudes: [0, 180, 0, 180] }
  },
  
  // Workout
  repCounted: {
    ios: { type: 'impact', style: 'soft' },
    android: { pattern: [0, 15], amplitudes: [0, 100] }
  },
  setComplete: {
    ios: { type: 'impact', style: 'medium' },
    android: { pattern: [0, 25, 30, 25], amplitudes: [0, 150, 0, 150] }
  },
  exerciseComplete: {
    ios: { type: 'notification', notificationType: 'success' },
    android: { pattern: [0, 30, 50, 30, 50, 30], amplitudes: [0, 180, 0, 180, 0, 180] }
  },
  workoutComplete: {
    ios: { type: 'notification', notificationType: 'success' },
    android: { pattern: [0, 50, 100, 50, 100, 100], amplitudes: [0, 200, 0, 200, 0, 255] }
  },
  
  // Timer
  timerWarning: {
    ios: { type: 'impact', style: 'light' },
    android: { pattern: [0, 15], amplitudes: [0, 80] }
  },
  timerComplete: {
    ios: { type: 'impact', style: 'heavy' },
    android: { pattern: [0, 40, 30, 40], amplitudes: [0, 200, 0, 200] }
  },
  
  // Notifications
  nudge: {
    ios: { type: 'impact', style: 'soft' },
    android: { pattern: [0, 20, 80, 20], amplitudes: [0, 100, 0, 100] }
  },
  alert: {
    ios: { type: 'notification', notificationType: 'warning' },
    android: { pattern: [0, 30, 50, 30, 50, 50], amplitudes: [0, 150, 0, 150, 0, 200] }
  },
  
  // Errors
  error: {
    ios: { type: 'notification', notificationType: 'error' },
    android: { pattern: [0, 50, 100, 50], amplitudes: [0, 255, 0, 255] }
  },
  
  // Input
  dialTick: {
    ios: { type: 'selection' },
    android: { pattern: [0, 5], amplitudes: [0, 60] }
  },
};
```

### Haptic Hook

```typescript
function useHaptics() {
  const trigger = useCallback((pattern: keyof typeof hapticPatterns) => {
    const p = hapticPatterns[pattern];
    if (Platform.OS === 'ios') {
      ReactNativeHapticFeedback.trigger(p.ios.type, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    } else {
      Vibration.vibrate(p.android.pattern);
    }
  }, []);
  
  return { trigger };
}
```

---

## Voice Input System

### Implementation

```typescript
import Voice from '@react-native-voice/voice';

function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  useEffect(() => {
    Voice.onSpeechResults = (e) => {
      const text = e.value?.[0] ?? '';
      setTranscript(text);
      processCommand(text);
    };
    
    Voice.onSpeechEnd = () => {
      setIsListening(false);
    };
    
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);
  
  const startListening = async () => {
    setTranscript('');
    setIsListening(true);
    await Voice.start('en-US');
  };
  
  const stopListening = async () => {
    await Voice.stop();
    setIsListening(false);
  };
  
  return { isListening, transcript, startListening, stopListening };
}
```

### Command Processing (On-Device)

Simple commands processed locally for instant response:

```typescript
const workoutCommands: Record<string, () => void> = {
  'done': () => completeSet(),
  'complete': () => completeSet(),
  'finished': () => completeSet(),
  'next': () => nextExercise(),
  'skip': () => skipExercise(),
  'stop': () => pauseWorkout(),
  'pause': () => pauseWorkout(),
  'hard': () => logDifficulty('hard'),
  'easy': () => logDifficulty('easy'),
  'that was hard': () => logDifficulty('hard'),
  'that was easy': () => logDifficulty('easy'),
};

function processCommand(text: string) {
  const normalized = text.toLowerCase().trim();
  
  // Check for exact matches
  if (workoutCommands[normalized]) {
    workoutCommands[normalized]();
    haptics.trigger('confirm');
    return;
  }
  
  // Check for partial matches
  for (const [command, action] of Object.entries(workoutCommands)) {
    if (normalized.includes(command)) {
      action();
      haptics.trigger('confirm');
      return;
    }
  }
  
  // Weight adjustment
  const weightMatch = normalized.match(/(?:add|plus|more)\s*(\d+)/);
  if (weightMatch) {
    adjustWeight(parseInt(weightMatch[1]));
    haptics.trigger('confirm');
    return;
  }
  
  const lessMatch = normalized.match(/(?:less|minus|reduce)\s*(\d+)/);
  if (lessMatch) {
    adjustWeight(-parseInt(lessMatch[1]));
    haptics.trigger('confirm');
    return;
  }
  
  // Complex commands → send to backend AI
  sendToAI(text);
}
```

---

## Local Data Storage

### MMKV (Fast Key-Value)

For quick access data:

```typescript
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

// User preferences
storage.set('preferences', JSON.stringify(prefs));

// Health data cache
storage.set('health.latest', JSON.stringify(healthData));

// Active workout state (survives app kill)
storage.set('workout.active', JSON.stringify(workoutState));

// Sync queue
storage.set('sync.queue', JSON.stringify(pendingActions));
```

### SQLite/WatermelonDB (Relational Data)

For complex queries and relationships:

```typescript
// Schema (WatermelonDB example)
const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'workouts',
      columns: [
        { name: 'server_id', type: 'string', isOptional: true },
        { name: 'date', type: 'number', isIndexed: true },
        { name: 'status', type: 'string' },
        { name: 'duration', type: 'number', isOptional: true },
        { name: 'readiness_score', type: 'number', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'exercise_logs',
      columns: [
        { name: 'workout_id', type: 'string', isIndexed: true },
        { name: 'exercise_id', type: 'string', isIndexed: true },
        { name: 'order', type: 'number' },
        { name: 'prescribed_weight', type: 'number' },
        { name: 'prescribed_reps', type: 'number' },
        { name: 'prescribed_sets', type: 'number' },
        { name: 'completed_sets', type: 'string' }, // JSON array
        { name: 'difficulty', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'skipped', type: 'boolean' },
        { name: 'pain_logged', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'injuries',
      columns: [
        { name: 'server_id', type: 'string', isOptional: true },
        { name: 'body_region', type: 'string', isIndexed: true },
        { name: 'description', type: 'string' },
        { name: 'severity', type: 'string' },
        { name: 'status', type: 'string' }, // active, healing, resolved
        { name: 'constraints', type: 'string' }, // JSON array
        { name: 'start_date', type: 'number' },
        { name: 'resolved_date', type: 'number', isOptional: true },
        { name: 'synced', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'pain_logs',
      columns: [
        { name: 'workout_id', type: 'string', isOptional: true },
        { name: 'exercise_log_id', type: 'string', isOptional: true },
        { name: 'body_region', type: 'string', isIndexed: true },
        { name: 'severity', type: 'string' },
        { name: 'type', type: 'string' }, // sharp, dull, tightness
        { name: 'timestamp', type: 'number' },
        { name: 'synced', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'health_snapshots',
      columns: [
        { name: 'date', type: 'number', isIndexed: true },
        { name: 'sleep_duration', type: 'number', isOptional: true },
        { name: 'sleep_quality', type: 'number', isOptional: true },
        { name: 'hrv', type: 'number', isOptional: true },
        { name: 'resting_hr', type: 'number', isOptional: true },
        { name: 'steps', type: 'number', isOptional: true },
        { name: 'readiness_score', type: 'number', isOptional: true },
        { name: 'synced', type: 'boolean' },
      ],
    }),
  ],
});
```

---

## Offline-First Sync Strategy

### Sync Queue

```typescript
interface SyncAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: number;
  retries: number;
}

class SyncManager {
  private queue: SyncAction[] = [];
  
  async enqueue(action: Omit<SyncAction, 'id' | 'timestamp' | 'retries'>) {
    const syncAction: SyncAction = {
      ...action,
      id: generateId(),
      timestamp: Date.now(),
      retries: 0,
    };
    
    this.queue.push(syncAction);
    await this.persistQueue();
    this.attemptSync();
  }
  
  async attemptSync() {
    if (!await NetInfo.fetch().then(s => s.isConnected)) {
      return; // Offline, will retry later
    }
    
    const pending = [...this.queue];
    
    for (const action of pending) {
      try {
        await this.sendToServer(action);
        this.removeFromQueue(action.id);
      } catch (error) {
        action.retries++;
        if (action.retries >= 5) {
          // Move to dead letter queue, notify user
          this.handleFailedAction(action);
        }
      }
    }
  }
  
  private async sendToServer(action: SyncAction) {
    const endpoint = `/api/sync/${action.entity}`;
    const method = action.type === 'delete' ? 'DELETE' : 
                   action.type === 'create' ? 'POST' : 'PUT';
    
    await apiClient.request({
      method,
      url: endpoint,
      data: action.data,
    });
  }
}
```

### Conflict Resolution

```typescript
type ConflictStrategy = 'client-wins' | 'server-wins' | 'merge' | 'ask-user';

const conflictStrategies: Record<string, ConflictStrategy> = {
  'workouts': 'merge',           // Merge exercise logs
  'exercise_logs': 'merge',      // Merge set data
  'injuries': 'server-wins',     // Clinical data, server authoritative
  'pain_logs': 'client-wins',    // User input, client authoritative
  'preferences': 'client-wins',  // User settings, client authoritative
  'health_snapshots': 'merge',   // Combine data points
};

function mergeWorkout(client: Workout, server: Workout): Workout {
  return {
    ...server,
    // Take latest notes
    notes: client.updated_at > server.updated_at ? client.notes : server.notes,
    // Merge exercise logs by ID
    exerciseLogs: mergeArraysById(client.exerciseLogs, server.exerciseLogs),
  };
}
```

### Background Sync

```typescript
// iOS: Background Fetch
import BackgroundFetch from 'react-native-background-fetch';

BackgroundFetch.configure({
  minimumFetchInterval: 15,  // minutes (iOS minimum)
  stopOnTerminate: false,
  startOnBoot: true,
  enableHeadless: true,
}, async (taskId) => {
  // Sync health data
  await syncHealthData();
  
  // Process sync queue
  await syncManager.attemptSync();
  
  // Pre-fetch tomorrow's workout if not cached
  await prefetchTomorrowWorkout();
  
  BackgroundFetch.finish(taskId);
}, (taskId) => {
  // Timeout - clean up
  BackgroundFetch.finish(taskId);
});
```

---

## Watch Companion Apps

### WatchOS App

**Architecture:**
- Standalone WatchKit app with Watch Connectivity
- Simplified workout UI
- Direct HealthKit access on watch
- Syncs with phone app

**Features:**
- View today's workout
- Execute workout (primary interface during exercise)
- Haptic guidance
- Rest timers
- Set logging via crown/taps
- Voice input via Siri integration

**Data Flow:**
```
Watch App ←→ Watch Connectivity ←→ iPhone App ←→ Backend
                    │
                    ▼
            Watch HealthKit
```

### WearOS App

**Architecture:**
- Standalone Wear app with Data Layer API
- Similar simplified workout UI
- Health Services for workout tracking

**Features:**
- Mirror of WatchOS functionality
- Tiles for quick glance
- Complications for watch faces

---

## Vercel Backend

### API Routes Structure

```
/app
  /api
    /auth
      /[...nextauth]
        route.ts           # NextAuth handlers
    /user
      route.ts             # GET/PUT user profile
      /preferences
        route.ts           # GET/PUT preferences
    /health
      /sync
        route.ts           # POST health data from device
      /readiness
        route.ts           # GET readiness with AI insights
    /workouts
      route.ts             # GET list, POST create
      /[id]
        route.ts           # GET/PUT/DELETE workout
      /generate
        route.ts           # POST generate workout (AI)
    /exercises
      route.ts             # GET exercise library
      /[id]
        route.ts           # GET exercise detail
    /body
      /injuries
        route.ts           # GET/POST injuries
        /[id]
          route.ts         # GET/PUT/DELETE injury
      /pain-logs
        route.ts           # POST pain log
      /documents
        route.ts           # GET list, POST upload
        /[id]
          route.ts         # GET/DELETE document
        /parse
          route.ts         # POST parse document (AI)
    /ai
      /chat
        route.ts           # POST conversation (streaming)
      /insights
        route.ts           # GET AI insights
    /sync
      /[entity]
        route.ts           # POST/PUT/DELETE sync actions
```

### Database Schema (Vercel Postgres)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Body Model
CREATE TABLE body_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,  -- Full body model JSON
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Injuries
CREATE TABLE injuries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  body_region VARCHAR(50) NOT NULL,
  description TEXT,
  severity VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  constraints JSONB DEFAULT '[]',
  clinical_notes TEXT,
  start_date DATE NOT NULL,
  resolved_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_injuries_user_status ON injuries(user_id, status);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,  -- mri, physio, surgical, specialist
  filename VARCHAR(255),
  blob_url TEXT NOT NULL,
  extracted_data JSONB,
  confirmed BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Workouts
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'planned',
  planned_duration INTEGER,
  actual_duration INTEGER,
  readiness_score INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workouts_user_date ON workouts(user_id, date);

-- Exercise Logs
CREATE TABLE exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id VARCHAR(100) NOT NULL,
  order_index INTEGER NOT NULL,
  prescribed_weight DECIMAL(5,2),
  prescribed_reps INTEGER,
  prescribed_sets INTEGER,
  completed_sets JSONB DEFAULT '[]',
  difficulty VARCHAR(20),
  notes TEXT,
  skipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exercise_logs_workout ON exercise_logs(workout_id);

-- Pain Logs
CREATE TABLE pain_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
  exercise_log_id UUID REFERENCES exercise_logs(id) ON DELETE SET NULL,
  body_region VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  pain_type VARCHAR(50),
  logged_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pain_logs_user_region ON pain_logs(user_id, body_region);

-- Health Snapshots
CREATE TABLE health_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sleep_duration DECIMAL(4,2),
  sleep_quality INTEGER,
  hrv DECIMAL(5,2),
  resting_hr INTEGER,
  steps INTEGER,
  active_calories INTEGER,
  readiness_score INTEGER,
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_health_user_date ON health_snapshots(user_id, date);

-- Exercise Library (seeded, rarely changes)
CREATE TABLE exercises (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  muscles_primary JSONB NOT NULL,
  muscles_secondary JSONB DEFAULT '[]',
  equipment JSONB DEFAULT '[]',
  movement_pattern VARCHAR(50),
  joint_actions JSONB DEFAULT '[]',
  contraindications JSONB DEFAULT '[]',
  substitutes JSONB DEFAULT '[]',
  progressions JSONB DEFAULT '[]',
  video_url TEXT,
  cues TEXT,
  common_mistakes TEXT
);

-- User Preferences
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  notification_settings JSONB DEFAULT '{}',
  training_preferences JSONB DEFAULT '{}',
  equipment_by_location JSONB DEFAULT '{}',
  ui_preferences JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### AI Integration (Vercel AI SDK)

```typescript
// /app/api/ai/chat/route.ts
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages, context } = await req.json();
  
  const systemPrompt = buildSystemPrompt(context);
  
  const result = await streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: systemPrompt,
    messages,
  });
  
  return result.toAIStreamResponse();
}

function buildSystemPrompt(context: UserContext): string {
  return `You are a movement and recovery coach assistant.
  
Current user context:
- Readiness: ${context.readiness.score}/100 (${context.readiness.recommendation})
- Active injuries: ${context.injuries.map(i => i.description).join(', ') || 'None'}
- Current workout: ${context.currentWorkout?.status || 'Not in workout'}
- Recent training: ${context.recentLoad.description}

Body model constraints:
${context.bodyModel.constraints.map(c => `- ${c}`).join('\n')}

Respond concisely. Lead with actions. Match the user's energy.
Never lecture. Offer options rather than demanding decisions.`;
}
```

### Document Parsing

```typescript
// /app/api/body/documents/parse/route.ts
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';

const DocumentExtraction = z.object({
  documentType: z.enum(['mri', 'physio', 'surgical', 'specialist']),
  bodyRegions: z.array(z.string()),
  findings: z.array(z.object({
    description: z.string(),
    severity: z.enum(['mild', 'moderate', 'severe']).optional(),
    confidence: z.number(),
  })),
  constraints: z.array(z.object({
    description: z.string(),
    duration: z.string().optional(),
    movements: z.array(z.string()),
  })),
  exercises: z.array(z.object({
    name: z.string(),
    sets: z.number().optional(),
    reps: z.number().optional(),
    frequency: z.string().optional(),
    notes: z.string().optional(),
  })).optional(),
  timeline: z.object({
    startDate: z.string().optional(),
    reviewDate: z.string().optional(),
    expectedDuration: z.string().optional(),
  }).optional(),
  rawText: z.string(),
});

export async function POST(req: Request) {
  const { imageBase64, mimeType } = await req.json();
  
  const result = await generateObject({
    model: anthropic('claude-sonnet-4-20250514'),
    schema: DocumentExtraction,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            image: imageBase64,
            mimeType,
          },
          {
            type: 'text',
            text: `Extract all relevant medical/clinical information from this document.
            Identify body regions, findings, movement constraints, prescribed exercises, and timelines.
            Be thorough but express uncertainty where the document is unclear.`,
          },
        ],
      },
    ],
  });
  
  return Response.json(result.object);
}
```

### Workout Generation

```typescript
// /app/api/workouts/generate/route.ts
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';

export async function POST(req: Request) {
  const { userId, date, preferences } = await req.json();
  
  // Gather context
  const [bodyModel, recentWorkouts, healthData, injuries] = await Promise.all([
    getBodyModel(userId),
    getRecentWorkouts(userId, 14),
    getRecentHealth(userId, 7),
    getActiveInjuries(userId),
  ]);
  
  const readiness = calculateReadiness(healthData);
  const constraints = extractConstraints(bodyModel, injuries);
  const muscleRecovery = calculateMuscleRecovery(recentWorkouts);
  
  const result = await generateObject({
    model: anthropic('claude-sonnet-4-20250514'),
    schema: WorkoutPlanSchema,
    messages: [
      {
        role: 'user',
        content: buildWorkoutPrompt({
          preferences,
          readiness,
          constraints,
          muscleRecovery,
          recentWorkouts,
        }),
      },
    ],
  });
  
  // Validate exercises exist and respect constraints
  const validated = validateAndAdjust(result.object, constraints);
  
  return Response.json(validated);
}
```

### Cron Jobs

```typescript
// /app/api/cron/daily-readiness/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  // Verify cron secret
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get all users who need readiness calculation
  const users = await getUsersForReadinessCalc();
  
  for (const user of users) {
    await calculateAndStoreReadiness(user.id);
    await generateDailyInsights(user.id);
    await sendMorningNotificationIfEnabled(user.id);
  }
  
  return NextResponse.json({ processed: users.length });
}

// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/daily-readiness",
      "schedule": "0 5 * * *"  // 5am UTC, adjust per user timezone
    },
    {
      "path": "/api/cron/health-sync",
      "schedule": "*/15 * * * *"  // Every 15 minutes
    },
    {
      "path": "/api/cron/weekly-summary",
      "schedule": "0 9 * * 0"  // Sunday 9am UTC
    }
  ]
}
```

---

## API Contract

### Authentication

All authenticated endpoints require:
```
Authorization: Bearer <jwt_token>
```

Token obtained via `/api/auth/session` (NextAuth).

### Common Response Format

```typescript
// Success
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-18T10:30:00Z"
  }
}

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { ... }
  }
}
```

### Key Endpoints

**POST /api/health/sync**
```typescript
// Request
{
  snapshots: [{
    date: "2025-01-18",
    sleep_duration: 7.5,
    sleep_quality: 85,
    hrv: 45,
    resting_hr: 58,
    steps: 8500,
  }]
}

// Response
{
  data: {
    synced: 1,
    readiness: {
      score: 78,
      factors: { ... },
      recommendation: "moderate"
    }
  }
}
```

**POST /api/workouts/generate**
```typescript
// Request
{
  date: "2025-01-18",
  preferences: {
    duration: 45,
    focus: "back",
    equipment: ["barbell", "cable", "dumbbell"]
  }
}

// Response
{
  data: {
    id: "workout_123",
    date: "2025-01-18",
    exercises: [{
      exercise_id: "bent_over_row",
      order: 1,
      prescribed_weight: 50,
      prescribed_reps: 8,
      prescribed_sets: 4,
      notes: "Keep back flat, pull to lower chest"
    }, ...]
  }
}
```

**POST /api/ai/chat**
```typescript
// Request
{
  messages: [
    { role: "user", content: "My shoulder feels off today" }
  ],
  context: {
    currentWorkout: "workout_123",
    currentExercise: "overhead_press"
  }
}

// Response (streaming)
data: {"type":"text","text":"Got it."}
data: {"type":"text","text":" I'm swapping overhead press"}
data: {"type":"text","text":" for landmine press"}
data: {"type":"action","action":"swap_exercise","params":{"from":"overhead_press","to":"landmine_press"}}
data: [DONE]
```

---

## Push Notifications

### Setup

**iOS:** APNs via Firebase Cloud Messaging or direct APNs
**Android:** Firebase Cloud Messaging

### Notification Types

```typescript
type NotificationType = 
  | 'workout_reminder'
  | 'rehab_reminder'
  | 'morning_checkin'
  | 'movement_nudge'
  | 'rest_suggestion'
  | 'milestone'
  | 'weekly_summary'
  | 'ai_insight';

interface PushNotification {
  type: NotificationType;
  title: string;
  body: string;
  data: {
    deepLink?: string;
    actionId?: string;
  };
  ios?: {
    sound: string;
    badge: number;
    categoryId: string;  // For action buttons
  };
  android?: {
    channelId: string;
    priority: 'high' | 'default' | 'low';
    actions?: Array<{ id: string; title: string }>;
  };
}
```

### Backend Trigger

```typescript
// /lib/notifications.ts
import admin from 'firebase-admin';

async function sendPushNotification(
  userId: string, 
  notification: PushNotification
) {
  const tokens = await getUserDeviceTokens(userId);
  
  if (tokens.length === 0) return;
  
  const message: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: notification.data,
    apns: {
      payload: {
        aps: {
          sound: notification.ios?.sound ?? 'default',
          badge: notification.ios?.badge,
          'category': notification.ios?.categoryId,
        },
      },
    },
    android: {
      priority: notification.android?.priority ?? 'default',
      notification: {
        channelId: notification.android?.channelId ?? 'default',
      },
    },
  };
  
  await admin.messaging().sendEachForMulticast(message);
}
```

---

## Security

### Data Encryption

- All data encrypted at rest (Vercel Postgres default)
- TLS for all API communication
- Health data additionally encrypted in database (application-level)

### API Security

- Rate limiting via Vercel KV
- Input validation with Zod on all endpoints
- CORS restricted to mobile app origins
- Request signing for sensitive operations

### Health Data Privacy

- Minimal data sent to backend (aggregates, not raw readings)
- User can delete all health data
- Clear consent flow for health permissions
- No sharing with third parties

---

## Performance Targets

### App Performance

| Metric | Target |
|--------|--------|
| Cold start | < 2s |
| Screen transition | < 300ms |
| Workout action response | < 100ms |
| Voice command response | < 500ms |
| Offline workout execution | Fully functional |

### API Performance

| Endpoint | Target |
|----------|--------|
| Health sync | < 500ms |
| Workout generate | < 3s |
| Exercise library | < 200ms (cached) |
| AI chat (first token) | < 1s |
| Document parse | < 10s |

### Battery Considerations

- Background health sync: Batched, every 15 min max
- Location: Only when detecting gym, not continuous
- Watch sync: On-demand, not continuous
- Animations: 60fps but respect low power mode

---

## Testing Strategy

### Mobile App

**Unit Tests (Jest):**
- Utility functions
- State management logic
- Readiness calculation
- Command parsing

**Component Tests (React Native Testing Library):**
- UI components render correctly
- User interactions work
- Accessibility properties set

**Integration Tests (Detox):**
- Full user flows
- Health data mocking
- Offline scenarios
- Deep linking

### Backend

**Unit Tests (Vitest):**
- API route handlers
- Database queries
- AI prompt building

**Integration Tests:**
- Full API flows
- Database operations
- External service mocks

### E2E

**Critical Paths:**
1. Onboarding → Health permission → First workout
2. Log injury → See modified workout
3. Upload document → Constraints applied
4. Offline workout → Sync when online
5. Watch workout execution → Phone sync

---

## Release Strategy

### App Store

**iOS:**
- TestFlight for beta testing
- Phased rollout (10% → 25% → 50% → 100%)
- Crash monitoring via Sentry
- App Store Connect analytics

**Android:**
- Internal testing track
- Closed beta → Open beta → Production
- Staged rollout
- Firebase Crashlytics

### Backend

**Vercel:**
- Preview deployments for PRs
- Staging environment on main branch
- Production promotion (manual or auto)
- Feature flags for gradual rollout

### Versioning

- Semantic versioning for app (1.0.0, 1.1.0, etc.)
- API versioning via URL prefix (/api/v1/)
- Database migrations tracked and reversible

---

*End of Technical Architecture addendum. This document should be read alongside the main handoff and UX addendum.*
