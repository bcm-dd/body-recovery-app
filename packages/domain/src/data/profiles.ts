/**
 * Demo User Profiles for Body Recovery Companion App
 *
 * These profiles are designed for testing and demonstration purposes.
 * Each profile represents a common recovery scenario:
 * 1. ACL Recovery - Post-surgical knee rehabilitation
 * 2. Low Back - Chronic lower back stiffness and pain management
 * 3. Shoulder Rehab - Rotator cuff strain recovery
 */

// ============================================================================
// Type Definitions (aligned with domain spec)
// ============================================================================

/**
 * Anatomical regions for body mapping
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

export type PainLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type SensationType =
  | 'pain_sharp'
  | 'pain_dull'
  | 'pain_burning'
  | 'tightness'
  | 'stiffness'
  | 'weakness'
  | 'numbness'
  | 'tingling'
  | 'clicking'
  | 'instability'
  | 'swelling'
  | 'good';

export type InjuryStatus =
  | 'acute'
  | 'subacute'
  | 'chronic'
  | 'recovering'
  | 'resolved'
  | 'flare_up';

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
  | 'undiagnosed';

export type MovementPattern =
  | 'squat'
  | 'hip_hinge'
  | 'lunge'
  | 'push_horizontal'
  | 'push_vertical'
  | 'pull_horizontal'
  | 'pull_vertical'
  | 'carry'
  | 'rotation'
  | 'anti_rotation'
  | 'flexion'
  | 'extension'
  | 'lateral'
  | 'gait'
  | 'isometric';

export type MuscleGroup =
  | 'chest'
  | 'upper_back'
  | 'lats'
  | 'shoulders_front'
  | 'shoulders_side'
  | 'shoulders_rear'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core_front'
  | 'core_obliques'
  | 'lower_back'
  | 'glutes'
  | 'hip_flexors'
  | 'quads'
  | 'hamstrings'
  | 'adductors'
  | 'abductors'
  | 'calves'
  | 'neck';

/**
 * Movement constraint derived from injury/condition
 */
export interface MovementConstraint {
  id: string;
  injuryId: string;
  constraintType:
    | 'avoid_movement'
    | 'limit_range'
    | 'limit_load'
    | 'limit_volume'
    | 'limit_frequency'
    | 'modify_tempo'
    | 'require_warmup';
  movementPatterns?: MovementPattern[];
  exerciseIds?: string[];
  muscleGroups?: MuscleGroup[];
  description: string;
  maxLoadPercent?: number;
  maxRangePercent?: number;
  startDate: Date;
  endDate?: Date;
  source: 'clinical' | 'user' | 'ai_inferred';
  confidence: number;
}

/**
 * An injury/condition record
 */
export interface Injury {
  id: string;
  userId: string;
  bodyRegions: BodyRegion[];
  injuryType: InjuryType;
  status: InjuryStatus;
  description: string;
  clinicalDiagnosis?: string;
  severity: 'mild' | 'moderate' | 'severe';
  constraints: MovementConstraint[];
  onsetDate: Date;
  diagnosisDate?: Date;
  expectedRecoveryDate?: Date;
  resolvedDate?: Date;
  source: 'user_reported' | 'document_extracted' | 'ai_detected';
  documentIds?: string[];
  createdAt: Date;
  updatedAt: Date;
  notes: string[];
}

/**
 * Body region status entry
 */
export interface BodyRegionStatus {
  region: BodyRegion;
  sensation: SensationType;
  level: PainLevel;
  timestamp: Date;
  context?: string;
  exerciseId?: string;
  workoutId?: string;
}

/**
 * User training preferences
 */
export interface UserTrainingPreferences {
  preferredDays: (
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday'
  )[];
  preferredTimeOfDay:
    | 'early_morning'
    | 'morning'
    | 'midday'
    | 'afternoon'
    | 'evening'
    | 'flexible';
  typicalSessionLength: number;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  primaryGoal:
    | 'strength'
    | 'hypertrophy'
    | 'endurance'
    | 'general_fitness'
    | 'rehabilitation'
    | 'weight_loss';
  preferredRepRange: 'strength' | 'hypertrophy' | 'endurance' | 'mixed';
  preferredEquipment: string[];
  avoidedEquipment: string[];
  favoriteExercises: string[];
  dislikedExercises: string[];
  avoidedMovements?: MovementPattern[];
  autoProgressWeights: boolean;
  progressionAggressiveness: 'conservative' | 'moderate' | 'aggressive';
  deloadFrequency: 'auto' | 'every_4_weeks' | 'every_6_weeks' | 'manual';
  weightUnit: 'kg' | 'lbs';
  includeWarmup: boolean;
  includeCooldown: boolean;
  includeRehabInWorkout: boolean;
}

/**
 * Complete demo profile structure
 */
export interface DemoProfile {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  bodyRegionStatuses: BodyRegionStatus[];
  activeInjuries: Injury[];
  activeConstraints: MovementConstraint[];
  preferences: UserTrainingPreferences;
  goals: string[];
  notes: string[];
}

// ============================================================================
// DEMO PROFILE 1: ACL RECOVERY
// ============================================================================

const aclRecoveryConstraints: MovementConstraint[] = [
  {
    id: 'acl_no_jumping',
    injuryId: 'acl_injury_001',
    constraintType: 'avoid_movement',
    movementPatterns: [],
    description: 'No jumping, hopping, or plyometric activities until cleared by PT',
    startDate: new Date('2024-11-29'),
    endDate: new Date('2025-05-29'),
    source: 'clinical',
    confidence: 1.0,
  },
  {
    id: 'acl_no_pivoting',
    injuryId: 'acl_injury_001',
    constraintType: 'avoid_movement',
    movementPatterns: ['rotation'],
    description: 'No pivoting, cutting, or rotational movements under load',
    startDate: new Date('2024-11-29'),
    endDate: new Date('2025-05-29'),
    source: 'clinical',
    confidence: 1.0,
  },
  {
    id: 'acl_limit_knee_flexion',
    injuryId: 'acl_injury_001',
    constraintType: 'limit_range',
    movementPatterns: ['squat', 'lunge'],
    maxRangePercent: 60,
    description: 'Limit knee flexion to 90 degrees or less during loaded movements',
    startDate: new Date('2024-11-29'),
    endDate: new Date('2025-03-29'),
    source: 'clinical',
    confidence: 1.0,
  },
  {
    id: 'acl_limit_load',
    injuryId: 'acl_injury_001',
    constraintType: 'limit_load',
    muscleGroups: ['quads', 'hamstrings', 'glutes'],
    maxLoadPercent: 50,
    description: 'Keep loads light during early recovery phase - focus on movement quality',
    startDate: new Date('2024-11-29'),
    endDate: new Date('2025-02-28'),
    source: 'clinical',
    confidence: 1.0,
  },
  {
    id: 'acl_warmup_required',
    injuryId: 'acl_injury_001',
    constraintType: 'require_warmup',
    description: 'Extended warmup required before any lower body work',
    startDate: new Date('2024-11-29'),
    source: 'clinical',
    confidence: 1.0,
  },
];

const aclRecoveryInjury: Injury = {
  id: 'acl_injury_001',
  userId: 'demo_acl_user',
  bodyRegions: ['knee_left', 'thigh_front_left', 'thigh_back_left'],
  injuryType: 'post_surgical',
  status: 'recovering',
  description: 'Left ACL reconstruction surgery - hamstring autograft',
  clinicalDiagnosis: 'ACL rupture, successfully reconstructed with hamstring autograft',
  severity: 'severe',
  constraints: aclRecoveryConstraints,
  onsetDate: new Date('2024-10-15'),
  diagnosisDate: new Date('2024-10-20'),
  expectedRecoveryDate: new Date('2025-10-15'),
  source: 'document_extracted',
  createdAt: new Date('2024-11-29'),
  updatedAt: new Date('2025-01-24'),
  notes: [
    'Surgery date: November 29, 2024',
    'Currently at 8 weeks post-op',
    'PT 2x weekly - progressing well',
    'ROM improving - currently at 110 degrees flexion',
    'Focus on quad activation and hamstring strengthening',
  ],
};

export const ACL_RECOVERY_PROFILE: DemoProfile = {
  id: 'demo_acl_recovery',
  name: 'Alex - ACL Recovery',
  description:
    '8 weeks post-ACL reconstruction surgery. Focus on regaining mobility, quad strength, and safe return to activity.',
  bodyRegionStatuses: [
    {
      region: 'knee_left',
      sensation: 'stiffness',
      level: 4,
      timestamp: new Date(),
      context: 'Morning stiffness, improves with movement',
    },
    {
      region: 'knee_left',
      sensation: 'weakness',
      level: 5,
      timestamp: new Date(),
      context: 'Quad still significantly weaker than right side',
    },
    {
      region: 'thigh_front_left',
      sensation: 'weakness',
      level: 5,
      timestamp: new Date(),
      context: 'Visible quad atrophy - working on activation',
    },
    {
      region: 'thigh_back_left',
      sensation: 'tightness',
      level: 3,
      timestamp: new Date(),
      context: 'Hamstring donor site - mild tightness',
    },
  ],
  activeInjuries: [aclRecoveryInjury],
  activeConstraints: aclRecoveryConstraints,
  preferences: {
    preferredDays: ['monday', 'wednesday', 'friday', 'sunday'],
    preferredTimeOfDay: 'morning',
    typicalSessionLength: 30,
    experienceLevel: 'intermediate',
    primaryGoal: 'rehabilitation',
    preferredRepRange: 'mixed',
    preferredEquipment: ['resistance_band', 'yoga_mat', 'foam_roller', 'bench_flat'],
    avoidedEquipment: ['barbell', 'leg_press', 'leg_extension'],
    favoriteExercises: [
      'act_glute_bridge',
      'act_clam_shell',
      'mob_supine_figure_four',
      'act_bird_dog',
    ],
    dislikedExercises: [],
    avoidedMovements: ['lunge'],
    autoProgressWeights: false,
    progressionAggressiveness: 'conservative',
    deloadFrequency: 'auto',
    weightUnit: 'lbs',
    includeWarmup: true,
    includeCooldown: true,
    includeRehabInWorkout: true,
  },
  goals: [
    'Regain full range of motion in left knee',
    'Restore quad strength to match right side',
    'Return to light jogging by 4 months post-op',
    'Eventually return to recreational sports safely',
  ],
  notes: [
    'Patient has been compliant with PT exercises',
    'Cleared for partial weight bearing activities',
    'No running or impact activities until PT approval',
    'Focus on controlled, low-impact strengthening',
  ],
};

// ============================================================================
// DEMO PROFILE 2: LOW BACK
// ============================================================================

const lowBackConstraints: MovementConstraint[] = [
  {
    id: 'lb_avoid_loaded_flexion',
    injuryId: 'low_back_001',
    constraintType: 'avoid_movement',
    movementPatterns: ['flexion'],
    description: 'Avoid loaded spinal flexion movements (e.g., deadlifts, good mornings)',
    startDate: new Date('2024-06-01'),
    source: 'clinical',
    confidence: 0.9,
  },
  {
    id: 'lb_limit_rotation_load',
    injuryId: 'low_back_001',
    constraintType: 'limit_load',
    movementPatterns: ['rotation'],
    maxLoadPercent: 30,
    description: 'Minimize loaded rotational movements - keep light and controlled',
    startDate: new Date('2024-06-01'),
    source: 'clinical',
    confidence: 0.85,
  },
  {
    id: 'lb_extended_warmup',
    injuryId: 'low_back_001',
    constraintType: 'require_warmup',
    description: 'Always perform extended spine-specific warmup before any workout',
    startDate: new Date('2024-06-01'),
    source: 'user',
    confidence: 1.0,
  },
  {
    id: 'lb_core_tempo',
    injuryId: 'low_back_001',
    constraintType: 'modify_tempo',
    muscleGroups: ['core_front', 'core_obliques', 'lower_back'],
    description: 'Slow, controlled tempo for all core work - no ballistic movements',
    startDate: new Date('2024-06-01'),
    source: 'clinical',
    confidence: 0.95,
  },
];

const lowBackInjury: Injury = {
  id: 'low_back_001',
  userId: 'demo_low_back_user',
  bodyRegions: ['lower_back'],
  injuryType: 'chronic_condition',
  status: 'chronic',
  description: 'Chronic lower back stiffness and intermittent pain',
  clinicalDiagnosis: 'Non-specific lower back pain with mild disc degeneration at L4-L5',
  severity: 'moderate',
  constraints: lowBackConstraints,
  onsetDate: new Date('2022-03-15'),
  diagnosisDate: new Date('2022-04-01'),
  source: 'document_extracted',
  createdAt: new Date('2024-06-01'),
  updatedAt: new Date('2025-01-24'),
  notes: [
    'MRI shows mild disc degeneration - common for age',
    'Pain typically worse after prolonged sitting',
    'Responds well to movement and mobility work',
    'Occasional flare-ups during stress or poor sleep',
    'Core strengthening has been helpful',
  ],
};

export const LOW_BACK_PROFILE: DemoProfile = {
  id: 'demo_low_back',
  name: 'Jordan - Low Back Management',
  description:
    'Chronic lower back stiffness with occasional pain. Focus on pain management, core strength, and maintaining mobility.',
  bodyRegionStatuses: [
    {
      region: 'lower_back',
      sensation: 'stiffness',
      level: 4,
      timestamp: new Date(),
      context: 'Typical morning stiffness - office worker',
    },
    {
      region: 'lower_back',
      sensation: 'pain_dull',
      level: 3,
      timestamp: new Date(),
      context: 'Mild aching after long periods of sitting',
    },
    {
      region: 'hip_left',
      sensation: 'tightness',
      level: 3,
      timestamp: new Date(),
      context: 'Hip flexor tightness from prolonged sitting',
    },
    {
      region: 'hip_right',
      sensation: 'tightness',
      level: 3,
      timestamp: new Date(),
      context: 'Hip flexor tightness from prolonged sitting',
    },
  ],
  activeInjuries: [lowBackInjury],
  activeConstraints: lowBackConstraints,
  preferences: {
    preferredDays: ['tuesday', 'thursday', 'saturday'],
    preferredTimeOfDay: 'evening',
    typicalSessionLength: 25,
    experienceLevel: 'beginner',
    primaryGoal: 'rehabilitation',
    preferredRepRange: 'endurance',
    preferredEquipment: ['yoga_mat', 'foam_roller', 'resistance_band'],
    avoidedEquipment: ['barbell', 'kettlebell'],
    favoriteExercises: [
      'mob_cat_cow',
      'act_dead_bug',
      'act_bird_dog',
      'str_kneeling_hip_flexor',
      'rec_childs_pose',
    ],
    dislikedExercises: ['str_forward_fold'],
    avoidedMovements: ['hip_hinge'],
    autoProgressWeights: false,
    progressionAggressiveness: 'conservative',
    deloadFrequency: 'every_4_weeks',
    weightUnit: 'lbs',
    includeWarmup: true,
    includeCooldown: true,
    includeRehabInWorkout: true,
  },
  goals: [
    'Reduce daily stiffness and discomfort',
    'Build core strength to support spine',
    'Improve hip mobility to reduce back compensation',
    'Develop sustainable daily movement routine',
  ],
  notes: [
    'Works desk job - sits 8+ hours daily',
    'Pain management is primary focus',
    'Prefers bodyweight and low-load exercises',
    'Benefits from daily mobility work',
  ],
};

// ============================================================================
// DEMO PROFILE 3: SHOULDER REHAB
// ============================================================================

const shoulderRehabConstraints: MovementConstraint[] = [
  {
    id: 'sh_no_overhead',
    injuryId: 'shoulder_001',
    constraintType: 'avoid_movement',
    movementPatterns: ['push_vertical', 'pull_vertical'],
    description: 'No overhead pressing or pulling until pain-free and cleared',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2025-03-01'),
    source: 'clinical',
    confidence: 1.0,
  },
  {
    id: 'sh_limit_external_rotation',
    injuryId: 'shoulder_001',
    constraintType: 'limit_range',
    maxRangePercent: 50,
    description: 'Limit external rotation to 50% of normal range',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2025-02-15'),
    source: 'clinical',
    confidence: 0.95,
  },
  {
    id: 'sh_limit_horizontal_push',
    injuryId: 'shoulder_001',
    constraintType: 'limit_load',
    movementPatterns: ['push_horizontal'],
    maxLoadPercent: 40,
    description: 'Keep horizontal pushing light - focus on scapular control',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2025-02-28'),
    source: 'clinical',
    confidence: 0.9,
  },
  {
    id: 'sh_modify_tempo',
    injuryId: 'shoulder_001',
    constraintType: 'modify_tempo',
    muscleGroups: ['shoulders_front', 'shoulders_side', 'shoulders_rear'],
    description: 'Slow, controlled movements only - no momentum or jerky motions',
    startDate: new Date('2024-12-01'),
    source: 'clinical',
    confidence: 1.0,
  },
];

const shoulderInjury: Injury = {
  id: 'shoulder_001',
  userId: 'demo_shoulder_user',
  bodyRegions: ['shoulder_right', 'upper_arm_right'],
  injuryType: 'tendinopathy',
  status: 'recovering',
  description: 'Right rotator cuff strain - supraspinatus involvement',
  clinicalDiagnosis: 'Supraspinatus tendinopathy with mild impingement',
  severity: 'moderate',
  constraints: shoulderRehabConstraints,
  onsetDate: new Date('2024-11-15'),
  diagnosisDate: new Date('2024-11-25'),
  expectedRecoveryDate: new Date('2025-04-15'),
  source: 'document_extracted',
  createdAt: new Date('2024-12-01'),
  updatedAt: new Date('2025-01-24'),
  notes: [
    'Onset after increasing swimming volume too quickly',
    'Pain with overhead activities and sleeping on right side',
    'PT focus: rotator cuff strengthening, scapular stability',
    'Improving but still aggravated by overhead movements',
    'Avoid reaching behind back for now',
  ],
};

export const SHOULDER_REHAB_PROFILE: DemoProfile = {
  id: 'demo_shoulder_rehab',
  name: 'Sam - Shoulder Rehab',
  description:
    'Rotator cuff strain recovery. Focus on restoring range of motion, strengthening rotator cuff, and returning to overhead activities safely.',
  bodyRegionStatuses: [
    {
      region: 'shoulder_right',
      sensation: 'pain_dull',
      level: 4,
      timestamp: new Date(),
      context: 'Aching with certain movements, especially reaching overhead',
    },
    {
      region: 'shoulder_right',
      sensation: 'weakness',
      level: 5,
      timestamp: new Date(),
      context: 'Noticeable weakness compared to left side',
    },
    {
      region: 'upper_back',
      sensation: 'tightness',
      level: 3,
      timestamp: new Date(),
      context: 'Compensatory tension from favoring right shoulder',
    },
    {
      region: 'neck',
      sensation: 'tightness',
      level: 2,
      timestamp: new Date(),
      context: 'Mild tension from altered movement patterns',
    },
  ],
  activeInjuries: [shoulderInjury],
  activeConstraints: shoulderRehabConstraints,
  preferences: {
    preferredDays: ['monday', 'wednesday', 'friday'],
    preferredTimeOfDay: 'midday',
    typicalSessionLength: 20,
    experienceLevel: 'intermediate',
    primaryGoal: 'rehabilitation',
    preferredRepRange: 'endurance',
    preferredEquipment: ['resistance_band', 'yoga_mat', 'dumbbell'],
    avoidedEquipment: ['pull_up_bar', 'barbell', 'shoulder_press_machine'],
    favoriteExercises: [
      'mob_thread_the_needle',
      'mob_open_book',
      'str_floor_chest_stretch',
      'act_bird_dog',
    ],
    dislikedExercises: [],
    avoidedMovements: ['push_vertical', 'pull_vertical'],
    autoProgressWeights: false,
    progressionAggressiveness: 'conservative',
    deloadFrequency: 'auto',
    weightUnit: 'lbs',
    includeWarmup: true,
    includeCooldown: true,
    includeRehabInWorkout: true,
  },
  goals: [
    'Restore full pain-free range of motion',
    'Strengthen rotator cuff and scapular stabilizers',
    'Return to swimming without pain',
    'Prevent future shoulder issues with proper training',
  ],
  notes: [
    'Previously active swimmer - wants to return to the pool',
    'Currently avoiding overhead movements',
    'Focus on thoracic mobility and scapular control',
    'Light resistance band work for rotator cuff',
  ],
};

// ============================================================================
// ALL DEMO PROFILES
// ============================================================================

/**
 * All available demo profiles
 */
export const DEMO_PROFILES: DemoProfile[] = [
  ACL_RECOVERY_PROFILE,
  LOW_BACK_PROFILE,
  SHOULDER_REHAB_PROFILE,
];

/**
 * Demo profiles lookup by ID
 */
export const DEMO_PROFILES_BY_ID: Record<string, DemoProfile> = DEMO_PROFILES.reduce(
  (acc, profile) => {
    acc[profile.id] = profile;
    return acc;
  },
  {} as Record<string, DemoProfile>
);

/**
 * Get demo profile by ID
 */
export function getDemoProfileById(id: string): DemoProfile | undefined {
  return DEMO_PROFILES_BY_ID[id];
}

/**
 * Get all demo profile IDs
 */
export function getDemoProfileIds(): string[] {
  return DEMO_PROFILES.map((p) => p.id);
}

/**
 * Get demo profile summary for selection UI
 */
export function getDemoProfileSummaries(): Array<{
  id: string;
  name: string;
  description: string;
  primaryInjury: string;
  painLevel: number;
}> {
  return DEMO_PROFILES.map((profile) => ({
    id: profile.id,
    name: profile.name,
    description: profile.description,
    primaryInjury: profile.activeInjuries[0]?.description || 'None',
    painLevel: Math.max(...profile.bodyRegionStatuses.map((s) => s.level)),
  }));
}

// ============================================================================
// HELPER: Apply Demo Profile
// ============================================================================

/**
 * Get the contraindication conditions for a demo profile
 * These can be used to filter exercises appropriately
 */
export function getProfileContraindications(profileId: string): string[] {
  const profile = getDemoProfileById(profileId);
  if (!profile) return [];

  const conditions: string[] = [];

  // Map injury types and constraints to contraindication conditions
  for (const injury of profile.activeInjuries) {
    switch (injury.injuryType) {
      case 'post_surgical':
        if (injury.bodyRegions.includes('knee_left') || injury.bodyRegions.includes('knee_right')) {
          conditions.push('acl_recovery', 'knee_injury');
        }
        break;
      case 'chronic_condition':
        if (injury.bodyRegions.includes('lower_back')) {
          conditions.push('acute_lower_back_pain', 'disc_herniation');
        }
        break;
      case 'tendinopathy':
        if (
          injury.bodyRegions.includes('shoulder_left') ||
          injury.bodyRegions.includes('shoulder_right')
        ) {
          conditions.push('rotator_cuff_injury', 'shoulder_impingement');
        }
        break;
      default:
        break;
    }
  }

  return [...new Set(conditions)]; // Remove duplicates
}

/**
 * Get recommended exercise categories for a demo profile
 */
export function getRecommendedCategories(
  profileId: string
): Array<'mobility' | 'stretching' | 'activation' | 'strength' | 'recovery'> {
  const profile = getDemoProfileById(profileId);
  if (!profile) return ['mobility', 'stretching', 'activation', 'recovery'];

  // Rehabilitation profiles emphasize mobility, activation, and recovery
  if (profile.preferences.primaryGoal === 'rehabilitation') {
    return ['mobility', 'activation', 'stretching', 'recovery'];
  }

  return ['mobility', 'stretching', 'activation', 'strength', 'recovery'];
}
