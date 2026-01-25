import React, { useEffect, useState, useCallback, useRef } from 'react';
import { YStack, XStack, Text, Button, Circle } from 'tamagui';
import { SkipForward, Plus } from '@tamagui/lucide-icons';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useHaptics } from '@/hooks/useHaptics';

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);

interface RestTimerProps {
  duration: number; // seconds
  onComplete: () => void;
  onSkip?: () => void;
  nextExerciseName?: string;
}

/**
 * Circular rest timer with animated progress ring
 */
export function RestTimer({
  duration,
  onComplete,
  onSkip,
  nextExerciseName,
}: RestTimerProps) {
  const { triggerHaptic } = useHaptics();
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animated progress
  const progress = useSharedValue(1);
  const circumference = 2 * Math.PI * 80; // radius of 80

  useEffect(() => {
    // Animate the ring
    progress.value = withTiming(0, {
      duration: duration * 1000,
      easing: Easing.linear,
    });
  }, [duration, progress]);

  useEffect(() => {
    if (!isPaused && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;

          // 10 second warning haptic
          if (newTime === 10) {
            triggerHaptic('timerWarning');
          }

          // Timer complete
          if (newTime <= 0) {
            triggerHaptic('timerEnd');
            onComplete();
            return 0;
          }

          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeRemaining, isPaused, onComplete, triggerHaptic]);

  const handleSkip = useCallback(() => {
    triggerHaptic('selection');
    onSkip?.();
    onComplete();
  }, [onSkip, onComplete, triggerHaptic]);

  const handleAddTime = useCallback(() => {
    triggerHaptic('light');
    setTimeRemaining((prev) => prev + 30);
  }, [triggerHaptic]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * progress.value,
  }));

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}`;
  };

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" gap="$6">
      <Text fontSize="$3" color="$colorHover" textTransform="uppercase" letterSpacing={2}>
        Rest
      </Text>

      {/* Timer Circle */}
      <YStack alignItems="center" justifyContent="center">
        <Svg width={200} height={200} style={{ transform: [{ rotate: '-90deg' }] }}>
          {/* Background circle */}
          <SvgCircle
            cx={100}
            cy={100}
            r={80}
            stroke="#374151"
            strokeWidth={8}
            fill="transparent"
          />
          {/* Progress circle */}
          <AnimatedCircle
            cx={100}
            cy={100}
            r={80}
            stroke="#3B82F6"
            strokeWidth={8}
            fill="transparent"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </Svg>

        {/* Time display (positioned absolutely in center) */}
        <YStack
          position="absolute"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize={56} fontWeight="700" color="$color">
            {formatTime(timeRemaining)}
          </Text>
        </YStack>
      </YStack>

      {/* Next exercise preview */}
      {nextExerciseName && (
        <YStack alignItems="center" gap="$1">
          <Text fontSize="$2" color="$colorHover">
            Next up
          </Text>
          <Text fontSize="$4" fontWeight="600" color="$color">
            {nextExerciseName}
          </Text>
        </YStack>
      )}

      {/* Controls */}
      <XStack gap="$4">
        <Button
          size="$4"
          icon={SkipForward}
          backgroundColor="$backgroundHover"
          onPress={handleSkip}
        >
          Skip
        </Button>
        <Button
          size="$4"
          icon={Plus}
          backgroundColor="$backgroundHover"
          onPress={handleAddTime}
        >
          +30s
        </Button>
      </XStack>
    </YStack>
  );
}

export default RestTimer;
