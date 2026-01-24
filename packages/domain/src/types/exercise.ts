/**
 * Exercise Types
 * Defines exercises, movement patterns, muscle groups, and equipment
 */

/**
 * Movement pattern classification
 */
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

/**
 * Muscle group classification
 */
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
 * Joint action types for exercise analysis
 */
export type JointAction =
  | 'shoulder_flexion'
  | 'shoulder_extension'
  | 'shoulder_abduction'
  | 'shoulder_adduction'
  | 'shoulder_internal_rotation'
  | 'shoulder_external_rotation'
  | 'elbow_flexion'
  | 'elbow_extension'
  | 'wrist_flexion'
  | 'wrist_extension'
  | 'spinal_flexion'
  | 'spinal_extension'
  | 'spinal_rotation'
  | 'spinal_lateral_flexion'
  | 'hip_flexion'
  | 'hip_extension'
  | 'hip_abduction'
  | 'hip_adduction'
  | 'hip_internal_rotation'
  | 'hip_external_rotation'
  | 'knee_flexion'
  | 'knee_extension'
  | 'ankle_dorsiflexion'
  | 'ankle_plantarflexion';

/**
 * Movement plane classification
 */
export type MovementPlane = 'sagittal' | 'frontal' | 'transverse';

/**
 * Loading type classification
 */
export type LoadingType =
  | 'axial'              // Load through spine (squats, deadlifts)
  | 'anterior'           // Load in front (front squats, goblet)
  | 'posterior'          // Load behind
  | 'unilateral'         // Single side
  | 'bilateral'          // Both sides
  | 'bodyweight'
  | 'resistance_band'
  | 'cable'
  | 'free_weight'
  | 'machine';

/**
 * Force vector direction
 */
export type ForceVector = 'vertical' | 'horizontal' | 'diagonal' | 'rotational';

/**
 * Available equipment types
 */
export type Equipment =
  | 'none'
  | 'barbell'
  | 'dumbbell'
  | 'kettlebell'
  | 'cable_machine'
  | 'smith_machine'
  | 'leg_press'
  | 'lat_pulldown'
  | 'cable_row'
  | 'chest_press_machine'
  | 'shoulder_press_machine'
  | 'leg_extension'
  | 'leg_curl'
  | 'hack_squat'
  | 'pull_up_bar'
  | 'dip_station'
  | 'bench_flat'
  | 'bench_incline'
  | 'bench_decline'
  | 'squat_rack'
  | 'resistance_band'
  | 'foam_roller'
  | 'yoga_mat'
  | 'stability_ball'
  | 'medicine_ball'
  | 'battle_ropes'
  | 'trx'
  | 'box'
  | 'sled';

/**
 * Exercise category classification
 */
export type ExerciseCategory =
  | 'strength'
  | 'mobility'
  | 'stability'
  | 'power'
  | 'cardio'
  | 'flexibility'
  | 'rehabilitation'
  | 'warmup'
  | 'cooldown';

/**
 * Skill/difficulty level
 */
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/**
 * Contraindication linking exercise to conditions/injuries
 */
export interface Contraindication {
  condition: string;                   // e.g., "shoulder_impingement", "disc_herniation"
  severity: 'absolute' | 'relative';   // absolute = never do, relative = caution
  reason: string;
  modification?: string;               // How to modify if relative
  alternativeExerciseIds?: string[];
}

/**
 * Default prescription ranges by skill level
 */
export interface DefaultPrescription {
  sets: number;
  reps: string;
  restSeconds: number;
}

/**
 * Complete exercise definition with all metadata
 */
export interface Exercise {
  id: string;
  name: string;
  alternateNames?: string[];           // Other common names

  // Categorization
  category: ExerciseCategory;
  subcategory?: string;

  // Muscles
  musclesPrimary: MuscleGroup[];
  musclesSecondary: MuscleGroup[];

  // Movement characteristics
  movementPattern: MovementPattern;
  jointActions: JointAction[];
  plane: MovementPlane[];

  // Loading characteristics
  loadingType: LoadingType[];
  forceVector: ForceVector;

  // Equipment
  equipmentRequired: Equipment[];
  equipmentOptional?: Equipment[];

  // Difficulty and progression
  skillLevel: SkillLevel;
  complexity: 1 | 2 | 3 | 4 | 5;       // Technical complexity

  // Relationships
  progressions: {
    easier: string[];                  // Exercise IDs
    harder: string[];
  };
  substitutes: string[];               // Equivalent exercise IDs

  // Safety
  contraindications: Contraindication[];
  commonMistakes: string[];

  // Instructional
  description: string;
  setupInstructions: string[];
  executionCues: string[];
  breathingPattern?: string;

  // Media
  videoUrl?: string;
  thumbnailUrl?: string;

  // Metadata
  isCompound: boolean;
  isUnilateral: boolean;
  requiresSpotter: boolean;
  homeGymFriendly: boolean;

  // Default prescription ranges
  defaultPrescription: {
    beginner: DefaultPrescription;
    intermediate: DefaultPrescription;
    advanced: DefaultPrescription;
  };
}

/**
 * Muscle recovery time estimates (hours)
 */
export interface MuscleRecoveryEstimate {
  light: number;
  moderate: number;
  heavy: number;
}
