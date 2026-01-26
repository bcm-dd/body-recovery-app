import React from 'react';
import { XStack, Circle, Text } from 'tamagui';
import { Check } from '@tamagui/lucide-icons';

interface SetIndicatorProps {
  totalSets: number;
  completedSets: number;
  currentSet?: number;
  size?: 'small' | 'medium' | 'large';
}

const SIZE_CONFIG = {
  small: { circle: 24, icon: 12, gap: '$1' as const },
  medium: { circle: 32, icon: 16, gap: '$2' as const },
  large: { circle: 40, icon: 20, gap: '$3' as const },
};

/**
 * Visual indicator showing workout set progress
 */
export function SetIndicator({
  totalSets,
  completedSets,
  currentSet = completedSets,
  size = 'medium',
}: SetIndicatorProps) {
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <XStack gap={sizeConfig.gap} justifyContent="center">
      {Array.from({ length: totalSets }).map((_, index) => {
        const isCompleted = index < completedSets;
        const isCurrent = index === currentSet;

        return (
          <Circle
            key={index}
            size={sizeConfig.circle}
            backgroundColor={isCompleted ? '$success' : 'transparent'}
            borderWidth={2}
            borderColor={
              isCurrent ? '$primary' : isCompleted ? '$success' : '$borderColor'
            }
          >
            {isCompleted ? (
              <Check size={sizeConfig.icon} color="white" />
            ) : (
              <Text
                fontSize="$2"
                color={isCurrent ? '$primary' : '$colorHover'}
                fontWeight={isCurrent ? '600' : '400'}
              >
                {index + 1}
              </Text>
            )}
          </Circle>
        );
      })}
    </XStack>
  );
}

export default SetIndicator;
