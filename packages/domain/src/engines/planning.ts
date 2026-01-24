/**
 * Planning Engine
 * Rules-based plan generation with transparent rationale
 */

import type {
  DayPlan,
  PlanType,
  PlanBlock,
  BlockType,
  PlannedExercise,
  ExercisePrescription,
  PlanRationale,
  PlanReason,
  PlanAvoidance,
  AlternativePlan,
  PlanGenerationInput,
  PlanInputs,
  MuscleRecoveryStatus,
  RecentWorkoutSummary,
  UserTrainingPreferences,
} from '../types/plan';
import type { DailySignals } from '../types/health';
import type { BodyMap, BodyRegion, BodyRegionStatus, MovementConstraint } from '../types/body';
import type { Exercise, MuscleGroup, Equipment } from '../types/exercise';
import { MUSCLE_RECOVERY_ESTIMATES, MUSCLE_GROUPS } from '../constants/muscles';
import { BODY_REGION_TO_MUSCLES } from '../constants/regions';

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Readiness rule for determining plan type
 */
interface ReadinessRule {
  id: string;
  minScore: number;
  maxScore: number;
  planType: PlanType;
  rationale: string;
}

/**
 * Readiness-based plan type rules
 * Score >= 85: full_workout (excellent)
 * Score 70-84: full_workout (good)
 * Score 50-69: moderate_workout
 * Score 35-49: light_movement
 * Score < 35: rest_day
 */
const READINESS_RULES: ReadinessRule[] = [
  {
    id: 'readiness_excellent',
    minScore: 85,
    maxScore: 100,
    planType: 'full_workout',
    rationale: 'Readiness score is excellent - you are well recovered and ready for a full session',
  },
  {
    id: 'readiness_good',
    minScore: 70,
    maxScore: 84,
    planType: 'full_workout',
    rationale: 'Readiness score is good - proceeding with planned workout',
  },
  {
    id: 'readiness_moderate',
    minScore: 50,
    maxScore: 69,
    planType: 'moderate_workout',
    rationale: 'Readiness is moderate - reducing intensity to match recovery status',
  },
  {
    id: 'readiness_low',
    minScore: 35,
    maxScore: 49,
    planType: 'light_movement',
    rationale: 'Readiness is below optimal - suggesting light movement to aid recovery',
  },
  {
    id: 'readiness_very_low',
    minScore: 0,
    maxScore: 34,
    planType: 'rest_day',
    rationale: 'Readiness is very low - rest day recommended for recovery',
  },
];

/**
 * Sleep modification rules
 */
interface SleepModification {
  maxIntensity?: 'moderate' | 'low';
  volumeMultiplier: number;
  addWarning?: string;
}

function applySleepModifications(
  signals: DailySignals,
  currentPlanType: PlanType,
  rationale: PlanRationale
): { planType: PlanType; volumeMultiplier: number } {
  let volumeMultiplier = 1.0;
  let planType = currentPlanType;

  // Severely deprived: < 5 hours
  if (signals.sleep.available && signals.sleep.duration !== undefined && signals.sleep.duration < 5) {
    planType = downgradeIfNeeded(planType, 'moderate_workout');
    volumeMultiplier = 0.6;
    rationale.reasons.push({
      category: 'readiness',
      explanation: 'Less than 5 hours of sleep significantly impairs recovery and coordination - reducing intensity and volume',
      impact: 'modified_intensity',
    });
    rationale.warnings.push('Very low sleep - consider if training is wise today');
  }
  // Deprived: < 6 hours
  else if (signals.sleep.available && signals.sleep.duration !== undefined && signals.sleep.duration < 6) {
    planType = downgradeIfNeeded(planType, 'moderate_workout');
    volumeMultiplier = 0.75;
    rationale.reasons.push({
      category: 'readiness',
      explanation: 'Less than 6 hours of sleep - moderating session to prevent overreaching',
      impact: 'modified_intensity',
    });
  }
  // Poor quality
  else if (signals.sleep.available && signals.sleep.quality !== undefined && signals.sleep.quality < 50) {
    volumeMultiplier = 0.8;
    rationale.reasons.push({
      category: 'readiness',
      explanation: 'Sleep quality was poor - adjusting volume accordingly',
      impact: 'modified_intensity',
    });
  }

  return { planType, volumeMultiplier };
}

/**
 * Apply HRV-based modifications
 */
function applyHRVModifications(
  signals: DailySignals,
  currentPlanType: PlanType,
  rationale: PlanRationale
): { planType: PlanType; volumeMultiplier: number } {
  let volumeMultiplier = 1.0;
  let planType = currentPlanType;

  if (!signals.hrv.available) {
    return { planType, volumeMultiplier };
  }

  // HRV significantly below baseline (>20% below)
  if (signals.hrv.percentFromBaseline !== undefined && signals.hrv.percentFromBaseline < -20) {
    planType = downgradeIfNeeded(planType, 'light_movement');
    volumeMultiplier = 0.5;
    rationale.reasons.push({
      category: 'recovery',
      explanation: 'HRV is significantly below your baseline - your body may be fighting something or under stress',
      impact: 'drove_plan_type',
    });
    rationale.warnings.push('HRV is more than 20% below baseline - consider if rest might be better');
  }
  // HRV below baseline (10-20% below)
  else if (signals.hrv.percentFromBaseline !== undefined && signals.hrv.percentFromBaseline < -10) {
    planType = downgradeIfNeeded(planType, 'moderate_workout');
    volumeMultiplier = 0.75;
    rationale.reasons.push({
      category: 'recovery',
      explanation: 'HRV below baseline suggests incomplete recovery - reducing load',
      impact: 'modified_intensity',
    });
  }
  // HRV trending down significantly
  else if (signals.hrv.trend === 'significantly_down') {
    rationale.warnings.push('HRV has been trending down - consider a lighter week');
  }

  return { planType, volumeMultiplier };
}

/**
 * Apply pain/injury rules - these take precedence
 */
function applyPainRules(
  input: PlanGenerationInput,
  currentPlanType: PlanType,
  rationale: PlanRationale
): { planType: PlanType; regionsToAvoid: BodyRegion[] } {
  let planType = currentPlanType;
  const regionsToAvoid: BodyRegion[] = [];

  // Check for severe pain (level 7+)
  const severePainRegions = input.bodyMap.currentStatus
    .filter(s =>
      s.level >= 7 &&
      ['pain_sharp', 'pain_dull', 'pain_burning'].includes(s.sensation)
    )
    .map(s => s.region);

  if (severePainRegions.length > 0) {
    planType = downgradeIfNeeded(planType, 'light_movement');
    regionsToAvoid.push(...severePainRegions);
    rationale.reasons.push({
      category: 'injury',
      explanation: 'Significant pain reported - avoiding affected areas and reducing overall intensity',
      impact: 'drove_plan_type',
    });
    for (const region of severePainRegions) {
      rationale.avoidances.push({
        item: region,
        reason: 'Pain level 7+ reported in this area',
      });
    }
  }

  // Check for moderate pain (level 4-6)
  const moderatePainRegions = input.bodyMap.currentStatus
    .filter(s =>
      s.level >= 4 && s.level < 7 &&
      ['pain_sharp', 'pain_dull'].includes(s.sensation)
    )
    .map(s => s.region);

  if (moderatePainRegions.length > 0) {
    regionsToAvoid.push(...moderatePainRegions);
    rationale.reasons.push({
      category: 'injury',
      explanation: 'Moderate pain reported - modifying exercises for affected areas',
      impact: 'excluded_exercises',
    });
    for (const region of moderatePainRegions) {
      rationale.avoidances.push({
        item: region,
        reason: 'Pain level 4-6 reported - reducing load for this area',
      });
    }
  }

  // Check for numbness or tingling (red flags)
  const neurologicalSymptoms = input.bodyMap.currentStatus
    .filter(s => ['numbness', 'tingling'].includes(s.sensation));

  if (neurologicalSymptoms.length > 0) {
    planType = 'mobility_only';
    rationale.reasons.push({
      category: 'injury',
      explanation: 'Numbness or tingling reported - this may indicate nerve involvement. Gentle mobility only until this resolves.',
      impact: 'drove_plan_type',
    });
    rationale.warnings.push('Neurological symptoms detected - please consult a healthcare provider');
  }

  // Check for acute injuries
  const acuteInjuries = input.bodyMap.activeInjuries.filter(i => i.status === 'acute');
  if (acuteInjuries.length > 0) {
    planType = downgradeIfNeeded(planType, 'moderate_workout');
    rationale.reasons.push({
      category: 'injury',
      explanation: 'Acute injury present - following constraints and including rehabilitation work',
      impact: 'modified_intensity',
    });
    for (const injury of acuteInjuries) {
      for (const region of injury.bodyRegions) {
        if (!regionsToAvoid.includes(region)) {
          regionsToAvoid.push(region);
        }
        rationale.avoidances.push({
          item: region,
          reason: `Acute injury: ${injury.description}`,
        });
      }
    }
  }

  return { planType, regionsToAvoid };
}

/**
 * Downgrade plan type if necessary
 */
function downgradeIfNeeded(current: PlanType, maxAllowed: PlanType): PlanType {
  const planTypeOrder: PlanType[] = [
    'full_workout',
    'moderate_workout',
    'light_movement',
    'mobility_only',
    'active_recovery',
    'rest_day',
  ];

  const currentIndex = planTypeOrder.indexOf(current);
  const maxIndex = planTypeOrder.indexOf(maxAllowed);

  if (currentIndex < maxIndex) {
    return maxAllowed;
  }
  return current;
}

/**
 * Determine plan type based on readiness score
 */
function determinePlanTypeFromReadiness(readinessScore: number): { planType: PlanType; rationale: string } {
  for (const rule of READINESS_RULES) {
    if (readinessScore >= rule.minScore && readinessScore <= rule.maxScore) {
      return { planType: rule.planType, rationale: rule.rationale };
    }
  }
  // Default fallback
  return {
    planType: 'rest_day',
    rationale: 'Unable to determine readiness - defaulting to rest',
  };
}

/**
 * Calculate muscle recovery status based on recent workouts
 */
function calculateMuscleRecoveryStatus(
  recentWorkouts: RecentWorkoutSummary[]
): Record<MuscleGroup, MuscleRecoveryStatus> {
  const now = new Date();
  const status: Record<string, MuscleRecoveryStatus> = {};

  for (const muscle of MUSCLE_GROUPS) {
    // Find most recent workout that targeted this muscle
    let lastWorked: Date | null = null;
    let lastIntensity: 'low' | 'moderate' | 'high' = 'moderate';

    for (const workout of recentWorkouts) {
      if (workout.muscleGroupsWorked.includes(muscle)) {
        if (!lastWorked || workout.date > lastWorked) {
          lastWorked = workout.date;
          lastIntensity = workout.intensity;
        }
      }
    }

    const hoursSince = lastWorked
      ? (now.getTime() - lastWorked.getTime()) / (1000 * 60 * 60)
      : 168; // Default to 7 days if never worked

    const recoveryEstimate = MUSCLE_RECOVERY_ESTIMATES[muscle];
    const requiredHours = lastIntensity === 'high'
      ? recoveryEstimate.heavy
      : lastIntensity === 'moderate'
        ? recoveryEstimate.moderate
        : recoveryEstimate.light;

    const recoveryPercent = Math.min(100, Math.round((hoursSince / requiredHours) * 100));

    status[muscle] = {
      muscleGroup: muscle,
      lastWorked: lastWorked || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      hoursSinceLastWorked: hoursSince,
      estimatedRecoveryHours: requiredHours,
      recoveryPercent,
      readyToTrain: recoveryPercent >= 90,
    };
  }

  return status as Record<MuscleGroup, MuscleRecoveryStatus>;
}

/**
 * Get muscles to avoid based on body regions
 */
function getMusclesFromRegions(regions: BodyRegion[]): string[] {
  const muscles = new Set<string>();
  for (const region of regions) {
    const regionMuscles = BODY_REGION_TO_MUSCLES[region] || [];
    for (const muscle of regionMuscles) {
      muscles.add(muscle);
    }
  }
  return Array.from(muscles);
}

/**
 * Generate rationale summary
 */
function generateRationaleSummary(planType: PlanType, rationale: PlanRationale): string {
  const parts: string[] = [];

  // Lead with the plan type decision
  switch (planType) {
    case 'full_workout':
      parts.push('Your recovery signals look good.');
      break;
    case 'moderate_workout':
      parts.push('Recovery signals suggest a moderate session today.');
      break;
    case 'light_movement':
      parts.push('Your body could use a lighter day.');
      break;
    case 'mobility_only':
      parts.push('Focusing on mobility work today.');
      break;
    case 'rehab_focus':
      parts.push('Prioritizing rehabilitation exercises today.');
      break;
    case 'active_recovery':
      parts.push('Active recovery day - gentle movement to aid recovery.');
      break;
    case 'rest_day':
      parts.push('Rest day recommended - recovery is essential for progress.');
      break;
  }

  // Add key factors
  const highImpactReasons = rationale.reasons.filter(r =>
    r.impact === 'drove_plan_type'
  );

  const firstHighImpact = highImpactReasons[0];
  if (firstHighImpact) {
    parts.push(firstHighImpact.explanation);
  }

  // Add any warnings
  const firstWarning = rationale.warnings[0];
  if (firstWarning) {
    parts.push(firstWarning);
  }

  return parts.join(' ');
}

/**
 * Generate alternative plan options
 */
function generateAlternatives(
  input: PlanGenerationInput,
  currentPlanType: PlanType
): AlternativePlan[] {
  const alternatives: AlternativePlan[] = [];

  // Suggest lighter option
  if (currentPlanType === 'full_workout' || currentPlanType === 'moderate_workout') {
    alternatives.push({
      planType: 'light_movement',
      description: 'A lighter session focusing on mobility and movement quality',
      estimatedDuration: 20,
      whyAlternative: 'If you are feeling more fatigued than expected',
    });
  }

  // Suggest more intensive if on lighter day but readiness is decent
  if (
    (currentPlanType === 'light_movement' || currentPlanType === 'active_recovery') &&
    input.dailySignals.readiness.overall >= 60
  ) {
    alternatives.push({
      planType: 'moderate_workout',
      description: 'A moderate session if you are feeling better than yesterday',
      estimatedDuration: 45,
      whyAlternative: 'If you feel up for more today',
    });
  }

  // Always offer rest day as an option (except when already rest)
  if (currentPlanType !== 'rest_day') {
    alternatives.push({
      planType: 'rest_day',
      description: 'Complete rest - sometimes the best workout is no workout',
      estimatedDuration: 0,
      whyAlternative: 'If your body is telling you to rest',
    });
  }

  return alternatives;
}

/**
 * Build plan blocks based on plan type
 */
function buildPlanBlocks(
  planType: PlanType,
  userPreferences: UserTrainingPreferences,
  availableTime: number
): PlanBlock[] {
  const blocks: PlanBlock[] = [];
  const planId = generateId();

  switch (planType) {
    case 'full_workout':
      if (userPreferences.includeWarmup) {
        blocks.push(createBlock(planId, 'warmup_dynamic', 'Dynamic Warmup', 0, 8, 'low'));
      }
      blocks.push(createBlock(planId, 'strength_main', 'Main Strength Work', 1, 25, 'high'));
      blocks.push(createBlock(planId, 'strength_accessory', 'Accessory Work', 2, 15, 'moderate'));
      if (userPreferences.includeCooldown) {
        blocks.push(createBlock(planId, 'cooldown', 'Cooldown', 3, 7, 'low'));
      }
      break;

    case 'moderate_workout':
      if (userPreferences.includeWarmup) {
        blocks.push(createBlock(planId, 'warmup_dynamic', 'Dynamic Warmup', 0, 10, 'low'));
      }
      blocks.push(createBlock(planId, 'strength_main', 'Moderate Strength Work', 1, 20, 'moderate'));
      if (userPreferences.includeCooldown) {
        blocks.push(createBlock(planId, 'cooldown', 'Cooldown & Mobility', 2, 10, 'low'));
      }
      break;

    case 'light_movement':
      blocks.push(createBlock(planId, 'warmup_general', 'Light Movement', 0, 10, 'low'));
      blocks.push(createBlock(planId, 'mobility', 'Mobility Work', 1, 15, 'low'));
      blocks.push(createBlock(planId, 'stretch_static', 'Gentle Stretching', 2, 10, 'low'));
      break;

    case 'mobility_only':
      blocks.push(createBlock(planId, 'mobility', 'Mobility Flow', 0, 20, 'low'));
      blocks.push(createBlock(planId, 'stretch_static', 'Static Stretches', 1, 15, 'low'));
      break;

    case 'active_recovery':
      blocks.push(createBlock(planId, 'warmup_general', 'Light Activity', 0, 15, 'low'));
      blocks.push(createBlock(planId, 'recovery', 'Recovery Work', 1, 15, 'low'));
      break;

    case 'rehab_focus':
      blocks.push(createBlock(planId, 'warmup_general', 'Gentle Warmup', 0, 8, 'low'));
      blocks.push(createBlock(planId, 'rehab', 'Rehabilitation Exercises', 1, 20, 'low'));
      blocks.push(createBlock(planId, 'mobility', 'Mobility', 2, 12, 'low'));
      break;

    case 'rest_day':
      // No blocks for rest day
      break;
  }

  return blocks;
}

/**
 * Create a plan block
 */
function createBlock(
  planId: string,
  blockType: BlockType,
  name: string,
  order: number,
  duration: number,
  intensity: 'low' | 'moderate' | 'high'
): PlanBlock {
  return {
    id: generateId(),
    planId,
    blockType,
    name,
    order,
    exercises: [],
    estimatedDuration: duration,
    intensity,
    status: 'pending',
  };
}

/**
 * Extract plan inputs summary
 */
function extractInputsSummary(
  input: PlanGenerationInput,
  muscleRecovery: Record<MuscleGroup, MuscleRecoveryStatus>
): PlanInputs {
  return {
    readinessScore: input.dailySignals.readiness.overall,
    readinessRecommendation: input.dailySignals.readiness.recommendation,
    activeInjuries: input.bodyMap.activeInjuries.map(i => i.id),
    activeConstraints: input.bodyMap.activeConstraints.map(c => c.id),
    recentWorkouts: input.recentWorkouts,
    muscleRecoveryStatus: muscleRecovery,
    userPreferences: input.userPreferences,
    availableEquipment: input.availableEquipment,
    availableTime: input.availableTime || input.userPreferences.typicalSessionLength,
    checkInData: input.checkIn,
  };
}

/**
 * Calculate total duration from blocks
 */
function calculateTotalDuration(blocks: PlanBlock[]): number {
  return blocks.reduce((sum, block) => sum + block.estimatedDuration, 0);
}

/**
 * Planning Engine interface
 */
export interface IPlanningEngine {
  generateDayPlan(input: PlanGenerationInput): DayPlan;
}

/**
 * Planning Engine implementation
 */
export class PlanningEngine implements IPlanningEngine {
  /**
   * Generate a day plan based on input signals
   */
  generateDayPlan(input: PlanGenerationInput): DayPlan {
    const rationale: PlanRationale = {
      summary: '',
      reasons: [],
      avoidances: [],
      warnings: [],
    };

    // Step 1: Determine base plan type from readiness
    const readinessResult = determinePlanTypeFromReadiness(
      input.dailySignals.readiness.overall
    );
    let planType = readinessResult.planType;
    rationale.reasons.push({
      category: 'readiness',
      explanation: readinessResult.rationale,
      impact: 'drove_plan_type',
    });

    // Step 2: Apply sleep modifications
    const sleepResult = applySleepModifications(
      input.dailySignals,
      planType,
      rationale
    );
    planType = sleepResult.planType;
    let volumeMultiplier = sleepResult.volumeMultiplier;

    // Step 3: Apply HRV modifications
    const hrvResult = applyHRVModifications(
      input.dailySignals,
      planType,
      rationale
    );
    planType = hrvResult.planType;
    volumeMultiplier = Math.min(volumeMultiplier, hrvResult.volumeMultiplier);

    // Step 4: Apply pain/injury rules (can override everything)
    const painResult = applyPainRules(input, planType, rationale);
    planType = painResult.planType;
    const regionsToAvoid = painResult.regionsToAvoid;

    // Step 5: Calculate muscle recovery status
    const muscleRecovery = calculateMuscleRecoveryStatus(input.recentWorkouts);

    // Step 6: Get muscles to avoid based on pain regions
    const musclesToAvoid = getMusclesFromRegions(regionsToAvoid);

    // Step 7: Build plan blocks
    const availableTime = input.availableTime || input.userPreferences.typicalSessionLength;
    const blocks = buildPlanBlocks(planType, input.userPreferences, availableTime);

    // Step 8: Generate rationale summary
    rationale.summary = generateRationaleSummary(planType, rationale);

    // Step 9: Generate alternatives
    const alternatives = generateAlternatives(input, planType);

    // Step 10: Extract inputs summary
    const inputs = extractInputsSummary(input, muscleRecovery);

    const plan: DayPlan = {
      id: generateId(),
      userId: input.userId,
      date: input.date,
      status: 'generated',
      generatedAt: new Date(),
      generatedBy: 'system',
      version: 1,
      inputs,
      planType,
      blocks,
      estimatedDuration: calculateTotalDuration(blocks),
      rationale,
      alternatives,
      modifications: [],
    };

    return plan;
  }
}

/**
 * Default planning engine instance
 */
export const planningEngine = new PlanningEngine();
