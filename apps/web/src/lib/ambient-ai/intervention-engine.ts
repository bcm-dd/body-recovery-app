/**
 * Intervention Decision Engine
 *
 * The Reasoning Layer of the Ambient AI system.
 * Evaluates context and decides when and how to intervene.
 */

import type {
  FullAmbientContext,
  InterventionDecision,
  NonInterventionDecision,
  InterventionType,
  Urgency,
  Intrusiveness,
  Confidence,
  ConfidenceFactors,
  DistressSignal,
  DistressType,
  UserPreferences,
} from './types';

// ============================================
// INTERVENTION RULES
// ============================================

type RuleResult =
  | InterventionDecision
  | NonInterventionDecision
  | null;

type InterventionRule = (
  context: FullAmbientContext,
  lastPromptTime: Date | null,
  preferences: UserPreferences
) => RuleResult;

/**
 * Rule: Readiness-Based Session Adjustment
 * Before or at session start, if readiness is low, suggest lighter session
 */
const readinessAdjustmentRule: InterventionRule = (context, lastPromptTime, preferences) => {
  if (!preferences.enableAutomaticAdjustments) return null;

  const { body, session, temporal } = context;

  // Only trigger if no active session and user might start one
  if (session?.isActive) return null;

  // Low readiness threshold
  if (body.readinessScore < 50 && body.painTrend !== 'improving') {
    // Check if it's around their typical workout time
    const isTypicalTime = temporal.typicalSessionTime &&
      Math.abs(new Date().getHours() - temporal.typicalSessionTime.start) <= 2;

    if (isTypicalTime || temporal.daysSinceLastSession === 0) {
      return {
        shouldIntervene: true,
        confidence: calculateConfidence(context, 'readiness'),
        type: 'automatic_action',
        urgency: 'soon',
        intrusiveness: 'subtle',
        reason: 'Low readiness detected, adjusting session intensity',
        action: 'adjust_session_intensity_down',
        message: 'Your body is asking for something lighter today',
      };
    }
  }

  return null;
};

/**
 * Rule: Fatigue Detection Mid-Workout
 * During workout, if rest times are extending and difficulty increasing
 */
const fatigueDetectionRule: InterventionRule = (context, lastPromptTime, preferences) => {
  if (!preferences.enableProactiveSuggestions) return null;

  const { session } = context;

  if (!session?.isActive) return null;

  // Check for fatigue signals
  const recentRests = session.restTimeTaken.slice(-3);
  if (recentRests.length < 3) return null;

  const avgRecentRest = recentRests.reduce((a, b) => a + b, 0) / recentRests.length;
  const restRatio = avgRecentRest / session.prescribedRestTime;

  const recentDifficulty = session.difficultyRatings.slice(-3);
  const allHard = recentDifficulty.every((r) => r === 'hard');

  if (restRatio > 1.5 && allHard) {
    // Don't prompt too frequently
    if (lastPromptTime && Date.now() - lastPromptTime.getTime() < 5 * 60 * 1000) {
      return null;
    }

    return {
      shouldIntervene: true,
      confidence: 0.75,
      type: 'gentle_prompt',
      urgency: 'soon', // Wait for next rest period
      intrusiveness: 'noticeable',
      reason: 'Fatigue signals detected mid-workout',
      message: "You're working hard today. Want to adjust the remaining sets?",
      options: [
        { label: 'Adjust workout', action: 'reduce_remaining_sets' },
        { label: "I'm good", action: 'dismiss' },
      ],
    };
  }

  return null;
};

/**
 * Rule: Pain Pattern Warning
 * If recurring pain in same region over multiple days
 */
const painPatternRule: InterventionRule = (context, lastPromptTime, preferences) => {
  if (!preferences.enableInsightsAndPatterns) return null;

  const { body, temporal } = context;

  // Check for persistent pain
  const recentPain = body.readinessFactors.body.recentPain;
  if (recentPain.length < 3) return null;

  // Group by region
  const regionCounts = new Map<string, number>();
  const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

  recentPain
    .filter((p) => p.timestamp.getTime() > twoWeeksAgo && p.severity >= 4)
    .forEach((p) => {
      regionCounts.set(p.region, (regionCounts.get(p.region) || 0) + 1);
    });

  // Find regions with multiple occurrences
  for (const [region, count] of regionCounts) {
    if (count >= 3) {
      return {
        shouldIntervene: true,
        confidence: calculateConfidence(context, 'pain_pattern'),
        type: 'gentle_prompt',
        urgency: 'whenever',
        intrusiveness: 'noticeable',
        reason: `Recurring pain pattern in ${region}`,
        message: `I've noticed your ${region.toLowerCase()} has been bothering you. Worth a look?`,
        options: [
          { label: 'Show details', action: 'show_pain_history' },
          { label: 'Not now', action: 'dismiss' },
        ],
      };
    }
  }

  return null;
};

/**
 * Rule: Environmental Shift for State
 * Shift the environment based on readiness/time of day
 */
const environmentalShiftRule: InterventionRule = (context, _lastPromptTime, preferences) => {
  if (!preferences.enableEnvironmentalAdaptation) return null;

  const { body, temporal } = context;

  // Low readiness = recovery environment
  if (body.readinessScore < 40) {
    return {
      shouldIntervene: true,
      confidence: 0.9,
      type: 'environmental_shift',
      urgency: 'immediate',
      intrusiveness: 'invisible',
      reason: 'Setting recovery environment for low readiness',
      action: 'set_environment_recovery',
    };
  }

  // High readiness + typical workout time = energizing environment
  if (
    body.readinessScore >= 70 &&
    temporal.typicalSessionTime &&
    Math.abs(new Date().getHours() - temporal.typicalSessionTime.start) <= 1
  ) {
    return {
      shouldIntervene: true,
      confidence: 0.85,
      type: 'environmental_shift',
      urgency: 'immediate',
      intrusiveness: 'invisible',
      reason: 'Setting energizing environment for good readiness at workout time',
      action: 'set_environment_energizing',
    };
  }

  return null;
};

/**
 * Rule: Subtle Encouragement
 * When user is doing well, subtle positive feedback
 */
const subtleEncouragementRule: InterventionRule = (context, _lastPromptTime, preferences) => {
  if (preferences.presenceLevel < 0.3) return null;

  const { behavioral, temporal } = context;

  // Completed weekly goal
  if (
    behavioral.averageSessionsPerWeek >= 3 &&
    behavioral.peakMotivationDays.includes(temporal.dayOfWeek)
  ) {
    return {
      shouldIntervene: true,
      confidence: 0.7,
      type: 'subtle_cue',
      urgency: 'background',
      intrusiveness: 'invisible',
      reason: 'User is on track, subtle warmth',
      action: 'micro_warmth',
    };
  }

  return null;
};

/**
 * Rule: Anticipatory Workout Ready
 * Pre-load workout data when it's around their typical time
 */
const anticipatoryReadyRule: InterventionRule = (context, _lastPromptTime, preferences) => {
  if (!preferences.enableAutomaticAdjustments) return null;

  const { temporal, session, behavioral } = context;

  // If session already active, skip
  if (session?.isActive) return null;

  // Check if it's close to typical session time
  if (
    temporal.typicalSessionTime &&
    Math.abs(new Date().getHours() - temporal.typicalSessionTime.start) <= 0.5 &&
    temporal.daysSinceLastSession >= 1 &&
    behavioral.preferredDays.includes(temporal.dayOfWeek)
  ) {
    return {
      shouldIntervene: true,
      confidence: 0.8,
      type: 'automatic_action',
      urgency: 'background',
      intrusiveness: 'invisible',
      reason: 'Preloading workout data for anticipated session',
      action: 'preload_workout_data',
    };
  }

  return null;
};

/**
 * Rule: Welcome Back After Absence
 * Gentle welcome when returning after gap
 */
const welcomeBackRule: InterventionRule = (context, lastPromptTime, preferences) => {
  if (!preferences.enableProactiveSuggestions) return null;

  const { temporal } = context;

  // Skip if we recently prompted
  if (lastPromptTime && Date.now() - lastPromptTime.getTime() < 2 * 60 * 60 * 1000) {
    return null;
  }

  if (temporal.daysSinceLastSession >= 3 && temporal.daysSinceLastSession < 7) {
    return {
      shouldIntervene: true,
      confidence: 0.9,
      type: 'gentle_prompt',
      urgency: 'whenever',
      intrusiveness: 'subtle',
      reason: 'User returning after short break',
      message: "Welcome back. Let's start gentle and build from there.",
      options: [
        { label: 'Start gentle session', action: 'start_gentle_session' },
        { label: 'Just browsing', action: 'dismiss' },
      ],
    };
  }

  if (temporal.daysSinceLastSession >= 7) {
    return {
      shouldIntervene: true,
      confidence: 0.95,
      type: 'gentle_prompt',
      urgency: 'whenever',
      intrusiveness: 'noticeable',
      reason: 'User returning after long break',
      message: "Great to see you! Every return is a step forward. Let's ease back in.",
      options: [
        { label: 'Restart gently', action: 'start_gentle_session' },
        { label: 'View progress', action: 'show_progress' },
      ],
    };
  }

  return null;
};

// ============================================
// NON-INTERVENTION RULES
// ============================================

type NonInterventionRule = (
  context: FullAmbientContext,
  lastPromptTime: Date | null
) => NonInterventionDecision | null;

/**
 * Don't nag - too soon since last prompt
 */
const dontNagRule: NonInterventionRule = (context, lastPromptTime) => {
  if (lastPromptTime && Date.now() - lastPromptTime.getTime() < 4 * 60 * 60 * 1000) {
    return {
      shouldIntervene: false,
      reason: 'too_soon_since_last_prompt',
    };
  }
  return null;
};

/**
 * Don't interrupt flow - user is focused during workout
 */
const dontInterruptFlowRule: NonInterventionRule = (context, _lastPromptTime) => {
  const { session } = context;

  if (session?.isActive && session.apparentEngagement === 'focused') {
    return {
      shouldIntervene: false,
      reason: 'user_in_flow',
    };
  }
  return null;
};

/**
 * Don't pile on after pain logged
 */
const giveSpaceAfterPainRule: NonInterventionRule = (context, _lastPromptTime) => {
  const { body, behavioral } = context;

  if (
    behavioral.lastSession?.painLogged &&
    behavioral.lastSession.date.getTime() > Date.now() - 2 * 60 * 60 * 1000
  ) {
    return {
      shouldIntervene: false,
      reason: 'give_space_after_pain',
    };
  }
  return null;
};

/**
 * Don't be needy - respect user absence
 */
const respectAbsenceRule: NonInterventionRule = (context, _lastPromptTime) => {
  const { temporal } = context;

  // If they've been away 3+ days and just opened the app, give them space
  // (They'll get the welcome back prompt separately)
  return null;
};

// ============================================
// CONFIDENCE CALCULATION
// ============================================

function calculateConfidence(
  context: FullAmbientContext,
  insightType: string
): number {
  const factors: ConfidenceFactors = {
    dataQuality: calculateDataQuality(context),
    patternStrength: calculatePatternStrength(context, insightType),
    recentChange: hasRecentChange(context),
    userFeedback: 0.5, // Would come from learning system
  };

  // Weighted average
  let confidence =
    factors.dataQuality * 0.3 +
    factors.patternStrength * 0.4 +
    (factors.recentChange ? -0.1 : 0.1) +
    factors.userFeedback * 0.2;

  return Math.min(1, Math.max(0, confidence));
}

function calculateDataQuality(context: FullAmbientContext): number {
  let score = 0;

  // Has recent session data
  if (context.behavioral.lastSession) score += 0.3;

  // Has body data
  if (context.body.bodyModelLastUpdated) {
    const daysSinceUpdate = Math.floor(
      (Date.now() - context.body.bodyModelLastUpdated.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (daysSinceUpdate < 1) score += 0.3;
    else if (daysSinceUpdate < 3) score += 0.2;
    else if (daysSinceUpdate < 7) score += 0.1;
  }

  // Has health data
  if (context.body.readinessFactors.sleep.lastNight) score += 0.2;

  // Has enough history
  if (context.behavioral.averageSessionsPerWeek > 0) score += 0.2;

  return Math.min(1, score);
}

function calculatePatternStrength(
  context: FullAmbientContext,
  insightType: string
): number {
  switch (insightType) {
    case 'readiness':
      // Higher confidence if readiness is clearly low or high
      const readiness = context.body.readinessScore;
      if (readiness < 30 || readiness > 80) return 0.9;
      if (readiness < 40 || readiness > 70) return 0.7;
      return 0.5;

    case 'pain_pattern':
      // Higher confidence if pain is consistent
      const painCount = context.body.readinessFactors.body.recentPain.length;
      if (painCount >= 5) return 0.9;
      if (painCount >= 3) return 0.7;
      return 0.4;

    default:
      return 0.5;
  }
}

function hasRecentChange(context: FullAmbientContext): boolean {
  // Check if there's been a significant change recently
  // This would reduce confidence as patterns might not hold

  // Large change in pain
  if (Math.abs(context.body.averagePainLevel - 5) > 3) return true;

  // Long gap since last session
  if (context.temporal.daysSinceLastSession > 5) return true;

  return false;
}

// ============================================
// DISTRESS DETECTION
// ============================================

export function detectDistress(
  context: FullAmbientContext
): DistressSignal | null {
  const { session } = context;

  if (!session?.isActive) return null;

  // Long pause after starting set
  if (session.timeSinceLastAction > 60) {
    return { type: 'stuck', confidence: 0.6 };
  }

  // Repeated video views
  if (session.videoViewsThisExercise > 2) {
    return { type: 'uncertain_form', confidence: 0.8 };
  }

  // Pattern of skipping
  if (session.skipsThisSession > 2) {
    return { type: 'not_working', confidence: 0.7 };
  }

  // Struggling signals
  if (
    session.apparentEngagement === 'struggling' &&
    session.apparentFatigue === 'fatigued'
  ) {
    return { type: 'overwhelmed', confidence: 0.65 };
  }

  return null;
}

export function getDistressResponse(
  signal: DistressSignal
): InterventionDecision {
  switch (signal.type) {
    case 'stuck':
      return {
        shouldIntervene: true,
        confidence: signal.confidence,
        type: 'subtle_cue',
        urgency: 'soon',
        intrusiveness: 'subtle',
        reason: 'User appears stuck',
        action: 'soften_environment',
        message: 'take your time',
      };

    case 'uncertain_form':
      return {
        shouldIntervene: true,
        confidence: signal.confidence,
        type: 'gentle_prompt',
        urgency: 'soon',
        intrusiveness: 'noticeable',
        reason: 'User uncertain about form',
        message:
          'Want to try a different exercise? Same muscles, different movement.',
        options: [
          { label: 'Show alternatives', action: 'show_alternatives' },
          { label: "I've got it", action: 'dismiss' },
        ],
      };

    case 'possible_pain':
      return {
        shouldIntervene: true,
        confidence: signal.confidence,
        type: 'gentle_prompt',
        urgency: 'soon',
        intrusiveness: 'subtle',
        reason: 'Possible pain detected',
        message: 'Everything okay?',
        options: [
          { label: 'Something hurts', action: 'log_pain' },
          { label: 'Just resting', action: 'dismiss' },
          { label: "I'm done for today", action: 'end_session' },
        ],
      };

    case 'not_working':
      return {
        shouldIntervene: true,
        confidence: signal.confidence,
        type: 'gentle_prompt',
        urgency: 'whenever',
        intrusiveness: 'noticeable',
        reason: 'Session not working',
        message: "This session isn't clicking today. That's okay.",
        options: [
          { label: 'Try something different', action: 'modify_session' },
          { label: 'Call it here', action: 'end_session' },
        ],
      };

    case 'overwhelmed':
      return {
        shouldIntervene: true,
        confidence: signal.confidence,
        type: 'environmental_shift',
        urgency: 'immediate',
        intrusiveness: 'subtle',
        reason: 'User appears overwhelmed',
        action: 'soften_and_simplify',
        message: 'breathe',
      };

    default:
      return {
        shouldIntervene: false,
        confidence: 0,
        type: 'subtle_cue',
        urgency: 'background',
        intrusiveness: 'invisible',
        reason: 'Unknown distress type',
      };
  }
}

// ============================================
// MAIN ENGINE
// ============================================

const interventionRules: InterventionRule[] = [
  environmentalShiftRule,
  readinessAdjustmentRule,
  fatigueDetectionRule,
  painPatternRule,
  subtleEncouragementRule,
  anticipatoryReadyRule,
  welcomeBackRule,
];

const nonInterventionRules: NonInterventionRule[] = [
  dontNagRule,
  dontInterruptFlowRule,
  giveSpaceAfterPainRule,
  respectAbsenceRule,
];

export function evaluateIntervention(
  context: FullAmbientContext,
  lastPromptTime: Date | null,
  preferences: UserPreferences
): InterventionDecision | NonInterventionDecision {
  // First check non-intervention rules (blockers)
  for (const rule of nonInterventionRules) {
    const result = rule(context, lastPromptTime);
    if (result) return result;
  }

  // Check for distress signals (high priority)
  const distress = detectDistress(context);
  if (distress && distress.confidence > 0.5) {
    return getDistressResponse(distress);
  }

  // Evaluate intervention rules
  const candidates: InterventionDecision[] = [];

  for (const rule of interventionRules) {
    const result = rule(context, lastPromptTime, preferences);
    if (result && result.shouldIntervene) {
      candidates.push(result as InterventionDecision);
    }
  }

  // Return highest confidence intervention, or non-intervention
  if (candidates.length === 0) {
    return {
      shouldIntervene: false,
      reason: 'no_intervention_needed',
    };
  }

  // Sort by confidence, then urgency
  const urgencyOrder: Record<Urgency, number> = {
    immediate: 0,
    soon: 1,
    whenever: 2,
    background: 3,
  };

  candidates.sort((a, b) => {
    if (a.confidence !== b.confidence) return b.confidence - a.confidence;
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });

  // Apply confidence threshold based on preferences
  const threshold = 0.3 + (1 - preferences.presenceLevel) * 0.4;
  const best = candidates[0];

  if (best.confidence < threshold) {
    return {
      shouldIntervene: false,
      reason: 'confidence_below_threshold',
    };
  }

  return best;
}

// ============================================
// DEFAULT PREFERENCES
// ============================================

export const defaultUserPreferences: UserPreferences = {
  enableEnvironmentalAdaptation: true,
  enableProactiveSuggestions: true,
  enableAutomaticAdjustments: true,
  enableInsightsAndPatterns: true,
  presenceLevel: 0.7, // Default to moderately active
  interventionThresholds: new Map(),
};
