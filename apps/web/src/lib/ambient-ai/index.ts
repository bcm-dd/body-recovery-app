/**
 * Ambient AI Module
 *
 * A sophisticated, context-aware AI system that permeates the app experience.
 * The AI isn't a feature you use - it's the intelligence that shapes the environment.
 *
 * ## The Three Layers
 *
 * ### Layer 1: Sensing
 * Always running. Collecting context. Building understanding.
 * - Temporal context (time, patterns, streaks)
 * - Body context (readiness, pain, constraints)
 * - Behavioral context (preferences, tendencies)
 * - Session context (real-time workout state)
 * - Environment context (device, connectivity)
 *
 * ### Layer 2: Reasoning
 * Processing context. Identifying moments. Deciding when to act.
 * - Intervention decision engine
 * - Confidence calibration
 * - Non-intervention rules
 * - Distress detection
 *
 * ### Layer 3: Expression
 * How the AI manifests. Not just words - environment, timing, tone.
 * - Environmental shifts (color, brightness, animation)
 * - Micro-cues (subtle visual/haptic hints)
 * - Ambient text (single words in the atmosphere)
 * - Gentle prompts (soft, dismissible suggestions)
 *
 * ## Design Philosophy
 *
 * When ambient AI is working well, the user doesn't think about AI at all.
 * They just feel:
 * - "This app gets me"
 * - "It always seems to know what I need"
 * - "It never annoys me"
 * - "It noticed something I hadn't"
 * - "It feels... aware"
 *
 * That's the goal. Intelligence that's felt, not seen.
 */

// Types
export * from './types';

// Context Building (Sensing Layer)
export {
  buildFullAmbientContext,
  buildTemporalContext,
  buildBodyContext,
  buildBehavioralContext,
  buildSessionContext,
  buildEnvironmentContext,
  type SessionDataInput,
  type BodyRegionInput,
  type HealthDataInput,
  type ActiveWorkoutInput,
  type ContextBuilderInput,
} from './context-builder';

// Intervention Engine (Reasoning Layer)
export {
  evaluateIntervention,
  detectDistress,
  getDistressResponse,
  defaultUserPreferences,
} from './intervention-engine';

// Environment State (Expression Layer - Environment)
export {
  calculateEnvironmentState,
  interpolateEnvironment,
  createSmoothTransition,
  applyMicroWarmth,
  applyMicroCool,
  applySoften,
  ENVIRONMENT_PRESETS,
} from './environment-state';
