# Web App QA Report

**App**: `apps/web` (Next.js)
**Date**: 2026-01-24
**Reviewer**: QA Agent
**Status**: Review Complete

---

## Executive Summary

The web application is a well-structured Next.js 15 app with App Router, featuring a dashboard-style interface for body recovery tracking. The codebase demonstrates good patterns but has several issues that need addressing before production readiness.

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High | 5 |
| Medium | 12 |
| Low | 8 |

---

## 1. App Router (app/)

### 1.1 Root Layout (`app/layout.tsx`)

| Line | Issue | Severity | Description | Fix |
|------|-------|----------|-------------|-----|
| 17 | Hardcoded dark class | Medium | `className="dark"` is hardcoded on `<html>` element but `providers.tsx` dynamically manages theme classes. This can cause flash of incorrect theme on load. | Remove `className="dark"` and let Providers handle initial theme class, or use a cookie-based approach for server-side theme detection. |

### 1.2 Providers (`app/providers.tsx`)

| Line | Issue | Severity | Description | Fix |
|------|-------|----------|-------------|-----|
| 182-189 | Hydration mismatch risk | High | Theme initialization happens after first render in `useEffect`. Server always renders "dark" (from layout), but client may detect different preference causing hydration mismatch. | Use cookies or implement a blocking script in layout to set theme before React hydrates. Consider `next-themes` library. |
| 21-60 | Inline type definitions | Low | `BodyRegion`, `Session`, `ExerciseCompleted`, `UserPreferences` interfaces are defined inline rather than imported from `@app/domain`. | Import shared types from `@app/domain` package for consistency across apps. |
| 184 | Unsafe type assertion | Low | `savedTheme as 'light' \| 'dark'` without validation could cause issues if localStorage contains invalid value. | Add validation: `if (savedTheme === 'light' \| \| savedTheme === 'dark')`. |

---

## 2. Dashboard Pages (app/(dashboard)/)

### 2.1 Dashboard Layout (`app/(dashboard)/layout.tsx`)

| Line | Issue | Severity | Description | Fix |
|------|-------|----------|-------------|-----|
| 14 | No mobile responsiveness | Critical | `pl-64` hardcodes 256px padding for sidebar, but sidebar is fixed at 256px width with no mobile handling. On mobile devices, content will be completely hidden behind the sidebar. | Implement responsive layout with collapsible sidebar on mobile. Add `lg:pl-64 pl-0` and toggle sidebar visibility. |
| 10-36 | Missing loading/error states | Medium | No `loading.tsx` or `error.tsx` siblings for Suspense boundaries and error handling. | Add `loading.tsx` and `error.tsx` files for proper loading states and error boundaries. |

### 2.2 Dashboard Home (`app/(dashboard)/page.tsx`)

| Line | Issue | Severity | Description | Fix |
|------|-------|----------|-------------|-----|
| 86-87 | Confusing trend naming | Low | `trend` prop uses counterintuitive semantics: `'down'` = success (green), `'up'` = warning. For pain, "down" is good, but naming is confusing. | Rename to `status: 'positive' \| 'negative' \| 'neutral'` for clarity. |
| 305-308 | Placeholder link | Low | Mobile app download link uses `href="#"` which does nothing. | Use proper App Store/Play Store links or remove until available. |
| N/A | Missing page metadata | Medium | No `metadata` export for SEO on dashboard page. | Add `export const metadata: Metadata = {...}` for page-specific SEO. |

### 2.3 Body Map (`app/(dashboard)/body/page.tsx`)

| Line | Issue | Severity | Description | Fix |
|------|-------|----------|-------------|-----|
| 127-130 | Non-functional save button | High | "Save Changes" button has no actual save implementation - only visual. User changes would be lost on navigation. | Implement save functionality using Zustand store or API call. |
| 297 | Array index as React key | Medium | Using `index` as key in history map: `key={index}`. If items are reordered/removed, React reconciliation will be incorrect. | Use unique identifier like `${entry.region}-${entry.timestamp.getTime()}`. |
| 140-177 | Accessibility - missing labels | Medium | SVG clickable regions lack accessible labels for screen readers. | Add `<title>` and `aria-label` attributes to SVG regions. |

### 2.4 History (`app/(dashboard)/history/page.tsx`)

| Line | Issue | Severity | Description | Fix |
|------|-------|----------|-------------|-----|
| N/A | Well implemented | - | No significant issues found. Good use of memoization and state management. | - |

### 2.5 Progress (`app/(dashboard)/progress/page.tsx`)

| Line | Issue | Severity | Description | Fix |
|------|-------|----------|-------------|-----|
| 20 | Unused import | Low | `Filter` is imported from lucide-react but never used. | Remove unused import. |
| 74-75 | Mock data on every render | Medium | `generateMockTrendData` generates new random data on each `dateRange` change rather than using real user data. This means charts will show different random values each time. | Replace with real data from `appState.sessions` or persist mock data. |
| 75 | Empty dependency array issue | Low | `generateRegionData()` has no dependencies but contains `Math.random()`, generating new values on each mount. | Make mock data deterministic or persist across renders. |

### 2.6 Settings (`app/(dashboard)/settings/page.tsx`)

| Line | Issue | Severity | Description | Fix |
|------|-------|----------|-------------|-----|
| 8 | Unused import | Low | `Dumbbell` is imported but never used. | Remove unused import. |
| 77-84 | Fake save functionality | High | `handleSave` only simulates saving with setTimeout - no actual persistence. User settings will be lost on page refresh. | Implement actual persistence using Zustand persist or API. |
| 393-396 | Delete account not implemented | Medium | Delete account button has no functionality - this is a significant user expectation. | Add confirmation dialog and implement delete logic, or hide button until implemented. |

---

## 3. API Routes (app/api/)

### 3.1 Health Check (`app/api/health/route.ts`)

| Line | Issue | Severity | Description | Fix |
|------|-------|----------|-------------|-----|
| N/A | Clean implementation | - | No issues found. Good use of edge runtime and proper JSON response structure. | - |

### 3.2 Daily Summary Cron (`app/api/cron/daily-summary/route.ts`)

| Line | Issue | Severity | Description | Fix |
|------|-------|----------|-------------|-----|
| 18-21 | Non-standard cron auth | Low | Using custom `authorization` header for cron auth. Vercel recommends using `CRON_SECRET` environment variable checked differently. | Consider using Vercel's recommended pattern or document current approach. |
| 23-38 | Placeholder only | Low | Implementation is placeholder with TODO comments. Expected for MVP but should be tracked. | Track as technical debt for post-MVP implementation. |

---

## 4. Components (src/components/)

### 4.1 Sidebar (`src/components/Sidebar.tsx`)

| Line | Issue | Severity | Description | Fix |
|------|-------|----------|-------------|-----|
| 16 | Fragile import path | Medium | Using relative path `'../../app/providers'` for useTheme import. Fragile if file moves. | Create `@/providers` path alias or export from a dedicated hooks location. |
| 37 | Fixed sidebar - no mobile | Critical | Sidebar is `fixed` with `w-64` (256px) and no responsive handling. On mobile viewports, it will cover entire screen with no way to dismiss. | Implement mobile menu pattern: hidden by default on mobile, toggleable via hamburger. Use `hidden lg:block` and mobile drawer. |
| 78-84 | Placeholder link | Low | "Get Mobile App" link uses `href="#"`. | Use actual store links or hide until available. |

### 4.2 Breadcrumbs (`src/components/Breadcrumbs.tsx`)

| Line | Issue | Severity | Description | Fix |
|------|-------|----------|-------------|-----|
| N/A | Clean implementation | - | No issues found. Good use of pathname and proper link handling. | - |

---

## 5. Styling

### 5.1 Global Styles (`app/globals.css`)

| Line | Issue | Severity | Description | Fix |
|------|-------|----------|-------------|-----|
| N/A | Missing font import | High | No font import for Inter or any custom fonts, but `tailwind.config.js` references `--font-inter` CSS variable. Text will fall back to system fonts. | Add font import (Google Fonts or local) and define `--font-inter` CSS variable. |
| 72-78 | Reduced motion handling | - | Good implementation of `prefers-reduced-motion`. | - |

### 5.2 Tailwind Config (`tailwind.config.js`)

| Line | Issue | Severity | Description | Fix |
|------|-------|----------|-------------|-----|
| 26 | Missing font variable | High | `fontFamily.sans` references `var(--font-inter)` which is never defined anywhere in the codebase. | Either define `--font-inter` CSS variable with Next.js font loading, or remove the variable reference. |
| 3-6 | Content paths correct | - | Properly includes both `app/` and `src/` directories. | - |

---

## 6. Configuration

### 6.1 Next.js Config (`next.config.js`)

| Line | Issue | Severity | Description | Fix |
|------|-------|----------|-------------|-----|
| 4-13 | Transpile non-existent packages | Low | `transpilePackages` includes packages that may not be fully implemented yet (`@app/ui`, etc.). This could cause build issues if imports exist. | Ensure all listed packages exist and export valid modules, or remove unused entries. |
| 84 | Standalone output correct | - | `output: 'standalone'` is correct for Vercel deployment. | - |

### 6.2 Vercel Config (`vercel.json`)

| Line | Issue | Severity | Description | Fix |
|------|-------|----------|-------------|-----|
| 4 | Single region | Low | Hardcoded to `syd1` (Sydney) region only. May cause latency for users in other regions. | Consider edge functions or multi-region deployment for global users. |
| 11-14 | Env vars in version control | Medium | `NEXT_PUBLIC_*` environment variables are committed to vercel.json. URL `body-recovery.vercel.app` may not match actual deployment. | Move to Vercel dashboard environment variables or use `.env` files. |

### 6.3 Package.json (`package.json`)

| Line | Issue | Severity | Description | Fix |
|------|-------|----------|-------------|-----|
| 11-13 | Missing vitest dependency | Medium | Test scripts (`vitest run`, `vitest`) reference vitest but it's not in devDependencies. Tests will fail. | Add `vitest` and `@vitest/coverage-v8` to devDependencies. |
| 14 | Missing ESLint config | Low | `lint` script exists but no ESLint config file visible. Next.js provides default but custom rules may be needed. | Consider adding `.eslintrc.json` for project-specific rules. |

### 6.4 TypeScript Config (`tsconfig.json`)

| Line | Issue | Severity | Description | Fix |
|------|-------|----------|-------------|-----|
| 22-26 | Path aliases to workspace packages | Low | Path aliases point to `../../packages/*/src` which assumes specific directory structure. May break if packages move. | Use TypeScript project references or ensure package paths are stable. |

---

## 7. Missing Features

| Feature | Severity | Description |
|---------|----------|-------------|
| Mobile responsive design | Critical | No responsive handling for sidebar or main content on mobile viewports. |
| Loading states | Medium | No `loading.tsx` files for route loading states. |
| Error boundaries | Medium | No `error.tsx` files for error handling. |
| Not-found page | Low | No `not-found.tsx` for 404 handling. |
| Font loading | High | Inter font referenced but never loaded. |
| Real data persistence | High | All data is mock/local state - no actual persistence. |
| Authentication | Medium | No auth implementation despite user data being shown. |

---

## 8. Recommendations

### Immediate (Pre-Launch)

1. **Fix mobile responsiveness** - Add responsive sidebar and layout handling
2. **Implement font loading** - Add Inter font via next/font
3. **Add vitest to dependencies** - Required for test scripts to work
4. **Fix hydration issues** - Use proper theme detection before hydration

### Short-Term (Post-MVP)

1. Add loading.tsx and error.tsx for all route segments
2. Implement actual save functionality for settings and body map
3. Replace mock data with real API/store integration
4. Add accessibility labels to interactive elements

### Long-Term

1. Consider multi-region deployment
2. Implement authentication
3. Add comprehensive E2E tests
4. Add PWA capabilities for offline use

---

## Files Reviewed

| Category | Files |
|----------|-------|
| App Router | `app/layout.tsx`, `app/providers.tsx`, `app/globals.css` |
| Dashboard | `app/(dashboard)/layout.tsx`, `page.tsx`, `body/page.tsx`, `history/page.tsx`, `progress/page.tsx`, `settings/page.tsx` |
| API Routes | `app/api/health/route.ts`, `app/api/cron/daily-summary/route.ts` |
| Components | `src/components/Sidebar.tsx`, `src/components/Breadcrumbs.tsx`, `src/components/index.ts` |
| Hooks | `src/hooks/useLocalStorage.ts`, `src/hooks/useMediaQuery.ts`, `src/hooks/index.ts` |
| Config | `next.config.js`, `vercel.json`, `package.json`, `tsconfig.json`, `tailwind.config.js` |

---

*Report generated by QA Agent*
