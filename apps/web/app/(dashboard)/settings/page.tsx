'use client';

import {
  User,
  Bell,
  Clock,
  Sparkles,
  Shield,
  Download,
  Trash2,
  Moon,
  Sun,
  AlertTriangle,
  Save,
  CheckCircle2,
  Volume2,
  VolumeX,
  Vibrate,
  Settings2,
  ChevronRight,
  Brain,
  MessageCircle,
  PartyPopper,
  Lightbulb,
  TrendingUp,
  RefreshCw,

  BarChart3,
  Eye,
  EyeOff,
  Lock,
  Info,
  Globe,
  Check} from 'lucide-react';
import { useState, useEffect, useId } from 'react';

import { AIPresenceIndicator, useAnalyticsContext ,
  AnimatedToggle,
  AnimatedButton,
  GlassCard,
  GlassButton,
  GlassInput,
  GlassSelect,
  GlassToggle,
  GlassBadge,
  GlassNav,
  GlassAlert,
  GlassDivider,
  LiveRegion,
  VisuallyHidden,
} from '../../../src/components';
import { useFeedback, useHaptic, useSound, useAmbientAI, useAnalytics, useI18n } from '../../../src/hooks';
import { localeMetadata, type Locale } from '../../../src/lib/i18n';
import { useAppState, useTheme, useLocaleContext } from '../../providers';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sections: SettingsSection[] = [
  { id: 'profile', title: 'Profile', icon: User },
  { id: 'preferences', title: 'Preferences', icon: Clock },
  { id: 'language', title: 'Language', icon: Globe },
  { id: 'ai', title: 'AI Assistant', icon: Brain },
  { id: 'interactions', title: 'Interactions', icon: Sparkles },
  { id: 'notifications', title: 'Notifications', icon: Bell },
  { id: 'analytics', title: 'Analytics & Privacy', icon: BarChart3 },
  { id: 'data', title: 'Data & Export', icon: Shield },
];

function InteractionsSection() {
  const haptic = useHaptic();
  const sound = useSound();
  const feedback = useFeedback();
  const soundHeadingId = useId();
  const animationHeadingId = useId();

  return (
    <>
      <GlassCard variant="default" padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative p-2.5 rounded-xl bg-[var(--primary)]/10">
            <Volume2 className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
            <div className="absolute inset-0 rounded-xl bg-[var(--primary)] opacity-20 blur-sm" />
          </div>
          <div>
            <h2 id={soundHeadingId} className="text-lg font-semibold text-foreground">
              Sound & Haptics
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Customize audio and tactile feedback
            </p>
          </div>
        </div>

        <div className="space-y-6" role="group" aria-labelledby={soundHeadingId}>
          {/* Sound Toggle */}
          <GlassToggle
            checked={sound.isEnabled}
            onChange={sound.toggle}
            label="UI Sounds"
            description="Subtle audio feedback for interactions"
          />

          {/* Haptic Toggle */}
          {haptic.isSupported && (
            <GlassToggle
              checked={haptic.isEnabled}
              onChange={haptic.toggle}
              label="Haptic Feedback"
              description="Tactile vibration on touch interactions"
            />
          )}

          <GlassDivider />

          {/* Test Feedback */}
          <fieldset>
            <legend className="text-sm font-medium text-foreground mb-3">Test Feedback</legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Feedback test buttons">
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={() => feedback.tap()}
                aria-label="Test tap feedback"
              >
                Tap
              </GlassButton>
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={() => feedback.success()}
                aria-label="Test success feedback"
              >
                Success
              </GlassButton>
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={() => feedback.warning()}
                aria-label="Test warning feedback"
              >
                Warning
              </GlassButton>
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={() => feedback.complete()}
                aria-label="Test complete feedback"
              >
                Complete
              </GlassButton>
            </div>
          </fieldset>
        </div>
      </GlassCard>

      <GlassCard variant="default" padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative p-2.5 rounded-xl bg-cyan-500/10">
            <Sparkles className="h-5 w-5 text-cyan-500" aria-hidden="true" />
            <div className="absolute inset-0 rounded-xl bg-cyan-500 opacity-20 blur-sm" />
          </div>
          <div>
            <h2 id={animationHeadingId} className="text-lg font-semibold text-foreground">
              Animation Preferences
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Animations respect system preferences
            </p>
          </div>
        </div>

        <GlassAlert variant="info" aria-live="polite">
          <span className="font-medium">Tip:</span> To reduce or disable animations,
          enable &quot;Reduce motion&quot; in your device&apos;s accessibility settings.
        </GlassAlert>
      </GlassCard>
    </>
  );
}

// AI Settings Section
function AISettingsSection() {
  const appState = useAppState();
  const { preferences, updatePreferences, resetDismissals } = useAmbientAI({
    sessions: appState.sessions,
    bodyRegions: appState.bodyRegions,
    location: 'dashboard',
  });
  const aiStatusId = useId();
  const insightPrefsId = useId();
  const aiChatId = useId();
  const resetInsightsId = useId();

  const frequencyOptions = [
    { value: 'minimal', label: 'Minimal - Only important insights' },
    { value: 'balanced', label: 'Balanced - Smart suggestions when helpful' },
    { value: 'frequent', label: 'Frequent - All available insights' },
  ];

  return (
    <>
      {/* AI Status Card */}
      <GlassCard variant="default" padding="lg" animate>
        <div className="flex items-center gap-3 mb-6">
          <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-cyan-500/20">
            <Brain className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
            <AIPresenceIndicator size="sm" className="absolute -bottom-0.5 -right-0.5" />
          </div>
          <div>
            <h2 id={aiStatusId} className="text-lg font-semibold text-foreground">
              AI Assistant
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Your intelligent recovery companion
            </p>
          </div>
        </div>

        <div className="glass-panel-subtle rounded-xl p-4 mb-6" role="status" aria-live="polite">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">AI is Active</p>
              <p className="text-xs text-[var(--text-muted)]">
                Providing personalized insights based on your recovery data
              </p>
            </div>
          </div>
        </div>

        <GlassAlert variant="info">
          <span className="font-medium">How it works:</span> The AI analyzes your session history,
          pain trends, and patterns to provide relevant, timely suggestions. It speaks up only
          when it has something valuable to add.
        </GlassAlert>
      </GlassCard>

      {/* Insight Preferences */}
      <GlassCard variant="default" padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative p-2.5 rounded-xl bg-amber-500/10">
            <Lightbulb className="h-5 w-5 text-amber-500" aria-hidden="true" />
            <div className="absolute inset-0 rounded-xl bg-amber-500 opacity-20 blur-sm" />
          </div>
          <div>
            <h2 id={insightPrefsId} className="text-lg font-semibold text-foreground">
              Insight Preferences
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Choose what types of insights you receive
            </p>
          </div>
        </div>

        <div className="space-y-6" role="group" aria-labelledby={insightPrefsId}>
          <GlassSelect
            label="Insight Frequency"
            value={preferences.insightFrequency}
            onChange={(e) => updatePreferences({ insightFrequency: e.target.value as 'minimal' | 'balanced' | 'frequent' })}
            options={frequencyOptions}
            hint="Control how often you receive AI insights"
          />

          <GlassDivider />

          <GlassToggle
            checked={preferences.enableGreetings}
            onChange={(checked) => updatePreferences({ enableGreetings: checked })}
            label="Time-Aware Greetings"
            description="Good morning, evening messages based on time of day"
          />

          <GlassToggle
            checked={preferences.enableCelebrations}
            onChange={(checked) => updatePreferences({ enableCelebrations: checked })}
            label="Celebrations"
            description="Celebrate streaks, milestones, and achievements"
          />

          <GlassToggle
            checked={preferences.enableTips}
            onChange={(checked) => updatePreferences({ enableTips: checked })}
            label="Tips & Suggestions"
            description="Helpful tips based on weather, patterns, and context"
          />

          <GlassToggle
            checked={preferences.enableWarnings}
            onChange={(checked) => updatePreferences({ enableWarnings: checked })}
            label="Health Alerts"
            description="Gentle warnings about pain trends or overexertion"
          />

          <GlassToggle
            checked={preferences.enablePatternSuggestions}
            onChange={(checked) => updatePreferences({ enablePatternSuggestions: checked })}
            label="Pattern Recognition"
            description="Suggestions based on your workout patterns and habits"
          />
        </div>
      </GlassCard>

      {/* Chat & Interaction */}
      <GlassCard variant="default" padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative p-2.5 rounded-xl bg-cyan-500/10">
            <MessageCircle className="h-5 w-5 text-cyan-500" aria-hidden="true" />
            <div className="absolute inset-0 rounded-xl bg-cyan-500 opacity-20 blur-sm" />
          </div>
          <div>
            <h2 id={aiChatId} className="text-lg font-semibold text-foreground">
              AI Chat
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Ask questions about your recovery
            </p>
          </div>
        </div>

        <div className="glass-panel-subtle rounded-xl p-4 space-y-3" aria-labelledby={aiChatId}>
          <p className="text-sm text-foreground font-medium">Example questions you can ask:</p>
          <ul className="space-y-2" role="list" aria-label="Example AI questions">
            <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
              &quot;What should I focus on today?&quot;
            </li>
            <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
              &quot;Explain my progress this week&quot;
            </li>
            <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
              &quot;Should I take a rest day?&quot;
            </li>
            <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
              &quot;Why is my pain getting worse?&quot;
            </li>
          </ul>
        </div>

        <GlassAlert variant="info" className="mt-4">
          <span className="font-medium">Coming soon:</span> Voice input and more advanced
          AI capabilities powered by real-time analysis.
        </GlassAlert>
      </GlassCard>

      {/* Reset Dismissals */}
      <GlassCard variant="default" padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative p-2.5 rounded-xl bg-rose-500/10">
            <RefreshCw className="h-5 w-5 text-rose-500" aria-hidden="true" />
            <div className="absolute inset-0 rounded-xl bg-rose-500 opacity-20 blur-sm" />
          </div>
          <div>
            <h2 id={resetInsightsId} className="text-lg font-semibold text-foreground">
              Reset Insights
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Restore dismissed insights and suggestions
            </p>
          </div>
        </div>

        <p className="text-sm text-[var(--text-muted)] mb-4" id={`${resetInsightsId}-desc`}>
          If you&apos;ve dismissed insights or selected &quot;Don&apos;t show again&quot; on suggestions,
          you can reset them to start seeing those insights again.
        </p>

        <GlassButton
          variant="secondary"
          onClick={resetDismissals}
          icon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}
          aria-describedby={`${resetInsightsId}-desc`}
        >
          Reset All Dismissed Insights
        </GlassButton>
      </GlassCard>
    </>
  );
}

// Analytics & Privacy Section
function AnalyticsPrivacySection() {
  let analyticsContext: ReturnType<typeof useAnalyticsContext> | null = null;
  const analyticsHeadingId = useId();
  const collectInfoId = useId();
  const performanceId = useId();
  const retentionId = useId();
  const consentId = useId();

  try {
    analyticsContext = useAnalyticsContext();
  } catch {
    // AnalyticsProvider not available, show limited UI
  }

  const { trackFeature } = useAnalytics({ componentName: 'settings' });

  // Local state for when context is not available
  const [localEnabled, setLocalEnabled] = useState(true);
  const [localAnonymous, setLocalAnonymous] = useState(false);
  const [localConsent, setLocalConsent] = useState(true);

  const isEnabled = analyticsContext?.isEnabled ?? localEnabled;
  const isAnonymousMode = analyticsContext?.isAnonymousMode ?? localAnonymous;
  const hasConsent = analyticsContext?.hasConsent ?? localConsent;
  const webVitals = analyticsContext?.webVitals ?? {};

  const handleSetEnabled = (enabled: boolean) => {
    if (analyticsContext) {
      analyticsContext.setEnabled(enabled);
    } else {
      setLocalEnabled(enabled);
    }
    trackFeature('settings', { action: 'toggle_analytics', enabled });
  };

  const handleSetAnonymous = (anonymous: boolean) => {
    if (analyticsContext) {
      analyticsContext.setAnonymousMode(anonymous);
    } else {
      setLocalAnonymous(anonymous);
    }
    trackFeature('settings', { action: 'toggle_anonymous_mode', anonymous });
  };

  const handleSetConsent = (given: boolean) => {
    if (analyticsContext) {
      analyticsContext.setConsent(given);
    } else {
      setLocalConsent(given);
    }
    trackFeature('settings', { action: 'update_consent', given });
  };

  return (
    <>
      {/* Analytics Overview */}
      <GlassCard variant="default" padding="lg" animate>
        <div className="flex items-center gap-3 mb-6">
          <div className="relative p-2.5 rounded-xl bg-[var(--primary)]/10">
            <BarChart3 className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
            <div className="absolute inset-0 rounded-xl bg-[var(--primary)] opacity-20 blur-sm" />
          </div>
          <div>
            <h2 id={analyticsHeadingId} className="text-lg font-semibold text-foreground">
              Analytics & Insights
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Help us improve your experience
            </p>
          </div>
        </div>

        <div className="glass-panel-subtle rounded-xl p-4 mb-6" role="status">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Lock className="h-5 w-5 text-emerald-500" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Privacy-First Design</p>
              <p className="text-xs text-[var(--text-muted)]">
                We never sell your data. Analytics help us improve the app.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6" role="group" aria-labelledby={analyticsHeadingId}>
          <GlassToggle
            checked={isEnabled && hasConsent}
            onChange={handleSetEnabled}
            label="Enable Analytics"
            description="Allow anonymous usage data to help improve the app"
          />

          <GlassToggle
            checked={isAnonymousMode}
            onChange={handleSetAnonymous}
            label="Enhanced Privacy Mode"
            description="Extra anonymization for all collected data"
          />
        </div>
      </GlassCard>

      {/* What We Collect */}
      <GlassCard variant="default" padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative p-2.5 rounded-xl bg-cyan-500/10">
            <Info className="h-5 w-5 text-cyan-500" aria-hidden="true" />
            <div className="absolute inset-0 rounded-xl bg-cyan-500 opacity-20 blur-sm" />
          </div>
          <div>
            <h2 id={collectInfoId} className="text-lg font-semibold text-foreground">
              What We Collect
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Transparency about data collection
            </p>
          </div>
        </div>

        <ul className="space-y-4" role="list" aria-labelledby={collectInfoId}>
          <li className="glass-panel-subtle rounded-lg p-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 flex-shrink-0">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Feature Usage</p>
                <p className="text-xs text-[var(--text-muted)]">
                  Which features you use most (body map, progress, settings)
                </p>
              </div>
            </div>
          </li>

          <li className="glass-panel-subtle rounded-lg p-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 flex-shrink-0">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Session Patterns</p>
                <p className="text-xs text-[var(--text-muted)]">
                  Session completion rates and duration (not content)
                </p>
              </div>
            </div>
          </li>

          <li className="glass-panel-subtle rounded-lg p-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 flex-shrink-0">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Performance Metrics</p>
                <p className="text-xs text-[var(--text-muted)]">
                  App load times and responsiveness (Core Web Vitals)
                </p>
              </div>
            </div>
          </li>

          <li className="glass-panel-subtle rounded-lg p-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 flex-shrink-0">
                <EyeOff className="h-4 w-4 text-red-500" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">What We Never Collect</p>
                <p className="text-xs text-[var(--text-muted)]">
                  Personal health details, pain specifics, exercise content, or any identifying information
                </p>
              </div>
            </div>
          </li>
        </ul>
      </GlassCard>

      {/* Performance Metrics */}
      {Object.keys(webVitals).length > 0 && (
        <GlassCard variant="default" padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative p-2.5 rounded-xl bg-amber-500/10">
              <TrendingUp className="h-5 w-5 text-amber-500" aria-hidden="true" />
              <div className="absolute inset-0 rounded-xl bg-amber-500 opacity-20 blur-sm" />
            </div>
            <div>
              <h2 id={performanceId} className="text-lg font-semibold text-foreground">
                App Performance
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Current Core Web Vitals
              </p>
            </div>
          </div>

          <VisuallyHidden>
            <h3>Performance metrics summary</h3>
            <p>
              {webVitals.lcp !== undefined && `Largest Contentful Paint: ${(webVitals.lcp / 1000).toFixed(2)} seconds. `}
              {webVitals.fcp !== undefined && `First Contentful Paint: ${(webVitals.fcp / 1000).toFixed(2)} seconds. `}
              {webVitals.cls !== undefined && `Cumulative Layout Shift: ${webVitals.cls.toFixed(3)}. `}
              {webVitals.ttfb !== undefined && `Time to First Byte: ${webVitals.ttfb.toFixed(0)} milliseconds. `}
              {webVitals.fid !== undefined && `First Input Delay: ${webVitals.fid.toFixed(0)} milliseconds. `}
              {webVitals.inp !== undefined && `Interaction to Next Paint: ${webVitals.inp.toFixed(0)} milliseconds.`}
            </p>
          </VisuallyHidden>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="list" aria-labelledby={performanceId}>
            {webVitals.lcp !== undefined && (
              <div className="glass-panel-subtle rounded-lg p-3 text-center" role="listitem" aria-label={`LCP: ${(webVitals.lcp / 1000).toFixed(2)} seconds`}>
                <p className="text-xs text-[var(--text-muted)] mb-1" aria-hidden="true">LCP</p>
                <p className="text-lg font-semibold text-foreground" aria-hidden="true">
                  {(webVitals.lcp / 1000).toFixed(2)}s
                </p>
                <p className="text-xs text-[var(--text-muted)]" aria-hidden="true">Largest Paint</p>
              </div>
            )}
            {webVitals.fcp !== undefined && (
              <div className="glass-panel-subtle rounded-lg p-3 text-center" role="listitem" aria-label={`FCP: ${(webVitals.fcp / 1000).toFixed(2)} seconds`}>
                <p className="text-xs text-[var(--text-muted)] mb-1" aria-hidden="true">FCP</p>
                <p className="text-lg font-semibold text-foreground" aria-hidden="true">
                  {(webVitals.fcp / 1000).toFixed(2)}s
                </p>
                <p className="text-xs text-[var(--text-muted)]" aria-hidden="true">First Paint</p>
              </div>
            )}
            {webVitals.cls !== undefined && (
              <div className="glass-panel-subtle rounded-lg p-3 text-center" role="listitem" aria-label={`CLS: ${webVitals.cls.toFixed(3)}`}>
                <p className="text-xs text-[var(--text-muted)] mb-1" aria-hidden="true">CLS</p>
                <p className="text-lg font-semibold text-foreground" aria-hidden="true">
                  {webVitals.cls.toFixed(3)}
                </p>
                <p className="text-xs text-[var(--text-muted)]" aria-hidden="true">Layout Shift</p>
              </div>
            )}
            {webVitals.ttfb !== undefined && (
              <div className="glass-panel-subtle rounded-lg p-3 text-center" role="listitem" aria-label={`TTFB: ${webVitals.ttfb.toFixed(0)} milliseconds`}>
                <p className="text-xs text-[var(--text-muted)] mb-1" aria-hidden="true">TTFB</p>
                <p className="text-lg font-semibold text-foreground" aria-hidden="true">
                  {webVitals.ttfb.toFixed(0)}ms
                </p>
                <p className="text-xs text-[var(--text-muted)]" aria-hidden="true">Time to First Byte</p>
              </div>
            )}
            {webVitals.fid !== undefined && (
              <div className="glass-panel-subtle rounded-lg p-3 text-center" role="listitem" aria-label={`FID: ${webVitals.fid.toFixed(0)} milliseconds`}>
                <p className="text-xs text-[var(--text-muted)] mb-1" aria-hidden="true">FID</p>
                <p className="text-lg font-semibold text-foreground" aria-hidden="true">
                  {webVitals.fid.toFixed(0)}ms
                </p>
                <p className="text-xs text-[var(--text-muted)]" aria-hidden="true">Input Delay</p>
              </div>
            )}
            {webVitals.inp !== undefined && (
              <div className="glass-panel-subtle rounded-lg p-3 text-center" role="listitem" aria-label={`INP: ${webVitals.inp.toFixed(0)} milliseconds`}>
                <p className="text-xs text-[var(--text-muted)] mb-1" aria-hidden="true">INP</p>
                <p className="text-lg font-semibold text-foreground" aria-hidden="true">
                  {webVitals.inp.toFixed(0)}ms
                </p>
                <p className="text-xs text-[var(--text-muted)]" aria-hidden="true">Interaction</p>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Data Retention */}
      <GlassCard variant="default" padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative p-2.5 rounded-xl bg-violet-500/10">
            <Clock className="h-5 w-5 text-violet-500" aria-hidden="true" />
            <div className="absolute inset-0 rounded-xl bg-violet-500 opacity-20 blur-sm" />
          </div>
          <div>
            <h2 id={retentionId} className="text-lg font-semibold text-foreground">
              Data Retention
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              How long we keep analytics data
            </p>
          </div>
        </div>

        <table className="w-full" aria-labelledby={retentionId}>
          <VisuallyHidden as="caption">Data retention periods for different types of collected data</VisuallyHidden>
          <thead className="sr-only">
            <tr>
              <th scope="col">Data Type</th>
              <th scope="col">Retention Period</th>
            </tr>
          </thead>
          <tbody className="space-y-4">
            <tr className="flex items-center justify-between py-2 border-b border-[var(--glass-border)]">
              <td className="text-sm text-foreground">Session Analytics</td>
              <td><GlassBadge variant="info">90 days</GlassBadge></td>
            </tr>
            <tr className="flex items-center justify-between py-2 border-b border-[var(--glass-border)]">
              <td className="text-sm text-foreground">Performance Metrics</td>
              <td><GlassBadge variant="info">30 days</GlassBadge></td>
            </tr>
            <tr className="flex items-center justify-between py-2 border-b border-[var(--glass-border)]">
              <td className="text-sm text-foreground">Error Reports</td>
              <td><GlassBadge variant="info">14 days</GlassBadge></td>
            </tr>
            <tr className="flex items-center justify-between py-2">
              <td className="text-sm text-foreground">Personal Data</td>
              <td><GlassBadge variant="success">Never collected</GlassBadge></td>
            </tr>
          </tbody>
        </table>

        <GlassAlert variant="info" className="mt-6">
          <span className="font-medium">Your Rights:</span> You can request deletion of all data
          at any time. Simply disable analytics above or contact us.
        </GlassAlert>
      </GlassCard>

      {/* Consent Management */}
      <GlassCard variant="default" padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative p-2.5 rounded-xl bg-emerald-500/10">
            <Shield className="h-5 w-5 text-emerald-500" aria-hidden="true" />
            <div className="absolute inset-0 rounded-xl bg-emerald-500 opacity-20 blur-sm" />
          </div>
          <div>
            <h2 id={consentId} className="text-lg font-semibold text-foreground">
              Consent Management
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Control your data preferences
            </p>
          </div>
        </div>

        <div className="space-y-4" role="group" aria-labelledby={consentId}>
          <GlassToggle
            checked={hasConsent}
            onChange={handleSetConsent}
            label="Analytics Consent"
            description="I consent to anonymous analytics collection"
          />

          <GlassDivider />

          <div className="flex flex-col sm:flex-row gap-3" role="group" aria-label="Consent quick actions">
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => handleSetConsent(true)}
              icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
              aria-label="Accept all analytics consent"
            >
              Accept All
            </GlassButton>
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => {
                handleSetEnabled(false);
                handleSetConsent(false);
              }}
              icon={<EyeOff className="h-4 w-4" aria-hidden="true" />}
              aria-label="Reject all analytics consent"
            >
              Reject All
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </>
  );
}

// Language Settings Section
function LanguageSection() {
  const { locale, setLocale, availableLocales } = useLocaleContext();
  const { t } = useI18n();
  const languageHeadingId = useId();
  const comingSoonId = useId();
  const rtlInfoId = useId();

  // Languages that will be supported in the future
  const futureLanguages = [
    { code: 'es', name: 'Spanish', nativeName: 'Espanol' },
    { code: 'fr', name: 'French', nativeName: 'Francais' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Portugues' },
    { code: 'ja', name: 'Japanese', nativeName: 'Japanese' },
    { code: 'zh', name: 'Chinese', nativeName: 'Chinese' },
    { code: 'ar', name: 'Arabic', nativeName: 'Arabic' },
  ];

  return (
    <>
      <GlassCard variant="default" padding="lg" animate>
        <div className="flex items-center gap-3 mb-6">
          <div className="relative p-2.5 rounded-xl bg-[var(--primary)]/10">
            <Globe className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
            <div className="absolute inset-0 rounded-xl bg-[var(--primary)] opacity-20 blur-sm" />
          </div>
          <div>
            <h2 id={languageHeadingId} className="text-lg font-semibold text-foreground">
              {t('settings.language.title')}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              {t('settings.language.subtitle')}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]" id={`${languageHeadingId}-desc`}>
            {t('settings.language.current')}
          </p>

          {/* Current Languages - Using radiogroup for accessibility */}
          <div
            className="space-y-2"
            role="radiogroup"
            aria-labelledby={languageHeadingId}
            aria-describedby={`${languageHeadingId}-desc`}
          >
            {availableLocales.map((loc) => {
              const metadata = localeMetadata[loc];
              const isSelected = locale === loc;

              return (
                <button
                  key={loc}
                  onClick={() => setLocale(loc)}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`${metadata?.name || loc.toUpperCase()} (${metadata?.nativeName || loc})`}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                    isSelected
                      ? 'glass-panel-subtle bg-[var(--primary)]/10 border border-[var(--primary)]/30'
                      : 'glass-panel-subtle hover:bg-[var(--glass-bg)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden="true">{loc === 'en' ? '🇺🇸' : '🌐'}</span>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">
                        {metadata?.name || loc.toUpperCase()}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {metadata?.nativeName || loc}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]" aria-hidden="true">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* Coming Soon Languages */}
      <GlassCard variant="default" padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative p-2.5 rounded-xl bg-amber-500/10">
            <Sparkles className="h-5 w-5 text-amber-500" aria-hidden="true" />
            <div className="absolute inset-0 rounded-xl bg-amber-500 opacity-20 blur-sm" />
          </div>
          <div>
            <h2 id={comingSoonId} className="text-lg font-semibold text-foreground">
              {t('settings.language.comingSoon')}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              More languages are on the way
            </p>
          </div>
        </div>

        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="list" aria-labelledby={comingSoonId}>
          {futureLanguages.map((lang) => (
            <li
              key={lang.code}
              className="glass-panel-subtle rounded-lg p-3 text-center opacity-60"
              aria-label={`${lang.name}, coming soon`}
            >
              <p className="text-sm font-medium text-foreground">{lang.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{lang.nativeName}</p>
            </li>
          ))}
        </ul>

        <GlassAlert variant="info" className="mt-6">
          Want to help translate? We welcome community contributions to make
          this app accessible to more people.
        </GlassAlert>
      </GlassCard>

      {/* RTL Support Info */}
      <GlassCard variant="default" padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative p-2.5 rounded-xl bg-cyan-500/10">
            <Info className="h-5 w-5 text-cyan-500" aria-hidden="true" />
            <div className="absolute inset-0 rounded-xl bg-cyan-500 opacity-20 blur-sm" />
          </div>
          <div>
            <h2 id={rtlInfoId} className="text-lg font-semibold text-foreground">
              Right-to-Left Support
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Infrastructure ready for RTL languages
            </p>
          </div>
        </div>

        <p className="text-sm text-[var(--text-muted)]" aria-describedby={rtlInfoId}>
          Our i18n infrastructure includes support for right-to-left languages
          like Arabic and Hebrew. When these languages are added, the interface
          will automatically adapt to RTL layout.
        </p>
      </GlassCard>
    </>
  );
}

export default function SettingsPage() {
  const appState = useAppState();
  const { theme, toggleTheme } = useTheme();

  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // Form states
  const [name, setName] = useState(appState.user?.name || '');
  const [email, setEmail] = useState(appState.user?.email || '');
  const [sessionDuration, setSessionDuration] = useState(
    appState.preferences.sessionDuration.toString()
  );
  const [reminderTime, setReminderTime] = useState(
    appState.preferences.reminderTime
  );
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);

  // IDs for accessibility
  const pageHeadingId = useId();
  const profileHeadingId = useId();
  const preferencesHeadingId = useId();
  const appearanceHeadingId = useId();
  const notificationsHeadingId = useId();
  const exportHeadingId = useId();
  const dangerZoneId = useId();

  const handleSave = async () => {
    setIsSaving(true);
    setAnnouncement('Saving settings...');
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSavedMessage(true);
    setAnnouncement('Settings saved successfully');
    setTimeout(() => {
      setSavedMessage(false);
      setAnnouncement('');
    }, 3000);
  };

  const handleExportData = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        name,
        email,
      },
      preferences: {
        sessionDuration: parseInt(sessionDuration),
        reminderTime,
        darkMode: theme === 'dark',
      },
      bodyRegions: appState.bodyRegions,
      sessions: appState.sessions,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recovery-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Navigation items for GlassNav
  const navItems = sections.map((section) => ({
    id: section.id,
    label: section.title,
    icon: <section.icon className="h-5 w-5" />,
  }));

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Live region for screen reader announcements */}
      <LiveRegion>{announcement}</LiveRegion>

      {/* Page Header - Premium Liquid Glass Effect */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 rounded-xl bg-[var(--primary)]/10 group">
            <Settings2 className="h-6 w-6 text-[var(--primary)] transition-transform duration-500 group-hover:rotate-90" aria-hidden="true" />
            <div className="absolute inset-0 rounded-xl bg-[var(--primary)] opacity-20 blur-sm group-hover:opacity-40 transition-opacity duration-300" />
            {/* Inner specular */}
            <div className="absolute top-0 left-[20%] right-[20%] h-px rounded-full bg-white/20" />
          </div>
          <div>
            <h1 id={pageHeadingId} className="heading-premium text-xl sm:text-2xl">Settings</h1>
            <p className="text-sm text-[var(--text-muted)]">
              Manage your account and preferences
            </p>
          </div>
        </div>
        {savedMessage && (
          <div className="flex items-center gap-2 glass-badge-success px-4 py-2 rounded-xl animate-fadeIn shadow-lg shadow-emerald-500/20" role="status" aria-live="polite">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm font-medium">Settings saved successfully</span>
          </div>
        )}
      </header>

      <div className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-4">
        {/* Sidebar Navigation - Premium Liquid Glass Effect */}
        <aside className="lg:col-span-1" aria-label="Settings navigation">
          <div className="sticky top-4 relative">
            {/* Aurora background for nav */}
            <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none" aria-hidden="true">
              <div className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-br from-[var(--aurora-1)] to-transparent blur-3xl opacity-30" />
            </div>
            <GlassCard variant="subtle" padding="sm" className="relative">
              {/* Specular highlight */}
              <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-[var(--specular-soft)] to-transparent opacity-40" aria-hidden="true" />
              <GlassNav
                items={navItems}
                activeId={activeSection}
                onSelect={setActiveSection}
                orientation="vertical"
                variant="default"
                aria-label="Settings sections"
              />
            </GlassCard>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3 space-y-4 sm:space-y-6" aria-labelledby={pageHeadingId}>
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <GlassCard variant="default" padding="lg" animate>
              <div className="flex items-center gap-3 mb-6">
                <div className="relative p-2.5 rounded-xl bg-[var(--primary)]/10">
                  <User className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
                  <div className="absolute inset-0 rounded-xl bg-[var(--primary)] opacity-20 blur-sm" />
                </div>
                <div>
                  <h2 id={profileHeadingId} className="text-lg font-semibold text-foreground">
                    Profile Information
                  </h2>
                  <p className="text-sm text-[var(--text-muted)]">
                    Update your personal information
                  </p>
                </div>
              </div>

              <form className="space-y-6" role="group" aria-labelledby={profileHeadingId} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <GlassInput
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  autoComplete="name"
                />

                <GlassInput
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />

                <div className="flex justify-end pt-4">
                  <GlassButton
                    variant="primary"
                    onClick={handleSave}
                    loading={isSaving}
                    icon={<Save className="h-4 w-4" aria-hidden="true" />}
                    aria-label={isSaving ? 'Saving changes...' : 'Save changes'}
                  >
                    Save Changes
                  </GlassButton>
                </div>
              </form>
            </GlassCard>
          )}

          {/* Preferences Section */}
          {activeSection === 'preferences' && (
            <>
              <GlassCard variant="default" padding="lg" animate>
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative p-2.5 rounded-xl bg-emerald-500/10">
                    <Clock className="h-5 w-5 text-emerald-500" />
                    <div className="absolute inset-0 rounded-xl bg-emerald-500 opacity-20 blur-sm" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Recovery Preferences
                    </h2>
                    <p className="text-sm text-[var(--text-muted)]">
                      Customize your recovery experience
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <GlassSelect
                    label="Preferred Session Duration"
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(e.target.value)}
                    options={[
                      { value: '10', label: '10 minutes' },
                      { value: '15', label: '15 minutes' },
                      { value: '20', label: '20 minutes' },
                      { value: '30', label: '30 minutes' },
                      { value: '45', label: '45 minutes' },
                    ]}
                  />

                  <GlassInput
                    label="Daily Reminder Time"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                  />
                </div>
              </GlassCard>

              <GlassCard variant="default" padding="lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative p-2.5 rounded-xl bg-amber-500/10">
                    {theme === 'dark' ? (
                      <Moon className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Sun className="h-5 w-5 text-amber-500" />
                    )}
                    <div className="absolute inset-0 rounded-xl bg-amber-500 opacity-20 blur-sm" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Appearance
                    </h2>
                    <p className="text-sm text-[var(--text-muted)]">
                      Customize how the app looks
                    </p>
                  </div>
                </div>

                <GlassToggle
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  label="Dark Mode"
                  description="Use dark theme for the interface"
                />

                <div className="flex justify-end pt-6">
                  <GlassButton
                    variant="primary"
                    onClick={handleSave}
                    loading={isSaving}
                    icon={<Save className="h-4 w-4" />}
                  >
                    Save Changes
                  </GlassButton>
                </div>
              </GlassCard>
            </>
          )}

          {/* Language Section */}
          {activeSection === 'language' && (
            <LanguageSection />
          )}

          {/* AI Assistant Section */}
          {activeSection === 'ai' && (
            <AISettingsSection />
          )}

          {/* Interactions Section */}
          {activeSection === 'interactions' && (
            <InteractionsSection />
          )}

          {/* Analytics & Privacy Section */}
          {activeSection === 'analytics' && (
            <AnalyticsPrivacySection />
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <GlassCard variant="default" padding="lg" animate>
              <div className="flex items-center gap-3 mb-6">
                <div className="relative p-2.5 rounded-xl bg-rose-500/10">
                  <Bell className="h-5 w-5 text-rose-500" />
                  <div className="absolute inset-0 rounded-xl bg-rose-500 opacity-20 blur-sm" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Notification Settings
                  </h2>
                  <p className="text-sm text-[var(--text-muted)]">
                    Choose how you want to receive notifications
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <GlassToggle
                  checked={emailNotifications}
                  onChange={setEmailNotifications}
                  label="Email Notifications"
                  description="Receive session reminders via email"
                />

                <GlassToggle
                  checked={pushNotifications}
                  onChange={setPushNotifications}
                  label="Push Notifications"
                  description="Receive push notifications on your devices"
                />

                <GlassToggle
                  checked={weeklyReport}
                  onChange={setWeeklyReport}
                  label="Weekly Report"
                  description="Get a weekly summary of your progress"
                />
              </div>

              <div className="flex justify-end pt-6">
                <GlassButton
                  variant="primary"
                  onClick={handleSave}
                  loading={isSaving}
                  icon={<Save className="h-4 w-4" />}
                >
                  Save Changes
                </GlassButton>
              </div>
            </GlassCard>
          )}

          {/* Data & Privacy Section */}
          {activeSection === 'data' && (
            <>
              <GlassCard variant="default" padding="lg" animate>
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative p-2.5 rounded-xl bg-cyan-500/10">
                    <Download className="h-5 w-5 text-cyan-500" />
                    <div className="absolute inset-0 rounded-xl bg-cyan-500 opacity-20 blur-sm" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Export Your Data
                    </h2>
                    <p className="text-sm text-[var(--text-muted)]">
                      Download all your data in JSON format
                    </p>
                  </div>
                </div>

                <GlassButton
                  variant="secondary"
                  onClick={handleExportData}
                  icon={<Download className="h-4 w-4" />}
                >
                  Export All Data
                </GlassButton>
              </GlassCard>

              <GlassCard
                variant="default"
                padding="lg"
                className="border-red-500/30 bg-red-500/5"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative p-2.5 rounded-xl bg-red-500/10">
                    <Trash2 className="h-5 w-5 text-red-500" />
                    <div className="absolute inset-0 rounded-xl bg-red-500 opacity-20 blur-sm" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Danger Zone
                    </h2>
                    <p className="text-sm text-[var(--text-muted)]">
                      Permanently delete your account and all data
                    </p>
                  </div>
                </div>

                <GlassButton
                  variant="danger"
                  icon={<Trash2 className="h-4 w-4" />}
                >
                  Delete Account
                </GlassButton>
              </GlassCard>
            </>
          )}

          {/* Disclaimer Section (Always Visible) - Glass Alert */}
          <GlassAlert
            variant="warning"
            title="Important Disclaimer"
            icon={<AlertTriangle className="h-5 w-5" />}
          >
            <div className="space-y-2">
              <p>
                This app provides guided self-care information for recovery
                and mobility purposes. It is not intended to be a substitute
                for professional medical advice, diagnosis, or treatment.
                Always seek the advice of your physician or other qualified
                health provider with any questions you may have regarding a
                medical condition.
              </p>
              <p>
                Never disregard professional medical advice or delay in
                seeking it because of something you have read or experienced
                through this app. If you think you may have a medical
                emergency, call your doctor or emergency services immediately.
              </p>
            </div>
          </GlassAlert>
        </main>
      </div>
    </div>
  );
}
