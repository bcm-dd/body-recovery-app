import { Link, Stack } from 'expo-router';
import { YStack, Text, Button } from 'tamagui';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$4" gap="$4">
        <Text fontSize="$8" fontWeight="600" color="$color">
          Page Not Found
        </Text>
        <Text fontSize="$4" color="$colorHover" textAlign="center">
          The page you're looking for doesn't exist.
        </Text>
        <Link href="/" asChild>
          <Button
            backgroundColor="$primary"
            color="white"
            paddingHorizontal="$6"
            paddingVertical="$3"
            borderRadius="$3"
          >
            Go to Home
          </Button>
        </Link>
      </YStack>
    </>
  );
}
