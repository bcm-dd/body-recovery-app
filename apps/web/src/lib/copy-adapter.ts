/**
 * Copy Package Adapter for i18n
 *
 * This adapter bridges the @app/copy package with the i18n system,
 * allowing the centralized strings to be translated while maintaining
 * backward compatibility.
 *
 * The adapter:
 * 1. Takes the original copy strings as the source of truth
 * 2. Overlays translations from the i18n messages when available
 * 3. Falls back to the original English strings when translations are missing
 * 4. Preserves type safety and interpolation support
 */

import { common, safety, onboarding, workout , interpolate as copyInterpolate } from '@app/copy';

import type { Locale } from './i18n';

// ============================================================================
// Types
// ============================================================================

export interface TranslatedCopy {
  common: typeof common;
  safety: typeof safety;
  onboarding: typeof onboarding;
  workout: typeof workout;
}

export interface CopyMessages {
  copy?: {
    common?: Partial<typeof common>;
    safety?: Partial<typeof safety>;
    onboarding?: Partial<typeof onboarding>;
    workout?: Partial<typeof workout>;
  };
}

// ============================================================================
// Deep Merge Utility
// ============================================================================

function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown> | undefined
): T {
  if (!source) return target;

  const result = { ...target };

  for (const key of Object.keys(source)) {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key as keyof T] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      ) as T[keyof T];
    } else if (sourceValue !== undefined) {
      result[key as keyof T] = sourceValue as T[keyof T];
    }
  }

  return result;
}

// ============================================================================
// Adapter Functions
// ============================================================================

/**
 * Create a translated copy object by merging i18n messages over the base copy
 */
export function createTranslatedCopy(
  messages?: CopyMessages,
  _locale?: Locale
): TranslatedCopy {
  const copyMessages = messages?.copy;

  return {
    common: deepMerge(common, copyMessages?.common),
    safety: deepMerge(safety, copyMessages?.safety),
    onboarding: deepMerge(onboarding, copyMessages?.onboarding),
    workout: deepMerge(workout, copyMessages?.workout),
  };
}

/**
 * Get the base copy (English) without any translations
 */
export function getBaseCopy(): TranslatedCopy {
  return {
    common,
    safety,
    onboarding,
    workout,
  };
}

// ============================================================================
// Interpolation Helper
// ============================================================================

/**
 * Re-export the interpolate function from copy package
 * for convenience when using translated strings
 */
export { copyInterpolate as interpolate };

// ============================================================================
// Safety Strings Access
// ============================================================================

/**
 * Get safety disclaimer by level
 * These strings are critical and should always be available
 */
export function getSafetyDisclaimer(
  level: 'full' | 'short' | 'minimal' | 'documentUpload',
  translatedCopy?: TranslatedCopy
): string {
  const copy = translatedCopy || getBaseCopy();
  return copy.safety.disclaimers[level];
}

/**
 * Get emergency escalation message
 */
export function getEmergencyMessage(
  translatedCopy?: TranslatedCopy
): {
  title: string;
  message: string;
  appLimitation: string;
} {
  const copy = translatedCopy || getBaseCopy();
  return {
    title: copy.safety.escalation.emergency.title,
    message: copy.safety.escalation.emergency.message,
    appLimitation: copy.safety.escalation.emergency.appLimitation,
  };
}

/**
 * Get professional consultation message with body part interpolation
 */
export function getProfessionalMessage(
  bodyPart: string,
  symptom: string,
  translatedCopy?: TranslatedCopy
): {
  inline: string;
  pauseNotice: string;
} {
  const copy = translatedCopy || getBaseCopy();
  return {
    inline: copyInterpolate(copy.safety.escalation.professional.inline, { symptom }),
    pauseNotice: copyInterpolate(copy.safety.escalation.professional.pauseNotice, { bodyPart }),
  };
}

// ============================================================================
// Common Strings Access
// ============================================================================

/**
 * Get action button text
 */
export function getActionText(
  action: keyof typeof common.actions,
  translatedCopy?: TranslatedCopy
): string {
  const copy = translatedCopy || getBaseCopy();
  return copy.common.actions[action];
}

/**
 * Get status message
 */
export function getStatusText(
  status: keyof typeof common.status,
  translatedCopy?: TranslatedCopy
): string {
  const copy = translatedCopy || getBaseCopy();
  return copy.common.status[status];
}

/**
 * Get pain level description
 */
export function getPainLevelText(
  level: keyof typeof common.painLevels,
  translatedCopy?: TranslatedCopy
): string {
  const copy = translatedCopy || getBaseCopy();
  return copy.common.painLevels[level];
}

// ============================================================================
// Hook for React Components
// ============================================================================

/**
 * Custom hook to use translated copy in React components
 *
 * @example
 * ```tsx
 * import { useCopy } from '@/lib/copy-adapter';
 *
 * function Component() {
 *   const copy = useCopy();
 *   return <button>{copy.common.actions.save}</button>;
 * }
 * ```
 */
export function useCopyStrings(messages?: CopyMessages, locale?: Locale): TranslatedCopy {
  // In a real implementation, this would use React context
  // For now, we just create the translated copy
  return createTranslatedCopy(messages, locale);
}

// Types are exported at the top via the interface declarations
