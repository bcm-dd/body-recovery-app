import { useState, useCallback, useEffect, useRef } from 'react';
import { Dimensions, Animated, PanResponder } from 'react-native';
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
  Sheet,
  Separator,
} from 'tamagui';
import {
  X,
  Pause,
  Play,
  SkipForward,
  RefreshCw,
  MoreHorizontal,
  AlertCircle,
  Check,
} from '@tamagui/lucide-icons';
import * as Haptics from 'expo-haptics';

import { useHaptics } from '@/hooks/useHaptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock workout data
const MOCK_WORKOUT = {
  id: 'session-1',
  title: 'Lower Back & Hip Recovery',
  exercises: [
    {
      id: '1',
      name: 'Cat-Cow Stretch',
      description: 'Gentle spine mobility exercise',
      cues: ['Start on hands and knees', 'Inhale, arch back', 'Exhale, round spine'],
      sets: 3,
      reps: 10,
      restSeconds: 30,
      videoPlaceholder: true,
    },
    {
      id: '2',
      name: 'Hip Circles',
      description: 'Loosen up your hip joints',
      cues: ['Stand on one leg', 'Draw circles with knee', 'Keep core engaged'],
      sets: 2,
      reps: 10,
      restSeconds: 20,
      videoPlaceholder: true,
    },
    {
      id: '3',
      name: "Child's Pose",
      description: 'Full body relaxation',
      cues: ['Knees wide, big toes together', 'Reach arms forward', 'Breathe deeply'],
      sets: 2,
      duration: 30,
      restSeconds: 15,
      videoPlaceholder: true,
    },
    {
      id: '4',
      name: 'Piriformis Stretch',
      description: 'Target the deep hip rotators',
      cues: ['Lie on back', 'Cross ankle over knee', 'Pull thigh toward chest'],
      sets: 3,
      duration: 30,
      restSeconds: 20,
      videoPlaceholder: true,
    },
    {
      id: '5',
      name: 'Pelvic Tilts',
      description: 'Activate deep core muscles',
      cues: ['Lie on back, knees bent', 'Flatten lower back', 'Release and repeat'],
      sets: 3,
      reps: 15,
      restSeconds: 20,
      videoPlaceholder: true,
    },
    {
      id: '6',
      name: 'Glute Bridge',
      description: 'Strengthen posterior chain',
      cues: ['Lie on back, feet flat', 'Drive through heels', 'Squeeze glutes at top'],
      sets: 3,
      reps: 12,
      restSeconds: 30,
      videoPlaceholder: true,
    },
  ],
};

type WorkoutPhase = 'exercise' | 'rest' | 'complete';

export default function WorkoutExecutionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { triggerHaptic } = useHaptics();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<Map<string, number[]>>(new Map());
  const [phase, setPhase] = useState<WorkoutPhase>('exercise');
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [painLogOpen, setPainLogOpen] = useState(false);

  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const swipeAnim = useRef(new Animated.Value(0)).current;

  const workout = MOCK_WORKOUT;
  const currentExercise = workout.exercises[currentExerciseIndex];
  const totalExercises = workout.exercises.length;
  const exerciseCompletedSets = completedSets.get(currentExercise?.id || '') || [];

  // Pan responder for swipe-to-log-pain
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dx < -30 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          swipeAnim.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -100) {
          triggerHaptic('warning');
          setPainLogOpen(true);
        }
        Animated.spring(swipeAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  // Rest timer effect
  useEffect(() => {
    if (phase === 'rest' && restTimeRemaining > 0 && !isPaused) {
      restTimerRef.current = setTimeout(() => {
        setRestTimeRemaining((prev) => {
          if (prev <= 1) {
            triggerHaptic('success');
            setPhase('exercise');
            return 0;
          }
          if (prev === 11) {
            triggerHaptic('light'); // 10 second warning
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (restTimerRef.current) {
        clearTimeout(restTimerRef.current);
      }
    };
  }, [phase, restTimeRemaining, isPaused, triggerHaptic]);

  const handleCompleteSet = useCallback(() => {
    if (!currentExercise) return;

    triggerHaptic('setComplete');

    const newCompletedSets = new Map(completedSets);
    const exerciseSets = newCompletedSets.get(currentExercise.id) || [];
    exerciseSets.push(Date.now());
    newCompletedSets.set(currentExercise.id, exerciseSets);
    setCompletedSets(newCompletedSets);

    const isLastSet = exerciseSets.length >= currentExercise.sets;

    if (isLastSet) {
      // Move to next exercise
      triggerHaptic('exerciseComplete');

      if (currentExerciseIndex >= totalExercises - 1) {
        // Workout complete
        setPhase('complete');
        router.replace(`/workout/summary/${id}`);
      } else {
        // Start rest then next exercise
        setPhase('rest');
        setRestTimeRemaining(currentExercise.restSeconds);
        setCurrentSetIndex(0);
        setCurrentExerciseIndex((prev) => prev + 1);
      }
    } else {
      // Rest between sets
      setPhase('rest');
      setRestTimeRemaining(currentExercise.restSeconds);
      setCurrentSetIndex((prev) => prev + 1);
    }
  }, [currentExercise, completedSets, currentExerciseIndex, totalExercises, id, router, triggerHaptic]);

  const handleSkipRest = useCallback(() => {
    triggerHaptic('selection');
    setRestTimeRemaining(0);
    setPhase('exercise');
  }, [triggerHaptic]);

  const handleAddRestTime = useCallback(() => {
    triggerHaptic('light');
    setRestTimeRemaining((prev) => prev + 30);
  }, [triggerHaptic]);

  const handlePauseResume = useCallback(() => {
    triggerHaptic('selection');
    setIsPaused((prev) => !prev);
  }, [triggerHaptic]);

  const handleSwapExercise = useCallback(() => {
    triggerHaptic('selection');
    setMenuOpen(false);
    router.push(`/substitution/${currentExercise?.id}`);
  }, [currentExercise?.id, router, triggerHaptic]);

  const handleEndWorkout = useCallback(() => {
    triggerHaptic('warning');
    setMenuOpen(false);
    router.replace(`/workout/summary/${id}`);
  }, [id, router, triggerHaptic]);

  const handleClose = useCallback(() => {
    triggerHaptic('light');
    router.back();
  }, [router, triggerHaptic]);

  const progressPercentage =
    totalExercises > 0 ? ((currentExerciseIndex + 1) / totalExercises) * 100 : 0;

  if (!currentExercise) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text>Loading workout...</Text>
      </YStack>
    );
  }

  return (
    <>
      <YStack
        flex={1}
        backgroundColor="$background"
        paddingTop={insets.top}
        paddingBottom={insets.bottom}
      >
        {/* Header */}
        <XStack
          paddingHorizontal="$4"
          paddingVertical="$3"
          alignItems="center"
          justifyContent="space-between"
        >
          <Button
            size="$3"
            circular
            icon={X}
            backgroundColor="transparent"
            onPress={handleClose}
          />
          <YStack alignItems="center">
            <Text fontSize="$2" color="$colorHover">
              Exercise {currentExerciseIndex + 1} of {totalExercises}
            </Text>
            {/* Progress bar */}
            <XStack width={120} height={4} backgroundColor="$backgroundPress" borderRadius="$1" marginTop="$1">
              <XStack
                width={`${progressPercentage}%`}
                height={4}
                backgroundColor="$primary"
                borderRadius="$1"
              />
            </XStack>
          </YStack>
          <Button
            size="$3"
            circular
            icon={MoreHorizontal}
            backgroundColor="transparent"
            onPress={() => setMenuOpen(true)}
          />
        </XStack>

        {/* Main content */}
        <YStack flex={1} paddingHorizontal="$4">
          {phase === 'rest' ? (
            // Rest Timer View
            <YStack flex={1} alignItems="center" justifyContent="center" gap="$6">
              <Text fontSize="$3" color="$colorHover">
                Rest
              </Text>
              <Circle size={180} borderWidth={8} borderColor="$primary">
                <Text fontSize={60} fontWeight="700">
                  {restTimeRemaining}
                </Text>
              </Circle>
              <Text color="$colorHover">
                Next: {workout.exercises[currentExerciseIndex]?.name}
              </Text>
              <XStack gap="$4">
                <Button icon={SkipForward} onPress={handleSkipRest}>
                  Skip
                </Button>
                <Button icon={Play} onPress={handleAddRestTime}>
                  +30s
                </Button>
              </XStack>
            </YStack>
          ) : (
            // Exercise View
            <Animated.View
              style={{ flex: 1, transform: [{ translateX: swipeAnim }] }}
              {...panResponder.panHandlers}
            >
              <YStack flex={1} gap="$4">
                {/* Exercise name */}
                <YStack gap="$1">
                  <H2>{currentExercise.name}</H2>
                  <Text color="$colorHover">{currentExercise.description}</Text>
                </YStack>

                {/* Video placeholder */}
                <Card
                  flex={1}
                  maxHeight={300}
                  backgroundColor="$backgroundHover"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="$4"
                >
                  <YStack alignItems="center" gap="$2">
                    <Circle size={60} backgroundColor="$backgroundPress">
                      <Play size={24} color="$colorHover" />
                    </Circle>
                    <Text color="$colorHover">Video Demo</Text>
                  </YStack>
                </Card>

                {/* Prescription */}
                <XStack justifyContent="center" gap="$6">
                  {currentExercise.reps && (
                    <YStack alignItems="center">
                      <Text fontSize="$6" fontWeight="700">
                        {currentExercise.reps}
                      </Text>
                      <Text color="$colorHover">reps</Text>
                    </YStack>
                  )}
                  {currentExercise.duration && (
                    <YStack alignItems="center">
                      <Text fontSize="$6" fontWeight="700">
                        {currentExercise.duration}s
                      </Text>
                      <Text color="$colorHover">hold</Text>
                    </YStack>
                  )}
                </XStack>

                {/* Set indicators */}
                <XStack justifyContent="center" gap="$3">
                  {Array.from({ length: currentExercise.sets }).map((_, index) => {
                    const isCompleted = index < exerciseCompletedSets.length;
                    const isCurrent = index === exerciseCompletedSets.length;

                    return (
                      <Circle
                        key={index}
                        size={40}
                        backgroundColor={isCompleted ? '$success' : 'transparent'}
                        borderWidth={2}
                        borderColor={isCurrent ? '$primary' : isCompleted ? '$success' : '$borderColor'}
                      >
                        {isCompleted ? (
                          <Check size={20} color="white" />
                        ) : (
                          <Text color={isCurrent ? '$primary' : '$colorHover'}>
                            {index + 1}
                          </Text>
                        )}
                      </Circle>
                    );
                  })}
                </XStack>

                {/* Swipe hint */}
                <XStack justifyContent="center" alignItems="center" gap="$2" opacity={0.5}>
                  <AlertCircle size={14} />
                  <Text fontSize="$1" color="$colorHover">
                    Swipe left to log pain
                  </Text>
                </XStack>
              </YStack>
            </Animated.View>
          )}
        </YStack>

        {/* Complete Set Button */}
        {phase === 'exercise' && (
          <YStack paddingHorizontal="$4" paddingVertical="$4">
            <Button
              size="$6"
              backgroundColor="$primary"
              color="white"
              onPress={handleCompleteSet}
            >
              Complete Set
            </Button>
          </YStack>
        )}
      </YStack>

      {/* Quick Menu Sheet */}
      <Sheet
        modal
        open={menuOpen}
        onOpenChange={setMenuOpen}
        snapPoints={[40]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$4">
          <Sheet.Handle />
          <YStack gap="$3" marginTop="$4">
            <Button
              size="$5"
              icon={isPaused ? Play : Pause}
              backgroundColor="$backgroundHover"
              onPress={handlePauseResume}
            >
              {isPaused ? 'Resume Workout' : 'Pause Workout'}
            </Button>
            <Button
              size="$5"
              icon={RefreshCw}
              backgroundColor="$backgroundHover"
              onPress={handleSwapExercise}
            >
              Swap This Exercise
            </Button>
            <Separator />
            <Button
              size="$5"
              icon={X}
              backgroundColor="$error"
              color="white"
              onPress={handleEndWorkout}
            >
              End Workout Early
            </Button>
          </YStack>
        </Sheet.Frame>
      </Sheet>

      {/* Pain Log Sheet */}
      <Sheet
        modal
        open={painLogOpen}
        onOpenChange={setPainLogOpen}
        snapPoints={[50]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$4">
          <Sheet.Handle />
          <YStack gap="$4" marginTop="$4">
            <H3>Something feel off?</H3>
            <Text color="$colorHover">
              Log any discomfort and I'll adjust the session or suggest an alternative.
            </Text>
            <YStack gap="$3">
              <Button
                size="$5"
                backgroundColor="#FCD34D"
                color="black"
                onPress={() => setPainLogOpen(false)}
              >
                Mild Discomfort
              </Button>
              <Button
                size="$5"
                backgroundColor="#F97316"
                color="white"
                onPress={() => setPainLogOpen(false)}
              >
                Moderate Pain
              </Button>
              <Button
                size="$5"
                backgroundColor="#EF4444"
                color="white"
                onPress={() => {
                  setPainLogOpen(false);
                  handleSwapExercise();
                }}
              >
                Severe - Swap Exercise
              </Button>
            </YStack>
            <Button variant="outlined" onPress={() => setPainLogOpen(false)}>
              Cancel
            </Button>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
