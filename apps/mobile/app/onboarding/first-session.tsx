import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  YStack,
  XStack,
  Text,
  Button,
  H2,
  H3,
  Paragraph,
  Circle,
  Card,
  Separator,
} from 'tamagui';
import { Play, Clock, Dumbbell, ChevronRight } from '@tamagui/lucide-icons';

import { useHaptics } from '@/hooks/useHaptics';

// Mock first session data
const MOCK_FIRST_SESSION = {
  id: 'first-session',
  title: 'Your First Recovery Session',
  duration: 15,
  exerciseCount: 5,
  focusAreas: ['Getting Started'],
  exercises: [
    {
      id: '1',
      name: 'Diaphragmatic Breathing',
      duration: '2 min',
      description: 'Activate your core and calm your nervous system',
    },
    {
      id: '2',
      name: 'Cat-Cow Stretch',
      sets: 10,
      description: 'Gentle spine mobility',
    },
    {
      id: '3',
      name: 'Hip Circles',
      sets: 10,
      description: 'Loosen up your hip joints',
    },
    {
      id: '4',
      name: 'Shoulder Rolls',
      sets: 10,
      description: 'Release upper body tension',
    },
    {
      id: '5',
      name: "Child's Pose",
      duration: '1 min',
      description: 'Full body relaxation',
    },
  ],
};

export default function FirstSessionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { triggerHaptic } = useHaptics();

  const handleStartNow = useCallback(() => {
    triggerHaptic('success');
    // Navigate to workout execution
    router.replace(`/workout/${MOCK_FIRST_SESSION.id}`);
  }, [router, triggerHaptic]);

  const handleSaveForLater = useCallback(() => {
    triggerHaptic('selection');
    // Navigate to main app
    router.replace('/(tabs)');
  }, [router, triggerHaptic]);

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
          {/* Progress indicator */}
          <XStack gap="$2" justifyContent="center">
            {[1, 2, 3, 4].map((step) => (
              <Circle key={step} size={8} backgroundColor="$primary" />
            ))}
          </XStack>

          <YStack gap="$2">
            <H2>Here's your first recovery session</H2>
            <Paragraph color="$colorHover" fontSize="$3">
              A gentle introduction to get you started. This session is intentionally short - just
              15 minutes.
            </Paragraph>
          </YStack>

          {/* Session Overview Card */}
          <Card bordered padded elevate>
            <YStack gap="$4">
              <YStack gap="$2">
                <H3>{MOCK_FIRST_SESSION.title}</H3>
                <XStack gap="$4">
                  <XStack alignItems="center" gap="$2">
                    <Clock size={16} color="$colorHover" />
                    <Text color="$colorHover">{MOCK_FIRST_SESSION.duration} min</Text>
                  </XStack>
                  <XStack alignItems="center" gap="$2">
                    <Dumbbell size={16} color="$colorHover" />
                    <Text color="$colorHover">
                      {MOCK_FIRST_SESSION.exerciseCount} exercises
                    </Text>
                  </XStack>
                </XStack>
              </YStack>

              <Separator />

              {/* Exercise List */}
              <YStack gap="$3">
                {MOCK_FIRST_SESSION.exercises.map((exercise, index) => (
                  <XStack key={exercise.id} gap="$3" alignItems="flex-start">
                    <Circle size={28} backgroundColor="$backgroundHover">
                      <Text fontSize="$2" color="$colorHover">
                        {index + 1}
                      </Text>
                    </Circle>
                    <YStack flex={1}>
                      <Text fontWeight="600">{exercise.name}</Text>
                      <Text fontSize="$2" color="$colorHover">
                        {exercise.description}
                      </Text>
                      <Text fontSize="$1" color="$colorHover" marginTop="$1">
                        {exercise.duration || `${exercise.sets} reps`}
                      </Text>
                    </YStack>
                  </XStack>
                ))}
              </YStack>
            </YStack>
          </Card>

          {/* Tip Card */}
          <Card backgroundColor="$backgroundHover" padded>
            <YStack gap="$2">
              <Text fontWeight="600">What to expect</Text>
              <Text fontSize="$2" color="$colorHover">
                This is a gentle session to assess your baseline. Listen to your body - if something
                doesn't feel right, you can always skip or swap exercises.
              </Text>
            </YStack>
          </Card>
        </YStack>
      </ScrollView>

      {/* Action buttons */}
      <YStack paddingHorizontal="$4" gap="$3">
        <Button
          size="$5"
          backgroundColor="$primary"
          color="white"
          icon={Play}
          onPress={handleStartNow}
        >
          Start Now
        </Button>

        <Button
          size="$4"
          backgroundColor="transparent"
          color="$colorHover"
          onPress={handleSaveForLater}
        >
          Save for Later
        </Button>
      </YStack>
    </YStack>
  );
}
