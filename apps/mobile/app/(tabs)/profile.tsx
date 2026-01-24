import { useCallback } from 'react';
import { ScrollView, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  YStack,
  XStack,
  Text,
  Card,
  H2,
  H3,
  Button,
  Separator,
  Switch,
  Circle,
} from 'tamagui';
import {
  User,
  Bell,
  Clock,
  Activity,
  Heart,
  Shield,
  HelpCircle,
  Info,
  ChevronRight,
  LogOut,
  Check,
  AlertCircle,
} from '@tamagui/lucide-icons';

import { useHaptics } from '@/hooks/useHaptics';

// Mock user data
const MOCK_USER = {
  name: 'Alex',
  email: 'alex@example.com',
  memberSince: new Date(2025, 10, 15),
};

// Mock preferences
const MOCK_PREFERENCES = {
  sessionDuration: 20,
  preferredTime: '7:30 AM',
  reminderEnabled: true,
  eveningReminderEnabled: false,
  healthKitConnected: true,
  healthConnectConnected: false,
};

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function SettingsRow({ icon, label, value, onPress, rightElement, danger }: SettingsRowProps) {
  return (
    <XStack
      alignItems="center"
      gap="$3"
      paddingVertical="$3"
      onPress={onPress}
      pressStyle={onPress ? { opacity: 0.7 } : undefined}
    >
      <Circle size={36} backgroundColor="$backgroundHover">
        {icon}
      </Circle>
      <YStack flex={1}>
        <Text color={danger ? '$error' : '$color'} fontWeight="500">
          {label}
        </Text>
        {value && (
          <Text fontSize="$2" color="$colorHover">
            {value}
          </Text>
        )}
      </YStack>
      {rightElement || (onPress && <ChevronRight size={20} color="$colorHover" />)}
    </XStack>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { triggerHaptic } = useHaptics();

  const handleToggleReminder = useCallback(
    (enabled: boolean) => {
      triggerHaptic('selection');
      // Toggle reminder
    },
    [triggerHaptic]
  );

  const handleConnectHealth = useCallback(() => {
    triggerHaptic('selection');
    Alert.alert(
      'Connect Health Data',
      'This will request access to your sleep and heart rate data to personalize your recovery sessions.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Connect', onPress: () => {} },
      ]
    );
  }, [triggerHaptic]);

  const handleLogout = useCallback(() => {
    triggerHaptic('warning');
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => {} },
    ]);
  }, [triggerHaptic]);

  const handleOpenPrivacy = useCallback(() => {
    triggerHaptic('light');
    Linking.openURL('https://example.com/privacy');
  }, [triggerHaptic]);

  const handleOpenTerms = useCallback(() => {
    triggerHaptic('light');
    Linking.openURL('https://example.com/terms');
  }, [triggerHaptic]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 100,
        paddingHorizontal: 16,
      }}
    >
      <YStack gap="$4">
        {/* Header */}
        <YStack gap="$1">
          <Text color="$colorHover" fontSize="$3">
            Settings
          </Text>
          <H2>Profile</H2>
        </YStack>

        {/* User Card */}
        <Card bordered padded>
          <XStack alignItems="center" gap="$4">
            <Circle size={60} backgroundColor="$primary">
              <Text color="white" fontSize="$6" fontWeight="700">
                {MOCK_USER.name.charAt(0)}
              </Text>
            </Circle>
            <YStack flex={1}>
              <Text fontWeight="600" fontSize="$5">
                {MOCK_USER.name}
              </Text>
              <Text color="$colorHover" fontSize="$3">
                {MOCK_USER.email}
              </Text>
              <Text color="$colorHover" fontSize="$2" marginTop="$1">
                Member since{' '}
                {MOCK_USER.memberSince.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </YStack>
          </XStack>
        </Card>

        {/* Session Preferences */}
        <Card bordered padded>
          <YStack gap="$2">
            <H3>Session Preferences</H3>
            <Separator marginVertical="$2" />

            <SettingsRow
              icon={<Clock size={18} color="$colorHover" />}
              label="Session Duration"
              value={`${MOCK_PREFERENCES.sessionDuration} minutes`}
              onPress={() => triggerHaptic('selection')}
            />

            <SettingsRow
              icon={<Activity size={18} color="$colorHover" />}
              label="Intensity Level"
              value="Moderate"
              onPress={() => triggerHaptic('selection')}
            />

            <SettingsRow
              icon={<Clock size={18} color="$colorHover" />}
              label="Preferred Time"
              value={MOCK_PREFERENCES.preferredTime}
              onPress={() => triggerHaptic('selection')}
            />
          </YStack>
        </Card>

        {/* Notifications */}
        <Card bordered padded>
          <YStack gap="$2">
            <H3>Notifications</H3>
            <Separator marginVertical="$2" />

            <SettingsRow
              icon={<Bell size={18} color="$colorHover" />}
              label="Morning Reminder"
              value={MOCK_PREFERENCES.preferredTime}
              rightElement={
                <Switch
                  checked={MOCK_PREFERENCES.reminderEnabled}
                  onCheckedChange={handleToggleReminder}
                  backgroundColor={MOCK_PREFERENCES.reminderEnabled ? '$primary' : '$backgroundPress'}
                >
                  <Switch.Thumb animation="quick" backgroundColor="white" />
                </Switch>
              }
            />

            <SettingsRow
              icon={<Bell size={18} color="$colorHover" />}
              label="Evening Reminder"
              value="If session incomplete"
              rightElement={
                <Switch
                  checked={MOCK_PREFERENCES.eveningReminderEnabled}
                  onCheckedChange={handleToggleReminder}
                  backgroundColor={MOCK_PREFERENCES.eveningReminderEnabled ? '$primary' : '$backgroundPress'}
                >
                  <Switch.Thumb animation="quick" backgroundColor="white" />
                </Switch>
              }
            />
          </YStack>
        </Card>

        {/* Health Data */}
        <Card bordered padded>
          <YStack gap="$2">
            <H3>Health Data</H3>
            <Separator marginVertical="$2" />

            <SettingsRow
              icon={<Heart size={18} color="$colorHover" />}
              label="Apple Health"
              value={MOCK_PREFERENCES.healthKitConnected ? 'Connected' : 'Not connected'}
              rightElement={
                MOCK_PREFERENCES.healthKitConnected ? (
                  <Circle size={24} backgroundColor="$success">
                    <Check size={14} color="white" />
                  </Circle>
                ) : (
                  <Button size="$2" backgroundColor="$primary" color="white" onPress={handleConnectHealth}>
                    Connect
                  </Button>
                )
              }
            />

            <Text fontSize="$2" color="$colorHover" paddingLeft="$11">
              Used to personalize recovery based on your sleep and HRV data.
            </Text>
          </YStack>
        </Card>

        {/* Privacy & Support */}
        <Card bordered padded>
          <YStack gap="$2">
            <H3>Privacy & Support</H3>
            <Separator marginVertical="$2" />

            <SettingsRow
              icon={<Shield size={18} color="$colorHover" />}
              label="Privacy Policy"
              onPress={handleOpenPrivacy}
            />

            <SettingsRow
              icon={<Info size={18} color="$colorHover" />}
              label="Terms of Service"
              onPress={handleOpenTerms}
            />

            <SettingsRow
              icon={<HelpCircle size={18} color="$colorHover" />}
              label="Help & Support"
              onPress={() => triggerHaptic('selection')}
            />
          </YStack>
        </Card>

        {/* About */}
        <Card bordered padded>
          <YStack gap="$2">
            <H3>About</H3>
            <Separator marginVertical="$2" />

            <YStack gap="$2" paddingVertical="$2">
              <Text fontSize="$3" fontWeight="600">
                Body Recovery Companion
              </Text>
              <Text fontSize="$2" color="$colorHover">
                Version 1.0.0
              </Text>
            </YStack>

            <Separator marginVertical="$2" />

            <XStack gap="$2" alignItems="flex-start" padding="$2" backgroundColor="$backgroundHover" borderRadius="$2">
              <AlertCircle size={16} color="$colorHover" />
              <Text fontSize="$2" color="$colorHover" flex={1}>
                This app provides guided self-care exercises and is not a substitute for professional medical advice.
                Always consult a healthcare provider for medical concerns.
              </Text>
            </XStack>
          </YStack>
        </Card>

        {/* Sign Out */}
        <Card bordered padded>
          <SettingsRow
            icon={<LogOut size={18} color="$error" />}
            label="Sign Out"
            onPress={handleLogout}
            danger
          />
        </Card>
      </YStack>
    </ScrollView>
  );
}
