/**
 * Body Region Constants
 * Complete list of anatomical regions for body mapping
 */

import type { BodyRegion } from '../types/body';

/**
 * All 34 body regions
 */
export const BODY_REGIONS: readonly BodyRegion[] = [
  'head',
  'neck',
  'shoulder_left',
  'shoulder_right',
  'upper_back',
  'lower_back',
  'chest',
  'core',
  'hip_left',
  'hip_right',
  'glute_left',
  'glute_right',
  'upper_arm_left',
  'upper_arm_right',
  'elbow_left',
  'elbow_right',
  'forearm_left',
  'forearm_right',
  'wrist_left',
  'wrist_right',
  'hand_left',
  'hand_right',
  'thigh_front_left',
  'thigh_front_right',
  'thigh_back_left',
  'thigh_back_right',
  'knee_left',
  'knee_right',
  'calf_left',
  'calf_right',
  'ankle_left',
  'ankle_right',
  'foot_left',
  'foot_right',
] as const;

/**
 * Display names for body regions
 */
export const BODY_REGION_LABELS: Record<BodyRegion, string> = {
  head: 'Head',
  neck: 'Neck',
  shoulder_left: 'Left Shoulder',
  shoulder_right: 'Right Shoulder',
  upper_back: 'Upper Back',
  lower_back: 'Lower Back',
  chest: 'Chest',
  core: 'Core/Abdomen',
  hip_left: 'Left Hip',
  hip_right: 'Right Hip',
  glute_left: 'Left Glute',
  glute_right: 'Right Glute',
  upper_arm_left: 'Left Upper Arm',
  upper_arm_right: 'Right Upper Arm',
  elbow_left: 'Left Elbow',
  elbow_right: 'Right Elbow',
  forearm_left: 'Left Forearm',
  forearm_right: 'Right Forearm',
  wrist_left: 'Left Wrist',
  wrist_right: 'Right Wrist',
  hand_left: 'Left Hand',
  hand_right: 'Right Hand',
  thigh_front_left: 'Left Quad',
  thigh_front_right: 'Right Quad',
  thigh_back_left: 'Left Hamstring',
  thigh_back_right: 'Right Hamstring',
  knee_left: 'Left Knee',
  knee_right: 'Right Knee',
  calf_left: 'Left Calf',
  calf_right: 'Right Calf',
  ankle_left: 'Left Ankle',
  ankle_right: 'Right Ankle',
  foot_left: 'Left Foot',
  foot_right: 'Right Foot',
};

/**
 * Group body regions by major body part
 */
export const BODY_REGION_GROUPS: Record<string, readonly BodyRegion[]> = {
  head_neck: ['head', 'neck'],
  shoulders: ['shoulder_left', 'shoulder_right'],
  back: ['upper_back', 'lower_back'],
  torso: ['chest', 'core'],
  hips: ['hip_left', 'hip_right', 'glute_left', 'glute_right'],
  arms: [
    'upper_arm_left', 'upper_arm_right',
    'elbow_left', 'elbow_right',
    'forearm_left', 'forearm_right',
    'wrist_left', 'wrist_right',
    'hand_left', 'hand_right',
  ],
  legs: [
    'thigh_front_left', 'thigh_front_right',
    'thigh_back_left', 'thigh_back_right',
    'knee_left', 'knee_right',
    'calf_left', 'calf_right',
    'ankle_left', 'ankle_right',
    'foot_left', 'foot_right',
  ],
} as const;

/**
 * Map body regions to relevant muscle groups
 */
export const BODY_REGION_TO_MUSCLES: Record<BodyRegion, string[]> = {
  head: ['neck'],
  neck: ['neck'],
  shoulder_left: ['shoulders_front', 'shoulders_side', 'shoulders_rear'],
  shoulder_right: ['shoulders_front', 'shoulders_side', 'shoulders_rear'],
  upper_back: ['upper_back', 'lats', 'shoulders_rear'],
  lower_back: ['lower_back'],
  chest: ['chest'],
  core: ['core_front', 'core_obliques'],
  hip_left: ['hip_flexors', 'glutes'],
  hip_right: ['hip_flexors', 'glutes'],
  glute_left: ['glutes'],
  glute_right: ['glutes'],
  upper_arm_left: ['biceps', 'triceps'],
  upper_arm_right: ['biceps', 'triceps'],
  elbow_left: ['biceps', 'triceps', 'forearms'],
  elbow_right: ['biceps', 'triceps', 'forearms'],
  forearm_left: ['forearms'],
  forearm_right: ['forearms'],
  wrist_left: ['forearms'],
  wrist_right: ['forearms'],
  hand_left: ['forearms'],
  hand_right: ['forearms'],
  thigh_front_left: ['quads'],
  thigh_front_right: ['quads'],
  thigh_back_left: ['hamstrings'],
  thigh_back_right: ['hamstrings'],
  knee_left: ['quads', 'hamstrings'],
  knee_right: ['quads', 'hamstrings'],
  calf_left: ['calves'],
  calf_right: ['calves'],
  ankle_left: ['calves'],
  ankle_right: ['calves'],
  foot_left: ['calves'],
  foot_right: ['calves'],
};

/**
 * Bilateral region pairs (for when injury affects one side)
 */
export const BILATERAL_PAIRS: Record<BodyRegion, BodyRegion | null> = {
  head: null,
  neck: null,
  shoulder_left: 'shoulder_right',
  shoulder_right: 'shoulder_left',
  upper_back: null,
  lower_back: null,
  chest: null,
  core: null,
  hip_left: 'hip_right',
  hip_right: 'hip_left',
  glute_left: 'glute_right',
  glute_right: 'glute_left',
  upper_arm_left: 'upper_arm_right',
  upper_arm_right: 'upper_arm_left',
  elbow_left: 'elbow_right',
  elbow_right: 'elbow_left',
  forearm_left: 'forearm_right',
  forearm_right: 'forearm_left',
  wrist_left: 'wrist_right',
  wrist_right: 'wrist_left',
  hand_left: 'hand_right',
  hand_right: 'hand_left',
  thigh_front_left: 'thigh_front_right',
  thigh_front_right: 'thigh_front_left',
  thigh_back_left: 'thigh_back_right',
  thigh_back_right: 'thigh_back_left',
  knee_left: 'knee_right',
  knee_right: 'knee_left',
  calf_left: 'calf_right',
  calf_right: 'calf_left',
  ankle_left: 'ankle_right',
  ankle_right: 'ankle_left',
  foot_left: 'foot_right',
  foot_right: 'foot_left',
};
