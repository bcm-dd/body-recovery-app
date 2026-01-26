/**
 * Ambient AI Components
 *
 * The Expression Layer components for the Ambient AI system.
 * These components render the AI's presence in subtle, non-intrusive ways.
 */

// Main Provider
export {
  AmbientAIProvider,
  useAmbientAIContext,
  useAmbientEnvironmentControls,
  useAmbientExpression,
  useAmbientSensing,
  useAmbientPreferences,
} from './AmbientAIProvider';

// Micro-Cues
export {
  MicroCueOverlay,
  MicroCueContainer,
  useMicroCue,
  MICRO_CUES,
} from './MicroCue';

// Ambient Text
export {
  AmbientTextDisplay,
  AmbientTextWithDots,
  useAmbientText,
  useAmbientTextQueue,
  AMBIENT_TEXT_PRESETS,
} from './AmbientText';

// Gentle Prompts
export {
  GentlePromptDisplay,
  InlineGentlePrompt,
  useGentlePrompt,
  useGentlePromptQueue,
  createGentlePrompt,
  COMMON_PROMPTS,
} from './GentlePrompt';
