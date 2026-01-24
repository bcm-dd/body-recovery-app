/**
 * SetLogger component
 *
 * Visual representation of sets with completion tracking.
 * Shows completed sets as filled circles, active set highlighted,
 * and remaining sets as empty circles.
 */

import { styled, Stack, GetProps } from 'tamagui';
import { useCallback } from 'react';
import { Text } from '../../primitives/Text';
import { palette } from '../../theme/tokens';

/**
 * Set data structure
 */
export interface SetData {
  /** Set number (1-indexed) */
  setNumber: number;
  /** Target reps for this set */
  targetReps: number;
  /** Actual reps completed (if completed) */
  actualReps?: number;
  /** Weight used (if applicable) */
  weight?: number;
  /** Duration in seconds (for timed exercises) */
  duration?: number;
  /** Whether this set is completed */
  completed: boolean;
  /** Whether this set was skipped */
  skipped?: boolean;
  /** RPE rating (1-10) */
  rpe?: number;
}

/**
 * Container for set indicators
 */
const SetLoggerContainer = styled(Stack, {
  name: 'SetLoggerContainer',

  flexDirection: 'row',
  alignItems: 'center',
  gap: '$2',
});

/**
 * Individual set indicator
 */
const SetIndicator = styled(Stack, {
  name: 'SetIndicator',

  width: 32,
  height: 32,
  borderRadius: '$full',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,

  // Default state (upcoming)
  backgroundColor: 'transparent',
  borderColor: '$border',

  // Animation for state changes
  animation: 'quick',

  // Press interaction
  cursor: 'pointer',
  pressStyle: {
    scale: 0.95,
    opacity: 0.8,
  },

  variants: {
    /**
     * Set status variants
     */
    status: {
      upcoming: {
        backgroundColor: 'transparent',
        borderColor: '$border',
      },

      active: {
        backgroundColor: 'transparent',
        borderColor: '$primary',
        borderWidth: 3,
      },

      completed: {
        backgroundColor: '$success',
        borderColor: '$success',
      },

      skipped: {
        backgroundColor: '$surface',
        borderColor: '$textMuted',
        opacity: 0.5,
      },
    },

    /**
     * Size variants
     */
    size: {
      sm: {
        width: 24,
        height: 24,
      },

      md: {
        width: 32,
        height: 32,
      },

      lg: {
        width: 40,
        height: 40,
      },
    },

    /**
     * Pressable state
     */
    pressable: {
      true: {
        cursor: 'pointer',
      },
      false: {
        cursor: 'default',
        pressStyle: undefined,
      },
    },
  } as const,

  defaultVariants: {
    status: 'upcoming',
    size: 'md',
    pressable: true,
  },
});

/**
 * Text inside set indicator
 */
const SetNumber = styled(Text, {
  name: 'SetNumber',

  fontSize: '$3',
  fontWeight: '600',

  variants: {
    status: {
      upcoming: {
        color: '$textMuted',
      },
      active: {
        color: '$primary',
      },
      completed: {
        color: 'white',
      },
      skipped: {
        color: '$textMuted',
      },
    },

    size: {
      sm: {
        fontSize: '$2',
      },
      md: {
        fontSize: '$3',
      },
      lg: {
        fontSize: '$4',
      },
    },
  } as const,
});

/**
 * Check mark for completed sets
 */
const CheckMark = () => (
  <Text variant="caption" color="primary" style={{ color: 'white' }}>
    ✓
  </Text>
);

export type SetIndicatorProps = GetProps<typeof SetIndicator>;

export interface SetLoggerProps {
  /** Total number of sets */
  totalSets: number;
  /** Array of completed set data */
  completedSets: SetData[];
  /** Index of the currently active set (0-indexed) */
  activeSetIndex?: number;
  /** Called when a set indicator is tapped */
  onSetTap?: (setIndex: number) => void;
  /** Called when a set is long-pressed */
  onSetLongPress?: (setIndex: number) => void;
  /** Size variant for indicators */
  size?: 'sm' | 'md' | 'lg';
  /** Whether sets can be tapped */
  interactive?: boolean;
  /** Show set numbers inside indicators */
  showNumbers?: boolean;
}

/**
 * SetLogger component
 *
 * Displays a row of set indicators showing progress through an exercise.
 */
export function SetLogger({
  totalSets,
  completedSets,
  activeSetIndex = completedSets.length,
  onSetTap,
  onSetLongPress,
  size = 'md',
  interactive = true,
  showNumbers = false,
}: SetLoggerProps) {
  const handleSetPress = useCallback(
    (index: number) => {
      if (interactive && onSetTap) {
        onSetTap(index);
      }
    },
    [interactive, onSetTap]
  );

  const handleSetLongPress = useCallback(
    (index: number) => {
      if (interactive && onSetLongPress) {
        onSetLongPress(index);
      }
    },
    [interactive, onSetLongPress]
  );

  // Determine status for each set
  const getSetStatus = (index: number): 'upcoming' | 'active' | 'completed' | 'skipped' => {
    const setData = completedSets.find((s) => s.setNumber === index + 1);

    if (setData?.skipped) {
      return 'skipped';
    }

    if (setData?.completed) {
      return 'completed';
    }

    if (index === activeSetIndex) {
      return 'active';
    }

    return 'upcoming';
  };

  return (
    <SetLoggerContainer>
      {Array.from({ length: totalSets }, (_, index) => {
        const status = getSetStatus(index);

        return (
          <SetIndicator
            key={index}
            status={status}
            size={size}
            pressable={interactive}
            onPress={() => handleSetPress(index)}
            onLongPress={() => handleSetLongPress(index)}
            accessibilityLabel={`Set ${index + 1} of ${totalSets}, ${status}`}
            accessibilityRole="button"
            accessibilityState={{
              selected: status === 'active',
              checked: status === 'completed',
            }}
          >
            {status === 'completed' ? (
              <CheckMark />
            ) : showNumbers ? (
              <SetNumber status={status} size={size}>
                {index + 1}
              </SetNumber>
            ) : null}
          </SetIndicator>
        );
      })}
    </SetLoggerContainer>
  );
}

/**
 * Compact set progress text (e.g., "2/4 sets")
 */
export interface SetProgressTextProps {
  completedCount: number;
  totalSets: number;
}

export function SetProgressText({ completedCount, totalSets }: SetProgressTextProps) {
  return (
    <Text variant="caption" color="secondary">
      {completedCount}/{totalSets} sets
    </Text>
  );
}

// Attach sub-components
SetLogger.Indicator = SetIndicator;
SetLogger.ProgressText = SetProgressText;

export { SetIndicator };
