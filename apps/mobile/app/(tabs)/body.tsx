import { useState, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  YStack,
  XStack,
  Text,
  Card,
  H2,
  H3,
  Button,
  Circle,
  Separator,
  Sheet,
} from 'tamagui';
import { Plus, ChevronRight, AlertCircle, CheckCircle } from '@tamagui/lucide-icons';
import Svg, { Path, Circle as SvgCircle, G } from 'react-native-svg';

import { useHaptics } from '@/hooks/useHaptics';

// Pain severity types and colors
type PainSeverity = 'mild' | 'moderate' | 'severe' | 'resolved';

const SEVERITY_COLORS: Record<PainSeverity, string> = {
  mild: '#FCD34D',
  moderate: '#F97316',
  severe: '#EF4444',
  resolved: '#22C55E',
};

const SEVERITY_LABELS: Record<PainSeverity, string> = {
  mild: 'Mild',
  moderate: 'Moderate',
  severe: 'Severe',
  resolved: 'Resolved',
};

// Body regions
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
  | 'rightKnee'
  | 'leftAnkle'
  | 'rightAnkle';

interface BodyIssue {
  id: string;
  region: BodyRegion;
  regionLabel: string;
  severity: PainSeverity;
  lastUpdated: Date;
  description?: string;
}

// Mock data for active issues
const MOCK_ISSUES: BodyIssue[] = [
  {
    id: '1',
    region: 'lowerBack',
    regionLabel: 'Lower Back',
    severity: 'moderate',
    lastUpdated: new Date(),
    description: 'Dull ache, especially in the morning',
  },
  {
    id: '2',
    region: 'rightHip',
    regionLabel: 'Right Hip',
    severity: 'mild',
    lastUpdated: new Date(Date.now() - 86400000),
    description: 'Stiffness after sitting',
  },
  {
    id: '3',
    region: 'neck',
    regionLabel: 'Neck',
    severity: 'mild',
    lastUpdated: new Date(Date.now() - 172800000),
    description: 'Tension on left side',
  },
];

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
  leftAnkle: 'Left Ankle',
  rightAnkle: 'Right Ankle',
};

// Simple body map SVG component
function BodyMapSvg({
  issues,
  onRegionPress,
}: {
  issues: BodyIssue[];
  onRegionPress: (region: BodyRegion) => void;
}) {
  const issueMap = new Map(issues.map((i) => [i.region, i]));

  const getRegionColor = (region: BodyRegion) => {
    const issue = issueMap.get(region);
    if (issue) {
      return SEVERITY_COLORS[issue.severity];
    }
    return '#4B5563';
  };

  // Simplified body outline
  return (
    <Svg width="200" height="320" viewBox="0 0 200 320">
      {/* Head */}
      <SvgCircle
        cx="100"
        cy="30"
        r="25"
        fill={getRegionColor('head')}
        opacity={0.6}
        onPress={() => onRegionPress('head')}
      />

      {/* Neck */}
      <Path
        d="M90 55 L110 55 L108 75 L92 75 Z"
        fill={getRegionColor('neck')}
        opacity={0.6}
        onPress={() => onRegionPress('neck')}
      />

      {/* Torso */}
      <G>
        {/* Upper Back/Chest */}
        <Path
          d="M70 75 L130 75 L140 130 L60 130 Z"
          fill={getRegionColor('upperBack')}
          opacity={0.6}
          onPress={() => onRegionPress('upperBack')}
        />

        {/* Lower Back/Core */}
        <Path
          d="M60 130 L140 130 L135 190 L65 190 Z"
          fill={getRegionColor('lowerBack')}
          opacity={0.6}
          onPress={() => onRegionPress('lowerBack')}
        />
      </G>

      {/* Shoulders */}
      <SvgCircle
        cx="55"
        cy="85"
        r="15"
        fill={getRegionColor('leftShoulder')}
        opacity={0.6}
        onPress={() => onRegionPress('leftShoulder')}
      />
      <SvgCircle
        cx="145"
        cy="85"
        r="15"
        fill={getRegionColor('rightShoulder')}
        opacity={0.6}
        onPress={() => onRegionPress('rightShoulder')}
      />

      {/* Arms */}
      <Path
        d="M40 90 L55 90 L50 160 L35 160 Z"
        fill={getRegionColor('leftArm')}
        opacity={0.6}
        onPress={() => onRegionPress('leftArm')}
      />
      <Path
        d="M145 90 L160 90 L165 160 L150 160 Z"
        fill={getRegionColor('rightArm')}
        opacity={0.6}
        onPress={() => onRegionPress('rightArm')}
      />

      {/* Hips */}
      <SvgCircle
        cx="75"
        cy="195"
        r="18"
        fill={getRegionColor('leftHip')}
        opacity={0.6}
        onPress={() => onRegionPress('leftHip')}
      />
      <SvgCircle
        cx="125"
        cy="195"
        r="18"
        fill={getRegionColor('rightHip')}
        opacity={0.6}
        onPress={() => onRegionPress('rightHip')}
      />

      {/* Upper Legs */}
      <Path
        d="M65 210 L85 210 L80 260 L60 260 Z"
        fill="#4B5563"
        opacity={0.4}
      />
      <Path
        d="M115 210 L135 210 L140 260 L120 260 Z"
        fill="#4B5563"
        opacity={0.4}
      />

      {/* Knees */}
      <SvgCircle
        cx="70"
        cy="265"
        r="12"
        fill={getRegionColor('leftKnee')}
        opacity={0.6}
        onPress={() => onRegionPress('leftKnee')}
      />
      <SvgCircle
        cx="130"
        cy="265"
        r="12"
        fill={getRegionColor('rightKnee')}
        opacity={0.6}
        onPress={() => onRegionPress('rightKnee')}
      />

      {/* Lower Legs */}
      <Path
        d="M60 275 L80 275 L75 310 L55 310 Z"
        fill="#4B5563"
        opacity={0.4}
      />
      <Path
        d="M120 275 L140 275 L145 310 L125 310 Z"
        fill="#4B5563"
        opacity={0.4}
      />
    </Svg>
  );
}

export default function BodyScreen() {
  const insets = useSafeAreaInsets();
  const { triggerHaptic } = useHaptics();
  const [issues, setIssues] = useState<BodyIssue[]>(MOCK_ISSUES);
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

  const handleIssuePress = useCallback(
    (issue: BodyIssue) => {
      triggerHaptic('selection');
      setSelectedRegion(issue.region);
      setSheetOpen(true);
    },
    [triggerHaptic]
  );

  const handleSeveritySelect = useCallback(
    (severity: PainSeverity) => {
      if (!selectedRegion) return;

      triggerHaptic('success');

      setIssues((prev) => {
        const existingIndex = prev.findIndex((i) => i.region === selectedRegion);

        if (severity === 'resolved' && existingIndex !== -1) {
          // Remove the issue if resolved
          return prev.filter((i) => i.region !== selectedRegion);
        }

        if (existingIndex !== -1) {
          // Update existing issue
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            severity,
            lastUpdated: new Date(),
          };
          return updated;
        }

        // Add new issue
        return [
          ...prev,
          {
            id: Date.now().toString(),
            region: selectedRegion,
            regionLabel: REGION_LABELS[selectedRegion],
            severity,
            lastUpdated: new Date(),
          },
        ];
      });

      setSheetOpen(false);
    },
    [selectedRegion, triggerHaptic]
  );

  const activeIssues = issues.filter((i) => i.severity !== 'resolved');

  return (
    <>
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
              Body Status
            </Text>
            <H2>Body</H2>
          </YStack>

          {/* Body Map Card */}
          <Card bordered padded alignItems="center">
            <YStack alignItems="center" gap="$4">
              <Text color="$colorHover" fontSize="$3">
                Tap any area to log or update
              </Text>
              <BodyMapSvg issues={issues} onRegionPress={handleRegionPress} />
              <XStack gap="$4" flexWrap="wrap" justifyContent="center">
                {(['mild', 'moderate', 'severe'] as PainSeverity[]).map((severity) => (
                  <XStack key={severity} alignItems="center" gap="$2">
                    <Circle size={12} backgroundColor={SEVERITY_COLORS[severity]} />
                    <Text fontSize="$2" color="$colorHover">
                      {SEVERITY_LABELS[severity]}
                    </Text>
                  </XStack>
                ))}
              </XStack>
            </YStack>
          </Card>

          {/* Active Issues List */}
          <Card bordered padded>
            <YStack gap="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <H3>Active Issues</H3>
                <Text color="$colorHover" fontSize="$2">
                  {activeIssues.length} area{activeIssues.length !== 1 ? 's' : ''}
                </Text>
              </XStack>

              <Separator />

              {activeIssues.length === 0 ? (
                <YStack alignItems="center" padding="$4" gap="$2">
                  <CheckCircle size={40} color="$success" />
                  <Text color="$colorHover" textAlign="center">
                    No active issues. Your body is feeling good!
                  </Text>
                </YStack>
              ) : (
                <YStack gap="$2">
                  {activeIssues.map((issue) => (
                    <XStack
                      key={issue.id}
                      alignItems="center"
                      gap="$3"
                      padding="$3"
                      backgroundColor="$backgroundHover"
                      borderRadius="$2"
                      onPress={() => handleIssuePress(issue)}
                      pressStyle={{ opacity: 0.7 }}
                    >
                      <Circle size={12} backgroundColor={SEVERITY_COLORS[issue.severity]} />
                      <YStack flex={1}>
                        <Text fontWeight="600">{issue.regionLabel}</Text>
                        {issue.description && (
                          <Text fontSize="$2" color="$colorHover">
                            {issue.description}
                          </Text>
                        )}
                        <Text fontSize="$1" color="$colorHover" marginTop="$1">
                          Updated{' '}
                          {issue.lastUpdated.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Text>
                      </YStack>
                      <XStack alignItems="center" gap="$1">
                        <Text
                          fontSize="$2"
                          color={SEVERITY_COLORS[issue.severity]}
                          fontWeight="600"
                        >
                          {SEVERITY_LABELS[issue.severity]}
                        </Text>
                        <ChevronRight size={16} color="$colorHover" />
                      </XStack>
                    </XStack>
                  ))}
                </YStack>
              )}
            </YStack>
          </Card>

          {/* Tip Card */}
          <Card bordered padded backgroundColor="$backgroundHover">
            <XStack gap="$3" alignItems="flex-start">
              <AlertCircle size={20} color="$primary" />
              <YStack flex={1} gap="$1">
                <Text fontWeight="600" fontSize="$3">
                  Pro Tip
                </Text>
                <Text fontSize="$2" color="$colorHover">
                  Update your body map daily for the most personalized recovery sessions. Morning
                  check-ins take less than a minute.
                </Text>
              </YStack>
            </XStack>
          </Card>
        </YStack>
      </ScrollView>

      {/* Region Detail Sheet */}
      <Sheet
        modal
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        snapPoints={[50]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$4">
          <Sheet.Handle />
          <YStack gap="$4" marginTop="$4">
            <H3>{selectedRegion ? REGION_LABELS[selectedRegion] : 'Select Region'}</H3>

            <Text color="$colorHover">How does this area feel today?</Text>

            <YStack gap="$3">
              {(['mild', 'moderate', 'severe', 'resolved'] as PainSeverity[]).map((severity) => (
                <Button
                  key={severity}
                  size="$5"
                  backgroundColor={
                    severity === 'resolved' ? '$backgroundHover' : SEVERITY_COLORS[severity]
                  }
                  color={severity === 'resolved' ? '$color' : 'white'}
                  onPress={() => handleSeveritySelect(severity)}
                >
                  {severity === 'resolved' ? 'Resolved / No Pain' : SEVERITY_LABELS[severity]}
                </Button>
              ))}
            </YStack>

            <Button variant="outlined" onPress={() => setSheetOpen(false)}>
              Cancel
            </Button>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
