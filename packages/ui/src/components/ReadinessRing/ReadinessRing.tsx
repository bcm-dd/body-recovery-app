/**
 * ReadinessRing component
 *
 * A circular progress indicator showing overall readiness based on
 * multiple factors: sleep, HRV, body status, and recovery load.
 *
 * Displays as a ring with the score in the center and can show
 * individual segments for each factor.
 */

import { useMemo } from 'react';
import { styled, Stack, YStack, GetProps } from 'tamagui';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Text, H3 } from '../../primitives/Text';
import { palette } from '../../theme/tokens';

/**
 * Readiness level categories
 */
export type ReadinessLevel = 'good' | 'moderate' | 'rest';

/**
 * Individual factor for readiness calculation
 */
export interface ReadinessFactor {
  /** Factor identifier */
  id: string;
  /** Display label */
  label: string;
  /** Value from 0-100 */
  value: number;
  /** Weight in overall calculation (0-1) */
  weight: number;
  /** Optional color override */
  color?: string;
}

/**
 * Default readiness factors
 */
export const DEFAULT_FACTORS: ReadinessFactor[] = [
  { id: 'sleep', label: 'Sleep', value: 0, weight: 0.3 },
  { id: 'hrv', label: 'HRV', value: 0, weight: 0.25 },
  { id: 'body', label: 'Body', value: 0, weight: 0.25 },
  { id: 'load', label: 'Load', value: 0, weight: 0.2 },
];

/**
 * Container for the ring
 */
const RingContainer = styled(Stack, {
  name: 'ReadinessRingContainer',

  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',

  variants: {
    size: {
      sm: {
        width: 80,
        height: 80,
      },
      md: {
        width: 120,
        height: 120,
      },
      lg: {
        width: 160,
        height: 160,
      },
      xl: {
        width: 200,
        height: 200,
      },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
});

/**
 * Center content container
 */
const CenterContent = styled(YStack, {
  name: 'ReadinessRingCenter',

  position: 'absolute',
  alignItems: 'center',
  justifyContent: 'center',
});

/**
 * Get color based on score
 */
function getScoreColor(score: number): string {
  if (score >= 70) return palette.green500;
  if (score >= 40) return palette.amber500;
  return palette.red500;
}

/**
 * Get readiness level from score
 */
function getReadinessLevel(score: number): ReadinessLevel {
  if (score >= 70) return 'good';
  if (score >= 40) return 'moderate';
  return 'rest';
}

/**
 * Get label for readiness level
 */
function getReadinessLabel(level: ReadinessLevel): string {
  switch (level) {
    case 'good':
      return 'Good';
    case 'moderate':
      return 'Moderate';
    case 'rest':
      return 'Rest';
  }
}

export type RingContainerProps = GetProps<typeof RingContainer>;

export interface ReadinessRingProps extends RingContainerProps {
  /** Overall score (0-100) */
  score?: number;
  /** Individual factors */
  factors?: ReadinessFactor[];
  /** Show factor breakdown */
  showFactors?: boolean;
  /** Animate the ring on mount */
  animated?: boolean;
  /** Ring thickness */
  strokeWidth?: number;
  /** Show label below score */
  showLabel?: boolean;
  /** Custom label text */
  label?: string;
}

/**
 * ReadinessRing component
 */
export function ReadinessRing({
  score: propScore,
  factors = DEFAULT_FACTORS,
  showFactors = false,
  animated = true,
  strokeWidth = 8,
  showLabel = true,
  label,
  size = 'md',
  ...containerProps
}: ReadinessRingProps) {
  // Calculate score from factors if not provided
  const score = useMemo(() => {
    if (propScore !== undefined) return propScore;

    const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
    const weightedSum = factors.reduce((sum, f) => sum + f.value * f.weight, 0);

    return Math.round(weightedSum / totalWeight);
  }, [propScore, factors]);

  // Get size dimensions
  const sizeMap = { sm: 80, md: 120, lg: 160, xl: 200 };
  const dimension = sizeMap[size as keyof typeof sizeMap] || 120;

  // SVG calculations
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score / 100;
  const strokeDashoffset = circumference * (1 - progress);

  // Colors
  const scoreColor = getScoreColor(score);
  const level = getReadinessLevel(score);
  const displayLabel = label || getReadinessLabel(level);

  // Font sizes based on ring size
  const scoreFontSize = size === 'sm' ? 20 : size === 'md' ? 28 : size === 'lg' ? 36 : 44;
  const labelFontSize = size === 'sm' ? 10 : size === 'md' ? 12 : 14;

  return (
    <RingContainer size={size} {...containerProps}>
      <Svg
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
      >
        <Defs>
          <LinearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={scoreColor} />
            <Stop offset="100%" stopColor={scoreColor} stopOpacity={0.7} />
          </LinearGradient>
        </Defs>

        {/* Background ring */}
        <Circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke={palette.gray700}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress ring */}
        <Circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${dimension / 2} ${dimension / 2})`}
        />
      </Svg>

      {/* Center content */}
      <CenterContent>
        <Text
          style={{ fontSize: scoreFontSize, fontWeight: '700', color: scoreColor }}
        >
          {score}
        </Text>
        {showLabel && (
          <Text
            style={{
              fontSize: labelFontSize,
              color: palette.gray400,
              marginTop: 2,
            }}
          >
            {displayLabel}
          </Text>
        )}
      </CenterContent>
    </RingContainer>
  );
}

/**
 * Factor breakdown list
 */
const FactorList = styled(YStack, {
  name: 'ReadinessFactorList',
  gap: '$2',
  paddingTop: '$3',
});

const FactorRow = styled(Stack, {
  name: 'ReadinessFactorRow',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const FactorBar = styled(Stack, {
  name: 'ReadinessFactorBar',
  height: 4,
  borderRadius: '$full',
  backgroundColor: '$surface',
  flex: 1,
  marginHorizontal: '$2',
  overflow: 'hidden',
});

const FactorProgress = styled(Stack, {
  name: 'ReadinessFactorProgress',
  height: '100%',
  borderRadius: '$full',
});

export interface ReadinessFactorsListProps {
  factors: ReadinessFactor[];
}

/**
 * Display individual factors as a list
 */
export function ReadinessFactorsList({ factors }: ReadinessFactorsListProps) {
  return (
    <FactorList>
      {factors.map((factor) => (
        <FactorRow key={factor.id}>
          <Text variant="caption" style={{ width: 50 }}>
            {factor.label}
          </Text>
          <FactorBar>
            <FactorProgress
              width={`${factor.value}%`}
              backgroundColor={factor.color || getScoreColor(factor.value)}
            />
          </FactorBar>
          <Text variant="caption" style={{ width: 30, textAlign: 'right' }}>
            {factor.value}
          </Text>
        </FactorRow>
      ))}
    </FactorList>
  );
}

// Attach sub-components
ReadinessRing.Container = RingContainer;
ReadinessRing.FactorsList = ReadinessFactorsList;

export { RingContainer, getScoreColor, getReadinessLevel, getReadinessLabel };
