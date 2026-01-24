# Consolidated MVP Build Plan

**Clair Orchestrator - Phase 0 Consolidation**
**Version:** 1.0
**Date:** 2026-01-24

---

## Executive Summary

This document consolidates outputs from the 5 planning agents into an actionable MVP build plan for the Body Recovery Companion App - a mobile-first, privacy-centric, rules-based recovery guidance tool.

### Key Principles (from all agents)
- **Mobile is primary**, web is companion
- **No medical claims** - wellness/self-care positioning only
- **Rules-based logic** - transparent, explainable planning
- **Safety-first** - conservative defaults, red-flag detection
- **Offline-capable** - local persistence, no backend for MVP
- **No gamification** - no streaks, badges, or leaderboards

---

## 1. MVP Scope Summary

### Must-Have (Phase 1 Deliverables)
| Feature | Source | Priority |
|---------|--------|----------|
| Body Map input (pain logging) | Agent A | P0 |
| Pain severity logging (1-10 scale) | Agent A | P0 |
| Rules-based day plan generation | Agent B | P0 |
| Exercise library (~40 exercises) | Agent B | P0 |
| Session execution with timer | Agent A | P0 |
| Exercise substitution with ranking | Agent B | P0 |
| Daily check-in flow | Agent A | P0 |
| Basic progress tracking | Agent A | P0 |
| Health data integration (mock + real stubs) | Agent D | P0 |
| Safety engine with red-flag detection | Agent E | P0 |
| Offline workout execution | Agent D | P0 |

### Should-Have (Simplified for MVP)
| Feature | Simplification |
|---------|---------------|
| Readiness score | 3-tier indicator (Good/Moderate/Rest) |
| Health adapters | Mock adapter + stubs for HealthKit/Health Connect |
| Notifications | Simple scheduled reminders only |

### Won't-Have (Explicit Exclusions)
- Strength training programs
- Full behavioral learning
- Provider/physio sharing
- Gamification (never)
- Real backend sync
- Voice input
- Document parsing

---

## 2. Technical Architecture Summary

### Monorepo Structure (from Agent C)
```
body-recovery-app/
├── apps/
│   ├── mobile/          # Expo React Native + Expo Router
│   └── web/             # Next.js 15 (App Router)
├── packages/
│   ├── domain/          # Business logic, planning engine, safety engine
│   ├── ui/              # Tamagui cross-platform components
│   ├── data/            # Zustand stores, health adapters, persistence
│   └── copy/            # Centralized strings
├── ops/                 # Planning docs and consolidated plan
└── turbo.json           # Turborepo pipeline
```

### Technology Stack
| Layer | Choice | Rationale |
|-------|--------|-----------|
| Monorepo | pnpm + Turborepo | Best React Native support, simpler than Nx |
| Mobile | Expo Dev Build + Router | Native access with managed workflow |
| Web | Next.js 15 | SSR, API routes, Vercel integration |
| UI | Tamagui | Cross-platform, compile-time optimization |
| State | Zustand v5 | Lightweight, TypeScript-first |
| Persistence | MMKV (mobile) | 30-100x faster than AsyncStorage |
| Navigation | Expo Router | File-based, mirrors Next.js |

---

## 3. Domain Contracts (from Agent B)

### Core Types (packages/domain)

```typescript
// Body Map
interface BodyRegionStatus {
  region: BodyRegion;        // 34 anatomical regions
  sensation: SensationType;  // sharp, dull, tingling, etc.
  level: PainLevel;          // 1-10
  timestamp: Date;
}

// Day Plan
interface DayPlan {
  id: string;
  planType: PlanType;        // full, moderate, light, rest
  blocks: PlanBlock[];       // warmup, main, cooldown
  rationale: PlanRationale;  // WHY this plan
  estimatedDuration: number;
}

// Exercise
interface Exercise {
  id: string;
  name: string;
  musclesPrimary: MuscleGroup[];
  movementPattern: MovementPattern;
  equipmentRequired: Equipment[];
  contraindications: Contraindication[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
}

// Safety Result
interface SafetyCheckResult {
  safe: boolean;
  triggers: SafetyTrigger[];
  action: 'continue' | 'warn' | 'block' | 'emergency';
  userMessage: string;
}
```

### Engine Interfaces

```typescript
// Planning Engine
interface PlanningEngine {
  generateDayPlan(input: PlanGenerationInput): DayPlan;
  modifyPlan(planId: string, modification: Modification): DayPlan;
}

// Substitution Engine
interface SubstitutionEngine {
  findSubstitutes(exerciseId: string, context: Context): SubstituteExercise[];
  calculateScore(original: Exercise, candidate: Exercise): number;
}

// Safety Engine
interface SafetyEngine {
  checkInput(input: SafetyCheckInput): SafetyCheckResult;
  detectRedFlags(text: string): RedFlag[];
}
```

---

## 4. Task Graph

### Dependency Order

```
Phase 1.0: Bootstrap (Agent 1)
    │
    ├─── Phase 1.1: Domain Package (Agent 2)
    │         │
    │         ├─── Phase 1.2: UI Kit (Agent 3) ◄── depends on domain types
    │         │
    │         └─── Phase 1.3: Health Adapters (Agent 5) ◄── depends on domain types
    │
    └─── After Domain + UI complete:
              │
              ├─── Phase 1.4: Mobile App (Agent 4) ◄── depends on domain, ui, data
              │
              ├─── Phase 1.5: Web App (Agent 6) ◄── depends on domain, ui, data
              │
              └─── Phase 1.6: Seed Content (Agent 7) ◄── depends on domain
                        │
                        └─── Phase 1.7: QA Pass (Agent 8) ◄── after all apps runnable
```

### Parallelization Strategy

**Wave 1 (can run immediately):**
- Agent 1: Monorepo Bootstrap
- Agent 2: Domain Package (types + engines)
- Agent 3: UI Kit (can scaffold, awaits tokens)

**Wave 2 (after domain types exist):**
- Agent 5: Health Adapters
- Agent 7: Seed Content

**Wave 3 (after domain + ui complete):**
- Agent 4: Mobile App
- Agent 6: Web App

**Wave 4 (after apps runnable):**
- Agent 8: QA + Polish

---

## 5. Shared Package Contracts

### packages/domain exports:
```typescript
// Types
export type { BodyRegion, BodyRegionStatus, PainLevel, SensationType }
export type { DayPlan, PlanBlock, PlanType, PlannedExercise }
export type { Exercise, MovementPattern, MuscleGroup, Equipment }
export type { CheckIn, DailySignals, ReadinessScore }
export type { SafetyCheckResult, RedFlag, SafetyAction }

// Engines
export { PlanningEngine } from './engines/planning'
export { SubstitutionEngine } from './engines/substitution'
export { SafetyEngine } from './engines/safety'

// Constants
export { BODY_REGIONS, MOVEMENT_PATTERNS, MUSCLE_GROUPS }
```

### packages/ui exports:
```typescript
// Primitives
export { Button, Text, Card, Input, Sheet } from './primitives'

// Components
export { BodyMap, BodyRegion } from './components/BodyMap'
export { ExerciseCard, SetLogger } from './components/ExerciseCard'
export { ReadinessRing } from './components/ReadinessRing'
export { ProgressChart } from './components/ProgressChart'
export { Banner, Toast } from './components/Feedback'

// Theme
export { config as tamaguiConfig } from './theme'
export { useReducedMotion, useTheme } from './hooks'
```

### packages/data exports:
```typescript
// Stores
export { useWorkoutStore } from './stores/workout'
export { useBodyMapStore } from './stores/bodyMap'
export { useHealthStore } from './stores/health'
export { useSettingsStore } from './stores/settings'

// Health Adapters
export type { HealthAdapter } from './adapters/health'
export { MockHealthAdapter } from './adapters/health/mock'
export { createHealthAdapter } from './adapters/health'

// Storage
export type { StorageAdapter } from './storage'
```

### packages/copy exports:
```typescript
export { t } from './i18n'
export { copy } from './strings'
export type { CopyKey } from './types'
```

---

## 6. Definition of Done Checklist

### Repository & Tooling
- [ ] pnpm workspaces configured
- [ ] Turborepo pipeline working (`pnpm build`, `pnpm dev`, `pnpm test`)
- [ ] ESLint + Prettier configured
- [ ] TypeScript strict mode across all packages
- [ ] Husky pre-commit hooks set up

### packages/domain
- [ ] All domain types exported and documented
- [ ] PlanningEngine generates valid DayPlans
- [ ] SubstitutionEngine ranks substitutes correctly
- [ ] SafetyEngine detects red-flag keywords
- [ ] Jest tests passing (>80% coverage for engines)

### packages/ui
- [ ] Design tokens defined (colors, spacing, radii)
- [ ] Core primitives working (Button, Text, Card, Input, Sheet)
- [ ] BodyMap component renders 34 regions with tap handling
- [ ] ExerciseCard with set logging and swap gesture
- [ ] Dark mode working via Tamagui themes
- [ ] `useReducedMotion` hook working

### packages/data
- [ ] Zustand stores for workout, body map, health, settings
- [ ] MockHealthAdapter returns realistic fake data
- [ ] MMKV persistence working on mobile
- [ ] localStorage persistence working on web
- [ ] HealthKit adapter stub (TODO comments for real impl)
- [ ] Health Connect adapter stub (TODO comments for real impl)

### apps/mobile
- [ ] Expo Router navigation working (5 tabs)
- [ ] Onboarding flow complete
- [ ] Home screen with readiness + today's session
- [ ] Workout execution with timer, set logging, haptics
- [ ] Substitution flow (long-press to swap)
- [ ] Check-in flow updates body map
- [ ] Progress screen with pain trend chart
- [ ] Body Map screen editable
- [ ] Settings screen with preferences
- [ ] Works fully offline (demo mode)
- [ ] Haptics on key interactions

### apps/web
- [ ] Dashboard page with overview
- [ ] Body Map editor (larger, table-friendly)
- [ ] Progress page with charts
- [ ] Session history browsable
- [ ] Settings page
- [ ] Uses shared packages/domain + packages/ui

### Content
- [ ] Exercise library JSON (~40 exercises)
- [ ] Each exercise: regions, patterns, cues, contraindications
- [ ] Demo profiles (ACL rehab, low back, shoulder)
- [ ] Planner correctly uses library

### Safety & Compliance
- [ ] Disclaimers in onboarding, session start, settings
- [ ] Red-flag keywords trigger appropriate warnings
- [ ] No prohibited medical terms in copy
- [ ] Category 1 (emergency) blocks continuation
- [ ] Category 2 (professional) shows recommendation

### QA & Polish
- [ ] All screens have loading states
- [ ] All screens have empty states
- [ ] Error states handled gracefully
- [ ] Dark mode looks good everywhere
- [ ] Reduced motion mode works
- [ ] No console errors in development
- [ ] README explains how to run both apps
- [ ] README explains where to add backend later

---

## 7. Open Questions for Post-MVP

1. **Backend Integration**: Where does sync logic live? API contract TBD.
2. **Real Health Adapters**: HealthKit/Health Connect need dev builds + testing.
3. **AI Enhancement**: Could Claude improve rationale generation?
4. **Watch Companion**: Expo watch support is limited - evaluate later.
5. **Intensity Calibration**: How to calibrate without baseline assessment?

---

## 8. Agent Assignments

| Agent | Focus Area | Key Deliverables |
|-------|-----------|------------------|
| **Agent 1** | Monorepo Bootstrap | Repo structure, turbo config, lint/test setup |
| **Agent 2** | Domain Package | Types, planning engine, substitution engine, safety engine, tests |
| **Agent 3** | UI Kit | Tokens, primitives, components, dark mode, reduce motion |
| **Agent 4** | Mobile App | All screens, navigation, persistence, haptics, offline |
| **Agent 5** | Health Adapters | Interface, mock adapter, stubs for real adapters |
| **Agent 6** | Web App | Dashboard, body map, progress, history, responsive |
| **Agent 7** | Seed Content | Exercise library JSON, demo profiles |
| **Agent 8** | QA & Polish | Bug fixes, empty states, loading states, final checks |

---

## 9. Success Criteria

The MVP is complete when:

1. `pnpm dev:mobile` runs Expo and shows a working app
2. `pnpm dev:web` runs Next.js and shows a working dashboard
3. Demo mode works without health permissions
4. User can complete: onboarding → check-in → session → substitution → progress review
5. Plans update based on check-in data
6. Web can edit Body Map and changes reflect in plans
7. Tests pass for planning/substitution/safety engines
8. All disclaimers and safety warnings are in place
9. `/ops` contains complete planning trail
10. README is clear and actionable

---

*End of Consolidated Build Plan*
