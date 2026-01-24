import { useState, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  YStack,
  XStack,
  Text,
  Button,
  H2,
  H3,
  Card,
  Circle,
  Separator,
} from 'tamagui';
import {
  Check,
  Clock,
  Dumbbell,
  TrendingUp,
  ThumbsUp,
  Minus,
  ThumbsDown,
  Home,
} from '@tamagui/lucide-icons';

import { useHaptics } from '@/hooks/useHaptics';

// Mock session summary data
const MOCK_SUMMARY = {
  id: 'session-1',
  title: 'Lower Back & Hip Recovery',
  duration: 18,
  targetDuration: 20,
  exercisesCompleted: 6,
  exercisesTotal: 6,
  setsCompleted: 16,
  setsTotal: 16,
  focusAreas: ['Lower Back', 'Hips'],
  exercises: [
    { id: '1', name: 'Cat-Cow Stretch', setsCompleted: 3, setsTotal: 3, skipped: false },
    { id: '2', name: 'Hip Circles', setsCompleted: 2, setsTotal: 2, skipped: false },
    { id: '3', name: "Child's Pose", setsCompleted: 2, setsTotal: 2, skipped: false },
    { id: '4', name: 'Piriformis Stretch', setsCompleted: 3, setsTotal: 3, skipped: false },
    { id: '5', name: 'Pelvic Tilts', setsCompleted: 3, setsTotal: 3, skipped: false },
    { id: '6', name: 'Glute Bridge', setsCompleted: 3, setsTotal: 3, skipped: false },
  ],
};

type FeelingOption = 'better' | 'same' | 'worse';

export default function WorkoutSummaryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { triggerHaptic } = useHaptics();

  const [selectedFeeling, setSelectedFeeling] = useState<FeelingOption | null>(null);
  const [showBodyUpdate, setShowBodyUpdate] = useState(false);

  const summary = MOCK_SUMMARY;
  const completionRate = Math.round(
    (summary.exercisesCompleted / summary.exercisesTotal) * 100
  );

  const handleFeelingSelect = useCallback(
    (feeling: FeelingOption) => {
      triggerHaptic('selection');
      setSelectedFeeling(feeling);
    },
    [triggerHaptic]
  );

  const handleUpdateBody = useCallback(() => {
    triggerHaptic('selection');
    setShowBodyUpdate(true);
    // Navigate to body map or show inline update
  }, [triggerHaptic]);

  const handleFinish = useCallback(() => {
    triggerHaptic('sessionComplete');
    router.replace('/(tabs)');
  }, [router, triggerHaptic]);

  const getFeelingIcon = (feeling: FeelingOption) => {
    switch (feeling) {
      case 'better':
        return <ThumbsUp size={24} />;
      case 'same':
        return <Minus size={24} />;
      case 'worse':
        return <ThumbsDown size={24} />;
    }
  };

  const getFeelingColor = (feeling: FeelingOption) => {
    switch (feeling) {
      case 'better':
        return '#22C55E';
      case 'same':
        return '#6B7280';
      case 'worse':
        return '#F59E0B';
    }
  };

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      paddingTop={insets.top + 20}
      paddingBottom={insets.bottom + 20}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
      >
        <YStack gap="$4">
          {/* Success Header */}
          <YStack alignItems="center" gap="$3">
            <Circle size={80} backgroundColor="$success">
              <Check size={40} color="white" />
            </Circle>
            <H2 textAlign="center">Session Complete</H2>
            <Text color="$colorHover" textAlign="center">
              {summary.duration} minutes of recovery work done.
            </Text>
          </YStack>

          {/* Stats Summary */}
          <Card bordered padded>
            <XStack justifyContent="space-around">
              <YStack alignItems="center" gap="$1">
                <XStack alignItems="center" gap="$1">
                  <Clock size={16} color="$primary" />
                  <Text fontSize="$6" fontWeight="700">
                    {summary.duration}
                  </Text>
                </XStack>
                <Text fontSize="$2" color="$colorHover">
                  minutes
                </Text>
              </YStack>

              <YStack alignItems="center" gap="$1">
                <XStack alignItems="center" gap="$1">
                  <Dumbbell size={16} color="$primary" />
                  <Text fontSize="$6" fontWeight="700">
                    {summary.exercisesCompleted}/{summary.exercisesTotal}
                  </Text>
                </XStack>
                <Text fontSize="$2" color="$colorHover">
                  exercises
                </Text>
              </YStack>

              <YStack alignItems="center" gap="$1">
                <XStack alignItems="center" gap="$1">
                  <TrendingUp size={16} color="$primary" />
                  <Text fontSize="$6" fontWeight="700">
                    {completionRate}%
                  </Text>
                </XStack>
                <Text fontSize="$2" color="$colorHover">
                  completion
                </Text>
              </YStack>
            </XStack>
          </Card>

          {/* How Do You Feel */}
          <Card bordered padded>
            <YStack gap="$4">
              <H3>How do you feel now?</H3>
              <XStack justifyContent="space-around">
                {(['better', 'same', 'worse'] as FeelingOption[]).map((feeling) => {
                  const isSelected = selectedFeeling === feeling;
                  const color = getFeelingColor(feeling);

                  return (
                    <YStack
                      key={feeling}
                      alignItems="center"
                      gap="$2"
                      onPress={() => handleFeelingSelect(feeling)}
                      pressStyle={{ opacity: 0.7 }}
                    >
                      <Circle
                        size={56}
                        backgroundColor={isSelected ? color : '$backgroundHover'}
                        borderWidth={2}
                        borderColor={isSelected ? color : 'transparent'}
                      >
                        {getFeelingIcon(feeling)}
                      </Circle>
                      <Text
                        fontSize="$2"
                        color={isSelected ? color : '$colorHover'}
                        fontWeight={isSelected ? '600' : '400'}
                        textTransform="capitalize"
                      >
                        {feeling}
                      </Text>
                    </YStack>
                  );
                })}
              </XStack>
            </YStack>
          </Card>

          {/* Body Update Prompt */}
          <Card bordered padded backgroundColor="$backgroundHover">
            <YStack gap="$3">
              <Text fontWeight="600">Any areas to update?</Text>
              <Text fontSize="$2" color="$colorHover">
                Let me know if any areas feel different after this session.
              </Text>
              <Button variant="outlined" onPress={handleUpdateBody}>
                Update Body Map
              </Button>
            </YStack>
          </Card>

          {/* Exercise Breakdown */}
          <Card bordered padded>
            <YStack gap="$3">
              <H3>Exercise Summary</H3>
              <Separator />
              <YStack gap="$2">
                {summary.exercises.map((exercise) => (
                  <XStack
                    key={exercise.id}
                    alignItems="center"
                    gap="$3"
                    paddingVertical="$2"
                  >
                    <Circle
                      size={28}
                      backgroundColor={exercise.skipped ? '$warning' : '$success'}
                    >
                      <Check size={14} color="white" />
                    </Circle>
                    <Text flex={1}>{exercise.name}</Text>
                    <Text fontSize="$2" color="$colorHover">
                      {exercise.setsCompleted}/{exercise.setsTotal} sets
                    </Text>
                  </XStack>
                ))}
              </YStack>
            </YStack>
          </Card>

          {/* Encouragement */}
          <Card backgroundColor="$backgroundHover" padded>
            <YStack alignItems="center" gap="$2">
              <Text fontWeight="600" fontSize="$4" textAlign="center">
                Solid session. See you tomorrow.
              </Text>
              <Text fontSize="$2" color="$colorHover" textAlign="center">
                Consistency is what makes the difference.
              </Text>
            </YStack>
          </Card>
        </YStack>
      </ScrollView>

      {/* Done Button */}
      <YStack paddingHorizontal="$4">
        <Button
          size="$5"
          backgroundColor="$primary"
          color="white"
          icon={Home}
          onPress={handleFinish}
        >
          Done
        </Button>
      </YStack>
    </YStack>
  );
}
