import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack, XStack, Text, Button, H2, Paragraph, Circle, Card } from 'tamagui';
import { Crosshair, Heart, Shield, Check } from '@tamagui/lucide-icons';

import { useHaptics } from '@/hooks/useHaptics';

type FocusOption = 'injury' | 'chronic' | 'prevention';

interface FocusChoice {
  id: FocusOption;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FOCUS_OPTIONS: FocusChoice[] = [
  {
    id: 'injury',
    icon: <Crosshair size={24} color="$primary" />,
    title: 'Recovering from injury or pain',
    description: 'Active issues that need targeted attention',
  },
  {
    id: 'chronic',
    icon: <Heart size={24} color="$primary" />,
    title: 'Managing a chronic condition',
    description: 'Ongoing support for persistent conditions',
  },
  {
    id: 'prevention',
    icon: <Shield size={24} color="$primary" />,
    title: 'Maintaining mobility',
    description: 'Preventing future issues and staying flexible',
  },
];

export default function FocusSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { triggerHaptic } = useHaptics();
  const [selectedFocus, setSelectedFocus] = useState<FocusOption | null>(null);

  const handleSelectFocus = useCallback(
    (focus: FocusOption) => {
      triggerHaptic('selection');
      setSelectedFocus(focus);
    },
    [triggerHaptic]
  );

  const handleContinue = useCallback(() => {
    if (!selectedFocus) return;
    triggerHaptic('success');
    router.push('/onboarding/body-map');
  }, [router, selectedFocus, triggerHaptic]);

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      paddingHorizontal="$4"
      paddingTop={insets.top + 20}
      paddingBottom={insets.bottom + 20}
    >
      <YStack flex={1} gap="$6">
        {/* Progress indicator */}
        <XStack gap="$2" justifyContent="center">
          {[1, 2, 3, 4].map((step) => (
            <Circle
              key={step}
              size={8}
              backgroundColor={step <= 2 ? '$primary' : '$backgroundPress'}
            />
          ))}
        </XStack>

        <YStack gap="$3">
          <H2>What brings you here?</H2>
          <Paragraph color="$colorHover" fontSize="$4">
            This helps me understand your needs and personalize your recovery sessions.
          </Paragraph>
        </YStack>

        {/* Focus options */}
        <YStack gap="$3">
          {FOCUS_OPTIONS.map((option) => {
            const isSelected = selectedFocus === option.id;
            return (
              <Card
                key={option.id}
                bordered
                padded
                backgroundColor={isSelected ? '$backgroundHover' : '$background'}
                borderColor={isSelected ? '$primary' : '$borderColor'}
                borderWidth={isSelected ? 2 : 1}
                onPress={() => handleSelectFocus(option.id)}
                pressStyle={{ opacity: 0.8 }}
              >
                <XStack alignItems="center" gap="$3">
                  <Circle
                    size={48}
                    backgroundColor={isSelected ? '$primary' : '$backgroundHover'}
                    opacity={isSelected ? 0.15 : 1}
                  >
                    {isSelected ? (
                      <Circle size={32} backgroundColor="$primary">
                        <Check size={18} color="white" />
                      </Circle>
                    ) : (
                      option.icon
                    )}
                  </Circle>
                  <YStack flex={1}>
                    <Text fontWeight="600" fontSize="$4">
                      {option.title}
                    </Text>
                    <Text fontSize="$2" color="$colorHover">
                      {option.description}
                    </Text>
                  </YStack>
                </XStack>
              </Card>
            );
          })}
        </YStack>
      </YStack>

      <Button
        size="$5"
        backgroundColor={selectedFocus ? '$primary' : '$backgroundPress'}
        color={selectedFocus ? 'white' : '$colorHover'}
        onPress={handleContinue}
        disabled={!selectedFocus}
      >
        Continue
      </Button>
    </YStack>
  );
}
