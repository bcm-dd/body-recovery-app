# @app/domain

Domain layer for the Body Recovery Companion App. Contains all core business logic, types, and data structures.

## Purpose

This package provides the foundational domain model for the application, including:

- **Types**: Complete TypeScript interfaces for body mapping, exercises, plans, health signals, and safety
- **Engines**: Rules-based planning, exercise substitution scoring, and safety detection
- **Constants**: Body regions, movement patterns, and muscle group definitions
- **Data**: Exercise library with 30+ exercises and demo user profiles

## Installation

This package is part of the monorepo and is installed automatically. To use it in another package:

```json
{
  "dependencies": {
    "@app/domain": "workspace:*"
  }
}
```

## Usage

### Import Types

```typescript
import type {
  BodyRegion,
  Exercise,
  DayPlan,
  ReadinessScore,
  SafetyCheckResult,
} from '@app/domain';

// Or import from specific subpath
import type { BodyMap, Injury } from '@app/domain/types';
```

### Use Engines

```typescript
import {
  planningEngine,
  safetyEngine,
  substitutionEngine,
} from '@app/domain';

// Generate a day plan
const plan = planningEngine.generateDayPlan({
  userId: 'user-123',
  date: new Date(),
  dailySignals,
  bodyMap,
  userPreferences,
  recentWorkouts: [],
  availableEquipment: ['dumbbell', 'bench_flat'],
});

// Check for safety concerns
const safetyResult = safetyEngine.checkInput({
  userMessage: 'I have chest pain',
  bodyStatus: currentBodyStatus,
});

// Find exercise substitutes
const substitutes = substitutionEngine.findSubstitutes(
  'barbell-squat',
  exercisePool,
  { availableEquipment, constraints, userPreferences }
);
```

### Access Constants

```typescript
import {
  BODY_REGIONS,
  BODY_REGION_LABELS,
  MUSCLE_GROUPS,
  MOVEMENT_PATTERNS,
} from '@app/domain';

// Get display name for a region
const label = BODY_REGION_LABELS['lower_back']; // "Lower Back"

// Check similar movement patterns
import { areSimilarPatterns } from '@app/domain';
const similar = areSimilarPatterns('squat', 'lunge'); // true
```

### Use Exercise Library

```typescript
import {
  EXERCISES,
  getExerciseById,
  getExercisesByCategory,
  filterByEquipment,
} from '@app/domain';

// Get exercise by ID
const squat = getExerciseById('goblet-squat');

// Filter by category
const mobilityExercises = getExercisesByCategory('mobility');

// Filter by available equipment
const availableExercises = filterByEquipment(EXERCISES, ['dumbbell', 'none']);
```

## API Reference

### Types

| Type | Description |
|------|-------------|
| `BodyRegion` | 34 anatomical regions for body mapping |
| `BodyMap` | Complete body status model for a user |
| `Exercise` | Full exercise definition with metadata |
| `DayPlan` | Generated daily workout/recovery plan |
| `ReadinessScore` | Computed readiness assessment (0-100) |
| `SafetyCheckResult` | Result of safety analysis |

### Engines

| Engine | Description |
|--------|-------------|
| `PlanningEngine` | Rules-based plan generation with transparent rationale |
| `SubstitutionEngine` | Exercise substitution with similarity scoring |
| `SafetyEngine` | Red flag detection and safety escalation |

### Constants

| Constant | Description |
|----------|-------------|
| `BODY_REGIONS` | Array of 34 body region identifiers |
| `MUSCLE_GROUPS` | Array of 20 muscle group identifiers |
| `MOVEMENT_PATTERNS` | Array of 15 movement pattern identifiers |
| `MUSCLE_RECOVERY_ESTIMATES` | Recovery time estimates by muscle group |

### Data

| Export | Description |
|--------|-------------|
| `EXERCISES` | Array of 30+ exercise definitions |
| `DEMO_PROFILES` | Pre-built user profiles for testing |
| `getExerciseById()` | Lookup exercise by ID |
| `filterByEquipment()` | Filter exercises by available equipment |

## Package Structure

```
src/
  index.ts          # Main entry point with all exports
  types/
    index.ts        # Type re-exports
    body.ts         # Body mapping types
    exercise.ts     # Exercise types
    plan.ts         # Planning types
    health.ts       # Health signal types
    safety.ts       # Safety types
  engines/
    index.ts        # Engine re-exports
    planning.ts     # Plan generation engine
    substitution.ts # Exercise substitution engine
    safety.ts       # Safety detection engine
  constants/
    index.ts        # Constant re-exports
    regions.ts      # Body region definitions
    muscles.ts      # Muscle group definitions
    patterns.ts     # Movement pattern definitions
  data/
    index.ts        # Data re-exports
    exercises.ts    # Exercise library
    profiles.ts     # Demo profiles
```

## Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test:coverage
```
