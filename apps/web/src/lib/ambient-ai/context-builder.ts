/**
 * Ambient Context Builder
 *
 * Assembles the full ambient context from various data sources.
 * This is the Sensing Layer of the ambient AI system.
 */

import type {
  FullAmbientContext,
  TemporalContext,
  BodyContext,
  BehavioralContext,
  SessionContext,
  EnvironmentContext,
  TimeOfDay,
  TrendDirection,
  RecoveryStatus,
  LastSession,
  ApparentState,
  EngagementState,
  PaceState,
} from './types';

// ============================================
// TEMPORAL CONTEXT
// ============================================

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 7) return 'early_morning';
  if (hour >= 7 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 14) return 'midday';
  if (hour >= 14 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export interface SessionDataInput {
  id: string;
  date: Date;
  duration: number;
  completed: boolean;
  exercises: Array<{ setsCompleted: number; setsTarget: number }>;
  painBefore?: number;
  painAfter?: number;
  difficulty?: 'easy' | 'moderate' | 'hard';
}

export function buildTemporalContext(
  sessions: SessionDataInput[],
  lastAppOpen?: Date
): TemporalContext {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  // Calculate days since last session
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastSession = sortedSessions[0];
  const daysSinceLastSession = lastSession
    ? Math.floor(
        (now.getTime() - new Date(lastSession.date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : -1;

  // Calculate streak
  const streak = calculateStreak(sessions);

  // Find typical session time
  const typicalTime = findTypicalSessionTime(sessions);

  return {
    currentTime: now,
    timeOfDay: getTimeOfDay(hour),
    dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
    isWeekend: day === 0 || day === 6,
    daysSinceLastSession,
    daysSinceLastAppOpen: lastAppOpen
      ? Math.floor(
          (now.getTime() - lastAppOpen.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0,
    currentStreak: streak,
    typicalSessionTime: typicalTime,
  };
}

function calculateStreak(sessions: SessionDataInput[]): number {
  if (sessions.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
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
      // Allow one day gap
      const prevCheck = new Date(checkDate);
      prevCheck.setDate(prevCheck.getDate() + 1);
      const previousDayHadSession = sortedSessions.some((s) => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === prevCheck.getTime();
      });
      if (!previousDayHadSession) break;
    }
  }

  return streak;
}

function findTypicalSessionTime(
  sessions: SessionDataInput[]
): { start: number; end: number } | null {
  if (sessions.length < 3) return null;

  const hours = sessions.slice(0, 14).map((s) => new Date(s.date).getHours());
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

  if (preferredHour === null) return null;

  return { start: preferredHour, end: preferredHour + 1 };
}

// ============================================
// BODY CONTEXT
// ============================================

export interface BodyRegionInput {
  id: string;
  name: string;
  painLevel: number;
  lastUpdated: Date;
}

export interface HealthDataInput {
  readinessScore?: number;
  sleepDuration?: number;
  sleepQuality?: number;
  hrv?: number;
  hrvBaseline?: number;
}

export function buildBodyContext(
  bodyRegions: BodyRegionInput[],
  sessions: SessionDataInput[],
  healthData?: HealthDataInput
): BodyContext {
  // Calculate average pain
  const averagePain =
    bodyRegions.length > 0
      ? bodyRegions.reduce((acc, r) => acc + r.painLevel, 0) / bodyRegions.length
      : 0;

  // Find highest pain region
  const sortedByPain = [...bodyRegions].sort(
    (a, b) => b.painLevel - a.painLevel
  );
  const highestPainRegion =
    sortedByPain[0]?.painLevel > 0 ? sortedByPain[0].name : null;

  // Calculate pain trend
  const painTrend = calculatePainTrend(sessions);

  // Build readiness factors
  const readinessFactors = buildReadinessFactors(healthData, bodyRegions);

  // Calculate readiness score
  const readinessScore = healthData?.readinessScore ?? calculateReadinessScore(
    sessions,
    bodyRegions,
    readinessFactors
  );

  // Find active constraints
  const constraints = bodyRegions
    .filter((r) => r.painLevel >= 5)
    .map((r) => ({
      type: 'pain' as const,
      description: `${r.name} pain level ${r.painLevel}/10`,
      affectedRegions: [r.name],
      severity:
        r.painLevel >= 8
          ? ('severe' as const)
          : r.painLevel >= 6
          ? ('moderate' as const)
          : ('mild' as const),
    }));

  // Body model last updated
  const lastUpdated =
    bodyRegions.length > 0
      ? new Date(
          Math.max(...bodyRegions.map((r) => new Date(r.lastUpdated).getTime()))
        )
      : null;

  return {
    readinessScore,
    readinessFactors,
    muscleRecoveryStatus: new Map(), // Would be populated from workout data
    currentConstraints: constraints,
    bodyModelLastUpdated: lastUpdated,
    averagePainLevel: averagePain,
    highestPainRegion,
    painTrend,
  };
}

function calculatePainTrend(
  sessions: SessionDataInput[]
): 'improving' | 'stable' | 'worsening' {
  if (sessions.length < 2) return 'stable';

  const recentSessions = sessions.slice(0, 5);
  const olderSessions = sessions.slice(5, 10);

  if (olderSessions.length === 0) return 'stable';

  const recentAvg =
    recentSessions.reduce((acc, s) => acc + (s.painAfter ?? 0), 0) /
    recentSessions.length;
  const olderAvg =
    olderSessions.reduce((acc, s) => acc + (s.painAfter ?? 0), 0) /
    olderSessions.length;

  const difference = olderAvg - recentAvg;
  if (difference > 0.5) return 'improving';
  if (difference < -0.5) return 'worsening';
  return 'stable';
}

function buildReadinessFactors(
  healthData?: HealthDataInput,
  bodyRegions?: BodyRegionInput[]
): BodyContext['readinessFactors'] {
  const sleepScore = healthData?.sleepQuality ?? 70;
  const hrvValue = healthData?.hrv ?? 50;
  const hrvBaseline = healthData?.hrvBaseline ?? 50;

  return {
    sleep: {
      score: sleepScore,
      trend: 'stable' as TrendDirection,
      lastNight: healthData?.sleepDuration
        ? {
            duration: healthData.sleepDuration,
            quality: healthData.sleepQuality ?? 70,
            deepSleepPercent: 20,
          }
        : null,
    },
    recovery: {
      score: Math.min(100, Math.max(0, ((hrvValue / hrvBaseline) * 100))),
      hrvTrend: hrvValue > hrvBaseline ? 'up' : hrvValue < hrvBaseline ? 'down' : 'stable',
    },
    load: {
      acute: 0,
      chronic: 0,
      ratio: 1,
    },
    body: {
      activeInjuries: [],
      recentPain:
        bodyRegions
          ?.filter((r) => r.painLevel > 0)
          .map((r) => ({
            region: r.name,
            severity: r.painLevel,
            timestamp: new Date(r.lastUpdated),
          })) ?? [],
    },
  };
}

function calculateReadinessScore(
  sessions: SessionDataInput[],
  bodyRegions: BodyRegionInput[],
  factors: BodyContext['readinessFactors']
): number {
  let score = 70;

  // Sleep factor
  score += (factors.sleep.score - 70) * 0.3;

  // Recovery factor
  score += (factors.recovery.score - 70) * 0.2;

  // Pain factor
  const avgPain =
    bodyRegions.length > 0
      ? bodyRegions.reduce((acc, r) => acc + r.painLevel, 0) / bodyRegions.length
      : 0;
  score -= avgPain * 3;

  // Recent activity factor
  const recentSessions = sessions.filter(
    (s) =>
      new Date(s.date).getTime() > Date.now() - 3 * 24 * 60 * 60 * 1000
  );
  if (recentSessions.length === 0) {
    score -= 5; // Been inactive
  } else if (recentSessions.length >= 3) {
    score -= 10; // Might be overtrained
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

// ============================================
// BEHAVIORAL CONTEXT
// ============================================

export function buildBehavioralContext(
  sessions: SessionDataInput[]
): BehavioralContext {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentSessions = sessions.filter(
    (s) => new Date(s.date).getTime() >= oneWeekAgo
  );

  // Calculate average sessions per week
  const fourWeeksAgo = Date.now() - 28 * 24 * 60 * 60 * 1000;
  const monthSessions = sessions.filter(
    (s) => new Date(s.date).getTime() >= fourWeeksAgo
  );
  const avgSessionsPerWeek = monthSessions.length / 4;

  // Find preferred days
  const dayCounts = new Map<string, number>();
  sessions.slice(0, 30).forEach((s) => {
    const day = new Date(s.date).toLocaleDateString('en-US', { weekday: 'long' });
    dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
  });
  const avgPerDay = sessions.slice(0, 30).length / 7;
  const preferredDays = Array.from(dayCounts.entries())
    .filter(([, count]) => count > avgPerDay * 1.3)
    .map(([day]) => day);

  // Average session duration
  const avgDuration =
    sessions.length > 0
      ? sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length
      : 15;

  // Last session
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastSessionData = sortedSessions[0];
  const lastSession: LastSession | null = lastSessionData
    ? {
        date: new Date(lastSessionData.date),
        type: 'workout',
        completed: lastSessionData.completed,
        earlyEnd: !lastSessionData.completed,
        difficulty: lastSessionData.difficulty ?? 'moderate',
        painLogged: (lastSessionData.painAfter ?? 0) > 0,
        duration: lastSessionData.duration,
      }
    : null;

  // Recovery velocity
  const recoveryVelocity = calculateRecoveryVelocity(sessions);

  // Best time for recovery
  const bestTime = determineBestTimeForRecovery(sessions);

  // Rest day impact
  const restDayImpact = analyzeRestDayImpact(sessions);

  // Peak motivation days
  const peakDays = findPeakMotivationDays(sessions);

  return {
    averageSessionsPerWeek: avgSessionsPerWeek,
    preferredDays,
    preferredTime: findTypicalSessionTime(sessions),
    averageSessionDuration: avgDuration,
    lastSession,
    skipPatterns: {
      dayOfWeek: new Map(),
      exerciseTypes: new Map(),
      afterPainLog: 0,
    },
    voiceCommandUsage: 0,
    detailViewFrequency: 0.5,
    insightEngagement: 0.5,
    recoveryVelocity,
    bestTimeForRecovery: bestTime,
    restDayImpact,
    peakMotivationDays: peakDays,
  };
}

function calculateRecoveryVelocity(
  sessions: SessionDataInput[]
): 'fast' | 'moderate' | 'slow' {
  if (sessions.length < 5) return 'moderate';

  const avgPainReduction =
    sessions
      .slice(0, 10)
      .reduce(
        (acc, s) => acc + ((s.painBefore ?? 0) - (s.painAfter ?? 0)),
        0
      ) / Math.min(10, sessions.length);

  if (avgPainReduction >= 2) return 'fast';
  if (avgPainReduction >= 0.5) return 'moderate';
  return 'slow';
}

function determineBestTimeForRecovery(
  sessions: SessionDataInput[]
): 'morning' | 'afternoon' | 'evening' | 'unknown' {
  if (sessions.length < 5) return 'unknown';

  const timeSlots = {
    morning: { painReduction: 0, count: 0 },
    afternoon: { painReduction: 0, count: 0 },
    evening: { painReduction: 0, count: 0 },
  };

  sessions.forEach((s) => {
    const hour = new Date(s.date).getHours();
    const reduction = (s.painBefore ?? 0) - (s.painAfter ?? 0);

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

  const avgReductions = {
    morning:
      timeSlots.morning.count > 2
        ? timeSlots.morning.painReduction / timeSlots.morning.count
        : -1,
    afternoon:
      timeSlots.afternoon.count > 2
        ? timeSlots.afternoon.painReduction / timeSlots.afternoon.count
        : -1,
    evening:
      timeSlots.evening.count > 2
        ? timeSlots.evening.painReduction / timeSlots.evening.count
        : -1,
  };

  const best = Object.entries(avgReductions).reduce((a, b) =>
    b[1] > a[1] ? b : a
  );

  if (best[1] <= 0) return 'unknown';
  return best[0] as 'morning' | 'afternoon' | 'evening';
}

function analyzeRestDayImpact(
  sessions: SessionDataInput[]
): 'positive' | 'neutral' | 'negative' {
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
      (new Date(curr.date).getTime() - new Date(prev.date).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (daysBetween >= 2) {
      if ((curr.painAfter ?? 0) < (prev.painAfter ?? 0)) {
        afterRestBetter++;
      } else if ((curr.painAfter ?? 0) > (prev.painAfter ?? 0)) {
        afterRestWorse++;
      }
    }
  }

  if (afterRestBetter > afterRestWorse + 2) return 'positive';
  if (afterRestWorse > afterRestBetter + 2) return 'negative';
  return 'neutral';
}

function findPeakMotivationDays(sessions: SessionDataInput[]): string[] {
  if (sessions.length < 14) return [];

  const dayStats: Record<string, { count: number; completion: number }> = {
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
    const completionRate =
      s.exercises.filter((e) => e.setsCompleted >= e.setsTarget).length /
      (s.exercises.length || 1);
    dayStats[day].count++;
    dayStats[day].completion += completionRate;
  });

  const avgPerDay = sessions.slice(0, 30).length / 7;

  return Object.entries(dayStats)
    .filter(([, data]) => data.count > avgPerDay * 1.3)
    .map(([day]) => day);
}

// ============================================
// SESSION CONTEXT
// ============================================

export interface ActiveWorkoutInput {
  exercises: Array<{
    id: string;
    name: string;
    targetSets: number;
    completedSets: number;
  }>;
  currentExerciseIndex: number;
  currentSetIndex: number;
  restTimeTaken: number[];
  prescribedRestTime: number;
  difficultyRatings: ('easy' | 'moderate' | 'hard')[];
  timeSinceLastAction: number;
  videoViews: number;
  skips: number;
}

export function buildSessionContext(
  activeWorkout: ActiveWorkoutInput | null
): SessionContext | null {
  if (!activeWorkout) return null;

  const currentExercise =
    activeWorkout.exercises[activeWorkout.currentExerciseIndex] ?? null;
  const exercisesCompleted = activeWorkout.currentExerciseIndex;
  const exercisesRemaining =
    activeWorkout.exercises.length - activeWorkout.currentExerciseIndex;

  const totalSets = activeWorkout.exercises.reduce(
    (acc, e) => acc + e.targetSets,
    0
  );

  // Infer apparent states
  const apparentFatigue = inferFatigue(
    activeWorkout.restTimeTaken,
    activeWorkout.prescribedRestTime,
    activeWorkout.difficultyRatings
  );
  const apparentEngagement = inferEngagement(
    activeWorkout.timeSinceLastAction,
    activeWorkout.videoViews,
    activeWorkout.skips
  );
  const apparentPace = inferPace(
    activeWorkout.restTimeTaken,
    activeWorkout.prescribedRestTime
  );

  return {
    isActive: true,
    currentExercise: currentExercise
      ? {
          id: currentExercise.id,
          name: currentExercise.name,
          targetSets: currentExercise.targetSets,
          completedSets: currentExercise.completedSets,
        }
      : null,
    currentSet: activeWorkout.currentSetIndex,
    totalSets,
    exercisesCompleted,
    exercisesRemaining,
    timeSinceLastAction: activeWorkout.timeSinceLastAction,
    restTimeTaken: activeWorkout.restTimeTaken,
    prescribedRestTime: activeWorkout.prescribedRestTime,
    difficultyRatings: activeWorkout.difficultyRatings,
    apparentFatigue,
    apparentEngagement,
    apparentPace,
    videoViewsThisExercise: activeWorkout.videoViews,
    skipsThisSession: activeWorkout.skips,
  };
}

function inferFatigue(
  restTimes: number[],
  prescribedRest: number,
  ratings: ('easy' | 'moderate' | 'hard')[]
): ApparentState {
  if (restTimes.length < 3) return 'fresh';

  const recentRests = restTimes.slice(-3);
  const avgRest = recentRests.reduce((a, b) => a + b, 0) / recentRests.length;
  const restRatio = avgRest / prescribedRest;

  const recentRatings = ratings.slice(-3);
  const hardCount = recentRatings.filter((r) => r === 'hard').length;

  if (restRatio > 1.5 && hardCount >= 2) return 'fatigued';
  if (restRatio > 1.2 || hardCount >= 1) return 'moderate';
  return 'fresh';
}

function inferEngagement(
  timeSinceAction: number,
  videoViews: number,
  skips: number
): EngagementState {
  if (skips > 2) return 'struggling';
  if (timeSinceAction > 60 || videoViews > 2) return 'distracted';
  return 'focused';
}

function inferPace(
  restTimes: number[],
  prescribedRest: number
): PaceState {
  if (restTimes.length < 2) return 'normal';

  const avgRest = restTimes.reduce((a, b) => a + b, 0) / restTimes.length;
  const ratio = avgRest / prescribedRest;

  if (ratio < 0.8) return 'fast';
  if (ratio > 1.3) return 'slow';
  return 'normal';
}

// ============================================
// ENVIRONMENT CONTEXT
// ============================================

export function buildEnvironmentContext(): EnvironmentContext {
  // In a real app, this would detect actual device state
  const isOnline =
    typeof navigator !== 'undefined' ? navigator.onLine : true;

  return {
    likelyLocation: 'unknown',
    availableEquipment: [],
    screenOrientation:
      typeof window !== 'undefined' && window.innerWidth > window.innerHeight
        ? 'landscape'
        : 'portrait',
    devicePosition: 'handheld',
    isOnline,
    connectionQuality: 'good',
  };
}

// ============================================
// FULL CONTEXT BUILDER
// ============================================

export interface ContextBuilderInput {
  sessions: SessionDataInput[];
  bodyRegions: BodyRegionInput[];
  healthData?: HealthDataInput;
  activeWorkout?: ActiveWorkoutInput | null;
  lastAppOpen?: Date;
}

export function buildFullAmbientContext(
  input: ContextBuilderInput
): FullAmbientContext {
  return {
    temporal: buildTemporalContext(input.sessions, input.lastAppOpen),
    body: buildBodyContext(input.bodyRegions, input.sessions, input.healthData),
    behavioral: buildBehavioralContext(input.sessions),
    session: buildSessionContext(input.activeWorkout ?? null),
    environment: buildEnvironmentContext(),
  };
}
