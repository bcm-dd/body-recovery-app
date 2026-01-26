import { useState, useCallback } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  YStack,
  XStack,
  Text,
  Button,
  Card,
  H2,
  H3,
  Paragraph,
  Separator,
  Circle,
} from 'tamagui';
import { Play, Edit3, SkipForward, Clock, Dumbbell } from '@tamagui/lucide-icons';
import * as Haptics from 'expo-haptics';

import { useHaptics } from '@/hooks/useHaptics';

// Mock data for demo mode
const MOCK_READINESS = {
  status: 'good' as const,
  label: 'Good',
  message: 'Your body is ready for a full session today.',
  sleepHours: 7.5,
  hrvStatus: 'stable',
};

const MOCK_SESSION = {
  id: 'session-1',
  title: 'Lower Back & Hip Recovery',
  duration: 20,
  exerciseCount: 6,
  focusAreas: ['Lower Back', 'Hips'],
  exercises: [
    { id: '1', name: 'Cat-Cow Stretch', sets: 3 },
    { id: '2', name: 'Hip Circles', sets: 2 },
    { id: '3', name: 'Child\'s Pose', sets: 2 },
    { id: '4', name: 'Piriformis Stretch', sets: 3 },
    { id: '5', name: 'Pelvic Tilts', sets: 3 },
    { id: '6', name: 'Glute Bridge', sets: 3 },
  ],
};

type ReadinessStatus = 'good' | 'moderate' | 'rest';

const READINESS_COLORS: Record<ReadinessStatus, string> = {
  good: '#22C55E',
  moderate: '#F59E0B',
  rest: '#EF4444',
};

export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { triggerHaptic } = useHaptics();
  const [refreshing, setRefreshing] = useState(false);
  const [checkInCompleted, setCheckInCompleted] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleStartWorkout = useCallback(() => {
    triggerHaptic('selection');
    router.push(`/workout/${MOCK_SESSION.id}`);
  }, [router, triggerHaptic]);

  const handleModifySession = useCallback(() => {
    triggerHaptic('light');
    // Navigate to session editor
  }, [triggerHaptic]);

  const handleSkipToday = useCallback(() => {
    triggerHaptic('warning');
    // Show confirmation dialog
  }, [triggerHaptic]);

  const handleCompleteCheckIn = useCallback(() => {
    triggerHaptic('success');
    setCheckInCompleted(true);
  }, [triggerHaptic]);

  const readinessColor = READINESS_COLORS[MOCK_READINESS.status];

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 100,
        paddingHorizontal: 16,
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <YStack gap="$4">
        {/* Header */}
        <YStack gap="$1">
          <Text color="$colorHover" fontSize="$3">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <H2>Today</H2>
        </YStack>

        {/* Readiness Indicator */}
        <Card bordered padded elevate>
          <XStack alignItems="center" gap="$4">
            <Circle
              size={60}
              backgroundColor={readinessColor}
              opacity={0.15}
            >
              <Circle size={40} backgroundColor={readinessColor}>
                <Text color="white" fontWeight="700" fontSize="$4">
                  {MOCK_READINESS.status === 'good' ? 'OK' : MOCK_READINESS.status === 'moderate' ? 'M' : 'R'}
                </Text>
              </Circle>
            </Circle>
            <YStack flex={1}>
              <XStack alignItems="center" gap="$2">
                <Text fontWeight="600" fontSize="$5" color="$color">
                  Readiness: {MOCK_READINESS.label}
                </Text>
              </XStack>
              <Text color="$colorHover" fontSize="$3">
                {MOCK_READINESS.message}
              </Text>
              <XStack gap="$4" marginTop="$2">
                <Text fontSize="$2" color="$colorHover">
                  Sleep: {MOCK_READINESS.sleepHours}h
                </Text>
                <Text fontSize="$2" color="$colorHover">
                  HRV: {MOCK_READINESS.hrvStatus}
                </Text>
              </XStack>
            </YStack>
          </XStack>
        </Card>

        {/* Check-in Prompt */}
        {!checkInCompleted && (
          <Card bordered padded backgroundColor="$backgroundHover">
            <YStack gap="$3">
              <H3>Morning Check-in</H3>
              <Paragraph color="$colorHover">
                How is your body feeling today? Let me know so I can adjust your session.
              </Paragraph>
              <XStack gap="$3">
                <Button
                  flex={1}
                  backgroundColor="$primary"
                  color="white"
                  onPress={handleCompleteCheckIn}
                >
                  Same as Yesterday
                </Button>
                <Button
                  flex={1}
                  bordered
                  onPress={() => router.push('/body')}
                >
                  Update Body Map
                </Button>
              </XStack>
            </YStack>
          </Card>
        )}

        {/* Today's Session Preview */}
        <Card bordered padded elevate>
          <YStack gap="$4">
            <YStack gap="$2">
              <Text color="$colorHover" fontSize="$2" textTransform="uppercase" letterSpacing={1}>
                Today's Recovery Session
              </Text>
              <H3>{MOCK_SESSION.title}</H3>
            </YStack>

            <XStack gap="$6">
              <XStack alignItems="center" gap="$2">
                <Clock size={16} color="$colorHover" />
                <Text color="$colorHover">{MOCK_SESSION.duration} min</Text>
              </XStack>
              <XStack alignItems="center" gap="$2">
                <Dumbbell size={16} color="$colorHover" />
                <Text color="$colorHover">{MOCK_SESSION.exerciseCount} exercises</Text>
              </XStack>
            </XStack>

            <Separator />

            {/* Exercise Preview List */}
            <YStack gap="$2">
              {MOCK_SESSION.exercises.slice(0, 3).map((exercise, index) => (
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
              {MOCK_SESSION.exercises.length > 3 && (
                <Text color="$colorHover" fontSize="$2" textAlign="center" marginTop="$2">
                  +{MOCK_SESSION.exercises.length - 3} more exercises
                </Text>
              )}
            </YStack>

            <Separator />

            {/* Action Buttons */}
            <YStack gap="$3">
              <Button
                size="$5"
                backgroundColor="$primary"
                color="white"
                icon={Play}
                onPress={handleStartWorkout}
              >
                Start Session
              </Button>
              <XStack gap="$3">
                <Button
                  flex={1}
                  bordered
                  icon={Edit3}
                  onPress={handleModifySession}
                >
                  Modify
                </Button>
                <Button
                  flex={1}
                  bordered
                  icon={SkipForward}
                  onPress={handleSkipToday}
                >
                  Skip Today
                </Button>
              </XStack>
            </YStack>
          </YStack>
        </Card>

        {/* Focus Areas */}
        <Card bordered padded>
          <YStack gap="$3">
            <Text fontWeight="600" fontSize="$4">Focus Areas</Text>
            <XStack flexWrap="wrap" gap="$2">
              {MOCK_SESSION.focusAreas.map((area) => (
                <YStack
                  key={area}
                  backgroundColor="$backgroundHover"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius="$2"
                >
                  <Text fontSize="$3" color="$colorHover">
                    {area}
                  </Text>
                </YStack>
              ))}
            </XStack>
          </YStack>
        </Card>
      </YStack>
    </ScrollView>
  );
}
