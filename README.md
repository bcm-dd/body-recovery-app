# Body Recovery App

A mobile-first, privacy-centric recovery guidance application built with a cross-platform monorepo architecture.

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0

### Installation

```bash
# Install pnpm if you haven't already
npm install -g pnpm@9.15.0

# Install all dependencies
pnpm install
```

### Running the Apps

#### Mobile App (Expo)

```bash
# Start the Expo development server
pnpm dev:mobile

# Or run specific platform builds
pnpm --filter @app/mobile dev:ios
pnpm --filter @app/mobile dev:android
```

#### Web App (Next.js)

```bash
# Start the Next.js development server
pnpm dev:web
```

#### Run Both Apps

```bash
# Start all apps in parallel
pnpm dev
```

## Project Structure

```
body-recovery-app/
├── apps/
│   ├── mobile/        # Expo React Native app (Expo Router)
│   └── web/           # Next.js 15 web app (App Router)
├── packages/
│   ├── domain/        # Shared business logic (planning engine, safety engine)
│   ├── ui/            # Shared UI components (Tamagui)
│   ├── data/          # Data layer (Zustand stores, health adapters)
│   └── copy/          # Centralized strings
├── ops/               # Planning docs and consolidated build plan
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
└── tsconfig.json
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Run all apps in development mode |
| `pnpm dev:mobile` | Run mobile app only |
| `pnpm dev:web` | Run web app only |
| `pnpm build` | Build all packages and apps |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm clean` | Clean all build artifacts |

## Package Dependencies

```
@app/domain  <── Pure TypeScript, no dependencies on other packages
    │
    ├── @app/data  <── Depends on domain for types
    │
    ├── @app/copy  <── Pure TypeScript strings
    │
    └── @app/ui    <── Depends on domain + copy
         │
         ├── @app/mobile  <── Uses all packages
         │
         └── @app/web     <── Uses all packages
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| Monorepo | pnpm + Turborepo |
| Mobile | Expo (Development Build) + Expo Router |
| Web | Next.js 15 (App Router) |
| UI | Tamagui (cross-platform) |
| State | Zustand v5 |
| Persistence | MMKV (mobile) / localStorage (web) |

## Backend Integration

This MVP runs entirely offline with local persistence. To add backend sync later:

1. **API Client**: Add API endpoints in `packages/data/src/api/`
2. **Sync Logic**: Implement sync queue in `packages/data/src/sync/`
3. **Environment Variables**: Add API URLs to `.env` files
4. **Web API Routes**: Add Next.js API routes in `apps/web/app/api/`

See `/ops/06_consolidated_build_plan.md` for the complete implementation roadmap.

## Documentation

- [Consolidated Build Plan](/ops/06_consolidated_build_plan.md) - Full MVP roadmap and task assignments
- [Architecture & Monorepo](/ops/03_architecture_monorepo.md) - Technical architecture details
- [Domain & Engines](/ops/02_domain_and_engines.md) - Business logic specifications
- [Safety & Compliance](/ops/05_safety_compliance.md) - Safety engine and compliance requirements

## Development Notes

### Adding Dependencies

```bash
# Add to a specific package
pnpm add <package> --filter @app/<workspace>

# Add as dev dependency to root
pnpm add -D <package> -w
```

### Running Commands in Specific Workspaces

```bash
pnpm --filter @app/mobile <command>
pnpm --filter @app/web <command>
pnpm --filter @app/domain <command>
```

### Remote Caching (Optional)

Enable Turborepo remote caching for faster CI builds:

```bash
npx turbo login
npx turbo link
```

## License

Private - All rights reserved.
