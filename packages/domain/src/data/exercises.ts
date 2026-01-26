/**
 * Exercise Library for Body Recovery Companion App
 *
 * Contains 113 exercises covering:
 * - Mobility (19): CARs, joint circles, dynamic stretches, hip/spine/ankle mobility
 * - Stretching (20): Static holds, PNF patterns, yoga-inspired stretches
 * - Activation (26): Glute activation, core engagement, scapular control
 * - Strength (26): Bodyweight progressions, isometrics, tempo work
 * - Recovery (22): Breathing, foam rolling, gentle movement, relaxation
 *
 * Body regions covered: neck, shoulders, upper back, lower back, hips, knees, ankles, wrists
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
// MOBILITY EXERCISES (19 exercises)
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
  {
    id: 'mob_shoulder_cars',
    name: 'Shoulder CARs (Controlled Articular Rotations)',
    category: 'mobility',
    musclesPrimary: ['shoulders_front', 'shoulders_side', 'shoulders_rear'],
    musclesSecondary: ['upper_back', 'chest'],
    movementPattern: 'rotation',
    jointActions: ['shoulder_flexion', 'shoulder_extension', 'shoulder_abduction', 'shoulder_internal_rotation', 'shoulder_external_rotation'],
    equipmentRequired: ['none'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'shoulder_impingement',
        severity: 'relative',
        reason: 'Full rotation may compress structures',
        modification: 'Reduce range of motion, skip painful arcs',
      },
      {
        condition: 'shoulder_labral_tear',
        severity: 'relative',
        reason: 'End-range positions may stress labrum',
        modification: 'Keep movements small and controlled',
      },
    ],
    description:
      'A joint health exercise moving the shoulder through its full range of motion. Maintains and improves joint capsule health.',
    cues: [
      'Stand tall with core engaged',
      'Keep arm straight throughout',
      'Slowly trace the largest circle possible with your hand',
      'Move through any sticky points slowly',
      'Maintain tension - do not use momentum',
    ],
    modifications: {
      easier: ['mob_shoulder_circles'],
      harder: [],
    },
    defaultPrescription: {
      sets: 2,
      reps: '5 circles each direction, each arm',
      restSeconds: 30,
    },
  },
  {
    id: 'mob_shoulder_circles',
    name: 'Shoulder Circles',
    category: 'mobility',
    musclesPrimary: ['shoulders_front', 'shoulders_side', 'shoulders_rear'],
    musclesSecondary: ['upper_back'],
    movementPattern: 'rotation',
    jointActions: ['shoulder_flexion', 'shoulder_extension'],
    equipmentRequired: ['none'],
    skillLevel: 'beginner',
    contraindications: [],
    description:
      'Simple shoulder mobility exercise drawing circles with the shoulders. Great warm-up for any upper body work.',
    cues: [
      'Stand or sit with arms relaxed',
      'Roll shoulders forward, up, back, and down',
      'Make the circles as large as comfortable',
      'Move slowly and deliberately',
      'Reverse direction after completing reps',
    ],
    modifications: {
      easier: [],
      harder: ['mob_shoulder_cars'],
    },
    defaultPrescription: {
      sets: 2,
      reps: '10 circles each direction',
      restSeconds: 15,
    },
  },
  {
    id: 'mob_neck_cars',
    name: 'Neck CARs (Controlled Articular Rotations)',
    category: 'mobility',
    musclesPrimary: ['neck'],
    musclesSecondary: ['upper_back'],
    movementPattern: 'rotation',
    jointActions: ['spinal_rotation', 'spinal_flexion', 'spinal_extension', 'spinal_lateral_flexion'],
    equipmentRequired: ['none'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'cervical_disc_herniation',
        severity: 'absolute',
        reason: 'Full neck rotation may aggravate disc issues',
        alternativeExerciseIds: ['mob_neck_tilts'],
      },
      {
        condition: 'cervical_stenosis',
        severity: 'absolute',
        reason: 'Extension component may compress spinal cord',
      },
    ],
    description:
      'A controlled neck mobility drill moving through all planes of motion. Maintains cervical spine health.',
    cues: [
      'Keep shoulders relaxed and down',
      'Tuck chin slightly to start',
      'Slowly rotate head in largest circle possible',
      'Move through each position deliberately',
      'Breathe normally throughout',
    ],
    modifications: {
      easier: ['mob_neck_tilts'],
      harder: [],
    },
    defaultPrescription: {
      sets: 2,
      reps: '3 circles each direction',
      restSeconds: 15,
    },
  },
  {
    id: 'mob_neck_tilts',
    name: 'Neck Tilts',
    category: 'mobility',
    musclesPrimary: ['neck'],
    musclesSecondary: [],
    movementPattern: 'lateral',
    jointActions: ['spinal_lateral_flexion'],
    equipmentRequired: ['none'],
    skillLevel: 'beginner',
    contraindications: [],
    description:
      'Gentle lateral neck movements to improve side-to-side mobility and reduce tension.',
    cues: [
      'Sit or stand with spine tall',
      'Slowly tilt ear toward shoulder',
      'Keep shoulders down - do not shrug',
      'Hold briefly at end range',
      'Return to center and repeat other side',
    ],
    modifications: {
      easier: [],
      harder: ['mob_neck_cars'],
    },
    defaultPrescription: {
      sets: 2,
      reps: '8 each side',
      restSeconds: 15,
    },
  },
  {
    id: 'mob_wrist_circles',
    name: 'Wrist Circles',
    category: 'mobility',
    musclesPrimary: ['forearms'],
    musclesSecondary: [],
    movementPattern: 'rotation',
    jointActions: ['wrist_flexion', 'wrist_extension'],
    equipmentRequired: ['none'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'wrist_injury',
        severity: 'relative',
        reason: 'Rotation may aggravate acute injuries',
        modification: 'Keep movements small and pain-free',
      },
    ],
    description:
      'Simple wrist mobility exercise to maintain healthy wrist range of motion. Essential for desk workers.',
    cues: [
      'Extend arms in front or make fists',
      'Draw circles with your hands',
      'Move through full range of motion',
      'Keep forearms still - movement from wrists only',
      'Reverse direction after completing reps',
    ],
    modifications: {
      easier: [],
      harder: ['mob_wrist_cars'],
    },
    defaultPrescription: {
      sets: 2,
      reps: '10 circles each direction',
      restSeconds: 15,
    },
  },
  {
    id: 'mob_wrist_cars',
    name: 'Wrist CARs (Controlled Articular Rotations)',
    category: 'mobility',
    musclesPrimary: ['forearms'],
    musclesSecondary: [],
    movementPattern: 'rotation',
    jointActions: ['wrist_flexion', 'wrist_extension'],
    equipmentRequired: ['none'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'carpal_tunnel_syndrome',
        severity: 'relative',
        reason: 'End-range positions may compress median nerve',
        modification: 'Reduce range of motion, avoid extreme flexion',
      },
    ],
    description:
      'Controlled articular rotations for wrist joint health. Moves through full range under tension.',
    cues: [
      'Make a fist with one hand',
      'Support forearm with other hand',
      'Slowly rotate wrist through largest circle possible',
      'Create tension throughout - resist the movement',
      'Move slowly through sticky areas',
    ],
    modifications: {
      easier: ['mob_wrist_circles'],
      harder: [],
    },
    defaultPrescription: {
      sets: 2,
      reps: '5 circles each direction, each wrist',
      restSeconds: 15,
    },
  },
  {
    id: 'mob_hip_circles',
    name: 'Hip Circles',
    category: 'mobility',
    musclesPrimary: ['hip_flexors', 'glutes'],
    musclesSecondary: ['adductors', 'abductors'],
    movementPattern: 'rotation',
    jointActions: ['hip_flexion', 'hip_extension', 'hip_abduction', 'hip_adduction'],
    equipmentRequired: ['none'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'hip_labral_tear',
        severity: 'relative',
        reason: 'Circular movements may stress labrum',
        modification: 'Keep circles small, avoid clicking or catching',
      },
    ],
    description:
      'Standing hip circles to warm up and mobilize the hip joint. Great dynamic warm-up exercise.',
    cues: [
      'Stand on one leg, hold wall for balance if needed',
      'Lift opposite knee to hip height',
      'Draw large circles with knee',
      'Keep standing leg stable',
      'Move in both directions',
    ],
    modifications: {
      easier: [],
      harder: ['mob_hip_cars'],
    },
    defaultPrescription: {
      sets: 2,
      reps: '8 circles each direction, each leg',
      restSeconds: 15,
    },
  },
  {
    id: 'mob_hip_cars',
    name: 'Hip CARs (Controlled Articular Rotations)',
    category: 'mobility',
    musclesPrimary: ['hip_flexors', 'glutes'],
    musclesSecondary: ['adductors', 'abductors', 'core_front'],
    movementPattern: 'rotation',
    jointActions: ['hip_flexion', 'hip_extension', 'hip_abduction', 'hip_adduction', 'hip_internal_rotation', 'hip_external_rotation'],
    equipmentRequired: ['none'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'hip_replacement',
        severity: 'absolute',
        reason: 'Full rotation may exceed surgical precautions',
      },
      {
        condition: 'hip_labral_tear',
        severity: 'relative',
        reason: 'End-range rotations may stress labrum',
        modification: 'Limit range, avoid positions that cause clicking',
      },
    ],
    description:
      'Controlled articular rotations for hip joint health. The gold standard for hip mobility maintenance.',
    cues: [
      'Stand on one leg or kneel on all fours',
      'Lift knee forward, then out to side',
      'Rotate hip to bring knee behind you',
      'Reverse the path back to start',
      'Keep pelvis stable - movement from hip only',
    ],
    modifications: {
      easier: ['mob_hip_circles'],
      harder: [],
    },
    defaultPrescription: {
      sets: 2,
      reps: '5 rotations each direction, each hip',
      restSeconds: 30,
    },
  },
  {
    id: 'mob_knee_circles',
    name: 'Knee Circles',
    category: 'mobility',
    musclesPrimary: ['quads'],
    musclesSecondary: ['calves'],
    movementPattern: 'rotation',
    jointActions: ['knee_flexion', 'knee_extension'],
    equipmentRequired: ['none'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Rotational movement may stress knee structures',
        modification: 'Keep movements very small and gentle',
      },
    ],
    description:
      'Gentle knee joint mobility exercise. Helps warm up the knee and maintain joint health.',
    cues: [
      'Stand with feet together, slight knee bend',
      'Place hands on knees',
      'Draw circles with knees together',
      'Keep feet flat on floor',
      'Move in both directions',
    ],
    modifications: {
      easier: [],
      harder: [],
    },
    defaultPrescription: {
      sets: 2,
      reps: '10 circles each direction',
      restSeconds: 15,
    },
  },
  {
    id: 'mob_worlds_greatest_stretch',
    name: "World's Greatest Stretch",
    category: 'mobility',
    musclesPrimary: ['hip_flexors', 'upper_back', 'hamstrings'],
    musclesSecondary: ['glutes', 'adductors', 'chest'],
    movementPattern: 'rotation',
    jointActions: ['hip_flexion', 'hip_extension', 'spinal_rotation'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'acute_lower_back_pain',
        severity: 'relative',
        reason: 'Combined movements may aggravate back',
        modification: 'Skip rotation component, focus on lunge only',
      },
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Deep lunge position stresses knee',
        modification: 'Use elevated surface for front foot',
      },
    ],
    description:
      'A comprehensive dynamic stretch combining hip flexor stretch, hamstring stretch, and thoracic rotation. The ultimate warm-up movement.',
    cues: [
      'Start in push-up position',
      'Step one foot outside same-side hand',
      'Drop back knee to ground (optional)',
      'Rotate torso, reaching same-side arm to ceiling',
      'Return hand to floor, straighten front leg for hamstring stretch',
    ],
    modifications: {
      easier: ['str_kneeling_hip_flexor'],
      harder: [],
    },
    defaultPrescription: {
      sets: 2,
      reps: '5 each side',
      restSeconds: 30,
    },
  },
  {
    id: 'mob_spiderman_lunge',
    name: 'Spiderman Lunge',
    category: 'mobility',
    musclesPrimary: ['hip_flexors', 'adductors'],
    musclesSecondary: ['glutes', 'hamstrings'],
    movementPattern: 'lunge',
    jointActions: ['hip_flexion', 'hip_extension', 'hip_abduction'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'groin_strain',
        severity: 'absolute',
        reason: 'Deep adductor stretch may aggravate strain',
        alternativeExerciseIds: ['str_kneeling_hip_flexor'],
      },
    ],
    description:
      'A dynamic hip opener that targets hip flexors and adductors. Excellent for improving squat depth.',
    cues: [
      'Start in push-up position',
      'Step one foot outside same-side hand',
      'Sink hips toward floor',
      'Keep back leg straight',
      'Rock gently in position or hold static',
    ],
    modifications: {
      easier: ['str_kneeling_hip_flexor'],
      harder: ['mob_worlds_greatest_stretch'],
    },
    defaultPrescription: {
      sets: 2,
      reps: '8 each side',
      restSeconds: 30,
    },
  },
];

// ============================================================================
// STRETCHING EXERCISES (20 exercises)
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
  {
    id: 'str_lat_stretch',
    name: 'Lat Stretch',
    category: 'stretching',
    musclesPrimary: ['lats'],
    musclesSecondary: ['core_obliques', 'shoulders_rear'],
    movementPattern: 'lateral',
    jointActions: ['shoulder_flexion', 'spinal_lateral_flexion'],
    equipmentRequired: ['wall'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'shoulder_impingement',
        severity: 'relative',
        reason: 'Overhead position may compress shoulder',
        modification: 'Keep arm lower, reduce stretch intensity',
      },
    ],
    description:
      'A standing lat stretch using a wall or doorframe. Targets the latissimus dorsi and improves overhead mobility.',
    cues: [
      'Stand sideways to wall, arm extended overhead on wall',
      'Step away from wall with feet',
      'Push hips toward wall',
      'Feel stretch along side of body',
      'Breathe deeply into the stretch',
    ],
    modifications: {
      easier: [],
      harder: [],
    },
    defaultPrescription: {
      sets: 2,
      reps: '30 seconds each side',
      restSeconds: 15,
    },
  },
  {
    id: 'str_upper_trap_stretch',
    name: 'Upper Trapezius Stretch',
    category: 'stretching',
    musclesPrimary: ['neck'],
    musclesSecondary: ['upper_back'],
    movementPattern: 'lateral',
    jointActions: ['spinal_lateral_flexion'],
    equipmentRequired: ['none'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'cervical_disc_herniation',
        severity: 'relative',
        reason: 'Lateral neck stretch may aggravate condition',
        modification: 'Use very gentle pressure, no pulling',
      },
    ],
    description:
      'A gentle neck stretch targeting the upper trapezius. Essential for desk workers and anyone with neck tension.',
    cues: [
      'Sit or stand tall',
      'Tilt ear toward shoulder',
      'Gently place hand on head to add light pressure',
      'Keep opposite shoulder down',
      'Hold and breathe into the stretch',
    ],
    modifications: {
      easier: [],
      harder: [],
    },
    defaultPrescription: {
      sets: 2,
      reps: '30 seconds each side',
      restSeconds: 15,
    },
  },
  {
    id: 'str_levator_scap_stretch',
    name: 'Levator Scapulae Stretch',
    category: 'stretching',
    musclesPrimary: ['neck'],
    musclesSecondary: ['upper_back'],
    movementPattern: 'rotation',
    jointActions: ['spinal_rotation', 'spinal_flexion'],
    equipmentRequired: ['none'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'cervical_disc_herniation',
        severity: 'relative',
        reason: 'Rotated neck position may stress disc',
        modification: 'Reduce rotation angle and pressure',
      },
    ],
    description:
      'A stretch targeting the levator scapulae muscle, a common source of neck and shoulder blade pain.',
    cues: [
      'Rotate head 45 degrees to one side',
      'Tuck chin and look toward armpit',
      'Place same-side hand on back of head',
      'Apply gentle downward pressure',
      'Keep opposite shoulder down and back',
    ],
    modifications: {
      easier: ['str_upper_trap_stretch'],
      harder: [],
    },
    defaultPrescription: {
      sets: 2,
      reps: '30 seconds each side',
      restSeconds: 15,
    },
  },
  {
    id: 'str_pigeon_pose',
    name: 'Pigeon Pose',
    category: 'stretching',
    musclesPrimary: ['glutes', 'hip_flexors'],
    musclesSecondary: ['adductors'],
    movementPattern: 'rotation',
    jointActions: ['hip_external_rotation', 'hip_flexion', 'hip_extension'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Front leg position stresses knee',
        modification: 'Keep front shin more angled, use props under hip',
        alternativeExerciseIds: ['mob_supine_figure_four'],
      },
      {
        condition: 'hip_labral_tear',
        severity: 'relative',
        reason: 'Deep hip rotation may stress labrum',
        modification: 'Keep front shin more angled',
      },
    ],
    description:
      'A deep hip stretch from yoga targeting external rotators and hip flexors. One of the most effective hip openers.',
    cues: [
      'From hands and knees, bring one knee forward behind same wrist',
      'Extend back leg straight behind you',
      'Square hips toward floor as much as possible',
      'Stay upright or fold forward over front leg',
      'Breathe deeply and relax into stretch',
    ],
    modifications: {
      easier: ['mob_supine_figure_four'],
      harder: [],
    },
    defaultPrescription: {
      sets: 2,
      reps: '60 seconds each side',
      restSeconds: 30,
    },
  },
  {
    id: 'str_frog_stretch',
    name: 'Frog Stretch',
    category: 'stretching',
    musclesPrimary: ['adductors'],
    musclesSecondary: ['hip_flexors', 'glutes'],
    movementPattern: 'lateral',
    jointActions: ['hip_abduction', 'hip_external_rotation'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'groin_strain',
        severity: 'absolute',
        reason: 'Intense adductor stretch will aggravate strain',
      },
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Kneeling position with wide legs stresses knees',
        modification: 'Place padding under knees, reduce width',
      },
    ],
    description:
      'An intense inner thigh stretch performed on all fours. Excellent for improving hip abduction and squat width.',
    cues: [
      'Start on hands and knees',
      'Slowly widen knees apart',
      'Keep feet in line with knees, toes pointing out',
      'Sink hips back and down',
      'Go to comfortable stretch, not pain',
    ],
    modifications: {
      easier: ['str_butterfly_stretch'],
      harder: [],
    },
    defaultPrescription: {
      sets: 2,
      reps: '45 seconds',
      restSeconds: 30,
    },
  },
  {
    id: 'str_butterfly_stretch',
    name: 'Butterfly Stretch',
    category: 'stretching',
    musclesPrimary: ['adductors'],
    musclesSecondary: ['hip_flexors'],
    movementPattern: 'lateral',
    jointActions: ['hip_abduction', 'hip_external_rotation'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'groin_strain',
        severity: 'relative',
        reason: 'Adductor stretch may aggravate strain',
        modification: 'Keep feet further from body, reduce pressure',
      },
    ],
    description:
      'A seated inner thigh stretch with soles of feet together. A gentle and accessible adductor stretch.',
    cues: [
      'Sit tall with soles of feet together',
      'Hold ankles, not toes',
      'Let knees drop toward floor',
      'Keep spine tall - avoid rounding',
      'Gently press knees down with elbows for deeper stretch',
    ],
    modifications: {
      easier: [],
      harder: ['str_frog_stretch'],
    },
    defaultPrescription: {
      sets: 2,
      reps: '45 seconds',
      restSeconds: 15,
    },
  },
  {
    id: 'str_seated_spinal_twist',
    name: 'Seated Spinal Twist',
    category: 'stretching',
    musclesPrimary: ['core_obliques', 'lower_back'],
    musclesSecondary: ['glutes', 'upper_back'],
    movementPattern: 'rotation',
    jointActions: ['spinal_rotation'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'disc_herniation',
        severity: 'relative',
        reason: 'Spinal rotation may stress disc',
        modification: 'Keep rotation gentle, avoid end-range',
        alternativeExerciseIds: ['mob_open_book'],
      },
    ],
    description:
      'A seated twist to improve spinal rotation and stretch the obliques and lower back.',
    cues: [
      'Sit with one leg extended, other foot outside opposite knee',
      'Sit tall, lengthening spine',
      'Rotate toward bent knee',
      'Use opposite elbow against knee for leverage',
      'Look over shoulder, twist from mid-back',
    ],
    modifications: {
      easier: ['mob_open_book'],
      harder: [],
    },
    defaultPrescription: {
      sets: 2,
      reps: '30 seconds each side',
      restSeconds: 15,
    },
  },
  {
    id: 'str_prone_quad_stretch',
    name: 'Prone Quad Stretch',
    category: 'stretching',
    musclesPrimary: ['quads'],
    musclesSecondary: ['hip_flexors'],
    movementPattern: 'flexion',
    jointActions: ['knee_flexion', 'hip_extension'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Knee flexion may stress joint',
        modification: 'Reduce knee bend angle',
      },
    ],
    description:
      'A prone (face-down) quadriceps stretch. A comfortable alternative to standing quad stretches.',
    cues: [
      'Lie face down',
      'Bend one knee, bringing heel toward glute',
      'Reach back and grab ankle or foot',
      'Keep hips pressed into floor',
      'Pull heel gently toward glute',
    ],
    modifications: {
      easier: [],
      harder: ['str_couch_stretch'],
    },
    defaultPrescription: {
      sets: 2,
      reps: '30 seconds each side',
      restSeconds: 15,
    },
  },
  {
    id: 'str_standing_quad_stretch',
    name: 'Standing Quad Stretch',
    category: 'stretching',
    musclesPrimary: ['quads'],
    musclesSecondary: ['hip_flexors'],
    movementPattern: 'flexion',
    jointActions: ['knee_flexion'],
    equipmentRequired: ['none'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Knee flexion may aggravate injury',
        modification: 'Reduce knee bend, use strap around ankle',
      },
      {
        condition: 'balance_issues',
        severity: 'relative',
        reason: 'Single leg stance required',
        modification: 'Hold wall or chair for support',
      },
    ],
    description:
      'The classic standing quadriceps stretch. Can be performed anywhere without equipment.',
    cues: [
      'Stand on one leg (hold wall if needed)',
      'Bend opposite knee, grab ankle behind you',
      'Keep knees together',
      'Stand tall - avoid leaning forward',
      'Tuck pelvis slightly for deeper stretch',
    ],
    modifications: {
      easier: ['str_prone_quad_stretch'],
      harder: ['str_couch_stretch'],
    },
    defaultPrescription: {
      sets: 2,
      reps: '30 seconds each side',
      restSeconds: 15,
    },
  },
  {
    id: 'str_calf_stretch_wall',
    name: 'Wall Calf Stretch',
    category: 'stretching',
    musclesPrimary: ['calves'],
    musclesSecondary: [],
    movementPattern: 'extension',
    jointActions: ['ankle_dorsiflexion'],
    equipmentRequired: ['wall'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'achilles_tendinopathy',
        severity: 'relative',
        reason: 'Stretch may aggravate tendon',
        modification: 'Use very gentle stretch, bend knee slightly',
      },
    ],
    description:
      'A classic calf stretch using a wall. Targets the gastrocnemius muscle.',
    cues: [
      'Stand facing wall, hands on wall',
      'Step one foot back, keeping heel on floor',
      'Lean into wall, keeping back leg straight',
      'Feel stretch in calf of back leg',
      'Keep back heel firmly planted',
    ],
    modifications: {
      easier: [],
      harder: ['str_calf_stretch_bent_knee'],
    },
    defaultPrescription: {
      sets: 2,
      reps: '30 seconds each side',
      restSeconds: 15,
    },
  },
  {
    id: 'str_calf_stretch_bent_knee',
    name: 'Bent Knee Calf Stretch (Soleus)',
    category: 'stretching',
    musclesPrimary: ['calves'],
    musclesSecondary: [],
    movementPattern: 'extension',
    jointActions: ['ankle_dorsiflexion'],
    equipmentRequired: ['wall'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'achilles_tendinopathy',
        severity: 'relative',
        reason: 'Loading the Achilles while stretched',
        modification: 'Keep minimal bend, reduce pressure',
      },
    ],
    description:
      'A calf stretch with bent knee to target the deeper soleus muscle. Complements the straight-leg calf stretch.',
    cues: [
      'Stand facing wall with both feet back',
      'Bend both knees while keeping heels down',
      'Focus on back leg, lowering into deep bend',
      'Feel stretch lower in calf, near Achilles',
      'Keep heel firmly planted',
    ],
    modifications: {
      easier: ['str_calf_stretch_wall'],
      harder: [],
    },
    defaultPrescription: {
      sets: 2,
      reps: '30 seconds each side',
      restSeconds: 15,
    },
  },
  {
    id: 'str_tricep_stretch',
    name: 'Overhead Tricep Stretch',
    category: 'stretching',
    musclesPrimary: ['triceps'],
    musclesSecondary: ['lats', 'shoulders_rear'],
    movementPattern: 'flexion',
    jointActions: ['shoulder_flexion', 'elbow_flexion'],
    equipmentRequired: ['none'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'shoulder_impingement',
        severity: 'relative',
        reason: 'Overhead position may compress shoulder',
        modification: 'Keep arm lower, use other hand to assist gently',
      },
    ],
    description:
      'A standing tricep stretch with arm overhead. Stretches the long head of the triceps and lats.',
    cues: [
      'Raise one arm overhead',
      'Bend elbow, reaching hand down toward opposite shoulder blade',
      'Use other hand to gently press elbow back',
      'Keep torso upright - avoid side bending',
      'Breathe and hold',
    ],
    modifications: {
      easier: [],
      harder: [],
    },
    defaultPrescription: {
      sets: 2,
      reps: '30 seconds each side',
      restSeconds: 15,
    },
  },
];

// ============================================================================
// ACTIVATION EXERCISES (26 exercises)
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
  {
    id: 'act_side_lying_hip_abduction',
    name: 'Side Lying Hip Abduction',
    category: 'activation',
    musclesPrimary: ['abductors', 'glutes'],
    musclesSecondary: [],
    movementPattern: 'lateral',
    jointActions: ['hip_abduction'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [],
    description:
      'A side-lying exercise to activate the gluteus medius. Essential for hip stability and knee health.',
    cues: [
      'Lie on side with legs stacked',
      'Keep bottom knee bent for stability',
      'Lift top leg toward ceiling',
      'Keep foot parallel to floor - do not rotate',
      'Lower with control',
    ],
    modifications: {
      easier: [],
      harder: ['act_banded_side_lying_abduction'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '15 each side',
      restSeconds: 30,
    },
  },
  {
    id: 'act_banded_side_lying_abduction',
    name: 'Banded Side Lying Hip Abduction',
    category: 'activation',
    musclesPrimary: ['abductors', 'glutes'],
    musclesSecondary: [],
    movementPattern: 'lateral',
    jointActions: ['hip_abduction'],
    equipmentRequired: ['yoga_mat', 'resistance_band'],
    skillLevel: 'intermediate',
    contraindications: [],
    description:
      'A banded version of side lying hip abduction for increased gluteus medius activation.',
    cues: [
      'Place band around ankles or above knees',
      'Lie on side with legs stacked',
      'Lift top leg against band resistance',
      'Control the return - do not let band snap',
      'Keep hips stacked, do not roll backward',
    ],
    modifications: {
      easier: ['act_side_lying_hip_abduction'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '12 each side',
      restSeconds: 30,
    },
  },
  {
    id: 'act_prone_hip_extension',
    name: 'Prone Hip Extension',
    category: 'activation',
    musclesPrimary: ['glutes'],
    musclesSecondary: ['hamstrings', 'lower_back'],
    movementPattern: 'hip_hinge',
    jointActions: ['hip_extension'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'acute_lower_back_pain',
        severity: 'relative',
        reason: 'Hip extension may stress lower back',
        modification: 'Keep range of motion small, engage core',
      },
    ],
    description:
      'A prone glute activation exercise lifting one leg at a time. Teaches isolated hip extension.',
    cues: [
      'Lie face down with forehead on hands',
      'Keep legs straight',
      'Lift one leg off floor, squeezing glute',
      'Keep hips pressed into floor',
      'Lower with control',
    ],
    modifications: {
      easier: [],
      harder: ['act_quadruped_hip_extension'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '12 each side',
      restSeconds: 30,
    },
  },
  {
    id: 'act_quadruped_hip_extension',
    name: 'Quadruped Hip Extension (Donkey Kick)',
    category: 'activation',
    musclesPrimary: ['glutes'],
    musclesSecondary: ['hamstrings', 'core_front'],
    movementPattern: 'hip_hinge',
    jointActions: ['hip_extension'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'wrist_injury',
        severity: 'relative',
        reason: 'Weight bearing through wrists',
        modification: 'Use forearms instead of hands',
      },
    ],
    description:
      'A kneeling glute exercise lifting one leg behind. Activates glutes while challenging core stability.',
    cues: [
      'Start on hands and knees',
      'Keep core engaged, back flat',
      'Drive one heel toward ceiling',
      'Squeeze glute at top',
      'Keep knee bent at 90 degrees throughout',
    ],
    modifications: {
      easier: ['act_prone_hip_extension'],
      harder: ['act_banded_quadruped_hip_extension'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '12 each side',
      restSeconds: 30,
    },
  },
  {
    id: 'act_banded_quadruped_hip_extension',
    name: 'Banded Quadruped Hip Extension',
    category: 'activation',
    musclesPrimary: ['glutes'],
    musclesSecondary: ['hamstrings', 'core_front'],
    movementPattern: 'hip_hinge',
    jointActions: ['hip_extension'],
    equipmentRequired: ['yoga_mat', 'resistance_band'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'wrist_injury',
        severity: 'relative',
        reason: 'Weight bearing through wrists',
        modification: 'Use forearms instead of hands',
      },
    ],
    description:
      'A resistance band variation of quadruped hip extension for enhanced glute activation.',
    cues: [
      'Loop band around foot and anchor under hands',
      'Start on hands and knees',
      'Drive heel toward ceiling against band',
      'Control the return',
      'Keep back flat throughout',
    ],
    modifications: {
      easier: ['act_quadruped_hip_extension'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '10 each side',
      restSeconds: 30,
    },
  },
  {
    id: 'act_fire_hydrant',
    name: 'Fire Hydrant',
    category: 'activation',
    musclesPrimary: ['abductors', 'glutes'],
    musclesSecondary: ['core_front'],
    movementPattern: 'lateral',
    jointActions: ['hip_abduction', 'hip_external_rotation'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'hip_labral_tear',
        severity: 'relative',
        reason: 'Hip rotation may stress labrum',
        modification: 'Keep range of motion small',
      },
      {
        condition: 'wrist_injury',
        severity: 'relative',
        reason: 'Weight bearing through wrists',
        modification: 'Use forearms instead of hands',
      },
    ],
    description:
      'A quadruped exercise lifting the leg out to the side. Activates the gluteus medius and external rotators.',
    cues: [
      'Start on hands and knees',
      'Keep knee bent at 90 degrees',
      'Lift knee out to side, like a dog at a fire hydrant',
      'Keep hips square - do not rotate pelvis',
      'Lower with control',
    ],
    modifications: {
      easier: [],
      harder: ['act_banded_fire_hydrant'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '12 each side',
      restSeconds: 30,
    },
  },
  {
    id: 'act_banded_fire_hydrant',
    name: 'Banded Fire Hydrant',
    category: 'activation',
    musclesPrimary: ['abductors', 'glutes'],
    musclesSecondary: ['core_front'],
    movementPattern: 'lateral',
    jointActions: ['hip_abduction', 'hip_external_rotation'],
    equipmentRequired: ['yoga_mat', 'resistance_band'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'hip_labral_tear',
        severity: 'relative',
        reason: 'Increased resistance stresses hip joint',
        modification: 'Use lighter band or no band',
        alternativeExerciseIds: ['act_fire_hydrant'],
      },
    ],
    description:
      'A banded variation of fire hydrant for increased glute activation.',
    cues: [
      'Place band around thighs above knees',
      'Start on hands and knees',
      'Lift knee out against band resistance',
      'Control the return',
      'Keep hips square throughout',
    ],
    modifications: {
      easier: ['act_fire_hydrant'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '10 each side',
      restSeconds: 30,
    },
  },
  {
    id: 'act_plank',
    name: 'Plank',
    category: 'activation',
    musclesPrimary: ['core_front'],
    musclesSecondary: ['shoulders_front', 'glutes'],
    movementPattern: 'isometric',
    jointActions: [],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'wrist_injury',
        severity: 'relative',
        reason: 'Weight bearing through wrists',
        modification: 'Use forearm plank instead',
        alternativeExerciseIds: ['act_forearm_plank'],
      },
      {
        condition: 'shoulder_impingement',
        severity: 'relative',
        reason: 'Loaded shoulder position',
        modification: 'Use forearm plank instead',
        alternativeExerciseIds: ['act_forearm_plank'],
      },
    ],
    description:
      'A foundational core stability exercise holding a push-up position. Builds endurance in the entire core.',
    cues: [
      'Start in push-up position',
      'Hands under shoulders, body in straight line',
      'Engage core - do not let hips sag or pike',
      'Squeeze glutes, push away from floor',
      'Breathe steadily throughout',
    ],
    modifications: {
      easier: ['act_forearm_plank', 'act_incline_plank'],
      harder: ['act_plank_shoulder_tap'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '30 seconds',
      restSeconds: 45,
    },
  },
  {
    id: 'act_forearm_plank',
    name: 'Forearm Plank',
    category: 'activation',
    musclesPrimary: ['core_front'],
    musclesSecondary: ['shoulders_front', 'glutes'],
    movementPattern: 'isometric',
    jointActions: [],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [],
    description:
      'A plank variation on forearms. Easier on wrists while maintaining core challenge.',
    cues: [
      'Place forearms on floor, elbows under shoulders',
      'Extend legs back, on toes',
      'Body in straight line from head to heels',
      'Engage core and squeeze glutes',
      'Do not let hips sag or pike up',
    ],
    modifications: {
      easier: ['act_incline_plank'],
      harder: ['act_plank'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '30 seconds',
      restSeconds: 45,
    },
  },
  {
    id: 'act_incline_plank',
    name: 'Incline Plank',
    category: 'activation',
    musclesPrimary: ['core_front'],
    musclesSecondary: ['shoulders_front'],
    movementPattern: 'isometric',
    jointActions: [],
    equipmentRequired: ['box', 'bench_flat'],
    skillLevel: 'beginner',
    contraindications: [],
    description:
      'A plank with hands elevated on a surface. Reduces the load, making it more accessible for beginners.',
    cues: [
      'Place hands on elevated surface',
      'Walk feet back to plank position',
      'Body in straight line',
      'Keep core engaged throughout',
      'The higher the surface, the easier',
    ],
    modifications: {
      easier: [],
      harder: ['act_forearm_plank', 'act_plank'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '30 seconds',
      restSeconds: 30,
    },
  },
  {
    id: 'act_plank_shoulder_tap',
    name: 'Plank Shoulder Tap',
    category: 'activation',
    musclesPrimary: ['core_front', 'core_obliques'],
    musclesSecondary: ['shoulders_front', 'glutes'],
    movementPattern: 'anti_rotation',
    jointActions: [],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'wrist_injury',
        severity: 'relative',
        reason: 'Single arm support increases wrist load',
        modification: 'Use forearm plank without taps',
        alternativeExerciseIds: ['act_forearm_plank'],
      },
    ],
    description:
      'A plank variation adding shoulder taps for anti-rotation challenge. Increases core demands.',
    cues: [
      'Start in plank position with wide feet',
      'Lift one hand to tap opposite shoulder',
      'Minimize hip rotation - keep stable',
      'Return hand, repeat other side',
      'Move slowly and controlled',
    ],
    modifications: {
      easier: ['act_plank'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '10 taps each side',
      restSeconds: 45,
    },
  },
  {
    id: 'act_side_plank',
    name: 'Side Plank',
    category: 'activation',
    musclesPrimary: ['core_obliques'],
    musclesSecondary: ['glutes', 'shoulders_side'],
    movementPattern: 'isometric',
    jointActions: ['spinal_lateral_flexion'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'shoulder_impingement',
        severity: 'relative',
        reason: 'Loaded shoulder position',
        modification: 'Perform on forearm instead of hand',
      },
      {
        condition: 'wrist_injury',
        severity: 'relative',
        reason: 'Full body weight on single wrist',
        modification: 'Perform on forearm',
      },
    ],
    description:
      'A lateral core stability exercise. Targets the obliques and gluteus medius.',
    cues: [
      'Lie on side, prop up on elbow or hand',
      'Stack feet or stagger for stability',
      'Lift hips to form straight line',
      'Do not let hips sag toward floor',
      'Keep top shoulder stacked over bottom',
    ],
    modifications: {
      easier: ['act_side_plank_knee'],
      harder: ['act_side_plank_hip_dip'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '20 seconds each side',
      restSeconds: 30,
    },
  },
  {
    id: 'act_side_plank_knee',
    name: 'Side Plank from Knee',
    category: 'activation',
    musclesPrimary: ['core_obliques'],
    musclesSecondary: ['glutes'],
    movementPattern: 'isometric',
    jointActions: ['spinal_lateral_flexion'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Pressure on kneeling knee',
        modification: 'Use extra padding under knee',
      },
    ],
    description:
      'A modified side plank with bottom knee on floor. Makes the exercise more accessible while still training obliques.',
    cues: [
      'Lie on side, bottom knee bent 90 degrees',
      'Prop up on elbow',
      'Lift hips off floor',
      'Form straight line from knee to shoulder',
      'Hold with steady breathing',
    ],
    modifications: {
      easier: [],
      harder: ['act_side_plank'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '20 seconds each side',
      restSeconds: 30,
    },
  },
  {
    id: 'act_scapular_pushup',
    name: 'Scapular Push-Up',
    category: 'activation',
    musclesPrimary: ['upper_back'],
    musclesSecondary: ['shoulders_front'],
    movementPattern: 'push_horizontal',
    jointActions: ['shoulder_abduction', 'shoulder_adduction'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'wrist_injury',
        severity: 'relative',
        reason: 'Weight bearing through wrists',
        modification: 'Use fists or push-up handles',
      },
    ],
    description:
      'An exercise targeting serratus anterior and scapular control. Arms stay straight while shoulder blades move.',
    cues: [
      'Start in push-up position',
      'Keep arms straight throughout',
      'Let shoulder blades pinch together',
      'Push through hands to spread shoulder blades apart',
      'Only shoulder blades move - no elbow bend',
    ],
    modifications: {
      easier: ['act_wall_scapular_pushup'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '12',
      restSeconds: 30,
    },
  },
  {
    id: 'act_wall_scapular_pushup',
    name: 'Wall Scapular Push-Up',
    category: 'activation',
    musclesPrimary: ['upper_back'],
    musclesSecondary: ['shoulders_front'],
    movementPattern: 'push_horizontal',
    jointActions: ['shoulder_abduction', 'shoulder_adduction'],
    equipmentRequired: ['wall'],
    skillLevel: 'beginner',
    contraindications: [],
    description:
      'A wall version of scapular push-up. More accessible for learning scapular control.',
    cues: [
      'Stand facing wall, hands on wall at shoulder height',
      'Keep arms straight',
      'Let shoulder blades pinch together, body moves toward wall',
      'Push through hands to spread shoulder blades, body moves away',
      'Keep core engaged, body straight',
    ],
    modifications: {
      easier: [],
      harder: ['act_scapular_pushup'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '15',
      restSeconds: 30,
    },
  },
  {
    id: 'act_prone_y_raise',
    name: 'Prone Y Raise',
    category: 'activation',
    musclesPrimary: ['upper_back', 'shoulders_rear'],
    musclesSecondary: ['lower_back'],
    movementPattern: 'pull_vertical',
    jointActions: ['shoulder_flexion', 'shoulder_abduction'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'shoulder_impingement',
        severity: 'relative',
        reason: 'Overhead position may aggravate impingement',
        modification: 'Keep arms lower, reduce range of motion',
      },
    ],
    description:
      'A prone exercise targeting lower trapezius and rear deltoids. Counteracts rounded shoulder posture.',
    cues: [
      'Lie face down, arms extended overhead in Y shape',
      'Thumbs pointing up',
      'Lift arms off floor, squeezing shoulder blades',
      'Keep neck neutral, gaze at floor',
      'Lower with control',
    ],
    modifications: {
      easier: [],
      harder: ['act_prone_ytw'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '10',
      restSeconds: 30,
    },
  },
  {
    id: 'act_prone_ytw',
    name: 'Prone YTW',
    category: 'activation',
    musclesPrimary: ['upper_back', 'shoulders_rear'],
    musclesSecondary: ['lower_back'],
    movementPattern: 'pull_horizontal',
    jointActions: ['shoulder_flexion', 'shoulder_abduction', 'shoulder_extension'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'shoulder_impingement',
        severity: 'relative',
        reason: 'Various arm positions may aggravate impingement',
        modification: 'Keep range small, skip painful positions',
      },
    ],
    description:
      'A three-position shoulder activation exercise. Targets different parts of the upper back and rotator cuff.',
    cues: [
      'Lie face down',
      'Y: Arms overhead, thumbs up, lift and lower',
      'T: Arms out to sides, thumbs up, lift and lower',
      'W: Elbows bent, squeeze shoulder blades, lift and lower',
      'Complete all three positions as one set',
    ],
    modifications: {
      easier: ['act_prone_y_raise'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '8 of each position',
      restSeconds: 45,
    },
  },
  {
    id: 'act_band_pull_apart',
    name: 'Band Pull Apart',
    category: 'activation',
    musclesPrimary: ['shoulders_rear', 'upper_back'],
    musclesSecondary: [],
    movementPattern: 'pull_horizontal',
    jointActions: ['shoulder_extension', 'shoulder_abduction'],
    equipmentRequired: ['resistance_band'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'rotator_cuff_injury',
        severity: 'relative',
        reason: 'Resistance may stress healing rotator cuff',
        modification: 'Use very light band, limit range',
      },
    ],
    description:
      'A band exercise for rear deltoids and rhomboids. Excellent for posture correction and shoulder health.',
    cues: [
      'Hold band at shoulder width, arms extended in front',
      'Keep arms straight',
      'Pull band apart by squeezing shoulder blades together',
      'Bring band to chest level',
      'Control return to start',
    ],
    modifications: {
      easier: [],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '15',
      restSeconds: 30,
    },
  },
];

// ============================================================================
// STRENGTH EXERCISES (26 exercises)
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
  {
    id: 'stg_glute_bridge_march',
    name: 'Glute Bridge March',
    category: 'strength',
    musclesPrimary: ['glutes', 'core_front'],
    musclesSecondary: ['hamstrings'],
    movementPattern: 'hip_hinge',
    jointActions: ['hip_extension', 'hip_flexion'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'acute_lower_back_pain',
        severity: 'relative',
        reason: 'Dynamic hip movement may stress back',
        modification: 'Perform static bridge instead',
        alternativeExerciseIds: ['act_glute_bridge'],
      },
    ],
    description:
      'A glute bridge with alternating leg lifts. Challenges core stability while maintaining glute activation.',
    cues: [
      'Start in bridge position, hips lifted',
      'Keeping hips level, lift one knee toward chest',
      'Lower foot and repeat other side',
      'Do not let hips drop or rotate',
      'Maintain bridge height throughout',
    ],
    modifications: {
      easier: ['act_glute_bridge'],
      harder: ['act_single_leg_bridge'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '8 each side',
      restSeconds: 45,
    },
  },
  {
    id: 'stg_hip_thrust',
    name: 'Hip Thrust',
    category: 'strength',
    musclesPrimary: ['glutes'],
    musclesSecondary: ['hamstrings', 'core_front'],
    movementPattern: 'hip_hinge',
    jointActions: ['hip_extension'],
    equipmentRequired: ['bench_flat', 'box'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'acute_lower_back_pain',
        severity: 'relative',
        reason: 'Hip extension may aggravate back',
        modification: 'Use glute bridge from floor instead',
        alternativeExerciseIds: ['act_glute_bridge'],
      },
    ],
    description:
      'A powerful glute exercise with upper back supported on bench. Allows greater range of motion than floor bridge.',
    cues: [
      'Sit on floor with upper back against bench',
      'Feet flat, about hip-width apart',
      'Drive through heels to lift hips',
      'Squeeze glutes hard at top',
      'Lower with control',
    ],
    modifications: {
      easier: ['act_glute_bridge'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '12',
      restSeconds: 60,
    },
  },
  {
    id: 'stg_romanian_deadlift_bodyweight',
    name: 'Bodyweight Romanian Deadlift',
    category: 'strength',
    musclesPrimary: ['hamstrings', 'glutes'],
    musclesSecondary: ['lower_back', 'core_front'],
    movementPattern: 'hip_hinge',
    jointActions: ['hip_flexion', 'hip_extension'],
    equipmentRequired: ['none'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'disc_herniation',
        severity: 'relative',
        reason: 'Hip hinge stresses lower back',
        modification: 'Keep range small, focus on hip hinge not back rounding',
        alternativeExerciseIds: ['act_glute_bridge'],
      },
    ],
    description:
      'A bodyweight hip hinge exercise teaching proper RDL mechanics. Builds posterior chain strength and mobility.',
    cues: [
      'Stand tall, feet hip-width apart',
      'Soften knees slightly, keep them fixed',
      'Hinge at hips, pushing butt back',
      'Keep back flat, chest proud',
      'Feel stretch in hamstrings, drive hips forward to stand',
    ],
    modifications: {
      easier: [],
      harder: ['stg_single_leg_rdl'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '12',
      restSeconds: 45,
    },
  },
  {
    id: 'stg_single_leg_rdl',
    name: 'Single Leg Romanian Deadlift',
    category: 'strength',
    musclesPrimary: ['hamstrings', 'glutes'],
    musclesSecondary: ['lower_back', 'core_front', 'calves'],
    movementPattern: 'hip_hinge',
    jointActions: ['hip_flexion', 'hip_extension'],
    equipmentRequired: ['none'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'balance_issues',
        severity: 'relative',
        reason: 'Significant balance demands',
        modification: 'Hold wall or chair for balance',
      },
      {
        condition: 'acute_lower_back_pain',
        severity: 'relative',
        reason: 'Unilateral loading increases back stress',
        modification: 'Use bilateral version instead',
        alternativeExerciseIds: ['stg_romanian_deadlift_bodyweight'],
      },
    ],
    description:
      'A unilateral hip hinge building balance, stability, and posterior chain strength. Corrects imbalances.',
    cues: [
      'Stand on one leg, slight knee bend',
      'Hinge at hip, extending other leg behind',
      'Keep back flat, body in straight line',
      'Go until you feel hamstring stretch',
      'Drive hips forward to return to standing',
    ],
    modifications: {
      easier: ['stg_romanian_deadlift_bodyweight'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '8 each side',
      restSeconds: 60,
    },
  },
  {
    id: 'stg_step_up',
    name: 'Step Up',
    category: 'strength',
    musclesPrimary: ['quads', 'glutes'],
    musclesSecondary: ['hamstrings', 'calves'],
    movementPattern: 'lunge',
    jointActions: ['hip_flexion', 'hip_extension', 'knee_flexion', 'knee_extension'],
    equipmentRequired: ['box', 'bench_flat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Single leg loading on knee',
        modification: 'Use lower step, limit knee bend',
      },
      {
        condition: 'balance_issues',
        severity: 'relative',
        reason: 'Single leg balance required',
        modification: 'Hold wall or use lower step',
      },
    ],
    description:
      'A functional single-leg exercise stepping onto a raised surface. Builds leg strength and balance.',
    cues: [
      'Stand facing box or step',
      'Place entire foot on box',
      'Drive through heel to step up',
      'Stand tall at top, do not use momentum',
      'Lower with control, same leg',
    ],
    modifications: {
      easier: [],
      harder: ['stg_lateral_step_up'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '10 each side',
      restSeconds: 60,
    },
  },
  {
    id: 'stg_lateral_step_up',
    name: 'Lateral Step Up',
    category: 'strength',
    musclesPrimary: ['quads', 'glutes', 'abductors'],
    musclesSecondary: ['adductors', 'calves'],
    movementPattern: 'lateral',
    jointActions: ['hip_abduction', 'knee_extension'],
    equipmentRequired: ['box', 'bench_flat'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Lateral loading stresses knee',
        modification: 'Use lower step, avoid if painful',
      },
    ],
    description:
      'A step up performed laterally. Emphasizes gluteus medius and frontal plane stability.',
    cues: [
      'Stand sideways to box',
      'Place closest foot on box',
      'Drive through heel to step up',
      'Stand tall at top',
      'Lower with control, stay on same side',
    ],
    modifications: {
      easier: ['stg_step_up'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '8 each side',
      restSeconds: 60,
    },
  },
  {
    id: 'stg_calf_raise',
    name: 'Calf Raise',
    category: 'strength',
    musclesPrimary: ['calves'],
    musclesSecondary: [],
    movementPattern: 'extension',
    jointActions: ['ankle_plantarflexion'],
    equipmentRequired: ['none'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'achilles_tendinopathy',
        severity: 'relative',
        reason: 'Loading the calf/Achilles',
        modification: 'Reduce range, avoid eccentric emphasis',
      },
    ],
    description:
      'A basic calf strengthening exercise. Can be performed anywhere without equipment.',
    cues: [
      'Stand with feet hip-width apart',
      'Rise onto balls of feet',
      'Squeeze calves at top',
      'Lower with control',
      'Keep weight even across all toes',
    ],
    modifications: {
      easier: [],
      harder: ['stg_single_leg_calf_raise'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '15',
      restSeconds: 45,
    },
  },
  {
    id: 'stg_single_leg_calf_raise',
    name: 'Single Leg Calf Raise',
    category: 'strength',
    musclesPrimary: ['calves'],
    musclesSecondary: [],
    movementPattern: 'extension',
    jointActions: ['ankle_plantarflexion'],
    equipmentRequired: ['wall'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'achilles_tendinopathy',
        severity: 'relative',
        reason: 'Increased load on single leg',
        modification: 'Use bilateral version instead',
        alternativeExerciseIds: ['stg_calf_raise'],
      },
      {
        condition: 'balance_issues',
        severity: 'relative',
        reason: 'Single leg balance required',
        modification: 'Hold wall for support',
      },
    ],
    description:
      'A single-leg calf raise for increased intensity. Important for running and jumping activities.',
    cues: [
      'Stand on one leg (hold wall for balance)',
      'Rise onto ball of foot',
      'Lower slowly, below step level if on edge',
      'Complete all reps on one side before switching',
      'Control the lowering phase',
    ],
    modifications: {
      easier: ['stg_calf_raise'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '12 each side',
      restSeconds: 45,
    },
  },
  {
    id: 'stg_wall_sit',
    name: 'Wall Sit',
    category: 'strength',
    musclesPrimary: ['quads'],
    musclesSecondary: ['glutes', 'calves'],
    movementPattern: 'isometric',
    jointActions: ['knee_flexion', 'hip_flexion'],
    equipmentRequired: ['wall'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'patellofemoral_syndrome',
        severity: 'relative',
        reason: 'Static quad loading may aggravate knee cap pain',
        modification: 'Use higher position (less knee bend)',
      },
    ],
    description:
      'An isometric quad exercise holding a seated position against a wall. Builds endurance and quad strength.',
    cues: [
      'Stand with back against wall',
      'Slide down until thighs are parallel to floor',
      'Keep knees over ankles, not past toes',
      'Press back flat against wall',
      'Hold position, breathe steadily',
    ],
    modifications: {
      easier: [],
      harder: ['stg_single_leg_wall_sit'],
    },
    defaultPrescription: {
      sets: 3,
      reps: '30 seconds',
      restSeconds: 60,
    },
  },
  {
    id: 'stg_single_leg_wall_sit',
    name: 'Single Leg Wall Sit',
    category: 'strength',
    musclesPrimary: ['quads'],
    musclesSecondary: ['glutes', 'core_front'],
    movementPattern: 'isometric',
    jointActions: ['knee_flexion', 'hip_flexion'],
    equipmentRequired: ['wall'],
    skillLevel: 'advanced',
    contraindications: [
      {
        condition: 'patellofemoral_syndrome',
        severity: 'absolute',
        reason: 'Extreme quad loading will aggravate knee cap',
        alternativeExerciseIds: ['stg_wall_sit'],
      },
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'High load on single knee',
        modification: 'Use bilateral version instead',
        alternativeExerciseIds: ['stg_wall_sit'],
      },
    ],
    description:
      'An advanced wall sit on one leg. Significantly increases quad activation and identifies imbalances.',
    cues: [
      'Start in wall sit position',
      'Extend one leg straight out',
      'Keep supporting knee at 90 degrees',
      'Press back flat against wall',
      'Switch legs for equal time',
    ],
    modifications: {
      easier: ['stg_wall_sit'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '15 seconds each side',
      restSeconds: 60,
    },
  },
  {
    id: 'stg_squat_hold',
    name: 'Squat Hold',
    category: 'strength',
    musclesPrimary: ['quads', 'glutes'],
    musclesSecondary: ['core_front', 'calves'],
    movementPattern: 'isometric',
    jointActions: ['knee_flexion', 'hip_flexion'],
    equipmentRequired: ['none'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Sustained knee flexion',
        modification: 'Use higher position (less depth)',
      },
    ],
    description:
      'An isometric squat hold building endurance and time under tension. Great for building squat strength.',
    cues: [
      'Lower into squat position',
      'Hold at parallel or above',
      'Keep chest up, weight in heels',
      'Maintain good squat form throughout',
      'Breathe steadily',
    ],
    modifications: {
      easier: ['stg_wall_sit'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '20 seconds',
      restSeconds: 60,
    },
  },
  {
    id: 'stg_tempo_squat',
    name: 'Tempo Squat',
    category: 'strength',
    musclesPrimary: ['quads', 'glutes'],
    musclesSecondary: ['hamstrings', 'core_front'],
    movementPattern: 'squat',
    jointActions: ['hip_flexion', 'hip_extension', 'knee_flexion', 'knee_extension'],
    equipmentRequired: ['none'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Extended time under tension stresses knee',
        modification: 'Use faster tempo, limit depth',
      },
    ],
    description:
      'A squat with controlled tempo (3 seconds down, 3 seconds up). Increases time under tension and control.',
    cues: [
      'Stand with feet shoulder-width apart',
      'Lower for 3 slow counts',
      'Brief pause at bottom',
      'Rise for 3 slow counts',
      'Maintain perfect form throughout',
    ],
    modifications: {
      easier: ['stg_bodyweight_squat'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '8',
      restSeconds: 90,
    },
  },
  {
    id: 'stg_superman',
    name: 'Superman',
    category: 'strength',
    musclesPrimary: ['lower_back'],
    musclesSecondary: ['glutes', 'hamstrings', 'upper_back'],
    movementPattern: 'extension',
    jointActions: ['spinal_extension', 'hip_extension', 'shoulder_flexion'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'disc_herniation',
        severity: 'relative',
        reason: 'Spinal extension may stress disc',
        modification: 'Limit range of motion, keep movements small',
        alternativeExerciseIds: ['act_bird_dog'],
      },
      {
        condition: 'acute_lower_back_pain',
        severity: 'relative',
        reason: 'Extension may aggravate pain',
        modification: 'Lift only legs or only arms',
      },
    ],
    description:
      'A prone back extension exercise lifting arms and legs simultaneously. Strengthens the posterior chain.',
    cues: [
      'Lie face down, arms extended overhead',
      'Simultaneously lift arms and legs off floor',
      'Squeeze glutes and back muscles',
      'Hold briefly at top',
      'Lower with control',
    ],
    modifications: {
      easier: ['act_bird_dog'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '10',
      restSeconds: 45,
    },
  },
  {
    id: 'stg_superman_hold',
    name: 'Superman Hold',
    category: 'strength',
    musclesPrimary: ['lower_back'],
    musclesSecondary: ['glutes', 'hamstrings', 'upper_back'],
    movementPattern: 'isometric',
    jointActions: ['spinal_extension', 'hip_extension', 'shoulder_flexion'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'disc_herniation',
        severity: 'relative',
        reason: 'Sustained spinal extension stresses disc',
        modification: 'Reduce hold time, keep position lower',
        alternativeExerciseIds: ['act_bird_dog_hold'],
      },
      {
        condition: 'acute_lower_back_pain',
        severity: 'absolute',
        reason: 'Extended time in extension will increase pain',
        alternativeExerciseIds: ['act_bird_dog_hold'],
      },
    ],
    description:
      'An isometric superman hold building endurance in the back extensors and posterior chain.',
    cues: [
      'Lift into superman position',
      'Hold at top with arms and legs elevated',
      'Keep breathing - do not hold breath',
      'Maintain squeeze in glutes and back',
      'Lower after time is complete',
    ],
    modifications: {
      easier: ['stg_superman', 'act_bird_dog_hold'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '15 seconds',
      restSeconds: 45,
    },
  },
  {
    id: 'stg_diamond_pushup',
    name: 'Diamond Push-Up',
    category: 'strength',
    musclesPrimary: ['triceps', 'chest'],
    musclesSecondary: ['shoulders_front', 'core_front'],
    movementPattern: 'push_horizontal',
    jointActions: ['elbow_extension', 'shoulder_flexion'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'wrist_injury',
        severity: 'relative',
        reason: 'Hand position may stress wrists',
        modification: 'Use wider hand position',
        alternativeExerciseIds: ['stg_pushup'],
      },
      {
        condition: 'elbow_injury',
        severity: 'relative',
        reason: 'Emphasis on elbow extension',
        modification: 'Use standard push-up instead',
        alternativeExerciseIds: ['stg_pushup'],
      },
    ],
    description:
      'A push-up with hands close together forming a diamond. Emphasizes triceps activation.',
    cues: [
      'Place hands together, fingers forming diamond shape',
      'Position hands under chest',
      'Lower chest toward hands',
      'Elbows stay close to body',
      'Push back up to start',
    ],
    modifications: {
      easier: ['stg_pushup'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '8',
      restSeconds: 60,
    },
  },
  {
    id: 'stg_wide_pushup',
    name: 'Wide Push-Up',
    category: 'strength',
    musclesPrimary: ['chest'],
    musclesSecondary: ['triceps', 'shoulders_front'],
    movementPattern: 'push_horizontal',
    jointActions: ['shoulder_flexion', 'elbow_extension'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'intermediate',
    contraindications: [
      {
        condition: 'shoulder_impingement',
        severity: 'relative',
        reason: 'Wide position increases shoulder strain',
        modification: 'Bring hands closer together',
        alternativeExerciseIds: ['stg_pushup'],
      },
    ],
    description:
      'A push-up with hands wider than shoulder width. Emphasizes chest activation.',
    cues: [
      'Place hands wider than shoulders',
      'Keep fingers pointing forward or slightly out',
      'Lower chest toward floor',
      'Keep core tight, body in line',
      'Push back to start',
    ],
    modifications: {
      easier: ['stg_pushup'],
      harder: [],
    },
    defaultPrescription: {
      sets: 3,
      reps: '10',
      restSeconds: 60,
    },
  },
];

// ============================================================================
// RECOVERY EXERCISES (22 exercises)
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
  {
    id: 'rec_foam_roll_calves',
    name: 'Foam Roll Calves',
    category: 'recovery',
    musclesPrimary: ['calves'],
    musclesSecondary: [],
    movementPattern: 'isometric',
    jointActions: [],
    equipmentRequired: ['foam_roller'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'blood_clot_risk',
        severity: 'absolute',
        reason: 'Compression may dislodge clots',
      },
      {
        condition: 'achilles_tendinopathy',
        severity: 'relative',
        reason: 'Direct pressure on tendon',
        modification: 'Avoid rolling directly on Achilles, focus on muscle belly',
      },
    ],
    description:
      'Foam rolling for calf muscles. Helps release tension and improve ankle mobility.',
    cues: [
      'Sit with one calf on roller',
      'Cross other leg on top for more pressure',
      'Roll from ankle to below knee',
      'Rotate leg in and out to hit different areas',
      'Pause on tender spots',
    ],
    modifications: {
      easier: [],
      harder: [],
    },
    defaultPrescription: {
      sets: 1,
      reps: '45 seconds each leg',
      restSeconds: 15,
    },
  },
  {
    id: 'rec_foam_roll_hamstrings',
    name: 'Foam Roll Hamstrings',
    category: 'recovery',
    musclesPrimary: ['hamstrings'],
    musclesSecondary: [],
    movementPattern: 'isometric',
    jointActions: [],
    equipmentRequired: ['foam_roller'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'blood_clot_risk',
        severity: 'absolute',
        reason: 'Compression may dislodge clots',
      },
      {
        condition: 'sciatic_nerve_irritation',
        severity: 'relative',
        reason: 'Pressure may aggravate nerve',
        modification: 'Avoid direct pressure on back of thigh center',
      },
    ],
    description:
      'Foam rolling for hamstring muscles. Helps release tension from sitting and exercise.',
    cues: [
      'Sit with one or both hamstrings on roller',
      'Support yourself with hands behind',
      'Roll from just above knee to below glutes',
      'Rotate leg to target different areas',
      'Pause on tender spots',
    ],
    modifications: {
      easier: [],
      harder: [],
    },
    defaultPrescription: {
      sets: 1,
      reps: '60 seconds each leg',
      restSeconds: 15,
    },
  },
  {
    id: 'rec_foam_roll_lats',
    name: 'Foam Roll Lats',
    category: 'recovery',
    musclesPrimary: ['lats'],
    musclesSecondary: ['upper_back'],
    movementPattern: 'isometric',
    jointActions: [],
    equipmentRequired: ['foam_roller'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'acute_rib_injury',
        severity: 'absolute',
        reason: 'Rolling near ribs may aggravate injury',
      },
    ],
    description:
      'Foam rolling for the latissimus dorsi. Helps improve overhead mobility and reduce upper body tension.',
    cues: [
      'Lie on side with roller under armpit/lat area',
      'Extend arm overhead on floor',
      'Roll from armpit to mid-back',
      'Move slowly and pause on tight spots',
      'Keep core engaged for control',
    ],
    modifications: {
      easier: [],
      harder: [],
    },
    defaultPrescription: {
      sets: 1,
      reps: '45 seconds each side',
      restSeconds: 15,
    },
  },
  {
    id: 'rec_lacrosse_ball_foot',
    name: 'Lacrosse Ball Foot Release',
    category: 'recovery',
    musclesPrimary: ['calves'],
    musclesSecondary: [],
    movementPattern: 'isometric',
    jointActions: [],
    equipmentRequired: ['lacrosse_ball'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'plantar_fasciitis',
        severity: 'relative',
        reason: 'Direct pressure may be too intense',
        modification: 'Use softer ball or reduce pressure',
      },
    ],
    description:
      'Self-massage for the plantar fascia and foot muscles. Helps with foot pain and tightness.',
    cues: [
      'Stand or sit with ball under foot',
      'Roll from heel to toes',
      'Apply comfortable pressure',
      'Pause on tender spots',
      'Cover entire bottom of foot',
    ],
    modifications: {
      easier: [],
      harder: [],
    },
    defaultPrescription: {
      sets: 1,
      reps: '60 seconds each foot',
      restSeconds: 15,
    },
  },
  {
    id: 'rec_lacrosse_ball_pec',
    name: 'Lacrosse Ball Pec Release',
    category: 'recovery',
    musclesPrimary: ['chest'],
    musclesSecondary: ['shoulders_front'],
    movementPattern: 'isometric',
    jointActions: [],
    equipmentRequired: ['lacrosse_ball', 'wall'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'shoulder_dislocation_history',
        severity: 'relative',
        reason: 'Pressure near shoulder joint',
        modification: 'Keep ball away from shoulder, focus on mid-chest',
      },
    ],
    description:
      'Targeted pec release using a ball against a wall. Helps counteract rounded shoulder posture.',
    cues: [
      'Stand facing wall, place ball on chest/front shoulder',
      'Lean into wall, applying pressure',
      'Find tender spots and hold',
      'Move arm slowly while maintaining pressure',
      'Breathe and try to relax muscle',
    ],
    modifications: {
      easier: [],
      harder: [],
    },
    defaultPrescription: {
      sets: 1,
      reps: '60 seconds each side',
      restSeconds: 15,
    },
  },
  {
    id: 'rec_lacrosse_ball_upper_trap',
    name: 'Lacrosse Ball Upper Trap Release',
    category: 'recovery',
    musclesPrimary: ['neck'],
    musclesSecondary: ['upper_back'],
    movementPattern: 'isometric',
    jointActions: [],
    equipmentRequired: ['lacrosse_ball', 'wall'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'cervical_disc_herniation',
        severity: 'relative',
        reason: 'Pressure near spine',
        modification: 'Keep ball on muscle belly only, avoid spine',
      },
    ],
    description:
      'Targeted upper trapezius release. Addresses common area of tension from stress and desk work.',
    cues: [
      'Stand with back to wall',
      'Place ball between upper trap and wall',
      'Find tender spot and apply pressure',
      'Slowly nod head or roll ball slightly',
      'Breathe deeply and let muscle release',
    ],
    modifications: {
      easier: [],
      harder: [],
    },
    defaultPrescription: {
      sets: 1,
      reps: '60 seconds each side',
      restSeconds: 15,
    },
  },
  {
    id: 'rec_4_7_8_breathing',
    name: '4-7-8 Breathing',
    category: 'recovery',
    musclesPrimary: ['core_front'],
    musclesSecondary: [],
    movementPattern: 'isometric',
    jointActions: [],
    equipmentRequired: ['none'],
    skillLevel: 'beginner',
    contraindications: [],
    description:
      'A relaxing breath pattern with extended exhale. Activates parasympathetic nervous system for recovery.',
    cues: [
      'Inhale through nose for 4 counts',
      'Hold breath for 7 counts',
      'Exhale slowly through mouth for 8 counts',
      'Keep the ratio consistent',
      'Start with 2-4 cycles and increase gradually',
    ],
    modifications: {
      easier: ['rec_diaphragmatic_breathing'],
      harder: [],
    },
    defaultPrescription: {
      sets: 1,
      reps: '4 cycles',
      restSeconds: 0,
    },
  },
  {
    id: 'rec_crocodile_breathing',
    name: 'Crocodile Breathing',
    category: 'recovery',
    musclesPrimary: ['core_front'],
    musclesSecondary: ['lower_back'],
    movementPattern: 'isometric',
    jointActions: [],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [],
    description:
      'A prone breathing exercise that teaches proper diaphragmatic breathing. Helps establish belly breathing pattern.',
    cues: [
      'Lie face down, forehead on stacked hands',
      'Breathe into belly, feeling it press into floor',
      'Also feel sides expand (360 breathing)',
      'Exhale fully, belly draws in',
      'Breathe slowly and deeply',
    ],
    modifications: {
      easier: [],
      harder: [],
    },
    defaultPrescription: {
      sets: 1,
      reps: '10 breaths',
      restSeconds: 0,
    },
  },
  {
    id: 'rec_supine_twist',
    name: 'Supine Spinal Twist',
    category: 'recovery',
    musclesPrimary: ['lower_back', 'core_obliques'],
    musclesSecondary: ['glutes', 'chest'],
    movementPattern: 'rotation',
    jointActions: ['spinal_rotation'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'disc_herniation',
        severity: 'relative',
        reason: 'Spinal rotation may stress disc',
        modification: 'Keep knees higher, reduce rotation',
      },
    ],
    description:
      'A gentle lying twist to release the lower back and stretch the obliques. A classic cool-down pose.',
    cues: [
      'Lie on back, arms out in T position',
      'Bring knees to chest',
      'Lower knees to one side',
      'Keep shoulders on floor',
      'Turn head opposite direction from knees',
    ],
    modifications: {
      easier: [],
      harder: [],
    },
    defaultPrescription: {
      sets: 1,
      reps: '45 seconds each side',
      restSeconds: 0,
    },
  },
  {
    id: 'rec_happy_baby',
    name: 'Happy Baby Pose',
    category: 'recovery',
    musclesPrimary: ['hip_flexors', 'adductors'],
    musclesSecondary: ['lower_back', 'glutes'],
    movementPattern: 'flexion',
    jointActions: ['hip_flexion', 'hip_abduction', 'hip_external_rotation'],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'knee_injury',
        severity: 'relative',
        reason: 'Deep knee flexion in position',
        modification: 'Hold behind thighs instead of feet',
      },
    ],
    description:
      'A restorative yoga pose that opens the hips and releases the lower back. Named for how babies often lie.',
    cues: [
      'Lie on back, grab outside edges of feet',
      'Open knees wide, toward armpits',
      'Pull feet toward floor beside you',
      'Keep lower back pressed into mat',
      'Gently rock side to side if desired',
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
  {
    id: 'rec_legs_up_wall',
    name: 'Legs Up the Wall',
    category: 'recovery',
    musclesPrimary: ['hamstrings'],
    musclesSecondary: ['calves', 'lower_back'],
    movementPattern: 'isometric',
    jointActions: ['hip_flexion'],
    equipmentRequired: ['wall', 'yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'glaucoma',
        severity: 'absolute',
        reason: 'Inverted position increases eye pressure',
      },
      {
        condition: 'uncontrolled_hypertension',
        severity: 'relative',
        reason: 'Blood flow to head increases',
        modification: 'Keep hips further from wall, use pillow under hips',
      },
    ],
    description:
      'A restorative pose with legs elevated against wall. Promotes circulation and relaxation.',
    cues: [
      'Sit sideways next to wall',
      'Swing legs up wall as you lie back',
      'Scoot hips close to or touching wall',
      'Let arms rest by sides',
      'Breathe deeply and relax completely',
    ],
    modifications: {
      easier: [],
      harder: [],
    },
    defaultPrescription: {
      sets: 1,
      reps: '3 minutes',
      restSeconds: 0,
    },
  },
  {
    id: 'rec_corpse_pose',
    name: 'Corpse Pose (Savasana)',
    category: 'recovery',
    musclesPrimary: ['core_front'],
    musclesSecondary: [],
    movementPattern: 'isometric',
    jointActions: [],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [],
    description:
      'A complete relaxation pose lying flat. The final resting pose for any movement session.',
    cues: [
      'Lie on back with legs extended',
      'Let feet fall open naturally',
      'Arms by sides, palms up',
      'Close eyes and relax every muscle',
      'Breathe naturally, let go completely',
    ],
    modifications: {
      easier: [],
      harder: [],
    },
    defaultPrescription: {
      sets: 1,
      reps: '2-5 minutes',
      restSeconds: 0,
    },
  },
  {
    id: 'rec_progressive_relaxation',
    name: 'Progressive Muscle Relaxation',
    category: 'recovery',
    musclesPrimary: ['core_front'],
    musclesSecondary: [],
    movementPattern: 'isometric',
    jointActions: [],
    equipmentRequired: ['yoga_mat'],
    skillLevel: 'beginner',
    contraindications: [],
    description:
      'A relaxation technique tensing and releasing muscle groups systematically. Reduces overall muscle tension.',
    cues: [
      'Lie in comfortable position',
      'Start at feet - tense muscles for 5 seconds',
      'Release and notice relaxation',
      'Move up body: calves, thighs, glutes, core, etc.',
      'End with face muscles, then relax entire body',
    ],
    modifications: {
      easier: [],
      harder: [],
    },
    defaultPrescription: {
      sets: 1,
      reps: '10 minutes',
      restSeconds: 0,
    },
  },
  {
    id: 'rec_neck_stretches',
    name: 'Gentle Neck Stretches',
    category: 'recovery',
    musclesPrimary: ['neck'],
    musclesSecondary: [],
    movementPattern: 'flexion',
    jointActions: ['spinal_flexion', 'spinal_lateral_flexion', 'spinal_rotation'],
    equipmentRequired: ['none'],
    skillLevel: 'beginner',
    contraindications: [
      {
        condition: 'cervical_disc_herniation',
        severity: 'relative',
        reason: 'Neck movements may aggravate disc',
        modification: 'Move very slowly, avoid full range',
      },
    ],
    description:
      'A series of gentle neck stretches in all directions. Relieves tension from desk work and stress.',
    cues: [
      'Drop chin to chest, hold 15 seconds',
      'Tilt ear to shoulder each side, hold 15 seconds',
      'Turn to look over each shoulder, hold 15 seconds',
      'Move slowly between positions',
      'Never force or push into pain',
    ],
    modifications: {
      easier: [],
      harder: [],
    },
    defaultPrescription: {
      sets: 1,
      reps: '1 full cycle',
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
