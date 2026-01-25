'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import {
  buildAmbientContext,
  generateInsights,
  generateSmartSuggestions,
  generatePredictiveSuggestions,
  defaultInsightPreferences,
  type AmbientContext,
  type AIInsight,
  type InsightPreferences,
  type SessionData,
  type BodyRegionData,
} from '../lib/ambient-ai';

const PREFERENCES_KEY = 'ambient-ai-preferences';
const USER_CHOICES_KEY = 'ambient-ai-user-choices';
const INSIGHT_INTERACTIONS_KEY = 'ambient-ai-interactions';

// Track user choices and interactions for learning
interface UserChoice {
  insightId: string;
  insightType: AIInsight['type'];
  category: AIInsight['category'];
  action: 'clicked' | 'dismissed' | 'permanent_dismissed';
  timestamp: number;
}

interface InsightInteraction {
  insightId: string;
  viewDuration: number; // milliseconds
  actionTaken: boolean;
  timestamp: number;
}

interface UseAmbientAIOptions {
  sessions: SessionData[];
  bodyRegions: BodyRegionData[];
  location?: 'dashboard' | 'progress' | 'body' | 'history' | 'settings';
  enabled?: boolean;
}

interface UseAmbientAIReturn {
  // Context
  context: AmbientContext;

  // Insights
  insights: AIInsight[];
  smartSuggestions: AIInsight[];
  predictiveSuggestions: AIInsight[];
  allInsights: AIInsight[];

  // Daily insight for home
  dailyInsight: AIInsight | null;

  // Readiness and suggestions
  readinessScore: number;
  suggestedIntensity: 'light' | 'moderate' | 'full';
  suggestedDuration: number;

  // Actions
  dismissInsight: (insightId: string) => void;
  permanentlyDismissInsight: (dismissKey: string) => void;
  resetDismissals: () => void;
  trackInsightClick: (insight: AIInsight) => void;
  trackInsightView: (insightId: string, durationMs: number) => void;

  // Preferences
  preferences: InsightPreferences;
  updatePreferences: (updates: Partial<InsightPreferences>) => void;

  // Learning data
  preferredInsightTypes: AIInsight['type'][];
  engagementScore: number;

  // State
  isLoading: boolean;
}

export function useAmbientAI({
  sessions,
  bodyRegions,
  location = 'dashboard',
  enabled = true,
}: UseAmbientAIOptions): UseAmbientAIReturn {
  const [preferences, setPreferences] = useState<InsightPreferences>(defaultInsightPreferences);
  const [userChoices, setUserChoices] = useState<UserChoice[]>([]);
  const [interactions, setInteractions] = useState<InsightInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const viewStartTimes = useRef<Map<string, number>>(new Map());

  // Load preferences and user data from localStorage
  useEffect(() => {
    try {
      const storedPrefs = localStorage.getItem(PREFERENCES_KEY);
      if (storedPrefs) {
        const parsed = JSON.parse(storedPrefs);
        setPreferences({
          ...defaultInsightPreferences,
          ...parsed,
        });
      }

      const storedChoices = localStorage.getItem(USER_CHOICES_KEY);
      if (storedChoices) {
        setUserChoices(JSON.parse(storedChoices));
      }

      const storedInteractions = localStorage.getItem(INSIGHT_INTERACTIONS_KEY);
      if (storedInteractions) {
        setInteractions(JSON.parse(storedInteractions));
      }
    } catch (error) {
      console.warn('Failed to load ambient AI data:', error);
    }
    setIsLoading(false);
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
      } catch (error) {
        console.warn('Failed to save ambient AI preferences:', error);
      }
    }
  }, [preferences, isLoading]);

  // Save user choices to localStorage (limit to last 100)
  useEffect(() => {
    if (!isLoading && userChoices.length > 0) {
      try {
        const limitedChoices = userChoices.slice(-100);
        localStorage.setItem(USER_CHOICES_KEY, JSON.stringify(limitedChoices));
      } catch (error) {
        console.warn('Failed to save user choices:', error);
      }
    }
  }, [userChoices, isLoading]);

  // Save interactions to localStorage (limit to last 50)
  useEffect(() => {
    if (!isLoading && interactions.length > 0) {
      try {
        const limitedInteractions = interactions.slice(-50);
        localStorage.setItem(INSIGHT_INTERACTIONS_KEY, JSON.stringify(limitedInteractions));
      } catch (error) {
        console.warn('Failed to save interactions:', error);
      }
    }
  }, [interactions, isLoading]);

  // Build ambient context
  const context = useMemo(() => {
    if (!enabled) {
      return buildAmbientContext([], []);
    }
    return buildAmbientContext(sessions, bodyRegions);
  }, [sessions, bodyRegions, enabled]);

  // Calculate preferred insight types based on user choices
  const preferredInsightTypes = useMemo(() => {
    const clickedTypes = userChoices
      .filter((c) => c.action === 'clicked')
      .map((c) => c.insightType);

    const typeCounts = new Map<AIInsight['type'], number>();
    clickedTypes.forEach((type) => {
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    });

    return Array.from(typeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type);
  }, [userChoices]);

  // Calculate engagement score (0-100)
  const engagementScore = useMemo(() => {
    if (interactions.length === 0) return 50;

    const recentInteractions = interactions.filter(
      (i) => Date.now() - i.timestamp < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    );

    if (recentInteractions.length === 0) return 50;

    const avgViewDuration = recentInteractions.reduce((acc, i) => acc + i.viewDuration, 0) / recentInteractions.length;
    const actionRate = recentInteractions.filter((i) => i.actionTaken).length / recentInteractions.length;

    // Score based on view duration (up to 50) and action rate (up to 50)
    const durationScore = Math.min(50, (avgViewDuration / 5000) * 50); // 5 seconds = max
    const actionScore = actionRate * 50;

    return Math.round(durationScore + actionScore);
  }, [interactions]);

  // Generate main insights with preference boosting
  const insights = useMemo(() => {
    if (!enabled || isLoading) return [];
    const baseInsights = generateInsights(context, preferences);

    // Boost insights of preferred types
    if (preferredInsightTypes.length > 0) {
      return baseInsights.sort((a, b) => {
        const aPreferred = preferredInsightTypes.includes(a.type) ? 1 : 0;
        const bPreferred = preferredInsightTypes.includes(b.type) ? 1 : 0;
        if (aPreferred !== bPreferred) return bPreferred - aPreferred;

        // Secondary sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    }

    return baseInsights;
  }, [context, preferences, enabled, isLoading, preferredInsightTypes]);

  // Generate location-specific smart suggestions
  const smartSuggestions = useMemo(() => {
    if (!enabled || isLoading) return [];
    return generateSmartSuggestions(context, location);
  }, [context, location, enabled, isLoading]);

  // Generate predictive suggestions
  const predictiveSuggestions = useMemo(() => {
    if (!enabled || isLoading) return [];
    return generatePredictiveSuggestions(context, sessions);
  }, [context, sessions, enabled, isLoading]);

  // Combine all unique insights
  const allInsights = useMemo(() => {
    const all = [...insights, ...smartSuggestions, ...predictiveSuggestions];
    const seen = new Set<string>();
    return all.filter((insight) => {
      if (seen.has(insight.id)) return false;
      seen.add(insight.id);
      return !preferences.dismissedInsights.includes(insight.id);
    });
  }, [insights, smartSuggestions, predictiveSuggestions, preferences.dismissedInsights]);

  // Get the most important daily insight for home
  const dailyInsight = useMemo(() => {
    if (!enabled || isLoading || allInsights.length === 0) return null;

    // Prioritize celebration or high-priority insights
    const celebration = allInsights.find((i) => i.type === 'celebration');
    if (celebration) return celebration;

    const highPriority = allInsights.find((i) => i.priority === 'high');
    if (highPriority) return highPriority;

    // Otherwise return the first insight that matches user preferences
    const preferred = allInsights.find((i) => preferredInsightTypes.includes(i.type));
    if (preferred) return preferred;

    return allInsights[0];
  }, [allInsights, enabled, isLoading, preferredInsightTypes]);

  // Dismiss an insight (temporary)
  const dismissInsight = useCallback((insightId: string) => {
    setPreferences((prev) => ({
      ...prev,
      dismissedInsights: [...prev.dismissedInsights, insightId],
    }));

    // Track the dismissal
    const insight = allInsights.find((i) => i.id === insightId);
    if (insight) {
      setUserChoices((prev) => [
        ...prev,
        {
          insightId,
          insightType: insight.type,
          category: insight.category,
          action: 'dismissed',
          timestamp: Date.now(),
        },
      ]);
    }
  }, [allInsights]);

  // Permanently dismiss an insight
  const permanentlyDismissInsight = useCallback((dismissKey: string) => {
    setPreferences((prev) => ({
      ...prev,
      permanentlyDismissedKeys: [...(prev.permanentlyDismissedKeys || []), dismissKey],
    }));

    // Track the permanent dismissal
    const insight = allInsights.find((i) => i.dismissKey === dismissKey);
    if (insight) {
      setUserChoices((prev) => [
        ...prev,
        {
          insightId: insight.id,
          insightType: insight.type,
          category: insight.category,
          action: 'permanent_dismissed',
          timestamp: Date.now(),
        },
      ]);
    }
  }, [allInsights]);

  // Reset all dismissals
  const resetDismissals = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      dismissedInsights: [],
      permanentlyDismissedKeys: [],
    }));
  }, []);

  // Track when user clicks an insight action
  const trackInsightClick = useCallback((insight: AIInsight) => {
    setUserChoices((prev) => [
      ...prev,
      {
        insightId: insight.id,
        insightType: insight.type,
        category: insight.category,
        action: 'clicked',
        timestamp: Date.now(),
      },
    ]);

    // Also record interaction with action taken
    const viewStart = viewStartTimes.current.get(insight.id);
    if (viewStart) {
      setInteractions((prev) => [
        ...prev,
        {
          insightId: insight.id,
          viewDuration: Date.now() - viewStart,
          actionTaken: true,
          timestamp: Date.now(),
        },
      ]);
      viewStartTimes.current.delete(insight.id);
    }
  }, []);

  // Track insight view duration
  const trackInsightView = useCallback((insightId: string, durationMs: number) => {
    setInteractions((prev) => [
      ...prev,
      {
        insightId,
        viewDuration: durationMs,
        actionTaken: false,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  // Update preferences
  const updatePreferences = useCallback((updates: Partial<InsightPreferences>) => {
    setPreferences((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  return {
    context,
    insights,
    smartSuggestions,
    predictiveSuggestions,
    allInsights,
    dailyInsight,
    readinessScore: context.predictedReadiness,
    suggestedIntensity: context.suggestedIntensity,
    suggestedDuration: context.suggestedDuration,
    dismissInsight,
    permanentlyDismissInsight,
    resetDismissals,
    trackInsightClick,
    trackInsightView,
    preferences,
    updatePreferences,
    preferredInsightTypes,
    engagementScore,
    isLoading,
  };
}

// Hook for getting a contextual, personalized greeting
export function useAmbientGreeting(
  userName?: string,
  context?: Partial<AmbientContext>
): { greeting: string; subtext: string } {
  const [result, setResult] = useState({ greeting: '', subtext: '' });

  useEffect(() => {
    const hour = new Date().getHours();
    const firstName = userName?.split(' ')[0];
    const name = firstName ? `, ${firstName}` : '';
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    let greeting = '';
    let subtext = '';

    // Base greeting based on time
    if (hour >= 5 && hour < 12) {
      greeting = `Good morning${name}`;
      subtext = "Let's start your day right";
    } else if (hour >= 12 && hour < 17) {
      greeting = `Good afternoon${name}`;
      subtext = 'A great time for recovery work';
    } else if (hour >= 17 && hour < 21) {
      greeting = `Good evening${name}`;
      subtext = 'Wind down with some gentle movement';
    } else {
      greeting = `Welcome back${name}`;
      subtext = "It's always a good time to focus on yourself";
    }

    // Enhance subtext based on context
    if (context) {
      if (context.sessionStreak && context.sessionStreak >= 7) {
        subtext = `${context.sessionStreak} days strong! Keep the momentum`;
      } else if (context.sessionStreak && context.sessionStreak >= 3) {
        subtext = `${context.sessionStreak}-day streak! You're building a great habit`;
      } else if (context.daysSinceLastSession && context.daysSinceLastSession >= 3) {
        subtext = "Welcome back! Let's ease into it";
      } else if (context.painTrend === 'improving') {
        subtext = 'Your recovery is progressing well';
      } else if (context.painTrend === 'worsening') {
        subtext = "Let's focus on gentle recovery today";
      } else if (context.predictedReadiness && context.predictedReadiness >= 80) {
        subtext = "You're ready for a productive session";
      } else if (context.peakMotivationDays?.includes(dayOfWeek)) {
        subtext = `${dayOfWeek}s are your power days!`;
      }
    }

    setResult({ greeting, subtext });
  }, [userName, context]);

  return result;
}

// Hook for tracking if user has seen onboarding insights
export function useAmbientOnboarding(): {
  hasSeenOnboarding: boolean;
  markOnboardingComplete: () => void;
} {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem('ambient-ai-onboarding');
    setHasSeenOnboarding(seen === 'true');
  }, []);

  const markOnboardingComplete = useCallback(() => {
    localStorage.setItem('ambient-ai-onboarding', 'true');
    setHasSeenOnboarding(true);
  }, []);

  return { hasSeenOnboarding, markOnboardingComplete };
}

// Hook for getting readiness-based suggestions
export function useReadinessInsight(context: AmbientContext | null): {
  readinessLabel: string;
  readinessColor: 'success' | 'warning' | 'error' | 'info';
  suggestion: string;
  icon: 'check' | 'alert' | 'rest' | 'go';
} {
  return useMemo(() => {
    if (!context) {
      return {
        readinessLabel: 'Unknown',
        readinessColor: 'info' as const,
        suggestion: 'Start a session to build your profile',
        icon: 'go' as const,
      };
    }

    const readiness = context.predictedReadiness;

    if (readiness >= 80) {
      return {
        readinessLabel: 'Optimal',
        readinessColor: 'success' as const,
        suggestion: `Great day for a ${context.suggestedIntensity} ${context.suggestedDuration}-min session`,
        icon: 'go' as const,
      };
    } else if (readiness >= 60) {
      return {
        readinessLabel: 'Good',
        readinessColor: 'success' as const,
        suggestion: 'Ready for a moderate session',
        icon: 'check' as const,
      };
    } else if (readiness >= 40) {
      return {
        readinessLabel: 'Fair',
        readinessColor: 'warning' as const,
        suggestion: 'Consider a lighter session today',
        icon: 'alert' as const,
      };
    } else {
      return {
        readinessLabel: 'Rest',
        readinessColor: 'error' as const,
        suggestion: 'Your body might benefit from rest',
        icon: 'rest' as const,
      };
    }
  }, [context]);
}

// Hook for exercise suggestions based on body regions
export function useExerciseSuggestions(
  bodyRegions: BodyRegionData[],
  maxSuggestions: number = 3
): Array<{ region: string; suggestion: string; priority: 'high' | 'medium' | 'low' }> {
  return useMemo(() => {
    // Sort regions by pain level (highest first)
    const sortedRegions = [...bodyRegions]
      .filter((r) => r.painLevel > 0)
      .sort((a, b) => b.painLevel - a.painLevel);

    return sortedRegions.slice(0, maxSuggestions).map((region) => {
      let suggestion = '';
      let priority: 'high' | 'medium' | 'low' = 'medium';

      if (region.painLevel >= 7) {
        suggestion = `Gentle stretches and mobility for ${region.name.toLowerCase()}`;
        priority = 'high';
      } else if (region.painLevel >= 4) {
        suggestion = `Light strengthening for ${region.name.toLowerCase()}`;
        priority = 'medium';
      } else {
        suggestion = `Maintenance exercises for ${region.name.toLowerCase()}`;
        priority = 'low';
      }

      return { region: region.name, suggestion, priority };
    });
  }, [bodyRegions, maxSuggestions]);
}

// Hook for pattern-based insights
export function usePatternInsights(context: AmbientContext | null): string[] {
  return useMemo(() => {
    if (!context) return [];

    const insights: string[] = [];

    if (context.bestTimeForRecovery !== 'unknown') {
      insights.push(`Your ${context.bestTimeForRecovery} sessions are most effective`);
    }

    if (context.restDayImpact === 'positive') {
      insights.push('You recover better after rest days');
    }

    if (context.peakMotivationDays.length > 0) {
      insights.push(`${context.peakMotivationDays.join(' and ')} are your strongest days`);
    }

    if (context.skippedDaysPattern.length > 0) {
      insights.push(`${context.skippedDaysPattern[0]}s are often challenging for consistency`);
    }

    if (context.recoveryVelocity === 'fast') {
      insights.push('Your recovery pace is above average');
    }

    if (context.mostImprovedRegion) {
      insights.push(`Your ${context.mostImprovedRegion.toLowerCase()} has improved most`);
    }

    return insights.slice(0, 4);
  }, [context]);
}

export default useAmbientAI;
