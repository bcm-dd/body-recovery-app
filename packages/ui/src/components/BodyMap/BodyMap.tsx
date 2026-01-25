/**
 * BodyMap component
 *
 * Interactive SVG-based human figure for pain/discomfort logging.
 * Features:
 * - 34 tappable body regions
 * - Color coding by pain level (green -> yellow -> orange -> red)
 * - Front view (back view can be added as a toggle)
 * - Accessibility support
 */

import { useMemo, useCallback } from 'react';
import Svg, { G, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import type { GetProps } from 'tamagui';
import { styled, Stack } from 'tamagui';

import type {
  BodyRegionId,
  PainLevel} from './BodyRegion';
import {
  BodyRegion,
  FRONT_BODY_REGIONS,
  REGION_LABELS,
} from './BodyRegion';
import { Text } from '../../primitives/Text';
import { palette } from '../../theme/tokens';

/**
 * Container for the body map
 */
const BodyMapContainer = styled(Stack, {
  name: 'BodyMapContainer',

  alignItems: 'center',
  justifyContent: 'center',
  padding: '$4',

  variants: {
    size: {
      sm: {
        width: 150,
        height: 300,
      },
      md: {
        width: 200,
        height: 400,
      },
      lg: {
        width: 250,
        height: 500,
      },
      full: {
        width: '100%',
        aspectRatio: 0.5,
      },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
});

/**
 * Pain state for all body regions
 */
export type BodyPainState = Partial<Record<BodyRegionId, PainLevel>>;

export type BodyMapContainerProps = GetProps<typeof BodyMapContainer>;

export interface BodyMapProps extends BodyMapContainerProps {
  /** Current pain state for all regions */
  painState?: BodyPainState;
  /** Currently selected region */
  selectedRegion?: BodyRegionId | null;
  /** Callback when a region is tapped */
  onRegionTap?: (regionId: BodyRegionId, label: string) => void;
  /** Whether the body map is interactive */
  interactive?: boolean;
  /** View mode (front or back) */
  view?: 'front' | 'back';
  /** Show only specific regions (for filtering) */
  visibleRegions?: BodyRegionId[];
  /** Disabled regions (cannot be tapped) */
  disabledRegions?: BodyRegionId[];
}

/**
 * Front view regions to render (excludes back-only regions)
 */
const FRONT_VIEW_REGIONS: BodyRegionId[] = [
  'head',
  'neck',
  'shoulder_left',
  'shoulder_right',
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
  'chest',
  'abdomen',
  'hip_left',
  'hip_right',
  'thigh_left',
  'thigh_right',
  'knee_left',
  'knee_right',
  'shin_left',
  'shin_right',
  'ankle_left',
  'ankle_right',
  'foot_left',
  'foot_right',
];

/**
 * Back view regions
 */
const BACK_VIEW_REGIONS: BodyRegionId[] = [
  'head',
  'neck',
  'shoulder_left',
  'shoulder_right',
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
  'upper_back',
  'mid_back',
  'lower_back',
  'glute_left',
  'glute_right',
  'thigh_left',
  'thigh_right',
  'knee_left',
  'knee_right',
  'calf_left',
  'calf_right',
  'ankle_left',
  'ankle_right',
  'foot_left',
  'foot_right',
];

/**
 * BodyMap component
 */
export function BodyMap({
  painState = {},
  selectedRegion = null,
  onRegionTap,
  interactive = true,
  view = 'front',
  visibleRegions,
  disabledRegions = [],
  size = 'md',
  ...containerProps
}: BodyMapProps) {
  // Determine which regions to show
  const regionsToRender = useMemo(() => {
    const baseRegions = view === 'front' ? FRONT_VIEW_REGIONS : BACK_VIEW_REGIONS;

    if (visibleRegions) {
      return baseRegions.filter((r) => visibleRegions.includes(r));
    }

    return baseRegions;
  }, [view, visibleRegions]);

  // Handle region tap
  const handleRegionPress = useCallback(
    (regionId: BodyRegionId) => {
      if (onRegionTap && interactive) {
        const label = REGION_LABELS[regionId];
        onRegionTap(regionId, label);
      }
    },
    [onRegionTap, interactive]
  );

  // Calculate SVG viewBox based on size
  const viewBox = '0 0 200 500';

  return (
    <BodyMapContainer size={size} {...containerProps}>
      <Svg
        viewBox={viewBox}
        width="100%"
        height="100%"
        accessibilityLabel="Body map for pain logging"
        accessibilityRole="image"
      >
        <Defs>
          {/* Background gradient */}
          <LinearGradient id="bodyGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={palette.gray800} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={palette.gray900} stopOpacity={0.3} />
          </LinearGradient>
        </Defs>

        {/* Background */}
        <Rect
          x="0"
          y="0"
          width="200"
          height="500"
          fill="url(#bodyGradient)"
          rx="8"
        />

        {/* Body regions */}
        <G>
          {regionsToRender.map((regionId) => (
            <BodyRegion
              key={regionId}
              id={regionId}
              pathData={FRONT_BODY_REGIONS[regionId]}
              painLevel={painState[regionId] || 'none'}
              selected={selectedRegion === regionId}
              onPress={handleRegionPress}
              disabled={!interactive || disabledRegions.includes(regionId)}
            />
          ))}
        </G>
      </Svg>
    </BodyMapContainer>
  );
}

/**
 * Legend component for pain levels
 */
const LegendContainer = styled(Stack, {
  name: 'BodyMapLegend',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$4',
  paddingVertical: '$2',
});

const LegendItem = styled(Stack, {
  name: 'BodyMapLegendItem',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$1',
});

const LegendDot = styled(Stack, {
  name: 'BodyMapLegendDot',
  width: 12,
  height: 12,
  borderRadius: '$full',
});


export interface BodyMapLegendProps {
  /** Show all levels or just active ones */
  showAll?: boolean;
  /** Active pain levels to show */
  activeLevels?: PainLevel[];
}

/**
 * Legend showing pain level color coding
 */
export function BodyMapLegend({
  showAll = true,
  activeLevels,
}: BodyMapLegendProps) {
  const levels: { level: PainLevel; label: string; color: string }[] = [
    { level: 'none', label: 'None', color: palette.painNone },
    { level: 'mild', label: 'Mild', color: palette.painMild },
    { level: 'moderate', label: 'Moderate', color: palette.painModerate },
    { level: 'severe', label: 'Severe', color: palette.painSevere },
  ];

  const visibleLevels = showAll
    ? levels
    : levels.filter((l) => activeLevels?.includes(l.level));

  return (
    <LegendContainer>
      {visibleLevels.map(({ level, label, color }) => (
        <LegendItem key={level}>
          <LegendDot backgroundColor={color} />
          <Text variant="caption">{label}</Text>
        </LegendItem>
      ))}
    </LegendContainer>
  );
}

// Attach legend as sub-component
BodyMap.Legend = BodyMapLegend;
BodyMap.Container = BodyMapContainer;
