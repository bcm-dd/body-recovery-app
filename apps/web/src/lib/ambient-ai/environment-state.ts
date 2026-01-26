/**
 * Environment State System
 *
 * The Expression Layer - Environmental Mode
 * Controls the visual atmosphere of the app based on context.
 */

import type { FullAmbientContext, EnvironmentState, AmbientMotion, TimeOfDay } from './types';

// ============================================
// COLOR TEMPERATURE PRESETS
// ============================================

/**
 * Color temperature in Kelvin
 * 2700K = Warm (candlelight)
 * 4000K = Neutral
 * 6500K = Cool (daylight)
 */
const TEMPERATURE_WARM = 2700;
const TEMPERATURE_COOL = 6500;

// ============================================
// BASE ENVIRONMENT BY TIME OF DAY
// ============================================

function getBaseEnvironmentForTimeOfDay(timeOfDay: TimeOfDay): EnvironmentState {
  switch (timeOfDay) {
    case 'early_morning':
      return {
        colorTemperature: 2900, // Warm, gentle wake-up
        brightness: 0.7,
        saturation: 0.8,
        animationSpeed: 0.7, // Slow, peaceful
        ambientMotion: 'breathing',
        cssVariables: {},
      };

    case 'morning':
      return {
        colorTemperature: 4500, // Neutral, energizing
        brightness: 0.9,
        saturation: 1.0,
        animationSpeed: 1.0,
        ambientMotion: 'flowing',
        cssVariables: {},
      };

    case 'midday':
      return {
        colorTemperature: 5500, // Bright, alert
        brightness: 1.0,
        saturation: 1.0,
        animationSpeed: 1.1,
        ambientMotion: 'energetic',
        cssVariables: {},
      };

    case 'afternoon':
      return {
        colorTemperature: 4500,
        brightness: 0.95,
        saturation: 0.95,
        animationSpeed: 1.0,
        ambientMotion: 'flowing',
        cssVariables: {},
      };

    case 'evening':
      return {
        colorTemperature: 3200, // Warm, winding down
        brightness: 0.8,
        saturation: 0.85,
        animationSpeed: 0.85,
        ambientMotion: 'breathing',
        cssVariables: {},
      };

    case 'night':
      return {
        colorTemperature: 2700, // Very warm, restful
        brightness: 0.6,
        saturation: 0.7,
        animationSpeed: 0.6,
        ambientMotion: 'still',
        cssVariables: {},
      };

    default:
      return {
        colorTemperature: 4000,
        brightness: 0.85,
        saturation: 0.9,
        animationSpeed: 1.0,
        ambientMotion: 'breathing',
        cssVariables: {},
      };
  }
}

// ============================================
// READINESS ADJUSTMENTS
// ============================================

function adjustForReadiness(state: EnvironmentState, readinessScore: number): EnvironmentState {
  // High readiness (70-100): Energizing
  if (readinessScore >= 70) {
    return {
      ...state,
      colorTemperature: Math.min(state.colorTemperature + 500, TEMPERATURE_COOL),
      brightness: Math.min(state.brightness + 0.1, 1.0),
      saturation: Math.min(state.saturation + 0.1, 1.0),
      animationSpeed: Math.min(state.animationSpeed + 0.15, 1.5),
      ambientMotion: state.ambientMotion === 'still' ? 'breathing' : state.ambientMotion,
    };
  }

  // Moderate readiness (40-70): Balanced
  if (readinessScore >= 40) {
    return state; // No adjustment
  }

  // Low readiness (0-40): Recovery mode
  return {
    ...state,
    colorTemperature: Math.max(state.colorTemperature - 500, TEMPERATURE_WARM),
    brightness: Math.max(state.brightness - 0.15, 0.5),
    saturation: Math.max(state.saturation - 0.15, 0.6),
    animationSpeed: Math.max(state.animationSpeed - 0.2, 0.5),
    ambientMotion: 'breathing',
  };
}

// ============================================
// SESSION STATE ADJUSTMENTS
// ============================================

function adjustForSessionState(
  state: EnvironmentState,
  session: FullAmbientContext['session']
): EnvironmentState {
  if (!session?.isActive) return state;

  // During active workout, slightly more energetic
  let adjusted = {
    ...state,
    animationSpeed: Math.min(state.animationSpeed + 0.1, 1.3),
    ambientMotion: 'flowing' as AmbientMotion,
  };

  // Adjust for fatigue
  if (session.apparentFatigue === 'fatigued') {
    adjusted = {
      ...adjusted,
      colorTemperature: adjusted.colorTemperature - 300,
      brightness: adjusted.brightness - 0.1,
      animationSpeed: adjusted.animationSpeed - 0.2,
      ambientMotion: 'breathing',
    };
  } else if (session.apparentFatigue === 'fresh') {
    adjusted = {
      ...adjusted,
      brightness: Math.min(adjusted.brightness + 0.05, 1.0),
    };
  }

  // Adjust for engagement
  if (session.apparentEngagement === 'struggling') {
    adjusted = {
      ...adjusted,
      colorTemperature: Math.max(adjusted.colorTemperature - 400, TEMPERATURE_WARM),
      saturation: adjusted.saturation - 0.1,
      ambientMotion: 'breathing',
    };
  }

  return adjusted;
}

// ============================================
// PAIN LEVEL ADJUSTMENTS
// ============================================

function adjustForPainLevel(
  state: EnvironmentState,
  averagePain: number,
  painTrend: 'improving' | 'stable' | 'worsening'
): EnvironmentState {
  // High pain: Softer, more comforting
  if (averagePain >= 6) {
    return {
      ...state,
      colorTemperature: Math.max(state.colorTemperature - 500, TEMPERATURE_WARM),
      brightness: Math.max(state.brightness - 0.1, 0.6),
      saturation: Math.max(state.saturation - 0.15, 0.6),
      animationSpeed: Math.max(state.animationSpeed - 0.2, 0.5),
      ambientMotion: 'breathing',
    };
  }

  // Pain worsening: Gentle concern
  if (painTrend === 'worsening' && averagePain >= 4) {
    return {
      ...state,
      colorTemperature: state.colorTemperature - 200,
      saturation: state.saturation - 0.05,
    };
  }

  // Pain improving: Subtle warmth/celebration
  if (painTrend === 'improving') {
    return {
      ...state,
      brightness: Math.min(state.brightness + 0.05, 1.0),
      saturation: Math.min(state.saturation + 0.05, 1.0),
    };
  }

  return state;
}

// ============================================
// CSS VARIABLE GENERATION
// ============================================

function generateCSSVariables(state: EnvironmentState): Record<string, string> {
  // Base colors adjusted by temperature
  const warmOverlay =
    state.colorTemperature < 4000
      ? `rgba(255, 200, 150, ${((4000 - state.colorTemperature) / 5000) * 0.1})`
      : 'transparent';

  const coolOverlay =
    state.colorTemperature > 5000
      ? `rgba(180, 200, 255, ${((state.colorTemperature - 5000) / 3000) * 0.08})`
      : 'transparent';

  return {
    '--ambient-brightness': state.brightness.toString(),
    '--ambient-saturation': state.saturation.toString(),
    '--ambient-animation-speed': state.animationSpeed.toString(),
    '--ambient-motion': state.ambientMotion,
    '--ambient-warm-overlay': warmOverlay,
    '--ambient-cool-overlay': coolOverlay,
    '--ambient-color-temp': `${state.colorTemperature}K`,
    // For filter-based adjustments
    '--ambient-brightness-filter': `brightness(${0.9 + state.brightness * 0.2})`,
    '--ambient-saturation-filter': `saturate(${0.8 + state.saturation * 0.4})`,
    // Animation timing
    '--ambient-transition-duration': `${1000 / state.animationSpeed}ms`,
    '--ambient-breathing-duration': `${4000 / state.animationSpeed}ms`,
    // Background adjustments
    '--ambient-bg-lightness': `${state.brightness * 10}%`,
  };
}

// ============================================
// PRESET ENVIRONMENTS
// ============================================

export const ENVIRONMENT_PRESETS = {
  recovery: {
    colorTemperature: 2800,
    brightness: 0.6,
    saturation: 0.7,
    animationSpeed: 0.6,
    ambientMotion: 'breathing' as AmbientMotion,
    cssVariables: {},
  },

  energizing: {
    colorTemperature: 5500,
    brightness: 1.0,
    saturation: 1.0,
    animationSpeed: 1.2,
    ambientMotion: 'energetic' as AmbientMotion,
    cssVariables: {},
  },

  focused: {
    colorTemperature: 4500,
    brightness: 0.9,
    saturation: 0.95,
    animationSpeed: 0.9,
    ambientMotion: 'flowing' as AmbientMotion,
    cssVariables: {},
  },

  restDay: {
    colorTemperature: 2700,
    brightness: 0.55,
    saturation: 0.65,
    animationSpeed: 0.5,
    ambientMotion: 'still' as AmbientMotion,
    cssVariables: {},
  },

  celebration: {
    colorTemperature: 4000,
    brightness: 1.0,
    saturation: 1.1,
    animationSpeed: 1.3,
    ambientMotion: 'energetic' as AmbientMotion,
    cssVariables: {},
  },

  concern: {
    colorTemperature: 3500,
    brightness: 0.75,
    saturation: 0.8,
    animationSpeed: 0.7,
    ambientMotion: 'breathing' as AmbientMotion,
    cssVariables: {},
  },
};

// ============================================
// MAIN ENVIRONMENT CALCULATOR
// ============================================

export function calculateEnvironmentState(context: FullAmbientContext): EnvironmentState {
  // Start with base environment for time of day
  let state = getBaseEnvironmentForTimeOfDay(context.temporal.timeOfDay);

  // Adjust for readiness
  state = adjustForReadiness(state, context.body.readinessScore);

  // Adjust for session state if active
  if (context.session) {
    state = adjustForSessionState(state, context.session);
  }

  // Adjust for pain levels
  state = adjustForPainLevel(state, context.body.averagePainLevel, context.body.painTrend);

  // Generate CSS variables
  state.cssVariables = generateCSSVariables(state);

  return state;
}

// ============================================
// ENVIRONMENT TRANSITIONS
// ============================================

export interface EnvironmentTransition {
  from: EnvironmentState;
  to: EnvironmentState;
  duration: number; // ms
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export function createSmoothTransition(
  current: EnvironmentState,
  target: EnvironmentState,
  durationMs: number = 2000
): EnvironmentTransition {
  return {
    from: current,
    to: target,
    duration: durationMs,
    easing: 'ease-in-out',
  };
}

export function interpolateEnvironment(
  from: EnvironmentState,
  to: EnvironmentState,
  progress: number // 0-1
): EnvironmentState {
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const interpolated: EnvironmentState = {
    colorTemperature: lerp(from.colorTemperature, to.colorTemperature, progress),
    brightness: lerp(from.brightness, to.brightness, progress),
    saturation: lerp(from.saturation, to.saturation, progress),
    animationSpeed: lerp(from.animationSpeed, to.animationSpeed, progress),
    ambientMotion: progress < 0.5 ? from.ambientMotion : to.ambientMotion,
    cssVariables: {},
  };

  interpolated.cssVariables = generateCSSVariables(interpolated);

  return interpolated;
}

// ============================================
// MICRO-ADJUSTMENTS
// ============================================

/**
 * Subtle warmth effect (e.g., after good set)
 */
export function applyMicroWarmth(state: EnvironmentState): EnvironmentState {
  const warmed: EnvironmentState = {
    ...state,
    colorTemperature: state.colorTemperature - 100,
    brightness: Math.min(state.brightness + 0.03, 1.0),
    cssVariables: {},
  };
  warmed.cssVariables = generateCSSVariables(warmed);
  return warmed;
}

/**
 * Subtle cooling effect (e.g., rest period)
 */
export function applyMicroCool(state: EnvironmentState): EnvironmentState {
  const cooled: EnvironmentState = {
    ...state,
    colorTemperature: state.colorTemperature + 100,
    brightness: Math.max(state.brightness - 0.02, 0.5),
    cssVariables: {},
  };
  cooled.cssVariables = generateCSSVariables(cooled);
  return cooled;
}

/**
 * Soften effect (e.g., when user seems to be struggling)
 */
export function applySoften(state: EnvironmentState): EnvironmentState {
  const softened: EnvironmentState = {
    ...state,
    brightness: Math.max(state.brightness - 0.1, 0.5),
    saturation: Math.max(state.saturation - 0.1, 0.6),
    animationSpeed: Math.max(state.animationSpeed - 0.15, 0.5),
    ambientMotion: 'breathing',
    cssVariables: {},
  };
  softened.cssVariables = generateCSSVariables(softened);
  return softened;
}
