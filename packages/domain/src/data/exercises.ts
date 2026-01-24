/**
 * Exercise Library for Body Recovery Companion App
 *
 * Contains ~40 exercises covering:
 * - Mobility (hip openers, spine rotation, ankle mobility)
 * - Stretching (hip flexor, hamstring, chest, shoulder)
 * - Activation (glute bridge, dead bug, bird dog)
 * - Strength (bodyweight squats, lunges, push-ups)
 * - Recovery (foam rolling, breathing exercises)
 */

// ============================================================================
// Type Definitions (aligned with domain spec)
// ============================================================================

export type ExerciseCategory =
  | 'mobility'
  | 'stretching'
  | 'activation'
  | 'strength'
  | 'recovery';

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
  | 'sled'
  | 'wall'
  | 'chair'
  | 'lacrosse_ball';

/**
 * Contraindication linking exercise to conditions/injuries
 */
export interface Contraindication {
  /** Condition identifier e.g., "knee_injury", "lower_back_pain" */
  condition: string;
  /** absolute = never do, relative = caution/modify */
  severity: 'absolute' | 'relative';
  /** Human-readable reason */
  reason: string;
  /** How to modify if relative */
  modification?: string;
  /** Alternative exercise IDs if this is contraindicated */
  alternativeExerciseIds?: string[];
}

/**
 * Exercise definition for the MVP library
 */
export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  musclesPrimary: MuscleGroup[];
  musclesSecondary: MuscleGroup[];
  movementPattern: MovementPattern;
  jointActions: JointAction[];
  equipmentRequired: Equipment[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  contraindications: Contraindication[];
  description: string;
  cues: string[];
  modifications: {
    easier: string[];
    harder: string[];
  };
  defaultPrescription: {
    sets: number;
    reps: string;
    restSeconds: number;
  };
}

// ============================================================================
// MOBILITY EXERCISES (8 exercises)
// ============================================================================

const mobilityExercises: Exercise[] = [
  {
    id: 'mob_90_90_hip_stretch',
    name: '90/90 Hip Stretch',
    category: 'mobility',
    musclesPrimary: ['glutes', 'hip_flexors'],
    musclesSecondary: ['adductors', 'abductors'],
    movementPattern: 'rotation',
    jointActions: ['hip_internal_rotation', 'hip_external_rotation'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Position places stress on the knee joint',
        modification: 'Reduce the angle of knee flexion or use cushioning under knees',
        alternativeExerciseIds: ['mob_supine_figure_four'],
      },
      {
        condition: 'hip_replacement',
        severity: 'absolute',
        reason: 'Extreme hip rotation may exceed post-surgical ROM limits',
      },
    ],
    description:
      'A seated hip mobility drill that targets both internal and external hip rotation simultaneously. Excellent for improving hip capsule mobility.',
    cues: [
      'Sit with front leg at 90 degrees, shin parallel to your torso',
      'Back leg also at 90 degrees, extending behind you',
      'Keep spine tall - avoid rounding forward',
      'Hinge from hips, not lower back',
      'Breathe deeply and relax into the stretch',
    ],
    modifications: {
      easier: ['mob_supine_figure_four'],
      harder: ['mob_90_90_with_rotation'],
    },
    defaultPrescription: {
      sets: 2,
      reps: '60 seconds each side',
      restSeconds: 30,
    },
  },
  {
    id: 'mob_supine_figure_four',
    name: 'Supine Figure Four Stretch',
    category: 'mobility',
    musclesPrimary: ['glutes'],
    musclesSecondary: ['hip_flexors'],
    movementPattern: 'rotation',
    jointActions: ['hip_external_rotation', 'hip_flexion'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'acute_lower_back_pain',
        severity: 'relative',
        reason: 'Pulling knee toward chest may aggravate certain back conditions',
        modification: 'Keep supporting foot on floor instead of lifting',
      },
    ],
    description:
      'A gentle hip opener performed lying on your back. Safe for most populations and great for releasing piriformis tightness.',
    cues: [
      'Lie on your back with knees bent',
      'Cross one ankle over the opposite knee',
      'Thread your hands behind the supporting thigh',
      'Gently pull thigh toward chest',
      'Keep head and shoulders relaxed on the ground',
    ],
    modifications: {
      easier: [],
      harder: ['mob_90_90_hip_stretch'],
    },
    defaultPrescription: {
      sets: 2,
      reps: '45 seconds each side',
      restSeconds: 15,
    },
  },
  {
    id: 'mob_cat_cow',
    name: 'Cat-Cow',
    category: 'mobility',
    musclesPrimary: ['lower_back', 'core_front'],
    musclesSecondary: ['upper_back', 'neck'],
    movementPattern: 'flexion',
    jointActions: ['spinal_flexion', 'spinal_extension'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'acute_disc_herniation',
        severity: 'relative',
        reason: 'Repeated flexion/extension may aggravate disc issues',
        modification: 'Limit range of motion, move slowly and gently',
        alternativeExerciseIds: ['mob_bird_dog_hold'],
      },
    ],
    description:
      'A gentle spinal mobility exercise alternating between flexion (cat) and extension (cow). Excellent warm-up for the entire spine.',
    cues: [
      'Start on hands and knees, wrists under shoulders, knees under hips',
      'Cow: Inhale, drop belly, lift chest and tailbone',
      'Cat: Exhale, round spine, tuck chin and tailbone',
      'Move smoothly between positions',
      'Let breath guide movement',
    ],
    modifications: {
      easier: [],
      harder: ['mob_thread_the_needle'],
    },
    defaultPrescription: {
      sets: 2,
      reps: '10 cycles',
      restSeconds: 30,
    },
  },
  {
    id: 'mob_thread_the_needle',
    name: 'Thread the Needle',
    category: 'mobility',
    musclesPrimary: ['upper_back'],
    musclesSecondary: ['shoulders_rear', 'core_obliques'],
    movementPattern: 'rotation',
    jointActions: ['spinal_rotation', 'shoulder_adduction'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'shoulder_impingement',
        severity: 'relative',
        reason: 'Reaching under body may compress shoulder joint',
        modification: 'Limit range of motion, do not force rotation',
        alternativeExerciseIds: ['mob_open_book'],
      },
    ],
    description:
      'A thoracic spine rotation drill performed on hands and knees. Great for improving upper back mobility and reducing stiffness.',
    cues: [
      'Start on hands and knees',
      'Reach one arm under your body, rotating torso',
      'Let shoulder and head rest on ground',
      'Hold briefly, then rotate back and reach arm to ceiling',
      'Keep hips square - rotation comes from mid-back',
    ],
    modifications: {
      easier: ['mob_cat_cow'],
      harder: ['mob_90_90_with_rotation'],
    },
    defaultPrescription: {
      sets: 2,
      reps: '8 each side',
      restSeconds: 30,
    },
  },
  {
    id: 'mob_open_book',
    name: 'Open Book Stretch',
    category: 'mobility',
    musclesPrimary: ['upper_back', 'chest'],
    musclesSecondary: ['shoulders_front', 'core_obliques'],
    movementPattern: 'rotation',
    jointActions: ['spinal_rotation', 'shoulder_extension'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'shoulder_labral_tear',
        severity: 'relative',
        reason: 'End-range shoulder rotation may stress labrum',
        modification: 'Keep arm close to body, reduce rotation range',
      },
    ],
    description:
      'A side-lying thoracic rotation stretch. Opens the chest while mobilizing the mid-back.',
    cues: [
      'Lie on your side with knees bent at 90 degrees',
      'Arms extended in front, palms together',
      'Keep knees stacked and pressed down',
      'Open top arm like a book, rotating through mid-back',
      'Follow hand with eyes, try to get shoulder to floor',
    ],
    modifications: {
      easier: [],
      harder: ['mob_thread_the_needle'],
    },
    defaultPrescription: {
      sets: 2,
      reps: '8 each side',
      restSeconds: 30,
    },
  },
  {
    id: 'mob_ankle_circles',
    name: 'Ankle Circles',
    category: 'mobility',
    musclesPrimary: ['calves'],
    musclesSecondary: [],
    movementPattern: 'rotation',
    jointActions: ['ankle_dorsiflexion', 'ankle_plantarflexion'],
    equipmentRequired: ['none'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'acute_ankle_sprain',
        severity: 'relative',
        reason: 'Movement may stress healing ligaments',
        modification: 'Perform very small, gentle circles within pain-free range',
      },
    ],
    description:
      'Simple ankle mobility exercise to improve range of motion in all directions. Essential for squat depth and injury prevention.',
    cues: [
      'Sit or stand with one foot elevated',
      'Draw large circles with your toes',
      'Move through full range - flexion, extension, inversion, eversion',
      'Perform slowly and deliberately',
      'Complete circles in both directions',
    ],
    modifications: {
      easier: [],
      harder: ['mob_wall_ankle_stretch'],
    },
    defaultPrescription: {
      sets: 2,
      reps: '10 circles each direction, each foot',
      restSeconds: 15,
    },
  },
  {
    id: 'mob_wall_ankle_stretch',
    name: 'Wall Ankle Stretch',
    category: 'mobility',
    musclesPrimary: ['calves'],
    musclesSecondary: [],
    movementPattern: 'flexion',
    jointActions: ['ankle_dorsiflexion'],
    equipmentRequired: ['wall'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'achilles_tendinopathy',
        severity: 'relative',
        reason: 'Loaded stretch may aggravate tendon',
        modification: 'Use very gentle pressure, avoid end-range',
        alternativeExerciseIds: ['mob_ankle_circles'],
      },
    ],
    description:
      'A loaded ankle dorsiflexion stretch using a wall. Improves squat depth and reduces compensation patterns.',
    cues: [
      'Stand facing wall, one foot forward close to wall',
      'Keep heel firmly planted on ground',
      'Drive knee forward toward wall',
      'Knee should track over middle toes',
      'Feel stretch in front of ankle and calf',
    ],
    modifications: {
      easier: ['mob_ankle_circles'],
      harder: [],
    },
    defaultPrescription: {
      sets: 2,
      reps: '45 seconds each side',
      restSeconds: 15,
    },
  },
  {
    id: 'mob_90_90_with_rotation',
    name: '90/90 with Thoracic Rotation',
    category: 'mobility',
    musclesPrimary: ['glutes', 'upper_back'],
    musclesSecondary: ['hip_flexors', 'core_obliques'],
    movementPattern: 'rotation',
    jointActions: ['hip_internal_rotation', 'hip_external_rotation', 'spinal_rotation'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'advanced',
    contraindications: [
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Position places stress on the knee joint',
        modification: 'Use cushioning and reduce knee flexion angle',
        alternativeExerciseIds: ['mob_90_90_hip_stretch'],
      },
      {
        condition: 'hip_replacement',
        severity: 'absolute',
        reason: 'Extreme hip rotation may exceed post-surgical limits',
      },
      {
        condition: 'acute_lower_back_pain',
        severity: 'relative',
        reason: 'Combined hip and spine rotation may aggravate back',
        modification: 'Limit thoracic rotation, focus on hip stretch only',
      },
    ],
    description:
      'An advanced mobility drill combining 90/90 hip position with thoracic rotation. Addresses multiple mobility limitations simultaneously.',
    cues: [
      'Set up in 90/90 hip position',
      'Maintain tall spine throughout',
      'Rotate torso toward front leg',
      'Keep hips anchored - rotation from mid-back only',
      'Return to center and rotate toward back leg',
    ],
    modifications: {
      easier: ['mob_90_90_hip_stretch', 'mob_thread_the_needle'],
      harder: [],
    },
    defaultPrescription: {
      sets: 2,
      reps: '6 rotations each side',
      restSeconds: 45,
    },
  },
];

// ============================================================================
// STRETCHING EXERCISES (8 exercises)
// ============================================================================

const stretchingExercises: Exercise[] = [
  {
    id: 'str_kneeling_hip_flexor',
    name: 'Kneeling Hip Flexor Stretch',
    category: 'stretching',
    musclesPrimary: ['hip_flexors'],
    musclesSecondary: ['quads'],
    movementPattern: 'extension',
    jointActions: ['hip_extension'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Kneeling position places pressure on the knee',
        modification: 'Use thick cushioning under knee',
        alternativeExerciseIds: ['str_standing_hip_flexor'],
      },
    ],
    description:
      'A foundational stretch targeting the hip flexors. Essential for those who sit for extended periods.',
    cues: [
      'Kneel on one knee, front foot flat on floor',
      'Maintain tall posture - avoid leaning forward',
      'Tuck tailbone slightly (posterior pelvic tilt)',
      'Shift weight forward until stretch is felt in front hip',
      'Keep core engaged throughout',
    ],
    modifications: {
      easier: ['str_standing_hip_flexor'],
      harder: ['str_couch_stretch'],
    },
    defaultPrescription: {
      sets: 2,
      reps: '45 seconds each side',
      restSeconds: 15,
    },
  },
  {
    id: 'str_standing_hip_flexor',
    name: 'Standing Hip Flexor Stretch',
    category: 'stretching',
    musclesPrimary: ['hip_flexors'],
    musclesSecondary: ['quads'],
    movementPattern: 'extension',
    jointActions: ['hip_extension'],
    equipmentRequired: ['none'],
    skillLevel: 'beginner',
    contraindications: [],
    description:
      'A standing variation of the hip flexor stretch suitable for those who cannot kneel.',
    cues: [
      'Stand in split stance, rear foot elevated on toes',
      'Keep torso upright',
      'Tuck tailbone and squeeze glute of rear leg',
      'Shift weight forward while maintaining pelvic position',
      'Should feel stretch in front of rear hip',
    ],
    modifications: {
      easier: [],
      harder: ['str_kneeling_hip_flexor'],
    },
    defaultPrescription: {
      sets: 2,
      reps: '30 seconds each side',
      restSeconds: 15,
    },
  },
  {
    id: 'str_couch_stretch',
    name: 'Couch Stretch',
    category: 'stretching',
    musclesPrimary: ['hip_flexors', 'quads'],
    musclesSecondary: [],
    movementPattern: 'extension',
    jointActions: ['hip_extension', 'knee_flexion'],
    equipmentRequired: ['wall', 'yoga_mat'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Intense knee flexion may stress joint structures',
        modification: 'Move foot further from wall to reduce knee bend',
        alternativeExerciseIds: ['str_kneeling_hip_flexor'],
      },
      {
        condition: 'patellofemoral_syndrome',
        severity: 'absolute',
        reason: 'Extreme knee flexion will aggravate condition',
        alternativeExerciseIds: ['str_standing_hip_flexor'],
      },
    ],
    description:
      'An intense hip flexor and quad stretch using a wall. Highly effective but requires adequate hip and knee mobility.',
    cues: [
      'Kneel facing away from wall, one foot up against wall',
      'Bring front foot forward into lunge position',
      'Keep torso upright, squeeze glutes',
      'The closer your knee to wall, the more intense',
      'Breathe deeply and relax into stretch',
    ],
    modifications: {
      easier: ['str_kneeling_hip_flexor'],
      harder: [],
    },
    defaultPrescription: {
      sets: 2,
      reps: '60 seconds each side',
      restSeconds: 30,
    },
  },
  {
    id: 'str_standing_hamstring',
    name: 'Standing Hamstring Stretch',
    category: 'stretching',
    musclesPrimary: ['hamstrings'],
    musclesSecondary: ['calves', 'lower_back'],
    movementPattern: 'hip_hinge',
    jointActions: ['hip_flexion'],
    equipmentRequired: ['none'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'disc_herniation',
        severity: 'relative',
        reason: 'Forward folding may stress spinal discs',
        modification: 'Bend knees slightly, hinge from hips not lower back',
        alternativeExerciseIds: ['str_supine_hamstring'],
      },
    ],
    description:
      'A simple standing hamstring stretch. Can be performed anywhere without equipment.',
    cues: [
      'Stand with feet hip-width apart',
      'Hinge forward at hips with soft knees',
      'Keep back flat, avoid rounding spine',
      'Reach toward toes or shins',
      'Feel stretch in back of thighs',
    ],
    modifications: {
      easier: ['str_supine_hamstring'],
      harder: ['str_forward_fold'],
    },
    defaultPrescription: {
      sets: 2,
      reps: '30 seconds',
      restSeconds: 15,
    },
  },
  {
    id: 'str_supine_hamstring',
    name: 'Supine Hamstring Stretch',
    category: 'stretching',
    musclesPrimary: ['hamstrings'],
    musclesSecondary: ['calves'],
    movementPattern: 'flexion',
    jointActions: ['hip_flexion'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [],
    description:
      'A safe lying hamstring stretch that minimizes lower back involvement. Suitable for those with back sensitivity.',
    cues: [
      'Lie on back with legs extended',
      'Lift one leg toward ceiling',
      'Keep knee straight or slightly bent',
      'Hold behind thigh or calf (not knee)',
      'Keep opposite leg pressed into floor',
    ],
    modifications: {
      easier: [],
      harder: ['str_standing_hamstring'],
    },
    defaultPrescription: {
      sets: 2,
      reps: '45 seconds each side',
      restSeconds: 15,
    },
  },
  {
    id: 'str_forward_fold',
    name: 'Standing Forward Fold',
    category: 'stretching',
    musclesPrimary: ['hamstrings', 'lower_back'],
    musclesSecondary: ['calves', 'glutes'],
    movementPattern: 'hip_hinge',
    jointActions: ['hip_flexion', 'spinal_flexion'],
    equipmentRequired: ['none'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'disc_herniation',
        severity: 'relative',
        reason: 'Loaded spinal flexion may aggravate disc issues',
        modification: 'Bend knees generously, keep spine neutral',
        alternativeExerciseIds: ['str_supine_hamstring'],
      },
      {
        condition: 'acute_lower_back_pain',
        severity: 'absolute',
        reason: 'Forward folding will likely increase pain',
        alternativeExerciseIds: ['str_supine_hamstring'],
      },
    ],
    description:
      'A full forward fold stretching the entire posterior chain. Requires adequate hamstring flexibility.',
    cues: [
      'Stand with feet hip-width apart',
      'Fold forward from hips, letting head hang',
      'Keep legs as straight as comfortable',
      'Let arms hang or hold opposite elbows',
      'Relax neck and shoulders completely',
    ],
    modifications: {
      easier: ['str_standing_hamstring'],
      harder: [],
    },
    defaultPrescription: {
      sets: 2,
      reps: '45 seconds',
      restSeconds: 30,
    },
  },
  {
    id: 'str_doorway_chest',
    name: 'Doorway Chest Stretch',
    category: 'stretching',
    musclesPrimary: ['chest'],
    musclesSecondary: ['shoulders_front', 'biceps'],
    movementPattern: 'extension',
    jointActions: ['shoulder_extension', 'shoulder_abduction'],
    equipmentRequired: ['wall'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'shoulder_impingement',
        severity: 'relative',
        reason: 'Horizontal abduction may compress subacromial space',
        modification: 'Keep elbow lower than shoulder height',
        alternativeExerciseIds: ['str_floor_chest_stretch'],
      },
      {
        condition: 'shoulder_dislocation_history',
        severity: 'relative',
        reason: 'End-range positions may stress joint capsule',
        modification: 'Use very gentle pressure, avoid end-range',
      },
    ],
    description:
      'A classic chest stretch using a doorway or wall corner. Counteracts the effects of prolonged sitting and slouching.',
    cues: [
      'Stand in doorway with forearm on door frame',
      'Elbow at shoulder height, 90 degree bend',
      'Step forward with same-side foot',
      'Rotate torso away from the arm',
      'Feel stretch across chest and front of shoulder',
    ],
    modifications: {
      easier: ['str_floor_chest_stretch'],
      harder: [],
    },
    defaultPrescription: {
      sets: 2,
      reps: '30 seconds each side',
      restSeconds: 15,
    },
  },
  {
    id: 'str_floor_chest_stretch',
    name: 'Floor Chest Stretch',
    category: 'stretching',
    musclesPrimary: ['chest'],
    musclesSecondary: ['shoulders_front'],
    movementPattern: 'extension',
    jointActions: ['shoulder_extension'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'shoulder_impingement',
        severity: 'relative',
        reason: 'Arm position may compress shoulder structures',
        modification: 'Keep arm closer to body, less abduction',
      },
    ],
    description:
      'A prone chest stretch where the floor provides gentle resistance. Safe and effective for most populations.',
    cues: [
      'Lie face down with one arm extended to side',
      'Palm faces down, arm at shoulder height',
      'Roll onto your side using opposite hand',
      'Keep extended arm on floor as you roll',
      'Control the stretch intensity with body position',
    ],
    modifications: {
      easier: [],
      harder: ['str_doorway_chest'],
    },
    defaultPrescription: {
      sets: 2,
      reps: '30 seconds each side',
      restSeconds: 15,
    },
  },
];

// ============================================================================
// ACTIVATION EXERCISES (8 exercises)
// ============================================================================

const activationExercises: Exercise[] = [
  {
    id: 'act_glute_bridge',
    name: 'Glute Bridge',
    category: 'activation',
    musclesPrimary: ['glutes'],
    musclesSecondary: ['hamstrings', 'core_front'],
    movementPattern: 'hip_hinge',
    jointActions: ['hip_extension'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'acute_lower_back_pain',
        severity: 'relative',
        reason: 'Hip extension may aggravate some back conditions',
        modification: 'Limit range of motion, focus on glute squeeze not height',
        alternativeExerciseIds: ['act_clam_shell'],
      },
    ],
    description:
      'A foundational glute activation exercise. Teaches proper hip extension patterning and activates sleeping glutes.',
    cues: [
      'Lie on back, knees bent, feet flat on floor',
      'Feet hip-width apart, close to glutes',
      'Drive through heels to lift hips',
      'Squeeze glutes hard at top',
      'Lower with control, do not arch lower back',
    ],
    modifications: {
      easier: ['act_clam_shell'],
      harder: ['act_single_leg_bridge'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '12',
      restSeconds: 30,
    },
  },
  {
    id: 'act_single_leg_bridge',
    name: 'Single Leg Glute Bridge',
    category: 'activation',
    musclesPrimary: ['glutes'],
    musclesSecondary: ['hamstrings', 'core_front', 'core_obliques'],
    movementPattern: 'hip_hinge',
    jointActions: ['hip_extension'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'acute_lower_back_pain',
        severity: 'relative',
        reason: 'Unilateral loading increases demands on spine',
        modification: 'Use bilateral version instead',
        alternativeExerciseIds: ['act_glute_bridge'],
      },
    ],
    description:
      'A challenging single-leg variation that identifies and corrects side-to-side strength imbalances.',
    cues: [
      'Set up as for regular bridge',
      'Extend one leg, keeping thighs parallel',
      'Drive through single heel to lift hips',
      'Keep hips level - do not rotate',
      'Lower with control',
    ],
    modifications: {
      easier: ['act_glute_bridge'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '8 each side',
      restSeconds: 30,
    },
  },
  {
    id: 'act_clam_shell',
    name: 'Clam Shell',
    category: 'activation',
    musclesPrimary: ['abductors', 'glutes'],
    musclesSecondary: [],
    movementPattern: 'lateral',
    jointActions: ['hip_external_rotation', 'hip_abduction'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'hip_labral_tear',
        severity: 'relative',
        reason: 'Hip rotation may stress labrum',
        modification: 'Keep range of motion small and controlled',
      },
    ],
    description:
      'A side-lying exercise targeting the gluteus medius. Essential for hip stability and correcting knee valgus.',
    cues: [
      'Lie on side with knees bent at 45 degrees',
      'Keep feet together, stacked',
      'Lift top knee while keeping feet touching',
      'Do not rotate pelvis - movement is pure hip rotation',
      'Lower with control',
    ],
    modifications: {
      easier: [],
      harder: ['act_banded_clam_shell'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '15 each side',
      restSeconds: 30,
    },
  },
  {
    id: 'act_banded_clam_shell',
    name: 'Banded Clam Shell',
    category: 'activation',
    musclesPrimary: ['abductors', 'glutes'],
    musclesSecondary: [],
    movementPattern: 'lateral',
    jointActions: ['hip_external_rotation', 'hip_abduction'],
    equipmentRequired: ['yoga_mat', 'resistance_band'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'hip_labral_tear',
        severity: 'relative',
        reason: 'Added resistance increases joint stress',
        modification: 'Use lighter band or no band',
        alternativeExerciseIds: ['act_clam_shell'],
      },
    ],
    description:
      'A resistance band variation of the clam shell providing additional gluteus medius challenge.',
    cues: [
      'Place band around thighs just above knees',
      'Perform movement as standard clam shell',
      'Control the band - do not let it snap closed',
      'Focus on squeezing glute throughout',
      'Maintain tension even at bottom position',
    ],
    modifications: {
      easier: ['act_clam_shell'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '12 each side',
      restSeconds: 30,
    },
  },
  {
    id: 'act_dead_bug',
    name: 'Dead Bug',
    category: 'activation',
    musclesPrimary: ['core_front'],
    musclesSecondary: ['hip_flexors', 'core_obliques'],
    movementPattern: 'anti_rotation',
    jointActions: ['hip_flexion', 'hip_extension', 'shoulder_flexion'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [],
    description:
      'A core stability exercise teaching proper bracing and anti-extension. Safe for most populations including those with back issues.',
    cues: [
      'Lie on back, arms reaching toward ceiling',
      'Knees bent 90 degrees over hips',
      'Press lower back firmly into floor',
      'Slowly extend opposite arm and leg',
      'Return to start, maintain back position',
    ],
    modifications: {
      easier: [],
      harder: ['act_dead_bug_extended'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '10 each side',
      restSeconds: 30,
    },
  },
  {
    id: 'act_dead_bug_extended',
    name: 'Dead Bug with Full Extension',
    category: 'activation',
    musclesPrimary: ['core_front'],
    musclesSecondary: ['hip_flexors', 'core_obliques'],
    movementPattern: 'anti_rotation',
    jointActions: ['hip_flexion', 'hip_extension', 'shoulder_flexion'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'acute_lower_back_pain',
        severity: 'relative',
        reason: 'Extended position increases anti-extension demands',
        modification: 'Use bent-knee version instead',
        alternativeExerciseIds: ['act_dead_bug'],
      },
    ],
    description:
      'A more challenging dead bug variation with fully extended limbs requiring greater core control.',
    cues: [
      'Set up as standard dead bug',
      'Extend opposite arm and leg to full length',
      'Leg hovers just above floor',
      'Maintain lower back contact with floor',
      'Move slowly - 3-4 seconds each direction',
    ],
    modifications: {
      easier: ['act_dead_bug'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '8 each side',
      restSeconds: 45,
    },
  },
  {
    id: 'act_bird_dog',
    name: 'Bird Dog',
    category: 'activation',
    musclesPrimary: ['core_front', 'glutes'],
    musclesSecondary: ['lower_back', 'shoulders_rear'],
    movementPattern: 'anti_rotation',
    jointActions: ['hip_extension', 'shoulder_flexion'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'wrist_injury',
        severity: 'relative',
        reason: 'Weight bearing through wrists',
        modification: 'Use fists or forearms instead of flat palms',
      },
    ],
    description:
      'A quadruped core stability exercise that challenges balance and coordination while activating glutes and spinal stabilizers.',
    cues: [
      'Start on hands and knees',
      'Wrists under shoulders, knees under hips',
      'Extend opposite arm and leg simultaneously',
      'Keep back flat - no rotation or sagging',
      'Hold briefly, return with control',
    ],
    modifications: {
      easier: ['act_bird_dog_hold'],
      harder: ['act_bird_dog_with_band'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '10 each side',
      restSeconds: 30,
    },
  },
  {
    id: 'act_bird_dog_hold',
    name: 'Bird Dog Hold',
    category: 'activation',
    musclesPrimary: ['core_front', 'glutes'],
    musclesSecondary: ['lower_back', 'shoulders_rear'],
    movementPattern: 'isometric',
    jointActions: ['hip_extension', 'shoulder_flexion'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'wrist_injury',
        severity: 'relative',
        reason: 'Extended weight bearing through wrists',
        modification: 'Use fists or forearms',
      },
    ],
    description:
      'An isometric variation of bird dog focusing on static hold rather than movement. Great for building endurance in stabilizing muscles.',
    cues: [
      'Extend opposite arm and leg',
      'Hold position with perfect alignment',
      'Breathe normally throughout hold',
      'Do not let back sag or rotate',
      'Focus on squeezing glute of extended leg',
    ],
    modifications: {
      easier: [],
      harder: ['act_bird_dog'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '20 seconds each side',
      restSeconds: 30,
    },
  },
];

// ============================================================================
// STRENGTH EXERCISES (10 exercises)
// ============================================================================

const strengthExercises: Exercise[] = [
  {
    id: 'stg_bodyweight_squat',
    name: 'Bodyweight Squat',
    category: 'strength',
    musclesPrimary: ['quads', 'glutes'],
    musclesSecondary: ['hamstrings', 'core_front', 'calves'],
    movementPattern: 'squat',
    jointActions: ['hip_flexion', 'hip_extension', 'knee_flexion', 'knee_extension'],
    equipmentRequired: ['none'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Deep knee flexion may stress joint structures',
        modification: 'Limit depth, only go to comfortable range',
        alternativeExerciseIds: ['stg_box_squat'],
      },
      {
        condition: 'acl_recovery',
        severity: 'relative',
        reason: 'May stress healing graft in early recovery',
        modification: 'Follow PT guidelines for depth and progression',
        alternativeExerciseIds: ['stg_box_squat'],
      },
    ],
    description:
      'The foundational lower body movement pattern. Develops strength, mobility, and movement competency.',
    cues: [
      'Stand with feet shoulder-width apart',
      'Toes can point slightly outward',
      'Initiate by pushing hips back and bending knees',
      'Keep chest up and back flat',
      'Drive through whole foot to stand',
    ],
    modifications: {
      easier: ['stg_box_squat'],
      harder: ['stg_goblet_squat'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '12',
      restSeconds: 60,
    },
  },
  {
    id: 'stg_box_squat',
    name: 'Box Squat',
    category: 'strength',
    musclesPrimary: ['quads', 'glutes'],
    musclesSecondary: ['hamstrings', 'core_front'],
    movementPattern: 'squat',
    jointActions: ['hip_flexion', 'hip_extension', 'knee_flexion', 'knee_extension'],
    equipmentRequired: ['box', 'chair'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Use higher box to limit knee flexion',
        modification: 'Choose box height that limits flexion to pain-free range',
      },
    ],
    description:
      'A squat variation to a box or bench. Provides a depth target and makes the movement more accessible.',
    cues: [
      'Stand in front of box, feet shoulder-width',
      'Squat down until glutes touch box',
      'Do not plop - maintain control',
      'Pause briefly on box',
      'Drive through feet to stand',
    ],
    modifications: {
      easier: [],
      harder: ['stg_bodyweight_squat'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '10',
      restSeconds: 60,
    },
  },
  {
    id: 'stg_goblet_squat',
    name: 'Goblet Squat',
    category: 'strength',
    musclesPrimary: ['quads', 'glutes'],
    musclesSecondary: ['hamstrings', 'core_front', 'upper_back'],
    movementPattern: 'squat',
    jointActions: ['hip_flexion', 'hip_extension', 'knee_flexion', 'knee_extension'],
    equipmentRequired: ['dumbbell', 'kettlebell'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Added load increases joint stress',
        modification: 'Use bodyweight version or limit depth',
        alternativeExerciseIds: ['stg_bodyweight_squat'],
      },
      {
        condition: 'wrist_injury',
        severity: 'relative',
        reason: 'Holding weight may stress wrist',
        modification: 'Use lighter weight or bodyweight',
      },
    ],
    description:
      'A front-loaded squat holding a weight at chest level. The counterbalance often improves squat depth and form.',
    cues: [
      'Hold weight at chest, elbows pointing down',
      'Feet shoulder-width or slightly wider',
      'Squat between your legs, elbows inside knees',
      'Keep torso upright throughout',
      'Weight in mid-foot to heels',
    ],
    modifications: {
      easier: ['stg_bodyweight_squat'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '10',
      restSeconds: 90,
    },
  },
  {
    id: 'stg_reverse_lunge',
    name: 'Reverse Lunge',
    category: 'strength',
    musclesPrimary: ['quads', 'glutes'],
    musclesSecondary: ['hamstrings', 'core_front', 'calves'],
    movementPattern: 'lunge',
    jointActions: ['hip_flexion', 'hip_extension', 'knee_flexion', 'knee_extension'],
    equipmentRequired: ['none'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Lunge depth stresses the knee joint',
        modification: 'Limit depth, use shorter step',
        alternativeExerciseIds: ['stg_split_squat'],
      },
      {
        condition: 'acl_recovery',
        severity: 'relative',
        reason: 'Deceleration forces may stress graft',
        modification: 'Start with split squat, progress slowly',
        alternativeExerciseIds: ['stg_split_squat'],
      },
      {
        condition: 'balance_issues',
        severity: 'relative',
        reason: 'Single leg stance requires balance',
        modification: 'Hold onto wall or chair for support',
      },
    ],
    description:
      'A unilateral leg exercise stepping backward into a lunge. Easier on the knees than forward lunges while building single-leg strength.',
    cues: [
      'Stand tall with feet hip-width apart',
      'Step backward with one leg',
      'Lower until both knees are at 90 degrees',
      'Front knee stays over ankle',
      'Push through front foot to return to start',
    ],
    modifications: {
      easier: ['stg_split_squat'],
      harder: ['stg_walking_lunge'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '10 each side',
      restSeconds: 60,
    },
  },
  {
    id: 'stg_split_squat',
    name: 'Split Squat',
    category: 'strength',
    musclesPrimary: ['quads', 'glutes'],
    musclesSecondary: ['hamstrings', 'hip_flexors'],
    movementPattern: 'lunge',
    jointActions: ['hip_flexion', 'hip_extension', 'knee_flexion', 'knee_extension'],
    equipmentRequired: ['none'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Knee flexion under load',
        modification: 'Limit depth of movement',
        alternativeExerciseIds: ['stg_box_squat'],
      },
    ],
    description:
      'A static lunge position where feet stay planted throughout the set. More stable than lunges while still training single-leg strength.',
    cues: [
      'Stand in staggered stance, feet hip-width',
      'Rear foot on toes, front foot flat',
      'Lower straight down, both knees bending',
      'Front knee tracks over toes',
      'Push through front foot to rise',
    ],
    modifications: {
      easier: [],
      harder: ['stg_reverse_lunge'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '10 each side',
      restSeconds: 60,
    },
  },
  {
    id: 'stg_walking_lunge',
    name: 'Walking Lunge',
    category: 'strength',
    musclesPrimary: ['quads', 'glutes'],
    musclesSecondary: ['hamstrings', 'core_front', 'calves'],
    movementPattern: 'lunge',
    jointActions: ['hip_flexion', 'hip_extension', 'knee_flexion', 'knee_extension'],
    equipmentRequired: ['none'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Dynamic movement increases joint stress',
        modification: 'Use static reverse lunge instead',
        alternativeExerciseIds: ['stg_reverse_lunge'],
      },
      {
        condition: 'acl_recovery',
        severity: 'absolute',
        reason: 'Dynamic single-leg loading with direction change',
        alternativeExerciseIds: ['stg_split_squat'],
      },
      {
        condition: 'balance_issues',
        severity: 'absolute',
        reason: 'Requires significant balance during movement',
        alternativeExerciseIds: ['stg_reverse_lunge'],
      },
    ],
    description:
      'A dynamic lunge variation moving forward with each rep. Builds strength, coordination, and functional movement patterns.',
    cues: [
      'Stand tall at start',
      'Step forward into lunge',
      'Both knees to 90 degrees',
      'Push through front foot to bring back leg forward',
      'Continue walking forward alternating legs',
    ],
    modifications: {
      easier: ['stg_reverse_lunge'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '10 each side',
      restSeconds: 90,
    },
  },
  {
    id: 'stg_pushup',
    name: 'Push-Up',
    category: 'strength',
    musclesPrimary: ['chest', 'triceps'],
    musclesSecondary: ['shoulders_front', 'core_front'],
    movementPattern: 'push_horizontal',
    jointActions: ['shoulder_flexion', 'elbow_extension'],
    equipmentRequired: ['none'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'shoulder_impingement',
        severity: 'relative',
        reason: 'Horizontal pressing may aggravate impingement',
        modification: 'Keep elbows closer to body, limit depth',
        alternativeExerciseIds: ['stg_incline_pushup'],
      },
      {
        condition: 'wrist_injury',
        severity: 'relative',
        reason: 'Weight bearing through wrists',
        modification: 'Use push-up handles or fists',
        alternativeExerciseIds: ['stg_incline_pushup'],
      },
    ],
    description:
      'The classic upper body push exercise. Develops chest, triceps, and core strength with no equipment needed.',
    cues: [
      'Hands slightly wider than shoulders',
      'Body in straight line from head to heels',
      'Lower chest toward floor',
      'Elbows at 45 degree angle to body',
      'Push through hands to return to start',
    ],
    modifications: {
      easier: ['stg_incline_pushup', 'stg_knee_pushup'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '10',
      restSeconds: 60,
    },
  },
  {
    id: 'stg_incline_pushup',
    name: 'Incline Push-Up',
    category: 'strength',
    musclesPrimary: ['chest', 'triceps'],
    musclesSecondary: ['shoulders_front', 'core_front'],
    movementPattern: 'push_horizontal',
    jointActions: ['shoulder_flexion', 'elbow_extension'],
    equipmentRequired: ['box', 'bench_flat', 'wall'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'wrist_injury',
        severity: 'relative',
        reason: 'Some weight bearing through wrists',
        modification: 'Use fists or push-up handles',
      },
    ],
    description:
      'A push-up with hands elevated, reducing the load. A perfect progression for building up to full push-ups.',
    cues: [
      'Place hands on elevated surface',
      'The higher the surface, the easier',
      'Maintain straight body line',
      'Lower chest toward hands',
      'Keep elbows at comfortable angle',
    ],
    modifications: {
      easier: ['stg_wall_pushup'],
      harder: ['stg_knee_pushup', 'stg_pushup'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '12',
      restSeconds: 60,
    },
  },
  {
    id: 'stg_knee_pushup',
    name: 'Knee Push-Up',
    category: 'strength',
    musclesPrimary: ['chest', 'triceps'],
    musclesSecondary: ['shoulders_front', 'core_front'],
    movementPattern: 'push_horizontal',
    jointActions: ['shoulder_flexion', 'elbow_extension'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Pressure on kneeling knee',
        modification: 'Use thick padding under knees',
        alternativeExerciseIds: ['stg_incline_pushup'],
      },
      {
        condition: 'wrist_injury',
        severity: 'relative',
        reason: 'Weight bearing through wrists',
        modification: 'Use fists or push-up handles',
      },
    ],
    description:
      'A modified push-up with knees on the ground. Reduces the load while maintaining similar movement pattern.',
    cues: [
      'Start on hands and knees',
      'Walk hands forward so body is straight from knees to head',
      'Lower chest toward floor',
      'Elbows at 45 degrees',
      'Push back to start position',
    ],
    modifications: {
      easier: ['stg_incline_pushup'],
      harder: ['stg_pushup'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '10',
      restSeconds: 60,
    },
  },
  {
    id: 'stg_wall_pushup',
    name: 'Wall Push-Up',
    category: 'strength',
    musclesPrimary: ['chest', 'triceps'],
    musclesSecondary: ['shoulders_front'],
    movementPattern: 'push_horizontal',
    jointActions: ['shoulder_flexion', 'elbow_extension'],
    equipmentRequired: ['wall'],
    skillLevel: 'beginner',
    contraindications: [],
    description:
      'The most accessible push-up variation. Perfect for beginners or those with limited upper body strength.',
    cues: [
      'Stand arm-length from wall',
      'Place hands on wall at chest height',
      'Lean body toward wall, keeping straight line',
      'Bend elbows to bring chest toward wall',
      'Push away to return to start',
    ],
    modifications: {
      easier: [],
      harder: ['stg_incline_pushup'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '15',
      restSeconds: 45,
    },
  },
];

// ============================================================================
// RECOVERY EXERCISES (8 exercises)
// ============================================================================

const recoveryExercises: Exercise[] = [
  {
    id: 'rec_foam_roll_quads',
    name: 'Foam Roll Quads',
    category: 'recovery',
    musclesPrimary: ['quads'],
    musclesSecondary: ['hip_flexors'],
    movementPattern: 'isometric',
    jointActions: [],
    equipmentRequired: ['foam_roller'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'acute_muscle_strain',
        severity: 'absolute',
        reason: 'Rolling over acute injury can worsen damage',
        alternativeExerciseIds: ['rec_gentle_quad_stretch'],
      },
      {
        condition: 'blood_clot_risk',
        severity: 'absolute',
        reason: 'Compression may dislodge clots',
      },
    ],
    description:
      'Self-myofascial release for the quadriceps. Helps reduce muscle tension and improve tissue quality.',
    cues: [
      'Lie face down with roller under thighs',
      'Support body weight on forearms',
      'Roll slowly from hip to just above knee',
      'Pause on tender spots for 20-30 seconds',
      'Breathe deeply and try to relax muscle',
    ],
    modifications: {
      easier: ['rec_gentle_quad_stretch'],
      harder: [],
    },
    defaultPrescription: {
      sets: 1,
      reps: '60 seconds each leg',
      restSeconds: 30,
    },
  },
  {
    id: 'rec_foam_roll_it_band',
    name: 'Foam Roll IT Band',
    category: 'recovery',
    musclesPrimary: ['abductors'],
    musclesSecondary: ['quads'],
    movementPattern: 'isometric',
    jointActions: [],
    equipmentRequired: ['foam_roller'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'acute_it_band_syndrome',
        severity: 'relative',
        reason: 'May be too intense during acute phase',
        modification: 'Use softer roller or less body weight',
      },
      {
        condition: 'blood_clot_risk',
        severity: 'absolute',
        reason: 'Compression may dislodge clots',
      },
    ],
    description:
      'Foam rolling for the iliotibial band. Can be intense - adjust pressure as needed.',
    cues: [
      'Lie on side with roller under outer thigh',
      'Support body with bottom arm and top leg',
      'Roll from hip to just above knee',
      'This is often intense - moderate pressure',
      'Pause on tender areas if tolerable',
    ],
    modifications: {
      easier: [],
      harder: [],
    },
    defaultPrescription: {
      sets: 1,
      reps: '45 seconds each side',
      restSeconds: 30,
    },
  },
  {
    id: 'rec_foam_roll_upper_back',
    name: 'Foam Roll Upper Back',
    category: 'recovery',
    musclesPrimary: ['upper_back'],
    musclesSecondary: ['lats'],
    movementPattern: 'extension',
    jointActions: ['spinal_extension'],
    equipmentRequired: ['foam_roller'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'osteoporosis',
        severity: 'absolute',
        reason: 'Spinal pressure may risk fracture',
      },
      {
        condition: 'acute_rib_injury',
        severity: 'absolute',
        reason: 'Pressure on ribs will aggravate injury',
      },
    ],
    description:
      'Thoracic spine foam rolling to reduce upper back stiffness and improve extension mobility.',
    cues: [
      'Lie on back with roller under upper back',
      'Support head with hands, elbows forward',
      'Lift hips off floor',
      'Roll from mid-back to upper back',
      'Avoid rolling directly on neck or lower back',
    ],
    modifications: {
      easier: [],
      harder: [],
    },
    defaultPrescription: {
      sets: 1,
      reps: '60 seconds',
      restSeconds: 30,
    },
  },
  {
    id: 'rec_foam_roll_glutes',
    name: 'Foam Roll Glutes',
    category: 'recovery',
    musclesPrimary: ['glutes'],
    musclesSecondary: [],
    movementPattern: 'isometric',
    jointActions: [],
    equipmentRequired: ['foam_roller'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'sciatic_nerve_irritation',
        severity: 'relative',
        reason: 'Direct pressure may aggravate nerve',
        modification: 'Avoid deep pressure, focus on lateral glute',
        alternativeExerciseIds: ['rec_lacrosse_ball_glutes'],
      },
    ],
    description:
      'Foam rolling for the gluteal muscles. Helps release tension that can contribute to hip and back issues.',
    cues: [
      'Sit on roller, hands behind for support',
      'Cross one ankle over opposite knee',
      'Lean toward crossed leg side',
      'Roll across glute muscle',
      'Pause on tender spots',
    ],
    modifications: {
      easier: [],
      harder: ['rec_lacrosse_ball_glutes'],
    },
    defaultPrescription: {
      sets: 1,
      reps: '45 seconds each side',
      restSeconds: 30,
    },
  },
  {
    id: 'rec_lacrosse_ball_glutes',
    name: 'Lacrosse Ball Glute Release',
    category: 'recovery',
    musclesPrimary: ['glutes'],
    musclesSecondary: [],
    movementPattern: 'isometric',
    jointActions: [],
    equipmentRequired: ['lacrosse_ball', 'yoga_mat'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'sciatic_nerve_irritation',
        severity: 'absolute',
        reason: 'Focused pressure may severely aggravate nerve',
        alternativeExerciseIds: ['rec_foam_roll_glutes'],
      },
    ],
    description:
      'Targeted glute release using a lacrosse ball. More precise than foam rolling for finding and releasing trigger points.',
    cues: [
      'Sit on floor or against wall',
      'Place ball under one glute cheek',
      'Find a tender spot and apply pressure',
      'Hold for 30-60 seconds or until release',
      'Move to next tender area',
    ],
    modifications: {
      easier: ['rec_foam_roll_glutes'],
      harder: [],
    },
    defaultPrescription: {
      sets: 1,
      reps: '90 seconds each side',
      restSeconds: 30,
    },
  },
  {
    id: 'rec_diaphragmatic_breathing',
    name: 'Diaphragmatic Breathing',
    category: 'recovery',
    musclesPrimary: ['core_front'],
    musclesSecondary: [],
    movementPattern: 'isometric',
    jointActions: [],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [],
    description:
      'Deep belly breathing to activate the parasympathetic nervous system. Excellent for recovery and stress reduction.',
    cues: [
      'Lie on back with knees bent',
      'Place one hand on chest, one on belly',
      'Breathe in through nose, belly rises',
      'Chest hand should stay relatively still',
      'Exhale slowly through mouth',
    ],
    modifications: {
      easier: [],
      harder: ['rec_box_breathing'],
    },
    defaultPrescription: {
      sets: 1,
      reps: '10 breaths',
      restSeconds: 0,
    },
  },
  {
    id: 'rec_box_breathing',
    name: 'Box Breathing',
    category: 'recovery',
    musclesPrimary: ['core_front'],
    musclesSecondary: [],
    movementPattern: 'isometric',
    jointActions: [],
    equipmentRequired: ['none'],
    skillLevel: 'beginner',
    contraindications: [],
    description:
      'A structured breathing pattern with equal inhale, hold, exhale, and hold phases. Calms the nervous system and improves focus.',
    cues: [
      'Inhale for 4 counts',
      'Hold breath for 4 counts',
      'Exhale for 4 counts',
      'Hold empty for 4 counts',
      'Repeat cycle',
    ],
    modifications: {
      easier: ['rec_diaphragmatic_breathing'],
      harder: [],
    },
    defaultPrescription: {
      sets: 1,
      reps: '8 cycles',
      restSeconds: 0,
    },
  },
  {
    id: 'rec_childs_pose',
    name: "Child's Pose",
    category: 'recovery',
    musclesPrimary: ['lower_back'],
    musclesSecondary: ['glutes', 'lats'],
    movementPattern: 'flexion',
    jointActions: ['hip_flexion', 'spinal_flexion'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Deep knee flexion in this position',
        modification: 'Place blanket behind knees for support',
      },
    ],
    description:
      'A restorative yoga pose that gently stretches the back and promotes relaxation. A great finish to any session.',
    cues: [
      'Kneel on floor, big toes touching',
      'Sit back on heels',
      'Fold forward, reaching arms ahead',
      'Rest forehead on floor',
      'Breathe deeply and relax completely',
    ],
    modifications: {
      easier: [],
      harder: [],
    },
    defaultPrescription: {
      sets: 1,
      reps: '60 seconds',
      restSeconds: 0,
    },
  },
];

// ============================================================================
// COMBINED EXERCISE LIBRARY
// ============================================================================

/**
 * Complete exercise library containing all exercises organized by category
 */
export const EXERCISES: Exercise[] = [
  ...mobilityExercises,
  ...stretchingExercises,
  ...activationExercises,
  ...strengthExercises,
  ...recoveryExercises,
];

/**
 * Exercise lookup map by ID for O(1) access
 */
export const EXERCISES_BY_ID: Record<string, Exercise> = EXERCISES.reduce(
  (acc, exercise) => {
    acc[exercise.id] = exercise;
    return acc;
  },
  {} as Record<string, Exercise>
);

/**
 * Get exercise by ID
 */
export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES_BY_ID[id];
}

/**
 * Get exercises by category
 */
export function getExercisesByCategory(category: ExerciseCategory): Exercise[] {
  return EXERCISES.filter((e) => e.category === category);
}

/**
 * Get exercises by muscle group (primary or secondary)
 */
export function getExercisesByMuscleGroup(
  muscleGroup: MuscleGroup,
  primaryOnly = false
): Exercise[] {
  return EXERCISES.filter((e) => {
    if (e.musclesPrimary.includes(muscleGroup)) return true;
    if (!primaryOnly && e.musclesSecondary.includes(muscleGroup)) return true;
    return false;
  });
}

/**
 * Get exercises by movement pattern
 */
export function getExercisesByMovementPattern(pattern: MovementPattern): Exercise[] {
  return EXERCISES.filter((e) => e.movementPattern === pattern);
}

/**
 * Get exercises by skill level
 */
export function getExercisesBySkillLevel(
  level: 'beginner' | 'intermediate' | 'advanced'
): Exercise[] {
  return EXERCISES.filter((e) => e.skillLevel === level);
}

/**
 * Get exercises that require no equipment
 */
export function getBodyweightExercises(): Exercise[] {
  return EXERCISES.filter(
    (e) => e.equipmentRequired.length === 0 || e.equipmentRequired.includes('none')
  );
}

/**
 * Filter exercises by available equipment
 */
export function filterByEquipment(
  exercises: Exercise[],
  availableEquipment: Equipment[]
): Exercise[] {
  const available = new Set([...availableEquipment, 'none']);
  return exercises.filter((e) =>
    e.equipmentRequired.every((eq) => available.has(eq))
  );
}

/**
 * Filter out exercises contraindicated for given conditions
 */
export function filterByContraindications(
  exercises: Exercise[],
  conditions: string[]
): Exercise[] {
  const conditionSet = new Set(conditions.map((c) => c.toLowerCase()));

  return exercises.filter((e) => {
    // Check if any contraindication is absolute for one of the user's conditions
    const hasAbsoluteContraindication = e.contraindications.some(
      (c) =>
        c.severity === 'absolute' && conditionSet.has(c.condition.toLowerCase())
    );
    return !hasAbsoluteContraindication;
  });
}

/**
 * Get alternative exercises for a given contraindication
 */
export function getAlternativesForContraindication(
  exercise: Exercise,
  condition: string
): Exercise[] {
  const contraindication = exercise.contraindications.find(
    (c) => c.condition.toLowerCase() === condition.toLowerCase()
  );

  if (!contraindication?.alternativeExerciseIds) return [];

  return contraindication.alternativeExerciseIds
    .map((id) => EXERCISES_BY_ID[id])
    .filter((e): e is Exercise => e !== undefined);
}

// ============================================================================
// CONTRAINDICATION CONDITIONS (for reference)
// ============================================================================

/**
 * Standard contraindication condition identifiers used throughout the library
 */
export const CONTRAINDICATION_CONDITIONS = {
  // Knee
  KNEE_INJURY: 'knee_injury',
  ACL_RECOVERY: 'acl_recovery',
  PATELLOFEMORAL_SYNDROME: 'patellofemoral_syndrome',

  // Back
  ACUTE_LOWER_BACK_PAIN: 'acute_lower_back_pain',
  DISC_HERNIATION: 'disc_herniation',
  ACUTE_DISC_HERNIATION: 'acute_disc_herniation',

  // Hip
  HIP_REPLACEMENT: 'hip_replacement',
  HIP_LABRAL_TEAR: 'hip_labral_tear',

  // Shoulder
  SHOULDER_IMPINGEMENT: 'shoulder_impingement',
  SHOULDER_DISLOCATION_HISTORY: 'shoulder_dislocation_history',
  SHOULDER_LABRAL_TEAR: 'shoulder_labral_tear',
  ROTATOR_CUFF_INJURY: 'rotator_cuff_injury',

  // Ankle/Foot
  ACUTE_ANKLE_SPRAIN: 'acute_ankle_sprain',
  ACHILLES_TENDINOPATHY: 'achilles_tendinopathy',

  // Wrist
  WRIST_INJURY: 'wrist_injury',

  // Other
  BALANCE_ISSUES: 'balance_issues',
  OSTEOPOROSIS: 'osteoporosis',
  SCIATIC_NERVE_IRRITATION: 'sciatic_nerve_irritation',
  BLOOD_CLOT_RISK: 'blood_clot_risk',
  ACUTE_MUSCLE_STRAIN: 'acute_muscle_strain',
  ACUTE_RIB_INJURY: 'acute_rib_injury',
  ACUTE_IT_BAND_SYNDROME: 'acute_it_band_syndrome',
} as const;

export type ContraindicationCondition =
  (typeof CONTRAINDICATION_CONDITIONS)[keyof typeof CONTRAINDICATION_CONDITIONS];
