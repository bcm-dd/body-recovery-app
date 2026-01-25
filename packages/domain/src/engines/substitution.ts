/**
 * Substitution Engine
 * Finds and ranks exercise substitutes based on similarity scoring
 */

import { calculateMuscleOverlap } from '../constants/muscles';
import { areSimilarPatterns } from '../constants/patterns';
import type { MovementConstraint } from '../types/body';
import type {
  Exercise,
  Equipment,
  JointAction,
  SkillLevel,
} from '../types/exercise';
import type { SubstituteExercise, UserTrainingPreferences } from '../types/plan';

/**
 * Context for finding substitutes
 */
export interface SubstitutionContext {
  availableEquipment: Equipment[];
  constraints: MovementConstraint[];
  userPreferences: UserTrainingPreferences;
  recentlyUsedExercises?: string[];
}

/**
 * Factor contributing to substitution score
 */
export interface SubstitutionFactor {
  name: string;
  score: number;
  maxScore: number;
  explanation: string;
}

/**
 * Detailed substitution score
 */
export interface SubstitutionScore {
  candidateId: string;
  candidateName: string;
  totalScore: number;
  factors: SubstitutionFactor[];
  isViable: boolean;
}

/**
 * Scoring weights for substitution calculation
 * Total: 100 points base + bonuses
 */
const SCORING_WEIGHTS = {
  muscleMatch: 40,        // Primary muscle overlap
  movementPattern: 25,    // Movement pattern similarity
  equipment: 15,          // Equipment availability
  difficulty: 10,         // Skill level match
  jointActions: 10,       // Joint action similarity
  directSubstitute: 15,   // Bonus: listed as direct substitute
  userFavorite: 10,       // Bonus: user's favorite
  userDislike: -20,       // Penalty: user dislikes
  constraintViolation: -100, // Eliminates candidate
} as const;

/**
 * Calculate joint action overlap (0-1)
 */
function calculateJointOverlap(
  actions1: JointAction[],
  actions2: JointAction[]
): number {
  if (actions1.length === 0 || actions2.length === 0) return 0;

  const set1 = new Set(actions1);
  const set2 = new Set(actions2);

  let matches = 0;
  for (const action of set1) {
    if (set2.has(action)) {
      matches++;
    }
  }

  const smallerSetSize = Math.min(set1.size, set2.size);
  return matches / smallerSetSize;
}

/**
 * Get skill level index for comparison
 */
function getSkillLevelIndex(level: SkillLevel): number {
  const levels: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
  return levels.indexOf(level);
}

/**
 * Check if an exercise violates any constraints
 */
function exerciseViolatesConstraint(
  exercise: Exercise,
  constraint: MovementConstraint
): boolean {
  // Check movement pattern constraints
  if (
    constraint.movementPatterns &&
    constraint.constraintType === 'avoid_movement'
  ) {
    if (constraint.movementPatterns.includes(exercise.movementPattern)) {
      return true;
    }
  }

  // Check specific exercise constraints
  if (constraint.exerciseIds?.includes(exercise.id)) {
    return true;
  }

  // Check muscle group constraints
  if (constraint.muscleGroups && constraint.constraintType === 'avoid_movement') {
    for (const muscle of exercise.musclesPrimary) {
      if (constraint.muscleGroups.includes(muscle)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Calculate substitution suitability score (0-100+)
 */
function calculateSubstitutionScore(
  original: Exercise,
  candidate: Exercise,
  context: SubstitutionContext
): SubstitutionScore {
  let score = 0;
  const factors: SubstitutionFactor[] = [];

  // Factor 1: Primary muscle match (40 points max)
  const muscleOverlap = calculateMuscleOverlap(
    original.musclesPrimary,
    candidate.musclesPrimary
  );
  const muscleScore = Math.round(muscleOverlap * SCORING_WEIGHTS.muscleMatch);
  score += muscleScore;
  factors.push({
    name: 'muscle_match',
    score: muscleScore,
    maxScore: SCORING_WEIGHTS.muscleMatch,
    explanation: `Targets ${Math.round(muscleOverlap * 100)}% of the same primary muscles`,
  });

  // Factor 2: Movement pattern match (25 points max)
  const patternMatch = original.movementPattern === candidate.movementPattern;
  const patternSimilar = areSimilarPatterns(original.movementPattern, candidate.movementPattern);
  const patternScore = patternMatch
    ? SCORING_WEIGHTS.movementPattern
    : patternSimilar
      ? Math.round(SCORING_WEIGHTS.movementPattern * 0.6)
      : 0;
  score += patternScore;
  factors.push({
    name: 'movement_pattern',
    score: patternScore,
    maxScore: SCORING_WEIGHTS.movementPattern,
    explanation: patternMatch
      ? 'Same movement pattern'
      : patternScore > 0
        ? 'Similar movement pattern'
        : 'Different movement pattern',
  });

  // Factor 3: Equipment availability (15 points max)
  const equipmentAvailable = candidate.equipmentRequired.every(
    e => e === 'none' || context.availableEquipment.includes(e)
  );
  const equipmentScore = equipmentAvailable ? SCORING_WEIGHTS.equipment : 0;
  score += equipmentScore;
  factors.push({
    name: 'equipment',
    score: equipmentScore,
    maxScore: SCORING_WEIGHTS.equipment,
    explanation: equipmentAvailable
      ? 'Equipment available'
      : 'Required equipment not available',
  });

  // Factor 4: Difficulty match (10 points max)
  const difficultyDiff = Math.abs(
    getSkillLevelIndex(original.skillLevel) -
    getSkillLevelIndex(candidate.skillLevel)
  );
  const difficultyScore = Math.max(0, SCORING_WEIGHTS.difficulty - (difficultyDiff * 4));
  score += difficultyScore;
  factors.push({
    name: 'difficulty',
    score: difficultyScore,
    maxScore: SCORING_WEIGHTS.difficulty,
    explanation: difficultyDiff === 0
      ? 'Same difficulty level'
      : difficultyDiff > 0
        ? `${getSkillLevelIndex(candidate.skillLevel) < getSkillLevelIndex(original.skillLevel) ? 'Easier' : 'Harder'} than original`
        : 'Different difficulty level',
  });

  // Factor 5: Joint action similarity (10 points max)
  const jointOverlap = calculateJointOverlap(
    original.jointActions,
    candidate.jointActions
  );
  const jointScore = Math.round(jointOverlap * SCORING_WEIGHTS.jointActions);
  score += jointScore;
  factors.push({
    name: 'joint_actions',
    score: jointScore,
    maxScore: SCORING_WEIGHTS.jointActions,
    explanation: `Uses ${Math.round(jointOverlap * 100)}% of the same joint actions`,
  });

  // Check for constraint violations (eliminates candidate)
  let violatesConstraint = false;
  for (const constraint of context.constraints) {
    if (exerciseViolatesConstraint(candidate, constraint)) {
      violatesConstraint = true;
      score = SCORING_WEIGHTS.constraintViolation;
      factors.push({
        name: 'constraint_violation',
        score: SCORING_WEIGHTS.constraintViolation,
        maxScore: 0,
        explanation: 'Violates an active movement constraint',
      });
      break;
    }
  }

  if (!violatesConstraint) {
    // Bonus: User favorites (+10)
    if (context.userPreferences.favoriteExercises.includes(candidate.id)) {
      score += SCORING_WEIGHTS.userFavorite;
      factors.push({
        name: 'user_favorite',
        score: SCORING_WEIGHTS.userFavorite,
        maxScore: SCORING_WEIGHTS.userFavorite,
        explanation: 'This is one of your favorite exercises',
      });
    }

    // Penalty: User dislikes (-20)
    if (context.userPreferences.dislikedExercises.includes(candidate.id)) {
      score += SCORING_WEIGHTS.userDislike;
      factors.push({
        name: 'user_dislike',
        score: SCORING_WEIGHTS.userDislike,
        maxScore: 0,
        explanation: 'This exercise is on your dislike list',
      });
    }

    // Bonus: Listed as direct substitute (+15)
    if (original.substitutes.includes(candidate.id)) {
      score += SCORING_WEIGHTS.directSubstitute;
      factors.push({
        name: 'direct_substitute',
        score: SCORING_WEIGHTS.directSubstitute,
        maxScore: SCORING_WEIGHTS.directSubstitute,
        explanation: 'Recognized as a direct substitute',
      });
    }
  }

  return {
    candidateId: candidate.id,
    candidateName: candidate.name,
    totalScore: Math.max(0, Math.min(115, score)), // Cap at max possible with bonuses
    factors,
    isViable: score > 0 && !violatesConstraint && equipmentAvailable,
  };
}

/**
 * Generate human-readable explanation for substitution
 */
function generateSubstitutionExplanation(score: SubstitutionScore): string {
  const primary = score.factors
    .filter(f => f.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  if (primary.length === 0) {
    return 'Alternative option';
  }

  const explanations = primary.map(f => {
    switch (f.name) {
      case 'muscle_match':
        return 'works the same muscles';
      case 'movement_pattern':
        return 'similar movement';
      case 'direct_substitute':
        return 'direct equivalent';
      case 'user_favorite':
        return 'one of your favorites';
      case 'equipment':
        return 'equipment available';
      case 'difficulty':
        return 'similar difficulty';
      case 'joint_actions':
        return 'similar joint movements';
      default:
        return f.explanation.toLowerCase();
    }
  });

  const result = explanations.join(', ');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Calculate prescription adjustments for substitute
 */
function calculatePrescriptionAdjustment(
  original: Exercise,
  substitute: Exercise
): Partial<{ sets: number; reps: string; weight: number }> | undefined {
  const originalLevel = getSkillLevelIndex(original.skillLevel);
  const substituteLevel = getSkillLevelIndex(substitute.skillLevel);
  const levelDiff = substituteLevel - originalLevel;

  // If substitute is easier, might need more reps
  // If substitute is harder, might need fewer reps
  if (levelDiff !== 0) {
    return undefined; // Let the prescription engine handle this
  }

  return undefined;
}

/**
 * Substitution Engine interface
 */
export interface ISubstitutionEngine {
  findSubstitutes(
    exerciseId: string,
    exercisePool: Exercise[],
    context: SubstitutionContext,
    limit?: number
  ): SubstituteExercise[];

  calculateScore(
    original: Exercise,
    candidate: Exercise,
    context: SubstitutionContext
  ): SubstitutionScore;
}

/**
 * Substitution Engine implementation
 */
export class SubstitutionEngine implements ISubstitutionEngine {
  /**
   * Find ranked substitutes for an exercise
   */
  findSubstitutes(
    exerciseId: string,
    exercisePool: Exercise[],
    context: SubstitutionContext,
    limit: number = 5
  ): SubstituteExercise[] {
    const original = exercisePool.find(e => e.id === exerciseId);
    if (!original) return [];

    // Score all candidates
    const scored = exercisePool
      .filter(e => e.id !== exerciseId) // Exclude original
      .map(candidate => this.calculateScore(original, candidate, context))
      .filter(s => s.isViable && s.totalScore >= 40) // Minimum threshold
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);

    // Convert to SubstituteExercise format with explanations
    return scored.map(s => {
      const candidateExercise = exercisePool.find(e => e.id === s.candidateId);
      return {
        exerciseId: s.candidateId,
        reason: generateSubstitutionExplanation(s),
        prescriptionAdjustment: candidateExercise
          ? calculatePrescriptionAdjustment(original, candidateExercise)
          : undefined,
        suitabilityScore: s.totalScore,
      };
    });
  }

  /**
   * Calculate substitution score for a candidate exercise
   */
  calculateScore(
    original: Exercise,
    candidate: Exercise,
    context: SubstitutionContext
  ): SubstitutionScore {
    return calculateSubstitutionScore(original, candidate, context);
  }
}

/**
 * Default substitution engine instance
 */
export const substitutionEngine = new SubstitutionEngine();
