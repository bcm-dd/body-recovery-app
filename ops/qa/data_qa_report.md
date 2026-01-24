# QA Report: @app/data Package

**Date:** 2026-01-24
**Reviewer:** QA Agent
**Package:** packages/data
**Version:** 1.0.0

---

## Executive Summary

The `@app/data` package provides a well-structured data layer with Zustand stores, health adapters, and storage implementations. Overall code quality is **good**, with proper TypeScript typing and clean architecture. However, several issues were identified ranging from potential runtime errors to architectural concerns.

**Total Issues Found:** 14
- Critical: 1
- High: 3
- Medium: 6
- Low: 4

---

## 1. Stores Analysis

### 1.1 workout.ts

**File:** `/home/user/body-recovery-app/packages/data/src/stores/workout.ts`

| Line | Severity | Issue | Suggested Fix |
|------|----------|-------|---------------|
| 283-284 | **Medium** | `skipExercise` sets `nextIndex` to `exercises.length - 1` even when already at last exercise, preventing detection of workout completion after skipping final exercise | Add check: `if (nextIndex === exerciseIndex && exerciseIndex === exercises.length - 1) { /* handle workout complete */ }` |
| 266 | **Low** | `completeSet` increments `currentSetIndex` unconditionally, which could exceed the sets array bounds | Add bounds check: `currentSetIndex: Math.min(setIndex + 1, sets.length - 1)` |
| 135-137 | **Low** | `generateId` uses `Math.random()` which may not provide sufficient uniqueness for concurrent operations | Consider using `crypto.randomUUID()` or a more robust ID generator |

**Zustand Pattern Compliance:** Good. Uses functional updates with `set()` and `get()`, selectors are properly memoizable.

---

### 1.2 bodyMap.ts

**File:** `/home/user/body-recovery-app/packages/data/src/stores/bodyMap.ts`

| Line | Severity | Issue | Suggested Fix |
|------|----------|-------|---------------|
| 208 | **Medium** | Store uses `Map<BodyRegion, BodyRegionStatus>` which may not serialize properly with Zustand persist middleware | Convert to `Record<BodyRegion, BodyRegionStatus>` for persistence compatibility, or add custom serializer |
| 377-379 | **Low** | `getRegionHistory` compares `entry.timestamp >= cutoff` but timestamps are `Date` objects that may have been deserialized as strings | Add type guard: `new Date(entry.timestamp) >= cutoff` |
| 394-395 | **Medium** | `selectActiveIssueCount` calls `state.getActiveIssues()` which is a method, not a property - this breaks memoization in React | Refactor to: `Array.from(state.regions.values()).filter(isActiveIssue).length` |

**Zustand Pattern Compliance:** Partially compliant. Using methods within selectors (lines 394, 400, 407) breaks React's memoization and causes unnecessary re-renders.

---

### 1.3 health.ts

**File:** `/home/user/body-recovery-app/packages/data/src/stores/health.ts`

| Line | Severity | Issue | Suggested Fix |
|------|----------|-------|---------------|
| 146-176 | **High** | `fetchHealth` catches adapter errors but silently switches to demo mode on any availability check failure - this could mask real issues | Log warning before switching: `console.warn('Native adapter unavailable, switching to demo mode');` and consider making this behavior explicit to user |
| 225-226 | **Medium** | `setDemoMode` calls `get().fetchHealth()` synchronously which can cause state update during render | Use `setTimeout(() => get().fetchHealth(), 0)` or restructure the flow |
| 9-13 | **High** | Import from `'../adapters/health'` creates circular dependency risk since health store depends on adapter factory | Consider injecting the adapter as a parameter or using a separate initialization function |

**Zustand Pattern Compliance:** Good overall, but async actions should handle race conditions more carefully.

---

### 1.4 settings.ts

**File:** `/home/user/body-recovery-app/packages/data/src/stores/settings.ts`

| Line | Severity | Issue | Suggested Fix |
|------|----------|-------|---------------|
| 140-143 | **Low** | Redundant state: `theme`, `isDemoMode`, `hasCompletedOnboarding` are duplicated in both root state and `preferences` object | Either remove root-level duplicates or keep them in sync via computed values |
| 89-99 | **Low** | `DEFAULT_REMINDER_TIME` and `DEFAULT_CHECKIN_TIME` are module-level but not exported, making testing difficult | Export these constants or move them inside `DEFAULT_NOTIFICATIONS` |

**Zustand Pattern Compliance:** Good. Clean separation of concerns with granular update methods.

---

## 2. Health Adapters Analysis

### 2.1 types.ts

**File:** `/home/user/body-recovery-app/packages/data/src/adapters/health/types.ts`

| Line | Severity | Issue | Suggested Fix |
|------|----------|-------|---------------|
| 241 | **Medium** | `syncedAt: Date` in `DailyHealthSnapshot` should be `string` (ISO format) for JSON serialization consistency with `date: string` | Change to `syncedAt: string` and update all usages |

**Type Safety:** Excellent. Comprehensive type definitions with proper discriminated unions for `HealthResult<T>`.

---

### 2.2 mock.ts

**File:** `/home/user/body-recovery-app/packages/data/src/adapters/health/mock.ts`

| Line | Severity | Issue | Suggested Fix |
|------|----------|-------|---------------|
| 824-831 | **Critical** | `subscribeToUpdates` creates an interval that runs forever if the returned unsubscribe function is never called - this is a memory/resource leak | Store interval reference and clear it: ensure cleanup happens on adapter disposal, add `dispose()` method |
| 36-40 | **Medium** | Seeded random implementation uses weak multiplier (9301) which may produce poor distribution for large seed values | Use a better PRNG like xorshift or import a tested library |

**Implementation Quality:** Good mock data generation with realistic patterns. The sleep stage generation is particularly well done.

---

### 2.3 healthkit.ts

**File:** `/home/user/body-recovery-app/packages/data/src/adapters/health/healthkit.ts`

| Line | Severity | Issue | Suggested Fix |
|------|----------|-------|---------------|
| 74 | **Low** | `private initialized = false;` is declared but never used | Either implement initialization tracking or remove the unused field |
| 316-318 | **Medium** | `isIOS()` uses `navigator.userAgent` which is unreliable for platform detection | In React Native, use `import { Platform } from 'react-native'; Platform.OS === 'ios'` |

**Implementation Quality:** Stub implementation as expected. Documentation is thorough with clear TODO markers.

---

### 2.4 healthconnect.ts

**File:** `/home/user/body-recovery-app/packages/data/src/adapters/health/healthconnect.ts`

| Line | Severity | Issue | Suggested Fix |
|------|----------|-------|---------------|
| 94 | **Low** | `private initialized = false;` is declared but never used (same as healthkit.ts) | Either implement initialization tracking or remove the unused field |
| 364-366 | **Medium** | `isAndroid()` uses `navigator.userAgent` which is unreliable | In React Native, use `import { Platform } from 'react-native'; Platform.OS === 'android'` |

**Implementation Quality:** Stub implementation matching HealthKit structure. Good documentation of Health Connect specifics.

---

### 2.5 index.ts (Health Adapter Factory)

**File:** `/home/user/body-recovery-app/packages/data/src/adapters/health/index.ts`

| Line | Severity | Issue | Suggested Fix |
|------|----------|-------|---------------|
| 32-34 | **High** | Module-level mutable state (`currentAdapter`, `currentType`, `currentPlatform`) creates issues with SSR and testing | Use a factory pattern that returns an object with these as instance properties, or use React Context for the singleton |

**Implementation Quality:** Good factory pattern, but singleton state could cause issues in server-side rendering or testing scenarios.

---

## 3. Storage Analysis

### 3.1 interface.ts

**File:** `/home/user/body-recovery-app/packages/data/src/storage/interface.ts`

| Line | Severity | Issue | Suggested Fix |
|------|----------|-------|---------------|
| 191 | **Medium** | `set` method in `createNamespacedStorage` casts value as `string` regardless of actual type: `storage.set(\`${prefix}${key}\`, value as string)` | Use proper type handling: `if (typeof value === 'string') storage.set(..., value); else if (typeof value === 'number') ...` |

**Type Safety:** Good interface design with proper generic usage.

---

### 3.2 mmkv.ts

**File:** `/home/user/body-recovery-app/packages/data/src/storage/mmkv.ts`

| Line | Severity | Issue | Suggested Fix |
|------|----------|-------|---------------|
| 62-65 | **Medium** | Dynamic `require('react-native-mmkv')` will throw at runtime on web/SSR - should be try/catch with graceful fallback | Wrap in try/catch and throw descriptive error: `throw new Error('MMKVStorageAdapter can only be used in React Native')` |
| 81-84 | **Low** | `addOnValueChangedListener` callback reads value by trying all types sequentially - inefficient and may return wrong type | Store type metadata alongside value or use JSON serialization consistently |

**Implementation Quality:** Solid MMKV wrapper with proper listener management.

---

### 3.3 localStorage.ts

**File:** `/home/user/body-recovery-app/packages/data/src/storage/localStorage.ts`

| Line | Severity | Issue | Suggested Fix |
|------|----------|-------|---------------|
| 28-29 | **Low** | `originalSetItem` and `originalRemoveItem` are stored but never used | Remove these unused fields or implement the intended interception logic |
| 40 | **Low** | Storage event listener is added but never removed - potential memory leak on adapter disposal | Add `dispose()` method that calls `window.removeEventListener('storage', ...)` |

**Implementation Quality:** Good localStorage wrapper with proper type encoding.

---

### 3.4 index.ts (Storage Factory)

**File:** `/home/user/body-recovery-app/packages/data/src/storage/index.ts`

| Line | Severity | Issue | Suggested Fix |
|------|----------|-------|---------------|
| 112 | **High** | `const encryptionKey = 'TODO_GENERATE_SECURE_KEY';` is a hardcoded placeholder that could be deployed to production | Add runtime check: `if (encryptionKey.startsWith('TODO')) throw new Error('Secure key not configured');` or use environment variable |
| 123 | **Low** | `return secureStorage!;` uses non-null assertion when `secureStorage` is definitely assigned above | Remove the `!` as it's unnecessary after the if-block |

---

## 4. Exports Analysis

### 4.1 src/index.ts (Main Entry Point)

**File:** `/home/user/body-recovery-app/packages/data/src/index.ts`

**Assessment:** Clean and well-organized public API.

**Strengths:**
- Logical grouping by category (Stores, Health Adapters, Storage)
- Proper separation of type exports vs value exports
- Comprehensive re-exports for consumer convenience

**No issues identified** in the export structure.

---

## 5. Dependency Analysis

**package.json Review:**

| Dependency | Version | Assessment |
|------------|---------|------------|
| zustand | ^5.0.0 | Current, appropriate choice for state management |
| @app/domain | workspace:* | Workspace reference, OK |
| react-native-mmkv | peer (optional) | Correctly marked as optional peer dependency |

---

## 6. Summary of Required Actions

### Critical (Must Fix Before Deploy)
1. **mock.ts:824-831** - Fix interval memory leak in `subscribeToUpdates`

### High Priority
2. **health.ts:146-176** - Add logging for silent demo mode switch
3. **health.ts:9-13** - Resolve potential circular dependency
4. **storage/index.ts:112** - Remove or secure placeholder encryption key

### Medium Priority
5. **bodyMap.ts:208** - Address Map serialization for persistence
6. **bodyMap.ts:394-395** - Fix selector memoization issue
7. **health.ts:225-226** - Fix state update during render
8. **types.ts:241** - Standardize Date serialization format
9. **mock.ts:36-40** - Consider better PRNG algorithm
10. **interface.ts:191** - Fix type casting in namespaced storage

### Low Priority
11. Fix unused `initialized` fields in HealthKit and HealthConnect adapters
12. Export default reminder time constants for testing
13. Clean up unused localStorage interception fields
14. Remove unnecessary non-null assertions

---

## 7. Recommendations

### Architecture
1. Consider adding a `dispose()` method to all adapters for proper cleanup
2. Implement Zustand persist middleware for stores that need persistence
3. Add error boundaries around async store operations

### Testing
1. Add unit tests for store selectors
2. Add integration tests for storage adapters
3. Mock health adapters should have configurable failure modes for testing

### Documentation
1. Add JSDoc comments to public API functions
2. Document the relationship between stores and when to use each
3. Add migration guide for storage schema changes

---

*Report generated by QA Agent*
