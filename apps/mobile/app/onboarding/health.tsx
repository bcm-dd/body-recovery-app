import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack, XStack, Text, Button, H2, Paragraph, Circle, Card } from 'tamagui';
import { Heart, Moon, Activity, ChevronRight } from '@tamagui/lucide-icons';

import { useHaptics } from '@/hooks/useHaptics';

export default function HealthPermissionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { triggerHaptic } = useHaptics();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectHealth = useCallback(async () => {
    triggerHaptic('selection');
    setIsConnecting(true);

    // Simulate health permission request
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsConnecting(false);
    triggerHaptic('success');
    router.push('/onboarding/focus');
  }, [router, triggerHaptic]);

  const handleSkip = useCallback(() => {
    triggerHaptic('light');
    router.push('/onboarding/focus');
  }, [router, triggerHaptic]);

  const benefits = [
    {
      icon: <Moon size={20} color="$primary" />,
      title: 'Sleep Data',
      description: 'Adjust intensity based on how well you slept',
    },
    {
      icon: <Heart size={20} color="$primary" />,
      title: 'Heart Rate Variability',
      description: 'Know when to push and when to take it easy',
    },
    {
      icon: <Activity size={20} color="$primary" />,
      title: 'Activity',
      description: 'Balance recovery with your daily activity',
    },
  ];

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
              backgroundColor={step === 1 ? '$primary' : '$backgroundPress'}
            />
          ))}
        </XStack>

        <YStack gap="$3">
          <H2>Connect Health Data</H2>
          <Paragraph color="$colorHover" fontSize="$4">
            I'll use your sleep and heart data to know when to push and when to take it easy.
          </Paragraph>
        </YStack>

        {/* Benefits list */}
        <YStack gap="$3">
          {benefits.map((benefit, index) => (
            <Card key={index} bordered padded>
              <XStack alignItems="center" gap="$3">
                <Circle size={40} backgroundColor="$backgroundHover">
                  {benefit.icon}
                </Circle>
                <YStack flex={1}>
                  <Text fontWeight="600">{benefit.title}</Text>
                  <Text fontSize="$2" color="$colorHover">
                    {benefit.description}
                  </Text>
                </YStack>
              </XStack>
            </Card>
          ))}
        </YStack>

        {/* Privacy note */}
        <Card backgroundColor="$backgroundHover" padded>
          <Text fontSize="$2" color="$colorHover" textAlign="center">
            Your health data stays on your device and is only used to personalize your recovery
            sessions. We never share it with third parties.
          </Text>
        </Card>
      </YStack>

      <YStack gap="$3">
        <Button
          size="$5"
          backgroundColor="$primary"
          color="white"
          onPress={handleConnectHealth}
          disabled={isConnecting}
          icon={isConnecting ? undefined : <Heart size={20} />}
        >
          {isConnecting ? 'Connecting...' : 'Connect Health Data'}
        </Button>

        <Button
          size="$4"
          backgroundColor="transparent"
          color="$colorHover"
          onPress={handleSkip}
        >
          Maybe Later
        </Button>
      </YStack>
    </YStack>
  );
}
