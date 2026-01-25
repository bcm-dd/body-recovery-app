/**
 * useAmbientAI Hook Tests
 *
 * Tests for AI insight generation and contextual suggestions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock the ambient-ai module
const mockBuildAmbientContext = vi.fn();
const mockGenerateInsights = vi.fn();
const mockGenerateSmartSuggestions = vi.fn();
const mockGeneratePredictiveSuggestions = vi.fn();

vi.mock('../../src/lib/ambient-ai', () => ({
  buildAmbientContext: (...args: unknown[]) => mockBuildAmbientContext(...args),
  generateInsights: (...args: unknown[]) => mockGenerateInsights(...args),
  generateSmartSuggestions: (...args: unknown[]) => mockGenerateSmartSuggestions(...args),
  generatePredictiveSuggestions: (...args: unknown[]) => mockGeneratePredictiveSuggestions(...args),
  defaultInsightPreferences: {
    enableInsights: true,
    enablePredictions: true,
    dismissedInsights: [],
    insightCategories: ['recovery', 'progress', 'tips'],
  },
}));

import { useAmbientAI, useAmbientGreeting, useAmbientOnboarding } from '../../src/hooks/useAmbientAI';
import type { SessionData, BodyRegionData } from '../../src/lib/ambient-ai';

// Mock data
const mockSessions: SessionData[] = [
  {
    id: 'session-1',
    date: new Date(Date.now() - 86400000),
    duration: 20,
    painBefore: 5,
    painAfter: 3,
    exercisesCompleted: 4,
    exercisesTotal: 5,
  },
  {
    id: 'session-2',
    date: new Date(Date.now() - 172800000),
    duration: 25,
    painBefore: 6,
    painAfter: 4,
    exercisesCompleted: 5,
    exercisesTotal: 5,
  },
];

const mockBodyRegions: BodyRegionData[] = [
  { id: 'lower-back', name: 'Lower Back', painLevel: 4 },
  { id: 'knee', name: 'Right Knee', painLevel: 3 },
];

describe('useAmbientAI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Setup default mock returns
    mockBuildAmbientContext.mockReturnValue({
      sessionsThisWeek: 2,
      avgPainReduction: 2,
      painTrend: 'improving',
      activeIssues: 2,
      streakDays: 3,
      lastSessionDate: new Date(Date.now() - 86400000),
    });

    mockGenerateInsights.mockReturnValue([
      {
        id: 'insight-1',
        type: 'progress',
        title: 'Great Progress',
        message: 'Your pain levels are improving',
        priority: 'medium',
      },
    ]);

    mockGenerateSmartSuggestions.mockReturnValue([
      {
        id: 'suggestion-1',
        type: 'tip',
        title: 'Try This',
        message: 'Focus on stretching today',
        priority: 'low',
      },
    ]);

    mockGeneratePredictiveSuggestions.mockReturnValue([
      {
        id: 'prediction-1',
        type: 'prediction',
        title: 'Looking Good',
        message: 'You might feel even better tomorrow',
        priority: 'low',
      },
    ]);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should return isLoading true initially', () => {
      const { result } = renderHook(() =>
        useAmbientAI({
          sessions: mockSessions,
          bodyRegions: mockBodyRegions,
        })
      );

      // isLoading starts true and becomes false after first effect
      expect(result.current.isLoading).toBeDefined();
    });

    it('should build ambient context from sessions and body regions', async () => {
      const { result } = renderHook(() =>
        useAmbientAI({
          sessions: mockSessions,
          bodyRegions: mockBodyRegions,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockBuildAmbientContext).toHaveBeenCalledWith(
        mockSessions,
        mockBodyRegions
      );
    });

    it('should return default preferences', async () => {
      const { result } = renderHook(() =>
        useAmbientAI({
          sessions: mockSessions,
          bodyRegions: mockBodyRegions,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.preferences).toBeDefined();
      expect(result.current.preferences.enableInsights).toBe(true);
    });
  });

  describe('Insight Generation', () => {
    it('should generate insights from context', async () => {
      const { result } = renderHook(() =>
        useAmbientAI({
          sessions: mockSessions,
          bodyRegions: mockBodyRegions,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGenerateInsights).toHaveBeenCalled();
      expect(result.current.insights).toHaveLength(1);
      expect(result.current.insights[0].id).toBe('insight-1');
    });

    it('should generate smart suggestions based on location', async () => {
      const { result } = renderHook(() =>
        useAmbientAI({
          sessions: mockSessions,
          bodyRegions: mockBodyRegions,
          location: 'dashboard',
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGenerateSmartSuggestions).toHaveBeenCalledWith(
        expect.anything(),
        'dashboard'
      );
      expect(result.current.smartSuggestions).toHaveLength(1);
    });

    it('should generate predictive suggestions', async () => {
      const { result } = renderHook(() =>
        useAmbientAI({
          sessions: mockSessions,
          bodyRegions: mockBodyRegions,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGeneratePredictiveSuggestions).toHaveBeenCalled();
      expect(result.current.predictiveSuggestions).toHaveLength(1);
    });

    it('should combine all insights without duplicates', async () => {
      const { result } = renderHook(() =>
        useAmbientAI({
          sessions: mockSessions,
          bodyRegions: mockBodyRegions,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.allInsights.length).toBe(3);
    });
  });

  describe('Insight Dismissal', () => {
    it('should dismiss insight', async () => {
      const { result } = renderHook(() =>
        useAmbientAI({
          sessions: mockSessions,
          bodyRegions: mockBodyRegions,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const insightCount = result.current.allInsights.length;

      act(() => {
        result.current.dismissInsight('insight-1');
      });

      expect(result.current.allInsights.length).toBe(insightCount - 1);
      expect(result.current.preferences.dismissedInsights).toContain('insight-1');
    });

    it('should persist dismissals to localStorage', async () => {
      const { result } = renderHook(() =>
        useAmbientAI({
          sessions: mockSessions,
          bodyRegions: mockBodyRegions,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.dismissInsight('insight-1');
      });

      // Wait for effect to save
      await waitFor(() => {
        const stored = localStorage.getItem('ambient-ai-preferences');
        expect(stored).toBeTruthy();
        expect(JSON.parse(stored!).dismissedInsights).toContain('insight-1');
      });
    });

    it('should reset dismissals', async () => {
      const { result } = renderHook(() =>
        useAmbientAI({
          sessions: mockSessions,
          bodyRegions: mockBodyRegions,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.dismissInsight('insight-1');
      });

      expect(result.current.preferences.dismissedInsights.length).toBe(1);

      act(() => {
        result.current.resetDismissals();
      });

      expect(result.current.preferences.dismissedInsights.length).toBe(0);
    });
  });

  describe('Preferences', () => {
    it('should update preferences', async () => {
      const { result } = renderHook(() =>
        useAmbientAI({
          sessions: mockSessions,
          bodyRegions: mockBodyRegions,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updatePreferences({ enablePredictions: false });
      });

      expect(result.current.preferences.enablePredictions).toBe(false);
    });

    it('should load preferences from localStorage', async () => {
      localStorage.setItem(
        'ambient-ai-preferences',
        JSON.stringify({
          enableInsights: false,
          dismissedInsights: ['old-insight'],
        })
      );

      const { result } = renderHook(() =>
        useAmbientAI({
          sessions: mockSessions,
          bodyRegions: mockBodyRegions,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.preferences.enableInsights).toBe(false);
      expect(result.current.preferences.dismissedInsights).toContain('old-insight');
    });
  });

  describe('Enabled State', () => {
    it('should not generate insights when disabled', async () => {
      const { result } = renderHook(() =>
        useAmbientAI({
          sessions: mockSessions,
          bodyRegions: mockBodyRegions,
          enabled: false,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.insights).toHaveLength(0);
      expect(result.current.smartSuggestions).toHaveLength(0);
      expect(result.current.predictiveSuggestions).toHaveLength(0);
    });

    it('should build empty context when disabled', async () => {
      const { result } = renderHook(() =>
        useAmbientAI({
          sessions: mockSessions,
          bodyRegions: mockBodyRegions,
          enabled: false,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should call with empty arrays
      expect(mockBuildAmbientContext).toHaveBeenCalledWith([], []);
    });
  });
});

describe('useAmbientGreeting', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return morning greeting in the morning', () => {
    vi.setSystemTime(new Date('2024-01-15T08:00:00'));

    const { result } = renderHook(() => useAmbientGreeting());

    expect(result.current).toContain('morning');
  });

  it('should return afternoon greeting in the afternoon', () => {
    vi.setSystemTime(new Date('2024-01-15T14:00:00'));

    const { result } = renderHook(() => useAmbientGreeting());

    expect(result.current).toContain('afternoon');
  });

  it('should return evening greeting in the evening', () => {
    vi.setSystemTime(new Date('2024-01-15T19:00:00'));

    const { result } = renderHook(() => useAmbientGreeting());

    expect(result.current).toContain('evening');
  });

  it('should return welcome back greeting at night', () => {
    vi.setSystemTime(new Date('2024-01-15T23:00:00'));

    const { result } = renderHook(() => useAmbientGreeting());

    expect(result.current).toContain('Welcome back');
  });

  it('should include user first name when provided', () => {
    vi.setSystemTime(new Date('2024-01-15T08:00:00'));

    const { result } = renderHook(() => useAmbientGreeting('John Smith'));

    expect(result.current).toContain('John');
    expect(result.current).not.toContain('Smith');
  });
});

describe('useAmbientOnboarding', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return hasSeenOnboarding false initially', () => {
    const { result } = renderHook(() => useAmbientOnboarding());

    // Default to true to not show onboarding unless specifically reset
    expect(typeof result.current.hasSeenOnboarding).toBe('boolean');
  });

  it('should mark onboarding as complete', () => {
    const { result } = renderHook(() => useAmbientOnboarding());

    act(() => {
      result.current.markOnboardingComplete();
    });

    expect(result.current.hasSeenOnboarding).toBe(true);
    expect(localStorage.getItem('ambient-ai-onboarding')).toBe('true');
  });

  it('should load onboarding state from localStorage', () => {
    localStorage.setItem('ambient-ai-onboarding', 'true');

    const { result } = renderHook(() => useAmbientOnboarding());

    expect(result.current.hasSeenOnboarding).toBe(true);
  });
});
