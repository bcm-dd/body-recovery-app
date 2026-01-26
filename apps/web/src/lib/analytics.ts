/**
 * Privacy-Respecting Analytics Library
 *
 * A provider-agnostic analytics interface that:
 * - Respects Do Not Track header
 * - Supports anonymous mode
 * - Provides opt-out mechanism
 * - Console-only mode for development
 */

// ============================================================================
// Types
// ============================================================================

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
}

export interface UserProperties {
  userId?: string;
  anonymousId?: string;
  [key: string]: unknown;
}

export interface TimingEvent {
  name: string;
  duration: number;
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  anonymousMode: boolean;
  respectDoNotTrack: boolean;
  consentGiven: boolean;
  sampleRate: number; // 0-1, percentage of events to track
}

export interface AnalyticsProvider {
  name: string;
  init: (config: AnalyticsConfig) => void;
  trackEvent: (event: AnalyticsEvent) => void;
  trackPageView: (path: string, properties?: Record<string, unknown>) => void;
  setUserProperties: (properties: UserProperties) => void;
  trackTiming: (event: TimingEvent) => void;
  flush: () => Promise<void>;
}

// ============================================================================
// Event Definitions
// ============================================================================

export const AnalyticsEvents = {
  // Session Events
  SESSION_STARTED: 'session_started',
  SESSION_COMPLETED: 'session_completed',
  SESSION_ABANDONED: 'session_abandoned',
  SESSION_PAUSED: 'session_paused',
  SESSION_RESUMED: 'session_resumed',

  // Exercise Events
  EXERCISE_STARTED: 'exercise_started',
  EXERCISE_COMPLETED: 'exercise_completed',
  EXERCISE_SUBSTITUTED: 'exercise_substituted',
  EXERCISE_SKIPPED: 'exercise_skipped',

  // Health Events
  PAIN_LOGGED: 'pain_logged',
  CHECKIN_COMPLETED: 'checkin_completed',
  BODY_REGION_SELECTED: 'body_region_selected',

  // Plan Events
  PLAN_GENERATED: 'plan_generated',
  PLAN_MODIFIED: 'plan_modified',
  PLAN_RESET: 'plan_reset',

  // Feature Usage
  FEATURE_USED: 'feature_used',

  // User Actions
  SETTINGS_CHANGED: 'settings_changed',
  DATA_EXPORTED: 'data_exported',
  FEEDBACK_SUBMITTED: 'feedback_submitted',

  // Errors
  ERROR_OCCURRED: 'error_occurred',
  ERROR_BOUNDARY_TRIGGERED: 'error_boundary_triggered',
} as const;

export type AnalyticsEventName = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];

// Feature names for FEATURE_USED event
export const Features = {
  BODY_MAP: 'body_map',
  PROGRESS_VIEW: 'progress_view',
  SETTINGS: 'settings',
  EXERCISE_LIBRARY: 'exercise_library',
  AI_ASSISTANT: 'ai_assistant',
  DARK_MODE: 'dark_mode',
  HAPTIC_FEEDBACK: 'haptic_feedback',
  SOUND_FEEDBACK: 'sound_feedback',
  DATA_EXPORT: 'data_export',
} as const;

export type FeatureName = typeof Features[keyof typeof Features];

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  ANALYTICS_ENABLED: 'analytics_enabled',
  ANALYTICS_ANONYMOUS: 'analytics_anonymous_mode',
  ANALYTICS_CONSENT: 'analytics_consent',
  ANALYTICS_USER_ID: 'analytics_user_id',
} as const;

// ============================================================================
// Console Provider (Default for MVP)
// ============================================================================

const consoleProvider: AnalyticsProvider = {
  name: 'console',

  init: (config) => {
    if (config.debug) {
      console.log('[Analytics] Initialized with config:', config);
    }
  },

  trackEvent: (event) => {
    console.log('[Analytics] Event:', event.name, event.properties || {});
  },

  trackPageView: (path, properties) => {
    console.log('[Analytics] Page View:', path, properties || {});
  },

  setUserProperties: (properties) => {
    console.log('[Analytics] User Properties:', properties);
  },

  trackTiming: (event) => {
    console.log('[Analytics] Timing:', event.name, `${event.duration}ms`, event.metadata || {});
  },

  flush: async () => {
    console.log('[Analytics] Flushed');
  },
};

// ============================================================================
// Analytics Class
// ============================================================================

class Analytics {
  private config: AnalyticsConfig = {
    enabled: true,
    debug: process.env.NODE_ENV === 'development',
    anonymousMode: false,
    respectDoNotTrack: true,
    consentGiven: false,
    sampleRate: 1.0,
  };

  private provider: AnalyticsProvider = consoleProvider;
  private userProperties: UserProperties = {};
  private initialized = false;
  private eventQueue: AnalyticsEvent[] = [];
  private pageViewCount = 0;

  // ============================================================================
  // Initialization
  // ============================================================================

  init(config?: Partial<AnalyticsConfig>, provider?: AnalyticsProvider): void {
    // Load saved preferences
    this.loadSavedPreferences();

    // Merge config
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Set provider
    if (provider) {
      this.provider = provider;
    }

    // Check Do Not Track
    if (this.config.respectDoNotTrack && this.isDoNotTrackEnabled()) {
      this.config.enabled = false;
      if (this.config.debug) {
        console.log('[Analytics] Disabled due to Do Not Track header');
      }
    }

    // Initialize provider
    this.provider.init(this.config);
    this.initialized = true;

    // Process queued events
    this.processQueue();

    if (this.config.debug) {
      console.log('[Analytics] Initialized:', {
        enabled: this.config.enabled,
        anonymousMode: this.config.anonymousMode,
        provider: this.provider.name,
      });
    }
  }

  private loadSavedPreferences(): void {
    if (typeof window === 'undefined') return;

    try {
      const enabled = localStorage.getItem(STORAGE_KEYS.ANALYTICS_ENABLED);
      const anonymous = localStorage.getItem(STORAGE_KEYS.ANALYTICS_ANONYMOUS);
      const consent = localStorage.getItem(STORAGE_KEYS.ANALYTICS_CONSENT);

      if (enabled !== null) this.config.enabled = enabled === 'true';
      if (anonymous !== null) this.config.anonymousMode = anonymous === 'true';
      if (consent !== null) this.config.consentGiven = consent === 'true';
    } catch (e) {
      // localStorage not available
    }
  }

  private isDoNotTrackEnabled(): boolean {
    if (typeof window === 'undefined') return false;

    const dnt =
      navigator.doNotTrack === '1' ||
      (window as unknown as { doNotTrack?: string }).doNotTrack === '1' ||
      (navigator as unknown as { msDoNotTrack?: string }).msDoNotTrack === '1';

    return dnt;
  }

  // ============================================================================
  // Configuration
  // ============================================================================

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.savePreference(STORAGE_KEYS.ANALYTICS_ENABLED, enabled.toString());

    if (this.config.debug) {
      console.log('[Analytics] Enabled:', enabled);
    }
  }

  isEnabled(): boolean {
    return this.config.enabled && this.config.consentGiven;
  }

  setAnonymousMode(anonymous: boolean): void {
    this.config.anonymousMode = anonymous;
    this.savePreference(STORAGE_KEYS.ANALYTICS_ANONYMOUS, anonymous.toString());

    if (anonymous) {
      // Clear user identification
      this.userProperties = { anonymousId: this.generateAnonymousId() };
      this.provider.setUserProperties(this.userProperties);
    }

    if (this.config.debug) {
      console.log('[Analytics] Anonymous mode:', anonymous);
    }
  }

  isAnonymousMode(): boolean {
    return this.config.anonymousMode;
  }

  setConsent(given: boolean): void {
    this.config.consentGiven = given;
    this.savePreference(STORAGE_KEYS.ANALYTICS_CONSENT, given.toString());

    if (this.config.debug) {
      console.log('[Analytics] Consent:', given);
    }

    if (given) {
      this.processQueue();
    }
  }

  hasConsent(): boolean {
    return this.config.consentGiven;
  }

  private savePreference(key: string, value: string): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // localStorage not available
    }
  }

  private generateAnonymousId(): string {
    return 'anon_' + Math.random().toString(36).substring(2, 15);
  }

  // ============================================================================
  // Event Tracking
  // ============================================================================

  trackEvent(name: string, properties?: Record<string, unknown>): void {
    const event: AnalyticsEvent = {
      name,
      properties: this.sanitizeProperties(properties),
      timestamp: Date.now(),
    };

    if (!this.shouldTrack()) {
      if (!this.config.consentGiven && this.config.enabled) {
        // Queue event until consent is given
        this.eventQueue.push(event);
      }
      return;
    }

    if (!this.shouldSample()) return;

    this.provider.trackEvent(event);
  }

  trackPageView(path: string, properties?: Record<string, unknown>): void {
    if (!this.shouldTrack()) return;
    if (!this.shouldSample()) return;

    this.pageViewCount++;

    const sanitizedProperties = this.sanitizeProperties({
      ...properties,
      pageViewNumber: this.pageViewCount,
    });

    this.provider.trackPageView(path, sanitizedProperties);
  }

  setUserProperties(properties: UserProperties): void {
    if (this.config.anonymousMode) {
      // Only keep anonymous ID in anonymous mode
      this.userProperties = {
        anonymousId: this.userProperties.anonymousId || this.generateAnonymousId()
      };
    } else {
      this.userProperties = { ...this.userProperties, ...this.sanitizeProperties(properties) };
    }

    if (this.shouldTrack()) {
      this.provider.setUserProperties(this.userProperties);
    }
  }

  trackTiming(name: string, duration: number, category?: string, metadata?: Record<string, unknown>): void {
    if (!this.shouldTrack()) return;
    if (!this.shouldSample()) return;

    this.provider.trackTiming({
      name,
      duration,
      category,
      metadata: this.sanitizeProperties(metadata),
    });
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  private shouldTrack(): boolean {
    return this.config.enabled && this.config.consentGiven && this.initialized;
  }

  private shouldSample(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  private sanitizeProperties(properties?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!properties) return undefined;

    // Remove any PII or sensitive data patterns
    const sanitized: Record<string, unknown> = {};
    const sensitivePatterns = [
      /email/i,
      /password/i,
      /phone/i,
      /address/i,
      /ssn/i,
      /credit/i,
      /card/i,
      /token/i,
      /secret/i,
      /key/i,
    ];

    for (const [key, value] of Object.entries(properties)) {
      // Skip sensitive keys
      if (sensitivePatterns.some(pattern => pattern.test(key))) {
        continue;
      }

      // Redact email-like values
      if (typeof value === 'string' && value.includes('@')) {
        sanitized[key] = '[REDACTED_EMAIL]';
        continue;
      }

      sanitized[key] = value;
    }

    return sanitized;
  }

  private processQueue(): void {
    if (!this.shouldTrack()) return;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        this.provider.trackEvent(event);
      }
    }
  }

  async flush(): Promise<void> {
    await this.provider.flush();
  }

  getConfig(): AnalyticsConfig {
    return { ...this.config };
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const analytics = new Analytics();

// ============================================================================
// Convenience Functions
// ============================================================================

export function trackEvent(name: string, properties?: Record<string, unknown>): void {
  analytics.trackEvent(name, properties);
}

export function trackPageView(path: string, properties?: Record<string, unknown>): void {
  analytics.trackPageView(path, properties);
}

export function trackFeatureUsed(feature: FeatureName, metadata?: Record<string, unknown>): void {
  analytics.trackEvent(AnalyticsEvents.FEATURE_USED, { feature, ...metadata });
}

export function trackTiming(name: string, duration: number, category?: string): void {
  analytics.trackTiming(name, duration, category);
}

export function setUserProperties(properties: UserProperties): void {
  analytics.setUserProperties(properties);
}

// ============================================================================
// Session Tracking Helpers
// ============================================================================

export function trackSessionStarted(sessionId: string, metadata?: Record<string, unknown>): void {
  analytics.trackEvent(AnalyticsEvents.SESSION_STARTED, { sessionId, ...metadata });
}

export function trackSessionCompleted(sessionId: string, duration: number, metadata?: Record<string, unknown>): void {
  analytics.trackEvent(AnalyticsEvents.SESSION_COMPLETED, { sessionId, duration, ...metadata });
  analytics.trackTiming('session_duration', duration, 'sessions');
}

export function trackSessionAbandoned(sessionId: string, progress: number, reason?: string): void {
  analytics.trackEvent(AnalyticsEvents.SESSION_ABANDONED, { sessionId, progress, reason });
}

// ============================================================================
// Exercise Tracking Helpers
// ============================================================================

export function trackExerciseSubstituted(
  originalExercise: string,
  newExercise: string,
  reason?: string
): void {
  analytics.trackEvent(AnalyticsEvents.EXERCISE_SUBSTITUTED, {
    originalExercise,
    newExercise,
    reason,
  });
}

export function trackExerciseSkipped(exerciseId: string, reason?: string): void {
  analytics.trackEvent(AnalyticsEvents.EXERCISE_SKIPPED, { exerciseId, reason });
}

// ============================================================================
// Health Tracking Helpers
// ============================================================================

export function trackPainLogged(region: string, level: number): void {
  analytics.trackEvent(AnalyticsEvents.PAIN_LOGGED, { region, level });
}

export function trackCheckinCompleted(checkInType: string, metadata?: Record<string, unknown>): void {
  analytics.trackEvent(AnalyticsEvents.CHECKIN_COMPLETED, { checkInType, ...metadata });
}

// ============================================================================
// Plan Tracking Helpers
// ============================================================================

export function trackPlanGenerated(planType: string, exerciseCount: number): void {
  analytics.trackEvent(AnalyticsEvents.PLAN_GENERATED, { planType, exerciseCount });
}

export function trackPlanModified(modificationType: string, details?: Record<string, unknown>): void {
  analytics.trackEvent(AnalyticsEvents.PLAN_MODIFIED, { modificationType, ...details });
}
