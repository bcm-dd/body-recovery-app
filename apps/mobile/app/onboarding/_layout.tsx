import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="health" />
      <Stack.Screen name="focus" />
      <Stack.Screen name="body-map" />
      <Stack.Screen name="first-session" />
    </Stack>
  );
}
