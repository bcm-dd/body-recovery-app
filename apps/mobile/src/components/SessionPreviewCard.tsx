import React from 'react';
import { YStack, XStack, Text, Card, H3, Button, Circle, Separator } from 'tamagui';
import { Play, Edit3, SkipForward, Clock, Dumbbell } from '@tamagui/lucide-icons';

interface SessionPreviewCardProps {
  title: string;
  duration: number; // minutes
  exerciseCount: number;
  focusAreas: string[];
  exercises?: Array<{
    id: string;
    name: string;
    sets: number;
  }>;
  maxExercisesToShow?: number;
  onStart: () => void;
  onModify?: () => void;
  onSkip?: () => void;
}

/**
 * Card showing a preview of today's workout session
 */
export function SessionPreviewCard({
  title,
  duration,
  exerciseCount,
  focusAreas,
  exercises = [],
  maxExercisesToShow = 3,
  onStart,
  onModify,
  onSkip,
}: SessionPreviewCardProps) {
  const visibleExercises = exercises.slice(0, maxExercisesToShow);
  const remainingCount = exercises.length - maxExercisesToShow;

  return (
    <Card bordered padded elevate>
      <YStack gap="$4">
        {/* Header */}
        <YStack gap="$2">
          <Text
            color="$colorHover"
            fontSize="$2"
            textTransform="uppercase"
            letterSpacing={1}
          >
            Today's Recovery Session
          </Text>
          <H3>{title}</H3>
        </YStack>

        {/* Stats */}
        <XStack gap="$6">
          <XStack alignItems="center" gap="$2">
            <Clock size={16} color="$colorHover" />
            <Text color="$colorHover">{duration} min</Text>
          </XStack>
          <XStack alignItems="center" gap="$2">
            <Dumbbell size={16} color="$colorHover" />
            <Text color="$colorHover">{exerciseCount} exercises</Text>
          </XStack>
        </XStack>

        {/* Focus Areas */}
        {focusAreas.length > 0 && (
          <XStack flexWrap="wrap" gap="$2">
            {focusAreas.map((area) => (
              <YStack
                key={area}
                backgroundColor="$backgroundHover"
                paddingHorizontal="$2"
                paddingVertical="$1"
                borderRadius="$1"
              >
                <Text fontSize="$2" color="$colorHover">
                  {area}
                </Text>
              </YStack>
            ))}
          </XStack>
        )}

        {/* Exercise Preview List */}
        {visibleExercises.length > 0 && (
          <>
            <Separator />
            <YStack gap="$2">
              {visibleExercises.map((exercise, index) => (
                <XStack
                  key={exercise.id}
                  alignItems="center"
                  gap="$3"
                  paddingVertical="$2"
                >
                  <Circle size={24} backgroundColor="$backgroundPress">
                    <Text fontSize="$2" color="$colorHover">
                      {index + 1}
                    </Text>
                  </Circle>
                  <Text flex={1} color="$color">
                    {exercise.name}
                  </Text>
                  <Text color="$colorHover" fontSize="$2">
                    {exercise.sets} sets
                  </Text>
                </XStack>
              ))}
              {remainingCount > 0 && (
                <Text
                  color="$colorHover"
                  fontSize="$2"
                  textAlign="center"
                  marginTop="$2"
                >
                  +{remainingCount} more exercise{remainingCount !== 1 ? 's' : ''}
                </Text>
              )}
            </YStack>
          </>
        )}

        <Separator />

        {/* Action Buttons */}
        <YStack gap="$3">
          <Button
            size="$5"
            backgroundColor="$primary"
            color="white"
            icon={Play}
            onPress={onStart}
          >
            Start Session
          </Button>
          <XStack gap="$3">
            {onModify && (
              <Button flex={1} bordered icon={Edit3} onPress={onModify}>
                Modify
              </Button>
            )}
            {onSkip && (
              <Button flex={1} bordered icon={SkipForward} onPress={onSkip}>
                Skip Today
              </Button>
            )}
          </XStack>
        </YStack>
      </YStack>
    </Card>
  );
}

export default SessionPreviewCard;
