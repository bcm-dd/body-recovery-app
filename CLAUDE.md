# CLAUDE.md - Movement & Recovery Companion

Project-specific instructions for AI development assistants. This file serves as the source of truth for coding conventions, architecture decisions, and development workflows.

---

## Quick Reference

```
Mobile App:     React Native CLI + TypeScript
Backend:        Next.js 14 App Router + Vercel
Database:       Vercel Postgres + Drizzle ORM
State:          Zustand (mobile), React hooks (web)
Styling:        React Native StyleSheet + theme tokens
AI:             Claude API via Vercel AI SDK
```

---

## Project Overview

An AI-driven movement and recovery coaching app that combines workout programming with injury awareness. The app adapts workouts based on body state, active injuries, and health data from wearables.

**Core Value:** Train smarter with an AI coach that knows your body.

### Three Intelligence Models

1. **Body Model** - Injuries, surgeries, chronic conditions, constraints
2. **Behavioural Model** - Training patterns, resistance triggers, compliance
3. **Readiness Model** - Sleep, HRV, training load, body status

---

## Architecture

### Mobile App (`/src`)

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base: Button, Card, Input, Text
│   ├── body/            # Body map visualization
│   ├── readiness/       # Readiness ring
│   └── workout/         # Exercise cards, timers
├── features/            # Screen-level features
│   ├── today/           # Dashboard
│   ├── workout/         # Workout execution
│   ├── body/            # Body tracking
│   ├── profile/         # Settings
│   └── ...
├── hooks/               # Custom React hooks
├── navigation/          # React Navigation config
├── store/               # Zustand stores
├── theme/               # Design tokens + theming
├── types/               # TypeScript definitions
└── config/              # API + environment config
```

### Backend (`/backend`)

```
backend/
├── app/
│   ├── api/             # API routes
│   │   ├── ai/chat/     # Streaming AI conversation
│   │   ├── auth/        # NextAuth.js endpoints
│   │   ├── health/sync/ # Health data ingestion
│   │   ├── injuries/    # CRUD for injuries
│   │   ├── workouts/    # Workout generation + CRUD
│   │   └── ...
│   └── (pages)/         # Web app pages (if any)
├── db/
│   └── schema.ts        # Drizzle ORM schema
└── lib/                 # Shared utilities
```

---

## Data Flow

### Health Data Sync Flow

Health data flows from device sensors through native APIs to the backend and mobile store.

```
+------------------+     +------------------+     +------------------+
|   iOS Device     |     |  Android Device  |     |                  |
|  +------------+  |     |  +------------+  |     |                  |
|  | HealthKit  |  |     |  | Health     |  |     |                  |
|  | (native)   |  |     |  | Connect    |  |     |                  |
|  +-----+------+  |     |  +-----+------+  |     |                  |
|        |         |     |        |         |     |                  |
+--------|---------|     +--------|---------|     |                  |
         v                        v               |                  |
+------------------+     +------------------+     |                  |
| react-native-    |     | react-native-    |     |                  |
| health           |     | health-connect   |     |                  |
+--------+---------+     +--------+---------+     |                  |
         |                        |               |                  |
         +------------+-----------+               |                  |
                      |                           |                  |
                      v                           |                  |
              +-------+--------+                  |                  |
              |  useHealth()   |                  |                  |
              |  Hook          |                  |                  |
              | - fetchToday   |                  |                  |
              | - fetchWeek    |                  |                  |
              +-------+--------+                  |                  |
                      |                           |                  |
                      | POST /api/health/sync    |                  |
                      v                           v                  |
              +-------+---------------------------+---------+        |
              |              Backend API                    |        |
              |  +----------------------------------------+ |        |
              |  | 1. Validate with Zod                   | |        |
              |  | 2. Store in Postgres (historical)      | |        |
              |  | 3. Store in Vercel KV (fast access)    | |        |
              |  | 4. Calculate readiness score           | |        |
              |  | 5. Return readiness to client          | |        |
              |  +----------------------------------------+ |        |
              +--------------------+------------------------+        |
                                   |                                 |
                                   | { readiness, synced }           |
                                   v                                 |
              +--------------------+------------------------+        |
              |           useReadinessStore                 |        |
              |  - latestHealthSnapshot                     |        |
              |  - healthHistory[] (30 days)                |        |
              |  - baselines (7-day rolling avg)            |        |
              |  - currentReadiness                         |        |
              +---------------------------------------------+        |
```

**Key files:**
- `/src/hooks/useHealth.ts` - Cross-platform health data fetching
- `/backend/app/api/health/sync/route.ts` - Sync endpoint
- `/backend/lib/store.ts` - KV/Postgres storage layer
- `/src/store/readiness.ts` - Mobile readiness state

---

### Workout Execution Flow

Workouts flow from AI generation through execution and back to the server.

```
+-------------------+
|   User Request    |
| "Generate workout"|
+--------+----------+
         |
         v
+--------+----------+     +------------------+
| POST /api/        |---->| Context Gathered |
| workouts/generate |     | - injuries[]     |
+--------+----------+     | - readinessScore |
         |                | - equipment[]    |
         v                | - preferences    |
+--------+----------+     +------------------+
| Claude AI         |
| (claude-sonnet)   |
| - Respects        |
|   constraints     |
| - Adjusts volume  |
|   for readiness   |
+--------+----------+
         |
         | GeneratedWorkout
         v
+--------+----------+
| useWorkoutStore   |
| startWorkout()    |
+--------+----------+
         |
         v
+--------+----------+     +------------------+
| Workout Execution |     | Per-Set Actions: |
| Screen            |<--->| - completeSet()  |
| (offline-capable) |     | - skipExercise() |
+--------+----------+     | - swapExercise() |
         |                | - logPain()      |
         |                +------------------+
         v
+--------+----------+
| completeWorkout() |
| - Calc duration   |
| - Add to history  |
| - Mark synced=    |
|   false           |
+--------+----------+
         |
         | (when online)
         v
+--------+----------+
| POST /api/        |
| workouts/[id]     |
| - Save session    |
| - Update stats    |
| - Sync pain logs  |
+-------------------+
```

**State during execution (useWorkoutStore):**
```typescript
{
  activeWorkout: WorkoutSession | null,
  currentExerciseIndex: number,
  currentSetIndex: number,
  restTimerSeconds: number,
  recentWorkouts: WorkoutSession[]  // Local history (last 20)
}
```

---

### Offline Sync Queue Pattern

The app is offline-first. Changes queue locally and sync when connectivity returns.

```
+--------------------------------------------------+
|                    Mobile App                     |
|  +--------------------------------------------+  |
|  |              Zustand Stores                |  |
|  |  +----------------+  +------------------+  |  |
|  |  | bodyModelStore |  | workoutStore     |  |  |
|  |  | injuries[]     |  | recentWorkouts[] |  |  |
|  |  | painLogs[]     |  | activeWorkout    |  |  |
|  |  | synced: bool   |  | synced: bool     |  |  |
|  |  +-------+--------+  +--------+---------+  |  |
|  |          |                    |            |  |
|  |          +--------+  +--------+            |  |
|  |                   |  |                     |  |
|  |                   v  v                     |  |
|  |          +--------+--+--------+            |  |
|  |          |   Sync Queue       |            |  |
|  |          |  (SyncAction[])    |            |  |
|  |          +--------+-----------+            |  |
|  +-------------------|------------------------+  |
|                      |                           |
+----------------------|---------------------------+
                       |
          +------------+------------+
          |                         |
    +-----v-----+            +------v------+
    |  Offline  |            |   Online    |
    |  (queue)  |            |   (flush)   |
    +-----------+            +------+------+
                                    |
                                    v
                    +---------------+--------------+
                    |         Backend API          |
                    |  - Process each SyncAction   |
                    |  - Handle conflicts          |
                    |  - Return sync status        |
                    +------------------------------+
```

**SyncAction structure (from types):**
```typescript
interface SyncAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;           // 'injury', 'workout', 'painLog'
  data: unknown;
  timestamp: number;
  retries: number;
}

type ConflictStrategy = 'client_wins' | 'server_wins' | 'merge' | 'ask_user';
```

**Sync triggers:**
- App foreground (AppState change)
- Network connectivity restored
- Manual pull-to-refresh
- After workout completion

---

### AI Chat Context Flow

The AI assistant receives real-time context about injuries and readiness for informed responses.

```
+------------------------------------------------------------------+
|                         Mobile Client                             |
|  +------------------+  +------------------+  +------------------+ |
|  | useBodyModelStore|  | useWorkoutStore  |  | useReadinessStore| |
|  | - injuries[]     |  | - activeWorkout  |  | - currentReadiness|
|  | - constraints[]  |  | - currentExercise|  | - score: 72      | |
|  +--------+---------+  +--------+---------+  +--------+---------+ |
|           |                     |                     |           |
|           +----------+----------+----------+----------+           |
|                      |                                            |
|                      v                                            |
|           +----------+----------+                                 |
|           |   Build Context     |                                 |
|           +----------+----------+                                 |
|                      |                                            |
+----------------------|--------------------------------------------+
                       |
                       v
        +--------------+---------------+
        |      Chat Request            |
        |  {                           |
        |    messages: [...],          |
        |    context: {                |
        |      currentWorkout: "Upper  |
        |        Body Push/Pull",      |
        |      currentExercise:        |
        |        "Bench Press",        |
        |      readinessScore: 72,     |
        |      activeInjuries: [       |
        |        "left_shoulder -      |
        |         rotator cuff"        |
        |      ]                       |
        |    }                         |
        |  }                           |
        +--------------+---------------+
                       |
                       | POST /api/ai/chat
                       v
        +--------------+---------------+
        |       Backend Chat API       |
        |  +------------------------+  |
        |  | buildSystemPrompt()    |  |
        |  |                        |  |
        |  | "You are a movement    |  |
        |  |  coach. Current        |  |
        |  |  context:              |  |
        |  |  - Workout: Upper...   |  |
        |  |  - Exercise: Bench...  |  |
        |  |  - Readiness: 72/100   |  |
        |  |  - Injuries: left      |  |
        |  |    shoulder..."        |  |
        |  +------------------------+  |
        |              |               |
        |              v               |
        |  +------------------------+  |
        |  | Claude API             |  |
        |  | (streaming response)   |  |
        |  +------------------------+  |
        +--------------+---------------+
                       |
                       | SSE stream
                       v
        +--------------+---------------+
        |    User sees contextual      |
        |    response:                 |
        |                              |
        |    "That hurt my shoulder"   |
        |    -> "Noted. Want to try    |
        |        cable flies instead,  |
        |        or move on?"          |
        +--------------+---------------+
```

**Context-aware behaviors:**
- Suggests alternatives respecting injury constraints
- Adjusts intensity recommendations based on readiness
- Tracks workout progress for relevant suggestions
- Never pushes through pain signals

**Key file:** `/backend/app/api/ai/chat/route.ts`

---

## Coding Conventions

### TypeScript

- **Strict mode** enabled - no `any` types without justification
- Use **explicit return types** on functions
- Prefer **interfaces** over types for object shapes
- Use **barrel exports** (`index.ts`) for clean imports

```typescript
// Good
export interface ButtonProps {
  title: string;
  variant?: ButtonVariant;
  onPress: () => void;
}

// Avoid
export type ButtonProps = {
  title: any;
  variant?: string;
}
```

### React Native Components

- Use **function components** with explicit typing
- Extract **variants/sizes** to named types
- Include **accessibility props** (role, label, hint)
- Add **JSDoc comments** for public components

```typescript
/**
 * Button Component
 *
 * Primary interactive component with haptic feedback.
 */
export function Button({
  title,
  variant = 'primary',
  ...props
}: ButtonProps): React.ReactElement {
  // ...
}
```

### File Structure Pattern

```typescript
/**
 * ComponentName - Movement & Recovery Companion
 *
 * Brief description of what this component does.
 */

import ... // External imports first
import ... // Internal imports second

// ============================================================================
// Types
// ============================================================================

export interface ComponentProps { }

// ============================================================================
// Component
// ============================================================================

export function ComponentName() { }

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({ });
```

### State Management

**Mobile (Zustand):**
```typescript
// src/store/workout.ts
export const useWorkoutStore = create<WorkoutState>()((set, get) => ({
  session: null,
  setSession: (session) => set({ session }),
  // Actions as methods, not separate functions
}));
```

**Backend (Server state):**
- Use TanStack Query for server state in mobile app
- API routes return typed responses with Zod validation

### Theme System

Always use theme tokens, never hardcode colors/spacing:

```typescript
const { theme } = useTheme();

// Good
backgroundColor: theme.colors.surface
padding: theme.spacing.md

// Avoid
backgroundColor: '#1a1a1a'
padding: 16
```

### Path Aliases

Use `@/` prefix for imports (configured in tsconfig):

```typescript
import { Button } from '@/components/ui';
import { useTheme } from '@/theme';
import { useHaptics } from '@/hooks/useHaptics';
```

---

## Database

### Schema Location
`/backend/db/schema.ts`

### Key Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts |
| `user_preferences` | Settings, equipment, notifications |
| `body_models` | Full body model JSON |
| `injuries` | Injury records with constraints |
| `workouts` | Workout sessions |
| `exercise_logs` | Per-exercise logging |
| `pain_logs` | Pain/discomfort records |
| `health_snapshots` | Daily health data |
| `exercises` | Exercise library (reference) |

### Migrations

```bash
cd backend
npm run db:generate  # Generate migration
npm run db:push      # Push to database
npm run db:studio    # Open Drizzle Studio
```

---

## API Conventions

### Route Pattern

```typescript
// backend/app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({ /* ... */ });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const validated = RequestSchema.parse(body);
  // ...
  return NextResponse.json({ data }, { status: 201 });
}
```

### Error Responses

```typescript
return NextResponse.json(
  { error: 'Not found', code: 'RESOURCE_NOT_FOUND' },
  { status: 404 }
);
```

### AI Endpoints

Use Vercel AI SDK for streaming:

```typescript
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const result = await streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    messages,
    system: `...context about injuries, readiness...`,
  });

  return result.toDataStreamResponse();
}
```

---

## Testing Strategy

### Coverage Targets

| Layer | Target | Rationale |
|-------|--------|-----------|
| **Unit Tests** | 80%+ | Core business logic, stores, utilities |
| **Integration Tests** | 60%+ | API routes, database queries, service interactions |
| **E2E Tests** | Critical paths | User journeys that must never break |

**Priority order:** Test the readiness algorithm, workout store logic, and body model calculations first - these are the core value propositions.

---

### Test Setup

#### Mobile App Dependencies

Add to `package.json` devDependencies:

```json
{
  "@testing-library/react-native": "^12.5.0",
  "@testing-library/jest-native": "^5.4.3",
  "react-test-renderer": "^18.2.0"
}
```

Create `jest.config.js`:

```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', './jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-reanimated|react-native-gesture-handler|react-native-svg|react-native-mmkv|zustand)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
};
```

Create `jest.setup.js`:

```javascript
// Mock react-native-reanimated
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);

// Mock haptic feedback
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

// Mock MMKV storage
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Silence console warnings in tests
global.console.warn = jest.fn();
```

#### Backend Dependencies

Add to `backend/package.json` devDependencies:

```json
{
  "vitest": "^1.6.0",
  "@testing-library/react": "^15.0.0",
  "msw": "^2.3.0"
}
```

---

### Unit Testing Patterns

#### Testing Zustand Stores

```typescript
// src/store/readiness.test.ts
import { useReadinessStore } from './readiness';
import type { HealthSnapshot } from '@/types';

describe('readinessStore', () => {
  beforeEach(() => {
    useReadinessStore.getState().reset();
  });

  describe('calculateReadiness', () => {
    it('returns full recommendation when all factors are optimal', () => {
      const store = useReadinessStore.getState();

      // Set up optimal health snapshot
      const snapshot: HealthSnapshot = {
        id: 'test-1',
        date: new Date(),
        sleepDuration: 8,
        sleepQuality: 90,
        hrv: 65,
        restingHR: 55,
        synced: false,
      };

      store.updateHealthSnapshot(snapshot);
      store.addHealthHistory(snapshot);
      store.calculateReadiness(0); // no active injuries

      const readiness = store.currentReadiness;
      expect(readiness?.recommendation).toBe('full');
      expect(readiness?.score).toBeGreaterThanOrEqual(75);
    });

    it('recommends rest when multiple factors are poor', () => {
      const store = useReadinessStore.getState();

      const poorSnapshot: HealthSnapshot = {
        id: 'test-2',
        date: new Date(),
        sleepDuration: 4,
        sleepQuality: 30,
        hrv: 25,
        restingHR: 80,
        synced: false,
      };

      store.updateHealthSnapshot(poorSnapshot);
      store.calculateReadiness(2); // 2 active injuries

      expect(store.currentReadiness?.recommendation).toBe('rest');
    });

    it('adjusts for active injuries', () => {
      const store = useReadinessStore.getState();

      const goodSnapshot: HealthSnapshot = {
        id: 'test-3',
        date: new Date(),
        sleepDuration: 7.5,
        sleepQuality: 85,
        hrv: 60,
        restingHR: 58,
        synced: false,
      };

      store.updateHealthSnapshot(goodSnapshot);
      store.calculateReadiness(0);
      const scoreWithNoInjuries = store.currentReadiness?.score ?? 0;

      store.calculateReadiness(3); // 3 injuries
      const scoreWithInjuries = store.currentReadiness?.score ?? 0;

      expect(scoreWithInjuries).toBeLessThan(scoreWithNoInjuries);
    });
  });

  describe('baselines', () => {
    it('calculates 7-day rolling averages', () => {
      const store = useReadinessStore.getState();

      // Add 7 days of health data
      for (let i = 0; i < 7; i++) {
        store.addHealthHistory({
          id: `day-${i}`,
          date: new Date(Date.now() - i * 86400000),
          hrv: 50 + i * 2, // 50, 52, 54, 56, 58, 60, 62
          restingHR: 60,
          sleepDuration: 7,
          synced: false,
        });
      }

      expect(store.baselines.hrv).toBeCloseTo(56, 0); // average
    });
  });
});
```

#### Testing Workout Store Actions

```typescript
// src/store/workout.test.ts
import { useWorkoutStore } from './workout';
import type { WorkoutSession, ExerciseLog } from '@/types';

const createMockWorkout = (): Omit<WorkoutSession, 'status'> => ({
  id: 'workout-1',
  date: new Date(),
  plannedDuration: 45,
  exercises: [
    {
      id: 'ex-1',
      exerciseId: 'bench_press',
      order: 1,
      prescribedWeight: 60,
      prescribedReps: 8,
      prescribedSets: 3,
      completedSets: [],
      skipped: false,
      painLogged: false,
    },
    {
      id: 'ex-2',
      exerciseId: 'squat',
      order: 2,
      prescribedReps: 10,
      prescribedSets: 4,
      completedSets: [],
      skipped: false,
      painLogged: false,
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
  synced: false,
});

describe('workoutStore', () => {
  beforeEach(() => {
    useWorkoutStore.getState().reset();
  });

  describe('workout lifecycle', () => {
    it('starts workout with in_progress status', () => {
      const store = useWorkoutStore.getState();
      store.startWorkout(createMockWorkout());

      expect(store.activeWorkout?.status).toBe('in_progress');
      expect(store.currentExerciseIndex).toBe(0);
    });

    it('completes workout and adds to history', () => {
      const store = useWorkoutStore.getState();
      store.startWorkout(createMockWorkout());
      store.completeWorkout();

      expect(store.activeWorkout).toBeNull();
      expect(store.recentWorkouts).toHaveLength(1);
      expect(store.recentWorkouts[0].status).toBe('completed');
    });

    it('abandons workout without history if no sets completed', () => {
      const store = useWorkoutStore.getState();
      store.startWorkout(createMockWorkout());
      store.abandonWorkout();

      expect(store.activeWorkout).toBeNull();
      expect(store.recentWorkouts).toHaveLength(0);
    });
  });

  describe('set logging', () => {
    it('logs completed set and starts rest timer', () => {
      const store = useWorkoutStore.getState();
      store.startWorkout(createMockWorkout());
      store.completeSet({ weight: 60, reps: 8, rpe: 7 });

      const exercise = store.activeWorkout?.exercises[0];
      expect(exercise?.completedSets).toHaveLength(1);
      expect(exercise?.completedSets[0].weight).toBe(60);
      expect(store.restTimerRunning).toBe(true);
    });

    it('does not start timer on final set', () => {
      const store = useWorkoutStore.getState();
      const workout = createMockWorkout();
      workout.exercises[0].prescribedSets = 1; // Only 1 set
      store.startWorkout(workout);
      store.completeSet({ weight: 60, reps: 8 });

      expect(store.restTimerRunning).toBe(false);
    });
  });

  describe('exercise navigation', () => {
    it('skips exercise with reason and advances', () => {
      const store = useWorkoutStore.getState();
      store.startWorkout(createMockWorkout());
      store.skipExercise('pain');

      expect(store.activeWorkout?.exercises[0].skipped).toBe(true);
      expect(store.activeWorkout?.exercises[0].skipReason).toBe('pain');
      expect(store.currentExerciseIndex).toBe(1);
    });
  });
});
```

#### Testing UI Components

```typescript
// src/components/ui/Button.test.tsx
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/theme';
import { Button } from './Button';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>{component}</ThemeProvider>
  );
};

describe('Button', () => {
  it('renders title correctly', () => {
    renderWithTheme(<Button title="Start Workout" onPress={() => {}} />);
    expect(screen.getByText('Start Workout')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    renderWithTheme(<Button title="Press Me" onPress={onPress} />);

    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when loading', () => {
    renderWithTheme(<Button title="Submit" loading onPress={() => {}} />);

    expect(screen.queryByText('Submit')).toBeNull();
    expect(screen.getByLabelText('Submit, loading')).toBeTruthy();
  });

  it('is disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    renderWithTheme(<Button title="Disabled" disabled onPress={onPress} />);

    fireEvent.press(screen.getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('applies correct accessibility attributes', () => {
    renderWithTheme(
      <Button
        title="Continue"
        accessibilityHint="Moves to the next step"
        onPress={() => {}}
      />
    );

    const button = screen.getByRole('button');
    expect(button.props.accessibilityHint).toBe('Moves to the next step');
  });
});
```

#### Testing Custom Hooks

```typescript
// src/hooks/useHealth.test.ts
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { useHealth } from './useHealth';

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((obj) => obj.ios),
}));

// Mock HealthKit
const mockHealthKit = {
  isAvailable: jest.fn((cb) => cb(null, true)),
  initHealthKit: jest.fn((opts, cb) => cb(null)),
  getStepCount: jest.fn((opts, cb) => cb(null, { value: 8000 })),
  getSleepSamples: jest.fn((opts, cb) => cb(null, [])),
};

jest.mock('react-native-health', () => ({
  default: mockHealthKit,
}));

describe('useHealth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('checks health availability on mount', async () => {
    const { result } = renderHook(() => useHealth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAvailable).toBe(true);
  });

  it('requests permissions successfully', async () => {
    const { result } = renderHook(() => useHealth());

    await waitFor(() => {
      expect(result.current.isAvailable).toBe(true);
    });

    let granted: boolean;
    await act(async () => {
      granted = await result.current.requestPermissions();
    });

    expect(granted!).toBe(true);
    expect(result.current.permissions.sleep).toBe(true);
    expect(result.current.permissions.heartRate).toBe(true);
  });

  it('handles unavailable health services', async () => {
    mockHealthKit.isAvailable.mockImplementationOnce((cb) => cb(null, false));

    const { result } = renderHook(() => useHealth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAvailable).toBe(false);
  });
});
```

---

### Integration Testing

#### Testing API Routes (Backend)

```typescript
// backend/app/api/workouts/generate/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock auth
vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue({ id: 'user-123', email: 'test@example.com' }),
  AuthError: class AuthError extends Error {},
  unauthorizedResponse: vi.fn(),
}));

// Mock store functions
vi.mock('@/lib/store', () => ({
  getActiveInjuries: vi.fn().mockResolvedValue([
    {
      id: 'inj-1',
      bodyRegion: 'shoulder_right',
      severity: 'moderate',
      constraints: [{ type: 'avoid_completely', description: 'No overhead pressing' }],
    },
  ]),
  getUserWorkouts: vi.fn().mockResolvedValue([]),
  getUserReadiness: vi.fn().mockResolvedValue({ score: 75, recommendation: 'moderate' }),
  saveWorkout: vi.fn().mockImplementation((userId, workout) => ({ ...workout, userId })),
}));

// Mock AI
vi.mock('ai', () => ({
  generateObject: vi.fn().mockResolvedValue({
    object: {
      exercises: [
        { exerciseId: 'bench_press', name: 'Bench Press', order: 1, prescribedReps: 8, prescribedSets: 3 },
        { exerciseId: 'squat', name: 'Squat', order: 2, prescribedReps: 10, prescribedSets: 4 },
      ],
      estimatedDuration: 45,
      focus: 'upper body',
      reasoning: 'Modified workout avoiding shoulder stress',
    },
  }),
}));

describe('POST /api/workouts/generate', () => {
  it('generates workout respecting injury constraints', async () => {
    const request = new NextRequest('http://localhost/api/workouts/generate', {
      method: 'POST',
      body: JSON.stringify({
        date: '2025-01-15',
        preferences: { duration: 45, focus: 'upper body' },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.exercises).toHaveLength(2);
    expect(data.meta.constraintsApplied).toBeGreaterThan(0);
  });

  it('returns 400 for invalid input', async () => {
    const request = new NextRequest('http://localhost/api/workouts/generate', {
      method: 'POST',
      body: JSON.stringify({ invalid: 'data' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

#### Testing AI Chat Endpoint

```typescript
// backend/app/api/ai/chat/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue({ id: 'user-123' }),
  AuthError: class AuthError extends Error {},
  unauthorizedResponse: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ limited: false }),
  rateLimitedResponse: vi.fn(),
  rateLimitConfigs: { standard: {} },
}));

vi.mock('ai', () => ({
  streamText: vi.fn().mockResolvedValue({
    toDataStreamResponse: () => new Response('mocked stream'),
  }),
}));

describe('POST /api/ai/chat', () => {
  it('handles chat with workout context', async () => {
    const request = new NextRequest('http://localhost/api/ai/chat', {
      method: 'POST',
      headers: { 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'That hurt my shoulder' }],
        context: {
          currentWorkout: 'Upper Body A',
          currentExercise: 'Overhead Press',
          activeInjuries: ['Right shoulder strain'],
        },
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('respects rate limiting', async () => {
    const { checkRateLimit, rateLimitedResponse } = await import('@/lib/rate-limit');
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      limited: true,
      resetAt: Date.now() + 60000
    });
    vi.mocked(rateLimitedResponse).mockReturnValue(
      new Response('Rate limited', { status: 429 })
    );

    const request = new NextRequest('http://localhost/api/ai/chat', {
      method: 'POST',
      headers: { 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({ messages: [] }),
    });

    const response = await POST(request);
    expect(response.status).toBe(429);
  });
});
```

---

### E2E Testing (Detox)

Recommended for critical user journeys. Install Detox:

```bash
npm install -D detox @types/detox jest-circus
npx detox init
```

#### Example E2E Test

```typescript
// e2e/workoutFlow.test.ts
import { device, element, by, expect } from 'detox';

describe('Workout Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('completes full workout flow', async () => {
    // Navigate to workout
    await element(by.text('Start Workout')).tap();

    // Verify first exercise loads
    await expect(element(by.text('Bench Press'))).toBeVisible();
    await expect(element(by.text('3 sets x 8 reps'))).toBeVisible();

    // Complete first set
    await element(by.id('complete-set-button')).tap();
    await expect(element(by.text('Set 1 complete'))).toBeVisible();

    // Rest timer should appear
    await expect(element(by.id('rest-timer'))).toBeVisible();

    // Skip rest
    await element(by.text('Skip Rest')).tap();

    // Complete remaining sets
    await element(by.id('complete-set-button')).tap();
    await element(by.id('complete-set-button')).tap();

    // Should advance to next exercise
    await expect(element(by.text('Squat'))).toBeVisible();
  });

  it('allows exercise skip with reason', async () => {
    await element(by.text('Start Workout')).tap();
    await element(by.id('skip-exercise-button')).tap();

    // Select skip reason
    await element(by.text('Pain/Discomfort')).tap();
    await element(by.text('Confirm')).tap();

    // Should advance to next exercise
    await expect(element(by.text('Squat'))).toBeVisible();
  });

  it('shows completion celebration', async () => {
    await element(by.text('Start Workout')).tap();

    // Complete all exercises (simplified)
    for (let i = 0; i < 7; i++) { // 3 + 4 sets
      await element(by.id('complete-set-button')).tap();
      if (i < 6) {
        await element(by.text('Skip Rest')).tap();
      }
    }

    // Verify completion screen
    await expect(element(by.text('Workout Complete!'))).toBeVisible();
    await expect(element(by.id('workout-summary'))).toBeVisible();
  });
});
```

---

### Critical User Paths to Test

These flows must have both unit and E2E coverage:

| Path | Priority | Tests Required |
|------|----------|----------------|
| **Morning check-in** | P0 | Readiness calculation, health data fetch, recommendation display |
| **Start & complete workout** | P0 | Workout start, set logging, exercise navigation, completion |
| **Log pain during workout** | P0 | Pain input, body region selection, workout modification |
| **Skip/swap exercise** | P0 | Skip reason capture, alternative suggestion, workout continuation |
| **Add injury** | P1 | Body map selection, constraint inference, workout impact |
| **AI chat during workout** | P1 | Context passing, response streaming, suggestion handling |
| **Health data sync** | P1 | Permission handling, data fetch, backend sync |
| **Offline workout** | P2 | Local persistence, sync queue, conflict resolution |

---

### Mocking Strategies

#### Health APIs (HealthKit / Health Connect)

```typescript
// __mocks__/react-native-health.ts
export const mockHealthData = {
  sleepDuration: 7.5,
  sleepQuality: 85,
  hrv: 55,
  restingHR: 58,
  steps: 8500,
};

export default {
  isAvailable: jest.fn((cb) => cb(null, true)),
  initHealthKit: jest.fn((opts, cb) => cb(null)),
  getStepCount: jest.fn((opts, cb) => cb(null, { value: mockHealthData.steps })),
  getSleepSamples: jest.fn((opts, cb) => cb(null, [
    {
      value: 'ASLEEP',
      startDate: new Date(Date.now() - 7.5 * 3600000).toISOString(),
      endDate: new Date().toISOString(),
    },
  ])),
  getHeartRateVariabilitySamples: jest.fn((opts, cb) => cb(null, [
    { value: mockHealthData.hrv / 1000 },
  ])),
  getRestingHeartRate: jest.fn((opts, cb) => cb(null, [
    { value: mockHealthData.restingHR },
  ])),
};
```

#### AI Responses

```typescript
// __mocks__/aiResponses.ts
export const mockAIResponses = {
  chat: {
    shoulderPain: {
      content: "Noted. Want to try cable flies instead, or move on?",
      context: { currentExercise: 'Bench Press' },
    },
    skipExercise: {
      content: "Done. Want leg press instead, or just move on?",
      context: { currentExercise: 'Squat' },
    },
    tooHeavy: {
      content: "Drop 10% and see how it feels. You can always add back.",
      context: {},
    },
  },
  workoutGeneration: {
    fullBody: {
      exercises: [
        { exerciseId: 'squat', name: 'Squat', prescribedReps: 8, prescribedSets: 3 },
        { exerciseId: 'bench_press', name: 'Bench Press', prescribedReps: 10, prescribedSets: 3 },
        { exerciseId: 'bent_over_row', name: 'Bent Over Row', prescribedReps: 10, prescribedSets: 3 },
      ],
      estimatedDuration: 45,
      focus: 'full body',
      reasoning: 'Balanced workout hitting all major muscle groups',
    },
    withShoulderInjury: {
      exercises: [
        { exerciseId: 'leg_press', name: 'Leg Press', prescribedReps: 12, prescribedSets: 4 },
        { exerciseId: 'lat_pulldown', name: 'Lat Pulldown', prescribedReps: 10, prescribedSets: 3 },
        { exerciseId: 'cable_row', name: 'Cable Row', prescribedReps: 12, prescribedSets: 3 },
      ],
      estimatedDuration: 40,
      focus: 'lower body + back',
      reasoning: 'Avoiding overhead and pressing movements due to shoulder injury',
    },
  },
};

// Usage in tests
vi.mock('ai', () => ({
  streamText: vi.fn().mockResolvedValue({
    toDataStreamResponse: () => new Response(mockAIResponses.chat.shoulderPain.content),
  }),
  generateObject: vi.fn().mockResolvedValue({
    object: mockAIResponses.workoutGeneration.fullBody,
  }),
}));
```

#### Network Requests (MSW)

```typescript
// __mocks__/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/workouts/generate', () => {
    return HttpResponse.json({
      data: {
        id: 'workout-123',
        exercises: [
          { exerciseId: 'squat', name: 'Squat', prescribedReps: 8, prescribedSets: 3 },
        ],
      },
    });
  }),

  http.post('/api/health/sync', () => {
    return HttpResponse.json({ success: true });
  }),

  http.get('/api/injuries', () => {
    return HttpResponse.json({
      data: [
        { id: 'inj-1', bodyRegion: 'shoulder_right', severity: 'moderate', status: 'healing' },
      ],
    });
  }),
];
```

---

### Running Tests in CI

#### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  mobile-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm test -- --coverage --ci

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          flags: mobile

  backend-tests:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Tests
        run: npm test -- --coverage
        env:
          POSTGRES_URL: ${{ secrets.TEST_POSTGRES_URL }}
          ANTHROPIC_API_KEY: ${{ secrets.TEST_ANTHROPIC_API_KEY }}

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: backend/coverage/lcov.info
          flags: backend

  e2e-tests:
    runs-on: macos-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm ci
          cd ios && pod install

      - name: Build for Detox
        run: npx detox build --configuration ios.sim.release

      - name: Run E2E tests
        run: npx detox test --configuration ios.sim.release --headless
```

### Test Commands Reference

```bash
# Mobile app
npm test                          # Run all tests
npm test -- --watch              # Watch mode
npm test -- --coverage           # With coverage report
npm test -- --updateSnapshot     # Update snapshots
npm test -- Button               # Run tests matching "Button"

# Backend
cd backend
npm test                          # Run all tests
npm test -- --reporter=verbose   # Verbose output
npm test -- --coverage           # With coverage

# E2E (Detox)
npx detox build --configuration ios.sim.debug
npx detox test --configuration ios.sim.debug
npx detox test --configuration ios.sim.debug --reuse  # Faster re-runs
```

---

## Commands

### Mobile Development

```bash
npm install           # Install dependencies
npm run ios           # Run iOS simulator
npm run android       # Run Android emulator
npm start             # Start Metro bundler
npm run type-check    # TypeScript check
npm run lint          # ESLint
```

### Backend Development

```bash
cd backend
npm install           # Install dependencies
npm run dev           # Start dev server (port 3000)
npm run build         # Production build
npm run lint          # ESLint
```

### iOS Specific

```bash
cd ios && pod install  # Install CocoaPods
```

---

## Environment Variables

### Mobile (`.env`)

```
API_BASE_URL=http://localhost:3000
```

### Backend (`backend/.env`)

```
POSTGRES_URL=           # Vercel Postgres connection
ANTHROPIC_API_KEY=      # Claude API key
NEXTAUTH_SECRET=        # Auth secret
NEXTAUTH_URL=           # Auth callback URL
```

---

## Key Patterns

### Offline-First

- Workouts execute fully offline
- Use MMKV for local persistence
- Queue sync actions when offline
- Resolve conflicts with defined strategy

### Health Integration

```typescript
// iOS: react-native-health
// Android: react-native-health-connect

// Always check permissions before accessing
const { isAuthorized, request } = useHealth();
if (!isAuthorized) await request(['sleep', 'hrv']);
```

### Haptic Feedback

```typescript
const { trigger } = useHaptics();

// On button press
trigger('tap');

// On success
trigger('success');

// On error
trigger('error');
```

### Error Boundaries

Wrap feature screens in error boundaries with fallback UI.

---

## Current Status

### Implemented
- Core UI components (Button, Card, Input, Text)
- Navigation structure
- Theme system with light/dark modes
- Body map visualization
- Readiness ring component
- AI chat with streaming (connected)
- Workout generation API (connected)
- Health sync API (backend only)
- Database schema (complete)

### Not Yet Implemented (MVP Blockers)
- User authentication flow
- Data persistence (frontend -> backend)
- Empty states for new users
- Loading states (partial)
- Pain log persistence
- Workout completion celebration

See `docs/PRODUCT_REQUIREMENTS.md` for full gap analysis.

---

## Development Workflow

### Before Starting

1. Read this file and `docs/PRODUCT_REQUIREMENTS.md`
2. Check current implementation status above
3. Understand the three intelligence models

### When Adding Features

1. **Types first** - Define in `src/types/index.ts`
2. **API contract** - Define request/response schemas
3. **Backend route** - Implement with Zod validation
4. **Store/hooks** - Add state management if needed
5. **Components** - Build UI with theme tokens
6. **Tests** - Add unit tests for logic

### Code Review Checklist

- [ ] TypeScript strict mode passes
- [ ] Uses theme tokens (no hardcoded values)
- [ ] Accessibility props included
- [ ] Error states handled
- [ ] Loading states handled
- [ ] Offline behavior considered
- [ ] No console.log in production code

---

## Performance

### Bundle Size Budgets

| Target | Budget | Notes |
|--------|--------|-------|
| **JS Bundle (iOS)** | < 2.5 MB | Hermes bytecode |
| **JS Bundle (Android)** | < 2.5 MB | Hermes bytecode |
| **Initial Load** | < 1.5 MB | Code-split heavy features |
| **Per-screen Delta** | < 100 KB | Lazy load screens |

**Heavy Dependencies to Watch:**
```
react-native-reanimated    ~300KB   (required, worth it)
react-native-svg           ~150KB   (required for body map)
react-native-vision-camera ~large   (lazy load for document scan)
date-fns                   ~75KB    (use subpath imports)
```

**Bundle Optimization:**
```typescript
// Good - tree-shakeable import
import { format, parseISO } from 'date-fns';

// Avoid - imports entire library
import * as dateFns from 'date-fns';
```

### Startup Time Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Cold Start (TTI)** | < 2.0s | Time to interactive |
| **Warm Start** | < 500ms | From background |
| **Screen Transition** | < 300ms | Navigation animation |
| **Workout Action** | < 100ms | Button/gesture response |

**Startup Optimization Checklist:**
- Defer non-critical initialization (analytics, crash reporting)
- Use `InteractionManager.runAfterInteractions()` for heavy setup
- Lazy load features not needed on first screen
- Pre-warm health data fetch in background

### List Rendering Patterns

**When to Use FlatList:**
- Lists with > 10 items
- Dynamic/scrollable lists
- Any list that could grow over time

**When ScrollView is OK:**
- Static content (< 10 items)
- Content that fits on screen
- Non-repeating layouts

**FlatList Optimization Pattern:**
```typescript
import { FlatList, type ListRenderItem } from 'react-native';
import { useCallback, memo } from 'react';

interface ExerciseListProps {
  exercises: Exercise[];
  onExercisePress: (id: string) => void;
}

// Memoize item component
const ExerciseItem = memo(function ExerciseItem({
  exercise,
  onPress,
}: {
  exercise: Exercise;
  onPress: () => void;
}) {
  return (
    <ExerciseCard
      exerciseId={exercise.id}
      prescription={exercise.prescription}
      completedSets={0}
      onPress={onPress}
    />
  );
});

export function ExerciseList({ exercises, onExercisePress }: ExerciseListProps) {
  // Stable render function
  const renderItem: ListRenderItem<Exercise> = useCallback(
    ({ item }) => (
      <ExerciseItem
        exercise={item}
        onPress={() => onExercisePress(item.id)}
      />
    ),
    [onExercisePress]
  );

  // Stable key extractor
  const keyExtractor = useCallback((item: Exercise) => item.id, []);

  // Stable item layout for fixed-height items (optional but improves perf)
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <FlatList
      data={exercises}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      // Performance props
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={8}
      // Prevent re-renders
      extraData={undefined}
    />
  );
}

const ITEM_HEIGHT = 120; // Match ExerciseCard height
```

**Avoid These Patterns:**
```typescript
// Bad - inline functions cause re-renders
<FlatList
  renderItem={({ item }) => <Item onPress={() => handlePress(item.id)} />}
  keyExtractor={(item) => item.id}
/>

// Bad - array spread creates new reference
<FlatList data={[...items]} />

// Bad - object style creates new reference
<FlatList contentContainerStyle={{ padding: 16 }} />
```

### Animation Performance (Reanimated)

**Best Practices:**
```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

// Good - UI thread animation
function AnimatedButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        {/* content */}
      </Pressable>
    </Animated.View>
  );
}
```

**Spring Configs for Consistency:**
```typescript
// Standard spring configs (use throughout the app)
export const SPRING_CONFIGS = {
  // Quick, snappy feedback
  button: { damping: 15, stiffness: 300 },
  // Smooth transitions
  transition: { damping: 20, stiffness: 200 },
  // Bouncy, playful
  bounce: { damping: 10, stiffness: 150 },
  // Gentle, subtle
  gentle: { damping: 25, stiffness: 120 },
} as const;

// Timing configs
export const TIMING_CONFIGS = {
  fast: { duration: 200 },
  normal: { duration: 300 },
  slow: { duration: 500 },
} as const;
```

**Avoid:**
- Running JS callbacks during animations (use `runOnJS` only when necessary)
- Animating layout properties (`width`, `height`) - prefer `transform`
- Creating shared values in render (use `useSharedValue`)

### Image Optimization

**Use FastImage for Remote Images:**
```typescript
// Install: npm install react-native-fast-image
import FastImage from 'react-native-fast-image';

<FastImage
  source={{
    uri: imageUrl,
    priority: FastImage.priority.normal,
    cache: FastImage.cacheControl.immutable,
  }}
  style={{ width: 200, height: 200 }}
  resizeMode={FastImage.resizeMode.cover}
/>
```

**Image Guidelines:**
| Use Case | Format | Max Size | Notes |
|----------|--------|----------|-------|
| Exercise demos | WebP | 500KB | Cache aggressively |
| User avatars | WebP | 50KB | Thumbnail + full |
| Body map SVG | Inline SVG | N/A | Already optimized |
| Documents | JPEG | 2MB | Compress before upload |

**Preloading Critical Images:**
```typescript
// Preload images during idle time
import FastImage from 'react-native-fast-image';

const preloadImages = (urls: string[]) => {
  FastImage.preload(urls.map(uri => ({ uri })));
};

// Call during app init or screen focus
useEffect(() => {
  preloadImages(exerciseImageUrls);
}, []);
```

### Memory Management

**MMKV Storage Pattern:**
```typescript
// src/lib/storage.ts
import { MMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

export const mmkv = new MMKV();

// Zustand storage adapter
export const mmkvStorage: StateStorage = {
  getItem: (name) => {
    const value = mmkv.getString(name);
    return value ?? null;
  },
  setItem: (name, value) => {
    mmkv.set(name, value);
  },
  removeItem: (name) => {
    mmkv.delete(name);
  },
};

// Use in Zustand stores
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      // ... store implementation
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
```

**Memory Leak Prevention:**
```typescript
// Clean up subscriptions
useEffect(() => {
  const unsubscribe = someStore.subscribe(callback);
  return () => unsubscribe();
}, []);

// Clean up timers
useEffect(() => {
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer);
}, []);

// Clean up event listeners
useEffect(() => {
  const subscription = AppState.addEventListener('change', handleChange);
  return () => subscription.remove();
}, []);
```

**Large List Data:**
```typescript
// Limit stored workout history
const MAX_RECENT_WORKOUTS = 20;

// In store
set((state) => {
  state.recentWorkouts.unshift(workout);
  if (state.recentWorkouts.length > MAX_RECENT_WORKOUTS) {
    state.recentWorkouts = state.recentWorkouts.slice(0, MAX_RECENT_WORKOUTS);
  }
});
```

### Monitoring and Profiling

**Development Tools:**
```bash
# React Native performance monitor
# Shake device -> "Perf Monitor"

# Flipper (recommended)
# Install from https://fbflipper.com/
# Plugins: React DevTools, Network, Databases, Hermes Debugger

# React DevTools Profiler
npx react-devtools
```

**Production Monitoring (Recommended Setup):**
```typescript
// Sentry for crash reporting and performance
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.2, // 20% of transactions
  profilesSampleRate: 0.1, // 10% of profiles
});

// Track slow screens
Sentry.startTransaction({
  name: 'WorkoutExecution',
  op: 'navigation',
});
```

**Performance Checklist (Pre-Release):**
- [ ] Test on low-end Android device (2GB RAM)
- [ ] Profile with Hermes (not Chrome debugger)
- [ ] Check FlatList scroll performance at 60fps
- [ ] Verify animations run on UI thread (no JS bridge)
- [ ] Test cold start time with release build
- [ ] Memory profile during long workout session
- [ ] Verify offline-first features work without network

**Useful Profiling Commands:**
```bash
# Android CPU profiler
adb shell am profile start <package> /data/local/tmp/profile.trace
adb shell am profile stop <package>
adb pull /data/local/tmp/profile.trace

# iOS Instruments (from Xcode)
# Product -> Profile -> Time Profiler

# Bundle analysis
npx react-native-bundle-visualizer
```

---

## Design Principles

1. **Offline-first** - Workouts work without network
2. **Privacy-centric** - On-device processing where possible
3. **Compassionate** - No guilt, no fake cheerfulness
4. **Progressive simplicity** - Day one is radically simple
5. **Injury-aware** - Every feature considers body state

---

## Security

### Authentication Flow

NextAuth.js handles authentication with JWT-based sessions:

```
User Login -> Credentials Validated -> JWT Created -> Session Cookie Set
                    |
              bcrypt.compareSync()
              (cost factor 10)
```

**Session Configuration** (`/backend/lib/auth.ts`):
- Strategy: JWT (stateless, no server-side session storage)
- Max Age: 30 days
- Cookie: Secure, HttpOnly (handled by NextAuth)

**Protecting API Routes:**
```typescript
import { requireAuth, AuthError, unauthorizedResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    // user.id is now available
  } catch (error) {
    if (error instanceof AuthError) {
      return unauthorizedResponse(error.message);
    }
  }
}
```

**Protecting Client Routes:**
```typescript
import { AuthGuard } from '@/components/AuthGuard';

// Wrap protected pages
<AuthGuard>
  <ProtectedContent />
</AuthGuard>

// Or use the hook
const { session, isLoading } = useRequireAuth();
```

**Important:** Demo token (`Bearer demo`) is only accepted when `NODE_ENV !== 'production'`.

---

### API Security

#### Rate Limiting

All sensitive endpoints use rate limiting via Vercel KV (`/backend/lib/rate-limit.ts`):

```typescript
import { checkRateLimit, rateLimitedResponse, rateLimitConfigs } from '@/lib/rate-limit';

// At start of handler
const ip = request.headers.get('x-forwarded-for') || 'anonymous';
const rateLimit = await checkRateLimit(`endpoint:${ip}`, rateLimitConfigs.strict);
if (rateLimit.limited) {
  return rateLimitedResponse(rateLimit.resetAt);
}
```

**Rate Limit Tiers:**
| Tier | Limit | Use Case |
|------|-------|----------|
| `strict` | 10/min | Auth endpoints (login, register) |
| `standard` | 60/min | General API (chat, workouts) |
| `relaxed` | 120/min | Read-heavy endpoints |

**Response Headers:** `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`

#### Input Validation

All endpoints use layered validation:

1. **Zod Schema Validation** - Type safety and constraints
2. **Sanitization** - XSS prevention via `/backend/lib/sanitize.ts`

```typescript
import { z } from 'zod';
import { sanitizeString, sanitizeEmail } from '@/lib/sanitize';

const schema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  notes: z.string().max(2000).optional(),
});

// After validation, sanitize user-provided text
const sanitizedName = sanitizeString(parsed.data.name);
const sanitizedEmail = sanitizeEmail(parsed.data.email);
```

**Sanitization Functions:**
- `sanitizeString()` - Escapes HTML entities, trims whitespace
- `sanitizeEmail()` - Lowercases, trims
- `sanitizeFilename()` - Removes dangerous characters, limits length
- `sanitizeObject()` - Batch sanitize object fields

#### Error Handling

Never leak internal details in production:

```typescript
// Good - generic message
return NextResponse.json(
  { error: { code: 'INTERNAL_ERROR', message: 'Failed to process request' } },
  { status: 500 }
);

// Bad - exposes internals
return NextResponse.json({ error: dbError.message }, { status: 500 });
```

---

### Health Data Compliance

This app handles sensitive health information (sleep, HRV, heart rate, injury records). While not a covered entity under HIPAA, follow these practices:

#### Data Isolation
All health data queries MUST be scoped by `userId`:

```typescript
// Correct - always filter by authenticated user
const injuries = await getUserInjuries(userId, { status: 'active' });

// NEVER do this - exposes all users' data
const allInjuries = await db.select().from(injuries);
```

#### Sensitive Fields
The following fields may contain PHI and require extra care:
- `injuries.clinicalNotes` - Healthcare provider notes
- `injuries.description` - User-described symptoms
- `healthSnapshots.*` - Biometric data
- `painLogs.*` - Pain tracking data

#### Logging Guidelines
```typescript
// Good - log action without PII
console.error('Health sync error:', { oderId: user.id, errorCode: 'SYNC_FAILED' });

// Bad - logs actual health data
console.error('Health sync error:', { hrv: snapshot.hrv, sleepData: snapshot });
```

#### Data Retention
- Health snapshots are stored indefinitely for trend analysis
- Consider implementing data export and deletion for user requests
- Clinical notes should have stricter access controls if expanded

---

### Secure Coding Practices

#### Password Handling
Passwords are hashed with bcrypt (cost factor 10):

```typescript
// Hashing (in createUser)
const hashedPassword = bcrypt.hashSync(password, 10);

// Verification (in validateCredentials)
const isValid = bcrypt.compareSync(inputPassword, storedHash);
```

**Never:**
- Log passwords or password hashes
- Store plaintext passwords
- Send passwords in response bodies

#### API Keys in AI Requests
AI API keys are server-side only:

```typescript
// /backend/lib/ai.ts - key never exposed to client
export const gateway = createOpenAI({
  baseURL: 'https://gateway.ai.vercel.app/v1',
  apiKey: process.env.VERCEL_AI_GATEWAY_SECRET,  // Server-side only
});
```

#### Type-Safe Database Queries
Use Drizzle ORM to prevent SQL injection:

```typescript
// Safe - parameterized query
await db.select().from(injuries).where(eq(injuries.userId, userId));

// Never use raw SQL with user input
```

---

### Environment Variable Security

#### Required Variables

| Variable | Purpose | Security Notes |
|----------|---------|----------------|
| `POSTGRES_URL` | Database connection | Contains credentials |
| `NEXTAUTH_SECRET` | JWT signing | Min 32 chars, random |
| `ANTHROPIC_API_KEY` | AI API | Billing implications |
| `VERCEL_AI_GATEWAY_SECRET` | AI Gateway | Alternative AI key |

#### Protection Checklist

- [x] `.env` files are in `.gitignore`
- [x] `.env.example` contains no real values
- [ ] Production secrets set via Vercel dashboard, not committed
- [x] API keys are server-side only (not prefixed with `NEXT_PUBLIC_`)

#### Local Development
```bash
# Copy template and fill in values
cp .env.example backend/.env

# Never commit .env files
git status  # Should not show .env
```

---

### Security Checklist for New Features

When adding new features, verify:

- [ ] API route uses `requireAuth()` for authenticated endpoints
- [ ] Rate limiting applied to sensitive operations
- [ ] User input validated with Zod schema
- [ ] Text fields sanitized before storage
- [ ] Database queries scoped by `userId`
- [ ] Error responses don't leak internal details
- [ ] No secrets in client-side code
- [ ] Health data logging follows guidelines

---

## Documentation

| Document | Purpose |
|----------|---------|
| `README.md` | Project overview, setup instructions |
| `CLAUDE.md` | AI assistant guidelines (this file) |
| `docs/PRODUCT_REQUIREMENTS.md` | Full PRD with user journeys |
| `movement-companion-handoff.md` | Original vision document |
| `movement-companion-technical-addendum.md` | System architecture |
| `movement-companion-ux-addendum.md` | UX specifications |

---

## Common Gotchas

1. **Path aliases** - Ensure `@/` resolves correctly in both Metro and TypeScript
2. **Reanimated** - Run `npx react-native-reanimated-worklets` if gesture issues
3. **Health permissions** - iOS requires entitlements, Android needs manifest config
4. **Theme context** - Components must be wrapped in ThemeProvider
5. **Navigation types** - Update `src/navigation/types.ts` when adding screens

---

## Contact

For questions about this project, refer to the documentation or consult the project lead.
