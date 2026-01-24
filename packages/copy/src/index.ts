/**
 * @app/copy - Centralized Strings Package
 *
 * This package provides all user-facing strings for the
 * Movement & Recovery Companion app.
 *
 * All strings follow the safety and compliance guidelines from
 * /ops/05_safety_compliance.md, avoiding prohibited medical
 * terminology and using approved wellness-focused language.
 *
 * @example
 * ```tsx
 * import { common, onboarding, workout, safety } from '@app/copy';
 * import { interpolate } from '@app/copy';
 *
 * // Simple usage
 * const title = common.appName;
 *
 * // With interpolation
 * const duration = interpolate(workout.session.duration, { duration: 20 });
 * // Result: "20 min"
 * ```
 */

// Export all strings
export * from './strings';

// Export types and utilities
export * from './types';

// Re-export individual string modules for convenience
export { common } from './strings/common';
export { onboarding } from './strings/onboarding';
export { workout } from './strings/workout';
export { safety } from './strings/safety';
