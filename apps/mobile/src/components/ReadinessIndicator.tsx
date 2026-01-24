import React from 'react';
import { YStack, XStack, Text, Circle } from 'tamagui';

export type ReadinessLevel = 'good' | 'moderate' | 'rest';

interface ReadinessIndicatorProps {
  level: ReadinessLevel;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const READINESS_CONFIG: Record<
  ReadinessLevel,
  { color: string; label: string; shortLabel: string }
> = {
  good: {
    color: '#22C55E',
    label: 'Good to Go',
    shortLabel: 'OK',
  },
  moderate: {
    color: '#F59E0B',
    label: 'Take It Easy',
    shortLabel: 'M',
  },
  rest: {
    color: '#EF4444',
    label: 'Rest Day',
    shortLabel: 'R',
  },
};

const SIZE_CONFIG = {
  small: { outer: 40, inner: 28, fontSize: '$2' as const },
  medium: { outer: 60, inner: 40, fontSize: '$4' as const },
  large: { outer: 80, inner: 56, fontSize: '$5' as const },
};

/**
 * Readiness indicator component showing a colored ring with status
 */
export function ReadinessIndicator({
  level,
  size = 'medium',
  showLabel = false,
}: ReadinessIndicatorProps) {
  const config = READINESS_CONFIG[level];
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <YStack alignItems="center" gap="$2">
      <Circle
        size={sizeConfig.outer}
        backgroundColor={config.color}
        opacity={0.15}
      >
        <Circle size={sizeConfig.inner} backgroundColor={config.color}>
          <Text color="white" fontWeight="700" fontSize={sizeConfig.fontSize}>
            {config.shortLabel}
          </Text>
        </Circle>
      </Circle>
      {showLabel && (
        <Text fontSize="$2" color="$colorHover" fontWeight="500">
          {config.label}
        </Text>
      )}
    </YStack>
  );
}

export default ReadinessIndicator;
