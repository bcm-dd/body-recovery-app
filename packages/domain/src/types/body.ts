/**
 * Body Map Types
 * Defines anatomical regions, pain/sensation types, and body status tracking
 */

/**
 * Anatomical regions for body mapping
 * Hierarchical: major region -> specific area
 * 34 total regions covering the full body
 */
export type BodyRegion =
  | 'head'
  | 'neck'
  | 'shoulder_left'
  | 'shoulder_right'
  | 'upper_back'
  | 'lower_back'
  | 'chest'
  | 'core'
  | 'hip_left'
  | 'hip_right'
  | 'glute_left'
  | 'glute_right'
  | 'upper_arm_left'
  | 'upper_arm_right'
  | 'elbow_left'
  | 'elbow_right'
  | 'forearm_left'
  | 'forearm_right'
  | 'wrist_left'
  | 'wrist_right'
  | 'hand_left'
  | 'hand_right'
  | 'thigh_front_left'
  | 'thigh_front_right'
  | 'thigh_back_left'
  | 'thigh_back_right'
  | 'knee_left'
  | 'knee_right'
  | 'calf_left'
  | 'calf_right'
  | 'ankle_left'
  | 'ankle_right'
  | 'foot_left'
  | 'foot_right';

/**
 * Pain/sensation severity scale (1-10)
 * Clinical standard: 1-3 mild, 4-6 moderate, 7-10 severe
 */
export type PainLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Type of sensation being reported
 */
export type SensationType =
  | 'pain_sharp'      // Acute, stabbing pain
  | 'pain_dull'       // Aching, throbbing pain
  | 'pain_burning'    // Nerve-related sensation
  | 'tightness'       // Muscular tension
  | 'stiffness'       // Limited mobility feeling
  | 'weakness'        // Reduced strength/stability
  | 'numbness'        // Loss of sensation (RED FLAG)
  | 'tingling'        // Pins and needles (potential RED FLAG)
  | 'clicking'        // Joint sounds
  | 'instability'     // Joint giving way
  | 'swelling'        // Visible/felt inflammation
  | 'good';           // Positive report - area feels fine

/**
 * Injury status lifecycle
 */
export type InjuryStatus =
  | 'acute'           // Fresh injury, needs immediate care
  | 'subacute'        // Healing phase, 2-6 weeks
  | 'chronic'         // Long-term condition, >6 weeks
  | 'recovering'      // Actively improving
  | 'resolved'        // Healed, for historical reference
  | 'flare_up';       // Recurring issue currently active

/**
 * Injury type classification
 */
export type InjuryType =
  | 'muscle_strain'
  | 'muscle_tear'
  | 'tendinopathy'
  | 'tendon_tear'
  | 'ligament_sprain'
  | 'ligament_tear'
  | 'joint_inflammation'
  | 'disc_bulge'
  | 'disc_herniation'
  | 'nerve_impingement'
  | 'fracture'
  | 'post_surgical'
  | 'overuse'
  | 'chronic_condition'
  | 'undiagnosed';    // User-reported, not clinically confirmed

/**
 * A single body region status entry
 */
export interface BodyRegionStatus {
  region: BodyRegion;
  sensation: SensationType;
  level: PainLevel;
  timestamp: Date;
  context?: string;                    // "during squat", "after waking"
  exerciseId?: string;                 // If logged during specific exercise
  workoutId?: string;                  // If logged during workout
}

/**
 * Movement constraint derived from injury/condition
 */
export interface MovementConstraint {
  id: string;
  injuryId: string;

  // What to avoid
  constraintType:
    | 'avoid_movement'      // Don't do this at all
    | 'limit_range'         // Partial ROM only
    | 'limit_load'          // Reduce weight
    | 'limit_volume'        // Fewer sets/reps
    | 'limit_frequency'     // Less often
    | 'modify_tempo'        // Slower/controlled
    | 'require_warmup';     // Extended warmup needed

  // Targeting - referencing types from exercise.ts
  movementPatterns?: string[];          // e.g., ['hip_hinge', 'spinal_flexion']
  exerciseIds?: string[];               // Specific exercises
  muscleGroups?: string[];              // Target muscles

  // Specifics
  description: string;                  // Human-readable
  maxLoadPercent?: number;              // e.g., 50 = max 50% of normal
  maxRangePercent?: number;             // e.g., 75 = 3/4 ROM

  // Duration
  startDate: Date;
  endDate?: Date;                       // null = ongoing

  // Source
  source: 'clinical' | 'user' | 'ai_inferred';
  confidence: number;                   // 0-1
}

/**
 * An injury/condition record
 */
export interface Injury {
  id: string;
  userId: string;

  // Location and type
  bodyRegions: BodyRegion[];            // Can affect multiple regions
  injuryType: InjuryType;
  status: InjuryStatus;

  // Details
  description: string;                  // User's description
  clinicalDiagnosis?: string;           // From medical document
  severity: 'mild' | 'moderate' | 'severe';

  // Constraints derived from this injury
  constraints: MovementConstraint[];

  // Timeline
  onsetDate: Date;
  diagnosisDate?: Date;
  expectedRecoveryDate?: Date;
  resolvedDate?: Date;

  // Source
  source: 'user_reported' | 'document_extracted' | 'ai_detected';
  documentIds?: string[];               // Related clinical documents

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  notes: string[];
}

/**
 * Mobility baseline for a body region
 */
export interface MobilityBaseline {
  region: BodyRegion;
  normalRom: number;          // degrees or percentage
  currentRom: number;
  assessedAt: Date;
}

/**
 * Strength baseline for a muscle group
 */
export interface StrengthBaseline {
  muscleGroup: string;
  estimatedOneRepMax?: number;
  lastTestedWeight: number;
  lastTestedReps: number;
  assessedAt: Date;
}

/**
 * Complete body model for a user
 */
export interface BodyMap {
  userId: string;

  // Current status snapshot
  currentStatus: BodyRegionStatus[];

  // Active injuries and conditions
  activeInjuries: Injury[];

  // Historical injuries (for pattern detection)
  injuryHistory: Injury[];

  // All active constraints (derived from injuries)
  activeConstraints: MovementConstraint[];

  // Baseline data
  mobilityBaselines?: Record<BodyRegion, MobilityBaseline>;
  strengthBaselines?: Record<string, StrengthBaseline>;

  // Metadata
  lastUpdated: Date;
  lastFullAssessment?: Date;
}
