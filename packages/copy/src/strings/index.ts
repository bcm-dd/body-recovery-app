/**
 * Strings exports
 */

export * from './common';
export * from './onboarding';
export * from './workout';
export * from './safety';

// Combined strings type
import type { CommonStrings } from './common';
import type { OnboardingStrings } from './onboarding';
import type { WorkoutStrings } from './workout';
import type { SafetyStrings } from './safety';

export interface AllStrings {
  common: CommonStrings;
  onboarding: OnboardingStrings;
  workout: WorkoutStrings;
  safety: SafetyStrings;
}
