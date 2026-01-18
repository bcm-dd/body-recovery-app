# Movement & Recovery Companion - Claude Code Handoff

## Project Vision

Build an AI-driven movement and recovery companion app that transcends typical fitness tracking. This is not a gym app - it's a health-informed movement coach with full clinical context, deep device integration, and behavioural intelligence that helps people move consistently through understanding, not gamification.

The app knows your body (injuries, surgeries, chronic conditions), understands your behaviour patterns, integrates with your health data, and proactively guides daily movement across gym, pool, home, and rehab contexts.

---

## Core Principles

### Design Philosophy
- **Minimum viable input**: The app should know before you ask. Infer from health data, behaviour patterns, and context rather than asking questions.
- **Suggest, don't demand**: Every recommendation has an alternative. User is always in control.
- **Compassionate accountability**: No guilt, no fake cheerfulness. Honest, warm, realistic.
- **Progressive simplicity**: Day one is radically simple. Complexity reveals itself over time as relevant.

### Technical Philosophy
- **React Native**: Cross-platform iOS/Android with native device features
- **Offline-first**: Workouts execute fully offline. Sync when connected.
- **Privacy-centric**: Sensitive health data with clear ownership, on-device processing where possible
- **AI as nervous system**: Not a feature - the intelligence layer that makes everything work

---

## The Three Intelligence Models

### 1. Body Model
A persistent, evolving representation of the user's physical self. This is foundational context for every AI decision.

**Structural Data:**
- Injury history with healing timelines and current status
- Surgical interventions with dates, procedures, restrictions
- Chronic conditions and management strategies
- Joint health baselines and mobility limitations
- Muscle imbalances identified over time

**Document-Extracted Data:**
- MRI/imaging findings parsed into structured constraints
- Physio protocols with exercises, progressions, timelines
- Surgical reports with movement restrictions
- Specialist recommendations and clearances

**Learned Data:**
- Exercise performance patterns (struggles vs excels)
- Personal recovery rates between sessions
- Pain triggers and patterns
- Strength curves and plateau points
- Preferred movement variations

**Real-Time Signals:**
- Today's HRV, sleep quality, resting heart rate
- Recent training load and recovery status
- Current body map status (flagged areas)
- Walking asymmetry trends from HealthKit/Health Connect

### 2. Behavioural Model
Understanding how the user actually behaves, not how they say they will.

**Temporal Patterns:**
- When they actually train vs when scheduled
- Morning vs evening performance differences
- Day-of-week consistency patterns
- Seasonal and life-event variations

**Resistance Patterns:**
- What triggers skipped sessions
- Which exercises they avoid
- Response to different motivation approaches
- Session length threshold before dropout

**Compliance Patterns:**
- Rehab adherence rates
- Notification responsiveness (which work, which ignored)
- Restart behaviour after gaps
- Response to modified plans

### 3. Readiness Model
Real-time assessment combining body model state with current signals.

**Inputs:**
- Sleep duration and quality (from health data)
- HRV trend (not just today's number)
- Recent training load vs capacity
- Active injuries or flagged body areas
- Calendar stress indicators
- Time since last session per muscle group

**Output:**
- Readiness score with reasoning
- Recommended session modifications
- Alternative session suggestions
- Rest day triggers

---

## Document Intelligence System

### Supported Document Types

**MRI/Imaging Reports:**
- Extract anatomical findings (tears, bulges, degeneration)
- Map severity indicators
- Link affected structures to movement pattern constraints
- Parse radiologist recommendations

**Physio Programs:**
- Extract prescribed exercises with sets/reps/frequency
- Identify progression criteria and timelines
- Parse contraindicated movements
- Map to exercise library equivalents

**Surgical Reports:**
- Extract procedure details
- Parse post-op restrictions with timeframes
- Identify rehabilitation protocol references

**Specialist Letters:**
- Extract diagnosis confirmations
- Parse activity clearances or restrictions
- Identify medication implications for training

### Ingestion Pipeline
1. **Capture**: Photo, PDF upload, or screenshot
2. **OCR & Extraction**: Convert to text, identify document type
3. **Medical NLP**: Extract entities - body parts, conditions, measurements, timeframes, exercises
4. **Constraint Mapping**: Convert findings to actionable constraints (e.g., "avoid overhead pressing" → flag all overhead exercises in library)
5. **User Confirmation**: Show extracted data in plain English, allow corrections
6. **Integration**: Merge into body model, update exercise filtering

### Uncertainty Handling
- Confidence scoring on all extractions
- Flag ambiguous findings for user clarification
- Never assume when safety is involved
- Suggest professional consultation when appropriate

---

## Exercise Intelligence

### Exercise Knowledge Graph
Every exercise tagged with:
- Primary and secondary muscles
- Joint actions (flexion, extension, rotation, etc.)
- Loading type (axial, anterior, posterior, lateral)
- Equipment required and alternatives
- Skill level required
- Common form errors
- Contraindication tags (shoulder impingement, disc issues, ACL rehab, etc.)
- Substitution relationships (what can replace what)
- Progression relationships (easier → harder variations)

### Constraint-Aware Filtering
When body model has active injury:
1. Injury mapped to affected structures
2. Structures mapped to risky movement patterns
3. Exercise library filtered to exclude/flag risky exercises
4. Substitutions automatically suggested

Example: L4/L5 disc bulge logged
→ Flags: Loaded spinal flexion, heavy axial loading, rotation under load
→ Removes: Deadlifts, barbell squats, sit-ups
→ Suggests: Belt squats, leg press, McGill Big 3
→ Adds: Daily spine hygiene routine

### Intelligent Prescription
For every exercise, calculate targets based on:
- Recent history (weights, reps, RPE logged)
- Progression phase (growth, plateau, deload)
- Today's readiness score
- Time since last similar movement pattern
- Injury constraints on loading

---

## Health Data Integration

### HealthKit / Health Connect Sync
Continuous background sync, not just on app open.

**Data Points:**
- Sleep: duration, stages, consistency, respiratory rate
- Heart: resting HR, HRV, workout HR zones, recovery HR
- Activity: steps, flights climbed, standing hours, workout minutes
- Body: weight trends, body fat if available
- Mobility: walking asymmetry, stride length, stair speed (injury detection goldmines)
- Cycle tracking: training adjustments around hormonal phases

### Pattern Learning
The AI builds a personal baseline:
- Your typical HRV range (not population average)
- Your recovery patterns after different training types
- Your performance correlations (sleep quality → strength)
- Your anomaly signatures (what predicts bad sessions)

---

## Unified Daily Planning

### Multi-Modal Movement
Not just gym workouts. Unified planning across:
- Morning mobility/rehab routines
- Gym sessions
- Swimming (with stroke-specific guidance based on injuries)
- Home bodyweight work
- Resistance band sessions
- Active recovery
- Rest days

### Context-Aware Adaptation
**Location awareness:**
- Home: Surface bodyweight, band work, documented home equipment
- Gym: Plan based on known equipment
- Hotel: Travel detected, offer hotel room workout or find nearby facilities
- Pool: Switch to swim mode, adjust for available strokes

**Time awareness:**
- Calendar integration for available time
- Adjust session length to fit schedule
- Morning vs evening exercise selection

**Equipment awareness:**
- Remember equipment at each location
- Handle "equipment taken" gracefully with swaps
- Learn preferences over time

---

## Interaction Design

### Voice as Primary During Movement
When hands are occupied, voice is the interface.

**During Workout:**
- "That was heavy" → adjust next set
- "Skip this" → asks why (equipment, pain, time) and adapts
- "My knee feels weird" → logs, asks clarifying questions later
- "What's next" → reads upcoming exercise with cues

**Commands work offline** for common actions: next, skip, done, harder, easier

### Haptic Language
Distinct patterns users learn over time:

**Notifications (phone):**
- Gentle double pulse: friendly nudge
- Rising intensity wave: needs attention
- Three quick taps: celebration
- Sharp single tap: confirmation

**Workout (watch):**
- Tick: rep counted
- Double tick: set complete
- Rising buzz: rest timer ending
- Rhythmic pulse: tempo guide
- Long satisfying purr: workout complete

### Gesture Vocabulary
- Tap exercise card: expand details
- Long press: quick actions (swap, skip, adjust)
- Swipe right: mark complete
- Swipe left: log issue/pain
- Pull down: check readiness reasoning

### The Weight/Rep Adjuster
Custom component - not a boring picker. A dial with momentum, haptic clicks at each increment. Fast spin for big changes, slow precision.

---

## Motivation & Behaviour Psychology

### Core Behavioural Principles

**Self-Determination Theory:**
- Autonomy: suggest, never demand
- Competence: calibrate so users succeed more than fail
- Relatedness: connect to meaning and care team

**Implementation Intentions:**
- Create specific plans automatically
- Link movement to existing habits
- Pre-decide everything, user just follows

**Habit Loop Engineering:**
- Consistent contextual cues (time, location, haptic pattern)
- Frictionless routine (no decisions, just follow)
- Immediate intrinsic rewards (energy shift, completion satisfaction)

### Resistance Handling

Different "don't wanna" feelings need different responses:

**Physical fatigue** (low HRV, poor sleep):
→ "Your body's asking for recovery. Here's gentle mobility, or take the day off."

**Mental fatigue** (stressful calendar):
→ "Demanding day. I've cut to 20 minutes, just essentials."

**Boredom** (same routine for weeks):
→ "Want to try something different? Here's a variation."

**Pure inertia**:
→ "Just do the warm-up. 5 minutes. Stop after if you want." (80% continue)

### The Compassionate Coach Voice
Model healthy self-talk:
- "You've been consistent 3 of 4 weeks. Today's a wobble, not a failure."
- "Hard day? Rest is productive."
- "Your body doesn't reset to zero. Let's pick up where you were."

Never guilt, shame, or fake cheerfulness.

### Identity Over Goals
- "You've trained consistently for 6 weeks. That's who you are now."
- "You're someone who does their rehab. 92% compliance."
- Language reinforces identity, not chases future outcomes.

---

## Visual Components

### Readiness Ring
Circular visualisation with segments:
- Sleep segment: arc length = duration, colour = quality
- Recovery segment: HRV trend
- Load segment: recent training stress vs capacity
- Body segment: active injuries or flags

Tap any segment for reasoning. Ring draws itself on app open.

### Body Map
Simple human figure for logging sensations:
- Tap body part → Pain / Tightness / Weakness / Good
- Colour coding shows history over time
- Injured areas highlighted with restriction details
- Persistent context consulted before every workout

### Exercise Cards
Each card contains:
- Exercise name and muscles
- Prescription: weight × reps × sets
- 3-second video loop demo
- Expandable: cues, mistakes, modifications
- History: "Last time: 50kg × 8 × 5. Trend: ↑"
- One-tap swap to alternatives

**States:** Upcoming, In Progress, Completed, Skipped, Flagged

### Timeline View
Horizontal scrolling past → today → future:
- Days colour-coded by activity type
- Intensity shown by height/saturation
- Patterns visible at a glance
- Pinch to zoom for months view

---

## AI Processing Architecture

### On-Device (fast, private, offline)
- Rep counting from motion data
- Basic voice commands
- Haptic timing and feedback
- Readiness calculation from cached data
- Workout navigation and logging
- Simple adaptations (extend rest, skip exercise)

### Cloud (powerful, contextual)
- Document parsing and medical NLP
- Complex workout generation
- Long-term pattern analysis
- Natural conversation
- Exercise substitution reasoning
- Cross-device sync

### Hybrid Approach
- Morning planning generated cloud-side, cached locally
- Workout executes fully offline-capable
- Complex mid-session changes queue if offline
- Graceful degradation - always functional, sometimes smarter

---

## Conversation AI Design

### Intent Recognition
Understand what user is trying to do:
- Logging: "My knee hurt on that"
- Requesting change: "Can we do something different"
- Seeking information: "Why this exercise"
- Planning: "I'm busy next week"
- Emotional: "I don't want to today"

### Context Window
Every conversation has full context:
- Current workout state
- Today's plan and readiness
- Recent sessions and trends
- Active injuries and constraints
- Behavioural patterns

### Response Principles
- Lead with action, not explanation
- Ask one specific question if clarification needed
- Offer options rather than demand decisions
- Match user's energy (terse → terse)
- Never lecture

**Example:**
User: "Skip squats"
Bad: "I understand you want to skip squats. Squats are important for..."
Good: "Done. Want leg press instead, or just move on?"

---

## Safety & Boundaries

### What AI Will NOT Do
- Diagnose medical conditions
- Override explicit professional advice
- Push through pain signals
- Provide medical treatment recommendations
- Make claims about injury timelines without professional input

### Edge Case Handling
"I want to train through this pain"
→ "This pattern looks similar to what preceded your last injury. I'd rather modify today and keep you training long-term. Your call - what do you want to do?"

### Uncertainty Communication
- "Based on your MRI report, I'd suggest..."
- "I'm not certain - might be worth asking your physio"
- "I don't have enough data yet to predict this accurately"

---

## Key User Flows

### Morning Flow
1. Wake up, glance at phone
2. Lock screen widget: "Morning mobility ready. 12 min."
3. Open app → readiness ring draws, today's plan shows
4. One tap to start mobility
5. Watch guides through routine, haptic cues for transitions

### Workout Flow
1. Arrive at gym, location detected
2. App surfaces workout: "Ready. 7 exercises, ~45 min."
3. One tap to start, watch becomes primary
4. Execute with voice/haptic feedback
5. Log difficulty per set, AI adapts remaining work
6. Complete → satisfying haptic, summary shown
7. Optional: queue physio exercises while warm

### Injury Logging Flow
1. During exercise, swipe left or say "that hurt"
2. Body map appears, tap location
3. Quick severity selection: Mild / Moderate / Severe
4. AI immediately offers modification
5. Logged to body model, tracked for patterns

### Document Upload Flow
1. Photograph physio sheet or MRI report
2. AI extracts and structures information
3. Shows plain-English summary for confirmation
4. User confirms or corrects
5. Constraints cascade through exercise library

### Re-engagement Flow (after gap)
1. User opens app after 2 weeks away
2. No guilt. "Welcome back. I've adjusted your baseline."
3. Shows simplified restart session
4. Celebrates completion: "Good to have you moving again."

---

## Technical Requirements

### React Native Core
- Expo or bare workflow (TBD based on native module needs)
- TypeScript throughout
- State management: Zustand or similar
- Offline storage: WatermelonDB or similar for complex relational data

### Health Integration
- HealthKit (iOS) via react-native-health
- Health Connect (Android) via react-native-health-connect
- Background sync for continuous data
- Permissions handling with clear value explanation

### Native Features Required
- Haptic feedback (react-native-haptic-feedback)
- Voice recognition (on-device where possible)
- Camera for document capture
- Location services (background location for gym detection)
- Watch companion app (WatchOS + WearOS)
- Notifications with custom haptic patterns
- Widgets (iOS) / App widgets (Android)
- Live Activities / Dynamic Island (iOS)

### AI/ML Stack
- On-device: CoreML (iOS) / TensorFlow Lite (Android) for rep counting, basic classification
- Cloud: Claude API for reasoning, conversation, document parsing
- OCR: Vision framework (iOS) / ML Kit (Android) for document capture
- Medical NLP: Custom fine-tuned model or Claude with structured prompts

### Backend Requirements
- User authentication
- Encrypted health data storage
- Body model persistence
- Training history
- Document storage (encrypted)
- Sync infrastructure
- Analytics (privacy-preserving)

---

## Data Models (Conceptual)

### User
- Profile basics
- Preferences (notification times, interaction style, etc.)
- Equipment at each location

### BodyModel
- Injuries (current and historical)
- Surgeries
- Chronic conditions
- Constraints (auto-derived and manual)
- Mobility baselines

### Exercise
- Metadata (muscles, joints, equipment, etc.)
- Contraindication tags
- Substitution graph
- Progression graph
- User history for this exercise

### WorkoutSession
- Planned exercises with prescriptions
- Actual performance logged
- Pain/discomfort logs
- Modifications made
- Contextual data (readiness, location, etc.)

### ClinicalDocument
- Original file
- Extracted entities
- Derived constraints
- User confirmations/corrections

### DailyPlan
- Movement activities across modalities
- Readiness snapshot
- Actual completion
- Behavioural notes

---

## MVP Scope Recommendation

For initial build, focus on:

1. **Core workout execution** - Exercise cards, set logging, haptic feedback, rest timers
2. **Basic readiness** - Sleep and HRV integration, simple morning score
3. **Injury awareness** - Manual injury logging, basic exercise filtering
4. **AI workout generation** - Claude-powered session planning with constraints
5. **Conversational adaptation** - Voice/text mid-workout adjustments
6. **Body map** - Pain logging and visualisation

Defer to later:
- Document parsing (complex medical NLP)
- Watch companion app
- Full behavioural model learning
- Multi-modal planning (swim, etc.)
- Physio collaboration features
- Advanced periodisation

---

## Success Metrics

### Engagement
- Sessions per week (target: user's stated goal)
- Session completion rate
- Rehab compliance rate
- Return rate after gaps

### Health Outcomes
- Pain incident frequency trending down
- Strength progression over time
- Mobility improvements
- Injury recurrence rate

### Product Quality
- Time from app open to movement start
- Manual inputs required per session
- AI suggestion acceptance rate
- Voice command success rate

---

## Open Questions for Claude Code

1. **State management architecture** - How to structure the body model for efficient querying and updates?
2. **Offline sync strategy** - Conflict resolution when cloud and local diverge?
3. **AI response latency** - How to make mid-workout Claude calls feel instant?
4. **Exercise library source** - Build custom or integrate existing database?
5. **Watch app architecture** - Companion app vs standalone with sync?
6. **Document parsing accuracy** - What confidence threshold before flagging for user review?

---

## Reference: Original App Screenshots

The FitnessAI screenshots show:
- 6-day split routine
- Day 1: Legs (Squat, Leg Press, Leg Extension, Lying Leg Curl, Plank, Glute Bridge)
- Day 2: Pull (Deadlift, Cable Row, Lat Pulldown, Curls, Reverse Fly)
- Day 3: Push/Pull (Bent Over Row, V-Bar Pulldown, Cable Push Down, Chest Fly/Press, Seated Row)
- Day 4: Core/Glutes (Leg Raise, Plank, Cocoon, Crunch, Side Plank, Hip Thrust)
- Day 5: Push (Chest Press, Cable Push Down, Tricep Pushdown, Rope Extension, Raises)
- Day 6: Abs
- Settings: Custom routine, 50 min duration, Muscle Growth objective
- Workout view: Shows exercises with weight × reps × sets, exercise illustrations

This structure is a starting point. Our app transcends this by adding clinical intelligence, multi-modal planning, and behavioural adaptation.

---

*End of handoff document. Build something that helps people move well for life.*
