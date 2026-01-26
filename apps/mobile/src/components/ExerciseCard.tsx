import React from 'react';
import { YStack, XStack, Text, Card, Circle, H3, Paragraph } from 'tamagui';
import { Play, Check, AlertCircle } from '@tamagui/lucide-icons';

interface Exercise {
  id: string;
  name: string;
  description?: string;
  sets: number;
  reps?: number;
  duration?: number; // seconds
  cues?: string[];
}

interface ExerciseCardProps {
  exercise: Exercise;
  completedSets: number;
  status: 'upcoming' | 'active' | 'completed' | 'skipped';
  onPress?: () => void;
  onLongPress?: () => void;
  showCues?: boolean;
}

const STATUS_STYLES = {
  upcoming: {
    borderColor: '$borderColor',
    borderWidth: 1,
    opacity: 0.7,
  },
  active: {
    borderColor: '$primary',
    borderWidth: 2,
    opacity: 1,
  },
  completed: {
    borderColor: '$success',
    borderWidth: 1,
    opacity: 0.6,
  },
  skipped: {
    borderColor: '$warning',
    borderWidth: 1,
    opacity: 0.5,
  },
};

/**
 * Card component for displaying an exercise in a workout
 */
export function ExerciseCard({
  exercise,
  completedSets,
  status,
  onPress,
  onLongPress,
  showCues = false,
}: ExerciseCardProps) {
  const styles = STATUS_STYLES[status];

  return (
    <Card
      bordered
      padded
      backgroundColor={status === 'active' ? '$backgroundHover' : '$background'}
      borderColor={styles.borderColor}
      borderWidth={styles.borderWidth}
      opacity={styles.opacity}
      onPress={onPress}
      onLongPress={onLongPress}
      pressStyle={{ opacity: 0.8 }}
    >
      <YStack gap="$3">
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack flex={1} gap="$1">
            <H3>{exercise.name}</H3>
            {exercise.description && (
              <Paragraph fontSize="$2" color="$colorHover">
                {exercise.description}
              </Paragraph>
            )}
          </YStack>

          {/* Status indicator */}
          {status === 'completed' && (
            <Circle size={28} backgroundColor="$success">
              <Check size={16} color="white" />
            </Circle>
          )}
          {status === 'active' && (
            <Circle size={28} backgroundColor="$primary">
              <Play size={14} color="white" />
            </Circle>
          )}
        </XStack>

        {/* Prescription */}
        <XStack gap="$4">
          {exercise.reps && (
            <YStack>
              <Text fontSize="$5" fontWeight="700" color="$color">
                {exercise.reps}
              </Text>
              <Text fontSize="$1" color="$colorHover">
                reps
              </Text>
            </YStack>
          )}
          {exercise.duration && (
            <YStack>
              <Text fontSize="$5" fontWeight="700" color="$color">
                {exercise.duration}s
              </Text>
              <Text fontSize="$1" color="$colorHover">
                hold
              </Text>
            </YStack>
          )}
          <YStack>
            <Text fontSize="$5" fontWeight="700" color="$color">
              {exercise.sets}
            </Text>
            <Text fontSize="$1" color="$colorHover">
              sets
            </Text>
          </YStack>
        </XStack>

        {/* Set indicators */}
        <XStack gap="$2">
          {Array.from({ length: exercise.sets }).map((_, index) => {
            const isCompleted = index < completedSets;
            const isCurrent = status === 'active' && index === completedSets;

            return (
              <Circle
                key={index}
                size={28}
                backgroundColor={isCompleted ? '$success' : 'transparent'}
                borderWidth={2}
                borderColor={
                  isCurrent
                    ? '$primary'
                    : isCompleted
                    ? '$success'
                    : '$borderColor'
                }
              >
                {isCompleted ? (
                  <Check size={14} color="white" />
                ) : (
                  <Text
                    fontSize="$1"
                    color={isCurrent ? '$primary' : '$colorHover'}
                  >
                    {index + 1}
                  </Text>
                )}
              </Circle>
            );
          })}
        </XStack>

        {/* Cues (expandable) */}
        {showCues && exercise.cues && exercise.cues.length > 0 && (
          <YStack gap="$2" marginTop="$2">
            <Text fontSize="$2" fontWeight="600" color="$colorHover">
              Form Cues
            </Text>
            {exercise.cues.map((cue, index) => (
              <XStack key={index} gap="$2" alignItems="flex-start">
                <Circle size={6} backgroundColor="$primary" marginTop={6} />
                <Text fontSize="$2" color="$colorHover" flex={1}>
                  {cue}
                </Text>
              </XStack>
            ))}
          </YStack>
        )}

        {/* Swipe hint for active exercise */}
        {status === 'active' && (
          <XStack
            justifyContent="center"
            alignItems="center"
            gap="$2"
            opacity={0.5}
            marginTop="$2"
          >
            <AlertCircle size={12} />
            <Text fontSize="$1" color="$colorHover">
              Swipe left to log pain
            </Text>
          </XStack>
        )}
      </YStack>
    </Card>
  );
}

export default ExerciseCard;
