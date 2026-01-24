/**
 * Planning Engine Tests
 */

import { PlanningEngine } from '../src/engines/planning';
import type { PlanGenerationInput, DayPlan, PlanType } from '../src/types/plan';
import type { DailySignals, ReadinessScore } from '../src/types/health';
import type { BodyMap, BodyRegionStatus } from '../src/types/body';

// Helper to create mock daily signals
function createMockDailySignals(overrides: Partial<{
  readinessScore: number;
  sleepDuration: number;
  sleepQuality: number;
  hrvPercentFromBaseline: number;
}>): DailySignals {
  const readinessScore = overrides.readinessScore ?? 75;

  return {
    userId: 'test-user',
    date: new Date(),
    fetchedAt: new Date(),
    sleep: {
      available: true,
      duration: overrides.sleepDuration ?? 7,
      quality: overrides.sleepQuality ?? 80,
    },
    hrv: {
      available: true,
      current: 45,
      trend: 'stable',
      percentFromBaseline: overrides.hrvPercentFromBaseline ?? 0,
    },
    restingHR: {
      available: true,
      current: 60,
      trend: 'stable',
    },
    activity: {
      available: true,
      steps: 8000,
    },
    trainingLoad: {
      last24Hours: 100,
      last48Hours: 180,
      last7Days: 600,
      acuteLoad: 85,
      chronicLoad: 80,
      acuteChronicRatio: 1.06,
    },
    readiness: {
      overall: readinessScore,
      components: {
        sleep: 80,
        recovery: 75,
        fatigue: 70,
        body: 80,
      },
      recommendation: readinessScore >= 70 ? 'full_intensity' : readinessScore >= 50 ? 'moderate' : 'rest',
      factors: [],
      summary: 'Test readiness summary',
    },
  };
}

// Helper to create mock body map
function createMockBodyMap(painRegions: Array<{
  region: BodyRegionStatus['region'];
  level: BodyRegionStatus['level'];
  sensation: BodyRegionStatus['sensation'];
}> = []): BodyMap {
  return {
    userId: 'test-user',
    currentStatus: painRegions.map(p => ({
      region: p.region,
      level: p.level,
      sensation: p.sensation,
      timestamp: new Date(),
    })),
    activeInjuries: [],
    injuryHistory: [],
    activeConstraints: [],
    lastUpdated: new Date(),
  };
}

// Helper to create mock user preferences
function createMockUserPreferences() {
  return {
    preferredDays: ['monday', 'wednesday', 'friday'] as const,
    preferredTimeOfDay: 'morning' as const,
    typicalSessionLength: 45,
    experienceLevel: 'intermediate' as const,
    primaryGoal: 'general_fitness' as const,
    preferredRepRange: 'mixed' as const,
    preferredEquipment: [],
    avoidedEquipment: [],
    favoriteExercises: [],
    dislikedExercises: [],
    autoProgressWeights: false,
    progressionAggressiveness: 'moderate' as const,
    deloadFrequency: 'auto' as const,
    weightUnit: 'kg' as const,
    includeWarmup: true,
    includeCooldown: true,
    includeRehabInWorkout: false,
  };
}

// Helper to create full mock input
function createMockInput(overrides: Partial<{
  readinessScore: number;
  sleepDuration: number;
  sleepQuality: number;
  hrvPercentFromBaseline: number;
  painRegions: Array<{
    region: BodyRegionStatus['region'];
    level: BodyRegionStatus['level'];
    sensation: BodyRegionStatus['sensation'];
  }>;
}>): PlanGenerationInput {
  return {
    userId: 'test-user',
    date: new Date(),
    dailySignals: createMockDailySignals(overrides),
    bodyMap: createMockBodyMap(overrides.painRegions),
    userPreferences: createMockUserPreferences(),
    recentWorkouts: [],
    availableEquipment: ['dumbbell', 'resistance_band', 'yoga_mat'],
    availableTime: 45,
  };
}

describe('PlanningEngine', () => {
  let engine: PlanningEngine;

  beforeEach(() => {
    engine = new PlanningEngine();
  });

  describe('Plan Type Selection Based on Readiness', () => {
    test('readiness >= 85 generates full_workout', () => {
      const input = createMockInput({ readinessScore: 90 });
      const plan = engine.generateDayPlan(input);

      expect(plan.planType).toBe('full_workout');
      expect(plan.rationale.summary).toContain('look good');
    });

    test('readiness 70-84 generates full_workout', () => {
      const input = createMockInput({ readinessScore: 75 });
      const plan = engine.generateDayPlan(input);

      expect(plan.planType).toBe('full_workout');
    });

    test('readiness 50-69 generates moderate_workout', () => {
      const input = createMockInput({ readinessScore: 55 });
      const plan = engine.generateDayPlan(input);

      expect(plan.planType).toBe('moderate_workout');
      expect(plan.rationale.summary).toContain('moderate');
    });

    test('readiness 35-49 generates light_movement', () => {
      const input = createMockInput({ readinessScore: 40 });
      const plan = engine.generateDayPlan(input);

      expect(plan.planType).toBe('light_movement');
      expect(plan.rationale.summary).toContain('lighter');
    });

    test('readiness < 35 generates rest_day', () => {
      const input = createMockInput({ readinessScore: 20 });
      const plan = engine.generateDayPlan(input);

      expect(plan.planType).toBe('rest_day');
      expect(plan.rationale.summary).toContain('Rest');
    });
  });

  describe('Sleep Modifications', () => {
    test('sleep < 5 hours downgrades to moderate and adds warning', () => {
      const input = createMockInput({
        readinessScore: 85,
        sleepDuration: 4.5,
      });
      const plan = engine.generateDayPlan(input);

      // Should be downgraded from full_workout
      expect(plan.planType).toBe('moderate_workout');
      expect(plan.rationale.warnings.length).toBeGreaterThan(0);
    });

    test('sleep < 6 hours downgrades to moderate', () => {
      const input = createMockInput({
        readinessScore: 85,
        sleepDuration: 5.5,
      });
      const plan = engine.generateDayPlan(input);

      expect(plan.planType).toBe('moderate_workout');
    });

    test('poor sleep quality adds volume reduction rationale', () => {
      const input = createMockInput({
        readinessScore: 85,
        sleepQuality: 40,
      });
      const plan = engine.generateDayPlan(input);

      const sleepReason = plan.rationale.reasons.find(
        r => r.explanation.toLowerCase().includes('sleep quality')
      );
      expect(sleepReason).toBeDefined();
    });
  });

  describe('HRV Modifications', () => {
    test('HRV > 20% below baseline generates light_movement', () => {
      const input = createMockInput({
        readinessScore: 85,
        hrvPercentFromBaseline: -25,
      });
      const plan = engine.generateDayPlan(input);

      expect(plan.planType).toBe('light_movement');
      expect(plan.rationale.warnings.length).toBeGreaterThan(0);
    });

    test('HRV 10-20% below baseline generates moderate_workout', () => {
      const input = createMockInput({
        readinessScore: 85,
        hrvPercentFromBaseline: -15,
      });
      const plan = engine.generateDayPlan(input);

      expect(plan.planType).toBe('moderate_workout');
    });
  });

  describe('Pain Rules', () => {
    test('severe pain (level 7+) downgrades plan and avoids region', () => {
      const input = createMockInput({
        readinessScore: 85,
        painRegions: [
          { region: 'knee_left', level: 8, sensation: 'pain_sharp' },
        ],
      });
      const plan = engine.generateDayPlan(input);

      expect(plan.planType).toBe('light_movement');
      expect(plan.rationale.avoidances).toContainEqual(
        expect.objectContaining({ item: 'knee_left' })
      );
    });

    test('moderate pain (level 4-6) adds avoidance but may not downgrade', () => {
      const input = createMockInput({
        readinessScore: 85,
        painRegions: [
          { region: 'shoulder_left', level: 5, sensation: 'pain_dull' },
        ],
      });
      const plan = engine.generateDayPlan(input);

      expect(plan.rationale.avoidances).toContainEqual(
        expect.objectContaining({ item: 'shoulder_left' })
      );
    });

    test('numbness generates mobility_only plan', () => {
      const input = createMockInput({
        readinessScore: 85,
        painRegions: [
          { region: 'hand_left', level: 3, sensation: 'numbness' },
        ],
      });
      const plan = engine.generateDayPlan(input);

      expect(plan.planType).toBe('mobility_only');
      expect(plan.rationale.warnings.length).toBeGreaterThan(0);
    });

    test('tingling generates mobility_only plan', () => {
      const input = createMockInput({
        readinessScore: 85,
        painRegions: [
          { region: 'lower_back', level: 4, sensation: 'tingling' },
        ],
      });
      const plan = engine.generateDayPlan(input);

      expect(plan.planType).toBe('mobility_only');
    });
  });

  describe('Plan Structure', () => {
    test('full_workout includes warmup, main, accessory, cooldown blocks', () => {
      const input = createMockInput({ readinessScore: 90 });
      const plan = engine.generateDayPlan(input);

      expect(plan.blocks.length).toBeGreaterThanOrEqual(3);
      expect(plan.blocks.some(b => b.blockType === 'warmup_dynamic')).toBe(true);
      expect(plan.blocks.some(b => b.blockType === 'strength_main')).toBe(true);
      expect(plan.blocks.some(b => b.blockType === 'cooldown')).toBe(true);
    });

    test('rest_day has no blocks', () => {
      const input = createMockInput({ readinessScore: 20 });
      const plan = engine.generateDayPlan(input);

      expect(plan.blocks.length).toBe(0);
    });

    test('plan includes alternatives', () => {
      const input = createMockInput({ readinessScore: 75 });
      const plan = engine.generateDayPlan(input);

      expect(plan.alternatives.length).toBeGreaterThan(0);
    });
  });

  describe('Rationale Generation', () => {
    test('rationale includes summary', () => {
      const input = createMockInput({ readinessScore: 75 });
      const plan = engine.generateDayPlan(input);

      expect(plan.rationale.summary).toBeTruthy();
      expect(typeof plan.rationale.summary).toBe('string');
    });

    test('rationale includes reasons', () => {
      const input = createMockInput({ readinessScore: 75 });
      const plan = engine.generateDayPlan(input);

      expect(plan.rationale.reasons.length).toBeGreaterThan(0);
      expect(plan.rationale.reasons[0]).toHaveProperty('category');
      expect(plan.rationale.reasons[0]).toHaveProperty('explanation');
    });
  });

  describe('Plan Metadata', () => {
    test('plan has required metadata fields', () => {
      const input = createMockInput({ readinessScore: 75 });
      const plan = engine.generateDayPlan(input);

      expect(plan.id).toBeTruthy();
      expect(plan.userId).toBe('test-user');
      expect(plan.status).toBe('generated');
      expect(plan.generatedBy).toBe('system');
      expect(plan.version).toBe(1);
      expect(plan.generatedAt).toBeInstanceOf(Date);
    });

    test('plan duration is calculated from blocks', () => {
      const input = createMockInput({ readinessScore: 85 });
      const plan = engine.generateDayPlan(input);

      const totalBlockDuration = plan.blocks.reduce(
        (sum, block) => sum + block.estimatedDuration,
        0
      );
      expect(plan.estimatedDuration).toBe(totalBlockDuration);
    });
  });
});
