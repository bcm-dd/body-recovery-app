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
  Input,
} from 'tamagui';
import { X, Check, Search, RefreshCw, Info } from '@tamagui/lucide-icons';

import { useHaptics } from '@/hooks/useHaptics';

// Mock current exercise data
const MOCK_CURRENT_EXERCISE = {
  id: '1',
  name: 'Cat-Cow Stretch',
  description: 'Gentle spine mobility exercise',
  targetMuscles: ['Lower Back', 'Core'],
};

// Mock alternative exercises
interface AlternativeExercise {
  id: string;
  name: string;
  reason: string;
  similarity: 'high' | 'medium';
  targetMuscles: string[];
  difficulty: 'easier' | 'similar' | 'harder';
}

const MOCK_ALTERNATIVES: AlternativeExercise[] = [
  {
    id: 'alt-1',
    name: "Child's Pose",
    reason: 'Gentler option with similar spine mobility',
    similarity: 'high',
    targetMuscles: ['Lower Back', 'Hips'],
    difficulty: 'easier',
  },
  {
    id: 'alt-2',
    name: 'Seated Spinal Twist',
    reason: 'Alternative approach with rotation focus',
    similarity: 'medium',
    targetMuscles: ['Lower Back', 'Core', 'Obliques'],
    difficulty: 'similar',
  },
  {
    id: 'alt-3',
    name: 'Pelvic Tilts',
    reason: 'Gentler option, less range of motion',
    similarity: 'high',
    targetMuscles: ['Lower Back', 'Core'],
    difficulty: 'easier',
  },
  {
    id: 'alt-4',
    name: 'Thread the Needle',
    reason: 'Adds upper back mobility component',
    similarity: 'medium',
    targetMuscles: ['Upper Back', 'Lower Back', 'Shoulders'],
    difficulty: 'similar',
  },
];

export default function SubstitutionScreen() {
  const router = useRouter();
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const insets = useSafeAreaInsets();
  const { triggerHaptic } = useHaptics();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  const currentExercise = MOCK_CURRENT_EXERCISE;
  const alternatives = MOCK_ALTERNATIVES.filter(
    (alt) =>
      searchQuery === '' ||
      alt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClose = useCallback(() => {
    triggerHaptic('light');
    router.back();
  }, [router, triggerHaptic]);

  const handleSelectAlternative = useCallback(
    (alternativeId: string) => {
      triggerHaptic('success');
      setSelectedAlternative(alternativeId);

      // Show confirmation and undo option
      setTimeout(() => {
        setShowUndo(true);
        // Auto-navigate back after showing undo
        setTimeout(() => {
          if (!showUndo) {
            router.back();
          }
        }, 100);
      }, 200);
    },
    [router, triggerHaptic, showUndo]
  );

  const handleUndo = useCallback(() => {
    triggerHaptic('selection');
    setSelectedAlternative(null);
    setShowUndo(false);
  }, [triggerHaptic]);

  const handleSearchAll = useCallback(() => {
    triggerHaptic('selection');
    // Navigate to full exercise library search
  }, [triggerHaptic]);

  const getDifficultyColor = (difficulty: AlternativeExercise['difficulty']) => {
    switch (difficulty) {
      case 'easier':
        return '#22C55E';
      case 'similar':
        return '#3B82F6';
      case 'harder':
        return '#F59E0B';
    }
  };

  const getDifficultyLabel = (difficulty: AlternativeExercise['difficulty']) => {
    switch (difficulty) {
      case 'easier':
        return 'Easier';
      case 'similar':
        return 'Similar';
      case 'harder':
        return 'More intense';
    }
  };

  return (
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
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Button
          size="$3"
          circular
          icon={X}
          backgroundColor="transparent"
          onPress={handleClose}
        />
        <H3>Swap Exercise</H3>
        <YStack width={40} />
      </XStack>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
      >
        <YStack gap="$4">
          {/* Current Exercise */}
          <Card bordered padded backgroundColor="$backgroundHover">
            <YStack gap="$2">
              <Text fontSize="$2" color="$colorHover">
                Current exercise
              </Text>
              <Text fontWeight="600" fontSize="$5">
                {currentExercise.name}
              </Text>
              <XStack flexWrap="wrap" gap="$2">
                {currentExercise.targetMuscles.map((muscle) => (
                  <YStack
                    key={muscle}
                    backgroundColor="$backgroundPress"
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                    borderRadius="$1"
                  >
                    <Text fontSize="$1" color="$colorHover">
                      {muscle}
                    </Text>
                  </YStack>
                ))}
              </XStack>
            </YStack>
          </Card>

          {/* Info Card */}
          <Card backgroundColor="$backgroundHover" padded>
            <XStack gap="$2" alignItems="flex-start">
              <Info size={16} color="$primary" />
              <Text fontSize="$2" color="$colorHover" flex={1}>
                These alternatives work similar muscles and respect your current constraints.
              </Text>
            </XStack>
          </Card>

          {/* Alternatives List */}
          <YStack gap="$3">
            <Text fontWeight="600" fontSize="$4">
              Recommended Alternatives
            </Text>

            {alternatives.map((alternative) => {
              const isSelected = selectedAlternative === alternative.id;

              return (
                <Card
                  key={alternative.id}
                  bordered
                  padded
                  backgroundColor={isSelected ? '$primary' : '$background'}
                  borderColor={isSelected ? '$primary' : '$borderColor'}
                  onPress={() => handleSelectAlternative(alternative.id)}
                  pressStyle={{ opacity: 0.8 }}
                >
                  <YStack gap="$3">
                    <XStack justifyContent="space-between" alignItems="flex-start">
                      <YStack flex={1} gap="$1">
                        <Text
                          fontWeight="600"
                          fontSize="$4"
                          color={isSelected ? 'white' : '$color'}
                        >
                          {alternative.name}
                        </Text>
                        <Text
                          fontSize="$2"
                          color={isSelected ? 'rgba(255,255,255,0.8)' : '$colorHover'}
                        >
                          {alternative.reason}
                        </Text>
                      </YStack>
                      {isSelected ? (
                        <Circle size={28} backgroundColor="white">
                          <Check size={16} color="$primary" />
                        </Circle>
                      ) : (
                        <YStack
                          backgroundColor={getDifficultyColor(alternative.difficulty)}
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                          borderRadius="$1"
                        >
                          <Text fontSize="$1" color="white">
                            {getDifficultyLabel(alternative.difficulty)}
                          </Text>
                        </YStack>
                      )}
                    </XStack>

                    <XStack flexWrap="wrap" gap="$2">
                      {alternative.targetMuscles.map((muscle) => (
                        <YStack
                          key={muscle}
                          backgroundColor={isSelected ? 'rgba(255,255,255,0.2)' : '$backgroundHover'}
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                          borderRadius="$1"
                        >
                          <Text
                            fontSize="$1"
                            color={isSelected ? 'white' : '$colorHover'}
                          >
                            {muscle}
                          </Text>
                        </YStack>
                      ))}
                    </XStack>
                  </YStack>
                </Card>
              );
            })}
          </YStack>

          {/* Search All Exercises */}
          <Separator marginVertical="$2" />

          <Button
            size="$4"
            icon={Search}
            backgroundColor="transparent"
            borderWidth={1}
            borderColor="$borderColor"
            onPress={handleSearchAll}
          >
            Search All Exercises
          </Button>
        </YStack>
      </ScrollView>

      {/* Undo Toast */}
      {showUndo && selectedAlternative && (
        <YStack
          position="absolute"
          bottom={insets.bottom + 20}
          left={16}
          right={16}
        >
          <Card
            backgroundColor="$color"
            padded
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <XStack alignItems="center" gap="$2" flex={1}>
              <Check size={18} color="$background" />
              <Text color="$background" flex={1}>
                Exercise swapped to{' '}
                {alternatives.find((a) => a.id === selectedAlternative)?.name}
              </Text>
            </XStack>
            <Button
              size="$2"
              backgroundColor="transparent"
              color="$primary"
              onPress={handleUndo}
            >
              Undo
            </Button>
          </Card>
        </YStack>
      )}
    </YStack>
  );
}
