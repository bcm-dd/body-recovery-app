'use client';

/**
 * Ambient AI Provider
 *
 * The orchestrating component that brings together all three layers
 * of the Ambient AI system:
 *
 * 1. Sensing Layer - Context building and understanding
 * 2. Reasoning Layer - Intervention decision engine
 * 3. Expression Layer - Environmental, micro-cues, text, and prompts
 *
 * This provider makes the ambient AI available throughout the app
 * and coordinates the flow of context → decisions → expressions.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';

import { AmbientTextDisplay, useAmbientText, AMBIENT_TEXT_PRESETS } from './AmbientText';
import { GentlePromptDisplay, useGentlePromptQueue } from './GentlePrompt';
import type { MICRO_CUES } from './MicroCue';
import { MicroCueOverlay, useMicroCue } from './MicroCue';
import { useAmbientEnvironment, EnvironmentOverlay } from '../../hooks/useAmbientEnvironment';
import {
  buildFullAmbientContext,
  type SessionDataInput,
  type BodyRegionInput,
  type HealthDataInput,
  type ActiveWorkoutInput,
} from '../../lib/ambient-ai/context-builder';
import {
  evaluateIntervention,
  detectDistress,
  getDistressResponse,
  defaultUserPreferences,
} from '../../lib/ambient-ai/intervention-engine';
import type {
  FullAmbientContext,
  EnvironmentState,
  InterventionDecision,
  NonInterventionDecision,
  UserPreferences,
  MicroCue,
  AmbientText,
  GentlePrompt,
  AmbientWord,
} from '../../lib/ambient-ai/types';

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Type guard for AmbientWord - validates that a string is a valid ambient word
 */
function isAmbientWord(word: string): word is AmbientWord {
  return word in AMBIENT_TEXT_PRESETS;
}

/** Valid environment preset names */
const VALID_PRESETS = [
  'recovery',
  'energizing',
  'focused',
  'restDay',
  'celebration',
  'concern',
] as const;
type EnvironmentPresetName = (typeof VALID_PRESETS)[number];

/**
 * Type guard for environment presets
 */
function isValidPreset(preset: string): preset is EnvironmentPresetName {
  return VALID_PRESETS.includes(preset as EnvironmentPresetName);
}

// ============================================
// CONTEXT TYPE
// ============================================

interface AmbientAIContextValue {
  // Sensing Layer
  context: FullAmbientContext | null;
  isContextReady: boolean;

  // Reasoning Layer
  currentDecision: InterventionDecision | NonInterventionDecision | null;
  lastPromptTime: Date | null;

  // Expression Layer - Environment
  environmentState: EnvironmentState | null;
  setEnvironmentPreset: (preset: string) => void;
  applyWarmth: () => void;
  applyCoolness: () => void;
  softenEnvironment: () => void;

  // Expression Layer - Micro-Cues
  triggerMicroCue: (cue: MicroCue) => void;
  triggerMicroCuePreset: (name: keyof typeof MICRO_CUES) => void;

  // Expression Layer - Ambient Text
  showAmbientText: (text: AmbientText) => void;
  showAmbientWord: (word: AmbientWord) => void;

  // Expression Layer - Gentle Prompts
  showGentlePrompt: (prompt: GentlePrompt) => void;
  queueGentlePrompt: (prompt: GentlePrompt) => void;

  // User Preferences
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;

  // Manual triggers
  triggerCheck: () => void;
  dismissCurrentPrompt: () => void;
}

const AmbientAIContext = createContext<AmbientAIContextValue | null>(null);

// ============================================
// PROVIDER PROPS
// ============================================

interface AmbientAIProviderProps {
  children: React.ReactNode;
  // Data inputs for context building
  sessions: SessionDataInput[];
  bodyRegions: BodyRegionInput[];
  healthData?: HealthDataInput;
  activeWorkout?: ActiveWorkoutInput | null;
  // Configuration
  enabled?: boolean;
  checkInterval?: number; // ms between intervention checks
  onAction?: (action: string, context?: string) => void;
}

// ============================================
// PROVIDER COMPONENT
// ============================================

export function AmbientAIProvider({
  children,
  sessions,
  bodyRegions,
  healthData,
  activeWorkout,
  enabled = true,
  checkInterval = 10000,
  onAction,
}: AmbientAIProviderProps) {
  // ============================================
  // STATE
  // ============================================

  const [preferences, setPreferences] = useState<UserPreferences>(defaultUserPreferences);
  const [lastPromptTime, setLastPromptTime] = useState<Date | null>(null);
  const [currentDecision, setCurrentDecision] = useState<
    InterventionDecision | NonInterventionDecision | null
  >(null);
  const [isContextReady, setIsContextReady] = useState(false);

  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAppOpenRef = useRef<Date>(new Date());

  // ============================================
  // BUILD CONTEXT
  // ============================================

  const ambientContext = useMemo(() => {
    if (!enabled) return null;

    return buildFullAmbientContext({
      sessions,
      bodyRegions,
      healthData,
      activeWorkout,
      lastAppOpen: lastAppOpenRef.current,
    });
  }, [sessions, bodyRegions, healthData, activeWorkout, enabled]);

  useEffect(() => {
    if (ambientContext) {
      setIsContextReady(true);
    }
  }, [ambientContext]);

  // ============================================
  // EXPRESSION LAYER HOOKS
  // ============================================

  // Environment
  const {
    environmentState,
    setPreset: setEnvironmentPreset,
    applyWarmth,
    applyCoolness,
    soften: softenEnvironment,
    cssVariables,
  } = useAmbientEnvironment(ambientContext, { enabled });

  // Micro-cues
  const {
    trigger: triggerMicroCue,
    triggerPreset: triggerMicroCuePreset,
    currentCue,
  } = useMicroCue();

  // Ambient text
  const { show: showAmbientText, showWord: showAmbientWord, currentText } = useAmbientText();

  // Gentle prompts
  const {
    queue: queueGentlePrompt,
    currentPrompt,
    handleOptionSelect,
    handleDismiss: dismissPrompt,
  } = useGentlePromptQueue({
    minDelayBetweenPrompts: 30000, // 30 seconds between prompts
    onAction: (action, id) => {
      onAction?.(action, id);
      setLastPromptTime(new Date());
    },
    onDismiss: (_id) => {
      setLastPromptTime(new Date());
    },
  });

  // ============================================
  // INTERVENTION PROCESSING
  // ============================================

  const processIntervention = useCallback(
    (decision: InterventionDecision) => {
      setCurrentDecision(decision);

      switch (decision.type) {
        case 'environmental_shift':
          if (decision.action === 'set_environment_recovery') {
            setEnvironmentPreset('recovery');
          } else if (decision.action === 'set_environment_energizing') {
            setEnvironmentPreset('energizing');
          } else if (
            decision.action === 'soften_environment' ||
            decision.action === 'soften_and_simplify'
          ) {
            softenEnvironment();
          }
          // Show ambient text if provided - use type guard
          if (decision.message && isAmbientWord(decision.message)) {
            showAmbientWord(decision.message);
          }
          break;

        case 'subtle_cue':
          if (decision.action === 'micro_warmth') {
            applyWarmth();
            triggerMicroCuePreset('encouragement');
          } else if (decision.action === 'soften_environment') {
            softenEnvironment();
            triggerMicroCuePreset('soften');
          }
          // Show ambient text if provided - use type guard
          if (decision.message && isAmbientWord(decision.message)) {
            showAmbientWord(decision.message);
          }
          break;

        case 'gentle_prompt':
          if (decision.message && decision.options) {
            queueGentlePrompt({
              id: `intervention-${Date.now()}`,
              message: decision.message,
              options: decision.options,
              dismissible: true,
              priority: decision.urgency === 'immediate' ? 'high' : 'medium',
            });
          }
          break;

        case 'automatic_action':
          // Trigger the action callback
          if (decision.action) {
            onAction?.(decision.action, decision.reason);
          }
          // Show ambient text explanation - extract first word and validate
          if (decision.message) {
            const firstWord = decision.message.split(' ')[0].toLowerCase();
            if (isAmbientWord(firstWord)) {
              showAmbientWord(firstWord);
            }
          }
          break;

        case 'action_suggestion':
          if (decision.message && decision.options) {
            queueGentlePrompt({
              id: `suggestion-${Date.now()}`,
              message: decision.message,
              options: decision.options,
              dismissible: true,
              priority: 'low',
            });
          }
          break;
      }
    },
    [
      setEnvironmentPreset,
      softenEnvironment,
      applyWarmth,
      triggerMicroCuePreset,
      showAmbientWord,
      queueGentlePrompt,
      onAction,
    ]
  );

  // ============================================
  // PERIODIC INTERVENTION CHECK
  // ============================================

  const triggerCheck = useCallback(() => {
    if (!enabled || !ambientContext) return;

    const decision = evaluateIntervention(ambientContext, lastPromptTime, preferences);

    if (decision.shouldIntervene) {
      processIntervention(decision as InterventionDecision);
    } else {
      setCurrentDecision(decision);
    }
  }, [enabled, ambientContext, lastPromptTime, preferences, processIntervention]);

  // Run periodic checks
  useEffect(() => {
    if (!enabled) return;

    // Initial check after a short delay
    const initialTimer = setTimeout(triggerCheck, 2000);

    // Periodic checks
    checkIntervalRef.current = setInterval(triggerCheck, checkInterval);

    return () => {
      clearTimeout(initialTimer);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [enabled, checkInterval, triggerCheck]);

  // ============================================
  // SESSION-SPECIFIC CHECKS
  // ============================================

  // Check for distress during active session
  useEffect(() => {
    if (!enabled || !ambientContext?.session?.isActive) return;

    const distressCheckInterval = setInterval(() => {
      const distress = detectDistress(ambientContext);
      if (distress && distress.confidence > 0.5) {
        const response = getDistressResponse(distress);
        processIntervention(response);
      }
    }, 5000); // Check every 5 seconds during workout

    return () => clearInterval(distressCheckInterval);
  }, [enabled, ambientContext, processIntervention]);

  // ============================================
  // PREFERENCES
  // ============================================

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ambient-ai-preferences-v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({
          ...defaultUserPreferences,
          ...parsed,
          interventionThresholds: new Map(parsed.interventionThresholds || []),
        });
      }
    } catch (error) {
      console.warn('Failed to load ambient AI preferences:', error);
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    try {
      const toStore = {
        ...preferences,
        interventionThresholds: Array.from(preferences.interventionThresholds.entries()),
      };
      localStorage.setItem('ambient-ai-preferences-v2', JSON.stringify(toStore));
    } catch (error) {
      console.warn('Failed to save ambient AI preferences:', error);
    }
  }, [preferences]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const contextValue: AmbientAIContextValue = useMemo(
    () => ({
      // Sensing
      context: ambientContext,
      isContextReady,

      // Reasoning
      currentDecision,
      lastPromptTime,

      // Environment
      environmentState,
      setEnvironmentPreset: (preset: string) => {
        if (isValidPreset(preset)) {
          setEnvironmentPreset(preset);
        }
      },
      applyWarmth,
      applyCoolness,
      softenEnvironment,

      // Micro-cues
      triggerMicroCue,
      triggerMicroCuePreset,

      // Ambient text
      showAmbientText,
      showAmbientWord,

      // Gentle prompts
      showGentlePrompt: queueGentlePrompt,
      queueGentlePrompt,

      // Preferences
      preferences,
      updatePreferences,

      // Manual controls
      triggerCheck,
      dismissCurrentPrompt: dismissPrompt,
    }),
    [
      ambientContext,
      isContextReady,
      currentDecision,
      lastPromptTime,
      environmentState,
      setEnvironmentPreset,
      applyWarmth,
      applyCoolness,
      softenEnvironment,
      triggerMicroCue,
      triggerMicroCuePreset,
      showAmbientText,
      showAmbientWord,
      queueGentlePrompt,
      preferences,
      updatePreferences,
      triggerCheck,
      dismissPrompt,
    ]
  );

  // ============================================
  // RENDER
  // ============================================

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <AmbientAIContext.Provider value={contextValue}>
      {/* Environment overlay */}
      <EnvironmentOverlay cssVariables={cssVariables} />

      {/* Micro-cue overlay */}
      <MicroCueOverlay cue={currentCue} />

      {/* Ambient text display */}
      <AmbientTextDisplay text={currentText} />

      {/* Gentle prompt display */}
      <GentlePromptDisplay
        prompt={currentPrompt}
        onOptionSelect={handleOptionSelect}
        onDismiss={dismissPrompt}
        position="bottom"
      />

      {/* App content */}
      {children}
    </AmbientAIContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAmbientAIContext(): AmbientAIContextValue {
  const context = useContext(AmbientAIContext);
  if (!context) {
    throw new Error('useAmbientAIContext must be used within an AmbientAIProvider');
  }
  return context;
}

// ============================================
// CONVENIENCE HOOKS
// ============================================

/**
 * Hook for just the environment controls
 */
export function useAmbientEnvironmentControls() {
  const context = useAmbientAIContext();
  return {
    state: context.environmentState,
    setPreset: context.setEnvironmentPreset,
    applyWarmth: context.applyWarmth,
    applyCoolness: context.applyCoolness,
    soften: context.softenEnvironment,
  };
}

/**
 * Hook for just the expression layer
 */
export function useAmbientExpression() {
  const context = useAmbientAIContext();
  return {
    triggerMicroCue: context.triggerMicroCue,
    triggerMicroCuePreset: context.triggerMicroCuePreset,
    showAmbientText: context.showAmbientText,
    showAmbientWord: context.showAmbientWord,
    showGentlePrompt: context.showGentlePrompt,
    queueGentlePrompt: context.queueGentlePrompt,
  };
}

/**
 * Hook for just the context/sensing layer
 */
export function useAmbientSensing() {
  const context = useAmbientAIContext();
  return {
    context: context.context,
    isReady: context.isContextReady,
  };
}

/**
 * Hook for preferences
 */
export function useAmbientPreferences() {
  const context = useAmbientAIContext();
  return {
    preferences: context.preferences,
    updatePreferences: context.updatePreferences,
  };
}

export default AmbientAIProvider;
