/**
 * Safety Engine
 * Red-flag detection and safety escalation
 */

import type {
  SafetyCheckInput,
  SafetyCheckResult,
  SafetyTrigger,
  SafetyAction,
  SafetySeverity,
  RedFlag,
  EscalationUI,
  EscalationAction,
} from '../types/safety';
import type { BodyRegionStatus } from '../types/body';

/**
 * Keyword lists for detection
 */
const NUMBNESS_KEYWORDS = [
  'numb', 'numbness', "can't feel", 'no feeling', 'dead', 'lost sensation',
];

const TINGLING_KEYWORDS = [
  'tingling', 'pins and needles', 'prickling', 'electric', 'shooting down',
  'radiating', 'traveling pain',
];

const CHEST_PAIN_KEYWORDS = [
  'chest pain', 'chest hurts', 'chest pressure', 'tight chest',
  'pain in chest', 'heart hurts', 'heart pain',
];

const BREATHING_KEYWORDS = [
  "can't breathe", 'hard to breathe', 'breathing problem', 'short of breath',
  'gasping', "can't catch breath", 'breathing difficulty',
];

const DIZZINESS_KEYWORDS = [
  'dizzy', 'lightheaded', 'faint', 'fainting', 'blacking out', 'seeing stars',
  'room spinning', 'vertigo', 'about to pass out',
];

const SEVERE_PAIN_KEYWORDS = [
  'extreme pain', 'worst pain', 'excruciating', 'unbearable', 'agonizing',
  'something snapped', 'heard a pop', 'felt a tear', 'sudden sharp pain',
];

const LOCKING_KEYWORDS = [
  'locked', 'locking', 'catching', 'stuck', "won't move", 'frozen',
];

const INSTABILITY_KEYWORDS = [
  'gave way', 'giving out', 'buckled', 'unstable', 'wobbly', "doesn't feel stable",
  'slipping', 'shifting',
];

const SWELLING_KEYWORDS = [
  'swollen', 'swelling', 'puffed up', 'inflamed', 'balloon',
];

const OVEREXERTION_KEYWORDS = [
  'have to exercise', 'must work out', "can't skip", 'feel guilty',
  'punishment', 'make up for', 'burn off',
];

/**
 * Check if text contains any keywords from a list
 */
function containsKeywords(text: string | undefined, keywords: string[]): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Red flag definitions
 */
const RED_FLAGS: RedFlag[] = [
  // Category 1: Emergency - Critical severity
  {
    id: 'chest_pain',
    keywords: CHEST_PAIN_KEYWORDS,
    condition: (input) =>
      (input.bodyStatus?.some(s =>
        s.region === 'chest' &&
        ['pain_sharp', 'pain_dull'].includes(s.sensation)
      )) ||
      containsKeywords(input.userMessage, CHEST_PAIN_KEYWORDS),
    severity: 'critical',
    action: 'emergency',
    message: 'Chest pain during or after exercise requires immediate medical attention. Stop all activity. If severe, call emergency services.',
    neverSuggest: ['Rest and try again', 'Lighter weight'],
  },
  {
    id: 'breathing_difficulty',
    keywords: BREATHING_KEYWORDS,
    condition: (input) =>
      containsKeywords(input.userMessage, BREATHING_KEYWORDS),
    severity: 'critical',
    action: 'emergency',
    message: 'Difficulty breathing that persists after rest requires immediate medical attention.',
    neverSuggest: ['Keep going', 'Push through'],
  },

  // Category 2: Seek Medical - High severity
  {
    id: 'numbness',
    keywords: NUMBNESS_KEYWORDS,
    condition: (input) =>
      input.bodyStatus?.some(s => s.sensation === 'numbness') ||
      containsKeywords(input.userMessage, NUMBNESS_KEYWORDS),
    severity: 'high',
    action: 'seek_medical',
    message: 'Numbness can indicate nerve involvement. Please consult a healthcare provider before continuing exercise.',
    neverSuggest: ['Continue exercising', 'Push through it'],
  },
  {
    id: 'tingling_radiating',
    keywords: TINGLING_KEYWORDS,
    condition: (input) =>
      input.bodyStatus?.some(s => s.sensation === 'tingling') ||
      containsKeywords(input.userMessage, TINGLING_KEYWORDS),
    severity: 'high',
    action: 'seek_medical',
    message: 'Tingling or pins and needles can indicate nerve involvement. Rest and consult a healthcare provider.',
    neverSuggest: ['Stretch it out', 'Work through it'],
  },
  {
    id: 'dizziness_fainting',
    keywords: DIZZINESS_KEYWORDS,
    condition: (input) =>
      containsKeywords(input.userMessage, DIZZINESS_KEYWORDS),
    severity: 'high',
    action: 'seek_medical',
    message: 'Dizziness or feeling faint during exercise could indicate a serious issue. Stop activity, sit or lie down, and consult a healthcare provider.',
    neverSuggest: ['Continue carefully', 'Take a short break then resume'],
  },
  {
    id: 'severe_sudden_pain',
    keywords: SEVERE_PAIN_KEYWORDS,
    condition: (input) =>
      input.bodyStatus?.some(s =>
        s.level >= 8 &&
        s.sensation === 'pain_sharp'
      ) ||
      containsKeywords(input.userMessage, SEVERE_PAIN_KEYWORDS),
    severity: 'high',
    action: 'block_activity',
    message: 'Severe sudden pain could indicate a significant injury. Stop the exercise immediately. Rest, ice if appropriate, and seek medical evaluation.',
    neverSuggest: ['Reduce weight and continue', 'Try a different exercise'],
  },

  // Medium severity
  {
    id: 'joint_locking',
    keywords: LOCKING_KEYWORDS,
    condition: (input) =>
      containsKeywords(input.userMessage, LOCKING_KEYWORDS),
    severity: 'medium',
    action: 'require_acknowledgment',
    message: 'Joint locking or catching may indicate internal joint issues. Avoid loading this joint and consult a healthcare provider.',
    neverSuggest: ['Work through it', 'Stretch it out'],
  },
  {
    id: 'giving_way',
    keywords: INSTABILITY_KEYWORDS,
    condition: (input) =>
      input.bodyStatus?.some(s => s.sensation === 'instability') ||
      containsKeywords(input.userMessage, INSTABILITY_KEYWORDS),
    severity: 'medium',
    action: 'block_activity',
    message: 'Joint instability or giving way could indicate ligament damage. Avoid loading this joint and consult a healthcare provider.',
    neverSuggest: ['Strengthen around it', 'Use lighter weight'],
  },
  {
    id: 'significant_swelling',
    keywords: SWELLING_KEYWORDS,
    condition: (input) =>
      input.bodyStatus?.some(s => s.sensation === 'swelling' && s.level >= 6) ||
      containsKeywords(input.userMessage, SWELLING_KEYWORDS),
    severity: 'medium',
    action: 'require_acknowledgment',
    message: 'Significant swelling indicates inflammation or injury. Rest, ice, elevate the area, and consider medical evaluation if it persists.',
    neverSuggest: ['Exercise to reduce swelling', 'Work through it'],
  },

  // Low severity - warnings
  {
    id: 'overexertion_pressure',
    keywords: OVEREXERTION_KEYWORDS,
    condition: (input) =>
      containsKeywords(input.userMessage, OVEREXERTION_KEYWORDS),
    severity: 'low',
    action: 'warn',
    message: "Rest is a crucial part of progress. It's OK to take a break. Your health matters more than any workout.",
    neverSuggest: ['Push harder', 'No pain no gain'],
  },
];

/**
 * Check all red flags against input
 */
function checkRedFlags(input: SafetyCheckInput): SafetyTrigger[] {
  const triggers: SafetyTrigger[] = [];

  for (const flag of RED_FLAGS) {
    if (flag.condition(input)) {
      triggers.push({
        id: flag.id,
        severity: flag.severity,
        action: flag.action,
        message: flag.message,
        neverSuggest: flag.neverSuggest,
      });
    }
  }

  return triggers;
}

/**
 * Determine the highest priority action from triggers
 */
function determineAction(triggers: SafetyTrigger[]): SafetyAction {
  const criticalTriggers = triggers.filter(t => t.severity === 'critical');
  if (criticalTriggers.length > 0) {
    return 'emergency';
  }

  const highTriggers = triggers.filter(t => t.severity === 'high');
  const firstHigh = highTriggers[0];
  if (firstHigh) {
    return firstHigh.action;
  }

  const mediumTriggers = triggers.filter(t => t.severity === 'medium');
  const firstMedium = mediumTriggers[0];
  if (firstMedium) {
    return firstMedium.action;
  }

  const lowTriggers = triggers.filter(t => t.severity === 'low');
  if (lowTriggers.length > 0) {
    return 'warn';
  }

  return 'continue';
}

/**
 * Generate user-facing message from triggers
 */
function generateUserMessage(triggers: SafetyTrigger[]): string {
  if (triggers.length === 0) {
    return '';
  }

  // Return the most severe trigger's message
  const sortedTriggers = [...triggers].sort((a, b) => {
    const severityOrder: SafetySeverity[] = ['critical', 'high', 'medium', 'low'];
    return severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity);
  });

  const mostSevere = sortedTriggers[0];
  return mostSevere ? mostSevere.message : '';
}

/**
 * Generate escalation UI for a trigger
 */
function getEscalationUIForTrigger(trigger: SafetyTrigger): EscalationUI {
  switch (trigger.action) {
    case 'emergency':
      return {
        modalType: 'emergency',
        title: 'Stop Activity Immediately',
        message: trigger.message,
        icon: 'alert-octagon',
        primaryAction: {
          label: 'Call Emergency Services',
          action: 'call_emergency',
          phone: '911',
        },
        secondaryAction: {
          label: 'I Understand',
          action: 'acknowledge',
        },
        requiresAcknowledgment: true,
        acknowledgmentText: 'I understand this may be serious and will seek appropriate help',
        canBeDismissed: false,
        blocksActivity: true,
        helpfulResources: [
          { title: 'Emergency Services', phone: '911' },
        ],
      };

    case 'seek_medical':
      return {
        modalType: 'danger',
        title: 'Medical Attention Recommended',
        message: trigger.message,
        icon: 'alert-triangle',
        primaryAction: {
          label: 'Stop Workout',
          action: 'stop_workout',
        },
        secondaryAction: {
          label: "I'll Seek Medical Advice",
          action: 'acknowledge',
        },
        requiresAcknowledgment: true,
        acknowledgmentText: 'I understand and will consult a healthcare provider',
        canBeDismissed: false,
        blocksActivity: true,
      };

    case 'block_activity':
      return {
        modalType: 'warning',
        title: 'Activity Stopped',
        message: trigger.message,
        icon: 'pause-circle',
        primaryAction: {
          label: 'OK',
          action: 'acknowledge',
        },
        requiresAcknowledgment: true,
        canBeDismissed: false,
        blocksActivity: true,
      };

    case 'require_acknowledgment':
      return {
        modalType: 'warning',
        title: 'Please Note',
        message: trigger.message,
        icon: 'alert-circle',
        primaryAction: {
          label: 'I Understand',
          action: 'acknowledge',
        },
        secondaryAction: {
          label: 'Stop Workout',
          action: 'stop_workout',
        },
        requiresAcknowledgment: true,
        canBeDismissed: false,
        blocksActivity: false,
      };

    case 'warn':
      return {
        modalType: 'info',
        title: 'A Note',
        message: trigger.message,
        icon: 'info',
        primaryAction: {
          label: 'OK',
          action: 'dismiss',
        },
        requiresAcknowledgment: false,
        canBeDismissed: true,
        blocksActivity: false,
      };

    default:
      return {
        modalType: 'info',
        title: 'Notice',
        message: trigger.message,
        icon: 'info',
        primaryAction: {
          label: 'OK',
          action: 'dismiss',
        },
        requiresAcknowledgment: false,
        canBeDismissed: true,
        blocksActivity: false,
      };
  }
}

/**
 * Detect red flag keywords in text
 */
function detectRedFlagsInText(text: string): RedFlag[] {
  const detected: RedFlag[] = [];

  for (const flag of RED_FLAGS) {
    if (flag.keywords && containsKeywords(text, flag.keywords)) {
      detected.push(flag);
    }
  }

  return detected;
}

/**
 * Safety Engine interface
 */
export interface ISafetyEngine {
  checkInput(input: SafetyCheckInput): SafetyCheckResult;
  detectRedFlags(text: string): RedFlag[];
  getEscalationUI(trigger: SafetyTrigger): EscalationUI;
}

/**
 * Safety Engine implementation
 */
export class SafetyEngine implements ISafetyEngine {
  /**
   * Check input for safety concerns
   */
  checkInput(input: SafetyCheckInput): SafetyCheckResult {
    const triggers = checkRedFlags(input);

    // No triggers - all clear
    if (triggers.length === 0) {
      return {
        safe: true,
        triggers: [],
        action: 'continue',
        userMessage: '',
      };
    }

    const action = determineAction(triggers);
    const userMessage = generateUserMessage(triggers);

    return {
      safe: false,
      triggers,
      action,
      userMessage,
    };
  }

  /**
   * Detect red flags in text
   */
  detectRedFlags(text: string): RedFlag[] {
    return detectRedFlagsInText(text);
  }

  /**
   * Get escalation UI for a trigger
   */
  getEscalationUI(trigger: SafetyTrigger): EscalationUI {
    return getEscalationUIForTrigger(trigger);
  }
}

/**
 * Default safety engine instance
 */
export const safetyEngine = new SafetyEngine();

/**
 * Export red flags for testing and external use
 */
export const redFlags = RED_FLAGS;

/**
 * Export keyword lists for testing
 */
export const safetyKeywords = {
  NUMBNESS_KEYWORDS,
  TINGLING_KEYWORDS,
  CHEST_PAIN_KEYWORDS,
  BREATHING_KEYWORDS,
  DIZZINESS_KEYWORDS,
  SEVERE_PAIN_KEYWORDS,
  LOCKING_KEYWORDS,
  INSTABILITY_KEYWORDS,
  SWELLING_KEYWORDS,
  OVEREXERTION_KEYWORDS,
};
