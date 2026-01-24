# Copy & Safety Compliance QA Report

**Package:** `packages/copy`
**Reference Document:** `/ops/05_safety_compliance.md`
**QA Agent:** Copy & Safety QA
**Date:** 2026-01-24
**Status:** Review Complete

---

## Executive Summary

The copy package is **largely compliant** with the safety and compliance guidelines. The core disclaimers match the approved text exactly, and the overall tone follows the warm, supportive guidelines. However, several issues were identified that require attention before production release.

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 1 |
| Medium | 4 |
| Low | 4 |

---

## Files Reviewed

1. `/home/user/body-recovery-app/packages/copy/src/strings/common.ts`
2. `/home/user/body-recovery-app/packages/copy/src/strings/onboarding.ts`
3. `/home/user/body-recovery-app/packages/copy/src/strings/workout.ts`
4. `/home/user/body-recovery-app/packages/copy/src/strings/safety.ts`
5. `/home/user/body-recovery-app/packages/copy/src/types.ts`
6. `/home/user/body-recovery-app/packages/copy/src/index.ts`

---

## Detailed Findings

### HIGH Severity Issues

#### H1: Missing Mental Health Crisis Resources
- **File:** `/home/user/body-recovery-app/packages/copy/src/strings/safety.ts`
- **Location:** Lines 36-42 (`escalation.emergency.emergencyNumbers`)
- **Issue:** The safety compliance document (Section 2.2) lists mental health keywords as Category 1 (Emergency) triggers: "suicidal", "want to die", "end my life". The emergency section only includes general emergency numbers (911, 999, etc.) but lacks dedicated mental health crisis resources.
- **Required per compliance:** When mental health emergencies are detected, users should see appropriate crisis resources.
- **Suggested Fix:** Add mental health crisis lines to the emergency numbers section:
```typescript
emergencyNumbers: {
  us: 'Emergency: Call 911 (US)',
  uk: 'Emergency: Call 999 (UK)',
  eu: 'Emergency: Call 112 (EU)',
  au: 'Emergency: Call 000 (AU)',
},
mentalHealthResources: {
  us: 'Crisis Line: Call or text 988',
  uk: 'Samaritans: Call 116 123',
  intl: 'Crisis Text Line: Text HOME to 741741',
},
```

---

### MEDIUM Severity Issues

#### M1: Prohibited Term "prescription" in Code
- **File:** `/home/user/body-recovery-app/packages/copy/src/strings/workout.ts`
- **Location:** Line 127 (comment) and object key `prescription`
- **Issue:** Section 3.1 of the safety compliance document prohibits the term "prescribe" / "prescription" as it implies medical authority. While this is a code-level naming convention rather than user-facing copy, it could influence developer mindset and lead to terminology creep in future copy.
- **Suggested Fix:** Rename to `exerciseParameters` or `exerciseSettings`:
```typescript
// Exercise parameters (was: Prescriptions)
exerciseParameters: {
  sets: '{count} sets',
  reps: '{count} reps',
  // ...
},
```

#### M2: "Preventing issues" Language in Onboarding
- **File:** `/home/user/body-recovery-app/packages/copy/src/strings/onboarding.ts`
- **Location:** Lines 49-51 (`focusSelection.options[2]`)
- **Issue:** The text reads "Staying mobile and preventing issues". Section 3.1 prohibits "prevent injury" and recommends using "reduce risk" or "support good movement" instead. While "preventing issues" is not identical, it makes an implicit preventive health claim.
- **Current Text:**
```typescript
{
  id: 'prevention',
  title: 'Staying mobile and preventing issues',
  description: 'Maintaining flexibility and movement quality',
}
```
- **Suggested Fix:**
```typescript
{
  id: 'prevention',
  title: 'Staying mobile',
  description: 'Supporting flexibility and movement quality',
}
```

#### M3: Missing Category 3 (Monitor) Pattern Copy
- **File:** `/home/user/body-recovery-app/packages/copy/src/strings/safety.ts`
- **Issue:** Section 2.2 of the compliance document defines Category 3 (Monitor) phrases like "always hurts", "getting worse", "chronic", etc. These require tracking and eventual user-facing messaging, but no corresponding copy strings exist.
- **Suggested Fix:** Add a `monitoring` section to safety.ts:
```typescript
monitoring: {
  patternNotice: 'I\'ve noticed {pattern}. This might be something to mention to your healthcare provider.',
  chronicConcern: 'You\'ve mentioned this has been going on for a while. Have you had a chance to discuss it with a professional?',
  notImproving: 'This doesn\'t seem to be improving. It might be worth getting it checked out.',
},
```

#### M4: Missing Data Privacy Action Copy
- **File:** N/A (missing entirely)
- **Issue:** Section 4.6 of the compliance document requires specific copy for data export and deletion flows (GDPR requirements). No strings exist for these critical user flows.
- **Suggested Fix:** Create new strings section or add to common.ts:
```typescript
dataPrivacy: {
  exportTitle: 'Download your data',
  exportDescription: 'Get a copy of all your data in a portable format.',
  exportButton: 'Download data',
  exportSuccess: 'Your data export is ready.',
  deleteTitle: 'Delete your data',
  deleteWarning: 'This will permanently delete all your data. This cannot be undone.',
  deleteConfirmation: 'Type DELETE to confirm',
  deleteButton: 'Delete my data',
  deleteSuccess: 'Your data has been deleted.',
},
```

---

### LOW Severity Issues

#### L1: Missing Terms/Privacy Acceptance Copy
- **File:** `/home/user/body-recovery-app/packages/copy/src/strings/onboarding.ts`
- **Location:** Line 115
- **Issue:** The `account.privacyNote` mentions "Terms and Privacy Policy" but there's no explicit acceptance copy or links. Section 4.5 requires clear consent flows.
- **Current Text:** `'By creating an account, you agree to our Terms and Privacy Policy'`
- **Suggested Enhancement:** Add explicit link/action copy:
```typescript
privacyNote: 'By creating an account, you agree to our',
termsLink: 'Terms of Service',
privacyLink: 'Privacy Policy',
```

#### L2: Missing Structured About Page Copy
- **File:** `/home/user/body-recovery-app/packages/copy/src/strings/safety.ts`
- **Issue:** Section 6.2 specifies a complete "Settings > About" disclosure structure. While `disclaimers.full` exists, there's no structured about page copy including version, app description, and legal links.
- **Suggested Fix:** Add `aboutPage` section:
```typescript
aboutPage: {
  title: 'About {appName}',
  description: '{appName} helps you move well and support your recovery through personalized movement guidance.',
  important: 'IMPORTANT',
  legalDisclaimer: 'This app does not provide medical advice, diagnosis, or treatment...',
  riskNote: 'Your use of this app is at your own risk.',
  privacyPolicy: 'Privacy Policy',
  termsOfService: 'Terms of Service',
},
```

#### L3: Missing Error States for Safety Failures
- **File:** `/home/user/body-recovery-app/packages/copy/src/strings/common.ts`
- **Location:** Lines 131-137 (`errors`)
- **Issue:** Generic error messages exist but no specific error copy for safety-related failures (e.g., red-flag detection failure, escalation delivery failure).
- **Suggested Fix:** Add to errors section:
```typescript
safetyCheckFailed: 'We couldn\'t complete a safety check. Please proceed carefully.',
escalationFailed: 'We tried to show you an important message but couldn\'t. If you have any health concerns, please consult a professional.',
```

#### L4: Inconsistent Placeholder Formatting
- **File:** Multiple files
- **Issue:** Some placeholders use `{variable}` (e.g., `{duration}`, `{count}`) while descriptions could benefit from more consistent patterns. This is a minor code quality issue.
- **Suggested Fix:** Document the placeholder convention in the package README or add to types.ts.

---

## Compliance Verification

### Prohibited Words Check (Section 3.1)

| Term | Status | Notes |
|------|--------|-------|
| diagnose/diagnosis | COMPLIANT | Used only in disclaimer stating what app does NOT do |
| treat/treatment | COMPLIANT | Used only in disclaimer context |
| cure/heal | COMPLIANT | Used only in disclaimer context |
| prescribe/prescription | WARNING | Object key in workout.ts (M1) |
| therapy/therapeutic | COMPLIANT | Not found |
| rehabilitate/rehab | COMPLIANT | Not found |
| patient | COMPLIANT | Not found |
| clinical | COMPLIANT | Used only in disclaimer context |
| safe (absolute) | COMPLIANT | Used contextually ("help with safely") |
| guaranteed | COMPLIANT | Not found |
| proven | COMPLIANT | Not found |
| fix | COMPLIANT | Not found |
| prevent injury | WARNING | "preventing issues" variant found (M2) |
| expert | COMPLIANT | Not found |

### Alarmist Language Check (Section 3.1)

| Term | Status |
|------|--------|
| WARNING (caps) | COMPLIANT - Not found |
| DANGER | COMPLIANT - Not found |
| "risk of injury" | COMPLIANT - Not found |
| "could cause damage" | COMPLIANT - Not found |
| "wrong" (about movement) | COMPLIANT - Not found |
| "bad form" | COMPLIANT - Not found |

### Guilt/Shame Language Check (Section 3.1)

| Term | Status |
|------|--------|
| "You should have..." | COMPLIANT - Not found |
| "failing/failed" | COMPLIANT - Not found |
| "gave up" | COMPLIANT - Not found |
| "lazy/unmotivated" | COMPLIANT - Not found |
| "excuse" | COMPLIANT - Not found |

### Disclaimer Placement Verification (Section 1.3)

| Location | Required Version | Copy Exists | Status |
|----------|-----------------|-------------|--------|
| Onboarding | Full | `safety.disclaimers.full` | COMPLIANT |
| First workout | Short | `safety.disclaimers.short` | COMPLIANT |
| Injury logging (moderate+) | Short | `safety.disclaimers.short` | COMPLIANT |
| Document upload | Full + Specific | `safety.disclaimers.documentUpload` | COMPLIANT |
| AI recommendations | Minimal (inline) | `safety.disclaimers.minimal` | COMPLIANT |
| Settings > About | Full | `safety.disclaimers.full` | PARTIAL (L2) |

### Red-Flag Response Copy (Section 2)

| Category | Copy Exists | Status |
|----------|-------------|--------|
| Category 1 (Emergency) | `safety.escalation.emergency` | PARTIAL (H1 - missing mental health) |
| Category 2 (Professional) | `safety.escalation.professional` | COMPLIANT |
| Category 3 (Monitor) | None | MISSING (M3) |
| Pain during exercise | `safety.escalation.painResponse` | COMPLIANT |

---

## Tone Analysis

### Positive Patterns Found

1. **Warm & Supportive:**
   - "Your safety matters to us" (safety.ts:109)
   - "You know your body best" (safety.ts:110)
   - "Taking care of yourself" (common.ts:115)

2. **Direct & Clear:**
   - "Not medical advice. When in doubt, check with your doctor." (safety.ts:24)
   - "I can help you move well, but I'm not a doctor." (safety.ts:112)

3. **Empowering:**
   - "Ultimately, you know your body." (safety.ts:89)
   - "Listen to your body" (safety.ts:22)

4. **Non-alarmist Escalation:**
   - "This needs immediate attention" (not "WARNING" or "DANGER")
   - "Let's pause on that" (not "STOP IMMEDIATELY")

### Recommendations for Improvement

1. Consider adding more "you might try" language in workout.ts exercise suggestions
2. The phrase "Session couldn't be loaded" (common.ts:136) could be warmer: "Having trouble loading your session"

---

## Missing Strings Inventory

The following string categories are required by the compliance document but not present:

1. **Data Export Flow** (GDPR Article 15/20) - Required
2. **Data Deletion Flow** (GDPR Article 17) - Required
3. **Consent Withdrawal Copy** (GDPR) - Required
4. **Mental Health Crisis Resources** (Safety Category 1) - Required
5. **Category 3 Monitoring Messages** (Safety) - Recommended
6. **Structured About Page** (Disclosure) - Recommended

---

## Recommendations Summary

### Must Fix Before Launch
1. **H1:** Add mental health crisis resources to emergency escalation copy
2. **M4:** Add data privacy action copy (export/deletion) for GDPR compliance

### Should Fix Before Launch
3. **M1:** Rename `prescription` to `exerciseParameters` in workout.ts
4. **M2:** Revise "preventing issues" to compliant language
5. **M3:** Add Category 3 monitoring pattern copy

### Nice to Have
6. **L1-L4:** Address low-severity issues as part of general polish

---

## Conclusion

The copy package demonstrates strong awareness of the safety compliance requirements. The core disclaimers are properly implemented and match the approved text verbatim. The tone is consistently warm and supportive without being alarmist.

The primary concerns are:
1. Missing mental health crisis resources (safety-critical)
2. Missing GDPR-required data action copy (legally important)
3. Minor terminology issues that could be improved

With the high and medium issues addressed, this package will be fully compliant with the safety and regulatory requirements outlined in `/ops/05_safety_compliance.md`.

---

*Report generated by Copy & Safety QA Agent*
