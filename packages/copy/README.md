# @app/copy

Centralized strings and copy for the Body Recovery Companion App. All user-facing text in one place.

## Purpose

This package provides:

- **Strings**: All user-facing text organized by feature area
- **Safety Compliance**: Wellness-focused language following safety guidelines
- **Interpolation**: Type-safe string templating with parameters
- **Types**: Shared type definitions for copy-related data

## Installation

This package is part of the monorepo and is installed automatically. To use it in another package:

```json
{
  "dependencies": {
    "@app/copy": "workspace:*"
  }
}
```

## Usage

### Import Strings

```typescript
import { common, onboarding, workout, safety } from '@app/copy';

// Use strings directly
const title = common.appName; // "Movement & Recovery Companion"

// Access nested strings
const welcomeMessage = onboarding.welcome.title;
const startButton = onboarding.welcome.cta;
```

### String Interpolation

```typescript
import { interpolate, workout } from '@app/copy';

// Template with parameters
const duration = interpolate(workout.session.duration, { duration: 20 });
// Result: "20 min"

const reps = interpolate(workout.exercise.repsDisplay, { reps: 12 });
// Result: "12 reps"

const sets = interpolate(workout.exercise.setsRemaining, { count: 3 });
// Result: "3 sets remaining"
```

### Type-Safe Parameters

```typescript
import { interpolate } from '@app/copy';

// TypeScript extracts parameter types from template
const template = "Hello, {name}! You have {count} messages.";

// Type-safe: requires name and count
interpolate(template, { name: "Alex", count: 5 });

// Type error: missing 'count'
interpolate(template, { name: "Alex" }); // Error!
```

### Safety-Compliant Language

All strings follow the safety and compliance guidelines:

```typescript
import { safety } from '@app/copy';

// Appropriate wellness-focused language
safety.disclaimer.full
// Uses "movement specialist" not "physical therapist"
// Uses "discomfort" not "pain" where appropriate
// Uses "healthcare provider" for professional referrals

// Red flag detection messages
safety.escalation.emergency.title
safety.escalation.emergency.message
safety.escalation.seekCare.title
```

## API Reference

### String Categories

| Category | Description |
|----------|-------------|
| `common` | App-wide strings (app name, navigation, actions) |
| `onboarding` | Welcome flow and setup strings |
| `workout` | Exercise and workout session strings |
| `safety` | Disclaimers, warnings, and escalation messages |

### Common Strings

```typescript
import { common } from '@app/copy';

common.appName          // App title
common.navigation.*     // Tab/screen names
common.actions.*        // Button labels (save, cancel, etc.)
common.errors.*         // Error messages
common.empty.*          // Empty state messages
```

### Onboarding Strings

```typescript
import { onboarding } from '@app/copy';

onboarding.welcome.*       // Welcome screen
onboarding.permissions.*   // Permission requests
onboarding.healthData.*    // Health data consent
onboarding.bodyMap.*       // Initial body assessment
onboarding.goals.*         // Goal setting
```

### Workout Strings

```typescript
import { workout } from '@app/copy';

workout.session.*      // Workout session UI
workout.exercise.*     // Exercise display
workout.feedback.*     // Post-workout feedback
workout.substitution.* // Exercise swap UI
```

### Safety Strings

```typescript
import { safety } from '@app/copy';

safety.disclaimer.*    // Legal disclaimers
safety.escalation.*    // Warning/emergency messages
safety.redFlags.*      // Red flag detection messages
safety.resources.*     // Help resources
```

### Types

| Type | Description |
|------|-------------|
| `PainLevel` | Pain severity levels |
| `ReadinessLevel` | Readiness categories |
| `FocusArea` | User focus selections |
| `ExperienceLevel` | User experience levels |
| `DisclaimerLevel` | Disclaimer verbosity |
| `EscalationCategory` | Safety escalation levels |

### Utility Functions

```typescript
import { interpolate } from '@app/copy';

// Interpolate template strings
interpolate(template: string, params: Record<string, string | number>): string
```

## String Guidelines

### Do Use

- "Movement specialist" (not physical therapist)
- "Healthcare provider" (for professional referrals)
- "Discomfort" (for mild sensations)
- "Body signals" (not symptoms)
- "Recovery" and "wellness" language

### Avoid

- Specific medical diagnoses
- Treatment recommendations
- Medical professional titles
- Clinical terminology
- Absolute statements about health

## Package Structure

```
src/
  index.ts              # Main entry point
  types.ts              # Type definitions
  strings/
    index.ts            # String exports
    common.ts           # Common/shared strings
    onboarding.ts       # Onboarding flow strings
    workout.ts          # Workout strings
    safety.ts           # Safety/compliance strings
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

## Adding New Strings

1. Add the string to the appropriate file in `src/strings/`
2. Use templates with `{param}` syntax for dynamic values
3. Follow safety guidelines for user-facing copy
4. Export from the category's index
5. Add tests for any interpolated strings
