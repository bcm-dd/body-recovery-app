/**
 * Mock Health Adapter
 *
 * Provides realistic fake health data for demo mode and testing.
 * Uses seeded random for reproducible data generation.
 */

import type {
  HealthAdapter,
  HealthAvailability,
  HealthPermissionStatus,
  HealthResult,
  DateRange,
  SleepSession,
  SleepStage,
  HRVSample,
  HeartRateSample,
  StepCount,
  HealthWorkout,
  BodyMeasurement,
  MobilityMetrics,
  DailyHealthSnapshot,
  HealthDataType,
  HealthWriteType,
  ReadinessFactors,
  WorkoutActivityType,
} from './types';

// ============================================
// SEEDED RANDOM UTILITIES
// ============================================

/**
 * Seeded random number generator for reproducible data
 */
function seededRandom(seed: number): () => number {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/**
 * Normal distribution random (Box-Muller transform)
 * Provides more realistic data distribution
 */
function normalRandom(
  mean: number,
  stdDev: number,
  random: () => number
): number {
  const u1 = random();
  const u2 = random();
  const z = Math.sqrt(-2 * Math.log(u1 || 0.0001)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

/**
 * Clamp value to range
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Generate unique ID
 */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================
// DATA GENERATORS
// ============================================

/**
 * Generate sleep sessions for a date range
 */
function generateSleepSessions(range: DateRange, seed: number): SleepSession[] {
  const random = seededRandom(seed);
  const sessions: SleepSession[] = [];

  const currentDate = new Date(range.startDate);
  currentDate.setHours(0, 0, 0, 0);

  const endDate = new Date(range.endDate);
  endDate.setHours(23, 59, 59, 999);

  while (currentDate <= endDate) {
    // Most nights have sleep data (90%)
    if (random() > 0.1) {
      const bedtime = new Date(currentDate);
      bedtime.setHours(22 + Math.floor(random() * 2), Math.floor(random() * 60), 0, 0);

      // Sleep duration: mean 420 min (7h), stddev 60 min
      const duration = clamp(normalRandom(420, 60, random), 240, 600);
      const wakeTime = new Date(bedtime.getTime() + duration * 60 * 1000);

      // Generate sleep stages
      const stages = generateSleepStages(bedtime, wakeTime, random);

      // Calculate quality from stages
      const deepMinutes = stages
        .filter((s) => s.stage === 'deep')
        .reduce((sum, s) => sum + s.duration, 0);
      const remMinutes = stages
        .filter((s) => s.stage === 'rem')
        .reduce((sum, s) => sum + s.duration, 0);

      const quality = Math.round(
        clamp(
          50 + (deepMinutes / duration) * 100 + (remMinutes / duration) * 75,
          30,
          100
        )
      );

      sessions.push({
        id: generateId('sleep'),
        startDate: bedtime,
        endDate: wakeTime,
        duration: Math.round(duration),
        source: 'Apple Watch (Mock)',
        stages,
        quality,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return sessions;
}

/**
 * Generate realistic sleep stages for a sleep session
 */
function generateSleepStages(
  start: Date,
  end: Date,
  random: () => number
): SleepStage[] {
  const stages: SleepStage[] = [];
  let currentTime = start.getTime();
  const endTime = end.getTime();

  // Sleep cycles are ~90 minutes
  let cycleIndex = 0;

  while (currentTime < endTime) {
    const remainingTime = endTime - currentTime;

    // Light sleep (core)
    const lightDuration = clamp(
      normalRandom(20, 5, random) * 60 * 1000,
      10 * 60 * 1000,
      Math.min(30 * 60 * 1000, remainingTime)
    );

    stages.push({
      stage: 'core',
      startDate: new Date(currentTime),
      endDate: new Date(currentTime + lightDuration),
      duration: Math.round(lightDuration / 60000),
    });
    currentTime += lightDuration;

    if (currentTime >= endTime) break;

    // Deep sleep (more in first half of night)
    const deepProbability = cycleIndex < 2 ? 0.8 : 0.3;

    if (random() < deepProbability) {
      const deepDuration = clamp(
        normalRandom(cycleIndex < 2 ? 30 : 15, 10, random) * 60 * 1000,
        10 * 60 * 1000,
        Math.min(45 * 60 * 1000, endTime - currentTime)
      );

      stages.push({
        stage: 'deep',
        startDate: new Date(currentTime),
        endDate: new Date(currentTime + deepDuration),
        duration: Math.round(deepDuration / 60000),
      });
      currentTime += deepDuration;
    }

    if (currentTime >= endTime) break;

    // REM sleep (more in second half of night)
    const remProbability = cycleIndex > 1 ? 0.9 : 0.6;

    if (random() < remProbability) {
      const remDuration = clamp(
        normalRandom(cycleIndex > 1 ? 25 : 15, 8, random) * 60 * 1000,
        5 * 60 * 1000,
        Math.min(40 * 60 * 1000, endTime - currentTime)
      );

      stages.push({
        stage: 'rem',
        startDate: new Date(currentTime),
        endDate: new Date(currentTime + remDuration),
        duration: Math.round(remDuration / 60000),
      });
      currentTime += remDuration;
    }

    // Brief awake period between cycles (20% chance)
    if (random() < 0.2 && currentTime < endTime) {
      const awakeDuration = clamp(
        random() * 5 * 60 * 1000,
        1 * 60 * 1000,
        Math.min(5 * 60 * 1000, endTime - currentTime)
      );

      stages.push({
        stage: 'awake',
        startDate: new Date(currentTime),
        endDate: new Date(currentTime + awakeDuration),
        duration: Math.round(awakeDuration / 60000),
      });
      currentTime += awakeDuration;
    }

    cycleIndex++;
  }

  return stages;
}

/**
 * Generate HRV samples
 */
function generateHRVSamples(range: DateRange, seed: number): HRVSample[] {
  const random = seededRandom(seed);
  const samples: HRVSample[] = [];

  // Base HRV varies by person (30-60ms base, determined by seed)
  const baseHRV = 30 + (seed % 30);

  const currentDate = new Date(range.startDate);

  while (currentDate <= range.endDate) {
    // 85% of days have HRV data
    if (random() > 0.15) {
      const sampleTime = new Date(currentDate);
      // HRV typically measured in morning
      sampleTime.setHours(
        6 + Math.floor(random() * 3),
        Math.floor(random() * 60),
        0,
        0
      );

      // Daily variation with realistic range
      const dailyVariation = normalRandom(0, 8, random);
      const value = clamp(baseHRV + dailyVariation, 15, 100);

      samples.push({
        timestamp: sampleTime,
        value: Math.round(value),
        source: 'Apple Watch (Mock)',
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return samples.reverse(); // Most recent first
}

/**
 * Generate resting heart rate samples
 */
function generateRestingHeartRate(
  range: DateRange,
  seed: number
): HeartRateSample[] {
  const random = seededRandom(seed);
  const samples: HeartRateSample[] = [];

  // Base RHR varies by person (55-70 bpm)
  const baseRHR = 55 + (seed % 15);

  const currentDate = new Date(range.startDate);

  while (currentDate <= range.endDate) {
    if (random() > 0.1) {
      const sampleTime = new Date(currentDate);
      sampleTime.setHours(7, 0, 0, 0);

      const dailyVariation = normalRandom(0, 3, random);
      const bpm = clamp(baseRHR + dailyVariation, 40, 90);

      samples.push({
        timestamp: sampleTime,
        bpm: Math.round(bpm),
        context: 'resting',
        source: 'Apple Watch (Mock)',
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return samples;
}

/**
 * Generate step counts
 */
function generateStepCounts(range: DateRange, seed: number): StepCount[] {
  const random = seededRandom(seed);
  const counts: StepCount[] = [];

  const currentDate = new Date(range.startDate);

  while (currentDate <= range.endDate) {
    const isWeekend =
      currentDate.getDay() === 0 || currentDate.getDay() === 6;
    // Weekdays tend to have more steps (commuting, etc.)
    const baseSteps = isWeekend ? 6000 : 8000;

    const steps = clamp(normalRandom(baseSteps, 2500, random), 1000, 25000);

    counts.push({
      date: new Date(currentDate),
      count: Math.round(steps),
      source: 'iPhone (Mock)',
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return counts;
}

/**
 * Generate workouts
 */
function generateWorkouts(range: DateRange, seed: number): HealthWorkout[] {
  const random = seededRandom(seed);
  const workouts: HealthWorkout[] = [];

  const currentDate = new Date(range.startDate);

  while (currentDate <= range.endDate) {
    // ~4 workouts per week (57% chance per day)
    if (random() < 0.57) {
      const workoutTime = new Date(currentDate);
      const isMorning = random() > 0.5;
      workoutTime.setHours(
        isMorning ? 7 : 18,
        Math.floor(random() * 60),
        0,
        0
      );

      // Duration: 45 mins +/- 15
      const duration = normalRandom(45, 15, random) * 60;

      const types: WorkoutActivityType[] = [
        'strength_training',
        'strength_training',
        'strength_training',
        'running',
        'cycling',
        'yoga',
        'flexibility',
      ];
      const activityType = types[Math.floor(random() * types.length)];

      workouts.push({
        id: generateId('workout'),
        activityType,
        startDate: workoutTime,
        endDate: new Date(workoutTime.getTime() + duration * 1000),
        duration: Math.round(duration),
        activeEnergy: Math.round((duration / 60) * 8), // ~8 kcal/min
        averageHeartRate: Math.round(normalRandom(135, 15, random)),
        maxHeartRate: Math.round(normalRandom(165, 10, random)),
        source: 'Apple Watch (Mock)',
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workouts;
}

/**
 * Generate body measurements
 */
function generateBodyMeasurements(
  range: DateRange,
  seed: number
): BodyMeasurement[] {
  const random = seededRandom(seed);
  const measurements: BodyMeasurement[] = [];

  // Base weight determined by seed (70-100kg)
  const baseWeight = 70 + (seed % 30);

  const currentDate = new Date(range.startDate);

  while (currentDate <= range.endDate) {
    // Weight measured ~once per week
    if (random() < 0.15) {
      const measureTime = new Date(currentDate);
      measureTime.setHours(7, 0, 0, 0);

      measurements.push({
        timestamp: measureTime,
        weight: Number(clamp(normalRandom(baseWeight, 0.5, random), 40, 150).toFixed(1)),
        bodyFat:
          random() > 0.5
            ? Number(clamp(normalRandom(20, 3, random), 5, 40).toFixed(1))
            : undefined,
        source: 'Smart Scale (Mock)',
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return measurements;
}

/**
 * Generate mobility metrics
 */
function generateMobilityMetrics(
  range: DateRange,
  seed: number
): MobilityMetrics[] {
  const random = seededRandom(seed);
  const metrics: MobilityMetrics[] = [];

  const currentDate = new Date(range.startDate);

  while (currentDate <= range.endDate) {
    // Mobility metrics available ~70% of days
    if (random() > 0.3) {
      metrics.push({
        date: new Date(currentDate),
        walkingAsymmetry: Number(
          clamp(normalRandom(3, 2, random), 0, 15).toFixed(1)
        ),
        walkingSpeed: Number(
          clamp(normalRandom(1.2, 0.15, random), 0.8, 1.6).toFixed(2)
        ),
        stepLength: Number(
          clamp(normalRandom(0.7, 0.08, random), 0.5, 0.9).toFixed(2)
        ),
        source: 'iPhone (Mock)',
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return metrics;
}

/**
 * Calculate readiness score from health data
 */
function calculateReadinessScore(snapshot: DailyHealthSnapshot): {
  score: number;
  factors: ReadinessFactors;
} {
  // Sleep factor (30% weight)
  let sleepScore = 50;
  if (snapshot.sleepDuration) {
    if (snapshot.sleepDuration >= 420 && snapshot.sleepDuration <= 540) {
      sleepScore = 90;
    } else if (snapshot.sleepDuration >= 360) {
      sleepScore = 70;
    } else if (snapshot.sleepDuration < 300) {
      sleepScore = 30;
    }
    if (snapshot.sleepQuality && snapshot.sleepQuality > 70) {
      sleepScore += 10;
    }
  }
  sleepScore = clamp(sleepScore, 0, 100);

  // Recovery factor (35% weight) - based on HRV
  let recoveryScore = 50;
  if (snapshot.hrvAverage) {
    if (snapshot.hrvAverage >= 50) {
      recoveryScore = 85;
    } else if (snapshot.hrvAverage >= 40) {
      recoveryScore = 70;
    } else if (snapshot.hrvAverage < 30) {
      recoveryScore = 40;
    }
  }
  recoveryScore = clamp(recoveryScore, 0, 100);

  // Strain factor (20% weight)
  let strainScore = 70;
  if (snapshot.workoutCount && snapshot.workoutCount > 0) {
    strainScore -= 10 * snapshot.workoutCount;
  }
  strainScore = clamp(strainScore, 0, 100);

  // Body factor (15% weight) - placeholder, would use injury data
  const bodyScore = 85;

  const factors: ReadinessFactors = {
    sleep: Math.round(sleepScore),
    recovery: Math.round(recoveryScore),
    strain: Math.round(strainScore),
    body: Math.round(bodyScore),
  };

  // Weighted average
  const score = Math.round(
    factors.sleep * 0.3 +
      factors.recovery * 0.35 +
      factors.strain * 0.2 +
      factors.body * 0.15
  );

  return { score, factors };
}

/**
 * Generate a complete daily snapshot
 */
function generateDailySnapshot(date: Date, seed: number): DailyHealthSnapshot {
  const random = seededRandom(seed + date.getTime());
  const dateStr = date.toISOString().split('T')[0];

  // Generate base HRV and RHR for this "person"
  const baseHRV = 30 + (seed % 30);
  const baseRHR = 55 + (seed % 15);

  // Sleep duration with variation
  const sleepDuration = Math.round(clamp(normalRandom(420, 60, random), 240, 600));
  const deepSleepRatio = clamp(normalRandom(0.15, 0.05, random), 0.1, 0.25);
  const remSleepRatio = clamp(normalRandom(0.22, 0.05, random), 0.15, 0.3);

  const deepSleepMinutes = Math.round(sleepDuration * deepSleepRatio);
  const remSleepMinutes = Math.round(sleepDuration * remSleepRatio);
  const sleepQuality = Math.round(
    clamp(50 + deepSleepRatio * 150 + remSleepRatio * 100, 30, 100)
  );

  // HRV with daily variation
  const hrvAverage = Math.round(clamp(normalRandom(baseHRV, 8, random), 15, 100));
  const restingHeartRate = Math.round(clamp(normalRandom(baseRHR, 3, random), 40, 90));

  // Steps based on day of week
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const baseSteps = isWeekend ? 6000 : 8000;
  const steps = Math.round(clamp(normalRandom(baseSteps, 2500, random), 1000, 25000));

  // Workouts
  const hasWorkout = random() < 0.57;
  const workoutMinutes = hasWorkout ? Math.round(normalRandom(45, 15, random)) : 0;
  const workoutCount = hasWorkout ? 1 : 0;

  // Active energy
  const activeEnergy = Math.round(
    (steps * 0.04) + (workoutMinutes * 8)
  );

  // Create snapshot
  const snapshot: DailyHealthSnapshot = {
    date: dateStr,
    sleepDuration,
    sleepQuality,
    deepSleepMinutes,
    remSleepMinutes,
    sleepEfficiency: Math.round(clamp(normalRandom(92, 5, random), 75, 99)),
    restingHeartRate,
    hrvAverage,
    steps,
    activeEnergy,
    workoutMinutes,
    workoutCount,
    dataCompleteness: 85,
    sources: ['Apple Watch (Mock)', 'iPhone (Mock)'],
    syncedAt: new Date(),
  };

  // Calculate readiness
  const { score, factors } = calculateReadinessScore(snapshot);
  snapshot.readinessScore = score;
  snapshot.readinessFactors = factors;

  return snapshot;
}

/**
 * Generate snapshots for a date range
 */
function generateDailySnapshots(
  range: DateRange,
  seed: number
): DailyHealthSnapshot[] {
  const snapshots: DailyHealthSnapshot[] = [];
  const currentDate = new Date(range.startDate);

  while (currentDate <= range.endDate) {
    snapshots.push(generateDailySnapshot(new Date(currentDate), seed));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return snapshots;
}

// ============================================
// MOCK HEALTH ADAPTER
// ============================================

/**
 * Mock adapter for demo mode and testing
 * Provides realistic fake data without requiring health permissions
 */
export class MockHealthAdapter implements HealthAdapter {
  private permissionsGranted = false;
  private mockDataSeed: number;
  private updateCallbacks: Set<(snapshot: DailyHealthSnapshot) => void> =
    new Set();
  /** Map of callbacks to their interval IDs for proper cleanup */
  private activeIntervals: Map<(snapshot: DailyHealthSnapshot) => void, ReturnType<typeof setInterval>> =
    new Map();

  constructor(seed?: number) {
    // Seed for reproducible data (useful for testing)
    this.mockDataSeed = seed || Date.now();
  }

  async isAvailable(): Promise<HealthAvailability> {
    return 'available';
  }

  async requestPermissions(
    read: HealthDataType[],
    _write?: HealthWriteType[]
  ): Promise<HealthResult<HealthPermissionStatus>> {
    // Simulate permission grant
    this.permissionsGranted = true;

    return {
      success: true,
      data: this.buildFullPermissions(read, _write),
    };
  }

  async getPermissionStatus(): Promise<HealthPermissionStatus> {
    return this.buildFullPermissions();
  }

  async hasMinimumPermissions(): Promise<boolean> {
    return this.permissionsGranted;
  }

  async getSleep(range: DateRange): Promise<HealthResult<SleepSession[]>> {
    const sessions = generateSleepSessions(range, this.mockDataSeed);
    return { success: true, data: sessions };
  }

  async getLastNightSleep(): Promise<HealthResult<SleepSession | null>> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(20, 0, 0, 0);

    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const result = await this.getSleep({ startDate: yesterday, endDate: today });

    if (result.success && result.data.length > 0) {
      return { success: true, data: result.data[result.data.length - 1] };
    }

    return { success: true, data: null };
  }

  async getHRV(range: DateRange): Promise<HealthResult<HRVSample[]>> {
    const samples = generateHRVSamples(range, this.mockDataSeed);
    return { success: true, data: samples };
  }

  async getLatestHRV(): Promise<HealthResult<HRVSample | null>> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const result = await this.getHRV({ startDate: yesterday, endDate: now });

    if (result.success && result.data.length > 0) {
      return { success: true, data: result.data[0] };
    }

    return { success: true, data: null };
  }

  async getRestingHeartRate(
    range: DateRange
  ): Promise<HealthResult<HeartRateSample[]>> {
    const samples = generateRestingHeartRate(range, this.mockDataSeed);
    return { success: true, data: samples };
  }

  async getTodayRestingHeartRate(): Promise<HealthResult<number | null>> {
    const random = seededRandom(this.mockDataSeed + Date.now());
    const baseRHR = 55 + (this.mockDataSeed % 15);
    const rhr = Math.round(clamp(normalRandom(baseRHR, 3, random), 40, 90));
    return { success: true, data: rhr };
  }

  async getHeartRate(
    _range: DateRange
  ): Promise<HealthResult<HeartRateSample[]>> {
    // Simplified - return empty for now
    return { success: true, data: [] };
  }

  async getSteps(range: DateRange): Promise<HealthResult<StepCount[]>> {
    const steps = generateStepCounts(range, this.mockDataSeed);
    return { success: true, data: steps };
  }

  async getTodaySteps(): Promise<HealthResult<number>> {
    const random = seededRandom(this.mockDataSeed + Date.now());
    const hour = new Date().getHours();
    // Steps accumulate throughout the day
    const expectedByNow = (hour / 24) * 8000;
    const steps = Math.round(
      clamp(normalRandom(expectedByNow, 1500, random), 0, 20000)
    );
    return { success: true, data: steps };
  }

  async getWorkouts(range: DateRange): Promise<HealthResult<HealthWorkout[]>> {
    const workouts = generateWorkouts(range, this.mockDataSeed);
    return { success: true, data: workouts };
  }

  async getActiveEnergy(range: DateRange): Promise<HealthResult<number>> {
    const random = seededRandom(this.mockDataSeed);
    const days = Math.ceil(
      (range.endDate.getTime() - range.startDate.getTime()) /
        (24 * 60 * 60 * 1000)
    );
    return {
      success: true,
      data: Math.round(normalRandom(400, 100, random) * days),
    };
  }

  async getBodyMeasurements(
    range: DateRange
  ): Promise<HealthResult<BodyMeasurement[]>> {
    const measurements = generateBodyMeasurements(range, this.mockDataSeed);
    return { success: true, data: measurements };
  }

  async getLatestBodyMeasurement(): Promise<
    HealthResult<BodyMeasurement | null>
  > {
    const random = seededRandom(this.mockDataSeed);
    const baseWeight = 70 + (this.mockDataSeed % 30);

    return {
      success: true,
      data: {
        timestamp: new Date(),
        weight: Number(clamp(normalRandom(baseWeight, 0.5, random), 40, 150).toFixed(1)),
        bodyFat: Number(clamp(normalRandom(20, 3, random), 5, 40).toFixed(1)),
        source: 'Smart Scale (Mock)',
      },
    };
  }

  async getMobilityMetrics(
    range: DateRange
  ): Promise<HealthResult<MobilityMetrics[]>> {
    const metrics = generateMobilityMetrics(range, this.mockDataSeed);
    return { success: true, data: metrics };
  }

  async writeWorkout(
    _workout: Omit<HealthWorkout, 'id' | 'source'>
  ): Promise<HealthResult<string>> {
    // Simulate successful write
    const id = generateId('mock-workout');
    return { success: true, data: id };
  }

  async getDailySnapshot(
    date: Date
  ): Promise<HealthResult<DailyHealthSnapshot>> {
    const snapshot = generateDailySnapshot(date, this.mockDataSeed);
    return { success: true, data: snapshot };
  }

  async getDailySnapshots(
    range: DateRange
  ): Promise<HealthResult<DailyHealthSnapshot[]>> {
    const snapshots = generateDailySnapshots(range, this.mockDataSeed);
    return { success: true, data: snapshots };
  }

  async syncHealthData(
    days: number = 7
  ): Promise<HealthResult<DailyHealthSnapshot[]>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.getDailySnapshots({ startDate, endDate });
  }

  subscribeToUpdates(
    callback: (snapshot: DailyHealthSnapshot) => void
  ): () => void {
    this.updateCallbacks.add(callback);

    // Simulate periodic updates every 5 minutes
    const interval = setInterval(async () => {
      const result = await this.getDailySnapshot(new Date());
      if (result.success) {
        callback(result.data);
      }
    }, 5 * 60 * 1000);

    // Store interval ID for proper cleanup
    this.activeIntervals.set(callback, interval);

    return () => {
      this.updateCallbacks.delete(callback);
      const storedInterval = this.activeIntervals.get(callback);
      if (storedInterval) {
        clearInterval(storedInterval);
        this.activeIntervals.delete(callback);
      }
    };
  }

  /**
   * Cleanup all active intervals and subscriptions.
   * Call this when disposing of the adapter to prevent memory leaks.
   */
  dispose(): void {
    // Clear all active intervals
    for (const interval of this.activeIntervals.values()) {
      clearInterval(interval);
    }
    this.activeIntervals.clear();
    this.updateCallbacks.clear();
  }

  async initializeBackgroundSync(): Promise<void> {
    // No-op for mock
  }

  async isBackgroundSyncEnabled(): Promise<boolean> {
    return true;
  }

  private buildFullPermissions(
    read?: HealthDataType[],
    write?: HealthWriteType[]
  ): HealthPermissionStatus {
    const allRead: HealthDataType[] = read || [
      'steps',
      'sleep',
      'sleepStages',
      'heartRate',
      'restingHeartRate',
      'hrv',
      'activeEnergy',
      'workouts',
      'weight',
      'bodyFat',
    ];

    const allWrite: HealthWriteType[] = write || ['workout', 'activeEnergy'];

    return {
      read: Object.fromEntries(
        allRead.map((type) => [type, 'available' as HealthAvailability])
      ) as Partial<Record<HealthDataType, HealthAvailability>>,
      write: Object.fromEntries(
        allWrite.map((type) => [type, 'available' as HealthAvailability])
      ) as Partial<Record<HealthWriteType, HealthAvailability>>,
    };
  }
}
