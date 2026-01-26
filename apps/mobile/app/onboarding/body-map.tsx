import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  YStack,
  XStack,
  Text,
  Button,
  H2,
  Paragraph,
  Circle,
  Card,
  Sheet,
} from 'tamagui';
import Svg, { Path, Circle as SvgCircle, G } from 'react-native-svg';

import { useHaptics } from '@/hooks/useHaptics';

type PainSeverity = 'mild' | 'moderate' | 'severe';
type BodyRegion =
  | 'head'
  | 'neck'
  | 'leftShoulder'
  | 'rightShoulder'
  | 'upperBack'
  | 'lowerBack'
  | 'leftArm'
  | 'rightArm'
  | 'leftHip'
  | 'rightHip'
  | 'leftKnee'
  | 'rightKnee';

interface BodyIssue {
  region: BodyRegion;
  severity: PainSeverity;
}

const SEVERITY_COLORS: Record<PainSeverity, string> = {
  mild: '#FCD34D',
  moderate: '#F97316',
  severe: '#EF4444',
};

const REGION_LABELS: Record<BodyRegion, string> = {
  head: 'Head',
  neck: 'Neck',
  leftShoulder: 'Left Shoulder',
  rightShoulder: 'Right Shoulder',
  upperBack: 'Upper Back',
  lowerBack: 'Lower Back',
  leftArm: 'Left Arm',
  rightArm: 'Right Arm',
  leftHip: 'Left Hip',
  rightHip: 'Right Hip',
  leftKnee: 'Left Knee',
  rightKnee: 'Right Knee',
};

function OnboardingBodyMap({
  issues,
  onRegionPress,
}: {
  issues: BodyIssue[];
  onRegionPress: (region: BodyRegion) => void;
}) {
  const issueMap = new Map(issues.map((i) => [i.region, i]));

  const getRegionColor = (region: BodyRegion) => {
    const issue = issueMap.get(region);
    return issue ? SEVERITY_COLORS[issue.severity] : '#4B5563';
  };

  const getRegionOpacity = (region: BodyRegion) => {
    return issueMap.has(region) ? 0.8 : 0.4;
  };

  return (
    <Svg width="220" height="350" viewBox="0 0 200 320">
      {/* Head */}
      <SvgCircle
        cx="100"
        cy="30"
        r="25"
        fill={getRegionColor('head')}
        opacity={getRegionOpacity('head')}
        onPress={() => onRegionPress('head')}
      />

      {/* Neck */}
      <Path
        d="M90 55 L110 55 L108 75 L92 75 Z"
        fill={getRegionColor('neck')}
        opacity={getRegionOpacity('neck')}
        onPress={() => onRegionPress('neck')}
      />

      {/* Upper Back */}
      <Path
        d="M70 75 L130 75 L140 130 L60 130 Z"
        fill={getRegionColor('upperBack')}
        opacity={getRegionOpacity('upperBack')}
        onPress={() => onRegionPress('upperBack')}
      />

      {/* Lower Back */}
      <Path
        d="M60 130 L140 130 L135 190 L65 190 Z"
        fill={getRegionColor('lowerBack')}
        opacity={getRegionOpacity('lowerBack')}
        onPress={() => onRegionPress('lowerBack')}
      />

      {/* Shoulders */}
      <SvgCircle
        cx="55"
        cy="85"
        r="15"
        fill={getRegionColor('leftShoulder')}
        opacity={getRegionOpacity('leftShoulder')}
        onPress={() => onRegionPress('leftShoulder')}
      />
      <SvgCircle
        cx="145"
        cy="85"
        r="15"
        fill={getRegionColor('rightShoulder')}
        opacity={getRegionOpacity('rightShoulder')}
        onPress={() => onRegionPress('rightShoulder')}
      />

      {/* Arms */}
      <Path
        d="M40 90 L55 90 L50 160 L35 160 Z"
        fill={getRegionColor('leftArm')}
        opacity={getRegionOpacity('leftArm')}
        onPress={() => onRegionPress('leftArm')}
      />
      <Path
        d="M145 90 L160 90 L165 160 L150 160 Z"
        fill={getRegionColor('rightArm')}
        opacity={getRegionOpacity('rightArm')}
        onPress={() => onRegionPress('rightArm')}
      />

      {/* Hips */}
      <SvgCircle
        cx="75"
        cy="195"
        r="18"
        fill={getRegionColor('leftHip')}
        opacity={getRegionOpacity('leftHip')}
        onPress={() => onRegionPress('leftHip')}
      />
      <SvgCircle
        cx="125"
        cy="195"
        r="18"
        fill={getRegionColor('rightHip')}
        opacity={getRegionOpacity('rightHip')}
        onPress={() => onRegionPress('rightHip')}
      />

      {/* Upper Legs */}
      <Path d="M65 210 L85 210 L80 260 L60 260 Z" fill="#4B5563" opacity={0.3} />
      <Path d="M115 210 L135 210 L140 260 L120 260 Z" fill="#4B5563" opacity={0.3} />

      {/* Knees */}
      <SvgCircle
        cx="70"
        cy="265"
        r="12"
        fill={getRegionColor('leftKnee')}
        opacity={getRegionOpacity('leftKnee')}
        onPress={() => onRegionPress('leftKnee')}
      />
      <SvgCircle
        cx="130"
        cy="265"
        r="12"
        fill={getRegionColor('rightKnee')}
        opacity={getRegionOpacity('rightKnee')}
        onPress={() => onRegionPress('rightKnee')}
      />

      {/* Lower Legs */}
      <Path d="M60 275 L80 275 L75 310 L55 310 Z" fill="#4B5563" opacity={0.3} />
      <Path d="M120 275 L140 275 L145 310 L125 310 Z" fill="#4B5563" opacity={0.3} />
    </Svg>
  );
}

export default function BodyMapOnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { triggerHaptic } = useHaptics();
  const [issues, setIssues] = useState<BodyIssue[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<BodyRegion | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleRegionPress = useCallback(
    (region: BodyRegion) => {
      triggerHaptic('selection');
      setSelectedRegion(region);
      setSheetOpen(true);
    },
    [triggerHaptic]
  );

  const handleSeveritySelect = useCallback(
    (severity: PainSeverity) => {
      if (!selectedRegion) return;

      triggerHaptic('success');

      setIssues((prev) => {
        const filtered = prev.filter((i) => i.region !== selectedRegion);
        return [...filtered, { region: selectedRegion, severity }];
      });

      setSheetOpen(false);
    },
    [selectedRegion, triggerHaptic]
  );

  const handleRemoveIssue = useCallback(() => {
    if (!selectedRegion) return;

    triggerHaptic('light');
    setIssues((prev) => prev.filter((i) => i.region !== selectedRegion));
    setSheetOpen(false);
  }, [selectedRegion, triggerHaptic]);

  const handleContinue = useCallback(() => {
    triggerHaptic('success');
    router.push('/onboarding/first-session');
  }, [router, triggerHaptic]);

  const selectedIssue = selectedRegion
    ? issues.find((i) => i.region === selectedRegion)
    : null;

  return (
    <>
      <YStack
        flex={1}
        backgroundColor="$background"
        paddingHorizontal="$4"
        paddingTop={insets.top + 20}
        paddingBottom={insets.bottom + 20}
      >
        <YStack flex={1} gap="$4">
          {/* Progress indicator */}
          <XStack gap="$2" justifyContent="center">
            {[1, 2, 3, 4].map((step) => (
              <Circle
                key={step}
                size={8}
                backgroundColor={step <= 3 ? '$primary' : '$backgroundPress'}
              />
            ))}
          </XStack>

          <YStack gap="$2">
            <H2>Tap anywhere that needs attention</H2>
            <Paragraph color="$colorHover" fontSize="$3">
              Mark any areas with pain, stiffness, or discomfort. You can skip this if everything
              feels fine.
            </Paragraph>
          </YStack>

          {/* Body Map */}
          <YStack flex={1} alignItems="center" justifyContent="center">
            <OnboardingBodyMap issues={issues} onRegionPress={handleRegionPress} />
          </YStack>

          {/* Legend */}
          <XStack gap="$4" justifyContent="center" paddingVertical="$2">
            {(['mild', 'moderate', 'severe'] as PainSeverity[]).map((severity) => (
              <XStack key={severity} alignItems="center" gap="$2">
                <Circle size={12} backgroundColor={SEVERITY_COLORS[severity]} />
                <Text fontSize="$2" color="$colorHover" textTransform="capitalize">
                  {severity}
                </Text>
              </XStack>
            ))}
          </XStack>

          {/* Selected areas count */}
          {issues.length > 0 && (
            <Card backgroundColor="$backgroundHover" padded>
              <Text textAlign="center" color="$colorHover">
                {issues.length} area{issues.length !== 1 ? 's' : ''} marked
              </Text>
            </Card>
          )}
        </YStack>

        <Button
          size="$5"
          backgroundColor="$primary"
          color="white"
          onPress={handleContinue}
        >
          {issues.length > 0
            ? `Continue with ${issues.length} area${issues.length !== 1 ? 's' : ''} marked`
            : 'Continue - No Issues Today'}
        </Button>
      </YStack>

      {/* Severity Selection Sheet */}
      <Sheet
        modal
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        snapPoints={[45]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$4">
          <Sheet.Handle />
          <YStack gap="$4" marginTop="$4">
            <Text fontWeight="600" fontSize="$5">
              {selectedRegion ? REGION_LABELS[selectedRegion] : ''}
            </Text>

            <Text color="$colorHover">How severe is the issue?</Text>

            <YStack gap="$3">
              {(['mild', 'moderate', 'severe'] as PainSeverity[]).map((severity) => (
                <Button
                  key={severity}
                  size="$5"
                  backgroundColor={SEVERITY_COLORS[severity]}
                  color="white"
                  onPress={() => handleSeveritySelect(severity)}
                >
                  {severity === 'mild' && 'Mild - Slight discomfort'}
                  {severity === 'moderate' && 'Moderate - Noticeable pain'}
                  {severity === 'severe' && 'Severe - Significant pain'}
                </Button>
              ))}
            </YStack>

            {selectedIssue && (
              <Button variant="outlined" onPress={handleRemoveIssue}>
                Remove from Map
              </Button>
            )}

            <Button backgroundColor="transparent" color="$colorHover" onPress={() => setSheetOpen(false)}>
              Cancel
            </Button>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
