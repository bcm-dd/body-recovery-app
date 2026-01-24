import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack, Text, Button, H1, Paragraph, Image } from 'tamagui';

import { useHaptics } from '@/hooks/useHaptics';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { triggerHaptic } = useHaptics();

  const handleGetStarted = useCallback(() => {
    triggerHaptic('selection');
    router.push('/onboarding/health');
  }, [router, triggerHaptic]);

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      paddingHorizontal="$4"
      paddingTop={insets.top + 60}
      paddingBottom={insets.bottom + 40}
    >
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$6">
        {/* App Icon/Illustration placeholder */}
        <YStack
          width={120}
          height={120}
          borderRadius={30}
          backgroundColor="$primary"
          alignItems="center"
          justifyContent="center"
          opacity={0.9}
        >
          <Text color="white" fontSize={60}>
            B
          </Text>
        </YStack>

        <YStack alignItems="center" gap="$3">
          <H1 textAlign="center">Body Recovery{'\n'}Companion</H1>
          <Paragraph
            textAlign="center"
            color="$colorHover"
            fontSize="$4"
            maxWidth={300}
          >
            Personalized recovery routines that adapt to how your body feels each day.
          </Paragraph>
        </YStack>
      </YStack>

      <YStack gap="$4">
        <Button
          size="$5"
          backgroundColor="$primary"
          color="white"
          onPress={handleGetStarted}
        >
          Get Started
        </Button>

        <Text textAlign="center" fontSize="$2" color="$colorHover">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </YStack>
    </YStack>
  );
}
