# Movement & Recovery Companion - Product Requirements Document

**Version:** 1.0
**Last Updated:** January 2026
**Status:** Active Development

---

## Executive Summary

Movement & Recovery Companion is an AI-driven fitness application that uniquely combines workout programming with injury awareness and health data integration. Unlike traditional fitness apps that ignore physical limitations, this app adapts workouts in real-time based on the user's body state, active injuries, and recovery metrics from wearables.

**Core Value Proposition:** Train smarter, not harder, with an AI coach that knows your body.

---

## Table of Contents

1. [User Personas](#user-personas)
2. [Core User Journeys](#core-user-journeys)
3. [Feature Requirements](#feature-requirements)
4. [Current Implementation Status](#current-implementation-status)
5. [Gap Analysis](#gap-analysis)
6. [Success Metrics](#success-metrics)
7. [MVP Definition](#mvp-definition)
8. [Release Roadmap](#release-roadmap)

---

## User Personas

### Primary Persona: Alex - The Injury-Aware Athlete

**Demographics:**
- Age: 28-45
- Fitness Level: Intermediate to advanced
- Training History: 2+ years consistent training
- Income: Mid to high

**Goals:**
- Continue training progress despite recurring injuries
- Avoid re-injury from pushing too hard
- Get personalized guidance without expensive personal training

**Pain Points:**
- Previous injuries flare up during certain movements
- Generic workout apps don't account for limitations
- Unsure when to push through discomfort vs. stop
- Tracking injuries across multiple apps is tedious

**Behaviors:**
- Uses Apple Watch or Garmin for health tracking
- Has seen physical therapists or sports medicine doctors
- Reads about exercise science and form
- Willing to modify workouts for long-term health

**Quote:** "I want to train hard, but I need something that understands my shoulder isn't 100%."

---

### Secondary Persona: Jordan - The Recovery-Focused Beginner

**Demographics:**
- Age: 35-55
- Fitness Level: Beginner returning to fitness
- Training History: Sporadic, often derailed by injury
- Income: Mid

**Goals:**
- Build sustainable exercise habit
- Prevent injuries before they happen
- Understand their body's signals better

**Pain Points:**
- Fear of getting hurt prevents starting
- Doesn't know which exercises are safe
- Overwhelmed by complex workout programs
- Poor recovery leads to burnout

**Behaviors:**
- Tracks sleep and steps via smartphone
- Prefers guided, low-risk workouts
- Values validation and reassurance
- Needs motivation on low-energy days

**Quote:** "I keep starting and stopping because something always hurts."

---

### Tertiary Persona: Sam - The Data-Driven Optimizer

**Demographics:**
- Age: 25-40
- Fitness Level: Advanced
- Training History: 5+ years
- Income: High

**Goals:**
- Optimize training based on recovery data
- Prevent overtraining and plateaus
- Track long-term progress metrics

**Pain Points:**
- Manually interpreting HRV and sleep data
- No unified view of training load vs. recovery
- Existing apps don't connect health data to workouts

**Behaviors:**
- Multiple wearables and tracking apps
- Exports data to spreadsheets
- A/B tests training approaches
- Pays for premium fitness tools

**Quote:** "Show me why today should be a deload day, don't just tell me."

---

## Core User Journeys

### Journey 1: Morning Readiness Check (Daily)

**Trigger:** User wakes up and opens app

**Flow:**
1. App syncs overnight health data (sleep, HRV, resting HR)
2. Dashboard shows Readiness Score (0-100) with factor breakdown
3. User sees personalized recommendation (Full/Moderate/Light/Rest)
4. Today's workout is displayed, adapted to readiness level
5. User decides to proceed, modify, or skip

**Success Criteria:**
- Readiness calculation completes in < 2 seconds
- Recommendation matches user's subjective feeling 80%+ of time
- User engagement with readiness feature > 70% of sessions

**Current Status:** UI implemented with mock data; health sync API exists but not connected to frontend

---

### Journey 2: Workout Execution with Mid-Session Adaptation

**Trigger:** User starts scheduled workout

**Flow:**
1. User reviews workout plan (exercises, sets, reps, weight)
2. User taps "Start Workout"
3. For each exercise:
   a. See target weight/reps and form cues
   b. Complete set and log actual performance
   c. If pain occurs, tap "Log Pain" or "Ask Coach"
   d. AI suggests modification or swap in real-time
4. Progress bar updates as exercises complete
5. Workout ends with summary and celebration

**Success Criteria:**
- < 3 taps to log a completed set
- Pain-to-modification flow < 30 seconds
- 90%+ of started workouts are completed

**Current Status:** Basic workout flow implemented; no set logging persistence; no completion celebration; coach integration works but context is static

---

### Journey 3: Pain Logging and Injury Tracking

**Trigger:** User experiences discomfort during or after training

**Flow:**
1. User navigates to Body Map (or quick action from workout)
2. Tap affected body region on visual body map
3. Select severity (Mild/Moderate/Severe)
4. Optionally describe pain type and context
5. Pain logged and affects future workout generation
6. If pattern detected, app suggests logging as injury

**Success Criteria:**
- Pain logged in < 15 seconds
- Pain data influences next workout within 24 hours
- Users log pain 3x more than competing apps

**Current Status:** Body map UI complete; pain logging UI exists but no persistence; no pattern detection

---

### Journey 4: Conversational Coaching During Workout

**Trigger:** User needs guidance mid-workout

**Flow:**
1. User taps "Ask Coach" from workout or navigation
2. Types or selects quick question
3. AI responds with context-aware advice (knows current exercise, injuries, readiness)
4. AI can suggest specific modifications
5. User implements suggestion and continues

**Success Criteria:**
- AI response latency < 3 seconds (streaming)
- Response is actionable in 1-2 sentences
- User satisfaction with AI advice > 80%

**Current Status:** Chat UI complete with streaming; API passes context; fallback responses work offline

---

### Journey 5: Progress Review and Personal Records

**Trigger:** User wants to see improvement over time

**Flow:**
1. User navigates to Profile > Progress
2. Sees workout streak, monthly count, avg readiness
3. Views weekly activity chart
4. Reviews personal bests by exercise
5. Can drill down into specific workout history

**Success Criteria:**
- Load progress data in < 1 second
- Personal records automatically detected and celebrated
- User visits progress view 2x/week minimum

**Current Status:** Progress UI complete with mock data; no actual workout history; no PR detection

---

## Feature Requirements

### P0 - Must Have (Launch Blockers)

| ID | Feature | Description | Status |
|----|---------|-------------|--------|
| P0-01 | User Authentication | Email/password or OAuth sign-up/login with secure session | Not implemented |
| P0-02 | Data Persistence | All user data (workouts, pain, settings) saved to database | Not implemented |
| P0-03 | Health Data Sync | Connect Apple Health / Google Fit for sleep, HRV, activity | API exists, not connected |
| P0-04 | Workout Logging | Log completed sets with actual weight/reps, persist to DB | Not implemented |
| P0-05 | Basic Empty States | Show meaningful UI when no data exists (first-time user) | Not implemented |
| P0-06 | Basic Loading States | Show skeleton/spinner during data fetches | Partial (chat only) |
| P0-07 | Error Handling | Graceful failures with user-friendly messages | Partial |
| P0-08 | Pain Log Persistence | Save pain logs and associate with workouts | Not implemented |
| P0-09 | PWA Icons | App icons for home screen installation | Not implemented |
| P0-10 | Offline Fallback | Basic functionality when network unavailable | Partial (chat only) |

---

### P1 - Should Have (Core Experience)

| ID | Feature | Description | Status |
|----|---------|-------------|--------|
| P1-01 | Workout Completion Celebration | Confetti/animation when workout finished | Not implemented |
| P1-02 | Settings Persistence | Save notification prefs, units, theme choice | Not implemented |
| P1-03 | Injury to Workout Integration | Active injuries automatically constrain workout generation | API implemented, needs frontend |
| P1-04 | Exercise Video/Image | Show form guidance for each exercise | Schema exists, no content |
| P1-05 | Rest Timer | Configurable timer between sets | Not implemented |
| P1-06 | Workout History | View past workouts with performance data | Not implemented |
| P1-07 | Onboarding Flow | First-time setup for preferences, equipment, injuries | Not implemented |
| P1-08 | Personal Record Detection | Auto-detect and celebrate new PRs | Not implemented |
| P1-09 | Exercise Swap During Workout | Let user swap exercise without coach chat | Not implemented |
| P1-10 | Readiness Trend Visualization | Show readiness over time, not just today | Not implemented |

---

### P2 - Nice to Have (Enhancement)

| ID | Feature | Description | Status |
|----|---------|-------------|--------|
| P2-01 | Document Upload | Upload PT notes/MRI for AI context | Schema exists, no upload flow |
| P2-02 | Multiple Training Locations | Different equipment at home vs gym | Preference schema exists |
| P2-03 | Social Features | Share workouts, compete with friends | Not implemented |
| P2-04 | Advanced Analytics | Muscle balance, volume trends, fatigue | Not implemented |
| P2-05 | Wearable Integration | Direct watch app or complication | Not implemented |
| P2-06 | Voice Commands | Hands-free set logging during workout | Not implemented |
| P2-07 | Periodization | Multi-week training cycles | Not implemented |
| P2-08 | Nutrition Integration | Connect MyFitnessPal, track macros | Not implemented |
| P2-09 | Therapist Portal | PT can view patient's data with consent | Not implemented |
| P2-10 | AI Form Analysis | Use camera to check exercise form | Not implemented |

---

## Current Implementation Status

### Pages Implemented

| Page | Route | Core UI | Data Integration | Completeness |
|------|-------|---------|------------------|--------------|
| Today (Dashboard) | `/` | Complete | Mock only | 40% |
| Workout Execution | `/workout` | Complete | Mock only | 35% |
| Body Map | `/body` | Complete | Mock only | 35% |
| AI Coach Chat | `/chat` | Complete | API connected | 70% |
| Profile/Settings | `/profile` | Complete | Mock only | 30% |

### APIs Implemented

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `POST /api/ai/chat` | Streaming AI conversation | Working |
| `POST /api/workouts/generate` | AI workout generation | Working |
| `POST /api/health/sync` | Health data ingestion | Working |

### Database Schema

Complete schema exists for: Users, Preferences, Body Models, Injuries, Workouts, Exercise Logs, Pain Logs, Health Snapshots, Exercise Library.

**Gap:** No CRUD APIs for most tables; frontend doesn't call any data APIs.

---

## Gap Analysis

### Critical Gaps (Blocking Launch)

1. **No Authentication Flow**
   - Users cannot sign up or log in
   - All data is session-only
   - Impact: Cannot retain users or their data

2. **No Data Persistence**
   - Workouts completed are lost on refresh
   - Pain logs don't save
   - Settings reset every session
   - Impact: App provides no lasting value

3. **Missing Empty States**
   - New users see mock data instead of onboarding
   - No guidance on what to do first
   - Impact: Confusing first experience

4. **Missing Loading States**
   - Data fetches show nothing or stale data
   - Impact: Feels broken or slow

5. **No PWA Assets**
   - Missing icons prevent proper home screen install
   - Impact: Reduced engagement

### Experience Gaps (Degrading Quality)

1. **No Workout Completion Celebration**
   - Workout ends without acknowledgment
   - Impact: Missed dopamine hit, reduced motivation

2. **No Exercise Details**
   - Users can't see form cues or video
   - Impact: Risk of poor form, injury

3. **No Rest Timer**
   - Users must track rest manually
   - Impact: Friction, inconsistent rest

4. **Static Coach Context**
   - AI doesn't know what set user is on
   - Impact: Less relevant advice

---

## Success Metrics

### North Star Metric

**Weekly Active Workout Completions (WAWC):** Number of workouts completed per week per active user.

Target: 3.0 WAWC within 90 days of sign-up

---

### Acquisition Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| Sign-up Rate | Visitors who complete registration | > 15% |
| Activation Rate | Sign-ups who complete first workout | > 60% |
| Health Connect Rate | Users who link Apple Health/Google Fit | > 40% |

### Engagement Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| Daily Active Users (DAU) | Unique users opening app per day | Growth 10% MoM |
| Session Duration | Average time in app per session | > 8 minutes |
| Readiness Check Rate | Users who view readiness score daily | > 70% |
| Pain Log Rate | % of workouts with at least 1 pain log | 15-25% (healthy range) |
| Coach Chat Usage | % of workouts with AI interaction | > 30% |

### Retention Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| D7 Retention | Users returning 7 days after sign-up | > 50% |
| D30 Retention | Users returning 30 days after sign-up | > 30% |
| Workout Streak Avg | Average consecutive workout days | > 4 days |

### Outcome Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| Injury Incident Rate | New injuries reported per 100 workouts | < 2 |
| Workout Completion Rate | Started workouts that finish | > 85% |
| NPS Score | Net Promoter Score from surveys | > 40 |

---

## MVP Definition

### What is MVP

The Minimum Viable Product delivers the core value proposition: **an injury-aware workout experience with AI coaching**.

**MVP Scope:**

1. **Authentication**
   - Email/password sign-up and login
   - Persistent sessions

2. **Onboarding**
   - Basic profile setup (name, experience level)
   - Equipment selection
   - Existing injury declaration

3. **Readiness Dashboard**
   - Manual readiness input (until health sync MVP)
   - Workout recommendation based on input
   - Quick actions to workout, body, coach

4. **Workout Execution**
   - Pre-generated workout based on preferences
   - Set-by-set logging with persistence
   - Pain logging during workout
   - Completion celebration

5. **Body Tracking**
   - Visual body map
   - Pain logging with persistence
   - Active injuries list

6. **AI Coach**
   - Streaming chat with injury context
   - Quick suggestion chips

7. **Profile**
   - Basic stats (workouts completed, streak)
   - Settings for units and notifications

**MVP Excludes:**

- Health data sync (Apple/Google)
- Video exercise demonstrations
- Social features
- Advanced analytics
- Document upload
- Multiple locations

---

### MVP Success Criteria

1. User can complete full journey: Sign up -> Set up -> Workout -> Track pain -> View progress
2. All data persists across sessions
3. AI coach provides contextually relevant advice
4. App works offline for basic viewing (not creation)
5. PWA installable on iOS and Android

---

## Release Roadmap

### Phase 1: Foundation (MVP) - 6 Weeks

**Week 1-2: Authentication & Data Layer**
- Implement NextAuth.js with email/password
- Build CRUD APIs for users, preferences
- Connect frontend to user API
- Add loading and empty states to all pages

**Week 3-4: Core Data Features**
- Workout logging API and persistence
- Pain log API and persistence
- Connect Body page to real data
- Connect Workout page to real data

**Week 5: Polish & PWA**
- Workout completion celebration
- PWA manifest and icons
- Offline data caching strategy
- Error boundaries and fallbacks

**Week 6: Onboarding & QA**
- First-time user onboarding flow
- Equipment and injury setup
- End-to-end testing
- Bug fixes and polish

**Deliverable:** Functional MVP ready for beta users

---

### Phase 2: Health Integration - 4 Weeks

**Week 7-8: Apple Health / Google Fit**
- Health data permissions flow
- Background sync implementation
- Readiness auto-calculation
- Readiness trend visualization

**Week 9-10: Enhanced Workout Experience**
- Rest timer between sets
- Exercise swap during workout
- Personal record detection
- Exercise images/videos

**Deliverable:** Full health-aware workout experience

---

### Phase 3: Intelligence - 4 Weeks

**Week 11-12: Advanced AI Features**
- Improved workout generation with constraints
- Proactive coach suggestions
- Pattern detection for recurring pain
- Workout difficulty adjustment

**Week 13-14: Analytics & Progress**
- Workout history view
- Volume and frequency trends
- Muscle balance visualization
- Progress photo comparison

**Deliverable:** Data-driven training optimization

---

### Phase 4: Growth - Ongoing

- Social features (sharing, friends)
- Multiple training locations
- Document upload for PT notes
- Wearable complications
- Voice commands
- Periodization support

---

## Appendix

### Technical Architecture

```
Frontend (Next.js App Router)
    |
    |-- Pages: Today, Workout, Body, Chat, Profile
    |-- Components: Navigation, ReadinessRing, BodyMap
    |-- State: React hooks (future: consider Zustand)
    |
API Layer (Next.js API Routes)
    |
    |-- /api/auth/* (NextAuth.js)
    |-- /api/ai/chat (Vercel AI SDK)
    |-- /api/workouts/* (CRUD)
    |-- /api/health/* (sync)
    |-- /api/injuries/* (CRUD)
    |
Database (Vercel Postgres + Drizzle ORM)
    |
    |-- users, user_preferences
    |-- injuries, pain_logs
    |-- workouts, exercise_logs
    |-- health_snapshots
    |-- exercises (reference)
    |
External Services
    |
    |-- OpenAI (workout generation, chat)
    |-- Apple Health / Google Fit (health data)
    |-- Vercel Blob (document storage)
```

### Competitive Landscape

| Feature | Our App | Strong | Fitbod | Hevy |
|---------|---------|--------|--------|------|
| AI Workout Generation | Yes | No | Yes | No |
| Injury Awareness | Yes | No | No | No |
| Health Data Integration | Yes | Yes | No | No |
| Mid-Workout AI Coach | Yes | No | No | No |
| Body Pain Mapping | Yes | No | No | No |
| Readiness Score | Yes | Yes | No | No |
| Exercise Library | Yes | No | Yes | Yes |
| Workout Logging | Yes | No | Yes | Yes |
| Social Features | Future | Yes | No | Yes |

**Key Differentiators:**
1. Only app combining injury tracking with workout adaptation
2. Real-time AI coaching during workouts (not just pre-built plans)
3. Visual body map for pain correlation
4. Health data influences daily recommendations

---

### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| AI gives unsafe advice | Medium | High | Clear disclaimers; never push through pain |
| Health sync unreliable | Medium | Medium | Fallback to manual input |
| Users don't log pain | High | Medium | Friction-free logging; prompts during workout |
| Complex onboarding abandonment | Medium | High | Progressive disclosure; skip option |
| AI latency frustrates users | Low | Medium | Streaming responses; offline fallback |

---

### Glossary

- **Readiness Score:** 0-100 metric combining sleep, HRV, recovery, and body status
- **Constraint:** Rule preventing certain exercises (e.g., "avoid overhead pressing")
- **Body Model:** User's personal injury/limitation profile
- **Set Log:** Record of one set of an exercise (weight, reps, difficulty)
- **Pain Log:** Record of discomfort at a body region with severity

---

*Document maintained by Product Team. For questions, contact the project lead.*
