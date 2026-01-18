# Movement & Recovery Companion

An AI-driven movement and recovery coaching app with clinical context, deep device integration, and behavioural intelligence that helps people move consistently through understanding, not gamification.

## Overview

This app transcends typical fitness tracking by providing:

- **Clinical Context**: Understands injuries, surgeries, chronic conditions, and constraints
- **Behavioural Intelligence**: Learns when you train vs when scheduled, resistance patterns, and compliance
- **Health Integration**: Deep integration with HealthKit (iOS) and Health Connect (Android)
- **AI-Powered Coaching**: Claude-powered workout generation and conversational adaptation

## Project Structure

```
├── src/                          # React Native mobile app
│   ├── api/                      # API client and sync logic
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Base components (Button, Card, Input, Text)
│   │   ├── body/                 # Body map components
│   │   ├── readiness/            # Readiness ring visualization
│   │   └── workout/              # Workout execution components
│   ├── features/                 # Feature screens
│   │   ├── today/                # Dashboard and readiness
│   │   ├── plan/                 # Calendar and scheduling
│   │   ├── body/                 # Body model and injury management
│   │   ├── progress/             # Progress tracking and insights
│   │   ├── profile/              # User profile and settings
│   │   ├── workout/              # Workout execution
│   │   └── settings/             # App settings
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility libraries
│   ├── navigation/               # React Navigation setup
│   ├── store/                    # Zustand state management
│   ├── theme/                    # Design tokens and theming
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Helper utilities
│
├── backend/                      # Vercel-hosted Next.js backend
│   ├── app/api/                  # API routes
│   │   ├── ai/chat/              # Streaming AI conversation
│   │   ├── health/sync/          # Health data synchronization
│   │   └── workouts/generate/    # AI workout generation
│   └── db/                       # Database schema (Drizzle ORM)
│
└── docs/                         # Project documentation
```

## Tech Stack

### Mobile App (React Native)
- **React Native CLI** with TypeScript
- **React Navigation** for navigation
- **Zustand** for state management
- **React Native Reanimated** for animations
- **MMKV** for fast local storage
- **TanStack Query** for server state

### Backend (Vercel)
- **Next.js** API routes
- **Vercel Postgres** with Drizzle ORM
- **Vercel KV** for caching/sessions
- **Vercel Blob** for document storage
- **AI SDK** with Claude for intelligence

## Core Features (MVP)

1. **Today Screen** - Readiness ring, daily plan, quick actions
2. **Workout Execution** - Exercise cards, set logging, rest timer, haptic feedback
3. **Body Map** - Pain logging and injury visualization
4. **Readiness Calculation** - Sleep, HRV, load, and body status factors
5. **AI Workout Generation** - Constraint-aware session planning
6. **Injury Management** - Track injuries and auto-apply constraints

## The Three Intelligence Models

### Body Model
Persistent representation of the user's physical self:
- Injuries (current and historical)
- Surgeries and restrictions
- Chronic conditions
- Auto-derived constraints

### Behavioural Model
Understanding actual behaviour patterns:
- When they train vs when scheduled
- Resistance patterns and triggers
- Compliance and restart behaviour

### Readiness Model
Real-time assessment combining:
- Sleep quality and duration
- HRV and resting heart rate
- Training load
- Active injuries

## Design Principles

- **Offline-first**: Workouts execute fully offline
- **Privacy-centric**: On-device processing where possible
- **Compassionate**: No guilt, no fake cheerfulness
- **Progressive simplicity**: Day one is radically simple

## Getting Started

### Prerequisites
- Node.js 18+
- React Native development environment
- iOS Simulator / Android Emulator

### Installation

```bash
# Install mobile app dependencies
npm install

# Install backend dependencies
cd backend && npm install

# iOS pods (from root)
cd ios && pod install

# Run iOS
npm run ios

# Run Android
npm run android

# Run backend locally
cd backend && npm run dev
```

### Environment Variables

Create `.env` files:

**Backend (.env)**
```
POSTGRES_URL=
ANTHROPIC_API_KEY=
```

## Documentation

- [Project Brief](./movement-companion-handoff.md) - Full vision and requirements
- [Technical Architecture](./movement-companion-technical-addendum.md) - System design
- [UX Specification](./movement-companion-ux-addendum.md) - Interaction design

## License

Private - All rights reserved
