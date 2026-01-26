# Movement & Recovery Companion - Technical Architecture & Monorepo Design

**Document Version:** 1.0
**Author:** Agent C - Technical Architecture
**Date:** January 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Monorepo Tool Selection](#2-monorepo-tool-selection)
3. [Folder Structure](#3-folder-structure)
4. [Build Scripts and Configuration](#4-build-scripts-and-configuration)
5. [Mobile Stack Decisions](#5-mobile-stack-decisions)
6. [Web Stack Decisions](#6-web-stack-decisions)
7. [Shared UI Approach](#7-shared-ui-approach)
8. [Implementation Checklist](#8-implementation-checklist)

---

## 1. Executive Summary

This document defines the complete technical architecture for a cross-platform movement and recovery companion application. The architecture enables:

- **Code sharing** between mobile (iOS/Android) and web platforms
- **Consistent developer experience** across all packages
- **Efficient builds** with intelligent caching and parallelization
- **Type safety** throughout the entire codebase
- **Scalable team development** with clear package boundaries

### Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monorepo Tool | pnpm + Turborepo | Superior caching, simpler mental model, excellent React Native support |
| Mobile Framework | Expo (Development Build) | Native module access with managed workflow benefits |
| Web Framework | Next.js 15 (App Router) | SSR, shared React code, excellent Vercel integration |
| Shared UI | Tamagui | Cross-platform primitives, excellent performance, theming built-in |
| State Management | Zustand | Lightweight, TypeScript-first, works on all platforms |
| Persistence | MMKV (mobile) / localStorage (web) | Platform-optimized with shared abstraction |
| Navigation | Expo Router | File-based routing, deep linking, shared patterns with Next.js |

---

## 2. Monorepo Tool Selection

### 2.1 Evaluation: pnpm + Turborepo vs Nx

#### Criteria Analysis

| Criterion | pnpm + Turborepo | Nx | Winner |
|-----------|------------------|-----|--------|
| **Setup Complexity** | Minimal config, works out of box | Heavier initial setup, more config files | pnpm + Turborepo |
| **Build Caching** | Remote caching via Vercel, local caching excellent | Nx Cloud, similar capabilities | Tie |
| **Task Orchestration** | Pipeline-based, simple to reason about | Task graph, more powerful but complex | pnpm + Turborepo |
| **Dependency Management** | pnpm native workspaces, strict by default | npm/yarn based, less strict | pnpm + Turborepo |
| **React Native Support** | Excellent, no special config needed | Good, requires more configuration | pnpm + Turborepo |
| **Learning Curve** | Low - familiar npm-like commands | Medium - proprietary CLI and concepts | pnpm + Turborepo |
| **Community/Ecosystem** | Growing rapidly, Vercel backing | Mature, large enterprise adoption | Nx |
| **IDE Integration** | Standard TypeScript tooling | Nx Console, additional tooling | Nx |
| **Bundle Size Impact** | Zero runtime overhead | Zero runtime overhead | Tie |
| **Incremental Adoption** | Easy to add to existing projects | Can be complex to retrofit | pnpm + Turborepo |

#### Recommendation: **pnpm + Turborepo**

**Justification:**

1. **Simpler Mental Model**: Turborepo's pipeline-based approach maps naturally to our build requirements. Each package defines its build/test/lint tasks, and Turborepo handles orchestration and caching.

2. **Superior Dependency Management**: pnpm's strict node_modules structure prevents phantom dependencies (packages using deps they didn't declare). This is critical for a monorepo with many shared packages.

3. **Excellent React Native Support**: Turborepo + pnpm has become the de facto standard for React Native monorepos. Metro bundler works seamlessly, and no special configuration is required for native modules.

4. **Vercel Integration**: Since the backend is deployed on Vercel, using Turborepo provides seamless remote caching and CI/CD integration at no additional cost.

5. **Lightweight**: No runtime dependencies, no lock-in. If we need to migrate away, the codebase structure remains valid.

### 2.2 How Caching Works

Turborepo implements content-addressable caching:

```
Input Hash = hash(
  source files,
  dependencies,
  environment variables,
  task configuration
)

Cache Key = {workspace}#{task}#{inputHash}
```

**Local Caching:**
- Stored in `node_modules/.cache/turbo`
- Persists between builds on same machine
- Instant restoration of unchanged packages

**Remote Caching (Vercel):**
- Team-wide cache sharing
- CI/CD cache persistence
- Configurable via `TURBO_TOKEN` and `TURBO_TEAM`

```bash
# Enable remote caching
npx turbo login
npx turbo link
```

### 2.3 Task Orchestration

Turborepo builds a directed acyclic graph (DAG) of tasks:

```
packages/domain:build
    │
    ├─── packages/ui:build
    │        │
    │        └─── apps/mobile:build
    │        │
    │        └─── apps/web:build
    │
    └─── packages/data:build
             │
             └─── apps/mobile:build
             │
             └─── apps/web:build
```

**Key Features:**
- **Parallelization**: Independent tasks run concurrently
- **Dependency Ordering**: `dependsOn` ensures correct build order
- **Incremental Builds**: Only changed packages and dependents rebuild
- **Watch Mode**: `turbo watch` for development with hot reload

### 2.4 Dependency Management

pnpm workspaces provide:

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Strict Mode Benefits:**
- Packages can only access declared dependencies
- Prevents "works on my machine" issues
- Smaller node_modules via content-addressable storage
- 2-3x faster installs than npm/yarn

**Internal Package References:**
```json
{
  "dependencies": {
    "@app/domain": "workspace:*",
    "@app/ui": "workspace:*"
  }
}
```

---

## 3. Folder Structure

### 3.1 Complete Monorepo Tree

```
movement-companion/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Main CI pipeline
│   │   ├── mobile-preview.yml        # EAS Preview builds
│   │   └── web-preview.yml           # Vercel preview deployments
│   └── CODEOWNERS
│
├── .vscode/
│   ├── settings.json                 # Workspace settings
│   ├── extensions.json               # Recommended extensions
│   └── launch.json                   # Debug configurations
│
├── apps/
│   ├── mobile/                       # Expo React Native app
│   │   ├── app/                      # Expo Router pages
│   │   │   ├── (tabs)/               # Tab navigation group
│   │   │   │   ├── index.tsx         # Today tab
│   │   │   │   ├── plan.tsx          # Plan tab
│   │   │   │   ├── body.tsx          # Body tab
│   │   │   │   ├── progress.tsx      # Progress tab
│   │   │   │   └── profile.tsx       # Profile tab
│   │   │   ├── workout/
│   │   │   │   ├── [id].tsx          # Workout execution
│   │   │   │   └── summary/[id].tsx  # Post-workout summary
│   │   │   ├── onboarding/
│   │   │   │   ├── index.tsx         # Welcome
│   │   │   │   ├── health.tsx        # Health permissions
│   │   │   │   ├── focus.tsx         # User focus selection
│   │   │   │   └── first-session.tsx # First workout
│   │   │   ├── _layout.tsx           # Root layout
│   │   │   └── +not-found.tsx        # 404 handler
│   │   ├── src/
│   │   │   ├── components/           # Mobile-specific components
│   │   │   │   ├── workout/          # Workout execution UI
│   │   │   │   ├── health/           # Health data components
│   │   │   │   └── haptics/          # Haptic feedback wrappers
│   │   │   ├── hooks/                # Mobile-specific hooks
│   │   │   │   ├── useHealthKit.ts
│   │   │   │   ├── useHealthConnect.ts
│   │   │   │   ├── useHaptics.ts
│   │   │   │   └── useVoice.ts
│   │   │   ├── lib/                  # Mobile utilities
│   │   │   │   ├── storage.ts        # MMKV wrapper
│   │   │   │   ├── haptics.ts        # Haptic patterns
│   │   │   │   └── notifications.ts  # Push notification setup
│   │   │   └── providers/            # Mobile-specific providers
│   │   │       └── HealthProvider.tsx
│   │   ├── assets/                   # Images, fonts, sounds
│   │   │   ├── images/
│   │   │   ├── fonts/
│   │   │   └── sounds/
│   │   ├── app.json                  # Expo config
│   │   ├── eas.json                  # EAS Build config
│   │   ├── metro.config.js           # Metro bundler config
│   │   ├── babel.config.js
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── index.ts                  # Entry point
│   │
│   └── web/                          # Next.js web app
│       ├── app/                      # Next.js App Router
│       │   ├── (marketing)/          # Public pages
│       │   │   ├── page.tsx          # Landing page
│       │   │   ├── about/page.tsx
│       │   │   └── pricing/page.tsx
│       │   ├── (dashboard)/          # Authenticated pages
│       │   │   ├── layout.tsx        # Dashboard layout
│       │   │   ├── today/page.tsx
│       │   │   ├── plan/page.tsx
│       │   │   ├── body/page.tsx
│       │   │   ├── progress/page.tsx
│       │   │   └── settings/page.tsx
│       │   ├── api/                  # API routes
│       │   │   ├── auth/[...nextauth]/route.ts
│       │   │   ├── health/
│       │   │   ├── workouts/
│       │   │   ├── body/
│       │   │   ├── ai/
│       │   │   └── sync/
│       │   ├── layout.tsx            # Root layout
│       │   ├── globals.css
│       │   └── providers.tsx         # Client providers
│       ├── src/
│       │   ├── components/           # Web-specific components
│       │   └── hooks/                # Web-specific hooks
│       ├── public/                   # Static assets
│       ├── next.config.js
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── domain/                       # Shared business logic
│   │   ├── src/
│   │   │   ├── models/               # Domain models
│   │   │   │   ├── user.ts
│   │   │   │   ├── workout.ts
│   │   │   │   ├── exercise.ts
│   │   │   │   ├── body-model.ts
│   │   │   │   ├── injury.ts
│   │   │   │   ├── health-snapshot.ts
│   │   │   │   └── index.ts
│   │   │   ├── services/             # Business logic services
│   │   │   │   ├── readiness.ts      # Readiness calculation
│   │   │   │   ├── workout-generator.ts
│   │   │   │   ├── exercise-filter.ts
│   │   │   │   ├── progression.ts
│   │   │   │   └── index.ts
│   │   │   ├── validators/           # Validation schemas
│   │   │   │   ├── workout.ts
│   │   │   │   ├── exercise.ts
│   │   │   │   └── index.ts
│   │   │   ├── constants/            # Domain constants
│   │   │   │   ├── muscles.ts
│   │   │   │   ├── equipment.ts
│   │   │   │   ├── movement-patterns.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts              # Public API
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── ui/                           # Shared UI components
│   │   ├── src/
│   │   │   ├── primitives/           # Base components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Text.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Sheet.tsx
│   │   │   │   └── index.ts
│   │   │   ├── components/           # Composite components
│   │   │   │   ├── ReadinessRing/
│   │   │   │   │   ├── ReadinessRing.tsx
│   │   │   │   │   ├── ReadinessSegment.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── BodyMap/
│   │   │   │   │   ├── BodyMap.tsx
│   │   │   │   │   ├── BodyRegion.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── ExerciseCard/
│   │   │   │   │   ├── ExerciseCard.tsx
│   │   │   │   │   ├── SetLogger.tsx
│   │   │   │   │   ├── ExerciseDemo.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── WeightDial/
│   │   │   │   │   ├── WeightDial.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Timeline/
│   │   │   │   ├── ProgressChart/
│   │   │   │   └── index.ts
│   │   │   ├── theme/
│   │   │   │   ├── tokens.ts         # Design tokens
│   │   │   │   ├── tamagui.config.ts # Tamagui configuration
│   │   │   │   ├── fonts.ts          # Font configuration
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useTheme.ts
│   │   │   │   ├── useReducedMotion.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts              # Public API
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── data/                         # Data layer and adapters
│   │   ├── src/
│   │   │   ├── api/                  # API client
│   │   │   │   ├── client.ts         # Base fetch client
│   │   │   │   ├── endpoints.ts      # Typed endpoints
│   │   │   │   └── index.ts
│   │   │   ├── stores/               # Zustand stores
│   │   │   │   ├── auth.ts
│   │   │   │   ├── workout.ts
│   │   │   │   ├── body-model.ts
│   │   │   │   ├── health.ts
│   │   │   │   ├── sync.ts
│   │   │   │   └── index.ts
│   │   │   ├── queries/              # TanStack Query hooks
│   │   │   │   ├── useWorkouts.ts
│   │   │   │   ├── useExercises.ts
│   │   │   │   ├── useHealth.ts
│   │   │   │   └── index.ts
│   │   │   ├── storage/              # Storage adapters
│   │   │   │   ├── interface.ts      # Storage interface
│   │   │   │   ├── mmkv.ts           # MMKV implementation
│   │   │   │   ├── localStorage.ts   # Web localStorage
│   │   │   │   └── index.ts
│   │   │   ├── sync/                 # Offline sync logic
│   │   │   │   ├── queue.ts
│   │   │   │   ├── resolver.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts              # Public API
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── copy/                         # Centralized strings
│   │   ├── src/
│   │   │   ├── en/                   # English strings
│   │   │   │   ├── common.ts
│   │   │   │   ├── onboarding.ts
│   │   │   │   ├── workout.ts
│   │   │   │   ├── body.ts
│   │   │   │   ├── progress.ts
│   │   │   │   ├── settings.ts
│   │   │   │   ├── errors.ts
│   │   │   │   └── index.ts
│   │   │   ├── types.ts              # String type definitions
│   │   │   ├── i18n.ts               # i18n configuration
│   │   │   └── index.ts              # Public API
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── config/                       # Shared configurations
│   │   ├── eslint/                   # ESLint presets
│   │   │   ├── base.js
│   │   │   ├── react.js
│   │   │   ├── next.js
│   │   │   └── package.json
│   │   ├── typescript/               # TypeScript presets
│   │   │   ├── base.json
│   │   │   ├── react-native.json
│   │   │   ├── next.json
│   │   │   ├── library.json
│   │   │   └── package.json
│   │   └── prettier/                 # Prettier preset
│   │       ├── index.js
│   │       └── package.json
│   │
│   └── types/                        # Shared type definitions
│       ├── src/
│       │   ├── api.ts                # API response types
│       │   ├── health.ts             # Health data types
│       │   ├── navigation.ts         # Navigation types
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
│
├── tools/                            # Build and dev tools
│   ├── scripts/
│   │   ├── setup.sh                  # Initial setup script
│   │   ├── clean.sh                  # Clean build artifacts
│   │   └── sync-versions.js          # Sync package versions
│   └── generators/                   # Code generators
│       ├── component/
│       └── package/
│
├── docs/                             # Documentation
│   ├── architecture.md
│   ├── setup.md
│   └── conventions.md
│
├── .gitignore
├── .npmrc                            # pnpm configuration
├── .prettierrc
├── .eslintrc.js
├── turbo.json                        # Turborepo configuration
├── pnpm-workspace.yaml               # pnpm workspace config
├── pnpm-lock.yaml
├── package.json                      # Root package.json
└── tsconfig.json                     # Root TypeScript config
```

### 3.2 Package Naming Convention

All internal packages use the `@app/` scope:

```
@app/domain    - Business logic
@app/ui        - Shared UI components
@app/data      - Data layer
@app/copy      - Strings and i18n
@app/types     - Shared types
@app/config-*  - Configuration packages
```

### 3.3 Dependency Graph

```
                    ┌─────────────┐
                    │  @app/types │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
   ┌───────────┐    ┌───────────┐    ┌───────────┐
   │@app/domain│    │ @app/copy │    │ @app/data │
   └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
         │                │                │
         │                ▼                │
         │          ┌───────────┐          │
         └─────────►│  @app/ui  │◄─────────┘
                    └─────┬─────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
            ▼                           ▼
     ┌────────────┐              ┌────────────┐
     │ apps/mobile│              │  apps/web  │
     └────────────┘              └────────────┘
```

---

## 4. Build Scripts and Configuration

### 4.1 Root package.json

```json
{
  "name": "movement-companion",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  },
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "dev:mobile": "turbo run dev --filter=@app/mobile",
    "dev:web": "turbo run dev --filter=@app/web",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "test": "turbo run test",
    "test:watch": "turbo run test:watch",
    "test:coverage": "turbo run test:coverage",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean && rm -rf node_modules",
    "clean:cache": "turbo daemon clean",
    "prepare": "husky install",
    "preinstall": "npx only-allow pnpm"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.2.0",
    "prettier": "^3.2.0",
    "turbo": "^2.3.0",
    "typescript": "^5.4.0"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

### 4.2 turbo.json Pipeline Configuration

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env*"],
  "globalEnv": ["NODE_ENV", "VERCEL_URL"],
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [
        "dist/**",
        ".next/**",
        "!.next/cache/**"
      ],
      "env": [
        "NEXT_PUBLIC_*",
        "EXPO_PUBLIC_*"
      ]
    },
    "dev": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"],
      "outputs": [],
      "cache": true
    },
    "lint:fix": {
      "dependsOn": ["^build"],
      "outputs": [],
      "cache": false
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "env": ["CI", "NODE_ENV"]
    },
    "test:watch": {
      "cache": false,
      "persistent": true
    },
    "test:coverage": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

### 4.3 Package-Level Scripts

#### apps/mobile/package.json

```json
{
  "name": "@app/mobile",
  "version": "1.0.0",
  "private": true,
  "main": "index.ts",
  "scripts": {
    "dev": "expo start --dev-client",
    "dev:ios": "expo run:ios",
    "dev:android": "expo run:android",
    "build": "expo export",
    "build:ios": "eas build --platform ios",
    "build:android": "eas build --platform android",
    "build:preview": "eas build --profile preview",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf .expo dist node_modules/.cache"
  },
  "dependencies": {
    "@app/data": "workspace:*",
    "@app/domain": "workspace:*",
    "@app/ui": "workspace:*",
    "@app/copy": "workspace:*",
    "@app/types": "workspace:*",
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-status-bar": "~2.0.0",
    "expo-haptics": "~14.0.0",
    "expo-notifications": "~0.29.0",
    "expo-camera": "~16.0.0",
    "expo-location": "~18.0.0",
    "expo-background-fetch": "~13.0.0",
    "react": "18.3.1",
    "react-native": "0.76.0",
    "react-native-mmkv": "^3.1.0",
    "react-native-health": "^1.18.0",
    "react-native-health-connect": "^3.1.0",
    "react-native-reanimated": "~3.16.0",
    "react-native-gesture-handler": "~2.20.0",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.1.0",
    "@tanstack/react-query": "^5.60.0",
    "zustand": "^5.0.0",
    "tamagui": "^1.118.0",
    "@tamagui/config": "^1.118.0"
  },
  "devDependencies": {
    "@app/config-eslint": "workspace:*",
    "@app/config-typescript": "workspace:*",
    "@babel/core": "^7.25.0",
    "@types/react": "~18.3.0",
    "jest": "^29.7.0",
    "jest-expo": "~52.0.0",
    "@testing-library/react-native": "^12.8.0",
    "typescript": "^5.4.0"
  }
}
```

#### apps/web/package.json

```json
{
  "name": "@app/web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf .next out node_modules/.cache"
  },
  "dependencies": {
    "@app/data": "workspace:*",
    "@app/domain": "workspace:*",
    "@app/ui": "workspace:*",
    "@app/copy": "workspace:*",
    "@app/types": "workspace:*",
    "next": "15.1.0",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "@tanstack/react-query": "^5.60.0",
    "zustand": "^5.0.0",
    "tamagui": "^1.118.0",
    "@tamagui/next-plugin": "^1.118.0",
    "next-auth": "^5.0.0",
    "@vercel/postgres": "^0.10.0",
    "@vercel/kv": "^3.0.0",
    "@vercel/blob": "^0.27.0",
    "ai": "^4.0.0",
    "@ai-sdk/anthropic": "^1.0.0"
  },
  "devDependencies": {
    "@app/config-eslint": "workspace:*",
    "@app/config-typescript": "workspace:*",
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "vitest": "^2.1.0",
    "@vitejs/plugin-react": "^4.3.0",
    "@testing-library/react": "^16.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "typescript": "^5.4.0"
  }
}
```

#### packages/domain/package.json

```json
{
  "name": "@app/domain",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts",
      "require": "./src/index.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@app/types": "workspace:*",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@app/config-eslint": "workspace:*",
    "@app/config-typescript": "workspace:*",
    "vitest": "^2.1.0",
    "typescript": "^5.4.0"
  }
}
```

### 4.4 ESLint Configuration

#### packages/config/eslint/base.js

```javascript
/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier"
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module"
  },
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true
      }
    }
  },
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports" }
    ],
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling"],
          "index"
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc" }
      }
    ],
    "import/no-duplicates": "error"
  },
  ignorePatterns: [
    "node_modules",
    "dist",
    ".next",
    ".expo",
    "coverage"
  ]
};
```

#### packages/config/eslint/react.js

```javascript
/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "./base.js",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  plugins: ["react", "react-hooks", "jsx-a11y"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: "detect"
    }
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/display-name": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "jsx-a11y/anchor-is-valid": [
      "error",
      {
        components: ["Link"],
        specialLink: ["hrefLeft", "hrefRight"],
        aspects: ["invalidHref", "preferButton"]
      }
    ]
  }
};
```

### 4.5 TypeScript Configuration

#### packages/config/typescript/base.json

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noEmit": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "composite": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  },
  "exclude": ["node_modules", "dist"]
}
```

#### packages/config/typescript/react-native.json

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2022"],
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "allowJs": true,
    "noEmit": true,
    "types": ["react-native", "jest"]
  }
}
```

#### packages/config/typescript/next.json

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowJs": true,
    "noEmit": true,
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "types": ["node"]
  }
}
```

### 4.6 Prettier Configuration

#### .prettierrc

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 4.7 Test Setup

#### Vitest Configuration (packages and web)

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  },
  resolve: {
    alias: {
      '@': './src'
    }
  }
});
```

#### Jest Configuration (mobile)

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|tamagui|@tamagui/.*)'
  ],
  setupFilesAfterEnv: ['@testing-library/react-native/extend-expect'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/']
};
```

---

## 5. Mobile Stack Decisions

### 5.1 Expo: Managed vs Development Build

**Decision: Expo Development Build (with Continuous Native Generation)**

#### Comparison

| Aspect | Expo Go (Managed) | Development Build | Bare Workflow |
|--------|-------------------|-------------------|---------------|
| Native Module Access | Limited | Full | Full |
| Custom Native Code | No | Yes (via config plugins) | Yes (direct) |
| Build Complexity | None | Low (EAS) | High |
| Update Speed | Instant OTA | OTA for JS, rebuild for native | Full rebuild |
| HealthKit/Health Connect | No | Yes | Yes |
| Background Fetch | Limited | Yes | Yes |
| Custom Haptics | No | Yes | Yes |

#### Justification

1. **Native Module Requirements**: The app requires HealthKit (iOS), Health Connect (Android), background fetch, custom haptics, and camera access. These need native code that Expo Go cannot support.

2. **Continuous Native Generation (CNG)**: With Expo's prebuild system, we maintain the benefits of managed workflow while having full native access:
   ```bash
   # Native folders are generated, not committed
   npx expo prebuild --clean
   ```

3. **EAS Build**: Expo Application Services handles native builds in the cloud:
   - Development builds for testing
   - Preview builds for stakeholder review
   - Production builds for app stores

4. **Config Plugins**: Native configuration is declarative in `app.json`:
   ```json
   {
     "expo": {
       "plugins": [
         "expo-router",
         ["expo-camera", { "cameraPermission": "..." }],
         ["expo-location", { "locationAlwaysAndWhenInUsePermission": "..." }],
         ["react-native-health", { "permissions": [...] }]
       ]
     }
   }
   ```

5. **Future-Proof**: Easy to eject to bare workflow if needed, but typically unnecessary with modern Expo.

### 5.2 State Management: Zustand

**Decision: Zustand v5**

#### Why Zustand Over Alternatives

| Criteria | Zustand | Redux Toolkit | Jotai | MobX |
|----------|---------|---------------|-------|------|
| Bundle Size | 1.2KB | 10KB+ | 2.4KB | 16KB |
| Learning Curve | Low | Medium | Low | Medium |
| TypeScript | Excellent | Good | Excellent | Good |
| React Native | Excellent | Good | Good | Good |
| Persistence | Easy (middleware) | Complex | Medium | Medium |
| DevTools | Yes | Excellent | Limited | Yes |

#### Implementation Pattern

```typescript
// packages/data/src/stores/workout.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StorageAdapter } from '../storage';

interface WorkoutState {
  activeWorkout: Workout | null;
  completedSets: CompletedSet[];

  // Actions
  startWorkout: (workout: Workout) => void;
  completeSet: (exerciseId: string, set: SetData) => void;
  skipExercise: (exerciseId: string, reason: string) => void;
  endWorkout: () => void;
}

export const createWorkoutStore = (storage: StorageAdapter) =>
  create<WorkoutState>()(
    persist(
      (set, get) => ({
        activeWorkout: null,
        completedSets: [],

        startWorkout: (workout) => set({
          activeWorkout: workout,
          completedSets: []
        }),

        completeSet: (exerciseId, setData) => set((state) => ({
          completedSets: [...state.completedSets, { exerciseId, ...setData }]
        })),

        skipExercise: (exerciseId, reason) => {
          // Implementation
        },

        endWorkout: () => set({
          activeWorkout: null,
          completedSets: []
        }),
      }),
      {
        name: 'workout-storage',
        storage: createJSONStorage(() => storage),
      }
    )
  );
```

### 5.3 Persistence: MMKV vs AsyncStorage

**Decision: MMKV for Mobile**

#### Comparison

| Metric | MMKV | AsyncStorage |
|--------|------|--------------|
| Read Speed | ~10,000 ops/sec | ~100 ops/sec |
| Write Speed | ~10,000 ops/sec | ~100 ops/sec |
| Synchronous API | Yes | No (async only) |
| Encryption | Built-in | Manual |
| Max Value Size | 2GB | ~6MB |
| React Native New Arch | Yes (Turbo Module) | Yes |

#### Justification

1. **Performance**: MMKV is 30-100x faster than AsyncStorage. Critical for workout state that updates frequently.

2. **Synchronous Reads**: Initial app state can be read synchronously, eliminating loading states for cached data.

3. **Reliability**: Memory-mapped file with CRC checksum. No corruption on crash.

4. **Encryption**: Built-in AES encryption for sensitive health data:
   ```typescript
   import { MMKV } from 'react-native-mmkv';

   const secureStorage = new MMKV({
     id: 'health-data',
     encryptionKey: 'user-encryption-key'
   });
   ```

### 5.4 Navigation: Expo Router vs React Navigation

**Decision: Expo Router**

#### Comparison

| Feature | Expo Router | React Navigation |
|---------|-------------|------------------|
| Routing Model | File-based | Configuration-based |
| Deep Linking | Automatic | Manual configuration |
| TypeScript | Excellent (generated types) | Good |
| Learning Curve | Low (Next.js-like) | Medium |
| Bundle Splitting | Automatic | Manual |
| Web Support | Native URLs | Hash-based |

#### Justification

1. **File-Based Routing**: Mirrors Next.js patterns, reducing cognitive load for developers working on both platforms:
   ```
   app/
   ├── (tabs)/
   │   ├── index.tsx      →  /
   │   ├── plan.tsx       →  /plan
   │   └── body.tsx       →  /body
   ├── workout/
   │   └── [id].tsx       →  /workout/123
   └── _layout.tsx
   ```

2. **Automatic Deep Linking**: Every route is automatically deep-linkable:
   ```typescript
   // Automatically generates scheme://workout/123
   <Link href="/workout/123">Start Workout</Link>
   ```

3. **Type-Safe Navigation**: Route types are generated from file structure:
   ```typescript
   import { useLocalSearchParams } from 'expo-router';

   export default function WorkoutScreen() {
     const { id } = useLocalSearchParams<{ id: string }>();
     // id is typed
   }
   ```

4. **Shared Mental Model**: Same routing patterns as Next.js web app.

### 5.5 Mobile Configuration Summary

#### apps/mobile/app.json

```json
{
  "expo": {
    "name": "Movement Companion",
    "slug": "movement-companion",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "movement",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0A0A0A"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.example.movementcompanion",
      "config": {
        "usesNonExemptEncryption": false
      },
      "infoPlist": {
        "NSHealthShareUsageDescription": "We use your health data to personalize your training and recovery recommendations.",
        "NSHealthUpdateUsageDescription": "We log your workouts to Apple Health.",
        "NSCameraUsageDescription": "Used to scan medical documents.",
        "NSMicrophoneUsageDescription": "Used for voice commands during workouts.",
        "NSLocationWhenInUseUsageDescription": "Used to detect when you arrive at the gym.",
        "UIBackgroundModes": ["fetch", "processing"]
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#0A0A0A"
      },
      "package": "com.example.movementcompanion",
      "permissions": [
        "android.permission.health.READ_HEART_RATE",
        "android.permission.health.READ_STEPS",
        "android.permission.health.READ_SLEEP",
        "android.permission.health.WRITE_EXERCISE",
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.POST_NOTIFICATIONS"
      ]
    },
    "plugins": [
      "expo-router",
      [
        "expo-camera",
        {
          "cameraPermission": "Allow access to scan medical documents."
        }
      ],
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Allow access to detect gym arrival."
        }
      ],
      "expo-haptics",
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#3B82F6"
        }
      ],
      [
        "expo-background-fetch",
        {
          "minimumInterval": 900
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

#### apps/mobile/eas.json

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "channel": "preview"
    },
    "production": {
      "channel": "production"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "your-app-id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-services.json",
        "track": "internal"
      }
    }
  }
}
```

---

## 6. Web Stack Decisions

### 6.1 Framework: Vite vs Next.js

**Decision: Next.js 15 (App Router)**

#### Comparison

| Criteria | Next.js 15 | Vite + React |
|----------|------------|--------------|
| SSR/SSG | Built-in | Manual (SSR framework needed) |
| API Routes | Yes | No (separate backend) |
| Vercel Integration | Native | Good |
| Code Sharing (RN) | Excellent (RSC boundaries) | Good |
| Bundle Size | Optimized per-route | Single bundle (manual splitting) |
| Caching | Full-stack caching | Client-side only |
| Auth Integration | NextAuth built-in | Manual |

#### Justification

1. **Backend Integration**: The app requires API routes for AI processing, health sync, and document parsing. Next.js provides these without a separate backend.

2. **Vercel Platform**: Native integration with Vercel Postgres, KV, Blob, and Cron jobs as specified in the technical addendum.

3. **React Server Components**: Enables efficient data fetching patterns and reduces client bundle size:
   ```typescript
   // Server Component - zero client JS
   async function WorkoutList({ userId }: { userId: string }) {
     const workouts = await getWorkouts(userId);
     return <WorkoutGrid workouts={workouts} />;
   }
   ```

4. **Shared Code Patterns**: App Router's file-based routing mirrors Expo Router, creating consistent patterns.

5. **AI SDK Integration**: Vercel AI SDK provides streaming responses for Claude integration:
   ```typescript
   import { anthropic } from '@ai-sdk/anthropic';
   import { streamText } from 'ai';

   export async function POST(req: Request) {
     const { messages } = await req.json();
     const result = await streamText({
       model: anthropic('claude-sonnet-4-20250514'),
       messages,
     });
     return result.toDataStreamResponse();
   }
   ```

### 6.2 How Web Shares Code with Mobile

#### Shared Package Strategy

```
packages/domain  →  Both import directly (pure TypeScript)
packages/data    →  Both import (platform-specific storage adapters)
packages/ui      →  Both import (Tamagui cross-platform)
packages/copy    →  Both import (pure TypeScript)
packages/types   →  Both import (pure TypeScript)
```

#### Platform-Specific Implementations

```typescript
// packages/data/src/storage/index.ts
export interface StorageAdapter {
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
}

// packages/data/src/storage/mmkv.ts (mobile)
import { MMKV } from 'react-native-mmkv';

export function createMMKVStorage(): StorageAdapter {
  const storage = new MMKV();
  return {
    get: (key) => storage.getString(key) ?? null,
    set: (key, value) => storage.set(key, value),
    delete: (key) => storage.delete(key),
  };
}

// packages/data/src/storage/localStorage.ts (web)
export function createLocalStorage(): StorageAdapter {
  return {
    get: (key) => localStorage.getItem(key),
    set: (key, value) => localStorage.setItem(key, value),
    delete: (key) => localStorage.removeItem(key),
  };
}
```

#### Conditional Imports in Apps

```typescript
// apps/mobile/src/providers/DataProvider.tsx
import { createMMKVStorage } from '@app/data/storage/mmkv';

const storage = createMMKVStorage();

// apps/web/src/providers/DataProvider.tsx
import { createLocalStorage } from '@app/data/storage/localStorage';

const storage = createLocalStorage();
```

### 6.3 Build and Deployment

#### Next.js Configuration

```javascript
// apps/web/next.config.js
const { withTamagui } = require('@tamagui/next-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@app/ui',
    '@app/domain',
    '@app/data',
    '@app/copy',
    '@app/types',
    'tamagui',
    '@tamagui/config',
  ],
  experimental: {
    optimizePackageImports: ['@app/ui', 'tamagui'],
  },
  images: {
    domains: ['blob.vercel-storage.com'],
  },
};

module.exports = withTamagui({
  config: './tamagui.config.ts',
  components: ['tamagui', '@app/ui'],
  importsWhitelist: ['constants.js', 'colors.js'],
  outputCSS: process.env.NODE_ENV === 'production' ? './public/tamagui.css' : null,
  disableExtraction: process.env.NODE_ENV === 'development',
})(nextConfig);
```

#### Vercel Deployment

```json
// apps/web/vercel.json
{
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@app/web",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "crons": [
    {
      "path": "/api/cron/daily-readiness",
      "schedule": "0 5 * * *"
    },
    {
      "path": "/api/cron/health-sync",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/weekly-summary",
      "schedule": "0 9 * * 0"
    }
  ]
}
```

---

## 7. Shared UI Approach

### 7.1 Evaluation: Tamagui vs React Native Primitives + react-native-web

#### Comparison

| Criteria | Tamagui | RN + react-native-web |
|----------|---------|----------------------|
| Performance | Excellent (compile-time) | Good |
| Bundle Size | Smaller (extraction) | Larger |
| Theming | Built-in, powerful | Manual |
| Dark Mode | First-class | Manual |
| Animations | Reanimated integration | Reanimated |
| Web Styling | Optimized CSS output | Runtime styles |
| Learning Curve | Medium | Low |
| Community | Growing | Large |

#### Decision: **Tamagui**

#### Justification

1. **Compile-Time Optimization**: Tamagui extracts styles at build time, producing optimized CSS for web and minimal runtime overhead for native:
   ```typescript
   // This is extracted at build time
   const Button = styled(Stack, {
     backgroundColor: '$blue10',
     padding: '$4',
     borderRadius: '$4',

     variants: {
       size: {
         small: { padding: '$2' },
         large: { padding: '$6' },
       },
     },
   });
   ```

2. **Design Token System**: Built-in theme tokens that work across platforms:
   ```typescript
   const tokens = createTokens({
     color: {
       background: '#0A0A0A',
       surface: '#1A1A1A',
       primary: '#3B82F6',
       text: '#FFFFFF',
       textMuted: '#9CA3AF',
     },
     space: {
       1: 4,
       2: 8,
       3: 12,
       4: 16,
       // ...
     },
     radius: {
       1: 4,
       2: 8,
       3: 12,
       4: 16,
     },
   });
   ```

3. **Dark Mode**: First-class support with `useTheme` and theme switching:
   ```typescript
   const themes = {
     light: createTheme({
       background: '#F9FAFB',
       color: '#111827',
     }),
     dark: createTheme({
       background: '#0A0A0A',
       color: '#FFFFFF',
     }),
   };
   ```

4. **Animation Support**: Integrates with Reanimated for performant animations:
   ```typescript
   <Button
     animation="quick"
     pressStyle={{ scale: 0.95, opacity: 0.8 }}
   >
     Press Me
   </Button>
   ```

5. **Media Queries**: Works on both platforms:
   ```typescript
   const ResponsiveText = styled(Text, {
     fontSize: 16,

     $gtMd: {
       fontSize: 20,
     },
   });
   ```

### 7.2 Platform-Specific Code Handling

#### Strategy 1: File Extensions

```
components/
├── HealthConnect.tsx        # Shared interface
├── HealthConnect.native.tsx # Mobile implementation
└── HealthConnect.web.tsx    # Web implementation
```

Metro (mobile) and webpack (web) automatically resolve the correct file.

#### Strategy 2: Platform Detection

```typescript
import { Platform } from 'react-native';

export function HapticButton({ onPress, children }: Props) {
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      // Trigger haptic on mobile only
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return <Button onPress={handlePress}>{children}</Button>;
}
```

#### Strategy 3: Conditional Components

```typescript
// packages/ui/src/components/WeightDial/index.tsx
import { Platform } from 'react-native';

const WeightDialImpl = Platform.select({
  native: () => require('./WeightDial.native').WeightDial,
  web: () => require('./WeightDial.web').WeightDial,
})!();

export const WeightDial = WeightDialImpl;
```

### 7.3 Dark Mode Strategy

#### Theme Configuration

```typescript
// packages/ui/src/theme/tamagui.config.ts
import { createTamagui, createTokens } from 'tamagui';

const tokens = createTokens({
  color: {
    // Semantic tokens (resolved by theme)
    background: '#0A0A0A',
    surface: '#1A1A1A',
    card: '#242424',
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    textPrimary: '#FFFFFF',
    textSecondary: '#9CA3AF',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    border: '#374151',
  },
  // ... other tokens
});

const lightTheme = {
  background: '#F9FAFB',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  border: '#E5E7EB',
};

const darkTheme = {
  background: '#0A0A0A',
  surface: '#1A1A1A',
  card: '#242424',
  primary: '#3B82F6',
  primaryHover: '#2563EB',
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#374151',
};

export const config = createTamagui({
  tokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  defaultTheme: 'dark',
  // ... rest of config
});
```

#### Theme Provider Setup

```typescript
// apps/mobile/app/_layout.tsx
import { TamaguiProvider, Theme } from 'tamagui';
import { useColorScheme } from 'react-native';
import { config } from '@app/ui/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider config={config}>
      <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
        <Slot />
      </Theme>
    </TamaguiProvider>
  );
}
```

#### Using Theme Values

```typescript
import { styled, useTheme } from 'tamagui';

// Styled component - automatic theme access
const Card = styled(Stack, {
  backgroundColor: '$card',
  borderColor: '$border',
  borderWidth: 1,
  borderRadius: '$3',
  padding: '$4',
});

// Hook access
function DynamicComponent() {
  const theme = useTheme();

  return (
    <View style={{ backgroundColor: theme.background.val }}>
      {/* ... */}
    </View>
  );
}
```

### 7.4 Reduce Motion Support

#### Configuration

```typescript
// packages/ui/src/hooks/useReducedMotion.ts
import { useReducedMotion as useRNReducedMotion } from 'react-native-reanimated';
import { useMediaQuery } from 'tamagui';

export function useReducedMotion() {
  // Native
  if (typeof window === 'undefined') {
    return useRNReducedMotion();
  }

  // Web
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
```

#### Animation Configuration

```typescript
// packages/ui/src/theme/animations.ts
import { createAnimations } from '@tamagui/animations-react-native';

export const animations = createAnimations({
  quick: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  medium: {
    type: 'spring',
    damping: 15,
    mass: 1,
    stiffness: 150,
  },
  slow: {
    type: 'spring',
    damping: 15,
    mass: 1,
    stiffness: 100,
  },
  // Reduced motion alternatives
  quickReduced: {
    type: 'timing',
    duration: 0,
  },
  mediumReduced: {
    type: 'timing',
    duration: 100,
  },
});
```

#### Usage in Components

```typescript
import { useReducedMotion } from '@app/ui/hooks';

function AnimatedCard({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();

  return (
    <Card
      animation={reducedMotion ? 'quickReduced' : 'quick'}
      enterStyle={reducedMotion ? undefined : { opacity: 0, y: 10 }}
    >
      {children}
    </Card>
  );
}
```

### 7.5 Component Architecture Example

```typescript
// packages/ui/src/components/ExerciseCard/ExerciseCard.tsx
import { styled, Stack, Text, XStack, YStack, useTheme } from 'tamagui';
import { useReducedMotion } from '../../hooks';
import type { Exercise, SetData } from '@app/domain';

interface ExerciseCardProps {
  exercise: Exercise;
  prescription: { weight: number; reps: number; sets: number };
  completedSets: SetData[];
  status: 'upcoming' | 'active' | 'completed' | 'skipped';
  onComplete: (set: SetData) => void;
  onSwap: () => void;
  onSkip: () => void;
}

const CardContainer = styled(Stack, {
  backgroundColor: '$card',
  borderRadius: '$3',
  padding: '$4',
  borderWidth: 1,
  borderColor: '$border',

  variants: {
    status: {
      upcoming: {},
      active: {
        borderColor: '$primary',
        borderWidth: 2,
      },
      completed: {
        opacity: 0.7,
      },
      skipped: {
        opacity: 0.5,
      },
    },
  } as const,
});

const ExerciseName = styled(Text, {
  fontSize: 18,
  fontWeight: '600',
  color: '$textPrimary',
});

const Prescription = styled(Text, {
  fontSize: 16,
  color: '$textSecondary',
});

export function ExerciseCard({
  exercise,
  prescription,
  completedSets,
  status,
  onComplete,
  onSwap,
  onSkip,
}: ExerciseCardProps) {
  const reducedMotion = useReducedMotion();
  const theme = useTheme();

  return (
    <CardContainer
      status={status}
      animation={reducedMotion ? undefined : 'quick'}
      pressStyle={reducedMotion ? undefined : { scale: 0.98 }}
    >
      <YStack gap="$2">
        <XStack justifyContent="space-between" alignItems="center">
          <ExerciseName>{exercise.name}</ExerciseName>
          {/* Status indicator */}
        </XStack>

        <Prescription>
          {prescription.weight}kg x {prescription.reps} x {prescription.sets}
        </Prescription>

        <XStack gap="$2">
          {Array.from({ length: prescription.sets }).map((_, i) => (
            <SetIndicator
              key={i}
              completed={i < completedSets.length}
              active={status === 'active' && i === completedSets.length}
            />
          ))}
        </XStack>
      </YStack>
    </CardContainer>
  );
}

const SetIndicator = styled(Stack, {
  width: 32,
  height: 32,
  borderRadius: '$2',
  backgroundColor: '$surface',
  borderWidth: 1,
  borderColor: '$border',

  variants: {
    completed: {
      true: {
        backgroundColor: '$success',
        borderColor: '$success',
      },
    },
    active: {
      true: {
        borderColor: '$primary',
        borderWidth: 2,
      },
    },
  } as const,
});
```

---

## 8. Implementation Checklist

### Phase 1: Repository Setup

- [ ] Initialize monorepo with pnpm
- [ ] Configure turbo.json pipeline
- [ ] Set up workspace-level TypeScript configs
- [ ] Configure ESLint and Prettier
- [ ] Set up Husky pre-commit hooks
- [ ] Create package templates

### Phase 2: Core Packages

- [ ] Set up `@app/types` with shared interfaces
- [ ] Set up `@app/domain` with business logic
- [ ] Set up `@app/copy` with string resources
- [ ] Set up `@app/data` with stores and API client

### Phase 3: UI Package

- [ ] Configure Tamagui with design tokens
- [ ] Create primitive components (Button, Text, Card, etc.)
- [ ] Implement theme system with dark mode
- [ ] Add reduce motion support
- [ ] Create composite components (ReadinessRing, BodyMap, etc.)

### Phase 4: Mobile App

- [ ] Initialize Expo project with development build
- [ ] Configure Expo Router
- [ ] Set up navigation structure
- [ ] Integrate shared packages
- [ ] Configure health data permissions
- [ ] Set up EAS Build

### Phase 5: Web App

- [ ] Initialize Next.js project
- [ ] Configure Tamagui integration
- [ ] Set up API routes structure
- [ ] Integrate shared packages
- [ ] Configure Vercel deployment

### Phase 6: Testing & CI/CD

- [ ] Set up Vitest for packages and web
- [ ] Set up Jest for mobile
- [ ] Configure GitHub Actions workflows
- [ ] Set up preview deployments
- [ ] Configure remote caching

---

## Appendix A: Quick Reference Commands

```bash
# Install dependencies
pnpm install

# Run all apps in development
pnpm dev

# Run mobile only
pnpm dev:mobile

# Run web only
pnpm dev:web

# Build all packages
pnpm build

# Run all tests
pnpm test

# Type check everything
pnpm typecheck

# Lint everything
pnpm lint

# Format code
pnpm format

# Clean all build artifacts
pnpm clean

# Add dependency to a package
pnpm add <package> --filter @app/<workspace>

# Add dev dependency to root
pnpm add -D <package> -w

# Run command in specific workspace
pnpm --filter @app/mobile <command>
```

---

## Appendix B: Environment Variables

### Mobile (.env)

```bash
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_SENTRY_DSN=...
```

### Web (.env.local)

```bash
# Database
POSTGRES_URL=...
POSTGRES_PRISMA_URL=...
POSTGRES_URL_NON_POOLING=...
POSTGRES_USER=...
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...

# KV Store
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...

# Blob Storage
BLOB_READ_WRITE_TOKEN=...

# Authentication
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...

# AI
ANTHROPIC_API_KEY=...

# Cron
CRON_SECRET=...
```

---

*End of Technical Architecture Document*
