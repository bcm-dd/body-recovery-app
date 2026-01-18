# Movement & Recovery Companion - UX Addendum

This document extends the main handoff with detailed UX specifications for areas that were underspecified.

---

## Onboarding Experience

### Philosophy
Get users moving within 3 minutes of download. Front-load value, back-load data collection. Every piece of information we ask for should have an immediate visible benefit.

### The Flow

**Screen 1: Welcome**
- App name, simple illustration of the concept
- "Your movement and recovery companion"
- Single CTA: "Get Started"
- No account creation yet - reduce friction

**Screen 2: Health Data Permission**
Before asking, explain the value:
- "I'll use your sleep and heart rate data to know when you're ready to train hard and when you need recovery."
- "This means I won't ask you how you slept every day - I'll already know."
- CTA: "Connect Health Data"
- Secondary: "Maybe Later" (app still works, just asks more questions)

If denied:
- "No problem. I'll check in with you each morning instead."
- Continue flow, flag for periodic re-prompting (monthly, not annoying)

**Screen 3: Your Focus**
Single choice that shapes the initial experience:
- "Returning from injury or managing a condition" → Injury-first path
- "Building strength and fitness" → Training-first path
- "Both - I train around existing issues" → Hybrid path

This isn't permanent - just seeds the right first experience.

**Screen 4a (Injury Path): What's Going On?**
Body map appears:
- "Tap anywhere that's currently an issue"
- User taps areas, quick severity for each
- "Want to add details or upload any documents?" → Optional, can skip
- "I'll build your plan around these"

**Screen 4b (Training Path): Your Experience**
Simple selection:
- "New to strength training"
- "I've trained before but it's been a while"
- "I train regularly"

Followed by:
- "How many days per week feels realistic?" (slider: 2-6)
- No equipment questions yet - learn from behaviour

**Screen 5: Your First Session**
Based on inputs, immediately show a generated session:
- "Here's your first workout. 25 minutes, no equipment needed."
- This is intentionally simple - bodyweight, at home, achievable
- CTA: "Let's Do This" or "Save for Later"

If they do it now → immediate value delivered
If they save → schedule it: "When works for you?"

**Screen 6: Account Creation**
Only after value delivered:
- "Create an account to save your progress"
- Email/password or social auth
- Can be skipped temporarily (local storage), prompted again after 3rd session

### Progressive Profiling (Post-Onboarding)

Information gathered over time, not upfront:

**After first gym visit:**
- Location detected as new
- "Looks like you're at a gym. Want to tell me what equipment is here?"
- Quick checklist, remembers for next time

**After first week:**
- "You've done 3 sessions. Want to set a weekly goal?"
- Or just infer and confirm: "Looks like 3-4 days works for you. Sound right?"

**After first skipped session:**
- "No worries. Quick question - was it time, energy, or something else?"
- Learns resistance patterns

**Periodically:**
- Surface one profile question contextually
- "I noticed you always skip ab exercises. Not your thing, or should I keep including them?"

---

## Navigation Architecture

### Primary Navigation (Bottom Tab Bar)

**5 tabs:**

1. **Today** (home icon)
   - Default landing screen
   - Readiness ring
   - Today's movement plan
   - Quick actions

2. **Plan** (calendar icon)
   - Weekly/monthly view
   - Upcoming sessions
   - Schedule management
   - Rest days visible

3. **Body** (figure icon)
   - Body map
   - Active injuries and constraints
   - Document vault
   - Clinical history

4. **Progress** (chart icon)
   - Strength trends
   - Consistency tracking
   - AI insights
   - Milestones

5. **Profile** (person icon)
   - Settings
   - Preferences
   - Equipment/locations
   - Account
   - Data management

### Navigation Depth

**Today → Workout → Exercise Detail**
Max 3 levels deep for core flows

**During workout:**
- Bottom nav hidden
- Full-screen focus mode
- Swipe from edge or tap X to access quick menu (not exit)
- Quick menu: pause, end early, adjust plan, emergency exit

**Global search:**
- Accessible from pull-down gesture on any main screen
- Search exercises, past workouts, documents, settings
- Recent searches remembered

### Screen Inventory

**Today Tab:**
- Today (home)
- Workout execution (modal/fullscreen)
- Exercise detail (sheet)
- Session summary (post-workout)

**Plan Tab:**
- Week view (default)
- Month view
- Day detail
- Edit session (sheet)
- Add activity (sheet)

**Body Tab:**
- Body map (home)
- Injury detail
- Add/edit injury
- Document vault
- Document detail
- Upload document (modal)

**Progress Tab:**
- Overview (home)
- Exercise history (per exercise)
- Insights detail
- Milestones list

**Profile Tab:**
- Settings home
- Notification preferences
- Training preferences
- Equipment/locations
- Privacy & data
- Account
- Help & support

---

## Empty States

### No Workouts Yet (Today Tab)
- Readiness ring still shows (from health data)
- "Ready to start? Here's a session based on what I know so far."
- Generated starter workout shown
- If no health data: "I'll learn your rhythm as we go. Here's a good first session."

### No Injuries Logged (Body Map)
- Clean body figure, no highlights
- "Tap anywhere to log how it feels"
- "Nothing flagged - looking good. Tap any area to add notes anytime."
- Don't make it feel empty - frame as positive

### No Documents (Document Vault)
- Simple illustration
- "Add physio sheets, MRI reports, or specialist letters"
- "I'll extract the details and use them to keep you safe"
- Camera button prominent
- "No documents? No problem - you can always add them later"

### No Progress Yet (Progress Tab)
- "Complete a few sessions and I'll start showing your trends here"
- Show what will appear: placeholder charts with labels
- "Tracking starts now" - frame as beginning, not emptiness

### New Location Detected
- "New place! What equipment is available here?"
- Quick presets: "Full gym", "Hotel gym", "Home", "Custom"
- Can skip: "Just show me bodyweight options for now"

---

## Error States

### Health Data Sync Failed
- Non-blocking - don't interrupt workout
- Subtle indicator on readiness ring: "Last sync: 2 hours ago"
- Tap for details: "Having trouble connecting to Health. I'll use your recent patterns instead."
- Background retry, surface success quietly

### Document Parsing Failed
- "I had trouble reading this document"
- Show original image
- Options: "Try again", "Enter details manually", "Skip for now"
- Manual entry: guided form for key fields (body part, condition, restrictions)

### Voice Recognition Failed
- Haptic pattern: three short buzzes (distinct from success)
- Watch shows: "Didn't catch that" with retry button
- Fallback to tap interface immediately visible
- Don't require voice - always have tap alternative

### AI Workout Generation Failed
- Rare, but handle gracefully
- "I'm having trouble planning your session"
- Offer: cached recent similar workout, or manual exercise selection
- "Pick exercises and I'll help with sets and reps"

### Network Failure During Workout
- Workout continues - already cached locally
- Subtle offline indicator
- Sync queued for when back online
- User may not even notice

### Watch Disconnects Mid-Session
- Phone takes over automatically
- "Watch disconnected - continuing on phone"
- Workout state preserved exactly
- Reconnection seamless if watch comes back

### Exercise Not in Library
- When parsing physio document with unknown exercise
- "I don't recognise 'banded hip airplane'"
- Options: "Describe it to me" (AI interprets), "Show me a video" (user provides), "Skip this one"
- Add to personal library if described/shown

### Cold Start - No History, No Injuries
- Rely on stated experience level and goals
- Start conservative, progress based on feedback
- "Early sessions help me learn your baseline - don't hold back on feedback"

---

## Settings & Preferences

### Notifications Section

**Notification Types (each toggleable):**
- Morning check-in
- Workout reminders
- Rehab reminders
- Movement nudges (sedentary alerts)
- Rest day suggestions
- Progress milestones
- Weekly summary

**Timing Preferences:**
- Quiet hours (auto-detect from Focus modes or manual)
- Preferred reminder lead time (15 min, 30 min, 1 hour before scheduled)
- Morning check-in time

**Intensity:**
- Slider: "Minimal" ↔ "Full coaching"
- Minimal: Only scheduled workout reminders
- Full: Proactive nudges, insights, encouragement
- Affects frequency and tone

### Training Preferences

**Schedule:**
- Preferred training days (tap to toggle each day)
- Preferred time of day (morning/afternoon/evening/flexible)
- Session length preference (30/45/60/75+ min)

**Style:**
- Rep range preference (strength: 3-6, hypertrophy: 8-12, endurance: 15+, mixed)
- Equipment preferences (barbells, dumbbells, machines, cables, bodyweight)
- Exercises to avoid (search and add - separate from injuries)

**Progression:**
- Auto-progress weights: On/Off
- Progression aggressiveness: Conservative ↔ Aggressive
- Deload frequency: Auto-detect / Every 4 weeks / Every 6 weeks / Manual only

### Equipment & Locations

**Locations List:**
- Each saved location shows name, type, last visited
- Tap to edit equipment list
- Add new location manually or from detected visit

**Equipment Editor:**
- Checklist by category (barbells, dumbbells, machines, cables, cardio, other)
- Specific items where relevant (dumbbell weight range, cable machine type)
- "Quick setup" presets for common gym types

### Privacy & Data

**Data Management:**
- "Download my data" - full export (JSON + documents)
- "Delete my data" - clear everything with confirmation
- "Delete workout history" - keep profile, clear sessions
- "Delete clinical documents" - remove uploaded docs

**Sharing Controls:**
- Share with physio/coach: On/Off, select what's shared
- Anonymous analytics: On/Off (helps improve app)
- Crash reporting: On/Off

**Storage Info:**
- Show what's stored locally vs cloud
- Cache management
- Document storage usage

### Account

- Email/password management
- Connected accounts (social auth)
- Subscription status (if applicable)
- Sign out
- Delete account (with data deletion confirmation)

---

## Accessibility

### Screen Reader Support

**Workout Execution:**
- Each exercise card announces: name, prescription, position in workout
- Set completion announced: "Set 2 of 4 complete"
- Rest timer: announces start, 30 seconds remaining, 10 seconds, complete
- Voice input available for all actions
- Swipe gestures have button alternatives

**Body Map:**
- Body regions as labeled buttons in logical order (head, neck, shoulders...)
- Current status announced for each region
- Clear feedback on selection

**Navigation:**
- All tabs properly labeled
- Headings structured for skip navigation
- Dynamic content changes announced

### Visual Accessibility

**Colour Blind Modes:**
- Deuteranopia (red-green)
- Protanopia (red-green)
- Tritanopia (blue-yellow)
- Affects: readiness ring, body map, progress charts, status indicators
- Use patterns/shapes in addition to colour where critical

**High Contrast Mode:**
- Follows system setting or manual toggle
- Increased contrast ratios throughout
- Bolder borders and separators

**Text Scaling:**
- Support system text size (iOS Dynamic Type, Android font scaling)
- Exercise cards reflow gracefully up to 200%
- Critical information never truncated, wraps or expands

**Reduced Motion:**
- Follows system setting
- Disables: ring drawing animation, card transitions, celebration effects
- Functional feedback preserved (haptics, state changes)

### Motor Accessibility

**One-Handed Operation:**
- All primary actions reachable in lower 2/3 of screen
- Swipe gestures have tap alternatives
- Hold-to-confirm for destructive actions (not quick swipes)

**Switch Control / Voice Control:**
- All interactive elements labeled
- Logical focus order
- Actions achievable without multi-finger gestures

**Adjustable Timing:**
- Rest timers can be voice-extended
- No time-limited inputs
- Auto-advance can be disabled (require manual progression)

### Hearing Accessibility

**Haptic-Primary Mode:**
- All audio cues have distinct haptic equivalents
- Visual indicators for all status changes
- Captions for any video content (exercise demos)

**Visual Alerts:**
- Screen flash option for critical alerts
- Prominent visual rest timer (not just audio)

---

## Workout Modification UX

### Swapping an Exercise

**Trigger:** Long press on exercise card, or tap "..." menu

**Swap Sheet:**
- Header: "Replace [Exercise Name]"
- AI suggestions first: "Based on your equipment and constraints"
  - 3-4 alternatives shown as cards
  - Each shows: name, why it's a good swap, equipment needed
- Search/browse below: "Or find something else"
  - Search by name
  - Filter by muscle group, equipment
- Tap to select, confirms immediately
- "Undo" toast appears briefly

### Adjusting Weight/Reps

**Quick Adjust (during workout):**
- Tap the weight or rep number directly
- Dial component appears (described in main doc)
- Haptic clicks at each increment
- Tap outside or swipe down to confirm

**Detailed Adjust:**
- Long press on prescription
- Sheet with: Weight (dial), Reps (dial), Sets (+/- buttons)
- "Apply to this set" vs "Apply to remaining sets" vs "Apply to all sets"
- Notes field for context

### Reordering Exercises

**When Allowed:**
- Only before starting an exercise
- Can't reorder completed exercises

**How:**
- Long press and drag (standard pattern)
- Haptic feedback on pickup and drop
- Visual placeholder shows drop position
- AI may warn: "Moving this before your compound lifts - you might fatigue early"

### Adding an Exercise

**Trigger:** "+" button at end of exercise list, or "Add exercise" in menu

**Add Sheet:**
- "Add to this workout"
- Recent exercises (quick add)
- AI suggestions based on what's missing
- Search/browse full library
- Select → prescription suggestion → confirm

### Ending Early

**Trigger:** "End workout" in menu, or attempt to leave

**End Early Sheet:**
- "End workout now?"
- Shows: completed X of Y exercises, estimated time remaining
- Options:
  - "End and save" - logs what's done, marks rest as skipped
  - "Pause and continue later" - saves state for same-day resume
  - "Cancel" - back to workout

**If abandoning without saving:**
- "You have unsaved workout data"
- "Save progress" / "Discard" / "Continue workout"

### Pausing

**Trigger:** Lock phone, app goes to background, or explicit pause

**Behaviour:**
- Workout state fully preserved
- Resume from exactly where you were
- Rest timer pauses (or notes the extended rest)
- Same-day resume: seamless
- Next-day: "You have an unfinished workout from yesterday. Resume or start fresh?"

---

## Progress & Insights UX

### Progress Tab Structure

**Overview (default view):**
- Consistency chart: last 12 weeks as grid, days coloured by activity
- Volume trend: simple line chart, last 8 weeks
- Current streaks: days, weeks
- Quick stats: total sessions, total volume, active days this month

**Exercise History:**
- Searchable list of all exercises you've performed
- Each shows: name, last performed, trend indicator
- Tap → detailed history for that exercise
  - Weight progression chart
  - Rep/set history
  - Personal records
  - Notes from past sessions

**Insights:**
- AI-generated observations
- Each insight is a card:
  - Title: "Your shoulder pain correlates with high bench volume"
  - Detail: Explanation with supporting data
  - Action: "Want me to adjust your programming?"
- Insights surface contextually too (not just in this tab)

**Milestones:**
- List of achievements (strength PRs, consistency milestones, rehab completions)
- Not gamified badges - real accomplishments
- Tap for context: when, what workout, how it compares

### Insight Delivery

**In-context insights (outside Progress tab):**
- After workout: "That's a PR on deadlift - up 5kg from 3 weeks ago"
- Morning readiness: "Your HRV has been climbing all week - today might be a good day to push"
- Plan view: "You haven't hit back in 8 days - want me to adjust this week?"

**Notification insights (if enabled):**
- Weekly summary: "You moved 4 days, total volume up 8%, shoulder feeling better"
- Pattern detection: "You've skipped the last 3 Friday sessions - want to restructure?"

**Avoiding insight overload:**
- Max 1 insight notification per day
- Insights in-app are collapsible
- User can dismiss with "Don't tell me this again"

---

## Notification UX

### Notification Content by Type

**Workout Reminder:**
- Title: "Leg day ready"
- Body: "45 min · 7 exercises · You've got this"
- Actions: "Start" / "Snooze 1hr"

**Rehab Reminder:**
- Title: "Shoulder rehab"
- Body: "12 min · Your consistency is at 90%"
- Actions: "Start" / "Skip today"

**Morning Check-in:**
- Title: "Good morning"
- Body: "Readiness: 82%. Back and shoulders today?"
- Actions: "Sounds good" / "Show me options"

**Movement Nudge:**
- Title: "Been a while"
- Body: "2 hours sitting. Quick stretch?"
- Actions: "Show me" / "Not now"

**Progress Milestone:**
- Title: "New PR! 🎉"
- Body: "Squat: 100kg × 5 - up 5kg from last month"
- Actions: Opens to details (no action buttons needed)

**Weekly Summary:**
- Title: "Your week"
- Body: "4 sessions · 15,000kg moved · Great consistency"
- Actions: Opens to detailed summary

### Notification Behaviour

**Delivery Rules:**
- Never during scheduled Focus/DND
- Respect quiet hours setting
- Workout reminders: at scheduled time minus lead time
- Movement nudges: max 2 per day, min 2 hours apart
- Insights: max 1 per day, batch if multiple

**Stacking:**
- If multiple notifications pending, bundle into summary
- "3 updates" → opens to list
- Never spam the lock screen

**Action Handling:**
- "Start" → opens directly to workout, minimal loading
- "Snooze" → reschedules, confirms with subtle haptic
- "Skip" → logged, no guilt, no follow-up

---

## Social & Sharing

### Physio/Coach Sharing

**Setup:**
- Profile → Sharing → "Add care provider"
- Enter their email or share a link
- They receive invite to create provider account (separate, simpler interface)

**What They See (Provider Dashboard - web or app):**
- Client list
- Per client:
  - Compliance summary (sessions completed, rehab adherence)
  - Pain/discomfort log
  - Relevant body map history
  - Documents you've shared
  - Progress on prescribed exercises
- They do NOT see: full workout details, health data, personal notes

**What You Control:**
- Toggle sharing on/off per provider
- Choose what's shared (compliance, pain logs, documents, all)
- Revoke access anytime
- See audit log of what they've viewed

**Provider Actions:**
- Add notes visible to client
- Update prescribed exercises
- Send messages through app
- Request document upload

### Training Partner

**Setup:**
- Profile → Sharing → "Add training partner"
- Mutual connection (both must accept)

**Features:**
- See each other's scheduled workouts
- "Training now" status
- Optional: notify when partner completes a session
- Message within app

**Privacy:**
- No health data shared
- No clinical documents
- No pain logs (unless explicitly shared)
- Just schedule and completion status

### No Public Social

- No leaderboards
- No public profiles
- No feed of others' workouts
- This is a personal tool, not a social network

---

## Dark Mode & Theming

### Appearance Modes

**Options:**
- Light
- Dark
- System (follows device setting)

**Default:** System

### Dark Mode (Primary - matches reference screenshots)

**Colour Palette:**
- Background: Near black (#0A0A0A)
- Surface: Dark grey (#1A1A1A)
- Cards: Slightly lighter (#242424)
- Primary accent: Blue (#3B82F6)
- Text primary: White (#FFFFFF)
- Text secondary: Grey (#9CA3AF)
- Success: Green (#22C55E)
- Warning: Amber (#F59E0B)
- Error: Red (#EF4444)

### Light Mode

**Colour Palette:**
- Background: Off-white (#F9FAFB)
- Surface: White (#FFFFFF)
- Cards: White with subtle shadow
- Primary accent: Blue (#2563EB)
- Text primary: Near black (#111827)
- Text secondary: Grey (#6B7280)
- Success/Warning/Error: Same hues, adjusted for light background

### Accent Colour Customisation

**Optional:**
- User can select accent colour
- Presets: Blue (default), Green, Purple, Orange, Pink
- Affects: buttons, links, progress indicators, selection states
- Does not affect semantic colours (success/warning/error)

---

## Tablet / iPad Experience

### Layout Philosophy

Optimise for the larger canvas, don't just scale up phone UI.

### Today Tab (iPad)

**Split View:**
- Left panel (40%): Readiness ring, quick stats, upcoming schedule
- Right panel (60%): Today's workout detail, exercise cards

**Workout Execution:**
- Two-column layout
- Left: current exercise detail, video demo larger
- Right: upcoming exercises, completed exercises collapsible

### Plan Tab (iPad)

**Calendar View:**
- Full month visible by default
- Tap day → detail panel slides in from right
- Drag to reschedule across days

### Body Map (iPad)

**Side-by-Side:**
- Left: body figure, larger and more detailed
- Right: selected region detail, history, injury info

### Progress Tab (iPad)

**Dashboard Layout:**
- Multiple charts visible simultaneously
- Customisable card arrangement
- More data density without scrolling

### Multitasking Support

- Split View: works at 1/2 and 2/3 width
- Slide Over: phone-like compact layout
- Stage Manager: multiple window sizes supported

### Keyboard Support

- Full keyboard navigation
- Shortcuts for common actions (Cmd+N new workout, Cmd+S save, etc.)
- Discoverable via Cmd+K shortcut menu

---

## Micro-Copy Guidelines

### Voice & Tone

**Core Attributes:**
- Warm but not effusive
- Competent but not clinical
- Concise but not curt
- Honest but not harsh

**What We Sound Like:**
- A really good personal trainer who doesn't make it about themselves
- A supportive friend who also knows their stuff
- Someone who tells you the truth kindly

**What We Don't Sound Like:**
- A drill sergeant ("Come on! Push it!")
- A cheerleader ("You're amazing! Great job!")
- A robot ("Workout complete. Session logged.")
- A worried parent ("Are you sure you should be doing that?")

### Example Copy

**Encouragement:**
- Not: "Amazing work! You crushed it! 💪🔥"
- Yes: "Solid session. See you tomorrow."

**Acknowledging Difficulty:**
- Not: "That looked tough but you powered through!"
- Yes: "That was heavy. Noted - I'll adjust."

**After Missed Session:**
- Not: "We missed you yesterday! Don't give up!"
- Yes: "Ready when you are."

**After Long Gap:**
- Not: "It's been a while... let's get back on track!"
- Yes: "Welcome back. I've adjusted your starting point."

**Error/Problem:**
- Not: "Oops! Something went wrong 😅"
- Yes: "Couldn't load that. Try again?"

**Asking for Feedback:**
- Not: "How was that? Rate your workout!"
- Yes: "How did that feel?" [Easy / Moderate / Hard]

### Button Labels

**Primary Actions:**
- "Start" (not "Let's go!" or "Begin workout")
- "Done" (not "Finish" or "Complete")
- "Save" (not "Save changes")
- "Skip" (not "Skip for now")

**Secondary Actions:**
- "Modify" (not "Edit" or "Change")
- "Not now" (not "Cancel" or "Maybe later")
- "Learn more" (not "Find out more" or "Details")

### Error Messages

**Structure:** What happened + what to do

- "Couldn't connect to Health. I'll use your recent patterns." [Try again]
- "Document wasn't readable. Want to try again or enter details manually?" [Retry] [Manual]
- "Lost connection. Your workout is saved locally." [OK]

---

## Animation & Motion Principles

### Performance Budget

- All animations complete in < 300ms
- Never block user input for animation
- 60fps minimum (drop frames gracefully, never hitch)

### Core Animations

**Screen Transitions:**
- Push/pop: standard iOS/Android navigation (200ms)
- Modal presentation: slide up from bottom (250ms)
- Tab switch: cross-fade (150ms)

**Readiness Ring:**
- Draws on first appearance (500ms, eased)
- Segments animate sequentially, slight overlap
- On data refresh: morphs to new state (300ms)

**Exercise Cards:**
- Expand/collapse: spring animation (250ms)
- Complete: compresses down with checkmark appearing (200ms)
- Skip: fades and compresses (150ms)

**Progress Charts:**
- Initial draw: bars/lines grow from zero (400ms, staggered)
- Data update: morph to new values (300ms)

**Celebrations (PRs, milestones):**
- Brief, not overwhelming (< 1 second total)
- Haptic paired with subtle visual (glow, bounce)
- Never blocks next action

### Reduced Motion Mode

All above replaced with:
- Instant state changes
- Simple opacity fades (100ms) where transition needed
- No bounces, springs, or draws
- Haptics preserved (not motion-based)

---

## Performance Considerations

### Launch Time

- Target: < 2 seconds to interactive (Today screen)
- Pre-fetch today's workout in background
- Defer non-critical data loads

### Workout Execution

- Must be instant - no loading states between exercises
- Entire workout cached locally before start
- Video demos preloaded for upcoming exercise

### Offline Capability

**What Works Offline:**
- Full workout execution
- Logging, notes, pain tracking
- All navigation (cached data)
- Voice commands (common ones)

**What Requires Network:**
- AI conversation (complex queries)
- Document upload/parsing
- Sync to cloud
- Generating new workouts (unless cached)

**Sync Behaviour:**
- Queue all changes locally
- Sync when network available
- Conflict resolution: last-write-wins for simple data, merge for logs
- Never lose user data

---

*End of UX addendum. This document should be read alongside the main handoff.*
