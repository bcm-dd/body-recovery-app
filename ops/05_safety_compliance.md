# Movement & Recovery Companion - Safety, Compliance & Guardrails Plan

**Agent E: Safety, Compliance & Guardrails Designer**
**Version:** 1.0
**Last Updated:** 2026-01-24

---

## Document Purpose

This document defines the comprehensive safety and compliance framework for the Movement & Recovery Companion app. It establishes the guardrails that protect users and the organization while maintaining the app's value as a supportive self-care tool.

**Core Principle:** This is a self-care and wellness companion, NOT a medical device. We help people move well and recover thoughtfully. We do not diagnose, treat, or provide medical advice.

---

## Table of Contents

1. [User-Facing Safety Posture](#1-user-facing-safety-posture)
2. [Red-Flag Detection System](#2-red-flag-detection-system)
3. [Copy Rules](#3-copy-rules)
4. [Regulatory and Privacy Implications](#4-regulatory-and-privacy-implications)
5. [Audit-Lite Logging](#5-audit-lite-logging)
6. [Claims and Liability](#6-claims-and-liability)

---

## 1. User-Facing Safety Posture

### 1.1 Disclaimer Philosophy

Our disclaimers must be:
- **Clear** - No legal jargon that users skip
- **Non-alarmist** - Don't undermine confidence in the app
- **Honest** - Accurately represent what we do and don't do
- **Contextual** - Appear when relevant, not buried in settings

### 1.2 Primary Disclaimer Copy

**Full Version (Onboarding, Settings, About):**

> This app provides general wellness and movement guidance. It is not a medical device and does not diagnose, treat, or cure any medical condition. The suggestions here are educational and for general fitness purposes only.
>
> Always consult a qualified healthcare professional before starting any exercise program, especially if you have injuries, chronic conditions, or health concerns. If you experience pain, dizziness, or discomfort during exercise, stop immediately and seek medical attention if needed.
>
> Your health data helps personalize your experience but is not used for medical diagnosis. The app's suggestions are based on general fitness principles and your stated preferences, not clinical assessment.

**Short Version (Session Start, Quick Reference):**

> This is general wellness guidance, not medical advice. Listen to your body and consult a healthcare professional for medical concerns.

**Minimal Version (Inline, Contextual):**

> Not medical advice. When in doubt, check with your doctor.

### 1.3 Disclaimer Placement

| Location | Disclaimer Version | Trigger |
|----------|-------------------|---------|
| Onboarding | Full | Screen 2 (before health permissions) |
| First workout | Short | Before "Start" button |
| Injury logging | Short | When logging severity "moderate" or higher |
| Document upload | Full + Specific | Before parsing clinical documents |
| AI recommendations | Minimal (inline) | When suggesting modifications |
| Settings > About | Full | Always visible |
| Settings > Health Data | Full | When viewing health integration |
| Body Map > Add Injury | Short | When creating new injury entry |
| Session with pain logged | Short | End-of-session summary |

**Document Upload Specific Disclaimer:**

> I'll extract information from your documents to help customize your experience. I'm not a healthcare provider and may misinterpret medical terminology. Always verify extracted information and follow your healthcare provider's actual recommendations.

### 1.4 Tone Guidelines for Safety Messaging

**Do:**
- Be warm and supportive: "Your safety matters to us"
- Be direct: "This is not medical advice"
- Be empowering: "You know your body best"
- Be helpful: "Here's when to seek help"

**Don't:**
- Be scary: "WARNING: Injury risk!"
- Be dismissive: "Legal stuff, whatever"
- Be preachy: "You really should see a doctor"
- Be vague: "Results may vary"

**Example Safety Transitions:**

Instead of:
> "WARNING: This app cannot diagnose medical conditions. Continuing may be dangerous."

Use:
> "I can help you move well, but I'm not a doctor. For anything that concerns you, a healthcare professional is your best resource."

### 1.5 Communicating Limitations Without Undermining Trust

**The Balance:** Users need to know our limits, but excessive hedging makes the app feel useless.

**Strategy: Confidence in Scope, Humility Beyond It**

| Scenario | Good Framing | Bad Framing |
|----------|--------------|-------------|
| Exercise suggestion | "Based on your preferences and what you've told me, this should work well for you" | "I guess you could try this but I don't really know if it's right" |
| Detecting pain pattern | "I've noticed you've logged shoulder discomfort 3 times this week. Worth checking in with a physio?" | "I detected something concerning that I can't interpret properly" |
| Parsing MRI report | "Here's what I extracted. Please verify this matches what your doctor explained" | "I tried to read this but I'm probably wrong about medical stuff" |
| Uncertainty | "I'm not sure about this one - what does your physio recommend?" | "ERROR: Cannot determine appropriate action" |

---

## 2. Red-Flag Detection System

### 2.1 Overview

The Red-Flag Detection System monitors user inputs, patterns, and stated symptoms to identify situations that require escalation beyond the app's appropriate scope. The goal is to:

1. Protect users from harm
2. Guide users toward appropriate professional care
3. Ensure the app doesn't operate outside its safe boundaries

### 2.2 Keyword and Phrase Detection

**Category 1: Emergency/Immediate Medical Attention Required**

These phrases trigger an immediate safety message with emergency resources:

```
Keywords/Phrases:
- "can't breathe" / "trouble breathing" / "shortness of breath"
- "chest pain" / "heart attack" / "cardiac"
- "stroke" / "numbness on one side" / "face drooping"
- "passing out" / "losing consciousness" / "blackout"
- "severe bleeding" / "blood" (in injury context)
- "broken" / "fracture" / "bone sticking out"
- "can't move" / "paralysis" / "paralyzed"
- "head injury" / "concussion" / "hit my head"
- "suicidal" / "want to die" / "end my life"
- "overdose" / "poisoning"
```

**Response Protocol - Category 1:**
```
[IMMEDIATE POPUP - Cannot be dismissed without acknowledgment]

Title: "This needs immediate attention"

Body: "What you're describing sounds like it may need urgent medical care.
Please contact emergency services or go to your nearest emergency room.

Emergency: Call 911 (US) / 999 (UK) / 112 (EU) / 000 (AU)

This app cannot help with medical emergencies.

[Tap here if you're safe and this was a misunderstanding]"
```

**Category 2: Professional Medical Consultation Recommended**

These trigger a gentler escalation to healthcare professional:

```
Keywords/Phrases:
- "shooting pain" / "radiating pain"
- "tingling" / "pins and needles" / "numbness"
- "weakness" (in specific body part, not general tiredness)
- "locking" / "giving way" / "buckling" (joints)
- "swelling that won't go down"
- "clicking with pain" / "grinding" / "crunching"
- "can't bear weight"
- "worse at night" / "waking up in pain"
- "fever with pain"
- "infection" / "pus" / "red and hot"
- "sharp stabbing"
- "electric shock feeling"
- "burning sensation" (persistent)
- "medication" / "prescription" (seeking advice)
- "surgery" (asking if needed)
- "diagnosis" (seeking one)
```

**Response Protocol - Category 2:**
```
Inline response (conversational, not popup):

"That's outside what I can help with safely. [Symptom] can have various causes
that need professional assessment. I'd recommend checking in with a doctor or
physio who can examine you properly.

In the meantime, I've paused suggestions for [affected area]. Let me know when
you have guidance from your healthcare provider and we can adjust your plan."
```

**Category 3: Concerning Patterns to Monitor**

These don't trigger immediate escalation but flag for tracking:

```
Keywords/Phrases:
- "always hurts" / "constant pain"
- "getting worse" / "not improving"
- "months" / "years" (referring to ongoing issues)
- "chronic" (self-described)
- "flare up" / "flare-up"
- "can't do [activity] anymore"
- "afraid to exercise"
- "too scared to try"
```

### 2.3 Symptom Combination Triggers

Certain combinations are more concerning than individual symptoms:

| Combination | Action |
|-------------|--------|
| Pain + Numbness in same area | Category 2 escalation |
| Pain + Weakness in same area | Category 2 escalation |
| Pain + Swelling + Warmth | Category 2 escalation (possible infection/inflammation) |
| Multiple body parts with "sharp pain" | Category 2 escalation |
| Any symptom + "for months/years" | Category 2 escalation |
| Pain + Recent accident/fall/impact | Category 2 escalation |
| Any symptom + Fever | Category 2 escalation |
| Chest/left arm + Pain/tightness | Category 1 escalation |
| Headache + Vision changes | Category 1 escalation |
| Headache + Neck stiffness + Fever | Category 1 escalation |

### 2.4 Pain Level Thresholds

**Pain Severity Scale Used in App (0-10):**

| Level | Label | App Response |
|-------|-------|--------------|
| 1-3 | Mild | Log and continue, suggest modifications if recurring |
| 4-6 | Moderate | Pause activity, suggest alternatives, track pattern |
| 7-8 | Significant | Stop session, recommend rest, flag for follow-up |
| 9-10 | Severe | Stop immediately, Category 2 escalation, professional referral |

**Pain During Exercise Protocol:**

- **First occurrence at 4+:** "Let's stop that exercise. How about [alternative]?"
- **Second occurrence same area, same session:** "That area is talking to you. Let's skip anything that involves [body part] today."
- **Third occurrence same area within 7 days:** "This keeps coming up. It might be worth having someone take a look at your [body part]. I'll avoid loading it until you say it's better."

### 2.5 Duration and Pattern Concerns

**Time-Based Escalation Triggers:**

| Pattern | Threshold | Action |
|---------|-----------|--------|
| Same pain location | 3+ occurrences in 7 days | Recommend professional consultation |
| Pain level not improving | No decrease over 14 days | Recommend professional consultation |
| Pain level worsening | Any increase trend over 7 days | Recommend professional consultation |
| Exercise avoidance | Same exercise skipped 3+ times citing pain | Investigate and potentially escalate |
| Session abandonment | 2+ sessions ended early due to pain in 7 days | Recommend professional consultation |

### 2.6 What the App Must NEVER Attempt

**Absolute Boundaries - The App Will Not:**

1. **Diagnose conditions**
   - Never say "you have [condition]" or "this sounds like [condition]"
   - Never confirm or deny a suspected diagnosis
   - Never interpret imaging or test results diagnostically

2. **Prescribe treatment**
   - Never recommend specific treatments for conditions
   - Never suggest medications or supplements for therapeutic purposes
   - Never provide rehabilitation protocols for injuries (only general movement)

3. **Override professional advice**
   - Never suggest continuing exercise against stated medical restrictions
   - Never recommend ignoring healthcare provider instructions
   - Never suggest that the app's assessment supersedes professional opinion

4. **Handle emergency situations**
   - Never attempt to manage acute emergencies
   - Never delay users from seeking emergency care
   - Never provide first-aid instructions for serious injuries

5. **Assess mental health**
   - Never provide mental health diagnosis or treatment
   - Never attempt suicide intervention (escalate to crisis resources immediately)
   - Never counsel on psychological conditions

6. **Manage chronic disease**
   - Never provide diabetes management, blood pressure advice, etc.
   - Never adjust guidance based on chronic disease without professional input
   - Never claim to help "manage" medical conditions

**Technical Implementation:**

```typescript
// Red flag detection should run on every user input
interface RedFlagResult {
  category: 'emergency' | 'professional' | 'monitor' | 'clear';
  triggers: string[];
  action: RedFlagAction;
  blockContinuation: boolean;
}

// Emergency category MUST block all app functionality until acknowledged
// Professional category MUST be logged and shown to user
// Monitor category MUST be logged for pattern detection
```

---

## 3. Copy Rules

### 3.1 Prohibited Words and Phrases

**Never Use - Medical/Clinical Terms:**

| Prohibited | Why | Use Instead |
|------------|-----|-------------|
| "diagnose" / "diagnosis" | Medical scope | "identify" / "notice" |
| "treat" / "treatment" | Medical scope | "support" / "help with" |
| "cure" / "heal" | Medical claims | "support recovery" / "feel better" |
| "prescribe" / "prescription" | Medical authority | "suggest" / "recommend" |
| "therapy" / "therapeutic" | Clinical connotation | "routine" / "helpful" |
| "rehabilitate" / "rehab" (as noun) | Clinical scope | "recovery support" / "movement guidance" |
| "patient" | Medical relationship | "user" / "you" |
| "clinical" | Medical context | "personalized" / "tailored" |
| "medical advice" | Claim of scope | "wellness guidance" / "movement suggestions" |
| "safe" (absolute) | Liability | "appropriate for you" / "generally suitable" |
| "guaranteed" | Unverifiable claim | "designed to" / "intended to" |
| "proven" (for our methods) | Unverifiable claim | "based on" / "research suggests" |
| "fix" | Implies cure | "help with" / "support" |
| "prevent injury" | Unverifiable claim | "reduce risk" / "support good movement" |
| "expert" (about the app) | Overstatement | "designed with care" / "thoughtfully created" |

**Never Use - Alarmist Language:**

| Prohibited | Use Instead |
|------------|-------------|
| "WARNING" (caps) | "Note:" or "Keep in mind:" |
| "DANGER" | "Be careful with" |
| "risk of injury" | "listen to your body" |
| "could cause damage" | "may not be suitable if..." |
| "wrong" (about user's movement) | "you might try..." |
| "bad form" | "here's another approach" |

**Never Use - Guilt/Shame Language:**

| Prohibited | Use Instead |
|------------|-------------|
| "You should have..." | "Next time you might..." |
| "You didn't..." | "Let's try..." |
| "failing" / "failed" | "adjusting" / "modified" |
| "gave up" | "stopped" / "paused" |
| "lazy" / "unmotivated" | (never reference motivation negatively) |
| "excuse" | "reason" |

### 3.2 Approved Terminology

**For What the App Does:**

- "wellness companion" / "movement companion"
- "self-care support" / "recovery support"
- "movement guidance" / "exercise suggestions"
- "personalized recommendations" (not "prescriptions")
- "body awareness tool"
- "fitness guidance" / "general wellness"

**For Exercise Recommendations:**

- "you might try..."
- "consider..."
- "here's an option..."
- "this could work for you..."
- "based on what you've told me..."
- "one approach is..."
- "if you're comfortable..."

**For Health Information:**

- "based on general wellness principles..."
- "research suggests..."
- "many people find..."
- "common approaches include..."
- "general guidance indicates..."

**For Limitations:**

- "I'm not able to..."
- "that's outside my scope..."
- "a healthcare professional would be better for..."
- "I'd recommend checking with your doctor about..."
- "for that, you'll want professional guidance..."

### 3.3 Framing Guidelines

**Suggestions, Not Prescriptions:**

| Instead of | Use |
|------------|-----|
| "You should do 3 sets of 10" | "Try 3 sets of 10 - adjust based on how it feels" |
| "Do this exercise" | "This exercise might help" |
| "You need to rest" | "Rest could be helpful here" |
| "Stop doing that" | "You might want to ease off on that" |
| "This will help your back" | "Many people find this helpful for back comfort" |

**Uncertainty and Limitations:**

| Instead of | Use |
|------------|-----|
| "I don't know" | "I'm not certain about that - what does your physio say?" |
| "I can't do that" | "That's outside what I can help with safely" |
| "Error" | "I couldn't quite work that out" |
| "You're wrong" | "Let me make sure I understand..." |

**Escalation Language:**

| Situation | Appropriate Phrasing |
|-----------|---------------------|
| Recommending doctor visit | "It might be worth having a professional take a look" |
| Stopping exercise | "Let's pause on that one and try something else" |
| Serious concern | "This sounds like something a doctor should assess" |
| Pattern concern | "I've noticed this keeps coming up - have you mentioned it to your healthcare provider?" |
| Emergency | "Please seek immediate medical attention" |

### 3.4 AI Response Templates

**When User Describes Pain:**

```
[Acknowledge] "Got it, that sounds uncomfortable."
[Adapt] "I'll adjust today's session to work around that."
[Suggest] "If it persists, it might be worth mentioning to your doctor."
```

**When User Asks for Diagnosis:**

```
[Redirect] "I can't say what's causing that - only a healthcare professional
can properly assess it."
[Help] "What I can do is adjust your movement to avoid aggravating it."
[Suggest] "Want me to modify your plan while you get it checked out?"
```

**When User Ignores Warnings:**

```
[Acknowledge autonomy] "Ultimately, you know your body."
[State limits] "I'll note that you want to continue, but I can't guide you
through exercises that might aggravate what you've described."
[Offer alternative] "I can suggest gentler alternatives for today if you'd like."
```

**When Parsing Medical Documents:**

```
[Set expectation] "I've pulled out the key details from this document."
[Show uncertainty] "Please check that this matches what your healthcare provider
explained - I may have misread some terms."
[Offer correction] "Tap anything that needs correcting."
```

---

## 4. Regulatory and Privacy Implications

### 4.1 Regulatory Classification

**What We Are:**
- A general wellness application
- A fitness/exercise companion
- A self-care support tool

**What We Are NOT:**
- A medical device (Class I, II, or III)
- A clinical decision support tool
- A diagnostic application
- A prescription system

**Regulatory Strategy:**
- Position clearly as wellness, not medical
- Avoid any claims that would trigger medical device classification
- Maintain documentation supporting wellness classification
- Monitor regulatory changes (FDA, MHRA, TGA, etc.)

### 4.2 GDPR-Ready Requirements for MVP

Even without a backend in MVP, design for GDPR compliance from day one.

**Lawful Basis for Processing:**

| Data Type | Lawful Basis | Notes |
|-----------|--------------|-------|
| Account information | Contract | Needed to provide service |
| Health/fitness data | Explicit consent | Separate consent required |
| Usage analytics | Legitimate interest | Anonymized, can be opted out |
| Clinical documents | Explicit consent | High sensitivity |

**Required Capabilities (MVP or Phase 2):**

1. **Right to Access (Article 15)**
   - User can export all their data
   - Format: JSON + original documents
   - Implementation: "Download my data" button in Settings

2. **Right to Rectification (Article 16)**
   - User can edit any stored information
   - All user inputs are editable
   - Document extractions are confirmable/correctable

3. **Right to Erasure (Article 17)**
   - "Delete my data" functionality
   - Must delete from all storage (local + cloud)
   - Must delete from backups within reasonable timeframe
   - Confirmation before deletion

4. **Right to Data Portability (Article 20)**
   - Export in machine-readable format (JSON)
   - Include all user-provided data
   - Include derived data (insights, patterns)

5. **Consent Management**
   - Granular consent options (health data, analytics, documents)
   - Easy withdrawal of consent
   - Record of when consent given/withdrawn

**Privacy by Design Checklist:**

- [ ] Data minimization: Only collect what's needed
- [ ] Purpose limitation: Use data only for stated purposes
- [ ] Storage limitation: Define retention periods
- [ ] Pseudonymization: Separate identifiers from health data where possible
- [ ] Encryption: All health data encrypted at rest and in transit

### 4.3 HIPAA-Aligned Posture

**Important:** We are NOT a HIPAA-covered entity (not a healthcare provider, health plan, or healthcare clearinghouse). However, we adopt HIPAA-aligned practices for user trust and enterprise readiness.

**HIPAA-Aligned Practices:**

1. **Access Controls**
   - User authentication required for health data access
   - No shared accounts
   - Session timeouts

2. **Audit Trails**
   - Log access to health data (see Section 5)
   - Log modifications
   - Log exports/deletions

3. **Encryption Standards**
   - AES-256 for data at rest
   - TLS 1.3 for data in transit
   - Encrypted local storage (MMKV encryption enabled)

4. **Minimum Necessary**
   - Only display health data when contextually needed
   - Don't transmit full health history for simple operations
   - API calls include only required data fields

5. **Business Associate Considerations**
   - Any third-party processors must meet our security standards
   - Document data processing agreements
   - Anthropic API usage: review their data handling policies

**What This Means Practically:**

```
Even though we're not legally required to follow HIPAA:
- We treat health data with the same care a healthcare org would
- We can credibly say "HIPAA-aligned" to enterprise customers
- We're positioned for future healthcare partnerships
- Users can trust their health data is handled seriously
```

### 4.4 Data Minimization Principles

**What We Collect (Minimum Viable):**

| Data Category | What We Need | What We Don't Need |
|---------------|--------------|-------------------|
| Health metrics | Daily aggregates (sleep hours, HRV average) | Raw minute-by-minute data |
| Exercise history | Exercises, weights, reps, dates | Exact timestamps of each rep |
| Body information | Regions flagged, severity level | Detailed medical history |
| Documents | Extracted constraints and exercises | Full document text after extraction |
| Usage | Feature usage counts | Detailed clickstream |

**Data Lifecycle:**

```
1. Collection: Only at point of clear user value
2. Processing: On-device when possible
3. Storage: Encrypted, minimum retention
4. Transmission: Only aggregates to backend
5. Deletion: User-controlled, complete
```

**On-Device vs Cloud:**

| On-Device (Preferred) | Cloud (When Necessary) |
|----------------------|------------------------|
| Raw health data | Aggregated summaries |
| Workout execution | Workout plans (for sync) |
| Pain logs (raw) | Pattern analysis results |
| Document images | Extracted constraints |
| Real-time processing | AI reasoning |

### 4.5 User Consent Requirements

**Consent Flow - Onboarding:**

```
Screen: "Personalize Your Experience"

"To give you the best guidance, I'd like to access some of your health data.
Here's what I'll use and why:

[x] Sleep data - To know when you're rested or need recovery
[x] Heart rate data - To understand your baseline fitness
[x] Activity data - To see your movement patterns

I'll never share this data with third parties. You can change these
permissions anytime in Settings.

[Continue with health data] [Skip for now]"
```

**Consent Flow - Document Upload:**

```
Screen: "Before You Upload"

"Clinical documents may contain sensitive information. Here's how I handle them:

- I'll extract exercise recommendations and constraints
- I'll use this to customize your movement guidance
- The original document is stored securely and can be deleted anytime
- I may misinterpret medical terms - you can correct my extraction

[x] I understand this is not medical interpretation
[x] I consent to document processing

[Upload] [Cancel]"
```

**Consent Records:**

```typescript
interface ConsentRecord {
  type: 'health_data' | 'document_processing' | 'analytics';
  granted: boolean;
  timestamp: Date;
  method: 'onboarding' | 'settings' | 'contextual';
  version: string; // App version when consent given
}
```

### 4.6 Data Export and Deletion Requirements

**Export Format:**

```
user_data_export_2026-01-24/
  profile.json          # Account info, preferences
  health_data.json      # All health snapshots
  workouts.json         # All workout history
  body_model.json       # Injuries, constraints, pain logs
  documents/            # Original uploaded documents
    mri_report_2025.pdf
    physio_program.jpg
  extracted_data.json   # Document extractions
  consent_history.json  # Record of all consents
  export_metadata.json  # Export date, app version
```

**Deletion Process:**

```
1. User requests deletion
2. Show confirmation: "This will permanently delete all your data"
3. Require explicit confirmation (type "DELETE" or hold button)
4. Delete from:
   - Local device storage (immediate)
   - Cloud database (immediate)
   - Cloud blob storage (immediate)
   - Backups (within 30 days)
   - Analytics (anonymized data may remain)
5. Send confirmation email
6. Log deletion event (only: user_id, timestamp, not content)
```

---

## 5. Audit-Lite Logging

### 5.1 What Must Be Logged (Safety Events)

**Required Log Events:**

| Event | Data Logged | Purpose |
|-------|-------------|---------|
| Red flag detected | Type, category, timestamp, was_acknowledged | Safety monitoring |
| Escalation shown | Escalation type, user response | Effectiveness tracking |
| Session stopped for safety | Reason (pain level, pattern), timestamp | Safety monitoring |
| Professional referral suggested | Reason, context (general only), user acknowledged | Compliance evidence |
| Emergency message shown | Timestamp, user acknowledged | Critical safety |
| Document parsing completed | Success/failure, confidence score | Quality monitoring |
| Document parsing error | Error type, was manually corrected | Quality improvement |
| Safety disclaimer shown | Location, version | Compliance evidence |
| User overrode safety suggestion | What was overridden, timestamp | Risk documentation |

**Log Format:**

```typescript
interface SafetyLog {
  id: string;
  timestamp: Date;
  userId: string; // Pseudonymized
  eventType: SafetyEventType;
  category: 'red_flag' | 'escalation' | 'override' | 'compliance';
  data: {
    // Event-specific, never includes actual health content
    triggerType?: string;
    severity?: string;
    acknowledged?: boolean;
    userAction?: 'accepted' | 'dismissed' | 'override';
  };
  appVersion: string;
}
```

### 5.2 What Must NEVER Be Logged

**Prohibited from Logs:**

| Data Type | Why Prohibited |
|-----------|---------------|
| Actual health metrics (HRV, sleep hours, etc.) | Sensitive health data |
| Specific pain descriptions | Medical information |
| Body parts affected (in detail) | Medical information |
| Document contents | Clinical data |
| Extracted medical findings | Clinical data |
| Exercise performance details | Sensitive patterns |
| User conversation content | Privacy |
| Location data | Privacy |
| Device health data sync content | Sensitive health data |

**Example - Correct vs Incorrect Logging:**

```
CORRECT:
{
  eventType: "red_flag_detected",
  category: "professional",
  data: {
    triggerType: "symptom_combination",
    severity: "moderate",
    acknowledged: true
  }
}

INCORRECT:
{
  eventType: "red_flag_detected",
  data: {
    userInput: "My shoulder has shooting pain and numbness",  // NO!
    bodyPart: "left_shoulder",                                 // NO!
    symptoms: ["shooting_pain", "numbness"]                    // NO!
  }
}
```

### 5.3 Log Retention Considerations

**Retention Periods:**

| Log Type | Retention | Rationale |
|----------|-----------|-----------|
| Safety events (red flags, escalations) | 3 years | Liability protection |
| Compliance events (disclaimers shown) | 3 years | Regulatory evidence |
| Error logs (parsing failures) | 90 days | Debugging |
| General usage (anonymized) | 1 year | Product improvement |

**Retention Implementation:**

```
- Logs stored with expiration timestamp
- Automated purge job runs daily
- User deletion removes their logs immediately (except anonymized aggregates)
- Annual review of retention needs
```

### 5.4 Format and Storage Approach

**Log Storage (Phase 2 - Backend):**

```
Vercel KV (Redis) for:
- Recent logs (last 7 days) - fast access for debugging
- Real-time safety event counts

Vercel Postgres for:
- Historical logs - structured, queryable
- Compliance reports
- Aggregated safety metrics
```

**Log Schema (Postgres):**

```sql
CREATE TABLE safety_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- Pseudonymized, not linked to PII
  event_type VARCHAR(50) NOT NULL,
  category VARCHAR(20) NOT NULL,
  severity VARCHAR(20),
  acknowledged BOOLEAN,
  user_action VARCHAR(20),
  app_version VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_safety_logs_user ON safety_logs(user_id, created_at);
CREATE INDEX idx_safety_logs_type ON safety_logs(event_type, created_at);
CREATE INDEX idx_safety_logs_expiry ON safety_logs(expires_at);
```

**MVP (Local-Only) Logging:**

```typescript
// Store safety events locally for future sync
interface LocalSafetyLog {
  events: SafetyLog[];
  lastSynced: Date | null;
}

// MMKV storage, encrypted
storage.set('safety_logs', JSON.stringify(localLogs));

// Sync to backend when available (Phase 2)
// Delete local after confirmed sync
```

### 5.5 Safety Dashboard (Phase 2)

**Admin-Only Dashboard Metrics:**

```
Safety Overview (last 30 days):
- Red flag events: [count] (Category 1: [x], Category 2: [y])
- Escalation acknowledgment rate: [%]
- User overrides: [count]
- Session stops for safety: [count]
- Document parsing confidence: [avg %]

Trends:
- Red flags by trigger type (chart)
- Escalation effectiveness (acknowledged vs dismissed)
- Safety feature engagement

NO individual user data shown - aggregates only
```

---

## 6. Claims and Liability

### 6.1 What the App Must NEVER Claim

**Prohibited Claims:**

| Category | Prohibited Claim | Why |
|----------|------------------|-----|
| Medical | "Diagnoses your condition" | Medical device territory |
| Medical | "Treats or cures injuries" | Medical claims |
| Medical | "Replaces your doctor/physio" | Professional substitution |
| Medical | "Clinically proven" | Requires clinical trials |
| Medical | "FDA approved/cleared" | We're not a medical device |
| Safety | "Prevents injuries" | Unverifiable |
| Safety | "Safe for everyone" | Individual variation |
| Safety | "No risk" | Always some risk in exercise |
| Efficacy | "Guaranteed results" | Individual variation |
| Efficacy | "Will fix your [problem]" | Medical claim |
| Efficacy | "Works for all conditions" | Overgeneralization |
| Data | "Medically accurate" | Not clinically validated |
| Data | "Perfect interpretation" | AI has limitations |

**Marketing Review Checklist:**

Before any public claim, verify:
- [ ] Does not imply medical diagnosis capability
- [ ] Does not promise treatment or cure
- [ ] Does not guarantee safety or outcomes
- [ ] Does not position as medical device
- [ ] Includes appropriate disclaimers
- [ ] Uses approved terminology only

### 6.2 Required Disclosures

**App Store Listings:**

```
Description must include:
"[App Name] provides general wellness and movement guidance. It is not a
medical device and does not provide medical advice, diagnosis, or treatment.
Consult a healthcare professional before starting any exercise program."
```

**Website/Marketing:**

```
Footer on all pages:
"[App Name] is a wellness app, not a medical device. Content is for
informational purposes only. Always seek professional medical advice
for health concerns."
```

**In-App (Settings > About):**

```
About [App Name]

Version: X.X.X

[App Name] helps you move well and support your recovery through personalized
movement guidance.

IMPORTANT: This app does not provide medical advice, diagnosis, or treatment.
The content is for general informational and educational purposes only. It is
not intended to be a substitute for professional medical advice.

Always consult with a qualified healthcare provider before starting any
exercise program, especially if you have injuries, medical conditions, or
health concerns.

If you experience pain, dizziness, or other symptoms during exercise, stop
immediately and consult a medical professional.

Your use of this app is at your own risk.

[Privacy Policy] [Terms of Service]
```

### 6.3 Terms of Service Considerations

**Key Provisions to Include:**

1. **Nature of Service**
   - App provides general wellness guidance only
   - Not a medical device or medical service
   - Not a substitute for professional care

2. **User Responsibilities**
   - Consult healthcare provider before use
   - Responsibility for own health decisions
   - Report accurate information
   - Follow healthcare provider's advice over app suggestions

3. **Limitation of Liability**
   - App not liable for injury or health outcomes
   - No warranties on accuracy of information
   - No warranties on suitability for user's condition
   - Maximum liability limited to subscription fees paid

4. **Assumption of Risk**
   - Exercise carries inherent risk
   - User assumes risk of physical activity
   - User responsible for operating within safe limits

5. **Medical Emergency**
   - App cannot handle medical emergencies
   - User agrees to seek appropriate emergency care
   - App not liable for emergency outcomes

6. **Health Data**
   - User consents to health data processing
   - User responsible for data accuracy
   - App not liable for actions based on incorrect data

7. **Document Processing**
   - AI extraction may contain errors
   - User responsible for verifying accuracy
   - App not liable for misinterpretation

**Terms Review Process:**
- Legal review annually or after major feature changes
- Update version number with each change
- Require acceptance of new terms on significant updates

### 6.4 Age Restrictions

**Minimum Age: 18 years**

**Rationale:**
- Exercise programming for minors requires parental/guardian involvement
- Health data collection for minors has additional regulations (COPPA)
- Injury risk assessment differs for developing bodies
- Avoids complexity of minor consent and parental controls in MVP

**Implementation:**

```
Onboarding Screen (before account creation):

"Quick check: Are you 18 or older?

This app is designed for adults. If you're under 18, please use this app
with a parent or guardian's involvement.

[I'm 18 or older] [I'm under 18]"

If under 18:
"Thanks for your interest! [App Name] is currently designed for adults.
Please check with a parent or guardian about appropriate fitness apps for you."
[Exit app / parental consent flow for future version]
```

**Future Consideration (Post-MVP):**
- Teen version with parental consent
- Age-appropriate content and intensity
- COPPA compliance for under-13 (not recommended)

### 6.5 Insurance and Liability Coverage

**Recommendations for Business:**

1. **Professional Liability Insurance**
   - Coverage for claims arising from app guidance
   - Minimum recommended: $1M per occurrence

2. **Cyber Liability Insurance**
   - Coverage for data breaches
   - Health data breach coverage critical
   - Minimum recommended: $1M

3. **General Liability Insurance**
   - Coverage for general business operations
   - Standard business coverage

4. **Errors and Omissions Insurance**
   - Coverage for software defects/errors
   - AI misinterpretation coverage

**Documentation for Claims Defense:**
- Maintain records of all safety features
- Document disclaimer presentation
- Keep logs of escalation events
- Archive ToS acceptance records
- Preserve evidence of user acknowledgments

---

## Appendix A: Quick Reference Card

### For Developers

```
BEFORE SHIPPING ANY FEATURE:
[ ] Does it avoid medical terminology? (Section 3.1)
[ ] Does it use approved phrasing? (Section 3.2-3.3)
[ ] Are disclaimers in place? (Section 1.3)
[ ] Are red flags detected? (Section 2)
[ ] Is logging correct (what/what not)? (Section 5)
[ ] No prohibited claims? (Section 6.1)
```

### For Content/Copy

```
NEVER SAY: diagnose, treat, cure, prescribe, therapy, safe, guaranteed, proven
ALWAYS SAY: suggest, may help, consider, you might try, many people find

Frame as: Guidance, not prescription
Tone: Warm, competent, concise, honest
```

### For AI Prompts

```
System prompt must include:
- "You are a wellness companion, not a medical professional"
- "Never diagnose conditions or recommend treatments"
- "Suggest professional consultation when appropriate"
- "Use phrases like 'you might try' not 'you should'"
- "If user describes emergency symptoms, direct to emergency services"
```

---

## Appendix B: Escalation Flowchart

```
User Input
    |
    v
[Keyword Detection]
    |
    +---> Category 1 (Emergency)
    |         |
    |         v
    |     [BLOCK ALL]
    |     Show emergency modal
    |     Require acknowledgment
    |     Log event
    |
    +---> Category 2 (Professional)
    |         |
    |         v
    |     Show inline guidance
    |     Pause affected exercises
    |     Suggest professional
    |     Log event
    |
    +---> Category 3 (Monitor)
    |         |
    |         v
    |     Log for pattern detection
    |     Continue normally
    |     Trigger if threshold reached
    |
    +---> Clear
          |
          v
      Continue normally
```

---

## Appendix C: Regulatory Quick Reference

| Jurisdiction | Key Regulation | Our Position | Action Required |
|--------------|----------------|--------------|-----------------|
| USA | FDA (medical devices) | Not a medical device | Avoid medical claims |
| USA | FTC | Wellness app | Truthful marketing |
| USA | State laws | Varies | Monitor key states |
| EU | GDPR | Applies | Full compliance (Sect. 4) |
| EU | MDR | Not applicable | Avoid medical positioning |
| UK | UK GDPR | Applies | Same as GDPR |
| UK | MHRA | Not applicable | Avoid medical positioning |
| Australia | TGA | Not applicable | Avoid medical claims |
| Australia | Privacy Act | Applies | Health data protections |
| Canada | PIPEDA | Applies | Consent requirements |

---

## Appendix D: Review and Update Schedule

| Item | Review Frequency | Owner |
|------|------------------|-------|
| Disclaimer copy | Quarterly | Legal/Product |
| Red flag keywords | Monthly | Safety Team |
| Terms of Service | Annually | Legal |
| Privacy Policy | Annually | Legal/Engineering |
| Regulatory landscape | Quarterly | Legal |
| Logging compliance | Quarterly | Engineering |
| This document | Bi-annually | Safety Lead |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-24 | Agent E | Initial document |

---

*End of Safety, Compliance & Guardrails Plan*
