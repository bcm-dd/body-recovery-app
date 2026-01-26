# Mobile App QA Report

**Date:** 2026-01-24
**Platform:** Expo / React Native
**App Path:** `/home/user/body-recovery-app/apps/mobile`
**Reviewed By:** QA Agent

---

## Executive Summary

The mobile app follows a well-structured Expo Router architecture with Tamagui for UI components. The codebase demonstrates good patterns for haptic feedback, state management, and component organization. However, several issues were identified ranging from missing assets to logic errors and unused code.

**Critical Issues:** 1
**High Severity:** 6
**Medium Severity:** 12
**Low Severity:** 8

---

## 1. Configuration Files

### 1.1 app.json

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Missing required assets | **Critical** | 7, 11, 33, 58 | The app.json references assets that do not exist: `icon.png`, `splash.png`, `adaptive-icon.png`, `notification-icon.png`. The `assets/images/` directory is empty. | Add the required image assets or update paths to existing assets. App will fail to build without these. |
| EAS project ID format | Low | 77 | The `eas.projectId` is set to a string `"body-recovery-companion"` rather than a UUID format expected by EAS. | Generate a proper EAS project ID using `eas build:configure` or via Expo dashboard. |

### 1.2 metro.config.js

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| disableHierarchicalLookup | Low | 19 | Setting `disableHierarchicalLookup = true` may cause issues with packages that expect hierarchical resolution. | Monitor for resolution issues and consider removing if problems arise. |

**Status:** Generally well configured for monorepo setup.

### 1.3 babel.config.js

**Status:** Correctly configured with Tamagui and Reanimated plugins.

### 1.4 package.json

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Missing ESLint config | Low | 14 | The lint script references ESLint but no `.eslintrc` or ESLint config is present. | Add ESLint configuration file. |

### 1.5 tsconfig.json

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Missing @app/types dependency | Medium | 19 | Path alias for `@app/types` is defined but package is not in package.json dependencies. | Add `"@app/types": "workspace:*"` to dependencies or remove unused path alias. |

---

## 2. Navigation (app/)

### 2.1 Root Layout (`app/_layout.tsx`)

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Unused import | Low | 1 | `useEffect` is imported from React but never used in the component. | Remove unused import: `import { useEffect } from 'react';` |
| No onboarding redirect logic | High | 22-83 | The root layout does not check `isOnboardingComplete` from AppProvider to redirect new users to onboarding. | Add useEffect to check onboarding status and use `router.replace('/onboarding')` for new users. |

### 2.2 Tab Layout (`app/(tabs)/_layout.tsx`)

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Incorrect icon for Profile tab | Medium | 67 | The Profile tab uses the `Activity` icon which is semantically incorrect for a settings/profile screen. | Use `Settings` or `User` icon instead: `import { Settings } from '@tamagui/lucide-icons';` |
| Hardcoded colors | Low | 9-12 | Tab bar colors are hardcoded rather than using Tamagui tokens. | Use theme tokens like `$primary`, `$colorHover` for consistency with theme changes. |

### 2.3 Onboarding Layout (`app/onboarding/_layout.tsx`)

**Status:** Well structured with proper Stack navigation and gestures enabled.

### 2.4 Not Found Screen (`app/+not-found.tsx`)

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Button styling | Low | 17-22 | Button uses inline backgroundColor rather than semantic tokens. | Use `backgroundColor="$primary"` token which is already correct. |

---

## 3. Tab Screens

### 3.1 Today Screen (`app/(tabs)/index.tsx`)

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Unused import | Low | 18 | `import * as Haptics from 'expo-haptics';` is imported but the `useHaptics` hook is used instead. | Remove the unused import. |
| Navigation to Body tab | Medium | 171 | Uses `router.push('/body')` but `/body` is not a route - it should be `/(tabs)/body` or use tab navigation. | Use correct route path or tab-based navigation method. |
| Mock data dependency | Low | 23-45 | Screen relies entirely on mock data with no connection to actual data layer. | Integrate with `@app/data` package and use React Query for data fetching. |

### 3.2 Plan Screen (`app/(tabs)/plan.tsx`)

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Non-deterministic rendering | High | 56 | `Math.random() > 0.2` is called during component render in `generateWeekPlan()`, causing different results on each render and potential hydration mismatches. | Move random generation to useMemo with stable seed, or use actual data. |
| Potential undefined access | Medium | 128-129 | `weekPlan[0]?.date` and `weekPlan[6]?.date` could be undefined if array is shorter than expected. | Add defensive checks or ensure array length is always 7. |

### 3.3 Body Screen (`app/(tabs)/body.tsx`)

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Invalid Button variant | Medium | 486 | `<Button variant="outlined">` - Tamagui Button may not support this variant prop. | Check Tamagui docs; use `bordered` prop instead: `<Button bordered>Cancel</Button>` |
| SVG touch handling | Low | 131-258 | SVG regions use `onPress` which may have inconsistent touch targets on different devices. | Consider using Pressable wrappers or react-native-gesture-handler for more reliable touch handling. |

### 3.4 Progress Screen (`app/(tabs)/progress.tsx`)

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Non-null assertions | Medium | 208-209 | Uses `MOCK_PAIN_DATA[0]!.value` and `MOCK_PAIN_DATA[MOCK_PAIN_DATA.length - 1]!.value` which could throw if array is empty. | Add length check before accessing: `if (MOCK_PAIN_DATA.length < 2) return 0;` |
| Unused parameter | Low | 190 | `timeRange` state is set but never used to filter data. | Implement time range filtering or remove unused state. |
| Hardcoded dark theme color | Low | 151 | SVG fill uses `#0A0A0A` which won't adapt to light theme. | Use theme-aware color or conditional based on colorScheme. |

### 3.5 Profile Screen (`app/(tabs)/profile.tsx`)

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Empty callback handlers | Medium | 94, 105, 114 | Several `onPress` handlers are empty: `{ text: 'Connect', onPress: () => {} }`. | Implement actual functionality or add TODO comments and disable buttons. |
| External links not validated | Low | 119, 125 | `Linking.openURL` is called without checking if the URL can be opened. | Use `Linking.canOpenURL()` before calling `openURL()`. |

---

## 4. Onboarding Flow

### 4.1 Welcome Screen (`app/onboarding/index.tsx`)

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Terms/Privacy not clickable | Low | 66 | Terms and Privacy Policy text mentions agreement but is not interactive. | Add onPress handlers to open Terms and Privacy Policy URLs. |

### 4.2 Health Screen (`app/onboarding/health.tsx`)

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Fake health permission request | Medium | 20 | Uses `setTimeout` to simulate health permission rather than actual HealthKit/Health Connect APIs. | Integrate with `react-native-health` or `react-native-health-connect` for actual permission requests. |

### 4.3 Focus Screen (`app/onboarding/focus.tsx`)

**Status:** Well implemented with proper state management and visual feedback.

### 4.4 Body Map Screen (`app/onboarding/body-map.tsx`)

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Missing ankle regions | Medium | 31-32 | BodyRegion type includes `leftAnkle` and `rightAnkle` in type but they are not in `REGION_LABELS` or SVG. | Add ankle labels to REGION_LABELS and corresponding SVG elements, or remove from type. |

### 4.5 First Session Screen (`app/onboarding/first-session.tsx`)

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Onboarding state not persisted | High | 73-77 | When user navigates to tabs, `setOnboardingComplete` from AppProvider is never called. User will see onboarding again on app restart. | Import `useApp` hook and call `setOnboardingComplete(true)` before navigation. |
| Unused import | Low | 17 | `ChevronRight` is imported but never used. | Remove unused import. |

---

## 5. Workout Screens

### 5.1 Workout Execution (`app/workout/[id].tsx`)

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Mixed animation systems | Medium | 2, 119 | Uses both `Animated` from react-native and `react-native-reanimated` in RestTimer component. Mixing animation systems can cause performance issues. | Standardize on react-native-reanimated throughout. |
| Rest timer shows wrong exercise | High | 315 | During rest, displays "Next: {workout.exercises[currentExerciseIndex]?.name}" but `currentExerciseIndex` was already incremented in `handleCompleteSet`, so it shows current not next exercise. | Store next exercise name before incrementing index, or use `currentExerciseIndex + 1`. |
| Undefined exercise access | Medium | 121-124 | `workout.exercises[currentExerciseIndex]` could be undefined when index exceeds array length. | Add bounds checking before accessing array. |

### 5.2 Workout Summary (`app/workout/summary/[id].tsx`)

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Unused state variable | Low | 59 | `showBodyUpdate` state is set but never used to conditionally render anything. | Implement body update UI or remove unused state. |
| Unused route param | Low | 54 | `id` parameter is extracted but never used - summary always shows MOCK_SUMMARY. | Use `id` to fetch actual workout data. |

### 5.3 Substitution Screen (`app/substitution/[exerciseId].tsx`)

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Race condition in navigation | High | 102-109 | Nested `setTimeout` with `showUndo` state check can cause race conditions. The `showUndo` check references stale closure value. | Use useRef for tracking or restructure the flow to avoid nested timeouts. |
| Unused import | Low | 15 | `Input` is imported from tamagui but never used. | Remove unused import. |
| Unused route param | Low | 76 | `exerciseId` is extracted but never used to fetch the actual exercise. | Use `exerciseId` to fetch actual exercise data. |

---

## 6. Components (`src/components/`)

### 6.1 Component Index (`src/components/index.ts`)

**Status:** Good barrel export pattern with proper type exports.

### 6.2 ExerciseCard (`src/components/ExerciseCard.tsx`)

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Dual export | Low | 50, 201 | Component has both named export and default export which can cause confusion. | Choose one export style and use consistently. |
| Not used in screens | Medium | - | This component exists but screens duplicate the logic inline. | Refactor screens to use this shared component. |

### 6.3 ReadinessIndicator (`src/components/ReadinessIndicator.tsx`)

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Unused React import | Low | 1 | `import React from 'react';` is not needed in React 17+ with new JSX transform. | Can be removed if using new JSX transform (check tsconfig). |
| Not used anywhere | Medium | - | Component is exported but not used in any screen. | Use this component in Today screen instead of inline implementation. |

### 6.4 RestTimer (`src/components/RestTimer.tsx`)

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Invalid haptic type | High | 57, 63 | Uses `triggerHaptic('timerWarning')` and `triggerHaptic('timerEnd')` but these types are defined in useHaptics differently. | Ensure haptic type names match: use 'timerWarning' and 'timerEnd' as defined in the HapticType union. |
| Not used in workout screen | Medium | - | Workout screen has its own rest timer implementation instead of using this component. | Refactor workout screen to use this component. |

### 6.5 SessionPreviewCard (`src/components/SessionPreviewCard.tsx`)

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Not used in Today screen | Medium | - | Today screen has duplicate inline implementation. | Use this component in Today screen. |

### 6.6 SetIndicator (`src/components/SetIndicator.tsx`)

**Status:** Well implemented, but not used - screens have inline implementations.

---

## 7. Hooks (`src/hooks/`)

### 7.1 useHaptics (`src/hooks/useHaptics.ts`)

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Potential memory leak | Low | 33 | Async function without cleanup - multiple rapid calls could queue up haptic patterns. | Consider adding debouncing or cancellation for rapid successive calls. |
| Duplicate implementation | Low | - | Similar logic exists in `src/lib/haptics.ts`. | Consider consolidating to reduce duplication. |

---

## 8. Providers (`src/providers/`)

### 8.1 AppProvider (`src/providers/AppProvider.tsx`)

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| No network connectivity check | Low | 48 | `isOffline` is always set to `false` - no actual network monitoring. | Implement network connectivity listener using `@react-native-community/netinfo`. |
| Hooks not used by screens | Medium | 56-86 | Helper hooks like `useIsAppReady()`, `useIsOnboardingComplete()`, `useUserPreferences()` are defined but not used. | Use these hooks in screens, especially for onboarding routing. |

---

## 9. Library Files (`src/lib/`)

### 9.1 haptics.ts

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Duplicate of useHaptics | Low | - | This file duplicates functionality available in the useHaptics hook. | Consider consolidating or clearly documenting when to use each. |

### 9.2 storage.ts

| Issue | Severity | Line | Description | Suggested Fix |
|-------|----------|------|-------------|---------------|
| Encryption key commented out | Medium | 18-19 | Secure storage encryption key is commented out with TODO. | Implement proper key management before production release. |

---

## 10. Assets

| Issue | Severity | Location | Description | Suggested Fix |
|-------|----------|----------|-------------|---------------|
| Empty images folder | **Critical** | `assets/images/` | No images present but required by app.json | Add required assets: icon.png, splash.png, adaptive-icon.png, notification-icon.png |
| Empty fonts folder | Low | `assets/fonts/` | No custom fonts, but Inter fonts are loaded via @tamagui/font-inter package | Not an issue if using Tamagui font package. |

---

## Summary of Required Actions

### Critical (Must fix before build)
1. Add required image assets (icon.png, splash.png, adaptive-icon.png, notification-icon.png)

### High Priority (Should fix before release)
1. Implement onboarding completion persistence
2. Fix onboarding redirect logic in root layout
3. Fix rest timer showing wrong exercise name in workout screen
4. Fix race condition in substitution screen
5. Fix invalid haptic types in RestTimer component
6. Remove Math.random() from Plan screen render cycle

### Medium Priority (Should fix soon)
1. Fix navigation path to body tab
2. Replace invalid Button variant prop
3. Add missing ankle regions or remove from type
4. Implement actual health permission requests
5. Use shared components instead of inline duplicates
6. Add @app/types dependency or remove path alias
7. Implement secure storage encryption

### Low Priority (Nice to have)
1. Remove unused imports throughout codebase
2. Make terms/privacy links clickable
3. Remove dual exports from components
4. Consolidate duplicate haptics implementations
5. Add network connectivity monitoring
6. Add ESLint configuration

---

## Test Recommendations

1. **Navigation Testing:**
   - Verify deep linking works for all routes
   - Test tab switching and back navigation
   - Test onboarding flow completion and redirect

2. **Workout Flow Testing:**
   - Complete full workout cycle
   - Test rest timer transitions
   - Test exercise substitution flow
   - Verify haptic feedback on supported devices

3. **State Persistence Testing:**
   - Verify onboarding state persists across app restarts
   - Test body map state persistence
   - Verify preferences save correctly

4. **Platform Testing:**
   - Test on iOS and Android devices
   - Verify assets load correctly
   - Test haptics on both platforms

5. **Edge Cases:**
   - Test with empty workout data
   - Test network offline scenarios
   - Test with various device sizes

---

*Report generated by QA Agent*
