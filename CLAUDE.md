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

## Testing

### Run Tests

```bash
# Mobile
npm test

# Backend
cd backend && npm test
```

### Test Patterns

- Co-locate tests with source (`Component.test.tsx`)
- Use React Native Testing Library
- Mock external services (health APIs, AI)

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

## Design Principles

1. **Offline-first** - Workouts work without network
2. **Privacy-centric** - On-device processing where possible
3. **Compassionate** - No guilt, no fake cheerfulness
4. **Progressive simplicity** - Day one is radically simple
5. **Injury-aware** - Every feature considers body state

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
