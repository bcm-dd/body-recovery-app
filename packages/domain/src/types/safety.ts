/**
 * Safety Types
 * Defines safety checks, red flags, and escalation actions
 */

import type { BodyRegionStatus } from './body';
import type { ExerciseFeedback } from './plan';
import type { CheckIn } from './health';

/**
 * Safety action levels - what to do when a safety issue is detected
 */
export type SafetyAction =
  | 'continue'              // All clear
  | 'warn'                  // Show warning, allow continue
  | 'require_acknowledgment' // Must acknowledge before continuing
  | 'block_activity'        // Cannot continue this activity
  | 'recommend_rest'        // Suggest rest instead
  | 'seek_medical'          // Recommend professional attention
  | 'emergency';            // Potential emergency

/**
 * Severity levels for safety triggers
 */
export type SafetySeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Input for safety checking
 */
export interface SafetyCheckInput {
  checkInData?: CheckIn;
  bodyStatus?: BodyRegionStatus[];
  userMessage?: string;
  exerciseFeedback?: ExerciseFeedback;
  vitalSigns?: {
    heartRate?: number;
    bloodPressure?: { systolic: number; diastolic: number };
  };
}

/**
 * A detected safety trigger
 */
export interface SafetyTrigger {
  id: string;
  severity: SafetySeverity;
  action: SafetyAction;
  message: string;
  neverSuggest?: string[];
}

/**
 * Result of a safety check
 */
export interface SafetyCheckResult {
  safe: boolean;
  triggers: SafetyTrigger[];
  action: SafetyAction;
  userMessage: string;
}

/**
 * Red flag definition
 */
export interface RedFlag {
  id: string;
  keywords?: string[];
  condition: (input: SafetyCheckInput) => boolean;
  severity: SafetySeverity;
  action: SafetyAction;
  message: string;
  neverSuggest: string[];
}

/**
 * Escalation action for UI
 */
export interface EscalationAction {
  label: string;
  action: 'dismiss' | 'acknowledge' | 'stop_workout' | 'call_emergency' | 'open_url';
  url?: string;
  phone?: string;
}

/**
 * UI requirements for safety escalation
 */
export interface EscalationUI {
  // Display
  modalType: 'info' | 'warning' | 'danger' | 'emergency';
  title: string;
  message: string;
  icon: string;

  // Actions
  primaryAction: EscalationAction;
  secondaryAction?: EscalationAction;

  // Requirements
  requiresAcknowledgment: boolean;
  acknowledgmentText?: string;
  canBeDismissed: boolean;
  blocksActivity: boolean;

  // Resources
  helpfulResources?: {
    title: string;
    url?: string;
    phone?: string;
  }[];
}

/**
 * Category of red flags for classification
 */
export type RedFlagCategory =
  | 'neurological'
  | 'cardiac'
  | 'musculoskeletal'
  | 'systemic'
  | 'mental_health';

/**
 * Extended red flag with category
 */
export interface CategorizedRedFlag extends RedFlag {
  category: RedFlagCategory;
}
