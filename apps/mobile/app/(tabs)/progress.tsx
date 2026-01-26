import { useState, useCallback } from 'react';
import { ScrollView, Dimensions } from 'react-native';
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
} from 'tamagui';
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Calendar,
  Clock,
  Check,
  X,
} from '@tamagui/lucide-icons';
import Svg, { Path, Line, Circle as SvgCircle, G, Text as SvgText } from 'react-native-svg';

import { useHaptics } from '@/hooks/useHaptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 180;
const CHART_PADDING = 40;

// Mock data for pain trend
const MOCK_PAIN_DATA = [
  { date: new Date(Date.now() - 28 * 86400000), value: 7.5 },
  { date: new Date(Date.now() - 21 * 86400000), value: 6.8 },
  { date: new Date(Date.now() - 14 * 86400000), value: 5.5 },
  { date: new Date(Date.now() - 7 * 86400000), value: 4.2 },
  { date: new Date(), value: 3.8 },
];

// Mock session history
interface Session {
  id: string;
  date: Date;
  title: string;
  duration: number;
  exercisesCompleted: number;
  exercisesTotal: number;
  status: 'completed' | 'partial' | 'skipped';
}

const MOCK_SESSIONS: Session[] = [
  {
    id: '1',
    date: new Date(),
    title: 'Lower Back & Hip Recovery',
    duration: 18,
    exercisesCompleted: 6,
    exercisesTotal: 6,
    status: 'completed',
  },
  {
    id: '2',
    date: new Date(Date.now() - 86400000),
    title: 'Upper Body Mobility',
    duration: 15,
    exercisesCompleted: 5,
    exercisesTotal: 6,
    status: 'partial',
  },
  {
    id: '3',
    date: new Date(Date.now() - 2 * 86400000),
    title: 'Rest Day',
    duration: 0,
    exercisesCompleted: 0,
    exercisesTotal: 0,
    status: 'skipped',
  },
  {
    id: '4',
    date: new Date(Date.now() - 3 * 86400000),
    title: 'Lower Back & Hip Recovery',
    duration: 20,
    exercisesCompleted: 6,
    exercisesTotal: 6,
    status: 'completed',
  },
  {
    id: '5',
    date: new Date(Date.now() - 4 * 86400000),
    title: 'Full Body Mobility',
    duration: 22,
    exercisesCompleted: 7,
    exercisesTotal: 7,
    status: 'completed',
  },
];

// Simple line chart component
function PainTrendChart({ data }: { data: typeof MOCK_PAIN_DATA }) {
  const minValue = Math.min(...data.map((d) => d.value));
  const maxValue = Math.max(...data.map((d) => d.value));
  const valueRange = maxValue - minValue || 1;

  const chartInnerWidth = CHART_WIDTH - CHART_PADDING * 2;
  const chartInnerHeight = CHART_HEIGHT - CHART_PADDING * 2;

  const points = data.map((d, i) => {
    const x = CHART_PADDING + (i / (data.length - 1)) * chartInnerWidth;
    const y = CHART_PADDING + (1 - (d.value - minValue) / valueRange) * chartInnerHeight;
    return { x, y, value: d.value, date: d.date };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Area fill path
  const areaPathD = `${pathD} L ${points[points.length - 1]?.x} ${CHART_HEIGHT - CHART_PADDING} L ${CHART_PADDING} ${CHART_HEIGHT - CHART_PADDING} Z`;

  return (
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = CHART_PADDING + ratio * chartInnerHeight;
        return (
          <Line
            key={ratio}
            x1={CHART_PADDING}
            y1={y}
            x2={CHART_WIDTH - CHART_PADDING}
            y2={y}
            stroke="#374151"
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        );
      })}

      {/* Area fill */}
      <Path d={areaPathD} fill="#3B82F6" opacity={0.1} />

      {/* Line */}
      <Path d={pathD} stroke="#3B82F6" strokeWidth={3} fill="none" strokeLinecap="round" />

      {/* Data points */}
      {points.map((p, i) => (
        <G key={i}>
          <SvgCircle cx={p.x} cy={p.y} r={6} fill="#0A0A0A" />
          <SvgCircle cx={p.x} cy={p.y} r={4} fill="#3B82F6" />
        </G>
      ))}

      {/* X-axis labels */}
      {points.map((p, i) => (
        <SvgText
          key={`label-${i}`}
          x={p.x}
          y={CHART_HEIGHT - 10}
          fontSize={10}
          fill="#9CA3AF"
          textAnchor="middle"
        >
          {i === 0
            ? '4w'
            : i === data.length - 1
            ? 'Now'
            : `${data.length - 1 - i}w`}
        </SvgText>
      ))}

      {/* Y-axis labels */}
      <SvgText x={10} y={CHART_PADDING + 4} fontSize={10} fill="#9CA3AF">
        {maxValue.toFixed(1)}
      </SvgText>
      <SvgText x={10} y={CHART_HEIGHT - CHART_PADDING} fontSize={10} fill="#9CA3AF">
        {minValue.toFixed(1)}
      </SvgText>
    </Svg>
  );
}

type TimeRange = '1w' | '1m' | '3m' | 'all';

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { triggerHaptic } = useHaptics();
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');

  const handleTimeRangeChange = useCallback(
    (range: TimeRange) => {
      triggerHaptic('selection');
      setTimeRange(range);
    },
    [triggerHaptic]
  );

  // Calculate stats
  const completedSessions = MOCK_SESSIONS.filter((s) => s.status === 'completed').length;
  const totalSessions = MOCK_SESSIONS.filter((s) => s.status !== 'skipped').length;
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  const painReduction =
    MOCK_PAIN_DATA.length >= 2
      ? Math.round(
          ((MOCK_PAIN_DATA[0]!.value - MOCK_PAIN_DATA[MOCK_PAIN_DATA.length - 1]!.value) /
            MOCK_PAIN_DATA[0]!.value) *
            100
        )
      : 0;

  const getSessionIcon = (status: Session['status']) => {
    switch (status) {
      case 'completed':
        return <Check size={16} color="white" />;
      case 'partial':
        return <Minus size={16} color="white" />;
      case 'skipped':
        return <X size={16} color="white" />;
    }
  };

  const getSessionColor = (status: Session['status']) => {
    switch (status) {
      case 'completed':
        return '#22C55E';
      case 'partial':
        return '#F59E0B';
      case 'skipped':
        return '#6B7280';
    }
  };

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
            Your Journey
          </Text>
          <H2>Progress</H2>
        </YStack>

        {/* Summary Stats */}
        <XStack gap="$3">
          <Card bordered padded flex={1}>
            <YStack alignItems="center" gap="$1">
              <XStack alignItems="center" gap="$1">
                {painReduction > 0 ? (
                  <TrendingDown size={20} color="#22C55E" />
                ) : painReduction < 0 ? (
                  <TrendingUp size={20} color="#EF4444" />
                ) : (
                  <Minus size={20} color="#6B7280" />
                )}
                <Text fontSize="$7" fontWeight="700" color={painReduction > 0 ? '$success' : '$color'}>
                  {Math.abs(painReduction)}%
                </Text>
              </XStack>
              <Text fontSize="$2" color="$colorHover" textAlign="center">
                Pain Reduction
              </Text>
            </YStack>
          </Card>

          <Card bordered padded flex={1}>
            <YStack alignItems="center" gap="$1">
              <Text fontSize="$7" fontWeight="700" color="$primary">
                {completionRate}%
              </Text>
              <Text fontSize="$2" color="$colorHover" textAlign="center">
                Completion Rate
              </Text>
            </YStack>
          </Card>

          <Card bordered padded flex={1}>
            <YStack alignItems="center" gap="$1">
              <Text fontSize="$7" fontWeight="700">
                {MOCK_SESSIONS.length}
              </Text>
              <Text fontSize="$2" color="$colorHover" textAlign="center">
                Sessions
              </Text>
            </YStack>
          </Card>
        </XStack>

        {/* Pain Trend Chart */}
        <Card bordered padded>
          <YStack gap="$4">
            <XStack justifyContent="space-between" alignItems="center">
              <H3>Pain Trend</H3>
              <XStack gap="$2">
                {(['1w', '1m', '3m', 'all'] as TimeRange[]).map((range) => (
                  <Button
                    key={range}
                    size="$2"
                    backgroundColor={timeRange === range ? '$primary' : 'transparent'}
                    color={timeRange === range ? 'white' : '$colorHover'}
                    onPress={() => handleTimeRangeChange(range)}
                  >
                    {range.toUpperCase()}
                  </Button>
                ))}
              </XStack>
            </XStack>

            <PainTrendChart data={MOCK_PAIN_DATA} />

            <XStack gap="$2" alignItems="center" justifyContent="center">
              <TrendingDown size={16} color="#22C55E" />
              <Text fontSize="$3" color="$colorHover">
                Lower back pain down {painReduction}% in 4 weeks
              </Text>
            </XStack>
          </YStack>
        </Card>

        {/* Session History */}
        <Card bordered padded>
          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <H3>Session History</H3>
              <Button size="$2" backgroundColor="transparent" color="$primary">
                View All
              </Button>
            </XStack>

            <Separator />

            <YStack gap="$2">
              {MOCK_SESSIONS.map((session) => (
                <XStack
                  key={session.id}
                  alignItems="center"
                  gap="$3"
                  padding="$3"
                  backgroundColor="$backgroundHover"
                  borderRadius="$2"
                >
                  <Circle size={32} backgroundColor={getSessionColor(session.status)}>
                    {getSessionIcon(session.status)}
                  </Circle>
                  <YStack flex={1}>
                    <Text fontWeight="600">{session.title}</Text>
                    <XStack gap="$3" marginTop="$1">
                      <XStack alignItems="center" gap="$1">
                        <Calendar size={12} color="$colorHover" />
                        <Text fontSize="$1" color="$colorHover">
                          {session.date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Text>
                      </XStack>
                      {session.duration > 0 && (
                        <XStack alignItems="center" gap="$1">
                          <Clock size={12} color="$colorHover" />
                          <Text fontSize="$1" color="$colorHover">
                            {session.duration} min
                          </Text>
                        </XStack>
                      )}
                    </XStack>
                  </YStack>
                  {session.exercisesTotal > 0 && (
                    <Text fontSize="$2" color="$colorHover">
                      {session.exercisesCompleted}/{session.exercisesTotal}
                    </Text>
                  )}
                </XStack>
              ))}
            </YStack>
          </YStack>
        </Card>

        {/* Encouragement Card */}
        <Card bordered padded backgroundColor="$backgroundHover">
          <YStack gap="$2" alignItems="center">
            <Text fontWeight="600" fontSize="$4">
              Keep It Up!
            </Text>
            <Text color="$colorHover" textAlign="center">
              You've been consistent for the past week. Consistency is key to recovery.
            </Text>
          </YStack>
        </Card>
      </YStack>
    </ScrollView>
  );
}
