/**
 * ChartCard component
 *
 * A card container for displaying charts and data visualizations.
 * Includes header, optional time period selector, and chart area.
 */

import { styled, Stack, XStack, YStack, GetProps } from 'tamagui';
import { useState, useCallback, ReactNode } from 'react';
import { Text, H5 } from '../../primitives/Text';
import { Card, CardHeader, CardBody } from '../../primitives/Card';
import { Button } from '../../primitives/Button';
import { palette } from '../../theme/tokens';

/**
 * Time period options for chart data
 */
export type TimePeriod = '7d' | '14d' | '30d' | '90d' | 'all';

/**
 * Period selector labels
 */
const PERIOD_LABELS: Record<TimePeriod, string> = {
  '7d': '7D',
  '14d': '2W',
  '30d': '1M',
  '90d': '3M',
  'all': 'All',
};

/**
 * Chart card frame
 */
const ChartCardFrame = styled(Card, {
  name: 'ChartCard',

  padding: '$4',

  variants: {
    fullWidth: {
      true: {
        width: '100%',
      },
    },
  } as const,
});

/**
 * Chart area container
 */
const ChartArea = styled(Stack, {
  name: 'ChartArea',

  width: '100%',
  minHeight: 200,
  alignItems: 'center',
  justifyContent: 'center',

  variants: {
    height: {
      sm: {
        minHeight: 150,
      },
      md: {
        minHeight: 200,
      },
      lg: {
        minHeight: 280,
      },
    },
  } as const,
});

/**
 * Period selector container
 */
const PeriodSelector = styled(XStack, {
  name: 'ChartPeriodSelector',

  backgroundColor: '$surface',
  borderRadius: '$2',
  padding: '$1',
  gap: '$1',
});

/**
 * Period button
 */
const PeriodButton = styled(Stack, {
  name: 'ChartPeriodButton',

  paddingHorizontal: '$2',
  paddingVertical: '$1',
  borderRadius: '$1',
  cursor: 'pointer',

  pressStyle: {
    opacity: 0.8,
  },

  variants: {
    selected: {
      true: {
        backgroundColor: '$primary',
      },
      false: {
        backgroundColor: 'transparent',
      },
    },
  } as const,
});

/**
 * Summary stat display
 */
const StatContainer = styled(YStack, {
  name: 'ChartStat',

  alignItems: 'center',
  paddingHorizontal: '$3',
});

/**
 * Summary row for multiple stats
 */
const SummaryRow = styled(XStack, {
  name: 'ChartSummaryRow',

  justifyContent: 'space-around',
  paddingTop: '$3',
  borderTopWidth: 1,
  borderTopColor: '$border',
  marginTop: '$3',
});

export type ChartCardFrameProps = GetProps<typeof ChartCardFrame>;

export interface ChartStat {
  /** Stat label */
  label: string;
  /** Stat value */
  value: string | number;
  /** Change indicator (+/- percentage) */
  change?: number;
  /** Unit for the value */
  unit?: string;
}

export interface ChartCardProps extends ChartCardFrameProps {
  /** Card title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Show period selector */
  showPeriodSelector?: boolean;
  /** Available periods */
  periods?: TimePeriod[];
  /** Currently selected period */
  selectedPeriod?: TimePeriod;
  /** Callback when period changes */
  onPeriodChange?: (period: TimePeriod) => void;
  /** Chart content */
  children?: ReactNode;
  /** Summary stats to display below chart */
  stats?: ChartStat[];
  /** Chart area height */
  chartHeight?: 'sm' | 'md' | 'lg';
  /** Right header action */
  headerAction?: ReactNode;
  /** Empty state content */
  emptyState?: ReactNode;
  /** Loading state */
  loading?: boolean;
}

/**
 * ChartCard component
 */
export function ChartCard({
  title,
  subtitle,
  showPeriodSelector = true,
  periods = ['7d', '14d', '30d'],
  selectedPeriod: controlledPeriod,
  onPeriodChange,
  children,
  stats,
  chartHeight = 'md',
  headerAction,
  emptyState,
  loading = false,
  ...cardProps
}: ChartCardProps) {
  // Internal period state (uncontrolled mode)
  const [internalPeriod, setInternalPeriod] = useState<TimePeriod>('7d');

  // Use controlled or uncontrolled period
  const selectedPeriod = controlledPeriod ?? internalPeriod;

  // Handle period change
  const handlePeriodChange = useCallback(
    (period: TimePeriod) => {
      if (onPeriodChange) {
        onPeriodChange(period);
      } else {
        setInternalPeriod(period);
      }
    },
    [onPeriodChange]
  );

  return (
    <ChartCardFrame {...cardProps}>
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="flex-start" marginBottom="$3">
        <YStack flex={1}>
          <H5>{title}</H5>
          {subtitle && (
            <Text variant="caption" color="secondary">
              {subtitle}
            </Text>
          )}
        </YStack>

        {showPeriodSelector && (
          <PeriodSelector>
            {periods.map((period) => (
              <PeriodButton
                key={period}
                selected={selectedPeriod === period}
                onPress={() => handlePeriodChange(period)}
              >
                <Text
                  variant="captionSmall"
                  color={selectedPeriod === period ? 'primary' : 'secondary'}
                  style={{
                    color: selectedPeriod === period ? 'white' : palette.gray400,
                  }}
                >
                  {PERIOD_LABELS[period]}
                </Text>
              </PeriodButton>
            ))}
          </PeriodSelector>
        )}

        {headerAction && !showPeriodSelector && headerAction}
      </XStack>

      {/* Chart area */}
      <ChartArea height={chartHeight}>
        {loading ? (
          <Text variant="caption" color="muted">
            Loading...
          </Text>
        ) : children ? (
          children
        ) : emptyState ? (
          emptyState
        ) : (
          <Text variant="caption" color="muted">
            No data available
          </Text>
        )}
      </ChartArea>

      {/* Summary stats */}
      {stats && stats.length > 0 && (
        <SummaryRow>
          {stats.map((stat, index) => (
            <ChartStatDisplay key={index} {...stat} />
          ))}
        </SummaryRow>
      )}
    </ChartCardFrame>
  );
}

/**
 * Individual stat display
 */
function ChartStatDisplay({ label, value, change, unit }: ChartStat) {
  const changeColor = change === undefined ? undefined : change >= 0 ? palette.green500 : palette.red500;
  const changePrefix = change === undefined ? '' : change >= 0 ? '+' : '';

  return (
    <StatContainer>
      <Text variant="captionSmall" color="muted">
        {label}
      </Text>
      <XStack alignItems="baseline" gap="$1">
        <Text variant="h5" weight="bold">
          {value}
        </Text>
        {unit && (
          <Text variant="caption" color="muted">
            {unit}
          </Text>
        )}
      </XStack>
      {change !== undefined && (
        <Text variant="captionSmall" style={{ color: changeColor }}>
          {changePrefix}{change}%
        </Text>
      )}
    </StatContainer>
  );
}

/**
 * Simple bar for basic chart visualizations
 */
const ChartBar = styled(Stack, {
  name: 'ChartBar',

  backgroundColor: '$primary',
  borderRadius: '$1',
  minWidth: 8,

  variants: {
    variant: {
      primary: {
        backgroundColor: '$primary',
      },
      success: {
        backgroundColor: '$success',
      },
      warning: {
        backgroundColor: '$warning',
      },
      error: {
        backgroundColor: '$error',
      },
    },
  } as const,
});

/**
 * Simple line for trend indication
 */
const TrendLine = styled(Stack, {
  name: 'TrendLine',

  height: 2,
  borderRadius: '$full',

  variants: {
    trend: {
      up: {
        backgroundColor: '$success',
      },
      down: {
        backgroundColor: '$error',
      },
      stable: {
        backgroundColor: '$textMuted',
      },
    },
  } as const,
});

// Attach sub-components
ChartCard.Frame = ChartCardFrame;
ChartCard.Area = ChartArea;
ChartCard.PeriodSelector = PeriodSelector;
ChartCard.SummaryRow = SummaryRow;
ChartCard.Stat = ChartStatDisplay;
ChartCard.Bar = ChartBar;
ChartCard.TrendLine = TrendLine;

export {
  ChartCardFrame,
  ChartArea,
  PeriodSelector,
  SummaryRow,
  ChartBar,
  TrendLine,
  PERIOD_LABELS,
};
