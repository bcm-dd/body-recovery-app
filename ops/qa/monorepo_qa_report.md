# Monorepo Configuration QA Report

**Date:** 2026-01-24
**Reviewer:** QA Agent
**Repository:** body-recovery-app
**Branch:** claude/setup-clair-orchestrator-SDOOZ

---

## Executive Summary

This QA report identifies **14 issues** across the monorepo configuration:
- **Critical:** 2 issues
- **High:** 4 issues
- **Medium:** 5 issues
- **Low:** 3 issues

The most critical issues involve missing ESLint dependencies that would cause the entire linting pipeline to fail, and a phantom `@app/types` package reference in the mobile app's TypeScript configuration.

---

## 1. Root Configuration

### 1.1 package.json

| Issue | Severity | Location | Description |
|-------|----------|----------|-------------|
| Missing ESLint dependencies | **CRITICAL** | Line 31-37 | The root `devDependencies` is missing all ESLint-related packages required by `.eslintrc.js` |

**Details:**
The root `package.json` contains:
```json
"devDependencies": {
  "next": "15.1.0",
  "turbo": "^2.3.0",
  "typescript": "^5.4.0",
  "prettier": "^3.2.0",
  "vercel": "^39.0.0"
}
```

**Missing packages required by `.eslintrc.js`:**
- `eslint`
- `@typescript-eslint/parser`
- `@typescript-eslint/eslint-plugin`
- `eslint-plugin-import`
- `eslint-config-prettier`
- `eslint-import-resolver-typescript`

**Suggested Fix:**
Add to root `devDependencies`:
```json
"eslint": "^8.57.0",
"@typescript-eslint/eslint-plugin": "^7.0.0",
"@typescript-eslint/parser": "^7.0.0",
"eslint-config-prettier": "^9.1.0",
"eslint-plugin-import": "^2.29.0",
"eslint-import-resolver-typescript": "^3.6.0"
```

### 1.2 pnpm-workspace.yaml

**Status:** OK

The workspace configuration correctly defines:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 1.3 turbo.json

**Status:** OK (with minor note)

The Turbo configuration is well-structured with proper task dependencies. All tasks correctly use `dependsOn: ["^build"]` for dependency packages.

**Note:** The `lint` task will fail until ESLint dependencies are added.

---

## 2. TypeScript Configuration

### 2.1 Root tsconfig.json

**Status:** OK

Good base configuration with strict mode enabled.

### 2.2 Package-level TypeScript Configs

| Issue | Severity | Location | Description |
|-------|----------|----------|-------------|
| Phantom package reference | **CRITICAL** | `apps/mobile/tsconfig.json:19` | References `@app/types` which does not exist |
| Strict mode disabled | **MEDIUM** | `packages/ui/tsconfig.json:11` | `strict: false` inconsistent with monorepo standards |
| Target version mismatch | **MEDIUM** | `packages/data/tsconfig.json:4` | Uses `ES2020` while root specifies `ES2022` |
| Invalid $schema | **LOW** | `packages/ui/tsconfig.json:1` | Uses JSON schema URL instead of TypeScript schema |
| Conflicting config | **LOW** | `packages/domain/tsconfig.json:4-5` | Sets `outDir` but `noEmit: true` in extended base |

**Details:**

**apps/mobile/tsconfig.json** (Line 19):
```json
"paths": {
  "@app/types": ["../../packages/types/src"]  // Package does not exist!
}
```
The `packages/types` directory does NOT exist in the repository.

**packages/ui/tsconfig.json** (Line 11):
```json
"strict": false
```
This is inconsistent with the root config which has `"strict": true`.

**packages/data/tsconfig.json** (Line 4):
```json
"target": "ES2020"
```
Root config specifies `"target": "ES2022"`.

**Suggested Fixes:**
1. Either create `packages/types` or remove the path mapping from mobile tsconfig
2. Set `"strict": true` in packages/ui/tsconfig.json
3. Update packages/data/tsconfig.json to use `"target": "ES2022"`

---

## 3. Vercel Configuration

### 3.1 Root vercel.json

**Status:** OK

Well-configured with:
- Proper build command using Turbo
- Security headers configured
- Cron job for daily summary
- Region set to Sydney (syd1)

### 3.2 apps/web/vercel.json

**Status:** OK

Properly configures function settings with appropriate memory and timeout limits.

### 3.3 .vercelignore

**Status:** OK

Correctly excludes mobile app, test files, and development artifacts.

---

## 4. Linting Configuration

### 4.1 .eslintrc.js

| Issue | Severity | Location | Description |
|-------|----------|----------|-------------|
| Unused configuration | **HIGH** | All lines | Config cannot run without dependencies (see 1.1) |

The ESLint configuration file is well-structured but completely non-functional without the required dependencies.

**Configuration references:**
- `@typescript-eslint/parser` (Line 4)
- `@typescript-eslint/eslint-plugin` (Line 5)
- `eslint-plugin-import` (Line 5)
- `eslint-config-prettier` (Line 11)
- `eslint-import-resolver-typescript` (Line 18-21)

### 4.2 .prettierrc

**Status:** OK

Standard configuration with sensible defaults.

---

## 5. Build Pipeline

### 5.1 Missing Package Scripts

| Issue | Severity | Location | Description |
|-------|----------|----------|-------------|
| Missing lint script | **HIGH** | `packages/domain/package.json` | No `lint` script defined |
| Missing test scripts | **HIGH** | `packages/ui/package.json`, `packages/copy/package.json` | No test scripts defined |

**Details:**

**packages/domain/package.json** does not have a `lint` script:
```json
"scripts": {
  "build": "tsc",
  "typecheck": "tsc --noEmit",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "clean": "rm -rf dist"
  // No "lint" script!
}
```

This will cause `turbo run lint` to fail for the domain package.

**packages/ui/package.json** and **packages/copy/package.json** have no test scripts, which will cause `turbo run test` to skip these packages or fail.

**Suggested Fix for domain:**
```json
"lint": "eslint src --ext .ts,.tsx",
"lint:fix": "eslint src --ext .ts,.tsx --fix"
```

**Suggested Fix for ui and copy:**
Either add proper test configurations or add placeholder scripts:
```json
"test": "echo 'No tests configured'"
```

### 5.2 Turbo Tasks

| Task | Status | Notes |
|------|--------|-------|
| build | OK | Properly configured with caching |
| dev | OK | Persistent mode enabled correctly |
| lint | BLOCKED | Missing dependencies and domain script |
| test | PARTIAL | Missing in some packages |
| typecheck | OK | Works correctly |
| clean | OK | Cache disabled appropriately |

---

## 6. Dependencies

### 6.1 Missing Dependencies

| Issue | Severity | Location | Description |
|-------|----------|----------|-------------|
| Missing vitest | **HIGH** | `apps/web/package.json` | Test scripts reference vitest but it's not in dependencies |
| Missing react-native-web | **MEDIUM** | `apps/web/package.json` | Webpack config aliases react-native to react-native-web |

**Details:**

**apps/web/package.json** has these scripts:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```
But `vitest` is not listed in devDependencies. It exists in `packages/data/package.json` but not in web.

**apps/web/next.config.js** (Line 70):
```js
config.resolve.alias = {
  ...config.resolve.alias,
  'react-native$': 'react-native-web',
};
```
But `react-native-web` is not in the dependencies.

**Suggested Fix:**
Add to `apps/web/package.json` devDependencies:
```json
"vitest": "^2.1.0",
"react-native-web": "^0.19.0"
```

### 6.2 Version Mismatches

| Issue | Severity | Location | Description |
|-------|----------|----------|-------------|
| @types/node mismatch | **MEDIUM** | Multiple | Different versions across packages |

**Details:**
- `apps/web/package.json`: `"@types/node": "^22.0.0"`
- `packages/data/package.json`: `"@types/node": "^20.0.0"`

**Suggested Fix:**
Standardize to `"@types/node": "^22.0.0"` across all packages or use a single version in root devDependencies.

### 6.3 Workspace Dependencies

**Status:** OK

All workspace dependencies use `workspace:*` protocol correctly:
- `@app/ui`, `@app/domain`, `@app/data`, `@app/copy` are properly linked

---

## 7. Summary of Required Actions

### Critical (Must Fix)

1. **Add ESLint dependencies to root package.json**
   - File: `/home/user/body-recovery-app/package.json`
   - Add: eslint, @typescript-eslint/*, eslint-plugin-import, eslint-config-prettier, eslint-import-resolver-typescript

2. **Fix phantom @app/types reference**
   - File: `/home/user/body-recovery-app/apps/mobile/tsconfig.json`
   - Either create packages/types or remove the path mapping

### High Priority

3. **Add vitest to apps/web devDependencies**
   - File: `/home/user/body-recovery-app/apps/web/package.json`

4. **Add lint script to packages/domain**
   - File: `/home/user/body-recovery-app/packages/domain/package.json`

5. **Add test scripts to packages/ui and packages/copy**
   - Files: `/home/user/body-recovery-app/packages/ui/package.json`, `/home/user/body-recovery-app/packages/copy/package.json`

### Medium Priority

6. **Add react-native-web to apps/web**
   - File: `/home/user/body-recovery-app/apps/web/package.json`

7. **Enable strict mode in packages/ui**
   - File: `/home/user/body-recovery-app/packages/ui/tsconfig.json`

8. **Standardize TypeScript target version**
   - File: `/home/user/body-recovery-app/packages/data/tsconfig.json`

9. **Standardize @types/node version**
   - Files: apps/web/package.json, packages/data/package.json

### Low Priority

10. **Fix tsconfig.json $schema URL in packages**
    - File: `/home/user/body-recovery-app/packages/ui/tsconfig.json`

---

## 8. Verification Commands

After fixes are applied, run these commands to verify:

```bash
# Install dependencies
pnpm install

# Verify linting works
pnpm lint

# Verify TypeScript compilation
pnpm typecheck

# Verify build pipeline
pnpm build

# Verify tests
pnpm test

# Verify web app build specifically
pnpm build:web
```

---

## Appendix: Files Reviewed

| File | Path | Status |
|------|------|--------|
| Root package.json | `/home/user/body-recovery-app/package.json` | Issues found |
| pnpm-workspace.yaml | `/home/user/body-recovery-app/pnpm-workspace.yaml` | OK |
| turbo.json | `/home/user/body-recovery-app/turbo.json` | OK |
| Root tsconfig.json | `/home/user/body-recovery-app/tsconfig.json` | OK |
| .eslintrc.js | `/home/user/body-recovery-app/.eslintrc.js` | Blocked |
| .prettierrc | `/home/user/body-recovery-app/.prettierrc` | OK |
| vercel.json | `/home/user/body-recovery-app/vercel.json` | OK |
| .vercelignore | `/home/user/body-recovery-app/.vercelignore` | OK |
| .gitignore | `/home/user/body-recovery-app/.gitignore` | OK |
| apps/web/package.json | `/home/user/body-recovery-app/apps/web/package.json` | Issues found |
| apps/web/tsconfig.json | `/home/user/body-recovery-app/apps/web/tsconfig.json` | OK |
| apps/web/vercel.json | `/home/user/body-recovery-app/apps/web/vercel.json` | OK |
| apps/web/next.config.js | `/home/user/body-recovery-app/apps/web/next.config.js` | Minor issue |
| apps/mobile/package.json | `/home/user/body-recovery-app/apps/mobile/package.json` | OK |
| apps/mobile/tsconfig.json | `/home/user/body-recovery-app/apps/mobile/tsconfig.json` | Issue found |
| packages/ui/package.json | `/home/user/body-recovery-app/packages/ui/package.json` | Issue found |
| packages/ui/tsconfig.json | `/home/user/body-recovery-app/packages/ui/tsconfig.json` | Issues found |
| packages/domain/package.json | `/home/user/body-recovery-app/packages/domain/package.json` | Issue found |
| packages/domain/tsconfig.json | `/home/user/body-recovery-app/packages/domain/tsconfig.json` | Minor issue |
| packages/data/package.json | `/home/user/body-recovery-app/packages/data/package.json` | Minor issue |
| packages/data/tsconfig.json | `/home/user/body-recovery-app/packages/data/tsconfig.json` | Issue found |
| packages/copy/package.json | `/home/user/body-recovery-app/packages/copy/package.json` | Issue found |
| packages/copy/tsconfig.json | `/home/user/body-recovery-app/packages/copy/tsconfig.json` | OK |

---

*Report generated by QA Agent*
