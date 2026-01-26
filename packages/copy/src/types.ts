/**
 * Type definitions for the copy package
 */

/**
 * String interpolation helper types
 */
export type StringWithParams<T extends string> = T extends `${infer _Start}{${infer Param}}${infer Rest}`
  ? Param | StringWithParams<Rest>
  : never;

/**
 * Extract parameters from a string template
 */
export type ExtractParams<T extends string> = StringWithParams<T> extends never
  ? Record<string, never>
  : Record<StringWithParams<T>, string | number>;

/**
 * Function to interpolate string templates
 */
export function interpolate<T extends string>(
  template: T,
  params: ExtractParams<T>
): string {
  return template.replace(/{(\w+)}/g, (_, key) => {
    const value = (params as Record<string, string | number>)[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
}

/**
 * Pain level type
 */
export type PainLevel = 'none' | 'mild' | 'moderate' | 'severe';

/**
 * Readiness level type
 */
export type ReadinessLevel = 'good' | 'moderate' | 'rest';

/**
 * Focus area type
 */
export type FocusArea = 'recovery' | 'chronic' | 'prevention';

/**
 * Experience level type
 */
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * User focus selection
 */
export interface FocusOption {
  id: FocusArea;
  title: string;
  description: string;
}

/**
 * Experience level option
 */
export interface ExperienceLevelOption {
  id: ExperienceLevel;
  title: string;
  description: string;
}

/**
 * Voice command definition
 */
export interface VoiceCommand {
  command: string;
  description: string;
}

/**
 * End workout reason
 */
export interface EndWorkoutReason {
  id: string;
  label: string;
}

/**
 * Health data consent item
 */
export interface HealthDataConsentItem {
  type: string;
  description: string;
}

/**
 * Emergency contact info
 */
export interface EmergencyContact {
  region: string;
  number: string;
}

/**
 * Disclaimer level
 */
export type DisclaimerLevel = 'full' | 'short' | 'minimal' | 'documentUpload';

/**
 * Escalation category
 */
export type EscalationCategory = 'emergency' | 'professional' | 'monitor' | 'clear';

/**
 * Red flag detection result
 */
export interface RedFlagResult {
  category: EscalationCategory;
  triggers: string[];
  message: string;
  blockContinuation: boolean;
}
