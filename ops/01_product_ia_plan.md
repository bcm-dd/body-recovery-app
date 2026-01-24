# Product & Information Architecture Plan
## Body Recovery Companion - MVP Definition

**Document Version:** 1.0
**Last Updated:** 2026-01-24
**Author:** Agent A - Product + IA Planner

---

## 1. MVP Scope Boundaries

### 1.1 Must-Have Features (Core Value Proposition)

These features define the minimum viable product. Without any of these, the app fails to deliver its core promise.

| Feature | Description | Success Criteria |
|---------|-------------|------------------|
| **Body Map Input** | Interactive human figure for tapping pain/discomfort areas | User can tap any body region and log severity in under 10 seconds |
| **Pain Severity Logging** | Scale for rating pain: Mild / Moderate / Severe | Clear visual distinction, one-tap selection |
| **Personalized Recovery Plan Generation** | AI generates daily recovery routine based on body map state | Plan generated within 3 seconds, respects all logged constraints |
| **Exercise Library (Recovery Focus)** | Curated set of 80-120 recovery/rehab exercises | Each exercise has video demo, cues, and contraindication tags |
| **Session Execution** | Guided workout with exercise cards, rest timers, haptic feedback | Full session executable offline after initial load |
| **Exercise Substitution** | Swap any exercise for an appropriate alternative | 3-4 AI-suggested alternatives, respects constraints |
| **Daily Check-in** | Morning pain/sensation logging before session generation | Takes under 60 seconds, informs daily plan |
| **Basic Progress Tracking** | Pain trend over time, session completion history | Clear visualization of improvement/patterns |
| **Health Data Integration** | HealthKit/Health Connect for sleep and HRV | Informs readiness without requiring manual input |
| **Offline Workout Execution** | Full session works without network | Sync queued for when connection restored |

### 1.2 Should-Have Features (Important But Can Be Simplified)

These enhance the experience but can be simplified or deferred if timeline pressure exists.

| Feature | Full Version | MVP Simplification |
|---------|--------------|-------------------|
| **Readiness Score** | Multi-factor ring with sleep, HRV, load, body status | Simple 3-tier indicator (Good/Moderate/Rest) derived from same inputs |
| **Voice Input** | Full natural language during workout | Limited to 5 core commands: "done", "skip", "next", "hard", "easy" |
| **Document Upload** | Photo upload with AI extraction | Manual entry form with guided fields; photo OCR deferred |
| **Watch Companion** | Full workout execution on watch | Watch shows current exercise and timer only; phone primary |
| **Injury History Timeline** | Full historical view with annotations | Simple list of past injuries with active/resolved status |
| **Location-Aware Equipment** | Auto-detect gym, remember equipment per location | Manual equipment selection before workout; location detection deferred |
| **Notification System** | Context-aware nudges with behavioral learning | Simple scheduled reminders at user-defined times |
| **AI Conversation** | Full natural language mid-workout adjustments | Pre-defined quick actions; freeform chat deferred |

### 1.3 Won't-Have Features (Explicitly Out of Scope for MVP)

These features are valuable but explicitly excluded from MVP to maintain focus.

| Feature | Reason for Exclusion | Post-MVP Priority |
|---------|---------------------|-------------------|
| **Strength Training Programs** | MVP focuses purely on recovery/rehab, not general fitness | P1 - First major expansion |
| **Multi-Modal Planning** | Swimming, running, gym sessions | P2 - After core recovery loop proven |
| **Full Behavioral Model** | Learning when users skip, resistance patterns | P2 - Requires significant usage data |
| **Physio/Coach Sharing** | Provider dashboard, shared access | P2 - B2B expansion opportunity |
| **Training Partner Features** | Social workout scheduling | P3 - Low priority |
| **Periodization** | Long-term programming with deload cycles | P1 - Comes with strength training |
| **Calendar Integration** | Reading calendar for stress/availability | P3 - Nice-to-have |
| **Custom Exercise Creation** | User-defined exercises | P2 - After library proven sufficient |
| **Gamification** | Streaks, badges, leaderboards | Never - Core design principle |
| **Apple Watch Complications** | Watch face data | P2 - After basic watch app |
| **Widgets** | iOS/Android home screen widgets | P2 - Post-launch enhancement |
| **Live Activities** | Dynamic Island / Lock Screen | P2 - Post-launch enhancement |

---

## 2. Information Architecture

### 2.1 Mobile App: Screen Hierarchy

```
ROOT
|
+-- [Onboarding Flow] (First run only)
|   +-- Welcome
|   +-- Health Permission Request
|   +-- Focus Selection (Recovery/Training/Both)
|   +-- Body Map Initial Input
|   +-- Experience Level
|   +-- First Session Preview
|   +-- Account Creation
|
+-- [Main App] (Tab Navigation)
    |
    +-- TODAY (Tab 1 - Home)
    |   +-- Readiness Indicator
    |   +-- Daily Check-in (if not completed)
    |   +-- Today's Recovery Session
    |   +-- Quick Actions (Start, Modify, Skip Today)
    |   |
    |   +-- [Workout Execution] (Full-screen modal)
    |       +-- Exercise Card (current)
    |       +-- Video Demo
    |       +-- Rest Timer
    |       +-- Set Logger
    |       +-- Quick Menu (pause, end, swap, help)
    |       +-- Pain Logger (swipe gesture)
    |       +-- Session Summary (post-workout)
    |
    +-- PLAN (Tab 2 - Calendar)
    |   +-- Week View (default)
    |   +-- Day Detail (tap day)
    |   +-- Session Editor (sheet)
    |   +-- Rest Day Marker
    |
    +-- BODY (Tab 3 - Body Model)
    |   +-- Body Map (interactive figure)
    |   +-- Region Detail (tap region)
    |   +-- Injury List
    |   |   +-- Injury Detail
    |   |   +-- Edit Injury
    |   |   +-- Add Injury
    |   +-- Document Vault (MVP: Manual Entry)
    |   |   +-- Document List
    |   |   +-- Add Document (form)
    |   +-- Constraints Summary
    |
    +-- PROGRESS (Tab 4 - Analytics)
    |   +-- Pain Trend Chart
    |   +-- Session History
    |   +-- Recovery Milestones
    |   +-- Body Region Comparison (over time)
    |
    +-- PROFILE (Tab 5 - Settings)
        +-- Account
        +-- Notification Preferences
        +-- Recovery Preferences
        |   +-- Session Duration
        |   +-- Intensity Level
        |   +-- Preferred Times
        +-- Equipment Available
        +-- Health Data Connections
        +-- Privacy & Data
        +-- Help & Support
        +-- About
```

### 2.2 Mobile Navigation Depth Rules

| Flow | Max Depth | Reasoning |
|------|-----------|-----------|
| Start workout | 1 tap from Today | Core action must be instant |
| Log pain during workout | 1 swipe | Mid-exercise, hands may be occupied |
| Swap exercise | 2 taps (long-press + select) | Needs to show alternatives |
| View injury detail | 2 taps | Body tab + tap region |
| Change settings | 2 taps | Profile tab + setting category |
| Complete check-in | 2-3 taps | Severity selection per region |

### 2.3 Web App: Page Structure

The web app is a **companion experience**, not a replacement for mobile. It excels at data review, document management, and configuration - tasks better suited to larger screens.

```
WEB APP STRUCTURE
|
+-- /login
+-- /signup
+-- /forgot-password
|
+-- / (Dashboard - Overview)
|   +-- Weekly summary
|   +-- Pain trend chart
|   +-- Upcoming sessions
|   +-- Quick links to key sections
|
+-- /body
|   +-- Interactive body map (larger, more detailed)
|   +-- Injury timeline
|   +-- Full constraint list
|
+-- /documents
|   +-- Document upload (drag & drop)
|   +-- Document list with search
|   +-- Document detail with extracted data review
|   +-- Manual entry form
|
+-- /progress
|   +-- Comprehensive analytics
|   +-- Export data (CSV/PDF)
|   +-- Date range selection
|   +-- Per-region deep dive
|
+-- /exercises
|   +-- Full exercise library browse
|   +-- Video playback (larger)
|   +-- Contraindication reference
|   +-- Personal history per exercise
|
+-- /history
|   +-- All past sessions
|   +-- Session detail replay
|   +-- Notes and annotations
|
+-- /settings
|   +-- Account management
|   +-- Notification preferences
|   +-- Data export/deletion
|   +-- Equipment configuration
|
+-- /help
    +-- FAQ
    +-- Contact support
    +-- Guides and tutorials
```

### 2.4 Mobile/Web Complementary Relationship

| Task | Primary Platform | Why |
|------|-----------------|-----|
| Daily check-in | Mobile | Morning routine, quick input |
| Workout execution | Mobile | Hands-on, needs portability |
| Quick pain log | Mobile | Immediate capture |
| Document upload | Web | Better for multi-page PDFs, drag-drop |
| Document review/correction | Web | Detailed extraction review needs screen space |
| Progress deep-dive | Web | Charts, date ranges, exports |
| Exercise library browse | Web | Discovery mode, larger videos |
| Settings configuration | Either | Synced across platforms |
| Session history review | Web | Scroll through many sessions |

---

## 3. Key User Flows

### 3.1 First-Run/Onboarding Flow

**Goal:** Get user to their first recovery session in under 4 minutes.

```
STEP 1: Welcome (5 seconds)
+------------------------------------------+
|                                          |
|     [App Logo/Illustration]              |
|                                          |
|     "Your body recovery companion"       |
|                                          |
|     [Get Started]                        |
|                                          |
+------------------------------------------+
Action: Tap "Get Started"
Transition: Slide left
```

```
STEP 2: Health Permission (15-30 seconds)
+------------------------------------------+
|                                          |
|  "I'll use your sleep and heart data    |
|   to know when to push and when to      |
|   take it easy."                         |
|                                          |
|  [Connect Health Data] (Primary)         |
|                                          |
|  [Maybe Later] (Secondary, text link)    |
|                                          |
+------------------------------------------+
Action: System permission dialog appears
Success path: Permission granted -> Continue
Decline path: "No problem. I'll check in with you more often instead." -> Continue
```

```
STEP 3: Focus Selection (10 seconds)
+------------------------------------------+
|                                          |
|  "What brings you here?"                 |
|                                          |
|  [ ] Recovering from injury or pain      |
|  [ ] Managing a chronic condition        |
|  [ ] Maintaining mobility and preventing |
|      future issues                       |
|                                          |
|  Single selection, immediate proceed     |
+------------------------------------------+
Note: Selection influences initial exercise filtering and tone
```

```
STEP 4: Body Map Input (30-60 seconds)
+------------------------------------------+
|                                          |
|  "Tap anywhere that needs attention"     |
|                                          |
|         [Interactive Body Figure]        |
|                                          |
|  Tapped areas highlight, severity        |
|  selector appears:                       |
|                                          |
|  [Mild] [Moderate] [Severe]              |
|                                          |
|  "Add more areas or continue"            |
|                                          |
|  [Continue with X areas marked]          |
|                                          |
+------------------------------------------+
Minimum: 0 areas (pristine state)
Maximum: No limit
Each tap: Region highlights, severity sheet slides up
```

```
STEP 5: First Session Preview (15 seconds)
+------------------------------------------+
|                                          |
|  "Here's your first recovery session"    |
|                                          |
|  Duration: 15 min (intentionally short)  |
|  Focus: [Based on body map]              |
|  Exercises: 4-5                          |
|                                          |
|  [Exercise 1 preview card]               |
|  [Exercise 2 preview card]               |
|  ...                                     |
|                                          |
|  [Start Now] (Primary)                   |
|  [Save for Later] (Secondary)            |
|                                          |
+------------------------------------------+
"Start Now" -> Jump to workout execution
"Save for Later" -> "When works best?" -> Time picker -> Continue
```

```
STEP 6: Account Creation (Post-value delivery, 30 seconds)
+------------------------------------------+
|                                          |
|  "Create an account to save your         |
|   progress"                              |
|                                          |
|  [Email input]                           |
|  [Password input]                        |
|                                          |
|  [Create Account]                        |
|                                          |
|  [Continue with Apple/Google]            |
|                                          |
|  [Skip for now] (Can use for 3 sessions) |
|                                          |
+------------------------------------------+
```

**Total Time:** 2-4 minutes to first session

---

### 3.2 Daily Loop Flow

**Goal:** Minimal friction between waking up and completing recovery work.

```
MORNING (User's defined check-in time)

Notification arrives:
"Good morning. Quick check-in?"
Actions: [Open] [Snooze 30m]

USER OPENS APP
           |
           v
+------------------------------------------+
| TODAY                                    |
|                                          |
|  [Readiness: Good/Moderate/Rest]         |
|  Based on: 7.5h sleep, HRV stable        |
|                                          |
|  "How are you feeling?"                  |
|  [Same as yesterday]   <- Quick option   |
|  [Update body map]     <- If changed     |
|                                          |
+------------------------------------------+
           |
           v (If "Same as yesterday")
+------------------------------------------+
|                                          |
|  "Today's Recovery Session"              |
|                                          |
|  20 min | 6 exercises                    |
|  Focus: Lower back, hip mobility         |
|                                          |
|  [Preview] | [Start] | [Modify]          |
|                                          |
|  Best time: Based on your schedule       |
|  "Reminder at 7:30 AM?"                  |
|                                          |
+------------------------------------------+
           |
           v (User selects time or starts now)

WORKOUT EXECUTION (See Session Flow)
           |
           v
POST-SESSION (30 seconds)
+------------------------------------------+
|                                          |
|  "Session complete. 18 minutes."         |
|                                          |
|  "How do you feel now?"                  |
|  [Better] [Same] [Worse]                 |
|                                          |
|  [Any areas to update?] (Body map tap)   |
|                                          |
|  "See you tomorrow."                     |
|                                          |
+------------------------------------------+

EVENING (Optional reminder if session incomplete)
Notification: "Still time for today's session. 20 min."
Gentle, not guilt-inducing
```

---

### 3.3 Session Flow (Workout Execution)

**Goal:** Frictionless guided experience with minimal screen interaction.

```
SESSION START
+------------------------------------------+
| [X]                              [...]   |
|                                          |
|  Exercise 1 of 6                         |
|                                          |
|  CAT-COW STRETCH                         |
|                                          |
|  +----------------------------------+    |
|  |                                  |    |
|  |     [Looping Video Demo]         |    |
|  |                                  |    |
|  +----------------------------------+    |
|                                          |
|  Hold 5 seconds | 10 reps                |
|                                          |
|  Sets: [1] [2] [3]                       |
|        ^completed                        |
|                                          |
|  [Complete Set]                          |
|                                          |
|  < Swipe left to log pain                |
|                                          |
+------------------------------------------+
```

**Set Completion:**
```
User taps [Complete Set]
           |
           v
Haptic: Double tap (setComplete)
Set circle fills
           |
           v (if more sets)
Rest timer appears (if applicable)
+------------------------------------------+
|                                          |
|  Rest: 0:30                              |
|                                          |
|  [Skip Rest] [+30s]                      |
|                                          |
+------------------------------------------+
Haptic at 10s warning, haptic at complete
           |
           v (all sets done)
Haptic: Triple tap (exerciseComplete)
Auto-advance to next exercise
```

**Exercise Transition:**
```
Current exercise card slides left
Next exercise card slides in from right
Brief (200ms) transition
Haptic: Light tap

If this was the last exercise:
  -> Session Summary screen
```

**Quick Menu Access:**
```
User taps [...] or swipes from edge
           |
           v
+------------------------------------------+
|                                          |
|  [Pause Workout]                         |
|  [Swap This Exercise]                    |
|  [Adjust Reps/Duration]                  |
|  [End Workout Early]                     |
|  [Voice Commands Help]                   |
|                                          |
+------------------------------------------+
```

**Pain Logging Mid-Session:**
```
User swipes left on exercise card
           |
           v
+------------------------------------------+
|                                          |
|  "Something feel off?"                   |
|                                          |
|  [Body Figure - tap affected area]       |
|                                          |
|  [Mild] [Moderate] [Severe]              |
|                                          |
|  [Log & Continue] [Swap Exercise]        |
|                                          |
+------------------------------------------+
If "Swap Exercise" selected -> Substitution Flow
```

---

### 3.4 Substitution Flow

**Goal:** Quickly replace an exercise with a suitable alternative without losing session context.

```
TRIGGER: Long-press exercise card OR tap "Swap" in quick menu
           |
           v
+------------------------------------------+
| Swap: Cat-Cow Stretch                    |
|                                          |
|  "Alternatives for your constraints"     |
|                                          |
|  +----------------------------------+    |
|  | CHILD'S POSE                     |    |
|  | Similar spine mobility           |    |
|  | Less flexion                     |    |
|  | [Select]                         |    |
|  +----------------------------------+    |
|                                          |
|  +----------------------------------+    |
|  | SEATED SPINAL TWIST              |    |
|  | Alternative approach             |    |
|  | Rotation focus                   |    |
|  | [Select]                         |    |
|  +----------------------------------+    |
|                                          |
|  +----------------------------------+    |
|  | PELVIC TILTS                     |    |
|  | Gentler option                   |    |
|  | Less range of motion             |    |
|  | [Select]                         |    |
|  +----------------------------------+    |
|                                          |
|  [Search All Exercises]                  |
|                                          |
+------------------------------------------+

User taps [Select] on alternative
           |
           v
Haptic: Confirm
Exercise card morphs to new exercise
Session continues immediately
"Undo" toast appears for 3 seconds
```

**Why Each Alternative:**
- AI considers: User's logged injuries/pain, equipment available, session context (what's already done), exercise history (what they complete vs skip)
- Each suggestion shows brief rationale: "Gentler option" / "Similar muscles" / "No spinal flexion"

---

### 3.5 Check-in Flow

**Goal:** Quickly capture how the body feels to inform session planning.

```
TRIGGER: Morning notification, or tap check-in prompt on Today tab
           |
           v
+------------------------------------------+
|                                          |
|  "Quick body check"                      |
|                                          |
|  [Body Map with yesterday's state shown] |
|                                          |
|  Highlighted areas from yesterday        |
|  shown in their previous colors          |
|                                          |
|  "Tap to update any changes"             |
|                                          |
+------------------------------------------+
```

**Option A: No Changes**
```
User taps [Same as Yesterday]
           |
           v
Haptic: Confirm
"Got it. Today's session is ready."
Transition to session preview
```

**Option B: Updates Needed**
```
User taps a body region
           |
           v
+------------------------------------------+
|                                          |
|  [Region Name]: Lower Back               |
|                                          |
|  Yesterday: Moderate                     |
|  Today:                                  |
|                                          |
|  [Better] [Same] [Worse] [Resolved]      |
|                                          |
|  If Worse:                               |
|  [Mild] [Moderate] [Severe]              |
|                                          |
+------------------------------------------+
           |
           v (After all updates)
[Done Updating]
           |
           v
Session regenerates based on new state
"I've adjusted today's session."
Preview shows updated plan
```

**Pain Type Capture (Optional Depth):**
```
If user wants to add detail (expand option):
           |
           v
+------------------------------------------+
|  What kind of sensation?                 |
|                                          |
|  [Sharp] [Dull/Aching] [Stiff]           |
|  [Tight] [Weak] [Tingling]               |
|                                          |
|  [Done]                                  |
+------------------------------------------+
This informs more specific exercise selection
```

---

### 3.6 Progress Review Flow

**Goal:** Give users evidence that their efforts are producing results.

```
ENTRY: Tap Progress tab
           |
           v
+------------------------------------------+
| PROGRESS                                 |
|                                          |
|  [Pain Trend] (Default view)             |
|                                          |
|  +----------------------------------+    |
|  |    ^                             |    |
|  |    |     \                       |    |
|  |    |      \_____                 |    |
|  |    |            \                |    |
|  |    +---+---+---+---+---+---+---> |    |
|  |    4w  3w  2w  1w  Now          |    |
|  +----------------------------------+    |
|                                          |
|  "Lower back pain down 40% in 4 weeks"   |
|                                          |
|  [View by Region]                        |
|                                          |
+------------------------------------------+
```

**Region Comparison:**
```
User taps [View by Region]
           |
           v
+------------------------------------------+
|                                          |
|  [Body Map with color gradients]         |
|                                          |
|  Color intensity = average pain level    |
|                                          |
|  Toggle: [This Week] [Last Month] [All]  |
|                                          |
|  Regions improving: Green arrows         |
|  Regions static: Grey                    |
|  Regions worsening: Amber attention      |
|                                          |
|  Tap region for detail                   |
|                                          |
+------------------------------------------+
```

**Session History:**
```
User scrolls down on Progress tab
           |
           v
+------------------------------------------+
|                                          |
|  Sessions This Month: 18                 |
|  Completion Rate: 92%                    |
|                                          |
|  [Session List]                          |
|  +----------------------------------+    |
|  | Jan 23 | 20 min | 6/6 complete   |    |
|  +----------------------------------+    |
|  | Jan 22 | 18 min | 5/6 complete   |    |
|  +----------------------------------+    |
|  | Jan 21 | REST DAY                |    |
|  +----------------------------------+    |
|                                          |
|  Tap for detail                          |
|                                          |
+------------------------------------------+
```

**Milestone Recognition:**
```
(Appears contextually, not as gamification)
           |
           v
+------------------------------------------+
|                                          |
|  Milestone: 30 Consecutive Days          |
|                                          |
|  "You've been consistent for a month.    |
|   That's when real change happens."      |
|                                          |
|  No badge. No points.                    |
|  Just acknowledgment.                    |
|                                          |
+------------------------------------------+
```

---

## 4. UX Risks and "Premium Feel" Tactics

### 4.1 Identified UX Pitfalls

| Risk | Description | Mitigation |
|------|-------------|------------|
| **Onboarding Drop-off** | Users abandon before first session | Deliver first session in under 4 minutes; account creation after value |
| **Check-in Fatigue** | Daily body map input feels like a chore | "Same as yesterday" one-tap option; infer from health data when possible |
| **Overwhelming Exercise Detail** | Too much info per exercise | Progressive disclosure: basic view default, expand for cues/history |
| **Pain Anxiety** | Logging pain constantly makes users focus on pain | Frame as "body awareness" not "pain tracking"; celebrate improvements |
| **Session Monotony** | Same exercises feel repetitive | Variation built into AI generation; substitution always available |
| **False Medical Authority** | Users treat app as medical advice | Clear disclaimers; "consult professional" prompts for concerning patterns |
| **Guilt from Missed Sessions** | Streak-like pressure without streaks | Never mention missed days negatively; "Ready when you are" language |
| **Offline Confusion** | Users don't know what works offline | Clear offline indicator; always show what's available |
| **Substitution Paralysis** | Too many exercise options | AI ranks top 3-4; full library behind explicit "search more" |
| **Progress Plateaus** | User doesn't see improvement | Show non-pain metrics too: mobility, session completion, consistency |

### 4.2 Motion/Haptics Guidelines

**Core Principle:** Motion and haptics are functional, not decorative. Every vibration means something.

#### Haptic Vocabulary (Users Learn These)

| Pattern | Meaning | When Used |
|---------|---------|-----------|
| Light single tap | Confirmation/selection | Tapping buttons, selections |
| Double medium tap | Set complete | Finishing a set |
| Triple rising tap | Exercise complete | Moving to next exercise |
| Long satisfying purr | Session complete | Workout finished |
| Gentle double pulse | Friendly nudge | Timer warning (10s left) |
| Sharp single tap | Timer ended | Rest period over |
| Quick triple buzz | Error/didn't catch | Voice command failed |

#### Motion Restraint Principles

1. **Never animate for animation's sake** - If removing the animation loses no information, remove it.

2. **Match physical world expectations**
   - Cards slide in direction of navigation
   - Completed items compress/fade down, not fly away
   - Timers deplete, not tick randomly

3. **Performance budget: 300ms max** for any single animation. Most should be 150-200ms.

4. **Interruptible always** - User input immediately stops animation and jumps to end state.

5. **Reduced motion mode exists** - All motion replaced with simple crossfades or instant state changes.

#### Specific Animation Decisions

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Screen push/pop | Slide left/right | 200ms | ease-out |
| Bottom sheet appear | Slide up + fade | 250ms | ease-out |
| Bottom sheet dismiss | Slide down + fade | 200ms | ease-in |
| Exercise card expand | Height + content fade | 200ms | spring (light) |
| Set completion | Scale pulse + fill | 150ms | ease-out |
| Tab switch | Crossfade | 150ms | linear |
| Readiness ring draw | Arc trace | 500ms (first load only) | ease-in-out |
| Toast appear/dismiss | Fade + slight slide | 150ms | ease-out |

### 4.3 Progressive Disclosure Strategy

**Principle:** Show the minimum needed for the current task. Reveal depth on demand.

#### Layer 1: Glanceable (Default State)
- Exercise name and video
- Set count as circles
- One-tap complete button
- Swipe hint for pain

#### Layer 2: Available (One Interaction Away)
- Reps/hold duration
- Rest timer controls
- Quick substitute access
- Voice command hint

#### Layer 3: Discoverable (Explicit Request)
- Form cues and common mistakes
- Exercise history and trends
- Alternative exercise full list
- Detailed pain logger

#### Layer 4: Reference (Settings/Help)
- Full exercise library browser
- Contraindication explanations
- Export/import data
- Technical settings

**Implementation Pattern:**
```
Default:    Card shows name, video, set circles, complete button
Tap card:   Expands to show reps, cues preview, substitute button
Long-press: Full detail sheet with history, all variations, notes
```

### 4.4 Professional/Clinical Without Being Cold

**The Challenge:** Feel trustworthy and competent (like a good physiotherapist's office) without feeling sterile, intimidating, or impersonal.

#### Design Language Principles

**Typography:**
- Primary: Clean sans-serif (SF Pro, Roboto) - professional
- Weights: Medium for headers, Regular for body - not too bold/aggressive
- Size: Generous, easy to read - accessibility-first

**Color:**
- Base: Near-black/dark grey backgrounds (not pure black)
- Accent: Calm blue (not aggressive orange/red)
- Status: Subtle greens/ambers (not traffic light bright)
- Pain indicators: Warm spectrum (yellow -> orange -> red) not alarming

**Imagery:**
- Exercise demos: Real people, diverse bodies, calm environments
- Not: Gym bros, extreme athleticism, clinical diagrams
- Body map: Simplified, non-gendered, neutral figure

**Iconography:**
- Rounded corners, consistent stroke weight
- Not too playful (no bouncing), not too serious (no medical symbols)
- Functional first: icons mean things, aren't just decoration

#### Voice/Tone Calibration

| Scenario | Wrong Approach | Right Approach |
|----------|---------------|----------------|
| Session complete | "You crushed it!" | "Solid session. See you tomorrow." |
| Pain logged | "Oh no! Are you okay?" | "Noted. I'll adjust the plan." |
| Missed day | "We missed you!" | "Ready when you are." |
| Good progress | "Amazing! You're a superstar!" | "Lower back is improving. Keep it up." |
| Encouragement | "You can do it! Push through!" | "One more set. Take your time." |
| Error state | "Oops! Something went wrong!" | "Couldn't load that. Try again?" |

**Clinical Trust Signals:**
- Clear exercise contraindication information
- "Consult a professional" prompts when appropriate
- Disclaimer language: "This is guided self-care, not medical treatment"
- Source attribution: "Based on common physiotherapy protocols"
- No false certainty: "This should help" not "This will fix you"

#### Warmth Without Over-Familiarity

**Do:**
- Use "you" and "your" (personal)
- Acknowledge difficulty: "That was heavy"
- Celebrate consistency over performance
- Allow rest without judgment
- Provide reasoning: "I'm suggesting this because..."

**Don't:**
- Use first name constantly
- Fake enthusiasm
- Use exclamation points excessively
- Pretend to be a friend or coach with a personality
- Make promises about outcomes

#### Layout Principles for Premium Feel

1. **Generous whitespace** - Breathing room signals quality
2. **Consistent padding** - 16/24/32px system, never cramped
3. **Card elevation** - Subtle shadows, layered depth
4. **Clear hierarchy** - One primary action per screen
5. **Smooth transitions** - No jarring state changes
6. **Loading states** - Skeleton screens, not spinners

### 4.5 Key Differentiation From Fitness Apps

| Typical Fitness App | This Recovery App |
|--------------------|-------------------|
| "Day 5 of 30!" | No day counting |
| Streak counters | No streaks |
| Badges and achievements | No gamification |
| Leaderboards | No social comparison |
| "Great job!" after everything | Reserved acknowledgment |
| Push through pain | Listen to your body |
| More is better | Appropriate is better |
| Track everything | Track what matters |
| Daily accountability | Daily invitation |

---

## 5. Success Metrics (MVP)

### 5.1 Core Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Onboarding completion | >70% | Users who complete first session / Users who start onboarding |
| Day-1 retention | >60% | Users who return within 24h of first session |
| Day-7 retention | >40% | Users active on day 7 |
| Day-30 retention | >25% | Users active on day 30 |
| Session completion rate | >85% | Sessions completed / Sessions started |
| Check-in completion | >70% | Daily check-ins completed when prompted |
| Substitution rate | <15% | Exercises swapped / Total exercises (lower = better generation) |
| Pain improvement | Track trend | % of users showing pain reduction over 30 days |

### 5.2 Quality Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to first session | <4 min | Median time from app open to workout start |
| Cold start time | <2s | App launch to interactive Today screen |
| Workout action latency | <100ms | Tap to response for set completion |
| Crash-free sessions | >99.5% | Sessions without app crash |
| Offline success rate | 100% | Workouts completable offline |

---

## 6. Open Questions for Future Phases

1. **Intensity Calibration:** How do we determine starting intensity for new users without extensive assessment?

2. **Recovery Timeline Expectations:** How do we set realistic expectations without making medical claims?

3. **When to Recommend Professional Help:** What patterns should trigger "see a professional" recommendations?

4. **Chronic vs Acute Handling:** Should the app handle chronic pain management differently from acute injury recovery?

5. **Regression Handling:** If pain increases over time, how does the app respond without alarming the user?

6. **Multi-Region Complexity:** How do we handle users with 5+ pain areas without overwhelming the session generator?

---

## Appendix A: Screen Inventory (Mobile)

| Screen | Tab | Purpose | Key Components |
|--------|-----|---------|----------------|
| Welcome | Onboarding | App introduction | Logo, tagline, CTA |
| Health Permission | Onboarding | Request HealthKit/HC access | Explanation, permission button |
| Focus Selection | Onboarding | Capture user intent | Single-select options |
| Body Map Initial | Onboarding | First pain input | Interactive figure, severity selector |
| First Session Preview | Onboarding | Show value immediately | Session card, exercise previews |
| Account Creation | Onboarding | Capture email/auth | Input fields, social auth |
| Today | Today Tab | Daily dashboard | Readiness, check-in, session preview |
| Workout Execution | Today Tab (Modal) | Session in progress | Exercise card, video, timer, sets |
| Session Summary | Today Tab | Post-workout recap | Duration, completion, feeling check |
| Week View | Plan Tab | Upcoming schedule | Calendar grid, session indicators |
| Day Detail | Plan Tab | Single day view | Sessions, rest status, edit access |
| Body Map | Body Tab | Current body state | Interactive figure, region states |
| Injury List | Body Tab | All logged injuries | List with status indicators |
| Injury Detail | Body Tab | Single injury info | Timeline, constraints, notes |
| Document Vault | Body Tab | Uploaded documents | Document list, add button |
| Pain Trend | Progress Tab | Improvement over time | Line chart, period selector |
| Session History | Progress Tab | Past workouts | Session list, completion stats |
| Account | Profile Tab | User info | Email, password, auth |
| Notifications | Profile Tab | Alert preferences | Toggle list, time pickers |
| Recovery Preferences | Profile Tab | Session settings | Duration, intensity sliders |
| Equipment | Profile Tab | Available gear | Checklist by category |
| Health Connections | Profile Tab | Data sources | HealthKit status, reconnect |
| Privacy & Data | Profile Tab | Data management | Export, delete options |

---

## Appendix B: Navigation Map

```
[Today] <---> [Plan] <---> [Body] <---> [Progress] <---> [Profile]
   |            |            |             |               |
   |            |            |             |               +-- Account
   |            |            |             |               +-- Notifications
   |            |            |             |               +-- Preferences
   |            |            |             |               +-- Equipment
   |            |            |             |               +-- Health Data
   |            |            |             |               +-- Privacy
   |            |            |             |               +-- Help
   |            |            |             |
   |            |            |             +-- Pain Trend
   |            |            |             +-- Region View
   |            |            |             +-- Session History
   |            |            |                  +-- Session Detail
   |            |            |
   |            |            +-- Body Map
   |            |            |    +-- Region Detail
   |            |            +-- Injury List
   |            |            |    +-- Injury Detail
   |            |            |         +-- Edit Injury
   |            |            +-- Document Vault
   |            |                 +-- Add Document
   |            |
   |            +-- Week View
   |            +-- Day Detail
   |                 +-- Edit Session
   |
   +-- Check-in (Modal)
   +-- Session Preview
   +-- Workout Execution (Full-screen)
        +-- Exercise Card
        +-- Quick Menu (Sheet)
        +-- Pain Logger (Sheet)
        +-- Swap Exercise (Sheet)
        +-- Session Summary
```

---

*End of Product & Information Architecture Plan*
