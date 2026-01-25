/**
 * Ambient AI System
 *
 * Provides intelligent, contextual insights that feel like a knowledgeable companion.
 * The AI anticipates needs without being intrusive or over-explaining.
 *
 * Design Principles:
 * - Speak up only when there's something valuable to add
 * - Be helpful and present but never annoying
 * - Feel like a knowledgeable coach who respects the user's time
 * - Celebrate achievements without being cheesy
 * - Warn gently without creating anxiety
 */

// Types for the ambient context system
export interface AmbientContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
  isWeekend: boolean;
  recentActivity: string[];
  painTrend: 'improving' | 'stable' | 'worsening';
  sessionStreak: number;
  lastCheckIn: Date | null;
  daysSinceLastSession: number;
  averagePainLevel: number;
  highestPainRegion: string | null;
  totalSessionsThisWeek: number;
  completionRate: number;
  // Pattern recognition
  preferredSessionTime: number | null; // Hour of day user usually exercises
  typicalSessionDuration: number;
  consistencyScore: number; // 0-100 based on regularity
  // Weather simulation (would be real API in production)
  weather: 'cold' | 'mild' | 'warm' | 'hot';
  // User engagement
  lastBodyMapUpdate: Date | null;
  daysSinceBodyMapUpdate: number;
  regionsNotUpdatedRecently: string[];
  // Advanced pattern recognition
  morningSessionEffectiveness: number; // 0-100 - how effective morning sessions are
  eveningSessionEffectiveness: number; // 0-100 - how effective evening sessions are
  bestTimeForRecovery: 'morning' | 'afternoon' | 'evening' | 'unknown';
  restDayImpact: 'positive' | 'neutral' | 'negative'; // How rest days affect recovery
  weeklyPainReduction: number; // Average pain reduction per week
  mostImprovedRegion: string | null;
  persistentPainRegion: string | null; // Region with consistent pain
  sessionIntensityTrend: 'increasing' | 'stable' | 'decreasing';
  recoveryVelocity: 'fast' | 'moderate' | 'slow'; // How quickly user recovers
  // Predictive data
  predictedReadiness: number; // 0-100 readiness score for today
  suggestedIntensity: 'light' | 'moderate' | 'full';
  suggestedDuration: number;
  optimalNextSessionTime: number | null; // Suggested hour for next session
  // Behavioral patterns
  skippedDaysPattern: string[]; // Days of week often skipped
  peakMotivationDays: string[]; // Days with highest engagement
  sessionCompletionByTimeOfDay: Record<string, number>; // Completion rates by time
}

export interface AIInsight {
  id: string;
  type: 'tip' | 'suggestion' | 'observation' | 'encouragement' | 'celebration' | 'warning';
  message: string;
  action?: { label: string; href: string };
  priority: 'low' | 'medium' | 'high';
  dismissible: boolean;
  category: 'greeting' | 'progress' | 'pain' | 'streak' | 'time' | 'rest' | 'exercise' | 'celebration' | 'tip' | 'weather' | 'pattern';
  // For "Don't show again" functionality
  permanentDismissable?: boolean;
  dismissKey?: string; // Unique key for permanent dismissal (without date)
}

export interface SessionData {
  id: string;
  date: Date;
  duration: number;
  exercises: { setsCompleted: number; setsTarget: number }[];
  painBefore: number;
  painAfter: number;
}

export interface BodyRegionData {
  id: string;
  name: string;
  painLevel: number;
  lastUpdated: Date;
}

export interface InsightPreferences {
  dismissedInsights: string[];
  permanentlyDismissedKeys: string[]; // For "Don't show again"
  preferredCategories: string[];
  lastSeenTimestamp: Date | null;
  maxVisibleInsights: number;
  // User preferences
  enableGreetings: boolean;
  enableCelebrations: boolean;
  enableTips: boolean;
  enableWarnings: boolean;
  enablePatternSuggestions: boolean;
  insightFrequency: 'minimal' | 'balanced' | 'frequent';
}

// Smart question types for chat interface
export interface SmartQuestion {
  id: string;
  question: string;
  category: 'explanation' | 'guidance' | 'progress' | 'planning';
  context?: string; // When this question is most relevant
}

// Mock AI response for MVP
export interface AIResponse {
  questionId: string;
  response: string;
  followUpActions?: { label: string; href: string }[];
}

// Helper functions
function getTimeOfDay(): AmbientContext['timeOfDay'] {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function getDayOfWeek(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' });
}

function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

// Simulated weather (would be real API in production)
function getSimulatedWeather(): AmbientContext['weather'] {
  const month = new Date().getMonth();
  // Northern hemisphere approximation
  if (month >= 11 || month <= 2) return 'cold';
  if (month >= 3 && month <= 4) return 'mild';
  if (month >= 5 && month <= 8) return 'warm';
  return 'mild';
}

// Pattern recognition for session times
function calculatePreferredSessionTime(sessions: SessionData[]): number | null {
  if (sessions.length < 3) return null;

  const recentSessions = sessions.slice(0, 14);
  const hours = recentSessions.map((s) => new Date(s.date).getHours());

  // Find most common hour (mode)
  const hourCounts = new Map<number, number>();
  hours.forEach((h) => {
    hourCounts.set(h, (hourCounts.get(h) || 0) + 1);
  });

  let maxCount = 0;
  let preferredHour: number | null = null;

  hourCounts.forEach((count, hour) => {
    if (count >= 3 && count > maxCount) {
      maxCount = count;
      preferredHour = hour;
    }
  });

  return preferredHour;
}

function calculateTypicalSessionDuration(sessions: SessionData[]): number {
  if (sessions.length === 0) return 15; // Default

  const recentSessions = sessions.slice(0, 10);
  const avgDuration = recentSessions.reduce((acc, s) => acc + s.duration, 0) / recentSessions.length;

  return Math.round(avgDuration);
}

function calculateConsistencyScore(sessions: SessionData[]): number {
  if (sessions.length === 0) return 0;

  // Look at the last 14 days
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const recentSessions = sessions.filter((s) => new Date(s.date) >= twoWeeksAgo);

  // Count days with sessions
  const daysWithSessions = new Set<string>();
  recentSessions.forEach((s) => {
    const dateStr = new Date(s.date).toISOString().split('T')[0];
    daysWithSessions.add(dateStr);
  });

  // Score: percentage of days with sessions, weighted by recency
  const rawScore = (daysWithSessions.size / 14) * 100;

  // Bonus for streaks
  const streakBonus = Math.min(calculateSessionStreak(sessions) * 2, 20);

  return Math.min(Math.round(rawScore + streakBonus), 100);
}

function getRegionsNotUpdatedRecently(bodyRegions: BodyRegionData[]): string[] {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  return bodyRegions
    .filter((r) => r.painLevel > 0 && new Date(r.lastUpdated) < threeDaysAgo)
    .map((r) => r.name);
}

// Calculate session effectiveness by time of day
function calculateTimeOfDayEffectiveness(
  sessions: SessionData[],
  timeRange: 'morning' | 'evening'
): number {
  const filteredSessions = sessions.filter((s) => {
    const hour = new Date(s.date).getHours();
    if (timeRange === 'morning') return hour >= 5 && hour < 12;
    return hour >= 17 && hour < 22;
  });

  if (filteredSessions.length < 3) return 50; // Not enough data

  const avgPainReduction = filteredSessions.reduce(
    (acc, s) => acc + (s.painBefore - s.painAfter),
    0
  ) / filteredSessions.length;

  const avgCompletion = filteredSessions.reduce((acc, s) => {
    const completed = s.exercises.filter((e) => e.setsCompleted >= e.setsTarget).length;
    return acc + (completed / s.exercises.length) * 100;
  }, 0) / filteredSessions.length;

  // Score based on pain reduction and completion
  return Math.min(100, Math.max(0, (avgPainReduction * 15 + avgCompletion) / 2));
}

// Determine best time for recovery
function determineBestTimeForRecovery(sessions: SessionData[]): 'morning' | 'afternoon' | 'evening' | 'unknown' {
  if (sessions.length < 5) return 'unknown';

  const timeSlots = {
    morning: { painReduction: 0, count: 0 },
    afternoon: { painReduction: 0, count: 0 },
    evening: { painReduction: 0, count: 0 },
  };

  sessions.forEach((s) => {
    const hour = new Date(s.date).getHours();
    const reduction = s.painBefore - s.painAfter;

    if (hour >= 5 && hour < 12) {
      timeSlots.morning.painReduction += reduction;
      timeSlots.morning.count++;
    } else if (hour >= 12 && hour < 17) {
      timeSlots.afternoon.painReduction += reduction;
      timeSlots.afternoon.count++;
    } else if (hour >= 17 && hour < 22) {
      timeSlots.evening.painReduction += reduction;
      timeSlots.evening.count++;
    }
  });

  // Calculate averages
  const avgReductions = {
    morning: timeSlots.morning.count > 2 ? timeSlots.morning.painReduction / timeSlots.morning.count : -1,
    afternoon: timeSlots.afternoon.count > 2 ? timeSlots.afternoon.painReduction / timeSlots.afternoon.count : -1,
    evening: timeSlots.evening.count > 2 ? timeSlots.evening.painReduction / timeSlots.evening.count : -1,
  };

  const best = Object.entries(avgReductions).reduce((a, b) => (b[1] > a[1] ? b : a));

  if (best[1] <= 0) return 'unknown';
  return best[0] as 'morning' | 'afternoon' | 'evening';
}

// Analyze rest day impact
function analyzeRestDayImpact(sessions: SessionData[]): 'positive' | 'neutral' | 'negative' {
  if (sessions.length < 7) return 'neutral';

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let afterRestBetter = 0;
  let afterRestWorse = 0;

  for (let i = 1; i < sortedSessions.length; i++) {
    const prev = sortedSessions[i - 1];
    const curr = sortedSessions[i];
    const daysBetween = Math.floor(
      (new Date(curr.date).getTime() - new Date(prev.date).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysBetween >= 2) {
      // Had a rest day
      if (curr.painAfter < prev.painAfter) {
        afterRestBetter++;
      } else if (curr.painAfter > prev.painAfter) {
        afterRestWorse++;
      }
    }
  }

  if (afterRestBetter > afterRestWorse + 2) return 'positive';
  if (afterRestWorse > afterRestBetter + 2) return 'negative';
  return 'neutral';
}

// Calculate weekly pain reduction rate
function calculateWeeklyPainReduction(sessions: SessionData[]): number {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const lastWeekSessions = sessions.filter(
    (s) => new Date(s.date) >= oneWeekAgo
  );
  const prevWeekSessions = sessions.filter(
    (s) => new Date(s.date) >= twoWeeksAgo && new Date(s.date) < oneWeekAgo
  );

  if (lastWeekSessions.length === 0 || prevWeekSessions.length === 0) return 0;

  const lastWeekAvg =
    lastWeekSessions.reduce((acc, s) => acc + s.painAfter, 0) / lastWeekSessions.length;
  const prevWeekAvg =
    prevWeekSessions.reduce((acc, s) => acc + s.painAfter, 0) / prevWeekSessions.length;

  return prevWeekAvg - lastWeekAvg;
}

// Find most improved region (would need region-specific session data in production)
function findMostImprovedRegion(bodyRegions: BodyRegionData[]): string | null {
  // In production, this would track historical pain levels per region
  // For now, we return the region with the lowest pain that had pain before
  const sortedByPain = [...bodyRegions]
    .filter((r) => r.painLevel > 0 && r.painLevel <= 3)
    .sort((a, b) => a.painLevel - b.painLevel);

  return sortedByPain.length > 0 ? sortedByPain[0].name : null;
}

// Find persistent pain region
function findPersistentPainRegion(bodyRegions: BodyRegionData[]): string | null {
  // Region with consistently high pain
  const highPainRegions = bodyRegions.filter((r) => r.painLevel >= 6);

  if (highPainRegions.length === 0) return null;

  // Return the one with highest pain
  return highPainRegions.sort((a, b) => b.painLevel - a.painLevel)[0].name;
}

// Calculate recovery velocity
function calculateRecoveryVelocity(sessions: SessionData[]): 'fast' | 'moderate' | 'slow' {
  if (sessions.length < 5) return 'moderate';

  const avgPainReduction =
    sessions.slice(0, 10).reduce((acc, s) => acc + (s.painBefore - s.painAfter), 0) /
    Math.min(10, sessions.length);

  if (avgPainReduction >= 2) return 'fast';
  if (avgPainReduction >= 0.5) return 'moderate';
  return 'slow';
}

// Calculate predicted readiness
function calculatePredictedReadiness(
  context: Partial<AmbientContext>,
  sessions: SessionData[]
): number {
  let readiness = 70; // Base readiness

  // Adjust based on rest
  if (context.daysSinceLastSession === 1) {
    readiness += 10; // Good - one day rest
  } else if (context.daysSinceLastSession === 0) {
    readiness -= 5; // Already exercised today
  } else if (context.daysSinceLastSession && context.daysSinceLastSession >= 3) {
    readiness -= 10; // Long break, might need warm-up
  }

  // Adjust based on streak
  if (context.sessionStreak && context.sessionStreak >= 5) {
    readiness -= 5; // Might need rest
  }

  // Adjust based on pain trend
  if (context.painTrend === 'improving') {
    readiness += 15;
  } else if (context.painTrend === 'worsening') {
    readiness -= 20;
  }

  // Adjust based on time of day matching preferred time
  const currentHour = new Date().getHours();
  if (context.preferredSessionTime !== null && context.preferredSessionTime !== undefined) {
    const diff = Math.abs(currentHour - context.preferredSessionTime);
    if (diff <= 1) readiness += 10; // It's their usual time
  }

  // Adjust for weekend
  if (context.isWeekend) {
    readiness += 5; // Usually more time on weekends
  }

  return Math.min(100, Math.max(0, readiness));
}

// Calculate suggested intensity based on context
function calculateSuggestedIntensity(
  context: Partial<AmbientContext>
): 'light' | 'moderate' | 'full' {
  if (context.painTrend === 'worsening' || (context.averagePainLevel && context.averagePainLevel >= 6)) {
    return 'light';
  }

  if (context.daysSinceLastSession && context.daysSinceLastSession >= 4) {
    return 'light'; // Coming back after break
  }

  if (context.sessionStreak && context.sessionStreak >= 6) {
    return 'light'; // Been very active, might need easier day
  }

  if (context.painTrend === 'improving' && context.consistencyScore && context.consistencyScore >= 70) {
    return 'full';
  }

  return 'moderate';
}

// Analyze skipped days pattern
function analyzeSkippedDaysPattern(sessions: SessionData[]): string[] {
  if (sessions.length < 14) return [];

  const dayCount: Record<string, number> = {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
  };

  sessions.slice(0, 30).forEach((s) => {
    const day = new Date(s.date).toLocaleDateString('en-US', { weekday: 'long' });
    dayCount[day]++;
  });

  const avgSessionsPerDay = sessions.slice(0, 30).length / 7;

  return Object.entries(dayCount)
    .filter(([_, count]) => count < avgSessionsPerDay * 0.3)
    .map(([day]) => day);
}

// Find peak motivation days
function findPeakMotivationDays(sessions: SessionData[]): string[] {
  if (sessions.length < 14) return [];

  const dayCount: Record<string, { count: number; completion: number }> = {
    Sunday: { count: 0, completion: 0 },
    Monday: { count: 0, completion: 0 },
    Tuesday: { count: 0, completion: 0 },
    Wednesday: { count: 0, completion: 0 },
    Thursday: { count: 0, completion: 0 },
    Friday: { count: 0, completion: 0 },
    Saturday: { count: 0, completion: 0 },
  };

  sessions.slice(0, 30).forEach((s) => {
    const day = new Date(s.date).toLocaleDateString('en-US', { weekday: 'long' });
    const completionRate = s.exercises.filter((e) => e.setsCompleted >= e.setsTarget).length / s.exercises.length;
    dayCount[day].count++;
    dayCount[day].completion += completionRate;
  });

  const avgSessionsPerDay = sessions.slice(0, 30).length / 7;

  return Object.entries(dayCount)
    .filter(([_, data]) => data.count > avgSessionsPerDay * 1.3)
    .map(([day]) => day);
}

// Calculate session completion by time of day
function calculateSessionCompletionByTimeOfDay(sessions: SessionData[]): Record<string, number> {
  const timeSlots: Record<string, { completed: number; total: number }> = {
    morning: { completed: 0, total: 0 },
    afternoon: { completed: 0, total: 0 },
    evening: { completed: 0, total: 0 },
    night: { completed: 0, total: 0 },
  };

  sessions.forEach((s) => {
    const hour = new Date(s.date).getHours();
    let slot: string;

    if (hour >= 5 && hour < 12) slot = 'morning';
    else if (hour >= 12 && hour < 17) slot = 'afternoon';
    else if (hour >= 17 && hour < 21) slot = 'evening';
    else slot = 'night';

    const completionRate = s.exercises.filter((e) => e.setsCompleted >= e.setsTarget).length / s.exercises.length;
    timeSlots[slot].completed += completionRate;
    timeSlots[slot].total++;
  });

  const result: Record<string, number> = {};
  Object.entries(timeSlots).forEach(([slot, data]) => {
    result[slot] = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
  });

  return result;
}

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

function calculatePainTrend(sessions: SessionData[]): AmbientContext['painTrend'] {
  if (sessions.length < 2) return 'stable';

  const recentSessions = sessions.slice(0, 5);
  const olderSessions = sessions.slice(5, 10);

  if (olderSessions.length === 0) return 'stable';

  const recentAvg = recentSessions.reduce((acc, s) => acc + s.painAfter, 0) / recentSessions.length;
  const olderAvg = olderSessions.reduce((acc, s) => acc + s.painAfter, 0) / olderSessions.length;

  const difference = olderAvg - recentAvg;

  if (difference > 0.5) return 'improving';
  if (difference < -0.5) return 'worsening';
  return 'stable';
}

function calculateSessionStreak(sessions: SessionData[]): number {
  if (sessions.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sort sessions by date descending
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    checkDate.setHours(0, 0, 0, 0);

    const hasSession = sortedSessions.some((s) => {
      const sessionDate = new Date(s.date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === checkDate.getTime();
    });

    if (hasSession) {
      streak++;
    } else if (i > 0) {
      // Allow for one day gap (rest day)
      const previousDayHadSession = sortedSessions.some((s) => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        const prevCheck = new Date(checkDate);
        prevCheck.setDate(prevCheck.getDate() + 1);
        return sessionDate.getTime() === prevCheck.getTime();
      });

      if (!previousDayHadSession) break;
    }
  }

  return streak;
}

function getDaysSinceLastSession(sessions: SessionData[]): number {
  if (sessions.length === 0) return -1;

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const lastSession = new Date(sortedSessions[0].date);
  const today = new Date();

  const diffTime = today.getTime() - lastSession.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

function getHighestPainRegion(regions: BodyRegionData[]): string | null {
  if (regions.length === 0) return null;

  const sorted = [...regions].sort((a, b) => b.painLevel - a.painLevel);
  if (sorted[0].painLevel === 0) return null;

  return sorted[0].name;
}

// Build ambient context from app data
export function buildAmbientContext(
  sessions: SessionData[],
  bodyRegions: BodyRegionData[]
): AmbientContext {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const sessionsThisWeek = sessions.filter((s) => new Date(s.date) >= oneWeekAgo);

  const totalExercises = sessions.reduce((acc, s) => acc + s.exercises.length, 0);
  const completedExercises = sessions.reduce(
    (acc, s) => acc + s.exercises.filter((e) => e.setsCompleted === e.setsTarget).length,
    0
  );

  // Find most recent body map update
  const sortedRegions = [...bodyRegions].sort(
    (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  );
  const lastBodyMapUpdate = sortedRegions.length > 0 ? new Date(sortedRegions[0].lastUpdated) : null;
  const daysSinceBodyMapUpdate = lastBodyMapUpdate
    ? Math.floor((Date.now() - lastBodyMapUpdate.getTime()) / (1000 * 60 * 60 * 24))
    : -1;

  // Calculate base context values first
  const painTrend = calculatePainTrend(sessions);
  const sessionStreak = calculateSessionStreak(sessions);
  const daysSinceLastSession = getDaysSinceLastSession(sessions);
  const preferredSessionTime = calculatePreferredSessionTime(sessions);
  const consistencyScore = calculateConsistencyScore(sessions);
  const averagePainLevel = bodyRegions.length > 0
    ? bodyRegions.reduce((acc, r) => acc + r.painLevel, 0) / bodyRegions.length
    : 0;

  // Build partial context for calculations that depend on other values
  const partialContext: Partial<AmbientContext> = {
    timeOfDay: getTimeOfDay(),
    isWeekend: isWeekend(),
    painTrend,
    sessionStreak,
    daysSinceLastSession,
    preferredSessionTime,
    consistencyScore,
    averagePainLevel,
  };

  // Calculate advanced pattern metrics
  const morningSessionEffectiveness = calculateTimeOfDayEffectiveness(sessions, 'morning');
  const eveningSessionEffectiveness = calculateTimeOfDayEffectiveness(sessions, 'evening');
  const bestTimeForRecovery = determineBestTimeForRecovery(sessions);
  const restDayImpact = analyzeRestDayImpact(sessions);
  const weeklyPainReduction = calculateWeeklyPainReduction(sessions);
  const recoveryVelocity = calculateRecoveryVelocity(sessions);

  // Calculate predictive values
  const predictedReadiness = calculatePredictedReadiness(partialContext, sessions);
  const suggestedIntensity = calculateSuggestedIntensity(partialContext);
  const typicalDuration = calculateTypicalSessionDuration(sessions);

  // Calculate suggested duration based on intensity and typical
  let suggestedDuration = typicalDuration;
  if (suggestedIntensity === 'light') {
    suggestedDuration = Math.max(10, Math.round(typicalDuration * 0.7));
  } else if (suggestedIntensity === 'full') {
    suggestedDuration = Math.round(typicalDuration * 1.1);
  }

  // Calculate optimal next session time
  let optimalNextSessionTime: number | null = null;
  if (bestTimeForRecovery !== 'unknown') {
    const timeMap = { morning: 8, afternoon: 14, evening: 18 };
    optimalNextSessionTime = timeMap[bestTimeForRecovery];
  } else if (preferredSessionTime !== null) {
    optimalNextSessionTime = preferredSessionTime;
  }

  // Calculate behavioral patterns
  const skippedDaysPattern = analyzeSkippedDaysPattern(sessions);
  const peakMotivationDays = findPeakMotivationDays(sessions);
  const sessionCompletionByTimeOfDay = calculateSessionCompletionByTimeOfDay(sessions);

  return {
    timeOfDay: getTimeOfDay(),
    dayOfWeek: getDayOfWeek(),
    isWeekend: isWeekend(),
    recentActivity: sessions.slice(0, 3).map((s) =>
      `Session on ${new Date(s.date).toLocaleDateString()}`
    ),
    painTrend,
    sessionStreak,
    lastCheckIn: sessions.length > 0 ? new Date(sessions[0].date) : null,
    daysSinceLastSession,
    averagePainLevel,
    highestPainRegion: getHighestPainRegion(bodyRegions),
    totalSessionsThisWeek: sessionsThisWeek.length,
    completionRate: totalExercises > 0
      ? Math.round((completedExercises / totalExercises) * 100)
      : 0,
    // Pattern recognition
    preferredSessionTime,
    typicalSessionDuration: typicalDuration,
    consistencyScore,
    // Weather (simulated)
    weather: getSimulatedWeather(),
    // Body map tracking
    lastBodyMapUpdate,
    daysSinceBodyMapUpdate,
    regionsNotUpdatedRecently: getRegionsNotUpdatedRecently(bodyRegions),
    // Advanced pattern recognition
    morningSessionEffectiveness,
    eveningSessionEffectiveness,
    bestTimeForRecovery,
    restDayImpact,
    weeklyPainReduction,
    mostImprovedRegion: findMostImprovedRegion(bodyRegions),
    persistentPainRegion: findPersistentPainRegion(bodyRegions),
    sessionIntensityTrend: weeklyPainReduction > 0.5 ? 'increasing' : weeklyPainReduction < -0.5 ? 'decreasing' : 'stable',
    recoveryVelocity,
    // Predictive data
    predictedReadiness,
    suggestedIntensity,
    suggestedDuration,
    optimalNextSessionTime,
    // Behavioral patterns
    skippedDaysPattern,
    peakMotivationDays,
    sessionCompletionByTimeOfDay,
  };
}

// Generate contextual insights based on ambient context
export function generateInsights(
  context: AmbientContext,
  preferences: InsightPreferences = defaultInsightPreferences
): AIInsight[] {
  const insights: AIInsight[] = [];

  // Helper to check if insight is permanently dismissed
  const isPermanentlyDismissed = (key: string) =>
    preferences.permanentlyDismissedKeys?.includes(key) ?? false;

  // Helper to respect frequency settings
  const shouldShowByFrequency = (priority: 'low' | 'medium' | 'high') => {
    if (preferences.insightFrequency === 'frequent') return true;
    if (preferences.insightFrequency === 'minimal') return priority === 'high';
    // balanced
    return priority !== 'low';
  };

  // Greeting insights based on time of day (if enabled)
  if (preferences.enableGreetings !== false) {
    if (context.timeOfDay === 'morning') {
      if (context.painTrend === 'improving') {
        insights.push({
          id: `morning-improving-${new Date().toDateString()}`,
          type: 'encouragement',
          message: "Good morning! Your recovery is trending well. Ready for today's session?",
          action: { label: 'Start Session', href: '/body' },
          priority: 'medium',
          dismissible: true,
          category: 'greeting',
          dismissKey: 'morning-improving',
        });
      } else if (context.painTrend === 'worsening') {
        insights.push({
          id: `morning-gentle-${new Date().toDateString()}`,
          type: 'suggestion',
          message: "Good morning. Consider a lighter session today to help your body recover.",
          action: { label: 'View Gentle Exercises', href: '/body' },
          priority: 'medium',
          dismissible: true,
          category: 'greeting',
          dismissKey: 'morning-gentle',
        });
      } else {
        insights.push({
          id: `morning-neutral-${new Date().toDateString()}`,
          type: 'suggestion',
          message: "Good morning! A consistent routine helps build lasting recovery habits.",
          priority: 'low',
          dismissible: true,
          category: 'greeting',
          dismissKey: 'morning-neutral',
        });
      }
    } else if (context.timeOfDay === 'evening' && !isPermanentlyDismissed('evening-session')) {
      insights.push({
        id: `evening-session-${new Date().toDateString()}`,
        type: 'tip',
        message: "Evening sessions can help some people sleep better and reduce morning stiffness.",
        priority: 'low',
        dismissible: true,
        category: 'time',
        permanentDismissable: true,
        dismissKey: 'evening-session',
      });
    }
  }

  // Missed days / welcome back
  if (context.daysSinceLastSession >= 3 && context.daysSinceLastSession < 7) {
    insights.push({
      id: 'welcome-back-short',
      type: 'suggestion',
      message: "Welcome back. Let's start gentle today and build from there.",
      action: { label: 'Start Gentle Session', href: '/body' },
      priority: 'high',
      dismissible: true,
      category: 'rest',
    });
  } else if (context.daysSinceLastSession >= 7) {
    insights.push({
      id: 'welcome-back-long',
      type: 'encouragement',
      message: "Great to see you again! Every return is a step forward. Let's take it easy.",
      action: { label: 'Restart Gently', href: '/body' },
      priority: 'high',
      dismissible: true,
      category: 'rest',
    });
  }

  // Pain trend insights
  if (context.painTrend === 'worsening') {
    insights.push({
      id: 'pain-worsening',
      type: 'warning',
      message: "I noticed increased discomfort lately. Consider a lighter session or rest day.",
      action: { label: 'View Pain History', href: '/progress' },
      priority: 'high',
      dismissible: true,
      category: 'pain',
    });
  } else if (context.painTrend === 'improving' && context.sessionStreak >= 3) {
    insights.push({
      id: 'pain-improving',
      type: 'encouragement',
      message: "Your pain levels have been decreasing. Your consistency is paying off!",
      priority: 'medium',
      dismissible: true,
      category: 'pain',
    });
  }

  // Streak milestones (celebrations if enabled)
  if (preferences.enableCelebrations !== false) {
    if (context.sessionStreak === 3) {
      insights.push({
        id: `streak-3-${new Date().toDateString()}`,
        type: 'celebration',
        message: "3 sessions in a row! You're building a great habit.",
        priority: 'medium',
        dismissible: true,
        category: 'celebration',
        dismissKey: 'streak-3',
      });
    } else if (context.sessionStreak === 5) {
      insights.push({
        id: `streak-5-${new Date().toDateString()}`,
        type: 'celebration',
        message: "5 sessions this week! Your consistency is paying off.",
        priority: 'medium',
        dismissible: true,
        category: 'celebration',
        dismissKey: 'streak-5',
      });
    } else if (context.sessionStreak === 7) {
      insights.push({
        id: `streak-7-${new Date().toDateString()}`,
        type: 'celebration',
        message: "A full week of sessions! You've built real momentum.",
        priority: 'high',
        dismissible: true,
        category: 'celebration',
        dismissKey: 'streak-7',
      });
    } else if (context.sessionStreak >= 14 && context.sessionStreak % 7 === 0) {
      insights.push({
        id: `streak-milestone-${context.sessionStreak}`,
        type: 'celebration',
        message: `${context.sessionStreak} sessions! Your dedication is remarkable.`,
        priority: 'medium',
        dismissible: true,
        category: 'celebration',
        dismissKey: `streak-milestone-${context.sessionStreak}`,
      });
    }

    // Consistency score celebration
    if (context.consistencyScore >= 80 && !isPermanentlyDismissed('consistency-high')) {
      insights.push({
        id: `consistency-high-${new Date().toDateString()}`,
        type: 'celebration',
        message: `Outstanding consistency! You're in the top tier of dedication.`,
        priority: 'medium',
        dismissible: true,
        category: 'celebration',
        permanentDismissable: true,
        dismissKey: 'consistency-high',
      });
    }
  }

  // Completion rate insights
  if (context.completionRate >= 90 && context.totalSessionsThisWeek >= 3) {
    insights.push({
      id: `completion-high-${new Date().toDateString()}`,
      type: 'celebration',
      message: "Excellent completion rate this week. You're fully committed!",
      priority: 'low',
      dismissible: true,
      category: 'progress',
      dismissKey: 'completion-high',
    });
  } else if (context.completionRate < 50 && context.totalSessionsThisWeek >= 2 && !isPermanentlyDismissed('completion-low')) {
    insights.push({
      id: `completion-low-${new Date().toDateString()}`,
      type: 'tip',
      message: "Completing exercises fully can accelerate recovery. Quality over quantity.",
      priority: 'low',
      dismissible: true,
      category: 'progress',
      permanentDismissable: true,
      dismissKey: 'completion-low',
    });
  }

  // Weather-aware suggestions (if enabled)
  if (preferences.enableTips !== false && !isPermanentlyDismissed('weather-cold-warmup')) {
    if (context.weather === 'cold') {
      insights.push({
        id: `weather-cold-${new Date().toDateString()}`,
        type: 'tip',
        message: "Cold weather tip: Consider a longer warm-up to prepare your muscles and joints.",
        priority: 'low',
        dismissible: true,
        category: 'weather',
        permanentDismissable: true,
        dismissKey: 'weather-cold-warmup',
      });
    }
  }

  // Pattern recognition insights (if enabled)
  if (preferences.enablePatternSuggestions !== false) {
    const currentHour = new Date().getHours();

    // Suggest based on typical session time
    if (context.preferredSessionTime !== null) {
      const timeDiff = Math.abs(currentHour - context.preferredSessionTime);

      if (timeDiff <= 1 && context.daysSinceLastSession >= 1) {
        insights.push({
          id: `time-pattern-${new Date().toDateString()}`,
          type: 'observation',
          message: `You usually work out around ${formatHour(context.preferredSessionTime)}. Ready to go?`,
          action: { label: 'Start Session', href: '/body' },
          priority: 'medium',
          dismissible: true,
          category: 'pattern',
          dismissKey: 'time-pattern',
        });
      }
    }
  }

  // Body map update reminders
  if (context.regionsNotUpdatedRecently.length > 0 && !isPermanentlyDismissed('body-map-reminder')) {
    const region = context.regionsNotUpdatedRecently[0];
    insights.push({
      id: `body-map-reminder-${region}`,
      type: 'suggestion',
      message: `It's been a few days since you logged your ${region.toLowerCase()}. How's it feeling?`,
      action: { label: 'Update Body Map', href: '/body' },
      priority: 'medium',
      dismissible: true,
      category: 'pain',
      permanentDismissable: true,
      dismissKey: 'body-map-reminder',
    });
  }

  // High pain region focus
  if (context.highestPainRegion && context.averagePainLevel >= 4) {
    insights.push({
      id: 'focus-region',
      type: 'observation',
      message: `Your ${context.highestPainRegion} might benefit from targeted attention today.`,
      action: { label: 'Update Body Map', href: '/body' },
      priority: 'medium',
      dismissible: true,
      category: 'pain',
    });
  }

  // Rest day suggestions
  if (context.sessionStreak >= 5 && context.daysSinceLastSession === 0) {
    insights.push({
      id: 'rest-day-suggestion',
      type: 'suggestion',
      message: "You've been consistent! A rest day can help your body recover and rebuild.",
      priority: 'low',
      dismissible: true,
      category: 'rest',
    });
  }

  // Weekend motivation
  if (context.dayOfWeek === 'Saturday' || context.dayOfWeek === 'Sunday') {
    if (context.totalSessionsThisWeek < 3) {
      insights.push({
        id: 'weekend-catchup',
        type: 'suggestion',
        message: "Weekends are great for a focused recovery session when you have more time.",
        action: { label: 'Start Session', href: '/body' },
        priority: 'low',
        dismissible: true,
        category: 'time',
      });
    }
  }

  // Advanced pattern-based insights

  // Best time for recovery insight
  if (context.bestTimeForRecovery !== 'unknown' && !isPermanentlyDismissed('best-time-insight')) {
    const timeLabels = { morning: 'morning', afternoon: 'afternoon', evening: 'evening' };
    const currentTimeOfDay = context.timeOfDay;

    if (currentTimeOfDay === context.bestTimeForRecovery && context.daysSinceLastSession >= 1) {
      insights.push({
        id: `best-time-${new Date().toDateString()}`,
        type: 'observation',
        message: `Your recovery sessions tend to be most effective in the ${timeLabels[context.bestTimeForRecovery]}. This is a great time for you!`,
        action: { label: 'Start Session', href: '/body' },
        priority: 'medium',
        dismissible: true,
        category: 'pattern',
        permanentDismissable: true,
        dismissKey: 'best-time-insight',
      });
    }
  }

  // Rest day impact insight
  if (context.restDayImpact === 'positive' && context.sessionStreak >= 4 && !isPermanentlyDismissed('rest-day-positive')) {
    insights.push({
      id: `rest-positive-${new Date().toDateString()}`,
      type: 'observation',
      message: "Your data shows you recover better after rest days. Consider taking one soon to maximize your progress.",
      priority: 'medium',
      dismissible: true,
      category: 'pattern',
      permanentDismissable: true,
      dismissKey: 'rest-day-positive',
    });
  }

  // Recovery velocity insight
  if (context.recoveryVelocity === 'fast' && context.sessionStreak >= 3 && !isPermanentlyDismissed('fast-recovery')) {
    insights.push({
      id: `fast-recovery-${new Date().toDateString()}`,
      type: 'celebration',
      message: "Your recovery is progressing faster than average! Your dedication is showing real results.",
      priority: 'medium',
      dismissible: true,
      category: 'progress',
      permanentDismissable: true,
      dismissKey: 'fast-recovery',
    });
  } else if (context.recoveryVelocity === 'slow' && !isPermanentlyDismissed('slow-recovery-tip')) {
    insights.push({
      id: `slow-recovery-${new Date().toDateString()}`,
      type: 'tip',
      message: "Recovery takes time. Focus on consistency and proper form rather than intensity. Small improvements compound.",
      priority: 'low',
      dismissible: true,
      category: 'tip',
      permanentDismissable: true,
      dismissKey: 'slow-recovery-tip',
    });
  }

  // Readiness-based suggestion
  if (context.predictedReadiness >= 80 && context.daysSinceLastSession >= 1) {
    insights.push({
      id: `high-readiness-${new Date().toDateString()}`,
      type: 'suggestion',
      message: "Based on your patterns, today looks like a great day for a productive session!",
      action: { label: 'Start Session', href: '/body' },
      priority: 'medium',
      dismissible: true,
      category: 'pattern',
    });
  } else if (context.predictedReadiness <= 40 && context.daysSinceLastSession === 0) {
    insights.push({
      id: `low-readiness-${new Date().toDateString()}`,
      type: 'suggestion',
      message: "Your body might benefit from a lighter activity or rest today. Listen to how you feel.",
      priority: 'low',
      dismissible: true,
      category: 'rest',
    });
  }

  // Suggested intensity insight
  if (context.suggestedIntensity === 'light' && context.daysSinceLastSession >= 1 && !isPermanentlyDismissed('intensity-light')) {
    insights.push({
      id: `suggest-light-${new Date().toDateString()}`,
      type: 'tip',
      message: `Based on your recent activity, a lighter ${context.suggestedDuration}-minute session might be ideal today.`,
      action: { label: 'Start Gentle Session', href: '/body' },
      priority: 'low',
      dismissible: true,
      category: 'exercise',
      permanentDismissable: true,
      dismissKey: 'intensity-light',
    });
  }

  // Persistent pain region attention
  if (context.persistentPainRegion && !isPermanentlyDismissed('persistent-pain-focus')) {
    insights.push({
      id: `persistent-pain-${context.persistentPainRegion}`,
      type: 'observation',
      message: `Your ${context.persistentPainRegion.toLowerCase()} has been consistently uncomfortable. Targeted attention might help.`,
      action: { label: 'Focus on This Area', href: '/body' },
      priority: 'medium',
      dismissible: true,
      category: 'pain',
      permanentDismissable: true,
      dismissKey: 'persistent-pain-focus',
    });
  }

  // Most improved region celebration
  if (context.mostImprovedRegion && !isPermanentlyDismissed('improved-region-celebration')) {
    insights.push({
      id: `improved-region-${context.mostImprovedRegion}`,
      type: 'celebration',
      message: `Great progress on your ${context.mostImprovedRegion.toLowerCase()}! Your targeted work is paying off.`,
      priority: 'low',
      dismissible: true,
      category: 'celebration',
      permanentDismissable: true,
      dismissKey: 'improved-region-celebration',
    });
  }

  // Peak motivation day insight
  if (context.peakMotivationDays.length > 0 && context.peakMotivationDays.includes(context.dayOfWeek)) {
    insights.push({
      id: `peak-day-${new Date().toDateString()}`,
      type: 'observation',
      message: `${context.dayOfWeek}s tend to be one of your best workout days. Make the most of it!`,
      action: { label: 'Start Session', href: '/body' },
      priority: 'low',
      dismissible: true,
      category: 'pattern',
    });
  }

  // Skipped day pattern insight
  if (context.skippedDaysPattern.length > 0 && context.skippedDaysPattern.includes(context.dayOfWeek) && !isPermanentlyDismissed('skipped-day-nudge')) {
    insights.push({
      id: `skipped-day-${new Date().toDateString()}`,
      type: 'suggestion',
      message: `${context.dayOfWeek}s are sometimes tricky for you. Even a quick 10-minute session can maintain momentum.`,
      action: { label: 'Quick Session', href: '/body' },
      priority: 'low',
      dismissible: true,
      category: 'pattern',
      permanentDismissable: true,
      dismissKey: 'skipped-day-nudge',
    });
  }

  // Weekly pain reduction celebration
  if (context.weeklyPainReduction >= 1 && !isPermanentlyDismissed('weekly-improvement')) {
    insights.push({
      id: `weekly-improvement-${new Date().toDateString()}`,
      type: 'celebration',
      message: `Your average pain dropped by ${context.weeklyPainReduction.toFixed(1)} points this week! Real, measurable progress.`,
      action: { label: 'View Progress', href: '/progress' },
      priority: 'medium',
      dismissible: true,
      category: 'progress',
      permanentDismissable: true,
      dismissKey: 'weekly-improvement',
    });
  }

  // Filter out dismissed insights and permanently dismissed ones
  const filteredInsights = insights.filter((insight) => {
    // Check temporary dismissal
    if (preferences.dismissedInsights.includes(insight.id)) return false;

    // Check permanent dismissal
    if (insight.dismissKey && isPermanentlyDismissed(insight.dismissKey)) return false;

    // Check frequency settings
    if (!shouldShowByFrequency(insight.priority)) return false;

    return true;
  });

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  filteredInsights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Limit to max visible
  return filteredInsights.slice(0, preferences.maxVisibleInsights);
}

// Generate smart suggestions for specific contexts
export function generateSmartSuggestions(
  context: AmbientContext,
  location: 'dashboard' | 'progress' | 'body' | 'history' | 'settings'
): AIInsight[] {
  const suggestions: AIInsight[] = [];

  switch (location) {
    case 'dashboard':
      if (context.daysSinceLastSession === 0) {
        suggestions.push({
          id: 'dashboard-completed-today',
          type: 'observation',
          message: "Great work today! Review your progress to track improvements.",
          action: { label: 'View Progress', href: '/progress' },
          priority: 'low',
          dismissible: true,
          category: 'progress',
        });
      } else if (context.daysSinceLastSession === 1) {
        // Check if it's their optimal time
        const currentHour = new Date().getHours();
        const isOptimalTime = context.optimalNextSessionTime !== null &&
          Math.abs(currentHour - context.optimalNextSessionTime) <= 1;

        suggestions.push({
          id: 'dashboard-yesterday',
          type: 'suggestion',
          message: isOptimalTime
            ? `This is your best time for sessions! Ready to continue your streak?`
            : "Ready for today's session? Continuing your streak keeps momentum.",
          action: { label: 'Start Session', href: '/body' },
          priority: 'medium',
          dismissible: true,
          category: 'exercise',
        });
      }

      // Readiness-based suggestion
      if (context.predictedReadiness >= 80 && context.daysSinceLastSession >= 1) {
        suggestions.push({
          id: 'dashboard-high-readiness',
          type: 'suggestion',
          message: `Today's readiness: ${context.predictedReadiness}%. A ${context.suggestedIntensity} ${context.suggestedDuration}-min session would be ideal.`,
          action: { label: 'Start Session', href: '/body' },
          priority: 'medium',
          dismissible: true,
          category: 'exercise',
        });
      } else if (context.predictedReadiness <= 40) {
        suggestions.push({
          id: 'dashboard-low-readiness',
          type: 'tip',
          message: "Your body might benefit from rest or very gentle movement today.",
          priority: 'low',
          dismissible: true,
          category: 'rest',
        });
      }

      // Peak motivation day
      if (context.peakMotivationDays.includes(context.dayOfWeek)) {
        suggestions.push({
          id: 'dashboard-peak-day',
          type: 'observation',
          message: `${context.dayOfWeek}s are typically your most productive workout days!`,
          action: { label: 'Make It Count', href: '/body' },
          priority: 'low',
          dismissible: true,
          category: 'pattern',
        });
      }
      break;

    case 'progress':
      if (context.painTrend === 'improving') {
        suggestions.push({
          id: 'progress-trend-up',
          type: 'encouragement',
          message: context.weeklyPainReduction >= 0.5
            ? `Your pain decreased by ${context.weeklyPainReduction.toFixed(1)} points this week!`
            : "Your progress chart shows real improvement. Keep it up!",
          priority: 'low',
          dismissible: true,
          category: 'progress',
        });
      } else if (context.painTrend === 'worsening') {
        suggestions.push({
          id: 'progress-trend-down',
          type: 'observation',
          message: "Consider adjusting intensity or consulting a professional if pain persists.",
          priority: 'medium',
          dismissible: true,
          category: 'pain',
        });
      }

      // Recovery velocity insight
      if (context.recoveryVelocity === 'fast') {
        suggestions.push({
          id: 'progress-fast-recovery',
          type: 'celebration',
          message: "You're recovering faster than average! Your approach is working.",
          priority: 'low',
          dismissible: true,
          category: 'progress',
        });
      }

      // Most improved region
      if (context.mostImprovedRegion) {
        suggestions.push({
          id: 'progress-improved-region',
          type: 'observation',
          message: `Your ${context.mostImprovedRegion.toLowerCase()} has shown the most improvement recently.`,
          priority: 'low',
          dismissible: true,
          category: 'progress',
        });
      }

      // Consistency insight
      if (context.consistencyScore >= 70) {
        suggestions.push({
          id: 'progress-consistency',
          type: 'encouragement',
          message: `Consistency score: ${context.consistencyScore}%! This dedication drives results.`,
          priority: 'low',
          dismissible: true,
          category: 'streak',
        });
      }
      break;

    case 'body':
      if (context.highestPainRegion) {
        suggestions.push({
          id: 'body-focus-area',
          type: 'observation',
          message: `Focus on ${context.highestPainRegion} exercises may help reduce discomfort over time.`,
          priority: 'medium',
          dismissible: true,
          category: 'exercise',
        });
      }

      if (context.averagePainLevel > 5) {
        suggestions.push({
          id: 'body-high-pain',
          type: 'warning',
          message: "Higher pain levels detected. Consider lighter movements or consult a professional.",
          priority: 'high',
          dismissible: true,
          category: 'pain',
        });
      }

      // Persistent pain region
      if (context.persistentPainRegion) {
        suggestions.push({
          id: 'body-persistent',
          type: 'tip',
          message: `Your ${context.persistentPainRegion.toLowerCase()} needs consistent, gentle attention. Small daily improvements add up.`,
          priority: 'medium',
          dismissible: true,
          category: 'pain',
        });
      }

      // Suggest based on time of day effectiveness
      const currentTimeOfDay = context.timeOfDay;
      if (currentTimeOfDay === 'morning' && context.morningSessionEffectiveness >= 70) {
        suggestions.push({
          id: 'body-morning-effective',
          type: 'observation',
          message: "Morning sessions tend to be particularly effective for you. Great timing!",
          priority: 'low',
          dismissible: true,
          category: 'pattern',
        });
      } else if (currentTimeOfDay === 'evening' && context.eveningSessionEffectiveness >= 70) {
        suggestions.push({
          id: 'body-evening-effective',
          type: 'observation',
          message: "Evening sessions work well for you. You tend to have better outcomes at this time.",
          priority: 'low',
          dismissible: true,
          category: 'pattern',
        });
      }

      // Suggested intensity
      if (context.suggestedIntensity === 'light') {
        suggestions.push({
          id: 'body-suggest-light',
          type: 'tip',
          message: `Based on your recent activity, a lighter ${context.suggestedDuration}-minute session is recommended today.`,
          priority: 'low',
          dismissible: true,
          category: 'exercise',
        });
      }
      break;

    case 'history':
      if (context.totalSessionsThisWeek >= 5) {
        suggestions.push({
          id: 'history-active-week',
          type: 'encouragement',
          message: "An active week! Your history shows real dedication.",
          priority: 'low',
          dismissible: true,
          category: 'streak',
        });
      }

      // Session pattern insight
      if (context.bestTimeForRecovery !== 'unknown') {
        suggestions.push({
          id: 'history-best-time',
          type: 'observation',
          message: `Your ${context.bestTimeForRecovery} sessions tend to be most effective based on your history.`,
          priority: 'low',
          dismissible: true,
          category: 'pattern',
        });
      }

      // Completion rate by time insight
      const bestTimeSlot = Object.entries(context.sessionCompletionByTimeOfDay)
        .filter(([_, rate]) => rate > 0)
        .sort(([, a], [, b]) => b - a)[0];

      if (bestTimeSlot && bestTimeSlot[1] >= 80) {
        suggestions.push({
          id: 'history-completion-time',
          type: 'observation',
          message: `You complete ${bestTimeSlot[1]}% of exercises during ${bestTimeSlot[0]} sessions - your most productive time.`,
          priority: 'low',
          dismissible: true,
          category: 'pattern',
        });
      }
      break;

    case 'settings':
      // Personalization recommendations
      if (context.consistencyScore < 50) {
        suggestions.push({
          id: 'settings-reminder',
          type: 'tip',
          message: "Consider setting a daily reminder to build consistency. Small habits compound over time.",
          priority: 'low',
          dismissible: true,
          category: 'tip',
        });
      }

      if (context.bestTimeForRecovery !== 'unknown') {
        suggestions.push({
          id: 'settings-optimal-time',
          type: 'observation',
          message: `Your data suggests ${context.bestTimeForRecovery} is your optimal time. Set your reminder accordingly!`,
          priority: 'low',
          dismissible: true,
          category: 'pattern',
        });
      }
      break;
  }

  return suggestions;
}

// Predictive suggestions based on patterns
export function generatePredictiveSuggestions(
  context: AmbientContext,
  sessions: SessionData[]
): AIInsight[] {
  const suggestions: AIInsight[] = [];

  // Analyze time patterns
  const sessionHours = sessions.map((s) => new Date(s.date).getHours());
  const avgHour = sessionHours.length > 0
    ? Math.round(sessionHours.reduce((a, b) => a + b, 0) / sessionHours.length)
    : -1;

  const currentHour = new Date().getHours();

  // Suggest based on typical session time
  if (avgHour !== -1 && Math.abs(currentHour - avgHour) <= 1) {
    suggestions.push({
      id: 'time-pattern',
      type: 'observation',
      message: "This is usually when you prefer to exercise. Good time for a session?",
      action: { label: 'Start Now', href: '/body' },
      priority: 'medium',
      dismissible: true,
      category: 'time',
    });
  }

  // Suggest rest based on cumulative load
  const recentSessions = sessions.filter(
    (s) => new Date(s.date) >= new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  );

  const totalRecentDuration = recentSessions.reduce((acc, s) => acc + s.duration, 0);

  if (totalRecentDuration > 100) {
    suggestions.push({
      id: 'load-high',
      type: 'suggestion',
      message: "You've been quite active lately. A lighter day might help recovery.",
      priority: 'medium',
      dismissible: true,
      category: 'rest',
    });
  }

  // Predict need for substitutions based on pain history
  const highPainSessions = sessions.filter((s) => s.painAfter >= 6);

  if (highPainSessions.length >= 2 && highPainSessions.length / sessions.length > 0.3) {
    suggestions.push({
      id: 'substitution-needed',
      type: 'suggestion',
      message: "Some sessions end with higher pain. Consider alternative exercises for sensitive areas.",
      priority: 'medium',
      dismissible: true,
      category: 'exercise',
    });
  }

  return suggestions;
}

// Export default preferences
export const defaultInsightPreferences: InsightPreferences = {
  dismissedInsights: [],
  permanentlyDismissedKeys: [],
  preferredCategories: [],
  lastSeenTimestamp: null,
  maxVisibleInsights: 3,
  enableGreetings: true,
  enableCelebrations: true,
  enableTips: true,
  enableWarnings: true,
  enablePatternSuggestions: true,
  insightFrequency: 'balanced',
};

// Smart questions for the AI chat interface
export function generateSmartQuestions(context: AmbientContext): SmartQuestion[] {
  const questions: SmartQuestion[] = [];

  // Always available questions
  questions.push({
    id: 'focus-today',
    question: 'What should I focus on today?',
    category: 'guidance',
  });

  questions.push({
    id: 'progress-week',
    question: 'Explain my progress this week',
    category: 'progress',
  });

  // Context-specific questions
  if (context.highestPainRegion) {
    questions.push({
      id: 'pain-region',
      question: `Why is my ${context.highestPainRegion.toLowerCase()} hurting?`,
      category: 'explanation',
      context: 'pain',
    });

    questions.push({
      id: 'exercise-suggestion',
      question: `What exercises help with ${context.highestPainRegion.toLowerCase()} pain?`,
      category: 'guidance',
      context: 'pain',
    });
  }

  if (context.sessionStreak >= 3) {
    questions.push({
      id: 'rest-day',
      question: 'Should I take a rest day?',
      category: 'planning',
      context: 'streak',
    });
  }

  if (context.painTrend === 'worsening') {
    questions.push({
      id: 'pain-worsening',
      question: 'Why is my pain getting worse?',
      category: 'explanation',
      context: 'pain',
    });
  } else if (context.painTrend === 'improving') {
    questions.push({
      id: 'pain-improving',
      question: "What's helping my recovery?",
      category: 'explanation',
      context: 'progress',
    });
  }

  questions.push({
    id: 'session-duration',
    question: 'How long should my session be?',
    category: 'planning',
  });

  // New context-aware questions based on advanced patterns
  if (context.bestTimeForRecovery !== 'unknown') {
    questions.push({
      id: 'best-time',
      question: 'When is my best time to exercise?',
      category: 'planning',
      context: 'pattern',
    });
  }

  if (context.persistentPainRegion) {
    questions.push({
      id: 'persistent-pain',
      question: `How can I address my persistent ${context.persistentPainRegion.toLowerCase()} pain?`,
      category: 'guidance',
      context: 'pain',
    });
  }

  if (context.recoveryVelocity === 'slow') {
    questions.push({
      id: 'speed-up-recovery',
      question: 'How can I speed up my recovery?',
      category: 'guidance',
      context: 'progress',
    });
  }

  if (context.restDayImpact === 'positive' || context.restDayImpact === 'negative') {
    questions.push({
      id: 'rest-impact',
      question: 'How do rest days affect my recovery?',
      category: 'explanation',
      context: 'pattern',
    });
  }

  questions.push({
    id: 'readiness-check',
    question: 'How ready am I for a session today?',
    category: 'guidance',
  });

  return questions.slice(0, 4); // Limit to 4 questions
}

// Mock AI responses for MVP (would be real AI in production)
export function getMockAIResponse(
  questionId: string,
  context: AmbientContext
): AIResponse {
  const responses: Record<string, AIResponse> = {
    'focus-today': {
      questionId: 'focus-today',
      response: context.highestPainRegion
        ? `Based on your body map, I'd suggest focusing on gentle exercises for your ${context.highestPainRegion.toLowerCase()} today. ${
            context.painTrend === 'worsening'
              ? 'Since your pain has been increasing, keep the intensity low and listen to your body.'
              : context.suggestedIntensity === 'light'
              ? `A ${context.suggestedDuration}-minute lighter session would be ideal based on your recent activity.`
              : 'Your consistency is helping - keep up the great work!'
          }`
        : `Today would be great for a balanced full-body routine. ${
            context.daysSinceLastSession >= 2
              ? "Since it's been a couple days, start with a thorough warm-up."
              : context.predictedReadiness >= 70
              ? 'Your readiness looks good - you can maintain your usual intensity.'
              : 'Consider starting lighter and building up based on how you feel.'
          }`,
      followUpActions: [{ label: 'Start Session', href: '/body' }],
    },
    'progress-week': {
      questionId: 'progress-week',
      response: `This week you've completed ${context.totalSessionsThisWeek} session${context.totalSessionsThisWeek !== 1 ? 's' : ''} with a ${context.completionRate}% exercise completion rate. ${
        context.painTrend === 'improving'
          ? `Your pain levels are trending down${context.weeklyPainReduction >= 0.5 ? ` by about ${context.weeklyPainReduction.toFixed(1)} points` : ''} - a great sign that your recovery routine is working!`
          : context.painTrend === 'worsening'
          ? 'Pain levels have been higher lately. Consider lighter sessions or consulting a professional if this continues.'
          : 'Your pain levels have been stable. Consistent effort leads to lasting results.'
      } ${context.recoveryVelocity === 'fast' ? "You're recovering faster than average - excellent work!" : ''}`,
      followUpActions: [{ label: 'View Detailed Progress', href: '/progress' }],
    },
    'pain-region': {
      questionId: 'pain-region',
      response: context.highestPainRegion
        ? `${context.highestPainRegion} pain can have many causes - from muscle tension to posture issues. Common factors include prolonged sitting, stress, or overuse. ${
            context.persistentPainRegion === context.highestPainRegion
              ? "I notice this area has been consistently uncomfortable. Targeted, gentle attention combined with patience often helps persistent pain."
              : 'The good news is that targeted mobility work often helps.'
          } Track your pain levels to identify patterns and triggers.`
        : 'Update your body map so I can give you personalized insights about your pain areas.',
      followUpActions: context.highestPainRegion
        ? [{ label: 'Log Pain Levels', href: '/body' }]
        : [{ label: 'Update Body Map', href: '/body' }],
    },
    'exercise-suggestion': {
      questionId: 'exercise-suggestion',
      response: context.highestPainRegion
        ? `For ${context.highestPainRegion.toLowerCase()}, I recommend starting with gentle stretches and mobility work. Focus on movements that don't increase your pain. ${
            context.bestTimeForRecovery !== 'unknown'
              ? `Based on your patterns, ${context.bestTimeForRecovery} sessions tend to be most effective for you.`
              : 'Consistency is more important than intensity - daily gentle movement often beats occasional intense sessions.'
          }`
        : 'Update your body map so I can suggest targeted exercises.',
      followUpActions: [{ label: 'View Exercises', href: '/body' }],
    },
    'rest-day': {
      questionId: 'rest-day',
      response: context.sessionStreak >= 7
        ? `With a ${context.sessionStreak}-day streak, a rest day could help your body recover and rebuild. ${
            context.restDayImpact === 'positive'
              ? 'Your data actually shows you tend to feel better after rest days!'
              : 'Active recovery (light walking, gentle stretching) can be beneficial without adding stress.'
          }`
        : context.sessionStreak >= 4
        ? `You've been consistent! A rest day every 4-5 days is healthy. ${
            context.restDayImpact === 'positive'
              ? "And your history shows rest days help your recovery."
              : "If you're feeling good, you could do a lighter session instead of complete rest."
          }`
        : "You're building momentum. Unless you're feeling particularly tired or sore, continuing your routine is fine. Listen to your body!",
    },
    'pain-worsening': {
      questionId: 'pain-worsening',
      response:
        `Increased pain could be from overexertion, poor form, or factors outside your routine (stress, sleep, posture). ${
          context.sessionIntensityTrend === 'increasing'
            ? "I notice your session intensity has been increasing - you might be progressing too fast."
            : "Consider: Are you progressing too fast? Is your form correct? Are other lifestyle factors at play?"
        } If pain persists, consulting a healthcare professional is wise.`,
      followUpActions: [{ label: 'Review Pain History', href: '/progress' }],
    },
    'pain-improving': {
      questionId: 'pain-improving',
      response: `Your consistency is paying off! With ${context.sessionStreak} sessions and a ${context.completionRate}% completion rate, you're giving your body what it needs. ${
        context.bestTimeForRecovery !== 'unknown'
          ? `I've noticed your ${context.bestTimeForRecovery} sessions tend to be particularly effective.`
          : ''
      } ${
        context.mostImprovedRegion
          ? `Your ${context.mostImprovedRegion.toLowerCase()} has shown especially good progress.`
          : ''
      } Key factors: regular movement, complete exercise execution, and allowing adequate recovery between sessions.`,
    },
    'session-duration': {
      questionId: 'session-duration',
      response: `Based on your history and current state, I'd suggest ${context.suggestedDuration} minutes today at ${context.suggestedIntensity} intensity. ${
        context.painTrend === 'worsening'
          ? 'With recent pain increases, keeping sessions shorter and lighter is wise.'
          : context.daysSinceLastSession >= 3
          ? "Since it's been a few days, a gradual restart is best."
          : context.predictedReadiness >= 70
          ? 'Your readiness looks good, so feel free to do your typical duration if that feels right.'
          : 'Quality matters more than duration - listen to your body.'
      }`,
    },
    'best-time': {
      questionId: 'best-time',
      response: context.bestTimeForRecovery !== 'unknown'
        ? `Based on your session history, ${context.bestTimeForRecovery} workouts tend to be most effective for you. ${
            context.morningSessionEffectiveness > context.eveningSessionEffectiveness
              ? 'Your morning sessions show better pain reduction and higher completion rates.'
              : context.eveningSessionEffectiveness > context.morningSessionEffectiveness
              ? 'Your evening sessions tend to have better outcomes.'
              : 'Both morning and evening sessions work well for you - choose what fits your schedule.'
          } ${
            context.sessionCompletionByTimeOfDay[context.bestTimeForRecovery] >= 80
              ? `You complete ${context.sessionCompletionByTimeOfDay[context.bestTimeForRecovery]}% of exercises during ${context.bestTimeForRecovery} sessions!`
              : ''
          }`
        : "I don't have enough data yet to identify your optimal time. Keep logging sessions and I'll learn your patterns.",
      followUpActions: context.optimalNextSessionTime
        ? [{ label: 'Start Session', href: '/body' }]
        : undefined,
    },
    'persistent-pain': {
      questionId: 'persistent-pain',
      response: context.persistentPainRegion
        ? `Persistent ${context.persistentPainRegion.toLowerCase()} pain requires patience and consistency. Here's what often helps: 1) Daily gentle mobility work rather than occasional intense sessions. 2) Focus on surrounding muscles, not just the painful area. 3) Track what activities make it worse or better. 4) Consider factors like sleep, stress, and posture. ${
            context.restDayImpact === 'positive'
              ? 'Your data shows rest days help - make sure to include them.'
              : ''
          } If pain persists beyond 2-3 weeks without improvement, consulting a professional is wise.`
        : "Update your body map so I can provide targeted guidance for persistent pain areas.",
      followUpActions: [{ label: 'Update Body Map', href: '/body' }],
    },
    'speed-up-recovery': {
      questionId: 'speed-up-recovery',
      response: `Recovery is a marathon, not a sprint, but here are evidence-based ways to optimize it: 1) Consistency trumps intensity - ${context.typicalSessionDuration} minutes daily beats longer sessions sporadically. 2) ${
        context.bestTimeForRecovery !== 'unknown'
          ? `Exercise during your optimal time (${context.bestTimeForRecovery} for you).`
          : 'Find your best time of day and stick to it.'
      } 3) ${
        context.restDayImpact === 'positive'
          ? 'Include rest days - your data shows they help.'
          : 'Balance activity with adequate rest.'
      } 4) Focus on sleep and stress management - they significantly impact recovery. 5) Stay hydrated and maintain good nutrition.`,
      followUpActions: [{ label: 'View Progress', href: '/progress' }],
    },
    'rest-impact': {
      questionId: 'rest-impact',
      response: context.restDayImpact === 'positive'
        ? `Your data shows rest days have a positive impact on your recovery! Sessions after rest days tend to show better pain reduction and completion rates. This is common - muscles repair and grow stronger during rest. I'd recommend planning 1-2 rest days per week, especially after ${context.sessionStreak >= 4 ? 'your current streak' : 'consecutive workout days'}.`
        : context.restDayImpact === 'negative'
        ? "Interestingly, your data suggests you do better with consistent daily activity rather than rest days. Some people maintain momentum better with daily movement. Consider 'active rest' days with very light activity instead of complete rest."
        : "Based on your current data, rest days have a neutral effect. This means you have flexibility - take rest days when you feel you need them without worrying about losing progress.",
    },
    'readiness-check': {
      questionId: 'readiness-check',
      response: `Your readiness score today is ${context.predictedReadiness}/100. ${
        context.predictedReadiness >= 80
          ? "You're well-rested and ready for a productive session!"
          : context.predictedReadiness >= 60
          ? "You're reasonably ready. A moderate session should feel good."
          : context.predictedReadiness >= 40
          ? "Today might be better for a lighter session or active recovery."
          : "Your body might benefit from rest today. Listen to how you feel."
      } ${
        context.daysSinceLastSession === 0
          ? " (You've already exercised today, which affects readiness.)"
          : context.sessionStreak >= 5
          ? " (Your streak is great, but consistent effort can build up fatigue.)"
          : ''
      }`,
      followUpActions: context.predictedReadiness >= 50
        ? [{ label: 'Start Session', href: '/body' }]
        : undefined,
    },
  };

  return (
    responses[questionId] || {
      questionId,
      response:
        "I'm here to help with your recovery journey. Ask me about your progress, pain management, or what to focus on today!",
    }
  );
}

// Anticipate next likely action
export function getPredictedAction(context: AmbientContext): { label: string; href: string } | null {
  // If haven't exercised today and it's their usual time
  if (
    context.daysSinceLastSession >= 1 &&
    context.preferredSessionTime !== null &&
    Math.abs(new Date().getHours() - context.preferredSessionTime) <= 2
  ) {
    return { label: 'Start Session', href: '/body' };
  }

  // If body map hasn't been updated in a while
  if (context.daysSinceBodyMapUpdate >= 3) {
    return { label: 'Update Body Map', href: '/body' };
  }

  // Weekend and haven't met weekly goal
  if (context.isWeekend && context.totalSessionsThisWeek < 3) {
    return { label: 'Catch-up Session', href: '/body' };
  }

  return null;
}
