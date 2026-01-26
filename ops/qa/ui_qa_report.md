# UI Package QA Report

**Package:** `@app/ui`
**Date:** 2026-01-24
**Reviewer:** QA Agent
**Status:** Review Complete

---

## Executive Summary

The UI package provides a comprehensive set of primitives and components for the Movement & Recovery Companion app. Overall, the package is well-structured with good TypeScript typing and accessibility considerations. However, several issues were identified that need attention.

**Issue Count by Severity:**
- Critical: 1
- High: 4
- Medium: 8
- Low: 5

---

## 1. Primitives (src/primitives/)

### 1.1 Button.tsx

| Issue | Line | Severity | Description | Suggested Fix |
|-------|------|----------|-------------|---------------|
| Non-functional LoadingSpinner | 231-239 | Medium | `LoadingSpinner` component lacks actual rotation animation - only has `borderTopColor` styled but no CSS animation or Reanimated rotation. Spinner will appear static. | Add animation using Reanimated `useSharedValue` and `withRepeat(withTiming())` for rotation, or add CSS `@keyframes spin` for web. |
| Missing aria-busy | 258-293 | Low | When `loading` is true, button should have `aria-busy="true"` for screen readers. | Add `aria-busy={loading}` to ButtonFrame. |

**Positive Observations:**
- Good focus styles with outline offset
- Proper `role="button"` and `focusable` attributes
- Comprehensive variant and size system

### 1.2 Text.tsx

| Issue | Line | Severity | Description | Suggested Fix |
|-------|------|----------|-------------|---------------|
| No issues found | - | - | Well-implemented with semantic variants | - |

**Positive Observations:**
- Excellent semantic HTML tags (h1-h6, p, label, span)
- Complete typography scale
- Good accessibility with proper heading tags

### 1.3 Card.tsx

| Issue | Line | Severity | Description | Suggested Fix |
|-------|------|----------|-------------|---------------|
| No issues found | - | - | Well-structured component | - |

**Positive Observations:**
- Good composition pattern with Header, Body, Footer
- Multiple variants including success/warning/error states

### 1.4 Input.tsx

| Issue | Line | Severity | Description | Suggested Fix |
|-------|------|----------|-------------|---------------|
| Missing id prop | 223-277 | High | Input lacks `id` prop for proper `<label htmlFor>` association. The Label component wraps the input but doesn't use `htmlFor`. | Add `id` prop to InputProps interface and pass to InputFrame. Update Label to use `htmlFor={id}`. |
| Missing aria-describedby | 257-263 | Medium | Error and helper messages are not programmatically connected to the input. | Add `aria-describedby` pointing to error/helper message IDs. |
| Missing aria-invalid | 257-263 | Medium | When `error` is true, input should indicate invalid state to screen readers. | Add `aria-invalid={hasError}` to InputFrame. |

### 1.5 Sheet.tsx

| Issue | Line | Severity | Description | Suggested Fix |
|-------|------|----------|-------------|---------------|
| Missing keyboard handling | 245-284 | High | No Escape key handling to close the sheet. Users cannot dismiss with keyboard. | Add `onKeyDown` handler that calls `onClose()` when Escape is pressed. |
| Missing accessibility role on overlay | 267-271 | Medium | SheetOverlay lacks `accessibilityRole` and `accessibilityLabel`. | Add `accessibilityRole="button"` and `accessibilityLabel="Close sheet"` to SheetOverlay. |
| Missing focus trap | 245-284 | Medium | Sheet does not trap focus, allowing users to tab to elements behind it. | Implement focus trap when sheet is open, or integrate with a focus trap library. |

---

## 2. Components (src/components/)

### 2.1 Banner.tsx

| Issue | Line | Severity | Description | Suggested Fix |
|-------|------|----------|-------------|---------------|
| **Duplicate variant prop** | 207 | **Critical** | `BannerText` has `variant` prop specified twice: `variant={variant} variant={variant === 'info' ? 'body' : 'bodySmall'}`. This is a syntax error that will cause unexpected behavior. | Remove the duplicate. Change to: `<BannerText variant={variant === 'info' ? 'body' : 'bodySmall'} color={variant === 'info' ? undefined : variant}>` or use separate color prop. |
| Hardcoded dismiss icon | 230-234 | Low | Dismiss button uses `x` text character instead of a proper icon component. May not be visually consistent. | Use a proper close icon from an icon library. |

### 2.2 Toast.tsx

| Issue | Line | Severity | Description | Suggested Fix |
|-------|------|----------|-------------|---------------|
| Unused import | 12 | Low | `palette` is imported but the Toast uses it only for potential future features. | Remove unused import if not needed, or add a TODO comment explaining future use. |
| Redundant color logic | 249-251 | Low | `color: variant === 'default' ? 'white' : 'white'` - condition always returns 'white'. | Simplify to `color: 'white'`. |
| Missing ARIA live region | 238-259 | Medium | Toast should use `aria-live="polite"` to announce to screen readers. | Add `accessibilityRole="alert"` or `aria-live="polite"` to ToastFrame. |

### 2.3 BodyMap/BodyMap.tsx

| Issue | Line | Severity | Description | Suggested Fix |
|-------|------|----------|-------------|---------------|
| Import placement | 264 | Medium | `Text` is imported in the middle of the file after other code. Violates import ordering conventions. | Move `import { Text } from '../../primitives/Text';` to top of file with other imports. |
| Back view uses front paths | 221-232 | Medium | When `view === 'back'`, the component still uses `FRONT_BODY_REGIONS` paths. Back view regions have different path definitions that should be used. | Create separate `BACK_BODY_REGIONS` paths or transform paths for back view. |

### 2.4 BodyMap/BodyRegion.tsx

| Issue | Line | Severity | Description | Suggested Fix |
|-------|------|----------|-------------|---------------|
| No issues found | - | - | Good accessibility implementation | - |

**Positive Observations:**
- Excellent accessibility with `accessibilityLabel`, `accessibilityRole`, and `accessibilityState`
- Clean implementation of pain level colors

### 2.5 ExerciseCard/ExerciseCard.tsx

| Issue | Line | Severity | Description | Suggested Fix |
|-------|------|----------|-------------|---------------|
| No issues found | - | - | Well-implemented component | - |

**Positive Observations:**
- Good composition with sub-components
- Proper event handling with useCallback
- Pain indicator has accessibility label

### 2.6 ExerciseCard/SetLogger.tsx

| Issue | Line | Severity | Description | Suggested Fix |
|-------|------|----------|-------------|---------------|
| No issues found | - | - | Excellent accessibility | - |

**Positive Observations:**
- Comprehensive accessibility with `accessibilityLabel`, `accessibilityRole`, and `accessibilityState`

### 2.7 ReadinessRing/ReadinessRing.tsx

| Issue | Line | Severity | Description | Suggested Fix |
|-------|------|----------|-------------|---------------|
| Unused prop | 137 | Low | `animated` prop is defined in `ReadinessRingProps` but never used in the component implementation. | Either implement animation toggle or remove the prop. |
| Missing accessibility | 190-248 | Medium | Ring lacks `accessibilityLabel` describing the score and level. | Add `accessibilityLabel={`Readiness score: ${score}, ${displayLabel}`}` to RingContainer. |

### 2.8 ChartCard/ChartCard.tsx

| Issue | Line | Severity | Description | Suggested Fix |
|-------|------|----------|-------------|---------------|
| Unused import | 12 | Low | `Button` is imported but never used in the component. | Remove unused import. |

---

## 3. Theme (src/theme/)

### 3.1 tokens.ts

| Issue | Line | Severity | Description | Suggested Fix |
|-------|------|----------|-------------|---------------|
| No issues found | - | - | Complete and well-organized | - |

**Positive Observations:**
- Comprehensive color palette including pain levels
- Good spacing and typography scales
- Shadow definitions for elevation

### 3.2 config.ts

| Issue | Line | Severity | Description | Suggested Fix |
|-------|------|----------|-------------|---------------|
| Incomplete zIndex tokens | 85-93 | Medium | zIndex tokens in config don't include `modal`, `toast`, and `sheet` values that are defined in tokens.ts. | Add missing zIndex values: `modal: 1000, toast: 1100, sheet: 900`. |
| Missing pressHighlight in tokens | 46-49 | Low | `pressHighlight` is defined only in darkTheme (line 213) but not in base tokens color object. | Add to lightTheme as well for consistency. |

**Positive Observations:**
- Good reduced motion animation alternatives
- Complete light and dark themes
- Useful shorthands defined

---

## 4. Hooks (src/hooks/)

### 4.1 useReducedMotion.ts

| Issue | Line | Severity | Description | Suggested Fix |
|-------|------|----------|-------------|---------------|
| No issues found | - | - | Well-implemented for both web and native | - |

**Positive Observations:**
- Excellent cross-platform support (web media query + React Native AccessibilityInfo)
- Proper cleanup of event listeners
- Helper functions for motion-safe animations and styles

### 4.2 useTheme.ts

| Issue | Line | Severity | Description | Suggested Fix |
|-------|------|----------|-------------|---------------|
| getSpace ignores tokens | 55-60 | High | `getSpace` function simply multiplies by 4 instead of looking up actual space token values. | Change to look up actual token: `return space[spaceKey as keyof typeof space] ?? spaceKey * 4;` |
| useSafeSpacing hardcoded | 149-161 | Medium | Returns hardcoded iOS values instead of integrating with react-native-safe-area-context. | Integrate with useSafeAreaInsets from react-native-safe-area-context when available. |
| useResponsiveValue not reactive | 122-143 | Medium | On web, `useResponsiveValue` gets initial window width but doesn't update on resize. | Add window resize listener with useState to track width changes. |

---

## 5. Exports (src/index.ts)

| Issue | Line | Severity | Description | Suggested Fix |
|-------|------|----------|-------------|---------------|
| No issues found | - | - | All components properly exported | - |

**Export Verification:**
- [x] Theme exports (tokens, config)
- [x] Primitives (Button, Text, Card, Input, Sheet)
- [x] Components (BodyMap, ExerciseCard, ReadinessRing, ChartCard, Banner, Toast)
- [x] Hooks (useReducedMotion, useTheme)
- [x] Tamagui utilities re-exported

---

## 6. Accessibility Summary

### Strengths:
1. BodyRegion has comprehensive accessibility attributes
2. SetLogger includes accessibilityLabel, accessibilityRole, and accessibilityState
3. Button has proper role and focus styles
4. Text components use semantic HTML tags
5. useReducedMotion hook properly detects user preference

### Areas for Improvement:
1. **Sheet**: Missing focus trap and keyboard escape handling
2. **Input**: Missing proper label association (htmlFor/id) and aria-describedby
3. **Toast**: Missing aria-live region for announcements
4. **ReadinessRing**: Missing accessibility label for the score
5. **Components should consume useReducedMotion**: Most components define animations but don't use the hook to respect user preferences

---

## 7. Recommendations

### Immediate Actions (Critical/High):
1. **Fix Banner duplicate variant prop** - Syntax error causing potential runtime issues
2. **Add keyboard escape handling to Sheet** - Required for accessibility compliance
3. **Fix Input label association** - Add id/htmlFor for proper form accessibility
4. **Fix useTheme.getSpace()** - Currently returns incorrect values

### Short-term Actions (Medium):
1. Implement proper LoadingSpinner animation in Button
2. Add focus trap to Sheet component
3. Move misplaced import in BodyMap.tsx
4. Add aria-live to Toast for screen reader announcements
5. Create proper back view paths for BodyMap
6. Add missing zIndex tokens to config

### Long-term Actions (Low):
1. Implement animated prop in ReadinessRing
2. Add testID props for all components
3. Integrate useSafeSpacing with react-native-safe-area-context
4. Add resize listener to useResponsiveValue
5. Replace x character with proper icon in Banner dismiss

---

## 8. Test Coverage Recommendations

Components that should have priority testing:
1. **Banner** - Due to critical bug
2. **Sheet** - Complex interactions and accessibility
3. **Input** - Form validation and accessibility
4. **BodyMap** - Interactive SVG regions
5. **Toast** - Auto-dismiss timing and state management

---

*Report generated by QA Agent*
