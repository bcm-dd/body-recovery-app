/**
 * BodyRegion component
 *
 * Individual tappable region on the body map.
 * Handles press events and displays pain level color coding.
 */

import { useCallback } from 'react';
import { Path, G } from 'react-native-svg';

import { palette } from '../../theme/tokens';

/**
 * Pain severity levels
 */
export type PainLevel = 'none' | 'mild' | 'moderate' | 'severe';

/**
 * Body region identifiers - 34 regions for comprehensive body mapping
 */
export type BodyRegionId =
  // Head and neck
  | 'head'
  | 'neck'
  // Shoulders and arms (left/right)
  | 'shoulder_left'
  | 'shoulder_right'
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
  // Torso
  | 'chest'
  | 'upper_back'
  | 'mid_back'
  | 'lower_back'
  | 'abdomen'
  // Hips and pelvis
  | 'hip_left'
  | 'hip_right'
  | 'glute_left'
  | 'glute_right'
  // Legs (left/right)
  | 'thigh_left'
  | 'thigh_right'
  | 'knee_left'
  | 'knee_right'
  | 'calf_left'
  | 'calf_right'
  | 'shin_left'
  | 'shin_right'
  | 'ankle_left'
  | 'ankle_right'
  | 'foot_left'
  | 'foot_right';

/**
 * Pain level to color mapping
 */
export function getPainColor(level: PainLevel): string {
  switch (level) {
    case 'none':
      return palette.painNone;
    case 'mild':
      return palette.painMild;
    case 'moderate':
      return palette.painModerate;
    case 'severe':
      return palette.painSevere;
    default:
      return palette.gray600;
  }
}

/**
 * Default fill color for inactive regions
 */
const DEFAULT_FILL = palette.gray600;
const DEFAULT_STROKE = palette.gray700;
const HIGHLIGHT_STROKE = palette.white;

export interface BodyRegionProps {
  /** Region identifier */
  id: BodyRegionId;
  /** SVG path data for the region shape */
  pathData: string;
  /** Current pain level for this region */
  painLevel?: PainLevel;
  /** Whether this region is selected/active */
  selected?: boolean;
  /** Called when region is tapped */
  onPress?: (id: BodyRegionId) => void;
  /** Transform for positioning */
  transform?: string;
  /** Whether interaction is disabled */
  disabled?: boolean;
}

/**
 * BodyRegion component - Individual tappable body part
 */
export function BodyRegion({
  id,
  pathData,
  painLevel = 'none',
  selected = false,
  onPress,
  transform,
  disabled = false,
}: BodyRegionProps) {
  const handlePress = useCallback(() => {
    if (!disabled && onPress) {
      onPress(id);
    }
  }, [id, onPress, disabled]);

  // Determine fill color based on pain level
  const fillColor = painLevel === 'none' ? DEFAULT_FILL : getPainColor(painLevel);

  // Stroke color changes when selected
  const strokeColor = selected ? HIGHLIGHT_STROKE : DEFAULT_STROKE;
  const strokeWidth = selected ? 2 : 1;

  // Opacity for disabled state
  const opacity = disabled ? 0.5 : 1;

  return (
    <G transform={transform} opacity={opacity}>
      <Path
        d={pathData}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        onPress={handlePress}
        // Accessibility
        accessibilityLabel={`${id.replace(/_/g, ' ')} region`}
      />
    </G>
  );
}

/**
 * Region path definitions for front view body map
 * These are simplified SVG paths for a human body silhouette
 */
export const FRONT_BODY_REGIONS: Record<BodyRegionId, string> = {
  // Head - circle/oval at top
  head: 'M 100 10 C 115 10 125 25 125 45 C 125 65 115 80 100 80 C 85 80 75 65 75 45 C 75 25 85 10 100 10 Z',

  // Neck
  neck: 'M 90 80 L 110 80 L 108 100 L 92 100 Z',

  // Shoulders
  shoulder_left: 'M 60 100 L 92 100 L 92 120 L 70 125 L 55 115 Z',
  shoulder_right: 'M 108 100 L 140 100 L 145 115 L 130 125 L 108 120 Z',

  // Upper arms
  upper_arm_left: 'M 55 115 L 70 125 L 60 165 L 45 155 Z',
  upper_arm_right: 'M 130 125 L 145 115 L 155 155 L 140 165 Z',

  // Elbows
  elbow_left: 'M 45 155 L 60 165 L 55 185 L 40 175 Z',
  elbow_right: 'M 140 165 L 155 155 L 160 175 L 145 185 Z',

  // Forearms
  forearm_left: 'M 40 175 L 55 185 L 45 230 L 30 220 Z',
  forearm_right: 'M 145 185 L 160 175 L 170 220 L 155 230 Z',

  // Wrists
  wrist_left: 'M 30 220 L 45 230 L 42 250 L 28 240 Z',
  wrist_right: 'M 155 230 L 170 220 L 172 240 L 158 250 Z',

  // Hands
  hand_left: 'M 28 240 L 42 250 L 38 280 L 25 270 Z',
  hand_right: 'M 158 250 L 172 240 L 175 270 L 162 280 Z',

  // Chest
  chest: 'M 70 120 L 130 120 L 130 180 L 70 180 Z',

  // Abdomen
  abdomen: 'M 75 180 L 125 180 L 125 240 L 75 240 Z',

  // Hips
  hip_left: 'M 65 240 L 100 240 L 95 270 L 60 265 Z',
  hip_right: 'M 100 240 L 135 240 L 140 265 L 105 270 Z',

  // Thighs
  thigh_left: 'M 60 265 L 95 270 L 85 340 L 55 335 Z',
  thigh_right: 'M 105 270 L 140 265 L 145 335 L 115 340 Z',

  // Knees
  knee_left: 'M 55 335 L 85 340 L 80 370 L 50 365 Z',
  knee_right: 'M 115 340 L 145 335 L 150 365 L 120 370 Z',

  // Shins (front of lower leg)
  shin_left: 'M 50 365 L 80 370 L 72 440 L 48 435 Z',
  shin_right: 'M 120 370 L 150 365 L 152 435 L 128 440 Z',

  // Calves (back of lower leg - visible from front as sides)
  calf_left: 'M 48 365 L 50 365 L 48 435 L 45 430 Z',
  calf_right: 'M 150 365 L 152 365 L 155 430 L 152 435 Z',

  // Ankles
  ankle_left: 'M 48 435 L 72 440 L 68 460 L 45 455 Z',
  ankle_right: 'M 128 440 L 152 435 L 155 455 L 132 460 Z',

  // Feet
  foot_left: 'M 45 455 L 68 460 L 65 485 L 40 480 Z',
  foot_right: 'M 132 460 L 155 455 L 160 480 L 135 485 Z',

  // Back regions (shown in back view, but included for completeness)
  // These would use different paths in a back view
  upper_back: 'M 70 120 L 130 120 L 130 150 L 70 150 Z',
  mid_back: 'M 70 150 L 130 150 L 130 180 L 70 180 Z',
  lower_back: 'M 75 180 L 125 180 L 125 220 L 75 220 Z',
  glute_left: 'M 65 220 L 100 220 L 100 250 L 60 245 Z',
  glute_right: 'M 100 220 L 135 220 L 140 245 L 100 250 Z',
};

/**
 * Human-readable labels for each region
 */
export const REGION_LABELS: Record<BodyRegionId, string> = {
  head: 'Head',
  neck: 'Neck',
  shoulder_left: 'Left Shoulder',
  shoulder_right: 'Right Shoulder',
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
  chest: 'Chest',
  upper_back: 'Upper Back',
  mid_back: 'Mid Back',
  lower_back: 'Lower Back',
  abdomen: 'Abdomen',
  hip_left: 'Left Hip',
  hip_right: 'Right Hip',
  glute_left: 'Left Glute',
  glute_right: 'Right Glute',
  thigh_left: 'Left Thigh',
  thigh_right: 'Right Thigh',
  knee_left: 'Left Knee',
  knee_right: 'Right Knee',
  calf_left: 'Left Calf',
  calf_right: 'Right Calf',
  shin_left: 'Left Shin',
  shin_right: 'Right Shin',
  ankle_left: 'Left Ankle',
  ankle_right: 'Right Ankle',
  foot_left: 'Left Foot',
  foot_right: 'Right Foot',
};
