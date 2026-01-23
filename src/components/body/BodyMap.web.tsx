/**
 * Body Map Component (Web) - Movement & Recovery Companion
 *
 * Web-specific version without react-native-reanimated animations.
 * Uses CSS transitions for press feedback and hover states.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { useTheme } from '@/theme';
import { Text } from '@/components/ui';
import type { BodyRegion, Severity } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface BodyMapProps {
  onRegionPress?: (region: BodyRegion) => void;
  highlightedRegions?: Map<BodyRegion, Severity>;
  selectedRegion?: BodyRegion | null;
  view?: 'front' | 'back';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  accessibilityLabel?: string;
}

interface RegionData {
  id: BodyRegion;
  label: string;
  path: string;
  center: { x: number; y: number };
}

// ============================================================================
// Body Region Paths (simplified for demo)
// ============================================================================

const FRONT_REGIONS: RegionData[] = [
  {
    id: 'head',
    label: 'Head',
    path: 'M50,15 A15,18 0 1,1 50,51 A15,18 0 1,1 50,15',
    center: { x: 50, y: 33 },
  },
  {
    id: 'neck',
    label: 'Neck',
    path: 'M45,51 L55,51 L55,60 L45,60 Z',
    center: { x: 50, y: 55 },
  },
  {
    id: 'shoulder_left',
    label: 'Left Shoulder',
    path: 'M30,60 L45,60 L45,75 L30,70 Z',
    center: { x: 37, y: 67 },
  },
  {
    id: 'shoulder_right',
    label: 'Right Shoulder',
    path: 'M55,60 L70,60 L70,70 L55,75 Z',
    center: { x: 63, y: 67 },
  },
  {
    id: 'chest',
    label: 'Chest',
    path: 'M35,70 L65,70 L65,100 L35,100 Z',
    center: { x: 50, y: 85 },
  },
  {
    id: 'core',
    label: 'Core',
    path: 'M38,100 L62,100 L60,130 L40,130 Z',
    center: { x: 50, y: 115 },
  },
  {
    id: 'upper_arm_left',
    label: 'Left Upper Arm',
    path: 'M20,70 L30,70 L30,100 L22,100 Z',
    center: { x: 25, y: 85 },
  },
  {
    id: 'upper_arm_right',
    label: 'Right Upper Arm',
    path: 'M70,70 L80,70 L78,100 L70,100 Z',
    center: { x: 75, y: 85 },
  },
  {
    id: 'elbow_left',
    label: 'Left Elbow',
    path: 'M20,100 L30,100 L30,110 L20,110 Z',
    center: { x: 25, y: 105 },
  },
  {
    id: 'elbow_right',
    label: 'Right Elbow',
    path: 'M70,100 L80,100 L78,110 L70,110 Z',
    center: { x: 75, y: 105 },
  },
  {
    id: 'forearm_left',
    label: 'Left Forearm',
    path: 'M18,110 L28,110 L26,140 L16,140 Z',
    center: { x: 22, y: 125 },
  },
  {
    id: 'forearm_right',
    label: 'Right Forearm',
    path: 'M72,110 L82,110 L84,140 L74,140 Z',
    center: { x: 78, y: 125 },
  },
  {
    id: 'hip_left',
    label: 'Left Hip',
    path: 'M38,130 L50,130 L50,145 L35,145 Z',
    center: { x: 42, y: 137 },
  },
  {
    id: 'hip_right',
    label: 'Right Hip',
    path: 'M50,130 L62,130 L65,145 L50,145 Z',
    center: { x: 58, y: 137 },
  },
  {
    id: 'thigh_left',
    label: 'Left Thigh',
    path: 'M35,145 L50,145 L48,195 L32,195 Z',
    center: { x: 40, y: 170 },
  },
  {
    id: 'thigh_right',
    label: 'Right Thigh',
    path: 'M50,145 L65,145 L68,195 L52,195 Z',
    center: { x: 60, y: 170 },
  },
  {
    id: 'knee_left',
    label: 'Left Knee',
    path: 'M32,195 L48,195 L47,210 L33,210 Z',
    center: { x: 40, y: 202 },
  },
  {
    id: 'knee_right',
    label: 'Right Knee',
    path: 'M52,195 L68,195 L67,210 L53,210 Z',
    center: { x: 60, y: 202 },
  },
  {
    id: 'calf_left',
    label: 'Left Calf',
    path: 'M33,210 L47,210 L45,255 L35,255 Z',
    center: { x: 40, y: 232 },
  },
  {
    id: 'calf_right',
    label: 'Right Calf',
    path: 'M53,210 L67,210 L65,255 L55,255 Z',
    center: { x: 60, y: 232 },
  },
  {
    id: 'ankle_left',
    label: 'Left Ankle',
    path: 'M35,255 L45,255 L44,265 L36,265 Z',
    center: { x: 40, y: 260 },
  },
  {
    id: 'ankle_right',
    label: 'Right Ankle',
    path: 'M55,255 L65,255 L64,265 L56,265 Z',
    center: { x: 60, y: 260 },
  },
];

const BACK_REGIONS: RegionData[] = [
  {
    id: 'upper_back',
    label: 'Upper Back',
    path: 'M35,60 L65,60 L65,90 L35,90 Z',
    center: { x: 50, y: 75 },
  },
  {
    id: 'lower_back',
    label: 'Lower Back',
    path: 'M38,90 L62,90 L60,125 L40,125 Z',
    center: { x: 50, y: 107 },
  },
  {
    id: 'glute_left',
    label: 'Left Glute',
    path: 'M38,125 L50,125 L50,150 L35,150 Z',
    center: { x: 42, y: 137 },
  },
  {
    id: 'glute_right',
    label: 'Right Glute',
    path: 'M50,125 L62,125 L65,150 L50,150 Z',
    center: { x: 58, y: 137 },
  },
];

// ============================================================================
// Component
// ============================================================================

export function BodyMap({
  onRegionPress,
  highlightedRegions = new Map(),
  selectedRegion,
  view = 'front',
  size = 'md',
  interactive = true,
  accessibilityLabel,
}: BodyMapProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const [activeRegion, setActiveRegion] = useState<BodyRegion | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<BodyRegion | null>(null);

  // Size calculations
  const sizeMap = { sm: 200, md: 280, lg: 360 };
  const containerSize = sizeMap[size];
  const viewBox = '0 0 100 280';

  const regions = view === 'front' ? FRONT_REGIONS : [...FRONT_REGIONS, ...BACK_REGIONS];

  // Get color for region based on severity
  const getRegionColor = (region: BodyRegion) => {
    if (selectedRegion === region) {
      return colors.accent;
    }

    const severity = highlightedRegions.get(region);
    if (!severity) {
      return colors.bodyMapNeutral;
    }

    switch (severity) {
      case 'mild':
        return colors.bodyMapMild;
      case 'moderate':
        return colors.bodyMapModerate;
      case 'severe':
        return colors.bodyMapSevere;
      default:
        return colors.bodyMapNeutral;
    }
  };

  const handleRegionPress = (region: BodyRegion) => {
    if (!interactive) return;

    setActiveRegion(region);
    onRegionPress?.(region);

    // Reset active state after animation
    setTimeout(() => setActiveRegion(null), 200);
  };

  const handleRegionHover = (region: BodyRegion | null) => {
    if (!interactive) return;
    setHoveredRegion(region);
  };

  // Build accessibility description
  const highlightedCount = highlightedRegions.size;
  const defaultAccessibilityLabel = `Body map, ${view} view. ${
    highlightedCount > 0
      ? `${highlightedCount} highlighted region${highlightedCount > 1 ? 's' : ''}`
      : 'No highlighted regions'
  }. ${interactive ? 'Tap body regions to select them.' : ''}`;

  // Web-specific container style with cursor
  const containerStyle: ViewStyle = {
    ...styles.container,
    width: containerSize,
    height: containerSize * 1.4,
  };

  return (
    <View
      style={containerStyle}
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel || defaultAccessibilityLabel}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Body outline */}
        <G>
          {regions.map((region) => {
            const isActive = activeRegion === region.id;
            const isSelected = selectedRegion === region.id;
            const isHovered = hoveredRegion === region.id;
            const hasHighlight = highlightedRegions.has(region.id);

            return (
              <G key={region.id}>
                <Path
                  d={region.path}
                  fill={getRegionColor(region.id)}
                  fillOpacity={hasHighlight || isSelected ? 0.6 : isHovered ? 0.4 : 0.2}
                  stroke={isActive || isSelected || isHovered ? colors.accent : colors.border}
                  strokeWidth={isActive || isSelected ? 2 : isHovered ? 1.5 : 0.5}
                  onPress={() => handleRegionPress(region.id)}
                  onPressIn={() => handleRegionHover(region.id)}
                  onPressOut={() => handleRegionHover(null)}
                  // @ts-ignore - web-specific style
                  style={{
                    cursor: interactive ? 'pointer' : 'default',
                    transition: 'fill-opacity 0.2s ease, stroke-width 0.2s ease',
                  }}
                />
                {/* Indicator dot for highlighted regions */}
                {hasHighlight && (
                  <Circle
                    cx={region.center.x}
                    cy={region.center.y}
                    r={3}
                    fill={getRegionColor(region.id)}
                  />
                )}
              </G>
            );
          })}
        </G>
      </Svg>

      {/* View toggle */}
      <View style={styles.viewIndicator}>
        <Text variant="caption" color="secondary">
          {view === 'front' ? 'Front' : 'Back'}
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewIndicator: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
  },
});
